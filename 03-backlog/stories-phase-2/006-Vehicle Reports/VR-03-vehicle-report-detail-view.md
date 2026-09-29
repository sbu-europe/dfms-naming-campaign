---
jira_key: ~
jira_type: Story
jira_sprint: ~
story_id: VR-03
title: Vehicle Report — Detail View (Fuel, Inspection, Compliance)
epic: Vehicle Reports
status: Pending
story_points: 5
assignee: ~
phase: Phase 2
design_ref: example-prototypes/fleet-operations.html (Fleet Overview per-vehicle metrics + Fuel History)
related_stories:
  - VR-02-vehicle-report-fleet-overview.md
  - FM-04-fuel-history-and-filters.md
  - FHI-04-inspection-alerts-on-vehicle-report.md
source_docs:
  - ../../../05-modules/11-reporting/vehicle-report.md
  - ../../../example-prototypes/fleet-operations.html
module_spec: 05-modules/11-reporting/vehicle-report.md
tdd_test_cases: ../../../09-testing/stories-phase-2/006-Vehicle Reports/VR-03-vehicle-report-detail-tdd-test-cases.md
tdd_index: ../../../09-testing/stories-phase-2/006-Vehicle Reports/00-all-test-cases.md
---

# VR-03 — Vehicle Report — Detail View (Fuel, Inspection, Compliance)

## Test cases

Gherkin / TDD scenarios live under `09-testing` (not inline in this story).

| Navigate | Link |
|----------|------|
| **VR-03 TDD catalog** (`AC-N.x` mapped) | [VR-03-vehicle-report-detail-tdd-test-cases.md](../../../09-testing/stories-phase-2/006-Vehicle%20Reports/VR-03-vehicle-report-detail-tdd-test-cases.md) |
| **Vehicle Reports TDD index** (all stories) | [00-all-test-cases.md](../../../09-testing/stories-phase-2/006-Vehicle%20Reports/00-all-test-cases.md) |
| **Feature TDD folder** | [README](../../../09-testing/stories-phase-2/006-Vehicle%20Reports/README.md) |

Write failing tests from the catalog **before** implementation.


## User Story

**As a** Tenant Super Admin, Tenant Admin, Transport Planner, or Driver Supervisor  
**I want** a detailed vehicle report with fuel, inspection, and compliance sections  
**So that** I can investigate a specific vehicle’s health and history in one place

## Business Context

Drill-down from VR-02 overview cards. Read-only report — operational entry points link out to Fuel Entry (FM-01) or Conduct Inspection where permitted.

**Not** part of Vehicle Planning.

---

## Acceptance Criteria

> **Test scenarios:** see [VR-03 TDD catalog](../../../09-testing/stories-phase-2/006-Vehicle%20Reports/VR-03-vehicle-report-detail-tdd-test-cases.md) · [Vehicle Reports index](../../../09-testing/stories-phase-2/006-Vehicle%20Reports/00-all-test-cases.md)

### AC-1: Vehicle header

Given an authorized user opens a vehicle report detail,

when the page loads,

then the header shows identity fields and alert banners when applicable.

- [ ] Registration, model, fuel type, operational status, assigned driver, odometer.
- [ ] Alert banners: fuel anomaly, compliance issues, inspection overdue/failed.

### AC-2: Compliance section

Given vehicle master compliance dates exist,

when detail loads,

then fitness and insurance expiry show with status chips.

- [ ] Fitness expiry + status chip
- [ ] Insurance expiry + status chip

### AC-3: Fuel section (period-filtered)

Given fuel entries exist for the vehicle,

when the selected fuel period is applied,

then stats, recent entries, and anomaly highlights are shown.

- [ ] Stats: entry count, total liters, total cost, avg km/L, last km/L, total distance, ৳/km
- [ ] Recent fuel entries table (link to full Fuel History for supervisors)
- [ ] Anomaly entries highlighted

### AC-4: Inspection section

Given checkpoint states exist for the vehicle,

when detail loads,

then a read-only checkpoint table is shown with optional Conduct Inspection link.

- [ ] Table of checkpoints: name, category, interval, last checked, next due, status chip, last result
- [ ] Link to Conduct Inspection (Fleet Operations) for supervisors with permission

### AC-5: API

Given an authorized client requests detail,

when `GET /api/v1/reports/vehicles/{id}/` is called,

then `VehicleReportDetail` DTO is returned for own-fleet vehicles.

- [ ] `GET /api/v1/reports/vehicles/{id}/?fuel_period_days=30`
- [ ] Returns `VehicleReportDetail` DTO (see module spec).

### AC-6: Separation from Vehicle Planning

Given the user is on Vehicle Report detail,

when they view the page,

then there is no TO assignment UI; optional planning link only if permitted.

- [ ] No TO assignment UI on this page.
- [ ] Optional link: “Open Vehicle Planning” → standard planning board (if user has permission).

---

## Edge Cases

- No fuel history: fuel stats empty/N/A; section still renders.
- No inspection templates/states: empty inspection table + guidance.
- Expired fitness/insurance: chips show expired/attention without blocking the page.
- Read-only: no inline edit of fuel/inspection from this page.

---

## API Endpoints

```
GET    /api/v1/reports/vehicles/{id}/?fuel_period_days=30
```

---

## Access & Permissions

| Action | Role |
|--------|------|
| View vehicle report detail | `tenant_super_admin`, `tenant_admin`, `transport_planner`, `driver_supervisor` |
| Link to Vehicle Planning | Requires `MENU_VEHICLE_PLANNING_VIEW` |

---

## Sub-tasks

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| VR-03-1 | Detail UI | Compliance + fuel + inspection sections | High | Not started |
| VR-03-2 | Detail API | `GET /api/v1/reports/vehicles/{id}/` | High | Not started |
| VR-03-3 | Tests | Cover AC-1…AC-6 + Edge Cases | High | Not started |

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| VR-02 | Upstream | Card drill-down |
| FM-04 | Upstream | Recent fuel entries |
| FHI-04 | Upstream | Inspection checkpoint status |

---

## Definition of Done

- [ ] Detail template with compliance, fuel, and inspection sections
- [ ] Detail API + unit tests for aggregation
- [ ] No changes to Vehicle Planning templates
- [ ] Tests for AC-1.1…AC-6.2 — see [VR-03 TDD catalog](../../../09-testing/stories-phase-2/006-Vehicle%20Reports/VR-03-vehicle-report-detail-tdd-test-cases.md)
- [ ] TDD catalog statuses updated for P0 rows

---

*Epic: Vehicle Reports | Phase: 2 (unscheduled) | 5 SP | Last Updated: 2026-09-14*
