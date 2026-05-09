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

## Step 1 — Create an IAM User (never use root for operations)

1. AWS Console → IAM → User Groups → Create group `dfms-developers`
2. Attach the following policies to the group:

   | Policy | Type | How to attach |
   |--------|------|---------------|
   | `AmazonEC2ReadOnlyAccess` | AWS managed | Attach policies → search by name |
   | `CloudWatchReadOnlyAccess` | AWS managed | Attach policies → search by name |
   | `dfms-dev-s3-access` | Custom inline | Create inline policy → JSON tab (see below) |

   **Custom S3 policy JSON** (`dfms-dev-s3-access`):
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:GetObject",
           "s3:PutObject",
           "s3:DeleteObject",
           "s3:ListBucket"
         ],
         "Resource": [
           "arn:aws:s3:::dfms-dev-files",
           "arn:aws:s3:::dfms-dev-files/*"
         ]
       }
     ]
   }
   ```

   > **Policy name**: `dfms-dev-s3-access`  
   > **Description**: `S3 access for DFMS dev environment bucket dfms-dev-files. Allows read-write-delete on the dev media bucket only.`  
   > ⚠️ Description must not contain `/` or `()` — AWS will reject it with an "invalid characters" error.

   **Tags to add on the policy**:

   | Key | Value |
   |-----|-------|
   | `Project` | `DFMS` |
   | `Environment` | `dev` |

3. **Create your personal IAM user**:
   1. IAM → **Users** → **Create user**
   2. Username: e.g. `mahfuz` (your name, lowercase)
   3. Check **"Provide user access to the AWS Management Console"**
   4. Select **"I want to create an IAM user"**
   5. Set a password (or auto-generate and force reset on first login)
   6. Click **Next** → under "Add user to group" select `dfms-developers` → **Next**
   7. Add tags:

      | Key | Value |
      |-----|-------|
      | `Project` | `DFMS` |
      | `Environment` | `dev` |
      | `Owner` | `bs-team` |

   8. Click **Create user**
   9. **Download or copy the console sign-in URL** shown on the confirmation screen — it looks like:
      ```
      https://<account-id>.signin.aws.amazon.com/console
      ```

4. **Sign in as the IAM user from this point onwards**:
   1. Sign out of the root account
   2. Open the sign-in URL from above
   3. Enter your IAM username and password
   4. ✅ All future AWS work should be done from this IAM user — never the root account

---

## Step 2 — Launch EC2 Instance

1. EC2 → **Launch Instance**, name: `dfms-dev`
2. OS: **Ubuntu 24.04 LTS** (free tier eligible)
3. Instance type: **t2.micro** (free tier, first 12 months) or **t3.micro** (~$8.50/mo after free tier)
4. **Key pair**: Create new → download `.pem` file → save securely
5. **Security Group** — inbound rules:

   | Port | Protocol | Source | Purpose |
   |------|----------|--------|---------|
   | 22 | TCP | My IP only | SSH |
   | 80 | TCP | 0.0.0.0/0 | HTTP |
   | 443 | TCP | 0.0.0.0/0 | HTTPS |

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

## Step 3 — Assign Elastic IP (prevents IP change on restart)

1. EC2 → **Elastic IPs → Allocate Elastic IP**
2. Click **Associate** → select your `dfms-dev` instance
3. Note the IP — this is your permanent server address

> ⚠️ Elastic IP is **free while attached to a running instance**.  
> Release immediately if you terminate the instance to avoid $0.005/hr idle charge.

---

## Step 4 — Set Up Auto-Stop Schedule (saves ~70% cost)

Use EventBridge Scheduler to stop the instance outside working hours.

1. Go to **EventBridge → Scheduler → Create schedule**
2. Create two schedules:

   | Name | Cron (UTC) | Action | BDT time |
   |------|-----------|--------|---------|
   | `dfms-dev-stop` | `cron(0 15 ? * MON-SAT *)` | Stop EC2 | 9 PM |
   | `dfms-dev-start` | `cron(0 2 ? * MON-SAT *)` | Start EC2 | 8 AM |

> EventBridge Scheduler is always free (up to 14 million invocations/month).

---

## Step 5 — SSH In and Install Docker

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

## Step 6 — Set Up Secrets via AWS SSM (not .env files)

**Never store secrets in a `.env` file on the EC2 instance.** Use SSM Parameter Store (free tier).

```bash
# Run these from your local machine (with AWS CLI configured)
aws ssm put-parameter --name "/dfms/dev/SECRET_KEY"   --value "your-secret-key"  --type SecureString
aws ssm put-parameter --name "/dfms/dev/DB_PASSWORD"  --value "your-db-password" --type SecureString
aws ssm put-parameter --name "/dfms/dev/REDIS_URL"    --value "redis://redis:6379/0" --type SecureString
```

The EC2 instance reads these at runtime via its IAM Instance Role — no long-lived access keys needed.

---

## Step 7 — Clone Repo and Configure Environment

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

## Step 8 — Start All Services

```bash
# Build and start all containers
docker compose up -d --build

# Verify all containers are running
docker compose ps
```

Expected containers: `db`, `redis`, `web`, `celery_worker`, `celery_beat`, `nginx`

---

## Step 9 — Verify Deployment

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

## Step 10 — (Optional) Set Up Domain & SSL

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
