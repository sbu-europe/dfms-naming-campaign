---
jira_key: ~
jira_type: Story
jira_epic: ~
jira_sprint: "Sprint 4"
title: Vehicle & Driver Submission After Bid Winning + Update with Reason + Audit Trail
epic: Vendor Portal & Operations
status: Pending
story_points: ~
assignee: ~
---

# VM-06 — Vehicle & Driver Submission After Bid Winning + Update with Reason + Audit Trail

## User Story

**As a** vendor  
**I want to** submit vehicle and driver details  
**So that** trips can be executed

## Business Context

After a vendor wins a bid (non-contractual) or receives assignment (contractual), vehicle/driver details must be provided before trip start. Changes must be controlled via audit trail and reasoning.

## Phase 1 Simplification (no vendor fleet/driver master data)

In Phase 1, vendors do **not** pre-create vehicles/drivers in a profile. Instead, after award/assignment the vendor provides the required vehicle/driver/helper information as a **one-off submission** against the specific Transport Order (TO). This submitted data is what Transport/TDO uses for dispatch readiness.

## Acceptance Criteria

### AC-1: Required Submission After Winning (before trip start)
- [ ] System requires vehicle & driver submission after bid winning and before starting trip

### AC-2: Fields Captured
- [ ] Vendor submits:
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

- [ ] **[Critical]** System SHALL require vehicle & driver submission after bid winning and before starting trip.
- [ ] **[Critical]** System SHALL allow update with reasoning of driver and vehicle information with audit trails.

## Sub-tasks (implementation checklist)

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| VM-06-1 | Award/assignment → “vehicle/driver required” gate | ~ | Pending |
| VM-06-2 | Submission API + validation for required fields | ~ | Pending |
| VM-06-3 | Update API requiring reason + audit log entry | ~ | Pending |
| VM-06-4 | Transport visibility event on substitutions | ~ | Pending |

## API Endpoints (suggested)

```
POST  /api/v1/vendor/transport-orders/{to_id}/vehicle-driver
PATCH /api/v1/vendor/transport-orders/{to_id}/vehicle-driver   Body: { ..., reason }
```

## Dependencies

- **Requires**: VM-08 award decision (or contractual assignment trigger), transport order/trip entity.
- **Enables**: Trip execution readiness; transport ops can proceed with dispatch/trip lifecycle.

## Definition of Done

- [ ] Winning vendor cannot start trip until vehicle/driver/helper details are submitted
- [ ] Updates require reason and produce audit logs
- [ ] Transport is notified/has visibility when substitutions occur

