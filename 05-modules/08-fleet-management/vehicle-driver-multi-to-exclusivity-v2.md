---
module: 08-fleet-management
specification: Vehicle, Driver & Helper Multi-TO Planning with Single-Active-TO Exclusivity (Sprint 6 — FB-011)
version: 2.1
phase: Phase 1
sprint: Sprint 6 (FB-011)
last_updated: 2026-07-06
changelog: "v2.1 — Bring Helpers into scope: same actively-serving relaxation and exclusivity gate as vehicle/driver (client confirmed). v2.0 — Initial implementation plan for FB-011: relax vehicle/driver conflict check to allow multi-TO planning; add single-active-TO exclusivity gate at Driver Supervisor dispatch release."
related_stories: TO-02 (trip-management — vehicle/driver/helper conflict checks), DS-01 (vehicle/driver handover checklist)
feedback_items: FB-011
supersedes: ../05-transport/trip-management.md §4.1 (vehicle assignment availability checks), §4.2 (driver assignment availability checks), §4.3 (helper assignment availability checks)
baseline_spec: ../05-transport/trip-management.md, vehicle-management.md, driver-management.md
feedback_tracker: ../../03-backlog/sprints/sprint-6/feedback-resolution/05-transport-orders.md#fb-011--vehicle-multi-to-planning-with-single-active-to-exclusivity-driver-supervisor-inspectskip-inspect-gates-dispatch-readiness
jira_epic: DFS-040
---

# Vehicle, Driver & Helper Multi-TO Planning with Single-Active-TO Exclusivity (FB-011)

## Overview

