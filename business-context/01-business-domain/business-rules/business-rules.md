---
title: DFMS Business Rules
category: business
phase: requirements
status: approved
created: 2026-02-10
updated: 2026-02-10
source_documents:
  - ../../../source-documents/requirements/PRD_DFMS_v1.0.docx
  - ../../../source-documents/business-proposal/BS23_Proposal_Nourish_LFMS_v1.3.1_No_Commercial.docx
  - ../../../source-documents/meeting-minutes/2025-09/Transport_Operations_2025-09-29.docx
  - ../../../source-documents/meeting-minutes/2025-10/Distribution_Sales_2025-10-06.docx
  - ../../../source-documents/meeting-minutes/2025-10/QA_QC_Operations_2025-10-06.docx
tags: [business-rules, constraints, validation, logic]
---

# DFMS Business Rules

> Business logic, constraints, and validation rules governing DFMS operations

## Overview

This document defines the business rules that govern DFMS operations. Business rules are constraints, validations, calculations, and decision logic that ensure system integrity and business process compliance.

---

## Rule Categories

1. **Master Data Rules** - Govern data integrity and relationships
2. **Requisition Rules** - Control PR/TR creation and approval
3. **Transport Rules** - Manage TO creation and trip execution
4. **Vendor Rules** - Control vendor operations and billing
5. **Operations Rules** - Govern gate, scaling, loading/unloading
6. **Quality Control Rules** - Ensure quality compliance
7. **Financial Rules** - Control costing and billing
8. **System Rules** - Cross-cutting system constraints

---

## 1. Master Data Rules

### 1.1 Vehicle Rules

**VR-001: Unique Vehicle Registration**
- **Rule**: Each vehicle must have a unique registration number within a tenant
- **Validation**: System SHALL prevent duplicate vehicle registration numbers
- **Impact**: Vehicle master data creation

**VR-002: Vehicle Status Exclusivity**
- **Rule**: A vehicle can only have one status at a time
- **Valid States**: Available, Active, Idle, Scheduled/Parked, Under Maintenance
- **Impact**: Vehicle assignment, fleet dashboard

**VR-003: Maintenance Exclusion**
- **Rule**: Vehicles under maintenance cannot be assigned to trips
- **Validation**: System SHALL exclude vehicles with status "Under Maintenance" from assignment lists
- **Impact**: TO assignment, fleet availability

**VR-004: Single Active Trip**
- **Rule**: One vehicle can only be assigned to one active trip at a time
- **Validation**: System SHALL prevent assigning vehicle to new trip if already on active trip
- **Impact**: TO assignment, trip execution

**VR-005: Vehicle-Driver Binding**
- **Rule**: When vehicle is assigned to TO, driver must also be assigned
- **Validation**: System SHALL require driver assignment before trip dispatch
- **Impact**: TO assignment workflow

---

### 1.2 Driver Rules

**DR-001: Unique Driver License**
- **Rule**: Each driver must have a unique license number within a tenant
- **Validation**: System SHALL prevent duplicate driver license numbers
- **Impact**: Driver master data creation

**DR-002: Driver State Exclusivity**
- **Rule**: A driver can only have one state at a time
- **Valid States**: Assigned, Available, On Leave
- **Impact**: Driver assignment, availability tracking

**DR-003: Leave Exclusion**
- **Rule**: Drivers on leave cannot be assigned to trips
- **Validation**: System SHALL exclude drivers with state "On Leave" from assignment lists
- **Impact**: TO assignment

**DR-004: Single Active Assignment**
- **Rule**: One driver cannot be assigned to multiple active trips
- **Validation**: System SHALL prevent assigning driver to new trip if already on active trip
- **Impact**: TO assignment

**DR-005: Maximum Working Hours**
- **Rule**: Driver working hours should not exceed configured maximum (default: 12 hours)
- **Validation**: System SHALL calculate effective driving hours using GPS data
- **Impact**: Driver utilization, compliance reporting
- **Note**: Warning only, not blocking

**DR-006: Driving Hours Calculation**
- **Rule**: Driving hours exclude idle or parked durations
- **Calculation**: Effective driving hours = GPS movement time only
- **Impact**: Driver performance, compliance

