---
jira_key: DFS-027
jira_type: Story
jira_epic: DFS-029
jira_sprint: "Sprint 2"
story_id: US-008
title: Password & Account Reset
epic: Tenant User Management
status: Pending
story_points: 5
assignee: ~
spec_file: ../../../../stories/US-008-password-account-reset.md
---

# TUM-04 — Password & Account Reset

## User Story

**As an** Admin User  
**I want to** reset my password securely  
**So that** I can regain access to my account

## Business Context

Password reset is essential for users who forget passwords, security incidents, and account recovery. Must support both self-service and admin-assisted reset to accommodate all user types including those with low digital literacy.

## Acceptance Criteria

### AC-1: Self-Service Password Reset
- [ ] "Forgot Password" link on login page
- [ ] Reset link via email (valid 15 minutes) + OTP via SMS
- [ ] OTP verification required before allowing password change
- [ ] Password complexity: min 8 chars, uppercase + lowercase + number + special char
- [ ] Cannot reuse last 3 passwords
- [ ] All active sessions terminated on password reset
- [ ] Confirmation email after successful reset

### AC-2: Admin-Assisted Password Reset
- [ ] Super Admin and Tenant Admin can trigger assisted reset
- [ ] Admin must verify user identity offline
- [ ] System generates 6-digit OTP (valid 10 minutes)
- [ ] Admin provides justification remarks (mandatory)
- [ ] All assisted resets logged with Admin ID + User ID + Timestamp + Justification

### AC-3: Rate Limiting & Security
- [ ] Max 3 reset requests per hour per user
- [ ] Block reset requests after rate limit exceeded
- [ ] Reset tokens cryptographically secure and unique
- [ ] Password strength meter displayed on reset form

### AC-4: Reset Logging
- [ ] All reset attempts logged: User ID, Method (admin/self-service), Timestamp, IP, Device, Status, Failure Reason

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| TUM-04-1 | Self-service reset API — request link/OTP, verify OTP, set new password | DFS-027-1 | Pending |
| TUM-04-2 | Reset token generation (cryptographically secure, 15-min expiry) | DFS-027-2 | Pending |
| TUM-04-3 | Password complexity validation + reuse check (last 3 passwords) | DFS-027-3 | Pending |
| TUM-04-4 | Session termination on successful password reset | DFS-027-4 | Pending |
| TUM-04-5 | Admin-assisted reset API — generate OTP, require justification, log | DFS-027-5 | Pending |
| TUM-04-6 | Rate limiting (max 3/hour/user) | DFS-027-6 | Pending |
| TUM-04-7 | Password reset audit logging | DFS-027-7 | Pending |
| TUM-04-8 | Forgot Password page + Reset Password page UI with strength meter | DFS-027-8 | Pending |
| TUM-04-9 | Admin-assisted reset form UI | DFS-027-9 | Pending |

## API Endpoints

```
POST  /api/v1/auth/password/reset/request          # Self-service: send reset link/OTP
POST  /api/v1/auth/password/reset/verify           # Verify OTP
POST  /api/v1/auth/password/reset                  # Set new password
POST  /api/v1/admin/users/{user_id}/password/reset # Admin-assisted reset
GET   /api/v1/admin/password-reset/logs            # Reset audit logs
```

## Dependencies

- **Requires**: TUM-02 OTP Verification System, Email service, SMS gateway
- **Enables**: Full account recovery workflow

## Definition of Done

- [ ] Self-service reset (link + OTP + new password) end-to-end working
- [ ] Admin-assisted reset with OTP + justification logging
- [ ] Password complexity and reuse check
- [ ] Session termination on reset
- [ ] Rate limiting implemented
- [ ] All resets audit logged
- [ ] Unit tests > 80%
- [ ] UAT approved
