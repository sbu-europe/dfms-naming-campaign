---
jira_key: DFS-009
jira_type: Story
jira_epic: DFS-011
jira_sprint: "Sprint 1"
task_id: PAP-04
title: Platform Admin Dashboard — Key Metrics
epic: Platform Admin Portal
status: Done
story_points: 3
assignee: ~
---

# PAP-04 — Platform Admin Dashboard — Key Metrics

## User Story

**As a** Super Admin  
**I want** a dashboard that shows key platform-level metrics at a glance  
**So that** I can quickly understand overall platform health without drilling into individual records

## Description

The default Django admin index is a plain list of registered models. DFMS needs a custom dashboard that surfaces meaningful metrics: how many tenants are active, subscription distribution, and platform-level health indicators.

## Acceptance Criteria

- [x] Dashboard shows total number of active tenants
- [x] Dashboard shows breakdown of tenants by subscription plan (Basic / Starter / Growth / Enterprise)
- [x] Dashboard shows total number of registered users across all tenants
- [x] Metrics are live (queried on page load, no stale cache)
- [x] Dashboard inherits the DFMS design system (cards, icons, colour coding)
- [x] No default Django "Recent Actions" widget is shown

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| PAP-04-1 | Create `templates/admin/index.html` — override Django admin index, remove default "Recent Actions" widget, add DFMS metric card grid | DFS-009-1 | Done |
| PAP-04-2 | Create `config/admin.py` — patch `admin.site.index` to inject dashboard context (total tenants, active tenants, tenants by plan, total platform users) | DFS-009-2 | Done |
| PAP-04-3 | Query `Tenant.objects.count()`, `Tenant.objects.filter(status='active').count()`, and subscription plan breakdown from `public` schema | DFS-009-3 | Done |
| PAP-04-4 | Style metric cards in DFMS CSS — icon, headline number, label, colour-coded status indicator | DFS-009-4 | Done |
| PAP-04-5 | Import `config/admin.py` in `config/urls.py` or via `AppConfig.ready()` to ensure the patch is applied on server start | DFS-009-5 | Done |

## Technical Details

- Dashboard context is built in `config/admin.py` by patching `admin.site.index`
- All queries are against `public` schema models (`Tenant`, `Domain`)
- Page inherits `base_site.html` for consistent navigation and branding

## Definition of Done

- After login, the dashboard displays correct tenant and user counts
- Numbers update immediately when a new tenant is provisioned
