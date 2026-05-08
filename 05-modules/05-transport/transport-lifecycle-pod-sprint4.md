---
module: 05-transport
specification: Transport Lifecycle, POD & QC Checkpoint (Sprint 4)
version: 1.0
phase: Phase 1
sprint: Sprint 4
last_updated: 2026-05-06
related_stories: DFS-059 (TLS-01), DFS-060 (POD-01), DFS-064 (QC-01)
jira_epic: DFS-075
---

# Transport Lifecycle, POD & QC Checkpoint Specification (Sprint 4)

## Overview

This specification covers three interconnected capabilities that manage the full Transport Order execution lifecycle:

1. **TLS-01 — TO Lifecycle & Timeline**: Execution substates, event timeline, audit trail
2. **POD-01 — TO Closure & POD Linkage**: Proof of Delivery capture, closure rule engine, flow-specific closure gates
3. **QC-01 — Raw Material QC Checkpoint**: Simplified sampling + pass/fail decision for RM inbound TOs

The TO lifecycle state machine tracks execution from "Ready for Dispatch" through yard operations to "Closed". The **closure engine** evaluates flow-specific gates (FG outbound, FG inbound, RM inbound) and transitions TOs to "Closed" only when all conditions are met. QC checkpoints are **triggered by Command Center** (CC-01) for RM inbound TOs and block closure until QC passes.

**Module path**: 
- `apps/transport/lifecycle/` (state machine + execution guards)
- `apps/transport/closure/` (closure rule engine)
- `apps/transport/pod/` (POD model + capture)
- `apps/quality/checkpoint/` (QC checkpoint for Sprint 4)

**Dependencies**: All Sprint 4 yard operations (GT-01, SC-01, CC-01, LD-01), `08-fleet-management` (DS-01, DS-02), `09-mobile-apps` (DM-01)  
**Enables**: End-to-end TO execution visibility, closure triggers, KPI tracking

---

## 0. Menu Structure & Navigation

```
Sidebar (Transport Planner / TDO)
└── Logistics / Transport
      └── Transport Orders
            └── TO Detail (existing)
                  ├── Timeline Tab (NEW — TLS-01)      — visual execution timeline + event log
                  │     └─► Event list: Gate-in, Scale-in, Bay assigned, Loading done, POD, Closed
                  │           └─► Each event: timestamp, actor, remarks
                  │
                  ├── Closure Checklist (NEW — POD-01) — closure gate status widget
                  │     └─► FG Outbound matrix: [✓] Loading Done, [✓] Scale-Out, [✓] Gate-Out, [✓] POD, [✗] Closure
                  │           └─► If blocked: "Closure blocked: Scale-out not completed"
                  │
                  └── POD Section (NEW — POD-01)       — POD photo/signature preview
                        └─► If POD submitted: display photo, signature, notes, submitted by/at
                              └─► [Download POD]

Sidebar (QC Inspector)
└── Quality
      └── QC Checkpoint (NEW — QC-01)
            ├── Pending Checkpoints            — TOs awaiting QC decision (RM inbound)
            │     └── [row click] ──► QC Checkpoint Form
            │
            └── QC History                     — completed checkpoints (searchable)
                  └── [Export CSV]
```

---

## 1. TLS-01: TO Lifecycle & Timeline

### 1.1 TO Execution States (Sprint 4)

**Sprint 3 legacy fields** (no change):
- `TransportOrder.status` — remains: `created`, `vehicle_assigned`, `vendor_assigned`, `confirmed`, `in_progress`, `completed`, `cancelled`

**Sprint 4 new field** (parallel state tracking):
- `TransportOrder.execution_state` — fine-grained substates:

