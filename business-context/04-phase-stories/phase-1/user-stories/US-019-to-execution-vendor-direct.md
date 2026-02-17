---
title: TO Execution - Vendor Fleet (Direct Assignment)
story_id: US-019
phase: phase-1
module: Transport Management
priority: Critical
status: Pending
epic: Transport Order Execution
sprint: Sprint 4
story_points: 5
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../source-documents/requirements/PRD_DFMS_v1.0.md
  - ../../../03-module-specifications/03-core-operations/transport-order-management.md
  - ../../../03-module-specifications/05-vendor-management/vendor-onboarding.md
related_stories:
  - US-020-to-execution-own-fleet.md
  - US-024-vendor-bidding-portal.md
dependencies:
  - US-017-to-creation-multiple.md
  - US-004-vendor-master-data.md
tags: [transport, vendor, direct-assignment, critical]
---

# US-019: TO Execution - Vendor Fleet (Direct Assignment)

## User Story

**As a** TDO (Vendor Fleet)  
**I want to** directly assign Transport Orders to contractual vendors without bidding  
**So that** pre-agreed vendor contracts can be executed efficiently

## Business Context

**Two Vendor Assignment Methods**:
1. **Direct Assignment** (this story): For contractual vendors with pre-agreed rates
2. **Bidding** (US-024): For non-contractual vendors via competitive bidding

**When to Use Direct Assignment**:
- Vendor has existing contract with fixed rates
- Urgent delivery (no time for bidding)
- Preferred vendor relationship
- Long-term partnership agreements

**Direct Assignment Benefits**:
- Faster execution (no bidding delay)
- Predictable costs (pre-agreed rates)
- Reliable service (trusted vendors)
- Simplified workflow

---

## Acceptance Criteria

### AC-1: Contractual Vendor Selection
- [ ] System SHALL display list of verified contractual vendors
- [ ] System SHALL filter vendors by:
  - Verification status = "Verified"
  - Vendor type = "Contractual"
  - Has available fleet matching TO requirements
- [ ] System SHALL show vendor details:
  - Company name
  - Contact person
  - Available vehicles
  - Contract rate (per km or per trip)
  - Performance rating

