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
  - ../../../../05-modules/08-fleet-management/fleet-health-inspection.md
  - ../../../../example-prototypes/fleet-operations.html
module_spec: 05-modules/08-fleet-management/fleet-health-inspection.md
tdd_test_cases: ../../../../09-testing/stories-phase-2/007-Fleet Health Inspection/FHI-02-inspection-dashboard-alerts-tdd-test-cases.md
tdd_index: ../../../../09-testing/stories-phase-2/007-Fleet Health Inspection/00-all-test-cases.md
---

# FHI-02 — Inspection Dashboard — Due & Overdue Alerts

## Test cases

Gherkin / TDD scenarios live under `09-testing` (not inline in this story).

| Navigate | Link |
|----------|------|
| **FHI-02 TDD catalog** (`AC-N.x` mapped) | [FHI-02-inspection-dashboard-alerts-tdd-test-cases.md](../../../../09-testing/stories-phase-2/007-Fleet%20Health%20Inspection/FHI-02-inspection-dashboard-alerts-tdd-test-cases.md) |
| **Fleet Health Inspection TDD index** (all stories) | [00-all-test-cases.md](../../../../09-testing/stories-phase-2/007-Fleet%20Health%20Inspection/00-all-test-cases.md) |
| **Feature TDD folder** | [README](../../../../09-testing/stories-phase-2/007-Fleet%20Health%20Inspection/README.md) |

Write failing tests from the catalog **before** implementation.


## User Story

**As a** Driver Supervisor  
**I want** a dashboard showing which vehicles have inspection checkpoints due, overdue, or failed  
**So that** I can prioritise fleet health checks before dispatch

---

## Acceptance Criteria

> **Test scenarios:** see [FHI-02 TDD catalog](../../../../09-testing/stories-phase-2/007-Fleet%20Health%20Inspection/FHI-02-inspection-dashboard-alerts-tdd-test-cases.md) · [Fleet Health Inspection index](../../../../09-testing/stories-phase-2/007-Fleet%20Health%20Inspection/00-all-test-cases.md)

### AC-1: Stats strip

Given a Driver Supervisor (or planner/admin) opens the Inspection Dashboard,

when own-fleet checkpoint states are aggregated,

then the stats strip shows vehicle count and due-soon / overdue / failed-last-round counts.

- [ ] Own fleet vehicle count, checkpoints due soon, overdue, failed last round.

### AC-2: Checkpoint table

Given dashboard rows are built from `VehicleCheckpointState` and templates,

when status is computed as `next_due = last_checked + interval_days` with a **2-day** due-soon window,

then each row shows vehicle, type, checkpoint, interval, last checked, next due, and status chip OK / Due soon / Overdue / Failed (attention/fail from last round), with an alerts-only filter.

- [ ] Rows: vehicle, type, checkpoint name/category, interval, last checked, next due, status chip.
- [ ] Status: OK, Due soon, Overdue (computed from `last_checked + interval_days`).
- [ ] Failed/Attention flag from last round result.
- [ ] Filter: all vehicles / alerts only.

### AC-3: Quick action

Given a dashboard row for a vehicle,

when the supervisor clicks **Inspect**,

then Conduct Inspection opens with that vehicle pre-selected.

- [ ] **Inspect** button → Conduct Inspection tab with vehicle pre-selected.

### AC-4: API

Given clients consume the fleet inspection dashboard,

when `GET /api/v1/fleet-inspections/dashboard/?alerts_only=true` is called,

then responses are produced via unit-tested `InspectionStatusService`.

- [ ] `GET /api/v1/fleet-inspections/dashboard/?alerts_only=true`
- [ ] Uses `InspectionStatusService` — unit tested.

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
| View inspection dashboard | `driver_supervisor`, `transport_planner`, `tenant_super_admin`, `tenant_admin` |

**Permission codes (proposed):** `inspection.dashboard.view`

---

## Sub-tasks

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| FHI-02-1 | `InspectionStatusService` | valid / due_soon / overdue computation | High | Not started |
| FHI-02-2 | Dashboard UI | Stats + table (prototype) | High | Not started |
| FHI-02-3 | Dashboard API | Fleet-wide checkpoint rows | High | Not started |
| FHI-02-4 | Tests | Unit/API/E2E for AC-1…AC-4 + Edge Cases — [TDD catalog](../../../../09-testing/stories-phase-2/007-Fleet%20Health%20Inspection/FHI-02-inspection-dashboard-alerts-tdd-test-cases.md) | High | Not started |

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
- [ ] Scenarios AC-1.1…AC-4.3 covered — see [FHI-02 TDD catalog](../../../../09-testing/stories-phase-2/007-Fleet%20Health%20Inspection/FHI-02-inspection-dashboard-alerts-tdd-test-cases.md)
- [ ] TDD catalog statuses updated for P0 rows (`Planned` → `Failing` → `Passing`)

---

*Epic: Fleet Health Inspection | Phase: 2 (unscheduled) | 5 SP | Last Updated: 2026-09-14*
