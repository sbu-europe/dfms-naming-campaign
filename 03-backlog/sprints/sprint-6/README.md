---
title: Sprint 6 — E2E Hardening, GPS Maps Dashboard Phase 1 Production, Vendor App Release & Phase 1 Readiness
sprint: Sprint 6
phase: Phase 1
dates: "2026-06-17 → 2026-07-01"
status: Planning
carry_from: Sprint 5
total_story_points_estimated: "~62 SP (23 E2E carry-over sub-tasks + GPS Phase 1 production + vendor app release/UX + Phase 1 readiness docs + tenant-wide audit trail)"
---

# Sprint 6 — E2E Hardening, GPS Maps Dashboard Phase 1 Production, Vendor App Release & Phase 1 Readiness

| | |
|---|---|
| **Sprint Dates** | 2026-06-17 → 2026-07-01 |
| **Carry-over from Sprint 5** | 23 E2E sub-tasks (all stories) + GPS Phase 1 production scope (~13 SP) |
| **Feedback Items** | None — no demo feedback open for Sprint 6 |
| **New Scope** | Vendor app release readiness (live API), vendor app design improvements, Phase 1 User Manual, Phase 1 UAT documentation |
| **Sprint 5 Exit** | ~108/~125 SP delivered; all 19 feedback items closed; functional scope complete |

---

## Sprint Goals

1. **E2E test coverage for Sprint 3 → Sprint 5 work (E2E-01)** — execute all 23 story-level E2E sub-tasks carried from Sprint 5 plus cross-module journey scenarios covering Sprint 3 flows (PR → TR → TO, port shipments, on-demand TO). Every Phase 1 story exits with its E2E Definition of Done satisfied. See [`01-e2e-hardening/E2E-01-sprint3-to-5-e2e-coverage.md`](01-e2e-hardening/E2E-01-sprint3-to-5-e2e-coverage.md).
2. **GPS Maps Dashboard — Phase 1 production (GPS-01 → GPS-05)** — graduate the Sprint 5 demo MVP to the full Phase 1 delivery per PRD §6.5.4–6.5.9 and §6.8.2, broken into five stories along the PRD user-story seams: GPS tracking & live vehicle feed ([GPS-01](02-gps-maps-dashboard/GPS-01-gps-tracking-monitoring.md)), geofence boundary management ([GPS-02](02-gps-maps-dashboard/GPS-02-poi-geofence-boundary-management.md)), arrival/departure event engine ([GPS-03](02-gps-maps-dashboard/GPS-03-geofence-engine-arrival-departure.md)), dwell time tracking ([GPS-04](02-gps-maps-dashboard/GPS-04-dwell-time-tracking.md)), and the maps dashboard with TO/PR integration ([GPS-05](02-gps-maps-dashboard/GPS-05-maps-dashboard-integration.md)). Sprint 5's open demo gaps fold in (R&D findings → GPS-01; POI map layer, degraded mode, PO sign-off → GPS-05). Delivery order follows the dependency chain GPS-01/02 → 03 → 04 → 05.
3. **Vendor app release readiness — live API (VAPP-01)** — produce a release-ready vendor mobile app build that runs against the live DFMS API: environment-based configuration, auth/session hardening, failure-state handling, signed release artifacts, and a live-API smoke test pass. See [`03-vendor-app/VAPP-01-release-readiness-live-api.md`](03-vendor-app/VAPP-01-release-readiness-live-api.md).
4. **Vendor app design improvements (VAPP-02)** — UX/UI polish pass across vendor app surfaces: consistent design system, loading/empty/error states, bid and trip lifecycle screen refinements. See [`03-vendor-app/VAPP-02-design-improvements.md`](03-vendor-app/VAPP-02-design-improvements.md).
5. **Phase 1 User Manual readiness (DOC-01)** — role-based user manual covering every Phase 1 module, reviewed and sign-off ready. See [`04-phase1-readiness-docs/DOC-01-phase1-user-manual.md`](04-phase1-readiness-docs/DOC-01-phase1-user-manual.md).
6. **Phase 1 UAT documentation (UAT-01)** — complete UAT package: test plan, role-based scenario scripts traceable to PRD ACs, entry/exit criteria, defect log template, and sign-off sheets. See [`04-phase1-readiness-docs/UAT-01-phase1-uat-documentation.md`](04-phase1-readiness-docs/UAT-01-phase1-uat-documentation.md).
7. **Tenant-wide audit trail (AUD-01)** — unify the per-story audit logging shipped across Sprints 3–5 into one tenant-wide standard with role-at-time-of-action capture, close coverage gaps (incl. auth events per PRD §6.2.7), and give Tenant Admin a single filtered, immutable, exportable audit viewer. See [`05-audit-logging/AUD-01-tenant-wide-audit-trail.md`](05-audit-logging/AUD-01-tenant-wide-audit-trail.md).

