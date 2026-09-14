---
title: Phase 2 — 005 Fuel Management
sprint: ~
phase: Phase 2
status: Planning
epic: Fuel Management
story_points_estimated: 26
---

# 005 — Fuel Management

Gauge-based fuel entry (Driver Supervisor admin + Driver mobile); consumption, history, anomaly detection. Own-fleet only.

Previously planned under Sprint 10 (`03-backlog/sprints/sprint-10/01-fuel-management/`). Moved to Phase 2 unscheduled backlog.

| File | Role | TDD test cases |
|------|------|----------------|
| [FM-01](./FM-01-fuel-entry-driver-supervisor-admin.md) | Story — Fuel Entry — Driver Supervisor (Admin Portal) (8 SP) | [FM-01 TDD](../../../09-testing/stories-phase-2/005-Fuel%20Management/FM-01-fuel-entry-admin-tdd-test-cases.md) |
| [FM-02](./FM-02-fuel-entry-driver-mobile.md) | Story — Fuel Entry — Driver (Mobile) (5 SP) | [FM-02 TDD](../../../09-testing/stories-phase-2/005-Fuel%20Management/FM-02-fuel-entry-driver-mobile-tdd-test-cases.md) |
| [FM-03](./FM-03-fuel-consumption-calculations.md) | Story — Fuel Consumption Calculations & Odometer Validation (5 SP) | [FM-03 TDD](../../../09-testing/stories-phase-2/005-Fuel%20Management/FM-03-fuel-consumption-calculations-tdd-test-cases.md) |
| [FM-04](./FM-04-fuel-history-and-filters.md) | Story — Fuel History & Filters (3 SP) | [FM-04 TDD](../../../09-testing/stories-phase-2/005-Fuel%20Management/FM-04-fuel-history-and-filters-tdd-test-cases.md) |
| [FM-05](./FM-05-fuel-anomaly-baselines.md) | Story — Fuel Efficiency Baselines & Anomaly Detection (5 SP) | [FM-05 TDD](../../../09-testing/stories-phase-2/005-Fuel%20Management/FM-05-fuel-anomaly-baselines-tdd-test-cases.md) |

**Module spec:** [`05-modules/08-fleet-management/fuel-management.md`](../../../05-modules/08-fleet-management/fuel-management.md)  
**Design reference:** [`example-prototypes/fleet-operations.html`](../../../example-prototypes/fleet-operations.html)

**Story AC format:** Each story uses **Given–When–Then** acceptance criteria, numbered **gherkin test scenarios** (`AC-N.x`), and an **Edge Cases** section (aligned with sprint-2 story style).

**TDD test catalogs:**  
- Feature folder: [`09-testing/stories-phase-2/005-Fuel Management/`](../../../09-testing/stories-phase-2/005-Fuel%20Management/)  
- Master index: [`00-all-test-cases.md`](../../../09-testing/stories-phase-2/005-Fuel%20Management/00-all-test-cases.md) (`FM-0x-TC##` ↔ story `AC-N.x`)

**Stories:** FM-01 – FM-05 · **Estimated:** ~26 SP

**Phase 2 index:** [../README.md](../README.md)
