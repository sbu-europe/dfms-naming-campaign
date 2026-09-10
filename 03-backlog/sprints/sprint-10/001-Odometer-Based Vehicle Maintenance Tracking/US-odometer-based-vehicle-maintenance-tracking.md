---
title: Odometer-Based Vehicle Maintenance Tracking
story_id: "001"
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
prd_section: "§6.5.10"
feature_list: "SOW Phase-2 row 104"
related_stories:
  - MDM-05-vehicle-master-data.md
  - DS-01
  - GPS-01
tags: [phase-2, sprint-10, fleet, maintenance, odometer, driver-supervisor]
---

# US — Odometer-Based Vehicle Maintenance Tracking

Companion spec for [001-Odometer-Based Vehicle Maintenance Tracking.md](./001-Odometer-Based%20Vehicle%20Maintenance%20Tracking.md). Product context only — Django work waits for `05-modules/` after this spec is accepted.

## User Story

**As a** Transport Planner  
**I want** to use GPS movement and distance data to plan vehicle maintenance proactively  
**So that** vehicles are serviced on time, breakdown risk is reduced, and fleet availability improves.

## Why supervisor meter reading, not GPS odometer

PRD §6.5.10 and SOW row 104 say distance comes from **GPS odometer data**, depending on IoT capability. **This deployment’s GPS units are not odometer-capable.** Device mileage ingest is therefore out of scope.

Remaining km must match the number on the truck’s meter (what the workshop uses). Haversine over lat/lng under-counts road km and is already used for TO trail length — do not use it for service remaining.

A **Vehicle Supervisor** reads the meter and types the km. In DFMS that is the existing **Driver Supervisor** role (`driver_supervisor` — same fleet-ops actor as DS-01). Do not add a new role for v1.

| Clock | Use for | Do not use for |
|-------|---------|----------------|
| **Supervisor odometer** (meter → `Vehicle.current_odometer_reading`) | Lifetime km, distance since last service, remaining km, average daily distance | A single TO’s map path |
| **GPS speed** (&lt; 3 km/h vs ≥ 3 km/h) | Idle vs movement ratio | Remaining km |
| **TO origin + destination** | High-load routes = Top 5 source→destination by completed TO count | Remaining km; truck fill % |
| **Completed TO count per vehicle** | High-stress usage = Top 5 vehicles by how many completed TOs they served | Remaining km; daily km; route mix |
| **Haversine / GPS mileage field** | Unchanged: TO trail / map. Mileage bytes in GT06 packets are **ignored** | Service remaining |

## As-built (do not assume anyone already writes odometer)

