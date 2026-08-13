---
title: Sprint 8 — Phone Auth Carry-over & Workflow Improvements
sprint: Sprint 8
phase: Phase 1
dates: "TBD"
status: Planning
carry_from: Sprint 7
total_story_points_estimated: "~13 SP (AUTH-01 carry-over) + FB-001–FB-014"
---

# Sprint 8 — Phone Auth Carry-over & Workflow Improvements

| | |
|---|---|
| **Sprint Dates** | TBD |
| **Carry-over from Sprint 7** | [AUTH-01](01-auth-phone-channel/AUTH-01-phone-login-2fa-sms-invitation.md) (13 SP); improvements [FB-001–FB-007](./improvements/README.md) |
| **New Scope** | Workflow / display improvements [FB-008–FB-014](./improvements/README.md) (PR lock, TR weight columns, Transport Planner remaining qty/weight, Driver My Trips cargo weight) |
| **Related prior work** | Sprint 7 VM-09 delivered; Sprint 7 feedback FB-001–FB-008 closed |
| **Improvements tracker** | [`improvements/`](./improvements/README.md) — FB-001–FB-007 (carry-over, Resolved); FB-008–FB-028 (new) |
| **Feedback tracker** | [`feedback-resolution.md`](./feedback-resolution.md) — client FB-001–FB-002 (Open) |

---

## Sprint Goals

1. **Deliver AUTH-01 (carry-over)** — Phone login method & Phone 2FA; SMS invitation parity with email; first-party URL shortener for SMS-safe activation links.
2. **Close remaining bulk I/O improvements** — finish open Sprint 7 carry-over items (notably FB-007 Product Sub-Category bulk); keep Resolved FB-001–FB-006 tracked here for Sprint 8 close-out.
3. **Deliver workflow / display improvements (FB-008–FB-014)** — PR post-submit lock; TR Total Weight for Distribution/Procurement; Transport Planner Remaining Weight / Remaining Quantity; TO details PR line items; Driver My Trips Allocated Weight.

---

## Epic Summary

| # | Epic | Key Stories | SP | Status |
|---|------|-------------|----|--------|
| 01 | Auth — Phone Channel & SMS Invitation | [AUTH-01](01-auth-phone-channel/AUTH-01-phone-login-2fa-sms-invitation.md) | 13 | Carry-over from Sprint 7 |

**Total estimated (carry-over)**: ~13 SP (+ improvements close-out + FB-008–FB-014)

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

### Improvements carry-over (FB-001–FB-007) + new (FB-008–FB-015)

See [`improvements/`](./improvements/README.md). E2E plans: [`09-testing/.../e2e-scenarios/sprint-8/`](../../../09-testing/backend/e2e-scenarios/sprint-8/README.md).

| ID | Area | Summary | Priority | Status |
|----|------|---------|----------|--------|
| FB-008 | Product Requisition | PR locked from edit after submission (Depot / Feed Mill / Commercial Officers) | High | Resolved |
| FB-009 | Transport Requests | TR list: Total Weight (KG) instead of Total Quantity (DO / DM / PO) | Medium | Resolved |
| FB-010 | Transport Requests | TR details & line items: Total Weight (KG) + Total Quantity | Medium | Resolved |
| FB-011 | Transport Planner | TR list: Remaining Weight (KG) for planning | High | Resolved |
| FB-012 | Transport Planner | TO creation: Remaining Quantity on Allocated Quantity Per Product | High | Resolved |
| FB-013 | Transport Planner | TO details: PR line items table not showing after creation | High | Open |
| FB-014 | Driver My Trips | Cargo table: Allocated Weight with Allocated Quantity | Medium | Open |
| FB-015 | Transport Planner | TO creation: Allocating TO Load live sum in MT (kg) | Medium | Resolved |

### Client feedback (FB-001–FB-002)

See [`feedback-resolution.md`](./feedback-resolution.md).

| ID | Area | Summary | Priority | Status |
|----|------|---------|----------|--------|
| FB-001 | Master Data / Vehicles · TO assignment | Show wheel information beside vehicle capacity | Medium | Open |
| FB-002 | Users / Drivers | last_name optional on user and driver | Medium | Open |

---

## Dependencies & Decisions to Confirm

Same open questions as AUTH-01 (SMS provider, short domain, Platform Super Admin phone invite, email-on-phone-invite policy). See the story file.

FB-008 may supersede post-submit Urgency edit (Sprint 3 PR-01 / FB-004) for requester roles — confirm cancel-after-submit remains allowed.

---

## Out of Scope (unless added at planning)

- Sprint 7 VM-09 (delivered under Sprint 7)
- Vendor Mobile phone/OTP flows
- TOTP / authenticator app; trusted device cookie

---

**Previous**: [Sprint 7](../sprint-7/README.md)
