---
module: 05-transport
specification: Transport Lifecycle, POD & QC Integration (Sprint 4)
version: 3.2
phase: Phase 1
sprint: Sprint 4 (Sprint 5 — FB-004 pre-execution handoff)
last_updated: 2026-06-02
changelog: "v3.2 — FB-004: document TDO → ready_for_dispatch → DS-01 dispatched → driver Trip Start; gate-in requires in-transit only. v3.1 — POD-01: Transport Planner triggers closed status after verifying TO details; prerequisite refresh on yard/POD events (no system auto-close). v3.0 — align with YARD-01 + POI yard ops: single TransportOrder.status + denormalized sub_state; yard-module TLS integration matrix; QC defers to qc-operations-sprint4.md; closure reads yard records"
related_stories: DFS-059 (TLS-01), DFS-060 (POD-01), DFS-064 (QC-01), DFS-065 (YARD-01)
jira_epic: DFS-075
---

# Transport Lifecycle, POD & QC Integration (Sprint 4)

## Overview

This specification covers three interconnected capabilities for Transport Order execution:

1. **TLS-01 — TO Lifecycle & Timeline**: Canonical `TransportOrder.status`, yard `sub_state`, transition log, driver state machine
2. **POD-01 — TO Closure & POD Linkage**: Lane-aware closure rule engine, **Transport Planner–triggered close** after TO verification, exceptions list, force-close guard
3. **QC-01 — TLS/POD integration only**: How RM inbound QC events write to the timeline and feed closure gates (full QC spec is separate)

**Architecture (Sprint 4 authoritative):**

- **Canonical status** lives on `TransportOrder.status` (`TOStatus` in `apps/transport/constants.py`). There is no separate `to_status` column.
- **Yard workflow step** lives on `TransportOrder.sub_state` (`TOSubState`). Yard operator admins filter on this field (YARD-01). There is no separate `to_sub_state` column.
- **Lane key** is `TransportOrder.flow_lane` (`fg_outbound` | `fg_inbound` | `rm_inbound`), not `flow_type`.
- Yard modules write TLS events **directly** via `timeline_service` helpers — there is no central `event_ingest.py` facade.

The closure engine evaluates flow-specific gates before any close attempt. **`closed` is set only when a Transport Planner (TP) explicitly triggers closure** after reviewing the TO timeline, closure checklist, POD, and lane-specific yard/QC records. RM inbound QC is triggered by Command Center (CC-01); QC Pass unblocks CC unloading assignment and is a prerequisite TP must verify before closing.

**Module paths**:

- `apps/transport/lifecycle/` — timeline + canonical status transitions + driver rules
- `apps/transport/closure/` — closure rule engine (POD-01)
- `apps/transport/pod/` — POD model + capture (DM-01)
- QC models/services/admin: `apps/quality/checkpoint/` — see [qc-operations-sprint4.md](../06-poi-operations/qc-operations-sprint4.md)

**Dependencies**:

| Prerequisite | Spec |
|--------------|------|
| **YARD-01** (foundation) | [yard-foundation-implementation.md](../06-poi-operations/yard-foundation-implementation.md), [docs/poi-scoped-operational-roles.md](../../../docs/poi-scoped-operational-roles.md) |
| Yard operations | GT-01, SC-01, CC-01, LD-01 |
| Fleet / driver | DS-01, DS-02, DM-01 |

**Enables**: End-to-end TO execution visibility, closure triggers, KPI tracking

**Related yard specs** (authoritative for operator UI and POI scoping):

- [gate-operations-sprint4.md](../06-poi-operations/gate-operations-sprint4.md) — §4.5 yard chain table
- [scaling-operations-sprint4.md](../06-poi-operations/scaling-operations-sprint4.md)
- [command-center-loading-sprint4.md](../06-poi-operations/command-center-loading-sprint4.md)
- [qc-operations-sprint4.md](../06-poi-operations/qc-operations-sprint4.md)

---

## 0. Menu Structure & Navigation

```
Sidebar (Transport Planner / TDO)
└── Logistics / Transport
      └── Transport Orders
            └── TO Detail (existing)
                  ├── Timeline Tab (TLS-01)       — execution timeline from TOStatusTransitionLog
                  ├── Closure Checklist (POD-01)  — lane-aware prerequisites; TP verifies then triggers close
                  └── POD Section (POD-01)        — POD preview (DM-01 ProofOfDelivery)

Sidebar (qc_inspector_physical — QC Inspector – Physical)
└── Quality
      └── QC Checkpoint (QC-01)
            ├── My Queue / Samples / Decisions
            └── Resample + Override actions (during unloading)
            (Full menu spec: qc-operations-sprint4.md §0–1)
```

