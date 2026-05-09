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


| Budget        | Amount | Alert at            |
| ------------- | ------ | ------------------- |
| Monthly total | $200   | 80% ($160) and 100% |
| EC2 only      | $80    | 90% ($72)           |


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


| Service                       | Access                 | Scope          |
| ----------------------------- | ---------------------- | -------------- |
| EC2                           | ✅ Full (`ec2:`*)       | us-east-2 only |
| S3                            | ✅ Full (`s3:*`)        | us-east-2 only |
| SSM Parameter Store           | ✅ Full (`ssm:*`)       | us-east-2 only |
| ACM (SSL certs)               | ✅ Full (`acm:*`)       | us-east-2 only |
| CloudWatch / Logs             | ✅ Full                 | us-east-2 only |
| SES (email)                   | ✅ Full (`ses:*`)       | us-east-2 only |
| EventBridge Scheduler         | ✅ Full (`scheduler:*`) | us-east-2 only |
| Route 53                      | ✅ Full                 | Global         |
| IAM (roles, policies, groups) | ✅ Full                 | Global         |
| ECR Public                    | ✅ Full                 | Global         |


### What is blocked by org policy:


| Action                                            | Reason                                        |
| ------------------------------------------------- | --------------------------------------------- |
| `iam:CreateUser`                                  | Explicitly denied — use SSO instead           |
| `iam:CreateAccessKey`                             | Explicitly denied — no long-lived credentials |
| Any service **outside us-east-2** (except global) | Region-locked by org policy                   |


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

  | Type  | Protocol | Port | Source                           | Why                              |
  | ----- | -------- | ---- | -------------------------------- | -------------------------------- |
  | SSH   | TCP      | 22   | **My IP** (select from dropdown) | SSH — restricted to your IP only |
  | HTTP  | TCP      | 80   | 0.0.0.0/0                        | Web traffic                      |
  | HTTPS | TCP      | 443  | 0.0.0.0/0                        | HTTPS (for later)                |

  > ⚠️ For SSH always select **"My IP"** from the dropdown — never `0.0.0.0/0`. This prevents brute-force attacks on port 22.
  > ⚠️ **If your IP changes** later (different office/home network): come back here → Edit inbound rules → update the SSH source to your new IP.
4. **Tags**:

  | Key           | Value     |
  | ------------- | --------- |
  | `Project`     | `DFMS`    |
  | `Environment` | `dev`     |
  | `Owner`       | `bs-team` |

5. Click **Create security group**

---

## Step 3 — Launch EC2 Instance

1. EC2 → **Launch Instance**
  - **Name**: `dfms-dev`
  - **Additional tags** (click "Add additional tags" next to the name field):

    | Key           | Value     | Resource types     |
    | ------------- | --------- | ------------------ |
    | `Project`     | `DFMS`    | Instances, Volumes |
    | `Environment` | `dev`     | Instances, Volumes |
    | `Owner`       | `bs-team` | Instances, Volumes |
    | `ManagedBy`   | `manual`  | Instances, Volumes |

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
    ⚠️ If you lose this file you will lose SSH access. Keep a backup in a secure location (e.g. 1Password).
    ⚠️ **macOS note**: `mv` from Downloads may fail due to macOS privacy protection. Use Finder instead: `Cmd+Shift+G` → type `~/.ssh` → drag the file in. Then run `chmod 400 ~/.ssh/dfms-dev-key.pem`.
5. **Network settings**:
  - **VPC**: Default VPC
  - **Subnet**: Any default public subnet (e.g. `us-east-2a`)
  - **Auto-assign public IP**: **Enable**
  - **Firewall**: Select **"Select existing security group"** → choose `dfms-dev-sg`
6. Storage: **20 GB gp3**
  > **Why 20 GB?** The default 8 GB fills up quickly once Docker images are pulled (PostgreSQL + Redis + Django alone use ~4–5 GB uncompressed). Estimated usage breakdown:
  >
  >
  > | Item                    | Approx size   |
  > | ----------------------- | ------------- |
  > | Ubuntu OS               | ~3 GB         |
  > | Docker engine + images  | ~5–8 GB       |
  > | PostgreSQL data (dev)   | ~1–2 GB       |
  > | Redis + app code + logs | ~1 GB         |
  > | **Total**               | **~10–14 GB** |
  >
  >
  > Cost difference: 8 GB (~~$0.64/mo) vs 20 GB (~~$1.60/mo) — only **~$1/month more**. Keep 20 GB to avoid the instance crashing silently when disk fills up.
