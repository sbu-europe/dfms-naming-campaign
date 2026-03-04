---
source_document: PRD_DFMS_v1.0.md
source_sections: Transport Order (TO) Management, Transport Order (TO) Management
extracted_date: 2026-02-13
last_updated: 2026-02-26
document_type: domain_specification
related_modules: [transport-requisition-management, trip-management, master-data]
---

# Transport Order (TO) Management

## Overview

Transport Order (TO) Management is the **operational execution layer** that converts approved Transport Requisitions (TRs) into concrete delivery instructions. A TO represents a **single vehicle movement** with specific route, schedule, product details, and resource assignments.

The TO is the foundational unit of transport execution in DFMS. It bridges strategic planning (TR) with field operations (Trip), serving as the work order for drivers, vendors, and logistics coordinators.

### Purpose

- Convert approved TRs into executable transport work orders
- Assign vehicles, drivers, and helpers to delivery tasks
- Manage TO lifecycle from creation to completion
- Support vendor bidding and own-fleet allocation
- Enable trip creation and execution tracking
- Provide foundation for cost tracking and billing

### Workflow Position

```
Transport Requisition (TR) → [Approved by Distribution]
    ↓
Transport Order (TO) → [Created by Transport Planner]
    ↓
Trip → [Assigned to Driver/Vehicle → Executed → Completed]
```

---

## TO Lifecycle States

| State | Owner | Description |
|-------|-------|-------------|
| **Draft** | Transport Planner (TP) | TO created but not finalized |
| **Open for Bidding** | Vendor (Phase 1) | TO published for vendor bids (non-contractual) |
| **Bid Received** | Vendor/TP | Vendors submitted bids, pending review |
| **Bid Approved** | TP | Winning bid selected, vendor confirmed |
| **Allocated (Own Fleet)** | TP | Assigned to internal vehicle (no bidding) |
| **Allocated (Vendor)** | TP/Vendor | Assigned to vendor vehicle (post-bid approval or contractual) |
| **Ready for Trip** | TP | Vehicle/driver assigned, ready for trip creation |
| **Trip Created** | TP | Trip record generated, awaiting execution |
| **In Progress** | Driver | Trip started, vehicle in transit |
| **Completed** | System | Delivery confirmed, QC passed, POD received |
| **Cancelled** | TP/TM | TO cancelled before trip start |
| **Failed** | System | Delivery failed, incident logged |

---

## TO Creation from TR

### Purpose

Transport Planners assess approved TRs and create one or more TOs to fulfill the transport requirement. Each TO represents a **single vehicle trip** with specific resource assignments.

### Workflow

```
1. Transport Planner (TP) views approved TRs in Transport Dashboard
2. TP selects a TR and reviews:
   - Product details (code, category, quantity, UOM)
   - Route (source POI → destination POI)
   - Delivery date and urgency
   - Expected vehicle count and type (from TR inputs)
3. TP creates TO(s) from the TR:
   - Single TO (if one vehicle sufficient)
   - Multiple TOs (if multiple vehicles needed)
4. TP specifies TO details:
   - Vehicle allocation strategy (Own Fleet vs Vendor)
   - Vehicle type and capacity
   - Quantity allocated to this TO
   - Delivery date/time window
5. TP finalizes TO:
   - Own Fleet: Assign vehicle, driver, helper (if applicable)
   - Vendor: Publish for bidding (or assign if contractual)
```

### TR-to-TO Conversion Rules

**One TR → One TO:**
- TR quantity fits in single vehicle
- Single delivery (no route splitting)

**One TR → Multiple TOs:**
- TR quantity exceeds single vehicle capacity
- Phased delivery (multiple dates)
- Mixed vehicle types (e.g., bulk + bagged)

