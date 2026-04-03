---
task_id: CP-01
title: Custom-Branded Client Portal Interface
epic: Client Portal
sprint: Sprint 1 — Infrastructure, Onboarding & Secure Login
type: Story
priority: High
status: Done
story_points: 3
assignee: ~
---

# CP-01 — Custom-Branded Client Portal Interface

## User Story

**As a** Tenant Admin or Tenant User  
**I want** the client portal to reflect the DFMS visual identity  
**So that** the product feels polished and consistent when I log in to manage my organisation's data

## Description

The client portal is the primary interface for tenant users (Tenant Admin, Warehouse Manager, Driver Coordinator, etc.). Unlike the platform admin portal (Django admin), the client portal is a Django template-rendered web application served under the tenant's subdomain. The interface must use the DFMS design system including layout, typography, and navigation.

## Acceptance Criteria

- [ ] Login page at `<tenant>.dfms.app/login/` uses DFMS branding
- [ ] Authenticated pages use the DFMS navigation shell (sidebar/topbar)
- [ ] Design is consistent with the platform admin portal's design system
- [ ] Requests to the platform domain (`admin.dfms.com/login/`) are redirected to `/admin/login/`
- [ ] All pages are responsive

## Sub-tasks

| # | Sub-task | Status |
|---|----------|--------|
| CP-01-1 | Create `templates/auth/login.html` — DFMS-branded tenant login form: logo, email/password fields, submit button, inline error display | Done |
| CP-01-2 | Create `templates/portal/dashboard.html` — authenticated shell with DFMS sidebar navigation, topbar, and content area for metric cards | Done |
| CP-01-3 | Create `apps/core/portal_views.py` — `login_page` view: check `connection.schema_name`; redirect to `/admin/login/` if public schema, render login template otherwise | Done |
| CP-01-4 | Create `dashboard_page` view in `apps/core/portal_views.py` — redirect to `/login/` if unauthenticated; render dashboard template with context | Done |
| CP-01-5 | Register URL patterns in `apps/core/web_urls.py`: `path('login/', login_page)` and `path('dashboard/', dashboard_page)` | Done |
| CP-01-6 | Include `apps/core/web_urls.py` in root `config/urls.py` under the tenant URL conf | Done |
| CP-01-7 | Verify responsiveness: test login and dashboard at mobile (375px), tablet (768px), and desktop (1280px) widths | Done |

## Technical Details

- `connection.schema_name` is checked to detect platform vs tenant context (set by `TenantMainMiddleware`)
- `PLATFORM_SCHEMA = 'public'` constant used for clarity
- Static assets (CSS, JS) are shared between platform and client portals via `STATICFILES_DIRS`

## Definition of Done

- `curl https://<tenant>.dfms.app/login/` returns tenant-branded login page (200)
- `curl https://admin.dfms.com/login/` redirects to `/admin/login/` (302)
