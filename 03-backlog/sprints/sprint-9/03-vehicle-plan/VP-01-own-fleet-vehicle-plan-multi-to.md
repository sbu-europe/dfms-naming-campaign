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
  - TO-01 — Transport Order creation (a new TO still starts on its own one-TO plan)
  - TO-02 — Own-fleet assignment (vehicle and driver are set on the plan)
  - YARD-01 / GT-01 / SC-01 / CC-01 / LD-01 — yard visit starts from the vehicle; each TO still keeps its own status
---

# VP-01 — Own-Fleet Vehicle Plan (Multi-TO on One Vehicle)

## User Story

**As a** Transport Planner  
**I want to** put one or more Created own-fleet transport orders onto a **vehicle plan** (I choose the vehicle and which orders go on it)  
**So that** one truck can carry orders from the same requisition or from different requisitions, without pretending they are a single order.

**As a** yard operator (Gate, Scale, Command Center, Loading/Unloading)  
**I want to** start the visit by **selecting the vehicle**, then confirm which of that plan’s eligible orders are on this visit  
**So that** the truck is weighed once, Command Center assigns a loading or unloading point **per order**, and each order still keeps its own status.

---

## Business Context

Today every yard visit and dispatch is **one transport order**. Planners can already assign the same vehicle to several orders while planning, but the truck can only **run one order at a time**, and gate-in starts from the order, not the vehicle. That blocks a real split load: one vehicle, several orders, one presence at a site.

This story adds a **Vehicle Plan**. Every own-fleet order still exists and still has its own status, proof of delivery, quality check, and lines. Creating an order also creates a **default plan with that one order**. The Transport Planner may add other **Created** orders (from any requisition) onto a plan for a vehicle. Mix of origin and destination is the planner’s call — the system does not require the same route.

At the yard the operator picks the **vehicle**. Eligible orders on that plan at this site are listed, all selected by default; the operator may uncheck. One gate-in, one weigh-in and weigh-out for the truck. After weigh-in, Command Center assigns a loading or unloading point **per included order**. Load, unload, and quality check stay per order. Each order’s status still moves on its own.

**Vendor fleet is out of scope** (vendor still uses one vehicle per order / existing vendor grouping).

---

## Locked decisions (PO)

| Topic | Decision |
|---|---|
| Plan membership / route | Transport Planner decides which Created orders belong on a plan. No system rule that they must share origin, destination, or requisition. |
| Gate-in order list | Show all eligible orders for this vehicle at this site; default all selected; operator may uncheck. Which orders are on this visit is explicit. |
| Fleet | Own fleet only. |
| Weigh vs load | Weigh **once per visit** (the truck). Then Command Center assigns a loading or unloading point **per order**. Load, unload, and quality check remain per order. |
| When orders may join / leave a plan | Only orders in **Created** may be added or removed. |
| Different requisitions | Yes — one plan may hold orders from more than one requisition. |

---

## Acceptance Criteria

### AC-0 — Default plan (single order unchanged)

- [ ] Creating an own-fleet transport order **always** creates a Vehicle Plan with that order as the only member (no vehicle until one is assigned).
- [ ] Today’s single-order path still works: create → assign → dispatch → yard. The plan is in the background; the planner does not fill in a second document for one order.
- [ ] An order belongs to **exactly one** plan at a time.
- [ ] Vendor-fleet create, grouping, and bid are unchanged.

### AC-1 — Planner builds a multi-order plan

- [ ] Transport Planner can create or open a Vehicle Plan, choose an **own-fleet vehicle**, and add **Created** orders (same or different requisitions).
- [ ] Adding an order **moves** it off its old one-order plan onto this plan. Empty leftover plans are removed.
- [ ] Planner can **remove** a Created order from a multi-order plan. That order goes back to a default one-order plan (still Created; vehicle cleared if it only came from this plan).
- [ ] Orders that are not Created (Assigned, Ready for dispatch, on the road, in the yard, Closed, Cancelled, and so on) **cannot** be added or removed.
- [ ] Mixed origin, destination, or load/unload pattern is **allowed**. Weight vs vehicle capacity may **warn**; it must not block the planner unless a later rule is added.

