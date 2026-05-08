# AWS Deployment Strategy

> Environment architecture, release process, rollback procedures, and zero-downtime deployments for DFMS Phase 1.

**Last Updated**: 2026-04-20  
**Applies To**: Phase 1 — Single-tenant (Nourish) → multi-tenant ready  
**Region**: ap-south-1 (Mumbai) — lowest latency (~266 ms) and lowest cost for Bangladesh

---

## 1. Environment Overview

Local domains mirror cloud — just swap `.com` → `.local`:

| Environment | Domain | Purpose | Runs On |
|-------------|--------|---------|---------|
| **Local DEV** | `dev.dfms.local` | Individual dev, feature work | `make dev` (Docker Compose) |
| **Local QA sim** | `qa.dfms.local` | Test prod image locally | `make qa` (Docker Compose) |
| **Local STG sim** | `stg.dfms.local` | Validate release candidate locally | `make stg` (Docker Compose) |
| **Cloud DEV** | `dev.dfms.com` | Shared team integration server (≤20 testers) | AWS EC2 t3.micro (scheduled on/off) |
| **Cloud QA** | `qa.dfms.com` | QA team testing, client UAT | AWS EC2 t3.small (always-on) |
| **Cloud STG** | `stg.dfms.com` | Pre-release validation, load tests | AWS EC2 t3.medium (always-on) |
| **Cloud PROD** | `dfms.com` | Live users | AWS EC2 t3.large |

> **CI (GitHub Actions)** is not an environment — it runs automated tests on every push with no persistent infrastructure. It has no domain and no EC2.

---

## 2. Infrastructure Architecture

### Phase 1 — Cost-Optimised (Current)

```
Internet
    │
    ▼
┌─────────────────────────────────────────────────┐
│  Route 53                                        │
│  *.nourish.dfms.com  →  EC2 Elastic IP           │
│  nourish.dfms.com    →  EC2 Elastic IP           │
└───────────────────────┬─────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────┐
│  EC2 (t3.medium → t3.large)                      │
│  Nginx (ports 80/443)                            │
│  ├── Django / Gunicorn (Docker)                  │
│  ├── Celery Worker (Docker)                      │
│  └── Celery Beat  (Docker)                       │
└──────────┬────────────────────────┬─────────────┘
           │                        │
┌──────────▼──────────┐  ┌──────────▼──────────────┐
│  RDS PostgreSQL      │  │  ElastiCache Redis       │
│  db.t3.micro (dev)   │  │  cache.t3.micro          │
│  db.t3.small (prod)  │  │  (sessions, cache, OTP,  │
│  Multi-AZ: NO        │  │   Celery broker+results) │
│  Backups: 7 days     │  └─────────────────────────┘
└──────────────────────┘
           │
┌──────────▼──────────┐
│  S3 Bucket           │
│  /static/ (public)   │
│  /media/  (private)  │
│  /backups/(private)  │
└──────────────────────┘
```

### Phase 2 — High Availability (Future, triggered by growth)

```
Internet → Route 53 → CloudFront (CDN)
                             │
                    Application Load Balancer
                    ┌────────┴────────┐
                 EC2 (AZ-a)      EC2 (AZ-b)
                 Django           Django
                 Celery           Celery
                    └────────┬────────┘
               RDS Multi-AZ  │  ElastiCache Cluster
               (primary +    │  (2-node replication)
                standby)     │
                             S3 + CloudFront (media CDN)
```

---

## 3. Environment Specifications

### Local environments (DEV / QA sim / STG sim)

| Component | Spec | Notes |
|-----------|------|-------|
| Compute | Local Docker Compose | `make dev` / `make qa` / `make stg` |
| DB | PostgreSQL in Docker | Local only — separate DB per env |
| Cache | Redis in Docker | Local only |
| Email | Console backend | No real email sent |
| Secrets | `.env` / `.env.qa` / `.env.stg` files | Never committed |
| Domain | `*.dev.dfms.local` / `*.qa.dfms.local` / `*.stg.dfms.local` | `/etc/hosts` via `make setup-hosts` |

