---
source_document: PRD_DFMS_v1.0.md
source_sections: Reporting & Analytics, Transport & Trip Reports
extracted_date: 2026-02-13
---

## Reporting & Analytics


## Transport & Trip Reports

**Version 1.0, Phase 3**

**User Story:** _As a Transport, Distribution or Management user, I want visibility into daily transport operations so that I can monitor trip execution, delays and turnaround efficiency._

**Acceptance Criteria:**

*   System provides Trip Summary report including:
    *   Trip ID
    *   Status
    *   Route
    *   Vehicle
    *   Driver
    *   Product Type
*   System provides Trip Delay report identifying trips exceeding expected timelines
*   System provides Trip Turnaround report covering:
    *   Gate-in
    *   Scale-in
    *   Load/Unload
    *   Scale-out
    *   Gate-out
*   Reports are filterable by date range, POI, vehicle, route, and trip status
*   Turnaround time calculation uses actual event timestamps only
*   Users can view reports based on RBAC permission

**Functional Requirements:**

*   \[High\] System SHALL generate a Trip Summary report with full trip lifecycle visibility
*   \[High\] System SHALL calculate and display Trip Turnaround Time using gate, scaling, and loading timestamps
*   \[High\] System SHALL identify delayed trips based on configured SLA or planned timelines
*   \[High\] System SHALL allow filtering by:
    *   Date
    *   Depot/POI
    *   Vehicle
    *   Driver
    *   Trip Status
