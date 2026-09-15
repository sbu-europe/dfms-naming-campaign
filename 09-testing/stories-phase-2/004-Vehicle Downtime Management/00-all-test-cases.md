---
section: 09-testing/stories-phase-2/004-Vehicle Downtime Management
specification: Vehicle Downtime Management — all TDD test cases (index)
phase: Phase 2
tdd: true
last_updated: 2026-09-15
---

# Vehicle Downtime Management — All TDD test cases (index)

Master index. Detail + asserts live in per-story files. Status defaults to **Planned** until code exists.

## FVM-04 — Downtime log (API-first)

| TC ID | AC | Layer | Scenario | Priority | Status |
|-------|-----|-------|----------|----------|--------|
| FVM-04-TC01 | AC-1.1 | E2E/API | Log downtime with reason and times | P0 | Planned |
| FVM-04-TC02 | AC-1.2 | API | Who entered it is recorded | P0 | Planned |
| FVM-04-TC03 | AC-1.3 | API | End before start rejected | P0 | Planned |
| FVM-04-TC04 | AC-1.4 | API | Second open downtime rejected | P0 | Planned |
| FVM-04-TC05 | AC-1.5 | E2E/API | List newest first and close | P0 | Planned |
| FVM-04-TC06 | AC-2.1 | API | Open downtime covering now → UM | P0 | Planned |
| FVM-04-TC07 | AC-2.2 | API | Assigned not-started TOs unassigned | P0 | Planned |
| FVM-04-TC08 | AC-2.3 | API | In-transit start rejected | P0 | Planned |
| FVM-04-TC09 | AC-2.4 | API | Service log does not set UM | P0 | Planned |
| FVM-04-TC10 | AC-3.1 | API | Not in available assignment list | P0 | Planned |
| FVM-04-TC11 | AC-3.2 | API/E2E | FVM-02 Under Maintenance card includes vehicle | P0 | Planned |
| FVM-04-TC12 | AC-3.3 | API | Ending last downtime → No Active TO | P0 | Planned |
| FVM-04-TC13 | AC-3.4 | API | Inactive stays inactive after end | P0 | Planned |
| FVM-04-TC14 | AC-4.1 | Unit | Only overlapping downtime counted | P0 | Planned |
| FVM-04-TC15 | AC-4.2 | Unit | Available hours = period − downtime | P0 | Planned |
| FVM-04-TC16 | AC-4.3 | Unit | Idle vs movement stays GPS | P0 | Planned |
| FVM-04-TC17 | AC-4.4 | Unit | Utilization % uses available hours | P0 | Planned |
| FVM-04-TC18 | AC-5.1 | E2E/API | Supervisor and Tenant Admin can record | P0 | Planned |
| FVM-04-TC19 | AC-5.2 | E2E/API | Planner view only | P0 | Planned |
| FVM-04-TC20 | AC-5.3 | E2E | Out of scope surfaces | P1 | Planned |

→ [FVM-04 detail](./FVM-04-vehicle-downtime-management-tdd-test-cases.md)

## Totals

| Story | Primary TCs | Edge rows (in detail files) |
|-------|-------------|------------------------------|
| FVM-04 | 20 | 10 |
| **Total** | **20** | **10** |
