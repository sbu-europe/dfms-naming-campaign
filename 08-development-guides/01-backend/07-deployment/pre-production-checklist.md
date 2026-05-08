# Pre-Production Checklist

> Gate criteria that must be satisfied before DFMS goes live in production. All items must be checked and signed off by the responsible person.

**Last Updated**: 2026-03-31  
**Applies To**: Every PROD release (initial go-live and subsequent major releases)

---

## How to Use This Checklist

- Work through each section top-to-bottom
- Mark each item `[x]` only when confirmed — not "assumed"
- Any unchecked item on launch day is a **go/no-go blocker** unless explicitly risk-accepted with a mitigation
- Document the sign-off date and responsible person at the bottom

---

## 1. Infrastructure & Environment

### 1.1 AWS Foundation

- [ ] AWS root account MFA enabled
- [ ] Billing alerts configured ($200/month cap with 80%/100% notifications)
- [ ] Cost Anomaly Detection enabled
- [ ] IAM users created with least-privilege roles (no root credentials used for operations)
- [ ] EC2 instance role attached (no static AWS access keys on server)
- [ ] All AWS resources tagged: `Project`, `Environment`, `Owner`
- [ ] Resource tagging visible in Cost Explorer (Cost Allocation Tags activated)

### 1.2 Compute

- [ ] EC2 instance type confirmed as t3.large (or appropriate for load test results)
- [ ] EC2 instance is in the correct region (ap-southeast-1)
- [ ] EC2 Elastic IP assigned and attached
- [ ] EC2 security group: allows 80, 443 (public), 22 (team IP only), blocks all else
- [ ] EC2 termination protection enabled (prevents accidental deletion)
- [ ] Docker + Docker Compose installed and tested
- [ ] `docker-compose.prod.yml` starts all services cleanly on a fresh EC2

### 1.3 Database

- [ ] RDS PostgreSQL instance running (db.t3.small)
- [ ] RDS is in the same AZ as EC2 (avoids cross-AZ charges)
- [ ] RDS security group: allows port 5432 from EC2 security group only (not 0.0.0.0/0)
- [ ] RDS automated backups enabled — 7-day retention
- [ ] RDS backup window set to off-peak hours (e.g. 03:00–04:00 UTC)
- [ ] RDS deletion protection enabled
- [ ] RDS storage fixed at 30 GB GP3 (auto-scaling NOT enabled)
- [ ] `migrate_schemas --shared` run successfully
- [ ] All tenant schemas migrated
- [ ] Seed data verified (platform superadmin account created)

### 1.4 Cache & Broker

- [ ] ElastiCache Redis instance running (cache.t3.micro)
- [ ] Redis security group: allows port 6379 from EC2 security group only
- [ ] Redis `maxmemory-policy` set to `allkeys-lru`
- [ ] Redis DB indexes confirmed: `0`=cache, `1`=sessions, `2`=Celery results

### 1.5 Storage (S3)

- [ ] S3 bucket created (`dfms-prod-files`)
- [ ] S3 bucket is NOT public (block all public access enabled)
- [ ] S3 bucket policy: allows EC2 IAM role only for `/media/`, allows public for `/static/`
- [ ] S3 versioning enabled (for accidental-delete recovery)
- [ ] S3 lifecycle rules configured (Intelligent-Tiering for media, 90-day expiry for logs)
- [ ] `collectstatic` run and static files visible at their expected URLs

### 1.6 DNS & TLS

- [ ] Route 53 hosted zone created for `dfms.com` (or client domain)
- [ ] Wildcard ACM certificate `*.dfms.com` issued and valid
- [ ] DNS records created: `app.dfms.com` and `nourish.dfms.com` → EC2 Elastic IP
- [ ] SSL termination working — HTTPS returns 200, no mixed-content warnings
- [ ] HTTP → HTTPS redirect enforced in Nginx
- [ ] HSTS header present in response headers

---

## 2. Application

### 2.1 Configuration

- [ ] `DEBUG=False` in production environment
- [ ] `SECRET_KEY` is unique, 50+ characters, not the default, stored in SSM
- [ ] `ALLOWED_HOSTS` is explicitly set (no `*`)
- [ ] `DATABASE_URL` points to RDS (not localhost)
- [ ] `REDIS_URL` points to ElastiCache (not localhost)
- [ ] `CELERY_BROKER_URL` and `CELERY_RESULT_BACKEND` set to ElastiCache endpoints
- [ ] `EMAIL_BACKEND` is SMTP (not console)
- [ ] `DEFAULT_FROM_EMAIL` set to a verified SES sender
- [ ] `SENTRY_DSN` set and error events appearing in Sentry dashboard
- [ ] `SESSION_COOKIE_SECURE = True`
- [ ] `CSRF_COOKIE_SECURE = True`
- [ ] `SECURE_SSL_REDIRECT = True`

### 2.2 Services & Workers

- [ ] Django web service (Gunicorn) running and responding at `/health/`
- [ ] Celery worker running and processing tasks (send a test OTP and confirm email received)
- [ ] Celery beat running and scheduling periodic tasks
- [ ] Nginx serving static files directly (not proxying to Django for static)
- [ ] All containers restart automatically (`restart: unless-stopped` in docker-compose)

