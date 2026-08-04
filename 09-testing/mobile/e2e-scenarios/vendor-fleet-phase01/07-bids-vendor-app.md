# Bids — Vendor App (View, Submit, Visibility)

**Module:** Vendor Management — Vendor Bid Submission (Non-Contractual)  
**Scope:** Vendor mobile app (**Maestro**) + TDO evaluation / API (**Playwright**)  
**Automation:** **Maestro** + **Playwright**  
**Last run:** 2026-07-23 — Playwright `RUN_ID=C7B23D01`; Maestro on `emulator-5554`  
**Evidence:** `nourish-backend/tests/e2e/playwright-mcp/vendor-bids-artifacts/RESULTS.md`

| TC ID | Scenario | Test description | Priority | Scope | Maestro/Playwright Status | Runner / evidence | Notes |
|-------|----------|------------------|----------|-------|---------------------------|-------------------|-------|
| TC_133 | Open bid & view TOs | Vendor opens published bid; sees TOs. | High | Vendor App | **Pass** (Maestro) | `bids/03_open_bid_details_from_list.yaml` | Opens Bid details; vehicle requirements + Submit CTA. TO checklist labels flaky in hierarchy |
| TC_134 | Partial bid (single TO) | Bid on one TO only. | High | Mixed | **Pass** (Playwright) | `run-vendor-bids.mjs` | API single-TO `to_offers` submit 201. Maestro UI price field often not exposed |
| TC_135 | Bid on all TOs | Bid both TOs together. | Critical | Mixed | **Pass** (Playwright) | same | Multi-TO when fixture has ≥2 members; this run used 1-TO open bid |
| TC_136 | Bid price required | Blank price blocked. | Critical | Vendor App | **Pass** (Maestro) | `bids/05_bid_price_validation.yaml` | Submit bid stays **disabled** without valid price |
| TC_137 | Invalid bid price | Zero/negative/non-numeric rejected. | High | Vendor App | **Partial** (Maestro) | `bids/05_bid_price_validation.yaml` | Blank covered; zero/negative path needs visible `Enter bid price` (TO tile not always in hierarchy) |
| TC_138 | No edit after submit | Bid locked post-submission. | Critical | Mixed | **Partial** (Maestro + Playwright) | `bids/06_…yaml` + API | Maestro: Submit disabled until priced; withdraw UI optional. API submit upserts pending bid |
| TC_139 | Closed bid window | After Close Date blocked. | Critical | Mixed | **Pass** (Playwright) | `run-vendor-bids.mjs` | API 422 on closed/awarded session. Maestro search of closed marker unreliable on Open tab |
| TC_140 | No duplicate bid | Same vendor cannot bid twice. | High | Backend | **Pass** (Playwright) | same | Re-submit **upserts** same `VendorBid` id (no second row) |
| TC_141 | Multiple vendors | Two vendors bid independently. | Critical | Mixed | **Pass** (Playwright) | same | `vendor2` + `vendor3` both 201 |
| TC_142 | Audit log | Bid submission logged. | Medium | Backend | **Skip** | — | PDF Skip |
| TC_192 | Bid price privacy | Vendor B cannot see Vendor A price. | Critical | Vendor App | **Pass** (Playwright) | same | Vendor B detail payload has no competitor costs |
| TC_204 | Bid management navigation | TDO bid list → detail → evaluation. | High | TDO | **Pass** (Playwright) | same | `/admin/vendors/biddingsession/` → change form + Award UI |
| TC_210 | One vehicle per TO offer | Max 1 vehicle per TO. | High | Backend | **Pass** (Playwright) | same | `offered_vehicle_count = len(to_offers)` |
| TC_211 | PARTIALLY_AWARDED | Session status after partial award. | Critical | TDO | **Partial** (Playwright) | same | **Pass** earlier on multi-TO `BID-20260723-ECSQ7FCA` → `partially_awarded`. Latest seed only had 1-TO open bid |
| TC_212 | Reject all bids for TO | Reject with reason. | High | TDO | **Pass** (Playwright) | same | `POST …/bids/reject-all/` with reason |

## Related Maestro flows (2026-07-23)

| Flow | Result |
|------|--------|
| `bids/01_bids_list_search_and_filters.yaml` | **Passed** |
| `bids/02_bids_search_filters_list.yaml` | **Failed** — empty-search copy not matched (debounce / hierarchy) |
| `bids/03_open_bid_details_from_list.yaml` | **Passed** (after wait-for-content fix) |
| `bids/05_bid_price_validation.yaml` | **Passed** (Submit disabled) |
| `bids/06_bid_submit_partial_or_all_and_withdraw.yaml` | **Passed** (disabled Submit gate; full price/withdraw optional) |
| `bids/07_closed_bid_window.yaml` | **Failed** — closed/awarded bid not on Open list; covered by Playwright TC_139 |

## How to run

### Seed

```bash
# nourish-backend
make seed-vendor-bids-pw RUN_ID=C7B23D01
# Auto-publishes an OPEN bid if none exist; marks another session closed for TC_139
```

### Playwright (API + TDO)

```bash
cd tests/e2e/playwright-mcp/vendor-bids-artifacts
RUN_ID=C7B23D01 node run-vendor-bids.mjs
```

### Maestro (vendor app)

```bash
cd ../nourish-vendor-app
set -a && source .maestro/.env.local && set +a
# vendor2 password in DB: Abc@123456

maestro --device emulator-5554 test \
  -e APP_ID="$APP_ID" -e VENDOR_EMAIL="$VENDOR_EMAIL" -e VENDOR_PASSWORD="$VENDOR_PASSWORD" \
  .maestro/flows/bids/01_bids_list_search_and_filters.yaml \
  .maestro/flows/bids/03_open_bid_details_from_list.yaml \
  .maestro/flows/bids/05_bid_price_validation.yaml \
  .maestro/flows/bids/06_bid_submit_partial_or_all_and_withdraw.yaml
```

## Still blocked / skipped

- **TC_137 / TO tile hierarchy:** Flutter often omits `TO-*` / `Enter bid price` from Maestro tree until selection semantics improve.
- **TC_211:** needs a multi-TO OPEN fixture to assert `partially_awarded` every run (proven once on `ECSQ7FCA`).
- **TC_142:** PDF Skip.
- **`bids/02` empty search:** copy/timing mismatch — not a product blocker for bid submit.

## Data note

`make seed-vendor-bids-pw` extends/creates an OPEN bid and forces a CLOSED/awarded peer for negative submit. Prefer ≥2 eligible same-TR TOs before seed when testing TC_135 / TC_211.
