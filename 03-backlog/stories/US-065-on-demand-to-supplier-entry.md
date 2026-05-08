---
title: On Demand Third Party TO Creation against PO copy for Supplier Entry
story_id: US-065
phase: phase-1
module: Gate Management
priority: High
status: Pending
epic: Gate Management
epic_id: EPIC-011
epic_name: Gate Management
sprint: Sprint 10
story_points: 8
created: 2026-02-23
updated: 2026-02-23
source_documents:
  - ../../../../01-source/01-prd/PRD_DFMS_v1.0.md
  - ../../../../source-documents/04-wbs/stories-table.md
  - ../../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-063-gate-in-challan-lookup.md
  - US-064-on-demand-to-dealer-entry.md
  - US-077-pre-qc-context-display.md
dependencies:
  - US-063-gate-in-challan-lookup.md
tags: [gate, to-creation, supplier, high-priority]
---

# US-065: On Demand Third Party TO Creation against PO copy for Supplier Entry

## User Story

**As a** Gate man  
**I want to** create an on-demand Transport Order (TO) when a supplier vehicle arrives with a PO copy for raw material delivery  
**So that** inbound material receiving can proceed without delay

## Business Context

When a supplier vehicle arrives at gate with a Purchase Order (PO) for raw materials, the gate man can create an on-demand TO to enable inbound workflows. The system must:
- Generate on-demand Raw Material Transport Order (TO)
- Classify TO as Supplier Inbound – Raw Material
- Link TO to inbound workflows: scale-in, QC sampling, lab testing, unloading
- Ensure material receiving proceeds without pre-created TO

---

## Acceptance Criteria

### AC-1: On-Demand TO Creation
- [ ] System SHALL allow gate-in with Document Category = Supplier (PO)
- [ ] System SHALL capture PO Number, Supplier Name, Raw Material product, Expected Quantity
- [ ] System SHALL capture driver name and contact details, optional remarks
- [ ] System SHALL generate on-demand Raw Material TO upon submission

### AC-2: TO Classification
- [ ] System SHALL classify TO as Supplier Inbound – Raw Material
- [ ] System SHALL automatically link TO to inbound workflows (scale-in, QC, unloading)
- [ ] System SHALL route to QC sampling and lab testing for raw materials

### AC-3: Validation
- [ ] System SHALL validate PO reference and supplier details
- [ ] System SHALL validate product and quantity against PO

---

## Functional Requirements

### FR-001: On-Demand TO
- [Critical] Generate TO from gate-in with PO
- [Critical] Supplier Inbound classification
- [Critical] Link to inbound workflows

### FR-002: Inbound Workflow
- [Critical] Route to scale-in
- [Critical] Route to QC sampling and lab testing
- [High] Route to unloading

---

## Business Rules

### BR-GATE-005: Supplier PO Gate-in
- Document Category = Supplier (PO) triggers on-demand TO creation
- **Enforcement**: Gate-in workflow

### BR-GATE-006: Inbound QC
- Raw material TO requires QC sampling and lab testing
- **Enforcement**: Workflow routing

---

## Data Model

```typescript
TransportOrder {
  // ... existing fields ...
  source: Enum (Planner, Gate)
  transfer_type: string  // "Supplier Inbound – Raw Material"
  gate_in_id: UUID (nullable, FK)
}

GateInSupplierPO {
  gate_in_id: UUID
  po_number: string
  supplier_name: string
  product_id: UUID
  expected_quantity: Decimal
  driver_name: string
  driver_contact: string
  remarks: string (nullable)
}
```

---

## UI/UX Requirements

### On-Demand TO Entry (Supplier PO)
```
┌──────────────────────────────────────────────────────────────┐
│ On-Demand TO – Supplier Entry                                 │
├──────────────────────────────────────────────────────────────┤
│ Document Category: Supplier (PO)                             │
│ PO Number: [PO-2026-001__]  Supplier: [XYZ Suppliers ▼]       │
│ Product: [Raw Material - Maize ▼]  Qty: [1000 MT]            │
│ Driver: [________]  Contact: [________]                       │
│ Remarks: [________________________]                           │
│                                                              │
│ [Create TO]  [Cancel]                                         │
└──────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
POST /api/v1/gate/on-demand-to/supplier
Body: { gate_in_id?, po_number, supplier_id, product_id, expected_quantity, driver_name, driver_contact, remarks? }
Response: { to_id, gate_in_id }

GET /api/v1/transport-orders/{to_id}/workflow
Response: { next_steps: ["scale-in", "qc-sampling", "lab-testing", "unloading"] }
```

---

## Testing Scenarios

### Happy Path
1. Gate-in with Supplier PO → On-demand Raw Material TO created
2. TO routed to scale-in, QC sampling, lab testing, unloading

### Edge Cases
1. **Invalid PO reference**: Validation error
2. **Quantity mismatch with PO**: Warning or block
3. **QC routing**: Raw material TO requires QC before unloading

---

## Dependencies

### Prerequisites
- ✅ US-063: Gate-in TO/Challan Lookup

### Enables
- → US-068: Weight Entry (scale-in)
- → US-077: Pre-QC Context Display
- → Unloading workflow

---

## Definition of Done
- [ ] On-demand TO creation from supplier PO
- [ ] Inbound workflow routing
- [ ] Unit tests > 80%
- [ ] UAT approved

---

**Story Points**: 8  
**Estimated Hours**: 64 hours  
**Sprint**: Sprint 8  
**Priority**: High
