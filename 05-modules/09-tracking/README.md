---
module: 09-tracking
phase: Phase 1
sprint: Sprint 5–6
last_updated: 2026-07-24
related_stories:
  - GPS-01
  - GPS-02
  - GPS-03
  - GPS-04
  - GPS-05
  - DFS-070
prd_sections:
  - 6.5.4
  - 6.5.5
  - 6.5.6
  - 6.5.7
  - 6.5.8
  - 6.5.9
  - 6.5.10
django_app: apps/tracking
ingest_service: services/gt06-ingest
ssot: true
---

# Module 09 — GPS Tracking (SSOT)

**This folder is the single source of truth** for GPS tracking, Live GPS, geofencing, dwell, and related Phase 1 map behaviour in DFMS.

| Authority | Role |
|-----------|------|
| **Code** (`apps/tracking/`, `services/gt06-ingest/`) | What ships |
| **This module** (`05-modules/09-tracking/`) | Product + as-built SSOT — PRD intent, implemented behaviour, intentional deviations, deferred work |
| **Sprint stories** (GPS-01…05) | Delivery backlog / AC checklists — not as-built truth when they disagree with this module |
| **`apps/tracking/*.md` plans** | Historical design notes — superseded when they conflict with this module |

> Folder note: `09-tracking/` and `09-mobile-apps/` both use module number 09. Tracking is Django app `apps/tracking`; mobile apps are separate.

---

## Documents

| Document | Purpose |
|----------|---------|
| **[prd-as-built.md](prd-as-built.md)** | **PRD §6.5.4–6.5.10 ↔ implementation matrix** (Done / Partial / Missing) |
| **[gt06-server.md](gt06-server.md)** | Backend architecture — ingest, Redis, Postgres, APIs, Live GPS UI, sync |
| **[geofence-and-dwell.md](geofence-and-dwell.md)** | Geofence product rules, dwell glossary (geofence vs gate), threshold decisions |
| **[maps-surfaces.md](maps-surfaces.md)** | Live GPS vs Maps Dashboard vs Command Center map; API family |
| **[gps-maintenance-phase2.md](gps-maintenance-phase2.md)** | PRD §6.5.10 Phase 2 stub (not implemented) |
| [live-gps-mock-simulation.md](../../../docs/guides/live-gps-mock-simulation.md) | How to run mock fleet |
| [mock/README.md](../../../apps/tracking/mock/README.md) | Mock package quick reference |
| [gps-vts-integration.yaml](../../06-contracts/04-integration/gps-vts-integration.yaml) | External GPSWOX contract (deferred adapter) |

### Backlog (delivery intent — verify against this SSOT)

| Story | PRD | Path |
|-------|-----|------|
| GPS-01 | §6.5.5 | [Sprint 6](../../03-backlog/sprints/sprint-6/02-gps-maps-dashboard/GPS-01-gps-tracking-monitoring.md) |
| GPS-02 | §6.5.7 | [Sprint 6](../../03-backlog/sprints/sprint-6/02-gps-maps-dashboard/GPS-02-poi-geofence-boundary-management.md) |
| GPS-03 | §6.5.6, §6.5.8 | [Sprint 6](../../03-backlog/sprints/sprint-6/02-gps-maps-dashboard/GPS-03-geofence-engine-arrival-departure.md) |
| GPS-04 | §6.5.9 | [Sprint 6](../../03-backlog/sprints/sprint-6/02-gps-maps-dashboard/GPS-04-dwell-time-tracking.md) |
| GPS-05 | §6.5.4 | [Sprint 6](../../03-backlog/sprints/sprint-6/02-gps-maps-dashboard/GPS-05-maps-dashboard-integration.md) |
| DFS-070 (demo MVP) | — | [Sprint 5](../../03-backlog/sprints/sprint-5/12-gps-maps-dashboard/GPS-01-maps-dashboard-gps-tracking.md) |

*Superseded paths (do not update as SSOT): `live-gps-sprint5-implementation.md`, `06-contracts/04-integration/gt06-ingest-server.md`.*

---

## As-built summary (Phase 1)

### Delivered

- **Provider:** GT06 TCP ingest sidecar → Redis → Celery sync → Postgres (`gps_tracking`)
- **Live GPS** tenant admin page (Leaflet + OSM) + `GET /api/v1/tracking/live-map/`
- **POI geofence circles** on map; vehicle `inside_pois` / `inside_geofence`
- **Geofence engine:** ENTRY / EXIT `GeofenceEvent` linked to vehicle, trip, TO, POI; dwell on exit
- **TO origin/destination only** evaluated for event detection (map may show all active POIs)
- **Trip auto-status** on origin/dest entry → `ARRIVED_AT_SOURCE` / `ARRIVED_AT_DESTINATION`
- **Dwell timeline** (Planned / Gate / Geofence) on TO admin + history summary APIs
- **TO-centric + idle vehicle history** APIs
- **Signal-loss:** last known location; `connection_status` live / stale / signal_lost (10 min)
- **Vehicle delete guard** when used on a trip (`PROTECT` + dependency gate)
- **24/7 ingest** including idle (no-trip) path

### Intentional deviations / partials

| Topic | As-built rule |
|-------|----------------|
| Refresh interval | UI poll **hardcoded 10s** — not configurable 30/60/120 (PRD TBD) |
| Provider | **GT06 only** in runtime; GPSWOX poller deferred |
| Geofence POI scope | Engine = **TO origin + destination** only; not every active POI |
| Dwell threshold field | `dwell_threshold_breached` **removed**; TO admin flags vs **planned** dwell only |
| GPS ↔ TO linkage | `GPSTracking` has vehicle + trip (no direct TO FK); TO via trip / `GeofenceEvent` |
| Maps Dashboard | Live GPS MVP only — full `/api/v1/maps/**` deferred |
| POI presence panel | Vehicle→POIs on live-map; not POI→vehicles + entry duration API |
| Radius min/max | Settings exist; **not enforced** on POI model/admin validation |

### Deferred / Phase 2

- Full Maps Dashboard (`/api/v1/maps/**`), KPI widgets, POI presence panel (GPS-05)
- TLS-01 timeline emission from geofence events
- GPSWOX production REST adapter
- Dedicated `PATCH` geofence + audit log (GPS-02)
- Configurable refresh 30/60/120; dwell exception alerts / reporting pipeline
- Driver mobile background GPS on live map
- **§6.5.10 GPS-based vehicle maintenance** — Phase 2 ([stub](gps-maintenance-phase2.md))

---

## Code roots

| Area | Path |
|------|------|
| Django tracking | `apps/tracking/` |
| GT06 ingest | `services/gt06-ingest/` |
| Live GPS UI | `templates/admin/tracking/`, `static/tracking/` |
| POI radius master | `apps/master_data.models.POI.geofence_radius_meters` |
| TO source/dest | `apps/transport.models.TransportOrder.origin_poi` / `destination_poi` |

---

## How to keep this SSOT current

1. Change behaviour in code → update **prd-as-built.md** status + the relevant rule doc the same PR/commit when possible.
2. Prefer editing this module over `apps/tracking/GEOFENCE_IMPLEMENTATION.md` (that file points here).
3. Sprint story checkboxes may lag; **this module wins** for “what is true in production code.”
