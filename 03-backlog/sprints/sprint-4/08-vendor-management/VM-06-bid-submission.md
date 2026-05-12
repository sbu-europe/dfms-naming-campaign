---
jira_key: ~
jira_type: Story
jira_epic: ~
jira_sprint: "Sprint 4"
title: Bid Submission Windows + Structured Bid Payload + Late-Bid Prevention
epic: Vendor Portal & Operations
status: Pending
story_points: ~
assignee: ~
---

# VM-06 — Bid Submission Windows + Structured Bid Payload + Late-Bid Prevention

## User Story

**As a** vendor  
**I want to** view available transport bids and submit competitive rates  
**So that** I can win trips

## Business Context

TDO publishes TOs to the bidding portal (VM-05) with defined windows and requirements. Vendors submit structured bids within the submission window. The system must prevent late submissions and support the bid lifecycle (submit, edit, withdraw) with auditability.

## Acceptance Criteria

### AC-0: Tenant Join Gating
- [ ] Vendor can submit bids only for tenants the vendor has **joined and been approved** for

### AC-1: Bid Publication Data Visible to Vendor
- [ ] When bids are published, vendor sees bid details including:
  - Route information
  - Tonnage / expected weight to carry
  - Urgency
  - Required vehicle type
  - Bid submission window
  - Required quantity of vehicles
  - Optional expected bid price (if provided)

### AC-2: Structured Bid Submission
- [ ] Vendor can submit a bid with:
  - Proposed cost / rate (mandatory, numeric, > 0)
  - Remarks (optional)
- [ ] **Phase 1 simplification**: bid submission does **not** collect vehicle/driver/helper information.
- [ ] System enforces one active bid per vendor per TO (edit/withdraw allowed before deadline)
- [ ] System records bid status: `SUBMITTED`, `WITHDRAWN`, `ACCEPTED`, `REJECTED`

### AC-3: Bid Window Enforcement
- [ ] System supports configurable bid submission windows
- [ ] System prevents bid submission after window closure (hard block)

### AC-4: Bid Timestamp + Rate Validity Recording
- [ ] System records bid timestamp
- [ ] System records rate validity according to the bid window rules

### AC-5: Manual Close/Cancel
- [ ] Bids may be manually closed or cancelled without awarding

### AC-6: Edit / Withdraw Before Deadline
- [ ] Vendor can edit their bid before the deadline
- [ ] Vendor can withdraw their bid before the deadline
- [ ] Withdrawn bids are not deleted; they remain for audit
- [ ] All edits/withdrawals are logged (who/when/what changed)

### AC-7: Notifications
- [ ] Vendor receives confirmation after bid submit/edit/withdraw (in-app; optional email)
- [ ] TDO is notified on new bid submission events (in-app; optional email)

## Functional Requirements (from PRD)

- [ ] **[Critical]** System SHALL provide support configurable bid submission windows.
- [ ] **[High]** System SHALL prevent bid submission after window closure.
- [ ] **[High]** Bids MAY be manually closed or cancelled without awarding.

## Sub-tasks (implementation checklist)

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| VM-06-1 | Bid submission API + validation (rate, optional remarks) | ~ | Pending |
| VM-06-2 | Bid window enforcement (server-side) | ~ | Pending |
| VM-06-3 | Store bid timestamp + validity window metadata | ~ | Pending |
| VM-06-4 | Edit/withdraw endpoints + audit events | ~ | Pending |
| VM-06-5 | Close/cancel bid controls (admin/TDO side) | ~ | Pending |

## API Endpoints (suggested)

```
POST   /api/v1/vendor/bidding-sessions/{session_id}/bids
Body: {
  proposed_cost,
  remarks?
}

PATCH  /api/v1/vendor/bidding-sessions/{session_id}/bids/{bid_id}
Body: { proposed_cost?, remarks? }

DELETE /api/v1/vendor/bidding-sessions/{session_id}/bids/{bid_id}

GET    /api/v1/vendor/bidding-sessions/{session_id}/bids/{bid_id}
```

## Dependencies

- **Requires**: VM-04 bid list visibility; VM-03 tenant join approval; VM-05 bid publication workflow from TDO; completed vendor registration (VM-01/VM-02).
- **Enables**: VM-07 bid evaluation; VM-08 vehicle/driver submission after award.

## Definition of Done

- [ ] Vendor can submit bid within window; submissions blocked after closure
- [ ] Bid is stored with timestamp and rate validity metadata
- [ ] Vendor can edit/withdraw before deadline; actions audited
- [ ] Admin/TDO can close/cancel bid without awarding

