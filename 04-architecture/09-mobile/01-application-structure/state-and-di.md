---
last_updated: 2026-09-16
document_type: architecture
---

# Mobile — State and DI

## State management

- ViewModels extend `BaseViewModel` and expose UI state via **`ValueNotifier`** (and related listenable patterns).
- No Riverpod / Bloc / get_it in the current stack.

## Dependency injection

1. App bootstrap registers core deps (e.g. `AppRepository`) then calls **`DataModule.injectDependencies()`**.
2. Domain provides **`DiModule` / `DiContainer`** registration/resolution.
3. Feature **bindings** resolve repositories into ViewModels for screens.

## Live vs seed

```dart
// data/lib/di/data_module.dart
const bool kUseLiveApi = bool.fromEnvironment('USE_LIVE_API', defaultValue: true);
```

Also readable from encrypted secrets (`USE_LIVE_API`). When false, seed/offline `*RepositoryImpl` implementations are registered instead of `*RepositoryApiImpl` (except location, which is always device-based).

Related flags: `STUB_PHONE_VERIFICATION_OTP`, `API_BASE_URL`, `DFMS_TENANT_HOST`.

## Session persistence

JWT + vendor session fields live in SharedPreferences entities under `data/` (e.g. user session pref entity). Splash reconciles tokens vs `authenticated` flags; resume paths can refresh via token refresher bindings.
