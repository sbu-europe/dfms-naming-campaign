---
jira_key: ~
jira_type: Story
jira_sprint: ~
story_id: TUM-06
title: Tenant User — Assign Multiple Operational Roles to One User
epic: Tenant User Management — Multi-Role Assignment
status: Pending
story_points: 13
assignee: farhaT23
prd_refs:
  - "DFMS_Product_Requirements_Document_v3.md § User Invitation (one or more roles)"
  - "05-modules/01-foundation/rbac.md § 3.1 User-Role Assignment"
  - "05-modules/03-users/tenant-user-management.md"
phase: Phase 2
related_stories:
  - TUM-01 / US-005 (User Invitation & Activation) — shipped as single-role
  - US-004 (Role Hierarchy) — original spec used permission union; this story uses a working-role switcher instead
  - TUM-05 / US-009 (Audit logs — acting role)
e2e_scenarios:
  - "../../../../../09-testing/backend/e2e-scenarios/sprint-10/tum-06-multi-role-assignment-e2e-scenarios.md"
---

# TUM-06 — Assign Multiple Operational Roles to One User

## User Story

**As a** Tenant Super Admin or Tenant Admin  
**I want to** assign more than one operational role to the same user, and assign **multiple POIs to each local role**  
**So that** one person can cover dual hats (for example gateman + scaling) and the same hat at more than one site, without a second account.

**As a** dual-hatted user  
**I want to** pick which of my assigned roles I am working as, then pick which of that role’s assigned POIs I am working at  
**So that** menus follow the working role, and queues stay scoped to the working site, until I switch.

**E2E scenarios:** [tum-06-multi-role-assignment-e2e-scenarios.md](../../../../../09-testing/backend/e2e-scenarios/sprint-10/tum-06-multi-role-assignment-e2e-scenarios.md)

---

## Business Context

Smaller sites often need one person to cover two jobs — for example Gate and Scale at the same depot, or a Distribution Officer who can also approve when the manager is away. Today DFMS allows **only one role per user**. Admins either create a second login or keep changing that person’s role. That is slow, easy to get wrong, and it hides who actually did the work.

This story lets **Tenant Super Admin** and **Tenant Admin** give a user **multiple operational** roles — as many as they need, with no fixed cap — and give each **local (POI-scoped) role its own set of sites**, also with no fixed cap. After login, that user **selects one working role** (Select Role) and, when that role has more than one assigned site, **selects one working POI** (Working site, listing only that role’s assigned POIs). Until they switch, they only see and do what that role can do at that site. They still cannot approve their own requests.

Select Role and Working site stay **two independent controls** (not a combined `(role, POI)` picker). Tenant Admin / Tenant Super Admin Working site (all active POIs) is unchanged.

**Tenant Super Admin** and **Tenant Admin** stay **one role only** — they are administrators, not dual-hats. Driver, Helper, and Vendor also stay single-role. Invitation already shipped as one role per person; this is new capability, not unfinished invite work.

---

## Acceptance Criteria

### AC-0 — Who may assign

- [ ] **Given** a Tenant Super Admin  
  **When** they invite, edit, or CSV-import a user  
  **Then** they can assign multiple **operational** roles, or assign **Tenant Admin** alone. They cannot combine Tenant Admin (or Tenant Super Admin) with any other role.

- [ ] **Given** a Tenant Admin  
  **When** they invite, edit, or CSV-import a user  
  **Then** they can assign multiple **operational** roles. They cannot add a second role to a Tenant Admin or Tenant Super Admin.

- [ ] **Given** a user who is neither Tenant Super Admin nor Tenant Admin (nor platform Super Admin)  
  **When** they attempt to assign roles  
  **Then** the action is denied.

- [ ] **Given** a Tenant Admin  
  **When** they try to assign Tenant Super Admin, Super Admin, or the Tenant Admin role  
  **Then** those grants are denied (existing delegation: Tenant Super Admin only may grant Tenant Admin).

### AC-1 — Cardinality & assignment

