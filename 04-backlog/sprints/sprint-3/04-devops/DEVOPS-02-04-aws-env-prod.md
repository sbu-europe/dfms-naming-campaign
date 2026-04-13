---
task_id: DEVOPS-02-04
title: AWS Environment Setup — PROD (Production)
epic: DevOps & Infrastructure
type: Task
priority: Critical
status: Pending
story_points: 13
environment: aws-production
assignee: ~
---

# DEVOPS-02-04 — AWS Environment Setup — PROD (Production)

## Summary

Provision the AWS **production** environment with high availability, automated backups, disaster recovery, and security hardening — ready for live client traffic with Nourish Poultry as the first tenant.

## Description

Production is the live customer environment. It requires Multi-AZ RDS (automatic failover), a proper load balancer, S3 for static/media storage, Sentry for error tracking, WAF for protection against common attacks, and a well-defined runbook for deployments and incident response.

Production deployments are **manual-approval gated** — CI builds and verifies the release, but a team member must approve before the deploy job runs.

## Acceptance Criteria

- [ ] EC2 `t3.large` (or Auto Scaling Group) with production-grade security hardening
- [ ] RDS PostgreSQL 15 `db.t3.medium` — **Multi-AZ enabled** (automatic failover)
- [ ] ElastiCache Redis `cache.t3.medium` with backup enabled
- [ ] S3 bucket for static files and media uploads
- [ ] CloudFront CDN in front of S3 (fast static asset delivery globally)
- [ ] Application reachable at `admin.dfms.com` and `*.dfms.app` over HTTPS
- [ ] Wildcard ACM certificate for `*.dfms.app` covering all tenant subdomains
- [ ] Production deploys require manual approval in GitHub Actions
- [ ] Daily RDS snapshots with 30-day retention; ability to restore to any point within 5 days (PITR)
- [ ] Sentry error tracking active with `production` environment tag
- [ ] AWS WAF rules: SQL injection, XSS, rate limiting (1000 req/min per IP)
- [ ] VPC Flow Logs enabled for security audit trail
- [ ] RDS encryption at rest enabled (AWS KMS)
- [ ] All S3 buckets: private ACL, versioning enabled, encryption at rest

## Sub-tasks

| # | Sub-task | Status |
|---|----------|--------|
| DEVOPS-02-04-1 | Create Terraform module `infra/production/` — extends staging config with HA and security additions | Pending |
| DEVOPS-02-04-2 | Launch EC2 `t3.large` — harden OS: disable root SSH, enable SSM Session Manager only (no public SSH), auto security updates | Pending |
| DEVOPS-02-04-3 | Provision RDS `db.t3.medium` PostgreSQL 15 — **Multi-AZ: Yes**, KMS encryption, PITR enabled, 30-day backup retention | Pending |
| DEVOPS-02-04-4 | Provision ElastiCache Redis `cache.t3.medium` — `appendonly yes`, daily snapshots | Pending |
| DEVOPS-02-04-5 | Create S3 bucket `dfms-prod-media` — private, versioning on, KMS encryption, lifecycle rule: archive > 90 days to S3-IA | Pending |
| DEVOPS-02-04-6 | Create CloudFront distribution in front of `dfms-prod-media` S3 for static asset CDN | Pending |
| DEVOPS-02-04-7 | Set up ALB with HTTPS listener, ACM wildcard cert `*.dfms.app`, HTTP → HTTPS redirect | Pending |
| DEVOPS-02-04-8 | Request and validate ACM certificates: `admin.dfms.com`, `*.dfms.app` | Pending |
| DEVOPS-02-04-9 | Store all secrets in SSM Parameter Store under `/dfms/prod/` — separate KMS key from dev/stg | Pending |
| DEVOPS-02-04-10 | Configure AWS WAF — attach to ALB: AWS Managed Rules (Core, SQL, XSS), rate-based rule (1000 req/min/IP) | Pending |
| DEVOPS-02-04-11 | Enable VPC Flow Logs → CloudWatch Logs + S3 archive | Pending |
| DEVOPS-02-04-12 | Create GitHub Actions `deploy-production` job — `environment: production` (requires manual approval), deploys after approval | Pending |
| DEVOPS-02-04-13 | Zero-downtime deploy script: ALB deregisters old instance → new container health check → re-register | Pending |
| DEVOPS-02-04-14 | Configure Sentry: `SENTRY_DSN` from SSM, `environment=production`, `traces_sample_rate=0.1` | Pending |
| DEVOPS-02-04-15 | Set up CloudWatch Dashboard — key metrics: response time p50/p95/p99, error rate, DB connections, Redis memory, Celery queue depth | Pending |
| DEVOPS-02-04-16 | Configure CloudWatch Alarms → SNS → PagerDuty/Slack: CPU > 75%, DB connections > 80%, 5xx > 0.5%, queue depth > 100 | Pending |
| DEVOPS-02-04-17 | Write `docs/runbook-prod.md` — deployment procedure, rollback procedure, incident response checklist | Pending |
| DEVOPS-02-04-18 | Conduct first production deploy dry-run with the team (deploy to prod, verify, roll back, re-deploy) | Pending |

## AWS Architecture (PROD)

```
Internet
    │
    ▼
Route 53
├── admin.dfms.com ──────────────────┐
└── *.dfms.app (per-tenant) ─────────┤
                                     ▼
                               ACM Wildcard TLS
                                     │
                                     ▼
                          Application Load Balancer
                          + AWS WAF
                                     │
                                     ▼
                          EC2 t3.large (private subnet)
                          ├── Nginx
                          ├── Gunicorn (4 workers)
                          ├── Celery Worker
                          └── Celery Beat
                                     │
                   ┌─────────────────┼─────────────────┐
                   │                 │                  │
         RDS db.t3.medium      ElastiCache        S3 + CloudFront
         PostgreSQL 15         cache.t3.medium    (static + media)
         Multi-AZ ✓            Redis 7
         KMS encrypt ✓         Snapshots ✓
         PITR ✓
```

## Security Checklist

| Control | Status |
|---------|--------|
| All secrets in SSM (no env vars in code) | Pending |
| RDS encryption at rest (KMS) | Pending |
| S3 buckets private + versioned | Pending |
| WAF: SQL injection + XSS + rate limiting | Pending |
| No public SSH — SSM Session Manager only | Pending |
| VPC Flow Logs enabled | Pending |
| HTTPS enforced end-to-end | Pending |
| Security groups: least-privilege | Pending |

## Cost Estimate (Monthly)

| Resource | Instance | Est. Cost |
|----------|----------|-----------|
| EC2 | `t3.large` | ~$60 |
| RDS Multi-AZ | `db.t3.medium` | ~$100 |
| ElastiCache | `cache.t3.medium` | ~$55 |
| ALB | — | ~$20 |
| S3 + CloudFront | ~50GB | ~$15 |
| WAF | — | ~$10 |
| CloudWatch | — | ~$10 |
| **Total** | | **~$270/month** |

## Definition of Done

- Production deploy approved and executed — `https://admin.dfms.com/` accessible
- First tenant (Nourish Poultry) provisioned — `https://nourish.dfms.app/login/` accessible
- CloudWatch dashboard live with all key metrics
- Rollback procedure tested and documented
- All security checklist items complete
