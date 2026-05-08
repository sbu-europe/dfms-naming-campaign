---
module: 06-poi-operations
specification: Command Center & Loading/Unloading Operations (Sprint 4)
version: 1.0
phase: Phase 1
sprint: Sprint 4
last_updated: 2026-05-06
related_stories: DFS-063 (LUP-01), DFS-056 (CC-01), DFS-057 (LD-01)
jira_epic: DFS-074
---

# Command Center & Loading/Unloading Operations Specification (Sprint 4)

## Overview

The **Command Center & Loading/Unloading** specification covers three interconnected functions:

1. **Loading/Unloading Points (LUP-01)**: Master data for physical bays/lines/docks within a POI
2. **Command Center (CC-01)**: Queue management, bay assignment, waiting serial issuance, QC checkpoint trigger
3. **Loading/Unloading Operations (LD-01)**: Timestamp capture for load/unload start/end, bags count, seal number, weight

The Command Center is the **orchestration hub** for post-scale yard operations — it receives vehicles from the scale-in queue (via queue tokens from SC-01), assigns them to specific loading/unloading points, and triggers QC checkpoints for RM inbound flows. Loading/unloading personnel record actual execution timestamps at the assigned bay.

**Module path**: 
- `apps/operations/loading/` (POIOperationPoint master + LoadingOperation events)
- `apps/operations/command_center/` (new sub-package for queue + bay assignment)

**Dependencies**: `apps/operations/gate/` (GateVisitSession), `apps/operations/scaling/` (QueueToken), `05-transport` (TransportOrder), `02-master-data` (POI)  
**Enables**: Scale-out clearance (SC-01), QC checkpoint (QC-01), Gate-out clearance (GT-01)

---

## 0. Menu Structure & Navigation

```
Sidebar (Command Center Officer)
└── Operations
      └── Command Center
            ├── Queue Dashboard                  — live view of post-scale vehicles awaiting assignment
            │     └── [row click] ──► Assign Bay Form
            │
            ├── Active Assignments               — vehicles currently loading/unloading (assigned bay, not yet complete)
            │     └── [row click] ──► Assignment Detail (read-only timeline)
            │
            └── Assignment History               — completed bay assignments (searchable)
                  └── [Export CSV]

Sidebar (Loading / Unloading Personnel)
└── Operations
      └── Loading / Unloading
            ├── My Assignments                   — assigned bays for current user (or all active if admin)
            │     └── [row click] ──► Loading/Unloading Form
            │
            └── Completion History               — past load/unload events
                  └── [Export CSV]

Sidebar (Tenant Admin / POI Manager)
└── Master Data
      └── POI Operation Points                   — manage loading/unloading bays per POI
            ├── POI List
            │     └── [row click] ──► POI Detail → [Manage Points]
            │
            └── Point Configuration
                  ├── [+ Add Point] ──► Point Form (code, name, type: load/unload/both, capacity, is_active)
                  └── [Edit Point] / [Deactivate Point]
```

### Role → menu mapping

| Role | Queue Dashboard | Assign Bay | My Assignments | POI Operation Points |
|------|:---------------:|:----------:|:--------------:|:--------------------:|
| Command Center Officer | ✓ | ✓ | — | Read-only |
| Loading Personnel | — | — | ✓ (load bays) | — |
| Unloading Personnel | — | — | ✓ (unload bays) | — |
| Tenant Admin | ✓ (read-only) | — | — | ✓ (CRUD) |
| POI Manager | — | — | — | ✓ (own POI) |

---

## 1. Data Model

### 1.1 POIOperationPoint (LUP-01 master)

```python
POIOperationPoint {
    point_id: UUID
    poi: FK → POI                               # Parent POI
    
    # Identification
    code: string                                # Unique within POI (e.g., "BAY-01", "LINE-A")
    name: string                                # Display name (e.g., "North Loading Bay")
    
    # Type
    operation_type: enum                        # ['load', 'unload', 'both']
    
    # Capacity (Phase 2)
    capacity_vehicles: integer (nullable)       # Max vehicles at once (default 1)
    
    # Status
    is_active: boolean                          # Inactive points not assignable
    
    # Metadata
    tenant_id: UUID
    created_by: FK → User
    created_at: DateTime
    updated_at: DateTime
}
```

**Constraints**:
- Unique: `(poi, code)` — code must be unique within POI

