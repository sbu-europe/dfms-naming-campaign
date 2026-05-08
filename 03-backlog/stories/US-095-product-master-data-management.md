---
title: Product Master Data Management (CRUD)
story_id: US-095
phase: phase-1
module: Master Data Management
priority: Critical
status: Pending
epic: Product Inventory Management
epic_id: EPIC-005
epic_name: Product Inventory Management (PIM)
sprint: Sprint 2
story_points: 13
created: 2026-02-27
updated: 2026-02-27
source_documents:
  - ../../../../01-source/01-prd/PRD_DFMS_v1.0.md
  - ../../../05-modules/02-master-data/product-master-data-management.md
  - ../../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-010-port-transfer-requisition.md
  - US-011-distribution-approval.md
  - US-012-procurement-approval.md
  - US-044-qc-lab-testing.md
dependencies: []
blocks:
  - US-010-port-transfer-requisition.md (needs product list)
  - US-011-distribution-approval.md (approves product requisitions)
  - US-012-procurement-approval.md (approves product requisitions)
  - US-044-qc-lab-testing.md (QC tests are product-specific)
tags: [master-data, pim, product-catalog, foundation, critical, sprint-2]
---

# US-095: Product Master Data Management (CRUD)

## User Story

**As a** Tenant Admin  
**I want to** define and manage product master data (Finished Goods and Raw Materials)  
**So that** all transport, QC, requisition, and costing workflows use standardized and accurate product information

## Business Context

Product Master Data is the **foundational data** for the entire DFMS platform. Without a product catalog:
- ❌ Transport Requisitions (US-010, US-011, US-012) cannot specify what to move
- ❌ Quality Control workflows (US-044+) cannot define product-specific tests
- ❌ Trip costing (US-059, US-060) cannot calculate per-product profitability
- ❌ Reporting cannot analyze product-level performance

**Why This Story is Critical**:
- **Blocks 20+ downstream stories** that depend on product data
- **Must be completed in Sprint 1-2** (before requisitions start in Sprint 2)
- **Foundation for operations**: Without products, transport workflows cannot start

### Product Types

**Finished Goods (FG)**:
- Broiler Feed (Starter, Grower, Finisher)
- Layer Feed (Chick, Grower, Layer)
- Fish Feed
- Cattle Feed
- DOC (Day-Old Chicks)
- Packaging materials

**Raw Materials (RM)**:
- Grain (Corn, Wheat, Soybean)
- Protein sources (Fish Meal, Soybean Meal)
- Vitamins and Minerals
- Additives and Premixes

---

## Acceptance Criteria

### AC-1: Product CRUD Operations
- [ ] System SHALL provide Product Master module for creating, editing, viewing, and deactivating products
- [ ] System SHALL support two product types: **Finished Goods (FG)** and **Raw Materials (RM)**
- [ ] System SHALL enforce unique Product Code/SKU per tenant
- [ ] System SHALL allow activating/deactivating products (no deletion, preserve history)
- [ ] System SHALL prevent duplicate product names within the same tenant

### AC-2: Product Attributes (FG & RM)
- [ ] System SHALL capture for ALL products:
  - Product Code/SKU (required, unique, alphanumeric, 3-50 chars)
  - Product Name (required, unique, 3-200 chars)
  - Product Type (FG/RM, required)
  - Category (required, dropdown: Feed, RawMaterial, Packaging, DOC, Other)
  - Sub-Category (optional, dependent on category)
  - Unit of Measure (required: Bag, Ton, Kg, Liter, Piece, Carton)
  - Standard Weight per Unit (required if UOM = Bag/Piece/Carton, 3 decimals)
  - Packing Type (optional: Pallet, Drum, Roll, Bulk)
  - Pack Size (optional, text)
  - Product Description (optional, text)
  - Barcode/EAN Code (optional, alphanumeric)
  - Manufacturer Name (optional, text)
  - Product Status (required: Active, Inactive, Discontinued, Seasonal)

### AC-3: Transport Configuration
- [ ] System SHALL allow configuring transport requirements per product:
  - Vehicle Type Compatibility (multi-select: CoveredTruck, OpenTruck, Tanker, Refrigerated)
  - Special Handling (multi-select: Fragile, Temperature-Sensitive, Hazardous, PestControl)
  - Stackable (Yes/No)
  - Max Stack Height (integer, if stackable)
  - Load Type (Bulk, Bagged, Palletized)

