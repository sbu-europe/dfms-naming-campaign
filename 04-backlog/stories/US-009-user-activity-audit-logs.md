---
title: User Activity & Audit Logs
story_id: US-009
phase: phase-1
module: User & Tenant Management
priority: Critical
status: Pending
epic: Security & Compliance
epic_id: EPIC-002
epic_name: User & Tenant Foundation
sprint: Sprint 3
story_points: 8
created: 2026-02-13
updated: 2026-04-07
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-001-login-account-lockout.md
  - US-005-user-invitation-activation.md
  - US-006-otp-verification.md
  - US-007-account-deactivation.md
  - US-008-password-account-reset.md
dependencies: []
tags: [security, audit, logging, compliance, immutable, export, dashboard, critical]
---

# US-009: User Activity & Audit Logs

## User Story

**As a** Security Admin  
**I want to** track all user activities  
**So that** I can ensure security and compliance

## Business Context

Comprehensive audit logging is critical for:
- Security monitoring and incident investigation
- Compliance requirements (regulatory, internal policies)
- User activity tracking and accountability
- Forensic analysis of system events
- Performance monitoring and troubleshooting

All user actions must be logged with sufficient detail for audit and investigation purposes.

## Acceptance Criteria

### AC-1: Authentication & Security Event Logging

Given users interact with the system,

when security- or account-related events occur,

then the system shall log each event with full details.

- [ ] Log all login (success/failure), logout, password reset, failed login attempts, account lockout, and session timeout events
- [ ] Each log entry includes: User ID, Event Type, Timestamp, IP Address, Device ID, Location (if available), Status, Failure reason (if applicable)
- [ ] Log all OTP operations (generation, verification, resend) with delivery method, attempt count, and status
- [ ] Log all password reset attempts (admin-assisted and self-service) with method, admin ID (if assisted), and justification

**Test Scenarios (AC-1):**

```gherkin
Scenario: AC-1.1 - Successful login is logged
  Given a registered user "officer.karim"
  When the user completes a successful 3-step login
  Then the system creates an audit log entry with:
    | Field         | Value                  |
    | event_type    | LOGIN                  |
    | user_id       | officer.karim's UUID   |
    | status        | success                |
    | ip_address    | User's IP              |
    | device_id     | Browser fingerprint    |
    | user_agent    | Chrome/120.0           |
    | timestamp     | ISO 8601 format        |

Scenario: AC-1.2 - Failed login attempt is logged with reason
  Given a registered user "officer.karim"
  When the user enters an incorrect password
  Then the system creates an audit log entry with:
    | Field          | Value              |
    | event_type     | LOGIN              |
    | status         | failure            |
    | failure_reason | InvalidPassword    |

Scenario: AC-1.3 - Account lockout is logged
  Given "officer.karim" has 3 consecutive failed login attempts
  When the account is locked automatically
  Then the system logs an event with event_type "ACCOUNT_LOCKOUT"
  And the failure_reason is "MaxAttemptsExceeded"

Scenario: AC-1.4 - Password reset events are logged
  Given an Admin triggers an assisted password reset for "driver.ahmed"
  When the reset is completed
  Then the system logs an event with:
    | Field         | Value                                           |
    | event_type    | PASSWORD_RESET                                  |
    | user_id       | driver.ahmed's UUID                              |
    | details       | {"method":"admin_assisted","admin_id":"...","justification":"..."} |

Scenario: AC-1.5 - OTP generation and verification are logged
  Given a user requests an OTP during login
  When the OTP is generated and sent via SMS
  Then the system logs an OTP_GENERATION event with delivery_method "sms"
  When the user enters the OTP correctly
  Then the system logs an OTP_VERIFICATION event with status "success" and attempts count

Scenario: AC-1.6 - Session timeout is logged
  Given "officer.karim" has been idle for 30 minutes
  When the session expires automatically
  Then the system logs a SESSION_TIMEOUT event with the session duration and last activity timestamp
```

### AC-2: User Action (CRUD) Logging

Given users perform create, read, update, or delete operations,

when any CRUD action is performed on system entities,

then the system shall log the action with entity details and before/after values for updates.

- [ ] Log create operations with entity type, entity ID, and created data
- [ ] Log read operations with entity type, entity ID, and access timestamp
- [ ] Log update operations with entity type, entity ID, old values, new values, and changed fields
- [ ] Log delete operations with entity type, entity ID, and deleted data snapshot

**Test Scenarios (AC-2):**

```gherkin
Scenario: AC-2.1 - Create operation logged
  Given an Admin creates a new vehicle entity
  When the vehicle record is saved
  Then the system logs an event with:
    | Field       | Value                       |
    | event_type  | CREATE                      |
    | entity_type | Vehicle                     |
    | entity_id   | New vehicle UUID             |
    | action      | Vehicle.Create              |
    | details     | {"registration":"...","type":"..."} |

Scenario: AC-2.2 - Update operation logged with before/after values
  Given a vehicle record exists with status "Available"
  When an Admin updates the vehicle status to "Under Maintenance"
  Then the system logs an event with:
    | Field       | Value                                     |
    | event_type  | UPDATE                                    |
    | entity_type | Vehicle                                   |
    | details     | {"before":{"status":"Available"},"after":{"status":"Under Maintenance"},"changed_fields":["status"]} |

Scenario: AC-2.3 - Delete operation logged with snapshot
  Given a vehicle record exists
  When an Admin deletes the vehicle
  Then the system logs a DELETE event
  And the details field contains the full deleted entity snapshot

Scenario: AC-2.4 - Read operation logged for sensitive entities
  Given a Tenant Admin views a user's profile
  When the profile page loads
  Then the system logs a READ event with entity_type "User" and entity_id of the viewed user

Scenario: AC-2.5 - Bulk operation logged individually
  Given an Admin performs a bulk update on 10 vehicle records
  When the bulk operation completes
  Then the system logs 10 individual UPDATE events (one per entity)
  And each event has its own before/after values
```

### AC-3: Audit Dashboard & Export

