---
title: Real-time Map Dashboard (Command Center)
story_id: US-026
phase: phase-1
module: Transport Management
priority: High
status: Pending
epic: Command Center Operations
epic_id: EPIC-015
epic_name: Command Center Operations
sprint: Sprint 7
story_points: 8
created: 2026-02-11
updated: 2026-03-16
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../03-module-specifications/04-poi-operations/command-center.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-021-trip-lifecycle.md
  - US-052-driver-mobile-interface.md
dependencies:
  - US-021-trip-lifecycle.md
tags: [transport, map, realtime, command-center, high-priority]
---

# US-026: Real-time Map Dashboard (Command Center)

## User Story

**As a** Command Center Operator  
**I want to** view all active trips on a real-time map dashboard  
**So that** I can monitor fleet movements, identify issues, and coordinate operations effectively

## Business Context

Command Center is the **nerve center** of fleet operations:
- **Real-time Visibility**: See all vehicles on map
- **Proactive Management**: Identify delays before they escalate
- **Coordination**: Manage multiple trips simultaneously
- **Emergency Response**: Quick action on incidents
- **Customer Service**: Provide accurate ETAs

**Dashboard Features**:
- Live map with vehicle markers
- Trip status indicators
- Geofences (POIs)
- Route visualization
- Alerts and notifications
- Trip filtering and search

### GPS Data Source — Confirmed (16 March 2026)