### 1.2 BayAssignment (CC-01)

```python
BayAssignment {
    assignment_id: UUID
    
    # Core links
    transport_order: FK → TransportOrder
    gate_visit_session: FK → GateVisitSession
    operation_point: FK → POIOperationPoint    # Assigned bay/line/dock
    queue_token: FK → QueueToken               # Queue token from SC-01
    
    # Assignment
    assigned_at: DateTime
    assigned_by: FK → User (Command Center Officer)
    waiting_serial: integer                     # Queue number per operation point (e.g., 1, 2, 3...)
    
    # Status
    assignment_status: enum                     # ['assigned', 'started', 'completed', 'cancelled']
    
    # Completion
    completed_at: DateTime (nullable)           # When loading/unloading operation ends
    
    # QC Trigger (RM inbound only)
    qc_triggered: boolean                       # True if Command Center triggered QC checkpoint
    qc_triggered_at: DateTime (nullable)
    
    # Metadata
    tenant_id: UUID
    created_at: DateTime
    updated_at: DateTime
}
```

**Constraints**:
- Unique: `(gate_visit_session)` — one bay assignment per visit
- `waiting_serial` unique per `(operation_point, assignment_status != 'cancelled')` on same day

### 1.3 LoadingOperation (LD-01)

```python
LoadingOperation {
    operation_id: UUID
    
    # Core links
    transport_order: FK → TransportOrder
    gate_visit_session: FK → GateVisitSession
    operation_point: FK → POIOperationPoint    # Bay where operation occurred
    bay_assignment: FK → BayAssignment          # Link to assignment
    
    # Operation type (inferred from TO flow_type)
    operation_type: enum                        # ['loading', 'unloading']
    
    # Timestamps
    start_at: DateTime                          # Operation start time
    end_at: DateTime (nullable)                 # Operation end time
    
    # Loading-specific (FG outbound)
    bags_count: integer (nullable)              # Number of bags loaded
    seal_number: string (nullable)              # Seal number applied to vehicle
    weight_kg: Decimal (nullable)               # Weight loaded (optional if scale captures)
    
    # Unloading-specific (FG/RM inbound)
    unloaded_bags_count: integer (nullable)
    unloaded_weight_kg: Decimal (nullable)
    
    # Personnel
    recorded_by: FK → User (Loading/Unloading Personnel)
    
    # Remarks
    remarks: text (nullable)
    
    # Metadata
    tenant_id: UUID
    created_at: DateTime
    updated_at: DateTime
}
```

**Constraints**:
- Unique: `(gate_visit_session, operation_type)` — one loading or unloading per visit
- `end_at >= start_at` (validation)

---

## 2. LUP-01: POI Operation Points Master

### 2.1 Point Configuration Flow

```
Tenant Admin / POI Manager opens Master Data → POI Operation Points
  └─► Select POI from list
        └─► [Manage Points] button
              └─► Operation Points List for selected POI
                    ├─► [+ Add Point] ──► Point Form
                    │     ├─► Code: "BAY-01" (unique within POI)
                    │     ├─► Name: "North Loading Bay"
                    │     ├─► Operation Type: Load / Unload / Both (radio buttons)
                    │     ├─► Capacity Vehicles: 1 (default, Phase 2 multi-vehicle)
                    │     ├─► Is Active: Yes (checkbox)
                    │     └─► [Save]
                    │           └─► POIOperationPoint created
                    │                 └─► Available for Command Center bay assignment
                    │
                    └─► [Edit Point] ──► Point Form (pre-filled)
                          └─► Can change: Name, Capacity, Is Active
                                └─► Cannot change: Code, Operation Type (immutable after creation — audit trail)
                                      └─► [Save] ──► Point updated
```

### 2.2 Point Deactivation

```
Admin clicks [Deactivate] on a point row
  └─► Confirmation modal: "This point will not be assignable. Active assignments will complete."
        └─► [Confirm]
              └─► Update POIOperationPoint.is_active = False
                    └─► Point hidden from Command Center bay assignment dropdowns
                          └─► Existing active assignments unaffected (complete normally)
```

### 2.3 Django Admin Configuration (POIOperationPoint)

**List View**:
- Columns: POI, Code, Name, Operation Type, Capacity, Active, Created At
- Filters: `poi`, `operation_type`, `is_active`
- Search: Code, Name
- Actions: Bulk activate/deactivate

