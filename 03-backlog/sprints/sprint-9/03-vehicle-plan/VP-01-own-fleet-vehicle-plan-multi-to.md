---
jira_key: ~
jira_type: Story
jira_sprint: "Sprint 9"
story_id: VP-01
title: Own-Fleet Vehicle Plan — Multi-TO on One Vehicle with Vehicle-First Yard
epic: Own-Fleet Vehicle Plan (Multi-TO)
status: Pending
story_points: 21
assignee: ~
prd_refs:
  - "02-domain/03-business-rules/transport-rules.md § 3.5 TR Conjoinment (TCR-001–TCR-003)"
  - "05-modules/05-transport/transport-order-management.md (TO-01)"
  - "05-modules/05-transport/trip-management.md (TO-02)"
  - "05-modules/06-poi-operations/ (GT-01, SC-01, CC-01, LD-01)"
phase: Phase 1
related_stories:
  - TO-01 — Transport Order creation (singleton TO still the default; wrapped in a plan)
  - TO-02 — TDO own-fleet assignment (vehicle/driver now apply at plan level)
  - FB-011 — planning-stage multi-TO on one vehicle; execution exclusivity moves from TO to plan
  - YARD-01 / GT-01 / SC-01 / CC-01 / LD-01 — yard stays TO-status based; visit becomes vehicle + member TOs
---

# VP-01 — Own-Fleet Vehicle Plan (Multi-TO on One Vehicle)

## User Story

**As a** Transport Planner  
**I want to** put one or more Created own-fleet TOs onto a **vehicle plan** (the vehicle and which TOs are my decision)  
**So that** one truck can carry TOs from the same or different TRs without inventing a fake single TO.

**As a** yard operator (Gate, Scale, Command Center, Loading/Unloading)  
**I want to** start the visit by **selecting the vehicle**, then confirm which of that plan’s eligible TOs are in this visit  
**So that** the truck is weighed once, Command Center assigns a loading/unloading point **per TO**, and each TO still keeps its own status.

---

## Business Context

Today every yard visit and dispatch slot is **one TO**. Planners can already hang the same vehicle on several TOs during planning (FB-011), but the truck can only **execute one TO at a time**, and gate-in is TO-first. That blocks a real split load: one vehicle, several TOs, one presence at a POI.

This story adds a **Vehicle Plan**. Every own-fleet TO still exists and still has its own status, POD, QC, and lines. Creating a TO also creates a **default 1-TO plan**. The Transport Planner may add other **Created** TOs (any TR) onto a plan for a vehicle. Route mix is the planner’s call — the system does not force the same origin/destination.

At the yard the operator picks the **vehicle**. Eligible member TOs at that POI are listed, all on by default, uncheck allowed. One gate-in, one scale-in/out for the truck. After scale-in, Command Center assigns a loading/unloading point **per included TO**. Load/unload and QC stay per TO. Each TO’s `status` / `sub_state` still move on their own.

**Vendor fleet is out of scope** (`TransportOrderBundle` stays N TOs / N vehicles).

---

## Locked decisions (PO)

| Topic | Decision |
|---|---|
| Plan membership / route | Transport Planner decides which Created TOs belong on a plan. No system rule that TOs must share origin, destination, or TR. |
| Gate-in TO list | Show all eligible TOs for this vehicle at this POI; default all on; operator may uncheck. Visit membership is explicit. |
| Fleet | Own fleet only. |
| Scale vs load | Scale **once per visit** (vehicle). Then Command Center assigns loading/unloading point **per TO**. Load/unload/QC remain per TO. |
| When TOs may join / leave a plan | Only TOs in **Created** are available for planning (add or remove). |
| Different TRs | Yes — one plan may hold TOs from multiple TRs. |

---

## Acceptance Criteria

### AC-0 — Default plan (single TO unchanged)

- [ ] Creating an own-fleet TO **always** creates a Vehicle Plan with that TO as the only member (vehicle empty until assigned).
- [ ] Today’s single-TO create → assign → dispatch → yard path still works; the plan is the container, not a second document the planner must fill in for one TO.
- [ ] A TO belongs to **exactly one** plan at a time.
- [ ] Vendor-fleet TO create/bundle/bid is unchanged.

### AC-1 — Planner builds a multi-TO plan