**Example:**
```
TR-FG-2026-00123:
  Product: Chicken Feed (50kg bags)
  Quantity: 1200 bags
  Route: Factory A → Depot B
  Vehicle Type: Truck (capacity: 500 bags)

Generated TOs:
  TO-001: 500 bags (Truck-1)
  TO-002: 500 bags (Truck-2)
  TO-003: 200 bags (Truck-3)
```

### Data Model

```typescript
interface TransportOrder {
  to_id: string;                    // Auto-generated (e.g., TO-FG-2026-00456)
  tr_id: string;                    // Source Transport Requisition
  
  // Route
  source_poi_id: string;            // Loading point
  destination_poi_id: string;       // Unloading point
  route_distance_km?: number;       // Calculated or manual
  
  // Product Details
  product_code: string;
  product_category: string;
  allocated_quantity: number;       // Quantity assigned to this TO
  uom: string;
  weight_tonnage?: number;
  
  // Schedule
  planned_pickup_date: Date;
  planned_delivery_date: Date;
  delivery_time_window?: {
    start: string;                  // e.g., "08:00"
    end: string;                    // e.g., "17:00"
  };
  urgency: 'NORMAL' | 'HIGH' | 'CRITICAL';
  
  // Vehicle Allocation
  allocation_strategy: 'OWN_FLEET' | 'VENDOR_BIDDING' | 'VENDOR_CONTRACTUAL';
  vehicle_type: string;             // Truck, Covered Van, Container
  vehicle_capacity: number;         // In UOM units
  
  // Resource Assignment (Own Fleet)
  vehicle_id?: string;
  driver_id?: string;
  helper_id?: string;
  
  // Vendor Assignment (if applicable)
  vendor_id?: string;
  bid_id?: string;                  // Reference to winning bid
  vendor_vehicle_number?: string;
  vendor_driver_name?: string;
  vendor_helper_name?: string;
  
  // Status
  status: TOStatus;
  
  // Trip Reference
  trip_id?: string;                 // Generated when trip created
  
  // Costing
  estimated_cost?: number;
  actual_cost?: number;             // Populated post-trip completion
  
  // Metadata
  created_by: string;               // Transport Planner
  created_at: Date;
  updated_at: Date;
  tenant_id: string;
}

type TOStatus = 
  | 'DRAFT'
  | 'OPEN_FOR_BIDDING'
  | 'BID_RECEIVED'
  | 'BID_APPROVED'
  | 'ALLOCATED_OWN_FLEET'
  | 'ALLOCATED_VENDOR'
  | 'READY_FOR_TRIP'
  | 'TRIP_CREATED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED';
```

---

## On-Demand TO Creation (Gate Scenarios)

### Purpose

In some operational scenarios, vehicles arrive at the gate **without a pre-existing TO**. This can occur when:
- Dealer vehicles arrive with Delivery Orders (DO) for finished goods pickup
- Supplier vehicles arrive with Purchase Orders (PO) for raw material delivery
- Urgent/emergency deliveries that bypass normal TR/TO planning

On-demand TO creation enables gate officers to **initiate transport workflows at the point of arrival**, ensuring operations proceed smoothly even without advance planning.

### When On-Demand TOs Are Created

| Scenario | Document | Transfer Type | Flow Direction |
|----------|----------|---------------|----------------|
| **Dealer Pickup** | Delivery Order (DO) | Dealer Outbound – Finished Goods | Outbound from POI |
| **Supplier Delivery** | Purchase Order (PO) | Supplier Inbound – Raw Material | Inbound to POI |
| **Emergency Transport** | Manual Entry | Ad-hoc | Either direction |

### Workflow: On-Demand TO Creation

