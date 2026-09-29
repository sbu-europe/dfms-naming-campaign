---
jira_key: DFS-015
jira_type: Story
jira_epic: DFS-012
jira_sprint: "Sprint 1"
task_id: CP-04
title: Account Activation Flow for New Users via Invitation Link
epic: Client Portal
status: In Progress
completion: ~70%
story_points: 5
assignee: ~
related_stories:
  - US-005-user-invitation-activation.md
sub_tasks:
  - id: DFS-015-11
    title: Add "Resend Invitation" action on user management list page
    status: Pending
  - id: DFS-015-12
    title: Implement bulk CSV invitation endpoint
    status: Pending
  - id: DFS-015-13
    title: "FB-001: Lock email field on activation page (read-only + server-side validation)"
    status: Open
feedback_file: ../04-feedback/CP-04-feedback.md
---

# CP-04 — Account Activation Flow for New Users via Invitation Link

## User Story

**As a** Tenant Admin  
**I want** to invite new users to my organisation by entering their email and assigning a role  
**So that** they receive an activation link and can set their own password to get started

## Description

After the Tenant Admin has logged in, they need to onboard team members. Each invited user receives an email with a unique activation link. Clicking the link takes them to a page where they set their password and activate their account. The invitation expires after 7 days.

## Acceptance Criteria

### Done
- [x] Tenant Admin can invite a user by providing: full name, email address, role
- [x] System validates email uniqueness within the tenant schema
- [x] System generates a unique, signed activation token (UUID, stored in Redis with 7-day TTL)
- [x] Invitation email is sent via Celery with the activation link
- [x] Activation link opens a page where the user sets their password
- [x] On activation, user's `status` is set to `active` and session/token is created
- [x] Expired or already-used tokens show a clear error message

### Pending
- [ ] Bulk user invitation via CSV file upload
- [ ] Resend invitation (generates a new token, resets 7-day window)

### From Demo Feedback ([FB-001](../04-feedback/CP-04-feedback.md))
- [ ] Email field on the activation page is displayed as read-only (non-editable)
- [ ] Server validates email against the token record, not the submitted form value
- [ ] Attempting to submit a modified email returns a 400 error

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| CP-04-1 | Create `UserInvitation` model in `apps/users/models.py` — fields: `token` (UUID), `email`, `role` FK, `invited_by` FK, `expires_at`, `used_at` (nullable), `status` (pending/activated/expired) | DFS-015-1 | Done |
| CP-04-2 | Create and run migration for `UserInvitation` model | DFS-015-2 | Done |
| CP-04-3 | Implement `InvitationService.invite_user()` in `apps/users/services.py` — validate email uniqueness, check subscription user limit, create `User` (status=pending), generate UUID token, store in Redis with 7-day TTL | DFS-015-3 | Done |
| CP-04-4 | Create invitation API endpoint `POST /api/users/invite/` in `apps/users/views.py` — restricted to Tenant Admin role; calls `InvitationService.invite_user()` | DFS-015-4 | Done |
| CP-04-5 | Dispatch `send_invitation_email.delay(user_id, token, schema_name)` at end of `invite_user()` | DFS-015-5 | Done |
| CP-04-6 | Implement `send_invitation_email` Celery task in `apps/notifications/tasks.py` — wraps user lookup in `schema_context(schema_name)` | DFS-015-6 | Done |
| CP-04-7 | Create invitation email template `templates/email/user_invitation.html` — include org name, inviter name, activation link, expiry date | DFS-015-7 | Done |
| CP-04-8 | Create activation page view — `GET /activate/?token=<token>`: validate token from Redis; if valid render set-password form; if expired/used render error page | DFS-015-8 | Done |
| CP-04-9 | Create activation API endpoint `POST /api/users/activate/` — validate token, hash and set password, set `user.status = active`, mark token used, return JWT tokens | DFS-015-9 | Done |
| CP-04-10 | Handle edge cases: expired token → "Link expired" error; already-used token → "Account already activated" error | DFS-015-10 | Done |
| CP-04-11 | Add "Resend Invitation" action on the user management list page — regenerates token, resets 7-day TTL, resends email | DFS-015-11 | **Pending** |
| CP-04-12 | Implement bulk CSV invitation endpoint `POST /api/users/invite/bulk/` — parse CSV, validate rows, create invitations in batch, return per-row success/failure report | DFS-015-12 | **Pending** |

## Technical Details

### Invitation Token Flow

```
POST /api/users/invite/   { email, full_name, role_id }
  → Create User record (status=pending)
  → Generate UUID token
  → Store token in Redis: invitation:<token> → user_id, expires 7 days
  → Dispatch send_invitation_email.delay(user_id, token, schema_name)

GET /activate/?token=<token>
  → Validate token exists in Redis and not expired
  → Render set-password form

POST /api/users/activate/   { token, password, confirm_password }
  → Validate token
  → Set user.password_hash
  → Set user.status = active
  → Delete token from Redis
  → Return JWT tokens (log user in directly)
```

### Business Rules

- Token is single-use — deleted from Redis on successful activation
- Token expires after 7 days (Redis TTL)
- Role assignment is validated against tenant's subscription plan limits
- Email must be unique within the tenant schema

## Definition of Done

- Tenant Admin sends invitation → user receives email → clicks link → sets password → lands on dashboard with correct role
- Expired link shows "Link expired, contact your admin" message
- Already-used link shows "Account already activated" message
