---
module: 05-transport
specification: Finished Goods Transport Order (Transport Planner) - Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: TO-01, TO-02, FB-008, FB-006, FB-011, DFS-040
source_spec: ../../05-modules/05-transport/transport-order-management-v2.md
last_updated: 2026-07-15
playwright_mcp: true
---

# Finished Goods — Transport Planner Transport Order - E2E Scenario Plan (Django Admin SSR)

Scope: **Transport Planner** viewing the FG TR planning queue, creating **Transport Orders (TOs)** from Available-for-Planning TRs, completing own-fleet **Vehicle / Driver / Planned Milestones** assignment, optional **Live GPS** and **Vehicle planning** surfaces, and Vendor Fleet create handoff. Gate / Scale / Command Center / dispatch execution are out of scope.

Target runner: **Playwright MCP** against seeded Nourish tenant (`docs/guides/playwright-mcp-admin.md`).

## Navigation & planning queue

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Transport Planner sees Transport portal items | As **Transport Planner** (`transport.planner1@yopmail.com`), log in at `/admin/login/`, select working site if prompted. Assert sidebar **Transport** shows **Live GPS**, **Transport requests**, **Transport orders**, **Vehicle planning**, and **TO closure queue**. Assert **Master Data** includes **Vehicles**, **Vehicle Brands**, **Helpers** and **Users** includes **Drivers** when seeded. | P0 | Planned |
| TC02 | Planning queue lists Available for Planning TRs | Prerequisite: at least one FG TR with status **Available for Planning** (`available_for_transport_planning`) — typically after Distribution Manager approval. As TP, open **Transport → Transport requests** (`/admin/requisitions/transportrequisition/`). Assert the row appears with status badge **Available for Planning** (not a long-lived **Approved** badge). Assert **Create TO** / **Create transport order** action is available for creatable statuses. Optional: filter by **Status** / **Urgency** / **TR type**. Do **not** require a separate “Approved only” TP queue. | P0 | Planned |
| TC03 | TO create requires selecting a TR first | As TP, open **Transport → Transport orders** and use **Add** (or navigate to `/admin/transport/transportorder/add/`). Assert redirect to **Create Transport Order — Select TR** (`/admin/transport/transportorder/select-tr/`). Assert **Transport Request** dropdown is required (empty label **— Select a Transport Request —**); submitting without a selection stays on select-TR / does not open create-from-TR. Selecting a creatable TR continues to `/admin/transport/transportorder/create-from-tr/<tr_id>/`. | P0 | Planned |

## Live GPS (separate page)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC04 | Transport Planner can open Live GPS | As TP, open **Transport → Live GPS** (`/admin/tracking/live-gps/`). Assert Live GPS page loads (map/shell present). Do **not** require Live GPS to open as an embedded overlay inside the Create TO form — that context is not implemented. Return to create/plan flows via normal navigation. | P1 | Planned |
| TC05 | Live GPS uses implemented vehicle ops statuses | On Live GPS (with tracked vehicles when available), assert vehicle status presentation uses implemented ops labels (e.g. available / assigned / in-transit family as shown on the map UI), **not** the legacy PRD triad Available / Assigned / Active as the only allowed labels. If no live vehicles exist in the tenant, mark BLOCKED with note — do not fail on empty fleet alone. | P2 | Planned |

