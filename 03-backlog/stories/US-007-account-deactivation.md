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
sprint: Sprint 3
story_points: 5
created: 2026-02-13
updated: 2026-04-07
source_documents:
  - ../../../../01-source/01-prd/PRD_DFMS_v1.0.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-005-user-invitation-activation.md
dependencies: []
tags: [user-management, deactivation, reactivation, suspension, security, audit, critical]
---

# US-007: Account Deactivation

## User Story

**As an** Admin (Platform Super Admin, Tenant Super Admin)  
**I want to** deactivate user accounts  
**So that** I can maintain system security and control access when users leave the organization, change roles, or pose a security risk

## Business Context

Account deactivation is essential for:
- Security incidents requiring immediate access revocation
- Employee termination or role changes
- Temporary access suspension
- Compliance and audit requirements

The system must support both temporary suspension and permanent deactivation while preserving historical data for audit purposes.

## Acceptance Criteria

### AC-1: Deactivation Process

Given an Admin initiates deactivation for a user,

when the Admin selects either **Temporary Suspension** (Inactive, preserve data, reactivatable) or **Permanent Deactivation** (Disabled permanently, data archived) and provides mandatory details (Reason, Effective Date, Admin Remarks),

then the system shall:

- [ ] Immediately log the user out from all active sessions
- [ ] Preserve historical data in the audit trail
- [ ] Record the deactivation with full details (user, type, reason, date, admin, IP address)
- [ ] Block deactivated users from receiving new assignments
- [ ] Allow temporary suspension accounts to be reactivated upon approval
- [ ] Send an email notification to the user regarding deactivation
- [ ] Prevent deactivation if user has active critical assignments (with override option)
- [ ] Support bulk deactivation with validation
- [ ] Allow admin to view deactivation history

**Test Scenarios (AC-1):**

```gherkin
Scenario: AC-1.1 - Temporary suspension of user account
  Given an Admin with "UserMgmt.User.Deactivate" permission
  And a user "john.doe" with status "Active"
  When the Admin selects "Temporary Suspension"
  And provides reason "Leave of absence", effective date "Immediate", and remarks "Employee on 3-month leave"
  And clicks "Deactivate"
  Then the system terminates all active sessions for "john.doe"
  And sets user status to "Suspended"
  And logs the deactivation with Admin ID, timestamp, reason, and IP address
  And sends a deactivation email to "john.doe" with reactivation contact information
  And blocks "john.doe" from new logins

Scenario: AC-1.2 - Permanent deactivation of user account
  Given an Admin with "UserMgmt.User.Deactivate" permission
  And a user "jane.doe" with status "Active"
  When the Admin selects "Permanent Deactivation"
  And provides reason "Employee terminated", effective date "Immediate", and remarks "End of contract"
  And clicks "Deactivate" and confirms
  Then the system terminates all active sessions for "jane.doe"
  And sets user status to "Inactive"
  And archives user data
  And logs the deactivation with full details
  And sends a deactivation email to "jane.doe" (without reactivation info)
  And the account cannot be reactivated

Scenario: AC-1.3 - Deactivation blocked by active critical assignments
  Given a user "driver.ahmed" has an active Transport Order TO-2026-0451
  And "driver.ahmed" has an active trip assignment
  When the Admin attempts to deactivate "driver.ahmed"
  Then the system displays a warning listing active assignments:
    | Assignment Type | ID | Status |
    | Transport Order | TO-2026-0451 | In Progress |
    | Trip | TRIP-2026-0892 | Active |
  And the "Deactivate" button is disabled until admin checks "Override active assignments"

Scenario: AC-1.4 - Deactivation with active assignment override
  Given a user "driver.ahmed" has active assignments
  And the Admin has reviewed the warning
  When the Admin checks "Override active assignments"
  And provides override remarks "Urgent security incident - reassignment in progress"
  And clicks "Deactivate"
  Then the system proceeds with deactivation
  And logs the override with justification remarks
  And the active assignments remain in their current state (not auto-cancelled)

Scenario: AC-1.5 - Bulk deactivation
  Given an Admin selects 5 users for deactivation
  When the Admin selects "Temporary Suspension" for all
  And provides a shared reason "Department restructuring" and remarks
  Then the system validates each user individually
  And reports success/failure per user
  And sends individual deactivation emails to each user
  And logs each deactivation separately

Scenario: AC-1.6 - Deactivation with future effective date
  Given an Admin initiates deactivation for "user.ali"
  When the Admin sets effective date to "2026-04-15" (8 days from now)
  Then the system schedules the deactivation
  And "user.ali" retains access until "2026-04-15"
  And the system executes deactivation automatically on the effective date
  And sends a notification email to "user.ali" about upcoming deactivation

Scenario: AC-1.7 - Admin without permission attempts deactivation
  Given a user with role "Depot Officer" (no deactivation permission)
  When the user attempts to access the deactivation form
  Then the system returns HTTP 403 Forbidden
  And the "Deactivate" action is not visible in the UI
```

### AC-2: Reactivation Process

