---
title: Account Deactivation
story_id: US-007
phase: phase-1
module: User & Tenant Management
priority: Critical
status: Pending
epic: Security & User Management
epic_id: EPIC-002
epic_name: User & Tenant Foundation
sprint: Sprint 2
story_points: 5
created: 2026-02-13
updated: 2026-02-13
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-005-user-invitation-activation.md
dependencies: []
tags: [user-management, deactivation, security, critical]
---

# US-007: Account Deactivation

## User Story

**As an** Admin  
**I want to** deactivate user accounts  
**So that** I can maintain system security and control access

## Business Context

Account deactivation is essential for:
- Security incidents requiring immediate access revocation
- Employee termination or role changes
- Temporary access suspension
- Compliance and audit requirements

The system must support both temporary suspension and permanent deactivation while preserving historical data for audit purposes.

## Acceptance Criteria

### Must Have (Critical)
- [ ] System SHALL support two deactivation options:
  - Temporary Suspension: Inactive, preserve data, reactivatable
  - Permanent: Disabled permanently, data archived
- [ ] System SHALL require mandatory fields: Reason, effective date, admin remarks
- [ ] System SHALL immediately logout user from all active sessions
- [ ] System SHALL preserve historical data in audit trail
- [ ] System SHALL log deactivation with full details (timestamp, admin ID, reason)
- [ ] System SHALL allow temporary accounts to be reactivated with approval
- [ ] System SHALL send email notification to user upon deactivation
- [ ] System SHALL prevent deactivated users from receiving new assignments

### Should Have (High)
- [ ] System SHOULD prevent deactivation if user has active critical assignments
- [ ] System SHOULD support bulk deactivation with validation
- [ ] System SHOULD allow admin to view deactivation history

### Nice to Have (Medium)
- [ ] System MAY support scheduled deactivation (future date)
- [ ] System MAY provide deactivation impact analysis before confirmation

## Functional Requirements

### FR-068-001: Deactivation Types
- [Critical] System SHALL support two deactivation types:
  - **Temporary Suspension**: Account inactive, data preserved, can be reactivated
  - **Permanent Deactivation**: Account disabled permanently, data archived
- [Critical] System SHALL require selection of deactivation type
- [High] System SHALL display impact differences between types

### FR-068-002: Deactivation Process
- [Critical] System SHALL require mandatory fields:
  - Reason (dropdown or text)
  - Effective date (default: immediate)
  - Admin remarks (text area)
- [Critical] System SHALL validate user has permission to deactivate
- [Critical] System SHALL check for active critical assignments before deactivation
- [Critical] System SHALL immediately logout user from all sessions
- [Critical] System SHALL block user from new logins
- [High] System SHALL show warning if user has active assignments
- [High] System SHALL allow deactivation with override if needed

### FR-068-003: Deactivation Logging
- [Critical] System SHALL log deactivation with:
  - User ID
  - Admin ID (who performed deactivation)
  - Timestamp
  - Deactivation type (temporary/permanent)
  - Reason
  - Admin remarks
  - Effective date
  - IP address
- [Critical] System SHALL preserve historical audit records for deactivated users
- [High] System SHALL make deactivation logs exportable

### FR-068-004: User Notification
- [Critical] System SHALL send email notification to user upon deactivation
- [Critical] Email SHALL include:
  - Deactivation type
  - Effective date
  - Reason (if appropriate)
  - Contact information for reactivation (if temporary)
- [High] System SHALL send notification to admin who performed deactivation

### FR-068-005: Reactivation
- [Critical] System SHALL allow reactivation of temporarily suspended accounts
- [Critical] System SHALL require admin approval for reactivation
- [Critical] System SHALL log reactivation with timestamp and admin ID
- [Critical] System SHALL restore user access upon reactivation
- [High] System SHALL send notification to user upon reactivation

### FR-068-006: Assignment Prevention
- [Critical] System SHALL prevent deactivated users from:
  - Receiving new Transport Orders (TO)
  - Being assigned to trips
  - Being assigned to vehicles
  - Receiving new tasks or approvals
- [Critical] System SHALL exclude deactivated users from user selection dropdowns
- [High] System SHALL show warning when attempting to assign to deactivated user

## Business Rules

### BR-068-001: Deactivation Types
- Temporary suspension preserves all data and allows reactivation
- Permanent deactivation archives data and cannot be reactivated
- Deactivation type cannot be changed after confirmation

