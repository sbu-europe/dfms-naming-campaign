---

## jira_key: ~

jira_type: Story
jira_sprint: "Sprint 9"
story_id: VAPP-03
title: Vendor Mobile — Phone Verification Gate, Onboarding Chrome Restructure & Forgot-Password Error Unification
epic: Vendor Mobile — Auth & Onboarding UX Hardening
status: In Progress
story_points: 8
assignee: ~
prd_refs:

- "Vendor Mobile — Registration & onboarding flow (VM-01)"
- "US-006 OTP Verification"
phase: Phase 1
related_stories:
- VM-01 (Vendor Mobile Onboarding)
- VM-02 (Vendor Tenant Join & Approval)
- VAPP-01 (Release readiness — live API)
- VAPP-02 (Design improvements — Sprint 6)
- AUTH-01 (Phone login/2FA — Sprint 8 admin portal)



# VAPP-03 — Vendor Mobile Phone Verification Gate, Onboarding Chrome Restructure & Forgot-Password Error Unification



## User Story

**As a** new vendor registering on the Vendor Mobile app  
**I want to** verify my phone number as an explicit step immediately after email OTP  
**So that** the platform has a verified SMS contact channel before I access operational features, and the registration flow clearly communicates its three-step structure.

**As a** vendor on the onboarding or post-onboarding tenant-join screens  
**I want to** easily navigate to my profile without accidentally triggering logout  
**So that** logout is a deliberate, clearly-labelled destructive action and profile access is prominent.

**As a** vendor trying to reset their password by phone  
**I want to** see the same error whether my number is unknown or unregistered/unverified  
**So that** I know I need to register or use email, without the app revealing which phone numbers have accounts.

---



## Business Context



### Today (before Sprint 9)

| Capability | Current state |
|---|---|
| Registration step count | 2 steps: Register → Email OTP → Onboarding |
| Phone verification | Not a gated registration step |
| Onboarding header action | Logout icon (top-right) |
| Tenant-join standalone screen | Logout icon (top-right) |
| Forgot-password phone errors | Two distinct messages: "no account" (404) vs "phone not verified" (403) |

### What VAPP-03 delivers

1. **Phone verification screen** (step 3 of 3): displayed after email OTP, before onboarding documents. Shows stored phone, Send OTP, 6-digit OTP boxes, Submit. Success sets `phoneVerified = true` in session.
2. **Session gate** (`SessionDestination.phoneVerification`): routes vendors who are authenticated, phone-unverified, and onboarding-incomplete to the phone-verify screen. Existing onboarded vendors are unaffected.
3. **Onboarding & tenant-join chrome**: Profile `TextButton.icon` (top-right) → `VendorProfileRoute`; red destructive Logout `PrimaryButton` below Continue. Same chrome on standalone tenant-join directory.
4. **Forgot-password error unification**: unknown and unverified phone both return HTTP 404 and the same "no account" toast; client cannot enumerate phone numbers.

---



## Assumptions (explicit)

| # | Assumption | If wrong |
|---|---|---|
| A1 | SMS OTP for phone verification uses the existing `VendorOtpSession` infrastructure (same TTL, resend cooldown, lockout as email OTP). | Extend OTP service if new session type needed |
| A2 | Vendors who completed onboarding **before** this story are treated as phone-verified (gate checks `onboardingComplete`; if complete, phone gate is skipped). | Add explicit `phone_verified` migration/backfill if needed |
| A3 | The phone number shown on the phone-verify screen is the one stored during registration (editable only from Profile, not from the verification screen). | Add inline edit if product requires |
| A4 | Maestro phone-verify automation remains **Skipped** until a stub/inbox path is available (consistent with email OTP policy). | Re-enable when OTP stub is ready |
| A5 | `PhoneNotVerifiedError` class is kept in `exceptions.py` (it is still used by the phone-login path); only `request_password_reset_otp` stops raising it. | Remove if phone-login also changes |

---



## In Scope

- New `PhoneVerificationScreen` (Flutter) with send-OTP + OTP-input + submit flow
- `phoneVerified` session field and `SessionDestination.phoneVerification` gate
- Routing: email OTP success → phone verify; phone verify success → onboarding
- Onboarding screen header/footer chrome restructure (Profile + destructive Logout)
- Standalone tenant-join directory header/footer chrome restructure
- Vendor Profile back button when navigated to from onboarding/tenant-join
- `request_password_reset_otp` unverified phone → `NotFoundError` (404)
- App forgot-password handler: single error toast for 404 + 403
- l10n: `phone_verify__*` keys (EN + BN); remove `forgot_password__phone_not_verified`
- Maestro flow `10_register_full_flow_with_stub_otp.yaml` updated to reflect 3-step flow



