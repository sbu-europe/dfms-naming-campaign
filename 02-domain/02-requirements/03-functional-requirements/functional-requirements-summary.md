---
title: DFMS Functional Requirements Summary
category: business
phase: requirements
status: approved
created: 2026-02-10
updated: 2026-02-10
source_documents:
  - ../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../source-documents/business-proposal/BS23_Proposal_Nourish_LFMS_v1.3.1_No_Commercial.docx
  - ../../../source-documents/discovery-phase/flow-diagrams/
tags: [functional-requirements, features, modules, user-stories]
---

# DFMS Functional Requirements Summary

> Comprehensive overview of all functional requirements organized by module

## Executive Summary

This document provides a high-level summary of all functional requirements for the DFMS platform, extracted from PRD v1.0. The system comprises 12 major modules with 200+ functional requirements across 3 deployment phases.

---

## Module Overview

| Module | Phase 1 Features | Phase 2 Features | Phase 3 Features | Total User Stories |
|--------|------------------|------------------|------------------|-------------------|
| Master Data Management | 8 | 0 | 0 | 8 |
| Product Requisition Management | 6 | 0 | 0 | 6 |
| Transport Management | 12 | 3 | 0 | 15 |
| Vendor Management | 8 | 2 | 2 | 12 |
| Operations Management | 10 | 0 | 0 | 10 |
| Quality Control | 12 | 0 | 0 | 12 |
| Fleet & Vehicle Management | 2 | 3 | 1 | 6 |
| Fuel Management | 0 | 3 | 1 | 4 |
| Trip Costing & Finance | 2 | 2 | 0 | 4 |
| Reporting & Analytics | 0 | 0 | 6 | 6 |
| Mobile Applications | 3 | 1 | 0 | 4 |
| Notifications & Alerts | 0 | 0 | 4 | 4 |
| **Total** | **63** | **14** | **14** | **91** |

---

## 1. Master Data Management

### Overview
Foundation for all DFMS operations, managing vehicles, drivers, helpers, vendors, POIs, and products.

### Key Features

#### 1.1 Vehicle Master Data (Phase 1)
**User Story**: As a Transport Planner, I want to maintain vehicle master data so that fleet operations can be managed effectively.

**Key Requirements**:
- [Critical] System SHALL track vehicle attributes: registration, type, capacity, ownership, depot
- [Critical] System SHALL link vehicles with TO, Trip, Driver, Fuel, and maintenance records
- [High] System SHALL support vehicle status tracking (Available, Active, Idle, Under Maintenance)
- [High] System SHALL provide fleet health dashboard

**Business Rules**:
- Vehicles under maintenance cannot be assigned to trips
- One vehicle can only be assigned to one active trip at a time
- Vehicle status updates automatically based on trip events

---

#### 1.2 Driver Registration & Management (Phase 1)
**User Story**: As a Transport Planner, I want to register and manage driver profiles so that only verified drivers operate vehicles.

**Key Requirements**:
- [Critical] System SHALL capture driver profile: license, NID, type, experience, medical certificate
- [Critical] System SHALL track driver state: Assigned, Available, On Leave
- [Critical] System SHALL prevent assigning drivers to multiple active trips
- [High] System SHALL calculate effective driving hours using GPS data
- [High] System SHALL support manual attendance entry

**Business Rules**:
- Drivers on leave cannot be assigned to trips
- One driver can only be assigned to one active vehicle at a time
- Driving hours exclude idle/parked durations
- Maximum working hours configurable (default: 12 hours)

---

#### 1.3 Helper Profile (Phase 1)
**User Story**: As a TDO, I want to register and manage helper profiles so that helpers can be formally linked to drivers.

**Key Requirements**:
- [Critical] System SHALL capture helper information: name, NID, reference contacts
- [Critical] System SHALL allow many-to-one mapping (multiple helpers to one driver)
- [High] System SHALL store helper assignment history per trip
- [High] System SHALL prevent conflicting active trip assignments

---

#### 1.4 Vendor Master Data (Phase 1)
**User Story**: As a Transport Vendor, I want to register my company so that I can participate in transport operations.

**Key Requirements**:
- [Critical] System SHALL provide vendor self-registration interface
- [Critical] System SHALL require document uploads (trade license, BIN, TIN)
- [Critical] System SHALL support vendor types: Contractual, Non-Contractual
- [High] System SHALL allow vendors to manage multiple vehicles under one profile
- [High] System SHALL require admin approval before vendor activation

---

#### 1.5 POI Management (Phase 1)
**User Story**: As a System Admin, I want to configure POIs so that locations can be tracked and managed.

**Key Requirements**:
- [Critical] System SHALL capture POI attributes: name, GPS coordinates, geofence radius, type, capacity
- [Critical] System SHALL link POIs with routing and transport workflows
- [High] System SHALL support POI types: Depot, Feed Mill, Warehouse, Factory, Port, Silo
- [High] System SHALL track storage capacity (MT) per POI

---

#### 1.6 Product Inventory Management (Phase 1)
**User Story**: As a Distribution Officer, I want to manage product master data so that inventory can be tracked accurately.

**Key Requirements**:
- [Critical] System SHALL maintain product master: SKU, category, sub-category, UOM, weight
- [Critical] System SHALL support product types: Finished Goods (FG), Raw Material (RM)
- [Critical] System SHALL allow mapping transport-related attributes to products
- [High] System SHALL support product activation/deactivation
- [High] System SHALL maintain audit trail for product changes

---

## 2. Product Requisition Management (PRM)

### Overview
Handles two distinct transfer workflows: Finished Goods Transfer (Depot/Feed Mill) and Port Transfer (Commercial Team).

### Key Features

#### 2.1 Requisition Transfer Type Configuration (Phase 1)
**User Story**: As a Requisition Creator, I want to select the type of product transfer so that the system can apply the correct approval workflow.

**Key Requirements**:
- [Critical] System SHALL enforce mandatory selection of Transfer Type
- [Critical] System SHALL support types: Finished Goods Transfer, Port Consignment Transfer
- [Critical] System SHALL dynamically load transfer-type-specific forms
- [High] System SHALL restrict transfer types by user role

**Business Rules**:
- Transfer type determines approval hierarchy
- Transfer type logic does not retroactively affect completed records

---

#### 2.2 Finished Goods Transfer Requisition (Phase 1)
**User Story**: As a Depot/Feed Mill Officer, I want to raise a finished goods requisition so that stock can be transferred to another POI.

**Key Requirements**:
- [Critical] System SHALL allow only Depot and Feed Mill users to raise FG requisitions
- [Critical] System SHALL route FG requisitions to Distribution for approval
- [Critical] System SHALL capture: product details, quantity, UOM, destination POI, delivery date, urgency
- [Critical] System SHALL auto-populate product attributes from master data
- [High] System SHALL display capacity snapshot for requester POIs
- [High] System SHALL support multiple product line items per PR

**Business Rules**:
- PR cannot be submitted without transfer type and at least one product line item
- Requester POI is auto-filled from user profile
- Urgency levels: Normal, High, Critical

