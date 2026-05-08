---
title: Sampling Timestamp
story_id: US-085
epic_id: EPIC-014
epic_name: Quality Control & Quality Assurance Workflow
phase: phase-1
module: Quality Control
priority: Medium
status: Pending
sprint: Sprint 14
story_points: 2
created: 2026-02-17
updated: 2026-02-17
source_documents:
  - ../../../../01-source/01-prd/PRD_DFMS_v1.0.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-078-sample-creation.md
  - US-082-sample-collection-event.md
dependencies:
  - US-078-sample-creation.md (Sample must exist)
tags: [qc, quality-control, timestamp, traceability, phase-1]
---

# US-085: Sampling Timestamp

## User Story

**As a** QC Supervisor  
**I want to** record sampling start and end times  
**So that** traceability is maintained for QC audit purposes

## Business Context

Sampling timestamps are critical for:
- QC traceability and audit
- Performance measurement
- Compliance requirements
- Chronological correctness

**Key Requirements**:
- Record sampling start and end times
- Validate time sequence
- Associate with sample, vehicle, and TO/Challan
- Ensure chronological correctness

---

## Acceptance Criteria

### AC-1: Timestamp Recording

#### AC-1.1: Sampling Start Time
- [ ] System SHALL capture Sampling Start Date & Time
- [ ] System SHALL allow manual entry of start time
- [ ] System SHALL validate start time is not in future
- [ ] System SHALL record start time when sampling begins

#### AC-1.2: Sampling End Time
- [ ] System SHALL capture Sampling End Date & Time
- [ ] System SHALL allow manual entry of end time
- [ ] System SHALL validate Sampling End Date & Time does not precede Sampling Start Date & Time
- [ ] System SHALL record end time when sampling completes

### AC-2: Timestamp Association

#### AC-2.1: Data Linking
- [ ] System SHALL associate timestamps with relevant sample
- [ ] System SHALL associate timestamps with vehicle
- [ ] System SHALL associate timestamps with TO/Challan record
- [ ] System SHALL ensure chronological correctness for QC traceability

#### AC-2.2: Timestamp Validation
- [ ] System SHALL validate time sequence (end >= start)
- [ ] System SHALL prevent future-dated timestamps
- [ ] System SHALL validate timestamps against system clock

---

## Functional Requirements

### FR-1: Timestamp Management
- System SHALL support manual timestamp entry
- System SHALL support automatic timestamp capture
- System SHALL validate timestamp format

### FR-2: Chronological Validation
- System SHALL ensure end time >= start time
- System SHALL validate timestamps are reasonable
- System SHALL prevent timestamp manipulation

---

## Business Rules

- Sampling start time must be recorded
- Sampling end time must be after start time
- Timestamps must be associated with sample
- Chronological correctness mandatory

---

## Dependencies

- **US-078**: Sample Creation (sample must exist)
- **US-082**: Sample Collection Event (sampling workflow)

---

## Technical Notes

- Timestamps stored in UTC
- Timestamp validation on save
- Timestamp display in local timezone

---

## Testing Scenarios

1. **Scenario 1**: Record start and end times → Timestamps saved correctly
2. **Scenario 2**: End time before start → Validation error
3. **Scenario 3**: Timestamps associated → Linked to sample/vehicle/TO
4. **Scenario 4**: Future timestamp → Validation error

---

## Definition of Done

- [ ] Sampling timestamps recorded
- [ ] Time sequence validation working
- [ ] Timestamps associated correctly
- [ ] Chronological correctness ensured
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Code reviewed
- [ ] UAT approved

---

**Last Updated**: 2026-02-17  
**Source**: `source-documents/04-wbs/stories-table.md` (WBS - Source of Truth)