```python
execution_state: enum [
    # Pre-execution
    'ready_for_dispatch',           # TDO set TO to confirmed; driver sees TO (DM-01)
    
    # Execution started
    'started',                      # Driver marks execution started (DM-01) OR first yard event
    
    # Source yard (FG Outbound, RM Outbound)
    'gate_in_source',               # Gate-in at source POI (GT-01)
    'scale_in_source',              # Scale-in at source (SC-01)
    'loading_assigned',             # Bay assigned for loading (CC-01)
    'loading',                      # Loading in progress (LD-01)
    'loading_done',                 # Loading complete (LD-01)
    'scale_out_source',             # Scale-out at source (SC-01)
    'gate_out_source',              # Gate-out at source (GT-01)
    
    # In transit (Phase 2 — GPS tracking)
    'in_transit',                   # En route (not used in Sprint 4)
    
    # Destination yard (FG Inbound, RM Inbound)
    'gate_in_destination',          # Gate-in at destination POI (GT-01)
    'scale_in_destination',         # Scale-in at destination (SC-01)
    'unloading_assigned',           # Bay assigned for unloading (CC-01)
    'unloading',                    # Unloading in progress (LD-01)
    'unloading_done',               # Unloading complete (LD-01)
    'qc_sampling_done',             # QC sampling complete (QC-01, RM only)
    'qc_decision_pending',          # QC decision pending (QC-01, RM only)
    'qc_passed',                    # QC passed (QC-01, RM only)
    'qc_failed',                    # QC failed (QC-01, RM only — blocks closure)
    'scale_out_destination',        # Scale-out at destination (SC-01)
    'gate_out_destination',         # Gate-out at destination (GT-01)
    
    # Closure
    'pod_submitted',                # Driver submitted POD (DM-01)
    'closed',                       # TO closed (all gates passed)
    'cancelled'                     # TO cancelled (admin action)
]
```

### 1.2 State Machine Transitions per Flow Type

**FG Outbound** (`flow_type = 'fg_outbound'`):
```
ready_for_dispatch
  → started
    → gate_in_source
      → scale_in_source
        → loading_assigned
          → loading
            → loading_done
              → scale_out_source
                → gate_out_source
                  → pod_submitted (driver POD)
                    → closed
```

**FG Inbound** (`flow_type = 'fg_inbound'`):
```
ready_for_dispatch
  → started
    → gate_in_destination
      → scale_in_destination
        → unloading_assigned
          → unloading
            → unloading_done
              → scale_out_destination
                → gate_out_destination
                  → pod_submitted
                    → closed
```

**RM Inbound** (`flow_type = 'rm_inbound'`):
```
ready_for_dispatch
  → started
    → gate_in_destination
      → scale_in_destination
        → unloading_assigned
          → unloading
            → unloading_done
              → qc_sampling_done (QC-01)
                → qc_passed (QC-01 — blocks if failed)
                  → scale_out_destination
                    → gate_out_destination
                      → pod_submitted
                        → closed
```

### 1.3 Data Model

#### 1.3.1 TransportOrder Extensions

```python
TransportOrder {
    # ... existing Sprint 3 fields ...
    
    # Sprint 4 execution tracking
    execution_state: enum                   # Fine-grained substate (see above)
    flow_type: enum                         # ['fg_outbound', 'fg_inbound', 'rm_inbound', 'internal_transfer']
    source_channel: enum                    # ['planner', 'gate_on_demand']
    
    # Denormalized execution timestamps (for fast queries; canonical data in TOExecutionEvent)
    execution_started_at: DateTime (nullable)
    gate_in_source_at: DateTime (nullable)
    loading_done_at: DateTime (nullable)
    gate_out_source_at: DateTime (nullable)
    gate_in_destination_at: DateTime (nullable)
    unloading_done_at: DateTime (nullable)
    qc_passed_at: DateTime (nullable)
    gate_out_destination_at: DateTime (nullable)
    pod_submitted_at: DateTime (nullable)
    closed_at: DateTime (nullable)
}
```

#### 1.3.2 TOExecutionEvent (new model — timeline backbone)

```python
TOExecutionEvent {
    event_id: UUID
    transport_order: FK → TransportOrder
    
    # Event classification
    event_type: enum                        # ['gate_in', 'scale_in', 'bay_assigned', 'loading_started', 
                                            #  'loading_completed', 'qc_sampling_done', 'qc_decision', 
                                            #  'pod_submitted', 'closed', ...]
    event_category: enum                    # ['yard', 'driver', 'qc', 'system'] — for UI filtering
    
    # State transition
    from_state: enum (nullable)             # Previous execution_state (null for first event)
    to_state: enum                          # New execution_state after event
    
    # Timing
    event_time: DateTime                    # When event occurred (defaults to created_at)
    
    # Actor
    actor_user: FK → User (nullable)        # Who triggered the event (null for system events)
    actor_role: string (nullable)           # Role of actor (gateman, driver, qc_inspector, ...)
    
    # Context
    payload_json: JSONField                 # Event-specific data (e.g., {gross_weight_kg, pc_code})
    source_module: string                   # Which app/service emitted this event ('driver_mobile', 'gate', 'scaling', ...)
    
    # Metadata
    tenant_id: UUID
    created_at: DateTime                    # System timestamp of event creation
}
```

