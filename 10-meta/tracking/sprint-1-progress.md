# Sprint 1 Progress Report — Platform Security Foundation

**Date**: 2026-03-31
**Sprint**: Sprint 1
**Theme**: Platform Security Foundation
**Overall Completion**: ~70%

---

## Epic Overview

| Epic | Stories | Status |
|------|---------|--------|
| System Foundation Infrastructure | 1 | Done |
| Platform Admin Portal | 5 | ~80% |
| Client Portal | 5 | ~65% |

---

## Epic 1 — System Foundation Infrastructure

**Goal**: Development environment and infrastructure ready for local and production use.

### Stories

| # | Story | Status |
|---|-------|--------|
| 1.1 | Development environment set up and running (Docker Compose — web, db, Redis, Celery worker/beat, nginx) | Done |
| 1.2 | Database configured (PostgreSQL 15, schema-per-tenant via `django-tenants`) | Done |
| 1.3 | Background job processing configured (Celery + Redis broker; result backend on Redis DB 2 — multi-tenant safe) | Done |
| 1.4 | Caching configured (Redis — sessions, OTP state) | Done |
| 1.5 | Production-ready configuration (multi-stage Dockerfile, `docker-compose.prod.yml`, env template) | Done |

---

## Epic 2 — Platform Admin Portal *(DFMS team — internal)*

**Goal**: Platform administrators can log in securely, onboard clients, and manage tenant accounts.

### Stories

| # | Story | Status | Notes |
|---|-------|--------|-------|
| 2.1 | Custom-branded admin interface (DFMS design system — dark/light theme, 3,300+ line CSS) | Done | |
| 2.2 | Secure login for platform administrators with email OTP as a second factor | Done | Two-step flow: password → email OTP challenge at `/admin/login/` |
| 2.3 | Dashboard showing key platform metrics | Done | Platform admin home |
| 2.4 | Tenant Onboarding — register a new client organisation | ~80% | Fills company details, subscription plan, admin contact; auto-creates isolated schema; sends activation email to Tenant Admin. **Pending**: resend welcome email button, reactivation endpoint, trial auto-suspension |
| 2.5 | Tenant Management — view and update client accounts | Done | View, update, suspend. **Pending**: dedicated reactivation action |

---

## Epic 3 — Client Portal *(for Nourish / end-client users)*

**Goal**: Tenant users can log in securely, activate their accounts, and access their operational dashboard.

### Stories

| # | Story | Status | Notes |
|---|-------|--------|-------|
| 3.1 | Custom-branded interface (Bootstrap 5 + DFMS design tokens on tenant host) | Done | |
| 3.2 | Branded login page served on tenant host (`<schema>.dfms.com/login/`) | Done | Platform host (`admin.dfms.com`) redirects to Django admin; tenant hosts serve custom login page |
| 3.3 | 2FA — Email OTP (3-step: identifier → OTP → password) | Done | JWT with tenant context issued on completion |
| 3.4 | Account activation flow for new users (via invitation link) | Done | Tenant Admin receives email → sets password → account active |
| 3.5 | Dashboard showing basic live operational metrics | Done | Tenant dashboard at `/dashboard/`; redirects platform host to `/admin/` |

---

## What's Pending (to complete Sprint 1)

| Item | Epic | Notes |
|------|------|-------|
| Resend activation email | 2 — Tenant Onboarding | Platform admin needs a button to resend the welcome email to a Tenant Admin |
| Tenant reactivation endpoint | 2 — Tenant Management | Dedicated action (currently suspend-only has its own endpoint) |
| Admin account unlock flow | 3 — (login hardening) | When a user is locked out, admin needs a screen to unlock |
| Session management screen | 3 — (login hardening) | Users see and close active sessions across devices |
| TOTP / Authenticator app support | 3 — 2FA | Currently email OTP only; Google Authenticator / TOTP not yet wired |
| Role & permission seeding | Cross-epic | 10 system roles exist; 135 permissions not yet assigned |

---

## Technical Highlights

- Multi-tenant schema isolation (`django-tenants`) fully operational
- Custom DFMS design system applied to Django admin (3,300+ line CSS override, dark/light theme)
- 3-step OTP login (`identifier → OTP → password`) wired end-to-end for tenant users
- Two-step admin login for Super Admin (password + email OTP patch on Django admin)
- `TenantProvisioningService` — atomic 6-step provisioning with rollback on failure
- Celery-based email delivery (OTP, invitation, activation, password-reset hook) with retry logic
- Celery result backend on Redis (DB 2) — avoids `django_celery_results` schema conflict in worker
- JWT authentication with tenant context embedded in token
- Redis-backed session cache and OTP state management
- `scripts/seed_data.py` for local dev bootstrapping (platform tenant, client tenant, super admin)
- Swagger/ReDoc API docs live at `/api/docs/`

---

## Modules Scaffolded (Beyond Sprint 1)

The following modules have models, serializers, viewsets, and URL routing wired up as scaffolding for future sprints — not yet feature-complete:

- Vendors & Bidding
- Requisitions
- Transport Orders & Trips
- Quality Control
- Costing
- GPS Tracking
- Gate Operations
- Scaling / Weighing
- Loading / Unloading
- Notifications (dispatch layer)
- Reporting

---

---

## Sprint 1 Demo Feedback

Feedback received during or after the Sprint 1 demo. All items logged in [sprint1/FEEDBACK.md](../../04-backlog/sprint1/FEEDBACK.md).

| # | Source | Item | Affects | Priority |
|---|--------|------|---------|----------|
| FB-001 | Internal | Invitation activation page: email must be pre-filled and **non-editable** | CP-04 | High |
| FB-002 | Internal | Platform Admin needs a **Resend Welcome Email** action for failed/expired invitations | PAP-05 | High |
| FB-003 | Client | **Session timeout**: extend from 30 minutes to **24 hours** (sliding window) | INFRA-04 | Medium |
| FB-004 | Client | **OTP trusted device**: skip OTP on known browser — only prompt on new device/browser | CP-03, PAP-03 | High |

---

**Recorded by**: Development Team
**Last updated**: 2026-03-31
**Next review**: Sprint 1 completion / Sprint 2 kickoff
