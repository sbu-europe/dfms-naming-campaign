---
last_updated: 2026-09-16
document_type: architecture
---

# Mobile — Navigation and Session Gating

## Router

- **Initial route**: `/splash`
- **Implementation**: `lib/presentation/navigation/app_router.dart` + `route_path.dart`
- **Pattern**: Flutter `Navigator` with typed `RoutePath` (not go_router usage)

## Session gate

Source: `lib/presentation/common/util/session_navigation_gate.dart` (`resolveSessionDestination`).

| Order | Condition | Destination |
|-------|-----------|-------------|
| 1 | Not authenticated | Login |
| 2 | Phone unverified **and** onboarding incomplete | Phone verification |
| 3 | Onboarding incomplete | Onboarding |
| 4 | No approved tenant membership | Tenant directory |
| 5 | Else | Main shell |

Splash (and post-auth flows) navigate with back stack cleared.

## Main shell tabs

`MainShellTab` order: **tos** · **bids** · **trips** · **tenants** · **profile**

| Tab | Primary UI |
|-----|------------|
| TOs | Assigned TOs list |
| Bids | Bid opportunities (non-contractual tenants) |
| Trips | Completed / active trip surfaces |
| Tenants | Tenant directory |
| Profile | Vendor profile hub |

Tenant scope uses persisted `selectedTenantId` / approved memberships from session.

## Route groups (path strings)

| Group | Examples |
|-------|----------|
| Auth | `/login`, `/vendorRegister`, `/otpVerification`, `/phoneVerification`, password routes |
| Pre-access | `/onboarding`, `/tenantDirectory` |
| Shell | `/mainShell` |
| Bids | `/bidOpportunities`, `/bidDetails`, `/bidSubmission`, … |
| TOs | `/assignedTosList`, `/toDetails`, `/bundleDetails`, `/postAwardSubmission` |
| Trips | `/activeTripTracking`, `/completedTripHistory`, `/completedTripDetails` |
| Profile | `/vendorProfile`, `/vendorProfileDetails`, `/vendorProfileEdit`, `/setting` |

Product IA: [`../../../05-modules/15-mobile-apps/vendor-mobile/00-navigation-and-information-architecture.md`](../../../05-modules/15-mobile-apps/vendor-mobile/00-navigation-and-information-architecture.md).