**Constraints**:
- Index: `(transport_order, event_time)` — fast timeline queries
- Append-only (no updates/deletes — audit trail integrity)

#### 1.3.3 TOClosureChecklist (new model — closure gate status cache)

```python
TOClosureChecklist {
    checklist_id: UUID
    transport_order: OneToOne → TransportOrder  # One checklist per TO
    
    # Flow type (denormalized for rule engine)
    flow_type: enum                         # ['fg_outbound', 'fg_inbound', 'rm_inbound']
    
    # Closure gates (boolean flags)
    gate_in_done: boolean                   # Gate-in recorded
    scale_in_done: boolean                  # Scale-in recorded
    loading_done: boolean                   # Loading complete (FG outbound only)
    unloading_done: boolean                 # Unloading complete (FG/RM inbound only)
    qc_required: boolean                    # True if flow_type = 'rm_inbound'
    qc_sampling_done: boolean               # True if QC sampling recorded (RM only)
    qc_passed: boolean (nullable)           # True if QC decision = pass (null if not required/pending)
    scale_out_done: boolean                 # Scale-out recorded
    gate_out_done: boolean                  # Gate-out recorded
    pod_present: boolean                    # True if TOPOD exists
    
    # Closure status
    closure_eligible: boolean               # True if all gates passed (auto-calculated)
    closure_block_reason: text (nullable)   # First failing rule (e.g., "Scale-out not completed")
    
    # Last updated
    last_evaluated_at: DateTime
    
    # Metadata
    tenant_id: UUID
}
```

**Purpose**: Cache closure gate status to avoid N+1 queries when rendering TO detail "Why can't this TO close?" widget.

### 1.4 Timeline Service (`apps/transport/lifecycle/timeline_service.py`)

**Core function**: Write execution events

```python
def record_execution_event(
    transport_order,
    event_type: str,
    to_state: str,
    actor_user=None,
    payload_json=None,
    source_module=None
):
    """
    Write TO execution event to timeline.
    
    Args:
        transport_order: TransportOrder instance
        event_type: Event type (e.g., 'gate_in', 'loading_started')
        to_state: New execution_state
        actor_user: User who triggered event (optional)
        payload_json: Event-specific data dict (optional)
        source_module: Source app (e.g., 'driver_mobile', 'gate')
    
    Returns:
        TOExecutionEvent instance
    """
    from_state = transport_order.execution_state
    
    event = TOExecutionEvent.objects.create(
        transport_order=transport_order,
        event_type=event_type,
        from_state=from_state,
        to_state=to_state,
        event_time=timezone.now(),
        actor_user=actor_user,
        actor_role=actor_user.role if actor_user else None,
        payload_json=payload_json or {},
        source_module=source_module
    )
    
    # Update TO execution_state
    transport_order.execution_state = to_state
    transport_order.save()
    
    # Update denormalized timestamp field (e.g., loading_done_at)
    update_denormalized_timestamp(transport_order, event_type)
    
    # Refresh closure checklist
    refresh_closure_checklist(transport_order)
    
    return event
```

**Deduplication** (optional):
- If same `event_type` for same TO within 5-minute window, skip duplicate event creation
- Use case: Both driver (DM-01) and gateman (GT-01) record "gate_in" — keep first event

### 1.5 Django Admin Configuration (TOExecutionEvent)

**List View**:
- Columns: TO Number, Event Type, To State, Event Time, Actor, Source Module
- Filters: `event_type`, `event_category`, `event_time` (date range), `transport_order__flow_type`
- Search: TO number
- Actions: Bulk export CSV

**Detail View**:
- Read-only: TO (link), Event Type, From State → To State, Event Time, Actor (link), Actor Role, Source Module
- JSON widget for `payload_json` (expandable)
- Custom admin action: **"View Full Timeline"** (redirect to TO timeline view)

---

## 2. POD-01: TO Closure & POD Linkage

### 2.1 Data Model

