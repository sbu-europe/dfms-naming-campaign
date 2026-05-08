---
title: View All Waiting Vehicles
story_id: US-071
epic_id: EPIC-015
epic_name: Command Center Operations
phase: phase-1
module: Operations (Command Center)
priority: Low
status: Pending
sprint: Sprint 13
story_points: 3
created: 2026-02-17
updated: 2026-02-17
source_documents:
  - ../../../../01-source/01-prd/PRD_DFMS_v1.0.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-072-assign-loading-unloading-point.md
  - US-068-scale-in-weight-recording.md
dependencies:
  - US-068-scale-in-weight-recording.md (Must have scale-in completed)
tags: [command-center, operations, queue-management, phase-1]
---

# US-071: View All Waiting Vehicles

## User Story

**As a** Command Center Officer  
**I want to** view all vehicles that have completed scale-in  
**So that** I can efficiently assign them to loading points

## Business Context

After vehicles complete scale-in operations, they enter a waiting queue where Command Center Officers assign them to specific loading points based on:
- Product Type
- Vehicle Type
- Urgency Level
- Loading point availability

**Key Requirements**:
- Real-time queue visibility
- Automatic refresh
- Filter vehicles awaiting assignment
- Exclude already-assigned vehicles

---

## Acceptance Criteria

### AC-1: Vehicle Waiting Queue Display

#### AC-1.1: Queue Filtering
- [ ] System SHALL display only vehicles with completed Scale-in
- [ ] System SHALL exclude vehicles already assigned to loading points
- [ ] System SHALL clearly distinguish vehicles awaiting assignment
- [ ] System SHALL automatically refresh queue data

#### AC-1.2: Queue Entry Information
- [ ] System SHALL display for each queue entry:
  - Vehicle Number
  - P.C Code (Waiting Code)
  - Item
  - Scale-in Date & Time
  - Product Type
  - Gross/Net Weight (if available)
  - TO/Challan reference
  - Urgency Level

### AC-2: Queue Management

#### AC-2.1: Real-time Updates
- [ ] System SHALL update queue automatically as vehicles complete scale-in
- [ ] System SHALL remove vehicles from queue upon assignment
- [ ] System SHALL maintain chronological order (FIFO or priority-based)

#### AC-2.2: Queue Actions
- [ ] System SHALL allow Command Center Officer to assign vehicles to loading points
- [ ] System SHALL provide filter/search capabilities
- [ ] System SHALL support sorting by urgency, time, or product type

---

## Functional Requirements

### FR-1: Queue Data Source
- System SHALL fetch vehicle data from scale-in completion events
- System SHALL link queue entries to Transport Orders (TO)
- System SHALL validate vehicle eligibility for assignment

### FR-2: Queue Display
- System SHALL provide centralized queue view
- System SHALL support multiple loading point queues
- System SHALL show queue statistics (total waiting, average wait time)

---

## Business Rules

- Only vehicles with completed scale-in are eligible for queue
- Vehicles already assigned to loading points are excluded
- Queue order may be FIFO or priority-based (urgency level)
- Queue data must refresh automatically (configurable interval)

---

## Dependencies

- **US-068**: Scale-In Weight Recording (vehicles must complete scale-in)
- **US-070**: Scale-Out with Net Weight (weight data availability)

---

## Technical Notes

- Queue data should be cached for performance
- Real-time updates via WebSocket or polling
- Queue state persisted for audit trail

---

## Testing Scenarios

1. **Scenario 1**: Vehicle completes scale-in → Appears in queue
2. **Scenario 2**: Vehicle assigned to loading point → Removed from queue
3. **Scenario 3**: Multiple vehicles in queue → Displayed in correct order
4. **Scenario 4**: Queue refresh → Updates without manual refresh

---

## Definition of Done

- [ ] Queue displays vehicles with completed scale-in
- [ ] Queue excludes assigned vehicles
- [ ] All required fields displayed
- [ ] Real-time refresh working
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Code reviewed
- [ ] UAT approved

---

**Last Updated**: 2026-02-17  
**Source**: `source-documents/04-wbs/stories-table.md` (WBS - Source of Truth)

