---
module: 12-cross-cutting
specification: AWS Dev Environment
version: 1.0
phase: Phase 1
sprint: Sprint 3
last_updated: 2026-04-22
related_stories: DFS-042 (DEVOPS-01)
jira_epic: DFS-045
---

# AWS Dev Environment

## Overview

A stable, shared AWS development environment running the full DFMS stack — accessible to developers, QA, and stakeholders without running anything locally. It serves as the integration testing environment, Playwright E2E test target, and sprint review demo environment.

**Design principle**: Cost-optimised for internal dev use (≤ 20 testers). PostgreSQL and Redis run as Docker containers on the same EC2 — no RDS, no ElastiCache. Architecturally mirrors production topology for early environment-specific issue detection.

**Region**: `ap-south-1` (Mumbai) — lowest latency (~266 ms) and lowest cost for Bangladesh  
**Domain**: `*.dev.dfms.com` (wildcard ACM cert)  
**IaC**: Terraform — all resources provisioned from `infra/` directory

---

## 1. Architecture

```
Internet
    │
    ▼
Route 53 (ap-south-1)
*.dev.dfms.com  →  EC2 Elastic IP
    │
    ▼
EC2 t3.micro — Ubuntu 22.04 LTS — ap-south-1
Nginx (80/443) → Gunicorn (127.0.0.1:8000)
    │
    ├── web (Django / Gunicorn)    Docker container
    ├── celery_worker              Docker container
    ├── celery_beat                Docker container
    ├── postgres:15-alpine         Docker container  ← dev only (no RDS)
    └── redis:7-alpine             Docker container  ← dev only (no ElastiCache)
    │
    ├── EBS root volume (data persistence for Docker named volumes)
    ├── S3 bucket (private media — Arrival Notice attachments, documents)
    └── SES sandbox (OTP / invite / password reset emails)
```

### Subdomain routing

`django-tenants` matches the `Host` header to the `Domain` table for schema routing:

| Subdomain | Resolves to | Purpose |
|-----------|------------|---------|
| `admin.dev.dfms.com` | EC2 Elastic IP | Platform Admin portal |
| `{tenant}.dev.dfms.com` | EC2 Elastic IP | Tenant portal (any tenant) |
| `dev.dfms.com` | EC2 Elastic IP | Health check endpoint |

All resolved via a single Route 53 wildcard A record: `*.dev.dfms.com → Elastic IP`.

---

## 2. Infrastructure as Code (Terraform)

All AWS resources are defined in `infra/` at repo root. Terraform workspaces separate `dev`, `staging`, `prod`.

```
infra/
├── main.tf
├── variables.tf
├── outputs.tf
├── terraform.tfvars.dev          # Dev-specific values (non-secret)
├── modules/
│   ├── networking/               # VPC, subnets, IGW, route tables
│   ├── ec2/                      # EC2, Elastic IP, security group, IAM role, user data
│   ├── s3/                       # Media bucket + IAM policy
│   ├── ecr/                      # Container registry (public repo for dev)
│   ├── dns/                      # Route 53 hosted zone + wildcard A record
│   ├── acm/                      # Wildcard TLS cert (*.dev.dfms.com)
│   ├── ssm/                      # Parameter Store secrets
│   ├── scheduler/                # EventBridge auto-start/stop rules
│   └── observability/            # CloudWatch log groups, alarms, SNS topic
```

**Provision from scratch**:
```bash
cd infra/
terraform workspace select dev
terraform apply -var-file=terraform.tfvars.dev
```

Sensitive values (DB password, `SECRET_KEY`, SES credentials) are stored in **AWS SSM Parameter Store** (`SecureString`) — never in `.env` files or Terraform state.

---

## 3. EC2 Application Server

| Property | Value |
|----------|-------|
| Instance type | t3.micro (2 vCPU, 1 GB RAM) |
| OS | Ubuntu 22.04 LTS |
| Region | ap-south-1 (Mumbai) |
| IP | Elastic IP (static) |
| Compose file | `docker-compose.dev-cloud.yml` |

**Security group rules**:

