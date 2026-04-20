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

**Region**: `ap-southeast-1` (Singapore — closest to Bangladesh)  
**Domain**: `*.dev.dfms.com` (wildcard ACM cert; tenant example: `nourish.dev.dfms.com`)

> Phase 1 dev uses Route 53 → EC2 Elastic IP directly. No ALB or NAT Gateway in dev — those are Phase 2 / PROD concerns. See [aws-deployment-strategy.md](../../../../../05-architecture/04-implementation/deployment-strategy/aws-deployment-strategy.md).

```
Internet
    │
    ▼
┌───────────────────────────────────────────────┐
│  Route 53                                      │
│  *.dev.dfms.com  →  EC2 Elastic IP             │
└───────────────────────┬───────────────────────┘
                        │
┌───────────────────────▼───────────────────────┐
│  EC2 (t3.small) — ap-southeast-1               │
│  Nginx (ports 80/443)                          │
│  ├── web (Django / Gunicorn) — Docker          │
│  ├── celery_worker             — Docker        │
│  └── celery_beat               — Docker        │
└──────────┬────────────────────────┬────────────┘
           │                        │
┌──────────▼──────────┐  ┌──────────▼──────────────┐
│  RDS PostgreSQL      │  │  ElastiCache Redis       │
│  db.t3.micro, 20 GB  │  │  cache.t3.micro          │
│  Multi-tenant schemas│  │  DB 0 = Django cache     │
│  Single-AZ (dev)     │  │  DB 1 = sessions         │
│  Backups: 7 days     │  │  DB 2 = Celery broker    │
└──────────────────────┘  │         + results        │
                          └──────────────────────────┘
           │
┌──────────▼──────────┐  ┌──────────────────────────┐
│  S3 Bucket           │  │  SES (sandbox)            │
│  /media/ (private)   │  │  OTP, invite, reset email │
└──────────────────────┘  └──────────────────────────┘
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
- [ ] EC2 instance: **t3.small** (2 vCPU, 2 GB RAM) — Ubuntu 22.04 LTS — `ap-southeast-1`
- [ ] Elastic IP assigned and attached to EC2
- [ ] Docker and Docker Compose installed via user data / Ansible provisioning script
- [ ] Application containers started via `docker-compose.prod.yml` on instance launch
- [ ] Services running: `web` (Gunicorn), `nginx`, `celery_worker`, `celery_beat`
- [ ] Nginx configured as reverse proxy — ports 80/443, forwards to Gunicorn on `127.0.0.1:8000`
- [ ] Security group: allows 80, 443 inbound (public); SSH (22) from team IP only; all else blocked

### AC-3: RDS PostgreSQL
- [ ] RDS instance: **db.t3.micro**, PostgreSQL 15, single-AZ (dev cost optimisation)
- [ ] Database instance in private subnet — not publicly accessible
- [ ] Security group: accepts inbound on port 5432 from EC2 security group only
- [ ] Automated backups enabled (7-day retention)
- [ ] `DATABASE_URL` injected into EC2 environment from Secrets Manager at deploy time
- [ ] `python manage.py migrate --all-tenants` runs as part of deployment

### AC-4: ElastiCache Redis
- [ ] ElastiCache cluster: **cache.t3.micro**, Redis 7, single-node (dev)
- [ ] Security group accepts inbound on port 6379 from EC2 security group only
- [ ] Redis DB index convention: `0` = Django cache, `1` = sessions, `2` = Celery broker + results
- [ ] `maxmemory-policy` set to `allkeys-lru`
- [ ] `REDIS_URL` injected from SSM Parameter Store

### AC-5: S3 Media Bucket
- [ ] S3 bucket created for media file storage (Arrival Notice attachments, documents)
- [ ] Bucket is private — no public access
- [ ] EC2 instance has IAM role with `s3:GetObject`, `s3:PutObject`, `s3:DeleteObject` on the bucket
- [ ] Django `DEFAULT_FILE_STORAGE` configured to use `storages.backends.s3boto3.S3Boto3Storage`
- [ ] Pre-signed URLs used for secure file downloads

### AC-6: HTTPS & Domain
- [ ] ACM wildcard SSL certificate provisioned for `*.dev.dfms.com` (free, auto-renews) in `ap-southeast-1`
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
| DEVOPS-01-1 | Terraform: VPC, subnets (public/private), IGW, route tables | DFS-042-1 | Pending |
| DEVOPS-01-2 | Terraform: Security groups (EC2, RDS, Redis) | DFS-042-2 | Pending |
| DEVOPS-01-3 | Terraform: RDS PostgreSQL (db.t3.micro, private subnet, 7-day backups, deletion protection) | DFS-042-3 | Pending |
| DEVOPS-01-4 | Terraform: ElastiCache Redis (cache.t3.micro, private subnet, `allkeys-lru`) | DFS-042-4 | Pending |
| DEVOPS-01-5 | Terraform: EC2 (t3.small, Elastic IP, IAM instance role, SSM + SSH access, user data bootstrap) | DFS-042-5 | Pending |
| DEVOPS-01-6 | Terraform: ACM wildcard cert `*.dev.dfms.com` + Route 53 wildcard A record → Elastic IP | DFS-042-6 | Pending |
| DEVOPS-01-7 | Terraform: S3 media bucket + IAM role policy (EC2 → S3 read/write) | DFS-042-7 | Pending |
| DEVOPS-01-8 | Terraform: ECR repository for DFMS Docker image | DFS-042-8 | Pending |
| DEVOPS-01-9 | Terraform: SSM Parameter Store secrets (DB password, SECRET_KEY, SES credentials, Redis URL) | DFS-042-9 | Pending |
| DEVOPS-01-10 | Terraform: CloudWatch log groups + alarms + SNS notification topic (email + Slack) | DFS-042-10 | Pending |
| DEVOPS-01-11 | `docker-compose.prod.yml` — Gunicorn command, `awslogs` log driver, env vars via `scripts/fetch-secrets.sh` | DFS-042-11 | Pending |
| DEVOPS-01-12 | EC2 user data / Ansible script — Docker install, Nginx HTTPS config, bootstrap `docker-compose.prod.yml` | DFS-042-12 | Pending |
| DEVOPS-01-13 | `scripts/fetch-secrets.sh` — pull all SSM `SecureString` params into runtime env at deploy time | DFS-042-13 | Pending |
| DEVOPS-01-14 | GitHub Actions `deploy-dev.yml` — build → ECR push → SSH/SSM deploy → migrate_schemas → collectstatic → health check | DFS-042-14 | Pending |
| DEVOPS-01-15 | SES sandbox setup — verify dev team emails; configure Django `django-ses` backend | DFS-042-15 | Pending |
| DEVOPS-01-16 | Smoke test — `https://dev.dfms.com/health/` 200, `https://nourish.dev.dfms.com` resolves, OTP email received, file upload to S3 works | DFS-042-16 | Pending |
| DEVOPS-01-17 | Write `docs/aws-dev-env.md` — architecture, domain convention, how to access, how to trigger deploy, log locations, rollback | DFS-042-17 | Pending |

