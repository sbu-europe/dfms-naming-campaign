---
section: 09-testing/stories-phase-2/001-Odometer-Based Vehicle Maintenance Tracking
phase: Phase 2
epic: Fleet & Vehicle Management — Maintenance
tdd: true
last_updated: 2026-09-15
source_stories: ../../../03-backlog/stories-phase-2/001-Odometer-Based Vehicle Maintenance Tracking/
module_spec: ../../../05-modules/02-master-data/vehicle-master-data.md
---

# 001 — Odometer-Based Vehicle Maintenance Tracking — TDD test catalogs

Derived from story **Given–When–Then** scenarios (`AC-N.x`). Write failing tests first; implement until green.

Remaining km is **supervisor meter reading**, not GPS mileage. Idle vs movement uses GPS speed **&lt; 3 km/h**. Service interval is **per vehicle only** (no company-wide default).

| File | Story | Preferred first layer | P0 focus |
|------|-------|----------------------|----------|
| [00-all-test-cases.md](./00-all-test-cases.md) | Index | — | Full TC matrix |
| [FVM-01](./FVM-01-odometer-based-vehicle-maintenance-tracking-tdd-test-cases.md) | Meter entry + remaining km + indicators | **Unit** (formulas) then API | Monotonic km, remaining, Due soon/Overdue, RBAC |

## Recommended TDD order

1. **Unit** remaining-km / Due soon / Overdue (`AC-2`, `AC-3.2`)
2. **API** meter entry + monotonic write (`AC-1`)
3. **Unit** avg daily km, idle vs moving, Top 5 (`AC-4`, `AC-5`)
4. **API / E2E** interval config, filters, RBAC (`AC-3`, `AC-6`)

## ID convention

| ID | Meaning |
|----|---------|
| `FVM-01-TC##` | Primary test case for story FVM-01 |
| `AC-N.x` | Source GWT checkbox on the story file (nth under AC-N) |
| `FVM-01-EC##` | Edge-case row |

**Status values:** `Planned` · `Failing` · `Passing` · `Blocked (PO)`

## Story links

- [FVM-01](../../../03-backlog/stories-phase-2/001-Odometer-Based%20Vehicle%20Maintenance%20Tracking/FVM-01-odometer-based-vehicle-maintenance-tracking.md)