Given a Security Admin or Tenant Admin accesses the audit dashboard,

when the admin applies filters and views/exports logs,

then the system shall provide a real-time, filterable, and exportable log view.

- [ ] Provide admin dashboard with real-time log feed
- [ ] Support filters: Date Range, User, Event Type, Status, IP Address
- [ ] Support full-text search across log entries
- [ ] Support export in CSV and JSON formats with applied filters
- [ ] Retain all logs for minimum 2 years
- [ ] Logs are immutable and tamper-proof (no modification or deletion within retention period)
- [ ] Log access and export operations are themselves logged

**Test Scenarios (AC-3):**

```gherkin
Scenario: AC-3.1 - Dashboard displays logs with filters
  Given a Tenant Admin opens the audit dashboard
  When the admin selects date range "2026-03-01" to "2026-04-07"
  And filters by event_type "LOGIN"
  Then only login events within the date range are displayed
  And results are paginated (default 25 per page)

Scenario: AC-3.2 - Full-text search across logs
  Given a Tenant Admin is on the audit dashboard
  When the admin enters "driver.ahmed" in the search bar
  Then all log entries referencing "driver.ahmed" are displayed
  Including login events, password resets, and CRUD operations

Scenario: AC-3.3 - Export filtered logs to CSV
  Given a Tenant Admin has applied filters on the dashboard
  When the admin clicks "Export" and selects "CSV"
  Then the system generates a CSV file containing only the filtered logs
  And logs an AUDIT_LOG_EXPORT event recording the admin, filters, and format

Scenario: AC-3.4 - Export filtered logs to JSON
  Given a Tenant Admin has applied filters on the dashboard
  When the admin clicks "Export" and selects "JSON"
  Then the system generates a JSON file with the filtered log entries

Scenario: AC-3.5 - Log immutability enforced
  Given an audit log entry exists
  When any user (including admin) attempts to modify the entry via API
  Then the system returns HTTP 405 Method Not Allowed
  And the log entry remains unchanged

Scenario: AC-3.6 - Log access is itself audited
  Given a Tenant Admin views the audit dashboard
  When the admin views a specific log entry detail
  Then the system logs an AUDIT_LOG_ACCESS event with the admin's user ID, IP, and the viewed log_id

Scenario: AC-3.7 - Non-admin users cannot access audit logs
  Given a user with role "Depot Officer"
  When the user attempts to access /api/v1/admin/audit-logs
  Then the system returns HTTP 403 Forbidden
```

## Functional Requirements

### FR-069-001: Authentication Event Logging
- [Critical] System SHALL log:
  - Login (success/failure)
  - Logout
  - Password reset (admin-assisted and self-service)
  - Failed login attempts
  - Account lockout
  - Session timeout
- [Critical] Each authentication log SHALL include:
  - User ID (or attempted username)
  - Event Type
  - Timestamp
  - IP Address
  - Device ID
  - User Agent
  - Location (if available)
  - Status (success/failure)
  - Failure reason (if applicable)

### FR-069-002: User Action Logging
- [Critical] System SHALL log all CRUD operations:
  - Create: Entity type, Entity ID, Created data
  - Read: Entity type, Entity ID, Access timestamp
  - Update: Entity type, Entity ID, Old value, New value, Changed fields
  - Delete: Entity type, Entity ID, Deleted data
- [Critical] System SHALL log:
  - User ID
  - Timestamp
  - IP Address
  - Action performed
  - Entity details
  - Before/after values (for updates)

### FR-069-003: OTP Operation Logging
- [Critical] System SHALL log:
  - OTP generation: User ID, Operation type, Delivery method
  - OTP verification: User ID, Status (success/failure), Attempts
  - OTP resend: User ID, Resend count
- [Critical] Each OTP log SHALL include:
  - Timestamp
  - IP Address
  - Device ID
  - Operation type
  - Status

### FR-069-004: Audit Log Storage
- [Critical] System SHALL store logs in immutable format
- [Critical] System SHALL prevent log modification or deletion
- [Critical] System SHALL retain logs for minimum 2 years
- [Critical] System SHALL support log archival for long-term retention
- [High] System SHALL support log compression for storage efficiency

### FR-069-005: Audit Dashboard
- [Critical] System SHALL provide admin dashboard with:
  - Real-time log feed
  - Filters: Date range, User, Event Type, Status, IP Address
  - Search functionality
  - Export options (CSV, JSON)
- [High] System SHALL provide:
  - Log statistics and summaries
  - Activity trends
  - Suspicious activity alerts

### FR-069-006: Log Export
- [Critical] System SHALL support log export in:
  - CSV format
  - JSON format
- [Critical] System SHALL allow filtering before export
- [High] System SHALL support scheduled exports
- [High] System SHALL support bulk export for compliance reporting

## Business Rules

### BR-069-001: Log Retention
- Minimum retention: 2 years
- Logs cannot be deleted before retention period
- Archived logs must be accessible for compliance

### BR-069-002: Log Immutability
- Logs cannot be modified after creation
- Logs cannot be deleted (except after retention period)
- Log access must be logged

### BR-069-003: Logging Scope
- All user actions must be logged
- System actions (automated) may be logged separately
- Failed operations must be logged with failure reason

### BR-069-004: Access Control
- Only Security Admin and Tenant Admin can access audit logs
- Log access must be logged
- Export operations must be logged

## Data Model

### Audit Log Entity
```yaml
AuditLog:
  log_id: string (unique)
  tenant_id: string (FK)
  user_id: string (FK, optional)
  event_type: string (login|logout|create|update|delete|password_reset|otp_generation|etc)
  entity_type: string (user|vehicle|trip|to|tr|pr|etc, optional)
  entity_id: string (optional)
  action: string
  status: string (success|failure)
  ip_address: string
  device_id: string
  user_agent: string
  location: string (optional)
  timestamp: datetime
  details: json (before/after values, error messages, etc)
  failure_reason: string (optional)
```

