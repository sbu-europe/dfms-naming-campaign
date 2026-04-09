---
title: Helper Assignment
story_id: US-062
phase: phase-1
module: Fleet & Vehicle Management
priority: High
status: Pending
epic: Fleet & Vehicle Management
epic_id: EPIC-006
epic_name: Fleet & Vehicle Management
sprint: Sprint 4
story_points: 5
created: 2026-02-23
updated: 2026-02-23
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../../source-documents/04-wbs/stories-table.md
  - ../../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-061-helper-profile.md
  - US-057-driver-master-data.md
  - US-020-to-execution-own-fleet.md
dependencies:
  - US-061-helper-profile.md
tags: [fleet, helper, assignment, high-priority]
---

# US-062: Helper Assignment

## User Story

**As a** Transport Distribution Officer (TDO)  
**I want to** assign one or more helpers to a driver  
**So that** trips are carried out with the required supporting personnel

## Business Context

Helper assignment links helpers to drivers for specific trips. The system must:
- Support many-to-one mapping of multiple helpers to a single driver
- Ensure a helper is not assigned to conflicting active trips
- Persist helper–driver–vehicle–trip linkage
- Maintain helper assignment history per trip
- Log all assignment and change actions in the audit trail

---

## Acceptance Criteria

### AC-1: Helper Assignment
- [ ] System SHALL allow assignment of one or more helpers to a driver
- [ ] System SHALL link assignment to specific Driver, Vehicle, and Trip/Transport Order
- [ ] System SHALL support many-to-one mapping (multiple helpers to one driver)
- [ ] System SHALL prevent helper assignment to conflicting active trips

### AC-2: Assignment History
- [ ] System SHALL persist helper–driver–vehicle–trip linkage
- [ ] System SHALL maintain helper assignment history per trip
- [ ] System SHALL allow assignment across multiple trips over time

### AC-3: Audit Trail
- [ ] System SHALL log all assignment and change actions with user ID and timestamp
- [ ] System SHALL record before/after values for assignment changes

---

## Functional Requirements

### FR-001: Assignment Module
- [Critical] Helper-to-driver assignment during trip execution
- [Critical] Conflict detection for active trips
- [High] Assignment history and audit trail

---

## Business Rules

### BR-FLEET-001: Helper Conflict
- Helper cannot be assigned to two conflicting active trips simultaneously
- **Enforcement**: Assignment validation

### BR-FLEET-002: Assignment Scope
- Assignment linked to Driver, Vehicle, and Trip/TO
- **Enforcement**: Data model

---

## Data Model

```typescript
HelperAssignment {
  assignment_id: UUID
  driver_id: UUID
  helper_id: UUID
  vehicle_id: UUID
  trip_id: UUID
  assigned_by: UUID
  assigned_at: DateTime
  status: Enum (active, completed, cancelled)
}
```

---

## UI/UX Requirements

### Helper Assignment Form
```
┌─────────────────────────────────────────┐
│ Assign Helpers to Trip TO-2026-001      │
├─────────────────────────────────────────┤
│ Driver: [Ahmed Khan ▼]                  │
│ Vehicle: [DHK-1234 ▼]                   │
│                                         │
│ Helpers:                                │
│ ☑ Karim (available)                     │
│ ☑ Rahim (available)                     │
│ ☐ Sajid (assigned to TO-2026-002)       │
│                                         │
│ [Assign]  [Cancel]                      │
└─────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
POST /api/v1/trips/{trip_id}/helper-assignments
Body: { driver_id, helper_ids: UUID[] }
Response: { assignments: HelperAssignment[] }

GET /api/v1/helpers/availability
Query: trip_id, date_from, date_to
Response: { helpers: [{ helper_id, available }] }

GET /api/v1/trips/{trip_id}/helper-assignments
Response: { assignments: HelperAssignment[] }
```

---

## Testing Scenarios

### Happy Path
1. TDO assigns helpers to driver/trip → Assignment saved
2. Helper available → Assignment succeeds

### Edge Cases
1. **Helper on conflicting trip**: Validation error, assignment blocked
2. **Multiple helpers to one driver**: Many-to-one allowed
3. **Assignment change**: Audit trail records before/after

---

## Dependencies

### Prerequisites
- ✅ US-061: Helper Profile

### Enables
- → US-020: TO Execution - Own Fleet (helper assignment during execution)

---

## Definition of Done
- [ ] Helper assignment to driver/vehicle/trip
- [ ] Conflict detection
- [ ] Assignment history and audit trail
- [ ] Unit tests > 80%
- [ ] UAT approved

---

**Story Points**: 5  
**Estimated Hours**: 40 hours  
**Sprint**: Sprint 4  
**Priority**: High
