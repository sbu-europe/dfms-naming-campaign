---
jira_key: ~
jira_type: Story
jira_epic: ~
jira_sprint: "Sprint 4"
title: TDO Publish TO to Bidding Portal (deadline + eligibility + notify)
epic: TDO Bid Evaluation
status: Pending
story_points: 8
assignee: ~
---

# VM-04 — TDO Publish TO to Bidding Portal (deadline + eligibility + notify)

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
  - **Bid window timeline**: `bid_close_date` (date + time) mandatory; `bid_open_date` (date + time) defaults to `now()` if omitted
  - **Required number of vehicles** (integer ≥ 1)
  - Required vehicle type
  - Required capacity / tonnage requirement
- [ ] TDO may optionally provide:
  - **Reference / guide rate** for bidding (optional; not a binding ceiling/floor unless policy states otherwise)
  - Estimated cost (reference only; may align with guide rate)
  - Minimum vendor rating threshold (if rating system is available)
- [ ] Post-publish, **only the bid window timeline** (`bid_open_date`, `bid_close_date`) is editable; see AC-6. All other parameters listed above are **immutable post-publish** and require cancel + republish to change.

### AC-3: Deadline Rules + Auto-close
- [ ] Deadline must be at least 2 hours from publish time (server-side enforcement)
- [ ] Deadline must not exceed 7 days from publish time (server-side enforcement)
- [ ] System auto-closes bidding at the deadline and blocks late submissions
- [ ] The same min/max policy bounds re-apply to any **timeline update** made by TDO (see AC-6); updated `bid_open_date` / `bid_close_date` must still satisfy the policy

### AC-4: Eligibility & Visibility Scoping
- [ ] Only vendors who **completed platform onboarding** and are **approved to join** the TO’s tenant (VM-02) can be eligible
- [ ] Only **non-contractual** vendors (for that tenant membership) are eligible to bid
- [ ] Vendor eligibility is scoped to:
  - Vendors approved to join the TO’s tenant (VM-02 gating)
  - Vendor rating ≥ minimum threshold (if configured/available)
  - Vendor is not blacklisted (if blacklist exists)
  - **Phase 1 simplification**: do not filter eligibility by vendor fleet/vehicle profile (no pre-created vehicles). Vehicle type/capacity are enforced during post-award vehicle/driver submission (VM-07) and/or dispatch readiness checks.

### AC-5: State Transitions + Audit Trail
- [ ] Publishing creates a bidding session linked to the TO
- [ ] TO transitions to `OPEN_FOR_BIDDING` (or equivalent)
- [ ] Publishing action is logged with: TDO user, timestamp, TO id, parameters

### AC-6: Manage Active Bidding — Window Timeline Update Only
- [ ] TDO can view active bidding TOs and bid counts.
- [ ] **TDO can update the bidding window timeline only** — i.e. **open date+time and/or close date+time** of the active bidding session:
  - **Extend** the close date+time (push it later) before the session closes.
  - **Shrink** the close date+time (pull it earlier) before the session closes — must remain ≥ now + minimum policy floor (default 2 hours) so already-eligible vendors have a fair submission window.
  - **Shift** the open date+time only while the session is still `SCHEDULED` (not yet open); once open, `bid_open_date` is immutable.
  - Updated `bid_open_date` and `bid_close_date` MUST satisfy the publish-time policy bounds (AC-3).
  - Recommended: limit number of consecutive close-date extensions (configurable; default: 2).
- [ ] **All other published parameters are immutable post-publish** (`required_vehicle_count`, `required_vehicle_type`, `required_capacity`, `reference_rate`, `min_vendor_rating`, eligibility filters). Any other change requires **cancel + republish**.
- [ ] TDO can cancel bidding with a required reason.
- [ ] **Cancel + republish** is the supported path for any non-timeline change (cancel current session with reason → publish a new session with corrected parameters); existing bids on the cancelled session terminate as part of cancellation flow.
- [ ] All management actions are audited (who/when/what/why), including each window-timeline update with **before/after** `bid_open_date` and `bid_close_date` values.