This document is the **Sprint 6 backend implementation plan** for [FB-011](../../03-backlog/sprints/sprint-6/feedback-resolution/05-transport-orders.md#fb-011--vehicle-multi-to-planning-with-single-active-to-exclusivity-driver-supervisor-inspectskip-inspect-gates-dispatch-readiness). It amends the baseline [Trip Management](../05-transport/trip-management.md) assignment rules (§4.1–4.3).

**Problem (client feedback — 2026-07-03):** Today, once a vehicle, driver, or helper is linked to **any** non-terminal Transport Order (even one still being planned — `created` / `under_planning` / `assigned`), the system blocks that resource from being assigned to **any other** TO until the first one is cancelled, completed, or closed. This prevents Transport Planners from queueing a vehicle/driver/helper against multiple future TOs ahead of time, which is normal operational practice — a resource should be plannable against several TOs concurrently, as long as it is only **actually out serving** one of them at any given moment.

**Solution (FB-011 scope):**

1. **Relax** the vehicle/driver/helper conflict check at Transport Planner assignment time (TO creation + `assign_vehicle` / `assign_driver` / `assign_helpers`) — remove the "linked to any non-terminal TO" block entirely. Planning-stage queueing across multiple TOs is unrestricted.
2. **Introduce** a new, narrower **"actively serving" exclusivity gate** at the point the Driver Supervisor releases a TO for dispatch (inspect / skip-inspect → `ready_for_dispatch`). A vehicle, driver, or helper already actively serving another TO cannot be released for a second one.
3. **Leave unchanged**: vehicle `under_maintenance` block, driver `on_leave` / inactive / expired-license blocks.

**Primary module path:** `apps/transport/` (assignment + availability rules), `apps/fleet_supervisor/` (dispatch-release gate)
**Cross-module touch paths:** `apps/transport/admin.py` (Django admin TO form + dropdowns), `apps/transport/views.py` (availability picker APIs)

**Out of scope (separate items):** A new Driver Supervisor vehicle-reselection UI (Driver Supervisor continues to inspect whichever vehicle the Planner already set on the TO — no new picker); leave-registration guard narrowing (`_guard_leave_against_active_to` keeps today's broader "linked to any TO" definition — not part of this feedback item).

---

## 0. Scope boundary

| In scope (FB-011) | Out of scope / separate items |
|--------------------|-------------------------------|
| Remove vehicle/driver/helper "linked to any non-terminal TO" block at Planner assignment (creation + `assign_vehicle`/`assign_driver`/`assign_helpers`) | New Driver Supervisor vehicle-picker/override UI — supervisor still inspects `to.vehicle` as set by the Planner |
| New "actively serving" exclusivity gate in `dispatch_to_after_ready()` for vehicle, driver, **and each assigned helper** (covers both skip-inspection and complete-inspection paths) | `_guard_leave_against_active_to` narrowing — keeps broad "linked to any TO" definition |
| Admin dropdowns (`VehicleAvailabilityView`, `DriverAvailabilityView`, `HelperAvailabilityView`, admin FK querysets) show all non-maintenance / non-on-leave resources regardless of other TO linkage | Own-fleet vehicle capacity advisory (`own-fleet-vehicle-capacity-validation.md`) — unrelated, unchanged |
| Tighten `execution_fleet_availability.validate_for_driver_execution` to reuse the same "actively serving" status set (cleanup — removes a stale `.exclude(status=ASSIGNED)` workaround) | E2E / Playwright — not required for this item unless separately requested |
| Unit test updates for relaxed + new-gate behaviour (vehicle, driver, helper) | |

### Locked product decisions (implementation defaults)

| Topic | Decision | Rationale |
|-------|----------|-----------|
| "Actively serving" status window | `ready_for_dispatch` → `driving_towards_source` → `at_source` → `loaded_pickup_completed` → `driving_towards_destination` → `at_destination` → `delivered_unloaded` → `in_progress` (**excludes** `completed`) | Resource frees up the moment the trip is completed, not only at `closed`. Matches the intent that a completed TO no longer "holds" the resource. Applies identically to vehicle, driver, and helper. |
| Planning-stage assignment (`created` / `under_planning` / `assigned`) | **No conflict check at all** — a vehicle/driver/helper may be queued on any number of TOs in these statuses | Client wants unrestricted forward planning; exclusivity only matters once a TO is about to be physically dispatched. |
| Where the new exclusivity gate lives | Single choke point: `fleet_supervisor.services.dispatch_to_after_ready()` | Both `supervisor_dispatch_intent(intent="skip_inspection")` and `complete_inspection()` call this one function — one change covers both Driver Supervisor flows, for all three resource types. |
| Driver Supervisor vehicle selection | **No change** — supervisor inspects `to.vehicle`, the vehicle the Planner already assigned | FB-011 feedback wording ("selects vehicle number") describes picking which TO/vehicle row to act on from the queue, not a new reassignment capability. |
| Helpers | **Same treatment as vehicle/driver** (client-confirmed) — a helper may be queued/planned against multiple TOs; exclusivity enforced only at dispatch release, scoped to "actively serving" | Originally deferred as out of scope; client confirmed helpers should follow the identical relaxation, since a helper is a physical person tied to one truck at a time just like the driver. |
| Concurrency safety | Lock competing TO rows on `vehicle_id` / `driver_id` / `helpers` inside the `dispatch_to_after_ready()` transaction | Prevents two Driver Supervisors releasing two TOs on the same vehicle/driver/helper at the same instant from both passing the check. |

---

## 1. Current vs expected behaviour

| Aspect | Current (pre-FB-011 / codebase) | Expected (v2.1 / FB-011) |
|--------|----------------------------------|----------------------------|
| Vehicle assignment across TOs (Planner) | `validate_vehicle_available_for_assignment` blocks if vehicle has **any** non-terminal TO (`vehicle_is_assigned_elsewhere`) | Block removed — only `under_maintenance` check remains |
| Driver assignment across TOs (Planner) | `TDOAssignmentService.assign_driver` blocks if driver has **any** non-terminal TO (`driver_is_assigned_elsewhere`) | Block removed — inactive / on-leave / expired-license checks remain |
| Admin TO form (`clean_vehicle` / `clean_driver`) | Same broad conflict check, hard `ValidationError` | Same relaxation — conflict check removed, maintenance/on-leave checks remain |
| Availability pickers (`GET /vehicles/available`, `GET /drivers/available`) | Excludes vehicles/drivers linked to **any** non-terminal TO | Excludes only maintenance vehicles / on-leave / expired-license / on-execution drivers — no TO-linkage exclusion |
| Admin FK dropdowns (batch-create form, TO change form, capacity-fit queryset) | Same broad exclusion via `vehicle_ids_on_active_transport_orders` / `driver_ids_on_active_transport_orders` | Exclusion removed from these four call sites |
| Dispatch release (`dispatch_to_after_ready`) | **No vehicle/driver conflict check at all** | **New gate**: blocks `assigned → ready_for_dispatch` if vehicle or driver is already "actively serving" another TO |
| Execution-time re-check (`validate_for_driver_execution`) | Uses `ACTIVE_TO_STATUSES` (includes `assigned`) with a `.exclude(status=ASSIGNED)` workaround | Uses new `ACTIVELY_SERVING_TO_STATUSES` directly — workaround removed |
| Helper assignment across TOs (Planner) | `TDOAssignmentService.assign_helpers` blocks per-helper if helper has **any** TO in `ACTIVE_TO_STATUSES` (blocks from `assigned` onward) | Block removed at planning stage — helper may be queued on multiple TOs |
| Helper availability picker (`GET /helpers/available`) | Excludes helpers linked to any TO in `ACTIVE_TO_STATUSES` | Excludes only non-`available` helpers — no TO-linkage exclusion |
| Helper dispatch release | No exclusivity check today | **New gate**: `dispatch_to_after_ready` blocks release if any assigned helper is already "actively serving" another TO |

---

## 2. Data model changes

**None.** No new fields, no migration. This is purely a query/validation-logic change against the existing `TransportOrder.status`, `TransportOrder.vehicle`, `TransportOrder.driver`, and `TransportOrder.helpers` (M2M) fields.

---

## 3. Domain logic changes

### 3.1 `apps/transport/assignment_availability.py` — new narrow helpers

Add alongside the existing broad helpers (which remain, unchanged, for their current callers — see §3.5):

```python
ACTIVELY_SERVING_TO_STATUSES = (
    TOStatus.READY_FOR_DISPATCH,
    TOStatus.DRIVING_TOWARDS_SOURCE,
    TOStatus.AT_SOURCE,
    TOStatus.LOADED_PICKUP_COMPLETED,
    TOStatus.DRIVING_TOWARDS_DESTINATION,
    TOStatus.AT_DESTINATION,
    TOStatus.DELIVERED_UNLOADED,
    TOStatus.IN_PROGRESS,
)


def _actively_serving_transport_orders(*, exclude_to_pk=None):
    qs = TransportOrder.objects.filter(status__in=ACTIVELY_SERVING_TO_STATUSES)
    if exclude_to_pk:
        qs = qs.exclude(pk=exclude_to_pk)
    return qs


def vehicle_is_actively_serving_elsewhere(vehicle_id, *, exclude_to_pk=None) -> bool:
    return _actively_serving_transport_orders(exclude_to_pk=exclude_to_pk).filter(
        vehicle_id=vehicle_id
    ).exists()


def driver_is_actively_serving_elsewhere(driver_id, *, exclude_to_pk=None) -> bool:
    return _actively_serving_transport_orders(exclude_to_pk=exclude_to_pk).filter(
        driver_id=driver_id
    ).exists()


def helper_is_actively_serving_elsewhere(helper_id, *, exclude_to_pk=None) -> bool:
    return _actively_serving_transport_orders(exclude_to_pk=exclude_to_pk).filter(
        helpers__id=helper_id
    ).exists()
```

`ready_for_dispatch` is deliberately **included** in the actively-serving window — reaching that status is the Driver Supervisor's "commit" action per FB-011 point 3, even before the driver physically starts driving. `helper_is_actively_serving_elsewhere` uses the M2M `helpers` relation (a TO can have multiple helpers; a helper's exclusivity is evaluated per-helper, same as vehicle/driver).

### 3.2 Remove planning-stage conflict checks

| File | Function | Change |
|------|----------|--------|
| `apps/transport/own_fleet_validation.py` | `validate_vehicle_available_for_assignment` | Remove the `vehicle_is_assigned_elsewhere` block; keep `UNDER_MAINTENANCE` check |
| `apps/transport/services.py` | `TDOAssignmentService.assign_driver` | Remove the `driver_is_assigned_elsewhere` block; keep inactive / on-leave / license-expiry checks |
| `apps/transport/admin.py` | `TransportOrderAdminForm.clean_vehicle` | Remove the `vehicle_is_assigned_elsewhere` check; keep maintenance check |
| `apps/transport/admin.py` | `TransportOrderAdminForm.clean_driver` | Remove the `driver_is_assigned_elsewhere` check; keep inactive / on-leave checks |
| `apps/transport/services.py` | `TDOAssignmentService.assign_helpers` | Remove the per-helper `ACTIVE_TO_STATUSES` conflict check entirely — no maintenance/leave-equivalent check exists for helpers, so this method has no remaining validation beyond "helper exists" |

### 3.3 Availability pickers — drop TO-linkage exclusion

| File | Symbol | Change |
|------|--------|--------|
| `apps/transport/views.py` | `VehicleAvailabilityView.get` | Drop `.exclude(pk__in=vehicle_ids_on_active_transport_orders())` |
| `apps/transport/views.py` | `DriverAvailabilityView.get` | Drop `.exclude(pk__in=driver_ids_on_active_transport_orders())` |
| `apps/transport/admin.py` | Batch-create form `vehicle_qs` (~L868–870) | Drop `.exclude(pk__in=vehicle_ids_on_active_transport_orders())` |
| `apps/transport/admin.py` | `_capacity_fit_vehicle_queryset` (~L1102–1104) | Drop `.exclude(pk__in=vehicle_ids_on_active_transport_orders(exclude_to_pk=object_id))` |
| `apps/transport/admin.py` | `formfield_for_foreignkey` — `vehicle` (~L1300–1302) | Drop the same exclusion |
| `apps/transport/admin.py` | `formfield_for_foreignkey` — `driver` (~L1320–1323) | Drop `.exclude(pk__in=driver_ids_on_active_transport_orders(exclude_to_pk=object_id))` |
| `apps/transport/views.py` | `HelperAvailabilityView.get` | Drop the `active_helper_ids` computation (`TransportOrder.objects.filter(status__in=ACTIVE_TO_STATUSES).values_list("helpers__id", ...)`) and its `.exclude(pk__in=...)` — keep only the `status="available"` filter |

### 3.4 New exclusivity gate — `apps/fleet_supervisor/services.py::dispatch_to_after_ready`

Insert after the existing own-fleet vehicle/driver presence checks, before the status flip to `READY_FOR_DISPATCH`:

```python
if to.fleet_type == FleetType.OWN:
    from apps.transport.assignment_availability import (
        driver_is_actively_serving_elsewhere,
        helper_is_actively_serving_elsewhere,
        vehicle_is_actively_serving_elsewhere,
    )

    if to.vehicle_id and vehicle_is_actively_serving_elsewhere(to.vehicle_id, exclude_to_pk=to.pk):
        raise BusinessRuleError(
            f"Vehicle {to.vehicle} is already actively serving another Transport Order."
        )
    if to.driver_id and driver_is_actively_serving_elsewhere(to.driver_id, exclude_to_pk=to.pk):
        raise BusinessRuleError(
            f"Driver {to.driver} is already actively serving another Transport Order."
        )
    for helper in to.helpers.all():
        if helper_is_actively_serving_elsewhere(helper.pk, exclude_to_pk=to.pk):
            raise BusinessRuleError(
                f"Helper {helper} is already actively serving another Transport Order."
            )
```

**Concurrency:** `dispatch_to_after_ready` already opens with `TransportOrder.objects.select_for_update(of=("self",))` on the target TO only. To close the race between two concurrent dispatch-release calls sharing a vehicle, driver, or helper, additionally lock the competing rows before the check, e.g. `TransportOrder.objects.select_for_update().filter(status__in=ACTIVELY_SERVING_TO_STATUSES, vehicle_id=to.vehicle_id).exclude(pk=to.pk)` (vehicle/driver equivalents, plus a `helpers__in=...` variant for the M2M), inside the same atomic transaction.

**Both Driver Supervisor flows are covered automatically:**

- `supervisor_dispatch_intent(intent="skip_inspection")` calls `dispatch_to_after_ready` directly.
- `complete_inspection()` (checklist path) calls `dispatch_to_after_ready` at the end.

**Early, non-authoritative check at `start_inspection` (confirmed in scope):** `supervisor_dispatch_intent`'s `start_inspection` branch should also call `vehicle_is_actively_serving_elsewhere` / `driver_is_actively_serving_elsewhere` / `helper_is_actively_serving_elsewhere` (for each assigned helper) **before** creating the `VehicleInspection` row, and raise the same `BusinessRuleError` if any is already actively serving another TO. This is a duplicate of the authoritative check in `dispatch_to_after_ready` (still required there — inspection can be skipped, and completion happens later, so the release-time check remains the real gate), but it saves the Driver Supervisor from filling out a full checklist only to be rejected at `complete_inspection` time. Message text should be identical to the release-time error so the UX is consistent regardless of which path surfaces it first.

### 3.5 What stays broad, on purpose

The following existing functions are **not modified** by this change — they serve different semantics than the new "actively serving" concept and must keep their current (broad) definition:

| Function | Caller | Why it must stay broad |
|----------|--------|--------------------------|
| `vehicle_is_assigned_elsewhere` / `driver_is_assigned_elsewhere` | `try_transition_driver_available_on_unassign`, `_guard_leave_against_active_to`, `driver_state_reconciliation.py` | These need "is this driver/vehicle linked to **any** non-terminal TO at all" (including queued ones) to decide whether a driver should revert to `AVAILABLE` or whether leave can be registered — narrowing these would let a driver flip to `AVAILABLE` while still queued on another TO, or allow leave registration that silently orphans a queued TO. |
| `vehicle_ids_on_active_transport_orders` / `driver_ids_on_active_transport_orders` | Removed from the 6 call sites in §3.3; **not deleted** as functions since deleting would be an unrelated cleanup beyond this feedback item's scope | Kept for now in case any other caller needs the broad definition later; if a repo-wide grep after implementation shows zero remaining callers, removing the now-dead functions is a reasonable follow-up cleanup (flag to reviewer, don't do silently). |

