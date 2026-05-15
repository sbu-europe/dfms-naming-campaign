---

## module: 08-fleet-management
specification: Driver Supervisor Operations
version: 2.2
phase: Phase 1
sprint: Sprint 4
last_updated: 2026-05-15
related_stories: DFS-050 (DS-01), DFS-051 (DS-02)
jira_epic: DFS-070

# Driver Supervisor Operations Specification

## Overview

The **Driver Supervisor Operations** specification covers pre-dispatch vehicle inspections (optional checklist for own fleet), driver state management, workforce attendance, and leave management. **As implemented**, the inspection and dispatch gate applies when a Transport Order is already **Ready for Dispatch** (after TDO has assigned resources and set ETA per `TDOAssignmentService` in `apps/transport/services.py`). The supervisor either **skips inspection** and dispatches immediately or **starts** a pending `VehicleInspection`, completes the checklist, and then the TO moves to **Dispatched** (own fleet also transitions the linked `Trip` via `dispatch_to_after_ready` in `apps/fleet_supervisor/services.py`).

Unlike master data management (MDM-05 Vehicle, MDM-06 Driver from Sprint 2), this module captures **operational truths** — daily inspections, driver state transitions, attendance, leave windows, and maintenance decisions — that change frequently and gate field execution.

**Module path**: `apps/fleet_supervisor/` — **standalone tenant Django app** (not nested under `users`).

**Rationale (implementation plan)**: Driver supervisor operations are a distinct bounded context (fleet readiness, inspections, attendance, leave) with their own models, admin, URLs, and migrations. A separate app keeps `apps/users` focused on identity and the `Driver` aggregate while avoiding a "junk drawer" package; it still depends on `users.Driver`, `master_data.Vehicle`, and `transport.TransportOrder` via FKs only.

**App setup**: Register in `TENANT_APPS` in Django settings. Create `apps/fleet_supervisor/apps.py` with:

```python
from django.apps import AppConfig

class FleetSupervisorConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.fleet_supervisor"
    label = "fleet_supervisor"
    verbose_name = "Fleet Supervisor"
```

**Legacy note**: A historical `apps/users/supervisor` package still exists in the repository tree but is **not** listed in `INSTALLED_APPS`. Production tenants use `apps.fleet_supervisor` only (`TENANT_APPS` in `config/settings/base.py`). If an old tenant schema ever had a different app label for the same tables, reconcile `django_migrations` before applying `fleet_supervisor` migrations.

**Dependencies**: MDM-05 (Vehicle), MDM-06 (Driver / `users.Driver`), `05-transport` (TO execution state), `01-foundation` (RBAC)
**Enables**: Supervisor dispatch (skip vs checklist) after TDO ready-for-dispatch, TDO assignment conflict checks (leave / under-maintenance vehicle), driver execution guards (partial — see §6.5), fleet readiness views in admin/API

---

## 0. Menu Structure & Navigation

### 0.1 Implemented portal sidebar (code)

Tenant portal navigation is **not** a nested tree in the API. It is defined in `apps/core/portal_navigation.py` as `PORTAL_NAV_SECTIONS` and exposed via `build_portal_navigation()` as:

`{ "sections": [ { "heading", "icon", "items": [ { "id", "label", "url", "icon" } ] } ] }`

**Rules today**

