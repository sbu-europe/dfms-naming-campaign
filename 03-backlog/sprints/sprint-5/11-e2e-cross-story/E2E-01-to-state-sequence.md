---
journey_id: E2E-01
title: TO State Sequence — TDO Assignment → Supervisor Dispatch → Driver Trip Start
sprint: Sprint 5
stories_involved:
  - DS-01
  - DM-01
  - TLS-01
feedback_items:
  - FB-004
owner: QA Lead
status: Pending
---

# E2E-01 — TO State Sequence

## Why This Journey Exists

FB-004 requires reconciling the TO state sequence across DS-01 (supervisor dispatch gate), DM-01 (driver Trip Start), and TLS-01 (canonical transition rules). Each story implements its slice correctly in isolation, but the **handoff between the three** is where the gap lives:

- TDO promotes the TO to `ready_for_dispatch` when assignment is complete (vehicle, driver, helpers, ETA per fleet rules)
- DS-01 releases the TO via inspection or skip → TLS-01 must write `dispatched` (supervisor dispatch gate)
- DM-01 lists the TO while `ready_for_dispatch` but execution actions (Trip Start) only when `dispatched`
- Driver's Trip Start button must advance the TO to the correct lane-aware in-transit status via TLS-01

This journey validates the full chain without breakage at any handoff.

---

## Pre-conditions

- Tenant with own-fleet vehicles configured
- TDO has created a TO and assigned vehicle, driver, ETA (TO in `ready_for_dispatch`)
- Driver Supervisor account exists and is scoped to the relevant POI
- Driver account exists and is assigned to the TO

---

## Scripted Path

### Step 1 — Supervisor views dispatch queue

| Actor | Action | Expected Outcome |
|-------|--------|-----------------|
| Driver Supervisor | Opens dispatch-readiness queue | TO appears with status `ready_for_dispatch`; checklist and skip options available |

### Step 2 — Supervisor releases TO (skip path)

| Actor | Action | Expected Outcome |
|-------|--------|-----------------|
| Driver Supervisor | Selects skip inspection → confirms dispatch | TO status → `dispatched`; `TOStatusTransitionLog` records `ready_for_dispatch → dispatched` with actor `fleet_supervisor` |

### Step 3 — Driver sees TO as ready to start

| Actor | Action | Expected Outcome |
|-------|--------|-----------------|
| Driver | Opens Driver Mobile TO list | TO appears with status `dispatched`; Trip Start button is **enabled** |
| Driver | Observes TO detail | `flow_lane` visible; `allowed_next_transitions` matches lane (e.g. `in_transit_source` for FG outbound) |

### Step 4 — Driver presses Trip Start (FG outbound lane)

| Actor | Action | Expected Outcome |
|-------|--------|-----------------|
| Driver | Presses Trip Start | TO status → `in_transit_source`; `TOStatusTransitionLog` records `dispatched → in_transit_source` with actor `driver` |
| Driver | Observes TO detail after transition | Status shows `in_transit_source`; next allowed action is correct per lane |

### Step 5 — Driver presses Trip Start (RM inbound lane — separate run)

| Actor | Action | Expected Outcome |
|-------|--------|-----------------|
| Driver | Presses Trip Start on RM inbound TO | TO status → `in_transit_destination`; source-leg statuses (`in_transit_source`, `at_source`) are **not** offered |

### Step 6 — Timeline verification

| Actor | Action | Expected Outcome |
|-------|--------|-----------------|
| Transport Planner | Calls `GET …/timeline` | Timeline shows full sequence: `created` → `assigned` → `ready_for_dispatch` → `dispatched` → `in_transit_source/destination` with timestamps and actors |
| Transport Planner | Calls `GET …/status` | Returns current `status`, `sub_state`, `flow_lane` |

---

## Negative Cases

| Scenario | Expected Outcome |
|----------|-----------------|
| Driver attempts Trip Start when TO is `ready_for_dispatch` (not yet dispatched) | API returns stable error referencing dispatch gate |
| Driver attempts source-leg transition on RM inbound TO | API rejects with lane mismatch error |
| Supervisor attempts to dispatch a TO not in `ready_for_dispatch` | API rejects with invalid transition error |

---

## Definition of Done

- [ ] Steps 1–6 complete without error in staging environment
- [ ] Both FG outbound and RM inbound Trip Start paths verified
- [ ] All negative cases return correct stable errors
- [ ] TLS-01 timeline populated with correct actors and timestamps for every step
- [ ] No regression in DS-01, DM-01, or TLS-01 story-level E2E sub-tasks after this run

---

*Stories: DS-01 · DM-01 · TLS-01 | Feedback: FB-004 | Sprint 5*
