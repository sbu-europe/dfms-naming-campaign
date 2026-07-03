---
title: Sprint 6 — Feedback Resolution Tracker
source_sprint: Sprint 6
demo_date: 2026-06-22
total_items: 12
resolved: 6
in_progress: 0
open: 6
---

# Sprint 6 — Feedback Resolution Tracker

Client demo feedback from the Sprint 6 demo (2026-06-22). Each item maps to the story that owns the AC amendment, the specific sub-task that closes it, and resolution status.

> **Resolution Status values**: `Open` → `In Progress` → `Resolved`

---

## FB-001 — Multiple loading/unloading point assignments per TO visit

| Field | Value |
|-------|-------|
| **Source** | Sprint 6 demo — 2026-06-22 |
| **Affected Stories** | [CC-01](../sprint-5/06-command-center-loading/CC-01-queue-assign-serial.md), [LD-01](../sprint-5/06-command-center-loading/LD-01-load-unload-timestamps.md) |
| **Sprint 4 origin** | [`sprint-4/06-command-center-loading/CC-01-queue-assign-serial.md`](../../sprint-4/06-command-center-loading/CC-01-queue-assign-serial.md), [`sprint-4/06-command-center-loading/LD-01-load-unload-timestamps.md`](../../sprint-4/06-command-center-loading/LD-01-load-unload-timestamps.md) |
| **Closing Sub-tasks** | CC-01 / LD-01 amendments (FB-001 — sub-tasks TBD on those stories) |
| **AC Amendment** | CC-01 AC-3 / LD-01 AC-1 / AC-2: Command Center must be able to assign **multiple** loading or unloading points to the same TO yard visit (not a single point). The TO advances to `loading_completed` or `unloading_completed` **only after all** assigned points for that leg have been started and completed. Intermediate sub-states (`loading_started`, `unloading_started`) may repeat per point; the terminal sub-state for the leg is emitted once when the last open assignment is closed. |
| **Status** | Resolved |
| **Priority** | High |
| **Notes** | Distinct from [FB-005](../sprint-5/feedback-resolution.md) (resolved Sprint 5): FB-005 allows **multiple vehicles** at the **same** L/U point. FB-001 requires **multiple L/U points** for the **same** vehicle/TO. Current implementation enforces one `BayAssignment` per `QueueEntry` (OneToOne) and emits `loading_completed` / `unloading_completed` on the first point completion — see [command-center-loading-sprint4.md](../../../05-modules/06-poi-operations/command-center-loading-sprint4.md) §3.5. |

### Demo observation

During the Sprint 6 demo, the Command Center Officer could assign a vehicle to **only one** loading or unloading point per scale-in visit. Operational reality at large sites (e.g. split loads across bays, partial unload at one berth then another) requires the CCO to assign **as many points as needed** for that visit. Loading/unloading personnel complete work at each assigned point in turn; the vehicle must not be treated as yard-complete for scale-out / gate-out until **every** assigned point is finished.

### Current vs expected behaviour

| Aspect | Current (post Sprint 5) | Expected (FB-001) |
|--------|-------------------------|-------------------|
| Assignments per visit | One `BayAssignment` per `QueueEntry` | One or more `BayAssignment` rows per `QueueEntry` / visit |
| CC assign action | Assigning a point closes the vehicle's single assignment slot | CCO can add further points while earlier assignments are open or completed |
| Queue visibility | Vehicle leaves CC waiting queue after first assignment | Vehicle remains trackable until all leg assignments are complete (re-queue rules to be defined in CC-01) |
| `loading_completed` / `unloading_completed` | Emitted when **first** point completes (`LDService.complete_*` → `CCService.mark_completed`) | Emitted only when **all** open assignments for that leg are completed |
| Gate / scale guards | Scale-out may unblock after one point | Scale-out and gate-out guards must respect all assignments complete |

---

## FB-002 — Vendor registration mobile number must be required

| Field | Value |
|-------|-------|
| **Source** | Sprint 6 demo — 2026-06-22 |
| **Affected Stories** | [VM-01](../sprint-5/08-vendor-management/VM-01-vendor-mobile-onboarding.md), [VAPP-01](03-vendor-app/VAPP-01-release-readiness-live-api.md), [VAPP-02](03-vendor-app/VAPP-02-design-improvements.md) |
| **Sprint 4 origin** | [`sprint-4/08-vendor-management/VM-01-vendor-mobile-onbiorading.md`](../../sprint-4/08-vendor-management/VM-01-vendor-mobile-onbiorading.md) — AC-1 (Self-Registration Form — company + contacts) |
| **Closing Sub-tasks** | VM-01-2, VM-01-6, VM-01-12 (amend); VAPP-01-2 (registration smoke pass) |
| **AC Amendment** | VM-01 AC-1: **Mobile number** (contact phone) is **mandatory** on vendor self-registration. Registration submit is blocked when mobile is blank or fails E.164 / national-format validation. Backend `POST/GET /api/v1/vendors/registrations` mirrors the same required-field rules as the Vendor Mobile wizard. |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | Current implementation treats `phone` as optional (`required=False, allow_blank=True` on registration serializers; Vendor Mobile `isValid` does not require phone). Distinct from tenant-admin contact phone bugs (BUG-01). |

