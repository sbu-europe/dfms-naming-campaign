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

```
                        ┌─────────────────────────────────────────┐
                        │  AWS (ap-south-1 or closest region)     │
                        │                                         │
  Developer / QA        │  ┌──────────────────────────────────┐   │
  Browser / API ───────►│  │  Application Load Balancer (ALB) │   │
                        │  │  HTTPS (ACM cert on dev domain)  │   │
                        │  └──────────────┬───────────────────┘   │
                        │                 │                        │
                        │  ┌──────────────▼───────────────────┐   │
                        │  │  EC2 (t3.medium) — Docker host   │   │
                        │  │  ├── web (Django / Gunicorn)      │   │
                        │  │  ├── nginx (reverse proxy)        │   │
                        │  │  ├── celery_worker                │   │
                        │  │  └── celery_beat                  │   │
                        │  └────────────┬──────────────────────┘   │
                        │               │                          │
                        │  ┌────────────▼────────────────────┐    │
                        │  │  RDS PostgreSQL (db.t3.micro)   │    │
                        │  │  Multi-tenant schemas           │    │
                        │  └─────────────────────────────────┘    │
                        │                                         │
                        │  ┌──────────────────────────────────┐   │
                        │  │  ElastiCache Redis (cache.t3.    │   │
                        │  │  micro) — sessions, OTP, Celery  │   │
                        │  └──────────────────────────────────┘   │
                        │                                         │
                        │  ┌──────────────────────────────────┐   │
                        │  │  S3 Bucket — media / attachments │   │
                        │  │  (Arrival Notice, documents)     │   │
                        │  └──────────────────────────────────┘   │
                        │                                         │
                        │  ┌──────────────────────────────────┐   │
                        │  │  SES — transactional email       │   │
                        │  │  (OTP, invite, reset emails)     │   │
                        │  └──────────────────────────────────┘   │
                        └─────────────────────────────────────────┘
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
- [ ] EC2 instance: **t3.medium** (2 vCPU, 4 GB RAM) — Ubuntu 22.04 LTS
- [ ] Docker and Docker Compose installed via user data / Ansible provisioning script
- [ ] Application containers started via `docker-compose.prod.yml` on instance launch
- [ ] Services running: `web` (Gunicorn), `nginx`, `celery_worker`, `celery_beat`
- [ ] Nginx configured as reverse proxy — forwards to Gunicorn on `127.0.0.1:8000`
- [ ] EC2 instance in a private subnet; ALB in public subnet
- [ ] Security group: EC2 accepts inbound only from ALB on port 80; outbound unrestricted

### AC-3: RDS PostgreSQL
- [ ] RDS instance: **db.t3.micro**, PostgreSQL 15, single-AZ (dev cost optimisation)
- [ ] Database instance in private subnet — not publicly accessible
- [ ] Security group: accepts inbound on port 5432 from EC2 security group only
- [ ] Automated backups enabled (7-day retention)
- [ ] `DATABASE_URL` injected into EC2 environment from Secrets Manager at deploy time
- [ ] `python manage.py migrate --all-tenants` runs as part of deployment

### AC-4: ElastiCache Redis
- [ ] ElastiCache cluster: **cache.t3.micro**, Redis 7, single-node (dev)
- [ ] In private subnet; security group accepts from EC2 only
- [ ] Used for: Django session cache, OTP state, Celery broker (`/0`), Celery result backend (`/2`)
- [ ] `REDIS_URL` injected from Secrets Manager

### AC-5: S3 Media Bucket
- [ ] S3 bucket created for media file storage (Arrival Notice attachments, documents)
- [ ] Bucket is private — no public access
- [ ] EC2 instance has IAM role with `s3:GetObject`, `s3:PutObject`, `s3:DeleteObject` on the bucket
- [ ] Django `DEFAULT_FILE_STORAGE` configured to use `storages.backends.s3boto3.S3Boto3Storage`
- [ ] Pre-signed URLs used for secure file downloads

### AC-6: HTTPS & Domain
- [ ] ALB with HTTPS listener (port 443)
- [ ] ACM SSL certificate provisioned for `dev.dfms.yourdomain.com` (or equivalent dev subdomain)
- [ ] HTTP (port 80) redirects to HTTPS
- [ ] Route 53 A record (or CNAME) pointing `dev.dfms.yourdomain.com` to ALB DNS name
- [ ] Tenant subdomains (`{tenant-slug}.dev.dfms.yourdomain.com`) resolve via wildcard DNS + ALB routing

### AC-7: SES Email
- [ ] AWS SES configured in dev mode (sandbox) for transactional email
- [ ] Dev team email addresses verified in SES sandbox for receiving OTP / invite emails
- [ ] Django `EMAIL_BACKEND` set to `django_ses.SESBackend`
- [ ] SES credentials injected from Secrets Manager

### AC-8: Deployment Pipeline (CI/CD to Dev)
- [ ] GitHub Actions workflow: `deploy-dev.yml` — triggers on merge to `develop` branch
- [ ] Deployment steps:
  1. Build Docker image and push to **ECR** (Elastic Container Registry)
  2. SSH into EC2 (via AWS SSM Session Manager — no open SSH port)
  3. Pull latest image from ECR
  4. Run `docker compose pull && docker compose up -d --no-deps web celery_worker celery_beat`
  5. Run `docker compose exec web python manage.py migrate --all-tenants`
  6. Run `docker compose exec web python manage.py collectstatic --noinput`
- [ ] Deployment completes in < 5 minutes
- [ ] Slack / notification on successful and failed deployments

### AC-9: Observability (Basic)
- [ ] **CloudWatch Logs** — application logs (`web`, `celery_worker`) streamed from Docker via `awslogs` log driver
- [ ] CloudWatch log groups: `/dfms/dev/web`, `/dfms/dev/celery`
- [ ] **CloudWatch Alarms**: CPU > 80% on EC2, RDS storage < 20% free — notify via SNS → email
- [ ] Deployment logs visible in GitHub Actions and CloudWatch

### AC-10: Access & Security
- [ ] No SSH port (22) open on EC2 — access via **AWS SSM Session Manager** only
- [ ] IAM roles used for all AWS service access (EC2 → S3, ECR, Secrets Manager, CloudWatch) — no IAM user keys on the instance
- [ ] All resources tagged: `Environment=dev`, `Project=DFMS`
- [ ] Dev environment URL and access instructions documented in `docs/aws-dev-env.md`

---

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| QA-02-1 | Terraform: VPC, subnets (public/private), IGW, NAT Gateway, route tables | DFS-042-1 | Pending |
| QA-02-2 | Terraform: Security groups (ALB, EC2, RDS, Redis) | DFS-042-2 | Pending |
| QA-02-3 | Terraform: RDS PostgreSQL (db.t3.micro, private subnet, automated backups) | DFS-042-3 | Pending |
| QA-02-4 | Terraform: ElastiCache Redis (cache.t3.micro, private subnet) | DFS-042-4 | Pending |
| QA-02-5 | Terraform: EC2 (t3.medium, IAM role, SSM access, user data bootstrap script) | DFS-042-5 | Pending |
| QA-02-6 | Terraform: ALB + HTTPS listener + ACM certificate + HTTP→HTTPS redirect | DFS-042-6 | Pending |
| QA-02-7 | Terraform: Route 53 — `dev.dfms.yourdomain.com` A record + wildcard tenant subdomain | DFS-042-7 | Pending |
| QA-02-8 | Terraform: S3 media bucket + IAM role policy (EC2 → S3) | DFS-042-8 | Pending |
| QA-02-9 | Terraform: ECR repository for DFMS Docker image | DFS-042-9 | Pending |
| QA-02-10 | Terraform: AWS Secrets Manager secrets (DB password, SECRET_KEY, SES credentials, Redis URL) | DFS-042-10 | Pending |
| QA-02-11 | Terraform: CloudWatch log groups + alarms + SNS notification topic | DFS-042-11 | Pending |
| QA-02-12 | `docker-compose.prod.yml` — Gunicorn command, `awslogs` log driver, env vars from Secrets Manager via `aws-env` or SSM parameter injection | DFS-042-12 | Pending |
| QA-02-13 | EC2 user data / Ansible script — Docker install, `docker-compose.prod.yml` deploy, SES + S3 config | DFS-042-13 | Pending |
| QA-02-14 | GitHub Actions `deploy-dev.yml` — build → ECR push → SSM deploy → migrate → collectstatic | DFS-042-14 | Pending |
| QA-02-15 | SES sandbox setup — verify dev team emails; configure Django `django-ses` backend | DFS-042-15 | Pending |
| QA-02-16 | Smoke test the deployed environment — API docs accessible, tenant onboarding works, OTP email received | DFS-042-16 | Pending |
| QA-02-17 | Write `docs/aws-dev-env.md` — architecture overview, how to access via SSM, how to trigger a deploy, log locations | DFS-042-17 | Pending |

---

## Environment Variables (AWS Dev)

| Variable | Source | Notes |
|----------|--------|-------|
| `SECRET_KEY` | Secrets Manager | Rotated; never in code |
| `DEBUG` | `False` | Set in `prod.py` |
| `DATABASE_URL` | Secrets Manager | Points to RDS endpoint |
| `REDIS_URL` | Secrets Manager | Points to ElastiCache endpoint |
| `AWS_STORAGE_BUCKET_NAME` | Secrets Manager | S3 media bucket name |
| `AWS_SES_REGION_NAME` | env / IaC | e.g. `ap-south-1` |
| `EMAIL_BACKEND` | `prod.py` | `django_ses.SESBackend` |
| `ALLOWED_HOSTS` | env | `*.dev.dfms.yourdomain.com` |
| `DJANGO_SETTINGS_MODULE` | env | `config.settings.prod` |

---

## Cost Estimate (Dev — Monthly)

| Resource | Type | Est. Cost/mo |
|----------|------|--------------|
| EC2 | t3.medium (on-demand) | ~$30 |
| RDS | db.t3.micro, 20 GB | ~$15 |
| ElastiCache | cache.t3.micro | ~$12 |
| ALB | per-hour + LCU | ~$18 |
| NAT Gateway | per-hour + data | ~$35 |
| S3 + ECR | minimal dev usage | ~$5 |
| CloudWatch | logs + alarms | ~$5 |
| **Total** | | **~$120/mo** |

> Cost can be reduced by stopping EC2 + RDS outside business hours via scheduled Lambda or Instance Scheduler.

---

## Dependencies

- **Requires**: INFRA-01 (Docker Compose stack), INFRA-05 (prod settings split, `docker-compose.prod.yml` base)
- **Enables**: QA-01 (Playwright E2E tests run against this environment in CI), Sprint 3 feature demos

## Definition of Done

- [ ] `terraform apply` provisions all AWS resources from scratch without errors
- [ ] Application accessible at `https://dev.dfms.yourdomain.com/api/docs/` returning 200
- [ ] Tenant subdomain routing works (e.g. `https://nourish.dev.dfms.yourdomain.com`)
- [ ] OTP email received in SES sandbox for login and invite flows
- [ ] File upload (Arrival Notice) stored in S3 and downloadable via pre-signed URL
- [ ] GitHub Actions `deploy-dev.yml` deploys successfully on push to `develop`
- [ ] CloudWatch logs streaming application output
- [ ] No SSH port open — SSM-only access confirmed
- [ ] `docs/aws-dev-env.md` written and reviewed
- [ ] All resources tagged `Environment=dev`, `Project=DFMS`
