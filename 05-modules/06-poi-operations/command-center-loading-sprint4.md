---
module: 06-poi-operations
specification: Command Center & Loading/Unloading Operations (Sprint 4)
version: 3.0
phase: Phase 1
sprint: Sprint 4
last_updated: 2026-05-12
related_stories: DFS-056 (CC-01), DFS-057 (LD-01)
jira_epic: DFS-074
---

# Command Center & Loading/Unloading Operations Specification (Sprint 4)

## Overview

The **Command Center & Loading/Unloading** specification covers two operational functions:

1. **Command Center (CC-01)**: Queue management, bay assignment, waiting serial issuance, RM QC trigger handoff
2. **Loading/Unloading Operations (LD-01)**: Separate LoadEvent/UnloadEvent capture with start/end datetime, bags, weight, seal, QC handoff context

> **Loading/Unloading Points (LUP-01)** — the master data definition of bays/lines/docks within a POI — has been extracted to a standalone master data module: **[loading-unloading-points.md](../02-master-data/loading-unloading-points.md)**. CC-01 and LD-01 consume those points via FK.

The Command Center is the **orchestration hub** for post-scale yard operations — it receives vehicles from the scale-in queue (auto-populated from SC-01), assigns them to specific loading/unloading points, and updates TO sub-state for QC visibility on RM flows. Loading/unloading personnel record actual execution timestamps at the assigned bay.

**Critical flow distinction (AC-6 RM path)**: For **raw-material** TOs, Command Center updates TO sub-state for QC visibility but does **NOT** assign an unloading point — QC Supervisor assigns the unloading point directly after QC pass in **QC-01**. For FG inbound, system records unload path states without mandatory QC checkpoint.

**Module path**: 
- `apps/operations/command_center/` (QueueEntry, BayAssignment, WaitingSerial)
- `apps/operations/loading/` (LoadEvent, UnloadEvent)

**Dependencies**: `apps/master_data/` (POI, LoadingUnloadingPoint), `apps/operations/gate/` (GateVisitSession), `apps/operations/scaling/` (ScaleEntry), `05-transport` (TransportOrder)  
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

```

> **Loading/Unloading Points management** (Master Data → Loading/Unloading Points) is defined in the master data module: **[loading-unloading-points.md](../02-master-data/loading-unloading-points.md)**.

### Role → menu mapping

| Role | Queue Dashboard | Assign Bay | My Assignments |
|------|:---------------:|:----------:|:--------------:|
| Command Center Officer | ✓ | ✓ | — |
| Loading Personnel | — | — | ✓ (load bays) |
| Unloading Personnel | — | — | ✓ (unload bays) |
| Tenant Admin | ✓ (read-only) | — | — |

---

## 1. Data Model

> **LoadingUnloadingPoint** (LUP-01 master data) is now defined in **[loading-unloading-points.md](../02-master-data/loading-unloading-points.md)** under `apps/master_data/`. Models below FK to it via `loading_unloading_point`.

### 1.1 QueueEntry (CC-01)

```python
class QueueEntry(TenantAwareModel):
    id: UUID
    
    # Core links
    transport_order: FK → TransportOrder
    scale_entry: FK → ScaleEntry                 # Scale-in record from SC-01
    
    # Auto-populated from scale-in event
    vehicle_number: string                       # Denormalized for display
    pc_code: string                              # P.C. code
    item: string                                 # Product/item description
    scale_in_datetime: DateTime                  # When scale-in completed
    product_type: string                         # FG / RM
    gross_weight: Decimal (nullable)
    net_weight: Decimal (nullable)
    to_challan_ref: string (nullable)            # TO or challan reference
    urgency: string (nullable)                   # Urgency indicator
    
    # Status
    status: enum                                 # pending | assigned | completed
    
    # Metadata (from TenantAwareModel)
    created_at: DateTime
    updated_at: DateTime
```

**Constraints**:
- Auto-populated from SC-01 scale-in events
- Only entries with `status = 'pending'` appear in Command Center queue

### 1.2 BayAssignment (CC-01)

```python
class BayAssignment(TenantAwareModel):
    id: UUID
    
    # Core links
    transport_order: FK → TransportOrder
    loading_unloading_point: FK → LoadingUnloadingPoint    # Assigned bay/line/dock
    
    # Assignment
    assigned_at: DateTime
    assigned_by: FK → User (Command Center Officer)
    
    # Status
    assignment_status: enum                      # assigned | started | completed | cancelled
    
    # Completion
    completed_at: DateTime (nullable)
    
    # Metadata (from TenantAwareModel)
    created_at: DateTime
    updated_at: DateTime
