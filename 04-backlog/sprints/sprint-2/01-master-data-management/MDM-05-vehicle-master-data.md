---
jira_key: DFS-021
jira_type: Story
jira_epic: DFS-020
jira_sprint: "Sprint 2"
story_id: US-053
title: Vehicle Registration & Master Data Management
epic: Master Data Management
status: Pending
story_points: 5
assignee: ~
spec_file: ../../../../stories/US-053-vehicle-registration-master-data.md
---

# MDM-05 — Vehicle Registration & Master Data Management

## User Story

**As a** Tenant Admin or Transport Planner  
**I want to** register vehicles with complete identification and configuration details  
**So that** vehicles can be tracked, assigned, and monitored throughout transport operations

## Business Context

Vehicle master data is the foundation of all fleet management operations. Accurate vehicle information is critical for:
- Trip planning and vehicle assignment
- Fleet utilization tracking
- Maintenance scheduling
- Compliance management
- Cost allocation

Without proper vehicle master data, the system cannot:
- Assign vehicles to Transport Orders (TO)
- Track vehicle status and availability
- Calculate fleet utilization
- Link trips to specific vehicles for costing

## Acceptance Criteria

- **Given** a Tenant Admin or Transport Planner is registering a vehicle in the system, **when** the vehicle registration form is submitted, **then** the system shall create a unique vehicle entity with mandatory and optional attributes such as registration number, type, capacity, ownership, POI captured and validated.
- **And** the system shall enforce the following validations during registration:
  - Vehicle Type is mandatory and must be one of: Pickup Van, Open Truck, Covered Truck, Nosimon, Auto, Tom Tom, Tractor, Primemover, Poultry Carrier, Tipper, Delivery Van
  - License/Registration Number is mandatory, unique per tenant, and validated against the Bangladesh vehicle registration format (e.g., Dhaka Metro-GA-11-1234)
  - Chassis Number is mandatory, unique per tenant, and follows VIN format
  - Model is mandatory
  - Capacity is captured in Tons, with manual override allowed
  - Number of Wheels must be a numeric value
  - Allowed Product Type must be FM, RM, Both (Optional)
- **And** the system shall allow capturing additional vehicle details including:
  - Mileage information (initial, current, average, total distance)
  - Purchase information (date)
  - Model (required)
  - Body Type (Open Body, Closed Body, Container, Flatbed, Tanker, Refrigerated, Lowbed)
  - Fuel Type (Diesel, Petrol, CNG, Electric, Hybrid, LPG)
  - Assigned Driver (optional, selectable from active drivers)
  - GPS Tracker ID
  - Assigned POI (Drop-down)
