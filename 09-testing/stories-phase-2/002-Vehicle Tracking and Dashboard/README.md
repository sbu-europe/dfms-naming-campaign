---
section: 09-testing/stories-phase-2/002-Vehicle Tracking and Dashboard
phase: Phase 2
epic: Fleet & Vehicle Management — Health Dashboard
tdd: true
last_updated: 2026-09-15
source_stories: ../../../03-backlog/phase-2/stories-phase-2/002-Vehicle Tracking and Dashboard/
module_spec: ../../../05-modules/02-master-data/vehicle-master-data.md
---

# 002 — Vehicle Tracking and Dashboard — TDD test catalogs

Derived from story **Given–When–Then** scenarios (`AC-N.x`). Write failing tests first; implement until green.

Five cards are **`operational_status` now**, not GPS idle and not FVM-03 period hours. Kilometers come from FVM-01; fuel from FuelEntry when it exists.

| File | Story | Preferred first layer | P0 focus |
|------|-------|----------------------|----------|
| [00-all-test-cases.md](./00-all-test-cases.md) | Index | — | Full TC matrix |
| [FVM-02](./FVM-02-vehicle-tracking-and-dashboard-tdd-test-cases.md) | Fleet Health Dashboard | **API** counts + filters | Status cards, own-fleet, unavailable km/fuel |

## Recommended TDD order

1. **API** five-status counts vs `operational_status` (`AC-1`)
2. **API** depot / own-fleet / type / search (`AC-2`)
3. **API** odometer unavailable + fuel unavailable (`AC-3`, `AC-4`)
4. **E2E** detail + RBAC (`AC-5`, `AC-6`)

## ID convention

| ID | Meaning |
|----|---------|
| `FVM-02-TC##` | Primary test case for story FVM-02 |
| `AC-N.x` | Source GWT checkbox on the story file (nth under AC-N) |
| `FVM-02-EC##` | Edge-case row |

**Status values:** `Planned` · `Failing` · `Passing` · `Blocked (PO)`

## Story links

- [FVM-02](../../../03-backlog/phase-2/stories-phase-2/002-Vehicle%20Tracking%20and%20Dashboard/FVM-02-vehicle-tracking-and-dashboard.md)
