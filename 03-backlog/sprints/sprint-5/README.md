---
title: Sprint 5 — Own-Fleet Hardening, Vendor Management Completion & E2E Coverage
sprint: Sprint 5
phase: Phase 1
dates: "2026-06-02 → 2026-06-16"
status: Planning
carry_from: Sprint 4
total_story_points_estimated: "~125 SP (carry-over + feedback-driven scope + GPS-01 + STK-01 new scope)"
---

# Sprint 5 — Own-Fleet Hardening, Vendor Management Completion & E2E Coverage

| | |
|---|---|
| **Sprint Dates** | 2026-06-02 → 2026-06-16 |
| **Carry-over from Sprint 4** | ~28 SP own-fleet + ~38 SP vendor-context |
| **Feedback Items** | 19 open (FB-001 → FB-019) |
| **E2E Story-Level Sub-tasks** | 23 pending |
| **Overall Sprint 4 Exit** | ~70% own-fleet / ~62% vendor-context |

---

## Sprint Goals

1. **Close all Sprint 4 carry-over subtasks** — every story marked open in `completion-report.md` exits Sprint 5 with Definition of Done satisfied.
2. **Resolve all 19 demo feedback items** (FB-001–FB-019) — AC amendments applied, implementations verified. See [`feedback-resolution.md`](feedback-resolution.md).
3. **Complete full API surface** — timeline, status, closure, CC queue, LUP, and TLS-01 read endpoints that were Not Done in Sprint 4.
4. **Story-level E2E sub-tasks** — all 23 E2E sub-tasks (DS-01-19 through TEVF-03-5) pass within their owning stories.
5. **GPS Maps Dashboard (GPS-01 — new scope)** — deliver Phase 1 map-based transport dashboard with live GPS vehicle tracking, POI geofence engine, dwell time monitoring, and role-restricted access (Tenant Admin, Transport Planner, TDO). See [`12-gps-maps-dashboard/GPS-01-maps-dashboard-gps-tracking.md`](12-gps-maps-dashboard/GPS-01-maps-dashboard-gps-tracking.md).
6. **Source & Destination Stock Validation (STK-01 — new scope)** — deliver event-driven POI stock accounting: source reservation on TR approval, stock deduction on scale-out (SC-01), destination stock credit on QC pass (QC-01), capacity guards, and role-scoped stock snapshot API. See [`13-stock-validation-update/STK-01-source-destination-stock-validation.md`](13-stock-validation-update/STK-01-source-destination-stock-validation.md).

---

## Epic Summary

| # | Epic | Key Stories | Carry-over SP | Feedback Items | Status |
|---|------|-------------|---------------|----------------|--------|
| 01 | Driver Supervisor & Crew | DS-01, DS-02 | 10 SP | FB-008, FB-009 | Carry-over |
| 03 | Driver Mobile | DM-01 | 8 SP | FB-002, FB-003, FB-004 | Carry-over |
| 04 | Gate Operations | GT-01, GT-02 | 16 SP | FB-001, FB-007 | Carry-over |
| 05 | Scaling / Weighing | SC-01 | 8 SP | — | Carry-over |
| 06 | Command Center & Loading | LUP-01, CC-01, LD-01 | 18 SP | FB-001, FB-005, FB-006 | Carry-over |
| 07 | Lifecycle, POD & QC | TLS-01, POD-01, QC-01 | 23 SP | FB-002, FB-004, FB-006 | Carry-over |
| 08 | Vendor Management | VM-01 → VM-08 | ~38 SP vendor-context | FB-010–FB-019 | Carry-over |
| 09 | TO Execution — Vendor Fleet | TEVF-01, TEVF-02, TEVF-03 | Vendor-context | FB-013, FB-016, FB-018 | Carry-over |
| 10 | Yard Foundation | YARD-01 | 8 SP | — | Carry-over |
| 12 | GPS & Maps Dashboard | GPS-01 | 8 SP (demo) / ~21 SP Phase 1 | — | **MVP done** — [completion](12-gps-maps-dashboard/GPS-01-implementation-completion.md) |
| 13 | Stock & Capacity Management | STK-01 | 13 SP | — | New sprint-5 scope |

---

## Pending Scope — Carry-over Subtask Index

### Epic 01: Driver Supervisor

