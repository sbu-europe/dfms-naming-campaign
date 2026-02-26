---
source_document: PRD_DFMS_v1.0.md
source_sections: Fleet & Vehicle Management, Vehicle Registration, Vehicle Registration & Master Data Management
extracted_date: 2026-02-13
last_updated: 2026-02-26
document_type: domain_specification
related_modules: [driver-management, trip-management, transport-order-management]
---

# Vehicle Management

## Overview

Vehicle Management is the **fleet asset registry** that maintains comprehensive vehicle master data for both own fleet (company-owned) and vendor fleet vehicles. It serves as the **single source of truth** for vehicle identification, specifications, capacity, compliance, and operational status, enabling accurate trip assignment, utilization tracking, and maintenance planning.

The vehicle registry supports diverse vehicle types (trucks, vans, pickups, specialized vehicles), tracks critical attributes (capacity, fuel type, body type), enforces compliance (registration, fitness certificates), and provides real-time availability status for transport planning.

### Purpose

- Register and maintain vehicle master records (own + vendor)
- Capture vehicle identification (registration number, chassis, VIN)
- Define vehicle specifications (type, capacity, body type, fuel type)
- Track vehicle compliance documents (registration, fitness, insurance)
- Manage vehicle assignments (POI, driver, garage)
- Monitor vehicle operational status (active, maintenance, inactive)
- Support vehicle availability checks for trip planning
- Provide vehicle utilization and performance tracking
- Enable audit trail for all vehicle data changes

### Workflow Position

```
Vehicle Procurement/Onboarding
    ↓
Vehicle Registration → Complete profile with specifications
    ↓
Vehicle Master Record Created → Status: Active
    ↓
Operations:
  - Assign to POI (home base)
  - Assign to Driver (pairing)
  - Assign to Garage/Workshop (maintenance location)
  - Assign to Trip (transport execution)
    ↓
Track Usage:
  - Mileage (odometer readings)
  - Trip count, Distance traveled
  - Utilization rate
    ↓
Maintenance Events → Status: Under Maintenance
    ↓
Decommission → Status: Inactive
```

---

## Vehicle Types & Categories

### Vehicle Type Classification

**Light Commercial Vehicles:**
- **Pickup Van:** Small covered van for light loads (1-2 tons)
- **Auto/Tempo:** Three-wheeler for short-distance, light loads
- **Tom Tom:** Battery-powered small vehicle (urban deliveries)

**Medium Trucks:**
- **Open Truck:** 3-7 tons capacity, flatbed
- **Covered Truck:** 3-7 tons capacity, enclosed body
- **Nosimon:** Locally manufactured small truck (2-3 tons)

**Heavy Trucks:**
- **Open Truck (Heavy):** 10-20 tons capacity
- **Covered Truck (Heavy):** 10-20 tons capacity
- **Trailer:** 20+ tons, articulated vehicle
- **Tractor:** Tractor-trailer combination

**Specialized Vehicles:**
- **Container Truck:** For containerized cargo
- **Tanker:** Liquid/bulk cargo (fuel, oil, liquids)
- **Refrigerated Truck:** Temperature-controlled (perishables)

### Body Type

- **Open Body:** Flatbed, no cover (construction materials, bulk goods)
- **Closed Body:** Fully enclosed (finished goods, packaged products)
- **Container:** Standard shipping container (import/export)
- **Flatbed:** Flat platform (large/heavy items)
- **Tanker:** Cylindrical tank (liquids, bulk powder)
- **Refrigerated:** Insulated with cooling system (cold chain)

### Wheel Configuration

- **4 Wheels:** Light vehicles (pickup, van, auto)
- **6 Wheels:** Medium trucks
- **10 Wheels:** Heavy trucks (single axle rear)
- **12 Wheels:** Heavy trucks (dual axle rear)
- **16-18 Wheels:** Multi-axle trailers
- **20+ Wheels:** Heavy-duty articulated vehicles

---

## Vehicle Registration

### Purpose

Create comprehensive vehicle master records with all identification, specification, and compliance details required for operational use.

### Vehicle Registration Form

**Section 1: Identification (Mandatory)**
```typescript
interface VehicleIdentification {
  registration_number: string;      // License plate (unique, required)
  chassis_number: string;           // VIN (unique, required)
  make: string;                     // Manufacturer (e.g., TATA, Ashok Leyland, Isuzu)
  model: string;                    // Model name/year (required)
  year_of_manufacture: number;      // Manufacture year
  color?: string;                   // Vehicle color
}
```

