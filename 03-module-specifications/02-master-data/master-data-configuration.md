---
module: 02-master-data
specification: Master Data Configuration
version: 1.0
phase: Phase 1
source_document: PRD_DFMS_v1.0.md
source_sections: 6.3.1-6.3.4
last_updated: 2026-04-09
related_stories: US-053, US-057, US-061, US-047
---

# Master Data Configuration Specification

## Overview

Master Data Configuration provides centralized management of core business entities that are referenced across all operational workflows in the DFMS platform. This specification covers entity registration, bulk data management, CRUD operations, and referential integrity controls for vehicles, helpers, vendors, routes, and other master entities. **Drivers** are a **`Driver`** aggregate outside master data—**[User + Driver on create](../01-foundation/driver-user-profiles.md)**; invitation is separate; **`driver_id`** is the operational FK.

Master data serves as the foundation for consistent, traceable operations without manual data errors.

---

## 1. Master Data Architecture

### 1.1 Master Entity Categories

**Human Resources**:
- Drivers (**`Driver`** entity — see foundation spec; not `master_data`)
- Helpers  
- Driver Supervisors

**Fleet & Assets**:
- Vehicles
- GPS Trackers

**Business Partners**:
- Vendors (transport contractors)
- Suppliers
- Dealers

**Operational Configuration**:
- Routes
- POIs (covered in poi-management.md)
- Products (covered in product-inventory-management.md)
- QC Checklists

### 1.2 Common Master Data Pattern

All master entities follow a common structure:
```typescript
MasterEntity {
  entity_id: UUID
  entity_type: string
  tenant_id: UUID
  status: enum ['Active', 'Inactive']
  created_by: UUID
  created_at: DateTime
  updated_by: UUID
  updated_at: DateTime
}
```

---

## 2. Vehicle Master Data

### 2.1 Vehicle Entity Model

```typescript
Vehicle {
  vehicle_id: UUID
  
  // Identification
  registration_number: string   // Unique, format: "Dhaka Metro-GA-11-1234"
  chassis_number: string         // VIN, unique
  
  // Classification
  vehicle_type: enum [
    'PickupVan', 'OpenTruck', 'CoveredTruck',
    'Nosimon', 'Auto', 'TomTom', 'Tractor',
    'Trailer', 'Tanker', 'RefrigeratedTruck'
  ]
  body_type: enum ['OpenBody', 'ClosedBody', 'Container', 'Flatbed', 'Tanker', 'Refrigerated']
  fuel_type: enum ['Diesel', 'Petrol', 'CNG', 'Electric', 'Hybrid']
  
  // Capacity
  number_of_wheels: Integer      // 4, 6, 10, 12, etc.
  max_load_capacity_mt: Decimal  // Metric tons
  allowed_product_category: enum ['FG', 'RM', 'Both']
  
  // Specifications
  model: string
  manufacturer: string
  year_of_manufacture: Integer
  
  // Mileage
  initial_odometer_km: Decimal
  current_odometer_km: Decimal
  total_distance_travelled_km: Decimal (computed)
  average_mileage_kmpl: Decimal
  
  // Ownership
  ownership: enum ['Own', 'Vendor']
  vendor_id: UUID (if ownership='Vendor')
  
  // Assignment
  assigned_poi_id: UUID          // Home base POI
  assigned_driver_id: UUID (nullable)  // FK to Driver (see driver-user-profiles.md)
  gps_tracker_id: string (nullable)
  
  // Documents
  documents: {
    fitness_certificate: { file_url, expiry_date }
    tax_token: { file_url, expiry_date }
    insurance: { file_url, expiry_date }
    route_permit: { file_url, expiry_date }
    registration_copy: { file_url }
  }
  
  // Purchase (Optional)
  purchase_date: Date (nullable)
  purchase_price: Decimal (nullable)
  
  // Status
  operational_status: enum ['Available', 'InTrip', 'Loading', 'Unloading', 'Idle', 'Maintenance', 'Breakdown']
  status: enum ['Active', 'Inactive']
  
  // Metadata
  tenant_id: UUID
  created_by: UUID
  created_at: DateTime
  updated_at: DateTime
}
```

### 2.2 Vehicle Capacity Calculation

