---
jira_key: ~
jira_type: Story
jira_epic: ~
jira_sprint: "Sprint 4"
title: Bid Submission Windows + Structured Bid Payload + Late-Bid Prevention
epic: Vendor Portal & Operations
status: In progress
story_points: 6
assignee: ~
---

# VM-05 — Bid Submission Windows + Structured Bid Payload + Late-Bid Prevention

## User Story

**As a** vendor  
**I want to** view available transport bids and submit **offered rate and vehicle count**  
**So that** I can win transport capacity on TOs

## Business Context

TDO publishes TOs to the bidding portal (VM-04) with defined windows and requirements. Vendors submit structured bids within the submission window. The system must prevent late submissions, record an **immutable bid** after submit (**no PATCH / edit** per [TEVF-02](../09-to-execution-vendor-fleet/TEVF-02-non-contractual-bidding.md)), optionally support **withdraw before close** if product policy enables it, and maintain full auditability.

## Acceptance Criteria

### AC-0: Tenant Join Gating
- [x] Vendor can submit bids only for tenants the vendor has **joined and been approved** for

### AC-1: Bid Publication Data Visible to Vendor
- [ ] When bids are published, vendor sees bid details including:
  - Route information
  - Tonnage / expected weight to carry
  - Urgency
  - Required vehicle type
  - Bid submission window
  - Required quantity of vehicles
  - Optional **reference / guide rate** (if provided at publish — VM-04)

### AC-2: Structured Bid Submission
- [ ] Vendor can submit a bid with:
  - Proposed cost / rate (mandatory, numeric, > 0)
  - **Offered number of vehicles** (mandatory integer ≥ 1; must not exceed any server-side max tied to TO demand)
  - Remarks (optional)
- [ ] **Phase 1 simplification**: bid submission does **not** collect vehicle registration / driver / helper identity (those are captured post-award in VM-07).
- [ ] System enforces **one submitted bid per vendor per TO**; **after submit, bid fields are immutable** (no edit endpoint)
- [ ] System records bid status: `SUBMITTED`, `WITHDRAWN`, `ACCEPTED`, `REJECTED`

### AC-3: Bid Window Enforcement
- [x] System supports configurable bid submission windows (`bid_open_date`, `bid_close_date`)
- [x] System prevents bid submission after window closure (hard block); the **effective** `bid_close_date` at the moment the submit reaches the server is authoritative — TDO may have shifted it (see VM-04 AC-6)
- [x] If TDO updates the bidding window timeline mid-session (per VM-04 AC-6), the **next** vendor-side bid-list refresh reflects the new `bid_open_date` / `bid_close_date`; **already-submitted bids remain valid** regardless of timeline shifts

### AC-4: Bid Timestamp + Rate Validity Recording
- [ ] System records bid timestamp
- [ ] System records rate validity according to the bid window rules

### AC-5: Manual Close/Cancel
- [x] Bids may be manually closed or cancelled without awarding

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
- [x] **[Critical]** System SHALL provide support configurable bid submission windows.
- [x] **[High]** System SHALL prevent bid submission after window closure.
- [x] **[High]** Bids MAY be manually closed or cancelled without awarding.

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| VM-05-1 | `Bid` model — FK session + vendor; `proposed_cost`, `offered_vehicle_count`, `remarks`, `status`, immutable after `SUBMITTED` | ~ | **Done** |
| VM-05-2 | `POST .../bids` — membership + **NON_CONTRACTUAL** guard; **one bid per vendor per session**; numeric validations; cap `offered_vehicle_count` vs TO demand | ~ | **Done** |
| VM-05-3 | Window enforcement — compare server time to **effective** `bid_close_date` / `bid_open_date` (post VM-04 window shifts) | ~ | **Done** |
| VM-05-4 | Record `submitted_at` + snapshot of validity window / session times for audit | ~ | **Done** |
| VM-05-5 | `GET .../bids/{bid_id}` — vendor read own bid; TDO list/detail in VM-06 | ~ | **Pending** |
| VM-05-6 | `DELETE .../bids/{bid_id}` (withdraw) — tenant policy flag; before close only; status `WITHDRAWN`; no field mutation | ~ | **Pending** |
| VM-05-7 | TDO manual close/cancel bidding (without award) — align session + bid terminal states | ~ | **Pending** |
| VM-05-8 | Vendor Mobile — bid detail + submit form (rate, vehicle count, remarks) + post-submit read-only UX | ~ | **Done** |
| VM-05-9 | Bid view UX — TDO/publish context on bid detail, **winner** state when session awarded, bidding **window** labels and copy (Vendor Mobile) | ~ | **Pending** |
| VM-05-10 | Cap `offered_vehicle_count` to **1** when TO publish enforces single-vehicle model (align VM-04-10) | ~ | **Pending** |

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

- **Requires**: VM-03 bid list visibility; VM-02 tenant join approval; VM-04 bid publication workflow from TDO; completed vendor onboarding (VM-01).
- **Enables**: VM-06 bid evaluation; VM-07 vehicle/driver submission after award.

## Definition of Done

- [ ] Vendor can submit bid within window; submissions blocked after closure
- [ ] Bid is stored with timestamp and rate validity metadata
- [ ] Vendor cannot edit bid after submit; withdraw-before-deadline only if policy enabled; actions audited
- [x] Admin/TDO can close/cancel bid without awarding

