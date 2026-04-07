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

**As a** Transport Planner  
**I want to** register and manage driver profiles  
**So that** only verified drivers operate vehicles and driver availability is tracked for efficient assignment

## Business Context

Drivers are critical fleet resources. Proper driver management ensures compliance (valid licenses/permits), safety (experience tracking), availability visibility, and performance accountability.

## Acceptance Criteria

### AC-1: Driver Registration
- [ ] Multi-step registration form: Personal Info → Contact & Emergency → License & Certs → Employment → Documents → Review
- [ ] Mandatory fields: Full Name, National ID (unique), DOB, Phone (unique), Emergency Contacts (min 2), Driving License Number (unique), License Type, License Issue/Expiry Dates, Driver Type (Permanent/Temporary/Own/Vendor)
- [ ] Upload: Experience Certificate, Medical Certificate, Training Records (PDF/JPG/PNG, max 5MB)
- [ ] Age warning (< 21 or > 65) — not blocking
- [ ] Draft save support

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
| MDM-06-1 | Driver model + migration (Driver, DriverDocument, DriverLeave tables) | DFS-022-1 | Pending |
| MDM-06-2 | Driver CRUD API (POST, GET list, GET detail, PATCH, status change) | DFS-022-2 | Pending |
| MDM-06-3 | Unique constraint validation: NID, Phone, License Number | DFS-022-3 | Pending |
| MDM-06-4 | Document upload API — file storage, metadata, expiry tracking | DFS-022-4 | Pending |
| MDM-06-5 | Document expiry alert — daily cron job, 30-day threshold, notify Fleet Manager | DFS-022-5 | Pending |
| MDM-06-6 | Driver state tracking — auto-update on trip assignment/completion | DFS-022-6 | Pending |
| MDM-06-7 | Leave management API (mark On Leave with start/end dates) | DFS-022-7 | Pending |
| MDM-06-8 | Attendance entry (manual input: POI, entry/exit datetime) | DFS-022-8 | Pending |
| MDM-06-9 | CSV bulk upload with template and row-level error reporting | DFS-022-9 | Pending |
| MDM-06-10 | Driver list UI (search, filter by Status/Type/Expiry, sortable) | DFS-022-10 | Pending |
| MDM-06-11 | Driver profile view — tabs: Overview, Trip History, Documents, Performance | DFS-022-11 | Pending |

## API Endpoints

```
POST   /api/v1/drivers
GET    /api/v1/drivers?status=Available&employment_type=&search=
GET    /api/v1/drivers/available
GET    /api/v1/drivers/{driver_id}
PATCH  /api/v1/drivers/{driver_id}
PATCH  /api/v1/drivers/{driver_id}/status
POST   /api/v1/drivers/{driver_id}/documents
GET    /api/v1/drivers/{driver_id}/documents
POST   /api/v1/drivers/{driver_id}/leave
GET    /api/v1/drivers/{driver_id}/performance
GET    /api/v1/drivers/expiring-licenses?days=30
POST   /api/v1/drivers/bulk-upload
GET    /api/v1/drivers/bulk-upload/template
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
