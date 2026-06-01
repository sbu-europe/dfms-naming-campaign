---
jira_key: DFS-070
jira_type: Story
jira_sprint: "Sprint 5"
story_id: GPS-01
title: Maps Dashboard & GPS Tracking — Live Vehicle Monitoring, POI Geofencing & Dwell Time
epic: GPS & Maps Dashboard
status: New — Sprint 5 Scope
story_points: 21
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
---

# GPS-01 — Maps Dashboard & GPS Tracking

## Context

This story brings the **Map-Based Transport Dashboard** (PRD §6.8.2) and the **GPS tracking / geofencing engine** (PRD §6.5.4–6.5.9) into Sprint 5 as a new scope addition. Both capabilities are classified Phase 1 in the PRD and are foundational for end-to-end trip visibility.

**Role access** (as specified by product):

| Role | Dashboard Access |
|------|-----------------|
| Tenant Admin | Full read access to Maps Dashboard |
| Transport Planner (TP) | Default landing view — own-fleet vehicles, all POIs, all TOs |
| Transport Distribution Officer — Own Fleet (TDO-OF) | Default landing view — own-fleet vehicles |
| Transport Distribution Officer — Vendor Fleet (TDO-VF) | Default landing view — vendor-fleet TOs |

No other role has map dashboard access (RBAC-enforced).

**Out of scope for this story** (remain deferred):
- Driver mobile background location / navigation (later sprint)
- GPS-based vehicle maintenance tracking — PRD §6.5.10 is Phase 2
- Trip route playback / historical track replay (later sprint)
- Trip costing (§6.8.8) — deferred

---

## Business Value

Without a live map view, planners must cross-reference individual TO records to understand fleet position. This dashboard collapses that cognitive load into a single real-time surface, enabling proactive intervention when a vehicle is halted, a geofence dwell threshold is breached, or a trip is running late against planned ETA.

---

## User Stories

> **As a Transport Planner or TDO**, I want a real-time map dashboard showing all active vehicles, linked TOs, and POI geofence boundaries so that I can monitor trip execution without navigating individual order records.

> **As a Tenant Admin**, I want to configure geofence boundaries per POI so that vehicle arrival and departure events are detected automatically.

> **As a Transport Planner or TDO**, I want the system to automatically log vehicle arrival and departure at each POI, calculate dwell time, and flag threshold violations so that I can identify operational bottlenecks.

---

## Acceptance Criteria

### AC-1 — RBAC: Map Dashboard Access
- Dashboard route is accessible only to: `tenant_admin`, `transport_planner`, `tdo_own_fleet`, `tdo_vendor_fleet`.
- All other roles receive HTTP 403 on any `/api/v1/maps/**` endpoint.
- Tenant Admin sees all vehicles and TOs across the tenant; TP and TDOs see vehicles/TOs scoped to their fleet type and tenant.

### AC-2 — Interactive Map View
- Map renders as the **default landing screen** for TP and TDO roles.
- All active POIs appear on the map with name, type label, and geofence circle overlay (radius in meters from POI master data).
- All active own-fleet vehicles with a valid GPS association appear as map markers.
- Vehicle markers are colour-coded or icon-distinguished by **vehicle state** (`Available`, `In-Trip`, `Loading/Unloading`, `Idle`, `Under Maintenance`).
- Vendor-fleet TOs appear visually segregated from own-fleet TOs (different marker style or layer toggle).

### AC-3 — Vehicle Marker Detail
- Each own-fleet vehicle marker exposes on hover/tap:
  - Vehicle registration number
  - Vehicle state
  - Linked TO reference (if any) and TO state
  - Source POI → Destination POI
- Clicking a vehicle marker opens a **context side panel** displaying:
  - Vehicle details (type, capacity, registration)
  - Assigned driver and helper name
  - Current TO state and sub-state
  - Last known GPS timestamp and coordinates
  - "No GPS signal" indicator if last update > 5 minutes ago

### AC-4 — Near Real-Time Location Updates
- Vehicle positions refresh at the configured GPS poll interval (30 s / 60 s / 120 s — configurable per tenant, default 60 s).
- If GPS signal is lost, the vehicle marker shows the **last known position** with a "signal lost" badge; marker does not disappear.
- GPS tracking starts automatically when a TO transitions to `in_transit_source` or `in_transit_destination`.

