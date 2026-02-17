---
title: Manage Driver Master Data
story_id: US-002
phase: phase-1
module: Master Data Management
priority: Critical
status: Pending
epic: Master Data Foundation
sprint: Sprint 1
story_points: 5
created: 2026-02-11
updated: 2026-02-13
source_documents:
  - ../../../../source-documents/requirements/PRD_DFMS_v1.0.md
  - ../../../../source-documents/discovery-phase/client-resources/master-data/
related_stories:
  - US-001-vehicle-master-data.md
  - US-003-helper-master-data.md
  - US-018-to-execution-own-fleet.md
dependencies:
  - US-007-user-role-management.md (For user account creation)
tags: [master-data, driver, registration, critical]
---

# US-002: Manage Driver Master Data

## User Story

**As a** Fleet Manager  
**I want to** register and manage driver profiles with their licenses, contact information, and availability status  
**So that** I can assign qualified drivers to transport orders and ensure regulatory compliance

## Business Context

Drivers are critical resources in fleet operations. Proper driver management ensures:
- **Compliance**: Valid licenses, route permits, medical certificates
- **Safety**: Track driver experience, training, incident history
- **Availability**: Know which drivers are available for assignment
- **Performance**: Monitor driver ratings, on-time delivery, fuel efficiency

**Without Proper Driver Management**:
- Risk of assigning unlicensed/unqualified drivers
- Expired license/permit violations → Fines, legal issues
- No visibility into driver availability → Assignment delays
- Cannot track driver performance → No accountability

---

## Acceptance Criteria

### AC-1: Driver Registration

#### AC-1.1: Create Driver Profile (per PRD 6.6.2)
- [ ] System SHALL allow Transport Planner to create new driver profile with mandatory fields:
  - Full Name (as per license)
  - National ID (unique, required)
  - Date of Birth
  - Contact Phone (unique, required)
  - Emergency Contact Name & Phone (Minimum 2 reference contacts per PRD)
  - Current Address (Biodata)
  - Driving License Number (unique, required)
  - License Type/Class (Professional / Non-Professional)
  - License Issue Date (required)
  - License Expiry Date (required)
  - Driver Type (Permanent/Temporary/Own/Vendor) (per PRD)
  - Experience Certificate (upload, optional)
  - Medical Certificate (upload, required)
  - Last Training/Assessment Information (text, optional)
  - Accident History (text, optional)
  - Blood Group
  - Photo (upload, optional)
- [ ] System SHALL validate all mandatory fields before saving
- [ ] System SHALL prevent duplicate entries (NID, Phone, License Number)
- [ ] System SHALL auto-calculate age from date of birth
- [ ] System SHALL flag if driver age < 21 or > 65 (warning, not blocking)
- [ ] System SHALL require minimum 2 reference contacts (per PRD)

#### AC-1.2: Driver Employment Details
- [ ] System SHALL capture employment information:
  - Employment Type (Own Staff / Contractual / Vendor)
  - Join Date
  - Employee ID (if own staff)
  - Vendor ID (if vendor driver, FK to Vendor)
  - Salary/Rate (optional, for own staff)
  - Bank Account Details (for payments)
- [ ] System SHALL link vendor drivers to their vendor profile

#### AC-1.3: License & Certification Management
- [ ] System SHALL allow uploading driver documents:
  - Driving License (front & back)
  - National ID
  - Route Permits (if applicable)
  - Medical Fitness Certificate
  - Training Certificates
- [ ] System SHALL store document expiry dates
- [ ] System SHALL generate alerts 30 days before expiry
- [ ] System SHALL support multiple file formats (PDF, JPG, PNG)
- [ ] System SHALL limit file size to 5 MB per document

### AC-2: Driver Availability Management

#### AC-2.1: Status Tracking
- [ ] System SHALL maintain driver status:
  - Available
  - On Trip (auto-set when assigned to active trip)
  - On Leave
  - Sick Leave
  - Suspended
  - Terminated
