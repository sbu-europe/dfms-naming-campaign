---
title: QC Rejection Workflow
story_id: US-049
phase: phase-1
module: Quality Control
priority: High
status: Pending
epic: QC Workflow
sprint: Sprint 15
story_points: 5
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../source-documents/requirements/PRD_DFMS_v1.0.md
  - ../../../03-prd-reference/04-operations-support/qc-workflow.md
related_stories:
  - US-047-qc-pass-fail-decision.md
dependencies:
  - US-047-qc-pass-fail-decision.md
tags: [qc, rejection, workflow, high-priority]
---

# US-049: QC Rejection Workflow

## User Story

**As a** QC Manager  
**I want to** manage rejected shipments through a structured workflow  
**So that** failed products are handled properly (return, dispose, or reprocess)

## Business Context

Rejection workflow ensures:
- **Proper Handling**: Clear process for failed products
- **Documentation**: Record rejection reasons and actions
- **Cost Recovery**: Return to vendor or claim compensation
- **Compliance**: Meet disposal regulations

---

## Acceptance Criteria

### AC-1: Rejection Recording
- [ ] System SHALL record rejection with:
  - QC test result ID
  - Rejection reason *
  - Failed parameters
  - Photos/evidence
  - Recommended action

### AC-2: Rejection Actions
- [ ] System SHALL support actions:
  - Return to Vendor
  - Dispose (with approval)
  - Reprocess (if possible)
  - Accept with Discount (conditional)
- [ ] System SHALL require approval for each action

### AC-3: Return to Vendor
- [ ] System SHALL create return TO
- [ ] System SHALL notify vendor
- [ ] System SHALL track return trip
- [ ] System SHALL link to original trip

### AC-4: Disposal Workflow
- [ ] System SHALL require disposal approval
- [ ] System SHALL record disposal method
- [ ] System SHALL capture disposal certificate
- [ ] System SHALL update inventory

### AC-5: Financial Impact
- [ ] System SHALL calculate financial impact:
  - Product cost
  - Transport cost
  - Disposal cost
- [ ] System SHALL create debit note for vendor (if applicable)
- [ ] System SHALL prevent vendor payment until resolved

---

## Functional Requirements

### FR-001: Rejection Interface
- [Critical] Rejection form
- [Critical] Action selection
- [High] Approval workflow
- [High] Vendor notification

### FR-002: Return Management
- [Critical] Return TO creation
- [High] Return trip tracking
- [Medium] Return POD

---

## Business Rules

### BR-REJECT-001: Disposal Approval
- Disposal requires senior manager approval
- **Enforcement**: Approval workflow

### BR-REJECT-002: Vendor Liability
- Vendor liable if QC failure due to vendor fault
- **Enforcement**: Business logic

---

## Data Model

```typescript
QCRejection {
  id: UUID (PK)
  qc_test_result_id: UUID (FK)
  trip_id: UUID (FK)
  
  rejection_reason: Text
  failed_parameters: JSON
  evidence_photos: JSON
  
  recommended_action: Enum (Return, Dispose, Reprocess, Accept_Discount)
  approved_action: Enum (nullable)
  approved_by: UUID (FK, nullable)
  approved_at: Timestamp (nullable)
  
  return_to_id: UUID (FK to TransportOrder, nullable)
  disposal_method: String (nullable)
  disposal_certificate_url: String (nullable)
  
  financial_impact: Decimal
  debit_note_id: UUID (FK, nullable)
  
  status: Enum (Pending_Action, In_Progress, Resolved)
  resolved_at: Timestamp (nullable)
  
  created_at: Timestamp
}
```

---

## UI/UX Requirements

```
┌─────────────────────────────────────────┐
│ QC Rejection: SMP-20260211-0042         │
├─────────────────────────────────────────┤
│ Failed Parameters:                      │
│ • Appearance: Poor                      │
│ • Health: Below Standard                │
│                                         │
│ Rejection Reason: *                     │
│ ┌─────────────────────────────────────┐ │
│ │ Product quality below acceptable    │ │
│ │ standards. Multiple birds unhealthy.│ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Recommended Action: *                   │
│ ⚪ Return to Vendor                     │
│ ⚪ Dispose (requires approval)          │
│ ⚪ Reprocess                            │
│ ⚪ Accept with Discount                 │
│                                         │
│ Financial Impact: BDT 45,000            │
│                                         │
│ [Submit for Approval]                   │
└─────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
POST /api/v1/qc-rejections
Body: {
  qc_test_result_id, rejection_reason,
  failed_parameters, recommended_action
}

POST /api/v1/qc-rejections/{rejection_id}/approve-action
Body: {approved_action, approved_by_user_id}

POST /api/v1/qc-rejections/{rejection_id}/create-return-to
Response: {return_to}
```

---

## Testing Scenarios

### Happy Path
1. QC fails → Rejection recorded
2. Return to vendor → Return TO created
3. Vendor receives return → Resolved

### Edge Cases
1. **Disposal requested**: Requires senior approval
2. **Vendor disputes**: Escalation workflow

---

## Dependencies

### Prerequisites
- ✅ US-047: QC Pass/Fail Decision

### Enables
- → Proper handling of failed products
- → Vendor accountability

---

## Definition of Done
- [ ] Rejection recording functional
- [ ] Action approval workflow
- [ ] Return TO creation
- [ ] Disposal workflow
- [ ] Financial impact calculation
- [ ] Unit tests > 85%
- [ ] UAT approved

---

**Story Points**: 5  
**Estimated Hours**: 40 hours  
**Sprint**: Sprint 15  
**Priority**: High