7. **File system**: Leave empty (EFS not needed — EBS root volume is sufficient for a single instance)
8. Click **Launch**

---

## Step 4 — Assign Elastic IP (prevents IP change on restart)

1. Go to **EC2 → Elastic IPs** (left sidebar under "Network & Security")
2. Click **Allocate Elastic IP address** → leave all defaults → click **Allocate**
3. Select the newly allocated IP → click **Actions → Associate Elastic IP address**
4. Fill in the association form:

  | Field                   | Value                                         |
  | ----------------------- | --------------------------------------------- |
  | **Resource type**       | Instance                                      |
  | **Instance**            | Select `dfms-dev` from the dropdown           |
  | **Private IP address**  | Leave empty (auto-selects primary private IP) |
  | **Allow reassociation** | Leave unchecked                               |

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

  | Key           | Value  |
  | ------------- | ------ |
  | `Project`     | `DFMS` |
  | `Environment` | `dev`  |

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

  | Field           | Value |
  | --------------- | ----- |
  | Minutes         | `0`   |
  | Hours           | `22`  |
  | Day of month    | `?`   |
  | Month           | `*`   |
  | Day of the week | `2-6` |
  | Year            | `*`   |

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

  | Field           | Value |
  | --------------- | ----- |
  | Minutes         | `0`   |
  | Hours           | `11`  |
  | Day of month    | `?`   |
  | Month           | `*`   |
  | Day of the week | `2-6` |
  | Year            | `*`   |

  > Runs at 11:00 BDT (11:00 AM), Monday–Friday.
- **Target**: Amazon EC2 → `StartInstances`
- **Execution role**: `dfms-eventbridge-ec2-scheduler` (same role)

### Schedule summary


| Schedule         | Timezone     | Cron             | BDT time | Action    |
| ---------------- | ------------ | ---------------- | -------- | --------- |
| `dfms-dev-stop`  | `Asia/Dhaka` | `0 22 ? * 2-6 `* | 10:00 PM | Stop EC2  |
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

### 6c — Add Swap Space (required for t2.micro / t3.micro)

> ⚠️ **Critical for small instances.** t2.micro has only 1GB RAM. Running Docker containers + migrations simultaneously will trigger an **Out of Memory (OOM) kill**, crashing processes silently. Swap prevents this.

#### What is swap?

Swap is disk space that acts as overflow RAM when physical memory runs out:

```
Without swap — RAM fills up:
  OOM Killer activates → kills random processes → 502 errors, crashes

With swap — RAM fills up:
  Overflow spills to disk (slow but prevents crashes)
  Idle data moves to swap, active processes stay in RAM
```

| | RAM | Swap |
|---|---|---|
| Speed | ~10 ns (fast) | ~100,000 ns (slow — disk) |
| Prevents crashes | ✅ | ✅ |
| Best for | Active processes | Overflow buffer only |

Swap is **not a replacement for RAM** — it prevents crashes but operations will be slow when actively using it. For a comfortable dev experience, **t3.small (2GB RAM) is strongly recommended**.

#### Set up 2GB swap

```bash
# Create 2GB swap file
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent across reboots
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify — should show Swap: 2.0G
free -h
```

#### Still hitting OOM after swap?

`docker compose up --build` for multiple services simultaneously spikes memory during the build phase. **Build one service at a time** to spread the memory load:

```bash
docker compose up -d --build web
sleep 15
docker compose up -d --build celery_worker
sleep 10
docker compose up -d --build celery_beat
```

#### Increase swap to 4GB if needed

```bash
sudo swapoff /swapfile
sudo fallocate -l 4G /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
free -h
```

#### Recommended upgrade

| Instance | RAM | Swap | Effective | Monthly (with auto-stop) | Verdict |
|---|---|---|---|---|---|
| t2.micro | 1GB | 2GB | 3GB | ~$0 (free tier yr 1) | Usable with care |
| t2.micro | 1GB | 4GB | 5GB | ~$0 (free tier yr 1) | More headroom |
| **t3.small** | **2GB** | **2GB** | **4GB** | **~$8** | **Recommended** |
| t3.medium | 4GB | — | 4GB | ~$15 | Comfortable |

> Upgrade path: AWS Console → EC2 → Stop instance → Change instance type → Start instance. No data loss, same Elastic IP.

---

## Step 7 — Clone Repo on EC2