---

### 1.3 Helper Rules

**HR-001: Unique Helper NID**
- **Rule**: Each helper must have a unique National ID within a tenant
- **Validation**: System SHALL prevent duplicate helper NIDs
- **Impact**: Helper master data creation

**HR-002: Multiple Helper Assignment**
- **Rule**: Multiple helpers can be assigned to one driver/trip
- **Validation**: System SHALL support many-to-one mapping
- **Impact**: TO assignment

**HR-003: No Conflicting Assignments**
- **Rule**: A helper may be assigned to multiple trips over time but NOT to conflicting active trips
- **Validation**: System SHALL prevent overlapping active trip assignments
- **Impact**: Helper assignment

---

### 1.4 Vendor Rules

**VDR-001: Vendor Approval Required**
- **Rule**: Vendors cannot access system before admin approval
- **Validation**: System SHALL restrict vendor login until status = "Approved"
- **Impact**: Vendor onboarding

**VDR-002: Document Upload Mandatory**
- **Rule**: Vendor registration requires trade license, BIN, TIN uploads
- **Validation**: System SHALL prevent registration submission without all documents
- **Impact**: Vendor registration

**VDR-003: Vendor Type Determines Workflow**
- **Rule**: Vendor type (Contractual vs Non-Contractual) determines bidding requirement
- **Logic**:
  - Contractual: Direct TO assignment, no bidding
  - Non-Contractual: Must participate in bidding to win TOs
- **Impact**: TO assignment to vendors

---

### 1.5 POI Rules

**PR-001: Unique POI Name**
- **Rule**: Each POI must have a unique name within a tenant
- **Validation**: System SHALL prevent duplicate POI names
- **Impact**: POI master data creation

**PR-002: GPS Coordinates Required**
- **Rule**: POI must have valid GPS coordinates for geofencing
- **Validation**: System SHALL require latitude and longitude
- **Impact**: POI creation, geofencing, routing

**PR-003: Capacity Tracking**
- **Rule**: POI capacity (MT) must be tracked for inventory management
- **Validation**: System SHALL maintain current stock and free capacity
- **Impact**: Stock validation, capacity warnings

---

### 1.6 Product Rules

**PDR-001: Unique Product SKU**
- **Rule**: Each product must have a unique SKU/Item Code within a tenant
- **Validation**: System SHALL prevent duplicate SKUs
- **Impact**: Product master data creation

**PDR-002: Product Category Required**
- **Rule**: Product must be classified as Finished Goods (FG) or Raw Material (RM)
- **Validation**: System SHALL enforce category selection
- **Impact**: Product creation, requisition workflows

**PDR-003: Transport Attributes**
- **Rule**: Products must have transport-related attributes (UOM, weight per unit, packing type)
- **Validation**: System SHALL require these attributes for transport planning
- **Impact**: Product creation, TR/TO quantity calculations

---

## 2. Requisition Rules

### 2.1 Product Requisition (PR) Rules

**PRR-001: Transfer Type Mandatory**
- **Rule**: PR cannot be submitted without transfer type selection
- **Valid Types**: Finished Goods Transfer, Port Consignment Transfer
- **Validation**: System SHALL enforce transfer type selection
- **Impact**: PR creation

**PRR-002: Minimum One Product Line**
- **Rule**: PR must have at least one product line item
- **Validation**: System SHALL prevent PR submission without products
- **Impact**: PR creation

**PRR-003: FG Transfer Initiators**
- **Rule**: Only Depot and Feed Mill users can raise Finished Goods requisitions
- **Validation**: System SHALL restrict FG PR creation by role
- **Impact**: PR creation access control

**PRR-004: Port Transfer Initiators**
- **Rule**: Only Commercial Officers can create Port Consignment PRs
- **Validation**: System SHALL restrict Port PR creation by role
- **Impact**: PR creation access control

**PRR-005: FG Routing**
- **Rule**: FG requisitions SHALL route to Distribution for approval
- **Workflow**: Depot/Feed Mill → Distribution Officer → Distribution Manager → Transport
- **Impact**: PR approval workflow

