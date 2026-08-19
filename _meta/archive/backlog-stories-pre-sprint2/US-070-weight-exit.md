---
title: Weight Exit
story_id: US-070
phase: phase-1
module: Scaling / Weight Management
priority: Critical
status: Pending
epic: Scaling / Weight Management
epic_id: EPIC-012
epic_name: Scaling / Weight Management
sprint: Sprint 11
story_points: 8
created: 2026-02-23
updated: 2026-02-23
source_documents:
  - ../../../../01-source/01-prd/DFMS_Product_Requirements_Document_v3.md
  - ../../../../source-documents/04-wbs/stories-table.md
  - ../../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-068-weight-entry.md
  - US-066-gate-out-entry.md
  - US-075-load-start-end-time-entry.md
  - US-076-unload-start-end-time-entry.md
dependencies:
  - US-068-weight-entry.md
tags: [scaling, weight, scale-out, critical]
---

# US-070: Weight Exit

## User Story

**As a** Scaling Operator  
**I want to** record scale-out weight to calculate net load  
**So that** accurate load quantities are determined and gate pass can be issued

## Business Context

Scale-out (weight exit) is performed after loading or unloading. The system must:
- Store scale-out weight
- Automatically calculate net weight based on scale-in and scale-out readings
- Generate printable gate pass token with delivery note (Vehicle Number, Item Name, P.C. Code)
- Allow discrepancy remarks (quantity mismatch, driver mismatch)
- Log all scale-out and gate pass generation actions
- Enable gate-out (US-066) after scale-out completion

---

## Acceptance Criteria

### AC-1: Scale-out Entry
- [ ] System SHALL allow scale-out only for vehicles that completed scale-in and loading/unloading
- [ ] System SHALL capture scale-out weight
- [ ] System SHALL capture scale-out date and time
- [ ] System SHALL allow optional discrepancy remarks (quantity mismatch, driver mismatch)

### AC-2: Net Weight Calculation
- [ ] System SHALL automatically calculate net weight based on scale-in and scale-out readings
- [ ] System SHALL store net weight with scale-out record
- [ ] System SHALL validate scale-out against scale-in (gross vs tare logic as applicable)

### AC-3: Gate Pass Generation
- [ ] System SHALL generate printable gate pass token upon successful scale-out
- [ ] System SHALL include Vehicle Number, Item Name, and P.C. Code on gate pass
- [ ] System SHALL include delivery note details
- [ ] System SHALL enable gate-out (US-066) after gate pass generation

### AC-4: Audit Trail
- [ ] System SHALL log all scale-out and gate pass generation actions with operator ID and timestamp

---

## Functional Requirements

### FR-001: Scale-out Module
- [Critical] Scale-out weight entry
- [Critical] Net weight calculation
- [Critical] Gate pass generation

### FR-002: Integration
- [Critical] Link to scale-in (US-068)
- [Critical] Enable gate-out (US-066)
- [High] Link to loading/unloading (US-075, US-076)

---

## Business Rules

### BR-SCALE-005: Scale-out Prerequisite
- Scale-out requires completed scale-in and loading/unloading
- **Enforcement**: Workflow validation

### BR-SCALE-006: Net Weight
- Net weight = Gross (scale-in) - Tare (scale-out) or equivalent based on flow type
- **Enforcement**: Calculation logic

### BR-SCALE-007: Gate Pass
- Gate pass generated on successful scale-out
- Gate-out requires valid gate pass
- **Enforcement**: Workflow

---

## Data Model

```typescript
ScaleOutRecord {
  scale_out_id: UUID
  scale_in_id: UUID
  vehicle_number: string
  weight_id: string
  scale_out_weight: Decimal
  net_weight: Decimal
  scale_out_at: DateTime
  discrepancy_remarks: string (nullable)
  operator_id: UUID
  created_at: DateTime
}

GatePass {
  gate_pass_id: UUID
  scale_out_id: UUID
  vehicle_number: string
  item_name: string
  pc_code: string
  net_weight: Decimal
  generated_at: DateTime
}
```

---

## UI/UX Requirements

### Scale-out Entry Form
```
┌──────────────────────────────────────────────────────────────┐
│ Scale-out (Weight Exit)                                        │
├──────────────────────────────────────────────────────────────┤
│ Vehicle: [DHK-1234] (from scale-in)  P.C. Code: PC-001        │
│ Scale-out Weight (kg): [________]                             │
│ Net Weight (auto): [________] kg                              │
│ Scale-out Date & Time: [2026-02-23 14:00]                     │
│ Discrepancy: [________________________]                      │
│                                                              │
│ [Submit & Generate Gate Pass]  [Cancel]                       │
└──────────────────────────────────────────────────────────────┘
```

### Gate Pass Print
- Vehicle Number, Item Name, P.C. Code, Delivery note details

---

## API Endpoints

```typescript
POST /api/v1/scaling/scale-out
Body: { scale_in_id, vehicle_number, scale_out_weight, scale_out_at, discrepancy_remarks? }
Response: { scale_out_id, gate_pass_id, net_weight }

GET /api/v1/scaling/scale-out/validate
Query: vehicle_number
Response: { scale_in_complete: boolean, load_unload_complete: boolean }

GET /api/v1/scaling/gate-pass/{gate_pass_id}
Response: { gate_pass_id, vehicle_number, item_name, pc_code, net_weight }
```

---

## Testing Scenarios

### Happy Path
1. Scale-in + load/unload complete → Scale-out allowed → Net weight calculated → Gate pass generated
2. Gate pass enables gate-out (US-066)

### Edge Cases
1. **Scale-in not complete**: Scale-out blocked
2. **Load/unload not complete**: Scale-out blocked
3. **Net weight calculation**: Gross - Tare (or equivalent logic)
4. **Discrepancy remarks**: Optional, stored with record

---

## Dependencies

### Prerequisites
- ✅ US-068: Weight Entry (scale-in)
- ✅ US-075 or US-076: Load/Unload completion

### Enables
- → US-066: Gate-Out Entry (gate pass prerequisite)

---

## Definition of Done
- [ ] Scale-out entry
- [ ] Net weight calculation
- [ ] Gate pass generation and printing
- [ ] Unit tests > 80%
- [ ] UAT approved

---

**Story Points**: 8  
**Estimated Hours**: 64 hours  
**Sprint**: Sprint 9  
**Priority**: Critical