#### 2.1.1 TOPOD (already defined in DM-01 spec)

```python
TOPOD {
    pod_id: UUID
    transport_order: OneToOne → TransportOrder
    
    # POD artifacts
    photo: ImageField                       # Required: delivery evidence
    signature: ImageField (nullable)        # Optional: canvas signature
    notes: text (nullable)                  # Driver remarks
    
    # Submission
    submitted_by: FK → User (Driver)
    submitted_at: DateTime
    
    # Metadata
    tenant_id: UUID
}
```

### 2.2 Closure Rule Engine (`apps/transport/closure/closure_engine.py`)

**Core function**: Evaluate closure conditions and transition TO to "Closed"

```python
def evaluate_closure_conditions(transport_order):
    """
    Evaluate closure gates for a TO and transition to 'closed' if all conditions met.
    
    Returns:
        (can_close: bool, block_reason: str)
    """
    flow_type = transport_order.flow_type
    checklist = get_or_create_closure_checklist(transport_order)
    
    # Refresh checklist flags
    refresh_closure_checklist(transport_order)
    
    # Apply flow-specific closure matrix
    if flow_type == 'fg_outbound':
        return evaluate_fg_outbound_closure(checklist)
    elif flow_type == 'fg_inbound':
        return evaluate_fg_inbound_closure(checklist)
    elif flow_type == 'rm_inbound':
        return evaluate_rm_inbound_closure(checklist)
    else:
        return (False, f"Unknown flow_type: {flow_type}")

def evaluate_fg_outbound_closure(checklist):
    """
    FG Outbound closure gates:
    - Loading done
    - Scale-out done
    - Gate-out done
    - POD present
    """
    if not checklist.loading_done:
        return (False, "Loading not completed")
    if not checklist.scale_out_done:
        return (False, "Scale-out not completed")
    if not checklist.gate_out_done:
        return (False, "Gate-out not completed")
    if not checklist.pod_present:
        return (False, "POD not submitted")
    
    return (True, None)

def evaluate_fg_inbound_closure(checklist):
    """
    FG Inbound closure gates:
    - Unloading done
    - Scale-out done
    - Gate-out done
    - POD present
    - (QC not required for FG inbound)
    """
    if not checklist.unloading_done:
        return (False, "Unloading not completed")
    if not checklist.scale_out_done:
        return (False, "Scale-out not completed")
    if not checklist.gate_out_done:
        return (False, "Gate-out not completed")
    if not checklist.pod_present:
        return (False, "POD not submitted")
    
    return (True, None)

def evaluate_rm_inbound_closure(checklist):
    """
    RM Inbound closure gates:
    - Unloading done
    - QC sampling done
    - QC passed
    - Scale-out done
    - Gate-out done
    - POD present
    """
    if not checklist.unloading_done:
        return (False, "Unloading not completed")
    if not checklist.qc_required:
        return (False, "QC checkpoint not triggered")
    if not checklist.qc_sampling_done:
        return (False, "QC sampling not completed")
    if checklist.qc_passed is None:
        return (False, "QC decision pending")
    if checklist.qc_passed is False:
        return (False, "QC failed — cannot close TO")
    if not checklist.scale_out_done:
        return (False, "Scale-out not completed")
    if not checklist.gate_out_done:
        return (False, "Gate-out not completed")
    if not checklist.pod_present:
        return (False, "POD not submitted")
    
    return (True, None)

def close_transport_order(transport_order, closed_by=None):
    """
    Transition TO to 'closed' state.
    """
    transport_order.execution_state = 'closed'
    transport_order.closed_at = timezone.now()
    transport_order.status = 'completed'  # Update legacy status field
    transport_order.save()
    
    # Write timeline event
    record_execution_event(
        transport_order=transport_order,
        event_type='closed',
        to_state='closed',
        actor_user=closed_by,
        source_module='closure_engine'
    )
```

### 2.3 Closure Trigger Points

**Automatic closure evaluation** (service hook):
- After **POD submission** (DM-01): `evaluate_closure_conditions(transport_order)`
- After **QC decision** (QC-01): `evaluate_closure_conditions(transport_order)`
- After **gate-out** (GT-01): `evaluate_closure_conditions(transport_order)`

**If all gates passed**: 
- `close_transport_order(transport_order)`
- TO transitions to `execution_state = 'closed'`

