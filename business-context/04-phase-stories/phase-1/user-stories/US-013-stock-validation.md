---
title: Stock Validation (Source & Destination)
story_id: US-013
phase: phase-1
module: Product Requisition Management
priority: High
status: Pending
epic: Product Requisition Workflow
sprint: Sprint 3
story_points: 3
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../03-module-specifications/03-core-operations/product-requisition-management.md
related_stories:
  - US-009-fg-transfer-requisition.md
  - US-014-capacity-checking.md
dependencies:
  - US-009-fg-transfer-requisition.md
tags: [requisition, stock, validation, inventory, high-priority]
---

# US-013: Stock Validation (Source & Destination)

## User Story

**As a** Distribution Officer / Procurement Officer  
**I want** stock and capacity visibility (informational) with threshold-based warnings when creating TRs  
**So that** I can make informed decisions about transport requisitions

## Business Context

Stock validation prevents:
- **Over-allocation**: Creating TRs for products not available at source
- **Destination Overflow**: Sending goods to full warehouses
- **Failed Deliveries**: Trips that cannot be executed due to stock issues

Validation types:
- **Source Validation**: Check if product available at source POI
- **Destination Validation**: Check if destination has capacity to receive

---

## Acceptance Criteria

### AC-1: Source Stock Validation (Informational per PRD)
- [ ] System SHALL display stock visibility (informational) at source POI when TR created
- [ ] System SHALL display current stock level for selected product
- [ ] System SHALL show threshold-based warnings:
  - Warning if requested quantity > available stock
  - Warning if stock level below threshold (e.g., < 20% safety stock)
- [ ] System SHALL allow proceeding with warnings (informational, not blocking)
- [ ] System SHALL update stock display in real-time
- [ ] System SHALL integrate with real-time stock validation at source (per PRD)

### AC-2: Destination Capacity Validation (Informational per PRD)
- [ ] System SHALL display capacity visibility (informational) at destination POI
- [ ] System SHALL display current utilization and available capacity
- [ ] System SHALL show threshold-based warnings:
  - Warning if shipment exceeds available capacity
  - Warning if capacity utilization above threshold (e.g., > 80%)
- [ ] System SHALL allow proceeding with warnings (informational, not blocking)
- [ ] System SHALL integrate with capacity validation at destination (per PRD)

### AC-3: Stock Reservation (Optional)
- [ ] System MAY reserve stock at source when TR approved
- [ ] System MAY release reservation if TR cancelled
- [ ] System MAY show reserved vs available stock

### AC-4: Integration with ERP
- [ ] System SHALL integrate with client ERP for real-time stock data
- [ ] System SHALL handle ERP unavailability gracefully (show warning, allow proceed)
- [ ] System SHALL cache stock data for performance
- [ ] System SHALL refresh stock data on demand

### AC-5: Stock Validation Display
- [ ] System SHALL show stock status indicator:
  - ✅ Green: Stock sufficient
  - ⚠️ Yellow: Stock low (< 20% buffer)
  - ❌ Red: Insufficient stock
- [ ] System SHALL display stock details on TR form
- [ ] System SHALL show last stock update timestamp

---

## Functional Requirements

### FR-001: Stock Check API
- [High] API integration with ERP/WMS for stock data
- [High] Fallback to manual stock entry if ERP unavailable
- [Medium] Stock caching (5-minute cache)
- [Medium] Real-time stock updates via webhook

### FR-002: Validation Logic
- [High] Compare requested quantity vs available stock
- [High] Calculate buffer (e.g., keep 20% safety stock)
- [Medium] Consider pending TRs in stock calculation
- [Medium] Multi-product validation (for TRs with multiple items)

### FR-003: Capacity Check
- [High] Retrieve destination POI capacity from master data
- [High] Calculate current utilization
- [Medium] Consider pending inbound shipments
- [Medium] Product-specific capacity (e.g., cold storage vs dry storage)

---

## Business Rules

### BR-STOCK-001: Validation Timing
- Stock validation occurs at TR creation and approval
- **Enforcement**: API call during form submission

### BR-STOCK-002: Warning vs Blocking
- Stock validation shows warnings but does not block TR creation
- **Rationale**: Stock may arrive before transport execution
- **Enforcement**: Warning display, allow proceed

### BR-STOCK-003: Stock Reservation
- Stock reservation is optional (configurable per tenant)
- **Enforcement**: Feature toggle

### BR-STOCK-004: ERP Integration Failure
- If ERP unavailable, show warning and allow manual override
- **Enforcement**: Try-catch with fallback

