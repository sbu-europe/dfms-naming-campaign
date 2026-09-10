---
jira_key: ~
jira_type: Story
jira_sprint: ~
story_id: "001"
title: Odometer-Based Vehicle Maintenance Tracking
epic: Fleet & Vehicle Management — Maintenance
status: Planning
story_points: 8
assignee: ~
spec_file: US-odometer-based-vehicle-maintenance-tracking.md
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
---

# 001 — Odometer-Based Vehicle Maintenance Tracking

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

### AC-1 — Supervisor meter entry

- [ ] Driver Supervisor can record an odometer reading: vehicle, km, date/time of the reading, optional notes
- [ ] First reading on a vehicle with null initial odometer also sets `initial_odometer_reading`
- [ ] `Vehicle.current_odometer_reading` updates when the new km is ≥ current (monotonic)
- [ ] km less than current is **rejected** (not silently ignored)
- [ ] Each accepted reading is stored in history (`VehicleOdometerReading`) with who entered it
- [ ] Vehicle with no reading yet shows **odometer unavailable** — remaining km is not invented from GPS/haversine
- [ ] GPS ingest and Live GPS behaviour unchanged (no mileage decode in this story)

### AC-2 — Distance since last service & remaining km

- [ ] Distance since last service = `current_odometer − last_service_odometer` (km)
- [ ] Remaining km = `last_service_odometer + interval_km − current_odometer` (may be negative = overdue)
- [ ] If no last-service record: since-service = `current − initial_odometer` when initial exists; remaining uses initial as the baseline; otherwise remaining is unknown until first service log **or** initial odometer is set
- [ ] Planner sees a **Due soon** flag when remaining km ≤ 10% of the vehicle’s interval (and remaining > 0)
- [ ] Planner sees an **Overdue** flag when remaining km ≤ 0
- [ ] Driver Supervisor or Tenant Admin can record a completed service (date + odometer km + optional notes). Recording a service does **not** auto-flip `operational_status`

### AC-3 — Configurable maintenance threshold

- [ ] Tenant Admin sets the tenant default interval: **5000 / 10000 / 20000 km** (or a custom positive km)
- [ ] Per-vehicle override optional; empty override uses tenant default
- [ ] Transport Planner can see which interval applies to each vehicle

### AC-4 — Usage indicators

- [ ] **Average daily distance** (period): `(odo_end − odo_start) / days` from supervisor readings
- [ ] **High-load route frequency** (period): **Top 5 source→destination** pairs by completed TO count. Planner sees the five routes (origin POI, destination POI, TO count). Per vehicle: how many of that vehicle’s completed TOs used each of those five (count + % of the vehicle’s completed TOs). No truck fill-factor / 80% capacity.
- [ ] **Idle vs movement ratio** (period): GPS speed **&lt; 3 km/h** counts as idle/stopped; **≥ 3 km/h** as moving. Accumulate time in each bucket. Do not use TO serving vs No Active TO for this indicator.

### AC-5 — High-stress usage patterns

- [ ] Planner sees the **Top 5 own-fleet vehicles** that **served the most completed TOs** in the selected period (vehicle, completed TO count, optionally % of all completed TOs in the period)
- [ ] Rank is **completed TO count only** — not remaining km, interval, daily km, Top 5 routes, or GPS idle vs movement
- [ ] Ties for 5th: include every vehicle with that same completed-TO count (can be more than five rows)
- [ ] Vehicles with 0 completed TOs in the period are not in the list

### AC-6 — Surfaces & RBAC

- [ ] **Driver Supervisor:** enter odometer readings; log a service; see current km on the vehicle they are updating
- [ ] **Transport Planner** (+ Tenant Admin): own-fleet list/detail — current odometer, interval, since last service, remaining km, the three indicators, Due soon / Overdue, Top 5 routes, Top 5 vehicles
- [ ] Filter: overdue / due soon / odometer unavailable
- [ ] Period selector for indicators (default last 30 days)
- [ ] Tenant Admin owns interval config
- [ ] Transport Planner does **not** enter meter km (view only) unless also Tenant Admin


## Sub-tasks

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| 001-1 | Requirements & story | This folder (accepted by PO) | High | In Progress |
| 001-2 | Implementation context | `05-modules/` write-up after this story is accepted — do not start Django from this folder alone | High | Pending |
| 001-3 | Meter entry | Driver Supervisor form: km, reading datetime, notes; history table | High | Pending |
| 001-4 | Persist odometer | Monotonic write to `Vehicle.current_odometer_reading`; seed `initial_odometer_reading` on first reading | High | Pending |
| 001-5 | Models | Tenant interval default, per-vehicle override, `VehicleServiceLog` | High | Pending |
| 001-6 | Remaining km | Since-service / remaining formulas + Due soon / Overdue | High | Pending |
| 001-7 | Usage indicators | Avg daily (readings), high-load Top 5 routes, idle vs movement (GPS &lt; 3 km/h), high-stress Top 5 vehicles by completed TO count | High | Pending |
| 001-8 | Planner + supervisor UI | Planner list/detail/filters; supervisor entry; interval config | High | Pending |
| 001-9 | Tests | Reject drop, monotonic write, formulas, unavailable, RBAC | High | Pending |

## Definition of Done

- [ ] AC-1…AC-6 checked against code (not against this markdown)
- [ ] Unit tests for meter entry, monotonic write, remaining-km formulas, Top 5 vehicles by completed TO count, RBAC
- [ ] Vehicle with no reading never gets a fake remaining-km number from GPS
- [ ] GPS ingest / Live GPS regression unchanged (no mileage decode)
- [ ] `05-modules/` implementation context written (001-2) before merge of Django work
- [ ] Demo: Driver Supervisor enters meter km → Planner sees remaining km vs interval

## Dependencies

- **Depends on:** Vehicle master (`apps/master_data.Vehicle`), Driver Supervisor RBAC, completed TOs with `origin_poi` + `destination_poi` for Top 5 routes and per-vehicle TO counts for Top 5 vehicles; GPS speed history **only** for idle vs movement
- **Does not depend on:** GPS mileage, FuelEntry, fleet health dashboard, map KPI layer
- **Does not replace:** DS-01 under-maintenance workflow

