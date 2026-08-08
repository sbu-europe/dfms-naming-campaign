---
module: 02-master-data
specification: Vehicle Master Data Management
version: 1.2
phase: Phase 1
source_document: PRD_DFMS_v1.0.md
last_updated: 2026-07-06
related_stories: US-053
---

# Vehicle Master Data Management Specification

## Overview

The Vehicle Master Data Management module provides centralized management of all fleet vehicles for the DFMS platform. Accurate vehicle information is the foundation of all fleet management operations, enabling trip planning, vehicle assignment, fleet utilization tracking, maintenance scheduling, compliance management, and cost allocation. The system supports comprehensive vehicle profiles, dynamic operational status tracking, and bulk data operations.

**Brand master data (prerequisite for brand selection on vehicles):** Vehicle **brand** is not free text. Each tenant maintains a **Brands** catalog (separate menu, Tenant Admin). When creating or editing a vehicle, **Brand** is an **optional** dropdown listing only brands defined for that tenant. If no brand applies, the field is left empty.

---

## 1. Vehicle Data Model

### 1.0 Brand Entity Structure (Tenant-Scoped Master)

Brands are maintained under **Master Data → Brands** (or equivalent navigation). Only users with Tenant Admin (or role granted brand maintenance) can create, edit, or deactivate brand records. Transport Planners and other roles **consume** the list when registering vehicles but do not manage the catalog unless RBAC allows it.

```typescript
Brand {
  id: UUID (PK, auto-generated)
  tenant_id: UUID (FK)
  
  brand_name: string // Unique per tenant (case-insensitive or normalized per product rules), indexed
  is_active: boolean // Inactive brands hidden from vehicle dropdown but preserved for historical vehicles
  
  // Metadata
  created_at: Timestamp
  created_by: UUID
  updated_at: Timestamp
  updated_by: UUID
}
```

**Business rules:**
- Uniqueness of `brand_name` is enforced **within a tenant** (not globally).
- Soft-deactivating a brand (`is_active = false`) removes it from **new** vehicle selections; vehicles already linked keep their reference (display resolved via join or snapshot policy—implementation choice; prefer retaining FK for integrity).
- Optional: bulk CSV may accept a **brand name** column that is matched to an existing Brand row for the tenant; unknown names fail validation or are rejected per import rules in **[bulk-import-export.md](bulk-import-export.md)** (`VehicleImportConfig` / registry).

### 1.1 Vehicle Entity Structure

```typescript
Vehicle {
  id: UUID (PK, auto-generated)
  tenant_id: UUID (FK)
  
  // Identification
  registration_number: string (unique per tenant, indexed)
  chassis_number: string (unique per tenant, indexed)
  brand_id: UUID (FK to Brand, nullable) // Optional; selected from tenant brand dropdown
  model_name: string (nullable)
  year_of_manufacture: integer (nullable)
  vehicle_color: string (nullable)
  
  // Configuration & Capacity
  vehicle_type: enum ['Pickup Van', 'Open Truck', 'Covered Truck', 'Nosimon', 'Auto', 'Tom Tom', 'Tractor', 'Primemover', 'Poultry Carrier', 'Tipper', 'Delivery Van']
  body_type: enum ['Open Body', 'Closed Body', 'Container', 'Flatbed', 'Tanker', 'Refrigerated', 'Lowbed']
  fuel_type: enum ['Diesel', 'Petrol', 'CNG', 'Electric', 'Hybrid', 'LPG']
  capacity_tonnage: Decimal // Max load capacity in Ton
  number_of_wheels: integer
  allowed_product_category: enum ['FM', 'RM', 'Both', 'Byproducts', 'Machineries'] (nullable)
  
  // Tracking & Telematics
  gps_tracker_id: string (nullable) // device IMEI — GPS sync key
  sim_number: string (nullable) // SIM in the GPS tracker device (not driver phone); BD mobile E.164
  initial_odometer_reading: Decimal (KM, nullable)
  current_odometer_reading: Decimal (KM, nullable)
  average_mileage: Decimal (KM, nullable)
  total_distance_travelled: Decimal (KM, nullable)
  
  // Assignments
  assigned_driver_id: UUID (FK to Driver, nullable)
  assigned_poi_id: UUID (FK to POI, nullable)
  
  // Compliance & Lifecycle
  purchase_date: Date (nullable)
  fitness_expiry: Date (nullable)
  insurance_expiry: Date (nullable)
  remarks: text (nullable)
  
  // Status (see §3 — Vehicle Operational Status, current: V3)
  operational_status: enum ['no_active_to', 'scheduled', 'in_transit', 'under_maintenance', 'inactive'] // System/workflow-controlled
  is_active: boolean // Master data lifecycle flag (separate from operational_status)
  
  // Metadata
  created_at: Timestamp
  created_by: UUID
  updated_at: Timestamp
  updated_by: UUID
}
```