- [ ] System SHALL prevent assigning drivers with status other than "Available"
- [ ] System SHALL auto-update status to "On Trip" when TO assigned
- [ ] System SHALL auto-update status to "Available" when trip completed

#### AC-2.2: Leave Management
- [ ] System SHALL allow Fleet Manager to mark driver on leave
- [ ] System SHALL require leave start and end dates
- [ ] System SHALL show leave calendar per driver
- [ ] System SHALL hide drivers on leave from assignment lists

### AC-3: Driver Performance Tracking

#### AC-3.1: Performance Metrics
- [ ] System SHALL track and display:
  - Total trips completed
  - On-time delivery percentage
  - Incident count
  - Average trip rating (if rating feature enabled)
  - Fuel efficiency (km/liter average)
  - Last trip date
- [ ] System SHALL calculate metrics from trip data
- [ ] System SHALL update metrics in real-time after trip completion

#### AC-3.2: Incident History
- [ ] System SHALL link driver to incident reports
- [ ] System SHALL display incident count and severity
- [ ] System SHALL allow filtering drivers by incident history

### AC-4: Driver Search & Filtering

#### AC-4.1: Driver List View
- [ ] System SHALL display all drivers in sortable, filterable list
- [ ] System SHALL show key information per driver:
  - Name, Photo
  - License Number
  - Contact Phone
  - Status
  - License Expiry Date
  - Last Trip Date
  - Rating (if available)
- [ ] System SHALL support search by: Name, Phone, License Number, NID
- [ ] System SHALL filter by: Status, Employment Type, License Expiry (upcoming)
- [ ] System SHALL sort by: Name, Join Date, Last Trip Date, Rating

#### AC-4.2: Available Driver View
- [ ] System SHALL provide "Available Drivers" quick filter
- [ ] System SHALL show only drivers with status "Available"
- [ ] System SHALL exclude drivers with expired licenses
- [ ] System SHALL exclude drivers on leave

### AC-5: Driver Profile Management

#### AC-5.1: View Driver Details
- [ ] System SHALL display comprehensive driver profile:
  - Personal information
  - Employment details
  - License & certifications
  - Uploaded documents
  - Performance metrics
  - Trip history
  - Incident history
- [ ] System SHALL allow downloading uploaded documents
- [ ] System SHALL show document expiry status (valid, expiring soon, expired)

#### AC-5.2: Edit Driver Profile
- [ ] System SHALL allow Fleet Manager to edit driver information
- [ ] System SHALL maintain audit trail of changes
- [ ] System SHALL prevent editing NID, License Number (unique identifiers)
- [ ] System SHALL require confirmation for status changes

#### AC-5.3: Deactivate Driver
- [ ] System SHALL allow marking driver as "Terminated"
- [ ] System SHALL require termination reason and date
- [ ] System SHALL prevent deleting driver records (data integrity)
- [ ] System SHALL hide terminated drivers from active lists
- [ ] System SHALL allow viewing terminated drivers in archive

---

## Functional Requirements

### FR-001: Driver Registration Form
- [Critical] System SHALL provide multi-step registration form:
  - Step 1: Personal Information
  - Step 2: Contact & Emergency Details (Minimum 2 reference contacts)
  - Step 3: License & Certifications
  - Step 4: Employment Details (Driver Type: Permanent/Temporary/Own/Vendor)
  - Step 5: Document Upload (Experience Certificate, Medical Certificate, Training Records)
  - Step 6: Review & Submit
- [Critical] System SHALL validate each step before proceeding
- [High] System SHALL allow saving draft (incomplete profile)
- [High] System SHALL support bulk import via Excel (for initial data migration)

### FR-006: Bulk Upload & Inline Management (per PRD 6.3.2)
- [Critical] Bulk upload option for driver master data
- [Critical] CSV file format (UTF-8 encoded)
- [Critical] Entity-specific CSV templates with mandatory fields marked
- [Critical] Append-only behavior (existing records not overwritten)
- [Critical] Row-level and column-level inline editing
- [Critical] Independent row validation with detailed error reports
- [Critical] Comprehensive audit logging for all bulk operations

