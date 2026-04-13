---
task_id: DEVOPS-01-04
title: Local Environment — PROD Pre-flight Validation Script
epic: DevOps & Infrastructure
type: Task
priority: Medium
status: Pending
story_points: 1
environment: local-prod-preflight
assignee: ~
---

# DEVOPS-01-04 — Local Environment — PROD Pre-flight Validation

## Summary

Create a `scripts/preflight_check.sh` script that runs a series of local checks before any production deployment to confirm the image builds, no migrations are pending, and no critical Django security warnings exist.

## What's Already Built

The CI pipeline already validates most of this automatically (lint → unit tests → Docker build → integration tests). The pre-flight script adds the **final local gate** that a developer or release manager runs before tagging a production release, catching issues like incomplete `.env` vars, unapplied migrations, or `manage.py check --deploy` warnings that only surface with production settings.

The CI `deploy-production` job in `ci.yml` currently has a `TODO` stub — the pre-flight script is the human-side complement to that.

## Acceptance Criteria

- [ ] `scripts/preflight_check.sh` exists and is executable
- [ ] Script validates all required `.env` variables are set (no empty required keys)
- [ ] Script builds `Dockerfile` `runtime` target — fails if image errors
- [ ] Script runs `python manage.py check --deploy` — reports any critical security warnings
- [ ] Script runs `python manage.py migrate --check` — confirms no unapplied migrations
- [ ] Script runs unit tests and fails fast if any test breaks
- [ ] Colour-coded output (green pass / red fail) and `exit 1` on any failure

## Sub-tasks

| # | Sub-task | Status |
|---|----------|--------|
| DEVOPS-01-04-1 | Create `scripts/preflight_check.sh` — env var check: read `.env`, verify all keys from `.env.example` have non-empty values | Pending |
| DEVOPS-01-04-2 | Add `docker build --target runtime -t dfms-preflight .` step — fail script if build errors | Pending |
| DEVOPS-01-04-3 | Add `docker run --rm dfms-preflight python manage.py check --deploy` step | Pending |
| DEVOPS-01-04-4 | Add `docker run --rm dfms-preflight python manage.py migrate --check` step | Pending |
| DEVOPS-01-04-5 | Add `pytest tests/unit/ -q` fast-test step | Pending |
| DEVOPS-01-04-6 | Colour-coded summary: `✅ PASSED` / `❌ FAILED` per check; exit 1 on any failure | Pending |
| DEVOPS-01-04-7 | Document pre-flight step in `docs/git-workflow.md` under "Release Checklist" | Pending |

## Pre-flight Check Flow

```
bash scripts/preflight_check.sh

  ✅ 1. All required .env variables are set
  ✅ 2. Docker build (runtime target) — image built cleanly
  ✅ 3. manage.py check --deploy — no critical warnings
  ✅ 4. manage.py migrate --check — no pending migrations
  ✅ 5. pytest tests/unit/ — all tests pass
  ─────────────────────────────────────────────
  5/5 checks passed — safe to deploy to production
```

## Relationship to CI

| Check | CI (automated) | Pre-flight (manual) |
|-------|---------------|---------------------|
| Lint (Black/isort/flake8) | ✅ `ci.yml` lint job | — |
| Unit tests | ✅ `ci.yml` unit-tests job | ✅ pre-flight step 5 |
| Docker build | ✅ `ci.yml` build job | ✅ pre-flight step 2 |
| Integration tests | ✅ `ci.yml` integration-tests job | — |
| `manage.py check --deploy` | ❌ not in CI | ✅ pre-flight step 3 |
| Pending migrations | ❌ not in CI | ✅ pre-flight step 4 |
| Env var completeness | ❌ not in CI | ✅ pre-flight step 1 |

## Definition of Done

- `bash scripts/preflight_check.sh` exits 0 on clean repo with complete `.env`
- Script exits 1 with clear error message if any check fails
- Documented in release checklist in `docs/git-workflow.md`
