---
module: 04-requisitions
specification: Product Requisition Management — POI-Scoped Depot/Feed Mill Officers (Sprint 6 — FB-007)
version: 2.1
phase: Phase 1
sprint: Sprint 6 (FB-007)
last_updated: 2026-07-03
changelog: "v2.1 — Gate on-demand TO dealer/supplier permissions included for depot/feed-mill; destination_poi read-only (not editable dropdown) for POI-scoped requesters. v2.0 — FB-007 initial plan."
related_stories: YARD-01 (POI-scoped yard platform), BUG-06 (tenant-admin working-site pattern), PR-01 (FG PR — destination POI behaviour amended)
feedback_items: FB-007
supersedes: product-requisition-management.md §0 (menu), §1.1 (destination POI), §5 (role gates), §6.2 (destination POI pre-fill), §12.1 (PR type gate — POI scope), §16.1 (RBAC dependency)
baseline_spec: product-requisition-management.md
feedback_tracker: ../../03-backlog/sprints/sprint-6/feedback-resolution.md
jira_epic: DFS-040
---

# Product Requisition Management — POI-Scoped Depot/Feed Mill Officers (FB-007)

## Overview

This document is the **Sprint 6 implementation plan** for [FB-007](../../03-backlog/sprints/sprint-6/feedback-resolution.md#fb-007--depot-officer--feed-mill-officer-become-poi-scoped-local-roles-with-full-yard-operations-access). It amends the baseline [Product Requisition Management Specification (v1.1)](./product-requisition-management.md).

**Problem (client feedback — 2026-07-03):** Depot Officer and Feed Mill Officer can raise Finished Goods PRs and view stock at their site, but they **cannot operate the yard** (Gate-In/Out, Scaling, Command Center, Loading, Unloading) at all. Operationally, these officers need to run day-to-day yard workflows at their own depot/feed-mill POI in addition to raising requisitions.

**Solution (FB-007 scope):**

1. Promote `depot_officer` and `feed_mill_officer` to **POI-scoped ("local") roles** using the same `UserOperationalPOI` + fail-closed pattern established by YARD-01.
2. Grant **full write access** to all five yard operation modules at the assigned POI (same operational parity as gateman + scaling operator + command center officer + loading personnel + unloading personnel, combined at one site).
3. **Tighten** existing requisition surfaces so `destination_poi` is **read-only** and fixed to the assigned POI, and stock-snapshot APIs are restricted to that POI — no cross-POI access anywhere.

**Primary module path:** `apps/requisitions/`  
**Cross-module touch paths:** `apps/users/yard_constants.py`, `apps/operations/admin_base.py`, `apps/operations/{gate,scaling,command_center,loading}/admin.py`, `apps/core/role_seed_data.py`

---

## 0. Scope boundary

| In scope (FB-007) | Out of scope / unchanged |
|-------------------|--------------------------|
| `depot_officer` / `feed_mill_officer` added to `POI_SCOPED_ROLE_CODES` | Commercial Officer, Distribution, Procurement roles |
| `UserOperationalPOI` required on invite/edit for both roles | Tenant Admin session-based working-site switcher (BUG-06 pattern — unchanged) |
| Full yard menu + write permissions at assigned POI | QC Checkpoint module (not requested) |
| `YardAdminBase` extended to recognise depot/feed-mill as extra operator roles | Port Shipment flows (Commercial Officer) |
| Gate on-demand TO — dealer + supplier create at assigned POI | `rbac_service._assigned_poi_ids` stub (remains unused) |
| `destination_poi` read-only, fixed to assigned POI (admin + REST) | PR list visibility rule (own PRs only — unchanged) |
| `poi_stock_snapshot_api` restricted to assigned POI | |
| RBAC seed update + rollout note for backfill | |

### Locked product decisions (2026-07-03)

| Topic | Decision |
|-------|----------|
| Yard write scope | **Full write** — depot/feed-mill officers perform Gate-In/Out, Scale-In/Out, CC queue/bay assignment, loading/unloading start/complete, and **on-demand TO** (dealer + supplier) at their site |
| PR destination POI | **Read-only** — pre-filled from assigned POI; officer cannot change it (admin field disabled + REST rejects mismatch) |
| PR creation responsibility | **Unchanged** — officers still create FG PRs; amendment adds yard ops on top |
| POI assignment model | **One** `UserOperationalPOI(role=depot_officer\|feed_mill_officer, poi=<site>)` row scopes all modules |
| Cross-POI access | **None** — fail-closed per YARD-01 / BUG-06 pattern |

---

## 1. Current vs expected behaviour

| Aspect | Current (v1.1 / pre-FB-007) | Expected (v2.0 / FB-007) |
|--------|----------------------------|----------------------------|
| Role classification | Global requester roles — not in `POI_SCOPED_ROLE_CODES` | POI-scoped local roles — same model as `gateman`, `scaling_operator`, etc. |
| Site assignment | Optional; pre-fill from `InvitationToken.poi` only | **Required** — `UserOperationalPOI` enforced on invite/edit |
| Yard module access | None | Gate, Scaling, Command Center, Loading, Unloading — full write at assigned POI |
| `destination_poi` field | All active POIs (editable dropdown) | **Read-only** — fixed to assigned POI; no override |
| Stock snapshot API | Any POI UUID if user has `OPERATIONS_STOCK_READ` | Assigned POI only; `403` for other POIs |
| PR list | Own PRs only (`requested_by=user`) | Unchanged |
| Cross-POI visibility | Possible on PR/stock surfaces | None — fail-closed everywhere |

---

## 2. Menu structure & navigation (amended §0)

Depot / Feed Mill Officer sidebar **after FB-007**:

```
Sidebar
├── Dashboard
├── Requisition
│     └── Finished Goods                    [Depot Officer / Feed Mill Officer]
│           ├── PR List
│           ├── Create FG PR
│           └── PR Detail
├── Gate                                    [NEW — FB-007]
│     ├── Vehicle Entry (Gate-In)
│     ├── Vehicle Exit (Gate-Out)
│     ├── Active Visits
│     ├── Visit History
│     └── On-Demand TO                      [dealer + supplier create at assigned POI]
├── Scaling                                 [NEW — FB-007]
│     ├── Scale-In / Scale-Out
│     └── Queue Tokens / Gate Passes
├── Command Center                          [NEW — FB-007]
│     ├── Queue
│     ├── Bay Assignments
│     └── Waiting Serials
├── Loading                                 [NEW — FB-007]
│     ├── Load Events
│     └── Start Loading
└── Unloading                               [NEW — FB-007]
      ├── Unload Events
      └── Start Unloading
```

**Menu visibility mechanism:** No `portal_navigation.py` structural changes required. Yard sections already gate on `permission_any` and use `role_exclude` blocklists that do not include `depot_officer` / `feed_mill_officer`. Granting the operations permission codes in RBAC seed (§6) surfaces the menus automatically.

### Role → menu mapping (amended §0)

| Role | Requisition (FG) | Port Shipments | Gate | Scaling | Command Center | Loading | Unloading |
|------|-------------------|----------------|------|---------|----------------|---------|-----------|
| Depot / Feed Mill Officer | ✓ | ✗ | ✓ (assigned POI) | ✓ (assigned POI) | ✓ (assigned POI) | ✓ (assigned POI) | ✓ (assigned POI) |
| Commercial Officer | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |

---

## 3. Role gates & access control (amended §5)

### 3.1 PR type restrictions — unchanged

| Role | Can Create | Menu visible |
|------|------------|--------------|
| Depot / Feed Mill Officer | FG PR only | Requisition → Finished Goods + yard modules (§2) |
| Commercial Officer | Port Shipment only | Port Shipments (top-level) |

`pr_type` remains auto-selected from role. Wrong type via API → `403 Forbidden`.

### 3.2 POI scope — new (v2.0)

Depot / Feed Mill Officer is a **local role**:

```python
# apps/users/yard_constants.py
POI_SCOPED_ROLE_CODES = frozenset({
    "gateman",
    "scaling_operator",
    "command_center_officer",
    "loading_personnel",
    "unloading_personnel",
    "qc_inspector_physical",
    "depot_officer",        # FB-007
    "feed_mill_officer",    # FB-007
})
```

**Assignment:** On user invite or edit, Tenant Admin must select **Site (POI)**. System creates/updates:

```python
UserOperationalPOI(
    user=<officer>,
    poi=<assigned_site>,
    role=<depot_officer | feed_mill_officer>,
    is_primary=True,
)
```

**Resolution at runtime** (shared with yard modules — `apps/operations/yard_poi.py`):

1. Session/URL override (`dfms_active_poi_id` / `?active_poi=`) — only if POI is in user's assignments for that role.
2. Primary `UserOperationalPOI` for the matched role code.

**Fail-closed:** If no assignment → empty querysets, warning banner, `403` on stock API, no `destination_poi` options.

### 3.3 Action permissions — amended

| Action | Depot / Feed Mill Officer (v2.0) |
|--------|----------------------------------|
| Create FG PR | ✓ — `destination_poi` read-only, fixed to assigned POI |
| View own PR list | ✓ — unchanged |
| View stock snapshot | ✓ — assigned POI only |
| Gate-In / Gate-Out | ✓ — assigned POI |
| On-demand TO (dealer / supplier) | ✓ — assigned POI |
| Scale-In / Scale-Out | ✓ — assigned POI |
| CC queue / bay assign | ✓ — assigned POI |
| Start / complete loading | ✓ — assigned POI |
| Start / complete unloading | ✓ — assigned POI |
| Cross-POI data access | ✗ — fail-closed |

---

## 4. FG PR — destination POI behaviour (amended §6.2)

### 4.1 v1.1 behaviour (superseded for depot/feed-mill)

```python
# v1.1 — editable dropdown of all active POIs
kwargs["queryset"] = POI.objects.filter(is_active=True)
```

### 4.2 v2.0 behaviour (FB-007)

For `depot_officer` and `feed_mill_officer` only, `destination_poi` is **read-only** and always equals the officer's assigned POI.

```python
def assigned_poi_for_requester(user, role_code: str) -> POI | None:
  """Return primary UserOperationalPOI for role, or None."""
  return get_working_poi_for_user(user, role_code=role_code)  # yard_poi helper

def destination_poi_for_requester(user) -> POI | None:
  role = get_primary_role_code(user)
  if role in ("depot_officer", "feed_mill_officer"):
    return assigned_poi_for_requester(user, role)
  return None  # other roles use normal dropdown
```

**Admin (`ProductRequisitionAdmin` / `_PRBaseAdmin`):**

| Control | Behaviour |
|---------|-----------|
| `formfield_for_foreignkey` | Queryset = assigned POI only (single row) |
| `get_form` / `get_readonly_fields` | Add `destination_poi` to `readonly_fields` for depot/feed-mill |
| Initial value | Set from primary `UserOperationalPOI` (authoritative); fall back to `InvitationToken.poi` only if no assignment yet |
| Widget | Display POI name; field not editable — officer cannot override |

**REST (`ProductRequisitionViewSet.create`):**

- If `destination_poi_id` omitted → auto-set to assigned POI.
- If provided and ≠ assigned POI → `403 Forbidden`.
- If no assignment → `403 Forbidden`.

### 4.3 v1.1 comparison (superseded for depot/feed-mill)

v1.1 allowed an editable dropdown of all active POIs with optional pre-fill. v2.0 removes editability for POI-scoped requesters — the field is informational only on the PR form.

### 4.4 Inventory capacity snapshot (amended §6.3)

Widget behaviour unchanged (informational, non-blocking). **Access rule amended:**

| Surface | v1.1 | v2.0 (depot/feed-mill) |
|---------|------|------------------------|
| Admin AJAX `poi_stock_snapshot_api` | Any POI if `has_stock_read_permission` | Assigned POI only → `403` otherwise |
| PR form widget | Loads snapshot for selected `destination_poi` | `destination_poi` is read-only, fixed to assigned POI → widget always scoped |

---

## 5. Yard operations access (cross-module — FB-007)

Requisition officers gain yard access via **permission grants + admin framework extension**, not a new role per module.

### 5.1 Why framework change is required

Each yard `ModelAdmin` base hardcodes a single `operator_role_code` (e.g. `"gateman"`). `YardAdminBase._yard_role()` only matches that code. A depot officer has `role_code=depot_officer`, so they would **never** enter the operator branch even with correct permissions.

### 5.2 YardAdminBase extension

**File:** `apps/operations/admin_base.py`

| Change | Detail |
|--------|--------|
| New class attr | `extra_operator_role_codes: frozenset[str] = frozenset({"depot_officer", "feed_mill_officer"})` on each yard base |
| `_yard_role()` | Match `operator_role_code` **or** any code in `extra_operator_role_codes` |
| `_is_operator(role)` | `bool(role) and role not in supervisor_role_codes` — replaces `role == self.operator_role_code` |
| `_scope_poi_id()` | Resolve POI using **matched role** (not hardcoded `operator_role_code`) |
| `get_queryset()` | Use `_is_operator(role)` for fail-closed POI filter |

**Declare on each base:**

| Admin base | File | `extra_operator_role_codes` |
|------------|------|----------------------------|
| `GateAdminBase` | `gate/admin.py` | `{"depot_officer", "feed_mill_officer"}` |
| `ScaleAdminBase` | `scaling/admin.py` | same |
| `CCAdminBase` | `command_center/admin.py` | same |
| `LoadEventAdminBase` | `loading/admin.py` | same |
| `UnloadEventAdminBase` | `loading/admin.py` | same |

**Additional call sites** (duplicate `role == self.operator_role_code` — must update in lockstep):

- `CCAdminBase._has_perm` — `command_center/admin.py`
- `_LUPScopedAdmin.get_queryset` — `command_center/admin.py`
- `_LDAdminMixin.get_queryset` — `loading/admin.py`
- `GateOnDemandTORequestAdmin.get_queryset` — `gate/admin.py`

### 5.3 POI scoping flow (one assignment → all modules)

```
UserOperationalPOI(user=officer, role=depot_officer, poi=Depot-A, is_primary=True)
  │
  ├─► GateAdminBase._scope_poi_id(role_code="depot_officer") → Depot-A
  ├─► GateOnDemandTORequestAdmin (dealer/supplier) → Depot-A
  ├─► ScaleAdminBase._scope_poi_id(role_code="depot_officer") → Depot-A
  ├─► CCAdminBase._scope_poi_id(role_code="depot_officer") → Depot-A
  ├─► LoadEventAdminBase._scope_poi_id(role_code="depot_officer") → Depot-A
  ├─► UnloadEventAdminBase._scope_poi_id(role_code="depot_officer") → Depot-A
  ├─► ProductRequisitionAdmin destination_poi → Depot-A (read-only)
  └─► poi_stock_snapshot_api(poi_id=Depot-A) → allowed; other POIs → 403
```

No per-module assignment rows required.

---

## 6. RBAC seed — permission grants

**File:** `apps/core/role_seed_data.py`

Add to **both** `depot_officer` and `feed_mill_officer` permission lists (mirror gateman + yard specialist roles; exclude QC):

| Permission group | Codes |
|------------------|-------|
| Gate | `MENU_GATE_VIEW`, `MENU_GATE_ON_DEMAND_VIEW`, `OPERATIONS_GATE_ENTRY_CREATE`, `OPERATIONS_GATE_ENTRY_READ`, `OPERATIONS_GATE_EXIT_WRITE`, `OPERATIONS_GATE_REMARKS_WRITE`, `OPERATIONS_GATE_ON_DEMAND_DEALER`, `OPERATIONS_GATE_ON_DEMAND_SUPPLIER` |
| Scaling | `MENU_SCALING_VIEW`, `OPERATIONS_SCALING_READ`, `OPERATIONS_SCALING_WRITE` |
| Command Center | `MENU_COMMAND_CENTER_VIEW`, `OPERATIONS_CC_READ`, `OPERATIONS_CC_WRITE` |
| Loading | `OPERATIONS_LOADING_READ`, `OPERATIONS_LOADING_WRITE` |
| Unloading | `OPERATIONS_UNLOADING_READ`, `OPERATIONS_UNLOADING_WRITE` |
| Supporting reads | `TRANSPORT_TO_READ`, `MASTER_DATA_POI_READ`, `MASTER_DATA_VEHICLE_READ`, `MASTER_DATA_DRIVER_READ`, `MASTER_DATA_HELPER_READ`, `MASTER_DATA_LUP_READ`, `MASTER_DATA_DEALER_READ`, `MASTER_DATA_SUPPLIER_READ`, `MASTER_DATA_PRODUCT_READ` |

**Existing permissions retained:** `MENU_DASHBOARD_VIEW`, `REQUISITION_TR_CREATE`, `REQUISITION_TR_READ`, `MENU_REQUISITION_FG_VIEW`, `OPERATIONS_STOCK_READ`.

**Apply:** `python manage.py seed_dfms_rbac` (or `--reset` in dev).

---

## 7. Implementation phases

### Phase 1 — POI-scoping framework

| Step | File | Action |
|------|------|--------|
| 1.1 | `apps/users/yard_constants.py` | Add `depot_officer`, `feed_mill_officer` to `POI_SCOPED_ROLE_CODES` |
| 1.2 | `apps/operations/admin_base.py` | `extra_operator_role_codes`, `_is_operator`, `_yard_role`, `_scope_poi_id`, `get_queryset` |
| 1.3 | `gate/admin.py`, `scaling/admin.py`, `command_center/admin.py`, `loading/admin.py` | Set `extra_operator_role_codes`; fix duplicate operator checks |
| 1.4 | `apps/core/role_seed_data.py` | Add yard permission codes to both roles |
| 1.5 | — | Run `seed_dfms_rbac` |

**Verify:** Depot officer with `UserOperationalPOI` can open Gate/Scale/CC/Loading/Unloading changelists and see only their POI's records.

### Phase 2 — Requisition POI tightening

| Step | File | Action |
|------|------|--------|
| 2.1 | `apps/requisitions/admin.py` — `_PRBaseAdmin` / `ProductRequisitionAdmin` | `destination_poi` read-only + queryset restricted to assigned POI for depot/feed-mill |
| 2.2 | `apps/requisitions/admin.py` — `get_form` / `get_readonly_fields` | Pre-fill from `UserOperationalPOI`; add `destination_poi` to readonly fields |
| 2.3 | `apps/requisitions/admin.py` — `poi_stock_snapshot_api` | Assigned-POI check for depot/feed-mill |
| 2.4 | `apps/requisitions/views.py` — `ProductRequisitionViewSet.create` | Validate `destination_poi_id` against assignment |

**Verify:** Cannot create PR or load stock widget for a POI other than assigned site; `destination_poi` is not editable on the PR form.

### Phase 3 — Tests

| Area | Cases |
|------|-------|
| Yard admins | With assignment → read/write at POI only; without assignment → fail-closed; cross-POI blocked |
| PR admin | `destination_poi` read-only; pre-fill from assignment; cannot change via form POST |
| Stock API | `403` for wrong POI; `200` for assigned POI |
| On-demand TO | Depot officer can create dealer/supplier on-demand TO at assigned gate POI |
| REST create | `403` when `destination_poi_id` ≠ assigned POI |
| User admin | Site required on invite/edit for both roles |
| Regression | `gateman`, `scaling_operator`, etc. unchanged |

### Phase 4 — Rollout

1. Deploy code + run RBAC seed.
2. Tenant Admin assigns **Site (POI)** to every existing depot/feed-mill user via User admin (`UserOperationalPOI` inline).
3. Users without assignment see empty yard screens and cannot create PRs until assigned.

---

## 8. Code touchpoint summary

```
apps/users/yard_constants.py              POI_SCOPED_ROLE_CODES
apps/users/admin.py                       (no code change — inherits role_requires_operational_poi)
apps/operations/admin_base.py             YardAdminBase framework
apps/operations/yard_poi.py               (no change — reuse get_working_poi_for_request)
apps/operations/gate/admin.py             GateAdminBase + GateOnDemandTORequestAdmin
apps/operations/scaling/admin.py          ScaleAdminBase
apps/operations/command_center/admin.py   CCAdminBase + _LUPScopedAdmin
apps/operations/loading/admin.py          _LDAdminMixin + Load/UnloadEventAdminBase
apps/core/role_seed_data.py               SEED_ROLES permission lists
apps/core/portal_navigation.py            (no change)
apps/requisitions/admin.py                destination_poi + stock API
apps/requisitions/views.py                REST create validation
apps/requisitions/role_access.py          (optional helper: assigned_poi_for_role)
```

---

## 9. Business rules (amended §12)

### 12.1 PR type gate — add POI scope

```
Depot/Feed Mill Officer:
  - pr_type is always FINISHED_GOODS
  - destination_poi_id MUST equal assigned UserOperationalPOI.poi_id (read-only on form; not overridable)
  - Stock snapshot API only for assigned POI
  - Yard operations scoped to assigned POI (fail-closed)
  - On-demand TO (dealer + supplier) at assigned gate POI
  - Port Shipment form/endpoint returns 403
```

### 12.2 Draft vs submit validation — unchanged

`destination_poi_id` still required on draft save; v2.0 adds that the only valid value for depot/feed-mill is their assigned POI.

---

## 10. Integration points (amended §16)

### 10.1 Upstream dependencies

| Module | FB-007 usage |
|--------|--------------|
| `01-foundation` (RBAC) | Extended role seed; `POI_SCOPED_ROLE_CODES` |
| `01-foundation` (user-tenant-management) | `UserOperationalPOI` assignment on invite/edit |
| MDM-04 (POI Master) | Assigned site reference |
| `06-poi-operations` (YARD-01) | `YardAdminBase`, `yard_poi` resolution pattern |
| `06-poi-operations` (stock) | `has_stock_read_permission` + assigned-POI guard |

### 10.2 Downstream consumers — unchanged

Distribution and Procurement workflows are unaffected. FG PRs still route to Distribution; only the requester's POI scope is tighter.

---

## 11. Related documentation

- **[Product Requisition Management (v1.1 — baseline)](./product-requisition-management.md)**
- **[FB-007 Feedback Tracker](../../03-backlog/sprints/sprint-6/feedback-resolution.md#fb-007--depot-officer--feed-mill-officer-become-poi-scoped-local-roles-with-full-yard-operations-access)**
- **[YARD-01 — POI-scoped yard platform](../../03-backlog/sprints/sprint-5/10-yard-foundation/YARD-01-poi-scoped-yard-platform.md)**
- **[BUG-06 — Tenant admin POI access](../../03-backlog/sprints/sprint-6/06-bug-fixes/BUG-06-tenant-admin-poi-access-not-enforced.md)**
- **[User Tenant Management — POI Assignment](../01-foundation/user-tenant-management.md)**
- **[Stock Operations (Sprint 5)](../06-poi-operations/stock-operations-sprint5.md)**
- **[Gate Operations (Sprint 4)](../06-poi-operations/gate-operations-sprint4.md)**
- **[Command Center & Loading (Sprint 4)](../06-poi-operations/command-center-loading-sprint4.md)**

---

## 12. Implementation TODOs

- [ ] **FB-007-1** — `yard_constants.py`: add roles to `POI_SCOPED_ROLE_CODES`
- [ ] **FB-007-2** — `admin_base.py`: `extra_operator_role_codes` + `_is_operator` framework
- [ ] **FB-007-3** — Yard admin bases: declare extra roles; fix duplicate operator checks (gate, scale, CC, loading)
- [ ] **FB-007-4** — `role_seed_data.py`: yard permission grants for depot/feed-mill
- [ ] **FB-007-5** — `requisitions/admin.py`: `destination_poi` read-only + queryset restriction + stock API POI guard
- [ ] **FB-007-6** — `requisitions/views.py`: REST create `destination_poi_id` validation
- [ ] **FB-007-7** — Tests: yard scoping, PR POI restriction, stock API, regression
- [ ] **FB-007-8** — Rollout: backfill `UserOperationalPOI` for existing users; run `seed_dfms_rbac`
