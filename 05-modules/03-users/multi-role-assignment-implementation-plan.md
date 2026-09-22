---
module: 03-users
specification: TUM-06 — Assign multiple operational roles; working-role switcher (no permission union)
version: 1.0
phase: Phase 2
sprint: Sprint 10
last_updated: 2026-09-22
related_stories: TUM-06
baseline_spec: tenant-user-management.md
rbac_spec: ../01-foundation/rbac.md
e2e_scenarios: ../../09-testing/backend/e2e-scenarios/stories-phase-2/010-Multi-role Tenant Users/tum-06-multi-role-assignment-e2e-scenarios.md
implementation_reference:
  - nourish-backend/apps/users/models.py (UserRole, UserOperationalPOI, InvitationToken, User.has_role, User.get_all_permissions)
  - nourish-backend/apps/core/rbac_service.py (assign_role_to_user — replace-on-assign)
  - nourish-backend/apps/users/role_assignment_policy.py
  - nourish-backend/apps/users/admin.py (InviteUserForm / UserAdminForm single Role ChoiceField)
  - nourish-backend/apps/users/invitation_service.py (activate applies inv.role only)
  - nourish-backend/apps/users/invitation_views.py (role_ids[0])
  - nourish-backend/apps/users/invitation_serializers.py (role_ids max_length=5)
  - nourish-backend/apps/users/import_configs.py (CSV role — single code)
  - nourish-backend/apps/requisitions/role_access.py (get_primary_role_code — first KNOWN_ROLES match)
  - nourish-backend/apps/operations/yard_poi.py (Working site session/cookie — pattern to copy)
  - nourish-backend/templates/admin/includes/poi_profile_switcher.html
  - nourish-backend/apps/core/portal_navigation.py
  - nourish-backend/apps/operations/admin_base.py (YardAdminBase._yard_role uses has_role)
  - nourish-backend/apps/core/dashboard_scope.py
  - nourish-backend/apps/core/dashboard_service.py
---

# TUM-06 — Multi-role assignment & working-role switcher

Sprint 10 implementation plan for [TUM-06](../../03-backlog/phase-2/sprints/sprint-10/01-Multi-role%20Tenant%20Users/TUM-06-multi-role-assignment.md). Amends [tenant-user-management.md](./tenant-user-management.md) (invite / edit / CSV) and [rbac.md](../01-foundation/rbac.md) §3.1.

**Problem:** DFMS stores and authorizes **one role per user**. Dual-hat sites (Gate + Scale, DO + DM) need two catalog roles on one account, without a second login and without merging permissions.

**Rule:** A user may hold **many operational** roles. At runtime they work as **exactly one** selected role (same idea as Working site). No permission union. Tenant Super Admin, Tenant Admin, Driver, Helper stay one role. Super Admin is never assignable.

Do the steps **in this order**. Step 2 (persistence) without Step 6 (switcher) is a regression: the DB would allow two roles while menus still union or pick “first assigned”.

---

## Investigation — what the code does today

Verified against `nourish-backend` (2026-09-22). One-role is not a leftover comment; it is enforced in four layers.

