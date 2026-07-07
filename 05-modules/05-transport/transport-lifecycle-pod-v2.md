---
module: 05-transport
specification: Transport Lifecycle, Completion & Bill Disbursement (Sprint 6 — FB-010)
version: 2.0
phase: Phase 1
sprint: Sprint 6 (FB-010)
last_updated: 2026-07-06
changelog: "v2.0 — FB-010: destination scale-out → completed + fleet release; gate-out timestamp-only; POD removed from lifecycle; Bill Disbursed replaces Close TO / closed terminal state."
related_stories: TLS-01, POD-01 (amended), GT-01, SC-01, DM-01 (POD retired)
feedback_items: FB-010
supersedes: transport-lifecycle-pod-sprint4.md §1.2, §1.6, §2 (POD-01 closure path), §2.7, §4.2–4.3, §5.2, §7
baseline_spec: transport-lifecycle-pod-sprint4.md
feedback_tracker: ../../03-backlog/sprints/sprint-6/feedback-resolution.md
cross_refs: gate-operations-sprint4.md, scaling-operations-sprint4.md, transport-order-management-v2.md (FB-008), vehicle-driver-multi-to-exclusivity-v2.md (FB-011)
jira_epic: DFS-075
---

# Transport Lifecycle, Completion & Bill Disbursement (FB-010)

## Overview

