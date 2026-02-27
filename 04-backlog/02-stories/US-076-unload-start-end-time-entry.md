---
title: Unload Start/End Date & Time Entry
story_id: US-076
epic_id: EPIC-013
epic_name: Loading / Unloading Operations
phase: phase-1
module: Operations (Unloading)
priority: Medium
status: Pending
sprint: Sprint 9
story_points: 3
created: 2026-02-17
updated: 2026-02-17
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-075-load-start-end-time-entry.md
  - US-072-assign-loading-unloading-point.md
dependencies:
  - US-075-load-start-end-time-entry.md (Loading must complete first)
tags: [unloading, operations, time-tracking, phase-1]
---

# US-076: Unload Start/End Date & Time Entry

## User Story

**As a** Unloading personnel  
**I want to** record unloading start and end times against a vehicle  
**So that** unloading duration and operational efficiency can be tracked accurately

## Business Context

Unloading operations require accurate time tracking for:
- **Performance Measurement**: Track unloading efficiency
- **Bottleneck Identification**: Identify slow unloading points
- **Resource Planning**: Optimize unloading point allocation
- **QC Workflow**: Unloading completion triggers QC processes

**Key Requirements**:
- Record start and end times
- Track number of bags unloaded
- Record weight unloaded
- Validate time sequence

---

## Acceptance Criteria

### AC-1: Unloading Time Entry

#### AC-1.1: Unload Start Time
- [ ] System SHALL allow unloading time entry only for authorized users
- [ ] System SHALL record Unload Start Date & Time
- [ ] System SHALL validate vehicle has completed loading
- [ ] System SHALL prevent duplicate start time entries

#### AC-1.2: Unload End Time
- [ ] System SHALL record Unload End Date & Time
- [ ] System SHALL validate Unload End Date & Time is not earlier than Unload Start Date & Time
- [ ] System SHALL require Unload End Time before allowing QC processes

### AC-2: Unloading Details

#### AC-2.1: Unloading Information
- [ ] System SHALL record number of bags unloaded
- [ ] System SHALL record weight unloaded
- [ ] System SHALL link all data to vehicle and TO/Trip record

#### AC-2.2: Chronological Correctness
- [ ] System SHALL ensure chronological correctness of unloading process
- [ ] System SHALL validate unloading sequence (after loading, before QC)
- [ ] System SHALL store unloading timestamps against vehicle record

---

## Functional Requirements

### FR-1: Time Validation
- System SHALL validate chronological order (end >= start)
- System SHALL prevent future-dated entries
- System SHALL validate unloading occurs after loading completion

### FR-2: Unloading Tracking
- System SHALL calculate unloading duration automatically
- System SHALL track unloading efficiency metrics
- System SHALL support partial unloading scenarios

---

## Business Rules

- Unloading can only start after loading completion
- End time must be after start time
- Unloading details mandatory for completion
- Unloading completion triggers QC workflow

---

## Dependencies

- **US-075**: Load Start/End Date & Time Entry (loading must complete first)
- **US-072**: Assign Loading/Unloading Point (vehicle must be assigned)

---

## Technical Notes

- Time entries should use server timestamp
- Unloading state persisted immediately
- Duration calculation: End Time - Start Time
- Unloading completion triggers QC workflow

---

## Testing Scenarios

1. **Scenario 1**: Record unload start → Start time saved
2. **Scenario 2**: Record unload end → End time validated, duration calculated
3. **Scenario 3**: End time before start → Validation error
4. **Scenario 4**: Unloading completion → QC workflow triggered

---

## Definition of Done

- [ ] Unload start/end times recorded
- [ ] Time validation working
- [ ] Unloading details captured
- [ ] Data linked to vehicle/TO
- [ ] Chronological validation working
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Code reviewed
- [ ] UAT approved

---

**Last Updated**: 2026-02-17  
**Source**: `source-documents/04-wbs/stories-table.md` (WBS - Source of Truth)

