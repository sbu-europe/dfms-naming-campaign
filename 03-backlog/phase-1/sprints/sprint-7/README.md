---
title: Sprint 7 — Phone Login / Phone 2FA & SMS Invitation with URL Shortener
sprint: Sprint 7
phase: Phase 1
dates: "2026-07-16 → 2026-07-30"
status: Planning
carry_from: Sprint 6
carry_to: Sprint 8
total_story_points_estimated: "~3 SP delivered in-sprint (VM-09); AUTH-01 13 SP carried to Sprint 8"
---

# Sprint 7 — Phone Login / Phone 2FA & SMS Invitation with URL Shortener

| | |
|---|---|
| **Sprint Dates** | 2026-07-16 → 2026-07-30 |
| **Carry-over from Sprint 6** | To be confirmed at sprint planning |
| **Carried to Sprint 8** | [AUTH-01](../sprint-8/01-auth-phone-channel/AUTH-01-phone-login-2fa-sms-invitation.md) (13 SP); improvements [FB-009–FB-015](../sprint-8/improvements/README.md) |
| **New Scope (in-sprint)** | TP/TDO read-only Vendors Profile list (VM-09) |
| **Related prior work** | CP-03 / CP-04 (email 2FA + invitation), CP-03 FB-005 (OTP channel email\|SMS — Open), US-002, US-005, US-006, BUG-05; VM-02 |
| **Feedback tracker** | [feedback.md](./feedback.md) — FB-001–FB-008 (closed); FB-009–FB-015 → [Sprint 8 improvements](../sprint-8/improvements/README.md) |

---

## Sprint Goals

1. **Phone channel for Tenant Super Admin / Tenant Admin** — admins can choose **Phone** as the invitee’s **login method** and **Login 2FA** option, alongside today’s **Email** / **None** paths. → **Carried to [Sprint 8](../sprint-8/README.md) (AUTH-01).**
2. **SMS invitation parity with email** — when Phone is selected, the invitee receives an activation invitation on their phone (SMS) that drives the **same** activation / OTP / set-password / status lifecycle as the email invitation flow (CP-04 / US-005). → **Carried to Sprint 8.**
3. **Tenant-aware URL shortener for SMS links** — deliver a first-party, **tenant-scoped** URL shortener so SMS activation (and related) links fit SMS length limits, resolve only within the owning tenant, and land on the same secure activation destination as the long email link. → **Carried to Sprint 8.**
4. **Vendors Profile read-only for TP & TDO** — Transport Planner and TDO (Vendor Fleet) can open the Vendor List, view details/status, and search/filter/sort, without create/edit/approve/reject/suspend/delete.

---

## Epic Summary

| # | Epic | Key Stories | SP | Status |
|---|------|-------------|----|--------|
| 01 | Auth — Phone Channel & SMS Invitation | [AUTH-01](../sprint-8/01-auth-phone-channel/AUTH-01-phone-login-2fa-sms-invitation.md) | 13 | **Carried to Sprint 8** |
| 02 | Vendor Management — Vendors Profile | [VM-09](02-vendor-management/VM-09-vendors-profile-readonly-tp-tdo.md) | 3 | New — Sprint 7 Scope |

**In-sprint estimated**: ~3 SP (VM-09). AUTH-01 tracked under [Sprint 8](../sprint-8/README.md).

---

## Sprint 7 Scope — Sub-task Index

### Epic 01: Auth — Phone Channel & SMS Invitation (AUTH-01) — carried to Sprint 8

Full sub-task index lives on the story under Sprint 8: [AUTH-01](../sprint-8/01-auth-phone-channel/AUTH-01-phone-login-2fa-sms-invitation.md). Stub at the original path: [01-auth-phone-channel/](./01-auth-phone-channel/AUTH-01-phone-login-2fa-sms-invitation.md).

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

---

**Next**: [Sprint 8](../sprint-8/README.md)
