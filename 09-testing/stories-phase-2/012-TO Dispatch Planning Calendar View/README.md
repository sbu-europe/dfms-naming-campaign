---
section: 09-testing/stories-phase-2/012-TO Dispatch Planning Calendar View
phase: Phase 2
epic: Transport Planning Optimization
tdd: true
last_updated: 2026-09-17
source_stories: ../../../03-backlog/stories-phase-2/012-TO Dispatch Planning Calendar View/
prototype: ../../../../docs/prototypes/to-dispatch-planning-calendar.html
---

# 012 — TO Dispatch Planning (Calendar View) — TDD test catalogs

Derived from story **Given–When–Then** scenarios (`AC-N.x`) and the HTML prototype. Write failing tests first; implement until green.

Read-only **vehicle-lane** calendar. Unassigned TOs count in KPIs / result count and are omitted from lanes. Does **not** replace Transport orders or Vehicle planning. Idle gaps are visual gaps between planned bars — not FVM-03 GPS hours.

| File | Story | Preferred first layer | P0 focus |
|------|-------|----------------------|----------|
| [00-all-test-cases.md](./00-all-test-cases.md) | Index | — | Full TC matrix |
| [TO-03](./TO-03-to-dispatch-planning-calendar-view-tdd-test-cases.md) | Calendar view | **Unit** query + layout, then Admin E2E | Period set, unassigned omitted, stack/idle, filters, RBAC, no writes |

## Recommended TDD order

1. **Unit** period overlap + planning-eligible statuses (`BR-TO03-001`)
2. **Unit** timeline bars only when own-fleet `Vehicle` FK is set (`BR-TO03-002`)
3. **Unit** assignment filter + KPI aggregations (`BR-TO03-007`, AC-3)
4. **Unit** stack / concurrent / idle-gap layout (`AC-2.3`)
5. **E2E** shell, Daily/Weekly/Monthly, drawer, RBAC, no writes (`AC-1`, `AC-4`, `AC-5`)

## ID convention

| ID | Meaning |
|----|---------|
| `TO-03-TC##` | Primary test case for story TO-03 |
| `AC-N.x` | Source GWT checkbox on the story file (nth under AC-N) |
| `TO-03-EC##` | Edge-case row |

**Status values:** `Planned` · `Failing` · `Passing` · `Blocked (PO)`

`05-modules/` write-up is **TO-03-1** (not done). Catalog follows the story + prototype; once Django lands, code labels win.

## Story links

- [TO-03](../../../03-backlog/stories-phase-2/012-TO%20Dispatch%20Planning%20Calendar%20View/TO-03-to-dispatch-planning-calendar-view.md)
