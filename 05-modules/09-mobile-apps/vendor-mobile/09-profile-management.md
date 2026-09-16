---
last_updated: 2026-09-16
---

# Vendor Mobile Application — Profile Management

## Purpose

Allow vendors to view/update vendor profile information and account settings. In **Phase 1**, vendors do **not** maintain driver/vehicle master lists inside the app—driver/vehicle/helper details are submitted **per awarded/assigned TO** during post-award actions (`06-post-award-driver-vehicle-submission.md`).

## Profile hub (MainShell → Profile tab)

| Area | Behavior |
|------|----------|
| Vendor information | Company name, contact, email, phone, address |
| Documents | View/update onboarding documents where API allows |
| Tenant memberships | See memberships / jump toward tenant directory flows |
| Settings | Theme, language (`settings/` feature) |
| Account security | Change password; account delete OTP flow where enabled |

**Vendor type** (Contractual / Non-Contractual) is **per tenant membership**, not a single global profile field collected at registration.

## Driver/Vehicle details (Phase 1)

- No driver list / vehicle list screens for vendors
- Details captured only on post-award / assigned TO:
  - Driver name + phone + NID/license
  - Vehicle number + type + capacity
  - Helper details if required

## Helper management (Phase 2+)

If Phase 2 introduces helper master data, add list/add/edit here.

## Code map

| Concern | Code | APIs |
|---------|------|------|
| Profile hub / details / edit | `lib/presentation/feature/vendor_profile/` | `vendor/profile/`, `vendor/profile/documents/` |
| Settings | `lib/presentation/feature/settings/` | local prefs via `AppRepository` |
| Account delete | auth/account flows | `vendor/account/delete/*` |
| Change password | `auth/change_password/` | `vendor/password/change/` |

Maestro: `.maestro/flows/profile/`, `.maestro/flows/settings/`.
