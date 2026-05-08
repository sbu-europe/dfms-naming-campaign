---
title: Procurement Approval Workflow (Port TR)
story_id: US-012
phase: phase-1
module: Product Requisition Management
priority: Critical
status: Pending
epic: Distribution & Procurement Management
epic_id: EPIC-008
epic_name: Distribution & Procurement Management
sprint: Sprint 4
story_points: 5
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../05-modules/03-operations/product-requisition-management.md
  - ../../../05-modules/03-operations/transport-requisition-management.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-010-port-transfer-requisition.md
  - US-011-distribution-approval.md
dependencies:
  - US-010-port-transfer-requisition.md
tags: [requisition, approval, procurement, port, critical]
---

# US-012: Procurement Approval Workflow (Port TR)

## User Story

**As a** Procurement Officer  
**I want to** review and approve Port Transfer Requisitions with CNF clearance confirmation  
**So that** LC-based imports can proceed to transport planning with proper documentation and distribution breakdown

## Business Context

Port TR approval ensures:
- **LC Verification**: Validate LC number and documentation
- **Customs Compliance**: Ensure customs clearance requirements met
- **Cost Validation**: Verify transport and demurrage costs
- **Warehouse Capacity**: Confirm destination can receive shipment

Similar to Distribution Approval (US-011) but with additional checks for:
- LC documentation completeness
- Customs clearance status
- Port demurrage risk
- Import compliance

---

## Acceptance Criteria

### AC-1: Port TR Approval Queue
- [ ] System SHALL display Port TRs with status "Pending Approval"
- [ ] System SHALL show additional port-specific information:
  - LC Number
  - Customs Status
  - Days at Port
  - Demurrage Risk
- [ ] System SHALL highlight urgent TRs (customs cleared, high demurrage risk)

### AC-2: Port TR Review
- [ ] System SHALL display Port TR details including:
  - Standard TR information
  - LC details (number, date, supplier, origin)
  - Shipping details (B/L, containers, vessel, arrival)
  - Customs status and clearance date
  - Uploaded documents (LC, B/L, etc.)
  - Demurrage calculation
- [ ] System SHALL validate LC documentation completeness
- [ ] System SHALL show customs clearance timeline

### AC-3: Procurement Approval & CNF Confirmation (per PRD)
- [ ] System SHALL route Port Transfer Requisitions to Procurement Department for approval
- [ ] System SHALL require Procurement approval before forwarding to Transport Department
- [ ] System SHALL require CNF (Clearing & Forwarding) clearance confirmation
- [ ] System SHALL allow Procurement Officer to create distribution breakdown plan
- [ ] System SHALL forward approved Port TRs with distribution breakdown to Transport Department
- [ ] System SHALL block TO creation until Procurement approval and CNF confirmation

### AC-4: Distribution Breakdown Plan (per PRD)
- [ ] System SHALL allow Procurement Officer to create destination breakdown plan
- [ ] System SHALL specify quantity allocation to each destination POI
- [ ] System SHALL validate breakdown quantities match total Port TR quantity
- [ ] System SHALL display breakdown plan in TR details for Transport Planner

### AC-5: Document Verification
- [ ] System SHALL display checklist of required documents:
  - LC Copy ✓
  - Bill of Lading ✓
  - CNF Clearance Note ✓
  - Packing List
  - Invoice
  - Certificate of Origin
- [ ] System SHALL allow approver to mark documents as verified
- [ ] System SHALL require all critical documents before approval

### AC-6: Approval Actions
- [ ] System SHALL allow: Approve, Reject, Request Modification
- [ ] System SHALL require rejection reason
- [ ] System SHALL send notifications
- [ ] System SHALL maintain approval history

---

## Functional Requirements

### FR-001: Port TR Approval Dashboard
- [Critical] Port TR queue with LC and customs info
- [Critical] Document verification checklist
- [High] Demurrage risk indicator
- [High] Conditional approval workflow

### FR-002: LC Validation
- [Critical] LC number verification
- [High] LC expiry check
- [Medium] Integration with ERP for LC status

### FR-003: Customs Gate
- [Critical] Prevent approval if customs not cleared (or conditional approval)
- [High] Customs clearance date validation
- [Medium] Customs document checklist

