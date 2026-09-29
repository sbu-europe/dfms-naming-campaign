---
section: 09-testing/stories-phase-2/006-Vehicle Reports
specification: VR-03 Vehicle Report Detail — TDD test cases
version: 1.0
phase: Phase 2
tdd: true
related_stories: VR-03
source_spec: ../../../03-backlog/phase-2/stories-phase-2/006-Vehicle Reports/VR-03-vehicle-report-detail-view.md
last_updated: 2026-09-14
---

# VR-03 — Vehicle Report Detail — TDD test cases

**Story:** [VR-03](../../../03-backlog/phase-2/stories-phase-2/006-Vehicle%20Reports/VR-03-vehicle-report-detail-view.md)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| VR-03-TC01 | AC-1.1 | API/E2E | Header fields | Registration, model, fuel, status, driver, odo | P0 | Planned |
| VR-03-TC02 | AC-1.2 | E2E | Alert banners | Anomaly + inspection banners | P0 | Planned |
| VR-03-TC03 | AC-2.1 | E2E | Compliance | Fitness + insurance chips | P0 | Planned |
| VR-03-TC04 | AC-3.1 | API | Fuel period stats | Stats scoped to fuel_period_days | P0 | Planned |
| VR-03-TC05 | AC-3.2 | E2E | Anomaly highlight | anomaly_flag rows highlighted | P1 | Planned |
| VR-03-TC06 | AC-3.3 | E2E | Fuel History link | Supervisor → FM-04 | P1 | Planned |
| VR-03-TC07 | AC-4.1 | API/E2E | Checkpoint table | Required columns | P0 | Planned |
| VR-03-TC08 | AC-4.2 | E2E | Conduct Inspection link | Shown for permitted DS | P1 | Planned |
| VR-03-TC09 | AC-5.1 | API | Detail DTO | VehicleReportDetail shape | P0 | Planned |
| VR-03-TC10 | AC-5.2 | API | Vendor rejected | Own-fleet only | P0 | Planned |
| VR-03-TC11 | AC-5.3 | API | Unauthorized | 403 | P0 | Planned |
| VR-03-TC12 | AC-6.1 | E2E | No TO UI | No assign controls | P0 | Planned |
| VR-03-TC13 | AC-6.2 | E2E | Planning link gated | Requires MENU_VEHICLE_PLANNING_VIEW | P1 | Planned |

## Edge cases

| Test Case ID | Layer | Scenario | Priority | Status |
|--------------|-------|----------|----------|--------|
| VR-03-EC01 | API/E2E | No fuel history empty section | P1 | Planned |
| VR-03-EC02 | API/E2E | No checkpoint states empty table | P1 | Planned |
| VR-03-EC03 | E2E | Read-only (no inline edit) | P0 | Planned |
