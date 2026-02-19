---
title: Transport Order (TO) Creation by Transport Planner
story_id: US-018
phase: phase-1
module: Transport Management
priority: Critical
status: Pending
epic: Transport Order Management
epic_id: EPIC-004
epic_name: POI Management & Geofencing
sprint: Sprint 3
story_points: 8
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../03-module-specifications/03-core-operations/transport-order-management.md
  - ../../../03-module-specifications/03-core-operations/transport-requisition-management.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-017-tr-assessment.md
  - US-020-to-execution-own-fleet.md
  - US-021-to-execution-vendor-fleet.md
dependencies:
  - US-015-pr-approval-distribution.md (Must have approved TRs)
  - US-001-vehicle-master-data.md (Must have vehicle data)
tags: [transport, to-creation, critical, workflow]
---

# US-018: Transport Order (TO) Creation by Transport Planner

## User Story

**As a** Transport Planner  
**I want to** create one or multiple Transport Orders (TOs) from a single approved Transport Requisition (TR)  
**So that** transport can be executed efficiently with flexible quantity allocation and fleet type selection

## Business Context

Transport Orders (TOs) are the executable units of transport work. While TRs represent the transport requirement, TOs represent the actual execution plan. The ability to split a single TR into multiple TOs provides flexibility for:

**Business Benefits**:
- **Partial fulfillment**: Start transport while waiting for full fleet availability
- **Fleet optimization**: Mix own fleet and vendor fleet based on availability
- **Load balancing**: Distribute load across multiple vehicles/trips
- **Risk mitigation**: Avoid putting all goods on single vehicle
- **Phased delivery**: Deliver in multiple batches based on destination readiness

**Without Multi-TO Capability**:
- Forced to wait for complete fleet availability
- Cannot optimize between own and vendor fleet
- Higher risk with large single shipments
- Less flexibility in delivery scheduling

## Acceptance Criteria

### Must Have (Critical)

#### TO Creation from TR
- [ ] System SHALL allow Transport Planner to create TOs only from approved TRs
- [ ] System SHALL display list of approved TRs with status "Approved" and "Available for Planning"
- [ ] System SHALL show TR details: ID, Source POI, Destination POI, Product, Quantity, Delivery Date, Vehicle Requirements
- [ ] System SHALL allow creating multiple TOs from a single TR (partial allocation)
- [ ] System SHALL support creating full quantity TO or partial quantity TOs

#### Quantity Management
- [ ] System SHALL enforce that total TO quantity does not exceed approved TR quantity
- [ ] System SHALL track remaining TR quantity after each TO creation
- [ ] System SHALL validate allocated quantity per TO ≤ remaining TR quantity
- [ ] System SHALL display remaining quantity available for additional TOs
- [ ] System SHALL prevent TO creation when TR quantity is fully allocated

#### Fleet Type Selection
- [ ] System SHALL enforce selection of exactly one fleet type per TO (Own Fleet OR Vendor Fleet)
- [ ] System SHALL display real-time availability counts for Own Fleet vs Vendor Fleet
- [ ] System SHALL allow Transport Planner to decide fleet type based on availability
- [ ] System SHALL prevent changing fleet type after TO is created

#### TO Attributes
- [ ] System SHALL inherit and lock product attributes from TR (read-only in TO)
- [ ] System SHALL allow Transport Planner to set planned delivery date per TO
- [ ] System SHALL auto-generate unique TO ID for each created TO
- [ ] System SHALL link TO to parent TR for traceability
- [ ] System SHALL capture TO creation timestamp and creator

#### Routing & Forwarding
- [ ] System SHALL forward TO to respective TDO based on fleet type:
  - Own Fleet TOs → TDO (Own Fleet)
  - Vendor Fleet TOs → TDO (Vendor Fleet)
- [ ] System SHALL update TR status to "Partially Allocated" or "Fully Allocated"
- [ ] System SHALL update TO status to "Planned" after creation

### Should Have (High)
- [ ] System SHOULD provide quick actions for common scenarios:
  - "Create Single TO (Full Quantity)" - one-click TO creation
  - "Split Equally" - create multiple TOs with equal distribution
  - "Create Template TO" - save TO template for similar TRs
- [ ] System SHOULD show fleet utilization dashboard to aid decision
- [ ] System SHOULD suggest optimal fleet type based on availability and cost
- [ ] System SHOULD allow adding remarks/notes to TO
- [ ] System SHOULD support TO draft (save without forwarding)

