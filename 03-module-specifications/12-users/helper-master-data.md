---
module: 12-users
specification: Helper Master Data Management
version: 1.2
phase: Phase 1
source_document: PRD_DFMS_v1.0.md
last_updated: 2026-04-09
related_stories: US-061
---

# Helper Master Data Management Specification

## Overview

Helpers are essential supporting personnel in the DFMS platform, assisting drivers with loading, unloading, and handling goods during trips. Proper helper management ensures operational efficiency, product safety, and accurate availability tracking for trip assignments.

This specification defines the Helper data model, lifecycle management, assignment logic, availability tracking, and integration with operational modules (like Transport Orders and Trips).

### Architectural placement

Helper behaviour spans **identity** (who can log in or be linked to audit context), **tenant-scoped master data** (employee profile, availability), and **operations** (trip assignment). The detailed implementation plan therefore lives under **01-foundation** alongside user/tenant models: helpers may exist only as operational profiles, or may be **linked to a platform `User`** when the same person is also a system user (e.g. mobile or back-office access). The optional `user_id` foreign key preserves that evolution without forcing every helper to have credentials on day one.

For the broader master-data catalogue (vehicles, drivers, vendors, bulk upload patterns), see the **02-master-data** module specifications.

---

## 1. Helper Architecture

### 1.1 Helper Entity Model

```typescript
Helper {
  id: UUID
  employee_id: string              // Unique per tenant
  full_name: string
  contact_number: string           // Unique per tenant
  national_id_number: string       // Unique per tenant (nullable)

  // Optional link to platform user (same person as system user)
  user_id: UUID (nullable)         // FK to User; unique per tenant when set

  // Contacts
  reference_contact_1: string (nullable)
  reference_contact_2: string (nullable)
  address: string (nullable)

  // Status & Availability
  is_active: boolean               // Checkmark (Is Active?)
  availability_status: enum [
    'Available',
    'OnTrip',
    'OnLeave',
    'Terminated'
  ]

  // Performance Tracking
  total_trips: integer             // Default: 0
  last_trip_date: DateTime (nullable)
  incident_count: integer          // Default: 0

  // Metadata
  tenant_id: UUID
  created_by: UUID
  created_at: DateTime
  updated_by: UUID (nullable)
  updated_at: DateTime (nullable)
  deleted_at: DateTime (nullable)  // For soft deletes
}
```

**`user_id` rules**

- **Nullable**: Many helpers are operational-only records with no login.
- **When set**: Enforces **at most one Helper per User per tenant** (and typically one User linked per Helper). Enables shared audit identity, future mobile login as helper, and RBAC alignment without duplicating identity fields on `Helper`.
- **Provisioning**: Linking or unlinking `user_id` is an admin/TDO action; changing linked users must respect uniqueness and active-trip constraints.

### 1.2 Helper Assignment Model

To support the many-to-one mapping (multiple helpers per driver/trip) and retain assignment history, a dedicated mapping entity is used.

```typescript
HelperAssignment {
  id: UUID
  helper_id: UUID                  // FK to Helper
  driver_id: UUID                  // FK to Driver
  vehicle_id: UUID (nullable)      // FK to Vehicle
  trip_id: UUID                    // FK to Trip (or Transport Order)

  status: enum ['Active', 'Completed', 'Cancelled']
  assigned_at: DateTime
  completed_at: DateTime (nullable)

  // Metadata
  tenant_id: UUID
  created_by: UUID
  created_at: DateTime
  updated_by: UUID (nullable)
  updated_at: DateTime (nullable)
}
```

---

## 2. Availability & State Management

### 2.1 State Transitions

The `availability_status` of a helper is governed by a strict state machine to prevent assignment conflicts.

**Allowed Transitions:**
- `Available` ↔ `OnLeave`: Manual toggle by TDO or Tenant Admin.
- `Available` → `OnTrip`: Triggered **automatically** when assigned to an active trip.
- `OnTrip` → `Available`: Triggered **automatically** when the associated trip is completed or cancelled.
- `Any State` → `Terminated`: Manual override. Prevents any future assignments.

### 2.2 Conflict Prevention

