---
section: 09-testing/stories-phase-2/012-TO Dispatch Planning Calendar View
specification: TO-03 TO Dispatch Planning Calendar View — TDD test cases
version: 1.0
phase: Phase 2
tdd: true
related_stories: TO-03
source_spec: ../../../03-backlog/phase-2/stories-phase-2/012-TO Dispatch Planning Calendar View/TO-03-to-dispatch-planning-calendar-view.md
prototype: ../../../../../docs/prototypes/to-dispatch-planning-calendar.html
suggested_impl:
  unit: period-set query, assignment filter, KPI aggregations, stack/idle layout, monthly day-snap
  e2e: Playwright admin — Transport → TO dispatch planning
last_updated: 2026-09-17
---

# TO-03 — TO Dispatch Planning (Calendar View) — TDD test cases

**Story:** [TO-03](../../../03-backlog/phase-2/stories-phase-2/012-TO%20Dispatch%20Planning%20Calendar%20View/TO-03-to-dispatch-planning-calendar-view.md)  
**TDD start here:** unit tests for the period-set query and lane layout.  
**Does not:** create/assign TOs; write status or quantity; draw unassigned bars; add vendor-fleet vehicle rows; reuse FVM-03 idle hours.

> **Code status (2026-09-17):** No calendar view. Existing screens are **Vehicle planning** (`/admin/transport/vehicle-planning/`) and **Transport orders**. Cases describe **post-TO-03** admin behaviour. Prototype labels win until Django exists; then code labels win.

## Seed prerequisites (when implementing)

| Item | Notes |
|------|--------|
| Roles | Granted: `transport_planner`, `tenant_admin`, tenant super admin. Negative: `driver_supervisor`, gateman (and other ungranted roles) |
| Vehicles | ≥3 active own-fleet (`Vehicle.is_active=True`); 1 with `operational_status=under_maintenance`; 1 with **no** TO in the visible period; 1 with two **overlapping** TOs; 1 with two **non-overlapping** TOs |
| Assigned TOs | Own-fleet `Vehicle` FK + `planned_start_at` + `planned_destination_arrival_at` overlapping the period; statuses in `{created, under_planning, assigned, ready_for_dispatch}` |
| Unassigned | Planning-eligible TO, `vehicle` null, window in period |
| Vendor | Vendor-fleet TO with no `Vehicle` (no bar); optional vendor-fleet TO that *has* an own-fleet `Vehicle` FK (vendor-styled bar on that row) |
| Exclusions | `cancelled` TO with vehicle + window; execution TO (`driving_towards_source` or later) with vehicle + window |
| Parent TRs | Mix of `urgency` `{normal, high, critical}` and transfer FG vs Port consignment |
| Pagination | Enough own-fleet vehicles to exceed default `per_page` (25) so page 2 exists |
| E2E wipe | Prefix `MCP-TO03-` |

## Numeric fixture (weekly, one vehicle)

| Field | Value |
|-------|-------|
| Period | Visible week containing “today” (Sun 00:00 → next Sun 00:00, prototype `startOfWeek`) |
| Vehicle A overlap | TO-A 06:00–11:00 and TO-B 06:00–11:00 same day → **2 TO(s) · 2 concurrent** |
| Vehicle B idle | TO-C 06:00–10:00 then TO-D 14:00–18:00 same day → dashed **idle** between bars |
| Unassigned | TO-E window in period, `vehicle` null → +1 result count and **Unassigned** KPI; absent from every lane |
| Cancelled | TO-F `status=cancelled`, vehicle set, window in period → excluded from period set, KPIs, and lanes |

---

## A — Period set (AC-1 result count, BR-TO03-001)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| TO-03-TC01 | AC-1.1 | Unit | Period overlap includes unassigned | Planning-eligible TOs with `[planned_start_at, planned_destination_arrival_at]` overlapping the visible range (`start < range.to` and `end > range.from`). Include rows with `vehicle` null. Assert they belong to the period set. | P0 | Planned |
| TO-03-TC02 | AC-1.1 | Unit | Result count = period-set size | Mix assigned + unassigned in range. Assert result copy is `{n} transport order(s)` with `n` = period-set size (not vehicle count, not bar count). | P0 | Planned |
| TO-03-TC03 | AC-1.1 | Unit | Planning-eligible statuses only | TOs in `created`, `under_planning`, `assigned`, `ready_for_dispatch` with overlapping windows are in the period set. | P0 | Planned |
| TO-03-TC04 | AC-1.1 | Unit | Cancelled excluded | `status=cancelled` with vehicle and overlapping window. Assert **not** in period set, KPIs, or lanes. | P0 | Planned |
| TO-03-TC05 | AC-1.1 | Unit | Execution / closed excluded | TO in `driving_towards_source` (or later / `closed`) with vehicle and overlapping window. Assert **not** in period set. | P0 | Planned |