### AC-2 — Assignment and dispatch apply to the whole plan (own fleet)

- [ ] Vehicle, driver, and helpers on a plan are the crew for **all** member orders. The same vehicle and driver also show on each order for existing screens.
- [ ] A vehicle runs **one plan at a time**. Orders on that plan may be in the yard together (at origin to load, at destination to unload); they do not block each other for sharing the truck.
- [ ] A second plan for the same vehicle cannot be dispatched while this plan is already dispatched, on the road, or in the yard.
- [ ] Supervisor / TDO dispatch releases the **plan**. All current member orders become Ready for dispatch together.
- [ ] When the driver starts the trip on the plan, **every member order** moves to its first on-the-road status (usually driving to origin; some inbound finished-goods orders drive to destination first).

### AC-3 — Gate-in starts from the vehicle

- [ ] Gate-in starts by selecting the **vehicle** at this site (not by picking an order first).
- [ ] The system loads that vehicle’s **active plan** and lists member orders **eligible at this site** (the order is on the way here to load or to unload).
- [ ] All eligible orders are **selected by default**; the gateman may uncheck. At least one order must stay selected.
- [ ] One visit is created for this vehicle at this site. Only the selected orders are on the visit. A vehicle cannot have a second open visit at the same site.
- [ ] Gate-in is recorded **once** for the vehicle. Each **selected** order moves to at origin (to load) or at destination (to unload), as today. Unchecked orders are **not** moved and are not on this visit.

### AC-4 — Weigh once; Command Center assigns a bay per order

- [ ] Weigh-in and weigh-out are **one cycle per visit** (truck weights). They are not captured per order.
- [ ] After weigh-in, Command Center sees **one queue row for the visit**, with the visit’s orders listed.
- [ ] Command Center assigns a loading or unloading point **to each visit order** (the officer may pick the same bay for two orders if they choose).
- [ ] Load / unload stay **per order**. Quality check stays **per order** when that order’s lane requires it.
- [ ] Shared steps (weigh-in, weigh-out, gate-out) update **every order on the visit**. Order-specific steps (bay assigned, loading, quality check) update **only that order**.

### AC-5 — Gate-out and individual order status

- [ ] Gate-out is **once per visit** (the vehicle).
- [ ] Gate-out is blocked until **every order on this visit** has finished the work required **at this site** (load or unload complete; quality check if that order needs it).
- [ ] On origin gate-out, each visit order moves to driving to destination (as today).
- [ ] On destination gate-out, each visit order is Closed if its destination work is complete (as today).
- [ ] An eligible order that was **unchecked** at gate-in is unchanged by this visit. It can only be served in a **later** visit after this one is closed.
- [ ] Each order keeps its own timeline, proof of delivery, quality-check outcome, and commercial close. The plan is **completed** when all member orders are Closed or Cancelled.

### AC-6 — Audit

- [ ] Creating a plan, adding an order, removing an order, dispatch, and which orders were included at gate-in are audited with actor and timestamp.
- [ ] Existing order status-change history remains the source of truth for each order’s lifecycle.

---

## Functional Flows

Happy path and every branch implied by the locked decisions. Vendor fleet and gate-created on-demand orders joining a multi-order plan stay out of scope (called out as rejects).

---

### Planning

#### Flow A — Single order (default plan)

```
Transport Planner creates own-fleet order TO-A
  → Vehicle Plan P1 created with TO-A only (no vehicle yet)
TDO assigns vehicle / driver / milestones on TO-A (saved on P1)
  → dispatch P1 → start trip
Gate: select vehicle → only TO-A listed → gate-in
  → weigh once → Command Center assigns a bay for TO-A → load/unload TO-A → weigh-out → gate-out
TO-A status behaves as today
```

#### Flow B — Same requisition, two Created orders on one vehicle

```
Planner creates TO-A and TO-B from requisition TR-1 (each gets a default plan)
Planner opens a plan for vehicle V, adds TO-A and TO-B
  → both on one plan; empty leftover default plans removed
TDO assigns driver, dispatch, start trip
  → both orders move to their first on-the-road status
```

