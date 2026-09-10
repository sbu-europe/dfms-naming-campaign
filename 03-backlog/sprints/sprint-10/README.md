---
title: Sprint 10 — Analytics, Reporting & Dashboards
sprint: Sprint 10
phase: Phase 2
dates: "TBD"
status: Planning
carry_from: Sprint 9
total_story_points_estimated: "26 SP (001–004 defined); ~13 SP remaining AD stories unwritten"
---

# Sprint 10 — Analytics, Reporting & Dashboards

> Full sprint backlog with stories, sub-tasks, and status.
> Defined stories: [`001`](001-Odometer-Based%20Vehicle%20Maintenance%20Tracking/README.md), [`002`](002-Vehicle%20Tracking%20and%20Dashboard/README.md), [`003`](003-Vehicle%20Utilization%20Analysis/README.md), [`004-Vehicle Downtime Management/`](004-Vehicle%20Downtime%20Management/README.md)
> (001 meter km. 002 fleet health. 003 trips + serving vs No-TO. 004 downtime log → Under Maintenance + 003 available hours).
> Later AD-04 / AD-05 / AD-06 folders are still planned; they do not have story files yet.
> **Module implementation context** (`05-modules/`) is the next step after a story is accepted —
> do not start Django from these folders alone.

| | |
|---|---|
| **Sprint Dates** | TBD |
| **Carry-over from Sprint 9** | None (new Phase 2 slice) |
| **New Scope** | **001**–**004** defined (odometer, dashboard, utilization, downtime). Later: fuel analytics, operational reports + CSV/Excel, map KPI layer |
| **PRD v3** | OptiLogist-PRD-003, 06 July 2026 — in-repo [`DFMS_Product_Requirements_Document_v3.md`](../../../01-source/01-prd/DFMS_Product_Requirements_Document_v3.md). User stories below are quoted from that document. |
| **Feature List** | SOW Phase-2 rows **104** (001), **99** (002), **100** (003), **101** (004). Other P2 fleet/fuel/reporting rows stay later stories. |
| **Related prior work** | Live GPS (GPS-01…04); deferred Maps Dashboard ([GPS-05](../sprint-6/02-gps-maps-dashboard/GPS-05-maps-dashboard-integration.md)); vehicle operational status; QC checkpoint; gate/scale/load clocks |
| **Module specs** | [`11-reporting/`](../../../05-modules/11-reporting/README.md); [`fuel-management.md`](../../../05-modules/08-fleet-management/fuel-management.md); [`phase-2.md`](../../../05-modules/13-phases/phase-2.md) — implementation context to be written after this sprint backlog |
| **Feedback tracker** | [`feedback-resolution.md`](./feedback-resolution.md) — none yet |

---

## Sprint Goals

1. **001 — Odometer-based maintenance tracking** — Driver Supervisor (Vehicle Supervisor) enters km from the physical meter; distance since last service; remaining km vs configurable 5k / 10k / 20k interval; Due soon / Overdue; usage indicators (average daily km from readings, high-load Top 5 routes, idle vs movement from GPS speed &lt; 3 km/h); high-stress Top 5 vehicles by completed TO count.
2. **002 — Vehicle Tracking and Dashboard** — Transport Planner fleet health: five-status cards (No Active TO / Scheduled / In-transit / Under Maintenance / Inactive), depot filter, km from 001, fuel intake when AD-04 exists, maintenance + current TO/driver links.
3. **003 — Vehicle Utilization Analysis** — Transport Planner: trips per vehicle (completed **Plans** in period: single-TO or Multi-TO); a vehicle may serve multiple TOs at once; active vs idle = serving hours vs No-TO hours (union of TO windows, not GPS).
4. **004 — Vehicle Downtime Management** — Driver Supervisor logs reason + start/end; open downtime → Under Maintenance; assignment and 002 follow status; 003 available hours subtract downtime.
5. **Fuel analytics** (later) — consume FuelEntry (liters + odometer at fill); km/L and cost/km from odometer differences only.
6. **Operational reports** (later) — trip performance, fleet utilization, QC analytics, KPI reporting, Excel/CSV export.
7. **Map KPI layer** (later) — KPI bar, POI presence, TO route view on top of existing Live GPS (pulls GPS-05).