**If gates blocked**:
- TO remains in current state (e.g., `pod_submitted`, `qc_decision_pending`)
- `TOClosureChecklist.closure_block_reason` updated with first failing rule
- Admin/driver sees "Closure blocked: [reason]" in TO detail

### 2.4 Manual Closure Override (Admin)

**Use case**: Exception handling (e.g., QC failed but customer approved shipment)

**Permissions**: `Transport.TO.Close` (Transport Planner, Tenant Admin only)

**Admin action**:
- Button: **"Force Close TO"** (visible only if TO not closed)
- Confirmation modal: "Override closure rules? Reason required."
- Input: Override reason (text, mandatory)
- On submit:
  - Validate: user has `Transport.TO.Close` permission
  - Call: `close_transport_order(transport_order, closed_by=admin_user)`
  - Log: Create audit record (`TOClosureOverride` model — Phase 2)

### 2.5 Django Admin Configuration (TOClosureChecklist)

**List View**:
- Columns: TO Number, Flow Type, Closure Eligible, Block Reason, Last Evaluated At
- Filters: `flow_type`, `closure_eligible`, `qc_required`
- Search: TO number
- Actions: Bulk recalculate checklists (refresh flags)

**Detail View**:
- Read-only: TO (link), Flow Type
- Closure Gates (checkboxes — read-only):
  - [✓] Gate-In Done
  - [✓] Scale-In Done
  - [✓] Loading Done (if FG outbound)
  - [✓] Unloading Done (if FG/RM inbound)
  - [✓] QC Sampling Done (if RM)
  - [✓] QC Passed (if RM)
  - [✓] Scale-Out Done
  - [✓] Gate-Out Done
  - [✓] POD Present
- Closure Status: Eligible (Yes/No), Block Reason (text)
- Custom admin action: **"Refresh Checklist"** (recalculate flags)
- Custom admin action: **"Force Close TO"** (if not eligible)

---

## 3. QC-01: Raw Material QC Checkpoint (Simplified)

### 3.1 Overview

**Sprint 4 scope**: Simplified QC for RM inbound TOs — **sampling done** + **pass/fail decision** only. Detailed physical/lab workflows (§6.15 full QC) are **Phase 2**.

**Trigger**: Command Center (CC-01) creates `TOQCCheckpoint` when assigning unloading bay for RM inbound TOs.

**Flow**: Unloading done → QC Inspector records sampling → QC Inspector makes pass/fail decision → If pass, release to scale-out; if fail, block closure.

### 3.2 Data Model

#### 3.2.1 TOQCCheckpoint

```python
TOQCCheckpoint {
    checkpoint_id: UUID
    transport_order: OneToOne → TransportOrder  # One checkpoint per RM TO
    
    # Trigger
    triggered_by: FK → User (Command Center Officer)
    triggered_at: DateTime
    
    # Sampling
    sampling_done: boolean                  # True after QC Inspector records sampling
    sampling_time: DateTime (nullable)
    sampling_remarks: text (nullable)
    
    # Decision
    qc_passed: boolean (nullable)           # True = pass, False = fail, None = pending
    qc_decision_time: DateTime (nullable)
    qc_remarks: text (nullable)             # Inspector notes (required if fail)
    decided_by: FK → User (QC Inspector, nullable)
    
    # Metadata
    tenant_id: UUID
    created_at: DateTime
    updated_at: DateTime
}
```

**Constraints**:
- Unique: `(transport_order)` — one checkpoint per TO
- Cannot set `qc_passed` until `sampling_done = True` (validation)

### 3.3 QC Checkpoint Flow

#### 3.3.1 Checkpoint Creation (CC-01 trigger)

```
Command Center Officer assigns unloading bay for RM inbound TO
  └─► Backend checks: if TO.flow_type = 'rm_inbound':
        └─► Create TOQCCheckpoint(
              transport_order=TO,
              triggered_by=cc_officer,
              triggered_at=now(),
              sampling_done=False,
              qc_passed=None
            )
              └─► Update BayAssignment.qc_triggered = True
                    └─► Checkpoint appears in QC Inspector's "Pending Checkpoints" queue
```

#### 3.3.2 Sampling Recording