### Nice to Have (Medium)
- [ ] System MAY show historical TO creation patterns for similar TRs
- [ ] System MAY provide cost estimates for Own vs Vendor fleet
- [ ] System MAY highlight urgent TRs based on delivery date
- [ ] System MAY support TO templates for common routes

## Functional Requirements

### FR-001: TR Selection & Display
- [Critical] System SHALL display approved TRs in sortable, filterable list
- [Critical] System SHALL filter TRs by: Date, Source POI, Destination POI, Urgency, Transfer Type
- [Critical] System SHALL show TR card with key information and "Create TO" action
- [High] System SHALL support search by TR ID

**TR List Columns**:
- TR ID
- Transfer Type (FG / Port)
- Source POI → Destination POI
- Product(s) (with count if multiple)
- Total Quantity (with UOM)
- Remaining Quantity
- Delivery Date
- Urgency (Normal / High / Critical)
- Status
- Actions (Create TO, View Details)

### FR-002: TO Creation Form
- [Critical] System SHALL display multi-step TO creation form:
  - Step 1: Select TR (if not pre-selected)
  - Step 2: Enter TO quantity
  - Step 3: Select fleet type
  - Step 4: Set planned delivery date
  - Step 5: Review and confirm
- [Critical] System SHALL pre-fill product details from TR (read-only)
- [Critical] System SHALL calculate and display remaining TR quantity in real-time
- [High] System SHALL provide form validation at each step

**Pre-filled Fields (from TR)**:
- Source POI
- Destination POI
- Product Item Code, Name, Category
- Total Available Quantity (from TR)
- UOM, Weight per Unit, Packing Type

**Editable Fields**:
- Allocated Quantity for this TO
- Fleet Type (Own / Vendor)
- Planned Delivery Date
- Remarks (optional)

### FR-003: Fleet Type Selection
- [Critical] System SHALL display fleet availability widget:
  ```
  Own Fleet: [25 vehicles available]
  Vendor Fleet: [Active vendors: 15, Avg response time: 2 hrs]
  ```
- [Critical] System SHALL allow selecting only one fleet type via radio buttons
- [Critical] System SHALL disable "Create TO" if no fleet type selected
- [High] System SHALL show vehicle type availability breakdown for Own Fleet

### FR-004: Quantity Allocation Logic
- [Critical] System SHALL validate: `TO Quantity ≤ Remaining TR Quantity`
- [Critical] System SHALL update: `Remaining TR Quantity = Original - Sum(TO Quantities)`
- [Critical] System SHALL prevent negative remaining quantity
- [Critical] System SHALL display error if quantity exceeds remaining
- [High] System SHALL suggest: "Remaining quantity: X. Allocate all?" if creating last TO

### FR-005: Multiple TO Creation Workflow
- [High] System SHALL support creating additional TOs immediately after first
- [High] System SHALL display: "TO [ID] created. Remaining quantity: X. Create another TO?"
- [High] System SHALL allow: "Yes, create another" or "No, return to TR list"
- [High] System SHALL maintain TR context when creating multiple TOs

### FR-006: TO Submission & Routing
- [Critical] System SHALL generate unique TO ID: Format `TO-YYYYMMDD-XXXX`
- [Critical] System SHALL save TO to database with status "Planned"
- [Critical] System SHALL link TO to parent TR (foreign key relationship)
- [Critical] System SHALL route TO based on fleet type:
  - Own Fleet → Add to TDO (Own) work queue
  - Vendor Fleet → Add to TDO (Vendor) work queue
- [Critical] System SHALL update TR status:
  - "Partially Allocated" if remaining quantity > 0
  - "Fully Allocated" if remaining quantity = 0
- [High] System SHALL send notification to respective TDO

### FR-007: Data Integrity & Validation
- [Critical] System SHALL implement transaction-based TO creation (rollback on error)
- [Critical] System SHALL prevent concurrent TO creation exceeding TR quantity
- [Critical] System SHALL lock TR during TO creation to prevent race conditions
- [High] System SHALL log all TO creation attempts (success and failure)

## Business Rules

### BR-001: TR Approval Prerequisite
- **Rule**: TOs can only be created from approved TRs
- **Validation**: System SHALL filter only TRs with status "Approved"
- **Impact**: Ensures proper approval workflow

