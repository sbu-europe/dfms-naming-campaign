---
title: Queue Token Generation
story_id: US-069
phase: phase-1
module: Scaling / Weight Management
priority: Critical
status: Pending
epic: Scaling / Weight Management
epic_id: EPIC-012
epic_name: Scaling / Weight Management
sprint: Sprint 10
story_points: 5
created: 2026-02-23
updated: 2026-02-23
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../../source-documents/04-wbs/stories-table.md
  - ../../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-068-weight-entry.md
  - US-071-view-all-waiting-vehicles.md
  - US-072-assign-loading-unloading-point.md
dependencies:
  - US-068-weight-entry.md
tags: [scaling, queue, token, critical]
---

# US-069: Queue Token Generation

## User Story

**As a** Scaling Operator  
**I want to** issue queue token  
**So that** vehicle flow can be managed efficiently

## Business Context

After successful scale-in, the system automatically generates a queue token (P.C. Code) for the vehicle. The token enables:
- Unique identification in the waiting queue
- Link to vehicle and scale-in record
- Printing for physical queue management
- Command Center assignment of loading/unloading points

---

## Acceptance Criteria

### AC-1: Token Generation
- [ ] System SHALL automatically generate unique waiting queue token (P.C. Code) upon scale-in confirmation
- [ ] System SHALL link token to Vehicle number, Item name, and P.C. Code
- [ ] System SHALL link token to vehicle and scale-in record
- [ ] System SHALL make the token immediately available for operational use

### AC-2: Token Printing
- [ ] System SHALL support printing of the token via desk printer
- [ ] System SHALL include Vehicle number, Item name, and P.C. Code on printed token

### AC-3: Audit Trail
- [ ] System SHALL log token generation and print action with operator ID, timestamp, and token reference in the audit trail

---

## Functional Requirements

### FR-001: Token Generation
- [Critical] Auto-generate token on scale-in confirmation
- [Critical] Unique P.C. Code per vehicle/scale-in
- [High] Token printing support

### FR-002: Integration
- [Critical] Link to scale-in (US-068)
- [Critical] Enable Command Center assignment (US-071, US-072)

---

## Business Rules

### BR-SCALE-003: Token Uniqueness
- Each scale-in generates unique P.C. Code
- **Enforcement**: Token generation service

### BR-SCALE-004: Scale-in Prerequisite
- Token generated only after successful scale-in
- **Enforcement**: Workflow

---

## Data Model

```typescript
QueueToken {
  token_id: UUID
  pc_code: string  // P.C. Code - unique
  vehicle_number: string
  item_name: string
  scale_in_id: UUID
  generated_at: DateTime
  printed_at: DateTime (nullable)
  printed_by: UUID (nullable)
}
```

---

## UI/UX Requirements

### Queue Token Display & Print
```
┌─────────────────────────────────────────┐
│ Queue Token Generated                     │
├─────────────────────────────────────────┤
│ P.C. Code: PC-20260223-0001               │
│ Vehicle: DHK-1234                         │
│ Item: Maize                               │
│                                         │
│ [Print Token]  [Close]                   │
└─────────────────────────────────────────┘
```

### Printed Token Layout
- Vehicle number, Item name, P.C. Code prominently displayed
- Barcode/QR for P.C. Code (optional)

---

## API Endpoints

```typescript
POST /api/v1/scaling/scale-in/{scale_in_id}/generate-token
Response: { token_id, pc_code, vehicle_number, item_name }

GET /api/v1/scaling/tokens/{token_id}
Response: { token_id, pc_code, vehicle_number, item_name }

POST /api/v1/scaling/tokens/{token_id}/print
Response: { success, printed_at }
```

---

## Testing Scenarios

### Happy Path
1. Scale-in confirmed → Token auto-generated → P.C. Code unique
2. Operator prints token → Print action logged

### Edge Cases
1. **Token before scale-in**: Generation blocked
2. **Duplicate token for same scale-in**: One token per scale-in
3. **Print audit**: Operator ID and timestamp logged

---

## Dependencies

### Prerequisites
- ✅ US-068: Weight Entry (scale-in)

### Enables
- → US-071: View All Waiting Vehicles
- → US-072: Assign Loading/Unloading Point

---

## Definition of Done
- [ ] Auto token generation on scale-in
- [ ] Token printing
- [ ] Audit logging
- [ ] Unit tests > 80%
- [ ] UAT approved

---

**Story Points**: 5  
**Estimated Hours**: 40 hours  
**Sprint**: Sprint 9  
**Priority**: Critical
