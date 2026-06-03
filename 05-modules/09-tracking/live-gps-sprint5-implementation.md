---
module: 09-tracking
specification: GPS-01 — Live GPS & GT06 ingest (Sprint 5 MVP)
version: 1.0
phase: Phase 1
sprint: Sprint 5
last_updated: 2026-06-02
related_stories: GPS-01 (DFS-070)
status: Implemented (MVP)
code_root: apps/tracking
service_root: services/gt06-ingest
---

# GPS-01 — Live GPS & GT06 Tracking (Implementation)

## Executive summary

Sprint 5 delivers a **tenant-scoped Live GPS MVP** inside the DFMS Django admin shell: a read-only map of vehicles on **active trips** with latest GPS position, short trail polyline, and live vs signal-lost status. Location data can enter via **GT06 device ingest** (Concox protocol sidecar) or **demo seeding**; production GPSWOX REST polling remains deferred.

This document is the **product + engineering reference** for what exists in the repository as of June 2026.

| Track | Sprint 5 status |
|-------|-----------------|
| Live GPS admin page + API | **Done** |
| `GPSTracking` model + migration | **Done** |
| GT06 ingest service + Celery sync | **Done** |
| Map SDK (OpenStreetMap / Leaflet) | **Done** (AC-S5-2 recommendation: OSM for dev) |
| Geofence engine / dwell / TLS timeline | **Deferred** |
| Full maps dashboard API surface | **Deferred** |

---

## Architecture

### End-to-end data flow

```text
┌─────────────────┐     TCP :5023      ┌──────────────────┐
│ GT06 device     │ ─────────────────► │ gt06-ingest      │
│ (IMEI login)    │                    │ (sidecar)        │
└─────────────────┘                    └────────┬─────────┘
                                                │ write latest
                                                ▼
                                       ┌──────────────────┐
                                       │ Redis db 3       │
                                       │ (per IMEI key)   │
                                       └────────┬─────────┘
                                                │
                    Celery beat 30s             │ sync_gt06_locations
                    tracking.sync_gt06_*        ▼
┌─────────────────┐                    ┌──────────────────┐
│ Driver app      │ POST location      │ Django tenant    │
│ (future)        │ ─────────────────► │ apps/tracking    │
└─────────────────┘                    │ GPSTracking rows │
                                       └────────┬─────────┘
                                                │
         GET /api/v1/tracking/live-map/         │ LiveMapService
         (session auth + RBAC)                  ▼
                                       ┌──────────────────┐
                                       │ Live GPS page    │
                                       │ Leaflet map UI   │
                                       └──────────────────┘
```

### Layering (Django)

| Layer | Responsibility |
|-------|----------------|
| `services/gt06-ingest/` | TCP protocol server, Redis writer, optional HTTP read API |
| `apps/tracking/gt06_store.py` | Redis reader (`Gt06RedisReader`) |
| `apps/tracking/sync_service.py` | Map IMEI → `Vehicle.gps_tracker_id`, active `Trip` → `GPSTracking` |
| `apps/tracking/live_map_service.py` | Aggregate latest position + trail for map JSON |
| `apps/tracking/views.py` | DRF: `LiveMapView`, `LocationUpdateView` |
| `apps/tracking/portal_views.py` | SSR admin page `live_gps_page` |
| `templates/admin/tracking/live_gps.html` | Leaflet UI, vehicle list, polling |

---

## Data model

### `GPSTracking` (tenant schema, table `gps_tracking`)

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | PK |
| `trip_id` | FK → `transport.Trip` | CASCADE |
| `vehicle_id` | FK → `master_data.Vehicle` | CASCADE |
| `latitude`, `longitude` | Decimal(10,7) | WGS84 |
| `altitude_m`, `speed_kmh`, `heading_degrees` | Optional telemetry |
| `recorded_at` | DateTime | Device timestamp (indexed) |
| `device_id` | Char | IMEI / device id from ingest |
| `is_geofence_event` | Boolean | Reserved for future geofence engine |

**Migration:** `apps/tracking/migrations/0001_initial_gpstracking.py` — apply on all tenant schemas via `migrate_schemas`.

### Master data linkage

| Entity | Field | Rule |
|--------|-------|------|
| `Vehicle` | `gps_tracker_id` | Must match GT06 login IMEI for sync |
| `Trip` | `status` | Must be in `TRACKABLE_TRIP_STATUSES` (see `apps/tracking/constants.py`) |
| `Trip` | `vehicle_id` | Vehicle on active trip receives GPS rows |