- [ ] **Given** an allowed set of roles  
  **When** a Tenant Super Admin or Tenant Admin assigns them via invite, edit, or CSV  
  **Then** the user may hold **multiple operational** roles at once with **no fixed cap**; the set is whatever the admin assigns, as long as each role is allowed and none is exclusive (BR-TUM06-005).

- [ ] **Given** a Tenant Super Admin account  
  **When** anyone tries to add a second role to it  
  **Then** Tenant Super Admin may hold **only one** role; the extra assignment is rejected.

- [ ] **Given** a Tenant Admin account  
  **When** anyone tries to add a second role to it  
  **Then** Tenant Admin may hold **only one** role; the extra assignment is rejected.

- [ ] **Given** a user who already has an allowed role  
  **When** an additional allowed role is assigned  
  **Then** a `UserRole` row is **added**; the previous assignment is not deleted.

- [ ] **Given** a user with more than one assigned role  
  **When** one role is removed  
  **Then** only that assignment is deleted; other roles remain.

- [ ] **Given** a user who already has a given role  
  **When** the same role is assigned again  
  **Then** the duplicate is rejected (`unique(user, role)` is kept).

- [ ] **Given** an exclusive-role combination (BR-TUM06-005)  
  **When** it is submitted via admin, API, or CSV  
  **Then** it is rejected with a clear validation error.

### AC-2 — Invite, edit, CSV

- [ ] **Given** a Tenant Super Admin or Tenant Admin  
  **When** they open Invite User or User Edit  
  **Then** the single Role dropdown is replaced with multi-select (still department-filtered; Super Admin hidden).

- [ ] **Given** an invitation with more than one selected `role_ids`  
  **When** the user activates  
  **Then** the system applies **all** selected `role_ids` — not only `role_ids[0]`.

- [ ] **Given** a CSV row with comma-separated `role` / `role_code` values  
  **When** it is imported  
  **Then** multiple role codes on one row are accepted; a forbidden combo fails that row with a reason.

- [ ] **Given** Invite User when any selected role is POI-scoped  
  **When** the admin picks Site (POI)  
  **Then** Site (POI) is a **multi-select**; **at least one** site is required; the selected sites apply to **every** selected local role (one site is still valid). Per-role POI sets are refined on User edit.

- [ ] **Given** a CSV row with comma-separated `poi_code` values  
  **When** it is imported  
  **Then** those sites apply to every POI-scoped role on the row; a local role with no site fails that row with a reason. One `poi_code` is still valid.

- [ ] **Given** existing single-role invites, edits, and CSV rows  
  **When** they are processed after this change  
  **Then** they keep working (one role and one POI are still valid).

### AC-3 — Working role (no permission union)

- [ ] **Given** a user with more than one assigned role  
  **When** they use the portal or APIs  
  **Then** there is **no union** of permissions across assigned roles.

- [ ] **Given** a user with **more than one** assigned role  
  **When** they are in the portal  
  **Then** the portal shows a **Select Role** control modelled on **Select POI** (profile / header switcher).

- [ ] **Given** a user with multiple assigned roles  
  **When** they pick one as the **working role**  
  **Then** menus, landing page, queues, fieldsets, and API/admin checks follow **that role only**.

- [ ] **Given** a user already logged in with a working role  
  **When** they switch to another assigned role  
  **Then** that role’s screens and permissions apply immediately (no second login).

- [ ] **Given** a user with **one** role  
  **When** they use the portal  
  **Then** Select Role is hidden (or disabled) and that role is the working role.

- [ ] **Given** a working role stored for the session (same persistence idea as working POI)  
  **When** the admin removes the current working role  
  **Then** the session falls back to a remaining assigned role.

- [ ] **Given** a request where `created_by == request.user`  
  **When** the user switches working role and tries to approve it  
  **Then** self-approval is still denied.

### AC-4 — Portal follows the working role

- [ ] **Given** `get_primary_role_code` / equivalent checks  
  **When** they resolve the user’s role  
  **Then** they use the **working role**, not “first assigned”.

