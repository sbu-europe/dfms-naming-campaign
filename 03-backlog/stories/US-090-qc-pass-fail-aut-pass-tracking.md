---
title: QC Pass/Fail/Auto-pass Tracking
story_id: US-090
epic_id: EPIC-014
epic_name: Quality Control & Quality Assurance Workflow
phase: phase-1
module: Quality Control
priority: Medium
status: Pending
sprint: Sprint 16
story_points: 5
created: 2026-02-17
updated: 2026-02-17
source_documents:
  - ../../../../01-source/01-prd/DFMS_Product_Requirements_Document_v3.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-088-lab-report-upload.md
  - US-091-escalation-workflow.md
dependencies:
  - US-088-lab-report-upload.md (Lab results must be available)
tags: [qc, quality-control, pass-fail, decision, phase-1]
---

# US-090: QC Pass/Fail/Auto-pass Tracking

## User Story

**As a** QC Inspector  
**I want to** record QC outcomes  
**So that** downstream processes can proceed

## Business Context

QC decision determines:
- Whether product can proceed to next stage
- Unloading bay assignment
- Quality compliance
- Downstream workflow triggers

**Key Requirements**:
- Record QC status (Pass, Fail, Auto-pass)
- Store QC remarks
- Allow re-initiation of sampling
- Assign vehicle to unloading bay upon Pass/Auto-pass

---

## Acceptance Criteria

### AC-1: QC Status Selection

#### AC-1.1: Status Options
- [ ] System SHALL allow QC status selection including:
  - QC Pass
  - QC Fail
  - QC Auto-pass
- [ ] System SHALL validate status selection
- [ ] System SHALL require status selection for completion

#### AC-1.2: QC Remarks
- [ ] System SHALL allow QC Inspector to add remarks if required
- [ ] System SHALL store QC remarks
- [ ] System SHALL make remarks visible in QC history

### AC-2: QC Decision Processing

#### AC-2.1: Re-initiation Support
- [ ] System SHALL allow re-initiation of sampling in case of QC Fail followed by Pass
- [ ] System SHALL track sampling attempts
- [ ] System SHALL maintain sampling history

#### AC-2.2: Downstream Assignment
- [ ] System SHALL assign vehicle to appropriate Unloading Bay/Unit/Point upon QC Pass or Auto-pass
- [ ] System SHALL make QC outcome available to downstream operational processes
- [ ] System SHALL trigger downstream workflows based on QC decision

---

## Functional Requirements

### FR-1: QC Decision Workflow
- System SHALL support QC decision entry
- System SHALL validate decision completeness
- System SHALL trigger downstream processes

### FR-2: Decision Tracking
- System SHALL maintain QC decision history
- System SHALL track decision timestamps
- System SHALL record decision maker

---

## Business Rules

- QC decision mandatory for completion
- Auto-pass available for certain products
- QC Fail allows re-sampling
- QC Pass/Auto-pass triggers unloading bay assignment

---

## Dependencies

- **US-088**: Lab Report Upload (lab results must be available)
- **US-078**: Sample Creation (samples must exist)
- **US-042**: Unloading Operations (unloading bays must exist)

---

## Technical Notes

- QC decision state machine
- Downstream workflow triggers
- Decision audit trail

---

## Testing Scenarios

1. **Scenario 1**: Record QC Pass → Vehicle assigned to unloading bay
2. **Scenario 2**: Record QC Fail → Re-sampling enabled
3. **Scenario 3**: Record QC Auto-pass → Auto-assignment triggered
4. **Scenario 4**: QC decision → Downstream processes triggered

---

## Definition of Done

- [ ] QC status selection working
- [ ] QC remarks captured
- [ ] Re-initiation support working
- [ ] Downstream assignment triggered
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Code reviewed
- [ ] UAT approved

---

**Last Updated**: 2026-02-17  
**Source**: `source-documents/04-wbs/stories-table.md` (WBS - Source of Truth)

