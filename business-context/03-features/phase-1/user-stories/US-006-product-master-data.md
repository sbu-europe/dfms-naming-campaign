---
title: Manage Product Master Data (FG & RM)
story_id: US-006
phase: phase-1
module: Master Data Management
priority: Critical
status: Pending
epic: Master Data Foundation
sprint: Sprint 1
story_points: 5
created: 2026-02-11
updated: 2026-02-13
source_documents:
  - ../../../../source-documents/requirements/PRD_DFMS_v1.0.md
  - ../../../../source-documents/discovery-phase/client-resources/master-data/
related_stories:
  - US-009-fg-transfer-requisition.md
  - US-010-port-transfer-requisition.md
dependencies:
  - US-007-user-role-management.md
tags: [master-data, product, inventory, fg, rm, pim, critical]
---

# US-006: Manage Product Master Data (FG & RM)

## User Story

**As a** Inventory Manager  
**I want to** register and manage product master data for Finished Goods (FG) and Raw Materials (RM) with their specifications and handling requirements  
**So that** transport requisitions can specify correct products with appropriate handling instructions

## Business Context

Product master data is essential for:
- **Finished Goods (FG)**: Live birds, processed chicken, eggs, feed
- **Raw Materials (RM)**: Maize, soybean, vitamins, packaging materials

Proper product management ensures:
- Accurate transport requisition creation
- Correct vehicle type selection (temperature-controlled, covered, open)
- Proper handling instructions (live animals, perishable, fragile)
- QC parameter configuration per product type

---

## Acceptance Criteria

### AC-1: Product Registration (per PRD 6.4.1)
- [ ] System SHALL allow creating product with:
  - Product Name (required, unique within tenant)
  - Product SKU (required, system-wide unique)
  - Product Code (Required)
  - Product Category (required, dropdown from pre-defined list)
  - Product Sub-category (optional, dependent on category selection)
  - Product Type (Raw Material / Finished Goods)
  - Unit of Measure (UOM) (required, dropdown: Bags, Tons, Kilograms, Liters, Pieces, Cartons)
  - Weight per Unit (required if UOM = Bags/Pieces/Cartons, decimal with 3 places)
  - Standard Pack Size (optional)
  - Type of Packing (Pallet/Drum/Roll - Auto filled from master data)
  - Product Description (Optional)
  - Barcode/EAN Code (Optional)
  - Product Image (Optional, JPG/PNG, max 2MB) [TBD]
  - Manufacturer name (optional)
  - Product Status (Active/Inactive/Discontinued/Seasonal)
- [ ] System SHALL validate mandatory fields
- [ ] System SHALL prevent duplicate product codes/SKUs per tenant
- [ ] System SHALL support bulk upload via CSV with entity-specific templates

### AC-2: Catalogue Design - Product Data Model Configuration (per PRD 6.4.2)
- [ ] System SHALL support configurable Product Categories
- [ ] System SHALL enforce category-level attribute definitions
- [ ] System SHALL allow assigning attributes dynamically to products based on category
- [ ] System SHALL store attribute metadata (data type, validation rules)
- [ ] Categories can be configured and reused across products
- [ ] Attribute types supported: text, numeric, dropdown, Boolean
- [ ] Attributes can be marked as mandatory or optional per category
- [ ] Product catalogue structure is configurable without code changes
- [ ] Mandatory attributes must be filled before a product can be activated
- [ ] Category-level attribute changes apply only to new or edited products unless explicitly re-applied
- [ ] System SHALL support future extension of attributes without impacting existing data

### AC-3: Product Configuration - Transport & QC Attribute Mapping (per PRD 6.4.3)
- [ ] System SHALL allow mapping transport-related attributes to products:
  - Load type
  - Special handling requirements
  - Stackable/non-stackable
  - Required vehicle type
  - Capacity planning attributes
- [ ] System SHALL allow mapping QC-related attributes to products:
  - Sampling required (Yes/No)
  - Checklist type
  - Auto-pass eligibility
  - QC parameters
- [ ] Product configuration SHALL be visible to PR, TR, TO, QC modules
- [ ] System SHALL use product configuration to auto-load QC checklist to products
- [ ] System SHALL use product configuration to influence transport logic (vehicle type, capacity checks)
- [ ] System SHALL allow default configuration per product category
- [ ] Product configuration changes SHALL NOT retroactively alter completed PR/TR/TO/QC records

### AC-4: Handling Requirements
- [ ] System SHALL store handling instructions per product
- [ ] System SHALL display handling instructions during:
  - TR creation
  - TO assignment
  - Loading/unloading operations
  - QC inspection