```
QC Inspector opens Pending Checkpoints queue
  └─► List: TO Number, Product, Vehicle, Unloading Bay, Unloading Done Time
        └─► [row click] ──► QC Checkpoint Form (Step 1: Sampling)
              ├─► Read-only: TO Summary, Product, Vehicle, Unloading Done Time
              ├─► Input: Sampling Time (auto-filled with now, editable)
              ├─► Input: Sampling Remarks (optional — e.g., "3 samples collected from top, middle, bottom")
              └─► [Record Sampling]
                    └─► Backend:
                          ├─► Update TOQCCheckpoint:
                          │     ├─► sampling_done = True
                          │     ├─► sampling_time = form.sampling_time
                          │     └─► sampling_remarks = form.sampling_remarks
                          │
                          ├─► Update TO.execution_state → 'qc_sampling_done'
                          │
                          ├─► Write TOExecutionEvent:
                          │     └─► event_type = 'qc_sampling_done'
                          │
                          └─► Response:
                                ├─► Success: "Sampling recorded. Proceed to QC decision."
                                └─► Form advances to Step 2 (QC Decision)
```

#### 3.3.3 QC Decision

```
QC Inspector (same form, Step 2: Decision)
  └─► Input section:
        ├─► Decision: Pass / Fail (radio buttons)
        ├─► Remarks: text area (required if Fail)
        └─► [Submit Decision]
              └─► Backend:
                    ├─► Validate: sampling_done = True
                    │
                    ├─► Update TOQCCheckpoint:
                    │     ├─► qc_passed = form.decision (True/False)
                    │     ├─► qc_decision_time = now()
                    │     ├─► qc_remarks = form.remarks
                    │     └─► decided_by = current_user
                    │
                    ├─► Update TO.execution_state:
                    │     ├─► If qc_passed = True: → 'qc_passed'
                    │     └─► If qc_passed = False: → 'qc_failed'
                    │
                    ├─► Write TOExecutionEvent:
                    │     └─► event_type = 'qc_decision', payload = {qc_passed, qc_remarks}
                    │
                    ├─► Trigger closure evaluation:
                    │     └─► If qc_passed = True: evaluate_closure_conditions(transport_order)
                    │           └─► If all gates passed: close TO
                    │     └─► If qc_passed = False: closure blocked
                    │
                    └─► Response:
                          ├─► If Pass: "QC passed. Vehicle released to scale-out."
                          │     └─► Vehicle eligible for scale-out queue (SC-01)
                          │
                          └─► If Fail: "QC failed. TO closure blocked. Supervisor notified."
                                └─► Vehicle cannot scale-out or gate-out (blocked)
```

### 3.4 QC Fail Handling

**If QC fails** (`qc_passed = False`):
- TO cannot close (closure rule blocks)
- Vehicle cannot scale-out or gate-out (GT-01 clearance check fails)
- Supervisor notified (in-app notification or email — Phase 2)
- Manual override by Procurement Manager (Phase 2):
  - Button: "Override QC Fail" (requires approval reason)
  - Updates: `qc_passed = True`, logs override event
  - Releases vehicle for scale-out

### 3.5 Django Admin Configuration (TOQCCheckpoint)

**List View**:
- Columns: TO Number, Product, Sampling Done, QC Passed, Decision Time, Decided By, Status (Pending/Pass/Fail)
- Filters: `qc_passed`, `sampling_done`, `triggered_at` (date range)
- Search: TO number, Product name
- Actions: Bulk export CSV

**Status Badge**:
- Green: Pass
- Red: Fail
- Yellow: Pending (sampling or decision)

**Detail View**:
- Read-only: TO (link), Product, Triggered By/At
- Sampling Section:
  - Sampling Done (✓/✗), Sampling Time, Sampling Remarks
- Decision Section:
  - QC Passed (Pass/Fail/Pending), Decision Time, Decided By (link), QC Remarks
- Custom admin action: **"View TO Timeline"** (redirect to TLS-01)
- Custom admin action: **"Override QC Fail"** (Procurement Manager only — Phase 2)

---

## 4. API Endpoints

### 4.1 TO Timeline (TLS-01)

