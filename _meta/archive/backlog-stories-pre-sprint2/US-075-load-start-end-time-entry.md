---
title: Load Start/End Date & Time Entry
story_id: US-075
epic_id: EPIC-013
epic_name: Loading / Unloading Operations
phase: phase-1
module: Operations (Loading)
priority: Medium
status: Pending
sprint: Sprint 14
story_points: 3
created: 2026-02-17
updated: 2026-02-17
source_documents:
  - ../../../../01-source/01-prd/DFMS_Product_Requirements_Document_v3.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-072-assign-loading-unloading-point.md
  - US-076-unload-start-end-time-entry.md
dependencies:
  - US-072-assign-loading-unloading-point.md (Vehicle must be assigned)
tags: [loading, operations, time-tracking, phase-1]
---

# US-075: Load Start/End Date & Time Entry

## User Story

**As a** Loading personnel  
**I want to** record loading start and end times against a vehicle  
**So that** loading duration and operational efficiency can be tracked accurately

## Business Context

Loading operations require accurate time tracking for:
- **Performance Measurement**: Track loading efficiency
- **Bottleneck Identification**: Identify slow loading points
- **Resource Planning**: Optimize loading point allocation
- **Cost Calculation**: Loading time affects trip costs

**Key Requirements**:
- Record start and end times
- Track number of bags loaded
- Record weight and seal number
- Validate time sequence

---

## Acceptance Criteria

### AC-1: Loading Time Entry

#### AC-1.1: Load Start Time
- [ ] System SHALL allow loading time entry only for assigned vehicles
- [ ] System SHALL record Load Start Date & Time
- [ ] System SHALL validate vehicle is assigned to loading point
- [ ] System SHALL prevent duplicate start time entries

#### AC-1.2: Load End Time
- [ ] System SHALL record Load End Date & Time
- [ ] System SHALL validate Load End Date & Time is not earlier than Load Start Date & Time
- [ ] System SHALL require Load End Time before allowing next operations

### AC-2: Loading Details

#### AC-2.1: Loading Information
- [ ] System SHALL record number of bags loaded
- [ ] System SHALL record weight loaded
- [ ] System SHALL record seal number
- [ ] System SHALL link all data to vehicle and TO/Trip record

#### AC-2.2: Data Availability
- [ ] System SHALL make loading data available for downstream operations
- [ ] System SHALL store loading timestamps against vehicle record
- [ ] System SHALL associate loading details with TO/Trip

---

## Functional Requirements

### FR-1: Time Validation
- System SHALL validate chronological order (end >= start)
- System SHALL prevent future-dated entries
- System SHALL validate time against system clock

### FR-2: Loading Tracking
- System SHALL calculate loading duration automatically
- System SHALL track loading efficiency metrics
- System SHALL support partial loading scenarios

---

## Business Rules

- Loading can only start for assigned vehicles
- End time must be after start time
- Loading details mandatory for completion
- Loading duration tracked for performance analysis

---

## Dependencies

- **US-072**: Assign Loading/Unloading Point (vehicle must be assigned)
- **US-070**: Scale-Out with Net Weight (weight data reference)

---

## Technical Notes

- Time entries should use server timestamp
- Loading state persisted immediately
- Duration calculation: End Time - Start Time

---

## Testing Scenarios

1. **Scenario 1**: Record load start → Start time saved
2. **Scenario 2**: Record load end → End time validated, duration calculated
3. **Scenario 3**: End time before start → Validation error
4. **Scenario 4**: Loading details → All fields saved correctly

---

## Definition of Done

- [ ] Load start/end times recorded
- [ ] Time validation working
- [ ] Loading details captured
- [ ] Data linked to vehicle/TO
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Code reviewed
- [ ] UAT approved

---

**Last Updated**: 2026-02-17  
**Source**: `source-documents/04-wbs/stories-table.md` (WBS - Source of Truth)