### AC-4: QC Configuration
- [ ] System SHALL allow configuring QC requirements per product:
  - Requires QC (Yes/No)
  - QC Checklist (link to checklist template, if QC required)
  - Sampling Required (Yes/No)
  - Auto-Pass Eligible (Yes/No)
  - Lab Test Required (Yes/No)

### AC-5: Product Status Management
- [ ] System SHALL enforce business rules:
  - Inactive products cannot be selected in new requisitions (US-010/011/012)
  - Inactive products cannot be added to new TOs
  - Inactive products cannot be selected for new QC tests
  - Historical references to inactive products remain intact (read-only)

### AC-6: Audit Trail
- [ ] System SHALL log all product operations:
  - Product created (user, timestamp, all field values)
  - Product updated (user, timestamp, changed fields: old → new)
  - Product status changed (user, timestamp, old status → new status)
  - Audit trail accessible to Tenant Admin and System Admin

---

## Functional Requirements

### FR-001: Product Creation
- [Critical] System SHALL provide "Create Product" form with all fields from AC-2, AC-3, AC-4
- [Critical] System SHALL validate uniqueness of Product Code and Product Name per tenant
- [Critical] System SHALL validate required fields and data formats
- [Critical] System SHALL generate UUID for product_id
- [High] System SHALL support bulk product import via CSV (future enhancement)

### FR-002: Product Editing
- [Critical] System SHALL allow editing all product attributes except Product Code (immutable after creation)
- [Critical] System SHALL validate changes against business rules
- [Critical] System SHALL log all changes in audit trail
- [High] System SHALL prevent editing if product is referenced in active transactions (warning only)

### FR-003: Product Viewing & Search
- [Critical] System SHALL provide searchable product list with filters:
  - Product Code
  - Product Name
  - Product Type (FG/RM)
  - Category
  - Status (Active/Inactive/Discontinued/Seasonal)
- [High] System SHALL support sorting by: Code, Name, Category, Created Date
- [High] System SHALL display product details in modal/drawer on click

### FR-004: Product Status Management
- [Critical] System SHALL allow Tenant Admin to activate/deactivate products
- [Critical] System SHALL prevent deletion of products (soft delete via status only)
- [Critical] System SHALL enforce "Inactive products cannot be used in new transactions" rule
- [High] System SHALL show warning when deactivating product with active references

### FR-005: Category & Sub-Category Management
- [High] System SHALL provide pre-configured category list:
  - Feed (sub: Broiler Feed, Layer Feed, Fish Feed, Cattle Feed)
  - RawMaterial (sub: Grain, Protein, Vitamins, Additives)
  - Packaging (sub: Bags, Boxes, Pallets)
  - DOC (sub: Broiler Chicks, Layer Chicks)
  - Other
- [Medium] System SHALL allow Tenant Admin to add custom sub-categories

---

## Business Rules

### BR-PIM-001: Product Code Uniqueness
- **Rule**: Product Code/SKU must be unique per tenant
- **Enforcement**: Database unique constraint on (tenant_id, product_code)
- **Error**: "Product code already exists"

### BR-PIM-002: Product Name Uniqueness
- **Rule**: Product Name must be unique per tenant
- **Enforcement**: Database unique constraint on (tenant_id, product_name)
- **Error**: "Product name already exists"

### BR-PIM-003: Inactive Product Restriction
- **Rule**: Inactive products cannot be selected in new operational transactions
- **Enforcement**: Application layer validation in requisition, TO, QC forms
- **Error**: "Product is inactive and cannot be used"

### BR-PIM-004: Standard Weight Requirement
- **Rule**: Standard Weight per Unit is mandatory if UOM is Bag, Piece, or Carton
- **Enforcement**: Form validation
- **Error**: "Standard weight is required for this unit of measure"

### BR-PIM-005: Historical Reference Preservation
- **Rule**: Deactivating a product does not affect historical records (requisitions, TOs, QC records)
- **Enforcement**: Application layer - allow read-only access to product data via historical references
- **Note**: No cascading delete or update

---

## Data Model

### Product Entity

