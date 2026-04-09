---
jira_key: DFS-035
jira_type: Story
jira_epic: DFS-040
jira_sprint: "Sprint 3"
story_id: US-011
title: Distribution Approval Workflow (FG TR)
epic: Transfer Requisition
status: Pending
story_points: 5
assignee: ~
spec_file: ../../../../stories/US-011-distribution-approval.md
---

# TR-04 — Distribution Approval Workflow (FG TR)

## User Story

**As a** Distribution Manager (DM)  
**I want to** review and approve or reject FG Transfer Requisitions submitted by Distribution Officers  
**So that** stock transfers are validated, budget-controlled, and properly prioritised before transport planning begins

## Business Context

Approval ensures: budget control, stock validity at approval time, capacity alignment, and priority coordination. Approved TRs move to `Available for Planning` status and become visible to Transport Planners (TP-01).

**Approval chain** (FG TRs):
```
DO submits TR → DM reviews → Approves (→ Available for Planning) OR Rejects (→ back to DO)
```

## Acceptance Criteria

### AC-1: Approval Queue
- [ ] Distribution Manager sees list of TRs with status `Pending Approval` (FG type only)
- [ ] Filters: Date submitted, Priority, Source POI, Destination POI
- [ ] Sort: Submission date, Priority, Delivery date
- [ ] Quick summary columns: TR Number, Route, Product, Quantity, Priority, Requester, Submitted Date

### AC-2: TR Review
- [ ] Full TR detail view for approver:
  - TR info, route, product line items, requested delivery date, priority
  - Stock snapshot at time of approval (re-validated from TR-03)
  - Capacity snapshot at destination
  - DO's special instructions
  - Any prior rejection history with comments

### AC-3: Approval Actions
- [ ] **Approve**: TR status → `Approved` → auto-transitions to `Available for Planning`
- [ ] **Approve with Modification**: Approver can edit Quantity, Delivery Date, Priority before approving
- [ ] **Reject**: Required rejection reason (free text + dropdown category)
  - TR status → `Rejected`, returned to DO for revision
  - DO notified via in-app notification + email
- [ ] **Request Clarification**: TR status → `Pending Clarification`, DO notified

### AC-4: Approval Logging
- [ ] All approval actions logged: Approver ID, Timestamp, Action, Remarks
- [ ] Stock/capacity snapshot at approval time stored on TR record

### AC-5: Notification
- [ ] DO receives in-app + email notification on: Approved, Rejected, Clarification Requested
- [ ] Transport Planners notified when new TR becomes `Available for Planning`

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| TR-04-1 | TR approval API: POST /{tr_id}/approve, POST /{tr_id}/reject, POST /{tr_id}/request-clarification | DFS-035-1 | Pending |
| TR-04-2 | Approve-with-modification: allow DM to edit qty/date/priority before approving | DFS-035-2 | Pending |
| TR-04-3 | Stock + capacity re-validation at approval time | DFS-035-3 | Pending |
| TR-04-4 | Approval record stored on TR (approver, timestamp, remarks, snapshot) | DFS-035-4 | Pending |
| TR-04-5 | Notifications — in-app + email on Approve / Reject / Clarification | DFS-035-5 | Pending |
| TR-04-6 | TR status auto-transition: Approved → Available for Planning | DFS-035-6 | Pending |
| TR-04-7 | Approval queue UI (list with filters, sort, quick actions) | DFS-035-7 | Pending |
| TR-04-8 | TR approval detail view UI (full info + stock snapshot + action panel) | DFS-035-8 | Pending |

## API Endpoints

```
GET   /api/v1/transfer-requisitions?status=PENDING_APPROVAL&type=FG
POST  /api/v1/transfer-requisitions/{tr_id}/approve
POST  /api/v1/transfer-requisitions/{tr_id}/reject     Body: { reason, category }
POST  /api/v1/transfer-requisitions/{tr_id}/request-clarification
```

## Dependencies

- **Requires**: TR-01 (FG TR), TR-03 (Stock & Capacity Validation for re-check at approval)
- **Enables**: TP-01 (TR Assessment queue shows Approved TRs)

## Definition of Done

- [ ] Approval queue showing all Pending Approval FG TRs
- [ ] Approve / Reject / Approve-with-mod / Request Clarification all working
- [ ] Stock + capacity re-validated at approval time
- [ ] Approval log stored on TR
- [ ] Notifications sent on all approval outcomes
- [ ] Unit tests > 80%
- [ ] UAT: DM can approve and reject TRs; DO receives notifications
