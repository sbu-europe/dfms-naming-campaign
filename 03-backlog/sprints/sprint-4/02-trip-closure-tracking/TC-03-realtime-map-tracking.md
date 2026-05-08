---
jira_key: DFS-047
jira_type: Story
jira_epic: DFS-046
jira_sprint: "Sprint 4"
story_id: US-026
title: Real-time Map & Tracking Dashboard
epic: Trip Closure & Tracking
status: Pending
story_points: 8
assignee: ~
spec_file: ../../../../stories/US-026-realtime-tracking.md
---

# TC-03 — Real-time Map & Tracking Dashboard

## User Story

**As a** Transport Planner / Operations Manager  
**I want to** see active trips on a live map with their current location and trip status  
**So that** I can monitor delivery progress, spot delays, and respond to incidents without calling drivers

## Business Context

Real-time tracking closes the visibility gap between dispatch and delivery. This story delivers the map-based dashboard that shows vehicle locations (via GPS pings from the driver mobile app), route progress, ETA, and trip state — all in a single view. Driver mobile app integration is deferred to Sprint 10; this story handles the backend tracking service and the web dashboard.

For Sprint 4, location data can be simulated / manually updated via API to unblock dashboard development, with real GPS from Sprint 10 Driver Mobile.

## Acceptance Criteria

### AC-1: Location Data Ingestion
- [ ] Backend accepts GPS location pings per trip/vehicle:
  - Vehicle ID / Trip ID
  - Latitude, Longitude
  - Timestamp
  - Speed (km/h)
  - Heading (degrees)
- [ ] Pings stored in time-series (or latest-location store)
- [ ] Rate: accepts up to 1 ping per 30 seconds per vehicle

### AC-2: Live Map Dashboard
- [ ] Web dashboard shows a map (Leaflet.js / Google Maps) with:
  - All active trips shown as vehicle markers
  - Vehicle marker colour-coded by trip state (In Transit = blue, Delayed = orange, Incident = red)
  - Clicking a vehicle marker shows: Driver name, Vehicle reg, Trip ID, Origin→Destination, State, ETA
- [ ] Map auto-refreshes every 60 seconds (or WebSocket push)

### AC-3: Route Overlay
- [ ] Planned route overlaid on map for selected trip (polyline from source POI to destination POI via route defined in MDM-02)
- [ ] Actual path travelled shown as a separate trace line
- [ ] Deviation from planned route highlighted if > configurable threshold (default 5 km)

### AC-4: ETA Calculation
- [ ] ETA estimated based on: remaining distance + current speed + historical average for the route
- [ ] ETA updated on each location ping
- [ ] ETA vs Expected Arrival time shown — overdue trips highlighted

### AC-5: Trip Detail from Map
- [ ] Clicking a vehicle pin opens a side panel with:
  - Full trip info (TO reference, TR reference, cargo, quantity)
  - Current state, last updated time
  - ETA and delay status
  - Open incidents (if any)
  - Quick action: "Mark Delayed" / "Report Incident"

### AC-6: Historical Track Replay
- [ ] Planner can view the recorded path of a completed trip on the map
- [ ] Slider to replay movement over time

### AC-7: Filters
- [ ] Filter active trips by: state, route, driver, vehicle, date range

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| TC-03-1 | VehicleLocation model — vehicle FK, trip FK, lat, lng, speed, heading, recorded_at | DFS-047-1 | Pending |
| TC-03-2 | Location ping API (POST /tracking/location) — rate limited, auth by driver token | DFS-047-2 | Pending |
| TC-03-3 | Latest location API (GET /tracking/vehicles/live) — one record per active vehicle | DFS-047-3 | Pending |
| TC-03-4 | Trip track history API (GET /tracking/trips/{id}/track) — ordered pings | DFS-047-4 | Pending |
| TC-03-5 | ETA calculation service — distance remaining + speed-based estimate | DFS-047-5 | Pending |
| TC-03-6 | Route deviation detection — compare actual lat/lng to planned polyline | DFS-047-6 | Pending |
| TC-03-7 | Live map dashboard UI — Leaflet.js map + vehicle markers + auto-refresh | DFS-047-7 | Pending |
| TC-03-8 | Route overlay + actual track polyline rendering | DFS-047-8 | Pending |
| TC-03-9 | Trip side panel on marker click — details + quick actions | DFS-047-9 | Pending |
| TC-03-10 | Historical track replay UI — path + time slider | DFS-047-10 | Pending |

## API Endpoints

```
POST  /api/v1/tracking/location
Body: { vehicle_id, trip_id, lat, lng, speed, heading }
Auth: Driver token

GET   /api/v1/tracking/vehicles/live?state=&route_id=
Response: [{ vehicle_id, trip_id, lat, lng, state, eta, ... }]

GET   /api/v1/tracking/trips/{id}/track?from=&to=
Response: [{ lat, lng, speed, recorded_at }]
```

## Dependencies

- **Requires**: TE-02 (active trips with state), MDM-02 (Route polylines for planned path)
- **Completes with**: Sprint 10 TC-03 Driver Mobile (real GPS pings replace simulated data)

## Definition of Done

- [ ] Location ping API accepting and storing GPS data
- [ ] Live map dashboard with colour-coded vehicle markers and auto-refresh
- [ ] Route overlay + actual path + deviation detection
- [ ] ETA calculation per trip
- [ ] Historical track replay
- [ ] Unit tests > 80%
- [ ] UAT: Planner sees 3 active trips on map, clicks one, sees ETA and last location updated within 60s
