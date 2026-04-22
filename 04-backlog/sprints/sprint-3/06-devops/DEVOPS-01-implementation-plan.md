# DEVOPS-01 — AWS Dev Environment: Implementation Plan

**Story**: DFS-042 · Sprint 3 · 8 story points  
**Region**: ap-south-1 (Mumbai)  
**Domain**: `*.dev.dfms.com`

---

## Architecture Summary

| Layer | Component | Notes |
|-------|-----------|-------|
| DNS | Route 53 wildcard A → Elastic IP | `*.dev.dfms.com`; $0.50/mo |
| TLS | ACM `*.dev.dfms.com` | Free, auto-renews |
| Proxy | Nginx (ports 80/443) | HTTP → HTTPS redirect; forwards to Gunicorn :8000 |
| App | Django / Gunicorn (Docker) | `django-tenants` multi-schema; prod settings |
| Workers | Celery worker + beat (Docker) | Redis DB 2 as broker |
| DB | `postgres:15-alpine` (Docker) | Named volume on EBS — no RDS for dev |
| Cache / Broker | `redis:7-alpine` (Docker) | DB 0=cache, 1=sessions, 2=Celery |
| Media | S3 private bucket | Pre-signed URLs; IAM role on EC2 |
| Email | AWS SES sandbox | `django-ses` backend; verified addresses only |
| Secrets | SSM Parameter Store (SecureString) | Fetched at boot — no `.env` files on disk |
| Logs | CloudWatch `awslogs` driver | `/dfms/dev/web`, `/dfms/dev/celery` |
| Scheduling | EventBridge | Stop 20:00 BDT, start 08:00 BDT Mon–Sat |

---

## Phase 1 — Terraform: Core Networking
**Sub-task**: DEVOPS-01-1 / DFS-042-1

1. Create `infra/` directory structure — `infra/envs/dev/main.tf`, `variables.tf`, `outputs.tf`; `infra/modules/` for reusable modules
2. Configure Terraform provider & backend — AWS provider ~> 5.x, region `ap-south-1`; S3 remote state bucket + DynamoDB lock table
3. Define VPC (`10.0.0.0/16`) — `enable_dns_support = true`, `enable_dns_hostnames = true`
4. Public subnet (`10.0.1.0/24`) in `ap-south-1a` — `map_public_ip_on_launch = true`
5. Internet Gateway + route table — route `0.0.0.0/0` → IGW; associate with public subnet
6. Tag all resources — `Environment=dev`, `Project=DFMS`, `Region=ap-south-1`

---

## Phase 2 — Terraform: Security Group
**Sub-task**: DEVOPS-01-2 / DFS-042-2

1. Create EC2 security group `dfms-dev-ec2-sg`
2. Inbound: 80 (HTTP) from `0.0.0.0/0` — public web traffic
3. Inbound: 443 (HTTPS) from `0.0.0.0/0` — public TLS traffic
4. Inbound: 22 (SSH) from team IP only — use `var.team_ips` cidr_blocks list, never `0.0.0.0/0`
5. Outbound: all traffic (`0.0.0.0/0`) — required for Docker pulls, SSM, ECR

---

## Phase 3 — Terraform: EC2 + Elastic IP + IAM Role
**Sub-task**: DEVOPS-01-3 / DFS-042-3

1. Create IAM instance role & instance profile — policies: `AmazonSSMManagedInstanceCore`, `CloudWatchAgentServerPolicy`, `AmazonEC2ContainerRegistryReadOnly`
2. Attach inline S3 policy to role — `s3:GetObject`, `s3:PutObject`, `s3:DeleteObject` on media bucket ARN
3. Provision EC2 t3.micro — AMI = Ubuntu 22.04 LTS (ap-south-1); `key_name = var.key_name`; `iam_instance_profile` = above
4. Allocate Elastic IP + attach to EC2 — `aws_eip` + `aws_eip_association` resources
5. Write user data bootstrap script — install Docker + Docker Compose, pull `docker-compose.dev-cloud.yml`, run `docker compose up -d`

---

## Phase 4 — Terraform: EventBridge Auto-Stop/Start
**Sub-task**: DEVOPS-01-4 / DFS-042-4

1. Create IAM role for EventBridge Scheduler — allow `scheduler.amazonaws.com` to call `ec2:StartInstances` + `ec2:StopInstances`
2. Schedule: stop at 20:00 BDT (14:00 UTC) Mon–Sat — `cron(0 14 ? * MON-SAT *)`
3. Schedule: start at 08:00 BDT (02:00 UTC) Mon–Sat — `cron(0 2 ? * MON-SAT *)`
4. Confirm Sunday: no start schedule (instance stays off) — saves ~65% EC2 cost post-free-tier

---

## Phase 5 — Terraform: ACM Cert + Route 53
**Sub-task**: DEVOPS-01-5 / DFS-042-5

