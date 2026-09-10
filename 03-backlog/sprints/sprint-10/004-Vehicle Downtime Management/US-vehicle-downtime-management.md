---
title: Vehicle Downtime Management
story_id: "004"
phase: phase-2
module: Fleet & Vehicle Management
priority: High
status: Planning
epic: Fleet & Vehicle Management
sprint: Sprint 10
story_points: 5
created: 2026-09-08
updated: 2026-09-08
source_documents:
  - ../../../../01-source/01-prd/DFMS_Product_Requirements_Document_v3.md
  - ../../../../01-source/03-sow/SOW Phase-2.md
prd_section: "Vehicle Downtime Management (after §6.6.7)"
feature_list: "SOW Phase-2 row 101"
related_stories:
  - DS-01
  - 003-Vehicle Utilization Analysis
  - 002-Vehicle Tracking and Dashboard
  - 001-Odometer-Based Vehicle Maintenance Tracking
tags: [phase-2, sprint-10, fleet, downtime, driver-supervisor]
---

# US — Vehicle Downtime Management

Companion spec for [004-Vehicle Downtime Management.md](./004-Vehicle%20Downtime%20Management.md). Product context only — Django work waits for `05-modules/` after this spec is accepted.

## User Story

**As a** Driver supervisor  
**I want** to track vehicle downtime  
**So that** availability and planning accuracy improves.

## Why a log, not only DS-01 status

DS-01 already flips **Under Maintenance**. Planners still cannot see **why** or **how long**. 003 currently treats all non-serving time as idle. PRD requires a **reason + start/end** so downtime is a first-class interval that **reduces availability metrics**.

| Clock | Use for | Do not use for |
|-------|---------|----------------|
| **VehicleDowntime** `[start_at, end_at)` | Reasoned down window; 003 available hours; UM while covering now | 001 remaining km; GPS idle |
| **`operational_status` Under Maintenance** | 002 card; TDO picker block | Period hour math (use the log) |
| **DS-01 inspection / clearance** | Fail inspection → UM; checklist to return when **no** 004 covering log | 004 end-of-log return to service |
| **001 VehicleServiceLog** | Km snapshot of a service | Setting UM |

## As-built (do not re-implement)

| Path | Fact |
|------|------|
| `mark_vehicle_under_maintenance` | Set UM; Assigned TOs → Under Planning; unassign vehicle/driver |
| `complete_maintenance_clearance` | Checklist pass → No Active TO; blocks if `is_active=false` |
| `available_vehicles_queryset` | Excludes UM and inactive |
| 002 | Reads `operational_status` |
| 003 | Serving vs No-TO; A5 waits on this story to subtract downtime |

## Functional requirements (PRD, interpreted)

- [High] System SHALL log downtime with reason and start & end datetime
- [High] Open covering downtime SHALL set Under Maintenance
- [High] Availability (picker + 002 + 003 available hours) SHALL follow the log

## Business rules

### BR-001 — Record

```
VehicleDowntime {
  vehicle_id
  reason: text, required
  category: optional enum  // breakdown | accident | scheduled_service | tyre | other
  start_at: DateTime, required
  end_at: DateTime, null   // null = still down
  created_by_id
  created_at
}
```

`end_at` must be ≥ `start_at` when set.

### BR-002 — One open log

At most one row per vehicle with `end_at` null. Closed intervals on one vehicle must not overlap (reject).

### BR-003 — Covering now → Under Maintenance

```
covers_now  = start_at ≤ now AND (end_at is null OR end_at > now)
```

On create/update, if `covers_now` and vehicle is not already UM:

- Reject if `operational_status = in_transit`
- Reject if `is_active = false`
- Else `mark_vehicle_under_maintenance` (DS-01 unassign of Assigned TOs)

### BR-004 — End log → available

When supervisor sets `end_at` ≤ now on the last covering log:

- If `is_active = false`: keep Inactive / do not set No Active TO
- Else: `operational_status = no_active_to` (same target as clearance pass; **no** checklist on this path)

