---
jira_key: ~
jira_type: Story
jira_sprint: ~
story_id: FHI-04
title: Inspection Alerts on Vehicle Report
epic: Fleet Health Inspection
status: Pending
story_points: 3
assignee: ~
phase: Phase 2
design_ref: example-prototypes/fleet-operations.html (Fleet Overview + inspection counts)
related_stories:
  - FHI-02-inspection-dashboard-alerts.md
  - VR-02-vehicle-report-fleet-overview.md
  - VR-03-vehicle-report-detail-view.md
source_docs:
  - ../../../05-modules/08-fleet-management/fleet-health-inspection.md
  - ../../../05-modules/11-reporting/vehicle-report.md
module_spec: 05-modules/08-fleet-management/fleet-health-inspection.md
tdd_test_cases: ../../../09-testing/stories-phase-2/007-Fleet Health Inspection/FHI-04-inspection-alerts-on-vehicle-report-tdd-test-cases.md
tdd_index: ../../../09-testing/stories-phase-2/007-Fleet Health Inspection/00-all-test-cases.md
---

# FHI-04 — Inspection Alerts on Vehicle Report

## TDD Test Cases

| Link | What |
|------|------|
| [FHI-04 TDD catalog](../../../09-testing/stories-phase-2/007-Fleet%20Health%20Inspection/FHI-04-inspection-alerts-on-vehicle-report-tdd-test-cases.md) | `FHI-04-TC01`… + edge cases (**aggregation via InspectionStatusService**) |
| [Fleet Health Inspection TDD index](../../../09-testing/stories-phase-2/007-Fleet%20Health%20Inspection/00-all-test-cases.md) | All FHI-01…FHI-04 test cases |
| [Feature TDD folder](../../../09-testing/stories-phase-2/007-Fleet%20Health%20Inspection/README.md) | README + recommended TDD order |

Implement after FHI-02 status service exists; assert `VehicleReportService` calls `InspectionStatusService` with **no duplicate** schedule logic.

## User Story

**As a** Transport Planner  
**I want** inspection due/overdue/failed counts on the Vehicle Report  
**So that** fleet health checks appear alongside fuel, parts, and compliance in one reporting view

---

## Acceptance Criteria

### AC-1: Fleet overview (VR-02)

Given Vehicle Report fleet overview (VR-02),

when vehicle cards/stats render,

then each card includes overdue / due soon / failed inspection counts, with optional fleet-wide overdue total.

- [ ] Each vehicle card includes inspection alert summary: overdue / due soon / failed counts.
- [ ] Optional fleet stats strip: total overdue checkpoints.

**Test Scenarios (AC-1):**

```gherkin
Scenario: AC-1.1 - Card shows inspection alert counts
  Given a vehicle with overdue=2, due_soon=1, failed=1 per InspectionStatusService
  When fleet overview loads
  Then the vehicle card shows overdue, due soon, and failed counts

Scenario: AC-1.2 - Optional fleet overdue strip
  Given multiple vehicles with overdue checkpoints
  When overview stats strip is shown
  Then total overdue checkpoints across fleet is displayed (if strip enabled)
```

### AC-2: Vehicle detail (VR-03)

Given Vehicle Report detail (VR-03),

when the Inspection section loads,

then a read-only checkpoint table shows last checked, next due, status chip, and last result, with a link to Conduct Inspection for permitted supervisors.

- [ ] **Inspection** section: checkpoint table with last checked, next due, status chip, last result.
- [ ] Read-only — link to Conduct Inspection for supervisors with permission.

**Test Scenarios (AC-2):**

```gherkin
Scenario: AC-2.1 - Detail inspection section rows
  Given checkpoint states for the vehicle
  When GET report detail / VR-03 Inspection section renders
  Then each row shows last checked, next due, status chip, and last result
  And fields are read-only

Scenario: AC-2.2 - Link to Conduct Inspection when permitted
  Given viewer has inspection.round.create (driver_supervisor)
  When detail Inspection section is shown
  Then a link/action to Conduct Inspection is available
  And users without create permission do not get a write affordance
```

### AC-3: Aggregation

Given report DTOs need inspection data,

when `VehicleReportService` builds summary and detail,

then it calls `InspectionStatusService` only (no duplicated due/overdue math) and includes the block on list and detail report APIs.

- [ ] `VehicleReportService` calls `InspectionStatusService` — no duplicate logic.
- [ ] Included in `GET /api/v1/reports/vehicles/` and detail endpoint.

**Test Scenarios (AC-3):**

```gherkin
Scenario: AC-3.1 - Report service delegates to InspectionStatusService
  Given VehicleReportService builds inspection counts
  When unit/integration test spies or stubs InspectionStatusService
  Then report aggregation uses that service
  And no parallel next_due calculation exists in the report layer

Scenario: AC-3.2 - List endpoint includes inspection counts
  Given authenticated report viewer
  When GET /api/v1/reports/vehicles/
  Then each vehicle summary includes inspection alert counts

Scenario: AC-3.3 - Detail endpoint includes inspection section
  Given authenticated report viewer
  When GET /api/v1/reports/vehicles/{id}/
  Then response includes inspection checkpoint section payload
```

---

## Edge Cases

### Consistency
- Counts on VR-02 must match dashboard math for the same vehicle/day (same `InspectionStatusService`).
- Vehicle with no templates / no states → zeros or empty section, not errors.

### Permissions
- Same as Vehicle Report (VR-01); inspection block does not widen report access.
- Conduct Inspection link hidden without round-create permission.

### Scope
- Own-fleet reporting scope follows Vehicle Report rules; do not invent a separate fleet filter here.

---

## API Endpoints

```
GET    /api/v1/reports/vehicles/              # includes inspection counts
GET    /api/v1/reports/vehicles/{id}/         # includes inspection section
```

---

## Access & Permissions

| Action | Role |
|--------|------|
| View inspection on report | Same as Vehicle Report (VR-01) |

---

## Sub-tasks

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| FHI-04-1 | Report aggregation | `inspection` block on summary + detail DTOs | High | Not started |
| FHI-04-2 | VR-02/VR-03 UI | Inspection chips + detail section | Medium | Not started |
| FHI-04-3 | Tests | API/unit tests for AC-1…AC-3 + Edge Cases — [TDD catalog](../../../09-testing/stories-phase-2/007-Fleet%20Health%20Inspection/FHI-04-inspection-alerts-on-vehicle-report-tdd-test-cases.md) | High | Not started |

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| FHI-02 | Upstream | Status service |
| VR-02, VR-03 | Downstream | Report UI |

---

## Definition of Done

- [ ] Inspection alerts visible on Vehicle Report overview and detail
- [ ] Prototype Fleet Overview concept aligned with VR-02 production path
- [ ] Aggregation via `InspectionStatusService` only — see [FHI-04 TDD catalog](../../../09-testing/stories-phase-2/007-Fleet%20Health%20Inspection/FHI-04-inspection-alerts-on-vehicle-report-tdd-test-cases.md)
- [ ] TDD catalog statuses updated for P0 rows (`Planned` → `Failing` → `Passing`)

---

*Epic: Fleet Health Inspection | Phase: 2 (unscheduled) | 3 SP | Last Updated: 2026-09-14*
