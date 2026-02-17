---
title: Gate-In Entry at Source POI
story_id: US-035
phase: phase-1
module: Operations (Gate Management)
priority: Critical
status: Pending
epic: Gate Operations
sprint: Sprint 11
story_points: 5
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../source-documents/requirements/PRD_DFMS_v1.0.md
  - ../../../03-prd-reference/04-operations-support/gate-management.md
related_stories:
  - US-021-trip-lifecycle.md
  - US-036-gate-out-source.md
  - US-039-scaling-source.md
dependencies:
  - US-021-trip-lifecycle.md
tags: [operations, gate, gate-in, source, critical]
---

# US-035: Gate-In Entry at Source POI

## User Story

**As a** Gate man  
**I want to** register vehicle gate-in details so that all incoming vehicles are formally logged and validated before operational processing

## Business Context

Gate-In at source marks the beginning of on-site operations:
- **Arrival Confirmation**: Vehicle reached source location
- **Security Check**: Verify vehicle and driver identity
- **Queue Management**: Track vehicles waiting for loading
- **Trip State Update**: Update trip status to "Arrived at Source"
- **Time Tracking**: Record arrival time for performance metrics

**Gate-In Process**:
```
Vehicle Arrives → Security Check → Gate-In Entry → Queue for Loading
```

---

## Acceptance Criteria

### AC-1: Gate-In Entry Form
- [ ] System SHALL allow Gate Operator to record gate-in with:
  - Trip ID or TO Number * (search/scan)
  - Vehicle registration * (auto-filled from trip)
  - Driver name * (auto-filled from trip)
  - Actual arrival time * (auto-captured, editable)
  - Odometer reading (optional)
  - Vehicle condition notes (optional)
  - Photos (optional, up to 3)
- [ ] System SHALL validate trip exists and is in correct state
- [ ] System SHALL prevent duplicate gate-in for same trip

### AC-2: Vehicle & Driver Verification
- [ ] System SHALL display expected vehicle and driver details
- [ ] System SHALL allow Gate Operator to verify:
  - Vehicle registration matches
  - Driver identity matches
  - Vehicle condition acceptable
- [ ] System SHALL flag mismatches for review
- [ ] System SHALL require supervisor approval for mismatches

### AC-3: Trip State Update
- [ ] System SHALL auto-update trip status to "Arrived at Source"
- [ ] System SHALL record gate-in timestamp
- [ ] System SHALL calculate travel time (dispatch to arrival)
- [ ] System SHALL trigger geofence arrival (if GPS available)

### AC-4: Queue Management
- [ ] System SHALL add vehicle to loading queue
- [ ] System SHALL display queue position
- [ ] System SHALL show estimated wait time
- [ ] System SHALL allow prioritizing urgent trips

### AC-5: Notifications
- [ ] System SHALL notify:
  - Loading Supervisor (vehicle ready for loading)
  - Command Center (arrival confirmed)
  - Driver (via mobile-responsive web interface - queue position)
- [ ] System SHALL send alerts for delayed arrivals

### AC-6: Gate-In History
- [ ] System SHALL maintain gate-in history
- [ ] System SHALL display recent gate-ins
- [ ] System SHALL allow searching gate-in records

---

## Functional Requirements

### FR-001: Gate-In Interface
- [Critical] Quick entry form (optimized for speed)
- [Critical] Trip search by TO number, vehicle registration, or QR scan
- [High] Auto-fill from trip data
- [High] Photo capture capability

### FR-002: Verification Logic
- [Critical] Vehicle/driver matching validation
- [High] Mismatch alert and approval workflow
- [Medium] Integration with vehicle master data

### FR-003: Queue Management
- [High] Queue display (FIFO or priority-based)
- [High] Wait time estimation
- [Medium] Queue analytics (avg wait time)

---

## Business Rules

### BR-GATE-001: Valid Trip State
- Gate-in only allowed if trip status = "In Transit to Source" or "Dispatched"
- **Enforcement**: Status validation

### BR-GATE-002: No Duplicate Gate-In
- Each trip can have only one gate-in at source
- **Enforcement**: Unique constraint check

### BR-GATE-003: Arrival Time Validation
- Gate-in time must be >= dispatch time
- **Enforcement**: Timestamp validation

### BR-GATE-004: Delayed Arrival Alert
- Alert if arrival > 30 min late from planned time
- **Enforcement**: Time comparison

---

## Data Model