#### Flow C — Different requisitions on one vehicle

```
TO-A (requisition TR-1, Created) default plan P1
TO-B (requisition TR-2, Created) default plan P2
Planner adds both to a plan for vehicle V
  → both members; P2 removed if empty
Dispatch / start trip update TO-A and TO-B separately (each keeps its own status)
```

#### Flow D — Mixed origin / destination (planner choice)

```
TO-A origin=Depot-1 destination=Depot-2 (finished goods outbound, Created)
TO-B origin=Depot-3 destination=Depot-1 (raw material inbound, Created)
Planner puts both on vehicle V’s plan
  → accepted (no same-route rule)
Weight vs vehicle may warn; plan still saves
Each order still has its own origin, destination, and later yard eligibility
```

#### Flow E — Remove a Created order from a multi-order plan

```
Plan P has members TO-A, TO-B (both Created)
Planner removes TO-B
  → TO-B gets a new default one-order plan (Created; vehicle cleared)
  → P remains with TO-A only
```

#### Flow F — Move a Created order from one draft plan to another

```
TO-A is on draft plan P1 (vehicle V1 or none)
Planner adds TO-A to plan P2 (vehicle V2)
  → TO-A leaves P1; P1 deleted if it has no members left
  → TO-A is only on P2
```

#### Flow G — Cancel a Created order that is on a plan

```
Plan P members: TO-A, TO-B (Created)
Planner / TDO cancels TO-B
  → TO-B Cancelled; removed from further planning
  → P continues with TO-A
  → if TO-B was the last member, P is closed with no remaining Created members
```

---

### Assignment and dispatch

#### Flow H — Crew on the plan applies to all members

```
Plan P members TO-A, TO-B
TDO sets vehicle V, driver D, helpers on P
  → both orders show vehicle V
  → same driver / helpers on both orders
```

#### Flow I — Dispatch and start trip apply to every member

```
Supervisor / TDO dispatches plan P
  → every current member → Ready for dispatch
Driver starts trip on P
  → every member gets its first on-the-road status
     (usually driving to origin; some inbound finished-goods orders drive to destination first)
```

#### Flow J — Second plan on the same vehicle cannot dispatch while the first is in progress

```
Plan P1 for vehicle V is Ready for dispatch, on the road, or in the yard
Plan P2 also has vehicle V (draft, Created orders)
TDO tries to dispatch P2
  → rejected (one in-progress plan per vehicle)
P2 can dispatch only after P1 is finished (all members Closed/Cancelled, or the plan completed)
```

#### Flow K — A later plan may be drafted on the same vehicle

```
P1 is still Created/Assigned (not dispatched)
Planner builds P2 on the same vehicle with other Created orders
  → allowed while planning
Only one of P1 / P2 may be dispatched at a time (Flow J)
```

---

### Origin yard (vehicle first)

#### Flow L — Two orders, same origin site, both included

```
Gateman selects vehicle V at Depot-1
  → eligible: TO-A, TO-B (origin = Depot-1, driving to origin)
  → both selected; gateman leaves both on
One gate-in → TO-A and TO-B at origin
One weigh-in (vehicle)
Command Center assigns bay 1 to TO-A, bay 2 to TO-B
Loading officer loads TO-A then TO-B (each order’s yard progress independent)
One weigh-out → both visit orders updated
One gate-out → both driving to destination
```

#### Flow M — Same loading point for two orders

```
After weigh-in, Command Center assigns the same bay to TO-A and TO-B
  → allowed (officer choice)
Load events still per order (TO-A complete vs TO-B still loading can differ)
Gate-out still waits for both visit orders
```

#### Flow N — Operator unchecks an order at gate-in

```
Eligible: TO-A, TO-B
Gateman unchecks TO-B, confirms TO-A
Visit = TO-A only
TO-A → at origin; TO-B stays driving to origin
Yard work, weigh-out, gate-out apply to TO-A only
TO-B cannot start another visit at this site until this visit is closed
After gate-out, gateman selects V again → TO-B listed → new visit
```