```gherkin
Scenario: AC-2.1 - Reactivate temporarily suspended account
  Given a user "john.doe" with status "Suspended" (temporary)
  And an Admin with "UserMgmt.User.Reactivate" permission
  When the Admin clicks "Reactivate" on "john.doe"'s profile
  And provides reactivation reason "Employee returned from leave"
  Then the system sets user status to "Active"
  And restores all previous role assignments
  And logs reactivation with timestamp, Admin ID, and reason
  And sends a reactivation notification email to "john.doe"
  And "john.doe" can login again

Scenario: AC-2.2 - Attempt to reactivate permanently deactivated account
  Given a user "jane.doe" with status "Inactive" (permanent)
  When the Admin attempts to reactivate "jane.doe"
  Then the system blocks the action
  And displays "Permanently deactivated accounts cannot be reactivated"
  And the "Reactivate" button is not available

Scenario: AC-2.3 - Reactivation audit trail
  Given a user "john.doe" was suspended on "2026-03-01" by Admin A
  When Admin B reactivates "john.doe" on "2026-04-07"
  Then the deactivation history shows both events:
    | Event | Date | Admin | Details |
    | Suspended | 2026-03-01 | Admin A | Leave of absence |
    | Reactivated | 2026-04-07 | Admin B | Employee returned |
```

### AC-3: Assignment Prevention

```gherkin
Scenario: AC-3.1 - Deactivated user excluded from dropdowns
  Given a user "john.doe" is in "Suspended" status
  When another admin creates a new Transport Order
  And opens the driver assignment dropdown
  Then "john.doe" does NOT appear in the dropdown
  And only "Active" users are listed

Scenario: AC-3.2 - Attempt to assign deactivated user via API
  Given a user "john.doe" is in "Suspended" status
  When a system process attempts to assign "john.doe" to a trip via API
  Then the system returns HTTP 400 with message "Cannot assign to deactivated user"
  And the assignment is not created

Scenario: AC-3.3 - Warning when referencing deactivated user
  Given a user "john.doe" was recently deactivated
  When an admin views a historical trip that included "john.doe"
  Then the system displays "john.doe" with a "Deactivated" badge
  And historical records remain intact
```

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

### POST /api/v1/admin/users/bulk-deactivate
- Bulk deactivate multiple user accounts
- Request body: user_ids[], deactivation_type, reason, admin_remarks, effective_date
- Response: { success_count, failure_count, results: [{ user_id, status, error? }] }
- Requires permission: `UserMgmt.User.Deactivate`

### GET /api/v1/admin/users/deactivations
- List all deactivations with filters
- Query params: status, type, date_from, date_to, admin_id, search
- Response: paginated array of deactivation records

### GET /api/v1/admin/users/deactivations/export
- Export deactivation logs as CSV
- Query params: status, type, date_from, date_to
- Response: CSV file download

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

### TC-068-005: Bulk Deactivation
1. Admin selects 5 users for bulk deactivation
2. Admin selects "Temporary Suspension" and provides reason
3. Verify each user validated individually
4. Verify success/failure report per user
5. Verify each user logged out and email sent

---

## Unit Tests

### UT-DA-001: Deactivation Creation & Validation
```python
def test_temporary_deactivation_success():
    admin = create_user_with_role('Tenant Admin')
    user = create_active_user(email='user@company.com')
    client.force_authenticate(admin)
    
    response = client.post(f'/api/v1/admin/users/{user.id}/deactivate', {
        'deactivation_type': 'temporary',
        'reason': 'Leave of absence',
        'admin_remarks': 'Employee on 3-month medical leave',
        'effective_date': 'immediate'
    })
    
    assert response.status_code == 200
    assert 'deactivation_id' in response.json()
    
    user.refresh_from_db()
    assert user.status == 'Suspended'

def test_permanent_deactivation_success():
    admin = create_user_with_role('Tenant Admin')
    user = create_active_user(email='terminated@company.com')
    client.force_authenticate(admin)
    
    response = client.post(f'/api/v1/admin/users/{user.id}/deactivate', {
        'deactivation_type': 'permanent',
        'reason': 'Employee terminated',
        'admin_remarks': 'End of contract effective immediately',
        'effective_date': 'immediate'
    })
    
    assert response.status_code == 200
    
    user.refresh_from_db()
    assert user.status == 'Inactive'

def test_deactivation_missing_required_fields():
    admin = create_user_with_role('Tenant Admin')
    user = create_active_user()
    client.force_authenticate(admin)
    
    response = client.post(f'/api/v1/admin/users/{user.id}/deactivate', {
        'deactivation_type': 'temporary'
        # Missing reason and admin_remarks
    })
    
    assert response.status_code == 400
    assert 'reason' in response.json()['errors']
    assert 'admin_remarks' in response.json()['errors']

def test_deactivation_without_permission():
    non_admin = create_user_with_role('Depot Officer')
    user = create_active_user()
    client.force_authenticate(non_admin)
    
    response = client.post(f'/api/v1/admin/users/{user.id}/deactivate', {
        'deactivation_type': 'temporary',
        'reason': 'Test',
        'admin_remarks': 'No permission test'
    })
    
    assert response.status_code == 403

def test_deactivation_already_deactivated_user():
    admin = create_user_with_role('Tenant Admin')
    user = create_user_with_status('Suspended')
    client.force_authenticate(admin)
    
    response = client.post(f'/api/v1/admin/users/{user.id}/deactivate', {
        'deactivation_type': 'temporary',
        'reason': 'Already suspended',
        'admin_remarks': 'Duplicate attempt'
    })
    
    assert response.status_code == 409
    assert 'already deactivated' in response.json()['message']

def test_deactivation_self_not_allowed():
    admin = create_user_with_role('Tenant Admin')
    client.force_authenticate(admin)
    
    response = client.post(f'/api/v1/admin/users/{admin.id}/deactivate', {
        'deactivation_type': 'temporary',
        'reason': 'Self deactivation',
        'admin_remarks': 'Should be blocked'
    })
    
    assert response.status_code == 400
    assert 'cannot deactivate your own account' in response.json()['message']
```

