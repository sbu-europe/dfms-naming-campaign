---
section: 09-testing/stories-phase-2/001-Odometer-Based Vehicle Maintenance Tracking
specification: FVM-01 Odometer-Based Vehicle Maintenance Tracking — TDD test cases
version: 1.0
phase: Phase 2
tdd: true
related_stories: FVM-01
source_spec: ../../../../03-backlog/stories-phase-2/001-Odometer-Based Vehicle Maintenance Tracking/FVM-01-odometer-based-vehicle-maintenance-tracking.md
module_spec: ../../../../05-modules/02-master-data/vehicle-master-data.md
suggested_impl:
  unit: RemainingKmService / IdleMovementService / HighStressRankingService
  api: POST odometer readings; POST service log; PATCH vehicle service interval
  e2e: Playwright admin — Driver Supervisor meter entry; Transport Planner own-fleet list/detail
last_updated: 2026-09-15
---

# FVM-01 — Odometer-Based Vehicle Maintenance Tracking — TDD test cases

**Story:** [FVM-01](../../../../03-backlog/stories-phase-2/001-Odometer-Based%20Vehicle%20Maintenance%20Tracking/FVM-01-odometer-based-vehicle-maintenance-tracking.md)  
**Approach:** Write failing unit tests for remaining-km formulas first → API meter entry → planner E2E.  
**Does not:** decode GPS mileage; set `operational_status`; use a tenant-wide default interval.

## Seed prerequisites (when implementing)

| Item | Notes |
|------|--------|
| Roles | `driver_supervisor`, `transport_planner`, `tenant_admin`; negative: ungranted role |
| Vehicles | Own-fleet with current km 12,000; own-fleet with **no** reading; second own-fleet for interval isolation; ≥1 vendor-fleet |
| Service | One vehicle with last-service km 10,000 + interval 5,000; one with starting km only; one with neither |
| TOs | Completed TOs with origin + destination POIs in a 30-day window (Top 5 routes / vehicles) |
| GPS | Movement-status history with speeds below and at/above **3 km/h** (idle vs moving only) |

## Numeric fixture (remaining km)

| Field | Value |
|-------|-------|
| KM at last service | 10000 |
| Service interval | 5000 |
| Current KM | 14500 |
| Distance since last service | 4500 |
| Remaining KM | 500 |
| 10% of interval | 500 |
| Flag | **Due soon** (remaining &gt; 0 and remaining ≤ 500) |

---

## A — Supervisor meter entry (AC-1)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FVM-01-TC01 | AC-1.1 | E2E / API | Record meter reading | As Driver Supervisor, open meter entry for own-fleet `DHK-1234`, enter km, reading datetime, optional notes. Assert save accepted. | P0 | Planned |
| FVM-01-TC02 | AC-1.2 | API | First reading seeds starting km | Vehicle has null starting km and null current km. Save first reading 8000. Assert `initial_odometer_reading=8000` and `current_odometer_reading=8000`. | P0 | Planned |
| FVM-01-TC03 | AC-1.3 | API | Equal or higher km accepted | Current km 12000. Save 12150 → current becomes 12150. Save 12150 again (equal) → accepted; current stays 12150. | P0 | Planned |
| FVM-01-TC04 | AC-1.4 | API | Lower km rejected | Current km 12000. Save 11900. Assert 4xx + clear error; current stays 12000; no history row for the rejected save. | P0 | Planned |
| FVM-01-TC05 | AC-1.5 | API | Accepted reading in history | Save accepted reading. Assert history/audit has vehicle, km, reading datetime, notes, and who entered it. | P0 | Planned |
| FVM-01-TC06 | AC-1.6 | E2E / API | No reading → odometer unavailable | Own-fleet vehicle with no meter reading. As Transport Planner, open remaining km. Assert **odometer unavailable**; remaining km is not 0 and not GPS/haversine. | P0 | Planned |
| FVM-01-TC07 | AC-1.7 | API | Live GPS unchanged | Save (or skip) a meter reading. Assert live GPS ingest/query behaviour unchanged; remaining km is not taken from GPS mileage. | P0 | Planned |