- [ ] **Given** the user is working as role A  
  **When** they view menus and actions  
  **Then** role B’s menus and actions are **not** shown.

- [ ] **Given** the user selects role B  
  **When** the portal refreshes to that working role  
  **Then** they see B’s landing and can only perform B’s operations.

- [ ] **Given** the working role is POI-scoped and has **more than one** assigned POI  
  **When** the user is in the portal  
  **Then** **Working site** lists **only those assigned POIs** (not the whole tenant catalog). They pick one working POI without a second login.

- [ ] **Given** the working role is POI-scoped and has **one** assigned POI  
  **When** the user is in the portal  
  **Then** Working site is hidden (or disabled) and that site is the working POI.

- [ ] **Given** the user switches working role  
  **When** the new role is POI-scoped  
  **Then** Working site choices refresh to **that role’s** assigned POIs. If the current working POI is still assigned to the new role, keep it; otherwise fall back to a remaining assigned POI for that role (prefer `is_primary`).

### AC-5 — Multiple POIs per local role

- [ ] **Given** a POI-scoped role assigned to a user  
  **When** that role is saved  
  **Then** it requires **at least one** site. There is **no fixed cap** on how many POIs that role may hold.

- [ ] **Given** a local role already assigned to a user  
  **When** additional POIs are assigned for **that same role**  
  **Then** `UserOperationalPOI` rows are **added**; existing sites for that role are not deleted unless the admin removed them. Duplicate `(user, poi, role)` is rejected.

- [ ] **Given** a user with more than one local role  
  **When** POIs are assigned on User edit  
  **Then** each local role has its **own set** of POIs (per-role multi-select). Sets may overlap or differ.

- [ ] **Given** a global operational role (not POI-scoped)  
  **When** leftover POI rows exist for that role  
  **Then** the role must not require a POI, and leftover POI rows are cleared for **that role only**.

- [ ] **Given** a working POI stored for the session  
  **When** the admin removes that POI from the current working role  
  **Then** the session falls back to a remaining assigned POI for that role.

### AC-6 — Audit

- [ ] **Given** an invite, assign, or remove of roles  
  **When** the change is saved  
  **Then** the audit log records the **set** of role codes (added, removed, resulting), actor, and timestamp.

- [ ] **Given** a subsequent audited action  
  **When** it is logged  
  **Then** it records the **working role** at event time (the role the user had selected), not the full assigned set.

---

## Functional Flows

### Flow A — Invite with two operational roles

```
Tenant Super Admin or Tenant Admin → Invite User
  → Department(s) / roles: Gateman + Scaling Operator (same POI)
  → Invitation sent
  → User activates
  → UserRole × 2, UserOperationalPOI × 2 (same poi, two role_ids)
  → Login: Select Role shows Gateman and Scaling Operator
  → User selects Gateman → gate queue only at that site
  → User switches to Scaling Operator → scale screens only at that site
  → Working site hidden (one assigned POI)
```

### Flow B — Add a role to an existing user

```
User has Distribution Officer only
  → Tenant Super Admin or Tenant Admin edits user, adds Distribution Manager
  → Second UserRole row created (DO kept)
  → User selects Distribution Officer → can create TRs, cannot approve
  → User switches to Distribution Manager → can approve others’ TRs; cannot approve own
```

### Flow C — Forbidden: administrator plus anything

```
Anyone tries Tenant Admin + Gateman (or a second role on a Tenant Admin)
  → Validation error; no rows written

Anyone tries Tenant Super Admin + Gateman (or a second role on a Tenant Super Admin)
  → Validation error; no rows written
```

Tenant Admin may **not** grant the Tenant Admin role itself (existing delegation). Tenant Super Admin may grant Tenant Admin **alone**.

### Flow D — CSV

