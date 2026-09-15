---
section: 09-testing/stories-phase-2/006-Vehicle Reports
specification: VR-01 Reports Menu Navigation — TDD test cases
version: 1.0
phase: Phase 2
tdd: true
related_stories: VR-01
source_spec: ../../../../03-backlog/stories-phase-2/006-Vehicle Reports/VR-01-reports-menu-vehicle-report-navigation.md
last_updated: 2026-09-14
---

# VR-01 — Reports Menu & RBAC — TDD test cases

**Story:** [VR-01](../../../../03-backlog/stories-phase-2/006-Vehicle%20Reports/VR-01-reports-menu-vehicle-report-navigation.md)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| VR-01-TC01 | AC-1.1 | E2E | Reports → Vehicle Report | transport_planner sees Reports; Vehicle Report → `/admin/reports/vehicle-report/` | P0 | Planned |
| VR-01-TC02 | AC-1.2 | E2E | Planning unchanged | Vehicle Planning has no fuel/health panels | P0 | Planned |
| VR-01-TC03 | AC-2.1 | E2E | Granted roles see menu | TP, DS, tenant_admin see Vehicle Report | P0 | Planned |
| VR-01-TC04 | AC-2.2 | E2E/API | Ungranted denied | No menu; direct URL 403 | P0 | Planned |
| VR-01-TC05 | AC-3.1 | E2E | Overview breadcrumbs | Home → Reports → Vehicle Report | P1 | Planned |
| VR-01-TC06 | AC-3.2 | E2E | Detail breadcrumbs | … → {registration} | P1 | Planned |

## Edge cases

| Test Case ID | Layer | Scenario | Priority | Status |
|--------------|-------|----------|----------|--------|
| VR-01-EC01 | API | Deep-link without permission | P0 | Planned |
| VR-01-EC02 | E2E | Permission granted → menu appears next load | P1 | Planned |
