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
---

# FHI-04 — Inspection Alerts on Vehicle Report

## User Story

**As a** Transport Planner  
**I want** inspection due/overdue/failed counts on the Vehicle Report  
**So that** fleet health checks appear alongside fuel, parts, and compliance in one reporting view

## Acceptance Criteria

### AC-1: Fleet overview (VR-02)

- [ ] Each vehicle card includes inspection alert summary: overdue / due soon / failed counts.
- [ ] Optional fleet stats strip: total overdue checkpoints.

### AC-2: Vehicle detail (VR-03)

- [ ] **Inspection** section: checkpoint table with last checked, next due, status chip, last result.
- [ ] Read-only — link to Conduct Inspection for supervisors with permission.

### AC-3: Aggregation

- [ ] `VehicleReportService` calls `InspectionStatusService` — no duplicate logic.
- [ ] Included in `GET /api/v1/reports/vehicles/` and detail endpoint.

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

---

*Epic: Fleet Health Inspection | Phase: 2 (unscheduled) | 3 SP | Last Updated: 2026-09-01*
