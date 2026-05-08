---
module: 08-fleet-management
specification: Driver Supervisor Operations
version: 1.0
phase: Phase 1
sprint: Sprint 4
last_updated: 2026-05-06
related_stories: DFS-050 (DS-01), DFS-051 (DS-02)
jira_epic: DFS-070
---

# Driver Supervisor Operations Specification

## Overview

The **Driver Supervisor Operations** specification covers pre-movement compliance checks, operational readiness validation, and workforce attendance management for own-fleet execution. This layer sits **between TDO assignment (Sprint 3)** and **driver field execution (Sprint 4 DM-01)**, enforcing that vehicles and drivers meet operational readiness criteria before a Transport Order can progress to active execution.

Unlike master data management (MDM-05 Vehicle, MDM-06 Driver from Sprint 2), this module captures **operational truths** — daily attendance, leave windows, vehicle handover checklists, and health inspections — that change frequently and gate field execution.

**Module path**: `apps/users/supervisor/` (new sub-package under `apps/users/`)  
**Dependencies**: MDM-05 (Vehicle), MDM-06 (Driver), `05-transport` (TO execution state), `01-foundation` (RBAC)  
**Enables**: TDO assignment conflict checks (leave/maintenance), driver execution action guards, fleet readiness dashboard

---

## 0. Menu Structure & Navigation

```
Sidebar (Driver Supervisor)
└── Fleet
      └── Driver Supervisor
            ├── Vehicle Checklists              — template config + submission queue + review
            │     ├── Checklist Templates       — create/edit inspection templates
            │     ├── Pending Review            — submissions awaiting supervisor review
            │     └── Submission History        — all submissions (filterable by vehicle/driver/date)
            │
            ├── Driver Attendance               — daily punch in/out + working hours report
            │     ├── Mark Attendance           — manual entry form (driver, POI, entry/exit time)
            │     └── Attendance Log            — searchable history
            │
            └── Driver Leave Management         — On Leave windows
                  ├── Register Leave            — driver, start/end date, reason
                  └── Leave Calendar            — active/upcoming leave (filterable by driver)
```

### Role → menu mapping

| Role | Fleet > Driver Supervisor | Master Data (Driver/Vehicle) |
|------|:-------------------------:|:----------------------------:|
| Driver Supervisor | ✓ (full CRUD) | Read-only |
| Tenant Admin | ✓ (config templates) | ✓ (master CRUD) |
| TDO | — | Read-only (for assignment) |
| Driver | ✓ (submit checklists only) | Read-only (own profile) |

### Screen hierarchy

```
Fleet → Driver Supervisor → Vehicle Checklists
  ├── Checklist Templates (Admin list)
  │     └── [+ Create Template] ──► Template Config Form
  │                                    └── [Add Inspection Point] (8–10 items)
  │                                    └── [Save] ──► Template Detail (read-only)
  │
  ├── Pending Review (Supervisor queue)
  │     └── [row click] ──► Submission Detail
  │                           ├── Read-only: Driver remarks, inspection points (Pass/Fail per item)
  │                           ├── Supervisor Review Form
  │                           │     ├── Decision: Approve / Reject
  │                           │     ├── Remarks (required if reject)
  │                           │     └── [Submit Review]
  │                           │          └── If Approve: Vehicle status → Available
  │                           │          └── If Reject: Vehicle status → Under Maintenance; driver notified
  │                           └── [History] ──► All reviews for this vehicle
  │
  └── Submission History
        └── Searchable by vehicle, driver, date range, decision outcome

Fleet → Driver Supervisor → Driver Attendance
  ├── Mark Attendance
  │     └── Form: Driver (dropdown), POI (dropdown), Entry Time, Exit Time (nullable), Notes
  │           └── [Save] ──► Attendance Log (row added)
  │                          └── Auto-calculate: working_hours = exit - entry
  │
  └── Attendance Log
        └── Table: Driver, POI, Date, Entry, Exit, Hours, Notes
              └── [Edit] / [Delete] (same-day only)

Fleet → Driver Supervisor → Driver Leave Management
  ├── Register Leave
  │     └── Form: Driver (dropdown), Start Date, End Date, Reason (text)
  │           └── [Save] ──► Driver.current_state = On Leave (if start_date ≤ today ≤ end_date)
  │                          └── TDO assignment guard: conflict check enforced
  │
  └── Leave Calendar
        └── List: Driver, Start Date, End Date, Reason, Status (Active / Upcoming / Expired)
              └── [Cancel] (if not yet started)
```