```
1. Vehicle arrives at gate without TO
   ↓
2. Gate officer performs challan/vehicle lookup (US-063)
   - System searches for existing TO
   - Result: "No matching TO found"
   ↓
3. System displays "Create On-Demand TO" option
   ↓
4. Gate officer selects document type:
   - Dealer (DO copy) → US-064
   - Supplier (PO copy) → US-065
   ↓
5. Gate officer enters required information:
   - Document number (DO/PO number)
   - Party name (Dealer/Supplier)
   - Product details (code, description)
   - Planned quantity
   - Source/Destination POI
   ↓
6. System creates on-demand TO:
   - TO ID: Auto-generated
   - Status: "On-Demand - Pending Approval"
   - Source: "Gate" (tagged for traceability)
   - Transfer Type: Set based on document category
   ↓
7. System links TO to gate-in record
   ↓
8. TO routes to Transport Planner/Manager for approval
   ↓
9. Once approved → Proceeds to standard TO workflow:
   - Vehicle/driver assignment (if not already at gate)
   - Trip creation
   - Gate-in → Scaling → QC → Loading/Unloading
```

### On-Demand TO Validation Rules

| Rule ID | Description | Enforcement |
|---------|-------------|-------------|
| **BR-TO-OD-001** | On-demand TOs SHALL require admin/planner approval before proceeding | Mandatory |
| **BR-TO-OD-002** | System SHALL NOT create on-demand TO if matching TO already exists for same challan/document | Mandatory |
| **BR-TO-OD-003** | Source/Destination POI SHALL match gate location where TO is created | Mandatory |
| **BR-TO-OD-004** | Document number (DO/PO) SHALL be unique within transfer type and date range | Mandatory |
| **BR-TO-OD-005** | On-demand TOs SHALL be tagged with "Source: Gate" for reporting/analytics | Mandatory |
| **BR-TO-OD-006** | Gate officer SHALL capture vehicle details (plate, driver) at TO creation | Mandatory |

### Data Model: On-Demand TO Extensions

```typescript
interface TransportOrder {
  // Standard TO fields...
  
  // On-Demand Specific Fields
  is_on_demand: boolean;                    // TRUE for on-demand TOs
  on_demand_source?: 'gate' | 'manual';     // Where on-demand TO originated
  on_demand_document_type?: 'DO' | 'PO' | 'Other';  // Source document type
  on_demand_document_number?: string;       // DO/PO number from physical copy
  on_demand_party_name?: string;            // Dealer/Supplier name
  on_demand_created_by?: User;              // Gate officer who created
  on_demand_created_at_poi?: POI;           // Gate location
  on_demand_approval_status?: 'pending' | 'approved' | 'rejected';
  on_demand_approved_by?: User;             // Transport Planner/Manager
  on_demand_approved_at?: Date;
  on_demand_rejection_reason?: string;
}
```

### On-Demand TO States

```
On-Demand - Pending Approval  →  [Planner Reviews]
    ↓ (If Approved)
Ready for Trip (merges into standard TO lifecycle)
    ↓
Trip Created → In Progress → Completed

    ↓ (If Rejected)
On-Demand - Rejected
    ↓
Vehicle turned away at gate OR reassigned
```

### Approval Workflow

**Automatic Triggers:**
- On-demand TO creation sends notification to Transport Planner
- Planner reviews:
  - Document authenticity (DO/PO legitimacy)
  - Quantity feasibility
  - POI capacity availability
  - Vehicle suitability

**Approval Criteria:**
- Document number valid and matches records (if pre-registered)
- Quantity within acceptable range
- No duplicate TO exists
- POI has capacity for processing

**Rejection Reasons:**
- Invalid document
- Duplicate TO exists
- POI at capacity
- Security concerns

### Integration with Standard TO Workflow

Once an on-demand TO is **approved**, it merges seamlessly into the standard TO lifecycle:

| Standard TO Flow | On-Demand TO Adaptation |
|------------------|-------------------------|
| TR Creation → TO Creation | ❌ Skipped (no TR exists) |
| TO Creation → Vehicle Assignment | ✅ Vehicle already at gate (captured during on-demand creation) |
| TO → Trip Creation | ✅ Same process |
| Trip → Gate-in | ✅ Already gate-in (concurrent with TO creation) |
| Gate-in → Scaling → QC → Loading | ✅ Same process |