### BR-068-002: Active Assignments
- System checks for active critical assignments before deactivation:
  - Active Transport Orders (TO)
  - Active trips
  - Pending approvals
  - Active QC inspections
- Admin can override with mandatory remarks
- Override must be logged with justification

### BR-068-003: Session Management
- All active sessions terminated immediately upon deactivation
- User cannot login after deactivation
- Session tokens invalidated

### BR-068-004: Data Preservation
- Historical data preserved in audit trail
- Deactivated users remain in historical records
- Cannot delete user records with historical data

### BR-068-005: Reactivation
- Only temporary suspensions can be reactivated
- Reactivation requires admin approval
- User must be notified upon reactivation

## Data Model

### User Deactivation Entity
```yaml
UserDeactivation:
  deactivation_id: string (unique)
  user_id: string (FK)
  deactivation_type: string (temporary|permanent)
  reason: string
  admin_remarks: string
  effective_date: datetime
  deactivated_by: string (FK - admin user_id)
  deactivated_at: datetime
  ip_address: string
  reactivated_at: datetime (optional)
  reactivated_by: string (FK, optional)
```

### User Status Entity
```yaml
UserStatus:
  user_id: string (FK)
  status: string (active|suspended|deactivated)
  status_changed_at: datetime
  status_changed_by: string (FK)
  previous_status: string
```

## UI/UX Requirements

### Deactivation Form
- User selection/search
- Deactivation type selection (radio buttons)
- Reason dropdown with common reasons + custom option
- Effective date picker (default: immediate)
- Admin remarks textarea (mandatory)
- Active assignments warning (if applicable)
- "Deactivate" button with confirmation dialog

### Deactivation Confirmation Dialog
- Display user name and email
- Show deactivation type
- List active assignments (if any)
- Require confirmation checkbox
- "Confirm Deactivation" button

### Deactivation History View
- List of all deactivations with filters
- Columns: User, Type, Reason, Date, Admin, Status
- Actions: View Details, Reactivate (if temporary)

## API Endpoints

### POST /api/v1/admin/users/{user_id}/deactivate
- Deactivate user account
- Request body: deactivation_type, reason, admin_remarks, effective_date
- Response: deactivation_id, success message

### POST /api/v1/admin/users/{user_id}/reactivate
- Reactivate temporarily suspended account
- Request body: reactivation_reason
- Response: success message

### GET /api/v1/admin/users/{user_id}/deactivation-history
- Get deactivation history for user
- Response: array of deactivation records

### GET /api/v1/admin/users/deactivations
- List all deactivations
- Query params: status, type, date_from, date_to
- Response: array of deactivation records

## Non-Functional Requirements

- **Performance**: Deactivation must complete within 2 seconds
- **Security**: Only Admin roles can deactivate users
- **Audit**: All deactivation actions must be logged
- **Availability**: Deactivation service must be 99.9% available

## Testing Scenarios

### TC-068-001: Temporary Deactivation
1. Admin selects user for temporary suspension
2. Admin provides reason and remarks
3. Verify user logged out from all sessions
4. Verify user cannot login
5. Verify deactivation logged
6. Verify email notification sent

### TC-068-002: Permanent Deactivation
1. Admin selects user for permanent deactivation
2. Admin provides reason and remarks
3. Verify user logged out
4. Verify user cannot login
5. Verify data archived
6. Verify reactivation not possible

### TC-068-003: Active Assignment Check
1. User has active TO assignment
2. Admin attempts deactivation
3. Verify warning displayed
4. Admin overrides with remarks
5. Verify deactivation proceeds
6. Verify override logged

### TC-068-004: Reactivation
1. User temporarily suspended
2. Admin reactivates account
3. Verify user can login
4. Verify reactivation logged
5. Verify notification sent

## Dependencies

- **US-007**: User and Role Management (user must exist)
- **Session Management**: For session termination
- **Email Service**: For notifications

## Definition of Done

- [ ] Deactivation types implemented (temporary/permanent)
- [ ] Deactivation form implemented
- [ ] Active assignment check implemented
- [ ] Session termination implemented
- [ ] Deactivation logging implemented
- [ ] Email notifications implemented
- [ ] Reactivation workflow implemented
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing
- [ ] Documentation updated
- [ ] Code reviewed and approved

---

**Source Documents**:
- PRD Section 6.2.5: Account Deactivation

**Last Updated**: February 13, 2026  
**Status**: Pending Review