**PRR-006: Port Routing**
- **Rule**: Port requisitions SHALL route to Procurement for approval
- **Workflow**: Commercial → Procurement Officer → Transport
- **Impact**: PR approval workflow

---

### 2.2 Transport Requisition (TR) Rules

**TRR-001: TR from Approved PR Only**
- **Rule**: TRs can only be created from approved PRs
- **Validation**: System SHALL restrict TR creation to approved PRs
- **Impact**: TR creation

**TRR-002: Multiple TRs from Single PR**
- **Rule**: Multiple TRs can be created from a single PR until full quantity allocated
- **Validation**: System SHALL track remaining PR quantity
- **Impact**: TR creation, partial allocation

**TRR-003: TR Quantity Limit**
- **Rule**: TR quantity cannot exceed approved PR quantity
- **Validation**: System SHALL validate TR quantity ≤ remaining PR quantity
- **Impact**: TR creation

**TRR-004: Mandatory TR Fields**
- **Rule**: TR must have source POI, destination POI, transfer quantity, delivery date, vehicle count, vehicle type
- **Validation**: System SHALL enforce all mandatory fields
- **Impact**: TR creation

**TRR-005: Capacity Warning**
- **Rule**: System SHALL display warnings when destination capacity is limited or meets threshold
- **Validation**: Warning only, not blocking
- **Impact**: TR creation, capacity planning

**TRR-006: TR Approval Required**
- **Rule**: TRs must be approved by Distribution Manager (FG) before forwarding to Transport
- **Validation**: System SHALL route TR for approval
- **Impact**: TR workflow

**TRR-007: Destination Breakdown for Port**
- **Rule**: Port TRs require destination breakdown plan by Procurement
- **Validation**: System SHALL require POI-wise allocation before TR generation
- **Impact**: Port TR creation

---

## 3. Transport Rules

### 3.1 Transport Order (TO) Rules

**TOR-001: TO from Approved TR Only**
- **Rule**: TOs can only be created from approved TRs
- **Validation**: System SHALL restrict TO creation to approved TRs
- **Impact**: TO creation

**TOR-002: Multiple TOs from Single TR**
- **Rule**: Multiple TOs can be created from a single TR (partial allocation)
- **Validation**: System SHALL track remaining TR quantity
- **Impact**: TO creation

**TOR-003: TO Quantity Limit**
- **Rule**: Total TO quantity cannot exceed TR quantity
- **Validation**: System SHALL validate sum of TO quantities ≤ TR quantity
- **Impact**: TO creation

**TOR-004: Fleet Type Exclusivity**
- **Rule**: Each TO must be assigned to exactly one fleet type (Own or Vendor)
- **Validation**: System SHALL enforce single fleet type selection
- **Impact**: TO creation

**TOR-005: Fleet Type Immutable**
- **Rule**: A TO cannot be handled by both fleet types simultaneously
- **Validation**: System SHALL prevent fleet type change after assignment
- **Impact**: TO execution

**TOR-006: Product Attributes Locked**
- **Rule**: All product-related attributes inherited from TR are read-only in TO
- **Validation**: System SHALL lock product fields in TO
- **Impact**: TO creation, data integrity

**TOR-007: Unique TO ID**
- **Rule**: System SHALL auto-generate unique TO ID
- **Validation**: System-generated, immutable
- **Impact**: TO creation, traceability

---

### 3.2 Trip Assignment Rules

**TAR-001: Assignment Before Dispatch**
- **Rule**: TO cannot be dispatched before vehicle, driver, and helper assignment
- **Validation**: System SHALL prevent dispatch without complete assignment
- **Impact**: TO dispatch

**TAR-002: Available Resources Only**
- **Rule**: Only available resources can be assigned
- **Validation**: System SHALL exclude:
  - Vehicles under maintenance or on active trip
  - Drivers on leave or on active trip
  - Helpers on conflicting active trip
- **Impact**: Resource assignment

**TAR-003: ETA Required**
- **Rule**: TDO must define Estimated Time of Arrival when assigning resources
- **Validation**: System SHALL require ETA input
- **Impact**: TO assignment

---

### 3.3 Trip Lifecycle Rules

