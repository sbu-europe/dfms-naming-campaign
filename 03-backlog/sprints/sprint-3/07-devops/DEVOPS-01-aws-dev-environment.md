---
jira_key: DFS-042
jira_type: Story
jira_epic: DFS-045
jira_sprint: "Sprint 3"
story_id: ~
title: AWS Dev Environment — Up & Running
epic: DevOps & Infrastructure
status: Pending
story_points: 8
assignee: ~
---

# DEVOPS-01 — AWS Dev Environment: Up & Running

## User Story

**As a** Development Team  
**I want to** have a stable, shared AWS development environment running the full DFMS stack  
**So that** developers, QA, and stakeholders can access a persistent non-local environment for integration testing, demos, and Sprint 3 feature validation

## Business Context

Sprint 1 delivered a working local Docker Compose stack and production-ready settings split. This task takes the next step: deploying the same stack to AWS so the team has a shared dev environment that:

- Is always-on and accessible without running anything locally
- Mirrors the production architecture closely enough to catch environment-specific issues early
- Can be used by QA for running Playwright E2E tests against a real deployed server (QA-01)
- Serves as the demo environment for sprint reviews

The target is a **cost-optimised dev setup** — not production-grade HA, but architecturally correct and reproducible via Infrastructure as Code.

---

## Target Architecture

**Region**: `ap-south-1` (Mumbai) — lowest latency (~266 ms) and lowest cost for Bangladesh  
**Domain**: `*.dev.dfms.com` (wildcard ACM cert; tenant example: `nourish.dev.dfms.com`)

> **Dev cost strategy**: PostgreSQL and Redis run as Docker containers on the same EC2 — no RDS, no ElastiCache. Acceptable for internal testing with ≤20 testers. Data persists on the EBS root volume. EC2 is auto-stopped outside business hours (08:00–20:00 BDT, Mon–Sat).
>
> Phase 1 dev uses Route 53 → EC2 Elastic IP directly (no ALB, no NAT Gateway). See [aws-deployment-strategy.md](../../../../04-architecture/06-deployment/aws-deployment-strategy.md).

```
Internet
    │
    ▼
┌───────────────────────────────────────────────┐
│  Route 53 (ap-south-1)                         │
│  *.dev.dfms.com  →  EC2 Elastic IP             │
└───────────────────────┬───────────────────────┘
                        │
┌───────────────────────▼───────────────────────┐
│  EC2 t3.micro — ap-south-1 (Mumbai)            │
│  Nginx (ports 80/443)                          │
│  ├── web (Django / Gunicorn) — Docker          │
│  ├── celery_worker             — Docker        │
│  ├── celery_beat               — Docker        │
│  ├── postgres:15               — Docker        │  ← no RDS (dev only)
│  └── redis:7                   — Docker        │  ← no ElastiCache (dev only)
└───────────────────────┬───────────────────────┘
                        │ EBS volume (data persistence)
┌───────────────────────▼───────────────────────┐
│  S3 Bucket — /media/ (private, pre-signed URLs)│
│  SES sandbox — OTP / invite / reset emails     │
└───────────────────────────────────────────────┘
```

---

## Acceptance Criteria

### AC-1: Infrastructure as Code (IaC)
- [ ] All AWS resources defined and provisioned via **Terraform** (preferred) or AWS CDK
- [ ] IaC code stored in a `infra/` directory in the repository
- [ ] Separate Terraform workspace / variable file for `dev` vs future `staging` and `prod`
- [ ] `terraform apply` from scratch provisions the full environment in one command
- [ ] Sensitive values (DB password, secret key, SES credentials) stored in **AWS Secrets Manager** — not hardcoded in IaC or `.env` files