### Cloud DEV

> **Context**: Internal testing only, ≤20 testers. Cost minimised by running PostgreSQL and Redis in Docker on the same EC2 (no RDS, no ElastiCache). EC2 t3.micro is fully covered by the **AWS 12-month free tier** (750 hrs/mo). ECR uses a public repository (50 GB always free).

| Component | Spec | Free Tier? | Pay/mo (yr 1) | Pay/mo (yr 2+) |
|-----------|------|-----------|--------------|----------------|
| EC2 t3.micro | Docker: web + Nginx + Celery + PostgreSQL + Redis | ✅ 12-mo free | $0 | ~$3.20 (auto-stop) |
| EBS 20 GB root | Data persistence for PostgreSQL + Redis volumes | ✅ 12-mo free | $0 | ~$1.60 |
| S3 ~1 GB | Media files (Arrival Notice, attachments) | ✅ 12-mo free | $0 | ~$0.02 |
| ECR (public repo) | Docker image storage | ✅ Always free (50 GB) | $0 | $0 |
| SES | OTP + invite emails (≤500/mo) | ✅ 12-mo free | $0 | ~$0.05 |
| CloudWatch | 5 GB logs + 10 alarms + 10 metrics | ✅ Always free | $0 | $0 |
| SSM Parameter Store | ~8 SecureString params | ✅ Always free | $0 | $0 |
| EventBridge Scheduler | Auto-stop/start (2 events/day) | ✅ Always free | $0 | $0 |
| ACM | `*.dev.dfms.com` wildcard cert | ✅ Always free | $0 | $0 |
| Route 53 | 1 hosted zone | ❌ Not free | **$0.50** | **$0.50** |
| **Total** | | | **~$0.50/mo** | **~$5.40/mo** |

> **Year 1**: Effectively **$0.50/month** (only Route 53 is charged — everything else is free tier).  
> **Year 2+**: ~$5.40/month with auto-stop (08:00–20:00 BDT Mon–Sat, off Sunday).  
> ⚠️ PostgreSQL and Redis run in Docker on EC2 — acceptable for ≤20 internal testers. Data persists on EBS. Upgrade to RDS + ElastiCache when moving to Cloud QA/Staging.

### CI — GitHub Actions (no domain, no EC2)

| Component | Spec | Notes |
|-----------|------|-------|
| Compute | GitHub Actions runner | Ephemeral |
| DB | PostgreSQL service container | Spun up per job |
| Cache | Redis service container | Spun up per job |
| Email | Django `locmem` backend | In-memory only |
| Secrets | GitHub Actions secrets | `${{ secrets.* }}` |

### QA

| Component | Spec | Monthly Cost |
|-----------|------|-------------|
| EC2 | t3.small (2 vCPU, 2 GB RAM) | ~$15 |
| RDS | db.t3.micro (1 vCPU, 1 GB RAM), 20 GB GP3 | ~$15 |
| ElastiCache | cache.t3.micro (0.5 GB) | ~$12 |
| S3 | ~2 GB storage | ~$0.20 |
| Route 53 | Shared hosted zone | ~$0.50 |
| ACM | Free (TLS `*.qa.dfms.com`) | $0 |
| **Total** | | **~$43/month** |

> **Cost tip**: QA EC2 can be auto-stopped overnight via EventBridge → saves ~60% → ~$17/month effective.

### STG

| Component | Spec | Monthly Cost |
|-----------|------|-------------|
| EC2 | t3.medium (2 vCPU, 4 GB RAM) | ~$30 |
| RDS | db.t3.micro (1 vCPU, 1 GB RAM), 20 GB GP3 | ~$15 |
| ElastiCache | cache.t3.micro (0.5 GB) | ~$12 |
| S3 | ~5 GB storage | ~$0.50 |
| Route 53 | 1 hosted zone + queries | ~$1 |
| ACM | Free (TLS `*.stg.dfms.com`) | $0 |
| **Total** | | **~$59/month** |

