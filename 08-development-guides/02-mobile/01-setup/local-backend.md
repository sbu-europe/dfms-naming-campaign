---
last_updated: 2026-09-16
---

# Vendor Mobile — Local Backend

## Pairing

1. Run `nourish-backend` locally (typically `:8000`).
2. Point `API_BASE_URL` at:
   - Android emulator: `http://10.0.2.2:8000`
   - iOS simulator: `http://localhost:8000`
3. Set `DFMS_TENANT_HOST` to the vendor platform host expected by django-tenants (local rewrite may map `vendors.dfms.com` → admin local host — handled in `ApiClient` helpers).

## Auth header expectations

- Bearer **vendor** JWT after login
- `Host` header from `DFMS_TENANT_HOST`

## Seed for Maestro

Prefer backend make target used by the team (e.g. `make seed-vendor-mobile`) documented in [`../../../09-testing/mobile/maestro-setup-and-run.md`](../../../09-testing/mobile/maestro-setup-and-run.md).

## Live vs seed repos

See [../02-guides/live-vs-seed.md](../02-guides/live-vs-seed.md).
