---
title: Sprint 4 Completion Report
sprint: Sprint 4
phase: Phase 1
date: 2026-05-25
status: PARTIAL — ~70% own-fleet; ~62% vendor-context
total_story_points_planned: 91 (own-fleet) + 62 (vendor context)
branch: feat/sprint-4-conflict-resolve
---

# Sprint 4 Completion Report
## Own-Fleet Yard & Field Execution — Driver Supervisor, Gate, Scaling, Command Center, Loading, Lifecycle, QC, Vendor Management

**Dates**: 2026-05-07 → 2026-05-21  
**Branch**: `feat/sprint-4-conflict-resolve`  
**Status**: ⚠️ **PARTIAL** — core models and admin delivered; API surface and E2E completion carry to Sprint 5  
**Demo**: 2026-05-21 — 19 actionable feedback items captured (see §Demo Feedback)

---

## 📊 Summary

| Metric | Planned | Delivered |
|--------|---------|-----------|
| Own-Fleet Story Points | 91 SP | ~63 SP (~70%) |
| Vendor-Context Story Points | 62 SP (context only) | ~38 SP (~62%) |
| Epics | 9 | 9 partially delivered |
| Commits | — | 72 commits on `feat/sprint-4-conflict-resolve` |
| Files Changed | — | 195 files (31,033 insertions / 358 deletions) |
| Python Files Changed | — | 158 |
| New Migrations | — | 27 |
| New Templates | — | 27 |
| Apps Touched | — | `core`, `fleet_supervisor`, `master_data`, `operations`, `quality`, `requisitions`, `transport`, `users`, `vendors` |
| Demo Feedback Items | — | 19 (all open → Sprint 5 backlog) |
| E2E Sub-tasks Carried Forward | — | 23 story-level E2E sub-tasks → Sprint 5 |

---

## ✅ Delivered Epics & Stories

### 1. Driver Supervisor & Crew Operations — DS-01 + DS-02 ✅ (Core) / ⚠️ Gaps

**Story Points**: 10 SP | **Jira**: DFS-050, DFS-051 | **Completion**: ~75%

#### DS-01 — Vehicle Licence, Health & Handover Checklists (DFS-050)

- Predefined daily inspection checklist seeded via data migration (`0002_seed_checklist.py`): **7 sections** (Engine, Clutch, Gear Box, Container, Electric, Chassis, Cabin), **55 checklist items** — immutable in production
- `VehicleInspection` + `ChecklistResponse` models: FK to TO and vehicle, per-item outcome (`ok` / `issue` / `na`), remarks, supervisor and timestamp
- **Pre-dispatch flow**: Driver Supervisor sees TO queue in `ready_for_dispatch` status; two paths available:
  - **Skip inspection** → TO transitions to `dispatched` immediately
  - **Checklist path** → Supervisor completes items → `complete_inspection` → TO to `dispatched`
- **Fail path**: `reject_inspection` → vehicle → **Under Maintenance**; TO → `under_planning`; vehicle/driver crew cleared; vehicle excluded from new TDO assignment picker
- **Maintenance queue**: supervisor sees all vehicles with `operational_status = Under Maintenance` scoped to their site; search/filter by registration
- **Re-inspection (return-to-service)**: supervisor starts maintenance-clearance inspection (no TO required); pass → vehicle → **Available**; fail → vehicle stays Under Maintenance; `is_active=False` MDM guard prevents clearing inactive vehicles
- **APIs implemented** (`apps/fleet_supervisor/urls.py`):
  - `GET /api/v1/checklist-template`
  - `GET /api/v1/inspections/queue`
  - `POST /api/v1/transport-orders/<to_id>/dispatch` (intent: `skip_inspection` | `start_inspection`)
  - `GET/PATCH /api/v1/inspections/<inspection_id>/responses`
  - `POST /api/v1/inspections/<inspection_id>/approve`
  - `POST /api/v1/inspections/<inspection_id>/reject`
  - `POST /api/v1/vehicles/<vehicle_id>/under-maintenance`

**Remaining**: skip-dispatch audit record (who/when skipped), `mark_vehicle_under_maintenance` aligned to `under_planning` (currently resets to `created`), central audit logging for all inspection events, automated tests

#### DS-02 — Driver State, Attendance & Leave (DFS-051)

