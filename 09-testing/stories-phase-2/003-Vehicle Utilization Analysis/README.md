---
section: 09-testing/stories-phase-2/003-Vehicle Utilization Analysis
phase: Phase 2
epic: Fleet & Vehicle Management — Utilization
tdd: true
last_updated: 2026-09-15
source_stories: ../../../03-backlog/stories-phase-2/003-Vehicle Utilization Analysis/
module_spec: ../../../05-modules/02-master-data/vehicle-master-data.md
---

# 003 — Vehicle Utilization Analysis — TDD test catalogs

Derived from story **Given–When–Then** scenarios (`AC-N.x`). Write failing tests first; implement until green.

A **trip** = a completed **Plan** (Multi-TO Plan = 1). Idle vs moving is **GPS speed &lt; 3 km/h**, not “no trip”. Available hours subtract FVM-04 downtime (0 until logs exist).

| File | Story | Preferred first layer | P0 focus |
|------|-------|----------------------|----------|
| [00-all-test-cases.md](./00-all-test-cases.md) | Index | — | Full TC matrix |
| [FVM-03](./FVM-03-vehicle-utilization-analysis-tdd-test-cases.md) | Utilization analysis | **Unit** hours + Plan count | Multi-TO = 1, GPS idle, clip/union, util % |

## Recommended TDD order

1. **Unit** completed-Plan count (`AC-1`)
2. **Unit** serving-hour clip + overlap union (`AC-2.1`, `AC-2.2`)
3. **Unit** GPS idle vs moving + unavailable (`AC-2.3`, `AC-2.4`)
4. **Unit** available hours + util % (`AC-2.5`, `AC-2.7`) — downtime hours 0 until FVM-04
5. **E2E** list / chart / sort / RBAC (`AC-3`)

## ID convention

| ID | Meaning |
|----|---------|
| `FVM-03-TC##` | Primary test case for story FVM-03 |
| `AC-N.x` | Source GWT checkbox on the story file (nth under AC-N) |
| `FVM-03-EC##` | Edge-case row |

**Status values:** `Planned` · `Failing` · `Passing` · `Blocked (PO)`

## Story links

- [FVM-03](../../../03-backlog/stories-phase-2/003-Vehicle%20Utilization%20Analysis/FVM-03-vehicle-utilization-analysis.md)
