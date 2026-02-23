---
title: Create Finished Goods Transfer Requisition (TR)
story_id: US-009
phase: phase-1
module: Product Requisition Management
priority: Critical
status: Pending
epic: Product Requisition Workflow
epic_id: EPIC-002
epic_name: User & Tenant Foundation
sprint: Sprint 2
story_points: 5
created: 2026-02-11
updated: 2026-02-13
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../03-module-specifications/03-core-operations/transport-requisition-management.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-073-requisition-transfer-type-configuration.md
  - US-011-distribution-approval.md
  - US-013-stock-validation.md
  - US-015-tr-assessment.md
dependencies:
  - US-005-poi-master-data.md
  - US-006-product-master-data.md
  - US-007-user-role-management.md
  - US-073-requisition-transfer-type-configuration.md
tags: [requisition, fg-transfer, tr, critical, workflow]
---

# US-009: Create Finished Goods Transfer Requisition (TR)

## User Story

**As a** Distribution Officer (DO)  
**I want to** create Transport Request from approved Finished Goods PR so that products are being transferred at their desired POIs

## Business Context

FG Transfer Requisitions are created for:
- **Depot Replenishment**: Moving finished goods from warehouse to regional depots
- **Inter-warehouse Transfer**: Moving stock between warehouses
- **Dealer Delivery**: Delivering products to dealers/customers

**Note**: This story focuses on the FG Transfer Requisition creation workflow. The transfer type selection mechanism is handled by **US-073: Requisition Transfer Type Configuration**, which dynamically controls form fields, approval workflow, and TR generation logic based on the selected transfer type.

The TR is the starting point of the transport workflow:
```
Transfer Type Selection (US-073) → TR Creation → Distribution Approval → TR Assessment → TO Creation → Trip Execution
```

---

## Acceptance Criteria

### AC-1: TR Creation Form
- [ ] System SHALL allow Distribution Manager to create FG TR with:
  - Transfer Type: Finished Goods Transfer (selected via US-073: Requisition Transfer Type Configuration)
  - Source POI (Warehouse/Depot)
  - Destination POI (Depot/Dealer)
  - Product (FG only, filtered from product master)
  - Quantity
  - Unit of Measurement (from product master)
  - Requested Delivery Date
  - Priority (Normal / High / Critical)
  - Special Instructions (optional)
- [ ] System SHALL validate all mandatory fields
- [ ] System SHALL auto-generate unique TR number
- [ ] System SHALL dynamically load FG Transfer-specific form fields based on selected transfer type (per US-073)

### AC-2: Source & Destination Validation
- [ ] System SHALL validate source POI can be a source (not Dealer-only POI)
- [ ] System SHALL validate destination POI can be a destination (not Supplier-only POI)
- [ ] System SHALL prevent same source and destination
- [ ] System SHALL calculate and display estimated distance

### AC-3: Product Selection
- [ ] System SHALL filter products by category (FG only)
- [ ] System SHALL display product details: Name, Code, UOM, Handling Instructions
- [ ] System SHALL show product availability at source POI (if stock integration available)
- [ ] System SHALL allow adding multiple products to single TR (line items)

### AC-4: Quantity & UOM
- [ ] System SHALL use product's default UOM
- [ ] System SHALL validate quantity > 0
- [ ] System SHALL calculate total weight (quantity × weight per unit)
- [ ] System SHALL estimate required vehicle capacity

### AC-5: TR Submission
- [ ] System SHALL save TR with status "Draft"
- [ ] System SHALL allow editing draft TRs
- [ ] System SHALL allow submitting TR for approval (status → "Pending Approval")
- [ ] System SHALL send notification to Distribution Approver
- [ ] System SHALL prevent editing after submission

### AC-6: TR List & Search
- [ ] System SHALL display list of TRs created by user
- [ ] System SHALL filter by: Status, Date Range, Source/Destination, Priority
- [ ] System SHALL search by TR number
- [ ] System SHALL sort by: Creation Date, Delivery Date, Priority

---

## Functional Requirements

### FR-001: TR Creation Form
- [Critical] Multi-step form or single-page form
- [Critical] POI selection with map preview
- [Critical] Product selection with autocomplete
- [High] Multiple product line items support
- [High] Draft save functionality

### FR-002: Validation
- [Critical] Mandatory field validation
- [Critical] POI type validation (source/destination rules)
- [High] Stock availability check (if ERP integrated)
- [Medium] Capacity warning (if quantity exceeds typical vehicle capacity)

### FR-003: TR Number Generation
- [Critical] Auto-generate TR number: Format `TR-FG-YYYYMMDD-XXXX`
- [High] Sequential numbering per day
- [Medium] Tenant-specific prefix

### FR-004: Notifications
- [High] Email notification to approver on submission
- [High] In-app notification
- [Medium] SMS notification (if enabled)

---

## Business Rules

### BR-TR-001: FG Product Only
- Only FG category products can be added to FG TR
- **Enforcement**: Product filter during selection

### BR-TR-002: POI Type Validation
- Source: Warehouse, Depot, Farm (not Dealer, not Supplier)
- Destination: Depot, Dealer (not Supplier)
- **Enforcement**: POI type check during selection

### BR-TR-003: Same POI Prevention
- Source and destination cannot be the same
- **Enforcement**: Validation on form submission

### BR-TR-004: Quantity Validation
- Quantity must be > 0
- **Enforcement**: Input validation

### BR-TR-005: Draft Editing
- Only draft TRs can be edited
- **Enforcement**: Status check before edit

### BR-TR-006: Delivery Date
- Requested delivery date should be ≥ today + 1 day
- **Enforcement**: Warning (not blocking)

