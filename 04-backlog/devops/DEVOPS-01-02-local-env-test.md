---
task_id: DEVOPS-01-02
title: Local Environment Setup — TEST
epic: DevOps & Infrastructure
type: Task
priority: High
status: Done
story_points: 2
environment: local-test
assignee: ~
---

# DEVOPS-01-02 — Local Environment Setup — TEST

## Summary

Configure the local test environment so the full test suite (unit + integration) runs on every developer's machine and in CI, using isolated in-memory services and synchronous Celery.

## What's Already Built

The test configuration is **fully implemented**. Tests run in CI via GitHub Actions (`.github/workflows/ci.yml`) across 4 jobs: lint → unit-tests → build → integration-tests.

| File | Purpose |
|------|---------|
| `config/settings/testing.py` | In-memory cache, sync Celery, `locmem` email, `MD5PasswordHasher`, null logging |
| `pytest.ini` | `DJANGO_SETTINGS_MODULE=config.settings.testing`, test paths, coverage config |
| `.github/workflows/ci.yml` | 4-job pipeline: lint → unit tests → Docker build → integration tests |
| `requirements/development.txt` | Includes `pytest`, `pytest-django`, `factory_boy`, `pytest-cov` |

## Acceptance Criteria

- [x] `pytest tests/unit/` runs with no external services (in-memory cache, sync Celery, locmem email)
- [x] `pytest tests/integration/` runs against real Postgres + Redis (GitHub Actions service containers)
- [x] CI runs on every push to `main` / `develop` and every PR
- [x] Lint job (Black, isort, flake8) runs first and blocks on failure
- [x] Docker image build verified in CI on every push
- [x] Coverage report uploaded to Codecov
- [x] `CELERY_TASK_ALWAYS_EAGER=True` in testing settings — no worker needed for unit tests
- [x] `MD5PasswordHasher` in testing settings — 10× faster user creation
- [ ] `tests/conftest.py` — shared fixtures for tenant, users, api client *(partial — expand coverage)*
- [ ] `tests/integration/` test coverage for tenant provisioning, OTP flow, invitation flow *(pending)*

## Sub-tasks

| # | Sub-task | Status |
|---|----------|--------|
| DEVOPS-01-02-1 | `config/settings/testing.py` — `LocMemCache`, `locmem` email backend, `CELERY_TASK_ALWAYS_EAGER=True`, `MD5PasswordHasher`, null logging | Done |
| DEVOPS-01-02-2 | `pytest.ini` — `DJANGO_SETTINGS_MODULE`, `python_files/classes/functions`, `addopts` flags, coverage config | Done |
| DEVOPS-01-02-3 | `.github/workflows/ci.yml` — 4-job pipeline (lint, unit-tests, build, integration-tests) with Postgres + Redis service containers | Done |
| DEVOPS-01-02-4 | CI `unit-tests` job — installs `requirements/development.txt`, runs `pytest tests/unit/ --cov`, uploads to Codecov | Done |
| DEVOPS-01-02-5 | CI `build` job — builds `Dockerfile` `runtime` target using `docker/build-push-action` with GHA layer cache | Done |
| DEVOPS-01-02-6 | CI `integration-tests` job — Postgres 15 + Redis 7 service containers, runs `pytest tests/integration/` | Done |
| DEVOPS-01-02-7 | Expand `tests/conftest.py` — add shared fixtures: `tenant_factory`, `tenant_admin_user`, `api_client_authenticated` | Pending |
| DEVOPS-01-02-8 | Write integration tests for tenant provisioning, OTP login flow, and invitation activation | Pending |

## CI Pipeline

```
Push / PR
    │
    ├── lint          (Black + isort + flake8) — blocks pipeline if fails
    │
    ├── unit-tests    (pytest tests/unit/ + coverage → Codecov)
    │
    ├── build         (docker build --target runtime — verifies prod image)
    │
    └── integration-tests  (pytest tests/integration/ vs real Postgres + Redis)
            │
            └── [main push only] → deploy-staging (TODO stub)
                                       └── [manual approval] → deploy-production (TODO stub)
```

## Definition of Done

- `pytest tests/unit/` passes locally with no services running (no Docker needed)
- `pytest tests/integration/` passes inside `docker compose run --rm web pytest tests/integration/`
- CI passes green on a clean push to `main`
