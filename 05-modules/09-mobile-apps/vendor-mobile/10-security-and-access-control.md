---
last_updated: 2026-07-07
---

# Vendor Mobile — Security & Access Control

## Authentication

**Login methods:**
- Email/Password
- Phone Number + OTP

**Session management:**
- **Vendor JWTs** — access + refresh token pair issued on login (`issue_vendor_tokens`). Tokens carry `sub="vendor"` and `vendor_portal_account_id`; they are validated by `VendorJWTAuthentication` against `VendorPortalAccount` in the **public** schema (not `AUTH_USER_MODEL`).
- **Lifetimes** — access token **24h** (`JWT_ACCESS_TOKEN_LIFETIME`, default 1440 min); refresh token **7 days** (`JWT_REFRESH_TOKEN_LIFETIME`).

### Token refresh & proactive session rotation (VAPP-01 AC-4)

The app keeps the session valid transparently — the vendor should never see a crash or a silent dead session because a token lapsed while the app was backgrounded.

- **Endpoint** — `POST /api/v1/vendor/token/refresh/` with body `{ "refresh": <token> }` returns `{ "access": <token> }` (`VendorTokenRefreshView` → `refresh_vendor_access_token`).
- **Proactive refresh** — the client decodes the access token's `exp` (`JwtTokenUtils`) and exchanges the refresh token for a new access token when the access token is **expired or within a 5-minute skew window**. Triggered on:
  - **App foreground resume** (`SessionRefreshBinding`, a `WidgetsBindingObserver` on `AppLifecycleState.resumed`).
  - **Splash / init** reconciliation (`SplashViewModel`), before resolving the initial route.
- **Reactive refresh** — any authenticated request that returns `401` (or a `403` normalised from `not_authenticated` / `authentication_failed`) forces a single refresh-and-retry via `ApiClient`.
- **Shared logic** — both manual and automatic paths route through `VendorTokenRefresher`, which owns token exchange and secure session storage.
- **Refresh token expired / refresh fails** — the stored session is cleared and the vendor is routed to **login with a clear message**.
- **Rotation note** — the vendor refresh endpoint issues a **new access token only**; the refresh token is **reused** (not rotated) until it expires, distinct from SimpleJWT's `ROTATE_REFRESH_TOKENS` behaviour on internal-user (`/api/v1/auth/token/refresh/`) tokens. The mobile refresher still persists a rotated `refresh` value if the response ever returns one (forward-compatible).

> Tracked as **[FB-015](../../../03-backlog/sprints/sprint-6/feedback-resolution.md#fb-015--vendor-mobile-proactive-jwt-refresh--session-hardening-transparent-token-rotation)** (Vendor Mobile proactive JWT refresh & session hardening). Secure token storage (Keystore/Keychain) is tracked under VAPP-01 AC-7.

## Data access control

**Vendor isolation:**
- Vendor can only view/edit their own data (bids, TOs, trips, post-award submissions)
- Strict `vendor_id` filtering on all API endpoints

**Tenant scope (vendor membership):**
- Vendor can only view bids, TOs, and trips for tenants where the vendor membership is approved
- All list/detail endpoints enforce `(vendor_id, tenant_id)` scope, not just `vendor_id`

## Audit trail

**Logged actions:**
- Bid submissions
- Post-award driver/vehicle submissions
- Profile updates