- `Driver.state` enum: `Available`, `Assigned`, `On Leave`, `On Execution` — default Available
- `DriverAttendance` model: driver, POI, entry/exit datetime, date; unique-together (driver, date) at DB level
- `DriverLeave` model: start/end dates, reason, `created_by`; `save_model` transitions driver to **On Leave**
- `DriverStateLog` audit model: from/to state, changed_by, timestamp, trigger type
- Driver state machine service: transition rules validated; rejects invalid transitions with descriptive errors; logs every transition
- **On Leave blocks TDO assignment**: API returns validation error when TDO attempts to assign On Leave driver (TO-02 conflict guard extended)
- Working hours guardrail: configurable max daily hours (default 12h); soft warning on attendance entry when exceeded
- Django Admin: `DriverLeaveAdmin` (date range picker), `DriverAttendanceAdmin` (date hierarchy), supervisor-scoped views
- **APIs implemented**: full CRUD for attendance and leave; `GET /api/v1/drivers/state-board`; cancel leave early
- **Remaining**: `DriverStateAdmin` state board list view (state badges, filter), TLS-01 auto-state hooks on TO assignment/execution/completion, separate Attendance and Leave portal menu items (FB-008), full audit trail

---

### 2. Driver Mobile Interface — DM-01 ✅ (Core) / ⚠️ Gaps

**Story Points**: 8 SP | **Jira**: DFS-053 | **Completion**: ~80%

- `ProofOfDelivery` + `ProofOfDeliveryFile` models: up to **3 files per TO** (JPEG, PNG, PDF), optional signature, `submitted_by`, `submitted_at`; FK to TO
- **Dispatch gate enforced**: TOs in `ready_for_dispatch` visible with "Awaiting dispatch by supervisor" messaging; transition API returns stable error until `dispatched`
- **Post-dispatch transitions**: driver-triggered TLS-01 lane-aware transitions (FG outbound, FG inbound, RM inbound paths); invalid transitions rejected with stable error
- **Fleet availability check** (§6.8.1.7): first driver transition after `dispatched` validates vehicle/driver availability (maintenance, on-leave)
- **POD upload**: enabled only at `completed` status; 1–3 files; JPEG/PNG auto-compressed before storage; PDF stored within size limit
- `ProofOfDeliveryAdmin`: read-only with file previews for support/debug
- **Mobile-responsive UI** (card layouts, touch-friendly buttons, tab filters: awaiting dispatch / in progress / completed)
- Audit logging on all driver transitions and POD submissions; no GPS/map in Sprint 4
- **APIs implemented**: `GET/POST /api/v1/driver/transport-orders`, detail, transitions, timeline, POD submit/retrieve
- **Remaining**: single **Trip Start** button replacing two In Transit actions (FB-003), TO detail API completeness (`flow_lane`, `allowed_next_transitions`), driver ownership security (404 for non-owned TOs), unit tests for dispatch gate and lane-specific transitions

---

### 3. Yard Foundation — YARD-01 ✅ (Core) / ⚠️ Gaps

**Story Points**: 8 SP | **Jira**: DFS-065 | **Completion**: ~75%

- `UserOperationalPOI` model: runtime POI assignment per user per role_code; invite flow auto-creates assignment
- POI-scoped access for all yard roles: `gateman`, `scaling_operator`, `command_center_officer`, `loading_personnel`, `unloading_personnel`, `qc_inspector_physical`
- **Working-site resolution**: when a user opens any yard screen, their assigned POI is resolved from `UserOperationalPOI`; if unassigned → empty list + clear contact-admin message (no cross-site data leakage)
- **Source vs destination visit flag** recorded on gate-in for all TO visits
- **`YardAdminBase`**: shared base class providing POI resolution via `WeighingSession`; adopted by ScaleIn, ScaleOut, CC, Loading, Unloading admins — single site-scoping pattern across all POI-scoped admins
- `yard_leg` field on TransportOrder: records whether the visit is at source or destination
- Reference table: allowed actions per flow lane and per visit (gate, weigh, assign bay, load, unload, QC)
- Gate screens: no regression for `gateman` and `gate_supervisor` after shared rule application
- **Remaining**: existing gate visit backfill (source/destination for historical records), tenant admin UI for operational POI assignment, yard-screen filtering by current `sub_state` step

---

### 4. Gate Operations — GT-01 + GT-02 ✅ (Core) / ⚠️ Gaps

**Story Points**: 16 SP | **Jira**: DFS-054, DFS-062 | **Completion**: ~75%

#### GT-01 — Gate-In, Gate-Out & Remarks (DFS-054)

- `GateVisitSession`, `GateIn`, `GateOut` models + migration: FK to TO and Vehicle; document category enum; remarks; driver fields; timestamps
- **Gate-in admin** (`GateInAdmin`): TO number autocomplete lookup, vehicle registration validation in `save_model`, document category capture, source/destination visit type recording
- **Gate-out guard matrix**: enforced in `save_model` per flow lane —
  - FG outbound: scale-out + loading completed
  - FG inbound: scale-out + unloading completed
  - RM inbound: scale-out + unloading completed + QC not failed
