---
title: Weight Entry
story_id: US-068
phase: phase-1
module: Scaling / Weight Management
priority: Critical
status: Pending
epic: Scaling / Weight Management
epic_id: EPIC-012
epic_name: Scaling / Weight Management
sprint: Sprint 10
story_points: 8
created: 2026-02-23
updated: 2026-02-23
source_documents:
  - ../../../../01-source/01-prd/DFMS_Product_Requirements_Document_v3.md
  - ../../../../source-documents/04-wbs/stories-table.md
  - ../../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-063-gate-in-challan-lookup.md
  - US-069-queue-token-generation.md
  - US-070-weight-exit.md
  - US-071-view-all-waiting-vehicles.md
dependencies:
  - US-063-gate-in-challan-lookup.md
tags: [scaling, weight, scale-in, critical]
---

# US-068: Weight Entry

## User Story

**As a** Scaling Operator  
**I want to** record vehicle weight  
**So that** accurate load calculations can be made

## Business Context

Scale-in (weight entry) is performed after gate-in. The system must:
- Require vehicle number
- Allow manual scale-in weight entry only after gate-in
- Capture Weight ID, Material Name and Code, Challan Number, Gross Weight, Scale-in Date & Time
- Support discrepancy remarks if required
- Store all scale-in details with operator ID and timestamp
- Notify Command Center upon successful scale-in completion
- Prevent multiple scale-in for same vehicle/trip without scale-out

---

## Acceptance Criteria

### AC-1: Scale-in Entry
- [ ] System SHALL require vehicle number as mandatory
- [ ] System SHALL allow scale-in only after gate-in is completed
- [ ] System SHALL capture Weight ID, Material Name and Code, Challan Number
- [ ] System SHALL capture Gross Weight and Scale-in Date & Time
- [ ] System SHALL allow optional discrepancy remarks

### AC-2: Validation & Storage
- [ ] System SHALL store all scale-in details with operator ID and timestamp
- [ ] System SHALL validate vehicle has completed gate-in
- [ ] System SHALL prevent duplicate scale-in for same vehicle/trip without scale-out

### AC-3: Command Center Notification
- [ ] System SHALL notify Command Center upon successful scale-in completion
- [ ] System SHALL make vehicle available for queue token generation (US-069)

---

## Functional Requirements

### FR-001: Scale-in Module
- [Critical] Manual scale-in weight entry
- [Critical] Gate-in prerequisite validation
- [Critical] Command Center notification

### FR-002: Integration
- [Critical] Link to gate-in (US-063)
- [Critical] Enable queue token (US-069)
- [High] Link to Command Center (US-071)

---

## Business Rules

### BR-SCALE-001: Gate-in Prerequisite
- Scale-in allowed only after gate-in
- **Enforcement**: Workflow validation

### BR-SCALE-002: Single Scale-in
- One scale-in per vehicle/trip before scale-out
- **Enforcement**: State validation

---

## Data Model

```typescript
ScaleInRecord {
  scale_in_id: UUID
  vehicle_number: string
  weight_id: string
  material_id: UUID
  material_code: string
  challan_number: string
  gross_weight: Decimal
  scale_in_at: DateTime
  discrepancy_remarks: string (nullable)
  operator_id: UUID
  gate_in_id: UUID
  created_at: DateTime
}
```

---

## UI/UX Requirements

### Scale-in Entry Form
```
┌──────────────────────────────────────────────────────────────┐
│ Scale-in (Weight Entry)                                       │
├──────────────────────────────────────────────────────────────┤
│ Vehicle Number*: [DHK-1234________] (from gate-in)             │
│ Weight ID: [W-001__]  Material: [Maize ▼]  Code: [MZ-001]     │
│ Challan Number: [CH-2026-001__]                              │
│ Gross Weight (kg): [________]                                 │
│ Scale-in Date & Time: [2026-02-23 11:00]                     │
│ Discrepancy Remarks: [________________________]              │
│                                                              │
│ [Submit]  [Cancel]                                            │
└──────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
POST /api/v1/scaling/scale-in
Body: { vehicle_number, weight_id, material_id, challan_number, gross_weight, scale_in_at, discrepancy_remarks? }
Response: { scale_in_id }

GET /api/v1/scaling/scale-in/validate
Query: vehicle_number
Response: { gate_in_complete: boolean, duplicate_scale_in: boolean }

POST /api/v1/scaling/scale-in/{scale_in_id}/notify-command-center
Response: { success }
```

---

## Testing Scenarios

### Happy Path
1. Vehicle gate-in complete → Scale-in form enabled → Entry saved → Command Center notified
2. Vehicle available for queue token (US-069)

### Edge Cases
1. **No gate-in**: Scale-in blocked
2. **Duplicate scale-in without scale-out**: Validation error
3. **Discrepancy remarks**: Optional, stored with record

---

## Dependencies

### Prerequisites
- ✅ US-063: Gate-in TO/Challan Lookup

### Enables
- → US-069: Queue Token Generation
- → US-070: Weight Exit (scale-out)
- → US-071: View All Waiting Vehicles

---

## Definition of Done
- [ ] Scale-in entry form
- [ ] Gate-in validation
- [ ] Command Center notification
- [ ] Unit tests > 80%
- [ ] UAT approved

---

**Story Points**: 8  
**Estimated Hours**: 64 hours  
**Sprint**: Sprint 9  
**Priority**: Critical
