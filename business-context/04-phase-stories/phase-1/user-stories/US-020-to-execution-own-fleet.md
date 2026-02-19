---
title: TO Execution - Own Fleet (Vehicle/Driver Assignment)
story_id: US-020
phase: phase-1
module: Transport Management
priority: Critical
status: Pending
epic: Transport Order Execution
sprint: Sprint 4
story_points: 8
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../03-module-specifications/03-core-operations/transport-order-management.md
  - ../../../03-module-specifications/03-core-operations/trip-management.md
related_stories:
  - US-019-to-execution-vendor-direct.md
  - US-016-fleet-availability.md
dependencies:
  - US-017-to-creation-multiple.md
  - US-001-vehicle-master-data.md
  - US-002-driver-master-data.md
tags: [transport, own-fleet, assignment, critical]
---

# US-020: TO Execution - Own Fleet (Vehicle/Driver Assignment)

## User Story

**As a** TDO (Own Fleet)  
**I want to** assign Transport Orders to own fleet vehicles and drivers  
**So that** transport can be executed using company-owned resources

## Business Context

Own fleet execution provides:
- **Cost Control**: Lower per-trip costs vs vendors
- **Quality Control**: Direct oversight of drivers and vehicles
- **Reliability**: Dedicated fleet for critical deliveries
- **Brand Representation**: Company vehicles represent brand

**Assignment Process**:
1. TDO reviews TOs requiring own fleet assignment
2. Checks fleet availability (vehicles, drivers, helpers)
3. Assigns suitable vehicle and driver
4. Schedules pickup date/time
5. Dispatches trip

---

## Acceptance Criteria

### AC-1: TO Assignment Queue
- [ ] System SHALL display TOs requiring own fleet assignment
- [ ] System SHALL filter by: Priority, Delivery Date, Route
- [ ] System SHALL show TO details: Number, Route, Quantity, Delivery Date
- [ ] System SHALL highlight urgent TOs (delivery < 2 days)

### AC-2: Fleet Availability Check
- [ ] System SHALL integrate with US-016 (Fleet Availability)
- [ ] System SHALL display available vehicles matching TO requirements
- [ ] System SHALL display available drivers with valid licenses
- [ ] System SHALL display available helpers
- [ ] System SHALL show vehicle/driver last trip and rest time

### AC-3: Vehicle Assignment
- [ ] System SHALL allow TDO to select vehicle from available list
- [ ] System SHALL validate:
  - Vehicle type matches product requirements
  - Vehicle capacity ≥ TO quantity
  - Vehicle status = "Available"
  - No scheduled maintenance conflicts
- [ ] System SHALL display vehicle details: Registration, Type, Capacity, Fuel Level

### AC-4: Driver Assignment
- [ ] System SHALL allow TDO to select driver from available list
- [ ] System SHALL validate:
  - Driver status = "Available"
  - Driver license valid (not expired)
  - Driver not on leave
  - Driver rest hours compliant (not exceeded 8 hours)
- [ ] System SHALL display driver details: Name, License, Phone, Performance Rating

### AC-5: Helper Assignment (Optional)
- [ ] System SHALL allow TDO to assign helper (optional)
- [ ] System SHALL validate helper availability
- [ ] System SHALL allow skipping helper assignment

### AC-6: Dispatch Scheduling
- [ ] System SHALL allow TDO to set:
  - Planned pickup date/time
  - Expected delivery date/time
  - Route instructions (optional)
- [ ] System SHALL validate pickup time is realistic (considering current time + preparation)
- [ ] System SHALL calculate estimated trip duration

### AC-7: Assignment Confirmation
- [ ] System SHALL update TO status to "Assigned"
- [ ] System SHALL update vehicle status to "On Trip"
- [ ] System SHALL update driver status to "On Trip"
- [ ] System SHALL send notifications to:
  - Driver (mobile-responsive web interface + SMS)
  - Helper (if assigned)
  - Transport Planner
- [ ] System SHALL create trip record

---

## Functional Requirements

### FR-001: Assignment Dashboard
- [Critical] TO queue with filtering
- [Critical] Fleet availability integration
- [High] Quick assignment workflow
- [Medium] Batch assignment (multiple TOs to same vehicle)

### FR-002: Assignment Form
- [Critical] Vehicle selection dropdown (filtered by availability)
- [Critical] Driver selection dropdown (filtered by availability)
- [High] Helper selection dropdown
- [High] Pickup/delivery datetime pickers
- [Medium] Route instructions text field

### FR-003: Validation Engine
- [Critical] Real-time availability checks
- [Critical] Capacity and type matching
- [High] Driver hours compliance check
- [Medium] Optimal vehicle-driver pairing suggestions

### FR-004: Dispatch Management
- [Critical] Trip creation on assignment
- [Critical] Status updates (TO, Vehicle, Driver)
- [High] Notification dispatch
- [Medium] Dispatch schedule calendar view

---

## Business Rules

### BR-OWN-001: Vehicle Availability
- Vehicle must have status "Available"
- **Enforcement**: Query filter

### BR-OWN-002: Driver License Validity
- Driver license must not be expired
- **Enforcement**: Date validation

