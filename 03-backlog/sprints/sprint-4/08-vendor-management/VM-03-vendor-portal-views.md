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

# VM-03 — Vendor Portal Views (Active Bids/Active Trips/Completed Trips) + Visibility Rules

## User Story

**As a** vendor  
**I want to** view available transport bids and see my trips  
**So that** I can manage participation and execution effectively

## Business Context

The vendor portal is the operational surface for vendors. Visibility must respect:

- **Completed platform onboarding** (authenticated vendor with mandatory docs + profile as required)
- Which tenants the vendor has **joined and been approved** for
- **Per-tenant** vendor type (Contractual vs Non-Contractual) from **tenant join approval** (VM-02)

## Acceptance Criteria

### AC-1: Onboarded Vendor Access Only
- [ ] Only vendors who **completed platform onboarding** (including mandatory documents) can access vendor portal views for tenant bids/TO details
- [ ] Vendors without completed onboarding cannot access tenant bids or tenant TO details

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

### AC-5: Vendor Type Gating (per tenant membership)
- [ ] For each **joined tenant**, the UI respects the **tenant-assigned** vendor type (VM-02): **Non-Contractual** sees available bids (when published) for that tenant; **Contractual** is not required to bid and primarily sees assigned work/trips for that tenant
- [ ] If a vendor is **Non-Contractual** for tenant A and **Contractual** for tenant B, gating applies **independently** per tenant

### AC-6: Data Isolation by Tenant Membership
- [ ] Vendor only sees bids/TOs/trips for tenants they have joined and been approved for

## Functional Requirements (from PRD)

- [ ] **[Critical]** System SHALL allow eligible vendors to view the bidding list when bids are published.

## Sub-tasks (implementation checklist)

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| VM-03-1 | Vendor portal access control middleware (approved only) | ~ | Pending |
| VM-03-2 | Active tenants list API | ~ | Pending |
| VM-03-3 | Joined tenants list API (with status) | ~ | Pending |
| VM-03-4 | Active bids list API (scoped to joined tenants) | ~ | Pending |
| VM-03-5 | Active trips list API (scoped to joined tenants) | ~ | Pending |
| VM-03-6 | Completed trips list API (scoped to joined tenants) | ~ | Pending |

## API Endpoints (suggested)

```
GET /api/v1/vendor/tenants?status=ACTIVE
GET /api/v1/vendor/tenants/joined
GET /api/v1/vendor/bids?status=ACTIVE
GET /api/v1/vendor/trips?status=ACTIVE
GET /api/v1/vendor/trips?status=COMPLETED
```

## Dependencies

- **Requires**: completed onboarding; VM-02 tenant join approval; bid publication source (TDO/TP); trip/TO domain for trip lists.
- **Enables**: VM-05 bid submission entry from active bids list; VM-08 real-time TO updates.

## Definition of Done

- [ ] Vendors who completed onboarding can access core portal views (subject to VM-02 per-tenant join)
- [ ] **Per-tenant** Contractual vs Non-Contractual gating enforced (type from VM-02 membership)
- [ ] Tenant isolation enforced across lists

