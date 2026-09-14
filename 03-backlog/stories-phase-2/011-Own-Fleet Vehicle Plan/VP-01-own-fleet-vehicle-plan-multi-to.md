---
jira_key: ~
jira_type: Story
jira_sprint: ~
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
phase: Phase 2
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

- [ ] **Given** an own-fleet transport order being created  
  **When** the order is saved  
  **Then** the system **always** creates a Vehicle Plan with that order as the only member (no vehicle until one is assigned).

- [ ] **Given** a single-order own-fleet path (create → assign → dispatch → yard)  
  **When** the planner works that order  
  **Then** today’s path still works; the plan is in the background and the planner does not fill in a second document for one order.

- [ ] **Given** any transport order  
  **When** it is on a Vehicle Plan  
  **Then** it belongs to **exactly one** plan at a time.

- [ ] **Given** vendor-fleet create, grouping, and bid  
  **When** those flows run after Vehicle Plan exists  
  **Then** they are unchanged.

### AC-1 — Planner builds a multi-order plan

- [ ] **Given** a Transport Planner  
  **When** they create or open a Vehicle Plan  
  **Then** they can choose an **own-fleet vehicle** and add **Created** orders (same or different requisitions).

- [ ] **Given** an order on its default one-order plan  
  **When** the planner adds it to another plan  
  **Then** the order **moves** off its old one-order plan onto this plan, and empty leftover plans are removed.

- [ ] **Given** a Created order on a multi-order plan  
  **When** the planner removes it  
  **Then** that order goes back to a default one-order plan (still Created; vehicle cleared if it only came from this plan).

- [ ] **Given** orders that are not Created (Assigned, Ready for dispatch, on the road, in the yard, Closed, Cancelled, and so on)  
  **When** the planner tries to add or remove them  
  **Then** add and remove are blocked.

- [ ] **Given** orders with mixed origin, destination, or load/unload pattern, including weight vs vehicle capacity  
  **When** the planner puts them on one plan  
  **Then** mixed membership is **allowed**; weight vs capacity may **warn** and must not block the planner unless a later rule is added.

### AC-2 — Assignment and dispatch apply to the whole plan (own fleet)

- [ ] **Given** vehicle, driver, and helpers set on a plan  
  **When** member orders are viewed  
  **Then** that crew applies to **all** member orders, and the same vehicle and driver also show on each order for existing screens.

- [ ] **Given** a vehicle with one in-progress plan  
  **When** member orders are in the yard together (at origin to load, at destination to unload)  
  **Then** the vehicle runs **one plan at a time**; those orders do not block each other for sharing the truck.

- [ ] **Given** a plan already dispatched, on the road, or in the yard  
  **When** a second plan for the same vehicle is dispatched  
  **Then** that second dispatch is blocked.

- [ ] **Given** a plan with current member orders  
  **When** Supervisor / TDO dispatches  
  **Then** they release the **plan** and all current member orders become Ready for dispatch together.

- [ ] **Given** a dispatched plan  
  **When** the driver starts the trip on the plan  
  **Then** **every member order** moves to its first on-the-road status (usually driving to origin; some inbound finished-goods orders drive to destination first).

### AC-3 — Gate-in starts from the vehicle

- [ ] **Given** a gateman at a site  
  **When** they start gate-in  
  **Then** they select the **vehicle** at this site (not by picking an order first).

- [ ] **Given** a selected vehicle with an active plan  
  **When** the system loads gate-in  
  **Then** it lists member orders **eligible at this site** (the order is on the way here to load or to unload).

- [ ] **Given** eligible orders for this vehicle at this site  
  **When** the gateman sees the checklist  
  **Then** all eligible orders are **selected by default**; the gateman may uncheck; at least one order must stay selected.

- [ ] **Given** a vehicle at this site with selected orders  
  **When** gate-in is confirmed  
  **Then** one visit is created for this vehicle at this site; only the selected orders are on the visit; a vehicle cannot have a second open visit at the same site.

- [ ] **Given** eligible orders some of which are unchecked  
  **When** gate-in is recorded  
  **Then** gate-in is recorded **once** for the vehicle; each **selected** order moves to at origin (to load) or at destination (to unload), as today; unchecked orders are **not** moved and are not on this visit.

### AC-4 — Weigh once; Command Center assigns a bay per order

- [ ] **Given** an open visit for a vehicle  
  **When** weigh-in or weigh-out is captured  
  **Then** they are **one cycle per visit** (truck weights) and are not captured per order.

- [ ] **Given** weigh-in has been completed  
  **When** Command Center opens the queue  
  **Then** they see **one queue row for the visit**, with the visit’s orders listed.

- [ ] **Given** a visit with more than one order  
  **When** Command Center assigns a loading or unloading point  
  **Then** they assign it **to each visit order** (the officer may pick the same bay for two orders if they choose).

- [ ] **Given** orders on a visit  
  **When** load, unload, or quality check is performed  
  **Then** load / unload stay **per order**, and quality check stays **per order** when that order’s lane requires it.

- [ ] **Given** shared steps (weigh-in, weigh-out, gate-out) and order-specific steps (bay assigned, loading, quality check)  
  **When** those events occur  
  **Then** shared steps update **every order on the visit**, and order-specific steps update **only that order**.

### AC-5 — Gate-out and individual order status

- [ ] **Given** an open visit  
  **When** gate-out is recorded  
  **Then** it is **once per visit** (the vehicle).

- [ ] **Given** at least one visit order that has not finished the work required **at this site** (load or unload complete; quality check if that order needs it)  
  **When** the gateman attempts gate-out  
  **Then** gate-out is blocked until **every order on this visit** has finished that work.

- [ ] **Given** a visit at origin with all required site work complete  
  **When** gate-out is recorded  
  **Then** each visit order moves to driving to destination (as today).

- [ ] **Given** a visit at destination with destination work complete  
  **When** gate-out is recorded  
  **Then** each visit order is Closed if its destination work is complete (as today).

- [ ] **Given** an eligible order that was **unchecked** at gate-in  
  **When** this visit proceeds and later closes  
  **Then** that order is unchanged by this visit and can only be served in a **later** visit after this one is closed.

- [ ] **Given** member orders on a plan  
  **When** they move through yard, proof of delivery, quality check, and commercial close  
  **Then** each order keeps its own timeline, proof of delivery, quality-check outcome, and commercial close; the plan is **completed** when all member orders are Closed or Cancelled.

### AC-6 — Audit

- [ ] **Given** creating a plan, adding an order, removing an order, dispatch, or choosing which orders were included at gate-in  
  **When** the event is saved  
  **Then** it is audited with actor and timestamp.

- [ ] **Given** existing order status-change history  
  **When** an order’s lifecycle is reviewed  
  **Then** that history remains the source of truth for each order’s lifecycle.

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
- [ ] Story status updated for Phase 2 tracking

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
