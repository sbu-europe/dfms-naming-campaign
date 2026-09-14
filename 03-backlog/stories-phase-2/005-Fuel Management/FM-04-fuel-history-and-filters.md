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
  - ../../../05-modules/08-fleet-management/fuel-management.md
  - ../../../example-prototypes/fleet-operations.html
module_spec: 05-modules/08-fleet-management/fuel-management.md
tdd_test_cases: ../../../09-testing/stories-phase-2/005-Fuel Management/FM-04-fuel-history-and-filters-tdd-test-cases.md
tdd_index: ../../../09-testing/stories-phase-2/005-Fuel Management/00-all-test-cases.md
---

# FM-04 — Fuel History & Filters

## TDD Test Cases

| Link | What |
|------|------|
| [FM-04 TDD catalog](../../../09-testing/stories-phase-2/005-Fuel%20Management/FM-04-fuel-history-and-filters-tdd-test-cases.md) | `FM-04-TC01`…`TC10` + edge cases (`AC-N.x` mapped) |
| [Fuel Management TDD index](../../../09-testing/stories-phase-2/005-Fuel%20Management/00-all-test-cases.md) | All FM-01…FM-05 test cases |
| [Feature TDD folder](../../../09-testing/stories-phase-2/005-Fuel%20Management/README.md) | README + recommended TDD order |

Write failing tests from the catalog **before** implementation.

## User Story

**As a** Driver Supervisor  
**I want to** view fuel entry history with filters and summary statistics  
**So that** I can review consumption patterns and investigate anomalies

## Acceptance Criteria

### AC-1: History table

Given a Driver Supervisor opens Fuel History,

when entries exist for own-fleet vehicles,

then a newest-first table shows the prototype columns and supports vehicle filtering.

- [ ] Columns: Date, Vehicle, Before (L), After (L), Filled (L), Cost (BDT), Odometer, Distance, km/L, ৳/km, Entry Type, Entered By, Status (Normal / Anomaly).
- [ ] Sorted newest first.
- [ ] Vehicle filter dropdown (All Vehicles + per-vehicle).

**Test Scenarios (AC-1):**

```gherkin
Scenario: AC-1.1 - History lists newest first with required columns
  Given multiple fuel entries exist across vehicles
  When the supervisor opens Fuel History with All Vehicles
  Then rows are ordered by refueling_datetime descending
  And each row shows the required columns including Entry Type and Status

Scenario: AC-1.2 - Filter by single vehicle
  Given entries for vehicles A and B
  When the supervisor selects vehicle A in the filter
  Then only entries for vehicle A are shown

Scenario: AC-1.3 - Empty history state
  Given no fuel entries match the current filter
  When the history view loads
  Then an empty state is shown (no error)
```

### AC-2: Stats strip (updates with filter)

Given the history filter changes,

when the filtered set is applied,

then the stats strip recalculates for that set only.

- [ ] Total Entries, Total Liters, Total Cost (BDT), Avg km/L, Anomalies Flagged.

**Test Scenarios (AC-2):**

```gherkin
Scenario: AC-2.1 - Stats match filtered entries
  Given vehicle A has 2 entries (40 L + 60 L, costs 4000 + 6000, one anomaly)
  When the supervisor filters to vehicle A
  Then Total Entries is 2
  And Total Liters is 100
  And Total Cost is 10000
  And Anomalies Flagged is 1
  And Avg km/L uses only entries where km/L is non-null

Scenario: AC-2.2 - Stats for All Vehicles
  Given entries across multiple vehicles
  When filter is All Vehicles
  Then stats aggregate across all visible own-fleet entries
```

### AC-3: Access

Given different roles request fuel history,

when they list entries,

then supervisors/admins see all own-fleet entries and drivers see only their assigned-vehicle entries.

- [ ] Driver Supervisor: all own-fleet entries.
- [ ] Driver (mobile): own entries for assigned vehicle only.

**Test Scenarios (AC-3):**

```gherkin
Scenario: AC-3.1 - Supervisor sees all own-fleet entries
  Given entries for vehicles A and B (own fleet)
  When a Driver Supervisor requests fuel history
  Then both vehicles' entries are returned

Scenario: AC-3.2 - Driver sees only assigned vehicle entries
  Given the driver is assigned to vehicle A
  And entries exist for A and B
  When the driver requests fuel history
  Then only entries for vehicle A entered by/relevant to that driver scope are returned
  And vehicle B entries are not returned

Scenario: AC-3.3 - Unauthorized role denied
  Given a user without fuel.history.view / fuel.entry.view_own
  When they request fuel history
  Then access is denied
```

### AC-4: Admin + API

Given backend and admin surfaces are implemented,

when clients query history,

then Django admin (and optional custom view) and list APIs support vehicle filter/ordering.

- [ ] Django admin changelist with filters; optional custom Fuel History view matching prototype.
- [ ] `GET /api/v1/vehicles/{id}/fuel-history/` and `GET /api/v1/fuel-entries/?vehicle_id=`
- [ ] Export CSV/PDF is out of scope (v1).

**Test Scenarios (AC-4):**

```gherkin
Scenario: AC-4.1 - List API filters by vehicle_id and orders newest first
  Given entries for vehicle A
  When GET /api/v1/fuel-entries/?vehicle_id=A&ordering=-refueling_datetime
  Then only vehicle A entries are returned newest first

Scenario: AC-4.2 - Vehicle fuel-history endpoint
  Given entries for vehicle A
  When GET /api/v1/vehicles/A/fuel-history/
  Then the response includes those entries with computed fields and anomaly_flag
```

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
- [ ] API/list tests for AC-1…AC-4 — see [FM-04 TDD catalog](../../../09-testing/stories-phase-2/005-Fuel%20Management/FM-04-fuel-history-and-filters-tdd-test-cases.md)
- [ ] TDD catalog statuses updated for P0 rows (`Planned` → `Failing` → `Passing`)

---

*Epic: Fuel Management | Phase: 2 (unscheduled) | 3 SP | Last Updated: 2026-09-14*
