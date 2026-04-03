---
jira_key: DFS-031
jira_type: Story
jira_epic: DFS-032
jira_sprint: "Sprint 2"
story_id: US-097
title: Geofencing Engine — Vehicle Arrival & Departure Detection
epic: Vehicle Tracking & Geofencing
status: Pending
story_points: 8
assignee: ~
spec_file: ../../../../stories/US-097-poi-management-geofencing.md
note: POI CRUD and geofence radius configuration is in MDM-04. This story covers the runtime tracking engine.
---

# VTG-01 — Geofencing Engine: Vehicle Arrival & Departure Detection

## User Story

**As a** Transport Planner / System  
**I want to** automatically detect when a vehicle enters or exits a POI geofence boundary using live GPS data  
**So that** arrival and departure events are logged against trips, dwell time is calculated, and downstream workflows (Gate Management, trip timeline, capacity updates) are triggered automatically

## Business Context

The geofencing engine is the runtime counterpart to the POI master data. While [MDM-04](../01-master-data-management/MDM-04-poi-management.md) defines POI locations and geofence radius as configuration, this story implements the event processing system that:

- Continuously processes incoming GPS pings from vehicle trackers
- Evaluates each ping against all active POI geofences for the vehicle's current trip
- Fires `ARRIVAL` and `DEPARTURE` events when a vehicle crosses a POI boundary
- Calculates dwell time (time spent inside a POI boundary)
- Flags dwell time threshold violations
- Publishes events consumed by Gate Management, trip timeline, and capacity tracking

**PRD Source Sections:** 6.5.5 GPS Tracking & Monitoring, 6.5.6 Geofencing and POI Tracking, 6.5.7 POI Geofencing Boundary Management, 6.5.8 Vehicle Arrival Tracking at POI

## Acceptance Criteria

### AC-1: GPS Event Processing
- [ ] System SHALL continuously receive GPS pings from vehicle trackers (lat/lng + timestamp + vehicle ID)
- [ ] System SHALL evaluate each ping against active POI geofences for in-progress trips
- [ ] POI geofence boundary = circle defined by POI's GPS coordinates + `geofence_radius_meters` (from MDM-04)
- [ ] Coordinate-to-POI matching uses Haversine distance formula
- [ ] Processing latency < 5 seconds from GPS ping to event fire

### AC-2: Arrival Detection
- [ ] System SHALL detect vehicle **entry** into a POI geofence (GPS ping inside radius after being outside)
- [ ] `ARRIVAL` event SHALL be logged with: Trip ID, TO ID, Vehicle ID, POI ID, arrival timestamp, GPS coordinates
- [ ] Arrival event SHALL be published to: Gate Management module, trip timeline

### AC-3: Departure Detection
- [ ] System SHALL detect vehicle **exit** from a POI geofence (GPS ping outside radius after being inside)
- [ ] `DEPARTURE` event SHALL be logged with: Trip ID, TO ID, Vehicle ID, POI ID, departure timestamp
- [ ] Departure event SHALL trigger: dwell time calculation, capacity update notification

### AC-4: Dwell Time
- [ ] Dwell time = departure timestamp − arrival timestamp (in minutes)
- [ ] Dwell time stored on `POIGeofenceEvent` record linked to the departure event
- [ ] Dwell threshold breached flag set if dwell_time > configurable threshold per POI type
- [ ] Threshold violations visible in trip timeline and flagged for reporting

### AC-5: Geofence Map Visualisation
- [ ] All active POI geofences displayed as radius circles on the map (driven by MDM-04 data)
- [ ] Live vehicle positions overlaid on the map during active trips
- [ ] Visual indicator when vehicle is inside a geofence