- [ ] Transport Planner can create or open a Vehicle Plan, choose an **own-fleet vehicle**, and add **Created** TOs (same or different TRs).
- [ ] Adding a TO **moves** it from its singleton (or previous draft) plan onto this plan; empty leftover draft plans are removed.
- [ ] Planner can **remove** a Created TO from a multi-TO plan; that TO returns to a default 1-TO plan (still Created, vehicle cleared if it only came from this plan).
- [ ] TOs that are not Created (Assigned, Ready for Dispatch, driving, yard, Closed, Cancelled, …) **cannot** be added or removed.
- [ ] The system **does not** reject mixed origin, destination, or flow lane. Capacity vs vehicle may **warn**; it must not block the planner unless a later rule is added.

### AC-2 — Assignment and dispatch are plan-scoped (own fleet)

- [ ] Vehicle, driver, and helpers on a plan are the crew for **all** member TOs (`TransportOrder.vehicle` / driver remain denormalised for existing screens).
- [ ] A vehicle executes **one plan at a time**. TOs on that plan may be in the yard together (`at_source` / `at_destination`); they are not treated as competing for the vehicle.
- [ ] A second plan for the same vehicle cannot be dispatched while this plan is actively serving.
- [ ] Supervisor / TDO dispatch releases the **plan**; all current members go to `ready_for_dispatch` together.
- [ ] Driver start-trip on the plan fans out `driving_towards_source` (or the lane-correct first driving status) to **every member TO**.

### AC-3 — Gate-in is vehicle-first

- [ ] Gate-in starts by selecting the **vehicle** at the working POI (not TO-first).
- [ ] System loads the vehicle’s **active plan** and lists member TOs **eligible at this POI** (TO status is the driving-towards status that matches this site as origin or destination).
- [ ] All eligible TOs are **checked by default**; the gateman may uncheck. At least one TO must remain selected.
- [ ] One `GateVisitSession` is created (still **one active visit per vehicle + POI**). Visit members are the selected TOs only.
- [ ] Gate-in is recorded **once** for the vehicle. Each **selected** TO gets the existing gate-in status transition (`at_source` or `at_destination`). Unchecked TOs are **not** transitioned and are not visit members.

### AC-4 — Scale once; CC assigns LUP per TO

- [ ] Scale-in and scale-out are **one weighing cycle per visit** (vehicle weights). They are not captured per TO.
- [ ] After scale-in, Command Center sees **one queue row for the vehicle visit**, with the visit’s member TOs listed.
- [ ] Command Center assigns a loading or unloading point **to each member TO** (not one point for the whole truck unless the officer chooses the same point on two assignments).
- [ ] Load / unload events stay **per TO**. QC stays **per TO** when that TO’s lane/leg requires it.
- [ ] Yard `sub_state` still lives on each TO. Shared steps (scale-in/out, gate-out) **fan out** to every visit member. TO-specific steps (LUP assigned, loading, QC) update **only that TO**.

### AC-5 — Gate-out and individual TO status

- [ ] Gate-out is **once per visit** (vehicle).
- [ ] Gate-out is blocked until **every visit member TO** has finished the work required for **this POI / leg** (load or unload complete; QC if required for that TO).
- [ ] On source gate-out, each visit member TO gets the existing source gate-out transition (typically `driving_towards_destination`).
- [ ] On destination gate-out, each visit member TO gets the existing dest close path (`closed`) if that TO’s dest work is complete.
- [ ] A TO that was eligible but **unchecked** at gate-in is unchanged by this visit; it can only be served in a **later** visit after this one is closed.
- [ ] Each TO keeps its own timeline, POD, QC outcome, and commercial close. Plan is **completed** when all member TOs are terminal (Closed / Cancelled).

### AC-6 — Audit

- [ ] Plan create, add TO, remove TO, dispatch, and visit membership (which TOs were included at gate-in) are audited with actor and timestamp.
- [ ] Existing TO status-transition logs remain the source of truth for each TO’s lifecycle.

---

## Functional Flows

Happy path and every branch implied by the locked decisions. Vendor-fleet / GT-02 multi-TO join remain out of scope (called out as rejects).

---

### Planning

#### Flow A — Single TO (default plan)

