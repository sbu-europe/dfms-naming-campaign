---

## module: 12-users
specification: Password & Account Reset (US-008) - Playwright E2E Plan
version: 1.0
phase: Phase 1
related_stories: US-008
source_spec: ../../03-backlog/stories/README.mdREADME.mdUS-008-password-account-reset.md
implementation_reference:
  - ../../../apps/users/password_reset_service.py
  - ../../../apps/core/views.py (US-008 API endpoints)
  - ../../../apps/users/web_views.py (SSR pages)
  - ../../../templates/auth/forgot_password.html
  - ../../../templates/auth/reset_password.html
test_implementation_reference: ../../../tests/e2e/modules/users/test_password_account_reset_e2e.py
last_updated: 2026-04-27

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


| Test Case ID | Scenario                                                                | Description                                                                                                                                                                                                      | Priority | Status      |
| ------------ | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- |
| TC01         | Unknown email anti-enumeration (UI)                                     | Open `GET /forgot-password/` → submit an **unknown email** → assert a generic success message is shown (no account enumeration).                                                                                 | P0       | Implemented |
| TC02         | Unknown email anti-enumeration (API)                                    | Call `POST /api/v1/auth/password/reset/request` with an **unknown email** → assert HTTP 200 + generic success (no account enumeration).                                                                          | P0       | Implemented |
| TC03         | Missing token rejected (UI)                                             | Open `GET /reset-password/` without `token` → assert “missing token” warning shown.                                                                                                                              | P0       | Implemented |
| TC04         | Invalid token rejected on verify (UI)                                   | Open `GET /reset-password/?token=<fake>` → submit OTP verify → assert invalid/expired error shown.                                                                                                               | P0       | Implemented |
| TC05         | Rate limit enforced (API)                                               | For an active user: call `POST /api/v1/auth/password/reset/request` **4 times** within an hour → assert the 4th is rejected with rate-limit error (repo currently returns HTTP 400 + code `PWD-429-RATE-LIMIT`). | P0       | Implemented |
| TC06         | Deactivated user treated as unknown (API)                               | For an inactive user: call `POST /api/v1/auth/password/reset/request` repeatedly → assert it always returns HTTP 200 with generic success (no rate-limit and no reset initiated).                                | P0       | Implemented |
| TC07         | OTP brute-force lockout (API)                                           | Create a reset record → call `POST /api/v1/auth/password/reset/verify` with wrong OTP until `OTP_MAX_ATTEMPTS` reached → assert reset is cancelled and further verifies show “no longer valid”.                  | P0       | Implemented |
| TC08         | Concurrent reset requests cancel older token (API)                      | Create two resets for same user where the older is cancelled and a newer is pending → verify OTP against old token → assert message indicates a newer reset link exists.                                         | P0       | Implemented |
| TC09         | Password policy enforced (API)                                          | With a verified reset token: call `POST /api/v1/auth/password/reset` using a weak password → assert policy validation error returned.                                                                            | P0       | Implemented |
| TC10         | Password history enforced (API)                                         | With a verified reset token: attempt to set password equal to current password or one of last-3 → assert password reuse is rejected.                                                                             | P0       | Implemented |
| TC11         | Admin-assisted password page loads (Admin UI)                           | From Django admin, open `GET /admin/users/user/<id>/admin-assisted-password/` → assert the form renders and required inputs exist.                                                                               | P0       | Implemented |
| TC12         | Admin-assisted password mismatch rejected (Admin UI)                    | Submit admin-assisted password form with mismatched confirmation → assert validation error shown.                                                                                                                | P0       | Implemented |
| TC13         | Admin-assisted password generate + set shows one-time banner (Admin UI) | Use “Generate password” → submit → assert success + one-time banner shows the generated password value.                                                                                                          | P0       | Implemented |
| TC14         | Admin-assisted reset cancels prior pending resets (Service/DB)          | Create a pending self-service reset for a user → initiate an admin-assisted reset → assert prior pending/verified resets are cancelled.                                                                          | P1       | Implemented |
| TC15         | Admin-assisted reset fails for inactive user (Service/DB)               | Attempt admin-assisted reset for an inactive user → assert user-friendly validation error returned.                                                                                                              | P1       | Implemented |


