---
jira_key: DFS-073
jira_type: Story
jira_sprint: "Sprint 6"
story_id: VAPP-01
title: Vendor App — Release-Ready Build for Live API
epic: Vendor Mobile App
status: New — Sprint 6 Scope
story_points: 8
assignee: ~
related_stories:
  - VM-01 → VM-08 (vendor management API surface, Sprint 4/5)
  - TEVF-02, TEVF-03 (vendor-fleet execution, Sprint 4/5)
source_docs:
  - ../../sprint-5/08-vendor-management/VENDOR-TRIP-LIFECYCLE.md
  - ../../sprint-5/08-vendor-management/TO-BID-FLOW-REVISION.md
---

# VAPP-01 — Vendor App Release Readiness (Live API)

## User Stories

**As a** Vendor (fleet owner or transport contractor)
**I want** the DFMS vendor app to work reliably against the live system — including when my network connection is poor
**So that** I can register, view bids, submit proposals, receive trip assignments, and complete deliveries without needing the DFMS support team to intervene on my behalf.

**As a** TDO — Vendor Fleet
**I want to** be confident that vendors are operating from a production-quality app connected to the live API
**So that** bid submissions, vehicle-driver confirmations, and trip status updates are real-time and reliable — not delayed by a demo/mock setup.

---

## Business Context

### Why release readiness is a Sprint 6 goal

The vendor app was developed and demonstrated in Sprints 4/5 against a mock or locally-hosted API. Phase 1 UAT requires vendors to participate using a release build connected to the live DFMS API. If the app ships without:
- **Environment configuration** — it will call development endpoints in production.
- **Auth/session hardening** — expired tokens will crash the vendor's session during an active bid or trip.
- **Failure-state handling** — a network blip during bid submission will leave the vendor unsure whether their bid was recorded.
- **Signed release artifacts** — distribution to real vendors via app stores or direct APK is blocked.

This story closes all four gaps and produces a `VAPP-01-smoke-record.md` — a written, dated, tester-signed record that every flow was verified on the release build against the staging and live environments.

### Vendor roles and their API surface

The vendor app serves two types of external users:

| Vendor user type | What they do in the app |
|-----------------|------------------------|
| **Vendor Admin** | Registers the vendor company, manages the company profile, manages vendor's vehicles and driver assignments for trips |
| **Vendor (operator)** | Discovers bids (`bid_number`), submits proposals with `participating_to_ids` and per-TO costs, monitors award status, confirms vehicle-driver assignment, starts and completes trips |

The app must not expose **contracted rates** — these are set between the DFMS tenant and the vendor company but are never returned in any vendor-facing API response. This is a hard RBAC requirement (VM-06, Sprint 5) that must be verified in the smoke test.

### The bid-to-trip flow the app must fully support

The canonical vendor journey (per [TO-BID-FLOW-REVISION](../../sprint-5/08-vendor-management/TO-BID-FLOW-REVISION.md) and [VENDOR-TRIP-LIFECYCLE](../../sprint-5/08-vendor-management/VENDOR-TRIP-LIFECYCLE.md)):

1. Vendor self-registers with OTP → password set → login.
2. Vendor requests to join a tenant → Tenant Admin approves.
3. TDO publishes a Bid bundle with `bid_number` (one or more TOs grouped).
4. Vendor discovers the Bid by `bid_number` → reviews TOs → submits with `participating_to_ids` and per-TO `proposed_cost`.
5. Vendor may withdraw and resubmit within the bidding window.
6. TDO evaluates submissions, awards per-TO.
7. Winning vendor submits vehicle + driver details for each awarded TO; validation feedback is shown in-app.
8. Driver starts trip (`POST /start-trip`) at `ready_for_dispatch` — visible yard sub-states progress without vendor action.
9. Driver completes trip (`POST /complete-trip`) at `delivered_unloaded`.
10. Closure happens without POD for vendor-fleet (system rule from TEVF-03).

Every step above must work on the release build against the live API.

### Security baseline for a vendor-facing mobile app

The vendor app handles authentication tokens and communicates with a multi-tenant backend. The security baseline for a production mobile release:
- TLS enforced for all traffic — no cleartext.
- Tokens in platform-secure storage (Keystore on Android, Keychain on iOS) — not plain shared preferences.
- Debug logging and developer tooling stripped from release build.
- PII (vendor names, phone numbers) must not appear in crash reports or analytics payloads beyond agreed fields.

