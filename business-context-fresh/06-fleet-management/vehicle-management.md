---
source_document: PRD_DFMS_v1.0.md
source_sections: Fleet & Vehicle Management, Vehicle Registration, Vehicle Registration & Master Data Management
extracted_date: 2026-02-13
---

## Fleet & Vehicle Management


## Vehicle Registration


## Vehicle Registration & Master Data Management

**Version 1.0, Phase 1**

**User Story:** _As a Transport Manager, I want to register vehicles with complete identification and configuration details so that vehicles can be tracked, assigned, and monitored throughout transport operations._

**Acceptance Criteria:**

*   System allows registration of vehicles with unique identifiers:
    *   Vehicle registration captures:
        *   Vehicle Type (required)
            *   Pickup Van
            *   Open Truck
            *   Covered Truck
            *   Nosimon
            *   Auto
            *   Tom Tom
            *   Tractor
        *   Number of Wheels (Numeric Input)
            *   4, 6, 10, 12, 16, 18, 20+
        *   Capacity (Max Load Capacity (Ton)
            *   Manual override allowed
        *   Allowed Product Category (FM / RM / Both)
        *   License/Registration Number (required, unique)
            *   Format validation: Bangladesh vehicle registration pattern
            *   Display format: Dhaka Metro-GA-11-1234
        *   Chassis Number (required, unique)
            *   VIN (Vehicle Identification Number) format
            *   Uniqueness validation
        *   Mileage
            *   Initial Odometer reading (numeric, KM)
            *   Current Odometer Reading
            *   Average Mileage
            *   Total Distance Travelled
        *   Purchase Information (optional)
            *   Purchase Date
        *   Model (required)
        *   Body Type
            *   Open Body
            *   Closed Body
            *   Container
            *   Flatbed
            *   Tanker
            *   Refrigerated
        *   Fuel Type
            *   Diesel
            *   Petrol
            *   CNG
            *   Electric
            *   Hybrid
        *   Ownership (Own/Vendor)
        *   Assigned Driver (Optional)
            *   Select from active drivers
            *   Can be assigned post-registration
        *   GPS Tracker ID
            *   Tracker Model and ID
        *   Assigned POI
            *   Vehicle operates from this POI
        *   Assigned Garage/Workshop
            *   Primary Handover location
*   Vehicle record is stored as a unique entity in the system
*   Vehicle list view with filtering:
    *   List displays: Registration number, type, capacity, Status, POI, Driver, Actions
    *   Filter
*   Vendor vehicles do not require mileage tracking validation
*   Vehicles cannot be assigned to trips unless marked Active

**Functional Requirements:**

*   \[Critical\] System SHALL provide a vehicle registry module to create and manage vehicle master records.
*   \[Critical\] System SHALL enforce uniqueness of vehicle registration number within a tenant.
*   \[High\] Vehicle records SHALL be editable with full audit trail.
*   \[High\] System SHALL support both owned and vendor vehicle classification.