| Sub-task | Story | Description | Priority |
|----------|-------|-------------|----------|
| DS-01-7 | DS-01 | Align `mark_vehicle_under_maintenance` to transition linked TOs → `under_planning` (currently resets to `created`) | High |
| DS-01-12 | DS-01 | Fix `POST .../under-maintenance` to transition linked TOs → `under_planning` (not `created`) | High |
| DS-01-14 | DS-01 | Central audit logging for skip/complete/reject inspection actions | High |
| DS-01-17 | DS-01 | Return-to-service audit event on `Available` transition | Medium |
| DS-01-19 | DS-01 | E2E test coverage (Sprint 5 E2E sub-task) | Medium |
| DS-02-6 | DS-02 | `DriverStateAdmin` list with state badges, POI filter, read-only for non-supervisor | High |
| DS-02-10 | DS-02 | TLS-01 hooks — auto-update driver state on TO assignment/execution start/completion | High |
| DS-02-17 | DS-02 | Complete audit trail for state transitions, attendance, and leave | High |
| DS-02-18 | DS-02 | Separate Attendance and Leave Management as distinct menu items (FB-008) | Medium |
| DS-02-19 | DS-02 | E2E test coverage (Sprint 5 E2E sub-task) | Medium |

### Epic 03: Driver Mobile

| Sub-task | Story | Description | Priority |
|----------|-------|-------------|----------|
| DM-01-5 | DM-01 | Complete TO detail API — `flow_lane`, status/sub-state, product, qty, `allowed_next_transitions` | High |
| DM-01-12 | DM-01 | Trip Start button — single lane-aware action replacing In Transit Source/Destination (FB-003) | High |
| DM-01-13 | DM-01 | E2E test coverage (Sprint 5 E2E sub-task) | Medium |

### Epic 04: Gate Operations

| Sub-task | Story | Description | Priority |
|----------|-------|-------------|----------|
| GT-01-3 | GT-01 | Complete document category routing at gate-in (Supplier/Dealer behind feature flag) | High |
| GT-01-9 | GT-01 | Complete `GATE_IN` / `GATE_OUT` TLS-01 event emission | High |
| GT-01-10 | GT-01 | Complete gateman UI — fast-entry gate-in form | High |
| GT-01-11 | GT-01 | Complete gate-out form with guard status indicators | High |
| GT-01-14 | GT-01 | E2E test coverage (Sprint 5 E2E sub-task) | Medium |
| GT-02-12 | GT-02 | Multiple product line items on on-demand TO creation (FB-001, FB-007) | High |
| GT-02-13 | GT-02 | E2E test coverage (Sprint 5 E2E sub-task) | Medium |

### Epic 05: Scaling

| Sub-task | Story | Description | Priority |
|----------|-------|-------------|----------|
| SC-01-5 | SC-01 | Complete scale-in REST API (gate-in prerequisite enforcement, 409 on duplicate P.C. code) | Medium |
| SC-01-6 | SC-01 | Scale-in list/detail REST API | Medium |
| SC-01-8 | SC-01 | Complete scale-out detail REST API (net weight, gate-pass data) | Medium |
| SC-01-9 | SC-01 | Queue token print template — Vehicle Number, P.C. code, Product Type, all required fields | Medium |
| SC-01-14 | SC-01 | E2E test coverage (Sprint 5 E2E sub-task) | Medium |

### Epic 06: Command Center & Loading

| Sub-task | Story | Description | Priority |
|----------|-------|-------------|----------|
| LUP-01-2 | LUP-01 | Complete LoadingUnloadingPointAdmin standalone form + save_model validation | Medium |
| LUP-01-4 | LUP-01 | Create L/U point API (POST) | Medium |
| LUP-01-5 | LUP-01 | List-by-POI API (GET) | Medium |
| LUP-01-6 | LUP-01 | Update API (PATCH) | Medium |
| LUP-01-7 | LUP-01 | Audit logging on create/update/deactivate | Medium |
| LUP-01-8 | LUP-01 | UAT seed data — 2+ POIs with multiple L/U points | Medium |
| LUP-01-9 | LUP-01 | E2E test coverage (Sprint 5 E2E sub-task) | Medium |
| CC-01-5 | CC-01 | Queue list API (GET) with filters | High |
| CC-01-6 | CC-01 | Bay assignment API (POST) | High |
| CC-01-7 | CC-01 | Waiting serial issuance API (POST) — multi-vehicle per point + daily reset at 12:00 AM (FB-005) | High |
| CC-01-8 | CC-01 | "My bay" read API for loading personnel (GET) | High |
| CC-01-9 | CC-01 | Command Center UI — queue view, assignment form, serial issuance | High |
| CC-01-12 | CC-01 | E2E test coverage (Sprint 5 E2E sub-task) | Medium |
| LD-01-9 | LD-01 | Loading/unloading input captured per product line item (FB-001) | High |
| LD-01-10 | LD-01 | E2E test coverage (Sprint 5 E2E sub-task) | Medium |