1. Request ACM wildcard cert `*.dev.dfms.com` in `ap-south-1` — `validation_method = DNS`
2. Create Route 53 hosted zone for `dev.dfms.com` — or use existing; note $0.50/mo cost
3. Add ACM DNS validation CNAME records via Terraform — `aws_acm_certificate_validation` resource; wait for ISSUED status
4. Add Route 53 wildcard A record `*.dev.dfms.com` → Elastic IP — `type = A`, `ttl = 300`

---

## Phase 6 — Terraform: S3 Media Bucket + ECR
**Sub-task**: DEVOPS-01-6 & DEVOPS-01-7 / DFS-042-6 & DFS-042-7

1. Create private S3 bucket `dfms-dev-media` — `block_public_acls = true`, `block_public_policy = true`, `restrict_public_buckets = true`
2. Enable versioning on media bucket — optional but recommended for dev data resilience
3. Create ECR **public** repository — `aws_ecrpublic_repository`; avoids 500 MB private ECR limit during free tier (50 GB always-free)
4. Configure Django `DEFAULT_FILE_STORAGE` — `storages.backends.s3boto3.S3Boto3Storage`; `AWS_STORAGE_BUCKET_NAME` from SSM

---

## Phase 7 — Terraform: SSM Secrets + CloudWatch
**Sub-task**: DEVOPS-01-8 & DEVOPS-01-9 / DFS-042-8 & DFS-042-9

1. Store secrets in SSM Parameter Store (`SecureString`) — `/dfms/dev/SECRET_KEY`, `DATABASE_URL`, `REDIS_URL`, `AWS_STORAGE_BUCKET_NAME`, SES credentials
2. Create CloudWatch log groups — `/dfms/dev/web`, `/dfms/dev/celery`; retention 14 days
3. Create SNS topic `dfms-dev-alerts` — subscribe team email + Slack webhook (HTTP endpoint)
4. Create CloudWatch Alarms:
   - CPU > 75% for 5 min
   - 5xx error rate > 5/min (Nginx log metric filter)
   - Celery queue depth > 100 tasks pending

---

## Phase 8 — docker-compose.dev-cloud.yml
**Sub-task**: DEVOPS-01-10 / DFS-042-10

1. Services: `web` (Gunicorn), `celery_worker`, `celery_beat` — image pulled from ECR; `DJANGO_SETTINGS_MODULE=config.settings.prod`
2. Service: `nginx` — reverse proxy ports 80/443 → Gunicorn `127.0.0.1:8000`; mount Nginx config + ACM cert
3. Service: `postgres:15-alpine` — named volume `pgdata` for EBS persistence; `DATABASE_URL=postgres://...@postgres:5432/dfms_dev`
4. Service: `redis:7-alpine` — `maxmemory-policy allkeys-lru`; DB 0=cache, 1=sessions, 2=Celery
5. Log driver: `awslogs` for `web` + `celery` — `awslogs-group=/dfms/dev/web`, `awslogs-region=ap-south-1`
6. Named volumes: `pgdata`, `redisdata` — both on EBS root volume; persist across container restarts

---

## Phase 9 — EC2 User Data & Nginx Config
**Sub-task**: DEVOPS-01-11 / DFS-042-11

1. User data: install Docker + Docker Compose plugin — `apt-get install docker.io`; pull Compose v2 binary
2. User data: configure `awslogs` daemon or use Docker `awslogs` driver — ensure CloudWatch agent IAM permissions are in place
3. User data: copy `docker-compose.dev-cloud.yml` + env template from SSM/S3 — run `fetch-secrets.sh` to hydrate env at boot
4. User data: `docker compose up -d` — all 6 services start on boot
5. Nginx config: HTTP → HTTPS redirect (301) — `server { listen 80; return 301 https://$host$request_uri; }`
6. Nginx config: HTTPS reverse proxy to Gunicorn — `proxy_pass http://127.0.0.1:8000`; include `proxy_params`; TLS with ACM cert files

---

## Phase 10 — scripts/fetch-secrets.sh
**Sub-task**: DEVOPS-01-12 / DFS-042-12

1. Script fetches all `/dfms/dev/*` SSM SecureString params — `aws ssm get-parameters-by-path --with-decryption --path /dfms/dev/`
2. Exports each param as environment variable — `eval export KEY=VALUE` for each result
3. Script runs at EC2 boot (user data) and at CI deploy time — never writes plaintext values to disk; never stored in `.env` files

---

## Phase 11 — SES Sandbox Setup
**Sub-task**: DEVOPS-01-14 / DFS-042-14

1. Verify dev team email addresses in SES sandbox (`ap-south-1`) — AWS Console → SES → Verified identities; each dev clicks confirmation link
2. Install `django-ses` — `pip install django-ses`; add to `requirements.txt`
3. Configure Django `EMAIL_BACKEND = django_ses.SESBackend` — in `config/settings/prod.py`; `AWS_SES_REGION_NAME=ap-south-1`
4. Use EC2 IAM role for SES access (preferred) — avoids static credentials; role already has SES send permission

