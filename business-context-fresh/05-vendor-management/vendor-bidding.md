---
source_document: PRD_DFMS_v1.0.md
source_sections: Vendor Bidding Portal, Bid Evaluation
extracted_date: 2026-02-13
---

## Vendor Bidding Portal

**Version 1.0, Phase 1**

**User Story:** _As a vendor, I want to view available transport bids and submit competitive rates so that I can win trips._

**Acceptance Criteria:**

*   Transport distribution officer (TDO) publishes bids with:
    *   Information like Route, Tonnage (weight expected to carry), urgency, required vehicle type, Bid submission window, required quantity of vehicles
*   Vendor can view:
    *   Active bids
    *   Active trips
    *   Completed Trips
*   Vendor submit structured bids with rate and vehicle availability
*   System records bid timestamp and rate validity

**Functional Requirements:**

*   \[Critical\] System SHALL provide support configurable bid submission windows.
*   \[Critical\] System SHALL allow eligible vendors to view the bidding list when bids are published.
*   \[High\] System SHALL prevent bid submission after window closure.
*   \[High\] Bids MAY be manually closed or cancelled without awarding.


## Bid Evaluation

**Version 1.0, Phase 1**

**User Story:** _As a Transport Distribution Officer, I want to evaluate vendor bids from non-contractual vendors and approve selected vendors._

**Acceptance Criteria:**

*   TDO can compare bids side-by-side including key parameter such as rate, vehicle availability, vehicle type, bid validity

**Functional Requirements:**

*   \[Critical\] System SHALL provide support winner against a single TO.
*   \[High\] System SHALL track bid winning log with user and timestamp.
