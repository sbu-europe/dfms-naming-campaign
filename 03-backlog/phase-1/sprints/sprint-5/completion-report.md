---
title: Sprint 5 Completion Report
sprint: Sprint 5
phase: Phase 1
date: 2026-06-11
status: IN PROGRESS — closing 2026-06-16
total_story_points_planned: "~125 SP"
branch: feat/sprint-5
---

# Sprint 5 Completion Report
## Own-Fleet Hardening, Vendor Management Completion, Dashboard & E2E Coverage

**Sprint Dates**: 2 June → 16 June 2026
**Branch**: `feat/sprint-5`
**Status**: ⚠️ **SUBSTANTIALLY DELIVERED** — all functional sub-tasks done; 23 E2E sub-tasks carry forward

---

## 📊 Summary

| Metric | Planned | Delivered |
|--------|---------|-----------|
| Stories in scope | 24 (carry-over + new) | 24 active |
| Epics | 11 | 11 |
| Feedback items resolved | 19 | 19 / 19 ✅ |
| Functional sub-tasks | ~90 | ~87 done, 3 partial (TLS-01-4/7/8) |
| E2E sub-tasks | 23 | 0 (carry-forward — see §Carry-Forward) |
| Story points (approx.) | ~125 SP | ~108 SP delivered |
| Commits | — | 67+ on `feat/sprint-5` |
| Key apps touched | — | `apps/vendors`, `apps/transport`, `apps/gate`, `apps/command_center`, `apps/operations`, `apps/fleet`, `apps/core`, `apps/tracking`, `apps/stock` |
| New migrations | — | 9 (vendors ×5, transport ×2, operations ×1, stock ×1) |

---

## ✅ Delivered Epics & Stories

### 1. Driver Supervisor & Crew (DS-01, DS-02) ✅

**Story Points**: 10 SP carry-over | **Jira**: DFS-050, DFS-051

**DS-01 — Vehicle Licence, Health & Handover Checklists**
- `mark_vehicle_under_maintenance` now transitions linked TOs to `under_planning` (not `created`); API endpoint aligned (DS-01-7, DS-01-12)
- Central audit logging added for all three supervisor actions: skip-dispatch, checklist-complete, reject-inspection (DS-01-14)
- Return-to-service audit event recorded when vehicle transitions to `Available` (DS-01-17)
- **Maintenance Completed** status label distinguishes maintenance-clearance inspections from normal pre-dispatch passes in history list (FB-009)
- Commits: `ae30858`, `8c3f1af`, `673365f`, `c4c2b59`, `fe97b0d`

**DS-02 — Driver State, Attendance & Leave**
- `DriverStateAdmin` list view with state badges, POI filter, read-only enforcement for non-supervisor roles (DS-02-6)
- TLS-01 hooks wired and integration-tested: TO assignment → `Assigned`; execution start → `On Execution`; completion → `Available` (DS-02-10)
- Full audit trail for state transitions, attendance, and leave records (DS-02-17)
- **Driver Attendance** and **Driver Leave Management** separated as distinct portal menu items (DS-02-18, FB-008)
- Commits: `921ed07`, `9eb3d7e`, `439ad9a`, `b665dc4`

---

### 2. Role-Scoped Operational Dashboard — KPI Widgets (DB-01) ✅

**Story Points**: 13 SP | **Jira**: ~

All eight new operational roles now have role-appropriate KPI work-queue cards at login:
- **Gateman** — active gate visits, vehicles awaiting gate-in/out, on-demand TOs created today
- **Gate Supervisor** — cross-site aggregated gate and yard metrics (org-wide)
- **Scaling Operator** — vehicles awaiting scale-in/out, open queue tokens, tokens issued today
- **Command Center Officer** — vehicles in queue, awaiting bay assignment, QC-blocked, today's assignments, active trips at site
- **Loading Personnel** — outbound loads in progress, bays awaiting load, completed today
- **Unloading Personnel** — inbound unloads in progress, bays awaiting unload, QC-blocked inbound
- **QC Inspector – Physical** — samples awaiting decision, inspection queue, failed/re-inspect, CC blocked on QC
- **Driver Supervisor** — inspection queue, maintenance clearance, rejections, drivers on leave/no attendance, open TOs
- Site-scoped users with no site assignment see a warning and all cards show zero (fail-closed) (AC-2)
- `"Working at: [Site name]"` banner for site-scoped users (AC-12)
- Existing office-role dashboards (Depot, Distribution, Transport Planner, etc.) unchanged (AC-11)
- Commits: `ac75a04`

