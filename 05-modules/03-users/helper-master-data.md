---
module: 12-users
specification: Helper Master Data Management
version: 1.3
phase: Phase 1
source_document: PRD_DFMS_v1.0.md
last_updated: 2026-04-17
related_stories: US-061
---

# Helper Master Data Management Specification

## Overview

Helpers are essential supporting personnel in the DFMS platform, assisting drivers with loading, unloading, and handling goods during trips. Proper helper management ensures operational efficiency, product safety, and accurate availability tracking for trip assignments.

This specification defines the Helper data model, lifecycle management, assignment logic, availability tracking, and integration with operational modules (like Transport Orders and Trips).

### Architectural placement

The **`Helper`** model lives in **`apps.users`** (`users.Helper`). Helpers may be **linked to a platform `User`** via optional **`user`** OneToOne (nullable); most helpers are operational-only records.

For bulk CSV patterns and **`IMPORT_REGISTRY`**, see **[bulk-import-export.md](../02-master-data/bulk-import-export.md)** and **[master-data-configuration.md](../02-master-data/master-data-configuration.md)**.

---

## Implementation status (nourish-backend)

| Topic | Behaviour in code |
|--------|---------------------|
| **Model** | **`user`** OneToOne nullable; **`is_active`**; **`deleted_at`** soft delete; **`total_trips`**, **`last_trip_date`**, **`incident_count`**; **no `availability_status` field** (removed — use **`is_active`** + soft delete + trip logic elsewhere). |
| **REST API** | **`HelperViewSet`** in **`apps/users/views.py`** — routes under **`/api/v1/users/helpers/`** (nested under **`users`** URL include). **`GET …/helpers/available/`** lists active non-deleted helpers. **`PATCH …/helpers/{id}/status/`** updates **`is_active`** only (`HelperStatusUpdateSerializer`). |
| **Dead code note** | A duplicate **`HelperViewSet`** exists in **`apps/master_data/views.py`** but is **not** registered in **`master_data/urls.py`** — the live API is the **`users`** app. |
| **Bulk CSV** | **`HelperImportConfig`** registers **`IMPORT_REGISTRY["helper"]`**. Columns: **`employee_id`**, **`full_name`**, **`contact_number`**, optional **`national_id_number`**, **`reference_contact_1`**, **`reference_contact_2`**, **`address`**, optional **`is_active`**. Upserts by **`employee_id`**. Admin: **`/admin/users/helper/import/`**. |
| **HelperAssignment** | **Not implemented** as a Django model in this repository yet — §1.2 / §4 / §6 below remain **target** design for future trips/TO integration. |

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

  // Status (implementation: no separate availability_status column)
  is_active: boolean               // Master toggle; soft-delete sets deleted_at + is_active false

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

### 1.2 Helper Assignment Model (target / not in schema yet)

To support the many-to-one mapping (multiple helpers per driver/trip) and retain assignment history, a dedicated mapping entity may be introduced. **There is no `HelperAssignment` table in the current codebase** — treat the following as **design intent**.

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

### 2.1 State transitions (product intent vs implementation)

The **`Helper`** row does **not** store **`availability_status`**. Operational states (**on trip**, **on leave**) are intended to be enforced by **trip assignment services** and/or future fields — today use **`is_active`**, **`deleted_at`**, and downstream modules.

**Target transitions (when assignment model exists):**
- In service / trip layer: only assign helpers that are **active** and **not soft-deleted**.
- **`PATCH /users/helpers/{id}/status/`** toggles **`is_active`** only (see **`HelperStatusUpdateSerializer`**).

### 2.2 Conflict Prevention

