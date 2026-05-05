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

# VM-05 — Bid Submission Windows + Structured Bid Payload + Late-Bid Prevention

## User Story

**As a** vendor  
**I want to** view available transport bids and submit competitive rates  
**So that** I can win trips

## Business Context

TDO publishes bids with defined windows and requirements. Vendors submit structured bids containing rate and vehicle availability within the submission window. The system must prevent late submissions.

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
  - Rate (price)
  - Number of vehicles available for TO execution

### AC-3: Bid Window Enforcement
- [ ] System supports configurable bid submission windows
- [ ] System prevents bid submission after window closure (hard block)

### AC-4: Bid Timestamp + Rate Validity Recording
- [ ] System records bid timestamp
- [ ] System records rate validity according to the bid window rules

### AC-5: Manual Close/Cancel
- [ ] Bids may be manually closed or cancelled without awarding

## Functional Requirements (from PRD)

- [ ] **[Critical]** System SHALL provide support configurable bid submission windows.
- [ ] **[High]** System SHALL prevent bid submission after window closure.
- [ ] **[High]** Bids MAY be manually closed or cancelled without awarding.

## Sub-tasks (implementation checklist)

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| VM-05-1 | Bid submission API + validation (rate, vehicle count) | ~ | Pending |
| VM-05-2 | Bid window enforcement (server-side) | ~ | Pending |
| VM-05-3 | Store bid timestamp + validity window metadata | ~ | Pending |
| VM-05-4 | Close/cancel bid controls (admin/TDO side) | ~ | Pending |

## API Endpoints (suggested)

```
POST /api/v1/vendor/bids/{bid_id}/submit
Body: { rate, available_vehicle_count }

GET  /api/v1/vendor/bids/{bid_id}
```

## Dependencies

- **Requires**: VM-04 bid list visibility; VM-09 tenant join approval; bid publication workflow from TDO; vendor verification gating.
- **Enables**: VM-08 bid evaluation; VM-06 vehicle/driver submission after award.

## Definition of Done

- [ ] Vendor can submit bid within window; submissions blocked after closure
- [ ] Bid is stored with timestamp and rate validity metadata
- [ ] Admin/TDO can close/cancel bid without awarding