---

### 3. Driver Mobile Interface (DM-01) ✅

**Story Points**: 8 SP carry-over | **Jira**: DFS-053

- TO detail API returns complete payload: `flow_lane`, status, sub_state, pickup/drop POI, product, qty, urgency, special instructions, `allowed_next_transitions` (lane-filtered) (DM-01-5)
- **Trip Start** button implemented: single lane-aware action replaces the previous two-button pattern; advances TO to `in_transit_source` (FG outbound) or `in_transit_destination` (RM/FG inbound) based on `flow_lane` (DM-01-12, FB-003)
- `can_execute()` returns `False` for planning statuses (`created`, `assigned`, `ready_for_dispatch`); driver cannot act before `dispatched` (FB-004 cross-story alignment with DS-01 and TLS-01)
- Driver list API scoped to authenticated driver only; non-owned TO returns 404
- 9 new unit tests in `test_driver_state_machine.py` covering dispatch gate, planning-status guards, lane-specific Trip Start matrix
- Commits: `20588a1`, `0059cf6`

---

### 4. Gate Operations (GT-01, GT-02) ✅

**Story Points**: 16 SP carry-over | **Jira**: DFS-054, DFS-062

**GT-01 — Gate-In, Gate-Out & Remarks**
- Document category routing complete: `Internal Transfer → TO-Linked Workflow` active; `Supplier` and `Dealer` paths behind feature flag (GT-01-3)
- `GATE_IN` / `GATE_OUT` TLS-01 timeline events emitted with timestamps from `GateInService` and `GateOutService` (GT-01-9)
- Gate-in fast-entry form complete with vehicle registration lookup and TO autocomplete (GT-01-10)
- Gate-out form shows guard status indicators (scale-out, loading/unloading complete flags) before allowing submit (GT-01-11)
- Gate-in enhanced to resolve vehicle registration and driver details from vendor confirmation records when formal MDM records are absent (supporting vendor-fleet gate-in)
- Commits: `4784677`, `b7e9a66`

**GT-02 — On-Demand TO Creation**
- Both Dealer DO and Supplier PO on-demand TO creation now support N product line items per TO (product, quantity, `qc_required` flag) (GT-02-12, FB-001, FB-007)
- `qc_required` flag on line items feeds QC-01 trigger logic and LD-01 per-item capture (FB-006)
- Commits: `1483293`, `e13abd6`

---

### 5. Scaling — Scale-In, P.C. Code & Scale-Out (SC-01) ✅

**Story Points**: 8 SP carry-over | **Jira**: DFS-055

- Scale-in API enforces gate-in prerequisite; returns HTTP 409 on duplicate active P.C. code at same POI (SC-01-5)
- Scale-in list/detail REST API with all filters (date, vehicle, TO number, pc_code, status) (SC-01-6)
- Scale-out detail API includes computed net weight and all gate-pass printable fields (SC-01-8)
- Queue token print template renders all required fields: P.C. code, vehicle number, product type, scale-in datetime, weights, TO reference (SC-01-9)
- Commits: `d7041d5`

---

### 6. Command Center & Loading (CC-01, LUP-01, LD-01) ✅

**Story Points**: 18 SP carry-over | **Jira**: DFS-056, DFS-063, DFS-057

**CC-01 — Queue, Bay Assignment & Waiting Serial**
- Queue list API: `GET /api/v1/command-center/queue` with filters (product type, urgency, status) (CC-01-5)
- Bay assignment API: `POST /api/v1/command-center/assignments` — validates product type / vehicle type against L/U point; warns on mismatch; updates TO sub-state (CC-01-6)
- Waiting serial issuance API: multiple vehicles can hold serials for the same L/U point simultaneously; serial counter resets daily at 12:00 AM (CC-01-7, FB-005)
- "My bay" read API for loading/unloading personnel (CC-01-8)
- CC UI complete: queue card view with all fields (vehicle, P.C. code, item, scale-in time, weight, urgency, TO ref), bay assignment dropdown, serial issuance action (CC-01-9)
- QC trigger confirmed reading `product_line.qc_required` flag, not broad RM classification (FB-006)
- Commits: `85a7c8e`, `8fdd27c`, `4513be1`, `9448086`