## B — Distance since last service & remaining km (AC-2)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FVM-01-TC08 | AC-2.1 | Unit | Distance since last service | Fixture: current 14500, last service 10000. Assert since-service = **Current KM − KM at last service** = 4500. | P0 | Planned |
| FVM-01-TC09 | AC-2.2 | Unit | Remaining km formula | Fixture: last service 10000, interval 5000, current 14500. Assert remaining = **last service + interval − current** = 500. Current 15100 → remaining = −100 (overdue meaning). | P0 | Planned |
| FVM-01-TC10 | AC-2.3 | Unit / E2E | No last service → no service record | No service log; starting km 10000; current 12000; interval 5000. Assert display **No service record available**; since-service and remaining are not calculated from starting km; Due soon / Overdue not shown. | P0 | Planned |
| FVM-01-TC11 | AC-2.4 | Unit / E2E | Remaining unknown without a service record | No service log and no starting km. Assert remaining km unknown (not invented); becomes known only after first service is logged — starting km alone is not enough. | P0 | Planned |
| FVM-01-TC12 | AC-2.5 | Unit / E2E | Due soon flag | Remaining 500, interval 5000 (10% = 500), remaining &gt; 0. Assert **Due soon**. Remaining 501 → not Due soon. | P0 | Planned |
| FVM-01-TC13 | AC-2.6 | Unit / E2E | Overdue flag | Remaining 0 or negative. Assert **Overdue** (not Due soon). | P0 | Planned |
| FVM-01-TC14 | AC-2.7 | API | Service log does not change availability | As Driver Supervisor or Tenant Admin, record completed service (date, meter km, optional notes). Assert service stored; `operational_status` unchanged. | P0 | Planned |

## C — Configurable maintenance threshold (AC-3)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FVM-01-TC15 | AC-3.1 | API | Interval stored on that vehicle only | As Tenant Admin, set vehicle A interval to 5000 / 10000 / 20000 or custom positive km. Assert stored on A only; vehicle B interval unchanged. | P0 | Planned |
| FVM-01-TC16 | AC-3.2 | Unit / API | No interval → remaining unknown | Vehicle has km but no interval. Assert remaining, Due soon, and Overdue based on interval are unknown; no company-wide default is applied. | P0 | Planned |
| FVM-01-TC17 | AC-3.3 | E2E | Planner sees each vehicle’s interval | As Transport Planner, open own-fleet list/detail. Assert each vehicle shows its own interval or none. | P1 | Planned |

## D — Usage indicators (AC-4)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FVM-01-TC18 | AC-4.1 | Unit | Average daily distance | Period readings: first km 10000, last km 10300, number of days = 3. Assert avg daily = **(last − first) ÷ days** = 100. Uses meter readings only. | P0 | Planned |
| FVM-01-TC19 | AC-4.2 | API | Top 5 busiest routes | Completed TOs with origin/destination in period. Assert Top 5 origin→destination by completed TO count (origin, destination, count). | P0 | Planned |
| FVM-01-TC20 | AC-4.3 | API | Per-vehicle share of Top 5 routes | Given Top 5 routes. For a vehicle, assert count and % of **that vehicle’s** completed TOs on each of the five. Truck fill-factor / capacity not used. | P0 | Planned |
| FVM-01-TC21 | AC-4.4 | Unit | Idle vs moving from GPS speed | GPS samples: 2.9 km/h and 3.0 km/h in period. Assert &lt; 3 idle/stopped, ≥ 3 moving; time bucketed; TO presence ignored. | P0 | Planned |

## E — High-stress usage (AC-5)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FVM-01-TC22 | AC-5.1 | API | Top 5 vehicles by completed TOs | Own-fleet completed TOs in period. Assert list is Top 5 vehicles by completed TO count (vehicle, count, optional % of all completed TOs). | P0 | Planned |
| FVM-01-TC23 | AC-5.2 | Unit | Rank uses completed TO count only | Vehicles differ on remaining km, interval, daily km, routes, GPS idle. Assert rank order follows completed TO count only. | P0 | Planned |
| FVM-01-TC24 | AC-5.3 | Unit | Ties for 5th included | Fifth-place count is shared by two vehicles. Assert both rows included (list length &gt; 5). | P0 | Planned |
| FVM-01-TC25 | AC-5.4 | Unit | Zero completed TOs excluded | Vehicle with 0 completed TOs in period. Assert not on the Top 5 list. | P0 | Planned |

