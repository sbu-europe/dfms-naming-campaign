---
title: Vehicle Tracking and Dashboard
story_id: "002"
phase: phase-2
module: Fleet & Vehicle Management
priority: High
status: Planning
epic: Fleet & Vehicle Management
sprint: Sprint 10
story_points: 8
created: 2026-09-08
updated: 2026-09-08
source_documents:
  - ../../../../01-source/01-prd/DFMS_Product_Requirements_Document_v3.md
  - ../../../../01-source/03-sow/SOW Phase-2.md
prd_section: "§6.6.4"
feature_list: "SOW Phase-2 row 99"
related_stories:
  - 001-Odometer-Based Vehicle Maintenance Tracking
  - MDM-05-vehicle-master-data.md
  - DS-01
tags: [phase-2, sprint-10, fleet, dashboard, transport-planner]
---

# US — Vehicle Tracking and Dashboard

Companion spec for [002-Vehicle Tracking and Dashboard.md](./002-Vehicle%20Tracking%20and%20Dashboard.md). Product context only — Django work waits for `05-modules/` after this spec is accepted.

Previously indexed as **AD-01**.

## User Story

**As a** Transport Planner  
**I want** a dashboard showing vehicle availability  
**So that** I can plan trips effectively.

## Why this is a dashboard, not a new status model

PRD §6.6.4 and SOW row 99 ask for a fleet Health Dashboard. The five availability states are **already** on `Vehicle.operational_status` (V3 — `apps/master_data/models.py` `OperationalStatus`). TO lifecycle, DS-01, and master-data `is_active` already write them (`apps/master_data/vehicle_operational_status.py`).

This story **surfaces** that data for trip planning. It does **not**:

- Add statuses
- Re-label SOW Phase-2 “Active – On the Way / Idle / Scheduled/Parked”
- Replace TDO assignment APIs (`GET /api/v1/fleet/availability`, `GET /api/v1/vehicles/available`) — those answer “who can I assign **now**”
- Replace Live GPS (where the truck is on a map)

| Clock | Use for | Do not use for |
|-------|---------|----------------|
| **`Vehicle.operational_status`** (TO + DS-01 + `is_active`) | Dashboard cards and list (002) | GPS idle vs moving (001); utilization hours (AD-02) |
| **Supervisor odometer** (`current_odometer_reading`) | Kilometers card (002 reads; 001 writes) | TO map path |
| **FuelEntry** (AD-04) | Fuel intake card | Remaining km |
| **001 VehicleServiceLog + DS-01 inspections** | Maintenance history | Auto status flip |
| **`TransportOrder.vehicle` / driver / Trip** | Current assignment on detail | Vendor truck dashboard |
| **GPS speed / map** | Unchanged Live GPS | This dashboard’s status cards |

## As-built (do not re-implement)

| Path | Fact |
|------|------|
| `OperationalStatus` | `no_active_to`, `scheduled`, `in_transit`, `under_maintenance`, `inactive` |
| Evaluation priority | Inactive (`is_active=false`) → Under Maintenance → In-transit → Scheduled → No Active TO. SSOT: `05-modules/02-master-data/vehicle-master-data.md` §3 |
| In-transit | Start Trip through TO terminal — driving, at source/destination, yard — not GPS ≥ 3 km/h |
| Scheduled | Vehicle on a **non-terminal** TO, trip **not** started |
| Under Maintenance | DS-01 only; `is_active` stays true; blocks **new** TDO assignment |
| Inactive | `is_active=false`; blocks new assignment; Live GPS hides by default — **this dashboard still lists them** |
| `FleetAvailabilityService` | Assignable-now counts — **not** the five cards |

## Functional requirements (PRD, interpreted)

- [Critical] System SHALL provide a fleet Health Dashboard for Transport Planner
- [Critical] System SHALL show per vehicle: kilometers (001), fuel intake (AD-04 or unavailable), maintenance history, operational lifecycle (current status + current TO/driver/trip)
- [High] Dashboard SHALL display the five V3 statuses (labels below)
- [High] System SHALL link vehicle to existing TO, Trip, Driver, Fuel, and maintenance records (read; no new association table)

Display labels (match Django `OperationalStatus`):

