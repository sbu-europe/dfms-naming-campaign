---
source_document: DFMS_Product_Requirements_Document_v3.md
source_sections: Gate Management, Gate-In Entry, On Demand Third Party Supplier and Dealer Management At Gate-In, Gate-Out Entry
extracted_date: 2026-02-13
last_updated: 2026-02-26
document_type: domain_specification
related_modules: [trip-management, scaling-management, qc-workflow, command-center]
---

# Gate Management

## Overview

Gate Management is the **entry/exit control layer** that governs vehicle access to POIs (Points of Interest) such as factories, depots, warehouses, and ports. It serves as the **first and last checkpoint** in the physical product movement workflow, ensuring all vehicle movements are formally logged, validated, and routed to appropriate operational processes.

The gate system acts as the **gatekeeper** (literally and figuratively) for all inbound and outbound logistics, providing critical timestamps, document validation, and workflow routing that enable downstream operations (scaling, loading/unloading, QC, trip tracking).

### Purpose

- Register all vehicle entries (gate-in) and exits (gate-out) at POIs
- Validate vehicle and document legitimacy (TO, PO, DO, Challan)
- Route vehicles to appropriate operational workflows (inbound QC, outbound loading, internal transfer)
- Capture driver, product, and party information
- Enforce clearance requirements (QC pass, scale-out completion) before gate-out
- Provide audit trail for all vehicle movements

### Workflow Position

```
Vehicle Arrives at POI Gate
    ↓
Gate-In Entry (Gate Operator) → Document validation, Vehicle registration
    ↓
Routed to Workflow:
  - Supplier/Port → Scale-In → QC Inspection → Unloading
  - Internal Transfer (TO) → Scale-In → Unloading → Scale-Out
  - Dealer/Distributor → Loading → Scale-Out
    ↓
Clearance Received (QC pass, Scale-out complete)
    ↓
Gate-Out Entry (Gate Operator) → Vehicle exit logged
    ↓
Vehicle Departs POI
```

---

## Gate-In Entry

### Purpose

Gate-In is the **vehicle entry checkpoint** where gate operators formally register incoming vehicles, validate documents, capture driver and product details, and route the vehicle to the correct operational workflow.

### Workflow

```
1. Vehicle arrives at POI gate
2. Gate operator checks:
   - Vehicle registration number
   - Document type (TO, PO, DO, Challan)
   - Driver identification
3. Gate operator enters gate-in details:
   - Vehicle number (mandatory)
   - Document category and number
   - Product details (if unloading)
   - Quantity (if unloading, null for empty vehicles)
   - Driver name and contact
   - Party name (supplier/dealer/distributor)
   - Project/origin information
   - Remarks (optional)
4. System validates:
   - Vehicle number format
   - Document number exists (if internal transfer)
   - Product code valid (if specified)
5. System logs gate-in timestamp
6. System routes vehicle to workflow:
   - Supplier/Port → Inbound QC workflow
   - Internal Transfer (TO) → TO-linked workflow
   - Dealer → Outbound FG workflow
7. Gate operator directs driver to next station (weighbridge, loading bay, etc.)
```

### Document Categories

**1. Supplier (Purchase Order - PO):**
- Inbound raw material delivery from external suppliers
- Requires: PO number, supplier name, product details, quantity
- Workflow: Gate-In → Scale-In → QC Inspection → Unloading → Scale-Out → Gate-Out

**2. Internal Transfer (Transport Order - TO / Challan):**
- Internal product movement between own POIs (factory → depot, depot → depot)
- Requires: TO number or Challan number, source POI, product details, quantity
- Workflow: Gate-In → Scale-In → Unloading → Scale-Out → Gate-Out

**3. Dealer (Delivery Order - DO):**
- Outbound finished goods delivery to dealers/distributors
- Requires: DO number, dealer name, product details, quantity
- Workflow: Gate-In (empty vehicle) → Loading → Scale-Out → Gate-Out

**4. Port Consignment:**
- Imported raw material from port (special case of supplier)
- Requires: BL number, LC number, C&F agent, container number
- Workflow: Gate-In → Scale-In → QC Inspection → Unloading → Scale-Out → Gate-Out

### Data Model

