---
module: 09-tracking
phase: Phase 1
sprint: Sprint 5
last_updated: 2026-06-02
related_stories:
  - GPS-01
jira_key: DFS-070
---

# Module 09 — GPS Tracking

GPS ingest, storage, and tenant-admin **Live GPS** map visibility for active trips.

## Documents

| Document | Purpose |
|----------|---------|
| [gt06-server.md](gt06-server.md) | **Backend architecture SSOT** — ingest, Redis, Postgres, APIs, map, RBAC, demo |
| [GPS-01 story](../../03-backlog/sprints/sprint-5/12-gps-maps-dashboard/GPS-01-maps-dashboard-gps-tracking.md) | Product context, acceptance criteria, scope |
| [LIVE_GPS.md](../../../apps/tracking/LIVE_GPS.md) | Developer command cheat sheet (repo) |
| [gps-vts-integration.yaml](../../06-contracts/04-integration/gps-vts-integration.yaml) | External GPS/VTS contract (GPSWOX) |

*Superseded (do not update): `live-gps-sprint5-implementation.md`, `06-contracts/04-integration/gt06-ingest-server.md`*

## Sprint 5 delivered (MVP)

- Tenant admin **Live GPS** page (Leaflet + OpenStreetMap)
- **`GET /api/v1/tracking/live-map/`** — Redis live marker + Postgres trail
- **`gps_tracking`** — Postgres trail (~10 min rows, averaged speed)
- **Redis** — live position/speed per IMEI
- **`gt06-ingest`** sidecar (TCP + optional HTTP API)
- Demo seed command and local Docker workflow

## Deferred (post Sprint 5)

- Full maps dashboard (`/api/v1/maps/**`), KPI widgets, TO route overlay
- Geofence engine, dwell alerts, TLS-01 timeline hooks from GPS
- POI geofence circles on Live GPS map
- Production GPSWOX REST adapter (read-only poll)
- Driver mobile background GPS (uses `POST /api/v1/tracking/location/` stub)
