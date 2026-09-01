---
jira_key: ~
jira_type: Story
jira_sprint: "Sprint 10"
story_id: VR-02
title: Vehicle Report — Fleet Overview (Health Cards)
epic: Vehicle Reports
status: Pending
story_points: 8
assignee: ~
phase: Phase 2
design_ref: example-prototypes/fuel-management.html (Fleet Dashboard tab)
related_stories:
  - VR-01-reports-menu-vehicle-report-navigation.md
  - VR-03-vehicle-report-detail-view.md
  - FM-05-fuel-anomaly-baselines.md
  - VP-03-part-expiry-status-and-alerts.md
source_docs:
  - ../../../../05-modules/11-reporting/vehicle-report.md
  - ../../../../example-prototypes/fuel-management.html
module_spec: 05-modules/11-reporting/vehicle-report.md
---

# VR-02 — Vehicle Report — Fleet Overview (Health Cards)

## User Story

**As a** Transport Planner or Driver Supervisor  
**I want** a fleet overview showing each own-fleet vehicle’s health summary  
**So that** I can monitor fuel performance, part expiry, and compliance without opening Vehicle Planning

## Business Context

Implements the prototype **Fleet Dashboard** card grid under **Reports → Vehicle Report** — not inside Vehicle Planning.

Aggregated via `VehicleReportService` ([`vehicle-report.md`](../../../05-modules/11-reporting/vehicle-report.md)).

Workshop metrics excluded (deferred).

---

## Acceptance Criteria

### AC-1: Fleet stats strip

- [ ] Summary row: Own Fleet Vehicles, In Workshop (count), Fuel Entries (period), Fuel Anomalies, optional parts alert count.

### AC-2: Vehicle health cards

Each own-fleet vehicle card shows:

- [ ] Registration, model, fuel type
- [ ] Operational status badge
- [ ] Assigned driver, odometer (km)
- [ ] Last km/L (or N/A), fuel cost (period), fuel entry count
- [ ] Parts alert: “N expiring soon” / “N expired”
- [ ] Fuel anomaly chip when applicable

### AC-3: Interaction

- [ ] Click card → Vehicle Report **detail** view (VR-03).
- [ ] Search/filter by registration; filter “has alerts”.
- [ ] Fuel period selector (default 30 days).

### AC-4: API

- [ ] `GET /api/v1/reports/vehicles/?fuel_period_days=30&page=1`
- [ ] Uses `VehicleReportService.build_list()` — no N+1.

---

## API Endpoints

```
GET    /api/v1/reports/vehicles/?fuel_period_days=30&page=1&has_alerts=true
```

---

## Access & Permissions

| Action | Role |
|--------|------|
| View fleet overview | `transport_planner`, `driver_supervisor`, `tenant_admin` |
| Drill down to detail | Same roles |

---

## Sub-tasks — Sprint 10

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| VR-02-1 | `VehicleReportService.build_list()` | Aggregation service | High | Not started |
| VR-02-2 | Overview UI | Stats strip + health cards (prototype Fleet Dashboard) | High | Not started |
| VR-02-3 | List API | `GET /api/v1/reports/vehicles/` | High | Not started |

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| VR-01 | Upstream | Menu + route |
| FM-03, FM-05 | Upstream | Fuel metrics |
| VP-03 | Upstream | Parts expiry counts |

---

## Definition of Done

- [ ] Overview page matches prototype Fleet Dashboard card intent
- [ ] Stats strip + card grid
- [ ] List API performant

---

*Epic: Vehicle Reports | Phase: 2 | Sprint 10: 8 SP | Last Updated: 2026-09-01*
