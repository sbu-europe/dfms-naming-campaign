---
module: 08-fleet-management
specification: Finished Goods Driver My Trips & Trip Start - Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: DM-01, TLS-01, FB-004, FB-008
source_spec: ../../05-modules/05-transport/transport-lifecycle-pod-sprint4.md
last_updated: 2026-07-16
playwright_mcp: true
---

# Finished Goods — Driver My Trips & Trip Start - E2E Scenario Plan (Django Admin SSR)

Scope: **Driver** viewing **My Trips** (`DriverTransportOrder` admin), execution tabs, read-only trip detail, **Trip Start** from **Ready for Dispatch**, dispatch gate on **Assigned** TOs, and **Transition history** on the trip detail page. Driver Supervisor dispatch, Gate/Scale/CC yard transitions, POD upload, mobile API-only flows, and Audit Log SSR are out of scope except as upstream fixtures.

Target runner: **Playwright MCP** against seeded Nourish tenant (`docs/guides/playwright-mcp-admin.md`).

## Navigation & queue scoping

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Driver sees Trips → My Trips menu | As **Driver** (`driver1@yopmail.com`), log in at `/admin/login/`, select working site if prompted. Assert sidebar **Trips** shows **My Trips** (`/admin/transport/drivertransportorder/?assigned_driver=me`). Open **My Trips**; assert changelist title **My Trips**, execution tabs **Awaiting Dispatch**, **In Progress**, **Completed**, **Closed**, **All**, and columns **TO**, **Flow lane**, **Status**, **Pickup**, **Drop**, **Urgency**, **Updated at**. | P0 | Planned |
| TC02 | Driver sees only own assigned TOs | Prerequisite: two Own Fleet TOs in driver-visible statuses — one assigned to **Driver One** (`driver1@yopmail.com`), one to **Driver Two** (`driver2@yopmail.com`) (fixture via Transport Planner + distinct vehicle/driver). As **driver1**, open **My Trips**. Assert Driver One’s `to_number` is present. Log out; as **driver2**, open **My Trips**. Assert Driver Two’s `to_number` is present and Driver One’s `to_number` is **absent**. Optional: as driver2, direct-navigate to driver1’s change URL — expect permission/404 (queryset is `driver=request.user.driver_profile`). | P0 | Planned |

## Dispatch gate & status display

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC03 | Ready for Dispatch after supervisor release | Prerequisite: Own Fleet TO assigned to **driver1**, DS has released it to **Ready for Dispatch** (`ready_for_dispatch`) via **Skip inspection & dispatch** or **Complete inspection & dispatch** (see `fg-driver-supervisor-dispatch-e2e-scenarios.md`). As **driver1**, open **My Trips** → **In Progress** tab (or **All**). Open the TO row. Assert list/detail status badge **Ready for Dispatch** (`ready_for_dispatch`). | P0 | Planned |
| TC04 | Assigned TO visible but not startable until dispatch | Prerequisite: Own Fleet TO assigned to **driver1** still in **Assigned** (`assigned`) — vehicle + driver + milestones set, **not** yet released by Driver Supervisor. As **driver1**, open **My Trips** → **Awaiting Dispatch** tab. Assert the TO appears with status badge **Assigned**. Open the trip detail. Assert alert **Awaiting supervisor release** (vehicle inspection or dispatch release required). Assert **Current status** shows **Assigned**. Assert **Trip Start** button is **not** shown (no allowed transitions while dispatch-gated). *Rewrite:* legacy expected the TO to be absent from My Trips; current admin lists Assigned TOs under **Awaiting Dispatch**. | P0 | Planned |

## Trip Start happy path

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC05 | Trip Start from Ready for Dispatch | Prerequisite: same TO as TC03 (`ready_for_dispatch`, FG outbound flow lane). As **driver1** on trip detail, assert **Trip Start** button is visible in **Execution** section. Click **Trip Start** (POST `target_status` for lane — FG outbound → `driving_towards_source`). Assert success message `Status updated to Driving Towards Source` (or equivalent messagelist). Assert **Current status** badge **Driving Towards Source** (`driving_towards_source`). Assert **Trip Start** is no longer offered; help text indicates further updates are handled by yard/lifecycle actions. | P0 | Planned |

## Trip detail fields

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC06 | Trip detail shows TO, route, cargo, urgency | Prerequisite: `ready_for_dispatch` TO for **driver1** with line items (fixture from TP chain). As **driver1**, open trip detail. Assert read-only fields: **TO number** (`to_number`), **Origin POI** / **Destination POI** (Route fieldset), **Urgency** (from linked TR), and **Product / quantity** table under Cargo with columns **Product**, **UOM**, **Allocated quantity** (admin `product_summary_display` — not separate free-text Quantity/UOM labels). Assert **Pickup** / **Drop** on changelist match origin/destination POI names. Do **not** require legacy PRD labels “Source POI” / “Destination POI” if admin shows **Origin POI** / **Destination POI**. | P0 | Planned |

## Transition history (audit substitute)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC07 | Trip start recorded in Transition history | After TC05 **Trip Start**, on the same trip detail scroll to **Transition history**. Assert a new row lists transition to `driving_towards_source` (or display label **Driving Towards Source** if rendered) with timestamp and actor name matching **Driver One** / `driver1@yopmail.com`. Do **not** assert global **Audit Logs** menu — driver seed role lacks `MENU_AUDIT_LOGS_VIEW`; backend still writes `driver_transition` audit rows but they are not MCP-verifiable for this actor. | P0 | Planned |

## Implementation Notes (Playwright MCP + Django Admin SSR)

### Scope guardrails