```typescript
Product {
  // Identity
  product_id: UUID                // Primary key
  tenant_id: UUID                 // Foreign key to tenants table
  product_code: string            // SKU, unique per tenant, 3-50 chars, alphanumeric
  product_name: string            // Display name, unique per tenant, 3-200 chars
  
  // Classification
  product_type: enum ['FinishedGoods', 'RawMaterial']
  category: string                // Feed, RawMaterial, Packaging, DOC, Other
  sub_category: string (nullable) // Broiler Feed, Layer Feed, etc.
  
  // Physical Attributes
  unit_of_measure: enum ['Bag', 'Ton', 'Kilogram', 'Liter', 'Piece', 'Carton']
  standard_weight_per_unit: Decimal(10,3) (nullable)  // kg, 3 decimals
  pack_size: string (nullable)    // "50kg", "25kg", etc.
  packing_type: enum ['Pallet', 'Drum', 'Roll', 'Bulk'] (nullable)
  
  // Product Details
  description: text (nullable)
  barcode_ean: string (nullable)
  manufacturer: string (nullable)
  product_image_url: string (nullable)
  
  // Transport Configuration (JSONB)
  transport_config: {
    vehicle_type_compatibility: string[]    // ['CoveredTruck', 'OpenTruck']
    special_handling: string[]              // ['Fragile', 'Temperature-Sensitive']
    stackable: boolean
    max_stack_height: Integer (nullable)
    load_type: enum ['Bulk', 'Bagged', 'Palletized']
  }
  
  // QC Configuration (JSONB)
  qc_config: {
    requires_qc: boolean
    qc_checklist_id: UUID (nullable)
    sampling_required: boolean
    auto_pass_eligible: boolean
    lab_test_required: boolean
  }
  
  // Status
  status: enum ['Active', 'Inactive', 'Discontinued', 'Seasonal']
  
  // Audit Metadata
  created_by: UUID
  created_at: DateTime
  updated_by: UUID
  updated_at: DateTime
  
  // Indexes
  UNIQUE (tenant_id, product_code)
  UNIQUE (tenant_id, product_name)
  INDEX (tenant_id, status)
  INDEX (tenant_id, category)
}
```

### Product Audit Log

```typescript
ProductAuditLog {
  audit_id: UUID
  product_id: UUID
  tenant_id: UUID
  action: enum ['Created', 'Updated', 'StatusChanged']
  changed_by: UUID
  changed_at: DateTime
  changes: JSONB {
    field_name: {
      old_value: any,
      new_value: any
    }
  }
}
```

---

## UI/UX Requirements

### Product List Screen

**Layout**:
```
+----------------------------------------------------------+
| Products                                        [+ New]   |
+----------------------------------------------------------+
| Search: [___________]  Type: [All ▼]  Status: [All ▼]   |
| Category: [All ▼]                                         |
+----------------------------------------------------------+
| Code    | Name           | Type | Category | UOM | Status |
|---------|----------------|------|----------|-----|--------|
| FG-001  | Broiler Feed   | FG   | Feed     | Bag | Active |
| RM-002  | Corn Grain     | RM   | Raw Mat  | Ton | Active |
| ...     | ...            | ...  | ...      | ... | ...    |
+----------------------------------------------------------+
| Showing 1-20 of 145                        < 1 2 3 ... > |
+----------------------------------------------------------+
```

**Actions**:
- Click row → Open product details drawer
- Edit icon → Open edit form
- Status toggle → Activate/Deactivate (with confirmation)

### Product Create/Edit Form

**Tabs**:
1. **Basic Info**
   - Product Code, Name, Type, Category, Sub-Category
   - UOM, Standard Weight, Pack Size, Packing Type
   - Description, Barcode, Manufacturer, Status

2. **Transport Config**
   - Vehicle Type Compatibility (multi-select checkboxes)
   - Special Handling (multi-select checkboxes)
   - Stackable, Max Stack Height, Load Type

3. **QC Config**
   - Requires QC (toggle)
   - QC Checklist (dropdown, if QC required)
   - Sampling Required (toggle)
   - Auto-Pass Eligible (toggle)
   - Lab Test Required (toggle)

**Validation**:
- Real-time field validation with inline errors
- Required fields marked with red asterisk
- Save button disabled until all required fields valid

**Actions**:
- [Save] - Validate and save product
- [Save & Add Another] - Save and reset form for new product
- [Cancel] - Discard changes and close form

---

## API Endpoints