- [ ] System SHALL flag special handling requirements (temperature, live animals)
- [ ] System SHALL use transport attributes to influence vehicle type selection

### AC-5: QC Configuration
- [ ] System SHALL link products to QC checklists
- [ ] System SHALL define QC parameters per product type
- [ ] System SHALL mark products requiring mandatory QC
- [ ] System SHALL auto-load QC checklist based on product configuration
- [ ] System SHALL support auto-pass eligibility configuration per product

### AC-6: Product Search & Management
- [ ] System SHALL provide product list with search and filter
- [ ] System SHALL support pagination (25/50/100 per page)
- [ ] System SHALL support column sorting and full-text search
- [ ] System SHALL allow editing product information (with audit logging)
- [ ] System SHALL support inline editing at row and column level
- [ ] System SHALL allow viewing product usage history (TRs/TOs)
- [ ] System SHALL prevent deleting products with active TRs/TOs
- [ ] System SHALL support soft delete (mark as Inactive) with mandatory deletion reason
- [ ] System SHALL support hard delete (only if zero dependencies, Super Admin only)
- [ ] Inactive products SHALL NOT be selectable in PR/TR/TO/QC workflows

---

## Functional Requirements

### FR-001: Product Registration Form
- [Critical] Comprehensive registration form with all attributes
- [Critical] Product category selection (FG/RM)
- [High] Handling instruction templates
- [High] Vehicle type recommendation based on product type

### FR-002: Catalogue Design - Product Data Model Configuration
- [Critical] Configurable Product Categories
- [Critical] Category-level attribute definitions
- [Critical] Dynamic attribute assignment to products based on category
- [Critical] Attribute metadata storage (data type, validation rules)
- [High] Support for text, numeric, dropdown, Boolean attribute types
- [High] Mandatory/optional attribute marking per category
- [High] Configurable catalogue structure without code changes
- [Medium] Future extension of attributes without impacting existing data

### FR-003: Product Configuration - Transport & QC Attribute Mapping
- [Critical] Transport-related attribute mapping to products
- [Critical] QC-related attribute mapping to products
- [Critical] Product configuration visibility to PR, TR, TO, QC modules
- [High] Auto-load QC checklist based on product configuration
- [High] Influence transport logic (vehicle type, capacity checks) based on product configuration
- [High] Default configuration per product category
- [Medium] Configuration changes do not retroactively alter completed records

### FR-004: Bulk Upload & Inline Management
- [Critical] Bulk upload option for product master data
- [Critical] CSV file format (UTF-8 encoded)
- [Critical] Entity-specific CSV templates with mandatory fields marked
- [Critical] Append-only behavior (existing records not overwritten)
- [Critical] Row-level and column-level inline editing
- [Critical] Independent row validation with detailed error reports
- [Critical] Comprehensive audit logging for all bulk operations

### FR-005: Integration
- [Critical] API for product lookup (by code, name, category, SKU)
- [Critical] API for product handling requirements
- [Critical] API for transport attributes per product
- [Critical] API for QC attributes per product
- [High] API for QC checklist retrieval per product
- [High] API for product configuration (transport & QC)

---

## Business Rules

### BR-PM-001: Unique Product Code
- Product code (SKU) must be unique
- **Enforcement**: Database unique constraint

### BR-PM-002: Category-Transfer Type Mapping
- FG products → FG Transfer Requisition only
- RM products → Port Consignment Transfer Requisition only
- **Enforcement**: Validation during TR creation

### BR-PM-003: Vehicle Type Requirement
- Product's required vehicle type must match assigned vehicle
- **Enforcement**: Warning during TO assignment (not blocking)

### BR-PM-004: QC Requirement
- Products marked "QC Required" must go through QC workflow
- **Enforcement**: Trip cannot complete without QC pass

### BR-PM-005: Handling Instructions Display
- Handling instructions must be visible to driver, loader, QC supervisor
- **Enforcement**: UI display in mobile apps and operations screens

### BR-PM-006: Catalogue Configuration
- Product catalogue structure is configurable without code changes
- Mandatory attributes must be filled before product activation
- Category-level attribute changes apply only to new/edited products unless explicitly re-applied
- **Enforcement**: Configuration validation + activation checks

### BR-PM-007: Transport & QC Attribute Mapping
- Transport attributes influence vehicle type selection and capacity checks
- QC attributes auto-load QC checklist to products
- Product configuration visible to PR, TR, TO, QC modules
- Configuration changes do not retroactively alter completed PR/TR/TO/QC records
- **Enforcement**: Attribute mapping validation + workflow integration

### BR-PM-008: Referential Integrity
- Product must belong to valid category
- Product types must match configured allowed UOM and QC mapping rules
- Inactive products cannot be selected in PR/TR/TO/QC workflows
- **Enforcement**: Foreign key validation + workflow filters

