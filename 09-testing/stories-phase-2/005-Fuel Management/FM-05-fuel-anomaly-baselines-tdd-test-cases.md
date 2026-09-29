---
section: 09-testing/stories-phase-2/005-Fuel Management
specification: FM-05 Fuel Efficiency Baselines & Anomaly — TDD test cases
version: 1.0
phase: Phase 2
tdd: true
related_stories: FM-05
source_spec: ../../../03-backlog/phase-2/stories-phase-2/005-Fuel Management/FM-05-fuel-anomaly-baselines.md
module_spec: ../../../../05-modules/08-fleet-management/fuel-management.md
suggested_impl:
  unit: baseline lookup + anomaly_flag on save
  api: POST fuel-entries response; history; VR-03 fuel.anomaly
last_updated: 2026-09-14
---

# FM-05 — Baselines & Anomaly Detection — TDD test cases

**Story:** [FM-05](../../../03-backlog/phase-2/stories-phase-2/005-Fuel%20Management/FM-05-fuel-anomaly-baselines.md)  
**TDD start:** unit tests for baseline map + `>20% below avg` rule (after FM-03 km/L exists).  
**Rule:** flag when km/L is **more than** 20% below baseline average; exact boundary is **not** anomaly.

## Baseline table (v1 hard-coded)

| Vehicle Type | Avg (km/L) | Flag if km/L |
|--------------|------------|--------------|
| Light Truck (3–5 t) | 10 | < 8.0 |
| Medium Truck (7–10 t) | 7 | < 5.6 |
| Heavy Truck (15–20 t) | 5 | < 4.0 |

---

## A — Baselines (AC-1)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FM-05-TC01 | AC-1.1 | Unit | Light truck baseline | Light Truck type. Assert avg=10; 20% threshold=8.0. | P0 | Planned |
| FM-05-TC02 | AC-1.2 | Unit | Unmapped vehicle_type | Unknown type. Assert no crash; anomaly not set from baseline. (Exact fallback TODO(PO).) | P1 | Planned |

## B — Anomaly flag (AC-2)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FM-05-TC03 | AC-2.1 | Unit | >20% below flags | Medium Truck avg 7; km/L=5.0. Assert `anomaly_flag=true`; entry saved. | P0 | Planned |
| FM-05-TC04 | AC-2.2 | Unit | Exactly 20% below not flagged | Avg 10; km/L=8.0 exactly. Assert `anomaly_flag=false`. | P0 | Planned |
| FM-05-TC05 | AC-2.3 | Unit | Above threshold Normal | Avg 10; km/L=9.0. Assert false / Status Normal. | P0 | Planned |
| FM-05-TC06 | AC-2.4 | Unit | Null km/L no anomaly | First entry km/L null. Assert `anomaly_flag=false`. | P0 | Planned |

## C — Own-fleet enforcement (AC-3)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FM-05-TC07 | AC-3.1 | API | Vendor vehicle rejected | POST fuel entry for vendor vehicle. Assert reject; no row. | P0 | Planned |
| FM-05-TC08 | AC-3.2 | E2E | Vendor not in picker | Admin picker. Assert vendor vehicles absent. | P0 | Planned |

## D — Downstream (AC-4)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FM-05-TC09 | AC-4.1 | API | History includes anomaly_flag | Entry with flag true. GET history. Assert payload + UI Status. | P0 | Planned |
| FM-05-TC10 | AC-4.2 | API | Vehicle report fuel.anomaly | VR-03 detail for vehicle with anomalous entry. Assert `fuel.anomaly` reflects signal. | P1 | Planned |

---

## Edge cases (from story)

| Test Case ID | Layer | Scenario | Assert | Priority | Status |
|--------------|-------|----------|--------|----------|--------|
| FM-05-EC01 | Unit | km/L 7.99 vs threshold 8.0 | Flagged (strictly below) | P0 | Planned |
| FM-05-EC02 | Unit | High efficiency above baseline | Not flagged in v1 | P1 | Planned |
| FM-05-EC03 | Unit | Override quantity changes km/L | Anomaly uses stored (override) quantity path | P1 | Planned |
| FM-05-EC04 | API | No clear/override anomaly API | Clear/override endpoints absent or 405 | P2 | Planned |

---

## Suggested code test targets (TDD)

```
tests/unit/.../test_fuel_anomaly_baselines.py   # TC01–06, EC01–03
tests/api/.../test_fuel_own_fleet_and_anomaly.py # TC07, TC09
tests/api/.../test_vehicle_report_fuel_anomaly.py # TC10 (with VR-03)
```

**Implement order:** TC01 → TC04 (boundary) → TC03 → TC06 → TC07 → rest.
