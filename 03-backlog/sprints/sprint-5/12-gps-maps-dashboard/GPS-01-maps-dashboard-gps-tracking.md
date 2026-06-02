---
jira_key: DFS-070
jira_type: Story
jira_sprint: "Sprint 5"
story_id: GPS-01
title: Maps Dashboard & GPS Tracking — Sprint 5 R&D & Demo Map Integration
epic: GPS & Maps Dashboard
status: Sprint 5 — R&D & Demo Scope
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
---

# GPS-01 — Maps Dashboard & GPS Tracking

## Sprint 5 scope (this iteration)

Sprint 5 does **not** commit to the full Phase 1 maps dashboard and geofence engine described in the PRD. Instead, this sprint delivers:

| Track | Intent | Outcome |
|-------|--------|---------|
| **R&D** | De-risk GPS/VTS and map-provider integration before build-out | Written findings, provider/API feasibility, adapter spike, open questions for product/ops |
| **Demo map integration** | Prove map UX inside DFMS with **demo API consumption** | Working demo surface in DFMS that calls a demo/mock GPS (and optionally map) API and renders POIs + vehicle positions for stakeholder review |

**Phase 1 production delivery** (live polling, geofence engine, dwell alerts, full `/api/v1/maps/**` surface, TLS-01 hooks) remains the **target state** and is scheduled **after** Sprint 5 R&D/demo sign-off. See [Phase 1 target state](#phase-1-target-state-deferred-beyond-sprint-5).

---

## Context

GPS and map-based transport visibility are Phase 1 capabilities (PRD §6.5.4–6.5.9, §6.8.2, §9.1–9.2). Nourish’s confirmed VTS stack is **GPSWOX** + **Concox GT06-ND**; DFMS is a **read-only consumer** of location data ([GPSWOX meeting notes](../../../06-contracts/04-integration/meeting-notes/2026-03-16-gpswox-integration.md), [integration contract](../../../06-contracts/04-integration/gps-vts-integration.yaml)).

**Why R&D in Sprint 5:** Production API credentials and exact GPSWOX endpoint shapes were still pending at story authoring. Sprint 5 validates integration assumptions, documents gaps, and produces a demo stakeholders can see before committing to the full ~21 SP build.

**Role access (production target — unchanged):**

| Role | Dashboard Access |
|------|-----------------|
| Tenant Admin | Full read access to Maps Dashboard |
| Transport Planner (TP) | Default landing view — own-fleet vehicles, all POIs, all TOs |
| Transport Distribution Officer — Own Fleet (TDO-OF) | Default landing view — own-fleet vehicles |
| Transport Distribution Officer — Vendor Fleet (TDO-VF) | Default landing view — vendor-fleet TOs |

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

| Stakeholder need | Sprint 5 answer |
|------------------|-----------------|
| “Can DFMS show our fleet on a map?” | Demo integration inside DFMS consuming demo GPS API data |
| “Is GPSWOX integration viable on our timeline?” | R&D report: auth, rate limits, field mapping, fallback options |
| “What do we build next?” | Clear go/no-go and backlog slice for post–Sprint 5 production story |

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
- Vehicle marker **popup or side panel** shows at minimum: registration (or vehicle code), last known coordinates, `device_timestamp` / `ingested_at`, and **signal lost** styling if last update &gt; 5 minutes (demo threshold same as production target).
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

## Sub-tasks — Sprint 5

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| GPS-01-S5-1 | R&D: GPSWOX / demo API spike | Confirm or mock API; implement thin `DemoGPSClient`; document auth, fields, errors, rate limits | High | Not started |
| GPS-01-S5-2 | R&D findings document | `GPS-01-R&D-findings.md` — go/no-go, risks, production backlog slice | High | Not started |
| GPS-01-S5-3 | R&D: map SDK selection | Compare Google Maps vs OSM/Leaflet; licensing and embed recommendation | Medium | Not started |
| GPS-01-S5-4 | Demo map UI in DFMS | Map page + POI/vehicle layers; marker popup with vehicle context | High | Not started |
| GPS-01-S5-5 | Demo API wiring | Settings/env for demo base URL; server fetch + JSON endpoint for map frontend if needed | High | Not started |
| GPS-01-S5-6 | Demo RBAC | Restrict demo route to pilot roles; smoke test 403 for gateman/driver | Medium | Not started |
| GPS-01-S5-7 | UAT demo script | Short script + limitations list for stakeholder demo | Medium | Not started |

### Sub-tasks — deferred (Phase 1 production — post Sprint 5)

| # | Sub-task | Notes |
|---|----------|-------|
| GPS-01-1 → GPS-01-13 | Full production backlog | See [Phase 1 target state](#phase-1-target-state-deferred-beyond-sprint-5); unchanged intent, not Sprint 5 committed |

---

## Definition of done — Sprint 5

- [ ] R&D findings document published and reviewed (AC-S5-1, AC-S5-2)
- [ ] Demo GPS client successfully calls demo/mock API and maps to internal DTO (AC-S5-1, AC-S5-4)
- [ ] Demo map page live in DFMS with POI + vehicle markers from API-fed data (AC-S5-3)
- [ ] Degraded mode behaviour verified on API failure (AC-S5-4)
- [ ] Pilot RBAC enforced (AC-S5-5)
- [ ] UAT demo script executed once in staging; limitations list shared with PO (AC-S5-6)

---

## Dependencies (Sprint 5)

| Dependency | Direction | Note |
|------------|-----------|------|
| POI Master Data | Demo reads | `lat`/`lng` (and optional `geofence_radius_m`) on active POIs — Sprint 4 |
| Vehicle Master | Demo reads | `gps_device_id` or demo alias for API device mapping |
| GPSWOX / demo API | External | Credentials or mock server; see integration contract |
| Map SDK account / tiles | External | May need API key for Google; OSM may need tile usage policy review |
| Env configuration | Ops | `GPS_DEMO_API_*` secrets in staging only |

---

*Epic: GPS & Maps Dashboard | Phase: 1 | Sprint 5: 8 SP (R&D + demo) | Phase 1 total: ~21 SP | PRD: §6.5.4–6.5.9, §6.8.2, §9.1–9.2 | Jira: DFS-070 | Last Updated: 2026-06-02*
