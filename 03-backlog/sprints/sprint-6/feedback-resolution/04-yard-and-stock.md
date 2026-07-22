---
title: Sprint 6 Feedback — Yard Operations & Stock
module: 04-yard-and-stock
menu: Gate / Scale / Command Center / Loading / Unloading / QC / Stock
parent: ./README.md
---

# Yard Operations & Stock

**Admin menu / area:** Gate / Scale / Command Center / Loading / Unloading / QC / Stock  
**Tracker index:** [README.md](./README.md)

> **Resolution Status values**: `Open` → `In Progress` → `Resolved`

| ID | Title | Priority | Status |
|----|-------|----------|--------|
| [FB-001](#fb-001--multiple-loadingunloading-point-assignments-per-to-visit) | Multiple loading/unloading point assignments per TO visit | High | Resolved |
| [FB-005](#fb-005--loadingunloading-quantity-capture-per-to-product-line-item) | Loading/unloading quantity capture per TO product line item | High | Resolved |
| [FB-007](#fb-007--depot-officer--feed-mill-officer-become-poi-scoped-local-roles-with-full-yard-operations-access) | Depot Officer & Feed Mill Officer become POI-scoped ("local") roles with full yard operations access | Medium | Resolved |
| [FB-012](#fb-012--stock-movement-calculated-from-loadunload-data-not-scale-inscale-out-weighbridge-difference) | Stock movement calculated from load/unload data, not scale-in/scale-out weighbridge difference | High | Resolved |
| [FB-013](#fb-013--qc-fail-does-not-block-unloading-capture-expected-failed-bags-and-warn-during-unload) | QC Fail does not block unloading; capture expected failed bags and warn during unload | High | Resolved |
| [FB-014](#fb-014--poi-admin-role-poi-scoped-yard-operations-super-user) | POI-Admin role: POI-scoped yard operations super-user | Medium | Resolved |
| [FB-017](#fb-017--remove-yard-operations-menu-access-from-depot-officer-and-feed-mill-officer-roles) | Remove yard operations menu access from Depot Officer and Feed Mill Officer roles | Medium | Resolved |
| [FB-018](#fb-018--simplify-poi-stock-display-show-only-total-current-and-free-capacity) | Simplify POI stock display: show only total, current, and free capacity | Medium | Resolved |

---

## FB-001 — Multiple loading/unloading point assignments per TO visit

| Field | Value |
|-------|-------|
| **Source** | Sprint 6 demo — 2026-06-22 |
| **Affected Stories** | [CC-01](../../sprint-5/06-command-center-loading/CC-01-queue-assign-serial.md), [LD-01](../../sprint-5/06-command-center-loading/LD-01-load-unload-timestamps.md) |
| **Sprint 4 origin** | [`sprint-4/06-command-center-loading/CC-01-queue-assign-serial.md`](../../../sprint-4/06-command-center-loading/CC-01-queue-assign-serial.md), [`sprint-4/06-command-center-loading/LD-01-load-unload-timestamps.md`](../../../sprint-4/06-command-center-loading/LD-01-load-unload-timestamps.md) |
| **Closing Sub-tasks** | CC-01 / LD-01 amendments (FB-001 — sub-tasks TBD on those stories) |
| **AC Amendment** | CC-01 AC-3 / LD-01 AC-1 / AC-2: Command Center must be able to assign **multiple** loading or unloading points to the same TO yard visit (not a single point). The TO advances to `loading_completed` or `unloading_completed` **only after all** assigned points for that leg have been started and completed. Intermediate sub-states (`loading_started`, `unloading_started`) may repeat per point; the terminal sub-state for the leg is emitted once when the last open assignment is closed. |
| **Status** | Resolved |
| **Priority** | High |
| **Notes** | Distinct from [FB-005](../../sprint-5/feedback-resolution.md) (resolved Sprint 5): FB-005 allows **multiple vehicles** at the **same** L/U point. FB-001 requires **multiple L/U points** for the **same** vehicle/TO. Current implementation enforces one `BayAssignment` per `QueueEntry` (OneToOne) and emits `loading_completed` / `unloading_completed` on the first point completion — see [command-center-loading-sprint4.md](../../../../05-modules/06-poi-operations/command-center-loading-sprint4.md) §3.5. |

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

---

## FB-005 — Loading/unloading quantity capture per TO product line item

| Field | Value |
|-------|-------|
| **Source** | Client call — 2026-07-02 |
| **Affected Stories** | [LD-01](../../sprint-5/06-command-center-loading/LD-01-load-unload-timestamps.md) |
| **Sprint 4 origin** | [`sprint-4/06-command-center-loading/LD-01-load-unload-timestamps.md`](../../../sprint-4/06-command-center-loading/LD-01-load-unload-timestamps.md) — AC-1 / AC-2; LD-01-9 |
| **Closing Sub-tasks** | LD-01-9 (amend), LD-01-10 |
| **AC Amendment** | LD-01 AC-1 / AC-2: at each loading or unloading point, quantity capture is **per `TOLineItem`**, not one aggregate on the parent event. For every product line on the TO, the operator sees a **read-only expected amount** sourced from the TO line (`allocated_quantity` + UOM / bags as applicable) and enters the **actual amount** for that leg — **loaded** quantity at loading points, **received** quantity at unloading points. Load/unload APIs and admin forms accept an array keyed to `to_line_item_id` (or equivalent stable line reference), persisting one child record per line per event. |
| **Status** | Resolved |
| **Priority** | High |
| **Notes** | Related to [Sprint 5 FB-001](../../sprint-5/feedback-resolution.md) (resolved): same per-line-item intent. Current LD-01 admin shows TO product lines as a **read-only summary panel** but captures **aggregate** `bags_loaded` / `weight_loaded_mt` (and unload equivalents) on `LoadEvent` / `UnloadEvent` only — no `LoadEventLineItem` / `UnloadEventLineItem` models or per-line POST payload yet. |

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

---

## FB-007 — Depot Officer & Feed Mill Officer become POI-scoped ("local") roles with full yard operations access

| Field | Value |
|-------|-------|
| **Source** | Client feedback — 2026-07-03 |
| **Affected Stories** | YARD-01 — POI-scoped yard platform ([sprint-4](../../sprint-4/10-yard-foundation/YARD-01-poi-scoped-yard-platform.md), [sprint-5](../../sprint-5/10-yard-foundation/YARD-01-poi-scoped-yard-platform.md)); [BUG-06](../06-bug-fixes/BUG-06-tenant-admin-poi-access-not-enforced.md) (POI-scoped yard queue access pattern) |
| **Reference docs** | [`user-roles.md`](../../../../01-source/03-sow/user-roles.md), [`user-tenant-management.md`](../../../../05-modules/01-foundation/user-tenant-management.md) §POI Assignment, [`product-requisition-management-v2.md`](../../../../05-modules/04-requisitions/product-requisition-management-v2.md) (implementation plan) |
| **Closing Sub-tasks** | FB-007-1 … FB-007-8 — see [product-requisition-management-v2.md](../../../../05-modules/04-requisitions/product-requisition-management-v2.md) §12 |
| **AC Amendment** | **Depot Officer** and **Feed Mill Officer** become **POI-scoped ("local") roles** — each restricted to their assigned depot/feed-mill POI, using the same POI-scoping pattern established by YARD-01 for Gate/Scale/Command Center/Loading/Unloading queues (fail-closed with no working-site selected; querysets/autocompletes/actions scoped to the assigned POI only). In addition to their existing Product Requisition creation and stock-view access at that POI, each role is granted menu and data access to **all yard operation modules** at their assigned site: Gate (Gate-In/Gate-Out), Scaling, Command Center, Loading, Unloading. No cross-POI access. |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | Today `depot_officer` and `feed_mill_officer` are Requester-only role codes (PR creation, stock-snapshot view at their POI per `stock-operations-sprint5.md` §Roles) with no yard-operations menu grant. This amendment adds yard-module access on top of the existing requester scope for both roles — it does not remove or change the PR-creation responsibility. |

### Client feedback observation

Depot Officer and Feed Mill Officer need to operate the yard (gate, scaling, command center, loading, unloading) at their own site in addition to raising requisitions — today neither role has access to those modules at all.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-007) |
|--------|---------|--------------------|
| Roles affected | `depot_officer`, `feed_mill_officer` — Requester roles for PR creation + stock view | Both become POI-scoped ("local") roles, same scoping model as YARD-01 |
| Yard module access | None (Gate/Scale/CC/Loading/Unloading not granted) | Full access to all five yard operation modules at assigned POI |
| Cross-POI visibility | N/A | None — fails closed outside assigned POI, per YARD-01/BUG-06 pattern |
| PR creation | Unchanged | Unchanged |

---

---

## FB-012 — Stock movement calculated from load/unload data, not scale-in/scale-out weighbridge difference

| Field | Value |
|-------|-------|
| **Source** | Client feedback — 2026-07-03 |
| **Affected Stories** | STK-01 ([`stock-operations-sprint5.md`](../../../../05-modules/06-poi-operations/stock-operations-sprint5.md)), [FB-005](#fb-005--loadingunloading-quantity-capture-per-to-product-line-item) (this sprint — per-line-item load/unload capture) |
| **Closing Sub-tasks** | STK-01 trigger redesign (replace `ScaleOutService.record_scale_out()` as the stock trigger); depends on FB-005's `LoadEventLineItem` / `UnloadEventLineItem` being in place |
| **AC Amendment** | `current_stock_mt` movement is calculated from **loading and unloading data**, not from the scale-in/scale-out weighbridge difference. Source POI deduction is driven by the **loaded quantity** recorded at loading points (sum of `LoadEventLineItem` weight, per FB-005); destination POI addition is driven by the **received quantity** recorded at unloading points (sum of `UnloadEventLineItem` weight, per FB-005). The stock trigger moves from `ScaleOutService.record_scale_out()` to the loading/unloading completion services (`LDService.complete_loading()` / `complete_unloading()`, or equivalent), summed across all line items for the visit. `abs(scale_in_weight_mt − scale_out_weight_mt)` is no longer used as the stock-movement quantity — scale-in/scale-out weights remain captured for weighbridge/gate record-keeping only. |
| **Status** | Resolved |
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

---

## FB-013 — QC Fail does not block unloading; capture expected failed bags and warn during unload

| Field | Value |
|-------|-------|
| **Source** | Client feedback — 2026-07-07 |
| **Affected Stories** | [QC-01](../../sprint-4/07-visibility-lifecycle-pod/QC-01-raw-material-sampling-qc-decision.md), [CC-01](../../sprint-5/06-command-center-loading/CC-01-queue-assign-serial.md), [LD-01](../../sprint-5/06-command-center-loading/LD-01-load-unload-timestamps.md); downstream: [STK-01](../../sprint-5/13-stock-validation-update/STK-01-source-destination-stock-validation.md) ([FB-012](#fb-012--stock-movement-calculated-from-loadunload-data-not-scale-inscale-out-weighbridge-difference)), SC-01 scale-out guards, GT-01 gate-out clearance |
| **Sprint 4 origin** | [`qc-operations-sprint4.md`](../../../../05-modules/06-poi-operations/qc-operations-sprint4.md) §2.3 (QC Fail blocks unloading / scale-out / gate-out); [`command-center-loading-sprint4.md`](../../../../05-modules/06-poi-operations/command-center-loading-sprint4.md) §3.4 (CC cannot assign unloading until QC Pass) |
| **Closing Sub-tasks** | QC-01 amendment (fail decision + failed-bag capture); CC-01 amendment (bay assignment eligibility on fail); LD-01 amendment (unload warning + mid-unload edit); sub-tasks TBD on owning stories; E2E-01-3 fail branch amend |
| **AC Amendment** | **QC-01 (RM inbound, `requires_qc=True` only):** When the QC Inspector records decision **Fail**, the system **requires** an integer **expected failed bag count** for the transport order (`0 < failed_bags ≤ total expected bags on the TO`). Fail **no longer blocks** Command Center unloading-point assignment or LD-01 unload start/complete. `TransportOrder.qc_passed` remains `False` on fail; pending QC (`qc_passed is null`) still blocks assignment until a decision exists. **CC-01:** After QC Fail with failed bags recorded, the CC Officer **may assign** an unloading point (same `assign_bay` flow as Pass). Queue row shows a **failed / caution** state with the failed-bag count — not "Awaiting QC". **LD-01:** Unloading admin and API surfaces a **non-blocking warning** to unloading personnel showing expected failed bags vs total expected bags on the TO (e.g. "QC failed: 12 of 500 bags expected rejected"). The failed-bag count **may be entered or updated during unloading** (before or while an unload event is in progress). Warning is informational only — it does not prevent start or complete. **Resample / override / reinspect** flows from QC-01 remain; mid-unload fail corrections continue to use resample / override-to-fail. |
| **Status** | Resolved |
| **Priority** | High |
| **Notes** | Current implementation (`QCService.record_decision` fail, `CCService.eligible_for_bay_assignment`, `ScaleOutService._require_qc_passed`, `clearance._optional_qc_clearance`) treats QC Fail as a **hard stop** before bay assignment. There is **no** `failed_bags` (or equivalent) field on `TransportOrder`, `QCCheckpointDecision`, or `UnloadEvent` today. Bag totals can be derived from `TOLineItem.allocated_quantity` where UOM is bag-based (`to_total_bags()` in `apps/transport/vehicle_capacity.py`). **Implementation plan:** [`qc-operations-v2.md`](../../../../05-modules/06-poi-operations/qc-operations-v2.md). **Open for implementation planning (PO confirm before Phase 3):** (1) Does destination **scale-out** and **gate-out** still require full QC Pass, or proceed after unload when fail + failed bags are recorded? (2) Under [FB-012](#fb-012--stock-movement-calculated-from-loadunload-data-not-scale-inscale-out-weighbridge-difference), does destination stock credit **accepted bags/weight only** (`received − failed`)? (3) TO-level failed-bag count vs per-`TOLineItem` failed bags (FB-005 per-line unload capture). (4) TOs with **weight-only** lines (no bag UOM) — support failed quantity in MT or QC-fail bag capture applies only when the TO has bag-based lines. Distinct from QC-01 **resample** (cancels active unload after Pass) and **reinspect after Fail** (pre-unload recovery). |

### Client feedback observation

Operations clarified that a **QC Fail decision should not prevent unloading**. When QC fails, the inspector records **how many bags on the TO are expected to fail**. Unloading personnel see this as a **warning** while unloading. The failed-bag count can also be **entered or adjusted during unloading**, not only at the initial QC fail decision.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-013) |
|--------|---------|-------------------|
| QC Fail → CC bay assignment | Blocked until QC Pass (`qc_passed is True`) | **Allowed** once Fail is recorded with failed-bag count |
| QC pending (`qc_passed is null`) | Blocked | Unchanged — still blocked until a decision exists |
| Failed bag capture | Not supported | Required on Fail; editable during unloading |
| Unload start / complete on failed TO | Impossible (no bay assignment) | Allowed; **warning banner** shows failed vs total expected bags |
| QC admin message on Fail | "Unloading, scale-out, and gate-out are blocked." | Reflects fail + failed bags; unloading may proceed with warning |
| Scale-out / gate-out on QC Fail | Blocked (`_require_qc_passed`, clearance) | **TBD** — confirm with PO (see Notes) |
| Destination stock on QC Fail | No credit (scale-out never runs) | **TBD** — likely credit accepted quantity only under FB-012 |

### Implementation phases (suggested)

See full plan: [`qc-operations-v2.md`](../../../../05-modules/06-poi-operations/qc-operations-v2.md).

| Phase | Scope |
|-------|--------|
| **1** | Model `qc_failed_bags` on `TransportOrder`; QC fail requires count; CC eligibility invert (`null` blocks, `False` allows); LD warning panel + API handoff |
| **2** | `update_failed_bags` during active unload (admin + REST) |
| **3** | Scale-out / gate-out / closure / stock rules (after PO sign-off; coordinate with FB-012) |

---

---

## FB-014 — POI-Admin role: POI-scoped yard operations super-user

| Field | Value |
|-------|-------|
| **Source** | Client feedback — 2026-07-07; confirmed 2026-07-08 |
| **Affected Stories** | YARD-01 — POI-scoped yard platform ([sprint-4](../../sprint-4/10-yard-foundation/YARD-01-poi-scoped-yard-platform.md), [sprint-5](../../sprint-5/10-yard-foundation/YARD-01-poi-scoped-yard-platform.md)); user & tenant management ([`user-tenant-management.md`](../../../../05-modules/01-foundation/user-tenant-management.md) §POI Assignment); [`user-roles.md`](../../../../01-source/03-sow/user-roles.md) |
| **Reference docs** | [`user-tenant-management.md`](../../../../05-modules/01-foundation/user-tenant-management.md) §POI Assignment, [`docs/architecture/poi-scoped-roles.md`](../../../../../docs/architecture/poi-scoped-roles.md); related: [FB-007](#fb-007--depot-officer--feed-mill-officer-become-poi-scoped-local-roles-with-full-yard-operations-access) (Depot/Feed Mill Officer yard access) |
| **Closing Sub-tasks** | FB-014-1 … FB-014-7 — see [poi-admin-yard-operations-v2.md](../../../../05-modules/06-poi-operations/poi-admin-yard-operations-v2.md) §8 |
| **AC Amendment** | Introduce a new **POI-scoped role** named **POI-Admin** (seed code `poi_admin`). A POI-Admin user may perform **all yard operation modules** at their **single assigned POI** only — Gate (Gate-In/Gate-Out), Scaling, Command Center, Loading, Unloading, and QC Checkpoint when applicable at that site — using the same fail-closed POI-scoping pattern as YARD-01 (`UserOperationalPOI`, `yard_poi.get_working_poi_for_request`). **No cross-POI access.** When a Tenant Admin **invites** a user or **assigns** the POI-Admin role on an existing user, **POI selection is mandatory** — the admin must pick exactly one active POI for that assignment; invite/activation and user save are blocked without it (same enforcement pattern as other `POI_SCOPED_ROLE_CODES`). POI-Admin does **not** inherit Tenant Admin org-wide privileges (user/role management, master-data setup, etc.) — yard operations at the assigned site only. Distinct from Depot Officer / Feed Mill Officer ([FB-007](#fb-007--depot-officer--feed-mill-officer-become-poi-scoped-local-roles-with-full-yard-operations-access)): those roles keep Product Requisition requester duties; POI-Admin is a dedicated site yard-operations role with no PR-creation responsibility unless separately granted. |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | No `poi_admin` role exists in `SEED_ROLES` or `POI_SCOPED_ROLE_CODES` today. Yard operators are single-function roles (`gateman`, `scaling_operator`, `command_center_officer`, `loading_personnel`, `unloading_personnel`, `qc_inspector_physical`). FB-007 grants yard-module access to `depot_officer` and `feed_mill_officer` at their POI but does not provide a unified site-admin persona. **Implementation plan:** [`poi-admin-yard-operations-v2.md`](../../../../05-modules/06-poi-operations/poi-admin-yard-operations-v2.md). Stock snapshot: default **include** `OPERATIONS_STOCK_READ` (see plan §0.1). E2E out of scope. |

### Client feedback observation

Operations need a **site-level yard administrator** who can perform **yard-related tasks** at **one specific assigned POI** — running every yard module at that site without holding separate Gateman, Scaling Operator, Command Center Officer, Loading, Unloading, or QC Inspector hats. The role should be named **POI-Admin**. When provisioning users, the Tenant Admin must **select which POI** that POI-Admin is bound to — the assignment is not optional.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-014) |
|--------|---------|-------------------|
| Dedicated site yard-admin role | None — yard work split across single-function POI-scoped roles | New **POI-Admin** (`poi_admin`) role |
| Yard module access | Per-role (one module each) or FB-007 depot/feed-mill officers (+ PR duties) | All yard operation modules at assigned POI |
| POI binding on user create/invite | Required for existing `POI_SCOPED_ROLE_CODES` | **Mandatory POI pick** when assigning POI-Admin |
| Cross-POI visibility | N/A for new role | None — fail-closed to assigned POI only |
| Tenant Admin scope | Org-wide | Unchanged — POI-Admin is not a tenant-admin substitute |

### Implementation plan

See full plan: [`poi-admin-yard-operations-v2.md`](../../../../05-modules/06-poi-operations/poi-admin-yard-operations-v2.md).

| Phase | Scope |
|-------|--------|
| **1** | RBAC seed `poi_admin`; `POI_SCOPED_ROLE_CODES`; yard multi-module operator constant |
| **2** | `extra_operator_role_codes` on yard admins + QC base; gate write roles |
| **3** | Invitation allowlist (Operations dept); portal nav + dashboard widgets |
| **4** | Docs; unit + integration tests (no E2E) |

---

---

## FB-017 — Remove yard operations menu access from Depot Officer and Feed Mill Officer roles

| Field | Value |
|-------|-------|
| **Source** | Client feedback — 2026-07-17 |
| **Affected Stories** | YARD-01 — POI-scoped yard platform; [FB-007](#fb-007--depot-officer--feed-mill-officer-become-poi-scoped-local-roles-with-full-yard-operations-access) (Depot Officer & Feed Mill Officer yard access); [FB-014](#fb-014--poi-admin-role-poi-scoped-yard-operations-super-user) (POI-Admin role) |
| **Reference docs** | [`user-roles.md`](../../../../01-source/03-sow/user-roles.md), [`product-requisition-management-v2.md`](../../../../05-modules/04-requisitions/product-requisition-management-v2.md) |
| **Closing Sub-tasks** | FB-017-1 seed catalog (drop yard perms, keep stock read); FB-017-2 `YARD_MULTI_MODULE_OPERATOR_ROLE_CODES` → POI-Admin only; FB-017-3 gate hardcodes (`_GATE_WRITE_ROLES` / `_gate_role_code`); FB-017-4 unit tests + re-run `seed_dfms_rbac` |
| **AC Amendment** | **Depot Officer** (`depot_officer`) and **Feed Mill Officer** (`feed_mill_officer`) should **no longer have access** to **yard operations menu** (Gate, Scaling, Command Center, Loading, Unloading). Both roles should retain their **POI-scoped** nature and their **Product Requisition creation** responsibilities at their assigned POI, but **yard operation modules** should be removed from their menu and access grants. With the introduction of **POI-Admin** role (FB-014), yard operations at a POI are now handled by dedicated POI-Admin users. Depot Officer and Feed Mill Officer should focus exclusively on their requester duties (PR creation, stock-snapshot view). |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | Implemented 2026-07-17: removed `*_yard_operator_permission_codes()` from both roles in `role_seed_data.py` (kept `OPERATIONS_STOCK_READ`); `YARD_MULTI_MODULE_OPERATOR_ROLE_CODES` is now `{poi_admin}` only; gate admin role allow-lists no longer include site officers. Roles remain in `POI_SCOPED_ROLE_CODES` / `POI_SCOPED_REQUESTER_ROLE_CODES`. Deploy must re-run `python manage.py seed_dfms_rbac` (without `--reset`) so public-schema role permissions sync removals. |

### Client feedback observation

With the introduction of POI-Admin as a dedicated POI-scoped yard operations role (FB-014), Depot Officer and Feed Mill Officer should no longer have access to the yard operations menu. These two roles should focus on their core responsibility of creating Product Requisitions at their assigned POI. Yard operations should be handled exclusively by POI-Admin users.

### Current vs expected behaviour

| Aspect | Current (post FB-007) | Expected (FB-017) |
|--------|----------------------|-------------------|
| Depot Officer yard access | Full access to all yard operation modules at assigned POI | No yard operations menu access |
| Feed Mill Officer yard access | Full access to all yard operation modules at assigned POI | No yard operations menu access |
| PR creation responsibility | Unchanged | Unchanged — both roles retain PR creation at their assigned POI |
| POI-scoped model | Both are POI-scoped | Unchanged — both remain POI-scoped |
| Yard operations at POI | Depot/Feed Mill Officer + POI-Admin | POI-Admin only |

---

---

## FB-018 — Simplify POI stock display: show only total, current, and free capacity

| Field | Value |
|-------|-------|
| **Source** | Client feedback — 2026-07-17 |
| **Affected Stories** | [STK-01](../../sprint-5/13-stock-validation-update/STK-01-source-destination-stock-validation.md) ([`stock-operations-sprint5.md`](../../../../05-modules/06-poi-operations/stock-operations-sprint5.md)) |
| **Reference docs** | [`stock-operations-sprint5.md`](../../../../05-modules/06-poi-operations/stock-operations-sprint5.md) §POI Stock Snapshot |
| **Closing Sub-tasks** | FB-018-1 … FB-018-3 — TBD |
| **AC Amendment** | POI stock snapshot display should be **simplified** to show **only three fields**: **(1) Total Capacity** (`total_capacity_mt`) — the maximum storage capacity of the POI; **(2) Current Stock** (`current_stock_mt`) — calculated using the currently implemented stock bookkeeping logic (per FB-012, driven by loading/unloading completion); **(3) Free Capacity** (`free_capacity_mt = total_capacity_mt − current_stock_mt`) — available storage space. **Remove** the following derived and in-transit fields from the display: **in-transit (out)** (`in_transit_outgoing_mt`), **in-transit (in)** (`in_transit_incoming_mt`), **projected utilization**, and any other computed forecast or allocation fields. The underlying data models and calculations may remain for internal use or future features, but the user-facing POI stock display (admin panels, dashboards, API responses where stock snapshot is exposed) should present only the three core fields. |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | Current implementation (STK-01 v2.0, `stock-operations-sprint5.md`) tracks `current_stock_mt`, `in_transit_outgoing_mt` (dispatched TO `allocated_quantity` from this POI), `in_transit_incoming_mt` (dispatched TO `allocated_quantity` to this POI), and derives `available_for_new_dispatch_mt = current_stock_mt − in_transit_outgoing_mt` and potentially other projections for allocation planning. This feedback item does not require removing the in-transit counters from the data model or business logic — they may still be maintained for planning or validation — but requests that the **user-facing stock display** be simplified to show only total, current, and free capacity. Admin interfaces (`POIAdmin`, stock snapshot panels on yard queues), dashboard widgets, and API serializers (`POIStockSnapshotSerializer`, if exposed) should be updated to hide in-transit and projected fields. Confirm during implementation planning whether "free capacity" should be a simple subtraction (`total − current`) or should account for any reserved/allocated stock. |

### Client feedback observation

The current POI stock display shows multiple fields including in-transit (out), in-transit (in), projected utilization, and other derived metrics. This creates unnecessary complexity for users who primarily need to understand three core metrics: how much total storage exists at the POI, how much is currently occupied, and how much free space is available. The in-transit and projection fields should be removed from the display to simplify the interface.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-018) |
|--------|---------|-------------------|
| POI stock display fields | Total capacity, current stock, in-transit (out), in-transit (in), projected utilization, possibly other derived fields | **Three fields only**: Total capacity, current stock, free capacity |
| Free capacity calculation | May be computed but not always shown, or shown as "available for new dispatch" | Explicitly shown as `free_capacity_mt = total_capacity_mt − current_stock_mt` |
| In-transit outgoing/incoming | Displayed to users | Hidden from user-facing display (data model may remain) |
| Projected utilization | Displayed to users | Hidden from user-facing display |
| Admin panels (POIAdmin, yard queues) | Show full set of stock fields | Show only total, current, free |
| API responses (stock snapshot) | Include in-transit and projection fields | Include only total, current, free |

---