```

**Constraints**:
- One active assignment per TO at a time
- `loading_unloading_point.is_active` must be True at assignment time

**Bay assignment lane rules**:
- FG outbound → assign to **loading** point
- FG inbound → assign to **unloading** point (no mandatory QC)
- RM inbound → CC does **NOT** assign unloading point; CC only updates TO sub-state for QC visibility; QC Supervisor assigns unloading point in QC-01

### 1.3 WaitingSerial (CC-01)

```python
class WaitingSerial(TenantAwareModel):
    id: UUID
    
    # Core links
    loading_unloading_point: FK → LoadingUnloadingPoint
    transport_order: FK → TransportOrder
    bay_assignment: FK → BayAssignment (nullable)
    
    # Serial
    serial_number: integer                       # Sequential per loading point
    
    # Audit
    issued_by: FK → User
    issued_at: DateTime
    
    # Metadata (from TenantAwareModel)
    created_at: DateTime
    updated_at: DateTime
```

**Constraints**:
- Unique: `(loading_unloading_point, serial_number)` per day (or continuous — product decision)
- **Immutable** after issue — no edits allowed
- Sequential: 1, 2, 3, ... (next available number for the loading point)

### 1.4 LoadEvent (LD-01)

```python
class LoadEvent(TenantAwareModel):
    id: UUID
    
    # Core links
    transport_order: FK → TransportOrder
    bay_assignment: FK → BayAssignment
    loading_unloading_point: FK → LoadingUnloadingPoint    # Bay where loading occurred
    
    # Timestamps
    start_datetime: DateTime                     # Load start time
    end_datetime: DateTime (nullable)            # Load end time
    
    # Loading data
    bags_loaded: integer (nullable)              # Number of bags loaded
    weight_kg: Decimal (nullable)                # Weight loaded
    seal_number: string (nullable)               # Seal number applied to vehicle
    
    # Personnel
    recorded_by: FK → User (Loading Personnel)
    
    # Remarks
    remarks: text (nullable)
    
    # Metadata (from TenantAwareModel)
    created_at: DateTime
    updated_at: DateTime
```

**Constraints**:
- `end_datetime >= start_datetime` (validation)
- One LoadEvent per BayAssignment

### 1.5 UnloadEvent (LD-01)

```python
class UnloadEvent(TenantAwareModel):
    id: UUID
    
    # Core links
    transport_order: FK → TransportOrder
    bay_assignment: FK → BayAssignment
    loading_unloading_point: FK → LoadingUnloadingPoint    # Bay where unloading occurred
    
    # Timestamps
    start_datetime: DateTime                     # Unload start time
    end_datetime: DateTime (nullable)            # Unload end time
    
    # Unloading data
    bags_unloaded: integer (nullable)            # Number of bags unloaded
    weight_kg: Decimal (nullable)                # Weight unloaded
    
    # QC handoff (RM path — AC-3)
    qc_handoff_persisted: boolean (default False)   # True after unload event persists handoff reference
    
    # Personnel
    recorded_by: FK → User (Unloading Personnel)
    
    # Remarks
    remarks: text (nullable)
    
    # Metadata (from TenantAwareModel)
    created_at: DateTime
    updated_at: DateTime
```

**Constraints**:
- `end_datetime >= start_datetime` (validation)
- One UnloadEvent per BayAssignment
- For RM TOs: after unload event, handoff reference (TO + unload event id) is persisted for QC-01

---

## 2. CC-01: Command Center Queue & Bay Assignment

### 2.1 Queue Dashboard View

```
Command Center Officer opens Queue Dashboard (default view)
  └─► Backend query:
        QueueEntry.objects.filter(
          status='pending',
          poi=officer_poi
        ).order_by('scale_in_datetime')
        
  └─► Queue card displays (AC-2):
        - Vehicle Number
        - P.C. Code
        - Item (product/item description)
        - Scale-In Datetime
        - Product Type (FG / RM) — badge color-coded
        - Gross/Net Weight (if available)
        - TO / Challan Ref
        - Urgency
        - Operation Needed (Load / Unload) — derived from flow_type
        - [Assign Bay] button
