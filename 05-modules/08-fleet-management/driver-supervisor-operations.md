---

## module: 08-fleet-management
specification: Driver Supervisor Operations
version: 2.1
phase: Phase 1
sprint: Sprint 4
last_updated: 2026-05-14
related_stories: DFS-050 (DS-01), DFS-051 (DS-02)
jira_epic: DFS-070

# Driver Supervisor Operations Specification

## Overview

The **Driver Supervisor Operations** specification covers pre-movement vehicle inspections, driver state management, workforce attendance, and leave management for own-fleet execution. This layer sits **between TDO assignment (Sprint 3)** and **driver field execution (Sprint 4 DM-01)**, enforcing that vehicles and drivers meet operational readiness criteria before a Transport Order can progress to active execution.

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

**Upgrade note**: If a tenant database previously applied migrations for the old `supervisor` app label (`apps/users/supervisor`), remove those rows from `django_migrations` and reconcile tables before applying `fleet_supervisor` migrations, or reset the tenant schema — both apps use the same physical `db_table` names.

**Dependencies**: MDM-05 (Vehicle), MDM-06 (Driver / `users.Driver`), `05-transport` (TO execution state), `01-foundation` (RBAC)
**Enables**: TDO assignment conflict checks (leave/maintenance), driver execution action guards, fleet readiness dashboard

---

## 0. Menu Structure & Navigation

### 0.1 Implemented portal sidebar (code)

Tenant portal navigation is **not** a nested tree in the API. It is defined in `apps/core/portal_navigation.py` as `PORTAL_NAV_SECTIONS` and exposed via `build_portal_navigation()` as:

`{ "sections": [ { "heading", "icon", "items": [ { "id", "label", "url", "icon" } ] } ] }`

**Rules today**

