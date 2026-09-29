---
jira_key: DFS-018
jira_type: Story
jira_epic: DFS-020
jira_sprint: "Sprint 2"
story_id: US-096
title: Supplier & Dealer Master Data Configuration
epic: Master Data Management
status: Pending
story_points: 3
assignee: ~
spec_file: US-096-route-supplier-dealer-master-data.md
---

# MDM-02 — Supplier & Dealer Master Data Configuration

## User Story

**As a** Tenant Admin  
**I want to** register and manage Suppliers and Dealers as master data records  
**So that** Gate Management can correctly identify supplier and dealer parties during inbound/outbound operations

## Business Context

- **Suppliers**: Raw material providers — Gate Management needs verified supplier records for inbound on-demand TOs (US-065)
- **Dealers**: Finished goods distributors — Gate Management needs verified dealer records for outbound on-demand TOs (US-064)

## Acceptance Criteria

### AC-1: Supplier Master (per PRD 6.3.1)
- [ ] System SHALL provide a Suppliers setup menu under Master Data Configuration
- [ ] Admin SHALL be able to create a Supplier with:
  - Supplier Code (Text Input, required, unique)
  - Supplier Name (Text Input, required, not unique within tenant)
  - Contact Number (Text Input, required)
  - Email (Email format, optional)
  - Address (Text Input, required)
  - Supplier Status (Checkmark, Is Active?, required)
- [ ] Only Active suppliers SHALL be selectable in gate on-demand TO creation (US-065)
- [ ] Bulk CSV upload SHALL be supported for suppliers

### AC-2: Dealer Master (per PRD 6.3.1)
- [ ] System SHALL provide a Dealers setup menu under Master Data Configuration
- [ ] Admin SHALL be able to create a Dealer with:
  - Dealer Code (Text Input, required, unique)
  - Dealer Name (Text Input, required, not unique within tenant)
  - Contact Number (Text Input, required)
  - Email (Email Format, optional)
  - Address (Text Input, required)
  - Dealer Status (Checkmark, Is Active?, required)
- [ ] Only Active dealers SHALL be selectable in gate on-demand TO creation (US-064)
- [ ] Bulk CSV upload SHALL be supported for dealers

### AC-3: Shared CRUD Behaviour (per PRD 6.3.3)
- [ ] Paginated list view with search, sort, and filter by Status for both entities (Suppliers, Dealers)
- [ ] Inline editing for simple fields
- [ ] Full edit form for all fields
- [ ] Soft delete (mark Inactive) with dependency check
- [ ] Hard delete blocked if entity is referenced in any TR / TO / Trip / Gate record
- [ ] Audit log entry on every create, update, and deactivate: User ID, Timestamp, Field, Old value, New value

### AC-4: Bulk Upload (per PRD 6.3.2)
- [ ] System SHALL provide bulk CSV upload for Suppliers and Dealers
- [ ] System SHALL provide a downloadable CSV template per entity with mandatory fields marked
- [ ] Bulk upload SHALL be append-only (no overwrite of existing records)
- [ ] Row-level validation with error report (successful rows, failed rows with reason)
- [ ] All bulk upload actions SHALL be audit logged

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| MDM-02-1 | Requirements & story update on context repo | DFS-176 | Pending |
| MDM-02-2 | Implementation Context Generation | DFS-177 | Pending |
| MDM-02-3 | Models update & migration | DFS-178 | Pending |
| MDM-02-4 | Admin view implementation | DFS-179 | Pending |
| MDM-02-5 | API Endpoint implementations | DFS-180 | Pending |
| MDM-02-6 | Bulk Import/Export CSV | DFS-181 | Pending |
| MDM-02-7 | Unit Testing | DFS-182 | Pending |

## API Endpoints

```
POST   /api/v1/suppliers
GET    /api/v1/suppliers?status=Active&search=
GET    /api/v1/suppliers/{supplier_id}
PATCH  /api/v1/suppliers/{supplier_id}
DELETE /api/v1/suppliers/{supplier_id}
POST   /api/v1/suppliers/bulk-upload
GET    /api/v1/suppliers/bulk-upload/template

POST   /api/v1/dealers
GET    /api/v1/dealers?status=Active&search=
GET    /api/v1/dealers/{dealer_id}
PATCH  /api/v1/dealers/{dealer_id}
DELETE /api/v1/dealers/{dealer_id}
POST   /api/v1/dealers/bulk-upload
GET    /api/v1/dealers/bulk-upload/template
```

## Dependencies

- **Requires**: US-004 Role Hierarchy (RBAC)
- **Enables**: US-064 (Dealer Entry), US-065 (Supplier Entry), US-015–US-020 (TO Management), US-059 (Trip Costing)

## Definition of Done

- [ ] Supplier and Dealer CRUD fully functional
- [ ] List views with search, filter by Status, and sortable columns
- [ ] Bulk CSV upload with templates and row-level error reporting
- [ ] Active/Inactive control enforced in dependent workflows
- [ ] Hard delete restriction working
- [ ] Unit tests > 85%
- [ ] UAT: Tenant Admin sign-off