---

## Epic Summary

| # | Epic | Key Stories | SP | Feedback Items | Status |
|---|------|-------------|----|----------------|--------|
| 01 | E2E Hardening | E2E-01 (+ 23 carried story-level E2E sub-tasks) | ~21 SP | — | Carry-over (E2E debt, Sprint 3–5) |
| 02 | GPS & Maps Dashboard | GPS-01 → GPS-05 (Phase 1 production) | ~13 SP | — | New production stories (supersede Sprint 5 demo backlog) |
| 03 | Vendor Mobile App | VAPP-01, VAPP-02 | 8 + 5 SP | — | New Sprint 6 scope |
| 04 | Phase 1 Readiness & Documentation | DOC-01, UAT-01 | 5 + 5 SP | — | New Sprint 6 scope |
| 05 | Audit & Compliance | AUD-01 | 5 SP | — | New Sprint 6 scope |

**Total estimated**: ~62 SP

---

## Sprint 6 Scope — Sub-task Index

### Epic 01: E2E Hardening (E2E-01)

Carried story-level E2E sub-tasks (23 items — IDs unchanged, executed under E2E-01):

| Sub-task | Story | Sub-task | Story | Sub-task | Story |
|----------|-------|----------|-------|----------|-------|
| DS-01-19 | DS-01 | CC-01-12 | CC-01 | VM-04-13 | VM-04 |
| DS-02-19 | DS-02 | LD-01-10 | LD-01 | VM-05-11 | VM-05 |
| DM-01-13 | DM-01 | TLS-01-11 | TLS-01 | VM-06-10 | VM-06 |
| GT-01-14 | GT-01 | POD-01-11 | POD-01 | VM-07-6 | VM-07 |
| GT-02-13 | GT-02 | QC-01-14 | QC-01 | VM-08-5 | VM-08 |
| SC-01-14 | SC-01 | YARD-01-8 | YARD-01 | TEVF-01-8 | TEVF-01 |
| LUP-01-9 | LUP-01 | — | — | TEVF-02-6 | TEVF-02 |
| — | — | — | — | TEVF-03-5 | TEVF-03 |

New cross-module journey scenarios (Sprint 3 coverage + integration paths):

| Sub-task | Description | Priority |
|----------|-------------|----------|
| E2E-01-1 | E2E harness foundation — runner, staging/seed data strategy, CI wiring | High |
| E2E-01-2 | Journey: FG outbound own-fleet — PR → TR → DM approval → TO → dispatch → gate/scale/CC/load → gate-out → destination → POD → closure | High |
| E2E-01-3 | Journey: RM inbound port shipment — shipment registration → TR → TO → gate/scale → QC pass and QC fail/resample paths → unload → closure | High |
| E2E-01-4 | Journey: on-demand TO at gate (Dealer DO / Supplier PO) with multiple product line items | High |
| E2E-01-5 | Journey: vendor fleet non-contractual — registration/OTP → tenant join/approval → TO + Bid creation → bid submit/withdraw → evaluation/award → vehicle-driver submission → Start/Complete Trip → closure without POD | High |
| E2E-01-6 | Journey: vendor fleet contractual assignment → execution handoff → closure | Medium |
| E2E-01-7 | Journey: STK-01 stock lifecycle — TR approval reservation → scale-out deduction → QC pass credit → snapshot API/RBAC | Medium |
| E2E-01-8 | Dashboard verification — DB-01 KPI counts match underlying work screens per role (closes DB-01 partial AC from Sprint 5) | Medium |
| E2E-01-9 | E2E coverage report — pass/fail matrix per story, defects raised, published to sprint folder | Medium |

