---
module: 08-fleet-management
specification: Driver Supervisor Operations
version: 2.0
phase: Phase 1
sprint: Sprint 4
last_updated: 2026-05-13
related_stories: DFS-050 (DS-01), DFS-051 (DS-02)
jira_epic: DFS-070
---

# Driver Supervisor Operations Specification

## Overview

The **Driver Supervisor Operations** specification covers pre-movement vehicle inspections, driver state management, workforce attendance, and leave management for own-fleet execution. This layer sits **between TDO assignment (Sprint 3)** and **driver field execution (Sprint 4 DM-01)**, enforcing that vehicles and drivers meet operational readiness criteria before a Transport Order can progress to active execution.

Unlike master data management (MDM-05 Vehicle, MDM-06 Driver from Sprint 2), this module captures **operational truths** — daily inspections, driver state transitions, attendance, leave windows, and maintenance decisions — that change frequently and gate field execution.

**Module path**: `apps/users/supervisor/` (new sub-package under `apps/users/`)  
**Dependencies**: MDM-05 (Vehicle), MDM-06 (Driver), `05-transport` (TO execution state), `01-foundation` (RBAC)  
**Enables**: TDO assignment conflict checks (leave/maintenance), driver execution action guards, fleet readiness dashboard

---

## 0. Menu Structure & Navigation

### 0.1 Implemented portal sidebar (code)

Tenant portal navigation is **not** a nested tree in the API. It is defined in `apps/core/portal_navigation.py` as `PORTAL_NAV_SECTIONS` and exposed via `build_portal_navigation()` as:

`{ "sections": [ { "heading", "icon", "items": [ { "id", "label", "url", "icon" } ] } ] }`

**Rules today**

- **Flat structure**: each **section** has a `heading` and a list of **items**; each item is a **single** link (typically a Django Admin `url`). There is no first-class “folder” item with child rows—deeper IA is expressed as **separate sibling links** or **in-page** tabs/routes on the target screen.
- **Visibility**: `_item_visible()` grants an item if the user matches `permission_any` (resolved permission codes must intersect the item’s list), or matches optional `role_any` (OR shortcut before permission check), unless blocked by `role_exclude`.
- **Platform admin** uses `PLATFORM_NAV_SECTIONS` only (tenant ops menus are omitted).

**Gap vs this spec**: there is **no** `heading: "Fleet operations"` block and **no** Driver Supervisor operations links in `PORTAL_NAV_SECTIONS` yet (vehicle inspections, state board, attendance, leave admin/APIs from DS-01/DS-02 are still to be wired). When added, they should follow the same **flat** pattern: e.g. a **Fleet operations** section whose items are one link per changelist/form surface, each gated by `Menu.*` / `Fleet.DriverSupervisor.*` as in §8.

### 0.2 Fleet operations — target information architecture (product)

The tree below is **conceptual grouping** for DS-01 / DS-02 UX (screens and drill-down), **not** a representation of nested sidebar JSON.

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

| Role | Fleet operations (target items) | Master Data (Driver/Vehicle) |
|------|:-------------------------:|:----------------------------:|
| Driver Supervisor | ✓ (full operational CRUD) | — (no Master Data permission) |
| Tenant Admin | ✓ (read-only config view) | ✓ (master CRUD) |
| TDO | ✓ (state board, leave — read-only) | — (no Master Data permission) |
| Driver | — | — (no Master Data permission) |

\* **Fleet operations column** describes **target** access once Fleet operations menu items exist in `portal_navigation.py`. Until then, portal visibility for `driver_supervisor` follows whatever sections/items intersect that role’s seeded `Menu.*` / transport permissions (see `apps/core/role_seed_data.py`).

### Screen hierarchy

**Target product flow** (same IA as §0.2; routes may be SPA or Admin—implementation detail).

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
  └── Table: Driver, Current State (badge), POI, Last Transition, Changed By
        └── Filters: state, POI
        └── [row click] ──► State History (audit log)

Fleet operations → Driver Attendance
  ├── Mark Attendance
  │     └── Form: Driver (dropdown), POI (dropdown), Entry Time, Exit Time (nullable), Notes
  │           └── [Save] ──► Attendance Log (row added)
  │                          └── Auto-calculate: working_hours = exit - entry
  │                          └── Warning if hours > configured max (default 12h)
  │
  └── Attendance Log
        └── Table: Driver, POI, Date, Entry, Exit, Hours, Notes
              └── [Edit] / [Delete] (same-day only)

