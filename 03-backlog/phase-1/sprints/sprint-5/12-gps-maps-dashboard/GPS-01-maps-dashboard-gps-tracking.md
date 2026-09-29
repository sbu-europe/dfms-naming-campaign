---
jira_key: DFS-070
jira_type: Story
jira_sprint: "Sprint 5"
story_id: GPS-01
title: Live GPS Monitoring
epic: GPS & Maps Dashboard
status: Delivered (MVP)
last_updated: 2026-08-06
implementation_docs:
  - DFMS-product-context/05-modules/09-tracking/README.md
  - DFMS-product-context/03-backlog/phase-1/sprints/sprint-5/12-gps-maps-dashboard/GPS-01-maps-dashboard-gps-tracking.md
story_points: 8
assignee: ~
prd_refs:
  - "§6.5.4 Integration & Linkage – Map Layer Integration (TO + Live GPS)"
  - "§6.5.5 GPS Tracking & Monitoring"
  - "§6.5.6 Geofencing and POI Tracking"
  - "§6.5.7 POI Geofencing Boundary Management"
  - "§6.5.8 Vehicle Arrival Tracking at POI"
  - "§6.5.9 Dwell Time Tracking"
  - "§6.8.2 Transport Dashboard – Map-Based Dashboard"
  - "§9.1 GPS/VTS Integration"
  - "§9.2 Map & Routing APIs"
phase: Phase 1
integration_contracts:
  - DFMS-product-context/06-contracts/04-integration/gps-vts-integration.yaml
  - DFMS-product-context/06-contracts/04-integration/meeting-notes/2026-03-16-gpswox-integration.md
---

# GPS-01 — Live GPS Monitoring

## User Story

**As a** Transport Planner / Transport Distribution Officer / Tenant Admin  
**I want to** see real-time GPS location of vehicles on a map  
**So that** I can monitor trip progress, respond to delays, and ensure route compliance without phone calls.

*(PRD §6.5.5)*

---

## Business Context

Live GPS is the Phase 1 operator map for fleet visibility. Location comes from a GPS provider ([providers](../../../../05-modules/09-tracking/providers/README.md)). The full Maps Dashboard (KPIs, POI presence panel, default landing for TP/TDO) is a **separate** surface — see [GPS-05](../../sprint-6/02-gps-maps-dashboard/GPS-05-maps-dashboard-integration.md).

### Flow

```
Vehicle has linked GPS device
  → Provider updates position
    → Operator opens Live GPS
      → Sees fleet markers, POI circles, trails, and history
```

### Operator glossary

| Capability | Meaning |
|------------|---------|
| **Live marker** | Near real-time map position for a GPS-linked vehicle; TO/trip context when available |
| **POI geofence circle** | Active POI radius from POI master, drawn on the map |
| **Connection status** | Live / movement / signal-lost (and related speed/movement cues) |
| **Last known position** | Frozen marker when signal is lost — not a newly invented coordinate |
| **Trail** | Recent path for a live vehicle on the map |
| **History** | TO-centric browse of trips plus idle (non-trip) history |
| **Follow** | Map camera tracks a selected vehicle |

---

## Acceptance Criteria

### AC-1 — Live fleet and POI map

- Operators with permission can open the Live GPS page under tenant admin (Tracking).
- GPS-linked vehicles appear as near real-time markers; TO/trip context is shown when available.
- Tracking can show GPS-linked fleet vehicles even when no active trip is attached.
- All active, geocoded POIs render with geofence circles using radius from POI master.
- Each vehicle is uniquely identifiable; Vehicle master GPS Device ID must match the provider identity (e.g. IMEI).

### AC-2 — Status, signal lost, trail, and follow

- Map shows speed / movement / connection status, including **signal-lost**.
- After the agreed idle threshold (~10 minutes), a signal-lost vehicle shows **last known** position with explicit status — the system does not invent a new position.
- Live vehicles can show a trail / path on the map.
- Operators can follow a selected vehicle on the map.
- UI refresh interval is configurable platform-wide (`LIVE_MAP_REFRESH_SECONDS`).

### AC-3 — History (TO-centric and idle)