### UT-DA-002: Session Termination on Deactivation
```python
def test_all_sessions_terminated():
    admin = create_user_with_role('Tenant Admin')
    user = create_active_user()
    create_session(user=user, status='Active', device='Chrome')
    create_session(user=user, status='Active', device='Mobile')
    client.force_authenticate(admin)
    
    assert Session.objects.filter(user=user, status='Active').count() == 2
    
    client.post(f'/api/v1/admin/users/{user.id}/deactivate', {
        'deactivation_type': 'temporary',
        'reason': 'Security incident',
        'admin_remarks': 'Unauthorized access detected'
    })
    
    assert Session.objects.filter(user=user, status='Active').count() == 0
    assert Session.objects.filter(user=user, status='Revoked').count() == 2

def test_deactivated_user_cannot_login():
    user = create_active_user(email='suspended@co.com', password='Pass123!')
    perform_deactivation(user, deactivation_type='temporary')
    
    response = client.post('/api/v1/auth/login', {
        'identifier': 'suspended@co.com',
        'password': 'Pass123!'
    })
    
    assert response.status_code == 403
    assert 'Account is inactive or suspended' in response.json()['message']

def test_deactivated_user_token_rejected():
    user = create_active_user()
    token = generate_access_token(user)
    perform_deactivation(user, deactivation_type='temporary')
    
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    response = client.get('/api/v1/dashboard')
    
    assert response.status_code == 401
```

### UT-DA-003: Active Assignment Checking
```python
def test_deactivation_blocked_by_active_to():
    admin = create_user_with_role('Tenant Admin')
    user = create_active_user()
    create_transport_order(assigned_to=user, status='InProgress')
    client.force_authenticate(admin)
    
    response = client.post(f'/api/v1/admin/users/{user.id}/deactivate', {
        'deactivation_type': 'temporary',
        'reason': 'Test',
        'admin_remarks': 'Test'
    })
    
    assert response.status_code == 409
    assert response.json()['code'] == 'DA-409-ACTIVE-ASSIGNMENTS'
    assert len(response.json()['active_assignments']) == 1
    assert response.json()['active_assignments'][0]['type'] == 'TransportOrder'

def test_deactivation_blocked_by_pending_approvals():
    admin = create_user_with_role('Tenant Admin')
    user = create_active_user()
    create_approval_request(approver=user, status='Pending')
    client.force_authenticate(admin)
    
    response = client.post(f'/api/v1/admin/users/{user.id}/deactivate', {
        'deactivation_type': 'temporary',
        'reason': 'Test',
        'admin_remarks': 'Test'
    })
    
    assert response.status_code == 409
    assert any(a['type'] == 'PendingApproval' for a in response.json()['active_assignments'])

def test_deactivation_with_override():
    admin = create_user_with_role('Tenant Admin')
    user = create_active_user()
    create_transport_order(assigned_to=user, status='InProgress')
    client.force_authenticate(admin)
    
    response = client.post(f'/api/v1/admin/users/{user.id}/deactivate', {
        'deactivation_type': 'temporary',
        'reason': 'Security incident',
        'admin_remarks': 'Urgent - reassignment in progress',
        'override_active_assignments': True,
        'override_remarks': 'Critical security concern overrides active TO'
    })
    
    assert response.status_code == 200
    
    log = DeactivationLog.objects.get(user=user)
    assert log.override_used is True
    assert log.override_remarks == 'Critical security concern overrides active TO'
```

