---
module: 12-users
specification: TUM-06 Tenant User — Assign Multiple Operational Roles — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 2
related_stories: TUM-06, US-005, US-004, US-009
source_spec: ../../../../../03-backlog/stories-phase-2/010-Multi-role Tenant Users/TUM-06-multi-role-assignment.md
implementation_reference:
  - apps/users/admin.py (InviteUserAdmin; User change — single Role dropdown today)
  - apps/core/rbac_service.py (assign_role_to_user replaces existing role)
  - apps/users/models.py (uniq_userrole_user_single_role)
  - apps/users/invitation_views.py (applies role_ids[0] only)
  - apps/users/invitation_serializers.py (role_ids max_length=5)
  - apps/users/import_configs.py (CSV column role — single code)
  - templates/admin/includes/poi_profile_switcher.html (Working site — pattern for Select Role)
  - apps/requisitions/role_access.py (get_primary_role_code)
last_updated: 2026-09-14
playwright_mcp: true
---

# TUM-06 — Multi-role Assignment — E2E Scenario Plan (Django Admin SSR)

Target runner: **Playwright MCP** against seeded Nourish (`docs/guides/playwright-mcp-admin.md`).  
Credentials: `docs/testing/playwright-mcp-credentials.yaml`.

Sibling: [user-invitation-activation-e2e-scenarios.md](../../users/user-invitation-activation-e2e-scenarios.md) (single-role invite still valid).

**Out of scope:** REST invitation API contracts; permission **union**; assigning Super Admin; Driver/Helper/Vendor dual-hat (exclusive); CSV via API (admin **Import** UI only).

> **Code status (2026-09-14):** One role per user is enforced (`uniq_userrole_user_single_role`; `assign_role_to_user` replace-on-assign). Invite **Role** is a single dropdown (`label="Role"`). Portal switcher is **Working site**, not **Select Role**. Cases describe **post-TUM-06** admin behaviour.

## Seed prerequisites

| Item | Notes |
|------|--------|
| Assigners | **Tenant Super Admin** `superadmin.nourish@yopmail.com`; **Tenant Admin** `admin.nourish@yopmail.com` |
| Denied assigner | **Distribution Officer** `distribution.officer1.nourish@yopmail.com` |
| POI | Active `CTG-001` (or equivalent) for Gateman / Scaling |
| Wipe | Invite emails `mcp-tum06-*@yopmail.com`, employee ids `MCP-TUM06-*`; `otp_type=none` so activation is SSR-testable |
| Activation | `/activate/?token=...` as US-005 TC06 |

## A — Who may assign (AC-0)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Tenant Super Admin invite — multi-select including Tenant Admin + operational | As **Tenant Super Admin**, **Users & Access → Users** (`/admin/users/user/`) → **Invite user** (`/admin/users/invitationtoken/add/`). Assert **Role** is multi-select (not a single dropdown). Select **Tenant Admin** + **Gateman**, set POI for Gateman, save. Assert invitation created. | P0 | Planned |
| TC02 | Tenant Admin invite — multiple operational roles | As **Tenant Admin**, **Invite user**. Select **Gateman** + **Scaling Operator**, same POI. Save. Assert invitation created. Assert **Tenant Super Admin** and **Super Admin** are not assignable. | P0 | Planned |
| TC03 | Tenant Admin cannot grant Tenant Admin | As **Tenant Admin**, on Invite and User edit, attempt to select **Tenant Admin** (alone or combined). Assert denied (existing delegation). | P0 | Planned |
| TC04 | Operational user cannot assign roles | As **Distribution Officer**, open `/admin/users/user/` and invite/add URLs. Assert forbidden / no Invite user write. | P0 | Planned |

## B — Invite, activate, cardinality (AC-1, AC-2)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC05 | Activation applies all selected roles | Complete TC02 (or equivalent) with `otp_type=none`. Open `/activate/?token=...`, set password, accept T&C. Log in as the new user. Assert **Select Role** lists **Gateman** and **Scaling Operator** (not only the first `role_ids[0]`). | P0 | Planned |
| TC06 | Single-role invite still works; Select Role hidden | Invite a user with **one** operational role. Activate and log in. Assert **Select Role** is hidden or disabled; menus match that role only (same as today’s US-005). | P0 | Planned |
| TC07 | Super Admin hidden on invite/edit | On Invite and User edit Role multi-select, assert **Super Admin** is not listed. | P0 | Planned |
| TC08 | Forbidden combo Tenant Super Admin + anything | As Tenant Super Admin, invite or edit with **Tenant Super Admin** + **Gateman** (or add a second role onto a Tenant Super Admin user). Assert validation error; no extra `UserRole` row. | P0 | Planned |
| TC09 | Forbidden combo Driver + Gateman | Invite/edit **Driver** + **Gateman**. Assert clear validation error (BR-TUM06-005 exclusive targets). | P0 | Planned |