```
Row: email=..., role=gateman,scaling_operator, poi_code=DEPOT-01
  → Two roles; each local role gets that one POI
Row: email=..., role=gateman,scaling_operator, poi_code=DEPOT-01,DEPOT-02
  → Two roles; each local role gets both POIs
Row: email=..., role=tenant_admin,gateman
  → Row fails; other rows unaffected
Row: email=..., role=tenant_super_admin,gateman
  → Row fails; other rows unaffected
Row: email=..., role=driver,gateman
  → Row fails
```

### Flow E — Multiple POIs on one local role

```
Edit user: Gateman @ CTG-001 + CTG-002; Scaling Operator @ CTG-001
  → UserRole × 2, UserOperationalPOI × 3
  → Login: Select Role lists Gateman and Scaling Operator
  → Working as Gateman: Working site lists CTG-001 and CTG-002
  → User picks CTG-002 → gate queue for CTG-002 only
  → User switches to Scaling Operator → Working site hidden (only CTG-001);
    working POI falls back to CTG-001; scale screens for CTG-001 only
```

---

## Business Rules

| ID | Rule |
|---|---|
| BR-TUM06-001 | No fixed cap on **operational** roles. Duplicate role on the same user is still rejected. **Tenant Super Admin** and **Tenant Admin** stay one role only (administrators). |
| BR-TUM06-002 | No permission union. The user operates as the **working role** they selected. Permissions, menus, and landing match that role only. |
| BR-TUM06-003 | Self-approval prevention applies in the working role; switching role does not let a user approve their own request |
| BR-TUM06-004 | Super Admin is never assignable via invite/edit/CSV |
| BR-TUM06-005 | As **targets**, these roles stay exclusive (cannot combine with any other role): **Tenant Super Admin**, **Tenant Admin**, Driver, Helper, Vendor. |
| BR-TUM06-006 | POI-scoped roles require **at least one** site **per role**, with **no fixed cap**. Duplicate `(user, poi, role)` is rejected. Each local role has its own POI set (sets may overlap). Working site lists **only** the working role’s assigned POIs; hidden when that role has one site. Tenant Admin / Tenant Super Admin Working site (all active POIs) is unchanged. |
| BR-TUM06-007 | Removing a role does not deactivate the user account |
| BR-TUM06-008 | `assign_role_to_user` must not delete other allowed operational assignments |
| BR-TUM06-009 | **Tenant Super Admin** and **Tenant Admin** may assign multiple **operational** roles as in AC-0. Operational users may not. Only Tenant Super Admin may grant the Tenant Admin role (alone). Tenant Admin may not grant Tenant Admin or Tenant Super Admin. |

---

## Sub-tasks

| # | Sub-task | Description | Priority | Status |
|---|---|---|---|---|
| TUM-06-1 | Policy + specs | Confirm open questions with PO; update `rbac.md` §3.1 and `tenant-user-management.md` | High | Not done |
| TUM-06-2 | Persistence | Drop `uniq_userrole_user_single_role`; keep `unique(user, role)`; `assign_role_to_user` adds (allowed) instead of replace | High | Not done |
| TUM-06-3 | Invite + activation | Persist and apply all `role_ids`; stop taking only `[0]` | High | Not done |
| TUM-06-4 | Admin edit UX | Multi-select roles + **per-role multi-POI**; usable by Tenant Super Admin and Tenant Admin; validation for forbidden combos | High | Not done |
| TUM-06-5 | CSV / bulk | Comma-separated roles and `poi_code`; row-level errors for forbidden / missing POI; same two assigners as invite/edit | Medium | Not done |
| TUM-06-6 | Working-role + working-POI switchers | Select Role (like Working site); Working site for local operators lists the **working role’s** assigned POIs; session persistence; admin/API checks use working role only | High | Not done |
| TUM-06-7 | Audit + cache | Role set on assign/remove; acting **working role** on later events; invalidate permission cache on switch | Medium | Not done |
| TUM-06-8 | Tests | Assign/remove/forbidden; Select Role switch; single-role hides switcher; multi-POI per local role; Working site filtered by working role; operational user cannot assign | High | Not done |

---

## Dependencies