#### Flow O — Only one member is eligible at this site

```
Plan members: TO-A origin=Depot-1, TO-B origin=Depot-3
Vehicle at Depot-1, both driving to origin
Gate list shows TO-A only (TO-B is not for this site)
Gate-in / weigh / Command Center / load / gate-out apply to TO-A
TO-B stays driving to origin until the vehicle visits Depot-3
```

#### Flow P — Independent load progress; gate-out blocked

```
Visit members TO-A, TO-B at origin
TO-A load complete; TO-B still loading
Gateman tries gate-out
  → blocked until TO-B (and any required quality check) is complete for this site
After TO-B load complete → weigh-out (if not already) → gate-out allowed
  → both driving to destination
```

#### Flow Q — Uncheck all eligible orders rejected

```
Eligible: TO-A, TO-B
Gateman unchecks both
  → rejected; at least one order must remain selected
No visit created; no order status change
```

---

### Destination yard

#### Flow R — Both orders drop at the same destination

```
Vehicle at Depot-2; TO-A and TO-B destination = Depot-2, driving to destination
Gateman selects V → both listed, both left on
One gate-in → both at destination
One weigh-in
Command Center assigns an unloading point per order
Unload (and quality check if that order requires it) per order
One weigh-out → both visit orders updated
One gate-out → each visit order Closed (destination work complete)
Plan completed when all members are Closed or Cancelled
```

#### Flow S — Drop at more than one destination: only some members unload here

```
TO-A destination=Depot-2, TO-B destination=Depot-4; both driving to destination
Vehicle gates in at Depot-2
  → eligible: TO-A only
Visit = TO-A
Unload / quality check / destination gate-out close TO-A
TO-B still driving to destination until Depot-4
Plan stays in progress until TO-B is also Closed or Cancelled
```

#### Flow T — Raw-material destination quality check per order (pass)

```
Visit members include raw-material inbound TO-A at destination
Weigh-in → Command Center flags TO-A for quality check; TO-B (finished goods) has no quality check
Quality check pass on TO-A → Command Center assigns unload point for TO-A
Unload TO-A; unload TO-B (no quality check)
Gate-out after every visit order’s destination work is done
  → each member Closed (as today)
```

#### Flow U — Raw-material destination quality check fail on one member

```
Visit members TO-A (raw material, quality check required), TO-B (no quality check)
TO-B unloaded; TO-A quality check failed / resampling
Gate-out
  → blocked while TO-A has not finished destination work for this visit
After quality check pass + unload TO-A (or that order is cancelled / cleared per existing quality-check rules)
  → gate-out allowed for the visit
TO-B was already unload-complete; destination gate-out still applies to remaining visit orders
```

---

### Mixed-route visit at one site

#### Flow V — Load one order and unload another at the same site

```
TO-A origin=Depot-1 (driving to origin)
TO-B destination=Depot-1 (driving to destination)
Same plan, vehicle at Depot-1
Gate list: TO-A and TO-B (both eligible), default both on
One gate-in
  → TO-A at origin; TO-B at destination
One weigh-in (vehicle)
Command Center assigns a loading point to TO-A and an unloading point to TO-B
Load TO-A; unload TO-B (quality check on TO-B if required)
One weigh-out
Gate-out when both visit orders have finished this site’s required work
  → TO-A → driving to destination
  → TO-B → Closed (destination complete)
```

#### Flow W — Gateman includes only the load order, not the destination order

```
Same eligibility as Flow V
Gateman unchecks TO-B, keeps TO-A
Visit = TO-A only (origin load)
TO-B stays driving to destination
After this visit closes, a new gate-in can include TO-B
```

---

### Load/unload pattern (still per order)

#### Flow X — Finished-goods outbound member (load at origin, unload at destination)

```
Member TO-A finished-goods outbound
Origin visit: load TO-A → origin gate-out → driving to destination
Destination visit: unload TO-A → destination gate-out → Closed
Other members on the plan follow their own pattern in the same or later visits
```