Transport Planner / TDO views are **tenant-wide** (not POI-scoped). Yard operator menus are POI-scoped via YARD-01 (`YardAdminBase`).

---

## 1. TLS-01: TO Lifecycle & Timeline

### 1.1 Status model — canonical status + yard sub-state

Sprint 4 execution tracking uses **two fields on one aggregate**, not a PRD §6.8.5 paired enum on separate columns:

| Field | Purpose | Written by |
|-------|---------|------------|
| `TransportOrder.status` | Coarse lifecycle (`TOStatus`) | Driver (in-transit only), gate (gate-in status bump), scale-out, dispatch, closure, admin |
| `TransportOrder.sub_state` | Yard workflow step (`TOSubState`) | Gate (gate-out markers), scale, CC, LD, QC services |

**Alias**: `TransportOrder.tls_status` property returns `status` for API compatibility.

**Sprint 3 planning statuses** (unchanged keys on the same `status` column):

`created` → `assigned` → `ready_for_dispatch` → `dispatched` → … → `completed` / `closed` / `cancelled` / `under_planning`

**Pre-execution handoff (FB-004 — cross-story; validate via [E2E-01](../../03-backlog/sprints/sprint-5/11-e2e-cross-story/E2E-01-to-state-sequence.md)):**

| Status | Set by | Module |
|--------|--------|--------|
| `assigned` | TDO links vehicle/driver (and helpers/ETA for own fleet) | `apps/transport/services.py` |
| `ready_for_dispatch` | TDO completes assignment | Same — **not** DS-01 |
| `dispatched` | Driver Supervisor inspection complete or skip | `apps/fleet_supervisor/services.py` (`dispatch_to_after_ready`) |
| `in_transit_source` / `in_transit_destination` | Driver **Trip Start** (lane from `FIRST_DRIVER_TRANSITION`) | `apps/transport/driver_transition_service.py` + `state_machine.py` |

Gate-in (GT-01) requires **in-transit** status per lane — not `ready_for_dispatch` or `dispatched`.

**Sprint 4 execution statuses** (append to `TOStatus` in `apps/transport/constants.py`):

```python
class TOStatus(models.TextChoices):
    # Sprint 3 planning
    CREATED              = "created",              "Created"
    ASSIGNED             = "assigned",             "Assigned"
    READY_FOR_DISPATCH   = "ready_for_dispatch",   "Ready for Dispatch"
    DISPATCHED           = "dispatched",           "Dispatched"
    UNDER_PLANNING       = "under_planning",       "Under Planning"
    CANCELLED            = "cancelled",            "Cancelled"
    # Sprint 4 execution
    IN_TRANSIT_SOURCE    = "in_transit_source",    "In Transit – Source"
    AT_SOURCE            = "at_source",            "At Source"
    LOADED_PICKUP_COMPLETED = "loaded_pickup_completed", "Loaded / Pickup Completed"
    IN_TRANSIT_DESTINATION  = "in_transit_destination",  "In Transit – Destination"
    AT_DESTINATION       = "at_destination",       "At Destination"
    DELIVERED_UNLOADED   = "delivered_unloaded",   "Delivered / Unloaded"
    COMPLETED            = "completed",            "Completed"
    CLOSED               = "closed",               "Closed"
    IN_PROGRESS          = "in_progress",          "In Progress"  # legacy alias
```

**Yard sub-states** (`TransportOrder.sub_state` — `TOSubState` in `apps/transport/constants.py`):

```python
class TOSubState(models.TextChoices):
    # Leg-specific scale/gate (prefer for new writes)
    SCALE_IN_SOURCE          = "scale_in_source"
    SCALE_IN_DEST            = "scale_in_dest"
    SCALE_OUT_SOURCE         = "scale_out_source"
    SCALE_OUT_DEST           = "scale_out_dest"
    GATE_OUT_SOURCE          = "gate_out_source"
    GATE_OUT_DESTINATION     = "gate_out_destination"
    # CC / QC / LD workflow (POI admin query fields)
    WAITING_CC               = "waiting_cc"
    FLAGGED_FOR_QC           = "flagged_for_qc"
    ASSIGNED_LOADING_POINT   = "assigned_loading_point"
    ASSIGNED_UNLOADING_POINT = "assigned_unloading_point"
    SAMPLING_STARTED         = "sampling_started"
    QC_PASSED                = "qc_passed"
    QC_FAILED                = "qc_failed"
    RESAMPLING               = "resampling"
    LOADING_STARTED          = "loading_started"
    LOADING_COMPLETED        = "loading_completed"
    UNLOADING_STARTED        = "unloading_started"
    UNLOADING_COMPLETED      = "unloading_completed"
    SCALE_IN                 = "scale_in"  # legacy — do not use for new yard writes
```

