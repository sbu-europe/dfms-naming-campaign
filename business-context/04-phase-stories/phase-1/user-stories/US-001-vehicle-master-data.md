---
title: Vehicle Master Data Management
story_id: US-001
phase: phase-1
module: Master Data Management
priority: Critical
status: Pending
epic: Fleet Master Data Setup
sprint: Sprint 1
story_points: 5
created: 2026-02-11
updated: 2026-02-13
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
related_stories:
  - US-002-driver-registration.md
  - US-015-fleet-health-dashboard.md
  - US-020-to-execution-own-fleet.md
dependencies: []
tags: [master-data, vehicle, fleet, mvp, critical]
---

# US-001: Vehicle Master Data Management

## User Story

**As a** Transport Manager  
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

### Must Have (Critical)
- [ ] System SHALL allow creation of vehicle records with all mandatory fields
- [ ] System SHALL enforce unique vehicle registration number per tenant
- [ ] System SHALL enforce unique chassis number per tenant
- [ ] System SHALL track vehicle attributes: registration number, type, capacity, ownership, depot
- [ ] System SHALL support vehicle status tracking (Available, Active, Idle, Scheduled/Parked, Under Maintenance)
- [ ] System SHALL link vehicles with TO, Trip, Driver, Fuel, and maintenance records
- [ ] System SHALL prevent vehicles under maintenance from being assigned to trips
- [ ] System SHALL enforce one vehicle per active trip constraint
- [ ] System SHALL provide CRUD operations for vehicle master data
- [ ] System SHALL provide bulk upload functionality for vehicle data via CSV
- [ ] System SHALL support inline editing at row and column level
- [ ] System SHALL support referential integrity validation (e.g., assigned POI must exist and be active)
- [ ] System SHALL provide vehicle list view with filtering
- [ ] List SHALL display: Registration number, type, capacity, Status, POI, Driver, Actions
- [ ] System SHALL NOT require mileage tracking validation for vendor vehicles
- [ ] System SHALL prevent vehicles from being assigned to trips unless marked Active

### Should Have (High)
- [ ] System SHOULD support vehicle categorization by type (Truck, Van, Pickup, etc.)
- [ ] System SHOULD track vehicle ownership (Own, Leased, Vendor)
- [ ] System SHOULD allow filtering and searching vehicles by multiple criteria
- [ ] System SHOULD display vehicle history (trips, maintenance, incidents)
- [ ] System SHOULD support vehicle activation/deactivation
- [ ] System SHOULD provide CSV template download with mandatory fields marked and sample values
- [ ] System SHOULD support multiple bulk uploads (append-only behavior)
- [ ] System SHOULD display upload progress and completion status

### Nice to Have (Medium)
- [ ] System MAY support vehicle photo upload
- [ ] System MAY track vehicle documents (registration, insurance, fitness)
- [ ] System MAY send alerts for expiring vehicle documents
- [ ] System MAY support custom vehicle attributes per tenant

## Functional Requirements

### FR-001: Vehicle Creation
- [Critical] System SHALL provide form to create new vehicle record
- [Critical] System SHALL validate all mandatory fields before save
- [Critical] System SHALL auto-generate unique vehicle ID
- [High] System SHALL support inline validation with real-time feedback

**Mandatory Fields** (per PRD Section 6.6.1 - Vehicle Registration & Master Data Management):
- Vehicle Type (required): Pickup Van, Open Truck, Covered Truck, Nosimon, Auto, Tom Tom, Tractor
- Number of Wheels (Numeric Input): 4, 6, 10, 12, 16, 18, 20+
- Capacity (Max Load Capacity in Ton) - Numeric Input, Manual override allowed
- Allowed Product Category (FG / RM / Both)
- License/Registration Number (required, unique)
  - Format validation: Bangladesh vehicle registration pattern
  - Display format: Dhaka Metro-GA-11-1234
- Chassis Number (required, unique)
  - VIN (Vehicle Identification Number) format
  - Uniqueness validation
