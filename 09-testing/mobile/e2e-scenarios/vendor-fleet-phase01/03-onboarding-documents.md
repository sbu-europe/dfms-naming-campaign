# Onboarding — Profile Completion & Documents

**Module:** Vendor Management — Vendor Profile Completion (Documents)  
**Scope:** Vendor mobile app — **Maestro target**

| TC ID | Scenario | Test description | Priority | Scope | Maestro Status | Maestro Flow | PDF Notes |
|-------|----------|------------------|----------|-------|----------------|--------------|-----------|
| TC_095 | Trade License required | Cannot proceed without Trade License upload. | Critical | Vendor App | Not Started | — | File upload not in current suite |
| TC_096 | BIN Certificate required | Cannot proceed without BIN Certificate upload. | Critical | Vendor App | Not Started | — | |
| TC_097 | TIN Certificate required | Cannot proceed without TIN Certificate upload. | Critical | Vendor App | Not Started | — | |
| TC_098 | All 3 documents upload | Trade License, BIN, TIN can be uploaded together and stored on profile. | Critical | Vendor App | Not Started | — | |
| TC_099 | File type & size | Reject unsupported types (`.exe`, `.zip`) and oversized files. | High | Vendor App | Not Started | — | |
| TC_100 | Truck Association Reference | Field present and accepts input. | Medium | Vendor App | Not Started | — | |
| TC_101 | Proceed to tenant selection | After docs + Truck Association Reference, vendor reaches Tenant Selection page. | High | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/onboarding/01_onboarding_documents_visible.yaml` | Asserts checklist only |

## Notes

- Current Maestro flow `01_onboarding_documents_visible.yaml` verifies the mandatory document checklist renders for a not-yet-onboarded account (`ONBOARDING_EMAIL`).
- Full upload flows require Maestro file-picker support or test hooks for document upload.

## Test data

- `ONBOARDING_EMAIL` / `ONBOARDING_PASSWORD` — registered vendor without completed onboarding
