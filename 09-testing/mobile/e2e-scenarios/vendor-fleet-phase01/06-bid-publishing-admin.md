# Bid Publishing (TDO / Admin)

**Module:** Vendor Management — Bid Publishing (Non-Contractual)  
**Scope:** Vendor Fleet TDO admin portal + vendor-app visibility asserts  
**Automation:** **Playwright** (TDO admin) + **Maestro** (vendor app).  
**Last run:** 2026-07-23 — Playwright `RUN_ID=B6D23A01`; Maestro on `emulator-5554`  
**Evidence:** `nourish-backend/tests/e2e/playwright-mcp/vendor-bid-publishing-artifacts/RESULTS.md`

| TC ID | Scenario | Test description | Priority | Scope | Maestro/Playwright Status | Runner / evidence | Notes |
|-------|----------|------------------|----------|-------|---------------------------|-------------------|-------|
| TC_119 | View Vendor Fleet TOs | TDO sees Vendor Fleet TOs. | High | TDO | **Pass** (Playwright) | `run-vendor-bid-publishing.mjs` | TO changelist shows Vendor Fleet TOs |
| TC_120 | Multi-select TOs | Select multiple TOs for bid publishing. | High | TDO | **Pass** (Playwright) | same | Assign TO / create-bid with 2 same-TR TOs |
| TC_121 | Non-Contractual Bidding form | Assign TO → Non-Contractual Bidding. | Critical | TDO | **Pass** (Playwright) | same | Bidding tab + publish form |
| TC_122 | Bid Open Date required | Blank Open Date blocked. | Critical | TDO | **Partial** (Playwright) | same | UI: Bid open **optional** (defaults to now); close required. Spec expected blank Open blocked |
| TC_123 | Bid Close Date rules | Close required and after Open. | Critical | TDO | **Pass** (Playwright) | same | UI blank-close + API close-before-open |
| TC_124 | Reference Budget optional | Optional numeric. | Medium | TDO | **Pass** (Playwright) | same | `#cb-reference-rate` optional numeric |
| TC_125 | Auto-populated fields locked | Vehicles/Type/Capacity locked. | Critical | TDO | **Pass** (Playwright) | same | 3 readonly fields |
| TC_126 | Publish bidding | Creates active bid. | Critical | TDO | **Pass** (Playwright) | same | Published `BID-20260723-ECSQ7FCA` |
| TC_127 | Bid lists both TOs | Bid Management references both TOs. | High | TDO | **Pass** (Playwright) | same | `TO-20260608-0001` + `TO-20260608-0002` |
| TC_128 | Visible to approved vendor | Bid visible in Vendor App > Bids. | Critical | Vendor App | **Pass** (Maestro) | `bids/01_bids_list_search_and_filters.yaml`, `bids/04_bid_details_submit_and_withdraw.yaml` | Open list + Bid details after publish. Use `VENDOR_PASSWORD=Abc@123456` for `vendor2@gmail.com` |
| TC_129 | Hidden from pending vendor | Pending vendor cannot see bid. | Critical | Vendor App | **Pass** (Maestro) | `tenants/08_pending_vendor_bids_hidden.yaml` | Pending join: no Bids tab / no opportunity search |
| TC_130 | Contractual vendor excluded | Contractual cannot join Non-Contractual bid. | High | Vendor App | **Pass** (Maestro) | `tenants/07_bids_hidden_for_contractual.yaml` | *Bids aren't available for contractual tenants.* |
| TC_131 | At least one TO required | Publish with no TO blocked. | High | TDO | **Pass** (Playwright) | `run-vendor-bid-publishing.mjs` | API 400 + UI “Select at least one…” |
| TC_132 | Audit log | Bid publish logged. | Medium | TDO | **Skip** | — | PDF Skip |
| TC_203 | Same TR constraint | TOs from different TRs rejected. | Critical | TDO | **Pass** (Playwright) | same | UI + API same-TR rule |
| TC_205 | Bid window min/max | 2h–7d window. | Critical | TDO | **Pass** (Playwright) | same | API rejects &lt;2h and &gt;7d |
| TC_206 | Extend close date | Extend Close; cannot change Open after OPEN. | High | TDO | **Pass** (Playwright) | same | Window PATCH extends close |
| TC_207 | Immutable when OPEN | Params immutable once OPEN. | High | TDO | **Pass** (Playwright) | same | `bid_open_at` change rejected when OPEN |
| TC_208 | No duplicate active bid | TO with active bid cannot join new session. | Critical | TDO | **Pass** (Playwright) | same | API 400 already-in-active-bid |
| TC_209 | One vehicle per TO | required_vehicle_count max 1 per TO. | High | TDO | **Pass** (Playwright) | same | Count = selected TO count (1 vehicle / TO) |

## How to run

### Playwright (TC_119–127, TC_131, TC_203–209)

```bash
# nourish-backend — ADMIN_LOGIN_OTP_ENABLED=False
make seed-vendor-bid-publishing-pw RUN_ID=B6D23A01

cd tests/e2e/playwright-mcp/vendor-bid-publishing-artifacts
RUN_ID=B6D23A01 \
  E2E_TDO_EMAIL=tdo.vendor.fleet1@nourish.com \
  E2E_TDO_PASSWORD='Nourish@1234!' \
  node run-vendor-bid-publishing.mjs
```

### Maestro (TC_128–130)

```bash
# nourish-backend
make seed-vendor-bid-publishing-pw RUN_ID=B6D23A01   # pending vendor + eligible TOs
make seed-vendor-approval-gaps                        # contractual vendor

# nourish-vendor-app
cd ../nourish-vendor-app
set -a && source .maestro/.env.local && set +a
# vendor2@gmail.com password in local DB is Abc@123456

maestro --device emulator-5554 test \
  -e APP_ID="$APP_ID" \
  -e VENDOR_EMAIL="$VENDOR_EMAIL" \
  -e VENDOR_PASSWORD=Abc@123456 \
  .maestro/flows/bids/01_bids_list_search_and_filters.yaml

maestro --device emulator-5554 test \
  -e APP_ID="$APP_ID" \
  -e PENDING_VENDOR_EMAIL=pending.bid@example.com \
  -e PENDING_VENDOR_PASSWORD=Test@1234 \
  .maestro/flows/tenants/08_pending_vendor_bids_hidden.yaml

maestro --device emulator-5554 test \
  -e APP_ID="$APP_ID" \
  -e CONTRACTUAL_VENDOR_EMAIL="$CONTRACTUAL_VENDOR_EMAIL" \
  -e CONTRACTUAL_VENDOR_PASSWORD="$CONTRACTUAL_VENDOR_PASSWORD" \
  .maestro/flows/tenants/07_bids_hidden_for_contractual.yaml
```

## Still blocked / skipped

- **TC_122:** needs UI to require Bid open (or spec update — blank open currently defaults to now).
- **TC_132:** PDF Skip until audit surface is in scope.

## Admin gate checklist (Wave B)

1. Log in as TDO Vendor Fleet (`tdo.vendor.fleet1@nourish.com`).
2. Create/select Vendor Fleet TOs (TC_075+).
3. Publish Non-Contractual bid (TC_126) — **done** `BID-20260723-ECSQ7FCA`.
4. Re-run Maestro `flows/bids` and update this file + `07-bids-vendor-app.md`.