### Demo observation

During vendor self-registration on the Vendor Mobile app, the vendor could complete registration **without** entering a mobile number. Operations and OTP/SMS flows expect a reachable mobile contact on every registered vendor.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-002) |
|--------|---------|-------------------|
| Mobile field on register form | Optional — submit allowed when blank | Required — submit blocked when blank or invalid |
| Backend validation | `phone` optional on create/update registration | `phone` required with same format rules as driver contact phone |
| Onboarding gate | Platform-active once docs + Truck Association ref complete | Platform-active also requires a valid mobile number on file |
| Vendor Mobile UX | No inline error when phone omitted | Field-level validation on blur/submit (align VAPP-02 form UX) |

---

## FB-003 — Driver & helper details on bid award; editable on ongoing TO until complete

| Field | Value |
|-------|-------|
| **Source** | Sprint 6 demo — 2026-06-22 |
| **Affected Stories** | [VM-07](../sprint-5/08-vendor-management/VM-07-vehicle-driver-submission.md), [VM-06](../sprint-5/08-vendor-management/VM-06-bid-evaluation.md), [VM-03](../sprint-5/08-vendor-management/VM-03-vendor-portal-views.md), [TEVF-03](../sprint-5/09-to-execution-vendor-fleet/TEVF-03-vendor-execution-confirmation.md), [VAPP-01](03-vendor-app/VAPP-01-release-readiness-live-api.md) |
| **Sprint 4 origin** | [`sprint-4/08-vendor-management/VM-07-vehicle-driver-submission.md`](../../sprint-4/08-vendor-management/VM-07-vehicle-driver-submission.md) — AC-1 / AC-2 / AC-3; [`sprint-4/09-to-execution-vendor-fleet/TEVF-03-vendor-execution-confirmation.md`](../../sprint-4/09-to-execution-vendor-fleet/TEVF-03-vendor-execution-confirmation.md) |
| **Closing Sub-tasks** | VM-07-3, VM-07-4, VM-07-5, VM-07-6 (amend); VM-03-9 (ongoing-trip edit entry point); TEVF-03-3; VAPP-01-3 |
| **AC Amendment** | VM-07 AC-1 / AC-2: after a vendor **wins a bid** (VM-06 award) or receives contractual assignment, the vendor **must** submit **driver** execution details (`POST …/vehicle-driver`) before the TO can reach `ready_for_dispatch` / trip start. **Helper** details may be included on the same confirmation (zero or more); per helper, **name** and **NID** are **optional**. VM-07 AC-3 + VM-03: vendor may **edit** vehicle, driver, and helper details on an **ongoing** TO (lifecycle `in_progress`, before `completed`) via `PATCH …/vehicle-driver` with a required reason and audit trail — not only before first trip start. |
| **Status** | Resolved |
| **Priority** | High |
| **Notes** | VM-05 keeps bid submission rate-only (no fleet identity at bid time). FB-003 applies at **post-award confirmation** (VM-07), not at bid submit. Driver fields remain mandatory; helper list and per-helper name/NID stay optional (aligns with VM-07 AC-2). Confirmation POST is gated to `assigned`/`created` only; ongoing-trip edit may be missing or hidden in Vendor Mobile Active Trips UI. |

### Demo observation

After a vendor's bid was awarded, the expected handoff is for the vendor to confirm **driver** information (and optionally **helpers**) before execution. During an **ongoing** trip, the vendor should still be able to update vehicle, driver, and helper details (e.g. substitution, accident) until the trip is **completed** — with reason and audit — without waiting until a post-completion state.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-003) |
|--------|---------|-------------------|
| When details are captured | Post-award vehicle–driver confirmation (VM-07) | Same trigger — required immediately after award/assignment |
| Helper fields | Optional list; per-helper name/NID optional when provided | Unchanged — helper list optional; **name** and **NID** per helper remain **optional** |
| Trip-start gate | Blocked until VM-07 confirmation exists | Unchanged — still blocked until **driver** confirmation recorded (helpers not required for gate) |
| Edit window | Update-with-reason exists (VM-07 AC-3 / PATCH) | Edit allowed on **ongoing** TO (`in_progress`) until `completed`; surfaced on Active Trips detail in Vendor Mobile |
| Audit on edit | Reason + field-level audit (VM-07-4) | Unchanged — every edit requires reason and is logged |

---

## FB-004 — Truck Association reference must be a document upload, not a text field

