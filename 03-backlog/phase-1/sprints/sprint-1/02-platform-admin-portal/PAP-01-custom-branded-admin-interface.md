---
jira_key: DFS-006
jira_type: Story
jira_epic: DFS-011
jira_sprint: "Sprint 1"
task_id: PAP-01
title: Custom-Branded Admin Interface (DFMS Design System)
epic: Platform Admin Portal
status: Done
story_points: 5
assignee: ~
---

# PAP-01 — Custom-Branded Admin Interface

## User Story

**As a** Super Admin  
**I want** the platform admin portal to use the DFMS design system (dark/light theme, custom branding)  
**So that** the portal looks professional and consistent rather than using Django's default admin styling

## Description

The default Django admin interface is not suitable for a client-facing product. DFMS requires a custom-branded admin surface with its own colour palette, typography, login page, navigation, and dark/light theme toggle. The goal is to replace all default Django admin CSS/HTML without losing any Django admin functionality.

## Acceptance Criteria

- [x] Login page uses DFMS branding (logo, colours, fonts)
- [x] Admin list views, detail views, and forms follow the DFMS design system
- [x] Dark/light theme toggle is available and persists per user
- [x] Navigation sidebar shows DFMS modules with correct icons
- [x] Breadcrumbs and page titles reflect DFMS naming conventions
- [x] No default Django admin styling is visible to end users

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| PAP-01-1 | Create `templates/admin/base_site.html` — extend Django's default admin base, inject DFMS logo, primary nav, and `{% block extrastyle %}` with link to custom CSS | DFS-006-1 | Done |
| PAP-01-2 | Create `static/admin/css/dfms_admin.css` — comprehensive CSS override (3,300+ lines) covering login, list views, change forms, buttons, modals, and responsive breakpoints | DFS-006-2 | Done |
| PAP-01-3 | Override `templates/admin/login.html` — replace default Django login form with DFMS-branded version | DFS-006-3 | Done |
| PAP-01-4 | Add dark/light theme toggle button in `base_site.html` — JS reads/writes `localStorage('dfms-theme')` and toggles `.dark` class on `<html>` | DFS-006-4 | Done |
| PAP-01-5 | Configure `STATICFILES_DIRS` in `config/settings/base.py` to include `static/` | DFS-006-5 | Done |
| PAP-01-6 | Configure `TEMPLATES[0]['DIRS']` to include `templates/` so custom admin templates are discovered before Django's built-in ones | DFS-006-6 | Done |
| PAP-01-7 | QA both themes on all admin views: list, detail, change form, actions dropdown, filters sidebar | DFS-006-7 | Done |

## Technical Details

- Template override path: `templates/admin/` (Django resolves custom templates before built-in ones)
- CSS applied globally via `{% block extrastyle %}` in `base_site.html`
- Theme toggle stored in `localStorage` key `dfms-theme`; JS adds/removes `.dark` class on `<html>`

## Definition of Done

- Navigate to `admin.dfms.com` — login page shows DFMS branding, not default Django admin
- Both dark and light themes render without visual regressions on all admin pages