## TO create — Own Fleet happy path

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC06 | Create Own Fleet TO with Number of TOs = 1 | Prerequisite: FG TR in `available_for_transport_planning`, `under_planning`, or `partially_allocated` with remaining line qty. As TP, click **Create TO** from the TR queue (or select-TR → create-from-TR). On form: set **Number of TOs** = `1`, **Fleet type** = **Own Fleet**, select a **Vehicle type**, leave **Vehicle** blank, allocate positive **Allocate** qty on at least one product line (≤ Remaining), click **Create Transport Order**. Assert success, generated `to_number`, and status badge **Created** (`created`). | P0 | Planned |
| TC07 | Status is Created immediately after Own Fleet save | After TC06 (or equivalent Own Fleet create), open the new TO on **Transport orders** changelist / change view. Assert status is **Created** immediately; full Vehicle / Driver / milestone planning is not required at create time. | P0 | Planned |
| TC08 | Number of TOs = N creates N TOs with shared plan inputs | On create-from-TR: set **Number of TOs** = `3`, **Fleet type** = Own Fleet, required **Vehicle type**, same allocate qty that fits `qty × 3 ≤ Remaining`, click **Create Transport Orders**. Assert success message lists 3 TO numbers; each has unique `to_number`, shared fleet type / vehicle type / planning inputs, status **Created**. | P0 | Planned |
| TC09 | Vehicle optional at Own Fleet create | On create-from-TR: set Own Fleet, **Vehicle type**, leave **Vehicle** blank (label is **Vehicle**, not “Choose Vehicle”), valid Allocate, submit. Assert TO created successfully without a vehicle FK. | P0 | Planned |

## TO create — validation

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC10 | Block blank Vehicle type | On create-from-TR: set Fleet type (Own or Vendor), leave **Vehicle type** blank / `---------`, fill Number of TOs and a valid Allocate qty, submit. Assert validation error (**Vehicle type is required for transport orders.** or equivalent); no TO created. | P0 | Planned |
| TC11 | Block Allocate exceeding remaining (single TO) | TR line Remaining = R. Set Number of TOs = 1, Allocate = R + N (N > 0), other required fields valid, submit. Assert error that allocated quantity exceeds remaining; TO not created. | P0 | Planned |
| TC12 | Block combined multi-TO allocate exceeding remaining | TR line Remaining = R. Set Number of TOs = N such that per-TO allocate × N > R (e.g. Remaining 100, N=2, Allocate 60 → combined 120), submit. Assert combined / per-TO×N validation blocks create. Separately (optional P1): create first TO with Allocate = 60 then attempt second TO with Allocate = 60 when remaining is 40 — second create blocked. | P0 | Planned |
| TC13 | Block zero allocation on all lines | Fill Number of TOs, Fleet type, Vehicle type; leave all Allocate at `0`, submit. Assert error requiring allocation on one or more lines; no TO created. | P0 | Planned |

## TO create — Vendor Fleet

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC14 | Create Vendor Fleet TO | As TP on create-from-TR: **Fleet type** = **Vendor Fleet**, set required **Vehicle type**, valid Allocate, leave Own Fleet **Vehicle** unused (cleared for vendor), submit. Assert TO created with status **Under Planning** (`under_planning`) — not **Created**. *Product rule:* Vendor TOs hand off to TDO Vendor Fleet after planned milestones are complete (status → Created for TDO queue). Cross-role optional: log in as `tdo.vendor.fleet1@yopmail.com` only after milestones complete if asserting TDO visibility. | P0 | Planned |

