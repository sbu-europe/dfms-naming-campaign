---
source_document: PRD_DFMS_v1.0.md
source_sections: Driver Registration & Management
extracted_date: 2026-02-13
---
## Driver Registration & Management

## Driver Master Data

**Version 1.0, Phase 1**

**User Story:** _As a Transport Planner, I want to register and manage driver profiles so that only verified drivers operate vehicles._

**Acceptance Criteria:**

*   Driver profile captures:
    *   Driving License Number,
    *   License Type/Class/Expiry
    *   National ID
    *   Driver Type (Permanent/Temporary/Own/Vendor)
    *   Experience Certificate
    *   Biodata
    *   Reference Contact (Minimum 2 contact)
    *   Accident History
    *   Issue & Expiry Dates
    *   Contact Number
    *   Medical Certificate
    *   Last training/Assessment Information

**Functional Requirements:**

*   \[Critical\] System SHALL track vehicle-to-TO assignment history.
*   \[Critical\] System SHALL calculate utilization based on trips and time

## Driver-Vehicle Assignment

**Version 1.0, Phase 1**

**User Story:** _As a Transport Distribution Officer (TDO), I want to assign drivers to vehicles so that trips are carried out with the correct and available personnel._

**Acceptance Criteria:**

*   System allows assignment and reassignment of drivers to vehicles
*   Only available and active drivers can be assigned
*   Only Operational vehicles (not under maintenance) are scheduled
*   One driver can be assigned to only one active vehicle at a time
*   Assignment history is retained for audit and reporting
*   A driver MUST NOT be assigned to multiple vehicles simultaneously

**Functional Requirements:**

*   \[Critical\] System SHALL support driver-vehicle pairing without requiring vehicle master modification.
*   \[Critical\] System SHALL prevent assigning:
    *   Absent drivers
    *   Drivers already assigned to an active trip
    *   Vehicles under maintenance
*   \[High\] System SHALL store assignment records including:
    *   Driver ID
    *   Vehicle ID
    *   Assignment start date & time
    *   Assignment end date & time
    *   Assigned by (user)
*   \[High\] System SHALL auto-unassign driver upon trip completion or reassignment

## Driver State Tracking

**Version 1.0, Phase 1**

**User Story:** _As a Transport Manager and Driver Supervisor, I want to see driver states so that I can assign trips efficiently._

**Acceptance Criteria:**

*   Driver states updated automatically based on trip and GPS data
*   Supported driver states:
    *   Assigned
    *   Available (Default – Unassigned)
    *   On Leave
*   Effective driving hours calculated using GPS trip data
*   Driver state visible in planning and dispatch screens
*   Driver state ‘On Trip’ takes precedence over all other states
*   Driving hours calculation MUST exclude idle or parked durations

**Functional Requirements:**

*   \[Critical\] System SHALL track driver state as:
    *   Assigned
    *   Available (Default – Unassigned)
    *   On Leave
*   \[Critical\] System SHALL update driver state based on:
    *   Trip assignment
    *   Trip start and completion
    *   Manual attendance input (where applicable)
*   \[High\] System SHALL calculate effective driving hours using GPS movement data per trip
*   \[High\] System SHALL expose driver state in:
    *   Trip planning screens
    *   Vehicle assignment views
    *   Dispatch boards
    *   Driver Supervisor Menu

## Driver Availability Status Tracking

**Version 1.0, Phase 1**

**User Story:** _As a Driver Supervisor, I want to capture driver availability status and work time so that driver utilization and compliance can be analyzed._

**Acceptance Criteria:**

*   System supports attendance capture through:
    *   Manual entry of
        *   Driver,
        *   POI,
        *   Entry Date & Time,
        *   Exit Date & Time
*   Supervisor will be able to update Driver Status to On Leave with Leave Start Date and Leave End Date
*   Attendance records are date-wise and driver specific
*   Working hours visible in reports and dashboards
*   Maximum working hours configurable (Default reference: 12 hours)
*   All driver assignments, state changes and attendance entries are logged

**Functional Requirements:**

*   \[High\] System SHALL allow manual attendance entry for drivers
*   \[High\] System SHALL derive working hours from GPS trip data where available
*   \[High\] System SHALL consolidate manual and GPS data into a single attendance

## Driver Performance Tracking

**Version 1.0, Phase 3**

**User Story:** _As a driver supervisor, I want to view detailed driver performance metrics so that I can coach drivers and improve operational outcomes._

**Acceptance Criteria:**

*   System tracks:
    *   Total trips completed
    *   Average trip duration vs planned
    *   Delivery delay count
    *   Incident-linked trips
    *   Idle time percentage

**Functional Requirements:**

*   \[Critical\] System SHALL display driver performance dashboard