**LUP-01 — Loading & Unloading Points per POI**
- Admin `save_model` validates unique short code per POI; rejects inactive POI (LUP-01-2)
- Create (POST), list-by-POI (GET), and update (PATCH) APIs implemented (LUP-01-4, 5, 6)
- Audit logging on all mutations: who, when, what changed (LUP-01-7)
- UAT seed data with 2+ POIs and multiple L/U points per POI (LUP-01-8)
- Commits: `8fdd27c`, `4513be1`

**LD-01 — Load / Unload Start–End Timestamps**
- Loading and unloading input now captured per product line item (`LoadEventLineItem` / `UnloadEventLineItem` models with migration) (LD-01-9, FB-001)
- Load/unload timeline events visible on `GET …/timeline` (FB-002)
- Commits: `d8b8f46`

---

### 7. TO Lifecycle, Execution, Yard Step & Timeline (TLS-01) ✅

**Story Points**: 13 SP carry-over | **Jira**: DFS-059

- `TO_STATUS_TRANSITIONS` confirmed covering full `created → assigned → ready_for_dispatch → dispatched → in_transit_*` chain (TLS-01-2, FB-004)
- `from_status`, `actor_role`, and `source_module` added to `timeline_for_to()` for full audit trail (TLS-01-2)
- Break-glass `apply_to_status_transition()` confirmed in `lifecycle/transition_service.py` (TLS-01-10)
- **`TOTimelineInline`** implemented as read-only TabularInline on `TransportOrderAdmin` (TLS-01-4) — visible on TO admin change page
- Commits: `2d22984`, `3b2577f`, `0059cf6`


---

### 8. TO Closure — POD & Gate-Out Linkage (POD-01) ✅

**Story Points**: 5 SP carry-over | **Jira**: DFS-060

- Auto-close trigger fires on last lane-specific prerequisite event (POD upload, gate-out, QC pass, unload completion) without manual intervention (POD-01-6)
- Closure attempt API: `POST /api/v1/transport-orders/{to_id}/close` — 200 on success; 422 with explicit blocking reason list (POD-01-7)
- Closure status API: `GET /api/v1/transport-orders/{to_id}/closure-status` — full per-flag checklist + unmet prerequisites (POD-01-8)
- Planner closure dashboard in Django Admin: checklist flags per TO + exceptions changelist (POD-01-9)
- Audit logging complete on all closure attempts — success and blocked — with actor, timestamp, lane, blocking reasons (POD-01-10)
- Vendor-fleet TOs can close without POD upload (fleet-type-aware closure engine); own-fleet retains full gate validation (distinct `cd7c059`)
- Commits: `317a5b8`, `cd7c059`

---

### 9. Raw-Material QC — Sampling & Pass/Fail Decision (QC-01) ✅

**Story Points**: 5 SP carry-over | **Jira**: DFS-064

- Resample admin action fully cancels active CC-01 unloading assignment; writes timeline event with reason/remarks (QC-01-4)
- Override-to-failed admin action cancels CC-01 unloading assignment; writes timeline event including previous decision in audit payload (QC-01-5)
- QC sample creation API complete: `POST /api/v1/transport-orders/{to_id}/qc/samples` — validates entry condition, writes timeline event (QC-01-6)
- All QC actions emit TLS-01 timeline events via `record_yard_sub_state()`; POD-01 `ClosureRuleEngine` reads latest QC decision (QC-01-12)
- QC trigger now based on `product_line.qc_required` flag — if any TO line item has `qc_required = True`, QC is required; no QC if all items are `False` (QC-01-13, FB-006)
- Commits: `9448086`

---

### 10. Yard Foundation (YARD-01) ✅

**Story Points**: 8 SP carry-over | **Jira**: DFS-065

- Operator-to-site assignment admin complete; invite flow creates formal assignment records; one-time migration from existing invite data runs cleanly (YARD-01-1)
- All new gate-ins record source vs destination visit type; backfill script applied to existing gate visits (YARD-01-3)
- Command Center, QC, and loading screens filter waiting work by `sub_state`; sub_state badge visible on TO admin change page (YARD-01-4)
- Commits: (bundled with gate and CC commits)

---

