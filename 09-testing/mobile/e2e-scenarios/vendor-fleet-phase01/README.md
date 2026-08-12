---
section: 09-testing/mobile/e2e-scenarios/vendor-fleet-phase01
title: Vendor Fleet Phase 01 Test Cases (TC_075–TC_215)
version: 1.1
source_document: DFMS-Sprint_Wise_Test_Cases_Phase01.pdf
implementation_reference: ../../../../nourish-vendor-app/.maestro/
last_updated: 2026-07-22
---

# DFMS Vendor App — Phase 01 Test Cases (TC_075–TC_215)

Source document: `DFMS-Sprint_Wise_Test_Cases_Phase01.pdf`

This folder documents **all vendor-fleet-related test cases from TC_075 through TC_215**, grouped by feature. Use it as the specification baseline before implementing and running Maestro flows in `nourish-vendor-app/.maestro/`.

## Execution snapshot (2026-07-22 — full suite, backend up, `emulator-5554`)

**Command:** `maestro --device emulator-5554 test .maestro` → **26 Passed / 6 Failed** (continueOnFailure).

**Prep:** `make seed-vendor-dev` (onboarding completeness); extended `BID-20260707-JON84YZR` close date; reset `onboarding.test@example.com` mandatory docs for onboarding flow.

| Wave | Result |
|------|--------|
| A — smoke / auth / onboarding / tenants / profile | Smoke, settings, onboarding checklist, tenants (+ empty search), profile hub/edit/logout, email login, register nav/validation, login mode switch **passed**. **OTP cases Skipped** (see `02-registration-auth.md`). Other failures: phone login (`phone_not_verified`), invalid-creds toast timing, change-password wrong-current assert. |
| B — bids | List, empty search, **submit bid** **passed**. Open-details navigation **failed** (03). |
| C — TOs | List, empty search, **TO details** **passed**. Post-award driver/vehicle validation **failed** (04). |
| D — trips | All 4 trips flows **passed**. |
| Admin-only files (`01`, `05`, `06`, `10`, `11`) | **Manual** / **N/A** for Maestro — not run on mobile. **`05` covered by Playwright** (`nourish-backend/tests/e2e/playwright-mcp/vendor-tenant-approval-artifacts/`, 2026-07-22). |

### OTP policy (current system)

OTP-dependent Maestro cases are **Skipped** until a stable stub/inbox path exists. Tracked in [`02-registration-auth.md`](./02-registration-auth.md): **TC_090–TC_094**, plus flows `auth/10_register_full_flow_with_stub_otp` and `auth/09_forgot_password_navigation_and_otp`.

### Failed flows (fix list — non-OTP)

| Flow | Failure | Root cause / fix |
|------|---------|------------------|
| `auth/05_login_phone_password` | No authenticated landing | Backend `phone_not_verified` for test vendor — seed verified phone or assert error copy |
| `auth/03_login_invalid_credentials` | Error not visible | Toast `Email/password is wrong` timing — assert faster or use snackbar id |
| `bids/03_open_bid_details_from_list` | Bid details not reached | Align tap with `04` (Open filter + tile); 04 passed same session |
| `tos/04_post_award_submission_validation` | Action-required TO not tapped | Use specific TO number (e.g. `TO-20260707-0001`) from seeded list |
| `profile/03_change_password_validation` | Wrong-password error not shown | API/error toast copy mismatch — inspect change-password failure message |

## Feature files

| File | Feature area | TC range | Primary scope |
|------|--------------|----------|---------------|
| [01-to-creation-vendor-fleet.md](./01-to-creation-vendor-fleet.md) | TO creation (Vendor Fleet, batch) | TC_075–TC_082, TC_202 | Admin / Transport Planner |
| [02-registration-auth.md](./02-registration-auth.md) | Registration & auth (OTP **Skipped**) | TC_083–TC_094 | **Vendor mobile app** |
| [03-onboarding-documents.md](./03-onboarding-documents.md) | Profile completion & documents | TC_095–TC_101 | **Vendor mobile app** |
| [04-tenant-join.md](./04-tenant-join.md) | Tenant discovery & join request | TC_102–TC_107, TC_117 | **Vendor mobile app** |
| [05-tenant-approval-admin.md](./05-tenant-approval-admin.md) | Tenant admin approval | TC_108–TC_118 | Tenant admin portal (**Playwright**) |
| [06-bid-publishing-admin.md](./06-bid-publishing-admin.md) | Bid publishing (TDO) | TC_119–TC_132, TC_203–TC_209, TC_205–TC_208 | Vendor Fleet TDO |
| [07-bids-vendor-app.md](./07-bids-vendor-app.md) | Bid visibility & submission | TC_128–TC_142, TC_192, TC_204, TC_210–TC_212 | **Vendor mobile app** (+ admin eval) |
| [08-transport-orders-vendor-app.md](./08-transport-orders-vendor-app.md) | Awarded TO confirmation | TC_153–TC_163, TC_180–TC_182, TC_193, TC_213 | **Vendor mobile app** |
| [09-trips-vendor-app.md](./09-trips-vendor-app.md) | Tracks, start, POD | TC_168–TC_172, TC_186–TC_187, TC_200, TC_215 | **Vendor mobile app** |
| [10-contractual-assignment-admin.md](./10-contractual-assignment-admin.md) | Contractual TO assignment | TC_173–TC_179, TC_184–TC_185 | Vendor Fleet TDO |
| [11-post-award-dispatch-rbac.md](./11-post-award-dispatch-rbac.md) | Ready for dispatch, RBAC, edge cases | TC_164–TC_167, TC_188–TC_201, TC_211, TC_214 | Admin + vendor (mixed) |

## Column definitions

| Column | Meaning |
|--------|---------|
| **Priority** | Critical / High / Medium / Low (from PDF) |
| **Scope** | Where the case is verified: `Vendor App`, `TDO`, `Tenant Admin`, `TP`, `Backend`, or `Mixed` |
| **Maestro Status** | Automation status on the vendor mobile app (updated after Maestro runs). Admin-portal rows use **Playwright Status** in the feature file instead. |
| **Maestro Flow** | Planned or existing flow under `nourish-vendor-app/.maestro/flows/` |
| **PDF Notes** | Original PDF flags such as `Skip` (audit-log cases) |

## Maestro status legend

| Status | Meaning |
|--------|---------|
| **Not Started** | Documented only; no Maestro run yet |
| **Partial** | A related flow exists but does not fully satisfy the TC |
| **Covered** | Maestro flow implemented and passing |
| **Failed** | Flow ran and failed (see feature file notes) |
| **Skipped** | Intentionally not run in current system (e.g. OTP) — see feature-file notes |
| **Manual** | Requires admin/backend seeding; not suitable for pure mobile automation |
| **N/A** | Out of scope for the vendor mobile app |

## Next steps

1. From `nourish-backend`: ensure stack is up; `make seed-vendor-dev` for vendor onboarding gates.
2. Extend or publish open bids when close dates lapse (mobile hides expired opportunities).
3. Re-run: `maestro --device emulator-5554 test .maestro` from `nourish-vendor-app/`.
4. Fix the 6 failed flows above; update **Maestro Status** in feature files.
5. See [Maestro setup and run guide](../../maestro-setup-and-run.md).