---

#### 2.3 Port (LC-Based) Transfer Requisition (Phase 1)
**User Story**: As a Commercial Officer, I want to raise a port transfer requisition so that inbound raw materials can be planned and transported.

**Key Requirements**:
- [Critical] System SHALL enforce LC and shipment metadata entry
- [Critical] System SHALL capture: BL number, LC number, vessel name, voyage name, container number, C&F agent, POL, ETA
- [Critical] System SHALL route port PRs to Procurement
- [Critical] System SHALL allow procurement to define POI-wise allocation
- [High] System SHALL support attachment of arrival notice
- [High] System SHALL allow remarks entry

**Business Rules**:
- Commercial Officers can only create Port Consignment PRs
- Port PRs always route to Procurement (not Distribution)

---

#### 2.4 Distribution Approval Process (Phase 1)
**User Story**: As a Distribution Officer, I want to create Transport Requests from approved FG PRs so that products are transferred to desired POIs.

**Key Requirements**:
- [Critical] System SHALL allow DO to view approved Product Requisitions
- [Critical] System SHALL allow DO to create one or more TRs from a single PR
- [Critical] System SHALL enforce mandatory fields: source POI, destination POI, transfer quantity, delivery date, vehicle count, vehicle type
- [Critical] System SHALL validate TR quantity does not exceed PR quantity
- [Critical] System SHALL display real-time capacity snapshots
- [Critical] System SHALL route submitted TRs to Distribution Manager for approval
- [High] System SHALL support partial quantity allocation
- [High] System SHALL display warnings when destination capacity is limited

**Business Rules**:
- Multiple TRs can be created from a single PR until full quantity is allocated
- Mandatory remarks required for overrides or deviations

---

#### 2.5 Procurement Approval Process (Phase 1)
**User Story**: As a Procurement Officer, I want to review port transfer requests and define destination-wise allocation so that inbound goods can be transported correctly.

**Key Requirements**:
- [Critical] System SHALL allow Procurement Officers to view approved Port Transfer requisitions
- [Critical] System SHALL display shipment reference details
- [Critical] System SHALL allow creation of destination breakdown plans
- [Critical] System SHALL allow mapping of Port (source) to multiple destination POIs
- [Critical] System SHALL generate TR only after destination breakdown plan submission
- [Critical] System SHALL route generated TR to Transport Department
- [High] System SHALL prevent TR generation if allocation is incomplete

---

#### 2.6 Stock Validation (Phase 1)
**User Story**: As a requester, I want visibility into stock impact so that requisitions are realistic.

**Key Requirements**:
- [Critical] System SHALL validate source stock availability before execution
- [Critical] System SHALL validate destination capacity before approval
- [High] System SHALL display: current stock, reserved stock, free capacity, projected utilization
- [High] Stock updates SHALL be event-driven (Scale-out for source, QC Pass for destination)
- [High] System SHALL display threshold warnings at configurable levels

**Business Rules**:
- Source stock reduces after Scale-out
- Destination stock adds only after QC Pass
- Destination stock rejected upon QC fail

---

## 3. Transport Management

### Overview
Core module managing Transport Requisitions (TR), Transport Orders (TO), fleet assignment, and trip lifecycle.

### Key Features

#### 3.1 Transport Requisition (TR) Assessment (Phase 1)
**User Story**: As a Transport Planner, I want to view and access all approved TRs so that I can plan transport execution.

**Key Requirements**:
- [Critical] System SHALL display all approved TRs to Transport Planner
- [Critical] System SHALL restrict visibility to approved TRs only
- [Critical] System SHALL enforce role-based access control
- [Critical] System SHALL display TR status: Draft, Pending Approval, Approved, Available for Planning, Assigned, Converted to TO, Closed
- [High] System SHALL allow filtering by: date, POI, urgency, transfer type
- [High] System SHALL display separate details for FG Transfer vs Port Consignment Transfer
- [High] System SHALL allow TP to input required vehicles, vehicle type, and C&F clearance note (for Port)

**Business Rules**:
- TRs visible only after approval from Distribution/Procurement
- TRs cannot be planned unless mandatory transport inputs are complete
- TRs originate only from approved product requisitions

---

#### 3.2 Transport Order (TO) Creation (Phase 1)
**User Story**: As a Transport Planner, I want to create one or multiple TOs against a single TR so that transport can be executed efficiently.

**Key Requirements**:
- [Critical] System SHALL allow creation of multiple TOs against a single TR
- [Critical] System SHALL support partial quantity allocation across TOs
- [Critical] System SHALL enforce that total TO quantity does not exceed TR quantity
- [Critical] System SHALL enforce selection of exactly one fleet type per TO (Own vs Vendor)
- [Critical] System SHALL display Own Fleet vs Vendor Fleet availability counts
- [High] System SHALL inherit and lock product attributes from TR as read-only
- [High] System SHALL auto-generate unique TO IDs
- [High] System SHALL prevent TO execution before TDO assignment

**Business Rules**:
- Each TO is tagged as Own Fleet OR Vendor Fleet (not both)
- All product-related attributes inherited from TR and read-only
- Sum of TO quantities must not exceed TR quantity
- TO creation requires valid TR reference

---

#### 3.3 TO Execution – Own Fleet (Phase 1)
**User Story**: As a TDO (Own Fleet), I want to assign available vehicles, drivers, and helpers to TOs so that trips can be executed using internal resources.

**Key Requirements**:
- [Critical] System SHALL display Own Fleet TO list to TDO (Own Fleet)
- [Critical] System SHALL restrict assignment to available vehicles only
- [Critical] System SHALL prevent assigning: absent drivers, drivers on active trips, vehicles under maintenance
- [High] System SHALL bind driver and helper to assigned vehicle
- [High] System SHALL allow TDO to define Estimated Time of Arrival (ETA)
- [High] System SHALL store assignment records with timestamp and user

**Business Rules**:
- Vehicles under maintenance or on active trip cannot be assigned
- One driver cannot be assigned to multiple active TOs
- Drivers on leave cannot be assigned

---

#### 3.4 TO Execution – Vendor Fleet (Phase 1)
**User Story**: As a TDO (Vendor Fleet), I want to assign TOs to vendors so that external resources can be utilized.

**Contractual Vendor Assignment**:
- [Critical] System SHALL allow assignment of TOs to contractual vendors
- [Critical] System SHALL hide price rates from contractual vendor view
- [Critical] Contractual rates applied automatically from backend

**Non-Contractual Vendor (Bidding)**:
- [Critical] System SHALL support bidding for non-contractual vendors
- [Critical] Vendor SHALL submit price and vehicle count
- [Critical] System SHALL record bid timestamp
- [High] System SHALL allow TDO to publish bidding requirements
- [High] System SHALL allow TDO to select winning vendor(s)
- [High] Bidding window is configurable
- [High] Bids cannot be edited after submission

**Business Rules**:
- Contractual vendors do not submit price bids
- Non-contractual vendors compete through bidding
- Vendor selection is final once approved

---