**Important:** Vehicles without an active trackable trip **do not appear** on Live GPS, even if GPS rows exist.

### Trackable trip statuses

Includes dispatched, en route, yard steps (gate/scale/loading/QC), unloading, etc. Excludes completed/cancelled. Full list in `TRACKABLE_TRIP_STATUSES` in `apps/tracking/constants.py`.

---

## APIs

### `GET /api/v1/tracking/live-map/`

| Property | Value |
|----------|--------|
| Auth | Session (admin browser) or JWT with tenant context |
| Permissions | `IsTenantUser` + `CanViewLiveGps` (`Menu.LiveGps.View`) |
| Tenant admin bypass | `is_tenant_admin` / `is_super_admin` allowed without explicit menu grant (aligned with SSR page) |

**Response shape:**

```json
{
  "success": true,
  "refreshed_at": "2026-06-02T14:00:00+00:00",
  "refresh_interval_seconds": 30,
  "signal_lost_minutes": 10,
  "vehicle_count": 1,
  "vehicles": [
    {
      "trip_id": "uuid",
      "trip_number": "TRIP-…",
      "trip_status": "en_route_to_destination",
      "trip_status_label": "En Route to Destination",
      "transport_order_id": "uuid",
      "to_number": "TO-…",
      "vehicle_id": "uuid",
      "registration_number": "DH-01-GPS-TEST",
      "driver_name": "…",
      "latitude": 23.8103,
      "longitude": 90.4125,
      "speed_kmh": 40.0,
      "heading_degrees": 90,
      "recorded_at": "2026-06-02T13:00:00+00:00",
      "device_id": "353419032348877",
      "connection_status": "live",
      "trail": [[23.81, 90.41], [23.8107, 90.4125]]
    }
  ]
}
```

| Rule | Detail |
|------|--------|
| `connection_status` | `live` if `recorded_at` within last **10 minutes**; else `signal_lost` |
| `trail` | Up to 30 points, chronological, min **60s** gap on persist (sync + driver API) |
| Empty list | Valid — no active trip with GPS coordinates |

### `POST /api/v1/tracking/location/`

Driver-app ingestion stub (Sprint 5 foundation). Creates `GPSTracking` and queues `evaluate_geofence` Celery task (geofence logic minimal/deferred).

---

## Admin UI — Live GPS

| Item | Value |
|------|--------|
| URL | `/admin/tracking/live-gps/` |
| Menu | Overview → **Live GPS** (`portal_navigation.py`, permission `Menu.LiveGps.View`) |
| Template | `templates/admin/tracking/live_gps.html` |
| Map | Leaflet 1.9 + OpenStreetMap tiles |
| Layout | DFMS admin shell (sidebar, topbar, breadcrumbs) via `admin.site.each_context` |
| Refresh | Client polls API every **30s** |
| Vehicle list | Left panel; click focuses marker + popup |
| Marker | Custom PNG `static/tracking/ship_11509526.png` (landscape, cab left; heading rotation `heading - 90°`) |
| Trail | Purple polyline; outlier segments filtered client-side (>15 km segment, >25 km from anchor) |

**Platform schema:** `live_gps_page` redirects to `/admin/` (tenant-only feature).

---

## RBAC

| Code | Usage |
|------|--------|
| `Menu.LiveGps.View` | Menu item + API `CanViewLiveGps` |
| Seeded roles | Tenant Admin, Transport Planner, TDO variants (see `apps/core/role_seed_data.py`) |

**SSR gate** (`portal_views._can_view_live_gps`): tenant admin, super admin, or `Menu.LiveGps.View`.

**API gate** (`permissions.CanViewLiveGps`): same as SSR (tenant/super admin bypass + permission check).

---

## GT06 ingest sidecar

| Item | Detail |
|------|--------|
| Path | `services/gt06-ingest/` |
| Docker service | `gt06-ingest` in root `docker-compose.yml` |
| TCP | Port **5023** (device connections) |
| HTTP API | Port **8080** (optional latest-location read) |
| Redis | Database **3**, keys per IMEI (`GT06_REDIS_URL`) |

### Celery

