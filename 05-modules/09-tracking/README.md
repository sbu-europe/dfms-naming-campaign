---
module: 09-tracking
phase: Phase 1
sprint: Sprint 5–6
last_updated: 2026-08-06
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
  - 6.9.2
django_app: apps/tracking
---

# Module 09 — GPS Tracking

Real-time vehicle location, POI geofencing, arrival/departure, and dwell — so Transport Planner and TDO can monitor trips without phone calls.

DFMS is **not** a GPS hardware vendor. Vehicles carry a tracker; DFMS receives location and uses it on Live GPS and related surfaces.

> Folder note: `09-tracking/` and `09-mobile-apps/` both use module number 09. Tracking is Django app `apps/tracking`; mobile apps are separate.

---

## Documents

| Document | Covers | PRD |
|----------|--------|-----|
| **[providers/README.md](providers/README.md)** | GPS devices & how each provider connects (all devices in one file) | §9.1 |
| **[vehicle-arrival-departure.md](vehicle-arrival-departure.md)** | Automatic arrival / departure at POIs | §6.5.6, §6.5.8 |

Live GPS (§6.5.5): backlog story [GPS-01](../../03-backlog/sprints/sprint-5/12-gps-maps-dashboard/GPS-01-maps-dashboard-gps-tracking.md) — not a separate module doc.  
POI geofence radius (§6.5.7): backlog story [GPS-02](../../03-backlog/sprints/sprint-6/02-gps-maps-dashboard/GPS-02-poi-geofence-boundary-management.md) — not a separate module doc.  
Dwell (planned / gate / geofence): backlog story [GPS-04](../../03-backlog/sprints/sprint-6/02-gps-maps-dashboard/GPS-04-dwell-time-tracking.md) (§6.5.9) — not a separate module doc.  
Maps Dashboard (§6.5.4 / §6.9.2): backlog story [GPS-05](../../03-backlog/sprints/sprint-6/02-gps-maps-dashboard/GPS-05-maps-dashboard-integration.md) — not a separate module doc.

**Delivery AC / DoD:** backlog stories GPS-01…GPS-05 (Sprint 6) and Sprint 5 DFS-070 — not duplicated here.

**Engineering how-to** (ingest, Redis, code paths): [`apps/tracking/`](../../../apps/tracking/) and [`docs/guides/live-gps-mock-simulation.md`](../../../docs/guides/live-gps-mock-simulation.md) — not product SSOT.

---

## Authority

| Layer | Role |
|-------|------|
| **Backlog stories** (GPS-01…05) | Sprint acceptance criteria and Definition of Done |
| **This module** | Product behaviour — who, what, business rules, PRD vs delivered |
| **Code** (`apps/tracking/`, `services/gt06-ingest/`) | What ships |

When story intent and product behaviour diverge, update the story or these specs so they stay aligned. Do not treat engineering runbooks as BA source of truth.

---

## PRD coverage (summary)

| PRD | Topic | Status |
|-----|-------|--------|
| §6.5.5 | GPS tracking & Live GPS | **Delivered** (MVP) — refresh 30/60/120 and GPSWOX deferred |
| §6.5.7 | POI geofence boundary | **Delivered** — radius on POI master; dedicated geofence API deferred |
| §6.5.6 / §6.5.8 | Entry / exit & arrival | **Delivered** — events on TO **origin + destination** only |
| §6.5.9 | Dwell | **Delivered** — Planned / Gate / Geofence; exception alerts pipeline deferred |
| §6.5.4 / §6.9.2 | Map layer / Maps Dashboard | **Partial** — Live GPS done; full Maps Dashboard deferred |
| §6.5.10 | GPS-based maintenance | **Phase 2** — not started |
| §9.1 | Multi-provider GPS/VTS | **Partial** — GT06 active; GPSWOX and further providers planned |

Detail lives in each feature file and in [providers/README.md](providers/README.md).

---

## Operational flow (business)

```
Vehicle has GPS device linked in master data
  → Provider sends location to DFMS
    → Operator opens Live GPS → sees GPS-linked fleet vehicles on the map
      → Enter/exit origin or destination geofence during live TO movement → Arrival / Departure
        → Dwell visible on TO (Planned vs Gate vs Geofence)
```

---

## Backlog

| Story | PRD | Path |
|-------|-----|------|
| GPS-01 / DFS-070 | §6.5.5 | [Sprint 5](../../03-backlog/sprints/sprint-5/12-gps-maps-dashboard/GPS-01-maps-dashboard-gps-tracking.md) |
| GPS-02 | §6.5.7 | [Sprint 6](../../03-backlog/sprints/sprint-6/02-gps-maps-dashboard/GPS-02-poi-geofence-boundary-management.md) |
| GPS-03 | §6.5.6, §6.5.8 | [Sprint 6](../../03-backlog/sprints/sprint-6/02-gps-maps-dashboard/GPS-03-geofence-engine-arrival-departure.md) |
| GPS-04 | §6.5.9 | [Sprint 6](../../03-backlog/sprints/sprint-6/02-gps-maps-dashboard/GPS-04-dwell-time-tracking.md) |
| GPS-05 | §6.5.4, §6.9.2 | [Sprint 6](../../03-backlog/sprints/sprint-6/02-gps-maps-dashboard/GPS-05-maps-dashboard-integration.md) |

---

## Related modules

- [POI master / geofence radius field](../02-master-data/poi-management.md)
- [Vehicle master / GPS Device ID](../02-master-data/vehicle-master-data.md)
- [Gate dwell (yard)](../06-poi-operations/) — Real Time (Gate) on TO milestones
- [GPS/VTS contract](../../06-contracts/04-integration/gps-vts-integration.yaml) — GPSWOX (deferred)
