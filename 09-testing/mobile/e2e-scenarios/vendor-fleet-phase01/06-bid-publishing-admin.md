# Bid Publishing (TDO / Admin)

**Module:** Vendor Management — Bid Publishing (Non-Contractual)  
**Scope:** Vendor Fleet TDO — **admin portal**  
**Status policy:** Admin rows **Manual**. Vendor visibility rows need published bid fixture.

| TC ID | Scenario | Test description | Priority | Scope | Maestro Status | Maestro Flow | PDF Notes |
|-------|----------|------------------|----------|-------|----------------|--------------|-----------|
| TC_119 | View Vendor Fleet TOs | TDO sees Vendor Fleet TOs. | High | TDO | Manual | — | Admin portal |
| TC_120 | Multi-select TOs | Select multiple TOs for bid publishing. | High | TDO | Manual | — | |
| TC_121 | Non-Contractual Bidding form | Assign TO → Non-Contractual Bidding. | Critical | TDO | Manual | — | |
| TC_122 | Bid Open Date required | Blank Open Date blocked. | Critical | TDO | Manual | — | |
| TC_123 | Bid Close Date rules | Close required and after Open. | Critical | TDO | Manual | — | |
| TC_124 | Reference Budget optional | Optional numeric. | Medium | TDO | Manual | — | |
| TC_125 | Auto-populated fields locked | Vehicles/Type/Capacity locked. | Critical | TDO | Manual | — | |
| TC_126 | Publish bidding | Creates active bid. | Critical | TDO | Manual | — | **Admin gate for Wave B** |
| TC_127 | Bid lists both TOs | Bid Management references TO-002/003. | High | TDO | Manual | — | |
| TC_128 | Visible to approved vendor | Bid visible in Vendor App > Bids. | Critical | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/bids/01_bids_list_search_and_filters.yaml`, `bids/04_bid_details_submit_and_withdraw.yaml` | List + submit **Passed 2026-07-22** after extending bid close date |
| TC_129 | Hidden from pending vendor | Pending vendor cannot see bid. | Critical | Vendor App | Not Started | — | |
| TC_130 | Contractual vendor excluded | Contractual cannot join Non-Contractual bid. | High | Vendor App | Not Started | — | |
| TC_131 | At least one TO required | Publish with no TO blocked. | High | TDO | Manual | — | |
| TC_132 | Audit log | Bid publish logged. | Medium | TDO | Manual | — | Skip |
| TC_203 | Same TR constraint | TOs from different TRs rejected. | Critical | TDO | Manual | — | |
| TC_205 | Bid window min/max | 2h–7d window. | Critical | TDO | Manual | — | |
| TC_206 | Extend close date | Extend Close; cannot change Open after OPEN. | High | TDO | Manual | — | |
| TC_207 | Immutable when OPEN | Params immutable once OPEN. | High | TDO | Manual | — | |
| TC_208 | No duplicate active bid | TO with active bid cannot join new session. | Critical | TDO | Manual | — | |
| TC_209 | One vehicle per TO | required_vehicle_count max 1. | High | TDO | Manual | — | |

## Admin gate checklist (Wave B)

1. Log in as TDO Vendor Fleet (`tdo.vendor.fleet1.nourish@…` after `make seed`).
2. Create/select Vendor Fleet TOs (TC_075+).
3. Publish Non-Contractual bid (TC_126).
4. Re-run Maestro `flows/bids` and update this file + `07-bids-vendor-app.md`.
