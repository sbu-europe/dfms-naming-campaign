---
jira_key: DFS-018
jira_type: Story
jira_epic: DFS-020
jira_sprint: "Sprint 2"
story_id: US-096
title: Route, Supplier & Dealer Master Data Configuration
epic: Master Data Management
status: Pending
story_points: 5
assignee: ~
spec_file: ../../../../stories/US-096-route-supplier-dealer-master-data.md
---

# MDM-02 — Route, Supplier & Dealer Master Data Configuration

## User Story

**As a** Tenant Admin  
**I want to** register and manage Routes, Suppliers, and Dealers as master data records  
**So that** Transport Orders can reference valid routes, and Gate Management can correctly identify supplier and dealer parties during operations

## Business Context

- **Routes**: Used by TOs to define source-to-destination paths, distance, and duration
- **Suppliers**: Raw material providers — Gate Management needs verified supplier records for inbound on-demand TOs (US-065)
- **Dealers**: Finished goods distributors — Gate Management needs verified dealer records for outbound on-demand TOs (US-064)

**Dependency**: Requires US-097 (POI Management) — Routes reference POIs as foreign keys.

## Acceptance Criteria

### AC-1: Route Master
- [ ] Create Route with: Name, Source POI, Destination POI, Distance (KM), Estimated Duration, Route Type (One-Way/Round-Trip), Status
- [ ] Route must map to valid active POIs (referential integrity)
- [ ] Only Active routes selectable in TO creation
- [ ] Cannot delete routes referenced in active TOs or Trips

### AC-2: Supplier Master
- [ ] Create Supplier with: Name, Code (unique), Contact Person, Phone, Email, Address, Status
- [ ] Only Active suppliers selectable in gate on-demand TO creation (US-065)

### AC-3: Dealer Master
- [ ] Create Dealer with: Name, Code (unique), Contact Person, Phone, Email, Address, Status
- [ ] Only Active dealers selectable in gate on-demand TO creation (US-064)

### AC-4: Shared CRUD Behaviour
- [ ] Paginated list with search, sort, filter by Status for all three entities
- [ ] Inline and full-form editing
- [ ] Soft delete with dependency check; hard delete blocked if referenced in TR/TO/Trip/Gate
- [ ] Audit log on every create, update, and deactivate

### AC-5: Bulk Upload
- [ ] CSV bulk upload for Routes, Suppliers, and Dealers
- [ ] Downloadable CSV template per entity
- [ ] Append-only (no overwrite of existing records)
- [ ] Row-level validation with error report

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| MDM-02-1 | Route, Supplier, Dealer models + migrations | DFS-018-1 | Pending |
| MDM-02-2 | Route CRUD API with POI referential integrity validation | DFS-018-2 | Pending |
| MDM-02-3 | Supplier CRUD API | DFS-018-3 | Pending |
| MDM-02-4 | Dealer CRUD API | DFS-018-4 | Pending |
| MDM-02-5 | Bulk CSV upload + downloadable template for all three entities | DFS-018-5 | Pending |
| MDM-02-6 | Inline editing with audit logging | DFS-018-6 | Pending |
| MDM-02-7 | Dependency check on delete (block hard delete if referenced in TO/Trip/Gate) | DFS-018-7 | Pending |
| MDM-02-8 | List UI with search, filter, sort, pagination for Routes / Suppliers / Dealers | DFS-018-8 | Pending |

## API Endpoints

```
POST/GET/PATCH/DELETE  /api/v1/routes
POST/GET/PATCH/DELETE  /api/v1/suppliers
POST/GET/PATCH/DELETE  /api/v1/dealers
POST  /api/v1/{entity}/bulk-upload
GET   /api/v1/{entity}/bulk-upload/template
```

## Dependencies

- **Requires**: [US-097 / MDM-04 — POI Management](../03-poi-management/MDM-04-poi-management-geofencing.md) (Routes FK to POI)
- **Enables**: US-064 (Dealer Entry), US-065 (Supplier Entry), US-015–US-020 (TO Management), US-059 (Trip Costing)

## Definition of Done

- [ ] Route, Supplier, Dealer CRUD fully functional
- [ ] Bulk CSV upload with templates and row-level error reporting
- [ ] Active/Inactive control enforced in dependent workflows
- [ ] Hard delete restriction working
- [ ] Unit tests > 85%
- [ ] UAT approved
