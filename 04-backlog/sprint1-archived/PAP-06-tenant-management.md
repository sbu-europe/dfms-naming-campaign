---
task_id: PAP-06
title: Tenant Management — View, Update, and Suspend Client Accounts
epic: Platform Admin Portal
sprint: Sprint 1 — Infrastructure, Onboarding & Secure Login
type: Story
priority: High
status: Done
story_points: 3
assignee: ~
related_stories:
  - US-098-tenant-onboarding.md
---

# PAP-06 — Tenant Management — View, Update, and Suspend Client Accounts

## User Story

**As a** Super Admin  
**I want** to view, edit, and suspend client tenant accounts from the platform admin  
**So that** I can manage the platform's client base and take action when needed (e.g., plan upgrade, non-payment suspension)

## Description

After onboarding, tenants need ongoing management. The Super Admin must be able to find a tenant, update their subscription plan, and suspend access if required. Suspension must cascade to blocking all logins for users of that tenant.

## Acceptance Criteria

- [ ] Super Admin can list all tenants with: organisation name, subscription plan, status, creation date
- [ ] Super Admin can search/filter tenants by name, plan, and status
- [ ] Super Admin can open a single tenant and edit: subscription plan, address, contact info
- [ ] Super Admin can suspend a tenant — all logins for that tenant's users are blocked immediately
- [ ] Suspended tenant status is clearly visible in the list view
- [ ] Admin action is logged to `public.audit_logs`

## Sub-tasks

| # | Sub-task | Status |
|---|----------|--------|
| PAP-06-1 | Register `TenantAdmin` ModelAdmin in `apps/tenants/admin.py` with `@admin.register(Tenant)` | Done |
| PAP-06-2 | Apply `PlatformOnlyAdminMixin` — override `has_module_perms` and `has_view_permission` to check `connection.schema_name == 'public'`; raise `PermissionDenied` otherwise | Done |
| PAP-06-3 | Set `list_display = ['organization_name', 'subscription_plan', 'status', 'created_at']` | Done |
| PAP-06-4 | Set `list_filter = ['subscription_plan', 'status']` and `search_fields = ['organization_name', 'admin_email']` | Done |
| PAP-06-5 | Implement `suspend_tenant` admin action — sets `tenant.status = 'suspended'` on selected tenants; saves; shows success message count | Done |
| PAP-06-6 | Enforce suspension in the tenant login view: if `tenant.status == 'suspended'` at login time, return `403 Account Suspended` response | Done |
| PAP-06-7 | Write audit log entry on every status change (suspend/reactivate) to `public.audit_logs` | Done |

## Technical Details

- `PlatformOnlyAdminMixin` checks `connection.schema_name == 'public'` and raises `PermissionDenied` otherwise — ensures tenant admins cannot access this ModelAdmin even if they somehow reach the admin URL
- Suspension is enforced in `TenantMainMiddleware` (or login view): if `tenant.status == 'suspended'`, the login endpoint returns 403

## Definition of Done

- Tenant list shows all tenants with correct status and plan
- Suspending a tenant immediately blocks login for that tenant's users
- All management actions appear in audit logs