| Field | Value |
|-------|-------|
| **Source** | Sprint 6 demo — 2026-06-22 |
| **Affected Stories** | [VM-01](../sprint-5/08-vendor-management/VM-01-vendor-mobile-onboarding.md), [VAPP-02](03-vendor-app/VAPP-02-design-improvements.md) |
| **Sprint 4 origin** | [`sprint-4/08-vendor-management/VM-01-vendor-mobile-onbiorading.md`](../../sprint-4/08-vendor-management/VM-01-vendor-mobile-onbiorading.md) — AC-1, AC-2, AC-3 (Testimonial / reference from Truck Association) |
| **Closing Sub-tasks** | VM-01-4, VM-01-5, VM-01-6, VM-01-12 (amend) |
| **AC Amendment** | VM-01 AC-2 / AC-3: **Truck Association reference** is a **mandatory file upload** (same attachment pattern as Trade License, BIN, TIN — MIME/size policy, storage, audit). Remove free-text `testimonial_reference` / `notes` as the compliance gate. Onboarding submit and platform-active check require the Truck Association document on file alongside the other mandatory docs. |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | Current implementation stores Truck Association reference as text in `vendor.notes` (`testimonial_reference`); `has_testimonial_reference()` checks non-empty string, not a document row. `MANDATORY_DOC_TYPES` today is only Trade License, BIN, TIN. |

### Demo observation

During vendor registration, the vendor must submit compliance documents. **Truck Association reference** is currently captured as a **text field**, while Trade License, BIN, and TIN are **file attachments**. The client expects Truck Association reference to be uploaded as a **document** like the other mandatory compliance files.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-004) |
|--------|---------|-------------------|
| Truck Association input | Free-text field (`testimonial_reference` → `vendor.notes`) | File picker / upload control |
| Storage | String on vendor profile | `VendorDocument` (or equivalent) row with document type e.g. `TRUCK_ASSOCIATION_REFERENCE` |
| Onboarding gate | Non-empty text satisfies `has_testimonial_reference()` | Mandatory doc type present in uploaded set (with Trade License, BIN, TIN) |
| Resubmission | Text PATCH on profile | Document replace flow with audit (VM-01 AC-5 / AC-6) |
| Mobile UX | Text input in registration wizard | Same upload affordances as other compliance docs (VAPP-02 document upload patterns) |

---

## FB-005 — Loading/unloading quantity capture per TO product line item

| Field | Value |
|-------|-------|
| **Source** | Client call — 2026-07-02 |
| **Affected Stories** | [LD-01](../sprint-5/06-command-center-loading/LD-01-load-unload-timestamps.md) |
| **Sprint 4 origin** | [`sprint-4/06-command-center-loading/LD-01-load-unload-timestamps.md`](../../sprint-4/06-command-center-loading/LD-01-load-unload-timestamps.md) — AC-1 / AC-2; LD-01-9 |
| **Closing Sub-tasks** | LD-01-9 (amend), LD-01-10 |
| **AC Amendment** | LD-01 AC-1 / AC-2: at each loading or unloading point, quantity capture is **per `TOLineItem`**, not one aggregate on the parent event. For every product line on the TO, the operator sees a **read-only expected amount** sourced from the TO line (`allocated_quantity` + UOM / bags as applicable) and enters the **actual amount** for that leg — **loaded** quantity at loading points, **received** quantity at unloading points. Load/unload APIs and admin forms accept an array keyed to `to_line_item_id` (or equivalent stable line reference), persisting one child record per line per event. |
| **Status** | Resolved |
| **Priority** | High |
| **Notes** | Related to [Sprint 5 FB-001](../sprint-5/feedback-resolution.md) (resolved): same per-line-item intent. Current LD-01 admin shows TO product lines as a **read-only summary panel** but captures **aggregate** `bags_loaded` / `weight_loaded_mt` (and unload equivalents) on `LoadEvent` / `UnloadEvent` only — no `LoadEventLineItem` / `UnloadEventLineItem` models or per-line POST payload yet. |

### Client call observation

On a client call (2026-07-02), operations clarified that loading/unloading personnel work **against each product line item on the TO**, not against a single total for the visit. For every line, the screen must show the **expected amount already on the TO** (not editable) so the operator can compare plan vs actual. The operator then records the **received amount** at unload (and the equivalent **loaded amount** at load) for that line before completing the event.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-005) |
|--------|---------|-------------------|
| Capture granularity | One bags + weight pair per `LoadEvent` / `UnloadEvent` | One quantity row per `TOLineItem` linked to the event |
| Expected quantity | Shown in read-only TO summary panel (`allocated_quantity` per line) | Same TO line data, displayed **inline on each input row** as read-only expected |
| Operator input | Aggregate fields on the event form | Editable **actual** quantity per line (loaded at source, received at destination) |
| Data model | `LoadEvent` / `UnloadEvent` only | Child line-item records (e.g. `LoadEventLineItem` / `UnloadEventLineItem`) FK → `TOLineItem` |
| API payload | `{ bags_loaded, weight_loaded_mt }` on event | `{ line_items: [{ to_line_item_id, bags?, weight_mt? }] }` aligned with LD-01-9 |

---

## FB-006 — TDO own-fleet planned milestone times (FG four / RM two; replace single ETA)