### AC-2: EC2 Application Server
- [ ] EC2 instance: **t3.micro** (2 vCPU, 1 GB RAM) — Ubuntu 22.04 LTS — `ap-south-1` (Mumbai)
- [ ] Elastic IP assigned and attached to EC2
- [ ] Docker and Docker Compose installed via user data / Ansible provisioning script
- [ ] Application containers started via `docker-compose.dev-cloud.yml` on instance launch
- [ ] Services running: `web` (Gunicorn), `nginx`, `celery_worker`, `celery_beat`, `postgres`, `redis`
- [ ] Nginx configured as reverse proxy — ports 80/443, forwards to Gunicorn on `127.0.0.1:8000`
- [ ] Security group: allows 80, 443 inbound (public); SSH (22) from team IP only; all else blocked
- [ ] EventBridge scheduler: **stop at 20:00 BDT, start at 08:00 BDT Mon–Sat; off all Sunday** (saves ~65%)

### AC-3: PostgreSQL (Docker — dev only)
- [ ] PostgreSQL 15 runs as a Docker container on the EC2 instance (`postgres:15-alpine` image)
- [ ] Data directory mounted to a named Docker volume on the EBS root volume for persistence across restarts
- [ ] `DATABASE_URL` set to `postgres://...@localhost:5432/dfms_dev` (container-to-container via Docker network)
- [ ] `python manage.py migrate_schemas --shared` then `migrate_schemas --tenant` run as part of deployment
- [ ] ⚠️ No automated RDS backups — dev data is ephemeral; daily manual `pg_dump` to S3 recommended but not required

### AC-4: Redis (Docker — dev only)
- [ ] Redis 7 runs as a Docker container on the EC2 instance (`redis:7-alpine` image)
- [ ] DB index convention: `0` = Django cache, `1` = sessions, `2` = Celery broker + results
- [ ] `maxmemory-policy` set to `allkeys-lru` via Redis config in `docker-compose.dev-cloud.yml`
- [ ] `REDIS_URL` set to `redis://localhost:6379` (container-to-container via Docker network)
- [ ] ⚠️ No ElastiCache — acceptable for ≤20 internal testers; upgrade to ElastiCache in QA/STG

### AC-5: S3 Media Bucket
- [ ] S3 bucket created for media file storage (Arrival Notice attachments, documents)
- [ ] Bucket is private — no public access
- [ ] EC2 instance has IAM role with `s3:GetObject`, `s3:PutObject`, `s3:DeleteObject` on the bucket
- [ ] Django `DEFAULT_FILE_STORAGE` configured to use `storages.backends.s3boto3.S3Boto3Storage`
- [ ] Pre-signed URLs used for secure file downloads

### AC-6: HTTPS & Domain
- [ ] ACM wildcard SSL certificate provisioned for `*.dev.dfms.com` (free, auto-renews) in `ap-south-1`
- [ ] Nginx configured for HTTPS (port 443) with ACM cert; HTTP (port 80) redirects to HTTPS
- [ ] Route 53 wildcard A record: `*.dev.dfms.com` → EC2 Elastic IP
- [ ] Tenant subdomains resolve automatically via wildcard — e.g. `nourish.dev.dfms.com`, `admin.dev.dfms.com`
- [ ] `django-tenants` matches `Host` header to `Domain` table for schema routing
- [ ] `SESSION_COOKIE_DOMAIN` and `CSRF_COOKIE_DOMAIN` set to `.dev.dfms.com`

### AC-7: SES Email
- [ ] AWS SES configured in dev mode (sandbox) for transactional email
- [ ] Dev team email addresses verified in SES sandbox for receiving OTP / invite emails
- [ ] Django `EMAIL_BACKEND` set to `django_ses.SESBackend`
- [ ] SES credentials injected from Secrets Manager

### AC-8: Deployment Pipeline (CI/CD to Dev)
- [ ] GitHub Actions workflow: `deploy-dev.yml` — triggers on merge to `develop` branch
- [ ] Pipeline stages: lint + unit tests → build Docker image → integration tests → push to ECR → deploy to Cloud DEV → (if passing) deploy to Cloud QA
- [ ] Deployment steps on EC2:
  1. Pull latest image from ECR
  2. Run `docker-compose -f docker-compose.prod.yml run --rm web python manage.py migrate_schemas --shared`
  3. Run `docker-compose -f docker-compose.prod.yml run --rm web python manage.py migrate_schemas --tenant`
  4. Run `docker-compose -f docker-compose.prod.yml run --rm web python manage.py collectstatic --noinput`
  5. Zero-downtime restart: `docker-compose up -d --no-deps web` (Gunicorn graceful reload)
  6. Health check: `curl -sf https://dev.dfms.com/health/` — rollback to previous ECR tag if fails
  7. Restart workers: `docker-compose up -d --no-deps celery_worker celery_beat`
