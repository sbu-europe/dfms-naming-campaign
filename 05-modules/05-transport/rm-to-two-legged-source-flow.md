---
module: 05-transport
specification: RM Inbound TO — Two-Legged Source + Destination Flow
version: 1.0
phase: Phase 1
status: Proposal (not implemented)
date: 2026-07-10
scope: All RM Inbound TOs (planner-created and gate on-demand excluded — see §2)
primary_surface: Driver trip start, gate-in/out, transport planner planned milestones admin
problem_owner: Transport Planner / Gate Operator / Driver
related_stories: FB-004 (TLS-01 lifecycle), FB-006 (planned milestones), GT-01 (gate ops)
amends: transport-order-management-v2.md, transport-lifecycle-pod-v2.md
django_apps: [apps/transport, apps/operations/gate]
---

# RM Inbound TO — Two-Legged Source + Destination Flow

## 1. Business problem

Currently, when an RM Transport Order is assigned to a driver and dispatched, it goes
directly to **Driving Towards Destination** (the factory/plant). There is no source leg.

The new requirement is that RM TOs must first go to the **source location** (finished
goods warehouse / supplier premises, modelled as `origin_poi` on the TO) for loading
and gate-out, before proceeding to the destination. The destination leg (gate-in,
unloading, QC, closure) is **unchanged**.

**New end-to-end flow for RM Inbound TOs:**

```
CREATED → ASSIGNED → READY_FOR_DISPATCH
  → driving_towards_source          (driver trip start — same as FG Outbound)
  → at_source                       (gate-in at origin_poi)
  [sub_state: scale_in_source → waiting_cc → assigned_loading_point
             → loading_started → loading_completed → scale_out_source → gate_out_source]
  → driving_towards_destination     (source gate-out)
  → at_destination                  (gate-in at destination_poi — unchanged)
  [sub_state: scale_in_dest → waiting_cc → flagged_for_qc → sampling_started
             → qc_passed → assigned_unloading_point → unloading_started
             → unloading_completed → scale_out_dest → gate_out_destination]
  → closed                          (destination gate-out — unchanged)
  → bill_disbursed                  (TP close action — unchanged)
```

---

## 2. Scope

| In scope | Out of scope |
|---|---|
| All planner-created RM TOs (`flow_lane=rm_inbound`, `source=PLANNER`) | Gate on-demand RM TOs (`TOSource.GATE`, `transfer_type=RM_SUPPLIER_INBOUND`) — these use the single-visit path (`is_single_visit_gate_to()`) and are unaffected |
| Driver trip start target: `driving_towards_source` | Vendor fleet RM TOs (no own-fleet trip start for vendor) |
| Gate-in at `origin_poi` → `at_source` | FG Outbound / FG Inbound flow lanes — no change |
| Source yard ops via `sub_state` (scale, loading, gate-out) identical to FG Outbound | Destination QC / unloading / closure checklist — unchanged |
| Planned milestones: all 5 datetimes now required for RM (was 3) | `bill_disbursed` / POD flows — unchanged |
| Planned milestone suggestions: source dwell computed for RM same as FG | In-flight TOs already at `driving_towards_destination` or beyond — they complete via existing transitions with no migration |

---

## 3. Current-state references