---

## Data Model

```typescript
Product {
  id: UUID (PK)
  tenant_id: UUID (FK)
  
  // Basic Information (per PRD 6.4.1)
  product_name: String (required, unique within tenant)
  product_sku: String (required, system-wide unique)
  product_code: String (required)
  product_category: String (required, FK to ProductCategory)
  product_sub_category: String (nullable, dependent on category)
  product_type: Enum (Raw_Material, Finished_Goods)
  
  // Measurement & Packaging
  unit_of_measure: Enum (Bags, Tons, Kilograms, Liters, Pieces, Cartons) (required)
  weight_per_unit: Decimal (required if UOM = Bags/Pieces/Cartons, precision: 3 decimal places)
  standard_pack_size: Decimal (nullable)
  type_of_packing: Enum (Pallet, Drum, Roll) (auto-filled from master data)
  
  // Additional Details
  product_description: Text (nullable)
  barcode_ean_code: String (nullable)
  product_image_url: String (nullable, JPG/PNG, max 2MB)
  manufacturer_name: String (nullable)
  product_status: Enum (Active, Inactive, Discontinued, Seasonal)
  
  // Transport Attributes (per PRD 6.4.3)
  transport_attributes: JSONB {
    load_type: String (nullable)
    special_handling: Text (nullable)
    is_stackable: Boolean (nullable)
    required_vehicle_type: Enum (Covered_Van, Open_Truck, Refrigerated_Truck, Tanker, Any)
    capacity_planning_attributes: JSONB (nullable)
  }
  
  // QC Attributes (per PRD 6.4.3)
  qc_attributes: JSONB {
    sampling_required: Boolean (default: false)
    checklist_type: String (nullable)
    auto_pass_eligible: Boolean (default: false)
    qc_parameters: JSONB (nullable)
  }
  
  qc_checklist_id: UUID (FK to QCChecklist, nullable, auto-loaded based on QC attributes)
  
  is_active: Boolean (default: true)
  total_trs_count: Integer (default: 0)
  last_used_date: Date (nullable)
  
  created_at: Timestamp
  created_by: UUID (FK)
  updated_at: Timestamp
  updated_by: UUID (FK)
}

ProductCategory {
  id: UUID (PK)
  tenant_id: UUID (FK)
  
  category_name: String (required, unique per tenant)
  category_code: String (required, unique per tenant)
  parent_category_id: UUID (FK, nullable, for sub-categories)
  description: Text (nullable)
  
  // Configurable Attributes
  attribute_definitions: JSONB {
    attribute_name: String
    attribute_type: Enum (text, numeric, dropdown, boolean)
    is_mandatory: Boolean
    validation_rules: JSONB (nullable)
  }
  
  is_active: Boolean (default: true)
  created_at: Timestamp
  created_by: UUID (FK)
  updated_at: Timestamp
}

ProductTransportConfig {
  id: UUID (PK)
  product_id: UUID (FK)
  
  load_type: String
  special_handling: Text
  is_stackable: Boolean
  required_vehicle_type: Enum
  capacity_planning_attributes: JSONB
  
  created_at: Timestamp
  updated_at: Timestamp
}

ProductQCConfig {
  id: UUID (PK)
  product_id: UUID (FK)
  
  sampling_required: Boolean
  checklist_type: String
  auto_pass_eligible: Boolean
  qc_parameters: JSONB
  
  created_at: Timestamp
  updated_at: Timestamp
}
```

---

## UI/UX Requirements

### Product Registration Form
```
┌─────────────────────────────────────────┐
│ Register New Product                    │
├─────────────────────────────────────────┤
│ Product Code (SKU): *                   │
│ [_____________________________]         │
│                                         │
│ Product Name: *                         │
│ [_____________________________]         │
│                                         │
│ Category: *                             │
│ ⚪ Finished Goods (FG)                  │
│ ⚪ Raw Materials (RM)                   │
│                                         │
│ Product Type: *                         │
│ [Live Birds                   ▼]        │
│                                         │
│ Unit of Measurement: *                  │
│ [KG                           ▼]        │
│                                         │
│ Standard Weight per Unit:               │
│ [2.5] KG                                │
│                                         │
│ Packing Type: *                         │
│ [Crate                        ▼]        │
│                                         │
│ Required Vehicle Type:                  │
│ [Covered Van                  ▼]        │
│                                         │
│ Handling Instructions:                  │
│ ┌─────────────────────────────────────┐ │
│ │ Live birds - Handle with care       │ │
│ │ Maintain ventilation                │ │
│ │ Avoid stacking                      │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Special Requirements:                   │
│ ☑ Temperature Sensitive                 │
│ ☐ Fragile                               │
│ ☑ Live Animal                           │
│ ☐ Hazardous                             │
│                                         │
│ QC Required: ☑ Yes  ☐ No                │
│                                         │
│ [Cancel]              [Save]            │
└─────────────────────────────────────────┘
```

