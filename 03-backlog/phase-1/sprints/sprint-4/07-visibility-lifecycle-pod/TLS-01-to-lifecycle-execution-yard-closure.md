---
jira_key: DFS-059
jira_type: Story
jira_epic: ~
jira_sprint: "Sprint 4"
story_id: TLS-01
title: TO Lifecycle — Execution, Yard Step & Timeline Audit
epic: Lifecycle
status: In Progress
story_points: 13
assignee: ~
prd_refs:
  - "§6.8.5 TO Lifecycle Management (Phase 1)"
  - "§6.8.7 Trip Closure & Proof of Delivery (POD) (Phase 1 — closure hooks only; rules in POD-01)"
  - "§6.15.4.1 QC Pass/Fail/Auto-Pass Tracking (Phase 1 — RM sub_state + qc_passed flag)"
implementation_spec: "../../../05-modules/05-transport/transport-lifecycle-pod-sprint4.md"
---

# TLS-01 — TO Lifecycle (§6.8.5) — Execution, Yard Step & Timeline

## User Story

**As** Transport operations staff  
**I want** a single, rule-driven **TO** status model with full history  
**So that** gate, scale, command center, driver, and closure handoffs stay consistent **without a separate Trip record**

## Business Context

Sprint 4 extends **§6.8.5** on the **Transport Order only** using two persisted fields:

| Field | Purpose |
|-------|---------|
| `TransportOrder.status` | Canonical lifecycle (`TOStatus`) — planning + execution + closure |
| `TransportOrder.sub_state` | Current **yard workflow step** (`TOSubState`, YARD-01) — queryable by POI operator screens |

There is **no** separate `to_status` / `to_sub_state` column pair. PRD labels (Draft, Planned, …) map to **`status`** keys; yard steps (scale-in, waiting for CC, QC passed, loading, …) map to **`sub_state`**.

**Authoritative implementation spec:** [transport-lifecycle-pod-sprint4.md v3.0](../../../../05-modules/05-transport/transport-lifecycle-pod-sprint4.md)  
**Yard chain reference:** [gate-operations-sprint4.md §4.5](../../../../05-modules/06-poi-operations/gate-operations-sprint4.md)

Sprint 3 / TO-02 delivers assignment through **`ready_for_dispatch`** and **`dispatched`**. This story covers **driver in-transit** onward and all yard TLS writes.

**Integration pattern:** Yard modules (GT/SC/CC/LD/QC) call `record_yard_sub_state()` and `apply_to_status_transition()` directly in their services — there is **no** central event-ingest facade.

**§6.8.6** (halt / re-delivery) is **Phase 2** — schema allows new `sub_state` values later; no halt trigger in Sprint 4.

**§6.8.7** auto-close rules live in **POD-01**; this story provides timeline hooks and canonical status transitions POD-01 calls.

**§6.8.2** map / live tracking is **not** Sprint 4; timeline APIs are data-only.

## Acceptance Criteria

### AC-1: Canonical status + yard sub-state

- [x] **`TransportOrder.status`** holds the full execution chain per lane using `TOStatus` keys in `apps/transport/constants.py` (same column as Sprint 3 planning statuses)
- [x] **`TransportOrder.sub_state`** holds the current yard step using `TOSubState` (denormalized for POI admin querysets — YARD-01)
- [x] **One TO = one execution thread** (Phase 1)

**Canonical status (`status`) — Sprint 4 execution keys:**

| PRD label (§6.8.5) | `TOStatus` key | Sprint 4 scope |
|---|---|---|
| Created / Assigned / Ready for Dispatch / Dispatched | `created`, `assigned`, `ready_for_dispatch`, `dispatched` | Sprint 3 (TO-01/02) |
| In Transit – Source | `in_transit_source` | DM-01 driver milestone |
| At Source | `at_source` | GT-01 gate-in (source leg) |
| Loaded / Pickup Completed | `loaded_pickup_completed` | Optional canonical bump; loading mostly tracked in `sub_state` while at source |
| In Transit – Destination | `in_transit_destination` | SC-01 scale-out (FG outbound source) or driver milestone |
| At Destination | `at_destination` | GT-01 gate-in (destination leg) |
| Delivered / Unloaded | `delivered_unloaded` | SC-01 scale-out (inbound / dest leg) |
| Completed | `completed` | DM-01 POD submission (when lane rules allow) |
| Closed | `closed` | POD-01 closure engine |

**Yard step (`sub_state`) — written by yard modules while status often stays at `at_source` / `at_destination`:**

| Yard event | Typical `sub_state` value | Source module |
|---|---|---|
| Scale-in | `scale_in_source` / `scale_in_dest` → `waiting_cc` | SC-01 |
| CC flag for QC (RM) | `flagged_for_qc` | CC-01 |
| Bay assigned | `assigned_loading_point` / `assigned_unloading_point` | CC-01 |
| QC sample / decision | `sampling_started`, `qc_passed`, `qc_failed`, `resampling` | QC-01 |
| Load / unload | `loading_started`, `loading_completed`, `unloading_started`, `unloading_completed` | LD-01 |
| Scale-out / gate-out markers | `scale_out_*`, `gate_out_*` | SC-01, GT-01 |