```typescript
interface GateInEntry {
  gate_in_id: string;               // Auto-generated (e.g., GI-2026-00123)
  poi_id: string;                   // Gate location (factory, depot, port)
  
  // Vehicle Details (Mandatory)
  vehicle_number: string;           // Registration plate
  vehicle_type?: string;            // Truck, Covered Van, Container
  
  // Document Details
  document_category: DocumentCategory;
  document_number: string;          // PO/TO/DO/Challan number
  
  // Product Details (for unloading vehicles)
  product_code?: string;
  product_name?: string;
  product_category?: string;
  declared_quantity?: number;       // As per document (null for empty vehicles)
  uom?: string;                     // Bags, Tons, Pieces, Cartons
  
  // Driver Details
  driver_name: string;
  driver_contact?: string;
  driver_license?: string;
  
  // Party Details
  party_name: string;               // Supplier, Dealer, Distributor name
  party_type: 'SUPPLIER' | 'DEALER' | 'DISTRIBUTOR' | 'INTERNAL';
  
  // Origin Information
  origin_poi?: string;              // Source location (for internal transfers)
  origin_project?: string;          // Project reference
  
  // Timestamps
  gate_in_time: Date;               // Actual entry time
  gate_in_date: Date;               // Entry date
  
  // Status & Routing
  status: GateInStatus;
  routed_workflow: 'INBOUND_QC' | 'OUTBOUND_LOADING' | 'INTERNAL_TRANSFER';
  next_station: 'WEIGHBRIDGE' | 'LOADING_BAY' | 'QC_STATION' | 'PARKING';
  
  // Linked Records
  to_id?: string;                   // Transport Order (if internal transfer)
  po_id?: string;                   // Purchase Order (if supplier)
  do_id?: string;                   // Delivery Order (if dealer)
  trip_id?: string;                 // Trip reference (if TO-linked)
  
  // Audit
  remarks?: string;
  created_by: string;               // Gate operator user ID
  created_at: Date;
  tenant_id: string;
}

type DocumentCategory = 
  | 'SUPPLIER_PO'
  | 'INTERNAL_TO'
  | 'INTERNAL_CHALLAN'
  | 'DEALER_DO'
  | 'PORT_CONSIGNMENT';

type GateInStatus = 
  | 'REGISTERED'
  | 'AWAITING_SCALE_IN'
  | 'SCALE_IN_COMPLETE'
  | 'AWAITING_QC'
  | 'QC_IN_PROGRESS'
  | 'AWAITING_LOADING'
  | 'LOADING_IN_PROGRESS'
  | 'AWAITING_UNLOADING'
  | 'UNLOADING_IN_PROGRESS'
  | 'AWAITING_SCALE_OUT'
  | 'SCALE_OUT_COMPLETE'
  | 'CLEARED_FOR_EXIT'
  | 'GATE_OUT_COMPLETE';
```

### Workflow Routing Logic

**Inbound QC Workflow (Supplier/Port):**
```typescript
if (document_category === 'SUPPLIER_PO' || document_category === 'PORT_CONSIGNMENT') {
  routed_workflow = 'INBOUND_QC';
  next_station = 'WEIGHBRIDGE';  // Scale-In first
  // Flow: Scale-In → QC Inspection → Unloading → Scale-Out → Gate-Out
}
```

**Outbound Loading Workflow (Dealer):**
```typescript
if (document_category === 'DEALER_DO') {
  routed_workflow = 'OUTBOUND_LOADING';
  next_station = 'LOADING_BAY';
  // Flow: Loading → Scale-Out → Gate-Out
}
```

**Internal Transfer Workflow (TO):**
```typescript
if (document_category === 'INTERNAL_TO' || document_category === 'INTERNAL_CHALLAN') {
  routed_workflow = 'INTERNAL_TRANSFER';
  next_station = 'WEIGHBRIDGE';  // Scale-In for verification
  // Flow: Scale-In → Unloading → Scale-Out → Gate-Out
}
```

### Validation Rules

**Mandatory Fields:**
1. **Vehicle number** (cannot be null, format validation: e.g., ABC-1234)
2. **Document category** (must be valid enum value)
3. **Document number** (cannot be empty)
4. **Driver name** (cannot be empty)
5. **Party name** (cannot be empty)
6. **Gate-in date/time** (auto-captured, cannot be backdated)

