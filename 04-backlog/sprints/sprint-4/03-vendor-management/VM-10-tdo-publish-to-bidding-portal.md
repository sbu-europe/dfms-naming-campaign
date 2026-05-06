---
jira_key: ~
jira_type: Story
jira_epic: ~
jira_sprint: "Sprint 4"
title: TDO Publish TO to Bidding Portal (deadline + eligibility + notify)
epic: TDO Bid Evaluation
status: Pending
story_points: ~
assignee: ~
---

# VM-10 — TDO Publish TO to Bidding Portal (deadline + eligibility + notify)

## User Story

**As a** Transport Distribution Officer (TDO)  
**I want to** publish a Transport Order (TO) to a bidding portal with clear bidding parameters  
**So that** eligible non-contractual vendors can submit competitive bids within a defined window

## Business Context

This story is the missing “entry point” for the bidding workflow: **a TO must be published** into an open bidding state before vendors can browse and bid. Publishing must apply **eligibility rules**, create a **bidding session**, and trigger **notifications**.

## Acceptance Criteria

### AC-1: Publish Action Allowed Only for Valid TOs
- [ ] System allows TDO to publish a TO to bidding only when TO status is compatible (e.g., `PLANNED`)
- [ ] System validates TO data completeness before publishing (route, pickup time, required vehicle type/capacity, quantity/tonnage)
- [ ] System prevents publishing if TO already has an active bidding session

### AC-2: Bidding Parameters Required at Publish Time
- [ ] TDO must provide:
  - Bidding deadline (date + time)
  - Required vehicle type
  - Required capacity / tonnage requirement
- [ ] TDO may optionally provide:
  - Estimated cost (reference only)
  - Minimum vendor rating threshold (if rating system is available)

### AC-3: Deadline Rules + Auto-close
- [ ] Deadline must be at least 2 hours from publish time (server-side enforcement)
- [ ] Deadline must not exceed 7 days from publish time (server-side enforcement)
- [ ] System auto-closes bidding at the deadline and blocks late submissions

### AC-4: Eligibility & Visibility Scoping
- [ ] Only **verified** vendors can be eligible
- [ ] Only **non-contractual** vendors are eligible to bid
- [ ] Vendor eligibility is scoped to:
  - Vendors approved to join the TO’s tenant (VM-09 gating)
  - Vendor vehicle type matches TO requirement
  - Vendor vehicle capacity meets TO requirement
  - Vendor rating ≥ minimum threshold (if configured/available)
  - Vendor is not blacklisted (if blacklist exists)

### AC-5: State Transitions + Audit Trail
- [ ] Publishing creates a bidding session linked to the TO
- [ ] TO transitions to `OPEN_FOR_BIDDING` (or equivalent)
- [ ] Publishing action is logged with: TDO user, timestamp, TO id, parameters

### AC-6: Manage Active Bidding
- [ ] TDO can view active bidding TOs and bid counts
- [ ] TDO can extend the bidding deadline before closing (bounded by business rules; recommended: limited number of extensions)
- [ ] TDO can cancel bidding with a required reason
- [ ] All management actions are audited (who/when/what/why)

### AC-7: Notifications
- [ ] On publish, system notifies eligible vendors (in-app + email/SMS where applicable)
- [ ] System sends reminder notifications before deadline (recommended: 1 hour prior)
- [ ] System notifies TDO on new bid submission events (from VM-05)

## Suggested API Endpoints

```
POST /api/v1/tdo/transport-orders/{to_id}/bidding/publish
Body: {
  bidding_deadline,
  required_vehicle_type,
  required_capacity,
  estimated_cost?,
  min_vendor_rating?
}

POST /api/v1/tdo/transport-orders/{to_id}/bidding/extend-deadline
Body: { bidding_deadline }

POST /api/v1/tdo/transport-orders/{to_id}/bidding/cancel
Body: { reason }
```

## Dependencies

- **Requires**: vendor verification gating (VM-03), tenant join approval gating (VM-09), vendor vehicle profile availability (VM-02), notification/eventing.
- **Enables**: vendor browse/bid flows (VM-04/05), evaluation/award (VM-08).

## Definition of Done

- [ ] TDO can publish a TO into an open bidding state with validated parameters
- [ ] Eligibility filters enforced; only eligible vendors can see/bid
- [ ] Auto-close at deadline; late bid submissions blocked
- [ ] Extend/cancel flows audited and working
- [ ] Notifications triggered for publish + reminders