| Field | Value |
|-------|-------|
| **Source** | Client call / product clarification — 2026-07-02 |
| **Affected Stories** | TO-02 (Sprint 3 — TDO assignment), [DS-01](../sprint-5/01-driver-supervisor/DS-01-vehicle-licence-health-handover-checklists.md) (fleet supervisor dispatch release), [GPS-05](02-gps-maps-dashboard/GPS-05-maps-dashboard-integration.md), [DM-01](../sprint-5/03-driver-mobile-interface/DM-01-driver-mobile-interface-to-list-milestones-pod.md) (driver read-only plan) |
| **Sprint 3 origin** | [`docs/planning/sprint-3-implementation.md`](../../../../docs/planning/sprint-3-implementation.md) — Phase 9 TO-02 (`PATCH …/eta`, `eta_datetime` on `TransportOrder`); PRD §6.8.1.4 TO Execution — Own Fleet; business rule **TAR-003** |
| **Closing Sub-tasks** | TO-02 amendments (planned-milestone fields + lane-aware validation); DS-01 dispatch-gate amend; GPS-05 `planned_eta` contract amend; sub-tasks TBD on owning stories |
| **AC Amendment** | TO-02 / TAR-003: when **TDO — Own Fleet** assigns vehicle, driver, and helper(s) to a TO, the system captures **planned milestone datetimes** (not a single ambiguous ETA). **Finished Goods** (`flow_lane = fg_outbound`, `TRType.FG`): require all four — **Planned Source Arrival**, **Planned Source Departure**, **Planned Destination Arrival**, **Planned Destination Departure** — with monotonic ordering `source_arrival < source_departure < dest_arrival < dest_departure`. **Raw Material** (`flow_lane = rm_inbound`, `TRType.PORT_CONSIGNMENT`): require **two only** — **Planned Destination Arrival** and **Planned Destination Departure** — with `dest_arrival < dest_departure`; source planned times are **not shown and not required** (no source yard leg). Supervisor dispatch release (`ASSIGNED` → `READY_FOR_DISPATCH`) is blocked until the lane-applicable set is complete. Legacy `eta_datetime` is migrated to `planned_destination_arrival_at` and deprecated. |
| **Status** | Resolved |
| **Priority** | High |
| **Notes** | Current implementation stores one `eta_datetime` on `TransportOrder` (admin “Own Fleet Assignment”, `PATCH /api/v1/transport-orders/{id}/eta`). `fleet_supervisor.services.dispatch_to_after_ready` gates on `eta_datetime` only. `Trip` already records **actual** source/destination timestamps but has no **planned** counterparts on the TO. GPS-05 exposes `planned_eta` as a single field. Distinct from TP `planned_delivery_datetime` (commercial delivery commitment at TO creation). |

### Client call observation

On a client call (2026-07-02), operations clarified that TDO (Own Fleet) should plan the trip as **milestone times along the yard chain**, not one “ETA” field. **Finished Goods** trips use the full source load → destination unload path and need **four** planned times. **Raw Material** (port consignment → mill) skips the source yard leg and needs **only destination arrival and departure** planned times.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-006) |
|--------|---------|-------------------|
| TDO timing input | Single `eta_datetime` (“ETA”) | Lane-aware planned milestone datetimes |
| Finished Goods | One field (ambiguous which leg) | Four required: source arrival, source departure, destination arrival, destination departure |
| Raw Material | Same single field | Two required: destination arrival, destination departure only |
| Admin (TDO own fleet) | `eta_datetime` in “Own Fleet Assignment” fieldset | FG: four datetime inputs; RM: two destination inputs (source fields hidden) |
| API | `PATCH …/eta` with `eta_datetime` | `PATCH …/planned-milestones` (or equivalent) with lane-required subset; suggestions pre-filled from `planned_delivery_datetime` + route duration |
| Supervisor release gate | `eta_datetime` must be set | All lane-applicable planned fields must be set |
| Planned vs actual | No planned legs on TO; GPS/dashboard uses single `planned_eta` | Compare each planned milestone to `Trip` actuals / GPS geofence events (GPS-03, GPS-05) |
| Validation | None on ordering | FG: full chain ordering; RM: `dest_arrival < dest_departure`; optional warn if dest arrival after TP `planned_delivery_datetime` |

---

## FB-007 — Depot Officer becomes a POI-scoped ("local") role with full yard operations access

| Field | Value |
|-------|-------|
| **Source** | Client feedback — 2026-07-03 |
| **Affected Stories** | YARD-01 — POI-scoped yard platform ([sprint-4](../sprint-4/10-yard-foundation/YARD-01-poi-scoped-yard-platform.md), [sprint-5](../sprint-5/10-yard-foundation/YARD-01-poi-scoped-yard-platform.md)); [BUG-06](06-bug-fixes/BUG-06-tenant-admin-poi-access-not-enforced.md) (POI-scoped yard queue access pattern) |
| **Reference docs** | [`user-roles.md`](../../../01-source/03-sow/user-roles.md), [`user-tenant-management.md`](../../../05-modules/01-foundation/user-tenant-management.md) §POI Assignment |
| **Closing Sub-tasks** | TBD — role/permission amendment on Depot Officer (`role_code=depot_officer`); yard-module menu grants |
| **AC Amendment** | **Depot Officer** becomes a **POI-scoped ("local") role** — restricted to their assigned depot/POI, using the same POI-scoping pattern established by YARD-01 for Gate/Scale/Command Center/Loading/Unloading queues (fail-closed with no working-site selected; querysets/autocompletes/actions scoped to the assigned POI only). In addition to its existing Product Requisition creation and stock-view access at that POI, Depot Officer is granted menu and data access to **all yard operation modules** at their assigned depot: Gate (Gate-In/Gate-Out), Scaling, Command Center, Loading, Unloading. No cross-POI access. |
| **Status** | Open |
| **Priority** | Medium |
| **Notes** | Today `depot_officer` is a Requester-only role code (PR creation, stock-snapshot view at their POI per `stock-operations-sprint5.md` §Roles) with no yard-operations menu grant. This amendment adds yard-module access on top of the existing requester scope — it does not remove or change the PR-creation responsibility. |

