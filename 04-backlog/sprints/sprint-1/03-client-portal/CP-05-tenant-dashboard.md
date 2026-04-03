---
jira_key: DFS-016
jira_type: Story
jira_epic: DFS-012
jira_sprint: "Sprint 1"
task_id: CP-05
title: Tenant Dashboard — Basic Live Operational Metrics
epic: Client Portal
status: Done
story_points: 3
assignee: ~
---

# CP-05 — Tenant Dashboard — Basic Live Operational Metrics

## User Story

**As a** Tenant Admin  
**I want** a dashboard that shows a live summary of my organisation's key metrics  
**So that** I can quickly understand the current operational status when I log in

## Description

After completing the 2FA login, the Tenant Admin lands on the dashboard. At this early stage (Sprint 1), the dashboard shows foundational metrics that confirm the system is working: active users, total trips to date, and subscription plan details. More detailed operational widgets (active trips, gate status, QC summary) will be added in subsequent sprints.

## Acceptance Criteria

- [x] Dashboard is accessible only to authenticated users; unauthenticated requests redirect to `/login/`
- [x] Dashboard displays: total active users in the tenant, subscription plan name, plan limits (max users, max trips)
- [x] All metrics are scoped to the current tenant (cannot see other tenants' data)
- [x] Dashboard uses the DFMS portal design system (consistent with CP-01)
- [x] Page renders within 500ms

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| CP-05-1 | Implement `dashboard_page` view in `apps/core/portal_views.py` — check `request.user.is_authenticated`; redirect to `/login/` if not | DFS-016-1 | Done |
| CP-05-2 | Query `User.objects.filter(status='active').count()` within the view — scoped to current tenant schema automatically by middleware | DFS-016-2 | Done |
| CP-05-3 | Fetch subscription plan details for the current tenant (plan name, `max_users`, `max_monthly_trips`) and pass to template context | DFS-016-3 | Done |
| CP-05-4 | Create `templates/portal/dashboard.html` — metric card grid: Active Users, Subscription Plan, Users Remaining, Max Trips | DFS-016-4 | Done |
| CP-05-5 | Register `path('dashboard/', dashboard_page, name='portal-dashboard')` in `apps/core/web_urls.py` | DFS-016-5 | Done |
| CP-05-6 | Verify: unauthenticated GET `/dashboard/` → 302 to `/login/`; authenticated GET → 200 with correct metric values | DFS-016-6 | Done |

## Technical Details

- `TenantMainMiddleware` guarantees all DB queries in this view target the correct tenant schema
- Subscription plan details are fetched from `public.tenant_subscriptions` via a cross-schema query (or passed via JWT claims)
- This page is rendered server-side (Django template), not a SPA

## Definition of Done

- After OTP login, Tenant Admin sees the dashboard with correct user count and subscription details
- Navigating to `/dashboard/` without a session redirects to `/login/`
- User count updates immediately after inviting a new user