---

## Data Model

```typescript
POIStockLevel {
  id: UUID (PK)
  poi_id: UUID (FK)
  product_id: UUID (FK)
  
  available_quantity: Decimal
  reserved_quantity: Decimal
  total_quantity: Decimal (computed)
  
  last_updated_at: Timestamp
  source: Enum (ERP, Manual, Estimated)
}

POICapacity {
  id: UUID (PK)
  poi_id: UUID (FK)
  
  total_capacity_mt: Decimal
  current_utilization_mt: Decimal
  available_capacity_mt: Decimal (computed)
  
  capacity_by_type: JSON (e.g., {cold_storage: 100, dry_storage: 500})
  
  last_updated_at: Timestamp
}

StockReservation {
  id: UUID (PK)
  tr_id: UUID (FK)
  poi_id: UUID (FK)
  product_id: UUID (FK)
  
  reserved_quantity: Decimal
  reservation_status: Enum (Active, Released, Consumed)
  
  reserved_at: Timestamp
  released_at: Timestamp (nullable)
}
```

---

## UI/UX Requirements

### Stock Validation Display on TR Form
```
┌─────────────────────────────────────────┐
│ Product: Live Broiler                   │
│ Quantity: [500] KG                      │
│                                         │
│ Stock at Source (Bhaluka Warehouse):    │
│ ┌─────────────────────────────────────┐ │
│ │ Available: 800 KG ✅                 │ │
│ │ Reserved: 200 KG                    │ │
│ │ After this TR: 100 KG (Low ⚠️)      │ │
│ │ Last Updated: 2 min ago             │ │
│ │ [🔄 Refresh Stock]                  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Capacity at Destination (Mirpur Depot): │
│ ┌─────────────────────────────────────┐ │
│ │ Total Capacity: 5000 KG             │ │
│ │ Current: 4200 KG (84% full)         │ │
│ │ Available: 800 KG ✅                 │ │
│ │ After this TR: 300 KG               │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Stock Warning Modal
```
┌─────────────────────────────────────────┐
│ ⚠️ Stock Validation Warning             │
├─────────────────────────────────────────┤
│ The requested quantity (500 KG) will    │
│ leave only 100 KG at source warehouse.  │
│                                         │
│ This is below the recommended safety    │
│ stock level (20% = 200 KG).             │
│                                         │
│ Do you want to proceed?                 │
│                                         │
│ [Cancel] [Proceed Anyway]               │
└─────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
// Get stock level at POI
GET /api/v1/pois/{poi_id}/stock/{product_id}
Response: {
  available_quantity, reserved_quantity,
  last_updated_at, source
}

// Get POI capacity
GET /api/v1/pois/{poi_id}/capacity
Response: {
  total_capacity, current_utilization,
  available_capacity, capacity_by_type
}

// Validate TR stock
POST /api/v1/transfer-requisitions/validate-stock
Body: {
  source_poi_id, destination_poi_id,
  line_items: [{product_id, quantity}]
}
Response: {
  source_validation: {product_id, available, requested, sufficient, warning},
  destination_validation: {capacity_available, sufficient, warning}
}

// Reserve stock (if feature enabled)
POST /api/v1/stock-reservations
Body: {tr_id, poi_id, product_id, quantity}

// Release reservation
DELETE /api/v1/stock-reservations/{reservation_id}
```

---

## Testing Scenarios

### Happy Path
1. Create TR with sufficient stock → Green indicator
2. Create TR with low stock → Yellow warning, allow proceed
3. Create TR with insufficient stock → Red warning, allow proceed

### Edge Cases
1. **ERP unavailable**: Show warning, allow manual override
2. **Stock data stale**: Show last update time, allow refresh
3. **Multiple products**: Validate each product separately
4. **Destination at capacity**: Warning, allow proceed

---

## Dependencies

### Prerequisites
- ✅ US-009: FG Transfer Requisition

### Enables
- → Better TR quality
- → Reduced failed deliveries

---

## Definition of Done
- [ ] Stock validation API working
- [ ] ERP integration (or mock)
- [ ] Capacity check functional
- [ ] Warning display on TR form
- [ ] Refresh stock button working
- [ ] Stock reservation (if enabled)
- [ ] Unit tests > 80%
- [ ] Integration tests with ERP
- [ ] UAT approved

---

**Story Points**: 3  
**Estimated Hours**: 24 hours  
**Sprint**: Sprint 3  
**Priority**: High (Quality improvement)

