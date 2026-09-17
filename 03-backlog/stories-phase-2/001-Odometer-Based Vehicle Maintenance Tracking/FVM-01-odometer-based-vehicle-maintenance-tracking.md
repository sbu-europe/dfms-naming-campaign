---
jira_key: ~
jira_type: Story
jira_sprint: ~
story_id: FVM-01
title: Odometer-Based Vehicle Maintenance Tracking
epic: Fleet & Vehicle Management — Maintenance
status: Planning
story_points: 8
assignee: ~
prd_refs:
  - "§6.5.10 GPS-Based Vehicle Maintenance Tracking"
feature_list: "SOW Phase-2 row 104 — GPS-based Vehicle Maintenance Tracking"
phase: Phase 2
related_stories:
  - MDM-05 (Vehicle master — odometer columns exist, unused)
  - DS-01 (Driver Supervisor fleet ops / under maintenance — same role enters km)
  - GPS-01 (Live GPS speed — idle vs movement; not remaining km)
implementation_docs:
  - DFMS-product-context/05-modules/02-master-data/vehicle-master-data.md
tdd_test_cases: ../../../09-testing/stories-phase-2/001-Odometer-Based Vehicle Maintenance Tracking/FVM-01-odometer-based-vehicle-maintenance-tracking-tdd-test-cases.md
tdd_index: ../../../09-testing/stories-phase-2/001-Odometer-Based Vehicle Maintenance Tracking/00-all-test-cases.md
---

# FVM-01 — Odometer-Based Vehicle Maintenance Tracking

## Test cases

Gherkin / TDD scenarios live under `09-testing` (not inline in this story).

| Navigate | Link |
|----------|------|
| **FVM-01 TDD catalog** (`AC-N.x` mapped) | [FVM-01-odometer-based-vehicle-maintenance-tracking-tdd-test-cases.md](../../../09-testing/stories-phase-2/001-Odometer-Based%20Vehicle%20Maintenance%20Tracking/FVM-01-odometer-based-vehicle-maintenance-tracking-tdd-test-cases.md) |
| **Odometer Maintenance TDD index** | [00-all-test-cases.md](../../../09-testing/stories-phase-2/001-Odometer-Based%20Vehicle%20Maintenance%20Tracking/00-all-test-cases.md) |
| **Feature TDD folder** | [README](../../../09-testing/stories-phase-2/001-Odometer-Based%20Vehicle%20Maintenance%20Tracking/README.md) |

Write failing tests from the catalog **before** implementation.

## User Story

**As a** Transport Planner  
**I want** to use GPS movement and distance data to plan vehicle maintenance proactively  
**So that** vehicles are serviced on time, breakdown risk is reduced, and fleet availability improves.

## Feature (PRD §6.5.10)

PRD still lists GPS odometer as the distance source, *depending on IoT device capability*. **This fleet’s GPS trackers are not odometer-capable.** Remaining km is therefore **manual meter reading**, not device mileage and not haversine.

System tracks:

- Distance travelled per vehicle from **supervisor-entered odometer km** (read off the vehicle meter)
- Distance since last service
- Remaining distance before next service
- Configurable maintenance threshold (e.g. every **5,000 km / 10,000 km / 20,000 km**)
- High-stress vehicle usage patterns *(Top 5 vehicles by completed TO count — not remaining km)*

System computes vehicle usage indicators:

- Average daily distance *(from successive meter readings)*
- High-load route frequency *(Top 5 origin→destination pairs by completed TO count in the period)*
- Idle vs movement ratio *(GPS speed: **&lt; 3 km/h = idle/stopped**, otherwise moving. Same threshold as Live GPS `MOVING_SPEED_KMH`.)*

## Business Context

Vehicle master has `initial_odometer_reading` / `current_odometer_reading`, but Phase 1 made them **read-only and never written** — they are not on the vehicle create/edit form.

A **Vehicle Supervisor** reads the physical odometer and enters the km. In DFMS that actor is the existing **Driver Supervisor** role (fleet operations / DS-01) — not a new role, and not GPS ingest.

```
Vehicle Supervisor (Driver Supervisor)
  reads meter on the truck
      → enters odometer km (+ reading datetime)
          → VehicleOdometerReading history
          → Vehicle.current_odometer_reading (monotonic)
              → remaining km vs last service + interval
```

