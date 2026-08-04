---
module: 09-tracking
specification: PRD §6.5.4–6.5.10 as-built matrix
version: 1.0
phase: Phase 1 (+ Phase 2 stub for 6.5.10)
last_updated: 2026-07-24
ssot: true
code_verified: 2026-07-24
---

# GPS Tracking — PRD ↔ As-Built Matrix (SSOT)

Canonical mapping of **PRD_DFMS_v1.0** GPS sections to **nourish-backend** implementation.

**Status values:** Done | Partial | Missing | N/A (Phase 2)

**Primary code:** `apps/tracking/`, `services/gt06-ingest/`, `apps/master_data` (POI/Vehicle), `apps/transport` (TO/Trip)

---

## §6.5.4 — Map Layer Integration (TO + Live GPS)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| POI integrated with TO creation (source/destination) | **Done** | `TransportOrder.origin_poi` / `destination_poi` (`apps/transport/models.py`); copied from TR on create |
| Live GPS: all active POIs on map | **Done** | `LiveMapService._map_pois_payload()` — active geocoded POIs |
| Geofencing boundaries as colored zones | **Done** | Live-map POI payload + Leaflet circles (`static/tracking/js/live-gps-app.js`) |
| Vehicle positions relative to POIs | **Done** | Vehicle lat/lng + `inside_pois` / `inside_geofence` on live-map rows |
| Active trips with source/destination POIs highlighted | **Partial** | Live-map row includes `origin_poi` / `destination_poi`; full Maps Dashboard highlight UX (`/api/v1/maps/**`) not built — see [maps-surfaces.md](maps-surfaces.md) |
| Enter geofence → Arrival event | **Done** | `GeofenceEventType.ENTRY` via `GeofenceService` |
| Exit geofence → Departure event | **Done** | `GeofenceEventType.EXIT` |
| Dwell = duration arrival→departure | **Done** | `dwell_minutes` on EXIT; `build_dwell_timeline()` GPS tier |
| Vehicles currently within each POI (presence list) | **Partial** | Inverse only (vehicle → `inside_pois`); no POI→vehicles + entry time + duration API |
| Vehicle entry time + duration at POI (live) | **Partial** | Redis presence stores entry for dwell-on-exit; live-map `inside_pois` is id/code/name only |

---

## §6.5.5 — GPS Tracking & Monitoring

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Each vehicle uniquely identifiable | **Done** | `registration_number` unique; `gps_tracker_id` (IMEI) indexed |
| Vehicle lifecycle dates end-to-end | **Partial** | Master dates / `operational_status` exist; not GPS-derived lifecycle |
| Live vehicle location on map | **Done** | `GET /api/v1/tracking/live-map/` + `/admin/tracking/live-gps/` |
| GPS from integrated IoT/GPS providers | **Done** (GT06) | `services/gt06-ingest/`; GPSWOX adapter **deferred** |
| Configurable refresh (30/60/120s) | **Partial** | `LIVE_MAP_REFRESH_SECONDS = 10` hardcoded; trail interval env-configurable; not user-selectable 30/60/120 |
| GPS read-only for all users | **Partial** | Admin GPS/geofence read-only; `POST /location/` + device-command writes exist |
| Last known location if signal lost | **Done** | Redis → Postgres fallback; `signal_lost` after `SIGNAL_LOST_MINUTES` (10) |
| Tracking 24/7 | **Done** | Continuous ingest + idle (no-trip) sync path |
| Utilization / ops metrics per vehicle for TO | **Partial** | `TripActivitySegment` (km, engine hours, speed); no GPS utilization dashboard |
| Vehicle cannot be deleted once used in a trip | **Done** | `Trip.vehicle` `on_delete=PROTECT` + hard-delete dependency gate |
| Associate GPS with vehicle ID, TO ID, Trip ID | **Partial** | `GPSTracking`: vehicle + trip (nullable idle); no direct TO FK. `GeofenceEvent`: vehicle + trip + TO + POI. Live-map resolves TO via trip |

**Critical FRs:** third-party secure API (GT06 TCP + ingest HTTP) — **Done**; real-time map — **Done**; link vehicle/TO/trip — **Partial** as above.