- `_GateOutSaveAborted` exception to prevent success-path on validation failure
- Gate-in and gate-out REST APIs (POST + GET with date/vehicle/TO/document-category filters)
- `GateActivityLog` model + audit on all gate events (user, POI, timestamp)
- POI-scoped gate access (YARD-01): gateman sees only vehicles at their assigned site
- Dwell time computation and formatted display on admin
- Feature-flag support for document category routing (gate config)
- **Remaining**: document category → operational flow routing (Supplier PO → QC workflow, Dealer DO → FG workflow), TLS-01 timeline event emission completeness (`GATE_IN` / `GATE_OUT`), gateman fast-entry UI completion

#### GT-02 — On-Demand TO Creation — Dealer DO & Supplier PO (DFS-062)

- `source=GATE` field + `transfer_type` enum: `FG_DEALER_OUTBOUND`, `RM_SUPPLIER_INBOUND` on TransportOrder
- `OnDemandTOAdmin`: wizard UI with Dealer vs Supplier path selection; `save_model` creates TO, generates TO number, links to gate session
- **Dealer DO path** (FG outbound): captures DO number, dealer name, product, planned quantity, driver details; creates gate-linked TO
- **Supplier PO path** (RM inbound): captures PO number, supplier, product, expected quantity; sets QC linkage flag; creates gate-linked TO following inbound scale-in → QC → unloading → scale-out chain
- Gate session ↔ TO linkage service: `GateVisitSession` associated with created TO
- Gate-created TOs visible in Transport → Transport Orders (source = `GATE` / `ON_DEMAND`)
- `TLS-01` event emission: `TO_CREATED` lifecycle event on gate-originated TO creation
- REST APIs: Dealer DO creation (`POST`), Supplier PO creation (`POST`), session linkage
- `GateOnDemandActivityLog`: audit on all creation and validation override events
- **Remaining**: multiple product line items on on-demand TO (FB-007), FG inventory stock-check integration (stub documented), RBAC enforcement (gate role only)

---

### 5. Scaling / Weighing — SC-01 ✅ (Core) / ⚠️ Gaps

**Story Points**: 8 SP | **Jira**: DFS-055 | **Completion**: ~70%

- `WeighingSession`, `ScaleIn` (with `pc_code`), `ScaleOut`, `QueueToken` models + migration
- `ScaleInAdmin`: P.C. code field, vehicle lookup limited to operator's assigned site
- `ScaleOutAdmin`: net weight auto-calculated (loaded weight − empty weight); immutability via `get_readonly_fields`; `_ScaleRecordSaveAborted` exception to prevent success-path on validation failure
- `QueueToken` created in `ScaleInService` with operator-entered P.C. code — **not** system-generated; `QueueTokenAdmin` read-only after issue
- **Gate pass print template** (browser print CSS): vehicle number, item name, net weight, P.C. code
- CC queue populated **in the same atomic step** as scale-in (no silent-failure background step)
- `YardAdminBase` POI scoping applied: scaling operator sees only vehicles at their assigned site
- `TransportOrder.yard_leg` resolved via `WeighingSession` for operator POI lookup
- Scale-out REST API + TLS-01 sub-state emission (`SCALE_IN` / `SCALE_OUT` with leg-specific sub-states)
- **Remaining**: scale-in list/detail REST API (filter by date/vehicle/TO/pc_code/status), queue token print template content (vehicle number, product type, P.C. code, weights, TO reference), scale-in gate-in prerequisite enforcement at API level, P.C. code uniqueness per POI at API level

---

### 6. Command Center & Loading/Unloading — LUP-01, CC-01, LD-01 ✅ (Core) / ⚠️ Gaps

**Story Points**: 18 SP | **Jira**: DFS-063, DFS-056, DFS-057 | **Completion**: ~65%

#### LUP-01 — Loading & Unloading Points per POI (DFS-063)

- `LoadingUnloadingPoint` model + migration: FK to POI, name, short_code, `operation_type` (`LOAD` | `UNLOAD`), is_active, display order, notes
- `LoadingUnloadingPointInline` under `POIAdmin` for quick point management from POI detail (omitted on add to prevent field errors)
- `LoadingUnloadingPointAdmin`: standalone view with POI filter + operation type filter; `save_model` validates unique code per POI + active POI check
- **Remaining**: create/list APIs (POST, GET by POI — consumed by CC-01 and LD-01), audit logging, frontend field dictionary

#### CC-01 — Queue, Bay Assignment & Waiting Serial (DFS-056)

- Command center queue screen: vehicles at officer's assigned site only, fed from scale-in completions
- Bay assignment admin: loading/unloading points at same site only; bay assignment filtering (excludes in-progress events); current bay retained on edit
- Bay assignment details panel: dynamic TO detail loading in `LoadEvent` and `UnloadEvent` admin forms
- `WaitingSerialAdmin`: read-only after issue; issuer + timestamp audit fields
- RM QC trigger service: updates TO `sub_state` to `flagged_for_qc` for raw-material TOs; CC Officer holds bay assignment until QC Pass
- After QC Pass, CC Officer assigns unloading point via `[Assign Bay]` action
- `mark_completed` method: deactivates active bay assignments on completion
- TLS-01 sub-state emission on bay assignment + serial issuance
- **Remaining**: REST APIs for queue list (GET with filters), bay assignment (POST), serial issuance (POST), "my bay" loading-personnel view (GET); serial daily-reset at 12:00 AM + multi-vehicle per L/U point (FB-005)