---

## 1. Roles & Access

| Role | Template Config | Submit Checklist | Review Checklist | Attendance CRUD | Leave CRUD | Set Vehicle Under Maintenance |
|------|:---------------:|:----------------:|:----------------:|:---------------:|:----------:|:-----------------------------:|
| Driver Supervisor | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (via checklist reject) |
| Tenant Admin | ✓ | — | — | Read-only | Read-only | — |
| Driver | — | ✓ (own only) | — | — | — | — |
| TDO | — | — | — | Read-only | Read-only | — |

---

## 2. Data Model

### 2.1 ChecklistTemplate

```python
ChecklistTemplate {
    template_id: UUID
    name: string                        # e.g., "Long-Trip Handover", "Monthly Inspection"
    description: text
    template_type: enum                 # ['handover', 'long_trip', 'short_trip', 'monthly']
    
    # Scope
    is_active: boolean                  # Inactive templates not selectable for new submissions
    
    # Version tracking
    version: integer                    # Incremented on edit; submissions pin version
    
    # Metadata
    tenant_id: UUID
    created_by: UUID → User
    created_at: DateTime
    updated_at: DateTime
}
```

### 2.2 ChecklistItemTemplate

```python
ChecklistItemTemplate {
    item_id: UUID
    template_id: UUID → ChecklistTemplate
    
    # Inspection point definition
    item_number: integer                # Display order
    inspection_point: string            # e.g., "Brake system functional"
    is_mandatory: boolean               # If true, submission blocks on missing answer
    
    # Expected answer type
    answer_type: enum                   # ['pass_fail', 'text', 'numeric', 'photo']
    
    # Guidance
    help_text: text (nullable)          # Inspector guidance
}
```

### 2.3 VehicleChecklistSubmission

```python
VehicleChecklistSubmission {
    submission_id: UUID
    
    # Links
    vehicle_id: UUID → Vehicle
    driver_id: UUID → User (Driver)     # Who performed the inspection
    transport_order_id: UUID → TransportOrder (nullable)  # Linked TO if pre-movement check
    template_id: UUID → ChecklistTemplate
    template_version: integer           # Snapshot of template version at submission time
    
    # Inspection data
    answers: JSONField                  # {item_id: {answer: "Pass"/"Fail"/text, photo_url: string}}
    driver_remarks: text (nullable)
    
    # Submission metadata
    submitted_at: DateTime
    submission_status: enum             # ['pending_review', 'approved', 'rejected']
}
```

### 2.4 VehicleChecklistReview

```python
VehicleChecklistReview {
    review_id: UUID
    submission_id: UUID → VehicleChecklistSubmission
    
    # Reviewer
    reviewed_by: UUID → User (Driver Supervisor)
    
    # Decision
    decision: enum                      # ['approve', 'reject']
    supervisor_remarks: text
    
    # Side effects
    vehicle_state_changed: boolean      # True if vehicle → Under Maintenance
    
    # Metadata
    reviewed_at: DateTime
}
```

### 2.5 DriverAttendance

```python
DriverAttendance {
    attendance_id: UUID
    
    # Who/Where
    driver_id: UUID → User (Driver)
    poi_id: UUID → POI                  # Where attendance is recorded
    
    # Time tracking
    entry_datetime: DateTime
    exit_datetime: DateTime (nullable)  # Null if still checked in
    working_hours: Decimal (nullable)   # Auto-calculated: (exit - entry) in hours
    
    # Notes
    notes: text (nullable)
    
    # Metadata
    recorded_by: UUID → User (Driver Supervisor)
    tenant_id: UUID
    created_at: DateTime
    updated_at: DateTime
}
```

### 2.6 DriverLeave

```python
DriverLeave {
    leave_id: UUID
    
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
    
    # Metadata
    registered_by: UUID → User (Driver Supervisor)
    cancelled_at: DateTime (nullable)
    cancelled_by: UUID (nullable)
    tenant_id: UUID
    created_at: DateTime
}
```

### 2.7 Extensions to existing models

**Vehicle** (existing model in `apps/master_data/`):
- `current_state` enum gains value: `'under_maintenance'` (set by checklist review rejection)
- No migration needed if enum already flexible; otherwise add value

**Driver** (existing User model with driver role):
- `current_state` enum gains value: `'on_leave'` (computed on-the-fly from active `DriverLeave` records)
- Implementation: property method checks `DriverLeave.objects.filter(driver=self, start_date__lte=today, end_date__gte=today).exists()`

