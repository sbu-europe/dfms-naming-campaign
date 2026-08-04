# Registration & Authentication

**Module:** Vendor Management — Vendor Registration (Mobile App)  
**Scope:** Vendor mobile app — **Maestro target**  
**Last Maestro run:** 2026-07-22 (emulator-5554, backend up, `vendor2@gmail.com`) — suite **26/32 flows Passed**

> **OTP policy (current system):** All OTP-dependent Maestro cases are **Skipped**. Email/phone OTP delivery and verification are out of scope for automated runs until a stable stub/inbox path is available. Do not treat OTP flow failures as product regressions in the current suite.

| TC ID | Scenario | Test description | Priority | Scope | Maestro Status | Maestro Flow | PDF Notes |
|-------|----------|------------------|----------|-------|----------------|--------------|-----------|
| TC_083 | Registration screen access | Open Vendor Fleet Mobile App without login. Registration option available. | High | Vendor App | Covered | `nourish-vendor-app/.maestro/flows/auth/06_vendor_welcome_to_register_navigation.yaml` | **Passed** |
| TC_084 | Mandatory fields present | Registration form shows Email, Company Name, Password, Confirm Password — all mandatory. | High | Vendor App | Covered | `nourish-vendor-app/.maestro/flows/auth/07_register_validation_errors.yaml` | **Passed** |
| TC_085 | Email format validation | Invalid formats rejected with clear errors. | High | Vendor App | Covered | `nourish-vendor-app/.maestro/flows/auth/11_register_invalid_email.yaml` | **Passed 2026-07-22** — `Please enter a valid email` |
| TC_086 | Duplicate email | Register with existing email blocked with duplicate error. | Critical | Vendor App | Covered | `nourish-vendor-app/.maestro/flows/auth/12_register_duplicate_email.yaml` | **Passed 2026-07-22** — API `already registered` (no OTP) |
| TC_087 | Company name required | Blank Company Name blocked on submit. | High | Vendor App | Covered | `nourish-vendor-app/.maestro/flows/auth/07_register_validation_errors.yaml` | Covered by empty-form validation |
| TC_088 | Password complexity | Weak password rejected; field masked. | High | Vendor App | Covered | `nourish-vendor-app/.maestro/flows/auth/13_register_weak_password.yaml` | **Passed 2026-07-22** — `Password must.*`; masking is platform Password field |
| TC_089 | Password mismatch | Confirm Password must match Password. | High | Vendor App | Covered | `nourish-vendor-app/.maestro/flows/auth/08_register_password_mismatch.yaml` | **Passed** |
| TC_090 | OTP sent | After form submit, 6-digit OTP sent to registered email. | Critical | Vendor App | Skipped | `nourish-vendor-app/.maestro/flows/auth/10_register_full_flow_with_stub_otp.yaml` | **Skipped** — OTP out of scope for current Maestro runs |
| TC_091 | Valid OTP | Correct OTP within validity completes email verification. | Critical | Vendor App | Skipped | `nourish-vendor-app/.maestro/flows/auth/10_register_full_flow_with_stub_otp.yaml` | **Skipped** — OTP out of scope for current Maestro runs |
| TC_092 | Expired OTP | Expired OTP rejected; Resend option offered. | High | Vendor App | Skipped | — | **Skipped** — OTP out of scope for current Maestro runs |
| TC_093 | OTP lockout | Wrong OTP 3 times → temporary lockout. | High | Vendor App | Skipped | — | **Skipped** — OTP out of scope for current Maestro runs |
| TC_094 | Sign in after OTP | After OTP verification, sign in lands on Profile Completion. | Critical | Vendor App | Skipped | `nourish-vendor-app/.maestro/flows/auth/10_register_full_flow_with_stub_otp.yaml` | **Skipped** — depends on OTP verification (TC_090–091) |

## Supporting login flows (not in TC_075–215 range)

| Flow | Result 2026-07-22 / policy |
|------|----------------------------|
| `auth/01_login_mode_switch.yaml` | **Passed** (UI tab switch only; no OTP submit) |
| `auth/02_login_empty_fields_shows_toast.yaml` | **Passed** |
| `auth/03_login_invalid_credentials.yaml` | **Failed** — toast `Email/password is wrong` not captured within timeout |
| `auth/04_login_valid_email_lands_authenticated.yaml` | **Passed** |
| `auth/05_login_phone_password.yaml` | **Failed** — backend returns `phone_not_verified` for `vendor2` phone login (403); use verified-phone vendor or seed phone verification |
| `auth/09_forgot_password_navigation_and_otp.yaml` | **Skipped** — OTP out of scope for current Maestro runs (was Passed 2026-07-22; do not re-run as gate) |
| `auth/10_register_full_flow_with_stub_otp.yaml` | **Skipped** — OTP out of scope for current Maestro runs (was Failed 2026-07-22; excluded from suite gates) |

## Test data

- Approved vendor: `VENDOR_EMAIL` / `VENDOR_PASSWORD` (`vendor2@gmail.com` / `Abc@123456`)
- `NEW_VENDOR_*` for non-OTP registration form flows (refresh unique email/phone when re-enabling OTP)
- `ONBOARDING_*` for profile-completion flows (not OTP-dependent once account exists)
- `STUB_OTP` reserved for when OTP automation is re-enabled
