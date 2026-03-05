---
title: Distribution Approval Workflow (FG TR)
story_id: US-011
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
  - ../../../03-module-specifications/03-operations/transport-requisition-management.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-009-fg-transfer-requisition.md
  - US-015-tr-assessment.md
dependencies:
  - US-009-fg-transfer-requisition.md
tags: [requisition, approval, workflow, distribution, critical]
---

# US-011: Distribution Approval Workflow (FG TR)

## User Story

**As a** Distribution Manager (DM)  
**I want to** review, approve and update Transport Request (TR) created by DO so that products are being transferred at their desired POIs based on coordinated approval workflow

## Business Context

Approval workflow ensures:
- **Budget Control**: Verify transport costs are justified
- **Stock Validation**: Confirm product availability at source
- **Priority Alignment**: Ensure urgent deliveries are prioritized
- **Capacity Planning**: Validate destination can receive goods

Approval hierarchy:
- Distribution Manager creates TR
- Distribution Approver reviews and approves
- Approved TRs move to "Available for Planning" status

---

## Acceptance Criteria

### AC-1: Approval Queue
- [ ] System SHALL display list of TRs with status "Pending Approval"
- [ ] System SHALL filter TRs by: Date, Priority, Source/Destination
- [ ] System SHALL sort by: Submission Date, Priority, Delivery Date
- [ ] System SHALL show TR summary: Number, Route, Quantity, Priority, Requester

### AC-2: TR Review
- [ ] System SHALL display complete TR details for review:
  - TR information (number, dates, priority)
  - Route (source → destination with map)
  - Product line items (product, quantity, weight)
  - Special instructions
  - Requester information
  - Stock availability (if integrated)
- [ ] System SHALL calculate estimated transport cost
- [ ] System SHALL show similar past TRs (same route/product)

### AC-3: Approval Actions
- [ ] System SHALL allow Approver to:
  - Approve TR
  - Reject TR (with reason)
  - Request Modification (send back to creator)
- [ ] System SHALL require rejection/modification reason
- [ ] System SHALL update TR status based on action:
  - Approve → "Approved" → "Available for Planning"
  - Reject → "Rejected"
  - Request Modification → "Modification Requested"

### AC-4: Notifications
- [ ] System SHALL notify TR creator of approval decision
- [ ] System SHALL notify Transport Planner when TR approved
- [ ] System SHALL send email + in-app notification
- [ ] System SHALL include rejection reason in notification

### AC-5: Approval History
- [ ] System SHALL maintain approval audit trail:
  - Approver name
  - Action (Approved/Rejected/Modification Requested)
  - Timestamp
  - Comments/Reason
- [ ] System SHALL display approval history on TR details page

---

## Functional Requirements

### FR-001: Approval Dashboard
- [Critical] List view of pending TRs
- [Critical] TR detail modal/page for review
- [High] Quick approve/reject actions
- [High] Bulk approval (select multiple TRs)

### FR-002: Decision Capture
- [Critical] Approve/Reject/Request Modification buttons
- [Critical] Reason text field (mandatory for reject/modification)
- [High] Comments field (optional for approve)
- [Medium] Approval templates (common rejection reasons)

### FR-003: Workflow Engine
- [Critical] Status transition logic
- [Critical] Notification trigger on status change
- [High] Approval delegation (if approver unavailable)
- [Medium] Multi-level approval (if required by policy)

### FR-004: Analytics
- [High] Approval metrics (avg time, approval rate)
- [Medium] Approver performance dashboard
- [Medium] Rejection reason analysis

---

## Business Rules

### BR-APP-001: Approval Authority
- Only users with "Distribution Approver" role can approve FG TRs
- **Enforcement**: Role-based access control

### BR-APP-002: Self-Approval Prevention
- TR creator cannot approve their own TR
- **Enforcement**: Validation check (created_by ≠ approved_by)

### BR-APP-003: Single Approval
- Each TR requires exactly one approval
- **Enforcement**: Status check (prevent re-approval)

### BR-APP-004: Rejection Reason Mandatory
- Rejection or modification request must include reason
- **Enforcement**: Form validation

### BR-APP-005: Approved TR Immutability
- Approved TRs cannot be edited (only cancelled)
- **Enforcement**: Status check before edit

---

## Data Model