---

## 3. Checklist Lifecycle

### 3.1 Template configuration flow

```
Tenant Admin / Driver Supervisor
  └─► Create ChecklistTemplate (name, type, description)
        └─► Add ChecklistItemTemplate (8–10 inspection points)
              └─► [Save Template]
                    └─► Template.is_active = True
                          └─► Available for driver submissions
```

### 3.2 Submission → Review flow

```
Driver (or Supervisor on behalf of driver)
  └─► Select Vehicle + Template
        └─► Fill inspection points (Pass/Fail per item)
              └─► Add driver remarks (optional)
                    └─► [Submit Checklist]
                          └─► Status: pending_review
                                └─► Appears in Supervisor "Pending Review" queue

Driver Supervisor
  └─► Open submission from queue
        └─► Review answers + driver remarks
              ├─► [Approve]
              │     └─► Submission.status = approved
              │           └─► Vehicle remains Available (or becomes Available if was under maintenance)
              │
              └─► [Reject]
                    └─► Submission.status = rejected
                          └─► Vehicle.current_state = under_maintenance
                                └─► Driver notified (in-app or future notification)
                                      └─► TDO assignment guard: vehicle not selectable until state changed
```

---

## 4. Django Admin Configuration

### 4.1 ChecklistTemplate Admin

**List View**:
- Columns: Name, Type, Version, Active, Created By, Created At
- Filters: `template_type`, `is_active`
- Search: `name`
- Actions: Bulk activate/deactivate

**Detail View**:
- Inline: `ChecklistItemTemplate` (tabular inline, sortable by `item_number`)
- Fields: name, description, template_type, is_active, version (read-only)
- Save triggers: increment `version` if items changed

**Form Validations**:
- At least 3 items required per template
- `item_number` must be unique per template

### 4.2 VehicleChecklistSubmission Admin

**List View**:
- Columns: Vehicle, Driver, Template, Submitted At, Status, Reviewed By, Decision
- Filters: `submission_status`, `template__template_type`, `submitted_at` (date range)
- Search: Vehicle registration, Driver name
- Actions: Bulk export to CSV

**Detail View**:
- Read-only: Vehicle, Driver, TO (if linked), Template, Submitted At
- Expandable JSON widget for `answers` field
- Inline: `VehicleChecklistReview` (if status != pending_review)
- Custom admin action: **"Review Submission"** button (opens review form)

**Review Form** (custom admin view):
- Decision: Approve / Reject (radio buttons)
- Remarks: text area (required if reject)
- Submit button triggers:
  - Create `VehicleChecklistReview` record
  - Update `submission_status`
  - If reject: call service `vehicle_service.set_under_maintenance(vehicle_id, reason="Checklist rejected")`

### 4.3 DriverAttendance Admin

**List View**:
- Columns: Driver, POI, Entry Time, Exit Time, Working Hours, Recorded By, Date
- Filters: `poi_id`, `entry_datetime` (date range), `driver_id`
- Search: Driver name, POI name
- Date hierarchy: `entry_datetime`

**Detail/Edit View**:
- Fields: driver (FK dropdown), poi (FK dropdown), entry_datetime, exit_datetime, notes
- Save hook: auto-calculate `working_hours` if both entry/exit present
- Validation: `exit_datetime >= entry_datetime`
- Permission: edit/delete only if created today (guard in admin `has_change_permission`)

**Bulk Actions**:
- Export attendance report (CSV)

### 4.4 DriverLeave Admin

**List View**:
- Columns: Driver, Start Date, End Date, Status (computed), Reason, Registered By
- Filters: Status (Active/Upcoming/Expired — custom filter), `start_date` (date range)
- Search: Driver name
- Custom column: **Status badge** (green=Active, blue=Upcoming, gray=Expired)

**Detail/Edit View**:
- Fields: driver, start_date, end_date, reason
- Save hook: 
  - If `start_date <= today <= end_date`: trigger driver state refresh
  - Send notification to TDO if driver has active TO assignments
- Cancel action: set `cancelled_at = now()`, `cancelled_by = request.user`

**Validations**:
- `end_date >= start_date`
- No overlapping leave windows for same driver (service-level check)

---

## 5. Business Rules & Guards

### 5.1 TDO Assignment Conflict Checks (extends Sprint 3 TO-02)

When TDO assigns vehicle/driver to TO:

**Vehicle availability**:
```python
if vehicle.current_state == 'under_maintenance':
    raise ValidationError("Vehicle is Under Maintenance. Review pending checklist or clear maintenance status.")
```