```

### 2.2 Bay Assignment Flow

```
Officer clicks [Assign Bay] on a queue row
  └─► Assignment Form opens (modal)
        ├─► Read-only section:
        │     ├─► TO Summary: TO#, Product, Quantity, Vehicle, Driver
        │     ├─► P.C. Code
        │     ├─► Product Type, Gross/Net Weight
        │     └─► Operation Needed: Load / Unload
        │
        ├─► Input section:
        │     ├─► Loading/Unloading Point: dropdown (filtered by operation_type matching operation_needed)
        │     │     └─► Only active LoadingUnloadingPoint entries shown
        │     │     └─► Warnings on product type / vehicle type mismatch (manual override allowed)
        │     └─► (Optional) Assign Personnel: dropdown — Phase 2
        │
        ├─► RM Inbound special handling (AC-6):
        │     └─► If flow_type = 'rm_inbound':
        │           └─► CC does NOT assign unloading point
        │           └─► Info: "RM inbound — TO sub-state updated for QC visibility. 
        │                      QC Supervisor will assign unloading point after QC pass."
        │           └─► Backend triggers RM QC handoff service (CC-01-10)
        │
        └─► [Assign Bay]
              └─► Backend:
                    ├─► Validate: loading_unloading_point.is_active = True
                    │     └─► Validate: point operation_type matches operation_needed
                    │     └─► Warn (not block) on product/vehicle mismatch
                    │
                    ├─► Create BayAssignment:
                    │     ├─► assignment_status = 'assigned'
                    │     ├─► assigned_at = now()
                    │     └─► assigned_by = current_user
                    │
                    ├─► Update QueueEntry.status = 'assigned'
                    │
                    ├─► Update TO sub-state (TLS-01):
                    │     └─► e.g. 'Assigned to Loading Point' per §6.8.5
                    │
                    ├─► If flow_type = 'rm_inbound' (AC-6):
                    │     └─► Update TO sub-state for QC visibility (e.g. 'QC Started')
                    │     └─► Do NOT assign unloading point — QC-01 handles this
                    │
                    ├─► Write TOExecutionEvent (TLS-01):
                    │     └─► event_type = 'bay_assigned', payload = {point_code, point_name}
                    │
                    └─► Response:
                          ├─► Success message: "Bay BAY-01 assigned."
                          └─► Remove from Queue Dashboard → appears in Active Assignments
```

### 2.3 Waiting Serial Issuance

```
Officer issues waiting serial for a loading point assignment
  └─► Backend:
        ├─► Compute: serial_number = max(WaitingSerial for same loading_unloading_point, same day) + 1
        │
        ├─► Create WaitingSerial:
        │     ├─► loading_unloading_point = selected point
        │     ├─► transport_order = assignment TO
        │     ├─► bay_assignment = related assignment (nullable)
        │     ├─► serial_number = computed
        │     ├─► issued_by = current_user
        │     └─► issued_at = now()
        │
        └─► Serial is immutable after issue — no edits allowed
              └─► Audit: issuer + timestamp recorded
```

### 2.4 Active Assignments View

```
Command Center Officer opens Active Assignments
  └─► Backend query:
        BayAssignment.objects.filter(
          loading_unloading_point__poi=officer_poi,
          assignment_status__in=['assigned', 'started']
        ).order_by('assigned_at')
        
  └─► Table displays:
        - Waiting Serial (from related WaitingSerial)
        - TO Number
        - Vehicle
        - Bay (loading_unloading_point.short_code)
        - Status (Assigned / Started)
        - Assigned At
        - [View Detail] button
```

**Assignment Detail** (read-only):
- TO summary
- Bay assignment info (point, serial, assigned at/by)
- Loading/unloading timestamps (if started/completed)

### 2.5 "My Bay" View (Loading/Unloading Personnel)

```
Loading Personnel opens "My Bay" view
  └─► Backend query:
        BayAssignment.objects.filter(
          loading_unloading_point_id=loading_point_id,
          assignment_status__in=['assigned', 'started']
        ).order_by('assigned_at')
        
  └─► Shows current assignments for a given loading/unloading point
