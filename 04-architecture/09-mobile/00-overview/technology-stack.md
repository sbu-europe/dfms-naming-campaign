---
last_updated: 2026-09-16
document_type: architecture
---

# Mobile — Technology Stack

**Authoritative versions** come from `nourish-vendor-app/.fvmrc` and `pubspec.yaml` (not older README boilerplate).

| Layer | Choice | Notes |
|-------|--------|-------|
| Flutter | **3.35.4** (FVM) | Pin via `.fvmrc` |
| Dart SDK | **3.9.2** | `environment.sdk` in pubspec |
| HTTP | `http` 1.2.x | `ApiClient` in `data/` |
| Local prefs | `shared_preferences` | Session + app prefs |
| Location | `geolocator`, `geocoding` | Trips / maps-related |
| UI | `flutter_screenutil`, `google_fonts`, `flutter_svg` | Adaptive mobile/tablet |
| i18n | `flutter_localizations` + ARB | **en** / **bn** |
| Secrets | `encrypt` + `SecretManager` | Encrypted flavor JSON → assets |
| E2E | Maestro | `.maestro/` in vendor app |
| App version | `0.1.0+1` | pubspec |

## Platform targets

| Platform | Minimum |
|----------|---------|
| Android | minSdk **26** |
| iOS | deployment **13.0** |

## Declared but unused (watch for drift)

- `go_router` is in pubspec; navigation code uses `Navigator` + `AppRouter`.

## Tooling

- **FVM** for Flutter version
- Flavor entrypoints under `lib/main/`
- Env encrypt scripts → `env-encrypted/` assets
