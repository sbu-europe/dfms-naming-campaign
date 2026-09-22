---
module: 03-users
specification: TUM-06 — Assign multiple operational roles; working-role switcher (no permission union)
version: 2.0
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

Implements [TUM-06](../../03-backlog/phase-2/sprints/sprint-10/01-Multi-role%20Tenant%20Users/TUM-06-multi-role-assignment.md). Amends [tenant-user-management.md](./tenant-user-management.md) and [rbac.md](../01-foundation/rbac.md) §3.1.

**Problem:** DFMS stores and authorizes **one role per user**. Dual-hat sites (Gate + Scale, DO + DM) need two catalog roles on one account — without a second login and without merging permissions.

**Rule:** A user may hold **many operational** roles but works as **exactly one** selected role at a time (same idea as Working site — no permission union). Tenant Super Admin, Tenant Admin, Driver, Helper stay single-role. Super Admin is never assignable.

**Sequencing:** Ship Step 2 (persistence) and Step 6 (switcher) **together**. Persistence without the switcher is a regression — the DB allows two roles while menus still union permissions or pick "first assigned" (see Trap 1).

---

## Build order

| # | Step | Why this order |
|---|------|-----------------|
| 1 | Policy in baseline specs | So implementers don't re-introduce "one role" language mid-build |
| 2 | Persistence (`UserRole`, `assign_role_to_user`) | Foundation everything else writes to |
| 3 | Invite + activation (all 3 entry points) | Only way multi-role users get created |
| 4 | Admin edit UX | Only way to add/remove roles on existing users |
| 5 | CSV / bulk | Third way to assign roles — same validation as #3/#4 |
| 6 | Working-role switcher | **Ship with #2.** This is what prevents permission union |
| 7 | Audit + cache | Depends on #2–#6 existing |
| 8 | Tests | Lock in behavior; some existing tests assume single-role and must change |

---

## File-by-file change map

The core of this plan. Each row: what changes, and why.

### Persistence & assignment (Step 2)