### 1.2 Bulk Upload Log Entity Structure

```typescript
BulkUploadLog {
  id: UUID (PK)
  tenant_id: UUID (FK)
  entity_type: string // e.g., "Vehicle"
  file_name: string
  uploaded_by: UUID (FK to User)
  uploaded_at: Timestamp
  total_rows: integer
  successful_rows: integer
  failed_rows: integer
  error_details: JSONB // Stores failed rows with error reasons
  status: enum ['In_Progress', 'Completed', 'Failed']
}
```

---

## 2. Vehicle Master Data Management

### 2.1 Vehicle Creation

**Creation Workflow**:
```
1. User (Tenant Admin or Transport Planner) navigates to Vehicle creation form.
2. User fills in Basic Information (Registration, Type, Capacity, Body Type, Fuel Type).
3. User fills in Details (Brand optional dropdown from tenant Brands, Model, Year, Chassis Number, Wheels).
4. User uploads/enters Documents info (Insurance Expiry, Fitness Expiry).
5. User provides Additional Info (Purchase Date, Remarks, Assigned Driver, Assigned POI).
6. System performs real-time inline validation.
7. System validates uniqueness of Registration Number and Chassis Number per tenant.
8. System validates referential integrity (POI and Driver must exist and be active).
9. Vehicle record is created and uniquely identified.
```

**Validation Rules**:
```typescript
{
  // Mandatory Fields (Required during creation)
  registration_number: {
    required: true,
    unique_per_tenant: true,
    format: "Bangladesh vehicle registration format (e.g., Dhaka Metro-GA-11-1234)"
  },
  chassis_number: {
    required: true,
    unique_per_tenant: true,
    format: "VIN format"
  },
  vehicle_type: { required: true },
  body_type: { required: true },
  fuel_type: { required: true },
  capacity_tonnage: { required: true, min: 0 },
  number_of_wheels: { required: true, type: 'numeric' },
  model_name: { required: true },
  is_active: { required: true },
  fitness_expiry: { required: true },
  insurance_expiry: { required: true },
  
  // Optional Fields (Can be null during creation)
  assigned_poi_id: {
    required: false,
    exists: true,
    is_active: true
  },
  assigned_driver_id: {
    required: false,
    exists: true,
    is_active: true
  },
  brand_id: {
    required: false,
    exists: true,
    is_active: true, // Brand must belong to same tenant and be active for new selection
    same_tenant: true
  },
  allowed_product_category: {
    required: false,
    enum: ['FM', 'RM', 'Both', 'Byproducts', 'Machineries']
  },
  
  // Read-Only / Excluded Fields (Ignored during creation)
  // Mileage fields exist in the model but MUST NOT be required or accepted during vehicle creation.
  // They are populated later via GPS integration or post-trip execution.
  initial_odometer_reading: { read_only: true },
  current_odometer_reading: { read_only: true },
  average_mileage: { read_only: true },
  total_distance_travelled: { read_only: true }
}
```

