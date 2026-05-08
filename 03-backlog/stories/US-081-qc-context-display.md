---
title: QC Context Display
story_id: US-081
epic_id: EPIC-014
epic_name: Quality Control & Quality Assurance Workflow
phase: phase-1
module: Quality Control
priority: Medium
status: Pending
sprint: Sprint 14
story_points: 3
created: 2026-02-17
updated: 2026-02-17
source_documents:
  - ../../../../01-source/01-prd/PRD_DFMS_v1.0.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-077-pre-qc-context-display.md
  - US-083-configurable-form-checklist-sampling.md
dependencies:
  - US-077-pre-qc-context-display.md (Context must be available)
tags: [qc, quality-control, context-display, checklist, phase-1]
---

# US-081: QC Context Display

## User Story

**As a** QC Inspector  
**I want to** see supplier, PO, and RM item code  
**So that** I can ensure correct checklist usage

## Business Context

QC Inspectors need supplier and product context to:
- Select correct QC checklist
- Verify product matches order
- Ensure proper inspection procedures
- Maintain traceability

**Key Requirements**:
- Display supplier information
- Show PO reference
- Display Raw Material item code
- Show expected QC checklist

---

## Acceptance Criteria

### AC-1: Context Information Display

#### AC-1.1: Supplier Information
- [ ] System SHALL display Supplier name
- [ ] System SHALL display PO reference
- [ ] System SHALL display TO reference
- [ ] System SHALL display Raw Material item code

#### AC-1.2: Checklist Display
- [ ] System SHALL display expected QC checklist
- [ ] System SHALL ensure checklist is dynamically displayed based on product category
- [ ] System SHALL present all required QC information before allowing QC action

### AC-2: Context Validation

#### AC-2.1: Context Availability
- [ ] System SHALL validate vehicle is linked to valid Supplier Purchase Order / TO / Challan
- [ ] System SHALL block QC actions if context incomplete
- [ ] System SHALL display context errors clearly

#### AC-2.2: Checklist Selection
- [ ] System SHALL auto-select checklist based on product category
- [ ] System SHALL allow manual checklist override (if authorized)
- [ ] System SHALL validate checklist matches product type

---

## Functional Requirements

### FR-1: Context Data Source
- System SHALL fetch context from Supplier PO/TO/Challan
- System SHALL validate context completeness
- System SHALL handle missing context gracefully

### FR-2: Checklist Management
- System SHALL load checklist from master data
- System SHALL match checklist to product category
- System SHALL display checklist items

---

## Business Rules

- QC cannot proceed without complete context
- Checklist must match product category
- Supplier/PO information mandatory
- Raw Material item code required

---

## Dependencies

- **US-077**: Pre-QC Context Display (context must be available)
- **US-023**: Product Master Data (product categories must exist)
- **US-051**: QC Checklist Management (checklists must exist)

---

## Technical Notes

- Context data cached for performance
- Checklist loaded dynamically
- Context validation before QC actions

---

## Testing Scenarios

1. **Scenario 1**: Valid context → Supplier/PO/Item code displayed
2. **Scenario 2**: Product category match → Correct checklist displayed
3. **Scenario 3**: Missing context → QC actions blocked
4. **Scenario 4**: Checklist override → Manual selection allowed

---

## Definition of Done

- [ ] Supplier/PO/Item code displayed
- [ ] Checklist displayed based on product category
- [ ] QC actions blocked if context missing
- [ ] Checklist validation working
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Code reviewed
- [ ] UAT approved

---

**Last Updated**: 2026-02-17  
**Source**: `source-documents/04-wbs/stories-table.md` (WBS - Source of Truth)