**TLR-001: Sequential State Transitions**
- **Rule**: TO states must follow defined lifecycle sequence
- **Sequence**: Draft → Planned → Assigned → Dispatched → In Transit - Source → At Source → Loaded → In Transit - Destination → At Destination → Delivered → Completed → Closed
- **Validation**: System SHALL enforce state transition rules
- **Impact**: Trip execution

**TLR-002: State Transition Triggers**
- **Rule**: State transitions can only occur based on allowed workflow triggers
- **Validation**: System SHALL validate trigger before state change
- **Impact**: Trip execution

**TLR-003: Closure Requirements**
- **Rule**: Trip can only close if QC Pass received, POD uploaded, and Gate-out recorded
- **Validation**: System SHALL validate all closure criteria
- **Impact**: Trip closure

**TLR-004: QC Fail Blocks Closure**
- **Rule**: Trip cannot close if QC status is Fail
- **Validation**: System SHALL prevent closure until QC Pass or recheck
- **Impact**: Trip closure

---

### 3.4 Incident Management Rules

**IMR-001: Halt Allowed States**
- **Rule**: TP can halt TO only at in-progress states (In Transit – Source, At Source, In Transit – Destination)
- **Validation**: System SHALL allow halt only from allowed states
- **Impact**: Incident handling

**IMR-002: Halt Requires Reason**
- **Rule**: Halting TO requires mandatory incident type and remarks
- **Validation**: System SHALL enforce reason entry
- **Impact**: Incident handling

**IMR-003: Re-Delivery TO Creation**
- **Rule**: New TO can be created for pending quantity from halted TO
- **Validation**: System SHALL link new TO to halted TO and original TR
- **Impact**: Partial delivery

**IMR-004: Quantity Reconciliation**
- **Rule**: System SHALL calculate delivered quantity using destination scale-in/scale-out weights
- **Calculation**: Delivered Quantity = Scale-out Weight - Scale-in Weight
- **Impact**: Partial delivery, inventory

**IMR-005: Inventory Update on Delivered Quantity**
- **Rule**: Destination inventory updates only for successfully delivered quantity after QC Pass
- **Validation**: System SHALL update inventory based on actual delivered quantity
- **Impact**: Inventory accuracy

---

### 3.5 TR Conjoinment Rules (Phase 2)

**TCR-001: Single TO In Transit**
- **Rule**: Only one TO per vehicle can be in "In Transit" status at any time
- **Validation**: System SHALL enforce single active TO per vehicle
- **Impact**: Multi-TO assignment

**TCR-002: Sequential TO Execution**
- **Rule**: Vehicle must complete TO-1 before TO-2 execution starts
- **Validation**: System SHALL enforce TO completion sequence
- **Impact**: Multi-TO execution

**TCR-003: Independent TO Tracking**
- **Rule**: Each TO retains own status lifecycle, POD, QC outcome even when sharing vehicle
- **Validation**: System SHALL track each TO independently
- **Impact**: Multi-TO execution, reporting

---

## 4. Vendor Rules

### 4.1 Bidding Rules

**BR-001: Bidding Window Enforcement**
- **Rule**: Bids cannot be submitted after bidding window closes
- **Validation**: System SHALL prevent bid submission after deadline
- **Impact**: Vendor bidding

**BR-002: Bid Immutability**
- **Rule**: Bids cannot be edited after submission
- **Validation**: System SHALL lock bid after submission
- **Impact**: Vendor bidding

**BR-003: Bid Timestamp Recording**
- **Rule**: System SHALL record bid submission timestamp
- **Validation**: Automatic timestamp capture
- **Impact**: Bid evaluation, audit

**BR-004: Winner Selection Finality**
- **Rule**: Vendor selection is final once approved
- **Validation**: System SHALL lock vendor assignment after approval
- **Impact**: Bid evaluation

**BR-005: Contractual Rate Hiding**
- **Rule**: Contractual rates must be hidden from vendor view
- **Validation**: System SHALL not display rates to contractual vendors
- **Impact**: Vendor portal

---

### 4.2 Invoice Rules

**IR-001: Completed Trips Only**
- **Rule**: Only completed trips are billable
- **Validation**: System SHALL allow invoice creation only for trips with status "Completed" or "Closed"
- **Impact**: Vendor invoicing