### Client feedback observation

Depot Officer needs to operate the yard (gate, scaling, command center, loading, unloading) at their own depot in addition to raising requisitions — today the role has no access to those modules at all.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-007) |
|--------|---------|--------------------|
| Role scope | Requester role for PR creation + stock view | POI-scoped ("local") role, same scoping model as YARD-01 |
| Yard module access | None (Gate/Scale/CC/Loading/Unloading not granted) | Full access to all five yard operation modules at assigned POI |
| Cross-POI visibility | N/A | None — fails closed outside assigned POI, per YARD-01/BUG-06 pattern |
| PR creation | Unchanged | Unchanged |

---

## FB-008 — TDO (Own Fleet) role removed; Transport Planner owns own-fleet TO creation, assignment, and planned milestone times

| Field | Value |
|-------|-------|
| **Source** | Client feedback — 2026-07-03 |
| **Affected Stories** | TO-01 ([transport-order-management](../../../05-modules/05-transport/transport-order-management.md)), TO-02 ([trip-management](../../../05-modules/05-transport/trip-management.md)), [FB-006](#fb-006--tdo-own-fleet-planned-milestone-times-fg-four-rm-two-replace-single-eta) (this sprint), role model ([`user-roles.md`](../../../01-source/03-sow/user-roles.md)) |
| **Sprint 3 origin** | [`sprint-3/05-transport/02-transport-orders.md`](../../sprint-3/05-transport/02-transport-orders.md) (TO-01), [`sprint-3/05-transport/03-tdo-assignment.md`](../../sprint-3/05-transport/03-tdo-assignment.md) (TO-02) |
| **Closing Sub-tasks** | TO-01/TO-02 amendments (role removal, creation-form fields, assignment ownership transfer); FB-006 sub-tasks amend (add Planned Start Time) |
| **AC Amendment** | **TDO — Own Fleet** role is **removed** from the role model. Transport Planner absorbs all own-fleet TO creation and resource-assignment responsibilities previously owned by TDO (Own Fleet): **(1) TO creation (own fleet)** — existing multi-TO-per-TR creation flow is unchanged, plus two new fields captured at creation: **Vehicle Type** (dropdown, mandatory) and **Vehicle Registration Number** (optional — may be left blank and filled in at assignment). **(2) Assignment** (now a Transport Planner action, not TDO) — Vehicle, Driver, and **five** planned milestone datetimes: **Planned Start Time**, **Planned Source Arrival**, **Planned Source Departure**, **Planned Destination Arrival**, **Planned Destination Departure**. Planned Start Time is a new field **in addition to** FB-006's lane-aware set — Finished Goods (`flow_lane = fg_outbound`) requires all 5; Raw Material (`flow_lane = rm_inbound`) requires **3**: Planned Start Time + Planned Destination Arrival + Planned Destination Departure (source planned fields remain not-shown/not-required for RM per FB-006). **(3) Status** — `TO.status = created` on creation; `TO.status = assigned` once the Transport Planner has entered **both** Vehicle and Driver. All other TO status values and transitions are unchanged from the existing lifecycle (`ready_for_dispatch`, `dispatched`, `at_source`, `in_transit_destination`, `delivered_unloaded`, etc. — see FB-010/FB-011 for the changes that do apply). |
| **Status** | Open |
| **Priority** | High |
| **Notes** | Current spec (`trip-management.md`, `transport-order-management.md`) has TDO (Own Fleet) perform vehicle/driver/helper/ETA assignment in a dedicated Assignment Queue, separate from Transport Planner's TO-creation screen. This item merges TO creation and resource assignment under the Transport Planner persona and removes the TDO (Own Fleet) role/menu entirely. Helper assignment (currently part of TDO-Own scope) is not mentioned in the new feedback — **confirm whether helper assignment stays, moves to Transport Planner, or is dropped** during implementation planning. |

### Client feedback observation

The client no longer wants a separate TDO (Own Fleet) role. The Transport Planner should both create the TO and assign the vehicle and driver directly, along with planned times covering the full yard-to-yard chain (start, source arrival/departure, destination arrival/departure) rather than a single ETA.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-008) |
|--------|---------|---------------------|
| Own-fleet vehicle/driver assignment owner | TDO — Own Fleet (separate role, separate Assignment Queue) | Transport Planner (same persona that creates the TO) |
| TDO — Own Fleet role | Exists | Removed |
| TO creation (own fleet) fields | TR, quantity allocation, fleet type | + Vehicle Type (mandatory dropdown), Vehicle Registration Number (optional) |
| Planned milestone fields (FG) | 4 — source arrival/departure, destination arrival/departure (FB-006) | 5 — add Planned Start Time |
| Planned milestone fields (RM) | 2 — destination arrival/departure (FB-006) | 3 — add Planned Start Time |
| `created` → `assigned` trigger | Driver set (own fleet — per `transport-order-management.md` state table) | Vehicle **and** Driver both set by Transport Planner |
| Multi-TO creation | Supported | Unchanged |