- [ ] Deployment completes in < 5 minutes
- [ ] Slack / email notification on successful and failed deployments via SNS

### AC-9: Observability (Basic)
- [ ] **CloudWatch Logs** — application logs (`web`, `celery_worker`) streamed from Docker via `awslogs` log driver
- [ ] CloudWatch log groups: `/dfms/dev/web`, `/dfms/dev/celery`
- [ ] **CloudWatch Alarms** (notify via SNS → email + Slack webhook):
  - CPU > 75% on EC2 for 5 min
  - RDS storage < 20% free
  - 5xx error rate > 5 errors/min (Nginx log metric filter)
  - Celery queue depth > 100 tasks pending
- [ ] Deployment logs visible in GitHub Actions and CloudWatch

### AC-10: Access & Security
- [ ] SSH (port 22) restricted to team IP allowlist only (not 0.0.0.0/0); SSM Session Manager also configured as alternative access
- [ ] IAM instance role used for all AWS service access (EC2 → S3, ECR, SSM, CloudWatch) — no static IAM user keys on the instance
- [ ] Secrets fetched at runtime from **AWS SSM Parameter Store** (`SecureString`) via `scripts/fetch-secrets.sh` — never stored in `.env` files on EC2
- [ ] All resources tagged: `Environment=dev`, `Project=DFMS`
- [ ] Dev environment URL and access instructions documented in `docs/aws-dev-env.md`

---

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| DEVOPS-01-1 | Terraform: VPC, subnets, IGW, route tables — region `ap-south-1` | DFS-042-1 | Pending |
| DEVOPS-01-2 | Terraform: Security group for EC2 (80, 443 public; 22 team IP only) | DFS-042-2 | Pending |
| DEVOPS-01-3 | Terraform: EC2 t3.micro (Elastic IP, IAM instance role, user data bootstrap) in `ap-south-1` | DFS-042-3 | Pending |
| DEVOPS-01-4 | Terraform: EventBridge scheduler — stop EC2 at 20:00 BDT, start at 08:00 BDT Mon–Sat | DFS-042-4 | Pending |
| DEVOPS-01-5 | Terraform: ACM wildcard cert `*.dev.dfms.com` + Route 53 wildcard A record → Elastic IP | DFS-042-5 | Pending |
| DEVOPS-01-6 | Terraform: S3 media bucket + IAM role policy (EC2 → S3 read/write) | DFS-042-6 | Pending |
| DEVOPS-01-7 | Terraform: ECR repository for DFMS Docker image | DFS-042-7 | Pending |
| DEVOPS-01-8 | Terraform: SSM Parameter Store secrets (SECRET_KEY, SES credentials) | DFS-042-8 | Pending |
| DEVOPS-01-9 | Terraform: CloudWatch log groups + alarms + SNS notification topic (email + Slack) | DFS-042-9 | Pending |
| DEVOPS-01-10 | `docker-compose.dev-cloud.yml` — all services incl. `postgres:15-alpine`, `redis:7-alpine`; named volumes for data persistence; `awslogs` log driver | DFS-042-10 | Pending |
| DEVOPS-01-11 | EC2 user data script — Docker install, `docker-compose.dev-cloud.yml` bootstrap, Nginx HTTPS config | DFS-042-11 | Pending |
| DEVOPS-01-12 | `scripts/fetch-secrets.sh` — pull SSM `SecureString` params into runtime env at deploy time | DFS-042-12 | Pending |
| DEVOPS-01-13 | GitHub Actions `deploy-dev.yml` — build → ECR push → SSH/SSM deploy → migrate_schemas → collectstatic → health check | DFS-042-13 | Pending |
| DEVOPS-01-14 | SES sandbox setup — verify dev team emails; configure Django `django-ses` backend | DFS-042-14 | Pending |
| DEVOPS-01-15 | Smoke test — `https://dev.dfms.com/health/` 200, `https://nourish.dev.dfms.com` resolves, OTP email received, file upload to S3 works | DFS-042-15 | Pending |
| DEVOPS-01-16 | Write `docs/aws-dev-env.md` — architecture, region rationale, domain convention, how to access, how to trigger deploy, log locations, rollback | DFS-042-16 | Pending |

