---
title: Sample Labeling
story_id: US-079
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
  - US-084-qr-barcode-label.md
dependencies:
  - US-078-sample-creation.md (Sample must be created first)
tags: [qc, quality-control, labeling, phase-1]
---

# US-079: Sample Labeling

## User Story

**As a** QC Supervisor  
**I want to** have each sample uniquely labeled  
**So that** lab tracking remains accurate

## Business Context

Each sample must be uniquely identified for:
- Lab testing traceability
- Sample tracking throughout QC workflow
- Preventing sample mix-ups
- Audit compliance

**Key Requirements**:
- Unique QR code per sample
- QR code linked to unload item code
- QR code uniquely identifies sample/bag
- QR linkage stored for traceability

---

## Acceptance Criteria

### AC-1: QR Code Generation

#### AC-1.1: Unique QR Code
- [ ] System SHALL generate exactly one unique QR code per sample
- [ ] System SHALL tie QR code to corresponding unload item code
- [ ] System SHALL ensure QR code uniquely identifies specific sample or bag
- [ ] System SHALL prevent duplicate QR codes

#### AC-1.2: QR Code Storage
- [ ] System SHALL store QR linkage for traceability
- [ ] System SHALL associate QR code with sample record
- [ ] System SHALL make QR code available for printing/display

### AC-2: Sample Labeling Workflow

#### AC-2.1: Label Generation
- [ ] System SHALL generate QR code when sample is created and confirmed
- [ ] System SHALL display QR code for printing
- [ ] System SHALL support QR code re-generation if needed

#### AC-2.2: Label Tracking
- [ ] System SHALL maintain QR code to sample mapping
- [ ] System SHALL support QR code scanning for sample lookup
- [ ] System SHALL track QR code usage in downstream processes

---

## Functional Requirements

### FR-1: QR Code Format
- System SHALL generate QR codes in standard format
- System SHALL encode sample ID and unload item code
- System SHALL support QR code validation

### FR-2: Label Management
- System SHALL support label printing
- System SHALL maintain label history
- System SHALL support label re-print

---

## Business Rules

- One QR code per sample
- QR code cannot be changed after generation
- QR code must be unique across all samples
- QR code linked to unload item code

---

## Dependencies

- **US-078**: Sample Creation (sample must exist)
- **US-076**: Unload Start/End Date & Time Entry (unload item must exist)

---

## Technical Notes

- QR code generation should be deterministic
- QR code data includes sample ID and metadata
- QR code stored as image and data

---

## Testing Scenarios

1. **Scenario 1**: Create sample → QR code generated
2. **Scenario 2**: Multiple samples → Unique QR codes
3. **Scenario 3**: QR code scan → Sample details retrieved
4. **Scenario 4**: QR code re-print → Same code displayed

---

## Definition of Done

- [ ] QR code generated per sample
- [ ] QR code unique and linked correctly
- [ ] QR code available for printing
- [ ] QR code scanning working
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Code reviewed
- [ ] UAT approved

---

**Last Updated**: 2026-02-17  
**Source**: `source-documents/04-wbs/stories-table.md` (WBS - Source of Truth)

