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
updated: 2026-02-11
source_documents:
  - ../../../../source-documents/requirements/PRD_DFMS_v1.0.docx
related_stories:
  - US-002-driver-registration.md
  - US-015-fleet-health-dashboard.md
  - US-020-to-execution-own-fleet.md
dependencies: []
tags: [master-data, vehicle, fleet, mvp, critical]
---

# US-001: Vehicle Master Data Management

## User Story

**As a** Transport Planner  
**I want to** maintain comprehensive vehicle master data  
**So that** I can effectively manage fleet operations and make informed assignment decisions

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
- [ ] System SHALL track vehicle attributes: registration number, type, capacity, ownership, depot
- [ ] System SHALL support vehicle status tracking (Available, Active, Idle, Scheduled/Parked, Under Maintenance)
- [ ] System SHALL link vehicles with TO, Trip, Driver, Fuel, and maintenance records
- [ ] System SHALL prevent vehicles under maintenance from being assigned to trips
- [ ] System SHALL enforce one vehicle per active trip constraint
- [ ] System SHALL provide CRUD operations for vehicle master data

### Should Have (High)
- [ ] System SHOULD allow bulk upload of vehicle data via CSV
- [ ] System SHOULD support vehicle categorization by type (Truck, Van, Pickup, etc.)
- [ ] System SHOULD track vehicle ownership (Own, Leased, Vendor)
- [ ] System SHOULD allow filtering and searching vehicles by multiple criteria
- [ ] System SHOULD display vehicle history (trips, maintenance, incidents)
- [ ] System SHOULD support vehicle activation/deactivation

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

**Mandatory Fields**:
- Vehicle Registration Number (unique)
- Vehicle Type (dropdown: Truck, Van, Pickup, etc.)
- Capacity (tonnage)
- Ownership (Own, Leased, Vendor)
- Home Depot (POI)
- Status (default: Available)

**Optional Fields**:
- Make/Model
- Year
- Color
- VIN Number
- License Plate Number
- Insurance Details
- Fitness Certificate
- Purchase Date
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

### FR-004: Vehicle Bulk Operations
- [High] System SHALL support bulk upload via CSV template
- [High] System SHALL validate CSV data before import
- [High] System SHALL provide detailed error report for failed imports
- [Medium] System SHALL support bulk status updates

## Business Rules

### BR-001: Unique Registration
- **Rule**: Each vehicle must have unique registration number within tenant
- **Validation**: System SHALL prevent duplicate registration numbers
- **Error Message**: "Vehicle with registration number [XXX] already exists"

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

## Data Model

```
Vehicle {
  id: UUID (PK, auto-generated)
  tenant_id: UUID (FK)
  registration_number: String (unique, indexed)
  vehicle_type: Enum (Truck, Van, Pickup, Tanker, etc.)
  capacity_tonnage: Decimal
  ownership: Enum (Own, Leased, Vendor)
  home_depot_id: UUID (FK to POI)
  status: Enum (Available, Active, Idle, Scheduled, Under_Maintenance)
  make: String (optional)
  model: String (optional)
  year: Integer (optional)
  vin: String (optional)
  license_plate: String (optional)
  insurance_number: String (optional)
  insurance_expiry: Date (optional)
  fitness_expiry: Date (optional)
  purchase_date: Date (optional)
  is_active: Boolean (default: true)
  notes: Text (optional)
  created_at: Timestamp
  created_by: UUID (FK to User)
  updated_at: Timestamp
  updated_by: UUID (FK to User)
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
   - **Expected**: All 10 vehicles created successfully

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

**Story Points**: 5  
**Estimated Hours**: 40 hours  
**Assigned To**: Backend Team + Frontend Team  
**Sprint**: Sprint 1  
**Priority**: Critical (Must complete before Trip Assignment)

