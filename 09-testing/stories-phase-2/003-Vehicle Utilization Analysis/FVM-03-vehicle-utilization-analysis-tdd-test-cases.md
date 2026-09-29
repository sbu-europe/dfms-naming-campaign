---
section: 09-testing/stories-phase-2/003-Vehicle Utilization Analysis
specification: FVM-03 Vehicle Utilization Analysis — TDD test cases
version: 1.0
phase: Phase 2
tdd: true
related_stories: FVM-03
source_spec: ../../../03-backlog/phase-2/stories-phase-2/003-Vehicle Utilization Analysis/FVM-03-vehicle-utilization-analysis.md
module_spec: ../../../../05-modules/02-master-data/vehicle-master-data.md
suggested_impl:
  unit: UtilizationService.trips_per_vehicle / serving_hours / idle_vs_movement / utilization_pct
  api: GET utilization list + vehicle chart
  e2e: Playwright admin — Transport Planner utilization
last_updated: 2026-09-15
---

# FVM-03 — Vehicle Utilization Analysis — TDD test cases

**Story:** [FVM-03](../../../03-backlog/phase-2/stories-phase-2/003-Vehicle%20Utilization%20Analysis/FVM-03-vehicle-utilization-analysis.md)  
**TDD start here:** pure unit tests for Plan count and hour clocks.  
**Does not:** change assignment; use FVM-02 status cards as period hours; treat idle as “no trip”.

## Seed prerequisites (when implementing)

| Item | Notes |
|------|--------|
| Roles | `transport_planner`, `tenant_admin`, `driver_supervisor`; negative: Transport Desk / ungranted |
| Vehicles | ≥3 own-fleet; ≥1 vendor-hire truck |
| Plans | Single-TO completed Plan; Multi-TO Plan (several TOs, one Plan); cancelled Plan/TO; Plan finished **outside** period |
| GPS | Movement-status samples at 2.9 km/h and 3.0 km/h; one vehicle with **no** GPS in period |
| Downtime | 0 hours until FVM-04; then one overlapping log for available-hours tests |

## Numeric fixture (serving + GPS)

| Field | Value |
|-------|-------|
| Period | 10:00–18:00 same day (8 h) |
| Trip window | 09:00–12:00 → clipped serving = 2 h (10:00–12:00) |
| GPS idle | 5 h below 3 km/h |
| GPS moving | 3 h at/above 3 km/h |
| Idle vs movement ratio | 5 ÷ (5 + 3) = 0.625 |
| Downtime in period | 0 (or 1 h after FVM-04) |
| Available hours | 8 − downtime |
| Utilization % | serving ÷ available |

---

## A — Trips per vehicle (AC-1)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FVM-03-TC01 | AC-1.1 | Unit | Multi-TO Plan counts as 1 trip | One Plan with 3 completed TOs finished in period. Assert trips_per_vehicle = **1**, not 3. | P0 | Planned |
| FVM-03-TC02 | AC-1.2 | Unit | Each plan counted once; finish in period | Plan finished in period then closed. Assert count 1. Plan finished **outside** period not counted. | P0 | Planned |
| FVM-03-TC03 | AC-1.3 | Unit | Cancelled work not counted | Cancelled Plan and/or cancelled TO in period. Assert they do not add to trip count. | P0 | Planned |
| FVM-03-TC04 | AC-1.4 | API / E2E | Zero-trip vehicles still listed | Own-fleet vehicle with 0 completed Plans. Assert still on utilization list with 0 trips. | P0 | Planned |
| FVM-03-TC05 | AC-1.5 | API | Hired vendor trucks excluded | Vendor-hire truck not on own-fleet list. Assert absent from utilization list. | P0 | Planned |