**Key Difference**: On-demand TOs **start at the gate** and work backwards to formalize the transport record, whereas standard TOs are **planned first** and then executed.

### Business Rules for On-Demand Scenarios

#### Dealer Outbound (Finished Goods)

**BR-TO-OD-DEALER-001**: Dealer on-demand TOs SHALL:
- Transfer Type: "Dealer Outbound – Finished Goods"
- Direction: Outbound from POI
- QC Requirement: Pre-dispatch QC (if configured)
- Loading: At POI loading bay

**BR-TO-OD-DEALER-002**: System SHALL validate:
- Dealer is registered in system
- Product is finished goods category
- POI has inventory availability (if inventory-tracked)

#### Supplier Inbound (Raw Materials)

**BR-TO-OD-SUPPLIER-001**: Supplier on-demand TOs SHALL:
- Transfer Type: "Supplier Inbound – Raw Material"
- Direction: Inbound to POI
- QC Requirement: Receiving QC (mandatory)
- Unloading: At POI unloading bay

**BR-TO-OD-SUPPLIER-002**: System SHALL validate:
- Supplier is registered and active
- Product is raw material category
- POI has unloading capacity
- Lab testing scheduled (if required by product)

### Security and Audit Considerations

**Audit Trail:**
- All on-demand TOs logged with full audit trail
- Gate officer identity recorded
- Document copies scanned/photographed (future enhancement)
- Approval/rejection logged with reasons
- Vehicle photos captured at gate (future enhancement)

**Security Controls:**
- On-demand TO creation requires specific permission: "create_ondemand_to"
- Approval requires separate permission: "approve_ondemand_to"
- System flags unusual patterns (e.g., same gate officer creates multiple on-demand TOs in short time)
- Daily/weekly reports of on-demand TOs for management review

### Reporting and Analytics

**On-Demand TO Metrics:**
- Count of on-demand TOs per day/week/month
- Approval vs rejection rate
- Average approval time
- Top reasons for on-demand TOs (dealer vs supplier vs emergency)
- Gate officers creating most on-demand TOs (identify training needs)
- On-demand TOs by POI (identify locations with frequent unplanned arrivals)

**Use Cases:**
- Identify process gaps (why are TOs not being pre-created?)
- Optimize gate operations (reduce wait times)
- Training: Gate officers with low approval rates
- Strategic: POIs with high on-demand volumes may need better planning

---

## Allocation Strategy 1: Own Fleet

### Use Case

Internal vehicles (company-owned trucks) used for transport execution.

### Workflow

```
1. TP creates TO with allocation_strategy = 'OWN_FLEET'
2. TP assigns:
   - Vehicle (from vehicle master)
   - Driver (from driver master)
   - Helper (optional, from helper master)
3. System validates:
   - Vehicle type matches TO requirement
   - Vehicle capacity >= TO quantity
   - Driver has valid license and status = ACTIVE
   - Vehicle status = AVAILABLE (not in another active trip)
4. TO status → 'ALLOCATED_OWN_FLEET'
5. TP creates Trip → TO status → 'TRIP_CREATED'
```

### Vehicle-Driver-Helper Assignment Rules

**Vehicle Selection:**
- Vehicle type must match TO requirement (e.g., "Covered Van" for sensitive products)
- Vehicle capacity must accommodate TO quantity
- Vehicle must be operational (status = ACTIVE)
- Vehicle must be available (not in another active trip)

**Driver Selection:**
- Driver must have valid license type for vehicle
- Driver status = ACTIVE
- Driver must not be assigned to another active trip
- (Optional) Driver-vehicle compatibility (if pre-configured)

**Helper Assignment (Optional):**
- Helper status = ACTIVE
- Helper must not be assigned to another active trip
- Typically assigned for heavy goods or multi-drop deliveries

