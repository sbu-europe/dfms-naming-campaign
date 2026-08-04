# Tenant Approval (Admin Portal)

**Module:** Vendor Management — Vendor Approval (Tenant Admin)  
**Scope:** Tenant admin SSR portal (`/vendors/`) + related TDO/mobile asserts  
**Automation:** **Playwright** (admin/TDO) + **Maestro** (vendor app).  
**Last run:** 2026-07-22 — Playwright `RUN_ID=A7F22E01`; Maestro `06`/`07` on `emulator-5554`

| TC ID | Scenario | Test description | Priority | Scope | Maestro/Playwright Status | Runner / evidence | Notes |
|-------|----------|------------------|----------|-------|---------------------------|-------------------|-------|
| TC_108 | Pending join request visible | Tenant Admin sees vendor with Join Status = Pending. | High | Tenant Admin | **Pass** (Playwright) | `run-vendor-tenant-approval.mjs` | `make seed-vendor-approval-pw` |
| TC_109 | Documents visible to admin | Trade License, BIN, TIN, Truck Association viewable. | High | Tenant Admin | **Pass** (Playwright pending re-run) | same | Portal Vendor details dialog shows Compliance documents with View file links |
| TC_110 | Approval type options | Contractual and Non-Contractual options available. | Critical | Tenant Admin | **Pass** (Playwright) | same | Detail + bulk toolbar |
| TC_111 | Approve Non-Contractual | Approve → Join Status = Approved; eligible for bidding. | Critical | Tenant Admin | **Pass** (Playwright) | same | Also `make seed-vendor-mobile` / `approve-vendor-join` for mobile fixtures |
| TC_112 | Approve Contractual | Approve Contractual → directly assignable. | Critical | Tenant Admin | **Pass** (Playwright) | same | Type set on approve; assignability checked via TC_115 picker |
| TC_113 | Reject with remarks | Reject requires remarks. | High | Tenant Admin | **Pass** (Playwright) | same | Toolbar Reject path (detail Reject overlay stacking — see RESULTS) |
| TC_114 | Resubmit after rejection | Rejected vendor can update and resubmit. | High | Mixed | **Pass** (Playwright + Maestro) | PW TC_113 + `tenants/06_tenant_resubmit_after_reject.yaml` | Seed: `make seed-vendor-approval-gaps`. **Passed Maestro 2026-07-22** |
| TC_115 | Non-Contractual no direct assign | Must go through bidding. | Critical | TDO | **Pass** (Playwright) | `run-vendor-tenant-approval.mjs` (TDO vendor-fleet) | Contractual picker lists contractual only; excludes `Vendor 2` |
| TC_116 | Contractual no bidding UI | Rate applied from backend; hidden on vendor app. | Critical | Vendor App | **Pass** (Maestro) | `tenants/07_bids_hidden_for_contractual.yaml` | Asserts *Bids aren't available for contractual tenants.* **Passed 2026-07-22** |
| TC_118 | Audit log | Approve/reject logged. | High | Tenant Admin | **Skip** | — | PDF Skip |

## How to run

### Playwright (TC_108–113, TC_115)

```bash
# nourish-backend — ADMIN_LOGIN_OTP_ENABLED=False
make seed-vendor-approval-pw RUN_ID=A7F22E01
make seed-vendor-approval-gaps   # contractual vendor for TC_115 picker

cd tests/e2e/playwright-mcp/vendor-tenant-approval-artifacts
RUN_ID=A7F22E01 E2E_ADMIN_EMAIL=admin@nourish.com \
  E2E_C_VENDOR_MARKER='Maestro Contractual Vendor' \
  E2E_NC_VENDOR_MARKER='Vendor 2' \
  node run-vendor-tenant-approval.mjs
```

### Maestro (TC_114, TC_116)

```bash
# nourish-backend
make seed-vendor-approval-gaps

# nourish-vendor-app — set CONTRACTUAL_* in .maestro/.env.local
cd ../nourish-vendor-app
set -a && source .maestro/.env.local && set +a
maestro --device emulator-5554 test \
  -e APP_ID="$APP_ID" \
  -e JOIN_VENDOR_EMAIL="$JOIN_VENDOR_EMAIL" \
  -e JOIN_VENDOR_PASSWORD="$JOIN_VENDOR_PASSWORD" \
  .maestro/flows/tenants/06_tenant_resubmit_after_reject.yaml

maestro --device emulator-5554 test \
  -e APP_ID="$APP_ID" \
  -e CONTRACTUAL_VENDOR_EMAIL="$CONTRACTUAL_VENDOR_EMAIL" \
  -e CONTRACTUAL_VENDOR_PASSWORD="$CONTRACTUAL_VENDOR_PASSWORD" \
  .maestro/flows/tenants/07_bids_hidden_for_contractual.yaml
```

## Still blocked / skipped

- **TC_118:** PDF Skip until audit surface is in scope.