### Audit Log Access Entity
```yaml
AuditLogAccess:
  access_id: string (unique)
  log_id: string (FK, optional)
  accessed_by: string (FK)
  access_type: string (view|export)
  accessed_at: datetime
  ip_address: string
  filters_applied: json (optional)
```

## UI/UX Requirements

### Audit Dashboard
- Real-time log feed (auto-refresh)
- Filters panel:
  - Date range picker
  - User dropdown
  - Event type multi-select
  - Status dropdown
  - IP address search
- Search bar (full-text search)
- Export button (CSV/JSON)
- Log detail view (expandable rows)
- Pagination (25/50/100 per page)

### Log Detail View
- Full log entry details
- Before/after comparison (for updates)
- Related logs (same user, same entity)
- Export single log entry

## API Endpoints

### GET /api/v1/admin/audit-logs
- List audit logs
- Query params: user_id, event_type, entity_type, status, date_from, date_to, ip_address, page, limit
- Response: paginated array of audit logs

### GET /api/v1/admin/audit-logs/{log_id}
- Get single audit log entry
- Response: audit log details

### POST /api/v1/admin/audit-logs/export
- Export audit logs
- Request body: filters, format (csv|json)
- Response: file download

### GET /api/v1/admin/audit-logs/statistics
- Get audit log statistics
- Query params: date_from, date_to
- Response: statistics (total events, by type, by user, etc)

## Non-Functional Requirements

- **Performance**: Log writing must not impact operation performance (< 50ms)
- **Storage**: Support 10M+ log entries per tenant
- **Security**: Logs must be encrypted at rest
- **Availability**: Audit logging service must be 99.9% available
- **Scalability**: Support 1000+ log entries per second

## Testing Scenarios

### TC-069-001: Login Logging
1. User logs in successfully
2. Verify login event logged with all required fields
3. User logs in with wrong password
4. Verify failed login logged with failure reason

### TC-069-002: CRUD Operation Logging
1. Admin creates new vehicle
2. Verify create event logged
3. Admin updates vehicle
4. Verify update event logged with old/new values
5. Admin deletes vehicle
6. Verify delete event logged

### TC-069-003: Log Retrieval
1. Admin accesses audit dashboard
2. Apply filters (date range, user)
3. Verify filtered logs displayed
4. Export logs to CSV
5. Verify export contains filtered logs

### TC-069-004: Log Immutability
1. Attempt to modify log entry
2. Verify modification rejected
3. Attempt to delete log entry
4. Verify deletion rejected (if within retention)

---

## Unit Tests

### UT-AL-001: Authentication Event Logging
```python
import pytest
from datetime import datetime

class TestAuthenticationEventLogging:
    def test_successful_login_logged(self):
        user = create_active_user(email='officer@co.com')
        
        response = client.post('/api/v1/auth/login', {
            'identifier': 'officer@co.com',
            'otp': '123456',
            'password': 'SecurePass123!'
        })
        
        assert response.status_code == 200
        
        log = AuditLog.objects.filter(user=user, event_type='LOGIN', status='success').first()
        assert log is not None
        assert log.ip_address is not None
        assert log.device_id is not None
        assert log.user_agent is not None
        assert log.timestamp is not None

    def test_failed_login_logged_with_reason(self):
        user = create_active_user(email='officer@co.com')
        
        client.post('/api/v1/auth/login', {
            'identifier': 'officer@co.com',
            'otp': '123456',
            'password': 'WrongPassword!'
        })
        
        log = AuditLog.objects.filter(user=user, event_type='LOGIN', status='failure').first()
        assert log is not None
        assert log.failure_reason == 'InvalidPassword'

    def test_account_lockout_logged(self):
        user = create_active_user(email='officer@co.com')
        
        for _ in range(3):
            client.post('/api/v1/auth/login', {
                'identifier': 'officer@co.com',
                'otp': '123456',
                'password': 'WrongPassword!'
            })
        
        log = AuditLog.objects.filter(user=user, event_type='ACCOUNT_LOCKOUT').first()
        assert log is not None
        assert log.failure_reason == 'MaxAttemptsExceeded'

    def test_logout_logged(self):
        user = create_active_user()
        token = authenticate_user(user)
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        client.post('/api/v1/auth/logout')
        
        log = AuditLog.objects.filter(user=user, event_type='LOGOUT').first()
        assert log is not None
        assert log.status == 'success'

    def test_session_timeout_logged(self):
        user = create_active_user()
        session = create_session(user=user, last_activity_at=datetime.now() - timedelta(minutes=31))
        
        expire_idle_sessions()
        
        log = AuditLog.objects.filter(user=user, event_type='SESSION_TIMEOUT').first()
        assert log is not None
        assert 'session_duration' in log.details

    def test_password_reset_logged(self):
        user = create_active_user(email='user@co.com')
        perform_self_service_reset(user)
        
        log = AuditLog.objects.filter(user=user, event_type='PASSWORD_RESET').first()
        assert log is not None
        assert log.details['method'] == 'self_service'
        assert log.ip_address is not None

    def test_admin_assisted_reset_logged_with_admin_id(self):
        admin = create_user_with_role('Tenant Admin')
        user = create_active_user()
        
        perform_admin_assisted_reset(admin, user, justification='Verified via phone call')
        
        log = AuditLog.objects.filter(user=user, event_type='PASSWORD_RESET').first()
        assert log.details['method'] == 'admin_assisted'
        assert log.details['admin_id'] == str(admin.id)
        assert log.details['justification'] == 'Verified via phone call'
```

