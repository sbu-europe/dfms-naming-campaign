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
tdd_test_cases: ../../../09-testing/stories-phase-2/006-Vehicle Reports/VR-02-fleet-overview-tdd-test-cases.md
tdd_index: ../../../09-testing/stories-phase-2/006-Vehicle Reports/00-all-test-cases.md
---

# VR-02 — Vehicle Report — Fleet Overview (Health Cards)

## Test cases

Gherkin / TDD scenarios live under `09-testing` (not inline in this story).

| Navigate | Link |
|----------|------|
| **VR-02 TDD catalog** (`AC-N.x` mapped) | [VR-02-fleet-overview-tdd-test-cases.md](../../../09-testing/stories-phase-2/006-Vehicle%20Reports/VR-02-fleet-overview-tdd-test-cases.md) |
| **Vehicle Reports TDD index** (all stories) | [00-all-test-cases.md](../../../09-testing/stories-phase-2/006-Vehicle%20Reports/00-all-test-cases.md) |
| **Feature TDD folder** | [README](../../../09-testing/stories-phase-2/006-Vehicle%20Reports/README.md) |

Write failing tests from the catalog **before** implementation.


## User Story

**As a** Tenant Super Admin, Tenant Admin, Transport Planner, or Driver Supervisor  
**I want** a fleet overview showing each own-fleet vehicle’s health summary  
**So that** I can monitor fuel performance, inspection status, and compliance without opening Vehicle Planning

## Business Context

Implements the prototype **Fleet Overview** card grid under **Reports → Vehicle Report** — not inside Vehicle Planning.

Per-vehicle metrics: last km/L, avg km/L, distance, fuel cost, ৳/km, fuel entries, operational status, fuel anomaly chip, and inspection alert counts.

---

## Acceptance Criteria

> **Test scenarios:** see [VR-02 TDD catalog](../../../09-testing/stories-phase-2/006-Vehicle%20Reports/VR-02-fleet-overview-tdd-test-cases.md) · [Vehicle Reports index](../../../09-testing/stories-phase-2/006-Vehicle%20Reports/00-all-test-cases.md)

### AC-1: Fleet stats strip

Given an authorized user opens Vehicle Report overview,

when the page loads for the selected fuel period,

then a summary strip shows fleet-level counts.

- [ ] Summary row: Own Fleet Vehicles, Fuel Entries (period), Fuel Anomalies, Inspection Overdue (optional).

### AC-2: Vehicle health cards

Given own-fleet vehicles exist,

when the overview renders,

then each card shows identity, fuel metrics, and alert chips (own-fleet only).

- [ ] Registration, model, fuel type
- [ ] Operational status badge
- [ ] Assigned driver, odometer (km)
- [ ] Last km/L, avg km/L, total distance (period), fuel cost, ৳/km
- [ ] Fuel entry count
- [ ] Inspection alert: overdue / due soon / failed checkpoint counts
- [ ] Fuel anomaly chip when applicable

### AC-3: Interaction

Given the overview is visible,

when the user searches, filters, changes period, or clicks a card,

then the list updates and detail opens (VR-03).

- [ ] Click card → Vehicle Report **detail** view (VR-03).
- [ ] Search/filter by registration; filter “has alerts”.
- [ ] Fuel period selector (default 30 days).

### AC-4: API

Given API clients request the fleet report list,

when `GET /api/v1/reports/vehicles/` is called,

then `VehicleReportService.build_list()` returns paginated own-fleet cards without N+1.

- [ ] `GET /api/v1/reports/vehicles/?fuel_period_days=30&page=1`
- [ ] Uses `VehicleReportService.build_list()` — no N+1.
- [ ] Supports `has_alerts=true`.

---

## Edge Cases

- Empty fleet: stats zero + empty-state UI (no error).
- Vehicle with no fuel entries in period: metrics N/A or zero per module spec; card still shown.
- Period change recalculates strip and cards for that window only.
- Tenant isolation: other tenant vehicles never returned.

---

## API Endpoints

```
GET    /api/v1/reports/vehicles/?fuel_period_days=30&page=1&has_alerts=true
```

---

## Access & Permissions

| Action | Role |
|--------|------|
| View fleet overview | `tenant_super_admin`, `tenant_admin`, `transport_planner`, `driver_supervisor` |
| Drill down to detail | Same roles |

---

## Sub-tasks

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| VR-02-1 | `VehicleReportService.build_list()` | Aggregation service | High | Not started |
| VR-02-2 | Overview UI | Stats strip + health cards (prototype Fleet Overview) | High | Not started |
| VR-02-3 | List API | `GET /api/v1/reports/vehicles/` | High | Not started |
| VR-02-4 | Tests | Cover AC-1…AC-4 + Edge Cases | High | Not started |

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
- [ ] Tests for AC-1.1…AC-4.3 — see [VR-02 TDD catalog](../../../09-testing/stories-phase-2/006-Vehicle%20Reports/VR-02-fleet-overview-tdd-test-cases.md)
- [ ] TDD catalog statuses updated for P0 rows

---

*Epic: Vehicle Reports | Phase: 2 (unscheduled) | 8 SP | Last Updated: 2026-09-14*
