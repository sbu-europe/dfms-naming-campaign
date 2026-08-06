---
module: 03-users
specification: Staff invite, login & password reset — channel overview
version: 1.0
phase: Phase 1
last_updated: 2026-07-28
related_stories: US-005, US-006, US-008
related_cr: CR-002
implementation_reference:
  - nourish-backend/apps/users/invitation_service.py
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
**Sprint tracker**: [FB-032](../../03-backlog/sprints/sprint-6/feedback-resolution/01-users-and-access.md#fb-032--staff-invite--login--forgot-password-email-or-phone-channel)

> **Planned change ([CR-003](../../11-change-requests/CR-003-mandatory-onboarding-otp.md), draft)**: onboarding OTP (§2.4) will become **unconditional** for every invitation, regardless of `otp_type` — the "Allowed OTP types" table in §2.1 and the "Optional OTP step" language in §2.4 reflect **current** shipped behavior only. `otp_type` itself, the invite form, and the API/CSV contracts are **not changing** — `otp_type` continues to exist solely for login 2FA (§3.3), which is explicitly out of scope for CR-003 and fully unaffected. This note will be replaced with updated §2.4 language once CR-003 ships.

---

## 1. Summary

| Capability | Email channel | Phone channel |
|---|---|---|
| **Invite** | Email required; optional email OTP for activation / login 2FA | Phone (BD mobile) required; `User.email` may be null; optional SMS OTP |
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

**OTP type** must match channel:

| Invite channel | Allowed OTP types |
|---|---|
| email | `none`, `email` |
| phone | `none`, `phone` |

### 2.2 Delivery

- **Email invite**: activation URL (+ OTP if `otp_type=email`) via email task.
- **Phone invite**: activation URL (+ OTP if `otp_type=phone`) via `send_staff_invitation_sms` (or log when SMS disabled).

### 2.3 Reinvite

`resend_invitation()` always uses the invitation’s stored **`invite_channel`** — phone invites are never re-sent as email (and vice versa).

### 2.4 Activation

Unchanged SSR flow at `/activate/?token=…`:

1. Optional OTP step (email or SMS per invitation).
2. Set password + accept T&C.
3. Account becomes active; user signs in with the **same identifier** used for invite (email or phone).

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
| `SMS_ENABLED=true` + Twilio credentials | Real SMS via configured provider |

---

## 6. Doc / test touchpoints

| Area | Primary docs |
|---|---|
| Module overview | This file; [03-users README](./README.md) |
| Foundation invite/reset | [user-tenant-management.md](../01-foundation/user-tenant-management.md) |
| Auth | [authentication-security.md](../01-foundation/authentication-security.md) |
| Stories | [US-005](../../03-backlog/stories/US-005-user-invitation-activation.md), [US-008](../../03-backlog/stories/US-008-password-account-reset.md) |
| E2E plans | [invitation](../../09-testing/backend/e2e-scenarios/users/user-invitation-activation-e2e-scenarios.md), [password reset](../../09-testing/backend/e2e-scenarios/users/password-account-reset-e2e-scenarios.md) |

---

**Last Updated**: 2026-07-28