### UT-AL-002: CRUD Operation Logging
```python
class TestCRUDOperationLogging:
    def test_create_operation_logged(self):
        admin = create_user_with_role('Tenant Admin')
        client.force_authenticate(admin)
        
        response = client.post('/api/v1/vehicles', {
            'registration': 'DHA-1234',
            'type': 'Truck',
            'capacity': 10000
        })
        
        vehicle_id = response.json()['id']
        log = AuditLog.objects.filter(
            user=admin, event_type='CREATE', entity_type='Vehicle', entity_id=vehicle_id
        ).first()
        assert log is not None
        assert log.action == 'Vehicle.Create'
        assert 'DHA-1234' in str(log.details)

    def test_update_operation_logged_with_before_after(self):
        admin = create_user_with_role('Tenant Admin')
        vehicle = create_vehicle(status='Available')
        client.force_authenticate(admin)
        
        client.patch(f'/api/v1/vehicles/{vehicle.id}', {'status': 'Under Maintenance'})
        
        log = AuditLog.objects.filter(
            user=admin, event_type='UPDATE', entity_type='Vehicle', entity_id=str(vehicle.id)
        ).first()
        assert log is not None
        assert log.details['before']['status'] == 'Available'
        assert log.details['after']['status'] == 'Under Maintenance'
        assert 'status' in log.details['changed_fields']

    def test_delete_operation_logged_with_snapshot(self):
        admin = create_user_with_role('Tenant Admin')
        vehicle = create_vehicle(registration='DHA-5678')
        client.force_authenticate(admin)
        
        client.delete(f'/api/v1/vehicles/{vehicle.id}')
        
        log = AuditLog.objects.filter(
            user=admin, event_type='DELETE', entity_type='Vehicle', entity_id=str(vehicle.id)
        ).first()
        assert log is not None
        assert log.details['deleted_data']['registration'] == 'DHA-5678'

    def test_read_operation_logged_for_sensitive_entity(self):
        admin = create_user_with_role('Tenant Admin')
        user = create_active_user()
        client.force_authenticate(admin)
        
        client.get(f'/api/v1/admin/users/{user.id}')
        
        log = AuditLog.objects.filter(
            user=admin, event_type='READ', entity_type='User', entity_id=str(user.id)
        ).first()
        assert log is not None

    def test_bulk_operation_logged_individually(self):
        admin = create_user_with_role('Tenant Admin')
        vehicles = [create_vehicle() for _ in range(5)]
        client.force_authenticate(admin)
        
        client.post('/api/v1/vehicles/bulk-update', {
            'ids': [str(v.id) for v in vehicles],
            'status': 'Under Maintenance'
        })
        
        logs = AuditLog.objects.filter(user=admin, event_type='UPDATE', entity_type='Vehicle')
        assert logs.count() == 5
```

### UT-AL-003: OTP Operation Logging
```python
class TestOTPOperationLogging:
    def test_otp_generation_logged(self):
        user = create_active_user(email='user@co.com')
        
        client.post('/api/v1/auth/login', {'identifier': 'user@co.com'})
        
        log = AuditLog.objects.filter(user=user, event_type='OTP_GENERATION').first()
        assert log is not None
        assert log.details['delivery_method'] in ['email', 'sms']
        assert log.details['operation_type'] == 'login'

    def test_otp_verification_success_logged(self):
        user = create_active_user()
        otp = trigger_otp_for_user(user)
        
        verify_otp(user, otp)
        
        log = AuditLog.objects.filter(user=user, event_type='OTP_VERIFICATION', status='success').first()
        assert log is not None
        assert log.details['attempts'] == 1

    def test_otp_verification_failure_logged(self):
        user = create_active_user()
        trigger_otp_for_user(user)
        
        verify_otp(user, '000000')
        
        log = AuditLog.objects.filter(user=user, event_type='OTP_VERIFICATION', status='failure').first()
        assert log is not None

    def test_otp_resend_logged(self):
        user = create_active_user()
        trigger_otp_for_user(user)
        
        resend_otp(user)
        
        log = AuditLog.objects.filter(user=user, event_type='OTP_RESEND').first()
        assert log is not None
        assert log.details['resend_count'] >= 1
```

### UT-AL-004: Log Immutability
```python
class TestLogImmutability:
    def test_log_cannot_be_modified_via_api(self):
        log_entry = create_audit_log(event_type='LOGIN', status='success')
        admin = create_user_with_role('Tenant Admin')
        client.force_authenticate(admin)
        
        response = client.patch(f'/api/v1/admin/audit-logs/{log_entry.log_id}', {
            'status': 'failure'
        })
        
        assert response.status_code == 405

    def test_log_cannot_be_deleted_via_api(self):
        log_entry = create_audit_log(event_type='LOGIN', status='success')
        admin = create_user_with_role('Tenant Admin')
        client.force_authenticate(admin)
        
        response = client.delete(f'/api/v1/admin/audit-logs/{log_entry.log_id}')
        
        assert response.status_code == 405
        assert AuditLog.objects.filter(log_id=log_entry.log_id).exists()

    def test_log_cannot_be_modified_at_db_level(self):
        log_entry = create_audit_log(event_type='LOGIN', status='success')
        
        with pytest.raises(IntegrityError):
            AuditLog.objects.filter(log_id=log_entry.log_id).update(status='failure')

    def test_log_fields_are_complete(self):
        user = create_active_user()
        authenticate_user(user)
        
        log = AuditLog.objects.filter(user=user, event_type='LOGIN').first()
        assert log.log_id is not None
        assert log.tenant_id is not None
        assert log.user_id is not None
        assert log.event_type is not None
        assert log.timestamp is not None
        assert log.ip_address is not None
        assert log.status is not None
```

