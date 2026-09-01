---
jira_key: ~
jira_type: Story
jira_sprint: "Sprint 9"
story_id: TUM-06
title: Tenant User — Assign Multiple Operational Roles to One User
epic: Tenant User Management — Multi-Role Assignment
status: Pending
story_points: 13
assignee: ~
prd_refs:
  - "DFMS_Product_Requirements_Document_v3.md § User Invitation (one or more roles)"
  - "05-modules/01-foundation/rbac.md § 3.1 User-Role Assignment"
  - "05-modules/03-users/tenant-user-management.md"
phase: Phase 1
related_stories:
  - TUM-01 / US-005 (User Invitation & Activation) — shipped as single-role
  - US-004 (Role Hierarchy) — permission union sketched as an edge case
  - TUM-05 / US-009 (Audit logs — acting role)
---

# TUM-06 — Assign Multiple Operational Roles to One User

## User Story

**As a** Tenant Super Admin or Tenant Admin  
**I want to** assign more than one operational role to the same user  
**So that** one person can cover dual hats (for example gateman + scaling at one site) without creating a second account.

**As a** dual-hatted user  
**I want** every action permitted by **any** of my assigned roles, and none outside that union  
**So that** the admin never shows only role A’s screens when I also hold role B.

---

## Business Context

Smaller sites often need one person to cover two jobs — for example Gate and Scale at the same depot, or a Distribution Officer who can also approve when the manager is away. Today DFMS allows **only one role per user**. Admins either create a second login or keep changing that person’s role. That is slow, easy to get wrong, and it hides who actually did the work.

This story lets **Tenant Super Admin** and **Tenant Admin** give a user **multiple** roles — as many as they need, with no fixed cap. That includes a **Tenant Admin** who also holds operational jobs (for example Tenant Admin + Gateman). After login, that person can do everything those roles allow — not only the first role on the list. They still cannot approve their own requests.

**Tenant Super Admin** is the exception: that account stays **one role only**. Driver, Helper, and Vendor also stay single-role. Invitation already shipped as one role per person; this is new capability, not unfinished invite work.

---

## Acceptance Criteria

### AC-0 — Who may assign

- [ ] **Tenant Super Admin** can assign multiple roles to a user, including **Tenant Admin plus operational roles** (invite, user edit, CSV).
- [ ] **Tenant Admin** can assign multiple **operational** roles to a user (invite, user edit, CSV), including adding operational roles to a user who already is Tenant Admin.
- [ ] A user who is neither Tenant Super Admin nor Tenant Admin (nor platform Super Admin) cannot assign roles.
- [ ] Tenant Admin still cannot assign Tenant Super Admin or Super Admin. Tenant Admin still cannot grant the Tenant Admin role (existing delegation: Tenant Super Admin only).

### AC-1 — Cardinality & assignment

- [ ] A user may hold **multiple** roles at once. There is **no fixed cap**. The set is whatever the admin assigns (invite, edit, or CSV), as long as each role is allowed.
- [ ] **Tenant Super Admin** may hold **only one** role.
- [ ] **Tenant Admin** may be combined with operational roles.
- [ ] Assigning an additional allowed role **adds** a `UserRole` row; it does not delete the previous one.
- [ ] Removing a role deletes that assignment only; other roles remain.
- [ ] Duplicate role on the same user is rejected (keep `unique(user, role)`).
- [ ] Exclusive-role combinations (BR-TUM06-005) are rejected with a clear validation error (admin + API + CSV).

### AC-2 — Invite, edit, CSV

- [ ] Invite User and User Edit replace the single Role dropdown with multi-select (still department-filtered; Super Admin hidden). The form is usable by **Tenant Super Admin** and **Tenant Admin**.
- [ ] Invitation applies **all** selected `role_ids` on activation — not only `role_ids[0]`.
- [ ] CSV accepts multiple role codes on one row (comma-separated `role` / `role_code`); a forbidden combo fails that row with a reason.
- [ ] Existing single-role invites, edits, and CSV rows keep working (one role is still valid).

### AC-3 — Authorization is the union

- [ ] `get_all_permissions` / `has_dfms_permission` return the union of all assigned active roles.
- [ ] `has_role(code)` is true if **any** assigned role matches.
- [ ] Given roles A and B, the user can perform every action permitted by A **or** B, and cannot perform anything outside that union.
- [ ] Self-approval is still denied when `created_by == request.user`.

### AC-4 — Admin / portal must not pick a winner role

