# Bids, Award & Won Section (TC_083–TC_116)

**Source:** DFMS UAT — Published Bids through Won Bid Section.
**Gap focus:** Won section (TC_102, TC_111–116) and bid-update-while-open (TC_097).

| TC ID | Title | Scenario | Scope | Status | Automation | Notes |
|-------|-------|----------|-------|--------|------------|-------|
| TC_083 | Bid visible approved | Approved NC vendor sees published bid | Vendor App | **Covered** | `bids/01_…` | Passed |
| TC_084 | Bid hidden pending | Pending vendor cannot see bids | Vendor App | **Covered** | `tenants/08_…` | Passed |
| TC_085 | Bid hidden contractual | Contractual vendor no NC bids | Vendor App | **Covered** | `tenants/07_…` | Passed |
| TC_086 | Multi-TO single bid entry | Two TOs published → one bid entry | Vendor App | **Partial** | `bids/03_…` | Needs multi-TO fixture |
| TC_087 | Bidding window display | Bids tab shows open/close window status | Vendor App | **Partial** | `bids/01_…` | List filters; window copy assert weak |
| TC_088 | Bid details content | Bid Details: TO, route, products, vehicle reqs | Vendor App | **Partial** | `bids/03_…` | Opens details; full fields flaky |
| TC_089 | Both TOs in bid | Bid with 2 TOs shows both | Vendor App | **Partial** | `bids/03_…` | Needs multi-TO seed |
| TC_090 | Per-TO independent details | Each TO shows own details | Vendor App | **Not Started** | — | New depth from UAT |
| TC_091 | Per-TO source/dest | Source/Destination per TO | Vendor App | **Not Started** | — | New from UAT |
| TC_092 | Per-TO schedule | Independent planned schedule per TO | Vendor App | **Not Started** | — | New from UAT |
| TC_093 | Per-TO vehicle reqs | Vehicle requirements per TO not aggregate | Vendor App | **Not Started** | — | New from UAT |
| TC_094 | Bid both TOs | Bid on both TOs in one submit | Vendor App | **Pass** | Playwright + Maestro partial | Pass (API); Maestro optional |
| TC_095 | Bid single TO | Bid one TO leave other unbid | Vendor App | **Pass** | Playwright + Maestro | Pass |
| TC_096 | Bid remaining later | Return later to bid remaining TO | Vendor App | **Not Started** | — | New from UAT |
| TC_097 | Update bid while open | Update submitted bid while window open | Vendor App | **Not Started** | — | UAT allows edit; older Phase01 said lock — follow UAT |
| TC_098 | Closed window blocked | Cannot bid/update after close | Mixed | **Pass** | Playwright + `bids/07_…` | Pass (API); Maestro graceful skip |
| TC_099 | Bid amount validation | Amount mandatory; reject 0/neg/non-numeric | Vendor App | **Partial** | `bids/05_…` | Blank covered; zero/neg flaky in hierarchy |
| TC_100 | Update visible to TDO | Bid update reflected in TDO comparison | TDO | **Not Started** | — | New from UAT |
| TC_101 | Bid price privacy | Other vendor bid amount never visible | Vendor App | **Pass** | Playwright | Pass |
| TC_102 | Won under Bids | Awarded TO shown as Won under Bids | Vendor App | **Not Started** | — | Won section — new UAT module |
| TC_103 | Sibling TO still open | Other TOs in bid remain open after partial award | Vendor App | **Partial** | Playwright partial award | API proven; mobile weak |
| TC_104 | Won TO on TOs tab | Winning TO appears under TOs | Vendor App | **Covered** | `tos/01_…` | Passed |
| TC_105 | Won TO Action Required | Won TO initial status Action Required | Vendor App | **Covered** | `tos/03_…` | Passed |
| TC_106 | Won same downstream | Won TO same lifecycle as contractual | Vendor App | **Partial** | Playwright + trips | High-level Pass; full yard Skip |
| TC_107 | Non-winner isolation | Non-winner does not see TO | Vendor App | **Pass** | Playwright | Pass |
| TC_108 | Bid after winning one | Continue bidding other open TOs after win | Vendor App | **Not Started** | — | New from UAT |
| TC_109 | Winning amount read-only | Winning bid amount read-only post-award | Vendor App | **Not Started** | — | New from UAT |
| TC_110 | Win both independent | Win both TOs → independent progress | Vendor App | **Partial** | Playwright | API/admin covered; mobile Won weak |
| TC_111 | Won section access | Access Won section under Bids | Vendor App | **Not Started** | — | New UAT module |
| TC_112 | Won list + status | Won lists awarded TOs with status | Vendor App | **Not Started** | — | New from UAT |
| TC_113 | Bid while managing Won | Bid open TOs while managing Won | Vendor App | **Not Started** | — | New from UAT |
| TC_114 | Won independent metadata | Each Won TO independent status/bid/driver info | Vendor App | **Not Started** | — | New from UAT |
| TC_115 | Second award independent | Later award independent of prior Won TO | Vendor App | **Not Started** | — | New from UAT |
| TC_116 | Won realtime status | Won section realtime status updates | Vendor App | **Not Started** | — | New from UAT |