### UT-DA-004: Deactivation Logging & Audit
```python
def test_deactivation_audit_log_created():
    admin = create_user_with_role('Tenant Admin')
    user = create_active_user()
    client.force_authenticate(admin)
    
    client.post(f'/api/v1/admin/users/{user.id}/deactivate', {
        'deactivation_type': 'temporary',
        'reason': 'Leave of absence',
        'admin_remarks': 'Medical leave for 3 months',
        'effective_date': 'immediate'
    })
    
    log = UserDeactivation.objects.get(user=user)
    assert log.deactivation_type == 'temporary'
    assert log.reason == 'Leave of absence'
    assert log.admin_remarks == 'Medical leave for 3 months'
    assert log.deactivated_by == admin
    assert log.ip_address is not None
    assert log.deactivated_at is not None

def test_deactivation_notification_sent():
    admin = create_user_with_role('Tenant Admin')
    user = create_active_user(email='user@co.com')
    client.force_authenticate(admin)
    
    client.post(f'/api/v1/admin/users/{user.id}/deactivate', {
        'deactivation_type': 'temporary',
        'reason': 'Leave of absence',
        'admin_remarks': 'Test'
    })
    
    assert_email_sent_to('user@co.com', subject_contains='Account Deactivated')

def test_permanent_deactivation_no_reactivation_contact():
    admin = create_user_with_role('Tenant Admin')
    user = create_active_user(email='term@co.com')
    client.force_authenticate(admin)
    
    client.post(f'/api/v1/admin/users/{user.id}/deactivate', {
        'deactivation_type': 'permanent',
        'reason': 'Terminated',
        'admin_remarks': 'Contract ended'
    })
    
    email = get_last_email_to('term@co.com')
    assert 'reactivation' not in email.body.lower()
```

### UT-DA-005: Reactivation
```python
def test_reactivate_suspended_user():
    admin = create_user_with_role('Tenant Admin')
    user = create_user_with_status('Suspended')
    client.force_authenticate(admin)
    
    response = client.post(f'/api/v1/admin/users/{user.id}/reactivate', {
        'reactivation_reason': 'Employee returned from leave'
    })
    
    assert response.status_code == 200
    
    user.refresh_from_db()
    assert user.status == 'Active'

def test_reactivate_permanently_deactivated_blocked():
    admin = create_user_with_role('Tenant Admin')
    user = create_user_with_status('Inactive')  # Permanent
    client.force_authenticate(admin)
    
    response = client.post(f'/api/v1/admin/users/{user.id}/reactivate', {
        'reactivation_reason': 'Attempt reactivation'
    })
    
    assert response.status_code == 400
    assert 'cannot be reactivated' in response.json()['message']

def test_reactivation_restores_roles():
    admin = create_user_with_role('Tenant Admin')
    user = create_active_user()
    assign_role(user, 'Depot Officer')
    assign_role(user, 'Requester')
    perform_deactivation(user, deactivation_type='temporary')
    client.force_authenticate(admin)
    
    client.post(f'/api/v1/admin/users/{user.id}/reactivate', {
        'reactivation_reason': 'Return from leave'
    })
    
    user.refresh_from_db()
    assert user.roles.filter(name='Depot Officer').exists()
    assert user.roles.filter(name='Requester').exists()

def test_reactivation_audit_log():
    admin = create_user_with_role('Tenant Admin')
    user = create_user_with_status('Suspended')
    client.force_authenticate(admin)
    
    client.post(f'/api/v1/admin/users/{user.id}/reactivate', {
        'reactivation_reason': 'Return from leave'
    })
    
    deactivation = UserDeactivation.objects.get(user=user)
    assert deactivation.reactivated_at is not None
    assert deactivation.reactivated_by == admin

def test_reactivation_notification_sent():
    admin = create_user_with_role('Tenant Admin')
    user = create_user_with_status('Suspended', email='user@co.com')
    client.force_authenticate(admin)
    
    client.post(f'/api/v1/admin/users/{user.id}/reactivate', {
        'reactivation_reason': 'Return from leave'
    })
    
    assert_email_sent_to('user@co.com', subject_contains='Account Reactivated')
```

### UT-DA-006: Bulk Deactivation
```python
def test_bulk_deactivation_success():
    admin = create_user_with_role('Tenant Admin')
    users = [create_active_user() for _ in range(3)]
    user_ids = [u.id for u in users]
    client.force_authenticate(admin)
    
    response = client.post('/api/v1/admin/users/bulk-deactivate', {
        'user_ids': user_ids,
        'deactivation_type': 'temporary',
        'reason': 'Department restructuring',
        'admin_remarks': 'Bulk suspension pending reassignment',
        'effective_date': 'immediate'
    })
    
    assert response.status_code == 200
    assert response.json()['success_count'] == 3
    assert response.json()['failure_count'] == 0

def test_bulk_deactivation_partial_failure():
    admin = create_user_with_role('Tenant Admin')
    active_user = create_active_user()
    user_with_to = create_active_user()
    create_transport_order(assigned_to=user_with_to, status='InProgress')
    client.force_authenticate(admin)
    
    response = client.post('/api/v1/admin/users/bulk-deactivate', {
        'user_ids': [active_user.id, user_with_to.id],
        'deactivation_type': 'temporary',
        'reason': 'Restructuring',
        'admin_remarks': 'Bulk operation'
    })
    
    assert response.status_code == 200
    assert response.json()['success_count'] == 1
    assert response.json()['failure_count'] == 1
    
    failed = [r for r in response.json()['results'] if r['status'] == 'failed']
    assert failed[0]['user_id'] == str(user_with_to.id)
    assert 'active assignments' in failed[0]['error']

def test_bulk_deactivation_empty_list():
    admin = create_user_with_role('Tenant Admin')
    client.force_authenticate(admin)
    
    response = client.post('/api/v1/admin/users/bulk-deactivate', {
        'user_ids': [],
        'deactivation_type': 'temporary',
        'reason': 'Test',
        'admin_remarks': 'Empty list'
    })
    
    assert response.status_code == 400
    assert 'at least one user' in response.json()['message']
```