**Capacity Derived from Wheels**:
```typescript
function estimateCapacityFromWheels(wheels: number): Decimal {
    // Rule of thumb for Bangladesh market
    switch(wheels) {
        case 4: return 1.0;   // Pickup/Small truck (1 MT)
        case 6: return 3.0;   // Medium truck (3 MT)
        case 10: return 10.0; // Large truck (10 MT)
        case 12: return 15.0; // Trailer (15 MT)
        default: return wheels * 1.0; // Fallback estimation
    }
}
```

**Load Validation**:
```typescript
function validateLoad(vehicle: Vehicle, loadedQuantity: Decimal): boolean {
    if (loadedQuantity > vehicle.max_load_capacity_mt) {
        throw new Error(
            `Load exceeds vehicle capacity. ` +
            `Max: ${vehicle.max_load_capacity_mt} MT, Loaded: ${loadedQuantity} MT`
        );
    }
    
    if (loadedQuantity > vehicle.max_load_capacity_mt * 1.1) {
        // Allow 10% overload with warning
        logWarning('Vehicle overloaded beyond recommended limit');
    }
    
    return true;
}
```

### 2.3 Vehicle Availability Tracking

**Operational Status State Machine**:
```
Available → (TO Assigned) → InTrip → (Arrived Source) → Loading →
(Loading Complete) → InTrip → (Arrived Dest) → Unloading →
(Unloading Complete) → Available

                    ↓ (Breakdown/Maintenance)
                 Maintenance → (Repaired) → Available
```

**Availability Query**:
```typescript
function getAvailableVehicles(
    poi_id: UUID,
    required_capacity_mt: Decimal,
    product_category: string
): Vehicle[] {
    return db.query(`
        SELECT * FROM vehicles
        WHERE assigned_poi_id = :poi_id
          AND operational_status = 'Available'
          AND max_load_capacity_mt >= :required_capacity_mt
          AND (allowed_product_category = :product_category OR allowed_product_category = 'Both')
          AND status = 'Active'
          AND ownership = 'Own'
        ORDER BY max_load_capacity_mt ASC
    `);
}
```

---

## 3. Drivers (User & Role)

Drivers are **not** in `apps.master_data`. The **`Driver`** aggregate (license, compliance, fleet state) lives in the driver/fleet application layer; **`user_id`** is set when the **`User`** row is created alongside **`Driver`** (Driver role, Operations). **`driver_id`** is the stable FK for trips and vehicles. Canonical specification: **[Driver domain](../01-foundation/driver-user-profiles.md)**.

### 3.1 References in This Document

Use **`driver_id`** consistently for assignments and reporting. **`user_id`** on `Driver` is set when **`User`** is created with the driver (same transaction).

### 3.2 Driver–Vehicle Assignment

**Assignment Rules** (conceptual; use **`driver_id`**):

```typescript
function assignDriverToVehicle(
    driver_id: UUID,
    vehicle_id: UUID
): void {
    const driver = getDriver(driver_id);
    const vehicle = getVehicle(vehicle_id);
    
    if (driver.current_state !== 'Available') {
        throw new Error('Driver not available for assignment');
    }
    
    if (vehicle.operational_status !== 'Available') {
        throw new Error('Vehicle not available for assignment');
    }
    
    if (driver.license_expiry_date < NOW()) {
        throw new Error('Driver license expired');
    }
    
    if (vehicle.ownership === 'Vendor' && driver.driver_type !== 'Vendor') {
        throw new Error('Own driver cannot be assigned to vendor vehicle');
    }
    
    await updateDriver(driver_id, {
        current_state: 'Assigned'
    });
    
    await updateVehicle(vehicle_id, {
        assigned_driver_id: driver_id,
        operational_status: 'InTrip'
    });
}
```

### 3.3 Driver Performance Tracking

**Performance Metrics** (aggregate by **`driver_id`**):

```typescript
DriverPerformance {
  driver_id: UUID
  
  total_trips: Integer
  completed_trips: Integer
  cancelled_trips: Integer
  completion_rate: Decimal
  
  on_time_arrivals: Integer
  delayed_arrivals: Integer
  avg_delay_minutes: Decimal
  
  incidents_count: Integer
  accidents_count: Integer
  safety_violations: Integer
  
  avg_customer_rating: Decimal
  avg_supervisor_rating: Decimal
  
  last_calculated_at: DateTime
}
```

---

## 4. Helper Master Data

