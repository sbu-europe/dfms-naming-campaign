---
source_document: PRD_DFMS_v1.0.md
source_sections: Vendor Onboarding & Registration
extracted_date: 2026-02-13
---

## Vendor Onboarding & Registration

**Version 1.0, Phase 1**

**User Story:** _As a transport vendor, I want to register my company and vehicles on DFMS so that I can participate in transport bidding and execute trips for the organization._

**Acceptance Criteria:**

*   System provides a vendor registration form capturing:
    *   Company details
    *   Vendor type
        *   Contractual (Fixed Rate)
        *   Non-Contractual)
    *   Contact Information
    *   Testimonial / reference from Truck Association
*   Vendor must upload mandatory compliance document:
    *   Trade License
    *   BIN
    *   TIN
*   Vendor Contract Type Selection
    *   Contractual Vendor
        *   Contractual vendors can be directly assigned to TOs by TDO (Transport Distribution Officer) instead of bidding
    *   Non-Contractual Vendor
        *   Non-Contractual vendors are sent bidding notification with vehicle requirement with route information with optional expected bid price. In return, vendors can submit bid with price and number of vehicles available for the TO execution. After approval or winning, vendors will need to add vehicle and driver information with the TO.
*   Vendor profile is saved in **Pending Verification** status. Submitted vendor profile remains inactive until admin approval
*   Vendors cannot access bidding or TO details before approval
*   Vendor registration data is tenant-specific and isolated

**Functional Requirements:**

*   \[Critical\] System SHALL provide a vendor self-registration interface (web/mobile).
*   \[Critical\] System SHALL require document uploads (trade license, BIN, TIN) before submission.
*   \[High\] Vendor registration form SHALL capture company, vehicle, driver, and compliance data.
*   \[High\] System SHALL allow vendors to manage multiple vehicles under one profile.
*   \[High\] System SHALL allow rejected vendors to resubmit corrected information.
*   \[High\] All vendor registration attempts SHALL be logged for audit.