**Registration Number Format Validation:**
- **Bangladesh Pattern:** `[City/Metro]-[Class]-[Series]-[Number]`
- **Example:** `Dhaka Metro-GA-11-1234`
- **Validation:** Regex pattern matching, uniqueness check

**Chassis Number (VIN) Validation:**
- **Format:** 17-character alphanumeric code
- **Uniqueness:** Must be unique across tenant
- **Purpose:** Anti-theft, vehicle identity verification

**Section 2: Vehicle Specifications (Mandatory)**
```typescript
interface VehicleSpecifications {
  vehicle_type: VehicleType;        // Required
  body_type: BodyType;              // Required
  fuel_type: FuelType;              // Required
  wheel_count: number;              // 4, 6, 10, 12, 16, 18, 20+
  capacity_tons: number;            // Max load capacity (required)
  capacity_override_allowed: boolean; // Allow manual capacity adjustment
  allowed_product_categories: ('FG' | 'RM' | 'BOTH')[]; // Finished Goods, Raw Materials
}

type VehicleType = 
  | 'PICKUP_VAN' | 'OPEN_TRUCK' | 'COVERED_TRUCK'
  | 'NOSIMON' | 'AUTO' | 'TOM_TOM' | 'TRACTOR'
  | 'CONTAINER_TRUCK' | 'TANKER' | 'REFRIGERATED_TRUCK';

type BodyType = 
  | 'OPEN_BODY' | 'CLOSED_BODY' | 'CONTAINER'
  | 'FLATBED' | 'TANKER' | 'REFRIGERATED';

type FuelType = 
  | 'DIESEL' | 'PETROL' | 'CNG' | 'ELECTRIC' | 'HYBRID';
```

**Capacity Management:**
- **Default Capacity:** Auto-populated based on vehicle type/model
- **Manual Override:** Allowed if actual capacity differs (documented reason required)
- **Capacity Validation:** Trip quantity cannot exceed vehicle capacity

**Product Category Restrictions:**
- **FG Only:** Finished goods (packaged, branded products)
- **RM Only:** Raw materials (bulk, unprocessed)
- **Both:** Flexible (can carry either)

**Section 3: Ownership & Assignment**
```typescript
interface VehicleOwnershipAssignment {
  ownership: 'OWN' | 'VENDOR';
  vendor_id?: string;               // If ownership = VENDOR
  
  // Assignments (optional at registration)
  assigned_poi_id?: string;         // Vehicle home base (depot, factory)
  assigned_driver_id?: string;      // Default driver pairing
  assigned_garage_id?: string;      // Primary maintenance location
  
  gps_tracker_id?: string;          // GPS device ID
  gps_tracker_model?: string;       // Device model (e.g., "TrackPro 2000")
}
```

**Ownership Types:**
- **Own:** Company-owned vehicles (full control, maintenance responsibility)
- **Vendor:** Third-party vehicles (vendor responsible for maintenance)

**Section 4: Mileage Tracking (Own Fleet Only)**
```typescript
interface VehicleMileage {
  initial_odometer_km: number;      // Starting reading (at registration)
  current_odometer_km: number;      // Current reading (updated per trip)
  average_mileage_kmpl?: number;    // Km per liter (fuel efficiency)
  total_distance_traveled_km: number; // Lifetime distance
  last_odometer_update: Date;
}
```

**Mileage Rules:**
- **Own Fleet:** Mandatory mileage tracking (for cost analysis, maintenance scheduling)
- **Vendor Fleet:** Optional (vendor manages own vehicles)
- **Odometer Reading:** Updated at trip start/end (from scale-in/scale-out or driver app)

**Section 5: Purchase Information (Optional)**
```typescript
interface VehiclePurchaseInfo {
  purchase_date?: Date;
  purchase_price?: number;
  purchase_currency?: 'BDT' | 'USD';
  depreciation_method?: 'STRAIGHT_LINE' | 'DECLINING_BALANCE';
  expected_lifespan_years?: number;
}
```

**Section 6: Compliance Documents**
```typescript
interface VehicleComplianceDocuments {
  registration_certificate_url?: string; // Vehicle registration document
  registration_expiry_date?: Date;
  
  fitness_certificate_url?: string;     // Fitness/roadworthiness certificate
  fitness_expiry_date?: Date;
  
  insurance_certificate_url?: string;   // Vehicle insurance
  insurance_expiry_date?: Date;
  insurance_provider?: string;
  
  tax_token_url?: string;               // Road tax token
  tax_token_expiry_date?: Date;
}
```