### UT-AL-005: Log Retrieval & Filtering
```python
class TestLogRetrievalFiltering:
    def test_list_logs_paginated(self):
        admin = create_user_with_role('Tenant Admin')
        create_audit_logs(count=60)
        client.force_authenticate(admin)
        
        response = client.get('/api/v1/admin/audit-logs?page=1&limit=25')
        
        assert response.status_code == 200
        assert len(response.json()['results']) == 25
        assert response.json()['total'] == 60

    def test_filter_by_event_type(self):
        admin = create_user_with_role('Tenant Admin')
        create_audit_log(event_type='LOGIN')
        create_audit_log(event_type='CREATE')
        client.force_authenticate(admin)
        
        response = client.get('/api/v1/admin/audit-logs?event_type=LOGIN')
        
        assert all(l['event_type'] == 'LOGIN' for l in response.json()['results'])

    def test_filter_by_date_range(self):
        admin = create_user_with_role('Tenant Admin')
        client.force_authenticate(admin)
        
        response = client.get('/api/v1/admin/audit-logs?date_from=2026-03-01&date_to=2026-04-07')
        
        assert response.status_code == 200
        for log in response.json()['results']:
            assert '2026-03' <= log['timestamp'][:7] <= '2026-04'

    def test_filter_by_user_id(self):
        admin = create_user_with_role('Tenant Admin')
        user = create_active_user()
        create_audit_log(user_id=user.id, event_type='LOGIN')
        create_audit_log(user_id=admin.id, event_type='LOGIN')
        client.force_authenticate(admin)
        
        response = client.get(f'/api/v1/admin/audit-logs?user_id={user.id}')
        
        assert all(l['user_id'] == str(user.id) for l in response.json()['results'])

    def test_filter_by_status(self):
        admin = create_user_with_role('Tenant Admin')
        create_audit_log(event_type='LOGIN', status='success')
        create_audit_log(event_type='LOGIN', status='failure')
        client.force_authenticate(admin)
        
        response = client.get('/api/v1/admin/audit-logs?status=failure')
        
        assert all(l['status'] == 'failure' for l in response.json()['results'])

    def test_get_single_log_entry(self):
        admin = create_user_with_role('Tenant Admin')
        log_entry = create_audit_log(event_type='LOGIN')
        client.force_authenticate(admin)
        
        response = client.get(f'/api/v1/admin/audit-logs/{log_entry.log_id}')
        
        assert response.status_code == 200
        assert response.json()['log_id'] == str(log_entry.log_id)

    def test_get_statistics(self):
        admin = create_user_with_role('Tenant Admin')
        create_audit_logs(count=30, event_type='LOGIN')
        create_audit_logs(count=10, event_type='CREATE')
        client.force_authenticate(admin)
        
        response = client.get('/api/v1/admin/audit-logs/statistics')
        
        assert response.status_code == 200
        assert response.json()['total_events'] == 40
        assert 'by_type' in response.json()
```

### UT-AL-006: Log Export
```python
class TestLogExport:
    def test_export_csv(self):
        admin = create_user_with_role('Tenant Admin')
        create_audit_logs(count=10)
        client.force_authenticate(admin)
        
        response = client.post('/api/v1/admin/audit-logs/export', {
            'format': 'csv',
            'filters': {'event_type': 'LOGIN'}
        })
        
        assert response.status_code == 200
        assert response['Content-Type'] == 'text/csv'
        assert 'attachment' in response['Content-Disposition']

    def test_export_json(self):
        admin = create_user_with_role('Tenant Admin')
        create_audit_logs(count=10)
        client.force_authenticate(admin)
        
        response = client.post('/api/v1/admin/audit-logs/export', {
            'format': 'json',
            'filters': {}
        })
        
        assert response.status_code == 200
        assert response['Content-Type'] == 'application/json'

    def test_export_operation_is_logged(self):
        admin = create_user_with_role('Tenant Admin')
        client.force_authenticate(admin)
        
        client.post('/api/v1/admin/audit-logs/export', {
            'format': 'csv',
            'filters': {'event_type': 'LOGIN'}
        })
        
        access_log = AuditLogAccess.objects.filter(
            accessed_by=admin, access_type='export'
        ).first()
        assert access_log is not None
        assert access_log.filters_applied == {'event_type': 'LOGIN'}

    def test_export_with_filters_applied(self):
        admin = create_user_with_role('Tenant Admin')
        create_audit_log(event_type='LOGIN', status='success')
        create_audit_log(event_type='CREATE', status='success')
        client.force_authenticate(admin)
        
        response = client.post('/api/v1/admin/audit-logs/export', {
            'format': 'csv',
            'filters': {'event_type': 'LOGIN'}
        })
        
        csv_content = response.content.decode()
        assert 'LOGIN' in csv_content
        assert 'CREATE' not in csv_content
```

### UT-AL-007: Access Control
```python
class TestAuditLogAccessControl:
    def test_tenant_admin_can_access_logs(self):
        admin = create_user_with_role('Tenant Admin')
        client.force_authenticate(admin)
        
        response = client.get('/api/v1/admin/audit-logs')
        assert response.status_code == 200

    def test_super_admin_can_access_logs(self):
        admin = create_user_with_role('Super Admin')
        client.force_authenticate(admin)
        
        response = client.get('/api/v1/admin/audit-logs')
        assert response.status_code == 200

    def test_non_admin_cannot_access_logs(self):
        user = create_user_with_role('Depot Officer')
        client.force_authenticate(user)
        
        response = client.get('/api/v1/admin/audit-logs')
        assert response.status_code == 403

    def test_log_access_is_audited(self):
        admin = create_user_with_role('Tenant Admin')
        log_entry = create_audit_log(event_type='LOGIN')
        client.force_authenticate(admin)
        
        client.get(f'/api/v1/admin/audit-logs/{log_entry.log_id}')
        
        access_log = AuditLogAccess.objects.filter(
            accessed_by=admin, access_type='view', log_id=log_entry.log_id
        ).first()
        assert access_log is not None

    def test_tenant_isolation(self):
        tenant_a_admin = create_user_with_role('Tenant Admin', tenant='TenantA')
        tenant_b_log = create_audit_log(event_type='LOGIN', tenant='TenantB')
        client.force_authenticate(tenant_a_admin)
        
        response = client.get('/api/v1/admin/audit-logs')
        
        log_ids = [l['log_id'] for l in response.json()['results']]
        assert str(tenant_b_log.log_id) not in log_ids
```

---

## UI Tests

