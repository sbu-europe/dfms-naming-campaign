---
module: 09-tracking
specification: POI Geofencing Boundary Management
prd_refs: ["§6.5.7 POI Geofencing Boundary Management"]
related_stories: [GPS-02]
status: Delivered (core)
last_updated: 2026-08-06
---

# POI Geofencing Boundary Management

## User Story

**As a** Tenant Admin  
**I want to** define a geofence radius (metres) for each Point of Interest  
**So that** vehicle arrival and departure can be detected automatically when entering or leaving a facility.

## Business Context

Depots, feed mills, ports, and warehouses need different boundary sizes. A single fixed radius cannot serve a tight port berth and a large mill compound. Geofence configuration sits on **POI master data**; the tracking engine and Live GPS read the current radius.

Without a radius:

- Arrival / departure events have no boundary to evaluate  
- Live GPS cannot draw meaningful geofence circles  
- Geofence dwell cannot be calculated  

**Flow:**

```
Tenant Admin opens POI → sets Geofence Radius (m)
  → Live GPS draws the circle immediately
  → Arrival/departure engine uses current radius on each GPS update
```

## Geofence definition (product)

| Attribute | Rule |
|-----------|------|
| Shape | Circle only (Phase 1) |
| Center | POI latitude / longitude |
| Radius | Metres on POI master (one active geofence per POI) |
| Effect of change | **Immediate** for live trips and map display — no “wait until next trip” |
| Who can change | Tenant Admin / users authorised to edit POI master |

PRD also cites a configurable range (e.g. 50–1000 m). Product intent: radius is mandatory for geofenced operations; enforce sensible min/max as validation matures.

## What is delivered vs gap

| Capability | Status | Notes |
|------------|--------|-------|
| Radius field on POI master | **Done** | Edited on POI admin form |
| Map shows geofence circles | **Done** | Live GPS |
| Changes apply immediately | **Done** | |
| One geofence per POI | **Done** | |
| Dedicated geofence-only API + delete UX | **Not done** | Configured via POI edit today |
| Geofence-specific audit log | **Partial** | General POI/audit; not a dedicated geofence audit surface |
| Per-POI dwell threshold on master | **Not done** | Exceptions use planned dwell on TO — see [dwell-time-tracking.md](dwell-time-tracking.md) |

## Access & Permissions

| Action | Role |
|--------|------|
| View POI including radius | Roles that can view POI master |
| Edit geofence radius | Roles with POI write (Tenant Admin / authorised config) |

## Business rules

- Only **Active** POIs with coordinates participate in map and operational geofencing.
- Changing coordinates or radius updates the boundary used by GPS monitoring.
- Historical arrival/departure events are **not deleted** when a radius changes.
- POI geofence data is also used conceptually by trip monitoring and gate workflows (yard “gate dwell” is separate from geofence dwell).

## Dependencies

- **Requires:** POI master ([poi-management.md](../02-master-data/poi-management.md))  
- **Enables:** [vehicle-arrival-departure.md](vehicle-arrival-departure.md), [dwell-time-tracking.md](dwell-time-tracking.md), Live GPS circles  

## Related

- [Live GPS](live-gps-monitoring.md) · [Module hub](README.md)  
- Story: GPS-02  
