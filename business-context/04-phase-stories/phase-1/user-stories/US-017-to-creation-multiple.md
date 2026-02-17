---
title: Transport Order (TO) Creation - Multiple TOs per TR
story_id: US-017
phase: phase-1
module: Transport Management
priority: Critical
status: Pending
epic: Transport Order Management
sprint: Sprint 3
story_points: 8
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../source-documents/requirements/PRD_DFMS_v1.0.md
  - ../../../03-module-specifications/03-core-operations/transport-order-management.md
related_stories:
  - US-018-to-creation-transport-planner.md
  - US-015-tr-assessment.md
dependencies:
  - US-015-tr-assessment.md
tags: [transport, to-creation, multiple-tos, critical]
---

# US-017: Transport Order (TO) Creation - Multiple TOs per TR

## User Story

**As a** Transport Planner  
**I want to** create one or multiple Transport Orders from a single Transport Requisition  
**So that** I can split large shipments or handle partial fulfillment flexibly

## Business Context

**Note**: This story is closely related to US-018 (TO Creation by Transport Planner). US-018 provides the detailed implementation, while US-017 focuses on the multi-TO capability and TR-TO relationship management.

**Why Multiple TOs per TR**:
- **Partial Fulfillment**: Start transport before full fleet available
- **Fleet Mix**: Use both own fleet and vendor fleet
- **Load Distribution**: Split across multiple vehicles
- **Risk Mitigation**: Don't put all goods in one vehicle
- **Phased Delivery**: Deliver in batches

**Example**:
- TR: 1000 KG from Warehouse A to Depot B
- TO-1: 600 KG via Own Fleet (2 vehicles)
- TO-2: 400 KG via Vendor Fleet (1 vehicle)

---

## Acceptance Criteria

### AC-1: TR-TO Relationship
- [ ] System SHALL allow creating multiple TOs from single TR
- [ ] System SHALL track TR quantity allocation:
  - Total TR quantity
  - Allocated quantity (sum of TO quantities)
  - Remaining quantity
- [ ] System SHALL prevent over-allocation (TO quantities > TR quantity)
- [ ] System SHALL update TR status based on allocation:
  - "Available for Planning" → "Partially Allocated" → "Fully Allocated"

### AC-2: TO Quantity Management
- [ ] System SHALL validate each TO quantity ≤ remaining TR quantity
- [ ] System SHALL display remaining quantity in real-time
- [ ] System SHALL allow creating TO for full remaining quantity (quick action)
- [ ] System SHALL warn if creating many small TOs (inefficient)

### AC-3: TO Creation Workflow
- [ ] System SHALL provide "Create TO" action from TR detail page
- [ ] System SHALL pre-fill TO with TR details (source, destination, product)
- [ ] System SHALL allow specifying TO quantity (partial or full)
- [ ] System SHALL allow selecting fleet type per TO (Own/Vendor)
- [ ] System SHALL allow creating another TO immediately after first

### AC-4: TR Status Management
- [ ] System SHALL auto-update TR status:
  - First TO created → "Partially Allocated"
  - All quantity allocated → "Fully Allocated"
- [ ] System SHALL display TO list on TR detail page
- [ ] System SHALL show allocation progress (e.g., "600/1000 KG allocated")

### AC-5: TO Cancellation Impact
- [ ] System SHALL allow cancelling individual TOs
- [ ] System SHALL release TO quantity back to TR
- [ ] System SHALL update TR status if quantity released
- [ ] System SHALL maintain TO cancellation history

---

## Functional Requirements

### FR-001: TR-TO Linking
- [Critical] Foreign key relationship (TO.tr_id → TR.id)
- [Critical] Quantity tracking and validation
- [Critical] Status synchronization

### FR-002: Multi-TO Creation UI
- [Critical] "Create TO" button on TR detail page
- [Critical] TO creation form with quantity input
- [High] "Create Another TO" workflow
- [High] Allocation progress indicator

### FR-003: Validation Logic
- [Critical] Prevent over-allocation
- [Critical] Real-time remaining quantity calculation
- [High] Warn on inefficient splits (e.g., 10 TOs for 1000 KG)

### FR-004: TR Status Automation
- [Critical] Auto-update TR status on TO creation/cancellation
- [High] Trigger notifications on status change

---

## Business Rules

### BR-TO-001: Quantity Conservation
- Sum of TO quantities cannot exceed TR quantity
- **Formula**: `∑(TO.quantity) ≤ TR.quantity`
- **Enforcement**: Database trigger + API validation

### BR-TO-002: Partial Allocation
- TR can have status "Partially Allocated" if remaining quantity > 0
- **Enforcement**: Status calculation logic