## F — Who can see and do what (AC-6)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FVM-01-TC26 | AC-6.1 | E2E / API | Driver Supervisor can enter | As Driver Supervisor on the vehicle being updated. Assert can enter meter readings, log a service, and see current km. | P0 | Planned |
| FVM-01-TC27 | AC-6.2 | E2E | Planner and Tenant Admin can view | As Transport Planner and as Tenant Admin, open own-fleet list/detail. Assert current km, interval, since last service, remaining km, three indicators, Due soon / Overdue, Top 5 routes, Top 5 vehicles. | P0 | Planned |
| FVM-01-TC28 | AC-6.3 | E2E / API | Filters overdue / due soon / unavailable | As Transport Planner, filter overdue, then due soon, then odometer unavailable. Assert list matches that filter only. | P0 | Planned |
| FVM-01-TC29 | AC-6.4 | E2E / API | Date range default last 30 days | Open usage indicators with no period chosen. Assert default last 30 days; changing the selector recalculates indicators. | P1 | Planned |
| FVM-01-TC30 | AC-6.5 | API | Tenant Admin sets interval on that vehicle | As Tenant Admin, set interval on vehicle A. Assert A updated; other vehicles unchanged. | P0 | Planned |
| FVM-01-TC31 | AC-6.6 | E2E / API | Planner cannot enter meter km | As Transport Planner (not Tenant Admin), open vehicle. Assert no meter-entry action; POST reading denied. | P0 | Planned |

---

## Edge cases (from GWT And/not clauses)

| Test Case ID | Layer | Scenario | Assert | Priority | Status |
|--------------|-------|----------|--------|----------|--------|
| FVM-01-EC01 | API | Vendor-fleet vehicle | Meter entry rejected; vendor not in supervisor picker | P0 | Planned |
| FVM-01-EC02 | API | Missing km or reading datetime | Required-field 4xx; no row | P0 | Planned |
| FVM-01-EC03 | API | Negative or non-numeric km | Rejected | P0 | Planned |
| FVM-01-EC04 | API | Notes omitted | Accepted (notes optional) | P1 | Planned |
| FVM-01-EC05 | Unit | Remaining exactly 10% of interval | Due soon (≤ 10% and &gt; 0) | P0 | Planned |
| FVM-01-EC06 | Unit | Remaining = 0 | Overdue, not Due soon | P0 | Planned |
| FVM-01-EC07 | API | Interval 0 or negative | Rejected; remaining stays unknown | P0 | Planned |
| FVM-01-EC08 | Unit | Avg daily with 0 days (same calendar day) | No divide-by-zero; define as unavailable or 0 — fail closed | P1 | Planned |
| FVM-01-EC09 | Unit / E2E | No GPS movement records in period | Idle vs moving **unavailable**; not guessed from TOs | P0 | Planned |
| FVM-01-EC10 | Unit | Interval set but no odometer | Remaining unknown (odometer unavailable) | P0 | Planned |
| FVM-01-EC11 | API | Ungranted role | 403 on meter entry / interval PATCH | P0 | Planned |
| FVM-01-EC12 | Unit | Fewer than 5 completed-TO routes | Top routes list length = available pairs (not padded) | P1 | Planned |
| FVM-01-EC13 | API | Cross-tenant vehicle | Denied / not visible | P0 | Planned |

---

## Suggested code test targets (TDD)

```
tests/unit/.../test_remaining_km_service.py          # TC08–13, TC16, EC05–06, EC08, EC10
tests/unit/.../test_idle_movement_from_gps.py        # TC21, EC09
tests/unit/.../test_high_stress_top5.py              # TC22–25, EC12
tests/api/.../test_odometer_meter_entry.py           # TC01–05, TC14–15, TC30–31, EC01–04, EC07, EC11, EC13
tests/e2e/.../test_odometer_maintenance_planner.py   # TC06, TC17, TC26–29
```

**Implement order:** TC08–13 → TC16 → TC02–04 → TC14 → TC21 → TC24 → TC31 → rest.