**Conditional Mandatory:**
- **Product details & quantity:** Mandatory if `declared_quantity > 0` (unloading vehicles)
- **Origin POI:** Mandatory if `document_category = INTERNAL_TO`

**Business Rules:**
1. **Duplicate vehicle check:** If vehicle already has open gate-in (no gate-out), warn operator (possible error or re-entry)
2. **Document validation (TO):** If internal transfer, validate TO exists and status = `TRIP_CREATED` or `IN_PROGRESS`
3. **Empty vehicle handling:** If `declared_quantity = null`, vehicle routed to loading workflow (outbound)

### UI/UX Behavior

**Gate-In Entry Form:**

**Section 1: Vehicle Details**
- Vehicle Number (text input, uppercase, format: XXX-9999)
- Vehicle Type (dropdown, optional)

**Section 2: Document Details**
- Document Category (dropdown: Supplier PO, Internal TO, Internal Challan, Dealer DO, Port Consignment)
- Document Number (text input, required)
- (If Internal TO selected, show "Validate TO" button → fetches TO details)

**Section 3: Product Details** (conditional, shown if unloading)
- Product Code (dropdown, searchable)
- Product Name (auto-filled from code)
- Declared Quantity (number input)
- UOM (dropdown)

**Section 4: Driver & Party Details**
- Driver Name (text input)
- Driver Contact (phone input, optional)
- Party Name (text input for supplier/dealer, or dropdown for known parties)
- Party Type (auto-selected based on document category)

**Section 5: Origin & Remarks**
- Origin Location (dropdown, shown for internal transfers)
- Project Reference (text input, optional)
- Remarks (text area, optional)

**Action Buttons:**
- **Register Gate-In** (validates, saves, assigns next station)
- **Print Token** (generates queue token with gate-in details)
- **Cancel** (clears form)

**Real-Time Feedback:**
- Green checkmark: "Gate-In registered successfully. Vehicle directed to Weighbridge."
- Warning icon: "Vehicle [XXX-1234] already has open gate-in from [timestamp]. Confirm re-entry?"
- Error icon: "Invalid TO number. No active trip found."

---

## Gate-Out Entry

### Purpose

Gate-Out is the **vehicle exit checkpoint** where gate operators formally log vehicle departure after all operational processes are complete and clearance requirements are met.

### Workflow

```
1. Vehicle completes operational workflow:
   - Inbound: QC passed, Unloading complete, Scale-out done
   - Outbound: Loading complete, Scale-out done
   - Internal: Unloading complete, Scale-out done
2. Command Center issues gate clearance (gate pass token)
3. Driver presents gate pass at gate
4. Gate operator verifies:
   - Gate pass token valid
   - Vehicle number matches gate-in record
   - Clearance requirements met (QC pass, scale-out complete)
5. Gate operator enters gate-out time
6. System validates:
   - Gate-in record exists
   - Scale-out completed (mandatory)
   - QC status = PASSED (for inbound flows) or SKIPPED (for outbound)
   - No pending issues or holds
7. System logs gate-out timestamp
8. Gate-in record status → 'GATE_OUT_COMPLETE'
9. Trip status updated (if TO-linked)
10. Gate operator opens barrier, vehicle exits
```

### Clearance Requirements

**For Inbound Vehicles (Supplier/Port):**
- ✅ Scale-In complete
- ✅ QC Inspection complete
- ✅ QC Status = PASSED (or CONDITIONAL_PASS with remarks)
- ✅ Unloading complete
- ✅ Scale-Out complete
- ✅ Gate pass issued by Command Center

**For Outbound Vehicles (Dealer):**
- ✅ Loading complete
- ✅ Scale-Out complete
- ✅ Gate pass issued
- (QC not required for outbound)

**For Internal Transfer Vehicles (TO):**
- ✅ Scale-In complete (optional, for verification)
- ✅ Unloading complete
- ✅ Scale-Out complete
- ✅ POD captured (if trip-linked)
- ✅ Gate pass issued

### Data Model