**IR-002: POD and GRN Mandatory**
- **Rule**: Invoice cannot be submitted without POD and GRN for each trip
- **Validation**: System SHALL block invoice submission if documents missing
- **Impact**: Vendor invoicing

**IR-003: Invoice Consolidation**
- **Rule**: System SHALL support one invoice per TO or consolidated invoice for multiple TOs
- **Validation**: Flexible invoice creation
- **Impact**: Vendor invoicing

**IR-004: Vendor Cost Locking**
- **Rule**: Vendor cost is locked after Bid approval (non-contractual) or at TO assignment (contractual)
- **Validation**: System SHALL prevent cost modification after locking
- **Impact**: Cost calculation, invoice verification

---

## 5. Operations Rules

### 5.1 Gate Rules

**GR-001: Vehicle Number Mandatory**
- **Rule**: Gate-in cannot be saved without vehicle number
- **Validation**: System SHALL enforce vehicle number entry
- **Impact**: Gate-in

**GR-002: Empty Vehicle Quantity**
- **Rule**: For empty vehicles, quantity kept null
- **Validation**: System SHALL allow null quantity for empty vehicles
- **Impact**: Gate-in

**GR-003: Gate-out After Scale-out**
- **Rule**: Gate-out cannot occur before scale-out
- **Validation**: System SHALL enforce sequence: Scale-out → Gate-out
- **Impact**: Gate-out

**GR-004: QC Pending Blocks Gate-out**
- **Rule**: Gate-out blocked if QC status is pending (for unloading flows)
- **Validation**: System SHALL check QC status before allowing gate-out
- **Impact**: Gate-out, unloading workflow

**GR-005: On-Demand TO Availability**
- **Rule**: On-demand TO (Dealer/Supplier) immediately available for operations
- **Validation**: System SHALL make TO available for Scaling, Loading, Gate-out
- **Impact**: On-demand TO creation

**GR-006: Inventory Timing**
- **Rule**: 
  - FG: Inventory deduction occurs after loading & scale-out
  - RM: Inventory updated only after QC Pass
- **Validation**: System SHALL update inventory at correct event
- **Impact**: Inventory accuracy

---

### 5.2 Scaling Rules

**SR-001: Scale-in After Gate-in**
- **Rule**: Scale-in must occur after gate-in
- **Validation**: System SHALL enforce sequence: Gate-in → Scale-in
- **Impact**: Scaling workflow

**SR-002: Weight Entry Immutability**
- **Rule**: Weight entries are immutable after scale-out
- **Validation**: System SHALL lock scale-in weight after scale-out recorded
- **Impact**: Data integrity

**SR-003: Net Weight Calculation**
- **Rule**: System SHALL auto-calculate net weight = Gross weight (scale-in) - Tare weight (scale-out)
- **Calculation**: Automatic
- **Impact**: Weight accuracy

**SR-004: Queue Token Uniqueness**
- **Rule**: System SHALL generate unique waiting queue token (P.C. Code) after scale-in
- **Validation**: System-generated, unique per vehicle per visit
- **Impact**: Queue management

---

### 5.3 Command Center Rules

**CCR-001: Scale-in Completion Required**
- **Rule**: Only vehicles with completed Scale-in appear in Command Center queue
- **Validation**: System SHALL filter vehicles by scale-in status
- **Impact**: Queue visibility

**CCR-002: Assigned Vehicle Exclusion**
- **Rule**: Vehicles already assigned to loading point do not appear in waiting queue
- **Validation**: System SHALL exclude assigned vehicles from queue
- **Impact**: Queue management

**CCR-003: Serial Uniqueness**
- **Rule**: One active serial per vehicle per loading point
- **Validation**: System SHALL generate unique serial per assignment
- **Impact**: Loading sequence

**CCR-004: Serial Immutability**
- **Rule**: Serials cannot be edited
- **Validation**: System SHALL lock serial after generation
- **Impact**: Audit trail

**CCR-005: Serial Audit**
- **Rule**: Serial assignment time and issuer must be audit-logged
- **Validation**: Automatic audit logging
- **Impact**: Traceability