### Data Model Extensions (Own Fleet)

```typescript
interface OwnFleetAssignment {
  to_id: string;
  vehicle_id: string;
  driver_id: string;
  helper_id?: string;
  
  assigned_by: string;              // Transport Planner
  assigned_at: Date;
  
  // Validation
  vehicle_capacity: number;
  vehicle_type: string;
  driver_license_type: string;
  driver_license_expiry: Date;
}
```

---

## Allocation Strategy 2: Vendor Bidding (Non-Contractual)

### Use Case

When internal fleet capacity is insufficient or unavailable, TPs publish TOs for **vendor bidding**. Vendors submit competitive bids, and TP selects the winning bid.

### Workflow

```
1. TP creates TO with allocation_strategy = 'VENDOR_BIDDING'
2. TP sets bidding parameters:
   - Bidding window (start/end date-time)
   - Minimum bid requirements (vehicle type, capacity)
   - Base rate (reference only, not disclosed to vendors)
3. TO status → 'OPEN_FOR_BIDDING'
4. Vendors view TO in Vendor Portal and submit bids:
   - Bid rate (per trip or per km)
   - Vehicle number and type
   - Driver and helper details
5. TP reviews bids and selects winner:
   - Bid approval (lowest rate or best fit)
   - Vendor receives confirmation
6. TO status → 'BID_APPROVED'
7. Vendor confirms vehicle/driver assignment
8. TO status → 'ALLOCATED_VENDOR'
9. TP creates Trip → TO status → 'TRIP_CREATED'
```

### Bidding Parameters

**Bidding Window:**
- Start: TO creation date-time + ΔT (e.g., 2 hours)
- End: Configurable (e.g., 12 hours before planned pickup)

**Bid Evaluation Criteria (TP configurable):**
- Lowest rate (default)
- Vendor performance history (Phase 2)
- Vehicle type preference
- Vendor reliability score (Phase 2)

### Bid Approval Rules

**TP Authority:**
- TP can approve any bid (not required to select lowest)
- TP must provide remarks if overriding lowest bid
- TP can reject all bids and re-publish TO

**Vendor Notification:**
- Winning vendor notified via email/SMS
- Losing vendors notified (bid rejected)
- Winning vendor must confirm vehicle/driver details within deadline (e.g., 2 hours)

**Bid Locking:**
- Approved bid rate locked (cannot be changed post-approval)
- Vendor cost = bid rate (used for invoicing)

### Data Model Extensions (Vendor Bidding)

```typescript
interface VendorBid {
  bid_id: string;
  to_id: string;
  vendor_id: string;
  
  // Bid Details
  bid_rate: number;                 // Per trip or per km (configurable)
  bid_rate_type: 'PER_TRIP' | 'PER_KM';
  vehicle_number: string;
  vehicle_type: string;
  vehicle_capacity: number;
  driver_name: string;
  driver_license_number: string;
  helper_name?: string;
  
  // Bid Lifecycle
  submitted_at: Date;
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  approved_by?: string;             // Transport Planner
  approved_at?: Date;
  rejection_reason?: string;
  
  // Metadata
  tenant_id: string;
}
```

---

## Allocation Strategy 3: Vendor Contractual (Direct Assignment)

### Use Case

Pre-negotiated rates with vendors (contractual agreements). No bidding required; TP directly assigns TO to vendor at agreed rate.

### Workflow

```
1. TP creates TO with allocation_strategy = 'VENDOR_CONTRACTUAL'
2. TP selects vendor from contractual vendor list
3. System fetches pre-configured rate (per route or vehicle type)
4. TP assigns TO to vendor → TO status → 'ALLOCATED_VENDOR'
5. Vendor receives notification and confirms vehicle/driver
6. TP creates Trip → TO status → 'TRIP_CREATED'
```

**Note:** Contractual vendor rates are hidden from vendor (pre-agreed, non-negotiable).

