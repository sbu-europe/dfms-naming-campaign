---
jira_key: ~
jira_type: Story
jira_sprint: "Sprint 10"
story_id: VR-03
title: Vehicle Report — Detail View (Fuel, Parts, Compliance)
epic: Vehicle Reports
status: Pending
story_points: 5
assignee: ~
phase: Phase 2
design_ref: example-prototypes/fleet-operations.html (Fleet Overview per-vehicle metrics + Fuel History)
related_stories:
  - VR-02-vehicle-report-fleet-overview.md
  - FM-04-fuel-history-and-filters.md
  - WM-02-workshop-job-complete-and-part-installations.md
  - FHI-04-inspection-alerts-on-vehicle-report.md
source_docs:
  - ../../../../05-modules/11-reporting/vehicle-report.md
  - ../../../../example-prototypes/fleet-operations.html
module_spec: 05-modules/11-reporting/vehicle-report.md
---

# VR-03 — Vehicle Report — Detail View (Fuel, Parts, Compliance)

## User Story

**As a** Transport Planner or Driver Supervisor  
**I want** a detailed vehicle report with fuel, parts, and compliance sections  
**So that** I can investigate a specific vehicle’s health and history in one place

## Business Context

Drill-down from VR-02 overview cards. Read-only report — operational entry points link out to Fuel Entry (FM-01) or Garage Operations (workshop jobs) where permitted.

**Not** part of Vehicle Planning.

---

## Acceptance Criteria

### AC-1: Vehicle header

- [ ] Registration, model, fuel type, operational status, assigned driver, odometer.
- [ ] Alert banners: fuel anomaly, expired/expiring parts, compliance issues, inspection overdue/failed.

### AC-2: Compliance section

- [ ] Fitness expiry + status chip
- [ ] Insurance expiry + status chip

### AC-3: Fuel section (period-filtered)

- [ ] Stats: entry count, total liters, total cost, avg km/L, last km/L, total distance, ৳/km
- [ ] Recent fuel entries table (link to full Fuel History for supervisors)
- [ ] Anomaly entries highlighted

### AC-4: Inspection section

- [ ] Table of checkpoints: name, category, interval, last checked, next due, status chip, last result
- [ ] Link to Conduct Inspection (Fleet Operations) for supervisors with permission

### AC-5: Parts section

- [ ] Table of active installations (from workshop job completions): item name, installed date, expires on, days/km remaining, status chip, source job ref
- [ ] Separate highlight for expired and expiring soon

### AC-6: API

- [ ] `GET /api/v1/reports/vehicles/{id}/?fuel_period_days=30`
- [ ] Returns `VehicleReportDetail` DTO (see module spec).

### AC-7: Separation from Vehicle Planning

- [ ] No TO assignment UI on this page.
- [ ] Optional link: “Open Vehicle Planning” → standard planning board (if user has permission).

---

## API Endpoints

```
GET    /api/v1/reports/vehicles/{id}/?fuel_period_days=30
```

---

## Access & Permissions

| Action | Role |
|--------|------|
| View vehicle report detail | `transport_planner`, `driver_supervisor`, `tenant_admin` |
| Link to Vehicle Planning | Requires `MENU_VEHICLE_PLANNING_VIEW` |

---

## Sub-tasks — Sprint 10

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| VR-03-1 | Detail UI | Compliance + fuel + inspection + parts sections | High | Not started |
| VR-03-2 | Detail API | `GET /api/v1/reports/vehicles/{id}/` | High | Not started |

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| VR-02 | Upstream | Card drill-down |
| FM-04 | Upstream | Recent fuel entries |
| WM-02 | Upstream | Parts status from `VehiclePartInstallation` |
| FHI-04 | Upstream | Inspection checkpoint status |

---

## Definition of Done

- [ ] Detail template with three sections
- [ ] Detail API + unit tests for aggregation
- [ ] No changes to Vehicle Planning templates

---

*Epic: Vehicle Reports | Phase: 2 | Sprint 10: 5 SP | Last Updated: 2026-09-01*