### 2.2 Implementation note (nourish-backend)

The **`Vehicle`** model in **`apps/master_data`** deliberately keeps **many fields optional** (e.g. `chassis_number`, `body_type`, `fuel_type`, `capacity`, `number_of_wheels`, `model_name`, `fitness_expiry_date`, `insurance_expiry_date`) with database-level **null/blank** allowed. Import configs and forms may still require subsets for CSV or business rules.

**Load capacity** is stored as **`capacity`** + **`capacity_unit`** (MT, KG), not a single `capacity_tonnage` field.

**`allowed_product_category`** values in the database use **lowercase** keys (`fm`, `rm`, …) with human-readable labels.

Telematics fields are **read-only** in **`VehicleAdmin`** after save; **`operational_status`** is **not** editable in admin on the change form (system/workflow owns transitions except **inactive → maintenance** / re-activation rules enforced in **`save_model`**).

---

## 3. Vehicle Operational Status

**Code:** `apps/master_data.models.OperationalStatus` on `Vehicle.operational_status`  
**Current version:** **V3** (2026-07-08)  
**Scope:** Own-fleet vehicles linked to Transport Orders via `TransportOrder.vehicle`. Vendor-fleet TOs without a `Vehicle` row are out of scope for this enum.

This section is the **single source of truth** for vehicle operational status labels, transition logic, and version history. Older PRD sketches (`ACTIVE`, `IN_TRIP`, `available`/`assigned` in contracts) are superseded here.

---

### 3.1 Version history

| Version | Date | Summary |
|---------|------|---------|
| **V1** | 2026-04-17 (initial MDM spec) | Five workflow statuses: `available`, `active`, `idle`, `scheduled`, `under_maintenance`. Default on create/re-activation: **`available`**. `active` often **derived at display time** (e.g. Live GPS) when a trackable trip existed, even if DB still said `available`. `scheduled` existed in the enum but was **not** consistently driven by TO assignment. |
| **V2** | 2026-07-06 | **TO-driven model.** Removed `available`, `active`, and `idle`. Four statuses only: **`no_active_to`**, **`scheduled`**, **`in_transit`**, **`under_maintenance`**. Status is set by **Transport Order lifecycle hooks** (assignment, trip start, TO terminal states, unassignment). **`under_maintenance` logic unchanged** from V1 (master-data inactive flag, DS-01 maintenance queue, assignment guards). Idle/unassigned fleet state is expressed as **`no_active_to`** (replaces V1 `available` / `idle`). Active execution is **`in_transit`** (replaces V1 `active` and Live GPS derivation). |
| **V3** | 2026-07-08 | **Split `inactive` out of `under_maintenance`.** New fifth status **`inactive`** for master-data-deactivated vehicles (`is_active=false`). **`under_maintenance` is now exclusively driver-supervisor-driven** (DS-01 mark-under-maintenance, failed/rejected inspection) and always keeps `is_active=true`. Deactivating a vehicle now sets **`inactive`** instead of `under_maintenance` (admin `save_model`, `VehicleStatusSerializer`, serializer create/update, bulk import, `refresh_vehicle_operational_status`). **Live GPS:** inactive vehicles are **hidden from the fleet list + map by default**, shown when the vehicle-status filter explicitly selects **Inactive** **or** while the vehicle is still **in-flight** (mid-trip vehicles stay visible until their trip ends, and the map shows their live `In-transit` status — display-only, DB stays `inactive`). Re-activation resets to `no_active_to`. **Deactivation affects future work only:** `inactive` vehicles are excluded from **new** TDO assignments, but a vehicle deactivated after it was already assigned/dispatched **may still complete its current trip** — execution (`validate_for_driver_execution`) does **not** block on `inactive` (contrast `under_maintenance`, which does). |

**What changed V1 → V2**