### BR-002: Quantity Conservation
- **Rule**: Sum of TO quantities cannot exceed TR quantity
- **Formula**: `∑(TO Quantities) ≤ TR Quantity`
- **Validation**: Real-time validation on quantity entry
- **Impact**: Prevents over-allocation

### BR-003: Fleet Type Immutability
- **Rule**: Fleet type cannot be changed after TO creation
- **Rationale**: TO is already forwarded to specific TDO
- **Validation**: Fleet type field locked after save
- **Exception**: Can delete TO and recreate

### BR-004: Product Attribute Lock
- **Rule**: Product attributes inherited from TR are read-only
- **Attributes**: Item code, name, category, UOM, weight, packing type
- **Rationale**: Ensure data consistency with TR
- **Impact**: Prevents data divergence

### BR-005: Planned Date Constraint
- **Rule**: TO planned delivery date should be ≤ TR requested delivery date
- **Validation**: Warning (not blocking) if TO date > TR date
- **Impact**: Helps meet TR timeline

### BR-006: TR Status Update
- **Rule**: TR status automatically updates based on allocation
- **Logic**:
  ```
  if (remaining quantity > 0) → "Partially Allocated"
  if (remaining quantity = 0) → "Fully Allocated"
  ```
- **Impact**: Clear TR completion tracking

## Data Model

```typescript
TransportOrder {
  id: UUID (PK)
  to_number: String (unique, format: TO-YYYYMMDD-XXXX)
  tenant_id: UUID (FK)
  tr_id: UUID (FK to TransportRequisition)
  
  // Inherited from TR (read-only)
  source_poi_id: UUID (FK)
  destination_poi_id: UUID (FK)
  product_id: UUID (FK)
  transfer_type: Enum (FG_Transfer, Port_Consignment)
  
  // TO-specific
  allocated_quantity: Decimal
  uom: String
  fleet_type: Enum (Own_Fleet, Vendor_Fleet)
  planned_delivery_date: Date
  
  // Status and workflow
  status: Enum (Draft, Planned, Assigned, Dispatched, ...)
  
  // Assignments (nullable until assigned)
  assigned_tdo_id: UUID (FK to User, nullable)
  assigned_vehicle_id: UUID (FK to Vehicle, nullable)
  assigned_driver_id: UUID (FK to Driver, nullable)
  assigned_vendor_id: UUID (FK to Vendor, nullable)
  
  // Metadata
  remarks: Text (optional)
  created_at: Timestamp
  created_by: UUID (FK to User)
  updated_at: Timestamp
  updated_by: UUID (FK to User)
}

// TR update tracking
TransportRequisition {
  ...existing fields...
  allocated_quantity: Decimal (sum of TO quantities)
  remaining_quantity: Decimal (computed)
  allocation_status: Enum (Available, Partially_Allocated, Fully_Allocated)
  to_count: Integer (number of TOs created)
}
```

## UI/UX Requirements

### TR List Page
- **Layout**: Card-based or table view (toggle)
- **Filters**: Date range, Source/Destination POI, Transfer type, Urgency
- **Sorting**: By delivery date, urgency, TR ID
- **Action**: "Create TO" button per TR
- **Visual Indicators**:
  - 🔴 Red badge for Critical urgency
  - 🟠 Orange badge for High urgency
  - 🟢 Green badge for Normal urgency
  - Progress bar for allocated vs remaining quantity

### TO Creation Modal/Page
- **Layout**: Step-by-step wizard or single form
- **Step 1 - TR Summary**:
  - Read-only TR details
  - Highlight: Total quantity, Remaining quantity, Delivery date
- **Step 2 - Quantity Entry**:
  - Large input for TO quantity
  - Real-time display: "Remaining: X after this TO"
  - Validation message if exceeds
  - Quick actions: "Use all remaining", "Split equally"
- **Step 3 - Fleet Selection**:
  - Radio buttons: Own Fleet / Vendor Fleet
  - Availability cards showing count
  - Helper text: "Recommended: Own Fleet (5 vehicles available)"
- **Step 4 - Delivery Date**:
  - Date picker with TR date highlighted
  - Warning if selected date > TR date
- **Step 5 - Review**:
  - Summary of all entries
  - "Create TO" and "Create Another TO" buttons

### Fleet Availability Widget
```
┌─────────────────────────────────────────┐
│ Fleet Availability                       │
├─────────────────────────────────────────┤
│ 🚛 Own Fleet                             │
│ Available: 25 vehicles                   │
│ └ Trucks: 15, Vans: 10                  │
│                                          │
│ 🤝 Vendor Fleet                          │
│ Active Vendors: 15                       │
│ Avg Bid Response: 2 hours               │
└─────────────────────────────────────────┘
```