### POST /api/v1/products
**Purpose**: Create new product  
**Auth**: Tenant Admin  
**Request Body**:
```json
{
  "product_code": "FG-BF-001",
  "product_name": "Broiler Starter Feed 50kg",
  "product_type": "FinishedGoods",
  "category": "Feed",
  "sub_category": "Broiler Feed",
  "unit_of_measure": "Bag",
  "standard_weight_per_unit": 50.000,
  "pack_size": "50kg",
  "packing_type": "Bag",
  "description": "High-protein starter feed for broiler chicks",
  "barcode_ean": "1234567890123",
  "manufacturer": "ABC Feed Mills",
  "transport_config": {
    "vehicle_type_compatibility": ["CoveredTruck"],
    "special_handling": ["Temperature-Sensitive"],
    "stackable": true,
    "max_stack_height": 10,
    "load_type": "Bagged"
  },
  "qc_config": {
    "requires_qc": true,
    "qc_checklist_id": "uuid-checklist-123",
    "sampling_required": true,
    "auto_pass_eligible": false,
    "lab_test_required": true
  },
  "status": "Active"
}
```
**Response**: 201 Created + product object with product_id

### GET /api/v1/products
**Purpose**: List/search products  
**Auth**: Authenticated users  
**Query Params**:
- `search` (string, optional) - Search product code or name
- `product_type` (enum, optional) - Filter by FG/RM
- `category` (string, optional) - Filter by category
- `status` (enum, optional) - Filter by Active/Inactive/Discontinued/Seasonal
- `page` (integer, default 1)
- `per_page` (integer, default 20, max 100)

**Response**: 200 OK + paginated product list

### GET /api/v1/products/{product_id}
**Purpose**: Get product details  
**Auth**: Authenticated users  
**Response**: 200 OK + full product object

### PUT /api/v1/products/{product_id}
**Purpose**: Update product  
**Auth**: Tenant Admin  
**Request Body**: Same as POST (partial updates allowed)  
**Response**: 200 OK + updated product object

### PATCH /api/v1/products/{product_id}/status
**Purpose**: Change product status  
**Auth**: Tenant Admin  
**Request Body**:
```json
{
  "status": "Inactive",
  "reason": "Discontinued by manufacturer"
}
```
**Response**: 200 OK + updated product object

### GET /api/v1/products/{product_id}/audit-trail
**Purpose**: Get product change history  
**Auth**: Tenant Admin  
**Response**: 200 OK + array of audit log entries

---

## Non-Functional Requirements

### NFR-001: Performance
- Product list API response time < 500ms (95th percentile)
- Product search results return within 1 second (full-text search)
- Product creation/update < 1 second

### NFR-002: Security
- Only Tenant Admin can create/edit/deactivate products
- All users can view active products (for requisition/TO/QC forms)
- Audit trail accessible only to Tenant Admin and System Admin

### NFR-003: Scalability
- Support up to 10,000 products per tenant
- Support 100 concurrent product searches
- Database indexes on (tenant_id, status), (tenant_id, category)

### NFR-004: Usability
- Product creation form completion time < 3 minutes (user testing target)
- Inline validation with clear error messages
- Auto-save draft (optional, future enhancement)

---

## Testing Scenarios

### TS-001: Product Creation (Happy Path)
**Given**: Tenant Admin logged in  
**When**: Admin fills all required fields and clicks Save  
**Then**:
- Product created with unique product_id
- Product appears in product list
- Audit log entry created
- Success message displayed

### TS-002: Duplicate Product Code
**Given**: Product with code "FG-001" already exists  
**When**: Admin tries to create another product with code "FG-001"  
**Then**:
- Validation error: "Product code already exists"
- Product not created
- Form remains open with error message

### TS-003: Standard Weight Validation
**Given**: Admin creates product with UOM = "Bag"  
**When**: Admin leaves "Standard Weight per Unit" blank  
**Then**:
- Validation error: "Standard weight is required for this unit of measure"
- Save button disabled
- Field highlighted in red

### TS-004: Product Deactivation with Active References
**Given**: Product "FG-001" is used in 5 active requisitions  
**When**: Admin changes status to "Inactive"  
**Then**:
- Warning modal: "This product is used in 5 active requisitions. Deactivating will prevent new usage but won't affect existing records."
- Options: [Confirm] [Cancel]
- If confirmed: Status changed, audit logged
- Existing requisitions remain intact

### TS-005: Inactive Product Blocked in New Requisition
**Given**: Product "FG-001" status = "Inactive"  
**When**: User tries to select "FG-001" in requisition form (US-010)  
**Then**:
- Product does not appear in dropdown
- Or if shown (for admin): Error "Product is inactive and cannot be used"

