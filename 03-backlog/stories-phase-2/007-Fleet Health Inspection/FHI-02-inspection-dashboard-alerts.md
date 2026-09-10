---
jira_key: ~
jira_type: Story
jira_sprint: ~
story_id: FHI-02
title: Inspection Dashboard — Due & Overdue Alerts
epic: Fleet Health Inspection
status: Pending
story_points: 5
assignee: ~
phase: Phase 2
design_ref: example-prototypes/fleet-operations.html (Inspection Dashboard tab)
related_stories:
  - FHI-01-inspection-checklist-templates.md
  - FHI-03-conduct-inspection-round.md
  - FHI-04-inspection-alerts-on-vehicle-report.md
source_docs:
  - ../../../05-modules/08-fleet-management/fleet-health-inspection.md
  - ../../../example-prototypes/fleet-operations.html
module_spec: 05-modules/08-fleet-management/fleet-health-inspection.md
---

# FHI-02 — Inspection Dashboard — Due & Overdue Alerts

## User Story

**As a** Driver Supervisor  
**I want** a dashboard showing which vehicles have inspection checkpoints due, overdue, or failed  
**So that** I can prioritise fleet health checks before dispatch

## Acceptance Criteria

### AC-1: Stats strip

- [ ] Own fleet vehicle count, checkpoints due soon, overdue, failed last round.

### AC-2: Checkpoint table

- [ ] Rows: vehicle, type, checkpoint name/category, interval, last checked, next due, status chip.
- [ ] Status: OK, Due soon, Overdue (computed from `last_checked + interval_days`).
- [ ] Failed/Attention flag from last round result.
- [ ] Filter: all vehicles / alerts only.

### AC-3: Quick action

- [ ] **Inspect** button → Conduct Inspection tab with vehicle pre-selected.

### AC-4: API

- [ ] `GET /api/v1/fleet-inspections/dashboard/?alerts_only=true`
- [ ] Uses `InspectionStatusService` — unit tested.

---

## API Endpoints

```
GET    /api/v1/fleet-inspections/dashboard/
```

---

## Access & Permissions

| Action | Role |
|--------|------|
| View inspection dashboard | `driver_supervisor`, `transport_planner`, `tenant_admin` |

**Permission codes (proposed):** `inspection.dashboard.view`

---

## Sub-tasks

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| FHI-02-1 | `InspectionStatusService` | valid / due_soon / overdue computation | High | Not started |
| FHI-02-2 | Dashboard UI | Stats + table (prototype) | High | Not started |
| FHI-02-3 | Dashboard API | Fleet-wide checkpoint rows | High | Not started |

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| FHI-01 | Upstream | Templates + intervals |
| FHI-03 | Downstream | State updated on round submit |
| FHI-04 | Downstream | Counts on Vehicle Report |

---

## Definition of Done

- [ ] Dashboard matches prototype Inspection Dashboard tab
- [ ] Status rules tested (2-day due-soon window)
- [ ] Alerts-only filter works

---

*Epic: Fleet Health Inspection | Phase: 2 (unscheduled) | 5 SP | Last Updated: 2026-09-01*
