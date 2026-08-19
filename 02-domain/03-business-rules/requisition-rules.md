---
title: DFMS Requisition Rules
category: business
phase: requirements
status: approved
created: 2026-02-13
updated: 2026-02-13
source_documents:
  - ../../../source-documents/01-prd/DFMS_Product_Requirements_Document_v3.md
tags: [business-rules, requisition, rules]
---

# DFMS Requisition Rules

## Requisition Rules

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



## Related Documents

- [Business Rules Overview](./business-rules.md) - Complete rules index

---

**Last Updated**: 2026-02-13  
**Status**: Approved - Aligned with PRD v1.0  
**Maintained By**: Business Context Team
