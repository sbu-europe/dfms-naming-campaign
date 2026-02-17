---
source_document: PRD_DFMS_v1.0.md
source_sections: Vendor Bidding Portal, Real-time TO Updates (Vendor Portal), Vendor Portal Access (Bidding & Trip Management)
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


## Real-time TO Updates (Vendor Portal)

**Version 1.0, Phase 1**

**User Story:** _As a Vendor, I want real-time updates on my transport orders so that I can manage execution effectively._

**Acceptance Criteria:**

*   Vendor portal shows TO status changes:
    *   Assigned
    *   Completed
    *   Closed

**Functional Requirements:**

*   \[Critical\] System SHALL provide real-time TO updates to vendor portal.
*   \[Critical\] Vendor SHALL not modify TO status directly.


## Vendor Portal Access (Bidding & Trip Management)

**Version 1.0, Phase 1**

**User Story:** _As a vendor, I want to view TO list for bidding so that I can participate in transport operations after approval._

**Acceptance Criteria:**

*   Vendor can view available bid
*   Vendor can track active and completed trips

**Functional Requirements:**

*   \[High\] Vendor SHALL be able to view active bids, assigned trips and completed trips Invoice Management & Claims Submission
*   \[High\] Vendor SHALL be able add driver and helper and vehicle details after winning bids
