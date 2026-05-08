---
module: 01-foundation
specification: Multi-Factor Auth (US-002) - Playwright E2E Plan
version: 1.0
phase: Phase 1
related_stories: US-002
source_spec: ../../03-backlog/stories/US-002-multi-factor-auth.md
test_implementation_reference: ../../../tests/e2e/modules/01-foundation/test_multi_factor_auth_us002_e2e.py
last_updated: 2026-05-04
---

# Multi-Factor Auth (US-002) - Playwright E2E Plan

## Scope (Phase 1, current repo implementation)

These E2E scenarios validate the password-first login flow when **OTP is required**:

- `POST /api/v1/auth/login/password/` returns `otp_required=true` and a `session_token`
- `POST /api/v1/auth/login/password/verify-otp/` enforces OTP validation and completes login
- OTP failure paths (wrong/expired) and session-token replay protection

## E2E constraints (important)

- Playwright E2E runs against a live environment and cannot read outbound OTP delivery.
- The automated suite deterministically seeds a known OTP hash in DB for the created user before verifying OTP.

## Test Cases (aligned with implemented automation)

| Test Case ID | Scenario | Description | Priority | Status |
|---|---|---|---:|---|
| TC01 | Password login requires OTP challenge | Create an admin user with email-OTP requirement and verify password-first login returns `otp_required=true` + `session_token`. | P0 | Implemented |
| TC02 | Wrong OTP rejected (best-effort audit) | Verify invalid OTP returns error response and (where audit app is enabled) creates a failed OTP verification audit event. | P0 | Implemented |
| TC03 | Valid OTP completes login (best-effort audit) | Seed OTP and verify OTP completes login and returns JWT pair; audit event is asserted best-effort. | P0 | Implemented |
| TC04 | Expired OTP rejected | Seed an expired OTP and verify the verify-otp endpoint rejects it. | P0 | Implemented |
| TC05 | Session token cannot be replayed | Complete OTP verify once, then attempt verify again using same `session_token` and assert it is rejected. | P1 | Implemented |

## Implementation Notes

- Automated suite: `tests/e2e/modules/01-foundation/test_multi_factor_auth_us002_e2e.py`
- The suite uses DB access (`DJANGO_ALLOW_ASYNC_UNSAFE`) only to create/seed OTP data required for deterministic E2E.
