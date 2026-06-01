---
journey_id: E2E-02
title: Yard Execution Chain — Gate-In → Scale → CC → Load/Unload → QC → POD → Closure
sprint: Sprint 5
stories_involved:
  - GT-01
  - SC-01
  - CC-01
  - LD-01
  - QC-01
  - POD-01
feedback_items:
  - FB-001
  - FB-005
  - FB-006
owner: QA Lead
status: Pending
---

# E2E-02 — Yard Execution Chain

## Why This Journey Exists

The Sprint 4 yard execution chain involves six stories passing a TO sequentially through Gate → Scale → Command Center → Loading/Unloading → QC → POD/Closure. Each story sets or reads `sub_state` and emits TLS-01 timeline events. A break at any handoff (e.g., scale-in not updating the CC queue, or QC pass not unblocking bay assignment) invalidates the entire chain.

This journey validates the **RM inbound** path end-to-end as it is the most complex (includes QC gate). An FG outbound variant covers the same chain without QC.

---

## Pre-conditions

- Planner TO exists in `dispatched` state (RM inbound lane, own fleet)
- Driver has pressed Trip Start → TO in `in_transit_destination`
- Gate, Scale, CC, Loading, Unloading, QC, and POD roles configured at the same POI
- L/U points configured at the destination POI (LUP-01)
- Product line items on TO have `qc_required = True`

---

## Scripted Path — RM Inbound

### Step 1 — Gate-In at destination

| Actor | Action | Expected Outcome |
|-------|--------|-----------------|
| Gateman | Creates gate-in for vehicle at destination site | TO status → `at_destination`; `sub_state` → `gate_in_dest`; TLS timeline: `GATE_IN` event |

### Step 2 — Scale-In

| Actor | Action | Expected Outcome |
|-------|--------|-----------------|
| Scaling Operator | Enters P.C. code + loaded vehicle weight at scale-in | `sub_state` → `scale_in_dest` → `waiting_cc`; CC queue shows vehicle with P.C. code, product type, TO ref; queue token created |

### Step 3 — CC sees vehicle, flags for QC

| Actor | Action | Expected Outcome |
|-------|--------|-----------------|
| CC Officer | Views CC queue; vehicle appears with P.C. code, scale-in time, product type, urgency | Queue card shows all required fields (FB-005: multiple vehicles can be in queue for same L/U point) |
| CC Officer | Sets TO sub-state to flagged for QC (raw-material flow) | `sub_state` → `flagged_for_qc`; CC does **not** assign unloading point yet |

### Step 4 — QC Sampling and Decision

| Actor | Action | Expected Outcome |
|-------|--------|-----------------|
| QC Supervisor | Views QC queue; sees TO flagged from CC | QC trigger based on `product_line.qc_required` flag (FB-006) |
| QC Supervisor | Creates sample record with physical analysis + remarks | `sub_state` → `sampling_started`; TLS timeline: `QC_SAMPLE_CREATED` event |
| QC Supervisor | Records **Pass** decision | TO `qc_passed = True`; `sub_state` → `qc_passed`; CC queue reflects TO as ready for unloading point assignment |

### Step 5 — CC assigns unloading point + issues waiting serial

| Actor | Action | Expected Outcome |
|-------|--------|-----------------|
| CC Officer | Views CC queue; sees QC passed indicator for RM vehicle | Bay assignment available for this TO |
| CC Officer | Assigns vehicle to unloading point; issues waiting serial | Serial is unique per L/U point; serial resets daily at 12:00 AM (FB-005); `sub_state` → `assigned_unloading_point`; TLS timeline event emitted |

### Step 6 — Unload with product line items

| Actor | Action | Expected Outcome |
|-------|--------|-----------------|
| Unloading Personnel | Views "my bay" screen; vehicle appears with assigned bay | Bay visible without email/push |
| Unloading Personnel | Records unload start | `sub_state` → `unloading_started`; TLS event |
| Unloading Personnel | Records unload end with **per product line item** quantities (FB-001) | Each product line item has bags and weight captured separately; `sub_state` → `unloading_completed`; TLS event |

### Step 7 — Scale-Out

| Actor | Action | Expected Outcome |
|-------|--------|-----------------|
| Scaling Operator | Records empty vehicle weight at scale-out | Net weight auto-calculated; records locked; TLS timeline: `SCALE_OUT` event; gate pass printable |

### Step 8 — Gate-Out

| Actor | Action | Expected Outcome |
|-------|--------|-----------------|
| Gateman | Creates gate-out | Guard matrix passes (scale-out done + unloading complete + QC pass); TLS timeline: `GATE_OUT` event |

### Step 9 — Driver POD submission

| Actor | Action | Expected Outcome |
|-------|--------|-----------------|
| Driver | TO status is `completed`; uploads 1–3 POD files | POD linked to TO; `pod_uploaded` flag set on closure checklist |

### Step 10 — TO Closure

| Actor | Action | Expected Outcome |
|-------|--------|-----------------|
| Transport Planner | Calls closure status API | All RM inbound prerequisites satisfied: unloading complete + sampling done + QC pass + scale-out + gate-out + POD |
| Transport Planner | Triggers closure (or auto-close fires) | TO status → `closed`; closure audit log recorded |

### Step 11 — Timeline verification

| Actor | Action | Expected Outcome |
|-------|--------|-----------------|
| Transport Planner | Calls `GET …/timeline` | Full timestamp history visible: gate-in, scale-in, QC events, bay assignment, unload start/end, scale-out, gate-out, POD, closure (FB-002) |

---

## FG Outbound Variant (abbreviated)

Run the same chain without Step 3 QC flag and Step 4. After CC assigns loading point → Step 6 becomes Loading (not Unloading) → continue to scale-out, gate-out, POD, closure. Closure matrix: loading complete + scale-out + gate-out + POD.

---

## Negative Cases

| Scenario | Expected Outcome |
|----------|-----------------|
| CC attempts to assign unloading point before QC pass for RM vehicle | API returns blocking error |
| Gate-out attempted before scale-out | Guard matrix rejects |
| Closure attempted with missing POD | Returns 422 with `pod_uploaded: false` blocking reason |
| QC trigger attempted for product line with `qc_required = false` | QC queue does not show vehicle |

---

## Definition of Done

- [ ] Full RM inbound chain (Steps 1–10) completes without error in staging
- [ ] FG outbound variant (no QC steps) also completes
- [ ] Timeline (Step 11) shows all expected events with timestamps (FB-002)
- [ ] Product line item quantities captured per item on unload (FB-001)
- [ ] Serial reset logic verified (FB-005)
- [ ] QC trigger based on `qc_required` flag verified (FB-006)
- [ ] All negative cases return stable errors
- [ ] No regression in story-level E2E sub-tasks (GT-01-14, SC-01-14, CC-01-12, LD-01-10, QC-01-14, POD-01-11)

---

*Stories: GT-01 · SC-01 · CC-01 · LD-01 · QC-01 · POD-01 | Feedback: FB-001, FB-005, FB-006 | Sprint 5*
