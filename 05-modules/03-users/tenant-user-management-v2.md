---
module: 03-users
specification: Tenant User Management — Tenant Super Admin & Delegated Tenant Admin (Sprint 6)
version: 2.0
phase: Phase 1
sprint: Sprint 6
last_updated: 2026-07-07
changelog: "v2.0 — Split platform-provisioned Tenant Admin into Tenant Super Admin; introduce invitable Tenant Admin delegates with identical org-wide power except cannot mint Tenant Admin / Tenant Super Admin. Amends baseline user-tenant-management.md §2.1 hierarchy, §2.3 provisioning, US-005 invitation rules."
related_stories: US-005, US-006, US-007, US-009, PAP-05, PAP-06
feedback_items: FB-016
supersedes: user-tenant-management.md §2.1 (three-level hierarchy), §2.3 (single Tenant Admin), US-005 invitation never-assign tenant_admin
baseline_spec: ../01-foundation/user-tenant-management.md
feedback_tracker: ../../03-backlog/sprints/sprint-6/feedback-resolution.md
---

# Tenant User Management — Tenant Super Admin & Delegated Tenant Admin (v2)

## Overview

This document is the **Sprint 6 backend implementation plan v2** for splitting today's single **Tenant Admin** into two personas:

| Persona | Display name | Seed code | Created by |
|---------|--------------|-----------|------------|
| **Tenant Super Admin** | Tenant Super Admin | `tenant_super_admin` | Platform Super Admin (tenant provisioning only) |
| **Tenant Admin (delegate)** | Tenant Admin | `tenant_admin` | Tenant Super Admin (staff invitation) |

**Problem (client feedback — 2026-07-07):** Each tenant has exactly **one** provisioned admin (`is_tenant_admin=True`, role `tenant_admin`) who cannot be created through the normal invite flow. Operations need **multiple org-wide administrators**, but only the **first** (super) admin should be able to **create more tenant admins**. Delegates must otherwise match super-admin capabilities (master data, users, configuration, yard supervisor bypass, etc.).

**Solution (v2 scope):**

1. Rename the **platform-provisioned** first admin to **Tenant Super Admin** (`tenant_super_admin`).
2. Allow Tenant Super Admin to **invite one or more Tenant Admin** users via the existing US-005 staff-invite flow.
3. **Tenant Admin delegates** receive the **same permission catalog** as Tenant Super Admin but **cannot** invite or assign `tenant_admin` / `tenant_super_admin`.
4. Keep `User.is_tenant_admin=True` as the **full-access bypass** for **both** personas (~60 call sites) — add `User.is_tenant_super_admin` for elevation-only actions.

**Primary module path:** `apps/users/`, `apps/tenants/`  
**Cross-module touch paths:** `apps/core/role_seed_data.py`, `apps/core/rbac_service.py`, `apps/notifications/email.py`