| Path | Fact |
|------|------|
| `apps/master_data/models.py` `Vehicle` | `initial_odometer_reading`, `current_odometer_reading` exist; admin/API **exclude** them on write |
| Vehicle admin | No odometer inputs; GPS tracker ID + SIM only |
| GPS ingest | Lat/lng/**speed**; not a mileage source. Speed is the idle vs movement clock |
| DS-01 | Driver Supervisor can mark `under_maintenance`; that is availability, not a km log |

## Functional requirements (PRD, interpreted)

- [High] System SHALL calculate cumulative distance travelled since last maintenance **from supervisor meter readings**
- [High] System SHALL allow configuration of distance-based maintenance threshold
- [High] System SHALL associate **entered** odometer km with vehicle maintenance records (not GPS mileage)

## Business rules

### BR-001 — Odometer is supervisor-sourced

Only apply a reading entered by Driver Supervisor or Tenant Admin. Do not write remaining km from GPS location events or haversine.

### BR-002 — Unavailable until first reading

If `current_odometer_reading` is null, remaining km, since-service, and average daily distance are **unavailable**. Do not fill them from GPS. High-load and idle/movement may still compute.

### BR-003 — Monotonic write (reject drops)

```
IF current is null OR new_odo >= current_odometer_reading:
    SET current_odometer_reading = new_odo
    IF initial_odometer_reading is null:
        SET initial_odometer_reading = new_odo
    APPEND VehicleOdometerReading
ELSE:
    reject with field error (reading must be ≥ last recorded km)
```

### BR-004 — Interval

```
interval_km = vehicle.maintenance_interval_km
              ?? tenant.default_maintenance_interval_km
```

Tenant default must be a positive integer. UI presets: 5000, 10000, 20000.

### BR-005 — Last service baseline

```
last_odo = latest VehicleServiceLog.odometer_km for that vehicle
           ?? vehicle.initial_odometer_reading
```

If both missing → remaining km unknown (even if current odometer exists).

### BR-006 — Formulas

```
distance_since_service_km = current_odometer − last_odo
remaining_km              = last_odo + interval_km − current_odometer
```

Negative remaining = overdue. Do not clamp to zero on the API (show the overshoot).

### BR-007 — Average daily distance (period)

Need at least two `VehicleOdometerReading` rows whose `read_at` falls in `[period_start, period_end]` (or the latest reading at or before period start plus latest in period).

```
avg_daily_km = (odo_last_in_period − odo_first_in_period) / max(calendar_days_in_period, 1)
```

If fewer than two usable readings → unavailable.

### BR-008 — High-load routes = Top 5 source→destination (period)

There is **no** payload fill factor (allocated weight / capacity). “High load” means **busiest lanes**: how often a source POI → destination POI pair appears on **completed** own-fleet TOs in the selected period.

A **route** is `(TransportOrder.origin_poi_id, TransportOrder.destination_poi_id)`. Ties for 5th: include all pairs with that same count (can be more than five rows).

```
fleet_route_count[origin, dest] = count of completed TOs in period on that pair
top_5_routes = five pairs with the highest fleet_route_count
```

**Planner (client question — which *routes* are busiest):** show those Top 5 with TO count (and optionally % of all completed TOs in the period). This is **not** High-stress (that is Top 5 *vehicles*, BR-010b).

**Per vehicle (PRD frequency):**

```
vehicle_on_top5_count = this vehicle’s completed TOs in period whose (origin, dest) is in top_5_routes
high_load_frequency   = vehicle_on_top5_count / this vehicle’s completed TOs in period
```

If the vehicle has 0 completed TOs in the period → frequency unavailable.

### BR-009 — Idle vs movement (period)

Use GPS **speed**, same cut as Live GPS (`apps/tracking/constants.py` `MOVING_SPEED_KMH = 3.0`):

| GPS `speed_kmh` | Bucket |
|-----------------|--------|
| **&lt; 3** | Idle / stopped |
| **≥ 3** | Moving |

Accumulate time between successive location points in the period (Redis history and/or gated `gps_tracking`). Missing speed treats as 0 → idle.

```
movement_seconds = sum(durations where speed ≥ 3 km/h)
idle_seconds     = sum(durations where speed < 3 km/h)
ratio            = movement_seconds : idle_seconds
movement_share   = movement_seconds / (movement_seconds + idle_seconds)
```

**Not** TO serving vs No Active TO — that clock is later AD-02. The 30-minute Live GPS “parked” chip is display-only; this ratio does not split idle vs parked.

### BR-010 — Remaining-km flags

| Flag | When |
|------|------|
| Due soon | `0 < remaining_km ≤ 0.10 * interval_km` |
| Overdue | `remaining_km ≤ 0` |

These flags are **maintenance remaining-km only**. They are not High-stress.

### BR-010b — High-stress usage = Top 5 vehicles by completed TOs (period)

PRD “Identify high-stress vehicle usage patterns” = which **vehicles served the most TOs**. Not remaining km, interval, daily km, Top 5 routes, or GPS movement.

Count **completed** own-fleet TOs in the selected period, grouped by the vehicle that served them. Rank descending. Show the **Top 5**. Ties for 5th: include every vehicle with that same count.

```
vehicle_completed_to_count[vehicle] = count of completed TOs in period served by that vehicle
top_5_vehicles = five vehicles with the highest vehicle_completed_to_count
```

Planner panel: registration, completed TO count, optionally % of all completed TOs in the period. Vehicles with 0 completed TOs are omitted.

### BR-011 — Service log does not change operational status

Inserting `VehicleServiceLog` must not call `mark_vehicle_under_maintenance` or clear it. Status stays DS-01 / TO lifecycle.

A service log **may** also create an odometer reading at that km (same monotonic rule) so current km stays in sync.

### BR-012 — Own fleet

Scope = `Vehicle` rows for the tenant (`is_active` true by default on the list; include inactive via filter). No vendor-only trucks.

### BR-013 — Who types km

| Action | Driver Supervisor | Transport Planner | Tenant Admin |
|--------|-------------------|-------------------|--------------|
| Enter meter reading | Yes | No | Yes |
| Log completed service | Yes | No | Yes |
| View remaining km / flags | Yes (own entry context) | Yes | Yes |
| Configure interval | No | No | Yes |

---

## Data model

### Tenant maintenance policy (new)

One row per tenant (or fields on existing tenant settings — pick one in 001-2, do not duplicate).

```
TenantMaintenancePolicy {
  tenant_id: UUID  PK/FK
  default_maintenance_interval_km: Integer   // required, > 0; UI presets 5000/10000/20000
  due_soon_fraction: Decimal                 // default 0.10
  high_load_top_n: Integer                   // default 5 (routes)
  high_stress_vehicle_top_n: Integer         // default 5 (vehicles by completed TO count)
}
```

### Vehicle extensions

Existing:

```
initial_odometer_reading: Decimal(10,2) null
current_odometer_reading: Decimal(10,2) null
```

Add:

```
maintenance_interval_km: Integer null   // override; null = tenant default
odometer_updated_at: DateTime null
odometer_updated_by_id: UUID null
```

`total_distance_travelled` MAY be set to `current − initial` when both exist; not a second clock.

Do **not** add `odometer_km` to GPS Redis JSON or `gps_tracking` in this story.

### VehicleOdometerReading (new)

```
VehicleOdometerReading {
  id: UUID
  tenant_id: UUID
  vehicle_id: UUID
  odometer_km: Decimal(12,2)     // required, ≥ 0
  read_at: DateTime              // when the meter was read (not only when saved)
  notes: text null
  created_by_id: UUID            // Driver Supervisor / Tenant Admin
  created_at: DateTime
}
```

### VehicleServiceLog (new)

```
VehicleServiceLog {
  id: UUID
  tenant_id: UUID
  vehicle_id: UUID
  serviced_at: Date                 // workshop completion date
  odometer_km: Decimal(12,2)        // required
  notes: text null
  created_by_id: UUID
  created_at: DateTime
}
```

Latest row by `serviced_at` then `created_at` is **last service**. No hard delete; add a later story if corrections need a void flow.

---

## UI

### Driver Supervisor — record odometer

Own-fleet vehicle picker (or from vehicle detail):

```
Record odometer
  Vehicle:     [ DHAKA METRO-GA-11-1234 ▼ ]
  Last recorded: 44,800 km on 2026-09-01 (if any)
  Meter km:    [ 45250 ]          *
  Read at:     [ 2026-09-08 15:00 ]
  Notes:       [ ________________ ]
  [Save]
```

Reject with inline error if km < last recorded.

### Transport Planner — list

```
+------------------------------------------------------------------------------+
| Vehicle maintenance                    Period: [Last 30 days ▼]              |
| Filter: [All ▼ Overdue / Due soon / Odometer unavailable]                    |
+------------------------------------------------------------------------------+
| Reg.     | Odo km  | Interval | Since svc | Remaining | Daily | Top-5 routes | Idle:Move | Flags |
|----------|---------|----------|-----------|-----------|-------|--------------|-----------|-------|
| DHA-...  | 45250   | 10000    | 9100      | 900       | 180   | 4/10 (40%)   | 1 : 2     | Due soon |
| CHT-...  | —       | 10000    | —         | Unavailable | —  | 1/10 (10%)   | 1 : 4     | No reading |
+------------------------------------------------------------------------------+
```

Idle:Move is `movement_seconds : idle_seconds` (display as hours: `12h moving / 36h idle`). Idle = GPS speed &lt; 3 km/h. **Top-5 routes** = this vehicle’s completed TOs that used the period’s Top 5 origin→destination pairs.

Above or beside the vehicle list:

- **Top 5 routes** (period): origin POI → destination POI, completed TO count. High-**load**.
- **Top 5 vehicles** (period): registration, completed TO count (and optionally % of period completed TOs). High-**stress**. Rank is TO count only.

### Planner / supervisor — detail

- Current odometer, last reading time, entered by
- Interval (vehicle override vs tenant default)
- Last service date + odometer
- Remaining km + progress bar (`distance_since_service / interval`)
- Reading history
- Indicators for selected period
- **Log service** (Driver Supervisor / Tenant Admin): date, odometer, notes
- Status is still changed by DS-01 — no `under_maintenance` toggle here

### Tenant Admin — policy

- Default interval (preset buttons 5000 / 10000 / 20000 + custom)
- Optional: due-soon % — can stay at defaults in v1. Top-N routes and Top-N vehicles stay **5**. No daily-km / movement-share high-stress knobs.

### Per-vehicle interval

On vehicle change form (Tenant Admin): optional `maintenance_interval_km`. Empty = tenant default.

---

## API (sketch — lock in 001-2)

```
POST /api/v1/fleet/vehicles/{vehicle_id}/odometer-readings
GET  /api/v1/fleet/vehicles/{vehicle_id}/odometer-readings
GET  /api/v1/fleet/maintenance?period_days=&flag=&search=&page=
GET  /api/v1/fleet/maintenance/top-routes?period_days=
GET  /api/v1/fleet/maintenance/top-vehicles?period_days=
GET  /api/v1/fleet/maintenance/{vehicle_id}?period_days=
POST /api/v1/fleet/maintenance/{vehicle_id}/service-logs
GET  /api/v1/fleet/maintenance/{vehicle_id}/service-logs
GET  /api/v1/settings/maintenance-policy
PUT  /api/v1/settings/maintenance-policy
```

List item payload (illustrative):

```json
{
  "vehicle_id": "...",
  "registration_number": "DHAKA METRO-GA-11-1234",
  "odometer_available": true,
  "current_odometer_km": 45250.0,
  "odometer_updated_at": "2026-09-08T09:00:00Z",
  "interval_km": 10000,
  "last_service_odometer_km": 36150.0,
  "last_serviced_at": "2026-06-01",
  "distance_since_service_km": 9100.0,
  "remaining_km": 900.0,
  "average_daily_km": 180.4,
  "high_load_frequency": 0.4,
  "high_load_count": 4,
  "completed_to_count": 10,
  "top_routes": [
    {"origin_poi_id": "...", "origin_name": "Feed Mill A", "destination_poi_id": "...", "destination_name": "Depot B", "completed_to_count": 42}
  ],
  "movement_share": 0.33,
  "idle_seconds": 129600,
  "movement_seconds": 43200,
  "flags": ["due_soon"]
}
```

When `odometer_available` is false, odometer fields are `null` (not `0`).

**Auth:** Odometer POST — Driver Supervisor, Tenant Admin. Maintenance GET — those plus Transport Planner. Policy PUT — Tenant Admin. Service log POST — Driver Supervisor, Tenant Admin.

---

## Test scenarios

| ID | Case | Expected |
|----|------|----------|
| T01 | Supervisor enters 45250 on empty vehicle | current + initial = 45250; history row created |
| T02 | Second reading 45100 | Validation error; current stays 45250 |
| T03 | Second reading 45300 | current = 45300; history has two rows |
| T04 | Last service 36150, interval 10000, current 45250 | since=9100, remaining=900, Due soon |
| T05 | Same with current 46200 | remaining=−50, Overdue |
| T06 | No last service, no initial, current 1000 (should not happen after T01 seed) | remaining unknown if initial still null |
| T07 | Never entered | List shows unavailable; remaining not computed from GPS |
| T08 | Two readings 100 km apart over 5 days | avg daily = 20 |
| T09 | Period has 5 busiest origin→dest pairs; vehicle ran 4 of 10 TOs on those pairs | top_routes length 5; high_load_count=4; frequency=0.4 |
| T10 | GPS points: 12h at ≥ 3 km/h, 36h at &lt; 3 km/h | movement share = 0.25; ratio 1:3 |
| T11 | Six own-fleet vehicles completed 12, 10, 8, 7, 6, 3 TOs in the period | Top 5 vehicles panel lists the first five (12…6); the vehicle with 3 is omitted |
| T12 | Supervisor logs service at 45250 | New last_odo; remaining ≈ interval; Due soon / Overdue clear |
| T13 | Service log does not change `operational_status` | Still whatever TO/DS-01 set |
| T14 | Vendor-only truck (no Vehicle) | Not on this list |
| T15 | Tenant default 5000, vehicle override 20000 | Remaining uses 20000 |
| T16 | Transport Planner POSTs odometer | 403 / action hidden |

---

## Dependencies

- Vehicle master
- Driver Supervisor RBAC (DS-01 role)
- GPS location history with `speed_kmh` (idle vs movement)
- Completed TOs with `origin_poi` + `destination_poi` (Top 5 routes) and vehicle assignment (Top 5 vehicles)

**Does not depend on:** GPS mileage decode, Redis `odometer_km`.

**Blocks:** nothing in Sprint 10 until 001-2 (`05-modules/`) exists.

**Out of scope:** GPS device mileage, truck fill-factor (weight/capacity) as high-load, workshop jobs, fuel, auto maintenance status, haversine remaining-km, meter photos, new Vehicle Supervisor role, TO serving vs No-TO as idle vs movement (that is AD-02).

---

## Open decisions (confirm before 001-2)

1. Must a reading be required at **dispatch** (DS-01), or stay ad hoc only?
2. High-stress count = **completed** TOs only (assumed). If PO wants assigned / in-progress TOs as well, change A12.
3. Allow a controlled **override** when the meter wraps / is replaced (otherwise A11 always rejects drops).
4. Whether Tenant Admin UI for due-soon % ships in v1 or stays default-only in DB.