### FR-002: Document Management
- [Critical] System SHALL upload files to secure storage (S3/Azure Blob)
- [Critical] System SHALL store file metadata: name, type, size, upload date, expiry date
- [High] System SHALL generate thumbnails for images
- [High] System SHALL scan files for viruses
- [Medium] System SHALL support document versioning (re-upload updated documents)

### FR-003: Expiry Alert System
- [High] System SHALL run daily job to check document expiry dates
- [High] System SHALL generate alerts for documents expiring within 30 days
- [High] System SHALL send notifications to Fleet Manager
- [High] System SHALL display expiry alerts on driver profile
- [Medium] System SHALL send reminder emails to driver (if email available)

### FR-004: Performance Calculation
- [High] System SHALL calculate performance metrics from trip data:
  - On-time delivery % = (On-time trips / Total trips) × 100
  - Incident rate = Incidents / Total trips
  - Avg fuel efficiency = Total km / Total fuel consumed
- [High] System SHALL update metrics after each trip completion
- [Medium] System SHALL provide performance trend charts

### FR-005: Integration with Trip Management
- [Critical] System SHALL provide API for driver availability check
- [Critical] System SHALL update driver status when assigned to trip
- [Critical] System SHALL link driver to trip records
- [High] System SHALL prevent assigning unavailable drivers

---

## Business Rules

### BR-DM-001: Driver Age Requirement
- Driver must be between 21 and 65 years old
- **Enforcement**: Warning during registration, not blocking

### BR-DM-002: License Validity
- Driver cannot be assigned to trip if license expired
- **Enforcement**: System validation during TO assignment

### BR-DM-003: Unique Identifiers
- NID, Phone, License Number must be unique across all drivers
- **Enforcement**: Database unique constraints

### BR-DM-004: Status-Based Assignment
- Only drivers with status "Available" can be assigned to trips
- **Enforcement**: API validation during assignment

### BR-DM-005: Vendor Driver Linkage
- Vendor drivers must be linked to verified vendor
- **Enforcement**: Foreign key constraint

### BR-DM-006: Document Expiry Alert
- Alerts generated 30 days before document expiry
- **Enforcement**: Daily cron job

### BR-DM-007: Data Retention
- Driver records cannot be deleted, only marked "Terminated"
- **Enforcement**: Soft delete implementation

---

## Data Model

```typescript
Driver {
  id: UUID (PK)
  tenant_id: UUID (FK)
  
  // Personal Information
  full_name: String
  national_id: String (unique)
  date_of_birth: Date
  age: Integer (computed)
  blood_group: Enum (A+, A-, B+, B-, O+, O-, AB+, AB-)
  photo_url: String (nullable)
  
  // Contact Information
  phone: String (unique)
  email: String (nullable)
  address: Text
  emergency_contact_name: String
  emergency_contact_phone: String
  
  // License Information
  license_number: String (unique)
  license_type: Enum (Professional, Non_Professional)
  license_issue_date: Date
  license_expiry_date: Date
  
  // Employment Details
  employment_type: Enum (Own_Staff, Contractual, Vendor)
  join_date: Date
  employee_id: String (nullable, for own staff)
  vendor_id: UUID (FK to Vendor, nullable)
  salary: Decimal (nullable)
  bank_account_number: String (nullable)
  bank_name: String (nullable)
  
  // Status
  status: Enum (
    Available,
    On_Trip,
    On_Leave,
    Sick_Leave,
    Suspended,
    Terminated
  )
  termination_date: Date (nullable)
  termination_reason: Text (nullable)
  
  // Performance Metrics (computed)
  total_trips: Integer (default: 0)
  on_time_delivery_percentage: Decimal (nullable)
  incident_count: Integer (default: 0)
  average_rating: Decimal (nullable)
  average_fuel_efficiency: Decimal (nullable, km/liter)
  last_trip_date: Date (nullable)
  
  // Audit
  created_at: Timestamp
  created_by: UUID (FK to User)
  updated_at: Timestamp
  updated_by: UUID (FK to User)
}

DriverDocument {
  id: UUID (PK)
  driver_id: UUID (FK to Driver)
  
  document_type: Enum (
    Driving_License,
    National_ID,
    Route_Permit,
    Medical_Certificate,
    Training_Certificate,
    Other
  )
  
  file_name: String
  file_url: String
  file_size: Integer
  file_type: String
  
  issue_date: Date (nullable)
  expiry_date: Date (nullable)
  is_expired: Boolean (computed)
  days_until_expiry: Integer (computed)
  
  uploaded_at: Timestamp
  uploaded_by: UUID (FK to User)
}

DriverLeave {
  id: UUID (PK)
  driver_id: UUID (FK to Driver)
  
  leave_type: Enum (Annual, Sick, Emergency, Other)
  start_date: Date
  end_date: Date
  reason: Text (nullable)
  
  created_at: Timestamp
  created_by: UUID (FK to User)
}
```