---

## FB-009 — TDO (Vendor Fleet) retained; Transport Planner selects Vehicle Type for vendor-fleet TOs at creation

| Field | Value |
|-------|-------|
| **Source** | Client feedback — 2026-07-03 |
| **Affected Stories** | TO-01 ([transport-order-management](../../../05-modules/05-transport/transport-order-management.md)), TO-02 ([trip-management](../../../05-modules/05-transport/trip-management.md)) |
| **Closing Sub-tasks** | TO-01 creation-form amendment (Vehicle Type field on vendor-fleet path) |
| **AC Amendment** | **TDO — Vendor Fleet** role **continues to exist unchanged**, retaining its current responsibilities (assign contractual vendor, vendor vehicle registration, per existing `trip-management.md` Assignment Queue flow). New: at **TO creation**, when the Transport Planner selects **Fleet Type = Vendor**, the Planner also inputs **Vehicle Type** (dropdown, mandatory) as a new field on the TO — alongside the existing multi-TO-per-TR creation flow. Vehicle Type is then visible to TDO (Vendor Fleet) as context in the Assignment Queue when assigning the contractual vendor and vehicle. |
| **Status** | Open |
| **Priority** | Medium |
| **Notes** | Distinct from FB-008 — TDO (Vendor Fleet) is **not** removed; only the Vehicle Type input moves earlier, to TO creation by the Transport Planner. No change to contractual-vendor auto-rate or vendor assignment logic. |

### Client feedback observation

For vendor-fleet TOs, the Transport Planner should specify the vehicle type up front at creation time, while the TDO (Vendor Fleet) role continues to handle contractual vendor and vehicle assignment as today.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-009) |
|--------|---------|---------------------|
| Vehicle Type field | Not captured on vendor-fleet TO | Mandatory dropdown at TO creation when Fleet Type = Vendor |
| TDO — Vendor Fleet role | Assigns contractual vendor + vendor vehicle registration | Unchanged |
| TO creation flow | Fleet type selection only | + Vehicle Type when Fleet Type = Vendor |

---

## FB-010 — TO completion decoupled from gate-out/POD; Completed triggered by destination scale-out; new Bill Disbursed terminal status

| Field | Value |
|-------|-------|
| **Source** | Client feedback — 2026-07-03 |
| **Affected Stories** | [GT-01/GT-02](../sprint-4/04-gate/GT-01-gate-in-out-remarks.md) (gate-out), TLS-01 / POD-01 ([`transport-lifecycle-pod-sprint4.md`](../../../05-modules/05-transport/transport-lifecycle-pod-sprint4.md)), [`gate-operations-sprint4.md`](../../../05-modules/06-poi-operations/gate-operations-sprint4.md) |
| **Closing Sub-tasks** | TLS-01/POD-01 amendments (remove POD prerequisite for all lanes); GateOutAdmin/Service amendment (drop guard-matrix blocking of vehicle/driver availability); new Bill Disbursed status + Transport Planner action |
| **AC Amendment** | **(1) Gate-out** is no longer a prerequisite for vehicle/driver availability or for TO completion, for **any** lane. `GateOut` remains a **timestamp-only** record (`gate_out_at`) for audit/dwell-time purposes; it no longer participates in any status-transition guard. **(2) Completion** — when **destination scale-out** completes (all lanes — FG outbound and RM inbound alike), `TO.status` advances directly to **Completed**, and the assigned Vehicle and Driver revert to **Available** immediately, independent of any subsequent gate-out. **(3) POD** (Proof of Delivery) submission is **removed from the TO/Trip lifecycle entirely** — not only for GT-02 single-visit on-demand TOs (extends that existing no-POD precedent to all lanes). **(4) Bill Disbursed** — the Transport Planner gets a new **"Bill Disbursed"** action available on `Completed` TOs (own-fleet **and** vendor-fleet alike), advancing `TO.status` to a new terminal state, **Bill Disbursed**. |
| **Status** | Open |
| **Priority** | High |
| **Notes** | Current spec: `completed` normally requires POD submission (`can_submit_pod`, TP-triggered `Close TO` → `closed`); only GT-02 single-visit on-demand TOs skip POD today (`completed` reachable directly on gate-out — see `gate-operations-sprint4.md` §4.5). Fleet (vehicle/driver) release currently happens on `completed`/`closed` and is flagged as a **code gap** in `transport-lifecycle-pod-sprint4.md` v3.3 §2.7 — FB-010 resolves that gap by making release explicit and tying it to **destination scale-out**, not gate-out/closure. "Bill Disbursed" for vendor-fleet TOs needs reconciliation with any existing vendor invoice / trip-costing flow (see `05-transport/README.md` §Downstream → `11-reporting` trip costing, vendor billing reports) during implementation planning — confirm whether Bill Disbursed **replaces** `closed` as the new terminal state, or sits alongside it. |

