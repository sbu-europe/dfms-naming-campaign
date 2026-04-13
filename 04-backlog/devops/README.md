# DevOps & Infrastructure — Task Breakdown

This folder contains Jira-style task files for all DevOps and infrastructure work across the DFMS platform.

---

## DEVOPS-01 — Local Environment Setup

| Task | Title | SP | Status |
|------|-------|----|--------|
| [DEVOPS-01-01](DEVOPS-01-01-local-env-dev.md) | Local Environment — DEV (Docker Compose, live reload, debug toolbar) | 3 | Done |
| [DEVOPS-01-02](DEVOPS-01-02-local-env-test.md) | Local Environment — TEST (pytest, in-memory cache, synchronous Celery) | 2 | Done |
| [DEVOPS-01-03](DEVOPS-01-03-local-env-stg.md) | Local Environment — STG (Gunicorn, prod Dockerfile, production settings) | 2 | Pending |
| [DEVOPS-01-04](DEVOPS-01-04-local-env-prod.md) | Local Environment — PROD Pre-flight (validation script before release) | 1 | Pending |
| **Subtotal** | | **8** | |

---

## DEVOPS-02 — AWS Environment Setup

| Task | Title | SP | Status |
|------|-------|----|--------|
| [DEVOPS-02-01](DEVOPS-02-01-aws-env-dev.md) | AWS — DEV (EC2 t3.small, RDS t3.micro, auto-deploy on `develop` push) | 5 | Pending |
| [DEVOPS-02-02](DEVOPS-02-02-aws-env-test.md) | AWS — TEST (ephemeral RDS + Redis for integration test CI job) | 3 | Pending |
| [DEVOPS-02-03](DEVOPS-02-03-aws-env-stg.md) | AWS — STG (EC2 t3.medium, ALB, auto-deploy on `main`, client demos) | 8 | Pending |
| [DEVOPS-02-04](DEVOPS-02-04-aws-env-prod.md) | AWS — PROD (EC2 t3.large, Multi-AZ RDS, WAF, S3/CDN, manual-approval deploy) | 13 | Pending |
| **Subtotal** | | **29** | |

---

## DEVOPS-03 — Domain Name Setup

| Task | Title | SP | Status |
|------|-------|----|--------|
| [DEVOPS-03](DEVOPS-03-domain-name-setup.md) | Domain setup — Route 53, ACM wildcard certs, automated tenant DNS, HTTPS enforcement | 3 | Pending |
| **Subtotal** | | **3** | |

---

## Summary

| Epic | Tasks | SP | Status |
|------|-------|----|--------|
| DEVOPS-01 Local Environments | 4 | 8 | 2 Done / 2 Pending |
| DEVOPS-02 AWS Environments | 4 | 29 | 0 Done / 4 Pending |
| DEVOPS-03 Domain Name Setup | 1 | 3 | 0 Done / 1 Pending |
| **Total** | **9** | **40** | |

---

## Environment Overview

| Environment | Purpose | URL | Auto-deploy |
|-------------|---------|-----|-------------|
| Local DEV | Daily development | `http://localhost:8000` | Manual (`docker compose up`) |
| Local TEST | Test suite | n/a | `pytest` |
| Local STG | Pre-release validation | `http://localhost` | Manual |
| AWS DEV | Shared dev cloud | `https://dev.dfms.app` | Push to `develop` |
| AWS TEST | CI integration tests | ephemeral | PR / `main` push |
| AWS STG | Client demos & UAT | `https://stg.dfms.app` | Push to `main` |
| AWS PROD | Live production | `https://admin.dfms.com` | Manual approval |