- [ ] **`sub_state` cleared** when canonical `status` enters `SUB_STATE_RESET_ON_STATUS` (`in_transit_destination`, `delivered_unloaded`, `completed`, `closed`, `cancelled`) via `maybe_clear_sub_state_on_status()`
- [x] Explicit **`flow_lane`** mapping in rules and docs: `fg_outbound`, `fg_inbound`, `rm_inbound`
- [x] RM inbound QC outcomes remain at **`status = at_destination`** with `sub_state = qc_passed | qc_failed` (not a separate Completed status for QC alone)
- [x] PRD planning/dispatch micro-sub-states (`fleet_decided`, `lab_analysis`, etc.) are **Phase 2** — not persisted on `sub_state` in Sprint 4

### AC-2: Transition rules

- [ ] **`TO_STATUS_TRANSITIONS`** enforces forward-only **canonical `status`** changes (driver, gate-in, scale-out, POD, closure)
- [x] **Drivers** may only transition `dispatched` → `in_transit_source` (FG outbound) or `in_transit_destination` (FG/RM inbound) — validated in `state_machine.py`
- [x] **Gate-in** requires TO in lane-specific in-transit status (`in_transit_source` / `in_transit_destination` per GT-01 §4.0), not merely `ready_for_dispatch`
- [x] **Yard sub-state** updates do not require a canonical status change; documented in yard integration matrix (implementation spec §1.6)
- [x] Gate-in vs driver milestones documented — gateman records authoritative yard gate-in; driver records in-transit only (no double truth)
- [x] **§6.8.1.7** Fleet Availability Validation on **first driver execution action** (`validate_for_driver_execution`)

### AC-3: Actors & visibility

- [ ] TP, TDO, and Driver can **view** current `status` and `sub_state` on assigned / tenant TOs
- [ ] **Tenant-wide read** for planner/TDO timeline APIs; **POI-scoped** yard operator queues filter on `sub_state` + visit POI (YARD-01 — not TLS read API filtering)
- [x] Allowed **writers** by actor:
  - Driver → in-transit `status` only
  - `gateman` → gate-in `status` bump; gate-out `sub_state`
  - `scaling_operator` → scale `sub_state`; scale-out `sub_state` + `status`
  - `command_center_officer` → CC `sub_state`
  - `loading_personnel` / `unloading_personnel` → LD `sub_state`
  - `qc_inspector_physical` → QC `sub_state` (+ `TransportOrder.qc_passed` on Pass)
  - System / admin → closure `status` → `closed`

### AC-4: Audit (`TOStatusTransitionLog`)

- [x] Every canonical status change appends a log row: `from_status`, `to_status`, `actor`, `actor_role`, `source_module`, `notes`, `created_at`
- [x] Every yard sub-state change appends a log row: `from_status == to_status == current status`, **`sub_state` set**, same actor/metadata fields
- [x] **No JSON payload column** — context in `notes` or module audit tables (`GateActivityLog`, etc.)
- [x] QC Pass/Fail auditable via log `sub_state` + `TransportOrder.qc_passed` + checkpoint `QCDecision` (QC-01)

### AC-5: Read APIs

- [ ] `GET /api/v1/transport-orders/{to_id}/timeline` — ordered transition history (`status`, `sub_state`, `source_module`, actor, timestamps)
- [ ] `GET /api/v1/transport-orders/{to_id}/status` — current `status`, `sub_state`, `flow_lane`
- [ ] `GET /api/v1/transport-orders/{to_id}/transitions/validate` — dry-run canonical transition (admin/support)
- [ ] No map requirement in Sprint 4

### AC-6: Current yard step on the transport order (YARD-01)

