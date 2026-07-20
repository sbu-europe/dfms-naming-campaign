---
section: 09-testing/mobile/e2e-scenarios/vendor-fleet-phase01
title: Vendor Fleet Phase 01 Test Cases (TC_075–TC_215)
version: 1.0
source_document: DFMS-Sprint_Wise_Test_Cases_Phase01.pdf
implementation_reference: ../../../../nourish-vendor-app/.maestro/
last_updated: 2026-07-20
---

# DFMS Vendor App — Phase 01 Test Cases (TC_075–TC_215)

Source document: `DFMS-Sprint_Wise_Test_Cases_Phase01.pdf`

This folder documents **all vendor-fleet-related test cases from TC_075 through TC_215**, grouped by feature. Use it as the specification baseline before implementing and running Maestro flows in `nourish-vendor-app/.maestro/`.

## Feature files

| File | Feature area | TC range | Primary scope |
|------|--------------|----------|---------------|
| [01-to-creation-vendor-fleet.md](./01-to-creation-vendor-fleet.md) | TO creation (Vendor Fleet, batch) | TC_075–TC_082, TC_202 | Admin / Transport Planner |
| [02-registration-auth.md](./02-registration-auth.md) | Registration & OTP | TC_083–TC_094 | **Vendor mobile app** |
| [03-onboarding-documents.md](./03-onboarding-documents.md) | Profile completion & documents | TC_095–TC_101 | **Vendor mobile app** |
| [04-tenant-join.md](./04-tenant-join.md) | Tenant discovery & join request | TC_102–TC_107, TC_117 | **Vendor mobile app** |
| [05-tenant-approval-admin.md](./05-tenant-approval-admin.md) | Tenant admin approval | TC_108–TC_118 | Tenant admin portal |
| [06-bid-publishing-admin.md](./06-bid-publishing-admin.md) | Bid publishing (TDO) | TC_119–TC_132, TC_203–TC_209, TC_205–TC_208 | Vendor Fleet TDO |
| [07-bids-vendor-app.md](./07-bids-vendor-app.md) | Bid visibility & submission | TC_128–TC_142, TC_192, TC_204, TC_210–TC_212 | **Vendor mobile app** (+ admin eval) |
| [08-transport-orders-vendor-app.md](./08-transport-orders-vendor-app.md) | Awarded TO confirmation | TC_153–TC_163, TC_180–TC_182, TC_193, TC_213 | **Vendor mobile app** |
| [09-trips-vendor-app.md](./09-trips-vendor-app.md) | Trips, start, POD | TC_168–TC_172, TC_186–TC_187, TC_200, TC_215 | **Vendor mobile app** |
| [10-contractual-assignment-admin.md](./10-contractual-assignment-admin.md) | Contractual TO assignment | TC_173–TC_179, TC_184–TC_185 | Vendor Fleet TDO |
| [11-post-award-dispatch-rbac.md](./11-post-award-dispatch-rbac.md) | Ready for dispatch, RBAC, edge cases | TC_164–TC_167, TC_188–TC_201, TC_211, TC_214 | Admin + vendor (mixed) |

## Column definitions

| Column | Meaning |
|--------|---------|
| **Priority** | Critical / High / Medium / Low (from PDF) |
| **Scope** | Where the case is verified: `Vendor App`, `TDO`, `Tenant Admin`, `TP`, `Backend`, or `Mixed` |
| **Maestro Status** | Automation status on the vendor mobile app (updated after Maestro runs) |
| **Maestro Flow** | Planned or existing flow under `nourish-vendor-app/.maestro/flows/` |
| **PDF Notes** | Original PDF flags such as `Skip` (audit-log cases) |

## Maestro status legend

| Status | Meaning |
|--------|---------|
| **Not Started** | Documented only; no Maestro run yet |
| **Partial** | A related flow exists but does not fully satisfy the TC |
| **Covered** | Maestro flow implemented and passing |
| **Manual** | Requires admin/backend seeding; not suitable for pure mobile automation |
| **N/A** | Out of scope for the vendor mobile app |

## Summary (141 cases)

| Scope | Count | Maestro target |
|-------|------:|----------------|
| Vendor mobile app (primary) | 58 | Yes — implement under `nourish-vendor-app/.maestro/flows/` |
| Vendor mobile app (visibility / negative) | 12 | Yes — often needs multi-account seed data |
| TDO / Tenant Admin / TP | 58 | Manual or separate admin test suite |
| Backend / operational chain | 13 | Manual / integration tests |

## Next steps

1. Seed test accounts and backend fixtures (approved vendor, pending vendor, open bids, awarded TOs, active trips).
2. Implement Maestro flows feature-by-feature starting with [02-registration-auth.md](./02-registration-auth.md).
3. After each run, update **Maestro Status** and **Maestro Flow** in the feature file.
4. See [Maestro setup and run guide](../../maestro-setup-and-run.md) for install, env, and run instructions.