### UT-DA-007: Assignment Prevention
```python
def test_deactivated_user_excluded_from_dropdowns():
    active_user = create_active_user(full_name='Active User')
    suspended_user = create_user_with_status('Suspended', full_name='Suspended User')
    
    response = client.get('/api/v1/users/assignable?role=Driver')
    
    user_ids = [u['id'] for u in response.json()['users']]
    assert str(active_user.id) in user_ids
    assert str(suspended_user.id) not in user_ids

def test_assign_deactivated_user_to_trip_blocked():
    suspended_user = create_user_with_status('Suspended')
    trip = create_trip(status='Planned')
    
    response = client.post(f'/api/v1/trips/{trip.id}/assign', {
        'user_id': suspended_user.id,
        'role': 'Driver'
    })
    
    assert response.status_code == 400
    assert 'Cannot assign to deactivated user' in response.json()['message']

def test_assign_deactivated_user_to_vehicle_blocked():
    suspended_user = create_user_with_status('Suspended')
    vehicle = create_vehicle()
    
    response = client.post(f'/api/v1/vehicles/{vehicle.id}/assign-driver', {
        'driver_id': suspended_user.id
    })
    
    assert response.status_code == 400
    assert 'deactivated' in response.json()['message']
```

---

## UI Tests

### UI-DA-001: Deactivation Form Tests
```javascript
describe('Deactivation Form', () => {
  beforeEach(() => {
    cy.loginAs('tenantAdmin');
    cy.visit('/admin/users/user-123');
    cy.get('[data-testid="deactivate-btn"]').click();
  });

  it('should display all required form fields', () => {
    cy.get('[data-testid="deactivation-type-temporary"]').should('be.visible');
    cy.get('[data-testid="deactivation-type-permanent"]').should('be.visible');
    cy.get('[data-testid="reason-select"]').should('be.visible');
    cy.get('[data-testid="effective-date-picker"]').should('be.visible');
    cy.get('[data-testid="admin-remarks-textarea"]').should('be.visible');
    cy.get('[data-testid="submit-deactivation-btn"]').should('be.visible');
  });

  it('should default effective date to immediate', () => {
    cy.get('[data-testid="effective-date-picker"]')
      .should('have.value', 'Immediate');
  });

  it('should require admin remarks', () => {
    cy.get('[data-testid="deactivation-type-temporary"]').click();
    cy.get('[data-testid="reason-select"]').select('Leave of absence');
    cy.get('[data-testid="submit-deactivation-btn"]').click();
    cy.get('[data-testid="remarks-error"]').should('contain', 'required');
  });

  it('should show impact differences between types', () => {
    cy.get('[data-testid="deactivation-type-temporary"]').click();
    cy.get('[data-testid="type-impact"]')
      .should('contain', 'Data preserved')
      .and('contain', 'Can be reactivated');
    
    cy.get('[data-testid="deactivation-type-permanent"]').click();
    cy.get('[data-testid="type-impact"]')
      .should('contain', 'Data archived')
      .and('contain', 'Cannot be reactivated');
  });

  it('should show predefined reasons dropdown', () => {
    cy.get('[data-testid="reason-select"]').click();
    cy.get('[data-testid="reason-option"]').should('contain', 'Leave of absence');
    cy.get('[data-testid="reason-option"]').should('contain', 'Employee terminated');
    cy.get('[data-testid="reason-option"]').should('contain', 'Security incident');
    cy.get('[data-testid="reason-option"]').should('contain', 'Other (custom)');
  });

  it('should submit temporary deactivation and show success', () => {
    cy.get('[data-testid="deactivation-type-temporary"]').click();
    cy.get('[data-testid="reason-select"]').select('Leave of absence');
    cy.get('[data-testid="admin-remarks-textarea"]').type('3-month medical leave');
    cy.get('[data-testid="submit-deactivation-btn"]').click();
    cy.get('[data-testid="confirm-checkbox"]').check();
    cy.get('[data-testid="confirm-deactivation-btn"]').click();
    cy.get('[data-testid="success-toast"]').should('contain', 'User deactivated');
  });
});
```