| Concern | Existing code |
|---|---|
| `flow_lane` auto-set (RM = Port Consignment TR) | `apps/transport/models.py:249–255` |
| `FIRST_DRIVER_TRANSITION` — RM currently maps to `driving_towards_destination` | `apps/transport/constants.py:138–142` |
| `GATE_IN_ELIGIBLE_TO_STATUSES` — RM only allows `driving_towards_destination` | `apps/transport/constants.py:91–98` |
| `GATE_IN_SUCCESS_BY_STATUS` — RM success entry for `driving_towards_destination` only | `apps/transport/constants.py:101–106` |
| `GATE_OUT_ELIGIBLE_TO_STATUSES` — RM allows `at_destination` / `delivered_unloaded` only | `apps/transport/constants.py:116–126` |
| `SCALE_IN_ELIGIBLE_TO_STATUSES` — no `(rm_inbound, source)` entry | `apps/transport/constants.py:207–211` |
| `SCALE_OUT_RESULT_TO_STATUS` — no `(rm_inbound, source)` entry | `apps/transport/constants.py:216–220` |
| `required_planned_field_names` — RM returns only 3 fields (start + dest pair) | `apps/transport/planned_milestones.py:41–45` |
| `get_planned_milestone_suggestions` — RM block skips source dwell computation | `apps/transport/planned_milestones.py:222–230` |
| `gate_in_poi_id_for_to` — RM grouped with FG_INBOUND; returns `destination_poi_id` only | `apps/operations/gate/gate_services.py:151–153` |
| `record_gate_out_status` — source gate-out branch only checks `FG_OUTBOUND` | `apps/operations/gate/gate_services.py:734` |
| `TO_STATUS_TRANSITIONS` — `AT_SOURCE → DRIVING_TOWARDS_DESTINATION` already exists | `apps/transport/constants.py:237–240` |

---

## 4. What does NOT change

- `TO_STATUS_TRANSITIONS` — `AT_SOURCE → DRIVING_TOWARDS_DESTINATION` is already in the graph; no new edge needed.
- `apply_to_status_transition` — lane-agnostic; no change.
- `execute_trip_start` / `driver_transition_service` — reads `FIRST_DRIVER_TRANSITION`; fixed by constant change only.
- `record_gate_in_status` / `record_gate_out_status` body logic — reads the constants dicts; fixed by constant + gate_services changes.
- Destination yard ops: unloading service, QC eligibility (`flow_lane=rm_inbound` + `status=at_destination`), closure checklist (`sampling_done`, `qc_passed`), scale-out at destination — all unchanged.
- Gate on-demand RM TOs: `is_single_visit_gate_to()` returns `True` before any lane branch is evaluated.
- `fleet_supervisor` dispatch service — acts on `READY_FOR_DISPATCH`; does not care about the driving target.
- `mark_bill_disbursed`, `closure_engine`, POD — unchanged.
- No model changes, no Django migrations.

---

## 5. Implementation sub-tasks

### 5.1 `apps/transport/constants.py`

**ST-1: `FIRST_DRIVER_TRANSITION` — change RM target to source**

```python
# apps/transport/constants.py  lines 138–142
FIRST_DRIVER_TRANSITION: dict[str, str] = {
    FlowLane.FG_OUTBOUND: TOStatus.DRIVING_TOWARDS_SOURCE,
    FlowLane.FG_INBOUND: TOStatus.DRIVING_TOWARDS_DESTINATION,
    FlowLane.RM_INBOUND: TOStatus.DRIVING_TOWARDS_SOURCE,   # changed from DESTINATION
}
```

**ST-2: `GATE_IN_ELIGIBLE_TO_STATUSES` — add source driving status for RM**

```python
FlowLane.RM_INBOUND: [
    TOStatus.DRIVING_TOWARDS_SOURCE,        # new
    TOStatus.DRIVING_TOWARDS_DESTINATION,
],
```

**ST-3: `GATE_IN_SUCCESS_BY_STATUS` — add RM source-leg entry**

```python
(FlowLane.RM_INBOUND, TOStatus.DRIVING_TOWARDS_SOURCE): TOStatus.AT_SOURCE,   # new
(FlowLane.RM_INBOUND, TOStatus.DRIVING_TOWARDS_DESTINATION): TOStatus.AT_DESTINATION,
```

**ST-4: `GATE_OUT_ELIGIBLE_TO_STATUSES` — add source statuses for RM**

```python
FlowLane.RM_INBOUND: [
    TOStatus.AT_SOURCE,                     # new
    TOStatus.LOADED_PICKUP_COMPLETED,       # new (recovery parity with FG Outbound)
    TOStatus.AT_DESTINATION,
    TOStatus.DELIVERED_UNLOADED,
],
```

**ST-5: `SCALE_IN_ELIGIBLE_TO_STATUSES` — add RM source entry**

