---
title: Assign Waiting Serial
story_id: US-074
epic_id: EPIC-015
epic_name: Command Center Operations
phase: phase-1
module: Operations (Command Center)
priority: Low
status: Pending
sprint: Sprint 11
story_points: 2
created: 2026-02-17
updated: 2026-02-17
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-072-assign-loading-unloading-point.md
  - US-068-scale-in-weight-recording.md
dependencies:
  - US-072-assign-loading-unloading-point.md (Must assign to loading point first)
tags: [command-center, operations, serial-assignment, phase-1]
---

# US-074: Assign Waiting Serial

## User Story

**As a** Command Center Officer  
**I want to** assign vehicles to each loading point and give serial for each loading point  
**So that** vehicles are processed in a controlled and traceable order

## Business Context

After a vehicle completes scale-in and is assigned to a loading point, a waiting serial is issued to:
- Control processing order
- Ensure FIFO or priority-based processing
- Provide traceability
- Prevent queue jumping

**Key Requirements**:
- One unique serial per vehicle per loading point
- Serial cannot be modified after issuance
- Serial linked to vehicle and loading workflow
- Full audit trail

---

## Acceptance Criteria

### AC-1: Serial Assignment

#### AC-1.1: Serial Generation
- [ ] System SHALL assign exactly one unique active waiting serial per vehicle per loading point
- [ ] System SHALL link serial to vehicle and associated loading workflow
- [ ] System SHALL prevent modification of issued serial
- [ ] System SHALL ensure serial uniqueness per loading point

#### AC-1.2: Serial Tracking
- [ ] System SHALL record serial issuance time
- [ ] System SHALL record issuing user
- [ ] System SHALL log complete serial assignment details in audit trail
- [ ] System SHALL display serial number in queue view

### AC-2: Serial Management

#### AC-2.1: Serial Lifecycle
- [ ] System SHALL mark serial as active when issued
- [ ] System SHALL mark serial as used when vehicle starts loading
- [ ] System SHALL maintain serial history

#### AC-2.2: Serial Display
- [ ] System SHALL display serial number in vehicle queue
- [ ] System SHALL show serial order (1, 2, 3, etc.)
- [ ] System SHALL highlight current serial being processed

---

## Functional Requirements

### FR-1: Serial Generation
- System SHALL generate sequential serial numbers per loading point
- System SHALL reset serial sequence daily or per shift (configurable)
- System SHALL support serial format customization

### FR-2: Serial Validation
- System SHALL prevent duplicate serials
- System SHALL validate serial before assignment
- System SHALL ensure serial continuity

---

## Business Rules

- One serial per vehicle per loading point
- Serial cannot be modified after issuance
- Serial order determines processing sequence
- Serial reset policy (daily/shift-based) configurable

---

## Dependencies

- **US-072**: Assign Loading/Unloading Point (vehicle must be assigned first)
- **US-068**: Scale-In Weight Recording (vehicle must complete scale-in)

---

## Technical Notes

- Serial generation should be atomic
- Serial state persisted immediately
- Serial history maintained for audit

---

## Testing Scenarios

1. **Scenario 1**: Assign serial to vehicle → Serial generated and linked
2. **Scenario 2**: Multiple vehicles → Sequential serials assigned
3. **Scenario 3**: Serial modification attempt → Prevented
4. **Scenario 4**: Serial display → Shows correct order

---

## Definition of Done

- [ ] Serial assigned per vehicle per loading point
- [ ] Serial cannot be modified
- [ ] Audit trail complete
- [ ] Serial display working
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Code reviewed
- [ ] UAT approved

---

**Last Updated**: 2026-02-17  
**Source**: `source-documents/04-wbs/stories-table.md` (WBS - Source of Truth)

