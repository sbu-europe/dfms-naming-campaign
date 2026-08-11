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

*(PRD §6.5.6 / §6.5.8)*

---

## Business Context

### Why arrival / departure matters

Paper or manual gate logs do not systematically link physical presence to the Transport Order. Automated **Arrival** (entry) and **Departure** (exit) events close that gap for monitoring and for geofence dwell ([GPS-04](GPS-04-dwell-time-tracking.md)).

### How events flow

```
Vehicle on active trip receives GPS updates
  → Position compared to TO origin / destination geofence
    → Enter → Arrival logged (linked to vehicle, trip, TO, POI)
    → Leave → Departure logged (+ geofence dwell on exit)
```

1. GPS feed updates a vehicle that is executing a trip with a Transport Order.
2. Engine evaluates **only** the TO **origin** and **destination** POI circles (radius from [GPS-02](GPS-02-poi-geofence-boundary-management.md)).
3. Outside → inside → **Arrival** (`ENTRY`); inside → outside → **Departure** (`EXIT`) with geofence dwell = exit − entry.
4. On origin/destination **entry** while en-route, trip status advances to arrived-at-source / arrived-at-destination.

### Critical product rule — which POIs fire events

| Surface | Which POIs |
|---------|------------|
| **Live GPS map display** | All active, geocoded POIs (circles visible) |
| **Arrival / Departure event engine** | Only the trip’s Transport Order **origin** and **destination** |

PRD language about “all active POIs” is met for **boundary definition and map display**. Operational event logging is scoped to the trip’s source and destination so planners see meaningful “arrived at source / destination” — not noise from every nearby facility.

Off-trip / idle vehicles: location history may exist; **Phase 1 does not** raise TO-linked geofence events for idle vehicles.

### What is logged

| Event | When | Linked to |
|-------|------|-----------|
| **Arrival** (entry) | Outside → inside geofence | Vehicle, Trip, TO, POI, timestamp, position |
| **Departure** (exit) | Inside → outside geofence | Same + **geofence dwell** (exit − entry) |

Detection depends on the GPS provider feed and network quality. Engine uses Haversine distance vs POI centre + radius + detection buffer, with Redis-backed inside/outside presence for the active trip.

### Trip status (as built)

On entry while the trip is en-route:

| POI role | Trip status update |
|----------|--------------------|
| TO origin | Arrived at source |
| TO destination | Arrived at destination |

---

## Acceptance Criteria

### AC-1 — Detection on TO origin and destination only

- While a vehicle is on an **active trip** with a Transport Order, each GPS update is evaluated against the TO **origin** and **destination** geofence circles only (not every active POI).
- Entry and exit use Haversine distance vs POI centre + current POI radius ([GPS-02](GPS-02-poi-geofence-boundary-management.md)) plus a small detection buffer.
- Presence state (inside/outside) is maintained so transitions are recorded once per visit semantics: one ENTRY per trip+POI; EXIT reflects the stay (dwell computed on exit).
- Idle / off-trip vehicles do **not** produce TO-linked geofence events in Phase 1.

### AC-2 — GeofenceEvent persistence and linkage

- Arrival and departure persist as append-oriented `GeofenceEvent` records (ENTRY / EXIT).
- Each event is linked to **Vehicle**, **Trip**, **Transport Order**, and **POI**, with timestamp (and position as stored by the engine).
- On EXIT, **geofence dwell** is system-calculated as departure − arrival for that trip+POI stay; users do not write or override it.
- Django admin (or equivalent) for geofence events is **read-only** — nobody manually invents arrival/departure GPS events.

### AC-3 — Trip status on geofence entry

- When the vehicle **enters** the TO origin geofence while en-route, trip status updates to **arrived at source**.
- When the vehicle **enters** the TO destination geofence while en-route, trip status updates to **arrived at destination**.
- Gate-in / yard process remains a separate clock; GPS arrival does **not** replace gate timestamps ([GPS-04](GPS-04-dwell-time-tracking.md) Real Time (Gate)).

### AC-4 — History and live “inside” cues (as-built tracking APIs)

- Authorised roles can read entry/exit history via tracking geofence-events API (trip / TO scoped as implemented).
- Live map payload may indicate whether a vehicle is currently inside POI(s) for map cues; this is **not** the Maps Dashboard POI presence panel.

---

## API Endpoints

