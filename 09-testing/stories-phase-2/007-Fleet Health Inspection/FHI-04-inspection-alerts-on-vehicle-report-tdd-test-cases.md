---
section: 09-testing/stories-phase-2/007-Fleet Health Inspection
specification: FHI-04 Inspection Alerts on Vehicle Report — TDD test cases
version: 1.0
phase: Phase 2
tdd: true
related_stories: FHI-04
source_spec: ../../../../03-backlog/stories-phase-2/007-Fleet Health Inspection/FHI-04-inspection-alerts-on-vehicle-report.md
module_spec: ../../../../05-modules/08-fleet-management/fleet-health-inspection.md
suggested_impl:
  unit: VehicleReportService → InspectionStatusService (no duplicate logic)
  api: GET /api/v1/reports/vehicles/; GET /api/v1/reports/vehicles/{id}/
  e2e: Playwright — Vehicle Report VR-02 / VR-03
last_updated: 2026-09-14
---

# FHI-04 — Inspection Alerts on Vehicle Report — TDD test cases

**Story:** [FHI-04](../../../../03-backlog/stories-phase-2/007-Fleet%20Health%20Inspection/FHI-04-inspection-alerts-on-vehicle-report.md)  
**TDD focus:** aggregation reuse after FHI-02 `InspectionStatusService` exists.  
**Depends on:** FHI-02 status rules; VR-02 / VR-03 surfaces.

## Seed prerequisites (when implementing)

| Item | Notes |
|------|--------|
| Roles | Same as Vehicle Report (VR-01); supervisor with round create for link test |
| Data | Vehicle with known overdue / due_soon / failed counts from status service |
| Empty | Vehicle with no checkpoint states → zeros/empty, not error |

---

## A — Fleet overview VR-02 (AC-1)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FHI-04-TC01 | AC-1.1 | API / E2E | Card alert counts | Service returns overdue=2, due_soon=1, failed=1. Assert card/summary shows those counts. | P0 | Planned |
| FHI-04-TC02 | AC-1.2 | E2E | Fleet overdue strip | Multiple overdue checkpoints. If strip enabled, assert fleet total overdue displayed. | P1 | Planned |

## B — Vehicle detail VR-03 (AC-2)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FHI-04-TC03 | AC-2.1 | API / E2E | Detail inspection section | Detail payload/UI rows show last checked, next due, status chip, last result; read-only. | P0 | Planned |
| FHI-04-TC04 | AC-2.2 | E2E | Conduct link when permitted | Supervisor with create perm sees Conduct Inspection link; without create, no write affordance. | P1 | Planned |

## C — Aggregation (AC-3)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FHI-04-TC05 | AC-3.1 | Unit | Delegates to status service | Spy/stub InspectionStatusService. Assert VehicleReportService calls it; no parallel next_due math in report layer. | P0 | Planned |
| FHI-04-TC06 | AC-3.2 | API | List includes counts | GET /api/v1/reports/vehicles/ includes inspection alert counts per vehicle. | P0 | Planned |
| FHI-04-TC07 | AC-3.3 | API | Detail includes section | GET /api/v1/reports/vehicles/{id}/ includes inspection section. | P0 | Planned |

---

## Edge cases (from story)

| Test Case ID | Layer | Scenario | Assert | Priority | Status |
|--------------|-------|----------|--------|----------|--------|
| FHI-04-EC01 | Unit / API | Counts match dashboard same day | VR-02 counts == InspectionStatusService for same vehicle | P0 | Planned |
| FHI-04-EC02 | API | No templates / no states | Zeros or empty section; not 500 | P0 | Planned |
| FHI-04-EC03 | API | Report RBAC unchanged | User without VR access still denied; inspection block does not widen access | P0 | Planned |
| FHI-04-EC04 | E2E | Link hidden without create | No Conduct Inspection write affordance | P1 | Planned |

---

## Suggested code test targets (TDD)

```
tests/unit/.../test_vehicle_report_inspection_aggregation.py  # TC05, EC01
tests/api/.../test_vehicle_report_inspection.py               # TC01, TC03, TC06–07, EC02–03
```

**Implement order:** TC05 → TC06 → TC01 → TC07 → TC03 → rest.