Fleet operations → Driver Leave Management
  ├── Register Leave
  │     └── Form: Driver (dropdown), Start Date, End Date, Reason (text)
  │           └── [Save] ──► Driver state → On Leave (via state machine service)
  │                          └── TDO assignment guard: conflict check enforced
  │
  └── Leave Calendar
        └── List: Driver, Start Date, End Date, Reason, Status (Active / Upcoming / Expired)
              └── [Cancel] (if not yet started or active — driver → Available)
```

---

## 1. Roles & Access

| Role | View Checklist Reference | Complete Inspection | Reject Vehicle | Mark Under Maintenance | Attendance CRUD | Leave CRUD | View State Board |
|------|:------------------------:|:-------------------:|:--------------:|:----------------------:|:---------------:|:----------:|:----------------:|
| Driver Supervisor | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Tenant Admin | ✓ | — | — | — | Read-only | Read-only | Read-only |
| TDO | ✓ | — | — | — | Read-only | Read-only | ✓ (read-only) |
| Driver | — | — | — | — | — | — | — |

---

## 2. Data Model

### 2.1 ChecklistSection (predefined, immutable)

```python
ChecklistSection {
    id: UUID (pk)
    name: string                        # e.g., "Engine", "Clutch", "Gear Box"
    display_order: integer              # Section ordering (1–7)

    # Metadata (TenantAwareModel)
    tenant_id: UUID
    created_at: DateTime
    updated_at: DateTime
}
```

**Predefined sections** (seeded via data migration — DS-01-1):

| # | Section | Items Count |
|---|---------|:-----------:|
| 1 | Engine | 9 |
| 2 | Clutch | 6 |
| 3 | Gear Box | 5 |
| 4 | Container | 6 |
| 5 | Electric | 13 |
| 6 | Chassis | 5 |
| 7 | Cabin | 10 |

### 2.2 ChecklistItem (predefined, immutable)

```python
ChecklistItem {
    id: UUID (pk)
    section_id: UUID → ChecklistSection
    name: string                        # e.g., "Engine Oil", "Air Filter"
    item_number: integer                # Display order within section
    remarks: text (nullable)            # Optional predefined guidance/remarks

    # Metadata (TenantAwareModel)
    tenant_id: UUID
    created_at: DateTime
    updated_at: DateTime
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
    id: UUID (pk)

    # Links
    transport_order_id: UUID → TransportOrder  # The TO being inspected (must be in Assigned status)
    vehicle_id: UUID → Vehicle                 # Vehicle assigned to the TO
    supervisor_id: UUID → User                 # Driver Supervisor performing inspection

    # Inspection outcome
    status: enum                       # ['pending', 'completed', 'rejected']
    inspection_completed_at: DateTime (nullable)  # Set on successful completion
    rejection_reason: text (nullable)  # Required when status = rejected

    # Metadata (TenantAwareModel)
    tenant_id: UUID
    created_at: DateTime
    updated_at: DateTime
}
```

### 2.4 ChecklistResponse

```python
ChecklistResponse {
    id: UUID (pk)
    inspection_id: UUID → VehicleInspection
    checklist_item_id: UUID → ChecklistItem

    # Response data
    status: enum                       # ['ok', 'issue', 'na']
    remarks: text (nullable)           # Supervisor remarks for this item

    # Metadata (TenantAwareModel)
    tenant_id: UUID
    created_at: DateTime
    updated_at: DateTime
}
```

### 2.5 DriverAttendance

```python
DriverAttendance {
    attendance_id: UUID (pk)

    # Who/Where
    driver_id: UUID → User (Driver)
    poi_id: UUID → POI                  # Where attendance is recorded
    date: Date                          # Attendance date

    # Time tracking
    entry_datetime: DateTime
    exit_datetime: DateTime (nullable)  # Null if still checked in
    working_hours: Decimal (nullable)   # Auto-calculated: (exit - entry) in hours

    # Notes
    notes: text (nullable)

    # Metadata (TenantAwareModel)
    recorded_by: UUID → User (Driver Supervisor)
    tenant_id: UUID
    created_at: DateTime
    updated_at: DateTime

    # Constraints
    unique_together: (driver_id, date)
}
```

### 2.6 DriverLeave

```python
DriverLeave {
    leave_id: UUID (pk)

    # Who
    driver_id: UUID → User (Driver)

    # When
    start_date: Date
    end_date: Date

    # Why
    reason: text

    # Status (computed)
    # Active: today between start_date and end_date
    # Upcoming: start_date > today
    # Expired: end_date < today
    # Cancelled: cancelled_at is not null

    # Metadata (TenantAwareModel)
    registered_by: UUID → User (Driver Supervisor)
    cancelled_at: DateTime (nullable)
    cancelled_by: UUID (nullable)
    tenant_id: UUID
    created_at: DateTime
}
```

### 2.7 DriverStateLog (audit model)

```python
DriverStateLog {
    id: UUID (pk)

    # Who
    driver_id: UUID → User (Driver)

    # Transition
    from_state: enum                   # DriverState enum value
    to_state: enum                     # DriverState enum value

    # Audit
    changed_by: UUID → User (nullable) # Null for system/auto transitions
    timestamp: DateTime
    trigger: enum                      # ['manual', 'auto']
    notes: text (nullable)             # Optional context (e.g., "TO #123 assigned")

    # Metadata (TenantAwareModel)
    tenant_id: UUID
}
```

### 2.8 WorkingHoursConfig

```python
WorkingHoursConfig {
    id: UUID (pk)
    max_daily_hours: Decimal            # Default 12.0; configurable per tenant
    warning_enabled: boolean            # Default True — soft warning, not hard block

    # Metadata (TenantAwareModel)
    tenant_id: UUID (unique)            # One config per tenant
    created_at: DateTime
    updated_at: DateTime
}
```

### 2.9 Extensions to existing models

**Vehicle** (existing model in `apps/master_data/`):
- `current_state` enum gains value: `'under_maintenance'` (set by supervisor via Under Maintenance action)
- When set to Under Maintenance: vehicle excluded from TDO assignment dropdown

**Driver** (existing User model with driver role):
- New field: `state` — `DriverState` enum (TextChoices):
  - `AVAILABLE` = "available" (default)
  - `ASSIGNED` = "assigned"
  - `ON_LEAVE` = "on_leave"
  - `ON_EXECUTION` = "on_execution"
- State is an explicit persisted field, not computed
- All transitions go through the Driver State Machine Service (§5.3)

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
        └─► Vehicle.current_state = under_maintenance
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

### 4.2 Transition rules

| From | To | Trigger | Type |
|------|----|---------|------|
| Available | Assigned | TDO assigns TO (TO-02) | Auto |
| Assigned | On Execution | TO execution starts (TLS-01) | Auto |
| On Execution | Available | TO completed (TLS-01) | Auto |
| Assigned | Available | TO unlinked / cancelled | Auto |
| Available | On Leave | Supervisor registers leave | Manual |
| On Leave | Available | Leave ends or cancelled | Manual/Auto |

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

### 5.1 ChecklistSection Admin (read-only)

**List View**:
- Columns: Name, Display Order, Items Count
- Read-only (no add/edit/delete — data is immutable, seeded by migration)

### 5.2 ChecklistItem Admin (read-only)

**List View**:
- Columns: Section, Item Number, Name
- Filters: `section`
- Read-only (no add/edit/delete — data is immutable, seeded by migration)

### 5.3 VehicleInspection Admin (DS-01-3, DS-01-4, DS-01-5, DS-01-6)

**List View** (DS-01-3):
- Columns: TO Reference, Vehicle (registration), Supervisor, Status, Inspection Date
- Filters: `status`, `vehicle`
- Search: TO number
- Queryset: filtered to TOs in `Assigned` status (for inspection queue view)

**Change Form** (DS-01-4):
- Header fields (read-only): TO reference, vehicle, supervisor
- Inline: `ChecklistResponseInline` — all items grouped by section; remarks field per item
- Read-only fields for completed inspections (no editing after submission)

**save_model** (DS-01-5):
- Validates all `ChecklistResponse` entries are filled
- Sets `inspection_completed_at = now()`
- Transitions TO status: `Assigned` → `Ready for Dispatch`

**Reject action** (DS-01-6):
- Custom admin action with `_RejectReasonForm` (reason required)
- TO stays in `Assigned` status
- Vehicle flagged for follow-up
- Rejection reason persisted on `VehicleInspection.rejection_reason`

### 5.4 VehicleAdmin — Under Maintenance action (DS-01-7)

**Custom action**: `mark_under_maintenance`
- Sets `Vehicle.current_state = under_maintenance`
- Calls service: reset any linked `Assigned` TO → `Created` (vehicle unlinked)
- TDO must reassign vehicle

### 5.5 DriverStateAdmin (DS-02-6)

**List View**:
- Columns: Driver Name, Current State (badge), POI, Last Transition Timestamp
- `state_badge` method: colour-coded state labels
- Filters: `state`, `poi`
- Search: driver name
- `get_readonly_fields`: non-supervisor roles see everything as read-only

### 5.6 DriverAttendanceAdmin (DS-02-7)

**List View**:
- Columns: Driver, POI, Date, Entry Time, Exit Time, Working Hours, Recorded By
- Filters: `poi_id`, `date`, `driver_id`
- Search: Driver name, POI name
- Date hierarchy: `date`

**Change Form**:
- Fields: driver (FK dropdown), poi (FK dropdown), date, entry_datetime, exit_datetime, notes
- `save_model`:
  - Validates unique-together (driver, date)
  - Auto-calculates `working_hours` if both entry/exit present
  - Displays warning if working hours exceed `WorkingHoursConfig.max_daily_hours`
- Validation: `exit_datetime >= entry_datetime`
- Permission: edit/delete only if created today (guard in `has_change_permission`)

**Bulk Actions**: Export attendance report (CSV)

### 5.7 DriverLeaveAdmin (DS-02-8)

**List View**:
- Columns: Driver, Start Date, End Date, Status (computed badge), Reason, Registered By
- Filters: Status (Active/Upcoming/Expired — custom filter), `start_date` (date range)
- Search: Driver name
- Custom column: **Status badge** (green=Active, blue=Upcoming, gray=Expired, red=Cancelled)

**Change Form**:
- Fields: driver, start_date, end_date, reason
- `save_model`:
  - Validates no overlapping leave for same driver
  - Transitions driver state → `On Leave` via state machine service
  - Logs transition to `DriverStateLog`
- Cancel action: sets `cancelled_at = now()`, `cancelled_by = request.user`; transitions driver → `Available`

**Validations**:
- `end_date >= start_date`
- No overlapping leave windows for same driver (service-level check)

### 5.8 DriverStateLog Admin (read-only audit)

**List View**:
- Columns: Driver, From State, To State, Changed By, Trigger, Timestamp
- Filters: `trigger` (manual/auto), `to_state`
- Search: Driver name
- Read-only (no add/edit/delete — audit log)

---

## 6. Business Rules & Guards

### 6.1 TDO Assignment Conflict Checks (extends Sprint 3 TO-02)

When TDO assigns vehicle/driver to TO:

**Vehicle availability** (DS-01-7):
```python
if vehicle.current_state == 'under_maintenance':
    raise BusinessRuleError("Vehicle is Under Maintenance. Cannot assign to TO.")
