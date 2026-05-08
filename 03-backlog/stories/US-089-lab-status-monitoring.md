---
title: Lab Status Monitoring
story_id: US-089
epic_id: EPIC-014
epic_name: Quality Control & Quality Assurance Workflow
phase: phase-1
module: Quality Control
priority: Medium
status: Pending
sprint: Sprint 15
story_points: 3
created: 2026-02-17
updated: 2026-02-17
source_documents:
  - ../../../../01-source/01-prd/PRD_DFMS_v1.0.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-086-create-lab-request.md
  - US-087-lab-estimated-completion.md
dependencies:
  - US-086-create-lab-request.md (Lab tests must exist)
tags: [qc, quality-control, lab-testing, status-monitoring, phase-1]
---

# US-089: Lab Status Monitoring

## User Story

**As a** QC Inspector  
**I want to** track lab progress  
**So that** I can monitor test completion status

## Business Context

Lab status monitoring enables:
- Real-time visibility of test progress
- Bottleneck identification
- SLA tracking
- Resource allocation

**Key Requirements**:
- Display lab test status (To-Do, WIP, Completed)
- Update status automatically based on activities
- Present status clearly for progress tracking

---

## Acceptance Criteria

### AC-1: Lab Status Display

#### AC-1.1: Status Types
- [ ] System SHALL display lab test status for each sample and test as:
  - To-Do (not started)
  - Work In Progress (WIP) (in progress)
  - Completed (finished)
- [ ] System SHALL show status per test under each sample
- [ ] System SHALL highlight current status clearly

#### AC-1.2: Status Updates
- [ ] System SHALL update status automatically based on lab activities:
  - QR scan → Status changes to WIP
  - Result submission → Status remains WIP
  - Completion → Status changes to Completed
- [ ] System SHALL reflect status changes in real-time

### AC-2: Progress Tracking

#### AC-2.1: Status Visibility
- [ ] System SHALL present current status clearly for progress tracking
- [ ] System SHALL show status in lab monitoring dashboard
- [ ] System SHALL support status filtering

#### AC-2.2: Status History
- [ ] System SHALL maintain status change history
- [ ] System SHALL record status change timestamps
- [ ] System SHALL track status change user

---

## Functional Requirements

### FR-1: Status Management
- System SHALL support status state machine
- System SHALL validate status transitions
- System SHALL prevent invalid status changes

### FR-2: Status Monitoring
- System SHALL provide status dashboard
- System SHALL support status filtering and search
- System SHALL calculate status metrics

---

## Business Rules

- Status transitions: To-Do → WIP → Completed
- Status cannot go backwards
- Status updates automatic based on activities
- Status visible to authorized users

---

## Dependencies

- **US-086**: Create Lab Request (lab tests must exist)
- **US-084**: QR/Barcode Label (QR scan triggers WIP)

---

## Technical Notes

- Status state machine implementation
- Real-time status updates via WebSocket
- Status history maintained for audit

---

## Testing Scenarios

1. **Scenario 1**: Create lab request → Status: To-Do
2. **Scenario 2**: Scan QR code → Status: WIP
3. **Scenario 3**: Submit results → Status: WIP
4. **Scenario 4**: Complete test → Status: Completed

---

## Definition of Done

- [ ] Lab status displayed correctly
- [ ] Status updates automatically
- [ ] Status dashboard working
- [ ] Status history maintained
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Code reviewed
- [ ] UAT approved

---

**Last Updated**: 2026-02-17  
**Source**: `source-documents/04-wbs/stories-table.md` (WBS - Source of Truth)

