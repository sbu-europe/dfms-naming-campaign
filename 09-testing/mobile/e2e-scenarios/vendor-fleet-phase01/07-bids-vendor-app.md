# Bids — Vendor App (View, Submit, Visibility)

**Module:** Vendor Management — Vendor Bid Submission (Non-Contractual)  
**Scope:** Vendor mobile app — **Maestro target**  
**Last Maestro run:** 2026-07-21 evening full suite (no open bid seeded — list only)

| TC ID | Scenario | Test description | Priority | Scope | Maestro Status | Maestro Flow | PDF Notes |
|-------|----------|------------------|----------|-------|----------------|--------------|-----------|
| TC_133 | Open bid & view TOs | Vendor opens published bid; sees TOs. | High | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/bids/03_open_bid_details_from_list.yaml` | Failed without open bid; list OK via `01` |
| TC_134 | Partial bid (single TO) | Bid on one TO only. | High | Vendor App | Not Started | — | Needs published bid |
| TC_135 | Bid on all TOs | Bid both TOs together. | Critical | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/bids/04_bid_details_submit_and_withdraw.yaml` | Failed 2026-07-21 — no open opportunity |
| TC_136 | Bid price required | Blank price blocked. | Critical | Vendor App | Not Started | — | |
| TC_137 | Invalid bid price | Zero/negative/non-numeric rejected. | High | Vendor App | Not Started | — | |
| TC_138 | No edit after submit | Bid locked post-submission. | Critical | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/bids/04_bid_details_submit_and_withdraw.yaml` | |
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

| Flow | Result 2026-07-21 evening |
|------|---------------------------|
| `bids/01_bids_list_search_and_filters.yaml` | **Passed** |
| `bids/02_bids_search_filters_list.yaml` | **Failed** — `No opportunities found` not visible |
| `bids/03_open_bid_details_from_list.yaml` | **Failed** — no bid tile / Bid details (admin: publish bid) |
| `bids/04_bid_details_submit_and_withdraw.yaml` | **Failed** — Bid details not visible (admin: publish bid) |

## Blocker

Admin must complete TC_126 (publish bid) before TC_133–140 can move to Covered.
