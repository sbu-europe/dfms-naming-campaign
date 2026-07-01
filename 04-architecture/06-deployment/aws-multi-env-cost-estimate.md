# AWS Multi-Environment Cost Estimate — DFMS (Nourish)

> DEV + TEST + STG + PROD environment budget for the new AWS account.  
> **Region**: ap-south-1 (Mumbai)  
> **Currency**: USD  
> **Pricing model**: On-demand (no reserved instances at launch)  
> **Last updated**: 2026-07-01

---

## Summary

| Environment | Purpose | Monthly Cost (On-Demand) |
|-------------|---------|--------------------------|
| DEV | Internal developer testing | ~$5.37 |
| TEST | QA team internal testing | ~$45.25 |
| STG | Client UAT (production mirror) | ~$103.60 |
| PROD | Live — Nourish tenant | ~$139.12 |
| **Total** | **All 4 environments** | **~$293/month** |

**Optimised total** (after 1-year savings plans on PROD + STG, overnight auto-stops on TEST/STG): **~$200–215/month**

---

## 1. DEV Environment — Internal Developer Testing

> PostgreSQL and Redis run as Docker containers on EC2 (no managed RDS/ElastiCache).  
> Matches the documented dev environment spec in `aws-dev-environment.md`.  
> EC2 auto-stops Mon–Sat 20:00 BDT, fully off Sunday.

| Service | Specification | Notes | Est. / mo |
|---------|--------------|-------|-----------|
| EC2 t3.micro | 2 vCPU, 1 GB RAM | Scheduled on/off Mon–Sat 08:00–20:00 BDT | $3.20 |
| EBS 20 GB GP3 | Root volume | PostgreSQL + Redis Docker volumes persist on EBS | $1.60 |
| S3 ~1 GB | Private media bucket | Arrival Notice attachments, dev uploads | $0.02 |
| ECR public repo | 50 GB free always | Docker image storage — always free | $0.00 |
| SES sandbox | ≤500 emails/mo | OTP, invite, password reset | $0.05 |
| CloudWatch Logs | 2 log groups | /dfms/dev/web + /dfms/dev/celery — always free | $0.00 |
| SSM Parameter Store | ~8 SecureString params | Secrets management — always free tier | $0.00 |
| Route 53 | 1 hosted zone | Wildcard A record `*.dev.dfms.com` | $0.50 |
| ACM Wildcard TLS | `*.dev.dfms.com` | Auto-renews — always free | $0.00 |
| EventBridge Scheduler | 2 events/day | Auto-start/stop EC2 — always free | $0.00 |
| **Total** | | | **$5.37/mo** |

**Stack**: EC2 t3.micro · Docker: Nginx + Gunicorn + Celery + PostgreSQL + Redis

---

## 2. TEST Environment — QA Team Internal Testing

> Uses managed RDS + ElastiCache (unlike DEV) so test data persists stably between test runs.  
> TEST infra is lighter than STG but heavier than DEV.

| Service | Specification | Notes | Est. / mo |
|---------|--------------|-------|-----------|
| EC2 t3.small | 2 vCPU, 2 GB RAM | Always-on for QA team flexibility | $15.00 |
| RDS PostgreSQL db.t3.micro | 1 vCPU, 1 GB, 20 GB GP3 | Managed DB for stable isolated test data | $15.33 |
| ElastiCache Redis cache.t3.micro | 0.5 GB | Sessions, cache, Celery broker | $11.52 |
| EBS 20 GB GP3 | EC2 root volume | OS + Docker images | $1.60 |
| S3 ~2 GB | Private media bucket | Test uploads, POD photos, QA documents | $0.20 |
| SES production mode | ≤1,000 emails/mo | Real email delivery for QA team workflows | $0.10 |
| CloudWatch Logs + Alarms | 2 log groups, 4 alarms | Web + Celery logs, CPU/disk/error alerts | $1.00 |
| Route 53 | 1 hosted zone | Wildcard A record `*.test.dfms.com` | $0.50 |
| ACM Wildcard TLS | `*.test.dfms.com` | Auto-renews — always free | $0.00 |
| SSM Parameter Store | ~8 SecureString params | Secrets management | $0.00 |
| **Total** | | | **$45.25/mo** |

**Cost tip**: Auto-stop TEST EC2 overnight via EventBridge → saves ~$9/mo → effective ~$36/mo.

