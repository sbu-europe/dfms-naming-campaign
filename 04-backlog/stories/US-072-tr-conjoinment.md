---
title: TR Conjoinment
story_id: US-072
phase: phase-2
module: Transport Order Management
priority: Medium
status: Pending
epic: Transport Planning Optimization
sprint: Sprint 5
story_points: 13
created: 2026-02-13
updated: 2026-02-13
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
related_stories:
  - US-020-to-execution-own-fleet.md
  - US-071-to-dispatch-planning-calendar-view.md
dependencies: []
tags: [transport-planning, conjoinment, optimization, phase-2]
---

# US-072: TR Conjoinment

## User Story

**As a** Transport Distribution Officer  
**I want to** assign a single vehicle to multiple Transport Orders when route and capacity permit  
**So that** partial deliveries can be optimized without merging or altering individual TOs

## Business Context

TR Conjoinment enables operational efficiency by:
- Assigning multiple TOs to one vehicle when route and capacity permit
- Optimizing vehicle utilization
- Reducing empty return trips
- Maintaining independent TO tracking (status, POD, QC, costing)

Each TO retains its own lifecycle and tracking while sharing vehicle resources.

## Acceptance Criteria

### Must Have (Critical)
- [ ] System SHALL allow multiple TOs to be assigned to one vehicle
- [ ] System SHALL enforce only one TO per vehicle in "In Transit" status at any time
- [ ] System SHALL require TOs to be executed sequentially (TO-1 completes before TO-2 starts)
- [ ] System SHALL show ordered sequence of TOs per vehicle
- [ ] Each TO SHALL retain its own status lifecycle
- [ ] Each TO SHALL have independent delivery confirmation (POD)
- [ ] Each TO SHALL have individual QC outcome
- [ ] System SHALL automatically transition vehicle from TO-1 to TO-2 after TO-1 completion
- [ ] System SHALL track each TO independently while using same vehicle

### Should Have (High)
- [ ] System SHOULD validate route compatibility before conjoinment
- [ ] System SHOULD validate capacity compatibility before conjoinment
- [ ] System SHOULD suggest conjoinment opportunities
- [ ] System SHOULD display execution sequence clearly

### Nice to Have (Medium)
- [ ] System MAY support conjoinment from same TR or multiple TRs
- [ ] System MAY provide conjoinment analytics

## Functional Requirements

### FR-072-001: Conjoinment Assignment
- [Critical] System SHALL allow TDO to assign multiple TOs to single vehicle
- [Critical] System SHALL validate:
  - Route compatibility (same or sequential routes)
  - Capacity compatibility (total load ≤ vehicle capacity)
  - TO status eligibility (Planned or Assigned)
- [Critical] System SHALL enforce sequential execution:
  - TO-1 must complete before TO-2 starts
  - Only one TO can be "In Transit" at a time
- [High] System SHALL suggest compatible TOs for conjoinment
- [High] System SHALL validate conjoinment feasibility before assignment

### FR-072-002: Execution Sequence
- [Critical] System SHALL maintain ordered sequence of TOs per vehicle
- [Critical] System SHALL display execution sequence:
  - TO-1 → Location 1 (first)
  - TO-2 → Location 2 (second)
  - etc.
- [Critical] System SHALL prevent TO-2 execution until TO-1 completes
- [High] System SHALL allow sequence reordering (before execution starts)
- [High] System SHALL show sequence in vehicle timeline

### FR-072-003: Independent TO Tracking
- [Critical] Each TO SHALL maintain independent:
  - Status lifecycle
  - Delivery confirmation (POD)
  - QC outcome
  - Costing
  - Trip records
- [Critical] System SHALL track TO-1 and TO-2 separately
- [Critical] System SHALL link both TOs to same vehicle and driver
- [High] System SHALL provide unified view showing all TOs for vehicle

### FR-072-004: Automatic Transition
- [Critical] System SHALL automatically transition vehicle from TO-1 to TO-2:
  - When TO-1 marked "Delivered" or "Closed"
  - Vehicle status updated to ready for TO-2
  - TO-2 status updated to "Assigned" or "Ready"
- [Critical] System SHALL notify TDO and driver about TO-2 activation
- [High] System SHALL allow manual transition override

### FR-072-005: Route & Capacity Validation
- [Critical] System SHALL validate route compatibility:
  - Source POI of TO-2 should be near destination POI of TO-1
  - Or same route/direction
- [Critical] System SHALL validate capacity:
  - Sum of TO quantities ≤ vehicle capacity
  - Consider partial loading scenarios
- [High] System SHALL calculate route efficiency (distance savings)

## Business Rules

### BR-072-001: Conjoinment Eligibility
- TOs must be from same TR or compatible routes
- TOs must have compatible capacity requirements
- TOs must be in eligible status (Planned, Assigned)
- Vehicle must have sufficient capacity