### AC-5 — POI Geofence Marker
- Each POI marker on the map displays:
  - POI name and type
  - Geofence radius circle (from POI master `geofence_radius_m`)
  - Count of vehicles currently inside the geofence
  - Current activity status summary (`Planned` / `Loading` / `Unloading` / `Idle`)
- Vehicles entering or exiting a POI geofence are **visually identifiable** (marker changes state while inside fence).

### AC-6 — TO-Centric Map View
- User can switch to a **TO-centric view** (filter by TO reference).
- Selected TO shows:
  - Source POI → Destination POI route line on map
  - Current vehicle position along the route
  - TO ID, transfer type, planned vs actual ETA, assigned vehicle and driver

### AC-7 — KPI Widget Bar
Dashboard displays four summary widgets:

| Widget | Source |
|--------|--------|
| Active TOs | Count of TOs in `dispatched` / `in_transit_*` / `at_source` / `at_destination` |
| Vehicles in Transit | Vehicles with TO in `in_transit_source` or `in_transit_destination` |
| Idle Vehicles | Vehicles with state `Idle` > configurable idle threshold (default 30 min) |
| Halted TOs | TOs flagged as halted (future: §6.8.6 incident; Sprint 5: flag via manual TO status or dwell threshold) |

### AC-8 — Geofence Event Logging
- System automatically detects vehicle entry and exit from each active POI geofence using GPS coordinates vs haversine distance to POI centroid.
- On **entry**: `GeofenceEvent` logged with `event_type = ARRIVED`, `vehicle_id`, `poi_id`, `trip_id` (if active), `to_id`, `timestamp`.
- On **exit**: `GeofenceEvent` logged with `event_type = DEPARTED`, paired with the corresponding ARRIVED event.
- Geofence events are visible in the TO timeline (TLS-01 integration — see AC-11).

### AC-9 — Dwell Time Calculation
- Dwell time = `DEPARTED.timestamp − ARRIVED.timestamp` per POI per trip.
- Dwell time is stored on the `GeofenceEvent` pair and surfaced via API.
- If dwell time exceeds the configured POI-level threshold (default 4 hours, configurable per tenant), a `DWELL_THRESHOLD_EXCEEDED` event is raised and the TO is flagged on the dashboard (visual badge on vehicle marker and TO card).
- Dwell time threshold can be set in the admin panel per POI (`DwellTimeThreshold` model, nullable — falls back to tenant default if not set).

### AC-10 — GPS/VTS Provider Integration
- System integrates with a third-party GPS/VTS provider via a configurable REST adapter.
- Location data pulled every `gps_poll_interval_seconds` (configurable, default 60, valid range 30–120).
- Provider adapter maps incoming device payload to internal `VehicleGPSSnapshot` schema: `vehicle_id`, `lat`, `lng`, `speed_kmh`, `heading_deg`, `signal_quality`, `device_timestamp`, `ingested_at`.
- GPS data is linked to `vehicle_id` via the vehicle master `gps_device_id` field.
- Multiple provider adapters are supported via a pluggable adapter pattern (provider name configured in tenant settings).

### AC-11 — TLS-01 Timeline Integration
- Geofence events are emitted to the TO timeline (`TOStatusTransitionLog` or equivalent GPS event log) within the same atomic write as the `GeofenceEvent` record:
  - `GPS_ARRIVED_SOURCE` — vehicle arrives at source POI
  - `GPS_DEPARTED_SOURCE` — vehicle departs source POI
  - `GPS_ARRIVED_DESTINATION` — vehicle arrives at destination POI
  - `GPS_DEPARTED_DESTINATION` — vehicle departs destination POI
  - `DWELL_THRESHOLD_EXCEEDED` — dwell time breached configured limit
- These events appear in `GET .../timeline` alongside other TO lifecycle events (TLS-01-7).

### AC-12 — Admin: Geofence Configuration
- Tenant Admin can update the `geofence_radius_m` on a POI record (50–1000 m, validated).
- Radius changes take effect **immediately** for all live trips — no service restart required.
- Admin can set `dwell_time_threshold_minutes` per POI in the POI admin panel.
- Only Tenant Admin can modify geofence or dwell threshold configuration (RBAC enforced).
- Geofence radius change is audit-logged (actor, old value, new value, timestamp).

---

## Sub-tasks

