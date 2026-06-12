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

- GPS poll/refresh interval configurable at deployment/tenant level — **30 s / 60 s / 120 s** options (PRD: interval TBD — default recorded with PO) — replacing Sprint 5's hardcoded 10 s constants.

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

*Epic: GPS & Maps Dashboard | Phase: 1 | Sprint 6: 3 SP | PRD: §6.5.5, §9.1 | Jira: DFS-077 | Last Updated: 2026-06-12*
