---
last_updated: 2026-09-16
document_type: architecture
---

# Mobile — Presentation Conventions

## Feature folder layout

Under `lib/presentation/feature/<feature>/`:

```text
binding/          # DI / screen bindings
route/            # Route definitions for this feature
screen/           # Adaptive UI / screens
widgets/          # Feature-local widgets
*_view_model.dart
```

Shared bases live under `lib/presentation/base/` (`BaseViewModel`, `BaseScreen`, adaptive helpers).

## Feature inventory

| Folder | Concern |
|--------|---------|
| `splash/` | Boot + session destination |
| `auth/` | Welcome, login, register, OTP, phone verify, password flows |
| `onboarding/` | Profile + documents after auth |
| `tenant_directory/` | Discover tenants, join requests |
| `main_shell/` | Bottom navigation host |
| `bids/` | Opportunities, details, submission |
| `assigned_tos/` | List, TO/bundle details, post-award vehicle/driver |
| `trips/` | Active tracking, completed history/details |
| `vendor_profile/` | Hub, details, edit |
| `settings/` | Theme / language |

## Adaptive UI

Screens typically expose `*AdaptiveUi` variants for phone vs tablet within the same feature.

## Product mapping

Screen-level product rules: [`../../../05-modules/15-mobile-apps/vendor-mobile/`](../../../05-modules/15-mobile-apps/vendor-mobile/).  
Code ↔ spec table: [`../04-feature-map.md`](../04-feature-map.md).