#### 3.5 TO Lifecycle Management (Phase 1)
**User Story**: As a Transport Planner, I want to track the full lifecycle of a trip so that I have end-to-end visibility.

**Key Requirements**:
- [Critical] System SHALL support full lifecycle states and sub-states
- [High] System SHALL log all lifecycle transitions
- [High] System SHALL allow TDO, TP, and operation staff to view states based on activity completion

**Lifecycle States**:
1. **Draft** → TO created by TP but not finalized
2. **Planned** → TO finalized, ready for assignment (Sub-states: Fleet Decided, Awaiting Assignment)
3. **Assigned** → Vehicle, Driver, Helper assigned (Sub-states: Vehicle Assigned, Driver Assigned, Helper Assigned, Assignment Confirmed)
4. **Dispatched** → Vehicle released (Sub-states: Dispatch Approved, Vehicle Departed)
5. **In Transit - Source** → Traveling to pickup (Sub-states: En Route to Source, Delayed, Halted)
6. **At Source** → Arrived at source (Sub-states: Gate-in Recorded, Scale-in, Waiting/Parked)
7. **Loaded** → Goods loaded (Sub-states: Loading Started, Loading Completed, Scale-out, Pick-up Confirmed/Gate-out)
8. **In Transit - Destination** → Moving to destination (Sub-states: En Route to Destination, Delayed, Halted)
9. **At Destination** → Arrived at destination (Sub-states: Gate-in, Scale-in, Waiting, Assigned to Unloading Point, Sampling Started, QC Started, Lab Analysis In Progress)
10. **Delivered/Unloaded** → Goods unloaded (Sub-states: Unloading Started, Unloading Completed, Scale-out, POD Submitted, Receiver Confirmation)
11. **Completed** → All operations complete (Sub-states: QC Passed, QC Failed)
12. **Closed** → Operationally closed (Sub-states: Closed - QC Pass + POD Uploaded, Gate-out recorded)

**Business Rules**:
- State transitions can only occur according to allowed workflow rules
- System logs all state transitions for audit purposes
- TO cannot be dispatched before assignment is confirmed

---

#### 3.6 Partial & Re-Delivery Management (Phase 2)
**User Story**: As a Transport Planner, I want to halt an ongoing TO in case of accidents and create a new TO for pending quantity.

**Key Requirements**:
- [Critical] System SHALL allow TP to halt active TO at any in-progress state
- [Critical] System SHALL require incident type selection and mandatory remarks
- [Critical] Halted TO SHALL transition to 'Halted – Incident' status
- [Critical] System SHALL allow creation of new TO linked to halted TO
- [Critical] System SHALL calculate delivered quantity using destination scale-in/scale-out weights
- [Critical] System SHALL display: Expected Quantity, Actual Delivered Quantity, Quantity Variance
- [High] System SHALL record halt action with: TO ID, User ID, Timestamp, Fleet Type, Remarks
- [High] System SHALL generate new TO for pending quantity

**Business Rules**:
- TP can halt TO at: In Transit – Source, At Source, In Transit – Destination
- Successfully delivered quantity updates destination inventory only after QC Pass
- Audit trail mandatory for all incident-based actions

---

#### 3.7 Trip Closure & Proof of Delivery (Phase 1)
**User Story**: As a Transport Planner, I want trips to close automatically once delivery and QC are completed.

**Key Requirements**:
- [Critical] System SHALL auto-close trip upon QC pass and POD confirmation
- [High] System SHALL capture gate-out timestamp
- [High] Unloading personnel confirms delivery with: number of bags, weight, unload end timestamp
- [High] Driver confirms delivery in app with POD attachment

**Business Rules**:
- Trip cannot close without POD
- QC fail blocks closure
- Gate-out time recorded after POD

---

#### 3.8 Transport Dashboard – Map-Based (Phase 1)
**User Story**: As a Transport Planner/TDO, I want a real-time map-based dashboard showing all active vehicles, TOs, and POIs.

**Key Requirements**:
- [Critical] System SHALL display interactive map as default dashboard
- [Critical] System SHALL restrict dashboard access based on RBAC
- [Critical] System SHALL display all active own fleet vehicles on map
- [Critical] System SHALL update vehicle locations in near real-time (GPS refresh intervals)
- [Critical] Each vehicle marker SHALL visually represent: Fleet Type, Vehicle State, Linked TO State, Source POI, Destination POI, TO reference
- [Critical] Clicking vehicle marker SHALL open context side panel
- [High] System SHALL display all registered POIs on map
- [High] POI markers SHALL display: POI Name, POI Type, Current vehicle count inside geofence, Operational activity status
- [High] System SHALL support TO-centric map view
- [High] System SHALL visualize: Source-to-Destination route, Current vehicle position along route
- [High] System SHALL display KPI widgets: Active TOs, Vehicle in Transit, Idle Vehicles, Halted TOs

**Business Rules**:
- Vehicle markers update based on configured GPS refresh intervals
- System shows last known GPS position if live tracking unavailable
- Vehicle markers only displayed for vehicles with valid GPS association

---

#### 3.9 TO Dispatch Planning – Calendar View (Phase 2)
**User Story**: As a Transport Planner, I want a visual dispatch view so that I can plan trips by date, fleet type, and urgency.

**Key Requirements**:
- [Critical] System SHALL provide calendar-based view of all TOs
- [High] System SHALL segregate TOs visually based on Fleet type (Own/Vendor)
- [High] Calendar supports daily, weekly, monthly views
- [High] Each TO displayed as calendar block showing: TO ID, TR Reference, Transfer Type, Fleet Type, Vehicle Number, Driver Name, Source/Destination POI, Urgency, Planned Date
- [High] System SHALL provide vehicle-wise calendar view
- [High] Calendar highlights idle gaps between TOs

**Business Rules**:
- Calendar loads only approved TOs
- TO blocks are read-only in calendar view
- Unassigned TOs clearly flagged

---

#### 3.10 TR Conjoinment (Phase 2)
**User Story**: As a TDO, I want to assign a single vehicle to multiple TOs when route and capacity permit.

**Key Requirements**:
- [Medium] System SHALL allow assignment of multiple TOs to one vehicle
- [Medium] System SHALL enforce only one TO per vehicle in "In Transit" status
- [Medium] Vehicle must complete TO-1 before TO-2 execution starts
- [Medium] Each TO retains own status lifecycle, POD, QC outcome

**Business Rules**:
- Only one TO per vehicle can be 'In Transit' at any time
- Each TO tracked independently even when sharing vehicle
- System shows ordered sequence of TOs per vehicle

---

## 4. Vendor Management

### Overview
Comprehensive vendor lifecycle management including onboarding, bidding, performance tracking, and billing.

### Key Features

#### 4.1 Vendor Onboarding & Registration (Phase 1)
**User Story**: As a transport vendor, I want to register my company so that I can participate in transport operations.

