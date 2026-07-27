---
title: Sprint 7 — Phone Login / Phone 2FA & SMS Invitation with URL Shortener
sprint: Sprint 7
phase: Phase 1
dates: "2026-07-16 → 2026-07-30"
status: Planning
carry_from: Sprint 6
total_story_points_estimated: "~13 SP (AUTH-01)"
---

# Sprint 7 — Phone Login / Phone 2FA & SMS Invitation with URL Shortener

| | |
|---|---|
| **Sprint Dates** | 2026-07-16 → 2026-07-30 |
| **Carry-over from Sprint 6** | To be confirmed at sprint planning |
| **New Scope** | Phone as selectable login method & 2FA channel; SMS invitation parity with email; first-party URL shortener for SMS-safe activation links |
| **Related prior work** | CP-03 / CP-04 (email 2FA + invitation), CP-03 FB-005 (OTP channel email\|SMS — Open), US-002, US-005, US-006, BUG-05 |
| **Feedback tracker** | [feedback.md](./feedback.md) — Sprint 7 client/ops feedback (FB-001 Resolved) |

---

## Sprint Goals

1. **Phone channel for Tenant Super Admin / Tenant Admin** — admins can choose **Phone** as the invitee’s **login method** and **Login 2FA** option, alongside today’s **Email** / **None** paths.
2. **SMS invitation parity with email** — when Phone is selected, the invitee receives an activation invitation on their phone (SMS) that drives the **same** activation / OTP / set-password / status lifecycle as the email invitation flow (CP-04 / US-005).
3. **Tenant-aware URL shortener for SMS links** — deliver a first-party, **tenant-scoped** URL shortener so SMS activation (and related) links fit SMS length limits, resolve only within the owning tenant, and land on the same secure activation destination as the long email link.

---

## Epic Summary

| # | Epic | Key Stories | SP | Status |
|---|------|-------------|----|--------|
| 01 | Auth — Phone Channel & SMS Invitation | [AUTH-01](01-auth-phone-channel/AUTH-01-phone-login-2fa-sms-invitation.md) | 13 | New — Sprint 7 Scope |

**Total estimated**: ~13 SP

---

## Sprint 7 Scope — Sub-task Index

### Epic 01: Auth — Phone Channel & SMS Invitation (AUTH-01)

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

---

## Dependencies & Decisions to Confirm

| Topic | Assumption in AUTH-01 | Needs PO / client confirm? |
|-------|----------------------|----------------------------|
| Who may configure Phone channel | Tenant Super Admin and Tenant Admin (delegate) for users they are allowed to invite/edit | Yes — confirm Platform Super Admin tenant-provisioning invite also supports Phone |
| Email when Phone invite | Phone **mandatory**; email **still collected** when available (account record) but invitation **delivery** is SMS-only for Phone channel | Yes |
| SMS gateway | Abstracted provider (Twilio / AWS SNS / local gateway) behind notification channel interface | Yes — provider choice |
| Shortener hosting | First-party short domain (e.g. `dfms.link` / configurable base) owned by DFMS | Yes — domain & retention |
| Closes | CP-03 **FB-005** (OTP channel email\|SMS) for admin portal | Yes |

---

## Out of Scope (Sprint 7)

- Vendor Mobile phone/OTP flows (already separate)
- TOTP / authenticator app (US-002 pending)
- Trusted device cookie (CP-03 FB-004)
- Changing role/permission model for Tenant Super Admin vs Tenant Admin (see Sprint 6 FB / tenant-user-management-v2)
