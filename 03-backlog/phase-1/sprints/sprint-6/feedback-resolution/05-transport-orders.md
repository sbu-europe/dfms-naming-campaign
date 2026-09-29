---
title: Sprint 6 Feedback — Transport Orders
module: 05-transport-orders
menu: Transport / Transport Orders / Challan
parent: ./README.md
---

# Transport Orders

**Admin menu / area:** Transport / Transport Orders / Challan  
**Tracker index:** [README.md](./README.md)

> **Resolution Status values**: `Open` → `In Progress` → `Resolved`

| ID | Title | Priority | Status |
|----|-------|----------|--------|
| [FB-006](#fb-006--tdo-own-fleet-planned-milestone-times-fg-four--rm-two-replace-single-eta) | TDO own-fleet planned milestone times (FG four / RM two; replace single ETA) | High | Resolved |
| [FB-008](#fb-008--tdo-own-fleet-role-removed-transport-planner-owns-own-fleet-to-creation-assignment-and-planned-milestone-times) | TDO (Own Fleet) role removed; Transport Planner owns own-fleet TO creation, assignment, and planned milestone times | High | Resolved |
| [FB-009](#fb-009--tdo-vendor-fleet-retained-transport-planner-selects-vehicle-type-for-vendor-fleet-tos-at-creation) | TDO (Vendor Fleet) retained; Transport Planner selects Vehicle Type for vendor-fleet TOs at creation | Medium | Resolved |
| [FB-010](#fb-010--to-completion-decoupled-from-gate-outpod-completed-triggered-by-destination-scale-out-new-bill-disbursed-terminal-status) | TO completion decoupled from gate-out/POD; Completed triggered by destination scale-out; new Bill Disbursed terminal status | High | Resolved |
| [FB-011](#fb-011--vehicle-multi-to-planning-with-single-active-to-exclusivity-driver-supervisor-inspectskip-inspect-gates-dispatch-readiness) | Vehicle multi-TO planning with single-active-TO exclusivity; Driver Supervisor inspect/skip-inspect gates dispatch readiness | High | Resolved |
| [FB-019](#fb-019--to-planning-required-substate-vendor-fleet-bidding-status-labels-on-to) | TO planning-required substate; vendor-fleet bidding status labels on TO | High | Resolved |
| [FB-020](#fb-020--delivery-challan-footer-emergency-contact-number--printed-timestamp--page-number) | Delivery challan footer: emergency contact number + printed timestamp + page number | Medium | Resolved |

---

## FB-006 — TDO own-fleet planned milestone times (FG four / RM two; replace single ETA)

| Field | Value |
|-------|-------|
| **Source** | Client call / product clarification — 2026-07-02 |
| **Affected Stories** | TO-02 (Sprint 3 — TDO assignment), [DS-01](../../sprint-5/01-driver-supervisor/DS-01-vehicle-licence-health-handover-checklists.md) (fleet supervisor dispatch release), [GPS-05](../02-gps-maps-dashboard/GPS-05-maps-dashboard-integration.md), [DM-01](../../sprint-5/03-driver-mobile-interface/DM-01-driver-mobile-interface-to-list-milestones-pod.md) (driver read-only plan) |
| **Sprint 3 origin** | [`docs/planning/sprint-3-implementation.md`](../../../../../../docs/planning/sprint-3-implementation.md) — Phase 9 TO-02 (`PATCH …/eta`, `eta_datetime` on `TransportOrder`); PRD §6.8.1.4 TO Execution — Own Fleet; business rule **TAR-003** |
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

---

## FB-008 — TDO (Own Fleet) role removed; Transport Planner owns own-fleet TO creation, assignment, and planned milestone times

| Field | Value |
|-------|-------|
| **Source** | Client feedback — 2026-07-03 |
| **Affected Stories** | TO-01 ([transport-order-management](../../../../../05-modules/05-transport/transport-order-management.md)), TO-02 ([trip-management](../../../../../05-modules/05-transport/trip-management.md)), [FB-006](#fb-006--tdo-own-fleet-planned-milestone-times-fg-four-rm-two-replace-single-eta) (this sprint), role model ([`user-roles.md`](../../../../../01-source/03-sow/user-roles.md)) |
| **Sprint 3 origin** | [`sprint-3/05-transport/02-transport-orders.md`](../../../../sprint-3/05-transport/02-transport-orders.md) (TO-01), [`sprint-3/05-transport/03-tdo-assignment.md`](../../../../sprint-3/05-transport/03-tdo-assignment.md) (TO-02) |
| **Closing Sub-tasks** | TO-01/TO-02 amendments (role removal, creation-form fields, assignment ownership transfer); FB-006 sub-tasks amend (add Planned Start Time) |
| **AC Amendment** | **TDO — Own Fleet** role is **removed** from the role model. Transport Planner absorbs all own-fleet TO creation and resource-assignment responsibilities previously owned by TDO (Own Fleet): **(1) TO creation (own fleet)** — existing multi-TO-per-TR creation flow is unchanged, plus two new fields captured at creation: **Vehicle Type** (dropdown, mandatory) and **Vehicle Registration Number** (optional — may be left blank and filled in at assignment). **(2) Assignment** (now a Transport Planner action, not TDO) — Vehicle, Driver, and **five** planned milestone datetimes: **Planned Start Time**, **Planned Source Arrival**, **Planned Source Departure**, **Planned Destination Arrival**, **Planned Destination Departure**. Planned Start Time is a new field **in addition to** FB-006's lane-aware set — Finished Goods (`flow_lane = fg_outbound`) requires all 5; Raw Material (`flow_lane = rm_inbound`) requires **3**: Planned Start Time + Planned Destination Arrival + Planned Destination Departure (source planned fields remain not-shown/not-required for RM per FB-006). **(3) Status** — `TO.status = created` on creation; `TO.status = assigned` once the Transport Planner has entered **both** Vehicle and Driver. All other TO status values and transitions are unchanged from the existing lifecycle (`ready_for_dispatch`, `dispatched`, `at_source`, `in_transit_destination`, `delivered_unloaded`, etc. — see FB-010/FB-011 for the changes that do apply). |
| **Status** | Resolved |
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

---

## FB-009 — TDO (Vendor Fleet) retained; Transport Planner selects Vehicle Type for vendor-fleet TOs at creation

| Field | Value |
|-------|-------|
| **Source** | Client feedback — 2026-07-03 |
| **Affected Stories** | TO-01 ([transport-order-management](../../../../../05-modules/05-transport/transport-order-management.md)), TO-02 ([trip-management](../../../../../05-modules/05-transport/trip-management.md)) |
| **Closing Sub-tasks** | TO-01 creation-form amendment (Vehicle Type field on vendor-fleet path) |
| **AC Amendment** | **TDO — Vendor Fleet** role **continues to exist unchanged**, retaining its current responsibilities (assign contractual vendor, vendor vehicle registration, per existing `trip-management.md` Assignment Queue flow). New: at **TO creation**, when the Transport Planner selects **Fleet Type = Vendor**, the Planner also inputs **Vehicle Type** (dropdown, mandatory) as a new field on the TO — alongside the existing multi-TO-per-TR creation flow. Vehicle Type is then visible to TDO (Vendor Fleet) as context in the Assignment Queue when assigning the contractual vendor and vehicle. Transport Planner completes **planned milestones** on vendor-fleet TOs; the TO becomes visible to TDO (Vendor Fleet) only after those inputs are complete (`under_planning` → `created`). |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | Distinct from FB-008 — TDO (Vendor Fleet) is **not** removed; only the Vehicle Type input moves earlier, to TO creation by the Transport Planner. No change to contractual-vendor auto-rate or vendor assignment logic. Transport Planner completes **planned milestones** on vendor-fleet TOs; the TO becomes visible to TDO (Vendor Fleet) only after those inputs are complete. |

### Client feedback observation

For vendor-fleet TOs, the Transport Planner should specify the vehicle type up front at creation time, complete planned milestone inputs, and only then should the TO appear in the TDO (Vendor Fleet) queue for contractual vendor and vehicle assignment.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-009) |
|--------|---------|---------------------|
| Vehicle Type field | Not captured on vendor-fleet TO | Mandatory dropdown at TO creation when Fleet Type = Vendor |
| Planned milestones | Own-fleet only; vendor TO visible to TDO immediately on create | Transport Planner completes planned milestones on vendor-fleet TO; TO visible to TDO (Vendor Fleet) only after milestones are complete |
| TDO — Vendor Fleet role | Assigns contractual vendor + vendor vehicle registration | Unchanged |
| TO creation flow | Fleet type selection only | + Vehicle Type when Fleet Type = Vendor |

---

---

## FB-010 — TO completion decoupled from gate-out/POD; Completed triggered by destination scale-out; new Bill Disbursed terminal status

| Field | Value |
|-------|-------|
| **Source** | Client feedback — 2026-07-03 |
| **Affected Stories** | [GT-01/GT-02](../../sprint-4/04-gate/GT-01-gate-in-out-remarks.md) (gate-out), TLS-01 / POD-01 ([`transport-lifecycle-pod-sprint4.md`](../../../../../05-modules/05-transport/transport-lifecycle-pod-sprint4.md)), [`gate-operations-sprint4.md`](../../../../../05-modules/06-poi-operations/gate-operations-sprint4.md) |
| **Closing Sub-tasks** | TLS-01/POD-01 amendments (remove POD prerequisite for all lanes); GateOutAdmin/Service amendment (drop guard-matrix blocking of vehicle/driver availability); new Bill Disbursed status + Transport Planner action |
| **AC Amendment** | **(1) Gate-out** is no longer a prerequisite for vehicle/driver availability or for TO completion, for **any** lane. `GateOut` remains a **timestamp-only** record (`gate_out_at`) for audit/dwell-time purposes; it no longer participates in any status-transition guard. **(2) Completion** — when **destination scale-out** completes (all lanes — FG outbound and RM inbound alike), `TO.status` advances directly to **Completed**, and the assigned Vehicle and Driver revert to **Available** immediately, independent of any subsequent gate-out. **(3) POD** (Proof of Delivery) submission is **removed from the TO/Trip lifecycle entirely** — not only for GT-02 single-visit on-demand TOs (extends that existing no-POD precedent to all lanes). **(4) Bill Disbursed** — the Transport Planner gets a new **"Bill Disbursed"** action available on `Completed` TOs (own-fleet **and** vendor-fleet alike), advancing `TO.status` to a new terminal state, **Bill Disbursed**. |
| **Status** | Resolved |
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

---

## FB-011 — Vehicle multi-TO planning with single-active-TO exclusivity; Driver Supervisor inspect/skip-inspect gates dispatch readiness

| Field | Value |
|-------|-------|
| **Source** | Client feedback — 2026-07-03 |
| **Affected Stories** | TO-02 ([trip-management](../../../../../05-modules/05-transport/trip-management.md) — vehicle/driver conflict checks), [DS-01](../../sprint-5/01-driver-supervisor/DS-01-vehicle-licence-health-handover-checklists.md) (handover checklist / inspect / dispatch release), [`transport-lifecycle-pod-sprint4.md`](../../../../../05-modules/05-transport/transport-lifecycle-pod-sprint4.md) (`dispatch_to_after_ready`) |
| **Closing Sub-tasks** | TO-02 conflict-check amendment (scope multi-active-TO rule to "currently serving" only); DS-01 confirmation that inspect/skip-inspect target status aligns with Transport Planner-driven assignment (FB-008) |
| **AC Amendment** | **(1)** A **Vehicle** may be **planned/assigned against multiple TOs concurrently** (e.g. queued future TOs); a Vehicle and its Driver may **actively serve only one TO at a time**. The existing multi-active-TO conflict check (409) is scoped to mean "currently in-transit / actively serving another TO", not "has any non-terminal TO assignment" — assignment to a further TO while another of its TOs is queued or completed remains allowed. **(2)** The **Driver Supervisor** selects a Vehicle for a given TO and performs **Inspect** or **Skip Inspect** (per the existing DS-01 vehicle/driver handover checklist). Completing inspection (or skipping it) advances the TO to **Ready for Dispatch**. **(3)** Once Ready for Dispatch, the **Driver** can see the TO in their assigned list and start the Trip. |
| **Status** | Resolved |
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

---

## FB-019 — TO planning-required substate; vendor-fleet bidding status labels on TO

| Field | Value |
|-------|-------|
| **Source** | Client feedback — 2026-07-17 |
| **Affected Stories** | TO-01 ([transport-order-management](../../../../../05-modules/05-transport/transport-order-management.md)), TO-02 ([trip-management](../../../../../05-modules/05-transport/trip-management.md)), VM-04 / TEVF-02 (non-contractual bidding); amends [FB-008](#fb-008--tdo-own-fleet-role-removed-transport-planner-owns-own-fleet-to-creation-assignment-and-planned-milestone-times), [FB-009](#fb-009--tdo-vendor-fleet-retained-transport-planner-selects-vehicle-type-for-vendor-fleet-tos-at-creation) |
| **Closing Sub-tasks** | FB-019-1 … FB-019-6 — TBD |
| **AC Amendment** | **(1) Own fleet — planning required substate:** When the Transport Planner creates an own-fleet TO, the TO remains in a **Planning Required** substate (display label; implement as `TOSubState` value or equivalent badge on the TO) until **all three** prerequisites are set: **Vehicle**, **Driver**, and the **lane-applicable planned milestone datetimes** (per FB-006 / FB-008). Until then, the TO must **not** promote to `assigned`. Once all three are complete, `TO.status` advances to **`assigned`** as today; all downstream status transitions and guards (`ready_for_dispatch`, yard execution, completion, Bill Disbursed, etc.) remain unchanged. **(2) Vendor fleet — planning gate:** Vendor-fleet TOs remain in **`under_planning`** until planned milestones are complete. While `under_planning`, the TO **cannot** be assigned to a **non-contractual** vendor or published for bidding. When planned milestones are complete, the TO moves to **`created`** and becomes visible in the **TDO — Vendor Fleet** queue (unchanged handoff from FB-009). **(3) Vendor fleet — non-contractual bidding TO statuses:** When TDO (Vendor Fleet) publishes one or more TOs for **non-contractual** bidding, the TO status (or user-facing status label on the TO) advances through: **`Bidding in Progress`** while the bidding window is **open** (vendors may submit bids); **`Non-Contractual – Bidding in Progress`** while the window is open **or** closed but **no bid has been awarded yet**; **`Bidding Window Closed`** when the bidding window closes (no further submissions). After a bid is **won/awarded**, the TO follows the existing post-award lifecycle (VM-06 / VM-07 confirmation, execution, etc.). Contractual vendor assignment and all other vendor-fleet flows are unchanged. |
| **Status** | Resolved |
| **Priority** | High |
| **Notes** | Own-fleet today starts at `created` and promotes to `assigned` via `sync_own_fleet_assignment_status()` when vehicle + driver + milestones are complete (`planned_milestones.py`); there is no **Planning Required** substate badge yet. Vendor-fleet `under_planning` → `created` handoff is implemented (FB-009). TO-level bidding statuses were removed in Sprint 3 (`open_for_bidding` dropped from `TransportOrder`); bidding state today lives on `BiddingSession.status` (`scheduled`, `open`, `closed`, `awarded`, …) only. This item reintroduces **user-visible TO status labels** for the non-contractual path while keeping session/member award logic intact. Confirm during implementation whether `Bidding Window Closed` and `Non-Contractual – Bidding in Progress` are distinct `TOStatus` enum values or display aliases keyed off session + award state. |

### Client feedback observation

Operations want clearer planning gates on the TO record itself. For **own fleet**, planners should see **Planning Required** until vehicle, driver, and planned milestones are all captured, then **Assigned**. For **vendor fleet**, milestones must finish before TDO sees the TO; once TDO publishes non-contractual bids, the TO should show explicit **Bidding in Progress** / **Bidding Window Closed** states instead of staying at generic `created`.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-019) |
|--------|---------|-------------------|
| Own-fleet planning indicator | `created` until vehicle + driver + milestones complete; no Planning Required substate | **Planning Required** substate/badge until all three fields set; then `assigned` |
| Own-fleet `assigned` trigger | Vehicle + driver + planned milestones (`own_fleet_ready_for_assigned_status`) | Unchanged trigger; add visible planning-required state while incomplete |
| Vendor-fleet pre-milestone | `under_planning`; hidden from TDO until milestones complete (FB-009) | Unchanged; **block** non-contractual assignment/bidding while `under_planning` |
| Vendor-fleet post-milestone | `created`; visible to TDO (Vendor Fleet) | Unchanged |
| Non-contractual bid published | `BiddingSession` tracks window; TO status often stays `created` | TO shows **Bidding in Progress** / **Non-Contractual – Bidding in Progress** / **Bidding Window Closed** per window and award state |
| Post-award execution | VM-06 award → VM-07 confirmation → dispatch lifecycle | Unchanged |

---

---

## FB-020 — Delivery challan footer: emergency contact number + printed timestamp + page number

| Field | Value |
|-------|-------|
| **Source** | Client feedback — 2026-07-17 |
| **Affected Stories** | Delivery challan print ([`delivery-challan-print.md`](../../../../../05-modules/05-transport/delivery-challan-print.md)); TO-01 |
| **Closing Sub-tasks** | FB-020-1 — TBD |
| **AC Amendment** | Printable Delivery Challan footer SHALL include, on one line or grouped footer row: **(1)** printed timestamp (existing), **(2)** page number (existing), and **(3)** a fixed **Emergency Contact Number: 01713365796**. Layout: printed timestamp + page number + emergency contact number together in the challan **footer** region (below the “RECEIVED THE ABOVE GOODS IN GOOD CONDITION” bar, above signature blocks). Applies to both Django admin “Print Delivery Challan” action and `GET /api/v1/transport-orders/{id}/challan/`. |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | Implemented in `templates/transport/challan.html` + `apps/transport/challan.py`. Footer today shows `printed_at` and hardcoded `Page 1 of 1` only — no emergency contact line. Number is a **fixed operational constant** (not per-TO or per-POI). |

### Client feedback observation

The printed challan must show a reachable emergency contact on every page footer alongside the print time and page number.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-020) |
|--------|---------|-------------------|
| Footer left | Printed timestamp | Unchanged |
| Footer right | `Page 1 of 1` | Unchanged (or dynamic page count when multi-page) |
| Emergency contact | Not shown | **Emergency Contact Number: 01713365796** in footer with print time and page number |

---
