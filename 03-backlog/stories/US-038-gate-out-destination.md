---
title: Gate-Out Entry at Destination POI
story_id: US-038
phase: phase-1
module: Operations (Gate Management)
priority: High
status: Pending
epic: Gate Management
epic_id: EPIC-011
epic_name: Gate Management
sprint: Sprint 12
story_points: 3
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../01-source/01-prd/PRD_DFMS_v1.0.md
  - ../../../05-modules/04-poi-operations/gate-management.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-037-gate-in-destination.md
  - US-042-unloading-operations.md
  - US-025-trip-closure-pod.md
dependencies:
  - US-037-gate-in-destination.md
  - US-042-unloading-operations.md
tags: [operations, gate, gate-out, destination, high-priority]
---

# US-038: Gate-Out Entry at Destination POI

## User Story

**As a** Gate Operator (Destination)  
**I want to** record vehicle departure from destination location  
**So that** unloaded vehicle exit is tracked and trip can be closed

## Business Context

Gate-Out at destination confirms:
- **Unloading Complete**: Vehicle unloaded successfully
- **POD Captured**: Proof of delivery obtained
- **Trip Completion**: Ready for trip closure
- **Vehicle Release**: Vehicle can return or proceed to next assignment

---

## Acceptance Criteria

### AC-1: Gate-Out Entry
- [ ] System SHALL record gate-out with:
  - Trip ID *
  - Departure time * (auto-captured)
  - Unloaded quantity * (from unloading record)
  - POD status (Captured/Pending)
  - QC status (if applicable)
  - Odometer reading (optional)
- [ ] System SHALL validate unloading completed

### AC-2: Pre-Departure Checks
- [ ] System SHALL verify:
  - Unloading status = "Unloaded"
  - POD captured (or waiver approved)
  - QC completed (if required)
  - No pending issues
- [ ] System SHALL prevent gate-out if critical checks fail

### AC-3: Trip Completion
- [ ] System SHALL update trip status to "Completed" (if all checks passed)
- [ ] System SHALL record completion timestamp
- [ ] System SHALL calculate total trip duration
- [ ] System SHALL release vehicle and driver (status = "Available")

### AC-4: Notifications
- [ ] System SHALL notify:
  - Driver (trip completed)
  - TDO (trip closed)
  - Finance (invoice generation)
  - Command Center (trip completed)

---

## Functional Requirements

### FR-001: Gate-Out Form
- [Critical] Quick exit form
- [Critical] Completion checklist
- [High] POD verification
- [Medium] Final documentation

---

## Business Rules

### BR-DESTOUT-001: Unloading Required
- Gate-out only allowed if unloading completed
- **Enforcement**: Status check

### BR-DESTOUT-002: POD Requirement
- POD must be captured before gate-out (unless waived)
- **Enforcement**: POD status check

---

## Data Model

```typescript
// Uses same GateEntry model
GateEntry {
  // ... existing fields ...
  
  unloaded_quantity: Decimal (nullable, for gate-out)
  pod_captured: Boolean
  qc_completed: Boolean (nullable)
}
```

---

## UI/UX Requirements

```
┌─────────────────────────────────────────┐
│ Gate-Out Entry - Destination            │
├─────────────────────────────────────────┤
│ Trip: TRIP-20260211-0042                │
│ Vehicle: DM-11-1234                     │
│                                         │
│ Completion Checklist:                   │
│ ✅ Unloading Completed (500 KG)         │
│ ✅ POD Captured                         │
│ ✅ QC Passed                            │
│ ✅ No Pending Issues                    │
│                                         │
│ Departure Time: [12:15 PM]              │
│ Total Trip Duration: 3h 30min           │
│                                         │
│ ✅ All checks passed                    │
│ Trip will be marked as COMPLETED        │
│                                         │
│ [Cancel]              [Record Gate-Out] │
└─────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
POST /api/v1/gate-entries/gate-out
Body: {
  trip_id, departure_time, unloaded_quantity
}
Response: {
  gate_entry, trip_status: 'Completed',
  vehicle_released: true, driver_released: true
}
```

---

## Testing Scenarios

### Happy Path
1. Unloading complete → Gate-out form shown
2. All checks passed → Gate-out recorded
3. Trip completed → Resources released

### Edge Cases
1. **POD not captured**: Blocked or waiver required
2. **QC pending**: Warning, allow with approval

---

## Dependencies

### Prerequisites
- ✅ US-037: Gate-In at Destination
- ✅ US-042: Unloading Operations

### Enables
- → US-025: Trip Closure (final step)

---

## Definition of Done
- [ ] Gate-out form functional
- [ ] Completion checks working
- [ ] Trip closure on gate-out
- [ ] Resource release working
- [ ] Notifications sent
- [ ] Unit tests > 85%
- [ ] UAT approved

---

**Story Points**: 3  
**Estimated Hours**: 24 hours  
**Sprint**: Sprint 12  
**Priority**: High