## Out of Scope

- AUTH-01 phone login for admin portal (Sprint 8)
- Vendor Mobile phone login (separate story)
- Inline phone number editing on the phone-verify screen
- TOTP / authenticator apps

---



## Acceptance Criteria



### AC-1 — Phone verification screen (step 3 of 3)

- [ ] After successful email OTP, vendor is routed to a **Phone Verification** screen labelled "step 3 of 3".
- [ ] Screen shows the vendor's stored phone number (read-only).
- [ ] **Send OTP** button dispatches an SMS OTP to the stored phone and reveals 6-digit OTP input boxes.
- [ ] Submitting a correct OTP sets `phoneVerified = true` in the session (shared prefs) and navigates to onboarding documents.
- [ ] Incorrect / expired OTP shows an error; resend respects the same cooldown as email OTP.
- [ ] Screen shows a red destructive **Logout** button matching onboarding chrome (AC-2).



### AC-2 — Onboarding & tenant-join chrome

- [ ] On **onboarding/document upload** and **standalone tenant-join directory** screens the top-right action is a **Profile** `TextButton.icon` (navigates to `VendorProfileRoute`).
- [ ] A red **Logout** `PrimaryButton` (`PrimaryButtonVariant.error`) appears in the bottom action area, below Continue / Submit.
- [ ] The in-shell **Tenants tab** does **not** show the standalone logout chrome.
- [ ] Vendor Profile screen shows a **Back** arrow when it was pushed (`Navigator.canPop == true`).



### AC-3 — Session gate

- [ ] `SessionDestination.phoneVerification` is emitted by the gate when: authenticated, `phoneVerified == false`, onboarding incomplete.
- [ ] Vendors with `onboardingComplete == true` are **not** sent to phone verification, regardless of the `phoneVerified` flag (backward-compat gate).
- [ ] Splash and login VMs respect the new destination.



### AC-4 — Forgot-password phone error unification

- [ ] `request_password_reset_otp` with an **unverified** phone raises `NotFoundError` (HTTP 404), not `PhoneNotVerifiedError` (403).
- [ ] App forgot-password handler maps **both** 404 and 403 (phone) to `ForgotPasswordNoAccountTextId`.
- [ ] Toast copy (EN): "No vendor account found for this mobile number."
- [ ] Toast copy (BN): "এই মোবাইল নম্বরে কোনো ভেন্ডর অ্যাকাউন্ট নেই।"
- [ ] `ForgotPasswordPhoneNotVerifiedTextId` class and `forgot_password__phone_not_verified` l10n key are **removed** from the codebase.



### AC-5 — l10n & tests

- [ ] `phone_verify__*` l10n keys present in `app_en.arb` and `app_bn.arb`; generated files regenerated.
- [ ] Backend unit test for unverified phone reset asserts `NotFoundError`, not `PhoneNotVerifiedError`.
- [ ] Maestro `10_register_full_flow_with_stub_otp.yaml` updated to reflect 3-step flow (email OTP → phone verify → onboarding).

---



## Functional Flows



### Flow A — New vendor registration (full)

```
Vendor opens app
  → Register (step 1/3): email, company, password
  → Email OTP sent → Email OTP verify (step 2/3)
  → Email OTP success → Phone Verification screen (step 3/3)
  → Send OTP → SMS OTP to stored phone
  → Correct OTP → phoneVerified = true → Onboarding documents
  → All 4 docs uploaded + Continue → Tenant directory
```



### Flow B — Session gate (returning unverified vendor)

```
Vendor opens app (authenticated, phoneVerified=false, onboarding incomplete)
  → Splash → SessionNavigationGate
  → Destination: phoneVerification → Phone Verification screen
  → Correct OTP → phoneVerified = true → Onboarding documents
```



### Flow C — Onboarding chrome navigation

```
Vendor on Onboarding screen
  → Taps Profile (top-right) → VendorProfileRoute pushed
    → Vendor Profile shows Back button → Back returns to Onboarding
  → Taps Logout (bottom, red) → Destructive confirm → logout
```



### Flow D — Forgot password with phone (error path)

```
Vendor enters phone on Forgot Password screen
  → API call: request_password_reset_otp
  → Phone unknown: NotFoundError (404)
  → Phone unverified: NotFoundError (404)  ← changed from 403
  → App: both cases → "No vendor account found for this mobile number." toast
  → navigateBack()
```

---



## Business Rules

