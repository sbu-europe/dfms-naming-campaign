---
section: 09-testing/stories-phase-2/005-Fuel Management
specification: Fuel Management — all TDD test cases (index)
phase: Phase 2
tdd: true
last_updated: 2026-09-14
---

# Fuel Management — All TDD test cases (index)

Master index. Detail + asserts live in per-story files. Status defaults to **Planned** until code exists.

## FM-03 — Calculations (unit-first)

| TC ID | AC | Layer | Scenario | Priority | Status |
|-------|-----|-------|----------|----------|--------|
| FM-03-TC01 | AC-1.1 | Unit | Metrics from consecutive entries | P0 | Planned |
| FM-03-TC02 | AC-1.2 | Unit | Quantity override respected | P0 | Planned |
| FM-03-TC03 | AC-1.3 | Unit | Distance = odometer delta (not GPS) | P0 | Planned |
| FM-03-TC04 | AC-2.1 | Unit/API | Odometer equal → reject | P0 | Planned |
| FM-03-TC05 | AC-2.2 | Unit/API | Odometer less → reject | P0 | Planned |
| FM-03-TC06 | AC-2.3 | Unit/API | Valid odometer updates vehicle | P0 | Planned |
| FM-03-TC07 | AC-3.1 | Unit | First entry null distance metrics | P0 | Planned |
| FM-03-TC08 | AC-3.2 | E2E/UI | First entry UI note | P1 | Planned |
| FM-03-TC09 | AC-4.1 | Unit | previous_entry null | P0 | Planned |
| FM-03-TC10 | AC-4.2 | Unit | distance ≤ 0 → null km/L | P1 | Planned |

→ [FM-03 detail](./FM-03-fuel-consumption-calculations-tdd-test-cases.md)

## FM-05 — Anomaly baselines (unit-first)

| TC ID | AC | Layer | Scenario | Priority | Status |
|-------|-----|-------|----------|----------|--------|
| FM-05-TC01 | AC-1.1 | Unit | Light truck baseline avg 10 | P0 | Planned |
| FM-05-TC02 | AC-1.2 | Unit | Unmapped vehicle_type safe | P1 | Planned |
| FM-05-TC03 | AC-2.1 | Unit | >20% below → anomaly | P0 | Planned |
| FM-05-TC04 | AC-2.2 | Unit | Exactly 20% below → not anomaly | P0 | Planned |
| FM-05-TC05 | AC-2.3 | Unit | Above threshold → Normal | P0 | Planned |
| FM-05-TC06 | AC-2.4 | Unit | Null km/L → no anomaly | P0 | Planned |
| FM-05-TC07 | AC-3.1 | API | Vendor vehicle rejected | P0 | Planned |
| FM-05-TC08 | AC-3.2 | E2E | Vendor not in picker | P0 | Planned |
| FM-05-TC09 | AC-4.1 | API | History includes anomaly_flag | P0 | Planned |
| FM-05-TC10 | AC-4.2 | API | Vehicle report fuel.anomaly | P1 | Planned |

→ [FM-05 detail](./FM-05-fuel-anomaly-baselines-tdd-test-cases.md)

## FM-01 — Supervisor admin entry

| TC ID | AC | Layer | Scenario | Priority | Status |
|-------|-----|-------|----------|----------|--------|
| FM-01-TC01 | AC-1.1 | E2E/API | Select vehicle → context panel | P0 | Planned |
| FM-01-TC02 | AC-1.2 | API | Odometer patch audit, no FuelEntry | P0 | Planned |
| FM-01-TC03 | AC-1.3 | E2E/API | No prior entry context | P1 | Planned |
| FM-01-TC04 | AC-2.1 | E2E/API | Happy path fields + auto filled | P0 | Planned |
| FM-01-TC05 | AC-2.2 | API | After ≤ Before rejected | P0 | Planned |
| FM-01-TC06 | AC-2.3 | API | Quantity override + note | P0 | Planned |
| FM-01-TC07 | AC-3.1 | API | Required gauge photos only | P0 | Planned |
| FM-01-TC08 | AC-3.2 | API | Missing gauge photo blocked | P0 | Planned |
| FM-01-TC09 | AC-4.1 | API | SUPERVISOR_ENTRY metadata | P0 | Planned |
| FM-01-TC10 | AC-5.1 | E2E | Live preview with prior entry | P1 | Planned |
| FM-01-TC11 | AC-5.2 | E2E | First entry N/A preview | P1 | Planned |
| FM-01-TC12 | AC-6.1 | API | Odometer ≤ last rejected | P0 | Planned |
| FM-01-TC13 | AC-6.2 | E2E/API | Own-fleet picker only | P0 | Planned |
| FM-01-TC14 | AC-6.3 | API | Date/location required | P0 | Planned |
| FM-01-TC15 | AC-6.4 | API | Unauthorized denied | P0 | Planned |