The repo is private — you need to authenticate to clone it. Use a GitHub Personal Access Token (PAT).

### 7a — Generate a GitHub PAT (on your local Mac)

1. Go to **GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)**
2. Click **Generate new token (classic)**
3. **Name**: `dfms-dev-ec2`
4. **Expiration**: 90 days
5. **Scopes**: check `repo` only
6. Click **Generate token** → copy the token immediately (shown only once)

### 7b — Clone the repo (on EC2)

```bash
# SSH into EC2
ssh -i ~/.ssh/dfms-dev-key.pem ubuntu@52.14.186.237

# Clone using PAT
git clone https://<YOUR_GITHUB_USERNAME>:<YOUR_PAT>@github.com/sbu-europe/nourish-backend.git /home/ubuntu/nourish-backend

cd /home/ubuntu/nourish-backend
exit
```

> ⚠️ The PAT is embedded in the clone URL above — it will be saved in `.git/config`. Clear it after cloning if needed:
>
> ```bash
> git remote set-url origin https://github.com/sbu-europe/nourish-backend.git
> ```

---

## Step 8 — Copy Environment Variables to EC2

> **Dev approach**: Copy `.env` directly to the server using `scp`.  
> The app uses `python-decouple` which reads the `.env` file directly — no extra setup needed.

### 8a — Fill in .env with real values (on your local Mac)

Make sure your local `.env` has all real values filled in — especially:

```bash
SECRET_KEY=    # generate: python3 -c "import secrets; print(secrets.token_urlsafe(50))"
DB_PASSWORD=   # choose a strong password
DEBUG=False
DJANGO_SETTINGS_MODULE=config.settings.production
```

> The local `.env` keeps `ALLOWED_HOSTS` and `BASE_DOMAIN` set for local development (`dfms.com`). You will override these on the EC2 instance in the next step.

### 8b — Copy .env to EC2

```bash
# Run from repo root on your local Mac
scp -i ~/.ssh/dfms-dev-key.pem .env ubuntu@52.14.186.237:/home/ubuntu/nourish-backend/.env
```

Verify it was copied:

```bash
ssh -i ~/.ssh/dfms-dev-key.pem ubuntu@52.14.186.237 "head -5 /home/ubuntu/nourish-backend/.env"
```

> ⚠️ **Security warning**: The `.env` file will sit on the EC2 disk. Anyone with SSH access to the server can read it. Acceptable for a small internal dev team — **do not use this approach for staging or production.**

> ⚠️ Never commit `.env` to git — it is already in `.gitignore`.

### 8c — Update EC2-specific values on the instance

After copying, SSH in and override the values that differ from local:

```bash
ssh -i ~/.ssh/dfms-dev-key.pem ubuntu@52.14.186.237
nano /home/ubuntu/nourish-backend/.env
```

Update these lines:

```bash
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,52.14.186.237,.dev.dfms.securityguardian.xyz
BASE_DOMAIN=dev.dfms.securityguardian.xyz
TENANT_DOMAIN_PORT=
TENANT_DOMAIN_SCHEME=http
```

Save (`Ctrl+O`, `Enter`, `Ctrl+X`).

| Variable | Local value | EC2 value | Why |
|---|---|---|---|
| `DEBUG` | `True` | `False` | Prevents stack traces leaking to users, enables Django security checks, avoids memory leak from query logging |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1,.dfms.com` | `localhost,127.0.0.1,52.14.186.237,.dev.dfms.securityguardian.xyz` | Wildcard covers all tenant subdomains under `dev.dfms.*` |
| `BASE_DOMAIN` | `dfms.com` | `dev.dfms.securityguardian.xyz` | Controls tenant subdomain generation — aligns with env naming convention |
| `TENANT_DOMAIN_PORT` | `:8000` | _(empty)_ | Remove port suffix from invitation/activation email links — EC2 serves on port 80 via nginx |
| `TENANT_DOMAIN_SCHEME` | `http` | `http` | No change needed (update to `https` when SSL is configured) |

> **After setting `DEBUG=False`**, run `collectstatic` so nginx can serve admin CSS/JS:
> ```bash
> docker compose run --rm web python manage.py collectstatic --noinput
> ```
> Without this the Django admin UI will appear unstyled.

---

> ### 🔒 For Staging / Production — Use AWS SSM instead
>
> For staging/production, secrets should never be stored as a file on disk. The recommended approach:
>
> 1. Push all secrets to **AWS SSM Parameter Store** (use `scripts/push-env-to-ssm.sh`)
> 2. Add a startup script (`scripts/fetch-secrets.sh`) that fetches SSM values and exports them as environment variables before Django starts
> 3. Attach an **IAM Instance Profile** to the EC2 with SSM read permission — no credentials file needed
>
> This ensures secrets are encrypted at rest (AWS KMS), access-controlled by IAM, and never touch the server disk.  
> See [AWS Deployment Strategy](./aws-deployment-strategy.md#7-secrets-management) for the full production secrets setup.

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

## Step 10 — Run Migrations and Seed Data

> This step is required before the app is usable. It sets up the database schema, roles, and initial tenants.

```bash
# Run shared schema migrations (public schema — platform tables)
docker compose run --rm web python manage.py migrate_schemas --shared

