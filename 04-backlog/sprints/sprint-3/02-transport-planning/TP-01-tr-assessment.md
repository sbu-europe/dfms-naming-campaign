---
jira_key: DFS-037
jira_type: Story
jira_epic: DFS-041
jira_sprint: "Sprint 3"
story_id: US-015
title: Transfer Requisition Assessment by Transport Planner
epic: Transport Planning
status: Pending
story_points: 5
assignee: ~
spec_file: ../../../../stories/US-015-tr-assessment.md
---

# TP-01 — Transfer Requisition Assessment by Transport Planner

## User Story

**As a** Transport Planner  
**I want to** review all approved Transfer Requisitions in a prioritised queue and assess each for fleet requirements, route feasibility, and transport strategy  
**So that** I can plan efficient Transport Orders before dispatch

## Business Context

TR Assessment is the bridge between requisition approval and transport execution:

```
Approved TR → TR Assessment → TO Creation (TO-01/TO-02) → Trip Execution
```

Assessment activities: review TR details, check fleet availability (TP-02), determine strategy (single TO vs split TOs), identify constraints and risks.

## Acceptance Criteria

### AC-1: Assessment Queue
- [ ] Transport Planner sees all TRs with status `Available for Planning`
- [ ] Both FG and Port TR types shown in the same queue
- [ ] Filters: Delivery Date (urgency), Priority, Transfer Type (FG / Port), Source / Destination POI
- [ ] Sort: Delivery Date (ascending default), Priority, TR Number
- [ ] Columns: TR Number, Type, Route, Product, Quantity, Delivery Date, Priority, Days Until Deadline

### AC-2: TR Assessment Detail View
- [ ] Full TR details: type, route, line items, delivery date, priority, requester, approver, special instructions
- [ ] Route shown on map (Source POI → Destination POI via Route from MDM-02)
- [ ] Estimated distance and duration from Route master data
- [ ] Vehicle type recommendation from product transport config (MDM-01)
- [ ] Fleet availability summary inline (available own fleet vehicles + available vendor fleet — from TP-02)

### AC-3: Assessment Decision
- [ ] Planner can mark TR as `Under Planning` (locks it to their queue)
- [ ] Planner documents assessment notes (optional free text)
- [ ] Planner selects transport strategy:
  - Single TO (all quantity in one TO)
  - Split TOs (divide quantity across multiple TOs / fleet types)
- [ ] Strategy selection is informational — actual TOs created in TO-01/TO-02

### AC-4: Dispatch Deadline Alert
- [ ] System flags TRs where Delivery Date is within 24 hours (urgent badge)
- [ ] System flags TRs where Delivery Date has passed (overdue badge)

### AC-5: TR Assessment History
- [ ] All assessment actions (locked, notes, strategy) audit logged per TR

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| TP-01-1 | TR assessment queue API (GET approved TRs with filters + sort) | DFS-037-1 | Pending |
| TP-01-2 | `Under Planning` status transition + lock to planner | DFS-037-2 | Pending |
| TP-01-3 | Assessment notes + strategy fields on TR model | DFS-037-3 | Pending |
| TP-01-4 | Route map display: source → destination with distance/duration from MDM-02 | DFS-037-4 | Pending |
| TP-01-5 | Fleet availability inline summary (delegates to TP-02 service) | DFS-037-5 | Pending |
| TP-01-6 | Urgency / overdue deadline flag logic | DFS-037-6 | Pending |
| TP-01-7 | TR assessment queue UI (list with urgency badges, filter, sort) | DFS-037-7 | Pending |
| TP-01-8 | TR assessment detail UI (route map, fleet summary, strategy selector, notes) | DFS-037-8 | Pending |

## API Endpoints

```
GET   /api/v1/transfer-requisitions?status=AVAILABLE_FOR_PLANNING&type=&priority=&sort=delivery_date
POST  /api/v1/transfer-requisitions/{tr_id}/start-planning   # Lock to planner, status → UNDER_PLANNING
PATCH /api/v1/transfer-requisitions/{tr_id}/assessment       # Save notes + strategy
```

## Dependencies

- **Requires**: TR-04 / TR-05 (Approved TRs in the queue), TP-02 (Fleet Availability for inline summary)
- **Enables**: TO-01 (TO Creation from assessed TR)

## Definition of Done

- [ ] Assessment queue with FG + Port TRs, filters, urgency badges
- [ ] TR detail with route map and fleet availability inline
- [ ] Lock-to-planner workflow
- [ ] Assessment notes + strategy saved
- [ ] Unit tests > 80%
- [ ] UAT: Transport Planner can assess 3+ TRs and create TOs from them
