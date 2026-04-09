---
title: Gate-Out Entry at Source POI
story_id: US-036
phase: phase-1
module: Operations (Gate Management)
priority: Critical
status: Pending
epic: Gate Management
epic_id: EPIC-011
epic_name: Gate Management
sprint: Sprint 11
story_points: 3
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../03-module-specifications/04-poi-operations/gate-management.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-035-gate-in-source.md
  - US-041-loading-operations.md
dependencies:
  - US-035-gate-in-source.md
  - US-041-loading-operations.md
tags: [operations, gate, gate-out, source, critical]
---

# US-036: Gate-Out Entry at Source POI

## User Story

**As a** Gate man  
**I want to** record gate-out after clearance so that vehicle exit is formally completed

## Business Context

Gate-Out at source confirms:
- **Loading Complete**: Vehicle loaded and ready to depart
- **Security Clearance**: All checks passed
- **Trip Continuation**: Vehicle en route to destination
- **Time Tracking**: Record departure time for transit calculation

---

## Acceptance Criteria

### AC-1: Gate-Out Entry (per PRD)
- [ ] System SHALL allow gate-out date and time entry after receiving gate clearance copy from Scaling
- [ ] Gate-out entry SHALL be allowed only after gate pass
- [ ] Gate-out time SHALL be stored against vehicle
- [ ] Gate-out SHALL be linked to QC and scaling completion
- [ ] Gate-out SHALL NOT occur before scale-out
- [ ] Gate-out SHALL be blocked if QC status is pending (for unloading flows)
- [ ] System SHALL record gate-out timestamp

### AC-3: Trip State Update
- [ ] System SHALL update trip status to "Departed from Source"
- [ ] System SHALL record departure timestamp
- [ ] System SHALL calculate loading duration

### AC-4: Notifications
- [ ] System SHALL notify:
  - Driver (departure confirmed)
  - Destination gate (vehicle en route)
  - Command Center (trip in transit)

---

## Functional Requirements

### FR-001: Gate-Out Form
- [Critical] Quick exit form
- [Critical] Pre-departure checklist
- [High] Seal number entry
- [Medium] Photo capture

### FR-002: Validation
- [Critical] Loading completion check
- [High] Document verification
- [Medium] Weight reconciliation

---

## Business Rules

### BR-GATEOUT-001: Loading Required
- Gate-out only allowed if loading completed
- **Enforcement**: Status check

### BR-GATEOUT-002: Departure After Arrival
- Gate-out time must be > gate-in time
- **Enforcement**: Timestamp validation

---

## Data Model

```typescript
// Uses same GateEntry model with entry_type = 'Gate_Out'
GateEntry {
  // ... existing fields ...
  
  loaded_quantity: Decimal (nullable, for gate-out)
  seal_number: String (nullable)
  pre_departure_checks_completed: Boolean
}
```

---

## UI/UX Requirements

```
┌─────────────────────────────────────────┐
│ Gate-Out Entry - Source                 │
├─────────────────────────────────────────┤
│ Trip: TRIP-20260211-0042                │
│ Vehicle: DM-11-1234                     │
│                                         │
│ Pre-Departure Checklist:                │
│ ✅ Loading Completed                    │
│ ✅ Scaling Done (500 KG)                │
│ ✅ Documents Attached                   │
│                                         │
│ Loaded Quantity: 500 KG ✅              │
│                                         │
│ Seal Number: (if applicable)            │
│ [SEAL-123456]                           │
│                                         │
│ Departure Time: [09:45 AM]              │
│ Loading Duration: 30 minutes            │
│                                         │
│ [Cancel]              [Record Gate-Out] │
└─────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
POST /api/v1/gate-entries/gate-out
Body: {
  trip_id, departure_time, loaded_quantity,
  seal_number?, odometer_reading?
}
```

---

## Testing Scenarios

### Happy Path
1. Loading complete → Gate-out form shown
2. Checks passed → Gate-out recorded
3. Trip status updated → Notifications sent

### Edge Cases
1. **Loading not complete**: Gate-out blocked
2. **Missing documents**: Warning, allow override with approval

---

## Dependencies

### Prerequisites
- ✅ US-035: Gate-In at Source
- ✅ US-041: Loading Operations

### Enables
- → US-037: Gate-In at Destination

---

## Definition of Done
- [ ] Gate-out form functional
- [ ] Pre-departure checks working
- [ ] Trip status update
- [ ] Notifications sent
- [ ] Unit tests > 85%
- [ ] UAT approved

---

**Story Points**: 3  
**Estimated Hours**: 24 hours  
**Sprint**: Sprint 11  
**Priority**: Critical