```
Transport Planner creates own-fleet TO-A
  → Vehicle Plan P1 created with member TO-A (no vehicle yet)
TDO assigns vehicle / driver / milestones on TO-A (writes through P1)
  → dispatch P1 → start trip
Gate: select vehicle → only TO-A listed → gate-in
  → scale once → CC assigns LUP for TO-A → load/unload TO-A → scale-out → gate-out
TO-A status / sub_state behave as today
```

#### Flow B — Same TR, two Created TOs on one vehicle

```
Planner creates TO-A and TO-B from TR-1 (each gets a default plan)
Planner opens a plan for vehicle V, adds TO-A and TO-B
  → both members of one plan; empty leftover default plans removed
TDO assigns driver, dispatch, start trip
  → both members get the lane-correct first driving status
```

#### Flow C — Different TRs on one vehicle

```
TO-A (TR-1, Created) default plan P1
TO-B (TR-2, Created) default plan P2
Planner adds both to a plan for vehicle V
  → both members; P2 removed if empty
Dispatch / start-trip fan-out to TO-A and TO-B independently (each keeps its own status)
```

#### Flow D — Mixed origin / destination / lane (planner choice)

```
TO-A origin=Depot-1 dest=Depot-2 (FG outbound, Created)
TO-B origin=Depot-3 dest=Depot-1 (RM inbound, Created)
Planner puts both on vehicle V’s plan
  → accepted (no same-route rule)
Capacity vs vehicle may warn; plan still saves
Each TO still has its own origin, dest, flow_lane, and later yard eligibility
```

#### Flow E — Remove a Created TO from a multi-TO plan

```
Plan P has members TO-A, TO-B (both Created)
Planner removes TO-B
  → TO-B gets a new default 1-TO plan (Created; vehicle cleared)
  → P remains with TO-A only
```

#### Flow F — Move a Created TO from one draft plan to another

```
TO-A is on draft plan P1 (vehicle V1 or none)
Planner adds TO-A to plan P2 (vehicle V2)
  → TO-A leaves P1; P1 deleted if it has no members left
  → TO-A is only on P2
```

#### Flow G — Cancel a Created TO that is on a plan

```
Plan P members: TO-A, TO-B (Created)
Planner / TDO cancels TO-B
  → TO-B Cancelled; removed from further planning
  → P continues with TO-A
  → if TO-B was the last member, P is cancelled / completed with no remaining Created members
```

---

### Assignment and dispatch

#### Flow H — Crew on the plan applies to all members

```
Plan P members TO-A, TO-B
TDO sets vehicle V, driver D, helpers on P
  → TO-A.vehicle = TO-B.vehicle = V (denormalised)
  → same driver / helpers on both TOs
```

#### Flow I — Dispatch and start-trip fan-out

```
Supervisor / TDO dispatches plan P
  → every current member → ready_for_dispatch
Driver starts trip on P
  → every member gets lane-correct first driving status
     (typically driving_towards_source; FG inbound may be driving_towards_destination)
```

#### Flow J — Second plan on the same vehicle cannot dispatch while first is serving

```
Plan P1 for vehicle V is ready_for_dispatch / driving / in yard (actively serving)
Plan P2 also has vehicle V (draft, Created TOs)
TDO tries to dispatch P2
  → rejected (one actively serving plan per vehicle)
P2 can dispatch only after P1 is no longer actively serving (all members terminal or plan completed)
```

#### Flow K — Later plan may be drafted on the same vehicle

```
P1 is still Created/Assigned (not dispatched)
Planner builds P2 on the same vehicle with other Created TOs
  → allowed at planning
Only one of P1 / P2 may be dispatched at a time (Flow J)
```

---

### Source yard (vehicle-first)

#### Flow L — Two TOs, same origin POI, both included

```
Gateman selects vehicle V at Depot-1
  → eligible: TO-A, TO-B (origin = Depot-1, driving_towards_source)
  → both checked; gateman leaves both on
One gate-in → TO-A and TO-B → at_source
One scale-in (vehicle)
CC assigns LUP-1 to TO-A, LUP-2 to TO-B
Loading officer loads TO-A then TO-B (each TO sub_state independent)
One scale-out → fan-out scale_out_source to both visit members
One gate-out → both driving_towards_destination
```

#### Flow M — Same loading point for two TOs

```
After scale-in, CC assigns LUP-1 to TO-A and LUP-1 to TO-B
  → allowed (officer choice)
Load events still per TO (TO-A complete vs TO-B in progress can differ)
Gate-out still waits for both visit members
```

