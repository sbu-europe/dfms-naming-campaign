---
jira_key: ~
jira_type: Story
jira_epic: ~
jira_sprint: "Sprint 4"
title: Vendor Portal Views (Active Bids/Active Trips/Completed Trips) + Visibility Rules
epic: Vendor Portal & Operations
status: In progress
story_points: 5
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
- [x] Only vendors who **completed platform onboarding** (including mandatory documents) can access vendor portal views for tenant bids/TO details
- [x] Vendors without completed onboarding cannot access tenant bids or tenant TO details

### AC-2: Vendor Sees Active Tenants + Joined Tenants
- [x] Vendor can view all **active tenants**
- [x] Vendor can view which tenants they have joined (and approval status per tenant)

### AC-3: Vendor Portal Provides Core Views (per joined tenant)
- [x] Vendor can view:
  - **Active bids**
  - **Active trips**
  - **Completed trips**

### AC-4: Tenant Join Gating
- [x] Vendor can only see bids/trips for tenants where the vendor is **approved as joined**

### AC-5: Vendor Type Gating (per tenant membership)
- [ ] For each **joined tenant**, the UI respects the **tenant-assigned** vendor type (VM-02): **Non-Contractual** sees available bids (when published) for that tenant; **Contractual** is not required to bid and primarily sees assigned work/trips for that tenant
- [x] If a vendor is **Non-Contractual** for tenant A and **Contractual** for tenant B, gating applies **independently** per tenant

### AC-6: Data Isolation by Tenant Membership
- [x] Vendor only sees bids/TOs/trips for tenants they have joined and been approved for

## Functional Requirements (from PRD)

- [ ] **[Critical]** System SHALL allow eligible vendors to view the bidding list when bids are published.

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| VM-03-1 | Vendor portal access guard — completed onboarding (VM-01) + **≥1** `APPROVED` membership (VM-02) | ~ | **Done** |
| VM-03-2 | `GET /api/v1/vendor/tenants?status=ACTIVE` — active tenant directory (reuse VM-02-2 contract) | ~ | **Done** |
| VM-03-3 | `GET /api/v1/vendor/tenants/joined` — per-tenant `join_status` + `vendor_type` for gating | ~ | **Done** |
| VM-03-4 | `GET /api/v1/vendor/bids?status=ACTIVE` — **NON_CONTRACTUAL** + `APPROVED` tenant + published/open sessions (VM-04) | ~ | **Done** |
| VM-03-5 | `GET /api/v1/vendor/trips?status=ACTIVE` — scoped to `APPROVED` tenants; **CONTRACTUAL** sees assigned/execution TOs; **NON_CONTRACTUAL** post-award trips | ~ | **Done** |
| VM-03-6 | `GET /api/v1/vendor/trips?status=COMPLETED` — same tenant + type rules as active trips | ~ | **Done** |
| VM-03-7 | Vendor Mobile — tab/list UX for Active Bids / Active Trips / Completed Trips + empty states when gated out | ~ | **Done** |
| VM-03-8 | Integration tests — vendor **A** `NON_CONTRACTUAL`@T1 + **CONTRACTUAL**@T2 sees correct independent surfaces | ~ | **Pending** |
| VM-03-9 | TO lifecycle management in Vendor Portal — vendor-facing TO states (e.g. assigned / in progress / completed / closed), detail screens, and allowed actions per state | ~ | **Pending** |
| VM-03-10 | App auto refresh on tab change — when user switches Active Bids / Active Trips / Completed Trips tabs, lists refresh from server | ~ | **Pending** |
| VM-03-11 | E2E test coverage — validate active bids, active trips, completed trips, tenant-scoped visibility, lifecycle views, and tab refresh in next sprint | ~ | **Pending** |

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

- [x] Vendors who completed onboarding can access core portal views (subject to VM-02 per-tenant join)
- [ ] **Per-tenant** Contractual vs Non-Contractual gating enforced (type from VM-02 membership)
- [x] Tenant isolation enforced across lists