**Detail View**:
- Fields: POI (FK dropdown), Code, Name, Operation Type, Capacity, Is Active
- Validation: Code unique within POI
- Edit restrictions: Code + Operation Type immutable after creation (read-only in edit form)

---

## 3. CC-01: Command Center Queue & Bay Assignment

### 3.1 Queue Dashboard View

```
Command Center Officer opens Queue Dashboard (default view)
  └─► Backend query:
        GateVisitSession.objects.filter(
          poi=officer_poi,
          scale_record__scale_in_at__isnull=False,  # Scaled in (have queue token)
          bayassignment__isnull=True  # Not yet assigned to bay
        ).order_by('scale_record__scale_in_at')
        
  └─► Table displays:
        - Token (P.C. Code)
        - TO Number
        - Vehicle (registration)
        - Product (item code + name)
        - Quantity (MT)
        - Flow Type (FG Outbound / FG Inbound / RM Inbound) — badge color-coded
        - Operation Needed (Load / Unload) — derived from flow_type
        - Scale-In Time (how long waiting)
        - [Assign Bay] button
```

### 3.2 Bay Assignment Flow

```
Officer clicks [Assign Bay] on a queue row
  └─► Assignment Form opens (modal)
        ├─► Read-only section:
        │     ├─► TO Summary: TO#, Product, Quantity, Vehicle, Driver
        │     ├─► Token: P.C. Code
        │     └─► Operation Needed: Load / Unload
        │
        ├─► Input section:
        │     ├─► Operation Point: dropdown (filtered by operation_type matching operation_needed)
        │     │     └─► Example: If "Load" needed, show only points where operation_type IN ('load', 'both')
        │     ├─► Waiting Serial: auto-generated (next sequential number for selected point)
        │     └─► (Optional) Assign Personnel: dropdown (loading/unloading user) — Phase 2
        │
        ├─► QC Trigger (RM Inbound only):
        │     └─► If flow_type = 'rm_inbound':
        │           └─► Checkbox: [✓] Trigger QC Checkpoint after unloading (auto-checked, read-only)
        │                 └─► Info: "QC checkpoint will be created when bay assignment is saved."
        │
        └─► [Assign Bay]
              └─► Backend:
                    ├─► Validate: operation_point.is_active = True, operation_point.operation_type matches operation_needed
                    │
                    ├─► Generate waiting_serial:
                    │     └─► waiting_serial = max(BayAssignment.waiting_serial for same operation_point, same day) + 1
                    │
                    ├─► Create BayAssignment:
                    │     ├─► assignment_status = 'assigned'
                    │     ├─► assigned_at = now()
                    │     ├─► assigned_by = current_user
                    │     └─► waiting_serial = computed
                    │
                    ├─► If flow_type = 'rm_inbound':
                    │     └─► Create TOQCCheckpoint (QC-01):
                    │           ├─► transport_order = visit.transport_order
                    │           ├─► triggered_by = current_user (Command Center Officer)
                    │           ├─► sampling_done = False
                    │           └─► qc_passed = None (pending decision)
                    │                 └─► Update BayAssignment.qc_triggered = True
                    │
                    ├─► Update TO.execution_state (if needed):
                    │     └─► If TO.execution_state = 'scale_in_source': → 'loading_assigned' or 'unloading_assigned'
                    │
                    ├─► Write TOExecutionEvent (TLS-01):
                    │     └─► event_type = 'bay_assigned', payload = {operation_point_code, waiting_serial}
                    │
                    └─► Response:
                          ├─► Success message: "Bay BAY-01 assigned. Serial: 3. QC checkpoint created (RM)."
                          └─► Remove from Queue Dashboard → appears in Active Assignments
```

### 3.3 Active Assignments View

```
Command Center Officer opens Active Assignments
  └─► Backend query:
        BayAssignment.objects.filter(
          operation_point__poi=officer_poi,
          assignment_status__in=['assigned', 'started']
        ).order_by('assigned_at')
        
  └─► Table displays:
        - Waiting Serial
        - TO Number
        - Vehicle
        - Bay (operation_point.code)
        - Status (Assigned / Started)
        - Assigned At
        - QC Required (✓ if qc_triggered)
        - [View Detail] button
```

**Assignment Detail** (read-only):
- TO summary
- Bay assignment info (point, serial, assigned at/by)
- Loading/unloading timestamps (if started/completed)
- QC checkpoint status (if RM)

