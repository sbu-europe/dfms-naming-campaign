---
title: DFMS Business Processes Overview
category: business
phase: discovery
status: approved
created: 2026-02-10
updated: 2026-02-10
source_documents:
  - ../../../source-documents/requirements/PRD_DFMS_v1.0.docx
  - ../../../source-documents/business-proposal/BS23_Proposal_Nourish_LFMS_v1.3.1_No_Commercial.docx
  - ../../../source-documents/discovery-phase/flow-diagrams/
  - ../../../source-documents/meeting-minutes/2025-09/Transport_Operations_2025-09-29.docx
  - ../../../source-documents/meeting-minutes/2025-10/Distribution_Sales_2025-10-06.docx
  - ../../../source-documents/meeting-minutes/2025-10/Procurement_Operations_2025-10-06.docx
  - ../../../source-documents/meeting-minutes/2025-10/QA_QC_Operations_2025-10-06.docx
tags: [business-processes, workflows, operations, end-to-end]
---

# DFMS Business Processes Overview

> Comprehensive overview of all business processes in the DFMS ecosystem

## Executive Summary

DFMS orchestrates 7 core business processes that span from product requisition to trip closure and billing. These processes involve 15+ stakeholder roles across internal departments (Distribution, Procurement, Transport, Operations, QC, Finance) and external parties (Vendors, Drivers).

---

## Process Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     DFMS Process Architecture                        │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│ 1. Product           │  Initiation Layer
│    Requisition       │  (Demand Planning)
│    Management        │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ 2. Transport         │  Planning Layer
│    Planning &        │  (Supply Planning)
│    Execution         │
└──────────┬───────────┘
           │
           ├──────────┬──────────┬──────────┬──────────┐
           ▼          ▼          ▼          ▼          ▼
    ┌──────────┐ ┌──────┐ ┌──────────┐ ┌──────┐ ┌──────────┐
    │3. Vendor │ │4.Gate│ │5.Command │ │6. QC │ │7. Trip   │
    │  Mgmt    │ │ Mgmt │ │  Center  │ │Process│ │ Costing  │
    └──────────┘ └──────┘ └──────────┘ └──────┘ └──────────┘
                     │          │          │          │
                     └──────────┴──────────┴──────────┘
                                 │
                                 ▼
                        ┌────────────────┐
                        │  Trip Closure  │  Completion Layer
                        │  & Settlement  │  (Financial Close)
                        └────────────────┘