1. **Removed `available`** — no longer a stored or displayed operational status; unassigned idle fleet uses **`no_active_to`**.
2. **Removed `active` and `idle`** — replaced by **`in_transit`** (executing a started TO) and **`no_active_to`** (nothing scheduled or running).
3. **`scheduled` is now TO-driven** — set when a vehicle is assigned to a **non-terminal** TO **before** the driver presses **Start Trip** (including future-dated work, e.g. assigned today for tomorrow's run).
4. **`in_transit` is explicit** — from **Start Trip** (`execute_trip_start`: TO `ready_for_dispatch` → lane-specific `driving_towards_*`) through full execution (yard, scale, QC, load/unload) until the TO reaches a **terminal** status.
5. **`under_maintenance` unchanged** — same triggers, guards, DS-01 maintenance-clearance flow; on pass or re-activation, vehicle returns to **`no_active_to`** (was **`available`** in V1).
6. **Evaluation priority** — when determining effective status: **Under Maintenance** → **In-transit** → **Scheduled** → **No Active TO**.

---

### 3.2 Current model (V2) — statuses and meaning

**Master data flag (`is_active`)** — unchanged from V1:

- **`true`**: Vehicle is part of the operational fleet.
- **`false`**: Retired/sold/off-fleet; forces **`inactive`** on `operational_status` (V3; was `under_maintenance` in V1/V2).

**Operational status (`operational_status`)** — V3 values (`OperationalStatus`):

| DB value | Display label | Meaning |
|----------|---------------|---------|
| `no_active_to` | No Active TO | Default idle state: not under maintenance, not assigned to an active TO, not executing a trip. Replaces V1 **Available** and **Idle**. |
| `scheduled` | Scheduled | Vehicle is linked to a **non-terminal** TO (`TransportOrder.vehicle` set) but the driver has **not** started the trip yet. Applies immediately on assignment, regardless of planned delivery time. |
| `in_transit` | In-transit | Vehicle is **actively serving** a TO from **Start Trip** until the TO ends (terminal status). Covers driving legs, at source/destination, and all yard execution sub-states on the TO. Replaces V1 **Active**. |
| `under_maintenance` | Under Maintenance | Workshop / blocked from assignment. **Driver-supervisor-driven only** (DS-01 maintenance actions, failed pre-dispatch inspection). Always keeps `is_active=true`. |
| `inactive` | Inactive | Master-data-deactivated vehicle (`is_active=false`): retired/sold/off-fleet. Excluded from assignment, and hidden from the Live GPS fleet list/map by default (V3). |

---

### 3.3 V2 transition logic (workflow-owned)

`operational_status` is **not** editable on the vehicle change form in admin (system/workflow owns transitions). Exception: **`is_active`** toggles still force maintenance / re-activation rules in `VehicleAdmin.save_model` and `VehicleStatusSerializer` (unchanged intent; target idle status is now **`no_active_to`**).

```typescript
// Priority when resolving effective status (highest wins)
1. IF is_active == false:
       → inactive
2. ELSE IF operational_status == 'under_maintenance':   // supervisor-driven, is_active stays true
       → under_maintenance
3. ELSE IF vehicle has started TO execution (trip started, non-terminal TO):
       → in_transit
4. ELSE IF vehicle assigned to non-terminal TO (vehicle_id set, trip not started):
       → scheduled
5. ELSE:
       → no_active_to

// Triggers (implement in transport / fleet_supervisor services)
ON TDO assigns vehicle to TO (vehicle_id set, TO not terminal):
    SET operational_status = 'scheduled'

ON Driver / vendor Start Trip (TO: ready_for_dispatch → driving_towards_*):
    SET operational_status = 'in_transit'

ON TO reaches terminal status (cancelled | completed | closed)
   OR vehicle unassigned from TO
   OR no other non-terminal TO holds this vehicle:
    SET operational_status = 'no_active_to'
    // If immediately assigned to another TO → 'scheduled'

ON is_active false → true (re-activation):
    SET operational_status = 'no_active_to'   // was 'available' in V1

ON is_active == false:
    SET operational_status = 'inactive'   // V3 (was 'under_maintenance' in V1/V2)

ON DS-01 maintenance clearance passed (Vehicle OK):
    SET operational_status = 'no_active_to'   // was 'available' in V1

ON mark under maintenance / failed pre-dispatch inspection:
    SET operational_status = 'under_maintenance'   // supervisor-driven; keeps is_active=true
```

**TO statuses that imply `scheduled` (vehicle assigned, trip not started):** typically `assigned`, `ready_for_dispatch`, and `under_planning` when the vehicle link is retained.

**TO statuses that imply `in_transit` (after Start Trip):** `driving_towards_source`, `at_source`, `loaded_pickup_completed`, `driving_towards_destination`, `at_destination`, `delivered_unloaded`, and legacy `in_progress`.

**Terminal TO statuses** (release vehicle → `no_active_to` unless reassigned): `cancelled`, `completed`, `closed`.

**Start Trip entry point:** `apps/transport/trip_start_service.execute_trip_start` (own fleet driver action; vendor fleet equivalent via advance-status).

**Refresh hook (V2 sync):** `apply_to_status_transition()` calls `refresh_vehicle_operational_status_for_transport_order()` on **every** TO status change (not only terminal states). Direct assignment paths (`TDOAssignmentService._try_transition_to_assigned`, `TransportOrderAdmin.save_model` for own fleet) also refresh when the linked vehicle may have changed. One-off repair: `python manage.py reconcile_vehicle_operational_status` (supports `--dry-run`, `--schema`).

---

### 3.4 Assignment and exclusion rules (V2)

```typescript
Status Rules:
  IF is_active == false (operational_status == 'inactive')
     OR operational_status == 'under_maintenance':
      EXCLUDE from TDO assignment dropdowns
      PREVENT assignment to trips

  IF operational_status == 'in_transit' OR operational_status == 'scheduled':
      PREVENT assignment to another active TO (one vehicle per non-terminal TO)

  IF is_active transitions from false TO true:
      SET operational_status = 'no_active_to'

  IF is_active == false:
      FORCE operational_status = 'inactive'   // V3 (was 'under_maintenance')
```

**Live GPS display (V3):** `inactive` vehicles are hidden from the fleet list and map by default; they appear when the vehicle-status filter explicitly selects **Inactive**, **or** while the vehicle is still **in-flight** (has a trackable trip / an in-progress transport order) — a vehicle deactivated mid-trip stays visible until its trip ends. **While in-flight, the map shows the vehicle's live running status (`In-transit`), not `Inactive`** (`_live_map_operational_status`); the stored DB status remains `inactive` (display-only override). Once the trip is terminal the vehicle reverts to `Inactive` and is hidden by default. `under_maintenance` (supervisor-driven) is always shown.

**Execution vs assignment (V3):** deactivation blocks **new** assignments (assignment dropdowns/guards exclude `inactive`), but does **not** interrupt work already assigned. A vehicle deactivated after assignment/dispatch may still **start and complete its current trip** — `validate_for_driver_execution` blocks only `under_maintenance`, not `inactive`.

Live GPS and list filters should use the **same V2 values**; the V1 computed overlay (`no_to` / forced `active` on map) is retired in favour of persisted or centrally resolved V2 status.

---

### 3.5 Integration points

| Module | Responsibility |
|--------|----------------|
| `apps/transport` (`TDOAssignmentService`, `trip_start_service`, `apply_to_status_transition`, `FleetAvailabilityService`, `VehicleAvailabilityView`) | Set `scheduled` on assign; `in_transit` on trip start; `no_active_to` on terminal TO / unassign; **`apply_to_status_transition` refreshes vehicle status on every TO transition**; fleet counts/lists exclude `under_maintenance` and vehicles on non-terminal TOs (V2; replaces V1 `status=available`) |
| `apps/master_data` (`vehicle_operational_status`, `reconcile_vehicle_operational_status` command, `VehicleAdmin`, `VehicleStatusSerializer`, import configs) | Reconcile `operational_status` from active TOs; `is_active` ↔ maintenance rules; default `no_active_to` on create; manual backfill command |
| `apps/fleet_supervisor` (DS-01) | `under_maintenance` on flag/fail; `no_active_to` on maintenance clearance pass |
| `apps/tracking` (Live GPS) | Filter/display V2 statuses; align `vehicle_status_filters` with `OperationalStatus` |

**Related:** [Transport Order status lifecycle](../05-transport/transport-order-management.md), [Driver Supervisor operations (DS-01)](../08-fleet-management/driver-supervisor-operations.md), [Trip Start / TLS-01](../05-transport/transport-lifecycle-pod-sprint4.md).

---

## 4. Bulk Upload & Inline Management

**Implementation plan:** Vehicle bulk CSV import/export follows the shared pipeline in **[bulk-import-export.md](bulk-import-export.md)** (`BulkImportJob`, `validate_bulk_import` / `execute_bulk_import`, `BulkImportExportMixin` on `VehicleAdmin`). The workflow below describes UX intent; where it differs from the canonical spec (e.g. append-only vs `update_or_create` by natural key), resolve in favour of **bulk-import-export.md** for Phase 1 code.

### 4.1 CSV Bulk Upload

**Workflow**:
1. User downloads vehicle-specific CSV template (includes mandatory fields marked, date type hints, sample values).
2. User uploads populated CSV file (UTF-8 encoded).
3. System processes upload with **append-only behavior** (existing records are NOT overwritten by default).
4. System validates each row independently. Duplicate registration/chassis numbers are rejected.
5. System reports successful rows and failed rows with detailed error reasons.
6. System logs the entire action in `BulkUploadLog`.

### 4.2 Inline Editing

- **Row/Column Level**: System supports inline editing directly from the vehicle list view.
- **Save Behavior**: Changes are saved immediately or via an explicit save action.
- **Audit**: All inline changes must be audit logged.

---

## 5. Vehicle Search & Filtering

### 5.1 Search Capabilities

**Search Fields**:
- Registration Number (Real-time search)
- Chassis Number

### 5.2 Filtering Capabilities

**Filters**:
- Operational Status
- Vehicle Type
- Brand (optional; filter by linked Brand)
- Assigned POI (Depot)
- Ownership (Derived from or mapped if applicable)
- Advanced search with combined filters supported.

---

## 6. Integration Points & Business Rules

### 6.1 Transport Orders & Trips
- **Single Active Trip**: One vehicle can only be assigned to one active trip at a time.
- **Vehicle-Driver Binding**: When a vehicle is assigned to a TO, a driver must also be assigned.
- **Maintenance Exclusion**: Vehicles under maintenance cannot be assigned to trips.

### 6.2 Mileage Tracking
- **Vendor Vehicles**: Mileage tracking validation is not required for vendor-owned vehicles.
- **GPS Integration**: Mileage data (initial, current, average, total) is updated post-trip execution or via GPS device integration.

### 6.3 Referential Integrity
- **POI & Driver**: Vehicle must be assigned to an existing active POI and an existing active driver.
- **Brand**: When `brand_id` is set, it must reference a Brand in the same tenant; for new assignments, the Brand should be active (vehicles may retain a link to a later-deactivated Brand per lifecycle policy above).

---

## 7. Data Model Details

### 7.1 Indexes for Performance

```sql
CREATE INDEX idx_vehicle_tenant_active ON vehicles(tenant_id, is_active);
CREATE INDEX idx_vehicle_registration ON vehicles(registration_number, tenant_id);
CREATE INDEX idx_vehicle_chassis ON vehicles(chassis_number, tenant_id);
CREATE INDEX idx_vehicle_status ON vehicles(operational_status);
CREATE INDEX idx_vehicle_poi ON vehicles(assigned_poi_id);
CREATE INDEX idx_vehicle_brand ON vehicles(brand_id); -- nullable FK; index supports filter/join
```

### 7.2 Audit Trail

All changes to vehicle records, including creation, updates, status changes, and bulk uploads, must be logged with the user ID, timestamp, and changed fields to maintain a complete history.

---

## 8. API Endpoints Implementation Plan

The API will follow RESTful principles, utilizing JSON for payload and responses. Standard HTTP methods will be used.

### 8.0 Brand CRUD (Tenant-Scoped)

| Method | Endpoint | Description | Implementation Details |
|---|---|---|---|
| GET | `/api/v1/brands` | List brands | Query: `?search=`, `?is_active=`, `?page=`, `?per_page=`. Used to populate vehicle brand dropdown |
| POST | `/api/v1/brands` | Create brand | Enforce unique `brand_name` per tenant. Tenant Admin (or delegated role) |
| GET | `/api/v1/brands/{id}` | Get brand | |
| PUT / PATCH | `/api/v1/brands/{id}` | Update brand | |
| DELETE | `/api/v1/brands/{id}` | Deactivate / soft-delete brand | Prefer soft delete; hide from dropdowns for new vehicles |

Vehicle create/update payloads use `brand_id` (nullable UUID), not a free-text brand string.

### 8.1 Vehicle CRUD & Status

| Method | Endpoint | Description | Implementation Details |
|---|---|---|---|
| GET | `/api/v1/vehicles` | List vehicles | Support query params: `?search=`, `?status=`, `?type=`, `?brand_id=`, `?poi_id=`, `?page=`, `?per_page=` |
| POST | `/api/v1/vehicles` | Create vehicle | Validate uniqueness of `registration_number` and `chassis_number` per tenant. Validate FKs including optional `brand_id` |
| GET | `/api/v1/vehicles/{id}` | Get vehicle details | Include joined POI and Driver details |
| PUT | `/api/v1/vehicles/{id}` | Update vehicle | Full update. Validate FKs and uniqueness |
| PATCH | `/api/v1/vehicles/{id}` | Inline edit | Partial update for row/column level editing |
| PATCH | `/api/v1/vehicles/{id}/status` | Update status | Update `operational_status` or `is_active`. Enforce transition rules |
| DELETE | `/api/v1/vehicles/{id}` | Delete vehicle | Soft delete. Require `delete_reason` in payload |
| GET | `/api/v1/vehicles/{id}/history` | Get vehicle history | Return trips, maintenance, and incident history |

### 8.2 Bulk Operations

REST bulk endpoints below are the **intended API surface**; wire them to the same services and Celery tasks as in **[bulk-import-export.md](bulk-import-export.md)** §10 (`BulkImportViewSet` / `BulkExportViewSet`, `model_name=vehicle`) so admin and API stay consistent.

| Method | Endpoint | Description | Implementation Details |
|---|---|---|---|
| POST | `/api/v1/vehicles/bulk-upload` | Bulk upload CSV | Accept multipart/form-data. Append-only logic. Create `BulkUploadLog` |
| GET | `/api/v1/vehicles/bulk-upload/{upload_id}` | Get upload status | Return progress, success/fail counts, and error details |
| GET | `/api/v1/vehicles/bulk-upload/template` | Download CSV template | Stream CSV with headers, mandatory markers, and sample row |

---

## 9. Unit Testing Strategy

The testing strategy focuses on data integrity, complex validation rules, and bulk operation robustness.

### 9.1 Test Coverage Targets
- **Models/Business Logic**: 90%+
- **API/Views**: 85%+
- **Serializers/Validators**: 90%+

### 9.2 Core Test Cases

**1. Model & Validation Tests:**
- *Uniqueness*: Verify that saving two vehicles with the same `registration_number` or `chassis_number` under the same tenant raises an IntegrityError.
- *Tenant Isolation*: Verify that duplicate registration numbers across *different* tenants succeed.
- *Referential Integrity*: Verify that assigning a non-existent or inactive POI/Driver fails validation; optional `brand_id` must belong to the same tenant and active Brand when policy requires active-only selection.
- *Format Validation*: Test regex validation for Bangladesh vehicle registration format and VIN format for chassis number.
- *Mileage Field Isolation*: Verify that attempting to set `initial_odometer_reading` or other mileage fields during `POST /api/v1/vehicles` is ignored or rejected, ensuring they are strictly read-only during creation.
- *Allowed Product Category*: When provided, `allowed_product_category` must be one of FM, RM, Both, Byproducts, Machineries; invalid values are rejected.

**2. API Endpoint Tests:**
- *List/Filtering*: Test `GET /api/v1/vehicles` with combinations of filters (`operational_status`, `vehicle_type`, `assigned_poi_id`). Ensure pagination works.
- *Status Management*: Test `PATCH /api/v1/vehicles/{id}/status`. Verify transitions, ensure vehicles under maintenance or `is_active=false` are correctly flagged, and verify that setting `is_active=true` automatically sets `operational_status='no_active_to'` (V2; was `available` in V1).
- *Soft Deletion*: Test `DELETE /api/v1/vehicles/{id}`. Verify `is_active` flips to false and a reason is logged.
- *RBAC/Security*: Verify that only Tenant Admin or Transport Planner roles can create/update vehicles, while other roles receive `403 Forbidden`.

**3. Bulk Upload Tests:** (align with **[bulk-import-export.md](bulk-import-export.md)** §9 — registry, `ImportService`, admin views)
- *Append-Only Logic*: Upload a CSV with new records and existing records. Verify new records are created and existing ones are skipped/flagged as errors, without overwriting.
- *Error Reporting*: Upload a CSV with missing mandatory fields (e.g., no vehicle type). Verify the response includes detailed row-level error messages.
- *Template Generation*: Verify the template endpoint returns a properly formatted CSV.
- *Edge Cases*: Test bulk upload with large files (e.g., 1000+ rows), invalid UTF-8 encoding, and malformed CSV structures to ensure graceful error handling.

**4. Business Rules Tests:**
- *Maintenance/Inactive Exclusion*: Attempt to assign a vehicle with `operational_status = 'under_maintenance'` or `is_active = false` to a mock trip (should fail).
- *TO-driven status (V2)*: Assign vehicle to TO → `scheduled`; Start Trip → `in_transit`; complete/close/cancel TO → `no_active_to`.
- *Single Active Trip*: Attempt to assign a vehicle already `scheduled` or `in_transit` on another active TO (should fail).
- *Audit Trail Verification*: Trigger a PUT request to update a vehicle's color. Verify that an audit log record is created containing the `changed_fields` JSON and correct user ID.

---

## 10. Related Documentation

- **[Bulk Import & Export](bulk-import-export.md)** - Shared CSV bulk import/export for Vehicle (and other master entities)
- **Brands** — Tenant-scoped master catalog; UI menu for Tenant Admin; vehicles reference `brand_id` (this document, §1.0, §8.0).
- **[POI Management](poi-management.md)** - Location master data (Vehicle assignment)
- **[Transport Order Execution](../05-transport/README.md)** - Vehicle assignment workflows
- **[Trip Lifecycle Management](../05-transport/trip-management.md)** - Trip execution (triggers `in_transit` via Start Trip)

**Related User Stories:**
- US-053: Vehicle Registration & Master Data Management
- US-015: Fleet Health Dashboard
- US-020: TO Execution - Own Fleet
- US-025: Trip Lifecycle Management

**Source**: PRD_DFMS_v1.0.md
