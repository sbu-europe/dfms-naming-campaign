---
last_updated: 2026-09-16
document_type: architecture
---

# Mobile — Architecture Summary

## Shape

Vendor Mobile is a **three-package Flutter monorepo** with MVVM presentation:

```text
lib/          Presentation (screens, ViewModels, navigation, theme)
domain/       Models + repository contracts + DI container
data/         HTTP API, mappers, repository impls, SharedPreferences
```

```text
[UI / ViewModel] → domain Repository interface → data *ApiImpl / *Impl
                                              → ApiClient → nourish-backend
                                              → SharedPreferences (session)
```

## Key choices (as implemented)

| Topic | Choice |
|-------|--------|
| State | `ValueNotifier` + `BaseViewModel` |
| DI | Custom `DiModule` / `DiContainer` in `domain` |
| Navigation | Flutter `Navigator` + typed `RoutePath` / `AppRouter` |
| HTTP | `package:http` (not Dio) |
| Use cases | **None** — ViewModels call repositories directly |
| Offline data | Seed/prototype repos when `USE_LIVE_API=false`; no local SQL DB yet |

> In-app `docs/` under `nourish-vendor-app` may still describe Dio / go_router / use-case layers. **This folder is the SSOT** for architecture intent matching code.

## Session topology

```text
Splash
  → Login / Register / OTP
  → Phone verification (if needed)
  → Onboarding (profile + documents)
  → Tenant directory (until an approved membership)
  → MainShell [TOs | Bids | Trips | Tenants | Profile]
```

## Related ADRs

See [`../05-decisions/`](../05-decisions/).
