---
jira_key: DFS-024
jira_type: Story
jira_epic: DFS-029
jira_sprint: "Sprint 2"
story_id: US-005
title: User Invitation & Activation
epic: Tenant User Management
status: In Progress
story_points: 5
completion: ~70%
assignee: ~
spec_file: ../../../../stories/US-005-user-invitation-activation.md
---

# TUM-01 — User Invitation & Activation

## User Story

**As a** Tenant Admin  
**I want to** invite users to join the organization and activate their accounts  
**So that** they can access the system with appropriate roles and permissions

## Business Context

Organizations need to onboard multiple users with different roles. The invitation and activation workflow ensures secure user onboarding, proper role assignment, email/mobile verification, and controlled access. Critical for multi-tenant security.

## Status: In Progress (~70% complete)

### Completed
- [x] Single user invitation via email
- [x] Invitation email with activation link
- [x] Email + mobile OTP verification before activation
- [x] Role assignment during invitation
- [x] Unique email per tenant enforcement

### Pending
- [ ] Bulk user invitation via CSV
- [ ] Resend invitation endpoint (platform admin)
- [ ] Invitation expiry cleanup task (Celery beat job)

## Acceptance Criteria

### AC-1: Single User Invitation
- [ ] Admin invites user via email with role assignment
- [ ] Invitation email sent with tokenized activation link
- [ ] Email + mobile OTP verification required before account activation
- [ ] Role permissions validated against tenant plan limits

### AC-2: Invitation Management
- [ ] Resend invitation (with cooldown period)
- [ ] Invitation expires after 48 hours
- [ ] Invited user status: Pending / Activated / Expired / Revoked
- [ ] Admin can revoke pending invitations

### AC-3: Bulk Invitation (Pending)
- [ ] CSV upload for bulk user invitations
- [ ] Per-row validation with error report (failed rows with reason)
- [ ] Bulk invitation audit logged

### AC-4: Account Activation
- [ ] User sets password on activation
- [ ] Password complexity rules enforced
- [ ] Account active immediately after successful OTP verification + password set

### AC-5: Audit Trail
- [ ] All invitation actions logged: inviter, invitee, role, timestamp, status

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| TUM-01-1 | Single invitation API (POST /invitations) + email dispatch | DFS-024-1 | Done |
| TUM-01-2 | Invitation token generation (secure, time-limited) | DFS-024-2 | Done |
| TUM-01-3 | Activation page — OTP verify (email + mobile) + password set | DFS-024-3 | Done |
| TUM-01-4 | Role assignment + tenant plan limit validation | DFS-024-4 | Done |
| TUM-01-5 | Invitation list UI (pending, activated, expired, revoked statuses) | DFS-024-5 | Done |
| TUM-01-6 | Resend invitation API with cooldown | DFS-024-6 | Pending |
| TUM-01-7 | Invitation expiry Celery beat task | DFS-024-7 | Pending |
| TUM-01-8 | Bulk invitation CSV upload + row-level error reporting | DFS-024-8 | Pending |
| TUM-01-9 | Unit & Integration Testing | DFS-024-8 | Pending |

## API Endpoints

```
POST   /api/v1/invitations                          # Send invitation
GET    /api/v1/invitations?status=Pending           # List invitations
POST   /api/v1/invitations/{token}/activate         # Activate account
POST   /api/v1/invitations/{id}/resend              # Resend invitation
DELETE /api/v1/invitations/{id}                     # Revoke invitation
POST   /api/v1/invitations/bulk                     # Bulk CSV invitation
```

## Dependencies

- **Requires**: US-004 Role Hierarchy (RBAC), US-006 OTP Verification (TUM-02)
- **Enables**: All user-dependent workflows (TO, TR, trip assignment)

## Definition of Done

- [ ] Single invitation flow end-to-end working
- [ ] Resend with cooldown implemented
- [ ] Invitation expiry cleanup task running
- [ ] Bulk CSV invitation functional
- [ ] All invitation actions audit logged
- [ ] Unit tests > 80%
- [ ] UAT: Tenant Admin can invite and activate 5+ users