#### LD-01 — Load / Unload Start–End Timestamps (DFS-057)

- `LoadEvent` and `UnloadEvent` models: FK to TO and bay assignment; load/unload start/end datetimes; bags, weight, seal number; chronological validation
- Loading screen: source-site outbound trips only, assigned bay required
- Unloading screen: destination-site inbound trips only; RM trips without QC Pass show clear block message; if QC orders resample/fail, active unload assignment cancelled
- Load/unload start–end APIs: `POST /api/v1/load-events` and `POST /api/v1/unload-events`
- QC handoff reference: unload event context persisted and auditable for QC-01 consumption
- TLS-01 sub-state emission: Loading Started/Completed; Unloading Started/Completed
- **Remaining**: product-line-item-wise load/unload capture — operators must log quantities per product line, not as one aggregate (FB-001), audit logging

---

### 7. TO Lifecycle & Timeline — TLS-01 ✅ (Core) / ⚠️ Gaps

**Story Points**: 13 SP | **Jira**: DFS-059 | **Completion**: ~65%

- `TransportOrder.status` (`TOStatus`) + `TransportOrder.sub_state` (`TOSubState`): two-field backbone for all lifecycle and yard step tracking — no separate Trip record
- **Canonical execution status chain** (Sprint 4 keys added):

| Status | Written by |
|--------|-----------|
| `in_transit_source` | DM-01 driver milestone |
| `at_source` | GT-01 gate-in (source leg) |
| `loaded_pickup_completed` | Loading sub-state tracking |
| `in_transit_destination` | SC-01 / driver milestone |
| `at_destination` | GT-01 gate-in (destination leg) |
| `delivered_unloaded` | SC-01 scale-out (inbound) |
| `completed` | DM-01 POD submission |
| `closed` | POD-01 closure engine |

- **Yard sub-states** written by yard modules (GT/SC/CC/LD/QC) via `record_yard_sub_state()` — no central facade
- `TOStatusTransitionLog` model: full audit trail; dwell time computation and formatted display on admin detail
- Per-line allocation tracking and synchronisation for multi-product TOs
- `ClosureChecklist` model + admin: records pre-closure evidence per TO
- Transport Distribution Officer role access extended; role seed data updated
- **Remaining**: TO timeline/status REST APIs (GET timeline by TO), transition validation edge cases (sub-state reset on status advance, invalid actor guards), admin inline for timeline history, automated lifecycle tests, TO details page timestamp history (FB-002)

---

### 8. TO Closure — POD-01 ✅ (Rules) / ⚠️ Implementation Gaps

**Story Points**: 5 SP | **Jira**: DFS-060 | **Completion**: ~55%

- `ClosureChecklist` model + admin: closure pre-conditions tracked per TO
- POD artifact required before `closed` (from DM-01)
- QC gating: `qc_passed = Fail` blocks closure; `qc_passed = Pass` allows — latest QC decision wins
- Gate-out timestamp required in closure path
- Closure matrix defined (flow-lane aware):
  - FG outbound: loading complete + scale-out + gate-out + POD
  - FG inbound: unloading complete + scale-out + gate-out + POD
  - RM inbound: unloading complete + sampling done + QC pass + scale-out + gate-out + POD
- **Remaining**: auto-close trigger (TO transitions to `closed` when all lane-specific rules satisfied), closure REST APIs, closure dashboard / exceptions list for Transport Planner, closure audit trail

---

### 9. Raw-Material QC Checkpoint — QC-01 ✅ (Core) / ⚠️ Gaps

**Story Points**: 5 SP | **Jira**: DFS-064 | **Completion**: ~70%

- QC sample management admin (`QCInspector` role scoped): sample record with physical analysis text, remarks, auto-generated sample ID, timestamp
- System blocks QC decision until at least one sample created
- **QC decision**: Pass or Fail dropdown; timestamp; optional remarks
  - **Pass**: TO marked QC-passed; appears in CC queue for unloading bay assignment
  - **Fail**: TO blocked — CC cannot assign bay, unloading cannot start, scale-out blocked, gate-out blocked
