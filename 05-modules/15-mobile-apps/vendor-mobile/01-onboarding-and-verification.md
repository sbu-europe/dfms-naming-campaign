---
last_updated: 2026-09-16
---

# Vendor Mobile — Onboarding & Verification

## Entry path (single)

- **Self-registration on Vendor Mobile** *(initial scope: Vendor Mobile only; web self-registration deferred)*: Vendor signs up and submits required profile + documents (Trade License, BIN, TIN, testimonial/reference). **Vendor type (Contractual vs Non-Contractual) is not collected here** — Tenant Admin sets it when approving a tenant join (**VM-02**).
- **Registration gate sequence:** `Register` → `Email OTP verify` → `Phone verification with OTP` → `Profile/documents onboarding`.

> **No platform-admin invite / create-vendor path in Phase 1.** Platform Admin does not onboard vendors. The only way a vendor enters DFMS is by self-registering through the Vendor Mobile app.

## Access after registration (no Platform Admin verification)

There is **no** Platform Admin approve/reject queue after sign-up.

- After **registration and phone verification are complete** (plus mandatory docs/profile), the vendor is **platform-active** for listing tenants and submitting **tenant join** requests.
- **Tenant-scoped** access to bids, TOs, and trips requires join approval (and tenant-assigned vendor type on approve).

## Session gate (implemented)

Cold start uses `resolveSessionDestination` (see architecture navigation doc):

1. Not authenticated → Login / Welcome / Register  
2. Phone unverified and onboarding incomplete → **Phone verification**  
3. Onboarding incomplete → **Onboarding** (documents/profile)  
4. No approved tenant → Tenant directory  
5. Else → Main shell  

Sprint 9 auth UX (forgot/reset password chrome, phone gate) lives under `lib/presentation/feature/auth/` and related backlog `VAPP-03` / improvements.

## Verification (naming note)

Older PRD “verification” meant **platform admin document review**. That step is **not** in the current model; **completeness** of mandatory uploads is enforced at onboarding, and **tenants** gate operational access via join approval.

## Code map

| Concern | Code | APIs |
|---------|------|------|
| Register / email OTP | `lib/presentation/feature/auth/register/`, OTP screens | `vendor/register/`, `vendor/register/request|resend|verify/` |
| Login password / OTP | `lib/presentation/feature/auth/login/`, otp_verification | `vendor/login/password/`, `vendor/login/otp/*` |
| Phone verification | `lib/presentation/feature/auth/phone_verification/` | `vendor/profile/phone/verify/*` |
| Password reset | `forgot_password/`, `reset_password/`, `change_password/` | `vendor/password-reset/*`, `vendor/password/change/` |
| Onboarding docs | `lib/presentation/feature/onboarding/` | `vendor/profile/`, `vendor/profile/documents/` |
| Session gate | `lib/presentation/common/util/session_navigation_gate.dart` | — |

Architecture: [`../../../04-architecture/09-mobile/01-application-structure/navigation-and-session-gating.md`](../../../04-architecture/09-mobile/01-application-structure/navigation-and-session-gating.md).
