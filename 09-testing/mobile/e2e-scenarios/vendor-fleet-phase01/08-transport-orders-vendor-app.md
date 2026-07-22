# Transport Orders — Vendor App (Confirmation & Visibility)

**Module:** Vendor Management — Vendor Confirmation  
**Scope:** Vendor mobile app + TDO award (Mixed)  
**Last Maestro run:** 2026-07-22 (emulator-5554, awarded TOs visible for `vendor2@gmail.com`)

| TC ID | Scenario | Test description | Priority | Scope | Maestro Status | Maestro Flow | PDF Notes |
|-------|----------|------------------|----------|-------|----------------|--------------|-----------|
| TC_143 | TDO view responded bids | TDO sees Responded bids. | High | TDO | Manual | — | |
| TC_144 | Side-by-side comparison | Compare rates/vehicles. | Critical | TDO | Manual | — | |
| TC_145 | Award any vendor | Award non-lowest OK. | Critical | TDO | Manual | — | |
| TC_146 | Award both TOs to one vendor | Award TO-002+003 together. | Critical | TDO | Manual | — | |
| TC_147 | Split awards | Different vendors per TO. | High | TDO | Manual | — | |
| TC_148 | Status after award | Assigned / Awaiting Vendor Confirmation. | Critical | TDO | Manual | — | Data present in local DB |
| TC_149 | Award locked | Cannot re-award. | Critical | TDO | Manual | — | |
| TC_150 | Only bidding vendors | Cannot award non-bidder. | High | TDO | Manual | — | |
| TC_151 | Close bid without award | Close open bid. | High | TDO | Manual | — | |
| TC_152 | Bid winning log | Award logged. | High | TDO | Manual | — | |
| TC_153 | Non-winner isolation | Non-winner does not see TO. | High | Vendor App | Not Started | — | |
| TC_154 | Winner sees awarded TOs | Action Required / Pending. | High | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/tos/01_tos_list_search_and_filters.yaml`, `tos/03_open_to_details_from_list.yaml` | List + TO details **Passed 2026-07-22** |
| TC_155 | Individual TO confirm | Each TO confirmed separately. | Medium | Vendor App | Not Started | — | |
| TC_156 | Vehicle Number required | Blank Vehicle Number blocked. | Critical | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/tos/04_post_award_submission_validation.yaml` | **Failed 2026-07-22** — could not tap Action-required TO reliably |
| TC_157 | Driver Name required | Blank Driver Name blocked. | Critical | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/tos/04_post_award_submission_validation.yaml` | Same as TC_156 |
| TC_158 | Driver Contact required | Blank/invalid phone blocked. | Critical | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/tos/04_post_award_submission_validation.yaml` | Same as TC_156 |
| TC_159 | Optional NID/Helper | Optional fields. | Low | Vendor App | Not Started | — | |
| TC_160 | Vehicle Capacity captured | Capacity stored. | Medium | Vendor App | Not Started | — | |
| TC_161 | Status → Submitted | After confirm, Submitted. | Critical | Vendor App | Not Started | — | |
| TC_162 | No edit without reason | Post-confirm edit needs reason. | High | Vendor App | Not Started | — | |
| TC_163 | Audit log | Confirmation logged. | Medium | Backend | Manual | — | Skip |
| TC_180 | Contractual vendor sees TO | TO-004 action prompt. | High | Vendor App | Not Started | — | |
| TC_181 | Contractual confirm fields | Driver+Vehicle mandatory. | Critical | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/tos/04_post_award_submission_validation.yaml` | |
| TC_182 | Contractual status Submitted | Status Submitted. | Critical | Vendor App | Not Started | — | |
| TC_193 | Contract type isolation | Cross-type TO not visible. | High | Vendor App | Not Started | — | |
| TC_213 | Partial award confirm | Only awarded TO confirmable. | Critical | Vendor App | Not Started | — | |

## Related Maestro flows

| Flow | Result 2026-07-22 |
|------|-------------------|
| `tos/01_tos_list_search_and_filters.yaml` | **Passed** |
| `tos/02_tos_search_empty_state.yaml` | **Passed** |
| `tos/03_open_to_details_from_list.yaml` | **Passed** |
| `tos/04_post_award_submission_validation.yaml` | **Failed** — Action-required TO tap / validation assert |