- [x] Each TO exposes **`sub_state`** as the current yard step (e.g. `waiting_cc`, `flagged_for_qc`, `loading_started`)
- [x] Yard step updates **atomically** with the timeline via `record_yard_sub_state()` — one source of truth
- [x] Gate, scale, command center, loading, unloading, and QC admin querysets filter work by `sub_state` (+ POI scope via YARD-01)

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| TLS-01-1 | `TOStatus` / `TOSubState` constants; `TransportOrder.sub_state`; `TOStatusTransitionLog`; `timeline_service` (`record_transition`, `record_yard_sub_state`, `maybe_clear_sub_state_on_status`) | DFS-059-1 | Done |
| TLS-01-2 | Canonical `TO_STATUS_TRANSITIONS` + driver rules (`state_machine.py`); yard integration matrix documented and wired in GT/SC/CC/LD/QC services | DFS-059-2 | Partial |
| TLS-01-3 | `TOStatusTransitionLogAdmin` — read-only changelist/detail; filters: TO, `to_status`, `sub_state`, `source_module`, date | DFS-059-3 | Done |
| TLS-01-4 | `TOTimelineInline` — TabularInline under `TransportOrderAdmin` (status, sub_state, actor, source_module, created_at) | DFS-059-4 | Not done |
| TLS-01-5 | Migration: extend execution `status` values on existing TOs; add `sub_state` (default `""`); backfill none required | DFS-059-5 | Done |
| TLS-01-6 | Verify yard-module TLS wiring per integration matrix (§1.6) — GT, SC, CC, LD, QC call timeline helpers in same `atomic()` as domain writes | DFS-059-6 | Done |
| TLS-01-7 | Timeline REST API (`GET …/timeline`) | DFS-059-7 | Not done |
| TLS-01-8 | Status REST API (`GET …/status`) — returns `status`, `sub_state`, `flow_lane` | DFS-059-8 | Not done |
| TLS-01-9 | §6.8.1.7 Fleet Availability Validation on first driver execution action | DFS-059-9 | Done |
| TLS-01-10 | `apply_to_status_transition()` for admin/break-glass POST; `POST …/transitions` validates against `TO_STATUS_TRANSITIONS` (not used by yard modules) | DFS-059-10 | Partial |
| TLS-01-11 | E2E test coverage — validate TO lifecycle transitions, yard sub-state audit timeline, invalid-transition guards, and status / timeline APIs in next sprint | ~ | **Pending** |

## API Endpoints

```
GET    /api/v1/transport-orders/{to_id}/timeline
       # Ordered TOStatusTransitionLog entries (status + sub_state + source_module)

GET    /api/v1/transport-orders/{to_id}/status
       # Current status, sub_state, flow_lane

POST   /api/v1/transport-orders/{to_id}/transitions
       # Admin / break-glass canonical status only (Transport.TO.Transitions.Write)
       # Body: { target_status, notes } — yard sub_state is NOT set via this endpoint

GET    /api/v1/transport-orders/{to_id}/transitions/validate?target_status=...
       # Dry-run canonical transition validity
```

QC REST endpoints live under `/api/v1/qc/*` (QC-01 story) — not nested under transport-orders.

## Access & Permissions

> Full menu structure: [transport-lifecycle-pod-sprint4.md §0](../../../../05-modules/05-transport/transport-lifecycle-pod-sprint4.md)

| Action | Role |
|--------|------|
| View TO timeline (full history) | Transport Planner, TDO, Operations Manager, Support |
| View current status + sub_state | Transport Planner, TDO, Driver (own TOs), yard operators (via admin/API as applicable) |
| Trigger canonical status (POST transitions) | Tenant Admin, Support (break-glass) |
| Yard sub-state writes | Yard services only (`gateman`, `scaling_operator`, `command_center_officer`, `loading_personnel`, `unloading_personnel`, `qc_inspector_physical`) |
| View admin debug timeline | Support, Operations Manager |

## Dependencies

- **Requires**: TO-02 baseline (`ready_for_dispatch`, `dispatched` on same `status` column)
- **Requires**: **YARD-01** Steps 1–5 before POI yard TLS integration is testable end-to-end (`sub_state`, `UserOperationalPOI`, `yard_poi`, `yard_leg`, `YardAdminBase`) — see [yard-foundation-implementation.md](../../../../05-modules/06-poi-operations/yard-foundation-implementation.md)
- **Coordinates with**: GT-01, SC-01, CC-01, LD-01, QC-01 (each emits §1.6 events)
- **Blocks**: DM-01 (timeline read + driver transitions), QC-01 (timeline writes), POD-01 (closure transitions)

## Definition of Done

- [x] `TOStatus`, `TOSubState`, `TransportOrder.status`, `TransportOrder.sub_state`, and `TOStatusTransitionLog` match implementation spec v3.0
- [ ] Current yard step visible on TO (`sub_state` badge in admin) and synced with timeline (AC-6 / YARD-01)
- [ ] `TO_STATUS_TRANSITIONS` + driver rules enforce forward-only **canonical** status changes
- [x] Yard modules wired per integration matrix — no ad-hoc log writes; SC-01 scale-in + CC queue in same transaction
- [ ] `maybe_clear_sub_state_on_status()` called when canonical status crosses reset boundary
- [ ] Invalid canonical transition returns stable error with descriptive message
- [x] §6.8.6 halt/re-delivery deferred Phase 2 (no Sprint 4 trigger; schema extensible)
- [x] Migration extends execution statuses without data loss; existing TOs have `sub_state=""`
- [x] §6.8.1.7 Fleet Availability Validation on first driver execution action
- [ ] Timeline and status GET APIs return `status`, `sub_state`, `flow_lane`
- [ ] `TOStatusTransitionLogAdmin` + timeline inline on TO admin
- [x] Every TLS write audit-logged via timeline helpers (`source_module`, `notes`, `sub_state` when yard-only)
- [ ] Automated tests: canonical status bumps (gate-in, scale-out) **and** sub_state-only paths (scale-in, CC assign, load start)
- [ ] UAT: operations signs off on status + yard step labels vs training deck
- [ ] UAT: TP, TDO, Driver view current status and sub_state (§6.8.5 FR)
