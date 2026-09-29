---
section: 09-testing/stories-phase-2/002-Vehicle Tracking and Dashboard
specification: Vehicle Tracking and Dashboard — all TDD test cases (index)
phase: Phase 2
tdd: true
last_updated: 2026-09-15
---

# Vehicle Tracking and Dashboard — All TDD test cases (index)

Master index. Detail + asserts live in per-story files. Status defaults to **Planned** until code exists.

## FVM-02 — Health Dashboard (API counts first)

| TC ID | AC | Layer | Scenario | Priority | Status |
|-------|-----|-------|----------|----------|--------|
| FVM-02-TC01 | AC-1.1 | E2E/API | Five status counts | P0 | Planned |
| FVM-02-TC02 | AC-1.2 | API | Counts match real status | P0 | Planned |
| FVM-02-TC03 | AC-1.3 | E2E | Clicking a card filters the list | P0 | Planned |
| FVM-02-TC04 | AC-1.4 | API | In-transit = started TO, not GPS | P0 | Planned |
| FVM-02-TC05 | AC-2.1 | API/E2E | Depot filter | P0 | Planned |
| FVM-02-TC06 | AC-2.2 | API/E2E | Own-fleet default | P0 | Planned |
| FVM-02-TC07 | AC-2.3 | API/E2E | Type and registration search | P1 | Planned |
| FVM-02-TC08 | AC-2.4 | API | Cards and list share filters | P0 | Planned |
| FVM-02-TC09 | AC-3.1 | E2E/API | Show current km when reading exists | P0 | Planned |
| FVM-02-TC10 | AC-3.2 | E2E/API | No reading → odometer unavailable | P0 | Planned |
| FVM-02-TC11 | AC-3.3 | E2E/API | Dashboard cannot change meter km | P0 | Planned |
| FVM-02-TC12 | AC-4.1 | API/E2E | Fuel liters when entries exist | P1 | Planned |
| FVM-02-TC13 | AC-4.2 | API/E2E | Fuel unavailable without entries | P0 | Planned |
| FVM-02-TC14 | AC-4.3 | E2E | No fuel-entry form on dashboard | P0 | Planned |
| FVM-02-TC15 | AC-5.1 | E2E/API | Current availability status | P0 | Planned |
| FVM-02-TC16 | AC-5.2 | E2E/API | Current TO, driver, trip | P0 | Planned |
| FVM-02-TC17 | AC-5.3 | E2E | Maintenance history | P1 | Planned |
| FVM-02-TC18 | AC-5.4 | API | Under Maintenance still not assignable | P0 | Planned |
| FVM-02-TC19 | AC-6.1 | E2E | Planner and Tenant Admin full dashboard | P0 | Planned |
| FVM-02-TC20 | AC-6.2 | E2E | Driver Supervisor may view | P1 | Planned |
| FVM-02-TC21 | AC-6.3 | E2E | Not the live GPS map | P0 | Planned |

→ [FVM-02 detail](./FVM-02-vehicle-tracking-and-dashboard-tdd-test-cases.md)

## Totals

| Story | Primary TCs | Edge rows (in detail files) |
|-------|-------------|------------------------------|
| FVM-02 | 21 | 8 |
| **Total** | **21** | **8** |