| Port | Source | Purpose |
|------|--------|---------|
| 80 | 0.0.0.0/0 | HTTP (redirects to HTTPS) |
| 443 | 0.0.0.0/0 | HTTPS |
| 22 | Team IP allowlist only | SSH |

SSH from 0.0.0.0/0 is **blocked**. Alternative access via AWS SSM Session Manager.

**Auto-stop schedule** (EventBridge Scheduler — saves ~65% after free tier):
- Start: 08:00 BDT, Mon–Sat
- Stop: 20:00 BDT, Mon–Sat
- Sunday: off all day

**IAM instance role** grants EC2 access to: S3 (read/write media bucket), ECR (pull images), SSM (fetch secrets), CloudWatch (push logs + metrics). No static IAM user keys on the instance.

---

## 4. Services — `docker-compose.dev-cloud.yml`

```yaml
services:
  web:
    image: ${ECR_REPO}:${IMAGE_TAG}
    command: gunicorn config.wsgi:application --bind 127.0.0.1:8000 --workers 2
    env_file: .env.runtime            # Populated by fetch-secrets.sh at deploy time
    logging:
      driver: awslogs
      options:
        awslogs-group: /dfms/dev/web
        awslogs-region: ap-south-1

  celery_worker:
    image: ${ECR_REPO}:${IMAGE_TAG}
    command: celery -A config worker --loglevel=info
    env_file: .env.runtime
    logging:
      driver: awslogs
      options:
        awslogs-group: /dfms/dev/celery

  celery_beat:
    image: ${ECR_REPO}:${IMAGE_TAG}
    command: celery -A config beat --loglevel=info

  postgres:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data    # persists on EBS
    environment:
      POSTGRES_DB: dfms_dev
      POSTGRES_USER: dfms
      POSTGRES_PASSWORD_FILE: /run/secrets/pg_password

  redis:
    image: redis:7-alpine
    command: redis-server --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/dev-cloud.conf:/etc/nginx/conf.d/default.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro   # ACM cert via certbot or AWS-managed

volumes:
  postgres_data:
  redis_data:
```

**Redis DB index convention**:

| DB index | Purpose |
|----------|---------|
| 0 | Django cache |
| 1 | Sessions |
| 2 | Celery broker + results |

---

## 5. PostgreSQL (Docker)

- Image: `postgres:15-alpine`
- Data directory mounted to a named Docker volume on EBS root volume → **persists across EC2 restarts**
- `DATABASE_URL`: `postgres://dfms:***@postgres:5432/dfms_dev` (container-to-container via Docker network)
- Migrations run on every deploy:
  ```bash
  docker compose run --rm web python manage.py migrate_schemas --shared
  docker compose run --rm web python manage.py migrate_schemas --tenant
  ```
- ⚠️ No automated backups — dev data is ephemeral. Daily manual `pg_dump` to S3 recommended.

---

## 6. S3 Media Bucket

- **Private bucket** — no public access policy
- EC2 IAM role has `s3:GetObject`, `s3:PutObject`, `s3:DeleteObject` on the bucket only
- Django: `DEFAULT_FILE_STORAGE = "storages.backends.s3boto3.S3Boto3Storage"`
- File downloads via **pre-signed URLs** (TTL: 1 hour default) — never public direct URLs
- Used for: Arrival Notice attachments, compliance documents, bulk import/export files

---

## 7. HTTPS & Domain

- ACM wildcard certificate: `*.dev.dfms.com` (free, auto-renews in `ap-south-1`)
- Nginx: port 443 with ACM cert; port 80 → permanent redirect to HTTPS
- Route 53: single wildcard A record `*.dev.dfms.com → Elastic IP`
- Django settings:
  ```python
  ALLOWED_HOSTS = [".dev.dfms.com"]
  SESSION_COOKIE_DOMAIN = ".dev.dfms.com"
  CSRF_COOKIE_DOMAIN = ".dev.dfms.com"
  TENANT_DOMAIN_BASE = "dev.dfms.com"
  ```

---

## 8. SES Email (Sandbox)

