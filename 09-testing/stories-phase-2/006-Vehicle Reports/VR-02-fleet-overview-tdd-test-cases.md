---
section: 09-testing/stories-phase-2/006-Vehicle Reports
specification: VR-02 Fleet Overview — TDD test cases
version: 1.0
phase: Phase 2
tdd: true
related_stories: VR-02
source_spec: ../../../../03-backlog/stories-phase-2/006-Vehicle Reports/VR-02-vehicle-report-fleet-overview.md
last_updated: 2026-09-14
---

# VR-02 — Fleet Overview — TDD test cases

**Story:** [VR-02](../../../../03-backlog/stories-phase-2/006-Vehicle%20Reports/VR-02-vehicle-report-fleet-overview.md)  
**Start:** unit/API tests for `VehicleReportService.build_list()`.

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| VR-02-TC01 | AC-1.1 | E2E/API | Stats strip | Own fleet count, fuel entries, anomalies (+ overdue optional) | P0 | Planned |
| VR-02-TC02 | AC-2.1 | E2E/API | Card fields | Identity, fuel metrics, inspection counts, anomaly chip | P0 | Planned |
| VR-02-TC03 | AC-2.2 | API | Vendor excluded | No vendor-fleet cards | P0 | Planned |
| VR-02-TC04 | AC-3.1 | E2E | Click → detail | Opens VR-03 for vehicle | P0 | Planned |
| VR-02-TC05 | AC-3.2 | E2E/API | Search | Registration filter | P1 | Planned |
| VR-02-TC06 | AC-3.3 | API | has_alerts | Only alert vehicles | P0 | Planned |
| VR-02-TC07 | AC-3.4 | API | Default 30d | fuel_period_days=30 default | P0 | Planned |
| VR-02-TC08 | AC-4.1 | API | List no N+1 | Paginated; bounded queries | P0 | Planned |
| VR-02-TC09 | AC-4.2 | API | has_alerts query | Query param works | P0 | Planned |
| VR-02-TC10 | AC-4.3 | API | Unauthorized | 403 without permission | P0 | Planned |

## Edge cases

| Test Case ID | Layer | Scenario | Priority | Status |
|--------------|-------|----------|----------|--------|
| VR-02-EC01 | API/E2E | Empty fleet empty-state | P1 | Planned |
| VR-02-EC02 | API | No fuel in period → N/A/zero metrics | P1 | Planned |
| VR-02-EC03 | API | Tenant isolation | P0 | Planned |