**Assignment Validation:**
```typescript
function validateHelperAssignment(helper_id: UUID): ValidationResult {
    const helper = await getHelper(helper_id);

    if (!helper.is_active) {
        return { valid: false, message: 'Helper is inactive.' };
    }

    if (helper.availability_status !== 'Available') {
        return {
            valid: false,
            message: `Helper cannot be assigned. Current status: ${helper.availability_status}`
        };
    }

    // Double-check active assignments to prevent race conditions
    const activeAssignment = await getActiveAssignment(helper_id);
    if (activeAssignment) {
        return { valid: false, message: 'Helper is already assigned to an active trip.' };
    }

    return { valid: true };
}
```

---

## 3. Helper Lifecycle Management

### 3.1 Registration & Validation

**Creation Workflow:**
1. TDO/Tenant Admin enters helper details.
2. System validates uniqueness of `employee_id`, `contact_number`, and `national_id_number` (if provided) within the tenant context.
3. Optional: link `user_id` if a `User` already exists; otherwise leave null.
4. System creates Helper record with `is_active = true` and `availability_status = 'Available'`.
5. Audit log records the creation event.

**Validation Rules:**
```typescript
{
  employee_id: { unique_per_tenant: true, required: true },
  full_name: { required: true, max_length: 255 },
  contact_number: { unique_per_tenant: true, required: true, pattern: /^\+?[0-9]{10,15}$/ },
  national_id_number: { unique_per_tenant: true, required: false },
  user_id: { unique_per_tenant_when_present: true, required: false },
  is_active: { required: true, type: 'boolean' }
}
```

### 3.2 Bulk Upload (CSV)

To facilitate onboarding, helpers can be uploaded in bulk via CSV.

**Processing Rules:**
- **Append-Only**: The upload only creates new records; it does not update existing ones.
- **Row-Level Isolation**: Rows are processed independently. If Row 3 fails validation (e.g., duplicate Contact Number), Rows 1, 2, and 4 are still inserted successfully.
- **Error Reporting**: The API returns a structured report detailing successful inserts and specific row-level errors.

### 3.3 Updates & Inline Editing

**Editable Fields:**
- Full Name, Contacts, Address, Status (`is_active`, `availability_status`), optional `user_id` (with uniqueness checks).
- Inline row and column editing is supported on the frontend list view.
- *Note*: Updating `employee_id`, `contact_number`, or `national_id_number` triggers re-validation of unique constraints.

### 3.4 Deactivation (Soft Delete)

```typescript
async function deleteHelper(helper_id: UUID): Promise<void> {
    const helper = await getHelper(helper_id);

    if (helper.availability_status === 'OnTrip') {
        throw new Error('Cannot delete a helper currently assigned to an active trip.');
    }

    await db.update('helpers', helper_id, {
        deleted_at: NOW(),
        is_active: false,
        availability_status: 'Terminated'
    });
}
```

---

## 4. Integration Points

### 4.1 Trip & Transport Order (TO) Execution
- **Assignment**: During trip dispatch, TDOs can assign one or more helpers to the driver/vehicle.
- **Auto-Status Updates**: When a trip transitions to `InTransit`, assigned helpers move to `OnTrip`. When the trip transitions to `Completed`, helpers revert to `Available`.

### 4.2 Performance Tracking
- **Total Trips**: Incremented automatically upon trip completion.
- **Last Trip Date**: Updated automatically upon trip completion.
- **Incident Count**: Incremented if the helper is linked to a logged trip incident (e.g., damage, delay).

### 4.3 User & identity integration
- When `user_id` is set, permission checks for actions “as user” use **[RBAC](rbac.md)** / **[User & tenant management](user-tenant-management.md)**; operational helper rules (availability, trip assignment) still use the Helper aggregate.

---

## 5. API Endpoints

All endpoints are prefixed with `/api/v1` and require TDO or Tenant Admin authorization.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/helpers` | List helpers (paginated, supports search and filtering by status). |
| `GET` | `/helpers/available` | Convenience endpoint: lists helpers where `is_active=true` and `availability_status='Available'`. |
| `POST` | `/helpers` | Create a new helper profile. |
| `GET` | `/helpers/{id}` | Get detailed helper profile, including performance metrics. |
| `PATCH` | `/helpers/{id}` | Update helper profile (supports inline field edits). |
| `PATCH` | `/helpers/{id}/status` | Manually update helper status (e.g., mark `OnLeave`). |
| `POST` | `/helpers/bulk-upload` | Upload helpers via CSV (returns row-level error report). |
| `GET` | `/helpers/bulk-upload/template` | Download the CSV template for bulk upload. |

---

## 6. Data Model Details & Indexes

### 6.1 Indexes for Performance and Integrity

```sql
-- Unique Constraints (Partial indexes to ignore soft-deleted records)
CREATE UNIQUE INDEX idx_helper_emp_id ON helpers(tenant_id, employee_id) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_helper_contact ON helpers(tenant_id, contact_number) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_helper_nid ON helpers(tenant_id, national_id_number) WHERE national_id_number IS NOT NULL AND deleted_at IS NULL;
CREATE UNIQUE INDEX idx_helper_user_id ON helpers(tenant_id, user_id) WHERE user_id IS NOT NULL AND deleted_at IS NULL;

