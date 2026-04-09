---
jira_key: DFS-019
jira_type: Story
jira_epic: DFS-020
jira_sprint: "Sprint 2"
story_id: US-047
title: Vendor Master Data Configuration (Admin CRUD & Bulk Upload)
epic: Master Data Management
status: Pending
story_points: 5
assignee: ~
spec_file: ../../../../stories/US-047-vendor-master-data.md
---

# MDM-03 — Vendor Master Data Configuration (Admin CRUD & Bulk Upload)

## User Story

**As a** Tenant Admin  
**I want to** register and manage vendor master records (CRUD) and bulk upload vendor data via CSV  
**So that** all vendor-dependent DFMS workflows (TR/TO assignment, bidding, trip execution) operate from a consistent, accurate, and auditable vendor data foundation

## Business Context

Vendor master data is a prerequisite for all vendor operations. This story covers internal admin-side management — creating, reading, updating, and deactivating vendor entities — and bulk onboarding via CSV import.

**Note**: Distinct from US-027 (Vendor Registration & Verification Workflow), which covers the external-facing self-registration portal. US-047 establishes the data foundation first.

**Vendor Types**: Contractual (direct assignment, no bidding) and Non-Contractual (eligible for bidding).

## Acceptance Criteria

### AC-1: Vendor Master Setup
- [ ] Transport Vendors setup menu under Master Data Configuration (Tenant Admin / Super Admin only)
- [ ] Vendor record captures: Company Name, Company Type, Registration Number, Vendor Type (Contractual/Non-Contractual), Contact (Address, City, Phone, Email), Compliance Docs (Trade License, BIN, TIN), Fleet Info, Status
- [ ] Auto-generate UUID for each vendor
- [ ] Duplicate detection (same Trade License or TIN) with warning before creation
- [ ] Draft save support
- [ ] Only Active vendors available for selection in TR/TO/Trip workflows

### AC-2: Vendor List View (READ)
- [ ] List with: Company Name, Vendor Type, Status, Trade License, Phone, Created Date
- [ ] Quick search, advanced filters (Status, Type, Date range), column sorting, pagination (25/50/100)

### AC-3: Inline & Form Editing (UPDATE)
- [ ] Inline editing for simple fields; full form for complex updates
- [ ] Confirmation dialog for critical field changes (e.g., vendor type change)
- [ ] Audit log on every update: User ID, Timestamp, Field, Old → New value

### AC-4: Deactivation & Delete (DELETE)
- [ ] Soft delete (default): Mark Inactive, preserve record
- [ ] Hard delete: Super Admin only with two-step confirmation; blocked if vendor referenced in TR/TO/Trip/QC
- [ ] Dependency warning on soft delete if vendor has active TOs

### AC-5: Bulk Upload
- [ ] CSV bulk upload (UTF-8), append-only
- [ ] Downloadable CSV template with mandatory fields marked
- [ ] Row-level validation with error report per row

### AC-6: Inline Editing Post-Upload
- [ ] Row-level and column-level inline editing after upload
- [ ] All inline edits audit logged

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| MDM-03-1 | Vendor model + migration (company, contact, compliance, fleet, status fields) | DFS-019-1 | Pending |
| MDM-03-2 | Vendor CRUD API (create, list, detail, update, soft/hard delete, status patch) | DFS-019-2 | Pending |
| MDM-03-3 | Duplicate detection for Trade License and TIN pre-save | DFS-019-3 | Pending |
| MDM-03-4 | Vendor type validation — block type change if vendor has active TOs | DFS-019-4 | Pending |
| MDM-03-5 | Hard delete dependency check (TR/TO/Trip/QC referential check) | DFS-019-5 | Pending |
| MDM-03-6 | CSV bulk upload — template download, upload endpoint, append-only, row-level errors | DFS-019-6 | Pending |
| MDM-03-7 | Inline editing with audit logging | DFS-019-7 | Pending |
| MDM-03-8 | Vendor list UI with search, filter, sort, pagination | DFS-019-8 | Pending |
| MDM-03-9 | Add/Edit vendor form with draft save | DFS-019-9 | Pending |

## API Endpoints

```
POST   /api/v1/vendors
GET    /api/v1/vendors?status=ACTIVE&type=NON_CONTRACTUAL&page=1
GET    /api/v1/vendors/{vendor_id}
PATCH  /api/v1/vendors/{vendor_id}
PATCH  /api/v1/vendors/{vendor_id}/status
DELETE /api/v1/vendors/{vendor_id}
GET    /api/v1/vendors/bulk-upload/template
POST   /api/v1/vendors/bulk-upload
GET    /api/v1/vendors/{vendor_id}/audit-log
```

## Dependencies

- **Requires**: US-004 Role Hierarchy (RBAC)
- **Enables**: US-027 (Vendor Registration Workflow), US-024 (Bidding Portal), US-019 (TO Execution — Vendor Fleet)

## Definition of Done

- [ ] Vendor CRUD fully functional (create, read, update, soft/hard delete)
- [ ] Inline editing with audit log
- [ ] CSV bulk upload with template and row-level error reporting
- [ ] Active/Inactive control enforced in assignment workflows
- [ ] Referential integrity checks on delete
- [ ] Unit tests > 85%
- [ ] UAT approved by Tenant Admin persona
