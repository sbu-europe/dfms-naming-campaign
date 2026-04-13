---
task_id: DEVOPS-02-02
title: AWS Environment Setup — TEST
epic: DevOps & Infrastructure
type: Task
priority: High
status: Pending
story_points: 3
environment: aws-test
assignee: ~
---

# DEVOPS-02-02 — AWS Environment Setup — TEST

## Summary

Provision an AWS **test** environment dedicated to running the automated integration test suite against real AWS-managed infrastructure (RDS + ElastiCache) — not mocked in-memory services — to catch environment-specific failures before staging.

## Description

The AWS TEST environment is **ephemeral** — it spins up when CI runs integration tests against a PR or the `main` branch, and tears down afterwards to minimise cost. It uses the same instance types and configuration as STG but is not a persistent server. It validates that migrations, multi-tenant schema provisioning, and Celery tasks work correctly against real PostgreSQL and Redis.

## Acceptance Criteria

- [ ] GitHub Actions integration test job can provision a clean TEST environment on demand
- [ ] RDS and ElastiCache are reachable from the CI runner (or EC2 test instance)
- [ ] Full Django test suite (`pytest tests/`) passes against real RDS + ElastiCache
- [ ] `migrate_schemas --shared` runs cleanly on a fresh RDS instance
- [ ] Tenant provisioning flow (create schema, run migrations) works end-to-end
- [ ] Environment is torn down after tests complete (no persistent cost)

## Sub-tasks

| # | Sub-task | Status |
|---|----------|--------|
| DEVOPS-02-02-1 | Create Terraform / CloudFormation template for ephemeral TEST environment — RDS `db.t3.micro` + ElastiCache `cache.t3.micro` | Pending |
| DEVOPS-02-02-2 | Add `integration-test` job in `.github/workflows/ci.yml` — provisions TEST env, runs `pytest tests/integration/`, tears down | Pending |
| DEVOPS-02-02-3 | Configure `config/settings/testing.py` with a `TEST_DATABASE_URL` env var option that points to RDS when set (overrides in-memory) | Pending |
| DEVOPS-02-02-4 | Store RDS and Redis connection strings in GitHub Actions Secrets (separate from DEV/STG/PROD SSM paths) | Pending |
| DEVOPS-02-02-5 | Create `tests/integration/` directory — integration tests that require real DB (multi-tenant provisioning, Celery task execution, OTP flow end-to-end) | Pending |
| DEVOPS-02-02-6 | Add teardown step to CI job — runs `terraform destroy` or `aws rds delete-db-instance` after tests | Pending |
| DEVOPS-02-02-7 | Add cost alert — AWS Budget alert if TEST environment exceeds $20/month (indicates it wasn't torn down) | Pending |

## CI Integration Test Flow

```
Push to main / PR opened
    │
    ▼
GitHub Actions: integration-test job
    ├── Provision RDS (db.t3.micro) + ElastiCache
    ├── Wait for services healthy
    ├── Run: pytest tests/integration/ --ds=config.settings.testing
    ├── Report results
    └── Teardown: destroy RDS + ElastiCache
```

## Cost Estimate

| Resource | Instance | Est. Cost (ephemeral, ~2h/day) |
|----------|----------|-------------------------------|
| RDS PostgreSQL | `db.t3.micro` | ~$0.50/day |
| ElastiCache Redis | `cache.t3.micro` | ~$0.30/day |
| **Total** | | **~$25/month** (if run daily) |

## Definition of Done

- PR to `main` triggers integration tests against real RDS + ElastiCache
- Tests pass; environment torn down; no lingering AWS resources
- Failed tests report clearly in GitHub Actions summary