| ID | Rule |
|---|---|
| BR-VAPP03-001 | Phone verification is mandatory for new registrations before onboarding documents |
| BR-VAPP03-002 | Existing vendors (onboardingComplete == true) are exempt from the phone-verify gate |
| BR-VAPP03-003 | Phone OTP TTL, resend cooldown, and lockout match email OTP (3 min TTL, 60 s cooldown, 5-attempt lockout) |
| BR-VAPP03-004 | Logout on gated screens (onboarding / phone-verify / standalone tenant-join) is a destructive red `PrimaryButton`; it must not appear as a header icon |
| BR-VAPP03-005 | Forgot-password phone endpoint must not distinguish unknown vs unverified phone numbers to prevent enumeration |
| BR-VAPP03-006 | The `forgot_password__phone_not_verified` l10n key must be removed; clients must not reference it |

---



## Sub-tasks

| # | Sub-task | Description | Priority | Status |
|---|---|---|---|---|
| VAPP-03-1 | Session state & gate | `phoneVerified` in `AppSessionState` + shared prefs; `SessionDestination.phoneVerification` in gate | High | Done |
| VAPP-03-2 | Phone verification screen | New screen: phone display, Send OTP, OTP boxes, Submit; red Logout CTA | High | Done |
| VAPP-03-3 | Routing — email OTP → phone verify | After email OTP success, navigate to phone verify screen (not onboarding) | High | Done |
| VAPP-03-4 | Onboarding & tenant-join chrome | Profile header `TextButton.icon`; red Logout `PrimaryButton` below Continue; vendor profile back button | Medium | Done |
| VAPP-03-5 | Backend: forgot-password error unification | `request_password_reset_otp` unverified → `NotFoundError`; app maps 403 + 404 to same toast | Medium | Done |
| VAPP-03-6 | l10n, Maestro, tests | `phone_verify__*` keys; remove `phone_not_verified` key; update Maestro flow; backend unit test | Medium | Done |

---



## Dependencies

| Dependency | Notes |
|---|---|
| SMS gateway | OTP dispatch for phone verification; same gateway as `request_login_otp` |
| `VendorOtpSession` infrastructure | Reused for phone-verify OTP (new `Purpose` value or reuse `PHONE_VERIFICATION`) |
| `AppSessionState` / shared prefs | `phoneVerified` field persisted between cold starts |

---



## Open Questions (for PO / client)

1. **Phone edit on verification screen** — should vendor be able to change phone number if it is wrong, directly from the phone-verify screen?
2. **Backfill** — should existing unverified vendors (have account, `phone_verified=False`, onboarding complete) be forced to verify on next login, or only new registrations?
3. **Maestro stub** — when will an OTP stub/inbox path be available to re-enable automated phone-verify tests?

---



## Test Plan

- [ ] New registration: email OTP success → phone verify screen shown (step 3/3)
- [ ] Send OTP → OTP boxes appear; correct OTP → onboarding
- [ ] Incorrect OTP → error message; resend after cooldown
- [ ] Existing onboarded vendor login → skips phone-verify gate
- [ ] Session gate: authenticated + `phoneVerified=false` + onboarding incomplete → phone-verify screen
- [ ] Onboarding screen: Profile tapped → Vendor Profile opens with back button; back returns to onboarding
- [ ] Onboarding screen: Logout tapped → session cleared (red button)
- [ ] Standalone tenant-join: same Profile/Logout chrome
- [ ] Forgot password — phone unknown (404) → "No vendor account found" toast
- [ ] Forgot password — phone unverified (now also 404) → same "No vendor account found" toast

---



## Definition of Done

- [ ] All acceptance criteria AC-1–AC-5 met
- [ ] Sub-tasks VAPP-03-1 … VAPP-03-6 completed
- [ ] `forgot_password__phone_not_verified` l10n key absent from all arb and generated files
- [ ] `ForgotPasswordPhoneNotVerifiedTextId` class absent from codebase
- [ ] Backend unit test passes (`NotFoundError` for unverified phone reset)
- [ ] Maestro flow updated; phone-verify cases marked Skipped with OTP policy note
- [ ] Context docs updated (`DFMS-product-context` vendor mobile module + Phase-01 test scenarios)
- [ ] Story status updated for Sprint 9 tracking

---



## Notes

- This story builds on VAPP-01/VAPP-02 (Sprint 6 vendor app release readiness and design improvements).
- `PrimaryButtonVariant.error` (added this sprint) uses `cs.error` / `cs.onError` colour tokens and is the canonical destructive button style for the vendor app.
- The `PhoneNotVerifiedError` class is **not** deleted — it is still raised by `request_login_otp` when the vendor tries to log in by phone before verifying.
