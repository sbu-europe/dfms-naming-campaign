---
module: 02-master-data
specification: Users & Access (MD_USR) — Playwright E2E Scenario Plan
version: 2.0
phase: Phase 1
related_stories: US-001..US-007, US-005
source_spec: ../../05-modules/02-master-data/
last_updated: 2026-07-22
playwright_mcp: true
suite: master-data-phase1-v2
---
# Users — E2E Scenario Plan (suite index)

**Primary URL:** `/admin/users/user/` · Invite: `/admin/users/invitationtoken/`

Also see sibling plans under `../users/` (bulk import, invitation, deactivation, password) — prefer those for deep coverage; this file maps suite IDs `MD_USR_*`.

## Test cases

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| MD_USR_001 | Navigate invite/create user | As Tenant Admin, open `/admin/users/user/`. Assert **Add User** may be disabled — create via **Invitation** (`/admin/users/invitationtoken/`) or Import. Document actual CTA. | P2 | Planned |
| MD_USR_002 | Email unique | Duplicate email rejected on invite/import. | P0 | Planned |
| MD_USR_003 | Email format | Invalid email rejected. | P1 | Planned |
| MD_USR_004 | First Name mandatory | Blank first_name blocked. | P0 | Planned |
| MD_USR_005 | Last Name mandatory | Blank last_name blocked. | P0 | Planned |
| MD_USR_006 | Employee ID unique | Duplicate employee_id rejected when non-blank. | P0 | Planned |
| MD_USR_007 | Role dropdown lists roles | Role choices show configured roles. | P1 | Planned |
| MD_USR_008 | Role mandatory | Blank role blocked. | P0 | Planned |
| MD_USR_009 | 2FA None/Email | otp_type / 2FA shows None and Email (and any other implemented). | P2 | Planned |
| MD_USR_010 | Invite happy path | Invite valid user; status Pending/Inactive until activation. | P0 | Planned |
| MD_USR_011 | Activation email/invitation | Invitation token created; email path triggered (assert DB/token; delivery optional). | P0 | Planned |
| MD_USR_012 | Role permissions config | As Tenant Super Admin, open role permission config if present; modify; assert persists. Demote if UI not in admin. | P0 | Planned |
| MD_USR_013 | RBAC menu enforcement | Activated Depot Officer sees only permitted menus. | P0 | Planned |
| MD_USR_014 | Role change updates access | Change role Depot→Distribution Officer; new session reflects new menus. | P0 | Planned |
| MD_USR_015 | Role change without recreate | Role change applies without deleting account. | P1 | Planned |
| MD_USR_016 | Change password | User changes password from profile; login with new works. | P1 | Planned |
| MD_USR_017 | Wrong current password | Incorrect current password rejected. | P1 | Planned |
| MD_USR_018 | Reset password flow | User reset password completes. | P2 | Planned |
| MD_USR_019 | Forgot password | Login Forgot Password sends reset (assert message). | P1 | Planned |
| MD_USR_020 | Forgot password unknown email | Generic confirmation; no email enumeration. | P2 | Planned |
| MD_USR_021 | Admin reset on behalf | Tenant Admin triggers reset for user; audit logged if available. | P1 | Planned |
| MD_USR_022 | Deactivate user | Deactivate; cannot login. | P0 | Planned |
| MD_USR_023 | Deactivated login blocked | Login denied with inactive message. | P0 | Planned |
| MD_USR_024 | Reactivate | Reactivate; login works. | P1 | Planned |
| MD_USR_025 | 2FA Email prompt | User with email OTP prompted for code. | P0 | Planned |
| MD_USR_026 | 2FA None direct login | otp none logs in without OTP. | P2 | Planned |
| MD_USR_027 | Import template | Users Import template headers (see users/user-bulk-import plan). | P2 | Planned |
| MD_USR_028 | Import + invitations | Import 5 users; invitations created. | P1 | Planned |
| MD_USR_029 | Import invalid role | Unknown role fails preview. | P1 | Planned |
| MD_USR_030 | Import duplicate email/emp | Duplicate fails; others succeed. | P0 | Planned |
| MD_USR_031 | Export CSV | Export users. | P2 | Planned |
| MD_USR_032 | Search/filter/pagination | Exercise list ops. | P2 | Planned |
| MD_USR_033 | Update role/2FA | Edit role and OTP; save. | P1 | Planned |
| MD_USR_034 | Soft delete via Edit → Inactive | Open user **Edit** (or deactivate action), set Inactive, Save. Assert row remains; login blocked. Users have no hard delete (`has_delete_permission=False`). | P0 | Planned |
| MD_USR_035 | No hard delete for users | Assert hard delete / Delete permanently is unavailable for users — soft delete (Inactive) only. | P0 | Planned |
| MD_USR_036 | Cannot manage Tenant Super Admin | Tenant Admin cannot create/edit Tenant Super Admin. | P0 | Planned |
| MD_USR_037 | Audit create/role/activate | Audit logs show user lifecycle actions. | P1 | Planned |
## Implementation Notes (Playwright MCP + Django Admin SSR)

- URL: `/admin/users/user/`
- has_add_permission=False; invite/import create users; no admin hard delete.
- Wipe prefix: `MCP-MD-<RUN_ID>-`

### Known drift (suite PDF → code)

| Topic | Suite v2 | Code / this plan |
|-------|----------|------------------|
| Add User screen | Direct Add User | Invite / Import |
| Hard delete users | Super Admin hard delete | **Not available** — deactivate only |