## Own Fleet planning (change form)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC15 | Save Trip start on Created TO | Open a **Created** Own Fleet TO (`/admin/transport/transportorder/<id>/change/`). In **Planned Milestones**, set **Trip start** (`planned_start_at`), save. Assert value persisted. Status may remain **Created** if Vehicle / Driver / other milestones incomplete. | P0 | Planned |
| TC16 | Save all 5 FG planned milestones | On a Created Own Fleet TO, set all five: **Trip start**, **Planned source arrival**, **Planned source departure**, **Planned destination arrival**, **Planned destination departure**. Save. Assert all five persist with those admin labels (standalone field is **Trip start**, not “Planned start”; not PRD “Planned Arrival at Source” synonyms). | P0 | Planned |
| TC17 | Assign Vehicle on Own Fleet Assignment | On Created Own Fleet TO, under **Own Fleet Assignment**, select **Vehicle** matching the TO’s **Vehicle type** (active, not Under Maintenance). Save. Assert vehicle saved. There is no separate “Assign Vehicle” screen — assignment is on this change form. | P0 | Planned |
| TC18 | Assign Driver on Own Fleet Assignment | On same TO, select **Driver** (active, not On Leave). Save. Assert driver saved. No separate “Assign Driver” screen. | P0 | Planned |
| TC19 | Helpers optional for planning completion | On a TO with Vehicle + Driver + all required milestones set, leave **Helpers** empty, save. Assert helpers not required to complete planning. Expected status **Assigned** (`assigned`) when readiness is complete (see TC20 for known admin drift). | P0 | Planned |
| TC20 | Created → Assigned only when Vehicle + Driver + milestones complete | On Created Own Fleet TO: (1) set Vehicle only → expect still **Created** (or non-Assigned if incomplete). (2) set Driver without full milestones → expect still not fully planned per service rule `own_fleet_ready_for_assigned_status`. (3) complete all required planned milestones with Vehicle + Driver → expect **Assigned**. *Known gap:* `TransportOrderAdmin.save_model` may set `assigned` when Vehicle + Driver are set even if milestones are incomplete; treat premature **Assigned** without milestones as FAIL (product defect vs readiness panel copy). | P0 | Planned |

## Vehicle / Driver eligibility

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC21 | Vehicle ops status visible on Vehicles master (not dropdown badges) | As TP, open **Master Data → Vehicles** (`/admin/master_data/vehicle/`). Assert list/filter shows **operational status** values such as **No Active TO**, **Scheduled**, **In-transit**, **Under Maintenance**, **Inactive**. Do **not** assert Available / Assigned / Active badges inside the TO **Vehicle** `<select>` (options are registration numbers only). Optional: confirm Live GPS (TC04) for map-side status. | P1 | Planned |
| TC22 | Planning-stage vehicle reuse allowed; actively serving blocked | Prerequisite: vehicle already on another planning-stage Own Fleet TO (Created / Under Planning), not actively serving (`ready_for_dispatch`+). On a new Created TO of matching vehicle type, select that vehicle and save. Assert assignment allowed (FB-011). If a vehicle is actively serving elsewhere, expect validation blocking assignment. | P1 | Planned |
| TC23 | Driver current_state visible on Drivers master | As TP, open **Users → Drivers** (`/admin/users/driver/`). Assert **current state** shows implemented labels: **Available**, **Assigned**, **On Trip** (`on_execution`), **On Leave**. Do **not** require status chips inside the TO **Driver** dropdown (options are name / license strings). | P1 | Planned |
| TC24 | Planning-stage driver reuse allowed; actively serving blocked | Assign a driver already on another planning-stage TO to a new Created TO; expect save allowed unless the driver is actively serving another TO (then validation error). | P1 | Planned |
| TC25 | On Leave driver excluded from TO Driver select | Prerequisite: active driver with `current_state=on_leave`. On Own Fleet TO change form, open **Driver** dropdown. Assert that driver is absent from choices (queryset excludes On Leave). If visible via tamper, save must still reject with On Leave validation. | P0 | Planned |
| TC26 | Under Maintenance vehicle excluded from Vehicle select | Prerequisite: vehicle matching TO vehicle type with `operational_status=under_maintenance`. On create-from-TR **Vehicle** list (after selecting type) and on TO change **Vehicle** list, assert maintenance vehicle absent. Save must reject if forced. | P0 | Planned |

## No TDO Own Fleet

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC27 | No TDO Own Fleet role / queue in FG Own Fleet path | As TP, complete Own Fleet create + assignment on the TO change form (Vehicle, Driver, milestones). Assert there is no menu/queue requiring a **TDO Own Fleet** / `tdo_own_fleet` handoff. Optional: confirm seed credentials have no `tdo_own_fleet` actor. Vendor Fleet TDO remains separate (TC14). | P0 | Planned |

## Implementation Notes (Playwright MCP + Django Admin SSR)

### Scope guardrails