---

## TO-to-Trip Conversion

### Purpose

Once a TO is allocated (vehicle/driver assigned), the Transport Planner creates a **Trip** to initiate field execution. A Trip is the operational record of the delivery lifecycle (gate-in, loading, transit, gate-out, unloading, QC, POD).

### Workflow

```
1. TO status = 'READY_FOR_TRIP' (vehicle/driver assigned, allocation complete)
2. TP clicks "Create Trip" on TO detail page
3. System generates Trip record:
   - Inherits TO details (route, product, quantity, vehicle, driver)
   - Trip status = 'ASSIGNED' (awaiting driver start)
4. Driver sees Trip in Driver App
5. TO status → 'TRIP_CREATED'
```

### Trip Data Inheritance

```typescript
interface Trip {
  trip_id: string;                  // Auto-generated
  to_id: string;                    // Source TO
  
  // Inherited from TO
  source_poi_id: string;
  destination_poi_id: string;
  product_code: string;
  allocated_quantity: number;
  uom: string;
  vehicle_id: string;               // Or vendor_vehicle_number
  driver_id: string;                // Or vendor_driver_name
  helper_id?: string;
  planned_pickup_date: Date;
  planned_delivery_date: Date;
  urgency: 'NORMAL' | 'HIGH' | 'CRITICAL';
  
  // Trip-Specific Fields
  status: TripStatus;
  actual_pickup_time?: Date;
  actual_delivery_time?: Date;
  gate_in_time?: Date;
  gate_out_time?: Date;
  loading_start_time?: Date;
  loading_end_time?: Date;
  unloading_start_time?: Date;
  unloading_end_time?: Date;
  
  // Execution Details
  actual_loaded_quantity?: number;
  actual_delivered_quantity?: number;
  qc_status?: 'PENDING' | 'PASSED' | 'FAILED';
  pod_url?: string;                 // Proof of Delivery attachment
  
  // GPS Tracking (Phase 1: Read-only)
  gps_tracking_enabled: boolean;
  current_location?: { lat: number; lng: number };
  geofence_events?: GeofenceEvent[];
  
  // Costing
  trip_cost?: TripCost;
  
  // Metadata
  created_at: Date;
  completed_at?: Date;
}

type TripStatus = 
  | 'ASSIGNED'
  | 'IN_TRANSIT'
  | 'AT_DESTINATION'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'INCIDENT';
```

---

## TO Filtering & Dashboard Views

### Transport Planner Dashboard

**Views:**
1. **Pending TRs:** Approved TRs awaiting TO creation
2. **Draft TOs:** TOs in creation (not yet allocated)
3. **Open for Bidding:** TOs awaiting vendor bids
4. **Allocated:** TOs assigned (own fleet or vendor), awaiting trip creation
5. **In Progress:** Active trips (from TOs)
6. **Completed:** Trips completed (with cost/billing data)

**Filters:**
- Date range (planned pickup/delivery date)
- POI (source or destination)
- Urgency (Normal/High/Critical)
- Transfer Type (FG/Port)
- Allocation Strategy (Own Fleet/Vendor)
- Status (any TO or Trip status)

**Display Columns:**
- TO ID, TR ID (linkable)
- Transfer Type icon
- Product, Quantity
- Route (Source → Destination)
- Planned Delivery Date
- Urgency badge
- Status badge
- Vehicle (if assigned)
- Driver (if assigned)
- Actions (Create Trip, View Details, Cancel)

---

## Finished Goods TO Details (From TR)

**Inherited from TR:**
- TR ID, PR ID
- Product Item Code, Category, Packing Type
- Product Quantity, UOM (Bags, Pieces, Cartons, Tons)
- Weight per unit, Total Calculated Weight
- Urgency (Normal / High / Critical)
- Pickup & Drop Locations

