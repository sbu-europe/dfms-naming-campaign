# AWS Dev Environment Setup Guide

> Step-by-step guide to deploy the DFMS Cloud DEV environment on AWS.  
> Target: internal testing only, ≤20 testers, minimum cost.

**Last Updated**: May 8, 2026  
**Environment**: Cloud DEV (`dev.dfms.com`)  
**Region**: us-east-2 (Ohio)  
**Estimated Cost**: ~$0.50/month (year 1 free tier) · ~$5.40/month (year 2+)

---

## Before Anything Else — Billing Safeguards

> ⚠️ Complete all 5 steps below **before creating any AWS resource**.  
> See [aws-billing-safeguards.md](./aws-billing-safeguards.md) for full details.

### 1. Enable MFA on Root Account

```
AWS Console → Root user → Security credentials → MFA device
```

- Use an authenticator app (not SMS)
- Store recovery codes in a password manager
- Never use root for day-to-day operations

### 2. Create Billing Alerts

```
AWS Console → Billing → Budgets → Create budget
```

| Budget | Amount | Alert at |
|--------|--------|----------|
| Monthly total | $200 | 80% ($160) and 100% |
| EC2 only | $80 | 90% ($72) |

### 3. Enable Cost Explorer

```
AWS Console → Billing → Cost Explorer → Enable
```

*(Takes 24h to activate after first enable.)*

### 4. Enable Cost Anomaly Detection

```
AWS Console → Billing → Cost Anomaly Detection → Create monitor
```

Alert if > $20 spike from baseline.

### 5. Activate IAM Billing Access

```
AWS Console → Root account → Account → IAM user and role access to Billing → Activate
```

---

## Step 1 — Identity & Access (SSO — no IAM user needed)

This AWS account uses **IAM Identity Center (SSO)** for access management. Creating IAM users and access keys is explicitly denied by the org policy.

**You are already signed in correctly** via SSO (`Mahfuzur.rahman@brainstation-23.com`). No further identity setup is needed.

### Your SSO permission set (`AWS-Security-Guardian-DFMS`) grants:

| Service | Access | Scope |
|---------|--------|-------|
| EC2 | ✅ Full (`ec2:*`) | us-east-2 only |
| S3 | ✅ Full (`s3:*`) | us-east-2 only |
| SSM Parameter Store | ✅ Full (`ssm:*`) | us-east-2 only |
| ACM (SSL certs) | ✅ Full (`acm:*`) | us-east-2 only |
| CloudWatch / Logs | ✅ Full | us-east-2 only |
| SES (email) | ✅ Full (`ses:*`) | us-east-2 only |
| EventBridge Scheduler | ✅ Full (`scheduler:*`) | us-east-2 only |
| Route 53 | ✅ Full | Global |
| IAM (roles, policies, groups) | ✅ Full | Global |
| ECR Public | ✅ Full | Global |

### What is blocked by org policy:

| Action | Reason |
|--------|--------|
| `iam:CreateUser` | Explicitly denied — use SSO instead |
| `iam:CreateAccessKey` | Explicitly denied — no long-lived credentials |
| Any service **outside us-east-2** (except global) | Region-locked by org policy |

> ✅ Everything needed for this dev environment setup is available. Proceed to Step 2.

---

## Step 2 — Create Security Group (before launching instance)

Create the security group first so you can select it during instance launch.

1. Go to **EC2 → Security Groups** (left sidebar under "Network & Security") → **Create security group**
2. Fill in:
   - **Security group name**: `dfms-dev-sg`
   - **Description**: `DFMS dev server - SSH, HTTP, HTTPS`
   - **VPC**: Default VPC
3. **Inbound rules** — add the following:

   | Type | Protocol | Port | Source | Why |
   |------|----------|------|--------|-----|
   | SSH | TCP | 22 | **My IP** (select from dropdown) | SSH — restricted to your IP only |
   | HTTP | TCP | 80 | 0.0.0.0/0 | Web traffic |
   | HTTPS | TCP | 443 | 0.0.0.0/0 | HTTPS (for later) |

   > ⚠️ For SSH always select **"My IP"** from the dropdown — never `0.0.0.0/0`. This prevents brute-force attacks on port 22.

   > ⚠️ **If your IP changes** later (different office/home network): come back here → Edit inbound rules → update the SSH source to your new IP.