### 3.4 Django Admin Configuration (BayAssignment)

**List View**:
- Columns: TO Number, Vehicle, Bay (operation_point.code), Waiting Serial, Status, Assigned At, QC Triggered, Completed At
- Filters: `assignment_status`, `operation_point__poi`, `assigned_at` (date range), `qc_triggered`
- Search: TO number, Vehicle registration
- Actions: Bulk export CSV

**Status Badge**:
- Blue: Assigned (not started)
- Yellow: Started (loading/unloading in progress)
- Green: Completed
- Gray: Cancelled

**Detail View**:
- Read-only: TO (link), Visit (link), Operation Point (link), Queue Token (link), Waiting Serial, Assigned At/By
- Editable: Assignment Status (admin override only)
- Custom admin action: **"View TO Timeline"** (redirect to TLS-01)
- Inline: LoadingOperation (if exists) — read-only

---

## 4. LD-01: Loading/Unloading Timestamp Capture

### 4.1 My Assignments View (Loading/Unloading Personnel)

```
Loading Personnel logs in → opens My Assignments
  └─► Backend query:
        BayAssignment.objects.filter(
          operation_point__poi=personnel_poi,
          operation_point__operation_type__in=['load', 'both'],  # Loading personnel see load bays
          assignment_status='assigned'  # Not yet started
        ).order_by('waiting_serial')
        
  └─► Table displays:
        - Serial #
        - TO Number
        - Vehicle
        - Bay
        - Product
        - Quantity (MT)
        - [Start Loading] button
```

### 4.2 Loading Start

```
Personnel clicks [Start Loading] on an assignment row
  └─► Loading Start Form (modal or page)
        ├─► Read-only: TO Summary, Bay, Serial, Vehicle
        ├─► Start Time: auto-filled with now() (editable if needed)
        ├─► Remarks: text area (optional)
        └─► [Start]
              └─► Backend:
                    ├─► Create LoadingOperation:
                    │     ├─► operation_type = 'loading'
                    │     ├─► start_at = form.start_time
                    │     ├─► recorded_by = current_user
                    │     └─► remarks = form.remarks
                    │
                    ├─► Update BayAssignment.assignment_status = 'started'
                    │
                    ├─► Update TO.execution_state → 'loading'
                    │
                    ├─► Write TOExecutionEvent (TLS-01):
                    │     └─► event_type = 'loading_started'
                    │
                    └─► Response:
                          ├─► Success: "Loading started at Bay BAY-01."
                          └─► Assignment remains in My Assignments (status: Started)
                                └─► [End Loading] button now enabled
```

### 4.3 Loading End

```
Personnel clicks [End Loading] on a started assignment row
  └─► Loading End Form
        ├─► Read-only: TO Summary, Bay, Start Time
        ├─► End Time: auto-filled with now() (editable)
        ├─► Bags Count: integer input (required for FG)
        ├─► Seal Number: text input (optional)
        ├─► Weight (kg): decimal input (optional — scale captures gross/net)
        ├─► Remarks: text area (optional)
        └─► [Complete Loading]
              └─► Backend:
                    ├─► Validate: end_at >= start_at
                    │
                    ├─► Update LoadingOperation:
                    │     ├─► end_at = form.end_time
                    │     ├─► bags_count = form.bags_count
                    │     ├─► seal_number = form.seal_number
                    │     ├─► weight_kg = form.weight_kg
                    │     └─► remarks += form.remarks
                    │
                    ├─► Update BayAssignment.assignment_status = 'completed', completed_at = now()
                    │
                    ├─► Update TO.execution_state → 'loading_done'
                    │
                    ├─► Write TOExecutionEvent (TLS-01):
                    │     └─► event_type = 'loading_completed', payload = {bags_count, seal_number}
                    │
                    └─► Response:
                          ├─► Success: "Loading completed. Vehicle released to scale-out."
                          └─► Remove from My Assignments → appears in Completion History
                                └─► Vehicle now eligible for scale-out (SC-01)
```

### 4.4 Unloading Start & End (parallel flow for Unloading Personnel)

**Unloading Start**:
- Same as Loading Start, but `operation_type = 'unloading'`
- `TO.execution_state → 'unloading'`