- **Resample flow**: QC Supervisor can trigger resample; clears previous decision; cancels active CC unloading assignment; TO returns to QC queue; new sample + new decision required
- **QC override to failed**: changing decision to failed cancels active unloading assignment; CC re-assignment blocked until new sample + pass
- `qc_inspector_physical` role scoped to own site (YARD-01); QC menu excluded from all non-QC roles
- Sample creation event written to TO timeline (TLS-01)
- `qc_passed` flag consumed by POD-01 closure gate
- **Remaining**: QC entry condition enforcement (must follow CC flag, not gate-in alone), resample/override complete timeline audit (AC-5 partial), QC trigger dependent on product-line `QC Required` flag rather than broad RM classification (FB-006), AC-4 / AC-5 API completeness

---

### 10. Vendor Management & Vendor-Fleet Execution ⚠️ (Context + Partial)

**Story Points**: 62 SP (planning context — not counted in 91 SP own-fleet total) | **Completion**: ~62%

> Vendor management was a parallel stream maintained alongside own-fleet delivery. Core models and workflows are in place; UX polish and E2E gaps carry forward.

| Story | Jira | Completion | Key Deliverables |
|-------|------|------------|------------------|
| VM-01 — Vendor Mobile Onboarding | ~ | ~70% | Self-registration, mandatory BIN/TIN document gating, deferred account activation until compliance docs uploaded, `VendorComplianceDocumentUploadView`, company profile |
| VM-02 — Vendor ↔ Tenant Join & Approval | ~ | ~85% | Tenant join request, approval/rejection workflow, vendor-type scoping (Contractual / Non-Contractual), cross-schema user mirroring for DB integrity |
| VM-03 — Vendor Portal Views | ~ | ~70% | Active Bids, Active Trips, Completed Trips tabs; tenant-scoped visibility; SSR portal with Alpine.js |
| VM-04 — TDO Publish TO to Bidding Portal | ~ | ~75% | Bidding window setup (open/close dates), publish pre-checks, cancel/republish, bidding session auto-transition (Scheduled → Open) |
| VM-05 — Bid Submission | ~ | ~55% | One-bid-per-vendor-per-TO guard, window enforcement, bid withdrawal, offered rate + vehicle count |
| VM-06 — Bid Evaluation | ~ | ~65% | Side-by-side bid comparison, award with winning log (user + timestamp), reject-all with reason, single-winner default |
| VM-07 — Vehicle/Driver Submission Post-Award | ~ | ~60% | Vehicle/driver/helper detail submission after award; one-off submission per TO; substitution with audit trail |
| VM-08 — Real-Time TO Updates | ~ | ~55% | Vendor-scoped TO status reflection; lifecycle event propagation |
| TEVF-01 — Contractual Vendor Assignment | ~ | ~50% | Direct TO assignment without bidding; `assignment_source` field differentiates contractual vs bidding; rate hidden from vendor portal |
| TEVF-02 — Non-Contractual Bidding | ~ | ~45% | Full bidding session lifecycle; vendor bid submission and evaluation; bidding-window-restricted TDO edits |
| TEVF-03 — Vendor Execution & Confirmation | ~ | 0% | Trip start gate, vendor-facing TO lifecycle — fully deferred to Sprint 5 |

**Key vendor technical deliverables this sprint**:
- Centralized `apiFetch` with JWT token recovery and 401 session-bridge for all vendor portal API calls
- Cross-schema vendor mirroring (`mirror_user_to_tenant_schema`) for FK integrity in audit logs
- Django session → JWT bridge for portal API access
- User inactivity tracking on vendor portal
- Vendor admin templates with horizontal scrolling and responsive table layout
- Bidding session status auto-transition worker (Scheduled → Open)
- `assignment_source` field: `CONTRACTUAL` vs `BIDDING` — prevents manual contractual assignment for orders awarded via bidding

---

## ⏳ Carry-Forward to Sprint 5

### Own-Fleet Stories — Scope Gaps (High Priority)

