---
title: Sprint 9 — Vendor Mobile Auth & Onboarding UX Hardening
sprint: Sprint 9
phase: Phase 1
dates: "2026-08-18 – TBD"
status: In Progress
carry_from: Sprint 8
total_story_points_estimated: "~8 SP (VAPP-03) + FB-001–FB-004"
---

# Sprint 9 — Vendor Mobile Auth & Onboarding UX Hardening

| | |
|---|---|
| **Sprint Dates** | 2026-08-18 – TBD |
| **Carry-over from Sprint 8** | AUTH-01 SMS invitation / URL shortener (deferred — not part of this sprint scope) |
| **New Scope** | Vendor Mobile phone verification gate (VAPP-03); onboarding screen chrome restructure; forgot-password phone error unification |
| **Related prior work** | Sprint 8 AUTH-01 (phone login/2FA admin portal); Sprint 6 VAPP-01–02 vendor app release readiness |
| **Improvements tracker** | [`improvements/`](./improvements/README.md) — FB-001–FB-003 (vendor mobile UX); FB-004 (bulk import Valid/Invalid Status filter) |
| **Feedback tracker** | [`feedback-resolution.md`](./feedback-resolution.md) — UAT FB-001–FB-002 (Resolved) |
| **UAT feedback** | [`uat-feedback.md`](./uat-feedback.md) — UAT-001 Type RM label (Open) |

---

## Sprint Goals

1. **Deliver VAPP-03** — Mandatory phone verification step inserted between email OTP and document onboarding; registration flow becomes 3-step (`Register → Email OTP → Phone OTP`).
2. **Harden onboarding & tenant-join chrome** — Profile header action and destructive Logout CTA replace the previous inline logout icon on onboarding and standalone tenant-join screens.
3. **Unify forgot-password phone error** — Unknown phone and unverified phone return the same no-account message; clients cannot enumerate verified vs unknown numbers.

---

## Epic Summary

| # | Epic | Key Stories | SP | Status |
|---|------|-------------|----|--------|
| 01 | Vendor Mobile — Phone Verification Gate & Onboarding UX | [VAPP-03](01-vendor-mobile-auth/VAPP-03-phone-verification-onboarding-ux.md) | 8 | In Progress |

**Total estimated**: ~8 SP (VAPP-03) + FB-001–FB-004 improvements

---

## Sprint 9 Scope — Sub-task Index

### Epic 01: Vendor Mobile — Phone Verification Gate & Onboarding UX (VAPP-03)

| Sub-task | Story | Description | Priority |
|----------|-------|-------------|----------|
| VAPP-03-1 | VAPP-03 | Add `phoneVerified` to `AppSessionState` / shared prefs; gate logic in `SessionNavigationGate` | High |
| VAPP-03-2 | VAPP-03 | New phone verification screen — send OTP + OTP input boxes (step 3 of 3) | High |
| VAPP-03-3 | VAPP-03 | Wire email OTP success → phone verify screen (not directly to onboarding) | High |
| VAPP-03-4 | VAPP-03 | Onboarding & tenant-join header: Profile CTA (top-right) + red Logout button (bottom) | Medium |
| VAPP-03-5 | VAPP-03 | Forgot-password phone error unification — 404 and 403 map to single no-account message | Medium |
| VAPP-03-6 | VAPP-03 | l10n, Maestro flow update, backend test alignment | Medium |

### Improvements (FB-001–FB-004)

See [`improvements/`](./improvements/README.md).

| ID | Area | Summary | Priority | Status |
|----|------|---------|----------|--------|
| FB-001 | Vendor Mobile — Onboarding chrome | Profile header + destructive Logout CTA on onboarding and standalone tenant-join screens | Medium | Resolved |
| FB-002 | Vendor Mobile — Auth | Phone verification screen inserted after email OTP; `SessionDestination.phoneVerification` gate | High | Resolved |
| FB-003 | Vendor Mobile — Auth | Forgot-password phone: unified no-account error for unknown + unverified phone | Medium | Resolved |
| FB-004 | Master Data · Users · Drivers — Bulk I/O | Status filter Valid / Invalid on imported records after Excel / bulk import (clearable; Tenant Admin + Tenant Super Admin) | Medium | Open |

---

## Dependencies & Decisions to Confirm

- SMS OTP gateway must be live in the dev environment to run the phone-verification flow end-to-end; Maestro phone-verify cases are **Skipped** until a stub/inbox path is available (same OTP policy as email OTP).
- Existing phone-verified vendors (who completed onboarding before this sprint) are **not** forced through the phone-verification gate — gate is gated on `onboardingComplete == false`.
- `PhoneNotVerifiedError` (403) is no longer raised by `request_password_reset_otp`; both unknown and unverified phone now raise `NotFoundError` (404).

---

## Out of Scope (unless added at planning)

- AUTH-01 URL shortener / SMS invitation for admin portal (Sprint 8 carry-over — tracked separately)
- Vendor Mobile password change from profile (separate improvement)
- TOTP / authenticator app; trusted device cookie

---

**Previous**: [Sprint 8](../sprint-8/README.md)