### UI-AL-001: Audit Dashboard Tests
```javascript
describe('Audit Dashboard', () => {
  beforeEach(() => {
    cy.loginAs('tenantAdmin');
    cy.visit('/admin/audit-logs');
  });

  it('should display audit dashboard with log feed', () => {
    cy.get('[data-testid="audit-log-table"]').should('be.visible');
    cy.get('[data-testid="log-row"]').should('have.length.greaterThan', 0);
    cy.get('[data-testid="pagination"]').should('be.visible');
  });

  it('should display all required columns', () => {
    cy.get('[data-testid="col-timestamp"]').should('be.visible');
    cy.get('[data-testid="col-user"]').should('be.visible');
    cy.get('[data-testid="col-event-type"]').should('be.visible');
    cy.get('[data-testid="col-status"]').should('be.visible');
    cy.get('[data-testid="col-ip-address"]').should('be.visible');
  });

  it('should auto-refresh log feed', () => {
    cy.get('[data-testid="auto-refresh-toggle"]').should('be.visible');
    cy.get('[data-testid="auto-refresh-toggle"]').click();
    cy.get('[data-testid="refresh-indicator"]').should('be.visible');
  });

  it('should paginate results', () => {
    cy.get('[data-testid="page-size-select"]').select('50');
    cy.get('[data-testid="log-row"]').should('have.length.at.most', 50);
    cy.get('[data-testid="next-page-btn"]').click();
    cy.get('[data-testid="page-indicator"]').should('contain', 'Page 2');
  });
});
```

### UI-AL-002: Filter Panel Tests
```javascript
describe('Audit Dashboard Filters', () => {
  beforeEach(() => {
    cy.loginAs('tenantAdmin');
    cy.visit('/admin/audit-logs');
  });

  it('should filter by date range', () => {
    cy.get('[data-testid="filter-date-from"]').type('2026-03-01');
    cy.get('[data-testid="filter-date-to"]').type('2026-04-07');
    cy.get('[data-testid="apply-filters-btn"]').click();
    cy.get('[data-testid="log-row"]').each(($row) => {
      cy.wrap($row).find('[data-testid="col-timestamp"]')
        .invoke('text').should('match', /2026-0[34]/);
    });
  });

  it('should filter by event type (multi-select)', () => {
    cy.get('[data-testid="filter-event-type"]').click();
    cy.get('[data-testid="option-LOGIN"]').click();
    cy.get('[data-testid="option-LOGOUT"]').click();
    cy.get('[data-testid="apply-filters-btn"]').click();
    cy.get('[data-testid="log-row"]').each(($row) => {
      cy.wrap($row).find('[data-testid="col-event-type"]')
        .invoke('text').should('match', /LOGIN|LOGOUT/);
    });
  });

  it('should filter by user', () => {
    cy.get('[data-testid="filter-user"]').select('officer.karim');
    cy.get('[data-testid="apply-filters-btn"]').click();
    cy.get('[data-testid="log-row"]').each(($row) => {
      cy.wrap($row).find('[data-testid="col-user"]').should('contain', 'officer.karim');
    });
  });

  it('should filter by status', () => {
    cy.get('[data-testid="filter-status"]').select('failure');
    cy.get('[data-testid="apply-filters-btn"]').click();
    cy.get('[data-testid="log-row"]').each(($row) => {
      cy.wrap($row).find('[data-testid="col-status"]').should('contain', 'Failure');
    });
  });

  it('should filter by IP address', () => {
    cy.get('[data-testid="filter-ip"]').type('192.168.1.100');
    cy.get('[data-testid="apply-filters-btn"]').click();
    cy.get('[data-testid="log-row"]').each(($row) => {
      cy.wrap($row).find('[data-testid="col-ip-address"]').should('contain', '192.168.1.100');
    });
  });

  it('should support full-text search', () => {
    cy.get('[data-testid="search-bar"]').type('driver.ahmed');
    cy.get('[data-testid="search-btn"]').click();
    cy.get('[data-testid="log-row"]').should('have.length.greaterThan', 0);
  });

  it('should clear filters', () => {
    cy.get('[data-testid="filter-status"]').select('failure');
    cy.get('[data-testid="apply-filters-btn"]').click();
    cy.get('[data-testid="clear-filters-btn"]').click();
    cy.get('[data-testid="filter-status"]').should('have.value', '');
  });
});
```

### UI-AL-003: Log Detail View Tests
```javascript
describe('Log Detail View', () => {
  beforeEach(() => {
    cy.loginAs('tenantAdmin');
    cy.visit('/admin/audit-logs');
  });

  it('should expand log row to show details', () => {
    cy.get('[data-testid="log-row"]').first().click();
    cy.get('[data-testid="log-detail-panel"]').should('be.visible');
    cy.get('[data-testid="detail-user-id"]').should('be.visible');
    cy.get('[data-testid="detail-device-id"]').should('be.visible');
    cy.get('[data-testid="detail-user-agent"]').should('be.visible');
  });

  it('should show before/after comparison for UPDATE events', () => {
    cy.get('[data-testid="filter-event-type"]').click();
    cy.get('[data-testid="option-UPDATE"]').click();
    cy.get('[data-testid="apply-filters-btn"]').click();
    cy.get('[data-testid="log-row"]').first().click();
    cy.get('[data-testid="before-after-diff"]').should('be.visible');
    cy.get('[data-testid="before-value"]').should('be.visible');
    cy.get('[data-testid="after-value"]').should('be.visible');
  });

  it('should show related logs for same user', () => {
    cy.get('[data-testid="log-row"]').first().click();
    cy.get('[data-testid="related-logs-section"]').should('be.visible');
    cy.get('[data-testid="related-log-entry"]').should('have.length.greaterThan', 0);
  });

  it('should export single log entry', () => {
    cy.get('[data-testid="log-row"]').first().click();
    cy.get('[data-testid="export-single-btn"]').click();
    cy.readFile('cypress/downloads/audit-log-*.json').should('exist');
  });
});
```