### PROD (Launch Day)

| Component | Spec | Monthly Cost |
|-----------|------|-------------|
| EC2 | t3.large (2 vCPU, 8 GB RAM) | ~$60 |
| RDS | db.t3.small (2 vCPU, 2 GB RAM), 30 GB GP3 | ~$28 |
| ElastiCache | cache.t3.micro (0.5 GB) | ~$12 |
| S3 | ~10 GB storage + transfers | ~$3 |
| Route 53 | 1 hosted zone | ~$1 |
| SES | Email sending (~5k emails/month) | ~$0.50 |
| CloudWatch | Logs + basic metrics | ~$3 |
| ACM | Free | $0 |
| **Total** | | **~$108/month** |

> See [aws-cost-estimation.md](./aws-cost-estimation.md) for detailed breakdown and optimisation options.

---

## 4. Domain & Subdomain Strategy

### Convention

Every tenant gets its own subdomain under the environment's base domain. Local domains mirror cloud — just swap `.com` → `.local`:

| Environment | `TENANT_DOMAIN_BASE` | Platform admin | Example tenant |
|-------------|----------------------|----------------|----------------|
| **Local DEV** (`make dev`) | `dev.dfms.local` | `admin.dev.dfms.local:8000` | `nourish.dev.dfms.local:8000` |
| **Local QA sim** (`make qa`) | `qa.dfms.local` | `admin.qa.dfms.local:8000` | `nourish.qa.dfms.local:8000` |
| **Local STG sim** (`make stg`) | `stg.dfms.local` | `admin.stg.dfms.local:8000` | `nourish.stg.dfms.local:8000` |
| **Cloud DEV** | `dev.dfms.com` | `admin.dev.dfms.com` | `nourish.dev.dfms.com` |
| **Cloud QA** | `qa.dfms.com` | `admin.qa.dfms.com` | `nourish.qa.dfms.com` |
| **Cloud STG** | `stg.dfms.com` | `admin.stg.dfms.com` | `nourish.stg.dfms.com` |
| **Cloud PROD** | `dfms.com` | `admin.dfms.com` | `nourish.dfms.com` |

### How it works in code

`TenantProvisioningService._build_domain(schema_name)` reads `settings.TENANT_DOMAIN_BASE` and returns `{schema_name}.{TENANT_DOMAIN_BASE}`. The setting is injected via `.env` — no code changes needed to switch environments.

```
TENANT_DOMAIN_BASE=stg.dfms.com
→ new tenant "acme" gets domain:  acme.stg.dfms.com
→ platform admin lives at:        admin.stg.dfms.com
```

### Local setup (`*.dfms.local`)

Subdomains don't resolve by default — add them to `/etc/hosts` once:

```bash
make setup-hosts
# Adds entries for all three local environments:
#   127.0.0.1  admin.dev.dfms.local     127.0.0.1  nourish.dev.dfms.local
#   127.0.0.1  admin.qa.dfms.local      127.0.0.1  nourish.qa.dfms.local
#   127.0.0.1  admin.stg.dfms.local     127.0.0.1  nourish.stg.dfms.local

# To add a new tenant across all local envs:
sudo ./scripts/setup-hosts.sh acme
# Adds: acme.dev.dfms.local, acme.qa.dfms.local, acme.stg.dfms.local
```

Access per environment:
- `http://admin.dev.dfms.local:8000/admin/` → Platform admin (DEV)
- `http://admin.qa.dfms.local:8000/admin/`  → Platform admin (QA sim)
- `http://nourish.dev.dfms.local:8000/`     → Nourish tenant (DEV)

### STG & PROD DNS (Route 53)

**Wildcard A record** — one record covers all current and future tenants:

```
*.stg.dfms.com   A  →  <STG EC2 Elastic IP>
*.dfms.com       A  →  <PROD EC2 Elastic IP>
```

No per-tenant DNS change needed when onboarding new clients — the wildcard handles it automatically. `django-tenants` matches the `Host` header to the `Domain` table to route to the correct schema.