## B — Shell, views, navigation (AC-1)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| TO-03-TC06 | AC-1.1 | E2E | Menu, breadcrumb, header links | As Transport Planner, open **Transport → TO dispatch planning**. Assert breadcrumb **Home › Transport › TO dispatch planning**. Header links **Vehicle planning** → `/admin/transport/vehicle-planning/` and **All transport orders** → `/admin/transport/transportorder/`. Those screens are unchanged (no calendar write controls). | P0 | Planned |
| TO-03-TC07 | AC-1.2 | E2E | Daily 24 ticks, 12-hour labels | Select **Daily**. Assert 24 hour ticks labelled **12 AM … 11 AM, 12 PM … 11 PM**. Layout stays vehicle-first (vehicles left, time across). | P0 | Planned |
| TO-03-TC08 | AC-1.2 | E2E | Weekly Sun–Sat, today highlighted | Select **Weekly**. Assert seven day columns Sun–Sat. Today’s column is highlighted. Layout stays vehicle-first. | P0 | Planned |
| TO-03-TC09 | AC-1.2 | E2E | Monthly day columns, vehicle-first | Select **Monthly**. Assert one column per day of the month. Layout stays vehicle-first (not a TO month-grid). Bars snap to calendar days (BR-TO03-003). | P0 | Planned |
| TO-03-TC10 | AC-1.3 | E2E | Prev / Next / Today / date picker | From a non-today period, click previous, next, **Today**, and the date picker. Assert the period label and visible range move and lanes reload for that period. | P0 | Planned |

## C — Vehicle lanes and TO bars (AC-2)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| TO-03-TC11 | AC-2.1 | Unit | Bar window | Assigned own-fleet TO with `planned_start_at` 06:00 and `planned_destination_arrival_at` 11:00 overlapping the period. Assert the bar interval is those two fields (not GPS, not FVM-03 serving hours, not `eta_datetime` alone). | P0 | Planned |
| TO-03-TC12 | AC-2.1 | E2E | Bar chrome, fleet color, critical | On the lane, assert the bar shows **TO number** and start–end time. Own-fleet vs vendor-fleet bars are visually distinct (left-border color). `tr.urgency=critical` has a red outline. | P0 | Planned |
| TO-03-TC13 | AC-2.1 | E2E | Tooltip | Hover an assigned bar. Assert tooltip lists TO number, TR number, start–end datetimes, origin → destination, and driver or **Driver not assigned**. | P1 | Planned |
| TO-03-TC14 | AC-2.1 | E2E | Paginated own-fleet rows | Assert vehicle rows show registration, vehicle type, and capacity. Pagination uses the existing portal list (`?p=`, `?per_page=` in `{15,25,50,100,200}`, **Rows per page:**). No vendor-fleet vehicle rows. No fixed 6-per-page. | P0 | Planned |
| TO-03-TC15 | AC-2.2 | Unit / E2E | Unassigned omitted but counted | Planning-eligible TO with no `vehicle` and window in period. Assert it is **absent** from every lane. Assert it is included in result count and the **Unassigned** KPI. | P0 | Planned |
| TO-03-TC16 | AC-2.2 | Unit / E2E | Vendor TO with no Vehicle | Vendor-fleet TO, `vehicle` null, window in period. Assert no bar on any lane (same as unassigned). Assert it still counts in period set / KPIs / filters. | P0 | Planned |
| TO-03-TC17 | AC-2.3 | Unit / E2E | Overlap stacks | Two overlapping TOs on one own-fleet vehicle. Assert bars stack vertically (do not overwrite). Row badge shows **N TO(s)** and **M concurrent** (fixture: **2 TO(s) · 2 concurrent**). | P0 | Planned |
| TO-03-TC18 | AC-2.3 | Unit / E2E | Idle gap | Two non-overlapping bars on one vehicle in the visible range. Assert a dashed **idle** span in the empty time between them. Assert this is not GPS idle and not FVM-03 hours. | P0 | Planned |
| TO-03-TC19 | AC-2.3 | E2E | Empty row Free | Own-fleet vehicle with no TO in range. Assert the row still appears with badge **Free**. | P0 | Planned |
| TO-03-TC20 | AC-2.3 | E2E | Under maintenance still listed | Vehicle with `operational_status=under_maintenance`. Assert it still appears with badge **Under maintenance**. Calendar does not change `Vehicle.operational_status`. | P0 | Planned |