### BR-TO-003: Full Allocation
- TR status = "Fully Allocated" when remaining quantity = 0
- **Enforcement**: Status calculation logic

### BR-TO-004: TO Cancellation
- Cancelled TO quantity returns to TR remaining quantity
- **Enforcement**: Update trigger

### BR-TO-005: TR Completion
- TR cannot be marked "Completed" until all TOs completed
- **Enforcement**: Status validation

---

## Data Model

```typescript
TransferRequisition {
  // ... existing fields ...
  
  total_quantity: Decimal
  allocated_quantity: Decimal (sum of TO quantities)
  remaining_quantity: Decimal (computed: total - allocated)
  
  allocation_status: Enum (
    Available_For_Planning,
    Partially_Allocated,
    Fully_Allocated
  )
  
  to_count: Integer (count of TOs)
}

TransportOrder {
  id: UUID (PK)
  tr_id: UUID (FK to TransferRequisition)
  
  to_number: String (unique)
  allocated_quantity: Decimal
  
  // Inherited from TR (read-only)
  source_poi_id: UUID
  destination_poi_id: UUID
  product_id: UUID
  
  fleet_type: Enum (Own_Fleet, Vendor_Fleet)
  status: Enum (...)
  
  created_at: Timestamp
}
```

---

## UI/UX Requirements

### TR Detail Page with TO Creation
```
┌─────────────────────────────────────────────────────────────┐
│ TR: TR-FG-20260211-0042                                     │
│ Route: Bhaluka → Mirpur | Product: Live Broiler            │
├─────────────────────────────────────────────────────────────┤
│ Quantity Allocation:                                        │
│ Total: 1000 KG                                              │
│ Allocated: 600 KG (60%) ████████░░                          │
│ Remaining: 400 KG                                           │
│                                                             │
│ Status: Partially Allocated                                 │
│                                                             │
│ [+ Create Transport Order]                                  │
│                                                             │
│ Transport Orders (2):                                       │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ TO-20260211-0101 | 600 KG | Own Fleet    | ✅ Assigned│   │
│ │ TO-20260211-0102 | (pending creation)                 │   │
│ └───────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### TO Creation Modal
```
┌─────────────────────────────────────────┐
│ Create TO from TR-FG-20260211-0042      │
├─────────────────────────────────────────┤
│ TR Total: 1000 KG                       │
│ Already Allocated: 600 KG               │
│ Remaining: 400 KG                       │
│                                         │
│ TO Quantity: *                          │
│ [400] KG                                │
│ ✓ This will fully allocate the TR      │
│                                         │
│ Fleet Type: *                           │
│ ⚪ Own Fleet  ⚪ Vendor Fleet            │
│                                         │
│ [Cancel] [Create TO] [Create & Add More]│
└─────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
// Get TR with TO allocation details
GET /api/v1/transfer-requisitions/{tr_id}/allocation
Response: {
  tr, total_quantity, allocated_quantity,
  remaining_quantity, tos: [...]
}

// Create TO from TR
POST /api/v1/transport-orders/from-tr
Body: {
  tr_id, allocated_quantity, fleet_type
}
Response: {
  to, tr_remaining_quantity
}

// Get TOs for TR
GET /api/v1/transfer-requisitions/{tr_id}/transport-orders
Response: {tos: TransportOrder[]}

// Cancel TO (releases quantity)
DELETE /api/v1/transport-orders/{to_id}
Response: {tr_remaining_quantity}
```

---

## Testing Scenarios

### Happy Path
1. Create first TO (600 KG) → TR status = "Partially Allocated"
2. Create second TO (400 KG) → TR status = "Fully Allocated"
3. Cancel second TO → TR status = "Partially Allocated", remaining = 400 KG

### Edge Cases
1. **Attempt over-allocation**: Error, "Exceeds remaining quantity"
2. **Create 10 small TOs**: Warning, "Consider fewer TOs"
3. **Cancel all TOs**: TR status = "Available for Planning"

---

## Dependencies

### Prerequisites
- ✅ US-015: TR Assessment

### Enables
- → US-018: TO Creation (detailed implementation)
- → US-021: Trip Lifecycle

---

## Definition of Done
- [ ] Multi-TO creation working
- [ ] Quantity tracking accurate
- [ ] TR status auto-update
- [ ] TO cancellation releases quantity
- [ ] Unit tests > 85%
- [ ] Integration tests (TR-TO workflow)
- [ ] UAT approved

---

**Story Points**: 8  
**Estimated Hours**: 64 hours  
**Sprint**: Sprint 3  
**Priority**: Critical

**Note**: See US-018 for detailed TO creation workflow implementation.