| Dependency | Notes |
|---|---|
| TUM-01 invitation flow | Extend; do not reopen as unfinished |
| `apps.core.rbac_service.assign_role_to_user` | Today replace-on-assign — must change in TUM-06-2 |
| Working-role session (like working POI) | TUM-06-6; follow `apps.operations.yard_poi` / Select POI pattern |
| `apps.requisitions.role_access.get_primary_role_code` | Must resolve **working role**, not first assigned |
| `UserOperationalPOI` | Already unique on `(user, poi, role)` — that key **allows** many POIs per role. Do not collapse to one POI on save. |
| PO sign-off on open questions | Blocks TUM-06-2 if they want a named list of dual-hats instead of any allowed combination |

---

## Test Plan

Playwright admin E2E: [tum-06-multi-role-assignment-e2e-scenarios.md](../../../../../09-testing/backend/e2e-scenarios/sprint-10/tum-06-multi-role-assignment-e2e-scenarios.md)

- [ ] User with one role: invite, edit, login — Select Role hidden; behaviour unchanged
- [ ] Tenant Super Admin invites Gateman + Scaling (same POI) → Select Role lists both; working as Gateman shows gate only
- [ ] Switch to Scaling → scale screens only; gate write actions denied
- [ ] Tenant Admin invites Gateman + Scaling → same Select Role behaviour
- [ ] Operational user (e.g. Distribution Officer) cannot invite or edit another user’s roles
- [ ] Edit: add second operational role → first role remains; Select Role appears
- [ ] Edit: remove one of two roles → remaining role is working role; switcher hides if only one left
- [ ] Edit: add a third allowed role → all three listed in Select Role
- [ ] Tenant Super Admin + Gateman rejected; Tenant Admin + Gateman rejected; Driver + Gateman rejected
- [ ] Tenant Super Admin assigns Tenant Admin **alone** → Select Role hidden; admin screens only
- [ ] Adding Gateman to an existing Tenant Admin is rejected
- [ ] Tenant Admin cannot grant the Tenant Admin role to someone else
- [ ] User with DO + DM: as DO cannot approve; switch to DM can approve others’ TRs; cannot approve own
- [ ] CSV comma-separated roles success; comma-separated `poi_code` applies to each local role on the row; forbidden combo row fails
- [ ] Edit: Gateman @ CTG-001 **and** CTG-002; Scaling @ CTG-001 only — Working as Gateman, Working site lists both; switch to Scaling hides Working site and falls back to CTG-001
- [ ] Adding a second POI to an existing local role keeps the first; duplicate `(user, poi, role)` rejected
- [ ] Audit of a gate-in records working role Gateman, not Scaling

---

## Definition of Done

- [ ] All acceptance criteria AC-0–AC-6 met
- [ ] Sub-tasks TUM-06-1 … TUM-06-8 completed
- [ ] `uniq_userrole_user_single_role` removed; one-role users still valid
- [ ] `assign_role_to_user` no longer deletes other allowed operational roles
- [ ] Invitation no longer ignores `role_ids[1:]`
- [ ] Unit tests cover Select Role switch, forbidden combos, no fixed cap, single-role (no switcher), multi-POI per local role, and Working site filtered by working role
- [ ] Story status updated for Phase 2 tracking

---

## Notes

- Removing the unique constraint without TUM-06-6 is a regression: the DB will allow two roles while the UI still has no way to pick the working role.
- `InvitationSerializer.role_ids` `max_length=5` is leftover from a draft cap — lift it so all selected allowed roles are applied.
- Archived US-004 described multi-role **union**; this story **does not** use union. The user works as one selected role at a time.
- **Tenant Super Admin** and **Tenant Admin** are administrators: they may **assign** multiple operational roles to others, but they themselves may hold **only one** role.
- Suggested PRD delta (BA, later): a person may be assigned multiple catalog roles and, for each local role, multiple sites; runtime access is the selected working role at the selected working POI.
- Select Role and Working site stay two controls. A combined `(role, POI)` picker is out of scope.
