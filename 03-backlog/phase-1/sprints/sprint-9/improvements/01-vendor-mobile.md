---
title: Sprint 9 Improvements — Vendor Mobile
module: 01-vendor-mobile
menu: Vendor Mobile · Auth · Onboarding · Forgot Password
parent: ./README.md
---

# Vendor Mobile

**Feature area:** Vendor Mobile — Auth · Onboarding · Forgot Password  
**Tracker index:** [README.md](./README.md)

> **Resolution Status values**: `Open` → `In Progress` → `Resolved`

| ID | Title | Priority | Status |
|----|-------|----------|--------|
| [FB-001](#fb-001--onboarding--tenant-join-chrome--profile-header--destructive-logout-cta) | Onboarding & tenant-join chrome: Profile header + destructive Logout CTA | Medium | Resolved |
| [FB-002](#fb-002--phone-verification-gate-after-email-otp-step-3-of-3) | Phone verification gate after email OTP (step 3 of 3) | High | Resolved |
| [FB-003](#fb-003--forgot-password-phone--unified-no-account-error-for-unknown--unverified) | Forgot-password phone: unified no-account error for unknown + unverified | Medium | Resolved |

---

## FB-001 — Onboarding & tenant-join chrome: Profile header + destructive Logout CTA

| Field | Value |
|-------|-------|
| **Source** | Internal improvement — 2026-08-17 |
| **Affected Files** | `onboarding_screen_header.dart`, `onboarding_mobile_portrait.dart`, `onboarding_view_model.dart`, `tenant_directory_mobile_portrait.dart`, `tenant_directory_view_model.dart`, `vendor_profile_mobile_portrait.dart`, `primary_button.dart`, `app_icons.dart` |
| **Closing Sub-tasks** | FB-001-1 — Replace header Logout icon with Profile `TextButton.icon` on onboarding screen · FB-001-2 — Add red destructive Logout `PrimaryButton` below Continue on onboarding · FB-001-3 — Same chrome on standalone tenant-join directory (when `showLogoutInHeader == true`) · FB-001-4 — Vendor Profile screen shows Back button when `Navigator.canPop` is true |
| **AC Amendment** | On **onboarding/document upload** and **standalone tenant-join directory** screens, the top-right action SHALL be a **Profile** `TextButton.icon` (navigates to `VendorProfileRoute`). A red destructive **Logout** `PrimaryButton` (`PrimaryButtonVariant.error`) SHALL appear in the bottom action area, below Continue. The in-shell Tenants tab SHALL NOT show the logout chrome. Vendor Profile SHALL show a Back arrow when it was pushed (i.e. `Navigator.canPop == true`). |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | `PrimaryButtonVariant.error` uses `cs.error` / `cs.onError` colour tokens. Profile header uses `AppIcons.personOutline` + `vendor_profile__app_bar_title` l10n key. Logout uses `AppIcons.logout`. `OnboardingScreenHeader.onProfile` replaces old `onLogout` callback. |

### Improvement observation

The onboarding and tenant-join screens had a Logout icon in the header, making it the primary visible escape action. Destructive actions (Logout) should not be prominent header icons; instead, a Profile shortcut is useful in those gated screens and Logout should be a clearly labelled destructive button.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-001) |
|--------|---------|-------------------|
| Header top-right (onboarding) | Logout icon button | **Profile** `TextButton.icon` → `VendorProfileRoute` |
| Header top-right (tenant-join standalone) | Logout icon button | **Profile** `TextButton.icon` → `VendorProfileRoute` |
| Bottom action area | Continue only | Continue **above** red Logout `PrimaryButton` |
| In-shell Tenants tab | N/A | Unchanged — no logout chrome in shell |
| Vendor Profile back button | Never shown | Shown when `Navigator.canPop == true` |

### Closing checklist

- [x] FB-001-1 — Onboarding header: Profile `TextButton.icon` replaces Logout icon
- [x] FB-001-2 — Onboarding bottom: red destructive Logout `PrimaryButton` below Continue
- [x] FB-001-3 — Tenant-join standalone directory: same Profile header + red Logout bottom
- [x] FB-001-4 — Vendor Profile: back button when pushed (`Navigator.canPop`)

---

## FB-002 — Phone verification gate after email OTP (step 3 of 3)

| Field | Value |
|-------|-------|
| **Source** | Internal improvement — 2026-08-17 |
| **Affected Files** | `session_navigation_gate.dart`, `app_session_state.dart`, `phone_verification/` (new feature: route, binding, VM, screen, adaptive), `otp_verification_view_model.dart`, `route_path.dart`, `splash_view_model.dart`, `login_view_model.dart`, `onboarding_view_model.dart`, `app_en.arb`, `app_bn.arb`, `text_id.dart`, `10_register_full_flow_with_stub_otp.yaml` |
| **Closing Sub-tasks** | FB-002-1 — `phoneVerified` flag in `AppSessionState` + shared prefs · FB-002-2 — `SessionDestination.phoneVerification` gate (authenticated + phone not verified + onboarding incomplete) · FB-002-3 — New phone verification screen: phone display, Send OTP button, OTP boxes, Submit · FB-002-4 — Wire email OTP success → phone verify screen (not directly to onboarding) · FB-002-5 — After successful phone OTP → proceed to onboarding · FB-002-6 — Existing verified vendors not forced through gate · FB-002-7 — l10n `phone_verify__*` keys; step counts updated to 3; Maestro flow updated |
| **AC Amendment** | After email OTP verification during registration, the vendor SHALL land on a **Phone Verification** screen (step 3 of 3) before reaching onboarding documents. The session gate SHALL route to `SessionDestination.phoneVerification` when: authenticated, `phoneVerified == false`, and onboarding incomplete. Vendors who completed onboarding **before** this change are **not** forced through the gate. The phone verification screen shows the vendor's stored phone number, a **Send OTP** button that dispatches an SMS OTP, and 6 OTP input boxes. Successful OTP sets `phoneVerified = true` in the session and navigates to onboarding. |
| **Status** | Resolved |
| **Priority** | High |
| **Notes** | Maestro phone-verify cases remain **Skipped** until a stub/inbox path is available (consistent with email OTP policy). The logout button on the phone-verify screen matches the onboarding chrome: red destructive `PrimaryButton` below the OTP submit action. |

### Improvement observation

After email OTP verification, the vendor went directly to document upload without verifying their phone number. Phone verification must be a gated step in registration so the platform has a verified contact channel before the vendor accesses operational features.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-002) |
|--------|---------|-------------------|
| Registration step count | Step 1/2, Step 2/2 | **Step 1/3, Step 2/3, Step 3/3** |
| After email OTP success | Navigates to onboarding | Navigates to **Phone Verification (step 3/3)** |
| Phone verify screen | Not present | Phone number display + **Send OTP** + OTP boxes + Submit |
| Session gate destination | `onboarding` (when unverified) | `phoneVerification` (when phone not yet verified + onboarding incomplete) |
| Existing onboarded vendors | Unaffected | Unaffected — gate skips when onboarding complete |

### Closing checklist

- [x] FB-002-1 — `phoneVerified` in `AppSessionState` + shared prefs
- [x] FB-002-2 — `SessionDestination.phoneVerification` gate condition
- [x] FB-002-3 — Phone verification screen (send OTP + OTP boxes + submit)
- [x] FB-002-4 — Email OTP success routes to phone verify, not onboarding
- [x] FB-002-5 — Phone OTP success routes to onboarding
- [x] FB-002-6 — Existing verified vendors not gated
- [x] FB-002-7 — l10n keys; step counts; Maestro flow updated

---

## FB-003 — Forgot-password phone: unified no-account error for unknown + unverified

| Field | Value |
|-------|-------|
| **Source** | Internal improvement — 2026-08-18 |
| **Affected Files** | `vendor_otp_service.py` (`request_password_reset_otp`), `vendor_account_views.py`, `exceptions.py` (import cleanup), `forgot_password_view_model.dart`, `text_id.dart`, `app_en.arb`, `app_bn.arb`, `app_localizations.dart`, `app_localizations_en.dart`, `app_localizations_bn.dart`, `test_vendor_login_otp.py` |
| **Closing Sub-tasks** | FB-003-1 — Backend: unverified phone raises `NotFoundError` (same as unknown phone) instead of `PhoneNotVerifiedError` · FB-003-2 — App: both 404 and 403 map to `ForgotPasswordNoAccountTextId` (single toast) · FB-003-3 — Remove `ForgotPasswordPhoneNotVerifiedTextId` and `forgot_password__phone_not_verified` l10n key · FB-003-4 — Update backend unit test to expect `NotFoundError` for unverified phone |
| **AC Amendment** | When a vendor submits **Forgot Password** with a phone number, both **unknown phone** (no account) and **unverified phone** (account exists but phone not yet verified) SHALL return the **same error**: `NotFoundError` (HTTP 404) from the backend, and a single toast **"No vendor account found for this mobile number"** (EN) / **"এই মোবাইল নম্বরে কোনো ভেন্ডর অ্যাকাউন্ট নেই।"** (BN) in the app. The app SHALL NOT distinguish the two cases in the UI. |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | Eliminates phone-number enumeration via the forgot-password endpoint. `PhoneNotVerifiedError` class remains in `exceptions.py` (used elsewhere — phone login path), but is no longer raised by `request_password_reset_otp`. A `VENDOR_PHONE_ACCOUNT_NOT_FOUND` constant centralises the message string in `vendor_otp_service.py`. |

### Improvement observation

The forgot-password endpoint previously returned distinct HTTP 404 (unknown phone) and HTTP 403 with code `phone_not_verified` (unverified phone), allowing callers to enumerate which phone numbers have accounts. Both cases should present as the same "no account" error to prevent enumeration.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-003) |
|--------|---------|-------------------|
| Unknown phone — backend | `NotFoundError` (404) | Unchanged — `NotFoundError` (404) |
| Unverified phone — backend | `PhoneNotVerifiedError` (403, `phone_not_verified`) | **`NotFoundError` (404)** — same as unknown |
| App — unknown phone toast | `ForgotPasswordNoAccountTextId` | Unchanged |
| App — unverified phone toast | `ForgotPasswordPhoneNotVerifiedTextId` (different message) | **`ForgotPasswordNoAccountTextId`** — same message |
| L10n key `forgot_password__phone_not_verified` | Present | **Removed** |
| Backend unit test (unverified phone) | `pytest.raises(PhoneNotVerifiedError)` | `pytest.raises(NotFoundError)` |

### Closing checklist

- [x] FB-003-1 — `request_password_reset_otp`: unverified phone raises `NotFoundError`
- [x] FB-003-2 — App: 404 and 403 both map to `ForgotPasswordNoAccountTextId`
- [x] FB-003-3 — `ForgotPasswordPhoneNotVerifiedTextId` removed; l10n key removed from arb + generated files
- [x] FB-003-4 — Unit test updated to expect `NotFoundError` for unverified phone
