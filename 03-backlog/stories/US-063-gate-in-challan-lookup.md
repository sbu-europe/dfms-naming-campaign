---
title: Gate-in TO/Challan Lookup
story_id: US-063
phase: phase-1
module: Gate Management
priority: Critical
status: Pending
epic: Gate Management
epic_id: EPIC-011
epic_name: Gate Management
sprint: Sprint 9
story_points: 8
created: 2026-02-23
updated: 2026-02-23
source_documents:
  - ../../../../01-source/01-prd/PRD_DFMS_v1.0.md
  - ../../../../source-documents/04-wbs/stories-table.md
  - ../../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-066-gate-out-entry.md
  - US-068-weight-entry.md
  - US-064-on-demand-to-dealer-entry.md
  - US-065-on-demand-to-supplier-entry.md
dependencies: []
tags: [gate, operations, critical]
---

# US-063: Gate-in TO/Challan Lookup

## User Story

**As a** Gate man  
**I want to** register vehicle gate-in details  
**So that** all incoming vehicles are formally logged and validated before operational processing

## Business Context

Gate-in is the first step for incoming vehicles. The system must:
- Capture Vehicle Registration Number (mandatory)
- Select Document Category (Supplier PO, Internal Transfer TO/Challan, Distributor PO/DO, or Dealer DO)
- Capture Challan/TO/PO/DO number, product details and quantity (quantity nullable for empty vehicles)
- Capture Gate-in Date & Time, driver name and contact details, party name, project reference, optional remarks
- Validate and store gate-in record for downstream workflows (scaling, QC, loading/unloading)

---

## Acceptance Criteria

### AC-1: Gate-in Entry
- [ ] System SHALL require vehicle number as mandatory
- [ ] System SHALL allow gate-in date and time entry
- [ ] System SHALL support Document Category selection: Supplier PO, Internal Transfer TO/Challan, Distributor PO/DO, Dealer DO
- [ ] System SHALL capture Challan/TO/PO/DO number
- [ ] System SHALL capture product details and quantity (nullable for empty vehicles)

### AC-2: Driver & Party Details
- [ ] System SHALL capture driver name and contact details
- [ ] System SHALL capture party name and project reference
- [ ] System SHALL allow optional remarks

### AC-3: Validation & Workflow
- [ ] System SHALL validate gate-in data before submission
- [ ] System SHALL store gate-in record linked to vehicle and document
- [ ] System SHALL enable downstream workflows (scale-in, QC) upon successful gate-in

---

## Functional Requirements

### FR-001: Gate-in Module
- [Critical] Vehicle gate-in registration
- [Critical] Document category and reference capture
- [High] Driver and party details

### FR-002: Integration
- [Critical] Link to scaling workflow
- [High] Link to QC workflow for inbound material

---

## Business Rules

### BR-GATE-001: Vehicle Mandatory
- Vehicle registration number is required for gate-in
- **Enforcement**: Validation

### BR-GATE-002: Document Category
- Must select valid document category for lookup
- **Enforcement**: Dropdown validation

---

## Data Model

```typescript
GateInRecord {
  gate_in_id: UUID
  vehicle_number: string
  document_category: Enum (SupplierPO, InternalTO, DistributorPO, DealerDO)
  document_ref: string
  product_id: UUID
  quantity: Decimal (nullable)
  gate_in_at: DateTime
  driver_name: string
  driver_contact: string
  party_name: string
  project_ref: string (nullable)
  remarks: string (nullable)
  created_by: UUID
  created_at: DateTime
}
```

---

## UI/UX Requirements

### Gate-in Entry Form
```
┌──────────────────────────────────────────────────────────────┐
│ Gate-in Entry                                                │
├──────────────────────────────────────────────────────────────┤
│ Vehicle Number*: [DHK-1234________]                           │
│ Document Category: [Supplier PO ▼]                           │
│ Challan/TO/PO/DO: [PO-2026-001__]                            │
│ Product: [Maize ▼]  Quantity: [1000 MT]                      │
│ Gate-in Date & Time: [2026-02-23 10:30]                      │
│ Driver Name: [________]  Contact: [________]                  │
│ Party Name: [________]  Project: [________]                   │
│ Remarks: [________________________]                           │
│                                                              │
│ [Submit]  [Cancel]                                            │
└──────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
POST /api/v1/gate/gate-in
Body: { vehicle_number, document_category, document_ref, product_id, quantity?, ... }
Response: { gate_in_id }

GET /api/v1/gate/gate-in/{gate_in_id}
Response: { gate_in_id, vehicle_number, ... }

GET /api/v1/gate/gate-in/lookup
Query: document_category, document_ref
Response: { document_details }
```

---

## Testing Scenarios

### Happy Path
1. Gate man enters vehicle + document details → Gate-in recorded
2. Gate-in complete → Scale-in (US-068) enabled

### Edge Cases
1. **Missing vehicle number**: Validation error
2. **Invalid document ref**: Lookup fails, user must correct
3. **Empty vehicle (quantity null)**: Allowed for empty trips

---

## Dependencies

### Prerequisites
- Vehicle master data
- TO/Challan/PO/DO reference data

### Enables
- → US-066: Gate-Out Entry
- → US-068: Weight Entry (scale-in)
- → US-064: On Demand TO Creation (Dealer)
- → US-065: On Demand TO Creation (Supplier)

---

## Definition of Done
- [ ] Gate-in entry form
- [ ] Document category lookup
- [ ] Validation and storage
- [ ] Unit tests > 80%
- [ ] UAT approved

---

**Story Points**: 8  
**Estimated Hours**: 64 hours  
**Sprint**: Sprint 8  
**Priority**: Critical
