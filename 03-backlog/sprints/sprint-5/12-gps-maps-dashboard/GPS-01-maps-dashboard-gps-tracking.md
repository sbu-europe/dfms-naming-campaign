---

## jira_key: DFS-070
jira_type: Story
jira_sprint: "Sprint 5"
story_id: GPS-01
title: Maps Dashboard & GPS Tracking — Sprint 5 R&D & Demo Map Integration
epic: GPS & Maps Dashboard
status: MVP implemented (Sprint 5 demo scope)
implementation_docs:
  - DFMS-product-context/03-backlog/sprints/sprint-5/12-gps-maps-dashboard/GPS-01-maps-dashboard-gps-tracking.md
  - DFMS-product-context/05-modules/09-tracking/gt06-server.md
story_points: 8
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
integration_contracts:
  - DFMS-product-context/06-contracts/04-integration/gps-vts-integration.yaml
  - DFMS-product-context/06-contracts/04-integration/meeting-notes/2026-03-16-gpswox-integration.md

# GPS-01 — Maps Dashboard & GPS Tracking

## At a glance — Sprint 5 acceptance criteria

Read the full AC wording in [Acceptance criteria — Sprint 5 (R&D & demo)](#acceptance-criteria--sprint-5-rd--demo) below.  
Implementation detail: [gt06-server.md](../../../05-modules/09-tracking/gt06-server.md).


| AC          | Summary                                      | Status             | Notes                                                                                                                 |
| ----------- | -------------------------------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------- |
| **AC-S5-1** | GPS/VTS provider feasibility + adapter spike | **Partially done** | GT06 ingest + Redis + Celery sync shipped; GPSWOX REST poller deferred; formal `GPS-01-R&D-findings.md` not published |
| **AC-S5-2** | Map display provider (SDK selection)         | **Done**           | Leaflet + OpenStreetMap; documented in [gt06-server.md](../../../05-modules/09-tracking/gt06-server.md)               |
| **AC-S5-3** | Demo map surface in DFMS                     | **Partially done** | Live GPS page + vehicle markers from API; POI layer / geofence circles not on map                                     |
| **AC-S5-4** | Demo API consumption                         | **Partially done** | `GET /api/v1/tracking/live-map/` + GT06 pipeline (not GPSWOX demo URL); degraded-mode banner not fully verified       |
| **AC-S5-5** | Demo RBAC (minimum)                          | **Done**           | `Menu.LiveGps.View`, tenant admin bypass, 403 for unauthorised users                                                  |
| **AC-S5-6** | Stakeholder demo readiness (UAT)             | **Partially done** | Demo commands + five-truck mock documented; formal UAT sign-off with PO pending                                       |


**Status legend:** **Done** = AC met for Sprint 5 as built · **Partially done** = core delivered, documented gaps remain · **Not done** = not started or not met · **Deferred** = explicitly post–Sprint 5 / Phase 1

---

## Sprint 5 scope (this iteration)

Sprint 5 does **not** commit to the full Phase 1 maps dashboard and geofence engine described in the PRD. Instead, this sprint delivers:


| Track                    | Intent                                                        | Outcome                                                                                                                                      |
| ------------------------ | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **R&D**                  | De-risk GPS/VTS and map-provider integration before build-out | Written findings, provider/API feasibility, adapter spike, open questions for product/ops                                                    |
| **Demo map integration** | Prove map UX inside DFMS with **demo API consumption**        | Working demo surface in DFMS that calls a demo/mock GPS (and optionally map) API and renders POIs + vehicle positions for stakeholder review |


**Phase 1 production delivery** (live polling, geofence engine, dwell alerts, full `/api/v1/maps/`** surface, TLS-01 hooks) remains the **target state** and is scheduled **after** Sprint 5 R&D/demo sign-off. See [Phase 1 target state](#phase-1-target-state-deferred-beyond-sprint-5).

### Implementation (as built)


| Artifact               | Path                                                                                    |
| ---------------------- | --------------------------------------------------------------------------------------- |
| Implementation context | [This file](GPS-01-maps-dashboard-gps-tracking.md)                                      |
| Backend architecture   | [gt06-server.md](../../../05-modules/09-tracking/gt06-server.md)                        |


**Delivered in code:** tenant admin **Live GPS** (`/admin/tracking/live-gps/`), `GET /api/v1/tracking/live-map/`, `GPSTracking` + GT06 ingest/sync, demo seed command. **Not yet:** POI layer on map, full `/api/v1/maps/`**, geofence engine.

---

## Context

GPS and map-based transport visibility are Phase 1 capabilities (PRD §6.5.4–6.5.9, §6.8.2, §9.1–9.2). Nourish’s confirmed VTS stack is **GPSWOX** + **Concox GT06-ND**; DFMS is a **read-only consumer** of location data ([GPSWOX meeting notes](../../../06-contracts/04-integration/meeting-notes/2026-03-16-gpswox-integration.md), [integration contract](../../../06-contracts/04-integration/gps-vts-integration.yaml)).

**Why R&D in Sprint 5:** Production API credentials and exact GPSWOX endpoint shapes were still pending at story authoring. Sprint 5 validates integration assumptions, documents gaps, and produces a demo stakeholders can see before committing to the full ~21 SP build.

**Role access (production target — unchanged):**


| Role                                                   | Dashboard Access                                             |
| ------------------------------------------------------ | ------------------------------------------------------------ |
| Tenant Admin                                           | Full read access to Maps Dashboard                           |
| Transport Planner (TP)                                 | Default landing view — own-fleet vehicles, all POIs, all TOs |
| Transport Distribution Officer — Own Fleet (TDO-OF)    | Default landing view — own-fleet vehicles                    |
| Transport Distribution Officer — Vendor Fleet (TDO-VF) | Default landing view — vendor-fleet TOs                      |


Demo map access in Sprint 5 may use a **narrower pilot role set** (e.g. Tenant Admin + Transport Planner only) if RBAC for TDO is not yet wired; any deviation must be documented in the R&D deliverable.

**Explicitly out of Sprint 5:**

- Production geofence engine, dwell threshold alerts, and TLS-01 timeline emission
- Full KPI widget bar and TO-centric route overlay (demo may show static or mocked KPIs)
- Driver mobile background location / navigation
- GPS-based vehicle maintenance (PRD §6.5.10 — Phase 2)
- Trip route playback / historical track replay
- Trip costing (§6.8.8)

---

## Business value (Sprint 5)


| Stakeholder need                                | Sprint 5 answer                                                     |
| ----------------------------------------------- | ------------------------------------------------------------------- |
| “Can DFMS show our fleet on a map?”             | Demo integration inside DFMS consuming demo GPS API data            |
| “Is GPSWOX integration viable on our timeline?” | R&D report: auth, rate limits, field mapping, fallback options      |
| “What do we build next?”                        | Clear go/no-go and backlog slice for post–Sprint 5 production story |


---

## User stories (Sprint 5)

> **As a Transport Planner, Transport Distribution Officer, or Tenant Admin**, I want a **demo map view inside DFMS** that loads vehicle positions from a **demo GPS API** so that I can validate map UX and data fields before full production investment.

> **As a technical lead**, I want a **structured R&D outcome** on GPS/VTS and map provider options so that Sprint 6+ implementation estimates and risks are evidence-based.

> **As a transport planner (demo audience)**, I want to see **POI markers and vehicle markers** on one map with basic vehicle context (registration, last update) so that I can confirm the dashboard concept aligns with operations workflows.

---

## Acceptance criteria — Sprint 5 (R&D & demo)

### AC-S5-1 — R&D: GPS/VTS provider feasibility

- Document status of **GPSWOX API access** (credentials, base URL, auth method, rate limits) against [gps-vts-integration.yaml](../../../06-contracts/04-integration/gps-vts-integration.yaml).
- Spike a **read-only adapter** (or script) that calls either:
  - the **GPSWOX demo/sandbox API**, or
  - a **project-hosted mock** that conforms to the contract’s `VehicleLocation` schema,
  and maps the response to an internal DTO: `vehicle_id`, `lat`, `lng`, `speed_kmh`, `device_timestamp`, `signal_quality` (or equivalent).
- Record **blockers**, **fallback options** (e.g. mock for dev, direct device path), and **recommended poll interval** for production (30 / 60 / 120 s).
- **Deliverable:** `GPS-01-R&D-findings.md` (or equivalent section in sprint wiki) linked from this story — reviewed with Tech Lead + PO.

### AC-S5-2 — R&D: Map display provider

- Evaluate **map tile / JS SDK** options for DFMS (e.g. Google Maps vs OpenStreetMap/Leaflet) against NFR dependencies (licensing, offline/cache, Bangladesh coverage).
- **Deliverable:** one-page recommendation with cost/licensing note and proposed embed approach (admin iframe vs dedicated frontend route).

### AC-S5-3 — Demo map surface in DFMS

- A **demo map page** is reachable inside DFMS (Django admin custom view, transport module page, or agreed frontend route) — path and menu entry documented for UAT.
- Map renders:
  - **POI markers** from existing POI master data (`lat`/`lng`, name, optional geofence radius circle if map SDK supports it),
  - **Vehicle markers** from demo GPS API responses (not hard-coded lat/lng in templates only).
- Vehicle marker **popup or side panel** shows at minimum: registration (or vehicle code), last known coordinates, `device_timestamp` / `ingested_at`, and **signal lost** styling if last update > 5 minutes (demo threshold same as production target).
- Map refresh: manual refresh button and/or auto-refresh every **60 s** (configurable constant acceptable for demo).

### AC-S5-4 — Demo API consumption

- DFMS **server-side** (preferred) or documented **BFF** calls the configured **demo GPS base URL** (env: e.g. `GPS_DEMO_API_BASE_URL`, `GPS_DEMO_API_KEY`) — no secrets committed to repo.
- Request/response logged at **debug** level only; no production PII beyond what UAT seed already uses.
- On demo API **4xx/5xx/timeout**: map shows last successful positions with visible **degraded mode** banner; does not white-screen.
- **Demo data path** documented: which vehicles have `gps_device_id` (or demo alias) mapped to demo API device ids.

### AC-S5-5 — Demo RBAC (minimum)

- Demo map route restricted to authenticated DFMS users with a **pilot role** (minimum: `tenant_admin`; extend to `transport_planner` if ready).
- Unauthenticated or unauthorised roles receive **403** (or admin login redirect) — no public anonymous map URL in staging/prod.

### AC-S5-6 — Stakeholder demo readiness

- UAT script (5–10 steps): open demo map → see ≥1 POI and ≥1 vehicle → refresh → confirm API call updates marker position (or mock advances position).
- Known limitations list attached to demo (no geofence events, no dwell alerts, no TLS timeline, no vendor-fleet layer toggle unless implemented).

---

## Acceptance criteria — validation (implementation vs AC) by Dhrubajit

*Added for Sprint 5 delivery tracking. Does not replace the AC text above.*

### AC-S5-1 — R&D: GPS/VTS provider feasibility


| Criterion (from AC)                                         | Status             | Evidence / gap                                                                                   |
| ----------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------ |
| Document GPSWOX API access vs integration contract          | **Deferred**       | Production GPSWOX credentials/endpoints still pending; see meeting notes + yaml contract         |
| Spike read-only adapter (GPSWOX or mock → internal DTO)     | **Partially done** | **GT06 TCP ingest** + `Gt06RedisReader` + `LiveMapService` replace GPSWOX demo path for Sprint 5 |
| Record blockers, fallback options, poll interval            | **Partially done** | GT06 ~10s ingest, live-map 10s poll, Postgres 10 min trail — documented in [gt06-server.md](../../../05-modules/09-tracking/gt06-server.md) |
| Deliverable: `GPS-01-R&D-findings.md` reviewed with TL + PO | **Not done**       | Optional formal write-up not published                                                           |


### AC-S5-2 — R&D: Map display provider


| Criterion (from AC)                                       | Status   | Evidence / gap                                                       |
| --------------------------------------------------------- | -------- | -------------------------------------------------------------------- |
| Evaluate Google Maps vs OSM/Leaflet (licensing, coverage) | **Done** | OSM tiles + Leaflet chosen for dev/demo                              |
| One-page recommendation + embed approach                  | **Done** | SSR admin page `templates/admin/tracking/live_gps.html` (not iframe) |


### AC-S5-3 — Demo map surface in DFMS


| Criterion (from AC)                                       | Status             | Evidence / gap                                                   |
| --------------------------------------------------------- | ------------------ | ---------------------------------------------------------------- |
| Demo map page reachable in DFMS; path documented          | **Done**           | `/admin/tracking/live-gps/` — Overview → Live GPS                |
| POI markers from master data                              | **Not done**       | POI layer deferred                                               |
| Vehicle markers from demo GPS API (not hard-coded only)   | **Done**           | `GET /api/v1/tracking/live-map/` ← Redis / Postgres              |
| Popup: registration, coordinates, timestamps, signal lost | **Done**           | Detail panel + popup; `connection_status` live/stale/signal_lost |
| Signal lost if last update > 5 minutes                    | **Partially done** | Implemented at **10 minutes** (`SIGNAL_LOST_MINUTES`)            |
| Refresh manual and/or auto every 60 s                     | **Partially done** | Auto-refresh every **10 s** (`LIVE_MAP_REFRESH_SECONDS`)         |


**Beyond original AC (Sprint 5 enhancements):** history graph + activity cards, follow mini-maps, five-truck OSM mock fleet, movement status (moving / idle / parked), marker clustering — not required by AC-S5-3 but shipped.

### AC-S5-4 — Demo API consumption


| Criterion (from AC)                                                    | Status             | Evidence / gap                                                                |
| ---------------------------------------------------------------------- | ------------------ | ----------------------------------------------------------------------------- |
| Server-side fetch from configured demo GPS base URL (`GPS_DEMO_API_*`) | **Partially done** | **GT06 → Redis** + Django `live-map` API; not GPSWOX/demo REST env vars       |
| Debug logging only; no secrets in repo                                 | **Done**           | `GT06_REDIS_URL` via compose/env                                              |
| 4xx/5xx/timeout → last positions + degraded banner                     | **Partially done** | API errors show failed status in UI; full degraded banner not UAT-verified    |
| Demo data path documented (device id mapping)                          | **Done**           | Vehicle `gps_tracker_id` = IMEI; `seed_live_gps_demo` / `seed_live_gps_fleet` |


### AC-S5-5 — Demo RBAC (minimum)


| Criterion (from AC)                                    | Status   | Evidence / gap                                              |
| ------------------------------------------------------ | -------- | ----------------------------------------------------------- |
| Restricted to pilot roles (tenant_admin minimum)       | **Done** | `CanViewLiveGps` + `Menu.LiveGps.View`; tenant admin bypass |
| Unauthenticated / unauthorised → 403 or login redirect | **Done** | API 403; SSR `PermissionDenied`                             |


### AC-S5-6 — Stakeholder demo readiness


| Criterion (from AC)             | Status             | Evidence / gap                                                       |
| ------------------------------- | ------------------ | -------------------------------------------------------------------- |
| UAT script 5–10 steps           | **Partially done** | Steps in [gt06-server.md](../../../05-modules/09-tracking/gt06-server.md) § Verification; not formally signed off by PO |
| See ≥1 POI and ≥1 vehicle       | **Partially done** | ≥1 vehicle verified; POI on map not implemented                      |
| Refresh updates marker position | **Done**           | 10s poll + GT06/mock ingest                                          |
| Known limitations list for demo | **Done**           | Deferred items in [gt06-server.md](../../../05-modules/09-tracking/gt06-server.md) + story Phase 1 section |


### Phase 1 items explicitly deferred (not Sprint 5 AC)


| Area                                                          | Status       |
| ------------------------------------------------------------- | ------------ |
| Full `/api/v1/maps/`** dashboard                              | **Deferred** |
| Geofence engine, dwell alerts, TLS-01 GPS events              | **Deferred** |
| GPSWOX REST production poller                                 | **Deferred** |
| POI markers / geofence circles on Live GPS                    | **Deferred** |
| Platform admin Live GPS                                       | **Deferred** |
| Driver mobile background GPS (`POST /location/`) wired to map | **Deferred** |


*Last validation pass: 2026-06-07*

---

## Sub-tasks — Sprint 5


| #           | Sub-task                     | Description                                                                                     | Priority | Status      |
| ----------- | ---------------------------- | ----------------------------------------------------------------------------------------------- | -------- | ----------- |
| GPS-01-S5-1 | R&D: GPSWOX / demo API spike | Confirm or mock API; implement thin `DemoGPSClient`; document auth, fields, errors, rate limits | High     | Not started |
| GPS-01-S5-2 | R&D findings document        | `GPS-01-R&D-findings.md` — go/no-go, risks, production backlog slice                            | High     | Not started |
| GPS-01-S5-3 | R&D: map SDK selection       | Compare Google Maps vs OSM/Leaflet; licensing and embed recommendation                          | Medium   | Not started |
| GPS-01-S5-4 | Demo map UI in DFMS          | Map page + POI/vehicle layers; marker popup with vehicle context                                | High     | Not started |
| GPS-01-S5-5 | Demo API wiring              | Settings/env for demo base URL; server fetch + JSON endpoint for map frontend if needed         | High     | Not started |
| GPS-01-S5-6 | Demo RBAC                    | Restrict demo route to pilot roles; smoke test 403 for gateman/driver                           | Medium   | Not started |
| GPS-01-S5-7 | UAT demo script              | Short script + limitations list for stakeholder demo                                            | Medium   | Not started |


### Sub-tasks — deferred (Phase 1 production — post Sprint 5)


| #                    | Sub-task                | Notes                                                                                                                |
| -------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------- |
| GPS-01-1 → GPS-01-13 | Full production backlog | See [Phase 1 target state](#phase-1-target-state-deferred-beyond-sprint-5); unchanged intent, not Sprint 5 committed |


---

## Definition of done — Sprint 5

- Map SDK selected and documented — Leaflet + OpenStreetMap (AC-S5-2) — see [gt06-server.md](../../../05-modules/09-tracking/gt06-server.md)
- Demo GPS pipeline — GT06 ingest + Redis sync + `GPSTracking` (AC-S5-1, AC-S5-4 partial)
- Demo map page live in DFMS with **vehicle** markers from API (AC-S5-3 partial — POI layer deferred)
- Pilot RBAC enforced — `Menu.LiveGps.View` + tenant admin bypass (AC-S5-5)
- R&D findings document published and reviewed (AC-S5-1 formal write-up optional)
- Degraded mode behaviour verified on API failure (AC-S5-4)
- UAT demo script executed once in staging; limitations list shared with PO (AC-S5-6)

---

## Dependencies (Sprint 5)


| Dependency              | Direction  | Note                                                                     |
| ----------------------- | ---------- | ------------------------------------------------------------------------ |
| POI Master Data         | Demo reads | `lat`/`lng` (and optional `geofence_radius_m`) on active POIs — Sprint 4 |
| Vehicle Master          | Demo reads | `gps_device_id` or demo alias for API device mapping                     |
| GPSWOX / demo API       | External   | Credentials or mock server; see integration contract                     |
| Map SDK account / tiles | External   | May need API key for Google; OSM may need tile usage policy review       |
| Env configuration       | Ops        | `GPS_DEMO_API_`* secrets in staging only                                 |


---

*Epic: GPS & Maps Dashboard | Phase: 1 | Sprint 5: 8 SP (R&D + demo) | Phase 1 total: ~21 SP | PRD: §6.5.4–6.5.9, §6.8.2, §9.1–9.2 | Jira: DFS-070 | Last Updated: 2026-06-02*