## C — User edit add/remove (AC-1, AC-5)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC10 | Edit adds a second role without deleting the first | As Tenant Super Admin, open an existing **Distribution Officer** user (`/admin/users/user/<uuid>/change/`). Add **Distribution Manager**. **Save**. Assert both roles remain. Log in as that user: **Select Role** lists both. | P0 | Planned |
| TC11 | Remove one of two roles | On a two-role user, remove one role. **Save**. Assert the other remains; if only one left, **Select Role** hides and that role is working. Account stays active. | P0 | Planned |
| TC12 | Tenant Admin adds Gateman to an existing Tenant Admin | As **Tenant Super Admin**, add **Gateman** + POI to a user who already is Tenant Admin. As **Tenant Admin**, repeat add-Gateman on another Tenant Admin user. Assert both assignments saved; Tenant Admin still cannot grant Tenant Admin (TC03). | P0 | Planned |
| TC13 | Duplicate role rejected | On User edit, assign the same role twice. Assert rejected (`unique(user, role)`). | P1 | Planned |
| TC14 | POI required per local role; different POIs allowed | Assign Gateman @ `CTG-001` and another POI-scoped role @ `CTG-002` if the second role is local. Assert each local role has its own site. A global operational role must not require POI. | P1 | Planned |

## D — Working role switcher (AC-3, AC-4)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC15 | Select Role follows Working site pattern; no permission union | Log in as Gateman + Scaling user. Assert header/profile **Select Role** modelled on **Working site** (`#dfms-poi-profile` pattern). Select **Gateman**. Assert gate menus/queues only; Scaling write URLs denied. Switch to **Scaling Operator** without re-login. Assert scale screens only; gate write denied. | P0 | Planned |
| TC16 | Working as Tenant Admin vs Gateman | Log in as Tenant Admin + Gateman (from TC01/TC12). Working **Tenant Admin** → admin/Master Data screens, not gate write. Switch to **Gateman** → gate operations only. | P0 | Planned |
| TC17 | DO + DM — approve others not self | User with Distribution Officer + Distribution Manager. Working as **DO**, create a TR; assert cannot approve. Switch to **DM**; assert can approve **another** user’s TR; attempting to approve **own** TR is still denied (`created_by == request.user`). | P0 | Planned |
| TC18 | Admin removes current working role — session falls back | While the user is working as role A, as admin remove role A. On next request, assert fallback to a remaining assigned role (no crash / empty perms). | P1 | Planned |
| TC19 | POI-scoped working role still uses Working site | While working as Gateman, assert **Working site** still applies for that role’s site (`Select working site`). | P1 | Planned |

## E — CSV (AC-2)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC20 | CSV comma-separated roles succeed | As Tenant Super Admin, **Users** changelist **Import** (`/admin/users/user/import/`). Upload a row `role=gateman,scaling_operator` with `poi_code` for the local roles and wipe-friendly email. Confirm import. After activate/import, assert two assignments and Select Role lists both. | P0 | Planned |
| TC21 | CSV forbidden combo fails that row only | Import a file with one good row and one `role=tenant_super_admin,gateman` (or `driver,gateman`). Assert the forbidden row fails with a reason; the good row is unaffected. | P0 | Planned |
| TC22 | CSV single-role row still valid | Import `role=gateman` only. Assert one assignment; behaviour matches TC06. | P1 | Planned |

## F — Audit (AC-6)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC23 | Assign/remove logs role set | After invite/edit add/remove, open **Audit Logs**. Assert the **set** of role codes (added, removed, resulting), actor, timestamp. | P1 | Planned |
| TC24 | Subsequent action logs working role not full set | As Gateman+Scaling user working as **Gateman**, perform a gate-in (or equivalent gated write). Assert audit records working role **Gateman**, not Scaling. | P1 | Planned |

## Implementation Notes (Playwright + Django Admin SSR)

- Admin SSR only. Activation uses `/activate/?token=...` like US-005 TC06 (`otp_type=none`).
- Do **not** use the same user for requester and approver except in TC17 (that case is the self-approval test).
- Current UI labels: **Invite user**, **Role**, **Users**. Post-story Role becomes multi-select; **Select Role** should mirror **Working site** (`templates/admin/includes/poi_profile_switcher.html`), not the story’s “Select POI” wording.
- URLs: `admin:users_user_changelist`, `admin:users_invitationtoken_add`, user change, `admin:users_user` import paths `import/`.
- Selectors: `#content-main`, invite form Role widget, `#dfms-poi-select` for Working site; new Select Role control TBD.
- **Known drift:** `assign_role_to_user` deletes other roles; invitation applies `role_ids[0]`; CSV `role` is a single code; `role_ids` `max_length=5` leftover cap. Tests will fail until TUM-06-2…6 land. Do not implement Playwright against current single-role behaviour and call it TUM-06.
- Suggested next step: persist multiple `UserRole` + Select Role switcher, then run this plan; keep US-005 single-role cases green (TC06).