#### Flow Y — Finished-goods inbound member (destination only)

```
Member TO-A finished-goods inbound: first on-the-road status is driving to destination
Start trip applies that status (not driving to origin)
First yard visit is destination: unload (no origin load for this order)
Other members on the plan may still have an origin stop
```

#### Flow Z — Raw-material inbound member (load at origin, unload + quality check at destination)

```
Member TO-A raw-material inbound
Origin visit: load TO-A (no quality check at origin)
Destination visit: quality check then unload TO-A
Sibling orders keep their own quality-check flags
```

---

### Rejects and guards

#### Flow AA — Created-only planning window

```
TO-C is Assigned or later
Planner tries to add TO-C to a plan
  → rejected; only Created orders are available
Planner tries to remove TO-A after dispatch (TO-A is no longer Created)
  → rejected
```

#### Flow AB — Vendor order cannot join an own-fleet Vehicle Plan

```
Planner tries to add a vendor-fleet order to an own-fleet plan
  → rejected
Vendor grouping / bid path unchanged
```

#### Flow AC — Gate-created on-demand order stays on its one-order plan

```
Gate creates an on-demand order
  → default one-order plan only
Planner cannot add it to a multi-order Vehicle Plan (out of scope)
```

#### Flow AD — Vehicle with no eligible orders at this site

```
Gateman selects vehicle V
Active plan exists but no member is on the way to this site to load or unload
  → empty eligible list; gate-in not allowed
```

#### Flow AE — Second open visit for the same vehicle + site

```
A visit is already open for vehicle V at this site
Gateman tries another gate-in for V
  → rejected (one open visit per vehicle at a site)
```

#### Flow AF — Yard steps out of order (existing yard sequence)

```
Visit members mid-load
Weigh-out or gate-out attempted out of order
  → existing yard sequence still applies, checked against every visit order where the step is shared
```

#### Flow AG — Order cancelled after it was included in a visit

```
Visit members TO-A, TO-B; TO-B cancelled mid-visit (existing cancel rules if allowed)
  → TO-B no longer blocks gate-out
  → remaining members must still complete this site’s work
```

---

## Business Rules

| ID | Rule |
|---|---|
| BR-VP01-001 | Every own-fleet order belongs to exactly one Vehicle Plan. Creating an order always opens a default one-order plan. |
| BR-VP01-002 | Only **Created** orders may be added to or removed from a plan. |
| BR-VP01-003 | Transport Planner decides membership. Mixed origin / destination / requisition / load-unload pattern is allowed. |
| BR-VP01-004 | Own fleet only. Vendor grouping and vendor orders are not Vehicle Plans. |
| BR-VP01-005 | One **in-progress plan** per vehicle. Orders on the **same** plan may share the truck in the yard; a second plan for that vehicle cannot start until the first is finished. |
| BR-VP01-006 | Yard visit is one open visit per vehicle at a site. Gate and weigh are for the truck; commercial status stays on each order. |
| BR-VP01-007 | Visit membership is the orders the gateman left selected. Unchecked eligible orders are not moved. |
| BR-VP01-008 | After weigh-in, Command Center assigns a loading or unloading point **per visit order**. |
| BR-VP01-009 | Gate-out requires every **visit order** to have completed this site’s required yard work. |
| BR-VP01-010 | Each order keeps its own status, proof of delivery, and quality check. The “one truck, one active job” rule applies **between plans**, not between orders on the same plan. |

---

## Sub-tasks

