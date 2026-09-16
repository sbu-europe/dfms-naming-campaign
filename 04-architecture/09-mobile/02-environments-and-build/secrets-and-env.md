---
last_updated: 2026-09-16
document_type: architecture
---

# Mobile — Secrets and Environment Keys

Values are **not** stored in this product-context repo. Document **key names** only.

## Common keys

| Key | Purpose |
|-----|---------|
| `API_BASE_URL` | Backend origin for `ApiClient` |
| `API_BASE_URL_live` | Optional alternate live URL (dev) |
| `DFMS_TENANT_HOST` | Value sent as HTTP `Host` (vendor platform schema) |
| `DFMS_TENANT_HOST_live` | Optional alternate host (dev) |
| `USE_LIVE_API` | Prefer live API repos vs seed (`true`/`false`) |
| `STUB_PHONE_VERIFICATION_OTP` | UI/testing without SMS gateway |
| Firebase Android/iOS keys | Present in env JSON; messaging not fully wired in app layer yet |

## Resolution order (conceptual)

1. Compile-time `--dart-define` (e.g. `USE_LIVE_API`)
2. Encrypted flavor secrets via `SecretManager`
3. Code defaults (e.g. `USE_LIVE_API` default `true`, local base URL `http://10.0.2.2:8000`)

## Security notes

- Never commit decrypted production secrets to git.
- Prefer encrypt flow documented in `nourish-vendor-app/env/README.md`.
- Product-context docs must not paste secret values.