### AC-2: Direct TO Assignment
- [ ] System SHALL allow TDO to select vendor from list
- [ ] System SHALL display TO details to be assigned
- [ ] System SHALL show estimated cost based on contract rate
- [ ] System SHALL require TDO to specify:
  - Selected vendor
  - Vehicle registration (from vendor's fleet)
  - Driver name and phone
  - Helper (optional)
  - Planned pickup date/time
- [ ] System SHALL validate vehicle capacity vs TO quantity

### AC-3: Vendor Notification
- [ ] System SHALL send TO assignment notification to vendor:
  - TO details (number, route, product, quantity)
  - Pickup date/time
  - Delivery date/time
  - Special instructions
  - Contact person
- [ ] System SHALL send via: Email, SMS, In-app notification
- [ ] System SHALL require vendor acknowledgment within 2 hours

### AC-4: TO Status Update
- [ ] System SHALL update TO status to "Assigned" after vendor selection
- [ ] System SHALL link TO to vendor, vehicle, and driver
- [ ] System SHALL calculate trip cost based on contract rate
- [ ] System SHALL track assignment timestamp and assigner

### AC-5: Vendor Acknowledgment
- [ ] System SHALL allow vendor to acknowledge TO assignment
- [ ] System SHALL update TO status to "Acknowledged" after vendor confirms
- [ ] System SHALL allow vendor to reject assignment (with reason)
- [ ] System SHALL alert TDO if vendor rejects or doesn't acknowledge within 2 hours

---

## Functional Requirements

### FR-001: Vendor Selection UI
- [Critical] Contractual vendor list with filtering
- [Critical] Vendor detail modal showing fleet and rates
- [High] Vendor performance history display
- [Medium] Vendor recommendation based on past performance

### FR-002: Assignment Workflow
- [Critical] TO assignment form with vendor/vehicle/driver selection
- [Critical] Cost calculation based on contract rate
- [High] Assignment confirmation dialog
- [Medium] Assignment templates for frequent routes

### FR-003: Notification System
- [Critical] Multi-channel notifications (email, SMS, in-app)
- [Critical] Acknowledgment tracking
- [High] Escalation if no acknowledgment within 2 hours
- [Medium] Reminder notifications

### FR-004: Vendor Portal Integration
- [High] Vendor can view assigned TOs in their portal
- [High] Vendor can acknowledge/reject assignments
- [Medium] Vendor can update vehicle/driver details

---

## Business Rules

### BR-VEN-001: Contractual Vendor Only
- Only contractual vendors can receive direct assignments
- **Enforcement**: Vendor type filter

### BR-VEN-002: Verified Vendor Requirement
- Only verified vendors can be assigned TOs
- **Enforcement**: Verification status check

### BR-VEN-003: Vehicle Capacity
- Assigned vehicle capacity must be ≥ TO quantity
- **Enforcement**: Validation check

### BR-VEN-004: Acknowledgment Timeout
- Vendor must acknowledge within 2 hours
- **Enforcement**: Cron job checking acknowledgment status

### BR-VEN-005: Cost Calculation
- Cost = Distance × Contract Rate (per km) OR Fixed Contract Rate
- **Enforcement**: Calculation logic

---

## Data Model

```typescript
TransportOrder {
  // ... existing fields ...
  
  // Vendor assignment fields
  assigned_vendor_id: UUID (FK to Vendor, nullable)
  vendor_vehicle_registration: String (nullable)
  vendor_driver_name: String (nullable)
  vendor_driver_phone: String (nullable)
  vendor_helper_name: String (nullable)
  
  assignment_type: Enum (Direct, Bidding)
  assigned_at: Timestamp (nullable)
  assigned_by: UUID (FK to User, nullable)
  
  vendor_acknowledged_at: Timestamp (nullable)
  vendor_rejection_reason: Text (nullable)
  
  estimated_cost: Decimal (nullable)
  contract_rate_applied: Decimal (nullable)
}
```

---

## UI/UX Requirements

### Vendor Selection Page
```
┌─────────────────────────────────────────────────────────────┐
│ Assign TO to Vendor (Direct Assignment)                     │
│ TO: TO-20260211-0042 | Bhaluka → Mirpur | 500 KG           │
├─────────────────────────────────────────────────────────────┤
│ Contractual Vendors (5):                                    │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ ☑ ABC Logistics                          ⭐4.5/5      │   │
│ │   Available Vehicles: 8 (Covered Van, Open Truck)     │   │
│ │   Contract Rate: BDT 100/km                           │   │
│ │   Est. Cost: BDT 4,500 (45 km × 100)                  │   │
│ │   Last Used: 2 days ago | On-time: 95%                │   │
│ │   [Select Vendor]                                     │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ ☐ XYZ Transport                          ⭐4.2/5      │   │
│ │   Available Vehicles: 5 (Covered Van)                 │   │
│ │   Contract Rate: BDT 110/km                           │   │
│ │   Est. Cost: BDT 4,950 (45 km × 110)                  │   │
│ │   [Select Vendor]                                     │   │
│ └───────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Assignment Details Form
```
┌─────────────────────────────────────────┐
│ Assign TO to ABC Logistics              │
├─────────────────────────────────────────┤
│ Vehicle Registration: *                 │
│ [Select from ABC's fleet...   ▼]        │
│ • DM-11-9999 (Covered Van, 5 MT)        │
│                                         │
│ Driver Name: *                          │
│ [Rahim Ahmed]                           │
│                                         │
│ Driver Phone: *                         │
│ [01711-123456]                          │
│                                         │
│ Helper Name: (Optional)                 │
│ [Karim Mia]                             │
│                                         │
│ Planned Pickup:                         │
│ [2026-02-13] [08:00 AM]                 │
│                                         │
│ Estimated Cost: BDT 4,500               │
│ (Based on contract rate: BDT 100/km)    │
│                                         │
│ [Cancel]              [Assign TO]       │
└─────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
// Get contractual vendors
GET /api/v1/vendors/contractual
Query: ?vehicle_type=Covered_Van&verified=true

// Assign TO to vendor (direct)
POST /api/v1/transport-orders/{to_id}/assign-vendor
Body: {
  vendor_id, vehicle_registration,
  driver_name, driver_phone,
  helper_name?, planned_pickup_datetime
}
Response: {to, estimated_cost}

// Vendor acknowledges TO
POST /api/v1/transport-orders/{to_id}/acknowledge
Body: {acknowledged_by_vendor_user_id}

// Vendor rejects TO
POST /api/v1/transport-orders/{to_id}/reject
Body: {rejection_reason}

// Get vendor's assigned TOs
GET /api/v1/vendors/me/assigned-tos
Response: {tos: TransportOrder[]}
```

---

## Testing Scenarios

### Happy Path
1. TDO selects contractual vendor → Vendor list displayed
2. TDO assigns TO with vehicle/driver details → TO assigned
3. Vendor receives notification → Acknowledges within 2 hours
4. TO status = "Acknowledged" → Ready for execution

### Edge Cases
1. **No contractual vendors available**: Show message, suggest bidding
2. **Vendor doesn't acknowledge within 2 hours**: Alert TDO, allow reassignment
3. **Vendor rejects assignment**: Notify TDO, allow selecting another vendor
4. **Vehicle capacity insufficient**: Validation error

---

## Dependencies

### Prerequisites
- ✅ US-017: TO Creation
- ✅ US-004: Vendor Master Data

### Enables
- → US-021: Trip Lifecycle Management

---

## Definition of Done
- [ ] Contractual vendor list working
- [ ] Direct assignment functional
- [ ] Cost calculation accurate
- [ ] Vendor notifications sent
- [ ] Acknowledgment tracking working
- [ ] Vendor portal integration
- [ ] Unit tests > 85%
- [ ] UAT approved

---

**Story Points**: 5  
**Estimated Hours**: 40 hours  
**Sprint**: Sprint 4  
**Priority**: Critical

