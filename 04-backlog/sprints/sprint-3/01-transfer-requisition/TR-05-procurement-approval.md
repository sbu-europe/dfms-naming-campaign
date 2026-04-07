---
jira_key: DFS-036
jira_type: Story
jira_epic: DFS-040
jira_sprint: "Sprint 3"
story_id: US-012
title: Procurement Approval Workflow (Port / RM TR)
epic: Transfer Requisition
status: Pending
story_points: 5
assignee: ~
spec_file: ../../../../stories/US-012-procurement-approval.md
---

# TR-05 — Procurement Approval Workflow (Port / RM TR)

## User Story

**As a** Procurement Manager  
**I want to** review and approve Port Consignment Transfer Requisitions with LC documentation and customs clearance verification  
**So that** LC-based RM imports can proceed to transport planning with proper compliance checks

## Business Context

Mirror of the Distribution Approval workflow (TR-04) but for Port TRs. Additional checks beyond FG approval:
- LC documentation completeness
- Customs clearance status
- Port demurrage risk (days at port)
- Import compliance

**Approval chain** (Port TRs):
```
Procurement Officer submits Port TR → Procurement Manager reviews → Approves / Rejects
```

## Acceptance Criteria

### AC-1: Port TR Approval Queue
- [ ] Procurement Manager sees TRs with status `Pending Approval` (Port/RM type)
- [ ] Additional columns vs FG queue: LC Number, Customs Status, Days at Port, ETA
- [ ] Filters: Customs Status, Days at Port (urgent flag for demurrage risk), Priority

### AC-2: TR Review — Port-Specific Checks
- [ ] Full TR detail + all LC and shipping documentation visible
- [ ] Customs clearance status with days at port prominently displayed
- [ ] Demurrage risk flag if vessel has been at port > configurable threshold (e.g., 3 days)
- [ ] Document viewer for uploaded Arrival Notice
- [ ] Stock/capacity snapshot (same as TR-04)

### AC-3: Approval Actions (same as TR-04)
- [ ] Approve → `Available for Planning`
- [ ] Approve with Modification (qty, delivery date, priority)
- [ ] Reject with reason → returned to Procurement Officer
- [ ] Request Clarification

### AC-4: Customs Clearance Gate (configurable)
- [ ] If Customs Status ≠ `Cleared`, system shows warning on approval form
- [ ] Approver can override with mandatory remarks if approving despite pending customs
- [ ] Override logged with justification

### AC-5: Logging & Notifications
- [ ] Same audit logging and notification pattern as TR-04
- [ ] Override reason logged separately on TR record

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| TR-05-1 | Port TR approval API (same endpoints as TR-04, filtered by type=PORT_CONSIGNMENT) | DFS-036-1 | Pending |
| TR-05-2 | Customs clearance gate — warning + mandatory override remarks | DFS-036-2 | Pending |
| TR-05-3 | Demurrage risk flag — days at port > threshold alert on approval queue | DFS-036-3 | Pending |
| TR-05-4 | Port TR approval queue UI — extra columns (LC, Customs, Days at Port) | DFS-036-4 | Pending |
| TR-05-5 | Port TR approval detail UI — document viewer + customs status panel | DFS-036-5 | Pending |
| TR-05-6 | Notifications — same pattern as TR-04 for Port TR outcomes | DFS-036-6 | Pending |

## API Endpoints

```
GET   /api/v1/transfer-requisitions?status=PENDING_APPROVAL&type=PORT_CONSIGNMENT
POST  /api/v1/transfer-requisitions/{tr_id}/approve   Body: { remarks, customs_override? }
POST  /api/v1/transfer-requisitions/{tr_id}/reject
```

## Dependencies

- **Requires**: TR-02 (Port TR creation), TR-03 (Stock/Capacity validation)
- **Enables**: TP-01 (TR Assessment queue receives approved Port TRs)

## Definition of Done

- [ ] Port TR approval queue with customs status and demurrage risk columns
- [ ] Customs clearance gate with override + justification
- [ ] Approve / Reject / Mod / Clarification all working
- [ ] Notifications on all outcomes
- [ ] Unit tests > 80%
- [ ] UAT: Procurement Manager can approve Port TR with customs override logged