- [ ] Menus, fieldsets, and queues that the user should see from role B are visible even if `get_primary_role_code()` would return role A.
- [ ] No shipped admin screen for in-scope modules hides B’s actions solely because A is “first”.
- [ ] If two roles have different default home pages, one landing is chosen; that must not hide B’s nav items.

### AC-5 — POI per local role

- [ ] Each POI-scoped role still requires its own site assignment.
- [ ] A user may have different POIs for different local roles.
- [ ] A global operational role must not require a POI; leftover POI rows for a role that is no longer POI-scoped are cleared for **that role only**.

### AC-6 — Audit

- [ ] Invite / assign / remove logs the **set** of role codes (added, removed, resulting), actor, and timestamp.
- [ ] Subsequent audited actions still record the acting user’s roles at event time (not a later role set).

### AC-7 — Specs (context repo)

- [ ] `05-modules/01-foundation/rbac.md` §3.1 states multi-role as Phase 1 policy (union, no fixed cap, forbidden combos, no primary-role product concept). Remove the “one primary / edge case” split.
- [ ] `05-modules/03-users/tenant-user-management.md` invite/edit/CSV/audit match AC-0, AC-2 and AC-6 (both Tenant Super Admin and Tenant Admin may multi-assign; multi-select, not dropdown; “roles added/removed”).
- [ ] Do **not** add a story under `01-source/01-prd/`. BA may patch the v3 PRD separately after this story.

---

## Functional Flows

### Flow A — Invite with two operational roles

```
Tenant Super Admin or Tenant Admin → Invite User
  → Department(s) / roles: Gateman + Scaling Operator (same POI)
  → Invitation sent
  → User activates
  → UserRole × 2, UserOperationalPOI × 2 (same poi, two role_ids)
  → Login: gate + scale menus both available
```

### Flow B — Add a role to an existing user

```
User has Distribution Officer only
  → Tenant Super Admin or Tenant Admin edits user, adds Distribution Manager
  → Second UserRole row created (DO kept)
  → Permission cache invalidated
  → User can create TRs (DO) and approve others’ TRs (DM); cannot approve own TR
```

### Flow C — Tenant Admin plus an operational role (allowed)

```
Tenant Super Admin invites or edits a user
  → Roles: Tenant Admin + Gateman
  → Both assignments saved
  → User has tenant admin screens and gate operations
```

Tenant Admin may add Gateman to a user who **already** is Tenant Admin. Tenant Admin may **not** grant the Tenant Admin role itself.

### Flow D — Forbidden: Tenant Super Admin plus anything

```
Anyone tries Tenant Super Admin + Gateman (or a second role on a Tenant Super Admin)
  → Validation error; no rows written
```

### Flow E — CSV

```
Row: email=..., role=gateman,scaling_operator, poi_code=DEPOT-01
  → Two assignments on activate/import
Row: email=..., role=tenant_admin,gateman   (imported by Tenant Super Admin)
  → Two assignments
Row: email=..., role=tenant_super_admin,gateman
  → Row fails; other rows unaffected
Row: email=..., role=driver,gateman
  → Row fails
```

---

## Business Rules

| ID | Rule |
|---|---|
| BR-TUM06-001 | No fixed cap. A user may hold multiple allowed roles. Duplicate role on the same user is still rejected. **Tenant Super Admin** is the exception (one role only). |
| BR-TUM06-002 | Permissions = union of assigned active roles |
| BR-TUM06-003 | Self-approval prevention ignores role count |
| BR-TUM06-004 | Super Admin is never assignable via invite/edit/CSV |
| BR-TUM06-005 | As **targets**, these roles stay exclusive (cannot combine with any other role): **Tenant Super Admin**, Driver, Helper, Vendor. **Tenant Admin may be combined** with operational roles. |
| BR-TUM06-006 | POI-scoped roles require a site **per role** |
| BR-TUM06-007 | Removing a role does not deactivate the user account |
| BR-TUM06-008 | `assign_role_to_user` must not delete other allowed operational assignments |
| BR-TUM06-009 | **Tenant Super Admin** and **Tenant Admin** may assign multiple roles as in AC-0. Operational users may not. Only Tenant Super Admin may grant the Tenant Admin role. Tenant Admin may not grant Tenant Admin or Tenant Super Admin. |

---

## Sub-tasks

