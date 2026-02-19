---
title: Requisition Transfer Type Configuration
story_id: US-073
phase: phase-1
module: Product Requisition Management
priority: Critical
status: Pending
epic: Product Requisition Foundation
sprint: Sprint 3
story_points: 5
created: 2026-02-13
updated: 2026-02-13
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
related_stories:
  - US-012-product-requisition-creation.md
  - US-013-finished-goods-transfer-requisition.md
  - US-014-port-consignment-transfer-requisition.md
dependencies: []
tags: [product-requisition, transfer-type, configuration, critical]
---

# US-073: Requisition Transfer Type Configuration

## User Story

**As a** Requisition Creator  
**I want to** select the type of product transfer  
**So that** the system can apply the correct approval workflow and downstream processing

## Business Context

DFMS supports multiple product transfer types, each with distinct:
- Approval workflows
- Required input fields
- TR generation logic
- Downstream processing

The transfer type selection determines the entire requisition workflow, making it a critical configuration point.

## Acceptance Criteria

### Must Have (Critical)
- [ ] System SHALL provide pre-defined Requisition Transfer Types during PR creation
- [ ] System SHALL support at least two transfer types:
  - Finished Goods Transfer
  - Port Consignment Transfer
- [ ] System SHALL require mandatory selection of Transfer Type before PR submission
- [ ] Selected transfer type SHALL dynamically control:
  - Required input fields
  - Approval hierarchy
  - TR generation logic
- [ ] System SHALL dynamically load transfer-type-specific forms
- [ ] System SHALL enforce transfer type selection before allowing PR creation

### Should Have (High)
- [ ] System SHOULD restrict transfer types by user role
- [ ] System SHOULD display transfer type description/help text
- [ ] System SHOULD validate transfer type compatibility with requester department

### Nice to Have (Medium)
- [ ] System MAY support custom transfer types (future)
- [ ] System MAY provide transfer type templates

## Functional Requirements

### FR-073-001: Transfer Type Definition
- [Critical] System SHALL support pre-defined transfer types:
  - **Finished Goods Transfer**: Depot/Feed Mill → Distribution
  - **Port Consignment Transfer**: Port → Procurement → Distribution
- [Critical] System SHALL store transfer type configuration:
  - Transfer type code
  - Transfer type name
  - Description
  - Approval workflow
  - Required fields
  - TR generation rules
- [High] System SHALL allow admin to configure transfer types (future)

### FR-073-002: Transfer Type Selection
- [Critical] System SHALL require transfer type selection during PR creation
- [Critical] System SHALL display transfer types as dropdown or radio buttons
- [Critical] System SHALL prevent PR submission without transfer type
- [High] System SHALL display transfer type description
- [High] System SHALL show transfer type requirements/help

### FR-073-003: Dynamic Form Loading
- [Critical] System SHALL load transfer-type-specific form fields:
  - Finished Goods: Standard PR fields (product, quantity, source/destination POI)
  - Port Consignment: Additional fields (BL number, LC number, vessel, container, etc.)
- [Critical] System SHALL hide/show fields based on transfer type
- [Critical] System SHALL validate required fields per transfer type
- [High] System SHALL provide field-level help based on transfer type

### FR-073-004: Approval Workflow Control
- [Critical] System SHALL route PR based on transfer type:
  - Finished Goods → Distribution approval
  - Port Consignment → Procurement approval
- [Critical] System SHALL enforce transfer-type-specific approval hierarchy
- [Critical] System SHALL prevent incorrect approval routing

### FR-073-005: TR Generation Logic
- [Critical] System SHALL apply transfer-type-specific TR generation:
  - Finished Goods: TR created by Distribution Officer post-approval
  - Port Consignment: TR created by Procurement Officer with destination breakdown
- [Critical] System SHALL enforce TR creation ownership per transfer type
- [High] System SHALL validate TR generation prerequisites per transfer type

### FR-073-006: Role-Based Restrictions
- [High] System SHALL restrict transfer types by user role:
  - Depot/Feed Mill users: Finished Goods Transfer only
  - Commercial users: Port Consignment Transfer only
  - Distribution users: Can view both types
- [High] System SHALL validate requester department compatibility

## Business Rules