### UI-DA-002: Confirmation Dialog Tests
```javascript
describe('Deactivation Confirmation Dialog', () => {
  beforeEach(() => {
    cy.loginAs('tenantAdmin');
    cy.visit('/admin/users/user-123');
    cy.fillDeactivationForm({ type: 'permanent', reason: 'Terminated', remarks: 'End of contract' });
    cy.get('[data-testid="submit-deactivation-btn"]').click();
  });

  it('should display user details in confirmation', () => {
    cy.get('[data-testid="confirm-dialog"]').should('be.visible');
    cy.get('[data-testid="confirm-user-name"]').should('contain', 'John Doe');
    cy.get('[data-testid="confirm-user-email"]').should('contain', 'john@company.com');
    cy.get('[data-testid="confirm-type"]').should('contain', 'Permanent');
  });

  it('should require checkbox before confirmation', () => {
    cy.get('[data-testid="confirm-deactivation-btn"]').should('be.disabled');
    cy.get('[data-testid="confirm-checkbox"]').check();
    cy.get('[data-testid="confirm-deactivation-btn"]').should('be.enabled');
  });

  it('should show active assignments warning', () => {
    cy.visit('/admin/users/user-with-assignments');
    cy.fillDeactivationForm({ type: 'temporary', reason: 'Test', remarks: 'Test' });
    cy.get('[data-testid="submit-deactivation-btn"]').click();
    cy.get('[data-testid="assignments-warning"]').should('be.visible');
    cy.get('[data-testid="assignment-item"]').should('have.length.greaterThan', 0);
    cy.get('[data-testid="override-checkbox"]').should('be.visible');
  });

  it('should allow cancel from confirmation dialog', () => {
    cy.get('[data-testid="cancel-dialog-btn"]').click();
    cy.get('[data-testid="confirm-dialog"]').should('not.exist');
  });
});
```

### UI-DA-003: Deactivation History View Tests
```javascript
describe('Deactivation History', () => {
  beforeEach(() => {
    cy.loginAs('tenantAdmin');
    cy.visit('/admin/users/deactivations');
  });

  it('should display deactivation list with columns', () => {
    cy.get('[data-testid="deactivation-table"]').should('be.visible');
    cy.get('[data-testid="col-user"]').should('be.visible');
    cy.get('[data-testid="col-type"]').should('be.visible');
    cy.get('[data-testid="col-reason"]').should('be.visible');
    cy.get('[data-testid="col-date"]').should('be.visible');
    cy.get('[data-testid="col-admin"]').should('be.visible');
    cy.get('[data-testid="col-status"]').should('be.visible');
  });

  it('should filter by deactivation type', () => {
    cy.get('[data-testid="filter-type"]').select('Temporary');
    cy.get('[data-testid="deactivation-row"]').each(($row) => {
      cy.wrap($row).find('[data-testid="type-badge"]').should('contain', 'Temporary');
    });
  });

  it('should filter by date range', () => {
    cy.get('[data-testid="filter-date-from"]').type('2026-03-01');
    cy.get('[data-testid="filter-date-to"]').type('2026-04-07');
    cy.get('[data-testid="apply-filters-btn"]').click();
    cy.get('[data-testid="deactivation-row"]').should('have.length.greaterThan', 0);
  });

  it('should show reactivate button only for temporary suspensions', () => {
    cy.get('[data-testid="deactivation-row-temporary"]').first()
      .find('[data-testid="reactivate-btn"]').should('be.visible');
    
    cy.get('[data-testid="deactivation-row-permanent"]').first()
      .find('[data-testid="reactivate-btn"]').should('not.exist');
  });

  it('should export deactivation logs', () => {
    cy.get('[data-testid="export-csv-btn"]').click();
    cy.readFile('cypress/downloads/deactivation-logs.csv').should('exist');
  });
});
```

### UI-DA-004: Reactivation Flow Tests
```javascript
describe('Reactivation Flow', () => {
  beforeEach(() => {
    cy.loginAs('tenantAdmin');
    cy.visit('/admin/users/deactivations');
  });

  it('should reactivate suspended user', () => {
    cy.get('[data-testid="deactivation-row-temporary"]').first()
      .find('[data-testid="reactivate-btn"]').click();
    cy.get('[data-testid="reactivation-reason"]').type('Employee returned from leave');
    cy.get('[data-testid="confirm-reactivation-btn"]').click();
    cy.get('[data-testid="success-toast"]').should('contain', 'User reactivated');
  });

  it('should require reactivation reason', () => {
    cy.get('[data-testid="deactivation-row-temporary"]').first()
      .find('[data-testid="reactivate-btn"]').click();
    cy.get('[data-testid="confirm-reactivation-btn"]').click();
    cy.get('[data-testid="reason-error"]').should('contain', 'required');
  });
});
```

### UI-DA-005: Permission-Based UI Tests
```javascript
describe('Deactivation Permission Controls', () => {
  it('should show deactivate button for admin users', () => {
    cy.loginAs('tenantAdmin');
    cy.visit('/admin/users/user-123');
    cy.get('[data-testid="deactivate-btn"]').should('be.visible');
  });

  it('should hide deactivate button for non-admin users', () => {
    cy.loginAs('depotOfficer');
    cy.visit('/admin/users/user-123');
    cy.get('[data-testid="deactivate-btn"]').should('not.exist');
  });

  it('should not show deactivation history page for non-admin', () => {
    cy.loginAs('depotOfficer');
    cy.visit('/admin/users/deactivations');
    cy.url().should('include', '/403');
  });
});
```

---

## Integration Tests

