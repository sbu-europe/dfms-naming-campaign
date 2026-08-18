# Onboarding — Profile Completion & Documents

**Module:** Vendor Management — Vendor Profile Completion (Documents)  
**Scope:** Vendor mobile app — **Maestro target**  
**Last Maestro run:** 2026-07-22 (emulator-5554, `ONBOARDING_EMAIL=onboarding.test@example.com`) — gallery/`DocumentsUI` pick of `maestro_doc.png`

> **Current product rule:** Onboarding requires **4 mandatory document uploads** (not 3):
> Trade license, BIN certificate, TIN certificate, and **Truck Association reference** (file upload).
> Backend: `VendorRegistrationService.MANDATORY_DOC_TYPES`. App: `VendorDocumentType.values` / `mandatoryDocumentsComplete`.
> Legacy PDF treated Truck Association as a free-text field — that is **obsolete**; it is a document row on Completing your profile.
>
> **Current UI rule:** Header action is **Profile** (not Logout). Logout is shown as a red destructive button under Continue.

| TC ID | Scenario | Test description | Priority | Scope | Maestro Status | Maestro Flow | PDF Notes |
|-------|----------|------------------|----------|-------|----------------|--------------|-----------|
| TC_095 | Trade License required | Cannot proceed (Continue disabled / blocked) without Trade License upload. | Critical | Vendor App | Covered | `nourish-vendor-app/.maestro/flows/onboarding/03_trade_license_required.yaml` | **Passed 2026-07-22** — upload other 3 via picker; still blocked |
| TC_096 | BIN Certificate required | Cannot proceed without BIN Certificate upload. | Critical | Vendor App | Covered | `nourish-vendor-app/.maestro/flows/onboarding/04_bin_required.yaml` | **Passed 2026-07-22** |
| TC_097 | TIN Certificate required | Cannot proceed without TIN Certificate upload. | Critical | Vendor App | Covered | `nourish-vendor-app/.maestro/flows/onboarding/05_tin_required.yaml` | **Passed 2026-07-22** |
| TC_098 | All 4 documents upload | Trade License, BIN, TIN, and Truck Association reference uploaded together → onboarding requirements complete. | Critical | Vendor App | Covered | `nourish-vendor-app/.maestro/flows/onboarding/07_upload_all_four_and_continue.yaml` | **Passed 2026-07-22** — `addMedia` + DocumentsUI select `maestro_doc.png` |
| TC_099 | File type & size | Only PDF / image allowed for compliance uploads (unsupported types blocked at picker). | High | Vendor App | Covered | `nourish-vendor-app/lib/presentation/common/util/compliance_document_picker.dart` | **Covered by code review 2026-07-22** — `allowedExtensions: pdf, jpg, jpeg, png` via `FileType.custom`. Copy: “PDF or image”. No separate client max-size assert (size not enforced in app picker path). |
| TC_100 | Truck Association reference required | Cannot proceed without Truck Association reference **document** upload (4th mandatory doc). | Critical | Vendor App | Covered | `nourish-vendor-app/.maestro/flows/onboarding/06_truck_association_required.yaml` | **Passed 2026-07-22** — was text field in PDF; now file upload |
| TC_101 | Proceed to tenant selection | After all 4 docs, Continue enabled; vendor reaches Tenant Selection / directory. | High | Vendor App | Covered | `nourish-vendor-app/.maestro/flows/onboarding/07_upload_all_four_and_continue.yaml` | **Passed 2026-07-22** — lands on Tenants after Continue |

## Related Maestro flows

| Flow | Result 2026-07-22 |
|------|-------------------|
| `onboarding/01_onboarding_documents_visible.yaml` | **Passed** — 4 mandatory rows + Continue |
| `onboarding/02_continue_blocked_when_incomplete.yaml` | **Passed** — Continue does not leave onboarding with 0 docs |
| `onboarding/03_trade_license_required.yaml` | **Passed** |
| `onboarding/04_bin_required.yaml` | **Passed** |
| `onboarding/05_tin_required.yaml` | **Passed** |
| `onboarding/06_truck_association_required.yaml` | **Passed** |
| `onboarding/07_upload_all_four_and_continue.yaml` | **Passed** |

## Notes

- Asset: `.maestro/assets/maestro_doc.png` (Maestro `addMedia` + `/sdcard/Download` fallback).
- Reset incomplete account between required-doc flows: delete `VendorDocument` rows for `onboarding.test@example.com` (do **not** run `make seed-vendor-dev` on that account).
- Helpers: `helpers/login_onboarding.yaml`, `helpers/pick_compliance_png.yaml`.
- Verify chrome during runs: top-right `Profile` opens vendor profile; `Logout` appears below Continue as destructive CTA.

## Test data

- `ONBOARDING_EMAIL` / `ONBOARDING_PASSWORD` — registered, docs reset before each required/negative flow
