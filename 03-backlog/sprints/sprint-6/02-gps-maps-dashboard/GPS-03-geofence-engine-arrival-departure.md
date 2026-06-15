---
jira_key: DFS-079
jira_type: Story
jira_sprint: "Sprint 6"
story_id: GPS-03
title: Geofence Engine — Vehicle Arrival & Departure Event Tracking
epic: GPS & Maps Dashboard
status: New — Sprint 6 Scope
story_points: 3
assignee: ~
prd_refs:
  - "§6.5.6 Geofencing and POI Tracking"
  - "§6.5.8 Vehicle Arrival Tracking at POI"
phase: Phase 1
---

# GPS-03 — Geofence Engine: Arrival & Departure Event Tracking

## User Stories

**As a** Transport Planner and TDO
**I want to** see whether a vehicle has arrived at or departed from a facility (depot, feed mill, port berth)
**So that** I can track progress without calling the driver and identify delays before they escalate.

**As a** Transport Planner and Transport Distribution Officer
**I want the** system to automatically detect vehicle arrival at a POI
**So that** gate-in and operational readiness can be tracked without manual input from gate staff or drivers.

*(PRD §6.5.6, §6.5.8)*

---

## Business Context

### Why automated arrival/departure detection

Today, gate staff manually log vehicle arrival in paper registers. There is no systematic link between the physical gate event and the Transport Order — delays go unnoticed until the delivery is already late, and the trip timeline is incomplete.

GPS-03 closes this gap: every time a vehicle crosses a configured POI boundary (GPS-02 radius), the system automatically fires an **ARRIVAL** or **DEPARTURE** event. These events:

1. **Feed the TO timeline** (TLS-01) — transport planners and TDOs can see "Vehicle arrived at source depot at 09:14" alongside all other trip milestones, without anyone needing to type it in.
2. **Trigger dwell time accumulation** (GPS-04) — the clock starts at ARRIVAL and stops at DEPARTURE; the engine does not need to wait for a human to mark "loading completed."
3. **Populate the maps dashboard** (GPS-05) — POI presence panel and vehicle side-panel reflect the current engine state in near real-time.

### Detection approach (haversine + Redis state)

Each incoming GPS snapshot (from GPS-01) is evaluated against **all active POI geofences**. The engine computes the haversine distance between the vehicle's current position and each POI center; if the distance is less than the configured radius (GPS-02), the vehicle is "inside."

Per-vehicle presence state is held in **Redis** to support fast boundary evaluation without a DB read per snapshot. A **debounce/hysteresis** rule prevents false events when a vehicle hovers near a boundary: an ARRIVAL event is only fired after N consecutive "inside" readings (or M seconds of confirmed presence — rule documented by dev with PO). This prevents a vehicle crawling past the perimeter from generating repeated ARRIVAL/DEPARTURE flaps.

### Source vs destination distinction

A TO has both a **source POI** and a **destination POI**. The engine tags each event with which POI the vehicle is at and whether that POI is the source or destination of the active TO — so the timeline shows "Arrived at source (Depot A)" before loading and "Arrived at destination (Feed Mill B)" after transit, not just an uncontextualised coordinate event.

### Off-trip events

Vehicles crossing a POI geofence when **not on an active trip** (e.g. returning to the depot, maintenance run) still generate events recorded against the vehicle only — no TO linkage. These are retained for fleet visibility and audit, but do not appear on any TO timeline.

---

## Acceptance Criteria

### AC-1 — Detection engine

- Each incoming GPS snapshot is evaluated against all active POI geofences (haversine distance vs current radius from GPS-02).
- Per-vehicle presence state held in Redis; **debounce/hysteresis** prevents event flapping when a vehicle hovers on the boundary (rule documented, e.g. N consecutive points or M-second confirmation).
- Engine throughput handles the full fleet at the configured poll interval; evaluation cost documented.

### AC-2 — Arrival & departure events

- Vehicle **enters** a POI geofence → `ARRIVAL` event logged automatically with timestamp; vehicle **exits** → `DEPARTURE` event.
- Events persist in an append-only `GeofenceEvent` model with read-only admin; no edit or delete surface.
- Each event linked to **vehicle ID** always, and to **Trip ID + TO ID** when the vehicle has an active trip (GPS-01 association); off-trip events still recorded against the vehicle.
- Detection accuracy documented as GPS-provider dependent (known-limitations note carried from the Sprint 5 demo).

