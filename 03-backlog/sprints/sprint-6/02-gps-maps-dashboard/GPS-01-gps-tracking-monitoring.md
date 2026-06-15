---
jira_key: DFS-077
jira_type: Story
jira_sprint: "Sprint 6"
story_id: GPS-01
title: GPS Tracking & Monitoring — Provider Adapter & Live Vehicle Feed
epic: GPS & Maps Dashboard
status: New — Sprint 6 Scope
story_points: 3
assignee: ~
prd_refs:
  - "§6.5.5 GPS Tracking & Monitoring"
  - "§9.1 GPS/VTS Integration"
phase: Phase 1
supersedes: "Sprint 5 GPS-01 (DFS-070) demo story — closed; production sub-tasks GPS-01-1/2 and the R&D-findings gap fold in here"
integration_contracts:
  - DFMS-product-context/06-contracts/04-integration/gps-vts-integration.yaml
  - DFMS-product-context/06-contracts/04-integration/meeting-notes/2026-03-16-gpswox-integration.md
---

# GPS-01 — GPS Tracking & Monitoring (Provider Adapter & Live Vehicle Feed)

## User Story

**As a** Transport Planner and Transport Distribution Officer (TDO)
**I want to** view the real-time GPS location of all vehicles in my fleet
**So that** I can monitor trip progress, respond to delays, and ensure route compliance without relying on phone calls or manual check-ins.

**As a** Transport Planner
**I want to** have GPS tracking automatically linked to a trip the moment it goes in-transit
**So that** I can see where the vehicle is at every stage of the delivery lifecycle without any manual configuration.

---

## Business Context

### Why this story matters

DFMS transports finished goods (FG) and raw materials (RM) between depots, feed mills, and ports across geographically dispersed routes. Today, transport planners must phone drivers or rely on end-of-day check-ins to understand fleet status — leading to delayed response to breakdowns, missed ETAs, and disputed delivery claims.

PRD §6.5.5 mandates real-time GPS visibility as a Phase 1 obligation. This story is the foundation layer of the entire GPS/Maps epic: it produces the **live vehicle feed** that every other GPS story (GPS-02 geofence engine, GPS-03 event detection, GPS-04 dwell tracking, GPS-05 dashboard) depends on.

### How the GPS feed fits the operational flow

1. **Trip dispatched** → Driver Supervisor releases TO to Dispatch (DS-01).
2. **Driver starts trip** → Trip status transitions to `in_transit_*` (TLS-01 lifecycle hook).
3. **GPS auto-link activates** → system associates live GPS snapshots to vehicle ID, TO ID, and Trip ID — no manual step.
4. **Transport Planner and TDO monitor** → GPS-05 map dashboard shows the vehicle moving; GPS-03 fires ARRIVAL/DEPARTURE events when the vehicle crosses a POI geofence; GPS-04 accumulates dwell time.
5. **Trip completes** → GPS association stops; retention policy holds historical snapshots for audit.

### Provider context

The Sprint 5 R&D investigation identified two provider paths:
- **GPSWOX REST API** — cloud GPS fleet management platform; requires tenant credentials and API auth; polling via Celery; aligns with the [integration contract](../../../06-contracts/04-integration/gps-vts-integration.yaml).
- **GT06 protocol ingest** — in-house IoT device protocol already running in the stack from Sprint 5; retained as dev/fallback path.

If GPSWOX credentials remain blocked, the story ships on GT06 with the trade-off and recommended production path documented in the provider decision record (AC-6), accepted by PO and Tech Lead before sprint close.

### What "read-only GPS" means for RBAC

All GPS data is **read-only for every user**. No role may edit, delete, or manually set a vehicle's position. Writes happen only via the provider adapter (Celery task / GT06 ingest). This is a hard PRD §6.5.5 rule.

---

## Acceptance Criteria

### AC-1 — Pluggable provider adapter

- A provider interface maps any source (GPSWOX REST, GT06 ingest, mock) to one internal DTO: `vehicle_id`, `lat`, `lng`, `speed_kmh`, `device_timestamp`, `signal_quality`.
- GPSWOX REST polling implemented as a Celery task per the [integration contract](../../../06-contracts/04-integration/gps-vts-integration.yaml); secure API auth, secrets via env only.
- Active provider selected by configuration; GT06 path retained unchanged as fallback/dev.
- If GPSWOX credentials remain blocked mid-sprint, the story ships on GT06 with the blocker recorded in the provider decision record (AC-6) and PO acceptance noted.

### AC-2 — Vehicle identity & snapshots

- Each vehicle uniquely identifiable: registration / vehicle code ↔ `gps_tracker_id` (IMEI) ↔ provider device id; unmapped devices logged, never silently dropped.
- `VehicleGPSSnapshot` persisted per poll/ingest with a read-only admin; retention/pruning policy defined (extends the Sprint 5 ten-minute Postgres trail).

### AC-3 — Configurable refresh

- GPS poll/refresh interval configurable at deployment/tenant level — **30 s / 60 s / 120 s** options (PRD §6.5.5: interval TBD — default recorded with PO) — replacing Sprint 5's hardcoded 10 s constants.

### AC-4 — Trip association & lifecycle rules

