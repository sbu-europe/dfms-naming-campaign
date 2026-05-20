---
jira_key: ~
jira_type: Story
jira_epic: ~
jira_sprint: "Sprint 4"
title: Bid Evaluation (TDO) — Side-by-side Compare + Select Winner(s) + Winning Log
epic: TDO Bid Evaluation
status: Pending
story_points: 8
assignee: ~
---

# VM-06 — Bid Evaluation (TDO) — Side-by-side Compare + Select Winner(s) + Winning Log

## User Story

**As a** Transport Distribution Officer (TDO)  
**I want to** evaluate vendor bids from non-contractual vendors and approve selected vendors  
**So that** transport orders can be awarded fairly and efficiently

## Business Context

Bid evaluation is the selection layer between bid submission and trip execution. It must support comparison, **single- or multi-vendor awards** with capacity-aware allocations, and an immutable winning log. It must also support rejecting all bids when none are suitable, and notifying all participants.

## Acceptance Criteria

### AC-1: Side-by-side Bid Comparison
- [ ] TDO can compare bids side-by-side including:
  - Proposed cost / rate
  - **Offered number of vehicles** (from VM-05 bid payload)
  - Bid submission time
  - Remarks (optional)
  - Bid validity (deadline/window)
- [ ] TDO can sort bids by: cost (low→high), offered vehicle count, vendor rating (if available), submission time
- [ ] System highlights the lowest bid (recommended)
- [ ] System provides basic bid statistics (min/avg/max)

### AC-2: Winner Selection (single or multiple vendors)
- [ ] System supports awarding **one or more winning vendors** for a TO when the transport model requires split capacity (e.g. sum of awarded vehicles covers `required_vehicle_count` from VM-04)
- [ ] TDO can assign **per-vendor awarded vehicle count** (≤ vendor’s offered count; totals must satisfy business rules)
- [ ] Once an award decision is **approved/finalized**, it is persisted and visible in audit/winning log; **no further vendor changes** without controlled amendment flow (future hook if needed)
- [ ] Approving an award transitions:
  - winning bid(s) → `ACCEPTED`
  - non-selected bids → `REJECTED` (or `CLOSED` if product prefers softer terminal state)

### AC-3: Winning Log
- [ ] System tracks bid winning log with:
  - Selected vendor(s)
  - Selected bid(s) + **awarded vehicle counts**
  - TDO user
  - Timestamp

### AC-4: Reject All Bids (with reason)
- [ ] TDO can reject all bids for a TO if none are suitable
- [ ] Reject-all requires a reason (stored + auditable)
- [ ] Reject-all closes the bidding session for the TO (no further submissions)
- [ ] System notifies all bidders that the TO was not awarded

## Functional Requirements (from PRD)

- [ ] **[Critical]** System SHALL support **winner selection** for a TO, including **multiple winning vendors** when required.
- [ ] **[High]** System SHALL track bid winning log with user and timestamp.

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| VM-06-1 | `GET /api/v1/tdo/transport-orders/{to_id}/bids` — joined bid + vendor metadata; sort by cost, offered count, rating, time | ~ | Pending |
| VM-06-2 | Comparison aggregates — min/avg/max rate; highlight lowest bid | ~ | Pending |
| VM-06-3 | Award validation — Σ `awarded_vehicle_count` ≤ `required_vehicle_count`; per line ≤ vendor `offered_vehicle_count`; session still awardable | ~ | Pending |
| VM-06-4 | `POST .../award` — persist allocation; winning bids → `ACCEPTED`; others → `REJECTED`/`CLOSED`; **finalize** lock + winning log (TDO user, timestamp, bid ids, counts) | ~ | Pending |
| VM-06-5 | TO / trip state transitions after award — handoff flag for **VM-07** vehicle–driver confirmation | ~ | Pending |
| VM-06-6 | `POST .../reject-all` — mandatory reason; close session; notify all bidders | ~ | Pending |
| VM-06-7 | TDO UI — side-by-side table + award dialog (multi-row allocation) + reject-all | ~ | Pending |
| VM-06-8 | Audit — award decision payload; reject-all reason | ~ | Pending |

## API Endpoints (suggested)

```
GET  /api/v1/tdo/transport-orders/{to_id}/bids
POST /api/v1/tdo/transport-orders/{to_id}/award
Body: {
  awards: [
    { bid_id, awarded_vehicle_count }
  ]
}

POST /api/v1/tdo/transport-orders/{to_id}/reject-all
Body: { reason }
```

## Dependencies

- **Requires**: VM-05 bid submissions; TO/bid linkage; role TDO.
- **Enables**: VM-07 post-award vehicle/driver submission; vendor notifications; operational execution.

## Definition of Done

- [ ] TDO can compare bids and award **one or more** winners for a TO with auditable vehicle allocations
- [ ] Winning log stored with user + timestamp
- [ ] Award triggers vendor next-step requirement (vehicle/driver submission)
- [ ] TDO can reject all bids with reason; session closes; bidders notified

