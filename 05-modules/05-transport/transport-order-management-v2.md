---
module: 05-transport
specification: Transport Order Management — Transport Planner Own-Fleet Assignment (Sprint 6 — FB-008) + Sprint 8 TO line UX
version: 2.2
phase: Phase 1
sprint: Sprint 6 (FB-008); Sprint 8 (FB-012, FB-013, FB-015)
last_updated: 2026-08-07
changelog: "v2.2 — Sprint 8 TO line allocation UX reconciled with code: create-from-tr Remaining Quantity + Allocating TO Load (FB-012/FB-015); TO details Line items inline with PR/TR product columns, live Remaining/TO Load on edit, RBAC view for Transport Planner / TDO Vendor Fleet (FB-013). v2.1 — Remove TR planning-inputs gate: Create TO available when TR is Available for Transport Planning; vehicle type captured at TO creation (FB-008). v2.0 — FB-008 initial implementation plan."
related_stories: TO-01 (transport-order-management), TO-02 (trip-management), FB-006 (planned milestone times — amended), FB-012, FB-013, FB-015
feedback_items: FB-008, FB-012, FB-013, FB-015
supersedes: transport-order-management.md §1 (roles), §2 (model), §3 (status), §4 (creation); trip-management.md §1 (roles), §2.1 (assignment owner)
baseline_spec: transport-order-management.md, trip-management.md
feedback_tracker: ../../03-backlog/sprints/sprint-8/improvements/05-transport-planner.md
jira_epic: DFS-040
---

# Transport Order Management — Transport Planner Own-Fleet Assignment (FB-008)

## Overview