---

## Acceptance Criteria

### AC-1 — Environment Configuration

- API base URL, tenant discovery endpoint, and all environment-specific values come from build-time configuration (flavors/schemes per dev / staging / production).
- **No hardcoded endpoints, credentials, or API keys** in source; secrets injected at build time and absent from the repository.
- Active environment is identifiable in-app on non-production builds (e.g. banner/About screen); production build shows no debug indicators.

### AC-2 — Live API Functional Pass: Account Flows

Against the live API, the following complete successfully end-to-end: vendor self-registration with OTP verification (expiry + resend cooldown honoured), login/logout, forgot password → OTP/link → reset, profile view/update, account deletion (confirmation → soft-delete → login blocked).

### AC-3 — Live API Functional Pass: Bid & Trip Flows

Against the live API: Bid discovery by `bid_number` (per TO-BID-FLOW-REVISION), bid submission with `participating_to_ids` and per-TO `proposed_cost`, withdrawal and re-submission within the window, award outcome visibility (winner state), vehicle-driver submission with validation feedback (vehicle type, capacity, phone format), **Start Trip** at `ready_for_dispatch`, yard sub-state progress visible without vendor action, **Complete Trip** at `delivered_unloaded`.

### AC-4 — Auth & Session Hardening

- Token refresh is transparent; an expired session lands the vendor on login with a clear message, never a crash or silent dead state.
- 401/403 responses handled distinctly (re-authenticate vs not-permitted message).
- Tenant context integrity: a vendor active in multiple tenants always operates against the selected tenant; no cross-tenant data bleed in cached state.

### AC-5 — Failure-State Handling

- Network timeout / no connectivity: explicit offline state with retry; last-loaded data may display with a stale indicator; no white-screens or unhandled exceptions.
- API 4xx: server validation messages rendered to the user; API 5xx: friendly failure state with retry.
- In-flight actions (bid submit, trip transitions) are protected against double-submission (disabled button / idempotent retry).

### AC-6 — Release Build & Observability

- Signed release artifacts produced from a documented, repeatable pipeline (Android AAB/APK at minimum; iOS if in Phase 1 scope — decision recorded).
- Semantic versioning + build number scheme agreed and applied.
- Crash/error reporting wired and verified receiving events from a release build.
- Release build strips debug logging; ProGuard/R8 (or platform equivalent) configuration verified against all flows in AC-2/AC-3.

### AC-7 — Security Review

- TLS enforced for all API traffic; cleartext traffic disabled.
- Tokens stored in platform-secure storage (Keystore/Keychain), not plain preferences.
- PII audit: no vendor PII in logs, analytics, or crash payloads beyond agreed fields.

### AC-8 — Smoke Test Record

- A written smoke checklist covering AC-2 + AC-3 is executed on the **release build** against staging and against the live API; results (pass/fail, build version, date, tester) recorded in this folder as `VAPP-01-smoke-record.md`.

---

## API Endpoints — Vendor App Calls (reference, not new endpoints)

These are the **existing DFMS backend endpoints** the vendor app must connect to on the live API. No new endpoints are created by this story; the story validates that the existing contract is correctly called from the release build.

```
# Authentication
POST  /api/v1/auth/vendor/register              # self-registration with OTP
POST  /api/v1/auth/vendor/verify-otp
POST  /api/v1/auth/vendor/login
POST  /api/v1/auth/vendor/logout
POST  /api/v1/auth/vendor/forgot-password
POST  /api/v1/auth/vendor/reset-password
POST  /api/v1/auth/token/refresh                # transparent token refresh (AC-4)

# Tenant join
POST  /api/v1/vendors/tenant-join              # vendor requests to join a tenant

# Profile & account
GET   /api/v1/vendors/me/profile
PATCH /api/v1/vendors/me/profile
DELETE /api/v1/vendors/me/account              # soft-delete with confirmation

# Bid discovery and submission
GET   /api/v1/bids/?bid_number={number}        # discover open bids
GET   /api/v1/bids/{bid_id}/                   # bid detail with TOs
POST  /api/v1/bids/{bid_id}/submit/            # { participating_to_ids, per_to_costs: [{to_id, proposed_cost}] }
POST  /api/v1/bids/{bid_id}/withdraw/          # withdraw submission within window
GET   /api/v1/bids/{bid_id}/my-submission/     # own submission status + award outcome

# Vehicle-driver submission for awarded TO
POST  /api/v1/transport-orders/{to_id}/vehicle-driver-submission/
      # { vehicle_id, driver_id, vehicle_type, capacity, driver_phone }

# Trip execution
POST  /api/v1/trips/{trip_id}/start/           # Start Trip at ready_for_dispatch
GET   /api/v1/trips/{trip_id}/status/          # yard sub-state visibility
POST  /api/v1/trips/{trip_id}/complete/        # Complete Trip at delivered_unloaded
```