#### Flow N — Operator unchecks a TO at gate-in

```
Eligible: TO-A, TO-B
Gateman unchecks TO-B, confirms TO-A
Visit members = {TO-A} only
TO-A → at_source; TO-B stays driving_towards_source
Yard work, scale-out, gate-out apply to TO-A only
TO-B cannot start a second visit at this POI until this visit is closed
  (uniq_active_gate_visit_vehicle_poi)
After gate-out, gateman selects V again → TO-B listed → new visit
```

#### Flow O — Only one member is eligible at this POI

```
Plan members: TO-A origin=Depot-1, TO-B origin=Depot-3
Vehicle at Depot-1, both driving_towards_source
Gate list shows TO-A only (TO-B not eligible here)
Gate-in / scale / CC / load / gate-out apply to TO-A
TO-B stays driving_towards_source until the vehicle visits Depot-3
```

#### Flow P — Independent load progress; gate-out blocked

```
Visit members TO-A, TO-B at source
TO-A loading_completed; TO-B still loading_in_progress
Gateman tries gate-out
  → blocked until TO-B (and any required QC for a member) is complete for this leg
After TO-B loading_completed → scale-out (if not already) → gate-out allowed
  → both driving_towards_destination
```

#### Flow Q — Uncheck all eligible TOs rejected

```
Eligible: TO-A, TO-B
Gateman unchecks both
  → rejected; at least one TO must remain selected
No visit created; no TO status change
```

---

### Destination yard

#### Flow R — Both TOs drop at the same destination

```
Vehicle at Depot-2; TO-A and TO-B dest = Depot-2, driving_towards_destination
Gateman selects V → both listed, both left on
One gate-in → both at_destination
One scale-in
CC assigns unloading point per TO
Unload (and QC if that TO’s lane/leg requires it) per TO
One scale-out → fan-out to visit members
One gate-out → each visit member closed (dest work complete)
Plan completed when all members are Closed / Cancelled
```

#### Flow S — Milk-run drop: only some members dest at this POI

```
TO-A dest=Depot-2, TO-B dest=Depot-4; both driving_towards_destination
Vehicle gates in at Depot-2
  → eligible: TO-A only
Visit members = {TO-A}
Unload / QC / dest gate-out close TO-A
TO-B still driving_towards_destination until Depot-4
Plan stays in progress until TO-B is also terminal
```

#### Flow T — RM dest QC per TO (pass)

```
Visit members include RM inbound TO-A at dest
Scale-in → CC flags TO-A for QC; TO-B (FG) has no QC
QC pass on TO-A → CC assigns unload point for TO-A
Unload TO-A; unload TO-B (no QC)
Gate-out after every visit member’s dest work is done
  → each member follows dest close (typically closed)
```

#### Flow U — RM dest QC fail on one member

```
Visit members TO-A (RM, QC required), TO-B (no QC)
TO-B unloaded; TO-A QC failed / resampling
Gate-out
  → blocked while TO-A has not finished dest work required for this visit
After QC pass + unload TO-A (or that TO is cancelled / otherwise cleared per existing QC rules)
  → gate-out allowed for the visit
TO-B status was already unload-complete; dest gate-out still fans out per remaining visit members
```

---

### Mixed-route visit at one POI

#### Flow V — Load one TO and unload another at the same site

```
TO-A origin=Depot-1 (driving_towards_source)
TO-B dest=Depot-1 (driving_towards_destination)
Same plan, vehicle at Depot-1
Gate list: TO-A and TO-B (both eligible), default both on
One gate-in
  → TO-A → at_source; TO-B → at_destination
One scale-in (vehicle)
CC assigns loading point to TO-A and unloading point to TO-B
Load TO-A; unload TO-B (QC on TO-B if required)
One scale-out
Gate-out when both visit members have finished this POI’s required work
  → TO-A → driving_towards_destination
  → TO-B → closed (dest complete)
```

#### Flow W — Gateman includes only the load TO, not the dest TO

```
Same eligibility as Flow V
Gateman unchecks TO-B, keeps TO-A
Visit = {TO-A} only (source load)
TO-B stays driving_towards_destination
After this visit closes, a new gate-in can include TO-B
```

---

### Lane-specific (still per TO)

#### Flow X — FG outbound member (source load, dest unload)

