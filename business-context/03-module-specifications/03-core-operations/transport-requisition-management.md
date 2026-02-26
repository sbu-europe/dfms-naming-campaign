---
source_document: PRD_DFMS_v1.0.md
source_sections: Transport Requisition (TR) Creation Process by Distribution Officer (DO), Transport Requisition (TR) Approval Process by Distribution Manager (DM), Transport Request (TR) Assessment, Transport Requisition (TR) Assessment & Review, Transport Requisition (TR) Management
extracted_date: 2026-02-13
last_updated: 2026-02-26
document_type: domain_specification
related_modules: [product-requisition-management, transport-order-management, master-data]
---

# Transport Requisition (TR) Management

## Overview

Transport Requisition (TR) is the **orchestration layer** between **Product Requisitions (PR)** and **Transport Orders (TO)**. It bridges business demand (product transfer needs) with operational execution (transport planning and vehicle allocation).

The TR workflow enables distribution and transport teams to collaboratively plan, review, and approve transport requirements before committing resources. It supports both **Finished Goods transfers** initiated by depot/feed mill operations and **Port Consignment transfers** for imported raw materials.

### Purpose

- Convert approved Product Requisitions into actionable transport plans
- Enable multi-stage review and approval with role-based authority
- Provide visibility of capacity constraints and transport feasibility
- Support flexible fulfillment (partial allocations, multiple TRs per PR)
- Ensure transport planning aligns with business priorities and operational constraints

### Workflow Position

```
Product Requisition (PR) → [Approved]
    ↓
Transport Requisition (TR) → [Created by DO → Reviewed by DM → Approved]
    ↓
Transport Order (TO) → [Created by Transport Planner]
    ↓
Trip → [Assigned to Driver/Vehicle]
```

---

## TR Lifecycle States

| State | Owner | Description |
|-------|-------|-------------|
| **Draft** | Distribution Officer (DO) | TR created from PR but not yet submitted |
| **Pending Approval** | Distribution Manager (DM) | TR submitted, awaiting DM review |
| **Approved** | Transport Planner (TP) | TR approved, visible to Transport Department |
| **Available for Planning** | Transport Planner (TP) | TR ready for TO conversion (all mandatory inputs complete) |
| **Partially Assigned** | Transport Planner (TP) | Some quantity allocated to TOs, remainder pending |
| **Fully Assigned** | Transport Planner (TP) | All TR quantity allocated to one or more TOs |
| **Closed** | System | All linked TOs completed, TR archived |
| **Rejected** | Distribution Manager (DM) | TR rejected during approval (with mandatory remarks) |
| **Cancelled** | Authorized User | TR cancelled before full allocation |

---

## TR Creation by Distribution Officer (DO)

### Purpose

Distribution Officers monitor **approved Product Requisitions** and determine when, how much, and by what route products should be transported. They create Transport Requisitions to communicate these plans to the Distribution Manager for review.

### Workflow

```
1. DO views approved PRs (filtered by POI, product category, transfer type)
2. DO selects a PR and reviews:
   - Product details (code, category, quantity, UOM)
   - Source POI and Destination POI
   - Requested delivery date
   - Real-time capacity snapshot (source/destination)
3. DO creates one or more TRs from the PR:
   - Full or partial quantity allocation
   - Single source → single destination per TR
   - Specify delivery date, vehicle type, estimated vehicle count
4. DO adds remarks (if needed) for overrides or deviations
5. DO submits TR → routed to Distribution Manager (DM)
```

### TR Creation Rules

**Quantity Allocation:**
- TR quantity ≤ remaining unallocated PR quantity
- Multiple TRs allowed per PR (until PR fully allocated)
- Partial allocation supported (e.g., PR for 1000 bags → TR1: 600 bags, TR2: 400 bags)

**Mandatory Fields:**
- Source POI
- Destination POI
- Transfer Quantity
- Delivery Date
- Expected Vehicle Count
- Vehicle Type