GPS continues to provide location and **idle vs movement** from speed. It does **not** write odometer.

## Acceptance Criteria

> **Test scenarios:** see [FVM-01 TDD catalog](../../../09-testing/stories-phase-2/001-Odometer-Based%20Vehicle%20Maintenance%20Tracking/FVM-01-odometer-based-vehicle-maintenance-tracking-tdd-test-cases.md) · [Odometer Maintenance index](../../../09-testing/stories-phase-2/001-Odometer-Based%20Vehicle%20Maintenance%20Tracking/00-all-test-cases.md)

### AC-1 — Supervisor meter entry

Given a Driver Supervisor records a meter reading for an own-fleet vehicle,
when they enter the km and the date and time of the reading,
then the system keeps a history of readings, updates the vehicle’s current km only if the new km is the same or higher, and never invents remaining km from GPS.

- [ ] **Record meter reading**  
  **Given** a Driver Supervisor is recording a meter reading for an own-fleet vehicle  
  **When** they enter the vehicle, km, date and time of the reading, and optional notes  
  **Then** the reading is accepted

- [ ] **First reading becomes the starting km**  
  **Given** a vehicle has never had a starting meter reading  
  **When** the first accepted meter reading is saved  
  **Then** that km is stored as the vehicle’s starting km  
  **And** it is also stored as the vehicle’s current km

- [ ] **Current km only stays the same or goes up**  
  **Given** a vehicle’s current km is 12,000  
  **When** the Driver Supervisor enters 12,150 km (or the same 12,000 km)  
  **Then** the vehicle’s current km is updated to that value  
  **And** a reading that is the same as or higher than the current km is accepted

- [ ] **Lower km is rejected**  
  **Given** a vehicle’s current km is 12,000  
  **When** the Driver Supervisor enters 11,900 km  
  **Then** the reading is **rejected** with a clear error (not quietly ignored)  
  **And** the vehicle’s current km stays 12,000

- [ ] **Accepted reading is kept in history**  
  **Given** a Driver Supervisor saves an accepted reading  
  **When** the save completes  
  **Then** a history record exists in the Audit log with the vehicle, km, date and time of the reading, notes, and who entered it

- [ ] **No reading shows odometer unavailable**  
  **Given** a vehicle has no meter reading yet  
  **When** a Transport Planner looks at remaining km  
  **Then** the vehicle shows **odometer unavailable**  
  **And** remaining km is not guessed from GPS or map distance

- [ ] **Live GPS is unchanged**  
  **Given** live GPS tracking is already in use  
  **When** a meter reading is saved or not saved  
  **Then** live GPS tracking works as it does today  
  **And** remaining km is not taken from GPS mileage

### AC-2 — Distance since last service & remaining km

Given a vehicle has a current meter reading and a service interval,
when a Transport Planner views remaining km,
then the system calculates km since last service and remaining km from meter readings and last service, and shows Due soon or Overdue without changing the vehicle’s availability status.

- [ ] **Distance since last service**  
  **Given** a vehicle has a current meter km and a km recorded at last service  
  **When** a Transport Planner views remaining km  
  **Then** distance since last service is:

  > **Distance since last service = Current KM − KM at last service**

- [ ] **Remaining km**  
  **Given** a vehicle has km at last service, a service interval, and current km  
  **When** a Transport Planner views remaining km  
  **Then** remaining km is:

  > **Remaining KM = KM at last service + Service interval − Current KM**

  **And** a negative remaining km means the vehicle is overdue

- [ ] **No last service uses starting km**  
  **Given** a vehicle has never had a service logged, but a starting km exists  
  **When** a Transport Planner views remaining km  
  **Then** km since last service is:

  > **Distance since last service = Current KM − Starting KM**

  **And** remaining km uses starting km in place of km at last service:

  > **Remaining KM = Starting KM + Service interval − Current KM**

- [ ] **Remaining km unknown without a starting point**  
  **Given** a vehicle has no service logged and no starting km  
  **When** a Transport Planner views remaining km  
  **Then** remaining km is unknown until the first service is logged **or** a starting km is entered

- [ ] **Due soon flag**  
  **Given** remaining km meets:

  > **Remaining KM > 0** and **Remaining KM ≤ 10% of service interval**

  **When** a Transport Planner views the vehicle  
  **Then** they see a **Due soon** flag

