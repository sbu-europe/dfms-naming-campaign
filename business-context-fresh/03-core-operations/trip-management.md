---
source_document: PRD_DFMS_v1.0.md
source_sections: Trip Closure & Proof of Delivery (POD), Trip Costing, Vendor Trip Cost & Billing & Claims Management, Trip Management (Trip Assignment & Navigation), Vendor Portal Access (Bidding & Trip Management), Trip Management & Tracking, GPS Tracking & Basic Trip Costing
extracted_date: 2026-02-13
---

## Trip Closure & Proof of Delivery (POD)

**Version 1.0, Phase 1**

**User Story:** _As a Transport Planner, I want trips to close automatically once delivery and QC are completed._

**Acceptance Criteria:**

*   Unloading Personnel confirms delivery at destination POI by inputting
    *   Number of bags unloaded
    *   Weight
    *   Unload End date & Time (Timestamp)
*   Driver confirms delivery in app with POD attachment
*   Gate-out time recorded
*   Trip auto-closes after:
    *   QC Pass
    *   POD received
*   Trip cannot close without POD
*   QC fail blocks closure

**Functional Requirements:**

*   \[Critical\] System SHALL auto-close trip upon QC pass and POD confirmation.
*   \[High\] System SHALL capture gate-out timestamp


## Trip Costing

**Version 1.0, Phase 1**

**User Story:** _As an Accounts or Financial Officer and Transport Planner, I want to record and review trip-level costs for each completed TOs so that I can analyze delivery expenses, compare own vs vendor costs, and prepare accurate invoices._

**Acceptance Criteria:**

*   Each completed trip has a **Trip Cost Sheet**
*   System supports TO-level cost capture linked to:
    *   Transport Order (TO) ID
    *   Vehicle Type (Own / Vendor)
    *   Vehicle Number
    *   Driver
*   Cost types supported included:
    *   Distance-based cost
    *   Vendor Trip Charge (If Vendor Fleet Used)
    *   Maintenance Allocation (Manual – applicable for Own Fleet)
    *   Fuel Cost (Manual – applicable for Own Fleet)
    *   Toll / Ferry / Parking (Manual – applicable for Own Fleet)
    *   Other Operational Changes
*   System distinguishes:
    *   Own Fleet Cost
    *   Vendor Fleet Cost
*   Manual cost entry is allowed only for authorized roles
*   Cost history is audit-logged
*   Trip cost summary is available after TO closure

**Functional Requirements:**

*   \[Critical\] System SHALL generate a Trip Cost record once a Trip is created
*   \[Critical\] System SHALL allow manual entry of:
    *   Fuel cost
    *   Vendor Trip Charge (If Vendor Fleet used)
    *   Maintenance Allocation (Manual – applicable for Own Fleet)
    *   Toll / Ferry / Parking (Manual – applicable for Own Fleet)
    *   Other Operational Changes
*   \[Critical\] System SHALL calculate:
    *   Total Trip Cost
    *   Cost per KM
*   \[High\] System SHALL differentiate Own Fleet vs Vendor Fleet costing


## Vendor Trip Cost & Billing & Claims Management

**Version 1.0, Phase 2**

**User Story:** _As an Accounts Officer, I want vendor trip to be finalized per trip so that invoices can be generated accurately without disputes._

**Acceptance Criteria:**

*   Vendor cost is linked to:
    *   TO ID
    *   Trip ID
    *   Vendor ID
*   Vendor cost may originate from:
    *   Contractual rate (pre-configured, hidden from vendor)
    *   Approved Bid Rate (non-contractual)
*   Vendor Cost is locked after Bid approval
*   System supports:
    *   One invoice per TO
*   Supports documents (POD, GRN) are mandatory before invoicing submission

**Functional Requirements:**

*   \[Critical\] System SHALL allow consolidated invoice submission.
*   \[Critical\] System SHALL link invoices to corresponding TO


## Trip Management (Trip Assignment & Navigation)

**Version 1.0, Phase 1**

**User Story:** _As a driver, I want to view my assigned trips and navigate routes so that I can execute deliveries accurately and on time._

**Acceptance Criteria:**

*   Driver can view assigned Trip and TO details
*   Update or initiate Trip start state
*   Trip status visible (Assigned, In-Transit, Delivered)
*   Drivers can only view trips assigned to them

**Functional Requirements:**

*   \[High\] System SHALL display assigned trips to the logged-in driver
*   \[High\] Trips Details SHALL include TO ID, Pickup POI, drop POI, product type, quantity, and urgency


## Vendor Portal Access (Bidding & Trip Management)

**Version 1.0, Phase 1**

**User Story:** _As a vendor, I want to view TO list for bidding so that I can participate in transport operations after approval._

**Acceptance Criteria:**

*   Vendor can view available bid
*   Vendor can track active and completed trips

**Functional Requirements:**

*   \[High\] Vendor SHALL be able to view active bids, assigned trips and completed trips Invoice Management & Claims Submission
*   \[High\] Vendor SHALL be able add driver and helper and vehicle details after winning bids


## Trip Management & Tracking

*   Trip creation from TO
*   Driver and vehicle assignment
*   Trip lifecycle management
*   Partial delivery handling (incident-based)
*   Proof of Delivery (POD) capture
*   Trip auto-closure on QC pass


## GPS Tracking & Basic Trip Costing

*   Live GPS tracking (read-only)
*   POI geofencing and dwell time tracking
*   Basic trip costing:
    *   Distance-based
    *   Manual cost entry
*   Vendor vs Own fleet cost segregation
