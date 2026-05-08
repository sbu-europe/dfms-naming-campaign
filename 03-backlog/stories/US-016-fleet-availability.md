---
title: Fleet Availability Validation
story_id: US-016
phase: phase-1
module: Transport Management
priority: High
status: Pending
epic: Transport Order (TO) Management
epic_id: EPIC-009
epic_name: Transport Order (TO) Management
sprint: Sprint 4
story_points: 3
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../05-modules/03-operations/transport-order-management.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-015-tr-assessment.md
  - US-017-to-creation.md
dependencies:
  - US-053-vehicle-registration-master-data.md
  - US-057-driver-master-data.md
tags: [transport, fleet, availability, validation, high-priority]
---

# US-016: Fleet Availability Validation

## User Story

**As a** Transport Planner  
**I want to** check real-time fleet availability before creating Transport Orders  
**So that** I can assign TOs only to available vehicles and drivers

## Business Context

Fleet availability validation prevents:
- **Double Assignment**: Assigning vehicle already on trip
- **Driver Unavailability**: Assigning driver on leave or on another trip
- **Maintenance Conflicts**: Using vehicles under maintenance
- **Capacity Mismatch**: Assigning unsuitable vehicle types

**Real-time Checks**:
- Vehicle status (Available, On Trip, Under Maintenance)
- Driver status (Available, On Trip, On Leave)
- Helper availability
- Vehicle type suitability

---

## Acceptance Criteria

### AC-1: Vehicle Availability Check
- [ ] System SHALL check vehicle status in real-time
- [ ] System SHALL display available vehicles filtered by:
  - Vehicle Type (matching TR requirements)
  - Status = "Available"
  - Not scheduled for maintenance
  - Capacity ≥ TR quantity
- [ ] System SHALL show vehicle details: Registration, Type, Capacity, Last Trip
- [ ] System SHALL hide unavailable vehicles from assignment list

### AC-2: Driver Availability Check
- [ ] System SHALL check driver status in real-time
- [ ] System SHALL display available drivers filtered by:
  - Status = "Available"
  - Valid license (not expired)
  - Not on leave
  - Not assigned to another active trip
- [ ] System SHALL show driver details: Name, License, Phone, Last Trip
- [ ] System SHALL warn if driver has completed > 8 hours today

### AC-3: Helper Availability Check
- [ ] System SHALL check helper status
- [ ] System SHALL display available helpers
- [ ] System SHALL allow optional helper assignment

### AC-4: Availability Dashboard
- [ ] System SHALL provide fleet availability dashboard showing:
  - Total vehicles by type
  - Available vs On Trip vs Under Maintenance
  - Available drivers count
  - Utilization percentage
- [ ] System SHALL update dashboard in real-time
- [ ] System SHALL allow filtering by date range

### AC-5: Reservation System
- [ ] System SHALL allow soft-reserving vehicle/driver for TO
- [ ] System SHALL release reservation if TO not created within 30 minutes
- [ ] System SHALL prevent double-reservation

---

## Functional Requirements

### FR-001: Availability Query Engine
- [Critical] Real-time status check for vehicles and drivers
- [Critical] Filter by multiple criteria (type, status, capacity)
- [High] Consider scheduled maintenance
- [Medium] Predict availability for future dates

### FR-002: Dashboard
- [High] Fleet utilization metrics
- [High] Availability trends
- [Medium] Capacity planning insights

### FR-003: Reservation Management
- [High] Soft reservation for 30 minutes
- [High] Auto-release expired reservations
- [Medium] Reservation conflict detection

---

## Business Rules

### BR-AVAIL-001: Available Status
- Vehicle/Driver must have status = "Available"
- **Enforcement**: Query filter

### BR-AVAIL-002: License Validity
- Driver license must not be expired
- **Enforcement**: Date check

### BR-AVAIL-003: Capacity Match
- Vehicle capacity must be ≥ TR quantity
- **Enforcement**: Comparison check

### BR-AVAIL-004: Driver Hours
- Warn if driver worked > 8 hours today
- **Enforcement**: Trip duration calculation

---

## Data Model

```typescript
FleetAvailability {
  vehicle_id: UUID
  driver_id: UUID (nullable)
  
  is_available: Boolean (computed)
  current_status: Enum
  unavailable_reason: String (nullable)
  available_from: Timestamp (nullable)
  
  last_trip_end: Timestamp (nullable)
  next_scheduled_maintenance: Date (nullable)
  
  computed_at: Timestamp
}

FleetReservation {
  id: UUID (PK)
  vehicle_id: UUID (FK)
  driver_id: UUID (FK, nullable)
  
  reserved_by: UUID (FK to User)
  reserved_for_tr_id: UUID (FK)
  reserved_at: Timestamp
  expires_at: Timestamp (reserved_at + 30 min)
  
  status: Enum (Active, Released, Consumed)
}
```

---

## UI/UX Requirements

### Fleet Availability Dashboard
```
┌──────────────────────────────────────────────────────────────┐
│ Fleet Availability                          [Refresh]        │
├──────────────────────────────────────────────────────────────┤
│ Covered Van (5 MT):  ████████░░ 12/15 available (80%)       │
│ Open Truck (10 MT):  ██████░░░░ 5/8 available (63%)         │
│ Refrigerated:        ████░░░░░░ 2/5 available (40%)         │
│                                                              │
│ Drivers: 25/30 available (83%)                               │
│ Helpers: 18/20 available (90%)                               │
│                                                              │
│ ┌─ Available Vehicles ─────────────────────────────────┐    │
│ │ Registration    Type         Capacity  Last Trip     │    │
│ │ ────────────────────────────────────────────────────│    │
│ │ DM-11-1234     Covered Van   5 MT      2 hours ago  │    │
│ │ DM-11-5678     Covered Van   5 MT      1 day ago    │    │
│ │ DM-11-9012     Open Truck    10 MT     3 hours ago  │    │
│ └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
GET /api/v1/fleet/availability
Query: ?vehicle_type=Covered_Van&date=2026-02-13&capacity_min=5

GET /api/v1/drivers/available
Query: ?date=2026-02-13

POST /api/v1/fleet/reserve
Body: {vehicle_id, driver_id, tr_id}
Response: {reservation_id, expires_at}

DELETE /api/v1/fleet/reservations/{reservation_id}
```

---

## Testing Scenarios

### Happy Path
1. Check availability → List of available vehicles/drivers
2. Reserve vehicle → Reservation created
3. Create TO within 30 min → Reservation consumed
4. Reservation expires → Auto-released

### Edge Cases
1. **No vehicles available**: Show message, suggest vendor fleet
2. **Driver license expired**: Hide from list
3. **Vehicle under maintenance**: Hide from list

---

## Dependencies

### Prerequisites
- ✅ US-001: Vehicle Master Data
- ✅ US-002: Driver Master Data

### Enables
- → US-017: TO Creation (availability check)

---

## Definition of Done
- [ ] Availability query working
- [ ] Dashboard functional
- [ ] Reservation system working
- [ ] Auto-release implemented
- [ ] Unit tests > 80%
- [ ] UAT approved

---

**Story Points**: 3  
**Estimated Hours**: 24 hours  
**Sprint**: Sprint 3  
**Priority**: High