**Unloading End**:
- Same as Loading End, but captures `unloaded_bags_count`, `unloaded_weight_kg`
- No seal number (not applicable to unloading)
- After unloading end:
  - If `qc_triggered = True` (RM inbound): QC checkpoint must complete before scale-out
  - If `qc_triggered = False` (FG inbound): vehicle released to scale-out

### 4.5 Django Admin Configuration (LoadingOperation)

**List View**:
- Columns: TO Number, Vehicle, Bay (operation_point.code), Operation Type, Start Time, End Time, Duration (computed), Bags Count, Seal Number, Personnel
- Filters: `operation_type`, `operation_point__poi`, `start_at` (date range), Status (Completed / In Progress)
- Search: TO number, Vehicle registration, Seal number
- Actions: Bulk export CSV

**Detail View**:
- Read-only: TO (link), Visit (link), Bay Assignment (link), Operation Point (link), Operation Type
- Timestamps: Start At, End At, Duration (computed: end - start)
- Loading data: Bags Count, Seal Number, Weight (kg)
- Unloading data: Unloaded Bags Count, Unloaded Weight (kg)
- Personnel: Recorded By
- Remarks: text area (read-only)
- Custom admin action: **"View TO Timeline"** (redirect to TLS-01)

---

## 5. API Endpoints

### 5.1 POI Operation Points (LUP-01)

```http
GET    /api/v1/master-data/poi/{poi_id}/operation-points/
       → List operation points for a POI
       → Filters: ?operation_type=load, ?is_active=true
       → Response: [
           {
             point_id,
             code: "BAY-01",
             name: "North Loading Bay",
             operation_type: "load",
             capacity_vehicles: 1,
             is_active: true
           }
         ]

POST   /api/v1/master-data/poi/{poi_id}/operation-points/
       → Create operation point
       → Body: {code, name, operation_type, capacity_vehicles, is_active}
       → Response: {point_id, message: "Operation point created."}

PUT    /api/v1/master-data/operation-points/{point_id}/
       → Update operation point (name, capacity, is_active only)
       → Body: {name, is_active}
```

### 5.2 Command Center Queue (CC-01)

```http
GET    /api/v1/command-center/queue/
       → List vehicles in post-scale queue (awaiting bay assignment)
       → Filters: ?poi_id=...
       → Response: [
           {
             visit_id,
             token: {pc_code},
             transport_order: {to_number, product, quantity_mt, flow_type},
             vehicle: {registration},
             scale_in_at,
             operation_needed: "loading" | "unloading",
             waiting_time_minutes: 25
           }
         ]

POST   /api/v1/command-center/assign-bay/
       → Assign vehicle to bay
       → Body: {
           gate_visit_session_id: UUID,
           operation_point_id: UUID
         }
       → Validations:
           - Visit must have queue token
           - Operation point must be active
           - Operation point type must match operation_needed
       → Side effects:
           - Create BayAssignment
           - Generate waiting_serial
           - If RM inbound: create TOQCCheckpoint
           - Update TO execution_state
           - Write TOExecutionEvent
       → Response: {
           assignment_id,
           waiting_serial: 3,
           message: "Bay BAY-01 assigned. Serial: 3."
         }

GET    /api/v1/command-center/active-assignments/
       → List active bay assignments (assigned or started, not completed)
       → Filters: ?poi_id=..., ?status=assigned
       → Response: [
           {
             assignment_id,
             transport_order: {to_number},
             vehicle: {registration},
             operation_point: {code, name},
             waiting_serial,
             assignment_status,
             assigned_at,
             qc_triggered
           }
         ]
```

### 5.3 Loading/Unloading Operations (LD-01)