**Driver availability**:
```python
if DriverLeave.objects.filter(
    driver=driver,
    start_date__lte=planned_dispatch_date,
    end_date__gte=planned_dispatch_date,
    cancelled_at__isnull=True
).exists():
    raise ValidationError(f"Driver is On Leave from {leave.start_date} to {leave.end_date}.")
```

### 5.2 First Driver Execution Action Guard (TLS-01 hook)

Per Sprint 4 contract, **§6.8.1.7 fleet availability validation** is enforced on **first driver execution action** (e.g., marking TO as execution started, gate-in, or mobile milestone). Service checks:

```python
def validate_execution_readiness(transport_order):
    vehicle = transport_order.assigned_vehicle
    driver = transport_order.assigned_driver
    
    # Vehicle must not be under maintenance
    if vehicle.current_state == 'under_maintenance':
        raise ExecutionBlockedError("Vehicle under maintenance.")
    
    # Driver must not be on leave
    if driver.is_on_leave:  # computed property
        raise ExecutionBlockedError("Driver is on leave.")
    
    # Optional: checklist policy enforcement
    if policy_requires_checklist(transport_order):
        if not has_approved_checklist(vehicle, driver, transport_order):
            raise ExecutionBlockedError("Pre-movement checklist not approved.")
```

### 5.3 Checklist Policy Enforcement (optional per tenant config)

Tenant-level setting (future Phase 2):
- `require_checklist_for_long_trips` (boolean)
- `require_checklist_for_all_trips` (boolean)

If enabled, execution guard checks for approved submission linked to TO.

---

## 6. API Endpoints

### 6.1 Checklist Templates

```http
GET    /api/v1/checklists/templates/
       → List all active templates
       → Filters: ?template_type=handover
       → Response: [{ template_id, name, type, items: [...] }]

POST   /api/v1/checklists/templates/
       → Create new template (admin/supervisor only)
       → Body: { name, description, template_type, items: [{inspection_point, answer_type, ...}] }

GET    /api/v1/checklists/templates/{template_id}/
       → Template detail with items

PUT    /api/v1/checklists/templates/{template_id}/
       → Update template (increments version)

DELETE /api/v1/checklists/templates/{template_id}/
       → Soft delete (set is_active=false)
```

### 6.2 Checklist Submissions

```http
GET    /api/v1/checklists/submissions/
       → List submissions
       → Filters: ?status=pending_review, ?vehicle_id=..., ?driver_id=...
       → Response: [{ submission_id, vehicle, driver, template, submitted_at, status }]

POST   /api/v1/checklists/submissions/
       → Driver submits checklist
       → Body: { vehicle_id, template_id, transport_order_id (nullable), answers: {...}, driver_remarks }
       → Response: { submission_id, status: "pending_review" }

GET    /api/v1/checklists/submissions/{submission_id}/
       → Submission detail (includes answers JSON)

POST   /api/v1/checklists/submissions/{submission_id}/review/
       → Supervisor reviews submission
       → Body: { decision: "approve"/"reject", remarks }
       → Side effects: Update vehicle state if reject
       → Response: { review_id, submission_status }
```

### 6.3 Attendance

```http
GET    /api/v1/attendance/
       → List attendance records
       → Filters: ?driver_id=..., ?poi_id=..., ?date_from=..., ?date_to=...
       → Response: [{ attendance_id, driver, poi, entry_datetime, exit_datetime, working_hours }]

POST   /api/v1/attendance/
       → Mark attendance
       → Body: { driver_id, poi_id, entry_datetime, exit_datetime (nullable), notes }
       → Response: { attendance_id, working_hours }

PUT    /api/v1/attendance/{attendance_id}/
       → Update (same-day only)
       → Body: { exit_datetime, notes }

DELETE /api/v1/attendance/{attendance_id}/
       → Delete (same-day only, supervisor permission)
```

### 6.4 Leave Management

```http
GET    /api/v1/leave/
       → List leave records
       → Filters: ?status=active, ?driver_id=...
       → Response: [{ leave_id, driver, start_date, end_date, reason, status }]

POST   /api/v1/leave/
       → Register leave
       → Body: { driver_id, start_date, end_date, reason }
       → Response: { leave_id, status: "registered" }

DELETE /api/v1/leave/{leave_id}/
       → Cancel leave (sets cancelled_at)
       → Only if not yet started
```

---

## 7. Permissions & RBAC

### 7.1 Permission Codes (add to `apps/core/constants_rbac.py`)

