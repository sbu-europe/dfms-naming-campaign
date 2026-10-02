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

History reads **saved fuel entries**. Each row shows the gauge and odometer updated by that entry, plus distance and km/L stored at save. There is no ৳/km or ৳/L column. Each row is the reference used by the next fill for that vehicle.

## Acceptance Criteria

> **Test scenarios:** see [FM-04 TDD catalog](../../../../09-testing/stories-phase-2/005-Fuel%20Management/FM-04-fuel-history-and-filters-tdd-test-cases.md) · [Fuel Management index](../../../../09-testing/stories-phase-2/005-Fuel%20Management/00-all-test-cases.md)

### AC-1: History table

Given a Driver Supervisor opens Fuel History,

when entries exist for own-fleet vehicles,

then a newest-first table shows the prototype columns and supports vehicle filtering.

- [ ] Columns: Date, Vehicle, Before (L), After (L), Filled (L), Cost (BDT, entered amount only), Odometer, Distance, km/L, Entry Type, Entered By, Status (Normal / Anomaly). No ৳/km or ৳/L.
- [ ] Sorted newest first.
- [ ] Vehicle filter dropdown (All Vehicles + per-vehicle).

### AC-2: Stats strip (updates with filter)

Given the history filter changes,

when the filtered set is applied,

then the stats strip recalculates for that set only.

- [ ] Total Entries, Total Liters, Avg km/L, Anomalies Flagged. No cost-rate stat (no ৳/km, no ৳/L). Total Cost is a sum of entered Fuel Cost amounts only, not a calculated rate.

### AC-3: Access

Given different roles request fuel history,

when they list entries,

then supervisors and admins see all own-fleet entries, and a driver sees the entries that driver created.

- [ ] Driver Supervisor, Tenant Super Admin, Tenant Admin: all own-fleet entries.
- [ ] Driver: **Fuel History** in Fleet operations. The list and the detail page show only entries that user created, including after the trip leaves Driving Towards Source. Opening another user’s entry is not allowed.

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
- A driver with no created entries sees an empty list.
- A driver cannot read another user’s entries, or another vehicle, by changing `vehicle_id`.

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
| View own entries (entries that user created) | `driver` |
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

## Implementation

Follow the epic rule in the [Fuel Management README](./README.md). History is an admin portal page: `admin/base_site.html`, existing table and filter patterns, Fleet operations nav. Columns follow the prototype; chrome matches the live portal.

## Definition of Done

- [ ] History page uses the existing admin portal theme and list/filter structure (no new visual language)
- [ ] History view matches prototype columns
- [ ] Stats strip recalculates on filter change
- [ ] RBAC enforced (scenarios AC-3.1…AC-3.3)
- [ ] API/list tests for AC-1…AC-4 — see [FM-04 TDD catalog](../../../../09-testing/stories-phase-2/005-Fuel%20Management/FM-04-fuel-history-and-filters-tdd-test-cases.md)
- [ ] TDD catalog statuses updated for P0 rows (`Planned` → `Failing` → `Passing`)

---

*Epic: Fuel Management | Phase: 2 (unscheduled) | 3 SP | Last Updated: 2026-10-01*