# Run all tenant migrations
docker compose run --rm web python manage.py migrate_schemas

# Seed roles, platform tenant and nourish tenant
docker compose run --rm web python manage.py shell -c "exec(open('scripts/seed_data.py').read()); run_seed()"
```

> **`seed_data.py` reads `BASE_DOMAIN` from `.env`** — no separate seed files per environment. With `BASE_DOMAIN=dev.dfms.securityguardian.xyz` set in Step 8, it will automatically register `admin.dev.dfms.securityguardian.xyz` and `nourish.dev.dfms.securityguardian.xyz`. It is also idempotent — safe to re-run if tenants already exist.

This creates:
- `platform` tenant → `admin.dev.dfms.securityguardian.xyz` — Super Admin lives here
- `nourish` tenant → `nourish.dev.dfms.securityguardian.xyz` — Nourish client tenant
- System roles and default users

### Add EC2 IP as allowed domain (to access via IP instead of domain name)

```bash
docker compose exec web python manage.py shell
```

```python
from django_tenants.utils import get_tenant_model, get_tenant_domain_model

Tenant = get_tenant_model()
Domain = get_tenant_domain_model()

platform = Tenant.objects.get(schema_name='platform')
Domain.objects.get_or_create(domain='52.14.186.237', tenant=platform, is_primary=False)

exit()
```

> This is needed because the app is multi-tenant and routes by `Host` header. Without this, accessing via IP gives `No tenant for hostname` error.

---

## Step 11 — Verify Deployment

```bash
# Health check (run on EC2)
curl http://localhost/api/health/

# Watch logs
docker compose logs -f web
docker compose logs -f celery_worker
```

**At this point, only the raw IP URL is accessible.** Domain-based URLs require completing Step 12 (Route 53 setup) first.

| URL | Works after | Description |
|-----|-------------|-------------|
| `http://52.14.186.237/admin/` | Step 10 ✅ | Platform admin via raw IP |
| `http://admin.dev.dfms.securityguardian.xyz/admin/` | Step 12a ⬇ | Platform Super Admin via domain |
| `http://nourish.dev.dfms.securityguardian.xyz/admin/` | Step 12a ⬇ | Nourish Tenant Admin via domain |
| `http://nourish.dev.dfms.securityguardian.xyz/api/docs/` | Step 12a ⬇ | Swagger UI |

**Default credentials** (created by seed script):

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `superadmin@dfms.com` | `SuperAdmin@1234!` |
| Nourish Admin | `admin@nourish.com` | `NourishAdmin@1234!` |

---

## Step 12 — (Optional) Set Up Domain & SSL

> This step is optional for dev but required if you want team members to access the environment via a real URL (e.g. `admin.dev.dfms.com`) instead of `/etc/hosts` hacks.

---

### 12a — Using `securityguardian.xyz` subdomain ✅ (current dev setup)

> We reuse the existing `securityguardian.xyz` hosted zone in Route 53 and serve DFMS as a subdomain (`*.dev.dfms.securityguardian.xyz`). No new domain purchase needed.

**DNS record in Route 53 (`securityguardian.xyz` hosted zone):**

| Record name | Type | Value |
|---|---|---|
| `*.dev.dfms` | A | `52.14.186.237` |

This single wildcard covers all tenant subdomains automatically — `admin.dev.dfms.securityguardian.xyz`, `nourish.dev.dfms.securityguardian.xyz`, any future tenant, etc.