```

---

## 1. Product Requisition Management Process

### Overview
Initiates the transport workflow by creating requisitions for product transfers (Finished Goods or Port Consignments).

### Process Flow

**Finished Goods Transfer**:
```
Depot/Feed Mill → Create PR → Distribution Officer → Create TR → 
Distribution Manager → Approve TR → Transport Department
```

**Port Consignment Transfer**:
```
Commercial Team → Create PR (with LC details) → Procurement Officer → 
Create Destination Breakdown → Create TR → Transport Department
```

### Key Activities

#### 1.1 PR Creation (Requester)
- **Actor**: Depot Officer / Feed Mill Officer / Commercial Officer
- **Input**: Product requirements, destination, urgency
- **Output**: Product Requisition (PR)
- **Activities**:
  1. Select transfer type (FG or Port)
  2. Add product line items (item code, quantity, UOM, weight)
  3. Specify source and destination POI
  4. Set delivery date and urgency
  5. Submit for approval

#### 1.2 PR Approval (Distribution/Procurement)
- **Actor**: Distribution Manager (FG) / Procurement Officer (Port)
- **Input**: Submitted PR
- **Output**: Approved PR
- **Activities**:
  1. Review PR details
  2. Validate stock availability (source)
  3. Validate capacity (destination)
  4. Approve or reject with remarks

#### 1.3 TR Creation (Distribution/Procurement)
- **Actor**: Distribution Officer (FG) / Procurement Officer (Port)
- **Input**: Approved PR
- **Output**: Transport Requisition (TR)
- **Activities**:
  1. Create TR from approved PR
  2. Define source and destination POIs
  3. Specify transfer quantity (can be partial)
  4. Set delivery date
  5. Define vehicle requirements (count, type)
  6. For Port: Add C&F clearance note
  7. Submit TR for approval

#### 1.4 TR Approval (Distribution Manager)
- **Actor**: Distribution Manager
- **Input**: Submitted TR
- **Output**: Approved TR
- **Activities**:
  1. Review TR details
  2. Modify if needed (quantity, date, vehicles)
  3. Approve or reject with remarks
  4. Forward to Transport Department

### Business Rules
- PR cannot be submitted without transfer type and at least one product line item
- Multiple TRs can be created from single PR (partial allocation)
- TR quantity cannot exceed approved PR quantity
- Destination capacity warnings displayed if threshold exceeded
- Source stock validation before execution

### Success Criteria
- PR approval time < 30 minutes
- TR creation time < 20 minutes
- Stock accuracy > 98%
- Capacity violations < 2%

---

## 2. Transport Planning & Execution Process

### Overview
Core process that converts Transport Requisitions into Transport Orders and manages trip lifecycle from planning to delivery.

### Process Flow

```
Approved TR → Transport Planner → Create TO(s) → Assign Fleet Type → 
TDO (Own/Vendor) → Assign Resources → Dispatch → Execute Trip → 
Deliver → Close Trip
```

### Key Activities

#### 2.1 TR Assessment (Transport Planner)
- **Actor**: Transport Planner (TP)
- **Input**: Approved TR from Distribution/Procurement
- **Output**: Fleet decision (Own vs Vendor)
- **Activities**:
  1. Review TR details (route, tonnage, urgency, delivery date)
  2. Check fleet availability (Own Fleet vs Vendor Fleet)
  3. Input required vehicles, vehicle type
  4. For Port: Input C&F clearance note status
  5. Decide fleet type per TR

#### 2.2 TO Creation (Transport Planner)
- **Actor**: Transport Planner (TP)
- **Input**: Assessed TR
- **Output**: Transport Order(s) (TO)
- **Activities**:
  1. Create one or multiple TOs from single TR
  2. Allocate quantity per TO (≤ remaining TR quantity)
  3. Assign fleet type per TO (Own or Vendor)
  4. Set planned delivery date
  5. Forward TO to respective TDO (Own Fleet or Vendor Fleet)

#### 2.3 Resource Assignment – Own Fleet (TDO - Own)
- **Actor**: Transport Distribution Officer (Own Fleet)
- **Input**: TO assigned to Own Fleet
- **Output**: TO with assigned vehicle, driver, helper
- **Activities**:
  1. View available vehicles (not under maintenance, not on active trip)
  2. View available drivers (not on leave, not on active trip)
  3. Assign vehicle to TO
  4. Assign driver to vehicle
  5. Assign helper(s) to driver
  6. Define Estimated Time of Arrival (ETA)
  7. Dispatch trip

#### 2.4 Resource Assignment – Vendor Fleet (TDO - Vendor)
- **Actor**: Transport Distribution Officer (Vendor Fleet)
- **Input**: TO assigned to Vendor Fleet
- **Output**: TO assigned to vendor
- **Activities**:
  - **For Contractual Vendors**:
    1. Select contractual vendor
    2. Assign TO directly (no bidding)
    3. Contractual rate applied automatically
  - **For Non-Contractual Vendors**:
    1. Publish bidding requirements (route, tonnage, vehicle type, bid window)
    2. Vendors submit bids (price, vehicle count)
    3. TDO reviews bids
    4. Select winning vendor(s)
    5. Assign TO to winner
    6. Vendor submits vehicle and driver details

#### 2.5 Trip Execution
- **Actor**: Driver, Operations Team, QC Team
- **Input**: Dispatched TO
- **Output**: Completed Trip
- **Activities** (see detailed process flows below):
  1. **Gate-in** at source POI
  2. **Scale-in** (gross weight)
  3. **Command Center** assigns to loading point
  4. **Loading** (record start/end time, bags loaded, seal number)
  5. **Scale-out** (tare weight, net weight calculated)
  6. **Gate-out** from source POI
  7. **In Transit** to destination POI
  8. **Gate-in** at destination POI
  9. **Scale-in** at destination
  10. **Command Center** assigns to unloading point
  11. **QC Sampling** (before/during unloading)
  12. **Unloading** (record start/end time, bags unloaded)
  13. **QC Inspection** (physical + lab tests)
  14. **QC Result** (Pass/Fail/Recheck)
  15. **Scale-out** at destination
  16. **POD Collection** (signature, photo)
  17. **Gate-out** from destination POI

#### 2.6 Trip Closure
- **Actor**: Transport Planner, System
- **Input**: Completed trip with QC Pass and POD
- **Output**: Closed trip
- **Activities**:
  1. System validates: QC Pass received, POD uploaded, Gate-out recorded
  2. System auto-closes trip
  3. Trip status: Closed
  4. Inventory updated (source reduced, destination increased)
  5. Trip available for costing

### TO Lifecycle States

| State | Sub-States | Trigger | Next State |
|-------|------------|---------|------------|
| Draft | - | TP creates TO | Planned |
| Planned | Fleet Decided, Awaiting Assignment | TP assigns fleet type | Assigned |
| Assigned | Vehicle Assigned, Driver Assigned, Helper Assigned, Assignment Confirmed | TDO assigns resources | Dispatched |
| Dispatched | Dispatch Approved, Vehicle Departed | TDO dispatches | In Transit - Source |
| In Transit - Source | En Route to Source, Delayed, Halted | Vehicle moving to source | At Source |
| At Source | Gate-in Recorded, Scale-in, Waiting/Parked | Vehicle arrives at source | Loaded |
| Loaded | Loading Started, Loading Completed, Scale-out, Pick-up Confirmed/Gate-out | Loading complete | In Transit - Destination |
| In Transit - Destination | En Route to Destination, Delayed, Halted | Vehicle moving to destination | At Destination |
| At Destination | Gate-in, Scale-in, Waiting, Assigned to Unloading Point, Sampling Started, QC Started, Lab Analysis In Progress | Vehicle arrives at destination | Delivered/Unloaded |
| Delivered/Unloaded | Unloading Started, Unloading Completed, Scale-out, POD Submitted, Receiver Confirmation | Unloading complete | Completed |
| Completed | QC Passed, QC Failed | QC result | Closed (if Pass) |
| Closed | Closed (QC Pass + POD + Gate-out) | All validations pass | - |

### Business Rules
- Multiple TOs can be created from single TR (partial allocation)
- Total TO quantity cannot exceed TR quantity
- One vehicle can only be assigned to one active trip at a time
- Drivers on leave cannot be assigned
- Vehicles under maintenance cannot be assigned
- One driver cannot be assigned to multiple active TOs
- Trip cannot close without QC Pass and POD
- QC Fail blocks trip closure

### Success Criteria
- TO creation time < 15 minutes
- Assignment time < 10 minutes per TO
- Fleet utilization > 75%
- On-time delivery > 95%
- Trip completion rate > 98%

---

## 3. Vendor Management Process

### Overview
Manages vendor lifecycle from onboarding to performance tracking, including bidding for non-contractual vendors.

### Process Flow

```
Vendor Registration → Admin Verification → Approval → 
Bidding (Non-Contractual) / Direct Assignment (Contractual) → 
Trip Execution → Invoice Submission → Payment
```

### Key Activities

#### 3.1 Vendor Onboarding
- **Actor**: Vendor
- **Input**: Company details, documents
- **Output**: Vendor profile (Pending Verification)
- **Activities**:
  1. Self-register via vendor portal
  2. Upload documents (trade license, BIN, TIN)
  3. Provide company details, contact info, testimonial
  4. Select vendor type (Contractual / Non-Contractual)
  5. Submit for verification

#### 3.2 Vendor Verification
- **Actor**: Tenant Admin
- **Input**: Vendor profile (Pending Verification)
- **Output**: Approved or Rejected vendor
- **Activities**:
  1. Review vendor profile
  2. Verify documents
  3. Approve or reject with remarks
  4. If rejected: Vendor can resubmit
  5. If approved: Vendor becomes active

#### 3.3 Bidding (Non-Contractual Vendors)
- **Actor**: TDO (Vendor Fleet), Vendors
- **Input**: TO assigned to Vendor Fleet
- **Output**: Winning vendor(s)
- **Activities**:
  - **TDO**:
    1. Publish bidding requirements (route, tonnage, vehicle type, bid window, required vehicle count)
    2. Optionally provide expected rate
    3. Monitor bid submissions
    4. Compare bids (rate, vehicle availability, vendor history)
    5. Select winning vendor(s)
    6. Close bidding
  - **Vendor**:
    1. View active bidding opportunities
    2. Submit bid (offered rate, available vehicle count)
    3. View bid probability indicator (Phase 3)
    4. Wait for bid result
    5. If won: Submit vehicle and driver details

#### 3.4 Direct Assignment (Contractual Vendors)
- **Actor**: TDO (Vendor Fleet)
- **Input**: TO assigned to Vendor Fleet
- **Output**: TO assigned to contractual vendor
- **Activities**:
  1. Select contractual vendor
  2. Assign TO directly (no bidding)
  3. Contractual rate applied automatically (hidden from vendor)
  4. Vendor notified of assignment
  5. Vendor submits vehicle and driver details

#### 3.5 Trip Execution (Vendor)
- **Actor**: Vendor, Vendor Driver
- **Input**: Assigned TO
- **Output**: Completed trip
- **Activities**:
  1. Vendor assigns vehicle and driver
  2. Vendor provides: Vehicle number, Capacity, Driver name/contact, Driver NID/License, Helper details
  3. Driver executes trip (same as Own Fleet process)
  4. Driver/Vendor updates trip status via mobile app
  5. Driver captures POD (signature + photo)
  6. Trip completes

#### 3.6 Invoice Submission (Vendor)
- **Actor**: Vendor
- **Input**: Completed trip(s)
- **Output**: Invoice submitted
- **Activities**:
  1. View completed trips
  2. Create invoice (can consolidate multiple trips)
  3. Upload invoice document
  4. Upload POD for each trip
  5. Upload GRN (Goods Receipt Note) for each trip
  6. Submit invoice for verification

#### 3.7 Invoice Verification & Payment (Accounts)
- **Actor**: Accounts Officer
- **Input**: Submitted invoice
- **Output**: Payment processed
- **Activities**:
  1. Review invoice
  2. Verify POD and GRN attached
  3. Match invoice amount with trip cost
  4. Approve or reject invoice
  5. Process payment
  6. Update payment status

### Business Rules
- Vendors cannot access system before admin approval
- Contractual vendors do not participate in bidding
- Non-contractual vendors must bid to win TOs
- Bids cannot be edited after submission
- Bidding window is configurable
- Vendor selection is final once approved
- Invoice cannot be submitted without POD and GRN
- Only completed trips are billable

### Success Criteria
- Vendor verification time < 48 hours
- Bid submission time < 2 hours
- Vendor disputes < 5%
- Invoice processing time < 48 hours
- Vendor satisfaction > 4/5

---

## 4. Gate Management Process

### Overview
Controls vehicle entry and exit at POIs, including on-demand TO creation for dealers and suppliers.

### Process Flow

```
Vehicle Arrival → Gate-in Entry → Document Verification → 
[On-Demand TO Creation (if needed)] → Proceed to Operations → 
Operations Complete → Gate-out Entry → Vehicle Departure
```

### Key Activities

#### 4.1 Gate-in Entry
- **Actor**: Gate Man
- **Input**: Vehicle arrival
- **Output**: Gate-in record
- **Activities**:
  1. Record vehicle registration number
  2. Select document category:
     - Supplier (PO) - for inbound raw materials
     - Internal Transfer (TO, Challan) - for internal transfers
     - Distributor (PO/DO) - for outbound finished goods
     - Dealer (DO) - for dealer pickups
  3. Capture document details:
     - Challan number / TO number / PO number / DO number
     - Product details (item code, name, quantity)
     - Driver information (name, contact)
     - Party name (Supplier/Dealer/Distributor)
     - Project From information
     - Remarks (if any)
  4. Record gate-in date and time
  5. Route to appropriate workflow:
     - Supplier/Port → Inbound QC Workflow
     - Dealer → Outbound FG Workflow
     - Internal Transfer → TO-Linked Workflow

#### 4.2 On-Demand TO Creation (Dealer)
- **Actor**: Gate Man
- **Input**: Dealer vehicle with DO copy (no pre-created TO)
- **Output**: Gate-Created FG Transport Order
- **Activities**:
  1. Select document category: Dealer (DO)
  2. Enter DO Number
  3. Enter Dealer Name
  4. Select Finished Goods product
  5. Enter Planned Quantity
  6. Enter Driver information
  7. Add Remarks (if any)
  8. System creates Gate-Created FG TO
  9. TO classified as: Dealer Outbound – Finished Goods
  10. TO immediately available for: Scaling, Loading, Gate-out

#### 4.3 On-Demand TO Creation (Supplier)
- **Actor**: Gate Man
- **Input**: Supplier vehicle with PO copy (no pre-created TO)
- **Output**: Gate-Created RM Transport Order
- **Activities**:
  1. Select document category: Supplier (PO)
  2. Enter PO Number
  3. Enter Supplier Name
  4. Select Raw Material product
  5. Enter Expected Quantity
  6. Enter Driver information
  7. Add Remarks (if any)
  8. System creates Gate-Created RM TO
  9. TO classified as: Supplier Inbound – Raw Material
  10. TO linked to: QC and Scaling workflows automatically

#### 4.4 Gate-out Entry
- **Actor**: Gate Man
- **Input**: Operations complete (gate pass from Scaling)
- **Output**: Gate-out record
- **Activities**:
  1. Receive gate pass from Scaling (after scale-out)
  2. Verify gate pass details
  3. Record gate-out date and time
  4. Vehicle exits

### Business Rules
- Gate-in cannot be saved without vehicle number
- For empty vehicles, quantity kept null
- Gate-out cannot occur before scale-out
- Gate-out blocked if QC status pending (for unloading flows)
- On-demand TO immediately available for operations
- Inventory deduction occurs after loading & scale-out (for FG)
- Inventory updated only after QC Pass (for RM)

### Success Criteria
- Gate-in time < 5 minutes per vehicle
- Data accuracy > 98%
- On-demand TO creation < 10 minutes
- Zero unauthorized entries

---

## 5. Command Center & Loading/Unloading Process

### Overview
Coordinates vehicle flow from weighing to loading/unloading, optimizing bay utilization and minimizing dwell time.

### Process Flow

```
Scale-in Complete → Queue Token Generated → Command Center Monitors Queue → 
Assign to Loading/Unloading Point → Issue Waiting Serial → 
Loading/Unloading Execution → Scale-out → Gate Pass Generated
```

### Key Activities

#### 5.1 Scaling (Weighing)
- **Actor**: Scaling Operator
- **Input**: Vehicle after gate-in
- **Output**: Weight recorded, queue token generated
- **Activities**:
  - **Scale-in**:
    1. Record vehicle number
    2. Record material name and code
    3. Record challan number
    4. Record scale-in date and time
    5. Record gross weight
    6. Generate unique queue token (P.C. Code)
    7. Print queue token
    8. Notify Command Center
  - **Scale-out** (after loading/unloading):
    1. Record scale-out date and time
    2. Record tare weight
    3. System auto-calculates net weight
    4. Generate gate pass with delivery note
    5. Print gate pass
    6. Provide to driver for gate-out

#### 5.2 Queue Monitoring (Command Center)
- **Actor**: Command Center Officer (CCO)
- **Input**: Vehicles with completed scale-in
- **Output**: Prioritized queue
- **Activities**:
  1. View centralized queue of waiting vehicles
  2. Each queue entry shows:
     - Vehicle Number
     - PC Code (Waiting Code)
     - Item
     - Scale-in Date & Time
     - Product Type
     - Weight (Gross / Net if available)
     - TO/Challan reference
     - Urgency Level
  3. Monitor loading/unloading point availability
  4. Prioritize based on: Urgency, Product Type, Waiting Time

#### 5.3 Loading/Unloading Assignment
- **Actor**: Command Center Officer (CCO)
- **Input**: Waiting vehicle, available loading/unloading point
- **Output**: Vehicle assigned to point
- **Activities**:
  1. Select vehicle from queue
  2. Select available loading or unloading point
  3. Consider: Product Type, Vehicle Type, Urgency Level
  4. Assign vehicle to point
  5. Issue waiting serial for the point
  6. System updates vehicle status
  7. System sends notification to loading/unloading team

#### 5.4 Loading Execution
- **Actor**: Loading Personnel
- **Input**: Vehicle assigned to loading point
- **Output**: Vehicle loaded
- **Activities**:
  1. Receive assignment notification
  2. Record loading start date and time
  3. Load products onto vehicle
  4. Record number of bags/units loaded
  5. Record weight loaded
  6. Apply seal to vehicle
  7. Record seal number
  8. Record loading end date and time
  9. Confirm loading completion
  10. Vehicle proceeds to scale-out

#### 5.5 Unloading Execution
- **Actor**: Unloading Personnel
- **Input**: Vehicle assigned to unloading point
- **Output**: Vehicle unloaded
- **Activities**:
  1. Receive assignment notification
  2. Record unloading start date and time
  3. Unload products from vehicle
  4. Record number of bags/units unloaded
  5. Record weight unloaded
  6. Record unloading end date and time
  7. Confirm unloading completion
  8. Trigger QC inspection
  9. Vehicle proceeds to scale-out (after QC Pass)

### Business Rules
- Only vehicles with completed Scale-in appear in Command Center queue
- Vehicles already assigned to loading point do not appear in waiting queue
- One active serial per vehicle per loading point
- Serials cannot be edited
- Loading/unloading timestamps must be chronological
- QC must be triggered before or during unloading
- Vehicle cannot proceed to scale-out until QC Pass (for unloading)

### Success Criteria
- Weighing time < 3 minutes per vehicle
- Assignment time < 2 minutes per vehicle
- Loading time < 45 minutes per vehicle
- Unloading time < 45 minutes per vehicle
- Average dwell time < 60 minutes
- Loading point utilization > 85%

---

## 6. Quality Control (QC) Process

### Overview
Ensures product quality through physical inspection, sampling, lab testing, and pass/fail determination.

### Process Flow

```
QC Triggered → View QC Context → Sample Creation → QR Code Generation → 
Physical Inspection → Lab Test Request → Lab Testing → 
Lab Results → QC Decision (Pass/Fail/Recheck) → 
[If Pass: Assign to Unloading] [If Fail: Recheck or Reject]
```

### Key Activities

#### 6.1 QC Context Display
- **Actor**: QC Supervisor
- **Input**: Vehicle assigned for unloading or QC triggered
- **Output**: QC context displayed
- **Activities**:
  1. View QC Context:
     - POI From / POI To
     - Supplier or Dealer name
     - Challan number and date
     - Item name and expected quantity
  2. Verify context against physical shipment
  3. Proceed to sampling

#### 6.2 Sample Creation
- **Actor**: QC Supervisor
- **Input**: QC context
- **Output**: Sample(s) created
- **Activities**:
  1. Create sample against Unload Item Code
  2. Record sampling start date and time
  3. Collect samples from multiple sides (Top/Middle/Bottom)
  4. Record sampling observations
  5. Record sampling end date and time
  6. System generates unique QR code per sample
  7. Print QR code label
  8. Attach label to sample

#### 6.3 Physical Inspection
- **Actor**: QC Supervisor
- **Input**: Sample(s)
- **Output**: Physical inspection results
- **Activities**:
  1. Conduct physical analysis:
     - Visual inspection (color, texture, defects)
     - Moisture content (using QC machine)
     - Temperature
     - Packaging condition
  2. Record physical analysis results (text input)
  3. Capture photos/videos of defects (if any)
  4. Record observations and remarks

#### 6.4 Lab Test Request
- **Actor**: QC Supervisor
- **Input**: Sample requiring lab tests
- **Output**: Lab test request created
- **Activities**:
  1. Create lab test request for sample
  2. Specify test types required:
     - Nutritional analysis
     - Chemical composition
     - Contamination testing
     - Moisture content (lab verification)
  3. Record sample send time
  4. System tracks lab test request status

#### 6.5 Lab Testing
- **Actor**: QA Lab Technician
- **Input**: Lab test request, sample
- **Output**: Lab test results
- **Activities**:
  1. Scan QR code on sample (auto-records lab test start time)
  2. Conduct lab tests per request
  3. Enter estimated completion time per test
  4. Perform tests
  5. Record test results
  6. Upload test report (PDF/PNG)
  7. Record test completion time
  8. Update lab test status: To-Do → WIP → Completed

#### 6.6 QC Decision
- **Actor**: QC Supervisor
- **Input**: Physical inspection results, lab test results
- **Output**: QC result (Pass/Fail/Auto-Pass)
- **Activities**:
  1. Review physical inspection results
  2. Review lab test results
  3. Make QC decision:
     - **QC Pass**: Product meets quality standards
     - **QC Fail**: Product does not meet standards
     - **QC Auto-Pass**: Product auto-approved (for trusted suppliers, configurable)
  4. Record QC result
  5. Add remarks (mandatory for Fail)
  6. If Pass: Assign vehicle to unloading bay/unit/point
  7. If Fail: Initiate recheck or reject shipment

#### 6.7 Recheck/Resampling (If QC Fail)
- **Actor**: QC Supervisor
- **Input**: QC Fail result
- **Output**: Recheck initiated
- **Activities**:
  1. Review failure reasons
  2. Decide: Recheck (same sample) or Resample (new sample)
  3. Add mandatory remarks explaining recheck reason
  4. Reinitiate sampling or inspection
  5. Repeat QC process
  6. Make final QC decision

### Business Rules
- QC Context must be displayed before sample creation
- QC actions blocked if mandatory context data missing
- Sampling must occur after QC Sampling event creation
- Sampling timestamps must be sequential
- One QR code per sample
- QR scan triggers lab test start time automatically
- QC Pass required for trip closure
- QC Fail blocks trip closure
- Recheck/resampling requires mandatory remarks
- Inventory updated only after QC Pass (for inbound)

### Success Criteria
- Inspection time < 30 minutes per vehicle
- QC compliance rate > 98%
- Photo documentation 100%
- Sample traceability 100%
- Quality issue detection time < 15 minutes
- Lab test turnaround time < 4 hours (average)

---

## 7. Trip Costing & Finance Process

### Overview
Calculates trip costs, processes vendor invoices, and integrates with ERP for financial closure.

### Process Flow

```
Trip Closed → Cost Calculation → Cost Sheet Generated → 
[If Vendor: Invoice Submission → Invoice Verification] → 
Payment Processing → ERP Sync
```

### Key Activities

#### 7.1 Trip Cost Calculation
- **Actor**: System (Auto), Accounts Officer (Manual entry)
- **Input**: Closed trip
- **Output**: Trip cost sheet
- **Activities**:
  1. System generates Trip Cost record when trip created
  2. Calculate distance-based cost (GPS distance × rate per km)
  3. Manual entry of costs:
     - **For Own Fleet**:
       - Fuel cost (from fuel entries or manual)
       - Maintenance allocation
       - Toll / Ferry / Parking charges
       - Other operational charges
     - **For Vendor Fleet**:
       - Vendor trip charge (from contractual rate or bid rate)
       - Additional charges (if any)
  4. System calculates:
     - Total Trip Cost
     - Cost per KM
  5. Cost sheet available for review

#### 7.2 Vendor Invoice Submission
- **Actor**: Vendor
- **Input**: Completed trip(s)
- **Output**: Invoice submitted
- **Activities**:
  1. View completed trips
  2. Select trips for invoicing (can consolidate multiple trips)
  3. Create invoice with:
     - Invoice number
     - Invoice date
     - Trip IDs included
     - Total amount (sum of trip charges)
  4. Upload invoice document (PDF)
  5. Upload POD for each trip
  6. Upload GRN for each trip
  7. Add remarks (if any)
  8. Submit invoice

#### 7.3 Invoice Verification
- **Actor**: Accounts Officer
- **Input**: Submitted invoice
- **Output**: Verified invoice
- **Activities**:
  1. View submitted invoice
  2. Verify:
     - Invoice details match trips
     - POD attached for all trips
     - GRN attached for all trips
     - Invoice amount matches trip costs
  3. Check for discrepancies
  4. Approve or reject invoice
  5. If rejected: Add remarks, vendor can resubmit
  6. If approved: Proceed to payment

#### 7.4 Payment Processing
- **Actor**: Accounts Officer
- **Input**: Verified invoice
- **Output**: Payment processed
- **Activities**:
  1. Generate payment voucher
  2. Process payment (bank transfer, cheque, etc.)
  3. Update payment status
  4. Notify vendor of payment
  5. Record payment date and reference

#### 7.5 ERP Integration
- **Actor**: System (Auto)
- **Input**: Trip cost sheet, invoice, payment
- **Output**: ERP synchronized
- **Activities**:
  1. Sync trip cost data to ERP
  2. Sync invoice data to ERP
  3. Sync payment data to ERP
  4. Update financial records
  5. Generate financial reports

### Business Rules
- Trip cost record generated when trip created
- Manual cost entry allowed only for authorized roles
- Cost history audit-logged
- Trip cost summary available after trip closure
- Vendor cost linked to: TO ID, Trip ID, Vendor ID
- Vendor cost locked after Bid approval (for non-contractual)
- Invoice cannot be submitted without POD and GRN
- Only completed trips are billable
- System supports one invoice per TO or consolidated invoice for multiple TOs

### Success Criteria
- Cost calculation accuracy > 98%
- Invoice processing time < 48 hours
- Invoice accuracy > 98%
- Cost variance < 5% from estimates
- Billing disputes < 3%

---

## Process Integration Matrix

| Process | Triggers | Inputs From | Outputs To | Dependencies |
|---------|----------|-------------|------------|--------------|
| 1. Product Requisition | Demand planning | - | Transport Planning | Master Data |
| 2. Transport Planning | Approved TR | Product Requisition | Vendor Mgmt, Gate Mgmt, Operations | Master Data, Fleet Availability |
| 3. Vendor Management | TO assigned to Vendor Fleet | Transport Planning | Transport Planning (resources) | Vendor Master Data |
| 4. Gate Management | Vehicle arrival | Transport Planning | Scaling, Command Center | TO/PO/DO documents |
| 5. Command Center & Loading | Scale-in complete | Gate Management | QC, Trip Execution | Loading/Unloading capacity |
| 6. Quality Control | Unloading triggered | Command Center | Trip Closure | QC checklists, Lab equipment |
| 7. Trip Costing | Trip closed | Transport Planning, QC | ERP, Finance | Trip data, Vendor invoices |

---

## Process Performance Metrics

| Process | Key Metrics | Target |
|---------|-------------|--------|
| Product Requisition | PR approval time, TR creation time, Stock accuracy | < 30 min, < 20 min, > 98% |
| Transport Planning | TO creation time, Fleet utilization, On-time delivery | < 15 min, > 75%, > 95% |
| Vendor Management | Vendor verification time, Bid submission time, Invoice processing | < 48 hrs, < 2 hrs, < 48 hrs |
| Gate Management | Gate-in time, On-demand TO creation, Data accuracy | < 5 min, < 10 min, > 98% |
| Command Center | Assignment time, Dwell time, Loading point utilization | < 2 min, < 60 min, > 85% |
| Quality Control | Inspection time, QC compliance, Lab turnaround | < 30 min, > 98%, < 4 hrs |
| Trip Costing | Cost accuracy, Invoice accuracy, Billing disputes | > 98%, > 98%, < 3% |

---

## Related Documents

- [Functional Requirements](../../02-requirements/functional-requirements/) - Detailed feature specifications
- [Business Rules](../business-rules/) - Business logic and constraints
- [User Personas](../../02-requirements/user-personas.md) - User roles and responsibilities
- [Flow Diagrams](../../../source-documents/discovery-phase/flow-diagrams/) - Visual process flows

---

**Last Updated**: 2026-02-10  
**Status**: Approved  
**Version**: 1.0  
**Review Cycle**: Quarterly or per major process change