| # | Sub-task | Description | Priority | Status |
|---|---|---|---|---|
| TUM-06-1 | Policy + specs | Confirm open questions with PO; update `rbac.md` §3.1 and `tenant-user-management.md` | High | Not done |
| TUM-06-2 | Persistence | Drop `uniq_userrole_user_single_role`; keep `unique(user, role)`; `assign_role_to_user` adds (allowed) instead of replace | High | Not done |
| TUM-06-3 | Invite + activation | Persist and apply all `role_ids`; stop taking only `[0]` | High | Not done |
| TUM-06-4 | Admin edit UX | Multi-select roles + per-role POI; usable by Tenant Super Admin and Tenant Admin; validation for forbidden combos | High | Not done |
| TUM-06-5 | CSV / bulk | Comma-separated roles; row-level errors for forbidden / missing POI; same two assigners as invite/edit | Medium | Not done |
| TUM-06-6 | Primary-role branches | Audit `get_primary_role_code` / `first_role` / role-name admin branches; union-safe for in-scope modules | High | Not done |
| TUM-06-7 | Audit + cache | Role set on assign/remove; invalidate permission cache; acting-role-set on later events | Medium | Not done |
| TUM-06-8 | Tests | Unit: add/remove/union/forbidden; no cap; Tenant Super Admin and Tenant Admin can multi-assign; operational user cannot; single-role regression | High | Not done |

---

## Dependencies

| Dependency | Notes |
|---|---|
| TUM-01 invitation flow | Extend; do not reopen as unfinished |
| `apps.core.rbac_service.assign_role_to_user` | Today replace-on-assign — must change in TUM-06-2 |
| `apps.requisitions.role_access.get_primary_role_code` | Tie-break only; must not hide union menus (TUM-06-6) |
| `UserOperationalPOI` | Already unique on `(user, poi, role)` |
| PO sign-off on open questions | Blocks TUM-06-2 if they want a named list of dual-hats instead of any allowed combination |

---

## Open Questions (for PO / client) — resolve before TUM-06-2

1. **Allow-list vs any allowed combo?** If the real need is a few named dual-hats, use that list. Otherwise any combination of allowed roles (no cap).
2. **Landing page** when Transport Planner and a yard role are both assigned — TP map vs yard queue?
3. **Cross-department** (e.g. Distribution Officer + Gateman) — allowed in v1 or not?
4. ~~Should Tenant Admin as a target stay exclusive?~~ **Resolved:** Tenant Admin **may** hold additional operational roles. Only **Tenant Super Admin** (among admin roles) stays one-role-only.

Until (1) is answered, implement any allowed combination with **no fixed cap**.

---

## Test Plan

- [ ] User with one role: invite, edit, login, permissions — unchanged
- [ ] Tenant Super Admin invites Gateman + Scaling (same POI) → both queues/actions available after activation
- [ ] Tenant Admin invites Gateman + Scaling (same POI) → same outcome as Tenant Super Admin
- [ ] Operational user (e.g. Distribution Officer) cannot invite or edit another user’s roles
- [ ] Edit: add second operational role → first role remains; permission cache refresh without re-login (or on next request)
- [ ] Edit: remove one of two roles → remaining role still works
- [ ] Edit: add a third allowed role → all three remain
- [ ] Tenant Super Admin + Gateman rejected; Driver + Gateman rejected
- [ ] Tenant Super Admin assigns Tenant Admin + Gateman → both roles work
- [ ] Tenant Admin adds Gateman to an existing Tenant Admin user → both roles work
- [ ] Tenant Admin cannot grant the Tenant Admin role to someone else
- [ ] User with DO + DM can approve others’ TRs and cannot approve own
- [ ] CSV comma-separated roles success; forbidden combo row fails
- [ ] Admin screen that previously used `get_primary_role_code` still shows role B’s actions
- [ ] Audit shows added/removed role set

---

## Definition of Done

- [ ] All acceptance criteria AC-0–AC-7 met
- [ ] Sub-tasks TUM-06-1 … TUM-06-8 completed
- [ ] `uniq_userrole_user_single_role` removed; one-role users still valid
- [ ] `assign_role_to_user` no longer deletes other allowed operational roles
- [ ] Invitation no longer ignores `role_ids[1:]`
- [ ] `rbac.md` and `tenant-user-management.md` updated; **no** new file under `01-source/01-prd/`
- [ ] Unit tests cover union, forbidden combos, no fixed cap, and single-role regression
- [ ] Story status updated for Sprint 9 tracking

---

## Notes

- Removing the unique constraint without TUM-06-6 is a regression: the DB will allow two roles while admin still honours one.
- `InvitationSerializer.role_ids` `max_length=5` is leftover from a draft cap — lift it so all selected allowed roles are applied.
- Archived US-004 already described multi-role union as an edge case; this story makes it Phase 1 policy with forbidden combos, not a numeric cap.
- Suggested PRD delta (BA, later): RBAC user story is no longer strictly 1:1; invite form is multi-select; keep Super Admin out of invitation.