- In scope: Driver **My Trips** changelist + tabs, assigned-driver queryset isolation, dispatch gate on **Assigned**, **Trip Start** from **Ready for Dispatch**, trip detail read-only fields, **Transition history** after start.
- Out of scope: Driver Supervisor dispatch queue (fixture only), yard statuses after trip start (At Source, Loaded, …), POD Records upload, mobile REST `/drivers/me/transport-orders`, Gate/Scale/CC, TP TO creation details, global Audit Log UI, email/GPS/mobile-only AC, Port/RM lane variants unless fixture explicitly uses them.
- Dropped: legacy Audit Log path (FG_DR_007 as written) — no driver SSR access to Audit Logs.

### Roles & credentials

| Actor | Seed email | Use |
|-------|------------|-----|
| Driver (primary) | `driver1@yopmail.com` | Primary actor — maps to seed **Driver One** |
| Driver (isolation) | `driver2@yopmail.com` | TC02 — **Driver Two** |
| Driver Supervisor | `driver.supervisor1@yopmail.com` | Fixture: release Assigned → Ready for Dispatch |
| Transport Planner | `transport.planner1@yopmail.com` | Fixture: Own Fleet TO → Assigned (vehicle, driver, milestones) |

Passwords: `docs/testing/playwright-mcp-credentials.yaml` (`Nourish@1234!` for operational roles).

### Fixture chain

1. Upstream (if no suitable TO): FG PR → TR → DM approve → TP creates Own Fleet TO.
2. Transport Planner: assign **vehicle + driver** (driver1 or driver2) + all required planned milestones → status **Assigned**.
3. For TC03–TC07: Driver Supervisor **Skip inspection & dispatch** (or Start + Complete) → **Ready for Dispatch**.
4. For TC04: stop at **Assigned** — do not dispatch.
5. For TC02: create two Assigned (or later) TOs with different drivers before driver logins.
6. Track `to_number` by session; prefer not mutating unrelated seed TOs. Reuse `ready_for_dispatch` TOs from prior DS MCP runs when available.

### Admin URLs & UI labels (stable)

| Action | Path / control |
|--------|----------------|
| My Trips changelist | `/admin/transport/drivertransportorder/?assigned_driver=me` — **Trips → My Trips** |
| Execution tabs | `?tls_status_tab=awaiting_dispatch` \| `in_progress` \| `completed` \| `closed` \| all |
| Trip detail | `/admin/transport/drivertransportorder/<id>/change/` |
| Trip Start | button **Trip Start** — POST to `…/driver-transition/` with `target_status` |
| Dispatch gate alert | **Awaiting supervisor release** on Assigned detail |
| Transition history | Section on trip detail (not Audit Logs) |

Changelist columns (implemented): TO, Flow lane, Status, Pickup, Drop, Urgency, Updated at.

Detail fieldsets: Transport order (TO number, status, flow lane, urgency), Route (origin/destination POI), Cargo (product table), Vehicle & crew, Planned Milestones (lane-required fields only).

### Status & tab mapping

| Tab | Included statuses |
|-----|-------------------|
| Awaiting Dispatch | `assigned` |
| In Progress | `ready_for_dispatch`, `driving_towards_source`, `at_source`, `loaded_pickup_completed`, `driving_towards_destination`, `at_destination`, `delivered_unloaded`, `in_progress` |
| Completed | `completed` |
| Closed | `closed` |

FG outbound **Trip Start** target: `ready_for_dispatch` → `driving_towards_source`.

### Known implementation alignment / gaps

| Topic | Legacy FG_DR expectation | Current admin |
|-------|--------------------------|---------------|
| Nav | Trips → My Trips | **Trips → My Trips** — correct |
| Non-dispatched TO | Absent from My Trips | **Present** under **Awaiting Dispatch**; **Trip Start** hidden + gate alert |
| Trip Start label | Trip Start | **Trip Start** — correct |
| Post-start status | Driving Towards Source | `driving_towards_source` — correct for FG outbound |
| Detail fields | TO ID, Source/Dest POI, Product, Quantity, Urgency | **TO number**, **Origin/Destination POI**, **Product / quantity** table, **Urgency** |
| Audit | Audit Logs: action “Trip Started” | **Transition history** on detail; audit action `driver_transition` — driver has no Audit Log menu |
| List filter | — | Execution tab filter only (no separate Status sidebar filter) |

### Original ID map (FG_DR → this plan)

| Legacy | This file | Change |
|--------|-----------|--------|
| FG_DR_001 | TC01, TC02 | Added nav smoke; isolation via driver1 vs driver2 |
| FG_DR_002 | TC03 | Tab **In Progress** / badge **Ready for Dispatch** |
| FG_DR_003 | TC05 | Button **Trip Start** + success message |
| FG_DR_004 | TC04 | **Rewrite:** Assigned TO **visible** on **Awaiting Dispatch**; start blocked |
| FG_DR_005 | TC06 | Admin field labels + product table columns |
| FG_DR_006 | TC05 | Folded into Trip Start status assert (duplicate of FG_DR_003) |
| FG_DR_007 | TC07 | **Rewrite:** **Transition history** instead of Audit Logs SSR |

### Suggested next step

Run Playwright MCP against this file in order TC01 → TC02 (fixture) → TC04 (Assigned gate) → TC03 → TC05 → TC06 → TC07, persist results under `tests/e2e/playwright-mcp/fg-driver-trips-artifacts/RESULTS.md`, screenshot failures as `<TC-ID>-failure.png`. Upstream DS dispatch cases: `fg-driver-supervisor-dispatch-e2e-scenarios.md` (TC05 skip path is fastest fixture for `ready_for_dispatch`).