Helpers have **no equivalent broad-check caller** — there's no helper-state-machine or leave-guard function today, so removing the planning-stage check in `assign_helpers` and the picker exclusion in `HelperAvailabilityView` (§3.2/§3.3) leaves nothing else referencing the old `ACTIVE_TO_STATUSES`-based helper conflict logic.

### 3.6 Cleanup — `apps/transport/execution_fleet_availability.py::validate_for_driver_execution`

Currently uses `ACTIVE_TO_STATUSES` (includes `assigned`) plus a `.exclude(status=TOStatus.ASSIGNED)` workaround to approximate "actively serving." Since §3.4 now makes it structurally impossible for two TOs to both reach `ready_for_dispatch`+ on the same vehicle, this becomes a defense-in-depth check. Simplify it to filter on `ACTIVELY_SERVING_TO_STATUSES` directly and drop the workaround exclude, for consistency with the new single source of truth.

---

## 4. Status lifecycle (own fleet, unaffected by FB-011)

FB-011 does not change any status names or transitions — it only changes **which vehicle/driver/helper conflict checks fire at which transition**.

```
CREATED / UNDER_PLANNING
  → ASSIGNED            when vehicle_id AND driver_id set (Planner) — NO conflict check (FB-011)
  → READY_FOR_DISPATCH  Driver Supervisor inspect / skip-inspect — NEW: actively-serving conflict check (FB-011)
  → DRIVING_TOWARDS_SOURCE / DRIVING_TOWARDS_DESTINATION   Driver starts trip
  → … execution statuses … → COMPLETED → CLOSED
```