### 11. Vendor Management (VM-01 → VM-08) ✅

**Estimated SP**: ~38 SP vendor-context

**VM-01 — Vendor Mobile Onboarding**
- Audit logging complete for registration attempts and document/profile mutations (VM-01-7)
- OTP verification on vendor self-registration and sensitive account actions (password change, account delete) via `VendorOtpSession` model with configurable expiry and resend cooldowns (VM-01-9, FB-010)
- Forgot password + password reset flow: request → OTP/link → token expiry → set new password (VM-01-10, FB-011)
- Delete account from Profile: confirmation → soft-delete / deactivation; vendor cannot log in; historical bid/trip records retained; audit log entry (VM-01-11, FB-012)
- Commits: `3fa89c9`, `ef7c93a`

**VM-02 — Vendor Tenant Join & Approval**
- Exactly one vendor type (`CONTRACTUAL` or `NON_CONTRACTUAL`) enforced on approval: UI (mutually exclusive selection) and API (rejects ambiguous payloads) (VM-02-8, FB-017)

**VM-03 — Vendor Portal Views**
- Multi-tenant isolation integration tests pass (VM-03-8)
- TO lifecycle management screens: lifecycle buckets (`assigned` / `in_progress` / `completed` / `closed`), TLS-01 execution chips, 4-milestone timeline, **Start Trip** at `ready_for_dispatch` and **Complete Trip** at `delivered_unloaded` (VM-03-9, FB-013)
- Tab auto-refresh from server when vendor switches Active Bids / Active Trips / Completed Trips (VM-03-10, FB-014)
- Commits: `0059cf6`, `b665dc4`

**VM-04 — TDO Publish TO to Bidding Portal**
- `required_vehicle_count = 1` enforced at publish; API rejects > 1 (VM-04-10, FB-016)
- **TO/Bid flow revised and implemented (2026-06-09):** TO creation (Single / Multiple tabs) decoupled from bid bundling. TDO creates TOs first via create-from-TR, then selects TOs from list to **Create a Bid** (`BiddingSession` with `bid_number`, `BiddingSessionMember` join table) that bundles them. Bid is the primary vendor discovery unit — vendor mobile lists Bids by `bid_id`/`bid_number`; submission carries `participating_to_ids` checklist; TDO evaluation screen awards per-TO independently (`BidPerToAwardSerializer`). Full implementation in `bid_bundle_views.py`, `tenant_bidding_admin.py`, `serializers.py`, `vendor_portal_urls.py`, migration `0009_bid_flow_revision`. See [`TO-BID-FLOW-REVISION.md`](08-vendor-management/TO-BID-FLOW-REVISION.md).
- Single-route constraint at publish enforced in UI and API — satisfied implicitly when all TOs share one TR (VM-04-14, FB-019)
- Commits: `3e749cb`, `2455610`, `2caa02e`

**VM-05 — Bid Submission**
- Vendor read-own-bid API; 403 for other vendors (VM-05-5)
- Bid withdrawal within window; status set to `WITHDRAWN`; no bid data mutation (VM-05-6)
- TDO manual close without award; all open bids move to `SESSION_CLOSED` (VM-05-7)
- Bid view UX: TDO/publish context, winner badge on awarded session, bidding window open/close labels (VM-05-9, FB-015)
- `offered_vehicle_count` capped at 1; API rejects > 1 (VM-05-10, FB-016)
- Bid re-submission after withdrawal; multi-tenant schema JOIN issues resolved (vendor metadata fetched from public registry) (VM-05 extended)
- Commits: `fe197f0`, `75b5642`

**VM-06 — Bid Evaluation**
- Bid list API complete with sort (cost, offered count, rating, time) and vendor metadata (VM-06-1)
- Comparison aggregates: min/avg/max rate; lowest bid highlighted in response (VM-06-2)
- Award validation enforces capacity constraints; single-winner default when `required_vehicle_count = 1` prevents multi-vendor award (VM-06-3, VM-06-9)
- Award and reject-all audit logging complete (VM-06-7)
- TDO evaluation UX with winner badge and bidding window timeline (VM-06-8, FB-015)
- Per-TO `proposed_cost` on vendor bid participations (backfill migration included); TO-centric evaluation screen with vendor expansion and per-TO award (VM-06 extended, TO-BID-FLOW-REVISION)
- Commits: `75b5642`, `d5db8fc`, `9312108`