```python
# Checklist
Fleet.DriverSupervisor.Checklist.Configure
Fleet.DriverSupervisor.Checklist.Submit
Fleet.DriverSupervisor.Checklist.Review

# Attendance
Fleet.DriverSupervisor.Attendance.Write
Fleet.DriverSupervisor.Attendance.Read

# Leave
Fleet.DriverSupervisor.Leave.Write
Fleet.DriverSupervisor.Leave.Read

# Vehicle state control
Fleet.Vehicle.SetUnderMaintenance
```

### 7.2 Menu Permissions (add to `apps/core/portal_navigation.py`)

```python
Menu.Fleet.Supervisor.View
```

### 7.3 Role → Permission Mapping

**Driver Supervisor**:
- All `Fleet.DriverSupervisor.*` permissions
- `Fleet.Vehicle.SetUnderMaintenance`
- `MasterData.Driver.Read`, `MasterData.Vehicle.Read` (for dropdowns)

**Driver**:
- `Fleet.DriverSupervisor.Checklist.Submit` (own submissions only)

**TDO**:
- `Fleet.DriverSupervisor.Attendance.Read`
- `Fleet.DriverSupervisor.Leave.Read`
- (for assignment conflict checks)

**Tenant Admin**:
- All above permissions
- `Fleet.DriverSupervisor.Checklist.Configure` (template CRUD)

---

## 8. Integration Points

### 8.1 With Transport (Sprint 3 TO-02, Sprint 4 TLS-01)

**TDO Assignment** (`apps/transport/services/tdo_assignment_service.py`):
- Call: `validate_vehicle_availability(vehicle_id)` → checks `vehicle.current_state != 'under_maintenance'`
- Call: `validate_driver_availability(driver_id, planned_date)` → checks leave overlap

**First Execution Action** (`apps/transport/lifecycle/execution_guards.py`):
- Call: `validate_execution_readiness(transport_order)` → blocks if vehicle under maintenance or driver on leave

### 8.2 With Driver Mobile (Sprint 4 DM-01)

**Checklist Submission Entry Point**:
- Driver app includes "Pre-Movement Checklist" button on TO detail screen (optional per policy)
- On submit, links `transport_order_id` to submission

**Status Visibility**:
- Driver sees own checklist submission history
- Driver sees "Vehicle under maintenance" banner if last checklist rejected

---

## 9. Validation Rules

### 9.1 Checklist Template

- Template must have at least 3 items
- `item_number` must be unique within template
- Cannot deactivate template with pending submissions

### 9.2 Checklist Submission

- All mandatory items must have answers
- If `answer_type = 'photo'`, photo URL required in answer JSON
- Cannot submit checklist for vehicle already under maintenance (warning, not error)

### 9.3 Attendance

- `exit_datetime >= entry_datetime`
- Cannot have overlapping attendance for same driver (entry_new < exit_existing)
- Same-day edit/delete only

### 9.4 Leave

- `end_date >= start_date`
- Cannot have overlapping leave for same driver
- Cannot delete leave if `cancelled_at` already set

---

## 10. Reports & Dashboards (Phase 2 enhancements)

### 10.1 Fleet Readiness Dashboard

**Widgets**:
- Active drivers count (not on leave)
- Available vehicles count (not under maintenance)
- Pending checklist reviews count
- Average working hours per driver (last 30 days)

### 10.2 Compliance Reports

- Checklist submission rate (% of trips with approved checklist)
- Rejection rate by template type
- Average review time (submission → review)
- Top rejection reasons (from supervisor remarks)

---

## 11. Dependencies

### Upstream
- `02-master-data`: Vehicle (MDM-05), Driver (MDM-06), POI (MDM-04)
- `01-foundation`: RBAC, User model

### Downstream
- `05-transport`: TDO assignment guards, execution guards (TLS-01)
- `09-mobile-apps`: Driver checklist submission (DM-01 optional)

---

## 12. Sprint 4 Story Mapping

| Story | Scope | Implementation Focus |
|-------|-------|----------------------|
| **DS-01** | Vehicle licence, health & handover checklists | Template model + submission/review flow + admin UI + vehicle state guard |
| **DS-02** | Driver state, attendance & leave (supervisor) | Attendance model + leave model + TDO assignment guards + admin UI |

---

**Last Updated**: 2026-05-06  
**Related Modules**: [05-transport](../05-transport/README.md), [03-users](../03-users/README.md) (Driver Interface), [02-master-data](../02-master-data/README.md)