> **Rate fields are never returned** in any vendor-facing response — this must be asserted in the smoke test (AC-8). Any API response that includes `contracted_rate`, `rate`, or equivalent fields for a vendor session is a RBAC defect.

---

## Access & Permissions

This story's permissions are scoped to the **external vendor-facing API**. All the following apply to authenticated vendor sessions only.

| Action | Vendor role |
|--------|-------------|
| Self-register with OTP | Any vendor (unauthenticated) |
| Login / logout / forgot password | Vendor (registered) |
| Request to join a tenant | Vendor Admin |
| View and update own profile | Vendor Admin, Vendor operator |
| Delete own account | Vendor Admin |
| Discover and view open bids | Vendor (tenant-joined) |
| Submit a bid proposal | Vendor (tenant-joined and approved) |
| Withdraw a bid submission (within window) | Same vendor who submitted |
| View own bid submission status and award outcome | Vendor (bid submitter) |
| Submit vehicle + driver for awarded TO | Vendor Admin |
| Start Trip | Driver (linked to awarded TO — via driver-facing flow; vendor app shows status) |
| Complete Trip | Driver (same as above) |
| View trip yard sub-states (without action) | Vendor (tenant-joined, awarded TO) |
| View contracted rate | **Nobody on vendor session** — 403 / field omitted always |

> **Tenant Admin** controls vendor approval (join request acceptance) and bid publication — these are DFMS internal-user actions, not vendor app actions. The vendor app is exclusively an external-user surface.

---

## Sub-tasks — Sprint 6

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| VAPP-01-1 | Environment configuration | Build flavors, env-injected config, no secrets in repo, env indicator | High | Not started |
| VAPP-01-2 | Live API pass — account flows | AC-2: registration/OTP, login, forgot password, profile, delete account | High | Not started |
| VAPP-01-3 | Live API pass — bid & trip flows | AC-3: Bid discovery → submission → award → vehicle-driver → Start/Complete Trip | High | Not started |
| VAPP-01-4 | Auth/session hardening | AC-4: token refresh, 401/403 handling, tenant context integrity | High | Not started |
| VAPP-01-5 | Failure-state handling | AC-5: offline, timeout, 4xx/5xx, double-submission guards | High | Not started |
| VAPP-01-6 | Release build pipeline | AC-6: signing, versioning, crash reporting, log stripping, shrinker verification | High | Not started |
| VAPP-01-7 | Security review | AC-7: TLS, secure token storage, PII audit | Medium | Not started |
| VAPP-01-8 | Smoke test record | AC-8: checklist executed on release build vs staging + live; record published | High | Not started |

---

## Definition of Done

- [ ] Release build produced from pipeline with correct production configuration (AC-1, AC-6)
- [ ] All account, bid, and trip flows pass on the release build against the live API (AC-2, AC-3, AC-8)
- [ ] Auth and failure states verified — no crash/white-screen path found (AC-4, AC-5)
- [ ] Security review items closed (AC-7)
- [ ] `VAPP-01-smoke-record.md` published with sign-off from Release Owner
- [ ] Contracted rate confirmed absent from all vendor-session API responses

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| Live/production API environment | Ops | Deployed Sprint 5 backend incl. TO/Bid revision + public-schema vendor registry |
| E2E-01 vendor journeys | Upstream | Backend-side verification of the same flows (E2E-01-5/6) should pass first or in parallel |
| Signing keys / store accounts | External | Required for AC-6; request early |
| VAPP-02 design improvements | Parallel | UX changes must land before the final smoke record or be explicitly excluded from this release |

---

*Epic: Vendor Mobile App | Phase: 1 | Sprint 6: 8 SP | Jira: DFS-073 | Last Updated: 2026-06-15*