### BR-073-001: Transfer Type Selection
- Transfer type must be selected before PR creation
- Transfer type cannot be changed after PR submission
- Transfer type determines entire PR workflow

### BR-073-002: Form Field Control
- Finished Goods Transfer requires:
  - Product (FG)
  - Quantity
  - Source POI (Depot/Feed Mill)
  - Destination POI
- Port Consignment Transfer requires:
  - Product (RM)
  - BL Number
  - LC Number
  - Vessel/Voyage details
  - Container Number
  - C&F Agent
  - POL, ETA
  - Tentative quantity

### BR-073-003: Approval Routing
- Finished Goods: Requester → Distribution Officer → Distribution Manager → Transport
- Port Consignment: Requester → Procurement Officer → Transport (with destination breakdown)

### BR-073-004: TR Generation
- Finished Goods: Distribution Officer creates TR post-approval
- Port Consignment: Procurement Officer creates TR with destination breakdown plan

## Data Model

### Transfer Type Configuration Entity
```yaml
TransferTypeConfig:
  transfer_type_id: string (unique)
  transfer_type_code: string (fg_transfer|port_transfer)
  transfer_type_name: string
  description: string
  approval_workflow: json (workflow steps)
  required_fields: array[string]
  tr_generation_rules: json
  allowed_roles: array[string]
  is_active: boolean
```

### Product Requisition Entity (Updated)
```yaml
ProductRequisition:
  pr_id: string (unique)
  transfer_type: string (FK to TransferTypeConfig)
  # ... other PR fields
```

## UI/UX Requirements

### Transfer Type Selection
- Transfer type dropdown/radio buttons at PR creation start
- Transfer type description/help text
- Visual indicator of selected type
- "Continue" button to proceed to form

### Dynamic Form
- Form fields change based on transfer type selection
- Required fields clearly marked
- Field-level help/validation messages
- Transfer type indicator visible throughout form

## API Endpoints

### GET /api/v1/product-requisition/transfer-types
- List available transfer types
- Query params: user_role, requester_department
- Response: array of transfer type configurations

### GET /api/v1/product-requisition/transfer-types/{transfer_type_id}
- Get transfer type details
- Response: transfer type configuration with form fields, workflow

### POST /api/v1/product-requisition/transfer-types/{transfer_type_id}/validate
- Validate transfer type selection
- Request body: requester_role, requester_department
- Response: validation_result, allowed (boolean)

## Non-Functional Requirements

- **Performance**: Form loading within 500ms after transfer type selection
- **Usability**: Clear transfer type selection, intuitive form changes

## Testing Scenarios

### TC-073-001: Transfer Type Selection
1. User starts PR creation
2. Selects "Finished Goods Transfer"
3. Verify form loads with FG-specific fields
4. Changes to "Port Consignment Transfer"
5. Verify form updates with Port-specific fields

### TC-073-002: Approval Routing
1. Create PR with "Finished Goods Transfer"
2. Submit PR
3. Verify routed to Distribution for approval
4. Create PR with "Port Consignment Transfer"
5. Submit PR
6. Verify routed to Procurement for approval

### TC-073-003: TR Generation
1. Approve Finished Goods PR
2. Verify Distribution Officer can create TR
3. Approve Port Consignment PR
4. Verify Procurement Officer creates TR with destination breakdown

### TC-073-004: Role Restrictions
1. Depot user attempts to create Port Consignment PR
2. Verify restriction/error message
3. Commercial user attempts to create Finished Goods PR
4. Verify restriction/error message

## Dependencies

- **US-012**: Product Requisition Creation - uses transfer type
- **US-013**: Finished Goods Transfer Requisition - implements FG transfer type
- **US-014**: Port Consignment Transfer Requisition - implements Port transfer type

## Definition of Done

- [ ] Transfer type configuration implemented
- [ ] Transfer type selection implemented
- [ ] Dynamic form loading implemented
- [ ] Approval workflow control implemented
- [ ] TR generation logic implemented
- [ ] Role-based restrictions implemented
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing
- [ ] Documentation updated
- [ ] Code reviewed and approved

---

**Source Documents**:
- PRD Section 6.7.1: Requisition Transfer Type Configuration

**Last Updated**: February 13, 2026  
**Status**: Pending Review

