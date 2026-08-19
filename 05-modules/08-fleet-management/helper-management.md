---
source_document: DFMS_Product_Requirements_Document_v3.md
source_sections: Helper Profile, Helper Assignment
extracted_date: 2026-02-13
---

**Detailed design:** [Helper Master Data Management](../03-users/helper-master-data.md) (includes optional `user_id` FK to `User`).

## Helper Profile

**Version 1.0, Phase 1**

**User Story:** _As a Transport Distribution Officer (TDO), I want to register and manage helper profiles so that helpers can be formally linked to drivers and tracked during transport operations._

**Acceptance Criteria:**

*   System allows creation and management of helper profiles
*   Each helper profile stores:
    *   Helper Name
    *   National ID
    *   Reference from known contacts
*   System SHALL allow helper profile update with audit logging.
*   Each helper MUST have a unique national ID.

**Functional Requirements:**

*   \[Critical\] System allows creation and management of helper profiles
*   \[Critical\] System SHALL capture the following mandatory helper information:
    *   National ID
    *   Reference contact(s)
*   \[High\] System SHALL allow helper profile updates with audit logging.


## Helper Assignment

**Version 1.0, Phase 1**

**User Story:** _As a Transport Distribution Officer (TDO), I want to assign one or more helpers to a driver so that trips are carried out with the required supporting personnel._

**Acceptance Criteria:**

*   System allows assigning one or more helpers to a driver
*   Helper assignment is linked to trip execution
*   A helper MAY be assigned to multiple trips over time but NOT to conflicting active trips

**Functional Requirements:**

*   \[Critical\] System SHALL support many-to-one mapping (multiple helpers to one driver).
*   \[High\] System SHALL link helper assignments to:
    *   Driver
    *   Vehicle
    *   Trip/Transport Order (TO)
*   \[High\] System SHALL store helper assignment history per trip.