**Document Expiry Alerts:**
- **30 Days Before Expiry:** Warning notification to Fleet Manager
- **7 Days Before Expiry:** Critical alert (escalation)
- **Expired:** Vehicle status auto-updated to "Compliance Issue" (cannot be assigned to trips)

---

## Data Model

```typescript
interface Vehicle {
  vehicle_id: string;               // Auto-generated (e.g., VEH-2026-00123)
  
  // Identification
  registration_number: string;      // Unique
  chassis_number: string;           // Unique (VIN)
  make: string;
  model: string;
  year_of_manufacture: number;
  color?: string;
  
  // Specifications
  vehicle_type: VehicleType;
  body_type: BodyType;
  fuel_type: FuelType;
  wheel_count: number;
  capacity_tons: number;
  capacity_override_reason?: string;
  allowed_product_categories: ProductCategory[];
  
  // Ownership & Assignment
  ownership: 'OWN' | 'VENDOR';
  vendor_id?: string;
  assigned_poi_id?: string;
  assigned_driver_id?: string;
  assigned_garage_id?: string;
  
  // GPS Tracking
  gps_tracker_id?: string;
  gps_tracker_model?: string;
  gps_enabled: boolean;
  
  // Mileage (Own Fleet)
  mileage?: VehicleMileage;
  
  // Purchase Info (Optional)
  purchase_info?: VehiclePurchaseInfo;
  
  // Compliance Documents
  documents: VehicleComplianceDocuments;
  
  // Operational Status
  status: VehicleStatus;
  status_reason?: string;           // Why inactive/maintenance
  availability: VehicleAvailability;
  
  // Utilization Metrics
  total_trips_count: number;
  total_distance_km: number;
  utilization_rate_percentage: number; // % of time vehicle in active trips
  
  // Metadata
  created_by: string;
  created_at: Date;
  updated_at: Date;
  tenant_id: string;
}

type VehicleStatus = 
  | 'ACTIVE'                        // Operational, can be assigned
  | 'UNDER_MAINTENANCE'             // In workshop, cannot be assigned
  | 'INACTIVE'                      // Decommissioned, off-fleet
  | 'COMPLIANCE_ISSUE'              // Expired documents, cannot be assigned
  | 'PENDING_APPROVAL';             // Vendor vehicle pending verification

type VehicleAvailability = 
  | 'AVAILABLE'                     // Not assigned to any active trip
  | 'IN_TRIP'                       // Assigned to active trip
  | 'RESERVED';                     // Reserved for scheduled trip
```

---

## Vehicle List View & Filtering

### Purpose

Provide Fleet Managers and Transport Planners with **searchable, filterable vehicle list** for operational planning and fleet oversight.

### List View Table

**Columns:**
| Registration | Type | Capacity | Status | Availability | POI | Driver | Actions |
|--------------|------|----------|--------|--------------|-----|--------|---------|
| Dhaka-GA-11-1234 | Covered Truck | 7 tons | ✅ Active | 🟢 Available | Depot A | Ahmed Khan | View, Edit, Assign |
| Chittagong-BA-22-5678 | Open Truck | 10 tons | ✅ Active | 🔵 In Trip | Factory B | Karim Mia | View, Track Trip |
| Sylhet-CA-33-9012 | Pickup Van | 2 tons | 🟡 Maintenance | ⏸️ N/A | Workshop C | - | View, Update Status |

### Filters

**Primary Filters:**
- **Status:** All, Active, Under Maintenance, Inactive, Compliance Issue
- **Availability:** All, Available, In Trip, Reserved
- **Ownership:** All, Own Fleet, Vendor
- **Vehicle Type:** Multi-select (Pickup Van, Open Truck, Covered Truck, etc.)
- **POI:** Multi-select (Depot A, Factory B, etc.)

**Advanced Filters:**
- **Capacity Range:** Slider (0-20 tons)
- **Fuel Type:** Multi-select (Diesel, Petrol, CNG, Electric)
- **Body Type:** Multi-select (Open, Closed, Container, Refrigerated)
- **Compliance Status:** Valid Documents, Expiring Soon (< 30 days), Expired
- **GPS Enabled:** Yes, No

### Sorting