- Operators can browse vehicle history in a **TO-centric** way (trips / TOs in a time window).
- Operators can browse **idle** history when the vehicle is not on a trip.
- History surfaces include position/speed series and activity / dwell timeline summaries as exposed by the tracking history APIs.

### AC-4 — Read-only GPS surface

- GPS positions are **read-only** for users — no edit or delete of GPS positions on the operator surface.
- Provider / device writes are system-only (device ingest / future cloud poller).
- A vehicle used on a trip cannot be hard-deleted (protect historical linkage).

### Out of scope (this story)

- Full Maps Dashboard as default landing for TP/TDO, KPI widget bar, and `/api/v1/maps/**` dashboard surface ([GPS-05](../../sprint-6/02-gps-maps-dashboard/GPS-05-maps-dashboard-integration.md)).
- Full per-vehicle utilization metrics dashboard (trip activity on Live GPS is enough for this story).
- GPSWOX REST production poller (provider path is separate; Live GPS consumes whatever feed is linked).
- Geofence engine product rules, dwell threshold alerts, and TLS-01 timeline emission (covered by sibling tracking stories / modules).
- Driver mobile background location as a Live GPS input.

---

## API Endpoints

```http
# Fleet snapshot for the Live GPS map
GET /api/v1/tracking/live-map/
# Response includes vehicle markers (lat/lng, speed, movement/connection status,
# last update, optional TO/trip context) and active POIs with geofence radius.

# TOs / trips for a vehicle in a time window (TO-centric history browse)
GET /api/v1/tracking/vehicle-to-history/

# Position / speed series for a trip
GET /api/v1/tracking/vehicle-history/

# Activity cards + dwell timeline summary
GET /api/v1/tracking/vehicle-history-summary/

# History when not on a trip
GET /api/v1/tracking/vehicle-idle-history/
GET /api/v1/tracking/vehicle-idle-summary/
```

> There is no user write endpoint for GPS positions. Location fields are system-calculated / provider-ingested; operators only read Live GPS and history.

Admin entry: Live GPS page under tenant admin (Tracking).

---

## Access & Permissions

| Action | Role |
|--------|------|
| View Live GPS map | Transport Planner, TDO (Vendor Fleet), Tenant Admin, Tenant Super Admin |
| Edit / delete GPS positions | **Nobody** — GPS is read-only for users |

---

## Sub-tasks

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| GPS-01-1 | Live map fleet + POI circles | AC-1: markers, TO context when available, POI geofence circles | High | Done |
| GPS-01-2 | Status, signal lost, trail, follow, refresh | AC-2: connection/movement, last known, trail, follow, `LIVE_MAP_REFRESH_SECONDS` | High | Done |
| GPS-01-3 | TO-centric + idle history | AC-3: history browse APIs and Live GPS history UX | High | Done |
| GPS-01-4 | Read-only RBAC | AC-4: view permission; no user write of GPS positions | Medium | Done |

---

## Definition of Done

- [x] GPS-linked vehicles and active POI geofence circles visible on Live GPS (AC-1)
- [x] Speed / movement / connection status, signal-lost last known, trail, follow, and configurable refresh (AC-2)
- [x] TO-centric and idle history available via tracking history APIs / Live GPS history UX (AC-3)
- [x] GPS surface is read-only for users; only permitted roles can view (AC-4)
- [x] Full Maps Dashboard default landing / utilization dashboard not required for this story (explicit out of scope)

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| Vehicle master (GPS Device ID) | Upstream | Must match provider identity for the vehicle to appear |
| GPS provider feed | Upstream | See [providers](../../../../05-modules/09-tracking/providers/README.md) |
| Trip / TO | Upstream | Trip context on markers and TO-centric history when available |
| POI master (geofence radius) | Upstream | Circles on Live GPS |
| Arrival/departure, dwell, Maps Dashboard | Downstream | Consume Live GPS / history context; full dashboard is GPS-05 |

---

*Epic: GPS & Maps Dashboard | Phase: 1 | Sprint 5: 8 SP | PRD: §6.5.5 (+ related §6.5.4–6.5.9, §6.8.2, §9.1–9.2) | Jira: DFS-070 | Last Updated: 2026-08-06*
