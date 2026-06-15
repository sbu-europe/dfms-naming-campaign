---
jira_key: DFS-081
jira_type: Story
jira_sprint: "Sprint 6"
story_id: GPS-05
title: Maps Dashboard & TO/PR Integration — Map UI, APIs & RBAC
epic: GPS & Maps Dashboard
status: New — Sprint 6 Scope
story_points: 4
assignee: ~
prd_refs:
  - "§6.5.4 Integration & Linkage – Map Layer Integration (TO + Live GPS)"
  - "§6.8.2 Transport Dashboard – Map-Based Dashboard"
  - "§9.2 Map & Routing APIs"
phase: Phase 1
supersedes: "Sprint 5 GPS-01 (DFS-070) demo gaps — POI map layer, degraded-mode verification, and PO sign-off fold in here"
---

# GPS-05 — Maps Dashboard & TO/PR Integration

## User Story

**As a** Transport Planner and Transport Distribution Officer (TDO — Own Fleet and Vendor Fleet)
**I want** an interactive map-based dashboard as my default landing view
**So that** I can see where every active vehicle is relative to POIs and ongoing Transport Orders — in near real-time — without switching between multiple screens or making phone calls.

**As a** Transport Planner
**I want to** click on a vehicle or a POI on the map
**So that** I can see the full operational context — driver, TO status, dwell time, geofence events — in a side panel without leaving the map.

*(PRD §6.8.2, §6.5.4)*

---

## Business Context

### The map dashboard as the operations command centre

PRD §6.8.2 mandates the map-based dashboard as the **default landing view** for Transport Planners and TDOs. This is not a reporting tool — it is the primary real-time operational screen for anyone responsible for moving fleet. Everything DFMS has built in the GPS epic flows into this surface:

- **GPS-01** feeds the live vehicle positions that appear as markers on the map.
- **GPS-02** supplies the geofence radius that draws the coloured boundary circles around POIs.
- **GPS-03** fires the arrival/departure events that update the vehicle's "at POI" state and the POI presence panel.
- **GPS-04** surfaces dwell-time exceptions as KPI alerts in the top bar.

Without GPS-05, all the underlying GPS infrastructure has no user-facing surface — it would only be visible in database tables.

### Role-based scope of the map

Not all roles see the same vehicles on the map:

| Role | Sees on the map |
|------|-----------------|
| Tenant Admin | Full tenant view — all vehicles, all POIs, all TOs |
| Transport Planner | All own-fleet vehicles + active TOs + all POIs |
| TDO — Own Fleet | Own-fleet vehicles and their TOs |
| TDO — Vendor Fleet | Vendor-fleet active TOs (vehicle position visible when assigned and in-transit) |
| Any other role | No access to the maps dashboard — returns 403 |

This RBAC ensures that operational yard staff (Gate, CC, Scaling) do not see fleet tracking data they have no operational need for, while the roles responsible for fleet coordination see the full picture at their scope.

### TO/PR linkage verification (Sprint 3 integration)

GPS-05 also owns the verification that TO creation offers **POI dropdowns** (source and destination) — this was delivered in Sprint 3 and must be confirmed still working. Similarly, the PR form should display real-time stock at the source POI and capacity at the destination — an integration point with STK-01 (Sprint 5). These are verification tasks only; if a gap larger than 1 SP is found, it becomes a new backlog item rather than silent scope growth.

### Degraded mode (Sprint 5 closeout)

The Sprint 5 demo story left the degraded-mode behaviour unverified in UAT. GPS-05 closes this: when the GPS provider is unavailable (no new snapshots received), the map must show a **visible warning banner** ("GPS data unavailable — showing last known positions") rather than failing silently or showing a white screen. This is a hard requirement for production go-live.

---

## Acceptance Criteria

### AC-1 — Map dashboard

The vehicle tracking dashboard displays:

