# Transport Orders — Vendor App (Confirmation & Visibility)

**Module:** Vendor Management — Vendor Confirmation  
**Scope:** Vendor mobile app (**Maestro**) + TDO award / API (**Playwright**)  
**Automation:** **Maestro** + **Playwright**  
**Last run:** 2026-07-24 — Playwright `RUN_ID=C8T23D01`; Maestro on `emulator-5554`  
**Evidence:** `nourish-backend/tests/e2e/playwright-mcp/vendor-tos-artifacts/RESULTS.md`

| TC ID | Scenario | Test description | Priority | Scope | Maestro/Playwright Status | Runner / evidence | Notes |
|-------|----------|------------------|----------|-------|---------------------------|-------------------|-------|
| TC_069 | TDO view responded bids | TDO sees Responded bids. | High | TDO | **Pass** (Playwright) | `run-vendor-tos.mjs` | Bids Management detail + `/bids/` API |
| TC_070 | Side-by-side comparison | Compare rates/vehicles. | Critical | TDO | **Pass** (Playwright) | same | Multi-vendor costs / min-avg-max |
| TC_071 | Award any vendor | Award non-lowest OK. | Critical | TDO | **Pass** (Playwright) | same | Awarded higher-cost vendor A over B |
| TC_072 | Award both TOs to one vendor | Award TO-002+003 together. | Critical | TDO | **Pass** (Playwright) | same | Both members → vendor A; session `awarded` |
| TC_073 | Split awards | Different vendors per TO. | High | TDO | **Pass** (Playwright) | same | Split session: A + B |
| TC_074 | Status after award | Assigned / Awaiting Vendor Confirmation. | Critical | TDO | **Pass** (Playwright) | same | Winner TO list shows assigned TO |
| TC_075 | Award locked | Cannot re-award. | Critical | TDO | **Pass** (Playwright) | same | Re-award blocked |
| TC_076 | Only bidding vendors | Cannot award non-bidder. | High | TDO | **Pass** (Playwright) | same | Unknown `bid_id` rejected |
| TC_077 | Close bid without award | Close open bid. | High | TDO | **Pass** (Playwright) | same | `POST …/bidding-sessions/{id}/cancel/` |
| TC_078 | Bid winning log | Award logged. | High | TDO | **Skip** | — | PDF Skip |
| TC_079 | Non-winner isolation | Non-winner does not see TO. | High | Vendor App | **Pass** (Playwright) | same | Vendor B list omits winner TO |
| TC_080 | Winner sees awarded TOs | Action Required / Pending. | High | Vendor App | **Pass** (Maestro) | `tos/01`, `tos/03` | List filters + open TO details |
| TC_081 | Individual TO confirm | Each TO confirmed separately. | Medium | Vendor App | **Pass** (Playwright) | `run-vendor-tos.mjs` | Per-TO `vehicle-driver` POST |
| TC_082 | Vehicle Number required | Blank Vehicle Number blocked. | Critical | Vendor App | **Pass** (Maestro) | `tos/04_post_award_submission_validation.yaml` | Empty submit shows required errors |
| TC_083 | Driver Name required | Blank Driver Name blocked. | Critical | Vendor App | **Pass** (Maestro) | same | Covered by empty-submit assert |
| TC_084 | Driver Contact required | Blank/invalid phone blocked. | Critical | Vendor App | **Pass** (Maestro) | same | Covered by empty-submit assert |
| TC_085 | Optional NID/Helper | Optional fields. | Low | Vendor App | **Pass** (Playwright) | `run-vendor-tos.mjs` | Confirm without NID/helpers |
| TC_086 | Vehicle Capacity captured | Capacity stored. | Medium | Vendor App | **Pass** (Playwright) | same | `vehicle_capacity` accepted |
| TC_087 | Status → Submitted | After confirm, Submitted. | Critical | Vendor App | **Pass** (Playwright) | same | Confirm 201 → execution confirmed |
| TC_088 | No edit without reason | Post-confirm edit needs reason. | High | Vendor App | **Pass** (Playwright) | same | PATCH requires `reason`; with reason 200 |
| TC_089 | Audit log | Confirmation logged. | Medium | Backend | **Skip** | — | PDF Skip |
| TC_106 | Contractual vendor sees TO | TO-004 action prompt. | High | Vendor App | **Pass** (Playwright) | same | `contractual.test@example.com` list |
| TC_107 | Contractual confirm fields | Driver+Vehicle mandatory. | Critical | Vendor App | **Pass** (Maestro) | `tos/04` | Same post-award form validation |
| TC_108 | Contractual status Submitted | Status Submitted. | Critical | Vendor App | **Pass** (Playwright) | same | Contractual confirm 201 |
| TC_119 | Contract type isolation | Cross-type TO not visible. | High | Vendor App | **Pass** (Playwright) | same | Contractual ↔ bidding lists isolated |
| TC_139 | Partial award confirm | Only awarded TO confirmable. | Critical | Vendor App | **Pass** (Playwright) | same | Confirm on pending member blocked (422) |

## Related Maestro flows (2026-07-24)

| Flow | Result |
|------|--------|
| `tos/01_tos_list_search_and_filters.yaml` | **Passed** |
| `tos/02_tos_search_empty_state.yaml` | **Passed** |
| `tos/03_open_to_details_from_list.yaml` | **Passed** |
| `tos/04_post_award_submission_validation.yaml` | **Passed** — uses `MAESTRO_TO_NUMBER` env var if set; falls back to first list item. Updated 2026-08-19. |

## How to run

### Seed

```bash
# nourish-backend
make seed-vendor-tos-pw RUN_ID=C8T23D01
# Publishes multi-TO award + split + cancel bids; keeps Maestro Action-required TO;
# assigns contractual TO for contractual.test@example.com
```

### Playwright (TDO award + vendor API)

```bash
cd tests/e2e/playwright-mcp/vendor-tos-artifacts
# needs playwright (symlink node_modules from vendor-bids-artifacts if needed)
RUN_ID=C8T23D01 node run-vendor-tos.mjs
```

### Maestro (vendor app)

```bash
cd ../nourish-vendor-app
set -a && source .maestro/.env.local && set +a
# vendor2 password in DB: Abc@123456

maestro --device emulator-5554 test \
  -e APP_ID="$APP_ID" -e VENDOR_EMAIL="$VENDOR_EMAIL" -e VENDOR_PASSWORD="$VENDOR_PASSWORD" \
  -e MAESTRO_TO_NUMBER=TO-20260608-0001 \
  .maestro/flows/tos/01_tos_list_search_and_filters.yaml \
  .maestro/flows/tos/02_tos_search_empty_state.yaml \
  .maestro/flows/tos/03_open_to_details_from_list.yaml \
  .maestro/flows/tos/04_post_award_submission_validation.yaml
```

## Still blocked / skipped

- **TC_078 / TC_089:** PDF Skip (audit).
- **Maestro MCP `run`:** may fail with “Unable to launch app” on this emulator; CLI `maestro --device emulator-5554 test …` works.
- **`tos/04` TO tap:** Flow uses `MAESTRO_TO_NUMBER` env var for targeted search (from `make seed-vendor-tos-pw` manifest). Without it, falls back to tapping the first list item. Set via `.maestro/.env.local` or `--env MAESTRO_TO_NUMBER=TO-…` on the CLI.

## Data note

`make seed-vendor-tos-pw` resets six vendor TOs (clears `BidAwardAllocation` / execution confirmations), publishes two multi-TO OPEN bids + one cancel target, keeps `TO-20260608-0001` Action-required for Maestro, and direct-assigns a contractual TO. Re-seed before each Playwright run.