- Mileage:
  - Initial Odometer reading (numeric, KM)
  - Current Odometer Reading
  - Average Mileage
  - Total Distance Travelled
- Purchase Information (optional):
  - Purchase Date
- Model (required)
- Body Type: Open Body, Closed Body, Container, Flatbed, Tanker, Refrigerated
- Fuel Type: Diesel, Petrol, CNG, Electric, Hybrid
- Ownership (Own/Vendor)
- Assigned Driver (Optional)
  - Select from active drivers
  - Can be assigned post-registration
- GPS Tracker ID
  - Tracker Model and ID
- Assigned POI (Vehicle operates from this POI)
- Assigned Garage/Workshop (Primary Handover location)
- Status (default: Available)

**Optional Fields**:
- Mileage:
  - Initial Odometer reading (numeric, KM)
  - Current Odometer Reading
  - Average Mileage
  - Total Distance Travelled
- Purchase Information:
  - Purchase Date
  - Purchase Price
- Body Type: Open Body, Closed Body, Container, Flatbed, Tanker, Refrigerated
- Fuel Type: Diesel, Petrol, CNG, Electric, Hybrid
- Assigned Driver (Optional - can be assigned post-registration)
- GPS Tracker ID (Tracker Model and ID)
- Assigned Garage/Workshop (Primary maintenance location)
- Make/Model
- Year
- Color
- Insurance Details
- Fitness Certificate
- Notes/Remarks

### FR-002: Vehicle Status Management
- [Critical] System SHALL support status transitions: Available ↔ Active ↔ Idle ↔ Under Maintenance
- [Critical] System SHALL automatically update status based on trip events
- [Critical] System SHALL exclude vehicles with status "Under Maintenance" from assignment lists
- [High] System SHALL log all status changes with timestamp and reason

**Status Definitions**:
- **Available**: Ready for assignment, not on active trip
- **Active**: Currently on trip (further broken down by trip state)
- **Idle**: Not assigned, parked at depot
- **Scheduled/Parked**: Reserved for upcoming trip
- **Under Maintenance**: In workshop, unavailable for trips

### FR-003: Vehicle Search & Filter
- [High] System SHALL provide search by registration number, type, depot
- [High] System SHALL support multi-criteria filtering
- [High] System SHALL display filtered results in sortable table
- [Medium] System SHALL support advanced search with combined filters

### FR-004: Vehicle Bulk Upload & Inline Management
- [Critical] System SHALL provide bulk upload option for vehicle master data
- [Critical] Bulk upload SHALL support CSV file format only (UTF-8 encoded)
- [Critical] System SHALL provide vehicle-specific CSV template with:
  - Mandatory fields marked
  - Date type hints
  - Sample values
- [Critical] Bulk upload SHALL support append-only behavior:
  - Existing records are NOT overwritten by default
  - New records are added to the existing master dataset
- [Critical] System SHALL allow uploading additional CSV files to append new vehicle records
- [Critical] System SHALL validate each row independently and report:
  - Successful rows
  - Failed rows with error reason
- [Critical] System SHALL support inline editing at:
  - Row level
  - Column (Field) level
- [Critical] Changes SHALL be saved immediately or via explicit save action
- [Critical] All bulk upload actions SHALL be audit logged:
  - Entity type (Vehicle)
  - File name
  - Uploaded by
  - Timestamp
  - Number of rows processed / success / failed
- [Critical] System SHALL allow single-row delete actions with:
  - Delete reason (mandatory)
  - Deleting user
  - Timestamp
- [High] System SHALL allow bulk upload multiple times for the same entity
- [High] Upload progress and completion status SHALL be shown to the user
- [High] System SHALL provide detailed error report for failed imports

## Business Rules

### BR-001: Unique Registration & Chassis Number
- **Rule**: Each vehicle must have unique registration number AND unique chassis number within tenant
- **Validation**: System SHALL prevent duplicate registration numbers and chassis numbers
- **Error Message**: "Vehicle with registration number [XXX] already exists" or "Vehicle with chassis number [YYY] already exists"
- **Enforcement**: Database constraints + application validation

