---
module: 09-tracking
specification: Map surfaces taxonomy & Maps Dashboard scope
version: 1.0
phase: Phase 1
last_updated: 2026-07-24
ssot: true
prd_sections: [6.5.4, 6.5.5]
---

# Map Surfaces — Taxonomy (SSOT)

Clarifies the three map-related product surfaces so PRD “map dashboard” language is not confused with as-built Live GPS.

---

## 1. Surface comparison

| Surface | Audience | Purpose | Status | Primary entry |
|---------|----------|---------|--------|---------------|
| **Live GPS** | Tenant Admin (+ roles with `Menu.LiveGps.View`) | Real-time fleet on active trips; history; geofence circles | **Implemented** | `/admin/tracking/live-gps/` |
| **Maps Dashboard** (PRD §6.5.4 / GPS-05) | Transport Planner, TDO, Tenant Admin | Operational landing: KPIs, presence panel, TO highlight, RBAC matrix | **Deferred** | Planned `/api/v1/maps/**` + dedicated UI |
| **Command Center map** (US-026 / yard ops) | Yard / CC roles | Yard operational context (not GPS SSOT) | Separate module | [../06-poi-operations/command-center.md](../06-poi-operations/command-center.md) |

Live GPS is the **Phase 1 delivered** map for GPS monitoring. Maps Dashboard remains the **product gap** for full §6.5.4 acceptance.

---

## 2. As-built Live GPS capabilities

| Capability | As-built |
|------------|----------|
| Map SDK | Leaflet + OpenStreetMap |
| Poll | `GET /api/v1/tracking/live-map/` every **10s** (`LIVE_MAP_REFRESH_SECONDS`) |
| Vehicles | Active-trip fleet (+ mock filters); lat/lng, speed, movement, connection_status |
| POIs | All active geocoded POIs + geofence radius circles |
| Inside indicator | `inside_pois` / `inside_geofence` per vehicle |
| Source / dest on row | `origin_poi` / `destination_poi` from live TO |
| Trails | Redis history when live; Postgres when stale |
| History | TO-centric (`vehicle-to-history`) + idle history APIs |
| Signal lost | Last known position; status `signal_lost` after 10 minutes |

**Code:** `apps/tracking/live_map_service.py`, `portal_views.py`, `static/tracking/js/live-gps-app.js`

---

## 3. API family

| Family | Status | Notes |
|--------|--------|-------|
| `/api/v1/tracking/**` | **As built** | All Live GPS / geofence / history endpoints |
| `/api/v1/maps/**` | **Not built** | GPS-05 dashboard, panels, route view |
| `/api/v1/gps/**` | **Not used** | Appears in older story drafts only |

Until Maps Dashboard ships, clients should use **`/api/v1/tracking/`** only.

---

## 4. Maps Dashboard — deferred scope (GPS-05)

Documented for backlog alignment; **not SSOT as implemented**:

- `GET /api/v1/maps/dashboard` — vehicles, POIs, zones, active trips, KPIs
- POI presence panel — vehicles in fence + entry time + duration
- Vehicle / TO side panels and route view
- Degraded-mode provider banner
- Broader RBAC (`MapsDashboardPermission`) beyond Live GPS menu

When implemented, update [prd-as-built.md](prd-as-built.md) §6.5.4 rows and this section’s Status column.

---

## 5. Provider & refresh (product notes)

| Topic | As-built | PRD / story intent |
|-------|----------|--------------------|
| Provider | GT06 direct TCP ingest | GPSWOX REST also acceptable; adapter deferred |
| UI refresh | Fixed **10s** | Configurable 30 / 60 / 120 (TBD) — not shipped |
| Device sync check | Celery ~**30s** | Aligns with ~provider poll stories |
| Trail persist gate | Env `GPS_TRAIL_AND_ACTIVITY_MARKER_INTERVAL_SECONDS` (default 300) | Ops-tunable, not end-user UI |

Provider decision record (`GPS-R&D-findings.md`) is still a backlog item (GPS-01-6); runtime SSOT remains **GT06 ingest**.

---

## Related

- [prd-as-built.md](prd-as-built.md)
- [gt06-server.md](gt06-server.md)
- [geofence-and-dwell.md](geofence-and-dwell.md)
- Sprint 6 GPS-05: `../../03-backlog/sprints/sprint-6/02-gps-maps-dashboard/GPS-05-maps-dashboard-integration.md`