| Item | Story | Jira Sub-task | Priority |
|------|-------|---------------|----------|
| Audit trail: skip-dispatch, inspection completion, reject — no central audit calls | DS-01 | DS-01-14 | High |
| `mark_vehicle_under_maintenance` resets TO to `created` instead of `under_planning` | DS-01 | DS-01-12 | High |
| TLS-01 auto-state hooks: driver state on TO assignment / execution start / completion | DS-02 | DS-02-10 | High |
| Separate Attendance and Leave Management portal menu items | DS-02 | DS-02-18 | Medium |
| Single **Trip Start** button (replaces two In Transit Source / Destination actions) | DM-01 | DM-01-12 | High |
| Driver TO detail API: `flow_lane`, `allowed_next_transitions` per lane | DM-01 | DM-01-5 | High |
| Driver TO list security: 404 for non-owned TOs | DM-01 | DM-01 DoD | High |
| Document category → operational flow routing at gate-in (Supplier PO → QC, Dealer DO → FG) | GT-01 | GT-01-3 | High |
| TLS-01 timeline event emission on gate-in / gate-out | GT-01 | GT-01-9 | High |
| On-demand TO: multiple product line items per TO (FB-007) | GT-02 | GT-02-12 | High |
| Scale-in prerequisite: gate-in required at API level | SC-01 | SC-01-5 | Medium |
| Scale-in list/detail REST API + P.C. code filter | SC-01 | SC-01-6 | Medium |
| Queue token print content (vehicle, product type, P.C. code, weights, TO reference) | SC-01 | SC-01-9 | Medium |
| CC-01 REST APIs: queue list, bay assignment, serial issuance, "my bay" | CC-01 | CC-01-5/6/7/8 | High |
| Waiting serial: multiple vehicles per L/U point + daily 12:00 AM reset | CC-01 | FB-005 | High |
| Product-line-item-wise load/unload quantity capture | LD-01 | LD-01-9 | High |
| LUP-01 REST APIs: create + list-by-POI | LUP-01 | LUP-01-4/5 | Medium |
| TO timeline/status REST APIs + admin inline | TLS-01 | TLS-01 DoD | High |
| TO details timestamp history for every status and yard sub-state (FB-002) | TLS-01 | TLS-01 DoD | High |
| QC trigger on product-line `QC Required` flag (not broad RM classification) | QC-01 | QC-01-13 | High |
| QC entry condition enforcement (CC flag precondition) | QC-01 | QC-01 AC-1 | High |
| Auto-close trigger + closure REST APIs + exceptions dashboard | POD-01 | POD-01-6/7/8 | High |
| Existing yard invite + gate-visit data backfill | YARD-01 | YARD-01-1/3 | High |
| TO sequence reconciliation: Created → Assigned → Ready for Dispatch → Trip Start | FB-004 | Cross-epic | High |

### Vendor Management — Sprint 5 Priorities

| Item | Story | Priority |
|------|-------|----------|
| OTP verification on vendor registration and sensitive account actions | VM-01 | High |
| Forgot password + password reset flow | VM-01 | High |
| Delete account: confirmation, soft-delete, audit trail | VM-01 | Medium |
| Vendor-facing TO lifecycle management in portal | VM-03 / TEVF-03 | High |
| App tab auto-refresh on Active Bids / Active Trips / Completed Trips | VM-03 | Medium |
| One-vehicle-per-TO enforcement in publish + bid flows | VM-04 / VM-05 | High |
| Exactly one vendor type (Contractual OR Non-Contractual) on join approval | VM-02 | High |
| Bid requirement form captured before TO creation / publish | VM-04 / TEVF-02 | High |
| One route per bidding session enforcement | VM-04 | Medium |
| Bid view UX: clearer TDO/publish context, winner indication, window labels | VM-05 / VM-06 | Medium |
| TEVF-03 — full vendor execution & confirmation lifecycle | TEVF-03 | High |

### Sprint 5 E2E Testing Carry-Over (23 sub-tasks)

All story-level E2E sub-tasks deferred from Sprint 4 to Sprint 5:

| Story | E2E Sub-task | Sprint 5 E2E Focus |
|-------|-------------|---------------------|
| DS-01 | DS-01-19 | Pre-dispatch checklist skip / approval / rejection, maintenance rollback, return-to-service |
| DS-02 | DS-02-19 | Attendance, leave, state board, conflict guard, TLS-driven driver-state changes |
| DM-01 | DM-01-13 | Driver TO list / detail, single Trip Start, milestone transitions, POD upload, access guards |
| YARD-01 | YARD-01-8 | POI-scoped yard access, source / destination visit handling, shared rules, yard-step filtering |
| GT-01 | GT-01-14 | Source / destination gate-in, gate-out guards, discrepancy remarks, TLS timeline events |
| GT-02 | GT-02-13 | Dealer DO and Supplier PO on-demand TO creation, product line items, RBAC, gate linkage |
| SC-01 | SC-01-14 | Scale-in, P.C. code capture, queue token handoff, scale-out, print data, TLS events |
| LUP-01 | LUP-01-9 | POI-scoped L/U point setup, activation, CC / LD consumption, audit expectations |
| CC-01 | CC-01-12 | Queue filtering, bay assignment, waiting serial issuance, QC handoff, "my bay" visibility |
| LD-01 | LD-01-10 | Load / unload start-end capture, assigned bay dependency, product-line quantities, TLS sub-state events |
| TLS-01 | TLS-01-11 | TO lifecycle transitions, yard sub-state audit timeline, invalid-transition guards, status / timeline APIs |
| POD-01 | POD-01-11 | POD upload, gate-out / scale-out prerequisites, closure blocking reasons, auto-close trigger, audit trail |
| QC-01 | QC-01-14 | Raw-material QC sample, pass / fail / resample decisions, unloading cancellation, POD closure gate |
| VM-01 | VM-01-12 | Vendor registration, mandatory document gating, OTP / password recovery, delete account |
| VM-02 | VM-02-9 | Tenant directory, join request, approve / reject, vendor-type scoping, access gates |
| VM-03 | VM-03-11 | Active bids, active trips, completed trips, lifecycle views, tab refresh |
| VM-04 | VM-04-13 | Publish pre-checks, bidding window edits, cancel / republish, one-vehicle rule |
| VM-05 | VM-05-11 | Bid submission, one-bid guard, window enforcement, withdraw policy, winner visibility |
| VM-06 | VM-06-10 | Bid comparison, award math, reject-all, winning log, single-winner default, execution handoff |
| VM-07 | VM-07-6 | Vehicle/driver confirmation, trip-start gate, substitution with reason, post-completion uploads |
| VM-08 | VM-08-5 | Vendor-scoped TO updates, delta refresh / polling, lifecycle event propagation |
| TEVF-01 | TEVF-01-8 | Contractual vendor assignment, rate hiding, execution handoff, vendor TO visibility |
| TEVF-02 | TEVF-02-6 | Publish to N bids to window update to award / reject-all scripted journey |