```typescript
interface GateOutEntry {
  gate_out_id: string;              // Auto-generated
  gate_in_id: string;               // Reference to gate-in record
  poi_id: string;
  
  // Vehicle Details
  vehicle_number: string;
  
  // Gate-Out Details
  gate_out_time: Date;
  gate_out_date: Date;
  
  // Clearance Validation
  gate_pass_token: string;          // Issued by Command Center
  scale_out_complete: boolean;
  qc_status?: 'PASSED' | 'FAILED' | 'SKIPPED';
  qc_clearance_time?: Date;
  loading_complete?: boolean;
  unloading_complete?: boolean;
  
  // Calculated Dwell Time
  dwell_time_minutes: number;       // gate_out_time - gate_in_time
  
  // Linked Records
  trip_id?: string;
  to_id?: string;
  
  // Audit
  cleared_by: string;               // Command Center user
  gate_out_by: string;              // Gate operator user ID
  remarks?: string;
  created_at: Date;
  tenant_id: string;
}
```

### Validation Rules

**Pre-Gate-Out Checks:**
1. **Gate-In exists:** Vehicle must have valid gate-in record
2. **Scale-Out complete:** Mandatory for all vehicle types
3. **QC clearance:** Mandatory for inbound vehicles (QC = PASSED or CONDITIONAL_PASS)
4. **Loading/Unloading complete:** Based on workflow type
5. **No pending holds:** No active incidents or quality issues

**Business Rules:**
1. **Gate-out cannot occur before scale-out:** Prevents weight fraud
2. **QC pending blocks gate-out:** For inbound flows, QC must be completed
3. **Gate pass required:** Command Center must issue clearance token
4. **Dwell time tracking:** System calculates and logs time spent at POI
5. **Trip status update:** If TO-linked, trip status updated to reflect gate-out (e.g., `DEPARTED_SOURCE` or `DEPARTED_DESTINATION`)

### Gate Pass Token

**Purpose:** Physical/digital clearance document issued by Command Center to authorize gate-out.

**Gate Pass Contents:**
```typescript
interface GatePass {
  token_id: string;                 // Unique token (e.g., GP-2026-00123)
  gate_in_id: string;
  vehicle_number: string;
  item_name: string;                // Product name
  pc_code: string;                  // Product category code
  net_weight_kg: number;            // From scale-out
  clearance_date: Date;
  issued_by: string;                // Command Center user
  qr_code: string;                  // QR code for scanning
  printable: boolean;               // True (must be printable)
}
```

**Gate Pass Workflow:**
1. Command Center issues gate pass after all clearances met
2. Gate pass printed (includes QR code)
3. Driver receives gate pass
4. Driver presents gate pass at gate
5. Gate operator scans QR code or enters token ID
6. System validates token and allows gate-out entry

### UI/UX Behavior

**Gate-Out Entry Form:**

**Section 1: Vehicle Lookup**
- Vehicle Number (text input or QR scan)
- "Lookup" button → Fetches gate-in record

**Section 2: Gate-In Summary** (read-only, displayed after lookup)
- Gate-In Time, Document Number, Product, Quantity
- Current Status (e.g., "Scale-Out Complete, QC Passed")

**Section 3: Clearance Validation** (auto-checked)
- ✅ Scale-Out Complete
- ✅ QC Passed (if required)
- ✅ Loading/Unloading Complete
- ✅ Gate Pass Issued

**Section 4: Gate-Out Entry**
- Gate Pass Token (text input or QR scan)
- Gate-Out Date/Time (auto-filled, editable)
- Remarks (optional)

**Action Buttons:**
- **Register Gate-Out** (validates, saves, updates trip/TO status)
- **Print Delivery Note** (optional, for driver copy)
- **Cancel**

**Real-Time Feedback:**
- Green checkmark: "Gate-Out registered. Vehicle cleared for exit. Dwell time: 3 hours 45 minutes."
- Red error: "Gate-Out blocked: QC status PENDING. Vehicle cannot exit."
- Red error: "Gate-Out blocked: Scale-Out not complete."

---

## On-Demand Third Party Management at Gate-In

### Purpose

Handle **unplanned or ad-hoc** supplier and dealer visits where the vehicle/party is **not pre-registered** in the system. Gate operators need to quickly register new suppliers or dealers "on-the-fly" to allow operational processing.

### Use Cases

**1. Unregistered Supplier Arrival:**
- Supplier not in vendor master
- One-time or trial purchase
- Emergency procurement

**2. Unregistered Dealer Arrival:**
- Walk-in dealer (not in dealer master)
- First-time buyer
- Special distribution arrangement

### Workflow