> **Phase 2 (not Sprint 4):** PRD §6.8.5 planning/dispatch sub-states (`fleet_decided`, `vdh_assigned`, `halted_source`, `lab_analysis`, etc.) are **not** persisted on `TransportOrder.sub_state` in Sprint 4.

**Reset rule:** When canonical `status` advances into `SUB_STATE_RESET_ON_STATUS`, `sub_state` is cleared to `""`:

```python
SUB_STATE_RESET_ON_STATUS = frozenset({
    "in_transit_destination",
    "delivered_unloaded",
    "completed",
    "closed",
    "cancelled",
})
```

Call `maybe_clear_sub_state_on_status(to, new_status=...)` after every canonical status bump that may cross this boundary.

### 1.2 Per-lane execution chain (canonical status)

Authoritative yard progression is in [gate-operations-sprint4.md §4.5](../06-poi-operations/gate-operations-sprint4.md). Summary:

| Step | FG outbound | FG inbound | RM inbound |
|------|------------|-----------|-----------|
| Pre-gate-in (driver) | `in_transit_source` | `in_transit_destination` | `in_transit_destination` |
| Gate-in (GT-01) | → `at_source` (source leg) or → `at_destination` (dest leg) | → `at_destination` | → `at_destination` |
| Scale-in (SC-01) | `sub_state`: leg scale-in → `waiting_cc` | same | same |
| CC queue / QC flag | `sub_state`: bay assign or `flagged_for_qc` | bay assign | CC flags QC; QC sample/decision |
| QC Pass (RM only) | — | — | `sub_state`: `qc_passed`; CC assigns unload bay |
| Load / unload (LD-01) | load sub-states | unload sub-states | unload sub-states |
| Scale-out (SC-01) | → `in_transit_destination` | → `delivered_unloaded` | → `delivered_unloaded` |
| Gate-out (GT-01) | `sub_state`: `gate_out_source` or `gate_out_destination` | same | same |
| Driver POD (DM-01) | → `completed` (when business rules met) | same | same |
| Closure (POD-01) | → `closed` (**TP triggers** after verification) | same | same (RM: TP verifies QC Pass) |

**GT-02 on-demand:** Dealer DO → `at_source`; Supplier PO → `at_destination` in the same transaction as gate-in (skips driver in-transit steps).

**Important:** Most yard steps change **`sub_state` only** while `status` stays at `at_source` / `at_destination`. Canonical `status` advances on gate-in, scale-out, driver milestones, POD, and closure — not on every bay assign or load start.

### 1.3 Data model

#### 1.3.1 TransportOrder (Sprint 4 fields)

```python
TransportOrder {
    # ... Sprint 3 fields ...

    status: TOStatus                    # Canonical lifecycle (NOT to_status)
    sub_state: CharField(max_length=40) # Yard step; default ""; db_index (YARD-01)

    flow_lane: FlowLane                 # fg_outbound | fg_inbound | rm_inbound
    source: TOSource                    # PLANNER | GATE
    transfer_type: TOTransferType       # GT-02 only; nullable

    requires_qc: boolean                # RM inbound flag
    qc_passed: boolean (null=True)      # Denormalized QC outcome; QC Pass sets True

    # Denormalized timestamps (optional — canonical audit in TOStatusTransitionLog)
    execution_started_at, gate_in_source_at, loading_done_at, ...
}
```

#### 1.3.2 TOStatusTransitionLog

Immutable audit trail. **Implemented schema** (`apps/transport/models.py`):

```python
TOStatusTransitionLog {
    id: UUID
    transport_order: FK → TransportOrder

    from_status: CharField              # Previous status (blank on first entry)
    to_status: CharField                 # New status after this log row
    sub_state: CharField (blank=True)    # Set when yard step changes WITHOUT status change

    actor: FK → User (nullable)
    actor_role: CharField
    source_module: CharField             # gate | scaling | command_center | loading | quality | transport | closure | driver
    notes: TextField

    created_at: DateTime                 # System timestamp (ordering key)
}
```

**Log patterns:**

| Event type | `from_status` / `to_status` | `sub_state` |
|------------|----------------------------|-------------|
| Canonical status change | `old` → `new` | blank (or cleared on TO separately) |
| Yard step only | `current` → `current` | new sub-state value |

There is **no** `payload` JSON, `from_sub_state`, or `to_sub_state` pair on the log model. Context (POI, visit, weight) goes in `notes` or module-specific audit tables (`GateActivityLog`, etc.).

#### 1.3.3 ClosureChecklist (POD-01 — planned)

```python
ClosureChecklist {
    transport_order: OneToOne → TransportOrder
    flow_lane: FlowLane                 # Denormalized from TO

    pod_uploaded: boolean
    scale_out_done: boolean
    gate_out_done: boolean
    loading_complete: boolean            # FG outbound
    unloading_complete: boolean          # FG/RM inbound
    sampling_done: boolean                # RM inbound — ≥1 QCSample
    qc_passed: boolean (nullable)        # RM inbound — active QCDecision pass

    closure_eligible: boolean
    closure_block_reason: text (nullable)
    last_evaluated_at: DateTime
}
```