### AC-6: Event Visibility
- [ ] Arrival/departure events visible in: trip timeline, vehicle detail view, POI event log
- [ ] Events filterable by POI, vehicle, trip, date range
- [ ] Events exportable (CSV)

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| VTG-01-1 | GPS ping ingestion endpoint / message queue consumer (vehicle_id, lat, lng, timestamp) | DFS-031-1 | Pending |
| VTG-01-2 | Haversine geofence evaluation service — check GPS point against all active POI geofences | DFS-031-2 | Pending |
| VTG-01-3 | Arrival event detection — entry state machine (outside → inside) per vehicle/POI pair | DFS-031-3 | Pending |
| VTG-01-4 | Departure event detection — exit state machine (inside → outside) per vehicle/POI pair | DFS-031-4 | Pending |
| VTG-01-5 | POIGeofenceEvent model + migration (arrival/departure, trip/TO/vehicle/POI FKs, dwell time) | DFS-031-5 | Pending |
| VTG-01-6 | Dwell time calculation on departure + configurable threshold breach flag | DFS-031-6 | Pending |
| VTG-01-7 | Event publisher — push arrival/departure events to Gate Management and trip timeline | DFS-031-7 | Pending |
| VTG-01-8 | Departure → capacity update notification to MDM-04 stock tracking | DFS-031-8 | Pending |
| VTG-01-9 | Geofence events API (GET list per POI / vehicle / trip, GET detail) | DFS-031-9 | Pending |
| VTG-01-10 | Map layer — live vehicle positions + POI geofence circles overlay | DFS-031-10 | Pending |
| VTG-01-11 | Event log UI — trip timeline events, vehicle event history, POI event log | DFS-031-11 | Pending |

## Data Model

```typescript
interface POIGeofenceEvent {
  id: UUID;
  tenant_id: UUID;
  poi_id: UUID;              // FK → POI (MDM-04)
  trip_id: UUID;             // FK → Trip
  to_id: UUID;               // FK → Transport Order
  vehicle_id: UUID;          // FK → Vehicle (MDM-05)

  event_type: 'ARRIVAL' | 'DEPARTURE';
  event_timestamp: Timestamp;

  dwell_time_minutes?: Integer;          // Computed on DEPARTURE
  dwell_threshold_breached: Boolean;

  gps_latitude: Decimal;
  gps_longitude: Decimal;
}

interface VehicleGPSState {
  vehicle_id: UUID;
  poi_id: UUID;
  inside_geofence: Boolean;
  entry_timestamp?: Timestamp;
}
```

## API Endpoints

```
POST  /api/v1/gps/ping                                     # Inbound GPS ping from tracker
GET   /api/v1/pois/{poi_id}/geofence-events?trip_id=&from=&to=
GET   /api/v1/vehicles/{vehicle_id}/geofence-events?from=&to=
GET   /api/v1/trips/{trip_id}/geofence-events
```

## Dependencies

- **Requires**: [MDM-04 POI Management](../01-master-data-management/MDM-04-poi-management.md) — reads `geofence_radius_meters` per POI
- **Requires**: [MDM-05 Vehicle Master Data](../01-master-data-management/MDM-05-vehicle-master-data.md) — vehicle identity and GPS tracker ID
- **Publishes events to**: Gate Management (US-035–US-038), Trip Lifecycle (US-021), Capacity Tracking (MDM-04)

## Non-Functional Requirements

- GPS ping processing latency < 5 seconds end-to-end
- Handle 500+ concurrent active trips with GPS pings
- Geofence evaluation stateless and horizontally scalable

## Definition of Done

- [ ] GPS ping ingestion and Haversine evaluation working
- [ ] Arrival and departure events detected and logged accurately
- [ ] Dwell time calculation correct with threshold breach flagging
- [ ] Events published to Gate Management and trip timeline
- [ ] Capacity update notification on departure
- [ ] Map overlay: live vehicles + POI geofence circles
- [ ] Event log UI (trip timeline, vehicle history, POI log)
- [ ] Unit tests > 85% (geofence math unit tested exhaustively)
- [ ] UAT: End-to-end test with simulated GPS pings triggering arrival/departure events