| DB | Dashboard label | Meaning (PRD) |
|----|-----------------|---------------|
| `no_active_to` | No Active TO | Not assigned to any (non-terminal) TO |
| `scheduled` | Scheduled | Assigned; TO not started |
| `in_transit` | In-transit | Serving a started TO (source or destination, including yard) |
| `under_maintenance` | Under Maintenance | Taken for maintenance |
| `inactive` | Inactive | Not serving mode |

PRD writes “In – Transit”; UI uses the existing **In-transit** label.

## Business rules

### BR-001 — Read-only status

002 never calls `set_vehicle_*` / DS-01 mark-maintenance / `is_active` toggles. Wrong counts mean the **writer** is wrong — fix TO/DS-01, not a dashboard override.

### BR-002 — Own fleet

Scope = tenant `Vehicle` rows. Vendor-only trucks (`vendor_vehicle_registration` on the TO, no `Vehicle`) are out of this dashboard.

### BR-003 — Same filter for cards and list

```
filtered = own-fleet vehicles
           AND (assigned_poi = depot filter OR depot = All)
           AND (vehicle_type filter if set)
           AND (registration search if set)

card[status] = count(filtered where operational_status = status)
```

Inactive rows are included (unlike Live GPS default).

### BR-004 — Kilometers

```
IF current_odometer_reading is not null:
    kilometers = current_odometer_reading
ELSE:
    kilometers = unavailable
```

Do not fill from GPS, Redis, or haversine. Optional: also show `total_distance_travelled` only when it is derived from current − initial (001). Do not treat it as a second clock.

### BR-005 — Fuel intake

```
IF FuelEntry exists for vehicle in selected period:
    fuel_intake_liters = sum(quantity)
    fuel_intake_cost   = sum(cost)   // optional on the card
ELSE IF FuelEntry model not shipped (AD-04):
    fuel_intake = unavailable
ELSE:
    fuel_intake_liters = 0   // model exists, no rows in period — show 0, not unavailable
```

002 does not POST fuel.

### BR-006 — Maintenance history

On vehicle detail, newest first, two sources (do not merge into one fake job type):

1. **001 `VehicleServiceLog`** — date, odometer km, notes (service completed)
2. **DS-01 inspection / clearance** — skip / fail → Under Maintenance / pass → No Active TO (availability)

Phase 3 workshop cost/parts stay out.

### BR-007 — Operational lifecycle on detail

Show **now**:

- `operational_status`
- Current non-terminal TO if any (`to_number`, TO status)
- Driver on that TO (or `Vehicle.assigned_driver` if no current TO)
- Trip row if one exists for that TO

History of every past TO is a **link list** (last N), not AD-02 hour charts.

### BR-008 — Assignment unchanged

Vehicles with `under_maintenance` or `inactive` remain excluded from new TDO assignment. Dashboard visibility does not make them assignable.

### BR-009 — Who sees it

| Action | Transport Planner | Tenant Admin | Driver Supervisor | TDO |
|--------|-------------------|--------------|-------------------|-----|
| View dashboard | Yes | Yes | Yes (view) | Optional view — not required in v1 |
| Change status | No | No (except existing master-data `is_active`) | DS-01 queue only | Via TO assign / unassign (existing) |
| Enter odometer / fuel | No | 001 / AD-04 surfaces | 001 / AD-04 | No |

## Data model

**No new status field.** Consume:

```
Vehicle {
  operational_status
  is_active
  assigned_poi_id
  assigned_driver_id
  current_odometer_reading     // 001
  initial_odometer_reading     // 001
}

TransportOrder.vehicle_id, TransportOrder.driver_id, status
Trip (FK to TO — as-built)
VehicleServiceLog              // 001
DS-01 inspection records       // as-built
FuelEntry                      // AD-04 — optional until that story
```

Tenant settings: none required for v1 (period default last 30 days for fuel totals only).

## UI

### Transport Planner — dashboard

```
+------------------------------------------------------------------------------+
| Fleet health                    Depot: [All ▼]   Type: [All ▼]   [Search]    |
+------------------------------------------------------------------------------+
| [ No Active TO 12 ] [ Scheduled 4 ] [ In-transit 9 ] [ Maint. 2 ] [ Inactive 1 ]
+------------------------------------------------------------------------------+
| Reg.       | Status        | Depot     | Driver      | Odo km     | Fuel (30d) | Current TO |
|------------|---------------|-----------|-------------|------------|------------|------------|
| DHA-...    | In-transit    | Mill A    | Rahman      | 45250      | Unavailable| TO-1024    |
| CHT-...    | No Active TO  | Depot B   | —           | Unavailable| Unavailable| —          |
| KHL-...    | Under Maint.  | Mill A    | —           | 36100      | Unavailable| —          |
+------------------------------------------------------------------------------+
```

