---
jira_key: DFS-014
jira_type: Story
jira_epic: DFS-012
jira_sprint: "Sprint 1"
task_id: CP-03
title: 2FA — Email OTP (3-Step Secure Login for Tenant Admin)
epic: Client Portal
status: Done
story_points: 8
assignee: ~
related_stories:
  - US-002-multi-factor-auth.md
sub_tasks:
  - id: DFS-014-10
    title: "FB-004: Trusted device cookie — skip OTP on known browser"
    status: Open
  - id: DFS-014-11
    title: "FB-005: Configurable OTP channel per user (email | SMS)"
    status: Open
feedback_file: ../04-feedback/CP-03-feedback.md
---

# CP-03 — 2FA — Email OTP (3-Step Secure Login)

## User Story

**As a** Tenant Admin  
**I want** to be required to verify via email OTP after entering my password  
**So that** my organisation's data is protected by a second authentication factor

## Description

Tenant Admin accounts have elevated privileges within a tenant schema (user management, data configuration). A single compromised password should not be enough to grant full access. After successful password validation, an OTP is sent to the admin's registered email. The session is not created until the OTP is verified.

This is the **tenant portal** counterpart to PAP-03 (platform admin 2FA). Both share the same underlying OTP infrastructure but have separate implementations due to different authentication surfaces.

## Acceptance Criteria

- [x] After correct email + password on `/login/`, user is NOT logged in — OTP page is shown instead
- [x] OTP email is delivered within 30 seconds via Celery
- [x] OTP is 6 digits and expires after 10 minutes
- [x] Correct OTP creates the session and redirects to `/dashboard/`
- [x] Incorrect OTP shows an inline error and does not create a session
- [x] OTP resend is available with a 60-second cooldown
- [x] Too many failed OTP attempts triggers a lockout (configurable threshold)
- [x] Non-admin roles (Warehouse Manager, Driver Coordinator, etc.) are NOT required to complete 2FA in Phase 1

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| CP-03-1 | Implement `_generate_otp()` in `apps/users/services.py` — returns a 6-digit string using `secrets.randbelow` | DFS-014-1 | Done |
| CP-03-2 | Implement `_store_otp(user_id, otp)` — write to Redis key `otp:<user_id>` with TTL 600 seconds | DFS-014-2 | Done |
| CP-03-3 | Implement `_verify_otp(user_id, otp_input)` — read from Redis, compare, delete key on match; increment fail counter on mismatch | DFS-014-3 | Done |
| CP-03-4 | In the login view: after credential validation, check user's role; if `Tenant Admin` → generate OTP, store, dispatch `send_otp_notification.delay(user_id, schema_name)`, return `{ status: "otp_required" }` | DFS-014-4 | Done |
| CP-03-5 | Create OTP verification endpoint `POST /api/auth/otp/verify/` — accept `{ session_token, otp_code }`, call `_verify_otp`, on success issue JWT access + refresh tokens | DFS-014-5 | Done |
| CP-03-6 | Create `templates/auth/otp_verify.html` — 6-digit code input, resend button, countdown timer, error display | DFS-014-6 | Done |
| CP-03-7 | Implement resend endpoint `POST /api/auth/otp/resend/` — check Redis cooldown key `otp_resend_cooldown:<user_id>` (TTL 60s); if absent: generate new OTP, store, dispatch, set cooldown key | DFS-014-7 | Done |
| CP-03-8 | Add `schema_name=connection.schema_name` argument to `send_otp_notification.delay(...)` call in `apps/users/services.py` | DFS-014-8 | Done |
| CP-03-9 | Add OTP attempt lockout: after N failed attempts (configurable), set `otp_locked:<user_id>` Redis key; return 429 until TTL expires | DFS-014-9 | Done |

## Technical Details

### 3-Step Login Flow

```
Step 1: POST /api/auth/login/
        { email, password }
        → Validates credentials
        → If Tenant Admin: generate OTP, store in Redis, dispatch email
        → Return { status: "otp_required", session_token: "<pending_token>" }

Step 2: POST /api/auth/otp/verify/
        { session_token, otp_code }
        → Validate OTP from Redis
        → On success: create full JWT access/refresh tokens, return to client

Step 3: Client stores JWT tokens, uses Authorization: Bearer <token> for all subsequent requests
```

### Role-Based 2FA Enforcement

| Role | 2FA Required (Phase 1) |
|------|----------------------|
| Super Admin | Yes (PAP-03) |
| Tenant Admin | Yes (this story) |
| Warehouse Manager | No |
| Driver Coordinator | No |
| Driver | No |

## Definition of Done

- Tenant Admin logs in → OTP email received within 30s → enters OTP → lands on dashboard
- Wrong OTP → error shown, no session created
- Resend OTP → new code sent after 60s cooldown

## From Demo Feedback ([FB-004, FB-005](../04-feedback/CP-03-feedback.md))

### FB-004 — Trusted Device: Skip OTP on Known Browser
- [ ] After successful OTP, set `dfms_trusted_device=<signed_token>` cookie with 30-day max-age
- [ ] On login: check for trusted device cookie before deciding whether to trigger OTP
- [ ] Valid trusted device cookie → skip OTP, log in directly
- [ ] Invalid / missing / revoked cookie → trigger OTP as normal
- [ ] Trusted device tokens stored in Redis with 30-day TTL (key: `trusted_device:<user_id>:<token>`)
- [ ] User can view all trusted devices and revoke individual ones from account settings

### FB-005 — Configurable OTP Channel per User (Email | SMS)
- [ ] `User` model has `otp_channel` field (`email` | `sms`), default `email`
- [ ] Tenant Admin can set `otp_channel` per user in the invite form and user edit form
- [ ] On login, system routes OTP dispatch based on `user.otp_channel`
- [ ] SMS OTP dispatched via a Celery task wrapping the configured SMS gateway
- [ ] If SMS delivery fails, system falls back to email and logs the failure
- [ ] Tenant Admin cannot change their own OTP channel (requires Super Admin approval)