- All **active POIs** on the map with **geofence boundaries as colored zones** (radius circles) — closes the Sprint 5 AC-S5-3 gap.
- **Vehicle positions relative to POIs**, live-updating at the configured refresh interval (GPS-01 AC-3), with signal-lost styling.
- **Active trips with source/destination POIs highlighted**; selecting a trip focuses its vehicle and route context.
- **KPI widget bar**: vehicles moving / idle / at POI, active trips, signal-lost count, dwell threshold violations (GPS-04).

### AC-2 — `/api/v1/maps/**` API surface

- `GET /api/v1/maps/dashboard` — vehicles (position, status, trip ref), active POIs + geofence zones, active trips, KPI widget data.
- `GET /api/v1/maps/vehicles/{id}/panel` — vehicle context side panel: registration, current trip (TO/Trip ref), status, last update, current/last POI, today's activity.
- `GET /api/v1/maps/transport-orders/{id}/route` — TO/Trip-centric view: source/destination POIs highlighted, current vehicle position, arrival/departure history.
- (Geofence-event history endpoint delivered by GPS-03 AC-4 completes the family.)

### AC-3 — POI presence panel

- Per-POI view (map popup or panel) lists **vehicles currently within the geofence** with entry time and duration so far — reading GPS-03 presence state (§6.5.4 POI-Vehicle Relationship Tracking).

### AC-4 — RBAC

| Role | Dashboard access |
|------|------------------|
| Tenant Admin | Full read access |
| Transport Planner (TP) | Own-fleet vehicles, all POIs, all TOs |
| TDO — Own Fleet | Own-fleet vehicles |
| TDO — Vendor Fleet | Vendor-fleet TOs |

- `MapsDashboardPermission` enforced on every `/api/v1/maps/**` endpoint; 403 for unauthorized roles; unit tests cover all four roles plus a negative role (e.g. gateman).

### AC-5 — Degraded mode (Sprint 5 closeout)

- On provider/API failure the map shows last successful positions with a visible **degraded-mode banner**; no white-screen. Verified in UAT and recorded — closes the Sprint 5 AC-S5-4 gap.

### AC-6 — TO / PR linkage verification (no rebuild expected)

- TO/Trip creation form offers **source POI and destination POI dropdowns** — verify existing Sprint 3 behaviour; record evidence.
- PR form pre-populates POI information and displays **real-time stock level for the source POI** and **capacity availability for the destination POI** — verify STK-01 (Sprint 5) covers this; close any display gaps found (gap > 1 SP becomes a raised backlog item, not silent scope growth).

### AC-7 — E2E scenario & PO sign-off

- End-to-end pass on the E2E-01 harness with a mock GPS feed: vehicle approaches source POI → `ARRIVAL` on timeline → dwell accrues → threshold flag fires → `DEPARTURE` + dwell calculated → dashboard, vehicle panel, route view, and POI presence panel all reflect each step (covers GPS-01 → GPS-05 jointly).
- **PO walkthrough of the production dashboard signed off** — supersedes the demo sign-off left open by the Sprint 5 story.

---

## API Endpoints

```
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
      Response: { registration, fleet_type, vehicle_state,
                  driver_name, helper_name,
                  current_trip: { trip_id, to_id, to_reference, status, source_poi, destination_poi, planned_eta },
                  last_gps_update, current_poi (if inside geofence),
                  today_trips_count }

# TO/Trip route view
GET   /api/v1/maps/transport-orders/{to_id}/route
      Response: { to_id, trip_id, source_poi: { id, name, lat, lng, radius_m },
                  destination_poi: { id, name, lat, lng, radius_m },
                  vehicle: { vehicle_id, lat, lng, signal_status },
                  geofence_events: [ ... ],       # arrival/departure history for this TO
                  timeline_summary: [ ... ] }     # last N timeline events

# POI presence panel — vehicles currently inside this POI's geofence
GET   /api/v1/maps/pois/{poi_id}/presence
      Response: [{ vehicle_id, registration, trip_id, to_id,
                   entry_timestamp, dwell_seconds_so_far }]

# Geofence event history — delivered by GPS-03, referenced here for completeness
GET   /api/v1/maps/transport-orders/{to_id}/geofence-events
```