### Product List View
```
┌──────────────────────────────────────────────────────────────┐
│ Product Management               [+ Add Product]             │
├──────────────────────────────────────────────────────────────┤
│ Filter: [All ▼] Category: [All ▼] Type: [All ▼]             │
│                                                              │
│ Code      Name           Category  Type        QC    Action │
│ ──────────────────────────────────────────────────────────  │
│ SKU-001   Live Broiler   FG        Live Birds  ✅    [View] │
│ SKU-002   Chicken Feed   FG        Feed        ☐     [View] │
│ SKU-003   Maize          RM        Grain       ✅    [View] │
│ SKU-004   Soybean        RM        Grain       ✅    [View] │
└──────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
// Create product
POST /api/v1/products
Body: {product_code, product_name, product_category, ...}

// Get all products
GET /api/v1/products
Query: ?category=FG&type=Live_Birds&is_active=true

// Get product by ID
GET /api/v1/products/{product_id}

// Get product by code
GET /api/v1/products/by-code/{product_code}

// Update product
PATCH /api/v1/products/{product_id}

// Get products by category
GET /api/v1/products/by-category/{category}
Response: {products: Product[]}

// Get product handling instructions
GET /api/v1/products/{product_id}/handling-instructions
Response: {
  instructions: string,
  special_requirements: {...},
  required_vehicle_type: string
}

// Get QC checklist for product
GET /api/v1/products/{product_id}/qc-checklist
Response: {checklist: QCChecklist}

// Catalogue Design APIs
GET /api/v1/product-categories
Response: {categories: ProductCategory[]}

POST /api/v1/product-categories
Body: {category_name, category_code, attribute_definitions}

GET /api/v1/product-categories/{category_id}/attributes
Response: {attributes: AttributeDefinition[]}

// Product Configuration APIs
GET /api/v1/products/{product_id}/transport-config
Response: {transport_config: ProductTransportConfig}

PUT /api/v1/products/{product_id}/transport-config
Body: {load_type, special_handling, required_vehicle_type, ...}

GET /api/v1/products/{product_id}/qc-config
Response: {qc_config: ProductQCConfig}

PUT /api/v1/products/{product_id}/qc-config
Body: {sampling_required, checklist_type, auto_pass_eligible, ...}

// Bulk Upload APIs
POST /api/v1/products/bulk-upload
Body: {file: CSV file}
Response: {upload_id, total_rows, successful_rows, failed_rows, errors}

GET /api/v1/products/bulk-upload/template
Response: CSV template download

PATCH /api/v1/products/{id}  - Inline edit (row/column level)
Body: {field_name: new_value}
```

---

## Testing Scenarios

### Happy Path
1. Register FG product → Product created
2. Register RM product → Product created
3. Filter products by category → Correct products displayed
4. View handling instructions → Instructions displayed

### Edge Cases
1. **Duplicate product code**: Error
2. **FG product in RM transfer**: Validation error
3. **Product with active TRs**: Cannot delete
4. **QC required but no checklist**: Warning

### Error Scenarios
1. **Missing mandatory field**: Validation error
2. **Invalid product code format**: Validation error

---

## Dependencies

### Prerequisites
- ✅ US-007: User & Role Management

### Enables
- → US-009: FG Transfer Requisition
- → US-010: Port Consignment Transfer Requisition
- → US-045-056: QC Workflow (QC parameters)

---

## Definition of Done
- [ ] CRUD operations functional
- [ ] Product categorization working
- [ ] Handling instructions management
- [ ] QC configuration linkage
- [ ] Vehicle type recommendation
- [ ] Unit tests > 85%
- [ ] Bulk import tested (Excel)
- [ ] UAT approved

---

**Story Points**: 8 (increased due to Catalogue Design, Transport & QC Attribute Mapping, bulk upload)  
**Estimated Hours**: 64 hours  
**Sprint**: Sprint 1  
**Priority**: Critical

---

**Source Documents**:
- PRD Section 6.4.1: Product Catalogue Management – Product Master Data
- PRD Section 6.4.2: Catalogue Design – Product Data Model Configuration
- PRD Section 6.4.3: Product Configuration – Transport & QC Attribute Mapping
- PRD Section 6.3.2: Bulk Upload & Inline Master Data Management

**Last Updated**: February 13, 2026  
**Status**: Updated to align with PRD v1.0

