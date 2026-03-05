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
updated: 2026-02-13
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-007-account-deactivation.md
dependencies: []
tags: [security, audit, logging, compliance, critical]
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

### Must Have (Critical)
- [ ] System SHALL log all login, logout, password reset, and failed login attempts
- [ ] System SHALL log all user actions (create, read, update, delete operations)
- [ ] Each log entry SHALL include: User ID, Event Type, Timestamp, IP Address, Device ID, Location, Status
- [ ] System SHALL provide admin dashboard with filters: Date range, User, Event Type, Status
- [ ] System SHALL make logs exportable (CSV, JSON)
- [ ] System SHALL retain logs for minimum 2 years
- [ ] System SHALL make logs immutable and tamper-proof
- [ ] System SHALL log all OTP operations (generation, verification, resend)
- [ ] System SHALL log all password reset attempts

### Should Have (High)
- [ ] System SHOULD provide real-time audit dashboard
- [ ] System SHOULD support log search and advanced filtering
- [ ] System SHOULD generate audit reports
- [ ] System SHOULD detect suspicious activity patterns

### Nice to Have (Medium)
- [ ] System MAY support log archiving to external storage
- [ ] System MAY provide log analytics and visualization

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

## Dependencies

- **Database**: For log storage
- **Encryption Service**: For log encryption
- **US-007**: User and Role Management (for user context)

## Definition of Done

- [ ] Authentication event logging implemented
- [ ] User action logging implemented
- [ ] OTP operation logging implemented
- [ ] Audit log storage implemented (immutable)
- [ ] Audit dashboard implemented
- [ ] Log export functionality implemented
- [ ] Log retention policy implemented
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing
- [ ] Documentation updated
- [ ] Code reviewed and approved

---

**Source Documents**:
- PRD Section 6.2.7: User Activity & Audit Logs

**Last Updated**: February 13, 2026  
**Status**: Pending Review
