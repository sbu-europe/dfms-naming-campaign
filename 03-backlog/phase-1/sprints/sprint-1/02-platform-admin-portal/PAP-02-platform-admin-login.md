---
jira_key: DFS-007
jira_type: Story
jira_epic: DFS-011
jira_sprint: "Sprint 1"
task_id: PAP-02
title: Platform Admin Login (Username & Password)
epic: Platform Admin Portal
status: Done
story_points: 2
assignee: ~
related_stories:
  - PAP-03-platform-admin-2fa-otp.md
---

# PAP-02 — Platform Admin Login (Username & Password)

## User Story

**As a** Super Admin  
**I want** to sign in to the platform admin portal with my username and password  
**So that** I can access the DFMS admin surface to manage tenants and platform settings

## Description

The platform admin portal (`admin.dfms.com`) is built on Django's built-in admin. The login page must be customised to use DFMS branding (consistent with PAP-01) while preserving all Django admin behaviour: CSRF protection, `?next=` redirect support, correct session handling, and the standard lockout on repeated failures.

Successful credential validation does **not** grant access directly — it hands off to the 2FA step (PAP-03). This story covers only the credential validation half of the login flow.

## Acceptance Criteria

- [x] Navigating to any admin URL while unauthenticated redirects to `/admin/login/?next=<url>`
- [x] Submitting correct username + password advances to the OTP challenge (PAP-03)
- [x] Submitting incorrect credentials shows an inline error ("Please enter the correct username and password")
- [x] Login form uses DFMS branding — consistent with the custom admin CSS from PAP-01
- [x] CSRF token is present and validated on every POST
- [x] Django admin `?next=` redirect is preserved through the full login + OTP flow

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| PAP-02-1 | Override `templates/admin/login.html` with DFMS-branded login form — inherits `base_site.html` from PAP-01 | DFS-007-1 | Done |
| PAP-02-2 | Confirm `{% csrf_token %}` is present in the form and Django's CSRF middleware validates it | DFS-007-2 | Done |
| PAP-02-3 | Verify `?next=` parameter is forwarded through the full auth flow | DFS-007-3 | Done |
| PAP-02-4 | Verify incorrect credentials show Django's default inline error without exposing whether username or password was wrong | DFS-007-4 | Done |
| PAP-02-5 | On successful credential validation: hand control to `patch_admin_login()` (PAP-03) instead of creating the session immediately | DFS-007-5 | Done |

## Technical Details

- Session is **not** created at this step — `login(request, user)` is called only after OTP is verified (PAP-03)
- `?next=` value is stored in the signed cookie alongside the pending user ID so it survives the OTP redirect

## Definition of Done

- Navigate to `/admin/` → redirect to `/admin/login/?next=/admin/`
- Enter wrong credentials → error shown, no redirect
- Enter correct credentials → redirected to OTP challenge page (not the dashboard)