```typescript
TransferRequisition {
  // ... existing fields ...
  
  // Approval fields
  approval_status: Enum (
    Pending,
    Approved,
    Rejected,
    Modification_Requested
  )
  approved_by: UUID (FK to User, nullable)
  approved_at: Timestamp (nullable)
  rejection_reason: Text (nullable)
  approver_comments: Text (nullable)
}

TRApprovalHistory {
  id: UUID (PK)
  tr_id: UUID (FK)
  
  action: Enum (Approved, Rejected, Modification_Requested, Resubmitted)
  action_by: UUID (FK to User)
  action_at: Timestamp
  reason: Text (nullable)
  comments: Text (nullable)
}
```

---

## UI/UX Requirements

### Approval Queue
```
┌──────────────────────────────────────────────────────────────┐
│ FG TR Approval Queue                                         │
├──────────────────────────────────────────────────────────────┤
│ Filter: [Today ▼] Priority: [All ▼]                         │
│                                                              │
│ TR Number       Route            Qty     Priority   Action  │
│ ──────────────────────────────────────────────────────────  │
│ TR-FG-20260211  Bhaluka → Mirpur 500 KG  🔴 Critical [Review]│
│ -0042           Delivery: Feb 15                            │
│ Requester: Karim Ahmed                                       │
│                                                              │
│ TR-FG-20260211  Warehouse → Depot 1000KG  🟡 High    [Review]│
│ -0038           Delivery: Feb 14                            │
│ Requester: Rahim Mia                                         │
└──────────────────────────────────────────────────────────────┘
```

### TR Review Modal
```
┌─────────────────────────────────────────┐
│ Review TR: TR-FG-20260211-0042    [×]   │
├─────────────────────────────────────────┤
│ Route: Bhaluka Warehouse → Mirpur Depot │
│ Distance: 45 km                         │
│ Priority: 🔴 Critical                   │
│ Delivery Date: Feb 15, 2026            │
│                                         │
│ Products:                               │
│ • Live Broiler: 500 KG                  │
│   Stock at Source: 800 KG ✅            │
│                                         │
│ Estimated Cost: BDT 5,000               │
│ Similar TRs: 12 in last month           │
│                                         │
│ Special Instructions:                   │
│ Handle with care - live birds           │
│                                         │
│ Requester: Karim Ahmed                  │
│ Submitted: Feb 11, 2026 10:30 AM        │
│                                         │
│ Comments (optional):                    │
│ ┌─────────────────────────────────────┐ │
│ │ Approved for urgent delivery        │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [❌ Reject] [📝 Request Changes] [✅ Approve]│
└─────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
// Get pending TRs for approval
GET /api/v1/transfer-requisitions/pending-approval
Query: ?priority=Critical&date=2026-02-11

// Get TR for review
GET /api/v1/transfer-requisitions/{tr_id}/for-approval
Response: {tr, stock_availability, similar_trs, estimated_cost}

// Approve TR
POST /api/v1/transfer-requisitions/{tr_id}/approve
Body: {comments?: string}
Response: {tr, status: 'Approved'}

// Reject TR
POST /api/v1/transfer-requisitions/{tr_id}/reject
Body: {reason: string, comments?: string}
Response: {tr, status: 'Rejected'}

// Request modification
POST /api/v1/transfer-requisitions/{tr_id}/request-modification
Body: {reason: string}
Response: {tr, status: 'Modification_Requested'}

// Get approval history
GET /api/v1/transfer-requisitions/{tr_id}/approval-history
Response: {history: TRApprovalHistory[]}
```

---

## Testing Scenarios

### Happy Path
1. Approver views pending TRs → List displayed
2. Approver reviews TR → Details shown
3. Approver approves TR → Status = "Approved", notifications sent
4. Transport Planner sees approved TR in queue

### Edge Cases
1. **Self-approval attempt**: Error, "Cannot approve own TR"
2. **Reject without reason**: Validation error
3. **Already approved TR**: Cannot re-approve
4. **Creator edits approved TR**: Blocked

---

## Dependencies

### Prerequisites
- ✅ US-009: FG Transfer Requisition

### Enables
- → US-015: TR Assessment (approved TRs only)

---

## Definition of Done
- [ ] Approval queue functional
- [ ] TR review page complete
- [ ] Approve/reject/modify actions working
- [ ] Notifications sent
- [ ] Approval history tracked
- [ ] Self-approval prevention
- [ ] Unit tests > 85%
- [ ] UAT approved

---

**Story Points**: 5  
**Estimated Hours**: 40 hours  
**Sprint**: Sprint 2  
**Priority**: Critical