**SSL**: AWS Certificate Manager (ACM) wildcard certificates:
- `*.dev.dfms.com` — Cloud DEV (free, auto-renews)
- `*.qa.dfms.com` — QA (free, auto-renews)
- `*.stg.dfms.com` — STG (free, auto-renews)
- `*.dfms.com` — PROD (free, auto-renews)
- All provisioned in `ap-south-1` (Mumbai — same region as EC2/Nginx)

### Session & CSRF cookie scope

Cookies must be scoped to the base domain so a user's session on `admin.dfms.com` is not accidentally readable on `nourish.dfms.com`. Set `SESSION_COOKIE_DOMAIN` to `.{TENANT_DOMAIN_BASE}` (note the leading dot):

| Env | `SESSION_COOKIE_DOMAIN` | `CSRF_COOKIE_DOMAIN` |
|-----|-------------------------|----------------------|
| Local DEV sim | `.dev.dfms.local` | `.dev.dfms.local` |
| Local QA sim | `.qa.dfms.local` | `.qa.dfms.local` |
| Local STG sim | `.stg.dfms.local` | `.stg.dfms.local` |
| Cloud DEV | `.dev.dfms.com` | `.dev.dfms.com` |
| Cloud QA | `.qa.dfms.com` | `.qa.dfms.com` |
| Cloud STG | `.stg.dfms.com` | `.stg.dfms.com` |
| Cloud PROD | `.dfms.com` | `.dfms.com` |

### ALLOWED_HOSTS per environment

| Env | `ALLOWED_HOSTS` |
|-----|-----------------|
| Local (all) | `*` (DEBUG=True, not internet-facing) |
| Cloud DEV | `.dev.dfms.com` |
| Cloud QA | `.qa.dfms.com` |
| Cloud STG | `.stg.dfms.com` |
| Cloud PROD | `.dfms.com` |

---

## 5. Release & Deployment Process

### Branch → Environment Mapping

```
feature/*  →  Local only (make dev / make qa)
develop    →  Cloud DEV  (auto-deploy on merge → develop)
             Cloud QA   (auto-deploy on merge → develop, after DEV passes)
release/*  →  Cloud STG  (auto-deploy on merge → release/*)
main       →  Cloud PROD (manual-approval required)
```

### Deployment Pipeline (GitHub Actions)

```
Push / PR
   │
   ▼
[Lint + Unit Tests]  ──fail──▶  Block merge
   │ pass
   ▼
[Build Docker image]
   │
   ▼
[Integration Tests]  ──fail──▶  Block merge
   │ pass
   ▼
[Push image to ECR]
   │
   ├──[develop branch]──▶  Deploy to STG (automatic)
   │
   └──[main branch]────▶  Manual approval gate
                               │
                               ▼
                          Deploy to PROD
```

### Deployment Script (per environment)

```bash
# On EC2 — triggered by CI or manual SSH
set -e

cd /opt/dfms

# 1. Pull latest image tag from ECR
docker pull <ecr-repo>/dfms-backend:${IMAGE_TAG}

# 2. Run DB migrations (shared schema first)
docker-compose -f docker-compose.prod.yml run --rm web \
  python manage.py migrate_schemas --shared

# 3. Run tenant migrations
docker-compose -f docker-compose.prod.yml run --rm web \
  python manage.py migrate_schemas --tenant

# 4. Collect static files to S3
docker-compose -f docker-compose.prod.yml run --rm web \
  python manage.py collectstatic --noinput

# 5. Zero-downtime restart (rolling container replacement)
docker-compose -f docker-compose.prod.yml up -d --no-deps web
sleep 10

# 6. Health check
curl -sf http://localhost/health/ || (docker-compose logs web && exit 1)

# 7. Restart workers after web is healthy
docker-compose -f docker-compose.prod.yml up -d --no-deps celery_worker celery_beat

echo "Deploy complete: ${IMAGE_TAG}"
```

### Zero-Downtime Strategy (Phase 1)

