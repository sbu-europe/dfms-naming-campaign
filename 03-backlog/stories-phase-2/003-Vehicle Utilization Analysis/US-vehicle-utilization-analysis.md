---
title: Vehicle Utilization Analysis
story_id: "003"
phase: phase-2
module: Fleet & Vehicle Management
priority: High
status: Planning
epic: Fleet & Vehicle Management
sprint: ~
story_points: 5
created: 2026-09-08
updated: 2026-09-08
source_documents:
  - ../../../01-source/01-prd/DFMS_Product_Requirements_Document_v3.md
  - ../../../01-source/03-sow/SOW Phase-2.md
prd_section: "§6.6.7"
feature_list: "SOW Phase-2 row 100"
related_stories:
  - 001-Odometer-Based Vehicle Maintenance Tracking
  - 002-Vehicle Tracking and Dashboard
tags: [phase-2, fleet, utilization, transport-planner]
---

# US — Vehicle Utilization Analysis

Companion spec for [003-Vehicle Utilization Analysis.md](./003-Vehicle%20Utilization%20Analysis.md). Product context only — Django work waits for `05-modules/` after this spec is accepted.

Previously indexed as **AD-02**. PRD title is “Vehicle Utilization Analytics”; folder name follows the feature label **Analysis**.

## User Story

**As a** Transport Planner  
**I want** to analyze vehicle utilization  
**So that** under- or over-utilized assets can be optimized.

## Why TO time, not GPS

PRD asks for **trips per vehicle** and **active vs idle time**. “Active” here means the truck is **serving a started Plan** (one TO or several TOs at once), not that the GPS speed is ≥ 3 km/h.

A truck can be In-transit at a mill (GPS idle) and still **serving**. A truck with No Active TO can be driving empty on a public road (GPS moving) and still **idle** for utilization.

| Clock | Use for | Do not use for |
|-------|---------|----------------|
| **Completed TO count** | Trips per vehicle (003) | 001 Top 5 high-stress (same count, different UI) |
| **TO serving window** (Start Trip → terminal) | Active hours (003) | 002 status cards; GPS idle |
| **Calendar − serving** | Idle / No-TO hours (003) | 001 GPS idle vs movement |
| **GPS speed &lt; 3 km/h** | 001 idle vs movement | Utilization active/idle |
| **`operational_status` now** | 002 cards | Period hour totals |

## As-built (do not re-implement)

| Path | Fact |
|------|------|
| `TransportOrder.vehicle` | Own-fleet assignment |
| `execute_trip_start` | `ready_for_dispatch` → `driving_towards_*`; `ExecutionMilestone.actual_timestamp` |
| TO terminal | `completed` / `closed` / `cancelled` → `refresh_vehicle_operational_status` → No Active TO |
| `Trip` | One execution row per TO; `dispatched_at` / `completed_at` when execution sets them |
| Scheduled | Assigned, trip not started — **not serving** |
| Plan (single-TO or Multi-TO) | A vehicle **may** have several non-terminal TOs at once on one Plan. Merge overlapping serving intervals (union of hours — expected, not dirty data) |

## Functional requirements (PRD, interpreted)

- [High] System SHALL calculate trips per vehicle (completed **Plans** in period: single-TO or Multi-TO)
- [High] System SHALL calculate active vs idle time (TO-serving vs No-TO hours)

## Business rules

### BR-001 — Period

Planner selects a period (default last 30 calendar days, tenant timezone). All metrics clip to `[period_start, period_end]`.

```
calendar_hours = hours between period_start and period_end
```

Same window for every vehicle on the list.

### BR-002 — Trips per vehicle

A **Plan** is the unit of work a vehicle executes: **one TO** or **several TOs (Multi-TO)** on the same vehicle. A vehicle **may serve multiple TOs at once**; that is valid Multi-TO, not a data error.

```
trips_per_vehicle = count of distinct Plans where
  vehicle_id = this vehicle
  AND Plan completed (all member TOs completed or closed; cancelled Plan does not count)
  AND plan_completion_at ∈ [period_start, period_end]
```

Until Plan is a persisted record, each completed standalone TO is treated as a **single-TO Plan** (count 1). When several TOs complete as one Multi-TO Plan, count **1** trip.

`plan_completion_at` = first time the Plan reached completed (last member TO’s completed milestone; else `Trip.completed_at` / TO `updated_at`). **Closed** after completed in a later period does **not** count twice.

Cancelled / still in progress / never started → **0** toward this count.

### BR-003 — Serving interval per TO

```
serving_start = actual_timestamp of Start Trip
               (first driving_towards_* milestone, else Trip.dispatched_at)
IF serving_start is missing:
    this TO contributes 0 serving hours (not started)

serving_end = actual_timestamp of first terminal status
              (completed / closed / cancelled)
              else Trip.completed_at
              else now() if TO still non-terminal after start

clipped = intersect([serving_start, serving_end], [period_start, period_end])
```

Merge overlapping clipped intervals on the same vehicle (**union**, not sum). Concurrent TOs on a Multi-TO Plan are expected; do not double-count hours. Sum of merged durations → `serving_hours`.

### BR-004 — Idle (No-TO)

