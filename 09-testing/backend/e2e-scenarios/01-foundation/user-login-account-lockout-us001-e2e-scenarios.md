---
module: 01-foundation
specification: User Login & Account Lockout (US-001) - Playwright E2E Plan
version: 1.0
phase: Phase 1
related_stories: US-001
source_spec: ../../03-backlog/stories/US-001-user-login-account-lockout.md
test_implementation_reference: ../../../tests/e2e/modules/01-foundation/test_user_login_account_lockout_e2e.py
last_updated: 2026-05-04
---

# User Login & Account Lockout (US-001) - Playwright E2E Plan

## Scope (Phase 1, current repo implementation)

These E2E scenarios validate:

- Lockout after repeated failed password attempts within a rolling window
- Lockout duration enforcement (login blocked even with correct password)
- Admin ability to list locked accounts
- Admin unlock requires justification and resets counter
- Edge behavior when the failed-attempt window expires

## E2E constraints (important)

- The suite runs against a live environment; it cannot read outbound OTP/email.
- Admin API/JWT flows are skipped when OTP is required for the configured admin account (non-interactive constraint).

## Test Cases (aligned with implemented automation)

| Test Case ID | Scenario | Description | Priority | Status |
|---|---|---|---:|---|
| TC01 | Failed attempts increment below threshold | Attempt wrong password fewer than threshold times and assert user is not yet locked. | P0 | Implemented |
| TC02 | Lock after threshold | Trigger the configured threshold (3) and assert the account is locked. | P0 | Implemented |
| TC03 | Correct password blocked during lockout | After lockout, attempt correct password and assert login is still blocked until unlock/expiry. | P0 | Implemented |
| TC04 | Admin can list locked accounts | As admin, list locked accounts and assert the locked user is visible. | P0 | Implemented |
| TC05 | Unlock requires justification | Attempt unlock without justification and assert validation error/blocked action. | P0 | Implemented |
| TC06 | Unlock restores login and resets counter | Unlock with justification then assert immediate successful login and failed-attempt counter reset. | P0 | Implemented |
| TC07 | Window expiry resets counter | Simulate/follow window expiry behavior and assert counter resets (no lockout on subsequent failures). | P1 | Implemented |

## Implementation Notes

- Automated suite: `tests/e2e/modules/01-foundation/test_user_login_account_lockout_e2e.py`
- The suite provisions and activates a user via admin invitation (otp_type=none) so password-first login is deterministic.
