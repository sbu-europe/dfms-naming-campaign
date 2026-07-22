# Onboarding — Profile Completion & Documents

**Module:** Vendor Management — Vendor Profile Completion (Documents)  
**Scope:** Vendor mobile app — **Maestro target**  
**Last Maestro run:** 2026-07-22 (emulator-5554, `ONBOARDING_EMAIL=onboarding.test@example.com`)

| TC ID | Scenario | Test description | Priority | Scope | Maestro Status | Maestro Flow | PDF Notes |
|-------|----------|------------------|----------|-------|----------------|--------------|-----------|
| TC_095 | Trade License required | Cannot proceed without Trade License upload. | Critical | Vendor App | Not Started | — | Upload not automated |
| TC_096 | BIN Certificate required | Cannot proceed without BIN Certificate upload. | Critical | Vendor App | Not Started | — | |
| TC_097 | TIN Certificate required | Cannot proceed without TIN Certificate upload. | Critical | Vendor App | Not Started | — | |
| TC_098 | All 3 documents upload | Trade License, BIN, TIN uploaded together. | Critical | Vendor App | Not Started | — | |
| TC_099 | File type & size | Reject unsupported / oversized files. | High | Vendor App | Not Started | — | |
| TC_100 | Truck Association Reference | Field present and accepts input. | Medium | Vendor App | Not Started | — | |
| TC_101 | Proceed to tenant selection | After docs, vendor reaches Tenant Selection. | High | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/onboarding/01_onboarding_documents_visible.yaml` | **Passed 2026-07-22** — checklist visible after resetting onboarding docs |

## Notes

- Reset incomplete account before run: remove mandatory docs for `onboarding.test@example.com` (do **not** run `make seed-vendor-dev` on that account — it completes onboarding).
- Full upload TCs need file-picker automation or test hooks.

## Test data

- `ONBOARDING_EMAIL` / `ONBOARDING_PASSWORD` — registered, docs incomplete