```http
GET    /api/v1/transport-orders/{to_id}/timeline/
       → Fetch full execution timeline
       → Response: {
           to_id,
           flow_type,
           execution_state,
           events: [
             {
               event_id,
               event_type: "gate_in",
               event_time: "2026-05-06T09:00:00Z",
               actor: {user_id, name, role},
               to_state: "gate_in_source",
               payload: {remarks: "Vehicle arrived on time"}
             },
             ...
           ],
           timeline_summary: [
             {state: "ready_for_dispatch", timestamp: "...", completed: true},
             {state: "started", timestamp: "...", completed: true},
             {state: "gate_in_source", timestamp: null, completed: false},
             ...
           ]
         }
```

### 4.2 Closure Checklist (POD-01)

```http
GET    /api/v1/transport-orders/{to_id}/closure-checklist/
       → Fetch closure gate status
       → Response: {
           to_id,
           flow_type,
           closure_eligible: false,
           closure_block_reason: "Scale-out not completed",
           gates: {
             loading_done: true,
             scale_out_done: false,
             gate_out_done: false,
             pod_present: true,
             qc_required: false,
             qc_passed: null
           },
           last_evaluated_at: "2026-05-06T15:00:00Z"
         }
```

### 4.3 POD Submission (already covered in DM-01)

```http
POST   /api/v1/driver/transport-orders/{to_id}/pod/
       → Driver submits POD
       → Side effects: Trigger closure evaluation
```

### 4.4 QC Checkpoint (QC-01)

```http
GET    /api/v1/qc/pending-checkpoints/
       → List TOs with QC checkpoints pending decision
       → Filters: ?poi_id=...
       → Response: [
           {
             checkpoint_id,
             transport_order: {to_id, to_number, product, quantity_mt},
             vehicle: {registration},
             unloading_done_at,
             sampling_done,
             qc_passed
           }
         ]

POST   /api/v1/qc/checkpoints/{checkpoint_id}/record-sampling/
       → Record QC sampling
       → Body: {
           sampling_time: "2026-05-06T14:00:00Z" (optional, defaults to now),
           sampling_remarks: "3 samples collected"
         }
       → Response: {checkpoint_id, message: "Sampling recorded."}

POST   /api/v1/qc/checkpoints/{checkpoint_id}/submit-decision/
       → Submit QC decision (pass/fail)
       → Body: {
           qc_passed: true | false,
           qc_remarks: "All samples meet quality standards" (required if fail)
         }
       → Validations:
           - sampling_done must be True
       → Side effects:
           - Update TOQCCheckpoint
           - Update TO execution_state
           - Write TOExecutionEvent
           - Trigger closure evaluation (if pass)
       → Response: {
           checkpoint_id,
           message: "QC passed. Vehicle released to scale-out." | "QC failed. Closure blocked."
         }
```

---

## 5. Business Rules

### 5.1 TO Lifecycle Rules

**Execution state transitions**:
- Transitions must follow flow-specific state machine (no skipping states)
- Driver/yard actions advance execution_state via `timeline_service.record_execution_event()`
- Backward transitions not allowed (except admin cancel)

**Fleet readiness enforcement** (DS-02):
- On first execution action (`started` milestone), validate:
  - Vehicle not under maintenance
  - Driver not on leave
  - (Optional) Pre-movement checklist approved

### 5.2 Closure Rules

**FG Outbound closure gates**:
- Loading done ✓
- Scale-out done ✓
- Gate-out done ✓
- POD present ✓

**FG Inbound closure gates**:
- Unloading done ✓
- Scale-out done ✓
- Gate-out done ✓
- POD present ✓
- (QC not required)

**RM Inbound closure gates**:
- Unloading done ✓
- QC sampling done ✓
- QC passed ✓
- Scale-out done ✓
- Gate-out done ✓
- POD present ✓

**Closure evaluation triggers**:
- After POD submission (DM-01)
- After QC decision (QC-01)
- After gate-out (GT-01)

### 5.3 QC Checkpoint Rules

**Trigger**:
- Command Center creates checkpoint for RM inbound TOs at bay assignment time
- Checkpoint not created for FG TOs

**Sampling**:
- Cannot submit QC decision without sampling done

**Decision**:
- Pass: releases vehicle to scale-out queue
- Fail: blocks scale-out, blocks gate-out, blocks closure
- Override: Procurement Manager can force pass (audit logged)

---

## 6. Integration Points

### 6.1 With All Sprint 4 Yard Modules

