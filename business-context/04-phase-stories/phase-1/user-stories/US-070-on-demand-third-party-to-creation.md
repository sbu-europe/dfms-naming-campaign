---
title: On Demand Third Party TO Creation at Gate-In
story_id: US-070
phase: phase-1
module: Gate Management
priority: High
status: Pending
epic: Gate Operations
epic_id: EPIC-012
epic_name: Scaling / Weight Management
sprint: Sprint 4
story_points: 8
created: 2026-02-13
updated: 2026-02-13
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-032-gate-in-entry.md
  - US-033-gate-out-entry.md
  - US-012-product-requisition-creation.md
dependencies: []
tags: [gate-management, transport-order, on-demand, critical]
---

# US-070: On Demand Third Party TO Creation at Gate-In

## User Story

**As a** Gate Man  
**I want to** create an on-demand Transport Order (TO) when a dealer or supplier vehicle arrives with a DO/PO copy  
**So that** finished goods or raw materials can proceed even if a TO was not pre-created

## Business Context

In operational scenarios, dealers and suppliers may arrive at the gate without pre-created Transport Orders:
- **Dealer Entry**: Dealer arrives with DO (Delivery Order) copy for finished goods pickup
- **Supplier Entry**: Supplier arrives with PO (Purchase Order) copy for raw material delivery

The system must support on-demand TO creation at the gate to avoid operational delays while maintaining proper workflow and inventory tracking.

## Acceptance Criteria

### Must Have (Critical)
- [ ] System SHALL allow gate-man to create on-demand TO for Dealer entry (DO copy)
- [ ] System SHALL allow gate-man to create on-demand TO for Supplier entry (PO copy)
- [ ] System SHALL require document category selection (Dealer DO / Supplier PO)
- [ ] System SHALL require DO/PO number input
- [ ] System SHALL require dealer/supplier name
- [ ] System SHALL require product selection (FG for dealer, RM for supplier)
- [ ] System SHALL require planned quantity input
- [ ] System SHALL require driver information (name, contact)
- [ ] System SHALL auto-generate unique TO ID
- [ ] System SHALL tag TO as "Gate-Created" with source "Gate"
- [ ] System SHALL classify TO by transfer type (Dealer Outbound FG / Supplier Inbound RM)
- [ ] System SHALL make TO immediately available for scaling, loading/unloading, gate-out

### Should Have (High)
- [ ] System SHOULD validate FG quantity against available inventory (for dealer)
- [ ] System SHOULD validate PO number exists (for supplier)
- [ ] System SHOULD allow remarks/notes entry
- [ ] System SHOULD link gate-created TO to gate-in record

### Nice to Have (Medium)
- [ ] System MAY support DO/PO number lookup/validation
- [ ] System MAY provide product suggestions based on DO/PO

## Functional Requirements

### FR-070-001: Dealer DO TO Creation
- [Critical] System SHALL allow gate-man to select "Document Category = Dealer (DO)"
- [Critical] System SHALL require:
  - DO Number
  - Dealer Name
  - Finished Goods product selection
  - Planned Quantity
  - Driver name and contact details
  - Remarks (optional)
- [Critical] System SHALL create Gate-Created FG Transport Order (TO)
- [Critical] System SHALL tag TO as:
  - Source: Gate
  - Transfer Type: Finished Goods – Dealer Outbound
- [Critical] System SHALL make TO immediately available for:
  - Scaling (scale-in/scale-out)
  - Loading
  - Gate-out
- [High] System SHALL validate FG quantity against available inventory
- [High] System SHALL link TO to gate-in record

### FR-070-002: Supplier PO TO Creation
- [Critical] System SHALL allow gate-man to select "Document Category = Supplier (PO)"
- [Critical] System SHALL require:
  - PO Number
  - Supplier Name
  - Raw Material product selection
  - Expected Quantity
  - Driver name and contact details
  - Remarks (optional)
- [Critical] System SHALL create Gate-Created RM Transport Order (TO)
- [Critical] System SHALL tag TO as:
  - Source: Gate
  - Transfer Type: Supplier Inbound – Raw Material
- [Critical] System SHALL link TO to inbound workflow:
  - Scale-in
  - QC Sampling
  - Lab test
  - Unloading
  - Scale-out
- [High] System SHALL validate PO number exists (if PO master data available)
- [High] System SHALL link TO to gate-in record

### FR-070-003: TO Generation & Routing
- [Critical] System SHALL auto-generate unique TO ID
- [Critical] System SHALL set TO status to "Planned" or "Gate-Created"
- [Critical] System SHALL route TO to appropriate workflow:
  - Dealer TO → Loading → Gate-out
  - Supplier TO → Scale-in → QC → Unloading → Scale-out
- [Critical] System SHALL make TO visible in:
  - Scaling queue
  - Command Center queue
  - Loading/Unloading assignments
- [High] System SHALL notify relevant departments (Transport, QC) about gate-created TO

