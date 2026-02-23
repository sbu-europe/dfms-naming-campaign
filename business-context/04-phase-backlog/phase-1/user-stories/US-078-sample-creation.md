---
title: Sample Creation
story_id: US-078
epic_id: EPIC-014
epic_name: Quality Control & Quality Assurance Workflow
phase: phase-1
module: Quality Control
priority: Medium
status: Pending
sprint: Sprint 10-11
story_points: 5
created: 2026-02-17
updated: 2026-02-17
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-077-pre-qc-context-display.md
  - US-079-sample-labeling.md
dependencies:
  - US-077-pre-qc-context-display.md (Must view context first)
tags: [qc, quality-control, sampling, phase-1]
---

# US-078: Sample Creation

## User Story

**As a** QC Supervisor  
**I want to** create samples with proper timestamps and remarks  
**So that** physical inspection is auditable

## Business Context

Sample creation is the first step in QC workflow:
- Records sampling start and end times
- Captures physical and nutritional analysis
- Determines initial QC result (Pass/Fail/Auto-pass)
- Initiates sample send process

**Key Requirements**:
- Timestamp tracking (start and end)
- Analysis text entry
- QC result selection
- Audit trail

---

## Acceptance Criteria

### AC-1: Sample Creation Process

#### AC-1.1: Sampling Start
- [ ] System SHALL allow sample creation for vehicle linked to valid TO/Challan
- [ ] System SHALL record Sampling Start Date & Time automatically
- [ ] System SHALL ensure sampling occurs only after QC sampling event creation
- [ ] System SHALL validate vehicle is eligible for sampling

#### AC-1.2: Sample Details Entry
- [ ] System SHALL allow QC Supervisor to enter:
  - Physical Analysis text
  - Nutritional Analysis text
  - Final Result selection (QC Pass, QC Fail, or QC Auto-Pass)
- [ ] System SHALL record Sampling End Date & Time
- [ ] System SHALL validate sampling timestamps are sequential (end time not earlier than start time)

### AC-2: Sample Association

#### AC-2.1: Data Linking
- [ ] System SHALL associate all QC inputs with corresponding vehicle number
- [ ] System SHALL link sample to TO/Challan
- [ ] System SHALL persist final QC result for downstream processing

#### AC-2.2: Sample Initiation
- [ ] System SHALL allow initiation of sample send process
- [ ] System SHALL validate sample completeness before send
- [ ] System SHALL track sample status

---

## Functional Requirements

### FR-1: Timestamp Management
- System SHALL record start time automatically
- System SHALL allow manual end time entry
- System SHALL validate time sequence

### FR-2: Analysis Entry
- System SHALL support text entry for physical analysis
- System SHALL support text entry for nutritional analysis
- System SHALL support QC result selection

---

## Business Rules

- Sampling can only occur after QC context display
- End time must be after start time
- Final result must be selected
- Sample must be linked to vehicle and TO/Challan

---

## Dependencies

- **US-077**: Pre-QC Context Display (must view context first)
- **US-076**: Unload Start/End Date & Time Entry (unloading must complete)

---

## Technical Notes

- Timestamps use server time
- Sample data persisted immediately
- Sample status tracked throughout workflow

---

## Testing Scenarios

1. **Scenario 1**: Create sample → Start time recorded, details saved
2. **Scenario 2**: End time before start → Validation error
3. **Scenario 3**: Complete sample → Result persisted, sample send enabled
4. **Scenario 4**: Sample association → Linked to vehicle and TO

---

## Definition of Done

- [ ] Sample creation working
- [ ] Timestamps recorded correctly
- [ ] Analysis text captured
- [ ] QC result selected
- [ ] Sample linked to vehicle/TO
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Code reviewed
- [ ] UAT approved

---

**Last Updated**: 2026-02-17  
**Source**: `source-documents/04-wbs/stories-table.md` (WBS - Source of Truth)

