---
title: Phase 2 — 006 Vehicle Reports
sprint: ~
phase: Phase 2
status: Planning
epic: Vehicle Reports
story_points_estimated: 16
---

# 006 — Vehicle Reports

Reports menu → Vehicle Report fleet overview + per-vehicle detail (fuel, inspection, compliance). Not on Vehicle Planning.

Previously planned under Sprint 10 (`03-backlog/sprints/sprint-10/02-vehicle-reports/`). Moved to Phase 2 unscheduled backlog.

| File | Role | TDD test cases |
|------|------|----------------|
| [VR-01](./VR-01-reports-menu-vehicle-report-navigation.md) | Story — Reports Menu — Vehicle Report Navigation & RBAC (3 SP) | [VR-01 TDD](../../../09-testing/stories-phase-2/006-Vehicle%20Reports/VR-01-reports-menu-navigation-tdd-test-cases.md) |
| [VR-02](./VR-02-vehicle-report-fleet-overview.md) | Story — Vehicle Report — Fleet Overview (Health Cards) (8 SP) | [VR-02 TDD](../../../09-testing/stories-phase-2/006-Vehicle%20Reports/VR-02-fleet-overview-tdd-test-cases.md) |
| [VR-03](./VR-03-vehicle-report-detail-view.md) | Story — Vehicle Report — Detail View (Fuel, Inspection, Compliance) (5 SP) | [VR-03 TDD](../../../09-testing/stories-phase-2/006-Vehicle%20Reports/VR-03-vehicle-report-detail-tdd-test-cases.md) |

**Module spec:** [`05-modules/11-reporting/vehicle-report.md`](../../../05-modules/11-reporting/vehicle-report.md)  
**Design reference:** [`example-prototypes/fleet-operations.html`](../../../example-prototypes/fleet-operations.html)

**Story AC format:** Given–When–Then + Edge Cases. **Gherkin / TDD scenarios** (`AC-N.x`) live in `09-testing` (linked from each story) — not inline under AC.

**TDD test catalogs:**  
- Feature folder: [`09-testing/stories-phase-2/006-Vehicle Reports/`](../../../09-testing/stories-phase-2/006-Vehicle%20Reports/)  
- Master index: [`00-all-test-cases.md`](../../../09-testing/stories-phase-2/006-Vehicle%20Reports/00-all-test-cases.md)

**Stories:** VR-01 – VR-03 · **Estimated:** ~16 SP

**Phase 2 index:** [../README.md](../README.md)