### 1.4 Timeline services (`apps/transport/lifecycle/timeline_service.py`)

All yard and lifecycle modules **must** use these helpers — do not write `TOStatusTransitionLog` or `sub_state` ad hoc.

```python
def record_transition(to, *, from_status, to_status, actor, source_module, notes=""):
    """Append log row for a canonical status change."""

def record_yard_sub_state(to, *, sub_state, actor, source_module, notes=""):
    """
    Atomically: set TransportOrder.sub_state + append log row
    (from_status == to_status == to.status).
    Does NOT advance canonical status.
    """

def maybe_clear_sub_state_on_status(to, *, new_status):
    """Clear sub_state when new_status ∈ SUB_STATE_RESET_ON_STATUS."""

def timeline_for_to(to) -> list[dict]:
    """Read model for timeline API / admin."""
```

**Canonical status helper** (`apps/transport/lifecycle/transition_service.py`):

```python
@transaction.atomic
def apply_to_status_transition(to, target_status, *, actor, source_module, notes=""):
    """
    Set TransportOrder.status, append TOStatusTransitionLog via record_transition().
    Caller must call maybe_clear_sub_state_on_status() when target ∈ SUB_STATE_RESET_ON_STATUS.
    """
```

### 1.5 Driver state machine (`apps/transport/lifecycle/state_machine.py`)

Drivers may **only** set in-transit statuses from `Dispatched`:

| `flow_lane` | Allowed transition |
|-------------|-------------------|
| `fg_outbound` | `dispatched` → `in_transit_source` |
| `fg_inbound`, `rm_inbound` | `dispatched` → `in_transit_destination` |

All other execution statuses are written by yard services or lifecycle/closure. Forward-only table: `TO_STATUS_TRANSITIONS` in `apps/transport/constants.py`.

Fleet availability (§6.8.1.7): validate vehicle not under maintenance and driver not on leave on first driver execution action (DM-01) and optionally at gate-in (GT-01).

### 1.6 Yard-module TLS integration matrix

Yard modules call timeline helpers **in the same `atomic()` block** as their domain writes. There is no `event_ingest.py`.

| Module | Service action | `status` change | `sub_state` change | `source_module` |
|--------|----------------|-----------------|-------------------|-----------------|
| **GT-01** gate-in | `record_gate_in_status` | → `at_source` / `at_destination` per lane | — | `gate` |
| **GT-01** gate-out | `record_gate_out_status` | — | `gate_out_source` or `gate_out_destination` | `gate` |
| **SC-01** scale-in | `ScaleInService.record_scale_in` | — | leg `scale_in_*` → `waiting_cc` | `scaling` |
| **SC-01** scale-out | `ScaleOutService.record_scale_out` | → per `SCALE_OUT_RESULT_TO_STATUS` | leg `scale_out_*`; then clear sub_state | `scaling` |
| **CC-01** flag QC | `CCService.flag_for_qc` | — | `flagged_for_qc` | `command_center` |
| **CC-01** assign bay | `CCService.assign_bay` | — | `assigned_loading_point` or `assigned_unloading_point` | `command_center` |
| **LD-01** load start/complete | `LDService.start/complete_loading` | — | `loading_started` / `loading_completed` | `loading` |
| **LD-01** unload start/complete | `LDService.start/complete_unloading` | — | `unloading_started` / `unloading_completed` | `loading` |
| **QC-01** sample | `QCService.create_sample` | — | `sampling_started` | `quality` |
| **QC-01** decision pass/fail | `QCService.record_decision` | — | `qc_passed` / `qc_failed`; sets `TO.qc_passed` | `quality` |
| **QC-01** resample | `QCService.trigger_resample` | — | `resampling` | `quality` |
| **QC-01** override fail | `QCService.override_to_failed` | — | `qc_failed` | `quality` |
| **DM-01** driver in-transit | driver transition service | → `in_transit_*` | — | `driver` |
| **DM-01** POD | POD submit handler | → `completed` (when rules met) | — | `driver` |
| **POD-01** closure | `close_transport_order` (**TP action**) | → `closed` | clear sub_state | `closure` (actor = TP user) |

**Transactional requirements:**

- SC-01 scale-in must call `CCService.create_queue_entry()` in the **same** `atomic()` as scale-in (see scaling spec).
- QC resample/override must call `CCService.cancel_bay_assignment()` and set `UnloadEvent.cancelled_by_resample=True` (see qc-ops §3.3–3.4).