```
downtime_hours   = overlap of 004 [start_at, end_at or now] with the period (0 if no logs)
available_hours  = calendar_hours − downtime_hours
idle_hours       = available_hours − serving_hours
utilization_pct  = serving_hours / available_hours   // 0 if available_hours = 0
```

Scheduled / No Active TO time sits in **idle**. Downtime is **not** idle-available. Do not subtract GPS-stopped time.

Clamp: `serving_hours` cannot exceed `available_hours`. Never negative idle.

### BR-005 — Own fleet

Tenant `Vehicle` rows only. Vendor TOs with only `vendor_vehicle_registration` are out.

### BR-006 — Under / over use

v1: sort by `utilization_pct` or `trips_per_vehicle`. No automatic flag. Planner optimizes by inspection.

### BR-007 — Read-only

003 does not write TOs, trips, milestones, or `operational_status`.

### BR-008 — Who sees it

| Action | Transport Planner | Tenant Admin | Driver Supervisor |
|--------|-------------------|--------------|-------------------|
| View list / chart | Yes | Yes | Yes (view) |
| Change serving clock | No | No | No |

## Data model

**No new utilization table required in v1** (compute on read from TOs + milestones). Optional later: nightly snapshot table if list queries are too heavy — decide in 003-2.

Inputs:

```
Vehicle
TransportOrder.vehicle_id, status
ExecutionMilestone.milestone_type, actual_timestamp
Trip.dispatched_at, completed_at   // fallback
```

## UI

### Transport Planner — utilization

```
+------------------------------------------------------------------------------+
| Vehicle utilization                 Period: [Last 30 days ▼]  Depot: [All ▼] |
| Sort: [Utilization % ▼]  [Trips ▼]                                           |
+------------------------------------------------------------------------------+
| Reg.      | Depot  | Trips | Serving | No-TO   | Util % | Chart              |
|-----------|--------|-------|---------|---------|--------|--------------------|
| DHA-...   | Mill A | 14    | 180 h   | 540 h   | 25%    | [████░░░░ serving] |
| CHT-...   | Depot B| 2     | 24 h    | 696 h   | 3%     | [█░░░░░░░]         |
| KHL-...   | Mill A | 0     | 0 h     | 720 h   | 0%     | [░░░░░░░░]         |
+------------------------------------------------------------------------------+
```

Chart: stacked bar **serving (active)** vs **No-TO (idle)** for that row; optional fleet chart of the same two series.

Detail (optional v1): list the completed TOs in period (to_number, origin → dest, serving hours).

No map. No GPS sparkline.

## API (sketch — lock in 003-2)

```
GET /api/v1/fleet/utilization?period_days=&depot_id=&sort=&page=
GET /api/v1/fleet/utilization/{vehicle_id}?period_days=
```

List item (illustrative):

```json
{
  "vehicle_id": "...",
  "registration_number": "DHAKA METRO-GA-11-1234",
  "assigned_poi_name": "Feed Mill A",
  "trips_completed": 14,
  "serving_hours": 180.0,
  "idle_hours": 540.0,
  "calendar_hours": 720.0,
  "utilization_pct": 0.25
}
```

**Auth:** Transport Planner, Tenant Admin; Driver Supervisor read OK.

## Test scenarios

| ID | Case | Expected |
|----|------|----------|
| T01 | Period 10 days (240 h); one TO start→complete 48 h inside period | serving=48, idle=192, util=0.2, trips=1 |
| T02 | TO started 12 h before period, completed 12 h into period | serving=12 (clipped) |
| T03 | TO started in period, still in transit at period_end | serving through period_end; trips=0 |
| T04 | TO assigned never started (Scheduled the whole period) | serving=0, idle=calendar, trips=0 |
| T05 | Two completed TOs in period, **two** single-TO Plans | trips=2; serving = union of clipped windows |
| T05b | Two overlapping TOs on **one Multi-TO Plan** (e.g. 10:00–14:00 and 12:00–16:00) | trips=**1**; serving = **union** (6 h), not 8 h |
| T06 | Cancelled after start (20 h serving), never completed | trips=0; serving includes 20 h clipped |
| T07 | Completed then closed later in period | trips=1 (not 2) |
| T08 | GPS 90% stopped during a serving TO | serving **unchanged** (GPS unused) |
| T09 | Vendor TO, no Vehicle | not on list |
| T10 | Vehicle with no TOs in period | trips=0, serving=0, idle=calendar |
| T11 | Depot filter | only `assigned_poi` |
| T12 | Transport Planner GET | 200; no writes |

## Dependencies

- TO assignment, trip start, terminal statuses, execution milestones (Phase 1)

**Does not depend on:** 001 odometer, GPS speed, 002 dashboard, FuelEntry. **Consumes 004** downtime hours (0 if none).

**Blocks:** AD-05 fleet utilization report should reuse these clocks (when written).

**Out of scope:** GPS idle, load factor, 004 form (separate story), workshop hours, vendor trucks, Excel (AD-05), utilization % flags.

## Open decisions (confirm before 003-2)

1. ~~Exclude Under Maintenance from calendar~~ — **resolved by 004:** available hours = calendar − downtime logs.
2. Count **closed** without a completed milestone (edge) as a trip?
3. Tenant **under/over** thresholds later, or sort-only forever in v1?
4. Fallback when Start Trip exists but **no milestone** — use `Trip.dispatched_at` only, or 0 serving?
