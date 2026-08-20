# Registration, Verification & Login (TC_001–TC_026)

**Source:** DFMS UAT Test Suite — Create Account, Email/Mobile Verification, Login.
**Scope:** Vendor mobile app (Maestro).
**OTP policy:** TC_011–TC_018 **Skipped** until stub OTP path is stable.
**Product note:** UAT TC_020 expects Mobile + Password; current app Phone tab is OTP-oriented.

| TC ID | Title | Scenario | Scope | Status | Automation | Notes |
|-------|-------|----------|-------|--------|------------|-------|
| TC_001 | Create Account access | Verify vendor can access Create Account without login | Vendor App | **Covered** | `auth/06_…` | Passed |
| TC_002 | All mandatory fields | Company Name, Contact Person, Email, Mobile, Password all mandatory | Vendor App | **Partial** | `auth/07_…` | Contact Person + Mobile not fully asserted in Maestro |
| TC_003 | Company Name required | Company Name rejects blank | Vendor App | **Covered** | `auth/07_…` | Passed |
| TC_004 | Contact Person required | Contact Person rejects blank | Vendor App | **Not Started** | — | Missing from prior Phase01 context; add Maestro assert |
| TC_005 | Email format | Email format validated | Vendor App | **Covered** | `auth/11_…` | Passed |
| TC_006 | Duplicate email | Duplicate email rejected | Vendor App | **Covered** | `auth/12_…` | Passed |
| TC_007 | Mobile format | Mobile number format validated | Vendor App | **Not Started** | — | New from UAT PDF |
| TC_008 | Duplicate mobile | Duplicate mobile rejected | Vendor App | **Not Started** | — | New from UAT PDF |
| TC_009 | Password complexity | Password complexity + masked field | Vendor App | **Covered** | `auth/13_…` | Passed |
| TC_010 | Email AND mobile required | Cannot submit with only email or only mobile | Vendor App | **Not Started** | — | UAT: both channels required (not OR) |
| TC_011 | Send email verification code | Send Verification Code emails OTP + countdown | Vendor App | **Skipped** | `auth/10_…` | OTP automation out of scope |
| TC_012 | Email before mobile | Cannot reach mobile verify before email verify | Vendor App | **Skipped** | — | OTP out of scope |
| TC_013 | Email locked after code | Email not editable after code sent without restart | Vendor App | **Skipped** | — | OTP out of scope |
| TC_014 | Nav to mobile after email | After email verify → Verify Mobile Number | Vendor App | **Skipped** | `auth/10_…` | OTP out of scope |
| TC_015 | Send SMS OTP | Send OTP via SMS | Vendor App | **Skipped** | — | OTP out of scope |
| TC_016 | Valid mobile OTP | Correct OTP completes mobile verify | Vendor App | **Skipped** | `auth/10_…` | OTP out of scope |
| TC_017 | Cannot skip mobile verify | Registration blocked if mobile verify skipped | Vendor App | **Skipped** | — | OTP out of scope |
| TC_018 | Both channels required | Registration complete only after email + mobile verify | Vendor App | **Skipped** | `auth/10_…` | OTP out of scope |
| TC_019 | Login email + password | Fully registered vendor logs in with Email + Password | Vendor App | **Covered** | `auth/04_…` | Passed |
| TC_020 | Login mobile + password | Login with Mobile Number + Password | Vendor App | **Partial** | `auth/05_…` | App/Maestro currently Phone OTP tab (no password) — product conflict vs UAT |
| TC_021 | Wrong password (email) | Login fails with incorrect password (email) | Vendor App | **Covered** | `auth/03_…` | Fixed 2026-08-19 |
| TC_022 | Wrong password (mobile) | Login fails with incorrect password (mobile) | Vendor App | **Not Started** | — | Depends on mobile+password login |
| TC_023 | Unregistered email | Login fails with unregistered email | Vendor App | **Partial** | `auth/03_…` | Covered via invalid-creds path |
| TC_024 | Unregistered mobile | Login fails with unregistered mobile | Vendor App | **Not Started** | — | New from UAT PDF |
| TC_025 | Incomplete registration blocked | Incomplete email/mobile verify cannot login | Vendor App | **Not Started** | — | New from UAT PDF |
| TC_026 | Login routing by progress | Routes to Profile / Tenants / Home by onboarding state | Vendor App | **Partial** | onboarding + tenants flows | Covered indirectly |
