---
title: Trip Lifecycle Management (12 States, Sub-states)
story_id: US-021
phase: phase-1
module: Transport Management
priority: Critical
status: Pending
epic: Transport Order (TO) Management
epic_id: EPIC-009
epic_name: Transport Order (TO) Management
sprint: Sprint 6
story_points: 13
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../05-modules/03-operations/trip-management.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-020-to-execution-own-fleet.md
  - US-025-trip-closure-pod.md
  - US-052-driver-mobile-interface.md
dependencies:
  - US-020-to-execution-own-fleet.md
tags: [transport, trip, lifecycle, state-machine, critical]
---

# US-021: Trip Lifecycle Management (12 States, Sub-states)

## User Story

**As a** Command Center Operator / TDO  
**I want to** track trip progress through its complete lifecycle with detailed state transitions  
**So that** I have real-time visibility into transport execution and can intervene when needed

## Business Context

Trip lifecycle is the **core workflow** of DFMS. Every transport execution goes through multiple states from dispatch to completion. Proper state management enables:
- **Real-time Tracking**: Know exactly where each trip is
- **Exception Handling**: Identify and resolve issues quickly
- **Performance Metrics**: Calculate on-time delivery, delays
- **Audit Trail**: Complete history of trip execution

**Trip Lifecycle** (12 Main States):
```
1. Planned → 2. Dispatched → 3. In Transit → 4. Arrived at Source → 
5. Loading → 6. Loaded → 7. Departed → 8. In Transit to Destination → 
9. Arrived at Destination → 10. Unloading → 11. Unloaded → 12. Completed
```

**Additional States**: Incident, Delayed, Cancelled

---

## Acceptance Criteria

### AC-1: Trip State Machine
- [ ] System SHALL implement trip state machine with 12 main states
- [ ] System SHALL enforce valid state transitions
- [ ] System SHALL prevent invalid state jumps
- [ ] System SHALL timestamp each state change
- [ ] System SHALL record who triggered each state change

### AC-2: Main Trip States

#### State 1: Planned
- [ ] Initial state when TO assigned to vehicle/driver
- [ ] Can transition to: Dispatched, Cancelled

#### State 2: Dispatched
- [ ] Driver notified, trip started
- [ ] GPS tracking begins
- [ ] Can transition to: In Transit, Cancelled

#### State 3: In Transit (to Source)
- [ ] Driver en route to pickup location
- [ ] GPS tracking active
- [ ] Can transition to: Arrived at Source, Incident, Delayed

#### State 4: Arrived at Source
- [ ] Driver reached source POI (geofence detection)
- [ ] Gate-in entry triggered
- [ ] Can transition to: Loading, Departed (if pre-loaded)

#### State 5: Loading
- [ ] Loading in progress at source
- [ ] Can transition to: Loaded, Incident

#### State 6: Loaded
- [ ] Loading complete, goods loaded
- [ ] Weight recorded (if applicable)
- [ ] Can transition to: Departed

#### State 7: Departed (from Source)
- [ ] Vehicle left source location
- [ ] Gate-out entry triggered
- [ ] Can transition to: In Transit to Destination

#### State 8: In Transit (to Destination)
- [ ] Driver en route to delivery location
- [ ] GPS tracking active
- [ ] Can transition to: Arrived at Destination, Incident, Delayed

#### State 9: Arrived at Destination
- [ ] Driver reached destination POI (geofence detection)
- [ ] Gate-in entry triggered
- [ ] Can transition to: Unloading

#### State 10: Unloading
- [ ] Unloading in progress at destination
- [ ] Can transition to: Unloaded, Incident

#### State 11: Unloaded
- [ ] Unloading complete, goods delivered
- [ ] Weight recorded (if applicable)
- [ ] QC may be triggered
- [ ] Can transition to: Completed (if QC pass or not required)

#### State 12: Completed
- [ ] Trip successfully completed
- [ ] POD captured
- [ ] Final state (terminal)

### AC-3: Sub-states
- [ ] System SHALL support sub-states within main states:
  - Loading: {Started, In Progress, Paused, Completed}
  - Unloading: {Started, In Progress, Paused, Completed}
  - Incident: {Reported, Under Review, Resolved}
  - Delayed: {Minor Delay, Major Delay, Critical Delay}
- [ ] System SHALL track sub-state transitions

### AC-4: Special States

#### Incident
- [ ] Can be triggered from any state (except Completed, Cancelled)
- [ ] Requires incident type and description
- [ ] Trip can resume after incident resolved
- [ ] Can transition to: Previous state, Cancelled

#### Delayed
- [ ] Auto-triggered if trip behind schedule
- [ ] Severity based on delay duration
- [ ] Can transition to: Previous state