```
1. Vehicle arrives at gate (supplier or dealer)
2. Gate operator checks master data:
   - Supplier/Dealer not found
3. Gate operator initiates "Quick Registration":
   - Party type (Supplier / Dealer)
   - Party name (required)
   - Contact person, phone, email
   - Address (optional)
   - Tax ID / Registration number (optional)
4. System creates temporary party record:
   - Status = TEMPORARY
   - Requires approval (post-gate-in)
5. Gate operator proceeds with normal gate-in entry:
   - Links temporary party to gate-in record
6. Post-operation:
   - Admin reviews temporary party
   - Approves → Converts to permanent master data record
   - Rejects → Flags for follow-up (but gate-in remains valid)
```

### Data Model Extensions

```typescript
interface TemporaryParty {
  temp_party_id: string;
  party_type: 'SUPPLIER' | 'DEALER';
  party_name: string;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  address?: string;
  tax_id?: string;
  
  status: 'TEMPORARY' | 'APPROVED' | 'REJECTED';
  created_by: string;               // Gate operator
  created_at: Date;
  approved_by?: string;             // Admin user
  approved_at?: Date;
  rejection_reason?: string;
  
  gate_in_ids: string[];            // Gate-ins using this temp party
  tenant_id: string;
}
```

### Business Rules

1. **Temporary parties valid for gate-in:** Operations proceed normally
2. **Post-approval conversion:** Admin converts temp party to master data
3. **No payment processing for temp suppliers:** Finance holds payments until party approved
4. **Temp dealer restrictions:** Cannot access dealer portal until approved

---

## Dwell Time Tracking

### Purpose

Calculate and monitor **time spent by vehicles at POIs** to identify bottlenecks, optimize operations, and enforce SLAs.

### Calculation

```typescript
dwell_time_minutes = (gate_out_time - gate_in_time) / 60000;  // milliseconds to minutes
```

### Dwell Time Categories

**Normal Dwell Times (Phase 1 benchmarks):**
- **Inbound (Supplier/Port):** 2-4 hours (Scale-In → QC → Unloading → Scale-Out)
- **Outbound (Dealer):** 1-2 hours (Loading → Scale-Out)
- **Internal Transfer:** 1-3 hours (Scale-In → Unloading → Scale-Out)

### Alerts & Thresholds

**Dwell Time Alerts:**
```typescript
if (dwell_time_minutes > threshold_minutes) {
  // Threshold examples: 180 min (3 hours) for outbound, 240 min (4 hours) for inbound
  triggerAlert({
    type: 'EXCESSIVE_DWELL_TIME',
    vehicle_number: vehicle_number,
    dwell_time: dwell_time_minutes,
    threshold: threshold_minutes,
    notify: ['Command Center', 'Operations Manager']
  });
}
```

### Dwell Time Breakdown (Phase 2+)

Track time spent at each station:
- Time at weighbridge (scale-in + scale-out)
- Time at QC station
- Time at loading/unloading bay
- Time in parking/waiting

---

## Integration Points

### Upstream: Transport Order (TO) / Trip

**TO-Linked Gate-In:**
- Gate-in for internal transfers references TO/Trip
- TO/Trip status updated: `IN_TRANSIT` → `AT_DESTINATION` (on gate-in at destination POI)

**Trip-Linked Gate-Out:**
- Gate-out at source POI: Trip status → `DEPARTED_SOURCE`
- Gate-out at destination POI: Trip status → `DEPARTED_DESTINATION` → `COMPLETED` (if QC passed + POD)

### Downstream: Scaling Management

**Gate-In → Scale-In:**
- Gate-in record triggers scale-in queue entry
- Scaling operator views gate-in details (vehicle, product, quantity)

### Downstream: QC Workflow

**Gate-In → QC Inspection:**
- Inbound gate-ins (supplier/port) auto-generate QC inspection records
- QC status blocks gate-out until passed

### Downstream: Command Center

**Gate-In Notifications:**
- Command Center receives real-time gate-in events
- Queue management dashboard updated

**Gate Pass Issuance:**
- Command Center issues gate pass after all clearances
- Gate pass required for gate-out

### Downstream: POI Capacity Tracking

**Stock Updates:**
- Inbound gate-out (after unloading) → Destination POI stock +quantity
- Outbound gate-out (after loading) → Source POI stock -quantity

