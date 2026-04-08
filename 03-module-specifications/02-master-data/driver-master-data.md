---
module: 02-master-data
specification: Driver Master Data Management
version: 1.0
phase: Phase 1
source_document: PRD_DFMS_v1.0.md
related_stories: US-057
---

# Driver Master Data Management Specification

## Overview

The Driver Master Data Management module provides centralized management of driver profiles for the DFMS platform. It handles driver registration, document compliance (licenses, medical certificates), state tracking (Available, Assigned), and vehicle assignment history. Proper driver management ensures compliance, safety, availability visibility, and performance accountability across the fleet.

---

## 1. Driver Data Model

### 1.1 Driver Entity Structure

```typescript
Driver {
  driver_id: UUID
  tenant_id: UUID
  
  // Personal Information
  employee_id: string         // Unique per tenant
  full_name: string
  contact_number: string      // Unique per tenant
  national_id_number: string (nullable) // Unique if provided
  address: string (nullable)
  
  // Employment Details
  driver_type: enum ['Permanent', 'Temporary', 'Own', 'Vendor']
  
  // License Information
  driving_license_number: string // Unique per tenant
  license_type: string
  license_expiry_date: Date
  
  // Additional Info
  reference_contact_1: string (nullable)
  reference_contact_2: string (nullable)
  accident_history: string (nullable)
  last_training_assessment_info: string (nullable)
  
  // Documents (Optional)
  experience_certificate: Attachment (nullable)
  biodata: Attachment (nullable)
  medical_certificate: Attachment (nullable)
  medical_certificate_expiry_date: Date (nullable)
  training_record: Attachment (nullable)
  
  // State & Status
  is_active: boolean          // Driver Status (Active/Inactive)
  current_state: enum ['Available', 'Assigned', 'On Leave']
  
  // Metadata
  created_by: UUID
  created_at: DateTime
  updated_by: UUID
  updated_at: DateTime
}
```

---

## 2. Driver Registration & Management

### 2.1 Registration Workflow

**Creation Workflow**:
```
1. Transport Planner / Tenant Admin initiates driver registration
2. Enter Personal & Employment Info (Employee ID, Name, Contact, Type)
3. Enter License Details (Number, Type, Expiry)
4. Upload optional documents (Biodata, Experience, Medical)
5. Review and set Driver Status (is_active)
6. System validates uniqueness (Contact, License, NID)
7. Driver created with default state 'Available'
```

**Validation Rules**:
```typescript
{
  contact_number: {
    unique_per_tenant: true,
    pattern: /^\+?[1-9]\d{1,14}$/
  },
  driving_license_number: {
    unique_per_tenant: true,
    required: true
  },
  national_id_number: {
    unique_per_tenant: true,
    allow_null: true
  },
  license_expiry_date: {
    future_date: true
  }
}
```

---

## 3. Driver State & Assignment Tracking

### 3.1 State Machine

**State Transitions**:
```
Available ↔ Assigned (via Vehicle Assignment / Trip Start/End)
    ↕
 On Leave (via Leave Management)
```

**State Implications**:
```typescript
State Rules:
  Available:
    - Can be assigned to a vehicle/trip
    - Visible in dispatch boards as ready
  
  Assigned:
    - Currently linked to an active trip/vehicle
    - Cannot be assigned to concurrent overlapping trips
  
  On Leave:
    - Excluded from trip planning and vehicle assignment
    - Automatically transitions back to Available after leave end_date
```

### 3.2 Vehicle Assignment

**Assignment Logic**:
```typescript
function assignDriverToVehicle(driver_id: UUID, vehicle_id: UUID): void {
    const driver = getDriver(driver_id);
    
    if (!driver.is_active) throw Error("Driver is inactive");
    if (driver.current_state !== 'Available') throw Error("Driver is not available");
    
    // Create assignment record
    createAssignmentHistory({
        driver_id,
        vehicle_id,
        start_time: now(),
        assigned_by: currentUser.id
    });
    
    // Update state
    updateDriverState(driver_id, 'Assigned');
}
```