**Audit context (recommended in `notes` or parallel audit rows):**

- `poi_id`, `gate_visit_session_id`, `yard_leg` — from `GateVisitSession` / `YardContext` when available

### 1.7 YARD-01 foundation (prerequisite)

TLS-01 yard integration assumes YARD-01 foundation is merged before POI operator admins emit events at scale:

| Step | Deliverable | TLS impact |
|------|-------------|------------|
| 1 | `TransportOrder.sub_state` + `TOSubState` | POI querysets filter yard queues |
| 2 | `UserOperationalPOI` | Operator POI assignment |
| 3 | `yard_poi.py` | Session + assignment POI resolution |
| 4 | `GateVisitSession.yard_leg` | Scale/LD leg eligibility |
| 5 | `YardAdminBase` | Fail-closed POI querysets |
| 6 | `YardContext` / policy dict | Service-layer leg×lane rules |

See [yard-foundation-implementation.md](../06-poi-operations/yard-foundation-implementation.md) and [docs/poi-scoped-operational-roles.md](../../../docs/poi-scoped-operational-roles.md).

### 1.8 Django Admin (TLS-01)

**TOStatusTransitionLog — List View**:

- Columns: TO Number, From Status, To Status, Sub-State, Source Module, Actor, Created At
- Filters: `to_status`, `sub_state`, `source_module`, `created_at`, `transport_order__flow_lane`
- Search: TO number

**TransportOrder admin** (existing): `status_badge`, `sub_state_badge` via `admin_badges.py`.

### 1.9 Sub-Tasks (TLS-01)

| Sub-Task | Scope | Status note |
|----------|-------|-------------|
| TLS-01-1 | `TOStatus` + `TOSubState` in `constants.py` | Partial — enums in code |
| TLS-01-2 | `TOStatusTransitionLog` + `sub_state` column on log | Partial |
| TLS-01-3 | `TransportOrder.sub_state` migration (YARD-01 Step 1) | Partial |
| TLS-01-4 | `TO_STATUS_TRANSITIONS` + driver rules in `state_machine.py` | Partial — FB-004: enforce planning chain through `dispatched` and driver-only in-transit from `dispatched` |
| TLS-01-5 | `apply_to_status_transition()` + `record_yard_sub_state()` | Partial |
| TLS-01-6 | Yard integration matrix (§1.6) wired in GT/SC/CC/LD/QC services | In progress |
| TLS-01-7 | Fleet availability validation | Per DM-01 / GT-01 |
| TLS-01-8 | Timeline / status API endpoints | Planned |
| TLS-01-9 | Django Admin for `TOStatusTransitionLog` | Planned |
| TLS-01-10 | `apply_to_status_transition()`; `maybe_clear_sub_state_on_status` on canonical bumps; admin/break-glass POST validates `TO_STATUS_TRANSITIONS` | Partial — FB-004: yard modules must not bypass graph |

---

## 2. POD-01: TO Closure & POD Linkage

### 2.1 ProofOfDelivery

Defined in DM-01 (`ProofOfDelivery` / driver POD API). On submit:

1. Create POD record
2. Advance TO to `completed` when lane rules allow
3. Call `refresh_closure_checklist()` (recompute prerequisite flags only — **does not** transition to `closed`)

**Who closes:** Transport Planner reviews the TO (timeline, checklist, POD, yard/QC domain rows) and **triggers** `closed` via admin action or `POST .../close` when all lane gates pass.

### 2.2 ClosureRuleEngine (`apps/transport/closure/closure_engine.py`)

**Current code (May 2026):** minimal path — auto-close `completed` → `closed` when POD exists (to be replaced). **Target (this spec):** full lane matrices; **TP-triggered close only** (no system auto-close).

Lane-aware evaluation keyed on `transport_order.flow_lane`:

```python
CLOSURE_MATRICES = {
    "fg_outbound": ["loading_complete", "scale_out_done", "gate_out_done", "pod_uploaded"],
    "fg_inbound":  ["unloading_complete", "scale_out_done", "gate_out_done", "pod_uploaded"],
    "rm_inbound":  ["unloading_complete", "sampling_done", "qc_passed", "scale_out_done", "gate_out_done", "pod_uploaded"],
}
```

### 2.3 `refresh_closure_checklist()` — read yard records, not sub_state alone

Prerequisite flags must be derived from **domain rows**, not inferred only from `TransportOrder.sub_state`:

| Flag | Source |
|------|--------|
| `loading_complete` | Active visit leg: `LoadEvent.end_datetime` not null (FG outbound source leg) |
| `unloading_complete` | `UnloadEvent.end_datetime` not null and not `cancelled_by_resample` |
| `scale_out_done` | Destination (or source exit) `WeighingSession.scale_out_completed = True` for active visit |
| `gate_out_done` | `GateOut` exists for active/closed `GateVisitSession` at yard POI |
| `pod_uploaded` | `ProofOfDelivery` exists |
| `sampling_done` | ≥1 `QCSample` in `apps/quality/checkpoint/` for TO |
| `qc_passed` | Active `QCDecision.decision = 'pass'` **and** `TransportOrder.qc_passed = True` |