**Assignment Validation:**
```typescript
function validateHelperAssignment(helper_id: UUID): ValidationResult {
    const helper = await getHelper(helper_id);

    if (!helper.is_active) {
        return { valid: false, message: 'Helper is inactive.' };
    }

    // Implementation: use is_active && !deleted_at; optional trip-level checks when assignments exist
    if (!helper.is_active || helper.deleted_at) {
        return { valid: false, message: 'Helper is inactive or deleted.' };
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
4. System creates Helper record with `is_active = true` (and `deleted_at` null).
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

Helpers support the **shared bulk job pipeline**: Django admin **`/admin/users/helper/import/`** and REST **`POST /api/v1/bulk-imports/`** with **`model_name=helper`** (see **[bulk-import-export.md](../02-master-data/bulk-import-export.md)**).

**Processing rules (implementation):**
- **`HelperImportConfig`** upserts by **`employee_id`** (creates or updates the active row).
- Preview / **`import_valid_only`** semantics match the global bulk spec.

### 3.3 Updates & Inline Editing

**Editable Fields:**
- Full Name, Contacts, Address, **`is_active`**, optional **`user`** (with uniqueness checks). No separate **`availability_status`** field.
- Inline row and column editing is supported on the frontend list view.
- *Note*: Updating `employee_id`, `contact_number`, or `national_id_number` triggers re-validation of unique constraints.

### 3.4 Deactivation (Soft Delete)

```typescript
// API perform_destroy (users.HelperViewSet): sets deleted_at, is_active=false
async function deleteHelper(helper_id: UUID): Promise<void> {
    // Add trip-assignment guard when HelperAssignment exists
    await db.update('helpers', helper_id, {
        deleted_at: NOW(),
        is_active: false,
    });
}
```

---

## 4. Integration Points

### 4.1 Trip & Transport Order (TO) Execution
- **Assignment**: During trip dispatch, TDOs can assign one or more helpers to the driver/vehicle (**requires assignment persistence** — see §1.2 roadmap).
- **Auto-Status Updates**: Intended trip-driven status changes are **not** stored on **`Helper.availability_status`**; implement in trip/assignment services when models exist.

### 4.2 Performance Tracking
- **Total Trips**: Incremented automatically upon trip completion.
- **Last Trip Date**: Updated automatically upon trip completion.
- **Incident Count**: Incremented if the helper is linked to a logged trip incident (e.g., damage, delay).

### 4.3 User & identity integration
- When **`user`** (FK) is set, permission checks for actions “as user” use **[RBAC](../01-foundation/rbac.md)** / **[User & tenant management](../01-foundation/user-tenant-management.md)**; operational helper rules (trip assignment) still use the Helper aggregate.

---

## 5. API Endpoints

Implemented under **`/api/v1/users/helpers/`** (`apps.users.views.HelperViewSet`).

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/users/helpers/` | List helpers (`deleted_at` null); filter **`is_active`**, search employee/name/contact/NID. |
| `GET` | `/api/v1/users/helpers/available/` | **`is_active=true`**, not deleted. |
| `POST` | `/api/v1/users/helpers/` | Create helper. |
| `GET` | `/api/v1/users/helpers/{id}/` | Retrieve. |
| `PATCH` | `/api/v1/users/helpers/{id}/` | Partial update. |
| `DELETE` | `/api/v1/users/helpers/{id}/` | Soft delete. |
| `PATCH` | `/api/v1/users/helpers/{id}/status/` | **`is_active`** only. |
| `POST` | `/api/v1/bulk-imports/` | CSV bulk with **`model_name=helper`**. |

---

## 6. Data Model Details & Indexes

### 6.1 Indexes for Performance and Integrity

Uniqueness is implemented via **`django.db.models.UniqueConstraint`** on **`Helper`** (see **`apps/users/models.py`**). Illustrative SQL:

```sql
CREATE UNIQUE INDEX idx_helper_emp_id ON helpers(tenant_id, employee_id) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_helper_contact ON helpers(tenant_id, contact_number) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_helper_nid ON helpers(tenant_id, national_id_number) WHERE national_id_number IS NOT NULL AND deleted_at IS NULL;
CREATE UNIQUE INDEX idx_helper_user_id ON helpers(tenant_id, user_id) WHERE user_id IS NOT NULL AND deleted_at IS NULL;
-- helper_assignments: not in current schema
```

---

## 7. Testing Strategy (Target >80% Coverage)

**Implementation note:** Tests below that reference **`availability_status`**, **`HelperAssignment`**, or trip-driven status flips describe **target** behaviour once those models and services exist; current tests should focus on **`Helper`** constraints, **`HelperViewSet`**, and **`HelperImportConfig`**.

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
- **[User & tenant management](../01-foundation/user-tenant-management.md)** - Users, tenants, and identity lifecycle.
- **[Trip Management](../05-transport/trip-management.md)** - How helpers are utilized during trip execution.

**Related User Stories:**
- US-061: Helper Profile (MDM-07)

**Source**: PRD_DFMS_v1.0.md