---

## Environment Variables (AWS Dev)

| Variable | Source | Notes |
|----------|--------|-------|
| `SECRET_KEY` | SSM Parameter Store (`SecureString`) | Rotated; never in code or `.env` |
| `DEBUG` | `False` | Set in `prod.py` |
| `DATABASE_URL` | SSM Parameter Store | Points to RDS endpoint |
| `REDIS_URL` | SSM Parameter Store | Points to ElastiCache endpoint |
| `AWS_STORAGE_BUCKET_NAME` | SSM Parameter Store | S3 media bucket name |
| `AWS_SES_REGION_NAME` | env / IaC | `ap-south-1` |
| `EMAIL_BACKEND` | `prod.py` | `django_ses.SESBackend` |
| `ALLOWED_HOSTS` | env | `.dev.dfms.com` |
| `TENANT_DOMAIN_BASE` | env | `dev.dfms.com` |
| `SESSION_COOKIE_DOMAIN` | env | `.dev.dfms.com` |
| `CSRF_COOKIE_DOMAIN` | env | `.dev.dfms.com` |
| `DJANGO_SETTINGS_MODULE` | env | `config.settings.prod` |

---

## Cost Estimate (Dev — Monthly, ap-south-1 Mumbai)

> Pricing sourced from AWS public pricing pages (April 2026). All figures are USD, excl. tax.  
> Free Tier = 12-month free tier from account creation date (unless marked "Always Free").

### Free Tier coverage

| Service | Free Tier Allowance | Our Dev Usage | Covered? |
|---------|-------------------|---------------|----------|
| **EC2 t3.micro** | 750 hrs/mo for 12 months (t2.micro or t3.micro) | 1 × t3.micro = 720 hrs/mo | ✅ **100% free** (12 mo) |
| **EBS** (root volume) | 30 GB/mo for 12 months | ~20 GB root volume | ✅ **100% free** (12 mo) |
| **S3 storage** | 5 GB/mo for 12 months | ~1 GB media files | ✅ **100% free** (12 mo) |
| **S3 requests** | 20,000 GET + 2,000 PUT/mo | Low dev traffic | ✅ **free** (12 mo) |
| **ECR private storage** | 500 MB/mo for 12 months | ~400–600 MB image | ⚠️ **borderline** — use public ECR repo (50 GB always free) to be safe |
| **SES email** | 3,000 message charges/mo for 12 months | ~200–500 OTP + invite emails | ✅ **100% free** (12 mo) |
| **CloudWatch Logs** | 5 GB ingestion + storage/mo — **Always Free** | ~200 MB dev logs | ✅ **100% free** (always) |
| **CloudWatch Alarms** | 10 alarms — **Always Free** | ~4 alarms (CPU, disk, errors, queue) | ✅ **100% free** (always) |
| **CloudWatch Metrics** | 10 custom metrics — **Always Free** | ~4 custom metrics | ✅ **100% free** (always) |
| **SSM Parameter Store** | Standard parameters — **Always Free** | ~8 SecureString params | ✅ **100% free** (always) |
| **EventBridge Scheduler** | 14M invocations/mo — **Always Free** | 2 events/day (start + stop) | ✅ **100% free** (always) |
| **ACM** | Wildcard cert — **Always Free** | `*.dev.dfms.com` | ✅ **100% free** (always) |
| **Data transfer out** | 100 GB/mo across all services — **Always Free** | <1 GB dev traffic | ✅ **100% free** (always) |
| **Route 53** | ❌ No free tier | 1 hosted zone | ❌ **not free** |