### UI-AL-004: Export Functionality Tests
```javascript
describe('Audit Log Export', () => {
  beforeEach(() => {
    cy.loginAs('tenantAdmin');
    cy.visit('/admin/audit-logs');
  });

  it('should export to CSV', () => {
    cy.get('[data-testid="export-btn"]').click();
    cy.get('[data-testid="export-format-csv"]').click();
    cy.get('[data-testid="confirm-export-btn"]').click();
    cy.get('[data-testid="export-success"]').should('be.visible');
  });

  it('should export to JSON', () => {
    cy.get('[data-testid="export-btn"]').click();
    cy.get('[data-testid="export-format-json"]').click();
    cy.get('[data-testid="confirm-export-btn"]').click();
    cy.get('[data-testid="export-success"]').should('be.visible');
  });

  it('should export with filters applied', () => {
    cy.get('[data-testid="filter-event-type"]').click();
    cy.get('[data-testid="option-LOGIN"]').click();
    cy.get('[data-testid="apply-filters-btn"]').click();
    cy.get('[data-testid="export-btn"]').click();
    cy.get('[data-testid="export-format-csv"]').click();
    cy.get('[data-testid="confirm-export-btn"]').click();
    cy.get('[data-testid="export-success"]').should('contain', 'filtered');
  });
});
```

### UI-AL-005: Permission Control Tests
```javascript
describe('Audit Dashboard Permission Control', () => {
  it('should show audit menu for Tenant Admin', () => {
    cy.loginAs('tenantAdmin');
    cy.get('[data-testid="nav-audit-logs"]').should('be.visible');
  });

  it('should hide audit menu for non-admin users', () => {
    cy.loginAs('depotOfficer');
    cy.get('[data-testid="nav-audit-logs"]').should('not.exist');
  });

  it('should redirect non-admin from direct URL access', () => {
    cy.loginAs('depotOfficer');
    cy.visit('/admin/audit-logs');
    cy.url().should('include', '/unauthorized');
  });
});
```

---

## Integration Tests

### IT-AL-001: End-to-End Authentication Logging
```python
def test_e2e_full_login_flow_logged():
    """Full login flow: OTP generation → OTP verification → login → all events logged."""
    user = create_active_user(email='officer@co.com')
    
    # Step 1: Initiate login (triggers OTP generation)
    client.post('/api/v1/auth/login/step1', {'identifier': 'officer@co.com'})
    
    otp_gen_log = AuditLog.objects.filter(user=user, event_type='OTP_GENERATION').first()
    assert otp_gen_log is not None
    
    # Step 2: Verify OTP
    otp = get_latest_otp(user)
    client.post('/api/v1/auth/login/step2', {
        'identifier': 'officer@co.com',
        'otp': otp
    })
    
    otp_verify_log = AuditLog.objects.filter(user=user, event_type='OTP_VERIFICATION', status='success').first()
    assert otp_verify_log is not None
    
    # Step 3: Complete login with password
    response = client.post('/api/v1/auth/login/step3', {
        'identifier': 'officer@co.com',
        'password': 'SecurePass123!'
    })
    assert response.status_code == 200
    
    login_log = AuditLog.objects.filter(user=user, event_type='LOGIN', status='success').first()
    assert login_log is not None
    assert login_log.ip_address is not None
    assert login_log.device_id is not None
```

### IT-AL-002: End-to-End CRUD Logging
```python
def test_e2e_crud_lifecycle_logged():
    """Create → Update → Delete a vehicle, verify all operations logged with details."""
    admin = create_user_with_role('Tenant Admin')
    client.force_authenticate(admin)
    
    # Create
    create_resp = client.post('/api/v1/vehicles', {
        'registration': 'DHA-9999', 'type': 'Truck', 'capacity': 10000
    })
    vehicle_id = create_resp.json()['id']
    
    create_log = AuditLog.objects.filter(
        entity_type='Vehicle', entity_id=vehicle_id, event_type='CREATE'
    ).first()
    assert create_log is not None
    
    # Update
    client.patch(f'/api/v1/vehicles/{vehicle_id}', {'capacity': 15000})
    
    update_log = AuditLog.objects.filter(
        entity_type='Vehicle', entity_id=vehicle_id, event_type='UPDATE'
    ).first()
    assert update_log.details['before']['capacity'] == 10000
    assert update_log.details['after']['capacity'] == 15000
    
    # Delete
    client.delete(f'/api/v1/vehicles/{vehicle_id}')
    
    delete_log = AuditLog.objects.filter(
        entity_type='Vehicle', entity_id=vehicle_id, event_type='DELETE'
    ).first()
    assert delete_log is not None
    assert delete_log.details['deleted_data']['registration'] == 'DHA-9999'
```

### IT-AL-003: Dashboard Filtering and Export
```python
def test_e2e_dashboard_filter_and_export():
    admin = create_user_with_role('Tenant Admin')
    create_audit_logs(count=20, event_type='LOGIN', status='success')
    create_audit_logs(count=5, event_type='LOGIN', status='failure')
    create_audit_logs(count=10, event_type='CREATE')
    client.force_authenticate(admin)
    
    # Filter by event type and status
    response = client.get('/api/v1/admin/audit-logs?event_type=LOGIN&status=failure')
    assert len(response.json()['results']) == 5
    
    # Export filtered results
    export_response = client.post('/api/v1/admin/audit-logs/export', {
        'format': 'csv',
        'filters': {'event_type': 'LOGIN', 'status': 'failure'}
    })
    assert export_response.status_code == 200
    
    csv_lines = export_response.content.decode().strip().split('\n')
    assert len(csv_lines) == 6  # header + 5 data rows
    
    # Verify export was audited
    access_log = AuditLogAccess.objects.filter(accessed_by=admin, access_type='export').first()
    assert access_log is not None
```

### IT-AL-004: Tenant Isolation
```python
def test_e2e_tenant_isolation():
    """Logs from TenantA are not visible to TenantB admin."""
    admin_a = create_user_with_role('Tenant Admin', tenant='TenantA')
    admin_b = create_user_with_role('Tenant Admin', tenant='TenantB')
    
    # Create log in TenantA context
    with tenant_context('TenantA'):
        create_audit_log(event_type='LOGIN', user_id=admin_a.id)
    
    # TenantB admin should not see TenantA logs
    client.force_authenticate(admin_b)
    with tenant_context('TenantB'):
        response = client.get('/api/v1/admin/audit-logs')
    
    log_tenant_ids = {l['tenant_id'] for l in response.json()['results']}
    assert 'TenantA' not in log_tenant_ids
```