```
Member TO-A fg_outbound
Source visit: load TO-A → source gate-out → driving_towards_destination
Dest visit: unload TO-A → dest gate-out → closed
Sibling members on the plan follow their own lanes in the same or later visits
```

#### Flow Y — FG inbound member (dest only)

```
Member TO-A fg_inbound: first driving status is driving_towards_destination
Start-trip fans out that status (not driving_towards_source)
First yard visit is dest: unload (no source load for this TO)
Other members on the plan may still have a source leg
```

#### Flow Z — RM inbound member (source load, dest unload + QC)

```
Member TO-A rm_inbound
Source visit: load TO-A (no QC at source)
Dest visit: QC then unload TO-A
Sibling TOs keep independent QC flags
```

---

### Rejects and guards

#### Flow AA — Created-only planning window

```
TO-C is Assigned or later
Planner tries to add TO-C to a plan
  → rejected; only Created TOs are available
Planner tries to remove TO-A after dispatch (TO-A no longer Created)
  → rejected
```

#### Flow AB — Vendor TO cannot join an own-fleet Vehicle Plan

```
Planner tries to add a vendor-fleet TO (or bundle child) to an own-fleet plan
  → rejected
Vendor bundle / bid path unchanged
```

#### Flow AC — GT-02 on-demand TO stays on its singleton plan

```
Gate creates an on-demand TO
  → default 1-TO plan only
Planner cannot add it to a multi-TO Vehicle Plan (out of scope)
```

#### Flow AD — Vehicle with no eligible TOs at this POI

```
Gateman selects vehicle V
Active plan exists but no member is in the driving-towards status for this POI
  → empty eligible list; gate-in not allowed
```

#### Flow AE — Second active visit for the same vehicle + POI

```
Visit already ACTIVE for vehicle V at this POI
Gateman tries another gate-in for V
  → rejected (unique active visit per vehicle + POI)
```

#### Flow AF — Gate-in before scale-out / work still open (existing yard order)

```
Visit members mid-load
Scale-out or gate-out attempted out of order
  → existing yard guards apply, evaluated against every visit member where the step is shared
```

#### Flow AG — TO cancel after visit membership (mid-yard)

```
Visit members TO-A, TO-B; TO-B cancelled mid-visit (existing cancel rules if allowed)
  → TO-B no longer blocks gate-out
  → remaining members must still complete this leg
```

---

## Business Rules

| ID | Rule |
|---|---|
| BR-VP01-001 | Every own-fleet TO belongs to exactly one Vehicle Plan. TO create always opens a default 1-TO plan. |
| BR-VP01-002 | Only **Created** TOs may be added to or removed from a plan. |
| BR-VP01-003 | Transport Planner decides membership. Mixed origin / destination / TR / lane is allowed. |
| BR-VP01-004 | Own fleet only. Vendor bundle and vendor TOs are not Vehicle Plans. |
| BR-VP01-005 | One **actively serving plan** per vehicle (replaces one actively serving TO per vehicle for TOs on the same plan). |
| BR-VP01-006 | Yard visit is one active session per vehicle + POI. Physical gate/scale are vehicle-level; commercial status stays on each TO. |
| BR-VP01-007 | Visit membership is the TOs the gateman left checked. Unchecked eligible TOs are not transitioned. |
| BR-VP01-008 | After scale-in, Command Center assigns loading/unloading point **per visit-member TO**. |
| BR-VP01-009 | Gate-out requires every **visit member** TO to have completed this leg’s required yard work. |
| BR-VP01-010 | TCR-003 remains: each TO keeps its own status, POD, and QC. TCR-001 / TCR-002 do **not** apply between members of the same plan; they apply **between plans** on the same vehicle. |

---

## Sub-tasks

