---
module: 05-transport
specification: VP-01 Own-Fleet Vehicle Plan — Multi-TO on One Vehicle with Vehicle-First Yard — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 2
related_stories: VP-01, TO-01, TO-02, GT-01, SC-01, CC-01, LD-01
source_spec: ../../../../../03-backlog/stories-phase-2/011-Own-Fleet Vehicle Plan/VP-01-own-fleet-vehicle-plan-multi-to.md
implementation_reference:
  - apps/transport/admin.py (TO create / assignment — one TO per yard visit today)
  - apps/transport/vehicle_planning_views.py (`/admin/transport/vehicle-planning/` — TO assignment board, not Vehicle Plan membership)
  - apps/operations/gate/admin.py (GateInAdmin add_fieldsets start from transport_order)
  - templates/admin/operations/gatein/change_form.html
  - apps/operations/gate/gate_services.py (one open visit per vehicle at POI; TO-linked gate-in)
last_updated: 2026-09-14
playwright_mcp: true
---

# VP-01 — Own-Fleet Vehicle Plan (Multi-TO) — E2E Scenario Plan (Django Admin SSR)

Target runner: **Playwright MCP** against seeded Nourish (`docs/guides/playwright-mcp-admin.md`).  
Credentials: Transport Planner, Driver Supervisor, Gateman, Scaling Operator, Command Center Officer, Loading Personnel.

**Out of scope:** Vendor-fleet Vehicle Plans; splitting weighbridge net across orders; gate-created on-demand TOs joining a multi-order plan; driver mobile trip start (admin **My trips** / supervisor dispatch only if those screens exist); REST APIs.

> **Code status (2026-09-14):** No Vehicle Plan model. **Vehicle planning** is the existing TO-assignment board. **Vehicle Entry (Gate-In)** is TO-first (`transport_order` on `GateInAdmin`). Cases describe **post-VP-01** admin behaviour. Do not treat current one-TO-per-visit as a pass for this plan.

## Seed prerequisites

| Item | Notes |
|------|--------|
| Planner | `transport.planner1.nourish@yopmail.com` |
| Yard | Gateman / Scaling / CC / Loading at the same working site (`Working site`) |
| Orders | ≥2 **Created** own-fleet TOs from **different** requisitions, mixed origin/destination allowed; plus one Assigned/later TO for negative add; wipe `MCP-VP01-` |
| Vehicle | One own-fleet vehicle with capacity; a second plan/vehicle for the “one in-progress plan” block |
| Vendor control | One vendor-fleet TO/grouping path must remain unchanged (TC22) |
| Chain | Prefer completing yard on a dedicated MCP vehicle so seed TOs are not reused |

## A — Default plan (AC-0)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Creating an own-fleet TO creates a one-order Vehicle Plan | As **Transport Planner**, create an own-fleet TO (**Transport orders → Add** / create-from-TR). Assert a Vehicle Plan exists with that TO as the only member and **no vehicle** until assigned. Assert the planner does not fill a second document for the single-order path. | P0 | Planned |
| TC02 | Single-order create → assign → dispatch → yard still works | On the TC01 order, assign vehicle/driver (existing planning), dispatch, and complete a one-order yard visit. Assert TO lifecycle matches today’s single-order path; plan stays in the background. | P0 | Planned |
| TC03 | An order belongs to exactly one plan | After TC06 move, open the order. Assert it is a member of the destination plan only (not still on the leftover one-order plan). | P0 | Planned |

## B — Planner membership (AC-1)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC04 | Planner builds a multi-order plan (mixed requisitions) | As Transport Planner, open **Vehicle Plan** (proposed; do not confuse with **Vehicle planning**). Choose an **own-fleet vehicle**. Add two **Created** orders from different requisitions. Assert both listed as members. Mixed origin/destination is allowed. | P0 | Planned |
| TC05 | Capacity may warn but not block | If allocated weight exceeds vehicle capacity, assert a **warning**; **Save** still succeeds (v1). | P1 | Planned |
| TC06 | Adding an order moves it off its default plan | Add a Created one-order TO onto the multi-order plan. Assert it leaves the old plan; empty leftover plans are gone. | P0 | Planned |
| TC07 | Remove Created order restores one-order plan | Remove one Created member. Assert it returns to a default one-order plan, still **Created**; vehicle cleared if it only came from this plan. | P0 | Planned |
| TC08 | Non-Created orders cannot be added or removed | Attempt to add or remove an **Assigned** (or later / Closed / Cancelled) TO. Assert blocked. | P0 | Planned |

## C — Assignment and dispatch (AC-2)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC09 | Vehicle and driver apply to all members | Assign vehicle, driver, helpers on the plan. Open each member TO. Assert the same vehicle and driver show on existing TO screens. | P0 | Planned |
| TC10 | Dispatch releases the whole plan | As Supervisor / TDO (or the admin dispatch action used today), dispatch the plan. Assert **all** current members become **Ready for dispatch** together. | P0 | Planned |
| TC11 | Start trip moves every member on-the-road | Start the trip on the plan (admin trip-start / My trips if that is the SSR path). Assert every member moves to its first on-the-road status. | P0 | Planned |
| TC12 | Second plan on the same vehicle cannot dispatch while first is in progress | With plan A dispatched / on the road / in the yard, attempt to dispatch plan B for the **same** vehicle. Assert blocked. Orders on plan A may share the truck in the yard. | P0 | Planned |

