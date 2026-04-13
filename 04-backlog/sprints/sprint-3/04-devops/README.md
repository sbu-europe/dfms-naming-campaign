# Epic: DevOps & Infrastructure Setup

> Sprint 3 — alongside Transfer Requisition, Transport Planning & Transport Orders

This epic covers all cloud environment provisioning, deployment automation, and domain configuration needed to take the platform from local development to live production on AWS.

---

## Local Environments (Pending)

| Task | Title | SP | Status |
|------|-------|----|--------|
| [DEVOPS-01-03](DEVOPS-01-03-local-env-stg.md) | Local STG — run app in production mode (Gunicorn, `runtime` image, `DEBUG=False`) | 2 | Pending |
| [DEVOPS-01-04](DEVOPS-01-04-local-env-prod.md) | Local PROD pre-flight — validation script before every production release | 1 | Pending |

> **Already done in Sprint 1:**
> - [DEVOPS-01-01](../../sprint-1/01-infra/DEVOPS-01-01-local-env-dev.md) — Local DEV (`docker-compose.yml`, live reload)
> - [DEVOPS-01-02](../../sprint-1/01-infra/DEVOPS-01-02-local-env-test.md) — Local TEST (`pytest`, CI pipeline)

---

## AWS Environments

| Task | Title | SP | Status |
|------|-------|----|--------|
| [DEVOPS-02-01](DEVOPS-02-01-aws-env-dev.md) | AWS DEV — EC2 t3.small, RDS t3.micro, auto-deploy on `develop` push | 5 | Pending |
| [DEVOPS-02-02](DEVOPS-02-02-aws-env-test.md) | AWS TEST — ephemeral RDS + ElastiCache for integration CI job | 3 | Pending |
| [DEVOPS-02-03](DEVOPS-02-03-aws-env-stg.md) | AWS STG — EC2 t3.medium, ALB, zero-downtime deploy, client demos | 8 | Pending |
| [DEVOPS-02-04](DEVOPS-02-04-aws-env-prod.md) | AWS PROD — EC2 t3.large, Multi-AZ RDS, WAF, S3/CDN, manual-approval deploy | 13 | Pending |

---

## Domain Name Setup

| Task | Title | SP | Status |
|------|-------|----|--------|
| [DEVOPS-03](DEVOPS-03-domain-name-setup.md) | Domain setup — Route 53, ACM wildcard certs, automated tenant DNS | 3 | Pending |

---

## Summary

| Group | SP |
|-------|----|
| Local Environments (pending) | 3 |
| AWS Environments | 29 |
| Domain Setup | 3 |
| **Total** | **35** |