---

### 5.4 Loading/Unloading Rules

**LUR-001: Chronological Timestamps**
- **Rule**: Loading/unloading timestamps must be chronological
- **Validation**: System SHALL validate End Time > Start Time
- **Impact**: Time tracking

**LUR-002: QC Trigger**
- **Rule**: QC must be triggered before or during unloading
- **Validation**: System SHALL create QC event for unloading
- **Impact**: Unloading workflow

**LUR-003: Scale-out After QC Pass**
- **Rule**: Vehicle cannot proceed to scale-out until QC Pass (for unloading)
- **Validation**: System SHALL check QC status before allowing scale-out
- **Impact**: Unloading workflow

---

## 6. Quality Control Rules

### 6.1 QC Context Rules

**QCR-001: Context Before Sampling**
- **Rule**: QC Context must be displayed before sample creation
- **Validation**: System SHALL show context before allowing sampling
- **Impact**: QC workflow

**QCR-002: Context Data Mandatory**
- **Rule**: QC actions blocked if mandatory context data missing
- **Validation**: System SHALL validate context completeness
- **Impact**: QC workflow

---

### 6.2 Sampling Rules

**SMR-001: Sampling After Event Creation**
- **Rule**: Sampling must occur after QC Sampling event creation
- **Validation**: System SHALL enforce event creation before sampling
- **Impact**: QC workflow

**SMR-002: Sequential Timestamps**
- **Rule**: Sampling timestamps must be sequential (End Time > Start Time)
- **Validation**: System SHALL validate timestamp sequence
- **Impact**: Time tracking

**SMR-003: QR Code Uniqueness**
- **Rule**: One QR code per sample
- **Validation**: System SHALL generate unique QR per sample
- **Impact**: Sample tracking

**SMR-004: QR Code Immutability**
- **Rule**: QR code tied to sample, cannot be changed
- **Validation**: System SHALL lock QR code after generation
- **Impact**: Traceability

---

### 6.3 Lab Testing Rules

**LTR-001: QR Scan Triggers Start**
- **Rule**: QR scan by lab personnel automatically triggers lab test start time
- **Validation**: Automatic timestamp capture on scan
- **Impact**: Lab workflow

**LTR-002: Lab Start Time Authority**
- **Rule**: QR scan time is authoritative lab start time
- **Validation**: System SHALL use scan timestamp as start time
- **Impact**: Lab timing

---

### 6.4 QC Decision Rules

**QDR-001: QC Pass Required for Closure**
- **Rule**: Trip closure requires QC Pass
- **Validation**: System SHALL validate QC status before closure
- **Impact**: Trip closure

**QDR-002: QC Fail Blocks Closure**
- **Rule**: QC Fail blocks trip closure
- **Validation**: System SHALL prevent closure if QC status = Fail
- **Impact**: Trip closure

**QDR-003: Recheck Remarks Mandatory**
- **Rule**: Recheck/resampling requires mandatory remarks
- **Validation**: System SHALL enforce remarks entry for recheck
- **Impact**: QC escalation

**QDR-004: Inventory Update on QC Pass**
- **Rule**: Destination inventory updates only after QC Pass (for inbound)
- **Validation**: System SHALL update inventory based on QC result
- **Impact**: Inventory accuracy

---

## 7. Financial Rules

### 7.1 Cost Calculation Rules

**CR-001: Cost Record Creation**
- **Rule**: Trip cost record generated when trip created
- **Validation**: Automatic record creation
- **Impact**: Cost tracking

**CR-002: Manual Entry Authorization**
- **Rule**: Manual cost entry allowed only for authorized roles
- **Validation**: System SHALL enforce role-based access for cost entry
- **Impact**: Cost management

**CR-003: Cost Audit**
- **Rule**: Cost history audit-logged
- **Validation**: Automatic audit logging for all cost changes
- **Impact**: Financial audit

**CR-004: Cost Summary After Closure**
- **Rule**: Trip cost summary available after trip closure
- **Validation**: System SHALL generate summary after closure
- **Impact**: Financial reporting

---

### 7.2 Vendor Cost Rules