4. **Tags**:

   | Key | Value |
   |-----|-------|
   | `Project` | `DFMS` |
   | `Environment` | `dev` |
   | `Owner` | `bs-team` |

5. Click **Create security group**

---

## Step 3 — Launch EC2 Instance

1. EC2 → **Launch Instance**, name: `dfms-dev`
2. OS: **Ubuntu 24.04 LTS** (free tier eligible)
3. Instance type: **t2.micro** (free tier, first 12 months) or **t3.micro** (~$8.50/mo after free tier)
4. **Key pair**: Create new key pair:
   1. Click **"Create new key pair"**
   2. **Key pair name**: `dfms-dev-key`
   3. **Key pair type**: `RSA`
   4. **Private key file format**:
      - `.pem` — if you will SSH from **Mac/Linux** (recommended)
      - `.ppk` — if you will SSH from **Windows using PuTTY**
   5. Click **Create key pair** — the `.pem` file downloads automatically
   6. **Save it securely** — you cannot download it again:
      ```bash
      # Create ~/.ssh folder if it doesn't exist
      mkdir -p ~/.ssh
      chmod 700 ~/.ssh

      # Move to your SSH folder and lock permissions
      mv ~/Downloads/dfms-dev-key.pem ~/.ssh/
      chmod 400 ~/.ssh/dfms-dev-key.pem
      ```
   > ⚠️ If you lose this file you will lose SSH access. Keep a backup in a secure location (e.g. 1Password).

   > ⚠️ **macOS note**: `mv` from Downloads may fail due to macOS privacy protection. Use Finder instead: `Cmd+Shift+G` → type `~/.ssh` → drag the file in. Then run `chmod 400 ~/.ssh/dfms-dev-key.pem`.

5. **Network settings**:
   - **VPC**: Default VPC
   - **Subnet**: Any default public subnet (e.g. `us-east-2a`)
   - **Auto-assign public IP**: **Enable**
   - **Firewall**: Select **"Select existing security group"** → choose `dfms-dev-sg`

6. Storage: **20 GB gp3**
7. **Tags** — add at creation for cost tracking:

   | Key | Value |
   |-----|-------|
   | `Project` | `DFMS` |
   | `Environment` | `dev` |
   | `Owner` | `bs-team` |
   | `ManagedBy` | `manual` |

8. Click **Launch**

---

## Step 4 — Assign Elastic IP (prevents IP change on restart)

1. EC2 → **Elastic IPs → Allocate Elastic IP**
2. Click **Associate** → select your `dfms-dev` instance
3. Note the IP — this is your permanent server address

> ⚠️ Elastic IP is **free while attached to a running instance**.  
> Release immediately if you terminate the instance to avoid $0.005/hr idle charge.

---

## Step 5 — Set Up Auto-Stop Schedule (saves ~70% cost)

Use EventBridge Scheduler to stop the instance outside working hours.

1. Go to **EventBridge → Scheduler → Create schedule**
2. Create two schedules:

   | Name | Cron (UTC) | Action | BDT time |
   |------|-----------|--------|---------|
   | `dfms-dev-stop` | `cron(0 15 ? * MON-SAT *)` | Stop EC2 | 9 PM |
   | `dfms-dev-start` | `cron(0 2 ? * MON-SAT *)` | Start EC2 | 8 AM |

> EventBridge Scheduler is always free (up to 14 million invocations/month).

---

## Step 6 — SSH In and Install Docker

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@<ELASTIC_IP>

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker ubuntu
newgrp docker

# Install Docker Compose plugin
sudo apt-get install -y docker-compose-plugin

# Verify
docker --version
docker compose version
```

---

## Step 7 — Set Up Secrets via AWS SSM (not .env files)

**Never store secrets in a `.env` file on the EC2 instance.** Use SSM Parameter Store (free tier).

```bash
# Run these from your local machine (with AWS CLI configured)
aws ssm put-parameter --name "/dfms/dev/SECRET_KEY"   --value "your-secret-key"  --type SecureString
aws ssm put-parameter --name "/dfms/dev/DB_PASSWORD"  --value "your-db-password" --type SecureString
aws ssm put-parameter --name "/dfms/dev/REDIS_URL"    --value "redis://redis:6379/0" --type SecureString
```

The EC2 instance reads these at runtime via its IAM Instance Role — no long-lived access keys needed.

---

## Step 8 — Clone Repo and Configure Environment

```bash
git clone <repo-url> /home/ubuntu/nourish-backend
cd /home/ubuntu/nourish-backend