```http
GET    /api/v1/loading/my-assignments/
       → List bay assignments for loading/unloading personnel
       → Filters: ?operation_type=loading (auto-filtered by user role)
       → Response: [
           {
             assignment_id,
             transport_order: {to_number, product, quantity_mt},
             vehicle: {registration},
             operation_point: {code, name},
             waiting_serial,
             assignment_status,
             loading_operation: {start_at, end_at} | null
           }
         ]

POST   /api/v1/loading/start/
       → Start loading/unloading operation
       → Body: {
           bay_assignment_id: UUID,
           start_at: "2026-05-06T14:00:00Z" (optional, defaults to now),
           remarks: "Starting load of 50 MT broiler feed"
         }
       → Side effects:
           - Create LoadingOperation
           - Update BayAssignment.assignment_status = 'started'
           - Update TO execution_state
           - Write TOExecutionEvent
       → Response: {
           operation_id,
           message: "Loading started at Bay BAY-01."
         }

POST   /api/v1/loading/complete/
       → Complete loading/unloading operation
       → Body: {
           operation_id: UUID,
           end_at: "2026-05-06T15:30:00Z" (optional, defaults to now),
           bags_count: 1000 (loading only),
           seal_number: "SEAL-12345" (loading only),
           weight_kg: 50000 (optional),
           unloaded_bags_count: 1000 (unloading only),
           unloaded_weight_kg: 50000 (unloading only),
           remarks: "Loading complete, seal applied"
         }
       → Validations:
           - end_at >= start_at
           - bags_count > 0 (if loading)
       → Side effects:
           - Update LoadingOperation
           - Update BayAssignment.assignment_status = 'completed', completed_at = now
           - Update TO execution_state
           - Write TOExecutionEvent
       → Response: {
           operation_id,
           message: "Loading completed. Vehicle released to scale-out."
         }
```

---

## 6. Business Rules

### 6.1 Bay Assignment Rules

**Operation Type Matching**:
- FG Outbound: needs **loading** → assign to point where `operation_type IN ('load', 'both')`
- FG Inbound: needs **unloading** → assign to point where `operation_type IN ('unload', 'both')`
- RM Inbound: needs **unloading** → assign to point where `operation_type IN ('unload', 'both')`

**Waiting Serial**:
- Auto-generated per operation point per day
- Resets daily (or continuous — product decision)
- Sequential: 1, 2, 3, ... (next available number)

**QC Trigger** (RM Inbound only):
- Command Center **automatically** creates `TOQCCheckpoint` when assigning unloading bay for RM inbound TOs
- Checkbox in bay assignment form is read-only (auto-checked for RM)
- QC checkpoint blocks gate-out until `qc_passed = true` (see QC-01 spec)

### 6.2 Loading/Unloading Operation Rules

**Start**:
- Can only start if bay assignment exists (`assignment_status = 'assigned'`)
- Cannot start if already started (unique constraint)

**Complete**:
- Can only complete if operation started (`start_at not null`)
- `end_at >= start_at` (validation)
- Bags count required for FG operations (optional for RM — weight is primary)
- Seal number required for **loading** operations (not applicable to unloading)

**Scale-Out Eligibility**:
- FG Outbound: loading_operation.end_at not null
- FG Inbound: unloading_operation.end_at not null
- RM Inbound: unloading_operation.end_at not null **AND** TOQCCheckpoint.qc_passed = true

### 6.3 Operation Point Capacity (Phase 2)

- `capacity_vehicles` field tracks max simultaneous vehicles per point
- Command Center validates: cannot assign if `count(active_assignments for point) >= capacity_vehicles`
- Sprint 4: default capacity = 1 (one vehicle per bay)

---

## 7. Integration Points

### 7.1 With Scaling (SC-01)

**Queue token handoff**:
- After scale-in, vehicle appears in Command Center queue (via queue token)
- Command Center bay assignment references `queue_token` FK

**Scale-out prerequisite**:
- Loading/unloading operation must complete before scale-out queue visibility

### 7.2 With QC (QC-01)

**QC checkpoint trigger**:
- Command Center creates `TOQCCheckpoint` for RM inbound TOs at bay assignment time
- QC sampling + decision blocks gate-out (see QC-01 spec)

### 7.3 With Gate Operations (GT-01)

**Gate-out clearance**:
- Gate-out validates: loading/unloading operation complete (per flow type)
- If RM inbound: also validates QC passed

### 7.4 With Transport Lifecycle (TLS-01)

**Timeline events**:
- Bay assigned: `TOExecutionEvent(event_type='bay_assigned', payload={operation_point_code, waiting_serial})`
- Loading started: `TOExecutionEvent(event_type='loading_started')`
- Loading completed: `TOExecutionEvent(event_type='loading_completed', payload={bags_count, seal_number})`
- Unloading started: `TOExecutionEvent(event_type='unloading_started')`
- Unloading completed: `TOExecutionEvent(event_type='unloading_completed', payload={unloaded_bags_count})`

---

## 8. Permissions & RBAC

### 8.1 Permission Codes (add to `apps/core/constants_rbac.py`)

