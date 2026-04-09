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
**I want to** invite users (with first and last name) to join the organization, have the invitation email sent immediately upon creation, and ensure that only valid operational roles (not Super Admin) can be assigned during invitation  
**So that** secure and controlled user onboarding is enforced from the moment an invitation is created

## Business Context

Organizations need to onboard multiple users with different roles. All users — including Drivers and Helpers — are invited via **email only** in Phase 1. The invitation and activation workflow ensures secure user onboarding, proper role assignment, email-based activation, and controlled access. Critical for multi-tenant security.

## Status: In Progress (~70% complete)

### Completed
- [x] Single user invitation via email (all roles including Driver/Helper)
- [x] Invitation email with activation link
- [x] Email OTP verification before activation (when OTP type = Email)
- [x] Role assignment during invitation
- [x] Unique email per tenant enforcement

### Pending
- [ ] Bulk user invitation via CSV
- [ ] Resend invitation endpoint (platform admin)
- [ ] Invitation expiry cleanup task (Celery beat job)

## Acceptance Criteria

### AC-1: Single User Invitation
- [ ] Admin invites user via **email** with **First Name** + **Last Name** and role assignment (applies to all roles including Driver and Helper)
- [ ] **Invitation email dispatched immediately** upon form submission (synchronous within the creation request)
- [ ] `invitation_status` set to `sent` upon email dispatch
- [ ] **Super Admin role cannot be assigned** — system rejects with HTTP 403 (`ROLE-403-SUPER-ADMIN-RESTRICTED`) and Super Admin is hidden from the role dropdown
- [ ] OTP verification behavior driven by OTP type selected (**None / Email** — no SMS in Phase 1)
- [ ] Role permissions validated against tenant plan limits

### AC-2: Invitation Management
- [ ] Resend invitation (with 2-minute cooldown period)
- [ ] Invitation expires after 7 days
- [ ] `invitation_status` lifecycle: `sent` → `pending` → `activated` | `expired` | `cancelled`
- [ ] Admin can cancel (previously "revoke") pending invitations

### AC-3: Bulk Invitation (Pending)
- [ ] CSV upload for bulk user invitations (columns: Employee ID, Email, First Name, Last Name, Role, Department, POI, Functional Role Type)
- [ ] Per-row validation with error report (failed rows with reason)
- [ ] Bulk invitation audit logged

### AC-4: Account Activation
- [ ] User sets password on activation
- [ ] Password complexity rules enforced
- [ ] Account active immediately after OTP verification (if required) + password set + T&C acceptance

### AC-5: Audit Trail
- [ ] All invitation actions logged: inviter, invitee, role, timestamp, invitation_status

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| TUM-01-1 | Single invitation API (POST /invitations) + email dispatch | DFS-024-1 | Done |
| TUM-01-2 | Invitation token generation (secure, time-limited) | DFS-024-2 | Done |
| TUM-01-3 | Activation page — email OTP verify (if OTP type=Email) + password set | DFS-024-3 | Done |
| TUM-01-4 | Role assignment + tenant plan limit validation | DFS-024-4 | Done |
| TUM-01-5 | Invitation list UI (pending, activated, expired, revoked statuses) | DFS-024-5 | Done |
| TUM-01-6 | Resend invitation API with cooldown | DFS-024-6 | Pending |
| TUM-01-7 | Invitation expiry Celery beat task | DFS-024-7 | Pending |
| TUM-01-8 | Bulk invitation CSV upload + row-level error reporting | DFS-024-8 | Pending |

## API Endpoints

```
POST   /api/v1/tenants/{tenant_id}/users/invitations           # Create invitation + immediately dispatch email
GET    /api/v1/tenants/{tenant_id}/users/invitations?status=   # List invitations (filter by invitation_status)
POST   /api/v1/users/invitations/{token}/activate              # Activate account
POST   /api/v1/users/invitations/{token}/resend                # Resend invitation (2-min cooldown)
DELETE /api/v1/users/invitations/{id}                          # Cancel invitation
POST   /api/v1/tenants/{tenant_id}/users/invitations/bulk      # Bulk CSV invitation
```

**Key Constraints**:
- `POST` invitation: `first_name` + `last_name` are required; `full_name` is removed
- `POST` invitation: `email` is the only invitation channel — no mobile/SMS flow in Phase 1
- `POST` invitation: `otp_type` accepts `none` or `email` only — SMS option removed in Phase 1
- `POST` invitation: `role_ids` containing Super Admin role returns HTTP 403 `ROLE-403-SUPER-ADMIN-RESTRICTED`
- `POST` invitation: Response includes `invitation_status: "sent"` confirming email dispatch

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
