---
title: Sprint 6 Feedback — Vendor Management
module: 02-vendor-management
menu: Vendor Management / Vendor Mobile
parent: ./README.md
---

# Vendor Management

**Admin menu / area:** Vendor Management / Vendor Mobile  
**Tracker index:** [README.md](./README.md)

> **Resolution Status values**: `Open` → `In Progress` → `Resolved`

| ID | Title | Priority | Status |
|----|-------|----------|--------|
| [FB-002](#fb-002--vendor-registration-mobile-number-must-be-required) | Vendor registration mobile number must be required | Medium | Resolved |
| [FB-003](#fb-003--driver--helper-details-on-bid-award-editable-on-ongoing-to-until-complete) | Driver & helper details on bid award; editable on ongoing TO until complete | High | Resolved |
| [FB-004](#fb-004--truck-association-reference-must-be-a-document-upload-not-a-text-field) | Truck Association reference must be a document upload, not a text field | Medium | Resolved |
| [FB-015](#fb-015--vendor-mobile-proactive-jwt-refresh--session-hardening) | Vendor Mobile proactive JWT refresh & session hardening | High | Resolved |
| [FB-027](#fb-027--tenant-admin-multi-select-acceptreject-vendors) | Tenant Admin multi-select accept/reject vendors | Medium | Resolved |

---

## FB-002 — Vendor registration mobile number must be required

| Field | Value |
|-------|-------|
| **Source** | Sprint 6 demo — 2026-06-22 |
| **Affected Stories** | [VM-01](../../sprint-5/08-vendor-management/VM-01-vendor-mobile-onboarding.md), [VAPP-01](../03-vendor-app/VAPP-01-release-readiness-live-api.md), [VAPP-02](../03-vendor-app/VAPP-02-design-improvements.md) |
| **Sprint 4 origin** | [`sprint-4/08-vendor-management/VM-01-vendor-mobile-onbiorading.md`](../../../sprint-4/08-vendor-management/VM-01-vendor-mobile-onbiorading.md) — AC-1 (Self-Registration Form — company + contacts) |
| **Closing Sub-tasks** | VM-01-2, VM-01-6, VM-01-12 (amend); VAPP-01-2 (registration smoke pass) |
| **AC Amendment** | VM-01 AC-1: **Mobile number** (contact phone) is **mandatory** on vendor self-registration. Registration submit is blocked when mobile is blank or fails E.164 / national-format validation. Backend `POST/GET /api/v1/vendors/registrations` mirrors the same required-field rules as the Vendor Mobile wizard. |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | Current implementation treats `phone` as optional (`required=False, allow_blank=True` on registration serializers; Vendor Mobile `isValid` does not require phone). Distinct from tenant-admin contact phone bugs (BUG-01). |

### Demo observation

During vendor self-registration on the Vendor Mobile app, the vendor could complete registration **without** entering a mobile number. Operations and OTP/SMS flows expect a reachable mobile contact on every registered vendor.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-002) |
|--------|---------|-------------------|
| Mobile field on register form | Optional — submit allowed when blank | Required — submit blocked when blank or invalid |
| Backend validation | `phone` optional on create/update registration | `phone` required with same format rules as driver contact phone |
| Onboarding gate | Platform-active once docs + Truck Association ref complete | Platform-active also requires a valid mobile number on file |
| Vendor Mobile UX | No inline error when phone omitted | Field-level validation on blur/submit (align VAPP-02 form UX) |

---

---

## FB-003 — Driver & helper details on bid award; editable on ongoing TO until complete

| Field | Value |
|-------|-------|
| **Source** | Sprint 6 demo — 2026-06-22 |
| **Affected Stories** | [VM-07](../../sprint-5/08-vendor-management/VM-07-vehicle-driver-submission.md), [VM-06](../../sprint-5/08-vendor-management/VM-06-bid-evaluation.md), [VM-03](../../sprint-5/08-vendor-management/VM-03-vendor-portal-views.md), [TEVF-03](../../sprint-5/09-to-execution-vendor-fleet/TEVF-03-vendor-execution-confirmation.md), [VAPP-01](../03-vendor-app/VAPP-01-release-readiness-live-api.md) |
| **Sprint 4 origin** | [`sprint-4/08-vendor-management/VM-07-vehicle-driver-submission.md`](../../../sprint-4/08-vendor-management/VM-07-vehicle-driver-submission.md) — AC-1 / AC-2 / AC-3; [`sprint-4/09-to-execution-vendor-fleet/TEVF-03-vendor-execution-confirmation.md`](../../../sprint-4/09-to-execution-vendor-fleet/TEVF-03-vendor-execution-confirmation.md) |
| **Closing Sub-tasks** | VM-07-3, VM-07-4, VM-07-5, VM-07-6 (amend); VM-03-9 (ongoing-trip edit entry point); TEVF-03-3; VAPP-01-3 |
| **AC Amendment** | VM-07 AC-1 / AC-2: after a vendor **wins a bid** (VM-06 award) or receives contractual assignment, the vendor **must** submit **driver** execution details (`POST …/vehicle-driver`) before the TO can reach `ready_for_dispatch` / trip start. **Helper** details may be included on the same confirmation (zero or more); per helper, **name** and **NID** are **optional**. VM-07 AC-3 + VM-03: vendor may **edit** vehicle, driver, and helper details on an **ongoing** TO (lifecycle `in_progress`, before `completed`) via `PATCH …/vehicle-driver` with a required reason and audit trail — not only before first trip start. |
| **Status** | Resolved |
| **Priority** | High |
| **Notes** | VM-05 keeps bid submission rate-only (no fleet identity at bid time). FB-003 applies at **post-award confirmation** (VM-07), not at bid submit. Driver fields remain mandatory; helper list and per-helper name/NID stay optional (aligns with VM-07 AC-2). Confirmation POST is gated to `assigned`/`created` only; ongoing-trip edit may be missing or hidden in Vendor Mobile Active Trips UI. |

### Demo observation

After a vendor's bid was awarded, the expected handoff is for the vendor to confirm **driver** information (and optionally **helpers**) before execution. During an **ongoing** trip, the vendor should still be able to update vehicle, driver, and helper details (e.g. substitution, accident) until the trip is **completed** — with reason and audit — without waiting until a post-completion state.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-003) |
|--------|---------|-------------------|
| When details are captured | Post-award vehicle–driver confirmation (VM-07) | Same trigger — required immediately after award/assignment |
| Helper fields | Optional list; per-helper name/NID optional when provided | Unchanged — helper list optional; **name** and **NID** per helper remain **optional** |
| Trip-start gate | Blocked until VM-07 confirmation exists | Unchanged — still blocked until **driver** confirmation recorded (helpers not required for gate) |
| Edit window | Update-with-reason exists (VM-07 AC-3 / PATCH) | Edit allowed on **ongoing** TO (`in_progress`) until `completed`; surfaced on Active Trips detail in Vendor Mobile |
| Audit on edit | Reason + field-level audit (VM-07-4) | Unchanged — every edit requires reason and is logged |

---

---

## FB-004 — Truck Association reference must be a document upload, not a text field

| Field | Value |
|-------|-------|
| **Source** | Sprint 6 demo — 2026-06-22 |
| **Affected Stories** | [VM-01](../../sprint-5/08-vendor-management/VM-01-vendor-mobile-onboarding.md), [VAPP-02](../03-vendor-app/VAPP-02-design-improvements.md) |
| **Sprint 4 origin** | [`sprint-4/08-vendor-management/VM-01-vendor-mobile-onbiorading.md`](../../../sprint-4/08-vendor-management/VM-01-vendor-mobile-onbiorading.md) — AC-1, AC-2, AC-3 (Testimonial / reference from Truck Association) |
| **Closing Sub-tasks** | VM-01-4, VM-01-5, VM-01-6, VM-01-12 (amend) |
| **AC Amendment** | VM-01 AC-2 / AC-3: **Truck Association reference** is a **mandatory file upload** (same attachment pattern as Trade License, BIN, TIN — MIME/size policy, storage, audit). Remove free-text `testimonial_reference` / `notes` as the compliance gate. Onboarding submit and platform-active check require the Truck Association document on file alongside the other mandatory docs. |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | Current implementation stores Truck Association reference as text in `vendor.notes` (`testimonial_reference`); `has_testimonial_reference()` checks non-empty string, not a document row. `MANDATORY_DOC_TYPES` today is only Trade License, BIN, TIN. |

### Demo observation

During vendor registration, the vendor must submit compliance documents. **Truck Association reference** is currently captured as a **text field**, while Trade License, BIN, and TIN are **file attachments**. The client expects Truck Association reference to be uploaded as a **document** like the other mandatory compliance files.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-004) |
|--------|---------|-------------------|
| Truck Association input | Free-text field (`testimonial_reference` → `vendor.notes`) | File picker / upload control |
| Storage | String on vendor profile | `VendorDocument` (or equivalent) row with document type e.g. `TRUCK_ASSOCIATION_REFERENCE` |
| Onboarding gate | Non-empty text satisfies `has_testimonial_reference()` | Mandatory doc type present in uploaded set (with Trade License, BIN, TIN) |
| Resubmission | Text PATCH on profile | Document replace flow with audit (VM-01 AC-5 / AC-6) |
| Mobile UX | Text input in registration wizard | Same upload affordances as other compliance docs (VAPP-02 document upload patterns) |

---

---

## FB-015 — Vendor Mobile proactive JWT refresh & session hardening
| **Source** | Engineering hardening — Vendor Mobile release readiness (2026-07-07) |
| **Affected Stories** | [VAPP-01](../03-vendor-app/VAPP-01-release-readiness-live-api.md) — AC-4 (Auth & Session Hardening), sub-task VAPP-01-4; [VAPP-02](../03-vendor-app/VAPP-02-design-improvements.md) (expired-session UX) |
| **Reference docs** | [`vendor-mobile/10-security-and-access-control.md`](../../../../05-modules/09-mobile-apps/vendor-mobile/10-security-and-access-control.md) §Session management; [`authentication.yaml`](../../../../06-contracts/01-apis/rest/authentication.yaml) `/auth/token/refresh` |
| **Closing Sub-tasks** | VAPP-01-4 (auth/session hardening — token refresh, 401/403 handling) |
| **AC Amendment** | VAPP-01 AC-4: token refresh on the Vendor Mobile app is **proactive and transparent**, not only reactive on 401. **(1) Proactive refresh** — the app decodes the stored access token (`JwtTokenUtils`) and exchanges the refresh token for a new access token when the access token is expired **or within a 5-minute skew window**, triggered on app **foreground resume** (`SessionRefreshBinding`) and during **splash/init** reconciliation (`SplashViewModel`). **(2) Reactive refresh** — any authenticated request that returns `401` (or a `403` normalised from `not_authenticated` / `authentication_failed`) forces a single refresh-and-retry via `ApiClient`. **(3) Endpoint** — refresh calls `POST /api/v1/vendor/token/refresh/` with `{ "refresh": <token> }` and receives `{ "access": <token> }`; vendor JWTs carry `sub="vendor"` + `vendor_portal_account_id` and are validated by `VendorJWTAuthentication` against `VendorPortalAccount` in the public schema (not `AUTH_USER_MODEL`). **(4) Expiry handling** — when the **refresh token is expired** (or refresh fails), the stored session is cleared and the vendor is routed to login with a clear message — never a crash or silent dead state. Access token lifetime is 24h (`JWT_ACCESS_TOKEN_LIFETIME`, default 1440 min); refresh token lifetime is 7 days (`JWT_REFRESH_TOKEN_LIFETIME`). |
| **Status** | Resolved |
| **Priority** | High |
| **Notes** | The vendor refresh endpoint (`refresh_vendor_access_token`) issues a **new access token only** — the vendor refresh token is **reused** (not rotated) until it expires, distinct from SimpleJWT's `ROTATE_REFRESH_TOKENS` behaviour on internal-user (`/api/v1/auth/token/refresh/`) tokens. The mobile refresher still persists a rotated `refresh` value if the response ever returns one (forward-compatible). Implemented in `nourish-vendor-app` commit `b4e80fe` (`JwtTokenUtils`, `VendorTokenRefresher`, `SessionRefreshBinding`, `ApiClient`/`AuthRepository` refresh integration). This closes the previously reactive-only gap; secure token storage (Keystore/Keychain) remains tracked under VAPP-01 AC-7. |

### Observation

The Vendor Mobile app previously only refreshed the access token **reactively**, after a request had already failed with `401`. Long-idle sessions (app backgrounded, then resumed) could hit an expired access token mid-action, and an expired refresh token could leave the session in an ambiguous state. Release readiness (VAPP-01 AC-4) requires refresh to be **transparent** — the vendor should never see a crash or a silent dead session because a token lapsed while the app was backgrounded.

### Current vs expected behaviour

| Aspect | Before | After (FB-015) |
|--------|--------|-----------------|
| Refresh trigger | Reactive only — after a `401` on an authenticated call | Proactive on foreground resume + splash init (5-min skew), **plus** reactive `401`/`403` retry |
| Expiry detection | Server-driven (request fails first) | Client-side JWT `exp` decode (`JwtTokenUtils`) with skew |
| Refresh token expired | Ambiguous / possible dead session | Session cleared → login with clear message, no crash |
| Refresh endpoint | `POST /api/v1/vendor/token/refresh/` → `{access}` | Unchanged endpoint; now driven by shared `VendorTokenRefresher` for manual + automatic paths |
| Token rotation | Access re-issued on failure; refresh reused | Access re-issued proactively; refresh reused until 7-day expiry (forward-compatible with rotation) |

---

---

## FB-027 — Tenant Admin multi-select accept/reject vendors

| Field | Value |
|-------|-------|
| **Source** | Client feedback — 2026-07-22 |
| **Affected Stories** | VM-01 / vendor registration approval ([`vendor-onboarding.md`](../../../../05-modules/07-vendor-management/vendor-onboarding.md)) |
| **Closing Sub-tasks** | FB-027-1 — Bulk accept/reject actions on vendor registration changelist |
| **AC Amendment** | Tenant Admin SHALL be able to **accept or reject vendors by multi-selection** on the vendor registration / pending-vendor admin list: select multiple rows, then run **Accept** or **Reject** as a bulk action. Each selected vendor follows the same single-row accept/reject rules (validation, status transition, audit). Reject may require a reason where single-row reject already does. |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | Client asked for multi-select accept/reject instead of one-by-one only. Bulk actions now cover the pending vendor approval queue. |

### Client feedback observation

Tenant Admins needed to approve or reject several vendor registrations at once rather than opening each record individually.

### Current vs expected behaviour

| Aspect | Current (before fix) | Expected (FB-027) |
|--------|----------------------|-------------------|
| Accept / Reject | Single-row only | Multi-select bulk Accept and Reject |
| Per-vendor rules | Single-row validation | Same rules applied to each selected row |

---