#### Cancelled
- [ ] Can be triggered from Planned, Dispatched, In Transit
- [ ] Requires cancellation reason
- [ ] Final state (terminal)
- [ ] Releases vehicle/driver

### AC-5: State Transition Triggers
- [ ] System SHALL support multiple trigger types:
  - Manual (by user)
  - Automatic (geofence, time-based)
  - API (from mobile-responsive web interface, GPS device)
  - Event-based (gate entry, QC completion)

### AC-6: State History & Audit
- [ ] System SHALL maintain complete state history
- [ ] System SHALL record for each transition:
  - From state
  - To state
  - Timestamp
  - Triggered by (user/system)
  - Trigger type (manual/auto/api)
  - GPS location (if available)
  - Comments/notes
- [ ] System SHALL display state timeline on trip detail page

### AC-7: Notifications on State Change
- [ ] System SHALL send notifications on key state changes:
  - Dispatched → Driver, TDO
  - Arrived at Source → Gate Operator, Loader
  - Departed → Command Center
  - Arrived at Destination → Gate Operator, Unloader, QC
  - Incident → TDO, Command Center
  - Completed → All stakeholders

---

## Functional Requirements

### FR-001: State Machine Implementation
- [Critical] Finite state machine with validation
- [Critical] State transition rules engine
- [Critical] State history logging
- [High] Sub-state management

### FR-002: Geofence-based State Transitions
- [Critical] Auto-detect arrival at source/destination (geofence)
- [High] Configurable geofence radius per POI
- [Medium] GPS accuracy validation

### FR-003: Time-based State Transitions
- [High] Auto-trigger "Delayed" if behind schedule
- [High] Delay severity calculation
- [Medium] ETA recalculation

### FR-004: State Visualization
- [Critical] Trip state timeline (visual)
- [High] Current state indicator
- [High] State duration display
- [Medium] State transition animation

### FR-005: State-based Actions
- [Critical] Enable/disable actions based on state
- [High] State-specific forms (e.g., incident report in Incident state)
- [Medium] Workflow automation per state

---

## Business Rules

### BR-TRIP-001: Sequential State Progression
- States must generally progress sequentially (no skipping)
- **Exception**: Incident can be triggered from any state
- **Enforcement**: State machine validation

### BR-TRIP-002: Terminal States
- Completed and Cancelled are terminal (no further transitions)
- **Enforcement**: State machine validation

### BR-TRIP-003: Geofence Arrival Detection
- Arrival detected when GPS within geofence radius
- Default radius: 500 meters
- **Enforcement**: GPS coordinate comparison

### BR-TRIP-004: Delay Thresholds
- Minor Delay: 30-60 minutes behind schedule
- Major Delay: 1-3 hours behind schedule
- Critical Delay: > 3 hours behind schedule
- **Enforcement**: Time calculation

### BR-TRIP-005: State Transition Authority
- Some states can only be changed by specific roles
- **Enforcement**: RBAC check

---

## Data Model

```typescript
Trip {
  id: UUID (PK)
  to_id: UUID (FK)
  
  current_state: Enum (
    Planned,
    Dispatched,
    In_Transit_To_Source,
    Arrived_At_Source,
    Loading,
    Loaded,
    Departed_From_Source,
    In_Transit_To_Destination,
    Arrived_At_Destination,
    Unloading,
    Unloaded,
    Completed,
    Incident,
    Delayed,
    Cancelled
  )
  
  current_sub_state: String (nullable)
  
  // Timestamps for key states
  planned_at: Timestamp
  dispatched_at: Timestamp (nullable)
  arrived_at_source_at: Timestamp (nullable)
  loading_started_at: Timestamp (nullable)
  loading_completed_at: Timestamp (nullable)
  departed_from_source_at: Timestamp (nullable)
  arrived_at_destination_at: Timestamp (nullable)
  unloading_started_at: Timestamp (nullable)
  unloading_completed_at: Timestamp (nullable)
  completed_at: Timestamp (nullable)
  cancelled_at: Timestamp (nullable)
  
  // Metrics
  total_duration_minutes: Integer (computed)
  delay_minutes: Integer (nullable)
  delay_severity: Enum (Minor, Major, Critical) (nullable)
  
  created_at: Timestamp
  updated_at: Timestamp
}

TripStateHistory {
  id: UUID (PK)
  trip_id: UUID (FK)
  
  from_state: String
  to_state: String
  sub_state: String (nullable)
  
  transition_timestamp: Timestamp
  triggered_by_user_id: UUID (FK to User, nullable)
  trigger_type: Enum (Manual, Automatic, API, Event)
  
  gps_latitude: Decimal (nullable)
  gps_longitude: Decimal (nullable)
  
  notes: Text (nullable)
  metadata: JSON (nullable)
}
```

