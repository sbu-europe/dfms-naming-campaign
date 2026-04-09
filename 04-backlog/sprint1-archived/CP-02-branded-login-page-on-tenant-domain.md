---
task_id: CP-02
title: Branded Login Page Served on the Client's Domain
epic: Client Portal
sprint: Sprint 1 — Infrastructure, Onboarding & Secure Login
type: Story
priority: Critical
status: Done
story_points: 2
assignee: ~
---

# CP-02 — Branded Login Page Served on the Client's Domain

## User Story

**As a** Tenant Admin or Tenant User  
**I want** to log in at my organisation's own URL (e.g., `nourish.dfms.app/login/`)  
**So that** the login experience is specific to my organisation and not a generic platform page

## Description

Every tenant should have a dedicated login URL under their subdomain. The login page is served by the same Django application but the tenant middleware resolves the correct schema from the subdomain, scoping all authentication to that tenant's data only. The login URL in the welcome email should include the email as a query parameter so the email field is pre-populated.

## Acceptance Criteria

- [ ] `<tenant>.dfms.app/login/` returns the tenant-scoped branded login page
- [ ] Email field is pre-populated when `?email=<addr>` query param is present in the URL
- [ ] Attempting to log in on another tenant's subdomain fails (user not found in that schema)
- [ ] Login page title / header reflects the tenant's organisation name
- [ ] Login errors ("invalid credentials", "account suspended") are shown inline, not as a redirect

## Sub-tasks

| # | Sub-task | Status |
|---|----------|--------|
| CP-02-1 | In `login_page` view: extract `pre_email = request.GET.get('email', '')` and pass to template context | Done |
| CP-02-2 | In `templates/auth/login.html`: bind `value="{{ pre_email }}"` on the email input field | Done |
| CP-02-3 | In `login_page` POST handler: call `authenticate(request, email=email, password=password)` — `TenantMainMiddleware` already scopes this to the correct schema | Done |
| CP-02-4 | On successful authentication: call `login(request, user)` and `redirect('/dashboard/')` | Done |
| CP-02-5 | On failed authentication: re-render the form with `error = "Invalid email or password"` in context | Done |
| CP-02-6 | Handle suspended account: if `tenant.status == 'suspended'` return error message "Your organisation account has been suspended" | Done |
| CP-02-7 | Update welcome email template to append `?email=<admin_email>` to the login URL | Done |

## Technical Details

- `TenantMainMiddleware` sets `connection.schema_name` before the view runs — authentication queries automatically target the correct tenant's `users` table
- Pre-populated email is read-only in the template: `<input type="email" value="{{ pre_email }}" />`
- The welcome email template (`templates/email/tenant_welcome.html`) includes the login URL with `?email=<admin_email>` appended

## Definition of Done

- Welcome email link opens login page with email pre-filled
- Logging in on the correct tenant subdomain grants access
- Logging in with a valid user from a different tenant returns "Invalid credentials"