---

## PRD v3 user stories (this sprint)

Quoted from DFMS PRD v3. Sprint 10 **interpretation** (clocks) is in [Clock rules](#clock-rules-sprint-ssot). Remaining km uses **supervisor meter readings** — this fleet’s GPS is not odometer-capable.

| PRD | User story (verbatim) | Story |
|-----|----------------------|-------|
| §6.6.4 Vehicle Tracking & Dashboard | *As a Transport Planner, I want a dashboard showing vehicle availability so that I can plan trips effectively.* | [002](002-Vehicle%20Tracking%20and%20Dashboard/002-Vehicle%20Tracking%20and%20Dashboard.md) |
| §6.6.7 Vehicle Utilization Analytics | *As a Transport Planner, I want to analyze vehicle utilization so that under- or over-utilized assets can be optimized.* | [003](003-Vehicle%20Utilization%20Analysis/003-Vehicle%20Utilization%20Analysis.md) |
| Vehicle Downtime Management | *As a Driver supervisor, I want to track vehicle downtime so that availability and planning accuracy improves.* | [004](004-Vehicle%20Downtime%20Management/004-Vehicle%20Downtime%20Management.md) |
| §6.5.10 GPS-Based Vehicle Maintenance Tracking | *As a Transport Planner, I want to use GPS movement and distance data to plan vehicle maintenance proactively, so that vehicles are serviced on time, breakdown risk is reduced, and fleet availability improves.* | [001](001-Odometer-Based%20Vehicle%20Maintenance%20Tracking/001-Odometer-Based%20Vehicle%20Maintenance%20Tracking.md) |
| §6.8.1 Fuel Consumption Tracking | *As a Driver supervisor, I want to track fuel consumption so that fuel efficiency and cost can be analyzed.* | [AD-04](04-fuel-consumption/AD-04-fuel-consumption-analytics.md) |
| §6.8.2 Fuel Entry System | *As a Driver, I want to record refueling events so that fuel tracking remains accurate.* | [AD-04](04-fuel-consumption/AD-04-fuel-consumption-analytics.md) |
| §7.2.5 Reporting & Dashboard | Trip performance dashboards; fleet utilization reports; QC analytics; operational KPI reporting; export to Excel / CSV *(phase bullet list — no separate “As a…” line)* | [AD-05](05-reporting-dashboards/AD-05-phase2-reporting-and-dashboards.md) |
| §6.13.2 Dashboard Layer | *As a Transport Planner or Transport Distribution Officer, I want a real-time map-based operational view of vehicles, TOs, and POIs as my default landing page, so that I can monitor execution status — KPIs, POI presence, and TO-centric context — from one place without switching screens.* | [AD-06](06-map-kpi-layer/AD-06-map-dashboard-kpi-layer.md) |

**PRD Phase 3 — not this sprint:** §6.8.3 Fuel Performance Monitoring (GPS distance + fuel); §6.6.8 Manual Workshop Entry; driver performance dashboard.

---

## Clock rules (sprint SSOT)

PRD §6.5.10 names GPS odometer, capability-dependent. **Nourish GPS trackers are not odometer-capable.** A Vehicle Supervisor (DFMS **Driver Supervisor**) reads the physical meter and enters km. Vehicles with no reading show **odometer unavailable** — do not invent remaining km from GPS/haversine.

| Clock | Use for | Do not use for |
|---|---|---|
| **Supervisor odometer** (meter reading → `Vehicle.current_odometer_reading`) | Distance since last service, remaining km, average daily distance (001) | A single TO’s map path |
| **Haversine** (GPS lat/lng) | Distance of a specific TO, map trail | Lifetime km, service remaining |
| **TO clock** (Start Trip → terminal) | Active vs idle = TO-serving vs No-TO hours (003) | Dashboard five-status cards (002); GPS idle vs moving (001) |
| **GPS motion** (speed → idle / moving) | Idle vs movement ratio (001): **&lt; 3 km/h** idle, otherwise moving | Remaining km |
| **TO origin → destination** | High-load routes = Top 5 pairs by completed TO count (001) | Truck fill %; remaining km |
| **Completed TO count per vehicle** | High-stress = Top 5 vehicles by TOs served (001) | Remaining km; daily km; route mix |
| **`Vehicle.operational_status`** (TO + DS-01 + 004 + `is_active`) | Fleet health cards (002); picker block | GPS idle vs moving |
| **VehicleDowntime** `[start_at, end_at)` | 004 reason log; 003 available hours (calendar − downtime) | 001 remaining km |

---

## Epic Summary

| # | Epic / Module | Key Stories | Feature List | SP | Status |
|---|---------------|-------------|--------------|----|--------|
| 001 | Fleet & Vehicle Management — Odometer maintenance | [001](001-Odometer-Based%20Vehicle%20Maintenance%20Tracking/001-Odometer-Based%20Vehicle%20Maintenance%20Tracking.md) · [spec](001-Odometer-Based%20Vehicle%20Maintenance%20Tracking/US-odometer-based-vehicle-maintenance-tracking.md) | SOW P2 row 104 | 8 | Planning |
| 002 | Fleet & Vehicle Management — Health Dashboard | [002](002-Vehicle%20Tracking%20and%20Dashboard/002-Vehicle%20Tracking%20and%20Dashboard.md) · [spec](002-Vehicle%20Tracking%20and%20Dashboard/US-vehicle-tracking-and-dashboard.md) | SOW P2 row 99 | 8 | Planning |
| 003 | Fleet & Vehicle Management — Utilization | [003](003-Vehicle%20Utilization%20Analysis/003-Vehicle%20Utilization%20Analysis.md) · [spec](003-Vehicle%20Utilization%20Analysis/US-vehicle-utilization-analysis.md) | SOW P2 row 100 | 5 | Planning |
| 004 | Fleet & Vehicle Management — Downtime | [004](004-Vehicle%20Downtime%20Management/004-Vehicle%20Downtime%20Management.md) · [spec](004-Vehicle%20Downtime%20Management/US-vehicle-downtime-management.md) | SOW P2 row 101 | 5 | Planning |
| 04 | Fuel Management | [AD-04](04-fuel-consumption/AD-04-fuel-consumption-analytics.md) · [spec](04-fuel-consumption/US-fuel-consumption-and-entry.md) | SOW P2 rows 102–103 | 8 | Planning (unwritten) |
| 05 | Reporting & Dashboards | [AD-05](05-reporting-dashboards/AD-05-phase2-reporting-and-dashboards.md) · [spec](05-reporting-dashboards/US-phase2-reporting-and-dashboards.md) | PRD §7.2.5 (not a P2 CSV row) | 8 | Planning (unwritten) |
| 06 | Transport Dashboard — Map KPI Layer | [AD-06](06-map-kpi-layer/AD-06-map-dashboard-kpi-layer.md) · [spec](06-map-kpi-layer/US-map-dashboard-kpi-layer.md) | PRD §6.13.2 / GPS-05 | 5 | Planning (unwritten) |

**001–004 estimated**: 26 SP. Remaining AD stories ~13 SP when written. **Sprint headline until these are accepted: 26 SP.**

---

## Sprint 10 Scope — Sub-task Index

### 002: Vehicle Tracking and Dashboard — §6.6.4

See [`002-Vehicle Tracking and Dashboard/`](002-Vehicle%20Tracking%20and%20Dashboard/README.md). (Was AD-01.)

| Sub-task | Story | Description | Priority |
|----------|-------|-------------|----------|
| 002-1 | 002 | Requirements & story (this folder) | High |
| 002-2 | 002 | Implementation context (`05-modules/`) after PO accept | High |
| 002-3 | 002 | Status cards: No Active TO / Scheduled / In-transit / Under Maintenance / Inactive | High |
| 002-4 | 002 | Filters: depot (`assigned_poi`), own-fleet default | High |
| 002-5 | 002 | Kilometers from `current_odometer_reading` (001 writes) | High |
| 002-6 | 002 | Maintenance history + current TO / trip / driver links | High |
| 002-7 | 002 | Fuel intake card consumes FuelEntry (AD-04) or unavailable | Medium |
| 002-8 | 002 | Planner UI (dashboard + detail) | High |
| 002-9 | 002 | Tests | High |

### 003: Vehicle Utilization Analysis — §6.6.7

See [`003-Vehicle Utilization Analysis/`](003-Vehicle%20Utilization%20Analysis/README.md). (Was AD-02.)

| Sub-task | Story | Description | Priority |
|----------|-------|-------------|----------|
| 003-1 | 003 | Requirements & story (this folder) | High |
| 003-2 | 003 | Implementation context (`05-modules/`) after PO accept | High |
| 003-3 | 003 | Trips per vehicle (completed Plans in period) | High |
| 003-4 | 003 | Serving vs No-TO hours (clip Start Trip → terminal) | High |
| 003-5 | 003 | Planner UI (list / sort / chart / depot) | High |
| 003-6 | 003 | Tests | High |

### 004: Vehicle Downtime Management — SOW row 101

See [`004-Vehicle Downtime Management/`](004-Vehicle%20Downtime%20Management/README.md).

| Sub-task | Story | Description | Priority |
|----------|-------|-------------|----------|
| 004-1 | 004 | Requirements & story (this folder) | High |
| 004-2 | 004 | Implementation context (`05-modules/`) after PO accept | High |
| 004-3 | 004 | Downtime log: reason, start, end; one open per vehicle | High |
| 004-4 | 004 | Open covering now → Under Maintenance; end → No Active TO | High |
| 004-5 | 004 | Assignment + 002 follow status; 003 available hours − downtime | High |
| 004-6 | 004 | Tests | High |

### 001: Odometer-Based Vehicle Maintenance Tracking — §6.5.10

See [`001-Odometer-Based Vehicle Maintenance Tracking/`](001-Odometer-Based%20Vehicle%20Maintenance%20Tracking/README.md).

| Sub-task | Story | Description | Priority |
|----------|-------|-------------|----------|
| 001-1 | 001 | Requirements & story (this folder) | High |
| 001-2 | 001 | Implementation context (`05-modules/`) after PO accept | High |
| 001-3 | 001 | Driver Supervisor meter entry + reading history | High |
| 001-4 | 001 | Monotonic write to `Vehicle.current_odometer_reading` (seed initial on first reading) | High |
| 001-5 | 001 | Tenant interval + per-vehicle override + service log | High |
| 001-6 | 001 | Distance since last service + remaining km + Due soon / Overdue | High |
| 001-7 | 001 | Avg daily (odo), high-load Top 5 routes, idle vs movement (GPS &lt; 3 km/h), high-stress Top 5 vehicles by completed TO count | High |
| 001-8 | 001 | Planner UI (list/detail/filters/service log/interval) | High |
| 001-9 | 001 | Tests | High |

### Epic 04: Fuel Consumption (AD-04) — §6.8.1

| Sub-task | Story | Description | Priority |
|----------|-------|-------------|----------|
| AD-04-1 | AD-04 | FuelEntry model: liters, cost, odometer, receipt + odo photos | High |
| AD-04-2 | AD-04 | Fuel fill odometer must stay **≥** supervisor-written `current_odometer_reading` (001 owns meter writes) | High |
| AD-04-3 | AD-04 | km/L and cost/km from odometer differences | High |
| AD-04-4 | AD-04 | Analytics views consume FuelEntry (fleet-ops may own the form) | Medium |

### Epic 05: Reporting & Dashboards (AD-05) — §7.2.5

| Sub-task | Story | Description | Priority |
|----------|-------|-------------|----------|
| AD-05-1 | AD-05 | Trip performance (on-time / delay from planned vs actual) | High |
| AD-05-2 | AD-05 | Fleet utilization report (003 clocks) | High |
| AD-05-3 | AD-05 | QC analytics (checkpoint pass/fail) | High |
| AD-05-4 | AD-05 | Operational KPI reporting | Medium |
| AD-05-5 | AD-05 | Excel / CSV export (replace reporting stub) | High |

### Epic 06: Map Dashboard KPI Layer (AD-06) — §6.13.2 / GPS-05

| Sub-task | Story | Description | Priority |
|----------|-------|-------------|----------|
| AD-06-1 | AD-06 | KPI widget bar on Live GPS / maps landing | High |
| AD-06-2 | AD-06 | POI presence panel | High |
| AD-06-3 | AD-06 | TO-centric route view + planned vs actual ETA | Medium |
| AD-06-4 | AD-06 | Exception flags (idle-beyond-threshold, dwell overrun) | Medium |

---

## Story dependencies

```
Driver Supervisor meter entry ─► 001 remaining km / avg daily km
Live GPS speed (&lt; 3 km/h) ───► 001 idle vs movement
Completed TO origin→dest ─────► 001 Top 5 high-load routes
Completed TO count / vehicle ─► 001 Top 5 high-stress vehicles
Vehicle.operational_status ───► 002 fleet health cards
001 Vehicle.current_odometer ─► 002 kilometers card
AD-04 FuelEntry ──────────────► 002 fuel intake card
TO Start Trip → terminal ─────► 003 serving vs No-TO hours
Completed Plans / vehicle ────► 003 trips per vehicle
004 downtime [start, end] ────► UM status + 003 available hours
003 utilization clocks ───────► AD-05 fleet utilization report
Live GPS (GPS-01…04) ─────────► AD-06 KPI / presence / trail
```

> **Delivery order**: 002 status cards and 003 hours do not need 001. 004 downtime hours feed 003 available-hours. Do not start Django on 001–004 until that story’s `05-modules/` (`*-2`) exists.

---

## Dependencies & Decisions still open

- Fleet health dashboard **own-fleet only** (vehicles table), or vendor trucks too? Vendor trucks have no `Vehicle` row. **002 assumes own-fleet only** until PO says otherwise.
- Who owns the FuelEntry **form** — this sprint or fleet-ops? Schema is required either way ([AD-04](04-fuel-consumption/AD-04-fuel-consumption-analytics.md)). 002 only **reads** FuelEntry.
- What is a **Halted TO** on the map KPI bar? Not a status today ([AD-06](06-map-kpi-layer/AD-06-map-dashboard-kpi-layer.md)).

---

## Out of Scope (unless added at planning)

- GPS / GT06 / SinoTrack / Meitrack mileage ingest (trackers are not odometer-capable)
- Haversine as a stand-in for remaining km when no meter reading exists
- Auto `under_maintenance` when remaining km hits 0 (001 does not set status; 004 / DS-01 do)
- Workshop job cost / duration / parts cost (PRD §6.6.8 — Phase 3)
- New “Vehicle Supervisor” role (use Driver Supervisor)
- Vendor bid analytics, executive cost-per-trip (TripCost not populated)
- Phase 3 fuel performance mixing GPS + trip type + maintenance history
- `/admin/` role queue widgets (DB-01) — operational, not this sprint

**Feature List P2 rows not in this sprint** (later Phase 2 slices):

| CSV # | Module | Feature |
|------|--------|---------|
| 95 | Transport Order Management | TO Dispatch Planning (Calendar View) |
| 96 | Transport Order Management | TR Conjoinment |
| 97 | Transport Order Management | Partial & Re-Delivery (Accident / Incident) |
| 98 | Transport Order Management | Trip Costing / ERP |
| 102 | Fuel | Fuel Consumption Tracking |
| 103 | Fuel | Fuel Entry System |
| 105 | Vendor Management | Vendor Billing & Claims |
| 106 | Transport Order Management | Vendor Trip Cost & Billing |
| 107 | Vendor Management | Vendor Rating System |

---

## Notes

- **001**–**004** each have a companion `US-*.md` spec — same pattern as Sprint 2 MDM/TUM.
- Sub-tasks **001-2** … **004-2** are the `05-modules/` write-ups. Do not start Django work until that exists for the story being built.
- Own-fleet vs vendor trucks, FuelEntry form owner, and Halted TO on the KPI bar remain planning decisions for later stories.

---

**Previous**: [Sprint 9](../sprint-9/README.md)