### Epic 07: Lifecycle, POD & QC

| Sub-task | Story | Description | Priority |
|----------|-------|-------------|----------|
| TLS-01-2 | TLS-01 | Complete `TO_STATUS_TRANSITIONS` + driver rules wiring; yard integration matrix fully verified | High |
| TLS-01-4 | TLS-01 | `TOTimelineInline` TabularInline under TransportOrderAdmin | Medium |
| TLS-01-7 | TLS-01 | Timeline REST API `GET …/timeline` | High |
| TLS-01-8 | TLS-01 | Status REST API `GET …/status` (status, sub_state, flow_lane) | High |
| TLS-01-10 | TLS-01 | Complete `apply_to_status_transition()` for break-glass `POST …/transitions` | Medium |
| TLS-01-11 | TLS-01 | E2E test coverage (Sprint 5 E2E sub-task) | Medium |
| POD-01-6 | POD-01 | Auto-close trigger — evaluates closure rules on last prerequisite fulfillment | High |
| POD-01-7 | POD-01 | Closure attempt API (POST) — returns 200 or 422 with blocking reasons | High |
| POD-01-8 | POD-01 | Closure status API (GET) — checklist state + blocking reasons | High |
| POD-01-9 | POD-01 | Planner closure dashboard + exceptions list | High |
| POD-01-11 | POD-01 | E2E test coverage (Sprint 5 E2E sub-task) | Medium |
| QC-01-4 | QC-01 | Complete resample admin action — full unloading assignment cancellation | High |
| QC-01-5 | QC-01 | Complete override-to-failed admin action + timeline event with previous decision audit | High |
| QC-01-6 | QC-01 | Complete QC sample creation API (POST) | High |
| QC-01-12 | QC-01 | Complete TLS-01 event emission for all QC actions + POD-01 closure gate integration | High |
| QC-01-13 | QC-01 | Product-line QC Required flag triggers QC (not only broad RM classification) (FB-006) | High |
| QC-01-14 | QC-01 | E2E test coverage (Sprint 5 E2E sub-task) | Medium |

### Epic 08: Vendor Management

| Sub-task | Story | Description | Priority |
|----------|-------|-------------|----------|
| VM-01-7 | VM-01 | Complete audit logging for registration/document/profile mutations | Medium |
| VM-01-9 | VM-01 | OTP verification on registration + sensitive account actions (FB-010) | High |
| VM-01-10 | VM-01 | Forgot password + password reset flow (FB-011) | High |
| VM-01-11 | VM-01 | Delete account — confirmation, soft-delete policy, audit (FB-012) | Medium |
| VM-01-12 | VM-01 | E2E test coverage (Sprint 5 E2E sub-task) | Medium |
| VM-02-8 | VM-02 | Enforce exactly one vendor type on approval UI + API (FB-017) | High |
| VM-02-9 | VM-02 | E2E test coverage (Sprint 5 E2E sub-task) | Medium |
| VM-03-9 | VM-03 | TO lifecycle management in Vendor Portal — TLS-01 execution, Start/Complete Trip, milestone timeline (FB-013); see [`VENDOR-TRIP-LIFECYCLE.md`](08-vendor-management/VENDOR-TRIP-LIFECYCLE.md) | High |
| VM-03-10 | VM-03 | App auto-refresh on tab change (FB-014) | Medium |
| VM-03-11 | VM-03 | E2E test coverage (Sprint 5 E2E sub-task) | Medium |
| VM-04-10 | VM-04 | Enforce `required_vehicle_count = 1` at publish (FB-016) | High |
| VM-04-11 | VM-04 | Bid requirement form before TO creation (FB-018) | High |
| VM-04-12 | VM-04 | Single TR → multiple TOs in one bid session | Medium |
| VM-04-13 | VM-04 | E2E test coverage (Sprint 5 E2E sub-task) | Medium |
| VM-05-5 | VM-05 | `GET .../bids/{bid_id}` — vendor reads own bid | Medium |
| VM-05-6 | VM-05 | `DELETE .../bids/{bid_id}` — withdraw before close | Medium |
| VM-05-7 | VM-05 | TDO manual close/cancel bidding without award | Medium |
| VM-05-9 | VM-05 | Bid view UX — winner state, window labels, TDO context (FB-015) | Medium |
| VM-05-10 | VM-05 | Cap `offered_vehicle_count` to 1 aligned with VM-04-10 (FB-016) | High |
| VM-05-11 | VM-05 | E2E test coverage (Sprint 5 E2E sub-task) | Medium |
| VM-06-8 | VM-06 | TDO bid evaluation UX — winner indication, window timeline display (FB-015) | Medium |
| VM-06-9 | VM-06 | Single-winner default when `required_vehicle_count = 1` | High |
| VM-06-10 | VM-06 | E2E test coverage (Sprint 5 E2E sub-task) | Medium |
| VM-07-6 | VM-07 | E2E test coverage (Sprint 5 E2E sub-task) | Medium |
| VM-08-4 | VM-08 | TLS-01 lifecycle events (+ sub_state) emitted to vendor portal lifecycle views | High |
| VM-08-5 | VM-08 | E2E test coverage (Sprint 5 E2E sub-task) | Medium |

