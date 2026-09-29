---
section: 09-testing/stories-phase-2/007-Fleet Health Inspection
specification: Fleet Health Inspection — all TDD test cases (index)
phase: Phase 2
tdd: true
last_updated: 2026-09-14
---

# Fleet Health Inspection — All TDD test cases (index)

Master index. Detail + asserts live in per-story files. Status defaults to **Planned** until code exists.

## FHI-01 — Checklist templates (model/API-first)

| TC ID | AC | Layer | Scenario | Priority | Status |
|-------|-----|-------|----------|----------|--------|
| FHI-01-TC01 | AC-1.1 | Unit/API | Required fields persist | P0 | Planned |
| FHI-01-TC02 | AC-1.2 | Unit/API | Category enum set | P0 | Planned |
| FHI-01-TC03 | AC-1.3 | Unit/API | interval_days positive int | P0 | Planned |
| FHI-01-TC04 | AC-1.4 | Unit/API | Per vehicle_type not vehicle | P0 | Planned |
| FHI-01-TC05 | AC-2.1 | E2E/API | Planner CRUD | P0 | Planned |
| FHI-01-TC06 | AC-2.2 | E2E/API | Filter by vehicle type | P0 | Planned |
| FHI-01-TC07 | AC-2.3 | API | Reorder sort_order | P1 | Planned |
| FHI-01-TC08 | AC-2.4 | API | DS view-only write denied | P0 | Planned |
| FHI-01-TC09 | AC-3.1 | Unit/API | Light truck seed | P0 | Planned |
| FHI-01-TC10 | AC-3.2 | Unit/API | Medium truck seed | P1 | Planned |
| FHI-01-TC11 | AC-4.1 | API | List ?vehicle_type= | P0 | Planned |
| FHI-01-TC12 | AC-4.2 | API | POST + PATCH by id | P0 | Planned |
| FHI-01-TC13 | AC-4.3 | API | Cross-tenant denied | P0 | Planned |

→ [FHI-01 detail](./FHI-01-inspection-checklist-templates-tdd-test-cases.md)

## FHI-03 — Conduct inspection round (submit)

| TC ID | AC | Layer | Scenario | Priority | Status |
|-------|-----|-------|----------|----------|--------|
| FHI-03-TC01 | AC-1.1 | E2E/API | Own-fleet loads checklist | P0 | Planned |
| FHI-03-TC02 | AC-1.2 | API | Optional odometer/notes | P1 | Planned |
| FHI-03-TC03 | AC-2.1 | API | Result enum accepted | P0 | Planned |
| FHI-03-TC04 | AC-2.2 | API | Optional line notes | P1 | Planned |
| FHI-03-TC05 | AC-2.3 | E2E | Row context columns | P1 | Planned |
| FHI-03-TC06 | AC-3.1 | API | Round + lines persisted | P0 | Planned |
| FHI-03-TC07 | AC-3.2 | Unit/API | Checkpoint state updated | P0 | Planned |
| FHI-03-TC08 | AC-3.3 | Unit/API | FAIL/ATTENTION last_result | P0 | Planned |
| FHI-03-TC09 | AC-4.1 | API | Missing result blocked | P0 | Planned |
| FHI-03-TC10 | AC-4.2 | API | Vendor vehicle rejected | P0 | Planned |
| FHI-03-TC11 | AC-5.1 | API | POST create round | P0 | Planned |
| FHI-03-TC12 | AC-5.2 | API | GET history | P0 | Planned |
| FHI-03-TC13 | AC-5.3 | API | Unauthorized create denied | P0 | Planned |

→ [FHI-03 detail](./FHI-03-conduct-inspection-round-tdd-test-cases.md)

## FHI-02 — Dashboard status math

| TC ID | AC | Layer | Scenario | Priority | Status |
|-------|-----|-------|----------|----------|--------|
| FHI-02-TC01 | AC-1.1 | API/E2E | Stats own-fleet only | P0 | Planned |
| FHI-02-TC02 | AC-1.2 | Unit/API | Failed last round counted | P0 | Planned |
| FHI-02-TC03 | AC-2.1 | Unit | OK >2 days from due | P0 | Planned |
| FHI-02-TC04 | AC-2.2 | Unit | Due soon 2-day window | P0 | Planned |
| FHI-02-TC05 | AC-2.3 | Unit | Overdue / never checked | P0 | Planned |
| FHI-02-TC06 | AC-2.4 | Unit/E2E | Failed/attention flag | P0 | Planned |
| FHI-02-TC07 | AC-2.5 | API | alerts_only filter | P0 | Planned |
| FHI-02-TC08 | AC-3.1 | E2E | Inspect pre-selects vehicle | P1 | Planned |
| FHI-02-TC09 | AC-4.1 | API | Dashboard rows + stats | P0 | Planned |
| FHI-02-TC10 | AC-4.2 | API | alerts_only query | P0 | Planned |
| FHI-02-TC11 | AC-4.3 | Unit | Service single path | P0 | Planned |

→ [FHI-02 detail](./FHI-02-inspection-dashboard-alerts-tdd-test-cases.md)

## FHI-04 — Report aggregation

| TC ID | AC | Layer | Scenario | Priority | Status |
|-------|-----|-------|----------|----------|--------|
| FHI-04-TC01 | AC-1.1 | API/E2E | Card alert counts | P0 | Planned |
| FHI-04-TC02 | AC-1.2 | E2E | Fleet overdue strip | P1 | Planned |
| FHI-04-TC03 | AC-2.1 | API/E2E | Detail inspection section | P0 | Planned |
| FHI-04-TC04 | AC-2.2 | E2E | Conduct link when permitted | P1 | Planned |
| FHI-04-TC05 | AC-3.1 | Unit | Delegates to status service | P0 | Planned |
| FHI-04-TC06 | AC-3.2 | API | List includes counts | P0 | Planned |
| FHI-04-TC07 | AC-3.3 | API | Detail includes section | P0 | Planned |

→ [FHI-04 detail](./FHI-04-inspection-alerts-on-vehicle-report-tdd-test-cases.md)

## Totals

| Story | Primary TCs | Edge rows (in detail files) |
|-------|-------------|------------------------------|
| FHI-01 | 13 | ~5 |
| FHI-02 | 11 | ~5 |
| FHI-03 | 13 | ~5 |
| FHI-04 | 7 | ~4 |
| **Total** | **~44** | **~19** |
