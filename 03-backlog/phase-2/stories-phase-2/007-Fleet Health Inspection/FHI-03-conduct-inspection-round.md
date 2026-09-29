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
  - ../../../../05-modules/08-fleet-management/fleet-health-inspection.md
  - ../../../../example-prototypes/fleet-operations.html
module_spec: 05-modules/08-fleet-management/fleet-health-inspection.md
tdd_test_cases: ../../../../09-testing/stories-phase-2/007-Fleet Health Inspection/FHI-03-conduct-inspection-round-tdd-test-cases.md
tdd_index: ../../../../09-testing/stories-phase-2/007-Fleet Health Inspection/00-all-test-cases.md
---

# FHI-03 — Conduct Inspection Round

## Test cases

Gherkin / TDD scenarios live under `09-testing` (not inline in this story).

| Navigate | Link |
|----------|------|
| **FHI-03 TDD catalog** (`AC-N.x` mapped) | [FHI-03-conduct-inspection-round-tdd-test-cases.md](../../../../09-testing/stories-phase-2/007-Fleet%20Health%20Inspection/FHI-03-conduct-inspection-round-tdd-test-cases.md) |
| **Fleet Health Inspection TDD index** (all stories) | [00-all-test-cases.md](../../../../09-testing/stories-phase-2/007-Fleet%20Health%20Inspection/00-all-test-cases.md) |
| **Feature TDD folder** | [README](../../../../09-testing/stories-phase-2/007-Fleet%20Health%20Inspection/README.md) |

Write failing tests from the catalog **before** implementation.


## User Story

**As a** Driver Supervisor  
**I want to** complete an inspection round for a vehicle and record pass/attention/fail for each checkpoint  
**So that** last-checked dates update and fleet health alerts clear until the next interval

---

## Acceptance Criteria

> **Test scenarios:** see [FHI-03 TDD catalog](../../../../09-testing/stories-phase-2/007-Fleet%20Health%20Inspection/FHI-03-conduct-inspection-round-tdd-test-cases.md) · [Fleet Health Inspection index](../../../../09-testing/stories-phase-2/007-Fleet%20Health%20Inspection/00-all-test-cases.md)

### AC-1: Round entry form

Given a Driver Supervisor starts Conduct Inspection,

when they select an own-fleet vehicle and date (optional odometer, round notes),

then the checklist loads from that vehicle’s `vehicle_type` template with current status per row.

- [ ] Select vehicle (own fleet); inspection date; optional odometer; round notes.
- [ ] Load checklist from vehicle type template with current status per row.

### AC-2: Per-checkpoint result

Given the checklist is shown,

when the supervisor records each checkpoint,

then every row requires Pass / Needs attention / Fail, allows optional notes, and shows interval, last checked, and current status.

- [ ] Result required: **Pass**, **Needs attention**, **Fail**.
- [ ] Optional notes per checkpoint.
- [ ] Show interval, last checked, current status on each row.

### AC-3: On submit

Given all checkpoints have results,

when the supervisor submits the round,

then `InspectionRound` + `InspectionRoundLine` are created, `VehicleCheckpointState` is updated (`last_checked_date`, `last_result`, `next_due` recalculated), and `entered_by` is the current supervisor.

- [ ] Create `InspectionRound` + `InspectionRoundLine` records.
- [ ] Update `VehicleCheckpointState` — `last_checked_date`, `last_result`, `next_due` recalculated.
- [ ] Audit: `entered_by` = current supervisor.

### AC-4: Validation

Given a submit attempt,

when any template checkpoint lacks a result or the vehicle is not own-fleet,

then the API rejects the request.

- [ ] All template checkpoints must have a result before submit.
- [ ] Own-fleet vehicles only.

### AC-5: API

Given clients create and list rounds,

when they call vehicle-scoped inspection-round endpoints,

then POST create and GET history (and checkpoint-states) work for permitted roles.

- [ ] `POST /api/v1/vehicles/{id}/inspection-rounds/`
- [ ] `GET /api/v1/vehicles/{id}/inspection-rounds/` (history)

---

## Edge Cases

### Completeness
- Partial submit (missing line) → reject entire round (atomic).
- Inactive templates excluded from required checklist; historical lines for deactivated templates remain in past rounds.

### State
- First-ever check for a checkpoint creates `VehicleCheckpointState` if missing.
- Re-submit same day: allowed unless module forbids; latest round wins for state fields.

### Scope & audit
- Own-fleet only; cross-tenant vehicle id → 404/403.
- Only `driver_supervisor` creates rounds; planners/admins may view history.

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
| View round history | `driver_supervisor`, `transport_planner`, `tenant_super_admin`, `tenant_admin` |

**Permission codes (proposed):** `inspection.round.create`, `inspection.round.view`

---

## Sub-tasks

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| FHI-03-1 | `InspectionRound` + lines models | Round audit trail | High | Not started |
| FHI-03-2 | `VehicleCheckpointState` update | On submit service | High | Not started |
| FHI-03-3 | Conduct Inspection UI | Form + checklist table (prototype) | High | Not started |
| FHI-03-4 | Round API | POST + GET history | High | Not started |
| FHI-03-5 | Tests | API/service tests for AC-1…AC-5 + Edge Cases — [TDD catalog](../../../../09-testing/stories-phase-2/007-Fleet%20Health%20Inspection/FHI-03-conduct-inspection-round-tdd-test-cases.md) | High | Not started |

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
- [ ] Scenarios AC-1.1…AC-5.3 covered — see [FHI-03 TDD catalog](../../../../09-testing/stories-phase-2/007-Fleet%20Health%20Inspection/FHI-03-conduct-inspection-round-tdd-test-cases.md)
- [ ] TDD catalog statuses updated for P0 rows (`Planned` → `Failing` → `Passing`)

---

*Epic: Fleet Health Inspection | Phase: 2 (unscheduled) | 8 SP | Last Updated: 2026-09-14*
