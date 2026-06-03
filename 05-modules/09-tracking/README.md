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
| [live-gps-sprint5-implementation.md](live-gps-sprint5-implementation.md) | **Canonical implementation reference** — architecture, APIs, RBAC, data model, UI, local demo, limitations |
| [../../03-backlog/sprints/sprint-5/12-gps-maps-dashboard/GPS-01-maps-dashboard-gps-tracking.md](../../03-backlog/sprints/sprint-5/12-gps-maps-dashboard/GPS-01-maps-dashboard-gps-tracking.md) | Sprint 5 story, acceptance criteria, deferred production scope |
| [../../03-backlog/sprints/sprint-5/12-gps-maps-dashboard/GPS-01-implementation-completion.md](../../03-backlog/sprints/sprint-5/12-gps-maps-dashboard/GPS-01-implementation-completion.md) | What was delivered in code vs AC-S5 checklist |
| [../../../apps/tracking/LIVE_GPS.md](../../../apps/tracking/LIVE_GPS.md) | Developer quick-start (commands, env) |
| [../../06-contracts/04-integration/gps-vts-integration.yaml](../../06-contracts/04-integration/gps-vts-integration.yaml) | External GPS/VTS contract (GPSWOX / GT06) |

## Sprint 5 delivered (MVP)

- Tenant admin **Live GPS** page (Leaflet + OpenStreetMap)
- **`GET /api/v1/tracking/live-map/`** read API
- **`gps_tracking`** table + GT06 Redis → Postgres sync
- **`gt06-ingest`** sidecar (TCP + optional HTTP API)
- Demo seed command and local Docker workflow

## Deferred (post Sprint 5)

- Full maps dashboard (`/api/v1/maps/**`), KPI widgets, TO route overlay
- Geofence engine, dwell alerts, TLS-01 timeline hooks from GPS
- POI geofence circles on Live GPS map
- Production GPSWOX REST adapter (read-only poll)
- Driver mobile background GPS (uses `POST /api/v1/tracking/location/` stub)
