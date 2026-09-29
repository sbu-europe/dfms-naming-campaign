---
jira_key: DFS-026
jira_type: Story
jira_epic: DFS-029
jira_sprint: "Sprint 2"
story_id: US-007
title: Account Deactivation & Reactivation
epic: Tenant User Management
status: Pending
story_points: 5
assignee: ~
spec_file: US-007-account-deactivation.md
---

# TUM-03 — Account Deactivation & Reactivation

## User Story

**As an** Admin  
**I want to** deactivate user accounts  
**So that** I can maintain system security and control access

## Business Context

Account deactivation is essential for security incidents requiring immediate access revocation, employee termination, role changes, temporary suspension, and compliance/audit requirements. System must support both temporary suspension and permanent deactivation while preserving historical data.

## Acceptance Criteria

### AC-1: Deactivation Types
- [ ] **Temporary Suspension**: Account inactive, data preserved, reactivatable
- [ ] **Permanent Deactivation**: Account permanently disabled, data archived

### AC-2: Deactivation Process
- [ ] Mandatory fields: Deactivation type, Reason (dropdown + custom), Effective date (default: immediate), Admin remarks
- [ ] Immediately logout user from all active sessions and block new logins
- [ ] Warning if user has active critical assignments (TO, trips, pending approvals)
- [ ] Admin can override with mandatory justification remarks
- [ ] Email notification to user upon deactivation

### AC-3: Deactivation Logging
- [ ] Log: User ID, Admin ID, Timestamp, Type, Reason, Admin Remarks, Effective Date, IP
- [ ] Preserve historical audit records for deactivated users
- [ ] Logs exportable for compliance

### AC-4: Assignment Prevention
- [ ] Deactivated users cannot: receive new TOs, be assigned to trips/vehicles, receive approvals/tasks
- [ ] Excluded from all user selection dropdowns

### AC-5: Reactivation
- [ ] Temporary suspensions only can be reactivated (not permanent)
- [ ] Requires admin approval with reactivation reason
- [ ] User notified upon reactivation
- [ ] All reactivation actions logged

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| TUM-03-1 | Deactivation API (POST /{user_id}/deactivate) — type, reason, effective date | DFS-026-1 | Pending |
| TUM-03-2 | Session termination on deactivation — invalidate all active tokens | DFS-026-2 | Pending |
| TUM-03-3 | Active assignment dependency check before deactivation | DFS-026-3 | Pending |
| TUM-03-4 | Deactivation audit log (immutable) | DFS-026-4 | Pending |
| TUM-03-5 | Email notification on deactivation and reactivation | DFS-026-5 | Pending |
| TUM-03-6 | Reactivation API (POST /{user_id}/reactivate) with admin approval | DFS-026-6 | Pending |
| TUM-03-7 | Assignment gate — filter deactivated users from all workflow dropdowns | DFS-026-7 | Pending |
| TUM-03-8 | Deactivation history view UI (list, filters, Reactivate action) | DFS-026-8 | Pending |

## API Endpoints

```
POST  /api/v1/admin/users/{user_id}/deactivate
POST  /api/v1/admin/users/{user_id}/reactivate
GET   /api/v1/admin/users/{user_id}/deactivation-history
GET   /api/v1/admin/users/deactivations?status=&type=&date_from=&date_to=
```

## Dependencies

- **Requires**: US-004 Role Hierarchy (RBAC), US-003 Session Control (Sprint 1)
- **Used By**: All workflows that check user active status before assignment

## Definition of Done

- [ ] Deactivation types (temporary/permanent) implemented
- [ ] Session termination on deactivation
- [ ] Active assignment check and override with justification
- [ ] Reactivation workflow with admin approval
- [ ] Deactivation logging (immutable)
- [ ] Email notifications working
- [ ] Assignment gate in all dependent workflows
- [ ] Unit tests > 80%
- [ ] UAT approved