- In scope: TP FG TR planning queue, create-from-TR / select-TR, Own Fleet create + change-form assignment, Vendor create initial status, Live GPS page open, Vehicles/Drivers status visibility on master lists, maintenance / On Leave exclusion, multi-TO allocate validation, no TDO Own Fleet.
- Out of scope: Driver Supervisor dispatch, Gate/Scale/CC/Load/Unload, bidding, Audit Log assertions for SSR TO create/plan, XSS/SQLi, email/notification AC, Port/RM lane variants (mirror later), Vehicle planning multi-step assign wizard beyond menu presence (optional smoke only).
- Dropped from legacy paste: Audit Log “TO Created” / “planning completion” rows (FG_TP_027 / FG_TP_028) — admin SSR create does not write TP-visible Audit Log entries, and `MENU_AUDIT_LOGS_VIEW` is not on the TP seed.

### Roles & credentials

| Actor | Seed email | Use |
|-------|------------|-----|
| Transport Planner | `transport.planner1@yopmail.com` | Primary actor |
| Distribution Manager | `distribution.manager1@yopmail.com` | Fixture: approve TR → Available for Planning (if needed) |
| Distribution Officer | `distribution.officer1@yopmail.com` | Fixture: create TR from submitted PR |
| Depot Officer | `depot.officer1@yopmail.com` | Fixture: submitted FG PR |
| TDO Vendor Fleet | `tdo.vendor.fleet1@yopmail.com` | Optional vendor handoff after milestones |

Passwords: `docs/testing/playwright-mcp-credentials.yaml`.

### Fixture chain

1. Depot Officer → submitted FG PR with remaining qty.
2. Distribution Officer → TR `pending_approval`.
3. Distribution Manager → approve → TR `available_for_transport_planning`.
4. Transport Planner → Create TO (+ optional Own Fleet assignment).

Prefer one `RUN_ID` per MCP session for free-text Notes (`MCP TO <RUN_ID>`).

### Admin URLs & UI labels (stable)

| Action | Path / control |
|--------|----------------|
| TR planning queue | `/admin/requisitions/transportrequisition/` — **Transport → Transport requests** |
| Select TR | `/admin/transport/transportorder/select-tr/` |
| Create from TR | `/admin/transport/transportorder/create-from-tr/<tr_uuid>/` |
| TO list | `/admin/transport/transportorder/` — **Transport → Transport orders** |
| TO change | `/admin/transport/transportorder/<uuid>/change/` |
| Live GPS | `/admin/tracking/live-gps/` |
| Vehicle planning | `/admin/transport/vehicle-planning/` |
| Vehicles | `/admin/master_data/vehicle/` |
| Drivers | `/admin/users/driver/` |
| Create submit | **Create Transport Order** / **Create Transport Orders** (N>1) |
| Create fields | **Number of TOs**, **Fleet type**, **Vehicle type** (required), **Vehicle** (optional Own Fleet), **Allocate** / **Allocate Quantities per Product**, optional Planned delivery / C&F / Notes |
| Assignment fieldset | **Own Fleet Assignment**: **Vehicle**, **Driver**, **Helpers** |
| Milestones | **Trip start** (`planned_start_at`), **Planned source arrival**, **Planned source departure**, **Planned destination arrival**, **Planned destination departure** |

Prefer accessibility snapshot selectors. Hide Django Debug Toolbar before submit clicks if it intercepts pointer events.

### Status & wipe notes

| Surface | Badge / enum |
|---------|----------------|
| TR creatable | **Available for Planning** → `available_for_transport_planning`; also `under_planning`, `partially_allocated` |
| Own Fleet TO after create | **Created** → `created` |
| Vendor Fleet TO after create | **Under Planning** → `under_planning` |
| Own Fleet planning complete | **Assigned** → `assigned` |

`to_number` / `tr_number` are system-generated — cannot use `MCP-` code prefix. Track by number / creator / session for wipe via `.cursor/skills/detect-wipe-mcp-test-data/SKILL.md`.

### Known implementation alignment / gaps