### 4.1 Helper Entity Model

```typescript
Helper {
  helper_id: UUID
  
  // Personal Information
  helper_name: string
  national_id: string (unique)
  contact_number: string
  
  // Employment
  employee_id: string (nullable)
  helper_type: enum ['Own', 'Vendor', 'Temporary']
  vendor_id: UUID (nullable)
  
  // References
  references: [
    { name, contact, relationship }
  ]
  
  // Assignment
  assigned_poi_id: UUID (nullable)
  current_trip_id: UUID (nullable)
  
  // Status
  availability_status: enum ['Available', 'OnTrip', 'Absent']
  status: enum ['Active', 'Inactive']
  
  // Metadata
  tenant_id: UUID
  created_at: DateTime
}
```

### 4.2 Helper Assignment

**Trip-Level Assignment**:
```typescript
function assignHelperToTrip(
    trip_id: UUID,
    helper_id: UUID
): void {
    const helper = getHelper(helper_id);
    
    if (helper.availability_status !== 'Available') {
        throw new Error('Helper not available');
    }
    
    await updateTrip(trip_id, { helper_id });
    await updateHelper(helper_id, {
        current_trip_id: trip_id,
        availability_status: 'OnTrip'
    });
}
```

---

## 5. Vendor Master Data

### 5.1 Vendor Entity Model

```typescript
Vendor {
  vendor_id: UUID
  
  // Business Information
  vendor_name: string
  vendor_code: string (unique per tenant)
  vendor_type: enum ['Contractual', 'Non-Contractual']
  business_type: enum ['SoleProprietorship', 'Partnership', 'Company']
  
  // Contact
  contact_person: string
  contact_phone: string
  contact_email: string
  address: string
  
  // Legal
  trade_license_number: string
  trade_license_expiry: Date
  tin_number: string
  
  // Banking
  bank_name: string (nullable)
  account_number: string (nullable)
  account_name: string (nullable)
  
  // Fleet Info
  total_vehicles: Integer
  vehicle_types: string[] (array)
  
  // Performance
  quality_rating: Decimal (0-5)
  delivery_rating: Decimal (0-5)
  consecutive_passes: Integer
  total_trips_completed: Integer
  
  // Contract (for Contractual vendors)
  contract_start_date: Date (nullable)
  contract_end_date: Date (nullable)
  contract_document_url: string (nullable)
  rate_per_km: Decimal (nullable)
  
  // Verification
  verification_status: enum ['Pending', 'Verified', 'Rejected']
  verified_by: UUID (nullable)
  verified_at: DateTime (nullable)
  
  // Status
  blacklist_status: boolean
  blacklist_reason: string (nullable)
  status: enum ['Active', 'Inactive', 'Suspended']
  
  // Metadata
  tenant_id: UUID
  created_at: DateTime
}
```

### 5.2 Vendor Verification Workflow

**Verification Process**:
```
1. Vendor submits registration
2. Admin reviews documents (license, TIN, bank)
3. Admin verifies contact information (phone/email)
4. Admin checks references
5. Admin approves or rejects
6. If approved: vendor_status = 'Active', verification_status = 'Verified'
7. Welcome email sent with portal access
```

---

## 6. Bulk Data Management

### 6.1 Bulk Upload via CSV

**Upload Process**:
```
1. Admin downloads CSV template
2. Admin fills data (Excel/Google Sheets)
3. Admin uploads CSV file
4. System validates all rows
5. If validation passes: Import all
6. If validation fails: Show errors, allow correction
7. Success: Audit log entry with import summary
```

**Validation Rules**:
```typescript
async function validateBulkUpload(
    entityType: string,
    csvData: Array<Record<string, any>>
): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    
    for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i];
        
        // Check required fields
        for (const field of getRequiredFields(entityType)) {
            if (!row[field]) {
                errors.push({
                    row: i + 2,  // +2 for header and 0-index
                    field,
                    error: 'Required field missing'
                });
            }
        }
        
        // Check unique fields
        const uniqueFields = getUniqueFields(entityType);
        for (const field of uniqueFields) {
            const duplicate = await checkDuplicate(entityType, field, row[field]);
            if (duplicate) {
                errors.push({
                    row: i + 2,
                    field,
                    error: `Duplicate value: ${row[field]}`
                });
            }
        }
        
        // Data type validation
        // Format validation
        // Business rule validation
    }
    
    return {
        valid: errors.length === 0,
        errors,
        rows_validated: csvData.length
    };
}
```