### BR-002: Status Exclusivity
- **Rule**: Vehicle can only have one status at a time
- **Validation**: System enforces single status
- **Impact**: Fleet dashboard, assignment logic

### BR-003: Maintenance Exclusion
- **Rule**: Vehicles under maintenance cannot be assigned to trips
- **Validation**: System SHALL exclude from assignment dropdown
- **Impact**: TO assignment, trip planning

### BR-004: Single Active Trip
- **Rule**: One vehicle can only be assigned to one active trip at a time
- **Validation**: System SHALL check for existing active trip before assignment
- **Error Message**: "Vehicle [XXX] is already assigned to active trip [TO-YYY]"

### BR-005: Vehicle-Driver Binding
- **Rule**: When vehicle assigned to TO, driver must also be assigned
- **Validation**: System SHALL require driver assignment before dispatch
- **Impact**: TO execution workflow

### BR-006: Referential Integrity
- **Rule**: Vehicle must be assigned to existing active POI
- **Rule**: Assigned driver (if any) must exist and be active
- **Rule**: Assigned garage/workshop (if any) must exist
- **Validation**: System SHALL validate all foreign key relationships before saving
- **Error Message**: "Cannot save vehicle - [POI/Driver/Garage] does not exist or is inactive"
- **Enforcement**: Database foreign keys + application validation

### BR-007: Bulk Upload Append-Only
- **Rule**: Bulk upload does not overwrite existing records
- **Rule**: Duplicate registration/chassis numbers in CSV are rejected with error report
- **Validation**: System SHALL check for duplicates before inserting new records
- **Enforcement**: Pre-upload validation + transaction rollback on errors

## Data Model

```
Vehicle {
  id: UUID (PK, auto-generated)
  tenant_id: UUID (FK)
  
  // Mandatory Fields
  registration_number: String (unique per tenant, indexed)
  chassis_number: String (unique per tenant, indexed)
  vehicle_type: Enum (Pickup_Van, Open_Truck, Covered_Truck, Nosimon, Auto, Tom_Tom, Tractor)
  number_of_wheels: Integer (4, 6, 10, 12, 16, 18, 20+)
  capacity_tonnage: Decimal (Max Load Capacity in Ton)
  allowed_product_category: Enum (FG, RM, Both)
  model: String (required)
  ownership: Enum (Own, Vendor)
  assigned_poi_id: UUID (FK to POI, required)
  status: Enum (Available, Active, Idle, Scheduled, Under_Maintenance)
  
  // Optional Fields
  body_type: Enum (Open_Body, Closed_Body, Container, Flatbed, Tanker, Refrigerated)
  fuel_type: Enum (Diesel, Petrol, CNG, Electric, Hybrid)
  assigned_driver_id: UUID (FK to Driver, nullable)
  gps_tracker_id: String (nullable)
  assigned_garage_id: UUID (FK to Garage/Workshop, nullable)
  
  // Mileage Tracking
  initial_odometer_reading: Decimal (KM, nullable)
  current_odometer_reading: Decimal (KM, nullable)
  average_mileage: Decimal (nullable)
  total_distance_travelled: Decimal (KM, nullable)
  
  // Purchase Information
  purchase_date: Date (nullable)
  purchase_price: Decimal (nullable)
  
  // Additional Details
  make: String (nullable)
  year: Integer (nullable)
  color: String (nullable)
  insurance_number: String (nullable)
  insurance_expiry: Date (nullable)
  fitness_expiry: Date (nullable)
  notes: Text (nullable)
  
  is_active: Boolean (default: true)
  created_at: Timestamp
  created_by: UUID (FK to User)
  updated_at: Timestamp
  updated_by: UUID (FK to User)
}

BulkUploadLog {
  id: UUID (PK)
  tenant_id: UUID (FK)
  entity_type: String (e.g., "Vehicle")
  file_name: String
  uploaded_by: UUID (FK to User)
  uploaded_at: Timestamp
  total_rows: Integer
  successful_rows: Integer
  failed_rows: Integer
  error_details: JSONB (stores failed rows with error reasons)
  status: Enum (In_Progress, Completed, Failed)
}
```

