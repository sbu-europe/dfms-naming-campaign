---
jira_key: ~
jira_type: Story
jira_epic: ~
jira_sprint: "Sprint 4"
title: Bid/TO requirement visibility + vehicle–driver confirmation (+ updates, audit)
epic: Vendor Portal & Operations
status: Pending
story_points: ~
assignee: ~
---

# VM-08 — Bid/TO requirement visibility + vehicle–driver confirmation (+ updates, audit)

## User Story

**As a** vendor  
**I want to** receive bid requirement details and confirm vehicle and driver assignment  
**So that** I can execute the trip

## Business Context

After a vendor **wins a bid** (non-contractual) or **receives assignment** (contractual), they must **see the relevant requirement context** for that Transport Order (TO)—at minimum what was published or agreed (e.g. route, vehicle type/capacity expectations from **VM-05** / TO data)—then **confirm** concrete vehicle, driver, and helper execution details before trip start. That confirmation is the operational handoff for dispatch readiness. Later changes stay controlled via **audit trail** and **reason**.

## Phase 1 Simplification (no vendor fleet/driver master data)

In Phase 1, vendors do **not** pre-create vehicles/drivers in a profile. Instead, after award/assignment the vendor **confirms** execution resources as a **one-off capture** against the specific TO, aligned to visible TO/bid requirements. This confirmed data is what Transport/TDO uses for dispatch readiness.

## Acceptance Criteria

### AC-1: Requirements visible + confirmation required (before trip start)
- [ ] Vendor can view **TO/bid-aligned requirement details** for the awarded/assigned TO (at minimum: data needed to know what they are confirming against—vehicle type/capacity expectations, route/slot context as available from publish/TO)
- [ ] System requires a **confirmed** vehicle/driver/helper capture after award/assignment and **before** trip start (no trip start without it)

### AC-2: Fields captured on confirmation
- [ ] On confirmation, vendor provides:
  - Vehicle number
  - Capacity
  - Driver name and contact information
  - Driver NID/License
  - Helper details with NID

### AC-3: Update/Change with Reason + Audit Trail
- [ ] Vendor can update vehicle and driver details with **audit trail**
- [ ] Vendor can edit vehicle/driver information in case of accidents or uncertain conditions against the same TO
- [ ] Updates require a **reason** and are logged (who/when/what changed)

### AC-4: Substitution Visibility
- [ ] Vendor substitution requires **Transport Department visibility** (at least an internal event/log/notification)

## Functional Requirements (from PRD)

- [ ] **[Critical]** System SHALL surface TO/bid-aligned requirement context to the vendor for the awarded/assigned TO and SHALL require **confirmed** vehicle/driver/helper capture after award/assignment and before trip start.
- [ ] **[Critical]** System SHALL allow update with reasoning of driver and vehicle information with audit trails.

## Sub-tasks (implementation checklist)

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| VM-08-1 | Award/assignment → show requirement context + “confirm vehicle/driver” gate | ~ | Pending |
| VM-08-2 | Confirmation API + validation for required fields | ~ | Pending |
| VM-08-3 | Update API requiring reason + audit log entry | ~ | Pending |
| VM-08-4 | Transport visibility event on substitutions | ~ | Pending |

## API Endpoints (suggested)

```
POST  /api/v1/vendor/transport-orders/{to_id}/vehicle-driver
PATCH /api/v1/vendor/transport-orders/{to_id}/vehicle-driver   Body: { ..., reason }
```

## Dependencies

- **Requires**: VM-07 award decision (or contractual assignment trigger), TO/bid publication data (**VM-05** / TO domain), transport order/trip entity.
- **Enables**: Trip execution readiness; transport ops can proceed with dispatch/trip lifecycle.

## Definition of Done

- [ ] Winning vendor cannot start trip until requirement context is available and vehicle/driver/helper **confirmation** is recorded
- [ ] Updates require reason and produce audit logs
- [ ] Transport is notified/has visibility when substitutions occur