```

**Driver availability** (DS-02-14):
```python
if driver.state == DriverState.ON_LEAVE:
    raise BusinessRuleError("Driver is On Leave. Cannot assign to TO.")
```

### 6.2 Under Maintenance → TO Reset Guard (DS-01-7)

```python
@transaction.atomic
def mark_vehicle_under_maintenance(vehicle_id, reason, performed_by):
    vehicle = Vehicle.objects.select_for_update().get(id=vehicle_id)
    vehicle.current_state = 'under_maintenance'
    vehicle.save()

    # Reset any linked Assigned TOs to Created
    assigned_tos = TransportOrder.objects.filter(
        assigned_vehicle=vehicle,
        status='assigned'
    )
    for to in assigned_tos:
        to.status = 'created'
        to.assigned_vehicle = None
        to.assigned_driver = None
        to.save()

    # Audit log
    AuditLog.create(action='vehicle_under_maintenance', ...)
```

### 6.3 Inspection Completion → TO Status Transition (DS-01-5)

```python
@transaction.atomic
def complete_inspection(inspection_id, performed_by):
    inspection = VehicleInspection.objects.get(id=inspection_id)

    # Validate all responses filled
    expected_count = ChecklistItem.objects.count()
    actual_count = inspection.responses.count()
    if actual_count < expected_count:
        raise BusinessRuleError("All checklist items must have responses.")

    inspection.status = 'completed'
    inspection.inspection_completed_at = timezone.now()
    inspection.save()

    # Transition TO
    to = inspection.transport_order
    to.status = 'ready_for_dispatch'
    to.save()
