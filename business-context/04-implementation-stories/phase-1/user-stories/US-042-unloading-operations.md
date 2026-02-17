---
title: Unloading Operations Management
story_id: US-042
phase: phase-1
module: Operations (Loading/Unloading)
priority: Critical
status: Pending
epic: Unloading Operations
sprint: Sprint 13
story_points: 5
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../source-documents/requirements/PRD_DFMS_v1.0.docx
related_stories:
  - US-041-loading-operations.md
  - US-040-scaling-destination.md
  - US-044-qc-lab-testing.md
dependencies:
  - US-037-gate-in-destination.md
tags: [operations, unloading, destination, critical]
---

# US-042: Unloading Operations Management

## User Story

**As an** Unloading Supervisor  
**I want to** manage and track unloading operations  
**So that** vehicles are unloaded efficiently and products are received accurately

## Business Context

Unloading management ensures:
- **Efficient Unloading**: Minimize unloading time
- **Accurate Receipt**: Verify received quantity
- **Product Inspection**: Check product condition
- **QC Trigger**: Initiate quality control if needed
- **Documentation**: Record unloading details

---

## Acceptance Criteria

### AC-1: Unloading Assignment
- [ ] System SHALL display unloading queue
- [ ] System SHALL allow assigning unloaders to vehicle
- [ ] System SHALL record unloading start time

### AC-2: Unloading Progress Tracking
- [ ] System SHALL track unloading status:
  - Waiting
  - Unloading Started
  - Unloading In Progress
  - Unloading Paused
  - Unloading Completed
- [ ] System SHALL record:
  - Start time
  - End time
  - Unloading duration
  - Unloaders assigned
  - Unloaded quantity
  - Product condition

### AC-3: Product Inspection
- [ ] System SHALL allow recording product condition:
  - Good
  - Damaged
  - Partially Damaged
- [ ] System SHALL capture damage details (if any)
- [ ] System SHALL trigger QC if damage detected

### AC-4: Unloading Completion
- [ ] System SHALL update trip status to "Unloaded"
- [ ] System SHALL validate unloaded quantity
- [ ] System SHALL allow POD capture
- [ ] System SHALL allow gate-out

---

## Functional Requirements

### FR-001: Unloading Interface
- [Critical] Unloading queue display
- [Critical] Status tracking
- [High] Unloader assignment
- [High] Product inspection form

### FR-002: QC Integration
- [Critical] Damage detection
- [High] Auto-trigger QC
- [Medium] QC workflow integration

---

## Business Rules

### BR-UNLOAD-001: Unloading Sequence
- Unloading can only start after gate-in at destination
- **Enforcement**: Status check

### BR-UNLOAD-002: QC Trigger
- QC triggered if damage detected or weight variance > 5%
- **Enforcement**: Automated workflow

---

## Data Model

```typescript
UnloadingRecord {
  id: UUID (PK)
  trip_id: UUID (FK)
  poi_id: UUID (FK)
  
  status: Enum (Waiting, Started, In_Progress, Paused, Completed)
  
  assigned_unloaders: JSON (array of unloader IDs)
  
  unloading_started_at: Timestamp (nullable)
  unloading_completed_at: Timestamp (nullable)
  unloading_duration_minutes: Integer (computed)
  
  expected_quantity_kg: Decimal
  unloaded_quantity_kg: Decimal
  
  product_condition: Enum (Good, Damaged, Partially_Damaged)
  damage_details: Text (nullable)
  damage_photos: JSON (nullable)
  
  qc_triggered: Boolean
  qc_required: Boolean
  
  supervisor_id: UUID (FK to User)
  created_at: Timestamp
}
```

---

## UI/UX Requirements

```
┌─────────────────────────────────────────┐
│ Unloading Operations                    │
├─────────────────────────────────────────┤
│ Trip: TRIP-20260211-0042                │
│ Product: Live Broiler (515 KG)          │
│                                         │
│ Status: 🟢 Unloading In Progress        │
│ Started: 11:35 AM                       │
│ Duration: 20 minutes                    │
│                                         │
│ Assigned Unloaders:                     │
│ • Unloader 1: Rahim                     │
│ • Unloader 2: Karim                     │
│                                         │
│ Unloaded Quantity: [515] KG ✅          │
│ Expected: 515 KG                        │
│                                         │
│ Product Condition: *                    │
│ ⚪ Good  ⚪ Damaged  ⚪ Partially Damaged │
│                                         │
│ [Pause] [Complete Unloading]            │
└─────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
POST /api/v1/unloading-records/start
Body: {trip_id, poi_id, assigned_unloaders}

PATCH /api/v1/unloading-records/{unloading_record_id}/complete
Body: {
  unloaded_quantity_kg, product_condition,
  damage_details?, damage_photos?
}
Response: {unloading_record, qc_triggered}
```

---

## Testing Scenarios

### Happy Path
1. Vehicle in queue → Assign unloaders
2. Start unloading → Status updated
3. Complete unloading → Trip status = "Unloaded"

### Edge Cases
1. **Damage detected**: QC triggered
2. **Quantity mismatch**: QC triggered

---

## Dependencies

### Prerequisites
- ✅ US-037: Gate-In at Destination

### Enables
- → US-044: QC Lab Testing (if triggered)
- → US-025: Trip Closure with POD
- → US-038: Gate-Out at Destination

---

## Definition of Done
- [ ] Unloading queue functional
- [ ] Status tracking working
- [ ] Product inspection form
- [ ] QC trigger automation
- [ ] Completion workflow
- [ ] Unit tests > 85%
- [ ] UAT approved

---

**Story Points**: 5  
**Estimated Hours**: 40 hours  
**Sprint**: Sprint 13  
**Priority**: Critical