```python
def evaluate_closure(transport_order) -> tuple[bool, str | None]:
    checklist = get_or_create_closure_checklist(transport_order)
    refresh_closure_checklist(transport_order)  # recomputes flags from table above
    matrix = CLOSURE_MATRICES.get(transport_order.flow_lane)
    ...
```

### 2.4 Closure trigger — Transport Planner

**Responsible role:** **Transport Planner (TP)** — not the driver, yard operators, or TDO.

**TP workflow:**

1. TO reaches `completed` (typically after driver POD and yard execution).
2. TP opens TO detail → **Closure Checklist** tab and **Timeline** tab; reviews POD section, lane matrix flags, and any RM QC outcome.
3. TP confirms operational details match expectations (load/unload timestamps, scale-out, gate-out, POD artifact, QC pass for `rm_inbound`).
4. TP triggers close (`[Close TO]` in admin or `POST /api/v1/transport-orders/{to_id}/close`).
5. System runs `refresh_closure_checklist()` + `evaluate_closure()`; on success → `completed` → `closed` with `source_module=closure` and **actor = TP user**; on failure → 422 with `closure_block_reason` (TO stays `completed`).

**Prerequisite refresh (system, not close):** After closure-relevant yard/POD events, call `refresh_closure_checklist()` only so the checklist UI stays current:

- POD submission (DM-01)
- Gate-out (GT-01)
- Scale-out (SC-01)
- Loading/unloading complete (LD-01)
- QC decision (QC-01)

**Status path to closed:**

```
delivered_unloaded → (driver POD) → completed → (TP verifies all details + triggers close) → closed
```

**Force close** (`Transport.TO.ForceClose`): override when TP (or delegated admin) must close despite a failed gate; requires override reason + audit log.

### 2.5 Admin & API

**ClosureExceptionsAdmin**: changelist where `closure_eligible = False` — TOs awaiting TP review or blocked by unmet prerequisites.

**Close / force close**: `Transport.TO.Close` (TP) / `Transport.TO.ForceClose` (override).

**Closure exceptions API** — `GET /api/v1/transport-orders/closure-exceptions`:

- Filter `flow_lane` (not `flow_type`)
- Optional `poi_id`: TOs with an active or most recent `GateVisitSession.poi_id = poi_id`, or `destination_poi_id` / `origin_poi_id` match for planner context

### 2.6 Sub-Tasks (POD-01)

| Sub-Task | Scope |
|----------|-------|
| POD-01-1 | `ClosureChecklist` model + migration |
| POD-01-2 | `CLOSURE_MATRICES` + `evaluate_closure()` |
| POD-01-3 | `refresh_closure_checklist()` from yard domain rows (§2.3) |
| POD-01-4 | Checklist refresh hook on prerequisite events; **no** system auto-close |
| POD-01-5–7 | Per-lane matrix tests |
| POD-01-8 | Exceptions admin changelist |
| POD-01-9 | Manual + force close admin actions |
| POD-01-10 | Closure API endpoints |

---

## 3. QC-01 — TLS & closure integration (not the full QC spec)

**Canonical QC specification:** [qc-operations-sprint4.md](../06-poi-operations/qc-operations-sprint4.md)

This section covers only how QC connects to TLS-01 and POD-01.

### 3.1 Role & permissions

- **Actor:** `qc_inspector_physical` (QC Inspector – Physical) with `Quality.QCCheckpoint.*` permissions
- There is **no** `qc_supervisor` seed role; Pass/Fail/resample/override use `Quality.QCCheckpoint.Decision.Write` or `gate_supervisor` via `QCAdminBase.supervisor_role_codes`
- QC admin is POI-scoped: `QCAdminBase` → `YardAdminBase`; filters on `destination_poi_id = working POI`

### 3.2 RM inbound flow (TLS-relevant)

```
CC-01 flag_for_qc  →  sub_state = flagged_for_qc
QC sample          →  sub_state = sampling_started
QC Pass            →  sub_state = qc_passed; TO.qc_passed=True; QueueEntry.qc_passed=True
CC assign unload   →  sub_state = assigned_unloading_point
LD unload          →  sub_state = unloading_started / unloading_completed
QC Fail            →  sub_state = qc_failed; blocks CC assign, scale-out, gate-out, closure
Resample           →  sub_state = resampling; supersedes QCDecision; cancels BayAssignment
Override to fail   →  sub_state = qc_failed; mutates pass decision in place
```