### Client feedback observation

Gate-out should just be a timestamp — it should not block a vehicle or driver from becoming available again, and it should not gate TO completion. The TO should complete as soon as the destination scale-out is done, no POD is needed, and after completion the Transport Planner should have a way to mark the bill as disbursed.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-010) |
|--------|---------|---------------------|
| Gate-out role | Guard-matrix checkpoint feeding status transitions (e.g. `in_transit_destination` on source gate-out) + fleet-availability trigger | Timestamp-only record; no status or availability guard |
| Completion trigger | Gate-out (GT-02 single-visit) or gate-out + POD (all other lanes) | Destination scale-out completion, for every lane |
| Vehicle/driver availability | Tied to `completed`/`closed` (documented code gap) | Tied directly to destination scale-out completion |
| POD | Required for completion except GT-02 single-visit | Removed entirely, all lanes |
| Terminal status | `completed` → `closed` (TP "Close TO") | `completed` → **Bill Disbursed** (TP action), for own-fleet and vendor-fleet TOs alike |

---

## FB-011 — Vehicle multi-TO planning with single-active-TO exclusivity; Driver Supervisor inspect/skip-inspect gates dispatch readiness

| Field | Value |
|-------|-------|
| **Source** | Client feedback — 2026-07-03 |
| **Affected Stories** | TO-02 ([trip-management](../../../05-modules/05-transport/trip-management.md) — vehicle/driver conflict checks), [DS-01](../sprint-5/01-driver-supervisor/DS-01-vehicle-licence-health-handover-checklists.md) (handover checklist / inspect / dispatch release), [`transport-lifecycle-pod-sprint4.md`](../../../05-modules/05-transport/transport-lifecycle-pod-sprint4.md) (`dispatch_to_after_ready`) |
| **Closing Sub-tasks** | TO-02 conflict-check amendment (scope multi-active-TO rule to "currently serving" only); DS-01 confirmation that inspect/skip-inspect target status aligns with Transport Planner-driven assignment (FB-008) |
| **AC Amendment** | **(1)** A **Vehicle** may be **planned/assigned against multiple TOs concurrently** (e.g. queued future TOs); a Vehicle and its Driver may **actively serve only one TO at a time**. The existing multi-active-TO conflict check (409) is scoped to mean "currently in-transit / actively serving another TO", not "has any non-terminal TO assignment" — assignment to a further TO while another of its TOs is queued or completed remains allowed. **(2)** The **Driver Supervisor** selects a Vehicle for a given TO and performs **Inspect** or **Skip Inspect** (per the existing DS-01 vehicle/driver handover checklist). Completing inspection (or skipping it) advances the TO to **Ready for Dispatch**. **(3)** Once Ready for Dispatch, the **Driver** can see the TO in their assigned list and start the Trip. |
| **Status** | Open |
| **Priority** | High |
| **Notes** | **Flag for implementation planning**: current spec has TDO set `ready_for_dispatch` (all resources assigned) and DS-01 inspect/skip advance the TO from `ready_for_dispatch` to **`dispatched`** (`dispatch_to_after_ready`, `transport-lifecycle-pod-sprint4.md` v3.2/v3.4). Since TDO (Own Fleet) is removed (FB-008) and the Transport Planner now performs full assignment (vehicle + driver + planned times) in one step, **confirm whether the Driver Supervisor's inspect/skip-inspect action should now set the existing `ready_for_dispatch` status directly** (folding the former TDO step into DS-01), **or** whether it continues to set `dispatched` and the client's "Ready for Dispatch" wording is describing that same post-inspection state informally. Vehicle conflict check today also blocks on "under maintenance" / "on trip" (`trip-management.md` §Testing) — this item only relaxes the **multi-active-TO** rule referenced by the client; maintenance/on-trip exclusions are unchanged. |

### Client feedback observation

A vehicle should be plannable against several TOs ahead of time, but it (and its driver) can only actually be out serving one TO at once. The Driver Supervisor picks the vehicle for a TO, inspects it (or skips inspection), and only then does the TO become ready for dispatch so the driver can start the trip.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-011) |
|--------|---------|---------------------|
| Vehicle assignment across TOs | Conflict check blocks assignment while vehicle has another active TO (`under maintenance`, `on trip`, multi-active-TO 409) | Vehicle may be planned against multiple TOs; only actively serving (in-transit) TO counts as a conflict |
| Driver assignment across TOs | Multi-active-TO conflict (409) | Same single-active-TO-served rule as vehicle |
| Driver Supervisor action | Inspect/skip-inspect via DS-01 handover checklist | Unchanged — still Inspect or Skip Inspect |
| Post-inspection status | `dispatched` (`dispatch_to_after_ready`) | Client refers to this as "Ready for Dispatch" — naming alignment TBD (see Notes) |
| Driver trip start | Blocked until `dispatched` | Blocked until the post-inspection status is reached; driver then starts the trip |