```python
(FlowLane.RM_INBOUND, "source"): TOStatus.AT_SOURCE,   # new
(FlowLane.RM_INBOUND, "destination"): TOStatus.AT_DESTINATION,
```

**ST-6: `SCALE_OUT_RESULT_TO_STATUS` — add RM source entry**

```python
(FlowLane.RM_INBOUND, "source"): None,    # new — sub_state only; gate-out advances status
(FlowLane.RM_INBOUND, "destination"): None,
```

---

### 5.2 `apps/transport/planned_milestones.py`

**ST-7: `required_planned_field_names` — remove RM short-circuit**

RM now requires all 5 milestones. Delete the RM-specific early return:

```python
# Before
def required_planned_field_names(flow_lane: str | None) -> tuple[str, ...]:
    lane = flow_lane or FlowLane.FG_OUTBOUND
    if lane in RM_FLOW_LANES:
        return (PLANNED_START, PLANNED_DEST_ARRIVAL, PLANNED_DEST_DEPARTURE)
    return ALL_PLANNED_FIELD_NAMES

# After
def required_planned_field_names(flow_lane: str | None) -> tuple[str, ...]:
    return ALL_PLANNED_FIELD_NAMES
```

`RM_FLOW_LANES` and the `lane` local variable become unused; remove them from this function (they may still be used elsewhere — check before removing the module-level constant).

**ST-8: `get_planned_milestone_suggestions` — remove RM short-circuit block**

Delete the `if lane in RM_FLOW_LANES:` block (lines 222–230). The FG computation that
follows already computes all 5 fields correctly and applies identically to RM.

---

### 5.3 `apps/operations/gate/gate_services.py`

**ST-9: `gate_in_poi_id_for_to` — split RM from FG_INBOUND**

```python
# Before (lines 151–153)
elif lane in (FlowLane.FG_INBOUND, FlowLane.RM_INBOUND):
    if status == TOStatus.DRIVING_TOWARDS_DESTINATION:
        return to.destination_poi_id

# After
elif lane == FlowLane.FG_INBOUND:
    if status == TOStatus.DRIVING_TOWARDS_DESTINATION:
        return to.destination_poi_id
elif lane == FlowLane.RM_INBOUND:
    if status == TOStatus.DRIVING_TOWARDS_SOURCE:
        return to.origin_poi_id
    if status == TOStatus.DRIVING_TOWARDS_DESTINATION:
        return to.destination_poi_id
```

**ST-10: `record_gate_out_status` — extend source branch to include RM**

One-line change to the `if` condition at line 734. The body (sub_state write +
`DRIVING_TOWARDS_DESTINATION` transition) is identical for both lanes:

```python
# Before (line 734)
if lane == FlowLane.FG_OUTBOUND and to.origin_poi_id == gate_poi_id:

# After
if lane in (FlowLane.FG_OUTBOUND, FlowLane.RM_INBOUND) and to.origin_poi_id == gate_poi_id:
```

---

## 6. Tests to update / add

| File | Change |
|---|---|
| `tests/unit/test_transport/test_driver_state_machine.py` | Update RM trip-start test: expected target status changes from `driving_towards_destination` to `driving_towards_source` |
| `tests/unit/test_transport/test_planned_milestones.py` | Update RM milestone requirements test: all 5 fields now required (not 3); milestone suggestion for RM now returns source arrival/departure |
| `tests/unit/test_transport/test_admin.py` | Update any RM assignment readiness tests that only supplied 3 milestones |
| `tests/unit/test_transport/test_gate_services.py` (new or existing) | Add: RM `driving_towards_source` → gate-in → `at_source`; RM source gate-out → `driving_towards_destination`; RM `driving_towards_destination` → gate-in → `at_destination` (existing path still works) |

---

## 7. Migration risk

No model changes or Django migrations are required.

**In-flight TOs:** Any RM TO already at `driving_towards_destination`, `at_destination`,
or beyond at the time of deploy will complete normally via the existing `AT_DESTINATION → CLOSED`
transition. They are not affected by this change.

**Newly dispatched TOs:** All RM TOs that reach `READY_FOR_DISPATCH` after deploy will
follow the two-legged path automatically.