| # | Sub-task | Description | Priority | Status |
|---|---|---|---|---|
| VP-01-1 | Specs | Update `transport-rules.md` TCR-001/002 (plan-scoped); note Vehicle Plan in TO-01 / TO-02 / gate-management | High | **Not done** |
| VP-01-2 | Persistence | `VehiclePlan` + `VehiclePlanMember`; TO belongs to one plan; backfill one plan per existing own-fleet TO | High | **Not done** |
| VP-01-3 | Default + membership | TO create → default plan; planner add/remove Created TOs; vehicle on plan; denormalise vehicle/driver onto members | High | **Not done** |
| VP-01-4 | Exclusivity + dispatch | FB-011: one active **plan** per vehicle; dispatch and start-trip fan-out to members | High | **Not done** |
| VP-01-5 | Gate-in | Vehicle-first; eligible TO checklist (default all on); visit members; fan-out gate-in status | High | **Not done** |
| VP-01-6 | Scale + CC | One weigh cycle per visit; queue by visit; CC assigns LUP **per member TO**; fan-out scale sub-state | High | **Not done** |
| VP-01-7 | LD + gate-out | Load/unload per TO; gate-out blocked until all visit members complete this leg; fan-out gate-out status | High | **Not done** |
| VP-01-8 | Admin UX | Planner plan screen (vehicle → TO picker); gate add form vehicle then TO checklist; CC visit shows member TOs | High | **Not done** |
| VP-01-9 | Audit + tests | Plan/visit membership audit; unit tests for default plan, mixed TR, Created-only, uncheck, per-TO LUP, gate-out block | High | **Not done** |

---

## Dependencies

| Dependency | Notes |
|---|---|
| TO-01 / `TransportOrder` | Keep TO as commercial unit; add required plan membership |
| TO-02 / TDO own-fleet assignment | Vehicle/driver/helpers write through the plan |
| FB-011 `assignment_availability.py` | Change actively-serving exclusivity from TO to plan |
| `GateVisitSession` unique `(vehicle, poi)` while active | Keep; add plan + visit members |
| SC-01 / CC-01 / LD-01 | Scale stays 1:1 with visit; bay assignment must be per TO |
| TCR-001 / TCR-002 | Product text still says sequential single TO — VP-01-1 must supersede for same-plan members |
| Vendor `TransportOrderBundle` | Do not reuse; different shape (N vehicles) |

---

## Test Plan

- [ ] Create one own-fleet TO → default plan with one member; single-TO yard still completes
- [ ] Add two Created TOs from different TRs to one vehicle plan; both show as members
- [ ] Mixed origin/dest TOs can sit on one plan (planner choice)
- [ ] Cannot add an Assigned (or later) TO; cannot remove a member after it leaves Created
- [ ] Removing a Created TO restores a singleton plan
- [ ] Dispatch one plan; second plan on the same vehicle cannot dispatch while the first is actively serving
- [ ] Start trip fans out driving status to all members
- [ ] Gate-in by vehicle lists both eligible TOs, both checked; uncheck one → only the checked TO goes `at_source`
- [ ] One scale-in for the visit; two CC LUP assignments (one per TO); two load events
- [ ] Gate-out blocked while one member TO is still loading; allowed after both complete
- [ ] Vendor TO / bundle path unchanged
- [ ] Existing single-TO FB-011: vehicle still cannot serve two **different plans** at once

---

## Definition of Done

- [ ] All acceptance criteria AC-0–AC-6 met
- [ ] Sub-tasks VP-01-1 … VP-01-9 completed
- [ ] Existing own-fleet TOs backfilled to default plans; single-TO happy path still green
- [ ] Yard is vehicle-first; scale once; CC LUP per TO; individual TO status preserved
- [ ] Unit tests cover default plan, multi-TR membership, Created-only window, visit uncheck, per-TO LUP, gate-out completeness
- [ ] Story status updated for Sprint 9 tracking

---

## Out of scope

- Vendor-fleet Vehicle Plans (bundle remains N TOs / N vehicles)
- System-forced same-route validation (planner owns membership)
- Splitting weighbridge net weight across TOs (billed qty stays on TO lines / load capture)
- GT-02 on-demand TOs joining a multi-TO plan (they keep singleton default plans)
- Replacing `Trip` with the plan (v1: still one trip per TO, same vehicle)
- Changing TO canonical status names

---

## Notes

- **Capacity:** warn if allocated weight exceeds vehicle capacity; do not block in v1 (planner decides).
- **Unchecked TOs:** cannot get a second active visit at the same POI until the current visit closes (`uniq_active_gate_visit_vehicle_poi`).
- **Milk-run:** allowed as planner membership. A visit at POI X only lists members eligible **at X**. Dest gate-out closes only visit members whose dest work is done.
- Suggested PRD / rules delta (BA, VP-01-1): TCR-001/002 apply per **plan**, not per TO inside a plan; TCR-003 unchanged.