| # | Sub-task | Description | Priority |
|---|----------|-------------|----------|
| GPS-01-1 | GPS/VTS provider adapter | Implement pluggable `GPSProviderAdapter` base class + configurable REST polling task (Celery beat, `gps_poll_interval_seconds`). Writes `VehicleGPSSnapshot` records. Map provider payload to internal schema via tenant-configured field mapping. | High |
| GPS-01-2 | `VehicleGPSSnapshot` model | Django model: `vehicle` FK, `lat`, `lng`, `speed_kmh`, `heading_deg`, `signal_quality`, `device_timestamp`, `ingested_at`. DB index on `(vehicle_id, device_timestamp)`. `GPSSnapshotAdmin` (read-only). | High |
| GPS-01-3 | Geofence engine | Celery task triggered on each new `VehicleGPSSnapshot` batch. Haversine distance check against all active POI centroids. Emits `GeofenceEvent` on state transitions (outside → inside = ARRIVED; inside → outside = DEPARTED). Stateful: per-vehicle, per-POI presence flag cached in Redis. | High |
| GPS-01-4 | `GeofenceEvent` model | Django model: `vehicle` FK, `poi` FK, `trip` FK (nullable), `transport_order` FK (nullable), `event_type` (ARRIVED/DEPARTED/DWELL_EXCEEDED), `timestamp`, `dwell_seconds` (null until departure). `GeofenceEventAdmin` (read-only, filtered by POI / TO). | High |
| GPS-01-5 | Dwell time calculation + threshold alert | On DEPARTED event: compute `dwell_seconds`, update paired ARRIVED `GeofenceEvent`. Separate Celery periodic task checks open arrivals every 5 min — raises `DWELL_THRESHOLD_EXCEEDED` if `now − arrived_at > poi.dwell_threshold_minutes`. | High |
| GPS-01-6 | Maps Dashboard API | `GET /api/v1/maps/dashboard` — returns: active vehicle snapshots (latest GPS position per vehicle with state/TO context), POI list with geofence radius and current vehicle count, KPI widget counts (active TOs, in-transit, idle, halted). RBAC: tenant_admin / transport_planner / tdo_*. | High |
| GPS-01-7 | Vehicle context panel API | `GET /api/v1/maps/vehicles/{vehicle_id}/panel` — vehicle details, driver/helper, current TO state + sub_state, last GPS snapshot, geofence presence status. Returns `signal_lost: true` if last snapshot > 5 min ago. | High |
| GPS-01-8 | TO-centric route API | `GET /api/v1/maps/transport-orders/{to_id}/route` — source and destination POI coordinates, current vehicle lat/lng, TO ID/state/ETA. Used for TO-centric map view overlay. | Medium |
| GPS-01-9 | Geofence event list API | `GET /api/v1/maps/transport-orders/{to_id}/geofence-events` — ordered geofence events for a TO (arrival, departure, dwell exceeded) with timestamps and dwell durations. Also surfaced via TLS-01 timeline. | Medium |
| GPS-01-10 | RBAC enforcement | `MapsDashboardPermission` enforces tenant_admin / transport_planner / tdo_own_fleet / tdo_vendor_fleet on all `/api/v1/maps/**` routes. Unit tests: 403 for gateman, driver, QC, scaling_operator, vendor roles. | High |
| GPS-01-11 | TLS-01 timeline integration | On each `GeofenceEvent` write, emit the corresponding GPS timeline event to `TOStatusTransitionLog` (source_module=`gps_engine`, actor=`system`). Atomic with the `GeofenceEvent` insert. Verify events appear in `GET .../timeline` (TLS-01-7). | High |
| GPS-01-12 | Admin: geofence & dwell config | `POIAdmin` extension — expose `geofence_radius_m` (50–1000 m, validated) and `dwell_time_threshold_minutes` (nullable integer). Audit log on change (`PoiGeofenceAuditLog`). Tenant Admin only. | Medium |
| GPS-01-13 | E2E test coverage | Validate: vehicle GPS ingestion → geofence entry detection → ARRIVED event logged → TLS timeline updated → dwell threshold exceeded event raised → dashboard API reflects vehicle-in-geofence count → context panel returns last GPS position. Role access: TP and TDO see dashboard; gateman receives 403. | Medium |

---

## Data Models