---

## Business Rules

### BR-PROC-001: Procurement Approver Role
- Only "Procurement Approver" role can approve Port TRs
- **Enforcement**: RBAC

### BR-PROC-002: Document Completeness
- Critical documents (LC, B/L) must be uploaded before approval
- **Enforcement**: Validation check

### BR-PROC-003: Customs Clearance Condition
- If customs not cleared, approval must be conditional
- **Enforcement**: Business logic

### BR-PROC-004: Demurrage Alert
- If demurrage > BDT 50,000, require senior approver
- **Enforcement**: Escalation workflow

---

## Data Model

```typescript
TransferRequisition {
  // ... existing fields ...
  
  // Procurement approval specific
  approval_conditions: JSON (array of conditions, nullable)
  conditions_met: Boolean (default: false)
  document_verification_status: JSON (checklist, nullable)
}

TRApprovalHistory {
  // ... existing fields from US-011 ...
  
  approval_type: Enum (Unconditional, Conditional)
  conditions: JSON (nullable)
}
```

---

## UI/UX Requirements

### Port TR Approval Queue
```
┌──────────────────────────────────────────────────────────────┐
│ Port TR Approval Queue                                       │
├──────────────────────────────────────────────────────────────┤
│ TR Number    LC Number   Customs    Days@Port  Risk  Action │
│ ──────────────────────────────────────────────────────────  │
│ TR-PORT-001  LC-2026-01  ✅ Cleared  3 days    🟢    [Review]│
│ TR-PORT-002  LC-2026-02  ⏳ Pending  8 days    🔴    [Review]│
│                                      ⚠️ High Demurrage!      │
└──────────────────────────────────────────────────────────────┘
```

### Port TR Review Modal
```
┌─────────────────────────────────────────┐
│ Review Port TR: TR-PORT-20260211-0001   │
├─────────────────────────────────────────┤
│ LC Details:                             │
│ • LC Number: LC-2026-001                │
│ • Supplier: ABC Trading (USA)           │
│ • Product: Maize (1000 MT)              │
│                                         │
│ Customs Status: ✅ Cleared (Feb 10)     │
│ Days at Port: 3 days                    │
│ Estimated Demurrage: BDT 15,000         │
│                                         │
│ Document Verification:                  │
│ ✅ LC Copy                               │
│ ✅ Bill of Lading                        │
│ ✅ Packing List                          │
│ ✅ Commercial Invoice                    │
│ ⚠️ Certificate of Origin (Missing)      │
│                                         │
│ Approval Type:                          │
│ ⚪ Unconditional Approval                │
│ ⚪ Conditional (Pending customs)         │
│                                         │
│ [❌ Reject] [📝 Request Docs] [✅ Approve]│
└─────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
GET /api/v1/transfer-requisitions/port/pending-approval

GET /api/v1/transfer-requisitions/{tr_id}/port-details
Response: {
  tr, lc_details, shipping_details,
  customs_status, documents, demurrage_calculation
}

POST /api/v1/transfer-requisitions/{tr_id}/approve
Body: {
  approval_type: 'Unconditional' | 'Conditional',
  conditions?: string[],
  comments?: string
}

POST /api/v1/transfer-requisitions/{tr_id}/verify-documents
Body: {document_ids: UUID[], verified: boolean}
```

---

## Testing Scenarios

### Happy Path
1. Approver reviews Port TR with all documents → Approves
2. Customs cleared → Unconditional approval
3. Customs pending → Conditional approval

### Edge Cases
1. **Missing critical documents**: Warning, cannot approve
2. **High demurrage**: Escalation required
3. **Conditional approval**: TO creation blocked until customs cleared

---

## Dependencies

### Prerequisites
- ✅ US-010: Port Transfer Requisition

### Enables
- → US-015: TR Assessment

---

## Definition of Done
- [ ] Port TR approval queue
- [ ] Document verification checklist
- [ ] Conditional approval workflow
- [ ] Customs gate enforcement
- [ ] Demurrage calculation
- [ ] Unit tests > 85%
- [ ] UAT approved

---

**Story Points**: 5  
**Estimated Hours**: 40 hours  
**Sprint**: Sprint 2  
**Priority**: Critical

