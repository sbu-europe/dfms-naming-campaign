---
title: QR/Barcode Label
story_id: US-084
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
  - US-079-sample-labeling.md
  - US-078-sample-creation.md
dependencies:
  - US-078-sample-creation.md (Sample must exist)
tags: [qc, quality-control, qr-code, barcode, labeling, phase-1]
---

# US-084: QR/Barcode Label

## User Story

**As a** QC Supervisor  
**I want** system to generate a QR Code for each sample  
**So that** samples are uniquely identified and traceable

## Business Context

Each sample requires unique identification:
- QR code generation per sample
- Unique data values per QR code
- Separate QR code per sample under same vehicle
- QR code linked to sample and unload item

**Key Requirements**:
- Unique QR code per sample
- QR code with unique data values
- QR code linked to sample and unload item
- QR code available for printing

---

## Acceptance Criteria

### AC-1: QR Code Generation

#### AC-1.1: Unique QR Code Per Sample
- [ ] System SHALL generate unique QR code for each individual sample
- [ ] System SHALL ensure separate QR code is generated per sample under same vehicle
- [ ] System SHALL ensure QR code has unique data values
- [ ] System SHALL prevent duplicate QR codes

#### AC-1.2: QR Code Linking
- [ ] System SHALL link each QR code to its corresponding sample
- [ ] System SHALL link QR code to unload item
- [ ] System SHALL maintain QR code to sample mapping

### AC-2: QR Code Data

#### AC-2.1: QR Code Content
- [ ] System SHALL encode sample ID in QR code
- [ ] System SHALL encode unload item code in QR code
- [ ] System SHALL encode vehicle number in QR code
- [ ] System SHALL encode timestamp in QR code

#### AC-2.2: QR Code Storage
- [ ] System SHALL retain all sampling and QR data for traceability
- [ ] System SHALL store QR code image
- [ ] System SHALL store QR code data for scanning

---

## Functional Requirements

### FR-1: QR Code Generation
- System SHALL generate QR codes in standard format
- System SHALL encode required data in QR code
- System SHALL validate QR code uniqueness

### FR-2: QR Code Management
- System SHALL support QR code printing
- System SHALL support QR code scanning
- System SHALL maintain QR code history

---

## Business Rules

- One QR code per sample
- QR code must be unique
- QR code linked to sample and unload item
- QR code cannot be modified after generation

---

## Dependencies

- **US-078**: Sample Creation (sample must exist)
- **US-079**: Sample Labeling (labeling workflow)

---

## Technical Notes

- QR code generation using standard library
- QR code data includes sample metadata
- QR code stored as image and data

---

## Testing Scenarios

1. **Scenario 1**: Generate QR code → Unique code created
2. **Scenario 2**: Multiple samples → Separate QR codes
3. **Scenario 3**: QR code scan → Sample details retrieved
4. **Scenario 4**: QR code print → Code printable

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

