---
title: Loading Operations Management
story_id: US-041
phase: phase-1
module: Operations (Loading/Unloading)
priority: Critical
status: Pending
epic: Loading / Unloading Operations
epic_id: EPIC-013
epic_name: Loading / Unloading Operations
sprint: Sprint 13
story_points: 5
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../03-module-specifications/04-poi-operations/command-center.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-042-unloading-operations.md
  - US-039-scaling-source.md
dependencies:
  - US-035-gate-in-source.md
tags: [operations, loading, source, critical]
---

# US-041: Loading Operations Management

## User Story

**As a** Loading Operator  
**I want to** log loading start/end times, Quantity Loaded, and Seal Number so that loading operations are tracked and documented

## Business Context

Loading management ensures:
- **Efficient Loading**: Minimize loading time
- **Accurate Quantity**: Load correct quantity
- **Product Safety**: Handle products properly
- **Documentation**: Record loading details
- **Resource Tracking**: Monitor loader performance

---

## Acceptance Criteria

### AC-1: Loading Assignment
- [ ] System SHALL display loading queue
- [ ] System SHALL allow assigning loaders to vehicle
- [ ] System SHALL record loading start time

### AC-2: Loading Progress Tracking
- [ ] System SHALL track loading status:
  - Waiting
  - Loading Started
  - Loading In Progress
  - Loading Paused
  - Loading Completed
- [ ] System SHALL record:
  - Start time
  - End time
  - Loading duration
  - Loaders assigned
  - Loaded quantity
  - Product condition notes

### AC-3: Loading Completion
- [ ] System SHALL update trip status to "Loaded"
- [ ] System SHALL validate loaded quantity matches planned
- [ ] System SHALL trigger scaling (if required)
- [ ] System SHALL allow gate-out

### AC-4: Loading Documentation
- [ ] System SHALL generate loading report
- [ ] System SHALL capture photos (optional)
- [ ] System SHALL record special handling notes

---

## Functional Requirements

### FR-001: Loading Interface
- [Critical] Loading queue display
- [Critical] Loading status tracking
- [High] Loader assignment
- [High] Progress monitoring

### FR-002: Validation
- [Critical] Quantity validation
- [High] Product handling verification
- [Medium] Loading time tracking

---

## Business Rules

### BR-LOAD-001: Loading Sequence
- Loading can only start after gate-in
- **Enforcement**: Status check

### BR-LOAD-002: Quantity Validation
- Loaded quantity should match planned ± 5%
- **Enforcement**: Variance check

---

## Data Model

```typescript
LoadingRecord {
  id: UUID (PK)
  trip_id: UUID (FK)
  poi_id: UUID (FK)
  
  status: Enum (Waiting, Started, In_Progress, Paused, Completed)
  
  assigned_loaders: JSON (array of loader IDs)
  
  loading_started_at: Timestamp (nullable)
  loading_completed_at: Timestamp (nullable)
  loading_duration_minutes: Integer (computed)
  
  planned_quantity_kg: Decimal
  loaded_quantity_kg: Decimal
  
  product_condition_notes: Text (nullable)
  special_handling_notes: Text (nullable)
  photos: JSON (nullable)
  
  supervisor_id: UUID (FK to User)
  created_at: Timestamp
}
```

---

## UI/UX Requirements

```
┌─────────────────────────────────────────┐
│ Loading Operations                      │
├─────────────────────────────────────────┤
│ Trip: TRIP-20260211-0042                │
│ Product: Live Broiler (500 KG)          │
│                                         │
│ Status: 🟢 Loading In Progress          │
│ Started: 09:15 AM                       │
│ Duration: 25 minutes                    │
│                                         │
│ Assigned Loaders:                       │
│ • Loader 1: Kamal                       │
│ • Loader 2: Jamal                       │
│                                         │
│ Loaded Quantity: [500] KG ✅            │
│ Planned: 500 KG                         │
│                                         │
│ Product Condition: Good ✅              │
│                                         │
│ [Pause Loading] [Complete Loading]      │
└─────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
POST /api/v1/loading-records/start
Body: {trip_id, poi_id, assigned_loaders}

PATCH /api/v1/loading-records/{loading_record_id}/complete
Body: {loaded_quantity_kg, product_condition_notes}
```

---

## Testing Scenarios

### Happy Path
1. Vehicle in queue → Assign loaders
2. Start loading → Status updated
3. Complete loading → Trip status = "Loaded"

### Edge Cases
1. **Quantity mismatch**: Warning, allow with approval
2. **Loading paused**: Resume capability

---

## Dependencies

### Prerequisites
- ✅ US-035: Gate-In at Source

### Enables
- → US-039: Scaling at Source
- → US-036: Gate-Out at Source

---

## Definition of Done
- [ ] Loading queue functional
- [ ] Status tracking working
- [ ] Completion workflow
- [ ] Documentation generation
- [ ] Unit tests > 85%
- [ ] UAT approved

---

**Story Points**: 5  
**Estimated Hours**: 40 hours  
**Sprint**: Sprint 13  
**Priority**: Critical

