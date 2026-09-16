---
last_updated: 2026-09-16
---

# Vendor Mobile — Development Setup

## Prerequisites

- FVM with Flutter **3.35.4** (see `nourish-vendor-app/.fvmrc`)
- Xcode / Android Studio as needed
- Access to `nourish-backend` for live API
- Maestro (for E2E) — see [../03-testing/maestro.md](../03-testing/maestro.md)

## Clone and packages

```bash
cd nourish-vendor-app
fvm flutter pub get
# Also resolve path packages if needed from domain/ and data/
```

## Flavors

Run the flavor entrypoint matching your environment (`lib/main/…`). Use Android/iOS flavor configs (`flavor_dev`, `flavor_test`, `flavor_staging`, `flavor_prod`).

## Environment / secrets

1. Edit JSON under `env/.env.<flavor>.json` (keys only documented in architecture).
2. Run the repo’s encrypt flow so assets land in `env-encrypted/`.
3. See `nourish-vendor-app/env/README.md`.

Critical keys: `API_BASE_URL`, `DFMS_TENANT_HOST`, `USE_LIVE_API`, optional `STUB_PHONE_VERIFICATION_OTP`.

## Architecture reading order

1. [`../../../04-architecture/09-mobile/README.md`](../../../04-architecture/09-mobile/README.md)
2. Product IA: [`../../../05-modules/09-mobile-apps/vendor-mobile/`](../../../05-modules/09-mobile-apps/vendor-mobile/)
