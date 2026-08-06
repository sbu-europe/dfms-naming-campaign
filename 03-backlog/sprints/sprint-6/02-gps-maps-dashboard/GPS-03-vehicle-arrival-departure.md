---
jira_key: DFS-079
jira_type: Story
jira_sprint: "Sprint 6"
story_id: GPS-03
title: Vehicle Arrival & Departure at POI
epic: GPS & Maps Dashboard
status: Delivered (core)
story_points: 3
assignee: ~
prd_refs:
  - "§6.5.6 Geofencing and POI Tracking"
  - "§6.5.8 Vehicle Arrival Tracking at POI"
phase: Phase 1
---

# GPS-03 — Vehicle Arrival & Departure at POI

## User Story

**As a** Transport Planner / Transport Distribution Officer  
**I want** the system to detect when a vehicle enters or leaves a facility geofence  
**So that** arrival and departure are logged without relying on phone calls or manual gate entry alone.

## Business Context

Paper or manual gate logs do not systematically link physical presence to the Transport Order. Automated **Arrival** (entry) and **Departure** (exit) events close that gap for monitoring and dwell.

**Flow:**

```
Vehicle on active trip receives GPS updates
  → Position compared to TO origin / destination geofence
    → Enter → Arrival logged (linked to vehicle, trip, TO, POI)
    → Leave → Departure logged (+ geofence dwell)
```

## Critical product rule — which POIs fire events

| Surface | Which POIs |
|---------|------------|
| **Live GPS map display** | All active, geocoded POIs (circles visible) |
| **Arrival / Departure event engine** | Only the trip’s Transport Order **origin** and **destination** |

PRD language about “all active POIs” is met for **boundary definition and map display**. Operational event logging is scoped to the trip’s source and destination so planners see meaningful “arrived at source / destination” — not noise from every nearby facility.

Off-trip / idle vehicles: location history may exist; **Phase 1 does not** raise TO-linked geofence events for idle vehicles.

## What is logged

| Event | When | Linked to |
|-------|------|-----------|
| **Arrival** (entry) | Outside → inside geofence | Vehicle, Trip, TO, POI, timestamp, position |
| **Departure** (exit) | Inside → outside geofence | Same + **geofence dwell** (exit − entry) |

Detection depends on the GPS provider feed and network quality.

### Trip status (as built)

On entry while the trip is en-route:

| POI role | Trip status update |
|----------|--------------------|
| TO origin | Arrived at source |
| TO destination | Arrived at destination |

### Not yet delivered

| Capability | Status |
|------------|--------|
| Emit full TLS-01 timeline rows from geofence events | **Deferred** |
| List of all vehicles currently inside a POI (presence panel) | **Deferred** (Maps Dashboard / GPS-05) |
| Off-trip geofence events for audit | **Not in Phase 1** |

## Access & Permissions

| Action | Role |
|--------|------|
| View geofence events / related history | Roles with Live GPS / TO visibility as applicable |
| Manually invent arrival/departure GPS events | **Nobody** — system-generated from GPS |

Geofence event admin views are read-only.

## Business rules

- Events are linked to **TO ID** (and trip / vehicle / POI).
- Radius comes from POI master — see [GPS-02](GPS-02-poi-geofence-boundary-management.md).
- Arrival supports gate-in / operational readiness **without requiring** GPS to replace gate process; gate timestamps remain a separate “Real Time (Gate)” source for dwell comparison.

## API (product-facing, short)

```
GET /api/v1/tracking/geofence-events/   # entry/exit history
GET /api/v1/tracking/geofence-check/    # point-in-circle check (support/debug)
```

Live map payload also indicates whether a vehicle is currently inside POI(s).

## Dependencies

- **Requires:** GPS feed (GPS-01), POI radius (GPS-02), active Trip/TO with origin & destination  
- **Enables:** [GPS-04 dwell](GPS-04-dwell-time-tracking.md), map “inside geofence” cues, future Maps Dashboard presence  

## Related

- [GPS-02 geofence radius](GPS-02-poi-geofence-boundary-management.md) · [GPS-04 dwell](GPS-04-dwell-time-tracking.md) · [Module hub](../../../../05-modules/09-tracking/README.md)  
- Story: GPS-03  
