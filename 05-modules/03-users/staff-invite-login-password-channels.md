---
module: 03-users
specification: Staff invite, login & password reset — channel overview
version: 1.0
phase: Phase 1
last_updated: 2026-10-01
related_stories: US-005, US-006, US-008
related_cr: CR-002
implementation_reference:
  - nourish-backend/apps/users/invitation_service.py
  - nourish-backend/apps/users/web_views.py (SSR /activate/)
  - nourish-backend/apps/users/services.py (AuthService)
  - nourish-backend/apps/users/password_reset_service.py
  - nourish-backend/apps/core/admin_otp.py
  - nourish-backend/apps/notifications/sms.py
  - nourish-backend/templates/admin/login.html
  - nourish-backend/templates/auth/forgot_password.html
---

# Staff invite, login & password reset — channel overview

> **Purpose**: Single source of truth for staff (tenant) **email vs phone** invitation, sign-in, and forgot-password behavior as implemented in `nourish-backend`.  
> Supersedes earlier Phase 1 notes that said “email invitation only.”

**Change request**: [CR-002](../../11-change-requests/CR-002-staff-phone-invite-login-password.md)  
**Sprint tracker**: [FB-032](../../03-backlog/phase-1/sprints/sprint-6/feedback-resolution/01-users-and-access.md#fb-032--staff-invite--login--forgot-password-email-or-phone-channel)

> **Onboarding OTP ([CR-003](../../11-change-requests/CR-003-mandatory-onboarding-otp.md)) is shipped.** Every new invitation generates an activation OTP and the invitee must verify it before setting a password. Delivery follows `invite_channel`. `otp_type` (admin label **2FA**) is stored for login 2FA only (§3.3) and does not turn the activation OTP on or off.

---

## 1. Summary

| Capability | Email channel | Phone channel |
|---|---|---|
| **Invite** | Email required; activation OTP always in the email. `otp_type` is login 2FA only | Phone (BD mobile) required; `User.email` may be null; activation OTP always in the SMS |
| **Identity** | Unique email per tenant | Unique phone per tenant (when set); no mock `@invite.local` emails |
| **Reinvite** | Resends via original `invite_channel` (email) | Resends via original `invite_channel` (SMS) |
| **Login (admin)** | Email tab or email identifier | Phone tab; UI prefix **`+88`** + 11-digit local (`01XXXXXXXXX`); resolves to E.164 `+8801…` |
| **Login OTP / 2FA** | Email OTP when configured | SMS OTP when phone 2FA / phone-only user |
| **Forgot password** | Single field; if input has `@` → email reset link + OTP | Same field; otherwise BD phone → SMS with reset link + OTP |
| **Change password (logged in)** | Session-based; no email/phone identifier needed | Same |

SMS delivery is gated by `SMS_ENABLED` (and provider credentials). When disabled, SMS bodies (including OTP / reset links) are **logged** for QA.

---

## 2. Invitation (US-005)

### 2.1 Channel selection

Admin chooses **`invite_channel`**: `email` | `phone`.

| Channel | Required fields | User record |
|---|---|---|
| `email` | Email; phone optional | `email` set; phone optional |
| `phone` | BD mobile (E.164 / local forms accepted); email **not** required | `phone_number` set; `email` may be `null` |

**Login 2FA (`otp_type`)** must match channel. It is not the onboarding OTP switch.

| Invite channel | Allowed `otp_type` (login 2FA) |
|---|---|
| email | `none`, `email` |
| phone | `none`, `phone` |

Admin field label is **2FA**. Default is `none`.

### 2.2 What invite creates

`create_invitation()` (Django admin **Invite user**, REST, and bulk CSV):

1. **Placeholder `User`** in the tenant schema: `account_status=invited`, `is_active=True`, `is_staff=True`, unusable password. The row shows on the Users list immediately. One `UserRole` is attached for the selected role.
2. **`InvitationToken`** linked by `user` FK. Token is a UUID. Expiry is **7 days** (`US005_INVITATION_EXPIRY_DAYS`). A 6-digit activation OTP is always hashed onto the row (SHA-256), valid **10 minutes** (`OTP_EXPIRY_MINUTES`), **3 attempts** (`OTP_MAX_ATTEMPTS`).
3. Dispatch on `invite_channel`. On success the stored status moves **`sent` → `pending`**. If send throws, the row stays **`sent`** and the admin can Reinvite. The create API response body still returns the literal `invitation_status: "sent"`.

**Required invite fields**

| Field | Rule |
|---|---|
| First name | Required |
| Last name | Optional |
| Employee ID | Required; unique among non-blank IDs |
| Role | One role. Department is derived from the role. Staff invite cannot assign `super_admin`, `tenant_super_admin`, `driver`, or `driver_helper`. `tenant_admin` is offered only to a Tenant Super Admin (or platform Super Admin). |
| Site (POI) | Required for POI-scoped roles; rejected for roles that are not POI-scoped |
| Email / phone | Required for the chosen channel; the other is optional |

Active users with the same email or phone are rejected. A second pending invitation for the same email, phone, employee ID, or user is rejected (DB unique constraints). Orphan pending tokens with no `user` FK that collide on those fields are cancelled first.

### 2.3 Delivery

- **Email invite**: full activation URL `https://{tenant-host}/activate/?token={uuid}` plus the OTP, via the email task.
- **Phone invite**: the same OTP, and a **short** activation URL from `shorten_for_sms` (email links stay long), via `send_staff_invitation_sms`. When `SMS_ENABLED` is false the SMS body is logged and the invitation still moves to `pending`.

### 2.4 Reinvite

`resend_invitation()` always uses the stored **`invite_channel`**. It regenerates the activation OTP, keeps the same token, and enforces a **2-minute** cooldown (`INVITATION_RESEND_COOLDOWN_SECONDS`, stamped on `last_resent_at` even if dispatch fails).

Resend is refused when status is `activated` or `cancelled`, or `is_used` is true. An **expired** invitation is renewed: expiry reset to 7 days, `otp_verified` cleared, status set back to `sent`, then the message is sent again.

Changing the invite identity (channel, email, or phone) rotates the token and revokes previous short links before the resend.

### 2.5 Activation

SSR page `GET/POST /activate/?token=…` (`apps/users/web_views.py`):

1. **OTP** when `activation_otp_hash` is set and `otp_verified` is false. Destination follows `invite_channel` (masked email or phone). Invitee can resend the code (`resend_activation_otp`, 2-minute cooldown). A token with no hash (legacy, never resent) skips this step.
2. **Password + Terms & Conditions.** Password: at least 8 characters, one uppercase, one lowercase, one digit, one special character.
3. The placeholder user is updated in place: password set, `account_status=active`, email marked verified when an email exists, role assignment refreshed. Invitation status becomes `activated`, short links are revoked, and a welcome email is sent when the user has an email.
4. `/activate/success/` clears any previous portal session and issues a fresh JWT pair.

Public API equivalents: `POST /api/v1/users/invitations/{token}/otp/verify/`, `POST …/otp/resend/`, `POST …/activate/`. Activate accepts a one-shot `otp_code` or a prior verify call. Missing OTP on a token that has a hash returns `INV-400-OTP-REQUIRED`.

`GET /api/v1/users/invitations/{token}/` field `requires_otp` still follows `otp_type` (true only for `email` or `phone`, and only while `otp_verified` is false). The activation page and `activate_invitation` do not use that flag; they require OTP whenever `activation_otp_hash` is set.

---

## 3. Login (admin / staff)

### 3.1 Admin UI (`/admin/login/`)

- Segmented control: **Email | Phone**.
- **Phone**: static prefix badge **`+88`**; user enters **11 digits starting with `0`** (e.g. `01712345678`).
- On submit, posted username is `+88` + local digits → `+8801712345678`.
- Dark-theme-safe toggle styling (surface / grey tokens).

### 3.2 Resolution

`AuthService._resolve_user_by_identifier()`:

- Identifier with `@` → email (case-insensitive).
- Otherwise → phone, including BD normalization (`01…` ↔ `+8801…`).

Phone-only staff (no email) authenticate via Django admin using ModelBackend fallbacks in `apps/core/admin_otp.py` (email-keyed backend alone is insufficient).

### 3.3 OTP challenge

When login 2FA is required:

- Phone 2FA / phone-only → SMS OTP.
- Otherwise → email OTP.
- Challenge UI masks phone or email accordingly.

---

## 4. Forgot password (US-008 self-service)

### 4.1 UI (`/forgot-password/`)

- **One field**: “Email or phone” (no Email/Phone tabs).
- Client validates by shape:
  - contains `@` → email format
  - else → BD mobile rules
- Success copy follows detected channel (inbox vs SMS).

### 4.2 API / service

`POST /api/v1/auth/password/reset/request` with `{ "identifier": "…" }`:

1. Validate identifier (invalid format → `ValidationError`; unknown valid identifier → silent 200).
2. Create `PasswordReset` (link token + OTP; rate limit 3/hour).
3. Deliver:
   - **Email identifier** → `send_password_reset_email` (link + OTP).
   - **Phone identifier** → `send_password_reset_sms` (link + OTP).

Completion: `/reset-password/?token=…` → verify OTP → set password → invalidate sessions (same for both channels).

### 4.3 Admin-assisted reset

Delivers via user’s email if present; otherwise SMS to phone. Justification still required.

### 4.4 Authenticated change password

`/users/change-password/` and `POST /api/v1/auth/password/change` — no invite channel; works for phone-only users.

---

## 5. Environment & ops

| Setting | Effect |
|---|---|
| `SMS_ENABLED=false` (default local) | Invitation / login OTP / password-reset SMS logged, not sent |
| `SMS_ENABLED=true` + `MIMSMS_*` credentials | Real SMS via [MiM SMS API V2](https://www.mimsms.com/api-documentation) |

| Variable | Purpose |
|---|---|
| `SMS_PROVIDER` | `mimsms` (default) or `aws_sns` (deprecated rollback) |
| `MIMSMS_API_KEY` | MiM API key |
| `MIMSMS_USERNAME` | Registered MiM account email |
| `MIMSMS_SENDER_NAME` | Approved sender ID / masking number |
| `MIMSMS_TRANSACTION_TYPE` | `T` for transactional (all auth/onboarding SMS) |
| `MIMSMS_BASE_URL` | Default `https://api.mimsms.com` |

---

## 6. Doc / test touchpoints

| Area | Primary docs |
|---|---|
| Module overview | This file; [03-users README](./README.md) |
| Foundation invite/reset | [user-tenant-management.md](../01-foundation/user-tenant-management.md) |
| Auth | [authentication-security.md](../01-foundation/authentication-security.md) |
| Stories | [US-005](../../03-backlog/phase-1/sprints/sprint-2/02-tenant-user-management/US-005-user-invitation-activation.md), [US-008](../../03-backlog/phase-1/sprints/sprint-2/02-tenant-user-management/US-008-password-account-reset.md) |
| E2E plans | [invitation](../../09-testing/backend/e2e-scenarios/users/user-invitation-activation-e2e-scenarios.md), [password reset](../../09-testing/backend/e2e-scenarios/users/password-account-reset-e2e-scenarios.md) |

---

**Last Updated**: 2026-10-01