**TO-Specific Details:**
- TO ID
- Allocation Strategy (Own Fleet / Vendor Bidding / Vendor Contractual)
- Vehicle Type, Number, Capacity
- Driver Name, License Number
- Helper Name (if assigned)
- Planned Pickup Date/Time
- Planned Delivery Date/Time
- Route Distance (km)

---

## Port Consignment TO Details (From TR)

**Inherited from TR:**
- TR ID, PR ID
- Product Item Code, Category
- Shipment Details (BL, LC, Voyage, Vessel, Container)
- C&F Agent Name, POL
- Commodity, Tentative Quantity
- Pickup & Drop Locations

**TO-Specific Details:**
- TO ID
- C&F Clearance Status (YES/NO) ← Must be YES to create TO
- Allocation Strategy
- Vehicle Type, Number, Capacity
- Driver Name, License Number
- Helper Name (if assigned)
- Planned Pickup Date/Time
- Planned Delivery Date/Time
- Destination Breakdown Reference (if multi-destination)

---

## TO Cancellation & Modification

### TO Cancellation

**Allowed States:**
- DRAFT, OPEN_FOR_BIDDING, BID_RECEIVED, BID_APPROVED, ALLOCATED (before trip creation)

**Prohibited States:**
- TRIP_CREATED, IN_PROGRESS (cannot cancel once trip started)

**Cancellation Workflow:**
```
1. TP selects TO for cancellation
2. TP provides mandatory cancellation remarks
3. System validates:
   - TO status allows cancellation
   - No active trip linked
4. TO status → 'CANCELLED'
5. Effects:
   - If vendor bid approved, vendor notified (cancellation)
   - TR's allocated quantity decremented (frees up quantity for new TO)
   - Vehicle/driver freed up (if own fleet assigned)
```

### TO Modification

**Allowed Modifications (Before Trip Creation):**
- Vehicle/Driver assignment (own fleet)
- Planned pickup/delivery date
- Quantity (within TR limits)
- Vendor selection (if bidding)

**Prohibited Modifications (After Trip Creation):**
- Cannot change vehicle, driver, quantity, route
- Modification requires trip cancellation + new TO creation

---

## Business Rules

### TO Creation Constraints

1. **TR must be AVAILABLE_FOR_PLANNING** (mandatory transport inputs completed)
2. **TO quantity ≤ remaining unallocated TR quantity**
3. **C&F clearance = YES** (for port transfers)
4. **Vehicle type must match product transport requirements** (special handling)
5. **Planned delivery date ≥ current date + minimum lead time**

### TO Allocation Constraints (Own Fleet)

1. **Vehicle capacity ≥ TO quantity** (no overloading)
2. **Vehicle status = ACTIVE** (not under maintenance)
3. **Vehicle availability = TRUE** (not in another active trip)
4. **Driver license type matches vehicle type**
5. **Driver status = ACTIVE** (not on leave, not in another trip)

### TO Allocation Constraints (Vendor Bidding)

1. **Bidding window active** (current time within window)
2. **At least one valid bid received** (before approval)
3. **Vendor status = ACTIVE** (not blacklisted)
4. **Bid rate within acceptable range** (optional validation)

---

## Integration Points

### Upstream: Transport Requisition (TR)

**TR-to-TO Linkage:**
- Each TO references exactly one TR (`tr_id`)
- One TR may generate multiple TOs (phased fulfillment)
- TR's `allocated_quantity` updated as TOs created

**Data Inheritance:**
- Route, product details, quantity, delivery date
- Urgency, transfer type, requester context

### Downstream: Trip Management

**TO-to-Trip Linkage:**
- Each Trip references exactly one TO (`to_id`)
- One TO generates exactly one Trip
- TO status reflects Trip lifecycle (IN_PROGRESS, COMPLETED, etc.)

**Trip Execution:**
- Trip created → Driver receives assignment
- Trip started → TO status updated
- Trip completed → TO status → COMPLETED

### Lateral: Master Data

