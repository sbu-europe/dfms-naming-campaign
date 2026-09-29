---
jira_key: DFS-081
jira_type: Story
jira_sprint: "Sprint 6"
story_id: GPS-05
title: Maps Dashboard — Deferred PRD Landing Surface (KPIs, Presence, TO Route)
epic: GPS & Maps Dashboard
status: Deferred — Live GPS is Phase 1 map; full Maps Dashboard not in current delivery
story_points: 4
assignee: ~
prd_refs:
  - "§6.5.4 Integration & Linkage – Map Layer Integration (TO + Live GPS)"
  - "§6.8.2 Transport Dashboard – Map-Based Dashboard"
  - "§6.9.2 Transport Dashboard – Map-Based Dashboard"
  - "§9.2 Map & Routing APIs"
phase: Phase 1
supersedes: "Sprint 5 GPS-01 (DFS-070) demo gaps — POI map layer delivered on Live GPS; full Maps Dashboard remains deferred"
---

# GPS-05 — Maps Dashboard

## User Story

**As a** Transport Planner / Transport Distribution Officer  
**I want** a real-time map-based operational view of vehicles, TOs, and POIs as my default landing  
**So that** I can monitor execution status from one place — KPIs, POI presence, and TO-centric context — without switching screens.

*(PRD §6.5.4, §6.8.2 / §6.9.2)*

> **Phase delivery note:** This story is the backlog contract for the **Maps Dashboard** surface. Phase 1 operators use **Live GPS** today. Full Maps Dashboard (default landing, KPI bar, presence panel, TO route highlight UX, `/api/v1/maps/**`) is **deferred**.

---

## Business Context

### Live GPS vs Maps Dashboard

The PRD describes a rich **Maps Dashboard**. Phase 1 delivered **Live GPS** as the working map for GPS monitoring. These surfaces must stay distinct so “map dashboard” language is not confused with what operators have today.

| Surface | Audience | Purpose | Status |
|---------|----------|---------|--------|
| **Live GPS** | Tenant Admin, Tenant Super Admin + roles with Live GPS permission | Real-time fleet on active trips; history; geofence circles | **Delivered** (see [GPS-01](../../sprint-5/12-gps-maps-dashboard/GPS-01-maps-dashboard-gps-tracking.md)) |
| **Maps Dashboard** (this story) | Transport Planner, TDO (Own / Vendor), Tenant Admin | Default landing: KPIs, presence panel, TO highlight, broader RBAC | **Deferred** |
| **Command Center map** | Yard / Command Center roles | Yard operational context | Separate module — not GPS SSOT |

### §6.5.4 / §6.9.2 — client wants vs where they live

| Client want | Status | Where it lives today |
|-------------|--------|----------------------|
| POIs on map with geofence zones | **Done** | Live GPS |
| Vehicle positions relative to POIs | **Done** | Live GPS |
| Active trips with source/destination context | **Partial** | On Live GPS vehicle/TO context; full highlight UX deferred here |
| Arrival / Departure event logging | **Done** | GPS-03 |
| Dwell between arrival and departure | **Done** | GPS-04 |
| List of vehicles currently inside each POI | **Not done** | Presence panel — this story (deferred) |
| Entry time + duration-so-far on presence panel | **Not done** | This story (deferred) |
| Map as **default landing** for TP / TDO | **Not done** | Live GPS is a menu page, not default dashboard |
| KPI widgets (active TOs, in transit, idle, halted) | **Not done** | This story (deferred) |
| TO-centric route visualization | **Not done** | This story (deferred) |
| Side panel: vehicle, driver, helper, TO, last GPS | **Partial** | Live GPS panels; full panel set deferred here |
| Flags: halted TO, idle threshold, dwell violation | **Partial** | Dwell vs planned on TO (GPS-04); full dashboard flags deferred here |

Until Maps Dashboard ships, product map surfaces use **`/api/v1/tracking/`** (as built). `/api/v1/maps/**` is the future family for this story.

### Business rules (when Maps Dashboard ships)

- Only vehicles with a **valid GPS association** appear as live markers.
- If live tracking is unavailable, show **last known** position.
- POI presence and geofence visuals use POI master radius.
- Own vs vendor fleet segregation follows RBAC.

---

## Acceptance Criteria

### AC-1 — Scope boundary (Phase 1)

