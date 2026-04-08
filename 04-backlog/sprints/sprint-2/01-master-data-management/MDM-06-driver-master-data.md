---
jira_key: DFS-022
jira_type: Story
jira_epic: DFS-020
jira_sprint: "Sprint 2"
story_id: US-057
title: Driver Master Data Management
epic: Master Data Management
status: Pending
story_points: 5
assignee: ~
spec_file: ../../../../stories/US-057-driver-master-data.md
---

# MDM-06 — Driver Master Data Management

## User Story

**As a** Transport Planner or Tenant Admin  
**I want to** register and manage driver profiles  
**So that** only verified drivers operate vehicles and driver availability is tracked for efficient assignment

## Business Context

Drivers are critical fleet resources. Proper driver management ensures compliance (valid licenses/permits), safety (experience tracking), availability visibility, and performance accountability.

## Acceptance Criteria

### AC-1: Driver Registration
- [ ] Driver master data configuration fields:

| Field Name | Field Type | Required | Remarks |
|---|---|---|---|
| Employee ID | Text Input | Yes | |
| Full Name | Text Input | Yes | |
| Contact Number | Text Input | Yes | |
| Driving License Number | Text Input | Yes | |
| License Type | Text Input | Yes | |
| License Expiry Date | Date | Yes | |
| National ID Number | Text Input | No | |
| Driver Type (Permanent / Temporary) | Dropdown (Pre-defined) | Yes | |
| Experience Certificate | Attachment (JPG, JPEG, PNG, PDF) | No | |
| Biodata | Attachment (JPG, JPEG, PNG, PDF) | No | |
| Reference Contact 1 | Text Input | No | |
| Reference Contact 2 | Text Input | No | |
| Accident History | Text Input | No | |
| Medical Certificate | Attachment (JPG, JPEG, PNG, PDF) | No | |
| Last Training / Assessment Information | Text Input | No | |
| Address | Text Input | No | |
| Driver Status | Checkmark (Is Active?) | Yes | |

### AC-2: Driver-Vehicle Assignment
- [ ] Assign/reassign driver to vehicle
- [ ] Only Available, active drivers assignable; no multiple concurrent active assignments
- [ ] Assignment history retained (Driver ID, Vehicle ID, Start/End, Assigned By)
- [ ] Auto-unassign driver upon trip completion

### AC-3: Driver State Tracking
- [ ] States: Available (default), Assigned, On Leave
- [ ] State updates based on trip assignment, trip start/completion, manual attendance
- [ ] Driver state exposed in trip planning, vehicle assignment, dispatch boards

### AC-4: Availability & Attendance
- [ ] Manual attendance entry (Driver, POI, Entry/Exit Date-Time)
- [ ] Supervisor can mark On Leave with start/end dates
- [ ] Max working hours configurable (default: 12 hours)

### AC-5: Document Expiry Alerts
- [ ] 30-day expiry alerts for license, medical certificate, route permits
- [ ] Daily cron job for expiry checks

### AC-6: Performance Tracking
- [ ] Track: Total trips, On-time delivery %, Incident count, Average rating, Fuel efficiency, Last trip date

### AC-7: Bulk Upload
- [ ] CSV bulk upload with template (append-only, row-level errors, audit logged)

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| MDM-06-1 | Requirements & story update on context repo | DFS-228 | Pending |
| MDM-06-2 | Implementation context generation | DFS-229 | Pending |
| MDM-06-3 | Models update & migration | DFS-230 | Pending |
| MDM-06-4 | Admin view implementation | DFS-231 | Pending |
| MDM-06-5 | API Endpoints Implementation | DFS-232 | Pending |
| MDM-06-6 | Bulk Driver Import/Export CSV | DFS-233 | Pending |
| MDM-06-7 | User Invitation(Driver) | DFS-234 | Pending |
| MDM-06-8 | Unit Testing | DFS-235 | Pending |

## API Endpoints

```text
POST   /api/v1/drivers
GET    /api/v1/drivers?status=Available&driver_type=&search=&page=1&limit=10
GET    /api/v1/drivers/{driver_id}
PATCH  /api/v1/drivers/{driver_id}
PATCH  /api/v1/drivers/{driver_id}/status
POST   /api/v1/drivers/{driver_id}/documents
GET    /api/v1/drivers/{driver_id}/documents
DELETE /api/v1/drivers/{driver_id}/documents/{document_id}
POST   /api/v1/drivers/{driver_id}/leave
GET    /api/v1/drivers/{driver_id}/performance
GET    /api/v1/drivers/expiring-documents?days=30
POST   /api/v1/drivers/import
GET    /api/v1/drivers/import/template
```

## Dependencies

- **Requires**: US-004 Role Hierarchy (RBAC)
- **Enables**: US-020 (TO Execution — Own Fleet), US-052 (Driver Mobile Interface)

## Definition of Done

- [ ] Driver CRUD with multi-step form
- [ ] Document upload and expiry tracking with daily cron alert
- [ ] State management (Available, On Trip, On Leave)
- [ ] Driver-vehicle assignment with history
- [ ] CSV bulk upload with row-level errors
- [ ] Unit tests > 85%
- [ ] UAT: Fleet Manager sign-off
