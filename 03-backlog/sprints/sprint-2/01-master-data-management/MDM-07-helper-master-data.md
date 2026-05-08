---
jira_key: DFS-023
jira_type: Story
jira_epic: DFS-020
jira_sprint: "Sprint 2"
story_id: US-061
title: Helper Master Data Management
epic: Master Data Management
status: Pending
story_points: 3
assignee: ~
spec_file: ../../../../05-modules/12-users/helper-master-data.md
---

# MDM-07 — Helper Master Data Management

## User Story

**As a** Transport Distribution Officer (TDO) or Tenant Admin  
**I want to** register and manage helper profiles and assign helpers to drivers  
**So that** trips are carried out with the required supporting personnel

## Business Context

Helpers assist drivers with loading, unloading, and handling goods. Proper helper management ensures operational efficiency, product safety, and availability tracking for trip assignments.

## Acceptance Criteria

### AC-1: Helper Registration
- [ ] Create helper profile with the following attributes:

| Field Name | Field Type | Required | Remarks |
|---|---|---|---|
| Employee ID | Text Input | Yes | |
| Full Name | Text Input | Yes | |
| Contact Number | Text Input | Yes | |
| National ID Number | Text Input | No | National ID Number |
| Reference Contact 1 | Text Input | No | |
| Reference Contact 2 | Text Input | No | |
| Helper Status | Checkmark (Is Active?) | Yes | |
| Address | Text Input | No | |
| Linked User (`user_id`) | FK / lookup | No | Optional link to platform User when this helper is also a system user; unique per tenant when set |

- [ ] Prevent duplicate Employee ID and Contact Number
- [ ] Prevent duplicate National ID Number (NID) per tenant (if provided)
- [ ] Draft save and profile updates with audit logging

### AC-2: Helper Assignment to Driver
- [ ] Assign one or more helpers to a driver (many-to-one mapping)
- [ ] Assignment linked to trip — cannot assign helper to conflicting active trips
- [ ] Assignment history retained per trip (Driver ID, Vehicle ID, Trip/TO)

### AC-3: Helper Availability
- [ ] Status: Available, On Trip, On Leave, Terminated
- [ ] Auto-update status on trip assignment/completion
- [ ] Mark helper On Leave (manual)

### AC-4: Helper Performance
- [ ] Track: Total trips, Last trip date, Incident count

### AC-5: Bulk Upload
- [ ] CSV bulk upload with template (append-only, row-level errors, audit logged)
- [ ] Inline row and column editing

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| MDM-07-1 | Helper model + migration (Helper with nullable `user_id` FK, HelperAssignment tables) | DFS-023-1 | Pending |
| MDM-07-2 | Helper CRUD API (POST, GET list, GET detail, PATCH, status change) | DFS-023-2 | Pending |
| MDM-07-3 | Unique Employee ID, Contact Number, and NID (per tenant) validation | DFS-023-3 | Pending |
| MDM-07-4 | Helper assignment API — link helper to driver + trip, conflict check | DFS-023-4 | Pending |
| MDM-07-5 | Status auto-update on trip assignment and completion | DFS-023-5 | Pending |
| MDM-07-6 | Leave marking API | DFS-023-6 | Pending |
| MDM-07-7 | CSV bulk upload with template and row-level error reporting | DFS-023-7 | Pending |
| MDM-07-8 | Helper list UI with search, filter (Status, Employment Type) | DFS-023-8 | Pending |

## API Endpoints

```
POST   /api/v1/helpers
GET    /api/v1/helpers?status=Available
GET    /api/v1/helpers/available
GET    /api/v1/helpers/{helper_id}
PATCH  /api/v1/helpers/{helper_id}
PATCH  /api/v1/helpers/{helper_id}/status
POST   /api/v1/helpers/bulk-upload
GET    /api/v1/helpers/bulk-upload/template
PATCH  /api/v1/helpers/{id}  (inline field edit)
```

## Dependencies

- **Requires**: US-004 Role Hierarchy (RBAC)
- **Enables**: US-018 (TO Execution — Own Fleet helper assignment)

## Definition of Done

- [ ] Helper CRUD functional (create, read, update, soft delete)
- [ ] Assignment with conflict check and history
- [ ] Status auto-update on trip events
- [ ] CSV bulk upload with row-level errors
- [ ] Unit tests > 80%
- [ ] UAT approved
