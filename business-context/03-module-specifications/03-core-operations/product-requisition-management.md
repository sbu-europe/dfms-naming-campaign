---
source_document: PRD_DFMS_v1.0.md
source_sections: Product Requisition Management (PRM), Product Requisition Management
extracted_date: 2026-02-13
last_updated: 2026-02-26
document_type: domain_specification
related_modules: [transport-requisition-management, poi-management, product-inventory-management]
---

# Product Requisition Management (PRM)

## Overview

Product Requisition Management (PRM) is the **demand initiation layer** of the DFMS. It captures internal product transfer needs, validates feasibility against real-time inventory and capacity constraints, and routes requests through appropriate approval workflows before triggering transport execution.

PRM supports two distinct operational workflows:
1. **Finished Goods (FG) Transfer:** Depot/Feed Mill initiated → Distribution approval → Transport execution
2. **Port/Import Transfer:** Commercial team initiated → Procurement approval + CNF coordination → Distribution breakdown → Transport execution

### Purpose

- Capture internal product transfer demand with requester context
- Validate transfer feasibility (source stock availability, destination capacity)
- Route requisitions through role-specific approval workflows
- Auto-generate Transport Requisitions (TR) upon approval
- Maintain traceability from business need to transport execution

### Workflow Position

```
Business Need (Stock replenishment, Port shipment arrival)
    ↓
Product Requisition (PR) → [Created → Approved]
    ↓
Transport Requisition (TR) → [Distribution plans transport]
    ↓
Transport Order (TO) → [Transport executes delivery]
```

---

## Transfer Type 1: Finished Goods (FG) Transfer

### Initiator & Context

**Initiated by:** Depot Manager, Feed Mill Manager (operational roles at source POI)

**Use Cases:**
- Stock replenishment (Factory → Depot, Depot → Feed Mill)
- Inter-depot balancing (Depot A → Depot B)
- Emergency transfers (critical stock shortages)
- Routine distribution planning

### Workflow

```
1. Depot/Feed Mill user creates PR:
   - System pre-fills requester POI (user's assigned location)
   - User selects destination POI
   - User selects product(s) and quantity
   - System displays real-time stock (source) and capacity (destination)
   - System shows threshold-based warnings (if applicable)
2. PR submitted → routed to Distribution Department
3. Distribution Officer (DO) / Distribution Manager (DM) reviews and approves
4. Upon approval:
   - System auto-generates Transport Requisition (TR)
   - TR visible to Distribution team for transport planning
```

### Pre-Filled Context

**Requester POI (Auto-filled):**
- User's assigned POI (based on RBAC user-to-POI mapping)
- Non-editable (enforces requester accountability)

**Requester Details:**
- User name, role, contact information
- Request timestamp

### Stock & Capacity Visibility (Informational)

**Source POI Stock (Read-Only):**
- Current available stock for selected product(s)
- In-transit incoming stock (optional visibility)
- Warning: "Source stock below safety threshold" (if configured)

**Destination POI Capacity (Read-Only):**
- Current stock level
- Total capacity
- Available capacity (Total - Current)
- Percentage utilization
- Warning: "Destination capacity > 80%" (threshold-based)

**Threshold-Based Warnings:**
- **Source Low Stock:** "Available stock (500 bags) is below safety level (800 bags)"
- **Destination High Capacity:** "Destination capacity is 85% utilized. Transfer may exceed limit."
- **Destination Overstock:** "Transfer will exceed destination capacity by 200 bags."

*Note: Warnings are informational. Approvers have authority to override.*

### Approval Workflow

**Approval Authority:**
- **Distribution Officer (DO):** Routine transfers, within defined limits
- **Distribution Manager (DM):** High-value transfers, overrides, critical requests

**Approval Actions:**
- **Approve:** PR status → `APPROVED`, TR auto-generated
- **Reject:** PR status → `REJECTED`, requester notified (with remarks)
- **Request Modification:** PR returned to requester with change requests

**Approval Validation:**
- Product exists in master data
- Source and destination POIs are valid
- Quantity > 0 and within reasonable limits
- Requester has authority to initiate from source POI