# Copy and configure non-secret environment variables
cp .env.example .env
nano .env
```

Key `.env` values to set:

```bash
DEBUG=False
DJANGO_ALLOWED_HOSTS=.dev.dfms.com          # or your Elastic IP for quick start
TENANT_DOMAIN_BASE=dev.dfms.com
SESSION_COOKIE_DOMAIN=.dev.dfms.com
CSRF_COOKIE_DOMAIN=.dev.dfms.com
```

> **Note**: PostgreSQL and Redis run in Docker on the same EC2 (no RDS, no ElastiCache for dev).  
> This mirrors the existing `docker-compose.yml` setup — no new config needed.

---

## Step 9 — Start All Services

```bash
# Build and start all containers
docker compose up -d --build

# Verify all containers are running
docker compose ps
```

Expected containers: `db`, `redis`, `web`, `celery_worker`, `celery_beat`, `nginx`

---

## Step 10 — Verify Deployment

```bash
# Health check
curl http://localhost:8000/api/health/

# Watch logs
docker compose logs -f web
docker compose logs -f celery_worker
```

Access from browser:
- API: `http://<ELASTIC_IP>/api/v1/`
- Admin: `http://<ELASTIC_IP>/admin/`

---

## Step 11 — (Optional) Set Up Domain & SSL

From the [domain strategy](./aws-deployment-strategy.md#4-domain--subdomain-strategy):

1. **Route 53**: Add a hosted zone for your domain → Create wildcard A record:
   ```
   *.dev.dfms.com  →  <Elastic IP>
   ```
2. **ACM**: Request a wildcard TLS certificate `*.dev.dfms.com` (free, auto-renews)
3. Update Nginx config to serve HTTPS and reference the ACM cert

> Route 53 hosted zone costs **$0.50/month** — this is the only non-free cost in year 1.

---

## Cost Summary

| Period | Configuration | Monthly Cost |
|--------|--------------|-------------|
| Year 1 | t2.micro free tier + auto-stop | **~$0.50** (Route 53 only) |
| Year 2+ | t3.micro + auto-stop (08:00–20:00 BDT) | **~$5.40** |
| Year 2+ | t3.micro running 24/7 | **~$15** |

See [aws-cost-estimation.md](./aws-cost-estimation.md) for full breakdown.

---

## Day-to-Day Operations

### Stop/Start Instance Manually

```bash
# Stop (no compute charge while stopped)
aws ec2 stop-instances --instance-ids <instance-id>

# Start
aws ec2 start-instances --instance-ids <instance-id>
```

Or use **EC2 Console → Instance State → Stop/Start**.

### View Logs

```bash
ssh -i your-key.pem ubuntu@<ELASTIC_IP>
cd /home/ubuntu/nourish-backend
docker compose logs -f
```

### Redeploy After a Code Change

```bash
git pull
docker compose up -d --build web
```

---

## Promoting to QA / Staging

When ready to move beyond dev, the changes are minimal:

1. Swap Docker Postgres → **RDS** (change `DB_HOST` in SSM)
2. Swap Docker Redis → **ElastiCache** (change `REDIS_URL` in SSM)
3. Upgrade instance to **t3.small** (QA) or **t3.medium** (STG)
4. Add **Route 53 DNS** + **ACM SSL** for the new environment

See [aws-deployment-strategy.md](./aws-deployment-strategy.md) for full environment specs and the release pipeline.

---

## Related Documents

- [AWS Deployment Strategy](./aws-deployment-strategy.md) — full environment overview, release pipeline, secrets, monitoring
- [Billing Safeguards](./aws-billing-safeguards.md) — cost controls, anomaly detection, common billing mistakes
- [Cost Estimation](./aws-cost-estimation.md) — detailed per-environment cost breakdown and growth projections
- [Scalability Plan](./aws-scalability-plan.md) — Phase 2 growth path
- [Phase 1 Deployment Plan](./phase-1-deployment.md) — infrastructure overview
