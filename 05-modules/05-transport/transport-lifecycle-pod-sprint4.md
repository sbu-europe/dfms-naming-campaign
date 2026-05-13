---
module: 05-transport
specification: Transport Lifecycle, POD & QC Checkpoint (Sprint 4)
version: 2.0
phase: Phase 1
sprint: Sprint 4
last_updated: 2026-05-12
related_stories: DFS-059 (TLS-01), DFS-060 (POD-01), DFS-064 (QC-01)
jira_epic: DFS-075
---

# Transport Lifecycle, POD & QC Checkpoint Specification (Sprint 4)

## Overview

This specification covers three interconnected capabilities that manage the full Transport Order execution lifecycle:

1. **TLS-01 — TO Lifecycle & Timeline**: Two-level status/sub-state tracking, code-first state machine, event ingest, audit trail
2. **POD-01 — TO Closure & POD Linkage**: Lane-aware closure rule engine, auto-close trigger, exceptions list, manual close guard
3. **QC-01 — Raw Material QC Checkpoint**: Sample creation, pass/fail decision, resample during unloading, override-to-failed

The TO lifecycle state machine tracks execution from "Draft" through yard operations to "Closed" using a **TOStatus + TOSubState** pair (PRD §6.8.5). The **closure engine** evaluates flow-specific gates (FG outbound, FG inbound, RM inbound) and transitions TOs to "Closed" only when all conditions are met. QC checkpoints are **triggered by Command Center** (CC-01) for RM inbound TOs and block closure until QC passes.

**Module path**: 
- `apps/transport/lifecycle/` (state machine + event ingest + execution guards)
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

Sidebar (QC Supervisor)
└── Quality
      └── QC Checkpoint (NEW — QC-01)
            ├── QC Queue                         — RM TOs flagged for QC by CC-01, awaiting sample/decision
            │     └── [row click] ──► QC Checkpoint Form
            │
            ├── Active Unloading (QC view)       — RM TOs currently unloading where QC can resample/override
            │     └── [Resample] / [Override to Failed] custom actions
            │
            └── QC History                       — completed checkpoints (searchable)
                  └── [Export CSV]
```

---

## 1. TLS-01: TO Lifecycle & Timeline

### 1.1 TOStatus + TOSubState (PRD §6.8.5 State Chain)

Sprint 4 replaces the flat `execution_state` enum with a two-level status/sub-state model.

**Sprint 3 legacy field** (no change):
- `TransportOrder.status` — remains: `created`, `vehicle_assigned`, `vendor_assigned`, `confirmed`, `in_progress`, `completed`, `cancelled`

**Sprint 4 new fields**:
- `TransportOrder.to_status` — coarse status (`TOStatus` TextChoices)
- `TransportOrder.to_sub_state` — fine-grained sub-state (`TOSubState` TextChoices)

#### 1.1.1 TOStatus Enum

```python
class TOStatus(models.TextChoices):
    DRAFT               = 'draft',                'Draft'                    # Sprint 3 creation
    PLANNED             = 'planned',              'Planned'
    ASSIGNED            = 'assigned',             'Assigned'
    DISPATCHED          = 'dispatched',           'Dispatched'
    IN_TRANSIT_SOURCE   = 'in_transit_source',    'In Transit – Source'
    AT_SOURCE           = 'at_source',            'At Source'
    LOADED              = 'loaded',               'Loaded / Pickup Completed'
    IN_TRANSIT_DEST     = 'in_transit_dest',      'In Transit – Destination'
    AT_DESTINATION      = 'at_destination',       'At Destination'
    DELIVERED           = 'delivered',            'Delivered / Unloaded'
    COMPLETED           = 'completed',            'Completed'
    CLOSED              = 'closed',               'Closed'
    CANCELLED           = 'cancelled',            'Cancelled'
```

#### 1.1.2 TOSubState Enum

```python
class TOSubState(models.TextChoices):
    # --- Planned ---
    FLEET_DECIDED           = 'fleet_decided',           'Fleet Decided'
    AWAITING_ASSIGNMENT     = 'awaiting_assignment',     'Awaiting Assignment'

    # --- Assigned ---
    VEHICLE_DRIVER_HELPER_ASSIGNED = 'vdh_assigned',     'Vehicle/Driver/Helper Assigned'
    ASSIGNMENT_CONFIRMED    = 'assignment_confirmed',    'Assignment Confirmed'

    # --- Dispatched ---
    DISPATCH_APPROVED       = 'dispatch_approved',       'Dispatch Approved'
    VEHICLE_DEPARTED        = 'vehicle_departed',        'Vehicle Departed'

    # --- In Transit – Source ---
    EN_ROUTE_TO_SOURCE      = 'en_route_source',         'En Route to Source'
    DELAYED_SOURCE          = 'delayed_source',          'Delayed'
    HALTED_SOURCE           = 'halted_source',           'Halted'              # §6.8.6 Phase 2

    # --- At Source ---
    GATE_IN_SOURCE          = 'gate_in_source',          'Gate-in Recorded'
    SCALE_IN_SOURCE         = 'scale_in_source',         'Scale-in'
    WAITING_PARKED_SOURCE   = 'waiting_parked_source',   'Waiting / Parked'

    # --- Loaded / Pickup Completed ---
    LOADING_STARTED         = 'loading_started',         'Loading Started'
    LOADING_COMPLETED       = 'loading_completed',       'Loading Completed'
    SCALE_OUT_SOURCE        = 'scale_out_source',        'Scale-out'
    ASSIGNED_TO_LOADING_POINT = 'assigned_loading_pt',   'Assigned to Loading Point'
    PICKUP_CONFIRMED        = 'pickup_confirmed',        'Pick-up Confirmed'
    GATE_OUT_SOURCE         = 'gate_out_source',         'Gate-out'

    # --- In Transit – Destination ---
    EN_ROUTE_TO_DEST        = 'en_route_dest',           'En Route to Destination'
    DELAYED_DEST            = 'delayed_dest',            'Delayed'
    HALTED_DEST             = 'halted_dest',             'Halted'              # §6.8.6 Phase 2

    # --- At Destination ---
    GATE_IN_DEST            = 'gate_in_dest',            'Gate-in Recorded'
    SCALE_IN_DEST           = 'scale_in_dest',           'Scale-in'
    WAITING_PARKED_DEST     = 'waiting_parked_dest',     'Waiting / Parked'
    ASSIGNED_TO_UNLOADING_POINT = 'assigned_unloading_pt', 'Assigned to Unloading Point'
    SAMPLING_STARTED        = 'sampling_started',        'Sampling Started'
    QC_STARTED              = 'qc_started',              'QC Started'
    LAB_ANALYSIS_IN_PROGRESS = 'lab_analysis',           'Lab Analysis In Progress'

    # --- Delivered / Unloaded ---
    UNLOADING_STARTED       = 'unloading_started',       'Unloading Started'
    UNLOADING_COMPLETED     = 'unloading_completed',     'Unloading Completed'
    SCALE_OUT_DEST          = 'scale_out_dest',          'Scale-out'
    POD_SUBMITTED           = 'pod_submitted',           'POD Submitted'
    RECEIVER_CONFIRMATION   = 'receiver_confirmation',   'Receiver Confirmation'

    # --- Completed ---
    QC_PASSED               = 'qc_passed',               'QC Passed'
    QC_FAILED               = 'qc_failed',               'QC Failed'