### IT-AL-005: Log Retention and Archival
```python
def test_logs_retained_for_minimum_period():
    admin = create_user_with_role('Tenant Admin')
    old_log = create_audit_log(
        event_type='LOGIN',
        timestamp=datetime.now() - timedelta(days=365)
    )
    client.force_authenticate(admin)
    
    response = client.get(f'/api/v1/admin/audit-logs/{old_log.log_id}')
    assert response.status_code == 200

def test_logs_within_retention_cannot_be_purged():
    recent_log = create_audit_log(
        event_type='LOGIN',
        timestamp=datetime.now() - timedelta(days=30)
    )
    
    run_log_purge_job()
    
    assert AuditLog.objects.filter(log_id=recent_log.log_id).exists()
```

---

## Edge Cases

### Logging Edge Cases
1. **System action without user context**: Automated scheduled tasks (e.g., session expiry cron) are logged with `user_id: null` and `actor: SYSTEM`
2. **Concurrent write logging**: Two users update the same entity simultaneously; both UPDATE events are logged with correct before/after values per individual transaction
3. **Log entry exceeds detail field size**: Very large entity snapshots (e.g., bulk import data) are truncated with a `truncated: true` flag in the details JSON
4. **Failed operation logged before rollback**: If a transaction fails, the failure log entry is written to a separate write-ahead log to survive the rollback
5. **OTP generated but never verified**: OTP_GENERATION event is logged; no OTP_VERIFICATION event; query can identify orphaned OTP events

### Dashboard & Export Edge Cases
6. **Export with zero results**: Returns empty CSV (header only) or empty JSON array `[]` — no error
7. **Large export (100k+ records)**: System streams the export file to prevent memory overflow; progress indicator shown
8. **Dashboard accessed during high log volume**: Real-time feed uses WebSocket or polling with backpressure; older entries are paginated normally
9. **Filter combination returns no results**: Dashboard displays "No logs match your filters" message; no error state

### Access Control Edge Cases
10. **Admin views their own audit trail**: Allowed — the view itself creates a new AUDIT_LOG_ACCESS entry (no infinite loop; access logging uses a separate write path that does not trigger recursive audit)
11. **Admin export while new logs arrive**: Export captures a point-in-time snapshot at the moment of request; new logs after export initiation are not included
12. **Deactivated admin's past log entries**: Log entries by a now-deactivated admin remain immutable and searchable; admin name shows as "Deactivated User (ID: ...)"

### Security & Compliance Edge Cases
13. **Log encryption key rotation**: During key rotation, old logs remain readable with the old key; new logs use the new key; rotation is itself an audited event
14. **Database restore from backup**: Restored logs maintain immutability constraints; any gaps between backup time and restore time are flagged
15. **Clock skew between servers**: Timestamps use UTC from a centralized time source (NTP); log ordering uses sequence IDs as tiebreaker

---

## Test Coverage Requirements

| Test Category | Target Coverage | Priority |
|---|---|---|
| Unit Tests - Auth Event Logging | 95% | Critical |
| Unit Tests - CRUD Operation Logging | 95% | Critical |
| Unit Tests - OTP Operation Logging | 90% | Critical |
| Unit Tests - Log Immutability | 95% | Critical |
| Unit Tests - Log Retrieval & Filtering | 90% | High |
| Unit Tests - Log Export | 90% | High |
| Unit Tests - Access Control | 95% | Critical |
| UI Tests - Audit Dashboard | 90% | High |
| UI Tests - Filter Panel | 90% | High |
| UI Tests - Log Detail View | 85% | Medium |
| UI Tests - Export Functionality | 85% | High |
| UI Tests - Permission Control | 90% | Critical |
| Integration Tests - E2E Flows | 85% | Critical |
| Integration Tests - Tenant Isolation | 90% | Critical |
| Edge Case Coverage | 80% | High |

---

## Dependencies

- **Database**: For log storage (append-only tables with immutability constraints)
- **Encryption Service**: For log encryption at rest (AES-256)
- **US-001**: Login & Account Lockout (login events, lockout events)
- **US-005**: User Invitation & Activation (invitation, activation, password reset events)
- **US-006**: OTP Verification System (OTP generation, verification, resend events)
- **US-007**: Account Deactivation (deactivation, reactivation events)
- **US-008**: Password & Account Reset (reset initiation, completion, failure events)

## Definition of Done

### Functional Requirements
- [ ] Authentication event logging implemented (login, logout, lockout, session timeout, password reset)
- [ ] User action (CRUD) logging implemented with before/after values for updates
- [ ] OTP operation logging implemented (generation, verification, resend)
- [ ] Audit log storage implemented with immutability constraints (no modify, no delete)
- [ ] Log retention policy implemented (minimum 2 years, archival support)
- [ ] Audit dashboard implemented with real-time feed, filters, pagination, and search
- [ ] Log export implemented (CSV and JSON) with filter support
- [ ] Log access and export operations are themselves audited
- [ ] Access control enforced (Security Admin / Tenant Admin only)
- [ ] Tenant isolation verified (no cross-tenant log visibility)

### Test Requirements
- [ ] Unit tests written and passing (≥ 90% coverage)
- [ ] UI tests written and passing (Cypress)
- [ ] Integration tests written and passing (E2E flows)
- [ ] Edge case scenarios tested (concurrent writes, large exports, recursive access logging)
- [ ] Tenant isolation tests passing

### Documentation & Review
- [ ] API documentation updated for all audit log endpoints
- [ ] Module specifications aligned (`authentication-security.md`, `security-compliance.md`, `non-functional-requirements.md`)
- [ ] Code reviewed and approved
- [ ] Security review completed for log immutability and encryption at rest

---

**Source Documents**:
- PRD Section 6.2.7: User Activity & Audit Logs

**Last Updated**: April 7, 2026  
**Status**: Pending Review
