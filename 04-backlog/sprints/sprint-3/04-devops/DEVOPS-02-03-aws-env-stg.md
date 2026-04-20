---
task_id: DEVOPS-02-03
title: AWS Environment Setup — STG (Staging)
epic: DevOps & Infrastructure
type: Task
priority: High
status: Pending
story_points: 8
environment: aws-staging
assignee: ~
---

# DEVOPS-02-03 — AWS Environment Setup — STG (Staging)

## Summary

Provision a persistent AWS **staging** environment that mirrors production infrastructure (same instance types, same configuration, same deployment process) so client demos, UAT, and pre-production validation all happen in a production-equivalent environment.

## Description

Staging is the last environment before production. It is always up, always running the latest `main` branch (deployed automatically by CI), and is the environment used for:
- Client demos and UAT (User Acceptance Testing)
- Pre-production smoke testing before each production release
- Load testing without risking production data

Staging uses the same Terraform config as production with different sizing parameters — this ensures no infrastructure surprise when promoting to production.

## Acceptance Criteria

- [ ] EC2 `t3.medium` running with auto-restart and CloudWatch monitoring
- [ ] RDS PostgreSQL 15 `db.t3.small` — single-AZ (no Multi-AZ for cost, matches scale of early client use)
- [ ] ElastiCache Redis `cache.t3.small` single node
- [ ] Application reachable at `stg.dfms.app` over HTTPS
- [ ] SSL/TLS via ACM certificate with auto-renewal
- [ ] GitHub Actions deploys to staging on every push to `main`
- [ ] Zero-downtime deployment (new container started before old stopped)
- [ ] Automated DB backup daily (RDS automated backups, 7-day retention)
- [ ] CloudWatch alarms: CPU > 80%, memory > 85%, 5xx error rate > 1%
- [ ] Slack notification on deploy success/failure
- [ ] Staging data seeded with representative test tenants (Nourish Poultry demo account)

## Sub-tasks

| # | Sub-task | Status |
|---|----------|--------|
| DEVOPS-02-03-1 | Create Terraform module `infra/staging/` — VPC, subnets, security groups, EC2, RDS, ElastiCache, IAM roles | Pending |
| DEVOPS-02-03-2 | Launch EC2 `t3.medium` (Amazon Linux 2023) — Docker, Compose, CloudWatch agent, SSM agent installed via userdata script | Pending |
| DEVOPS-02-03-3 | Provision RDS `db.t3.small` PostgreSQL 15 — private subnet, daily automated backups, 7-day retention | Pending |
| DEVOPS-02-03-4 | Provision ElastiCache Redis 7 `cache.t3.small` — private subnet, persistence enabled (`appendonly yes`) | Pending |
| DEVOPS-02-03-5 | Set up Application Load Balancer (ALB) in front of EC2 — enables zero-downtime deploys and health check routing | Pending |
| DEVOPS-02-03-6 | Request ACM certificate for `stg.dfms.app` and `*.stg.dfms.app` (wildcard for tenant subdomains) | Pending |
| DEVOPS-02-03-7 | Store all secrets in SSM Parameter Store under `/dfms/stg/` | Pending |
| DEVOPS-02-03-8 | Create GitHub Actions `deploy-staging` job — triggers on push to `main`, deploys via SSH + `deploy.sh` | Pending |
| DEVOPS-02-03-9 | Implement zero-downtime deploy in `deploy.sh`: pull new image → start new container → health check passes → stop old container | Pending |
| DEVOPS-02-03-10 | Configure CloudWatch log groups `/dfms/stg/django`, `/dfms/stg/celery`, `/dfms/stg/nginx` | Pending |
| DEVOPS-02-03-11 | Set up CloudWatch alarms (CPU, memory, 5xx rate) with SNS → Slack webhook notifications | Pending |
| DEVOPS-02-03-12 | Create `scripts/seed_staging.py` — provisions demo tenant (Nourish Poultry) with sample data | Pending |
| DEVOPS-02-03-13 | Enable RDS Performance Insights (free tier) for query profiling | Pending |

## AWS Architecture (STG)

```
Internet
    │
    ▼
Route 53 (stg.dfms.app, *.stg.dfms.app)
    │
    ▼
ACM (TLS)
    │
    ▼
Application Load Balancer
    │
    ▼
EC2 t3.medium (private subnet)
    ├── Nginx
    ├── Django + Gunicorn (4 workers)
    ├── Celery Worker
    └── Celery Beat
         │
    ┌────┴──────────────────────┐
    │                           │
RDS db.t3.small            ElastiCache
PostgreSQL 15               cache.t3.small
(Multi-AZ: No)              Redis 7
```

## Secrets (SSM Path: `/dfms/stg/`)

Same structure as DEV — all production-grade secrets, separate from DEV values.

## Definition of Done

- Push to `main` → GitHub Actions deploys → `https://stg.dfms.app/api/health/` returns 200
- Client demo tenant accessible at `https://nourish.stg.dfms.app/login/`
- CloudWatch dashboard shows real-time metrics
- Deploy takes < 3 minutes with zero downtime