## D — KPI cards, filters, legend (AC-3)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| TO-03-TC21 | AC-3.1 | Unit | Five KPI cards | For the current period + filters, assert cards: **TOs in period** = period-set size; **Parent TRs** = distinct parent TR count; **Unassigned** = period TOs with no `vehicle`; **Critical urgency** = period TOs with `tr.urgency=critical`; **Own fleet** = period TOs with `fleet_type=OWN`. | P0 | Planned |
| TO-03-TC22 | AC-3.2 | Unit / E2E | Search | Open **Filters**. Search by TO number, then TR number, vehicle registration, driver name, origin POI, destination POI. Assert KPIs, result count, and bars match the search haystack. | P0 | Planned |
| TO-03-TC23 | AC-3.2 | Unit / E2E | Select filters | Set **Fleet type** (Own fleet / Vendor fleet), **Transfer type** (FG / Port consignment), **Urgency**, and **Assignment** (Unassigned / Assigned / Confirmed). Assert KPIs, result count, and bars match. Assignment: `unassigned` = no `vehicle`; `assigned` = vehicle set and status not yet `ready_for_dispatch`; `confirmed` = `ready_for_dispatch` among planning-eligible rows. | P0 | Planned |
| TO-03-TC24 | AC-3.2 | E2E | Vehicle type filters rows | Set **Vehicle type**. Assert listed vehicle rows are that type **and** bars are limited to TOs on those vehicles (plus unassigned still counted only if they match other filters). | P0 | Planned |
| TO-03-TC25 | AC-3.2 | E2E | Clear restores | After applying search + selects, click **Clear**. Assert all filters reset and KPIs / bars / rows return to the unfiltered period set. | P0 | Planned |
| TO-03-TC26 | AC-3.3 | E2E | Legend | Assert legend shows fleet colors, urgency badges, assignment badges, **Idle gap**, and that a bar is planned start → dest. arrival. | P1 | Planned |

## E — Read-only drawer (AC-4)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| TO-03-TC27 | AC-4.1 | E2E | Click bar opens drawer | Click an assigned TO bar. Assert a drawer opens without navigating away; note **Read-only in calendar view.**; fields: status, assignment, urgency, fleet type, vehicle (or **Unassigned**), vehicle type, driver, helper, source POI, destination POI, allocated qty, planned start, planned dest. arrival; footer **Open TO detail** and **Open parent TR**; selected bar stays emphasized (others may dim). | P0 | Planned |
| TO-03-TC28 | AC-4.2 | E2E | Close drawer | With the drawer open, close via **X**, backdrop, and Escape (separate interactions). Assert the drawer closes each way. | P0 | Planned |
| TO-03-TC29 | AC-4.2 | E2E | Open TO / Open TR | **Open TO detail** opens the existing TO change view; **Open parent TR** opens the existing TR screen. Assert neither path edits from the calendar itself. | P0 | Planned |

## F — RBAC and no writes (AC-5)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| TO-03-TC30 | AC-5.1 | E2E | Granted roles see menu | As Transport Planner, Tenant Admin, and Tenant Super Admin. Assert **TO dispatch planning** is visible under Transport. | P0 | Planned |
| TO-03-TC31 | AC-5.1 | E2E / API | Ungranted denied | As Driver Supervisor (and another ungranted role). Assert the menu item is absent. Direct URL → 403 (or redirect with no calendar body), matching Vehicle planning’s permission gate. | P0 | Planned |
| TO-03-TC32 | AC-5.2 | E2E / API | Calendar never writes | Navigate, change view, filter, open/close drawer, follow Open TO / Open TR. Capture TO `status`, quantity, `vehicle`, driver, helpers, and `Vehicle.operational_status` before and after. Assert unchanged. No POST from the calendar view that mutates `TransportOrder` or assignment. | P0 | Planned |

