---
title: Lab Estimated Completion
story_id: US-087
epic_id: EPIC-014
epic_name: Quality Control & Quality Assurance Workflow
phase: phase-1
module: Quality Control
priority: Medium
status: Pending
sprint: Sprint 10-11
story_points: 2
created: 2026-02-17
updated: 2026-02-17
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-086-create-lab-request.md
  - US-089-lab-status-monitoring.md
dependencies:
  - US-086-create-lab-request.md (Lab test must exist)
tags: [qc, quality-control, lab-testing, eta, phase-1]
---

# US-087: Lab Estimated Completion

## User Story

**As a** Lab personnel  
**I want to** enter estimated time  
**So that** stakeholders can plan

## Business Context

Lab tests require time estimates for:
- Stakeholder planning
- SLA tracking
- Resource allocation
- Delay prevention

**Key Requirements**:
- Enter estimated completion time per test
- Associate ETA with sample and test record
- Make ETA visible to stakeholders
- Retain ETA for tracking and audit

---

## Acceptance Criteria

### AC-1: Estimated Time Entry

#### AC-1.1: ETA Entry
- [ ] System SHALL allow Lab Technician to enter estimated completion time (ETA) for each lab test under specific sample
- [ ] System SHALL capture and store estimated completion time per test
- [ ] System SHALL validate ETA is in future
- [ ] System SHALL allow ETA updates

#### AC-1.2: ETA Association
- [ ] System SHALL associate ETA with corresponding sample and test record
- [ ] System SHALL link ETA to vehicle and TO/Unload Item
- [ ] System SHALL maintain ETA history

### AC-2: ETA Visibility

#### AC-2.1: Stakeholder Visibility
- [ ] System SHALL make ETA visible to relevant stakeholders for planning purposes
- [ ] System SHALL display ETA in lab monitoring dashboard
- [ ] System SHALL send notifications if ETA exceeded

#### AC-2.2: ETA Tracking
- [ ] System SHALL retain ETA entry for tracking and audit
- [ ] System SHALL track ETA vs actual completion time
- [ ] System SHALL calculate ETA accuracy metrics

---

## Functional Requirements

### FR-1: ETA Management
- System SHALL support ETA entry per test
- System SHALL support ETA updates
- System SHALL validate ETA format

### FR-2: ETA Monitoring
- System SHALL track ETA vs actual completion
- System SHALL alert if ETA exceeded
- System SHALL calculate ETA accuracy

---

## Business Rules

- ETA optional but recommended
- ETA must be in future
- ETA can be updated
- ETA visible to stakeholders

---

## Dependencies

- **US-086**: Create Lab Request (lab test must exist)

---

## Technical Notes

- ETA stored as datetime
- ETA comparison with actual completion time
- ETA notifications configurable

---

## Testing Scenarios

1. **Scenario 1**: Enter ETA → ETA saved and displayed
2. **Scenario 2**: Update ETA → ETA updated correctly
3. **Scenario 3**: ETA visibility → Stakeholders see ETA
4. **Scenario 4**: ETA exceeded → Notification sent

---

## Definition of Done

- [ ] ETA entry working
- [ ] ETA associated with test/sample
- [ ] ETA visible to stakeholders
- [ ] ETA tracking working
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Code reviewed
- [ ] UAT approved

---

**Last Updated**: 2026-02-17  
**Source**: `source-documents/04-wbs/stories-table.md` (WBS - Source of Truth)