**Key Requirements**:
- [Critical] System SHALL provide vendor self-registration interface (web/mobile)
- [Critical] System SHALL require document uploads (trade license, BIN, TIN)
- [Critical] System SHALL capture: company details, vendor type (Contractual/Non-Contractual), contact information, testimonial/reference
- [High] System SHALL allow vendors to manage multiple vehicles under one profile
- [High] Vendor profile saved in Pending Verification status
- [High] All vendor registration attempts logged for audit

**Business Rules**:
- Vendors cannot access bidding or TO details before approval
- Vendor registration data is tenant-specific and isolated

---

#### 4.2 Vendor Verification Workflow (Phase 1)
**User Story**: As a Tenant Admin, I want to review vendor registrations so that only compliant vendors can participate.

**Key Requirements**:
- [Critical] System SHALL provide Admin verification queue for vendor profiles
- [Critical] System SHALL enforce mandatory rejection remarks
- [High] Admin can Approve or Reject vendor registration
- [High] Rejected profiles require remarks and allow resubmission
- [High] Vendor approval status updated in real-time

**Business Rules**:
- Approval mandatory before vendor participation
- Rejected vendors must resubmit updated information
- Approved vendors become active and eligible for bidding

---

#### 4.3 Vendor Bidding Portal (Phase 1)
**User Story**: As a vendor, I want to view available transport bids and submit competitive rates so that I can win trips.

**Key Requirements**:
- [Critical] System SHALL support configurable bid submission windows
- [Critical] System SHALL allow eligible vendors to view bidding list when bids are published
- [Critical] TDO publishes bids with: Route, Tonnage, urgency, required vehicle type, bid submission window, required quantity of vehicles
- [High] Vendor can view: Active bids, Active trips, Completed trips
- [High] Vendor submits structured bids with rate and vehicle availability
- [High] System records bid timestamp and rate validity
- [High] System SHALL prevent bid submission after window closure

**Business Rules**:
- Bids may be manually closed or cancelled without awarding
- System records bid timestamp

---

#### 4.4 Bid Evaluation (Phase 1)
**User Story**: As a TDO, I want to evaluate vendor bids and approve selected vendors.

**Key Requirements**:
- [Critical] System SHALL support winner selection against a single TO
- [High] TDO can compare bids side-by-side: rate, vehicle availability, vehicle type, bid validity
- [High] System SHALL track bid winning log with user and timestamp

---

#### 4.5 Vehicle & Driver Information Submission (Phase 1)
**User Story**: As a Vendor, I want to submit vehicle and driver details so that trips can be executed.

**Key Requirements**:
- [Critical] System SHALL require vehicle & driver submission after bid winning and before starting trip
- [Critical] Vendor submits: Vehicle number, Capacity, Driver name and contact, Driver NID/License, Helper Details with NID
- [Critical] System SHALL allow update with reasoning of driver and vehicle information with audit trails
- [High] Vendor can update vehicle and driver details with audit trail
- [High] Vendor substitution requires Transport Department visibility

**Business Rules**:
- Vendor can edit vehicle and driver information in case of accidents or uncertain conditions

---

#### 4.6 Real-time TO Updates (Phase 1)
**User Story**: As a Vendor, I want real-time updates on my transport orders so that I can manage execution effectively.

**Key Requirements**:
- [Critical] System SHALL provide real-time TO updates to vendor portal
- [Critical] Vendor SHALL not modify TO status directly
- [High] Vendor portal shows TO status changes: Assigned, Completed, Closed

---

#### 4.7 Vendor Billing & Claims Management (Phase 2)
**User Story**: As a Vendor, I want to submit invoices and claims so that I can receive payments efficiently.

**Key Requirements**:
- [Critical] System SHALL allow consolidated invoice submission
- [Critical] System SHALL link invoices to corresponding TOs
- [High] Vendor can submit bill claims for completed TOs into one invoice
- [High] Vendor uploads against each TO: Invoice, POD, GRN
- [High] Additional expense claims supported
- [High] Missing POD/GRN blocks invoice submission

**Business Rules**:
- Only completed trips are billable
- Vendor cost may originate from: Contractual rate (pre-configured), Approved Bid Rate

---

#### 4.8 Vendor Trip Cost & Billing (Phase 2)
**User Story**: As an Accounts Officer, I want vendor trip cost finalized per trip so that invoices can be generated accurately.

**Key Requirements**:
- [Critical] System SHALL allow consolidated invoice submission
- [Critical] System SHALL link invoices to corresponding TO
- [High] Vendor cost linked to: TO ID, Trip ID, Vendor ID
- [High] Vendor cost locked after Bid approval
- [High] System supports one invoice per TO
- [High] Supporting documents (POD, GRN) mandatory before invoicing submission

---

#### 4.9 Bid Position & Probability Indicator (Phase 3)
**User Story**: As a Vendor, I want to understand my bid position so that I can assess competitiveness.

**Key Requirements**:
- [Critical] System SHALL calculate bid position based on internal scoring logic
- [Critical] System SHALL display bid probability using color indicators only
- [High] After bid submission, vendor views color-coded indicator: Green (Highly Competitive), Yellow (Moderate), Red (Low Probability)

**Business Rules**:
- Indicator reflects relative position, not exact competitor rates
- Exact competitor pricing must not be disclosed

---

#### 4.10 Vendor Rating System (Phase 2)
**User Story**: As a Tenant Admin, I want to rate vendors so that future allocation decisions improve.

**Key Requirements**:
- [Low] System SHALL allow configurable vendor rating framework
- [Low] Vendor ratings calculated based on performance metrics (TBD)
- [Low] Ratings visible internally for decision-making

---

## 5. Operations Management

### Overview
Field operations including gate management, weighing, command center coordination, and loading/unloading.

### Key Features

#### 5.1 Gate-In Entry (Phase 1)
**User Story**: As a Gate man, I want to register vehicle gate-in details so that all incoming vehicles are formally logged.

**Key Requirements**:
- [Critical] System SHALL allow gate man to input gate-in date and time against vehicle number
- [Critical] System SHALL capture document category: Supplier (PO), Internal Transfer (TO, Challan), Distributor (PO/DO), Dealer (DO)
- [High] System SHALL record: Challan number, Product details, Quantity, Driver info, Party name, Project reference, Remarks
- [High] System SHALL route gate-in record to correct operational flow: Supplier/Port → Inbound QC, Dealer → Outbound FG, Internal Transfer → TO-Linked
- [High] All entries timestamp and auditable

**Business Rules**:
- Gate-in cannot be saved without vehicle number
- For empty vehicles, quantity kept null

---

#### 5.2 On-Demand TO Creation at Gate (Phase 1)

**For Dealer (DO Copy)**:
**User Story**: As a Gate man, I want to create an on-demand TO when a dealer vehicle arrives with DO copy.

**Key Requirements**:
- [Critical] System SHALL allow gate-man to generate on-demand FG TO against Dealer DO
- [Critical] System SHALL auto-generate unique TO ID and link to gate-in record
- [Critical] System SHALL classify TO as 'Dealer Outbound – Finished Goods'
- [High] Gate man enters: DO Number, Dealer Name, FG product, Planned Quantity, Driver info, Remarks
- [High] System SHALL allow FG quantity validation against available inventory