- SES configured in **sandbox mode** for dev — only verified email addresses can receive
- Dev team email addresses verified in SES sandbox
- Django: `EMAIL_BACKEND = "django_ses.SESBackend"`
- Used for: OTP delivery, user invitation emails, password reset emails
- SES credentials injected from SSM Parameter Store at runtime
- Upgrade to SES production mode when moving to QA/staging

---

## 9. Secrets Management

**All secrets fetched at runtime via `scripts/fetch-secrets.sh`** — never stored in `.env` files on EC2 or in Terraform state.

```bash
# scripts/fetch-secrets.sh — runs as part of deployment
aws ssm get-parameters-by-path \
  --path "/dfms/dev/" \
  --with-decryption \
  --query "Parameters[*].[Name,Value]" \
  --output text \
| awk '{ gsub("/dfms/dev/", "", $1); print $1"="$2 }' \
> .env.runtime
```

| SSM Parameter | Type | Notes |
|---------------|------|-------|
| `/dfms/dev/SECRET_KEY` | SecureString | Django secret key |
| `/dfms/dev/DATABASE_URL` | SecureString | PostgreSQL connection string |
| `/dfms/dev/REDIS_URL` | SecureString | Redis connection string |
| `/dfms/dev/AWS_STORAGE_BUCKET_NAME` | String | S3 media bucket name |
| `/dfms/dev/SES_ACCESS_KEY_ID` | SecureString | SES SMTP credentials |
| `/dfms/dev/SES_SECRET_ACCESS_KEY` | SecureString | |
| `/dfms/dev/SONAR_TOKEN` | SecureString | SonarQube CI scanner token |

---

## 10. CI/CD Deployment Pipeline

**Trigger**: Merge to `develop` branch  
**Workflow file**: `.github/workflows/deploy-dev.yml`

### Pipeline stages

```
lint → unit tests → integration tests → build Docker image → push to ECR (public repo)
    ↓
SSH/SSM into EC2
    ↓
1. Pull latest image from ECR
2. Run fetch-secrets.sh → .env.runtime
3. docker compose run --rm web python manage.py migrate_schemas --shared
4. docker compose run --rm web python manage.py migrate_schemas --tenant
5. docker compose run --rm web python manage.py collectstatic --noinput
6. Zero-downtime restart: docker compose up -d --no-deps web
7. Health check: curl -sf https://dev.dfms.com/health/  (rollback to prev tag if fails)
8. Restart workers: docker compose up -d --no-deps celery_worker celery_beat
    ↓
Notify via SNS → email + Slack webhook (success or failure)
```

**Target**: Deployment completes in < 5 minutes.

### ECR strategy

Use **public ECR repository** (50 GB always free) for dev to eliminate ECR storage cost. Switch to private ECR for QA/staging/prod.

---

## 11. Observability

### CloudWatch Logs

Application logs streamed from Docker containers via `awslogs` log driver:

| Log group | Container |
|-----------|-----------|
| `/dfms/dev/web` | Django/Gunicorn |
| `/dfms/dev/celery` | Celery worker |

### CloudWatch Alarms (→ SNS → email + Slack)

| Alarm | Condition |
|-------|-----------|
| High CPU | EC2 CPU > 75% for 5 minutes |
| Low disk | EBS free space < 20% |
| 5xx errors | > 5 per minute (Nginx log metric filter) |
| Celery queue depth | > 100 pending tasks |

### Deployment logs

Visible in GitHub Actions run history and CloudWatch.

---

## 12. Environment Variables Reference

| Variable | Source | Value |
|----------|--------|-------|
| `SECRET_KEY` | SSM SecureString | Rotated; never in code |
| `DEBUG` | `prod.py` | `False` |
| `DATABASE_URL` | SSM SecureString | `postgres://dfms:***@postgres:5432/dfms_dev` |
| `REDIS_URL` | SSM SecureString | `redis://redis:6379/0` |
| `AWS_STORAGE_BUCKET_NAME` | SSM String | S3 bucket name |
| `AWS_SES_REGION_NAME` | IaC env | `ap-south-1` |
| `EMAIL_BACKEND` | `prod.py` | `django_ses.SESBackend` |
| `ALLOWED_HOSTS` | IaC env | `.dev.dfms.com` |
| `TENANT_DOMAIN_BASE` | IaC env | `dev.dfms.com` |
| `SESSION_COOKIE_DOMAIN` | IaC env | `.dev.dfms.com` |
| `CSRF_COOKIE_DOMAIN` | IaC env | `.dev.dfms.com` |
| `DJANGO_SETTINGS_MODULE` | IaC env | `config.settings.prod` |