### As built (Phase 1 — tracking)

```http
# Entry/exit history (trip / filters as implemented)
GET /api/v1/tracking/geofence-events/
# Response includes ENTRY/EXIT rows linked to vehicle, trip, TO, POI, event_at,
# and dwell on EXIT where applicable, e.g.:
{
  "results": [
    {
      "event_type": "ENTRY",
      "poi_id": "...",
      "trip_id": "...",
      "transport_order_id": "...",
      "vehicle_id": "...",
      "event_at": "2026-08-06T05:10:00Z"
    },
    {
      "event_type": "EXIT",
      "poi_id": "...",
      "trip_id": "...",
      "transport_order_id": "...",
      "vehicle_id": "...",
      "event_at": "2026-08-06T06:05:00Z",
      "dwell_minutes": 55
    }
  ]
}

# Point-in-circle check (support / debug)
GET /api/v1/tracking/geofence-check/
```

Live map (`GET /api/v1/tracking/live-map/`) may include `inside_pois` / `inside_geofence` cues — owned with Live GPS; not a write surface.

> There is **no user write** for arrival/departure or geofence dwell. Events are system-generated from GPS evaluation.

```

---

## Access & Permissions

| Action | Role |
|--------|------|
| View geofence events / related history | Roles with Live GPS / TO visibility as applicable |
| View live “inside geofence” cues | Roles with Live GPS permission |
| Manually invent arrival/departure GPS events | **Nobody** — system-generated from GPS |
| Edit geofence radius | Not this story — [GPS-02](GPS-02-poi-geofence-boundary-management.md) / POI write |

Geofence event admin views are read-only.

---

## Sub-tasks — Sprint 6

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| GPS-03-1 | Detection engine | AC-1: Haversine + buffer; Redis presence; TO origin/destination only; no idle events | High | Done |
| GPS-03-2 | GeofenceEvent model + admin | AC-2: ENTRY/EXIT persistence, linkage, dwell on exit; read-only admin | High | Done |
| GPS-03-3 | Trip status on entry | AC-3: arrived at source / destination on origin/dest entry | High | Done |
| GPS-03-4 | Tracking history APIs | AC-4: `GET .../tracking/geofence-events/` (+ check); live inside cues via live-map | Medium | Done |
| GPS-03-5 | TLS-01 timeline emission | Emit full TLS-01 timeline rows atomically with event write | — | Deferred |
| GPS-03-6 | Maps geofence-events / presence | `/api/v1/maps/.../geofence-events` and POI presence panel | — | Deferred (GPS-05) |

---

## Definition of Done

- [x] Active-trip GPS updates evaluate TO origin and destination geofences only; idle does not log TO-linked events (AC-1)
- [x] ENTRY/EXIT `GeofenceEvent` records linked to vehicle, trip, TO, POI; dwell on exit; read-only admin (AC-2)
- [x] Trip status advances to arrived at source / destination on matching geofence entry (AC-3)
- [x] Tracking geofence-events (and check) APIs available; live inside cues via live-map where applicable (AC-4)
- [x] No Sprint AC requiring TLS-01 timeline emission, POI presence panel, off-trip audit events, or `/api/v1/maps/**` geofence APIs (out of scope)

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| GPS-01 / GPS feed | Requires | Live positions to evaluate |
| GPS-02 POI radius | Requires | Circle radius on POI master; engine reads current radius |
| Active Trip / TO | Requires | Origin and destination POIs define evaluation set |
| GPS-04 dwell | Enables | Geofence dwell uses arrival/departure pairs |
| GPS-05 Maps Dashboard | Enables (later) | Presence panel and `/maps/**` history when that surface ships |
| Gate / yard timestamps | Parallel | Separate “Real Time (Gate)” clock — not replaced by GPS arrival |

---

## Related

- [GPS-02 geofence radius](GPS-02-poi-geofence-boundary-management.md) · [GPS-04 dwell](GPS-04-dwell-time-tracking.md) · [GPS-05 Maps Dashboard](GPS-05-maps-dashboard-integration.md) · [Module hub](../../../../05-modules/09-tracking/README.md)

---

*Epic: GPS & Maps Dashboard | Phase: 1 | Sprint 6: 3 SP | PRD: §6.5.6, §6.5.8 | Jira: DFS-079 | Last Updated: 2026-08-10*