| Layer | Today | TUM-06 needs |
|-------|--------|----------------|
| DB | `UserRole` `uniq_userrole_user_single_role` on `(user)` (`apps/users/models.py`). `unique(user, role)` was **removed** in `0013_userrole_single_role_per_user.py`. | Drop single-role constraint; restore `unique(user, role)`. |
| Assign primitive | `assign_role_to_user` keeps one row, **deletes the rest**, then overwrites role (`rbac_service.py`). Comment: “Single-role system”. | Add an allowed role; do not delete others. |
| Invite | `InvitationToken.role` is a **single FK**. API already has `role_ids` but `invitation_views.py` takes `[0]`. Activation assigns `inv.role` only. Serializer `max_length=5` is a draft cap. There is a **second, separate** REST invite path: `apps/users/views.py::UserViewSet.invite` → `apps/users/serializers.py::InvitationSerializer` (singular `role_id`) → `UserService.invite_user` → `create_invitation(role_id=...)`. `create_invitation_for_provisioned_user` is a third singular-`role_id` entry point (`apps/users/services.py`). | Persist and apply the full set on **all three** entry points, not just `TenantInvitationListCreateView`. |
| Admin UX | `InviteUserForm` / `UserAdminForm`: one `ChoiceField` `label="Role"`. Department JS filters that one dropdown. One `operational_poi`. `UserRoleInline` exists but `UserAdmin.inlines = []` — Access fieldset is the source of truth. | Multi-select + forbidden-combo validation. |
| CSV | `import_configs.py` field `role` is one `role_code`. Department must match that one role. | Comma-separated codes; row fails on forbidden combo. |
| Authorization | `User.get_all_permissions()` unions **all** `UserRole` rows. `User.has_role` is membership of the assigned set. `get_primary_role_code` walks `KNOWN_ROLES` and returns the first hit — **not** a session. `scaling_operator` is **not** even in `KNOWN_ROLES`. | Working role only. |
| Menus / yard / dashboard | `portal_navigation._user_has_role` → `has_role` (union). `YardAdminBase._yard_role` prefers `has_role(operator)` (union). `dashboard_service.get_role_widgets` unions every assigned code. KPI spec still says single-role. | Working role only. |
| Working site | Session `dfms_active_poi_id` + HttpOnly cookie + POST `admin_set_active_poi` + `#dfms-poi-profile`. Bound from **request**. | Copy this for Select Role. |
| Who may assign | `user_may_assign_role`: Tenant Admin / Tenant Super Admin / platform Super Admin. Only Tenant Super Admin grants `tenant_admin`. `super_admin` / `tenant_super_admin` never via invite. | Keep. Operational users still cannot assign. |

`UserOperationalPOI` is already unique on `(user, poi, role)`. That part of AC-5 is done; the gap is **creating one row per local role** instead of one row for “the” role.

Existing tests encode replace-on-assign: `tests/unit/test_core/test_rbac_service.py::test_effective_access_scope_global_wins` assigns depot then DM and expects one assignment. Those tests must change with Step 2.

---

## Locked decisions

These close TUM-06-1 (including the story’s “named dual-hat list?”). They match AC-1 / Flow A / the E2E plan. Do not re-open them in code review unless the PO changes the story.

| ID | Decision |
|----|----------|
| L1 | **Any allowed operational combination**, no cap, no named dual-hat allowlist. Exclusive **targets** (cannot combine with anything): `tenant_super_admin`, `tenant_admin`, `driver`, `driver_helper`. Super Admin is never assignable. There is **no** `vendor` staff role in `SEED_ROLES`; vendor portal users stay out of this flow. |
| L2 | **No permission union.** Runtime access, menus, widgets, yard `_yard_role`, and `get_all_permissions` follow the **working role** only. `User.has_role` stays **assigned-set membership** (needed to list Select Role and to validate fallback). |
| L3 | **Cross-department dual-hats are required** (Gateman `gate_operations` + Scaling `scaling_weight`). Drop “one invitation department then filter roles to that department” as a hard gate. Role widget is a multi-select **grouped by department** (optgroups). `InvitationToken.department` / `User.department` = first selected role’s catalog department (display only). Each `UserRole.department` comes from that role. |
| L4 | **Invite / CSV Site (POI):** one POI on the form/row is applied to **every selected POI-scoped role** (Flow A). **User edit** must allow a different POI per local role (AC-5 / TC17) via a per-role POI map (not by turning on unused `UserRoleInline` as a second editor). Global roles: clear `UserOperationalPOI` for **that role only**. |
| L5 | **Invitation extra roles:** JSONField `role_ids` (`list` of UUID strings) on `InvitationToken`. Keep FK `role` as `role_ids[0]` so existing list columns and resend keep working. Empty `role_ids` → treat as `[role_id]` (old rows). |
| L6 | **Working-role persistence copies Working site:** session `dfms_working_role_code` + HttpOnly cookie, POST `admin_set_working_role`, profile-menu **Select Role**. Middleware after `AuthenticationMiddleware` (before `AdminMenuAccessMiddleware`) binds `request.user._working_role_code`. `get_primary_role_code(user)` reads that attribute; **do not** add `request` to every call site. |
| L7 | **Fallback:** if session role is missing or no longer assigned → remaining assigned role with the lowest `role_code` (stable). One assigned role → that role is working; hide Select Role. Removing a role does **not** deactivate the account. |
| L8 | **Admin Access fieldset is the only role editor.** Do not enable `UserRoleInline` (`inlines = []` stays). Edit save **syncs the set**: add missing `UserRole` rows, delete unselected ones, then `assign_role_to_user` stays add-only for invite/activate/API. |
| L9 | **Django admin SSR is P0.** REST invite must apply all `role_ids` (stop `[0]`). JWT `roles[]` may still list the assigned set; API authorization that goes through `get_primary_role_code` / `get_all_permissions` picks up the bound working role when the request used session auth. No new JWT claim in this story. |
| L10 | **Denormalized `User.is_approver` / `is_requester`:** do **not** rewrite them on every switch (that would race across tabs). Keep `sync_user_workflow_flags` as “any assigned role has Create/Approve” for JWT leftovers. Portal/admin auth must **not** use those flags; it uses working-role permissions / `get_primary_role_code`. `IsApprover` / `IsRequester` in `apps/core/permissions.py` are REST leftovers — out of admin E2E; leave them unless a dual-hat API test fails. |

