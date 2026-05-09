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

1. EC2 → **Launch Instance**
   - **Name**: `dfms-dev`
   - **Additional tags** (click "Add additional tags" next to the name field):

     | Key | Value | Resource types |
     |-----|-------|----------------|
     | `Project` | `DFMS` | Instances, Volumes |
     | `Environment` | `dev` | Instances, Volumes |
     | `Owner` | `bs-team` | Instances, Volumes |
     | `ManagedBy` | `manual` | Instances, Volumes |

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

   > **Why 20 GB?** The default 8 GB fills up quickly once Docker images are pulled (PostgreSQL + Redis + Django alone use ~4–5 GB uncompressed). Estimated usage breakdown:
   >
   > | Item | Approx size |
   > |------|-------------|
   > | Ubuntu OS | ~3 GB |
   > | Docker engine + images | ~5–8 GB |
   > | PostgreSQL data (dev) | ~1–2 GB |
   > | Redis + app code + logs | ~1 GB |
   > | **Total** | **~10–14 GB** |
   >
   > Cost difference: 8 GB (~$0.64/mo) vs 20 GB (~$1.60/mo) — only **~$1/month more**. Keep 20 GB to avoid the instance crashing silently when disk fills up.
7. **File system**: Leave empty (EFS not needed — EBS root volume is sufficient for a single instance)
8. Click **Launch**

---

## Step 4 — Assign Elastic IP (prevents IP change on restart)

1. Go to **EC2 → Elastic IPs** (left sidebar under "Network & Security")
2. Click **Allocate Elastic IP address** → leave all defaults → click **Allocate**
3. Select the newly allocated IP → click **Actions → Associate Elastic IP address**
4. Fill in the association form:

   | Field | Value |
   |-------|-------|
   | **Resource type** | Instance |
   | **Instance** | Select `dfms-dev` from the dropdown |
   | **Private IP address** | Leave empty (auto-selects primary private IP) |
   | **Allow reassociation** | Leave unchecked |

5. Click **Associate**
6. Note down the Elastic IP — this is your permanent server address (e.g. `52.14.186.237`)

> ⚠️ Elastic IP is **free while attached to a running instance**.  
> Release immediately if you terminate the instance to avoid $0.005/hr idle charge.

---

## Step 5 — Set Up Auto-Stop Schedule (saves ~70% cost)

Automatically stop the instance outside working hours using EventBridge Scheduler. You need to create two schedules — one to stop, one to start.

> EventBridge Scheduler is always free (up to 14 million invocations/month).

### 5a — Create IAM Role for EventBridge Scheduler (do this first)

EventBridge Scheduler needs an IAM role to call EC2 stop/start on your behalf. "Create new role" is disabled due to org policy — create it manually first.

1. Open a new tab → **IAM → Roles → Create role**
2. **Trusted entity type**: **Custom trust policy**
3. Replace the JSON with:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": {
           "Service": "scheduler.amazonaws.com"
         },
         "Action": "sts:AssumeRole"
       }
     ]
   }
   ```
4. Click **Next** — skip adding permissions for now (click **Next** again)
5. **Role name**: `dfms-eventbridge-ec2-scheduler`
6. **Description**: `Allows EventBridge Scheduler to stop and start the DFMS dev EC2 instance on a schedule.`
7. **Tags**:

   | Key | Value |
   |-----|-------|
   | `Project` | `DFMS` |
   | `Environment` | `dev` |

8. Click **Create role**
9. Find the role → click it → **Permissions** tab → **Add permissions → Create inline policy** → JSON tab → paste:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Effect": "Allow",
       "Action": [
         "ec2:StopInstances",
         "ec2:StartInstances"
       ],
       "Resource": "arn:aws:ec2:us-east-2:725726881071:instance/i-082874e95d9ff833b"
     }]
   }
   ```
10. **Policy name**: `dfms-ec2-stop-start` → **Create policy**

---

### 5b — Create the Stop Schedule

1. Go to **Amazon EventBridge → Scheduler → Schedules → Create schedule**
2. **Schedule name**: `dfms-dev-stop`
3. **Description**: `Stop the DFMS dev EC2 instance at end of office hours - 10PM BDT Mon-Fri`
4. **Schedule group**: default
5. **Schedule type**: Recurring schedule → **Cron-based**
6. **Timezone**: `Asia/Dhaka`
7. **Cron expression** — enter each field separately:

   | Field | Value |
   |-------|-------|
   | Minutes | `0` |
   | Hours | `22` |
   | Day of month | `?` |
   | Month | `*` |
   | Day of the week | `2-6` |
   | Year | `*` |

   > Runs at 22:00 BDT (10:00 PM), Monday–Friday.  
   > ⚠️ **Day of month must be `?`** when specifying Day of week. In AWS EventBridge: `1=SUN, 2=MON, 3=TUE, 4=WED, 5=THU, 6=FRI, 7=SAT`.

8. **Flexible time window**: Off
9. Click **Next**
10. **Target**: AWS service → **Amazon EC2** → `StopInstances`
11. **Instance IDs**: `i-082874e95d9ff833b`
12. **Execution role**: **Use existing role** → select `dfms-eventbridge-ec2-scheduler`
13. Click **Next** → review → **Create schedule**

### 5c — Create the Start Schedule

Repeat the same steps with:
- **Schedule name**: `dfms-dev-start`
- **Description**: `Start the DFMS dev EC2 instance at start of office hours - 11AM BDT Mon-Fri`
- **Timezone**: `Asia/Dhaka`
- **Cron expression**:

  | Field | Value |
  |-------|-------|
  | Minutes | `0` |
  | Hours | `11` |
  | Day of month | `?` |
  | Month | `*` |
  | Day of the week | `2-6` |
  | Year | `*` |

  > Runs at 11:00 BDT (11:00 AM), Monday–Friday.

- **Target**: Amazon EC2 → `StartInstances`
- **Execution role**: `dfms-eventbridge-ec2-scheduler` (same role)

### Schedule summary

| Schedule | Timezone | Cron | BDT time | Action |
|----------|----------|------|---------|--------|
| `dfms-dev-stop` | `Asia/Dhaka` | `0 22 ? * 2-6 *` | 10:00 PM | Stop EC2 |
| `dfms-dev-start` | `Asia/Dhaka` | `0 11 ? * 2-6 *` | 11:00 AM | Start EC2 |

> ⚠️ The instance is **off on weekends**. Start it manually from EC2 console if needed on Saturday/Sunday.

---

## Step 6 — SSH In and Install Docker

### 6a — On your local Mac (Terminal)

```bash
# Fix key permissions (run once, required before SSH will work)
chmod 400 ~/.ssh/dfms-dev-key.pem

# SSH into the EC2 instance
ssh -i ~/.ssh/dfms-dev-key.pem ubuntu@<ELASTIC_IP>
```

Replace `<ELASTIC_IP>` with your Elastic IP (e.g. `52.14.186.237`).

### 6b — On the EC2 instance (after SSH connects)

```bash
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