| File | Change | Why |
|------|--------|-----|
| `apps/users/models.py` | `UserRole.Meta.constraints`: drop `uniq_userrole_user_single_role` (user-only), add `UniqueConstraint(["user", "role"], name="uniq_userrole_user_role")` | Today's constraint physically forbids a second role row. Duplicate `(user, role)` still rejected. |
| new `apps/users` migration | Constraint swap above | — |
| `apps/core/rbac_service.py::assign_role_to_user` | Stop deleting sibling `UserRole` rows ("Single-role system" comment). `get_or_create(user, role)` instead; validate the **resulting** role set via the new `validate_role_set` (see below) | Current code deletes every other role before writing the new one — this is *the* replace-on-assign bug the whole story exists to fix |
| `apps/core/rbac_service.py` (new) | Add `sync_user_roles(user, roles, *, assigned_by, poi_by_role_id)` — diffs current vs. desired set, creates/deletes rows, never sets `is_active=False`, returns `{added, removed, resulting}` | Admin edit needs to add **and** remove roles in one save; `assign_role_to_user` stays add-only (invite/API can't accidentally remove a role) |
| `apps/users/role_assignment_policy.py` (or new `role_set_policy.py`) | Add `EXCLUSIVE_TARGET_ROLE_CODES` + `validate_role_set(role_codes)` — rejects >1 exclusive role, rejects `super_admin` | Single place enforcing BR-TUM06-005; called from admin `clean()`, CSV validate, `create_invitation`, `assign_role_to_user`, `sync_user_roles` |

### Invite + activation (Step 3) — **three separate entry points, not one**

| File | Change | Why |
|------|--------|-----|
| `apps/users/models.py::InvitationToken` | Add `role_ids = JSONField(default=list, blank=True)`. Keep FK `role` = `role_ids[0]` | Existing list columns / resend keep working off `role`; `role_ids` carries the full set |
| `apps/users/invitation_serializers.py::CreateInvitationSerializer` | `role_ids` field: lift `max_length=5` (draft cap), keep `min_length=1` | No fixed cap per AC-1 |
| `apps/users/invitation_service.py::create_invitation` | Signature → `role_ids: list[UUID]`. Validate set + `user_may_assign_role` per id. Derive `department_key` from first role if not sent | Currently takes singular `role_id` |
| `apps/users/invitation_service.py::create_invitation_for_provisioned_user` | Same signature change as above | **Easy to miss** — sibling function, same singular-`role_id` bug, no callers updated automatically |
| `apps/users/invitation_service.py::activate_invitation` | Loop `inv.role_ids or [inv.role_id]` → `assign_role_to_user` per id. Per POI-scoped role: `UserOperationalPOI.update_or_create(...)`. Call `sync_tenant_admin_flags_from_role` only when the resulting set is a single admin role | Today only `inv.role` is applied — role 2+ is silently dropped on activation |
| `apps/users/invitation_views.py::TenantInvitationListCreateView.post` | Pass `data["role_ids"]` through to `create_invitation`, not `[0]` | REST invite path #1 |
| `apps/users/serializers.py::InvitationSerializer` | `role_id` (UUID) → `role_ids` (list of UUID) | REST invite path #2 — **a second, independent invite endpoint** that the story could easily ship without touching |
| `apps/users/services.py::UserService.invite_user` | `role_id` param → `role_ids` | Wraps `create_invitation`; called by path #2 |
| `apps/users/views.py::UserViewSet.invite` | Pass the list through | Entry point for REST invite path #2 |
| `apps/users/admin.py::InviteUserForm.role` | `ChoiceField` → `MultipleChoiceField` rendered as `CheckboxSelectMultiple`, same two-column grid layout as the edit form | Consistent widget across invite and edit; checkboxes make "pick any combination" visually obvious |
| `apps/users/admin.py` (`InviteUserForm` save) | Pass all selected role ids, not a single `_role_id` | Admin invite is path #3 |

Single-role invites (`role_ids` length 1) must keep working on all three paths.

### Admin edit UX (Step 4)

| File | Change | Why |
|------|--------|-----|
| `apps/users/admin.py::UserAdminForm.role` | `ChoiceField` → `MultipleChoiceField` rendered as `CheckboxSelectMultiple` (one checkbox per role, grouped by department), choices minus forbidden codes, `tenant_admin` option only for Tenant Super Admin assigners | Today's single dropdown can't represent >1 role; checkboxes read faster than a multi-select listbox for a small, grouped list; department-first filtering blocks cross-department dual-hats (Trap 2) |
| `apps/users/admin.py::UserAdminForm.clean()` | Call `validate_role_set` + per-code `user_may_assign_role`; require `operational_poi` (or per-role map) for any POI-scoped selection | Central validation point for forbidden combos |
| `apps/users/admin.py` (per-role POI, **every** POI-scoped role, not just assigned) | A `poi_role_<role_id>` dropdown field for **every** POI-scoped role in the catalog (`UserAdminForm.__init__`), prefilled from `UserOperationalPOI` where it already exists. Rendered inline right after that role's checkbox in the same `<li>` (JS `inlinePoiFields()`), hidden until its checkbox is checked, saved via per-role `update_or_create`/delete | AC-5/TC17: two local roles on one user may need different sites; a *newly* checked local role must get its own site picker immediately (no page reload) — not just roles the user already holds. Invite still uses one shared POI field (Out of scope: per-role POI matrix on invite) |
| `apps/users/admin.py` (CSS: `templates`/`Media.css` or inline `<style>` in the JS block) | Two-column grid layout for the Roles checklist: role checkboxes render in a responsive 2-column grid (`display: grid; grid-template-columns: repeat(2, minmax(0,1fr))`), each cell holding the checkbox label + its inline POI dropdown stacked underneath when shown | A single-column checkbox list for 10+ roles is a long scroll and looks like a bare Django default; two columns is the professional, compact layout for a small fixed catalog |
| `apps/users/admin.py::UserAdminForm.save_model` | Call `sync_user_roles` instead of `assign_role_to_user` once; write audit `{added, removed, resulting}` | `assign_role_to_user` is add-only — edit needs to remove roles too |
| `apps/users/admin.py` (changelist `primary_role` column) | Join all assigned role names, comma-separated | No "primary" role exists in the DB anymore |
| — | Do **not** enable `UserRoleInline` (`UserAdmin.inlines` stays `[]`) | Access fieldset must remain the single source of truth — avoids two editors disagreeing |

### CSV / bulk (Step 5)

| File | Change | Why |
|------|--------|-----|
| `apps/users/import_configs.py` | Parse `role` column as comma-separated codes (strip/lower/dedupe, order-preserving). One code still valid | Today one row = one `role_code` |
| `apps/users/import_configs.py` | Row-level failure (with reason) on: unknown code, forbidden combo, assigner denial, missing POI for a local role. Other rows unaffected | Bulk import must isolate bad rows, not abort the batch |
| `apps/users/import_configs.py` | One `poi_code` applies to every POI-scoped role on the row. Apply via `create_invitation(role_ids=...)` (new user) / `sync_user_roles` (existing user) — **never** `assign_role_to_user` alone | Post-Step-2, calling `assign_role_to_user` per code in a loop would only *add* — it wouldn't remove roles no longer on the row |

### Working-role switcher (Step 6) — **ships with Step 2, not after**

Copy the pattern from `apps/operations/yard_poi.py` + `admin_poi_views.py` + `poi_profile_switcher.html`.

| File | Change | Why |
|------|--------|-----|
| new `apps/users/working_role.py` (or `apps/core/`) | `WorkingRoleMiddleware`: after `AuthenticationMiddleware`, before `AdminMenuAccessMiddleware`. Resolves session/cookie `dfms_working_role_code` → falls back to lowest `role_code` if missing/removed → sets `request.user._working_role_code` → writes cookie on response | Same request-bound pattern as Working site (POI); avoids threading `request` through every call site |
| same file | View + URL `admin_set_working_role` (POST, `staff_member_required`, `next` hidden field) | Lets the user actually switch |
| `templates/admin/includes/` (new include, sibling of `poi_profile_switcher.html`) | `#dfms-role-profile` / `#dfms-role-select`, label **Select Role**; shown iff `len(assigned_role_codes) > 1` | AC-3: hidden for single-role users |
| `apps/requisitions/role_access.py::get_primary_role_code` | Return `_working_role_code` if set + still assigned; else the sole assigned role; else `None`. **Stop** walking `KNOWN_ROLES` as a tiebreaker | Today it returns the first `KNOWN_ROLES` match — not session-aware, and would silently union |
| `apps/users/models.py::User.get_all_permissions` | If `_working_role_code` set, load only that role's permissions. Cache key → `user_permissions_{pk}_{role_code}`. Unbound context (mgmt command/test) with several assigned roles → use the fallback code, never union | This is the actual permission union bug — today it unions every `UserRole` row |
| `apps/core/portal_navigation.py::_user_has_role` | Compare against working role, not `has_role` (membership) | Menu visibility must follow working role |
| `apps/operations/admin_base.py::YardAdminBase._yard_role` | Working role must be in `{operator} ∪ extra ∪ supervisor`, else `None`. Don't check `has_role(operator)` first | Currently prefers `has_role`, which unions |
| `apps/core/dashboard_scope.py::_resolve_role_code` | Use working role, not `codes[0]` | Dashboard scope picks an arbitrary first code today |
| `apps/core/dashboard_service.py::get_role_widgets` | Widgets for working role only | Currently unions every assigned code's widgets |
| `apps/transport/admin.py` (`_GATE_TO_VIEW_ROLES`, `qc_inspector_physical`/`poi_admin` queryset + `has_view_permission`) | Sweep `.has_role(...)` used for TO visibility/write gating → use working role / `_yard_role` | **Not obviously covered by the above rows** — real gate for Transport Order write access; a Gateman+Scaling user must not see both queues |
| `apps/requisitions/admin.py` (`procurement_officer` PR queue filter) | Same sweep | PR queue visibility currently keyed off `has_role` directly |
| `apps/operations/gate/admin.py`, `apps/operations/gate/gate_poi.py` | Same sweep (gate write role→POI resolution) | Gate write actions resolve role via `has_role` loop |
| — | `has_role` stays as-is for **membership** uses only (populating Select Role choices, fallback validation) | L2 — `has_role` isn't wrong everywhere, only where it's used as an authorization decision |

On switch: invalidate both old and new working-role cache keys; redirect `next` (no second login). POI-scoped working roles keep using `get_working_poi_for_request(request, role_code=working)`.

### Audit + cache (Step 7)

| File | Change | Why |
|------|--------|-----|
| `apps/audit/services.py` | Role assign/remove writes `AuditLog` (`UPDATE`, action `User.Roles`) with `details={added, removed, resulting}` | AC-6 — audit the set, not a single role |
| `apps/audit/services.py::_write_audit_log_now` | Stamp `details["working_role"]` from `get_primary_role_code(request.user)` on every subsequent audited action | AC-6 — a gate-in by a Gateman/Scaling dual-hat must record which hat was active |
| `apps/core/rbac_service.py::invalidate_user_permission_cache` | Enumerate the user's assigned role codes (old + new set on switch/assign/remove) and delete each `user_permissions_{id}_{role_code}` key explicitly. **Do not** use `cache.delete_pattern(...)` | Prod (`django_redis`) supports pattern-delete, but `config/settings/testing.py` uses `LocMemCache`, which doesn't — a pattern-delete call passes in prod and breaks tests |

---

## Locked decisions (do not re-open in review)

Closes TUM-06-1. Matches AC-1 / Flow A / the E2E plan — only re-open if the PO changes the story.

| ID | Decision |
|----|----------|
| L1 | Any allowed operational combination, no cap, no named allowlist. Exclusive targets: `tenant_super_admin`, `tenant_admin`, `driver`, `driver_helper`. No `vendor` staff role exists in `SEED_ROLES`. |
| L2 | No permission union — working role only. `has_role` stays assigned-set membership (needed for Select Role choices + fallback). |
| L3 | Cross-department dual-hats are required (Gateman + Scaling). Role widget is checkboxes (`CheckboxSelectMultiple`), rendered in a two-column grid (not one long list), grouped by department, not filtered to one. `department` fields become display-only, derived from first selected role. |
| L4 | Invite/CSV: one POI applies to every selected POI-scoped role (single shared `operational_poi` field, no per-role dropdown). Edit: **every** POI-scoped role in the catalog has its own POI dropdown (not just already-assigned ones) — it appears inline next to that role's checkbox as soon as it's checked (whether newly checked or already assigned), and hides again when unchecked. Global roles clear POI rows for that role only. |
| L5 | `InvitationToken.role_ids` (JSONField). `role` FK stays `role_ids[0]` for backward compat. Empty `role_ids` on old rows → treat as `[role_id]`. |
| L6 | Working-role persistence copies Working site exactly: session + HttpOnly cookie, `admin_set_working_role` POST, middleware binds `_working_role_code`. Don't thread `request` through every call site. |
| L7 | Fallback role = remaining assigned role with lowest `role_code`. One role → hide switcher. Removing a role never deactivates the account. |
| L8 | Admin Access fieldset is the only role editor (`UserRoleInline` stays disabled). Edit save syncs the full set; invite/API stays add-only. |
| L9 | Django admin SSR is P0. REST invite must apply all `role_ids`. No new JWT claim in this story. |
| L10 | `is_approver`/`is_requester` stay a union of assigned roles (JWT leftover only) — do **not** recompute on switch (races across tabs). Portal/admin auth must use working-role permissions instead, never these flags. |

Self-approval stays `created_by == request.user` — already role-independent. Switching DO → DM must not approve own TRs (BR-TUM06-003).

---

## Two traps

1. **Drop the unique constraint, ship menus unchanged.** `get_all_permissions`, sidebar `has_role`, `YardAdminBase._yard_role` would union — a Gateman+Scaling user would see both queues and pass both write URLs. Step 6 is the security model, not polish.
2. **Keep department-first invite JS.** Gateman and Scaling Operator are different departments; filtering Role choices to one department makes Flow A / TC01 impossible to save. Group by department, allow a mixed set (L3).

---

## Out of scope

- Permission union (archived US-004) · Dual-hat admin/driver/helper/vendor roles · Assigning Super Admin · Mobile role picker · JWT `working_role` claim · `UserRoleInline` as a parallel editor · Named dual-hat allowlist · Per-role POI matrix on invite (edit only).

---

## Tests (Step 8)

- `assign_role_to_user` adds a second role without deleting the first; duplicate `(user, role)` rejected.
- Exclusive combos rejected (admin+gateman, driver+gateman, two roles on Tenant Admin).
- Invite activation with `role_ids` length 2 → two `UserRole` + two `UserOperationalPOI` rows (same POI).
- `role_ids` length 1 still works, on all three invite paths.
- CSV: forbidden-combo row fails in isolation.
- `get_primary_role_code` / `get_all_permissions` with `_working_role_code="gateman"` exclude scaling permissions.
- Middleware fallback when the working role is removed mid-session.
- Operational user cannot assign roles (`user_may_assign_role` False).
- Self-approval still denied after switching to DM.
- Update `test_effective_access_scope_global_wins` — currently asserts replace-on-assign.
- Before merging, grep `UserRole.objects.get(user=` (hits in `test_seed_dfms_rbac_removed_roles.py`, `test_import_configs.py` ×4, `test_replace_super_admin.py` ×2, `test_invitation_service.py`) — these assume one row per user and will raise `MultipleObjectsReturned` if a fixture is later extended to a second role.

Playwright: [tum-06-multi-role-assignment-e2e-scenarios.md](../../09-testing/backend/e2e-scenarios/stories-phase-2/010-Multi-role%20Tenant%20Users/tum-06-multi-role-assignment-e2e-scenarios.md), run after Steps 2–6. Keep US-005 single-role cases green (TC06).

---

## Definition of done

- [ ] AC-0–AC-6 from TUM-06
- [ ] `uniq_userrole_user_single_role` gone; `unique(user, role)` present; one-role users still valid
- [ ] `assign_role_to_user` no longer deletes sibling roles
- [ ] All three invite paths apply the full `role_ids` set
- [ ] Select Role shown iff assigned count > 1; every auth check listed above uses working role
- [ ] Unit tests: switch, exclusive set, no cap, single-role hides switcher
- [ ] US-005 single-role invite still green
