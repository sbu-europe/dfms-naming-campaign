---
title: Gate-Out Entry
story_id: US-066
phase: phase-1
module: Gate Management
priority: Critical
status: Pending
epic: Gate Management
epic_id: EPIC-011
epic_name: Gate Management
sprint: Sprint 11
story_points: 5
created: 2026-02-23
updated: 2026-02-23
source_documents:
  - ../../../../01-source/01-prd/PRD_DFMS_v1.0.md
  - ../../../../source-documents/04-wbs/stories-table.md
  - ../../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-063-gate-in-challan-lookup.md
  - US-070-weight-exit.md
  - US-067-remarks-logging.md
dependencies:
  - US-063-gate-in-challan-lookup.md
  - US-070-weight-exit.md
tags: [gate, operations, critical]
---

# US-066: Gate-Out Entry

## User Story

**As a** Gate man  
**I want to** record gate-out after clearance  
**So that** vehicle exit is formally completed

## Business Context

Gate-out is the final step before vehicle exit. The system must:
- Allow gate-out only if gate pass exists (from scaling)
- Store gate-out time against the vehicle
- Ensure record is linked to completed scaling and QC workflows
- Prevent gate-out before scale-out completion
- Block gate-out when QC status is pending for unloading flows
- Log gate-out action with timestamp, vehicle number, and user

---

## Acceptance Criteria

### AC-1: Gate-Out Entry
- [ ] System SHALL allow gate-out entry only if a gate pass exists
- [ ] System SHALL require Vehicle Registration Number
- [ ] System SHALL capture Gate-out Date & Time
- [ ] System SHALL store the gate-out time against the vehicle

### AC-2: Workflow Validation
- [ ] System SHALL ensure record is linked to completed scaling and QC workflows
- [ ] System SHALL prevent gate-out before scale-out completion
- [ ] System SHALL block gate-out when QC status is pending for unloading flows

### AC-3: Audit
- [ ] System SHALL log the gate-out action with timestamp, vehicle number, and user ID
- [ ] System SHALL support optional remarks (US-067)

---

## Functional Requirements

### FR-001: Gate-Out Module
- [Critical] Gate-out entry with gate pass validation
- [Critical] Scaling and QC workflow gates
- [High] Audit logging

### FR-002: Integration
- [Critical] Link to scale-out (US-070)
- [Critical] Link to QC status for unloading

---

## Business Rules

### BR-GATE-007: Gate Pass Required
- Gate-out allowed only if gate pass exists from scaling
- **Enforcement**: Validation

### BR-GATE-008: Scale-Out Completion
- Scale-out must be completed before gate-out
- **Enforcement**: Workflow gate

### BR-GATE-009: QC Gate (Unloading)
- For unloading flows, QC must not be pending before gate-out
- **Enforcement**: Workflow gate

---

## Data Model

```typescript
GateOutRecord {
  gate_out_id: UUID
  vehicle_number: string
  gate_pass_id: UUID
  gate_out_at: DateTime
  created_by: UUID
  remarks: string (nullable)
}
```

---

## UI/UX Requirements

### Gate-Out Entry Form
```
┌─────────────────────────────────────────┐
│ Gate-Out Entry                           │
├─────────────────────────────────────────┤
│ Vehicle Number*: [DHK-1234________]      │
│ Gate Pass: [Auto-filled from scale-out]  │
│ Gate-out Date & Time: [2026-02-23 14:00] │
│ Remarks: [________________________]     │
│                                         │
│ [Submit]  [Cancel]                       │
└─────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
POST /api/v1/gate/gate-out
Body: { vehicle_number, gate_pass_id }
Response: { gate_out_id }

GET /api/v1/gate/gate-out/validate
Query: vehicle_number
Response: { valid: boolean, gate_pass_id?, qc_pending?, scale_out_complete? }
```

---

## Testing Scenarios

### Happy Path
1. Vehicle has gate pass, scale-out complete, QC done → Gate-out allowed
2. Gate-out recorded → Trip/vehicle exit complete

### Edge Cases
1. **No gate pass**: Validation error, gate-out blocked
2. **Scale-out not complete**: Gate-out blocked
3. **QC pending (unloading)**: Gate-out blocked until QC complete

---

## Dependencies

### Prerequisites
- ✅ US-063: Gate-in TO/Challan Lookup
- ✅ US-070: Weight Exit (scale-out, gate pass)

### Enables
- Trip completion
- Vehicle exit tracking

---

## Definition of Done
- [ ] Gate-out entry with gate pass validation
- [ ] Scaling and QC workflow gates
- [ ] Audit logging
- [ ] Unit tests > 80%
- [ ] UAT approved

---

**Story Points**: 5  
**Estimated Hours**: 40 hours  
**Sprint**: Sprint 8  
**Priority**: Critical
