---
module: 12-users
specification: TUM-06 Tenant User — Assign Multiple Operational Roles — Playwright E2E Scenario Plan
version: 1.4
phase: Phase 2
related_stories: TUM-06
source_spec: ../../../../../03-backlog/phase-2/sprints/sprint-10/01-Multi-role Tenant Users/TUM-06-multi-role-assignment.md
implementation_reference:
  - apps/users/admin.py (UserAdminForm / InviteUserForm — single Role dropdown today; UserBulkImportAdmin)
  - templates/admin/users/user/change_list.html (Add user → admin:users_invitationtoken_add)
  - templates/admin/users/invitationtoken/change_form.html (Save)
  - apps/core/rbac_service.py (assign_role_to_user replaces existing role)
  - apps/users/models.py (uniq_userrole_user_single_role)
  - apps/users/invitation_views.py (applies role_ids[0] only)
  - apps/users/invitation_serializers.py (role_ids max_length=5)
  - apps/users/import_configs.py (CSV role + poi_code reserved shared set; optional pois_by_role per local role)
  - templates/admin/includes/poi_profile_switcher.html (Working site — pattern for Select Role)
  - apps/requisitions/role_access.py (get_primary_role_code uses first matching assigned role)
last_updated: 2026-09-23
last_mcp_run: 2026-09-23
last_mcp_verdict: 21/24 Pass · 3 Fail
artifacts: tests/e2e/playwright-mcp/tum-06-multi-role-assignment-artifacts/
playwright_mcp: true
---

# TUM-06 — Multi-role Assignment — E2E Scenario Plan (Django Admin SSR)

**Story:** [TUM-06 — Assign Multiple Operational Roles to One User](../../../../../03-backlog/phase-2/sprints/sprint-10/01-Multi-role%20Tenant%20Users/TUM-06-multi-role-assignment.md)

Target runner: **Playwright MCP** against seeded Nourish (`docs/guides/playwright-mcp-admin.md`).  
Credentials: `docs/testing/playwright-mcp-credentials.yaml`.

**Last MCP run:** 2026-09-23 — **21/24 Pass · 3 Fail**. Accounts: `superadmin.nourish@yopmail.com`, `admin.nourish@yopmail.com`, `distribution.officer1.nourish@yopmail.com`. Artifacts: [`tests/e2e/playwright-mcp/tum-06-multi-role-assignment-artifacts/RESULTS.md`](../../../../../tests/e2e/playwright-mcp/tum-06-multi-role-assignment-artifacts/RESULTS.md).

Sibling: [user-invitation-activation-e2e-scenarios.md](../users/user-invitation-activation-e2e-scenarios.md) (single-role invite still valid).

**Out of scope:** REST invitation API contracts; permission **union**; assigning Super Admin; Driver / Helper / Vendor dual-hat (exclusive targets); **Tenant Super Admin** / **Tenant Admin** dual-hat (administrators stay one role); CSV via API (admin **Import** UI only); email/SMS OTP success paths (`otp_type=none` only).

> **Code status (2026-09-22):** One role per user is still enforced (`uniq_userrole_user_single_role`; `assign_role_to_user` replace-on-assign). Invite and User edit **Role** is a single `ChoiceField` (`label="Role"`). Portal switcher is **Working site**, not **Select Role**. Cases describe **post-TUM-06** admin behaviour.

## Seed prerequisites

| Item | Notes |
|------|--------|
| Assigners | **Tenant Super Admin** `superadmin.nourish@yopmail.com`; **Tenant Admin** `admin.nourish@yopmail.com` |
| Denied assigner | **Distribution Officer** `distribution.officer1.nourish@yopmail.com` |
| Dual-hat TR fixture | **Distribution Officer** + **Distribution Manager** (MCP user, not seed `distribution.officer1` / `distribution.manager1`) |
| POI | Active `CTG-001` (`ctg-depot`) and `CTG-002` (`ctg-depot-02`) for local roles |
| Wipe | Invite emails `mcp-tum06-*@yopmail.com`, employee ids `MCP-TUM06-*`; `otp_type=none` so activation is SSR-testable |
| Activation | `/activate/?token=...` as US-005 TC06 |