**VM-07 — Vehicle-Driver Submission**
- Requirement context API returns TO + publish parameters to winner/assigned vendor only; 403 for others (VM-07-1)
- Trip-start blocked until vehicle-driver confirmation record exists (VM-07-2)
- Vehicle-driver POST validates vehicle type match + capacity ≥ TO requirement; helper list and driver NID optional (VM-07-3)
- Commits: `07298b4`, `c1f8e54`, `e5a813b`

**VM-08 — Real-Time TO Updates**
- Refresh strategy implemented; app refreshes on foreground focus (VM-08-3)
- TLS-01 lifecycle events emitted and consumed by vendor portal lifecycle views; intermediate statuses (yard sub_state) propagated without vendor action (VM-08-4, FB-013)
- Commits: `0059cf6`

---

### 12. TO Execution — Vendor Fleet (TEVF-01, TEVF-02, TEVF-03) ✅

**Estimated SP**: vendor-context

**TEVF-01 — Contractual Vendor Assignment**
- TO↔vendor assignment persistence with capacity split row per vendor; FK integrity enforced against TO `required_vehicle_count` (TEVF-01-2)
- Contracted rate hidden from all vendor-facing screens

**TEVF-02 — Non-Contractual Bidding**
- Post-award execution handoff: VM-07 confirmation → `ready_for_dispatch` → vendor Start Trip (TLS-01) → observe yard progress (VM-08) → Complete Trip at `delivered_unloaded` (TEVF-02-5)
- One-vehicle-per-TO enforcement end-to-end: publish (VM-04-10), bid (VM-05-10), TEVF-02 journey (TEVF-02-7, FB-016)
- Multiple TOs from one TR in a single bidding session via Bid bundle model (TEVF-02-8, FB-018 revised)
- Bid view UX aligned on both vendor and TDO surfaces (TEVF-02-9, FB-015)
- Commits: `e18114c`, `e5014e7`, `3b2577f`, `2caa02e`

**TEVF-03 — Vendor Execution & Confirmation**
- Contractual rate hidden from all vendor-facing TO and assignment screens (TEVF-03-3)
- Vendor portal TO lifecycle screens with tab-change refresh; TLS-01 execution chips; Start/Complete Trip per lane (TEVF-03-4, FB-013)
- Vendor execution confirmation logic refined for multi-winner sessions; driver phone number validation (regex 7-20 digits) (extended)
- TLS-01 lane-aware trip-start service centralised; legacy vendor-fleet statuses backfilled via migration and management command (extended)
- Commits: `0059cf6`, `63107d8`, `5984aa7`

---

### 13. GPS & Maps Dashboard (GPS-01) ✅ MVP

**Story Points**: 8 SP (demo scope) | **Jira**: DFS-070

Sprint 5 delivered a functional demo map integration — R&D validation and stakeholder demo surface, not full Phase 1 production:
- **Map SDK**: Leaflet + OpenStreetMap selected and documented (AC-S5-2 ✅)
- **Demo GPS pipeline**: GT06 TCP ingest → `GPSTracking` model → Redis snapshot → `Gt06RedisReader` + `LiveMapService` (AC-S5-1 partially)
- **Live GPS page**: `/admin/tracking/live-gps/` — vehicle markers from `GET /api/v1/tracking/live-map/`, connection status (live/stale/signal_lost), detail panel, 10s auto-refresh, marker clustering, history graph, follow mini-maps (AC-S5-3 partially — POI layer deferred)
- **RBAC**: `CanViewLiveGps` + `Menu.LiveGps.View`; 403 for unauthorised roles (AC-S5-5 ✅)
- Demo data path: `seed_live_gps_demo` / `seed_live_gps_fleet` commands; five-truck mock fleet documented
- Beyond-AC enhancements: movement status (moving/idle/parked), activity cards

> Gaps vs AC (documented): POI layer on map deferred; formal `GPS-01-R&D-findings.md` not published; GPSWOX REST production poller deferred; degraded-mode banner not fully UAT-verified; PO formal sign-off pending.

**Phase 1 production delivery** (full `/api/v1/maps/**`, geofence engine, dwell alerts, TLS-01 GPS events) targeted for Sprint 6+.

---

### 14. Source & Destination Stock Validation (STK-01) ✅

