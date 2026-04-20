---
task_id: DEVOPS-01-01
title: Local Environment Setup — DEV
epic: DevOps & Infrastructure
type: Task
priority: Critical
status: Done
story_points: 3
environment: local-dev
assignee: ~
---

# DEVOPS-01-01 — Local Environment Setup — DEV

## Summary

Set up a fully containerised local development environment so any developer can clone the repo and run the entire DFMS stack with a single command, with live code reload and debug tooling enabled.

## What's Already Built

The local DEV environment is **fully implemented** in the backend repo. The following files make it work:

| File | Purpose |
|------|---------|
| `docker-compose.yml` | All 6 services (web, db, redis, celery_worker, celery_beat, nginx) |
| `Dockerfile` (stage: `dev`) | Python 3.12-slim, dev deps, source volume-mounted for live reload |
| `nginx.conf` | Reverse proxy, static/media serving, security headers |
| `config/settings/development.py` | `DEBUG=True`, CORS open, Debug Toolbar, relaxed security |
| `scripts/entrypoint.sh` | DB readiness wait → `migrate_schemas --shared` → `collectstatic` → start server |
| `.env.example` | All variables documented with inline comments |

## Acceptance Criteria

- [x] `docker compose up -d` starts all 6 services without manual steps
- [x] `web`, `db`, `redis`, `celery_worker`, `celery_beat`, `nginx` all running
- [x] DB and Redis pass health checks before `web` service starts (`condition: service_healthy`)
- [x] Live code reload — source mounted at `.:/app`, `runserver` restarts on file save
- [x] `CELERY_RESULT_BACKEND` pinned to `redis://redis:6379/2` in Compose (prevents stale `.env` override)
- [x] `scripts/entrypoint.sh` waits for DB, runs `migrate_schemas --shared`, then starts server
- [x] Nginx serves static files directly from volume (`/app/staticfiles`) — no Django overhead
- [x] `.env.example` complete with all required variables and comments
- [ ] Setup documented in `docs/setup.md` with step-by-step instructions *(in progress)*
- [ ] Default super admin seeded: `superadmin@dfms.com` *(pending `scripts/seed_data.py` completion)*

## Sub-tasks

| # | Sub-task | Status |
|---|----------|--------|
| DEVOPS-01-01-1 | `docker-compose.yml` — 6 services with health checks and `depends_on: condition: service_healthy` | Done |
| DEVOPS-01-01-2 | `Dockerfile` `dev` stage — Python 3.12-slim, installs `requirements/development.txt`, source volume-mounted | Done |
| DEVOPS-01-01-3 | `Dockerfile` `runtime` stage — lean production image, non-root `dfms` user, `entrypoint.sh` | Done |
| DEVOPS-01-01-4 | `scripts/entrypoint.sh` — DB wait loop (30 retries), `migrate_schemas --shared`, `collectstatic`, `exec "$@"` | Done |
| DEVOPS-01-01-5 | `nginx.conf` — upstream `web:8000`, static/media aliases, security headers (`X-Frame-Options`, `nosniff`), GPS tracking timeout override | Done |
| DEVOPS-01-01-6 | `config/settings/development.py` — `DEBUG=True`, `CORS_ALLOW_ALL_ORIGINS=True`, Debug Toolbar, `CELERY_TASK_ALWAYS_EAGER=False` | Done |
| DEVOPS-01-01-7 | `.env.example` — all variables with inline comments (DB, Redis, JWT, Email, SMS, AWS, Sentry, feature flags, business rules) | Done |
| DEVOPS-01-01-8 | Add `/etc/hosts` entries for local tenant domain simulation (`admin.dfms.com` → `127.0.0.1`) | Done |
| DEVOPS-01-01-9 | Write complete `docs/setup.md` — clone → copy `.env` → `docker compose up` → migrate → seed | Pending |
| DEVOPS-01-01-10 | Complete `scripts/seed_data.py` — seed super admin, platform tenant, sample test tenant, RBAC permissions | Pending |

## Services Running Locally

| Service | Image | Port | Key Config |
|---------|-------|------|-----------|
| `nginx` | `nginx:1.25-alpine` | 80 | Reverse proxy; serves `/static/` and `/media/` from volumes |
| `web` | `Dockerfile:dev` | 8000 | `runserver`; source volume-mounted; `DJANGO_SETTINGS_MODULE=development` |
| `db` | `postgres:15-alpine` | 5432 | Health check: `pg_isready` |
| `redis` | `redis:7-alpine` | 6379 | `appendonly yes`; health check: `redis-cli ping` |
| `celery_worker` | `Dockerfile:dev` | — | `--concurrency=4`; same env as web |
| `celery_beat` | `Dockerfile:dev` | — | `DatabaseScheduler`; depends on `celery_worker` |

## Redis DB Index Map

| DB Index | Purpose |
|----------|---------|
| `0` | Celery broker |
| `1` | Django cache + sessions |
| `2` | Celery result backend (Redis, not `django-db` — avoids multi-tenant schema issue) |

## Definition of Done

- `docker compose up -d` → all 6 services healthy within 60 seconds
- `curl http://localhost/api/health/` returns 200
- `curl http://localhost/admin/` redirects to login page
