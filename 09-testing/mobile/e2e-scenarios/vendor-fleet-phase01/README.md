---
section: 09-testing/mobile/e2e-scenarios/vendor-fleet-phase01
title: Vendor Fleet Phase 01 Test Cases (TC_001–TC_141)
version: 1.2
source_document: DFMS-Sprint_Wise_Test_Cases_Phase01.pdf
implementation_reference: ../../../../nourish-vendor-app/.maestro/
last_updated: 2026-08-19
---

# DFMS Vendor App — Phase 01 Test Cases (TC_001–TC_141)

Source document: `DFMS-Sprint_Wise_Test_Cases_Phase01.pdf`

This folder documents **all vendor-fleet-related test cases from TC_001 through TC_141**, grouped by feature. Use it as the specification baseline before implementing and running Maestro flows in `nourish-vendor-app/.maestro/`.

## Execution snapshot (2026-08-19 — full suite post-fix, `emulator-5554`)

**Command:** `bash .cursor/skills/run-vendor-mobile-tests/scripts/run-all.sh --skip-seed --skip-build`
**Result:** **23 Passed / 28 Failed** (continueOnFailure). Up from 6/51 before 2026-08-19 fixes.

| Wave | Result (2026-08-19) |
|------|-----|
| A — smoke | Both flows **Passed** (app name fixed: `DFMS Vendors`; tab 3 fixed: `Trips`) |
| A — auth | Login ×4 **Passed**. Register nav/validation **Passed**. Phone OTP tab **Passed** (rewritten — OTP-only mode, no password field). Invalid creds **in-progress** (toast timing). Register `Confirm password` flows — **scrollUntilVisible** fix applied. |
| A — onboarding | All 7 flows require fresh seed (`make seed-vendor-mobile` resets docs). Fail if account already onboarded. |
| A — tenants | Directory search **Passed**. Join loop requires seed before each run (auto-reseeds in runner). |
| A — profile/settings | Hub, edit, logout, settings **Passed**. Change-password **scrollUntilVisible** fix applied. |
| B — bids | List/search **Passed**. Open-detail/submit/closed flows skip gracefully when no bid data (need `make seed-vendor-bids-pw`). |
| C — TOs | List/search/details **Passed**. Post-award validation (`tos/04`) uses `MAESTRO_TO_NUMBER` env var + list fallback. |
| D — trips | Tabs/search/completed **Passed**. Start-trip (`trips/04`) uses `MAESTRO_TRIP_TO_NUMBER` env var + fallback. |
| Admin-only files (`01`, `05`, `06`, `10`, `11`) | **Manual** / **N/A** for Maestro. `05` covered by Playwright. |

### Previous snapshot (2026-07-22)

**26 Passed / 6 Failed** — before app UI renames (Tracks→Trips, Step 1 of 3→2, Optilogist→DFMS Vendors).

### OTP policy (current system)

OTP-dependent Maestro cases are **Skipped**. Registration is now **2 steps** (not 3): Step 1 collects details + password, Step 2 is email OTP verification. Phone OTP login tab sends an OTP code — it does **not** have a password field. Tracked in [`02-registration-auth.md`](./02-registration-auth.md): **TC_016–TC_020**, plus flows `auth/10` and `auth/09`.

### Fixed flows (2026-08-19)

| Flow | Previous failure | Fix applied |
|------|-----------------|-------------|
| All flows using `login_and_reach_main_shell` | `"Tracks\s+Tab 3 of 5"` not found | Renamed to `Trips` throughout (app UI update) |
| `smoke/00_app_launches` | `"Optilogist Vendors"` not found | Updated to `"DFMS Vendors"` |
| `auth/06`, `11`, `12`, `13` | `"Create account\s+Step 1 of 3"` | Updated to `Step 1 of 2` (registration now 2 steps) |
| `auth/05_login_phone_password` | No password field on Phone OTP tab | Rewritten: verifies OTP tab fields only (no password) |
| `auth/03_login_invalid_credentials` | Wrong email field tapped (hit mode tab) | Email field tap uses `index: 1` |
| `auth/08,10,11,12,13` + `profile/03` | `"Confirm password"` element not found | Added `scrollUntilVisible` before tap |
| `tos/04_post_award_submission_validation` | Action-required TO not tapped | Uses `MAESTRO_TO_NUMBER` env var + list fallback |
| `trips/04_active_trip_start_and_complete` | RFD trip not found | Uses `MAESTRO_TRIP_TO_NUMBER` env var + list fallback |
| `tenants/06_tenant_resubmit_after_reject` | Used wrong seed path | Uses `REJECTED_VENDOR_EMAIL` from `seed-vendor-approval-pw` |
| `bids/03,04,06,07` | Hard-fail when no bid data | Graceful skip with `evalScript` warning |

## Feature files

| File | Feature area | TC range | Primary scope |
|------|--------------|----------|---------------|
| [01-to-creation-vendor-fleet.md](./01-to-creation-vendor-fleet.md) | TO creation (Vendor Fleet, batch) | TC_001–TC_008, TC_128 | Admin / Transport Planner |
| [02-registration-auth.md](./02-registration-auth.md) | Registration & auth (OTP **Skipped**) | TC_009–TC_020 | **Vendor mobile app** |
| [03-onboarding-documents.md](./03-onboarding-documents.md) | Profile completion & documents | TC_021–TC_027 | **Vendor mobile app** |
| [04-tenant-join.md](./04-tenant-join.md) | Tenant discovery & join request | TC_028–TC_033, TC_043 | **Vendor mobile app** |
| [05-tenant-approval-admin.md](./05-tenant-approval-admin.md) | Tenant admin approval | TC_034–TC_044 | Tenant admin portal (**Playwright**) |
| [06-bid-publishing-admin.md](./06-bid-publishing-admin.md) | Bid publishing (TDO) | TC_045–TC_058, TC_129–TC_135, TC_131–TC_134 | Vendor Fleet TDO |
| [07-bids-vendor-app.md](./07-bids-vendor-app.md) | Bid visibility & submission | TC_054–TC_068, TC_118, TC_130, TC_136–TC_138 | **Vendor mobile app** (+ admin eval) |
| [08-transport-orders-vendor-app.md](./08-transport-orders-vendor-app.md) | Awarded TO confirmation | TC_079–TC_089, TC_106–TC_108, TC_119, TC_139 | **Vendor mobile app** |
| [09-trips-vendor-app.md](./09-trips-vendor-app.md) | Tracks, start, POD | TC_094–TC_098, TC_112–TC_113, TC_126, TC_141 | **Vendor mobile app** |
| [10-contractual-assignment-admin.md](./10-contractual-assignment-admin.md) | Contractual TO assignment | TC_099–TC_105, TC_110–TC_111 | Vendor Fleet TDO |
| [11-post-award-dispatch-rbac.md](./11-post-award-dispatch-rbac.md) | Ready for dispatch, RBAC, edge cases | TC_090–TC_093, TC_114–TC_127, TC_137, TC_140 | Admin + vendor (mixed) |

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