---

## 13. Cost Estimate

> AWS public pricing, April 2026 (ap-south-1). 12-month free tier assumed active.

### During free tier (months 1–12)

| Resource | Cost |
|----------|------|
| EC2 t3.micro (750 hrs/mo free tier) | **$0** |
| EBS 20 GB (30 GB/mo free tier) | **$0** |
| S3 ~1 GB (5 GB/mo free tier) | **$0** |
| ECR public repo (50 GB always free) | **$0** |
| SES ≤ 500 emails/mo (3,000/mo free tier) | **$0** |
| CloudWatch Logs + 4 alarms (always free) | **$0** |
| SSM Parameter Store standard (always free) | **$0** |
| EventBridge Scheduler (always free) | **$0** |
| ACM wildcard cert (always free) | **$0** |
| Route 53 hosted zone | **$0.50** |
| **Total** | **~$0.50/month** |

### After free tier expires (month 13+)

| Resource | Always-on | With auto-stop (65 hrs/wk) |
|----------|-----------|---------------------------|
| EC2 t3.micro | ~$8.50 | ~$3.20 |
| EBS 20 GB GP3 | ~$1.60 | ~$1.60 |
| S3 | ~$0.02 | ~$0.02 |
| SES | ~$0.05 | ~$0.05 |
| Route 53 | $0.50 | $0.50 |
| **Total** | **~$10.70/mo** | **~$5.40/mo** |

---

## 14. Access & Security

| Control | Implementation |
|---------|----------------|
| SSH access | Port 22 restricted to team IP allowlist; SSM Session Manager as alternative |
| AWS service access | IAM instance role — no static keys on EC2 |
| Secrets | SSM Parameter Store SecureString — fetched at deploy time only |
| Resource tagging | All resources tagged: `Environment=dev`, `Project=DFMS`, `Region=ap-south-1` |
| Dev docs | Access instructions, deploy procedure, log locations: `docs/aws-dev-env.md` |

---

## 15. Smoke Tests (Definition of Done verification)

| Check | Expected |
|-------|---------|
| `https://dev.dfms.com/health/` | 200 OK |
| `https://nourish.dev.dfms.com` | Tenant portal loads |
| `https://admin.dev.dfms.com` | Platform admin loads |
| OTP email flow | Email received in SES sandbox within 30 seconds |
| File upload (Arrival Notice) | Stored in S3; downloadable via pre-signed URL |
| GitHub Actions `deploy-dev.yml` | Deploys successfully on merge to `develop` |
| CloudWatch logs | `/dfms/dev/web` and `/dfms/dev/celery` streaming |
| SSH access | Only team IP can connect; SSM works as alternative |
| Secrets | Confirmed sourced from SSM — no plaintext on EC2 |
| Auto-stop | EC2 stops at 20:00 BDT, starts at 08:00 BDT Mon–Sat |
| Monthly cost | ≤ $10/mo always-on, ≤ $4/mo with auto-stop |

---

## 16. Dependencies & Cross-References

| Dependency | Notes |
|------------|-------|
| `12-cross-cutting/testing-strategy.md` | Playwright E2E tests (QA-01) run against this environment in CI |
| `DEVOPS-01-implementation-plan.md` (sprint backlog) | Step-by-step implementation plan for this environment |
| INFRA-01 (Sprint 1) | Docker Compose stack — `docker-compose.dev-cloud.yml` extends the local setup |
| INFRA-05 (Sprint 1) | Production settings split (`config/settings/prod.py`) — reused here |
| `01-foundation/authentication-security.md` | SES email backend, session/cookie domain settings |
