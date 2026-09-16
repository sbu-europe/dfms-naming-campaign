---
last_updated: 2026-09-16
document_type: architecture
---

# Mobile — Package Boundaries

## Dependency graph

```text
hello_flutter (lib/) ──path──► domain
                 └──path──► data ──path──► domain
```

| Package | May depend on | Must not depend on |
|---------|---------------|--------------------|
| **domain** | Flutter SDK, small utils (`logger`, `encrypt`) | `data`, app `lib/` |
| **data** | `domain`, `http`, prefs, geolocator, etc. | app presentation widgets |
| **lib (app)** | `domain`, `data` | — |

## Responsibilities

### `domain/`

- Domain models (`domain/lib/model/...`)
- Repository **interfaces** (`domain/lib/repository/...`)
- DI primitives (`DiModule`, `DiContainer`)
- Secret helpers used across layers

### `data/`

- `ApiClient` + `ApiEndpoints`
- `*ApiService` remote calls
- `*RepositoryApiImpl` (live) and `*RepositoryImpl` (seed)
- Mappers (`data/lib/mapper/...`)
- `DataModule.injectDependencies()` / `USE_LIVE_API` switch
- SharedPreferences entities for session

### `lib/`

- `main/` flavor entrypoints
- `presentation/` features, navigation, theme, localization
- App bootstrap (`MyApp`, register repos via DI)

## Repository surface (domain contracts)

`AuthRepository` · `VendorProfileRepository` · `TenantMembershipRepository` · `BidsRepository` · `AssignedTosRepository` · `TripsRepository` · `LocationRepository` · `AppRepository`