Fuel column stays **Unavailable** until AD-04. Odo stays **Unavailable** until 001 has a reading.

### Vehicle detail

- Registration, type, depot, operational status
- Kilometers (current odo + updated at if 001)
- Fuel intake (period) or unavailable
- Current TO / trip / driver (or “none”)
- Maintenance: service logs + DS-01 events
- Links: open TO, trip, 001 remaining-km view (if 001 UI exists), DS-01 queue (if Under Maintenance)

No map. No “mark under maintenance” on this page (DS-01).

## API (sketch — lock in 002-2)

```
GET /api/v1/fleet/health/summary?depot_id=&vehicle_type=&search=
GET /api/v1/fleet/health/vehicles?depot_id=&status=&vehicle_type=&search=&page=
GET /api/v1/fleet/health/vehicles/{vehicle_id}?period_days=
```

Summary payload (illustrative):

```json
{
  "filters": {"depot_id": null, "ownership": "OWN"},
  "counts": {
    "no_active_to": 12,
    "scheduled": 4,
    "in_transit": 9,
    "under_maintenance": 2,
    "inactive": 1
  },
  "total": 28
}
```

List item:

```json
{
  "vehicle_id": "...",
  "registration_number": "DHAKA METRO-GA-11-1234",
  "operational_status": "in_transit",
  "assigned_poi_id": "...",
  "assigned_poi_name": "Feed Mill A",
  "odometer_available": true,
  "current_odometer_km": 45250.0,
  "fuel_available": false,
  "fuel_intake_liters": null,
  "current_to_id": "...",
  "current_to_number": "TO-1024",
  "current_driver_name": "Rahman"
}
```

Do **not** overload `GET /api/v1/fleet/availability` — that API stays assignable-now counts for TDO.

**Auth:** Transport Planner, Tenant Admin; Driver Supervisor read OK.

## Test scenarios

| ID | Case | Expected |
|----|------|----------|
| T01 | 12 no_active_to, 4 scheduled, 9 in_transit, 2 under_maintenance, 1 inactive | Cards match; total 28 |
| T02 | Depot filter Mill A | Cards + list only that `assigned_poi` |
| T03 | Click Under Maintenance card | List only those two vehicles |
| T04 | Vehicle with null odometer | Odo unavailable, not 0 |
| T05 | Vehicle with 001 reading 45250 | List shows 45250 |
| T06 | No FuelEntry model / no rows | Fuel unavailable (no model) or 0 (model, empty period) |
| T07 | Vehicle on started TO | Status In-transit; detail shows that TO + driver |
| T08 | Vehicle assigned, trip not started | Status Scheduled |
| T09 | `is_active=false` | Inactive card; still visible on this dashboard |
| T10 | Under Maintenance vehicle | Visible here; still absent from `GET /vehicles/available` |
| T11 | Vendor TO with only `vendor_vehicle_registration` | Not a dashboard row |
| T12 | Transport Planner opens dashboard | 200; TDO-only user not required |
| T13 | Dashboard does not change status when opened | `operational_status` unchanged |
| T14 | Live GPS still hides Inactive by default | Regression |

## Dependencies

- Vehicle master + operational status (Phase 1 — exists)
- 001 for km + service log numbers
- DS-01 inspection records (exists)
- AD-04 for fuel liters

**Does not depend on:** GPS map, AD-02 hour charts, GPS mileage.

**Blocks:** nothing in Sprint 10 until 002-2 (`05-modules/`) exists. Fuel card can ship as unavailable without AD-04.

**Out of scope:** new statuses, SOW v1 labels, writing status, Live GPS, utilization hours, FuelEntry form, 001 meter entry, Phase 3 workshop, vendor trucks.

## Open decisions (confirm before 002-2)

1. Show a **vendor** availability strip (registration-only, no km/fuel), or keep own-fleet only?
2. Fuel card: ship **unavailable** in 002, or wait to merge 002 UI until AD-04 exists?
3. Fuel period default: last **30 days** vs lifetime liters?
4. Remaining-km / Due soon from 001 on this detail, or only a link to the 001 planner page?