```

### 2.6 Django Admin Configuration

**QueueEntryAdmin** (CC-01-2):
- `TenantOnlyAdminMixin`
- List View:
  - Columns: Vehicle Number, P.C. Code, Item, Scale-In Datetime, Product Type, Gross/Net Weight, TO/Challan Ref, Urgency, Status
  - Filters: `product_type`, `urgency`, `status`
  - Search: Vehicle Number, P.C. Code, TO ref
- Auto-populated from SC-01 scale-in events
- Read-only (queue entries are system-generated)

**BayAssignmentAdmin** (CC-01-3):
- `TenantOnlyAdminMixin`
- List View:
  - Columns: TO Number, Vehicle, Bay (loading_unloading_point.short_code), Assignment Status, Assigned At, Completed At
  - Filters: `assignment_status`, `loading_unloading_point__poi`, `assigned_at` (date range)
  - Search: TO number, Vehicle registration
  - Actions: Bulk export CSV
- Status Badge:
  - Blue: Assigned
  - Yellow: Started
  - Green: Completed
  - Gray: Cancelled
- Detail View:
  - L/U point dropdown (from LUP-01)
  - `save_model`: validates product/vehicle type match + updates TO sub-state via TLS-01
  - Read-only after completion
- Inline: LoadEvent or UnloadEvent (if exists) — read-only
- Custom admin action: **"View TO Timeline"** (redirect to TLS-01)

**WaitingSerialAdmin** (CC-01-4):
- `TenantOnlyAdminMixin`
- List View:
  - Columns: Serial Number, Loading/Unloading Point, TO Number, Issued By, Issued At
  - Filters: `loading_unloading_point`, `issued_at` (date range)
  - Search: Serial Number, TO number
- Read-only after issue (immutable)
- Audit fields: `issued_by`, `issued_at`

---

## 3. LD-01: Loading/Unloading Event Capture

### 3.1 My Assignments View (Loading/Unloading Personnel)

```
Loading Personnel logs in → opens My Assignments
  └─► Backend query:
        BayAssignment.objects.filter(
          loading_unloading_point__poi=personnel_poi,
          loading_unloading_point__operation_type='LOAD',
          assignment_status='assigned'
        ).order_by('assigned_at')
        
  └─► Table displays:
        - TO Number
        - Vehicle
        - Bay
        - Product
        - Quantity (MT)
        - [Start Loading] button
```

### 3.2 Loading Start

```
Personnel clicks [Start Loading] on an assignment row
  └─► Loading Start Form (modal or page)
        ├─► Read-only: TO Summary, Bay, Vehicle
        ├─► Start Time: auto-filled with now() (editable if needed)
        ├─► Remarks: text area (optional)
        └─► [Start]
              └─► Backend:
                    ├─► Create LoadEvent:
                    │     ├─► transport_order = assignment.transport_order
                    │     ├─► bay_assignment = assignment
                    │     ├─► loading_unloading_point = assignment.loading_unloading_point
                    │     ├─► start_datetime = form.start_time
                    │     ├─► recorded_by = current_user
                    │     └─► remarks = form.remarks
                    │
                    ├─► Update BayAssignment.assignment_status = 'started'
                    │
                    ├─► Update TO sub-state → 'Loading Started'
                    │
                    ├─► Write TOExecutionEvent (TLS-01):
                    │     └─► event_type = 'loading_started'
                    │
                    └─► Response:
                          ├─► Success: "Loading started at Bay BAY-01."
                          └─► [End Loading] button now enabled
```

### 3.3 Loading End

```
Personnel clicks [End Loading] on a started assignment row
  └─► Loading End Form
        ├─► Read-only: TO Summary, Bay, Start Time
        ├─► End Time: auto-filled with now() (editable)
        ├─► Bags Loaded: integer input
        ├─► Seal Number: text input (optional)
        ├─► Weight (kg): decimal input (optional)
        ├─► Remarks: text area (optional)
        └─► [Complete Loading]
              └─► Backend:
                    ├─► Validate: end_datetime >= start_datetime
                    │
                    ├─► Update LoadEvent:
                    │     ├─► end_datetime = form.end_time
                    │     ├─► bags_loaded = form.bags_loaded
                    │     ├─► seal_number = form.seal_number
                    │     ├─► weight_kg = form.weight_kg
                    │     └─► remarks += form.remarks
                    │
                    ├─► Update BayAssignment.assignment_status = 'completed', completed_at = now()
                    │
                    ├─► Update TO sub-state → 'Loading Completed'
                    │
                    ├─► Write TOExecutionEvent (TLS-01):
                    │     └─► event_type = 'loading_completed', payload = {bags_loaded, seal_number}
                    │
                    └─► Response:
                          ├─► Success: "Loading completed. Vehicle released to scale-out."
                          └─► Remove from My Assignments → appears in Completion History
                                └─► Vehicle now eligible for scale-out (SC-01)
```

### 3.4 Unloading Start & End (parallel flow for Unloading Personnel)

**Unloading Start**:
- Same structure as Loading Start, but creates **UnloadEvent**
- `TO sub-state → 'Unloading Started'`
- TLS event: `unloading_started`

**Unloading End**:
- Captures `bags_unloaded`, `weight_kg`
- No seal number (not applicable to unloading)
- After unloading end:
  - **RM inbound (AC-3)**: persist QC handoff reference (TO + unload event id) for QC-01 consumption; QC checkpoint must complete before scale-out
  - **FG inbound**: vehicle released to scale-out (no mandatory QC in Sprint 4)
- TLS event: `unloading_completed`

### 3.5 QC Handoff Context (RM path — AC-3)

```
After UnloadEvent end for RM TOs:
  └─► Backend:
        ├─► Persist handoff reference:
        │     ├─► transport_order = unload_event.transport_order
        │     ├─► unload_event_id = unload_event.id
        │     └─► qc_handoff_persisted = True
        │
        └─► QC-01 can now retrieve:
              └─► GET /api/v1/unload-events/{id}/qc-handoff
                    └─► Returns: TO context + unload event details for sampling/QC decision