---

## 4. Document & Compliance Management

### 4.1 Document Upload

**Upload Constraints**:
- Allowed formats: `application/pdf`, `image/jpeg`, `image/png`
- Maximum file size: 5MB per document
- Documents are uploaded as file attachments directly to the `Driver` entity.

### 4.2 Expiry Alerts

**Cron Job Logic**:
```typescript
// Runs daily at 00:00 system time
async function checkExpiringDocuments() {
    const thresholdDate = addDays(now(), 30);
    
    // Check Licenses and Medical Certificates directly on the Driver entity
    const expiringDrivers = await getDriversWithExpiringDocuments(thresholdDate);
    
    // Generate Alerts
    for (const driver of expiringDrivers) {
        if (driver.license_expiry_date && driver.license_expiry_date <= thresholdDate) {
            createAlert({
                type: 'DocumentExpiry',
                target_role: 'FleetManager',
                message: `Driving License for driver ${driver.full_name} expires in ${daysUntil(driver.license_expiry_date)} days.`,
                severity: daysUntil(driver.license_expiry_date) < 7 ? 'High' : 'Medium'
            });
        }
        
        if (driver.medical_certificate_expiry_date && driver.medical_certificate_expiry_date <= thresholdDate) {
            createAlert({
                type: 'DocumentExpiry',
                target_role: 'FleetManager',
                message: `Medical Certificate for driver ${driver.full_name} expires in ${daysUntil(driver.medical_certificate_expiry_date)} days.`,
                severity: daysUntil(driver.medical_certificate_expiry_date) < 7 ? 'High' : 'Medium'
            });
        }
    }
}
```

---

## 5. Performance Tracking & Leave Management

### 5.1 Performance Metrics

**Tracked Data**:
- Total trips completed
- On-time delivery percentage
- Incident count (accidents, violations)
- Average rating (if applicable)
- Fuel efficiency (linked via vehicle telemetry)
- Last trip date

### 5.2 Leave Management

**Note:** Leave management is not part of the initial master data creation workflow. It is managed post-creation by a Supervisor or authorized role.

**Leave Rules**:
- Supervisors can mark a driver as `On Leave` with specific start and end dates.
- System automatically prevents trip assignments during the leave period.
- Max working hours are configurable (default: 12 hours) to prevent fatigue.

---

## 6. Bulk Operations

### 6.1 CSV Import

**Import Workflow**:
```
1. User downloads CSV template (/api/v1/drivers/import/template)
2. User uploads populated CSV (/api/v1/drivers/import)
3. System processes rows (append-only)
4. Row-level validation (uniqueness, required fields)
5. Valid rows are inserted
6. System returns error report for failed rows
```

---

## 7. Integration Points

### 7.1 Trip Planning & Dispatch
- Driver state exposed to dispatch boards.
- Auto-unassign driver upon trip completion.
- State updates based on trip start/completion.

### 7.2 Vehicle Management
- Driver-vehicle assignment history.
- Ensuring only verified, active drivers operate vehicles.

### 7.3 User Management (RBAC)
- Requires Role Hierarchy (US-004).
- User Invitation for Driver Mobile Interface (US-052).

---

## 8. Business Rules

### 8.1 Unique Constraints
```
Contact Number, Driving License Number, and National ID (if provided) must be unique per tenant.
System prevents creation of duplicate records.
```

### 8.2 Concurrent Assignments
```
A driver cannot have multiple concurrent active vehicle assignments.
```

---

## 9. Data Model Details

### 9.1 Indexes for Performance