### Relationships
- Vehicle → POI (home_depot_id): Many-to-One
- Vehicle → Transport Orders: One-to-Many
- Vehicle → Trips: One-to-Many
- Vehicle → Maintenance Records: One-to-Many
- Vehicle → Fuel Entries: One-to-Many

## UI/UX Requirements

### Vehicle List Page
- **Layout**: Sortable table with pagination
- **Columns**: Registration, Type, Capacity, Ownership, Depot, Status, Actions
- **Actions**: View, Edit, Delete (soft delete)
- **Filters**: Status, Type, Depot, Ownership
- **Search**: Real-time search by registration number
- **Bulk Actions**: Export to CSV, Bulk upload

### Vehicle Form (Create/Edit)
- **Layout**: Two-column form with sections
- **Sections**: 
  1. Basic Information (Registration, Type, Capacity, Ownership)
  2. Details (Make, Model, Year, VIN)
  3. Documents (Insurance, Fitness)
  4. Additional Info (Purchase Date, Notes)
- **Validation**: Real-time inline validation
- **Save Options**: Save & Close, Save & Add Another

### Vehicle Detail Page
- **Tabs**:
  1. Overview (all vehicle info)
  2. Trip History (linked trips)
  3. Maintenance History (linked maintenance records)
  4. Fuel History (linked fuel entries)
  5. Documents (uploaded documents)
- **Actions**: Edit, Delete, Change Status

## Dependencies

**No Prerequisites**: This is a foundational feature

**Enables**:
- US-015: Fleet Health Dashboard
- US-020: TO Execution - Own Fleet
- US-025: Trip Lifecycle Management
- US-040: Vehicle Utilization Analytics (Phase 2)
- US-042: Vehicle Downtime Management (Phase 2)

## Technical Notes

### Implementation Considerations
1. **Performance**: Index on registration_number and status for fast lookups
2. **Soft Delete**: Implement soft delete to preserve historical data
3. **Audit Trail**: Log all changes to vehicle records
4. **Validation**: Implement both client-side and server-side validation
5. **Caching**: Cache vehicle status for dashboard performance

### API Endpoints
```
POST   /api/v1/vehicles              - Create vehicle
GET    /api/v1/vehicles              - List vehicles (with filters)
GET    /api/v1/vehicles/{id}         - Get vehicle details
PUT    /api/v1/vehicles/{id}         - Update vehicle
DELETE /api/v1/vehicles/{id}         - Delete vehicle (soft)
PATCH  /api/v1/vehicles/{id}/status  - Update status
POST   /api/v1/vehicles/bulk-upload  - Bulk upload CSV
Body: {file: CSV file}
Response: {upload_id, total_rows, successful_rows, failed_rows, errors: [{row, errors}]}

GET    /api/v1/vehicles/bulk-upload/{upload_id}  - Get upload status

GET    /api/v1/vehicles/bulk-upload/template  - Download CSV template

PATCH  /api/v1/vehicles/{id}  - Inline edit (row/column level)
Body: {field_name: new_value}

DELETE /api/v1/vehicles/{id}  - Single row delete
Body: {delete_reason: string}
GET    /api/v1/vehicles/{id}/history - Get vehicle history
```

### Security
- Role-based access: Admin and Transport Planner can create/edit
- Tenant isolation: Users can only see vehicles in their tenant
- Audit logging: All changes logged with user and timestamp

## Testing Scenarios

### Happy Path
1. **Create Vehicle**
   - Navigate to Vehicles → Add New
   - Fill mandatory fields with valid data
   - Click Save
   - **Expected**: Vehicle created, success message, redirected to vehicle list

2. **Update Vehicle Status**
   - Select vehicle from list
   - Change status to "Under Maintenance"
   - Verify vehicle excluded from assignment dropdown
   - **Expected**: Status updated, vehicle unavailable for assignment

