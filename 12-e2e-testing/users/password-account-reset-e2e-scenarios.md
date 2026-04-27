---
module: 12-users
specification: Password & Account Reset (US-008) - Playwright E2E Plan
version: 1.0
phase: Phase 1
related_stories: US-008
source_spec: ../../04-backlog/stories/US-008-password-account-reset.md
implementation_reference:
  - ../../../apps/users/password_reset_service.py
  - ../../../apps/core/views.py (US-008 API endpoints)
  - ../../../apps/users/web_views.py (SSR pages)
  - ../../../templates/auth/forgot_password.html
  - ../../../templates/auth/reset_password.html
test_implementation_reference: ../../../tests/e2e/modules/test_password_account_reset_e2e.py
last_updated: 2026-04-27
---

# Password & Account Reset (US-008) - Playwright E2E Plan

## Scope (Phase 1, current repo implementation)

- Self-service password reset using the SSR flow:
  - `GET /forgot-password/` (request initiation UI)
  - `GET /reset-password/?token=...` (OTP → new password)
  - API endpoints behind the UI:
    - `POST /api/v1/auth/password/reset/request`
    - `POST /api/v1/auth/password/reset/verify`
    - `POST /api/v1/auth/password/reset`
- Security behaviors:
  - rate limiting for reset requests (max **3 per hour** per user)
  - invalid OTP handling + max attempts (OTP attempts tracked server-side)
  - expired reset token handling
- Post-conditions:
  - old password no longer works
  - new password works (asserted when environment doesn’t require login OTP)
- Admin-assisted password reset (Django admin custom view):
  - `GET /admin/users/user/<id>/admin-assisted-password/`
  - Admin submits required details to initiate an assisted reset for a target user

## Not covered / deferred (because not implemented or environment-dependent)

- Mobile/phone based reset initiation: current SSR `forgot_password.html` only accepts email.
- “Reset link + OTP delivered to multiple channels” (email + SMS): current implementation emails link + OTP together.
- Change password (authenticated) UI: API exists (`POST /api/v1/auth/password/change`) but no dedicated E2E coverage yet.
- Admin-assisted reset completion by the user (OTP + new password): token + OTP are delivered via email and stored hashed; Playwright E2E does not read outbound email, so it cannot complete the user-side reset step.
- “Invalidate all active sessions” verification: service marks sessions inactive + best-effort JWT blacklist, but E2E verifies via password login behavior rather than inspecting session tables.

## Test Cases

| Test Case ID | Scenario | Description | Priority | Status |
|---|---|---|---:|---|
| TC01 | Self-service reset completes | Create a tenant user via invite+activate → request reset → open reset URL → verify OTP → set new password → assert old password rejected and new password accepted. | P0 | Implemented |
| TC02 | Invalid OTP rejected | Request reset → open reset URL → enter wrong OTP → assert error surfaced and cannot proceed to password step. | P0 | Implemented |
| TC03 | Expired token rejected | Request reset → force-expire the reset record in DB → open reset URL → attempt OTP verify → assert “expired/invalid” error. | P0 | Implemented |
| TC04 | Rate limit enforced | Call reset request endpoint 4 times within an hour → assert 4th attempt returns HTTP 429. | P0 | Implemented |
| TC05 | Admin-assisted password page loads | From Django admin user change page, open `admin-assisted-password` URL and assert the form renders (target user context + required inputs). | P0 | Planned |
| TC06 | Admin-assisted reset requires justification | Submit the assisted reset form with empty/short justification → assert validation error is shown and no reset is initiated. | P0 | Planned |
| TC07 | Admin-assisted reset requires permitted admin | Attempt to access the `admin-assisted-password` URL as a non-tenant-admin/non-super-admin (or by forcing permissions off in DB) → assert HTTP 403 / permission denied surfaced. | P0 | Planned |
| TC08 | Admin-assisted reset initiation success (admin-side) | Submit assisted reset with valid justification (+ verification method if present) → assert success message is shown (reset link/OTP dispatch is queued) and an audit/log entry is created (when visible in admin/log UI). | P0 | Planned |

## Edge Cases (tracked for completeness; some require extra UI or env support)

- **Unknown email anti-enumeration**: endpoint returns HTTP 200 with generic message and does not send an email.
- **Deactivated user cannot reset**: service only resets `is_active=True` users.
- **OTP brute-force lockout**: after `OTP_MAX_ATTEMPTS` failures, reset is cancelled and must be re-requested.
- **Concurrent reset requests**: issuing a new reset cancels prior `pending/verified` resets; older links should stop working.
- **Password history enforcement**: cannot reuse current password or last 3 passwords (requires test users with history set up).
- **Password policy enforcement**: reset rejects weak passwords according to `apps/users/password_policy.py`.
- **Admin-assisted reset cancels prior pending resets**: assisted initiation should cancel any prior `pending/verified` reset attempts for the same user.
- **Admin-assisted reset on inactive user**: should fail with a user-friendly error (service only targets `is_active=True`).

