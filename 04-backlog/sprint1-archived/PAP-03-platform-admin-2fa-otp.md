---
task_id: PAP-03
title: Platform Admin 2FA — Email OTP Challenge
epic: Platform Admin Portal
sprint: Sprint 1 — Infrastructure, Onboarding & Secure Login
type: Story
priority: Critical
status: Done
story_points: 3
assignee: ~
related_stories:
  - PAP-02-platform-admin-login.md
  - US-002-multi-factor-auth.md
---

# PAP-03 — Platform Admin 2FA — Email OTP Challenge

## User Story

**As a** Super Admin  
**I want** to be required to enter a one-time code sent to my email after my password is accepted  
**So that** my platform-wide account has a second layer of protection even if my password is compromised

## Description

After PAP-02 validates the Super Admin's credentials, this step intercepts the normal Django admin session creation and redirects to an OTP challenge page. A 6-digit code is dispatched via Celery to the admin's registered email. The session is only created once the correct OTP is submitted.

The implementation patches `admin.site.login` at app startup so no changes to Django's internals are needed and all existing admin behaviour (CSRF, `?next=`, session expiry) is preserved.

## Acceptance Criteria

- [ ] After correct password, user is redirected to `/admin/login/?otp_challenge=1` — not to the dashboard
- [ ] OTP email is dispatched asynchronously via Celery within seconds of the redirect
- [ ] OTP is exactly 6 digits and expires after 10 minutes
- [ ] Correct OTP creates the Django session and redirects to the originally requested page (`?next=`)
- [ ] Incorrect OTP shows an inline error; no session is created
- [ ] Expired OTP shows "Code has expired — please log in again"; user must restart from PAP-02
- [ ] Super Admin cannot bypass the OTP step by navigating directly to any `/admin/` URL mid-flow
- [ ] All 2FA attempts (success and failure) are logged

### Feedback — Sprint 1 Demo (FB-004)
- [ ] After successful OTP, set a `dfms_trusted_device=<signed_token>` cookie with 30-day max-age — [FB-004](FEEDBACK.md#fb-004--otp-trusted-device--skip-otp-on-known-browser)
- [ ] On subsequent logins from same browser: check trusted device cookie before triggering OTP — valid cookie skips OTP entirely
- [ ] Trusted device tokens stored in Redis (`trusted_device:admin:<user_id>:<token>`, TTL 30 days)
- [ ] Invalid, expired, or revoked cookie falls back to full OTP challenge
- [ ] Super Admin can view and revoke trusted devices from account settings

## Sub-tasks

| # | Sub-task | Status |
|---|----------|--------|
| PAP-03-1 | Create `apps/core/admin_otp.py` — implement `make_patched_login(original_login)` factory returning a replacement view that intercepts successful credentials | Done |
| PAP-03-2 | After credential validation: generate 6-digit OTP, store in Redis (`otp:admin:<user_id>`, TTL 600s), set HMAC-signed cookie `dfms_admin_pending=<user_id>\|<next_url>` | Done |
| PAP-03-3 | Dispatch `send_otp_notification.delay(user_id, schema_name='public')` immediately after storing the OTP | Done |
| PAP-03-4 | Handle `GET /admin/login/?otp_challenge=1` — verify signed cookie is present; render `templates/admin/otp_challenge.html` | Done |
| PAP-03-5 | Handle `POST /admin/login/?otp_challenge=1` — validate OTP from Redis; on success: call `login(request, user)`, clear cookie, redirect to `next_url`; on failure: re-render with error | Done |
| PAP-03-6 | Add `"subtitle": None` to template context in the challenge render to prevent `KeyError` in Django admin base template | Done |
| PAP-03-7 | Register the patched login in `apps/core/apps.py` `CoreConfig.ready()` — call `patch_admin_login()` | Done |
| PAP-03-8 | Manually test full flow: correct creds → OTP email arrives → correct code → land on dashboard; wrong code → error stays; direct nav to `/admin/` mid-flow → redirected to login | Done |

## Technical Details

### Flow

```
POST /admin/login/  { username, password }  ← PAP-02
  → Credentials valid
  → Generate OTP → Redis otp:admin:<user_id> TTL=600s
  → Set signed cookie dfms_admin_pending=<user_id>|<next_url>
  → Dispatch send_otp_notification.delay(user_id, schema_name='public')
  → Redirect to /admin/login/?otp_challenge=1

GET /admin/login/?otp_challenge=1
  → Cookie present? → render otp_challenge.html
  → Cookie missing? → redirect to /admin/login/

POST /admin/login/?otp_challenge=1  { otp_code }
  → Redis.get(otp:admin:<user_id>) == otp_code?
    YES → login(request, user), delete cookie, redirect to next_url
    NO  → re-render with "Invalid code" error
    EXPIRED → re-render with "Code expired, please log in again"
```

### Why a signed cookie instead of session?

At the OTP challenge step the user is **not yet logged in** — Django has not created an authenticated session. Storing the pending state in a HMAC-signed cookie (using `django.core.signing`) ties it to the browser without needing a DB write or an anonymous session.

### Multi-tenancy note

The Super Admin lives in the `public` schema. `send_otp_notification` receives `schema_name='public'` and wraps `User.objects.get()` inside `schema_context('public')` to avoid a `ProgrammingError` in the Celery worker.

## Definition of Done

- Correct password → OTP email received → correct code → land on admin dashboard
- Wrong OTP → inline error, session not created, user stays on OTP page
- Expired OTP → "code expired" message, redirect back to login
- Direct nav to `/admin/` between steps → redirected to `/admin/login/`