### `VehicleGPSSnapshot`
```
vehicle_id          FK → Vehicle
lat                 DecimalField(max_digits=9, decimal_places=6)
lng                 DecimalField(max_digits=9, decimal_places=6)
speed_kmh           FloatField(null=True)
heading_deg         FloatField(null=True)          # 0–360
signal_quality      CharField(choices=[GOOD, WEAK, LOST])
device_timestamp    DateTimeField()                # from GPS provider
ingested_at         DateTimeField(auto_now_add=True)

Index: (vehicle_id, device_timestamp DESC)
```

### `GeofenceEvent`
```
vehicle_id          FK → Vehicle
poi_id              FK → POI
transport_order_id  FK → TransportOrder (null=True)
trip_id             FK → Trip (null=True)
event_type          CharField(choices=[ARRIVED, DEPARTED, DWELL_EXCEEDED])
timestamp           DateTimeField()
dwell_seconds       IntegerField(null=True)        # populated on DEPARTED
paired_event_id     FK → GeofenceEvent (null=True) # DEPARTED links back to ARRIVED

Index: (vehicle_id, poi_id, timestamp DESC)
Index: (transport_order_id, timestamp)
```

### `PoiGeofenceAuditLog`
```
poi_id              FK → POI
actor_id            FK → User
changed_field       CharField   # geofence_radius_m | dwell_time_threshold_minutes
old_value           CharField
new_value           CharField
timestamp           DateTimeField(auto_now_add=True)
```

---

## API Reference

### `GET /api/v1/maps/dashboard`
**Permission**: `MapsDashboardPermission`

Response shape:
```json
{
  "kpis": {
    "active_tos": 12,
    "vehicles_in_transit": 8,
    "idle_vehicles": 3,
    "halted_tos": 1
  },
  "vehicles": [
    {
      "vehicle_id": "uuid",
      "registration": "DHAKA-1234",
      "lat": 23.8103,
      "lng": 90.4125,
      "vehicle_state": "In-Trip",
      "to_id": "uuid",
      "to_state": "in_transit_destination",
      "source_poi": { "id": "uuid", "name": "Gazipur Depot", "lat": ..., "lng": ... },
      "destination_poi": { "id": "uuid", "name": "Chittagong Feed Mill", "lat": ..., "lng": ... },
      "signal_lost": false,
      "last_updated": "2026-06-10T09:42:00Z"
    }
  ],
  "pois": [
    {
      "poi_id": "uuid",
      "name": "Gazipur Depot",
      "type": "Finished Feed Depot",
      "lat": 23.99,
      "lng": 90.41,
      "geofence_radius_m": 200,
      "vehicles_inside": 2,
      "activity_status": "Loading"
    }
  ]
}
```

### `GET /api/v1/maps/vehicles/{vehicle_id}/panel`
**Permission**: `MapsDashboardPermission`

Returns vehicle detail, driver/helper, current TO state, last GPS snapshot. `signal_lost: true` if `ingested_at` > 5 minutes ago.

### `GET /api/v1/maps/transport-orders/{to_id}/route`
**Permission**: `MapsDashboardPermission`

Returns source POI coords, destination POI coords, current vehicle lat/lng, TO summary fields (id, state, planned_eta, actual_eta, vehicle_registration, driver_name).

### `GET /api/v1/maps/transport-orders/{to_id}/geofence-events`
**Permission**: `MapsDashboardPermission`

Returns ordered list of geofence events for the TO. Each event includes: `event_type`, `poi_name`, `timestamp`, `dwell_seconds` (if applicable).

---

## Geofence Engine Logic