### AC-7: Notifications
- [ ] On publish, system notifies eligible vendors (in-app + email/SMS where applicable)
- [ ] System sends reminder notifications before deadline (recommended: 1 hour prior)
- [ ] System notifies TDO on new bid submission events (from VM-05)

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| VM-04-1 | `BiddingSession` (or equivalent) model — FK TO, window (`bid_open_date`, `bid_close_date`), immutable publish params, session status enum | ~ | Pending |
| VM-04-2 | Publish pre-checks — TO status (e.g. `PLANNED`), data completeness (route, pickup, vehicle type/capacity, `required_vehicle_count`), no duplicate active session | ~ | Pending |
| VM-04-3 | `POST .../bidding/publish` — persist params; transition TO → `OPEN_FOR_BIDDING` (or product enum); `bid_open_date` default now; **deadline policy** min 2h / max 7d | ~ | Pending |
| VM-04-4 | Eligibility resolver — `APPROVED` membership + **NON_CONTRACTUAL** for tenant + optional rating floor + blacklist hook (Phase 1: no fleet pre-filter) | ~ | Pending |
| VM-04-5 | Auto-close job / scheduler — at `bid_close_date` close session; hard-block late bids (VM-05) | ~ | Pending |
| VM-04-6 | `PATCH .../bidding/window` — timeline-only edits; **open** immutable after session opens; close shrink/extend rules + max extension count (config default 2) | ~ | Pending |
| VM-04-7 | `POST .../bidding/cancel` — required reason; terminate session + invalidate in-flight bids per cancel policy; audit | ~ | Pending |
| VM-04-8 | Cancel + republish flow — document + implement as only path for non-timeline param changes | ~ | Pending |
| VM-04-9 | Notifications — publish blast to eligible vendors; 1h reminder; wire **TDO new bid** event (VM-05) | ~ | Pending |
| VM-04-10 | Audit — publish payload; each window update with **before/after** open/close; cancel reason; `BIDDING_WINDOW_UPDATED` event | ~ | Pending |
| VM-04-11 | TDO UI — publish form + active session dashboard (bid counts) + window editor + cancel | ~ | Pending |

## Suggested API Endpoints

```
POST /api/v1/tdo/transport-orders/{to_id}/bidding/publish
Body: {
  bid_open_date,                  // ISO8601 date+time; default = now() if omitted
  bid_close_date,                 // ISO8601 date+time; mandatory
  required_vehicle_count,
  required_vehicle_type,
  required_capacity,
  reference_rate?,
  estimated_cost?,
  min_vendor_rating?
}

// Update bidding window timeline ONLY (open and/or close date+time).
// All other published parameters are immutable — for those, use cancel + republish.
PATCH /api/v1/tdo/transport-orders/{to_id}/bidding/window
Body: {
  bid_open_date?,                 // editable only while session is SCHEDULED (not yet open)
  bid_close_date?                 // editable while session is OPEN; must remain >= now() + policy_min_window
}

POST /api/v1/tdo/transport-orders/{to_id}/bidding/cancel
Body: { reason }
```

**Validation contract for `PATCH .../bidding/window`:**

- Reject (`409`) if session is not in a mutable state (e.g. already `CLOSED`, `AWARDED`, `CANCELLED`).
- Reject (`400`) if `bid_open_date` is sent for an already-open session.
- Reject (`400`) if `bid_close_date <= now()` or `bid_close_date - now() < policy_min_window`.
- Reject (`400`) if updated `bid_close_date - bid_open_date` exceeds the policy max (default 7 days).
- Reject (`409`) if `bid_close_date` is moved earlier and would invalidate already-submitted bids? **No** — already-submitted bids remain valid; vendors who have not yet submitted are subject to the new (earlier) deadline. Audit log MUST flag this.
- Emit `BIDDING_WINDOW_UPDATED` event with before/after timestamps; vendor mobile reflects new `bid_close_date` / `bid_open_date` on next list refresh.

## Dependencies

- **Feature context:** [TEVF-02 — Non-contractual bidding](../09-to-execution-vendor-fleet/TEVF-02-non-contractual-bidding.md) (publish requirements alignment).
- **Requires**: tenant join approval gating (VM-02); vendor onboarding completeness where relevant (VM-01); notification/eventing.
- **Enables**: vendor browse/bid flows (VM-03/VM-05), evaluation/award (VM-06).

## Definition of Done

- [ ] TDO can publish a TO into an open bidding state with validated parameters.
- [ ] Eligibility filters enforced; only eligible vendors can see/bid.
- [ ] Auto-close at deadline; late bid submissions blocked.
- [ ] **TDO can update the bidding window timeline (open and/or close date+time) only**; the API enforces immutability for all other published parameters; audit log captures before/after timestamps for each window update.
- [ ] **Cancel + republish** is the only path for non-timeline parameter changes.
- [ ] Cancel flow audited and working.

