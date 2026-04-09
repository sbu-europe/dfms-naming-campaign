---
title: Client Portal
story_id: CP
phase: phase-1
module: Client Portal
priority: Critical
status: In Progress
epic: Client Portal
epic_id: EPIC-002
epic_name: User & Tenant Foundation
sprint: Sprint 1 — Infrastructure, Onboarding & Secure Login
story_points: 21
created: 2026-03-31
updated: 2026-03-31
completion: ~75%
related_stories:
  - US-002-multi-factor-auth.md
  - US-005-user-invitation-activation.md
tags: [client-portal, tenant, branding, login, 2fa, activation, dashboard]
---

# Client Portal

## Summary

The client portal is the tenant-facing web surface at `<schema>.dfms.com`. It gives Tenant Admins and operational users a branded, secure entry point — from login through 2FA and account activation to the operational dashboard.

---

## Stories Delivered

### 1. Custom-branded interface

**As a** Tenant Admin or operational user  
**I want** the client portal to use the DFMS / client branding  
**So that** the experience feels cohesive rather than a generic admin page

**Implementation**: Bootstrap 5 + DFMS design tokens applied via `templates/` and `static/`. Login and dashboard templates are distinct from the platform admin theme.

**Status**: Done

---

### 2. Branded login page served on tenant host

**As a** Tenant Admin  
**I want** to reach a branded login page when I visit my organisation's domain  
**So that** the portal feels dedicated to my organisation

**Implementation**: `apps/core/portal_views.py` — `login_page` view checks `connection.schema_name`. If `platform` → redirect to `/admin/login/`. Otherwise → render `templates/auth/login.html`. Routed via `apps/core/web_urls.py` at `/login/`.

**Status**: Done

---

### 3. Multi-Factor Authentication — Email OTP (3-step login)

**As a** Tenant Admin  
**I want** to log in via a 3-step OTP flow (identifier → OTP → password)  
**So that** my account has a second verification step beyond just a password

**Implementation**: DRF API endpoints (see `apps/users/`):
1. `POST /api/v1/auth/login/initiate/` — sends OTP to user's email via Celery
2. `POST /api/v1/auth/login/verify-otp/` — verifies OTP, returns `session_token`
3. `POST /api/v1/auth/login/complete/` — validates `session_token` + password, returns JWT pair (with tenant schema in payload)

Alpine.js client-side wiring in `templates/auth/login.html` handles the 3-step flow.

**Status**: Done

**Pending (see US-002)**:
- TOTP / authenticator app support
- Backup codes
- SMS OTP delivery

---

### 4. Account activation flow for new users (invitation link)

**As a** newly invited user  
**I want** to activate my account via an invitation link sent to my email  
**So that** I can set my password and begin using the system

**Implementation**: `TenantProvisioningService` generates an `InvitationToken` on tenant creation and emails the Tenant Admin. The activation form is served at `/activate/` (`apps/users/web_views.py`, `templates/auth/activate.html`). `POST /api/v1/users/activate/` validates the token and sets the password.

**Status**: Done (for Tenant Admin activation — bulk invite/CSV pending)

**Pending (see US-005)**:
- Bulk user invitation via CSV
- Resend invitation button (platform admin)
- Invitation expiry cleanup task

---

### 5. Tenant dashboard (basic live operational metrics)

**As a** Tenant Admin  
**I want** a dashboard showing basic live operational metrics on login  
**So that** I have an immediate view of my organisation's activity

**Implementation**: `apps/core/portal_views.py` — `dashboard_page` view renders `templates/dashboard/index.html`. Platform host redirects to `/admin/`. Routed at `/dashboard/`.

**Status**: Done

---

## Pending

| Item | Notes |
|------|-------|
| TOTP / authenticator app support | Tracked under US-002 |
| SMS OTP delivery | Tracked under US-002 |
| Bulk CSV user invitation | Tracked under US-005 |
| Resend invitation (platform admin) | Tracked under US-005 |
