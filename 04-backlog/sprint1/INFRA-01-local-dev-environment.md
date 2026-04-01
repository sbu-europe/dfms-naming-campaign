---
task_id: INFRA-01
title: Local Development Environment Setup
epic: System Foundation Infrastructure
sprint: Sprint 1 — Infrastructure, Onboarding & Secure Login
type: Task
priority: Critical
status: Done
story_points: 3
assignee: ~
---

# INFRA-01 — Local Development Environment Setup

## Summary

Set up a fully containerised local development environment so any developer can run the entire DFMS stack with a single command.

## Description

All services needed to run the DFMS backend — web server, database, cache, background workers, and reverse proxy — should be defined as Docker containers and orchestrated via Docker Compose. Health checks should prevent dependent services from starting before their dependencies are ready.

## Acceptance Criteria

- [ ] Running `docker compose up -d` starts all services without manual steps
- [ ] Web server, PostgreSQL, Redis, Celery worker, Celery beat, and Nginx are all available
- [ ] Database and Redis pass health checks before the web service starts
- [ ] Developer can tail logs with `docker compose logs -f web`
- [ ] Live code reload works — changes to Python files restart the server automatically
- [ ] Setup documented in `docs/setup.md` with step-by-step instructions

## Sub-tasks

| # | Sub-task | Status |
|---|----------|--------|
| INFRA-01-1 | Define `docker-compose.yml` — declare all 6 services (`web`, `db`, `redis`, `celery_worker`, `celery_beat`, `nginx`) with correct images and port mappings | Done |
| INFRA-01-2 | Add `healthcheck` blocks for `db` (`pg_isready`) and `redis` (`redis-cli ping`) | Done |
| INFRA-01-3 | Configure `depends_on` with `condition: service_healthy` so `web`, `celery_worker`, and `celery_beat` wait for `db` and `redis` | Done |
| INFRA-01-4 | Mount project root as a volume (`./:/app`) and set `command: python manage.py runserver 0.0.0.0:8000` for live reload | Done |
| INFRA-01-5 | Create `Dockerfile` — base Python image, install `requirements.txt`, set `WORKDIR /app` | Done |
| INFRA-01-6 | Create `.env.example` with all required variables and safe defaults for local dev | Done |
| INFRA-01-7 | Write `docs/setup.md` — step-by-step: clone → copy `.env` → `docker compose up -d` → `migrate` → create superuser | Done |

## Definition of Done

- All containers start cleanly from a fresh checkout
- `docker compose ps` shows all services healthy
- `curl http://localhost:8000/api/docs/` returns 200