If DS-01 left the vehicle UM **without** a 004 covering log, clearance checklist remains required (A5).

### BR-005 — Historical insert

If `end_at` is in the past at create: save the row, **do not** change current status.

### BR-006 — 003 availability metrics

```
downtime_hours   = sum of [start_at, end_at or now] clipped to the 003 period
                   (merge overlaps)
available_hours  = calendar_hours − downtime_hours
idle_hours       = available_hours − serving_hours     // No-TO but not down
utilization_pct  = serving_hours / available_hours     // if available_hours = 0 → 0
```

Do not use GPS. Serving hours unchanged (003). Downtime overlapping a serving window: serving still counts as serving; extra downtime outside serving reduces available hours (A7: in-transit start is rejected, so overlap should be rare).

### BR-007 — RBAC

| Action | Driver Supervisor | Tenant Admin | Transport Planner |
|--------|-------------------|--------------|-------------------|
| Create / close downtime | Yes | Yes | No |
| View logs | Yes | Yes | Yes |

## UI

### Driver Supervisor — log downtime

```
Log downtime
  Vehicle:   [ DHAKA METRO-GA-11-1234 ▼ ]   Last status: No Active TO
  Reason:    [ ________________________________ ]  *
  Category:  [ Breakdown ▼ ]
  Start:     [ 2026-09-08 09:00 ]
  End:       [ ________ ]   (blank = still down)
  [Save]
```

Reject in-transit / second open log / end < start inline.

List: open logs first; then history. Action **End downtime** sets `end_at` to now (editable).

### Planner

Read-only downtime list on vehicle detail (002) and hours already folded into 003.

## API (sketch — lock in 004-2)

```
POST /api/v1/fleet/vehicles/{vehicle_id}/downtime
PATCH /api/v1/fleet/downtime/{id}          // set end_at
GET  /api/v1/fleet/vehicles/{vehicle_id}/downtime
```

Create body (illustrative):

```json
{
  "reason": "Clutch replacement",
  "category": "scheduled_service",
  "start_at": "2026-09-08T09:00:00Z",
  "end_at": null
}
```

Matches the architecture sketch `POST /api/v1/fleet/downtime` (004-2 may keep that collection URL).

## Test scenarios

| ID | Case | Expected |
|----|------|----------|
| T01 | Supervisor logs start now, no end, vehicle No Active TO | UM; Assigned TOs unassigned; picker excludes |
| T02 | Same vehicle second open log | Rejected |
| T03 | end_at before start_at | Rejected |
| T04 | Vehicle In-transit | Rejected; status unchanged |
| T05 | Close open log, is_active true | No Active TO; picker includes |
| T06 | Close open log, is_active false | Stays not assignable; not No Active TO |
| T07 | Past start+end insert | Row saved; current status unchanged |
| T08 | 003 period 10 d (240 h); downtime 24 h; serving 48 h | available=216; idle=168; util=48/216 |
| T09 | Inspection-fail UM, no 004 row | Still needs DS-01 clearance; 003 downtime_hours=0 for that gap |
| T10 | 001 service log | Does not set UM |
| T11 | Transport Planner POST downtime | 403 |
| T12 | 002 after T01 | Under Maintenance count +1 |

## Dependencies

- DS-01 status helpers and assignment exclusion
- 003 list/utilization API (denominator)
- 002 reads status only

**Does not depend on:** GPS, 001 formulas, FuelEntry, Phase 3 workshop.

**Out of scope:** workshop cost, abort in-transit TO, new role, vendor trucks, auto UM from remaining km.

## Open decisions (confirm before 004-2)

1. Ending a 004 log **skips** DS-01 checklist (assumed). If PO wants checklist on every return, A4 flips.
2. Auto-create a 004 row when DS-01 marks UM (reason required on that action)?
3. Tenant **reason catalog** vs free text + optional category.
4. Overlap of downtime with serving hours if data is backfilled — serving wins vs split.
