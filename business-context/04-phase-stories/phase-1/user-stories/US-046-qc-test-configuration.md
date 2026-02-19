---
title: QC Test Configuration & Checklist Management
story_id: US-046
phase: phase-1
module: Quality Control
priority: Medium
status: Pending
epic: QC Configuration
sprint: Sprint 14
story_points: 3
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../03-module-specifications/04-operations-support/qc-workflow.md
related_stories:
  - US-044-qc-lab-testing.md
  - US-051-qc-checklist-management.md
dependencies: []
tags: [qc, configuration, checklist, medium-priority]
---

# US-046: QC Test Configuration & Checklist Management

## User Story

**As a** QC Manager  
**I want to** configure QC tests and checklists for different products  
**So that** appropriate quality checks are performed consistently

## Business Context

Test configuration ensures:
- **Standardization**: Consistent quality checks
- **Product-specific Tests**: Different tests for different products
- **Compliance**: Meet regulatory requirements
- **Flexibility**: Easy to update test parameters

---

## Acceptance Criteria

### AC-1: Test Template Creation
- [ ] System SHALL allow creating test templates with:
  - Template name *
  - Product category *
  - Test parameters (list of parameters to check)
  - Acceptance criteria (min/max values)
  - Test method
  - Required equipment
- [ ] System SHALL allow assigning templates to products

### AC-2: Test Parameters
- [ ] System SHALL support parameter types:
  - Numeric (with min/max range)
  - Boolean (pass/fail)
  - Text (descriptive)
  - Multiple choice
- [ ] System SHALL allow defining acceptance criteria per parameter

### AC-3: Checklist Configuration
- [ ] System SHALL allow creating inspection checklists
- [ ] System SHALL support checklist items with:
  - Item description
  - Item type (visual, measurement, test)
  - Required/optional
  - Pass/fail criteria

---

## Functional Requirements

### FR-001: Configuration UI
- [Critical] Test template CRUD
- [Critical] Parameter definition
- [High] Template assignment to products
- [Medium] Template versioning

---

## Business Rules

### BR-CONFIG-001: Mandatory Tests
- Certain products require mandatory tests (e.g., perishables)
- **Enforcement**: Product configuration

---

## Data Model

```typescript
QCTestTemplate {
  id: UUID (PK)
  template_name: String
  product_category: Enum
  
  test_parameters: JSON (array of parameters)
  acceptance_criteria: JSON
  test_method: Text
  required_equipment: JSON (nullable)
  
  is_active: Boolean
  version: Integer
  
  created_by: UUID (FK)
  created_at: Timestamp
}

ProductQCConfig {
  id: UUID (PK)
  product_id: UUID (FK)
  qc_template_id: UUID (FK)
  
  is_mandatory: Boolean
  sampling_frequency: Enum (Every_Shipment, Random, Periodic)
}
```

---

## UI/UX Requirements

```
┌─────────────────────────────────────────┐
│ Create QC Test Template                 │
├─────────────────────────────────────────┤
│ Template Name: *                        │
│ [Live Broiler Quality Test]             │
│                                         │
│ Product Category: *                     │
│ [Poultry - Live Birds      ▼]           │
│                                         │
│ Test Parameters:                        │
│ ┌─────────────────────────────────────┐ │
│ │ 1. Weight (Numeric)                 │ │
│ │    Min: 1.5 KG, Max: 2.5 KG         │ │
│ │ 2. Health Status (Boolean)          │ │
│ │    Pass/Fail                        │ │
│ │ 3. Appearance (Multiple Choice)     │ │
│ │    Good/Fair/Poor                   │ │
│ └─────────────────────────────────────┘ │
│ [+ Add Parameter]                       │
│                                         │
│ [Cancel]              [Save Template]   │
└─────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
POST /api/v1/qc-test-templates
GET /api/v1/qc-test-templates
PATCH /api/v1/qc-test-templates/{template_id}

POST /api/v1/products/{product_id}/qc-config
Body: {qc_template_id, is_mandatory, sampling_frequency}
```

---

## Testing Scenarios

### Happy Path
1. Create template → Template saved
2. Assign to product → Configuration active
3. QC test uses template → Parameters loaded

---

## Dependencies

### Prerequisites
- None

### Enables
- → US-044: QC Lab Testing (uses templates)

---

## Definition of Done
- [ ] Template CRUD functional
- [ ] Parameter configuration
- [ ] Product assignment
- [ ] Unit tests > 80%
- [ ] UAT approved

---

**Story Points**: 3  
**Estimated Hours**: 24 hours  
**Sprint**: Sprint 14  
**Priority**: Medium