### BR-072-002: Execution Rules
- Only one TO per vehicle can be "In Transit" at any time
- TO-1 must complete (Delivered/Closed) before TO-2 starts
- Sequential execution is mandatory
- Cannot skip TO sequence

### BR-072-003: Independent Tracking
- Each TO retains its own:
  - Status
  - POD
  - QC result
  - Costing
  - Timeline
- TOs are tracked independently
- Vehicle assignment is shared

### BR-072-004: Transition Rules
- Automatic transition occurs when TO-1 completes
- Vehicle automatically available for TO-2
- TO-2 status updated automatically
- Manual override allowed with justification

## Data Model

### TO Conjoinment Entity
```yaml
TOConjoinment:
  conjoinment_id: string (unique)
  vehicle_id: string (FK)
  driver_id: string (FK)
  to_ids: array[string] (FK, ordered sequence)
  execution_sequence: integer (order: 1, 2, 3...)
  current_to_index: integer (which TO is active)
  created_by: string (FK - TDO)
  created_at: datetime
  status: string (active|completed|cancelled)
```

### TO Sequence Entity
```yaml
TOSequence:
  sequence_id: string (unique)
  conjoinment_id: string (FK)
  to_id: string (FK)
  sequence_order: integer (1, 2, 3...)
  source_poi: string
  destination_poi: string
  status: string (pending|in_transit|completed)
  started_at: datetime (optional)
  completed_at: datetime (optional)
```

## UI/UX Requirements

### Conjoinment Assignment Interface
- Vehicle selection
- Available TOs list (with route and capacity info)
- TO selection (multi-select with checkboxes)
- Route compatibility indicator
- Capacity validation display
- Execution sequence preview
- "Assign Conjoined TOs" button

### Execution Sequence View
- Vehicle timeline showing TO sequence
- Current TO highlighted
- Completed TOs marked
- Pending TOs shown
- Sequence order clearly displayed

### TO Detail View (Conjoined)
- Display conjoined TOs list
- Show current active TO
- Show execution sequence
- Link to other conjoined TOs

## API Endpoints

### POST /api/v1/transport/to/conjoin
- Create TO conjoinment
- Request body: vehicle_id, driver_id, to_ids (ordered array)
- Response: conjoinment_id, validation_result

### GET /api/v1/transport/to/conjoin/{conjoinment_id}
- Get conjoinment details
- Response: conjoinment details with TO sequence

### POST /api/v1/transport/to/conjoin/{conjoinment_id}/validate
- Validate conjoinment feasibility
- Request body: to_ids
- Response: validation_result, route_compatibility, capacity_compatibility

### PUT /api/v1/transport/to/conjoin/{conjoinment_id}/sequence
- Update execution sequence
- Request body: to_ids (reordered array)
- Response: updated sequence

## Non-Functional Requirements

- **Performance**: Conjoinment validation within 1 second
- **Reliability**: Conjoinment must maintain data consistency
- **Usability**: Clear visualization of execution sequence

## Testing Scenarios

### TC-072-001: Conjoinment Assignment
1. TDO selects vehicle
2. Selects two compatible TOs
3. System validates route and capacity
4. Assigns conjoined TOs
5. Verify conjoinment created
6. Verify execution sequence set

### TC-072-002: Sequential Execution
1. Vehicle assigned to conjoined TOs (TO-1, TO-2)
2. TO-1 starts execution
3. Attempt to start TO-2
4. Verify TO-2 blocked (TO-1 not completed)
5. Complete TO-1
6. Verify automatic transition to TO-2
7. Verify TO-2 can start

### TC-072-003: Independent Tracking
1. Conjoined TOs (TO-1, TO-2) assigned to vehicle
2. Complete TO-1 with POD and QC
3. Complete TO-2 with different POD and QC
4. Verify each TO has independent:
   - POD
   - QC result
   - Costing
   - Status

### TC-072-004: Route Validation
1. Attempt to conjoin TOs with incompatible routes
2. Verify validation error
3. Select compatible routes
4. Verify validation passes

## Dependencies

- **US-020**: TO Execution (Own Fleet) - for TO assignment
- **US-071**: TO Dispatch Planning - for calendar view integration
- **Route Planning**: For route compatibility validation

## Definition of Done

- [ ] Conjoinment assignment implemented
- [ ] Route and capacity validation implemented
- [ ] Execution sequence management implemented
- [ ] Independent TO tracking implemented
- [ ] Automatic transition implemented
- [ ] Sequence visualization implemented
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing
- [ ] Documentation updated
- [ ] Code reviewed and approved

---

**Source Documents**:
- PRD Section 6.8.4: TR Conjoinment

**Last Updated**: February 13, 2026  
**Status**: Pending Review  
**Phase**: Phase 2