> All `/api/v1/maps/**` endpoints enforce `MapsDashboardPermission`. A 403 is returned for any role not in the RBAC matrix (AC-4). All endpoints are GET-only — the dashboard is a read surface.

---

## Access & Permissions

| Action | Role |
|--------|------|
| Access the maps dashboard (default landing view) | Transport Planner, TDO — Own Fleet, TDO — Vendor Fleet, Tenant Admin |
| View all own-fleet vehicles on map | Transport Planner, TDO — Own Fleet, Tenant Admin |
| View vendor-fleet vehicle positions (for their active TOs) | TDO — Vendor Fleet, Tenant Admin |
| View POI markers and geofence circles | Transport Planner, TDO — Own Fleet, TDO — Vendor Fleet, Tenant Admin |
| View vehicle side panel | Transport Planner, TDO — Own Fleet, TDO — Vendor Fleet, Tenant Admin |
| View TO route view | Transport Planner, TDO — Own Fleet, TDO — Vendor Fleet, Tenant Admin |
| View POI presence panel | Transport Planner, TDO — Own Fleet, Tenant Admin |
| View KPI widget bar (including dwell exceptions) | Transport Planner, TDO — Own Fleet, TDO — Vendor Fleet, Tenant Admin |
| Access any `/api/v1/maps/**` endpoint | Roles above only — 403 for all others |

> **Negative test cases required**: Gate Operator, Scaling Operator, Command Center Officer, Driver, Vendor — all must receive 403 on every `/api/v1/maps/**` endpoint. These are unit-tested as part of GPS-05-6.

---

## Sub-tasks — Sprint 6

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| GPS-05-1 | Dashboard API | AC-2: `GET /api/v1/maps/dashboard` | High | Not started |
| GPS-05-2 | Dashboard UI | AC-1: map layers incl. POI markers + geofence circles, trip highlighting, KPI bar; Live GPS page extend/supersede decision recorded | High | Not started |
| GPS-05-3 | Vehicle panel API | AC-2: `GET /api/v1/maps/vehicles/{id}/panel` | High | Not started |
| GPS-05-4 | TO route API | AC-2: `GET /api/v1/maps/transport-orders/{id}/route` | Medium | Not started |
| GPS-05-5 | POI presence panel | AC-3: in-fence vehicle list with entry time + duration | Medium | Not started |
| GPS-05-6 | RBAC | AC-4: `MapsDashboardPermission` + role matrix tests + negative-role tests | High | Not started |
| GPS-05-7 | Degraded mode | AC-5: banner on provider failure; UAT verification recorded | Medium | Not started |
| GPS-05-8 | TO/PR linkage verification | AC-6: verify Sprint 3 POI dropdowns + STK-01 stock/capacity display; record evidence | Medium | Not started |
| GPS-05-9 | E2E scenario + PO sign-off | AC-7: full GPS journey on the E2E-01 harness; PO walkthrough sign-off | Medium | Not started |

---

## Definition of Done

- [ ] Dashboard shows POIs, geofence zones, live vehicles, highlighted active trips, KPI bar (AC-1)
- [ ] All three `/api/v1/maps/**` endpoints live with documented payloads (AC-2)
- [ ] POI presence panel correct against engine state (AC-3)
- [ ] RBAC matrix enforced with passing role tests + negative-role tests (AC-4)
- [ ] Degraded-mode banner verified in UAT (AC-5)
- [ ] TO/PR linkage evidence recorded; gaps closed or raised (AC-6)
- [ ] E2E scenario passes; PO sign-off recorded (AC-7)

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| GPS-01 / GPS-02 / GPS-03 / GPS-04 | Upstream | Dashboard assembles all four — schedule last in the epic |
| STK-01 stock snapshot | Reads | AC-6 PR-form verification |
| E2E-01 harness | Shared | GPS-05-9 runs on the Sprint 6 E2E foundation |
| PO availability | Review | AC-7 walkthrough sign-off near sprint end |

---

*Epic: GPS & Maps Dashboard | Phase: 1 | Sprint 6: 4 SP | PRD: §6.5.4, §6.8.2, §9.2 | Jira: DFS-081 | Last Updated: 2026-06-15*