- **And** the system shall store each registered vehicle as a unique record.
- **And** the system shall support vehicle status tracking (Available, Active, Idle, Scheduled / Parked, under maintenance) dynamically controlled by the workflow (vehicle's work or GPS info).
- **And** the vehicle list view shall display registered vehicles with: Registration Number, Vehicle Type, Capacity, Status, Assigned POI, Assigned Driver, Available actions, Filter options
- **And** the system shall allow filtering and searching vehicles by multiple criteria
- **And** vendor-owned vehicles shall not require mileage tracking validation.
- **And** the system shall prevent vehicles from being assigned to any trip unless the vehicle status is Active.
- **And** the system shall link vehicles with TO, Trip, Driver, Fuel, and maintenance records
- **And** the system shall prevent vehicles under maintenance from being assigned to trips
- **And** the system shall enforce one vehicle per active trip constraint
- **And** the system shall provide CRUD operations for vehicle master data
- **And** the system shall provide bulk upload functionality for vehicle data via CSV
- **And** the system shall support multiple bulk uploads (append-only behavior) and display upload progress and completion status
- **And** the system shall support inline editing at row and column level
- **And** the system shall support referential integrity validation (e.g., assigned POI must exist and be active)
- **And** the system shall display vehicle history (trips, maintenance, incidents)
- **And** the system shall support vehicle activation/deactivation
- **And** the system shall provide CSV template download with mandatory fields marked and sample values
- **And** the system MAY support custom vehicle attributes per tenant

## Functional Requirements

### FR-001: Vehicle Creation
- **[Critical]** System SHALL provide form to create new vehicle record
- **[Critical]** System SHALL validate all mandatory fields before save
- **[Critical]** System SHALL auto-generate unique vehicle ID
- **[High]** System SHALL support inline validation with real-time feedback

**Vehicle Master Data Configuration:**
| Field Name | Field Type | Required | Remarks |
|---|---|---|---|
| Registration Number | Text Input | Yes | |
| Vehicle Type | Dropdown | Yes | Pick-up Van, Open Truck, Covered Truck, Nosimon, Auto, Tom Tom, Tractor, Primemover, Poultry Carrier, Tipper, Delivery Van |
| Vehicle Body Type | Dropdown | Yes | Open Body, Closed Body, Container, Flatbed, Tanker, Refrigerated, Lowbed |
| Fuel Type | Dropdown | Yes | Diesel, Petrol, CNG, Electric, Hybrid, LPG |
| Capacity (MT / Bag / KG) | Number Input | Yes | User needs to choose the unit of Max load capacity of the vehicle |
| Date of Purchase | Date format | No | |
| Year of Manufacture | Numeric | No | |
| Brand Name | Text Input | No | |
| Model Name | Text Input | No | |
| Vehicle Color | Text Input | No | |
| Number of Wheels | Number Input | Yes | |
| Chassis Number | Text Input | No | |
| Allowed Product Type | Dropdown | No | FG / RM / Both |
| GPS Device ID | Text Input | No | |
| Initial Odometer reading | numeric, KM | No | |
| Current Odometer Reading | numeric, KM | No | |
| Average Mileage | numeric, KM | No | System Calculated |
| Total Distance Travelled | numeric, KM | No | System Calculated |
| Assigned Driver | Drop-Down | No | |
| Assigned POI | Drop-Down | No | |
| Vehicle Status | Checkmark | Yes | Is Active? |
| Fitness Certificate Expiry Date | Date Field | Yes | |
| Insurance Expiry Date | Date Field | Yes | |

### FR-002: Vehicle Status Management
- **[Critical]** System SHALL support operational status transitions (Available ↔ Active ↔ Idle ↔ Under Maintenance) dynamically controlled by the workflow, depending on the vehicle's work or GPS info.
- System displays vehicle master data status as: (Checkbox) [Required] Active / Inactive (This is the `is_active` flag, distinct from operational status)
- **[Critical]** System SHALL automatically update operational status based on trip events and GPS info
- **[Critical]** System SHALL exclude vehicles with operational status "Under Maintenance" from assignment lists
- **[High]** System SHALL log all operational status changes with timestamp and reason

**Status Definitions:**
- **Available**: Ready for assignment, not on active trip
- **Active**: Currently on trip (further broken down by trip state)
- **Idle**: Not assigned, parked at depot
- **Scheduled/Parked**: Reserved for upcoming trip
- **Under Maintenance**: In workshop, unavailable for trips

### FR-003: Vehicle Search & Filter
- **[High]** System SHALL provide search by registration number, type, depot
- **[High]** System SHALL support multi-criteria filtering
- **[High]** System SHALL display filtered results in sortable table
- **[Medium]** System SHALL support advanced search with combined filters

### FR-004: Vehicle Bulk Upload & Inline Management
- **[Critical]** System SHALL provide bulk upload option for vehicle master data
- **[Critical]** Bulk upload SHALL support CSV file format only (UTF-8 encoded)
- **[Critical]** System SHALL provide vehicle-specific CSV template with mandatory fields marked, date type hints, sample values
- **[Critical]** Bulk upload SHALL support append-only behavior (existing records are NOT overwritten, new records are added)
- **[Critical]** System SHALL allow uploading additional CSV files to append new vehicle records
- **[Critical]** System SHALL validate each row independently and report successful and failed rows with error reason
- **[Critical]** System SHALL support inline editing at row level and column (Field) level
- **[Critical]** Changes SHALL be saved immediately or via explicit save action
- **[Critical]** All bulk upload actions SHALL be audit logged (Entity type, File name, Uploaded by, Timestamp, Number of rows processed/success/failed)
- **[Critical]** System SHALL allow single-row delete actions with delete reason (mandatory), deleting user, timestamp
- **[High]** System SHALL allow bulk upload multiple times for the same entity
- **[High]** Upload progress and completion status SHALL be shown to the user
- **[High]** System SHALL provide detailed error report for failed imports

## Business Rules

- **BR-001: Unique Registration & Chassis Number**: Each vehicle must have unique registration number AND unique chassis number within tenant.
- **BR-002: Status Exclusivity**: Vehicle can only have one operational status at a time, determined dynamically by workflow or GPS info.
- **BR-003: Maintenance Exclusion**: Vehicles under maintenance cannot be assigned to trips.
- **BR-004: Single Active Trip**: One vehicle can only be assigned to one active trip at a time.
- **BR-005: Vehicle-Driver Binding**: When vehicle assigned to TO, driver must also be assigned.
- **BR-006: Referential Integrity**: Vehicle must be assigned to existing active POI and driver.
- **BR-007: Bulk Upload Append-Only**: Bulk upload does not overwrite existing records. Duplicate registration/chassis numbers in CSV are rejected with error report.

## Data Model

```text
Vehicle {
  id: UUID (PK, auto-generated)
  tenant_id: UUID (FK)
  registration_number: String (unique per tenant, indexed)
  vehicle_type: Enum
  body_type: Enum
  fuel_type: Enum
  capacity_tonnage: Decimal
  purchase_date: Date
  year_of_manufacture: Integer
  brand_name: String
  model_name: String
  vehicle_color: String
  number_of_wheels: Integer
  chassis_number: String (unique per tenant, indexed)
  allowed_product_category: Enum
  gps_tracker_id: String
  initial_odometer_reading: Decimal
  current_odometer_reading: Decimal
  average_mileage: Decimal
  total_distance_travelled: Decimal
  assigned_driver_id: UUID
  assigned_poi_id: UUID
  operational_status: Enum (Available, Active, Idle, Scheduled, Under_Maintenance) // Derived/controlled by workflow/GPS
  fitness_expiry: Date
  insurance_expiry: Date
  remarks: Text
  is_active: Boolean
  created_at: Timestamp
  created_by: UUID
  updated_at: Timestamp
  updated_by: UUID
}

BulkUploadLog {
  id: UUID (PK)
  tenant_id: UUID (FK)
  entity_type: String
  file_name: String
  uploaded_by: UUID
  uploaded_at: Timestamp
  total_rows: Integer
  successful_rows: Integer
  failed_rows: Integer
  error_details: JSONB
  status: Enum
}
```

## Relationships

- Vehicle → POI (home_depot_id): Many-to-One
- Vehicle → Transport Orders: One-to-Many
- Vehicle → Trips: One-to-Many
- Vehicle → Maintenance Records: One-to-Many
- Vehicle → Fuel Entries: One-to-Many

## UI/UX Requirements

**Vehicle List Page**
- Layout: Sortable table with pagination
- Columns: Registration, Type, Capacity, Ownership, Depot, Status, Actions
- Actions: View, Edit, Delete (soft delete)
- Filters: Status, Type, Depot, Ownership
- Search: Real-time search by registration number
- Bulk Actions: Export to CSV, Bulk upload

**Vehicle Form (Create/Edit)**
- Layout: Two-column form with sections (Basic Information, Details, Documents, Additional Info)
- Validation: Real-time inline validation
- Save Options: Save & Close, Save & Add Another

**Vehicle Detail Page**
- Tabs: Overview, Trip History, Maintenance History, Fuel History, Documents
- Actions: Edit, Delete, Change Status

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| MDM-05-1 | Requirements & story update on context repo | DFS-163 | Pending |
| MDM-05-2 | Implementation context generation | DFS-164 | Pending |
| MDM-05-3 | Models update & migration | DFS-165 | Pending |
| MDM-05-4 | Admin view implementation | DFS-166 | Pending |
| MDM-05-5 | API Endpoints Implementation | DFS-167 | Pending |
| MDM-05-6 | Bulk Import/Export CSV | DFS-168 | Pending |
| MDM-05-7 | Unit Testing | DFS-169 | Pending |

## API Endpoints

```
POST   /api/v1/vehicles              - Create vehicle
GET    /api/v1/vehicles              - List vehicles (with filters)
GET    /api/v1/vehicles/{id}         - Get vehicle details
PUT    /api/v1/vehicles/{id}         - Update vehicle
DELETE /api/v1/vehicles/{id}         - Delete vehicle (soft)
PATCH  /api/v1/vehicles/{id}/status  - Update status
POST   /api/v1/vehicles/bulk-upload  - Bulk upload CSV
GET    /api/v1/vehicles/bulk-upload/{upload_id}  - Get upload status
GET    /api/v1/vehicles/bulk-upload/template  - Download CSV template
PATCH  /api/v1/vehicles/{id}  - Inline edit (row/column level)
DELETE /api/v1/vehicles/{id}  - Single row delete
GET    /api/v1/vehicles/{id}/history - Get vehicle history
```

## Dependencies

- **No Prerequisites**: This is a foundational feature
- **Enables**:
  - US-015: Fleet Health Dashboard
  - US-020: TO Execution - Own Fleet
  - US-025: Trip Lifecycle Management
  - US-040: Vehicle Utilization Analytics (Phase 2)
  - US-042: Vehicle Downtime Management (Phase 2)

## Definition of Done

- **Development**: Code complete and committed, All functional requirements implemented, Business rules enforced, API endpoints documented, Unit tests written and passing (coverage > 80%), Integration tests written and passing
- **Quality Assurance**: All acceptance criteria verified, All testing scenarios executed, Edge cases tested, Error handling tested, Cross-browser testing complete, Responsive design tested, Performance tested
- **Documentation**: API documentation updated, User guide updated with screenshots, Release notes updated
- **Deployment**: Code reviewed and approved, Deployed to staging environment, Smoke tests passed in staging, UAT completed and signed off by Product Owner, Deployed to production, Post-deployment verification complete
- **Training**: Training materials updated, Demo prepared, Key users trained