---

## UI/UX Requirements

### Driver Registration Form
```
┌─────────────────────────────────────────┐
│ Register New Driver                     │
├─────────────────────────────────────────┤
│ Step 1 of 6: Personal Information       │
│                                         │
│ Full Name: *                            │
│ [_____________________________]         │
│                                         │
│ National ID / Passport: *               │
│ [_____________________________]         │
│                                         │
│ Date of Birth: *                        │
│ [DD/MM/YYYY]  Age: 35 (auto-calculated)│
│                                         │
│ Blood Group: *                          │
│ [A+                          ▼]         │
│                                         │
│ Upload Photo:                           │
│ [Choose File] driver_photo.jpg          │
│                                         │
│ [Cancel]  [Save Draft]  [Next Step →]  │
└─────────────────────────────────────────┘
```

### Driver List View
```
┌──────────────────────────────────────────────────────────────┐
│ Driver Management                    [+ Add Driver]          │
├──────────────────────────────────────────────────────────────┤
│ Search: [_________]  Status: [All ▼]  Type: [All ▼]         │
│                                                              │
│ 📷 Name          License      Phone        Status   Action  │
│ ──────────────────────────────────────────────────────────  │
│ 👤 Rahim Ahmed   DL-123456   01711-XXX   ✅ Available [View]│
│    Last trip: 2 days ago | Rating: ⭐4.5 | Trips: 125      │
│                                                              │
│ 👤 Karim Mia     DL-234567   01811-XXX   🚛 On Trip   [View]│
│    Current trip: TO-20260211-0042 | ETA: 2 hours           │
│                                                              │
│ 👤 Salim Khan    DL-345678   01911-XXX   ⚠️ Expiring  [View]│
│    License expires in 15 days! | Trips: 89                  │
│                                                              │
│ 👤 Jamal Uddin   DL-456789   01611-XXX   🏖️ On Leave  [View]│
│    Leave until: Feb 15, 2026                                │
└──────────────────────────────────────────────────────────────┘
```

