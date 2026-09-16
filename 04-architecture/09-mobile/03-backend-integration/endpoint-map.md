---
last_updated: 2026-09-16
document_type: architecture
source_of_truth_code: nourish-vendor-app/data/lib/remote/api_client/api_end_points.dart
---

# Mobile — Vendor Endpoint Map

Regenerate from `ApiEndpoints` when either mobile or backend URLs change. Prefix: `api/v1` under `API_BASE_URL`.

## Auth

| Concern | Path |
|---------|------|
| Password login | `vendor/login/password/` |
| OTP login request/resend/verify | `vendor/login/otp/request/` · `.../resend/` · `.../verify/` |
| Token refresh | `vendor/token/refresh/` |

## Registration / password / account

| Concern | Path |
|---------|------|
| Register | `vendor/register/` (+ request/resend/verify) |
| Password reset | `vendor/password-reset/request|resend|verify|complete/` |
| Change password | `vendor/password/change/` |
| Account delete | `vendor/account/delete/request|resend|verify/` |

## Profile

| Concern | Path |
|---------|------|
| Profile | `vendor/profile/` |
| Documents | `vendor/profile/documents/` |
| Phone verify | `vendor/profile/phone/verify/request|resend|confirm/` |

## Tenants / membership

| Concern | Path |
|---------|------|
| Available tenants | `vendor/tenants/available/` |
| Memberships | `vendor/memberships/` |
| Join requests | `vendor/tenants/{tenantSchema}/join-requests/` |

## Bidding (tenant-scoped)

| Concern | Path pattern |
|---------|--------------|
| Opportunities | `vendor/tenants/{tenantSchema}/bid-opportunities/` |
| Bids list/detail | `.../bids/` · `.../bids/{bidId}/` |
| Submissions | `.../bids/{bidId}/submissions/` |
| Session bid / withdraw | `.../bidding-sessions/{sessionId}/bids/` · `.../withdraw/` |

## Transport orders / trips (tenant-scoped)

| Concern | Path pattern |
|---------|--------------|
| TO list | `.../transport-orders/` (query: `group=bundle`, `lifecycle_phase=`, …) |
| Bundle detail | `.../transport-order-bundles/{bundleId}/` |
| TO detail | `.../transport-orders/{toId}/` |
| Vehicle/driver | `.../transport-orders/{toId}/vehicle-driver/` |
| Advance status | `.../transport-orders/{toId}/advance-status/` |

Assigned TOs and trips both consume **transport-order** APIs with different filters/phases — not a separate menu/orders domain.

## Backend pointer

Implementations live in `nourish-backend` under vendor API routes (see `config/urls.py` and vendor apps). Do not use `mobile.yaml` example `/mobile/driver|qc|vendor/...` paths for this client.