- **Flat structure**: each **section** has a `heading` and a list of **items**; each item is a **single** link (typically a Django Admin `url`). There is no first-class "folder" item with child rows — deeper IA is expressed as **separate sibling links** or **in-page** tabs/routes on the target screen.
- **Visibility**: `_item_visible()` grants an item if the user matches `permission_any` (resolved permission codes must intersect the item's list), or matches optional `role_any` (OR shortcut before permission check), unless blocked by `role_exclude`.
- **Platform admin** uses `PLATFORM_NAV_SECTIONS` only (tenant ops menus are omitted).

**Implemented in code**: Add a `**heading`: `"Fleet operations"`** block to `PORTAL_NAV_SECTIONS` in `apps/core/portal_navigation.py` with flat links to `fleet_supervisor` Django Admin changelists. Use `permission_any` with `Fleet.*` permission codes (see §8). Example structure (add after the Transport section):

```python
{
    "heading": "Fleet operations",
    "icon": "clipboard2-check",
    "items": [
        {
            "id": "fleet_inspection_queue",
            "label": "Vehicle Inspections",
            "url": "/admin/fleet_supervisor/vehicleinspection/",
            "icon": "clipboard2-check",
            "permission_any": [
                PermissionCodes.FLEET_DS_INSPECTION_VIEW_QUEUE,
                PermissionCodes.FLEET_DS_INSPECTION_SUBMIT,
            ],
            "role_any": ["driver_supervisor"],
        },
        {
            "id": "fleet_checklist_reference",
            "label": "Checklist Reference",
            "url": "/admin/fleet_supervisor/checklistsection/",
            "icon": "list-check",
            "permission_any": [
                PermissionCodes.FLEET_DS_INSPECTION_VIEW_QUEUE,
                PermissionCodes.FLEET_DS_INSPECTION_VIEW_HISTORY,
            ],
            "role_any": ["driver_supervisor", "tdo_own_fleet"],
        },
        {
            "id": "fleet_driver_state_board",
            "label": "Driver State Board",
            "url": "/admin/fleet_supervisor/driverstatelog/",
            "icon": "person-lines-fill",
            "permission_any": [
                PermissionCodes.FLEET_DS_DRIVER_STATE_VIEW,
            ],
            "role_any": ["driver_supervisor", "tdo_own_fleet"],
        },
        {
            "id": "fleet_attendance",
            "label": "Driver Attendance",
            "url": "/admin/fleet_supervisor/driverattendance/",
            "icon": "calendar-check",
            "permission_any": [
                PermissionCodes.FLEET_DS_ATTENDANCE_WRITE,
                PermissionCodes.FLEET_DS_ATTENDANCE_READ,
            ],
            "role_any": ["driver_supervisor"],
        },
        {
            "id": "fleet_leave",
            "label": "Driver Leave",
            "url": "/admin/fleet_supervisor/driverleave/",
            "icon": "calendar-x",
            "permission_any": [
                PermissionCodes.FLEET_DS_LEAVE_WRITE,
                PermissionCodes.FLEET_DS_LEAVE_READ,
            ],
            "role_any": ["driver_supervisor"],
        },
        {
            "id": "fleet_working_hours_config",
            "label": "Working Hours Config",
            "url": "/admin/fleet_supervisor/workinghoursconfig/",
            "icon": "clock",
            "permission_any": [
                PermissionCodes.FLEET_DS_ATTENDANCE_WRITE,
            ],
            "role_any": ["driver_supervisor"],
        },
    ],
},
```

Re-seed RBAC (`python manage.py seed_dfms_rbac`) after permission catalog changes so roles receive new permission rows; users may need to **log out and back in** (permission cache TTL ~5 minutes).

### 0.2 Fleet operations — target information architecture (product)

The tree below is **conceptual grouping** for DS-01 / DS-02 UX (screens and drill-down), **not** a representation of nested sidebar JSON.

**Sprint 4 binding**: DS-02 “attendance grid”, “leave calendar”, and “state board” are implemented as **Django Admin** changelists and forms (see §0.1 links) — `list_display`, `list_filter`, `date_hierarchy`, search — not as a separate calendar/grid SPA unless a later story explicitly adds one.

```
Fleet operations (target section — flat items when implemented)
├── Vehicle Inspections              — queue + history + checklist reference (in-app or separate admin URLs)
│     ├── Inspection Queue
│     ├── Inspection History
│     └── Checklist Reference
├── Driver State Board               — real-time driver state overview
│     └── State History              — full audit log (detail view / drawer, not a second sidebar node)
├── Driver Attendance
│     ├── Mark Attendance
│     └── Attendance Log
└── Driver Leave Management
      ├── Register Leave
      └── Leave Calendar
```

### Role → menu mapping


| Role              | Fleet operations (target items)    | Master Data (Driver/Vehicle)  |
| ----------------- | ---------------------------------- | ----------------------------- |
| Driver Supervisor | ✓ (full operational CRUD)          | — (no Master Data permission) |
| Tenant Admin      | ✓ (read-only config view)          | ✓ (master CRUD)               |
| TDO               | ✓ (state board, leave — read-only) | — (no Master Data permission) |
| Driver            | —                                  | — (no Master Data permission) |


 **Fleet operations column** describes **target** access once Fleet operations menu items exist in `portal_navigation.py`. Until then, portal visibility for `driver_supervisor` follows whatever sections/items intersect that role's seeded `Menu.`* / transport permissions (see `apps/core/role_seed_data.py`).

### Screen hierarchy

**Target product flow** (same IA as §0.2). **Sprint 4:** implement using **Django Admin** routes (`ModelAdmin` list/change); later phases may introduce SPA surfaces for the same IA without changing the underlying models or APIs.

```
Fleet operations → Vehicle Inspections
  ├── Inspection Queue (TOs in Assigned status)
  │     └── [row click] ──► Inspection Form
  │                           ├── Vehicle + TO context (read-only header)
  │                           ├── Checklist sections (7 predefined sections)
  │                           │     └── Items per section — Remarks field per item
  │                           ├── [Submit Inspection]
  │                           │     └── TO status → Ready for Dispatch
  │                           │     └── inspection_completed_at set
  │                           └── [Reject Vehicle]
  │                                 └── Rejection reason required (_RejectReasonForm)
  │                                 └── TO stays Assigned; vehicle flagged
  │
  ├── Inspection History
  │     └── Searchable by vehicle, TO, supervisor, date range, outcome
  │
  └── Checklist Reference (read-only)
        └── All 7 sections + items (predefined, immutable)

Fleet operations → Driver State Board
  └── **Sprint 4:** Django Admin changelist on `DriverStateLog` (or read-only aggregate of `Driver` + last log) — product “board” = filtered/sorted table with state badges (not a canvas dashboard). Columns: Driver, Current State (badge), POI, Last Transition, Changed By; filters: state, POI; row click → State History (audit log)

Fleet operations → Driver Attendance
  ├── Mark Attendance
  │     └── Form: Driver (dropdown), POI (dropdown), Entry Time, Exit Time (nullable), Notes
  │           └── [Save] ──► Attendance Log (row added)
  │                          └── Auto-calculate: working_hours = exit - entry
  │                          └── Warning if hours > configured max (default 12h)
  │
  └── Attendance Log
        └── **Sprint 4:** Django Admin changelist on `DriverAttendance` — product “grid” = `list_display` columns (driver, POI, date, entry, exit, hours)
        └── Table: Driver, POI, Date, Entry, Exit, Hours, Notes
              └── [Edit] / [Delete] (same-day only)

Fleet operations → Driver Leave Management
  ├── Register Leave
  │     └── Form: Driver (dropdown), Start Date, End Date, Reason (text)
  │           └── [Save] ──► Driver state → On Leave (via state machine service)
  │                          └── TDO assignment guard: conflict check enforced
  │
  └── Leave Calendar
        └── **Sprint 4:** Django Admin changelist on `DriverLeave` (`date_hierarchy` on start/end, `list_filter` by driver/status) — product “calendar” = date-scoped list, not a third-party calendar widget
        └── List: Driver, Start Date, End Date, Reason, Status (Active / Upcoming / Expired)
              └── [Cancel] (if not yet started or active — driver → Available)
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

**Predefined sections** (seeded via data migration — DS-01-1):


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
    rejection_reason: text (nullable)  # Required when status = rejected

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
- **DS-02-1 migration**: Add `ON_EXECUTION = "on_execution", "On Execution"` to `DriverCurrentState`.
- All state machine transitions use `driver.current_state` (not `driver.state`).
- All transitions go through the `DriverStateMachine` service (§5.3 / §6.4).

---

## 3. Vehicle Inspection Lifecycle

### 3.1 Predefined checklist (no configuration)

The daily inspection checklist is **predefined and immutable**. All 7 sections and 54 items are seeded via a data migration (DS-01-1). No user can add, edit, or delete sections or items.

```
Data Migration (one-time)
  └─► Seed ChecklistSection (7 sections)
        └─► Seed ChecklistItem (54 items across sections)
              └─► Available system-wide (read-only reference)
```

### 3.2 Inspection flow (TO-driven)

```
TDO assigns vehicle + driver to TO (Sprint 3 TO-02)
  └─► TO status = Assigned
        └─► TO appears in Supervisor Inspection Queue

Driver Supervisor
  └─► Opens TO from inspection queue
        └─► Creates VehicleInspection (auto-linked to TO + vehicle)
              └─► Fills ChecklistResponse for each item (status + remarks)
                    ├─► [Submit — All OK]
                    │     └─► VehicleInspection.status = completed
                    │           └─► inspection_completed_at = now()
                    │                 └─► TO status: Assigned → Ready for Dispatch
                    │
                    └─► [Reject]
                          └─► VehicleInspection.status = rejected
                                └─► rejection_reason required (_RejectReasonForm)
                                      └─► TO stays in Assigned status
                                            └─► Vehicle flagged for follow-up
```

### 3.3 Under Maintenance flow (independent action)

```
Driver Supervisor
  └─► Marks vehicle as Under Maintenance (via VehicleAdmin action or API)
        └─► Vehicle.operational_status = OperationalStatus.UNDER_MAINTENANCE
              └─► Vehicle excluded from new TDO assignments
                    └─► Any linked TO in Assigned status → reset to Created (vehicle unlinked)
                          └─► TDO must reassign vehicle
```

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
| `DriverCurrentState.ON_EXECUTION` | `"on_execution"` | On Execution *(DS-02-1 adds this)* |


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
        if self._tenant_admin_allowed(request) or request.user.is_superuser:
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

```python
@admin.register(VehicleInspection)
class VehicleInspectionAdmin(FleetSupervisorAdminBase):
    _fleet_read_perm = PermissionCodes.FLEET_DS_INSPECTION_VIEW_QUEUE
    _fleet_write_perm = PermissionCodes.FLEET_DS_INSPECTION_SUBMIT
    _ds_readonly_roles = ("tdo_own_fleet",)
```

**List View** (DS-01-3):

- Columns: TO Reference, Vehicle (registration), Supervisor, Status (badge), Inspection Date
- Filters: `status`, `vehicle`
- Search: TO number (`transport_order__to_number`)
- Default queryset: filtered to TOs in `Assigned` status (inspection queue); expose History tab via separate URL or filter toggle

**Change Form** (DS-01-4):

- Header fields (read-only): TO reference, vehicle registration, supervisor name
- Inline: `ChecklistResponseInline` (TabularInline) — all items grouped by section; `status` dropdown + `remarks` textarea per item
- Completed inspections: all fields read-only (`get_readonly_fields` returns all when `obj.status == 'completed'`)

`**save_model`** (DS-01-5):

- Validates all 54 `ChecklistResponse` entries are filled (`inspection.responses.count() == ChecklistItem.objects.count()`)
- Sets `inspection.status = 'completed'`, `inspection.inspection_completed_at = timezone.now()`
- Transitions TO status: `Assigned` → `Ready for Dispatch` in `@transaction.atomic`
- Uses `self.message_user(request, ..., level=messages.SUCCESS)` for user feedback

**Reject action** (DS-01-6):

- Custom admin action using `_RejectReasonForm` (Django `Form` with `reason: CharField(required=True)`)
- Rendered via `self.admin_site.admin_view()` — custom URL via `get_urls()`
- Sets `inspection.status = 'rejected'`, `inspection.rejection_reason = reason`
- TO stays in `Assigned` status; vehicle flagged for follow-up
- Pattern: intermediate confirmation view (like transport `create_from_tr_view`) rendered with `TemplateResponse`

### 5.4 VehicleAdmin — Under Maintenance action (DS-01-7)

**Custom action** added to the existing `VehicleAdmin` in `apps/master_data/admin.py`:

```python
@admin.action(description="Mark selected vehicle(s) as Under Maintenance")
def mark_under_maintenance(self, request, queryset):
    from apps.fleet_supervisor.services import mark_vehicle_under_maintenance
    for vehicle in queryset:
        mark_vehicle_under_maintenance(vehicle.id, performed_by=request.user)
    self.message_user(request, f"{queryset.count()} vehicle(s) marked Under Maintenance.")
```

- Sets `Vehicle.operational_status = OperationalStatus.UNDER_MAINTENANCE`
- Resets any linked `Assigned` TOs → `Created` (vehicle and driver unlinked)
- TDO must reassign vehicle

### 5.5 DriverStateLog Admin / Driver State Board (DS-02-6)

```python
@admin.register(DriverStateLog)
class DriverStateLogAdmin(ReadOnlyFleetAdmin):
    _fleet_read_perm = PermissionCodes.FLEET_DS_DRIVER_STATE_VIEW
    _ds_readonly_roles = ("tdo_own_fleet",)
```

**List View** (serves as the Driver State Board):

- Columns: Driver Name, Current State (badge via `state_badge` method using `format_html`), POI, Timestamp (Last Transition), Changed By, Trigger
- `state_badge` method: colour-coded state labels using `dfms-badge--`* CSS classes (same pattern as `_to_badge` in `transport/admin.py`)
- Filters: `trigger` (manual/auto), `to_state`
- Search: driver name (`driver__user__first_name`, `driver__user__last_name`)
- Read-only (no add/edit/delete — audit log)

**State badge helper** (follow `transport/admin.py` pattern):

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
  - Validates no overlapping leave for same driver (`DriverLeave.objects.filter(driver=driver, cancelled_at__isnull=True, end_date__gte=start_date, start_date__lte=end_date).exclude(pk=obj.pk)`)
  - Transitions driver `current_state` → `DriverCurrentState.ON_LEAVE` via state machine service when `start_date <= date.today()`
  - Logs transition to `DriverStateLog`

**Cancel action**:

- Sets `cancelled_at = timezone.now()`, `cancelled_by = request.user`
- Transitions driver `current_state` → `DriverCurrentState.AVAILABLE` via state machine service

**Validations**:

- `end_date >= start_date` (form-level `clean()`)
- No overlapping leave windows for same driver (service-level check)

### 5.8 WorkingHoursConfig Admin

```python
@admin.register(WorkingHoursConfig)
class WorkingHoursConfigAdmin(FleetSupervisorAdminBase):
    _fleet_read_perm = PermissionCodes.FLEET_DS_ATTENDANCE_READ
    _fleet_write_perm = PermissionCodes.FLEET_DS_ATTENDANCE_WRITE
```

- One config per tenant (use `get_or_create` in `save_model`); hide the "Add" button if one already exists

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

### 6.3 Inspection Completion → TO Status Transition (DS-01-5)

```python
# apps/fleet_supervisor/services.py
from apps.transport.constants import TOStatus

@transaction.atomic
def complete_inspection(inspection_id, performed_by):
    inspection = VehicleInspection.objects.select_for_update().get(id=inspection_id)

    # Validate all responses filled
    expected_count = ChecklistItem.objects.count()
    actual_count = inspection.responses.count()
    if actual_count < expected_count:
        raise BusinessRuleError("All checklist items must have responses.")

    inspection.status = 'completed'
    inspection.inspection_completed_at = timezone.now()
    inspection.save(update_fields=["status", "inspection_completed_at", "updated_at"])

    # Transition TO
    to = inspection.transport_order
    to.status = TOStatus.READY_FOR_DISPATCH
    to.save(update_fields=["status", "updated_at"])
```

### 6.4 Driver State Machine Service (DS-02-9)

```python
# apps/fleet_supervisor/services.py
from apps.users.models import DriverCurrentState

class InvalidStatusTransitionError(Exception):
    pass


class DriverStateMachine:
    VALID_TRANSITIONS = {
        DriverCurrentState.AVAILABLE:    [DriverCurrentState.ASSIGNED, DriverCurrentState.ON_LEAVE],
        DriverCurrentState.ASSIGNED:     [DriverCurrentState.ON_EXECUTION, DriverCurrentState.AVAILABLE],
        DriverCurrentState.ON_EXECUTION: [DriverCurrentState.AVAILABLE],
        DriverCurrentState.ON_LEAVE:     [DriverCurrentState.AVAILABLE],
    }

    @transaction.atomic
    def transition(self, driver, to_state, changed_by=None, trigger='manual', notes=None):
        from_state = driver.current_state
        if to_state not in self.VALID_TRANSITIONS.get(from_state, []):
            raise InvalidStatusTransitionError(
                f"Cannot transition from {from_state} to {to_state}"
            )
        driver.current_state = to_state
        driver.save(update_fields=["current_state", "updated_at"])

        DriverStateLog.objects.create(
            driver=driver,
            from_state=from_state,
            to_state=to_state,
            changed_by=changed_by,
            trigger=trigger,
            timestamp=timezone.now(),
            notes=notes,
        )
```

### 6.5 TLS-01 Hooks — Automatic Driver State Updates (DS-02-10)


| Event                        | Hook Action                                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------------ |
| TO assigned (TO-02)          | `DriverStateMachine().transition(driver, DriverCurrentState.ASSIGNED, trigger='auto')`     |
| TO execution starts (TLS-01) | `DriverStateMachine().transition(driver, DriverCurrentState.ON_EXECUTION, trigger='auto')` |
| TO completed (TLS-01)        | `DriverStateMachine().transition(driver, DriverCurrentState.AVAILABLE, trigger='auto')`    |


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

### 7.1 Vehicle Inspections (DS-01-8 through DS-01-13)

```http
GET    /api/v1/inspections/queue
       → TOs in Assigned status — supervisor inspection queue
       → Response: [{ to_id, to_reference, vehicle, driver, assigned_at }]

POST   /api/v1/inspections
       → Submit completed checklist; triggers TO → Ready for Dispatch
       → Body: { transport_order_id, responses: [{ checklist_item_id, status, remarks }] }
       → Response: { inspection_id, status: "completed", to_status: "ready_for_dispatch" }

GET    /api/v1/inspections/{inspection_id}
       → Inspection detail with all responses
       → Response: { inspection_id, to, vehicle, supervisor, status, responses: [...] }

POST   /api/v1/inspections/{inspection_id}/reject
       → Reject vehicle; TO stays Assigned; reason required
       → Body: { reason }
       → Response: { inspection_id, status: "rejected" }

POST   /api/v1/vehicles/{vehicle_id}/under-maintenance
       → Mark vehicle Under Maintenance; resets linked Assigned TOs to Created
       → Body: { reason (optional) }
       → Response: { vehicle_id, operational_status: "under_maintenance", reset_to_ids: [...] }

GET    /api/v1/checklist-template
       → Read-only — all predefined sections + items (for mobile/frontend rendering)
       → Response: { sections: [{ id, name, display_order, items: [{ id, name, item_number }] }] }
```

### 7.2 Driver State (DS-02-13)

```http
GET    /api/v1/drivers/state-board
       → Driver state board — filterable by state, POI
       → Filters: ?state=available&poi_id=...
       → Response: [{ driver_id, name, current_state, poi, last_transition_at }]

GET    /api/v1/drivers/{driver_id}/state
       → Single driver current state + transition history
       → Response: { driver_id, current_state, history: [{ from_state, to_state, trigger, timestamp, changed_by }] }
```

### 7.3 Driver Attendance (DS-02-11)

```http
POST   /api/v1/driver-attendance
       → Create attendance record
       → Body: { driver_id, poi_id, entry_datetime, exit_datetime (nullable), notes }
       → Response: { attendance_id, working_hours, warning (nullable) }

GET    /api/v1/driver-attendance
       → List attendance records
       → Filters: ?driver=...&date_from=...&date_to=...&poi=...
       → Response: [{ attendance_id, driver, poi, date, entry_datetime, exit_datetime, working_hours }]

PATCH  /api/v1/driver-attendance/{id}
       → Edit attendance entry (same-day only)
       → Body: { exit_datetime, notes }

DELETE /api/v1/driver-attendance/{id}
       → Delete attendance entry (same-day only, supervisor permission)
```

### 7.4 Driver Leave (DS-02-12)

```http
POST   /api/v1/driver-leave
       → Create leave record; triggers driver current_state → On Leave (if start_date <= today)
       → Body: { driver_id, start_date, end_date, reason }
       → Response: { leave_id, status: "active"/"upcoming" }

GET    /api/v1/driver-leave
       → List leave records
       → Filters: ?driver=...&status=active&date_from=...&date_to=...
       → Response: [{ leave_id, driver, start_date, end_date, reason, status }]

PATCH  /api/v1/driver-leave/{id}
       → Edit leave dates (before start only)
       → Body: { start_date, end_date, reason }

POST   /api/v1/driver-leave/{id}/cancel
       → Cancel leave; driver current_state → Available
       → Response: { leave_id, cancelled_at, driver_current_state: "available" }
```

---

## 8. Permissions & RBAC

### 8.1 Permission Codes (add to `apps/core/constants_rbac.py`)

Add the following attributes to the `PermissionCodes` class, following the existing `SCREAMING_SNAKE_CASE = "Dot.Separated.Code"` pattern:

```python
class PermissionCodes:
    # ... existing codes ...

    # Fleet operations — Vehicle Inspection
    FLEET_DS_INSPECTION_SUBMIT        = "Fleet.DriverSupervisor.Inspection.Submit"
    FLEET_DS_INSPECTION_REJECT        = "Fleet.DriverSupervisor.Inspection.Reject"
    FLEET_DS_INSPECTION_VIEW_QUEUE    = "Fleet.DriverSupervisor.Inspection.ViewQueue"
    FLEET_DS_INSPECTION_VIEW_HISTORY  = "Fleet.DriverSupervisor.Inspection.ViewHistory"

    # Fleet operations — Vehicle Maintenance
    FLEET_VEHICLE_SET_UNDER_MAINTENANCE = "Fleet.Vehicle.SetUnderMaintenance"

    # Fleet operations — Driver State
    FLEET_DS_DRIVER_STATE_VIEW         = "Fleet.DriverSupervisor.DriverState.View"
    FLEET_DS_DRIVER_STATE_VIEW_HISTORY = "Fleet.DriverSupervisor.DriverState.ViewHistory"

    # Fleet operations — Attendance
    FLEET_DS_ATTENDANCE_WRITE = "Fleet.DriverSupervisor.Attendance.Write"
    FLEET_DS_ATTENDANCE_READ  = "Fleet.DriverSupervisor.Attendance.Read"

    # Fleet operations — Leave
    FLEET_DS_LEAVE_WRITE  = "Fleet.DriverSupervisor.Leave.Write"
    FLEET_DS_LEAVE_READ   = "Fleet.DriverSupervisor.Leave.Read"
    FLEET_DS_LEAVE_CANCEL = "Fleet.DriverSupervisor.Leave.Cancel"

    # Menu — Fleet operations navigation
    MENU_FLEET_SUPERVISOR_VIEW = "Menu.Fleet.Supervisor.View"
```

Add corresponding entries to `PERMISSION_DEFINITIONS` in `apps/core/role_seed_data.py`:

```python
PERMISSION_DEFINITIONS: list[tuple[str, str, str, str]] = [
    # ... existing entries ...
    (PermissionCodes.FLEET_DS_INSPECTION_SUBMIT,        "Submit vehicle inspection",          "Fleet", "local"),
    (PermissionCodes.FLEET_DS_INSPECTION_REJECT,        "Reject vehicle inspection",          "Fleet", "local"),
    (PermissionCodes.FLEET_DS_INSPECTION_VIEW_QUEUE,    "View inspection queue",              "Fleet", "local"),
    (PermissionCodes.FLEET_DS_INSPECTION_VIEW_HISTORY,  "View inspection history",            "Fleet", "local"),
    (PermissionCodes.FLEET_VEHICLE_SET_UNDER_MAINTENANCE, "Mark vehicle under maintenance",   "Fleet", "local"),
    (PermissionCodes.FLEET_DS_DRIVER_STATE_VIEW,         "View driver state board",           "Fleet", "local"),
    (PermissionCodes.FLEET_DS_DRIVER_STATE_VIEW_HISTORY, "View driver state history",         "Fleet", "local"),
    (PermissionCodes.FLEET_DS_ATTENDANCE_WRITE,          "Create/update driver attendance",   "Fleet", "local"),
    (PermissionCodes.FLEET_DS_ATTENDANCE_READ,           "Read driver attendance",            "Fleet", "local"),
    (PermissionCodes.FLEET_DS_LEAVE_WRITE,               "Create/update driver leave",        "Fleet", "local"),
    (PermissionCodes.FLEET_DS_LEAVE_READ,                "Read driver leave",                 "Fleet", "local"),
    (PermissionCodes.FLEET_DS_LEAVE_CANCEL,              "Cancel driver leave",               "Fleet", "local"),
    (PermissionCodes.MENU_FLEET_SUPERVISOR_VIEW,         "View Fleet operations menu",        "Menu",  "local"),
]
```

### 8.2 Menu Permissions (add to `apps/core/portal_navigation.py`)

Add `Fleet operations` section to `PORTAL_NAV_SECTIONS` as shown in §0.1. Each item uses `permission_any` with the minimal codes it needs.

### 8.3 Role → Permission Mapping (update `apps/core/role_seed_data.py`)

`**driver_supervisor` role** (already exists in `SEED_ROLES` with role code `"driver_supervisor"` — update its permission list):

```python
(
    "driver_supervisor",
    "Driver Supervisor",
    PredefinedDepartment.OPERATIONS,
    [
        PermissionCodes.MENU_DASHBOARD_VIEW,
        PermissionCodes.TRANSPORT_TO_READ,
        PermissionCodes.MENU_TRANSPORT_ORDERS_VIEW,
        PermissionCodes.MENU_FLEET_SUPERVISOR_VIEW,
        # Inspection
        PermissionCodes.FLEET_DS_INSPECTION_SUBMIT,
        PermissionCodes.FLEET_DS_INSPECTION_REJECT,
        PermissionCodes.FLEET_DS_INSPECTION_VIEW_QUEUE,
        PermissionCodes.FLEET_DS_INSPECTION_VIEW_HISTORY,
        PermissionCodes.FLEET_VEHICLE_SET_UNDER_MAINTENANCE,
        # Driver State
        PermissionCodes.FLEET_DS_DRIVER_STATE_VIEW,
        PermissionCodes.FLEET_DS_DRIVER_STATE_VIEW_HISTORY,
        # Attendance
        PermissionCodes.FLEET_DS_ATTENDANCE_WRITE,
        PermissionCodes.FLEET_DS_ATTENDANCE_READ,
        # Leave
        PermissionCodes.FLEET_DS_LEAVE_WRITE,
        PermissionCodes.FLEET_DS_LEAVE_READ,
        PermissionCodes.FLEET_DS_LEAVE_CANCEL,
    ],
),
```

`**tdo_own_fleet` role** (add read-only fleet permissions to existing entry):

```python
# Add to existing tdo_own_fleet permissions:
PermissionCodes.FLEET_DS_DRIVER_STATE_VIEW,
PermissionCodes.FLEET_DS_ATTENDANCE_READ,
PermissionCodes.FLEET_DS_LEAVE_READ,
PermissionCodes.FLEET_DS_INSPECTION_VIEW_QUEUE,   # to see inspection status of TOs they assigned
```

`**tenant_admin**` already receives `*` or full permission set — no change needed for read-only access.

After updating `role_seed_data.py`, re-seed:

```bash
python manage.py seed_dfms_rbac --reset
```

---

## 9. Integration Points

### 9.1 With Transport (Sprint 3 TO-02, Sprint 4 TLS-01)

**TDO Assignment** (extend `apps/transport/admin.py` `TransportOrderAdmin.save_model`):

- Call `validate_vehicle_availability(vehicle)` → checks `vehicle.operational_status != OperationalStatus.UNDER_MAINTENANCE`
- Call `validate_driver_availability(driver)` → checks `driver.current_state != DriverCurrentState.ON_LEAVE`

**Inspection Completion** (DS-01-5):

- `VehicleInspection.status = 'completed'` → TO transitions `Assigned` → `Ready for Dispatch` via `complete_inspection()` service

**Under Maintenance** (DS-01-7):

- `Vehicle.operational_status = UNDER_MAINTENANCE` → linked `Assigned` TOs reset to `Created`

**TLS-01 Hooks** (DS-02-10):

- TO assignment → `DriverStateMachine().transition(driver, DriverCurrentState.ASSIGNED, trigger='auto')`
- Execution start → `DriverStateMachine().transition(driver, DriverCurrentState.ON_EXECUTION, trigger='auto')`
- TO completion → `DriverStateMachine().transition(driver, DriverCurrentState.AVAILABLE, trigger='auto')`

### 9.2 With Driver Mobile (Sprint 4 DM-01)

**Checklist Reference**:

- Mobile app fetches `GET /api/v1/checklist-template` for display purposes
- Inspection submission is supervisor-side only (not driver-submitted)

**Driver State Visibility**:

- Mobile reads `GET /api/v1/drivers/{driver_id}/state` to show `current_state`

---

## 10. Validation Rules

### 10.1 Vehicle Inspection

- All 54 checklist items must have `ChecklistResponse` entries before completion
- Rejection requires non-empty `rejection_reason`
- Cannot inspect a vehicle with `operational_status == UNDER_MAINTENANCE` (warning surfaced in UI)
- Cannot inspect a TO not in `Assigned` status

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
- Invalid transitions raise `InvalidStatusTransitionError`
- Every transition logged to `DriverStateLog`

---

## 11. Sub-task Reference

### DS-01 Sub-tasks (Vehicle Inspection)


| #        | Sub-task                                                                                          | Jira       |
| -------- | ------------------------------------------------------------------------------------------------- | ---------- |
| DS-01-1  | `ChecklistSection` + `ChecklistItem` models + data migration (seed 7 sections, 54 items)          | DFS-050-1  |
| DS-01-2  | `VehicleInspection` + `ChecklistResponse` models                                                  | DFS-050-2  |
| DS-01-3  | `VehicleInspectionAdmin` — list view (TO ref, vehicle, supervisor, status badge, date)            | DFS-050-3  |
| DS-01-4  | `VehicleInspectionAdmin` — change form with `ChecklistResponseInline` (TabularInline)             | DFS-050-4  |
| DS-01-5  | `VehicleInspectionAdmin.save_model` — validate + TO status transition via service                 | DFS-050-5  |
| DS-01-6  | `VehicleInspectionAdmin` — reject action + `_RejectReasonForm` (intermediate view via `get_urls`) | DFS-050-6  |
| DS-01-7  | `VehicleAdmin.mark_under_maintenance` action + `mark_vehicle_under_maintenance` service           | DFS-050-7  |
| DS-01-8  | Inspection queue API — `GET /api/v1/inspections/queue`                                            | DFS-050-8  |
| DS-01-9  | Checklist submission API — `POST /api/v1/inspections`                                             | DFS-050-9  |
| DS-01-10 | Inspection detail API — `GET /api/v1/inspections/{inspection_id}`                                 | DFS-050-10 |
| DS-01-11 | Inspection reject API — `POST /api/v1/inspections/{inspection_id}/reject`                         | DFS-050-11 |
| DS-01-12 | Under Maintenance API — `POST /api/v1/vehicles/{vehicle_id}/under-maintenance`                    | DFS-050-12 |
| DS-01-13 | Checklist template API — `GET /api/v1/checklist-template`                                         | DFS-050-13 |
| DS-01-14 | Audit logging — inspections, rejections, Under Maintenance decisions                              | DFS-050-14 |


### DS-02 Sub-tasks (Driver State, Attendance & Leave)


| #        | Sub-task                                                                                               | Jira       |
| -------- | ------------------------------------------------------------------------------------------------------ | ---------- |
| DS-02-1  | Add `ON_EXECUTION = "on_execution"` to `DriverCurrentState` enum in `apps/users/models.py` + migration | DFS-051-1  |
| DS-02-2  | `DriverAttendance` model + migration                                                                   | DFS-051-2  |
| DS-02-3  | `DriverLeave` model + migration                                                                        | DFS-051-3  |
| DS-02-4  | `DriverStateLog` audit model + migration                                                               | DFS-051-4  |
| DS-02-5  | `WorkingHoursConfig` model (max daily hours, default 12h)                                              | DFS-051-5  |
| DS-02-6  | `DriverStateLogAdmin` — list view (state board) with state badges, filters, read-only                  | DFS-051-6  |
| DS-02-7  | `DriverAttendanceAdmin` — list + change form, working hours validation, same-day guard                 | DFS-051-7  |
| DS-02-8  | `DriverLeaveAdmin` — leave form, overlap validation, state transition, cancel action                   | DFS-051-8  |
| DS-02-9  | `DriverStateMachine` service — transitions via `driver.current_state`, validation, audit               | DFS-051-9  |
| DS-02-10 | TLS-01 hooks — auto-update `driver.current_state` on TO lifecycle events                               | DFS-051-10 |
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
| **DS-01** | Vehicle daily inspection checklist (predefined, immutable) | Predefined section/item models + data migration + inspection/response flow + admin (`FleetSupervisorAdminBase`) + TO status transition service + Under Maintenance guard in `VehicleAdmin`                                                             |
| **DS-02** | Driver state, attendance & leave (supervisor)              | Add `ON_EXECUTION` to `DriverCurrentState` + `DriverStateMachine` service (uses `driver.current_state`) + TLS-01 hooks + attendance model + leave model + working hours config + admin + APIs + update `driver_supervisor` role in `role_seed_data.py` |


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

**Last Updated**: 2026-05-14
**Related Modules**: [05-transport](../05-transport/README.md), [03-users](../03-users/README.md) (Driver Interface), [02-master-data](../02-master-data/README.md)