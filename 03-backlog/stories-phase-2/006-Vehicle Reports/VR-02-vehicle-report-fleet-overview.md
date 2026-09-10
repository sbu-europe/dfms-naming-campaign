---
jira_key: ~
jira_type: Story
jira_sprint: ~
story_id: VR-02
title: Vehicle Report — Fleet Overview (Health Cards)
epic: Vehicle Reports
status: Pending
story_points: 8
assignee: ~
phase: Phase 2
design_ref: example-prototypes/fleet-operations.html (Fleet Overview tab)
related_stories:
  - VR-01-reports-menu-vehicle-report-navigation.md
  - VR-03-vehicle-report-detail-view.md
  - FM-05-fuel-anomaly-baselines.md
  - FHI-04-inspection-alerts-on-vehicle-report.md
source_docs:
  - ../../../05-modules/11-reporting/vehicle-report.md
  - ../../../example-prototypes/fleet-operations.html
module_spec: 05-modules/11-reporting/vehicle-report.md
---

# VR-02 — Vehicle Report — Fleet Overview (Health Cards)

## User Story

**As a** Transport Planner or Driver Supervisor  
**I want** a fleet overview showing each own-fleet vehicle’s health summary  
**So that** I can monitor fuel performance, inspection status, and compliance without opening Vehicle Planning

## Business Context

Implements the prototype **Fleet Overview** card grid under **Reports → Vehicle Report** — not inside Vehicle Planning.

Per-vehicle metrics: last km/L, avg km/L, distance, fuel cost, ৳/km, fuel entries, operational status, fuel anomaly chip, and inspection alert counts.

---

## Acceptance Criteria

### AC-1: Fleet stats strip

- [ ] Summary row: Own Fleet Vehicles, Fuel Entries (period), Fuel Anomalies, Inspection Overdue (optional).

### AC-2: Vehicle health cards

Each own-fleet vehicle card shows:

- [ ] Registration, model, fuel type
- [ ] Operational status badge
- [ ] Assigned driver, odometer (km)
- [ ] Last km/L, avg km/L, total distance (period), fuel cost, ৳/km
- [ ] Fuel entry count
- [ ] Inspection alert: overdue / due soon / failed checkpoint counts
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

## Sub-tasks

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| VR-02-1 | `VehicleReportService.build_list()` | Aggregation service | High | Not started |
| VR-02-2 | Overview UI | Stats strip + health cards (prototype Fleet Overview) | High | Not started |
| VR-02-3 | List API | `GET /api/v1/reports/vehicles/` | High | Not started |

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| VR-01 | Upstream | Menu + route |
| FM-03, FM-05 | Upstream | Fuel metrics |
| FHI-04 | Upstream | Inspection alert counts |

---

## Definition of Done

- [ ] Overview page matches prototype Fleet Overview card intent
- [ ] Stats strip + card grid
- [ ] List API performant

---

*Epic: Vehicle Reports | Phase: 2 (unscheduled) | 8 SP | Last Updated: 2026-09-07*