### Epic 02: GPS & Maps Dashboard (GPS-01 → GPS-05)

> Sprint 5's GPS demo story (DFS-070) is closed; its deferred production backlog (GPS-01-1 → GPS-01-13)
> and open demo gaps are **superseded** by stories GPS-01 → GPS-05 below
> (R&D findings → GPS-01-6; POI map layer → GPS-05-2; degraded mode → GPS-05-7; PO sign-off → GPS-05-9).
> Delivery order: GPS-01/GPS-02 → GPS-03 → GPS-04 → GPS-05.

| Story | Title | PRD | Jira | SP |
|-------|-------|-----|------|----|
| [GPS-01](02-gps-maps-dashboard/GPS-01-gps-tracking-monitoring.md) | GPS Tracking & Monitoring — provider adapter & live vehicle feed | §6.5.5, §9.1 | DFS-077 | 3 |
| [GPS-02](02-gps-maps-dashboard/GPS-02-poi-geofence-boundary-management.md) | POI Geofence Boundary Management — Tenant Admin config | §6.5.7 | DFS-078 | 1 |
| [GPS-03](02-gps-maps-dashboard/GPS-03-geofence-engine-arrival-departure.md) | Geofence Engine — arrival/departure events + TLS-01 timeline | §6.5.6, §6.5.8 | DFS-079 | 3 |
| [GPS-04](02-gps-maps-dashboard/GPS-04-dwell-time-tracking.md) | Dwell Time Tracking — calculation, visibility & threshold exceptions | §6.5.9 | DFS-080 | 2 |
| [GPS-05](02-gps-maps-dashboard/GPS-05-maps-dashboard-integration.md) | Maps Dashboard & TO/PR Integration — map UI, APIs & RBAC | §6.5.4, §6.8.2, §9.2 | DFS-081 | 4 |

| Sub-task | Story | Description | Priority |
|----------|-------|-------------|----------|
| GPS-01-1 | GPS-01 | Provider adapter + GPSWOX REST poller (Celery); config-based provider switch; GT06 fallback | High |
| GPS-01-2 | GPS-01 | `VehicleGPSSnapshot` model + read-only admin; device-id mapping; retention policy | High |
| GPS-01-3 | GPS-01 | Configurable refresh/poll interval (30/60/120 s); remove hardcoded constants | Medium |
| GPS-01-4 | GPS-01 | Trip association — TLS-01 `in_transit_*` auto-link to vehicle/TO/Trip; vehicle delete guard | High |
| GPS-01-5 | GPS-01 | Signal-loss handling — last known location + threshold decision | Medium |
| GPS-01-6 | GPS-01 | Provider decision record — publish `GPS-R&D-findings.md` (Sprint 5 closeout) | Medium |
| GPS-02-1 | GPS-02 | Geofence radius field + validation on POI admin; one active geofence per POI | High |
| GPS-02-2 | GPS-02 | Immediate effect for live trips — engine reads current radius at evaluation time | Medium |
| GPS-02-3 | GPS-02 | RBAC (config roles only), change audit log, delete confirmation | High |
| GPS-02-4 | GPS-02 | Dwell threshold config per POI + tenant default | Medium |
| GPS-03-1 | GPS-03 | Detection engine — haversine, Redis presence state, debounce rule | High |
| GPS-03-2 | GPS-03 | `GeofenceEvent` append-only model + read-only admin | High |
| GPS-03-3 | GPS-03 | Event linkage — vehicle always; Trip/TO when on-trip; source-vs-destination tagging | High |
| GPS-03-4 | GPS-03 | TLS-01 timeline emission — atomic with event write | High |
| GPS-03-5 | GPS-03 | `GET /api/v1/maps/transport-orders/{id}/geofence-events` history API | Medium |
| GPS-04-1 | GPS-04 | Dwell calculation on departure — source + destination, multi-visit, edge-case rules | High |
| GPS-04-2 | GPS-04 | Threshold exception task — in-fence periodic check + completed-stay marking | High |
| GPS-04-3 | GPS-04 | Trip-level dwell visibility — timeline + event history | Medium |
| GPS-04-4 | GPS-04 | Per-POI dwell aggregation report (avg/max, visits, exceptions) | Medium |
| GPS-05-1 | GPS-05 | `GET /api/v1/maps/dashboard` — vehicles, POIs, geofence zones, active trips, KPI widgets | High |
| GPS-05-2 | GPS-05 | Dashboard UI — POI markers + geofence circles, trip highlighting, KPI bar | High |
| GPS-05-3 | GPS-05 | `GET /api/v1/maps/vehicles/{id}/panel` — vehicle context side panel | High |
| GPS-05-4 | GPS-05 | `GET /api/v1/maps/transport-orders/{id}/route` — TO/Trip-centric map view | Medium |
| GPS-05-5 | GPS-05 | POI presence panel — vehicles currently in fence with entry time + duration | Medium |
| GPS-05-6 | GPS-05 | RBAC — `MapsDashboardPermission`; tests for all roles | High |
| GPS-05-7 | GPS-05 | Degraded-mode banner on provider failure; UAT verification (Sprint 5 closeout) | Medium |
| GPS-05-8 | GPS-05 | TO/PR linkage verification — POI dropdowns (Sprint 3) + STK-01 stock/capacity display | Medium |
| GPS-05-9 | GPS-05 | E2E scenario on the E2E-01 harness + PO walkthrough sign-off | Medium |