---

## 🎤 Demo Feedback — Sprint 4 (2026-05-21) — 19 Items

All items are open and mapped to Sprint 5 backlog:

| ID | Feedback | Affects | Priority |
|----|----------|---------|----------|
| FB-001 | Loading / unloading must capture product line items — operators cannot enter only one aggregate quantity when a TO has multiple products | LD-01, GT-02 | High |
| FB-002 | TO details page must show timestamp history for every lifecycle status and yard sub-state (loading started, loaded, QC events, etc.) | TLS-01, DM-01, LD-01 | High |
| FB-003 | Replace driver-facing **In Transit Source / Destination** action buttons with a single lane-aware **Trip Start** button | DM-01 | High |
| FB-004 | Reconcile TO status sequence: Created → Assigned → Ready for Dispatch → driver Trip Start (align DS-01, DM-01, TLS-01 wording) | DS-01, DM-01, TLS-01 | High |
| FB-005 | Waiting serials must support multiple vehicles per L/U point and reset daily at 12:00 AM | CC-01, LUP-01 | High |
| FB-006 | QC trigger must depend on product-line `QC Required` flag per line item — not only broad RM TO classification | QC-01, CC-01, GT-02 | High |
| FB-007 | On-demand TO creation must support multiple product line items with QC-required metadata | GT-02 | High |
| FB-008 | Driver Supervisor **Attendance** and **Leave Management** must be separate portal menu items | DS-02 | Medium |
| FB-009 | When a vehicle returns from Under Maintenance, the clearance inspection record should show **Maintenance Completed** in history | DS-01 | Medium |
| FB-010 | Vendor OTP verification on registration and sensitive account actions | VM-01 | High |
| FB-011 | Vendor forgot password and password reset flow | VM-01 | High |
| FB-012 | Vendor delete account from Profile — confirmation, soft-delete, audit trail | VM-01 | Medium |
| FB-013 | Vendor portal needs vendor-facing TO lifecycle management (Assigned → In Progress → Completed → Closed) | VM-03, VM-08, TEVF-03 | High |
| FB-014 | Vendor app lists should auto-refresh from server when user switches Active Bids / Active Trips / Completed Trips tabs | VM-03 | Medium |
| FB-015 | Bid view UX: clearer TDO/publish context, winner indication when awarded, bidding window labels | VM-05, VM-06, TEVF-02 | Medium |
| FB-016 | A TO cannot hold more than one vehicle — enforce `required_vehicle_count = 1` in publish and bid flows | VM-04, VM-05, TEVF-02 | High |
| FB-017 | Tenant Admin must choose exactly **one** vendor type (Contractual **or** Non-Contractual) per vendor — both types selectable simultaneously is a bug | VM-02 | High |
| FB-018 | TDO should capture a bid requirement form before TO creation / publish | VM-04, TEVF-02 | High |
| FB-019 | Bid publish must allow **only one route** per bidding session | VM-04 | Medium |

---

