---
jira_key: ~
jira_type: Story
jira_sprint: ~
story_id: FHI-03
title: Conduct Inspection Round
epic: Fleet Health Inspection
status: Pending
story_points: 8
assignee: ~
phase: Phase 2
design_ref: example-prototypes/fleet-operations.html (Conduct Inspection tab)
related_stories:
  - FHI-01-inspection-checklist-templates.md
  - FHI-02-inspection-dashboard-alerts.md
source_docs:
  - ../../../05-modules/08-fleet-management/fleet-health-inspection.md
  - ../../../example-prototypes/fleet-operations.html
module_spec: 05-modules/08-fleet-management/fleet-health-inspection.md
---

# FHI-03 — Conduct Inspection Round

## User Story

**As a** Driver Supervisor  
**I want to** complete an inspection round for a vehicle and record pass/attention/fail for each checkpoint  
**So that** last-checked dates update and fleet health alerts clear until the next interval

## Acceptance Criteria

### AC-1: Round entry form

- [ ] Select vehicle (own fleet); inspection date; optional odometer; round notes.
- [ ] Load checklist from vehicle type template with current status per row.

### AC-2: Per-checkpoint result

- [ ] Result required: **Pass**, **Needs attention**, **Fail**.
- [ ] Optional notes per checkpoint.
- [ ] Show interval, last checked, current status on each row.

### AC-3: On submit

- [ ] Create `InspectionRound` + `InspectionRoundLine` records.
- [ ] Update `VehicleCheckpointState` — `last_checked_date`, `last_result`, `next_due` recalculated.
- [ ] Audit: `entered_by` = current supervisor.

### AC-4: Validation

- [ ] All template checkpoints must have a result before submit.
- [ ] Own-fleet vehicles only.

### AC-5: API

- [ ] `POST /api/v1/vehicles/{id}/inspection-rounds/`
- [ ] `GET /api/v1/vehicles/{id}/inspection-rounds/` (history)

---

## API Endpoints

```
POST   /api/v1/vehicles/{id}/inspection-rounds/
GET    /api/v1/vehicles/{id}/inspection-rounds/
GET    /api/v1/vehicles/{id}/checkpoint-states/
```

---

## Access & Permissions

| Action | Role |
|--------|------|
| Conduct inspection round | `driver_supervisor` |
| View round history | `driver_supervisor`, `transport_planner`, `tenant_admin` |

**Permission codes (proposed):** `inspection.round.create`, `inspection.round.view`

---

## Sub-tasks

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| FHI-03-1 | `InspectionRound` + lines models | Round audit trail | High | Not started |
| FHI-03-2 | `VehicleCheckpointState` update | On submit service | High | Not started |
| FHI-03-3 | Conduct Inspection UI | Form + checklist table (prototype) | High | Not started |
| FHI-03-4 | Round API | POST + GET history | High | Not started |

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| FHI-01 | Upstream | Template checkpoints |
| FHI-02 | Downstream | Dashboard refreshes after submit |
| MDM-05 Vehicle | Upstream | Vehicle picker + type |

---

## Definition of Done

- [ ] Submit updates all checkpoint dates and results
- [ ] Dashboard reflects new status immediately
- [ ] Matches prototype Conduct Inspection tab

---

*Epic: Fleet Health Inspection | Phase: 2 (unscheduled) | 8 SP | Last Updated: 2026-09-01*