| Task | Schedule |
|------|----------|
| `tracking.sync_gt06_all_tenants` | Every 30s (beat) |
| `tracking.evaluate_geofence` | On demand (location POST) |

**Management command:** `python manage.py sync_gt06_locations --schema=<tenant>`

---

## Configuration constants

| Constant | Default | File |
|----------|---------|------|
| `SIGNAL_LOST_MINUTES` | 10 | `apps/tracking/constants.py` |
| `LIVE_MAP_REFRESH_SECONDS` | 30 | UI + API payload |
| `GT06_SYNC_INTERVAL_SECONDS` | 30 | Celery beat |
| `GPS_TRAIL_MIN_INTERVAL_SECONDS` | 60 | Sync deduplication |

Environment (Docker): `GT06_REDIS_URL` on `web` and `celery_worker` (see `docker-compose.yml`).

---

## Local development workflow

### Prerequisites

```bash
docker compose up -d db redis web celery_worker celery_beat gt06-ingest
```

Apply migrations (includes `gps_tracking` on tenant schemas):

```bash
docker compose exec web python manage.py migrate_schemas --noinput
```

### Demo data (minimal path)

1. **POI** — at least one active POI (origin/destination for transport).
2. **Vehicle** — `gps_tracker_id` = demo IMEI `353419032348877` (see seed default).
3. **Trip** — active trip on that vehicle (trackable status). If none, create TO + trip or use shell from `LIVE_GPS.md`.
4. **Seed GPS:**

```bash
docker compose exec web python manage.py seed_live_gps_demo --schema=nourish
```

5. Open **Overview → Live GPS** as tenant admin.

### Optional live simulator

```bash
cd services/gt06-ingest && python scripts/fake_gt06_client.py --host 127.0.0.1 --port 5023 --locations 10
docker compose exec web python manage.py sync_gt06_locations --schema=nourish
```

Developer notes: [`apps/tracking/LIVE_GPS.md`](../../../apps/tracking/LIVE_GPS.md).

---

## Tests

| File | Coverage |
|------|----------|
| `tests/unit/test_tracking/test_live_map.py` | `LiveMapService` payload, API permissions, portal nav includes `live_gps` |

---

## Known limitations (Sprint 5)

| Limitation | Notes |
|------------|-------|
| No POI markers on Live GPS map | POI master data not layered yet (deferred) |
| No geofence circles | `POI.geofence_radius_meters` not rendered |
| No production GPSWOX client | GT06 path + demo seed only |
| Trip required | Master-only vehicle does not show |
| Trail quality | Depends on ingest frequency; demo trail is short northbound path in Dhaka |
| HTTP local dev | COOP console warning on non-HTTPS custom host; harmless |
| `evaluate_geofence` | Stub — no TLS-01 events yet |

---

## File index (implementation)

| Area | Paths |
|------|--------|
| App config | `apps/tracking/apps.py` (admin URL registration) |
| Models | `apps/tracking/models.py` |
| Services | `apps/tracking/live_map_service.py`, `sync_service.py`, `gt06_store.py` |
| API | `apps/tracking/views.py`, `urls.py`, `permissions.py` |
| SSR | `apps/tracking/portal_views.py` |
| UI | `templates/admin/tracking/live_gps.html` |
| Static | `static/tracking/ship_11509526.png` |
| Commands | `seed_live_gps_demo`, `sync_gt06_locations` |
| Migrations | `apps/tracking/migrations/0001_initial_gpstracking.py` |
| RBAC | `apps/core/constants_rbac.py` (`Menu.LiveGps.View`), `role_seed_data.py` |
| Nav | `apps/core/portal_navigation.py` |
| Sidecar | `services/gt06-ingest/**` |
| Config | `config/urls.py` (`tracking/`), `config/settings/base.py` (Celery beat) |

---

## Related product references

- PRD map/GPS sections cited in [GPS-01 story](../../03-backlog/sprints/sprint-5/12-gps-maps-dashboard/GPS-01-maps-dashboard-gps-tracking.md)
- Integration contract: [gps-vts-integration.yaml](../../06-contracts/04-integration/gps-vts-integration.yaml)
- GPSWOX meeting notes: [2026-03-16-gpswox-integration.md](../../06-contracts/04-integration/meeting-notes/2026-03-16-gpswox-integration.md)

---

*Last updated: 2026-06-02 | Owners: Backend / Transport visibility*
