---
jira_key: DFS-017
jira_type: Story
jira_epic: DFS-020
jira_sprint: "Sprint 2"
story_id: US-095
title: Product Master Data Management (CRUD)
epic: Master Data Management
status: Pending
story_points: 13
assignee: ~
spec_file: ../../../../stories/US-095-product-master-data-management.md
---

# MDM-01 — Product Master Data Management (CRUD)

## User Story

**As a** Tenant Admin  
**I want to** define and manage product master data (Finished Goods and Raw Materials)  
**So that** all transport, QC, requisition, and costing workflows use standardized and accurate product information

## Business Context

Product Master Data is the **foundational data** for the entire DFMS platform. Blocks 20+ downstream stories. Must complete before requisitions start in Sprint 3.

**Product Types**: Finished Goods (FG) — Broiler/Layer/Fish/Cattle Feed, DOC, Packaging. Raw Materials (RM) — Grain, Protein, Vitamins, Additives.

## Acceptance Criteria

### AC-1: Product CRUD
- [ ] Create, edit, view, and deactivate products (no hard delete)
- [ ] Two product types: Finished Goods (FG) and Raw Materials (RM)
- [ ] Unique Product Code/SKU per tenant
- [ ] Unique Product Name per tenant
- [ ] Activating/deactivating products preserves history

### AC-2: Product Attributes
- [ ] Product Code/SKU, Name, Type, Category, Sub-Category, UOM, Standard Weight, Packing Type, Pack Size, Description, Barcode, Manufacturer, Status

### AC-3: Transport Configuration per product
- [ ] Vehicle Type Compatibility, Special Handling, Stackable, Max Stack Height, Load Type

### AC-4: QC Configuration per product
- [ ] Requires QC, QC Checklist, Sampling Required, Auto-Pass Eligible, Lab Test Required

### AC-5: Status Enforcement
- [ ] Inactive products cannot be selected in new requisitions, TOs, or QC tests
- [ ] Historical references to inactive products remain read-only

### AC-6: Audit Trail
- [ ] Log all create, update, and status change operations with user + timestamp + changed fields

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| MDM-01-1 | Product model + Django migration (Product, ProductAuditLog tables) | DFS-017-1 | Pending |
| MDM-01-2 | Product CRUD API endpoints (POST, GET list, GET detail, PUT, PATCH status) | DFS-017-2 | Pending |
| MDM-01-3 | Validation: unique code/name per tenant, required fields, UOM-weight rule | DFS-017-3 | Pending |
| MDM-01-4 | Transport config JSONB field — vehicle compatibility, special handling, load type | DFS-017-4 | Pending |
| MDM-01-5 | QC config JSONB field — requires_qc, checklist link, sampling, auto-pass, lab test | DFS-017-5 | Pending |
| MDM-01-6 | Audit trail logging on every create/update/status-change | DFS-017-6 | Pending |
| MDM-01-7 | Product list UI — search, filter by type/category/status, pagination | DFS-017-7 | Pending |
| MDM-01-8 | Product create/edit form — 3-tab layout (Basic Info, Transport Config, QC Config) | DFS-017-8 | Pending |
| MDM-01-9 | Deactivation warning modal — show active references before status change | DFS-017-9 | Pending |
| MDM-01-10 | Inactive product gate — filter out inactive from all dependent workflow dropdowns | DFS-017-10 | Pending |

## API Endpoints

```
POST   /api/v1/products
GET    /api/v1/products?search=&product_type=&category=&status=&page=&per_page=
GET    /api/v1/products/{product_id}
PUT    /api/v1/products/{product_id}
PATCH  /api/v1/products/{product_id}/status
GET    /api/v1/products/{product_id}/audit-trail
```

## Dependencies

- **Blocks**: US-010, US-011, US-012, US-013, US-044, US-046, US-059 (all depend on product catalog)

## Definition of Done

- [ ] Product CRUD APIs implemented and tested
- [ ] Transport and QC configuration working
- [ ] Status management with inactive gate enforced
- [ ] Audit trail logging all operations
- [ ] Unit tests > 80%
- [ ] UAT: Tenant Admin can create 20+ products (FG & RM)
