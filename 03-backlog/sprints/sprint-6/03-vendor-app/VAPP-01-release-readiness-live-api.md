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

> **As a Vendor**, I want the app to work reliably against the live system — including poor network conditions — so that I can register, bid, and execute trips without depending on the DFMS team.

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

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| Live/production API environment | Ops | Deployed Sprint 5 backend incl. TO/Bid revision + public-schema vendor registry |
| E2E-01 vendor journeys | Upstream | Backend-side verification of the same flows (E2E-01-5/6) should pass first or in parallel |
| Signing keys / store accounts | External | Required for AC-6; request early |
| VAPP-02 design improvements | Parallel | UX changes must land before the final smoke record or be explicitly excluded from this release |

---

*Epic: Vendor Mobile App | Phase: 1 | Sprint 6: 8 SP | Jira: DFS-073 | Last Updated: 2026-06-12*
