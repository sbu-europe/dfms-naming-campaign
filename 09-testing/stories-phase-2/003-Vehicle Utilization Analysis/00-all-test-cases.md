---
section: 09-testing/stories-phase-2/003-Vehicle Utilization Analysis
specification: Vehicle Utilization Analysis — all TDD test cases (index)
phase: Phase 2
tdd: true
last_updated: 2026-09-15
---

# Vehicle Utilization Analysis — All TDD test cases (index)

Master index. Detail + asserts live in per-story files. Status defaults to **Planned** until code exists.

## FVM-03 — Utilization (unit-first)

| TC ID | AC | Layer | Scenario | Priority | Status |
|-------|-----|-------|----------|----------|--------|
| FVM-03-TC01 | AC-1.1 | Unit | Multi-TO Plan counts as 1 trip | P0 | Planned |
| FVM-03-TC02 | AC-1.2 | Unit | Each plan counted once; finish in period | P0 | Planned |
| FVM-03-TC03 | AC-1.3 | Unit | Cancelled work not counted | P0 | Planned |
| FVM-03-TC04 | AC-1.4 | API/E2E | Zero-trip vehicles still listed | P0 | Planned |
| FVM-03-TC05 | AC-1.5 | API | Hired vendor trucks excluded | P0 | Planned |
| FVM-03-TC06 | AC-2.1 | Unit | Serving hours clipped to period | P0 | Planned |
| FVM-03-TC07 | AC-2.2 | Unit | Overlapping TOs counted once | P0 | Planned |
| FVM-03-TC08 | AC-2.3 | Unit | Idle vs moving from GPS | P0 | Planned |
| FVM-03-TC09 | AC-2.4 | Unit/E2E | No GPS → idle vs movement unavailable | P0 | Planned |
| FVM-03-TC10 | AC-2.5 | Unit | Available hours subtract downtime | P0 | Planned |
| FVM-03-TC11 | AC-2.6 | E2E | Chart moving vs idle/stopped | P1 | Planned |
| FVM-03-TC12 | AC-2.7 | Unit | Utilization % | P0 | Planned |
| FVM-03-TC13 | AC-3.1 | E2E | Planner and Tenant Admin can view | P0 | Planned |
| FVM-03-TC14 | AC-3.2 | E2E/API | Sort by trips or utilization | P1 | Planned |
| FVM-03-TC15 | AC-3.3 | E2E | Driver Supervisor may view | P1 | Planned |
| FVM-03-TC16 | AC-3.4 | E2E/API | Screen does not change assignments | P0 | Planned |

→ [FVM-03 detail](./FVM-03-vehicle-utilization-analysis-tdd-test-cases.md)

## Totals

| Story | Primary TCs | Edge rows (in detail files) |
|-------|-------------|------------------------------|
| FVM-03 | 16 | 10 |
| **Total** | **16** | **10** |
