---
title: Sprint 6 — Feedback Resolution Tracker
source_sprint: Sprint 6
demo_date: 2026-06-22
total_items: 6
resolved: 0
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
| **Status** | Open |
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
| **Status** | Open |
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
| **Status** | Open |
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
| **Status** | Open |
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
| **Status** | Open |
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
| **Status** | Open |
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

## Resolution Summary

| Priority | Count | Closed | Open |
|----------|-------|--------|------|
| High | 4 | 0 | 4 |
| Medium | 2 | 0 | 2 |
| **Total** | **6** | **0** | **6** |

*Created: 2026-06-22 — Sprint 6 demo feedback | Updated: 2026-07-02 — FB-005 client-call loading/unloading per TO line item; FB-006 TDO planned milestone times (FG four / RM two)*