**Stack**: EC2 t3.small · RDS db.t3.micro (20 GB) · ElastiCache cache.t3.micro

---

## 3. STG Environment — Client UAT (Production Mirror)

> STG is a true production mirror. Identical EC2 + RDS tier as PROD launch config.  
> Client accesses this environment to validate features before go-live.

| Service | Specification | Notes | Est. / mo |
|---------|--------------|-------|-----------|
| EC2 t3.large | 2 vCPU, 8 GB RAM | Production-mirror sizing for client UAT | $60.74 |
| RDS PostgreSQL db.t3.small | 2 vCPU, 2 GB, 30 GB GP3 | Managed DB — production-equivalent, 7-day backup | $27.74 |
| ElastiCache Redis cache.t3.micro | 0.5 GB | Sessions, cache, Celery broker + results | $11.52 |
| EBS 20 GB GP3 | EC2 root volume | OS + Docker images | $1.60 |
| S3 ~5 GB | Private media bucket | UAT documents, POD photos, compliance docs | $0.50 |
| SES production mode | ≤2,000 emails/mo | Client UAT email flows | $0.20 |
| CloudWatch Logs + Alarms | 4 log groups, 6 alarms | Full monitoring mirroring PROD | $1.50 |
| Route 53 | 1 hosted zone | Wildcard A record `*.stg.dfms.com` | $1.00 |
| ACM Wildcard TLS | `*.stg.dfms.com` | Auto-renews — always free | $0.00 |
| SSM Parameter Store | ~10 SecureString params | Secrets management | $0.00 |
| ECR private repo | ~3 GB images | Private ECR for STG/PROD images | $0.30 |
| **Total** | | | **$103.60/mo** |

**Cost tip**: Auto-stop STG EC2 overnight (business hours only) → saves ~$36/mo → effective ~$68/mo.

**Stack**: EC2 t3.large · RDS db.t3.small (30 GB) · ElastiCache cache.t3.micro

---

## 4. PROD Environment — Nourish Tenant (Live)

> **Nourish tenant scale**: ~50 operational users + 200 vehicles + ~200 drivers = ~250 concurrent users.  
> **GPS tracking**: 200 vehicles × ~10-second intervals × 90 days ≈ 15–20 GB in PostgreSQL. RDS storage set to 50 GB.  
> WAF enabled for production security.

| Service | Specification | Notes | Est. / mo |
|---------|--------------|-------|-----------|
| EC2 t3.large | 2 vCPU, 8 GB RAM | Handles 50 ops users + 200 vehicles + 200 drivers | $60.74 |
| RDS PostgreSQL db.t3.small | 2 vCPU, 2 GB, 50 GB GP3 | 50 GB for 3-month vehicle GPS tracking data | $36.74 |
| ElastiCache Redis cache.t3.small | 1.5 GB | Higher memory for ~250 concurrent user sessions | $23.04 |
| EBS 20 GB GP3 | EC2 root volume | OS + Docker images | $1.60 |
| S3 ~30 GB + transfers | Media + DB backups | POD photos, GPS exports, 3-month tracking records | $5.00 |
| SES production mode | ~5,000 emails/mo | OTP, trip alerts, driver notifications, reports | $0.50 |
| CloudWatch Logs + Alarms | 4 log groups, 8 alarms | Full production monitoring suite | $3.00 |
| Route 53 | 1 hosted zone + ~1M queries | Wildcard A record `*.dfms.com` | $1.00 |
| ACM Wildcard TLS | `*.dfms.com` | Auto-renews — always free | $0.00 |
| SSM Parameter Store | ~12 SecureString params | Secrets management | $0.00 |
| ECR private repo | ~3 GB images | Private ECR for production images | $0.30 |
| WAF Basic ruleset | Web ACL + 3 rules | OWASP top-10, rate limiting, geo-block | $6.00 |
| Data Transfer Out | ~10 GB/mo | API responses, file downloads via pre-signed URL | $1.20 |
| **Total** | | | **$139.12/mo** |

**Stack**: EC2 t3.large · RDS db.t3.small (50 GB) · ElastiCache cache.t3.small · WAF

---

## 5. PROD Growth Path — Nourish

