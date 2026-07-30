---
title: Sprint 7 — Phone Login / Phone 2FA & SMS Invitation with URL Shortener
sprint: Sprint 7
phase: Phase 1
dates: "2026-07-16 → 2026-07-30"
status: Planning
carry_from: Sprint 6
total_story_points_estimated: "~16 SP (AUTH-01 13 + VM-09 3)"
---

# Sprint 7 — Phone Login / Phone 2FA & SMS Invitation with URL Shortener

| | |
|---|---|
| **Sprint Dates** | 2026-07-16 → 2026-07-30 |
| **Carry-over from Sprint 6** | To be confirmed at sprint planning |
| **New Scope** | Phone as selectable login method & 2FA channel; SMS invitation parity with email; first-party URL shortener for SMS-safe activation links; TP/TDO read-only Vendors Profile list |
| **Related prior work** | CP-03 / CP-04 (email 2FA + invitation), CP-03 FB-005 (OTP channel email\|SMS — Open), US-002, US-005, US-006, BUG-05; VM-02 |
| **Feedback tracker** | [feedback.md](./feedback.md) — Sprint 7 client/ops/internal feedback |

---

## Sprint Goals

1. **Phone channel for Tenant Super Admin / Tenant Admin** — admins can choose **Phone** as the invitee’s **login method** and **Login 2FA** option, alongside today’s **Email** / **None** paths.
2. **SMS invitation parity with email** — when Phone is selected, the invitee receives an activation invitation on their phone (SMS) that drives the **same** activation / OTP / set-password / status lifecycle as the email invitation flow (CP-04 / US-005).
3. **Tenant-aware URL shortener for SMS links** — deliver a first-party, **tenant-scoped** URL shortener so SMS activation (and related) links fit SMS length limits, resolve only within the owning tenant, and land on the same secure activation destination as the long email link.
4. **Vendors Profile read-only for TP & TDO** — Transport Planner and TDO (Vendor Fleet) can open the Vendor List, view details/status, and search/filter/sort, without create/edit/approve/reject/suspend/delete.

---

## Epic Summary

| # | Epic | Key Stories | SP | Status |
|---|------|-------------|----|--------|
| 01 | Auth — Phone Channel & SMS Invitation | [AUTH-01](01-auth-phone-channel/AUTH-01-phone-login-2fa-sms-invitation.md) | 13 | New — Sprint 7 Scope |
| 02 | Vendor Management — Vendors Profile | [VM-09](02-vendor-management/VM-09-vendors-profile-readonly-tp-tdo.md) | 3 | New — Sprint 7 Scope |

**Total estimated**: ~16 SP

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

### Epic 02: Vendor Management — Vendors Profile (VM-09)

| Sub-task | Story | Description | Priority |
|----------|-------|-------------|----------|
| VM-09-1 | VM-09 | RBAC — Vendor List view/read for TP & TDO; no write / lifecycle actions | Critical |
| VM-09-2 | VM-09 | Vendor List — TP/TDO can view details & status; search / filter / sort | Critical |
| VM-09-3 | VM-09 | Hide/disable Add, Change, Approve, Reject, Suspend, Delete (and bulk) for TP/TDO | Critical |
| VM-09-4 | VM-09 | Server-side guards block mutating vendor actions for TP/TDO | Critical |
| VM-09-5 | VM-09 | Tests — read-only TP/TDO vs Tenant Admin management path | High |

---

## Dependencies & Decisions to Confirm

| Topic | Assumption in AUTH-01 | Needs PO / client confirm? |
|-------|----------------------|----------------------------|
| Who may configure Phone channel | Tenant Super Admin and Tenant Admin (delegate) for users they are allowed to invite/edit | Yes — confirm Platform Super Admin tenant-provisioning invite also supports Phone |
| Email when Phone invite | Phone **mandatory**; email **still collected** when available (account record) but invitation **delivery** is SMS-only for Phone channel | Yes |
| SMS gateway | Abstracted provider (Twilio / AWS SNS / local gateway) behind notification channel interface | Yes — provider choice |
| Shortener hosting | First-party short domain (e.g. `dfms.link` / configurable base) owned by DFMS | Yes — domain & retention |
| Closes | CP-03 **FB-005** (OTP channel email\|SMS) for admin portal | Yes |

| Topic | Assumption in VM-09 | Needs PO / client confirm? |
|-------|---------------------|----------------------------|
| Roles with read-only Vendor List | **Transport Planner** and **TDO (Vendor Fleet)** only | Yes — confirm any other roles |
| Detail depth | List + view details/status (no management actions) | Yes — confirm field set if restricted |

---

## Out of Scope (Sprint 7)

- Vendor Mobile phone/OTP flows (already separate)
- TOTP / authenticator app (US-002 pending)
- Trusted device cookie (CP-03 FB-004)
- Changing role/permission model for Tenant Super Admin vs Tenant Admin (see Sprint 6 FB / tenant-user-management-v2)
- TP/TDO vendor create / edit / approve / reject / suspend / delete (explicitly excluded by VM-09)
