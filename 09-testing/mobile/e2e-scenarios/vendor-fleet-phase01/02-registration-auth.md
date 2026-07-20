# Registration & Authentication

**Module:** Vendor Management — Vendor Registration (Mobile App)  
**Scope:** Vendor mobile app — **Maestro target**

| TC ID | Scenario | Test description | Priority | Scope | Maestro Status | Maestro Flow | PDF Notes |
|-------|----------|------------------|----------|-------|----------------|--------------|-----------|
| TC_083 | Registration screen access | Open Vendor Fleet Mobile App without login. Registration option available. | High | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/auth/06_vendor_welcome_to_register_navigation.yaml` | |
| TC_084 | Mandatory fields present | Registration form shows Email, Company Name, Password, Confirm Password — all mandatory. | High | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/auth/07_register_validation_errors.yaml` | |
| TC_085 | Email format validation | Invalid formats (`abc@`, `abc.com`, `abc@@test..com`) rejected with clear errors. | High | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/auth/07_register_validation_errors.yaml` | |
| TC_086 | Duplicate email | Register with existing email blocked with duplicate error. | Critical | Vendor App | Not Started | — | Needs unique vs duplicate accounts |
| TC_087 | Company name required | Blank Company Name blocked on submit. | High | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/auth/07_register_validation_errors.yaml` | |
| TC_088 | Password complexity | Weak password rejected; field masked. | High | Vendor App | Not Started | — | |
| TC_089 | Password mismatch | Confirm Password must match Password. | High | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/auth/08_register_password_mismatch.yaml` | |
| TC_090 | OTP sent | After form submit, 6-digit OTP sent to registered email. | Critical | Vendor App | Not Started | — | Needs live/stub OTP |
| TC_091 | Valid OTP | Correct OTP within validity completes email verification → Sign In or Profile Completion. | Critical | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/auth/10_register_full_flow_with_stub_otp.yaml` | Stub OTP `123456` |
| TC_092 | Expired OTP | Expired OTP rejected; Resend option offered. | High | Vendor App | Not Started | — | |
| TC_093 | OTP lockout | Wrong OTP 3 times → temporary lockout. | High | Vendor App | Not Started | — | |
| TC_094 | Sign in after OTP | After OTP verification, sign in with email/password lands on Profile Completion. | Critical | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/auth/10_register_full_flow_with_stub_otp.yaml` | |

## Related Maestro flows (login — not in TC range but used for setup)

| Flow | Covers |
|------|--------|
| `nourish-vendor-app/.maestro/flows/auth/01_login_mode_switch.yaml` | Email ↔ Phone OTP tab |
| `nourish-vendor-app/.maestro/flows/auth/02_login_empty_fields_shows_toast.yaml` | Empty login validation |
| `nourish-vendor-app/.maestro/flows/auth/03_login_invalid_credentials.yaml` | Wrong credentials |
| `nourish-vendor-app/.maestro/flows/auth/04_login_valid_email_lands_authenticated.yaml` | Valid email login |
| `nourish-vendor-app/.maestro/flows/auth/05_login_phone_password.yaml` | Phone + password login |
| `nourish-vendor-app/.maestro/flows/auth/09_forgot_password_navigation_and_otp.yaml` | Forgot password → OTP |

## Test data

- `NEW_VENDOR_EMAIL`, `NEW_VENDOR_PASSWORD` in `.maestro/.env.local` for registration flows
- `STUB_OTP=123456` when backend stub OTP is enabled