QC does **not** assign unloading bays — CC-01 does after Pass.

### 3.3 TLS writes from QC

All QC TLS writes go through `QCService` → `record_yard_sub_state(..., source_module="quality")`. Canonical `status` stays `at_destination` through QC and unloading until scale-out advances it.

| QC action | Sub-state | Other TO fields |
|-----------|-----------|-----------------|
| Sample created | `sampling_started` | — |
| Pass | `qc_passed` | `qc_passed=True`, `QueueEntry.qc_passed=True` |
| Fail | `qc_failed` | `qc_passed=False` |
| Resample | `resampling` | `qc_passed` cleared; `QueueEntry.qc_passed=False` |
| Override fail | `qc_failed` | same as Fail |

### 3.4 Closure integration

RM inbound closure requires:

- `sampling_done` — ≥1 checkpoint `QCSample`
- `qc_passed` — active `QCDecision` with `decision='pass'`

Fail or pending QC blocks closure even if unloading completed.

### 3.5 QC API surface

QC REST endpoints are defined in [qc-operations-sprint4.md §6](../06-poi-operations/qc-operations-sprint4.md) under `/api/v1/qc/*` — not under `/api/v1/transport-orders/{id}/qc/*`. Transport timeline API may **embed** QC decision summary for planner read models.

---

## 4. API Endpoints

### 4.1 TO Timeline & Status (TLS-01)

```http
GET    /api/v1/transport-orders/{to_id}/timeline
       → Response: {
           to_id,
           flow_lane,
           status,              # canonical TOStatus
           sub_state,           # current yard step (may be "")
           transitions: [{
             id,
             from_status,
             to_status,
             sub_state,         # set on yard-only rows
             actor: { user_id, name, role },
             source_module,
             notes,
             created_at
           }]
         }

GET    /api/v1/transport-orders/{to_id}/status
       → Response: { to_id, status, sub_state, flow_lane, last_transition_at }

POST   /api/v1/transport-orders/{to_id}/transitions
       → Body: { target_status, notes }   # admin / internal only; NOT yard sub_state
       → Uses apply_to_status_transition(); requires Transport.TO.Transitions.Write

GET    /api/v1/transport-orders/{to_id}/transitions/validate?target_status=...
       → Dry-run against TO_STATUS_TRANSITIONS + driver rules
```

Planner/TDO endpoints are **not** POI-filtered. Yard modules should not use this POST for routine ops — they call service helpers directly.

### 4.2 TO Closure (POD-01)

```http
POST   /api/v1/transport-orders/{to_id}/close
       → Body: { force: false, override_reason: "..." }
       → **TP only** (Transport.TO.Close); evaluates refresh_closure_checklist() + CLOSURE_MATRICES; transitions to closed on success

GET    /api/v1/transport-orders/{to_id}/closure-status
       → Response: { flow_lane, closure_eligible, closure_block_reason, prerequisites: {...} }

GET    /api/v1/transport-orders/closure-exceptions?flow_lane=&poi_id=
       → Blocked TOs; poi_id filters by visit/POI association (§2.5)
```

### 4.3 POD Submission (DM-01)

```http
POST   /api/v1/driver/transport-orders/{to_id}/pod/
       → Side effects: ProofOfDelivery created; status → completed when eligible;
         refresh_closure_checklist() (TP closes later)
```

---

## 5. Business Rules

### 5.1 Lifecycle

- **Drivers** set in-transit statuses only (`state_machine.validate_driver_transition`).
- **Yard modules** set `sub_state` via `record_yard_sub_state`; advance canonical `status` only where §1.6 matrix specifies.
- **No backward** canonical transitions except admin cancel and QC resample/override side effects on assignments (status stays forward-only).
- Every write appends `TOStatusTransitionLog` via timeline helpers.

### 5.2 Closure

See §2.2–2.4.

- **Transport Planner** is responsible for triggering `closed` after verifying TO timeline, closure checklist, POD, and lane-specific yard/QC records.
- TDO and yard roles may **view** closure status but do **not** trigger close.
- System refreshes checklist flags on prerequisite events; it does **not** auto-close without a TP close action.
- RM inbound cannot close with active `QCDecision.decision = 'fail'` (TP close attempt returns blocking reason).

### 5.3 QC (summary)

See [qc-operations-sprint4.md §7–8](../06-poi-operations/qc-operations-sprint4.md).

---

## 6. Integration Points

### 6.1 YARD-01 & POI-scoped operations

| Concern | Integration |
|---------|-------------|
| POI scoping | Operator UIs only; TLS read APIs tenant-wide for planner roles |
| Visit anchor | `GateVisitSession` links gate → scale → CC → LD → gate-out |
| `yard_leg` | Set at gate-in; SC/LD use `(flow_lane, yard_leg)` eligibility |
| Fail closed | Missing POI assignment → empty yard admin querysets (not TLS) |