---

## Data Model

```typescript
TransferRequisition {
  id: UUID (PK)
  tenant_id: UUID (FK)
  
  tr_number: String (unique, format: TR-FG-YYYYMMDD-XXXX)
  transfer_type: Enum (FG_Transfer, Port_Consignment)
  
  source_poi_id: UUID (FK to POI)
  destination_poi_id: UUID (FK to POI)
  
  requested_delivery_date: Date
  priority: Enum (Normal, High, Critical)
  special_instructions: Text (nullable)
  
  status: Enum (
    Draft,
    Pending_Approval,
    Approved,
    Rejected,
    Available_For_Planning,
    Partially_Allocated,
    Fully_Allocated,
    Completed,
    Cancelled
  )
  
  total_quantity: Decimal (sum of line items)
  total_weight_kg: Decimal (computed)
  estimated_distance_km: Decimal (nullable)
  
  created_at: Timestamp
  created_by: UUID (FK to User)
  submitted_at: Timestamp (nullable)
  updated_at: Timestamp
  updated_by: UUID (FK)
}

TransferRequisitionLineItem {
  id: UUID (PK)
  tr_id: UUID (FK to TransferRequisition)
  
  product_id: UUID (FK to Product)
  quantity: Decimal
  uom: String
  weight_per_unit_kg: Decimal
  total_weight_kg: Decimal (computed: quantity × weight_per_unit)
  
  line_number: Integer
  
  created_at: Timestamp
}
```

---

## UI/UX Requirements

### TR Creation Form
```
┌─────────────────────────────────────────┐
│ Create FG Transfer Requisition          │
├─────────────────────────────────────────┤
│ Transfer Type: Finished Goods Transfer  │
│                                         │
│ Source POI: *                           │
│ [Select Warehouse/Depot...      ▼]     │
│ 📍 Bhaluka Warehouse, Mymensingh        │
│                                         │
│ Destination POI: *                      │
│ [Select Depot/Dealer...          ▼]     │
│ 📍 Mirpur Depot, Dhaka                  │
│                                         │
│ Distance: ~45 km (estimated)            │
│                                         │
│ Product Line Items:                     │
│ ┌─────────────────────────────────────┐ │
│ │ Product: [Live Broiler        ▼]    │ │
│ │ Quantity: [500] KG                  │ │
│ │ Weight: 500 KG                      │ │
│ │ [+ Add Another Product]             │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Total Quantity: 500 KG                  │
│ Total Weight: 500 KG                    │
│ Estimated Capacity: 1 Covered Van (5MT) │
│                                         │
│ Requested Delivery Date: *              │
│ [DD/MM/YYYY]                            │
│                                         │
│ Priority: *                             │
│ ⚪ Normal  ⚪ High  ⚪ Critical          │
│                                         │
│ Special Instructions:                   │
│ ┌─────────────────────────────────────┐ │
│ │ Handle with care - live birds       │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Save as Draft] [Submit for Approval]   │
└─────────────────────────────────────────┘
```

### TR List View
```
┌──────────────────────────────────────────────────────────────┐
│ FG Transfer Requisitions         [+ Create TR]               │
├──────────────────────────────────────────────────────────────┤
│ Filter: [All ▼] Status: [All ▼] Priority: [All ▼]           │
│                                                              │
│ TR Number       Route            Qty     Status     Action  │
│ ──────────────────────────────────────────────────────────  │
│ TR-FG-20260211  Bhaluka → Mirpur 500 KG  ⏳ Pending  [View] │
│ -0042           Delivery: Feb 15          Approval          │
│                                                              │
│ TR-FG-20260210  Warehouse → Depot 1000KG  ✅ Approved [View] │
│ -0038           Delivery: Feb 14                            │
└──────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
// Create TR
POST /api/v1/transfer-requisitions
Body: {
  transfer_type: 'FG_Transfer',
  source_poi_id, destination_poi_id,
  line_items: [{product_id, quantity}],
  requested_delivery_date, priority, special_instructions
}

// Get all TRs
GET /api/v1/transfer-requisitions
Query: ?transfer_type=FG_Transfer&status=Pending_Approval&created_by=me

// Get TR by ID
GET /api/v1/transfer-requisitions/{tr_id}

// Update TR (draft only)
PATCH /api/v1/transfer-requisitions/{tr_id}
Body: {field: value}

// Submit TR for approval
POST /api/v1/transfer-requisitions/{tr_id}/submit
Response: {tr, status: 'Pending_Approval'}

// Calculate distance
GET /api/v1/pois/distance?from_poi_id={id}&to_poi_id={id}
```

---

## Testing Scenarios

### Happy Path
1. Create TR with valid data → TR saved as draft
2. Submit TR → Status = "Pending Approval", notification sent
3. View TR list → TR displayed

### Edge Cases
1. **Same source & destination**: Validation error
2. **Dealer as source**: Validation error
3. **RM product in FG TR**: Product not in dropdown
4. **Zero quantity**: Validation error

---

## Dependencies

### Prerequisites
- ✅ US-005: POI Master Data
- ✅ US-006: Product Master Data
- ✅ US-007: User & Role Management

### Enables
- → US-011: Distribution Approval
- → US-015: TR Assessment

---

## Definition of Done
- [ ] TR creation form functional
- [ ] Validation rules implemented
- [ ] TR number auto-generation
- [ ] Draft save/edit working
- [ ] Submit for approval working
- [ ] Notifications sent
- [ ] Unit tests > 85%
- [ ] UAT approved

---

**Story Points**: 5  
**Estimated Hours**: 40 hours  
**Sprint**: Sprint 2  
**Priority**: Critical