## A — Who may assign (AC-0)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Tenant Super Admin invite — multiple operational roles | As **Tenant Super Admin**, log in at `/admin/login/`. Open **Users & Access → Users** (`/admin/users/user/`). Click **Add user** (`admin:users_invitationtoken_add`). Assert **Role** is a multi-select (not a single dropdown). Select **Gateman** + **Scaling Operator**, set **Site (POI)** to `ctg-depot`, **2FA** `none`. Click **Save**. Assert invitation created and Users list shows **Invited**. | P0 | Pass |
| TC02 | Tenant Admin invite — multiple operational roles | As **Tenant Admin**, **Users → Add user**. Select **Gateman** + **Scaling Operator**, same **Site (POI)**. **Save**. Assert invitation created. Assert **Tenant Super Admin** and **Super Admin** are not listed in **Role**. | P0 | Pass |
| TC03 | Tenant Admin cannot grant Tenant Admin | As **Tenant Admin**, on **Add user** and User change (`/admin/users/user/<uuid>/change/`), attempt to select **Tenant Admin** (alone or combined). Assert denied — existing copy: `Only a Tenant Super Admin may assign the Tenant Admin role.` (or **Role** omits Tenant Admin). | P0 | Pass |
| TC04 | Operational user cannot assign roles | As **Distribution Officer**, open `/admin/users/user/` and `/admin/users/invitationtoken/add/`. Assert forbidden / no **Add user** write (no `MENU_USERS_VIEW` / add permission). | P0 | Pass |

## B — Invite, activate, cardinality (AC-1, AC-2)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC06 | Single-role invite still works; Select Role hidden | As Tenant Super Admin, **Add user** with **one** operational role (e.g. **Gateman**) and **Site (POI)**. Activate and log in. Assert **Select Role** is hidden or disabled; menus match that role only (same as today’s US-005). | P0 | Pass |
| TC07 | Super Admin hidden on invite/edit | On **Add user** and User change **Role** multi-select, assert **Super Admin** is not listed. | P0 | Pass |
| TC09 | Forbidden combo Driver + Gateman | **Add user** / User change **Driver** + **Gateman**. Assert clear validation error (BR-TUM06-005 exclusive targets). Driver is already excluded from today’s invite dropdown (`FORBIDDEN_INVITATION_ROLE_CODES`). | P0 | Pass |

## C — User edit add/remove (AC-1, AC-5)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC11 | Edit adds a second role without deleting the first | As Tenant Super Admin, open an existing **Distribution Officer** MCP user (`/admin/users/user/<uuid>/change/`). Add **Distribution Manager**. Click **Save**. Assert both roles remain (Access fieldset). Log in as that user: **Select Role** lists both. | P0 | Pass |
| TC12 | Edit adds a third allowed operational role (no cap) | On the two-role user from TC11, add a third allowed operational role (e.g. **Transport Planner**). **Save**. Assert all three remain and **Select Role** lists all three. | P0 | Pass |
| TC13 | Remove one of two roles | On a two-role user, uncheck one role. **Save**. Assert the other remains; if only one left, **Select Role** hides and that role is working. Account stays active (not deactivated). | P0 | Pass |
| TC14 | Adding a second role to Tenant Admin is rejected | As **Tenant Super Admin**, add **Gateman** + **Site (POI)** to a user who already is Tenant Admin. As **Tenant Admin**, attempt the same on another Tenant Admin user. Assert validation error; Tenant Admin stays one role. Tenant Admin still cannot grant Tenant Admin (TC03). | P0 | Pass |
| TC15 | Duplicate role rejected | On User change, assign the same role twice. Assert rejected (`unique(user, role)`). | P1 | Pass |
| TC16 | Tenant Admin is single-role; Select Role hidden | As Tenant Super Admin, **Add user** with **Tenant Admin** alone. Activate and log in. Assert **Select Role** is hidden or disabled; menus are admin only. No gate write. | P0 | Pass |
| TC17 | Multiple POIs per local role; different sets across roles | On User change, assign **Gateman** @ `CTG-001` **and** `CTG-002`, and **Scaling Operator** @ `CTG-001` only (per-role Site multi-select). **Save**. Assert three `UserOperationalPOI` rows. A global operational role must not require **Site (POI)**; leftover POI rows for that role only are cleared. Adding `CTG-002` to Gateman must not delete `CTG-001`. Duplicate same POI on the same role is rejected. | P0 | Pass |