---

## Edge cases (from locked decisions + BRs)

| Test Case ID | Layer | Scenario | Assert | Priority | Status |
|--------------|-------|----------|--------|----------|--------|
| TO-03-EC01 | Unit | Null `planned_start_at` or `planned_destination_arrival_at` | Not in period set; no bar | P0 | Planned |
| TO-03-EC02 | Unit | Window wholly outside period | Excluded | P0 | Planned |
| TO-03-EC03 | Unit | Window straddles period start or end | Included; bar clipped to visible range | P0 | Planned |
| TO-03-EC04 | Unit | Monthly snap | Bar window snapped to calendar days; still the same TO | P0 | Planned |
| TO-03-EC05 | Unit | Vendor TO **with** own-fleet `Vehicle` FK | Vendor-styled bar on that own-fleet row (no vendor vehicle row) | P1 | Planned |
| TO-03-EC06 | Unit | Two TOs, same parent TR | **Parent TRs** = 1; **TOs in period** = 2 | P0 | Planned |
| TO-03-EC07 | E2E | Pagination vs KPIs | Page 2 of vehicles; KPIs / result count still for the full filtered period set, not the page | P0 | Planned |
| TO-03-EC08 | API | Tenant isolation | Other-tenant TOs and vehicles absent | P0 | Planned |
| TO-03-EC09 | E2E | Filters persist across Daily/Weekly/Monthly | Same filter state after view switch; KPIs recompute for the new period | P1 | Planned |
| TO-03-EC10 | E2E | No drag-and-drop / no create from calendar | No reorder or add-TO control; attempting a write POST is rejected | P0 | Planned |
| TO-03-EC11 | Unit | Idle ≠ available − serving | Idle gap uses only empty time between that vehicle’s bars in range | P0 | Planned |
| TO-03-EC12 | E2E | Platform-tenant request | Calendar unavailable (same pattern as Vehicle planning) | P1 | Planned |

---

## Suggested code test targets (TDD)

```
tests/unit/test_transport/test_to_dispatch_planning_query.py    # TC01–05, TC11, TC15–16, TC21, TC23, EC01–06, EC08, EC11
tests/unit/test_transport/test_to_dispatch_planning_layout.py   # TC17–18, EC03–04
tests/e2e/.../test_to_dispatch_planning_calendar.py             # TC06–10, TC12–14, TC19–20, TC22–32, EC07, EC09–10, EC12
```

Proposed admin URL (not registered yet): `/admin/transport/to-dispatch-planning/` · `admin:transport_to_dispatch_planning`. Reuse `resolve_admin_list_pagination` (same contract as Vehicle planning).

**Implement order:** TC01 → TC03–05 → TC15–16 → TC11 → TC21 → TC23 → TC17–18 → TC32 → rest.

## Implementation notes

- Admin SSR only. No REST calendar API required unless TO-03-1 adds one.
- **Scope guardrail:** assignment and status stay on TO detail / Vehicle planning. This plan does not cover drag-and-drop, creating TOs, vendor-fleet vehicle rows, capacity utilization bars, GPS idle, FVM-03 serving hours, or theme toggle (prototype chrome only).
- Selectors: `#content-main`, prototype classes `.tdp-bar`, `.tdp-gap`, `.tdp-drawer`, `.dfms-stat-card`, `.dfms-pagination-parent`. Assert persisted enums (`TOStatus`, `FleetType.OWN` / `VENDOR`, `OperationalStatus.UNDER_MAINTENANCE`) even if badges lag.
- **Known drift (story / prototype vs current code):**
  - No calendar Django view yet (TO-03-1 module spec not written).
  - Prototype vehicle types (`covered_van`, `truck_10t`, `trailer`) are mock — use `VehicleType` from master data.
  - Prototype `operational_status=available` is not a real enum; **Under maintenance** maps to `OperationalStatus.UNDER_MAINTENANCE`; **Free** is a calendar badge for “no TO in range”, not `no_active_to`.
  - Transfer type labels in the story/prototype are **FG** / **Port consignment**; persist via existing `TOTransferType` / `flow_lane` once TO-03-1 maps them.
  - `FleetType` values are `OWN` / `VENDOR`, not prototype `own` / `vendor`.
- VP-01 is **not** required: overlapping TOs already stack on one vehicle row.
