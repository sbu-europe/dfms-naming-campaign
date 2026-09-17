---
section: 09-testing/stories-phase-2/001-Odometer-Based Vehicle Maintenance Tracking
specification: Odometer-Based Vehicle Maintenance Tracking — all TDD test cases (index)
phase: Phase 2
tdd: true
last_updated: 2026-09-15
---

# Odometer-Based Vehicle Maintenance Tracking — All TDD test cases (index)

Master index. Detail + asserts live in per-story files. Status defaults to **Planned** until code exists.

## FVM-01 — Meter entry, remaining km, indicators (unit-first)

| TC ID | AC | Layer | Scenario | Priority | Status |
|-------|-----|-------|----------|----------|--------|
| FVM-01-TC01 | AC-1.1 | E2E/API | Record meter reading | P0 | Planned |
| FVM-01-TC02 | AC-1.2 | API | First reading seeds starting km | P0 | Planned |
| FVM-01-TC03 | AC-1.3 | API | Equal or higher km accepted | P0 | Planned |
| FVM-01-TC04 | AC-1.4 | API | Lower km rejected | P0 | Planned |
| FVM-01-TC05 | AC-1.5 | API | Accepted reading in history | P0 | Planned |
| FVM-01-TC06 | AC-1.6 | E2E/API | No reading → odometer unavailable | P0 | Planned |
| FVM-01-TC07 | AC-1.7 | API | Live GPS unchanged | P0 | Planned |
| FVM-01-TC08 | AC-2.1 | Unit | Distance since last service | P0 | Planned |
| FVM-01-TC09 | AC-2.2 | Unit | Remaining km formula | P0 | Planned |
| FVM-01-TC10 | AC-2.3 | Unit | No last service uses starting km | P0 | Planned |
| FVM-01-TC11 | AC-2.4 | Unit/E2E | Remaining unknown without starting point | P0 | Planned |
| FVM-01-TC12 | AC-2.5 | Unit/E2E | Due soon flag | P0 | Planned |
| FVM-01-TC13 | AC-2.6 | Unit/E2E | Overdue flag | P0 | Planned |
| FVM-01-TC14 | AC-2.7 | API | Service log does not change availability | P0 | Planned |
| FVM-01-TC15 | AC-3.1 | API | Interval stored on that vehicle only | P0 | Planned |
| FVM-01-TC16 | AC-3.2 | Unit/API | No interval → remaining unknown | P0 | Planned |
| FVM-01-TC17 | AC-3.3 | E2E | Planner sees each vehicle’s interval | P1 | Planned |
| FVM-01-TC18 | AC-4.1 | Unit | Average daily distance | P0 | Planned |
| FVM-01-TC19 | AC-4.2 | API | Top 5 busiest routes | P0 | Planned |
| FVM-01-TC20 | AC-4.3 | API | Per-vehicle share of Top 5 routes | P0 | Planned |
| FVM-01-TC21 | AC-4.4 | Unit | Idle vs moving from GPS speed | P0 | Planned |
| FVM-01-TC22 | AC-5.1 | API | Top 5 vehicles by completed TOs | P0 | Planned |
| FVM-01-TC23 | AC-5.2 | Unit | Rank uses completed TO count only | P0 | Planned |
| FVM-01-TC24 | AC-5.3 | Unit | Ties for 5th included | P0 | Planned |
| FVM-01-TC25 | AC-5.4 | Unit | Zero completed TOs excluded | P0 | Planned |
| FVM-01-TC26 | AC-6.1 | E2E/API | Driver Supervisor can enter | P0 | Planned |
| FVM-01-TC27 | AC-6.2 | E2E | Planner and Tenant Admin can view | P0 | Planned |
| FVM-01-TC28 | AC-6.3 | E2E/API | Filters overdue / due soon / unavailable | P0 | Planned |
| FVM-01-TC29 | AC-6.4 | E2E/API | Date range default last 30 days | P1 | Planned |
| FVM-01-TC30 | AC-6.5 | API | Tenant Admin sets interval on that vehicle | P0 | Planned |
| FVM-01-TC31 | AC-6.6 | E2E/API | Planner cannot enter meter km | P0 | Planned |

→ [FVM-01 detail](./FVM-01-odometer-based-vehicle-maintenance-tracking-tdd-test-cases.md)

## Totals

| Story | Primary TCs | Edge rows (in detail files) |
|-------|-------------|------------------------------|
| FVM-01 | 31 | 13 |
| **Total** | **31** | **13** |
