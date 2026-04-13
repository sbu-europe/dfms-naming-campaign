---
task_id: PAP-04
title: Tenant Onboarding — Register a New Client Organisation
epic: Platform Admin Portal
sprint: Sprint 1 — Infrastructure, Onboarding & Secure Login
type: Story
priority: Critical
status: ~80% Complete
story_points: 13
assignee: ~
related_stories:
  - US-098-tenant-onboarding.md
---

# PAP-04 — Tenant Onboarding — Register a New Client Organisation

## User Story

**As a** Super Admin  
**I want** to register a new client organisation through a guided form  
**So that** the organisation gets an isolated database schema, a login domain, and their first admin account ready to use

## Description

Tenant onboarding is the most critical provisioning flow on the platform. When a Super Admin submits the form, the system must atomically create the tenant record, provision a fresh PostgreSQL schema, run all migrations, create the Tenant Admin user, and send a welcome email — all without requiring manual database intervention.

## Acceptance Criteria

### Must Have (Done)
- [x] Super Admin can create a new tenant via the platform admin form
- [x] Form collects: Organisation Name, Business Category, Industry Type, Subscription Plan, Admin Name, Admin Email, Admin Phone, Address
- [x] Organisation Name is validated as unique (3–100 chars)
- [x] Admin Email is validated as unique platform-wide
- [x] System auto-provisions a PostgreSQL schema using `django-tenants`
- [x] All Django migrations are applied to the new schema on creation
- [x] Tenant Admin user created in the new schema with `status=active`, `password_must_change=true`
- [x] Auto-generated 12-char temporary password (uppercase + lowercase + digit + special char)
- [x] Welcome email sent to Tenant Admin with login URL, temporary password, and instructions
- [x] Temporary password expires after 72 hours
- [x] Forced password change on first login (cannot skip)
- [x] Login page reads `?email=` query param and pre-populates the email field

### Should Have (Pending)
- [ ] Resend welcome email with a fresh temporary password (resets 72-hour window)
- [ ] Tenant reactivation after suspension

### Nice to Have (Pending)
- [ ] Provisioning progress indicator (schema creation takes 2–5 seconds)
- [ ] Subdomain auto-generated from organisation name (editable before save)

## Sub-tasks

| # | Sub-task | Status |
|---|----------|--------|
| PAP-04-1 | Create `Tenant` model in `apps/tenants/models.py` — extends `TenantMixin`; fields: `organization_name`, `business_category`, `industry_type`, `status`, `schema_name` | Done |
| PAP-04-2 | Create `Domain` model — extends `DomainMixin`; links subdomain to tenant record | Done |
| PAP-04-3 | Create `TenantSubscription` model — fields: `plan`, `max_users`, `max_monthly_trips`, `storage_limit_gb`, `enabled_modules` | Done |
| PAP-04-4 | Create `TenantOnboardingForm` in `apps/tenants/forms.py` — all required fields, uniqueness validators for org name and admin email | Done |
| PAP-04-5 | Create `TenantAdmin` (ModelAdmin) in `apps/tenants/admin.py` — apply `PlatformOnlyAdminMixin`, wire up `TenantOnboardingForm` as the add form | Done |
| PAP-04-6 | Implement `TenantProvisioningService.provision()` in `apps/tenants/services.py` — orchestrate all 6 provisioning steps atomically (validate → create tenant → create schema → migrate → create admin user → send email) | Done |
| PAP-04-7 | Generate a 12-char temporary password in the service (mixed case + digit + special char); set `password_must_change=True` on the Tenant Admin user | Done |
| PAP-04-8 | Use `schema_context(schema_name)` when creating the Tenant Admin user to write into the correct tenant schema | Done |
| PAP-04-9 | Create welcome email template `templates/email/tenant_welcome.html` — include login URL with `?email=` param, temp password, first-login instructions | Done |
| PAP-04-10 | Implement `send_tenant_welcome_email` Celery task in `apps/notifications/tasks.py`; dispatch via `.delay()` at end of provisioning | Done |
| PAP-04-11 | Enforce forced password change on first login: after password validation, redirect to "Set New Password" view if `password_must_change=True` | Done |
| PAP-04-12 | Add "Resend Welcome Email" admin action to `TenantAdmin` — generates fresh temp password, resets expiry, resends email | **Pending** |
| PAP-04-13 | Add "Reactivate Tenant" admin action to `TenantAdmin` — sets `tenant.status = active`, unblocks logins | **Pending** |

## Technical Details

### Provisioning Steps (Atomic)

```
1. Validate all form inputs
2. Create record in public.tenants (status = Active)
3. python manage.py create_tenant --schema=<schema_name>
4. python manage.py migrate_schemas --schema=<schema_name>
5. Create Tenant Admin in <schema_name>.users (status=active, password_must_change=True)
6. Dispatch welcome email via Celery (send_tenant_welcome_email.delay)
```

### Auto-generated Fields

| Field | Rule |
|-------|------|
| `tenant_id` | UUID |
| `schema_name` | `tenant_<org_name_slug>` |
| `subdomain` | `<org_name_slug>` |
| `temp_password` | 12 chars: upper + lower + digit + special |

## Definition of Done

- Super Admin completes form → tenant appears in list → Tenant Admin receives welcome email → Tenant Admin logs in with temp password → forced to set new password → lands on tenant dashboard