---

## Environment Variables (AWS Dev)

| Variable | Source | Notes |
|----------|--------|-------|
| `SECRET_KEY` | SSM Parameter Store (`SecureString`) | Rotated; never in code or `.env` |
| `DEBUG` | `False` | Set in `prod.py` |
| `DATABASE_URL` | SSM Parameter Store | Points to RDS endpoint |
| `REDIS_URL` | SSM Parameter Store | Points to ElastiCache endpoint |
| `AWS_STORAGE_BUCKET_NAME` | SSM Parameter Store | S3 media bucket name |
| `AWS_SES_REGION_NAME` | env / IaC | `ap-southeast-1` |
| `EMAIL_BACKEND` | `prod.py` | `django_ses.SESBackend` |
| `ALLOWED_HOSTS` | env | `.dev.dfms.com` |
| `TENANT_DOMAIN_BASE` | env | `dev.dfms.com` |
| `SESSION_COOKIE_DOMAIN` | env | `.dev.dfms.com` |
| `CSRF_COOKIE_DOMAIN` | env | `.dev.dfms.com` |
| `DJANGO_SETTINGS_MODULE` | env | `config.settings.prod` |

---

## Cost Estimate (Dev — Monthly)

| Resource | Type | Est. Cost/mo |
|----------|------|--------------|
| EC2 | t3.small (on-demand) | ~$15 |
| RDS | db.t3.micro, 20 GB GP3 | ~$15 |
| ElastiCache | cache.t3.micro | ~$12 |
| S3 + ECR | minimal dev usage | ~$0.10 |
| ACM | wildcard cert | $0 |
| Route 53 | hosted zone + queries | ~$0.50 |
| CloudWatch | logs + alarms | ~$5 |
| **Total** | | **~$48/mo** |

> Auto-stop EC2 + RDS outside business hours (EventBridge scheduler) → saves ~60% → **~$19/month effective**.  
> Source: [aws-deployment-strategy.md § Cloud DEV spec](../../../../../05-architecture/04-implementation/deployment-strategy/aws-deployment-strategy.md)

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
- [ ] All resources tagged `Environment=dev`, `Project=DFMS`
- [ ] Auto-stop scheduler configured (EventBridge → EC2/RDS stop outside business hours)