Self-approval stays `created_by == request.user` (already independent of role). Switching DO → DM must not approve own TRs (BR-TUM06-003).

---

## Exclusive-set helper (one function)

Put this next to `user_may_assign_role` in `apps/users/role_assignment_policy.py` (or a tiny `role_set_policy.py` if that file would mix assigner vs target rules). Call it from admin `clean()`, CSV validate, `create_invitation`, `assign_role_to_user`, and `sync_user_roles`.

```
EXCLUSIVE_TARGET_ROLE_CODES = frozenset({
    "tenant_super_admin",
    "tenant_admin",
    "driver",
    "driver_helper",
})

def validate_role_set(role_codes: set[str]) -> None:
    # duplicate codes already impossible if the set is a set
    # any exclusive code + len > 1 → ValidationError
    # super_admin in set → ValidationError
```

Assigner checks stay per-code via existing `user_may_assign_role`. Tenant Admin cannot grant `tenant_admin` even alone.

---

## Story ↔ code placement

| Story wording | Implemented surface |
|---------------|---------------------|
| Invite User | `InvitationTokenAdmin` + `InviteUserForm` (`admin:users_invitationtoken_add`) |
| User Edit | `UserAdminForm` Access fieldset (`admin:users_user_change`) |
| CSV | `UserBulkImportAdmin` / `import_configs.py` column `role` |
| Select Role | Profile dropdown, sibling of Working site (`#dfms-poi-profile`) |
| Activation applies all roles | `activate_invitation` + `InvitationToken.role_ids` |
| Working role on later audit | `AuditLog.details["working_role"]` (or equivalent) from bound working role — **not** a new AuditLog column unless details already cannot hold it |

---

## Step 1 — Policy in baseline specs (TUM-06-1)

Needed before persistence so implementers do not re-introduce union.

- [rbac.md](../01-foundation/rbac.md) §3.1: replace “one primary role” / “union of permissions” with L1–L2 and the exclusive table.
- [tenant-user-management.md](./tenant-user-management.md): Role field is multi-select; Select Role; audit logs the set; who may assign (AC-0).
- [role-dashboard-kpi-widgets.md](../01-core/role-dashboard-kpi-widgets.md) §3: widgets for the **working role** only — no merge, no “union then cap at 8”.

---

## Step 2 — Persistence (TUM-06-2)

**Lock:** do not ship this migration to an environment without Step 6 in the same release.

Files: `apps/users/models.py`, new migration, `apps/core/rbac_service.py`.

1. Remove `uniq_userrole_user_single_role`.
2. Add `UniqueConstraint(fields=["user", "role"], name="uniq_userrole_user_role")`.
3. Rewrite `assign_role_to_user`:
   - Validate inactive user (keep).
   - `validate_role_assignment` for that one role (POI required if local — keep `allow_missing_location` for invite-then-activate).
   - Load **current** assigned codes + the new code → `validate_role_set`.
   - `get_or_create(user=user, role=role)`; set `department` from the role. **Do not delete other rows.**
   - Duplicate `(user, role)` → validation error (IntegrityError → clear message).
4. Add `sync_user_roles(user, roles: list[Role], *, assigned_by, poi_by_role_id)` for User edit:
   - Validate the **resulting** set (exclusive, assigner, Super Admin hidden).
   - Create missing `UserRole` rows; delete rows whose role is not in the set.
   - Deleting a role must not set `is_active=False`.
   - Return `{added, removed, resulting}` role_codes for audit.

Signals already invalidate permission cache on UserRole save/delete — keep them. Cache **key** changes in Step 6 (`user_permissions_{id}_{working_role}`).

---

## Step 3 — Invite + activation (TUM-06-3)