---

## Phase 12 — GitHub Actions deploy-dev.yml
**Sub-task**: DEVOPS-01-13 / DFS-042-13

1. Trigger: push / merge to `develop` branch — `on: push: branches: [develop]`
2. Stage 1: lint + unit tests — `ruff`, `mypy`, `pytest --no-migrations` (fast)
3. Stage 2: build Docker image + tag with git SHA — `docker build -t dfms-web:$SHA .`
4. Stage 3: push image to ECR public repo — `aws ecr-public get-login-password | docker login; docker push`
5. Stage 4: deploy to EC2 via SSM Run Command (no SSH key required) — `aws ssm send-command` → pull image, run `fetch-secrets.sh`, `docker compose up -d --no-deps web`
6. Stage 5: run migrations on EC2 — `manage.py migrate_schemas --shared`; `migrate_schemas --tenant`; `collectstatic --noinput`
7. Stage 6: health check — `curl -sf https://dev.dfms.com/health/` — rollback to previous ECR tag if non-200
8. Stage 7: restart workers — `docker compose up -d --no-deps celery_worker celery_beat`
9. Slack/SNS notification on success or failure — post to `dfms-dev-alerts` SNS topic; target: < 5 min total pipeline

---

## Phase 13 — Smoke Tests
**Sub-task**: DEVOPS-01-15 / DFS-042-15

1. `GET https://dev.dfms.com/health/` returns 200 — confirms Nginx + Gunicorn + DB connectivity
2. `GET https://nourish.dev.dfms.com` — `django-tenants` routes to correct schema; wildcard DNS + Host header routing working
3. `GET https://admin.dev.dfms.com` — platform admin login page loads; confirms public tenant schema routing
4. OTP login email received by verified SES inbox — trigger OTP flow; confirm email arrives end-to-end
5. File upload (Arrival Notice) stored in S3 + downloaded via pre-signed URL — confirms IAM role → S3 permissions and `django-storages` config
6. SSH access blocked from non-team IP; SSM Session Manager works — verify security group + SSM connectivity
7. CloudWatch log groups receiving entries from web + celery — `aws logs tail /dfms/dev/web --follow`

---

## Phase 14 — Documentation
**Sub-task**: DEVOPS-01-16 / DFS-042-16

1. Write `docs/aws-dev-env.md` — architecture diagram, region rationale, domain convention (`*.dev.dfms.com`)
2. Access instructions — how to SSH / SSM into EC2; who has access; how to request access
3. Deploy instructions — how to trigger deploy (merge to `develop`); how to monitor in Actions + CloudWatch
4. Log locations — `/dfms/dev/web`, `/dfms/dev/celery` in CloudWatch; Nginx logs on instance
5. Rollback procedure — re-tag previous ECR image as `latest`; re-run deploy workflow
6. Cost breakdown — ~$0.50/mo (free tier); ~$5.40/mo post-free-tier with auto-stop

---

## Cost Summary

| Resource | Free tier (12 mo) | Post free tier (with auto-stop) |
|----------|-------------------|--------------------------------|
| EC2 t3.micro | $0 (free tier) | ~$3.20 |
| EBS 20 GB GP3 | $0 (free tier) | ~$1.60 |
| S3 ~1 GB media | $0 (free tier) | ~$0.02 |
| ECR (public repo) | $0 always free | $0 |
| SES ≤500 emails | $0 (free tier) | ~$0.05 |
| CloudWatch | $0 always free | $0 |
| SSM / EventBridge / ACM | $0 always free | $0 |
| Route 53 (1 zone) | $0.50/mo | $0.50/mo |
| **Total** | **~$0.50/mo** | **~$5.40/mo** |

---

## Definition of Done

- [ ] `terraform apply` provisions all AWS resources from scratch without errors
- [ ] `https://dev.dfms.com/health/` returns 200
- [ ] Tenant subdomain routing works (e.g. `https://nourish.dev.dfms.com`)
- [ ] Platform admin accessible at `https://admin.dev.dfms.com`
- [ ] OTP email received in SES sandbox for login and invite flows
- [ ] File upload (Arrival Notice) stored in S3 + downloadable via pre-signed URL
- [ ] GitHub Actions `deploy-dev.yml` deploys successfully on merge to `develop`
- [ ] CloudWatch logs streaming from `/dfms/dev/web` and `/dfms/dev/celery`
- [ ] SSH restricted to team IP; SSM Session Manager access working as alternative
- [ ] Secrets confirmed sourced from SSM Parameter Store — no plaintext values on EC2
- [ ] `docs/aws-dev-env.md` written and reviewed
- [ ] All resources tagged `Environment=dev`, `Project=DFMS`, `Region=ap-south-1`
- [ ] EventBridge auto-stop confirmed: stops 20:00 BDT, starts 08:00 BDT Mon–Sat
- [ ] Monthly cost confirmed ≤$10/mo always-on, ≤$4/mo with auto-stop