### AC-3 — Trip timeline integration (TLS-01)

- Arrival and departure events for on-trip vehicles are emitted to the TO timeline **atomically** with the `GeofenceEvent` write; visible via existing `GET …/timeline` ordered with all other lifecycle events.
- Source/destination POI of the TO identified on the event (arrival at source vs destination is distinguishable).

### AC-4 — Event history API

- `GET /api/v1/maps/transport-orders/{id}/geofence-events` returns the TO's geofence event history (event type, POI, vehicle, timestamps, dwell once GPS-04 lands); RBAC consistent with the GPS-05 dashboard permission.

---

## API Endpoints

```
# Geofence event history for a Transport Order
GET   /api/v1/maps/transport-orders/{to_id}/geofence-events
      ?event_type=ARRIVAL|DEPARTURE                       # optional filter
      &poi_id={uuid}                                       # optional filter
      Response: list of { event_type, poi_id, poi_name, poi_role (source|destination|other),
                          vehicle_id, trip_id, to_id, timestamp, dwell_seconds (if departed) }

# Vehicle-level geofence event history (admin / debug use)
GET   /api/v1/gps/vehicles/{vehicle_id}/geofence-events
      ?from=ISO8601&to=ISO8601                             # date range filter

# Trip timeline — geofence events appear here automatically (existing TLS-01 endpoint)
GET   /api/v1/transport-orders/{to_id}/timeline            # already exists; ARRIVAL/DEPARTURE events appended atomically
```

> The engine itself runs as a **Celery task / signal handler** triggered on each `VehicleGPSSnapshot` write — there is no inbound API for event creation. All write paths are internal.

---

## Access & Permissions

| Action | Role |
|--------|------|
| View geofence event history for a TO | Transport Planner, TDO — Own Fleet, TDO — Vendor Fleet, Tenant Admin |
| View geofence events on TO timeline | Transport Planner, TDO — Own Fleet, TDO — Vendor Fleet, Tenant Admin, Driver (own trip) |
| View vehicle-level geofence event history | Tenant Admin, Super Admin |
| View current POI presence state (via GPS-05 dashboard) | Transport Planner, TDO — Own Fleet, TDO — Vendor Fleet, Tenant Admin |
| Write / create geofence events | **System only** — engine fires events; no user-facing write surface |
| Edit or delete any geofence event | **Nobody** — append-only model; immutable |

> Gate staff, Scaling Operators, and Command Center Officers do not have direct access to the geofence event history API — they see operationally relevant status through their own module screens. Tenant Admin can see all events for audit purposes.

---

## Sub-tasks — Sprint 6

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| GPS-03-1 | Detection engine | AC-1: haversine evaluation, Redis presence state, debounce rule, throughput check | High | Not started |
| GPS-03-2 | `GeofenceEvent` model | AC-2: append-only model + read-only admin | High | Not started |
| GPS-03-3 | Event linkage | AC-2: vehicle always; Trip/TO when on-trip; source-vs-destination tagging | High | Not started |
| GPS-03-4 | TLS-01 timeline emission | AC-3: atomic emission to TO timeline | High | Not started |
| GPS-03-5 | Event history API | AC-4: geofence-events endpoint + RBAC | Medium | Not started |

---

## Definition of Done

- [ ] Entry/exit detected and debounced for a mock vehicle crossing a boundary (AC-1)
- [ ] `ARRIVAL`/`DEPARTURE` events persisted append-only with full linkage (AC-2)
- [ ] Events appear on the TO timeline in order, atomically with the event write (AC-3)
- [ ] History endpoint returns correct events under RBAC (AC-4)
- [ ] Verified end-to-end on the E2E-01 harness mock GPS feed (with the GPS-05-9 scenario)

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| GPS-01 feed | Upstream | Snapshots + trip association are the engine input |
| GPS-02 config | Upstream | Current radius read at evaluation time |
| TLS-01 lifecycle | Integration | Timeline emission (AC-3) |
| GPS-04 / GPS-05 | Consumers | Dwell calc and dashboard read these events |
| Redis | Infra | Presence state |

---

*Epic: GPS & Maps Dashboard | Phase: 1 | Sprint 6: 3 SP | PRD: §6.5.6, §6.5.8 | Jira: DFS-079 | Last Updated: 2026-06-15*