### IT-DA-001: End-to-End Temporary Deactivation
```python
def test_e2e_temporary_deactivation():
    """Full lifecycle: Admin deactivates → sessions terminated → user blocked → reactivated."""
    admin = create_user_with_role('Tenant Admin')
    user = create_active_user(email='user@co.com')
    create_session(user=user, status='Active')
    client.force_authenticate(admin)
    
    # Step 1: Deactivate
    response = client.post(f'/api/v1/admin/users/{user.id}/deactivate', {
        'deactivation_type': 'temporary',
        'reason': 'Leave of absence',
        'admin_remarks': 'Medical leave for 3 months',
        'effective_date': 'immediate'
    })
    assert response.status_code == 200
    
    # Step 2: Verify sessions terminated
    assert Session.objects.filter(user=user, status='Active').count() == 0
    
    # Step 3: Verify user blocked from login
    client.logout()
    login_response = client.post('/api/v1/auth/login', {
        'identifier': 'user@co.com'
    })
    assert login_response.status_code == 403
    
    # Step 4: Verify email notification
    assert_email_sent_to('user@co.com', subject_contains='Account Deactivated')
    
    # Step 5: Verify audit log
    log = UserDeactivation.objects.get(user=user)
    assert log.deactivation_type == 'temporary'
    assert log.deactivated_by == admin
    
    # Step 6: Reactivate
    client.force_authenticate(admin)
    react_response = client.post(f'/api/v1/admin/users/{user.id}/reactivate', {
        'reactivation_reason': 'Employee returned'
    })
    assert react_response.status_code == 200
    
    # Step 7: Verify user can login again
    user.refresh_from_db()
    assert user.status == 'Active'
```

### IT-DA-002: End-to-End Permanent Deactivation
```python
def test_e2e_permanent_deactivation():
    """Permanent deactivation: data archived, reactivation blocked."""
    admin = create_user_with_role('Tenant Admin')
    user = create_active_user(email='term@co.com')
    client.force_authenticate(admin)
    
    # Step 1: Permanently deactivate
    response = client.post(f'/api/v1/admin/users/{user.id}/deactivate', {
        'deactivation_type': 'permanent',
        'reason': 'Employee terminated',
        'admin_remarks': 'Contract ended'
    })
    assert response.status_code == 200
    
    # Step 2: Verify data archived
    user.refresh_from_db()
    assert user.status == 'Inactive'
    assert user.data_archived is True
    
    # Step 3: Verify reactivation blocked
    react_response = client.post(f'/api/v1/admin/users/{user.id}/reactivate', {
        'reactivation_reason': 'Attempt'
    })
    assert react_response.status_code == 400
    
    # Step 4: Verify user preserved in historical records
    trip = create_historical_trip(driver=user)
    trip_response = client.get(f'/api/v1/trips/{trip.id}')
    assert trip_response.json()['driver']['name'] == user.full_name
    assert trip_response.json()['driver']['status'] == 'Inactive'
```

### IT-DA-003: Deactivation with Active Assignment Override
```python
def test_e2e_deactivation_with_override():
    """Deactivation with active assignments requires override."""
    admin = create_user_with_role('Tenant Admin')
    user = create_active_user()
    to = create_transport_order(assigned_to=user, status='InProgress')
    trip = create_trip(driver=user, status='Active')
    client.force_authenticate(admin)
    
    # Step 1: First attempt - blocked
    response = client.post(f'/api/v1/admin/users/{user.id}/deactivate', {
        'deactivation_type': 'temporary',
        'reason': 'Security incident',
        'admin_remarks': 'Urgent'
    })
    assert response.status_code == 409
    assert len(response.json()['active_assignments']) == 2
    
    # Step 2: Override
    response = client.post(f'/api/v1/admin/users/{user.id}/deactivate', {
        'deactivation_type': 'temporary',
        'reason': 'Security incident',
        'admin_remarks': 'Urgent security concern',
        'override_active_assignments': True,
        'override_remarks': 'Immediate security threat - TO will be reassigned'
    })
    assert response.status_code == 200
    
    # Step 3: Verify override logged
    log = UserDeactivation.objects.get(user=user)
    assert log.override_used is True
    
    # Step 4: Active assignments remain (not auto-cancelled)
    to.refresh_from_db()
    assert to.status == 'InProgress'
```

### IT-DA-004: Bulk Deactivation Flow
```python
def test_e2e_bulk_deactivation():
    """Bulk deactivation with mixed results."""
    admin = create_user_with_role('Tenant Admin')
    users = [create_active_user() for _ in range(3)]
    create_transport_order(assigned_to=users[1], status='InProgress')
    client.force_authenticate(admin)
    
    response = client.post('/api/v1/admin/users/bulk-deactivate', {
        'user_ids': [u.id for u in users],
        'deactivation_type': 'temporary',
        'reason': 'Restructuring',
        'admin_remarks': 'Department consolidation'
    })
    
    assert response.status_code == 200
    data = response.json()
    assert data['success_count'] == 2
    assert data['failure_count'] == 1
    
    # Verify each user individually
    users[0].refresh_from_db()
    assert users[0].status == 'Suspended'
    users[1].refresh_from_db()
    assert users[1].status == 'Active'  # Blocked by active TO
    users[2].refresh_from_db()
    assert users[2].status == 'Suspended'
```

