---
title: Sprint 8 Improvements — Transport Planner
module: 05-transport-planner
menu: Transport · Transport Requests · Transport Orders
parent: ./README.md
---

# Transport Planner

**Admin menu / area:** Transport · Transport Requests · Transport Orders  
**Tracker index:** [README.md](./README.md)

> **Resolution Status values**: `Open` → `In Progress` → `Resolved`

| ID | Title | Priority | Status |
|----|-------|----------|--------|
| [FB-011](#fb-011--transport-planner-tr-list--display-remaining-weight-kg-for-planning) | Transport Planner TR List: display Remaining Weight (KG) for planning | High | Resolved |
| [FB-012](#fb-012--to-creation-details--allocated-quantity-per-product-shall-show-remaining-quantity) | TO Creation details: Allocated Quantity Per Product shall show Remaining Quantity | High | Resolved |
| [FB-013](#fb-013--to-details-after-creation--pr-line-items-table-not-showing) | TO details after creation: PR line items table not showing | High | Resolved |
| [FB-015](#fb-015--to-creation--allocating-to-load-live-sum-in-mt-kg) | TO Creation: Allocating TO Load live sum in MT (kg) | Medium | Resolved |
| [FB-027](#fb-027--to-fleet-type-interchange--vendor--own-before-ready-for-dispatch) | TO fleet type interchange: Vendor ↔ Own before Ready for Dispatch | High | Open |

---

## FB-011 — Transport Planner TR List: display Remaining Weight (KG) for planning

| Field | Value |
|-------|-------|
| **Source** | Internal improvement — 2026-08-04 |
| **Affected Stories** | [TRQ-01](../../sprint-3/05-transport/01-transport-requests-queue.md) (Transport Requests Queue) |
| **Closing Sub-tasks** | FB-011-1 — Add **Remaining Weight (KG)** column to the Transport Planner **TR list** · FB-011-2 — Remaining Weight = TR total weight minus weight already allocated to TOs (planning remainder) |
| **AC Amendment** | The Transport Planner **TR list** SHALL display **Remaining Weight (KG)** so planners can see how much weight is still available for planning / TO allocation. |
| **Status** | Resolved |
| **Priority** | High |
| **Notes** | Distinct from FB-009 (DO/DM/PO Total Weight). Planner needs the **remaining** (unallocated) weight, not only the TR total. |

### Improvement observation

Transport Planner **TR List** needs to display **Remaining Weight (KG)** for planning.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-011) |
|--------|---------|-------------------|
| TR list (Transport Planner) | Remaining Weight (KG) not shown | **Remaining Weight (KG)** column for planning |

### Closing checklist

- [x] FB-011-1 — Remaining Weight (KG) column on Transport Planner TR list
- [x] FB-011-2 — Value reflects unallocated / remaining weight for planning

---

## FB-012 — TO Creation details: Allocated Quantity Per Product shall show Remaining Quantity

| Field | Value |
|-------|-------|
| **Source** | Internal improvement — 2026-08-04 |
| **Affected Stories** | [TO-01](../../sprint-3/05-transport/02-transport-orders.md) (Transport Order Creation) |
| **Closing Sub-tasks** | FB-012-1 — On **TO Creation** details, in **Allocated Quantity Per Product**, add a **Remaining Quantity** column · FB-012-2 — Remaining Quantity updates as allocated qty is entered (TR product qty − allocated across TOs / this TO) |
| **AC Amendment** | On the **TO Creation** details page, the **Allocated Quantity Per Product** section SHALL display a **Remaining Quantity** column so the planner can see how much quantity is left to allocate per product. |
| **Status** | Resolved |
| **Priority** | High |
| **Notes** | Complements FB-011 (remaining weight on TR list) with remaining **quantity** at TO creation time. |

### Improvement observation

On **TO Creation Details**, **Allocated Quantity Per Product** shall display a **Remaining Quantity** column.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-012) |
|--------|---------|-------------------|
| Allocated Quantity Per Product | Remaining Quantity missing | **Remaining Quantity** column displayed |

### Closing checklist

- [x] FB-012-1 — Remaining Quantity column on Allocated Quantity Per Product (TO creation)
- [x] FB-012-2 — Remaining Quantity reflects unallocated qty per product

---

## FB-013 — TO details after creation: PR line items table not showing

| Field | Value |
|-------|-------|
| **Source** | Internal improvement — 2026-08-04 |
| **Affected Stories** | [TO-01](../../sprint-3/05-transport/02-transport-orders.md) (TO detail after creation) |
| **Closing Sub-tasks** | FB-013-1 — After TO creation, the **TO details** page SHALL render the **PR line items** table · FB-013-2 — Table shows the linked PR/TR product line items expected on the detail view (no blank / missing section) |
| **AC Amendment** | After a Transport Order is created, the **TO details** page SHALL display the **PR line items** table. The table MUST NOT be missing or empty solely because the TO has been created. |
| **Status** | Resolved |
| **Priority** | High |
| **Notes** | Bug: PR line items table fails to show on TO details after creation. Confirm data source (PR vs TR line items) matches the designed detail layout and fix the render/query path. |

### Improvement observation

**PR line items table is not showing** after TO creation inside the details page.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-013) |
|--------|---------|-------------------|
| TO details — PR line items table (post-create) | Not showing | **Visible** with expected PR/TR line items |

### Closing checklist

- [x] FB-013-1 — PR line items table renders on TO details after creation
- [x] FB-013-2 — Line items content correct (linked PR/TR products)

---

## FB-015 — TO Creation: Allocating TO Load live sum in MT (kg)

| Field | Value |
|-------|-------|
| **Source** | Internal improvement — 2026-08-07 |
| **Affected Stories** | [TO-01](../../sprint-3/05-transport/02-transport-orders.md) (Transport Order Creation) |
| **Closing Sub-tasks** | FB-015-1 — On **TO Creation** (`create-from-tr`), show **Allocating TO Load** under **Allocate Quantities per Product** · FB-015-2 — Value = Σ(allocate qty × weight_per_unit) × **Number of TOs**, formatted `{mt} MT ({kg} kg)`; updates live as allocate / TO count changes; show **—** when load is zero |
| **AC Amendment** | On the **TO Creation** page, while the planner enters **Allocate for This TO** / **Allocate per TO**, the form SHALL display **Allocating TO Load** as the combined weight of the allocation being created: Σ(line allocate qty × weight_per_unit) × **Number of TOs**, in **`{mt} MT ({kg} kg)`** format (same style as TR **Total Weight**). |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | Complements FB-012 (Remaining Quantity). Load is **all TOs combined** (× Number of TOs), not per-TO only. E2E: [fb-015-to-creation-allocating-to-load-e2e-scenarios.md](../../../../09-testing/backend/e2e-scenarios/sprint-8/fb-015-to-creation-allocating-to-load-e2e-scenarios.md). |

### Improvement observation

While allocating quantities on TO creation, planners need a live **Allocating TO Load** total in MT and kg (batch total across Number of TOs).

### Current vs expected behaviour

| Aspect | Current | Expected (FB-015) |
|--------|---------|-------------------|
| Allocate Quantities per Product | No live total load for entered allocate qtys | **Allocating TO Load** = Σ(qty × wpu) × **Number of TOs** as `{mt} MT ({kg} kg)` |

### Closing checklist

- [x] FB-015-1 — Allocating TO Load displayed on create-from-tr (Allocate section)
- [x] FB-015-2 — Live value = combined load × Number of TOs; `—` when zero

---

## FB-027 — TO fleet type interchange: Vendor ↔ Own before Ready for Dispatch

| Field | Value |
|-------|-------|
| **Source** | Internal improvement — 2026-08-11 |
| **Affected Stories** | [TO-01](../../sprint-3/05-transport/02-transport-orders.md) (Transport Order Creation / planning); [FB-008 / FB-009 Sprint 6](../../sprint-6/feedback-resolution/05-transport-orders.md) (Own vs Vendor fleet paths); business rule [TOR-005](../../../../02-domain/03-business-rules/transport-rules.md) |
| **Closing Sub-tasks** | FB-027-1 — Widen TP editable window for `fleet_type` (direction-aware statuses) · FB-027-2 — Interchange service: remap status + clear opposite-fleet assignment fields · FB-027-3 — Vendor→Own → `created` + Planning Required · FB-027-4 — Own→Vendor (pre-RFD) → `under_planning` · FB-027-5 — Hard-block at/after `ready_for_dispatch`; gate on-demand TOs unchanged · FB-027-6 — Amend TOR-005 wording · FB-027-7 — Unit + E2E scenarios |
| **AC Amendment** | A **Transport Planner** SHALL be able to change a Transport Order’s **Fleet type** between **Vendor Fleet** and **Own Fleet** before the TO reaches **Ready for Dispatch**, with status and assignment side-effects as below. The TO MUST remain a single fleet type at all times (TOR-004). |
| **Status** | Open |
| **Priority** | High |
| **Notes** | Today `fleet_type` is editable only while `status=created` (`_FLEET_TYPE_EDITABLE_STATUSES`) and changing it does **not** remap status or clear vendor/own assignment fields. E2E: [fb-027-to-fleet-type-interchange-e2e-scenarios.md](../../../../09-testing/backend/e2e-scenarios/sprint-8/fb-027-to-fleet-type-interchange-e2e-scenarios.md). |

### Improvement observation

Once a TO is created as Vendor or Own Fleet, TP cannot usefully switch fleet mode when plans change (e.g. vendor capacity unavailable → use own fleet, or own resources unavailable → vendor). Field is locked outside `created`, and even in `created` there is no lifecycle remapping.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-027) |
|--------|---------|-------------------|
| Vendor TO `under_planning` → Own | `fleet_type` readonly | Editable; after save → Own, status **`created`**, Planning Required (vehicle/driver incomplete) |
| Vendor TO `created` → Own | Field may change; no cleanup/remap | Own, status **`created`**, vendor fields cleared, Planning Required |
| Own TO `created` / `assigned` (not yet RFD) → Vendor | Locked when `assigned`; no remap when `created` | Vendor, status **`under_planning`**, own vehicle/driver/helpers cleared |
| At/after `ready_for_dispatch` | Locked | Remains locked — no interchange |
| Gate on-demand TO | Locked | Remains locked |
| TDO Vendor Fleet / Driver | Cannot edit `fleet_type` | Unchanged (TP + tenant admin only) |

### Allowed windows (product)

| Direction | Allowed source statuses | Target after switch |
|-----------|-------------------------|---------------------|
| **Vendor → Own** | `under_planning`, `created` | `fleet_type=OWN`, `status=created` — own planning required |
| **Own → Vendor** | Any status **before** `ready_for_dispatch` (at least `created`, `assigned`; include `under_planning` if present) | `fleet_type=VENDOR`, `status=under_planning` |

### Side-effects on switch (required)

**Vendor → Own**

1. Set `fleet_type=OWN`, `status=CREATED`.
2. Clear vendor assignment fields: `assigned_vendor`, `vendor_vehicle_registration`, `vendor_driver_name`, contractual rate / `vendor_execution_confirmed` (and related vendor-only fields).
3. Leave planned milestones intact unless incomplete for own path; vehicle / driver / helpers remain empty until TP assigns → existing Planning Required / `sync_own_fleet_assignment_status` behaviour.
4. If an active bidding session exists for the TO: **block** the switch with a clear validation message (or cancel session — confirm in impl; default = **block** until bid closed/cancelled).
5. If TO is part of a vendor **bundle**: **block** switch (bundle children are vendor-only).

**Own → Vendor**

1. Clear `vehicle`, `driver`, `helpers`; refresh previous vehicle operational status; release driver availability via existing unassign helpers.
2. Set `fleet_type=VENDOR`, `status=UNDER_PLANNING`.
3. Clear any stray vendor fields so legacy `save_model` auto-promote cannot jump to `assigned` / `ready_for_dispatch`.
4. Planned milestones MAY be retained. On the **interchange save**, do **not** auto-promote `under_planning` → `created` via handoff sync; subsequent TP save with complete milestones follows normal FB-009 vendor handoff → `created` (TDO-visible).
5. Hard-stop if status ∈ {`ready_for_dispatch`} or later execution statuses.

### TOR-005 amendment

| Before | After (FB-027) |
|--------|----------------|
| System SHALL prevent fleet type change **after assignment** | System SHALL prevent fleet type change at/after **Ready for Dispatch**. Before RFD, TP MAY interchange Vendor ↔ Own per the windows above, clearing the opposite fleet’s assignment data so the TO is never handled by both fleets simultaneously. |

### Closing checklist

- [ ] FB-027-1 — Direction-aware editable statuses for `fleet_type` (admin readonly + `save_model` revert aligned)
- [ ] FB-027-2 — Dedicated interchange helper (service) called from TO admin on `fleet_type` change
- [ ] FB-027-3 — Vendor→Own: `created` + vendor fields cleared + Planning Required
- [ ] FB-027-4 — Own→Vendor (pre-RFD): `under_planning` + own resources released
- [ ] FB-027-5 — Block RFD+, gate on-demand, TDO/driver; block/handle bids & bundles
- [ ] FB-027-6 — Update [TOR-005](../../../../02-domain/03-business-rules/transport-rules.md) + transport-order module note if needed
- [ ] FB-027-7 — Unit tests + E2E scenario plan executed (MCP)