This document is the **Sprint 6 backend implementation plan** for [FB-010](../../03-backlog/sprints/sprint-6/feedback-resolution.md#fb-010--to-completion-decoupled-from-gate-outpod-completed-triggered-by-destination-scale-out-new-bill-disbursed-terminal-status). It amends the baseline [Transport Lifecycle, POD & QC Integration (Sprint 4)](./transport-lifecycle-pod-sprint4.md) (v3.4).

**Problem (client feedback — 2026-07-03):** Today TO completion is tied to destination gate-out and driver POD submission; fleet (vehicle/driver) becomes available only after `completed` / `closed`. Gate-out participates in status guards and blocks reassignment. Operations want the TO to **complete as soon as destination scale-out is done**, with gate-out as an audit timestamp only, **no POD**, and a Transport Planner action to mark **Bill Disbursed** as the billing terminal state.

**Solution (FB-010 scope):**

1. **Destination scale-out** (all lanes) advances `TransportOrder.status` directly to **`completed`** and **releases** assigned vehicle and driver immediately.
2. **Gate-out** records `gate_out_at` and yard `sub_state` only — **no** canonical status transition, **no** fleet-availability guard, **no** TO-completion prerequisite.
3. **POD** removed from the TO/Trip lifecycle (driver upload, `can_submit_pod`, closure `pod_uploaded` gate) — all lanes.
4. **Bill Disbursed** — new terminal status `bill_disbursed`; Transport Planner action on **`completed`** TOs (own-fleet and vendor-fleet); **replaces** `closed` / “Close TO” for new workflow.

**Primary module paths:**

- `apps/transport/lifecycle/` — status transitions, fleet release hooks
- `apps/transport/closure/` — bill-disbursement action (replaces close engine path)
- `apps/operations/scaling/` — completion trigger at destination scale-out
- `apps/operations/gate/` — gate-out decoupled from status / completion

**Out of scope (separate feedback items):** FB-012 (stock movement from load/unload data, not scale-out diff), vendor invoice / trip-costing report redesign, **E2E / Playwright tests** (unit + integration only for FB-010), DM-01 mobile app store release (backend API deprecation only).

---

## 0. Scope boundary

| In scope (FB-010) | Out of scope / separate items |
|-------------------|-------------------------------|
| `SCALE_OUT_RESULT_TO_STATUS` destination → `completed` | FB-012 — stock trigger moves to LD completion |
| Fleet release on destination scale-out (driver + assignment blocking) | Full removal of `ProofOfDelivery` DB table (retain for historical rows) |
| Gate-out: drop status transitions & completion/availability guards | Gate-in rules unchanged |
| Remove POD from lifecycle (API, admin, closure matrix, driver UI backend) | Rebuild vendor billing reports around `bill_disbursed` |
| New `bill_disbursed` status + TP admin/API action | Auto bill disbursement / ERP integration |
| Deprecate `closed` for new transitions; migrate Close TO → Mark Bill Disbursed | Renaming `ClosureChecklist` model (optional follow-up) |
| FG outbound source departure: move `at_source → driving_towards_destination` off gate-out | FB-009 — vehicle type at vendor TO creation |
| GT-02 on-demand: complete on destination scale-out, not gate-out | GPS geofence milestone automation |
| Vendor-fleet: remove manual TDO `advance → completed` (scale-out owns completion) | |
| Unit + integration tests | **E2E tests** — do not add or amend Playwright for FB-010 |

### Locked product decisions (implementation defaults)

| Topic | Decision | Rationale |
|-------|----------|-----------|
| `closed` vs `bill_disbursed` | **`bill_disbursed` replaces `closed`** for new workflow; `closed` enum value **retained** for legacy rows; no new transitions to `closed` | FB-010 names Bill Disbursed as terminal billing state; avoids two parallel terminals |
| `delivered_unloaded` | **Removed from happy-path transition graph**; enum **retained** for legacy rows | FB-010 completes at scale-out; intermediate status adds no value |
| FG source departure | **`at_source → driving_towards_destination` moves to source scale-out** (not gate-out) | Literal “gate-out timestamp-only” interpretation; loaded exit is weighbridge event |
| Gate-out yard clearance | **Retain physical clearance checks** (scale-out, load/unload, QC) for **gate operator UX** — failures block recording gate-out, but **do not** gate TO completion or fleet release | Operations still need to prevent premature physical exit; decoupling is about completion/availability |
| POD artifacts | **Stop accepting new POD**; do not delete `ProofOfDelivery` rows or files | Audit retention; simplifies rollback |
| Bill Disbursed prerequisites | **Only** `to.status == completed` | Client asked for simple TP billing marker after completion |
| Vendor-fleet completion | **Same scale-out → completed** path as own-fleet; remove vendor `advance-status → completed` | Single completion owner |
| Fleet release — driver | **`try_transition_driver_available_on_to_completion`** on transition to `completed` (unchanged helper; new trigger point) | Reuse DS-02-10 |
| Fleet release — vehicle | **`completed` ∉ ACTIVELY_SERVING_TO_STATUSES`** (FB-011); no `operational_status` flip unless product later requires explicit `AVAILABLE` on Vehicle MDM | Vehicle blocking is TO-assignment-based today |
| Closure checklist | **Repurpose** for TP **pre-disbursement review** (informational flags); **not** blocking for Bill Disbursed | TP may still want yard summary before billing |
| Permission | Reuse **`Transport.TO.Close`** for Mark Bill Disbursed **or** add `Transport.TO.BillDisburse` (recommend **reuse Close** to minimise RBAC churn) | Same actor (Transport Planner) |

---

## 1. Current vs expected behaviour

| Aspect | Current (v3.4 / codebase) | Expected (v2.0 / FB-010) |
|--------|---------------------------|---------------------------|
| Destination scale-out result | `delivered_unloaded` | **`completed`** |
| TO completion trigger | Gate-out (GT-02) or POD submit (all other lanes) | **Destination scale-out** (all lanes) |
| Gate-out status effect | FG source → `driving_towards_destination`; GT-02 → `completed`; dest: sub-state only | **Sub-state + timestamp only** (all legs) |
| FG source departure | Gate-out at origin → `driving_towards_destination` | **Source scale-out** → `driving_towards_destination` |
| POD | Required for completion (except GT-02 gate-out path) | **Removed** from lifecycle |
| Driver POD API / admin | Active (`submit_pod`, `can_submit_pod`) | **410 Gone** or disabled with stable error |
| Fleet release | On `completed` / `closed` (after POD) | On **`completed`** at destination scale-out |
| Terminal billing state | TP “Close TO” → `closed` | TP **“Mark Bill Disbursed”** → **`bill_disbursed`** |
| Closure matrix | Includes `pod_uploaded`, `gate_out_done` as close prerequisites | **No POD**; gate-out **not** required for disbursement |
| Vendor TDO advance | `delivered_unloaded → completed` via API | **Removed** — scale-out completes TO |
| `ACTIVELY_SERVING_TO_STATUSES` | Includes `delivered_unloaded` | **`delivered_unloaded` removed**; serving ends at `completed` |

---

## 2. Amended lifecycle model

### 2.1 Status enum changes

Add to `TOStatus` in `apps/transport/constants.py`:

```python
BILL_DISBURSED = "bill_disbursed", "Bill Disbursed"
```

**Deprecate for new writes (retain enum values for legacy rows):**

- `delivered_unloaded` — no new transitions into this status
- `closed` — no new transitions; existing rows unchanged

**Amended transition graph (execution tail only):**

```python
TO_STATUS_TRANSITIONS = {
    # ... upstream unchanged (FB-008 / FB-011) ...
    TOStatus.AT_DESTINATION: [TOStatus.COMPLETED],  # only via scale-out shortcut; yard may skip
    TOStatus.DELIVERED_UNLOADED: [TOStatus.COMPLETED],  # legacy rows only
    TOStatus.COMPLETED: [TOStatus.BILL_DISBURSED],
    # TOStatus.CLOSED: []  # terminal — legacy only
}
```

### 2.2 Per-lane execution chain (amended tail)

Authoritative yard progression through load/unload/QC is **unchanged** until scale-out. Amended rows:

| Step | FG outbound | FG inbound | RM inbound |
|------|------------|-----------|-----------|
| Scale-out (source) | `sub_state`: `scale_out_source`; status → **`driving_towards_destination`** | — | — |
| Scale-out (destination) | status → **`completed`** + fleet release | → **`completed`** | → **`completed`** |
| Gate-out (any leg) | `sub_state`: `gate_out_*` only; **`gate_out_at` timestamp** | same | same |
| POD (DM-01) | **Removed** | **Removed** | **Removed** |
| Bill Disbursed (TP) | `completed` → **`bill_disbursed`** | same | same |

**GT-02 on-demand:** Same as planned TOs — **destination scale-out → `completed`** (remove gate-out → `completed` in `record_gate_out_status`).

### 2.3 Target lifecycle at destination (replaces v3.4 §2.7.1)

| Step | Actor | `TransportOrder.status` after step | `sub_state` |
|------|--------|-----------------------------------|-------------|
| Unload complete | LD-01 | `at_destination` (unchanged) | `unloading_completed` |
| Scale-out (destination) | SC-01 | **`completed`** | `scale_out_dest`; clear on `SUB_STATE_RESET` |
| Gate-out (destination) | GT-01 | **`completed`** (unchanged) | `gate_out_destination` |
| Mark Bill Disbursed | Transport Planner | **`bill_disbursed`** | cleared |

```text
at_destination → (destination scale-out) → completed [fleet released]
              → (optional gate-out — timestamp only)
              → (TP Mark Bill Disbursed) → bill_disbursed
```

### 2.4 Fleet release on completion (replaces v3.4 §2.7.5)

| Resource | Mechanism | When available |
|----------|-----------|----------------|
| **Driver** | `try_transition_driver_available_on_to_completion()` inside `apply_to_status_transition` when target is **`completed`** | Immediately after destination scale-out |
| **Vehicle** | `TERMINAL_TO_STATUSES` includes `completed`, `bill_disbursed`; `ACTIVELY_SERVING_TO_STATUSES` **excludes** `delivered_unloaded` | Same moment (FB-011 multi-TO planning) |
| **Helper** | Same as vehicle — assignment blocking via `ACTIVELY_SERVING_TO_STATUSES` | Same moment |

**New helper** (recommended):

```python
def release_fleet_on_to_completion(to, *, actor) -> None:
    """FB-010: explicit fleet release at completed (driver state + audit note)."""
    try_transition_driver_available_on_to_completion(to, actor=actor)
    # Vehicle: no MDM flip required — TO terminal status unblocks assignment
```

Call from `ScaleOutService.record_scale_out` after `apply_to_status_transition(..., COMPLETED)` **or** inside `apply_to_status_transition` when target is `completed` (preferred — single choke point).

### 2.5 SUB_STATE_RESET_ON_STATUS

Add `bill_disbursed` to reset set; keep `delivered_unloaded` for legacy:

```python
SUB_STATE_RESET_ON_STATUS = frozenset({
    TOStatus.DRIVING_TOWARDS_DESTINATION,
    TOStatus.COMPLETED,
    TOStatus.BILL_DISBURSED,
    TOStatus.CLOSED,  # legacy
    TOStatus.CANCELLED,
})
```

---

## 3. Gate-out decoupling (GT-01 amend)

### 3.1 `record_gate_out_status` — timestamp + sub-state only

**Remove** all `apply_to_status_transition` calls from `record_gate_out_status`:

- FG outbound source: **no** `driving_towards_destination` (moved to source scale-out)
- GT-02 single-visit: **no** `completed`
- Destination legs: **sub_state only** (already mostly true)

**Keep:** `GateOut` row creation, `gate_out_at`, `record_yard_sub_state`, activity log, checklist refresh (informational).

### 3.2 Clearance matrix — physical exit only

`validate_guard_matrix` / `compute_clearance` **remain** for gate operators (unload + scale-out + QC before physical exit).

**Remove** any coupling where:

- Gate-out completion is checked in `can_submit_pod` (POD removed entirely)
- `destination_gate_out_done` is a lifecycle prerequisite (delete helper or restrict to legacy admin display)

### 3.3 FG source scale-out owns departure status

Amend `SCALE_OUT_RESULT_TO_STATUS`:

```python
SCALE_OUT_RESULT_TO_STATUS = {
    (FlowLane.FG_OUTBOUND, "source"): TOStatus.DRIVING_TOWARDS_DESTINATION,  # was None
    (FlowLane.FG_OUTBOUND, "destination"): TOStatus.COMPLETED,              # was DELIVERED_UNLOADED
    (FlowLane.FG_INBOUND, "destination"): TOStatus.COMPLETED,
    (FlowLane.RM_INBOUND, "destination"): TOStatus.COMPLETED,
}
```

Update [scaling-operations-sprint4.md](../06-poi-operations/scaling-operations-sprint4.md) §2.2 and [gate-operations-sprint4.md](../06-poi-operations/gate-operations-sprint4.md) §4.5 cross-refs when implementing.

---

## 4. POD removal (POD-01 / DM-01 amend)

### 4.1 Retire runtime paths

| Component | Action |
|-----------|--------|
| `apps/transport/pod_service.py` | `submit_pod` raises `PodRetiredError` or return 410; keep module for migration period |
| `apps/transport/closure/pod_eligibility.py` | Remove `can_submit_pod`, `destination_gate_out_done` from lifecycle; optional legacy read helpers |
| `apps/transport/driver_views.py` | POD POST → 410 Gone |
| `apps/transport/admin_driver.py` | Remove POD upload UI |
| `apps/transport/driver_presenter.py` | Remove `pod_enabled` / `pod_block_reason` |
| `apps/transport/closure/closure_engine.py` | Drop `pod_uploaded` from `CLOSURE_MATRICES` |
| `role_seed_data.py` | `Transport.POD.Submit` — deprecate (optional keep for historical audit) |

### 4.2 Data model

- **Do not** drop `ProofOfDelivery` / `ProofOfDeliveryFile` tables in FB-010.
- **Do not** drop `ClosureChecklist.pod_uploaded` column (avoid migration churn); stop writing/evaluating it.

### 4.3 Driver mobile contract

Document breaking change: `POST …/pod/` returns **410** with body `{ "code": "pod_retired", "detail": "…" }`.

---

## 5. Bill Disbursed (replaces Close TO)

### 5.1 Service

New function in `apps/transport/closure/` (e.g. `disbursement_service.py`):

```python
@transaction.atomic
def mark_bill_disbursed(transport_order, *, actor, notes: str = "") -> TransportOrder:
    to = TransportOrder.objects.select_for_update().get(pk=transport_order.pk)
    if to.status != TOStatus.COMPLETED:
        raise DisbursementBlockedError("TO must be completed before bill disbursement.")
    if to.status == TOStatus.BILL_DISBURSED:
        raise DisbursementBlockedError("Bill already disbursed.")
    maybe_clear_sub_state_on_status(to, new_status=TOStatus.BILL_DISBURSED)
    apply_to_status_transition(
        to, TOStatus.BILL_DISBURSED,
        actor=actor, source_module="closure",
        notes=notes or "Bill disbursed by Transport Planner.",
    )
    return to
```

**Deprecate** `close_transport_order` / `force_close_transport_order` — thin wrappers that call `mark_bill_disbursed` for `completed` rows, or remove admin actions and migrate copy.

### 5.2 Admin & API

| Surface | Change |
|---------|--------|
| TO change form | Replace **Close TO** button with **Mark Bill Disbursed** when `status == completed` |
| `ClosureExceptionsAdmin` | Rename/repurpose to **Completed Awaiting Disbursement** (`status=completed`) |
| `POST …/close` | **410** or alias to `POST …/bill-disburse` |
| `POST …/bill-disburse` | New TP endpoint; permission `Transport.TO.Close` |
| Changelist tabs | Add `bill_disbursed` tab; deprecate `closed` tab label |

### 5.3 Vendor-fleet / reporting

- Trip costing and vendor billing reports: filter terminal TOs on **`bill_disbursed`** instead of `closed` for new data.
- Legacy `closed` rows: reports use `status IN (closed, bill_disbursed)` during transition window.

---

## 6. Yard integration matrix (amended §1.6)

| Module | Action | `status` change | Notes |
|--------|--------|-----------------|-------|
| **SC-01** scale-out (source, FG outbound) | `record_scale_out` | → `driving_towards_destination` | **New** (was sub-state only) |
| **SC-01** scale-out (destination) | `record_scale_out` | → **`completed`** + fleet release | Was `delivered_unloaded` |
| **GT-01** gate-out | `record_gate_out_status` | **None** | Sub-state + `GateOut` timestamp only |
| **DM-01** POD | — | **Retired** | — |
| **POD-01** disbursement | `mark_bill_disbursed` | `completed` → `bill_disbursed` | Replaces close |
| **Vendor** advance-status | — | **Remove** `→ completed` branch | SC-01 owns completion |

---

## 7. Menu structure (amended)

```
Sidebar (Transport Planner)
└── Transport
      └── Transport Orders
            └── TO Detail
                  ├── Timeline Tab              — unchanged
                  ├── Yard Summary (optional)   — ex-closure checklist; informational
                  └── [Mark Bill Disbursed]     — when status = completed

Removed from Driver Mobile backend:
  └── POD upload action
```

---

## 8. Implementation phases

### Phase 1 — Constants & schema

1. Add `TOStatus.BILL_DISBURSED` to `constants.py` and migration `AlterField` on `TransportOrder.status` choices.
2. Amend `SCALE_OUT_RESULT_TO_STATUS`, `TO_STATUS_TRANSITIONS`, `SUB_STATE_RESET_ON_STATUS`.
3. Amend `ACTIVELY_SERVING_TO_STATUSES` — remove `delivered_unloaded`.
4. Update `TERMINAL_TO_STATUSES` in `assignment_availability.py` — add `bill_disbursed`.

**Verify:** unit tests on transition graph validate target statuses.

### Phase 2 — Scale-out completion trigger

1. `ScaleOutService.record_scale_out` — destination legs call `apply_to_status_transition(..., COMPLETED)`.
2. FG source leg — apply `DRIVING_TOWARDS_DESTINATION` when `target_status` set.
3. Ensure `refresh_closure_checklist` still runs (informational).
4. Confirm `apply_to_status_transition` releases driver on `completed`.

**Verify:** integration test — destination scale-out → `completed`, driver `available`, vehicle assignable on another TO (FB-011).

### Phase 3 — Gate-out decoupling

1. Strip status transitions from `record_gate_out_status`.
2. Remove GT-02 gate-out → `completed` path.
3. Keep `validate_guard_matrix` for physical exit only.
4. Update gate admin copy (remove “gate-out allowed when TO is At Source” status messaging where misleading).

**Verify:** gate-out after scale-out does not change `status`; gate-out before scale-out still blocked for operators.

### Phase 4 — POD retirement

1. Disable `submit_pod` and driver POD endpoint (410).
2. Remove POD UI from driver admin / presenter.
3. Strip `pod_uploaded` from closure evaluation.
4. Delete or skip tests that assert POD → completed path.

**Verify:** POD POST returns 410; no code path requires POD for completion.

### Phase 5 — Bill Disbursed

1. Implement `mark_bill_disbursed`.
2. Replace admin Close TO with Mark Bill Disbursed.
3. Add API route `POST …/bill-disburse`.
4. Deprecate `close_transport_order` (wrapper or remove).
5. Update badges, tabs, vendor portal status labels.

**Verify:** `completed` → `bill_disbursed` via admin; permission gate; audit log row.

### Phase 6 — Vendor & satellite cleanup

1. Remove `VendorFleetTOLifecycleService` `→ COMPLETED` branch.
2. Update `VENDOR_COMPLETION_ELIGIBLE_STATUSES` / portal copy.
3. Update `templates/admin/transport/transportorder/change_form.html` closure panel.
4. GPS/dashboard serializers: expose `bill_disbursed`; document `closed` as legacy.

### Phase 7 — Data migration (optional)

1. Backfill: open `delivered_unloaded` TOs with destination scale-out done → `completed` + fleet release.
2. Map recent `closed` → `bill_disbursed` **only if** product confirms (otherwise leave legacy).

**Verify:** migration dry-run on staging snapshot.

---

## 9. Code touchpoint summary

```
apps/transport/constants.py              BILL_DISBURSED; SCALE_OUT_RESULT; transitions; SUB_STATE_RESET
apps/transport/migrations/               new choice migration
apps/transport/lifecycle/transition_service.py   fleet release on completed (verify choke point)
apps/transport/assignment_availability.py  TERMINAL + ACTIVELY_SERVING sets
apps/transport/closure/closure_engine.py   remove pod from matrix; deprecate close_transport_order
apps/transport/closure/disbursement_service.py   NEW mark_bill_disbursed
apps/transport/closure/pod_eligibility.py  retire can_submit_pod
apps/transport/pod_service.py              retire submit_pod
apps/transport/admin_closure.py            Bill Disbursed actions + changelist
apps/transport/admin.py                    close_to_view → bill_disburse_view
apps/transport/admin_driver.py             remove POD UI
apps/transport/driver_presenter.py         remove POD flags
apps/transport/driver_views.py             410 POD endpoint
apps/transport/views.py                    bill-disburse API
apps/transport/urls.py                     route
apps/operations/scaling/services.py        ScaleOutService destination → completed
apps/operations/gate/gate_services.py      record_gate_out_status — no status bumps
apps/operations/gate/clearance.py          decouple from completion (comments only if logic unchanged)
apps/operations/gate/admin.py              help text updates
apps/vendors/services.py                   remove vendor advance → completed
templates/admin/transport/transportorder/change_form.html
tests/unit/test_transport/test_scale_out_completion.py          NEW
tests/unit/test_transport/test_bill_disbursement.py             NEW
tests/integration/test_transport_lifecycle_fb010.py             NEW (suggested)
# tests/e2e/                                                    OUT OF SCOPE
```

**Cross-module doc updates (same PR or follow-up):**

- `gate-operations-sprint4.md` §4.5
- `scaling-operations-sprint4.md` §2.2
- `feedback-resolution.md` — set FB-010 Status → Resolved when shipped

---

## 10. Test plan

**Scope:** Unit and integration tests only. **Do not** add or amend E2E / Playwright for FB-010.

| Area | Cases |
|------|-------|
| Destination scale-out | FG outbound / FG inbound / RM inbound → `completed` |
| Fleet release | After dest scale-out: driver `available`; vehicle not in `ACTIVELY_SERVING` |
| FB-011 interaction | Vehicle on TO-A completes at scale-out while still at yard; assignable to TO-B |
| Source scale-out FG | `at_source` → `driving_towards_destination` |
| Gate-out | Does not change `status` (source, dest, GT-02) |
| Gate-out clearance | Still blocks operator when scale-out pending |
| POD | `submit_pod` / driver POST → 410 or stable error; no path to `completed` via POD |
| Bill Disbursed | Only from `completed`; idempotent guard; permission |
| Legacy `delivered_unloaded` | Existing rows can still transition to `completed` if needed |
| Vendor advance | `advance → completed` removed or no-op with error |
| Closure checklist | `pod_uploaded` not evaluated; disbursement not blocked by gate-out flag |
| Regression | Trip start, gate-in, load/unload, QC unchanged |

---

## 11. Sub-tasks (FB-010)

| ID | Scope | Phase |
|----|-------|-------|
| FB-010-1 | Schema: `bill_disbursed` choice + constant graph amendments | 1 |
| FB-010-2 | `ScaleOutService` destination → `completed` + FG source departure | 2 |
| FB-010-3 | Fleet release verified at `completed` (driver + assignment sets) | 2 |
| FB-010-4 | Gate-out decoupling (`record_gate_out_status`, GT-02) | 3 |
| FB-010-5 | POD retirement (service, API, admin, closure matrix) | 4 |
| FB-010-6 | `mark_bill_disbursed` + admin + API | 5 |
| FB-010-7 | Vendor advance-status cleanup + portal labels | 6 |
| FB-010-8 | Unit/integration tests | 2–6 |
| FB-010-9 | Optional data backfill migration | 7 |
| FB-010-10 | Amend gate + scaling module specs (docs) | post-merge |

---

## 12. Open questions / follow-ups

| # | Question | Recommendation |
|---|----------|----------------|
| 1 | Rename `ClosureChecklist` → `DisbursementChecklist` | **Defer** — cosmetic; optional follow-up |
| 2 | Auto-disburse after N days | **Out of scope** — manual TP action only |
| 3 | Vendor invoice integration | **Separate** reporting story; use `bill_disbursed` as filter |
| 4 | Delete `ProofOfDelivery` table | **Defer** — retain historical artifacts |
| 5 | Permission rename `Transport.TO.Close` → `BillDisburse` | **Defer** — reuse Close permission |
| 6 | STK-01 stock still on scale-out | **Unchanged in FB-010** — FB-012 moves trigger later |

---

## 13. Related documentation

- **[FB-010 Feedback Tracker](../../03-backlog/sprints/sprint-6/feedback-resolution.md#fb-010--to-completion-decoupled-from-gate-outpod-completed-triggered-by-destination-scale-out-new-bill-disbursed-terminal-status)**
- **[Transport Lifecycle v1 (Sprint 4 baseline)](./transport-lifecycle-pod-sprint4.md)** — superseded §§ listed in front matter
- **[Transport Order Management v2 (FB-008)](./transport-order-management-v2.md)** — upstream assignment; execution tail amended here
- **[Vehicle / Driver Multi-TO Exclusivity v2 (FB-011)](./vehicle-driver-multi-to-exclusivity-v2.md)** — `ACTIVELY_SERVING` must align with completion at scale-out
- **[Gate Operations Sprint 4](../06-poi-operations/gate-operations-sprint4.md)** — §4.5 yard chain amend required
- **[Scaling Operations Sprint 4](../06-poi-operations/scaling-operations-sprint4.md)** — §2.2 result status amend required
- **Sprint 4 stories:** [TLS-01](../../03-backlog/sprints/sprint-4/07-visibility-lifecycle-pod/TLS-01-to-lifecycle-execution-yard-closure.md), [POD-01](../../03-backlog/sprints/sprint-4/07-visibility-lifecycle-pod/POD-01-to-closure-pod-linkage.md)

---

## 14. Implementation TODOs

- [ ] **FB-010-1** — `bill_disbursed` enum + migration; amend `SCALE_OUT_RESULT_TO_STATUS`, transitions, `ACTIVELY_SERVING` / `TERMINAL` sets
- [ ] **FB-010-2** — `ScaleOutService`: destination → `completed`; FG source → `driving_towards_destination`
- [ ] **FB-010-3** — Fleet release at `completed` (driver + assignment blocking)
- [ ] **FB-010-4** — Gate-out: remove all `apply_to_status_transition` from `record_gate_out_status`
- [ ] **FB-010-5** — Retire POD submit path (API, admin, `can_submit_pod`, closure matrix)
- [ ] **FB-010-6** — `mark_bill_disbursed` service + TP admin action + API
- [ ] **FB-010-7** — Vendor `advance → completed` removal; UI/badge/tab updates
- [ ] **FB-010-8** — Unit/integration tests (no E2E)
- [ ] **FB-010-9** — Optional backfill for in-flight `delivered_unloaded` TOs
- [ ] **FB-010-10** — Update gate + scaling spec cross-refs; mark FB-010 Resolved in feedback tracker on release

---

**Last Updated**: 2026-07-06  
**Version**: 2.0  
**Baseline**: [transport-lifecycle-pod-sprint4.md](./transport-lifecycle-pod-sprint4.md) v3.4
