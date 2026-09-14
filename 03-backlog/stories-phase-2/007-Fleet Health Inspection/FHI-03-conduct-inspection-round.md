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
tdd_test_cases: ../../../09-testing/stories-phase-2/007-Fleet Health Inspection/FHI-03-conduct-inspection-round-tdd-test-cases.md
tdd_index: ../../../09-testing/stories-phase-2/007-Fleet Health Inspection/00-all-test-cases.md
---

# FHI-03 — Conduct Inspection Round

## TDD Test Cases

| Link | What |
|------|------|
| [FHI-03 TDD catalog](../../../09-testing/stories-phase-2/007-Fleet%20Health%20Inspection/FHI-03-conduct-inspection-round-tdd-test-cases.md) | `FHI-03-TC01`… + edge cases (**submit/API after FHI-01**) |
| [Fleet Health Inspection TDD index](../../../09-testing/stories-phase-2/007-Fleet%20Health%20Inspection/00-all-test-cases.md) | All FHI-01…FHI-04 test cases |
| [Feature TDD folder](../../../09-testing/stories-phase-2/007-Fleet%20Health%20Inspection/README.md) | README + recommended TDD order |

Write failing API/service tests for round submit and `VehicleCheckpointState` updates **before** UI polish.

## User Story

**As a** Driver Supervisor  
**I want to** complete an inspection round for a vehicle and record pass/attention/fail for each checkpoint  
**So that** last-checked dates update and fleet health alerts clear until the next interval

---

## Acceptance Criteria

### AC-1: Round entry form

Given a Driver Supervisor starts Conduct Inspection,

when they select an own-fleet vehicle and date (optional odometer, round notes),

then the checklist loads from that vehicle’s `vehicle_type` template with current status per row.

- [ ] Select vehicle (own fleet); inspection date; optional odometer; round notes.
- [ ] Load checklist from vehicle type template with current status per row.

**Test Scenarios (AC-1):**

```gherkin
Scenario: AC-1.1 - Own-fleet vehicle loads type checklist
  Given vehicle DHK-1234 is own-fleet light truck with active templates
  When supervisor selects DHK-1234 and an inspection date
  Then checklist rows match light truck active templates
  And each row shows current status from VehicleCheckpointState when present

Scenario: AC-1.2 - Optional odometer and round notes accepted
  Given a valid vehicle selection
  When odometer and round notes are provided or omitted
  Then both shapes are accepted (odometer optional)
```

### AC-2: Per-checkpoint result

Given the checklist is shown,

when the supervisor records each checkpoint,

then every row requires Pass / Needs attention / Fail, allows optional notes, and shows interval, last checked, and current status.

- [ ] Result required: **Pass**, **Needs attention**, **Fail**.
- [ ] Optional notes per checkpoint.
- [ ] Show interval, last checked, current status on each row.

**Test Scenarios (AC-2):**

```gherkin
Scenario: AC-2.1 - Result enum values accepted
  Given a checklist row
  When result is Pass, Needs attention, or Fail
  Then the value is accepted for submit

Scenario: AC-2.2 - Optional per-checkpoint notes
  Given a result is set
  When notes are omitted or provided
  Then submit stores notes when present and null/empty when omitted

Scenario: AC-2.3 - Row context columns visible
  Given templates with interval_days and prior state
  When the form renders
  Then interval, last checked, and current status are shown per row
```

### AC-3: On submit

Given all checkpoints have results,

when the supervisor submits the round,

then `InspectionRound` + `InspectionRoundLine` are created, `VehicleCheckpointState` is updated (`last_checked_date`, `last_result`, `next_due` recalculated), and `entered_by` is the current supervisor.

- [ ] Create `InspectionRound` + `InspectionRoundLine` records.
- [ ] Update `VehicleCheckpointState` — `last_checked_date`, `last_result`, `next_due` recalculated.
- [ ] Audit: `entered_by` = current supervisor.

**Test Scenarios (AC-3):**

```gherkin
Scenario: AC-3.1 - Round and lines persisted
  Given a complete checklist submission for an own-fleet vehicle
  When POST inspection-rounds succeeds
  Then one InspectionRound and one line per template checkpoint exist
  And entered_by is the authenticated supervisor

Scenario: AC-3.2 - VehicleCheckpointState updated
  Given prior state or no prior state for a checkpoint
  When round submits with inspected_at date D and result Pass
  Then last_checked_date = D
  And last_result = PASS
  And next_due = D + interval_days

Scenario: AC-3.3 - Fail and attention update last_result
  Given submit includes Fail and Needs attention lines
  When state is updated
  Then last_result reflects FAIL and ATTENTION respectively
```

### AC-4: Validation

Given a submit attempt,

when any template checkpoint lacks a result or the vehicle is not own-fleet,

then the API rejects the request.

- [ ] All template checkpoints must have a result before submit.
- [ ] Own-fleet vehicles only.

**Test Scenarios (AC-4):**

```gherkin
Scenario: AC-4.1 - Missing checkpoint result blocked
  Given active templates for the vehicle type
  When submit omits a result for any required checkpoint
  Then save is rejected and no round is created

Scenario: AC-4.2 - Vendor or non-own-fleet vehicle rejected
  Given a vendor-fleet vehicle id
  When POST inspection-rounds is attempted
  Then request is rejected
```

### AC-5: API

Given clients create and list rounds,

when they call vehicle-scoped inspection-round endpoints,

then POST create and GET history (and checkpoint-states) work for permitted roles.

- [ ] `POST /api/v1/vehicles/{id}/inspection-rounds/`
- [ ] `GET /api/v1/vehicles/{id}/inspection-rounds/` (history)

**Test Scenarios (AC-5):**

```gherkin
Scenario: AC-5.1 - POST creates round for supervisor
  Given driver_supervisor with permission inspection.round.create
  When POST /api/v1/vehicles/{id}/inspection-rounds/ with valid payload
  Then 201/200 and round body returned

Scenario: AC-5.2 - GET history returns prior rounds
  Given existing rounds for the vehicle
  When GET /api/v1/vehicles/{id}/inspection-rounds/
  Then rounds are listed newest-first or per API convention

Scenario: AC-5.3 - Unauthorized create denied
  Given a user without round create permission
  When POST is attempted
  Then 403 is returned
```

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
| FHI-03-5 | Tests | API/service tests for AC-1…AC-5 + Edge Cases — [TDD catalog](../../../09-testing/stories-phase-2/007-Fleet%20Health%20Inspection/FHI-03-conduct-inspection-round-tdd-test-cases.md) | High | Not started |

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
- [ ] Scenarios AC-1.1…AC-5.3 covered — see [FHI-03 TDD catalog](../../../09-testing/stories-phase-2/007-Fleet%20Health%20Inspection/FHI-03-conduct-inspection-round-tdd-test-cases.md)
- [ ] TDD catalog statuses updated for P0 rows (`Planned` → `Failing` → `Passing`)

---

*Epic: Fleet Health Inspection | Phase: 2 (unscheduled) | 8 SP | Last Updated: 2026-09-14*