### 2.3 Functional Verification

- [ ] Platform admin login works (username → password → OTP email)
- [ ] Tenant onboarding: create a test tenant, receive welcome email, activate account
- [ ] Tenant admin login works (identifier → OTP → password on tenant domain)
- [ ] Invitation flow: invite a user, receive email, activate account
- [ ] Password reset flow works end-to-end
- [ ] `/api/docs/` (Swagger) is accessible to authenticated users only (or disabled in prod)

### 2.4 API & Security

- [ ] All API endpoints require authentication (no anonymous access to data)
- [ ] Tenant isolation verified: tenant A cannot access tenant B's data (test with two tenants)
- [ ] Rate limiting enabled on login and OTP endpoints
- [ ] SQL injection test: parameterised queries in place (Django ORM = safe by default, but verify any raw SQL)
- [ ] XSS protection headers present (`X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`)
- [ ] Sensitive data (passwords, OTPs) never logged

---

## 3. Observability

- [ ] CloudWatch log groups created for application and Nginx
- [ ] Log retention set to 30 days (not infinite)
- [ ] CloudWatch alarms configured: CPU > 75%, Memory > 80%, 5xx > 5/min, DB connections > 80
- [ ] SNS topic created and email subscriptions confirmed (team lead emails)
- [ ] Sentry error tracking receiving events from production
- [ ] At least one test error triggered and confirmed in Sentry before go-live
- [ ] `/health/` endpoint returns 200 and checks DB + Redis connectivity
- [ ] Uptime monitoring configured (e.g. UptimeRobot free tier, pings `/health/` every 5 min)

---

## 4. Security Hardening

- [ ] SSH access to EC2 restricted to team VPN or specific IPs only
- [ ] SSH key pair is team-managed (not individual developer's personal key)
- [ ] `fail2ban` or similar installed on EC2 to block repeated SSH failures
- [ ] EC2 OS packages updated (`sudo apt update && sudo apt upgrade -y`)
- [ ] Docker daemon not exposed on external ports
- [ ] No test/debug endpoints accessible in production (e.g. `/api/test/`, `/debug/`)
- [ ] Django `INTERNAL_IPS` does not include 0.0.0.0
- [ ] Admin URL changed from `/admin/` (optional but recommended: e.g. `/dfms-control-panel/`)

---

## 5. Backup & Disaster Recovery

- [ ] RDS automated backup tested: manually restore latest snapshot to a new instance and verify data
- [ ] Disaster recovery runbook documented and accessible to all team members
- [ ] RTO (Recovery Time Objective) agreed with client: target < 2 hours for Phase 1
- [ ] RPO (Recovery Point Objective) agreed with client: target < 24 hours (daily backup)
- [ ] S3 versioning confirmed: recover accidentally deleted file from version history
- [ ] Manual RDS snapshot taken immediately before go-live (label: `pre-golive-YYYY-MM-DD`)

---

## 6. Performance

- [ ] Load test run against STG environment simulating expected concurrent users (use `locust` or `k6`)
- [ ] API response time < 500ms at expected load (p95)
- [ ] No N+1 query issues on list endpoints (checked via Django Debug Toolbar on STG)
- [ ] Database indexes present on all foreign keys and frequently filtered columns
- [ ] Celery worker processes configured correctly (`--concurrency` based on EC2 CPU count)
- [ ] Redis memory usage confirmed to be within ElastiCache instance capacity

---

## 7. Business & Process

- [ ] Client sign-off on STG environment (UAT approved)
- [ ] Support escalation path documented (who to contact for P1 incident)
- [ ] Maintenance window agreed with client (e.g. Sunday 2–4 AM SGT)
- [ ] Rollback plan documented and tested on STG (revert to previous image tag in < 15 min)
- [ ] First on-call rotation assigned for launch week
- [ ] Client onboarding guide prepared (how to log in, reset password, invite users)
- [ ] AWS cost projections shared with project lead and client (if billable)

---

## 8. Go / No-Go Decision

| Section | Status | Owner | Sign-off Date |
|---------|--------|-------|--------------|
| Infrastructure & Environment | | DevOps | |
| Application | | Dev Lead | |
| Observability | | DevOps | |
| Security | | Dev Lead | |
| Backup & DR | | DevOps | |
| Performance | | Dev Lead | |
| Business & Process | | PM | |

**Final Go/No-Go**:

- [ ] All sections signed off
- [ ] No unchecked blockers outstanding
- [ ] Launch date confirmed: _______________
- [ ] Approved by: _______________

---

## Related Documents

- [AWS Deployment Strategy](../../../04-architecture/06-deployment/aws-deployment-strategy.md)
- [Resource & Cost Estimation](../../../04-architecture/06-deployment/aws-cost-estimation.md)
- [Billing Safeguards](../../../04-architecture/06-deployment/aws-billing-safeguards.md)
- [Post-Production Scalability Plan](../../../04-architecture/06-deployment/aws-scalability-plan.md)
- [Backup & Recovery Guide](../../../08-development-guides/01-backend/07-deployment/backup-recovery.md)
