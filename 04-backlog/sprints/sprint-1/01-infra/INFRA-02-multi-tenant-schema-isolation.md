---
jira_key: DFS-002
jira_type: Story
jira_epic: DFS-010
jira_sprint: "Sprint 1"
task_id: INFRA-02
title: Isolated Database per Client (Schema-per-Tenant)
epic: System Foundation Infrastructure
status: Done
story_points: 3
assignee: ~
---

# INFRA-02 — Isolated Database per Client (Schema-per-Tenant)

## User Story

**As a** platform operator  
**I want** each tenant to have a fully isolated PostgreSQL schema  
**So that** one client's data can never be mixed with another's

## Description

Using a schema-per-tenant design with `django-tenants`, each tenant's data (users, trips, vehicles, etc.) lives in its own PostgreSQL schema (e.g., `tenant_nourish_poultry`). Platform-wide tables (tenants, domains, subscriptions) remain in the `public` schema. All HTTP requests are automatically routed to the correct tenant schema based on the incoming domain/subdomain.

## Acceptance Criteria

- [x] `django-tenants` is installed and configured as the database backend
- [x] `SHARED_APPS` and `TENANT_APPS` correctly partition models
- [x] A request to `<tenant>.dfms.app` operates on that tenant's schema only
- [x] A request to `admin.dfms.com` operates on the `public` schema
- [x] Running `migrate_schemas` applies all tenant migrations to every schema
- [x] No SQL query from one tenant can access another tenant's data

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| INFRA-02-1 | Install `django-tenants`, configure `DATABASE_ROUTERS` and `DATABASES['default']['ENGINE']` to use `django_tenants.postgresql_backend` | DFS-002-1 | Done |
| INFRA-02-2 | Create `apps/tenants/` app — define `Tenant` model (extends `TenantMixin`) and `Domain` model (extends `DomainMixin`) | DFS-002-2 | Done |
| INFRA-02-3 | Partition installed apps into `SHARED_APPS` (platform-only: tenants, admin, auth) and `TENANT_APPS` (per-tenant: users, trips, vehicles, etc.) | DFS-002-3 | Done |
| INFRA-02-4 | Add `TenantMainMiddleware` as the first entry in `MIDDLEWARE` to resolve schema from incoming hostname | DFS-002-4 | Done |
| INFRA-02-5 | Run `python manage.py migrate_schemas --shared` to create `public` schema tables on first setup | DFS-002-5 | Done |
| INFRA-02-6 | Register `public` domain pointing to `admin.dfms.com` and a test tenant with its subdomain domain record | DFS-002-6 | Done |
| INFRA-02-7 | Verify cross-schema isolation: log in as two tenants and confirm `connection.schema_name` differs per request | DFS-002-7 | Done |

## Technical Details

| Schema | Contents |
|--------|----------|
| `public` | `tenants`, `domains`, `subscriptions`, `audit_logs`, `platform users` |
| `tenant_<slug>` | `users`, `roles`, `trips`, `vehicles`, `drivers`, all TENANT_APPS models |

## Definition of Done

- Multiple tenants provisioned with fully isolated data
- `connection.schema_name` correctly reflects the active tenant on each request
