---
task_id: INFRA-05
title: Production-Ready Configuration & Onboarding Docs
epic: System Foundation Infrastructure
sprint: Sprint 1 — Infrastructure, Onboarding & Secure Login
type: Task
priority: High
status: Done
story_points: 2
assignee: ~
---

# INFRA-05 — Production-Ready Configuration & Onboarding Docs

## Summary

Implement multi-environment settings, environment variable management, GitHub Actions CI, and developer onboarding documentation so the project is maintainable from day one.

## Description

A production backend project requires split settings (base/dev/prod), secrets managed via `.env` (never hard-coded), a working CI pipeline that runs tests on every push, and documentation a new developer can follow to be productive within 30 minutes.

## Acceptance Criteria

- [ ] Settings split into `config/settings/base.py`, `dev.py`, `prod.py`
- [ ] All secrets and environment-specific values loaded via `python-decouple`
- [ ] `.env.example` is complete and documents every variable
- [ ] GitHub Actions CI runs on every pull request and push to `main`
- [ ] CI runs unit tests and integration tests with a real PostgreSQL + Redis service
- [ ] `docs/setup.md` covers full local setup from scratch
- [ ] `docs/development.md` covers day-to-day development workflow
- [ ] `docs/git-workflow.md` documents branching strategy, PRs, and commit conventions

## Sub-tasks

| # | Sub-task | Status |
|---|----------|--------|
| INFRA-05-1 | Create `config/settings/` package — split into `base.py` (shared), `dev.py` (local overrides), `prod.py` (production hardening) | Done |
| INFRA-05-2 | Install `python-decouple`; replace all hard-coded secrets and env-specific values with `config(...)` calls throughout `base.py` | Done |
| INFRA-05-3 | Create `.env.example` — document every variable with inline comments explaining purpose, format, and safe defaults | Done |
| INFRA-05-4 | Create `.github/workflows/ci.yml` — two jobs: `unit-tests` and `integration-tests`; both run on PR and `main` push | Done |
| INFRA-05-5 | Add PostgreSQL and Redis service containers to the CI workflow so integration tests run against real services (not mocks) | Done |
| INFRA-05-6 | Add `CELERY_RESULT_BACKEND: redis://localhost:6379/2` to CI workflow environment variables | Done |
| INFRA-05-7 | Write `docs/setup.md` — full local dev setup guide from clone to first successful API call | Done |
| INFRA-05-8 | Write `docs/development.md` — day-to-day workflow: running tests, applying migrations, using the admin, troubleshooting | Done |
| INFRA-05-9 | Write `docs/git-workflow.md` — branching strategy (`main` / `develop` / feature branches), PR checklist, commit message conventions | Done |

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