This document is the **Sprint 6 backend implementation plan** for [FB-008](../../03-backlog/sprints/sprint-6/feedback-resolution/05-transport-orders.md#fb-008--tdo-own-fleet-role-removed-transport-planner-owns-own-fleet-to-creation-assignment-and-planned-milestone-times). It amends the baseline [Transport Order Management](./transport-order-management.md) and [Trip Management](./trip-management.md) specifications.

**Problem (client feedback — 2026-07-03):** Operations no longer want a separate **TDO — Own Fleet** persona. Today the Transport Planner creates own-fleet TOs and a different user (TDO Own Fleet) assigns vehicle, driver, helpers, and planned times in a separate Assignment Queue. This split adds hand-off friction and duplicates context the Planner already has at creation time.

**Solution (FB-008 scope):**

1. **Remove** the `tdo_own_fleet` role from the role model, RBAC seed, menus, and all own-fleet assignment gates.
2. **Transport Planner** performs own-fleet **TO creation** (unchanged multi-TO-per-TR flow) **and** **resource assignment** (vehicle, driver, planned milestones) on the same TO record.
3. **Extend TO creation** with **Vehicle Type** (mandatory dropdown from `VehicleType` master choices) and **Vehicle** (optional FK to `master_data.Vehicle` — registration comes from master data only; may be left blank and selected later on the same TO).
4. **Extend planned milestones** (FB-006 baseline) with **Planned Start Time** — FG requires 5 datetimes; RM requires 3 (start + destination pair).
5. **Tighten** `created → assigned` so **both** vehicle **and** driver must be set (already implemented in `_try_transition_to_assigned`; admin `save_model` must stay aligned).

**Primary module path:** `apps/transport/`  
**Cross-module touch paths:** `apps/requisitions/role_access.py`, `apps/core/role_seed_data.py`, `apps/fleet_supervisor/services.py`, `apps/users/admin.py`, `apps/fleet_supervisor/admin.py`, GPS/dashboard serializers (read-only contract amend)

**Out of scope (separate feedback items):** FB-009 (Vehicle Type at vendor-fleet creation — TDO Vendor Fleet retained), FB-010/FB-011 (completion / dispatch gates), full removal of deprecated `eta_datetime` consumers, **E2E / Playwright tests** (unit + integration only for FB-008).

---

## 0.1 TR → TO workflow — planning inputs removed (v2.1)

Sprint 3 originally required Transport Planner to submit **Planning Inputs** on the TR before the TR advanced to **Under Planning** and **Create TO** was enabled.

**Implemented change (v2.1):** That intermediate step is **removed** for **both Finished Goods and Port Consignment (RM)** TRs. Operations create transport orders as soon as the TR is **Available for Transport Planning**:

- **FG:** after Distribution Manager approval
- **Port Consignment (RM):** immediately when Procurement Officer creates the TR (no DM approval step)

| Aspect | Sprint 3 baseline | v2.1 implementation |
|--------|-------------------|----------------------|
| TR admin **Planning Inputs** fieldset | Transport Planner edits `vehicle_type`, `vehicles_required`, C&F | **Removed** from TR change form for all roles |
| **`vehicles_required` on TR** | Set at planning; shown in TR list / create-from-TR header | **Removed** from model, admin, and API |
| **Create TO** button / admin entry | `UNDER_PLANNING` or `PARTIALLY_ALLOCATED` only | Also **`AVAILABLE_FOR_TRANSPORT_PLANNING`** (FG + Port) |
| `TransportOrderService.create` gate | `tr.status == UNDER_PLANNING` | `tr.status in TR_STATUSES_TO_CREATABLE` |
| Vehicle type commitment | On TR (planning inputs) | On **TO** at creation (`vehicle_type` mandatory for own fleet — FB-008) |
| TR status after first TO | `UNDER_PLANNING` → `PARTIALLY_ALLOCATED` / `FULLY_ALLOCATED` | Same allocation-driven transitions; may skip `UNDER_PLANNING` when first TO is created from **Available for Transport Planning** |
| API `PATCH …/planning` (TRQ-01) | Submits planning inputs | **410 Gone** — deprecated; clients create TOs directly |
| TR model fields `vehicle_type`, `cf_clearance_approved` | Part of planning inputs | **Optional legacy** on TR; not required for TO creation |

**Code anchors:**

- `apps/requisitions/constants.py` — `TR_STATUSES_TO_CREATABLE`
- `apps/requisitions/admin.py` — `TransportRequisitionAdmin.create_to_button`, Planning Inputs fieldset removed
- `apps/transport/services.py` — `TransportOrderService.create`, `TOLineAllocationService.update_tr_status`
- `apps/transport/admin.py` — `select_tr_view`, `create_from_tr_view`

---

## 0. Scope boundary

| In scope (FB-008) | Out of scope / separate items |
|-------------------|-------------------------------|
| Remove `tdo_own_fleet` role + menu + permission grants | FB-009 — vendor-fleet Vehicle Type at creation |
| TP edits own-fleet assignment + planned milestone fieldsets | FB-010 — completion / POD / Bill Disbursed |
| New TO field: `vehicle_type`; optional `vehicle` FK exposed at creation (existing field — no free-text registration) | FB-011 — multi-TO planning / inspect gates |
| New milestone field: `planned_start_at` | Renaming `TDOAssignmentService` (cosmetic; optional follow-up) |
| Amend FB-006 lane rules (+ Planned Start Time) | Hard migration of all `eta_datetime` API clients (keep sync) |
| Vehicle dropdown filtered by TO `vehicle_type` at assignment | Own-fleet capacity panel (see `own-fleet-vehicle-capacity-validation.md` — surface moves to TP) |
| Rollout: reassign existing TDO Own Fleet users → Transport Planner | TDO Vendor Fleet role and Assignment Queue — **unchanged** |
| Unit + integration tests only (`tests/unit/`, `tests/integration/`) | **E2E tests** — do not add, amend, or run Playwright E2E for FB-008 |

### Locked product decisions (implementation defaults)

| Topic | Decision | Rationale |
|-------|----------|-----------|
| Helper assignment | **Moves to Transport Planner** with vehicle/driver on the same TO change form | Not mentioned in client feedback; dropping helpers would regress TO-02. Minimal change: same M2M field, new role gate. |
| Vehicle at creation | **Optional FK** to `master_data.Vehicle` — autocomplete from fleet master data only | FB-008 "Vehicle Registration Number" maps to selecting a **Vehicle** record (registration = `Vehicle.registration_number`). **No free-text** vehicle or registration fields. Blank at creation is allowed; TP sets the same FK later on assignment. |
| Fleet type at TO creation | **Unchanged** — Transport Planner selects **Own** or **Vendor** on the create-from-TR form | FB-008 removes only TDO (Own Fleet); vendor TOs still created by TP and routed to TDO (Vendor Fleet) for contractual vendor assignment. Multi-TO-per-TR works for both fleet types. |
| Vehicle Type at creation | **Mandatory** for `fleet_type = OWN` only in FB-008 | FB-009 adds the same field for vendor path separately. |
| TDO Vendor Fleet | **Unchanged** — keeps Assignment Queue + contractual vendor flow | Explicit in FB-008 notes and FB-009. |
| `created → assigned` trigger | **Vehicle AND driver** both non-null | Matches amended AC; code already does this in `TDOAssignmentService._try_transition_to_assigned`. |
| Planned milestones gate (supervisor release) | **Unchanged owner** — `fleet_supervisor.services` still calls `planned_milestones_complete()` before `ASSIGNED → READY_FOR_DISPATCH` | FB-008 only changes who *enters* the data, not the dispatch gate. |
| Legacy role slug | **`transport_distribution_officer_own_fleet`** treated same as `tdo_own_fleet` during deprecation | Already aliased in `TDO_OWN_FLEET_ROLE_CODES`. |
| Test coverage | **Unit + integration only** — no new or updated E2E / Playwright tests | FB-008 verified via `tests/unit/` and `tests/integration/`; `tests/e2e/` is explicitly out of scope for this story. |

---

## 1. Current vs expected behaviour

| Aspect | Current (pre-FB-008 / codebase) | Expected (v2.0 / FB-008) |
|--------|--------------------------------|---------------------------|
| Own-fleet assignment owner | `tdo_own_fleet` — dedicated Assignment Queue changelist filter | `transport_planner` — same TO change form used for creation follow-up |
| `tdo_own_fleet` role | Seeded in `role_seed_data.py`; in `TRANSPORT_ORDER_ADMIN_ROLE_CODES` | **Removed** from seed; existing users migrated to `transport_planner` or deactivated |
| TP TO change form | Own Fleet Assignment + Planned Milestones **hidden** (`_TDO_ASSIGNMENT_ONLY_SECTIONS`) | TP **sees and edits** assignment + milestones for own-fleet TOs in `CREATED` / `ASSIGNED` / `UNDER_PLANNING` |
| TO creation fields | TR line allocation, fleet type, planned delivery, C&F note | **Fleet type choice unchanged** (Own / Vendor). Own: + Vehicle Type (required), optional Vehicle FK. Vendor: creation fields unchanged in FB-008 (FB-009 adds Vehicle Type) |
| Planned milestones (FG) | 4 fields (FB-006) | **5** — add `planned_start_at` |
| Planned milestones (RM) | 2 destination fields (FB-006) | **3** — add `planned_start_at` |
| `created → assigned` | Vehicle + driver (service); admin `save_model` also promotes | **Unchanged rule** — document as canonical; ensure admin + API paths consistent |
| Vehicle autocomplete | All available vehicles (excl. maintenance / double-booked) | **Filtered by** TO `vehicle_type` when set |
| Multi-TO creation | `TransportOrderBatchCreateService.create_multiple` | Unchanged flow; each TO row inherits shared `vehicle_type`; optional shared `vehicle` FK or left blank per row |
| API assignment actions | `PATCH …/vehicle`, `/driver`, `/helpers`, `/planned-milestones` — queryset scoped to TDO own/vendor | Own-fleet assignment actions allowed for **`transport_planner`**; vendor actions still **TDO Vendor Fleet** only |
| GPS / driver mobile read | Planned milestones from TO | Include `planned_start_at` in serializer contract |

---

## 2. Menu structure & navigation (amended)

### Transport Planner (after FB-008)

```
Sidebar
└── Transport
      ├── Transport requests          — unchanged (view + Create TO when Available for Transport Planning)
      └── Transport orders (TO)
            ├── TO List               — all TOs (own + vendor)
            ├── Create from TR        — unchanged entry; + vehicle type fields (OWN)
            └── TO Detail             — own-fleet: assignment + planned milestones on same form
```

### Removed menu path

```
Sidebar (TDO — Own Fleet)               ← REMOVED
└── Transport
      └── Transport orders (TO)
            └── Assignment Queue        ← REMOVED (no separate queue; TP uses main TO list)
```

### TDO — Vendor Fleet (unchanged)

```
Sidebar (TDO — Vendor Fleet)
└── Transport
      └── Transport orders (TO)
            └── Assignment Queue       — vendor TOs status=created; contractual vendor assign
```

### Role → menu mapping (amended)

| Role | TR queue | TO create | Own-fleet assign (vehicle/driver/milestones) | Vendor assign |
|------|:--------:|:---------:|:---------------------------------------------:|:-------------:|
| Transport Planner | ✓ | ✓ | ✓ **(NEW)** | ✗ (read-only vendor section) |
| ~~TDO — Own Fleet~~ | — | — | — | — |
| TDO — Vendor Fleet | ✗ | ✗ | ✗ | ✓ |
| Driver | ✗ | ✗ | ✗ | ✓ (read own TOs) |

**Menu mechanism:** Removing `tdo_own_fleet` from `SEED_ROLES` drops `MENU_TRANSPORT_ORDERS_VIEW` / `TRANSPORT_TO_UPDATE` for that role. No `portal_navigation.py` structural change required unless an explicit Assignment Queue nav entry exists for own fleet (today it is the same changelist with role-based fieldsets).

---

## 3. Data model changes

### 3.1 `TransportOrder` (`apps/transport/models.py`)

Add fields:

```python
# Planner inputs at creation (FB-008) — own fleet; FB-009 adds vehicle_type for VENDOR separately
vehicle_type = models.CharField(
    max_length=20,
    choices=VehicleType.choices,  # apps.master_data.models.VehicleType
    blank=True,                   # blank=False enforced in clean() when fleet_type=OWN
    db_index=True,
)

# Own-fleet planned milestones (FB-006 + FB-008)
planned_start_at = models.DateTimeField(null=True, blank=True)
# existing: vehicle FK (nullable — optional at creation OR assignment),
#           planned_source_arrival_at, planned_source_departure_at,
#           planned_destination_arrival_at, planned_destination_departure_at
```

**No new registration text field.** The existing `vehicle` FK (`FK → master_data.Vehicle`) is the sole own-fleet vehicle reference. Registration number is always `vehicle.registration_number` from MDM — never user-typed.

**Notes:**

- `vehicle_type_required` existed on early TO migrations but was **removed** in `0006_to_sprint3.py`. FB-008 reintroduces requirement at TO level (vehicle type is set on the TO, not on a separate TR planning-inputs step).
- When `vehicle` FK is set (at creation or assignment), validate `vehicle.vehicle_type == to.vehicle_type` (hard block on mismatch).
- `vendor_vehicle_registration` on the vendor path is **unchanged** — that is vendor-supplied execution detail, not own-fleet MDM.
- `eta_datetime` remains deprecated mirror of `planned_destination_arrival_at` (FB-006).

### 3.2 Migration

1. `AddField` × 2 (`vehicle_type`, `planned_start_at`).
2. **Backfill** `vehicle_type` for existing own-fleet TOs:
   - Prefer `to.tr.vehicle_type` when present.
   - Else infer from `to.vehicle.vehicle_type` when vehicle already assigned.
   - Else default `open_truck` or leave blank and fix in data migration script — **tenant Admin review** for nulls.
3. No backfill required for `planned_start_at` (nullable until TP/TDO re-enters).

### 3.3 `planned_milestones.py` amend (FB-006 → FB-008)

```python
PLANNED_START = "planned_start_at"

ALL_PLANNED_FIELD_NAMES = (
    PLANNED_START,
    PLANNED_SOURCE_ARRIVAL,
    PLANNED_SOURCE_DEPARTURE,
    PLANNED_DEST_ARRIVAL,
    PLANNED_DEST_DEPARTURE,
)

def required_planned_field_names(flow_lane):
    if lane in RM_FLOW_LANES:
        return (PLANNED_START, PLANNED_DEST_ARRIVAL, PLANNED_DEST_DEPARTURE)
    return ALL_PLANNED_FIELD_NAMES  # FG: all 5
```

**Validation ordering (FG):**

```
planned_start_at
  < planned_source_arrival_at
  < planned_source_departure_at
  < planned_destination_arrival_at
  < planned_destination_departure_at
```

**Validation ordering (RM):**

```
planned_start_at < planned_destination_arrival_at < planned_destination_departure_at
```

**Suggestions (`get_planned_milestone_suggestions`):** extend backward chain — e.g. derive `planned_start_at` as `source_arrival - DEFAULT_PRE_TRIP_HOURS` (suggest constant 1h unless route metadata provides yard-exit lead time).

---

## 4. Role gates & RBAC

### 4.1 Remove `tdo_own_fleet`

**`apps/core/role_seed_data.py`**

- Delete the `("tdo_own_fleet", …)` tuple from `SEED_ROLES`.
- Keep `tdo_vendor_fleet` unchanged.

**`apps/requisitions/role_access.py`**

- Remove `tdo_own_fleet` from `KNOWN_ROLES` and `TRANSPORT_ORDER_ADMIN_ROLE_CODES`.
- Remove or deprecate `TDO_OWN_FLEET_ROLE_CODES` and `user_is_tdo_own_fleet()` — grep-driven cleanup across codebase.
- Update `scope_transport_orders_queryset`: drop own-fleet TDO branch; vendor TDO branch unchanged.

### 4.2 Transport Planner permissions

Transport Planner already has `TRANSPORT_TO_UPDATE` and `MENU_TRANSPORT_ORDERS_VIEW`. **No new permission code required** unless product wants an explicit `TRANSPORT_TO_ASSIGN_OWN_FLEET` for audit granularity (recommend **reuse** `TRANSPORT_TO_UPDATE` to minimise RBAC churn).

### 4.3 Rollout for existing users

1. Query tenant users with role `tdo_own_fleet` or legacy `transport_distribution_officer_own_fleet`.
2. Tenant Admin: reassign to `transport_planner` **or** deactivate if duplicate of existing TP account.
3. Run `seed_dfms_rbac` after deploy (removes role definition for new invites).
4. Document in release notes — no automatic role merge in migration (tenant-specific).

---

## 5. Django admin changes

**Primary file:** `apps/transport/admin.py` (`TransportOrderAdmin`)

### 5.1 TO creation (`create_from_tr_view`)

Extend `CreateTOForm`:

| Field | Widget | Required when |
|-------|--------|---------------|
| `vehicle_type` | `Select` (`VehicleType.choices`) | `fleet_type == OWN` |
| `vehicle` | Autocomplete (`ModelChoiceField` → `Vehicle`) | Never (optional) |

- Pre-fill `vehicle_type` initial from `tr.vehicle_type` when the TR already has a value (optional legacy data); TO stores the committed type.
- Vehicle autocomplete queryset: `Vehicle` master data filtered by selected `vehicle_type`, excluding under-maintenance and double-booked (same rules as assignment form).
- Pass `vehicle_type` and optional `vehicle_id` into `TransportOrder(...)` and `TransportOrderBatchCreateService.create_multiple`.
- Template `create_from_tr.html`: show fields when Fleet type = Own (JS toggle or server-side section); vehicle dropdown disabled until vehicle type selected.
- **Sprint 8 (implemented):** Allocate Quantities per Product table also shows **Remaining Quantity** (FB-012) and live **Allocating TO Load** = Σ(allocate qty × wpu) × Number of TOs as `{mt} MT ({kg} kg)` (FB-015). See §5.7.

### 5.2 Fieldsets — merge creation + assignment for TP

| Change | Detail |
|--------|--------|
| Remove TP exclusion of `_TDO_ASSIGNMENT_ONLY_SECTIONS` | TP sees **Own Fleet Assignment** + **Planned Milestones** for `fleet_type=OWN` |
| Rename fieldset label (optional) | "Own Fleet Assignment" → "Resource Assignment" (product copy; not blocking) |
| `_planned_milestones_editable` | Replace `user_is_tdo_own_fleet` check with `user_is_transport_planner` (or TP + tenant admin) |
| `get_readonly_fields` | **Remove** blanket `readonly.update(_OWN_FLEET_FIELDS)` for TP; TP may edit vehicle/driver/helpers when `status in _TDO_ASSIGNMENT_STATUSES` |
| Planned milestone fields | Include `planned_start_at`; lane-aware hide for RM source fields (existing pattern) |

### 5.3 Vehicle FK queryset

In `formfield_for_foreignkey` for `vehicle`:

```python
if to.vehicle_type:
    qs = qs.filter(vehicle_type=to.vehicle_type)
```

Keep existing maintenance / double-booking exclusions. Same queryset rules apply on the creation form and the TO change form.

### 5.4 `save_model` / validation

- On create (admin): validate `vehicle_type` present when `fleet_type == OWN`; if `vehicle` FK set, enforce `vehicle.vehicle_type == to.vehicle_type`.
- Planned milestones: call `validate_planned_milestone_values` in `TransportOrderAdminForm.clean()` when TP submits assignment fields (mirror API strictness for non-partial saves).
- Keep `sync_deprecated_eta_datetime` on save.
- `created → assigned` promotion when `vehicle_id` and `driver_id` set — already present; call `sync_driver_assigned_for_transport_order` after status flip (service path already does).

### 5.5 Changelist

- Remove any TDO-own-specific filters intended as "Assignment Queue" (if present).
- Optional: add `vehicle_type` column for TP operational sorting.
- Update `capacity_fit_badge` / panel gate from `user_is_tdo_own_fleet` → `user_is_transport_planner` (see `own-fleet-vehicle-capacity-validation.md`).

### 5.6 Other admin touchpoints

| File | Change |
|------|--------|
| `apps/transport/admin_closure.py` | Remove `tdo_own_fleet` from POD/close role tuples |
| `apps/transport/admin_driver.py` | Remove `tdo_own_fleet` from driver POD read roles |
| `apps/users/admin.py` | Remove `_is_tdo_own_fleet` restrictions on Driver/Helper admin (TP uses standard master-data read paths) |
| `apps/fleet_supervisor/admin.py` | Remove `_ds_readonly_roles = ("tdo_own_fleet",)` entries |

### 5.7 Sprint 8 — TO line allocation UX (**implemented**)

Reconciled with codebase as of 2026-08-07. Tracker: [Sprint 8 Transport Planner improvements](../../03-backlog/sprints/sprint-8/improvements/05-transport-planner.md) (FB-012, FB-013, FB-015 **Resolved**).

#### 5.7.1 Create TO from TR (`create_from_tr.html` + `create_from_tr_view`)

| Column / element | Behaviour |
|------------------|-----------|
| Product | Item code + product name (PR line) |
| Pack Size / UOM / TR Qty / Total Weight (kg) | From TR/PR line |
| Already Allocated | Σ non-cancelled TO allocations on that TR line |
| **Remaining Quantity** (FB-012) | TR qty − already allocated; live JS updates as allocate inputs / Number of TOs change |
| Allocate for This TO / Allocate per TO | Per-line UOM input (multi-TO multiplies remaining deduction) |
| **Allocating TO Load** (FB-015) | Footer: Σ(qty × wpu) × Number of TOs → `{mt} MT ({kg} kg)`; `—` when zero |

Persistence: only lines with allocate qty `> 0` become `TOLineItem` rows (`admin.create_from_tr_view` / `TransportOrderBatchCreateService`).

#### 5.7.2 TO details — Line items inline (FB-013)

**Problem fixed:** Default `TabularInline` used Django model perms (`transport.view_tolinetem`), so DFMS RBAC users (Transport Planner, TDO Vendor Fleet) never saw the inline after create.

**Implementation:**

| Piece | Detail |
|-------|--------|
| Admin | `TOLineItemInline` on `TransportOrderAdmin` |
| Template | `templates/admin/transport/transportorder/line_items_inline.html` |
| View permission | Follows `TransportOrderAdmin.has_view_permission` (same pattern as `TOTimelineInline`) |
| Change permission | Transport Planner / tenant admin / tenant super admin may edit **Allocated on this TO** when parent TO is editable; **TDO Vendor Fleet** view-only |
| Rows | Existing `TOLineItem` on this TO (not full TR matrix of zero-skipped lines) |

**Columns (post-create):**

| Column | Notes |
|--------|-------|
| Product | `[item_code] name — category` + `— subcategory` when present (`apps/master_data/display.product_line_item_label*`) |
| Pack Size | PR `type_of_packing` / product pack size |
| UOM | Line UOM |
| TR Qty | Parent TR line qty |
| Total Weight (kg) | PR line `total_weight_kg` |
| Already Allocated | Other TOs only (`exclude_to_id` = this TO) |
| Remaining Quantity | Live when editing: remaining_base − current allocated input |
| Allocated on this TO | `TOLineItem.allocated_quantity` |
| **TO Load** (footer) | Live Σ(this TO line qty × wpu) as `{mt} MT ({kg} kg)`; `—` when zero |

**Not on details:** multi-TO “Allocate per TO” wording; create-time × Number of TOs load formula.

**Code anchors:**

- `apps/transport/admin.py` — `TOLineItemInline`, `_stamp_to_line_item_row_meta`, `create_from_tr_view`
- `apps/transport/services.py` — `TOLineAllocationService.remaining_for_tr_line` / `allocated_for_tr_line`
- `templates/admin/transport/transportorder/line_items_inline.html`
- `templates/admin/transport/transportorder/create_from_tr.html`
- `tests/unit/test_transport/test_admin.py` — inline permission + display tests

---

## 6. Service layer

### 6.1 `TransportOrderService.create` / batch create

Add parameters:

```python
vehicle_type: str | None = None,
vehicle_id: str | None = None,  # optional FK — master data only
```

Validation:

- `fleet_type == OWN` → `vehicle_type` required.
- If `vehicle_id` provided → vehicle must exist, be available, and `vehicle.vehicle_type == vehicle_type`.
- `fleet_type == VENDOR` → ignore in FB-008 (FB-009).

Update:

- `apps/transport/services.py` — `TransportOrderService.create`
- `apps/transport/batch_create_services.py` — `create_multiple` (shared `vehicle_type` + optional shared `vehicle_id` across batch rows from form)

### 6.2 `TDOAssignmentService` (own-fleet methods)

**No rename required for FB-008** (optional tech-debt: `OwnFleetAssignmentService`).

Methods unchanged in behaviour:

- `assign_vehicle` / `assign_driver` / `assign_helpers` / `assign_planned_milestones`
- `_try_transition_to_assigned` — already requires **both** vehicle and driver

Add to `assign_planned_milestones`:

- Accept `planned_start_at` kwarg.
- Include in `update_fields` and validation via amended `planned_milestones.py`.

### 6.3 `fleet_supervisor.services`

- `planned_milestones_complete(to)` automatically picks up new required field via `required_planned_field_names` — **verify** dispatch release tests updated.
- No change to **who** releases dispatch (Driver Supervisor) — only completeness set grows.

---

## 7. REST API

**Base:** `apps/transport/views.py` — `TransportOrderViewSet`

### 7.1 Queryset / docstring

- Remove TDO Own Fleet scoping branch from `get_queryset` docstring and logic.
- Assignment actions on own-fleet TOs: allow `user_is_transport_planner(user)` (add explicit permission check in action methods or a shared `_assert_can_assign_own_fleet(request, to)`).

### 7.2 Serializers (`apps/transport/serializers.py`)

| Serializer | Change |
|------------|--------|
| `TransportOrderCreateSerializer` | Add `vehicle_type` (required for OWN), `vehicle_id` (optional UUID FK); reject unknown vehicle IDs |
| `TransportOrderDetailSerializer` | Expose new fields + `planned_start_at` in planned milestone block |
| `PlannedMilestonesAssignSerializer` | Add `planned_start_at`; dynamic `required` via amended `required_planned_field_names` |

### 7.3 Endpoints (ownership amend)

| Endpoint | Old owner | New owner (own fleet) |
|----------|-----------|------------------------|
| `POST /api/v1/transport-orders/` | Transport Planner | Transport Planner (+ new fields) |
| `PATCH …/vehicle` | TDO Own Fleet | **Transport Planner** |
| `PATCH …/driver` | TDO Own Fleet | **Transport Planner** |
| `PATCH …/helpers` | TDO Own Fleet | **Transport Planner** |
| `PATCH …/planned-milestones` | TDO Own Fleet | **Transport Planner** |
| `PATCH …/vendor` | TDO Vendor Fleet | **Unchanged** |

### 7.4 Fleet availability helpers

`GET /api/v1/fleet/availability` and `GET /api/v1/vehicles/available` already accept `vehicle_type` query param — TP UI should pass TO `vehicle_type` when fetching counts at creation/assignment.

---

## 8. Status lifecycle (own fleet)

Unchanged values beyond assignment owner and milestone completeness:

```
CREATED
  → ASSIGNED          when vehicle_id AND driver_id set (TP)
  → READY_FOR_DISPATCH when supervisor release + planned milestones complete (FB-006/008)
  → … (yard execution — FB-010/011 amend downstream statuses separately)
```

| Transition | Guard (FB-008) |
|------------|----------------|
| → `CREATED` | TO creation (TP) |
| → `ASSIGNED` | `vehicle` **and** `driver` both set |
| → `READY_FOR_DISPATCH` | `planned_milestones_complete(to)` incl. `planned_start_at` + lane set |

---

## 9. Implementation phases

### Phase 1 — Schema & domain

1. Migration: new TO fields.
2. Amend `planned_milestones.py` (+ unit tests).
3. Backfill migration for `vehicle_type`.

**Verify:** `pytest tests/unit/test_transport/test_planned_milestones.py` extended for FG=5, RM=3.

### Phase 2 — Services & API

1. `TransportOrderService` / batch create validation.
2. `TDOAssignmentService.assign_planned_milestones` + serializer.
3. ViewSet permission helper for TP own-fleet assignment.

**Verify:** API integration tests for TP assign; vendor TDO still works.

### Phase 3 — Django admin

1. `create_from_tr_view` + template.
2. `TransportOrderAdmin` fieldsets / readonly / vehicle queryset filter.
3. Remove `tdo_own_fleet` branches.

**Verify:** Manual admin flow — create TO → assign vehicle/driver/milestones on same form.

### Phase 4 — RBAC & cleanup

1. `role_seed_data.py` — remove role.
2. Grep cleanup: `tdo_own_fleet`, `user_is_tdo_own_fleet`, `TDO_OWN_FLEET_ROLE_CODES`.

### Phase 5 — Rollout

1. Deploy + `seed_dfms_rbac`.
2. Tenant Admin user role migration checklist.

**Not in FB-008 scope:** E2E test runs, new Playwright scenarios, or updates to `tests/e2e/` / UAT persona fixtures.

---

## 10. Code touchpoint summary

```
apps/transport/models.py                 + vehicle_type, planned_start_at (vehicle FK already exists)
apps/transport/migrations/               new migration + data backfill
apps/transport/planned_milestones.py     + PLANNED_START; required sets; validation; suggestions
apps/transport/services.py               create() params; assign_planned_milestones
apps/transport/batch_create_services.py    pass creation fields per TO
apps/transport/serializers.py            create + detail + planned milestones
apps/transport/views.py                  queryset; assignment permission checks
apps/transport/admin.py                    fieldsets, create_from_tr, vehicle filter, save_model
apps/transport/admin_closure.py          role tuples
apps/transport/admin_driver.py           role tuples
apps/requisitions/role_access.py         remove tdo_own_fleet; scope_transport_orders_queryset
apps/core/role_seed_data.py              remove tdo_own_fleet seed row
apps/fleet_supervisor/services.py        (tests only — planned_milestones_complete)
apps/fleet_supervisor/views.py           expose planned_start_at in milestone payload
apps/fleet_supervisor/admin.py           remove tdo_own readonly hacks
apps/users/admin.py                      remove tdo_own fleet driver/helper locks
templates/admin/transport/transportorder/create_from_tr.html
templates/admin/transport/transportorder/line_items_inline.html   # FB-013 TO details line items
tests/unit/test_transport/test_planned_milestones.py
tests/unit/test_transport/test_admin.py                            # FB-013 inline RBAC + columns
tests/unit/test_transport/                 new: test_tp_own_fleet_assignment_permissions (suggested)
tests/integration/                         API permission + assignment regression (if not covered in unit)
# tests/e2e/                               OUT OF SCOPE — no changes for FB-008
```

---

## 11. Test plan

**Scope:** Unit and integration tests only. **Do not** add, modify, or run E2E / Playwright tests for FB-008.

| Area | Cases |
|------|-------|
| Creation | OWN without `vehicle_type` → validation error (admin + API) |
| Creation | OWN with type + optional Vehicle FK → persisted; registration from MDM only |
| Creation | OWN with vehicle FK whose type mismatches TO `vehicle_type` → validation error |
| Batch create | N TOs share vehicle type from single form submit |
| Assignment permissions | TP can PATCH vehicle/driver/milestones; vendor TDO cannot assign own-fleet TO |
| Assignment permissions | `tdo_vendor_fleet` cannot assign vehicle on own-fleet TO (403) |
| Vehicle filter | Autocomplete excludes wrong `vehicle_type` |
| Milestones FG | All 5 required; monotonic chain incl. start |
| Milestones RM | 3 required; source fields hidden/not required |
| Status | `CREATED → ASSIGNED` only when both vehicle and driver set |
| Supervisor gate | `READY_FOR_DISPATCH` blocked until milestones complete incl. start |
| RBAC | `tdo_own_fleet` role absent after seed; legacy user reassign |
| Regression | Vendor fleet TDO assignment unchanged |

---

## 12. Open questions / follow-ups

| # | Question | Recommendation |
|---|----------|----------------|
| 1 | Helper assignment | **Include under TP** (see §0 locked decisions) — confirm with product on sign-off |
| 2 | TR `vehicle_type` vs TO `vehicle_type` | TO field is authoritative for execution; TR value is **default only** |
| 3 | Rename `TDOAssignmentService` | Defer — doc-only "own-fleet assignment service" alias in comments |
| 4 | `own-fleet-vehicle-capacity-validation.md` | Amend `primary_surface` from TDO → Transport Planner (separate doc PR) |

---

## 13. Related documentation

- **[FB-008 Feedback Tracker](../../03-backlog/sprints/sprint-6/feedback-resolution/05-transport-orders.md#fb-008--tdo-own-fleet-role-removed-transport-planner-owns-own-fleet-to-creation-assignment-and-planned-milestone-times)**
- **[Sprint 8 — Transport Planner improvements](../../03-backlog/sprints/sprint-8/improvements/05-transport-planner.md)** — FB-011 Remaining Weight (TR list), FB-012 Remaining Quantity (create), FB-013 TO details line items, FB-015 Allocating TO Load
- **[FB-006 — Planned milestone times](../../03-backlog/sprints/sprint-6/feedback-resolution/05-transport-orders.md#fb-006--tdo-own-fleet-planned-milestone-times-fg-four-rm-two-replace-single-eta)** (amended by FB-008)
- **[Transport Order Management (v1 — baseline)](./transport-order-management.md)** *(module README reference)*
- **[Trip Management (v1 — baseline)](./trip-management.md)** *(module README reference)*
- **[Own-Fleet Vehicle Capacity Validation](./own-fleet-vehicle-capacity-validation.md)** — primary user becomes Transport Planner
- **[User Roles — SOW](../../01-source/03-sow/user-roles.md)** — remove TDO Own Fleet entry
- **Sprint 3 stories:** [TO-01](../../03-backlog/sprints/sprint-3/05-transport/02-transport-orders.md), [TO-02](../../03-backlog/sprints/sprint-3/05-transport/03-tdo-assignment.md)

---

## 14. Implementation TODOs

### FB-008 (Sprint 6)

- [ ] **FB-008-1** — Model + migration: `vehicle_type`, `planned_start_at`; backfill `vehicle_type`; expose existing `vehicle` FK on creation (no text field)
- [ ] **FB-008-2** — `planned_milestones.py`: required sets (FG=5, RM=3), validation chain, suggestions
- [ ] **FB-008-3** — `TransportOrderService` + `TransportOrderBatchCreateService`: creation validation & persistence
- [ ] **FB-008-4** — Serializers + `TransportOrderViewSet`: new fields; TP assignment permission guard
- [ ] **FB-008-5** — `TransportOrderAdmin`: creation form, fieldsets, readonly rules, vehicle type filter
- [ ] **FB-008-6** — `role_seed_data.py` + `role_access.py`: remove `tdo_own_fleet`; grep cleanup
- [ ] **FB-008-7** — Satellite admins (`users`, `fleet_supervisor`, `admin_closure`, `admin_driver`): drop tdo_own branches
- [ ] **FB-008-8** — Unit/integration tests only: planned milestones, creation, permissions, status transitions, vendor regression (no E2E)
- [ ] **FB-008-9** — Rollout: user role migration + `seed_dfms_rbac` (no UAT/E2E persona updates in this story)

### Sprint 8 TO line UX (status vs code)

- [x] **FB-012** — Remaining Quantity on create-from-tr Allocate table
- [x] **FB-015** — Allocating TO Load live sum on create-from-tr
- [x] **FB-013** — TO details Line items table visible under DFMS RBAC; product/PR-TR columns; live Remaining + TO Load when editing allocated qty
