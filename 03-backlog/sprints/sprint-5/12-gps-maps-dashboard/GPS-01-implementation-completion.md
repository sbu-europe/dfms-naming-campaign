---
story_id: GPS-01
jira_key: DFS-070
sprint: Sprint 5
last_updated: 2026-06-02
implementation_doc: DFMS-product-context/05-modules/09-tracking/live-gps-sprint5-implementation.md
status: MVP complete (Sprint 5 demo scope)
---

# GPS-01 — Implementation completion (Sprint 5 MVP)

Implementation reference: [live-gps-sprint5-implementation.md](../../../05-modules/09-tracking/live-gps-sprint5-implementation.md).

## Sprint 5 acceptance criteria — status

| AC | Summary | Status |
|----|---------|--------|
| AC-S5-1 | GPS/VTS / GT06 feasibility + adapter spike | **Partial** — GT06 ingest + sync implemented; formal R&D doc optional |
| AC-S5-2 | Map SDK selection | **Done** — Leaflet + OpenStreetMap (documented in module spec) |
| AC-S5-3 | Demo map in DFMS (POI + vehicles from API) | **Partial** — vehicles from API; **POI layer not on map yet** |
| AC-S5-4 | Demo API consumption | **Done** — `live-map` API + GT06 pipeline; env via Redis/GT06 service |
| AC-S5-5 | Demo RBAC | **Done** — `Menu.LiveGps.View` + tenant admin bypass |
| AC-S5-6 | UAT demo script | **Pending PO sign-off** — steps in module spec § Local development |

## Delivered capabilities

- [x] Tenant admin **Live GPS** page with DFMS sidebar/topbar
- [x] `GET /api/v1/tracking/live-map/` read API
- [x] `GPSTracking` model + tenant migration
- [x] GT06 sidecar + Redis + Celery sync to Postgres
- [x] `seed_live_gps_demo` management command
- [x] Custom vehicle marker asset + trail polyline
- [x] Live vs signal-lost (10 min threshold)
- [x] Unit tests for map service and API permissions

## Not in this delivery (Phase 1 backlog)

- [ ] `GET /api/v1/maps/dashboard` and related maps APIs
- [ ] Geofence engine, `GeofenceEvent`, dwell alerts
- [ ] TLS-01 timeline events from GPS
- [ ] POI markers / geofence circles on Live GPS
- [ ] GPSWOX REST production poller
- [ ] KPI widgets, TO route overlay, vendor-fleet map layers

## Issues resolved during implementation (engineering notes)

| Issue | Resolution |
|-------|------------|
| 403 on live-map API | `CanViewLiveGps` aligned with tenant admin SSR bypass |
| 500 on live-map | Added `gps_tracking` migration (`0001_initial_gpstracking`) |
| Empty sidebar on Live GPS page | `admin.site.each_context(request)` in portal view |
| Trail line into India (demo data) | Seed trail northbound only; client trail sanitization |
| Truck icon orientation | `scaleX(-1)` + `rotate(heading - 90deg)` |

## Verification checklist (UAT)

1. Log in as **Nourish Admin** on tenant host.
2. Open **Overview → Live GPS**.
3. Confirm map loads and status shows refresh time (not 403/500).
4. With demo seed: see **Vehicles (1)** and truck marker near Dhaka.
5. Hard refresh after `seed_live_gps_demo` if list empty (needs trip + GPS).

---

*GPS-01 Sprint 5 MVP | Linked from [GPS-01 story](GPS-01-maps-dashboard-gps-tracking.md)*