**Every yard action writes timeline event**:
- Gate-in/out (GT-01) → `record_execution_event(event_type='gate_in'/'gate_out')`
- Scale-in/out (SC-01) → `record_execution_event(event_type='scale_in'/'scale_out')`
- Bay assignment (CC-01) → `record_execution_event(event_type='bay_assigned')`
- Loading/unloading (LD-01) → `record_execution_event(event_type='loading_started'/'loading_completed')`
- QC decision (QC-01) → `record_execution_event(event_type='qc_decision')`
- POD submission (DM-01) → `record_execution_event(event_type='pod_submitted')`

### 6.2 With Driver Supervisor (DS-01, DS-02)

**First execution action guard**:
- `apps/transport/lifecycle/execution_guards.py:validate_execution_readiness()`
- Called by: Driver mobile "Mark as Started" (DM-01), Gate-in (GT-01)
- Checks: Vehicle not under maintenance, Driver not on leave

### 6.3 With Command Center (CC-01)

**QC checkpoint trigger**:
- CC-01 bay assignment service creates `TOQCCheckpoint` for RM inbound TOs
- `qc_triggered = True` flag on `BayAssignment`

---

## 7. Permissions & RBAC

### 7.1 Permission Codes (add to `apps/core/constants_rbac.py`)

```python
# Timeline
Transport.TO.ExecutionTimeline.Read

# Closure
Transport.TO.Close                      # Manual override
Transport.POD.Read
Transport.POD.Submit                    # Driver (covered in DM-01)

# QC Checkpoint
Quality.QCCheckpoint.Trigger            # Command Center
Quality.QCCheckpoint.Sampling.Write     # QC Inspector
Quality.QCCheckpoint.Decision.Write     # QC Inspector
Quality.QCCheckpoint.Read               # All stakeholders
```

### 7.2 Role → Permission Mapping

**Transport Planner / TDO**:
- `Transport.TO.ExecutionTimeline.Read`
- `Transport.TO.Close` (manual override)
- `Transport.POD.Read`

**Driver**:
- `Transport.POD.Submit` (covered in DM-01)

**Command Center Officer**:
- `Quality.QCCheckpoint.Trigger`
- `Transport.TO.ExecutionTimeline.Read`

**QC Inspector**:
- `Quality.QCCheckpoint.Sampling.Write`
- `Quality.QCCheckpoint.Decision.Write`
- `Quality.QCCheckpoint.Read`

---

## 8. Reports & KPIs (Phase 2)

### 8.1 TO Execution Metrics

- Average cycle time (Ready for Dispatch → Closed) per flow type
- Bottleneck analysis (longest stage: gate, scale, loading, QC)
- On-time delivery rate (closed_at <= planned_delivery_datetime)

### 8.2 QC Performance

- QC pass rate (% of RM TOs that passed QC)
- Average QC turnaround time (unloading_done → qc_decision)
- Top rejection reasons (from qc_remarks)

---

## 9. Dependencies

### Upstream
- All Sprint 4 modules (GT-01, SC-01, CC-01, LD-01, DS-01, DS-02, DM-01, QC-01)

### Downstream
- No downstream dependencies (this is the terminal module)

---

## 10. Sprint 4 Story Mapping

| Story | Scope | Implementation Focus |
|-------|-------|----------------------|
| **TLS-01** | TO lifecycle — execution, yard & closure substates (+ audit) | TOExecutionEvent model + TOClosureChecklist model + timeline service + state machine + execution guards + timeline API + admin UI |
| **POD-01** | TO closure — POD & gate-out linkage | Closure engine + flow-specific closure matrices + manual override + closure checklist refresh + POD integration (from DM-01) |
| **QC-01** | Raw-material QC — sampling & pass/fail decision | TOQCCheckpoint model + QC checkpoint form + sampling/decision service + QC fail blocking + admin UI + API endpoints + CC-01 trigger integration |

---

**Last Updated**: 2026-05-06  
**Related Modules**: All Sprint 4 modules ([gate-operations-sprint4.md](../06-poi-operations/gate-operations-sprint4.md), [scaling-operations-sprint4.md](../06-poi-operations/scaling-operations-sprint4.md), [command-center-loading-sprint4.md](../06-poi-operations/command-center-loading-sprint4.md), [driver-interface-sprint4.md](../03-users/driver-interface-sprint4.md), [driver-supervisor-operations.md](../08-fleet-management/driver-supervisor-operations.md))