```

### 3.6 Django Admin Configuration

**LoadEventAdmin** (LD-01-2):
- `TenantOnlyAdminMixin`
- List View:
  - Columns: TO Number, Vehicle, Bay (loading_unloading_point.short_code), Start DateTime, End DateTime, Duration (computed), Bags Loaded, Seal Number, Weight, Personnel
  - Filters: `loading_unloading_point__poi`, `start_datetime` (date range), Status (Completed / In Progress)
  - Search: TO number, Vehicle registration, Seal number
  - Actions: Bulk export CSV
- Detail View:
  - Vehicle selection from CC-01 assignment
  - Start/end datetime fields
  - Bags loaded, weight, seal number
  - `save_model`: validates `end_datetime >= start_datetime` + emits TLS-01 event
  - Read-only: TO (link), Bay Assignment (link), Loading/Unloading Point (link)
  - Personnel: Recorded By
  - Remarks: text area
- Custom admin action: **"View TO Timeline"** (redirect to TLS-01)

**UnloadEventAdmin** (LD-01-3):
- `TenantOnlyAdminMixin`
- List View:
  - Columns: TO Number, Vehicle, Bay (loading_unloading_point.short_code), Start DateTime, End DateTime, Duration (computed), Bags Unloaded, Weight, Personnel, QC Handoff
  - Filters: `loading_unloading_point__poi`, `start_datetime` (date range), Status (Completed / In Progress)
  - Search: TO number, Vehicle registration
  - Actions: Bulk export CSV
- Detail View:
  - Unload start/end datetime fields
  - Bags unloaded, weight
  - `save_model`: validates `end_datetime >= start_datetime`, persists QC handoff context for RM TOs + emits TLS-01 event
  - QC handoff fields (RM only): `qc_handoff_persisted` (read-only)
  - Read-only: TO (link), Bay Assignment (link), Loading/Unloading Point (link)
  - Personnel: Recorded By
  - Remarks: text area
- Custom admin action: **"View TO Timeline"** (redirect to TLS-01)

---

## 4. API Endpoints

> **Loading/Unloading Points API** (CRUD under `/api/v1/pois/{poi_id}/loading-unloading-points`) is defined in **[loading-unloading-points.md](../02-master-data/loading-unloading-points.md)** §4.

### 4.1 Command Center (CC-01)

```http
GET    /api/v1/command-center/queue?product_type=&urgency=&status=
       → Eligible vehicles (scale-in complete, not assigned)
       → Response: [
           {
             id,
             vehicle_number,
             pc_code,
             item,
             scale_in_datetime,
             product_type: "FG" | "RM",
             gross_weight,
             net_weight,
             to_challan_ref,
             urgency,
             operation_needed: "loading" | "unloading"
           }
         ]

POST   /api/v1/command-center/assignments
       → Assign vehicle to L/U point
       → Body: {
           queue_entry_id: UUID,
           loading_unloading_point_id: UUID
         }
       → Validations:
           - Point must be active
           - Point operation_type must match operation_needed
           - Warn on product/vehicle mismatch (not blocking)
       → Side effects:
           - Create BayAssignment
           - Update QueueEntry status
           - Update TO sub-state (TLS-01)
           - If RM inbound: update TO sub-state for QC visibility (AC-6) — do NOT assign unloading point
       → Response: {
           assignment_id,
           message: "Bay BAY-01 assigned."
         }

GET    /api/v1/command-center/assignments?loading_point=&status=
       → List assignments (filterable by L/U point and status)
       → Response: [
           {
             assignment_id,
             transport_order: {to_number},
             vehicle_number,
             loading_unloading_point: {short_code, name},
             assignment_status,
             assigned_at
           }
         ]

POST   /api/v1/command-center/waiting-serials
       → Issue waiting serial for a loading point
       → Body: {
           loading_unloading_point_id: UUID,
           transport_order_id: UUID,
           bay_assignment_id: UUID (optional)
         }
       → Serial is immutable after issue
       → Response: {
           id,
           serial_number: 3,
           issued_by,
           issued_at,
           message: "Waiting serial 3 issued."
         }