### Data Model

```typescript
interface ProductRequisition {
  pr_id: string;                    // Auto-generated (e.g., PR-FG-2026-00123)
  transfer_type: 'FG_TRANSFER' | 'PORT_TRANSFER';
  
  // Requester Context (Pre-filled)
  requester_poi_id: string;         // User's assigned POI
  requester_user_id: string;
  requester_role: string;
  request_date: Date;
  
  // Transfer Details
  source_poi_id: string;            // Usually same as requester_poi_id for FG
  destination_poi_id: string;
  
  // Product Details
  line_items: PRLineItem[];         // One or more products
  
  // Schedule
  requested_delivery_date: Date;
  urgency: 'NORMAL' | 'HIGH' | 'CRITICAL';
  
  // Approval
  status: PRStatus;
  approved_by?: string;
  approved_at?: Date;
  approval_remarks?: string;
  rejection_reason?: string;
  
  // Traceability
  allocated_quantity: number;       // Sum of TR allocations
  total_quantity: number;           // Sum of line item quantities
  
  // Metadata
  tenant_id: string;
  created_at: Date;
  updated_at: Date;
}

interface PRLineItem {
  product_code: string;
  product_name: string;
  product_category: string;
  quantity: number;
  uom: string;                      // Bags, Pieces, Tons, Cartons
  weight_per_unit?: number;
  total_weight?: number;            // Calculated or manual
  packing_type?: string;            // e.g., "50kg Bag", "Bulk"
}

type PRStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'PARTIALLY_ALLOCATED'          // Some TRs created, not all
  | 'FULLY_ALLOCATED'              // All quantity assigned to TRs
  | 'CANCELLED';
```

### UI/UX Behavior

**PR Creation Form (FG):**
- Pre-filled: Requester POI, User name, Date
- Required inputs:
  - Destination POI (dropdown, searchable)
  - Product(s) (multi-select or add line items)
  - Quantity per product (number input)
  - Delivery date (date picker)
  - Urgency (dropdown)
  - Remarks (optional text area)
- Real-time panels:
  - Source stock snapshot (per selected product)
  - Destination capacity snapshot
  - Warnings (if thresholds breached)
- Action buttons:
  - Save as Draft
  - Submit for Approval

---

## Transfer Type 2: Port/Import Transfer

### Initiator & Context

**Initiated by:** Commercial Team (Import/Procurement coordination)

**Use Cases:**
- L.C. (Letter of Credit) shipment arrival
- Port-to-factory raw material transfer
- Import consignment distribution (port → multiple destinations)

### Workflow

```
1. Commercial Team creates PR:
   - Shipment details (BL, LC, vessel, container, ETA)
   - C&F agent information
   - Product details (RM item code, tentative quantity)
   - Destination POI (may be port initially)
2. PR submitted → routed to Procurement Department
3. Procurement Officer/Manager reviews:
   - Validates shipment details
   - Confirms C&F coordination
   - Creates **Destination Breakdown Plan** (multi-POI distribution)
4. Procurement approves → PR forwarded to Distribution Department
5. Distribution team creates **Destination Breakdown Plan**:
   - Splits total quantity across multiple destination POIs
   - Creates multiple TRs (one per destination)
6. TRs routed to Transport Department for execution
```

### Shipment-Specific Fields (Port Transfer)

**Import Documentation:**
- **BL Number:** Bill of Lading (shipment identifier)
- **LC Number:** Letter of Credit (financial instrument)
- **Voyage Name:** Ship voyage identifier
- **Vessel Number:** Ship identification
- **Container Number:** Shipping container ID

**C&F Coordination:**
- **C&F Agent Name:** Clearing & Forwarding agent
- **Point of Loading (POL):** Port/terminal name
- **Estimated Time of Arrival (ETA):** Shipment arrival date
- **Arrival Notice Attachment:** Document upload (PDF, image)

**Product Details:**
- **Commodity:** Raw material category (e.g., Maize, Soybean)
- **RM Item Code:** Raw material product code
- **Tentative Quantity:** Estimated quantity (may vary post-clearance)
- **Weight/Tonnage:** Total shipment weight

