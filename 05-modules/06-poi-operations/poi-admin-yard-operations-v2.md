---
module: 06-poi-operations
specification: POI-Admin — POI-Scoped Yard Operations Super-User (Sprint 6 — FB-014)
version: 2.0
phase: Phase 1
sprint: Sprint 6 (FB-014)
last_updated: 2026-07-07
changelog: "v2.0 — FB-014: new POI-Admin role (`poi_admin`) with full yard-module access at one assigned POI; mandatory POI on invite/assignment; distinct from FB-007 depot/feed-mill officers (no PR duties)."
related_stories: YARD-01 (amendment), US-005 (invitation POI gate)
feedback_items: FB-014
supersedes: yard single-function operator model for site-level yard administration
baseline_spec: command-center-loading-sprint4.md, gate-operations-sprint4.md, qc-operations-sprint4.md; YARD-01 poi-scoped-yard-platform
feedback_tracker: ../../03-backlog/sprints/sprint-6/feedback-resolution/README.md
---

# POI-Admin — POI-Scoped Yard Operations Super-User (FB-014)

## Overview

This document is the **Sprint 6 implementation plan v2** for [FB-014](../../03-backlog/sprints/sprint-6/feedback-resolution/04-yard-and-stock.md#fb-014--poi-admin-role-poi-scoped-yard-operations-super-user).

**Problem (client feedback — 2026-07-07):** Yard work at a site is split across single-function POI-scoped roles (Gateman, Scaling Operator, Command Center Officer, Loading, Unloading, QC Inspector). Operations need one **site-level yard administrator** who can run **every yard module** at **one POI** without juggling multiple role assignments. When provisioning that user, the inviting admin must **select the POI** — assignment is not optional.

**Solution (FB-014 scope):**

1. Seed role **POI-Admin** (`poi_admin`, display name **POI-Admin**).
2. Grant **all yard operation permissions** at the assigned POI (Gate, Scaling, Command Center, Loading, Unloading, QC Checkpoint).
3. Register `poi_admin` in `POI_SCOPED_ROLE_CODES` — same fail-closed `UserOperationalPOI` + `yard_poi.get_working_poi_for_request` pattern as YARD-01.
4. **Mandatory POI** on staff invite and user-admin role assignment (existing `role_requires_operational_poi` path).
5. Wire `poi_admin` into every `YardAdminBase` subclass via `extra_operator_role_codes` (same extension pattern as FB-007 `depot_officer` / `feed_mill_officer`).

**Primary module paths:** `apps/core/role_seed_data.py`, `apps/users/yard_constants.py`, `apps/operations/*/admin.py`, `apps/quality/checkpoint/admin.py`  
**Invitation / user admin:** `apps/users/admin.py`, `apps/users/invitation_service.py`, `apps/users/invitation_constants.py`

**Distinct from [FB-007](../../03-backlog/sprints/sprint-6/feedback-resolution/04-yard-and-stock.md#fb-007--depot-officer--feed-mill-officer-become-poi-scoped-local-roles-with-full-yard-operations-access):** Depot Officer and Feed Mill Officer keep **Product Requisition** requester duties plus yard access. **POI-Admin** is yard-only — no `REQUISITION_TR_CREATE`, no PR menus unless separately granted.

**Coordinate with:** [tenant-user-management-v2.md](../03-users/tenant-user-management-v2.md) — Tenant Super Admin and Tenant Admin delegates invite POI-Admin.

**Out of scope:** E2E / Playwright (`tests/e2e/`); mobile yard apps; org-wide tenant admin powers; multi-POI assignment per user; POI master-data setup (Tenant Admin only).

---

## 0. Yard chain — POI-Admin placement

```
Tenant Admin / Tenant Super Admin
    └── invites POI-Admin + selects POI (mandatory)
            └── UserOperationalPOI (is_primary=True)
                    └── Working POI session (yard_poi)
                            ├── Gate-In / Gate-Out
                            ├── Scaling (scale-in / scale-out)
                            ├── Command Center (bay assign)
                            ├── Loading
                            ├── Unloading
                            └── QC Checkpoint (when RM QC applies at site)
```

**Fail-closed:** No `UserOperationalPOI` for `poi_admin` → yard admin querysets return empty; same as Gateman today.

**Not a supervisor:** POI-Admin remains **POI-scoped** — unlike `tenant_admin` / `gate_supervisor`, cannot see all POIs. Cannot operate cross-site.

---

## 0.1 Scope boundary

| In scope (FB-014) | Out of scope / deferred |
|-------------------|-------------------------|
| `poi_admin` role seed + RBAC permissions | Tenant admin hierarchy (FB-016 / tenant-user-management-v2) |
| `POI_SCOPED_ROLE_CODES` + invite POI gate | Per-POI permission tuning (all modules or subset) |
| `extra_operator_role_codes` on all yard admins | GPS maps dashboard (not a yard queue module) |
| Gate write-role tuple update | E2E tests |
| Dashboard widgets for POI-Admin (aggregate yard KPIs) | Stock **write** / opening balance (Tenant Admin) |
| Unit + integration tests | POI-Admin inviting other users |

### Locked product decisions (implementation defaults)

| Topic | Decision | Rationale |
|-------|----------|-----------|
| Display name | **POI-Admin** | Client wording |
| Seed code | `poi_admin` | snake_case catalog convention |
| Department | `operations` (`PredefinedDepartment.OPERATIONS`) | Multi-module yard persona; visible in invite picker under Operations |
| POI assignment | **Exactly one** primary POI per user (same as other scoped roles) | YARD-01 single working site |
| Stock snapshot read | **Include** `OPERATIONS_STOCK_READ` | Site officer needs plan vs actual context at unload; matches FB-007 yard block |
| PR creation | **Exclude** all `REQUISITION_TR_CREATE` / PR menus | FB-014 distinction from depot/feed-mill |
| QC access | **Include** read + write on QC Checkpoint | Client: "all yard operations" including QC when applicable |
| `_yard_role` resolution | Return `poi_admin` when user holds only that role | `extra_operator_role_codes` on each `YardAdminBase` |
| Test coverage | **Unit + integration only** | No E2E / Playwright |

---

## 1. Current vs expected behaviour

| Aspect | Current | Expected (FB-014) |
|--------|---------|-------------------|
| Site yard super-user role | None | `poi_admin` — **POI-Admin** |
| Full yard modules at one POI | Split across 6+ roles or FB-007 site officers (+ PR) | Single role, yard modules only |
| `POI_SCOPED_ROLE_CODES` | gateman, scaling, CC, load, unload, QC, depot, feed-mill | + `poi_admin` |
| Invite / user save without POI | N/A for `poi_admin` | Blocked (`role_requires_operational_poi`) |
| Yard admin `extra_operator_role_codes` | `depot_officer`, `feed_mill_officer` (FB-007) | + `poi_admin` |
| QC admin operator bypass | `qc_inspector_physical` only (+ supervisors) | + `poi_admin` via `extra_operator_role_codes` |
| Gate write roles | includes depot/feed-mill | + `poi_admin` |
| Portal / dashboard | Per single-function role | POI-Admin sees combined yard widgets at assigned POI |

---

## 2. RBAC — role seed

### 2.1 New role tuple

**File:** `apps/core/role_seed_data.py`

```python
(
    "poi_admin",
    "POI-Admin",
    PredefinedDepartment.OPERATIONS,
    [
        PermissionCodes.MENU_DASHBOARD_VIEW,
        # Yard — Gate
        PermissionCodes.TRANSPORT_TO_READ,
        PermissionCodes.MENU_GATE_VIEW,
        PermissionCodes.MENU_GATE_ON_DEMAND_VIEW,
        PermissionCodes.OPERATIONS_GATE_ENTRY_CREATE,
        PermissionCodes.OPERATIONS_GATE_ENTRY_READ,
        PermissionCodes.OPERATIONS_GATE_EXIT_WRITE,
        PermissionCodes.OPERATIONS_GATE_REMARKS_WRITE,
        PermissionCodes.OPERATIONS_GATE_ON_DEMAND_DEALER,
        PermissionCodes.OPERATIONS_GATE_ON_DEMAND_SUPPLIER,
        # Yard — Scaling
        PermissionCodes.MENU_SCALING_VIEW,
        PermissionCodes.OPERATIONS_SCALING_READ,
        PermissionCodes.OPERATIONS_SCALING_WRITE,
        # Yard — Command Center
        PermissionCodes.MENU_COMMAND_CENTER_VIEW,
        PermissionCodes.OPERATIONS_CC_READ,
        PermissionCodes.OPERATIONS_CC_WRITE,
        # Yard — Loading / Unloading
        PermissionCodes.OPERATIONS_LOADING_READ,
        PermissionCodes.OPERATIONS_LOADING_WRITE,
        PermissionCodes.OPERATIONS_UNLOADING_READ,
        PermissionCodes.OPERATIONS_UNLOADING_WRITE,
        # Yard — QC Checkpoint
        PermissionCodes.MENU_QC_CHECKPOINT_VIEW,
        PermissionCodes.OPERATIONS_QC_CHECKPOINT_READ,
        PermissionCodes.OPERATIONS_QC_CHECKPOINT_WRITE,
        # Context reads (TO panels, autocompletes — same as FB-007 yard block)
        PermissionCodes.OPERATIONS_STOCK_READ,
        PermissionCodes.MASTER_DATA_POI_READ,
        PermissionCodes.MASTER_DATA_VEHICLE_READ,
        PermissionCodes.MASTER_DATA_DRIVER_READ,
        PermissionCodes.MASTER_DATA_HELPER_READ,
        PermissionCodes.MASTER_DATA_LUP_READ,
        PermissionCodes.MASTER_DATA_DEALER_READ,
        PermissionCodes.MASTER_DATA_SUPPLIER_READ,
        PermissionCodes.MASTER_DATA_PRODUCT_READ,
    ],
),
```

**Explicitly excluded:** `REQUISITION_TR_CREATE`, `MENU_REQUISITION_FG_VIEW`, `MENU_REQUISITIONS_VIEW`, `MENU_USERS_VIEW`, master-data **write** permissions, `MENU_LIVE_GPS_VIEW`.

### 2.2 Shared permission helper (optional refactor)

Extract FB-007 yard permission block from `depot_officer` into `_yard_operator_permission_codes()` and reuse for `poi_admin` + depot/feed-mill to avoid drift. **Not required** for FB-014 if copy-paste is kept in sync — prefer helper if touching `role_seed_data` anyway.

### 2.3 Catalog constants

**File:** `apps/core/constants.py` — add `poi_admin` to role slug lists if maintained there.

Run: `python manage.py seed_dfms_rbac` (or `--reset` in dev).

---

## 3. POI scoping constants

**File:** `apps/users/yard_constants.py`

```python
POI_ADMIN_ROLE_CODE = "poi_admin"

POI_SCOPED_ROLE_CODES: frozenset[str] = frozenset(
    {
        ...
        "poi_admin",  # NEW — FB-014
    }
)

# Yard modules that accept site officers + POI-Admin as extra operators
YARD_MULTI_MODULE_OPERATOR_ROLE_CODES: frozenset[str] = frozenset(
    {*SITE_OFFICER_ROLE_CODES, POI_ADMIN_ROLE_CODE}
)
```

**File:** `apps/operations/admin_base.py`

```python
from apps.users.yard_constants import YARD_MULTI_MODULE_OPERATOR_ROLE_CODES

# Deprecate alias or repoint:
YARD_SITE_OFFICER_ROLE_CODES = YARD_MULTI_MODULE_OPERATOR_ROLE_CODES
```

All yard admins that today set `extra_operator_role_codes = YARD_SITE_OFFICER_ROLE_CODES` pick up `poi_admin` automatically after the repoint.

---

## 4. Yard admin wiring

### 4.1 YardAdminBase subclasses — verify `extra_operator_role_codes`

| Admin class | File | Action |
|-------------|------|--------|
| Gate admins | `apps/operations/gate/admin.py` | Uses `YARD_SITE_OFFICER_ROLE_CODES` — auto via §3 |
| Scaling | `apps/operations/scaling/admin.py` | Same |
| Command Center | `apps/operations/command_center/admin.py` | Same |
| Loading / Unloading | `apps/operations/loading/admin.py` | Same |
| QC Checkpoint | `apps/quality/checkpoint/admin.py` | **Add** `extra_operator_role_codes = YARD_SITE_OFFICER_ROLE_CODES` on `QCAdminBase` |

`QCAdminBase` today only declares `operator_role_code = "qc_inspector_physical"`. POI-Admin must be added as extra operator or QC screens stay inaccessible.

### 4.2 Gate write-role tuple

**File:** `apps/operations/gate/admin.py`

```python
_GATE_WRITE_ROLES = frozenset({
    "gateman", "gate_supervisor",
    "depot_officer", "feed_mill_officer",
    "poi_admin",  # NEW
})
```

Update any parallel role loops (~L97) that gate write actions by role code.

### 4.3 Transport TO autocomplete (QC)

**File:** `apps/transport/admin.py` — QC inspector POI scoping blocks (~L447–496): extend to resolve working POI when `user.has_role("poi_admin")` with `role_code="poi_admin"`.

### 4.4 `_yard_role` behaviour

No change to algorithm — `poi_admin` in `extra_operator_role_codes` is returned when user has that role and not the module's primary `operator_role_code`. POI-Admin users with **only** `poi_admin` get correct scoping on every module.

---

## 5. Invitation & user admin (mandatory POI)

Existing YARD-01 path covers FB-014 once `poi_admin ∈ POI_SCOPED_ROLE_CODES`:

| Surface | File | Behaviour |
|---------|------|-----------|
| `role_requires_operational_poi()` | `apps/users/yard_constants.py` | Returns `True` for `poi_admin` |
| `InviteUserForm` | `apps/users/admin.py` | Shows **Site (POI)** field; `clean()` requires POI |
| `UserAdminForm.clean()` | same | POI required on role change |
| `create_invitation()` | `apps/users/invitation_service.py` | `_resolve_invitation_poi` enforced |
| `activate_invitation()` | same | `UserOperationalPOI` row created from `inv.poi_id` |
| `UserOperationalPOIInline` | `apps/users/admin.py` | Role dropdown includes `poi_admin` |

### 5.1 Invitation department allowlist

**File:** `apps/users/invitation_constants.py`

```python
PredefinedDepartment.OPERATIONS: frozenset(
    {
        "command_center_officer",
        "loading_personnel",
        "unloading_personnel",
        "driver_supervisor",
        "driver",
        "driver_helper",
        "poi_admin",  # NEW
    }
),
```

Inviter: Tenant Admin or Tenant Super Admin (any `is_tenant_admin` user).

### 5.2 Invite form help text

Update `InviteUserForm.operational_poi` help_text to mention **POI-Admin** alongside gate/scale/CC/load/unload/QC roles.

---

## 6. Portal navigation & dashboard

### 6.1 Portal navigation

**File:** `apps/core/portal_navigation.py`

Add `poi_admin` to role lists for yard menu sections (Gate, Scaling, Command Center, Loading, Unloading, QC Checkpoint) — mirror how `gateman`, `scaling_operator`, etc. appear in `permission_any` / role allowlists.

### 6.2 Dashboard widgets

**File:** `apps/core/dashboard_service.py`

```python
if _has("poi_admin"):
    widgets += _poi_admin_widgets(user, request)

def _poi_admin_widgets(user, request) -> list[dict]:
    poi_id = _get_poi_id(user, request, "poi_admin")
    if not poi_id:
        return []
    # Reuse existing builders with poi_id + role_code override where needed:
    widgets = []
    widgets += _gateman_widgets(user, request)       # or thin wrappers passing poi_id
    widgets += _scaling_operator_widgets(user, request)
    # ... CC, loading, unloading, QC — dedupe by widget id if overlap
    return widgets
```

Prefer **composing** existing `_gateman_widgets` etc. only if they honour `_get_poi_id` for `poi_admin`; otherwise pass `poi_id` explicitly to avoid empty widgets.

---

## 7. Implementation phases & ordered steps

### Phase 1 — Role seed & constants

| Step | File(s) | Change |
|------|---------|--------|
| 1 | `apps/core/role_seed_data.py` | Add `poi_admin` tuple |
| 2 | `manage.py seed_dfms_rbac` | Seed role in public schema |
| 3 | `apps/users/yard_constants.py` | Add to `POI_SCOPED_ROLE_CODES`; `YARD_MULTI_MODULE_OPERATOR_ROLE_CODES` |
| 4 | `apps/operations/admin_base.py` | Repoint `YARD_SITE_OFFICER_ROLE_CODES` |
| 5 | `apps/users/invitation_constants.py` | Add `poi_admin` under Operations |
| 6 | Tests | `test_yard_constants.py` — `role_requires_operational_poi("poi_admin")` |

### Phase 2 — Yard admin & gate write access

| Step | File(s) | Change |
|------|---------|--------|
| 7 | `apps/quality/checkpoint/admin.py` | `QCAdminBase.extra_operator_role_codes` |
| 8 | `apps/operations/gate/admin.py` | `_GATE_WRITE_ROLES` + role loops |
| 9 | `apps/transport/admin.py` | QC TO autocomplete POI for `poi_admin` |
| 10 | Verify gate/scaling/CC/loading admins | No file change if §4 repoint works — smoke test |
| 11 | Tests | Extend `test_yard_admin_fb007.py` → `test_yard_admin_poi_admin.py` |

### Phase 3 — Invite flow & portal

| Step | File(s) | Change |
|------|---------|--------|
| 12 | `apps/users/admin.py` | Help text; confirm POI validation on invite |
| 13 | `apps/core/portal_navigation.py` | Menu visibility for `poi_admin` |
| 14 | `apps/core/dashboard_service.py` | `_poi_admin_widgets` |
| 15 | Tests | `test_invitation_service.py` — invite poi_admin requires poi_id |
| 16 | Tests | `test_fb007_poi_scoped_requesters.py` pattern for poi_admin |

### Phase 4 — Docs & tracker

| Step | File(s) | Change |
|------|---------|--------|
| 17 | `feedback-resolution.md` | FB-014 → link this doc; sub-task IDs |
| 18 | `01-source/03-sow/user-roles.md` | Role table row |
| 19 | `docs/architecture/poi-scoped-roles.md` | Catalog amend |

---

## 8. Story mapping (proposed sub-tasks)

| Sub-task | Phase | Scope |
|----------|-------|-------|
| FB-014-1 | 1 | RBAC seed `poi_admin` |
| FB-014-2 | 1 | `POI_SCOPED_ROLE_CODES` + yard multi-module constant |
| FB-014-3 | 2 | Yard admin `extra_operator_role_codes` (+ QC base) |
| FB-014-4 | 2 | Gate write roles |
| FB-014-5 | 3 | Invitation allowlist + mandatory POI tests |
| FB-014-6 | 3 | Portal nav + dashboard widgets |
| FB-014-7 | 3 | Unit + integration tests (no E2E) |

---

## 9. Acceptance criteria (FB-014)

### Role & permissions

- [ ] Role **POI-Admin** (`poi_admin`) exists in seeded catalog with yard + QC checkpoint permissions
- [ ] Role does **not** include PR creation or user-management permissions
- [ ] `poi_admin ∈ POI_SCOPED_ROLE_CODES`

### POI assignment

- [ ] Staff invite with `poi_admin` **without** POI is rejected (form + API)
- [ ] Activation creates `UserOperationalPOI` with selected POI and `is_primary=True`
- [ ] User change form requires POI when role set to POI-Admin

### Yard operations (at assigned POI only)

- [ ] POI-Admin can open and write Gate, Scaling, CC, Loading, Unloading admin queues for assigned POI
- [ ] POI-Admin can open and write QC Checkpoint for assigned POI (RM inbound QC TOs at that site)
- [ ] Querysets return **no rows** when user has no `UserOperationalPOI` (fail-closed)
- [ ] Querysets return **no rows** for TOs at other POIs
- [ ] POI-Admin cannot access tenant-wide master-data admin or user invite screens (unless also holds another role)

### Regression

- [ ] Existing single-function roles unchanged
- [ ] FB-007 depot/feed-mill officers unchanged
- [ ] Tenant Admin yard supervisor bypass unchanged

---

## 10. Test plan (unit & integration only)

**E2E / Playwright is out of scope.** Do not add or amend `tests/e2e/` for FB-014.

| Test module | Cases |
|-------------|-------|
| `test_yard_admin_poi_admin.py` | `_yard_role` → `poi_admin`; queryset scoped to POI; fail-closed without assignment |
| `test_yard_constants.py` | `role_requires_operational_poi("poi_admin")` |
| `test_users/test_invitation_service.py` | Create invitation with `poi_admin` + `poi_id`; reject without `poi_id` |
| `test_users/test_admin.py` | `InviteUserForm` POI required for poi_admin |
| `test_operations/test_gate_poi_fb007.py` (extend) | Gate write allowed for poi_admin |
| `test_core/test_portal_navigation.py` | Menus visible for poi_admin permission set |
| RBAC seed test | `poi_admin` permissions include QC + gate, exclude PR create |

---

## 11. Open questions (PO)

| ID | Question | Default if silent |
|----|----------|-------------------|
| OQ-1 | Include **read-only GPS / live map** at POI? | **No** — yard queues only |
| OQ-2 | **Stock snapshot** read at POI? | **Yes** — `OPERATIONS_STOCK_READ` (§0.1) |
| OQ-3 | POI-Admin at **port berth** vs **depot** — same permission set? | **Yes** — lane differences enforced by TO/queue rules, not role split |
| OQ-4 | Can one user hold **POI-Admin + Gateman** (two roles)? | **Discouraged** — single-role system replaces assignment; if dual role exists, `_yard_role` prefers primary module operator code |
| OQ-5 | Dashboard: one combined panel vs all per-role widgets? | **Combined** — `_poi_admin_widgets` composes yard KPIs |

---

## 12. Cross-references

| Document | Relationship |
|----------|--------------|
| [feedback-resolution.md §FB-014](../../03-backlog/sprints/sprint-6/feedback-resolution/04-yard-and-stock.md#fb-014--poi-admin-role-poi-scoped-yard-operations-super-user) | Source feedback item |
| [feedback-resolution.md §FB-007](../../03-backlog/sprints/sprint-6/feedback-resolution/04-yard-and-stock.md#fb-007--depot-officer--feed-mill-officer-become-poi-scoped-local-roles-with-full-yard-operations-access) | Prior art — `extra_operator_role_codes` pattern |
| [tenant-user-management-v2.md](../03-users/tenant-user-management-v2.md) | Who invites POI-Admin |
| [poi-scoped-roles.md](../../../../docs/architecture/poi-scoped-roles.md) | YARD-01 scoping architecture |
| [qc-operations-v2.md](./qc-operations-v2.md) | QC module; POI-Admin gets checkpoint access |

---

## 13. Code anchor index (current baseline)

| Concern | File | Symbol / area |
|---------|------|----------------|
| POI-scoped catalog | `apps/users/yard_constants.py` | `POI_SCOPED_ROLE_CODES`, `role_requires_operational_poi` |
| FB-007 extra operators | `apps/operations/admin_base.py` | `YARD_SITE_OFFICER_ROLE_CODES` |
| Depot yard permissions | `apps/core/role_seed_data.py` | `depot_officer` permission list ~L82–109 |
| QC operator | `apps/quality/checkpoint/admin.py` | `QCAdminBase` — no `extra_operator_role_codes` yet |
| Invite POI gate | `apps/users/admin.py` | `InviteUserForm.clean()` ~L1362 |
| POI on activation | `apps/users/invitation_service.py` | `activate_invitation` → `UserOperationalPOI` |
| Gate write roles | `apps/operations/gate/admin.py` | `_GATE_WRITE_ROLES` ~L80 |
