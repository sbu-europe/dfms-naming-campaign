---
module: 12-users
specification: User Invitation & Activation (US-005) - Playwright E2E Plan
version: 1.0
phase: Phase 1
related_stories: US-005
source_spec: ../../03-backlog/stories/README.mdREADME.mdUS-005-user-invitation-activation.md
implementation_reference:
  - ../../../apps/users/admin.py (InviteUserAdmin)
  - ../../../apps/users/web_views.py (activate_account SSR)
  - ../../../apps/users/invitation_views.py (API)
test_implementation_reference: ../../../tests/e2e/modules/users/test_user_invitation_activation_e2e.py
last_updated: 2026-04-27
---

# User Invitation & Activation (US-005) - Playwright E2E Plan

## Scope (Phase 1)

- **Email-only invitation** for all roles (including Driver/Helper) via admin "Add user".
- **OTP type options**: `none`, `email`.
- **Activation SSR page**: `/activate/?token=...` with OTP step gating (when enabled).
- **Reinvite** behavior and **cooldown** feedback (2 minutes).

## Out of scope (for Playwright E2E in this repo)

- **OTP success path for otp_type=email** (OTP is delivered by email and persisted hashed; Playwright cannot reliably read outbound email in this environment).
- CSV bulk invitation via API (covered better by integration tests; add Playwright coverage later if UI is added).
- Subscription plan limit enforcement (environment-dependent; validated in service/integration tests and admin messages elsewhere).

## Test Cases

| Test Case ID | Scenario | Description | Priority | Status |
|---|---|---|---:|---|
| TC01 | Invite user from Users list | From `/admin/users/user/` click **Add user** → fill email, names, employee id, role, OTP type → save → assert redirected back to Users list and row shows **Invited** status. | P0 | Implemented |
| TC02 | Forbidden role hidden | On Invite form, assert Role dropdown **does not** include **Super Admin**. | P0 | Implemented |
| TC03 | Duplicate email rejected | Invite an email, then attempt invite again with same email; assert validation surfaces an “already exists” style error. | P0 | Implemented |
| TC04 | Reinvite cooldown surfaced | Open invitation detail and click **Reinvite** twice; second attempt should show cooldown/too-many-requests style feedback. | P1 | Implemented |
| TC05 | Activation requires OTP step when otp_type=email | Create email-OTP invite; open `/activate/?token=...`; assert OTP step is shown and trying to submit password without OTP shows “verify OTP first”. | P0 | Implemented |
| TC06 | Activation succeeds when otp_type=none | Create invite with otp_type=none; open `/activate/?token=...`; set password + accept T&C; assert redirect to `/activate/success/`. | P0 | Implemented |
| TC07 | Activation missing token | Open `/activate/` (no token) and assert “Link Invalid / No invitation token provided” message is shown. | P1 | Implemented |
| TC08 | Activation invalid token | Open `/activate/?token=<random>` and assert “Invalid invitation token” message is shown. | P1 | Implemented |
| TC09 | Activation link re-use blocked (used token) | Activate successfully once (otp_type=none), then re-open same `/activate/?token=...` and assert “expired or already been used” message is shown. | P0 | Implemented |
| TC10 | OTP invite cannot skip OTP via direct password POST | For otp_type=email invite, on OTP step force-submit a password-step POST; assert server responds with OTP step + “Please verify your OTP first.” | P1 | Implemented |
| TC11 | Activation password validation errors | For otp_type=none invite, submit invalid password (too short / missing uppercase / missing number), mismatch confirm, and missing T&C; assert validation errors are shown (client-side + server-side T&C). | P1 | Implemented |
| TC12 | Activation blocked for cancelled invitation | Create invite, cancel it (API/admin tooling), then open `/activate/?token=...`; assert “expired or already been used” style message is shown. | P2 | Implemented |
