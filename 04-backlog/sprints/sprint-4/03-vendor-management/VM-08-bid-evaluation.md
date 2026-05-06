---
jira_key: ~
jira_type: Story
jira_epic: ~
jira_sprint: "Sprint 4"
title: Bid Evaluation (TDO) — Side-by-side Compare + Select Winner + Winning Log
epic: TDO Bid Evaluation
status: Pending
story_points: ~
assignee: ~
---

# VM-08 — Bid Evaluation (TDO) — Side-by-side Compare + Select Winner + Winning Log

## User Story

**As a** Transport Distribution Officer (TDO)  
**I want to** evaluate vendor bids from non-contractual vendors and approve selected vendors  
**So that** transport orders can be awarded fairly and efficiently

## Business Context

Bid evaluation is the selection layer between bid submission and trip execution. It must support comparison and enforce a single winner per TO, with an immutable winning log. It must also support rejecting all bids when none are suitable, and notifying all participants.

## Acceptance Criteria

### AC-1: Side-by-side Bid Comparison
- [ ] TDO can compare bids side-by-side including:
  - Proposed cost / rate
  - Vehicle details (type, registration, capacity)
  - Driver/helper info (as submitted)
  - Bid submission time
  - Remarks (optional)
  - Bid validity (deadline/window)
- [ ] TDO can sort bids by: cost (low→high), vendor rating (if available), submission time
- [ ] System highlights the lowest bid (recommended)
- [ ] System provides basic bid statistics (min/avg/max)

### AC-2: Single Winner per TO
- [ ] System supports selecting a **winner against a single TO**
- [ ] Once a winner is selected, the award decision is persisted and visible in audit/winning log
- [ ] Selecting a winner transitions:
  - winning bid → `ACCEPTED`
  - all other bids → `REJECTED`

### AC-3: Winning Log
- [ ] System tracks bid winning log with:
  - Selected vendor
  - Selected bid
  - TDO user
  - Timestamp

### AC-4: Reject All Bids (with reason)
- [ ] TDO can reject all bids for a TO if none are suitable
- [ ] Reject-all requires a reason (stored + auditable)
- [ ] Reject-all closes the bidding session for the TO (no further submissions)
- [ ] System notifies all bidders that the TO was not awarded

## Functional Requirements (from PRD)

- [ ] **[Critical]** System SHALL provide support winner against a single TO.
- [ ] **[High]** System SHALL track bid winning log with user and timestamp.

## Sub-tasks (implementation checklist)

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| VM-08-1 | Bid comparison view/query (by TO/bid window) | ~ | Pending |
| VM-08-2 | Award action endpoint enforcing single-winner constraint | ~ | Pending |
| VM-08-3 | Winning log persistence + audit visibility | ~ | Pending |
| VM-08-4 | Post-award trigger: require vendor vehicle/driver submission (VM-06) | ~ | Pending |
| VM-08-5 | Reject-all endpoint + notifications | ~ | Pending |

## API Endpoints (suggested)

```
GET  /api/v1/tdo/transport-orders/{to_id}/bids
POST /api/v1/tdo/transport-orders/{to_id}/award
Body: { bid_id }

POST /api/v1/tdo/transport-orders/{to_id}/reject-all
Body: { reason }
```

## Dependencies

- **Requires**: VM-05 bid submissions; TO/bid linkage; role TDO.
- **Enables**: VM-06 post-award vehicle/driver submission; vendor notifications; operational execution.

## Definition of Done

- [ ] TDO can compare bids and award exactly one winner for a TO
- [ ] Winning log stored with user + timestamp
- [ ] Award triggers vendor next-step requirement (vehicle/driver submission)
- [ ] TDO can reject all bids with reason; session closes; bidders notified