---

## Performance & Scalability

### Expected Volume (Phase 1)

- **Daily gate-ins:** 100-300 vehicles per POI (varies by POI type)
- **Peak hours:** 8am-12pm, 2pm-5pm
- **Average dwell time:** 2-3 hours

### Query Optimization

```sql
-- Open Gate-Ins (no gate-out yet)
CREATE INDEX idx_gate_in_status ON gate_in_entries(poi_id, status, gate_in_time DESC)
WHERE status != 'GATE_OUT_COMPLETE';

-- Gate-In by Vehicle (lookup)
CREATE INDEX idx_gate_in_vehicle ON gate_in_entries(vehicle_number, gate_in_time DESC);

-- Gate-In by Document (TO/PO/DO lookup)
CREATE INDEX idx_gate_in_document ON gate_in_entries(document_number, document_category);

-- Dwell Time Analytics
CREATE INDEX idx_gate_dwell_time ON gate_in_entries(poi_id, gate_in_time, gate_out_time)
WHERE gate_out_time IS NOT NULL;
```

---

## Security & Compliance

### Data Access Control

- **Tenant Isolation:** All gate entries filtered by `tenant_id`
- **POI-Based Access:** Gate operators can only access gate-ins for their assigned POI
- **Role-Based Visibility:**
  - Gate Operator: Own POI gate-ins
  - Command Center: All POIs (tenant-wide)
  - Admin: All POIs, all data

### Audit Requirements

**Mandatory Audit Events:**
- Gate-in registration
- Gate-out registration
- Gate-in/gate-out time edits (if allowed)
- Temporary party creation
- Gate pass issuance
- Clearance overrides (if allowed)

**Audit Payload:**
```json
{
  "event": "GATE_IN_REGISTERED",
  "gate_in_id": "GI-2026-00123",
  "vehicle_number": "ABC-1234",
  "document_category": "INTERNAL_TO",
  "document_number": "TO-2026-00456",
  "poi_id": "POI-DEPOT-A",
  "gate_operator": "GO-789",
  "timestamp": "2026-02-26T08:15:00Z",
  "routed_workflow": "INTERNAL_TRANSFER"
}
```

---

## Key Design Decisions

### Why Separate Gate-In and Gate-Out?

**Rationale:**
- Gate-in and gate-out are **distinct events** separated by operational processes
- Allows tracking vehicle status throughout POI journey
- Enables dwell time calculation and bottleneck identification

### Why Mandatory Scale-Out Before Gate-Out?

**Rationale:**
- Prevents weight fraud (vehicle must be weighed before exit)
- Ensures accurate stock tracking (loaded/unloaded quantity verified)
- Enforces operational sequence (scale-out confirms loading/unloading complete)

### Why QC Blocks Gate-Out?

**Rationale:**
- Quality assurance (prevents substandard products from entering stock)
- Compliance (regulatory requirements for raw material acceptance)
- Operational control (ensures all inbound materials inspected)

### Why Allow Null Quantity for Empty Vehicles?

**Rationale:**
- Empty vehicles (outbound pre-loading) have no inbound quantity
- Distinguishes between "unloading vehicles" and "loading vehicles"
- Simplifies gate-in process (no need to enter zero or dummy values)

---

## Related User Stories

- **US-040:** Gate-In Entry
- **US-041:** Gate-Out Entry
- **US-042:** On-Demand Third Party Registration
- **US-043:** Gate Pass Generation
- **US-044:** Dwell Time Tracking

---

## Summary

Gate Management is the **entry/exit control layer** that provides:

- **Vehicle Registration:** Formal logging of all vehicle movements (gate-in/gate-out)
- **Document Validation:** PO, TO, DO, Challan verification and routing
- **Workflow Routing:** Automatic routing to inbound QC, outbound loading, or internal transfer workflows
- **Clearance Enforcement:** QC pass, scale-out completion, gate pass requirements
- **Dwell Time Tracking:** Calculate time spent at POI, identify bottlenecks
- **On-Demand Party Registration:** Handle unplanned supplier/dealer visits
- **Audit Trail:** Complete timestamp and user tracking for all gate operations

Gate Management ensures that all vehicle movements at POIs are controlled, validated, and traceable, providing the foundation for downstream operational processes (scaling, QC, loading, trip tracking).