---

## §6.5.6 — Geofencing and POI Tracking

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Configurable radius-based geofence | **Done** | `POI.geofence_radius_meters` (default 200) + detection buffer |
| Entry/exit automatically logged | **Done** | `GeofenceEvent` |
| Dwell from entry/exit timestamps | **Done** | EXIT `dwell_minutes`; timeline GPS tier |
| Geofence radius configurable per POI | **Done** | POI admin / master field |
| Geofence events linked to TO ID | **Done** | `GeofenceEvent.transport_order` |
| Geofence for all active POIs (engine) | **Partial** | Map shows all active POIs; **engine evaluates TO origin + destination only** — see [geofence-and-dwell.md](geofence-and-dwell.md) |
| Flag dwell threshold violations for reporting | **Partial** | Field removed; TO admin `dwell_exceeded` vs **planned** dwell; no exception reporting pipeline |

---

## §6.5.7 — POI Geofencing Boundary Management

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Admin defines radius (meters) | **Done** | `POIAdmin` geolocation fieldset |
| One active geofence per POI | **Done** | Single circle field on POI |
| Linked to POI master | **Done** | Field on `master_data.POI` |
| Changes take effect immediately | **Done** | Eval / live-map read current DB radius (no radius cache) |
| Only Admin / authorized config users | **Partial** | Requires `MasterData.POI.Write`; no dedicated geofence PATCH + audit |

---

## §6.5.8 — Vehicle Arrival Tracking at POI

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Detect entry into POI geofence | **Done** | `GeofenceService` Haversine |
| Arrival timestamp logged | **Done** | `GeofenceEvent.event_at` (ENTRY) |
| Linked to Trip, TO, POI | **Done** | FKs on `GeofenceEvent` |
| Visible in trip timeline | **Partial** | History summary + dwell timeline + geofence-events API; **TLS-01 timeline emission deferred** |
| GPS-provider dependent | **Done** | Driven by GT06 (or POST /location) cadence |
| Auto trip status (extra) | **Done** | `ARRIVED_AT_SOURCE` / `ARRIVED_AT_DESTINATION` on origin/dest entry |

---

## §6.5.9 — Dwell Time Tracking

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Log arrival and departure | **Done** | ENTRY / EXIT |
| Auto-calculate dwell | **Done** | Exit calc + `dwell_timeline_service` |
| Visible in trip and POI reports | **Partial** | TO admin + history APIs; no dedicated POI aggregation report |
| Exception if dwell exceeds configured threshold | **Partial** | Planned-dwell exceed flag in TO admin; no configurable geofence dwell threshold alerts |

---

## §6.5.10 — GPS-Based Vehicle Maintenance (Phase 2)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Distance from GPS odometer, since last service, remaining, thresholds, usage indicators | **Missing (Phase 2)** | See [gps-maintenance-phase2.md](gps-maintenance-phase2.md). Current maintenance is supervisor/DS-01, not GPS-driven. |

---

## API surface (as built)

Prefix: `/api/v1/tracking/`

| Method | Path | Role |
|--------|------|------|
| GET | `live-map/` | Fleet + POIs + trails |
| GET | `geofence-events/` | ENTRY/EXIT history |
| GET | `geofence-check/` | Point-in-circle |
| POST | `location/` | Driver stub (not Live GPS primary path) |
| POST | `device-command/` | Relay/custom to ingest |
| GET | `vehicle-history/` | Chart points |
| GET | `vehicle-history-summary/` | Activity + `dwell_timeline` |
| GET | `vehicle-to-history/` | TO list for a vehicle/window |
| GET | `vehicle-idle-summary/` | Idle activity |
| GET | `vehicle-idle-history/` | Idle history |

SSR: `GET /admin/tracking/live-gps/`

**Not built:** `/api/v1/maps/**` (GPS-05 product surface).

---

## Related SSOT docs

- Architecture: [gt06-server.md](gt06-server.md)
- Rules: [geofence-and-dwell.md](geofence-and-dwell.md)
- Surfaces: [maps-surfaces.md](maps-surfaces.md)
- Module index: [README.md](README.md)
