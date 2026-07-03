---
module: 09-tracking
phase: Phase 1
sprint: Sprint 5
last_updated: 2026-06-25
related_stories:
  - GPS-01
jira_key: DFS-070
---

# Module 09 — GPS Tracking

GPS ingest, storage, and tenant-admin **Live GPS** map visibility for active trips.

## Documents

| Document | Purpose |
|----------|---------|
| [gt06-server.md](gt06-server.md) | **Backend architecture SSOT** — ingest, Redis, Postgres, APIs, map, geofence, TO-history, RBAC, demo |
| [GPS-01 story](../../03-backlog/sprints/sprint-5/12-gps-maps-dashboard/GPS-01-maps-dashboard-gps-tracking.md) | Product context, acceptance criteria, scope |
| [live-gps-mock-simulation.md](../../../docs/guides/live-gps-mock-simulation.md) | **How to run** the 2-truck mock simulation |
| [mock/README.md](../../../apps/tracking/mock/README.md) | Mock package quick reference |
| [gps-vts-integration.yaml](../../06-contracts/04-integration/gps-vts-integration.yaml) | External GPS/VTS contract (GPSWOX) |

*Implementation detail for geofence and TO-centric history is in [gt06-server.md](gt06-server.md) §11–12 (merged 2026-06-25). Source plans: `apps/tracking/GEOFENCE_IMPLEMENTATION.md`, `apps/tracking/TO_CENTRIC_HISTORY_PLAN.md`.*

*Superseded (do not update): `live-gps-sprint5-implementation.md`, `06-contracts/04-integration/gt06-ingest-server.md`*

## Delivered (MVP + post-Sprint 5)

- Tenant admin **Live GPS** page (Leaflet + OpenStreetMap)
- **`GET /api/v1/tracking/live-map/`** — Redis live marker + Postgres trail + POI geofence circles
- **`GET /api/v1/tracking/vehicle-to-history/`** — TO-centric history discovery
- **Geofence engine** — entry/exit, dwell, `GeofenceEvent`, map indicators
- **`gps_tracking`** — Postgres trail (~10 min rows, averaged speed)
- **Redis** — live position/speed per IMEI
- **`gt06-ingest`** sidecar (TCP + optional HTTP API)
- Demo seed command and local Docker workflow

## Deferred

- Full maps dashboard (`/api/v1/maps/**`), KPI widgets
- TLS-01 timeline hooks from GPS / geofence events
- Production GPSWOX REST adapter (read-only poll)
- Driver mobile background GPS on live map (`POST /location/` stub exists)