### What you actually pay

| Resource | Spec | Always-on/mo | With auto-stop¹ |
|----------|------|-------------|-----------------|
| EC2 t3.micro | ~~$0.0116/hr~~ | **$0** (free tier) | **$0** (free tier) |
| EBS root volume | ~~20 GB GP2~~ | **$0** (free tier) | **$0** (free tier) |
| S3 | ~~1 GB media~~ | **$0** (free tier) | **$0** (free tier) |
| ECR | Use **public repo** (50 GB always free) | **$0** | **$0** |
| SES | ~~≤500 emails/mo~~ | **$0** (free tier) | **$0** (free tier) |
| CloudWatch | Logs + 4 alarms + 4 metrics | **$0** (always free) | **$0** (always free) |
| SSM Parameter Store | ~8 Standard params | **$0** (always free) | **$0** (always free) |
| EventBridge Scheduler | 2 invocations/day | **$0** (always free) | **$0** (always free) |
| ACM | `*.dev.dfms.com` | **$0** (always free) | **$0** (always free) |
| Route 53 | 1 hosted zone | **$0.50** | **$0.50** |
| **Total** | | **~$0.50/month** | **~$0.50/month** |

> ¹ Auto-stop (EventBridge: start 08:00, stop 20:00 BDT Mon–Sat; off Sunday = ~65 active hrs/wk) saves ~62% on EC2 — but EC2 is already free tier, so savings only matter **after month 12**.

### After free tier expires (month 13+)

| Resource | Always-on/mo | With auto-stop |
|----------|-------------|----------------|
| EC2 t3.micro | ~$8.50 | ~$3.20 |
| EBS 20 GB GP3 | ~$1.60 | ~$1.60 |
| S3 ~1 GB | ~$0.02 | ~$0.02 |
| ECR public repo | $0 | $0 |
| SES ≤500 emails | ~$0.05 | ~$0.05 |
| CloudWatch | $0 | $0 |
| SSM / EventBridge / ACM | $0 | $0 |
| Route 53 | $0.50 | $0.50 |
| **Total** | **~$10.70/mo** | **~$5.40/mo** |

> **Recommendation**: Use the ECR **public repository** (50 GB always free) instead of a private repo during dev to eliminate ECR storage cost entirely. Switch to private ECR when moving to QA/STG.

---

## Dependencies

- **Requires**: INFRA-01 (Docker Compose stack), INFRA-05 (prod settings split, `docker-compose.prod.yml` base)
- **Enables**: QA-01 (Playwright E2E tests run against this environment in CI), Sprint 3 feature demos

## Definition of Done

- [ ] `terraform apply` provisions all AWS resources from scratch without errors
- [ ] Application accessible at `https://dev.dfms.com/health/` returning 200
- [ ] Tenant subdomain routing works (e.g. `https://nourish.dev.dfms.com`)
- [ ] Platform admin accessible at `https://admin.dev.dfms.com`
- [ ] OTP email received in SES sandbox for login and invite flows
- [ ] File upload (Arrival Notice) stored in S3 and downloadable via pre-signed URL
- [ ] GitHub Actions `deploy-dev.yml` deploys successfully on merge to `develop`
- [ ] CloudWatch logs streaming from `/dfms/dev/web` and `/dfms/dev/celery`
- [ ] SSH restricted to team IP; SSM Session Manager access working as alternative
- [ ] Secrets confirmed sourced from SSM Parameter Store — no plaintext values on EC2
- [ ] `docs/aws-dev-env.md` written and reviewed
- [ ] All resources tagged `Environment=dev`, `Project=DFMS`, `Region=ap-south-1`
- [ ] EventBridge auto-stop scheduler confirmed: EC2 stops at 20:00 BDT, starts at 08:00 BDT Mon–Sat
- [ ] Monthly cost confirmed ≤ $10/mo always-on, ≤ $4/mo with auto-stop