- Phase 1 map operations for GPS monitoring are satisfied by **Live GPS** (vehicles, POI geofence circles, last-known / signal-lost, history). This story does **not** re-require those capabilities as Maps Dashboard Sprint AC.
- GPS-05 does **not** claim that Live GPS is the PRD Maps Dashboard, or that Maps Dashboard is already delivered.

### AC-2 — Deferred Maps Dashboard surface (when this story is pulled)

When Maps Dashboard is scheduled for delivery, it must provide:

- Map as **default landing** for Transport Planner and TDO (Own / Vendor), RBAC-scoped.
- **KPI widget bar** (e.g. active TOs, in transit, idle, halted / signal-lost, dwell-related flags as designed).
- **POI presence panel**: vehicles currently inside each POI with entry time and duration-so-far.
- **TO-centric route visualization** and full vehicle side-panel set (vehicle, driver, helper, TO, last GPS) beyond the partial Live GPS panels.
- Dashboard flags for halted TO / idle threshold / dwell violation at the dashboard level (beyond TO-level planned-vs-actual dwell from GPS-04).

### AC-3 — Deferred `/api/v1/maps/**` family

- Maps Dashboard consumes a dedicated `/api/v1/maps/**` API family (see API Endpoints — Deferred).
- Until that family ships, operators continue on **`/api/v1/tracking/**`** for Live GPS.
- All Maps Dashboard endpoints are **GET-only** — no user write for system-calculated GPS / presence / KPI fields.

### AC-4 — Deferred RBAC matrix

| Action | Role (PRD intent) |
|--------|-------------------|
| Open Maps Dashboard as landing | Transport Planner, TDO Own Fleet, TDO Vendor Fleet (RBAC-scoped), Tenant Admin |
| See own-fleet vs vendor-fleet markers | Per role / fleet scope |

- As built today: Live GPS uses Live GPS menu permission (and Tenant Admin). Full Maps Dashboard RBAC matrix ships with this story when it is no longer deferred.

### Out of scope for GPS-05

- Rebuilding Live GPS feed, geofence engine, arrival/departure, or dwell calculation (GPS-01…04).
- Command Center / yard map surfaces.
- Sprint 5 closeout items that are **not** Maps Dashboard product scope in the module (e.g. TO/PR stock linkage verification, formal PO walkthrough of a production Maps Dashboard that does not yet exist). Degraded / last-known behaviour for the live map is owned with Live GPS / GPS-01 signal-loss rules.

---

## API Endpoints

### As built (Live GPS — not Maps Dashboard)

Until Maps Dashboard ships, product surfaces use tracking APIs, for example:

```http
GET /api/v1/tracking/live-map/
GET /api/v1/tracking/vehicle-to-history/
GET /api/v1/tracking/vehicle-history/
GET /api/v1/tracking/vehicle-history-summary/
GET /api/v1/tracking/vehicle-idle-history/
GET /api/v1/tracking/vehicle-idle-summary/
```

> Detail and ownership: Live GPS / GPS-01. No user write for GPS positions.

### Deferred / out of scope until Maps Dashboard ships

```http
# Maps dashboard — main payload for the map view
GET   /api/v1/maps/dashboard
      Response: {
        vehicles: [{ vehicle_id, registration, lat, lng, speed_kmh, signal_status,
                     vehicle_state, current_trip_id, to_id, to_status,
                     source_poi_id, destination_poi_id, last_update }],
        pois: [{ poi_id, name, type, lat, lng, geofence_radius_m,
                 vehicles_inside_count, loading_activity }],
        active_trips: [{ trip_id, to_id, to_reference, vehicle_id,
                         source_poi_id, destination_poi_id, status, planned_eta }],
        kpi: { vehicles_moving, vehicles_idle, vehicles_at_poi, active_trips,
               signal_lost_count, dwell_exception_count }
      }

# Vehicle side-panel context
GET   /api/v1/maps/vehicles/{vehicle_id}/panel
      Response: { registration, vehicle_type, vehicle_state,
                  driver_name, helper_name,
                  current_trip: { trip_id, to_id, to_reference, status, source_poi, destination_poi, planned_eta },
                  last_gps_update, current_poi (if inside geofence),
                  today_trips_count }

# TO/Trip route view
GET   /api/v1/maps/transport-orders/{to_id}/route
      Response: { to_id, trip_id, source_poi: { id, name, lat, lng, radius_m },
                  destination_poi: { id, name, lat, lng, radius_m },
                  vehicle: { vehicle_id, lat, lng, signal_status },
                  geofence_events: [ ... ],
                  timeline_summary: [ ... ] }

# POI presence panel — vehicles currently inside this POI's geofence
GET   /api/v1/maps/pois/{poi_id}/presence
      Response: [{ vehicle_id, registration, trip_id, to_id,
                   entry_timestamp, dwell_seconds_so_far }]

# Geofence event history — delivered with GPS-03 / GPS-04; referenced for Maps Dashboard completeness
GET   /api/v1/maps/transport-orders/{to_id}/geofence-events
```