## D — Working role + working POI switchers (AC-3, AC-4)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC18 | Select Role follows Working site pattern; no permission union | Log in as Gateman + Scaling user. Assert header/profile **Select Role** modelled on **Working site** (`#dfms-poi-profile`, label **Working site**, `#dfms-poi-select`). Select **Gateman**. Assert gate menus/queues only; Scaling write URLs denied. Switch to **Scaling Operator** without re-login. Assert scale screens only; gate write denied. | P0 | Pass |
| TC19 | DO + DM — approve others not self | User with Distribution Officer + Distribution Manager. Working as **Distribution Officer**, create a TR; assert **Approve** / **Reject** absent. Switch to **Distribution Manager**; assert can approve **another** user’s TR; attempting to approve **own** TR is still denied (`created_by == request.user`). | P0 | Pass |
| TC20 | Admin removes current working role — session falls back | While the user is working as role A, as admin remove role A. On next request, assert fallback to a remaining assigned role (no crash / empty perms). | P1 | Pass |
| TC21 | Working site lists the working role’s assigned POIs | Log in as the TC17 user. Working as **Gateman**, assert **Working site** (`#dfms-poi-select`) lists **only** `CTG-001` and `CTG-002` (not the whole tenant catalog). Pick `CTG-002`. Assert gate queue is scoped to that site. | P0 | Pass |
| TC21b | Role switch refreshes Working site; single-POI hides it | From TC21 (working Gateman @ `CTG-002`), switch **Select Role** to **Scaling Operator** without re-login. Assert Working site is hidden (Scaling has one POI); working POI falls back to `CTG-001`; scale screens for `CTG-001` only. Switch back to Gateman: Working site lists both again; `CTG-001` stays selected (still assigned). | P0 | Pass |

## E — CSV import / export (AC-2)

If **any** role on the row is local, the file **must** include `poi_code` **or** `pois_by_role` (at least one). Both empty → that row fails on preview. Reserved path: omit `pois_by_role` (or leave it empty) → comma-separated `poi_code` applies to **every** local role. Optional path: fill `pois_by_role` (`role_code=POI,POI;other_role=POI`) → sites per local role (this alone is enough). If both columns are filled, `pois_by_role` wins. Global-only rows leave both empty.

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC22 | CSV reserved path — shared `poi_code` on every local role | As Tenant Super Admin, **Users** changelist **Import** (`/admin/users/user/import/`, `admin:users_user_import_upload`). Upload a wipe-friendly row `role=gateman,scaling_operator` with `poi_code=CTG-001,CTG-002` and **no** `pois_by_role` column (or empty). Confirm **Import Preview** valid. After activate/import, assert two roles, **each** with both POIs (cartesian), and **Select Role** lists both. | P0 | Fail |
| TC22b | CSV optional `pois_by_role` — different sites per local role | Same Import UI. Upload `role=gateman,scaling_operator`, blank `poi_code`, `pois_by_role=gateman=CTG-001,CTG-002;scaling_operator=CTG-001`. Preview valid. After activate/import, assert Gateman @ `CTG-001`+`CTG-002` and Scaling @ `CTG-001` only (three `UserOperationalPOI` rows, not four). Log in: working as Gateman, **Working site** lists both; switch to Scaling, Working site hidden. | P0 | Planned |
| TC22c | CSV `pois_by_role` wins when both columns are filled | Import a row with `poi_code=CTG-001,CTG-002` **and** `pois_by_role=gateman=CTG-001;scaling_operator=CTG-002`. Assert Scaling does **not** receive `CTG-001` from `poi_code`; each local role keeps only its tagged sites. | P1 | Planned |
| TC22d | CSV export round-trip keeps per-role sets | From the TC22b user (or TC17 user), **Users** changelist **Export**. Open the file: `role` is comma-separated; `poi_code` is the union; `pois_by_role` is filled because the sets differ. Re-import that file (wipe-friendly email / same employee). Assert sets stay Gateman @ both, Scaling @ `CTG-001` only — not flattened to both hats @ both sites. If exported user has identical sets on every local role, `pois_by_role` may be empty and re-import uses TC22 reserved path. | P0 | Planned |
| TC22e | CSV local role with neither `poi_code` nor `pois_by_role` fails | Import a wipe-friendly row `role=gateman` (or `gateman,scaling_operator`) with **both** `poi_code` and `pois_by_role` blank / omitted. Assert **Import Preview** marks that row invalid with a reason that a site is required. A second reserved-path row in the same file stays valid. | P0 | Planned |
| TC23 | CSV forbidden combo fails that row only | Import a file with one good reserved-path row and one `role=tenant_admin,gateman` (and/or `tenant_super_admin,gateman` / `driver,gateman`). Assert the forbidden row fails with a reason on preview; the good row is unaffected. | P0 | Pass |
| TC24 | CSV single-role row still valid | Import `role=gateman` only (`poi_code=CTG-001`, no `pois_by_role`). Assert one assignment; behaviour matches TC06. | P1 | Fail |