**Capacity Validation (Informational):**
- System displays **real-time capacity** for source and destination POIs
- Warnings shown if destination capacity is near/at threshold
- DO can override warnings with mandatory remarks

**Multi-TR Strategy:**
- DO may split a single PR into multiple TRs for:
  - Different delivery dates
  - Different routes (if multiple destinations)
  - Phased fulfillment based on vehicle availability

### Data Model

```typescript
interface TransportRequisition {
  tr_id: string;                    // Auto-generated (e.g., TR-FG-2026-00123)
  pr_id: string;                    // Source Product Requisition
  
  // Route & Schedule
  source_poi_id: string;            // Loading point
  destination_poi_id: string;       // Unloading point
  requested_delivery_date: Date;
  
  // Quantity
  allocated_quantity: number;       // From PR
  uom: string;                      // Bags, Tons, Pieces, Cartons
  weight_tonnage: number;           // Calculated or manual
  
  // Transport Planning Inputs
  expected_vehicle_count: number;   // DO's estimate
  vehicle_type: string;             // Truck, Covered Van, Container
  
  // Metadata
  created_by: string;               // Distribution Officer (DO)
  created_at: Date;
  reviewed_by?: string;             // Distribution Manager (DM)
  approved_at?: Date;
  
  // Status & Approval
  status: TRStatus;
  approval_remarks?: string;        // Mandatory for overrides/rejections
  
  // Traceability
  transfer_type: 'FG_TRANSFER' | 'PORT_TRANSFER';
  pr_reference: {
    product_code: string;
    product_category: string;
    requester_poi: string;
    urgency: 'NORMAL' | 'HIGH' | 'CRITICAL';
  };
}

type TRStatus = 
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'AVAILABLE_FOR_PLANNING'
  | 'PARTIALLY_ASSIGNED'
  | 'FULLY_ASSIGNED'
  | 'CLOSED'
  | 'REJECTED'
  | 'CANCELLED';
```

### UI/UX Behavior

**PR Review Queue (DO View):**
- Filterable by:
  - POI (source or destination)
  - Product Category
  - Transfer Type (FG / Port)
  - PR approval date range
- Display columns:
  - PR ID, Product, Quantity (total / allocated / remaining), Urgency, Delivery Date, Status

**TR Creation Form:**
- Pre-filled context:
  - Product details from PR
  - Requester POI (from PR)
- Editable fields:
  - Source POI, Destination POI (dropdown, filterable)
  - Quantity (max = unallocated PR quantity)
  - Delivery Date
  - Vehicle Type, Expected Vehicle Count
- Real-time validation:
  - Capacity warnings (destination POI)
  - Quantity overflow check
- Remarks field (optional, becomes mandatory if overriding warnings)

---

## TR Approval by Distribution Manager (DM)

### Purpose

Distribution Managers review Transport Requisitions created by DOs to ensure:
- Allocations align with operational priorities
- Capacity constraints are respected
- Resource utilization is optimized
- Delivery schedules are realistic

DMs have authority to **modify** TR quantities, delivery dates, and vehicle requirements before approval.

### Workflow

```
1. DM receives TR in approval queue
2. DM reviews TR details:
   - Source/Destination POI
   - Allocated quantity vs PR total
   - Delivery date
   - Vehicle type and count
   - Real-time capacity snapshot
3. DM may modify:
   - Transfer quantity (increase or decrease within PR limits)
   - Delivery date
   - Vehicle type/count
4. DM approves or rejects TR:
   - Approval: TR forwarded to Transport Department
   - Rejection: TR returned to DO with mandatory remarks
5. Approved TR locked from further DO modification
```

### Approval Authority & Rules

**Modification Permissions:**
- DM can modify TR quantities for each source/destination pair
- DM can adjust delivery dates
- DM can change vehicle type and expected count
- All modifications require **mandatory remarks** explaining rationale