GPS data is sourced from **GPSWOX** (https://www.gpswox.com/), Nourish's existing VTS platform, via REST API. Hardware on vehicles is **Concox GT06-ND**.

- DFMS polls GPSWOX every 30 seconds via a Celery task and caches results in Redis
- The dashboard reads from Redis — it does not call GPSWOX directly
- GPSWOX API credentials are being obtained by Antu (Nourish GPS Operator)
- See: [`06-contracts/04-integration/meeting-notes/2026-03-16-gpswox-integration.md`](../../06-contracts/04-integration/meeting-notes/2026-03-16-gpswox-integration.md)

---

## Acceptance Criteria

### AC-1: Map Display
- [ ] System SHALL display interactive map (Google Maps / Mapbox) in **terrain view**
- [ ] System SHALL open at an initial zoom level showing approximately **100 km radius** to provide regional fleet visibility
- [ ] System SHALL show all active trips as markers
- [ ] System SHALL update marker positions in real-time (every 30 seconds, sourced from GPSWOX via Redis cache)
- [ ] System SHALL use different marker colors by trip status:
  - 🟢 Green: On-time
  - 🟡 Yellow: Delayed (< 1 hour)
  - 🔴 Red: Critically delayed (> 1 hour)
  - ⚫ Gray: Incident
- [ ] System SHALL show vehicle registration on marker hover

### AC-2: Trip Filtering
- [ ] System SHALL filter trips by:
  - Status (In Transit, Delayed, Incident, etc.)
  - Priority (Critical, High, Normal)
  - Fleet Type (Own Fleet, Vendor)
  - Route (source/destination)
  - Date range
- [ ] System SHALL update map markers based on filters
- [ ] System SHALL show trip count per filter

### AC-3: Trip Details Panel
- [ ] System SHALL show trip details on marker click:
  - Trip ID and TO number
  - Driver name and phone
  - Vehicle registration
  - Current status and location
  - Route (source → destination)
  - Product and quantity
  - Planned vs actual timeline
  - ETA
  - Recent state changes
- [ ] System SHALL allow quick actions from panel:
  - Call driver
  - View full trip details
  - Report incident
  - Update trip status

### AC-4: Geofences (POIs)
- [ ] System SHALL display POI geofences on map
- [ ] System SHALL use different colors for POI types:
  - Warehouse, Depot, Farm, Port
- [ ] System SHALL show POI name on hover
- [ ] System SHALL highlight POI when trip arrives

### AC-5: Route Visualization
- [ ] System SHALL draw route line from source to destination
- [ ] System SHALL show actual path traveled (breadcrumb trail)
- [ ] System SHALL highlight deviations from planned route

### AC-6: Alerts & Notifications
- [ ] System SHALL display alert panel showing:
  - Critical incidents
  - Delayed trips
  - Geofence violations
  - Driver SOS alerts
- [ ] System SHALL play sound for critical alerts
- [ ] System SHALL allow acknowledging alerts
- [ ] System SHALL show alert count badge

### AC-7: Dashboard Statistics
- [ ] System SHALL display summary statistics:
  - Total active trips
  - On-time trips
  - Delayed trips
  - Incidents
  - Completed trips today
  - Fleet utilization %
- [ ] System SHALL update statistics in real-time

### AC-8: GPS Data Handling
- [ ] System SHALL source GPS data from the **GPSWOX platform API** (Nourish's existing VTS provider)
- [ ] GPS data for each active vehicle shall include:
  - Latitude and longitude (decimal degrees, WGS84)
  - Speed (km/h)
  - **Overspeed indicator** (boolean flag from GPSWOX — display only; does not trigger trip state changes)
  - Heading (degrees)
  - Last fix timestamp
- [ ] System SHALL fall back to driver mobile GPS submission if GPSWOX data is unavailable for a vehicle
- [ ] System SHALL handle GPS data frequency of 30 seconds (Celery poll → Redis cache)
- [ ] System SHALL detect GPS signal loss (no update for > 10 minutes)
- [ ] System SHALL show "last seen" timestamp if GPS unavailable
- [ ] System SHALL display overspeed indicator on vehicle marker tooltip when `overspeed = true`

---

## Functional Requirements

### FR-001: Map Integration
- [Critical] Google Maps / Mapbox integration
- [Critical] Real-time marker updates
- [High] Custom marker icons
- [High] Clustering for dense areas

### FR-002: Real-time Data Pipeline
- [Critical] WebSocket connection for live updates
- [Critical] GPS data ingestion from mobile-responsive web interface
- [High] Data caching for performance
- [Medium] Fallback to polling if WebSocket fails

### FR-003: Dashboard UI
- [Critical] Responsive map view
- [Critical] Trip details side panel
- [High] Filter controls
- [High] Alert notification panel
- [Medium] Fullscreen mode

### FR-004: Performance Optimization
- [High] Efficient rendering for 100+ active trips
- [High] Lazy loading of trip details
- [Medium] Map tile caching

---

## Business Rules

### BR-MAP-001: GPS Update Frequency
- GPS data updated every 30 seconds during active trip
- **Enforcement**: Mobile interface configuration

### BR-MAP-002: Delay Classification
- Minor Delay: 30-60 minutes
- Major Delay: 1-3 hours
- Critical Delay: > 3 hours
- **Enforcement**: ETA calculation

### BR-MAP-003: Geofence Radius
- Default geofence radius: 500 meters
- **Enforcement**: POI configuration

### BR-MAP-004: GPS Signal Loss
- If no GPS update for 10 minutes, show "Signal Lost"
- **Enforcement**: Timestamp check

---

## Data Model

```typescript
TripGPSData {
  id: UUID (PK)
  trip_id: UUID (FK)

  latitude: Decimal
  longitude: Decimal
  accuracy: Decimal (meters, nullable)
  speed: Decimal (km/h, nullable)
  overspeed: Boolean (nullable)  // From GPSWOX — display only, Phase 1
  heading: Decimal (degrees, nullable)

  timestamp: Timestamp
  source: Enum (GPSWOX, Mobile_App)  // GPSWOX is primary source; Mobile_App is fallback
  gpswox_device_id: String (nullable)  // GPSWOX device identifier for the vehicle
}

TripMapView {
  // Computed view for map display
  trip_id: UUID
  to_number: String
  driver_name: String
  driver_phone: String
  vehicle_registration: String
  
  current_latitude: Decimal
  current_longitude: Decimal
  last_gps_update: Timestamp
  
  current_status: String
  is_delayed: Boolean
  delay_minutes: Integer
  has_incident: Boolean
  
  source_poi_name: String
  destination_poi_name: String
  route_polyline: String (encoded)
  
  eta: Timestamp
}
```

---

## UI/UX Requirements

### Command Center Dashboard
```
┌──────────────────────────────────────────────────────────────┐
│ DFMS Command Center                          [🔔 3 Alerts]   │
├──────────────────────────────────────────────────────────────┤
│ ┌─ Filters ──────────────────┐ ┌─ Statistics ─────────────┐ │
│ │ Status: [All ▼]            │ │ Active Trips: 45         │ │
│ │ Priority: [All ▼]          │ │ On-Time: 38 (84%)        │ │
│ │ Fleet: [All ▼]             │ │ Delayed: 5 (11%)         │ │
│ │ [Apply Filters]            │ │ Incidents: 2 (4%)        │ │
│ └────────────────────────────┘ │ Completed Today: 120     │ │
│                                 └──────────────────────────┘ │
│                                                              │
│ ┌─ Map View ───────────────────────────────────────────────┐ │
│ │                                                          │ │
│ │  [Map with vehicle markers]                             │ │
│ │  🟢 DM-11-1234 (Bhaluka → Mirpur)                       │ │
│ │  🟡 DM-11-5678 (Delayed 45 min)                         │ │
│ │  🔴 DM-11-9012 (Delayed 2 hours)                        │ │
│ │  ⚫ DM-11-3456 (Incident)                                │ │
│ │                                                          │ │
│ │  [POI Geofences shown as circles]                       │ │
│ │                                                          │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─ Trip Details (Selected: DM-11-1234) ──────────────────┐  │
│ │ Trip: TRIP-20260211-0042                               │  │
│ │ TO: TO-20260211-0042                                   │  │
│ │ Driver: Rahim Ahmed (01711-123456) [📞 Call]           │  │
│ │ Vehicle: DM-11-1234 (Covered Van)                      │  │
│ │                                                        │  │
│ │ Status: In Transit to Destination 🟢                   │  │
│ │ Route: Bhaluka → Mirpur (45 km)                        │  │
│ │ Product: Live Broiler (500 KG)                         │  │
│ │                                                        │  │
│ │ Progress:                                              │  │
│ │ ✅ Departed: 09:45 AM                                  │  │
│ │ 🔵 In Transit: 10:00 AM (Current)                      │  │
│ │ ⏹️ ETA: 11:30 AM (On-time ✓)                          │  │
│ │                                                        │  │
│ │ Last GPS: 2 min ago (GPSWOX)                           │  │
│ │ Speed: 45 km/h  ✓ Normal                               │  │
│ │                                                        │  │
│ │ [View Full Details] [Report Incident]                  │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ ┌─ Alerts ─────────────────────────────────────────────────┐ │
│ │ 🔴 TRIP-0038: Critical Delay (2 hours)      [Acknowledge]│ │
│ │ ⚫ TRIP-0056: Vehicle Breakdown              [View]      │ │
│ │ 🟡 TRIP-0042: Minor Delay (45 min)          [Dismiss]   │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
// Get active trips for map
GET /api/v1/trips/active-map-view
Query: ?status=In_Transit&fleet_type=Own_Fleet
Response: {trips: TripMapView[]}

// WebSocket for real-time updates
WS /api/v1/trips/realtime
Message: {type: 'gps_update', trip_id, latitude, longitude, timestamp}
Message: {type: 'status_change', trip_id, new_status}

// Submit GPS data (from mobile-responsive web interface)
POST /api/v1/trips/{trip_id}/gps
Body: {latitude, longitude, accuracy, speed, heading, timestamp}

// Get trip GPS history (breadcrumb trail)
GET /api/v1/trips/{trip_id}/gps-history
Response: {gps_points: TripGPSData[]}

// Get dashboard statistics
GET /api/v1/command-center/statistics
Response: {
  active_trips, on_time_trips, delayed_trips,
  incidents, completed_today, fleet_utilization
}
```

---

## Testing Scenarios

### Happy Path
1. Operator opens dashboard → Map loads with active trips
2. GPS updates arrive → Markers move in real-time
3. Operator clicks marker → Trip details shown
4. Trip delayed → Marker turns yellow, alert shown

### Edge Cases
1. **100+ active trips**: Map clustering works
2. **GPS signal lost**: Show "last seen" timestamp
3. **WebSocket disconnected**: Fallback to polling
4. **No active trips**: Show empty state message

---

## Deferred Features (Out of Scope — US-026)

The following features were suggested by Sadman (Nourish) in the 16 March 2026 meeting. They are **not in scope for US-026** and require feasibility validation before backlog entry.

### 1. Vehicle Assignment Optimisation
Sort the available vehicle list by real-time distance from the pickup POI at assignment time (using live GPSWOX location data + Haversine distance). Pending GPSWOX API rate limit confirmation.

### 2. Upcoming Vehicle Availability Forecasting
Predict when vehicles currently in transit will become available for new assignments, using GPSWOX location + Maps API ETA + trip state data. Phase 2+ candidate — requires historical dwell time modelling.

> See full feasibility notes in the meeting record: [`06-contracts/04-integration/meeting-notes/2026-03-16-gpswox-integration.md`](../../06-contracts/04-integration/meeting-notes/2026-03-16-gpswox-integration.md)

---

## Dependencies

### Prerequisites
- ✅ US-021: Trip Lifecycle

### Enables
- → Real-time fleet monitoring
- → Proactive issue management
- → Customer ETA updates

---

## Definition of Done
- [ ] Map integration working
- [ ] Real-time marker updates
- [ ] Trip filtering functional
- [ ] Trip details panel
- [ ] GPS data ingestion
- [ ] WebSocket connection
- [ ] Alert notifications
- [ ] Dashboard statistics
- [ ] Performance tested (100+ trips)
- [ ] Unit tests > 80%
- [ ] UAT approved

---

**Story Points**: 8  
**Estimated Hours**: 64 hours  
**Sprint**: Sprint 7  
**Priority**: High

