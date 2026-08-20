# Bid Publishing — TDO Admin (TC_126–TC_140)

**Scope:** Vendor Fleet TDO admin (Playwright).
**Source:** Phase01 admin extras.

| TC ID | Title | Scenario | Scope | Status | Automation | Notes |
|-------|-------|----------|-------|--------|------------|-------|
| TC_126 | View Vendor Fleet TOs | TDO sees Vendor Fleet TOs | TDO | **Pass** | Playwright bid-publishing | Pass |
| TC_127 | Multi-select TOs for bid | Select multiple TOs for publish | TDO | **Pass** | Playwright | Pass |
| TC_128 | NC Bidding form | Assign TO → Non-Contractual Bidding | TDO | **Pass** | Playwright | Pass |
| TC_129 | Bid Open Date rule | Bid open date rules (spec vs UI default) | TDO | **Partial** | Playwright | UI open optional; defaults now |
| TC_130 | Bid Close Date rules | Close required and after Open | TDO | **Pass** | Playwright | Pass |
| TC_131 | Reference budget optional | Reference budget optional numeric | TDO | **Pass** | Playwright | Pass |
| TC_132 | Locked auto fields | Vehicles/Type/Capacity locked on publish | TDO | **Pass** | Playwright | Pass |
| TC_133 | Publish bidding | Publish creates active bid | TDO | **Pass** | Playwright | Pass |
| TC_134 | Bid lists member TOs | Bid management lists member TOs | TDO | **Pass** | Playwright | Pass |
| TC_135 | Publish needs ≥1 TO | Publish with no TO blocked | TDO | **Pass** | Playwright | Pass |
| TC_136 | Same TR constraint | TOs from different TRs rejected | TDO | **Pass** | Playwright | Pass |
| TC_137 | Bid window min/max | 2h–7d window enforced | TDO | **Pass** | Playwright | Pass |
| TC_138 | Extend close date | Extend close; open immutable when OPEN | TDO | **Pass** | Playwright | Pass |
| TC_139 | No duplicate active bid | TO with active bid cannot join new session | TDO | **Pass** | Playwright | Pass |
| TC_140 | One vehicle per TO (publish) | required_vehicle_count max 1 per TO | TDO | **Pass** | Playwright | Pass |