GET    /api/v1/command-center/my-bay?loading_point_id=
       → Loading personnel — current bay assignments for a given L/U point
       → Response: [
           {
             assignment_id,
             transport_order: {to_number, product, quantity_mt},
             vehicle_number,
             loading_unloading_point: {short_code, name},
             assignment_status,
             waiting_serial: {serial_number}
           }
         ]
```

### 4.2 Loading/Unloading Events (LD-01)

```http
POST   /api/v1/load-events
       → Record load event (linked to TO + bay assignment)
       → Body: {
           transport_order_id: UUID,
           bay_assignment_id: UUID,
           loading_unloading_point_id: UUID,
           start_datetime: "2026-05-12T14:00:00Z",
           end_datetime: "2026-05-12T15:30:00Z" (nullable — set on completion),
           bags_loaded: 1000 (nullable),
           seal_number: "SEAL-12345" (nullable),
           weight_kg: 50000 (nullable),
           remarks: "Loading complete"
         }
       → Validations: end_datetime >= start_datetime (if both provided)
       → Side effects:
           - Update BayAssignment status
           - Update TO sub-state (TLS-01): Loading Started / Loading Completed
       → Response: {id, message: "Load event recorded."}

GET    /api/v1/load-events?transport_order=&bay_assignment=
       → List load events (filterable)
       → Response: [{id, transport_order, bay_assignment, start_datetime, end_datetime, bags_loaded, weight_kg, seal_number}]

POST   /api/v1/unload-events
       → Record unload event (linked to TO + bay assignment)
       → Body: {
           transport_order_id: UUID,
           bay_assignment_id: UUID,
           loading_unloading_point_id: UUID,
           start_datetime: "2026-05-12T14:00:00Z",
           end_datetime: "2026-05-12T15:30:00Z" (nullable),
           bags_unloaded: 1000 (nullable),
           weight_kg: 50000 (nullable),
           remarks: "Unloading complete"
         }
       → Validations: end_datetime >= start_datetime (if both provided)
       → Side effects:
           - Update BayAssignment status
           - Update TO sub-state (TLS-01): Unloading Started / Unloading Completed
           - If RM inbound: persist QC handoff reference (TO + unload event id)
       → Response: {id, message: "Unload event recorded."}

GET    /api/v1/unload-events?transport_order=&bay_assignment=
       → List unload events (filterable)
       → Response: [{id, transport_order, bay_assignment, start_datetime, end_datetime, bags_unloaded, weight_kg, qc_handoff_persisted}]

GET    /api/v1/unload-events/{id}/qc-handoff
       → QC handoff context for RM TOs (consumed by QC-01)
       → Response: {
           unload_event_id,
           transport_order: {to_number, product, flow_type},
           unload_start: ...,
           unload_end: ...,
           bags_unloaded,
           weight_kg,
           message: "QC handoff context for RM TO."
         }
