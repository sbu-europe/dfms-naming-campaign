---
title: On Demand Third Party TO Creation against DO copy for Dealer Entry
story_id: US-064
phase: phase-1
module: Gate Management
priority: High
status: Pending
epic: Gate Management
epic_id: EPIC-011
epic_name: Gate Management
sprint: Sprint 9
story_points: 8
created: 2026-02-23
updated: 2026-02-23
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../../source-documents/04-wbs/stories-table.md
  - ../../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-063-gate-in-challan-lookup.md
  - US-065-on-demand-to-supplier-entry.md
  - US-036-gate-out-source.md
dependencies:
  - US-063-gate-in-challan-lookup.md
tags: [gate, to-creation, dealer, high-priority]
---

# US-064: On Demand Third Party TO Creation against DO copy for Dealer Entry

## User Story

**As a** Gate man  
**I want to** create an on-demand Transport Order (TO) when a dealer vehicle arrives with a DO copy  
**So that** finished goods can proceed even if a TO was not pre-created

## Business Context

When a dealer vehicle arrives at gate with a Delivery Order (DO) for finished goods pickup, the gate man can create an on-demand TO to enable the workflow. The system must:
- Generate on-demand Finished Goods Transport Order (TO)
- Auto-create unique TO ID linked to gate-in record
- Tag TO with Source = Gate and Transfer Type = Dealer Outbound – Finished Goods
- Route to scaling, QC, and loading workflows

---

## Acceptance Criteria

### AC-1: On-Demand TO Creation
- [ ] System SHALL allow gate-in with Document Category = Dealer (DO)
- [ ] System SHALL capture DO Number, Dealer Name, Finished Goods product, Planned Quantity
- [ ] System SHALL capture driver name and contact details, optional remarks
- [ ] System SHALL generate on-demand Finished Goods TO upon submission

### AC-2: TO Tagging
- [ ] System SHALL auto-create unique TO ID linked to gate-in record
- [ ] System SHALL tag TO with Source = Gate and Transfer Type = Dealer Outbound – Finished Goods
- [ ] System SHALL route TO to downstream workflows (scale-in, QC, loading)

### AC-3: Validation
- [ ] System SHALL validate DO reference and dealer details
- [ ] System SHALL validate product and quantity against DO

---

## Functional Requirements

### FR-001: On-Demand TO
- [Critical] Generate TO from gate-in with DO
- [Critical] Link to gate-in record
- [High] Route to operational workflows

---

## Business Rules

### BR-GATE-003: Dealer DO Gate-in
- Document Category = Dealer (DO) triggers on-demand TO creation
- **Enforcement**: Gate-in workflow

### BR-GATE-004: TO Source Tag
- TO created at gate tagged with Source = Gate
- **Enforcement**: TO creation logic

---

## Data Model

```typescript
TransportOrder {
  // ... existing fields ...
  source: Enum (Planner, Gate)
  transfer_type: string  // "Dealer Outbound – Finished Goods"
  gate_in_id: UUID (nullable, FK)
}

GateInDealerDO {
  gate_in_id: UUID
  do_number: string
  dealer_name: string
  product_id: UUID
  planned_quantity: Decimal
  driver_name: string
  driver_contact: string
  remarks: string (nullable)
}
```

---

## UI/UX Requirements

### On-Demand TO Entry (Dealer DO)
```
┌──────────────────────────────────────────────────────────────┐
│ On-Demand TO – Dealer Entry                                   │
├──────────────────────────────────────────────────────────────┤
│ Document Category: Dealer (DO)                               │
│ DO Number: [DO-2026-001__]  Dealer: [ABC Traders ▼]           │
│ Product: [Finished Goods - Maize ▼]  Qty: [500 MT]            │
│ Driver: [________]  Contact: [________]                       │
│ Remarks: [________________________]                           │
│                                                              │
│ [Create TO]  [Cancel]                                         │
└──────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
POST /api/v1/gate/on-demand-to/dealer
Body: { gate_in_id?, do_number, dealer_id, product_id, planned_quantity, driver_name, driver_contact, remarks? }
Response: { to_id, gate_in_id }

GET /api/v1/transport-orders/{to_id}
Response: { to_id, source: "Gate", transfer_type, ... }
```

---

## Testing Scenarios

### Happy Path
1. Gate-in with Dealer DO → On-demand TO created
2. TO tagged Source=Gate, Transfer Type=Dealer Outbound – Finished Goods

### Edge Cases
1. **Invalid DO reference**: Validation error
2. **Quantity mismatch with DO**: Warning or block
3. **Downstream routing**: TO available for scale-in, QC, loading

---

## Dependencies

### Prerequisites
- ✅ US-063: Gate-in TO/Challan Lookup

### Enables
- → Scaling workflow
- → Loading workflow for dealer outbound

---

## Definition of Done
- [ ] On-demand TO creation from dealer DO
- [ ] TO tagging and routing
- [ ] Unit tests > 80%
- [ ] UAT approved

---

**Story Points**: 8  
**Estimated Hours**: 64 hours  
**Sprint**: Sprint 8  
**Priority**: High