```python
# Operation Points (LUP-01)
Operations.OperationPoint.Write
Operations.OperationPoint.Read

# Command Center (CC-01)
Operations.CommandCenter.Queue.Read
Operations.CommandCenter.AssignBay
Operations.CommandCenter.Serial.Issue
Operations.CommandCenter.QCTrigger

# Loading/Unloading (LD-01)
Operations.LoadUnload.Start
Operations.LoadUnload.End
Operations.LoadUnload.Read
```

### 8.2 Menu Permissions (add to `apps/core/portal_navigation.py`)

```python
Menu.CommandCenter.View
Menu.CommandCenter.Queue.View
Menu.LoadUnload.View
Menu.MasterData.OperationPoints.View
```

### 8.3 Role → Permission Mapping

**Command Center Officer**:
- `Operations.CommandCenter.Queue.Read`
- `Operations.CommandCenter.AssignBay`
- `Operations.CommandCenter.Serial.Issue`
- `Operations.CommandCenter.QCTrigger`
- `Operations.OperationPoint.Read`
- `Transport.TO.Read`, `Transport.TO.ExecutionTimeline.Read`

**Loading Personnel**:
- `Operations.LoadUnload.Start` (load operations only)
- `Operations.LoadUnload.End` (load operations only)
- `Operations.LoadUnload.Read`
- `Transport.TO.Read` (assigned TOs only)

**Unloading Personnel**:
- `Operations.LoadUnload.Start` (unload operations only)
- `Operations.LoadUnload.End` (unload operations only)
- `Operations.LoadUnload.Read`
- `Transport.TO.Read` (assigned TOs only)

**Tenant Admin**:
- All above permissions
- `Operations.OperationPoint.Write`

---

## 9. Validation Rules

### 9.1 POI Operation Point (LUP-01)

- Code required (max 20 chars, alphanumeric + dash/underscore)
- Code unique within POI
- Name required (max 100 chars)
- Operation type required (load/unload/both)
- Cannot delete point with active assignments (soft delete: set is_active=false)

### 9.2 Bay Assignment (CC-01)

- Visit must have queue token (scale-in complete)
- Operation point must be active
- Operation point type must match operation needed
- Cannot assign if visit already assigned (unique constraint)

### 9.3 Loading/Unloading Operation (LD-01)

- Start time required
- End time >= start time
- Bags count > 0 (if FG loading/unloading)
- Seal number required (if loading — max 50 chars)
- Cannot complete if not started

---

## 10. Reports & Dashboards (Phase 2)

### 10.1 Bay Utilization Report

- Average wait time in Command Center queue (scale-in to bay assignment)
- Average loading/unloading duration per bay
- Bay occupancy rate (% time busy)

### 10.2 Loading Performance Metrics

- Bags per hour (loading throughput)
- Top performing loading personnel (by speed + accuracy)
- Seal discrepancies log

---

## 11. Dependencies

### Upstream
- `apps/operations/gate/`: GateVisitSession
- `apps/operations/scaling/`: QueueToken, ScaleRecord
- `05-transport`: TransportOrder

### Downstream
- `apps/operations/scaling/`: Scale-out clearance (SC-01)
- `apps/quality/checkpoint/`: QC checkpoint trigger (QC-01)
- `apps/operations/gate/`: Gate-out clearance (GT-01)
- `05-transport/lifecycle`: Timeline events (TLS-01)

---

## 12. Sprint 4 Story Mapping

| Story | Scope | Implementation Focus |
|-------|-------|----------------------|
| **LUP-01** | Loading & unloading points — create & maintain per POI | POIOperationPoint model + master data admin UI + API endpoints |
| **CC-01** | Queue monitoring, bay assignment & waiting serial | BayAssignment model + queue dashboard UI + assignment service + QC trigger (RM) + API endpoints + TLS-01 integration |
| **LD-01** | Load / unload start–end capture (E2E) | LoadingOperation model + start/end forms UI + timestamp capture + bags/seal tracking + API endpoints + TLS-01 integration + scale-out clearance |

---

**Last Updated**: 2026-05-06  
**Related Modules**: [gate-operations-sprint4.md](./gate-operations-sprint4.md), [scaling-operations-sprint4.md](./scaling-operations-sprint4.md), [qc-operations-sprint4.md](./qc-operations-sprint4.md), [05-transport](../05-transport/README.md)
