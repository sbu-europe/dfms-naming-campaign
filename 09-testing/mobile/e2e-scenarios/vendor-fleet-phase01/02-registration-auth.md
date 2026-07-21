# Registration & Authentication

**Module:** Vendor Management — Vendor Registration (Mobile App)  
**Scope:** Vendor mobile app — **Maestro target**  
**Last Maestro run:** 2026-07-21 evening full suite (emulator-5554, `vendor2@gmail.com`) — **20/32 flows Passed**

| TC ID | Scenario | Test description | Priority | Scope | Maestro Status | Maestro Flow | PDF Notes |
|-------|----------|------------------|----------|-------|----------------|--------------|-----------|
| TC_083 | Registration screen access | Open Vendor Fleet Mobile App without login. Registration option available. | High | Vendor App | Covered | `nourish-vendor-app/.maestro/flows/auth/06_vendor_welcome_to_register_navigation.yaml` | **Passed** — Create one → Vendor Portal → Create account Step 1 |
| TC_084 | Mandatory fields present | Registration form shows Email, Company Name, Password, Confirm Password — all mandatory. | High | Vendor App | Covered | `nourish-vendor-app/.maestro/flows/auth/07_register_validation_errors.yaml` | **Passed** — empty submit shows required errors |
| TC_085 | Email format validation | Invalid formats rejected with clear errors. | High | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/auth/07_register_validation_errors.yaml` | Empty-required covered; dedicated invalid-format not asserted |
| TC_086 | Duplicate email | Register with existing email blocked with duplicate error. | Critical | Vendor App | Not Started | — | Needs dedicated flow |
| TC_087 | Company name required | Blank Company Name blocked on submit. | High | Vendor App | Covered | `nourish-vendor-app/.maestro/flows/auth/07_register_validation_errors.yaml` | Covered by empty-form validation flow |
| TC_088 | Password complexity | Weak password rejected; field masked. | High | Vendor App | Not Started | — | |
| TC_089 | Password mismatch | Confirm Password must match Password. | High | Vendor App | Covered | `nourish-vendor-app/.maestro/flows/auth/08_register_password_mismatch.yaml` | **Passed** |
| TC_090 | OTP sent | After form submit, 6-digit OTP sent to registered email. | Critical | Vendor App | Failed | `nourish-vendor-app/.maestro/flows/auth/10_register_full_flow_with_stub_otp.yaml` | Failed — never reached Verify/OTP screen after Send verification code |
| TC_091 | Valid OTP | Correct OTP within validity completes email verification. | Critical | Vendor App | Failed | `nourish-vendor-app/.maestro/flows/auth/10_register_full_flow_with_stub_otp.yaml` | Blocked by TC_090 |
| TC_092 | Expired OTP | Expired OTP rejected; Resend option offered. | High | Vendor App | Not Started | — | |
| TC_093 | OTP lockout | Wrong OTP 3 times → temporary lockout. | High | Vendor App | Not Started | — | |
| TC_094 | Sign in after OTP | After OTP verification, sign in lands on Profile Completion. | Critical | Vendor App | Failed | `nourish-vendor-app/.maestro/flows/auth/10_register_full_flow_with_stub_otp.yaml` | Blocked by TC_090 |

## Supporting login flows (not in TC_075–215 range)

| Flow | Result 2026-07-21 evening |
|------|---------------------------|
| `auth/01_login_mode_switch.yaml` | **Failed** — after Phone OTP tap, `+88` field not visible |
| `auth/02_login_empty_fields_shows_toast.yaml` | **Passed** |
| `auth/03_login_invalid_credentials.yaml` | **Failed** — error toast/copy not matching `wrong\|login failed\|invalid\|credentials` |
| `auth/04_login_valid_email_lands_authenticated.yaml` | **Passed** |
| `auth/05_login_phone_password.yaml` | **Failed** — did not reach authenticated destination |
| `auth/09_forgot_password_navigation_and_otp.yaml` | **Failed** — after Send reset code, OTP/reset screen not visible |

## Test data

- Approved vendor: `VENDOR_EMAIL` / `VENDOR_PASSWORD` (seeded via `make seed-vendor-mobile`)
- `NEW_VENDOR_*`, `STUB_OTP` for registration flows
- `ONBOARDING_*` for post-OTP profile completion
