---
task_id: CP-03
title: 2FA — Email OTP (3-Step Secure Login for Tenant Admin)
epic: Client Portal
sprint: Sprint 1 — Infrastructure, Onboarding & Secure Login
type: Story
priority: Critical
status: Done
story_points: 8
assignee: ~
related_stories:
  - US-002-multi-factor-auth.md
---

# CP-03 — 2FA — Email OTP (3-Step Secure Login)

## User Story

**As a** Tenant Admin  
**I want** to be required to verify via email OTP after entering my password  
**So that** my organisation's data is protected by a second authentication factor

## Description

Tenant Admin accounts have elevated privileges within a tenant schema (user management, data configuration). A single compromised password should not be enough to grant full access. After successful password validation, an OTP is sent to the admin's registered email. The session is not created until the OTP is verified.

This is the **tenant portal** counterpart to PAP-02 (platform admin 2FA). Both share the same underlying OTP infrastructure but have separate implementations due to different authentication surfaces (DRF / session auth vs Django admin).

## Acceptance Criteria

- [ ] After correct email + password on `/login/`, user is NOT logged in — OTP page is shown instead
- [ ] OTP email is delivered within 30 seconds via Celery
- [ ] OTP is 6 digits and expires after 10 minutes
- [ ] Correct OTP creates the session and redirects to `/dashboard/`
- [ ] Incorrect OTP shows an inline error and does not create a session
- [ ] OTP resend is available with a 60-second cooldown
- [ ] Too many failed OTP attempts triggers a lockout (configurable threshold)
- [ ] Non-admin roles (Warehouse Manager, Driver Coordinator, etc.) are NOT required to complete 2FA in Phase 1

## Sub-tasks

| # | Sub-task | Status |
|---|----------|--------|
| CP-03-1 | Implement `_generate_otp()` in `apps/users/services.py` — returns a 6-digit string using `secrets.randbelow` | Done |
| CP-03-2 | Implement `_store_otp(user_id, otp)` — write to Redis key `otp:<user_id>` with TTL 600 seconds | Done |
| CP-03-3 | Implement `_verify_otp(user_id, otp_input)` — read from Redis, compare, delete key on match; increment fail counter on mismatch | Done |
| CP-03-4 | In the login view (`apps/users/views.py`): after credential validation, check user's role; if `Tenant Admin` → call `_generate_otp`, `_store_otp`, dispatch `send_otp_notification.delay(user_id, schema_name)`, return `{ status: "otp_required" }` | Done |
| CP-03-5 | Create OTP verification endpoint `POST /api/auth/otp/verify/` — accept `{ session_token, otp_code }`, call `_verify_otp`, on success issue JWT access + refresh tokens | Done |
| CP-03-6 | Create `templates/auth/otp_verify.html` — 6-digit code input, resend button, countdown timer, error display | Done |
| CP-03-7 | Implement resend endpoint `POST /api/auth/otp/resend/` — check Redis cooldown key `otp_resend_cooldown:<user_id>` (TTL 60s); if absent: generate new OTP, store, dispatch, set cooldown key | Done |
| CP-03-8 | Add `schema_name=connection.schema_name` argument to `send_otp_notification.delay(...)` call in `apps/users/services.py` | Done |
| CP-03-9 | Add OTP attempt lockout: after N failed attempts (configurable), set `otp_locked:<user_id>` Redis key; return 429 until TTL expires | Done |

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
        → On failure: increment attempt counter, return error

Step 3: Client stores JWT tokens, uses Authorization: Bearer <token> for all subsequent requests
```

### Multi-Tenancy Note

`send_otp_notification` in `apps/notifications/tasks.py` accepts `schema_name` and wraps `User.objects.get()` in `schema_context(schema_name)`. This prevents `ProgrammingError: relation "users" does not exist` that occurs when the Celery worker runs without a tenant HTTP context.

### Role-Based 2FA Enforcement

| Role | 2FA Required (Phase 1) |
|------|----------------------|
| Super Admin | Yes (PAP-02) |
| Tenant Admin | Yes (this task) |
| Warehouse Manager | No |
| Driver Coordinator | No |
| Driver | No |

## Definition of Done

- Tenant Admin logs in → OTP email received within 30s → enters OTP → lands on dashboard
- Wrong OTP → error shown, no session created
- Resend OTP → new code sent after 60s cooldown