**Approval Validation:**
- Modified TR quantity must not exceed remaining PR quantity
- System re-validates capacity constraints after modification
- DM cannot approve TR if critical validation errors exist

**Post-Approval Effects:**
- TR status changes to `APPROVED`
- TR visible to Transport Department (Transport Planner role)
- DO users lose edit access (read-only view)
- PR's "allocated quantity" updated to reflect approved TR

### Data Model Extensions

```typescript
interface TRApprovalHistory {
  tr_id: string;
  action: 'SUBMITTED' | 'MODIFIED' | 'APPROVED' | 'REJECTED';
  performed_by: string;             // User ID
  performed_at: Date;
  remarks?: string;
  changes?: {
    field: string;
    old_value: any;
    new_value: any;
  }[];
}
```

### UI/UX Behavior

**TR Approval Queue (DM View):**
- Filterable by:
  - POI
  - Product Category
  - Urgency
  - Submission date range
- Display columns:
  - TR ID, PR ID, Product, Source → Destination, Quantity, Delivery Date, Vehicle Type, Status

**TR Review Modal:**
- Left panel: PR context (full PR details, linked TRs)
- Center panel: Current TR details (editable)
- Right panel: Capacity snapshot (source/destination POIs)
- Action buttons:
  - Approve (requires remarks if modified)
  - Reject (mandatory remarks)
  - Save as Draft (DM can hold decision)

---

## TR Assessment & Planning (Transport Department)

### Purpose

Transport Planners assess **approved TRs** to plan transport execution. This includes:
- Determining actual vehicle requirements
- Validating route feasibility
- Checking special handling needs (e.g., covered vehicles for specific products)
- Confirming C&F clearance for port transfers
- Creating one or more Transport Orders (TOs) to fulfill the TR

### Workflow

```
1. Transport Planner (TP) views approved TRs in Transport Dashboard
2. TP filters TRs by:
   - Date, POI, Urgency, Transfer Type (FG / Port)
3. TP reviews TR details:
   - Product specifications (code, category, weight, UOM)
   - Route (source → destination)
   - Delivery date
   - Expected vehicle count and type (from DO/DM)
4. TP completes mandatory transport inputs:
   - For FG Transfer: Vehicle count, Vehicle type
   - For Port Transfer: Vehicle count, Vehicle type, C&F clearance status
5. TR becomes "Available for Planning" (ready for TO creation)
6. TP creates one or more TOs from the TR
```

### TR Visibility Rules (RBAC)

- **Distribution Officer (DO):** Own TRs only (created by self), pre-approval
- **Distribution Manager (DM):** All TRs in approval queue (organization-wide)
- **Transport Planner (TP):** Approved TRs only (organization-wide)
- **Transport Manager (TM):** All TRs (organization-wide, all states)

### Finished Goods TR Details (Transport View)

**Core Information:**
- TR ID, PR ID
- Product Item Code, Category, Packing Type
- Product Quantity (in UOM: Bags, Pieces, Cartons, Tons)
- Weight per unit, Total Calculated Weight
- Urgency (Normal / High / Critical)
- Required Delivery Date & Time
- Pickup & Drop Locations (POI names, addresses)

**Transport-Specific Inputs (TP completes):**
- Quantity of vehicles required
- Vehicle Type (e.g., Truck, Covered Van)

### Port Consignment TR Details (Transport View)

**Core Information:**
- TR ID, PR ID
- Product Item Code, Category
- **Shipment Details:**
  - BL (Bill of Lading) Number
  - LC (Letter of Credit) Number
  - Voyage Name, Vessel Number, Container Number
  - C&F Agent Name
  - Point of Loading (POL)
  - Estimated Time of Arrival (ETA)
  - Arrival Notice Attachment
- Commodity, Tentative Quantity (RM Item Code)
- Weight/Tonnage
- Pickup & Drop Locations
- Requested Delivery Date & Time
- Destination Breakdown Plan (multi-POI distribution)

