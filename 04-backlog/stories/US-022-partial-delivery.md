---
title: Partial Delivery Handling
story_id: US-022
phase: phase-1
module: Transport Management
priority: High
status: Pending
epic: Transport Order (TO) Management
epic_id: EPIC-009
epic_name: Transport Order (TO) Management
sprint: Sprint 7
story_points: 5
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../03-module-specifications/03-operations/trip-management.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-021-trip-lifecycle.md
  - US-025-trip-closure-pod.md
dependencies:
  - US-021-trip-lifecycle.md
tags: [transport, partial-delivery, trip, high-priority]
---

# US-022: Partial Delivery Handling

## User Story

**As a** Driver / TDO  
**I want to** record partial deliveries when full quantity cannot be delivered  
**So that** partial shipments are properly documented and remaining quantity can be rescheduled

## Business Context

Partial deliveries occur when:
- Destination cannot accept full quantity (capacity, quality issues)
- Product damage during transit (some items unusable)
- Customer request (accept partial, reject rest)
- Vehicle breakdown (deliver what's possible)

**Without Partial Delivery Support**:
- Cannot close trip (waiting for full delivery)
- Inaccurate inventory records
- Billing disputes
- Poor customer satisfaction

---

## Acceptance Criteria

### AC-1: Partial Delivery Declaration
- [ ] System SHALL allow driver to declare partial delivery
- [ ] System SHALL capture:
  - Delivered quantity
  - Remaining quantity
  - Reason for partial delivery
  - Photos (optional)
- [ ] System SHALL validate delivered quantity < total quantity

### AC-2: Quantity Reconciliation
- [ ] System SHALL calculate:
  - Original quantity
  - Delivered quantity
  - Remaining quantity
  - Delivery percentage
- [ ] System SHALL update trip status to "Partially Delivered"
- [ ] System SHALL create POD for delivered quantity

### AC-3: Remaining Quantity Handling
- [ ] System SHALL allow selecting action for remaining quantity:
  - Return to source
  - Deliver to alternate location
  - Dispose (with approval)
  - Reschedule delivery
- [ ] System SHALL create follow-up TO if rescheduled

### AC-4: Notifications & Approvals
- [ ] System SHALL notify:
  - TDO (immediate)
  - Transport Planner
  - Customer (if applicable)
- [ ] System SHALL require TDO approval for partial delivery
- [ ] System SHALL escalate if high-value shipment

---

## Functional Requirements

### FR-001: Partial Delivery Form
- [Critical] Quantity input with validation
- [Critical] Reason dropdown (capacity, damage, customer, other)
- [High] Photo upload capability
- [High] Remaining quantity action selection

### FR-002: Approval Workflow
- [High] TDO approval required for partial delivery
- [High] Auto-approve if < 10% variance
- [Medium] Escalation for > 50% variance

### FR-003: Follow-up TO Creation
- [High] Auto-create TO for remaining quantity
- [Medium] Link to original trip

---

## Business Rules

### BR-PARTIAL-001: Minimum Delivery
- At least 50% must be delivered (configurable)
- **Enforcement**: Validation check

### BR-PARTIAL-002: Approval Threshold
- < 10% variance: Auto-approve
- 10-50% variance: TDO approval
- > 50% variance: Manager approval
- **Enforcement**: Approval routing logic

---

## Data Model

```typescript
Trip {
  // ... existing fields ...
  
  delivery_type: Enum (Full, Partial)
  delivered_quantity: Decimal (nullable)
  remaining_quantity: Decimal (nullable)
  partial_delivery_reason: Text (nullable)
  partial_delivery_approved_by: UUID (FK, nullable)
}

PartialDelivery {
  id: UUID (PK)
  trip_id: UUID (FK)
  
  original_quantity: Decimal
  delivered_quantity: Decimal
  remaining_quantity: Decimal
  delivery_percentage: Decimal
  
  reason: Enum (Capacity, Damage, Customer_Request, Other)
  reason_details: Text
  photos: JSON (array of URLs)
  
  remaining_action: Enum (Return, Alternate, Dispose, Reschedule)
  follow_up_to_id: UUID (FK to TransportOrder, nullable)
  
  reported_by: UUID (FK)
  reported_at: Timestamp
  approved_by: UUID (FK, nullable)
  approved_at: Timestamp (nullable)
}
```

---

## UI/UX Requirements

```
┌─────────────────────────────────────────┐
│ Declare Partial Delivery                │
├─────────────────────────────────────────┤
│ Original Quantity: 1000 KG              │
│                                         │
│ Delivered Quantity: *                   │
│ [600] KG (60%)                          │
│                                         │
│ Remaining: 400 KG (40%)                 │
│ ⚠️ Requires TDO Approval                │
│                                         │
│ Reason: *                               │
│ [Destination Capacity Issue   ▼]        │
│                                         │
│ Details:                                │
│ ┌─────────────────────────────────────┐ │
│ │ Warehouse full, can only accept 600 │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Photos: [📷 Add Photos]                 │
│                                         │
│ Remaining Quantity Action: *            │
│ ⚪ Return to Source                     │
│ ⚪ Reschedule Delivery                  │
│ ⚪ Deliver to Alternate Location        │
│                                         │
│ [Cancel]              [Submit]          │
└─────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
POST /api/v1/trips/{trip_id}/partial-delivery
Body: {
  delivered_quantity, remaining_quantity,
  reason, reason_details, photos?,
  remaining_action
}

POST /api/v1/partial-deliveries/{id}/approve
Body: {approved_by_user_id}
```

---

## Testing Scenarios

### Happy Path
1. Driver delivers 60% → Declares partial
2. TDO approves → Trip status updated
3. Follow-up TO created → Remaining 40% rescheduled

### Edge Cases
1. **< 50% delivered**: Requires manager approval
2. **No reason provided**: Validation error

---

## Dependencies

### Prerequisites
- ✅ US-021: Trip Lifecycle

### Enables
- → Better delivery flexibility
- → Accurate inventory tracking

---

## Definition of Done
- [ ] Partial delivery form functional
- [ ] Approval workflow working
- [ ] Follow-up TO creation
- [ ] Notifications sent
- [ ] Unit tests > 80%
- [ ] UAT approved

---

**Story Points**: 5  
**Estimated Hours**: 40 hours  
**Sprint**: Sprint 6  
**Priority**: High

