---
jira_key: ~
jira_type: Story
jira_epic: ~
jira_sprint: "Sprint 4"
title: Vendor Portal Views (Active Bids/Active Trips/Completed Trips) + Visibility Rules
epic: Vendor Portal & Operations
status: Pending
story_points: ~
assignee: ~
---

# VM-04 — Vendor Portal Views (Active Bids/Active Trips/Completed Trips) + Visibility Rules

## User Story

**As a** vendor  
**I want to** view available transport bids and see my trips  
**So that** I can manage participation and execution effectively

## Business Context

The vendor portal is the operational surface for vendors. Visibility must respect:

- Platform verification status (verified vendors only)
- Which tenants the vendor has **joined and been approved** for
- Vendor type (contractual vs non-contractual)

## Acceptance Criteria

### AC-1: Verified Vendor Access Only
- [ ] Only **verified** vendors can access vendor portal views for tenant bids/TO details
- [ ] Unverified vendors cannot access tenant bids or tenant TO details

### AC-2: Vendor Sees Active Tenants + Joined Tenants
- [ ] Vendor can view all **active tenants**
- [ ] Vendor can view which tenants they have joined (and approval status per tenant)

### AC-3: Vendor Portal Provides Core Views (per joined tenant)
- [ ] Vendor can view:
  - **Active bids**
  - **Active trips**
  - **Completed trips**

### AC-4: Tenant Join Gating
- [ ] Vendor can only see bids/trips for tenants where the vendor is **approved as joined**

### AC-5: Vendor Type Gating
- [ ] **Non-Contractual** vendors see available bids (when published) for joined tenants
- [ ] **Contractual** vendors are not required to bid; they primarily see assigned work/trips for joined tenants

### AC-6: Data Isolation by Tenant Membership
- [ ] Vendor only sees bids/TOs/trips for tenants they have joined and been approved for

## Functional Requirements (from PRD)

- [ ] **[Critical]** System SHALL allow eligible vendors to view the bidding list when bids are published.

## Sub-tasks (implementation checklist)

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| VM-04-1 | Vendor portal access control middleware (approved only) | ~ | Pending |
| VM-04-2 | Active tenants list API | ~ | Pending |
| VM-04-3 | Joined tenants list API (with status) | ~ | Pending |
| VM-04-4 | Active bids list API (scoped to joined tenants) | ~ | Pending |
| VM-04-5 | Active trips list API (scoped to joined tenants) | ~ | Pending |
| VM-04-6 | Completed trips list API (scoped to joined tenants) | ~ | Pending |

## API Endpoints (suggested)

```
GET /api/v1/vendor/tenants?status=ACTIVE
GET /api/v1/vendor/tenants/joined
GET /api/v1/vendor/bids?status=ACTIVE
GET /api/v1/vendor/trips?status=ACTIVE
GET /api/v1/vendor/trips?status=COMPLETED
```

## Dependencies

- **Requires**: VM-03 platform verification; VM-09 tenant join approval; bid publication source (TDO/TP); trip/TO domain for trip lists.
- **Enables**: VM-05 bid submission entry from active bids list; VM-07 real-time TO updates.

## Definition of Done

- [ ] Approved vendors can access core portal views
- [ ] Contractual vs Non-Contractual gating enforced
- [ ] Tenant isolation enforced across lists