### Epic 09: TO Execution — Vendor Fleet

| Sub-task | Story | Description | Priority |
|----------|-------|-------------|----------|
| TEVF-01-2 | TEVF-01 | Assignment persistence — TO↔vendor link with capacity split | Medium |
| TEVF-01-8 | TEVF-01 | E2E test coverage (Sprint 5 E2E sub-task) | Medium |
| TEVF-02-5 | TEVF-02 | Execution handoff — post-award vendor sees outcome + enters VM-07/VM-08 tracks | High |
| TEVF-02-6 | TEVF-02 | E2E test coverage (Sprint 5 E2E sub-task) | Medium |
| TEVF-02-7 | TEVF-02 | One vehicle per TO enforcement at publish + bid (FB-016) | High |
| TEVF-02-8 | TEVF-02 | Single TR → multiple TOs in one bidding session (FB-018) | Medium |
| TEVF-02-9 | TEVF-02 | Bid view UX — winner, window copy, TDO context (FB-015) | Medium |
| TEVF-03-4 | TEVF-03 | Vendor portal TO lifecycle screens + Start/Complete Trip + tab-change refresh (FB-013) | High |
| TEVF-03-5 | TEVF-03 | E2E test coverage (Sprint 5 E2E sub-task) | Medium |

### Epic 10: Yard Foundation

| Sub-task | Story | Description | Priority |
|----------|-------|-------------|----------|
| YARD-01-1 | YARD-01 | Complete operator-to-site assignment + one-time invite migration | High |
| YARD-01-3 | YARD-01 | Complete source vs destination flag on gate visit + backfill existing visits | High |
| YARD-01-4 | YARD-01 | Current yard step on TO; CC/QC/loading screens filter by yard step | High |
| YARD-01-8 | YARD-01 | E2E test coverage (Sprint 5 E2E sub-task) | Medium |

### Epic 13: Stock & Capacity Management (New Sprint 5 Scope)

| Sub-task | Story | Description | Priority |
|----------|-------|-------------|----------|
| STK-01-1 | STK-01 | `POIStock` model (one-to-one with POI); stock fields + computed `free_capacity_mt`; seed migration | High |
| STK-01-2 | STK-01 | Source stock reservation on TR approval; release on TR rejection / cancellation | High |
| STK-01-3 | STK-01 | Scale-out deduction — SC-01 integration; `apply_scale_out_stock_deduction()` + movement log | High |
| STK-01-4 | STK-01 | Destination stock update — QC-01 integration; QC pass credits, QC fail rejects; movement log | High |
| STK-01-5 | STK-01 | Source availability guard — CC-01 bay assignment returns 409 on insufficient stock | High |
| STK-01-6 | STK-01 | Destination capacity guard — TR/TO approval warning + DM override with mandatory remarks | High |
| STK-01-7 | STK-01 | `GET /api/v1/pois/{poi_id}/stock-snapshot` API with RBAC per role matrix | High |
| STK-01-8 | STK-01 | `POIStockMovementLog` append-only model + Tenant Admin read-only admin view | Medium |
| STK-01-9 | STK-01 | `capacity_threshold_pct` per POI + tenant default; threshold badge in snapshot response | Medium |
| STK-01-10 | STK-01 | In-transit stock tracking on TO dispatch → `in_transit_source` TLS-01 hook | Medium |
| STK-01-11 | STK-01 | E2E test coverage (Sprint 5 E2E sub-task) | Medium |