### TS-006: Product Search Performance
**Given**: Tenant has 5,000 products  
**When**: User searches for "Broiler"  
**Then**:
- Results return within 1 second
- Matching products displayed (sorted by relevance)

### TS-007: Transport Config Enforcement
**Given**: Product "FG-BF-001" has vehicle_type_compatibility = ["CoveredTruck"]  
**When**: Transport Planner creates TO with this product  
**Then**:
- System suggests CoveredTruck vehicles (US-020)
- System warns if OpenTruck selected (override allowed with reason)

### TS-008: QC Config Enforcement
**Given**: Product "RM-CORN" has qc_config.requires_qc = true  
**When**: Product arrives at destination POI  
**Then**:
- System automatically triggers QC workflow (US-044)
- QC checklist pre-populated from product.qc_config.qc_checklist_id

---

## Dependencies

### Depends On
- None (foundational story)

### Blocks (Critical Path)
- **US-010**: Create Port Consignment TR (needs product list)
- **US-011**: Distribution Approval Workflow (approves product requisitions)
- **US-012**: Procurement Approval Workflow (approves product requisitions)
- **US-013**: Stock Validation (validates product stock levels)
- **US-044**: QC Lab Testing Workflow (QC tests are product-specific)
- **US-046**: QC Test Configuration (links checklists to products)
- **US-059**: Trip Cost Calculation (per-product costing)

**Impact**: This story **MUST complete before US-010** (Sprint 2). Otherwise, requisitions cannot be created.

---

## Integration Points

### With Other Modules

1. **Requisition Management** (US-010, US-011, US-012)
   - Product dropdown populated from active products
   - Product attributes (weight, UOM) used in quantity calculations

2. **Transport Orders** (US-017, US-018)
   - Product transport config used for vehicle selection
   - Product weight used for load calculations

3. **Quality Control** (US-044+)
   - Product QC config triggers QC workflow
   - Product-specific checklists and sampling rules applied

4. **Trip Costing** (US-059, US-060)
   - Product used for per-product profitability analysis
   - Product weight used in freight cost calculations

5. **Reporting & Analytics**
   - Product category used in product mix reports
   - Product performance tracking

---

## Definition of Done

### Code Complete
- [ ] Product CRUD APIs implemented and tested
- [ ] UI for product list, create, edit, view implemented
- [ ] Validation rules enforced (uniqueness, required fields, formats)
- [ ] Transport and QC configuration working
- [ ] Status management (activate/deactivate) working
- [ ] Audit trail logging all operations

### Testing Complete
- [ ] Unit tests pass (80%+ coverage)
- [ ] Integration tests pass (product CRUD, validation, status changes)
- [ ] TS-001 to TS-008 test scenarios pass
- [ ] Performance tests pass (product search < 1s, API < 500ms)
- [ ] Security tests pass (role-based access control)

### Documentation Complete
- [ ] API documentation updated (Swagger/OpenAPI)
- [ ] User manual section for product management written
- [ ] Database schema documented
- [ ] Integration guide for downstream stories (US-010+) written

### UAT Complete
- [ ] Tenant Admin can create 20+ products (FG & RM) successfully
- [ ] Product search returns accurate results
- [ ] Product status changes work correctly
- [ ] Inactive products blocked in requisition forms (verified with US-010)
- [ ] Audit trail reviewed and approved
- [ ] UAT sign-off from Product Owner

### Deployment Ready
- [ ] Code reviewed and approved
- [ ] Merged to main branch
- [ ] Deployed to staging environment
- [ ] Smoke tests pass in staging
- [ ] Ready for production deployment

---

## Related Documentation

- **PRD Section**: 6.4 Product Inventory Management (PIM)
- **Module Spec**: `05-modules/02-master-data/product-master-data-management.md`
- **Epic**: [EPIC-005](../01-epics/EPIC-005-product-inventory-management-pim.md)
- **Related Stories**: US-010, US-011, US-012, US-013, US-044, US-046, US-059
- **WBS Source**: `01-source/04-wbs/epics-table.md` (EPIC-005)

---

**Last Updated**: 2026-02-27  
**Status**: Pending (newly created)  
**Priority**: 🔴 CRITICAL (blocks 20+ downstream stories)  
**Sprint**: Sprint 2 (MUST complete before requisitions start)