### IT-DA-005: Deactivation History & Export
```python
def test_deactivation_history_query():
    admin = create_user_with_role('Tenant Admin')
    perform_deactivation(create_active_user(), type='temporary', reason='Leave')
    perform_deactivation(create_active_user(), type='permanent', reason='Terminated')
    client.force_authenticate(admin)
    
    response = client.get('/api/v1/admin/users/deactivations?type=temporary')
    assert response.status_code == 200
    assert all(d['type'] == 'temporary' for d in response.json()['results'])

def test_deactivation_log_export():
    admin = create_user_with_role('Tenant Admin')
    client.force_authenticate(admin)
    
    response = client.get('/api/v1/admin/users/deactivations/export?type=temporary')
    assert response.status_code == 200
    assert response['Content-Type'] == 'text/csv'
    assert 'User,Type,Reason,Date,Admin' in response.content.decode()
```

---

## Edge Cases

### Deactivation Edge Cases
1. **Admin deactivates themselves**: System blocks with "Cannot deactivate your own account"
2. **Deactivate Super Admin**: Only another Super Admin can deactivate a Super Admin; Tenant Admins cannot
3. **Deactivate last Tenant Admin**: System blocks with "At least one active Tenant Admin required"
4. **Concurrent deactivation of same user**: Only the first request succeeds; second returns "User already deactivated"
5. **Deactivation during active user session**: User's in-progress API requests may complete, but subsequent requests are rejected
6. **Scheduled deactivation cancelled before effective date**: Admin can cancel scheduled deactivation; user is never deactivated
7. **User with active QC inspection**: System lists QC inspection as active critical assignment; requires override
8. **Cross-tenant deactivation attempt**: Tenant Admin A cannot deactivate users in Tenant B; returns 403

### Reactivation Edge Cases
9. **Reactivate user whose roles were deleted**: System reactivates user but flags missing roles for admin to reassign
10. **Reactivate user when plan limit is exceeded**: System blocks reactivation with "User limit reached. Upgrade subscription."
11. **Multiple deactivation-reactivation cycles**: Full history preserved; each cycle creates separate audit entries
12. **Reactivation by different admin than who deactivated**: Allowed — both admin IDs logged

### Bulk Operation Edge Cases
13. **Bulk deactivation includes admin's own account**: System excludes admin's own account and reports it as failed
14. **Bulk deactivation with duplicate user IDs**: System deduplicates; processes each user once
15. **Bulk deactivation of 0 users (empty list)**: Returns 400 "At least one user required"

---

## Test Coverage Requirements

| Test Category | Target Coverage | Priority |
|---|---|---|
| Unit Tests - Deactivation Process | 95% | Critical |
| Unit Tests - Session Termination | 95% | Critical |
| Unit Tests - Active Assignment Check | 90% | Critical |
| Unit Tests - Audit Logging | 90% | Critical |
| Unit Tests - Reactivation | 95% | Critical |
| Unit Tests - Bulk Deactivation | 90% | High |
| Unit Tests - Assignment Prevention | 90% | High |
| UI Tests - Deactivation Form | 90% | High |
| UI Tests - Confirmation Dialog | 85% | High |
| UI Tests - History View | 85% | High |
| UI Tests - Reactivation Flow | 90% | High |
| UI Tests - Permission Controls | 90% | Critical |
| Integration Tests - E2E Flows | 85% | Critical |
| Edge Case Coverage | 80% | High |

---

## Dependencies

- **US-005**: User Invitation & Activation (user accounts must exist)
- **Session Management**: For immediate session termination (authentication-security module)
- **Email Service**: For deactivation/reactivation notification emails
- **RBAC**: For permission validation (`UserMgmt.User.Deactivate`, `UserMgmt.User.Reactivate`)

## Definition of Done

### Functional Requirements
- [ ] Deactivation types implemented (temporary suspension / permanent)
- [ ] Deactivation form with all mandatory fields implemented
- [ ] Active assignment check and override mechanism implemented
- [ ] Immediate session termination on deactivation implemented
- [ ] Deactivation audit logging implemented (full details + IP address)
- [ ] Email notifications implemented (deactivation + reactivation)
- [ ] Reactivation workflow implemented (temporary only)
- [ ] Bulk deactivation with validation and per-user reporting implemented
- [ ] Deactivation history view with filters and export implemented
- [ ] Assignment prevention for deactivated users implemented (dropdowns, API, trips, TOs)
- [ ] Scheduled (future date) deactivation implemented

### Test Requirements
- [ ] Unit tests written and passing (≥ 90% coverage)
- [ ] UI tests written and passing (Cypress)
- [ ] Integration tests written and passing (E2E flows)
- [ ] Edge case scenarios tested
- [ ] Cross-tenant isolation tested
- [ ] Permission enforcement tested

### Documentation & Review
- [ ] API documentation updated for all endpoints (including bulk and export)
- [ ] Module specification aligned (`user-tenant-management.md`)
- [ ] Code reviewed and approved
- [ ] Security review completed for session termination logic

---

**Source Documents**:
- PRD Section 6.2.5: Account Deactivation

**Last Updated**: April 7, 2026  
**Status**: Pending Review