```

> **Note**: `HALTED_SOURCE` and `HALTED_DEST` sub-states are **reserved** but have no trigger in Sprint 4 (§6.8.6 Phase 2).

#### 1.1.3 Full State Chain Table

| TOStatus | Sub-States | Trigger Source |
|----------|-----------|----------------|
| Draft | *(none — Sprint 3)* | Planner creates TO |
| Planned | Fleet Decided, Awaiting Assignment | Fleet module |
| Assigned | Vehicle/Driver/Helper Assigned, Assignment Confirmed | DS-01, DM-01 |
| Dispatched | Dispatch Approved, Vehicle Departed | TDO / DS-01 |
| In Transit – Source | En Route to Source, Delayed, ~~Halted~~ (reserved) | DM-01, GPS Phase 2 |
| At Source | Gate-in Recorded, Scale-in, Waiting/Parked | GT-01, SC-01, CC-01 |
| Loaded / Pickup Completed | Loading Started, Loading Completed, Scale-out, Assigned to Loading Point, Pick-up Confirmed, Gate-out | LD-01, SC-01, CC-01, GT-01 |
| In Transit – Destination | En Route to Destination, Delayed, ~~Halted~~ (reserved) | DM-01, GPS Phase 2 |
| At Destination | Gate-in Recorded, Scale-in, Waiting/Parked, Assigned to Unloading Point, Sampling Started, QC Started, Lab Analysis In Progress | GT-01, SC-01, CC-01, QC-01 |
| Delivered / Unloaded | Unloading Started, Unloading Completed, Scale-out, POD Submitted, Receiver Confirmation | LD-01, SC-01, DM-01 |
| Completed | QC Passed, QC Failed | QC-01 |
| Closed | *(none)* | Closure engine |

### 1.2 Flow Lane Mapping

Each flow lane defines which status/sub-state transitions are valid and which yard operation triggers them:

**FG Outbound** (loading at source):
```
Draft → Planned → Assigned → Dispatched
  → In Transit – Source (En Route to Source)
    → At Source (Gate-in, Scale-in, Waiting/Parked)
      → Loaded (Assigned to Loading Point, Loading Started, Loading Completed, Scale-out, Pick-up Confirmed, Gate-out)
        → In Transit – Destination (En Route to Destination)
          → Delivered (POD Submitted, Receiver Confirmation)
            → Closed
```

**FG Inbound** (unloading at destination):
```
Draft → Planned → Assigned → Dispatched
  → In Transit – Destination (En Route to Destination)
    → At Destination (Gate-in, Scale-in, Waiting/Parked)
      → Delivered (Assigned to Unloading Point, Unloading Started, Unloading Completed, Scale-out, POD Submitted, Receiver Confirmation)
        → Closed
```

**RM Inbound** (unloading + QC at destination):
```
Draft → Planned → Assigned → Dispatched
  → In Transit – Destination (En Route to Destination)
    → At Destination (Gate-in, Scale-in, Waiting/Parked, Assigned to Unloading Point, Sampling Started, QC Started, Lab Analysis In Progress)
      → Delivered (Unloading Started, Unloading Completed, Scale-out, POD Submitted, Receiver Confirmation)
        → Completed (QC Passed | QC Failed)
          → Closed (only if QC Passed)
