---
title: System Foundation Infrastructure
story_id: INFRA
phase: phase-1
module: System Foundation
priority: Critical
status: Done
epic: System Foundation Infrastructure
epic_id: EPIC-001
epic_name: System Foundation
sprint: Sprint 1 — Infrastructure, Onboarding & Secure Login
story_points: 12
created: 2026-03-31
updated: 2026-03-31
tags: [infrastructure, docker, celery, redis, postgresql, multi-tenant, setup]
---

# Infrastructure: System Foundation

## Summary

The development and production environments are fully provisioned and running. All services — web, database, caching, job processing, and reverse proxy — are containerised and ready for local development and deployment.

---

## Stories Delivered

### 1. Development Environment (Docker Compose)

**As a** developer  
**I want** a single-command local setup  
**So that** the entire stack (Django, Postgres, Redis, Celery, Nginx) runs identically on every machine

**Implementation**: [docker-compose.yml](../../../docker-compose.yml) — 6-container stack: `web`, `db` (PostgreSQL 15), `redis` (Redis 7), `celery_worker`, `celery_beat`, `nginx`. Health checks on `db` and `redis` before web starts.

**Status**: Done

---

### 2. PostgreSQL 15 with schema-per-tenant

**As a** platform operator  
**I want** each tenant to have a fully isolated PostgreSQL schema  
**So that** one client's data can never be mixed with another's

**Implementation**: `django-tenants` library. `SHARED_APPS` → `public` schema. `TENANT_APPS` → per-tenant schemas. Schema created automatically on `Tenant.save()` via `auto_create_schema = True`. See [apps/tenants/](../../../apps/tenants/).

**Status**: Done

---

### 3. Background job processing (Celery + Redis — multi-tenant safe)

**As a** developer  
**I want** Celery tasks to execute in the correct tenant schema  
**So that** async operations (emails, notifications) do not fail with `ProgrammingError`

**Implementation**: `config/celery.py` with `autodiscover_tasks()`. Broker: Redis DB 0. Result backend: Redis DB 2 (not `django-db` — avoids tenant schema mismatch in workers). `schema_name` passed into tasks that need tenant-scoped DB access. Docker Compose pins `CELERY_RESULT_BACKEND` in the `environment` block so stale `.env` cannot override. See `DECISIONS.md`.

**Status**: Done

---

### 4. Caching and session store (Redis)

**As a** developer  
**I want** sessions and OTP state backed by Redis  
**So that** user sessions persist reliably and OTP values are fast to read/write

**Implementation**: `REDIS_URL` → Redis DB 1 (cache/sessions). `django-redis` cache backend.

**Status**: Done

---

### 5. Production-ready configuration

**As a** DevOps engineer  
**I want** a production Dockerfile and compose overlay  
**So that** the app can be deployed to a production environment with minimal changes

**Implementation**: Multi-stage Dockerfile (`base` → `dev` → `runtime`). [docker-compose.prod.yml](../../../docker-compose.prod.yml) with Gunicorn (4 workers). [.env.example](../../../.env.example) documents all required variables. [docs/setup.md](../../../docs/setup.md) — step-by-step from clone to running.

**Status**: Done

---

## Pending

None — all infrastructure stories are complete.
