---
task_id: PAP-03
title: Platform Admin Dashboard — Key Metrics
epic: Platform Admin Portal
sprint: Sprint 1 — Infrastructure, Onboarding & Secure Login
type: Story
priority: High
status: Done
story_points: 3
assignee: ~
---

# PAP-03 — Platform Admin Dashboard — Key Metrics

## User Story

**As a** Super Admin  
**I want** a dashboard that shows key platform-level metrics at a glance  
**So that** I can quickly understand overall platform health without drilling into individual records

## Description

The default Django admin index is a plain list of registered models. DFMS needs a custom dashboard that surfaces meaningful metrics: how many tenants are active, subscription distribution, and platform-level health indicators.

## Acceptance Criteria

- [ ] Dashboard shows total number of active tenants
- [ ] Dashboard shows breakdown of tenants by subscription plan (Basic / Starter / Growth / Enterprise)
- [ ] Dashboard shows total number of registered users across all tenants
- [ ] Metrics are live (queried on page load, no stale cache)
- [ ] Dashboard inherits the DFMS design system (cards, icons, colour coding)
- [ ] No default Django "Recent Actions" widget is shown

## Sub-tasks

| # | Sub-task | Status |
|---|----------|--------|
| PAP-03-1 | Create `templates/admin/index.html` — override Django admin index, remove default "Recent Actions" widget, add DFMS metric card grid | Done |
| PAP-03-2 | Create `config/admin.py` — patch `admin.site.index` to inject dashboard context (total tenants, active tenants, tenants by plan, total platform users) | Done |
| PAP-03-3 | Query `Tenant.objects.count()`, `Tenant.objects.filter(status='active').count()`, and subscription plan breakdown from `public` schema | Done |
| PAP-03-4 | Style metric cards in DFMS CSS — consistent with PAP-01 design system: icon, headline number, label, colour-coded status indicator | Done |
| PAP-03-5 | Import `config/admin.py` in `config/urls.py` or via `AppConfig.ready()` to ensure the patch is applied on server start | Done |

## Technical Details

- Dashboard context is built in `config/admin.py` by patching `admin.site.index`
- All queries are against `public` schema models (`Tenant`, `Domain`)
- Page inherits `base_site.html` for consistent navigation and branding

## Definition of Done

- After login, the dashboard displays correct tenant and user counts
- Numbers update immediately when a new tenant is provisioned