→ [FM-01 detail](./FM-01-fuel-entry-admin-tdd-test-cases.md)

## FM-02 — Driver mobile entry

| TC ID | AC | Layer | Scenario | Priority | Status |
|-------|-----|-------|----------|----------|--------|
| FM-02-TC01 | AC-1.1 | Maestro | Prefill vehicle + fuel type | P0 | Planned |
| FM-02-TC02 | AC-1.2 | API/Maestro | Datetime + GPS on submit | P0 | Planned |
| FM-02-TC03 | AC-1.3 | Maestro | Location denied blocks | P0 | Planned |
| FM-02-TC04 | AC-1.4 | Maestro | No assignment blocks | P0 | Planned |
| FM-02-TC05 | AC-2.1 | Maestro | Driver fields happy path | P0 | Planned |
| FM-02-TC06 | AC-2.2 | Maestro | Missing gauge photo | P0 | Planned |
| FM-02-TC07 | AC-3.1 | API | After ≤ Before rejected | P0 | Planned |
| FM-02-TC08 | AC-3.2 | API | Odometer ≤ last rejected | P0 | Planned |
| FM-02-TC09 | AC-3.3 | Maestro | Live preview | P1 | Planned |
| FM-02-TC10 | AC-3.4 | API | Other vehicle rejected | P0 | Planned |
| FM-02-TC11 | AC-4.1 | Unit/Maestro | Offline queue GPS/time | P0 | Planned |
| FM-02-TC12 | AC-4.2 | Integration | Sync preserves capture | P0 | Planned |
| FM-02-TC13 | AC-4.3 | API | Idempotency key | P0 | Planned |
| FM-02-TC14 | AC-5.1 | Maestro | Success message | P1 | Planned |
| FM-02-TC15 | AC-5.2 | Maestro/API | Anomaly informational | P1 | Planned |

→ [FM-02 detail](./FM-02-fuel-entry-driver-mobile-tdd-test-cases.md)

## FM-04 — History & filters

| TC ID | AC | Layer | Scenario | Priority | Status |
|-------|-----|-------|----------|----------|--------|
| FM-04-TC01 | AC-1.1 | E2E/API | Newest first + columns | P0 | Planned |
| FM-04-TC02 | AC-1.2 | E2E/API | Filter single vehicle | P0 | Planned |
| FM-04-TC03 | AC-1.3 | E2E | Empty state | P1 | Planned |
| FM-04-TC04 | AC-2.1 | E2E/API | Stats match filter | P0 | Planned |
| FM-04-TC05 | AC-2.2 | API | Stats All Vehicles | P0 | Planned |
| FM-04-TC06 | AC-3.1 | API | Supervisor all own-fleet | P0 | Planned |
| FM-04-TC07 | AC-3.2 | API | Driver scoped history | P0 | Planned |
| FM-04-TC08 | AC-3.3 | API | Unauthorized denied | P0 | Planned |
| FM-04-TC09 | AC-4.1 | API | List filter + ordering | P0 | Planned |
| FM-04-TC10 | AC-4.2 | API | Vehicle fuel-history endpoint | P0 | Planned |

→ [FM-04 detail](./FM-04-fuel-history-and-filters-tdd-test-cases.md)

## Totals

| Story | Primary TCs | Edge rows (in detail files) |
|-------|-------------|------------------------------|
| FM-01 | 15 | ~6 |
| FM-02 | 15 | ~6 |
| FM-03 | 10 | ~4 |
| FM-04 | 10 | ~5 |
| FM-05 | 10 | ~4 |
| **Total** | **~60** | **~25** |