| Phase | Active Users | EC2 | RDS | Other Changes | Est. / mo |
|-------|-------------|-----|-----|---------------|-----------|
| Launch (now) | 50 ops + 200 vehicles/drivers | t3.large | db.t3.small 50 GB | cache.t3.small, WAF | ~$139 |
| Growth (3–6 mo) | 100–200 users | t3.xlarge | db.t3.medium 100 GB | cache.t3.small, WAF | ~$200 |
| Scale (6–12 mo) | 200–500 users | 2× t3.large + ALB | db.t3.medium Multi-AZ | cache cluster, ALB | ~$320 |
| Multi-tenant (12+ mo) | 500+ / multi-tenant | ECS Fargate | db.t3.large Multi-AZ | CloudFront CDN | $600–$1,200 |

---

## 6. Cost Optimisation

### Immediate wins (before launch)

| Action | Saving | Effort |
|--------|--------|--------|
| DEV auto-stop Mon–Sat (already in estimate) | ~65% vs always-on EC2 | Already done |
| TEST auto-stop overnight via EventBridge | ~$9/mo on EC2 t3.small | Low |
| STG auto-stop overnight via EventBridge | ~$36/mo on EC2 t3.large | Low |
| CloudWatch log retention = 30 days on all envs | Avoids log storage creep | Low |
| ECR lifecycle policy — keep last 10 image tags | Reduces ECR storage | Low |
| S3 Intelligent-Tiering for media files | ~40% on infrequently accessed files | Low |

### After 30–60 days live

| Action | Saving | When |
|--------|--------|------|
| 1-year EC2 Compute Savings Plan (PROD) | ~30% → EC2 ~$43/mo vs $61/mo | After stable baseline |
| 1-year RDS Reserved Instance (PROD) | ~30% → RDS ~$26/mo vs $37/mo | After stable baseline |
| 1-year ElastiCache Reserved Node (PROD) | ~30% → Redis ~$16/mo vs $23/mo | After stable baseline |
| Right-size EC2 after 2 weeks CloudWatch data | 20–40% if over-provisioned | After 2 weeks live |
| 1-year RI on STG (after stable) | ~30% → STG EC2 ~$43/mo vs $61/mo | After stable baseline |

### Optimised monthly total (after savings plans + auto-stops)

| Environment | On-Demand | Optimised | Notes |
|-------------|-----------|-----------|-------|
| DEV | $5.37 | $5.37 | Auto-stop already applied |
| TEST | $45.25 | ~$36 | Auto-stop overnight |
| STG | $103.60 | ~$56 | 30% RI + auto-stop overnight |
| PROD | $139.12 | ~$102 | 30% savings plans on EC2/RDS/Redis |
| **Total** | **~$293/mo** | **~$200/mo** | ~32% reduction |

---

## 7. Key Assumptions

- All costs use AWS on-demand pricing for **ap-south-1 (Mumbai)** as of July 2026.
- DEV uses Docker-based PostgreSQL + Redis on EC2 — no managed services — exactly per the documented `aws-dev-environment.md` spec.
- TEST uses managed RDS + ElastiCache (differs from DEV) so test data persists stably between QA runs.
- STG is a **true production mirror** per requirements: same EC2 + RDS tier as PROD launch day.
- **PROD vehicle GPS tracking**: 200 vehicles × ~10-second intervals × 90 days ≈ 15–20 GB in PostgreSQL. RDS storage set to 50 GB.
- WAF is PROD-only. Includes OWASP top-10 managed rule set + rate limiting (~$6/mo base + LCU charges on traffic).
- Data transfer: ~10 GB outbound/month estimated for PROD API responses and S3 pre-signed URL downloads.
- SES **production mode** required for TEST/STG/PROD. Sandbox mode is DEV-only.
- RDS automated 7-day backup retention is included in RDS pricing at no extra cost.
- All environments use **single-AZ** in Phase 1. Multi-AZ adds ~2× RDS cost — deferred to Phase 1C (200+ users).
- Excludes GitHub Actions CI (free tier: 2,000 min/mo) and local developer machines.

---

## Related Documents

- [AWS Deployment Strategy](./aws-deployment-strategy.md)
- [AWS Dev Environment](../../08-development-guides/01-backend/07-deployment/aws-dev-environment.md)
- [AWS Billing Safeguards](./aws-billing-safeguards.md)
- [Post-Production Scalability Plan](./aws-scalability-plan.md)
