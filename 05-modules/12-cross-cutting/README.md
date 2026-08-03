# 12-cross-cutting — Cross-Cutting Concerns

## Module Overview

Cross-cutting concerns that span all modules: non-functional requirements, security, integrations, automated testing strategy, and DevOps/infrastructure.

**Purpose**: System-wide quality attributes, security standards, testing architecture, and infrastructure specifications  
**PRD Sections**: 7, 9, 10  
**Phase**: Phase 1 (Critical)  
**Dependencies**: Cross-cutting (applies to all modules)

---

## Module Contents

| File | Description | Sprint | Related Stories |
|------|-------------|--------|-----------------|
| [non-functional-requirements.md](non-functional-requirements.md) | System quality attributes — performance targets (3s page load, 500ms API), scalability (100+ tenants, 10M+ trips/year), availability SLA (99.5% uptime, 4h RTO), security standards (MFA, TLS 1.3, AES-256) | Phase 1 | Cross-cutting |
| [security-compliance.md](security-compliance.md) | Security architecture — layered defence, data protection (AES-256), RBAC least-privilege, regulatory compliance (ISO 27001, GDPR), incident response, multi-tenant isolation | Phase 1 | US-001–009 |
| [integration-requirements.md](integration-requirements.md) | External system integrations — GPS/VTS (30s tracking, geofencing), map & routing APIs, ERP connectors (SAP/Oracle/Dynamics), payment gateways (bKash, Nagad), SMS/email gateways | Phase 1 | Cross-cutting |
| [url-shortener-service.md](url-shortener-service.md) | Standalone general-purpose URL shortener (`services/link-shortener/`) — FastAPI + dedicated RDS Postgres + Redis, private management API with RS256 service JWTs, public 302 redirect endpoint, per-client host allowlist, opaque namespace grouping, code/link lifecycle, DFMS integration for SMS invitation links | Sprint 7 | AUTH-01 (AUTH-01-3, AUTH-01-4) |
| [file-upload-validation.md](file-upload-validation.md) | Shared file upload type & size policy — Document (PDF/JPEG/PNG, 10 MB), Photo (5 MB), CSV import/invitation byte caps; wire all live API + Admin upload paths; Django/nginx body limits | Planned | Cross-cutting (PR, vendor KYC, bulk import, invitations, driver photos) |
| [testing-strategy.md](testing-strategy.md) | Automated test suite — pytest unit + API integration tests (Sprint 1 & 2 coverage), Playwright E2E tests (POM pattern), code coverage enforcement (≥ 80% overall, per-app thresholds), SonarQube Quality Gate, CI pipeline integration | Sprint 3 | DFS-041 (QA-01) |
| [../../08-development-guides/01-backend/07-deployment/aws-dev-environment.md](../../08-development-guides/01-backend/07-deployment/aws-dev-environment.md) | AWS dev environment — EC2 t3.micro (ap-south-1), Docker Compose stack (Django + Celery + PostgreSQL + Redis), Terraform IaC, Nginx HTTPS, S3 media, SES, CloudWatch observability, CI/CD deploy pipeline, auto-stop scheduler, ~$0.50/mo cost | Sprint 3 | DFS-042 (DEVOPS-01) |

---

## Related User Stories

**Primary Stories**: Cross-cutting requirements  
**Location**: `../../03-backlog/stories/README.md`

For detailed story information, see individual specification files above.

---

## Dependencies

### Upstream Dependencies
Cross-cutting (applies to all modules)

### Downstream Dependencies
Check individual specification files for detailed cross-module references.

---

## Quick Links

- **[Module Index](../README.md)** - Back to module specifications index
- **[Complete Index](../INDEX.md)** - Full content index
- **[Source PRD](../../01-source/01-prd/PRD_DFMS_v1.0.md)** - Original PRD document
- **[User Stories](../../03-backlog/stories/README.md)** - Implementation stories

---

**Last Updated**: 2026-08-03  
**Status**: Complete (index); file-upload-validation planned