> **`ALLOWED_HOSTS` check:** If you set `ALLOWED_HOSTS=localhost,127.0.0.1,52.14.186.237,.dev.dfms.securityguardian.xyz` in Step 8, you're good. If you used `ALLOWED_HOSTS=*`, Django accepts all hosts and no change is needed for dev. Verify with:
> ```bash
> docker compose exec web python manage.py shell -c "from django.conf import settings; print(settings.ALLOWED_HOSTS)"
> ```
> If the domain is missing, edit `.env` on EC2 (`nano /home/ubuntu/nourish-backend/.env`) and run `docker compose restart web`.

**Register domains in Django on the EC2 instance:**

```bash
docker compose exec web python manage.py shell
```

```python
from django_tenants.utils import get_tenant_model, get_tenant_domain_model

Tenant = get_tenant_model()
Domain = get_tenant_domain_model()

platform = Tenant.objects.get(schema_name='platform')
Domain.objects.get_or_create(domain='admin.dev.dfms.securityguardian.xyz', tenant=platform, is_primary=True)

nourish = Tenant.objects.get(schema_name='nourish')
Domain.objects.get_or_create(domain='nourish.dev.dfms.securityguardian.xyz', tenant=nourish, is_primary=True)

exit()
```

**Access URLs (live):**

| URL | Tenant | Purpose |
|---|---|---|
| `http://admin.dev.dfms.securityguardian.xyz/admin/` | platform | Platform Super Admin |
| `http://nourish.dev.dfms.securityguardian.xyz/admin/` | nourish | Nourish Tenant Admin |
| `http://nourish.dev.dfms.securityguardian.xyz/api/docs/` | nourish | Swagger UI |

**Default credentials:**

| Role | Email | Password |
|---|---|---|
| Super Admin | `superadmin@dfms.com` | `SuperAdmin@1234!` |
| Nourish Admin | `admin@nourish.com` | `NourishAdmin@1234!` |

> **For new tenants:** Add a new `Domain` entry pointing `<schema>.dev.dfms.securityguardian.xyz` to the tenant — no new DNS records needed (wildcard covers it).

> **Limitation vs. production:** `securityguardian.xyz` is a shared domain not owned by DFMS. Use a dedicated domain (`dfms.com` or similar) for staging/production.

---

### 12b — Local `/etc/hosts` workaround (no Route 53 needed)

If Route 53 is unavailable and you only need access on your own machine:

**On your local Mac:**

```bash
sudo nano /etc/hosts
```

Add at the bottom:

```
52.14.186.237   admin.dev.dfms.securityguardian.xyz nourish.dev.dfms.securityguardian.xyz
```

Save (`Ctrl+O`, `Enter`, `Ctrl+X`). No DNS propagation wait — works immediately.

> **Limitation:** Only works on machines with the `/etc/hosts` entry. Each teammate needs to add it manually.

---

### 12b — Real domain via Route 53 (shared team access)

This makes the environment accessible to the whole team at a real URL with no `/etc/hosts` required.

**Prerequisites:** You must own or control the `dfms.com` domain, or use a subdomain delegated to Route 53.

#### 12b-i — Create a Route 53 Hosted Zone

1. Open **Route 53 → Hosted zones → Create hosted zone**
2. **Domain name**: `dev.dfms.com`
3. **Type**: Public hosted zone
4. Click **Create hosted zone**
5. Note the 4 **NS records** (nameservers) — you'll need these if delegating a subdomain

#### 12b-ii — Add a Wildcard A Record

Inside the hosted zone:

1. Click **Create record**
2. **Record name**: `*` (wildcard — covers `admin.dev.dfms.com`, `api.dev.dfms.com`, etc.)
3. **Record type**: A
4. **Value**: `<ELASTIC_IP>` (e.g. `52.14.186.237`)
5. **TTL**: `300`
6. Click **Create records**

> This single wildcard record routes all `*.dev.dfms.com` subdomains to your EC2 instance. Nginx and Django handle routing from there.

#### 12b-iii — Request a Wildcard SSL Certificate (ACM)

1. Open **AWS Certificate Manager (ACM)** → **Request a certificate**
2. **Certificate type**: Public certificate
3. **Domain name**: `*.dev.dfms.com`
4. **Validation method**: DNS validation (recommended — ACM will provide a CNAME record)
5. Click **Request**
6. On the certificate detail page, click **Create records in Route 53** — AWS auto-adds the validation CNAME
7. Wait ~2 minutes for status to become **Issued**

> ACM certificates are **free** and auto-renew.

#### 12b-iv — Update Nginx to Use HTTPS

On the EC2 instance, edit your Nginx config to add SSL termination. Example:

