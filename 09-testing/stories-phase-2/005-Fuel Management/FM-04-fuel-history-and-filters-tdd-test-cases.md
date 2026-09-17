---
section: 09-testing/stories-phase-2/005-Fuel Management
specification: FM-04 Fuel History & Filters — TDD test cases
version: 1.0
phase: Phase 2
tdd: true
related_stories: FM-04
source_spec: ../../../../03-backlog/stories-phase-2/005-Fuel Management/FM-04-fuel-history-and-filters.md
module_spec: ../../../../05-modules/08-fleet-management/fuel-management.md
suggested_impl:
  api: GET /api/v1/fuel-entries/; GET /api/v1/vehicles/{id}/fuel-history/; optional stats
  e2e: Playwright — Fuel History tab
last_updated: 2026-09-14
---

# FM-04 — Fuel History & Filters — TDD test cases

**Story:** [FM-04](../../../../03-backlog/stories-phase-2/005-Fuel%20Management/FM-04-fuel-history-and-filters.md)  
**Depends on:** FM-01/FM-02 entries, FM-03 computed fields, FM-05 `anomaly_flag` for Status column.

## Required columns (TC01)

Date, Vehicle, Before (L), After (L), Filled (L), Cost (BDT), Odometer, Distance, km/L, ৳/km, Entry Type, Entered By, Status (Normal / Anomaly).

---

## A — History table (AC-1)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FM-04-TC01 | AC-1.1 | E2E / API | Newest first + columns | Multiple entries. Open Fuel History (All Vehicles). Assert order by `refueling_datetime` desc; required columns present. | P0 | Planned |
| FM-04-TC02 | AC-1.2 | E2E / API | Filter single vehicle | Entries for A and B; filter A. Assert only A. | P0 | Planned |
| FM-04-TC03 | AC-1.3 | E2E | Empty state | No matching entries. Assert empty state, no error. | P1 | Planned |

## B — Stats strip (AC-2)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FM-04-TC04 | AC-2.1 | E2E / API | Stats match filtered set | Vehicle A: 40L+60L, costs 4000+6000, 1 anomaly. Filter A. Assert Entries=2, Liters=100, Cost=10000, Anomalies=1; Avg km/L ignores nulls. | P0 | Planned |
| FM-04-TC05 | AC-2.2 | API | Stats All Vehicles | Multi-vehicle entries. Filter All. Assert aggregates across visible own-fleet set. | P0 | Planned |

## C — Access (AC-3)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FM-04-TC06 | AC-3.1 | API | Supervisor sees all own-fleet | Entries A+B. Supervisor list returns both. | P0 | Planned |
| FM-04-TC07 | AC-3.2 | API | Driver scoped to assignment | Driver assigned A; entries A+B. Assert only A (driver scope); not B. | P0 | Planned |
| FM-04-TC08 | AC-3.3 | API | Unauthorized denied | No history/view_own permission. Assert 403. | P0 | Planned |

## D — Admin + API (AC-4)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FM-04-TC09 | AC-4.1 | API | List filter + ordering | `GET /api/v1/fuel-entries/?vehicle_id=A&ordering=-refueling_datetime`. Assert only A, newest first. | P0 | Planned |
| FM-04-TC10 | AC-4.2 | API | Vehicle fuel-history endpoint | `GET /api/v1/vehicles/A/fuel-history/`. Assert entries include computed fields + `anomaly_flag`. | P0 | Planned |

---

## Edge cases (from story)

| Test Case ID | Layer | Scenario | Assert | Priority | Status |
|--------------|-------|----------|--------|----------|--------|
| FM-04-EC01 | API / E2E | Avg km/L all null | No divide-by-zero; N/A or defined empty | P0 | Planned |
| FM-04-EC02 | API | Anomalies count filtered only | Count `anomaly_flag=true` in filter set | P0 | Planned |
| FM-04-EC03 | API | Vendor fleet excluded | Vendor vehicles never in history | P0 | Planned |
| FM-04-EC04 | API | Tenant isolation | Other tenant entries never returned | P0 | Planned |
| FM-04-EC05 | API | Driver tampers vehicle_id | Cannot widen to other vehicles | P0 | Planned |
| FM-04-EC06 | Maestro / API | Driver no assignment | Empty history + guidance | P1 | Planned |

---

## Suggested code test targets (TDD)

```
tests/api/.../test_fuel_history.py           # TC02, TC04–10, EC01–05
tests/e2e/.../test_fuel_history_admin_e2e.py # TC01, TC03
```
