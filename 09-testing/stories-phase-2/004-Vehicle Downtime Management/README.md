---
section: 09-testing/stories-phase-2/004-Vehicle Downtime Management
phase: Phase 2
epic: Fleet & Vehicle Management — Downtime
tdd: true
last_updated: 2026-09-15
source_stories: ../../../03-backlog/phase-2/stories-phase-2/004-Vehicle Downtime Management/
module_spec: ../../../05-modules/02-master-data/vehicle-master-data.md
---

# 004 — Vehicle Downtime Management — TDD test catalogs

Derived from story **Given–When–Then** scenarios (`AC-N.x`). Write failing tests first; implement until green.

Open downtime covering now → **Under Maintenance** (reuse DS-01 mark). FVM-01 service log still does **not** set UM. Available hours for FVM-03 subtract overlapping downtime.

| File | Story | Preferred first layer | P0 focus |
|------|-------|----------------------|----------|
| [00-all-test-cases.md](./00-all-test-cases.md) | Index | — | Full TC matrix |
| [FVM-04](./FVM-04-vehicle-downtime-management-tdd-test-cases.md) | Downtime log + status | **API** then unit hours | Open/close, in-transit reject, picker, hour clip |

## Recommended TDD order

1. **API** create / reject invalid / one open log (`AC-1`)
2. **API** covering-now → UM; in-transit reject; service log regression (`AC-2`)
3. **API** available picker + FVM-02 card + restore No Active TO (`AC-3`)
4. **Unit** downtime overlap hours for FVM-03 (`AC-4`)
5. **E2E / API** RBAC (`AC-5`)

## ID convention

| ID | Meaning |
|----|---------|
| `FVM-04-TC##` | Primary test case for story FVM-04 |
| `AC-N.x` | Source GWT checkbox on the story file (nth under AC-N) |
| `FVM-04-EC##` | Edge-case row |

**Status values:** `Planned` · `Failing` · `Passing` · `Blocked (PO)`

## Story links

- [FVM-04](../../../03-backlog/phase-2/stories-phase-2/004-Vehicle%20Downtime%20Management/FVM-04-vehicle-downtime-management.md)