- [ ] **Overdue flag**  
  **Given** remaining km meets:

  > **Remaining KM ≤ 0**

  **When** a Transport Planner views the vehicle  
  **Then** they see an **Overdue** flag

- [ ] **Logging a service does not change availability**  
  **Given** a Driver Supervisor or Tenant Admin records a completed service (date, meter km, optional notes)  
  **When** the service is saved  
  **Then** the service is stored  
  **And** the vehicle’s availability status does **not** change automatically

### AC-3 — Configurable maintenance threshold

Given a Tenant Admin sets how often a vehicle should be serviced,
when they set a service interval on that vehicle,
then remaining km and Due soon / Overdue use **that vehicle’s interval only**.
- [ ] **Set interval on a vehicle**  
  **Given** a Tenant Admin is configuring maintenance for a vehicle  
  **When** they set that vehicle’s service interval to **5,000 / 10,000 / 20,000 km** or another positive km  
  **Then** that interval is stored on that vehicle only  
  **And** it is not applied to any other vehicle

- [ ] **No interval until one is set on the vehicle**  
  **Given** a vehicle has no service interval  
  **When** remaining km is shown  
  **Then** remaining km, Due soon, and Overdue based on interval are unknown until an interval is set for that vehicle  
  **And** no company-wide default interval is used

- [ ] **Planner sees the vehicle’s interval**  
  **Given** each vehicle has its own service interval, or none  
  **When** a Transport Planner views the own-fleet list or vehicle details  
  **Then** they can see the interval set on each vehicle

### AC-4 — Usage indicators

Given a Transport Planner chooses a date range for own-fleet usage,
when they view usage indicators,
then average daily distance comes from meter readings, busy routes come from completed transport orders, and idle vs moving comes from GPS speed — not from how full the truck is or whether it has a transport order.

- [ ] **Average daily distance**  
  **Given** supervisor meter readings exist in the chosen date range  
  **When** a Transport Planner views average daily distance  
  **Then** average daily distance is:

  > **Average daily distance = (Last KM in the period − First KM in the period) ÷ Number of days**

- [ ] **Busiest routes — Top 5**  
  **Given** completed transport orders with origin and destination in the chosen date range  
  **When** a Transport Planner views busy-route frequency  
  **Then** they see the **Top 5 origin → destination** routes by number of completed transport orders (origin, destination, and order count)

- [ ] **Busiest routes — per vehicle**  
  **Given** the Top 5 routes for the period  
  **When** a Transport Planner views a vehicle  
  **Then** they see how many of that vehicle’s completed transport orders used each of those five routes (count and % of the vehicle’s completed orders)  
  **And** how full the truck was is not used

- [ ] **Idle vs moving**  
  **Given** GPS movement status already stored from the vehicle’s GPS device for the chosen date range  
  **When** idle vs moving is shown  
  **Then** speed below **3 km/h** counts as idle/stopped and **3 km/h or above** counts as moving  
  **And** time is added up in each category  
  **And** whether the vehicle has a transport order is not used for this indicator

### AC-5 — High-stress usage patterns

Given a Transport Planner chooses a date range,
when they view high-stress usage,
then the list is the Top 5 own-fleet vehicles by number of completed transport orders only.

- [ ] **Top 5 vehicles by completed transport orders**  
  **Given** own-fleet vehicles with completed transport orders in the chosen date range  
  **When** a Transport Planner views high-stress usage  
  **Then** they see the **Top 5 own-fleet vehicles** that served the most completed transport orders (vehicle, order count, and optionally % of all completed orders in the period)

- [ ] **Rank uses completed order count only**  
  **Given** vehicles also have remaining km, service interval, daily km, Top 5 routes, and GPS idle vs moving  
  **When** high-stress rank is shown  
  **Then** rank is **completed transport order count only** — not remaining km, interval, daily km, Top 5 routes, or GPS idle vs moving

- [ ] **Ties for 5th are included**  
  **Given** more than one vehicle has the same completed-order count as 5th place  
  **When** the Top 5 list is shown  
  **Then** every vehicle with that same count is included (the list can have more than five rows)

- [ ] **Vehicles with no completed orders are left off**  
  **Given** a vehicle has 0 completed transport orders in the period  
  **When** the Top 5 list is shown  
  **Then** that vehicle is not on the list

### AC-6 — Who can see and do what

