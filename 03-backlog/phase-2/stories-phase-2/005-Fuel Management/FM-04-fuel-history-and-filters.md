---
jira_key: ~
jira_type: Story
jira_sprint: ~
story_id: FM-04
title: Fuel History & Filters
epic: Fuel Management
status: Pending
story_points: 3
assignee: ~
phase: Phase 2
design_ref: example-prototypes/fleet-operations.html (Fuel History tab)
related_stories:
  - FM-01-fuel-entry-driver-supervisor-admin.md
  - FM-05-fuel-anomaly-baselines.md
source_docs:
  - ../../../../05-modules/08-fleet-management/fuel-management.md
  - ../../../../example-prototypes/fleet-operations.html
module_spec: 05-modules/08-fleet-management/fuel-management.md
tdd_test_cases: ../../../../09-testing/stories-phase-2/005-Fuel Management/FM-04-fuel-history-and-filters-tdd-test-cases.md
tdd_index: ../../../../09-testing/stories-phase-2/005-Fuel Management/00-all-test-cases.md
---

# FM-04 — Fuel History & Filters

## Test cases

Gherkin / TDD scenarios live under `09-testing` (not inline in this story).

| Navigate | Link |
|----------|------|
| **FM-04 TDD catalog** (`AC-N.x` mapped) | [FM-04-fuel-history-and-filters-tdd-test-cases.md](../../../../09-testing/stories-phase-2/005-Fuel%20Management/FM-04-fuel-history-and-filters-tdd-test-cases.md) |
| **Fuel Management TDD index** (all stories) | [00-all-test-cases.md](../../../../09-testing/stories-phase-2/005-Fuel%20Management/00-all-test-cases.md) |
| **Feature TDD folder** | [README](../../../../09-testing/stories-phase-2/005-Fuel%20Management/README.md) |

Write failing tests from the catalog **before** implementation.


## User Story

**As a** Driver Supervisor  
**I want to** view fuel entry history with filters and summary statistics  
**So that** I can review consumption patterns and investigate anomalies

## Acceptance Criteria

> **Test scenarios:** see [FM-04 TDD catalog](../../../../09-testing/stories-phase-2/005-Fuel%20Management/FM-04-fuel-history-and-filters-tdd-test-cases.md) · [Fuel Management index](../../../../09-testing/stories-phase-2/005-Fuel%20Management/00-all-test-cases.md)

### AC-1: History table

Given a Driver Supervisor opens Fuel History,

when entries exist for own-fleet vehicles,

then a newest-first table shows the prototype columns and supports vehicle filtering.

- [ ] Columns: Date, Vehicle, Before (L), After (L), Filled (L), Cost (BDT), Odometer, Distance, km/L, ৳/km, Entry Type, Entered By, Status (Normal / Anomaly).
- [ ] Sorted newest first.
- [ ] Vehicle filter dropdown (All Vehicles + per-vehicle).

### AC-2: Stats strip (updates with filter)

Given the history filter changes,

when the filtered set is applied,

then the stats strip recalculates for that set only.

- [ ] Total Entries, Total Liters, Total Cost (BDT), Avg km/L, Anomalies Flagged.

### AC-3: Access

Given different roles request fuel history,

when they list entries,

then supervisors/admins see all own-fleet entries and drivers see only their assigned-vehicle entries.

- [ ] Driver Supervisor: all own-fleet entries.
- [ ] Driver (mobile): own entries for assigned vehicle only.

### AC-4: Admin + API

Given backend and admin surfaces are implemented,

when clients query history,

then Django admin (and optional custom view) and list APIs support vehicle filter/ordering.

- [ ] Django admin changelist with filters; optional custom Fuel History view matching prototype.
- [ ] `GET /api/v1/vehicles/{id}/fuel-history/` and `GET /api/v1/fuel-entries/?vehicle_id=`
- [ ] Export CSV/PDF is out of scope (v1).

---

## Edge Cases

### Stats
- Avg km/L with all null km/L (only first entries): show N/A or 0 per UI convention — must not divide by zero.
- Anomalies Flagged counts `anomaly_flag=true` in the filtered set only.

### Multi-tenant / fleet scope
- Vendor-fleet vehicles never appear in history for this feature (own fleet only).
- Tenant isolation: entries from another tenant never returned.

### Driver scope
- If driver has no assignment: history empty with guidance message.
- Driver cannot widen filter to other vehicles via API `vehicle_id` tampering.

---

## API Endpoints

```
GET    /api/v1/fuel-entries/?vehicle_id={id}&ordering=-refueling_datetime
GET    /api/v1/vehicles/{id}/fuel-history/
GET    /api/v1/fuel-entries/stats/?vehicle_id={id}   # optional aggregated stats
```

---

## Access & Permissions

| Action | Role |
|--------|------|
| View all own-fleet fuel history | `driver_supervisor`, `tenant_super_admin`, `tenant_admin` |
| View own entries (assigned vehicle) | `driver` |
| Export (CSV/PDF) | Out of scope (v1) |

---

## Sub-tasks

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| FM-04-1 | History list + filters | Prototype columns; vehicle filter; stats strip | High | Not started |
| FM-04-2 | Tests | Cover AC-1…AC-4 scenarios + Edge Cases (RBAC, empty set, avg km/L nulls) | High | Not started |

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| FM-01, FM-02, FM-03 | Upstream | Entries and computed fields exist |
| FM-05 | Upstream | Anomaly status column |

---

## Definition of Done

- [ ] History view matches prototype columns
- [ ] Stats strip recalculates on filter change
- [ ] RBAC enforced (scenarios AC-3.1…AC-3.3)
- [ ] API/list tests for AC-1…AC-4 — see [FM-04 TDD catalog](../../../../09-testing/stories-phase-2/005-Fuel%20Management/FM-04-fuel-history-and-filters-tdd-test-cases.md)
- [ ] TDD catalog statuses updated for P0 rows (`Planned` → `Failing` → `Passing`)

---

*Epic: Fuel Management | Phase: 2 (unscheduled) | 3 SP | Last Updated: 2026-09-14*
