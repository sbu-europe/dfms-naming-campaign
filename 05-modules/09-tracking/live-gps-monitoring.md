---
module: 09-tracking
specification: Live GPS Monitoring
prd_refs: ["§6.5.5 GPS Tracking & Monitoring"]
related_stories: [GPS-01, GPS-05, DFS-070]
status: Delivered (MVP)
last_updated: 2026-08-06
---

# Live GPS Monitoring

## User Story

**As a** Transport Planner / Transport Distribution Officer / Tenant Admin  
**I want to** see real-time GPS location of vehicles on a map  
**So that** I can monitor trip progress, respond to delays, and ensure route compliance without phone calls.

## Business Context

Live GPS is the Phase 1 operator map for fleet visibility. Location comes from a GPS provider ([providers/README.md](providers/README.md)). Full Maps Dashboard (KPIs, POI presence panel, default landing for TP/TDO) is a separate surface — see [maps-dashboard.md](maps-dashboard.md).

**Flow:**

```
Vehicle has linked GPS device
  → Provider updates position
    → Operator opens Live GPS
      → Sees fleet markers, POI circles, trails, and history
```

## What operators see (as built)

| Capability | Status | Notes |
|------------|--------|-------|
| GPS-linked vehicles on the map | **Done** | Near real-time markers for vehicles with GPS data; TO/trip context shown when available |
| All active POIs with geofence circles | **Done** | Radius from POI master |
| Speed / movement / connection status | **Done** | Includes signal-lost |
| Last known position when signal lost | **Done** | After agreed idle threshold (~10 min) |
| Trail / path for live vehicles | **Done** | |
| History (TO-centric browse + idle history) | **Done** | |
| Follow a vehicle on the map | **Done** | |
| Configurable UI refresh interval | **Done** | Platform-wide via `LIVE_MAP_REFRESH_SECONDS` in env / settings |
| Utilization metrics dashboard per vehicle | **Partial** | Trip activity exists; no full utilization dashboard |
| Full Maps Dashboard as default landing | **Deferred** | See [maps-dashboard.md](maps-dashboard.md) |

## Access & Permissions

| Action | Role |
|--------|------|
| View Live GPS map | Transport Planner, TDO (Vendor Fleet), Tenant Admin, Tenant Super Admin |
| Edit / delete GPS positions | **Nobody** — GPS is read-only for users |

Provider/device writes are system-only (device ingest / future cloud poller).

## Business rules

- Each vehicle is uniquely identifiable; GPS Device ID on Vehicle master must match the provider identity (e.g. IMEI).
- GPS data is **read-only** on the operator surface.
- Tracking continues 24/7; Live GPS can show GPS-linked fleet vehicles even when no active trip is attached, while TO/trip context appears when available.
- If signal is lost, show **last known** location with explicit status — do not invent a new position.
- A vehicle used on a trip **cannot be hard-deleted** (protect historical linkage).
- Location accuracy depends on the GPS provider and network conditions.

## API (product-facing, short)

```
GET /api/v1/tracking/live-map/                 # fleet snapshot for the map
GET /api/v1/tracking/vehicle-to-history/       # TOs / trips for a vehicle in a time window
GET /api/v1/tracking/vehicle-history/          # position / speed series for a trip
GET /api/v1/tracking/vehicle-history-summary/  # activity cards + dwell timeline
GET /api/v1/tracking/vehicle-idle-history/     # history when not on a trip
GET /api/v1/tracking/vehicle-idle-summary/
```

Admin entry: Live GPS page under tenant admin (Tracking).

## Dependencies

- **Requires:** Vehicle master (GPS Device ID), GPS provider feed, Trip / TO for trip context  
- **Enables:** Arrival/departure visibility on map context, dwell history views, future Maps Dashboard  

## Related

- [Providers](providers/README.md) · [Maps Dashboard](maps-dashboard.md) · [Module hub](README.md)  
- Stories: GPS-01, GPS-05, DFS-070  
