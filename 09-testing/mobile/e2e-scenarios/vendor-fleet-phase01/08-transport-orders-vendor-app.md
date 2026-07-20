# Transport Orders — Vendor App (Confirmation & Visibility)

**Module:** Vendor Management — Vendor Confirmation (Non-Contractual & Contractual)  
**Scope:** Vendor mobile app — **Maestro target**

| TC ID | Scenario | Test description | Priority | Scope | Maestro Status | Maestro Flow | PDF Notes |
|-------|----------|------------------|----------|-------|----------------|--------------|-----------|
| TC_143 | TDO view responded bids | TDO sees submitted bids with status Responded. | High | TDO | Manual | — | |
| TC_144 | Side-by-side comparison | TDO compares bids: rate, vehicles, type. | Critical | TDO | Manual | — | |
| TC_145 | Award any vendor | TDO can award to non-lowest bidder. | Critical | TDO | Manual | — | |
| TC_146 | Award both TOs to one vendor | Award TO-002 and TO-003 to same vendor in one action. | Critical | TDO | Manual | — | |
| TC_147 | Split awards | Award TO-002 to Vendor A, TO-003 to Vendor B. | High | TDO | Manual | — | |
| TC_148 | Status after award | TO status = Assigned; sub-state = Awaiting Vendor Confirmation. | Critical | TDO | Manual | — | |
| TC_149 | Award locked | Cannot re-award after selection. | Critical | TDO | Manual | — | |
| TC_150 | Only bidding vendors | Cannot award TO to vendor who didn't bid on it. | High | TDO | Manual | — | |
| TC_151 | Close bid without award | TDO can close open bid without awarding. | High | TDO | Manual | — | |
| TC_152 | Bid winning log | Award logged with TDO ID, vendor, TO, timestamp. | High | TDO | Manual | — | |
| TC_153 | Non-winner isolation | Non-winning vendor does not see awarded TO in TOs/Trips. | High | Vendor App | Not Started | — | Two vendor accounts |
| TC_154 | Winner sees awarded TOs | Winning vendor sees TO-002, TO-003 with Action Required, Status = Pending. | High | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/tos/01_tos_list_search_and_filters.yaml` | |
| TC_155 | Individual TO confirm | Each TO confirmed separately; no bulk confirm. | Medium | Vendor App | Not Started | — | |
| TC_156 | Vehicle Number required | Blank Vehicle Number blocked on confirmation. | Critical | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/tos/04_post_award_submission_validation.yaml` | |
| TC_157 | Driver Name required | Blank Driver Name blocked. | Critical | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/tos/04_post_award_submission_validation.yaml` | |
| TC_158 | Driver Contact required | Blank/invalid phone blocked. | Critical | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/tos/04_post_award_submission_validation.yaml` | |
| TC_159 | Optional NID/Helper | Driver NID/License and Helper optional. | Low | Vendor App | Not Started | — | |
| TC_160 | Vehicle Capacity captured | Vehicle Capacity stored on confirmation. | Medium | Vendor App | Not Started | — | |
| TC_161 | Status → Submitted | After confirmation, TO status = Submitted on vendor app. | Critical | Vendor App | Not Started | — | |
| TC_162 | No edit without reason | Cannot change driver/vehicle after confirm without reason/audit. | High | Vendor App | Not Started | — | |
| TC_163 | Audit log | Confirmation logged with Vendor ID, TO, details, timestamp. | Medium | Backend | Manual | — | Skip |
| TC_180 | Contractual vendor sees TO | Contractual vendor sees TO-004 with action prompt. | High | Vendor App | Not Started | — | Contractual seed |
| TC_181 | Contractual confirm fields | Driver + Vehicle mandatory; blank blocked, full succeeds → Submitted. | Critical | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/tos/04_post_award_submission_validation.yaml` | |
| TC_182 | Contractual status Submitted | TO-004 status = Submitted after confirmation. | Critical | Vendor App | Not Started | — | |
| TC_193 | Contract type isolation | Non-Contractual vendor cannot see Contractual vendor's TO and vice versa. | High | Vendor App | Not Started | — | Two accounts |
| TC_213 | Partial award confirm | Vendor awarded TO-002 only must confirm it individually; TO-003 not visible. | Critical | Vendor App | Not Started | — | Partial award seed |

## Related Maestro flows

| Flow | Covers |
|------|--------|
| `nourish-vendor-app/.maestro/flows/tos/01_tos_list_search_and_filters.yaml` | List, filters, search |
| `nourish-vendor-app/.maestro/flows/tos/02_tos_search_empty_state.yaml` | Search empty state |
| `nourish-vendor-app/.maestro/flows/tos/03_open_to_details_from_list.yaml` | List → details |
| `nourish-vendor-app/.maestro/flows/tos/04_post_award_submission_validation.yaml` | Driver/vehicle validation |

## Test data

- Awarded TO(s) in "Awaiting Vendor Confirmation" for `VENDOR_EMAIL`