| Transition | Guard before FB-011 | Guard after FB-011 |
|------------|----------------------|----------------------|
| → `ASSIGNED` | Vehicle/driver must have **no** non-terminal TO elsewhere; helper (`assign_helpers`) same, checked from `assigned` onward | Vehicle/driver/helper may have **any number** of other non-terminal TOs |
| → `READY_FOR_DISPATCH` | No vehicle/driver conflict check; no helper conflict check | Vehicle/driver/**each helper** must **not** be actively serving another TO |

---

## 5. Files touched

| File | Change |
|------|--------|
| `apps/transport/assignment_availability.py` | **Add** `ACTIVELY_SERVING_TO_STATUSES`, `vehicle_is_actively_serving_elsewhere`, `driver_is_actively_serving_elsewhere`, `helper_is_actively_serving_elsewhere` |
| `apps/transport/own_fleet_validation.py` | Remove vehicle conflict check from `validate_vehicle_available_for_assignment` |
| `apps/transport/services.py` | Remove driver conflict check from `TDOAssignmentService.assign_driver`; remove per-helper conflict check from `TDOAssignmentService.assign_helpers` |
| `apps/transport/admin.py` | Remove conflict checks from `clean_vehicle`/`clean_driver`; drop TO-linkage exclusion from 3 dropdown querysets |
| `apps/transport/views.py` | Drop TO-linkage exclusion from `VehicleAvailabilityView`, `DriverAvailabilityView`, `HelperAvailabilityView` |
| `apps/transport/execution_fleet_availability.py` | Simplify `validate_for_driver_execution` to use `ACTIVELY_SERVING_TO_STATUSES` |
| `apps/fleet_supervisor/services.py` | **New** exclusivity gate in `dispatch_to_after_ready`; early duplicate check in `supervisor_dispatch_intent`'s `start_inspection` branch |
| `tests/unit/test_transport/test_assignment_availability.py` | Add tests for new narrow helpers |
| `tests/unit/test_transport/test_admin.py` | Update conflict-check tests to reflect relaxation |
| `tests/unit/test_fleet_supervisor/test_services.py` (or equivalent) | New tests for `dispatch_to_after_ready` exclusivity gate |

**No migrations.**

---

## 6. Implementation phases

### Phase 1 — Domain helpers

1. Add `ACTIVELY_SERVING_TO_STATUSES` + three new narrow helper functions (vehicle, driver, helper) in `assignment_availability.py`.
2. Unit tests for the new helpers (mirror existing broad-helper test style; helper test covers the M2M `helpers__id` lookup).

**Verify:** `pytest tests/unit/test_transport/test_assignment_availability.py`

### Phase 2 — Relax planning-stage checks

1. Remove conflict checks from `own_fleet_validation.py`, `services.py::assign_driver`, `services.py::assign_helpers`, admin form `clean_vehicle`/`clean_driver`.
2. Remove TO-linkage exclusions from the 6 vehicle/driver dropdown/picker call sites (§3.3) and the helper exclusion in `HelperAvailabilityView`.
3. Update existing tests that currently assert these blocks raise — flip to "no longer blocks" + add multi-TO queueing regression tests (vehicle, driver, helper).

**Verify:** A vehicle/driver/helper can be assigned to two `created`/`assigned` TOs simultaneously via API, admin, and batch-create.

### Phase 3 — New exclusivity gate

1. Add the actively-serving check (vehicle, driver, and a loop over `to.helpers.all()`) + row locking to `dispatch_to_after_ready`.
2. Add the same (non-authoritative) check to `supervisor_dispatch_intent`'s `start_inspection` branch, before creating the `VehicleInspection` row.
3. New tests: dispatch succeeds when vehicle/driver/helper free; blocked (409/`BusinessRuleError`) when any is already `ready_for_dispatch`+ elsewhere; succeeds again once the other TO reaches `completed`.
4. New test: `start_inspection` itself rejects upfront (no `VehicleInspection` row created) when vehicle/driver/helper already actively serving elsewhere.
5. Regression test: both `skip_inspection` and `complete_inspection` release paths are blocked identically at `dispatch_to_after_ready`, for all three resource types.

**Verify:** Two TOs queued (`assigned`) sharing the same vehicle, driver, or helper — first dispatch release succeeds, second is rejected until the first TO completes.

### Phase 4 — Cleanup

1. Simplify `execution_fleet_availability.validate_for_driver_execution` to use `ACTIVELY_SERVING_TO_STATUSES`.
2. Grep for any remaining callers of `vehicle_ids_on_active_transport_orders` / `driver_ids_on_active_transport_orders`; if none remain outside tests, flag as a candidate for a follow-up dead-code removal (do not delete silently in this change).

**Verify:** `pytest tests/unit/test_transport/ tests/unit/test_fleet_supervisor/` full pass.

---

## 7. Test plan

| Area | Cases |
|------|-------|
| Planning-stage assignment | Same vehicle assigned to 2+ TOs in `created`/`assigned` — no error (API, admin, batch-create) |
| Planning-stage assignment | Same driver assigned to 2+ TOs in `created`/`assigned` — no error |
| Planning-stage assignment | Same helper assigned to 2+ TOs in `created`/`assigned` — no error |
| Planning-stage assignment | Vehicle under maintenance still blocked (regression) |
| Planning-stage assignment | Driver on leave / inactive / expired license still blocked (regression) |
| Availability pickers | `GET /vehicles/available` includes a vehicle already queued (non-serving) on another TO |
| Availability pickers | `GET /drivers/available` includes a driver already queued (non-serving) on another TO |
| Availability pickers | `GET /helpers/available` includes a helper already queued (non-serving) on another TO |
| Dispatch release | TO-A vehicle/driver `ready_for_dispatch` → dispatch release of TO-B (same vehicle, still `assigned`) → `BusinessRuleError` |
| Dispatch release | Same as above, but TO-A driver only (vehicle different) → blocked on driver only |
| Dispatch release | TO-A has a shared helper already `ready_for_dispatch`+ → TO-B dispatch release blocked on that helper |
| Dispatch release | TO-A reaches `completed` → TO-B dispatch release now succeeds (vehicle, driver, and helper cases) |
| Dispatch release | Reassigning the **same** TO's vehicle/driver/helper at dispatch time (`exclude_to_pk`) never self-blocks |
| Dispatch release | Both `skip_inspection` and `complete_inspection` paths blocked identically, for all three resource types |
| `start_inspection` early check | Vehicle/driver/helper already actively serving elsewhere → `BusinessRuleError` raised, no `VehicleInspection` row created |
| `start_inspection` early check | Vehicle/driver/helper free → inspection created normally (regression) |
| Concurrency | Two near-simultaneous dispatch releases on TOs sharing a vehicle, driver, or helper — only one succeeds |
| Execution re-check | `validate_for_driver_execution` still catches a stale conflict using the new status set |
| Regression | `_guard_leave_against_active_to` unchanged (still blocks leave on any non-terminal TO) |

---

## 8. Open questions / follow-ups

| # | Question | Recommendation |
|---|----------|-----------------|
| 1 | Should the Driver Supervisor queue/changelist proactively hide or badge TOs that would fail the new gate (e.g. vehicle/helper already `ready_for_dispatch` elsewhere)? | Defer — optional UX polish |
| 2 | Should `vehicle_ids_on_active_transport_orders` / `driver_ids_on_active_transport_orders` be deleted once unused? | Defer to a follow-up cleanup PR after confirming no remaining callers |
| 3 | Should `_guard_leave_against_active_to` narrow to "actively serving" too (allow leave registration for a driver only queued, not serving)? | Not in FB-011 scope — flagged, not changing |

**Resolved:**

- "Should `start_inspection` get an early non-authoritative warning?" — **Yes, confirmed in scope** (see §3.4). Implemented as a duplicate check before `VehicleInspection` creation; `dispatch_to_after_ready` remains the authoritative gate.
- "Should the Helper conflict rule get the same actively-serving relaxation?" — **Yes, confirmed in scope.** A helper may be assigned/queued against multiple TOs during planning; exclusivity is enforced only at dispatch release (`dispatch_to_after_ready` + `start_inspection` early check), identical to vehicle and driver treatment (§1, §3.1–3.4).

---

## 9. Related documentation

- **[FB-011 Feedback Tracker](../../03-backlog/sprints/sprint-6/feedback-resolution/05-transport-orders.md#fb-011--vehicle-multi-to-planning-with-single-active-to-exclusivity-driver-supervisor-inspectskip-inspect-gates-dispatch-readiness)**
- **[Trip Management (baseline)](../05-transport/trip-management.md)** — §4.1/4.2/4.3 vehicle/driver/helper assignment availability checks (amended by this doc)
- **[Transport Order Management v2 (FB-008)](../05-transport/transport-order-management-v2.md)** — establishes Transport Planner as the own-fleet assignment owner that FB-011's relaxed checks apply to
- **[DS-01 — Vehicle Licence, Health & Handover Checklists](../../03-backlog/sprints/sprint-5/01-driver-supervisor/DS-01-vehicle-licence-health-handover-checklists.md)** — inspect/skip-inspect flow that now hosts the new exclusivity gate
- **[Vehicle Management](vehicle-management.md)**, **[Driver Management](driver-management.md)** — module baseline (this doc is Sprint 6 amendment, module `08-fleet-management`)

---

## 10. Implementation TODOs

- [ ] **FB-011-1** — `assignment_availability.py`: add `ACTIVELY_SERVING_TO_STATUSES` + `vehicle_is_actively_serving_elsewhere` / `driver_is_actively_serving_elsewhere` / `helper_is_actively_serving_elsewhere` + unit tests
- [ ] **FB-011-2** — Remove planning-stage conflict checks: `own_fleet_validation.py`, `services.py::assign_driver`, `services.py::assign_helpers`, admin `clean_vehicle`/`clean_driver`
- [ ] **FB-011-3** — Remove TO-linkage exclusions from availability pickers (`VehicleAvailabilityView`, `DriverAvailabilityView`, `HelperAvailabilityView`) + 3 admin dropdown querysets
- [ ] **FB-011-4** — New exclusivity gate in `fleet_supervisor.services.dispatch_to_after_ready` (vehicle, driver, and each assigned helper) + row locking + tests; matching early check in `supervisor_dispatch_intent`'s `start_inspection` branch
- [ ] **FB-011-5** — Cleanup `execution_fleet_availability.validate_for_driver_execution` to use `ACTIVELY_SERVING_TO_STATUSES`
- [ ] **FB-011-6** — Full regression pass: leave guard unchanged, maintenance/on-leave/license checks unchanged
