---
jira_key: ~
jira_type: Story
jira_sprint: ~
story_id: FVM-02
title: Vehicle Tracking and Dashboard
epic: Fleet & Vehicle Management — Health Dashboard
status: Planning
story_points: 8
assignee: ~
prd_refs:
  - "§6.6.4 Vehicle Tracking & Dashboard"
feature_list: "SOW Phase-2 row 99 — Vehicle Tracking & Dashboard"
phase: Phase 2
related_stories:
  - FVM-01 (odometer km + VehicleServiceLog — consumed here, not rewritten)
  - MDM-05 (Vehicle master + operational_status)
  - DS-01 (Under Maintenance queue / clearance — status owner)
  - AD-04 (FuelEntry — fuel intake card; unwritten)
  - AD-02 (TO-serving vs No-TO hours — not this dashboard)
  - AD-06 / GPS-01 (map — not this dashboard)
implementation_docs:
  - DFMS-product-context/05-modules/02-master-data/vehicle-master-data.md
---

# FVM-02 — Vehicle Tracking and Dashboard

## User Story

**As a** Transport Planner  
**I want** a dashboard showing vehicle availability  
**So that** I can plan trips effectively.

## Feature (PRD §6.6.4)

Display labels are the V3 enum already on `Vehicle.operational_status` (PRD v3 + `apps/master_data/models.py`).

System SHALL provide a **fleet Health Dashboard** that:

- Shows per-vehicle **kilometers**, **fuel intake**, **maintenance history**, **operational lifecycle**
- Displays availability as:
  - **No Active TO** — not assigned to any TO
  - **Scheduled** — assigned to a TO, trip not started
  - **In-transit** — serving a started TO (towards source or destination, including yard legs)
  - **Under Maintenance** — taken for maintenance
  - **Inactive** — not serving (`is_active=false`)
- Links the vehicle to **TO, Trip, Driver, Fuel, and maintenance** records

## Business Context

Phase 1 already **stores and updates** these five statuses. TDO assignment pickers already **exclude** Under Maintenance / Inactive / vehicles on a non-terminal TO. This story is a **planner dashboard** (counts + per-vehicle health), not a new status engine and not a replacement for `GET /vehicles/available`.

```
Vehicle.operational_status  (TO lifecycle + DS-01 + is_active)
        │
        ▼
Transport Planner — Fleet Health Dashboard
        ├── status cards (counts)
        ├── vehicle list / detail
        ├── km          ← FVM-01 current_odometer_reading
        ├── fuel intake ← AD-04 FuelEntry (unavailable until that story)
        └── maintenance ← FVM-01 VehicleServiceLog + DS-01 inspection/clearance
```

## Acceptance Criteria

### AC-1 — Status cards (availability)

- [ ] Planner sees five counts for the current filter: **No Active TO**, **Scheduled**, **In-transit**, **Under Maintenance**, **Inactive**
- [ ] Counts match `Vehicle.operational_status` for own-fleet rows (no derived SOW labels)
- [ ] Clicking a card filters the vehicle list to that status
- [ ] In-transit includes all started-TO execution (not only “driving” GPS motion)

### AC-2 — Filters

- [ ] Filter by depot (`assigned_poi`)
- [ ] Ownership: own-fleet default
- [ ] Optional: vehicle type, search by registration
- [ ] Cards and list use the same filters

### AC-3 — Per-vehicle kilometers

- [ ] List/detail show `current_odometer_reading` when FVM-01 has a reading
- [ ] No reading → **odometer unavailable** (not 0, not haversine)
- [ ] Dashboard does **not** write odometer (FVM-01 / Driver Supervisor owns entry)

### AC-4 — Fuel intake

- [ ] When AD-04 `FuelEntry` exists: show period/lifetime liters (and optional cost) for that vehicle
- [ ] Until AD-04: fuel intake **unavailable** — no fake liters
- [ ] FVM-02 does not add a fuel-entry form

### AC-5 — Maintenance history & operational lifecycle

- [ ] Vehicle detail shows current **operational_status** (lifecycle now)
- [ ] If assigned: current TO number, TO status, driver (and trip if one exists)
- [ ] Maintenance history: FVM-01 service logs (date + odometer) when FVM-01 exists; DS-01 last inspection / under-maintenance / clearance when present
- [ ] Under Maintenance vehicles stay blocked from new TDO assignment (existing rule — regression)

### AC-6 — Surfaces & RBAC

- [ ] **Transport Planner** (+ Tenant Admin): full dashboard
- [ ] Driver Supervisor may view (same fleet) but this is not the DS-01 maintenance **queue**
- [ ] Not the Live GPS map; no new map layer (AD-06)


## Sub-tasks

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| FVM-02-1 | Requirements & story | This file (accepted by PO) | High | In Progress |
| FVM-02-2 | Implementation context | `05-modules/` write-up after this story is accepted — do not start Django from this file alone | High | Pending |
| FVM-02-3 | Status cards | Five-status counts + list filter | High | Pending |
| FVM-02-4 | Filters | Depot (`assigned_poi`), own-fleet default, type/search | High | Pending |
| FVM-02-5 | Kilometers | Read `current_odometer_reading`; unavailable if null | High | Pending |
| FVM-02-6 | Maintenance + links | Service log + DS-01 history; current TO / trip / driver | High | Pending |
| FVM-02-7 | Fuel intake | Consume FuelEntry when AD-04 exists; else unavailable | Medium | Pending |
| FVM-02-8 | Planner UI | Dashboard + vehicle detail | High | Pending |
| FVM-02-9 | Tests | Card counts vs status, filters, unavailable km/fuel, RBAC, assignment still blocked for Under Maintenance | High | Pending |

## Definition of Done

- [ ] AC-1…AC-6 checked against code (not against this markdown)
- [ ] Unit tests for status counts, depot filter, odometer unavailable, fuel unavailable without FuelEntry
- [ ] Existing TDO assignment exclusion for Under Maintenance / Inactive unchanged
- [ ] Live GPS behaviour unchanged
- [ ] `05-modules/` implementation context written (FVM-02-2) before merge of Django work
- [ ] Demo: Planner sees five cards; opens a vehicle; sees current status + TO/driver; km from FVM-01 or unavailable

## Dependencies

- **Depends on:** Vehicle master + `operational_status` (exists); FVM-01 for km and service-log rows; DS-01 history (exists); AD-04 for fuel numbers
- **Does not depend on:** Live GPS map, AD-02 utilization hours, GPS mileage
- **Does not replace:** DS-01 maintenance queue, TDO `GET /vehicles/available`, FVM-01 remaining-km planner