- GPS data auto-linked to **vehicle ID, TO ID and Trip ID** from the moment trip status becomes `in_transit_*` (TLS-01 hook) until trip completion — no manual action.
- Vehicle lifecycle data maintained end-to-end; a vehicle used in any trip **cannot be deleted** (verify existing MDM guard; add if missing).
- GPS data is **read-only** on every surface — no mutation endpoint or admin edit.

### AC-5 — Signal-loss handling

- Last known location retained and served with explicit signal-lost status when updates stop; threshold confirmed with PO (PRD target 5 min vs Sprint 5's implemented 10 min — final value recorded and applied consistently).
- Documented note: location accuracy is GPS-provider and network dependent.

### AC-6 — Provider decision record (Sprint 5 R&D closeout)

- `GPS-R&D-findings.md` published in this folder: GPSWOX access status (credentials, auth, rate limits) vs the integration contract, GT06-vs-GPSWOX trade-off as built, recommended production poll interval, fallback strategy. Reviewed with Tech Lead + PO — closes the deliverable left unpublished by the Sprint 5 demo story.

---

## API Endpoints

All GPS data endpoints are **read-only** (GET only). Write surfaces are internal (Celery task / GT06 ingest) and have no external API.

```
# Internal / Celery — no public endpoint; triggered by task schedule
POST  (Celery task)  gps.tasks.poll_gpswox_provider          # GPSWOX REST poll on configured interval
POST  (Celery task)  gps.tasks.ingest_gt06_frame             # GT06 protocol ingest (fallback/dev)

# Vehicle GPS feed — consumed by GPS-05 dashboard and GPS-03 engine
GET   /api/v1/gps/vehicles/{vehicle_id}/latest               # latest snapshot for one vehicle
GET   /api/v1/gps/vehicles/live-feed                         # fleet-wide snapshot list (RBAC-scoped)

# Signal-loss query
GET   /api/v1/gps/vehicles/{vehicle_id}/signal-status        # last known position + signal_lost flag
```

> **GPS-03 and GPS-05** read directly from the `VehicleGPSSnapshot` table / Redis cache — they do not call these endpoints; the endpoints are for the frontend dashboard and any mobile consumers.

---

## Access & Permissions

| Action | Role |
|--------|------|
| View live vehicle positions (own-fleet vehicles) | Transport Planner (TP), TDO — Own Fleet, Tenant Admin |
| View live vehicle positions (vendor-fleet TOs) | TDO — Vendor Fleet, Tenant Admin |
| View signal-status / last known location | TP, TDO — Own Fleet, TDO — Vendor Fleet, Tenant Admin |
| View GPS snapshot history (read-only admin) | Tenant Admin, Super Admin |
| Configure provider / poll interval (deployment config) | Platform Admin (env config only — no runtime UI) |
| Write / mutate any GPS position data | **Nobody** — system-only via adapter task |

> GPS data is **read-only for all roles**. No user-facing write endpoint exists. RBAC at the fleet-feed endpoint scopes own-fleet TPs/TDOs to their tenant's own-fleet vehicles only.

---

## Sub-tasks — Sprint 6

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| GPS-01-1 | Provider adapter + GPSWOX poller | AC-1: interface, Celery polling task, config-based provider switch, GT06 fallback | High | Not started |
| GPS-01-2 | `VehicleGPSSnapshot` model | AC-2: model, read-only admin, device-id mapping, retention policy | High | Not started |
| GPS-01-3 | Configurable refresh interval | AC-3: 30/60/120 s setting; remove hardcoded constants | Medium | Not started |
| GPS-01-4 | Trip association hook | AC-4: TLS-01 `in_transit_*` auto-link to vehicle/TO/Trip; vehicle delete guard verification | High | Not started |
| GPS-01-5 | Signal-loss handling | AC-5: last-known-location serving, threshold decision + consistent application | Medium | Not started |
| GPS-01-6 | Provider decision record | AC-6: publish + review `GPS-R&D-findings.md` | Medium | Not started |

---

## Definition of Done

- [ ] Adapter polls the active provider on the configured interval and writes snapshots (AC-1, AC-3)
- [ ] Every mapped vehicle resolvable device → vehicle → trip; unmapped devices surfaced in logs (AC-2)
- [ ] Trip auto-association verified across a full `in_transit_*` → completed lifecycle (AC-4)
- [ ] Signal-lost behaviour matches the recorded threshold decision (AC-5)
- [ ] GPSWOX live, or GT06 fallback shipped with recorded blocker + PO acceptance (AC-1, AC-6)
- [ ] Provider decision record published and reviewed (AC-6)

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| GPSWOX production credentials | External | Open since Sprint 5; fallback rule in AC-1 |
| TLS-01 lifecycle | Integration | `in_transit_*` hook for trip association |
| Vehicle master data | Reads | `gps_tracker_id` mapping |
| GPS-03 / GPS-05 | Consumers | Geofence engine and dashboard read this feed |
| Redis / Celery | Infra | Already in stack |

---

*Epic: GPS & Maps Dashboard | Phase: 1 | Sprint 6: 3 SP | PRD: §6.5.5, §9.1 | Jira: DFS-077 | Last Updated: 2026-06-15*
