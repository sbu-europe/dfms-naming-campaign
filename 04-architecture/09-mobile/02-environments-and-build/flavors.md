---
last_updated: 2026-09-16
document_type: architecture
---

# Mobile — Flavors

## Flavors

| Flavor | Typical use |
|--------|-------------|
| `flavor_dev` | Local backend / developer machines |
| `flavor_test` | QA (`admin.qa…` style hosts) |
| `flavor_staging` | Staging |
| `flavor_prod` | Production |

Entrypoints live under `lib/main/` (one per flavor). Android/iOS native projects define matching flavor configs.

## Env files

Plain JSON under `nourish-vendor-app/env/`:

- `.env.dev.json`
- `.env.test.json`
- `.env.staging.json`
- `.env.prod.json`

Encrypted copies ship as assets under `env-encrypted/` (see `env/README.md` in the app repo).

## Local backend wiring

- Android emulator loopback: `10.0.2.2:8000`
- iOS simulator: `localhost:8000`
- `ApiClient` helpers rewrite configured base URL / tenant Host for local django-tenants setups

How-to: [`../../../08-development-guides/02-mobile/01-setup/`](../../../08-development-guides/02-mobile/01-setup/).
