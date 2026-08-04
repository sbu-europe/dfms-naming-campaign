---
title: Sprint 8 — Phone Auth Carry-over & Bulk I/O Improvements Close-out
sprint: Sprint 8
phase: Phase 1
dates: "TBD"
status: Planning
carry_from: Sprint 7
total_story_points_estimated: "~13 SP (AUTH-01 carry-over) + FB-001–FB-007"
---

# Sprint 8 — Phone Auth Carry-over & Bulk I/O Improvements Close-out

| | |
|---|---|
| **Sprint Dates** | TBD |
| **Carry-over from Sprint 7** | [AUTH-01](01-auth-phone-channel/AUTH-01-phone-login-2fa-sms-invitation.md) (13 SP); improvements [FB-001–FB-007](./improvements/README.md) |
| **New Scope** | To be confirmed at sprint planning |
| **Related prior work** | Sprint 7 VM-09 delivered; Sprint 7 feedback FB-001–FB-008 closed |
| **Improvements tracker** | [`improvements/`](./improvements/README.md) — carried Sprint 7 items FB-001–FB-007 (by module) |

---

## Sprint Goals

1. **Deliver AUTH-01 (carry-over)** — Phone login method & Phone 2FA; SMS invitation parity with email; first-party URL shortener for SMS-safe activation links.
2. **Close remaining bulk I/O improvements** — finish open Sprint 7 carry-over items (notably FB-007 Product Sub-Category bulk); keep Resolved FB-001–FB-006 tracked here for Sprint 8 close-out.

---

## Epic Summary

| # | Epic | Key Stories | SP | Status |
|---|------|-------------|----|--------|
| 01 | Auth — Phone Channel & SMS Invitation | [AUTH-01](01-auth-phone-channel/AUTH-01-phone-login-2fa-sms-invitation.md) | 13 | Carry-over from Sprint 7 |

**Total estimated (carry-over)**: ~13 SP (+ improvements close-out)

---

## Sprint 8 Scope — Sub-task Index

### Epic 01: Auth — Phone Channel & SMS Invitation (AUTH-01) — carry-over

| Sub-task | Story | Description | Priority |
|----------|-------|-------------|----------|
| AUTH-01-1 | AUTH-01 | Admin UI — Login Method + Login 2FA options include Phone; phone mandatory when Phone selected | High |
| AUTH-01-2 | AUTH-01 | SMS invitation dispatch — same lifecycle as email (token, expiry, resend, status) | High |
| AUTH-01-3 | AUTH-01 | Tenant-aware URL shortener — create / resolve / revoke short links scoped to the inviting tenant | High |
| AUTH-01-4 | AUTH-01 | Wire invitation SMS to shortener (SMS body uses short URL only) | High |
| AUTH-01-5 | AUTH-01 | Phone login (identifier = phone + password) when Login Method = Phone | High |
| AUTH-01-6 | AUTH-01 | Phone 2FA OTP at login & activation — same rules as email OTP (TTL, resend, lockout) | High |
| AUTH-01-7 | AUTH-01 | Audit, RBAC, delivery failure handling, regression (email path unchanged) | Medium |
| AUTH-01-8 | AUTH-01 | Tests + manual/E2E coverage for phone invite → activate → login → phone 2FA | Medium |

### Improvements carry-over (FB-001–FB-007)

See [`improvements/`](./improvements/README.md). E2E plans: [`09-testing/.../e2e-scenarios/sprint-8/`](../../../09-testing/backend/e2e-scenarios/sprint-8/README.md).

---

## Dependencies & Decisions to Confirm

Same open questions as AUTH-01 (SMS provider, short domain, Platform Super Admin phone invite, email-on-phone-invite policy). See the story file.

---

## Out of Scope (unless added at planning)

- Sprint 7 VM-09 (delivered under Sprint 7)
- Vendor Mobile phone/OTP flows
- TOTP / authenticator app; trusted device cookie

---

**Previous**: [Sprint 7](../sprint-7/README.md)
