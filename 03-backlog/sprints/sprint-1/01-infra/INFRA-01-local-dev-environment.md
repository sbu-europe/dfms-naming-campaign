---
jira_key: DFS-001
jira_type: Story
jira_epic: DFS-010
jira_sprint: "Sprint 1"
task_id: INFRA-01
title: Local Development Environment Setup
epic: System Foundation Infrastructure
status: Done
story_points: 3
assignee: ~
---

# INFRA-01 — Local Development Environment Setup

## User Story

**As a** developer  
**I want** a single-command local setup  
**So that** the entire stack (Django, Postgres, Redis, Celery, Nginx) runs identically on every machine

## Description

All services needed to run the DFMS backend — web server, database, cache, background workers, and reverse proxy — should be defined as Docker containers and orchestrated via Docker Compose. Health checks should prevent dependent services from starting before their dependencies are ready.

## Acceptance Criteria

- [x] Running `docker compose up -d` starts all services without manual steps
- [x] Web server, PostgreSQL, Redis, Celery worker, Celery beat, and Nginx are all available
- [x] Database and Redis pass health checks before the web service starts
- [x] Developer can tail logs with `docker compose logs -f web`
- [x] Live code reload works — changes to Python files restart the server automatically
- [x] Setup documented in `docs/setup.md` with step-by-step instructions

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| INFRA-01-1 | Define `docker-compose.yml` — declare all 6 services (`web`, `db`, `redis`, `celery_worker`, `celery_beat`, `nginx`) with correct images and port mappings | DFS-001-1 | Done |
| INFRA-01-2 | Add `healthcheck` blocks for `db` (`pg_isready`) and `redis` (`redis-cli ping`) | DFS-001-2 | Done |
| INFRA-01-3 | Configure `depends_on` with `condition: service_healthy` so `web`, `celery_worker`, and `celery_beat` wait for `db` and `redis` | DFS-001-3 | Done |
| INFRA-01-4 | Mount project root as a volume (`./:/app`) and set `command: python manage.py runserver 0.0.0.0:8000` for live reload | DFS-001-4 | Done |
| INFRA-01-5 | Create `Dockerfile` — base Python image, install `requirements.txt`, set `WORKDIR /app` | DFS-001-5 | Done |
| INFRA-01-6 | Create `.env.example` with all required variables and safe defaults for local dev | DFS-001-6 | Done |
| INFRA-01-7 | Write `docs/setup.md` — step-by-step: clone → copy `.env` → `docker compose up -d` → `migrate` → create superuser | DFS-001-7 | Done |

## Definition of Done

- All containers start cleanly from a fresh checkout
- `docker compose ps` shows all services healthy
- `curl http://localhost:8000/api/docs/` returns 200