## D — Vehicle-first gate-in (AC-3)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC13 | Gate-in starts from the vehicle | As **Gateman**, **Gate → Vehicle Entry (Gate-In)** (`/admin/operations/gatein/add/`). Assert the first control is **vehicle** at this site, not picking a TO first. | P0 | Planned |
| TC14 | Eligible orders listed, all selected by default | Select the plan’s vehicle. Assert member orders **eligible at this site** are listed and **checked**. Uncheck is allowed; unchecking **all** is blocked (at least one must stay selected). | P0 | Planned |
| TC15 | Uncheck — only selected orders move into the visit | Uncheck one of two eligible orders. Submit gate-in. Assert **one** visit for the vehicle; only the checked order moves to at origin / at destination; unchecked order status unchanged and not on this visit. Assert no second open visit for the same vehicle at this site. | P0 | Planned |

## E — Weigh once; CC bay per order (AC-4)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC16 | One weigh-in / weigh-out per visit | As **Scaling Operator**, record **Scale-In** then later **Scale-Out** for the visit. Assert one truck cycle — not a weigh per order. Shared weigh updates **every order on the visit**. | P0 | Planned |
| TC17 | Command Center one queue row; bay per visit order | After weigh-in, as **Command Center Officer**, **Bay Assignments**. Assert **one queue row for the visit** listing visit orders. Assign a loading/unloading point **per order** (same bay on both is allowed). Assert load/unload/QC remain per order. | P0 | Planned |
| TC18 | Order-specific steps do not update sibling orders | Complete bay assignment / loading / QC on order A only. Assert order B is unchanged for those steps; shared weigh/gate-out still apply to both when those events run. | P0 | Planned |

## F — Gate-out and order lifecycle (AC-5)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC19 | Gate-out blocked until every visit order finished this site | As **Gateman**, **Vehicle Exit (Gate-Out)** while one visit order is still loading/unloading (or QC pending if required). Assert blocked. Complete the remaining order. Assert gate-out **once** for the vehicle succeeds. | P0 | Planned |
| TC20 | Origin vs destination gate-out status | On origin gate-out, assert each visit order moves to driving to destination (as today). On destination gate-out, assert each visit order **Closed** if destination work is complete. | P0 | Planned |
| TC21 | Unchecked order served only after this visit closes | After TC15, attempt a second open visit at the same site for the unchecked order while the first visit is open. Assert blocked. After gate-out of the first visit, gate-in the remaining order on a later visit. | P0 | Planned |
| TC22 | Each order keeps its own timeline; plan completes when all Closed/Cancelled | After yard, assert each TO has its own status history, POD, and QC outcome. When all members are Closed or Cancelled, assert the plan is **completed**. | P1 | Planned |

## G — Vendor, audit (AC-0, AC-6)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC23 | Vendor-fleet create / grouping / bid unchanged | As planner/TDO on a **vendor-fleet** TO, assert create, grouping, and bid paths are unchanged (no Vehicle Plan membership UI required). | P0 | Planned |
| TC24 | Audit plan membership and gate-in inclusion | After create plan, add/remove, dispatch, and gate-in with an unchecked order, open **Audit Logs**. Assert actor + timestamp for those events, including which orders were included at gate-in. Order status-change history remains the TO lifecycle source of truth. | P1 | Planned |

## Implementation Notes (Playwright + Django Admin SSR)

- Admin SSR only. Cross-role: planner membership → supervisor dispatch → gateman → scaling → CC → loading → gateman out. Use distinct seeded users.
- **Do not** use **Vehicle planning** (`/admin/transport/vehicle-planning/`) as the Vehicle Plan membership screen unless implementation explicitly extends it — today it is TO assignment.
- Current gate-in: `/admin/operations/gatein/add/` field **transport_order**. After VP-01 the add form must start from **vehicle** then an eligible-order checklist (default all on).
- Other URLs: `/admin/operations/scalein/add/`, `/admin/operations/scaleout/add/`, Command Center **Bay Assignments**, `/admin/operations/gateout/add/`.
- Selectors: `#content-main`, gate change form, `#result_list`, `.messagelist`. Assert persisted TO `status` enums from services if UI badges lag.
- **Known drift:** One TO per gate visit; “one truck, one active job” is per TO not per plan; CC queue is per TO. Vendor grouping must stay separate.
- Unchecked orders cannot start a second open visit at the same site until the current visit closes (`gate_services` already blocks a second open visit per vehicle+POI — keep that, add visit membership).
- Suggested next step: implement Vehicle Plan + vehicle-first gate-in, then run this plan on MCP-prefixed own-fleet TOs; keep existing single-TO gate-in scenarios passing for one-member plans (TC02).
