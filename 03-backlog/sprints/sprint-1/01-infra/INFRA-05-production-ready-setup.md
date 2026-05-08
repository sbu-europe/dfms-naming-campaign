---
jira_key: DFS-005
jira_type: Story
jira_epic: DFS-010
jira_sprint: "Sprint 1"
task_id: INFRA-05
title: Production-Ready Configuration & Onboarding Docs
epic: System Foundation Infrastructure
status: Done
story_points: 2
assignee: ~
---

# INFRA-05 — Production-Ready Configuration & Onboarding Docs

## User Story

**As a** DevOps engineer  
**I want** a production Dockerfile and compose overlay  
**So that** the app can be deployed to a production environment with minimal changes

## Description

A production backend project requires split settings (base/dev/prod), secrets managed via `.env` (never hard-coded), a working CI pipeline that runs tests on every push, and documentation a new developer can follow to be productive within 30 minutes.

## Acceptance Criteria

- [x] Settings split into `config/settings/base.py`, `dev.py`, `prod.py`
- [x] All secrets and environment-specific values loaded via `python-decouple`
- [x] `.env.example` is complete and documents every variable
- [x] GitHub Actions CI runs on every pull request and push to `main`
- [x] CI runs unit tests and integration tests with a real PostgreSQL + Redis service
- [x] `docs/setup.md` covers full local setup from scratch
- [x] `docs/development.md` covers day-to-day development workflow
- [x] `docs/git-workflow.md` documents branching strategy, PRs, and commit conventions

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| INFRA-05-1 | Create `config/settings/` package — split into `base.py` (shared), `dev.py` (local overrides), `prod.py` (production hardening) | DFS-005-1 | Done |
| INFRA-05-2 | Install `python-decouple`; replace all hard-coded secrets with `config(...)` calls | DFS-005-2 | Done |
| INFRA-05-3 | Create `.env.example` — document every variable with inline comments | DFS-005-3 | Done |
| INFRA-05-4 | Create `.github/workflows/ci.yml` — two jobs: `unit-tests` and `integration-tests` | DFS-005-4 | Done |
| INFRA-05-5 | Add PostgreSQL and Redis service containers to the CI workflow | DFS-005-5 | Done |
| INFRA-05-6 | Add `CELERY_RESULT_BACKEND: redis://localhost:6379/2` to CI workflow environment variables | DFS-005-6 | Done |
| INFRA-05-7 | Write `docs/setup.md` — full local dev setup guide from clone to first successful API call | DFS-005-7 | Done |
| INFRA-05-8 | Write `docs/development.md` — day-to-day workflow: running tests, applying migrations, using the admin, troubleshooting | DFS-005-8 | Done |
| INFRA-05-9 | Write `docs/git-workflow.md` — branching strategy, PR checklist, commit message conventions | DFS-005-9 | Done |

## Environment Variables Covered

| Variable | Dev default | Notes |
|----------|-------------|-------|
| `SECRET_KEY` | dev-only key | Must be rotated in prod |
| `DEBUG` | `True` | `False` in prod |
| `DATABASE_URL` | `postgres://...` | Points to Docker `db` |
| `REDIS_URL` | `redis://redis:6379/0` | Celery broker |
| `CELERY_RESULT_BACKEND` | `redis://redis:6379/2` | Pinned in `docker-compose.yml` |
| `EMAIL_HOST` / `EMAIL_PORT` | Mailtrap | Prod: SMTP relay |
| `ALLOWED_HOSTS` | `localhost,*` | Restrict in prod |

## Definition of Done

- New developer can follow `docs/setup.md` and have the stack running in under 30 minutes
- CI passes green on a clean push with no manual intervention
