---
title: Sprint 9 — Vendor Mobile Auth, Multi-Role Assignment & Own-Fleet Vehicle Plan
sprint: Sprint 9
phase: Phase 1
dates: "2026-08-18 – TBD"
status: In Progress
carry_from: Sprint 8
total_story_points_estimated: "~8 SP (VAPP-03) + 13 SP (TUM-06) + 21 SP (VP-01) + FB-001–FB-004"
---

# Sprint 9 — Vendor Mobile Auth, Multi-Role Assignment & Own-Fleet Vehicle Plan

| | |
|---|---|
| **Sprint Dates** | 2026-08-18 – TBD |
| **Carry-over from Sprint 8** | AUTH-01 SMS invitation / URL shortener (deferred — not part of this sprint scope) |
| **New Scope** | Vendor Mobile phone verification gate (VAPP-03); onboarding screen chrome restructure; forgot-password phone error unification; **multi-role assignment (TUM-06)**; **own-fleet vehicle plan / multi-TO (VP-01)** |
| **Related prior work** | Sprint 8 AUTH-01 (phone login/2FA admin portal); Sprint 6 VAPP-01–02 vendor app release readiness; Sprint 2 TUM-01 / US-005 (invitation — shipped single-role) |
| **Improvements tracker** | [`improvements/`](./improvements/README.md) — FB-001–FB-003 (vendor mobile UX); FB-004 (bulk import Valid/Invalid Status filter) |
| **Feedback tracker** | [`feedback-resolution.md`](./feedback-resolution.md) — UAT FB-001 (Open) |

---

## Sprint Goals

1. **Deliver VAPP-03** — Mandatory phone verification step inserted between email OTP and document onboarding; registration flow becomes 3-step (`Register → Email OTP → Phone OTP`).
2. **Harden onboarding & tenant-join chrome** — Profile header action and destructive Logout CTA replace the previous inline logout icon on onboarding and standalone tenant-join screens.
3. **Unify forgot-password phone error** — Unknown phone and unverified phone return the same no-account message; clients cannot enumerate verified vs unknown numbers.
4. **Deliver TUM-06** — Tenant Super Admin and Tenant Admin can assign **multiple** roles to one user (no fixed cap; Tenant Admin may also hold operational roles); Tenant Super Admin stays one-role-only; the user **Select Role**s like Select POI and operates as that role only (no permission union). Do not reopen TUM-01.
5. **Deliver VP-01** — Own-fleet **Vehicle Plan**: every TO gets a default plan; Transport Planner can add multiple **Created** TOs (any TR) to one vehicle; yard is **vehicle-first**, scale once, Command Center assigns LUP **per TO**, each TO keeps its own status.

---

## Epic Summary

| # | Epic | Key Stories | SP | Status |
|---|------|-------------|----|--------|
| 01 | Vendor Mobile — Phone Verification Gate & Onboarding UX | [VAPP-03](01-vendor-mobile-auth/VAPP-03-phone-verification-onboarding-ux.md) | 8 | In Progress |
| 02 | Tenant User Management — Multi-Role Assignment | [TUM-06](02-tenant-user-management/TUM-06-multi-role-assignment.md) | 13 | Pending |
| 03 | Own-Fleet Vehicle Plan (Multi-TO) | [VP-01](03-vehicle-plan/VP-01-own-fleet-vehicle-plan-multi-to.md) | 21 | Pending |

**Total estimated**: ~8 SP (VAPP-03) + 13 SP (TUM-06) + 21 SP (VP-01) + FB-001–FB-004 improvements

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

### Epic 02: Tenant User Management — Multi-Role Assignment (TUM-06)

| Sub-task | Story | Description | Priority |
|----------|-------|-------------|----------|
| TUM-06-1 | TUM-06 | Lock policy with PO; update `rbac.md` §3.1 and `tenant-user-management.md` | High |
| TUM-06-2 | TUM-06 | Drop single-role unique constraint; `assign_role_to_user` adds instead of replace | High |
| TUM-06-3 | TUM-06 | Invitation applies all `role_ids` (not only `[0]`) | High |
| TUM-06-4 | TUM-06 | Admin invite/edit multi-select + per-role POI (Tenant Super Admin and Tenant Admin) | High |
| TUM-06-5 | TUM-06 | CSV comma-separated roles + row-level forbidden-combo errors | Medium |
| TUM-06-6 | TUM-06 | Select Role switcher (like Select POI); session working role; admin/API use that role only | High |
| TUM-06-7 | TUM-06 | Audit role set on assign/remove; acting working role on later events | Medium |
| TUM-06-8 | TUM-06 | Unit tests: switcher, forbidden combos, no cap; both assigners; single-role hides switcher | High |

### Epic 03: Own-Fleet Vehicle Plan — Multi-TO (VP-01)

| Sub-task | Story | Description | Priority |
|----------|-------|-------------|----------|
| VP-01-1 | VP-01 | Update TCR-001/002 to plan-scoped; note Vehicle Plan in TO/yard specs | High |
| VP-01-2 | VP-01 | `VehiclePlan` + members; backfill one plan per existing own-fleet TO | High |
| VP-01-3 | VP-01 | Default plan on TO create; planner add/remove Created TOs (any TR) | High |
| VP-01-4 | VP-01 | One active plan per vehicle; dispatch / start-trip fan-out to members | High |
| VP-01-5 | VP-01 | Gate-in vehicle-first; eligible TO checklist (default all on, uncheck allowed) | High |
| VP-01-6 | VP-01 | One scale cycle per visit; CC assigns LUP per member TO | High |
| VP-01-7 | VP-01 | Load/unload per TO; gate-out blocked until all visit members complete this leg | High |
| VP-01-8 | VP-01 | Planner plan screen + gate/CC admin UX | High |
| VP-01-9 | VP-01 | Audit + unit tests (default plan, mixed TR, uncheck, per-TO LUP) | High |

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
- **TUM-06:** PO must confirm allow-list vs any allowed combination (Open Question 1) before persistence work (TUM-06-2). v1 default: **no fixed cap**; **Tenant Super Admin and Tenant Admin** are the assigners. **Tenant Admin may hold operational roles too.** Only **Tenant Super Admin** stays one-role-only (Driver / Helper / Vendor also exclusive). Do not reopen TUM-01. Do not add a story under `01-source/01-prd/`.
- **VP-01:** Membership and route mix are the Transport Planner’s decision (Created TOs only, any TR). Own fleet only. Gate-in is vehicle-first with eligible TOs default-on and uncheck allowed. Scale once per visit; CC assigns LUP per TO. Individual TO status stays. Capacity overfill warns, does not block, unless PO later tightens it.

---

## Out of Scope (unless added at planning)

- AUTH-01 URL shortener / SMS invitation for admin portal (Sprint 8 carry-over — tracked separately)
- Vendor Mobile password change from profile (separate improvement)
- TOTP / authenticator app; trusted device cookie
- Tenant Super Admin + any other role; Driver/Helper/Vendor + staff combo; Dynamic Role Builder (Phase 2)
- Rewriting or adding a story file under `01-source/01-prd/` (BA PRD delta is separate)
- Vendor-fleet Vehicle Plans (VP-01 is own fleet only; `TransportOrderBundle` unchanged)
- Splitting weighbridge net weight across TOs (VP-01 scale is vehicle-level)

---

**Previous**: [Sprint 8](../sprint-8/README.md)
