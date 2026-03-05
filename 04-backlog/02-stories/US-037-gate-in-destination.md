---
title: Gate-In Entry at Destination POI
story_id: US-037
phase: phase-1
module: Operations (Gate Management)
priority: Critical
status: Pending
epic: Gate Management
epic_id: EPIC-011
epic_name: Gate Management
sprint: Sprint 11
story_points: 5
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../03-module-specifications/04-poi-operations/gate-management.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-035-gate-in-source.md
  - US-038-gate-out-destination.md
  - US-042-unloading-operations.md
dependencies:
  - US-036-gate-out-source.md
tags: [operations, gate, gate-in, destination, critical]
---

# US-037: Gate-In Entry at Destination POI

## User Story

**As a** Gate Operator (Destination)  
**I want to** record vehicle arrival at destination location  
**So that** delivery is tracked and unloading process can begin

## Business Context

Gate-In at destination marks delivery arrival:
- **Delivery Confirmation**: Vehicle reached destination
- **Seal Verification**: Check seal integrity (if applicable)
- **Queue Management**: Track vehicles waiting for unloading
- **Trip State Update**: Update trip status to "Arrived at Destination"
- **On-Time Tracking**: Calculate delivery timeliness

---

## Acceptance Criteria

### AC-1: Gate-In Entry
- [ ] System SHALL record gate-in with:
  - Trip ID *
  - Arrival time * (auto-captured)
  - Seal number verification (if applicable)
  - Seal condition (Intact/Broken)
  - Odometer reading (optional)
  - Vehicle condition notes
  - Photos (optional)
- [ ] System SHALL validate trip in transit to destination

### AC-2: Seal Verification
- [ ] System SHALL display expected seal number (from source gate-out)
- [ ] System SHALL allow verifying seal:
  - Seal intact ✅
  - Seal broken/tampered ⚠️
  - No seal (if not required)
- [ ] System SHALL flag seal issues for investigation
- [ ] System SHALL require supervisor approval if seal broken

### AC-3: Trip State Update
- [ ] System SHALL update trip status to "Arrived at Destination"
- [ ] System SHALL record arrival timestamp
- [ ] System SHALL calculate:
  - Transit time (source departure to destination arrival)
  - On-time delivery (yes/no)
  - Delay duration (if late)

### AC-4: Queue Management
- [ ] System SHALL add vehicle to unloading queue
- [ ] System SHALL display queue position
- [ ] System SHALL prioritize based on:
  - Product type (perishable first)
  - Delivery urgency
  - Arrival time

### AC-5: Notifications
- [ ] System SHALL notify:
  - Unloading Supervisor
  - QC Team (if QC required)
  - Command Center
  - Customer (delivery arrived)

---

## Functional Requirements

### FR-001: Gate-In Interface
- [Critical] Quick entry form
- [Critical] Seal verification workflow
- [High] On-time delivery calculation
- [High] Photo capture

### FR-002: Queue Management
- [High] Priority-based queue
- [High] Wait time estimation
- [Medium] Queue optimization

---

## Business Rules

### BR-DEST-001: Valid Trip State
- Gate-in only allowed if trip status = "In Transit to Destination" or "Departed from Source"
- **Enforcement**: Status validation

### BR-DEST-002: Seal Verification
- If seal number exists, verification mandatory
- Broken seal requires supervisor approval
- **Enforcement**: Conditional validation

### BR-DEST-003: On-Time Definition
- On-time if arrival within planned time + 30 min buffer
- **Enforcement**: Timestamp comparison

---

## Data Model

```typescript
// Uses same GateEntry model
GateEntry {
  // ... existing fields ...
  
  expected_seal_number: String (nullable)
  actual_seal_number: String (nullable)
  seal_condition: Enum (Intact, Broken, Tampered, Not_Applicable) (nullable)
  seal_verification_notes: Text (nullable)
  
  is_on_time_delivery: Boolean (computed)
  delay_minutes: Integer (nullable, computed)
}
```

---

## UI/UX Requirements

```
┌─────────────────────────────────────────┐
│ Gate-In Entry - Destination             │
├─────────────────────────────────────────┤
│ Trip: TRIP-20260211-0042                │
│ Route: Bhaluka → Mirpur Depot           │
│ Product: Live Broiler (500 KG) 🔴 Urgent│
│                                         │
│ Vehicle: DM-11-1234                     │
│ Driver: Rahim Ahmed                     │
│                                         │
│ Seal Verification:                      │
│ Expected Seal: SEAL-123456              │
│ Actual Seal: [SEAL-123456]              │
│ Condition: ⚪ Intact ⚪ Broken           │
│ ✅ Seal Verified                        │
│                                         │
│ Arrival Time:                           │
│ Planned: 11:30 AM                       │
│ Actual: [11:25 AM]                      │
│ ✅ On-Time (5 min early)                │
│                                         │
│ Transit Time: 1h 40min                  │
│                                         │
│ Vehicle Condition: (optional)           │
│ ┌─────────────────────────────────────┐ │
│ │ Good condition, no issues           │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Queue Position: 2                       │
│ Est. Wait Time: 10 minutes              │
│ Priority: 🔴 High (Perishable)          │
│                                         │
│ [Cancel]              [Record Gate-In]  │
└─────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
POST /api/v1/gate-entries/gate-in
Body: {
  trip_id, poi_id, arrival_time,
  actual_seal_number?, seal_condition?,
  seal_verification_notes?
}
Response: {
  gate_entry, trip_status: 'Arrived_At_Destination',
  is_on_time, delay_minutes, queue_position
}
```

---

## Testing Scenarios

### Happy Path
1. Vehicle arrives → Gate-in recorded
2. Seal verified intact → Approved
3. On-time delivery → Status updated
4. Added to queue → Notifications sent

### Edge Cases
1. **Seal broken**: Supervisor approval required
2. **Late delivery (> 30 min)**: Flagged, alert sent
3. **Seal mismatch**: Investigation triggered

---

## Dependencies

### Prerequisites
- ✅ US-036: Gate-Out at Source

### Enables
- → US-040: Scaling at Destination
- → US-042: Unloading Operations
- → US-038: Gate-Out at Destination

---

## Definition of Done
- [ ] Gate-in form functional
- [ ] Seal verification working
- [ ] On-time calculation accurate
- [ ] Queue management working
- [ ] Notifications sent
- [ ] Unit tests > 85%
- [ ] UAT approved

---

**Story Points**: 5  
**Estimated Hours**: 40 hours  
**Sprint**: Sprint 11  
**Priority**: Critical

