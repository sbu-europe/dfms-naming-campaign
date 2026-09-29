---
title: Sprint 6 Feedback — Users & Access
module: 01-users-and-access
menu: Users / Tenant Admin
parent: ./README.md
---

# Users & Access

**Admin menu / area:** Users / Tenant Admin  
**Tracker index:** [README.md](./README.md)

> **Resolution Status values**: `Open` → `In Progress` → `Resolved`

| ID | Title | Priority | Status |
|----|-------|----------|--------|
| [FB-016](#fb-016--tenant-super-admin-at-provisioning-delegated-tenant-admin-cannot-mint-admins) | Tenant Super Admin at provisioning; delegated Tenant Admin cannot mint admins | High | Resolved |
| [FB-025](#fb-025--user-menu-status-filter-shows-incorrect-status) | User menu status filter shows incorrect status | Medium | Resolved |
| [FB-026](#fb-026--password-reset-admin-justification-field-required) | Password reset: admin justification field required | Medium | Resolved |
| [FB-030](#fb-030--user-bulk-import-feature-not-working) | User bulk import feature not working | High | Resolved |
| [FB-032](#fb-032--staff-invite--login--forgot-password-email-or-phone-channel) | Staff invite / login / forgot-password: email or phone channel | High | Resolved |
| [FB-033](#fb-033--driver-invitation-by-phone--radio-channel-selector--mandatory-contact-number) | Driver invitation by phone: radio channel selector + mandatory contact number | High | Resolved |
| [FB-032](#fb-032--staff-invite--login--forgot-password-email-or-phone-channel) | Staff invite / login / forgot-password: email or phone channel | High | Resolved |

---

## FB-016 — Tenant Super Admin at provisioning; delegated Tenant Admin cannot mint admins

| Field | Value |
|-------|-------|
| **Source** | Client feedback — 2026-07-08 |
| **Affected Stories** | US-005 (staff invitation), US-006 (user activation), US-007 (user management), PAP-05 / PAP-06 (tenant provisioning); role model ([`user-roles.md`](../../../../../01-source/03-sow/user-roles.md)) |
| **Reference docs** | [`user-tenant-management.md`](../../../../../05-modules/01-foundation/user-tenant-management.md) §2.1 / §2.3; [`tenant-user-management-v2.md`](../../../../../05-modules/03-users/tenant-user-management-v2.md) |
| **Closing Sub-tasks** | FB-016-1 … FB-016-10 — see [tenant-user-management-v2.md](../../../../../05-modules/03-users/tenant-user-management-v2.md) §12 |
| **AC Amendment** | Split today's single platform-provisioned **Tenant Admin** into two personas. **(1) Tenant Super Admin** (`tenant_super_admin`) — created **only** during **tenant invitation / provisioning** by the Platform Super Admin (same lifecycle as today's first tenant admin; not available via staff invite). **(2) Tenant Admin (delegate)** (`tenant_admin`) — the Tenant Super Admin may invite **one or more** delegates via the existing US-005 staff-invite flow. Delegates receive the **same org-wide permission catalog** as the Tenant Super Admin (master data, users, configuration, yard supervisor bypass, etc.) but **cannot** invite, assign, or elevate users to `tenant_admin` or `tenant_super_admin`. Tenant Admin delegates **may** invite operational users and POI-Admin ([FB-014](./04-yard-and-stock.md#fb-014--poi-admin-role-poi-scoped-yard-operations-super-user)) — only the **mint-admin** action is restricted to Tenant Super Admin. Remove the hard-coded **one tenant admin per schema** rule. |
| **Status** | Resolved |
| **Priority** | High |
| **Notes** | Current implementation provisions exactly one `tenant_admin` per tenant (`UserAdminForm.clean()` enforces single admin; `InviteUserForm` blocks `tenant_admin` assignment). `is_tenant_admin=True` is the full-access bypass (~60 call sites). No `tenant_super_admin` role or `is_tenant_super_admin` flag exists today. **Implementation plan:** [`tenant-user-management-v2.md`](../../../../../05-modules/03-users/tenant-user-management-v2.md). Coordinate with FB-014 — both Tenant Super Admin and Tenant Admin delegates may invite POI-Admin with mandatory POI. E2E out of scope. |

### Client feedback observation

When a tenant is onboarded, the **first org-wide administrator** should be a **Tenant Super Admin**, created as part of tenant provisioning — not a delegate. That super admin can then create **multiple Tenant Admin** users for day-to-day org management. Those delegated Tenant Admins should have the same operational powers as the super admin **except** they must **not** be able to create additional Tenant Admins (or another Tenant Super Admin).

### Current vs expected behaviour

| Aspect | Current | Expected (FB-016) |
|--------|---------|-------------------|
| First admin at tenant provision | Single **Tenant Admin** (`tenant_admin`) | **Tenant Super Admin** (`tenant_super_admin`) |
| Tenant admins per tenant | Exactly **one** (admin form enforcement) | **One super** + **N delegates** |
| Invite `tenant_admin` | Blocked in staff invite / role assignment | **Allowed** when inviter is Tenant Super Admin only |
| Invite `tenant_super_admin` | N/A | **Blocked** — platform provisioning only |
| Tenant Admin delegate powers | N/A (only one admin exists) | Same org-wide catalog as super admin |
| Delegate creates Tenant Admin | N/A | **Forbidden** — elevation restricted to Tenant Super Admin |
| `is_tenant_admin` bypass | On provisioned admin | On **both** super and delegate |
| Elevation flag | Does not exist | `is_tenant_super_admin=True` on provisioned user only |

### Implementation plan

See full plan: [`tenant-user-management-v2.md`](../../../../../05-modules/03-users/tenant-user-management-v2.md).

| Phase | Scope |
|-------|--------|
| **1** | `tenant_super_admin` role seed; `is_tenant_super_admin` on `User`; provisioning targets super admin |
| **2** | Remove single-admin constraint; invite/assign guards (super only may mint `tenant_admin`) |
| **3** | Migration: existing provisioned admin → super admin |
| **4** | Platform tenant list / activation sync; unit + integration tests (no E2E) |

---

## FB-025 — User menu status filter shows incorrect status

| Field | Value |
|-------|-------|
| **Source** | Client feedback — 2026-07-22 |
| **Affected Stories** | US-007 (user management); [`tenant-user-management.md`](../../../../../05-modules/03-users/tenant-user-management.md) |
| **Closing Sub-tasks** | FB-025-1 — User changelist status filter corrected |
| **AC Amendment** | Under the **Users** admin menu, the **status filter** SHALL show and filter by the **correct user status** values (active / inactive / invited / locked / etc. as implemented). Filtering a status returns only users whose displayed status matches that filter option — no mismatched labels or wrong queryset mapping. |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | Client reported the User menu status filter was not reflecting the correct status. Fixed so filter options and list results align with the user status shown on the changelist. |

### Client feedback observation

The status filter under the User menu did not show or apply the correct user status, making it hard for Tenant Admins to find users by lifecycle state.

### Current vs expected behaviour

| Aspect | Current (before fix) | Expected (FB-025) |
|--------|----------------------|-------------------|
| Status filter options | Incorrect / mismatched vs displayed status | Options match real user status values |
| Filter results | Wrong users returned for a selected status | Only users with that status |

---

## FB-026 — Password reset: admin justification field required

| Field | Value |
|-------|-------|
| **Source** | Client feedback — 2026-07-22 |
| **Affected Stories** | US-006 / password reset & unlock ([`tenant-user-management.md`](../../../../../05-modules/03-users/tenant-user-management.md)); PRD §Security — password reset audit |
| **Closing Sub-tasks** | FB-026-1 — Admin justification on password-reset action |
| **AC Amendment** | When a Tenant Admin (or privileged admin) triggers a **password reset** for a user, the form/action SHALL require an **admin justification** field. Reset cannot submit with a blank justification. The justification is persisted on the password-reset audit log (admin ID, timestamp, target user, remarks). |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | PRD requires justification remarks on admin unlock/reset-style actions. Client reported the justification field was missing from the Password Reset admin flow; field is now present and required. |

### Client feedback observation

Admin-initiated password reset had no justification field, so resets could not be audited with a clear reason.

### Current vs expected behaviour

| Aspect | Current (before fix) | Expected (FB-026) |
|--------|----------------------|-------------------|
| Justification on password reset | Missing | Required text field |
| Audit | Incomplete / no admin remarks | Justification stored with reset audit entry |

---

## FB-030 — User bulk import feature not working

| Field | Value |
|-------|-------|
| **Source** | Client feedback — 2026-07-22 |
| **Affected Stories** | US-005 / user bulk import ([`tenant-user-management.md`](../../../../../05-modules/03-users/tenant-user-management.md)); E2E [`user-bulk-import-e2e-scenarios.md`](../../../../../09-testing/backend/e2e-scenarios/users/user-bulk-import-e2e-scenarios.md) |
| **Closing Sub-tasks** | FB-030-1 — Restore working User bulk import (template, validate, create) |
| **AC Amendment** | **User Bulk Import** SHALL work end-to-end for Tenant Admin: download/upload template, validate rows, create/invite users per import rules, and surface clear success/error feedback. Previously broken import paths (template, parsing, or create) are fixed so the feature is usable in Admin. |
| **Status** | Resolved |
| **Priority** | High |
| **Notes** | Client reported User Bulk Import was not functional. Fixed and covered by Playwright MCP / e2e scenarios under `users/user-bulk-import-e2e-scenarios.md`. |

### Client feedback observation

The User Bulk Import admin feature was not working — Tenant Admins could not successfully import users from the bulk CSV/template flow.

### Current vs expected behaviour

| Aspect | Current (before fix) | Expected (FB-030) |
|--------|----------------------|-------------------|
| Bulk import | Broken / non-functional | Working template → validate → create/invite flow |
| Error feedback | Missing or opaque | Clear row/field errors on failure |

---

## FB-032 — Staff invite / login / forgot-password: email **or** phone channel

| Field | Value |
|-------|-------|
| **Source** | Implementation alignment / product feedback — 2026-07-28 |
| **Affected Stories** | [US-005](../../../../stories/US-005-user-invitation-activation.md) (staff invitation & activation), [US-008](../../../../stories/US-008-password-account-reset.md) (password reset); admin login / OTP ([authentication-security.md](../../../../../05-modules/01-foundation/authentication-security.md)) |
| **Reference docs** | [`staff-invite-login-password-channels.md`](../../../../../05-modules/03-users/staff-invite-login-password-channels.md); [CR-002](../../../../../11-change-requests/CR-002-staff-phone-invite-login-password.md); [`user-tenant-management.md`](../../../../../05-modules/01-foundation/user-tenant-management.md) §4 / §7 |
| **Closing Sub-tasks** | FB-032-1 invitation `invite_channel` email\|phone (no mock `@invite.local` emails); FB-032-2 reinvite follows original channel; FB-032-3 admin login Email\|Phone + `+88` prefix / 11-digit local; FB-032-4 forgot-password single identifier field + SMS/email delivery; FB-032-5 product-context + CR-002 |
| **AC Amendment** | **(1) Invitation:** Staff invite supports **`invite_channel=email`** or **`invite_channel=phone`**. Phone invites require BD mobile; `User.email` may be **null** (do not invent placeholder emails). OTP type must match channel (`none`/`email` vs `none`/`phone`). Activation link + OTP delivered by email or SMS (`SMS_ENABLED` gates real SMS; otherwise log). **Reinvite** always uses the stored `invite_channel`. **(2) Login:** Admin `/admin/login/` offers Email \| Phone. Phone UI shows fixed prefix **`+88`**; user enters **11 digits starting with `0`** (e.g. `01712345678`); submitted value is E.164 `+8801…`. Identity resolution and login OTP use email or phone accordingly (including phone-only staff). **(3) Forgot password:** `/forgot-password/` uses **one field** (“Email or phone”) — no Email/Phone tabs. Validate by shape (`@` → email; else BD mobile). Deliver reset link + OTP by email or SMS on the matching channel. Authenticated change-password remains session-based (no identifier). Admin-assisted reset emails when email exists, otherwise SMS to phone. |
| **Status** | Resolved |
| **Priority** | High |
| **Notes** | Implemented in `nourish-backend` (`invitation_service.py`, `AuthService._resolve_user_by_identifier`, `password_reset_service.py`, `admin_otp.py`, `templates/admin/login.html`, `templates/auth/forgot_password.html`, `notifications/sms.py`). Supersedes earlier Phase 1 “email invitation only” notes. Distinct from vendor registration phone (FB-002), vendor forgot-password (Sprint 5 FB-011 / VM-01-10), and existing admin password-reset justification (FB-026). **ID note:** main already used FB-025 for user status filter; this item is **FB-032**. |

### Observation

Earlier Phase 1 docs and UI assumed staff users were always invited and recovered **by email**. Operations need **phone-only** staff (no email): invite by SMS, sign in with phone, and reset password via the same phone identity — without Email/Phone tabs on forgot-password, and with a clear BD `+88` prefix on admin phone login.

### Current vs expected behaviour

| Aspect | Before | After (FB-032) |
|--------|--------|----------------|
| Staff invite channel | Email only (docs); mock emails for phone | **`invite_channel` email \| phone**; phone users may have null email |
| Reinvite | Could drift to email path | Always original `invite_channel` (SMS vs email) |
| Admin login identifier | Email-centric UI | Email \| Phone toggle; phone = **`+88`** + 11-digit local from `0` |
| Login OTP delivery | Email-centric for staff | Email or SMS per 2FA / phone-only user |
| Forgot password UI | Email-only field (or separate tabs) | **Single** “Email or phone” field + format validation |
| Forgot password delivery | Email link + OTP only | Email **or** SMS (link + OTP) by identifier shape |
| Change password (logged in) | Session-based | Unchanged — works for phone-only users |

### Implementation plan

See overview: [`staff-invite-login-password-channels.md`](../../../../../05-modules/03-users/staff-invite-login-password-channels.md) · change request: [CR-002](../../../../../11-change-requests/CR-002-staff-phone-invite-login-password.md).

| Area | Primary code |
|------|----------------|
| Invite / activate / reinvite | `apps/users/invitation_service.py` |
| Login resolve + OTP | `apps/users/services.py`, `apps/core/admin_otp.py` |
| Password reset | `apps/users/password_reset_service.py` |
| Admin / forgot UI | `templates/admin/login.html`, `templates/auth/forgot_password.html` |
| SMS | `apps/notifications/sms.py` (`SMS_ENABLED`) |

---

## FB-033 — Driver invitation by phone: radio channel selector + mandatory contact number

| Field | Value |
|-------|-------|
| **Source** | Implementation alignment / product feedback — 2026-07-29 |
| **Affected Stories** | [US-005](../../../../stories/US-005-user-invitation-activation.md) (driver invitation & activation); driver admin screen (`/admin/users/driver/add/`) |
| **Reference docs** | [`staff-invite-login-password-channels.md`](../../../../../05-modules/03-users/staff-invite-login-password-channels.md); [CR-002](../../../../../11-change-requests/CR-002-staff-phone-invite-login-password.md) |
| **Closing Sub-tasks** | FB-033-1 — `DriverAdminForm.invite_channel` rendered as styled radio buttons (email \| phone); FB-033-2 — email field mandatory and visible only when channel = email; FB-033-3 — contact number (phone) mandatory for **both** channels; FB-033-4 — driver bulk import/export honours `invite_channel`; FB-033-5 — forgot-password and admin login work for phone drivers (inherits FB-032) |
| **AC Amendment** | **(1) Add Driver screen:** The "Invitation channel" field SHALL render as radio buttons (`Email` \| `Phone`) matching the visual style of the Invite Users screen. **(2) Email field:** visible and required **only** when `Email` channel is selected; hidden and cleared when `Phone` is selected. **(3) Contact number:** always required regardless of channel. **(4) Bulk import:** `invite_channel` column accepted in driver CSV (`email`/`phone`); `user_email` required only for email channel; phone-channel rows require a valid BD mobile in `contact_number`; export includes `invite_channel`. **(5) Forgot password / login:** phone drivers inherit FB-032 behaviour — phone login via `+88` prefix, forgot-password via single identifier field, SMS reset delivery. |
| **Status** | Resolved |
| **Priority** | High |
| **Notes** | Implemented in `nourish-backend`: `DriverAdminForm` uses `RadioSelect` with `class="radiolist"` and `invite_channel_radios.css`; `DriverAdmin.render_change_form` injects JS that toggles email row visibility/required, and always marks `contact_number` required; `DriverAdmin.Media` loads the shared radio CSS; `DriverImportConfig` in `apps/users/import_configs.py` updated for channel-aware validate/import/export; unit tests updated/added in `tests/unit/test_users/test_admin.py` and `tests/unit/test_users/test_import_configs.py`. |

### Observation

The Add Driver admin screen (`/admin/users/driver/add/`) previously rendered "Invitation channel" as a plain dropdown, inconsistent with the radio-button style on the Invite Users screen. Email was not enforced as mandatory when the email channel was chosen, and contact number had no explicit UI-level enforcement for both channels.

### Current vs expected behaviour

| Aspect | Before (FB-033) | After (FB-033) |
|--------|-----------------|----------------|
| Invitation channel widget | Plain `<select>` dropdown | **Styled radio buttons** (`Email` \| `Phone`) |
| Email field visibility | Always visible | Visible and required **only** for email channel; hidden for phone |
| Contact number | Required at model level only | Required at **both** form-clean and UI level for all channels |
| Driver bulk import | No `invite_channel` column | `invite_channel` column in CSV; channel-aware validation and user creation |
| Driver bulk export | No channel column | `invite_channel` inferred and exported (`email`/`phone`) |

### Implementation plan

| Area | Primary code |
|------|-------------|
| Add Driver form widget + validation | `apps/users/admin.py` — `DriverAdminForm`, `DriverAdmin` |
| Channel-switching JS | `_DRIVER_CHANNEL_JS` constant in `apps/users/admin.py` |
| Radio button CSS | `static/admin/css/invite_channel_radios.css` (shared with Invite Users) |
| Bulk import/export | `apps/users/import_configs.py` — `DriverImportConfig` |
| Tests | `tests/unit/test_users/test_admin.py`, `tests/unit/test_users/test_import_configs.py` |
