---
last_updated: 2026-09-16
document_type: architecture
---

# Mobile — Feature Map

Maps **code** ↔ **product specs** ↔ **Maestro flows**. Product rules stay in `vendor-mobile/`; this file is the index.

| Domain | Code (`lib/presentation/feature/`) | Product spec | Maestro (`.maestro/flows/`) |
|--------|--------------------------------------|--------------|-----------------------------|
| Splash / gate | `splash/` | [00-navigation…](../../05-modules/09-mobile-apps/vendor-mobile/00-navigation-and-information-architecture.md) | `smoke/`, `auth/` |
| Auth + phone | `auth/` | [01-onboarding…](../../05-modules/09-mobile-apps/vendor-mobile/01-onboarding-and-verification.md), [10-security…](../../05-modules/09-mobile-apps/vendor-mobile/10-security-and-access-control.md) | `auth/` |
| Onboarding docs | `onboarding/` | [01-onboarding…](../../05-modules/09-mobile-apps/vendor-mobile/01-onboarding-and-verification.md) | `onboarding/` |
| Tenants | `tenant_directory/` | [02-tenant-membership.md](../../05-modules/09-mobile-apps/vendor-mobile/02-tenant-membership.md) | `tenants/` |
| Bids | `bids/` | [03](../../05-modules/09-mobile-apps/vendor-mobile/03-bid-opportunities-list.md)–[04](../../05-modules/09-mobile-apps/vendor-mobile/04-bid-submission.md), [12](../../05-modules/09-mobile-apps/vendor-mobile/12-vendor-type-flows.md) | `bids/` |
| Assigned TOs | `assigned_tos/` | [05](../../05-modules/09-mobile-apps/vendor-mobile/05-assigned-tos-list.md)–[06](../../05-modules/09-mobile-apps/vendor-mobile/06-post-award-driver-vehicle-submission.md) | `tos/` |
| Trips | `trips/` | [07](../../05-modules/09-mobile-apps/vendor-mobile/07-active-trip-tracking.md)–[08](../../05-modules/09-mobile-apps/vendor-mobile/08-completed-trip-history.md) | `trips/` |
| Profile | `vendor_profile/` | [09-profile-management.md](../../05-modules/09-mobile-apps/vendor-mobile/09-profile-management.md) | `profile/` |
| Settings | `settings/` | (app chrome) | `settings/` |
| Shell | `main_shell/` | [00-navigation…](../../05-modules/09-mobile-apps/vendor-mobile/00-navigation-and-information-architecture.md) | — |

## Data layer mirror

| Domain | Live impl | Seed impl |
|--------|-----------|-----------|
| Auth | `auth_repository_api_impl.dart` | `auth_repository_impl.dart` |
| Profile | `vendor_profile_repository_api_impl.dart` | `*_impl.dart` |
| Tenants | `tenant_membership_repository_api_impl.dart` | `*_impl.dart` |
| Bids | `bids_repository_api_impl.dart` | `*_impl.dart` |
| Assigned TOs | `assigned_tos_repository_api_impl.dart` | `*_impl.dart` |
| Trips | `trips_repository_api_impl.dart` | `*_impl.dart` |

## Integration notes

See product [11-integration-and-design-decisions.md](../../05-modules/09-mobile-apps/vendor-mobile/11-integration-and-design-decisions.md) and [endpoint-map.md](03-backend-integration/endpoint-map.md).
