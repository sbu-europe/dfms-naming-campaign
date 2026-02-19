---
title: Exception Recording
story_id: US-080
epic_id: EPIC-014
epic_name: Quality Control & Quality Assurance Workflow
phase: phase-1
module: Quality Control
priority: Medium
status: Pending
sprint: Sprint 10-11
story_points: 3
created: 2026-02-17
updated: 2026-02-17
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-078-sample-creation.md
  - US-090-qc-pass-fail-aut-pass-tracking.md
dependencies:
  - US-078-sample-creation.md (Sample must exist)
tags: [qc, quality-control, exception-recording, photo-upload, phase-1]
---

# US-080: Exception Recording

## User Story

**As a** QC Supervisor  
**I want to** capture photos of defects  
**So that** evidence is preserved

## Business Context

During QC inspection, defects or exceptions need to be documented with visual evidence:
- Photo evidence for quality issues
- Timestamped photo records
- Link photos to samples/vehicles
- Audit trail for quality decisions

**Key Requirements**:
- Photo upload support
- Timestamp association
- Link to vehicle/sample/TO
- Photo retention for audit

---

## Acceptance Criteria

### AC-1: Photo Upload

#### AC-1.1: Photo Upload Support
- [ ] System SHALL support photo upload (one or more photos)
- [ ] System SHALL accept common image formats (JPEG, PNG)
- [ ] System SHALL validate photo file size and format
- [ ] System SHALL provide upload progress indicator

#### AC-1.2: Photo Association
- [ ] System SHALL store each photo with associated timestamp
- [ ] System SHALL link photos to relevant vehicle
- [ ] System SHALL link photos to sample (if applicable)
- [ ] System SHALL link photos to TO/Challan record

### AC-2: Photo Management

#### AC-2.1: Photo Storage
- [ ] System SHALL retain photos for audit and traceability purposes
- [ ] System SHALL store photos securely
- [ ] System SHALL support photo viewing/downloading

#### AC-2.2: Photo Display
- [ ] System SHALL display photos in QC context
- [ ] System SHALL show photo timestamps
- [ ] System SHALL allow photo deletion (with approval)

---

## Functional Requirements

### FR-1: Photo Upload
- System SHALL support multiple photo uploads per inspection
- System SHALL compress photos for storage efficiency
- System SHALL validate photo metadata

### FR-2: Photo Linking
- System SHALL link photos to QC records
- System SHALL maintain photo-to-sample mapping
- System SHALL support photo search/filtering

---

## Business Rules

- Photos must be linked to QC inspection
- Photos retained for audit period (configurable)
- Photo deletion requires approval
- Maximum photo size limit (configurable)

---

## Dependencies

- **US-078**: Sample Creation (sample must exist for sample photos)
- **US-077**: Pre-QC Context Display (QC context must exist)

---

## Technical Notes

- Photo storage in cloud storage or file system
- Photo metadata stored in database
- Photo compression for performance
- Photo access control based on roles

---

## Testing Scenarios

1. **Scenario 1**: Upload photo → Photo saved and linked
2. **Scenario 2**: Multiple photos → All photos saved correctly
3. **Scenario 3**: Photo display → Photos shown in QC context
4. **Scenario 4**: Photo deletion → Requires approval

---

## Definition of Done

- [ ] Photo upload working
- [ ] Photos linked to vehicle/sample/TO
- [ ] Photo timestamps recorded
- [ ] Photo display working
- [ ] Photo retention configured
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Code reviewed
- [ ] UAT approved

---

**Last Updated**: 2026-02-17  
**Source**: `source-documents/04-wbs/stories-table.md` (WBS - Source of Truth)

