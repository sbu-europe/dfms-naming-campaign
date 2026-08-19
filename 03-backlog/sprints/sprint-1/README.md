# Sprint 1 — Infrastructure, Onboarding & Secure Login

| | |
|---|---|
| **Sprint Dates** | 2026-03-01 → 2026-03-31 |
| **Total Story Points** | 62 SP |
| **Done** | ~52 SP |
| **Remaining** | ~10 SP |
| **Overall Completion** | ~84% |

---

## Epic: System Foundation Infrastructure

> Goal: Development environment and infrastructure ready for local and production use.

| Story | Jira | Status | SP |
|-------|------|--------|----|
| [Local development environment setup](01-infra/INFRA-01-local-dev-environment.md) | DFS-001 | Done | 3 |
| [Isolated database per client — schema-per-tenant](01-infra/INFRA-02-multi-tenant-schema-isolation.md) | DFS-002 | Done | 3 |
| [Background job processing — Celery + Redis](01-infra/INFRA-03-background-job-processing.md) | DFS-003 | Done | 3 |
| [Caching and session storage — Redis-backed](01-infra/INFRA-04-caching-session-storage.md) | DFS-004 | Done | 1 |
| [Production-ready configuration & onboarding docs](01-infra/INFRA-05-production-ready-setup.md) | DFS-005 | Done | 2 |
| **Subtotal** | | | **12** |

---

## Epic: Platform Admin Portal *(DFMS team — internal)*

> Goal: Platform administrators can log in securely, onboard clients, and manage tenant accounts.

| Story | Jira | Status | SP |
|-------|------|--------|----|
| [Custom-branded admin interface (DFMS design system)](02-platform-admin-portal/PAP-01-custom-branded-admin-interface.md) | DFS-006 | Done | 5 |
| [Platform admin login (username & password)](02-platform-admin-portal/PAP-02-platform-admin-login.md) | DFS-007 | Done | 2 |
| [Platform admin 2FA — email OTP challenge](02-platform-admin-portal/PAP-03-platform-admin-2fa-otp.md) | DFS-008 | Done | 3 |
| [Platform admin dashboard — key metrics](02-platform-admin-portal/PAP-04-platform-admin-dashboard.md) | DFS-009 | Done | 3 |
| [Tenant onboarding — register a new client organisation](02-platform-admin-portal/PAP-05-tenant-onboarding.md) | DFS-010 | ~80% | 13 |
| [Tenant management — view, update, and suspend accounts](02-platform-admin-portal/PAP-06-tenant-management.md) | DFS-011 | Done | 3 |
| **Subtotal** | | | **29** |

---

## Epic: Client Portal *(for Nourish / end-client users)*

> Goal: Tenant users can log in securely, activate their accounts, and access their operational dashboard.

| Story | Jira | Status | SP |
|-------|------|--------|----|
| [Custom-branded client portal interface](03-client-portal/CP-01-custom-branded-client-interface.md) | DFS-012 | Done | 3 |
| [Branded login page served on the client's domain](03-client-portal/CP-02-branded-login-page-on-tenant-domain.md) | DFS-013 | Done | 2 |
| [2FA — Email OTP (3-step secure login)](03-client-portal/CP-03-2fa-email-otp-login.md) | DFS-014 | Done | 8 |
| [Account activation flow via invitation link](03-client-portal/CP-04-account-activation-invitation.md) | DFS-015 | ~70% | 5 |
| [Tenant dashboard — basic live operational metrics](03-client-portal/CP-05-tenant-dashboard.md) | DFS-016 | Done | 3 |
| **Subtotal** | | | **21** |

---

## Pending Items

### Scope Carry-overs (original sprint scope, not yet done)

| Item | Story | Jira Sub-task | Priority |
|------|-------|---------------|----------|
| Resend welcome email (fresh temp password + reset 72h window) | [PAP-05](02-platform-admin-portal/PAP-05-tenant-onboarding.md) | DFS-010-12 | High |
| Tenant reactivation after suspension | [PAP-05](02-platform-admin-portal/PAP-05-tenant-onboarding.md) | DFS-010-13 | High |
| Resend invitation endpoint — regenerate token, reset 7-day TTL | [CP-04](03-client-portal/CP-04-account-activation-invitation.md) | DFS-015-11 | High |
| Bulk CSV user invitation endpoint | [CP-04](03-client-portal/CP-04-account-activation-invitation.md) | DFS-015-12 | Medium |
| Admin account unlock flow (locked-out user screen) | Cross-epic | — | Medium |
| Session management screen — view and close active sessions | Cross-epic | — | Low |
| TOTP / Authenticator app support (currently email OTP only) | Cross-epic | — | Low |
| Role & permission seeding — 10 system roles, 135 permissions not yet assigned | Cross-epic | — | Medium |

### From Demo Feedback (new scope — queued for Sprint 2 refinement)

| Item | Story | Jira Sub-task | Source | Priority |
|------|-------|---------------|--------|----------|
| Lock email field on activation page (read-only + server-side validation) | [CP-04](03-client-portal/CP-04-account-activation-invitation.md) | DFS-015-13 | Internal | High |
| Extend session timeout to 24 hours | [INFRA-04](01-infra/INFRA-04-caching-session-storage.md) | DFS-004-6 | Client | Medium |
| Trusted device cookie — skip OTP on known browser | [CP-03](03-client-portal/CP-03-2fa-email-otp-login.md), [PAP-03](02-platform-admin-portal/PAP-03-platform-admin-2fa-otp.md) | DFS-014-10 | Client | High |
| Configurable OTP channel per user (email \| SMS) | [CP-03](03-client-portal/CP-03-2fa-email-otp-login.md) | DFS-014-11 | Client | High |

---

## Demo Feedback (Sprint 1 — 2026-03-31)

> Source: Sprint 1 demo — internal + client (Nourish)

| # | Feedback | Source | Affects | Priority | Status | Feedback File |
|---|----------|--------|---------|----------|--------|---------------|
| FB-001 | Invitation email non-editable on activation page | Internal | [CP-04](03-client-portal/CP-04-account-activation-invitation.md) | High | Open | [CP-04-feedback.md](04-feedback/CP-04-feedback.md) |
| FB-002 | Platform admin resend welcome email action | Internal | [PAP-05](02-platform-admin-portal/PAP-05-tenant-onboarding.md) | High | Open | [PAP-05-feedback.md](04-feedback/PAP-05-feedback.md) |
| FB-003 | Session timeout 30 min → 24 hours | Client | [INFRA-04](01-infra/INFRA-04-caching-session-storage.md) | Medium | Open | [INFRA-04-feedback.md](04-feedback/INFRA-04-feedback.md) |
| FB-004 | OTP skip for trusted device / known browser | Client | [CP-03](03-client-portal/CP-03-2fa-email-otp-login.md), [PAP-03](02-platform-admin-portal/PAP-03-platform-admin-2fa-otp.md) | High | Open | [CP-03-feedback.md](04-feedback/CP-03-feedback.md) |
| FB-005 | OTP channel configurable per user (email or SMS) | Client | [CP-03](03-client-portal/CP-03-2fa-email-otp-login.md) | High | Open | [CP-03-feedback.md](04-feedback/CP-03-feedback.md) |

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
- `scripts/seed_data.py` for local dev bootstrapping
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

**Sprint Lead**: ~  
**Last Updated**: 2026-04-03  
**Next**: [Sprint 2 →](../sprint-2/README.md)