**For Supplier (PO Copy)**:
**User Story**: As a Gate man, I want to create an on-demand TO when a supplier vehicle arrives with PO copy.

**Key Requirements**:
- [Critical] System SHALL allow gate-man to generate on-demand RM TO against Supplier PO
- [Critical] System SHALL classify TO as 'Supplier Inbound – Raw Material'
- [Critical] System SHALL link TO to QC and scaling workflows automatically
- [High] Gate man enters: PO Number, Supplier Name, RM product, Expected Quantity, Driver info, Remarks

**Business Rules**:
- Generated TO becomes immediately available for Scaling, Loading, Gate-out
- Inventory deduction occurs after loading & Scale-out (for FG)
- Inventory updated only after QC Pass (for RM)

---

#### 5.3 Gate-Out Entry (Phase 1)
**User Story**: As a Gate man, I want to record gate-out after clearance so that vehicle exit is formally completed.

**Key Requirements**:
- [Critical] System SHALL allow gate-out date and time entry after receiving gate clearance copy from Scaling
- [High] Gate-out time stored against vehicle
- [High] Linked to QC and scaling completion

**Business Rules**:
- Gate-out cannot occur before scale-out
- Gate-out blocked if QC status pending (for unloading flows)

---

#### 5.4 Discrepancy & Remarks Logging (Phase 1)
**User Story**: As a Gate man, I want to log discrepancies so that exceptions are traceable.

**Key Requirements**:
- [Low] System SHALL allow logging remarks by gate-man if needed

---

#### 5.5 Scale-In (Weight Entry) (Phase 1)
**User Story**: As a Scaling Operator, I want to record vehicle weight so that accurate load calculations can be made.

**Key Requirements**:
- [Critical] System SHALL allow manual weight entry of scale-in readings
- [Critical] System SHALL store: Vehicle number, Weight ID, Material name and Code, Challan Number, Scale-in Date & Time, Gross Weight
- [High] System SHALL store operator ID and Timestamp
- [High] System SHALL notify Command Center upon scale-in completion
- [High] System SHALL allow logging discrepancies (wrong quantity, driver mismatch)

**Business Rules**:
- Scale-in must occur after gate-in
- Weight entries immutable after scale-out

---

#### 5.6 Queue Token Generation (Phase 1)
**User Story**: As a Scaling Operator, I want to issue queue token so that vehicle flow can be managed efficiently.

**Key Requirements**:
- [High] System SHALL generate unique waiting queue token (P.C. Code) after scale-in
- [High] System SHALL support printing token using desk printer

---

#### 5.7 Scale-Out (Weight Exit) (Phase 1)
**User Story**: As a Scaling Operator, I want to record scale-out weight to calculate net load.

**Key Requirements**:
- [Critical] System SHALL record scale-out weight
- [Critical] System SHALL generate gate pass token with Delivery Note (printable format with: Vehicle Number, Item Name, P.C Code)
- [Critical] System SHALL auto-calculate net weight
- [High] System SHALL allow logging discrepancies

---

#### 5.8 Command Center – Queue Monitoring (Phase 1)
**User Story**: As a Command Center Officer, I want to view all vehicles that have completed scale-in so that I can efficiently assign them to loading points.

**Key Requirements**:
- [Critical] System SHALL display centralized queue showing all vehicles that completed Scale-in and awaiting loading assignment
- [High] Each queue entry SHALL display: Vehicle Number, PC Code, Item, Scale-in Date & Time, Product Type, Weight, TO/Challan reference, Urgency Level
- [High] Queue SHALL refresh automatically without manual reload

**Business Rules**:
- Only vehicles with completed Scale-In eligible to appear in Command Center queue
- Vehicles already assigned to loading point must not appear in waiting queue

---

#### 5.9 Loading/Unloading Assignments (Phase 1)
**User Story**: As a Command Center Officer, I want to assign vehicles to specific loading or unloading lines based on operational priority.

**Key Requirements**:
- [Critical] System SHALL allow command center officials to assign vehicle to specific loading or unloading point
- [High] Assignment decision SHALL consider: Product Type, Vehicle Type, Urgency Level
- [High] System SHALL update vehicle status immediately after assignment

---

#### 5.10 Assignment Alert (Phase 1)
**User Story**: As a Loading/Unloading Personnel, I want to get notified when a vehicle is assigned so that preparation can begin immediately.

**Key Requirements**:
- [High] System SHALL send notification to loading or unloading teams after assignment
- [High] Notification SHALL include: Vehicle Number, Assigned Loading/Unloading Point, Product Type, Vehicle Capacity, Urgency Level

---

#### 5.11 Assign Waiting Serial (Phase 1)
**User Story**: As a Command Center Officer, I want to assign vehicles to each loading point and give serial so that vehicles are processed in controlled order.

**Key Requirements**:
- [High] System SHALL assign unique waiting serial for each Scale-In completed vehicle for each loading point
- [High] Serial SHALL be linked to vehicle and its assigned loading workflow

**Business Rules**:
- One active serial per vehicle per loading point
- Serials cannot be edited
- Serial assignment time and issuer audit-logged

---

#### 5.12 Loading Monitoring (Phase 1)
**User Story**: As a Loading personnel, I want to record loading start and end times so that loading duration can be tracked.

**Key Requirements**:
- [High] System SHALL allow authorized loading operators to enter Load Start Date & Time against vehicle number
- [High] System SHALL allow operators to enter Load End Date & Time with: Number of bags loaded, Seal number, Weight
- [High] System SHALL validate that Load End Date & Time cannot be earlier than Load Start Time
- [High] Loading timestamp SHALL be linked to associated TO/Trip record

---

#### 5.13 Loading Notifications (Phase 3)
**User Story**: As a Transport Department user, I want to be notified when loading is completed so that downstream trip execution can proceed.

**Key Requirements**:
- [High] System SHALL automatically notify Transport Department when Load End Date & Time is recorded

**Business Rules**:
- Notification sent immediately after loading completion
- Notification references correct vehicle and TO
- Notification triggered only after Load End is saved

---

#### 5.14 Unload Monitoring (Phase 1)
**User Story**: As an Unloading personnel, I want to record unloading start and end times so that unloading duration can be tracked.

**Key Requirements**:
- [High] System SHALL allow authorized unloading operators to enter Unload Start Date & Time against vehicle number
- [High] System SHALL allow operators to enter Unload End Date & Time with: Number of Bags unloaded, Weight
- [High] System SHALL validate chronological correctness of unloading timestamps

---

#### 5.15 QC Trigger on Unloading (Phase 3)
**User Story**: As a QC Supervisor, I want to be notified before unloading begins so that QC sampling can be prepared.

**Key Requirements**:
- [High] System SHALL notify QC department when vehicle is assigned for unloading
- [High] Notification SHALL include: Vehicle number, POI (Source/Destination), Product Type, TO/Challan reference
- [High] System SHALL validate chronological correctness of unloading timestamps

---

## 6. Quality Control