- **Flat structure**: each **section** has a `heading` and a list of **items**; each item is a **single** link (typically a Django Admin `url`). There is no first-class "folder" item with child rows — deeper IA is expressed as **separate sibling links** or **in-page** tabs/routes on the target screen.
- **Visibility**: `_item_visible()` grants an item if the user matches `permission_any` (resolved permission codes must intersect the item's list), or matches optional `role_any` (OR shortcut before permission check), unless blocked by `role_exclude`.
- **Platform admin** uses `PLATFORM_NAV_SECTIONS` only (tenant ops menus are omitted).

**Implemented in code**: `PORTAL_NAV_SECTIONS` in `apps/core/portal_navigation.py` includes a **Fleet operations** block with these tenant portal links (flat items):

| Item id | Label | Admin URL | `permission_any` (any one grants) | `role_any` |
| --- | --- | --- | --- | --- |
| `fleet_dispatch_queue` | Dispatch queue | `/admin/fleet_supervisor/vehicleinspection/dispatch-queue/` | `FLEET_DS_INSPECTION_VIEW_QUEUE`, `FLEET_DS_INSPECTION_SUBMIT` | `driver_supervisor`, `tdo_own_fleet` |
| `fleet_inspection_queue` | Inspection records | `/admin/fleet_supervisor/vehicleinspection/` | same as above | `driver_supervisor`, `tdo_own_fleet` |
| `fleet_attendance` | Driver Attendance | `/admin/fleet_supervisor/driverattendance/` | `FLEET_DS_ATTENDANCE_WRITE`, `FLEET_DS_ATTENDANCE_READ` | `driver_supervisor` |
| `fleet_leave` | Driver Leave | `/admin/fleet_supervisor/driverleave/` | `FLEET_DS_LEAVE_WRITE`, `FLEET_DS_LEAVE_READ` | `driver_supervisor` |
| `fleet_working_hours_config` | Working Hours Config | `/admin/fleet_supervisor/workinghoursconfig/` | `FLEET_DS_ATTENDANCE_WRITE` | `driver_supervisor` |

**Not linked from the portal today** (models are registered in `apps/fleet_supervisor/admin.py`; open by URL or app index): **Checklist Sections / Items** (`/admin/fleet_supervisor/checklistsection/`), **Driver State Logs** (`/admin/fleet_supervisor/driverstatelog/`).

Re-seed RBAC (`python manage.py seed_dfms_rbac`) after permission catalog changes so roles receive new permission rows; users may need to **log out and back in** (permission cache TTL ~5 minutes).

### 0.2 Fleet operations — information architecture vs portal (as implemented)

The tree below remains useful **product language**; the **tenant portal** currently exposes only the items in §0.1 (dispatch queue, inspection records, attendance, leave, working hours). **Checklist reference** and **driver state log** admins exist but are reached via Django admin URLs, not sidebar links.

**Sprint 4 binding**: Attendance “grid”, leave “calendar”, and the state audit trail are **Django Admin** changelists (`DriverAttendanceAdmin`, `DriverLeaveAdmin`, `DriverStateLogAdmin`) — not standalone SPAs.

```
Fleet operations (portal + admin)
├── Dispatch queue (portal)          — TOs Ready for Dispatch; skip inspection or open checklist
├── Inspection records (portal)     — VehicleInspection changelist + change form + submit / reject
├── Checklist reference (admin URL) — ChecklistSection / ChecklistItem read-only
├── Driver state log (admin URL)    — DriverStateLog read-only audit ("state board" data shape)
├── Driver Attendance (portal)
└── Driver Leave + Working Hours Config (portal)
```

### Role → menu mapping


| Role              | Portal Fleet operations links (§0.1) | Checklist / state log (admin URLs) | Master Data (Driver/Vehicle) |
| ----------------- | -------------------------------------- | ------------------------------------ | ---------------------------- |
| Driver Supervisor | ✓ (per permissions)                  | ✓ with fleet permissions           | — (unless separate MDM perms) |
| Tenant Admin      | ✓ (tenant admin bypass in fleet admin) | ✓                                  | ✓ (master CRUD)              |
| TDO               | ✓ dispatch + inspection **read** (VIEW_QUEUE; SUBMIT only for roles that have it) | State log: **not** in portal; has `FLEET_DS_DRIVER_STATE_VIEW` for API/admin URL | — (no default MDM write)     |
| Driver            | —                                      | —                                    | —                            |

### Screen hierarchy (aligned with code)

**Sprint 4:** Primary supervisor vehicle flow uses **Django Admin** custom views + templates under `templates/admin/fleet_supervisor/`.

```
Fleet operations → Supervisor dispatch queue
  └── TOs in Ready for Dispatch
        ├── [Skip inspection] ──► TO Dispatched (Trip dispatched own fleet)
        └── [Start inspection] ──► Pending VehicleInspection + checklist inline
              ├── [Save] ──► persist checklist lines only
              ├── [Complete inspection & dispatch] (POST _submit_inspection)
              │     └── All checklist lines present → completed + TO Dispatched
              └── [Reject] (custom URL) ──► rejected + vehicle Under Maintenance + TO Under Planning
```

```
Fleet operations → Driver State Log (admin)
  └── Changelist: driver, to_state badge, from_state, timestamp, changed_by, trigger
        └── API GET /api/v1/drivers/state-board uses latest log per driver + optional POI filter

Fleet operations → Driver Attendance (portal)
  └── Same as prior spec: changelist + same-day edit/delete + CSV export action

Fleet operations → Driver Leave (portal)
  └── Changelist + overlap guard on save + admin action Cancel selected leave(s)
```
---

## 1. Roles & Access


| Role              | View Checklist Reference | Complete Inspection | Reject Vehicle | Mark Under Maintenance | Attendance CRUD | Leave CRUD | View State Board |
| ----------------- | ------------------------ | ------------------- | -------------- | ---------------------- | --------------- | ---------- | ---------------- |
| Driver Supervisor | ✓                        | ✓                   | ✓              | ✓                      | ✓               | ✓          | ✓                |
| Tenant Admin      | ✓                        | —                   | —              | —                      | Read-only       | Read-only  | Read-only        |
| TDO               | ✓                        | —                   | —              | —                      | Read-only       | Read-only  | ✓ (read-only)    |
| Driver            | —                        | —                   | —              | —                      | —               | —          | —                |


---

## 2. Data Model

> **TenantAwareModel base** (`apps/core/models.py`): All models below extend `TenantAwareModel`. This abstract base provides `id` (UUID, pk), `created_at` (DateTime, auto), `updated_at` (DateTime, auto). There is **no `tenant_id` column** — tenant isolation is enforced at the PostgreSQL schema level by django-tenants.

### 2.1 ChecklistSection (predefined, immutable)

```python
ChecklistSection {
    id: UUID (pk)                       # TenantAwareModel
    name: string                        # e.g., "Engine", "Clutch", "Gear Box"
    display_order: integer              # Section ordering (1–7)
    created_at: DateTime                # TenantAwareModel
    updated_at: DateTime                # TenantAwareModel

    class Meta:
        app_label = "fleet_supervisor"
        db_table = "fs_checklist_sections"
        ordering = ["display_order"]
}
```

**Predefined sections** (seeded in migration `apps/fleet_supervisor/migrations/0002_seed_checklist.py`):


| #   | Section   | Items Count |
| --- | --------- | ----------- |
| 1   | Engine    | 9           |
| 2   | Clutch    | 6           |
| 3   | Gear Box  | 5           |
| 4   | Container | 6           |
| 5   | Electric  | 13          |
| 6   | Chassis   | 5           |
| 7   | Cabin     | 10          |


### 2.2 ChecklistItem (predefined, immutable)

```python
ChecklistItem {
    id: UUID (pk)                       # TenantAwareModel
    section: FK → ChecklistSection
    name: string                        # e.g., "Engine Oil", "Air Filter"
    item_number: integer                # Display order within section
    remarks: text (nullable)            # Optional predefined guidance/remarks
    created_at: DateTime                # TenantAwareModel
    updated_at: DateTime                # TenantAwareModel

    class Meta:
        app_label = "fleet_supervisor"
        db_table = "fs_checklist_items"
        ordering = ["section__display_order", "item_number"]
}
```

**All items predefined and immutable** — seeded via data migration (DS-01-1). Full item list:

- **Engine** (9): Engine Oil, Air Filter, Fuel Pump, Fuel System, Brake System, R.P.M, Brake Oil, Radiator Water, Air System
- **Clutch** (6): Ease in Engagement, Lubrications, Paddle Free Play, Clutch Master Cylinder, Clutch Release Cylinder, Clutch Paddle
- **Gear Box** (5): Different Types, Temperature, Noise, Oil Leakage, Gear Shifting
- **Container** (6): Inside of Container, Container Door, Container Floor, Rear Bumper, Mudguard R/S, Air Cutter
- **Electric** (13): Head Light R/S, Battery Water, Parking Light Front RS & LS, Parking Light Rear RS & LS, Indicator Light Front RS & LS, Indicator Light Rear RS & LS, Back Light RS & LS, Brake Light RS & LS, Fuse Board, Alternator, Self, Cabin Light, Container Inside Light
- **Chassis** (5): Chassis, Chassis Nut & Bolt, All U Bolt, Leaf Spring, Leaf Spring Hanger
- **Cabin** (10): Door RS & LS, Door Lock RS & LS, Foot Rest RS & LS, Looking Glass RS & LS, Door Glass RS & LS, Cabin Ventilator Glass, Windshield, Front Bumper, Front Plastic Bonnet, Driver and Helper Sit

### 2.3 VehicleInspection

```python
VehicleInspection {
    id: UUID (pk)                       # TenantAwareModel

    # Links
    transport_order: FK → TransportOrder   # The TO being inspected (must be in Assigned status)
    vehicle: FK → master_data.Vehicle      # Vehicle assigned to the TO
    supervisor: FK → users.User            # Driver Supervisor performing inspection

    # Inspection outcome
    status: enum                       # ['pending', 'completed', 'rejected']
    inspection_completed_at: DateTime (nullable)  # Set on successful completion
    completion_remarks: text (blank allowed)      # Optional supervisor summary on completion
    rejection_reason: text (blank allowed)        # Required (non-empty) when rejecting via service/admin

    created_at: DateTime               # TenantAwareModel
    updated_at: DateTime               # TenantAwareModel

    class Meta:
        app_label = "fleet_supervisor"
        db_table = "fs_vehicle_inspections"
        ordering = ["-created_at"]
}
```

### 2.4 ChecklistResponse

```python
ChecklistResponse {
    id: UUID (pk)                       # TenantAwareModel
    inspection: FK → VehicleInspection
    checklist_item: FK → ChecklistItem

    # Response data
    status: enum                       # ['ok', 'issue', 'na']
    remarks: text (nullable)           # Supervisor remarks for this item

    created_at: DateTime               # TenantAwareModel
    updated_at: DateTime               # TenantAwareModel

    class Meta:
        app_label = "fleet_supervisor"
        db_table = "fs_checklist_responses"
        constraints = [
            UniqueConstraint(fields=["inspection", "checklist_item"],
                             name="uniq_checklist_response_per_item")
        ]
}
```

### 2.5 DriverAttendance

```python
DriverAttendance {
    id: UUID (pk)                       # TenantAwareModel

    # Who/Where
    driver: FK → users.Driver
    poi: FK → master_data.POI           # Where attendance is recorded
    date: Date                          # Attendance date

    # Time tracking
    entry_datetime: DateTime
    exit_datetime: DateTime (nullable)  # Null if still checked in
    working_hours: Decimal (nullable)   # Auto-calculated: (exit - entry) in hours

    # Notes
    notes: text (nullable)

    # Audit
    recorded_by: FK → users.User        # Driver Supervisor who recorded it
    created_at: DateTime               # TenantAwareModel
    updated_at: DateTime               # TenantAwareModel

    class Meta:
        app_label = "fleet_supervisor"
        db_table = "fs_driver_attendance"
        constraints = [
            UniqueConstraint(fields=["driver", "date"],
                             name="uniq_driver_attendance_per_day")
        ]
        ordering = ["-date"]
}
```

### 2.6 DriverLeave

```python
DriverLeave {
    id: UUID (pk)                       # TenantAwareModel

    # Who
    driver: FK → users.Driver

    # When
    start_date: Date
    end_date: Date

    # Why
    reason: text

    # Status (computed — not stored):
    # Active: today between start_date and end_date
    # Upcoming: start_date > today
    # Expired: end_date < today
    # Cancelled: cancelled_at is not null

    # Audit
    registered_by: FK → users.User      # Driver Supervisor who registered leave
    cancelled_at: DateTime (nullable)
    cancelled_by: FK → users.User (nullable)
    created_at: DateTime               # TenantAwareModel
    updated_at: DateTime               # TenantAwareModel

    class Meta:
        app_label = "fleet_supervisor"
        db_table = "fs_driver_leave"
        ordering = ["-start_date"]
}
```

### 2.7 DriverStateLog (audit model)

```python
DriverStateLog {
    id: UUID (pk)                       # TenantAwareModel

    # Who
    driver: FK → users.Driver

    # Transition
    from_state: string                  # DriverCurrentState enum value
    to_state: string                    # DriverCurrentState enum value

    # Audit
    changed_by: FK → users.User (nullable)   # Null for system/auto transitions
    timestamp: DateTime
    trigger: enum                       # ['manual', 'auto']
    notes: text (nullable)              # Optional context (e.g., "TO #123 assigned")

    created_at: DateTime               # TenantAwareModel
    updated_at: DateTime               # TenantAwareModel

    class Meta:
        app_label = "fleet_supervisor"
        db_table = "fs_driver_state_log"
        ordering = ["-timestamp"]
}
```

### 2.8 WorkingHoursConfig

```python
WorkingHoursConfig {
    id: UUID (pk)                       # TenantAwareModel
    max_daily_hours: Decimal            # Default 12.0; configurable per tenant
    warning_enabled: boolean            # Default True — soft warning, not hard block

    created_at: DateTime               # TenantAwareModel
    updated_at: DateTime               # TenantAwareModel

    class Meta:
        app_label = "fleet_supervisor"
        db_table = "fs_working_hours_config"
        # One config per tenant schema — enforced via get_or_create in save_model
}
```

### 2.9 Extensions to existing models

**Vehicle** (existing `master_data.Vehicle` model — `apps/master_data/models.py`):

- **No new field needed.** The `operational_status` field already exists with `OperationalStatus.UNDER_MAINTENANCE` = `"under_maintenance"` value. The `mark_under_maintenance` action (DS-01-7) sets `vehicle.operational_status = OperationalStatus.UNDER_MAINTENANCE`.
- When set to Under Maintenance: vehicle excluded from TDO assignment dropdown (checked via `vehicle.operational_status == OperationalStatus.UNDER_MAINTENANCE`).

**Driver** (existing `users.Driver` model — `apps/users/models.py`):

- The `current_state` field **already exists** using `DriverCurrentState` enum (`TextChoices`).
- **Current values**: `AVAILABLE = "available"`, `ASSIGNED = "assigned"`, `ON_LEAVE = "on_leave"`.
- **DS-02-1**: `ON_EXECUTION = "on_execution"` is present on `DriverCurrentState` in `apps/users/models.py` (with migration in repo).
- All state machine transitions use `driver.current_state` (not `driver.state`).
- All transitions go through the `DriverStateMachine` service (§5.3 / §6.4).

---

## 3. Vehicle Inspection & Supervisor Dispatch (as implemented)

### 3.1 Predefined checklist (no configuration)

The daily inspection checklist is **predefined and immutable**. All 7 sections and 54 items are seeded in `apps/fleet_supervisor/migrations/0002_seed_checklist.py`. No user can add, edit, or delete sections or items via admin (`ReadOnlyFleetAdmin` on section/item models).

When a pending inspection is opened, `ensure_checklist_responses_for_inspection()` in `apps/fleet_supervisor/services.py` creates any missing `ChecklistResponse` rows with **default `status = ok`** and empty remarks; supervisors adjust lines to Issue / N/A as needed.

### 3.2 Transport order status context

Own-fleet assignment flow (see `TDOAssignmentService` in `apps/transport/services.py`): vehicle and driver assignment can move a TO to **Assigned**; setting **ETA** moves the TO to **Ready for Dispatch** (and creates trip data as implemented in transport). **Vehicle inspection does not run on Assigned** in code; it runs only while the TO is **Ready for Dispatch**.

### 3.3 Supervisor dispatch queue (admin + API)

- **Admin**: Custom view `VehicleInspectionAdmin.dispatch_queue_view` at `/admin/fleet_supervisor/vehicleinspection/dispatch-queue/` lists TOs in `TOStatus.READY_FOR_DISPATCH`. For each own-fleet row with a vehicle, the supervisor can:
  - **Skip inspection** — calls `supervisor_dispatch_intent(..., "skip_inspection")` → `dispatch_to_after_ready()` → TO **Dispatched** (own fleet: trip must be `ASSIGNED` then transitioned to `DISPATCHED` via `TripService`).
  - **Start inspection** — calls `supervisor_dispatch_intent(..., "start_inspection")` → creates a **pending** `VehicleInspection` (if none) and redirects to the inspection change form.
- **API**: `POST /api/v1/transport-orders/<to_id>/dispatch` with body `{"intent": "skip_inspection"|"start_inspection"}` (`TransportOrderSupervisorDispatchView` in `apps/fleet_supervisor/views.py`).

Skip is **blocked** if a pending inspection already exists for that TO (supervisor must complete or reject it first).

### 3.4 Completing an inspection

- **Admin**: Saving related inlines with POST key **`_submit_inspection`** triggers `complete_inspection()` after inlines persist (`VehicleInspectionAdmin.save_related`).
- **API**: `PATCH /api/v1/inspections/<id>/responses` (optional) then `POST /api/v1/inspections/<id>/approve` with optional `remarks` and optional `responses` (`approve_inspection` → `complete_inspection`).

`complete_inspection()` requires:

- Inspection **pending**
- Response count equals total `ChecklistItem` count
- Linked TO status **ready_for_dispatch**

On success: inspection → **completed**, `inspection_completed_at` set, `completion_remarks` stored, then **`dispatch_to_after_ready`** (TO → **dispatched**, trip dispatched for own fleet).

### 3.5 Rejecting an inspection

`reject_inspection()` (admin reject URL + `POST /api/v1/inspections/<id>/reject`) requires a **non-empty reason** and:

- Inspection **pending**
- Linked TO **ready_for_dispatch**

Effects: inspection → **rejected** with `rejection_reason`; vehicle `operational_status` → **under_maintenance**; TO → **`under_planning`** with vehicle, driver cleared and helpers cleared; **attempt** to transition driver to **available** via `DriverStateMachine` (ignored if transition invalid).

### 3.6 Under Maintenance (vehicle admin action)

`VehicleAdmin.mark_under_maintenance` in `apps/master_data/admin.py` calls `mark_vehicle_under_maintenance()` — sets vehicle under maintenance and resets linked TOs in **`assigned`** back to **`created`** with vehicle/driver unlinked (unchanged from earlier plan; **not** the same as inspection rejection, which targets **ready_for_dispatch** TOs).

---

## 4. Driver State Lifecycle

### 4.1 State machine

```
                    ┌──────────────────────────────────────┐
                    │         DRIVER STATE MACHINE         │
                    └──────────────────────────────────────┘

    ┌─────────────┐    TDO assigns TO    ┌─────────────┐
    │  Available  │ ───────────────────► │  Assigned   │
    │  (default)  │ ◄─────────────────── │             │
    └─────────────┘    TO completed       └─────────────┘
          │              or unlinked             │
          │                                     │ Execution starts (TLS-01)
          │                                     ▼
          │                              ┌──────────────┐
          │                              │ On Execution │
          │    TO completed (TLS-01)     │              │
          │ ◄─────────────────────────── └──────────────┘
          │
          │    Supervisor sets leave
          ▼
    ┌─────────────┐
    │  On Leave   │
    │             │ ──► Available (leave ends/cancelled)
    └─────────────┘
```

The four states map to `DriverCurrentState` in `apps/users/models.py`:


| Python Enum                       | DB Value         | Display                            |
| --------------------------------- | ---------------- | ---------------------------------- |
| `DriverCurrentState.AVAILABLE`    | `"available"`    | Available                          |
| `DriverCurrentState.ASSIGNED`     | `"assigned"`     | Assigned                           |
| `DriverCurrentState.ON_LEAVE`     | `"on_leave"`     | On Leave                           |
| `DriverCurrentState.ON_EXECUTION` | `"on_execution"` | On Execution |


### 4.2 Transition rules


| From         | To           | Trigger                      | Type        |
| ------------ | ------------ | ---------------------------- | ----------- |
| Available    | Assigned     | TDO assigns TO (TO-02)       | Auto        |
| Assigned     | On Execution | TO execution starts (TLS-01) | Auto        |
| On Execution | Available    | TO completed (TLS-01)        | Auto        |
| Assigned     | Available    | TO unlinked / cancelled      | Auto        |
| Available    | On Leave     | Supervisor registers leave   | Manual      |
| On Leave     | Available    | Leave ends or cancelled      | Manual/Auto |


**Invalid transitions** (rejected by state machine service with `InvalidStatusTransitionError`):

- On Leave → Assigned (must cancel leave first)
- On Execution → On Leave (cannot set leave while driving)
- On Leave → On Execution (impossible)

### 4.3 Audit trail

Every state transition creates a `DriverStateLog` entry with:

- `from_state`, `to_state`
- `changed_by` (user or null for auto)
- `trigger` (manual/auto)
- `timestamp`

---

## 5. Django Admin Configuration

### 5.0 Base admin class

All `fleet_supervisor` admin classes extend a shared base that follows the same pattern as `TenantMasterDataAdmin` in `apps/master_data/admin.py`:

```python
from apps.core.admin import AdminPaginationMixin, TenantOnlyAdminMixin

class FleetSupervisorAdminBase(AdminPaginationMixin, TenantOnlyAdminMixin, admin.ModelAdmin):
    """
    Base admin for all fleet_supervisor models.

    _fleet_read_perm: permission code that grants read/view access
    _fleet_write_perm: permission code that grants add/change/delete access
    _ds_readonly_roles: tuple of role codes that get read-only access
    """
    _fleet_read_perm: str | None = None
    _fleet_write_perm: str | None = None
    _ds_readonly_roles: tuple = ()

    def _get_role(self, request):
        from apps.requisitions.role_access import get_primary_role_code
        return get_primary_role_code(request.user)

    def _is_ds_readonly(self, request) -> bool:
        if self._is_platform(request):
            return False
        return self._get_role(request) in self._ds_readonly_roles

    def _has_fleet_permission(self, request, write: bool = False) -> bool:
        if self._is_platform(request):
            return False
        if self._tenant_admin_allowed(request):
            return True
        perms = request.user.get_all_permissions()
        if "*" in perms:
            return True
        perm = self._fleet_write_perm if write else self._fleet_read_perm
        return bool(perm and perm in perms)

    def get_model_perms(self, request):
        if self._is_platform(request):
            return {"add": False, "change": False, "delete": False, "view": False}
        can_read = self._has_fleet_permission(request, write=False) or self._is_ds_readonly(request)
        can_write = self._has_fleet_permission(request, write=True) and not self._is_ds_readonly(request)
        return {"view": can_read, "add": can_write, "change": can_write, "delete": can_write}

    def has_view_permission(self, request, obj=None):
        return self._has_fleet_permission(request, write=False) or self._is_ds_readonly(request)

    def has_add_permission(self, request):
        if self._is_ds_readonly(request):
            return False
        return self._has_fleet_permission(request, write=True)

    def has_change_permission(self, request, obj=None):
        if self._is_ds_readonly(request):
            return False
        return self._has_fleet_permission(request, write=True)

    def has_delete_permission(self, request, obj=None):
        if self._is_ds_readonly(request):
            return False
        return self._has_fleet_permission(request, write=True)
```

**Read-only admin pattern** (for immutable/audit models such as checklist reference and state log):

```python
class ReadOnlyFleetAdmin(FleetSupervisorAdminBase):
    def has_add_permission(self, request):
        return False
    def has_change_permission(self, request, obj=None):
        return False
    def has_delete_permission(self, request, obj=None):
        return False
    def get_actions(self, request):
        return {}
```

### 5.1 ChecklistSection Admin (read-only)

```python
@admin.register(ChecklistSection)
class ChecklistSectionAdmin(ReadOnlyFleetAdmin):
    _fleet_read_perm = PermissionCodes.FLEET_DS_INSPECTION_VIEW_QUEUE
    list_display = ("name", "display_order", "item_count")
    ordering = ("display_order",)
```

**List View**:

- Columns: Name, Display Order, Items Count (`item_count` annotated method)
- Read-only (no add/edit/delete — data is immutable, seeded by migration)

### 5.2 ChecklistItem Admin (read-only)

```python
@admin.register(ChecklistItem)
class ChecklistItemAdmin(ReadOnlyFleetAdmin):
    _fleet_read_perm = PermissionCodes.FLEET_DS_INSPECTION_VIEW_QUEUE
    list_display = ("section", "item_number", "name")
    list_filter = ("section",)
    ordering = ("section__display_order", "item_number")
```

**List View**:

- Columns: Section, Item Number, Name
- Filters: `section`
- Read-only (no add/edit/delete — data is immutable, seeded by migration)

### 5.3 VehicleInspection Admin (DS-01-3, DS-01-4, DS-01-5, DS-01-6)

Implementation: `VehicleInspectionAdmin` in `apps/fleet_supervisor/admin.py`.

```python
@admin.register(VehicleInspection)
class VehicleInspectionAdmin(FleetSupervisorAdminBase):
    _fleet_read_perm = PermissionCodes.FLEET_DS_INSPECTION_VIEW_QUEUE
    _fleet_write_perm = PermissionCodes.FLEET_DS_INSPECTION_SUBMIT
    _ds_readonly_roles = ("tdo_own_fleet",)
```

**Custom templates**: `change_list_template`, `change_form_template` under `templates/admin/fleet_supervisor/vehicleinspection/`; inline uses `checklist_inline.html` with per-line status/remarks.

**Dispatch queue** (not the changelist): `get_urls()` registers `dispatch-queue/` → `dispatch_queue_view` — lists **TOs in `ready_for_dispatch`**, links to start/skip inspection (see §3.3). Changelist adds `dispatch_queue_url` in context for navigation.

**List view (inspection records)**:

- `list_display`: `transport_order`, `vehicle`, `completed_by` (supervisor display name), `status_badge`, `inspection_completed_at`
- `list_filter`: `status`, `vehicle`; `search_fields`: `transport_order__to_number`
- **Default queryset**: excludes **rejected** unless the user filters by status (pending + completed only when no `status__exact` query param).

**Change form**:

- Fieldsets include `transport_order`, `vehicle`, `supervisor`, `status`, `completion_remarks`, `rejection_reason` plus collapsed timestamps.
- `ChecklistResponseInline`: checklist item read-only; status + remarks editable when user has submit permission; TDO read-only role can **view** inline via custom `has_*_permission` on the inline.
- **Read-only rules**: If status is **completed**, all model fields become read-only. For pending/rejected, `transport_order`, `vehicle`, `supervisor`, `status`, `rejection_reason` are read-only once the object exists; `completion_remarks` read-only when not pending.

**Completing an inspection (not plain “Save”)**:

- Checklist persistence uses normal admin save for inlines.
- **`save_related`**: if `request.POST` contains **`_submit_inspection`**, calls `complete_inspection()` with optional `completion_remarks` from the form; on `BusinessRuleError`, surfaces message and raises `ValidationError`.
- Success message states the TO is **Dispatched** (matches `dispatch_to_after_ready`).

**Reject flow**:

- `get_urls()` adds `<uuid:inspection_id>/reject/` → `_reject_view` with `_RejectReasonForm`; on POST calls `reject_inspection()` (see §3.5).

### 5.4 VehicleAdmin — Under Maintenance action (DS-01-7)

**Custom action** on `VehicleAdmin` in `apps/master_data/admin.py`:

```python
@admin.action(description="Mark selected vehicle(s) as Under Maintenance")
def mark_under_maintenance(self, request, queryset):
    from apps.fleet_supervisor.services import mark_vehicle_under_maintenance

    total_reset = 0
    for vehicle in queryset:
        reset_ids = mark_vehicle_under_maintenance(vehicle.id, performed_by=request.user)
        total_reset += len(reset_ids)
    msg = f"{queryset.count()} vehicle(s) marked Under Maintenance."
    if total_reset:
        msg += f" {total_reset} linked Transport Order(s) reset to Created."
    self.message_user(request, msg)
```

- Sets `Vehicle.operational_status = OperationalStatus.UNDER_MAINTENANCE`
- Resets any linked **`assigned`** TOs → **`created`** (vehicle and driver unlinked)

### 5.5 DriverStateLog Admin / Driver State Board (DS-02-6)

```python
@admin.register(DriverStateLog)
class DriverStateLogAdmin(ReadOnlyFleetAdmin):
    _fleet_read_perm = PermissionCodes.FLEET_DS_DRIVER_STATE_VIEW
    _ds_readonly_roles = ("tdo_own_fleet",)
```

**List View** (audit trail / “state board”):

- Columns: `driver`, **`state_badge`** (from **`to_state`** on the log row, not live driver aggregate), **`from_state`**, `timestamp`, `changed_by`, `trigger`
- There is **no POI column** on this changelist in code (POI filtering on the **API** state board uses `driver__permanent_vehicle__assigned_poi`; see §7.2).
- Filters: `trigger`, `to_state`; search: driver user first/last name
- Read-only (no add/edit/delete)

**State badge helper** (log `to_state`):

```python
_STATE_BADGE = {
    "available":    ("dfms-badge--approved",       "bi-check-circle",      "Available"),
    "assigned":     ("dfms-badge--under-planning", "bi-person-check",      "Assigned"),
    "on_execution": ("dfms-badge--in-progress",    "bi-arrow-repeat",      "On Execution"),
    "on_leave":     ("dfms-badge--cancelled",      "bi-calendar-x",        "On Leave"),
}

@admin.display(description="State", ordering="to_state")
def state_badge(self, obj):
    modifier, icon, label = _STATE_BADGE.get(obj.to_state, ("dfms-badge--neutral", "bi-circle", obj.to_state))
    return format_html(
        '<span class="dfms-badge {}">'
        '<i class="bi {} " style="font-size:10px;"></i>{}'
        '</span>',
        modifier, icon, label,
    )
```

### 5.6 DriverAttendanceAdmin (DS-02-7)

```python
@admin.register(DriverAttendance)
class DriverAttendanceAdmin(FleetSupervisorAdminBase):
    _fleet_read_perm = PermissionCodes.FLEET_DS_ATTENDANCE_READ
    _fleet_write_perm = PermissionCodes.FLEET_DS_ATTENDANCE_WRITE
    _ds_readonly_roles = ("tdo_own_fleet",)
```

**List View**:

- Columns: Driver, POI, Date, Entry Time, Exit Time, Working Hours, Recorded By
- Filters: `poi`, `date`, `driver`
- Search: Driver name (`driver__user__first_name`, `driver__user__last_name`), POI name (`poi__name`)
- Date hierarchy: `date`

**Change Form**:

- Fields: `driver` (FK autocomplete), `poi` (FK autocomplete), `date`, `entry_datetime`, `exit_datetime`, `notes`
- `save_model`:
  - Sets `recorded_by = request.user` on creation
  - Auto-calculates `working_hours` if both entry/exit present
  - Displays `messages.WARNING` if working hours exceed `WorkingHoursConfig.max_daily_hours`
- Validation: `exit_datetime >= entry_datetime` (form-level `clean()`)
- `has_change_permission` / `has_delete_permission`: returns `False` if `obj.date != date.today()` (same-day guard)

**Bulk Actions**: Export attendance report (CSV via `HttpResponse`)

### 5.7 DriverLeaveAdmin (DS-02-8)

```python
@admin.register(DriverLeave)
class DriverLeaveAdmin(FleetSupervisorAdminBase):
    _fleet_read_perm = PermissionCodes.FLEET_DS_LEAVE_READ
    _fleet_write_perm = PermissionCodes.FLEET_DS_LEAVE_WRITE
    _ds_readonly_roles = ("tdo_own_fleet",)
```

**List View**:

- Columns: Driver, Start Date, End Date, Status (computed badge), Reason, Registered By
- Filters: Status (Active/Upcoming/Expired/Cancelled — custom `SimpleListFilter`), `start_date` (date hierarchy)
- Search: Driver name
- Custom column: **Status badge** — green=Active, blue=Upcoming, gray=Expired, red=Cancelled; computed from `start_date`, `end_date`, `cancelled_at` relative to `date.today()`

**Change Form**:

- Fields: `driver`, `start_date`, `end_date`, `reason`
- `save_model`:
  - Sets `registered_by = request.user` on creation
  - Overlap check: if an overlapping non-cancelled leave exists, shows **error** message and **returns without calling `super().save_model`** (record not saved)
  - After save: if `start_date <= date.today()`, attempts `DriverStateMachine` → `ON_LEAVE` (warning only if `InvalidStatusTransitionError`)

**Cancel**:

- Admin **action** `cancel_leave` on selected rows: sets `cancelled_at` / `cancelled_by`, then if driver is still `ON_LEAVE`, transitions to **`AVAILABLE`** (swallows invalid transition)

**Validations**:

- `end_date >= start_date` (form-level `clean()`)
- No overlapping leave windows for same driver (admin `save_model` guard; API returns 400 on overlap)

### 5.8 WorkingHoursConfig Admin

```python
@admin.register(WorkingHoursConfig)
class WorkingHoursConfigAdmin(FleetSupervisorAdminBase):
    _fleet_read_perm = PermissionCodes.FLEET_DS_ATTENDANCE_READ
    _fleet_write_perm = PermissionCodes.FLEET_DS_ATTENDANCE_WRITE
```

- `list_display`: `max_daily_hours`, `warning_enabled`, `updated_at`
- **`has_add_permission`**: returns `False` if any config row already exists (single row per tenant in practice)
- **`save_model`**: on add, if a row already exists, shows error and returns without saving; otherwise delegates to `ModelAdmin.save_model` (working-hours warnings for attendance use `WorkingHoursConfig.objects.get_or_create` in `check_working_hours_warning`, independent of this guard)

---

## 6. Business Rules & Guards

### 6.1 TDO Assignment Conflict Checks (extends Sprint 3 TO-02)

When TDO assigns vehicle/driver to TO (`apps/transport/services.py` or `admin.py save_model`):

**Vehicle availability** (DS-01-7):

```python
from apps.master_data.models import OperationalStatus

if vehicle.operational_status == OperationalStatus.UNDER_MAINTENANCE:
    raise BusinessRuleError("Vehicle is Under Maintenance. Cannot assign to TO.")
```

**Driver availability** (DS-02-14):

```python
from apps.users.models import DriverCurrentState

if driver.current_state == DriverCurrentState.ON_LEAVE:
    raise BusinessRuleError("Driver is On Leave. Cannot assign to TO.")
```

### 6.2 Under Maintenance → TO Reset Guard (DS-01-7)

```python
# apps/fleet_supervisor/services.py
from apps.master_data.models import OperationalStatus
from apps.transport.constants import TOStatus

@transaction.atomic
def mark_vehicle_under_maintenance(vehicle_id, performed_by):
    vehicle = Vehicle.objects.select_for_update().get(id=vehicle_id)
    vehicle.operational_status = OperationalStatus.UNDER_MAINTENANCE
    vehicle.save(update_fields=["operational_status", "updated_at"])

    # Reset any linked Assigned TOs to Created
    assigned_tos = TransportOrder.objects.filter(
        vehicle=vehicle,
        status=TOStatus.ASSIGNED,
    )
    reset_to_ids = []
    for to in assigned_tos:
        to.status = TOStatus.CREATED
        to.vehicle = None
        to.driver = None
        to.save(update_fields=["status", "vehicle", "driver", "updated_at"])
        reset_to_ids.append(str(to.id))

    # Audit log
    try:
        from apps.audit.services import log_crud_update
        log_crud_update(request=None, user=performed_by, entity_type="Vehicle",
                        entity_id=str(vehicle_id), action="Vehicle.UnderMaintenance",
                        before={}, after={"operational_status": "under_maintenance"})
    except Exception:
        pass

    return reset_to_ids
```

### 6.3 Inspection completion & rejection (`apps/fleet_supervisor/services.py`)

**Completion** — `complete_inspection(inspection_id, performed_by, completion_remarks="")`:

- Requires inspection **pending**, response count ≥ total checklist items, linked TO **`ready_for_dispatch`**
- Sets inspection **completed**, timestamps, `completion_remarks`, then calls **`dispatch_to_after_ready`** (TO → **`dispatched`**; own fleet trip dispatch via `TripService` as implemented there)

**Rejection** — `reject_inspection(inspection_id, reason, performed_by)`:

- Requires non-empty reason; inspection **pending**; TO **`ready_for_dispatch`**
- Sets inspection **rejected** + `rejection_reason`; vehicle → **under maintenance**; TO → **`under_planning`** with vehicle/driver cleared and helpers cleared; attempts driver → **available** via `DriverStateMachine` (invalid transitions ignored)

### 6.4 Driver State Machine Service (DS-02-9)

Implemented in `apps/fleet_supervisor/services.py` as class **`DriverStateMachine`**. Invalid transitions raise **`InvalidStatusTransitionError`** from **`apps.core.exceptions`** (not defined in the fleet_supervisor module).

Valid transitions match the table in §4.2; allowed targets are computed in a **`_valid_transitions`** property (same edges as the spec table). Each successful `transition()` updates `driver.current_state` and appends a **`DriverStateLog`** row (`timestamp=timezone.now()`, `notes` defaulting to `""`).

### 6.5 TLS-01 hooks — automatic driver state updates (DS-02-10)

| Event | Implemented? | Where |
| ----- | ------------ | ----- |
| TO reaches **Assigned** (vehicle + driver set on own-fleet TO) | **Yes** | `TDOAssignmentService._try_transition_to_assigned` in `apps/transport/services.py` calls `DriverStateMachine().transition(..., ASSIGNED, trigger="auto", ...)` inside a try/except (failures swallowed) |
| TO execution starts → **On Execution** | **Not wired** | No `DriverStateMachine` call located in `apps/transport` for trip/TO start beyond assignment |
| TO / trip completed → **Available** | **Not wired** | Same — `DriverStateMachine` supports the transition but transport layer does not invoke it in the current codebase |

Product flows that depend on **On Execution** should treat current_state as **authoritative only for Assigned / On Leave** until TLS-01 hooks are added.

### 6.6 Working Hours Guardrail (DS-02-15)

```python
def check_working_hours_warning(driver, date):
    config, _ = WorkingHoursConfig.objects.get_or_create(
        defaults={"max_daily_hours": 12, "warning_enabled": True}
    )
    try:
        attendance = DriverAttendance.objects.get(driver=driver, date=date)
    except DriverAttendance.DoesNotExist:
        return None
    if config.warning_enabled and attendance.working_hours and attendance.working_hours > config.max_daily_hours:
        return f"Driver exceeded {config.max_daily_hours}h limit ({attendance.working_hours}h recorded)"
    return None
```

Soft warning only — not a hard block in MVP. Shown via `self.message_user(request, warning, level=messages.WARNING)` in `DriverAttendanceAdmin.save_model`.

---

## 7. API Endpoints

Routes are registered in `apps/fleet_supervisor/urls.py` and included from `config/urls.py` under **`/api/v1/`** (same prefix as other tenant APIs).

**Permissioning (as implemented)**: Fleet supervisor views use **`IsTenantUser`** only (`apps/core/permissions.py`). They do **not** enforce individual `Fleet.DriverSupervisor.*` codes at the DRF layer; Django Admin uses those codes via `FleetSupervisorAdminBase`. Harden the API separately if fine-grained RBAC is required.

### 7.1 Checklist template (DS-01-13)

`GET /api/v1/checklist-template` — returns `{ "sections": [ { "id", "name", "display_order", "items": [ { "id", "name", "item_number", "remarks" } ] } ] }`.

### 7.2 Inspection queue (DS-01-8)

`GET /api/v1/inspections/queue` — lists transport orders with **`status = ready_for_dispatch`**. Each element includes `to_id`, `to_reference`, `status`, `fleet_type`, `requires_vehicle_inspection` (own fleet **and** vehicle assigned), stringified `vehicle` / `driver`, `assigned_at` (currently `updated_at` on the TO), and `eta_datetime`.

### 7.3 Supervisor dispatch intent (replaces monolithic “create inspection” POST)

`POST /api/v1/transport-orders/<uuid:to_id>/dispatch` — JSON body `{"intent": "skip_inspection" | "start_inspection"}`.

- **`skip_inspection`**: dispatches the TO (`dispatch_to_after_ready`). Returns `{ to_id, to_status, skipped_inspection?: true }` or `{ already_dispatched: true }` if already dispatched. **400** if a **pending** inspection exists for that TO.
- **`start_inspection`**: own fleet + vehicle required; creates or reuses a **pending** `VehicleInspection`, ensures checklist rows. Returns `{ inspection_id, to_status }` and may include `existing_pending_inspection: true`.

### 7.4 Inspection detail (DS-01-10)

`GET /api/v1/inspections/<uuid:inspection_id>` — `VehicleInspectionDetailSerializer`: model `id`, FK ids, `transport_order_number`, `vehicle_registration`, `supervisor_name`, `status`, `inspection_completed_at`, `completion_remarks`, `rejection_reason`, nested `responses` (`checklist_item`, `status`, `remarks`), timestamps.

### 7.5 Checklist responses upsert (DS-01-10b)

`PATCH /api/v1/inspections/<uuid:inspection_id>/responses` — body `{ "responses": [ { "checklist_item": "<uuid>", "status": "ok"|"issue"|"na", "remarks": "..." } ] }` (at least one row). **400** if inspection not pending.

### 7.6 Approve inspection (DS-01-10c)

`POST /api/v1/inspections/<uuid:inspection_id>/approve` — optional `remarks` (maps to `completion_remarks`) and optional `responses` array (same shape as §7.5). Runs `approve_inspection` → `complete_inspection` + dispatch. Returns `{ inspection_id, inspection_status, to_status }`.

### 7.7 Reject inspection (DS-01-11)

`POST /api/v1/inspections/<uuid:inspection_id>/reject` — body `{ "reason": "..." }`. Returns `{ inspection_id, "status": "rejected" }`. On failure, **`detail`** may be a generic exception string (view catches `BusinessRuleError` and `DoesNotExist`).

### 7.8 Under maintenance (DS-01-12)

`POST /api/v1/vehicles/<uuid:vehicle_id>/under-maintenance` — no JSON body required. Returns `{ vehicle_id, operational_status: "under_maintenance", reset_to_ids: [...] }`. Errors return **400** with `{ "detail": "..." }` (broad `except` in view).

### 7.9 Driver attendance (DS-02-11)

- `GET /api/v1/driver-attendance` — query: `driver`, `poi`, `date_from`, `date_to`. Serializes `id`, `driver`, `driver_name`, `poi`, `poi_name`, `date`, times, `working_hours`, `notes`, computed `warning`.
- `POST /api/v1/driver-attendance` — body fields **`driver`**, **`poi`**, **`entry_datetime`**, optional **`exit_datetime`**, optional **`notes`** (UUID FKs for driver/poi). `date` and `working_hours` are derived server-side. Response **`201`**: `{ attendance_id, working_hours, warning }`.
- `PATCH /api/v1/driver-attendance/<uuid:attendance_id>` — same calendar day only else **403**; body `exit_datetime`, `notes`.
- `DELETE /api/v1/driver-attendance/<uuid:attendance_id>` — same day only else **403**; **204** on success.

### 7.10 Driver leave (DS-02-12)

- `GET /api/v1/driver-leave` — query: `driver`, `date_from`, `date_to`, `status` (`active` \| `upcoming` \| `expired` \| `cancelled`).
- `POST /api/v1/driver-leave` — body `driver`, `start_date`, `end_date`, `reason`. Overlap → **400**. Response **`201`**: `{ leave_id, status }` where `status` is model helper `leave_status`.
- `PATCH /api/v1/driver-leave/<uuid:leave_id>` — disallowed once `start_date <= today` (**403**). Body uses same fields as create serializer.
- `POST /api/v1/driver-leave/<uuid:leave_id>/cancel` — idempotent guard if already cancelled (**400**). Returns `{ leave_id, cancelled_at, driver_current_state }`.

### 7.11 Driver state board (DS-02-13)

`GET /api/v1/drivers/state-board` — query `state` (filters log `to_state`), `poi_id` (filters `driver__permanent_vehicle__assigned_poi`). Returns **latest log row per driver** serialized with: `driver_id`, `driver_name`, **`current_state`** (live field on `Driver`), `from_state`, `to_state`, `trigger`, `last_transition_at`, `changed_by_name`.

### 7.12 Single driver state + history

`GET /api/v1/drivers/<uuid:driver_id>/state` — `{ driver_id, current_state, history: [ ... same serializer as state board rows ... ] }`.

---

## 8. Permissions & RBAC

### 8.1 Permission codes (`apps/core/constants_rbac.py`)

Fleet supervisor permission codes are **defined** on `PermissionCodes` (inspection submit/reject/view queue/view history, vehicle under maintenance, driver state view/history, attendance read/write, leave read/write/cancel, menu fleet supervisor view). Mirror entries exist in `PERMISSION_DEFINITIONS` inside `apps/core/role_seed_data.py`.

**Seeded roles (excerpt)**:

- **`driver_supervisor`**: full fleet supervisor permission bundle including `MENU_FLEET_SUPERVISOR_VIEW` and inspection/attendance/leave/state codes (see `SEED_ROLES` in `role_seed_data.py`).
- **`tdo_own_fleet`**: read-only fleet additions — `FLEET_DS_DRIVER_STATE_VIEW`, `FLEET_DS_ATTENDANCE_READ`, `FLEET_DS_LEAVE_READ`, `FLEET_DS_INSPECTION_VIEW_QUEUE` (no inspection submit).

### 8.2 Portal navigation (`apps/core/portal_navigation.py`)

See §0.1 for the live **Fleet operations** menu. Sidebar entries intentionally omit checklist reference and driver state log; users with the right codes can still open those model admins via direct URL or the Django admin app index.

### 8.3 Re-seeding RBAC

After any change to permission definitions or role rows:

```bash
python manage.py seed_dfms_rbac --reset
```

(Use project-documented flags if your environment differs.)

---

## 9. Integration Points

### 9.1 With Transport (Sprint 3 TO-02, Sprint 4 TLS-01)

**TDO assignment** — implemented in `TDOAssignmentService` (`apps/transport/services.py`) and mirrored in transport admin validation helpers:

- **Vehicle**: blocked when `operational_status == UNDER_MAINTENANCE`
- **Driver**: blocked when `current_state == ON_LEAVE` (DS-02-14)

**Supervisor inspection & dispatch** — `apps/fleet_supervisor/services.py`:

- Queue + dispatch intents operate only on TOs in **`ready_for_dispatch`**
- **`complete_inspection`** / admin submit → **`dispatch_to_after_ready`** → TO **`dispatched`** (own fleet trip dispatch)
- **`reject_inspection`** → inspection rejected, vehicle under maintenance, TO **`under_planning`**, crew cleared (see §3.5)
- **`mark_vehicle_under_maintenance`** (vehicle admin / API) → resets linked **`assigned`** TOs to **`created`**

**TLS-01 driver automation** — see §6.5: **Assigned** transition on own-fleet assignment is wired; **On Execution** / back to **Available** are **not** wired from transport in the current tree.

### 9.2 With Driver Mobile (Sprint 4 DM-01)

**Checklist Reference**:

- Mobile app fetches `GET /api/v1/checklist-template` for display purposes
- Inspection submission is supervisor-side only (not driver-submitted)

**Driver State Visibility**:

- Mobile reads `GET /api/v1/drivers/{driver_id}/state` to show `current_state`

---

## 10. Validation Rules

### 10.1 Vehicle inspection & dispatch

- Completing an inspection requires one `ChecklistResponse` per checklist item (`complete_inspection` count check); pending rows are auto-created as **ok** when the inspection form loads (`ensure_checklist_responses_for_inspection`)
- Completion and rejection both require the linked TO to be **`ready_for_dispatch`**
- Rejection requires a non-empty reason (`reject_inspection` / serializers)
- **Skip inspection** is disallowed while a **pending** inspection exists for the same TO
- Inspection **rejection** sets the vehicle to **under maintenance** and moves the TO to **`under_planning`** (not “stay assigned”)

### 10.2 Attendance

- `exit_datetime >= entry_datetime`
- Unique-together: (driver, date) — one attendance record per driver per day
- Same-day edit/delete only (`obj.date != date.today()` → read-only in admin)
- Working hours warning when exceeding `WorkingHoursConfig.max_daily_hours`

### 10.3 Leave

- `end_date >= start_date`
- Cannot have overlapping leave for same driver (non-cancelled records)
- Cannot cancel already-cancelled leave
- Cannot edit leave after `start_date` has passed

### 10.4 Driver State Transitions

- Only valid transitions per state machine (§4.2) are accepted
- Invalid transitions raise **`InvalidStatusTransitionError`** from **`apps.core.exceptions`**
- Every transition logged to `DriverStateLog`

---

## 11. Sub-task Reference

### DS-01 Sub-tasks (Vehicle Inspection)


| #        | Sub-task                                                                                          | Jira       |
| -------- | ------------------------------------------------------------------------------------------------- | ---------- |
| DS-01-1  | `ChecklistSection` + `ChecklistItem` + seed migration `0002_seed_checklist` (7 sections, 54 items)          | DFS-050-1  |
| DS-01-2  | `VehicleInspection` + `ChecklistResponse` models                                                  | DFS-050-2  |
| DS-01-3  | `VehicleInspectionAdmin` — changelist, **dispatch queue**, templates, inline, `_submit_inspection` / reject URL | DFS-050-3  |
| DS-01-4  | `VehicleInspectionAdmin` — change form with `ChecklistResponseInline` (TabularInline)             | DFS-050-4  |
| DS-01-5  | `complete_inspection` + `save_related` (`_submit_inspection`) — dispatches TO after checklist        | DFS-050-5  |
| DS-01-6  | `VehicleInspectionAdmin` — reject action + `_RejectReasonForm` (intermediate view via `get_urls`) | DFS-050-6  |
| DS-01-7  | `VehicleAdmin.mark_under_maintenance` action + `mark_vehicle_under_maintenance` service           | DFS-050-7  |
| DS-01-8  | Inspection queue API — `GET /api/v1/inspections/queue` (**Ready for Dispatch** TOs)                  | DFS-050-8  |
| DS-01-9  | `POST /api/v1/transport-orders/<to_id>/dispatch` — skip vs start inspection (*not* `POST /inspections`) | DFS-050-9  |
| DS-01-10 | Inspection detail + `PATCH .../responses` + `POST .../approve`                                       | DFS-050-10 |
| DS-01-11 | Inspection reject API — `POST /api/v1/inspections/{inspection_id}/reject`                         | DFS-050-11 |
| DS-01-12 | Under Maintenance API — `POST /api/v1/vehicles/{vehicle_id}/under-maintenance`                    | DFS-050-12 |
| DS-01-13 | Checklist template API — `GET /api/v1/checklist-template`                                         | DFS-050-13 |
| DS-01-14 | Audit logging — inspections, rejections, Under Maintenance decisions                              | DFS-050-14 |


### DS-02 Sub-tasks (Driver State, Attendance & Leave)


| #        | Sub-task                                                                                               | Jira       |
| -------- | ------------------------------------------------------------------------------------------------------ | ---------- |
| DS-02-1  | `ON_EXECUTION` on `DriverCurrentState` in `apps/users/models.py` (+ migration in repo)                  | DFS-051-1  |
| DS-02-2  | `DriverAttendance` model + migration                                                                   | DFS-051-2  |
| DS-02-3  | `DriverLeave` model + migration                                                                        | DFS-051-3  |
| DS-02-4  | `DriverStateLog` audit model + migration                                                               | DFS-051-4  |
| DS-02-5  | `WorkingHoursConfig` model (max daily hours, default 12h)                                              | DFS-051-5  |
| DS-02-6  | `DriverStateLogAdmin` — list view (state board) with state badges, filters, read-only                  | DFS-051-6  |
| DS-02-7  | `DriverAttendanceAdmin` — list + change form, working hours validation, same-day guard                 | DFS-051-7  |
| DS-02-8  | `DriverLeaveAdmin` — leave form, overlap validation, state transition, cancel action                   | DFS-051-8  |
| DS-02-9  | `DriverStateMachine` service — transitions via `driver.current_state`, validation, audit               | DFS-051-9  |
| DS-02-10 | TLS-01 hooks — **partial**: `ASSIGNED` on own-fleet TDO assignment only (`TDOAssignmentService`); **no** `ON_EXECUTION` / completion hooks in transport yet | DFS-051-10 |
| DS-02-11 | Attendance CRUD API — `POST/GET/PATCH/DELETE /api/v1/driver-attendance`                                | DFS-051-11 |
| DS-02-12 | Leave CRUD API — `POST/GET/PATCH /api/v1/driver-leave` + cancel                                        | DFS-051-12 |
| DS-02-13 | Driver state board API — `GET /api/v1/drivers/state-board`                                             | DFS-051-13 |
| DS-02-14 | TO-02 conflict guard — On Leave drivers blocked from assignment                                        | DFS-051-14 |
| DS-02-15 | Working hours guardrail — warning on threshold exceeded                                                | DFS-051-15 |
| DS-02-16 | Supervisor UI — **Django Admin only (Sprint 4)**: attendance “grid” = `DriverAttendanceAdmin` changelist; leave “calendar” = `DriverLeaveAdmin` changelist + `date_hierarchy` / filters; state “board” = `DriverStateLogAdmin` (or equivalent) changelist with badges — no custom SPA for DS-02-16 | DFS-051-16 |
| DS-02-17 | Audit logging — state transitions, attendance, leave records                                           | DFS-051-17 |


---

## 12. Sprint 4 Story Mapping


| Story     | Scope                                                      | Implementation Focus                                                                                                                                                                                                                                   |
| --------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **DS-01** | Vehicle inspection (predefined checklist) + supervisor dispatch | Models + `0002_seed_checklist` + `VehicleInspectionAdmin` / dispatch queue + `complete_inspection` / `reject_inspection` / `supervisor_dispatch_intent` + APIs in §7 + `VehicleAdmin.mark_under_maintenance` |
| **DS-02** | Driver state, attendance & leave                                 | `DriverCurrentState` includes `ON_EXECUTION` + `DriverStateMachine` + models/admin + attendance/leave APIs + **partial** TLS-01 wiring (see §6.5) + `role_seed_data` fleet rows |


---

## 13. Dependencies

### Upstream

- `02-master-data`: `master_data.Vehicle` (`operational_status` field, `OperationalStatus` enum), `master_data.POI`
- `03-users`: `users.Driver` (`current_state` field, `DriverCurrentState` enum), `users.User`
- `01-foundation`: RBAC (`PermissionCodes`, `SEED_ROLES`, `PERMISSION_DEFINITIONS`), `TenantAwareModel`, `TenantOnlyAdminMixin`, `AdminPaginationMixin`
- `05-transport`: `TransportOrder` model (TO-02 assignment, TLS-01 lifecycle), `TOStatus`

### Downstream

- `05-transport`: TDO assignment guards (`vehicle.operational_status`, `driver.current_state`), execution guards (TLS-01), TO status transitions
- `09-mobile-apps`: Checklist reference display, driver state visibility via `current_state` (DM-01)

---

**Last Updated**: 2026-05-15
**Related Modules**: [05-transport](../05-transport/README.md), [03-users](../03-users/README.md) (Driver Interface), [02-master-data](../02-master-data/README.md)