**Story Points**: 13 SP new scope

- `POIStock` model (one-to-one with POI): stock fields + computed `free_capacity_mt`; seed migration
- Source stock reservation on TR approval; release on TR rejection/cancellation (STK-01-2)
- Scale-out deduction: `apply_scale_out_stock_deduction()` + movement log (STK-01-3)
- Destination stock update: QC pass credits, QC fail rejects; movement log (STK-01-4)
- Source availability guard: CC-01 bay assignment returns 409 on insufficient stock (STK-01-5)
- Destination capacity guard: TR/TO approval warning + DM override with mandatory remarks (STK-01-6)
- `GET /api/v1/pois/{poi_id}/stock-snapshot` API with RBAC per role matrix (STK-01-7)
- `POIStockMovementLog` append-only model + Tenant Admin read-only admin view (STK-01-8)
- `capacity_threshold_pct` per POI + tenant default; threshold badge in snapshot response (STK-01-9)
- In-transit stock tracking on TO dispatch via TLS-01 hook (STK-01-10)
- Commits: `68d90d7`

---

## 🔑 Key Technical & Product Decisions

| Decision | Rationale |
|----------|-----------|
| **TO/Bid flow decoupling (2026-06-09)** | FB-018 assumed bid-before-TO; product decision separates TO creation (Single/Multiple tab) from Bid bundling (TDO selects TOs → creates Bid). Vendor discovery keyed by Bid ID, not TO number. Same-TR constraint on bid ensures single route (satisfies FB-019). |
| **Bid entity as bundle** | `BiddingSession` extended with `bid_number`, `BiddingSessionMember` join table, `BidTransportOrder`, per-TO `proposed_cost` on `VendorBidParticipation`. Per-TO award independent of sibling TOs in same Bid. |
| **Vendor registry on public schema** | Vendor metadata fetched from public schema to avoid multi-tenant schema JOIN failures. Canonical vendor registry and authentication migrated to public schema. |
| **GT06 over GPSWOX for Sprint 5 GPS** | GPSWOX production credentials pending; GT06 TCP ingest (Redis + Celery) delivers equivalent demo data path without external API dependency. Production GPSWOX poller deferred to Sprint 6. |
| **Vendor-fleet closure without POD** | Vendor fleet drivers do not upload POD through the DFMS admin; fleet-type check in `ClosureRuleEngine` exempts vendor-fleet TOs from POD prerequisite while retaining gate validation. |
| **TLS-01 lane-aware trip-start centralised** | Single `trip_start_service` handles both driver and vendor actors; `flow_lane` determines target status (`driving_towards_source` vs `driving_towards_destination`); legacy `IN_PROGRESS` vendor statuses backfilled via management command. |
| **`WaitingSerialSequence` model** | Separate model for daily serial reset per L/U point; does not modify `LoadingUnloadingPoint` — clean separation; historical serial numbers unaffected. |
| **`POIStock` one-to-one pattern** | Avoids `NULL`-heavy columns on POI; stock snapshot query is a single JOIN; `free_capacity_mt` computed property avoids denormalisation. |
| **Audit helpers swallow failures (DS-02-17 note)** | Auto-hooks that call `changed_by=None` on system-initiated transitions are best-effort; failures logged but do not block the domain operation. Documented trade-off. |

---

## 🐛 Bugs Fixed This Sprint

| Issue | Fix | Commit |
|-------|-----|--------|
| Vendor resolution crash on bid award in multi-tenant environment | Use global vendor registry; avoid direct cross-schema FK dereference | `10df2f1` |
| Multi-tenant schema JOIN failure when fetching vendor metadata | Serializers fetch vendor data from public registry | `fe197f0` |
| Bid re-submission after withdrawal rejected | Reactivate and update existing `WITHDRAWN` record; do not create duplicate | `fe197f0` |
| `mark_vehicle_under_maintenance` resetting TOs to `created` | Service now transitions linked TOs to `under_planning` correctly | `ae30858` |
| Missing `TOTimelineInline` on Transport Order admin | Added read-only inline; status, sub_state, actor, source_module visible | `2d22984` |
| Legacy vendor-fleet TOs stuck in `IN_PROGRESS` after lifecycle refactor | Backfill migration + management command reclassifies statuses using gate visit session data | `0059cf6` |
| Gate-in blocked for vendor-fleet vehicles with no MDM record | Gate-in service resolves vehicle registration from vendor execution confirmation when MDM absent | `4784677` |
| Gate-out eligibility incorrect for FG outbound source leg | Updated gate-out status transition logic for source-side gate-outs | `b7e9a66` |
| Award log duplicated across multi-winner sessions | Reuse single audit log per bid award; update vehicle count instead of creating duplicates | `9312108` |
| Vendor portal login schema-awareness | Vendor auth migrated to public schema; `schema-aware membership` handling corrected | `b665dc4` |
| Tenant admin suspension/reactivation missing for vendor memberships | Implemented tenant-scoped suspension and reactivation on `VendorMembership` | `c870c85` |
| Document upload route exposed incorrectly in vendor portal | Removed `VendorDocumentView` and `upload_document`; vendor documents managed via admin platform view | `b52eaa1` |