### Overview
Comprehensive quality assurance workflow including physical inspection, sampling, lab testing, and QC pass/fail determination.

### Key Features

#### 6.1 Pre-QC Context Display (Phase 1)
**User Story**: As a QC Supervisor, I want to view complete contextual information before inspection so that I can perform accurate quality checks.

**Key Requirements**:
- [High] System SHALL display QC Context: POI From/To, Supplier/Dealer, Challan No., Date & Time, Item Name, Quantity
- [High] QC Context SHALL be fetched from TO/Challan reference

**Business Rules**:
- QC Context must be displayed before any sample creation
- QC actions blocked if mandatory context data missing

---

#### 6.2 Sample Creation (Phase 1)
**User Story**: As a QC Supervisor, I want to create samples with proper timestamps so that physical inspection is auditable.

**Key Requirements**:
- [High] System SHALL allow QC Inspection to create samples against Unload Item Code
- [High] System SHALL capture sampling start and end timestamp manually
- [High] QC Supervisor can add: Physical Analysis (text), Nutritional Analysis (text), Final Result (QC Pass/Fail/Auto-Pass)
- [High] Inspector remarks SHALL be mandatory for sample creation

**Business Rules**:
- Sampling must occur after QC Sampling event creation
- Sampling timestamp must be sequential
- QC Supervisor can initiate Sample Send Time by inputting Sampling End Date & Time

---

#### 6.3 Sample Labeling (QR Code) (Phase 1)
**User Story**: As a QC Supervisor, I want each sample to be uniquely labeled so that lab tracking remains accurate.

**Key Requirements**:
- [High] System SHALL generate unique QR code for each sample
- [High] QR code SHALL be tied to unload item Code

**Business Rules**:
- One QR code per sample

---

#### 6.4 Exception Recording (Media Capture) (Phase 1)
**User Story**: As a QC Supervisor, I want to capture photos of defects so that evidence is preserved.

**Key Requirements**:
- [High] System SHALL allow photo upload for QC inspection
- [High] Timestamp stored

---

#### 6.5 QC Context Display (Phase 1)
**User Story**: As a QC Inspector, I want to see supplier, PO/TO, and RM item code to ensure correct checklist usage.

**Key Requirements**:
- [High] System SHALL display Supplier, PO, RM item code, and expected QC checklist

**Business Rules**:
- Checklist displayed depends on Product category

---

#### 6.6 Sampling – Sample Collection Event (Phase 1)
**User Story**: As a QC Supervisor, I want to collect samples from multiple sides and record comments to ensure quality consistency.

**Key Requirements**:
- [High] System SHALL allow recording of sampling
- [High] Sampling sides recorded (Top/Middle/Bottom)
- [High] System will calculate average of multiple samples moisture content input for each sample under specific vehicle

---

#### 6.7 Configurable Checklist & Sampling Form (Phase 1)
**User Story**: As a QC Supervisor/QA Lab Technician, I want checklist to adapt based on product categories.

**Key Requirements**:
- [High] System SHALL dynamically adapt QC checklist based on product type (RM)

**Business Rules**:
- Checklist adapts per product type
- Checklist configuration maintained in master data

---

#### 6.8 QR Code Label (Phase 1)
**User Story**: As a QC Supervisor, I want system to generate QR Code for each sample.

**Key Requirements**:
- [High] System SHALL generate QR Code for each sample with unique data values
- [High] System SHALL generate separate QR for each sample under a vehicle

---

#### 6.9 Sampling Timestamp (Phase 1)
**User Story**: As a QC Supervisor, I want to record sampling start and end times for traceability.

**Key Requirements**:
- [High] System SHALL capture sampling start and end timestamp manually

**Business Rules**:
- Sampling end cannot precede sampling start

---

#### 6.10 Lab Test Request Creation (Phase 1)
**User Story**: As a QC Inspector, I want to route lab test request to lab personnel so that samples are tested systematically.

**Key Requirements**:
- [High] System SHALL allow QC Supervisors to create lab test requests against vehicle per sample
- [High] System tracks Sample Send for Test Date and Time
- [High] QA Lab Technician scans QR to track Lab test start time
- [High] Lab personnel can input: lab test name, results as report (PNG/PDF), Test completion time
- [High] System tracks lab test expected completion time for each test
- [High] Lab personnel scanning QR SHALL automatically trigger lab test start time

**Business Rules**:
- QC supervisor creates lab test request from same vehicle per sample
- QR scan triggers test start
- QR scan time is authoritative lab start time

---

#### 6.11 Lab Estimated Completion (Phase 1)
**User Story**: As a QA Lab Technician, I want to enter estimated time so stakeholders can plan.

**Key Requirements**:
- [High] System SHALL allow lab to enter estimated completion time against each test under particular sample

---

#### 6.12 Lab Report Upload (Phase 1)
**User Story**: As a Lab personnel, I want to upload test reports result.

**Key Requirements**:
- [High] System SHALL allow lab personnel to submit result of lab test report

---

#### 6.13 Lab Status Monitoring (Phase 1)
**User Story**: As a QC Inspector, I want to track lab progress.

**Key Requirements**:
- [High] System SHALL track lab status as To-Do, Work in Progress, or Completed

**Business Rules**:
- Status visible (To-Do, WIP, Completed)

---

#### 6.14 QC Pass/Fail/Auto-Pass Tracking (Phase 1)
**User Story**: As a QC Inspector, I want to record QC outcomes so that downstream processes can proceed.

**Key Requirements**:
- [High] System SHALL allow QC status enter: Pass, Fail, Auto-pass
- [High] System SHALL allow reinitiate sampling if QC failed and Passed
- [High] QC Inspector can assign vehicle to Unloading Bay/Unit/Point

**Business Rules**:
- QC status selectable
- Remarks can be added
- Auto-pass allowed

---

#### 6.15 Escalation Workflow (Recheck) (Phase 1)
**User Story**: As a QC Inspector, I want rejected or passed QC samples recheck for decision.

**Key Requirements**:
- [High] System SHALL allow QC inspector to reinitiate sampling and add remarks in mandatory

**Business Rules**:
- Recheck or resampling workflow triggered
- Reasons or remarks mandatory

---

## 7. Fleet & Vehicle Management

### Overview
Fleet health monitoring, utilization analytics, downtime management, and workshop operations.

### Key Features

#### 7.1 Fleet Health Dashboard (Phase 1)
**User Story**: As a Transport Planner, I want to view real-time vehicle status for each vehicle so that I can plan assignments efficiently.

**Key Requirements**:
- [Critical] System SHALL provide fleet Health Dashboard
- [Critical] System SHALL track per vehicle: Kilometers, Fuel intake, Maintenance history, Operational lifecycle
- [Critical] System SHALL link vehicle entity with TO, Trip, Driver, Fuel, and maintenance records
- [High] Dashboard SHALL display: Available, Active (On the Way - Laden/Empty), Active (Waiting to Load/Unload), Idle, Scheduled/Parked, Under Maintenance
- [High] Status can be filtered by depot, ownership, vehicle type