### Epic 03: Vendor Mobile App

| Sub-task | Story | Description | Priority |
|----------|-------|-------------|----------|
| VAPP-01-1 | VAPP-01 | Environment-based API configuration — dev/staging/production base URLs; no hardcoded endpoints or secrets in the repo | High |
| VAPP-01-2 | VAPP-01 | Live API integration pass — all vendor flows verified against live API (registration, OTP, login, forgot password, profile, delete account) | High |
| VAPP-01-3 | VAPP-01 | Live API integration pass — bid discovery, submission, withdrawal, award outcome; trip lifecycle (Start/Complete Trip), vehicle-driver submission | High |
| VAPP-01-4 | VAPP-01 | Auth/session hardening — token refresh, 401/403 handling, forced logout, multi-tenant context integrity | High |
| VAPP-01-5 | VAPP-01 | Failure-state handling — network timeout, API 4xx/5xx, offline messaging, retry strategy; no white-screens | High |
| VAPP-01-6 | VAPP-01 | Release build pipeline — signed artifacts, versioning scheme, build flavor per environment, crash/error reporting wired | High |
| VAPP-01-7 | VAPP-01 | Security review — TLS enforced, debug logging stripped from release, certificate/key handling, PII audit | Medium |
| VAPP-01-8 | VAPP-01 | Live-API smoke test checklist executed and recorded against staging + production | High |
| VAPP-02-1 | VAPP-02 | Design system pass — consistent colors, typography, spacing, components across all screens | High |
| VAPP-02-2 | VAPP-02 | Loading / empty / error state designs implemented on every list and detail screen | High |
| VAPP-02-3 | VAPP-02 | Bid screens UX refinement — bid card hierarchy, window countdown, winner state, status chips | Medium |
| VAPP-02-4 | VAPP-02 | Trip lifecycle screens UX refinement — milestone timeline readability, action button states, status colors | Medium |
| VAPP-02-5 | VAPP-02 | Form UX — inline validation feedback, OTP entry, document upload affordances | Medium |
| VAPP-02-6 | VAPP-02 | App identity — icon, splash screen, app name, store listing assets | Low |

### Epic 04: Phase 1 Readiness & Documentation

| Sub-task | Story | Description | Priority |
|----------|-------|-------------|----------|
| DOC-01-1 | DOC-01 | Manual structure + template approved (per-role chapters, screenshot conventions, versioning) | High |
| DOC-01-2 | DOC-01 | Office-role manuals — Requisition (PR), Port Shipments, Distribution (TR), Procurement, Transport Planning (TO/Trip), Dashboard | High |
| DOC-01-3 | DOC-01 | Yard-role manuals — Gate, Scaling, Command Center, Loading/Unloading, QC, Driver Supervisor | High |
| DOC-01-4 | DOC-01 | Driver mobile + vendor app manuals (onboarding, bids, trip execution) | High |
| DOC-01-5 | DOC-01 | Admin manuals — Tenant Admin (master data, POI/geofence, stock, users/roles), GPS Maps Dashboard | Medium |
| DOC-01-6 | DOC-01 | Review cycle complete — SME review per module, corrections applied, v1.0 published | High |
| UAT-01-1 | UAT-01 | UAT test plan — scope, roles, environment, schedule, entry/exit criteria | High |
| UAT-01-2 | UAT-01 | Scenario catalog — role-based UAT scripts per module, traceable to PRD acceptance criteria | High |
| UAT-01-3 | UAT-01 | Traceability matrix — PRD §6.x ACs ↔ UAT scenarios ↔ stories | High |
| UAT-01-4 | UAT-01 | UAT environment + seed data pack — tenants, roles, POIs, vehicles, vendors, stock baselines | High |
| UAT-01-5 | UAT-01 | Defect log template + severity/triage workflow agreed with PO | Medium |
| UAT-01-6 | UAT-01 | Sign-off package — per-module sign-off sheets, overall Phase 1 acceptance record | High |