## B — Active vs idle time (AC-2)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FVM-03-TC06 | AC-2.1 | Unit | Serving hours clipped to period | Start Trip 09:00, finish 12:00, period 10:00–18:00. Assert serving_hours = 2 (not 3). | P0 | Planned |
| FVM-03-TC07 | AC-2.2 | Unit | Overlapping TOs counted once | Two TOs on same Plan overlapping 1 h. Assert union, not sum (overlap added once). | P0 | Planned |
| FVM-03-TC08 | AC-2.3 | Unit | Idle vs moving from GPS | Speed 2.9 → idle/stopped; 3.0 → moving. Assert hours in each bucket; ratio = idle ÷ (idle + moving). TO presence ignored. | P0 | Planned |
| FVM-03-TC09 | AC-2.4 | Unit / E2E | No GPS → idle vs movement unavailable | No GPS movement records in period. Assert idle vs movement **unavailable**; not guessed from trips or downtime. | P0 | Planned |
| FVM-03-TC10 | AC-2.5 | Unit | Available hours subtract downtime | Period 8 h, downtime 1 h (0 if no FVM-04). Assert available = **period hours − downtime**. Available does **not** define idle. | P0 | Planned |
| FVM-03-TC11 | AC-2.6 | E2E | Chart moving vs idle/stopped | As Transport Planner, open a vehicle with GPS hours. Assert chart compares **moving** vs **idle/stopped** (GPS). | P1 | Planned |
| FVM-03-TC12 | AC-2.7 | Unit | Utilization % | Serving 2, available 8. Assert util % = 2÷8. Available 0 → util % = **0** (no divide-by-zero). | P0 | Planned |

## C — Who can see and do what (AC-3)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FVM-03-TC13 | AC-3.1 | E2E | Planner and Tenant Admin can view | As Transport Planner and as Tenant Admin. Assert list, chart, date range, and depot filter visible. | P0 | Planned |
| FVM-03-TC14 | AC-3.2 | E2E / API | Sort by trips or utilization | Sort by trips, then by utilization %. Assert order matches that field. | P1 | Planned |
| FVM-03-TC15 | AC-3.3 | E2E | Driver Supervisor may view | As Driver Supervisor, open utilization. Assert view allowed. Transport Desk does not need this screen in v1. | P1 | Planned |
| FVM-03-TC16 | AC-3.4 | E2E / API | Screen does not change assignments | On utilization, attempt to change TO / trip / `operational_status`. Assert no mutate controls; write APIs from this surface denied. | P0 | Planned |

---

## Edge cases (from GWT And/not clauses)

| Test Case ID | Layer | Scenario | Assert | Priority | Status |
|--------------|-------|----------|--------|----------|--------|
| FVM-03-EC01 | Unit | Serving window wholly outside period | serving_hours = 0 | P0 | Planned |
| FVM-03-EC02 | Unit | Serving straddles period end | Clip to period end only | P0 | Planned |
| FVM-03-EC03 | Unit | GPS speed exactly 3.0 km/h | Moving (not idle) | P0 | Planned |
| FVM-03-EC04 | Unit | Vehicle moving GPS, no trip | Moving hours still accrue | P0 | Planned |
| FVM-03-EC05 | Unit | Vehicle stopped GPS, on a trip | Idle/stopped hours still accrue | P0 | Planned |
| FVM-03-EC06 | Unit | Idle ≠ available − serving | GPS idle ≠ (available − serving) | P0 | Planned |
| FVM-03-EC07 | API | Depot filter | List limited to selected depot | P1 | Planned |
| FVM-03-EC08 | API | Ungranted role | 403 | P0 | Planned |
| FVM-03-EC09 | Unit | Single-TO Plan | Counts as 1 trip (same as Multi-TO) | P1 | Planned |
| FVM-03-EC10 | Unit | Idle + moving = 0 but GPS rows exist | Ratio unavailable / fail closed (no divide-by-zero) | P1 | Planned |

---

## Suggested code test targets (TDD)

```
tests/unit/.../test_utilization_plan_count.py       # TC01–03, EC09
tests/unit/.../test_utilization_serving_hours.py    # TC06–07, EC01–02
tests/unit/.../test_utilization_gps_idle.py         # TC08–09, EC03–06, EC10
tests/unit/.../test_utilization_percent.py          # TC10, TC12
tests/api/.../test_utilization_list.py              # TC04–05, TC14, EC07–08
tests/e2e/.../test_utilization_planner.py           # TC11, TC13, TC15–16
```

**Implement order:** TC01 → TC03 → TC06–08 → TC09 → TC12 → TC05 → rest.