| # | Sub-task | Description | Priority | Status |
|---|---|---|---|---|
| VP-01-1 | Specs | Update transport rules so one truck / one active job is per **plan**; note Vehicle Plan on order create, assignment, and gate | High | **Not done** |
| VP-01-2 | Data | Store vehicle plans and which orders belong to them; each existing own-fleet order gets a one-order plan | High | **Not done** |
| VP-01-3 | Default + membership | Order create → default plan; planner add/remove Created orders; vehicle on the plan also shows on each member | High | **Not done** |
| VP-01-4 | One plan in progress + dispatch | One in-progress plan per vehicle; dispatch and start trip update all members | High | **Not done** |
| VP-01-5 | Gate-in | Start from the vehicle; eligible order checklist (default all on); visit members; selected orders move to in-yard | High | **Not done** |
| VP-01-6 | Weigh + Command Center | One weigh cycle per visit; queue by visit; Command Center assigns a bay **per member order**; weigh updates all visit orders | High | **Not done** |
| VP-01-7 | Load/unload + gate-out | Load/unload per order; gate-out blocked until all visit orders complete this site; gate-out updates all visit orders | High | **Not done** |
| VP-01-8 | Screens | Planner plan screen (vehicle → order picker); gate form is vehicle then order checklist; Command Center visit shows member orders | High | **Not done** |
| VP-01-9 | Audit + tests | Plan and visit-membership audit; tests for default plan, mixed requisition, Created-only, uncheck, bay per order, gate-out block | High | **Not done** |

---

## Dependencies

| Dependency | Notes |
|---|---|
| TO-01 / Transport order | Keep the order as the commercial unit; every own-fleet order must sit on a plan |
| TO-02 / Own-fleet assignment | Vehicle, driver, and helpers are set on the plan |
| Current “one truck, one active job” check | Change from one **order** at a time to one **plan** at a time |
| Open yard visit unique per vehicle + site | Keep; record the plan and which orders are on the visit |
| Scale / Command Center / Load-unload | Weigh stays one per visit; bay assignment must be per order |
| Existing conjoinment rules | Product text still says sequential single order — VP-01-1 must say that does not apply between members of the same plan |
| Vendor order grouping | Do not reuse; vendor still maps many orders to many vehicles |

---

## Test Plan

- [ ] Create one own-fleet order → default plan with one member; single-order yard still completes
- [ ] Add two Created orders from different requisitions to one vehicle plan; both show as members
- [ ] Mixed origin/destination orders can sit on one plan (planner choice)
- [ ] Cannot add an Assigned (or later) order; cannot remove a member after it leaves Created
- [ ] Removing a Created order restores a one-order plan
- [ ] Dispatch one plan; second plan on the same vehicle cannot dispatch while the first is in progress
- [ ] Start trip moves every member to its first on-the-road status
- [ ] Gate-in by vehicle lists both eligible orders, both selected; uncheck one → only the checked order goes to at origin
- [ ] One weigh-in for the visit; two Command Center bay assignments (one per order); two load events
- [ ] Gate-out blocked while one visit order is still loading; allowed after both complete
- [ ] Vendor order / grouping path unchanged
- [ ] A vehicle still cannot run two **different plans** at once

---

## Definition of Done

- [ ] All acceptance criteria AC-0–AC-6 met
- [ ] Sub-tasks VP-01-1 … VP-01-9 completed
- [ ] Existing own-fleet orders each have a default plan; single-order happy path still works
- [ ] Yard starts from the vehicle; weigh once; Command Center bay per order; individual order status preserved
- [ ] Tests cover default plan, multi-requisition membership, Created-only window, visit uncheck, bay per order, gate-out completeness
- [ ] Story status updated for Sprint 9 tracking

---

## Out of scope

- Vendor-fleet Vehicle Plans (vendor grouping remains many orders / many vehicles)
- System-forced same-route checks (planner owns membership)
- Splitting weighbridge net weight across orders (billed quantity stays on order lines / load capture)
- Gate-created on-demand orders joining a multi-order plan (they keep one-order default plans)
- Replacing the trip record with the plan (v1: still one trip per order, same vehicle)
- Renaming existing order status names

---

## Notes

- **Capacity:** warn if allocated weight exceeds vehicle capacity; do not block in v1 (planner decides).
- **Unchecked orders:** cannot start a second open visit at the same site until the current visit closes.
- **More than one drop:** allowed as planner membership. A visit at site X only lists members eligible **at X**. Destination gate-out closes only visit members whose destination work is done.
- Suggested rules update (VP-01-1): “one truck, one active job” applies per **plan**, not per order inside a plan. Each order still keeps its own status, proof of delivery, and quality check.