```

### 6.4 Driver State Machine Service (DS-02-9)

```python
class DriverStateMachine:
    VALID_TRANSITIONS = {
        DriverState.AVAILABLE: [DriverState.ASSIGNED, DriverState.ON_LEAVE],
        DriverState.ASSIGNED: [DriverState.ON_EXECUTION, DriverState.AVAILABLE],
        DriverState.ON_EXECUTION: [DriverState.AVAILABLE],
        DriverState.ON_LEAVE: [DriverState.AVAILABLE],
    }

    @transaction.atomic
    def transition(self, driver, to_state, changed_by=None, trigger='manual', notes=None):
        from_state = driver.state
        if to_state not in self.VALID_TRANSITIONS.get(from_state, []):
            raise InvalidStatusTransitionError(
                f"Cannot transition from {from_state} to {to_state}"
            )
        driver.state = to_state
        driver.save()

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

| Event | Hook Action |
|-------|-------------|
| TO assigned (TO-02) | `driver_state_machine.transition(driver, ASSIGNED, trigger='auto')` |
| TO execution starts (TLS-01) | `driver_state_machine.transition(driver, ON_EXECUTION, trigger='auto')` |
| TO completed (TLS-01) | `driver_state_machine.transition(driver, AVAILABLE, trigger='auto')` |