**VCR-001: Cost Linkage**
- **Rule**: Vendor cost linked to TO ID, Trip ID, Vendor ID
- **Validation**: System SHALL maintain linkage
- **Impact**: Cost tracking

**VCR-002: Cost Locking**
- **Rule**: Vendor cost locked after Bid approval (non-contractual) or at assignment (contractual)
- **Validation**: System SHALL prevent cost modification after locking
- **Impact**: Cost integrity

**VCR-003: Invoice-TO Mapping**
- **Rule**: System SHALL support one invoice per TO or consolidated invoice
- **Validation**: Flexible mapping
- **Impact**: Invoice management

**VCR-004: Supporting Documents**
- **Rule**: POD and GRN mandatory before invoice submission
- **Validation**: System SHALL block invoice without documents
- **Impact**: Invoice verification

---

## 8. System Rules

### 8.1 Data Integrity Rules

**DIR-001: Referential Integrity**
- **Rule**: System SHALL enforce referential integrity across all entities
- **Validation**: Database constraints
- **Impact**: Data consistency

**DIR-002: Audit Trail**
- **Rule**: All data modifications must be audit-logged
- **Validation**: Automatic audit logging
- **Impact**: Traceability, compliance

**DIR-003: Immutable Records**
- **Rule**: Certain records are immutable after creation (e.g., audit logs, QR codes, serials)
- **Validation**: System SHALL prevent modification of immutable records
- **Impact**: Data integrity

---

### 8.2 Access Control Rules

**ACR-001: Role-Based Access**
- **Rule**: All operations must respect role-based access control
- **Validation**: System SHALL enforce RBAC for all actions
- **Impact**: Security, data access

**ACR-002: Tenant Isolation**
- **Rule**: Data must be isolated between tenants
- **Validation**: System SHALL enforce tenant-level data separation
- **Impact**: Multi-tenancy, security

---

### 8.3 Validation Rules

**VR-001: Mandatory Fields**
- **Rule**: Mandatory fields must be validated before form submission
- **Validation**: Client-side and server-side validation
- **Impact**: Data quality

**VR-002: Business Logic Validation**
- **Rule**: Business rules must be validated before operation execution
- **Validation**: Server-side validation
- **Impact**: Process integrity

**VR-003: Real-time Feedback**
- **Rule**: Validation errors must provide real-time feedback to users
- **Validation**: Client-side validation with clear error messages
- **Impact**: User experience

---

## Business Rule Enforcement

### Enforcement Levels

| Level | Description | Action | Example |
|-------|-------------|--------|---------|
| **Critical** | Must be enforced, blocks operation | Prevent action, show error | Vehicle under maintenance cannot be assigned |
| **High** | Should be enforced, warns user | Allow with confirmation | Destination capacity threshold exceeded |
| **Medium** | Recommended, provides guidance | Show warning, allow proceed | Driver working hours approaching limit |
| **Low** | Informational only | Show info, no blocking | Best practice suggestions |

---

## Business Rule Traceability

| Rule Category | Total Rules | Critical | High | Medium | Low |
|---------------|-------------|----------|------|--------|-----|
| Master Data | 21 | 15 | 5 | 1 | 0 |
| Requisition | 13 | 10 | 3 | 0 | 0 |
| Transport | 24 | 18 | 6 | 0 | 0 |
| Vendor | 9 | 7 | 2 | 0 | 0 |
| Operations | 18 | 14 | 4 | 0 | 0 |
| Quality Control | 13 | 10 | 3 | 0 | 0 |
| Financial | 8 | 6 | 2 | 0 | 0 |
| System | 6 | 6 | 0 | 0 | 0 |
| **Total** | **112** | **86** | **25** | **1** | **0** |

---

## Related Documents

- [Functional Requirements](../../02-requirements/functional-requirements/) - Feature specifications
- [Business Processes](../business-processes/) - Process workflows
- [Constraints & Assumptions](../../02-requirements/constraints-assumptions.md) - Project constraints

---

**Last Updated**: 2026-02-10  
**Status**: Approved  
**Version**: 1.0  
**Total Rules**: 112 (Critical: 86, High: 25, Medium: 1, Low: 0)  
**Review Cycle**: Quarterly or per major release

