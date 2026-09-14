---
section: 09-testing/stories-phase-2/006-Vehicle Reports
phase: Phase 2
epic: Vehicle Reports
tdd: true
last_updated: 2026-09-14
source_stories: ../../../03-backlog/stories-phase-2/006-Vehicle Reports/
module_spec: ../../../05-modules/11-reporting/vehicle-report.md
---

# 006 — Vehicle Reports — TDD test catalogs

| File | Story | Preferred first layer | P0 focus |
|------|-------|----------------------|----------|
| [00-all-test-cases.md](./00-all-test-cases.md) | Index | — | Full TC matrix |
| [VR-01](./VR-01-reports-menu-navigation-tdd-test-cases.md) | Nav + RBAC | E2E / permission | Menu + deny |
| [VR-02](./VR-02-fleet-overview-tdd-test-cases.md) | Fleet overview | API service | build_list, filters |
| [VR-03](./VR-03-vehicle-report-detail-tdd-test-cases.md) | Detail view | API | Detail DTO, separation |

## Recommended TDD order

1. **VR-01** permission + nav  
2. **VR-02** `VehicleReportService.build_list()`  
3. **VR-03** detail aggregation  

## Story links

- [VR-01](../../../03-backlog/stories-phase-2/006-Vehicle%20Reports/VR-01-reports-menu-vehicle-report-navigation.md)
- [VR-02](../../../03-backlog/stories-phase-2/006-Vehicle%20Reports/VR-02-vehicle-report-fleet-overview.md)
- [VR-03](../../../03-backlog/stories-phase-2/006-Vehicle%20Reports/VR-03-vehicle-report-detail-view.md)
