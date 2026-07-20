# Bids — Vendor App (View, Submit, Visibility)

**Module:** Vendor Management — Vendor Bid Submission (Non-Contractual)  
**Scope:** Vendor mobile app — **Maestro target**

| TC ID | Scenario | Test description | Priority | Scope | Maestro Status | Maestro Flow | PDF Notes |
|-------|----------|------------------|----------|-------|----------------|--------------|-----------|
| TC_133 | Open bid & view TOs | Vendor opens published bid; sees TO-002 and TO-003 with route/tonnage/vehicle/bid window. | High | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/bids/03_open_bid_details_from_list.yaml` | |
| TC_134 | Partial bid (single TO) | Bid on TO-002 only; TO-003 remains open. | High | Vendor App | Not Started | — | |
| TC_135 | Bid on all TOs | Select both TOs, enter price each, submit together. | Critical | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/bids/04_bid_details_submit_and_withdraw.yaml` | |
| TC_136 | Bid price required | Blank bid price blocked per TO. | Critical | Vendor App | Not Started | — | |
| TC_137 | Invalid bid price | Zero, negative, non-numeric rejected. | High | Vendor App | Not Started | — | |
| TC_138 | No edit after submit | Bid locked post-submission; timestamp stored. | Critical | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/bids/04_bid_details_submit_and_withdraw.yaml` | Withdraw flow exists |
| TC_139 | Closed bid window | Submission after Bid Close Date blocked. | Critical | Vendor App | Not Started | — | Needs time-based seed |
| TC_140 | No duplicate bid | Same vendor cannot submit twice for same TO. | High | Vendor App | Not Started | — | |
| TC_141 | Multiple vendors | Different vendors can bid on same TOs independently. | Critical | Mixed | Manual | — | Two vendor accounts |
| TC_142 | Audit log | Bid submission logged with vendor ID, TO ref, price, timestamp. | Medium | Backend | Manual | — | Skip |
| TC_192 | Bid price privacy | Vendor B cannot see Vendor A's bid price. | Critical | Vendor App | Not Started | — | Two vendor accounts |
| TC_204 | Bid management navigation | TDO bid list → detail → evaluation screen (admin). | High | TDO | Manual | — | |
| TC_210 | One vehicle per TO offer | Max 1 vehicle per TO; offering 2 for one TO rejected. | High | Vendor App | Not Started | — | |
| TC_211 | PARTIALLY_AWARDED | Award some TOs in session → status PARTIALLY_AWARDED; others remain open. | Critical | TDO | Manual | — | |
| TC_212 | Reject all bids for TO | Reject all bids for one TO with mandatory reason; session continues for other TOs. | High | TDO | Manual | — | |

## Related Maestro flows

| Flow | Covers |
|------|--------|
| `nourish-vendor-app/.maestro/flows/bids/01_bids_list_search_and_filters.yaml` | List, filters, search |
| `nourish-vendor-app/.maestro/flows/bids/02_bids_search_filters_list.yaml` | Search/filters variant |
| `nourish-vendor-app/.maestro/flows/bids/03_open_bid_details_from_list.yaml` | List → details |
| `nourish-vendor-app/.maestro/flows/bids/04_bid_details_submit_and_withdraw.yaml` | Submit / withdraw |

## Test data

- Open bid with TO-002, TO-003 published by TDO
- Approved Non-Contractual vendor (`VENDOR_EMAIL`)