**Coordinate with (separate item):** [FB-014](../../03-backlog/sprints/sprint-6/feedback-resolution.md#fb-014--poi-admin-role-poi-scoped-yard-operations-super-user) — POI-Admin role; both Tenant Super Admin and Tenant Admin may invite POI-Admin with mandatory POI.

**Out of scope:** Changing operational-role invitation rules; POI-Admin implementation (FB-014); mobile app role picker; permission-matrix UI redesign; **E2E / Playwright tests** (unit + integration only — see §12).

---

## 0. User hierarchy — what changes vs what stays

**Baseline (v1 — `user-tenant-management.md` §2.1):**

```
Super Admin (platform)
    └── Tenant Admin (one per tenant, platform-provisioned)
            └── Operational users (staff invite)
```

**v2 (this document):**

```
Super Admin (platform)
    └── Tenant Super Admin (one per tenant at provision; platform-provisioned)
            ├── Tenant Admin × N (staff invite — delegate)
            │       └── Operational users + POI-Admin (FB-014)
            └── Operational users + POI-Admin (direct invite)
```

| Layer | Unchanged | Amended |
|-------|-----------|---------|
| Platform Super Admin | Manual seed / CLI only; provisions tenants | Label on tenant form: "Tenant **Super** Admin" fields |
| Tenant-wide full access | `is_tenant_admin` bypass in `has_dfms_permission` | Applies to **both** super and delegate |
| Staff invitation (operational roles) | Department → role allowlist | Unchanged for non-admin roles |
| Single tenant admin per schema | Hard-coded in `UserAdminForm.clean()` | **Removed** — many delegates allowed |
| `tenant_admin` via invite | Blocked everywhere | **Allowed** when inviter is Tenant Super Admin |

---

## 0.1 Scope boundary

| In scope (v2) | Out of scope / separate items |
|---------------|-------------------------------|
| `tenant_super_admin` role + `is_tenant_super_admin` flag | FB-014 POI-Admin role seed and yard grants |
| Provisioning creates super admin, not delegate | Multiple Tenant Super Admins per tenant (platform policy TBD) |
| Invite / assign `tenant_admin` (super only) | Tenant Admin inviting another Tenant Admin |
| Migration: existing provisioned user → super admin | Unit + integration tests only |
| E2E / Playwright | **Out of scope** — do not add or amend `tests/e2e/` for this item |
| Platform tenant list invitation status (super admin) | Org-wide audit viewer RBAC redesign |
| Activation sync for `is_tenant_admin` / `is_tenant_super_admin` | — |
| Server-side guards on invite API + admin forms + bulk CSV | Self-service role elevation |

### Locked product decisions (implementation defaults)

| Topic | Decision | Rationale |
|-------|----------|-----------|
| Full-access bypass | **Both** personas keep `is_tenant_admin=True` | Avoid refactoring ~60 `is_tenant_admin` checks |
| Elevation flag | `is_tenant_super_admin=True` **only** for platform-provisioned user | Single source for "may mint tenant admins" |
| Permission catalog | **Identical** `all_tenant_catalog_permission_codes()` on both roles | Client: delegates do everything except add admins |
| `tenant_super_admin` invite | **Never** — platform provisioning only | Same pattern as `super_admin` |
| `tenant_admin` invite | **Tenant Super Admin only** | Core product rule |
| Delegate → delegate admin | **Forbidden** | Tenant Admin cannot assign `tenant_admin` |
| Test coverage | **Unit + integration only** — no new or updated E2E / Playwright | Same policy as FB-008 / transport-order-management-v2 |
| Django `is_superuser` on activation | **Yes** for both when `is_tenant_admin=True` | Matches today's provisioned admin Django admin access |
| Deactivate Tenant Admin user | **Tenant Super Admin only** may deactivate another `is_tenant_admin` user | Prevents delegate lock-out / privilege fights |
| Edit Tenant Admin user role | **Read-only** for non–super-admin editors | Extend existing "tenant admin role cannot be changed" pattern |
| Subscription `max_users` | Each delegate counts as one active user | Expected SaaS behaviour |

---

## 1. Current vs expected behaviour

| Aspect | Current (codebase) | Expected (v2) |
|--------|-------------------|---------------|
| First admin persona | Tenant Admin (`tenant_admin`) | **Tenant Super Admin** (`tenant_super_admin`) |
| Provisioning target role | `tenant_admin` | `tenant_super_admin` |
| `is_tenant_admin` on provision | `True` | `True` (unchanged bypass) |
| `is_tenant_super_admin` | Does not exist | `True` on provisioned user only |
| Tenant admins per tenant | **1** (`UserAdminForm` enforcement) | **1 super + N delegates** |
| Invite `tenant_admin` | Blocked in `InviteUserForm`, `UserRoleInline`, `InviteUserForm.clean()` | Allowed when `invited_by.is_tenant_super_admin` |
| Invite `tenant_super_admin` | N/A | Blocked (platform only) |
| Tenant Admin invites operational users | Yes | Unchanged |
| Tenant Admin invites POI-Admin (FB-014) | N/A today | Yes (both super and delegate) |
| Platform tenant status badge | `.filter(is_tenant_admin=True).first()` | `.filter(is_tenant_super_admin=True).first()` |
| `is_admin_email_registered()` | Any `is_tenant_admin` email | Prefer super-admin email only (see §13 OQ-2) |

---

## 2. Data model amendments

### 2.1 User — `is_tenant_super_admin`

```python
# apps/users/models.py
class User(AbstractBaseUser, ...):
    is_tenant_admin = models.BooleanField(default=False)       # existing — full tenant access bypass
    is_tenant_super_admin = models.BooleanField(default=False)  # NEW — may assign tenant_admin
```

| Flag | Meaning |
|------|---------|
| `is_tenant_super_admin=True` | Platform-provisioned first admin; may invite/assign `tenant_admin` |
| `is_tenant_admin=True` | Full catalog bypass (`has_dfms_permission`, `get_all_permissions`, `check_permission`) |
| Delegate | `is_tenant_admin=True`, `is_tenant_super_admin=False` |
| Super | `is_tenant_admin=True`, `is_tenant_super_admin=True` |

**Invariant:** `is_tenant_super_admin=True` ⇒ `is_tenant_admin=True` (enforced in sync helper).

### 2.2 Role catalog — `tenant_super_admin`

```python
# apps/core/role_seed_data.py — add before tenant_admin tuple
(
    "tenant_super_admin",
    "Tenant Super Admin",
    PredefinedDepartment.ADMINISTRATION,
    [],  # filled by _apply_tenant_admin_catalog_permissions() for both admin roles
),
(
    "tenant_admin",
    "Tenant Admin",
    PredefinedDepartment.ADMINISTRATION,
    [],  # same catalog
),
```

Refactor seed helper:

```python
TENANT_FULL_ACCESS_ROLE_CODES = frozenset({"tenant_admin", "tenant_super_admin"})

def _apply_tenant_admin_catalog_permissions() -> None:
    codes = all_tenant_catalog_permission_codes()
    for index, (role_code, role_name, department, _perms) in enumerate(SEED_ROLES):
        if role_code in TENANT_FULL_ACCESS_ROLE_CODES:
            SEED_ROLES[index] = (role_code, role_name, department, codes)
```

### 2.3 Constants

```python
# apps/users/invitation_constants.py
INVITATION_NEVER_ROLE_CODES = frozenset({"super_admin", "tenant_super_admin"})

INVITATION_DEPARTMENT_ROLE_CODES: dict[str, frozenset[str]] = {
    ...
    PredefinedDepartment.ADMINISTRATION: frozenset({"tenant_admin"}),  # NEW key
}
```

`tenant_admin` remains in `STAFF_INVITATION_FORBIDDEN_ROLE_CODES` **only as default** — runtime guard overrides when inviter is super admin (prefer explicit check in service layer over removing from frozenset).

---

## 3. Central sync helper

**New file:** `apps/users/tenant_admin_flags.py` (or methods on `User`)

```python
TENANT_FULL_ACCESS_ROLE_CODES = frozenset({"tenant_admin", "tenant_super_admin"})

def sync_tenant_admin_flags_from_role(user: User, role_code: str | None) -> list[str]:
    """Align denormalised flags with assigned RBAC role. Returns changed field names."""
    want_admin = role_code in TENANT_FULL_ACCESS_ROLE_CODES
    want_super = role_code == "tenant_super_admin"
    changed = []
    if user.is_tenant_admin != want_admin:
        user.is_tenant_admin = want_admin
        changed.append("is_tenant_admin")
    if user.is_tenant_super_admin != want_super:
        user.is_tenant_super_admin = want_super
        changed.append("is_tenant_super_admin")
    if want_super and not want_admin:
        user.is_tenant_admin = True
        if "is_tenant_admin" not in changed:
            changed.append("is_tenant_admin")
    return changed
```

**Call sites (mandatory):**

| Call site | When |
|-----------|------|
| `TenantProvisioningService._create_tenant_super_admin` | After user create |
| `UserAdmin.save_model` | After role assignment |
| `invitation_service.activate_invitation` | After `assign_role_to_user` |
| `rbac_views` role assignment API | After assign (if exposed) |

**Activation addition** (`activate_invitation`):

```python
if inv.role:
    assign_role_to_user(...)
    changed = sync_tenant_admin_flags_from_role(user, inv.role.role_code)
    if user.is_tenant_admin:
        user.is_staff = True
        user.is_superuser = True
        changed.extend(["is_staff", "is_superuser"])
    if changed:
        user.save(update_fields=[*changed, "updated_at"])
```

---

## 4. Role assignment guard

**New:** `apps/users/role_assignment_policy.py`

```python
def user_may_assign_role(assigner: User, target_role_code: str) -> bool:
    if target_role_code == "super_admin":
        return False
    if target_role_code == "tenant_super_admin":
        return False  # platform provisioning only
    if target_role_code == "tenant_admin":
        return bool(assigner.is_tenant_super_admin or assigner.is_super_admin)
  # existing operational rules...
    if assigner.is_tenant_admin:
        return True
    return False  # dept-specific paths unchanged
```

**HTTP errors:**

| Case | Code |
|------|------|
| Assign `tenant_super_admin` via invite | `ROLE-403-ROLE-NOT-INVITABLE` |
| Tenant Admin assigns `tenant_admin` | `ROLE-403-TENANT-ADMIN-DELEGATION-DENIED` (new) |

---

## 5. Provisioning & platform admin (tenants app)

### 5.1 Service rename

`TenantProvisioningService._create_tenant_admin` → `_create_tenant_super_admin`:

```python
user = User.objects.create_user(
    ...
    is_tenant_admin=True,
    is_tenant_super_admin=True,  # NEW
)
# UserRole.role_id → tenant_super_admin
```

### 5.2 Platform UI copy

| Location | Old label | New label |
|----------|-----------|-----------|
| `tenants/admin.py` add form | Tenant Admin Email / Phone / Full Name | **Tenant Super Admin** … |
| `tenants/serializers.py` | `admin_email`, `admin_full_name` | Help text only (field names may stay for API compat) |
| `send_tenant_admin_invitation` email template | "Tenant Admin" | "Tenant Super Admin" (subject + body) |

### 5.3 Invitation state for platform list

```python
# apps/tenants/admin.py — _invitation_state_key
tenant_admin = (
    User.objects.filter(is_tenant_super_admin=True)
    .order_by("created_at")
    .first()
)
```

Resend-invite action: same filter.

### 5.4 Email uniqueness check

`is_admin_email_registered()` — see §13 OQ-2; default: check `is_tenant_super_admin=True` only so delegate emails do not block new tenant provision.

---

## 6. Staff invitation & user admin (users app)

### 6.1 `InviteUserForm`

```python
def __init__(self, *args, request=None, **kwargs):
    exclude = set(FORBIDDEN_INVITATION_ROLE_CODES) | {"tenant_super_admin"}
    if not getattr(request.user, "is_tenant_super_admin", False):
        exclude.add("tenant_admin")
    self.fields["role"].choices = [("", "---------")] + _role_choices(exclude_role_codes=exclude)
```

Pass `request` from `InviteUserAdmin.get_form()`.

### 6.2 `InviteUserForm.clean()`

Replace hard block:

```python
# REMOVE:
# if role_info["role_code"] == "tenant_admin":
#     raise forms.ValidationError("Tenant Admin cannot be assigned through invitation.")

# ADD:
if not user_may_assign_role(self._inviter, role_info["role_code"]):
    raise forms.ValidationError("You cannot assign this role.")
```

### 6.3 `UserAdminForm`

| Change | Detail |
|--------|--------|
| Remove | Single-tenant-admin `clean()` constraint (lines ~313–321) |
| Add | `user_may_assign_role(request.user, role_code)` in `clean()` |
| Extend read-only | Users with `is_tenant_admin=True` editable only by super admin for role field |
| `__init__` exclude | `tenant_super_admin` always; `tenant_admin` unless editor is super admin |

### 6.4 `UserRoleInline`

```python
exclude_codes = set(FORBIDDEN_INVITATION_ROLE_CODES) | {"tenant_super_admin"}
if not request.user.is_tenant_super_admin:
    exclude_codes.add("tenant_admin")
```

### 6.5 `create_invitation()` service

After `_build_invitation_role_for_staff`:

```python
if not user_may_assign_role(invited_by, role.role_code):
    raise PermissionDenied(detail={...})
```

### 6.6 Account deactivation

`account_deactivation_service.py` — when target has `is_tenant_admin=True` and actor is not `is_tenant_super_admin`, deny (unless platform `is_super_admin`).

---

## 7. RBAC runtime (minimal changes)

| File | Change |
|------|--------|
| `apps/users/models.py` `has_dfms_permission` | **No change** — still keyed on `is_tenant_admin` |
| `apps/core/rbac_service.py` `check_permission` | **No change** |
| `apps/core/permissions.py` `IsTenantAdmin` | **No change** — both personas pass |
| `apps/users/yard_constants.py` `YARD_UNSCOPED_ROLE_CODES` | Add `tenant_super_admin` alongside `tenant_admin` if yard code checks role code strings |
| `apps/operations/admin_base.py` `_tenant_admin_allowed` | **No change** — uses `is_tenant_admin` |

Optional future: `IsTenantSuperAdmin` permission class for elevation-only views.

---

## 8. Migration & rollout

### 8.1 Schema migration

1. Add `User.is_tenant_super_admin` (`default=False`).
2. Data migration per tenant schema:

```python
# For each user where is_tenant_admin=True and role is tenant_admin (or sole admin):
#   - set is_tenant_super_admin=True
#   - swap UserRole to tenant_super_admin role_id (public schema Role lookup)
```

3. Run `seed_dfms_rbac` (or migration hook) to insert `tenant_super_admin` role with full catalog.

### 8.2 Rollout order

```
1. Deploy migration + seed (backward compatible — old code ignores new flag)
2. Deploy application code (sync helper + guards)
3. Verify platform provision creates super admin
4. Verify super admin can invite tenant admin
5. Verify delegate cannot invite tenant admin
```

### 8.3 Backward compatibility

| Client / integrator | Impact |
|---------------------|--------|
| Tenant provision API | Response unchanged; provisioned user role code becomes `tenant_super_admin` |
| Staff invite API | New 403 when delegate assigns `tenant_admin` |
| `GET /api/v1/roles/` | Lists new role |
| Existing super user | Migration promotes to `tenant_super_admin` |

---

## 9. Implementation phases & ordered steps

### Phase 1 — Model, seed, sync (foundation)

| Step | File(s) | Change |
|------|---------|--------|
| 1 | `apps/users/models.py` + migration | Add `is_tenant_super_admin` |
| 2 | `apps/core/role_seed_data.py` | Add `tenant_super_admin`; refactor catalog helper |
| 3 | `manage.py seed_dfms_rbac` | Run in dev/staging |
| 4 | `apps/users/tenant_admin_flags.py` | `sync_tenant_admin_flags_from_role`, `TENANT_FULL_ACCESS_ROLE_CODES` |
| 5 | Data migration | Promote existing provisioned admin |
| 6 | Tests | `test_tenant_admin_flags.py` — sync matrix |

### Phase 2 — Provisioning & platform UI

| Step | File(s) | Change |
|------|---------|--------|
| 7 | `apps/tenants/services.py` | `_create_tenant_super_admin`, flags on create |
| 8 | `apps/tenants/admin.py` | Labels, `_invitation_state_key`, resend invite |
| 9 | `apps/tenants/tasks.py` | Log messages / email task names (optional rename) |
| 10 | `apps/notifications/email.py` | Copy: Tenant Super Admin |
| 11 | Tests | `test_tenant_service.py`, `test_tenant_admin.py` |

### Phase 3 — Invitation guards & admin UI

| Step | File(s) | Change |
|------|---------|--------|
| 12 | `apps/users/role_assignment_policy.py` | `user_may_assign_role` |
| 13 | `apps/users/invitation_constants.py` | `ADMINISTRATION` dept + `tenant_super_admin` never |
| 14 | `apps/users/invitation_service.py` | Guard in `create_invitation`; activation sync |
| 15 | `apps/users/admin.py` | `InviteUserForm`, `UserAdminForm`, `UserRoleInline` |
| 16 | `apps/users/invitation_views.py` | API guard |
| 17 | `apps/users/import_configs.py` | Bulk import guard |
| 18 | `apps/users/account_deactivation_service.py` | Super-only deactivate tenant admins |
| 19 | Tests | `test_invitation_service.py`, `test_admin.py`, `test_integration/test_invitation_api.py` (unit + integration only; no E2E) |

### Phase 4 — Docs & feedback

| Step | File(s) | Change |
|------|---------|--------|
| 20 | `feedback-resolution.md` | Add **FB-015**; link this doc |
| 21 | `01-foundation/user-tenant-management.md` | §2.1 hierarchy amend (pointer to v2) |
| 22 | `01-source/03-sow/user-roles.md` | Role table |
| 23 | `06-contracts/01-apis/rest/roles.yaml` | `tenant_super_admin` enum |

---

## 10. Story mapping (proposed sub-tasks)

| Sub-task | Phase | Scope |
|----------|-------|-------|
| TUM-v2-1 | 1 | Model + migration + data promote |
| TUM-v2-2 | 1 | RBAC seed `tenant_super_admin` |
| TUM-v2-3 | 1 | `sync_tenant_admin_flags_from_role` |
| TUM-v2-4 | 2 | Provisioning service + platform labels |
| TUM-v2-5 | 2 | Platform invitation status filter |
| TUM-v2-6 | 3 | `user_may_assign_role` + invitation service |
| TUM-v2-7 | 3 | Admin forms (invite + user change) |
| TUM-v2-8 | 3 | Activation path `is_superuser` sync |
| TUM-v2-9 | 3 | Deactivate guard for tenant admins |
| TUM-v2-10 | 3 | Unit + integration tests (no E2E) |
| TUM-v2-11 | 4 | Docs + FB-015 tracker |

---

## 11. Acceptance criteria

### Provisioning

- [ ] Platform provision creates user with `is_tenant_super_admin=True`, `is_tenant_admin=True`, role `tenant_super_admin`
- [ ] Provisioned user is inactive until activation (unchanged)
- [ ] Platform tenant list shows invitation status for super admin only

### Delegation

- [ ] Tenant Super Admin can invite user with role `tenant_admin` (Administration department)
- [ ] Activated delegate has `is_tenant_admin=True`, `is_tenant_super_admin=False`, full menu access
- [ ] Tenant Admin delegate can invite operational roles (e.g. Transport Planner, Gateman)
- [ ] Tenant Admin delegate **cannot** invite `tenant_admin` (form + API 403)
- [ ] No user can invite `tenant_super_admin` via staff invite

### User admin

- [ ] Multiple `is_tenant_admin=True` users may exist in one tenant schema
- [ ] Only Tenant Super Admin may change role **to** or **from** `tenant_admin` on user change form
- [ ] Tenant Admin delegate cannot deactivate another `is_tenant_admin` user

### Regression

- [ ] Operational role invite + POI assignment (YARD-01) unchanged
- [ ] `check_permission` / `IsTenantAdmin` pass for both personas
- [ ] Migration promotes existing sole provisioned admin without lock-out

---

## 12. Test plan (unit & integration only)

**E2E / Playwright is explicitly out of scope** for this item. Do not add, amend, or run tests under `tests/e2e/` for Tenant Super Admin / delegated Tenant Admin. Verification is via `tests/unit/` and `tests/integration/` only.

| Test module | Cases |
|-------------|-------|
| `test_tenant_admin_flags.py` | Sync from each role code; invariant super ⇒ admin |
| `test_tenants/test_service.py` | Provision sets super flags + role |
| `test_users/test_invitation_service.py` | Super invites tenant_admin; delegate denied |
| `test_users/test_admin.py` | Form choices per editor; removed single-admin constraint |
| `test_users/test_account_deactivation_service.py` | Delegate cannot deactivate tenant admin |
| `test_integration/test_invitation_api.py` | REST 403 for delegate → tenant_admin |
| Migration test | One existing `is_tenant_admin` → super admin role swap |

---

## 13. Open questions (PO)

| ID | Question | Default if silent |
|----|----------|-------------------|
| OQ-1 | Allow **multiple** Tenant Super Admins (platform manual promote)? | **No** — one super per tenant at provision |
| OQ-2 | `is_admin_email_registered` — block on any `is_tenant_admin` or super only? | **Super only** — delegates may share email patterns across tenants differently |
| OQ-3 | Can Tenant Admin delegate **view** list of other Tenant Admins? | **Yes** read-only in Users changelist |
| OQ-4 | Can delegate edit another delegate's profile (not role)? | **Yes** — same as super for non-role fields |
| OQ-5 | Bulk CSV import of `tenant_admin` rows? | **Forbidden** — same as single invite guard |

---

## 14. Cross-references

| Document | Relationship |
|----------|--------------|
| [user-tenant-management.md](../01-foundation/user-tenant-management.md) | Baseline v1 spec — hierarchy §2.1 superseded by this doc |
| [feedback-resolution.md §FB-014](../../03-backlog/sprints/sprint-6/feedback-resolution.md#fb-014--poi-admin-role-poi-scoped-yard-operations-super-user) | POI-Admin invited by any tenant admin persona |
| [poi-scoped-roles.md](../../../../docs/architecture/poi-scoped-roles.md) | POI assignment pattern (orthogonal) |
| [qc-operations-v2.md](../06-poi-operations/qc-operations-v2.md) | Example v2 implementation plan structure |

---

## 15. Code anchor index (current baseline)

| Concern | File | Symbol / area |
|---------|------|----------------|
| Full-access bypass | `apps/users/models.py` | `has_dfms_permission`, `get_all_permissions` |
| Single admin constraint | `apps/users/admin.py` | `UserAdminForm.clean` ~L313 |
| Invite blocks tenant_admin | `apps/users/admin.py` | `InviteUserForm` ~L1260, `clean` ~L1346 |
| Provision first admin | `apps/tenants/services.py` | `_create_tenant_admin` ~L234 |
| Platform invite status | `apps/tenants/admin.py` | `_invitation_state_key` ~L472 |
| Role catalog | `apps/core/role_seed_data.py` | `tenant_admin`, `_apply_tenant_admin_catalog_permissions` |
| Activation | `apps/users/invitation_service.py` | `activate_invitation` ~L884 |
| Never invitable | `apps/users/invitation_constants.py` | `INVITATION_NEVER_ROLE_CODES` |