```

### 1.3 Data Model

#### 1.3.1 TransportOrder Extensions

```python
TransportOrder {
    # ... existing Sprint 3 fields ...
    
    # Sprint 4 — two-level status tracking (replaces flat execution_state)
    to_status: TOStatus                      # Coarse status enum
    to_sub_state: TOSubState (nullable)      # Fine-grained sub-state (null when sub-state not applicable)
    flow_type: enum                          # ['fg_outbound', 'fg_inbound', 'rm_inbound', 'internal_transfer']
    source_channel: enum                     # ['planner', 'gate_on_demand']
    
    # Denormalized execution timestamps (canonical data in TOStatusTransitionLog)
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

#### 1.3.2 TOStatusTransitionLog (new model — replaces TOExecutionEvent)

```python
TOStatusTransitionLog {
    id: UUID
    transport_order: FK → TransportOrder
    
    # Transition
    from_status: TOStatus (nullable)         # Previous to_status (null for first transition)
    from_sub_state: TOSubState (nullable)
    to_status: TOStatus                      # New to_status after transition
    to_sub_state: TOSubState (nullable)
    
    # Actor
    actor: FK → User (nullable)              # Who triggered (null for system events)
    
    # Timing
    timestamp: DateTime                      # When the transition occurred
    
    # Context
    payload: JSONField                       # Event-specific data (e.g., {gross_weight_kg, pc_code, remarks})
    
    # Metadata
    tenant_id: UUID
    created_at: DateTime                     # System timestamp
}
```

**Constraints**:
- Index: `(transport_order, timestamp)` — fast timeline queries
- Append-only (no updates/deletes — audit trail integrity)
- `payload` JSON stores event-specific context (weight, gate number, bay, QC result, etc.)

#### 1.3.3 ClosureChecklist (new model — per-TO prerequisite flags)

```python
ClosureChecklist {
    id: UUID
    transport_order: OneToOne → TransportOrder  # One checklist per TO
    
    # Flow type (denormalized for rule engine)
    flow_type: enum                          # ['fg_outbound', 'fg_inbound', 'rm_inbound']
    
    # Prerequisite flags
    pod_uploaded: boolean                    # True if TOPOD exists
    scale_out_done: boolean                  # Scale-out recorded
    gate_out_done: boolean                   # Gate-out recorded
    loading_complete: boolean                # Loading complete (FG outbound only)
    unloading_complete: boolean              # Unloading complete (FG/RM inbound only)
    qc_passed: boolean (nullable)           # True if latest QC decision = Pass; False if Fail; None if pending/not required
    
    # Derived status
    closure_eligible: boolean                # True if all flow-specific gates passed (auto-calculated)
    closure_block_reason: text (nullable)    # First failing rule (e.g., "Scale-out not completed")
    
    # Timestamps
    last_evaluated_at: DateTime
    
    # Metadata
    tenant_id: UUID
}
```

### 1.4 State Machine Service (`apps/transport/lifecycle/state_machine.py`)

**Code-first rules table**: Forward-only transitions per flow lane. No backward transitions except admin cancel.

```python
TRANSITION_RULES = {
    'fg_outbound': [
        (TOStatus.DRAFT,             None,                          TOStatus.PLANNED,           TOSubState.FLEET_DECIDED),
        (TOStatus.PLANNED,           TOSubState.FLEET_DECIDED,      TOStatus.PLANNED,           TOSubState.AWAITING_ASSIGNMENT),
        (TOStatus.PLANNED,           TOSubState.AWAITING_ASSIGNMENT,TOStatus.ASSIGNED,           TOSubState.VEHICLE_DRIVER_HELPER_ASSIGNED),
        (TOStatus.ASSIGNED,          TOSubState.VEHICLE_DRIVER_HELPER_ASSIGNED, TOStatus.ASSIGNED, TOSubState.ASSIGNMENT_CONFIRMED),
        (TOStatus.ASSIGNED,          TOSubState.ASSIGNMENT_CONFIRMED,TOStatus.DISPATCHED,        TOSubState.DISPATCH_APPROVED),
        (TOStatus.DISPATCHED,        TOSubState.DISPATCH_APPROVED,  TOStatus.DISPATCHED,         TOSubState.VEHICLE_DEPARTED),
        (TOStatus.DISPATCHED,        TOSubState.VEHICLE_DEPARTED,   TOStatus.IN_TRANSIT_SOURCE,  TOSubState.EN_ROUTE_TO_SOURCE),
        (TOStatus.IN_TRANSIT_SOURCE, TOSubState.EN_ROUTE_TO_SOURCE, TOStatus.AT_SOURCE,          TOSubState.GATE_IN_SOURCE),
        (TOStatus.AT_SOURCE,         TOSubState.GATE_IN_SOURCE,     TOStatus.AT_SOURCE,          TOSubState.SCALE_IN_SOURCE),
        (TOStatus.AT_SOURCE,         TOSubState.SCALE_IN_SOURCE,    TOStatus.AT_SOURCE,          TOSubState.WAITING_PARKED_SOURCE),
        (TOStatus.AT_SOURCE,         '*',                           TOStatus.LOADED,             TOSubState.ASSIGNED_TO_LOADING_POINT),
        (TOStatus.LOADED,            TOSubState.ASSIGNED_TO_LOADING_POINT, TOStatus.LOADED,      TOSubState.LOADING_STARTED),
        (TOStatus.LOADED,            TOSubState.LOADING_STARTED,    TOStatus.LOADED,             TOSubState.LOADING_COMPLETED),
        (TOStatus.LOADED,            TOSubState.LOADING_COMPLETED,  TOStatus.LOADED,             TOSubState.SCALE_OUT_SOURCE),
        (TOStatus.LOADED,            TOSubState.SCALE_OUT_SOURCE,   TOStatus.LOADED,             TOSubState.PICKUP_CONFIRMED),
        (TOStatus.LOADED,            TOSubState.PICKUP_CONFIRMED,   TOStatus.LOADED,             TOSubState.GATE_OUT_SOURCE),
        (TOStatus.LOADED,            TOSubState.GATE_OUT_SOURCE,    TOStatus.IN_TRANSIT_DEST,    TOSubState.EN_ROUTE_TO_DEST),
        (TOStatus.IN_TRANSIT_DEST,   TOSubState.EN_ROUTE_TO_DEST,   TOStatus.DELIVERED,          TOSubState.POD_SUBMITTED),
        (TOStatus.DELIVERED,         TOSubState.POD_SUBMITTED,      TOStatus.DELIVERED,          TOSubState.RECEIVER_CONFIRMATION),
        (TOStatus.DELIVERED,         TOSubState.RECEIVER_CONFIRMATION, TOStatus.CLOSED,           None),
    ],
    'fg_inbound': [
        # ... similar chain, yard ops at destination (unloading) ...
    ],
    'rm_inbound': [
        # ... similar chain, yard ops at destination + QC gate before closure ...
    ],
}

def validate_transition(transport_order, target_status, target_sub_state):
    """
    Validate whether the proposed transition is allowed by the flow-lane rules table.
    Raises InvalidStatusTransitionError if not allowed.
    Returns True if valid.
    """
    flow_rules = TRANSITION_RULES.get(transport_order.flow_type)
    current = (transport_order.to_status, transport_order.to_sub_state)
    target = (target_status, target_sub_state)
    
    for from_status, from_sub, to_status, to_sub in flow_rules:
        if from_status == current[0] and (from_sub == current[1] or from_sub == '*'):
            if to_status == target[0] and to_sub == target[1]:
                return True
    
    raise InvalidStatusTransitionError(
        f"Cannot transition from {current} to {target} for flow {transport_order.flow_type}"
    )

def apply_transition(transport_order, target_status, target_sub_state, actor=None, payload=None):
    """
    Validate + apply transition atomically.
    Writes TOStatusTransitionLog, updates TO, refreshes closure checklist.
    """
    validate_transition(transport_order, target_status, target_sub_state)
    
    log = TOStatusTransitionLog.objects.create(
        transport_order=transport_order,
        from_status=transport_order.to_status,
        from_sub_state=transport_order.to_sub_state,
        to_status=target_status,
        to_sub_state=target_sub_state,
        actor=actor,
        timestamp=timezone.now(),
        payload=payload or {},
    )
    
    transport_order.to_status = target_status
    transport_order.to_sub_state = target_sub_state
    transport_order.save(update_fields=['to_status', 'to_sub_state'])
    
    update_denormalized_timestamp(transport_order, target_status, target_sub_state)
    refresh_closure_checklist(transport_order)
    
    return log
```

### 1.5 Event Ingest Service (`apps/transport/lifecycle/event_ingest.py`)

Receives events from upstream yard modules and translates them into state transitions.

**Event sources**:
| Source Module | Events | Target Sub-State |
|---------------|--------|-------------------|
| GT-01 (Gate) | gate_in, gate_out | Gate-in Recorded, Gate-out |
| SC-01 (Scaling) | scale_in, scale_out | Scale-in, Scale-out |
| CC-01 (Command Center) | bay_assigned, qc_flagged | Assigned to Loading/Unloading Point, QC Started |
| LD-01 (Loading/Unloading) | loading_started, loading_completed, unloading_started, unloading_completed | Loading Started/Completed, Unloading Started/Completed |
| QC-01 (Quality) | sampling_done, qc_decision, resample, override | Sampling Started, QC Passed/Failed |
| DM-01 (Driver Mobile) | execution_started, pod_submitted | Vehicle Departed, POD Submitted |

```python
def ingest_event(transport_order, event_type, actor=None, payload=None, source_module=None):
    """
    Translate an upstream module event into a state machine transition.
    
    Determines target (status, sub_state) from event_type + current state + flow_type,
    then delegates to apply_transition().
    """
    target_status, target_sub_state = resolve_target_state(
        transport_order, event_type
    )
    
    merged_payload = {**(payload or {}), 'source_module': source_module, 'event_type': event_type}
    
    return apply_transition(
        transport_order, target_status, target_sub_state,
        actor=actor, payload=merged_payload
    )
```

### 1.6 Fleet Availability Validation (§6.8.1.7)

On first driver execution action (e.g., "Mark as Started" from DM-01, or first gate-in), validate fleet readiness:

```python
def validate_fleet_availability(transport_order):
    """
    §6.8.1.7 — Called on first driver execution action.
    Raises BusinessRuleError if fleet not available.
    """
    vehicle = transport_order.vehicle
    driver = transport_order.driver
    
    if vehicle and vehicle.is_under_maintenance:
        raise BusinessRuleError("Vehicle is under maintenance — cannot start execution")
    if driver and driver.is_on_leave:
        raise BusinessRuleError("Driver is on leave — cannot start execution")
```

### 1.7 Django Admin Configuration

**TOStatusTransitionLog — List View**:
- Columns: TO Number, From Status, From Sub-State, To Status, To Sub-State, Actor, Timestamp
- Filters: `to_status`, `to_sub_state`, `timestamp` (date range), `transport_order__flow_type`
- Search: TO number
- Actions: Bulk export CSV

**TOStatusTransitionLog — Detail View**:
- Read-only: TO (link), From Status → To Status, From Sub-State → To Sub-State, Actor (link), Timestamp
- JSON widget for `payload` (expandable)
- Custom admin action: **"View Full Timeline"** (redirect to TO timeline view)

### 1.8 Sub-Tasks (TLS-01-1 through TLS-01-10)

| Sub-Task | Scope |
|----------|-------|
| TLS-01-1 | `TOStatus` + `TOSubState` TextChoices enums |
| TLS-01-2 | `TOStatusTransitionLog` model + migration |
| TLS-01-3 | `TransportOrder` field additions (`to_status`, `to_sub_state`) + migration |
| TLS-01-4 | Code-first transition rules table per flow lane |
| TLS-01-5 | `validate_transition()` + `apply_transition()` service functions |
| TLS-01-6 | Event ingest service (translate upstream events → transitions) |
| TLS-01-7 | Fleet availability validation (§6.8.1.7) |
| TLS-01-8 | Timeline API endpoints (GET timeline, GET status, POST transitions, GET validate) |
| TLS-01-9 | Django Admin for `TOStatusTransitionLog` |
| TLS-01-10 | Denormalized timestamp updates + closure checklist refresh hook |

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

#### 2.1.2 ClosureChecklist (per-TO prerequisite flags)

See §1.3.3 above. Fields: `pod_uploaded`, `scale_out_done`, `gate_out_done`, `loading_complete`, `unloading_complete`, `qc_passed`.

### 2.2 ClosureRuleEngine Service (`apps/transport/closure/closure_engine.py`)

Lane-aware rule evaluation. Each flow lane has a closure matrix defining which prerequisite flags must be true.

```python
CLOSURE_MATRICES = {
    'fg_outbound': ['loading_complete', 'scale_out_done', 'gate_out_done', 'pod_uploaded'],
    'fg_inbound':  ['unloading_complete', 'scale_out_done', 'gate_out_done', 'pod_uploaded'],
    'rm_inbound':  ['unloading_complete', 'sampling_done', 'qc_passed', 'scale_out_done', 'gate_out_done', 'pod_uploaded'],
}

CLOSURE_MESSAGES = {
    'loading_complete':   "Loading not completed",
    'unloading_complete': "Unloading not completed",
    'sampling_done':      "QC sampling not completed",
    'qc_passed':          "QC not passed",
    'scale_out_done':     "Scale-out not completed",
    'gate_out_done':      "Gate-out not completed",
    'pod_uploaded':       "POD not uploaded",
}

def evaluate_closure(transport_order):
    """
    Evaluate closure gates for a TO using its flow-lane closure matrix.
    Reads latest QC decision for RM inbound TOs.
    
    Returns:
        (can_close: bool, block_reason: str | None)
    """
    checklist = get_or_create_closure_checklist(transport_order)
    refresh_closure_checklist(transport_order)
    
    matrix = CLOSURE_MATRICES.get(transport_order.flow_type)
    if not matrix:
        return (False, f"Unknown flow_type: {transport_order.flow_type}")
    
    for prerequisite in matrix:
        if prerequisite == 'qc_passed':
            latest_decision = get_latest_qc_decision(transport_order)
            if latest_decision is None or latest_decision.decision != 'pass':
                return (False, CLOSURE_MESSAGES[prerequisite])
        elif not getattr(checklist, prerequisite, False):
            return (False, CLOSURE_MESSAGES[prerequisite])
    
    return (True, None)
```

### 2.3 Closure Matrices

**FG Outbound** closure gates:
- Loading complete ✓
- Scale-out done ✓
- Gate-out done ✓
- POD uploaded ✓

**FG Inbound** closure gates:
- Unloading complete ✓
- Scale-out done ✓
- Gate-out done ✓
- POD uploaded ✓

**RM Inbound** closure gates:
- Unloading complete ✓
- Sampling done ✓
- QC passed ✓ (reads latest `QCDecision` — Pass allows closure, Fail blocks)
- Scale-out done ✓
- Gate-out done ✓
- POD uploaded ✓

### 2.4 Auto-Close Trigger

Signal/hook that evaluates closure rules whenever **any prerequisite is fulfilled**:

```python
def on_prerequisite_fulfilled(transport_order, fulfilled_flag):
    """
    Called by upstream modules after completing a closure-relevant action.
    Triggers: POD submission (DM-01), QC decision (QC-01), gate-out (GT-01),
              loading/unloading complete (LD-01), scale-out (SC-01).
    """
    checklist = refresh_closure_checklist(transport_order)
    
    can_close, block_reason = evaluate_closure(transport_order)
    
    if can_close:
        close_transport_order(transport_order)
    else:
        checklist.closure_block_reason = block_reason
        checklist.closure_eligible = False
        checklist.last_evaluated_at = timezone.now()
        checklist.save()

def close_transport_order(transport_order, closed_by=None):
    """
    Transition TO to 'closed' state via state machine.
    """
    apply_transition(
        transport_order,
        target_status=TOStatus.CLOSED,
        target_sub_state=None,
        actor=closed_by,
        payload={'source': 'closure_engine', 'auto_close': closed_by is None}
    )
    transport_order.closed_at = timezone.now()
    transport_order.status = 'completed'  # Update legacy status field
    transport_order.save(update_fields=['closed_at', 'status'])
```

### 2.5 Exceptions List View (Django Admin)

Django Admin changelist filtered to TOs blocked from closing:

**List View** — `ClosureExceptionsAdmin`:
- Filter: `closure_eligible = False` (hardcoded queryset filter)
- Columns: TO Number, Flow Type, Blocking Reason, Last Evaluated At
- Search: TO number
- Custom column: **Blocking Reason** — displays `closure_block_reason` with red badge
- Actions: Bulk recalculate checklists (refresh flags)

### 2.6 Manual Close Action (Admin Guard)

**Use case**: Exception handling (e.g., QC failed but customer approved shipment)

**Permissions**: `Transport.TO.Close` (Transport Planner, Tenant Admin only)

**Admin action** — enforces all prerequisites before allowing close:
- Button: **"Close TO"** (visible only if TO not closed)
- On submit:
  1. **Guard validation**: `evaluate_closure(transport_order)` — if any prerequisite fails, show error with blocking reason
  2. **If all gates pass**: `close_transport_order(transport_order, closed_by=admin_user)`
  3. **If gates blocked**: Display: "Cannot close TO: [block_reason]. Resolve prerequisites first."
- Override: **"Force Close TO"** (requires override reason, logs audit record)
  - Confirmation modal: "Override closure rules? Reason required."
  - Input: Override reason (text, mandatory)
  - On submit: Close TO regardless of gate status, log `TOClosureOverride` audit record

### 2.7 Django Admin Configuration (ClosureChecklist)

**List View**:
- Columns: TO Number, Flow Type, Closure Eligible, Block Reason, Last Evaluated At
- Filters: `flow_type`, `closure_eligible`
- Search: TO number
- Actions: Bulk recalculate checklists

**Detail View**:
- Read-only: TO (link), Flow Type
- Prerequisite flags (checkboxes — read-only):
  - [✓] POD Uploaded
  - [✓] Scale-Out Done
  - [✓] Gate-Out Done
  - [✓] Loading Complete (if FG outbound)
  - [✓] Unloading Complete (if FG/RM inbound)
  - [✓] QC Passed (if RM — reads latest QCDecision)
- Closure Status: Eligible (Yes/No), Block Reason (text)
- Custom admin action: **"Refresh Checklist"** (recalculate flags)
- Custom admin action: **"Close TO"** (guard validation) / **"Force Close TO"** (override)

### 2.8 Sub-Tasks (POD-01-1 through POD-01-10)

| Sub-Task | Scope |
|----------|-------|
| POD-01-1 | `ClosureChecklist` model + migration |
| POD-01-2 | `ClosureRuleEngine` service — closure matrices per flow lane |
| POD-01-3 | `refresh_closure_checklist()` function — recompute flags from yard events |
| POD-01-4 | Auto-close trigger hook — evaluate on any prerequisite fulfilled |
| POD-01-5 | FG outbound closure matrix implementation |
| POD-01-6 | FG inbound closure matrix implementation |
| POD-01-7 | RM inbound closure matrix implementation (reads latest QCDecision) |
| POD-01-8 | Exceptions list view (Django Admin filtered changelist) |
| POD-01-9 | Manual close + force close admin actions with guard validation |
| POD-01-10 | Closure API endpoints (POST close, GET closure-status, GET closure-exceptions) |

---

## 3. QC-01: Raw Material QC Checkpoint

### 3.1 Overview

**Sprint 4 scope**: QC for RM inbound TOs — sample creation, pass/fail decision, resample during unloading, override-to-failed during unloading. Detailed physical/lab workflows (§6.15 full QC) are **Phase 2**.

**Entry condition**: QC is available only after Command Center (CC-01) flags the RM TO for QC.

**Flow**: CC-01 flags TO for QC → QC Supervisor creates sample → QC Supervisor makes pass/fail decision → If pass, QC Supervisor assigns unloading point directly → If fail, unloading blocked.

**Resample (AC-4)**: While unloading in progress, QC Supervisor can trigger resample → clears decision, cancels active CC-01 unloading assignment, TO returns to QC queue.

**Override to Failed (AC-5)**: While unloading in progress, QC Supervisor can change decision to Fail → cancels unloading assignment, blocks re-assignment.

### 3.2 Data Model

#### 3.2.1 QCSample

```python
QCSample {
    id: UUID
    transport_order: FK → TransportOrder     # Multiple samples possible (resample creates new record)
    
    # Sample identification
    sample_id: string (auto-generated)       # e.g., "QCS-2026-0001" — auto-gen unique ID
    
    # Sample data
    physical_analysis: text                  # Physical analysis input by QC Supervisor
    remarks: text (nullable)                 # Additional notes
    
    # Timing
    timestamp: DateTime                      # When sample was created
    
    # Actor
    created_by: FK → User (QC Supervisor)
    
    # Metadata
    tenant_id: UUID
    created_at: DateTime
}
```

**Constraints**:
- `sample_id` is auto-generated, unique per tenant
- Multiple `QCSample` records per TO allowed (resample creates a new sample)
- QC decision is blocked until at least one sample exists for the TO

#### 3.2.2 QCDecision

```python
QCDecision {
    id: UUID
    transport_order: FK → TransportOrder     # Multiple decisions possible (resample clears, override creates new)
    
    # Decision
    decision: enum ['pass', 'fail']          # Pass or Fail
    
    # Unloading point assignment (Pass only)
    unloading_point: FK → LoadingUnloadingPoint (nullable)  # QC Supervisor assigns directly on Pass
    
    # Timing
    timestamp: DateTime                      # When decision was made
    
    # Context
    remarks: text (nullable)                 # Required if Fail
    
    # Actor
    decided_by: FK → User (QC Supervisor)
    
    # Metadata
    tenant_id: UUID
    created_at: DateTime
    is_active: boolean (default True)        # False when superseded by resample/override
}
```

**Constraints**:
- Only one `is_active = True` QCDecision per TO at any time
- Closure engine reads the latest active QCDecision: Pass allows closure, Fail blocks

### 3.3 QC Checkpoint Flow

#### 3.3.1 Entry Condition (CC-01 trigger)

```
Command Center Officer flags RM inbound TO for QC (CC-01)
  └─► Backend checks: TO.flow_type = 'rm_inbound'
        └─► TO appears in QC Supervisor's QC Queue
              └─► QC decision is blocked until at least one QCSample exists
```

#### 3.3.2 Sample Creation (AC-2)

```
QC Supervisor opens QC Queue
  └─► List: TO Number, Product, Vehicle, Status
        └─► [row click] ──► QC Checkpoint Form
              ├─► Read-only: TO Summary, Product, Vehicle
              ├─► Input: Physical Analysis (text — required)
              ├─► Input: Remarks (optional)
              └─► [Create Sample]
                    └─► Backend:
                          ├─► Create QCSample:
                          │     ├─► sample_id = auto-generated
                          │     ├─► physical_analysis = form.physical_analysis
                          │     ├─► remarks = form.remarks
                          │     ├─► timestamp = now()
                          │     └─► created_by = current_user
                          │
                          ├─► Write TOStatusTransitionLog:
                          │     └─► to_status = AT_DESTINATION, to_sub_state = SAMPLING_STARTED
                          │
                          └─► Response:
                                ├─► Success: "Sample {sample_id} created. Proceed to QC decision."
                                └─► Decision form now enabled
```

#### 3.3.3 QC Decision (AC-3)

```
QC Supervisor (same form, Decision section — enabled after sample exists)
  └─► Input section:
        ├─► Decision: Pass / Fail (radio buttons)
        ├─► Unloading Point: dropdown (visible only if Pass — QC Supervisor assigns directly)
        ├─► Remarks: text area (required if Fail)
        └─► [Submit Decision]
              └─► Backend:
                    ├─► Validate: at least one QCSample exists for this TO
                    │
                    ├─► Create QCDecision:
                    │     ├─► decision = form.decision (pass/fail)
                    │     ├─► unloading_point = form.unloading_point (if pass)
                    │     ├─► timestamp = now()
                    │     ├─► remarks = form.remarks
                    │     ├─► decided_by = current_user
                    │     └─► is_active = True
                    │
                    ├─► Write TOStatusTransitionLog:
                    │     ├─► If pass: to_sub_state = QC_PASSED
                    │     └─► If fail: to_sub_state = QC_FAILED
                    │
                    ├─► If Pass:
                    │     ├─► QC Supervisor assigns unloading point directly (no handoff to CC)
                    │     ├─► Trigger: evaluate_closure(transport_order)
                    │     └─► Response: "QC passed. Unloading point assigned. Vehicle released."
                    │
                    └─► If Fail:
                          ├─► Unloading blocked — vehicle cannot be assigned unloading point
                          └─► Response: "QC failed. Unloading blocked."
```

#### 3.3.4 Resample During Unloading (AC-4 — NEW)

While unloading is in progress, QC Supervisor can trigger a resample. This is used when QC concerns arise after unloading has begun.

```
QC Supervisor views Active Unloading list (RM TOs currently unloading)
  └─► [Resample] custom admin action on a TO row
        └─► Confirmation: "Trigger resample? This will cancel the active unloading assignment."
              └─► Backend (@transaction.atomic):
                    ├─► Validate: TO is in unloading state (to_sub_state in [UNLOADING_STARTED])
                    │
                    ├─► Deactivate current QCDecision:
                    │     └─► QCDecision.objects.filter(transport_order=TO, is_active=True)
                    │           .update(is_active=False)
                    │
                    ├─► Cancel active CC-01 unloading assignment:
                    │     └─► Cancel/release the BayAssignment for this TO
                    │     └─► CC-01 integration: mark assignment as cancelled with reason='qc_resample'
                    │
                    ├─► Write TOStatusTransitionLog:
                    │     └─► to_status = AT_DESTINATION, to_sub_state = QC_STARTED
                    │         payload = {reason: 'resample', cancelled_assignment_id: ...}
                    │
                    ├─► TO returns to QC Queue (status reverts to QC stage)
                    │
                    └─► Response: "Resample triggered. Unloading cancelled. TO returned to QC queue."
```

#### 3.3.5 Override to Failed During Unloading (AC-5 — NEW)

While unloading is in progress, QC Supervisor can change the decision to Fail. This stops unloading and prevents re-assignment.

```
QC Supervisor views Active Unloading list (RM TOs currently unloading)
  └─► [Override to Failed] custom admin action on a TO row
        └─► Input: Remarks (required — reason for override)
              └─► Confirmation: "Override QC to Failed? This will cancel unloading and block re-assignment."
                    └─► Backend (@transaction.atomic):
                          ├─► Validate: TO is in unloading state (to_sub_state in [UNLOADING_STARTED])
                          │
                          ├─► Deactivate current QCDecision:
                          │     └─► QCDecision.objects.filter(transport_order=TO, is_active=True)
                          │           .update(is_active=False)
                          │
                          ├─► Create new QCDecision:
                          │     ├─► decision = 'fail'
                          │     ├─► remarks = form.remarks
                          │     ├─► decided_by = current_user
                          │     ├─► timestamp = now()
                          │     └─► is_active = True
                          │
                          ├─► Cancel active CC-01 unloading assignment:
                          │     └─► Cancel/release the BayAssignment for this TO
                          │     └─► CC-01 integration: mark assignment as cancelled with reason='qc_override_fail'
                          │
                          ├─► Block re-assignment:
                          │     └─► TO cannot be assigned a new unloading point while latest QCDecision = Fail
                          │
                          ├─► Write TOStatusTransitionLog:
                          │     └─► to_sub_state = QC_FAILED
                          │         payload = {reason: 'override_to_failed', cancelled_assignment_id: ...}
                          │
                          ├─► Closure blocked (ClosureChecklist.qc_passed = False)
                          │
                          └─► Response: "QC overridden to Failed. Unloading cancelled. Re-assignment blocked."
```

### 3.4 QC → Closure Integration

All QC events are written to the TO timeline via TLS-01 (`TOStatusTransitionLog`).

The POD-01 closure gate reads the **latest active `QCDecision`** for the TO:
- `decision = 'pass'` → allows closure
- `decision = 'fail'` → blocks closure
- No active decision → blocks closure (pending)

### 3.5 Django Admin Configuration

**QCSample — List View**:
- Columns: Sample ID, TO Number, Physical Analysis (truncated), Remarks, Timestamp, Created By
- Filters: `timestamp` (date range)
- Search: TO number, Sample ID
- Actions: Bulk export CSV

**QCDecision — List View**:
- Columns: TO Number, Decision (Pass/Fail badge), Unloading Point, Timestamp, Decided By, Active
- Filters: `decision`, `is_active`, `timestamp` (date range)
- Search: TO number
- Status Badge: Green = Pass, Red = Fail

**QCDecision — Detail View**:
- Read-only: TO (link), Decision, Unloading Point (link), Timestamp, Decided By (link), Remarks, Active
- Custom admin action: **"View TO Timeline"** (redirect to TLS-01)

**QC Queue** (custom admin changelist):
- Filter: RM TOs flagged for QC by CC-01, where no active QCDecision exists (or returned to QC by resample)
- Columns: TO Number, Product, Vehicle, QC Flagged At, Sample Count, Status (Awaiting Sample / Awaiting Decision)

**Active Unloading (QC view)** (custom admin changelist):
- Filter: RM TOs currently in unloading state with active QCDecision = Pass
- Columns: TO Number, Product, Vehicle, Unloading Point, Unloading Started At
- Custom actions: **"Resample"** (AC-4), **"Override to Failed"** (AC-5)

### 3.6 Sub-Tasks (QC-01-1 through QC-01-12)

| Sub-Task | Scope |
|----------|-------|
| QC-01-1 | `QCSample` model + migration |
| QC-01-2 | `QCDecision` model + migration |
| QC-01-3 | Auto-generated `sample_id` logic |
| QC-01-4 | Sample creation service (AC-2) |
| QC-01-5 | QC decision service — Pass with unloading point assignment (AC-3) |
| QC-01-6 | QC decision service — Fail with unloading block (AC-3) |
| QC-01-7 | Resample during unloading — clear decision, cancel CC-01 assignment (AC-4) |
| QC-01-8 | Override to Failed during unloading — cancel assignment, block re-assignment (AC-5) |
| QC-01-9 | CC-01 unloading cancellation integration (shared by AC-4 and AC-5) |
| QC-01-10 | All QC events written to TOStatusTransitionLog via TLS-01 |
| QC-01-11 | QC API endpoints (samples, decision, resample, override) |
| QC-01-12 | Django Admin — QCSample, QCDecision, QC Queue, Active Unloading changelistswith resample/override actions |

---

## 4. API Endpoints

### 4.1 TO Timeline & Status (TLS-01)

```http
GET    /api/v1/transport-orders/{to_id}/timeline
       → Fetch full execution timeline (TOStatusTransitionLog entries)
       → Response: {
           to_id,
           flow_type,
           to_status,
           to_sub_state,
           transitions: [
             {
               id,
               from_status: "at_source",
               from_sub_state: "gate_in_source",
               to_status: "at_source",
               to_sub_state: "scale_in_source",
               actor: {user_id, name, role},
               timestamp: "2026-05-12T09:00:00Z",
               payload: {remarks: "Vehicle arrived on time", source_module: "gate"}
             },
             ...
           ]
         }

GET    /api/v1/transport-orders/{to_id}/status
       → Fetch current TO status (role-filtered — returns only fields the caller's role can see)
       → Response: {
           to_id,
           to_status,
           to_sub_state,
           flow_type,
           last_transition_at
         }

POST   /api/v1/transport-orders/{to_id}/transitions
       → Manually trigger a status transition (used by admin / internal services)
       → Body: {
           target_status: "at_source",
           target_sub_state: "gate_in_source",
           payload: {remarks: "..."}
         }
       → Validations: state machine rules, flow lane, permissions
       → Response: {
           transition_id,
           from_status, from_sub_state,
           to_status, to_sub_state,
           timestamp
         }

GET    /api/v1/transport-orders/{to_id}/transitions/validate
       → Dry-run: check if a proposed transition is valid without applying it
       → Query: ?target_status=at_source&target_sub_state=gate_in_source
       → Response: {
           valid: true | false,
           reason: "..." (if invalid)
         }
```

### 4.2 TO Closure (POD-01)

```http
POST   /api/v1/transport-orders/{to_id}/close
       → Close TO (evaluates closure gates first, blocks if prerequisites not met)
       → Body: {
           force: false,                    # If true, override closure rules (requires reason)
           override_reason: "..."           # Required if force = true
         }
       → Response: {
           closed: true | false,
           block_reason: "..." (if not closed)
         }

GET    /api/v1/transport-orders/{to_id}/closure-status
       → Fetch closure checklist status
       → Response: {
           to_id,
           flow_type,
           closure_eligible: false,
           closure_block_reason: "Scale-out not completed",
           prerequisites: {
             pod_uploaded: true,
             scale_out_done: false,
             gate_out_done: false,
             loading_complete: true,
             unloading_complete: null,       # null = not applicable for this flow
             qc_passed: null
           },
           last_evaluated_at: "2026-05-12T15:00:00Z"
         }

GET    /api/v1/transport-orders/closure-exceptions
       → List TOs blocked from closing
       → Filters: ?flow_type=rm_inbound&poi_id=...
       → Response: [
           {
             to_id, to_number, flow_type,
             closure_block_reason: "QC not passed",
             last_evaluated_at: "2026-05-12T15:00:00Z"
           },
           ...
         ]
```

### 4.3 POD Submission (already covered in DM-01)

```http
POST   /api/v1/driver/transport-orders/{to_id}/pod/
       → Driver submits POD
       → Side effects: Sets pod_uploaded = True on ClosureChecklist, triggers auto-close evaluation
```

### 4.4 QC Checkpoint (QC-01)

```http
POST   /api/v1/transport-orders/{to_id}/qc/samples
       → Create QC sample
       → Body: {
           physical_analysis: "Color: amber, Odor: neutral, Texture: fine powder",
           remarks: "3 samples collected from top, middle, bottom" (optional)
         }
       → Validations:
           - TO must be flagged for QC by CC-01
           - TO.flow_type = 'rm_inbound'
       → Response: {
           sample_id: "QCS-2026-0001",
           message: "Sample created. QC decision now available."
         }

GET    /api/v1/transport-orders/{to_id}/qc/samples
       → List all QC samples for a TO
       → Response: [
           {
             sample_id: "QCS-2026-0001",
             physical_analysis: "...",
             remarks: "...",
             timestamp: "2026-05-12T14:00:00Z",
             created_by: {user_id, name}
           },
           ...
         ]

POST   /api/v1/transport-orders/{to_id}/qc/decision
       → Submit QC decision (pass/fail)
       → Body: {
           decision: "pass" | "fail",
           unloading_point_id: UUID (required if pass — QC Supervisor assigns directly),
           remarks: "All samples meet quality standards" (required if fail)
         }
       → Validations:
           - At least one QCSample must exist for this TO
           - No active QCDecision already exists (unless previous was deactivated by resample)
       → Side effects:
           - Write TOStatusTransitionLog (QC_PASSED or QC_FAILED)
           - If pass: assign unloading point, trigger closure evaluation
           - If fail: block unloading assignment
       → Response: {
           decision_id,
           message: "QC passed. Unloading point assigned." | "QC failed. Unloading blocked."
         }

GET    /api/v1/transport-orders/{to_id}/qc/decision
       → Get latest active QC decision for a TO
       → Response: {
           decision_id,
           decision: "pass" | "fail",
           unloading_point: {id, name} | null,
           timestamp,
           decided_by: {user_id, name},
           remarks,
           is_active: true
         }

POST   /api/v1/transport-orders/{to_id}/qc/resample
       → Trigger resample during unloading (AC-4)
       → Validations:
           - TO must be in unloading state
           - Active QCDecision must exist with decision = 'pass'
       → Side effects:
           - Deactivate current QCDecision
           - Cancel active CC-01 unloading assignment
           - TO returns to QC queue (status reverts to AT_DESTINATION / QC_STARTED)
           - Write TOStatusTransitionLog
       → Response: {
           message: "Resample triggered. Unloading cancelled. TO returned to QC queue."
         }

POST   /api/v1/transport-orders/{to_id}/qc/override
       → Override QC decision to Failed during unloading (AC-5)
       → Body: {
           remarks: "Quality degradation observed during unloading" (required)
         }
       → Validations:
           - TO must be in unloading state
           - Active QCDecision must exist with decision = 'pass'
       → Side effects:
           - Deactivate current QCDecision
           - Create new QCDecision with decision = 'fail', is_active = True
           - Cancel active CC-01 unloading assignment
           - Block re-assignment
           - Write TOStatusTransitionLog (QC_FAILED)
           - Closure blocked
       → Response: {
           message: "QC overridden to Failed. Unloading cancelled. Re-assignment blocked."
         }
```

---

## 5. Business Rules

### 5.1 TO Lifecycle Rules

**Status/sub-state transitions**:
- Transitions must follow flow-lane rules table (forward-only, no skipping)
- Upstream module events advance status via `event_ingest.ingest_event()` → `state_machine.apply_transition()`
- Backward transitions not allowed (except admin cancel, QC resample/override)
- `TOStatusTransitionLog` records every transition with actor, timestamp, payload

**Fleet availability validation** (§6.8.1.7):
- On first driver execution action, validate:
  - Vehicle not under maintenance
  - Driver not on leave

**Halted sub-state** (§6.8.6):
- Reserved in `TOSubState` enum but no trigger in Sprint 4 (Phase 2)

### 5.2 Closure Rules

**FG Outbound closure gates**:
- Loading complete ✓
- Scale-out done ✓
- Gate-out done ✓
- POD uploaded ✓

**FG Inbound closure gates**:
- Unloading complete ✓
- Scale-out done ✓
- Gate-out done ✓
- POD uploaded ✓

**RM Inbound closure gates**:
- Unloading complete ✓
- Sampling done ✓
- QC passed ✓ (latest active QCDecision must be Pass)
- Scale-out done ✓
- Gate-out done ✓
- POD uploaded ✓

**Auto-close trigger**:
- Evaluated when **any** prerequisite is fulfilled (POD, QC decision, gate-out, loading/unloading complete, scale-out)
- If all gates pass → auto-close TO
- If gates blocked → update `ClosureChecklist.closure_block_reason`

**Manual close**:
- Guard validation enforces all prerequisites
- Force close requires override reason (audit logged)

### 5.3 QC Checkpoint Rules

**Entry condition**:
- QC available only after CC-01 flags RM TO for QC
- QC not created for FG TOs

**Sampling (AC-2)**:
- Cannot submit QC decision without at least one QCSample
- Sample has auto-generated `sample_id`, physical analysis text, remarks

**Decision (AC-3)**:
- Pass: QC Supervisor assigns unloading point directly (no handoff to CC-01)
- Fail: unloading blocked, closure blocked

**Resample during unloading (AC-4)**:
- QC Supervisor triggers resample while unloading in progress
- Clears (deactivates) current QCDecision
- Cancels active CC-01 unloading assignment
- TO returns to QC queue

**Override to Failed during unloading (AC-5)**:
- QC Supervisor changes decision to Fail while unloading in progress
- Cancels active CC-01 unloading assignment
- Blocks re-assignment (no new unloading point can be assigned)
- Closure blocked

---

## 6. Integration Points

### 6.1 Event Ingest — All Sprint 4 Yard Modules

Every yard action is received by the **event ingest service** and translated into a state machine transition:

| Source | Event | Writes to TOStatusTransitionLog |
|--------|-------|---------------------------------|
| GT-01 (Gate) | gate_in / gate_out | Gate-in Recorded / Gate-out sub-state |
| SC-01 (Scaling) | scale_in / scale_out | Scale-in / Scale-out sub-state |
| CC-01 (Command Center) | bay_assigned / qc_flagged | Assigned to Loading/Unloading Point / QC Started |
| LD-01 (Loading/Unloading) | loading_started / loading_completed / unloading_started / unloading_completed | Loading/Unloading Started/Completed sub-state |
| QC-01 (Quality) | sample_created / qc_decision / resample / override | Sampling Started / QC Passed/Failed |
| DM-01 (Driver Mobile) | execution_started / pod_submitted | Vehicle Departed / POD Submitted |

### 6.2 With Driver Supervisor (DS-01, DS-02)

**Fleet availability validation (§6.8.1.7)**:
- `apps/transport/lifecycle/execution_guards.py:validate_fleet_availability()`
- Called by: Driver mobile "Mark as Started" (DM-01), first gate-in (GT-01)
- Checks: Vehicle not under maintenance, Driver not on leave

### 6.3 With Command Center (CC-01)

**QC flag trigger**:
- CC-01 flags RM inbound TO for QC → TO appears in QC Queue

**CC-01 unloading cancellation** (used by QC-01 AC-4 and AC-5):
- Resample and Override-to-Failed both cancel the active CC-01 unloading assignment
- CC-01 service exposes `cancel_unloading_assignment(transport_order, reason)` for QC-01 integration

### 6.4 With Closure Engine (POD-01)

**QC → Closure**:
- Closure engine reads latest active `QCDecision` for RM TOs
- Pass → allows closure; Fail → blocks closure; No decision → blocks closure

---

## 7. Permissions & RBAC

### 7.1 Permission Codes (add to `apps/core/constants_rbac.py`)

```python
# Timeline (TLS-01)
Transport.TO.Timeline.Read
Transport.TO.Status.Read
Transport.TO.Transitions.Write              # Manual transition trigger

# Closure (POD-01)
Transport.TO.Close                          # Manual close (guard validation)
Transport.TO.ForceClose                     # Force close (override)
Transport.POD.Read
Transport.POD.Submit                        # Driver (covered in DM-01)

# QC Checkpoint (QC-01)
Quality.QC.Sample.Create                    # QC Supervisor
Quality.QC.Decision.Write                   # QC Supervisor
Quality.QC.Resample                         # QC Supervisor (AC-4)
Quality.QC.Override                         # QC Supervisor (AC-5)
Quality.QC.Read                             # All stakeholders
```

### 7.2 Role → Permission Mapping

**Transport Planner / TDO**:
- `Transport.TO.Timeline.Read`
- `Transport.TO.Status.Read`
- `Transport.TO.Close` (manual close with guard)
- `Transport.POD.Read`

**Tenant Admin**:
- All Transport Planner permissions
- `Transport.TO.ForceClose` (override)
- `Transport.TO.Transitions.Write`

**Driver**:
- `Transport.TO.Status.Read` (own TOs only)
- `Transport.POD.Submit` (covered in DM-01)

**Command Center Officer**:
- `Transport.TO.Timeline.Read`
- `Transport.TO.Status.Read`

**QC Supervisor**:
- `Quality.QC.Sample.Create`
- `Quality.QC.Decision.Write`
- `Quality.QC.Resample`
- `Quality.QC.Override`
- `Quality.QC.Read`
- `Transport.TO.Timeline.Read`

---

## 8. Reports & KPIs (Phase 2)

### 8.1 TO Execution Metrics

- Average cycle time (Draft → Closed) per flow type
- Bottleneck analysis (longest stage by TOStatus)
- On-time delivery rate (closed_at <= planned_delivery_datetime)

### 8.2 QC Performance

- QC pass rate (% of RM TOs that passed QC)
- Resample rate (% of RM TOs that required resample)
- Average QC turnaround time (QC flagged → QC decision)
- Top rejection reasons (from QCDecision.remarks where decision = fail)

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
| **TLS-01** (TLS-01-1 to TLS-01-10) | TO lifecycle — `TOStatus` + `TOSubState` state chain (PRD §6.8.5), code-first state machine, event ingest, audit trail | `TOStatusTransitionLog` model + state machine service + event ingest service + fleet availability validation + timeline/status API + admin UI |
| **POD-01** (POD-01-1 to POD-01-10) | TO closure — lane-aware closure rule engine, auto-close trigger, exceptions list, manual close guard | `ClosureChecklist` model + `ClosureRuleEngine` service + closure matrices + auto-close hook + exceptions list view + manual/force close admin actions + closure API |
| **QC-01** (QC-01-1 to QC-01-12) | Raw-material QC — sample creation, pass/fail decision, resample during unloading, override-to-failed | `QCSample` + `QCDecision` models + sample/decision services + resample (AC-4) + override (AC-5) + CC-01 unloading cancellation integration + QC events to timeline + admin UI + API endpoints |

---

**Last Updated**: 2026-05-12  
**Version**: 2.0  
**Related Modules**: All Sprint 4 modules ([gate-operations-sprint4.md](../06-poi-operations/gate-operations-sprint4.md), [scaling-operations-sprint4.md](../06-poi-operations/scaling-operations-sprint4.md), [command-center-loading-sprint4.md](../06-poi-operations/command-center-loading-sprint4.md), [driver-interface-sprint4.md](../03-users/driver-interface-sprint4.md), [driver-supervisor-operations.md](../08-fleet-management/driver-supervisor-operations.md))