Given users with Driver Supervisor, Transport Planner, or Tenant Admin roles,
when they open meter reading or maintenance screens,
then each role can only do the actions listed below.

- [ ] **Driver Supervisor can enter readings**  
  **Given** a user is a Driver Supervisor  
  **When** they open the vehicle they are updating  
  **Then** they can enter meter readings, log a service, and see current km

- [ ] **Planner and Tenant Admin can view**  
  **Given** a user is a Transport Planner or Tenant Admin  
  **When** they open the own-fleet list or vehicle details  
  **Then** they see current km, service interval, km since last service, remaining km, the three usage indicators, Due soon / Overdue, Top 5 routes, and Top 5 vehicles

- [ ] **Filters**  
  **Given** a Transport Planner is on the own-fleet list  
  **When** they filter by overdue, due soon, or odometer unavailable  
  **Then** the list shows only vehicles matching that filter

- [ ] **Date range**  
  **Given** a Transport Planner is viewing usage indicators  
  **When** they open the date range selector  
  **Then** they can choose a period  
  **And** the default is the last 30 days

- [ ] **Tenant Admin sets the service interval**  
  **Given** a Tenant Admin  
  **When** they open a vehicle’s maintenance settings  
  **Then** they can set the service interval for **that vehicle only**

- [ ] **Transport Planner cannot enter meter km**  
  **Given** a user is a Transport Planner and not a Tenant Admin  
  **When** they view a vehicle  
  **Then** they cannot enter meter km (view only)

## Sub-tasks

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| FVM-01-1 | Requirements & story | This file (accepted by PO) | High | In Progress |
| FVM-01-2 | Implementation context | `05-modules/` write-up after this story is accepted — do not start Django from this file alone | High | Pending |
| FVM-01-3 | Meter entry | Driver Supervisor form: km, reading datetime, notes; history table | High | Pending |
| FVM-01-4 | Persist odometer | Monotonic write to `Vehicle.current_odometer_reading`; seed `initial_odometer_reading` on first reading | High | Pending |
| FVM-01-5 | Models | Per-vehicle service interval (no company default), `VehicleServiceLog` | High | Pending |
| FVM-01-6 | Remaining km | Since-service / remaining formulas + Due soon / Overdue | High | Pending |
| FVM-01-7 | Usage indicators | Avg daily (readings), high-load Top 5 routes, idle vs movement (GPS &lt; 3 km/h), high-stress Top 5 vehicles by completed TO count | High | Pending |
| FVM-01-8 | Planner + supervisor UI | Planner list/detail/filters; supervisor entry; interval config | High | Pending |
| FVM-01-9 | Tests | Reject drop, monotonic write, formulas, unavailable, RBAC — [TDD catalog](../../../09-testing/stories-phase-2/001-Odometer-Based%20Vehicle%20Maintenance%20Tracking/FVM-01-odometer-based-vehicle-maintenance-tracking-tdd-test-cases.md) | High | Pending |

## Definition of Done

- [ ] AC-1…AC-6 checked against code (not against this markdown)
- [ ] Unit tests for meter entry, monotonic write, remaining-km formulas, Top 5 vehicles by completed TO count, RBAC — scenarios AC-1.1…AC-6.6 — see [FVM-01 TDD catalog](../../../09-testing/stories-phase-2/001-Odometer-Based%20Vehicle%20Maintenance%20Tracking/FVM-01-odometer-based-vehicle-maintenance-tracking-tdd-test-cases.md)
- [ ] TDD catalog statuses updated for P0 rows (`Planned` → `Failing` → `Passing`)
- [ ] Vehicle with no reading never gets a fake remaining-km number from GPS
- [ ] GPS ingest / Live GPS regression unchanged (no mileage decode)
- [ ] `05-modules/` implementation context written (FVM-01-2) before merge of Django work
- [ ] Demo: Driver Supervisor enters meter km → Planner sees remaining km vs interval

## Dependencies

- **Depends on:** Vehicle master (`apps/master_data.Vehicle`), Driver Supervisor RBAC, completed TOs with `origin_poi` + `destination_poi` for Top 5 routes and per-vehicle TO counts for Top 5 vehicles; GPS speed history **only** for idle vs movement
- **Does not depend on:** GPS mileage, FuelEntry, fleet health dashboard, map KPI layer
- **Does not replace:** DS-01 under-maintenance workflow