```typescript
GateEntry {
  id: UUID (PK)
  trip_id: UUID (FK)
  poi_id: UUID (FK)
  
  entry_type: Enum (Gate_In, Gate_Out)
  location_type: Enum (Source, Destination)
  
  vehicle_registration: String
  driver_name: String
  
  planned_arrival_time: Timestamp (nullable)
  actual_arrival_time: Timestamp
  
  odometer_reading: Integer (nullable)
  vehicle_condition_notes: Text (nullable)
  photos: JSON (array of URLs, nullable)
  
  verification_status: Enum (Verified, Mismatch_Flagged, Approved_Override)
  verified_by: UUID (FK to User)
  verified_at: Timestamp
  
  queue_position: Integer (nullable)
  estimated_wait_minutes: Integer (nullable)
  
  created_by: UUID (FK to User)
  created_at: Timestamp
}
```

---

## UI/UX Requirements

### Gate-In Entry Form
```
┌─────────────────────────────────────────┐
│ Gate-In Entry - Source                  │
├─────────────────────────────────────────┤
│ Trip/TO Number: *                       │
│ [TO-20260211-0042]  [🔍 Search] [📷 Scan]│
│                                         │
│ ✅ Trip Found                           │
│ Route: Bhaluka Warehouse → Mirpur Depot│
│ Product: Live Broiler (500 KG)          │
│                                         │
│ Expected Vehicle: DM-11-1234            │
│ Actual Vehicle: [DM-11-1234] ✅ Match   │
│                                         │
│ Expected Driver: Rahim Ahmed            │
│ Actual Driver: [Rahim Ahmed] ✅ Match   │
│                                         │
│ Arrival Time:                           │
│ Planned: 09:00 AM                       │
│ Actual: [09:05 AM] (5 min late)        │
│                                         │
│ Odometer Reading: (optional)            │
│ [12345] KM                              │
│                                         │
│ Vehicle Condition: (optional)           │
│ ┌─────────────────────────────────────┐ │
│ │ Good condition, no visible damage   │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Photos: [📷 Add Photos] (0/3)           │
│                                         │
│ Queue Position: 3                       │
│ Est. Wait Time: 15 minutes              │
│                                         │
│ [Cancel]              [Record Gate-In]  │
└─────────────────────────────────────────┘
```

### Gate-In Queue Display
```
┌──────────────────────────────────────────────────────────────┐
│ Loading Queue - Bhaluka Warehouse                           │
├──────────────────────────────────────────────────────────────┤
│ Position  Vehicle      Driver        Product      Wait Time │
│ ──────────────────────────────────────────────────────────  │
│ 1  🔴    DM-11-5678   Karim Mia     Maize        Loading... │
│ 2  🟡    DM-11-9012   Jalal Uddin   Feed         10 min     │
│ 3  🟢    DM-11-1234   Rahim Ahmed   Broiler      15 min     │
│                                                              │
│ Avg Wait Time: 12 minutes                                    │
└──────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
// Record gate-in
POST /api/v1/gate-entries/gate-in
Body: {
  trip_id, poi_id, vehicle_registration,
  driver_name, actual_arrival_time,
  odometer_reading?, vehicle_condition_notes?,
  photos?
}
Response: {gate_entry, trip_status: 'Arrived_At_Source', queue_position}

// Search trip for gate-in
GET /api/v1/trips/search-for-gate-in
Query: ?to_number=TO-20260211-0042&poi_id={source_poi_id}

// Get loading queue
GET /api/v1/gate-entries/loading-queue
Query: ?poi_id={source_poi_id}&status=Waiting

// Get gate-in history
GET /api/v1/gate-entries
Query: ?poi_id={id}&entry_type=Gate_In&date=2026-02-11
```

---

## Testing Scenarios

### Happy Path
1. Vehicle arrives → Gate Operator searches trip
2. Vehicle/driver verified → Gate-in recorded
3. Trip status updated → Notifications sent
4. Vehicle added to queue → Queue position displayed

### Edge Cases
1. **Vehicle mismatch**: Flag for supervisor approval
2. **Trip not found**: Error, manual entry option
3. **Duplicate gate-in**: Prevented
4. **Late arrival (> 30 min)**: Alert sent

---

## Dependencies

### Prerequisites
- ✅ US-021: Trip Lifecycle Management

### Enables
- → US-039: Scaling at Source
- → US-041: Loading Operations
- → US-036: Gate-Out at Source

---

## Definition of Done
- [ ] Gate-in entry form functional
- [ ] Trip search and validation working
- [ ] Vehicle/driver verification
- [ ] Trip status auto-update
- [ ] Queue management working
- [ ] Notifications sent
- [ ] Photo upload capability
- [ ] Unit tests > 85%
- [ ] UAT approved

---

**Story Points**: 5  
**Estimated Hours**: 40 hours  
**Sprint**: Sprint 11  
**Priority**: Critical

