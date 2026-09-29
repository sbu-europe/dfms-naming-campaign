# Change Request: Staff phone invitation, login & forgot password

**CR Number**: CR-002  
**To**: DFMS Product Context Team  
**From**: Backend / Product implementation (Nourish)  
**Date**: 2026-07-28  
**Priority**: High  
**Category**: Business / Documentation / Technical  
**Status**: ✅ Implemented

---

## 📋 Executive Summary

Phase 1 product context previously stated that staff users are invited and recovered **via email only**. Implementation now supports **email or phone** invitation channels (no mock placeholder emails), **admin login by email or phone** (BD `+88` + 11-digit local), and **forgot-password** via a single identifier field with channel-aware email/SMS delivery. This CR records that scope change and points docs at the overview in `05-modules/03-users/staff-invite-login-password-channels.md`.

**Impact**: Updates module specs, US-005/US-008 scope notes, and E2E plans so product context matches `nourish-backend`.

---

## 🎯 Purpose

**Background**: Staff onboarding needed phone-only users (no email). Login and password recovery must use the same identity channel as invitation.

**Problem Statement**: Product context still said “email only,” which contradicted shipped behavior and misled testing/planning.

---

## 🔍 Current State (before this CR)

- Invite: email mandatory; SMS/phone invite marked out of Phase 1.
- Login docs partially allowed email/phone; admin UI was email-centric in places.
- Forgot password: email-centric UI and delivery in specs/E2E notes.

**Affected Documents** (updated by this CR):
- `05-modules/03-users/staff-invite-login-password-channels.md` — **NEW** overview
- `05-modules/03-users/README.md`
- `05-modules/01-foundation/user-tenant-management.md`
- `05-modules/01-foundation/authentication-security.md`
- `05-modules/03-users/tenant-user-management.md`
- `05-modules/03-users/tenant-user-management-v2.md`
- `03-backlog/phase-1/sprints/sprint-2/02-tenant-user-management/US-005-user-invitation-activation.md`
- `03-backlog/phase-1/sprints/sprint-2/02-tenant-user-management/US-008-password-account-reset.md`
- `09-testing/backend/e2e-scenarios/users/user-invitation-activation-e2e-scenarios.md`
- `09-testing/backend/e2e-scenarios/users/password-account-reset-e2e-scenarios.md`

---

## 📝 Proposed Changes (implemented)

### Change 1: Channel overview document

**File**: `05-modules/03-users/staff-invite-login-password-channels.md`  
**Description**: Canonical overview of invite / login / forgot-password for email vs phone.

### Change 2: Align foundation + stories + E2E

**Description**: Replace “email only” Phase 1 notes; document phone invite, `+88` login prefix UX, single-field forgot password, SMS gated by `SMS_ENABLED`.

---

## 📊 Summary of Changes

| File | Change Type | Description |
|------|-------------|-------------|
| `05-modules/03-users/staff-invite-login-password-channels.md` | **NEW** | Channel overview |
| `05-modules/03-users/README.md` | **UPDATE** | Link overview |
| `05-modules/01-foundation/user-tenant-management.md` | **UPDATE** | Invite + reset channel rules |
| `05-modules/01-foundation/authentication-security.md` | **UPDATE** | Forgot-password channel delivery |
| `05-modules/03-users/tenant-user-management.md` | **UPDATE** | Activation summary |
| `05-modules/03-users/tenant-user-management-v2.md` | **UPDATE** | Remove “SMS out of Phase 1” |
| `03-backlog/phase-1/sprints/sprint-2/02-tenant-user-management/US-005-*.md` | **UPDATE** | Phase 1 phone invite scope |
| `03-backlog/phase-1/sprints/sprint-2/02-tenant-user-management/US-008-*.md` | **UPDATE** | Single identifier + SMS |
| `09-testing/.../user-invitation-*.md` | **UPDATE** | Phone invite in scope |
| `09-testing/.../password-account-reset-*.md` | **UPDATE** | Phone reset in scope |

---

## ✅ Benefits

1. Product context matches production/dev behavior.
2. Testers know phone invite/login/reset paths and SMS log fallback.
3. Future work has one overview instead of conflicting “email only” notes.

---

## 🔄 Impact Assessment

### Breaking Changes
- **Product scope**: Phone invitation is **in** Phase 1 for staff (was documented as out).
- **Data model**: `User.email` may be null for phone-invited users; phone uniqueness when set.

### Implementation Repos Impact
- `nourish-backend`: already implemented (invitation_service, AuthService, password_reset_service, admin login UI, SMS helpers).
- Mobile vendor flows are separate (vendor OTP); this CR is **staff/tenant admin** focused.

---

## 📝 Approval

**Status**: ✅ Implemented (docs aligned to shipped backend)  
**Implemented**: 2026-07-28  
**Comments**: Behavior verified in nourish-backend; SMS optional via env.

---

## 🔗 Related Documents

- [staff-invite-login-password-channels.md](../05-modules/03-users/staff-invite-login-password-channels.md)
- [Sprint 6 FB-032](../03-backlog/phase-1/sprints/sprint-6/feedback-resolution/01-users-and-access.md#fb-032--staff-invite--login--forgot-password-email-or-phone-channel)
- US-005, US-008

---

**Last Updated**: 2026-07-28  
**Version**: 1.0
