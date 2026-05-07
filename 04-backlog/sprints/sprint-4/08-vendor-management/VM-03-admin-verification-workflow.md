---
jira_key: ~
jira_type: Story
jira_epic: ~
jira_sprint: "Sprint 4"
title: Admin Vendor Verification Queue + Approve/Reject + Resubmission
epic: Vendor Onboarding & Verification
status: Pending
story_points: ~
assignee: ~
---

# VM-03 — Admin Vendor Verification Queue + Approve/Reject + Resubmission

## User Story

**As a** Platform Admin  
**I want to** review vendor registrations  
**So that** only compliant and verified vendors can participate in transport operations

## Business Context

Vendor participation is gated by **platform-level** verification. Platform Admin needs a queue view and must be able to approve or reject with remarks, with real-time status updates and resubmission loop.

Tenant Admin is not allowed to:

- Invite/create vendors
- View the global vendor directory

## Acceptance Criteria

### AC-1: Admin Verification Queue
- [ ] Platform Admin can view vendor profiles in a **verification queue**
- [ ] Queue shows at least: vendor name, vendor type, submission timestamp, current status

### AC-2: Approve Vendor
- [ ] Platform Admin can approve a vendor registration
- [ ] Approved vendors become **Active** and eligible for operations:
  - Non-Contractual: eligible for bidding
  - Contractual: eligible for direct assignment

### AC-3: Reject Vendor (mandatory remarks)
- [ ] Platform Admin can reject a vendor registration
- [ ] Rejection requires **remarks** (mandatory)
- [ ] Rejected vendors are allowed to **resubmit** updated information

### AC-4: Approval Mandatory Before Participation
- [ ] Vendors cannot access bidding or TO details before approval
- [ ] Approval is mandatory before vendor participation

### AC-5: Real-time Status Updates
- [ ] Vendor approval status updates are reflected in real-time (queue + vendor side where applicable)

### AC-6: Tenant Admin Visibility Limits
- [ ] Tenant Admin cannot access the platform **Vendors** menu or the global vendor verification queue

## Functional Requirements (from PRD)

- [ ] **[Critical]** System SHALL provide an Admin verification queue for vendor profiles.
- [ ] **[Critical]** System SHALL enforce mandatory rejection remarks.
- [ ] **[High]** Vendor approval status SHALL be updated in real-time.

## Sub-tasks (implementation checklist)

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| VM-03-1 | Admin list/queue API (platform-scoped) | ~ | Pending |
| VM-03-2 | Approve endpoint + status transition | ~ | Pending |
| VM-03-3 | Reject endpoint (remarks required) + status transition | ~ | Pending |
| VM-03-4 | Resubmission flow coordination (vendor can edit + resubmit) | ~ | Pending |
| VM-03-5 | Real-time update mechanism (polling/websocket) | ~ | Pending |

## API Endpoints (suggested)

```
GET   /api/v1/platform/vendors/verifications?status=PENDING_VERIFICATION
POST  /api/v1/platform/vendors/{vendor_id}/approve
POST  /api/v1/platform/vendors/{vendor_id}/reject   Body: { remarks }
```

## Dependencies

- **Requires**: VM-01/02 registration + docs; notification/eventing mechanism for status updates.
- **Enables**: VM-09 tenant join requests (only after verification), VM-04/05 (portal + bidding access gated by tenant join + approval).

## Definition of Done

- [ ] Admin can approve/reject vendor registrations with audit trail
- [ ] Rejection requires remarks; vendor can resubmit
- [ ] Approved vendor becomes active and can access permitted portal/bidding features

