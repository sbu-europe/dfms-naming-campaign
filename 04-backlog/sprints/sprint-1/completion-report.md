---
title: Sprint 1 Completion Report
sprint: Sprint 1
phase: Phase 1
date: 2026-03-31
status: COMPLETE
total_story_points_planned: 62
branch: main (merged from sprint-1/*, feat/*)
---

# Sprint 1 Completion Report
## Infrastructure, Onboarding & Secure Login

**Date**: March 31, 2026  
**Branch**: `main` (multiple feature branches merged)  
**Status**: ✅ **COMPLETE** (~84% planned SP; 3 stories partial; feedback items queued to Sprint 2)

---

## 📊 Summary

| Metric | Planned | Delivered |
|--------|---------|-----------|
| Total Stories | 16 | 13 fully done, 2 partial, 1 scaffolded |
| Story Points | 62 SP | ~52 SP delivered |
| Epics | 3 | 3 fully started; 2 fully delivered |
| Commits | — | ~60 commits on feature branches |
| Key Modules | — | `apps/tenants`, `apps/users`, `apps/core`, Django admin shell |

---

## ✅ Delivered Epics & Stories

### 1. System Foundation Infrastructure ✅

**Story Points**: 12 SP | **Jira**: DFS-001 → DFS-005

| Story | Task | SP | Status |
|-------|------|----|--------|
| Local development environment setup | INFRA-01 | 3 | ✅ Done |
| Isolated DB per client (schema-per-tenant) | INFRA-02 | 3 | ✅ Done |
| Background job processing — Celery + Redis | INFRA-03 | 3 | ✅ Done |
| Caching and session storage — Redis-backed | INFRA-04 | 1 | ✅ Done |
| Production-ready configuration & onboarding docs | INFRA-05 | 2 | ✅ Done |

**Key deliverables:**
- `django-tenants` schema-per-tenant isolation fully operational
- Docker Compose stack: Django, PostgreSQL 15, Redis 7, Celery worker + beat, Nginx
- `scripts/seed_data.py` for local dev bootstrapping
- Swagger / ReDoc API docs at `/api/docs/`
- JWT authentication with tenant context embedded in token
- Redis-backed session cache and OTP state (24-hour sliding window — see FB-003)
- Celery result backend on Redis DB 2 (avoids `django_celery_results` schema conflict in worker)

---

### 2. Platform Admin Portal ✅ (partial)

**Story Points**: 29 SP | **Jira**: DFS-006 → DFS-011

| Story | Task | SP | Status |
|-------|------|----|--------|
| Custom-branded admin interface (DFMS design system) | PAP-01 | 5 | ✅ Done |
| Platform admin login (username & password) | PAP-02 | 2 | ✅ Done |
| Platform admin 2FA — email OTP challenge | PAP-03 | 3 | ✅ Done |
| Platform admin dashboard — key metrics | PAP-04 | 3 | ✅ Done |
| Tenant onboarding — register new client organisation | PAP-05 | 13 | 🔄 ~80% |
| Tenant management — view, update, suspend | PAP-06 | 3 | ✅ Done |

**Key deliverables:**
- Full DFMS design system applied to Django admin (3,300+ line CSS override, dark/light theme, Bootstrap Icons)
- Collapsible sidebar, custom topbar, page header, breadcrumbs, sticky submit footer
- `TenantProvisioningService` — atomic 6-step schema provisioning with rollback on failure
- Tenant lifecycle admin: create, view, suspend, reactivate
- Super Admin 2-step login: password + email OTP (patched onto Django admin)
- Schema-scoped admin visibility — platform admin sees only tenant management; tenant users see only their tenant's models
- Chart.js stat cards on platform dashboard

**PAP-05 carry-overs to Sprint 2:**
- Resend welcome email (fresh temp password + new 72h reset window)
- Tenant reactivation after suspension *(resolved in Sprint 2 — `fix(DFS-147)`)*

---

### 3. Client Portal ✅ (partial)

**Story Points**: 21 SP | **Jira**: DFS-012 → DFS-016

| Story | Task | SP | Status |
|-------|------|----|--------|
| Custom-branded client portal interface | CP-01 | 3 | ✅ Done |
| Branded login page on client's domain | CP-02 | 2 | ✅ Done |
| 2FA — Email OTP (3-step secure login) | CP-03 | 8 | ✅ Done |
| Account activation flow via invitation link | CP-04 | 5 | 🔄 ~70% |
| Tenant dashboard — basic live operational metrics | CP-05 | 3 | ✅ Done |

**Key deliverables:**
- 3-step tenant user login: identifier → OTP → password (fully wired end-to-end)
- Tenant invitation + activation flow: invite email → token link → set password → activate
- Celery-based email delivery (OTP, invitation, activation, password-reset hook) with retry logic
- Per-tenant domain routing: `nourish.dfms.com` → tenant schema; `platform.dfms.com` → platform admin
- Tenant admin dashboard with stat cards (live data per schema)
- Suspended tenant portal page

**CP-04 carry-overs to Sprint 2:**
- Resend invitation endpoint (regenerate token, reset 7-day TTL) *(resolved Sprint 2)*
- Bulk CSV user invitation *(resolved Sprint 2 — `DFS-015-12`)*
- Email field read-only on activation page *(resolved Sprint 2)*

---

## ⏳ Carry-Forward to Sprint 2

| Item | Story | Priority |
|------|-------|----------|
| Resend welcome email (PAP-05) | PAP-05 | High |
| Tenant reactivation after suspension | PAP-05 | High |
| Resend invitation — regenerate token (CP-04) | CP-04 | High |
| Bulk CSV user invitation | CP-04 | Medium |
| Email read-only on activation page | CP-04 | High |
| Session timeout → 24h sliding window | INFRA-04 | Medium |
| OTP skip for trusted device / known browser | CP-03, PAP-03 | High |
| OTP channel configurable per user (email/SMS) — SMS scaffolded, not wired | CP-03 | Low |

---

## 🐛 Bugs Fixed This Sprint

| Issue | Fix | Commit |
|-------|-----|--------|
| `ProgrammingError` on platform admin pages (schema routing) | Schema routing fix in tenant middleware | `938f9eb` |
| Sidebar flash on page navigation | Anti-flash script moved to `<head>` | `2e0228d`, `b9bdd05` |
| Nav group expand flash on load | Render groups closed by default | `45e0a2b` |
| Emoji moon/sun icon rendering issues | Replaced with Bootstrap Icons `bi-moon`/`bi-sun` | `1fc5f63`, `479c5b9` |
| Dropdown logout padding / colour in light mode | Normalized padding, danger colour | `9c8ba11`, `8930b4f` |
| Collapsed sidebar icon alignment and click | DOM class check for collapsed state | `6dabafd`, `8d7689d` |
| Row dropdown delete URL malformed | Handle both `/change/` and bare object URLs | `96c4482` |
| Celery result backend schema conflict with `django_celery_results` | Switched to Redis DB 2 | `df6391a`, `49a8355` |

---

## 🔑 Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| `django-tenants` schema-per-tenant | Strong data isolation per client with no application-level tenant filtering needed |
| Celery + Redis for async tasks | OTP email, activation emails, and batch jobs run async; Redis result backend avoids schema conflict |
| Custom DFMS design system on Django admin | Avoids building a separate frontend for Phase 1; admin customisation is sufficient for operational roles |
| 3-step login flow for tenant users | Identifier → OTP → password separates identity check and auth — matches client security requirements |
| `TenantProvisioningService` atomic provisioning | Schema creation, seeding, and user creation wrapped in a single rollback-safe service |

---

## 📈 Sprint Metrics

| Metric | Value |
|--------|-------|
| Commits delivered | ~60 |
| Files changed (approx.) | 40+ |
| New templates | 8 |
| New migrations | 6 |
| CSS lines (design system) | 3,300+ |
| Story points delivered | ~52 / 62 planned |
| Carry-forward SP | ~10 SP |

---

## 🏗️ Modules Scaffolded (Beyond Sprint 1 Scope)

Full model + serializer + viewset + URL routing wired as scaffolding for future sprints (not feature-complete):

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
