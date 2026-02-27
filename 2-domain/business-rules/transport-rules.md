---
title: DFMS Transport Rules
category: business
phase: requirements
status: approved
created: 2026-02-13
updated: 2026-02-13
source_documents:
  - ../../../source-documents/01-prd/PRD_DFMS_v1.0.md
tags: [business-rules, transport, rules]
---

# DFMS Transport Rules

## Transport Rules

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



## Related Documents

- [Business Rules Overview](./business-rules.md) - Complete rules index

---

**Last Updated**: 2026-02-13  
**Status**: Approved - Aligned with PRD v1.0  
**Maintained By**: Business Context Team
