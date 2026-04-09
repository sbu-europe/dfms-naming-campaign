---
task_id: CP-05
title: Tenant Dashboard — Basic Live Operational Metrics
epic: Client Portal
sprint: Sprint 1 — Infrastructure, Onboarding & Secure Login
type: Story
priority: High
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

- [ ] Dashboard is accessible only to authenticated users; unauthenticated requests redirect to `/login/`
- [ ] Dashboard displays: total active users in the tenant, subscription plan name, plan limits (max users, max trips)
- [ ] All metrics are scoped to the current tenant (cannot see other tenants' data)
- [ ] Dashboard uses the DFMS portal design system (consistent with CP-01)
- [ ] Page renders within 500ms

## Sub-tasks

| # | Sub-task | Status |
|---|----------|--------|
| CP-05-1 | Implement `dashboard_page` view in `apps/core/portal_views.py` — check `request.user.is_authenticated`; redirect to `/login/` if not | Done |
| CP-05-2 | Query `User.objects.filter(status='active').count()` within the view — scoped to current tenant schema automatically by middleware | Done |
| CP-05-3 | Fetch subscription plan details for the current tenant (plan name, `max_users`, `max_monthly_trips`) and pass to template context | Done |
| CP-05-4 | Create `templates/portal/dashboard.html` — metric card grid: Active Users, Subscription Plan, Users Remaining, Max Trips — inheriting portal base layout | Done |
| CP-05-5 | Register `path('dashboard/', dashboard_page, name='portal-dashboard')` in `apps/core/web_urls.py` | Done |
| CP-05-6 | Verify: unauthenticated GET `/dashboard/` → 302 to `/login/`; authenticated GET → 200 with correct metric values | Done |

## Technical Details

- `TenantMainMiddleware` guarantees all DB queries in this view target the correct tenant schema
- Subscription plan details are fetched from `public.tenant_subscriptions` via a cross-schema query (or passed via JWT claims)
- This page is rendered server-side (Django template), not a SPA — no API call from the browser

## Definition of Done

- After OTP login, Tenant Admin sees the dashboard with correct user count and subscription details
- Navigating to `/dashboard/` without a session redirects to `/login/`
- User count updates immediately after inviting a new user
