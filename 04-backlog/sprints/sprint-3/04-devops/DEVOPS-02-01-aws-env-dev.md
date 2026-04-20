---
task_id: DEVOPS-02-01
title: AWS Environment Setup — DEV
epic: DevOps & Infrastructure
type: Task
priority: High
status: Pending
story_points: 5
environment: aws-dev
assignee: ~
---

# DEVOPS-02-01 — AWS Environment Setup — DEV

## Summary

Provision a lightweight AWS **development** environment where the development team can deploy and test branches before they reach staging. Lower cost than staging — single EC2 instance, smaller RDS, no HA.

## Description

The AWS DEV environment is a shared cloud environment for the development team. It runs the latest `develop` branch, is deployed automatically by CI on every push to `develop`, and uses cheap instance sizes. It is **not** customer-facing and can be restarted or rebuilt at any time.

## Acceptance Criteria

- [ ] EC2 instance (`t3.small`) running with Docker and Docker Compose installed
- [ ] RDS PostgreSQL 15 instance (`db.t3.micro`) provisioned in the same VPC
- [ ] ElastiCache Redis (`cache.t3.micro`, single node) provisioned
- [ ] GitHub Actions CI deploys to this environment on every push to `develop`
- [ ] Application is reachable at `dev.dfms.app` (or internal URL)
- [ ] HTTPS via ACM certificate (even for dev — enforces same config as prod)
- [ ] `.env.dev` stored in AWS SSM Parameter Store — no secrets in CI environment variables
- [ ] CloudWatch log group `/dfms/dev` receiving Django and Celery logs
- [ ] Basic health check endpoint `/api/health/` returns 200

## Sub-tasks

| # | Sub-task | Status |
|---|----------|--------|
| DEVOPS-02-01-1 | Create AWS VPC with public and private subnets, Internet Gateway, and NAT Gateway for the `dev` environment | Pending |
| DEVOPS-02-01-2 | Launch EC2 `t3.small` instance (Amazon Linux 2023) — install Docker, Docker Compose, Git, `aws-cli` | Pending |
| DEVOPS-02-01-3 | Create Security Groups: `sg-web` (80, 443 inbound), `sg-db` (5432 from `sg-web` only), `sg-redis` (6379 from `sg-web` only) | Pending |
| DEVOPS-02-01-4 | Provision RDS PostgreSQL 15 `db.t3.micro` — single-AZ, in private subnet, `sg-db` security group | Pending |
| DEVOPS-02-01-5 | Provision ElastiCache Redis 7 `cache.t3.micro` — single node, in private subnet, `sg-redis` security group | Pending |
| DEVOPS-02-01-6 | Store all secrets in AWS SSM Parameter Store under `/dfms/dev/` (SECRET_KEY, DB_PASSWORD, JWT_SECRET_KEY, etc.) | Pending |
| DEVOPS-02-01-7 | Create IAM role for EC2 with `ssm:GetParametersByPath` permission — attach to instance | Pending |
| DEVOPS-02-01-8 | Create `scripts/deploy.sh` — pulls latest image, reads SSM params into env, runs `docker compose up -d --build` | Pending |
| DEVOPS-02-01-9 | Add GitHub Actions deploy job to `ci.yml` — triggers on push to `develop`, SSH to EC2, runs `deploy.sh` | Pending |
| DEVOPS-02-01-10 | Request ACM certificate for `dev.dfms.app`, configure HTTPS in Nginx | Pending |
| DEVOPS-02-01-11 | Create CloudWatch log group `/dfms/dev`, configure Docker logging driver to push to CloudWatch | Pending |
| DEVOPS-02-01-12 | Run `migrate_schemas --shared` and seed platform super admin on first deploy | Pending |

## AWS Architecture (DEV)

```
Internet
    │
    ▼
Route 53 (dev.dfms.app)
    │
    ▼
EC2 t3.small (public subnet)
    ├── Nginx (HTTPS :443 → Django :8000)
    ├── Django + Gunicorn
    ├── Celery Worker
    └── Celery Beat
         │
    ┌────┴─────────────────┐
    │                      │
RDS t3.micro          ElastiCache
(private subnet)      t3.micro Redis
```

## Environment Variables (SSM Path: `/dfms/dev/`)

| SSM Key | Description |
|---------|-------------|
| `/dfms/dev/SECRET_KEY` | Django secret key |
| `/dfms/dev/DB_PASSWORD` | RDS password |
| `/dfms/dev/JWT_SECRET_KEY` | JWT signing key |
| `/dfms/dev/EMAIL_HOST_PASSWORD` | SMTP password |
| `/dfms/dev/SENTRY_DSN` | Sentry DSN (optional for dev) |

## Definition of Done

- Push to `develop` → GitHub Actions deploys → `https://dev.dfms.app/api/health/` returns 200 within 5 minutes
- All secrets retrieved from SSM — no plaintext credentials in CI logs
