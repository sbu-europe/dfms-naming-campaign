---
title: Remarks Logging
story_id: US-067
phase: phase-1
module: Gate Management
priority: High
status: Pending
epic: Gate Management
epic_id: EPIC-011
epic_name: Gate Management
sprint: Sprint 8
story_points: 3
created: 2026-02-23
updated: 2026-02-23
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../../source-documents/04-wbs/stories-table.md
  - ../../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-066-gate-out-entry.md
  - US-063-gate-in-challan-lookup.md
dependencies:
  - US-066-gate-out-entry.md
tags: [gate, operations, remarks, high-priority]
---

# US-067: Remarks Logging

## User Story

**As a** Gate man  
**I want to** log discrepancies  
**So that** exceptions are traceable

## Business Context

During gate-out (or gate-in), the gate man may need to record discrepancies or remarks. The system must:
- Allow capturing and storing discrepancy or remarks with the gate-out record
- Associate remarks with the relevant vehicle and trip/TO
- Timestamp the entry
- Log the action in the audit trail with user details

---

## Acceptance Criteria

### AC-1: Remarks Capture
- [ ] System SHALL allow capturing discrepancy or remarks during gate-out entry
- [ ] System SHALL store remarks with the gate-out record
- [ ] System SHALL associate remarks with vehicle and trip/TO

### AC-2: Audit Trail
- [ ] System SHALL timestamp the remarks entry
- [ ] System SHALL log the action in the audit trail with user ID and details
- [ ] System SHALL support optional remarks at gate-in where applicable

### AC-3: Display
- [ ] System SHALL display remarks in gate record history
- [ ] System SHALL support filtering/search by remarks for exception reporting

---

## Functional Requirements

### FR-001: Remarks Module
- [Critical] Capture remarks during gate-out
- [High] Audit trail and timestamp
- [Medium] Exception reporting

---

## Business Rules

### BR-GATE-010: Remarks Association
- Remarks linked to gate-out record, vehicle, and trip/TO
- **Enforcement**: Data model

### BR-GATE-011: Audit Logging
- All remarks entries logged with user and timestamp
- **Enforcement**: Audit service

---

## Data Model

```typescript
GateRemarks {
  remarks_id: UUID
  gate_out_id: UUID (nullable)
  gate_in_id: UUID (nullable)
  vehicle_number: string
  trip_id: UUID (nullable)
  remarks_text: string
  remarks_type: Enum (discrepancy, general)
  created_by: UUID
  created_at: DateTime
}
```

---

## UI/UX Requirements

### Remarks Capture (during Gate-Out)
```
┌─────────────────────────────────────────┐
│ Add Remarks                               │
├─────────────────────────────────────────┤
│ Type: [Discrepancy ▼] [General]           │
│ Remarks: [________________________]       │
│         [________________________]       │
│                                         │
│ [Save]  [Cancel]                         │
└─────────────────────────────────────────┘
```

### Remarks History
- Display remarks in gate record detail view
- Filter/search by remarks for exception reporting

---

## API Endpoints

```typescript
POST /api/v1/gate/remarks
Body: { gate_out_id?, gate_in_id?, vehicle_number, trip_id?, remarks_text, remarks_type }
Response: { remarks_id }

GET /api/v1/gate/remarks
Query: vehicle_number?, trip_id?, date_from, date_to
Response: { remarks: GateRemarks[] }
```

---

## Testing Scenarios

### Happy Path
1. Gate man adds discrepancy remark during gate-out → Saved with timestamp
2. Remarks displayed in gate record history

### Edge Cases
1. **Optional remarks at gate-in**: Allowed where applicable
2. **Filter by remarks**: Exception report returns matching records

---

## Dependencies

### Prerequisites
- ✅ US-066: Gate-Out Entry

### Enables
- Exception reporting
- Compliance and audit

---

## Definition of Done
- [ ] Remarks capture during gate-out
- [ ] Audit trail
- [ ] Unit tests > 80%
- [ ] UAT approved

---

**Story Points**: 3  
**Estimated Hours**: 24 hours  
**Sprint**: Sprint 8  
**Priority**: High
