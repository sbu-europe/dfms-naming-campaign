---
section: 09-testing/stories-phase-2/012-TO Dispatch Planning Calendar View
specification: TO Dispatch Planning Calendar View — all TDD test cases (index)
phase: Phase 2
tdd: true
last_updated: 2026-09-17
---

# TO Dispatch Planning (Calendar View) — All TDD test cases (index)

Master index. Detail + asserts live in the per-story file. Status defaults to **Planned** until code exists.

## TO-03 — Vehicle-lane calendar (unit query first)

| TC ID | AC | Layer | Scenario | Priority | Status |
|-------|-----|-------|----------|----------|--------|
| TO-03-TC01 | AC-1.1 | Unit | Period overlap includes unassigned | P0 | Planned |
| TO-03-TC02 | AC-1.1 | Unit | Result count = period-set size | P0 | Planned |
| TO-03-TC03 | AC-1.1 | Unit | Planning-eligible statuses only | P0 | Planned |
| TO-03-TC04 | AC-1.1 | Unit | `cancelled` excluded | P0 | Planned |
| TO-03-TC05 | AC-1.1 | Unit | Execution / closed statuses excluded | P0 | Planned |
| TO-03-TC06 | AC-1.1 | E2E | Menu, breadcrumb, header links | P0 | Planned |
| TO-03-TC07 | AC-1.2 | E2E | Daily 24 ticks, 12-hour labels | P0 | Planned |
| TO-03-TC08 | AC-1.2 | E2E | Weekly Sun–Sat, today highlighted | P0 | Planned |
| TO-03-TC09 | AC-1.2 | E2E | Monthly day columns, vehicle-first | P0 | Planned |
| TO-03-TC10 | AC-1.3 | E2E | Prev / Next / Today / date picker | P0 | Planned |
| TO-03-TC11 | AC-2.1 | Unit | Bar window `planned_start_at` → `planned_destination_arrival_at` | P0 | Planned |
| TO-03-TC12 | AC-2.1 | E2E | Bar chrome + own/vendor + critical | P0 | Planned |
| TO-03-TC13 | AC-2.1 | E2E | Tooltip fields | P1 | Planned |
| TO-03-TC14 | AC-2.1 | E2E | Paginated own-fleet vehicle rows | P0 | Planned |
| TO-03-TC15 | AC-2.2 | Unit/E2E | Unassigned omitted from lanes, counted | P0 | Planned |
| TO-03-TC16 | AC-2.2 | Unit/E2E | Vendor TO with no `Vehicle` never draws | P0 | Planned |
| TO-03-TC17 | AC-2.3 | Unit/E2E | Overlap stacks; N TO(s) · M concurrent | P0 | Planned |
| TO-03-TC18 | AC-2.3 | Unit/E2E | Idle gap between non-overlapping bars | P0 | Planned |
| TO-03-TC19 | AC-2.3 | E2E | Empty vehicle row **Free** | P0 | Planned |
| TO-03-TC20 | AC-2.3 | E2E | Under-maintenance row still listed | P0 | Planned |
| TO-03-TC21 | AC-3.1 | Unit | Five KPI cards for period + filters | P0 | Planned |
| TO-03-TC22 | AC-3.2 | Unit/E2E | Search TO/TR/vehicle/driver/origin/dest | P0 | Planned |
| TO-03-TC23 | AC-3.2 | Unit/E2E | Fleet, transfer, urgency, assignment filters | P0 | Planned |
| TO-03-TC24 | AC-3.2 | E2E | Vehicle type filters bars **and** rows | P0 | Planned |
| TO-03-TC25 | AC-3.2 | E2E | **Clear** restores all filters | P0 | Planned |
| TO-03-TC26 | AC-3.3 | E2E | Legend (fleet, urgency, assignment, idle, bar window) | P1 | Planned |
| TO-03-TC27 | AC-4.1 | E2E | Click bar opens read-only drawer | P0 | Planned |
| TO-03-TC28 | AC-4.2 | E2E | Close X / backdrop / Escape | P0 | Planned |
| TO-03-TC29 | AC-4.2 | E2E | **Open TO detail** / **Open parent TR** | P0 | Planned |
| TO-03-TC30 | AC-5.1 | E2E | Granted roles see **TO dispatch planning** | P0 | Planned |
| TO-03-TC31 | AC-5.1 | E2E/API | Ungranted roles denied | P0 | Planned |
| TO-03-TC32 | AC-5.2 | E2E/API | Calendar never writes TO or vehicle | P0 | Planned |

→ [TO-03 detail](./TO-03-to-dispatch-planning-calendar-view-tdd-test-cases.md)
