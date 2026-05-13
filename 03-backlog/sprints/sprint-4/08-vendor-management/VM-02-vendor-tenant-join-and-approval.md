---
jira_key: ~
jira_type: Story
jira_epic: ~
jira_sprint: "Sprint 4"
title: Vendor ↔ Tenant Join + Approval + Tenant-Assigned Vendor Type + Visibility Scoping
epic: Vendor Portal & Operations
status: Pending
story_points: ~
assignee: ~
---

# VM-02 — Vendor ↔ Tenant Join, Approval & Tenant-Assigned Vendor Type + Visibility Scoping

## User Story

**As a** vendor  
**I want to** join specific tenants  
**So that** I only see and bid/operate for tenants I work with

## Business Context

Vendors complete **platform onboarding** (company profile + compliance documents); operational participation is tenant-specific. Vendors request to join tenants; tenants approve vendors before the vendor can see tenant bids, TOs, and trips.

**Vendor type (Contractual vs Non-Contractual)** is **not** chosen by the vendor. When a **Tenant Admin** approves a join request, they **must set** the vendor type **for that vendor within that tenant**. That type drives whether the vendor participates via **direct assignment** (Contractual) or **bidding** (Non-Contractual) for that tenant only.

Tenant Admin cannot invite vendors or see the global vendor directory; tenant-side interaction is limited to **reviewing join requests** and, on approval, **assigning tenant-scoped vendor type**.

## Acceptance Criteria

### AC-1: Vendor Can See Active Tenants
- [ ] Vendor with **completed platform onboarding** can view a list of all **active tenants**

### AC-2: Vendor Can Request to Join Tenant
- [ ] Vendor can submit a join request for a selected tenant
- [ ] Join request status is visible to the vendor: `PENDING`, `APPROVED`, `REJECTED`

### AC-3: Tenant Can Approve/Reject Join Requests + Set Vendor Type on Approve
- [ ] Tenant can view join requests for their tenant in a queue
- [ ] Tenant can **reject** a join request (rejections require a reason/remarks — recommended)
- [ ] Tenant can **approve** a join request only after selecting **vendor type** for that vendor **within this tenant**:
  - **Contractual (Fixed Rate)**: vendor may receive direct TO assignment by TDO for this tenant (no bidding requirement for this relationship)
  - **Non-Contractual**: vendor may receive bid notifications and submit bids for this tenant (subject to publish rules)
- [ ] Vendor cannot self-edit tenant-scoped vendor type in Phase 1 (changes, if any, are Tenant Admin–only)

### AC-4: Visibility Scoping After Approval
- [ ] Vendor can only see bids/trips/TOs for tenants where join status is `APPROVED`
- [ ] If join request is `PENDING` or `REJECTED`, vendor cannot see tenant bids/trips/TOs
- [ ] Within an approved tenant, **bid vs direct-assignment surfaces** respect the **tenant-assigned** vendor type (align with VM-03/VM-05)

### AC-5: Audit Trail + Notifications
- [ ] Join request submit/approve/reject events are logged for audit
- [ ] **Approve** audit entry includes selected `vendor_type`
- [ ] Vendor receives notification on approval/rejection

## Sub-tasks (implementation checklist)

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| VM-02-1 | Tenant directory (active tenants) API for vendors | ~ | Pending |
| VM-02-2 | Vendor join request API + status model | ~ | Pending |
| VM-02-3 | Tenant-side join queue + approve (with mandatory `vendor_type`) / reject actions | ~ | Pending |
| VM-02-4 | Enforce scoping on bids/trips/TO queries by joined tenants + per-tenant `vendor_type` | ~ | Pending |
| VM-02-5 | Notifications + audit events (include `vendor_type` on approve) | ~ | Pending |
| VM-02-6 | Data model: membership/join record stores `vendor_type` per `(vendor, tenant)` | ~ | Pending |

## API Endpoints (suggested)

```
GET  /api/v1/vendor/tenants?status=ACTIVE
POST /api/v1/vendor/tenants/{tenant_id}/join-requests

GET  /api/v1/tenant/vendors/join-requests?status=PENDING
POST /api/v1/tenant/vendors/join-requests/{request_id}/approve   Body: { "vendor_type": "CONTRACTUAL" | "NON_CONTRACTUAL" }
POST /api/v1/tenant/vendors/join-requests/{request_id}/reject   Body: { "remarks": "string" }
```

## Dependencies

- **Requires**: completed vendor onboarding; tenant identity model; notifications/audit.
- **Enables**: vendor portal and bid submission scoping (uses **per-tenant** `vendor_type`); TO update scoping.

## Data (minimum)

- Join / membership record: `vendor_id`, `tenant_id`, `status` (`PENDING` | `APPROVED` | `REJECTED`), `vendor_type` (`CONTRACTUAL` | `NON_CONTRACTUAL`) — `vendor_type` required when `status` becomes `APPROVED`

## Definition of Done

- [ ] Vendor with completed platform onboarding can submit join request; tenant can reject (with remarks) or approve with mandatory **vendor type**
- [ ] Vendor visibility for bids/trips/TOs is scoped to approved memberships; bid vs direct-assignment UX respects **per-tenant** `vendor_type`