## API Endpoints

```typescript
// Get approved TRs
GET /api/v1/transport-requisitions?status=approved&available_for_planning=true

// Get TR details for TO creation
GET /api/v1/transport-requisitions/{tr_id}/for-to-creation
Response: {
  tr: {...},
  remaining_quantity: number,
  existing_tos: [...],
  fleet_availability: {...}
}

// Create TO
POST /api/v1/transport-orders
Body: {
  tr_id: UUID,
  allocated_quantity: number,
  fleet_type: 'Own_Fleet' | 'Vendor_Fleet',
  planned_delivery_date: Date,
  remarks?: string
}
Response: {
  to: {...},
  tr_remaining_quantity: number
}

// Validate TO quantity
POST /api/v1/transport-orders/validate-quantity
Body: {
  tr_id: UUID,
  proposed_quantity: number
}
Response: {
  valid: boolean,
  remaining_quantity: number,
  error?: string
}

// Get fleet availability
GET /api/v1/fleet/availability
Response: {
  own_fleet: {
    available_count: number,
    by_type: {...}
  },
  vendor_fleet: {
    active_vendor_count: number,
    avg_response_time_hours: number
  }
}
```

## Testing Scenarios

### Happy Path
1. **Create Full Quantity TO**
   - Select TR with 100 MT remaining
   - Enter 100 MT for TO
   - Select Own Fleet
   - Set delivery date
   - Submit
   - **Expected**: TO created, TR status = "Fully Allocated", remaining = 0

2. **Create Partial TO**
   - Select TR with 100 MT remaining
   - Create TO 1: 60 MT, Own Fleet
   - **Expected**: TO-1 created, TR remaining = 40 MT
   - Create TO 2: 40 MT, Vendor Fleet
   - **Expected**: TO-2 created, TR status = "Fully Allocated", remaining = 0

3. **Mixed Fleet TOs**
   - TR: 150 MT
   - TO-1: 100 MT, Own Fleet
   - TO-2: 50 MT, Vendor Fleet
   - **Expected**: Both TOs routed to respective TDOs

### Edge Cases
1. **Exceed Remaining Quantity**
   - TR remaining: 40 MT
   - Try to create TO: 50 MT
   - **Expected**: Error message, TO not created

2. **Concurrent TO Creation**
   - Two planners create TOs simultaneously from same TR
   - Combined quantity exceeds TR
   - **Expected**: Second TO fails with error, first succeeds

3. **No Fleet Type Selected**
   - Fill all fields except fleet type
   - Try to submit
   - **Expected**: Validation error, "Fleet type required"

4. **Change Fleet Type After Creation**
   - Create TO with Own Fleet
   - Try to edit and change to Vendor Fleet
   - **Expected**: Fleet type field disabled, error if forced

### Error Scenarios
1. **TR Not Found**: Clear error message
2. **Network Failure**: Retry option, data not lost
3. **Database Error**: Transaction rollback, user notified
4. **Validation Failure**: Clear inline error messages

## Dependencies

### Prerequisites
- ✅ US-015: Distribution Approval (must have approved TRs)
- ✅ US-001: Vehicle Master Data (for fleet availability check)
- ✅ US-003: Vendor Master Data (for vendor fleet count)

### Enables
- → US-020: TO Execution - Own Fleet (receives TOs)
- → US-021: TO Execution - Vendor Fleet (receives TOs)
- → US-025: Trip Lifecycle Management (requires TO)
- → US-060: Trip Costing (requires TO)

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Transaction handling for quantity allocation
- [ ] Concurrent TO creation handled (race condition prevented)
- [ ] All API endpoints implemented and documented
- [ ] Unit tests: coverage > 85%
- [ ] Integration tests: TR-to-TO workflow tested
- [ ] UI: All steps functional and responsive
- [ ] Error handling: All scenarios covered
- [ ] Performance: TO creation < 2 seconds
- [ ] Code review approved
- [ ] UAT: Product owner sign-off
- [ ] Documentation: User guide updated

---

**Story Points**: 8  
**Estimated Hours**: 64 hours  
**Assigned To**: Backend Team (40h) + Frontend Team (24h)  
**Sprint**: Sprint 3  
**Priority**: Critical (Blocks trip execution)