- Registration Number (A-Z, Z-A)
- Capacity (Low-High, High-Low)
- Total Trips (Most-Least, Least-Most)
- Utilization Rate (High-Low, Low-High)
- Last Trip Date (Recent-Oldest, Oldest-Recent)

---

## Vehicle Assignment Rules

### Trip Assignment Constraints

**Pre-Assignment Validation:**
1. **Status = ACTIVE:** Vehicle must be operational
2. **Availability = AVAILABLE:** Not in another active trip
3. **Compliance Valid:** All required documents not expired
4. **Capacity Adequate:** Vehicle capacity ≥ trip quantity
5. **Product Category Match:** Vehicle allowed to carry product type (FG/RM)
6. **Driver Assigned:** Vehicle has active driver (if required)

**Assignment Workflow:**
```
1. Transport Planner creates TO
2. System filters eligible vehicles:
   - Status = ACTIVE
   - Availability = AVAILABLE
   - Capacity ≥ TO quantity
   - Product category matches
3. TP selects vehicle
4. System validates:
   - Vehicle still available (no race condition)
   - Driver assigned (if required)
5. Vehicle assigned to TO
6. Vehicle availability → 'IN_TRIP'
7. Trip created
8. Trip completion → Vehicle availability → 'AVAILABLE'
```

### Concurrent Assignment Prevention

```typescript
// Optimistic locking to prevent double-booking
async function assignVehicleToTO(vehicle_id: string, to_id: string): Promise<boolean> {
  const vehicle = await getVehicle(vehicle_id);
  
  if (vehicle.availability !== 'AVAILABLE') {
    throw new Error('Vehicle no longer available');
  }
  
  // Atomic update with version check
  const updated = await updateVehicle(vehicle_id, {
    availability: 'IN_TRIP',
    current_to_id: to_id,
    updated_at: new Date()
  }, {
    where: { availability: 'AVAILABLE', version: vehicle.version }
  });
  
  if (!updated) {
    throw new Error('Vehicle assignment conflict. Vehicle was assigned by another user.');
  }
  
  return true;
}
```

---

## Vehicle Utilization Tracking

### Purpose

Monitor vehicle usage efficiency to optimize fleet size, identify underutilized assets, and plan capacity.

### Utilization Metrics

**Trip-Based Metrics:**
```typescript
interface VehicleUtilization {
  vehicle_id: string;
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  
  // Trip Counts
  total_trips: number;
  completed_trips: number;
  cancelled_trips: number;
  
  // Distance
  total_distance_km: number;
  average_distance_per_trip_km: number;
  
  // Time Utilization
  total_active_hours: number;       // Time vehicle in active trips
  total_idle_hours: number;         // Time vehicle available but unused
  utilization_rate: number;         // (active_hours / (active + idle)) × 100
  
  // Load Factor
  average_capacity_utilization: number; // Avg % of capacity used per trip
  
  // Performance
  on_time_trips: number;            // Trips delivered on schedule
  on_time_rate: number;             // (on_time / completed) × 100
}
```

**Utilization Rate Calculation:**
```typescript
function calculateUtilizationRate(vehicle: Vehicle, period: DateRange): number {
  const trips = getTripsForVehicle(vehicle.vehicle_id, period);
  
  const totalActiveHours = trips.reduce((sum, trip) => {
    const tripDurationHours = (trip.completed_at - trip.started_at) / (1000 * 60 * 60);
    return sum + tripDurationHours;
  }, 0);
  
  const periodTotalHours = (period.end - period.start) / (1000 * 60 * 60);
  
  return (totalActiveHours / periodTotalHours) * 100;
}
```

**Utilization Benchmarks:**
- **Excellent:** > 75% utilization
- **Good:** 60-75%
- **Average:** 40-60%
- **Poor:** < 40% (underutilized asset)

---

## Vehicle Maintenance Status Management

### Purpose

Track vehicle maintenance events to ensure vehicles are roadworthy and prevent assignment to non-operational vehicles.

### Maintenance Status Workflow

```
1. Vehicle due for maintenance (mileage threshold, scheduled service, breakdown)
2. Fleet Manager updates vehicle status → 'UNDER_MAINTENANCE'
3. System:
   - Prevents new trip assignments
   - Notifies Transport Planners (vehicle unavailable)
4. Maintenance completed
5. Fleet Manager updates status → 'ACTIVE'
6. Vehicle available for assignment again
```

### Data Model Extensions

