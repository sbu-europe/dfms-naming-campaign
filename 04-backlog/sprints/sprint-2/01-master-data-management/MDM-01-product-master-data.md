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
- [ ] When creating a new product, category and sub-category must be selected from dropdown options and are required fields.

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

## Data Dictionary

### Product Master Data Fields

| Field Name | Field Type | Required | Remarks |
|---|---|---|---|
| Product Type (RM / FG) | Dropdown (Pre-defined) | Yes | |
| Product Category Name | Dropdown (Pre-defined) | Yes | |
| Product Sub-Category Name (If available) | Dropdown (Pre-defined) | Yes | |
| Product SKU Code | Text Input | Yes | |
| Product Item Code | Text Input | Yes | |
| Product Name | Text Input | Yes | |
| Product Description | Text Input | No | |
| Unit of Measure (UOM) | Dropdown (Pre-defined) | Yes | Bag, Ton, KG, Liters, Pieces, Cartons |
| Weight Per Unit (Pack Size) | Number input | Yes | (Conditional Required Field) 25 KG Bag, 50 KG Bag, etc. If UOM is Tons (Meant Bulk unit), Weight per unit (pack size) input will be optional |
| Standard Pack Size | Text Input | No | Pellet, Mash, Drum |
| Barcode/EAN Code | Text Input | No | |
| Manufacturer Name | Text Input | No | |
| Volume | Text Input | No | |
| Special Handling Requirements | Text Input | No | |
| Product Status | Checkmark (Is Active?) | Yes | |
| Preferred Vehicle Body Type | Dropdown (Pre-defined) | No | Open Body, Closed Body, Container, Flatbed, Tanker, Refrigerated |
| Requires QC | Checkmark (Is Active?) | Yes | |

### Product Category Creation Fields

| Field Name | Field Type | Required | Remarks |
|---|---|---|---|
| Product Type (RM / FG) | Dropdown (Pre-defined) | Yes | |
| Product Category Code | Text Input | Yes | |
| Product Category Name | Text Input | Yes | |
| Product Category Status | Checkmark (Is Active?) | Yes | |
| Sub-Category Code | Text Input | Yes | |
| Sub-Category Name | Text Input | Yes | |
| Sub-Category Status | Checkmark (Is Active?) | Yes | |

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| MDM-01-1 | Requirements & story update on context repo | DFS-156 | Pending |
| MDM-01-2 | Implementation Context Generation | DFS-157 | Pending |
| MDM-01-3 | Models update & Migration | DFS-158 | Pending |
| MDM-01-4 | Admin view implementation | DFS-159 | Pending |
| MDM-01-5 | API Endpoints Implementation | DFS-160 | Pending |
| MDM-01-6 | Bulk Import/Export CSV | DFS-161 | Pending |
| MDM-01-7 | Unit Testing | DFS-162 | Pending |

## API Endpoints

```
### Products
POST   /api/v1/products
GET    /api/v1/products?search=&product_type=&category=&sub_category=&status=&page=&per_page=
GET    /api/v1/products/{product_id}
PUT    /api/v1/products/{product_id}
PATCH  /api/v1/products/{product_id}/status
GET    /api/v1/products/{product_id}/audit-trail

### Bulk Operations
POST   /api/v1/products/import-csv
GET    /api/v1/products/export-csv

### Product Categories
POST   /api/v1/product-categories
GET    /api/v1/product-categories?product_type=&status=
GET    /api/v1/product-categories/{category_id}
PUT    /api/v1/product-categories/{category_id}
PATCH  /api/v1/product-categories/{category_id}/status

### Product Sub-Categories
POST   /api/v1/product-categories/{category_id}/sub-categories
GET    /api/v1/product-categories/{category_id}/sub-categories?status=
GET    /api/v1/product-sub-categories/{sub_id}
PUT    /api/v1/product-sub-categories/{sub_id}
PATCH  /api/v1/product-sub-categories/{sub_id}/status
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
