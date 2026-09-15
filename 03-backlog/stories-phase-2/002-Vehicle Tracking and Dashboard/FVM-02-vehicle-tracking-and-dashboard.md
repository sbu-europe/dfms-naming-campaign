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

Given a Transport Planner opens the fleet Health Dashboard,
when they view availability for the current filter,
then they see five counts that match each vehicle’s availability status, and clicking a card filters the vehicle list.

- [ ] **Five status counts**  
  **Given** a Transport Planner is on the fleet Health Dashboard  
  **When** they view availability for the current filter  
  **Then** they see five counts: **No Active TO**, **Scheduled**, **In-transit**, **Under Maintenance**, **Inactive**

- [ ] **Counts match the vehicle’s real status**  
  **Given** own-fleet vehicles each have an availability status  
  **When** the dashboard shows the five cards  
  **Then** the counts match those statuses for own-fleet vehicles  
  **And** the cards do not use different or made-up status names

- [ ] **Clicking a card filters the list**  
  **Given** the five status cards are visible  
  **When** the planner clicks a card  
  **Then** the vehicle list shows only vehicles with that status

- [ ] **In-transit includes any started trip**  
  **Given** a vehicle is already on a started transport order (towards origin or destination, including yard movement)  
  **When** the cards are counted  
  **Then** that vehicle is counted as **In-transit**  
  **And** the GPS does not need to show the vehicle as moving

### AC-2 — Filters

Given a Transport Planner applies dashboard filters,
when they change depot, ownership, type, or registration search,
then the status cards and the vehicle list use the same filters.

- [ ] **Depot filter**  
  **Given** vehicles assigned to different depots  
  **When** the planner filters by depot  
  **Then** cards and list include only vehicles for that depot

- [ ] **Own-fleet default**  
  **Given** the planner opens the dashboard without choosing an ownership filter  
  **When** the page loads  
  **Then** it defaults to own-fleet vehicles

- [ ] **Optional type and registration search**  
  **Given** the planner is on the dashboard  
  **When** they filter by vehicle type and/or search by registration  
  **Then** cards and list match that type and/or registration

- [ ] **Cards and list use the same filters**  
  **Given** depot, ownership, type, and search filters are applied  
  **When** the planner views the cards and the vehicle list  
  **Then** both use the same filters

### AC-3 — Per-vehicle kilometers

Given a vehicle may or may not have a supervisor meter reading,
when a planner views the vehicle list or details,
then they see the current km or **odometer unavailable**, and they cannot enter a meter reading from this dashboard.

- [ ] **Show current km when a reading exists**  
  **Given** a supervisor meter reading exists for the vehicle  
  **When** the planner opens the list or vehicle details  
  **Then** they see the current km

- [ ] **No reading shows odometer unavailable**  
  **Given** the vehicle has no meter reading  
  **When** the planner opens the list or vehicle details  
  **Then** they see **odometer unavailable**  
  **And** the screen does not show 0 km or a GPS/map distance

- [ ] **Dashboard cannot change the meter reading**  
  **Given** a Transport Planner is on the dashboard  
  **When** they view kilometers  
  **Then** they cannot enter or change the meter reading  
  **And** only the Driver Supervisor enters meter km (on the meter-entry screen)

### AC-4 — Fuel intake

Given fuel figures come from fuel entries (when that feature exists),
when a planner views a vehicle,
then they see liters for the period and lifetime if fuel entries exist, otherwise **unavailable** — never made-up liters, and no fuel-entry form on this dashboard.

- [ ] **Fuel liters when entries exist**  
  **Given** fuel entries exist for the vehicle  
  **When** the planner views fuel intake  
  **Then** they see liters for the period and lifetime (and cost, if recorded) for that vehicle

- [ ] **Fuel unavailable until fuel entries exist**  
  **Given** no fuel entries exist yet  
  **When** the planner views fuel intake  
  **Then** fuel intake is **unavailable**  
  **And** no made-up liters are shown

- [ ] **No fuel-entry form on this dashboard**  
  **Given** a planner is on the Health Dashboard  
  **When** they open a vehicle  
  **Then** they cannot enter fuel from this screen

### AC-5 — Maintenance history & current assignment

Given a planner opens vehicle details,
when the vehicle is assigned and/or has maintenance history,
then they see current availability status, transport order / driver / trip, and service or inspection history, and Under Maintenance vehicles still cannot be assigned to a new transport order.

- [ ] **Current availability status**  
  **Given** a vehicle has an availability status  
  **When** the planner opens vehicle details  
  **Then** they see the current status (what the vehicle is doing now)

- [ ] **Current transport order, driver, and trip**  
  **Given** the vehicle is assigned to a transport order  
  **When** the planner opens vehicle details  
  **Then** they see the current transport order number, order status, driver, and trip if one exists

- [ ] **Maintenance history**  
  **Given** service records and/or inspection, under-maintenance, or clearance history exist  
  **When** the planner opens vehicle details  
  **Then** they see service records (date and meter km) when those exist  
  **And** last inspection / under maintenance / clearance when those exist

- [ ] **Under Maintenance still cannot be assigned**  
  **Given** a vehicle is **Under Maintenance**  
  **When** someone looks for a vehicle to assign to a new transport order  
  **Then** that vehicle is still not available to assign

### AC-6 — Who can see and do what

Given Transport Planner, Tenant Admin, or Driver Supervisor users,
when they open the fleet Health Dashboard,
then planners and admins get the full dashboard, supervisors may view the same fleet, and this is not the maintenance work queue or the live GPS map.

- [ ] **Planner and Tenant Admin get the full dashboard**  
  **Given** a user is a Transport Planner or Tenant Admin  
  **When** they open the fleet Health Dashboard  
  **Then** they have the full dashboard

- [ ] **Driver Supervisor may view**  
  **Given** a user is a Driver Supervisor  
  **When** they open the dashboard for the same fleet  
  **Then** they may view it  
  **And** this is not the Driver Supervisor maintenance **work queue**

- [ ] **Not the live GPS map**  
  **Given** the planner is on the Health Dashboard  
  **When** they view fleet health  
  **Then** this is not the live GPS map  
  **And** no map is added on this screen

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