**Transport-Specific Inputs (TP completes):**
- Quantity of vehicles required
- Vehicle Type
- **C&F Clearance Note / Approval (Yes / No)** ← Mandatory for port transfers

### TR Status Progression for Transport Planning

```
APPROVED (from DM)
    ↓
[TP completes mandatory transport inputs]
    ↓
AVAILABLE_FOR_PLANNING (ready for TO creation)
    ↓
[TP creates first TO from TR]
    ↓
PARTIALLY_ASSIGNED (some quantity allocated to TOs)
    ↓
[TP creates final TO, all TR quantity allocated]
    ↓
FULLY_ASSIGNED (all quantity in TOs)
    ↓
[All linked TOs completed]
    ↓
CLOSED (archived)
```

### Business Rules

**TR Planning Constraints:**
- TP cannot create TO from TR until mandatory transport inputs are completed
- TR quantity must be fully allocated across TOs (no orphaned quantity)
- Each TO must reference exactly one TR
- Multiple TOs can reference the same TR (for partial fulfillment)

**C&F Clearance (Port Transfers):**
- Port TRs require C&F clearance confirmation before TO creation
- TP inputs clearance status: YES (cleared) / NO (pending)
- System prevents TO creation if C&F clearance = NO

**Vehicle Type Validation:**
- System validates vehicle type against product transport configuration
- Special handling requirements (e.g., "Covered Van only" for sensitive products) enforced
- TP receives warnings if vehicle type mismatches product requirements

### Data Model Extensions

```typescript
interface TRTransportInput {
  tr_id: string;
  
  // Completed by Transport Planner
  actual_vehicle_count: number;     // TP's assessment (may differ from DO/DM estimate)
  confirmed_vehicle_type: string;   // TP's final decision
  
  // Port-specific
  cnf_clearance_status?: 'YES' | 'NO' | 'PENDING';
  cnf_clearance_date?: Date;
  cnf_agent_remarks?: string;
  
  // Planning metadata
  completed_by: string;             // Transport Planner user ID
  completed_at: Date;
  planning_remarks?: string;
}

interface TRToAllocation {
  tr_id: string;
  to_id: string;
  allocated_quantity: number;       // Quantity assigned to this TO
  allocation_date: Date;
}
```

### UI/UX Behavior

**Transport Dashboard (TP View):**
- Tabs: "Pending Planning" / "Available" / "Assigned" / "Completed"
- Filterable by:
  - Date, POI, Route, Urgency, Transfer Type
- Display columns:
  - TR ID, Transfer Type, Product, Source → Destination, Quantity, Delivery Date, Status, Urgency Badge

**TR Detail Panel:**
- Header: TR ID, PR reference, urgency badge, status badge
- Product Details section (FG vs Port differentiated)
- Route & Schedule section (map view optional)
- Transport Inputs form:
  - Vehicle count (number input)
  - Vehicle type (dropdown, filtered by product compatibility)
  - C&F clearance toggle (Port only)
  - Planning remarks (text area)
- Action buttons:
  - Save Inputs (unlocks "Create TO" button)
  - Create Transport Order (opens TO creation wizard)

---

## TR-to-TO Conversion Scenarios

### Scenario 1: Single TR → Single TO

**Use Case:** TR fully fulfilled by one vehicle trip

```
TR: 500 bags, Source: Depot A → Destination: Feed Mill B
    ↓
TO: 500 bags, Vehicle: TRK-001, Driver: D-123
```

### Scenario 2: Single TR → Multiple TOs

**Use Case:** TR requires multiple vehicles or phased delivery

```
TR: 1500 bags, Source: Depot A → Destination: Feed Mill B, Delivery: 2026-03-01
    ↓
TO-1: 600 bags, Vehicle: TRK-001, Delivery: 2026-03-01
TO-2: 500 bags, Vehicle: TRK-002, Delivery: 2026-03-01
TO-3: 400 bags, Vehicle: TRK-003, Delivery: 2026-03-02 (next day due to vehicle shortage)
```