| Topic | Legacy FG_TP expectation | Current admin |
|-------|--------------------------|---------------|
| Planning queue | Approved TRs / Status = Available for Planning | TP queryset: available_for_transport_planning + under_planning + partially_allocated + fully_allocated; badge **Available for Planning** |
| Live Map in TO create | Embedded during create | Separate **Live GPS** page only |
| Vehicle type | Optional | **Required** for Own and Vendor create |
| Choose Vehicle | Optional named field | Label **Vehicle**; optional on create |
| Vehicle statuses | Available / Assigned / Active | Ops: **No Active TO**, Scheduled, In-transit, Under Maintenance, Inactive — not in TO `<select>` labels |
| Driver statuses | Available / Assigned / Active | **Available**, **Assigned**, **On Trip**, **On Leave** — not in TO `<select>` labels |
| Active reuse | Allow Active vehicle/driver on new Created TO | Allow planning-stage multi-TO (FB-011); block **actively serving** |
| Vendor create status | Created → TDO | Initial `under_planning`; TDO after milestones → Created handoff |
| TDO Own Fleet | Absent | Confirmed removed (FB-008); TP owns Own Fleet assignment |
| Assigned gate | Vehicle + Driver + all 5 dates | Service `own_fleet_ready_for_assigned_status` agrees; *admin save_model may promote early* |
| Audit Log | TO Created / planning rows | Not reliable for SSR; TP lacks Audit menu — dropped |
| First milestone label | Planned start | Admin standalone field **Trip start** (`planned_start_field.html`); other four keep Planned … labels |

### Original ID map (FG_TP → this plan)

| Legacy | This file | Change |
|--------|-----------|--------|
| FG_TP_001 | TC02 | Rewrote Approved → Available for Planning + TP queryset |
| FG_TP_002 | TC03 | Keep intent; select-TR redirect |
| FG_TP_003 | TC04 | Rewrote to separate Live GPS page |
| FG_TP_004 | TC05 | Rewrote status labels; P2 / empty-fleet BLOCKED note |
| FG_TP_005 | TC06 | Vehicle type required; Vehicle optional |
| FG_TP_006 | TC07 | Keep |
| FG_TP_007 | TC06 | Merged into single-TO happy path |
| FG_TP_008 | TC08 | Keep |
| FG_TP_009 | TC11 | Keep |
| FG_TP_010 | TC12 | Combined N×qty + sequential note |
| FG_TP_011 | TC10 | **Inverted** — blank Vehicle type must fail |
| FG_TP_012 | TC09 | Relabeled Choose Vehicle → Vehicle |
| FG_TP_013 | TC14 | Initial status Under Planning |
| FG_TP_014 | TC15 | Label **Trip start** (admin standalone field) |
| FG_TP_015 | TC16 | Exact milestone labels; first = **Trip start** |
| FG_TP_016 | TC17 | Same change form, not Assign Vehicle screen |
| FG_TP_017 | TC18 | Same change form |
| FG_TP_018 | TC19 | Keep |
| FG_TP_019 | TC20 | Keep intent + known admin gap |
| FG_TP_020 | TC21 | Demoted to Vehicles master / Live GPS |
| FG_TP_021 | TC22 | FB-011 actively serving rule |
| FG_TP_022 | TC23 | Drivers master list |
| FG_TP_023 | TC24 | Planning reuse / actively serving |
| FG_TP_024 | TC25 | Keep |
| FG_TP_025 | TC26 | Keep |
| FG_TP_026 | TC27 | Keep |
| FG_TP_027 | — | **Dropped** (no SSR Audit Log for TP) |
| FG_TP_028 | — | **Dropped** (same) |
| — | TC01 | Added (portal nav) |
| — | TC13 | Added (zero allocation) |

### Suggested next step

Run Playwright MCP against this file (TC01 → TC03 → TC06 → TC10–TC12 → TC17–TC20), persist results under `tests/e2e/playwright-mcp/fg-tp-to-artifacts/RESULTS.md`, screenshot failures as `<TC-ID>-failure.png`.