## F — Audit (AC-6)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC25 | Assign/remove logs role set | After invite/edit add/remove, open **Users & Access → Audit Logs** (`/admin/audit/auditlog/`). Assert the **set** of role codes (added, removed, resulting), actor, timestamp. | P1 | Pass |
| TC26 | Subsequent action logs working role not full set | As Gateman+Scaling user working as **Gateman**, perform a gate-in (or equivalent gated write). Assert audit records working role **Gateman**, not Scaling. | P1 | Fail |

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-09-23 | **21/24** | Playwright MCP vs Nourish admin. Remaining fails: TC22/TC24 CSV `pois_by_role_id` NOT NULL, TC26 no `working_role` stamp. TC05/TC08/TC10 removed. See artifacts `RESULTS.md`. |
| 2026-09-23 | docs v1.4 | Added TC22b–TC22e (`pois_by_role` + export + local-role site required). Not MCP-run. Count is now 24 executed + 4 Planned. |

## Implementation Notes (Playwright + Django Admin SSR)

- Automation drives Django admin SSR only (no direct API testing). Activation uses `/activate/?token=...` like US-005 TC06 (`otp_type=none`).
- Role fixtures: distinct users per role. Do **not** use the same user for requester and approver except in TC19 (that case is the self-approval test). Do not mutate seed `distribution.officer1` / `gateman1` — create `mcp-tum06-*` users.
- Master data: `CTG-001` / `CTG-002`; **Gateman** and **Scaling Operator** are POI-scoped and sit in different departments (`gate_operations` vs `scaling_weight`) — post-TUM-06 multi-select must allow that cross-department pair.
- Admin URL names: `admin:users_user_changelist`, `admin:users_invitationtoken_add`, `admin:users_user_change`, `admin:users_user_import_upload`, `admin:users_user_export` (or the Users changelist **Export** action), `admin:audit_auditlog_changelist`.
- CSV columns: `role` (comma-separated codes), `poi_code` (reserved shared set), optional `pois_by_role` (`gateman=CTG-001,CTG-002;scaling_operator=CTG-001`). Quote cells that contain commas. `otp_type=none`. **Local role:** at least one of `poi_code` or `pois_by_role` is required (TC22 / TC22b / TC22e). Missing/empty `pois_by_role` with a filled `poi_code` is the reserved path (TC22). Do not use two rows for the same email (last row replaces the role set).
- Stable selectors: `#content-main`, `#result_list`, `.messagelist`, `.errorlist`, invite **Role** widget, **Site (POI)** (`#id_operational_poi`, multi-select on invite; per-role `poi_role_<uuid>` on edit), `#dfms-poi-select` for Working site; new Select Role control TBD (mirror `#dfms-poi-profile`).
- Current UI labels: changelist **Add user** (not “Invite user”); invite breadcrumb **Add user**; submit **Save** (`name="_save"`); Access fieldset **Role**, **Site (POI)**, **2FA**; Users list **Import** and **Export**.
- Status assertion: invitation list **Invited**; after activation the user is active. Do not trust toast copy over persisted `UserRole` rows.
- Scope guardrail: plan ends at admin invite/edit/CSV import+export, Select Role switch, Working site among the working role’s assigned POIs, and audit of the working role. No mobile, no REST invitation contract, no permission union, no combined `(role, POI)` picker. REST stays on shared `poi_ids` (no `pois_by_role` on API in this story).
- **Known drift:** `assign_role_to_user` deletes other roles; invitation applies `role_ids[0]`; `role_ids` `max_length=5` leftover cap; `get_primary_role_code` returns first matching assigned role, not a working-role session; User edit POI is still one value per role and `sync_user_roles` collapses extras; Working site is Tenant Admin / Super Admin only. CSV **reserved** path (`role` + shared `poi_code`) is specified in v2.3; optional `pois_by_role` is **not shipped** until `UserImportConfig` grows that column (TC22b–TC22d stay Planned). TC22/TC24 last failed on `pois_by_role_id` NOT NULL at invitation insert — fix that before treating reserved-path CSV as green. Do not implement Playwright against current single-role / single-POI behaviour and call it TUM-06.
- Suggested next step: persist multiple `UserRole` + Select Role switcher, then run this plan; keep US-005 single-role cases green (TC06).
