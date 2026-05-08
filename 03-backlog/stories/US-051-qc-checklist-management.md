---
title: QC Checklist Management (Visual Inspection)
story_id: US-051
phase: phase-1
module: Quality Control
priority: Medium
status: Pending
epic: Quality Control & Quality Assurance Workflow
epic_id: EPIC-014
epic_name: Quality Control & Quality Assurance Workflow
sprint: Sprint 11
story_points: 3
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../01-source/01-prd/PRD_DFMS_v1.0.md
  - ../../../05-modules/04-poi-operations/qc-workflow.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-046-qc-test-configuration.md
dependencies:
  - US-046-qc-test-configuration.md
tags: [qc, checklist, inspection, medium-priority]
---

# US-051: QC Checklist Management (Visual Inspection)

## User Story

**As a** QC Inspector  
**I want to** perform visual inspections using checklists  
**So that** quick quality checks can be done without lab testing

## Business Context

Visual inspection checklists provide:
- **Quick Assessment**: Fast quality checks at gate/warehouse
- **Standardization**: Consistent inspection criteria
- **Documentation**: Record visual inspection results
- **Early Detection**: Identify obvious quality issues early

---

## Acceptance Criteria

### AC-1: Checklist Execution
- [ ] System SHALL display inspection checklist
- [ ] System SHALL allow marking items as:
  - Pass
  - Fail
  - N/A
- [ ] System SHALL require photos for failed items
- [ ] System SHALL calculate overall checklist score

### AC-2: Checklist Items
- [ ] System SHALL support item types:
  - Visual check (color, appearance)
  - Measurement (size, weight)
  - Count (quantity verification)
  - Boolean (present/absent)

### AC-3: Checklist Completion
- [ ] System SHALL validate all required items checked
- [ ] System SHALL auto-determine pass/fail based on critical items
- [ ] System SHALL allow adding notes per item

---

## Functional Requirements

### FR-001: Checklist Interface
- [Critical] Mobile-friendly checklist form
- [Critical] Photo capture per item
- [High] Offline mode
- [Medium] Voice notes

---

## Business Rules

### BR-CHECK-001: Critical Items
- If any critical item fails, overall checklist fails
- **Enforcement**: Business logic

---

## Data Model

```typescript
QCChecklistExecution {
  id: UUID (PK)
  trip_id: UUID (FK)
  checklist_template_id: UUID (FK)
  
  checklist_items: JSON (array of {item_id, status, notes, photos})
  
  overall_score: Decimal
  overall_result: Enum (Pass, Fail)
  
  inspected_by: UUID (FK)
  inspected_at: Timestamp
}
```

---

## UI/UX Requirements

```
┌─────────────────────────────────────────┐
│ Visual Inspection Checklist             │
├─────────────────────────────────────────┤
│ Trip: TRIP-20260211-0042                │
│ Product: Live Broiler                   │
│                                         │
│ 1. Vehicle Cleanliness: *               │
│    ✅ Pass  ⚪ Fail  ⚪ N/A              │
│                                         │
│ 2. Product Appearance: *                │
│    ✅ Pass  ⚪ Fail  ⚪ N/A              │
│                                         │
│ 3. Packaging Condition: *               │
│    ⚪ Pass  ❌ Fail  ⚪ N/A              │
│    [📷 Photo Required]                  │
│                                         │
│ Overall: 2/3 Pass (67%)                 │
│                                         │
│ [Submit Inspection]                     │
└─────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
POST /api/v1/qc-checklist-executions
Body: {
  trip_id, checklist_template_id,
  checklist_items: [{item_id, status, notes, photos}]
}
```

---

## Testing Scenarios

### Happy Path
1. Open checklist → Items displayed
2. Mark items → Score calculated
3. Submit → Checklist saved

---

## Dependencies

### Prerequisites
- ✅ US-046: QC Test Configuration

### Enables
- → Quick quality checks
- → Early issue detection

---

## Definition of Done
- [ ] Checklist execution functional
- [ ] Photo capture working
- [ ] Score calculation accurate
- [ ] Offline mode working
- [ ] Unit tests > 80%
- [ ] UAT approved

---

**Story Points**: 3  
**Estimated Hours**: 24 hours  
**Sprint**: Sprint 15  
**Priority**: Medium

