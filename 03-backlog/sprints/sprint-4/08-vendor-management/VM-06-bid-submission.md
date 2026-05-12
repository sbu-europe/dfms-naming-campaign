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
**I want to** view available transport bids and submit **offered rate and vehicle count**  
**So that** I can win transport capacity on TOs

## Business Context

TDO publishes TOs to the bidding portal (VM-05) with defined windows and requirements. Vendors submit structured bids within the submission window. The system must prevent late submissions, record an **immutable bid** after submit (**no PATCH / edit** per [TEVF-02](../09-to-execution-vendor-fleet/TEVF-02-non-contractual-bidding.md)), optionally support **withdraw before close** if product policy enables it, and maintain full auditability.

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
  - Optional **reference / guide rate** (if provided at publish — VM-05)

### AC-2: Structured Bid Submission
- [ ] Vendor can submit a bid with:
  - Proposed cost / rate (mandatory, numeric, > 0)
  - **Offered number of vehicles** (mandatory integer ≥ 1; must not exceed any server-side max tied to TO demand)
  - Remarks (optional)
- [ ] **Phase 1 simplification**: bid submission does **not** collect vehicle registration / driver / helper identity (those are captured post-award in VM-08).
- [ ] System enforces **one submitted bid per vendor per TO**; **after submit, bid fields are immutable** (no edit endpoint)
- [ ] System records bid status: `SUBMITTED`, `WITHDRAWN`, `ACCEPTED`, `REJECTED`

### AC-3: Bid Window Enforcement
- [ ] System supports configurable bid submission windows
- [ ] System prevents bid submission after window closure (hard block)

### AC-4: Bid Timestamp + Rate Validity Recording
- [ ] System records bid timestamp
- [ ] System records rate validity according to the bid window rules

### AC-5: Manual Close/Cancel
- [ ] Bids may be manually closed or cancelled without awarding

### AC-6: Withdraw Before Deadline (optional policy)
- [ ] If enabled by tenant policy: vendor can **withdraw** their bid before the deadline (no field edits after submit)
- [ ] Withdrawn bids are not deleted; they remain for audit
- [ ] Withdrawals are logged (who/when)

### AC-7: Notifications
- [ ] Vendor receives confirmation after bid submit (and withdraw, if enabled) (in-app; optional email)
- [ ] TDO is notified on new bid submission events (in-app; optional email)

## Functional Requirements (from PRD)

- [ ] **[Critical]** System SHALL support bidding for non-contractual vendors (rate + vehicle count).
- [ ] **[Critical]** Vendor SHALL submit **price** and **offered vehicle count**; bids SHALL be **immutable after submit** (no PATCH).
- [ ] **[Critical]** System SHALL provide support configurable bid submission windows.
- [ ] **[High]** System SHALL prevent bid submission after window closure.
- [ ] **[High]** Bids MAY be manually closed or cancelled without awarding.

## Sub-tasks (implementation checklist)

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| VM-06-1 | Bid submission API + validation (rate, **offered_vehicle_count**, optional remarks) | ~ | Pending |
| VM-06-2 | Bid window enforcement (server-side) | ~ | Pending |
| VM-06-3 | Store bid timestamp + validity window metadata | ~ | Pending |
| VM-06-4 | Withdraw endpoint (if policy) + audit events — **no bid PATCH after submit** | ~ | Pending |
| VM-06-5 | Close/cancel bid controls (admin/TDO side) | ~ | Pending |

## API Endpoints (suggested)

```
POST   /api/v1/vendor/bidding-sessions/{session_id}/bids
Body: {
  proposed_cost,
  offered_vehicle_count,
  remarks?
}

DELETE /api/v1/vendor/bidding-sessions/{session_id}/bids/{bid_id}
  (withdraw before deadline — if policy allows)

GET    /api/v1/vendor/bidding-sessions/{session_id}/bids/{bid_id}
```

## Dependencies

- **Requires**: VM-04 bid list visibility; VM-03 tenant join approval; VM-05 bid publication workflow from TDO; completed vendor registration (VM-01/VM-02).
- **Enables**: VM-07 bid evaluation; VM-08 vehicle/driver submission after award.

## Definition of Done

- [ ] Vendor can submit bid within window; submissions blocked after closure
- [ ] Bid is stored with timestamp and rate validity metadata
- [ ] Vendor cannot edit bid after submit; withdraw-before-deadline only if policy enabled; actions audited
- [ ] Admin/TDO can close/cancel bid without awarding