---

## FB-012 — Stock movement calculated from load/unload data, not scale-in/scale-out weighbridge difference

| Field | Value |
|-------|-------|
| **Source** | Client feedback — 2026-07-03 |
| **Affected Stories** | STK-01 ([`stock-operations-sprint5.md`](../../../05-modules/06-poi-operations/stock-operations-sprint5.md)), [FB-005](#fb-005--loadingunloading-quantity-capture-per-to-product-line-item) (this sprint — per-line-item load/unload capture) |
| **Closing Sub-tasks** | STK-01 trigger redesign (replace `ScaleOutService.record_scale_out()` as the stock trigger); depends on FB-005's `LoadEventLineItem` / `UnloadEventLineItem` being in place |
| **AC Amendment** | `current_stock_mt` movement is calculated from **loading and unloading data**, not from the scale-in/scale-out weighbridge difference. Source POI deduction is driven by the **loaded quantity** recorded at loading points (sum of `LoadEventLineItem` weight, per FB-005); destination POI addition is driven by the **received quantity** recorded at unloading points (sum of `UnloadEventLineItem` weight, per FB-005). The stock trigger moves from `ScaleOutService.record_scale_out()` to the loading/unloading completion services (`LDService.complete_loading()` / `complete_unloading()`, or equivalent), summed across all line items for the visit. `abs(scale_in_weight_mt − scale_out_weight_mt)` is no longer used as the stock-movement quantity — scale-in/scale-out weights remain captured for weighbridge/gate record-keeping only. |
| **Status** | Open |
| **Priority** | High |
| **Notes** | Current spec (STK-01 v2.0): stock trigger is exactly one place, `ScaleOutService.record_scale_out()`, using `net_weight_mt = abs(scale_in_weight_mt − scale_out_weight_mt)` (events `SCALE_OUT_SOURCE_DEDUCTION` / `SCALE_OUT_DESTINATION_ADDITION`). This item moves the trigger to loading/unloading completion and the movement quantity to the sum of per-line-item loaded/received amounts (FB-005). Sequencing dependency: FB-005's `LoadEventLineItem` / `UnloadEventLineItem` models must exist before this can be implemented, since today only aggregate `bags_loaded` / `weight_loaded_mt` fields exist on `LoadEvent`/`UnloadEvent`. In-transit counters (`in_transit_outgoing_mt` / `in_transit_incoming_mt`, driven by TO dispatch and `to.allocated_quantity`) are unaffected by this change — only the `current_stock_mt` movement trigger and quantity source change. Confirm during implementation planning whether the no-blocker / warning-only policy (§ STK-01 v1.2 — stock bookkeeping never blocks yard operations) still applies unchanged to the new trigger point. |

### Client feedback observation

Stock at a POI should move based on what was actually loaded or unloaded (the operational load/unload record), not the absolute difference between the scale-in and scale-out weighbridge readings — the two can diverge (e.g. weighbridge rounding, multi-point loads) and the client wants stock to reflect the loading/unloading activity itself.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-012) |
|--------|---------|---------------------|
| Stock trigger point | `ScaleOutService.record_scale_out()` (scale-out completion) | Loading/unloading completion (per FB-005 per-line-item capture) |
| Movement quantity (source deduction) | `abs(scale_in_weight_mt − scale_out_weight_mt)` | Sum of `LoadEventLineItem` loaded weight for the visit |
| Movement quantity (destination addition) | `abs(scale_in_weight_mt − scale_out_weight_mt)` | Sum of `UnloadEventLineItem` received weight for the visit |
| Scale-in / scale-out weights | Used for both weighbridge record **and** stock movement | Weighbridge record only — no longer the stock-movement source |
| In-transit counters (`in_transit_outgoing_mt` / `in_transit_incoming_mt`) | Driven by TO dispatch (`allocated_quantity`) | Unchanged |

---

## Resolution Summary

| Priority | Count | Closed | Open |
|----------|-------|--------|------|
| High | 8 | 4 | 4 |
| Medium | 4 | 2 | 2 |
| **Total** | **12** | **6** | **6** |

*Created: 2026-06-22 — Sprint 6 demo feedback | Updated: 2026-07-02 — FB-005 client-call loading/unloading per TO line item; FB-006 TDO planned milestone times (FG four / RM two) | Updated: 2026-07-03 — FB-007..FB-011 client feedback: Depot Officer POI-scoped local role + yard access; TDO (Own Fleet) removed (Transport Planner owns own-fleet creation/assignment); TDO (Vendor Fleet) retained with Vehicle Type at creation; TO completion on destination scale-out (no POD) + Bill Disbursed status; vehicle multi-TO planning with single-active-TO exclusivity + Driver Supervisor inspect/skip-inspect gate; FB-012 stock movement from load/unload data instead of scale-in/scale-out difference*
