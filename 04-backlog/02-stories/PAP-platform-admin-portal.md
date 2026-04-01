---
title: Platform Admin Portal
story_id: PAP
phase: phase-1
module: Platform Admin
priority: Critical
status: In Progress
epic: Platform Admin Portal
epic_id: EPIC-002
epic_name: User & Tenant Foundation
sprint: Sprint 1 — Infrastructure, Onboarding & Secure Login
story_points: 16
created: 2026-03-31
updated: 2026-03-31
completion: ~90%
related_stories:
  - US-098-tenant-onboarding.md
  - US-002-multi-factor-auth.md
tags: [platform-admin, portal, branding, login, dashboard, tenant-management]
---

# Platform Admin Portal

## Summary

The DFMS platform admin portal (`admin.dfms.com`) is a custom-branded Django admin surface used exclusively by the DFMS/BS23 team to manage client tenants. It replaces the default Django admin look with the DFMS design system and adds a secure 2FA login flow for Super Admins.

---

## Stories Delivered

### 1. Custom-branded admin interface

**As a** Super Admin  
**I want** the admin portal to use the DFMS design system  
**So that** the platform feels professional and consistent rather than using default Django styling

**Implementation**: 3,300+ line CSS override applied to `templates/admin/base_site.html` and `static/`. Dark/light theme. Custom branding on login, dashboard, and all admin list/detail views.

**Status**: Done

---

### 2. Secure platform admin login with email OTP (2FA second factor)

**As a** Super Admin  
**I want** to be required to verify via email OTP after entering my password  
**So that** my high-privilege platform account has a second layer of protection

**Implementation**: `apps/core/admin_otp.py` patches Django admin's `.login()` method. After correct password, a signed cookie (`dfms_admin_pending`) is set, an OTP is sent via Celery, and the user is redirected to the OTP challenge page (`templates/admin/otp_challenge.html`). Valid OTP completes login; wrong or expired OTP rejects. Called via `patch_admin_login()` in `apps/core/apps.py`.

**Status**: Done

---

### 3. Platform admin dashboard (key metrics)

**As a** Super Admin  
**I want** a dashboard showing key platform metrics at a glance  
**So that** I can see overall platform health without drilling into individual records

**Implementation**: Custom Django admin index, patched via `config/admin.py`. Shows tenant counts, subscription tiers, and platform-level indicators.

**Status**: Done

---

### 4. Tenant Management — view and update client accounts

**As a** Super Admin  
**I want** to view, update, and suspend client tenant accounts  
**So that** I can manage the platform's client base

**Implementation**: `apps/tenants/admin.py` — `TenantAdmin` (`PlatformOnlyAdminMixin`) with list view, edit form, and suspend action. Protected to platform schema only.

**Status**: Done

**Pending (see US-098)**:
- Dedicated tenant reactivation action
- Resend welcome email button

---

## Pending

| Item | Notes |
|------|-------|
| Tenant reactivation endpoint | Tracked under US-098 |
| Resend activation email button | Tracked under US-098 |