Since Phase 1 uses a single EC2, true blue/green is not applicable. We use:

1. **Pre-warm**: Pull new image before stopping old containers
2. **Migration safety**: Always run migrations before restarting app
3. **Gunicorn graceful reload**: `docker-compose up -d` sends SIGTERM and waits for in-flight requests to finish (Gunicorn `--timeout 30`)
4. **Healthcheck gate**: CI waits for `/health/` to return 200 before marking deploy successful

> Phase 2 will use ALB + blue/green target group switching for true zero-downtime.

---

## 6. Rollback Procedure

### Automatic Rollback (CI)

If the healthcheck fails after deployment, CI automatically redeploys the previous image tag.

### Manual Rollback

```bash
# List recent image tags
aws ecr list-images --repository-name dfms-backend \
  --query 'imageIds[?imageTag!=`latest`]' --output table

# Set IMAGE_TAG to last known-good tag
export IMAGE_TAG=v1.2.3

# Re-run deployment script with old tag
bash /opt/dfms/scripts/deploy.sh
```

### Database Rollback

Migrations that are destructive (drop column, remove table) require a **backward migration** to be written before deployment. Convention:

```
1. Write reversible migration (use RunSQL with `reverse_sql`)
2. Deploy new code
3. If rollback needed: `python manage.py migrate <app> <prev_migration>`
4. Redeploy old image tag
```

**Rule**: Never deploy an irreversible schema migration to PROD without a tested rollback plan.

---

## 7. Secrets Management

| Secret | Storage | Access Method |
|--------|---------|---------------|
| `SECRET_KEY` | AWS SSM Parameter Store (`SecureString`) | EC2 IAM role → `boto3` at startup |
| `DATABASE_URL` | AWS SSM Parameter Store | EC2 IAM role |
| `REDIS_URL` | AWS SSM Parameter Store | EC2 IAM role |
| `EMAIL_HOST_PASSWORD` / SES credentials | AWS SSM Parameter Store | EC2 IAM role |
| `SENTRY_DSN` | GitHub Actions Secret (CI) + SSM (prod) | |
| AWS access keys | IAM Instance Role (no static keys on EC2) | Automatic |

**Never store secrets in `.env` files on EC2.** Use the SSM fetch script in `scripts/fetch-secrets.sh` to populate the runtime environment.

---

## 8. Monitoring & Alerting

| Signal | Tool | Alert Threshold |
|--------|------|-----------------|
| CPU utilisation | CloudWatch | > 75% for 5 min |
| Memory | CloudWatch Agent | > 80% for 5 min |
| DB connections | CloudWatch RDS | > 80 connections |
| 5xx error rate | CloudWatch (Nginx log metric filter) | > 5 errors/min |
| Celery queue depth | CloudWatch custom metric | > 100 tasks pending |
| Disk usage | CloudWatch Agent | > 80% |
| SSL cert expiry | ACM auto-renew + CloudWatch | < 30 days remaining |

**Alerting channel**: CloudWatch Alarm → SNS Topic → Email + Slack webhook

---

## 9. Backup Policy

| Data | Method | Frequency | Retention | Restore Target |
|------|--------|-----------|-----------|----------------|
| RDS (PostgreSQL) | Automated RDS snapshots | Daily | 7 days | < 1 hour |
| RDS | Manual snapshot before every PROD deploy | Per deploy | 30 days | < 30 min |
| S3 (media files) | S3 Versioning + cross-region replication | Continuous | 90 days | < 5 min |
| Docker volumes (if any local state) | Not used in prod (stateless containers) | — | — | — |

---

## 10. Related Documents

- [Resource & Cost Estimation](./aws-cost-estimation.md)
- [Billing Safeguards & Cost Controls](./aws-billing-safeguards.md)
- [Pre-Production Checklist](./aws-pre-production-checklist.md)
- [Post-Production Scalability Plan](./aws-scalability-plan.md)
- [AWS Setup Guide](../../../08-development-guides/01-backend/07-deployment/aws-setup.md)
