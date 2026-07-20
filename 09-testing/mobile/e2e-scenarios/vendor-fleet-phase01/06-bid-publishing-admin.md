# Bid Publishing (TDO / Admin)

**Module:** Vendor Management — Bid Publishing (Non-Contractual)  
**Scope:** Vendor Fleet TDO — **admin portal, not vendor mobile app**

| TC ID | Scenario | Test description | Priority | Scope | Maestro Status | Maestro Flow | PDF Notes |
|-------|----------|------------------|----------|-------|----------------|--------------|-----------|
| TC_119 | View Vendor Fleet TOs | TDO (Vendor Fleet) sees all Vendor Fleet TOs under Transport > TOs. | High | TDO | Manual | — | |
| TC_120 | Multi-select TOs | Select multiple TOs (TO-002, TO-003) for bid publishing. | High | TDO | Manual | — | |
| TC_121 | Non-Contractual Bidding form | Assign TO → Non-Contractual Bidding opens bid publishing form. | Critical | TDO | Manual | — | |
| TC_122 | Bid Open Date required | Blank Bid Open Date blocked. | Critical | TDO | Manual | — | |
| TC_123 | Bid Close Date rules | Close Date required and must be after Open Date. | Critical | TDO | Manual | — | |
| TC_124 | Reference Budget optional | Reference Budget optional; accepts numeric when provided. | Medium | TDO | Manual | — | |
| TC_125 | Auto-populated fields locked | Required Vehicles, Vehicle Type, Required Capacity auto-filled from TOs and non-editable. | Critical | TDO | Manual | — | |
| TC_126 | Publish bidding | Publish Bidding creates active/open bid in Bid Management. | Critical | TDO | Manual | — | |
| TC_127 | Bid lists both TOs | Published bid in Bid Management references TO-002 and TO-003. | High | TDO | Manual | — | |
| TC_128 | Visible to approved vendor | Published bid visible to approved Non-Contractual vendor in Vendor App > Bids. | Critical | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/bids/01_bids_list_search_and_filters.yaml` | Needs seeded open bid |
| TC_129 | Hidden from pending vendor | Unapproved/pending vendor cannot see published bid. | Critical | Vendor App | Not Started | — | Needs pending account |
| TC_130 | Contractual vendor excluded | Contractual vendor cannot see/participate in Non-Contractual bid. | High | Vendor App | Not Started | — | Needs contractual account |
| TC_131 | At least one TO required | Publishing bid with no TO selected is blocked. | High | TDO | Manual | — | |
| TC_132 | Audit log | Bid publishing logged with TDO ID, TO refs, bid window, timestamp. | Medium | TDO | Manual | — | Skip |
| TC_203 | Same TR constraint | Bid publishing rejected when selected TOs belong to different TRs. | Critical | TDO | Manual | — | |
| TC_205 | Bid window min/max | Close must be 2h–7d after Open; outside range blocked. | Critical | TDO | Manual | — | |
| TC_206 | Extend close date | Can extend Close Date after OPEN; cannot change Open Date after OPEN. | High | TDO | Manual | — | |
| TC_207 | Immutable when OPEN | Publish params immutable once OPEN; must cancel and republish. | High | TDO | Manual | — | |
| TC_208 | No duplicate active bid | TO with active bid cannot join new bid session. | Critical | TDO | Manual | — | |
| TC_209 | One vehicle per TO | required_vehicle_count max 1 per TO at publish. | High | TDO | Manual | — | |

## Vendor app prerequisite

Run TC_126–TC_128 in admin before vendor bid submission tests (TC_133+).