### Epic 05: Audit & Compliance (AUD-01)

| Sub-task | Story | Description | Priority |
|----------|-------|-------------|----------|
| AUD-01-1 | AUD-01 | Unified audit event standard — schema, role-at-time-of-action, system-actor convention | High |
| AUD-01-2 | AUD-01 | Coverage matrix per module + close all High gaps (incl. login/logout/lockout events) | High |
| AUD-01-3 | AUD-01 | Map Sprint 4/5 module logs (DS, LUP, VM, POD, STK) onto the standard — no duplication | High |
| AUD-01-4 | AUD-01 | Tenant Admin audit viewer — filters (date, user, role, module, entity, action), detail view, CSV export | High |
| AUD-01-5 | AUD-01 | Access control — Tenant Admin-only RBAC, tenant isolation test, viewer access audited | High |
| AUD-01-6 | AUD-01 | Integrity & retention — immutability guard, 2-year configurable retention, audit-failure monitoring | Medium |

---

## Deferred Scope (not Sprint 6)

| Item | Target |
|------|--------|
| Driver mobile background location / in-app navigation | Later sprint |
| GPS-based vehicle maintenance tracking (§6.5.10) | Phase 2 |
| Trip route playback / historical GPS track replay | Later sprint |
| Trip costing (§6.8.8) | Later sprint |
| Incident, halt, re-delivery workflow (§6.8.6) | Phase 2 |
| Detailed physical / lab QC sub-workflows | Later sprint |
| Push notifications for CC assignment / loading alerts | Phase 3 |
| Vendor billing, claims, rating, advanced bid probability | Phase 2 / Phase 3 |
| Vendor app store publication / distribution rollout | Post-UAT (release readiness only this sprint) |
| System Usage & Audit Reports suite (§6.19.5) | Phase 3 — AUD-01 delivers the Phase 1 audit trail + viewer only |

---

## Reference Documents

- [Sprint 5 README](../sprint-5/README.md) — full carry-over context and Sprint 5 goals
- [Sprint 5 Completion Report](../sprint-5/completion-report.md) — delivered scope, carry-forward list (23 E2E sub-tasks, GPS-01 Phase 1)
- [GPS-01 Sprint 5 story (demo MVP)](../sprint-5/12-gps-maps-dashboard/GPS-01-maps-dashboard-gps-tracking.md) — as-built demo, AC validation, Phase 1 deferred items
- [Module 09 — Live GPS implementation (GT06 server)](../../05-modules/09-tracking/gt06-server.md) — Sprint 5 backend architecture
- [GPS/VTS integration contract](../../06-contracts/04-integration/gps-vts-integration.yaml) — GPSWOX provider contract
- [PRD §6.5.4–6.5.9, §6.8.2](../../01-source/01-prd/PRD_DFMS_v1.0.md) — map layer integration, GPS tracking, geofencing, dwell time, map-based dashboard
- [Vendor Trip Lifecycle & Status Model](../sprint-5/08-vendor-management/VENDOR-TRIP-LIFECYCLE.md) — canonical TLS-01 flow consumed by vendor app
- [TO Creation & Vendor Bidding Flow Revision](../sprint-5/08-vendor-management/TO-BID-FLOW-REVISION.md) — Bid bundle model the vendor app release must match

---

**Sprint Lead**: ~
**Last Updated**: 2026-06-12 (initial Sprint 6 plan)
**Previous**: [Sprint 5](../sprint-5/README.md)
