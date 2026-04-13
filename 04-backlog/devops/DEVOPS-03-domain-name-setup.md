---
task_id: DEVOPS-03
title: Domain Name Setup
epic: DevOps & Infrastructure
type: Task
priority: High
status: Pending
story_points: 3
assignee: ~
---

# DEVOPS-03 — Domain Name Setup

## Summary

Register, configure, and verify all domain names required for the DFMS platform across all environments — platform admin portal, tenant subdomains, and environment-specific subdomains (dev, staging, production).

## Description

DFMS is a multi-tenant SaaS platform. Each environment needs its own domain/subdomain, and each tenant in production gets their own subdomain under `*.dfms.app`. The platform admin portal runs on a separate domain (`admin.dfms.com`). All domains must have HTTPS via ACM certificates.

**Domain strategy:**

| Purpose | Domain |
|---------|--------|
| Platform admin (all envs) | `admin.dfms.com` |
| Tenant portal — production | `<tenant>.dfms.app` |
| Tenant portal — staging | `<tenant>.stg.dfms.app` |
| Tenant portal — dev | `<tenant>.dev.dfms.app` |
| API (future) | `api.dfms.app` |

## Acceptance Criteria

- [ ] `dfms.com` and `dfms.app` registered and DNS managed in AWS Route 53
- [ ] `admin.dfms.com` → resolves to production ALB
- [ ] `*.dfms.app` wildcard DNS record → resolves to production ALB
- [ ] `stg.dfms.app` and `*.stg.dfms.app` → resolve to staging ALB
- [ ] `dev.dfms.app` → resolves to dev EC2
- [ ] ACM wildcard certificate issued for `*.dfms.app` (covers all tenant subdomains)
- [ ] ACM certificate issued for `admin.dfms.com`
- [ ] All HTTP traffic redirected to HTTPS (301)
- [ ] DNS TTL set appropriately (300s during initial setup, 3600s once stable)
- [ ] SSL Labs score A or A+ for all public domains
- [ ] New tenant provisioning automatically creates a Route 53 DNS record for `<tenant>.dfms.app`

## Sub-tasks

| # | Sub-task | Status |
|---|----------|--------|
| DEVOPS-03-1 | Register `dfms.com` via AWS Route 53 Domains (or transfer if already registered) | Pending |
| DEVOPS-03-2 | Register `dfms.app` via AWS Route 53 Domains | Pending |
| DEVOPS-03-3 | Create Route 53 Hosted Zone for `dfms.com` and `dfms.app` | Pending |
| DEVOPS-03-4 | Create A / ALIAS record: `admin.dfms.com` → production ALB DNS name | Pending |
| DEVOPS-03-5 | Create wildcard A / ALIAS record: `*.dfms.app` → production ALB DNS name | Pending |
| DEVOPS-03-6 | Create A / ALIAS records for staging: `stg.dfms.app`, `*.stg.dfms.app` → staging ALB | Pending |
| DEVOPS-03-7 | Create A record for dev: `dev.dfms.app` → dev EC2 Elastic IP | Pending |
| DEVOPS-03-8 | Request ACM certificate for `*.dfms.app` — DNS validation via Route 53 (auto-renews) | Pending |
| DEVOPS-03-9 | Request ACM certificate for `admin.dfms.com` — DNS validation | Pending |
| DEVOPS-03-10 | Request ACM certificate for `*.stg.dfms.app` — for staging tenant subdomains | Pending |
| DEVOPS-03-11 | Attach ACM certificates to ALB HTTPS listeners (prod and staging) | Pending |
| DEVOPS-03-12 | Configure ALB HTTP → HTTPS redirect rule (301) on port 80 | Pending |
| DEVOPS-03-13 | Add Route 53 record creation to `TenantProvisioningService.provision()` — auto-creates `<tenant>.dfms.app` A record on tenant creation | Pending |
| DEVOPS-03-14 | Add Route 53 record deletion to tenant suspension/deletion flow | Pending |
| DEVOPS-03-15 | Update Django `ALLOWED_HOSTS` and `django-tenants` domain records to match live domains | Pending |
| DEVOPS-03-16 | Verify SSL Labs score for `admin.dfms.com` and a sample tenant domain | Pending |
| DEVOPS-03-17 | Update `DECISIONS.md` §8 (Tenant Domain Configuration) with live domain details | Pending |

## DNS Architecture

```
dfms.com (Route 53 Hosted Zone)
└── admin.dfms.com        A → prod ALB

dfms.app (Route 53 Hosted Zone)
├── *.dfms.app            A → prod ALB   (all tenant subdomains)
├── *.stg.dfms.app        A → stg ALB
├── dev.dfms.app          A → dev EC2 EIP
└── api.dfms.app          A → prod ALB   (future)
```

## Certificate Map

| Domain | Certificate | Type | Validation |
|--------|-------------|------|------------|
| `admin.dfms.com` | ACM | Single | DNS (Route 53) |
| `*.dfms.app` | ACM | Wildcard | DNS (Route 53) |
| `*.stg.dfms.app` | ACM | Wildcard | DNS (Route 53) |

> **Note**: ACM wildcard `*.dfms.app` covers `nourish.dfms.app`, `acme.dfms.app`, etc. but does NOT cover `admin.dfms.com` — that needs a separate certificate.

## Automated Tenant DNS (Django Integration)

When a new tenant is provisioned via `TenantProvisioningService`, a Route 53 A record must be created automatically:

```python
# apps/tenants/services.py — inside provision()
route53.create_record(
    hosted_zone_id=DFMS_APP_HOSTED_ZONE_ID,
    name=f"{tenant.schema_slug}.dfms.app",
    type="A",
    alias_target=PROD_ALB_DNS_NAME,
)
```

Required IAM permission on the EC2 instance role: `route53:ChangeResourceRecordSets`.

## Local Development

For local development, add entries to `/etc/hosts` instead (no real DNS needed):

```
127.0.0.1  admin.dfms.com
127.0.0.1  nourish.dfms.com
```

See `DECISIONS.md` §8 — Tenant Domain Configuration.

## Definition of Done

- `https://admin.dfms.com/` loads platform admin login page (HTTPS, A+ SSL)
- `https://nourish.dfms.app/login/` loads Nourish tenant login page (HTTPS, A+ SSL)
- New tenant provisioned → subdomain resolves within 60 seconds (Route 53 TTL)
- HTTP requests to all domains redirect to HTTPS with 301