### 6.2 Yard modules → TLS

See §1.6 integration matrix. Authoritative per-module specs:

- GT-01: [gate-operations-sprint4.md](../06-poi-operations/gate-operations-sprint4.md)
- SC-01: [scaling-operations-sprint4.md](../06-poi-operations/scaling-operations-sprint4.md)
- CC-01 / LD-01: [command-center-loading-sprint4.md](../06-poi-operations/command-center-loading-sprint4.md)
- QC-01: [qc-operations-sprint4.md](../06-poi-operations/qc-operations-sprint4.md)

### 6.3 Driver Supervisor (DS-01, DS-02) — FB-004

- **TDO** sets `ready_for_dispatch` when assignment is complete.
- **DS-01** dispatch queue lists only `ready_for_dispatch`; inspection/skip → `dispatched` via `dispatch_to_after_ready`.
- **DM-01** Trip Start blocked until `dispatched`; §6.8.1.7 fleet availability runs on first driver transition after `dispatched`.

### 6.4 Command Center ↔ QC

- CC `flag_for_qc` → QC queue visible (`sub_state = flagged_for_qc`)
- QC Pass → `QueueEntry.qc_passed=True` → CC `[Assign Bay]` unblocked
- QC resample/override → `CCService.cancel_bay_assignment()`

---

## 7. Permissions & RBAC

```python
# Timeline (TLS-01)
Transport.TO.Timeline.Read
Transport.TO.Status.Read
Transport.TO.Transitions.Write       # Manual canonical transition (admin)

# Closure (POD-01)
Transport.TO.Close
Transport.TO.ForceClose
Transport.POD.Read
Transport.POD.Submit                   # Driver (DM-01)

# QC Checkpoint — see qc-operations-sprint4.md §10
Quality.QCCheckpoint.Sample.Create
Quality.QCCheckpoint.Decision.Write
Quality.QCCheckpoint.Resample
Quality.QCCheckpoint.Override
Quality.QCCheckpoint.Read
Menu.QC.Checkpoint.View
```

**qc_inspector_physical:** QC checkpoint permissions + optional `Transport.TO.Timeline.Read`.

**command_center_officer:** `Transport.TO.Timeline.Read`, `Quality.QCCheckpoint.Read` (read-only QC status).

**transport_planner:** `Transport.TO.Close`, `Transport.TO.Timeline.Read`, `Transport.POD.Read` — **only role that triggers TO close** after verification (§2.4).

**tdo:** `Transport.TO.Timeline.Read`, `Transport.POD.Read` — read-only; no `Transport.TO.Close`.

---

## 8. Reports & KPIs (Phase 2)

- Cycle time by `flow_lane` and bottleneck `status` / dwell in `sub_state`
- QC pass/resample rates from checkpoint `QCDecision` / `QCSample`
- Closure block reason distribution from `ClosureChecklist`

---

## 9. Dependencies

### Upstream (blocking order)

1. **YARD-01** foundation (Steps 1–6)
2. GT-01, SC-01, CC-01, LD-01 (emit §1.6 events)
3. QC-01 checkpoint app (RM TLS + closure gates)
4. DS-01, DS-02, DM-01 (driver + POD)

### Downstream

Terminal module for Sprint 4 execution — no further modules depend on TLS/POD beyond reporting (Phase 2).

---

## 10. Sprint 4 Story Mapping

| Story | Scope | Implementation focus |
|-------|-------|---------------------|
| **TLS-01** | Lifecycle + timeline | `status` + `sub_state` model; `timeline_service`; driver `state_machine`; §1.6 yard wiring; timeline API + admin |
| **POD-01** | Closure | `ClosureChecklist`; `refresh_closure_checklist` from yard rows; **TP-triggered close**; exceptions admin/API |
| **QC-01** | RM QC | **Implement from** [qc-operations-sprint4.md](../06-poi-operations/qc-operations-sprint4.md); TLS integration per §3 here |

---

**Last Updated**: 2026-05-20  
**Version**: 3.1  
**Related Modules**: [gate-operations-sprint4.md](../06-poi-operations/gate-operations-sprint4.md), [scaling-operations-sprint4.md](../06-poi-operations/scaling-operations-sprint4.md), [command-center-loading-sprint4.md](../06-poi-operations/command-center-loading-sprint4.md), [qc-operations-sprint4.md](../06-poi-operations/qc-operations-sprint4.md), [yard-foundation-implementation.md](../06-poi-operations/yard-foundation-implementation.md), [driver-interface-sprint4.md](../03-users/driver-interface-sprint4.md), [driver-supervisor-operations.md](../08-fleet-management/driver-supervisor-operations.md)