### Scenario 3: Multiple TRs → Multiple TOs (Route Consolidation)

**Use Case:** Consolidate similar TRs for efficiency

```
TR-1: 300 bags, Source: Depot A → Destination: Feed Mill B
TR-2: 200 bags, Source: Depot A → Destination: Feed Mill C
    ↓
TO-1: 300 bags (Depot A → Feed Mill B), Vehicle: TRK-001
TO-2: 200 bags (Depot A → Feed Mill C), Vehicle: TRK-001 (backhaul)
```

*Note: Route consolidation logic is manual in Phase 1 (TP decision). Phase 2 may introduce auto-suggestion.*

---

## Integration Points

### Upstream: Product Requisition (PR)

**Triggers TR Creation:**
- PR approval event → TR creation enabled for DO
- PR status = `APPROVED` → visible in DO's queue

**Data Inherited by TR:**
- Product details (code, category, quantity, UOM)
- Requester POI
- Requested delivery date
- Urgency level
- Transfer type (FG / Port)

**Quantity Tracking:**
- PR maintains `total_quantity` and `allocated_quantity`
- Each approved TR increments PR's `allocated_quantity`
- PR fully allocated when `allocated_quantity = total_quantity`

### Downstream: Transport Order (TO)

**TR Provides Foundation for TO:**
- Route (source → destination)
- Product and quantity
- Delivery date
- Vehicle type and count (TP's finalized inputs)

**TO Creation Validates:**
- TR status = `AVAILABLE_FOR_PLANNING`
- TR quantity not exceeded by cumulative TO allocations
- Vehicle type matches product transport configuration

### Lateral: Master Data

**POI Master:**
- Source/Destination POI validation
- Capacity snapshot retrieval (real-time stock + in-transit)
- Geofencing data (for future GPS integration)

**Product Master:**
- Product configuration (transport requirements, special handling)
- UOM conversion rules
- Weight calculation (if not provided by PR)

**Vehicle Master:**
- Vehicle type validation
- Capacity matching (vehicle capacity vs TR quantity)

### Lateral: RBAC & Audit

**Role-Based Visibility:**
- DO: Own TRs (draft, pending approval)
- DM: All TRs in approval queue
- TP: Approved TRs only
- TM: All TRs (all states)

**Audit Logging:**
- All TR state changes logged (created, modified, approved, rejected, cancelled)
- Approval history with user, timestamp, remarks, field changes

---

## Performance & Scalability

### Expected Volume (Phase 1)

- **Daily TR creation:** 50-200 TRs (varies by business season)
- **Peak approval queue:** 30-50 pending TRs (DM queue)
- **TP dashboard load:** 100-300 approved TRs awaiting planning

### Query Optimization

**Indexing Strategy:**
```sql
-- TR Lookup by DO/DM
CREATE INDEX idx_tr_status_created_by ON transport_requisitions(status, created_by, created_at DESC);

-- TR Lookup by TP (approved TRs)
CREATE INDEX idx_tr_status_transfer_type ON transport_requisitions(status, transfer_type, requested_delivery_date);

-- TR-to-PR Traceability
CREATE INDEX idx_tr_pr_id ON transport_requisitions(pr_id);

-- TR-to-TO Tracking
CREATE INDEX idx_tr_to_allocation ON tr_to_allocations(tr_id, to_id);
```

### Caching Strategy

- **Capacity Snapshots:** Cache POI capacity for 5 minutes (acceptable staleness for planning)
- **PR Review Queue:** Cache approved PRs list for 2 minutes (DO/DM views)
- **TR Status Counts:** Cache TR counts by status for dashboard widgets (1 minute TTL)

---

## Security & Compliance

### Data Access Control

- **Tenant Isolation:** All TR queries filtered by `tenant_id`
- **Role-Based Filtering:**
  - DO: `created_by = current_user_id`
  - DM: `status = PENDING_APPROVAL AND tenant_id = current_tenant_id`
  - TP: `status IN (APPROVED, AVAILABLE_FOR_PLANNING, ...) AND tenant_id = current_tenant_id`

### Audit Requirements

**Mandatory Audit Events:**
- TR creation (DO)
- TR submission for approval (DO → DM)
- TR modification (DM)
- TR approval/rejection (DM)
- TR transport inputs completion (TP)
- TR-to-TO allocation (TP)
- TR cancellation (authorized users)

**Audit Payload:**
```json
{
  "event": "TR_APPROVED",
  "tr_id": "TR-FG-2026-00123",
  "pr_id": "PR-FG-2026-00456",
  "user_id": "DM-789",
  "timestamp": "2026-02-26T14:30:00Z",
  "changes": [
    {"field": "allocated_quantity", "old": 1000, "new": 800},
    {"field": "delivery_date", "old": "2026-03-01", "new": "2026-03-02"}
  ],
  "remarks": "Reduced quantity due to vehicle availability constraints"
}
```

---

## Future Enhancements (Phase 2+)

### Auto-TR Suggestion

- System auto-generates draft TRs from approved PRs based on:
  - Historical delivery patterns
  - Vehicle availability
  - Route optimization
- DO reviews and approves (instead of creating from scratch)

### Route Optimization

- System suggests consolidated TRs for similar routes
- Multi-stop TO creation (single vehicle, multiple destinations)
- Backhaul optimization (return trip planning)

### Dynamic Approval Rules

- Approval authority based on TR value, distance, urgency
- Auto-approval for routine TRs (within defined thresholds)
- Escalation workflows for high-value/critical TRs

### Predictive Capacity Alerts

- ML-based capacity forecasting (destination POI)
- Proactive alerts for DO/DM (e.g., "Feed Mill B will reach 90% capacity in 3 days")

---

## Key Design Decisions

### Why TR is Separate from PR?

**Rationale:**
- PR represents **business demand** (what needs to move)
- TR represents **transport plan** (how and when to move it)
- Separation enables:
  - One PR → multiple TRs (phased fulfillment)
  - Multi-stage approval (business approval ≠ transport approval)
  - Independent lifecycle management (PR approved ≠ TR approved)

### Why DO Creates TR (Not TP)?

**Rationale:**
- Distribution team owns **product movement decisions**
- Transport team owns **execution planning**
- DO has business context (priorities, customer needs)
- TP has operational context (vehicle availability, routes)

### Why DM Can Modify TR?

**Rationale:**
- DM has authority to override DO's allocations
- Enables dynamic adjustments based on real-time constraints
- Prevents back-and-forth (DO submits → DM rejects → DO resubmits)

### Why Mandatory Transport Inputs (TP)?

**Rationale:**
- DO/DM provide **estimates** (expected vehicle count)
- TP provides **actuals** (confirmed vehicle type, count)
- Prevents TO creation without feasibility validation

---

## Related User Stories

- **US-015:** Product Requisition Approval (FG)
- **US-016:** Product Requisition Approval (Port)
- **US-017:** TR Creation by DO
- **US-018:** TR Approval by DM
- **US-019:** TR Assessment by TP
- **US-020:** Transport Order Creation

---

## Summary

Transport Requisition (TR) is the **critical orchestration layer** that bridges product demand and transport execution. It enables:

- **Flexible Planning:** Multiple TRs per PR, partial allocations, phased delivery
- **Collaborative Review:** DO proposes, DM approves, TP executes
- **Capacity Awareness:** Real-time visibility of POI constraints
- **Audit Trail:** Full lifecycle tracking from PR → TR → TO

The TR system ensures that transport operations align with business priorities while respecting operational constraints (vehicle availability, capacity, delivery schedules).