---

## ⏳ Carry-Forward to Sprint 6

### Deferred Functional Items

| Story | Sub-task | SP Impact | Reason |
|-------|----------|-----------|--------|
| GPS-01 | POI layer on Live GPS map | Phase 1 | Deferred; `lat`/`lng` exists on POI master data but layer not wired |
| GPS-01 | Full `/api/v1/maps/**` surface + geofence engine | Phase 1 (~13 SP) | Phase 1 production delivery — post demo sign-off |
| GPS-01 | GPSWOX REST production poller | Phase 1 | Credentials pending; GT06 path operational for demo |

### E2E Sub-tasks (Full Carry-Forward — 23 items)

All 23 story-level E2E sub-tasks were deferred from Sprint 5. This was a conscious capacity trade-off: functional implementation of carry-over and new scope was prioritised. E2E sprint should be targeted as a dedicated Sprint 6 E2E hardening track.

| E2E Sub-task | Story |
|---|---|
| DS-01-19 | DS-01 |
| DS-02-19 | DS-02 |
| DM-01-13 | DM-01 |
| GT-01-14 | GT-01 |
| GT-02-13 | GT-02 |
| SC-01-14 | SC-01 |
| LUP-01-9 | LUP-01 |
| CC-01-12 | CC-01 |
| LD-01-10 | LD-01 |
| TLS-01-11 | TLS-01 |
| POD-01-11 | POD-01 |
| QC-01-14 | QC-01 |
| YARD-01-8 | YARD-01 |
| VM-01-12 | VM-01 |
| VM-02-9 | VM-02 |
| VM-03-11 | VM-03 |
| VM-04-13 | VM-04 |
| VM-05-11 | VM-05 |
| VM-06-10 | VM-06 |
| VM-07-6 | VM-07 |
| VM-08-5 | VM-08 |
| TEVF-01-8 | TEVF-01 |
| TEVF-02-6 | TEVF-02 |
| TEVF-03-5 | TEVF-03 |

### Partial AC Remaining

| Story | What Remains |
|-------|-------------|
| **GPS-01** | POI markers on map; formal R&D findings doc; PO demo sign-off; GPSWOX production path |
| **DB-01** | Product owner live walkthrough confirmation of dashboard counts matching work screens |

---

## 📈 Sprint Metrics

| Metric | Value |
|--------|-------|
| Commits delivered | 67+ |
| New migrations | 9 (vendors ×5, transport ×2, operations ×1, stock ×1) |
| New models | `VendorOtpSession`, `WaitingSerialSequence`, `BiddingSessionMember`, `POIStock`, `POIStockMovementLog`, `TOTimelineInline` (admin inline) |
| New management commands | `seed_live_gps_demo`, `seed_live_gps_fleet`, driver state reconciliation |
| New permission codes | `Menu.LiveGps.View`, `CanViewLiveGps`, stock snapshot RBAC matrix |
| Feedback items closed | 19 / 19 (100%) |
| E2E sub-tasks carried forward | 23 (all — capacity trade-off) |
| Story points delivered (approx.) | ~108 / ~125 SP planned |
| Carry-forward SP (E2E + GPS Phase 1) | ~30 SP |
| Net new scope delivered | STK-01 (13 SP), DB-01 (13 SP), TO-BID-FLOW revision implementation |
| Product decisions documented | 1 major (TO-BID-FLOW-REVISION.md, 2026-06-09) |