```sql
CREATE INDEX idx_driver_tenant_status ON drivers(tenant_id, is_active, current_state);
CREATE INDEX idx_driver_license ON drivers(tenant_id, driving_license_number);
CREATE INDEX idx_driver_contact ON drivers(tenant_id, contact_number);
CREATE INDEX idx_driver_name_search ON drivers USING gin(to_tsvector('english', full_name));
CREATE INDEX idx_driver_license_expiry ON drivers(license_expiry_date) WHERE license_expiry_date IS NOT NULL;
CREATE INDEX idx_driver_med_expiry ON drivers(medical_certificate_expiry_date) WHERE medical_certificate_expiry_date IS NOT NULL;
```

### 9.2 Audit Trail

```typescript
DriverAuditLog {
  log_id: UUID
  driver_id: UUID
  action: enum ['Created', 'Updated', 'StatusChanged', 'StateChanged']
  changed_fields: JSON
  changed_by: UUID
  timestamp: DateTime
}
```

---

## 10. API Endpoints Implementation Plan

### 10.1 Core CRUD Endpoints

| Method | Endpoint | Description | Implementation Details |
|---|---|---|---|
| `POST` | `/api/v1/drivers` | Create Driver | Validates unique constraints (Contact, License). Saves file attachments if provided. |
| `GET` | `/api/v1/drivers` | List Drivers | Supports pagination (`page`, `limit`), filtering (`status`, `driver_type`), and search (`search`). |
| `GET` | `/api/v1/drivers/{driver_id}` | Get Driver | Returns full driver profile including documents. |
| `PATCH` | `/api/v1/drivers/{driver_id}` | Update Driver | Partial update. Validates constraints if unique fields are modified. |
| `PATCH` | `/api/v1/drivers/{driver_id}/status` | Update Status | Toggles `is_active`. Validates active assignments before deactivation. |

### 10.2 Document Management Endpoints

| Method | Endpoint | Description | Implementation Details |
|---|---|---|---|
| `POST` | `/api/v1/drivers/{driver_id}/documents` | Upload Document | Accepts multipart/form-data. Updates corresponding attachment field in Driver entity. |
| `GET` | `/api/v1/drivers/{driver_id}/documents` | Get Documents | Returns the populated documents from the Driver entity. |
| `DELETE`| `/api/v1/drivers/{driver_id}/documents/{document_type}` | Delete Document | Nullifies the specific document attachment field in the Driver entity. |

### 10.3 Reporting & Bulk Endpoints

| Method | Endpoint | Description | Implementation Details |
|---|---|---|---|
| `GET` | `/api/v1/drivers/{driver_id}/performance` | Get Performance | Aggregates data from trips/incidents tables. |
| `GET` | `/api/v1/drivers/expiring-documents` | Expiring Docs | Queries drivers where license/medical expiry is within `days` threshold. |
| `POST` | `/api/v1/drivers/import` | Bulk Import | Parses CSV, runs batch validation, inserts valid rows, returns error array. |
| `GET` | `/api/v1/drivers/import/template` | Get CSV Template | Returns static CSV headers matching the Driver entity. |

---

## 11. Testing Strategy

### 11.1 Unit Testing (Isolated Business Logic)
- **Frameworks**: Jest / Mocha (Node.js) or PyTest (Python) with mocking libraries.
- **Domain Logic**: Test state machine transitions (`Available` -> `Assigned` -> `On Leave`). Ensure `assignDriverToVehicle` throws domain-specific exceptions for invalid states.
- **Validators & Boundary Values**: 
  - Regex patterns for `contact_number`.
  - Future date validation for `license_expiry_date`.
- **Mocking**: Mock the database repository layer and external services. Mock the system clock (`now()`) to deterministically test the `checkExpiringDocuments` cron job logic.

---

## 12. Related Documentation

- **[Master Data Configuration](README.md)** - Overall master data management
- **[Vehicle Master Data](MDM-05-vehicle-master-data.md)** - Vehicle management
- **[Driver Master Data Story](../../04-backlog/sprints/sprint-2/01-master-data-management/MDM-06-driver-master-data.md)** - Source User Story

**Related User Stories:**
- US-057 (Driver Master Data Management)
- US-004 (Role Hierarchy)
- US-052 (Driver Mobile Interface)