**Business Rules**:
- Vehicle under maintenance unavailable for assignment
- Vehicle in maintenance cannot be assigned

---

#### 7.2 Vehicle Utilization Analytics (Phase 2)
**User Story**: As a Transport Planner, I want to analyze vehicle utilization so that under/over-utilized assets can be optimized.

**Key Requirements**:
- [High] System SHALL calculate: Trips per vehicle, Active vs idle time

**Business Rules**:
- Utilization metrics visible per vehicle

---

#### 7.3 Vehicle Downtime Management (Phase 2)
**User Story**: As a Driver supervisor, I want to track vehicle downtime so that availability and planning accuracy improves.

**Key Requirements**:
- [High] System SHALL log downtime with: Reason, Start & End date time
- [High] Downtime SHALL reduce availability metrics

**Business Rules**:
- Downtime reasons logged
- Change status of vehicle to 'Under Maintenance'
- Availability adjusted automatically

---

#### 7.4 Manual Workshop Entry (Phase 3)
**User Story**: As a Vehicle supervisor, I want to manually record workshop activities, maintenance costs, issues, and repair time for vehicles.

**Key Requirements**:
- [Critical] System SHALL allow manual creation of workshop maintenance jobs against vehicles
- [Critical] Vehicle Supervisor can create Workshop Job Entry with: Vehicle ID, Workshop Type (Internal/External), Workshop Location/Name, Maintenance Category (Preventive/Breakdown/Accident/Inspection), Problem Description, Date & Time In, Estimated Repair Duration, Estimated Cost, Actual Cost, Receipt
- [Critical] System allows entry of: Actual Repair Start/End Date & Time
- [Critical] System automatically calculates: Actual Repair Duration, Delays vs Estimated Time
- [High] Vehicles marked under active workshop jobs SHALL be excluded from: TR Assignment, TO Creation, Trip Planning
- [High] Vehicle Downtime SHALL be calculated from workshop entry timestamps
- [High] Workshop Job can be marked Completed only if: Actual End time entered, Cost Summary saved

**Business Rules**:
- Vehicle Status changes automatically: Maintenance – In Progress, Maintenance – Completed
- On Completion: Vehicle status changes back to Available/Idle, Maintenance history updated
- Each vehicle maintains Maintenance timeline: Date, Type of Maintenance, Cost, Downtime
- All entries audit-logged

---

## 8. Fuel Management

### Overview
Fuel consumption tracking, fuel entry system, and performance monitoring.

### Key Features

#### 8.1 Fuel Consumption Tracking (Phase 2)
**User Story**: As a Driver supervisor, I want to track fuel consumption so that fuel efficiency and cost can be analyzed.

**Key Requirements**:
- [High] System SHALL track: Mileage, Fuel intake
- [High] System SHALL calculate fuel consumption per kilometer

**Business Rules**:
- Mileage and fuel captured
- Consumption calculated per KM
- Fuel calculations rely on last recorded mileage

---

#### 8.2 Fuel Entry System (Phase 2)
**User Story**: As a Driver, I want to record refueling events so that fuel tracking remains accurate.

**Key Requirements**:
- [High] System SHALL allow fuel entry with: Fuel quantity, Mileage reading, Receipt image
- [High] Workshop Supervisor SHALL be able to record refueling on behalf of drivers

**Business Rules**:
- Fuel entries captured
- Receipt and mileage photo supported

---

#### 8.3 Fuel Performance Monitoring (Phase 3)
**User Story**: As a Transport Planner/TDO/Driver Supervisor, I want to monitor vehicle fuel performance so that inefficient vehicles can be identified early.

**Key Requirements**:
- [High] System SHALL calculate mileage using GPS distance and fuel entry data
- [High] System SHALL compute fuel efficiency trends per vehicle
- [High] System calculates: Fuel consumption per km, Fuel cost per trip

**Business Rules**:
- Performance viewable per vehicle

---

## 9. Trip Costing & Finance

### Overview
Trip-level cost tracking, vendor billing, and financial integration.

### Key Features

#### 9.1 Trip Costing (Phase 1)
**User Story**: As an Accounts/Financial Officer/Transport Planner, I want to record and review trip-level costs for completed TOs.

**Key Requirements**:
- [Critical] System SHALL generate Trip Cost record once Trip is created
- [Critical] System SHALL allow manual entry of: Fuel cost, Vendor Trip Charge (if Vendor Fleet), Maintenance Allocation, Toll/Ferry/Parking, Other Operational Changes
- [Critical] System SHALL calculate: Total Trip Cost, Cost per KM
- [High] System SHALL differentiate Own Fleet vs Vendor Fleet costing

**Business Rules**:
- Each completed trip has Trip Cost Sheet
- System supports TO-level cost capture linked to: TO ID, Vehicle Type, Vehicle Number, Driver
- Cost types: Distance-based cost, Vendor Trip Charge, Maintenance Allocation, Fuel Cost, Toll/Ferry/Parking, Other Operational Changes
- Manual cost entry allowed only for authorized roles
- Cost history audit-logged
- Trip cost summary available after TO closure

---

#### 9.2 Vendor Trip Cost & Billing (Phase 2)
**User Story**: As an Accounts Officer, I want vendor trip to be finalized per trip so that invoices can be generated accurately.

**Key Requirements**:
- [Critical] System SHALL allow consolidated invoice submission
- [Critical] System SHALL link invoices to corresponding TO

**Business Rules**:
- Vendor cost linked to: TO ID, Trip ID, Vendor ID
- Vendor cost may originate from: Contractual rate (pre-configured, hidden from vendor), Approved Bid Rate
- Vendor Cost locked after Bid approval
- System supports one invoice per TO
- Supporting documents (POD, GRN) mandatory before invoicing submission

---

## 10. Reporting & Analytics

### Overview
Comprehensive reporting across transport, fleet, vendor, costing, and system usage.

### Key Features

#### 10.1 Transport & Trip Reports (Phase 3)
**User Story**: As a Transport/Distribution/Management user, I want visibility into daily transport operations.

**Key Requirements**:
- [High] System SHALL generate Trip Summary report with full trip lifecycle visibility
- [High] System SHALL calculate and display Trip Turnaround Time using gate, scaling, loading timestamps
- [High] System SHALL identify delayed trips based on configured SLA or planned timelines
- [High] System SHALL allow filtering by: Date, Depot/POI, Vehicle, Driver, Trip Status

**Reports**:
- Trip Summary: Trip ID, Status, Route, Vehicle, Driver, Product Type
- Trip Delay: Trips exceeding expected timelines
- Trip Turnaround: Gate-in, Scale-in, Load/Unload, Scale-out, Gate-out

**Business Rules**:
- Reports filterable by date range, POI, vehicle, route, trip status
- Turnaround time calculation uses actual event timestamps only
- Users view reports based on RBAC permissions

---

#### 10.2 Vendor Reports (Phase 3)
**User Story**: As a Transport user, I want vendor-specific performance and billing reports.