### Destination Breakdown Plan

**Purpose:** Distribute port shipment quantity across multiple internal destinations (factories, depots)

**Created by:** Procurement Department (during approval) or Distribution team (post-approval)

**Example:**
```
Shipment: 1000 tons Maize (Port → Internal distribution)
Breakdown:
  - Factory A: 400 tons
  - Factory B: 300 tons
  - Factory C: 300 tons

Result: 3 separate TRs generated (one per destination)
```

**Implementation:**
```typescript
interface DestinationBreakdown {
  pr_id: string;
  breakdown_items: {
    destination_poi_id: string;
    allocated_quantity: number;
    uom: string;
    delivery_date: Date;
    priority: number;               // 1 = highest
  }[];
  created_by: string;
  created_at: Date;
}
```

### Approval Workflow (Port Transfer)

**Stage 1: Procurement Approval**
- **Procurement Officer/Manager** reviews:
  - Shipment documentation completeness
  - C&F agent coordination status
  - Product specifications
  - ETA and port clearance timeline
- **Actions:**
  - Approve → Forward to Distribution
  - Request Documentation (hold until docs received)
  - Reject (with remarks)

**Stage 2: Distribution Breakdown (Post-Procurement Approval)**
- **Distribution Officer/Manager** creates breakdown plan:
  - Assigns quantities to destination POIs
  - Sets delivery dates per destination
  - Validates destination capacities
- **Actions:**
  - Finalize Breakdown → Auto-generate multiple TRs (one per destination)
  - Request Clarification from Procurement

### Data Model Extensions (Port Transfer)

```typescript
interface PortTransferDetails {
  pr_id: string;
  
  // Shipment Documentation
  bl_number: string;
  lc_number: string;
  voyage_name: string;
  vessel_number: string;
  container_number: string;
  
  // C&F Coordination
  cnf_agent_name: string;
  point_of_loading: string;         // Port name
  estimated_arrival_date: Date;
  arrival_notice_url?: string;      // Document storage path
  
  // Product Details
  commodity: string;                // e.g., "Maize", "Soybean"
  rm_item_code: string;
  tentative_quantity: number;
  weight_tonnage: number;
  
  // Destination Planning
  destination_breakdown?: DestinationBreakdown;
  
  // Approval Metadata
  procurement_approved_by?: string;
  procurement_approved_at?: Date;
  distribution_breakdown_by?: string;
  distribution_breakdown_at?: Date;
}
```

### UI/UX Behavior (Port Transfer)

**PR Creation Form (Port):**
- Section 1: Shipment Documentation
  - BL, LC, Voyage, Vessel, Container (text inputs)
  - Arrival Notice (file upload)
- Section 2: C&F Coordination
  - Agent name, POL, ETA (text/date inputs)
- Section 3: Product Details
  - Commodity, RM Code (dropdowns)
  - Tentative quantity, weight (number inputs)
- Section 4: Initial Destination
  - POL (port POI) as initial destination
  - Final destinations planned post-approval
- Action buttons:
  - Save Draft, Submit to Procurement

**Destination Breakdown Interface (Distribution Team):**
- Left panel: PR summary (shipment details, total quantity)
- Center panel: Breakdown table
  - Add Destination POI (searchable dropdown)
  - Allocate Quantity (number input, max = remaining quantity)
  - Set Delivery Date (date picker)
  - Priority (drag-to-reorder or number input)
- Right panel: Capacity snapshots for selected destinations
- Validation:
  - Total allocated quantity = PR total quantity
  - No destination duplicates
- Action button: Finalize Breakdown → Generate TRs

---

## Automatic Transport Requisition (TR) Generation

### Trigger Event

**For FG Transfer:**
- PR status changes to `APPROVED` (Distribution approval)
- System auto-generates **one TR** per PR line item (if single destination)

**For Port Transfer:**
- Destination breakdown finalized (Distribution team)
- System auto-generates **one TR per breakdown destination**

### TR Auto-Population Rules