---

## UI/UX Requirements

### Trip State Timeline
```
┌─────────────────────────────────────────────────────────────┐
│ Trip: TRIP-20260211-0042                                    │
│ TO: TO-20260211-0042 | Driver: Rahim Ahmed                  │
│ Current State: In Transit to Destination 🚛                 │
├─────────────────────────────────────────────────────────────┤
│ Timeline:                                                   │
│                                                             │
│ ✅ Planned           Feb 11, 08:00 AM                       │
│ ✅ Dispatched        Feb 11, 08:15 AM (15 min)              │
│ ✅ In Transit        Feb 11, 08:30 AM                       │
│ ✅ Arrived at Source Feb 11, 09:00 AM (30 min)              │
│ ✅ Loading           Feb 11, 09:15 AM (15 min)              │
│ ✅ Loaded            Feb 11, 09:30 AM                       │
│ ✅ Departed          Feb 11, 09:45 AM                       │
│ 🔵 In Transit        Feb 11, 10:00 AM (Current, 45 min)     │
│ ⏹️ Arrive at Dest    Expected: 11:30 AM                     │
│ ⏹️ Unloading         Expected: 11:45 AM                     │
│ ⏹️ Completed         Expected: 12:00 PM                     │
│                                                             │
│ ETA: 11:30 AM | Status: ✅ On Time                          │
│                                                             │
│ [📍 View on Map] [⚠️ Report Incident] [📊 View Details]    │
└─────────────────────────────────────────────────────────────┘
```

### State Transition Actions
```
┌─────────────────────────────────────────┐
│ Update Trip State                       │
├─────────────────────────────────────────┤
│ Current: In Transit to Destination      │
│                                         │
│ Next State: *                           │
│ ⚪ Arrived at Destination                │
│ ⚪ Report Incident                       │
│ ⚪ Mark as Delayed                       │
│                                         │
│ GPS Location: (auto-captured)           │
│ 📍 23.8103° N, 90.4125° E               │
│                                         │
│ Notes: (optional)                       │
│ ┌─────────────────────────────────────┐ │
│ │ Arrived on time, no issues          │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Cancel]              [Update State]    │
└─────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
// Get trip with current state
GET /api/v1/trips/{trip_id}
Response: {trip, current_state, state_history}

// Update trip state
POST /api/v1/trips/{trip_id}/state
Body: {
  new_state, sub_state?,
  gps_location?, notes?
}
Response: {trip, state_updated: boolean}

// Get trip state history
GET /api/v1/trips/{trip_id}/state-history
Response: {history: TripStateHistory[]}

// Auto-detect arrival (geofence)
POST /api/v1/trips/{trip_id}/check-arrival
Body: {gps_latitude, gps_longitude}
Response: {arrived: boolean, poi: POI}

// Report incident (special state)
POST /api/v1/trips/{trip_id}/incident
Body: {incident_type, description, photos?}
Response: {trip, incident_id}
```

---

## Testing Scenarios

### Happy Path
1. Trip created → State = "Planned"
2. Driver starts → State = "Dispatched"
3. Driver arrives at source (geofence) → State = "Arrived at Source"
4. Loading complete → State = "Loaded"
5. Driver departs → State = "Departed"
6. Driver arrives at destination (geofence) → State = "Arrived at Destination"
7. Unloading complete → State = "Unloaded"
8. POD captured → State = "Completed"

### Edge Cases
1. **Incident during transit**: State = "Incident", can resume
2. **Delay detected**: Auto-trigger "Delayed" state
3. **Invalid state transition**: Error, "Cannot transition from X to Y"
4. **GPS unavailable**: Allow manual state update

---

## Dependencies

### Prerequisites
- ✅ US-020: TO Execution - Own Fleet

### Enables
- → US-022: Partial Delivery
- → US-023: Incident Management
- → US-025: Trip Closure with POD
- → US-052: Driver Mobile Interface (state updates)
- → All operations and QC stories

---

## Definition of Done
- [ ] State machine implemented
- [ ] All 12 states functional
- [ ] State transition validation working
- [ ] State history logging
- [ ] Geofence-based arrival detection
- [ ] Delay auto-detection
- [ ] State timeline UI
- [ ] Notifications on state change
- [ ] Unit tests > 90%
- [ ] State machine diagram documented
- [ ] UAT approved

---

**Story Points**: 13  
**Estimated Hours**: 104 hours  
**Sprint**: Sprint 5  
**Priority**: Critical (BLOCKER for many features)