### Epic 12: GPS & Maps Dashboard (New Sprint 5 Scope)

| Sub-task | Story | Description | Priority |
|----------|-------|-------------|----------|
| GPS-01-1 | GPS-01 | GPS/VTS provider adapter — pluggable REST polling Celery task; writes `VehicleGPSSnapshot` | High |
| GPS-01-2 | GPS-01 | `VehicleGPSSnapshot` model + read-only admin | High |
| GPS-01-3 | GPS-01 | Geofence engine — haversine detection, entry/exit events, Redis presence state | High |
| GPS-01-4 | GPS-01 | `GeofenceEvent` model + admin | High |
| GPS-01-5 | GPS-01 | Dwell time calculation on departure + periodic threshold alert task | High |
| GPS-01-6 | GPS-01 | `GET /api/v1/maps/dashboard` — vehicles, POIs, KPI widgets | High |
| GPS-01-7 | GPS-01 | `GET /api/v1/maps/vehicles/{id}/panel` — vehicle context side panel | High |
| GPS-01-8 | GPS-01 | `GET /api/v1/maps/transport-orders/{id}/route` — TO-centric map view | Medium |
| GPS-01-9 | GPS-01 | `GET /api/v1/maps/transport-orders/{id}/geofence-events` — geofence event history | Medium |
| GPS-01-10 | GPS-01 | RBAC enforcement — `MapsDashboardPermission`; unit tests for all roles | High |
| GPS-01-11 | GPS-01 | TLS-01 timeline integration — GPS events emitted atomically to TO timeline | High |
| GPS-01-12 | GPS-01 | Admin: POI geofence radius + dwell threshold config with audit log | Medium |
| GPS-01-13 | GPS-01 | E2E test coverage (Sprint 5 E2E sub-task) | Medium |

---

## Deferred Scope (not Sprint 5)

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

> **Note**: Live map dashboard and GPS tracking core (§6.5.4–6.5.9, §6.8.2) are **moved into Sprint 5** as GPS-01 (21 SP). See [`12-gps-maps-dashboard/`](12-gps-maps-dashboard/).

---

## Reference Documents

- [Sprint 4 README](../sprint-4/README.md) — full story context, business rules, and implemented ACs
- [Sprint 4 Completion Report](../sprint-4/completion-report.md) — gap analysis per story
- [Sprint 5 Feedback Resolution](feedback-resolution.md) — FB-001..FB-019 tracker
- [Vendor Trip Lifecycle & Status Model](08-vendor-management/VENDOR-TRIP-LIFECYCLE.md) — canonical TLS-01 flow for vendor app (VM-03, VM-07, VM-08, TEVF-03)
- [**TO Creation & Vendor Bidding Flow Revision**](08-vendor-management/TO-BID-FLOW-REVISION.md) — **product flow change (2026-06-09):** separate TO creation (Single/Multiple tabs) from Bid bundling; Bid ID on vendor mobile; per-TO award. Supersedes FB-018 / VM-04-11 / VM-04-12 intent.
- [GPS-01 — Maps Dashboard & GPS Tracking](12-gps-maps-dashboard/GPS-01-maps-dashboard-gps-tracking.md) — Sprint 5 demo MVP implemented
- [GPS-01 implementation completion](12-gps-maps-dashboard/GPS-01-implementation-completion.md) — AC checklist vs code
- [Module 09 — Live GPS implementation spec](../../05-modules/09-tracking/live-gps-sprint5-implementation.md)
- [STK-01 — Source & Destination Stock Validation](13-stock-validation-update/STK-01-source-destination-stock-validation.md) — new Sprint 5 scope; 13 SP

---

**Sprint Lead**: ~
**Last Updated**: 2026-06-09 (TO/bid flow revision documented; vendor trip lifecycle aligned to TLS-01)
**Previous**: [Sprint 4](../sprint-4/README.md)
