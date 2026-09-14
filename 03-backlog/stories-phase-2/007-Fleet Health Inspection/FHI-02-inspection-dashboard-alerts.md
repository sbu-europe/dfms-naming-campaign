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
tdd_test_cases: ../../../09-testing/stories-phase-2/007-Fleet Health Inspection/FHI-02-inspection-dashboard-alerts-tdd-test-cases.md
tdd_index: ../../../09-testing/stories-phase-2/007-Fleet Health Inspection/00-all-test-cases.md
---

# FHI-02 — Inspection Dashboard — Due & Overdue Alerts

## TDD Test Cases

| Link | What |
|------|------|
| [FHI-02 TDD catalog](../../../09-testing/stories-phase-2/007-Fleet%20Health%20Inspection/FHI-02-inspection-dashboard-alerts-tdd-test-cases.md) | `FHI-02-TC01`… + edge cases (**unit status math after FHI-03**) |
| [Fleet Health Inspection TDD index](../../../09-testing/stories-phase-2/007-Fleet%20Health%20Inspection/00-all-test-cases.md) | All FHI-01…FHI-04 test cases |
| [Feature TDD folder](../../../09-testing/stories-phase-2/007-Fleet%20Health%20Inspection/README.md) | README + recommended TDD order |

Prefer unit tests for `InspectionStatusService` (2-day due-soon window) once FHI-01 templates and FHI-03 state updates exist.

## User Story

**As a** Driver Supervisor  
**I want** a dashboard showing which vehicles have inspection checkpoints due, overdue, or failed  
**So that** I can prioritise fleet health checks before dispatch

---

## Acceptance Criteria

### AC-1: Stats strip

Given a Driver Supervisor (or planner/admin) opens the Inspection Dashboard,

when own-fleet checkpoint states are aggregated,

then the stats strip shows vehicle count and due-soon / overdue / failed-last-round counts.

- [ ] Own fleet vehicle count, checkpoints due soon, overdue, failed last round.

**Test Scenarios (AC-1):**

```gherkin
Scenario: AC-1.1 - Stats strip counts own-fleet only
  Given own-fleet vehicles with mixed checkpoint statuses
  And vendor-fleet vehicles also exist
  When the dashboard loads
  Then stats include own-fleet vehicle count
  And due soon, overdue, and failed last-round counts exclude vendor fleet

Scenario: AC-1.2 - Failed last round counted separately
  Given a checkpoint with last_result FAIL still within interval
  When stats are computed
  Then failed last-round count includes that checkpoint
```

### AC-2: Checkpoint table

Given dashboard rows are built from `VehicleCheckpointState` and templates,

when status is computed as `next_due = last_checked + interval_days` with a **2-day** due-soon window,

then each row shows vehicle, type, checkpoint, interval, last checked, next due, and status chip OK / Due soon / Overdue / Failed (attention/fail from last round), with an alerts-only filter.

- [ ] Rows: vehicle, type, checkpoint name/category, interval, last checked, next due, status chip.
- [ ] Status: OK, Due soon, Overdue (computed from `last_checked + interval_days`).
- [ ] Failed/Attention flag from last round result.
- [ ] Filter: all vehicles / alerts only.

**Test Scenarios (AC-2):**

```gherkin
Scenario: AC-2.1 - OK when next_due is more than 2 days away
  Given last_checked + interval_days is more than 2 days after today
  And last_result is PASS
  When status is computed
  Then status chip is OK (valid)

Scenario: AC-2.2 - Due soon within 2-day window
  Given next_due is today or within the next 2 days inclusive of DUE_SOON_DAYS=2
  And today is not after next_due
  When status is computed
  Then status chip is Due soon

Scenario: AC-2.3 - Overdue when today is after next_due or never checked
  Given last_checked is null OR today > next_due
  When status is computed
  Then status chip is Overdue

Scenario: AC-2.4 - Failed / attention from last round
  Given last_result is FAIL or Needs attention (ATTENTION)
  When the row is rendered
  Then Failed/Attention flag is shown in addition to schedule status

Scenario: AC-2.5 - alerts_only filter
  Given a mix of OK and alert rows (due soon, overdue, failed/attention)
  When GET dashboard with alerts_only=true
  Then OK-only rows are excluded
  And alert rows remain
```

### AC-3: Quick action

Given a dashboard row for a vehicle,

when the supervisor clicks **Inspect**,

then Conduct Inspection opens with that vehicle pre-selected.

- [ ] **Inspect** button → Conduct Inspection tab with vehicle pre-selected.

**Test Scenarios (AC-3):**

```gherkin
Scenario: AC-3.1 - Inspect navigates with vehicle pre-selected
  Given a dashboard row for vehicle DHK-1234
  When the user clicks Inspect
  Then Conduct Inspection opens with DHK-1234 selected
```

### AC-4: API

Given clients consume the fleet inspection dashboard,

when `GET /api/v1/fleet-inspections/dashboard/?alerts_only=true` is called,

then responses are produced via unit-tested `InspectionStatusService`.

- [ ] `GET /api/v1/fleet-inspections/dashboard/?alerts_only=true`
- [ ] Uses `InspectionStatusService` — unit tested.

**Test Scenarios (AC-4):**

```gherkin
Scenario: AC-4.1 - Dashboard API returns rows and stats
  Given authenticated driver_supervisor with own-fleet data
  When GET /api/v1/fleet-inspections/dashboard/
  Then response includes stats strip fields and checkpoint rows

Scenario: AC-4.2 - alerts_only query param
  Given mixed statuses
  When GET .../dashboard/?alerts_only=true
  Then only alert rows are returned

Scenario: AC-4.3 - Status service is the single computation path
  Given InspectionStatusService unit fixtures for OK / due_soon / overdue / failed
  When the dashboard API builds rows
  Then it delegates status to InspectionStatusService (no duplicated schedule math)
```

---

## Edge Cases

### Schedule boundaries
- `DUE_SOON_DAYS = 2`: exactly 2 days before `next_due` → Due soon; more than 2 days → OK; day after `next_due` → Overdue.
- Never checked (`last_checked` null) → Overdue (not Due soon).
- Timezone: use tenant/org business date consistent with module conventions.

### Result vs schedule
- FAIL/ATTENTION can coexist with OK schedule status until a passing round clears the flag.
- Inactive templates should not appear as dashboard rows.

### Scope
- Own-fleet only; vendor vehicles excluded from counts and table.
- Unauthorized role denied on dashboard API.

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
| FHI-02-4 | Tests | Unit/API/E2E for AC-1…AC-4 + Edge Cases — [TDD catalog](../../../09-testing/stories-phase-2/007-Fleet%20Health%20Inspection/FHI-02-inspection-dashboard-alerts-tdd-test-cases.md) | High | Not started |

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
- [ ] Scenarios AC-1.1…AC-4.3 covered — see [FHI-02 TDD catalog](../../../09-testing/stories-phase-2/007-Fleet%20Health%20Inspection/FHI-02-inspection-dashboard-alerts-tdd-test-cases.md)
- [ ] TDD catalog statuses updated for P0 rows (`Planned` → `Failing` → `Passing`)

---

*Epic: Fleet Health Inspection | Phase: 2 (unscheduled) | 5 SP | Last Updated: 2026-09-14*