### 6.2 Inline Edit/Delete

**Inline Editing**:
- Click cell to edit
- Auto-save on blur or Enter
- Validation on save
- Optimistic UI update
- Server validation
- Rollback on error

**Soft Delete**:
- Delete button → Confirmation dialog
- Set status = 'Inactive'
- Preserve historical data
- Prevent hard delete if referenced

---

## 7. Referential Integrity

### 7.1 Dependency Checking

**Before Delete/Deactivate**:
```typescript
async function checkMasterDataDependencies(
    entityType: string,
    entityId: UUID
): Promise<Dependencies> {
    const deps = {
        active_requisitions: 0,
        active_trips: 0,
        active_assignments: 0,
        historical_records: 0,
        can_delete: false,
        can_deactivate: true
    };
    
    switch(entityType) {
        case 'Vehicle':
            deps.active_trips = await countActiveTrips({ vehicle_id: entityId });
            deps.historical_records = await countCompletedTrips({ vehicle_id: entityId });
            deps.can_deactivate = deps.active_trips === 0;
            break;
            
        case 'Driver':
            deps.active_trips = await countActiveTrips({ driver_id: entityId });
            deps.active_assignments = await countVehicleAssignments({ driver_id: entityId });
            deps.can_deactivate = deps.active_trips === 0;
            break;
            
        case 'Vendor':
            deps.active_trips = await countActiveTrips({ vendor_id: entityId });
            deps.active_requisitions = await countPendingBids({ vendor_id: entityId });
            deps.can_deactivate = deps.active_trips === 0 && deps.active_requisitions === 0;
            break;
    }
    
    // Never allow hard delete if historical records exist
    deps.can_delete = deps.historical_records === 0;
    
    return deps;
}
```

### 7.2 Cascade Rules

**Status Changes**:
```
Vehicle Deactivated:
  → Remove from available vehicle list
  → Cancel pending assignments
  → Continue active trips (complete first)

Driver user deactivated / profile inactive:
  → Set driver state appropriately; remove from assignment pool
  → Continue active trips until completion

Vendor Deactivated:
  → Cancel pending bids
  → Continue active trips with vendor vehicles
  → Block new TO assignments
```

---

## 8. Data Quality & Audit

### 8.1 Data Quality Rules

**Unique Constraints**:
- Vehicle: registration_number, chassis_number (per tenant)
- Driver profile: license_number, national_id (per tenant; see driver-user-profiles)
- Vendor: vendor_code (per tenant)
- Helper: national_id (per tenant)

**Mandatory Fields**:
- Vehicle: registration_number, vehicle_type, max_load_capacity
- Driver user/profile: full name (user), license_number, license_expiry (profile)
- Vendor: vendor_name, contact_person, contact_phone
- Helper: name, contact_number

### 8.2 Audit Logging

**All Changes Logged**:
```typescript
MasterDataAuditLog {
  log_id: UUID
  entity_type: string
  entity_id: UUID
  action: enum ['Created', 'Updated', 'Deleted', 'Deactivated']
  changed_fields: JSON
  changed_by: UUID
  timestamp: DateTime
  ip_address: string
}
```

---

## 9. Integration Points

**Referenced By**:
- Transport Orders (vehicles, drivers)
- Trips (vehicles, drivers, helpers)
- Vendor Portal (vendors)
- Gate Operations (vehicles)
- Fleet Management (vehicles, drivers, fuel)
- Costing (vehicles, vendors)

---

## 10. Related Documentation

- **[POI Management](poi-management.md)** - Location master data
- **[Product Inventory Management](product-inventory-management.md)** - Product master data
- **[Fleet Management](../06-fleet-management/README.md)** - Fleet operations using vehicle/driver data
- **[Vendor Management](../05-vendor-management/README.md)** - Vendor lifecycle and operations

**Related User Stories:**
- US-053: Vehicle Registration & Master Data
- US-057: Driver user profiles ([driver-user-profiles.md](../01-foundation/driver-user-profiles.md))
- US-061: Helper Profile
- US-047: Vendor Registration

**Source**: PRD_DFMS_v1.0.md - Sections 6.3.1-6.3.4