**Vehicle Master:**
- Vehicle availability check
- Vehicle type validation
- Capacity calculation

**Driver Master:**
- Driver availability check
- License validation
- Performance history (Phase 2)

**Vendor Master:**
- Vendor eligibility check (active, not blacklisted)
- Contractual rate retrieval
- Performance history (Phase 2)

### Lateral: Bidding System (Vendor Portal)

**TO Publishing:**
- TO published → Visible to eligible vendors
- Vendor submits bid → Linked to TO
- Bid approved → Vendor assigned to TO

---

## Performance & Scalability

### Expected Volume (Phase 1)

- **Daily TO creation:** 100-300 TOs (varies by fleet size)
- **Concurrent open bids:** 20-50 TOs
- **Active trips (from TOs):** 50-150 trips

### Query Optimization

```sql
-- TO Dashboard (TP view by status)
CREATE INDEX idx_to_status_date ON transport_orders(status, planned_delivery_date DESC);

-- TO by TR (traceability)
CREATE INDEX idx_to_tr_id ON transport_orders(tr_id);

-- TO by Vehicle (resource allocation)
CREATE INDEX idx_to_vehicle_driver ON transport_orders(vehicle_id, driver_id, status);

-- Vendor Bidding (open TOs)
CREATE INDEX idx_to_bidding ON transport_orders(status, allocation_strategy)
WHERE status = 'OPEN_FOR_BIDDING';
```

---

## Security & Compliance

### Data Access Control

- **Tenant Isolation:** All TO queries filtered by `tenant_id`
- **Role-Based Filtering:**
  - TP: Own created TOs (or team's TOs)
  - TM: All TOs (tenant-wide)
  - Vendor: Only TOs assigned to them (or open for bidding)

### Audit Requirements

**Mandatory Audit Events:**
- TO creation
- TO allocation (vehicle/driver assignment)
- Vendor bid approval
- Trip creation (from TO)
- TO cancellation
- TO modification (before trip creation)

---

## Key Design Decisions

### Why TO is Separate from TR?

**Rationale:**
- TR represents **transport plan** (what to move, when, where)
- TO represents **execution work order** (who, which vehicle, specific trip)
- Separation enables:
  - One TR → multiple TOs (phased delivery)
  - Flexible resource allocation (own fleet vs vendor)
  - Independent lifecycle management (TR approved ≠ TO executed)

### Why Support Multiple Allocation Strategies?

**Rationale:**
- Fleet capacity varies (own fleet insufficient for peak demand)
- Cost optimization (vendor may be cheaper for long routes)
- Operational flexibility (vendor bidding for competitive rates)

### Why Lock Bid Rate Post-Approval?

**Rationale:**
- Prevents disputes (vendor cannot change rate after approval)
- Ensures cost predictability (billing based on locked rate)
- Audit compliance (rate changes traceable)

---

## Related User Stories

- **US-019:** TR Assessment by Transport Planner
- **US-020:** TO Creation from TR
- **US-021:** TO Allocation (Own Fleet)
- **US-022:** TO Publication for Vendor Bidding
- **US-023:** Vendor Bid Submission
- **US-024:** Bid Approval by Transport Planner
- **US-025:** Trip Creation from TO

---

## Summary

Transport Order (TO) Management is the **operational execution layer** that converts strategic transport plans (TRs) into concrete delivery work orders. It provides:

- **Flexible Allocation:** Own fleet, vendor bidding, vendor contractual
- **Resource Assignment:** Vehicle, driver, helper assignment with validation
- **Vendor Integration:** Competitive bidding, rate locking, performance tracking
- **Trip Foundation:** Seamless TO-to-Trip conversion for field execution
- **Full Traceability:** TR → TO → Trip linkage with audit trail

TO Management ensures that approved transport requirements are efficiently allocated to available resources (own fleet or vendor) with cost optimization, compliance, and operational visibility.
