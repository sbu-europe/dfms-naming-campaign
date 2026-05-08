---
title: Create Lab Request
story_id: US-086
epic_id: EPIC-014
epic_name: Quality Control & Quality Assurance Workflow
phase: phase-1
module: Quality Control
priority: Medium
status: Pending
sprint: Sprint 15
story_points: 5
created: 2026-02-17
updated: 2026-02-17
source_documents:
  - ../../../../01-source/01-prd/PRD_DFMS_v1.0.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-078-sample-creation.md
  - US-084-qr-barcode-label.md
  - US-088-lab-report-upload.md
dependencies:
  - US-078-sample-creation.md (Sample must exist)
  - US-084-qr-barcode-label.md (QR code must exist)
tags: [qc, quality-control, lab-testing, lab-request, phase-1]
---

# US-086: Create Lab Request

## User Story

**As a** QC Inspector  
**I want to** route lab test request to lab personnel  
**So that** samples are tested systematically

## Business Context

Lab testing requires:
- Lab test request creation per sample
- Sample send for test tracking
- QR code scanning for lab start time
- Test name and result entry
- Lab report upload

**Key Requirements**:
- Create lab test requests per unload item/sample
- Record sample send for test timestamp
- QR code scan triggers lab test start time
- Test name, results, and report upload

---

## Acceptance Criteria

### AC-1: Lab Test Request Creation

#### AC-1.1: Request Creation
- [ ] System SHALL allow creation of lab test requests per unload item/sample
- [ ] System SHALL record Sample Send for Test Date & Time
- [ ] System SHALL link request to sample and vehicle
- [ ] System SHALL validate sample exists and is eligible

#### AC-1.2: QR Code Scanning
- [ ] System SHALL allow QA Lab Technician to scan sample QR code
- [ ] System SHALL automatically trigger and record lab test start time based on QR scan
- [ ] System SHALL treat QR scan time as authoritative lab start time
- [ ] System SHALL log send/receive timestamps

### AC-2: Test Management

#### AC-2.1: Test Entry
- [ ] System SHALL allow Lab Technician to enter test names
- [ ] System SHALL allow Lab Technician to input results
- [ ] System SHALL allow Lab Technician to upload lab reports in PNG or PDF format
- [ ] System SHALL allow entry of estimated test completion time

#### AC-2.2: Test Tracking
- [ ] System SHALL track expected completion time for each test under sample
- [ ] System SHALL associate all lab test data with corresponding sample, vehicle, and TO/Unload Item
- [ ] System SHALL retain full audit logs for traceability

---

## Functional Requirements

### FR-1: Lab Request Workflow
- System SHALL support request creation by QC Supervisor
- System SHALL support request assignment to Lab Technician
- System SHALL track request status

### FR-2: QR Code Integration
- System SHALL support QR code scanning
- System SHALL validate QR code belongs to sample
- System SHALL record scan timestamp as lab start time

---

## Business Rules

- Lab request can only be created for existing samples
- QR code scan required to start lab test
- Lab report upload mandatory for test completion
- Estimated completion time optional but recommended

---

## Dependencies

- **US-078**: Sample Creation (sample must exist)
- **US-084**: QR/Barcode Label (QR code must exist)
- **US-079**: Sample Labeling (sample must be labeled)

---

## Technical Notes

- Lab request workflow state machine
- QR code scanning via camera or manual entry
- Lab report storage in cloud storage
- Audit log for all lab activities

---

## Testing Scenarios

1. **Scenario 1**: Create lab request → Request created and assigned
2. **Scenario 2**: Scan QR code → Lab test start time recorded
3. **Scenario 3**: Enter test results → Results saved correctly
4. **Scenario 4**: Upload lab report → Report linked to test

---

## Definition of Done

- [ ] Lab request creation working
- [ ] QR code scanning working
- [ ] Lab test start time recorded
- [ ] Test results entry working
- [ ] Lab report upload working
- [ ] Audit logs complete
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Code reviewed
- [ ] UAT approved

---

**Last Updated**: 2026-02-17  
**Source**: `source-documents/04-wbs/stories-table.md` (WBS - Source of Truth)