Files: `InvitationToken` + migration; `invitation_service.py`; `invitation_views.py`; `invitation_serializers.py`; `InviteUserForm` save path; **and** the second REST invite path — `apps/users/serializers.py` (`InvitationSerializer`), `apps/users/services.py` (`UserService.invite_user`), `apps/users/views.py` (`UserViewSet.invite`), plus `create_invitation_for_provisioned_user`.

1. Add `role_ids = JSONField(default=list, blank=True)`. On write: `role = Role(role_ids[0])`, `role_ids = [str(id), ...]`.
2. Lift `CreateInvitationSerializer.role_ids` `max_length=5`. Keep `min_length=1`.
3. `create_invitation(..., role_ids: list[UUID], ...)` — validate set + each `user_may_assign_role`. Derive `department_key` from the first role if the form no longer sends a single department (L3). Apply one `poi_id` to the token (L4).
4. `activate_invitation`: for each id in `inv.role_ids or [inv.role_id]`, `assign_role_to_user(...)`. For each POI-scoped role, `UserOperationalPOI.update_or_create(user, poi_id=inv.poi_id, role_id=..., is_primary=True)` if `inv.poi_id` set. `sync_tenant_admin_flags_from_role` only if the set is a single admin role (exclusive — never mixed).
5. Admin invite save: pass all selected ids, not `_role_id` singleton.
6. REST POST (`TenantInvitationListCreateView`): pass `data["role_ids"]` through, **not** `[0]`.
7. **Second REST invite path** (distinct code path — do not assume it is covered by #6): change `InvitationSerializer.role_id` → `role_ids` (list); `UserService.invite_user(role_id=...)` → `role_ids=...`; `UserViewSet.invite` passes the list through. Update `create_invitation_for_provisioned_user` to the same `role_ids: list[UUID]` signature as `create_invitation` (#3) so both entry points stay symmetric.

Single-role invites stay valid (`role_ids` length 1) on both REST paths.

---

## Step 4 — Admin edit UX (TUM-06-4)

Files: `apps/users/admin.py` (`UserAdminForm`, `InviteUserForm`, JS), Access fieldset.

1. Replace Role `ChoiceField` with `MultipleChoiceField` (checkboxes or `<select multiple>` matching existing admin CSS — do not invent a new component library). Choices: active roles minus `FORBIDDEN_INVITATION_ROLE_CODES` / `_staff_invite_role_exclude_codes`. **Optgroups by department.** Include `tenant_admin` only for Tenant Super Admin assigners (existing copy: `Only a Tenant Super Admin may assign the Tenant Admin role.`).
2. `clean()`: `validate_role_set`; per-code `user_may_assign_role`; if any selected role is POI-scoped and `operational_poi` missing → error. For **edit**, if two local roles have different sites, require the per-role map (below) rather than one field.
3. Per-role POI on **change** (not invite): for each selected code in `POI_SCOPED_ROLE_CODES`, a POI dropdown keyed `operational_poi_<role_id>` (or one JSON map). Prefill from `UserOperationalPOI`. Save via `sync_user_roles` + per-role `update_or_create` / delete leftover rows for global roles in the new set.
4. Invite: keep **one** Site (POI); JS shows it if **any** selected role is POI-scoped (today it keys off one `role_code`).
5. `save_model`: stop calling `assign_role_to_user` once. Call `sync_user_roles`. Write audit details `{added, removed, resulting}`.
6. Changelist `primary_role`: join assigned role names (comma-separated). Do not invent a “primary” in the DB.

---

## Step 5 — CSV / bulk (TUM-06-5)

File: `apps/users/import_configs.py`.

1. Parse `role` as comma-separated codes (`gateman,scaling_operator`). Strip, lower, unique-preserve-order. One code still valid.
2. Unknown code, exclusive combo, assigner denial, missing POI for a local role → **that row** invalid with a reason. Other rows unaffected.
3. Department column: do not require one department to match every code. Derive each `UserRole.department` from the role catalog.
4. One `poi_code` applies to every POI-scoped role on the row (same as invite).
5. Apply via `create_invitation(..., role_ids=...)` / `sync_user_roles` for existing-user update — never `assign_role_to_user` alone (that would have deleted siblings before this story; after Step 2 it would only add the last code).

---

## Step 6 — Working-role switcher (TUM-06-6)

This is the product behavior. Ship with Step 2.

Copy `yard_poi.py` + `admin_poi_views.py` + `poi_profile_switcher.html` + `poi_switcher_context`.

| Piece | Value |
|-------|--------|
| Session / cookie | `dfms_working_role_code` |
| POST URL | `admin_set_working_role` (staff_member_required, POST, `next` hidden field) |
| Markup | `#dfms-role-profile`, `#dfms-role-select`, label **Select Role** (or **Working role** — match E2E: **Select Role**) |
| Show when | `len(assigned_role_codes) > 1` |
| Hide when | 0 or 1 assigned role |

**Middleware** `WorkingRoleMiddleware` (after auth, before `AdminMenuAccessMiddleware`):

1. If anonymous / platform tenant → skip.
2. Assigned codes from `UserRole`.
3. Candidate = session/cookie if in assigned set, else L7 fallback.
4. Write session if it drifted (removed role).
5. Set `request.user._working_role_code = candidate`.
6. Cookie on the response (same flags as POI cookie).

**Authorization wiring** (no union):

| Function | Change |
|----------|--------|
| `get_primary_role_code(user)` | Return `getattr(user, "_working_role_code", None)` if set and still assigned; else sole assigned role; else `None`. Stop walking `KNOWN_ROLES` as a tiebreaker. Add `scaling_operator` to `KNOWN_ROLES` only if some caller still lists “known” codes — not as a priority list. |
| `User.get_all_permissions()` | If `_working_role_code` set, load **that role’s** permissions only. Cache key `user_permissions_{pk}_{role_code}`. If unbound (management command / test), **one** assigned role → that role; **several** unbound → do **not** union — use L7 fallback code. |
| `portal_navigation._user_has_role` | Compare to working role, not `has_role`. |
| `YardAdminBase._yard_role` | If working role is in `{operator} ∪ extra ∪ supervisor` → that code; else `None`. **Do not** `has_role(operator)` first. |
| `dashboard_scope._resolve_role_code` | Working role, not `codes[0]`. |
| `dashboard_service.get_role_widgets` | Widgets for working role only. |
| Gate / scaling extras | `request.user.has_role("gateman")` while working as scaling must **not** open gate write. Prefer `_yard_role` / `get_primary_role_code`. Sweep `has_role` used as authorization (gate_poi, transport admin TO read). Membership uses (`Select Role` choices) keep `has_role`. |

On switch: `invalidate_user_permission_cache` for both old and new keys; redirect `next` like POI (no second login).

POI-scoped working role: Working site still uses `get_working_poi_for_request(request, role_code=working)`. Filter assigned POIs to **that** role (already supported by `assigned_pois_for_user(..., role_code=)`).

---

## Step 7 — Audit + cache (TUM-06-7)

1. Role assign/remove (invite save, `sync_user_roles`, CSV apply): `AuditLog` UPDATE/CREATE on User with `details`: `added`, `removed`, `resulting`, actor id, timestamp. Reuse existing `apps.audit.services` helpers; do not add a new event type unless `AuditEventType` cannot represent it (`UPDATE` + action `User.Roles` is enough).
2. Subsequent audited writes: stamp `details["working_role"]` from `get_primary_role_code(request.user)` in `_write_audit_log_now` when user is authenticated. Gate-in then shows Gateman, not Scaling (TC26).
3. Cache: include working role in the key (`user_permissions_{pk}_{role_code}`). **Do not** rely on `cache.delete_pattern(...)` for invalidation — prod uses `django_redis` (supports it) but `config/settings/testing.py` uses `LocMemCache` (does not), so a pattern-delete call will break under the test cache backend. Instead, `invalidate_user_permission_cache(user_id)` should look up the user's **currently assigned** role codes (plus, on assign/remove, the pre-change set) and delete each `user_permissions_{user_id}_{role_code}` key explicitly. Invalidate both the old and new working-role keys on switch, and all assigned-role keys on UserRole save/delete.

---

## Step 8 — Tests (TUM-06-8)

Unit / integration (admin E2E is the scenario file; do not treat Playwright as the first test):

- `assign_role_to_user` adds second operational role; first remains.
- Exclusive combos rejected (admin+gateman, driver+gateman, two roles on Tenant Admin).
- Duplicate `(user, role)` rejected.
- Invite activate applies `role_ids` length 2 → two `UserRole` + two `UserOperationalPOI` when POI-scoped + same poi.
- `role_ids` length 1 still works.
- CSV split + forbidden row isolated.
- `get_primary_role_code` / `get_all_permissions` with `_working_role_code='gateman'` do not include scaling permissions.
- Switch bind: middleware fallback when working role deleted.
- Operational user cannot assign (`user_may_assign_role` False).
- Self-approval still denied after switch to DM.
- Update `test_effective_access_scope_global_wins` (it currently relies on replace-on-assign).
- Grep `UserRole.objects.get(user=` before merging (found in `test_seed_dfms_rbac_removed_roles.py`, `test_import_configs.py` ×4, `test_replace_super_admin.py` ×2, `test_invitation_service.py`) — these assume exactly one row per user and will raise `MultipleObjectsReturned` if any fixture in those tests is later extended to assign a second role. Confirm none of them are silently relying on the old single-role invariant outside their own single-role scenario.

Playwright: [tum-06-multi-role-assignment-e2e-scenarios.md](../../09-testing/backend/e2e-scenarios/stories-phase-2/010-Multi-role%20Tenant%20Users/tum-06-multi-role-assignment-e2e-scenarios.md) after Steps 2–6. Keep US-005 single-role cases green (TC06).

---

## Two traps

**Trap 1 — Drop the unique constraint and ship menus unchanged**

`get_all_permissions`, sidebar `has_role`, and `YardAdminBase._yard_role` would **union**. A Gateman+Scaling user would see both queues and pass both write URLs. Step 6 is not polish; it is the security model.

**Trap 2 — Keep department-first invite JS**

Gateman and Scaling Operator are different departments. If Role choices stay filtered to one department, Flow A / TC01 cannot be saved. Group by department; allow a mixed set (L3).

---

## Out of scope

- Permission union (archived US-004).
- Dual-hat Tenant Super Admin / Tenant Admin / Driver / Helper / vendor portal.
- Assigning Super Admin.
- Mobile role picker.
- JWT `working_role` claim.
- Turning on `UserRoleInline` as a parallel editor.
- Named allowlist of dual-hat pairs.
- Per-role POI matrix on **invite** (one POI is enough for P0; different POIs are **edit**).

---

## File touch list (expected)

| Area | Files |
|------|--------|
| Policy | `role_assignment_policy.py` (or `role_set_policy.py`) |
| DB | `users/models.py`, new `users` migration(s) (`UserRole` constraint, `InvitationToken.role_ids`) |
| Assign | `apps/core/rbac_service.py` |
| Invite | `invitation_service.py`, `invitation_views.py`, `invitation_serializers.py` |
| Admin | `apps/users/admin.py`, invite/change JS in the same module |
| CSV | `apps/users/import_configs.py` |
| Working role | new `apps/users/working_role.py` (or `apps/core/working_role.py`), view + url, template include, `portal_nav.py` tag, `config/urls.py`, `config/settings/base.py` MIDDLEWARE |
| Auth consumers | `role_access.py`, `User.get_all_permissions`, `portal_navigation.py`, `admin_base.py`, `dashboard_scope.py`, `dashboard_service.py`, yard `has_role` authorization call sites |
| Auth consumers (sweep — grep `.has_role(` before closing this story) | `apps/transport/admin.py` (`_GATE_TO_VIEW_ROLES`, `qc_inspector_physical`/`poi_admin` queryset + `has_view_permission` gating for Transport Orders), `apps/requisitions/admin.py` (`procurement_officer` PR queue visibility filter), `apps/operations/gate/admin.py`, `apps/operations/gate/gate_poi.py` (gate write role→POI resolution) |
| Second invite path (do not skip — separate from `invitation_views.py`) | `apps/users/serializers.py` (`InvitationSerializer`), `apps/users/services.py` (`UserService.invite_user`), `apps/users/views.py` (`UserViewSet.invite`) |
| Audit | `apps/audit/services.py` |
| Tests | `tests/unit/test_core/test_rbac_service.py`, new `test_working_role.py`, invitation + import tests |
| Specs | this file; rbac.md §3.1; tenant-user-management.md; role-dashboard-kpi-widgets.md §3 |

---

## Definition of done (code)

- [ ] AC-0–AC-6 from TUM-06
- [ ] `uniq_userrole_user_single_role` gone; `unique(user, role)` present; one-role users still valid
- [ ] `assign_role_to_user` does not delete sibling operational roles
- [ ] Invitation applies all `role_ids`
- [ ] Select Role shown iff assigned count > 1; checks use working role only
- [ ] Unit tests for switch, exclusive set, no cap, single-role hide
- [ ] US-005 single-role invite still green