**Key Requirements**:
- [High] System SHALL generate Vendor Trip Performance reports
- [High] System SHALL track vendor bid participation and bid success ratio
- [High] System SHALL provide Vendor Dispute report

**Reports**:
- Vendor Trip Performance: Trips completed, On-time delivery percentage
- Vendor Bids Participation: Bids submitted, Bids won

**Business Rules**:
- Vendor performance metrics derive only from completed trips

---

#### 10.3 Fleet & Vehicle Performance Reports (Phase 3)
**User Story**: As a Transport user, I want visibility into fleet utilization and vehicle health.

**Key Requirements**:
- [High] System SHALL generate Fleet Utilization reports by vehicle status
- [High] System SHALL calculate trips per vehicle within selected period

**Reports**:
- Fleet Utilization: Active vehicles, Idle Vehicles, Vehicles under Maintenance
- Report displays trips per vehicle
- Vehicle health indicators visible where available

---

#### 10.4 Costing & Finance Reports (Phase 3)
**User Story**: As a Finance Officer, I want consolidated cost and payment reports.

**Key Requirements**:
- [High] System SHALL generate Trip Costing reports combining all cost components
- [High] System SHALL calculate Vendor Invoice Summary reports

**Reports**:
- Trip Costing: Fuel Cost, Maintenance Cost, Vendor Transport Cost
- Vendor Invoice Summary: Submitted invoices, Approved Invoices

---

#### 10.5 System Usage & Audit Reports (Phase 3)
**User Story**: As an Admin, I want system activity and audit reports for compliance.

**Key Requirements**:
- [High] System SHALL maintain immutable audit logs for: User actions, TR/TO modifications
- [High] System SHALL allow filtering audit logs by: User, Module, Date Range

**Business Rules**:
- Audit log captures: User activities, TR/TO edits
- Audit records include timestamp and user reference
- Audit records cannot be deleted or edited

---

## 11. Mobile Applications

### Overview
Mobile interfaces for drivers, QC supervisors, and vendors.

### Key Features

#### 11.1 Driver Mobile Interface (Phase 1)
**User Story**: As a driver, I want to view my assigned trips and navigate routes so that I can execute deliveries accurately.

**Key Requirements**:
- [High] System SHALL display assigned trips to logged-in driver
- [High] Trips Details SHALL include: TO ID, Pickup POI, Drop POI, Product type, Quantity, Urgency

**Features**:
- View assigned Trip and TO details
- Update or initiate Trip start state
- Trip status visible (Assigned, In-Transit, Delivered)
- Drivers can only view trips assigned to them

---

#### 11.2 QC Supervisor Mobile Interface (Phase 1)
**User Story**: As a QC Supervisor/Lab personnel, I want to conduct inspection and track time so that QC activities remain efficient.

**Key Requirements**:
- [High] System SHALL provide responsive mobile QC interface accessible via web
- [High] QC supervisors SHALL be able to perform inspections, sampling, and lab request creation

**Features**:
- QC Inspection forms accessible on mobile
- Time tracking supported per QC activity

---

#### 11.3 Vendor Mobile Application (Phase 1)
**User Story**: As a vendor, I want to view TO list for bidding so that I can participate in transport operations.

**Key Requirements**:
- [High] Vendor SHALL be able to view active bids, assigned trips, and completed trips
- [High] Vendor SHALL be able to add driver, helper, and vehicle details after winning bids

**Features (Phase 1)**:
- Vendor Portal Access (Bidding & Trip Management)
- View available bids
- Track active and completed trips

**Features (Phase 2)**:
- Invoice Management & Claims Submission
- Submit invoices against trip ID
- Upload supporting documents (POD, GRN, invoice)

---

## 12. Notifications & Alerts

### Overview
System-wide notification and alert framework for operational events.

### Key Features

#### 12.1 Basic System Alerts (Phase 3)
**User Story**: As an operation user, I want to receive system alerts for key transport and logistics events.

**Key Requirements**:
- [High] System SHALL generate alerts for TO lifecycle events

**Events**:
- TO Creation and assignment
- Vendor Bidding published/closed
- Vehicle Assigned/Changed
- Gate-in/Gate-out completion
- Loading Started/Completed
- Unloading Started
- QC Triggered/QC Passed/QC Failed
- Delivery completed/POD received

**Business Rules**:
- Each alert includes: Event Type, Reference ID (TR/TO/Trip/Vehicle), Timestamp, Action status

---

#### 12.2 Stakeholder Notification (Phase 3)
**User Story**: As a System Admin, I want notifications to be role-specific so that users receive only relevant alerts.

**Key Requirements**:
- [High] System SHALL route alerts based on roles

**Roles**:
- Transport Planner, TDO, Distribution Officer, Distribution Manager, Procurement Officer, Gate Man, Scaling Personnel, Command Center Officer, QC Supervisor, QA Lab Technician, Vendor, Driver

**Business Rules**:
- Alerts mapped to user roles
- Same event may notify multiple roles with different context

---

#### 12.3 TO Update Alerts (Phase 3)
**User Story**: As a Transport Planner, I want alerts for TO status changes so that I can manage exceptions proactively.

**Key Requirements**:
- [High] System SHALL generate alerts for all TO lifecycle events

**Events**:
- TO Created
- TO Assigned to Own Fleet/Vendor Fleet
- Vehicle Assigned
- Gate-in Completed
- Delivery Completed
- TO Halted (Incidents)
- TO Closed

---

## Cross-Cutting Requirements

### Security & Access Control
- [Critical] Role-Based Access Control (RBAC) enforced across all modules
- [Critical] Multi-tenant data isolation with schema-level separation
- [Critical] Audit logging for all user actions and data modifications
- [High] Session management with auto-logout after 30 minutes inactivity

### Data Validation
- [Critical] Mandatory field validation before form submission
- [Critical] Business rule validation (e.g., quantity limits, date ranges)
- [High] Real-time validation feedback to users
- [High] Server-side validation for all inputs

### Integration
- [High] GPS/VTS integration for real-time vehicle tracking
- [High] ERP integration for financial data synchronization
- [Medium] SMS gateway integration for notifications
- [Medium] Map & Routing APIs (Google Maps/OpenStreetMap)

### Usability
- [High] Responsive design for desktop, tablet, mobile
- [High] Consistent UI/UX across all modules
- [Medium] Offline capability for mobile apps
- [Medium] Multi-language support (English, Bangla)

---

## Related Documents

- [Business Objectives](../../01-overview/business-objectives.md) - Strategic goals aligned with requirements
- [User Personas](../02-user-personas/user-personas.md) - User profiles and needs
- [Non-Functional Requirements](../non-functional-requirements/) - System quality attributes
- [Business Processes](../../01-business-domain/business-processes/) - Detailed workflows
- [Source Document Mapping](../../../04-architecture/08-reference/source-document-mapping.md) - Traceability

---

**Last Updated**: 2026-02-10  
**Status**: Approved  
**Version**: Based on PRD v1.0  
**Total User Stories**: 91 (Phase 1: 63, Phase 2: 14, Phase 3: 14)  
**Total Modules**: 12