```
For each incoming VehicleGPSSnapshot batch:
  For each active POI with geofence_radius_m:
    distance = haversine(vehicle.lat, vehicle.lng, poi.lat, poi.lng)
    was_inside = redis.get(f"geofence:{vehicle_id}:{poi_id}") == "inside"
    is_inside  = distance <= poi.geofence_radius_m

    if not was_inside and is_inside:
      create GeofenceEvent(ARRIVED, vehicle, poi, active_to, timestamp=now)
      emit TLS timeline event GPS_ARRIVED_* (atomic)
      redis.set(f"geofence:{vehicle_id}:{poi_id}", "inside")

    elif was_inside and not is_inside:
      arrived_event = GeofenceEvent.objects.latest_arrived(vehicle, poi)
      dwell = (now - arrived_event.timestamp).seconds
      create GeofenceEvent(DEPARTED, dwell_seconds=dwell, paired=arrived_event)
      emit TLS timeline event GPS_DEPARTED_* (atomic)
      redis.delete(f"geofence:{vehicle_id}:{poi_id}")

Dwell threshold check (Celery beat, every 5 min):
  open_arrivals = GeofenceEvent.objects.filter(event_type=ARRIVED, paired_event=None)
  for event in open_arrivals:
    threshold = event.poi.dwell_time_threshold_minutes or tenant.default_dwell_threshold_minutes
    if (now - event.timestamp).seconds // 60 > threshold:
      create GeofenceEvent(DWELL_EXCEEDED)
      emit TLS timeline event DWELL_THRESHOLD_EXCEEDED (atomic)
```

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| POI Master Data (§6.5.1) | GPS-01 reads | `geofence_radius_m` and `lat/lng` must exist on all active POIs — already implemented Sprint 4 |
| TLS-01 (timeline) | GPS-01 emits → TLS-01 | `GPS_ARRIVED_*`, `GPS_DEPARTED_*`, `DWELL_EXCEEDED` events land in `TOStatusTransitionLog` via TLS-01-7 service |
| Vehicle Master (§6.6.1) | GPS-01 reads | `gps_device_id` field links vehicle to GPS provider device — must be populated for tracking to activate |
| Redis | GPS-01 writes/reads | Geofence presence state cached per (vehicle, POI) |
| Celery Beat | GPS-01 | GPS polling task + dwell threshold checker — must be configured in `CELERYBEAT_SCHEDULE` |
| GPS/VTS Provider | External | Tenant must configure provider credentials in tenant settings before GPS-01-1 activates |

---

## Integration & Timing Notes

- **GPS tracking is read-only** for all users — no role can mutate GPS data via the platform.
- GPS polling only activates for vehicles with a valid `gps_device_id` set in vehicle master data.
- The geofence engine processes snapshots asynchronously (Celery worker); dashboard API always serves from the latest snapshot row — no blocking on GPS provider response time.
- The map frontend should use long-polling or a SSE endpoint for live updates; SSE implementation is noted as a future enhancement — Sprint 5 delivers REST-based polling with a frontend refresh timer.

---

## Definition of Done

- [ ] `VehicleGPSSnapshot` model + admin (read-only) in place; GPS polling Celery task functional against mock provider (GPS-01-1, GPS-01-2)
- [ ] Geofence engine detects entry/exit, writes `GeofenceEvent`, updates Redis presence flag (GPS-01-3, GPS-01-4)
- [ ] Dwell time computed on departure; periodic task raises `DWELL_EXCEEDED` on open arrivals past threshold (GPS-01-5)
- [ ] `GET /api/v1/maps/dashboard` returns vehicles, POIs with geofence overlay, KPI counts (GPS-01-6)
- [ ] `GET /api/v1/maps/vehicles/{id}/panel` returns full vehicle context, `signal_lost` flag (GPS-01-7)
- [ ] `GET /api/v1/maps/transport-orders/{id}/route` returns source/destination coords + current vehicle position (GPS-01-8)
- [ ] `GET /api/v1/maps/transport-orders/{id}/geofence-events` returns ordered geofence event history (GPS-01-9)
- [ ] All `/api/v1/maps/**` routes return 403 for non-authorised roles; tenant_admin, TP, TDO-OF, TDO-VF have access (GPS-01-10)
- [ ] GPS geofence events appear in TO timeline via TLS-01-7 `GET .../timeline` endpoint (GPS-01-11)
- [ ] Tenant Admin can update `geofence_radius_m` and `dwell_time_threshold_minutes` on POI admin; change is audit-logged (GPS-01-12)
- [ ] E2E sub-task GPS-01-13 passes in staging
- [ ] UAT: TP user navigates to map dashboard, sees active vehicle markers and POI geofence overlays, clicks vehicle and views side panel, KPI widgets reflect accurate counts
- [ ] UAT: Gateman user receives 403 on map dashboard access attempt

---

*Epic: GPS & Maps Dashboard | Phase: 1 | Sprint: 5 | Story Points: 21 | PRD: §6.5.4–6.5.9, §6.8.2, §9.1–9.2 | Jira: DFS-070 | Last Updated: 2026-06-01*