### FR-070-004: Inventory Management
- [Critical] For Dealer TO: Inventory deduction SHALL occur after loading & Scale-out
- [Critical] For Supplier TO: Inventory update SHALL occur only after QC Pass
- [High] System SHALL display available inventory during TO creation (for dealer)
- [High] System SHALL warn if quantity exceeds available inventory

## Business Rules

### BR-070-001: Document Categories
- Dealer (DO): For finished goods outbound
- Supplier (PO): For raw material inbound
- Document category determines workflow routing

### BR-070-002: TO Classification
- Gate-created TOs are tagged with source "Gate"
- Transfer type determined by document category:
  - Dealer DO → Finished Goods – Dealer Outbound
  - Supplier PO → Supplier Inbound – Raw Material

### BR-070-003: Workflow Routing
- Dealer TO follows: Gate-in → Scale-in → Loading → Scale-out → Gate-out
- Supplier TO follows: Gate-in → Scale-in → QC → Lab Test → Unloading → Scale-out → Gate-out

### BR-070-004: Inventory Updates
- Dealer TO: Inventory reduced after loading completion and scale-out
- Supplier TO: Inventory increased only after QC Pass and scale-out

## Data Model

### Gate-Created TO Entity
```yaml
GateCreatedTO:
  to_id: string (unique, auto-generated)
  gate_in_id: string (FK)
  document_category: string (dealer_do|supplier_po)
  document_number: string (DO/PO number)
  party_name: string (dealer/supplier name)
  product_id: string (FK)
  product_type: string (fg|rm)
  planned_quantity: decimal
  driver_name: string
  driver_contact: string
  source: string (gate)
  transfer_type: string (dealer_outbound_fg|supplier_inbound_rm)
  created_by: string (FK - gate operator)
  created_at: datetime
  remarks: string (optional)
```

## UI/UX Requirements

### Gate TO Creation Form
- Document category selection (radio buttons: Dealer DO / Supplier PO)
- DO/PO number input
- Dealer/Supplier name input (with autocomplete if master data exists)
- Product selection dropdown (filtered by FG/RM based on category)
- Quantity input with unit display
- Driver name and contact inputs
- Remarks textarea
- "Create TO" button
- Available inventory display (for dealer, if applicable)

### TO Creation Confirmation
- Display generated TO ID
- Show workflow steps that will be triggered
- "Continue" button to proceed to gate-in completion

## API Endpoints

### POST /api/v1/gate/on-demand-to/create
- Create on-demand TO at gate
- Request body: document_category, document_number, party_name, product_id, quantity, driver_name, driver_contact, remarks
- Response: to_id, workflow_steps

### GET /api/v1/gate/on-demand-to/{to_id}
- Get gate-created TO details
- Response: TO details with workflow status

### POST /api/v1/gate/on-demand-to/{to_id}/validate
- Validate TO creation (inventory check, PO validation)
- Response: validation_result, warnings, errors

## Non-Functional Requirements

- **Performance**: TO creation must complete within 3 seconds
- **Availability**: Gate TO creation must be available 24/7
- **Reliability**: TO creation must succeed even if some validations fail (with warnings)

## Testing Scenarios

### TC-070-001: Dealer DO TO Creation
1. Gate-man selects "Dealer (DO)" category
2. Enters DO number, dealer name, FG product, quantity
3. Enters driver information
4. Creates TO
5. Verify TO created with unique ID
6. Verify TO tagged as "Gate-Created" and "Dealer Outbound FG"
7. Verify TO available in loading queue

### TC-070-002: Supplier PO TO Creation
1. Gate-man selects "Supplier (PO)" category
2. Enters PO number, supplier name, RM product, quantity
3. Enters driver information
4. Creates TO
5. Verify TO created
6. Verify TO tagged as "Gate-Created" and "Supplier Inbound RM"
7. Verify TO routed to QC workflow

### TC-070-003: Inventory Validation
1. Create dealer TO with quantity exceeding available inventory
2. Verify warning displayed
3. Allow creation with override
4. Verify TO created with warning flag

## Dependencies

- **US-032**: Gate-In Entry (gate-in must exist)
- **US-012**: Product Requisition Creation (for product master data)
- **Inventory Management**: For quantity validation

## Definition of Done

- [ ] Dealer DO TO creation implemented
- [ ] Supplier PO TO creation implemented
- [ ] TO classification and tagging implemented
- [ ] Workflow routing implemented
- [ ] Inventory validation implemented
- [ ] Gate-in linking implemented
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing
- [ ] Documentation updated
- [ ] Code reviewed and approved

---

**Source Documents**:
- PRD Section 6.10.2: On Demand Third Party Supplier and Dealer Management At Gate-In
- PRD Section 6.10.2.1: On Demand Third Party TO Creation against DO copy for Dealer Entry
- PRD Section 6.10.2.2: On Demand Third Party TO Creation against PO copy for Supplier Entry

**Last Updated**: February 13, 2026  
**Status**: Pending Review