### 6.6 Working Hours Guardrail (DS-02-15)

```python
def check_working_hours_warning(driver, date):
    config = WorkingHoursConfig.objects.get(tenant=driver.tenant)
    attendance = DriverAttendance.objects.get(driver=driver, date=date)
    if attendance.working_hours and attendance.working_hours > config.max_daily_hours:
        return Warning(f"Driver exceeded {config.max_daily_hours}h limit ({attendance.working_hours}h recorded)")
    return None
```

Soft warning only — not a hard block in MVP.

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
       → Response: { vehicle_id, state: "under_maintenance", reset_to_ids: [...] }

GET    /api/v1/checklist-template
       → Read-only — all predefined sections + items (for mobile/frontend rendering)
       → Response: { sections: [{ id, name, display_order, items: [{ id, name, item_number }] }] }
```

### 7.2 Driver State (DS-02-13)

```http
GET    /api/v1/drivers/state-board
       → Driver state board — filterable by state, POI
       → Filters: ?state=available&poi_id=...
       → Response: [{ driver_id, name, state, poi, last_transition_at }]

GET    /api/v1/drivers/{driver_id}/state
       → Single driver current state + transition history
       → Response: { driver_id, current_state, history: [{ from, to, trigger, timestamp, changed_by }] }
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
       → Response: [{ attendance_id, driver, poi, date, entry, exit, hours }]

PATCH  /api/v1/driver-attendance/{id}
       → Edit attendance entry (same-day only)
       → Body: { exit_datetime, notes }

DELETE /api/v1/driver-attendance/{id}
       → Delete attendance entry (same-day only, supervisor permission)
```

### 7.4 Driver Leave (DS-02-12)

```http
POST   /api/v1/driver-leave
       → Create leave record; triggers driver state → On Leave
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
       → Cancel leave; driver state → Available
       → Response: { leave_id, cancelled_at, driver_state: "available" }
```

---

## 8. Permissions & RBAC

### 8.1 Permission Codes (add to `apps/core/constants_rbac.py`)

```python
# Vehicle Inspection
Fleet.DriverSupervisor.Inspection.Submit
Fleet.DriverSupervisor.Inspection.Reject
Fleet.DriverSupervisor.Inspection.ViewQueue
Fleet.DriverSupervisor.Inspection.ViewHistory

# Vehicle Maintenance
Fleet.Vehicle.SetUnderMaintenance

# Driver State
Fleet.DriverSupervisor.DriverState.View
Fleet.DriverSupervisor.DriverState.ViewHistory

# Attendance
Fleet.DriverSupervisor.Attendance.Write
Fleet.DriverSupervisor.Attendance.Read

