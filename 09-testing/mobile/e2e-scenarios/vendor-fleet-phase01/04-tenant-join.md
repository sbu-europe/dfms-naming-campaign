# Tenant Discovery & Join Request

**Module:** Vendor Management — Vendor Tenant Join Request  
**Scope:** Vendor mobile app — **Maestro target**  
**Last Maestro run:** 2026-07-22 (emulator-5554) — full join loop + multi-tenant

| TC ID | Scenario | Test description | Priority | Scope | Maestro Status | Maestro Flow | PDF Notes |
|-------|----------|------------------|----------|-------|----------------|--------------|-----------|
| TC_102 | Tenant list displayed | Tenant Selection / directory shows available tenants. | High | Vendor App | Covered | `tenants/01_…` + `tenants/03_…` | **Passed 2026-07-22** |
| TC_103 | Join request submit | Click Join for a tenant → request submitted. | Critical | Vendor App | Covered | `tenants/03_tenant_join_request_and_lock.yaml` | **Passed 2026-07-22** |
| TC_104 | Join → Requested state | After Join, button changes to "Requested". | High | Vendor App | Covered | `tenants/03_tenant_join_request_and_lock.yaml` | **Passed 2026-07-22** |
| TC_105 | Locked before approval | Before approval, TOs/Bids/Tracks blocked. | Critical | Vendor App | Covered | `tenants/03_tenant_join_request_and_lock.yaml` | **Passed 2026-07-22** |
| TC_106 | Multiple tenant requests | Join A and B independently. | Low | Vendor App | Covered | `tenants/05_tenant_join_two_tenants.yaml` | **Passed 2026-07-22** (Nourish + Walton) |
| TC_107 | Tenant data isolation | Vendor for Tenant A not visible in Tenant B admin. | Critical | Backend | Covered | Manual / DB check | **Passed 2026-07-22** — `vendor2` approved on `nourish` only; absent from `walton` approved set |
| TC_117 | Full menu after approval | After approval, TOs/Bids/Tracks/Tenants/Profile accessible. | Critical | Vendor App | Covered | `tenants/04_tenant_join_after_approve_full_menu.yaml` | **Passed 2026-07-22** (join→approve path) |

## Full join loop (recommended)

Prefer **seed + Maestro + shell approve** (not Playwright) for this file. Admin UI / Playwright remains for [`05-tenant-approval-admin.md`](./05-tenant-approval-admin.md).

```bash
# 1) Backend fixtures (from nourish-backend)
make seed   # if needed
MAESTRO_VENDOR_EMAIL=vendor2@gmail.com \
MAESTRO_VENDOR_PASSWORD='Abc@123456' \
MAESTRO_JOIN_VENDOR_EMAIL=join.test@example.com \
MAESTRO_JOIN_VENDOR_PASSWORD=Test@1234 \
make seed-vendor-mobile
# → creates join.test@… onboarded; clears ALL memberships each run

# 2) Maestro: Join → Requested + locked (TC_102–105)
cd ../nourish-vendor-app
set -a && source .maestro/.env.local && set +a
maestro --device emulator-5554 test \
  -e APP_ID="$APP_ID" \
  -e JOIN_VENDOR_EMAIL="$JOIN_VENDOR_EMAIL" \
  -e JOIN_VENDOR_PASSWORD="$JOIN_VENDOR_PASSWORD" \
  .maestro/flows/tenants/03_tenant_join_request_and_lock.yaml

# 3) Approve pending Non-Contractual (shell)
cd ../nourish-backend
make approve-vendor-join

# 4) Maestro: full bottom nav (TC_117)
cd ../nourish-vendor-app
set -a && source .maestro/.env.local && set +a
maestro --device emulator-5554 test \
  -e APP_ID="$APP_ID" \
  -e JOIN_VENDOR_EMAIL="$JOIN_VENDOR_EMAIL" \
  -e JOIN_VENDOR_PASSWORD="$JOIN_VENDOR_PASSWORD" \
  .maestro/flows/tenants/04_tenant_join_after_approve_full_menu.yaml

# Optional TC_106 (re-seed first — clears memberships)
cd ../nourish-backend && make seed-vendor-mobile …
cd ../nourish-vendor-app
maestro --device emulator-5554 test … .maestro/flows/tenants/05_tenant_join_two_tenants.yaml
```

Do **not** re-run `make seed-vendor-mobile` between steps 2–4 — it clears join memberships.

## Related Maestro flows

| Flow | Result 2026-07-22 |
|------|-------------------|
| `tenants/01_tenant_directory_search_and_join.yaml` | **Passed** (directory/search) |
| `tenants/02_tenant_directory_search_empty.yaml` | **Passed** |
| `tenants/03_tenant_join_request_and_lock.yaml` | **Passed** |
| `tenants/04_tenant_join_after_approve_full_menu.yaml` | **Passed** |
| `tenants/05_tenant_join_two_tenants.yaml` | **Passed** |

## Test data

- Approved vendor: `VENDOR_EMAIL` (`vendor2@gmail.com`, nourish membership approved) — Waves B–D / smoke
- Join-ready vendor: `JOIN_VENDOR_EMAIL` (`join.test@example.com`) — TC_103–106 + join-path TC_117
- Approve helper: `make approve-vendor-join` (public `vendor_tenant_memberships` → Non-Contractual)
