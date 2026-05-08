---
title: Assign Loading/Unloading Point
story_id: US-072
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
  - US-071-view-all-waiting-vehicles.md
  - US-073-assignment-alert.md
  - US-041-loading-operations.md
dependencies:
  - US-071-view-all-waiting-vehicles.md (Must view queue first)
tags: [command-center, operations, assignment, phase-1]
---

# US-072: Assign Loading/Unloading Point

## User Story

**As a** Command Center Officer  
**I want to** assign vehicles to specific loading or unloading lines or bays based on operational priority  
**So that** congestion and delays are minimized

## Business Context

Command Center Officers manage vehicle flow by assigning vehicles to appropriate loading/unloading points based on:
- **Product Type**: Different products may require specific loading points
- **Vehicle Type**: Vehicle size/capacity determines suitable points
- **Urgency Level**: High-priority vehicles get faster assignment
- **Point Availability**: Real-time availability of loading/unloading points

**Key Requirements**:
- Immediate status update upon assignment
- Visibility to operational teams
- Assignment based on operational priority

---

## Acceptance Criteria

### AC-1: Vehicle Assignment

#### AC-1.1: Assignment Eligibility
- [ ] System SHALL allow assignment only for eligible vehicles
- [ ] System SHALL validate vehicle is in waiting queue
- [ ] System SHALL check loading point availability
- [ ] System SHALL prevent duplicate assignments

#### AC-1.2: Assignment Criteria
- [ ] System SHALL support assignment based on:
  - Product Type
  - Vehicle Type
  - Urgency Level
- [ ] System SHALL validate product compatibility with loading point
- [ ] System SHALL check vehicle capacity vs loading point capacity

### AC-2: Assignment Execution

#### AC-2.1: Status Update
- [ ] System SHALL update vehicle status immediately upon assignment
- [ ] System SHALL reflect updated status in Command Center view
- [ ] System SHALL remove vehicle from waiting queue

#### AC-2.2: Team Notification
- [ ] System SHALL make assignment instantly visible to loading/unloading teams
- [ ] System SHALL send notification to assigned team
- [ ] System SHALL display assignment details (point, vehicle, product)

---

## Functional Requirements

### FR-1: Assignment Logic
- System SHALL support manual assignment by Command Center Officer
- System SHALL support automatic assignment based on rules (optional)
- System SHALL validate assignment constraints

### FR-2: Assignment Tracking
- System SHALL record assignment timestamp
- System SHALL log assigning officer
- System SHALL maintain assignment history

---

## Business Rules

- Only vehicles in waiting queue can be assigned
- Assignment must match product type requirements
- Vehicle capacity must fit loading point capacity
- High urgency vehicles get priority assignment
- Assignment is immediate and cannot be undone without approval

---

## Dependencies

- **US-071**: View All Waiting Vehicles (must view queue)
- **US-041**: Loading Operations (loading point must exist)
- **US-042**: Unloading Operations (unloading point must exist)

---

## Technical Notes

- Assignment should be atomic transaction
- Real-time updates via WebSocket
- Assignment state persisted immediately

---

## Testing Scenarios

1. **Scenario 1**: Assign vehicle to loading point → Status updated, team notified
2. **Scenario 2**: Assign incompatible product → Validation error
3. **Scenario 3**: Assign to unavailable point → Error message
4. **Scenario 4**: Multiple assignments → Queue updated correctly

---

## Definition of Done

- [ ] Assignment works for eligible vehicles
- [ ] Status updates immediately
- [ ] Teams receive notifications
- [ ] Assignment validation working
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Code reviewed
- [ ] UAT approved

---

**Last Updated**: 2026-02-17  
**Source**: `source-documents/04-wbs/stories-table.md` (WBS - Source of Truth)

