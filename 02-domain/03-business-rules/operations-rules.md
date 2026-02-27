---
title: DFMS Operations Rules
category: business
phase: requirements
status: approved
created: 2026-02-13
updated: 2026-02-13
source_documents:
  - ../../../source-documents/01-prd/PRD_DFMS_v1.0.md
tags: [business-rules, operations, rules]
---

# DFMS Operations Rules

## Operations Rules

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



## Related Documents

- [Business Rules Overview](./business-rules.md) - Complete rules index

---

**Last Updated**: 2026-02-13  
**Status**: Approved - Aligned with PRD v1.0  
**Maintained By**: Business Context Team