```typescript
interface VehicleMaintenanceEvent {
  event_id: string;
  vehicle_id: string;
  
  // Maintenance Details
  event_type: 'SCHEDULED_SERVICE' | 'BREAKDOWN' | 'ACCIDENT_REPAIR' | 'OTHER';
  description: string;
  
  // Dates
  start_date: Date;
  expected_completion_date: Date;
  actual_completion_date?: Date;
  
  // Location
  garage_id?: string;
  garage_name?: string;
  
  // Cost (Phase 2+)
  estimated_cost?: number;
  actual_cost?: number;
  
  // Status
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  
  // Metadata
  created_by: string;
  created_at: Date;
}
```

---

## Integration Points

### Upstream: Driver Management

**Driver-Vehicle Pairing:**
- Vehicles can be assigned to default drivers
- Driver-vehicle assignment history tracked

### Downstream: Transport Order (TO) Management

**Vehicle Selection for TO:**
- TPs select vehicles from eligible list (filtered by status, capacity, availability)
- Vehicle assigned to TO, availability updated

### Downstream: Trip Management

**Trip Execution:**
- Vehicle assigned to trip, status tracked
- Mileage updated (odometer readings from scale-in/scale-out)
- Trip completion frees vehicle for next assignment

### Lateral: Vendor Management

**Vendor Vehicles:**
- Vendor vehicles registered in vehicle master
- Vendor responsible for maintenance (status managed by vendor)

---

## Performance & Scalability

### Expected Volume (Phase 1)

- **Total vehicles:** 50-200 vehicles per tenant (Own + Vendor)
- **Own fleet:** 20-50 vehicles
- **Vendor fleet:** 30-150 vehicles

### Query Optimization

```sql
-- Available Vehicles (trip assignment)
CREATE INDEX idx_vehicle_availability ON vehicles(status, availability, tenant_id)
WHERE status = 'ACTIVE' AND availability = 'AVAILABLE';

-- Vehicle by Registration (lookup)
CREATE INDEX idx_vehicle_registration ON vehicles(registration_number, tenant_id);

-- Vehicle by POI (fleet management)
CREATE INDEX idx_vehicle_poi ON vehicles(assigned_poi_id, status, tenant_id);
```

---

## Security & Compliance

### Data Access Control

- **Tenant Isolation:** All vehicle records filtered by `tenant_id`
- **Role-Based Access:**
  - Fleet Manager: All vehicles (create, edit, deactivate)
  - Transport Planner: View vehicles, assign to TOs (read-only)
  - Driver: View own assigned vehicle (read-only)
  - Vendor: View own vehicles (edit if vendor-managed)

### Audit Requirements

**Mandatory Audit Events:**
- Vehicle registration
- Vehicle specification changes (capacity, type, ownership)
- Status changes (active, maintenance, inactive)
- Assignment changes (POI, driver, garage)
- Document uploads/renewals
- Trip assignments

---

## Key Design Decisions

### Why Unique Registration Number?

**Rationale:**
- Legal requirement (vehicle license plates are unique)
- Prevents duplicate vehicle entries
- Simplifies vehicle identification

### Why Separate Own vs Vendor Fleet?

**Rationale:**
- Different operational models (control vs contracted)
- Different cost structures (owned assets vs rental)
- Different maintenance responsibilities

### Why Optional Mileage for Vendor Vehicles?

**Rationale:**
- Vendors manage own vehicle maintenance
- Mileage tracking overhead not justified for external assets
- Focus on own fleet optimization

---

## Related User Stories

- **US-082:** Vehicle Registration
- **US-083:** Vehicle Specification Management
- **US-084:** Vehicle Compliance Document Tracking
- **US-085:** Vehicle Status Management
- **US-086:** Vehicle Utilization Tracking

---

## Summary

Vehicle Management is the **fleet asset registry** that provides:

- **Comprehensive Vehicle Master Data:** Identification, specifications, capacity, compliance
- **Vehicle Type Diversity:** Support for 10+ vehicle types, multiple body types, fuel types
- **Ownership Differentiation:** Own fleet vs Vendor fleet with tailored tracking
- **Compliance Tracking:** Document expiry alerts, status enforcement
- **Operational Status:** Active, maintenance, inactive with assignment constraints
- **Utilization Monitoring:** Trip counts, distance, utilization rate, on-time performance
- **Assignment Validation:** Capacity, availability, compliance checks before trip assignment
- **Audit Trail:** Complete history of vehicle data changes and assignments

Vehicle Management ensures accurate fleet visibility, optimized asset utilization, and compliant vehicle operations across the transport network.