## 🔑 Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| **TO-centric execution** — no separate Trip record | All events, yard steps, driver milestones, POD, QC attach directly to `TransportOrder`; `TransportOrder.status` + `sub_state` carry both lifecycle and yard-step signals without schema duplication |
| **`YardAdminBase` shared base** | Single POI resolution pattern (via `UserOperationalPOI` and `WeighingSession`) adopted by Gate, Scaling, CC, Loading, Unloading, QC admins; eliminates per-role site-filtering code |
| **Yard modules call `record_yard_sub_state()` directly** | No central event-ingest facade — GT/SC/CC/LD/QC each write sub-state directly in service layer; simpler debugging, no single-point bottleneck |
| **`_GateOutSaveAborted` / `_ScaleRecordSaveAborted` sentinel exceptions** | Raised inside `save_model` to abort save path and surface validation errors without continuing to the success redirect; prevents silent partial saves |
| **P.C. code is operator-entered, not system-generated** | PRD §6.11.2 — code is issued physically on the yard; system persists and links the entered code to `QueueToken`; no auto-generated serial |
| **CC queue populated atomically with scale-in** | If scale-in fails, vehicle does not appear on CC queue; no background task that could fail silently after scale-in records are written |
| **`assignment_source` field on TO** (`CONTRACTUAL` vs `BIDDING`) | Prevents manual contractual reassignment for orders already awarded via bidding; enables vendor portal to show correct context |
| **Cross-schema user mirroring (`mirror_user_to_tenant_schema`)** | Vendor users live in the platform schema; tenant-schema audit logs require FK-valid user rows; mirroring keeps both schemas in sync without moving authentication |
| **Django session → JWT bridge for vendor portal** | Vendor portal API calls use JWT; session-authenticated portal pages exchange session token for JWT access token; `apiFetch` handles 401 recovery and login redirect transparently |
| **Bidding session auto-transition (Scheduled → Open)** | `bid_open_date` reached → session status advances automatically without manual TDO action; ensures vendor sees bid at the right time |
| **`UserOperationalPOI` runtime assignment** | Decouples operational POI from the user invite/role flow; tenant admin can reassign users to different sites without re-inviting; invite flow auto-creates the initial assignment |

---

## 🐛 Bugs Fixed This Sprint

| Issue | Fix | Commit |
|-------|-----|--------|
| Gate-out admin continuing success path when validation fails | Introduced `_GateOutSaveAborted` exception sentinel to abort cleanly | `488da72` |
| Scale admin continuing success path when validation fails | Introduced `_ScaleRecordSaveAborted` exception to prevent double-save | `1233c29` |
| Loading/unloading inline appearing on POI add form (blank POI FK causes error) | Added guard to omit inline when adding a new POI | `e4dc0e0` |
| Vendor phone number causing form failure when blank | Made phone number optional on vendor model and serializers | `576b125` |
| `scaling_operator` incorrectly excluded from Overview section | Removed erroneous exclusion from portal navigation Overview | `57cf697` |
| Gateman excluded from Command Center section unintentionally | Updated role exclusion list to correctly scope CC access | `369ede2` |
| Gate-in POI resolution using stale session data over user assignment | Updated resolution logic to prioritise `UserOperationalPOI` over session data | `dcbcd74` |
| Vendor portal 401 not recovering session on token expiry | Centralised `apiFetch` with access-token refresh and session-based token re-issuance | `0b480f5` |
| `required_date` NOT NULL violation on role creation | Added mandatory default during role creation | `705f184` |
| `ScaleOutAdmin` guard precondition status causing unnecessary restriction | Removed guard precondition from `ScaleOutAdmin`, simplified admin form | `361efe8` |

---

## 📈 Sprint Metrics

| Metric | Value |
|--------|-------|
| Commits delivered | 72 |
| Files changed | 195 |
| Net code additions | +31,033 lines |
| Python files changed | 158 |
| New migrations | 27 |
| New templates | 27 |
| Apps touched | 9 (`core`, `fleet_supervisor`, `master_data`, `operations`, `quality`, `requisitions`, `transport`, `users`, `vendors`) |
| New apps introduced | `fleet_supervisor` (Driver Supervisor), `operations` (Gate/Scale/CC/LD), `quality` (QC) |
| New models (own-fleet) | `VehicleInspection`, `ChecklistSection`, `ChecklistItem`, `ChecklistResponse`, `DriverAttendance`, `DriverLeave`, `DriverStateLog`, `ProofOfDelivery`, `ProofOfDeliveryFile`, `UserOperationalPOI`, `GateVisitSession`, `GateIn`, `GateOut`, `GateActivityLog`, `WeighingSession`, `ScaleIn`, `ScaleOut`, `QueueToken`, `LoadingUnloadingPoint`, `BayAssignment`, `WaitingSerial`, `LoadEvent`, `UnloadEvent`, `ClosureChecklist`, `QCSample`, `QCDecision` |
| New models (vendor) | `VendorComplianceDocument`, `BiddingSession`, `Bid` (and extensions) |
| New roles seeded | `gateman`, `scaling_operator`, `command_center_officer`, `loading_personnel`, `unloading_personnel`, `qc_inspector_physical` (POI-scoped yard roles) |
| Story points delivered (own-fleet) | ~63 / 91 SP |
| Story points delivered (vendor context) | ~38 / 62 SP |
| Demo feedback items | 19 (all open) |
| E2E sub-tasks carried forward | 23 |

---

**Sprint Lead**: farhanT23  
**Report Prepared**: 2026-05-25  
**Next Sprint**: Sprint 5 — E2E hardening, API completion, vendor execution, demo feedback resolution