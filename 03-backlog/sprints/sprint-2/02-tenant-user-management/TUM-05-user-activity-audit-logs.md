---
jira_key: DFS-028
jira_type: Story
jira_epic: DFS-029
jira_sprint: "Sprint 2"
story_id: US-009
title: User Activity & Audit Logs
epic: Tenant User Management
status: Pending
story_points: 8
assignee: ~
spec_file: ../../../../stories/US-009-user-activity-audit-logs.md
---

# TUM-05 — User Activity & Audit Logs

## User Story

**As a** Security Admin  
**I want to** track all user activities  
**So that** I can ensure security and compliance

## Business Context

Comprehensive audit logging is critical for security monitoring, incident investigation, regulatory compliance, user accountability, and forensic analysis. All user actions must be logged with sufficient detail.

## Acceptance Criteria

### AC-1: Authentication Event Logging
- [ ] Log: Login (success/failure), Logout, Password reset, Failed login attempts, Account lockout, Session timeout
- [ ] Each log includes: User ID, Event Type, Timestamp, IP, Device ID, User Agent, Location, Status, Failure Reason

### AC-2: User Action Logging
- [ ] Log all CRUD: Create (entity type, ID, created data), Read (entity type, ID, access time), Update (entity type, ID, old → new values), Delete (entity type, ID, deleted data)

### AC-3: OTP Operation Logging
- [ ] Log: OTP generation (User ID, operation type, delivery method), OTP verification (User ID, status, attempts), OTP resend (User ID, count)

### AC-4: Log Storage
- [ ] Immutable logs — no modification or deletion
- [ ] Minimum 2-year retention
- [ ] Log archival for long-term retention
- [ ] Log encryption at rest

### AC-5: Audit Dashboard
- [ ] Admin dashboard with real-time feed
- [ ] Filters: Date range, User, Event Type, Status, IP Address
- [ ] Full-text search
- [ ] Export: CSV + JSON

### AC-6: Access Control
- [ ] Only Security Admin and Tenant Admin can access audit logs
- [ ] Log access itself must be logged

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| TUM-05-1 | AuditLog model + immutable storage backend | DFS-028-1 | Pending |
| TUM-05-2 | Authentication event logger (login, logout, failed attempts, lockout, session timeout) | DFS-028-2 | Pending |
| TUM-05-3 | CRUD action logger middleware / mixin — entity type, ID, before/after values | DFS-028-3 | Pending |
| TUM-05-4 | OTP operation logger — generation, verification, resend events | DFS-028-4 | Pending |
| TUM-05-5 | Log retention policy — 2-year minimum, archival job | DFS-028-5 | Pending |
| TUM-05-6 | Log encryption at rest | DFS-028-6 | Pending |
| TUM-05-7 | Audit log API — GET list (paginated, filterable), GET detail, POST export | DFS-028-7 | Pending |
| TUM-05-8 | Audit dashboard UI — real-time feed, filters, search, export | DFS-028-8 | Pending |
| TUM-05-9 | RBAC gate on log access + log-the-log-access | DFS-028-9 | Pending |

## API Endpoints

```
GET   /api/v1/admin/audit-logs?user_id=&event_type=&status=&date_from=&date_to=&ip=&page=&limit=
GET   /api/v1/admin/audit-logs/{log_id}
POST  /api/v1/admin/audit-logs/export        # CSV or JSON export
GET   /api/v1/admin/audit-logs/statistics    # Summary stats by type/user
```

## Non-Functional Requirements

- Log write latency < 50ms (must not impact operations)
- Support 10M+ log entries per tenant
- Support 1000+ log writes/second
- 99.9% availability for logging service

## Dependencies

- **Requires**: Database, Encryption service, US-004 Role Hierarchy (RBAC)
- **Feeds**: Security monitoring, compliance reporting

## Definition of Done

- [ ] Authentication event logging implemented across all auth flows
- [ ] CRUD operation logging via reusable middleware
- [ ] OTP operation logging
- [ ] Immutable log storage with 2-year retention and archival
- [ ] Audit dashboard with filters, search, export
- [ ] RBAC gate on log access
- [ ] Unit tests > 80%
- [ ] UAT: Security Admin can search and export audit logs