**From PR to TR (Data Mapping):**
```typescript
function generateTRFromPR(pr: ProductRequisition): TransportRequisition {
  return {
    tr_id: generateTRId(),
    pr_id: pr.pr_id,
    transfer_type: pr.transfer_type,
    source_poi_id: pr.source_poi_id,
    destination_poi_id: pr.destination_poi_id,
    allocated_quantity: pr.total_quantity,
    uom: pr.line_items[0].uom,        // Simplified for single-product PR
    requested_delivery_date: pr.requested_delivery_date,
    urgency: pr.urgency,
    status: 'APPROVED',                // TR starts as approved (from PR approval)
    created_by: 'SYSTEM',              // Auto-generated
    created_at: new Date(),
    pr_reference: {
      product_code: pr.line_items[0].product_code,
      product_category: pr.line_items[0].product_category,
      requester_poi: pr.requester_poi_id,
      urgency: pr.urgency
    }
  };
}
```

**For Port Transfer with Breakdown:**
```typescript
function generateTRsFromBreakdown(pr: ProductRequisition, breakdown: DestinationBreakdown): TransportRequisition[] {
  return breakdown.breakdown_items.map((item, index) => ({
    tr_id: generateTRId(index),
    pr_id: pr.pr_id,
    transfer_type: 'PORT_TRANSFER',
    source_poi_id: pr.source_poi_id,   // Port POI
    destination_poi_id: item.destination_poi_id,
    allocated_quantity: item.allocated_quantity,
    requested_delivery_date: item.delivery_date,
    urgency: pr.urgency,
    status: 'APPROVED',
    // ... other fields
  }));
}
```

### Post-TR Generation Effects

**PR Status Update:**
- `APPROVED` → `FULLY_ALLOCATED` (if all quantity assigned to TRs)
- `approved_quantity` field updated

**TR Visibility:**
- TRs appear in Distribution team's TR dashboard
- Status: `APPROVED` (ready for transport planning)

**Notification:**
- Distribution Officer notified (PR approved, TR generated)
- Transport Planner notified (new TR available for planning)

---

## Integration Points

### Upstream: User & RBAC

**User-to-POI Mapping:**
- Requester POI auto-filled based on user's assigned location
- Users can only create PRs for their authorized POIs (enforced by RBAC)

**Approval Authority:**
- Approval workflows determined by user role and PR attributes (value, urgency)
- System routes PR to correct approver(s) based on tenant configuration

### Downstream: Transport Requisition (TR)

**PR-to-TR Linkage:**
- Each TR references exactly one PR (`pr_id`)
- One PR may generate multiple TRs (port breakdown, partial fulfillment)
- PR's `allocated_quantity` tracks cumulative TR allocations

**Lifecycle Dependency:**
- PR cannot be deleted if TRs exist (referential integrity)
- PR status reflects TR progress (e.g., `PARTIALLY_ALLOCATED` if some TRs pending)

### Lateral: POI Management

**POI Master Data:**
- Source/destination POI validation
- POI type validation (e.g., cannot send finished goods to port POI)
- POI operational status check (cannot transfer to inactive POI)

**Capacity Tracking:**
- Real-time capacity snapshot retrieval
- Threshold-based warning triggers
- Capacity reservation (optional, Phase 2+)

### Lateral: Product Inventory Management

**Product Master Data:**
- Product code validation
- Product category lookup
- UOM conversion (if needed)
- Transport configuration (special handling requirements)

**Stock Visibility:**
- Real-time stock query (source POI)
- In-transit stock calculation (optional)
- Safety stock threshold validation

---

## Business Rules

### PR Creation Constraints

1. **Requester POI = User's Assigned POI** (enforced by system)
2. **Source POI must have inventory visibility** (FG transfer only)
3. **Destination POI must be operational** (status = ACTIVE)
4. **Quantity must be > 0** for all line items
5. **Delivery date must be >= current date + lead time** (configurable per route)

### PR Approval Constraints

1. **Approver must have authority** (role-based, tenant-specific)
2. **Approver cannot approve own PRs** (segregation of duties)
3. **Approval remarks mandatory if override warnings** (capacity, stock)
4. **Rejection remarks mandatory** (all cases)

