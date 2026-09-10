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
---

# FM-04 — Fuel History & Filters

## User Story

**As a** Driver Supervisor  
**I want to** view fuel entry history with filters and summary statistics  
**So that** I can review consumption patterns and investigate anomalies

## Acceptance Criteria

### AC-1: History table

- [ ] Columns: Date, Vehicle, Before (L), After (L), Filled (L), Cost (BDT), Odometer, Distance, km/L, ৳/km, Entry Type, Entered By, Status (Normal / Anomaly).
- [ ] Sorted newest first.
- [ ] Vehicle filter dropdown (All Vehicles + per-vehicle).

### AC-2: Stats strip (updates with filter)

- [ ] Total Entries, Total Liters, Total Cost (BDT), Avg km/L, Anomalies Flagged.

### AC-3: Access

- [ ] Driver Supervisor: all own-fleet entries.
- [ ] Driver (mobile): own entries for assigned vehicle only.

### AC-4: Admin + API

- [ ] Django admin changelist with filters; optional custom Fuel History view matching prototype.
- [ ] `GET /api/v1/vehicles/{id}/fuel-history/` and `GET /api/v1/fuel-entries/?vehicle_id=`

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
| View all own-fleet fuel history | `driver_supervisor`, `tenant_admin` |
| View own entries (assigned vehicle) | `driver` |
| Export (CSV/PDF) | Out of scope (v1) |

---

## Sub-tasks

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| FM-04-1 | History list + filters | Prototype columns; vehicle filter; stats strip | High | Not started |

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
- [ ] RBAC enforced

---

*Epic: Fuel Management | Phase: 2 (unscheduled) | 3 SP | Last Updated: 2026-09-01*