3. **Bulk Upload**
   - Download CSV template
   - Add 10 vehicles with valid data
   - Upload CSV
   - **Expected**: All 10 vehicles created successfully, upload log created

4. **Bulk Upload with Errors**
   - Upload CSV with 5 valid and 2 duplicate registration numbers
   - **Expected**: 5 vehicles created, 2 rejected with detailed error report

5. **Inline Editing**
   - Edit vehicle status directly in list view (column level)
   - **Expected**: Status updated immediately or on save

6. **Append-Only Bulk Upload**
   - Upload 5 vehicles via CSV
   - Upload another CSV with 3 new vehicles
   - **Expected**: Total 8 vehicles exist, no overwrites

### Edge Cases
1. **Duplicate Registration**
   - Try to create vehicle with existing registration number
   - **Expected**: Error message, creation prevented

2. **Assign Maintained Vehicle**
   - Try to assign vehicle with status "Under Maintenance" to TO
   - **Expected**: Vehicle not in dropdown, or error if forced

3. **Double Assignment**
   - Try to assign vehicle already on active trip to another TO
   - **Expected**: Error message, assignment prevented

### Error Handling
1. **Invalid Data**: Clear error messages for validation failures
2. **Network Error**: Graceful handling, retry option
3. **Permission Denied**: Appropriate error message
4. **Concurrent Edit**: Last-write-wins with warning

## Definition of Done

### Development
- [ ] Code complete and committed
- [ ] All functional requirements implemented
- [ ] Business rules enforced
- [ ] API endpoints documented
- [ ] Unit tests written and passing (coverage > 80%)
- [ ] Integration tests written and passing

### Quality Assurance
- [ ] All acceptance criteria verified
- [ ] All testing scenarios executed
- [ ] Edge cases tested
- [ ] Error handling tested
- [ ] Cross-browser testing complete (Chrome, Firefox, Safari, Edge)
- [ ] Responsive design tested (desktop, tablet)
- [ ] Performance tested (page load < 3s, search < 1s)

### Documentation
- [ ] API documentation updated
- [ ] User guide updated with screenshots
- [ ] Release notes updated

### Deployment
- [ ] Code reviewed and approved
- [ ] Deployed to staging environment
- [ ] Smoke tests passed in staging
- [ ] UAT completed and signed off by Product Owner
- [ ] Deployed to production
- [ ] Post-deployment verification complete

### Training
- [ ] Training materials updated
- [ ] Demo prepared
- [ ] Key users trained

## Notes

### Design Decisions
- **Soft Delete**: Vehicles are never hard-deleted to preserve trip history
- **Status Auto-Update**: Status automatically updates based on trip events to ensure accuracy
- **Tenant Isolation**: Strict tenant isolation implemented at database query level

### Known Limitations
- Phase 1: No automatic document expiry alerts (added in Phase 2)
- Phase 1: No vehicle utilization analytics (added in Phase 2)
- Phase 1: No maintenance scheduling (added in Phase 3)

### Future Enhancements
- Vehicle tracking integration with GPS device ID
- Automatic mileage tracking from GPS
- Predictive maintenance based on usage patterns
- Vehicle performance benchmarking

---

**Story Points**: 8 (increased due to bulk upload and inline editing requirements)  
**Estimated Hours**: 64 hours  
**Assigned To**: Backend Team + Frontend Team  
**Sprint**: Sprint 1  
**Priority**: Critical (Must complete before Trip Assignment)

---

**Source Documents**:
- PRD Section 6.3.1: Entity Registration (Master Setup)
- PRD Section 6.3.2: Bulk Upload & Inline Master Data Management
- PRD Section 6.3.3: Master Tables (CRUD Operation)
- PRD Section 6.3.4: Data Consistency Rules (Referential Control)
- PRD Section 6.6.1: Vehicle Registration

**Last Updated**: February 13, 2026  
**Status**: Updated to align with PRD v1.0