-- Query Performance
CREATE INDEX idx_helper_status ON helpers(tenant_id, is_active, availability_status);
CREATE INDEX idx_helper_assignment_active ON helper_assignments(helper_id, status) WHERE status = 'Active';
CREATE INDEX idx_helper_assignment_trip ON helper_assignments(trip_id);
```

---

## 7. Testing Strategy (Target >80% Coverage)

To ensure robustness and data integrity, the Helper Master Data Management module will employ a dual-layered testing approach focusing on domain logic isolation and database constraint verification.

### 7.1 Unit Tests (Service & Domain Layer)

*Dependencies like Repositories and external services will be mocked.*

**1. State Transition Logic:**
- **Success Path**: Assert that transitioning a helper from `Available` to `OnTrip` succeeds when assigned to a trip.
- **Failure Path**: Assert that transitioning from `OnTrip` to `OnLeave` throws a `StateTransitionException`.
- **Termination**: Assert that `Terminated` helpers reject any assignment attempts.

**2. Assignment Conflict Detection:**
- **Conflict**: Mock the repository to return an existing active assignment for a helper. Assert that the assignment service throws a `ConflictException`.
- **No Conflict**: Mock the repository to return no active assignments. Assert the assignment succeeds and triggers the status update to `OnTrip`.

**3. Bulk Upload Parser:**
- **Row Isolation**: Feed a mocked CSV stream with valid, invalid, and malformed rows. Assert that the parser correctly aggregates errors and only passes valid DTOs to the repository layer, without failing the entire batch.

**4. Validation Service:**
- **Uniqueness**: Test the pre-flight uniqueness checks (Employee ID, Contact Number, NID) against mocked repository responses.

**5. User linkage:**
- **Unique `user_id`**: Attempt to assign the same `user_id` to two helpers in one tenant; assert failure.
- **Cross-tenant**: Same `user_id` linked to helpers in different tenants if your identity model allows multi-tenant users—otherwise assert single global user-to-helper mapping per product rules.

### 7.2 Integration Tests (API & Database Layer)

*These tests will run against a test database (e.g., Testcontainers with PostgreSQL) to verify constraints and API contracts.*

**1. Database Constraints (Multi-tenancy):**
- **Same Tenant Conflict**: Attempt to insert two helpers with the same `employee_id` for the *same* `tenant_id`. Assert it fails with a Unique Constraint Violation.
- **Cross-Tenant Isolation**: Attempt to insert two helpers with the same `employee_id` for *different* `tenant_id`s. Assert it succeeds.
- **Nullable Unique**: Attempt to insert multiple helpers with a `null` NID. Assert it succeeds (verifying the partial index).

**2. API Contracts & RBAC:**
- **Authorization**: Call `POST /api/v1/helpers` with a TDO token (Assert `201 Created`). Call the same endpoint with a Driver token (Assert `403 Forbidden`).
- **Query Params**: Verify pagination, filtering (`?availability_status=Available`), and search functionality on the `GET /api/v1/helpers` endpoint.

**3. End-to-End Assignment Flow:**
- Seed a Helper, Driver, and Trip in the test database.
- Hit the Assignment API endpoint.
- Verify the `helper_assignments` table has a new record.
- Verify the `helpers` table shows `availability_status = 'OnTrip'`.
- Hit the Trip Completion endpoint (mocked or actual) and verify the helper's status reverts to `Available`.

---

## 8. Related Documentation

- **[Master Data README](../02-master-data/README.md)** - Overall master data management architecture.
- **[User & tenant management](user-tenant-management.md)** - Users, tenants, and identity lifecycle.
- **[Trip Management](../03-operations/trip-management.md)** - How helpers are utilized during trip execution.

**Related User Stories:**
- US-061: Helper Profile (MDM-07)

**Source**: PRD_DFMS_v1.0.md