```nginx
server {
    listen 80;
    server_name *.dev.dfms.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name *.dev.dfms.com;

    ssl_certificate     /etc/ssl/certs/dfms-dev.crt;
    ssl_certificate_key /etc/ssl/private/dfms-dev.key;

    location / {
        proxy_pass http://web:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

> **Note:** ACM certificates cannot be downloaded — they only work with AWS load balancers (ALB). For direct EC2 + Nginx, use **Let's Encrypt / Certbot** instead (free, same result):
>
> ```bash
> sudo apt install certbot python3-certbot-nginx -y
> sudo certbot --nginx -d "*.dev.dfms.com" --agree-tos -m your@email.com
> ```
> Certbot will auto-configure Nginx and set up auto-renewal.

#### 12b-v — Update Security Group

Make sure the EC2 security group has port **443 (HTTPS)** open:

- **Inbound rule**: Type `HTTPS`, Port `443`, Source `0.0.0.0/0`

(Already added in Step 2 if you followed it — verify it's there.)

#### 12b-vi — Update Django Settings

Update `ALLOWED_HOSTS` and `CSRF_TRUSTED_ORIGINS` in your `.env`:

```
ALLOWED_HOSTS=localhost,127.0.0.1,52.14.186.237,.dev.dfms.com
CSRF_TRUSTED_ORIGINS=https://*.dev.dfms.com
```

Then register tenant domains in Django (same as 12a but with the real subdomain):

```bash
docker compose run --rm web python manage.py shell
```

```python
from django_tenants.utils import get_tenant_model, get_tenant_domain_model

Tenant = get_tenant_model()
Domain = get_tenant_domain_model()

platform = Tenant.objects.get(schema_name='platform')
Domain.objects.get_or_create(domain='admin.dev.dfms.com', tenant=platform, is_primary=True)

nourish = Tenant.objects.get(schema_name='nourish')
Domain.objects.get_or_create(domain='nourish.dev.dfms.com', tenant=nourish, is_primary=True)

exit()
```

Restart and verify:

```bash
docker compose restart web
```

Visit `https://admin.dev.dfms.com/admin/` — you should get the Django admin login over HTTPS.

---

> **Cost note:** Route 53 hosted zone costs **$0.50/month** — this is the only non-free cost in year 1.

---

## Cost Summary


| Period  | Configuration                          | Monthly Cost               |
| ------- | -------------------------------------- | -------------------------- |
| Year 1  | t2.micro free tier + auto-stop         | **~$0.50** (Route 53 only) |
| Year 2+ | t3.micro + auto-stop (08:00–20:00 BDT) | **~$5.40**                 |
| Year 2+ | t3.micro running 24/7                  | **~$15**                   |


See [aws-cost-estimation.md](./aws-cost-estimation.md) for full breakdown.

---

## Step 13 — Wire Up CI/CD Auto-Deploy

The GitHub Actions pipeline (`.github/workflows/ci.yml`) automatically deploys to the dev EC2 on every push to `main`, after lint → unit tests → docker build → integration tests all pass.

### 13a — Add GitHub Secrets

Go to **GitHub → repository → Settings → Secrets and variables → Actions → New repository secret** and add:

| Secret name | Value |
|---|---|
| `DEV_SSH_KEY` | Full contents of `~/.ssh/dfms-dev-key.pem` (copy with `cat ~/.ssh/dfms-dev-key.pem`) |
| `DEV_EC2_HOST` | `52.14.186.237` (your Elastic IP) |
| `DEV_EC2_USER` | `ubuntu` |

### 13b — Create the `dev` GitHub Environment

Go to **GitHub → repository → Settings → Environments → New environment**:

- **Name**: `dev`
- **Deployment URL**: `http://admin.dev.dfms.securityguardian.xyz/admin/`
- No required reviewers needed for dev (add for staging/prod)

### 13c — Pipeline Flow

```
push to main
    └── lint
         └── unit-tests
              └── docker build
                   └── integration-tests
                        └── deploy-dev
                             ├── SSH into EC2
                             ├── git pull
                             ├── docker compose up -d --build web celery_worker celery_beat
                             ├── migrate_schemas
                             └── smoke test → GET /api/health/ → must return 200
```

**On PRs** (not merged yet): only lint + unit tests run — fast feedback without deploying.

### 13d — Trigger manually if needed

```bash
# From GitHub UI: Actions → CI/CD → Run workflow → select branch
# Or via CLI:
gh workflow run ci.yml --ref main
```

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

