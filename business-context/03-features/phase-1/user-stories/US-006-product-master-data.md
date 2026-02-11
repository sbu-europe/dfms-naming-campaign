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
updated: 2026-02-11
source_documents:
  - ../../../../source-documents/requirements/PRD_DFMS_v1.0.docx
  - ../../../../source-documents/discovery-phase/client-resources/master-data/
related_stories:
  - US-009-fg-transfer-requisition.md
  - US-010-port-transfer-requisition.md
dependencies:
  - US-007-user-role-management.md
tags: [master-data, product, inventory, fg, rm, critical]
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

### AC-1: Product Registration
- [ ] System SHALL allow creating product with:
  - Product Code (SKU, unique)
  - Product Name
  - Product Category (FG / RM)
  - Product Type (Live Birds, Processed Meat, Feed, Grain, Chemical, etc.)
  - Unit of Measurement (KG, MT, Bags, Pieces, Liters)
  - Standard Weight per Unit
  - Packing Type (Crate, Bag, Box, Bulk, Tanker)
  - Handling Instructions (Temperature-sensitive, Fragile, Live, Hazardous)
  - Required Vehicle Type (Covered Van, Open Truck, Refrigerated, Tanker)
  - Shelf Life (days, for perishable goods)
  - QC Required (Yes/No)
- [ ] System SHALL validate mandatory fields
- [ ] System SHALL prevent duplicate product codes

### AC-2: Product Category Management
- [ ] System SHALL categorize products as FG or RM
- [ ] System SHALL associate product category with transfer type:
  - FG → FG Transfer Requisition
  - RM → Port Consignment Transfer Requisition
- [ ] System SHALL filter products by category during TR creation

### AC-3: Handling Requirements
- [ ] System SHALL store handling instructions per product
- [ ] System SHALL display handling instructions during:
  - TR creation
  - TO assignment
  - Loading/unloading operations
  - QC inspection
- [ ] System SHALL flag special handling requirements (temperature, live animals)

### AC-4: QC Configuration
- [ ] System SHALL link products to QC checklists
- [ ] System SHALL define QC parameters per product type
- [ ] System SHALL mark products requiring mandatory QC

### AC-5: Product Search & Management
- [ ] System SHALL provide product list with search and filter
- [ ] System SHALL allow editing product information
- [ ] System SHALL allow viewing product usage history (TRs/TOs)
- [ ] System SHALL prevent deleting products with active TRs/TOs

---

## Functional Requirements

### FR-001: Product Registration Form
- [Critical] Comprehensive registration form with all attributes
- [Critical] Product category selection (FG/RM)
- [High] Handling instruction templates
- [High] Vehicle type recommendation based on product type

### FR-002: Product Categorization
- [Critical] Product type taxonomy (hierarchical categories)
- [High] Product type-based validation rules
- [Medium] Custom product types (admin configuration)

### FR-003: Integration
- [Critical] API for product lookup (by code, name, category)
- [Critical] API for product handling requirements
- [High] API for QC checklist retrieval per product

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

---

## Data Model

```typescript
Product {
  id: UUID (PK)
  tenant_id: UUID (FK)
  
  product_code: String (unique, SKU)
  product_name: String
  product_category: Enum (FG, RM)
  product_type: Enum (
    Live_Birds,
    Processed_Meat,
    Eggs,
    Feed,
    Grain,
    Chemical,
    Packaging_Material,
    Other
  )
  
  unit_of_measurement: Enum (KG, MT, Bags, Pieces, Liters, Tons)
  standard_weight_per_unit: Decimal (nullable)
  packing_type: Enum (Crate, Bag, Box, Bulk, Tanker, Loose)
  
  handling_instructions: Text
  is_temperature_sensitive: Boolean
  is_fragile: Boolean
  is_live_animal: Boolean
  is_hazardous: Boolean
  
  required_vehicle_type: Enum (
    Covered_Van,
    Open_Truck,
    Refrigerated_Truck,
    Tanker,
    Any
  )
  
  shelf_life_days: Integer (nullable)
  
  qc_required: Boolean (default: false)
  qc_checklist_id: UUID (FK to QCChecklist, nullable)
  
  is_active: Boolean (default: true)
  total_trs_count: Integer (default: 0)
  last_used_date: Date (nullable)
  
  created_at: Timestamp
  created_by: UUID (FK)
  updated_at: Timestamp
  updated_by: UUID (FK)
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

**Story Points**: 5  
**Estimated Hours**: 40 hours  
**Sprint**: Sprint 1  
**Priority**: Critical