### Port Transfer Specific Rules

1. **C&F agent must be registered** (master data validation)
2. **BL and LC numbers must be unique** (per tenant, per period)
3. **Destination breakdown total = PR total quantity** (exact match)
4. **Breakdown cannot be modified after TR generation** (locked)

---

## Performance & Scalability

### Expected Volume (Phase 1)

- **Daily PR creation:** 30-100 PRs (FG: 80%, Port: 20%)
- **Peak approval queue:** 20-40 pending PRs
- **Average line items per PR:** 1-3 products

### Query Optimization

```sql
-- PR Approval Queue (by role)
CREATE INDEX idx_pr_approval_queue ON product_requisitions(status, transfer_type, created_at DESC)
WHERE status = 'PENDING_APPROVAL';

-- PR by Requester (user's own PRs)
CREATE INDEX idx_pr_requester ON product_requisitions(requester_user_id, status, created_at DESC);

-- PR-to-TR Traceability
CREATE INDEX idx_pr_id_status ON product_requisitions(pr_id, status);
```

---

## Security & Compliance

### Data Access Control

- **Tenant Isolation:** All queries filtered by `tenant_id`
- **Role-Based Filtering:**
  - Requester: Own PRs only (`requester_user_id = current_user`)
  - Approver: PRs in approval queue (role-specific)
  - Admin: All PRs (tenant-wide)

### Audit Requirements

**Mandatory Audit Events:**
- PR creation
- PR submission for approval
- PR approval/rejection
- PR modification (before approval)
- Destination breakdown creation (port transfer)
- TR auto-generation (triggered by PR approval)

**Audit Payload Example:**
```json
{
  "event": "PR_APPROVED",
  "pr_id": "PR-FG-2026-00123",
  "approved_by": "DO-456",
  "approval_date": "2026-02-26T10:30:00Z",
  "warnings_overridden": ["DESTINATION_CAPACITY_HIGH"],
  "approval_remarks": "Approved despite capacity warning. Coordinated with Feed Mill B manager.",
  "tr_generated": ["TR-FG-2026-00789"]
}
```

---

## Key Design Decisions

### Why Pre-Fill Requester POI?

**Rationale:**
- Enforces accountability (requester is tied to location)
- Prevents unauthorized transfers (user cannot request from other POIs)
- Simplifies UI (one less field to fill)
- Aligns with RBAC (user-to-POI mapping)

### Why Show Stock/Capacity as Informational?

**Rationale:**
- Provides decision support (requesters see real-time data)
- Does not enforce hard limits (approvers have override authority)
- Balances automation with flexibility (business judgment required)

### Why Auto-Generate TR Upon Approval?

**Rationale:**
- Reduces manual handoff errors (no data re-entry)
- Ensures traceability (PR → TR linkage)
- Speeds up workflow (Distribution team immediately sees TR)
- Prevents orphaned approvals (every approved PR becomes actionable TR)

### Why Separate Breakdown Step for Port Transfers?

**Rationale:**
- Port shipments often split across multiple destinations
- Procurement approves shipment (import documentation)
- Distribution decides distribution strategy (multi-POI allocation)
- Enables flexible planning (breakdown can be adjusted post-approval)

---

## Related User Stories

- **US-013:** Product Requisition Creation (FG)
- **US-014:** Product Requisition Creation (Port)
- **US-015:** Product Requisition Approval (FG)
- **US-016:** Product Requisition Approval (Port)
- **US-017:** Destination Breakdown Planning (Port)

---

## Summary

Product Requisition Management (PRM) is the **demand initiation layer** that captures internal product transfer needs. It provides:

- **Context-Aware Initiation:** Pre-filled requester context, role-based POI assignment
- **Real-Time Validation:** Stock and capacity visibility, threshold-based warnings
- **Flexible Approval Workflows:** Role-specific routing, override authority
- **Automatic TR Generation:** Seamless handoff to transport planning
- **Multi-Workflow Support:** FG transfers (depot/factory) and Port transfers (import)

PRM ensures that product transfer demand is validated, approved, and converted into actionable transport plans with full traceability and compliance.
