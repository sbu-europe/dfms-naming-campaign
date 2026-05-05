---
jira_key: ~
jira_type: Story
jira_epic: ~
jira_sprint: "Sprint 4"
title: Vendor ↔ Tenant Join Requests + Tenant Approval + Visibility Scoping
epic: Vendor Portal & Operations
status: Pending
story_points: ~
assignee: ~
---

# VM-09 — Vendor ↔ Tenant Join Requests + Tenant Approval + Visibility Scoping

## User Story

**As a** vendor  
**I want to** join specific tenants  
**So that** I only see and bid/operate for tenants I work with

## Business Context

Vendors are verified at the platform level, but operational participation is tenant-specific. Vendors request to join tenants; tenants approve vendors before the vendor can see tenant bids, TOs, and trips.

Tenant Admin cannot invite vendors or see the global vendor directory; tenant-side interaction is limited to **approving vendor join requests** for their own tenant.

## Acceptance Criteria

### AC-1: Vendor Can See Active Tenants
- [ ] Verified vendor can view a list of all **active tenants**

### AC-2: Vendor Can Request to Join Tenant
- [ ] Vendor can submit a join request for a selected tenant
- [ ] Join request status is visible to the vendor: `PENDING`, `APPROVED`, `REJECTED`

### AC-3: Tenant Can Approve/Reject Join Requests
- [ ] Tenant can view join requests for their tenant in a queue
- [ ] Tenant can approve or reject a join request
- [ ] Rejections require a reason/remarks (recommended)

### AC-4: Visibility Scoping After Approval
- [ ] Vendor can only see bids/trips/TOs for tenants where join status is `APPROVED`
- [ ] If join request is `PENDING` or `REJECTED`, vendor cannot see tenant bids/trips/TOs

### AC-5: Audit Trail + Notifications
- [ ] Join request submit/approve/reject events are logged for audit
- [ ] Vendor receives notification on approval/rejection

## Sub-tasks (implementation checklist)

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| VM-09-1 | Tenant directory (active tenants) API for vendors | ~ | Pending |
| VM-09-2 | Vendor join request API + status model | ~ | Pending |
| VM-09-3 | Tenant-side join request queue + approve/reject actions | ~ | Pending |
| VM-09-4 | Enforce scoping on bids/trips/TO queries by joined tenants | ~ | Pending |
| VM-09-5 | Notifications + audit events | ~ | Pending |

## API Endpoints (suggested)

```
GET  /api/v1/vendor/tenants?status=ACTIVE
POST /api/v1/vendor/tenants/{tenant_id}/join-requests

GET  /api/v1/tenant/vendors/join-requests?status=PENDING
POST /api/v1/tenant/vendors/join-requests/{request_id}/approve
POST /api/v1/tenant/vendors/join-requests/{request_id}/reject   Body: { remarks }
```

## Dependencies

- **Requires**: VM-03 vendor verification; tenant identity model; notifications/audit.
- **Enables**: VM-04/05 vendor portal and bid submission scoping; VM-07 TO update scoping.

## Definition of Done

- [ ] Verified vendor can request to join tenant; tenant can approve/reject
- [ ] Vendor visibility for bids/trips/TOs is scoped to approved tenant memberships

