# Bids — Vendor App (View, Submit, Visibility)

**Module:** Vendor Management — Vendor Bid Submission (Non-Contractual)  
**Scope:** Vendor mobile app — **Maestro target**  
**Last Maestro run:** 2026-07-22 (emulator-5554, backend up; extended `BID-20260707-JON84YZR` close date)

| TC ID | Scenario | Test description | Priority | Scope | Maestro Status | Maestro Flow | PDF Notes |
|-------|----------|------------------|----------|-------|----------------|--------------|-----------|
| TC_133 | Open bid & view TOs | Vendor opens published bid; sees TOs. | High | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/bids/03_open_bid_details_from_list.yaml` | **Failed 2026-07-22** — list has data; Open-filter + tile tap did not reach Bid details (04 passed with same data) |
| TC_134 | Partial bid (single TO) | Bid on one TO only. | High | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/bids/04_bid_details_submit_and_withdraw.yaml` | Submit flow **Passed**; partial-TO-only not isolated |
| TC_135 | Bid on all TOs | Bid both TOs together. | Critical | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/bids/04_bid_details_submit_and_withdraw.yaml` | **Passed 2026-07-22** — submit on open opportunity |
| TC_136 | Bid price required | Blank price blocked. | Critical | Vendor App | Not Started | — | |
| TC_137 | Invalid bid price | Zero/negative/non-numeric rejected. | High | Vendor App | Not Started | — | |
| TC_138 | No edit after submit | Bid locked post-submission. | Critical | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/bids/04_bid_details_submit_and_withdraw.yaml` | Submit covered; withdraw/assert lock not fully verified |
| TC_139 | Closed bid window | After Close Date blocked. | Critical | Vendor App | Not Started | — | |
| TC_140 | No duplicate bid | Same vendor cannot bid twice. | High | Vendor App | Not Started | — | |
| TC_141 | Multiple vendors | Two vendors bid independently. | Critical | Mixed | Manual | — | |
| TC_142 | Audit log | Bid submission logged. | Medium | Backend | Manual | — | Skip |
| TC_192 | Bid price privacy | Vendor B cannot see Vendor A price. | Critical | Vendor App | Not Started | — | |
| TC_204 | Bid management navigation | TDO bid list → detail → evaluation. | High | TDO | Manual | — | |
| TC_210 | One vehicle per TO offer | Max 1 vehicle per TO. | High | Vendor App | Not Started | — | |
| TC_211 | PARTIALLY_AWARDED | Session status after partial award. | Critical | TDO | Manual | — | |
| TC_212 | Reject all bids for TO | Reject with reason. | High | TDO | Manual | — | |

## Related Maestro flows

| Flow | Result 2026-07-22 |
|------|-------------------|
| `bids/01_bids_list_search_and_filters.yaml` | **Passed** |
| `bids/02_bids_search_filters_list.yaml` | **Passed** |
| `bids/03_open_bid_details_from_list.yaml` | **Failed** — Bid details screen not reached |
| `bids/04_bid_details_submit_and_withdraw.yaml` | **Passed** |

## Data note

All bid sessions had past close dates in DB; extended `BID-20260707-JON84YZR` `bid_close_at` +14 days so mobile list shows opportunities. Re-run `make seed-vendor-dev` does not create bids — extend or publish via TDO when dates lapse.