### BR-OWN-003: Driver Rest Hours
- Driver must not exceed 8 hours of driving per day
- **Enforcement**: Trip duration calculation

### BR-OWN-004: Vehicle-Product Match
- Vehicle type must match product handling requirements
- **Enforcement**: Validation check (warning, not blocking)

### BR-OWN-005: Capacity Requirement
- Vehicle capacity must be ≥ TO quantity
- **Enforcement**: Validation check

---

## Data Model

```typescript
TransportOrder {
  // ... existing fields ...
  
  // Own fleet assignment fields
  assigned_vehicle_id: UUID (FK to Vehicle, nullable)
  assigned_driver_id: UUID (FK to Driver, nullable)
  assigned_helper_id: UUID (FK to Helper, nullable)
  
  planned_pickup_datetime: Timestamp (nullable)
  planned_delivery_datetime: Timestamp (nullable)
  route_instructions: Text (nullable)
  
  assignment_type: Enum (Own_Fleet, Vendor_Direct, Vendor_Bidding)
  assigned_at: Timestamp (nullable)
  assigned_by: UUID (FK to User, nullable)
}

Trip {
  id: UUID (PK)
  to_id: UUID (FK to TransportOrder)
  
  vehicle_id: UUID (FK)
  driver_id: UUID (FK)
  helper_id: UUID (FK, nullable)
  
  status: Enum (Planned, Dispatched, In_Transit, ...)
  
  created_at: Timestamp
}
```

---

## UI/UX Requirements

### TO Assignment Page
```
┌─────────────────────────────────────────────────────────────┐
│ Assign TO: TO-20260211-0042                                 │
│ Route: Bhaluka → Mirpur (45 km) | Product: Live Broiler    │
│ Quantity: 500 KG | Delivery: Feb 13, 2026                   │
├─────────────────────────────────────────────────────────────┤
│ Select Vehicle: *                                           │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ ☑ DM-11-1234 (Covered Van, 5 MT) ✅ Available        │   │
│ │   Last Trip: 2 hours ago | Fuel: 80% | Rating: ⭐4.5  │   │
│ │                                                       │   │
│ │ ☐ DM-11-5678 (Covered Van, 5 MT) ✅ Available        │   │
│ │   Last Trip: 1 day ago | Fuel: 95% | Rating: ⭐4.8   │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ Select Driver: *                                            │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ ☑ Rahim Ahmed ✅ Available                            │   │
│ │   License: DL-123456 (Valid until Dec 2026)           │   │
│ │   Phone: 01711-123456 | Rating: ⭐4.5                 │   │
│ │   Hours Today: 2h (6h remaining)                      │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ Select Helper: (Optional)                                   │
│ [Karim Mia                        ▼]                        │
│                                                             │
│ Planned Pickup:                                             │
│ [2026-02-13] [08:00 AM]                                     │
│                                                             │
│ Expected Delivery:                                          │
│ [2026-02-13] [11:00 AM] (Est. 3 hours)                      │
│                                                             │
│ Route Instructions: (Optional)                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Take Dhaka-Mymensingh highway. Avoid city center.       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [Cancel]                              [Assign & Dispatch]   │
└─────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
// Get TOs for own fleet assignment
GET /api/v1/transport-orders/for-own-fleet-assignment
Query: ?priority=Critical&delivery_date=2026-02-13

// Get available fleet for TO
GET /api/v1/fleet/available-for-to/{to_id}
Response: {vehicles: [...], drivers: [...], helpers: [...]}

// Assign TO to own fleet
POST /api/v1/transport-orders/{to_id}/assign-own-fleet
Body: {
  vehicle_id, driver_id, helper_id?,
  planned_pickup_datetime, planned_delivery_datetime,
  route_instructions?
}
Response: {to, trip}

// Dispatch trip
POST /api/v1/trips/{trip_id}/dispatch
Response: {trip, notifications_sent}
```

---

## Testing Scenarios

### Happy Path
1. TDO views TO queue → TOs displayed
2. TDO selects TO → Fleet availability shown
3. TDO assigns vehicle, driver, helper → TO assigned
4. System dispatches → Notifications sent, statuses updated

### Edge Cases
1. **No vehicles available**: Show message, suggest vendor fleet
2. **Driver license expired**: Hide from list
3. **Driver exceeded 8 hours**: Warning, allow override with approval
4. **Vehicle under maintenance**: Hide from list

---

## Dependencies

### Prerequisites
- ✅ US-017: TO Creation
- ✅ US-001: Vehicle Master Data
- ✅ US-002: Driver Master Data
- ✅ US-016: Fleet Availability

### Enables
- → US-021: Trip Lifecycle Management

---

## Definition of Done
- [ ] TO assignment queue functional
- [ ] Fleet availability integration working
- [ ] Vehicle/driver/helper assignment working
- [ ] Validation rules enforced
- [ ] Dispatch workflow complete
- [ ] Notifications sent
- [ ] Trip record created
- [ ] Unit tests > 85%
- [ ] UAT approved

---

**Story Points**: 8  
**Estimated Hours**: 64 hours  
**Sprint**: Sprint 4  
**Priority**: Critical