### Driver Profile View
```
┌─────────────────────────────────────────┐
│ Driver Profile: Rahim Ahmed      [Edit] │
├─────────────────────────────────────────┤
│ 👤 [Photo]                              │
│                                         │
│ Personal Information:                   │
│ • NID: 1234567890123                    │
│ • DOB: Jan 15, 1989 (Age: 37)          │
│ • Blood: A+                             │
│ • Phone: 01711-123456                   │
│ • Address: Mirpur, Dhaka                │
│                                         │
│ License Information:                    │
│ • License: DL-123456 (Professional)     │
│ • Expiry: Dec 31, 2026 ✅ Valid        │
│                                         │
│ Employment:                             │
│ • Type: Own Staff                       │
│ • Join Date: Jan 1, 2020                │
│ • Employee ID: EMP-001                  │
│                                         │
│ Performance:                            │
│ • Total Trips: 125                      │
│ • On-time: 92%                          │
│ • Rating: ⭐4.5/5                       │
│ • Incidents: 2 (minor)                  │
│ • Fuel Efficiency: 8.5 km/L             │
│                                         │
│ Documents: (3 uploaded)                 │
│ 📄 Driving License (Valid)              │
│ 📄 Medical Certificate (Expires: Jun 30)│
│ 📄 Route Permit (Valid)                 │
│                                         │
│ [View Trip History] [View Incidents]    │
└─────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
// Create driver
POST /api/v1/drivers
Body: {
  full_name, national_id, date_of_birth, phone,
  license_number, license_type, license_issue_date, license_expiry_date,
  employment_type, join_date, ...
}

// Get all drivers
GET /api/v1/drivers
Query: ?status=Available&employment_type=Own_Staff&search=Rahim

// Get available drivers
GET /api/v1/drivers/available
Response: {drivers: Driver[]}

// Get driver by ID
GET /api/v1/drivers/{driver_id}

// Update driver
PATCH /api/v1/drivers/{driver_id}
Body: {field: value}

// Upload driver document
POST /api/v1/drivers/{driver_id}/documents
Body: FormData (file upload)

// Get driver documents
GET /api/v1/drivers/{driver_id}/documents

// Mark driver on leave
POST /api/v1/drivers/{driver_id}/leave
Body: {leave_type, start_date, end_date, reason}

// Update driver status
PATCH /api/v1/drivers/{driver_id}/status
Body: {status: 'Available' | 'On_Leave' | 'Suspended' | 'Terminated'}

// Get driver performance
GET /api/v1/drivers/{driver_id}/performance
Response: {metrics, trip_history, incident_history}

// Check expiring licenses
GET /api/v1/drivers/expiring-licenses
Query: ?days=30
Response: {drivers: Driver[]}

// Bulk Upload APIs
POST /api/v1/drivers/bulk-upload
Body: {file: CSV file}
Response: {upload_id, total_rows, successful_rows, failed_rows, errors}

GET /api/v1/drivers/bulk-upload/template
Response: CSV template download

PATCH /api/v1/drivers/{id}  - Inline edit (row/column level)
Body: {field_name: new_value}
```

---

## Testing Scenarios

### Happy Path
1. Register new driver with all details → Driver created successfully
2. Upload license document → Document stored, expiry tracked
3. Assign driver to trip → Status auto-updated to "On Trip"
4. Complete trip → Status auto-updated to "Available", metrics updated

### Edge Cases
1. **Duplicate license number**: Error, "License already registered"
2. **Driver age < 21**: Warning, allow registration
3. **Expired license**: Cannot assign to trip
4. **Driver on leave**: Hidden from available driver list

### Error Scenarios
1. **Missing mandatory field**: Validation error
2. **Invalid file type**: "Only PDF, JPG, PNG allowed"
3. **File too large**: "Max file size 5 MB"
4. **Network failure during upload**: Retry mechanism

---

## Dependencies

### Prerequisites
- ✅ US-007: User & Role Management (for user accounts)

### Enables
- → US-018: TO Execution - Own Fleet (requires driver assignment)
- → US-052: Driver Mobile App (requires driver profiles)
- → US-067: Vehicle Utilization Analytics (uses driver data)

---

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Driver CRUD operations functional
- [ ] Document upload and expiry tracking working
- [ ] Status management (Available, On Trip, On Leave, etc.)
- [ ] Performance metrics calculation
- [ ] Expiry alert system (daily cron job)
- [ ] Integration with trip assignment
- [ ] Unit tests: coverage > 85%
- [ ] API documentation complete
- [ ] UI responsive and user-friendly
- [ ] UAT: Fleet Manager sign-off
- [ ] Bulk import tested (Excel)

---

**Story Points**: 5  
**Estimated Hours**: 40 hours  
**Assigned To**: Backend (20h) + Frontend (15h) + QA (5h)  
**Sprint**: Sprint 1  
**Priority**: Critical (Foundation for trip execution)

---

**Source Documents**:
- PRD Section 6.6.2: Driver Master Data
- PRD Section 6.3.2: Bulk Upload & Inline Master Data Management

**Last Updated**: February 13, 2026  
**Status**: Updated to align with PRD v1.0

