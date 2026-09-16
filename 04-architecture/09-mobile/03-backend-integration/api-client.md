---
last_updated: 2026-09-16
document_type: architecture
---

# Mobile — API Client

**Sources:** `data/lib/remote/api_client/api_client.dart`, `data/lib/auth/vendor_token_refresher.dart`

## Auth model

- Uses **vendor-portal JWTs** (not tenant-user JWTs).
- `Authorization: Bearer <accessToken>` when session has real credentials.
- Refresh via `POST api/v1/vendor/token/refresh/` (`VendorTokenRefresher`).
- Proactive refresh before authenticated calls; reactive refresh on 401 (and some invalid-token 403s), then single retry.
- Access refresh skew: ~5 minutes before expiry.

## Tenancy header

- Every request merges `Host: <DFMS_TENANT_HOST>` (default ctor value `vendors.dfms.com`).
- Purpose: django-tenants routing to the **platform vendor** schema (local Host may be rewritten for `*.local` admin hosts).

## HTTP surface

`get` · `post` · `put` · `patch` · `delete` · `postMultipart` · authenticated download helpers.

Connectivity/transport retries via client guards.

## Path prefix

All vendor mobile APIs are under **`/api/v1/vendor/...`** relative to `API_BASE_URL`.

See [endpoint-map.md](endpoint-map.md).

## Contract SSOT

Prefer backend OpenAPI / Django URLConf + this endpoint map. The legacy sketch `06-contracts/.../mobile.yaml` is **not** the live Vendor Mobile contract.
