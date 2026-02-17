---
source_document: PRD_DFMS_v1.0.md
source_sections: Vendor Reports, Fleet & Vehicle Performance Reports
extracted_date: 2026-02-13
---

## Vendor Reports

**Version 1.0, Phase 3**

**User Story:** _As a Transport user, I want vendor-specific performance and billing reports so that I can evaluate vendor contribution and manage disputes._

**Acceptance Criteria:**

*   Vendor Trip performance report shows:
    *   Trips completed
    *   On-time delivery percentage
*   Vendor Bids Participation report shows:
    *   Bids submitted
    *   Bids won
*   Vendor performance metrics derive only from completed trips

**Functional Requirements:**

*   \[High\] System SHALL generate Vendor Trip Performance reports
*   \[High\] System SHALL track vendor bid participation and bid success ratio
*   \[High\] System SHALL provide a Vendor Dispute report


## Fleet & Vehicle Performance Reports

**Version 1.0, Phase 3**

**User Story:** _As a Transport user, I want visibility into fleet utilization and vehicle health so that I can optimize asset usage and maintenance planning._

**Acceptance Criteria:**

*   Fleet utilization report shows:
    *   Active vehicles
    *   Idle Vehicles
    *   Vehicles under Maintenance
*   Report displays trips per vehicle
*   Vehicle health indicators visible where available

**Functional Requirements:**

*   \[High\] System SHALL generate Fleet Utilization reports by vehicle status
*   \[High\] System SHALL calculate trips per vehicle within selected period