# Leave
Fleet.DriverSupervisor.Leave.Write
Fleet.DriverSupervisor.Leave.Read
Fleet.DriverSupervisor.Leave.Cancel
```

### 8.2 Menu Permissions (add to `apps/core/portal_navigation.py`)

Register a top-level section with **`heading`: `"Fleet operations"`** (display label in the portal) and **flat** `items`—one dict per link—each using `permission_any` (and `role_any` only where the product explicitly needs a role shortcut, matching existing patterns). Example gate for the section’s operational links:

```python
Menu.Fleet.Supervisor.View  # add to PermissionCodes + seed; not present in repo until DS nav is implemented
# Sidebar shows under "Fleet operations"; permission code can stay Menu.Fleet.* for catalog consistency
```

Each concrete screen (inspection queue, attendance admin, etc.) should list the minimal `Menu.*` / `Fleet.*` codes it needs rather than relying on a single umbrella, so visibility stays aligned with §1 and §8.3.

### 8.3 Role → Permission Mapping

**Driver Supervisor**:
- All `Fleet.DriverSupervisor.*` permissions
- `Fleet.Vehicle.SetUnderMaintenance`
- No `MasterData.*` permissions — driver, vehicle, and POI context in Fleet operations UIs comes from Fleet/Transport APIs (TO-linked data, state board, operational endpoints), not Master Data RBAC.

**TDO**:
- `Fleet.DriverSupervisor.DriverState.View`
- `Fleet.DriverSupervisor.Attendance.Read`
- `Fleet.DriverSupervisor.Leave.Read`
- (for assignment conflict checks and visibility)
- No `MasterData.*` permissions

**Tenant Admin**:
- All above permissions (read-only view)

---

## 9. Integration Points

### 9.1 With Transport (Sprint 3 TO-02, Sprint 4 TLS-01)

**TDO Assignment** (`apps/transport/services/tdo_assignment_service.py`):
- Call: `validate_vehicle_availability(vehicle_id)` → checks `vehicle.current_state != 'under_maintenance'`
- Call: `validate_driver_availability(driver_id)` → checks `driver.state != ON_LEAVE`

**Inspection Completion** (DS-01-5):
- On `VehicleInspection.status = completed` → TO transitions `Assigned` → `Ready for Dispatch`

**Under Maintenance** (DS-01-7):
- On vehicle Under Maintenance → linked `Assigned` TOs reset to `Created`

**TLS-01 Hooks** (DS-02-10):
- TO assignment → driver `Available` → `Assigned`
- Execution start → driver `Assigned` → `On Execution`
- TO completion → driver `On Execution` → `Available`

### 9.2 With Driver Mobile (Sprint 4 DM-01)

**Checklist Reference**:
- Mobile app fetches `GET /api/v1/checklist-template` for display purposes
- Inspection submission is supervisor-side only (not driver-submitted)

**Driver State Visibility**:
- Mobile reads `GET /api/v1/drivers/{driver_id}/state` to show current assignment state

---

## 10. Validation Rules

### 10.1 Vehicle Inspection

- All 54 checklist items must have `ChecklistResponse` entries before completion
- Rejection requires non-empty `rejection_reason`
- Cannot inspect a vehicle already under maintenance (warning surfaced in UI)
- Cannot inspect a TO not in `Assigned` status

### 10.2 Attendance

- `exit_datetime >= entry_datetime`
- Unique-together: (driver, date) — one attendance record per driver per day
- Same-day edit/delete only
- Working hours warning when exceeding `WorkingHoursConfig.max_daily_hours`

### 10.3 Leave

- `end_date >= start_date`
- Cannot have overlapping leave for same driver
- Cannot cancel already-cancelled leave
- Cannot edit leave after start_date has passed

### 10.4 Driver State Transitions

- Only valid transitions per state machine (§4.2) are accepted
- Invalid transitions raise `InvalidStatusTransitionError`
- Every transition logged to `DriverStateLog`

---

## 11. Sub-task Reference

### DS-01 Sub-tasks (Vehicle Inspection)

| # | Sub-task | Jira |
|---|----------|------|
| DS-01-1 | `ChecklistSection` + `ChecklistItem` models + data migration (seed 7 sections, 54 items) | DFS-050-1 |
| DS-01-2 | `VehicleInspection` + `ChecklistResponse` models | DFS-050-2 |
| DS-01-3 | `VehicleInspectionAdmin` — list view (TO ref, vehicle, supervisor, status, date) | DFS-050-3 |
| DS-01-4 | `VehicleInspectionAdmin` — change form with `ChecklistResponseInline` | DFS-050-4 |
| DS-01-5 | `VehicleInspectionAdmin.save_model` — validate + TO status transition | DFS-050-5 |
| DS-01-6 | `VehicleInspectionAdmin` — reject action + `_RejectReasonForm` | DFS-050-6 |
| DS-01-7 | `VehicleAdmin.mark_under_maintenance` action + TO reset guard | DFS-050-7 |
| DS-01-8 | Inspection queue API — `GET /api/v1/inspections/queue` | DFS-050-8 |
| DS-01-9 | Checklist submission API — `POST /api/v1/inspections` | DFS-050-9 |
| DS-01-10 | Inspection detail API — `GET /api/v1/inspections/{inspection_id}` | DFS-050-10 |
| DS-01-11 | Inspection reject API — `POST /api/v1/inspections/{inspection_id}/reject` | DFS-050-11 |
| DS-01-12 | Under Maintenance API — `POST /api/v1/vehicles/{vehicle_id}/under-maintenance` | DFS-050-12 |
| DS-01-13 | Checklist template API — `GET /api/v1/checklist-template` | DFS-050-13 |
| DS-01-14 | Audit logging — inspections, rejections, Under Maintenance decisions | DFS-050-14 |

### DS-02 Sub-tasks (Driver State, Attendance & Leave)

| # | Sub-task | Jira |
|---|----------|------|
| DS-02-1 | `DriverState` enum field on Driver model + migration | DFS-051-1 |
| DS-02-2 | `DriverAttendance` model + migration | DFS-051-2 |
| DS-02-3 | `DriverLeave` model + migration | DFS-051-3 |
| DS-02-4 | `DriverStateLog` audit model + migration | DFS-051-4 |
| DS-02-5 | `WorkingHoursConfig` model (max daily hours, default 12h) | DFS-051-5 |
| DS-02-6 | `DriverStateAdmin` — list view with state badges, filters, read-only guards | DFS-051-6 |
| DS-02-7 | `DriverAttendanceAdmin` — list + change form, working hours validation | DFS-051-7 |
| DS-02-8 | `DriverLeaveAdmin` — leave form, overlap validation, state transition | DFS-051-8 |
| DS-02-9 | Driver state machine service — transitions, validation, audit | DFS-051-9 |
| DS-02-10 | TLS-01 hooks — auto-update driver state on TO lifecycle events | DFS-051-10 |
| DS-02-11 | Attendance CRUD API — `POST/GET/PATCH/DELETE /api/v1/driver-attendance` | DFS-051-11 |
| DS-02-12 | Leave CRUD API — `POST/GET/PATCH /api/v1/driver-leave` + cancel | DFS-051-12 |
| DS-02-13 | Driver state board API — `GET /api/v1/drivers/state-board` | DFS-051-13 |
| DS-02-14 | TO-02 conflict guard — On Leave drivers blocked from assignment | DFS-051-14 |
| DS-02-15 | Working hours guardrail — warning on threshold exceeded | DFS-051-15 |
| DS-02-16 | Supervisor UI — attendance grid, leave calendar, state board | DFS-051-16 |
| DS-02-17 | Audit logging — state transitions, attendance, leave records | DFS-051-17 |

---

## 12. Sprint 4 Story Mapping

| Story | Scope | Implementation Focus |
|-------|-------|----------------------|
| **DS-01** | Vehicle daily inspection checklist (predefined, immutable) | Predefined section/item models + data migration + inspection/response flow + admin + TO status transition + Under Maintenance guard |
| **DS-02** | Driver state, attendance & leave (supervisor) | DriverState enum + state machine service + TLS-01 hooks + attendance model + leave model + working hours config + admin + APIs |

---

## 13. Dependencies

### Upstream
- `02-master-data`: Vehicle (MDM-05), Driver (MDM-06), POI (MDM-04)
- `01-foundation`: RBAC, User model, TenantAwareModel
- `05-transport`: TransportOrder model (TO-02 assignment, TLS-01 lifecycle)

### Downstream
- `05-transport`: TDO assignment guards, execution guards (TLS-01), TO status transitions
- `09-mobile-apps`: Checklist reference display, driver state visibility (DM-01)

---

**Last Updated**: 2026-05-13  
**Related Modules**: [05-transport](../05-transport/README.md), [03-users](../03-users/README.md) (Driver Interface), [02-master-data](../02-master-data/README.md)
