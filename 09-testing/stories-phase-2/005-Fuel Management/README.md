---
section: 09-testing/stories-phase-2/005-Fuel Management
phase: Phase 2
epic: Fuel Management
tdd: true
last_updated: 2026-09-14
source_stories: ../../../03-backlog/stories-phase-2/005-Fuel Management/
module_spec: ../../../05-modules/08-fleet-management/fuel-management.md
---

# 005 — Fuel Management — TDD test catalogs

Derived from story **Given–When–Then** scenarios (`AC-N.x`). Write failing tests first; implement until green.

| File | Story | Preferred first layer | P0 focus |
|------|-------|----------------------|----------|
| [00-all-test-cases.md](./00-all-test-cases.md) | Index | — | Full TC matrix |
| [FM-01](./FM-01-fuel-entry-admin-tdd-test-cases.md) | Supervisor admin entry | API + Admin E2E | Create, validation, RBAC |
| [FM-02](./FM-02-fuel-entry-driver-mobile-tdd-test-cases.md) | Driver mobile entry | API + Maestro | Assignment, GPS, offline |
| [FM-03](./FM-03-fuel-consumption-calculations-tdd-test-cases.md) | Calculations | **Unit** (start here) | Metrics, odometer |
| [FM-04](./FM-04-fuel-history-and-filters-tdd-test-cases.md) | History & filters | API + Admin E2E | List, stats, RBAC |
| [FM-05](./FM-05-fuel-anomaly-baselines-tdd-test-cases.md) | Anomaly baselines | **Unit** | Boundaries, own-fleet |

## Recommended TDD order

1. **FM-03** unit (`FuelCalculationService`)  
2. **FM-05** unit (baseline + anomaly)  
3. **FM-01** API create/validate (+ admin E2E)  
4. **FM-02** API + Maestro  
5. **FM-04** list/stats API (+ UI)

## ID convention

| ID | Meaning |
|----|---------|
| `FM-0x-TC##` | Primary test case for story FM-0x |
| `AC-N.x` | Source scenario on the story file |
| `FM-0x-EC##` | Edge-case row from story Edge Cases |

**Status values:** `Planned` · `Failing` · `Passing` · `Blocked (PO)`

## Story links

- [FM-01](../../../03-backlog/stories-phase-2/005-Fuel%20Management/FM-01-fuel-entry-driver-supervisor-admin.md)
- [FM-02](../../../03-backlog/stories-phase-2/005-Fuel%20Management/FM-02-fuel-entry-driver-mobile.md)
- [FM-03](../../../03-backlog/stories-phase-2/005-Fuel%20Management/FM-03-fuel-consumption-calculations.md)
- [FM-04](../../../03-backlog/stories-phase-2/005-Fuel%20Management/FM-04-fuel-history-and-filters.md)
- [FM-05](../../../03-backlog/stories-phase-2/005-Fuel%20Management/FM-05-fuel-anomaly-baselines.md)