> When built, `/api/v1/maps/**` endpoints enforce Maps Dashboard permission; 403 for roles outside the matrix. All endpoints are GET-only — the dashboard is a read surface. System-calculated fields (positions, presence, KPIs) have no user write.

---

## Access & Permissions

### As built (Live GPS)

| Action | Role |
|--------|------|
| View Live GPS map | Transport Planner, TDO (Vendor Fleet), Tenant Admin, Tenant Super Admin (+ Live GPS permission) |
| Edit / delete GPS positions | **Nobody** — GPS is read-only |

### Target (Maps Dashboard — when this story ships)

| Action | Role |
|--------|------|
| Open Maps Dashboard as landing | Transport Planner, TDO — Own Fleet, TDO — Vendor Fleet, Tenant Admin |
| View own-fleet vs vendor-fleet markers | Per role / fleet scope |
| View POI presence, KPI bar, TO route, full vehicle panel | Roles above, RBAC-scoped |
| Access any `/api/v1/maps/**` endpoint | Roles above only — 403 for others |

---

## Sub-tasks — Deferred (Maps Dashboard)

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| GPS-05-1 | Dashboard API | AC-3: `GET /api/v1/maps/dashboard` | High | Deferred |
| GPS-05-2 | Dashboard UI | AC-2: default landing, map layers, trip highlighting, KPI bar | High | Deferred |
| GPS-05-3 | Vehicle panel API | AC-3: `GET /api/v1/maps/vehicles/{id}/panel` | High | Deferred |
| GPS-05-4 | TO route API | AC-3: `GET /api/v1/maps/transport-orders/{id}/route` | Medium | Deferred |
| GPS-05-5 | POI presence panel | AC-2: in-fence vehicle list with entry time + duration | Medium | Deferred |
| GPS-05-6 | RBAC | AC-4: Maps Dashboard permission + role matrix + negative-role tests | High | Deferred |

> Former Sprint 6 closeout sub-tasks (degraded-mode UAT banner, TO/PR linkage verification, Maps Dashboard PO sign-off / E2E against a full dashboard) are **removed** from this story’s delivery contract — they are not Maps Dashboard module scope while the surface remains deferred. Live GPS / signal-loss and GPS-01…04 E2E remain on their owning stories.

---

## Definition of Done

- [ ] Story scope explicitly separates **delivered Live GPS** from **deferred Maps Dashboard** (AC-1)
- [ ] When Maps Dashboard is scheduled: default landing, KPIs, presence panel, TO route / full panel, dashboard flags accepted (AC-2)
- [ ] `/api/v1/maps/**` family live with documented payloads; tracking APIs remain for Live GPS until then (AC-3)
- [ ] Maps Dashboard RBAC matrix enforced with role + negative-role tests (AC-4)
- [ ] No user write for system-calculated GPS / presence / KPI fields

> DoD items for AC-2…AC-4 apply when this deferred story is pulled into a sprint — not as current Sprint 6 completion gates.

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| GPS-01 / Live GPS feed | Upstream | Required before Maps Dashboard can assemble live markers |
| GPS-02 POI geofences | Upstream | Presence and geofence visuals use POI master radius |
| GPS-03 arrival/departure | Upstream | Feeds presence and route event history |
| GPS-04 dwell | Upstream | May surface dwell-related dashboard flags when designed |
| Live GPS (`/api/v1/tracking/**`) | Parallel | Phase 1 operator map until `/api/v1/maps/**` ships |

---

*Epic: GPS & Maps Dashboard | Phase: 1 | Sprint 6: 4 SP (deferred) | PRD: §6.5.4, §6.8.2 / §6.9.2, §9.2 | Jira: DFS-081 | Last Updated: 2026-08-06*
