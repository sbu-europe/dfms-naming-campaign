# Sprint 1 — Infrastructure, Onboarding & Secure Login

**Total Story Points**: ~62 SP | **Done**: ~52 SP | **In Progress**: ~10 SP

---

## Epic: System Foundation Infrastructure (12 SP)

| Task | Title | SP | Status |
|------|-------|----|--------|
| [INFRA-01](INFRA-01-local-dev-environment.md) | Local development environment setup | 3 | Done |
| [INFRA-02](INFRA-02-multi-tenant-schema-isolation.md) | Isolated database per client (schema-per-tenant) | 3 | Done |
| [INFRA-03](INFRA-03-background-job-processing.md) | Background job processing (Celery + Redis) | 3 | Done |
| [INFRA-04](INFRA-04-caching-session-storage.md) | Caching and session storage (Redis-backed) | 1 | Done |
| [INFRA-05](INFRA-05-production-ready-setup.md) | Production-ready config & onboarding docs | 2 | Done |

---

## Epic: Platform Admin Portal — internal DFMS team (29 SP)

| Task | Title | SP | Status |
|------|-------|----|--------|
| [PAP-01](PAP-01-custom-branded-admin-interface.md) | Custom-branded admin interface (DFMS design system) | 5 | Done |
| [PAP-02](PAP-02-platform-admin-login.md) | Platform admin login (username & password) | 2 | Done |
| [PAP-03](PAP-03-platform-admin-2fa-otp.md) | Platform admin 2FA — email OTP challenge | 3 | Done |
| [PAP-04](PAP-04-platform-admin-dashboard.md) | Platform admin dashboard — key metrics | 3 | Done |
| [PAP-05](PAP-05-tenant-onboarding.md) | Tenant onboarding — register a new client organisation | 13 | ~80% |
| [PAP-06](PAP-06-tenant-management.md) | Tenant management — view, update, and suspend accounts | 3 | Done |

**Pending**: resend welcome email, tenant reactivation (tracked in PAP-05)

---

## Epic: Client Portal — Nourish / end-client users (21 SP)

| Task | Title | SP | Status |
|------|-------|----|--------|
| [CP-01](CP-01-custom-branded-client-interface.md) | Custom-branded client portal interface | 3 | Done |
| [CP-02](CP-02-branded-login-page-on-tenant-domain.md) | Branded login page served on the client's domain | 2 | Done |
| [CP-03](CP-03-2fa-email-otp-login.md) | 2FA — Email OTP (3-step secure login) | 8 | Done |
| [CP-04](CP-04-account-activation-invitation.md) | Account activation flow via invitation link | 5 | ~70% |
| [CP-05](CP-05-tenant-dashboard.md) | Tenant dashboard — basic live operational metrics | 3 | Done |

**Pending**: bulk CSV invitation, resend invitation (tracked in CP-04)

---

## Sprint 1 Demo Feedback — Backlogged Items

> Full feedback log: [FEEDBACK.md](FEEDBACK.md)

| Ref | Feedback | Source | Affects | Sprint |
|-----|----------|--------|---------|--------|
| [FB-001](FEEDBACK.md#fb-001--invitation-url-email-pre-filled-and-non-editable) | Invitation activation email field must be read-only | Internal | CP-04 | Sprint 2 |
| [FB-002](FEEDBACK.md#fb-002--platform-admin-resend-invitation-email) | Platform admin resend welcome email action | Internal | PAP-05 | Sprint 2 |
| [FB-003](FEEDBACK.md#fb-003--session-timeout-extend-from-30-minutes-to-24-hours) | Session timeout 30 min → 24 hours | Client | INFRA-04 | Sprint 2 |
| [FB-004](FEEDBACK.md#fb-004--otp-trusted-device--skip-otp-on-known-browser) | OTP skip for trusted device / known browser | Client | CP-03, PAP-03 | Sprint 2 |
| [FB-005](FEEDBACK.md#fb-005--otp-channel-configurable-email-or-phone-otp-per-user) | OTP channel configurable per user (email or SMS) | Client | [CP-06](CP-06-otp-channel-configuration.md) | Sprint 2 |

---

## Sprint 1 Demo Feedback

See [FEEDBACK.md](FEEDBACK.md) for all 4 items (2 internal, 2 client) with full acceptance criteria.

| # | Source | Item | Affects |
|---|--------|------|---------|
| [FB-001](FEEDBACK.md#fb-001--invitation-url-email-pre-filled-and-non-editable) | Internal | Invitation email non-editable on activation page | CP-04 |
| [FB-002](FEEDBACK.md#fb-002--platform-admin-resend-invitation-email) | Internal | Platform admin resend welcome email action | PAP-05 |
| [FB-003](FEEDBACK.md#fb-003--session-timeout-extend-from-30-minutes-to-24-hours) | Client | Session timeout 30 min → 24 hours | INFRA-04 |
| [FB-004](FEEDBACK.md#fb-004--otp-trusted-device--skip-otp-on-known-browser) | Client | OTP skip for trusted device / known browser | CP-03, PAP-03 |