```

---

## 5. Business Rules

### 5.1 Bay Assignment Rules

**Operation Type Matching**:
- FG Outbound: needs **loading** → assign to point where `operation_type == 'LOAD'`
- FG Inbound: needs **unloading** → assign to point where `operation_type == 'UNLOAD'`
- RM Inbound: CC updates TO sub-state for QC visibility — does **NOT** assign unloading point (QC-01 handles assignment after QC pass)

**Mismatch handling**: Manual selection with warnings on product type / vehicle type mismatch — automation deferred to later phase.

**Waiting Serial**:
- Unique per loading point, immutable after issue
- Issuer + timestamp audit
- Sequential: 1, 2, 3, ... (next available number)

**RM QC Trigger (AC-6)**:
- Command Center updates TO sub-state (e.g. `QC Started`) for QC Supervisor visibility
- CC does **NOT** assign unloading point for RM TOs
- QC Supervisor assigns unloading point directly after QC pass in QC-01
- QC capture and unloading assignment for raw materials handled entirely in QC-01
- For FG inbound: unload path states recorded without mandatory QC checkpoint

### 5.2 Loading/Unloading Event Rules

**LoadEvent Start**:
- Can only start if bay assignment exists (`assignment_status = 'assigned'`)
- Cannot start if already started (one LoadEvent per BayAssignment)

**LoadEvent Complete**:
- Can only complete if started (`start_datetime not null`)
- `end_datetime >= start_datetime` (validation)

**UnloadEvent Start/Complete**:
- Same rules as LoadEvent
- `end_datetime >= start_datetime` (validation)

**QC Handoff (RM path)**:
- After unload event for RM TOs, persist handoff reference (TO + unload event id) for QC-01
- Handoff reference is auditable and retrievable via API

**Scale-Out Eligibility**:
- FG Outbound: LoadEvent.end_datetime not null
- FG Inbound: UnloadEvent.end_datetime not null (no mandatory QC in Sprint 4)
- RM Inbound: UnloadEvent.end_datetime not null **AND** QC pass completed in QC-01

---

## 6. Integration Points

### 6.1 With Scaling (SC-01)

**Queue auto-population**:
- After scale-in, QueueEntry is auto-populated from SC-01 scale-in events
- Command Center queue shows only pending entries

**Scale-out prerequisite**:
- Loading/unloading event must complete before scale-out queue visibility

### 6.2 With QC (QC-01)

**RM QC trigger (CC-01 AC-6)**:
- Command Center updates TO sub-state for QC Supervisor visibility on RM TOs
- CC does **NOT** assign unloading point for RM TOs
- QC Supervisor assigns unloading point directly after QC pass in QC-01

**QC handoff context (LD-01 AC-3)**:
- After UnloadEvent for RM TOs, handoff reference (TO + unload event id) persisted
- QC-01 retrieves via `GET /api/v1/unload-events/{id}/qc-handoff`

### 6.3 With Gate Operations (GT-01)

**Gate-out clearance**:
- Gate-out validates: load/unload event complete (per flow type)
- If RM inbound: also validates QC passed (via QC-01)

### 6.4 With Transport Lifecycle (TLS-01)

**Sub-state emissions** (LD-01-8):
- Bay assigned: `TOExecutionEvent(event_type='bay_assigned', payload={point_code, point_name})`
- Loading Started: `TOExecutionEvent(event_type='loading_started')`
- Loading Completed: `TOExecutionEvent(event_type='loading_completed', payload={bags_loaded, seal_number})`
- Unloading Started: `TOExecutionEvent(event_type='unloading_started')`
- Unloading Completed: `TOExecutionEvent(event_type='unloading_completed', payload={bags_unloaded})`

---

## 7. Permissions & RBAC

### 7.1 Permission Codes (add to `apps/core/constants_rbac.py`)

> **Loading/Unloading Points permissions** (`MasterData.LoadingUnloadingPoint.*`) are defined in **[loading-unloading-points.md](../02-master-data/loading-unloading-points.md)** §5.

```python
# Command Center (CC-01)
Operations.CommandCenter.Queue.Read
Operations.CommandCenter.AssignBay
Operations.CommandCenter.Serial.Issue
Operations.CommandCenter.QCTrigger

