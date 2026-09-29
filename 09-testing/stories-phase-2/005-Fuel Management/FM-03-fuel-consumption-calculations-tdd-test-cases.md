---
section: 09-testing/stories-phase-2/005-Fuel Management
specification: FM-03 Fuel Consumption Calculations — TDD test cases
version: 1.0
phase: Phase 2
tdd: true
related_stories: FM-03
source_spec: ../../../../03-backlog/stories-phase-2/005-Fuel Management/FM-03-fuel-consumption-calculations.md
module_spec: ../../../../05-modules/08-fleet-management/fuel-management.md
suggested_impl:
  unit: FuelCalculationService.calculate(entry, previous_entry)
  api: Invoked on POST /api/v1/fuel-entries/
last_updated: 2026-09-14
---

# FM-03 — Fuel Consumption Calculations — TDD test cases

**Story:** [FM-03](../../../../03-backlog/stories-phase-2/005-Fuel%20Management/FM-03-fuel-consumption-calculations.md)  
**TDD start here:** pure unit tests for `FuelCalculationService` with no UI.  
**Used by:** FM-01, FM-02 on save.

## Numeric fixture (TC01)

| Field | Value |
|-------|-------|
| Previous odometer | 10000 |
| Current odometer | 10500 |
| Before / After | 20 / 60 |
| Cost (BDT) | 4000 |
| Expected quantity | 40 |
| Expected distance | 500 |
| Expected km/L | 12.5 |
| Expected ৳/km | 8 |
| Expected ৳/L | 100 |

---

## A — Computed fields (AC-1)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FM-03-TC01 | AC-1.1 | Unit | Metrics from consecutive entries | Given prior + new entry (fixture above). When `calculate` / save. Assert quantity=40, distance=500, km/L=12.5, cost_per_km=8, cost_per_liter=100. | P0 | Planned |
| FM-03-TC02 | AC-1.2 | Unit | Quantity override respected | Auto qty 40; override 38 + note. Assert stored qty=38; km/L and ৳/L use 38. | P0 | Planned |
| FM-03-TC03 | AC-1.3 | Unit | Distance is odometer delta | Odometer delta 300. Assert distance=300; GPS path not consulted. | P0 | Planned |

## B — Odometer validation (AC-2)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FM-03-TC04 | AC-2.1 | Unit / API | Odometer equal rejected | Last=12000; new=12000. Assert reject; vehicle odometer unchanged. | P0 | Planned |
| FM-03-TC05 | AC-2.2 | Unit / API | Odometer less rejected | Last=12000; new=11999. Assert reject. | P0 | Planned |
| FM-03-TC06 | AC-2.3 | Unit / API | Valid odometer updates vehicle | Last=12000; new=12500 saved. Assert `Vehicle.current_odometer_reading=12500`. | P0 | Planned |

## C — First entry (AC-3)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FM-03-TC07 | AC-3.1 | Unit | First entry null distance metrics | No prior; before=10, after=50, cost=3000, odo=5000. Assert distance/km/L/cost_per_km null; cost_per_liter=75; save OK. | P0 | Planned |
| FM-03-TC08 | AC-3.2 | E2E / UI | First entry UI note | Form for vehicle with no history. Assert message “First entry — baseline established from next fill-up.” | P1 | Planned |

## D — Service edge behaviour (AC-4)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FM-03-TC09 | AC-4.1 | Unit | previous_entry null | `calculate(entry, null)`. Assert distance/km/L/cost_per_km null; quantity + cost_per_liter set. | P0 | Planned |
| FM-03-TC10 | AC-4.2 | Unit | distance ≤ 0 → null km/L | previous exists but distance ≤ 0. Assert km/L and cost_per_km null (persist path should usually reject via AC-2). | P1 | Planned |

---

## Edge cases (from story)

| Test Case ID | Layer | Scenario | Assert | Priority | Status |
|--------------|-------|----------|--------|----------|--------|
| FM-03-EC01 | Unit | quantity 0 / after==before | No divide-by-zero; fail closed (prefer reject before calculate) | P0 | Planned |
| FM-03-EC02 | Unit | DRIVER then SUPERVISOR previous | Calculation identical regardless of prior entry_type | P1 | Planned |
| FM-03-EC03 | Unit | Tiny quantity large distance | Still computes km/L | P2 | Planned |
| FM-03-EC04 | — | Back-dated entry between two | TODO(PO) — latest-odometer-only vs recalculate chain | P2 | Blocked (PO) |

---

## Suggested code test targets (TDD)

```
tests/unit/.../test_fuel_calculation_service.py   # TC01–03, TC07, TC09–10, EC01–03
tests/api/.../test_fuel_entry_odometer.py         # TC04–06
```

**Implement order:** TC09 → TC01 → TC07 → TC04–06 → TC02 → rest.
