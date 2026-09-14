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

## TDD Test Cases

| Link | What |
|------|------|
| [VR-03 TDD catalog](../../../09-testing/stories-phase-2/006-Vehicle%20Reports/VR-03-vehicle-report-detail-tdd-test-cases.md) | `VR-03-TC##` ↔ `AC-N.x` |
| [Vehicle Reports TDD index](../../../09-testing/stories-phase-2/006-Vehicle%20Reports/00-all-test-cases.md) | All VR-01…VR-03 |
| [Feature TDD folder](../../../09-testing/stories-phase-2/006-Vehicle%20Reports/README.md) | README + TDD order |

Write failing tests from the catalog **before** implementation.

## User Story

**As a** Transport Planner or Driver Supervisor  
**I want** a detailed vehicle report with fuel, inspection, and compliance sections  
**So that** I can investigate a specific vehicle’s health and history in one place

## Business Context

Drill-down from VR-02 overview cards. Read-only report — operational entry points link out to Fuel Entry (FM-01) or Conduct Inspection where permitted.

**Not** part of Vehicle Planning.

---

## Acceptance Criteria

### AC-1: Vehicle header

Given an authorized user opens a vehicle report detail,

when the page loads,

then the header shows identity fields and alert banners when applicable.

- [ ] Registration, model, fuel type, operational status, assigned driver, odometer.
- [ ] Alert banners: fuel anomaly, compliance issues, inspection overdue/failed.

**Test Scenarios (AC-1):**

```gherkin
Scenario: AC-1.1 - Header fields rendered
  Given own-fleet vehicle DHK-1234
  When GET detail / reports detail page opens
  Then registration, model, fuel type, status, driver, odometer are shown

Scenario: AC-1.2 - Alert banners when issues exist
  Given the vehicle has a fuel anomaly and overdue inspection
  When detail loads
  Then fuel anomaly and inspection overdue/failed banners are visible
```

### AC-2: Compliance section

Given vehicle master compliance dates exist,

when detail loads,

then fitness and insurance expiry show with status chips.

- [ ] Fitness expiry + status chip
- [ ] Insurance expiry + status chip

**Test Scenarios (AC-2):**

```gherkin
Scenario: AC-2.1 - Compliance chips shown
  Given fitness and insurance expiry dates on the vehicle
  When detail loads
  Then Fitness and Insurance rows show expiry + status chip
```

### AC-3: Fuel section (period-filtered)

Given fuel entries exist for the vehicle,

when the selected fuel period is applied,

then stats, recent entries, and anomaly highlights are shown.

- [ ] Stats: entry count, total liters, total cost, avg km/L, last km/L, total distance, ৳/km
- [ ] Recent fuel entries table (link to full Fuel History for supervisors)
- [ ] Anomaly entries highlighted

**Test Scenarios (AC-3):**

```gherkin
Scenario: AC-3.1 - Fuel stats for period
  Given fuel entries in the last 30 days
  When detail loads with fuel_period_days=30
  Then stats reflect that period only

Scenario: AC-3.2 - Anomaly rows highlighted
  Given an entry with anomaly_flag=true
  When the recent entries table renders
  Then that row is visually highlighted

Scenario: AC-3.3 - Link to Fuel History for supervisor
  Given a driver_supervisor user
  When they click full Fuel History from the fuel section
  Then they navigate to FM-04 history scoped to the vehicle
```

### AC-4: Inspection section

Given checkpoint states exist for the vehicle,

when detail loads,

then a read-only checkpoint table is shown with optional Conduct Inspection link.

- [ ] Table of checkpoints: name, category, interval, last checked, next due, status chip, last result
- [ ] Link to Conduct Inspection (Fleet Operations) for supervisors with permission

**Test Scenarios (AC-4):**

```gherkin
Scenario: AC-4.1 - Checkpoint table columns
  Given VehicleCheckpointState rows for the vehicle
  When detail loads
  Then table shows name, category, interval, last checked, next due, status, last result

Scenario: AC-4.2 - Conduct Inspection link for permitted supervisor
  Given driver_supervisor with inspection.create permission
  When detail loads
  Then a link to Conduct Inspection is available
```

### AC-5: API

Given an authorized client requests detail,

when `GET /api/v1/reports/vehicles/{id}/` is called,

then `VehicleReportDetail` DTO is returned for own-fleet vehicles.

- [ ] `GET /api/v1/reports/vehicles/{id}/?fuel_period_days=30`
- [ ] Returns `VehicleReportDetail` DTO (see module spec).

**Test Scenarios (AC-5):**

```gherkin
Scenario: AC-5.1 - Detail API returns DTO
  When GET /api/v1/reports/vehicles/{id}/?fuel_period_days=30
  Then response matches VehicleReportDetail (header, compliance, fuel, inspection)

Scenario: AC-5.2 - Vendor vehicle detail rejected
  Given a vendor-fleet vehicle id
  When GET detail
  Then request is rejected or 404 within own-fleet scope

Scenario: AC-5.3 - Unauthorized denied
  Given user without MENU_VEHICLE_REPORT_VIEW
  When GET detail
  Then access is denied
```

### AC-6: Separation from Vehicle Planning

Given the user is on Vehicle Report detail,

when they view the page,

then there is no TO assignment UI; optional planning link only if permitted.

- [ ] No TO assignment UI on this page.
- [ ] Optional link: “Open Vehicle Planning” → standard planning board (if user has permission).

**Test Scenarios (AC-6):**

```gherkin
Scenario: AC-6.1 - No TO assignment controls
  When Vehicle Report detail loads
  Then no assign/unassign TO controls are present

Scenario: AC-6.2 - Planning link only with MENU_VEHICLE_PLANNING_VIEW
  Given a user with MENU_VEHICLE_PLANNING_VIEW
  When detail loads
  Then optional "Open Vehicle Planning" link is shown
  Given a user without that permission
  Then the planning link is hidden
```

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
| View vehicle report detail | `transport_planner`, `driver_supervisor`, `tenant_admin` |
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