# Loading/Unloading Events (LD-01)
Operations.LoadEvent.Start
Operations.LoadEvent.End
Operations.LoadEvent.Read
Operations.UnloadEvent.Start
Operations.UnloadEvent.End
Operations.UnloadEvent.Read
Operations.UnloadEvent.QCHandoff.Read
```

### 7.2 Menu Permissions (add to `apps/core/portal_navigation.py`)

```python
Menu.CommandCenter.View
Menu.CommandCenter.Queue.View
Menu.LoadUnload.View
```

### 7.3 Role → Permission Mapping

**Command Center Officer**:
- `Operations.CommandCenter.Queue.Read`
- `Operations.CommandCenter.AssignBay`
- `Operations.CommandCenter.Serial.Issue`
- `Operations.CommandCenter.QCTrigger`
- `MasterData.LoadingUnloadingPoint.Read` (from master data module)
- `Transport.TO.Read`, `Transport.TO.ExecutionTimeline.Read`

**Loading Personnel**:
- `Operations.LoadEvent.Start`
- `Operations.LoadEvent.End`
- `Operations.LoadEvent.Read`
- `Transport.TO.Read` (assigned TOs only)

**Unloading Personnel**:
- `Operations.UnloadEvent.Start`
- `Operations.UnloadEvent.End`
- `Operations.UnloadEvent.Read`
- `Transport.TO.Read` (assigned TOs only)

**QC Supervisor**:
- `Operations.UnloadEvent.QCHandoff.Read`

**Tenant Admin**:
- All above permissions
- `MasterData.LoadingUnloadingPoint.Write` (from master data module)

---

## 8. Validation Rules

> **LoadingUnloadingPoint validation rules** are defined in **[loading-unloading-points.md](../02-master-data/loading-unloading-points.md)** §6.

### 8.1 QueueEntry (CC-01)

- Auto-populated from SC-01 — no manual creation
- Status transitions: pending → assigned → completed

### 8.2 BayAssignment (CC-01)

- Loading/unloading point must be active
- Point operation_type must match operation needed
- Warn on product/vehicle mismatch (manual override allowed)
- RM inbound: CC does NOT assign unloading point — QC-01 handles

### 8.3 WaitingSerial (CC-01)

- Unique per loading point
- Immutable after issue
- Issuer + timestamp audit required

### 8.4 LoadEvent (LD-01)

- Start datetime required
- End datetime >= start datetime
- One LoadEvent per BayAssignment

### 8.5 UnloadEvent (LD-01)

- Start datetime required
- End datetime >= start datetime
- One UnloadEvent per BayAssignment
- For RM TOs: QC handoff reference (TO + unload event id) persisted after unload completion

---

## 9. Sub-task Reference

> **LUP-01 sub-tasks** (DFS-063-1 through DFS-063-8) are tracked in **[loading-unloading-points.md](../02-master-data/loading-unloading-points.md)** §9.

### CC-01 Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| CC-01-1 | QueueEntry + BayAssignment + WaitingSerial models + migration | DFS-056-1 | Pending |
| CC-01-2 | QueueEntryAdmin — list view with filters (product type, urgency, status), auto-populated from SC-01 | DFS-056-2 | Pending |
| CC-01-3 | BayAssignmentAdmin — change form with L/U point dropdown, save_model validates match + updates TO sub-state | DFS-056-3 | Pending |
| CC-01-4 | WaitingSerialAdmin — read-only after issue, issuer + timestamp audit fields | DFS-056-4 | Pending |
| CC-01-5 | Queue list API (GET with filters: product type, urgency, status) | DFS-056-5 | Pending |
| CC-01-6 | Bay assignment API (POST — assign vehicle to L/U point) | DFS-056-6 | Pending |
| CC-01-7 | Waiting serial issuance API (POST — generate immutable serial per loading point) | DFS-056-7 | Pending |
| CC-01-8 | "My bay" read API for loading personnel (GET) | DFS-056-8 | Pending |
| CC-01-9 | Command Center UI — queue view, assignment form, serial issuance | DFS-056-9 | Pending |
| CC-01-10 | RM QC trigger service — update TO sub-state for QC visibility on RM TOs (AC-6 handoff) | DFS-056-10 | Pending |
| CC-01-11 | TLS-01 event emission — emit sub-state transitions on assignment + serial issuance | DFS-056-11 | Pending |

### LD-01 Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| LD-01-1 | LoadEvent + UnloadEvent models + migration (FK to TO, BayAssignment, L/U point; start/end datetime, bags, weight, seal) | DFS-057-1 | Pending |
| LD-01-2 | LoadEventAdmin — change form with vehicle selection, start/end datetime, bags/weight/seal, save_model validates + emits TLS-01 | DFS-057-2 | Pending |
| LD-01-3 | UnloadEventAdmin — change form with unload start/end, bags/weight, save_model persists QC handoff for RM + emits TLS-01 | DFS-057-3 | Pending |
| LD-01-4 | Load start/end API (POST — create load event linked to TO and bay assignment) | DFS-057-4 | Pending |
| LD-01-5 | Unload start/end API (POST — create unload event linked to TO and bay assignment) | DFS-057-5 | Pending |
| LD-01-6 | QC handoff reference API (GET — retrieve unload event context for QC-01) | DFS-057-6 | Pending |
| LD-01-7 | Operator UI — web form for load/unload event capture | DFS-057-7 | Pending |
| LD-01-8 | TLS-01 sub-state emission service — Loading Started/Completed, Unloading Started/Completed | DFS-057-8 | Pending |

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
- `apps/master_data/`: POI, LoadingUnloadingPoint (LUP-01 — master data module)
- `apps/operations/gate/`: GateVisitSession
- `apps/operations/scaling/`: ScaleEntry
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
| **LUP-01** | Loading & unloading points — create & maintain per POI | **Extracted to master data module** → [loading-unloading-points.md](../02-master-data/loading-unloading-points.md) |
| **CC-01** | Queue monitoring, bay assignment & waiting serial | QueueEntry + BayAssignment + WaitingSerial models + queue dashboard UI + assignment service + RM QC trigger (AC-6 — sub-state only, no unloading point assignment) + API endpoints + TLS-01 integration |
| **LD-01** | Load / unload event capture (E2E) | LoadEvent + UnloadEvent models + start/end forms UI + timestamp capture + bags/seal tracking + QC handoff context (RM path) + API endpoints + TLS-01 sub-state emission |

---

**Last Updated**: 2026-05-12  
**Related Modules**: [loading-unloading-points.md](../02-master-data/loading-unloading-points.md) (LUP-01 master data), [gate-operations-sprint4.md](./gate-operations-sprint4.md), [scaling-operations-sprint4.md](./scaling-operations-sprint4.md), [qc-operations-sprint4.md](./README.md), [05-transport](../05-transport/README.md)
