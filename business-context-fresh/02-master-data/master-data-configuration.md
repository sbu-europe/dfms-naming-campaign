---
source_document: PRD_DFMS_v1.0.md
source_sections: Master Data Configuration
extracted_date: 2026-02-13
---

## Master Data Configuration

### Entity Registration (Master Setup)

**Version 1.0, Phase - 1**

**User Story:** _As a Tenant Admin, I want to register and manage standardized master data (Drivers, Vehicles, Products, Vendors, Agents, Projects, POIs, etc.) so that all DFMS workflows operate consistently, traceably, and without manual data errors_.

**Acceptance Criteria:**

*   System provides master setup menus for:
    *   Vehicles, Drivers, Helpers, Vendors
    *   Depots / Feed mills / Warehouse / Factory / Port, POIs, Routes
    *   Product Catalogue (from PIM)
    *   QC Checklist templates
*   Each master record has mandatory fields validation and unique ID generation
*   System will support registration of the following **master entities,** aligned with real operational data:
    *   Human & Transport Entities
        *   **Driver Master**
            *   Driver Name
            *   Driving License Number, Class, Expiry
            *   License Type
            *   National ID
            *   Driver Type
                *   Permanent
                *   Temporary
                *   Own
                *   Vendor
            *   Employee ID
            *   Experience Certificate
            *   Biodata
            *   Reference Contact (minimum 2 Contact Information)
            *   Accident History
            *   Joining Date
            *   Contact Number
            *   Medical Certificate
            *   Last Training / Assessment Information
        *   **Helper Master**
            *   Helper Name
            *   Employee ID
            *   National ID
            *   Reference from known contacts
        *   **Driver Supervisor**
            *   Supervisor Name
            *   Employee ID
            *   Contact Number
        *   **Vehicle Master**
            *   Vehicle Type (pre-defined)
                *   Pickup Van
                *   Open Truck
                *   Covered Truck
                *   Nosimon
                *   Auto
                *   Tom Tom
                *   Tractor
            *   Number of Wheels (Numeric Input)
            *   Capacity (Max Load Capacity (Ton) – (Numeric Input)
            *   Allowed Product Category (FG / RM / Both)
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
*   Purchase Price 
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
*   Vehicle operates from this POI 
*   Assigned Garage/Workshop 
*   Primary maintenance location
    *   *   Transport Vendors
            *   Contractual (Direct assignment (no bidding required))
                *   Company Details
                *   Contact Information
                *   Testimonial / Reference from Truck Association
                *   Trade License
                *   BIN
                *   TIN
            *   Non-Contractual (Eligible for bidding)
                *   Company Details
                *   Contact Information
                *   Testimonial / Reference from Truck Association
                *   Trade License
                *   BIN
                *   TIN
        *   Supplier Master
            *   Supplier Name
            *   Supplier Code
            *   Contact Information
            *   Address
        *   Dealer Master
            *   Dealer Name
            *   Dealer Code
            *   Contact Information
            *   Address
    *   Product & Material Entities
        *   Finished Goods (FG)
            *   FG Product Name
            *   FG Product Item Code
            *   Type of Packing (Pallet / Drum / Roll – Text Input)
            *   Pack Size (Numeric Input)
            *   Product Category
            *   Product Sub-Category
            *   Unit of Measure (Bag / Ton / Piece / Carton)
            *   Standard weight per unit
            *   Status
        *   Raw Material (RM)
            *   RM Product Name
            *   RM Product Item Code
            *   Type of Packing (Pallet / Drum / Roll)
            *   Product Category
            *   Product Sub-Category
            *   Unit of Measure (Bag / Ton / Piece / Carton)
            *   Standard weight per unit
            *   Status
        *   QC Checklist
    *   Location & Operational Context
        *   POI (Depot / Feed Mill / Factory / Warehouse with geofence)
*   Master records support status (Active/Inactive) for safe operational control.
*   Only Tenant Admin roles can create/update master entities (RBAC enforced).
*   Inactive master records cannot be used in new transactions but remain available for historical reference.
*   Any master changes must be audit-logged (who/when/what changed)

**Functional Requirements:**

*   \[Critical\] System SHALL provide a centralized **Master Date Configuration module** accessible only to authorized Tenant Admin roles.
*   \[Critical\] System SHALL provide dedicated setup menus for the following master categories:
    *   Vehicles
    *   Drivers
    *   Helpers
    *   Transport Vendors
    *   Suppliers
    *   Dealers
    *   POIs for each Projects (Depots / Feed Mills / Warehouse / Factories / Ports)
    *   Product Catalogue (PIM)
    *   QC Checklist
*   \[Critical\] System SHALL validate mandatory fields before allowing submission.
*   \[Critical\] System SHALL auto-generate unique UUID for each registered entity.
*   \[Critical\] System SHALL
*   \[High\] All create, update, deactivate and delete actions SHALL be audit logged with:
    *   User ID
    *   Timestamp
    *   Entity Type
    *   Field(s) changed
    *   Old value vs new value
*   \[High\] System SHALL detect potential duplicates and warn user before creation
*   \[High\] System SHALL support saving draft entities for later completion

### Bulk Upload & Inline Master Data Management

**Version 1.0, Phase - 1**

**User Story:** _As a Tenant Admin, I want to upload and manage large volumes of Master data (Drivers, Vehicles, Vendors, Products, etc.,) using bulk CSV upload and inline editing so that DFMS can be onboarded quickly and maintained efficiently without repetitive manual entry._

**Acceptance Criteria:**

*   System provides **Bulk Upload Functionality** for all supported master entities:
    *   Drivers
    *   Helpers
    *   Vehicles
    *   Vendors (Contractual & Non-Contractual)
    *   Suppliers
    *   Dealers
    *   POIs (Depot / Feed Mill / Warehouse / Factory / Port)
    *   Products (FG / RM)
    *   QC Checklist
*   Bulk upload supports
    *   Initial bulk creation
    *   Subsequent bulk append (new records added without overwriting existing ones)
*   Bulk upload format:
    *   CSV file (UTF-8 encoded)
    *   System-provided downloadable template per entity
*   System validates each row independently and reports:
    *   Successful rows
    *   Failed rows with error reason
*   Admin can:
    *   Delete individual rows (single record delete)
    *   Edit individual fields AT COLUMN LEVEL
    *   Update records inline without re-uploading the file
*   All bulk and inline operations are audit logged

**Functional Requirements:**

*   \[Critical\] System SHALL provide a Bulk Upload option for each master entity
*   \[Critical\] Bulk upload SHALL support CSV file format only
*   \[Critical\] System SHALL provide entity-specific CSV templates with
    *   Mandatory fields marked
    *   Date type hints
    *   Sample values
*   \[Critical\] Bulk upload SHALL support append-only behavior:
    *   Existing records are NOT overwritten by default
    *   New records are added to the existing master dataset
*   \[Critical\] System SHALL allow uploading additional CSV files to append new master records
*   \[Critical\] System SHALL support inline editing at:
    *   Row level
    *   Column (Field) level
*   \[Critical\] Changes Shall be saved immediately or via explicit **save** action
*   \[Critical\] All bulk upload actions SHALL be audit logged:
    *   Entity type
    *   File name
    *   Uploaded by
    *   Timestamp
    *   Number of rows processed / success / failed
*   \[Critical\] System SHALL allow single-row delete actions SHALL record:
    *   Delete reason
    *   Deleting user
    *   Timestamp
*   \[High\] System SHALL allow bulk upload multiple times for the same entity.
*   \[High\] Upload progress and completion status SHALL be shown to the user

### Master Tables (CRUD Operation)

**Version 1.0, Phase - 1**

**User Story:** _As a Tenant Admin, I want full CRUD capability for master data so that the system stays up to date with changing operational needs_.

**Acceptance Criteria:**

*   Admin can create/Edit/View/Delete:
    *   Vehicles, Drivers, Helpers
    *   Vendors
    *   Depots/Feed mills/Warehouse/Factory, POIs
    *   Routes
    *   Product Categories/items (via PIM)
*   CREATE Operations:
    *   See [section 5.3.1](#_Entity_Registration_\(Master) Entity Registration for ‘Create’ acceptance criteria
*   READ Operations:
    *   Master data list view displays key columns
    *   List view supports search, sort, pagination, and filter by status/type
    *   Default pagination: 25 records per page (adjustable to 50, 100)
    *   Column Sorting: Click column header to sort ascending/descending
    *   Quick Search: Search bar at top searches across all displayed columns
    *   Advanced search panel with filters for: Status, Type, Category, Date range, Created by, Last modified
*   UPDATE Operations:
    *   Inline editing: Click field value to edit simple fields (name, status, phone)
    *   Edit form: Click ‘Edit’ button to open full form for complex operations
    *   Field validation: Same rules as create, displayed in real-time.
    *   Change confirmation: Dialog shown for critical field changes
    *   Audit log entry: Every update logged with: User ID, Timestamp, Field name, Old value, New value
    *   Cascade update: Changes propagate to dependent records where applicable
*   DELETE Operations:
    *   Soft delete (default): Record marked as "Inactive", not removed from database
    *   Hard delete: Available only to Super Admin with two-step confirmation
    *   Dependency check: System prevents delete if active dependencies exist
    *   Delete action shows dependency warning when master is already used.
    *   Hard delete is blocked is the entity is referenced by PR/TR/TO/Trips/QC records
    *   Cascade delete: Option to delete entity and all dependencies (if allowed)
    *   Delete audit log: Timestamp, admin ID, entity details, reason logged
*   Common across all operations:
    *   Only users with "Master Data Admin" role can perform CRUD operations
    *   Depot Managers can only view entities in their depot
    *   All operations respect RBAC permissions
    *   Success/error messages displayed prominently with appropriate icons
    *   Mobile-responsive interface for all CRUD operations

**Functional Requirements:**

*   \[Critical\] Admins SHALL create, edit, delete master data for all entity types.
*   \[Critical\] System SHALL maintain referential integrity (see section 5.3.3).
*   \[Critical\] List view SHALL support pagination (25/50/100 per page).
*   \[Critical\] List view SHALL support column sorting and full-text search.
*   \[Critical\] System SHALL prevent deletion of records with active dependencies.
*   \[Critical\] All CRUD operations SHALL be logged in audit trail.
*   \[High\] Advanced filtering SHALL be available (status, type, date range).
*   \[High\] Export to Excel/ CSV SHALL be available with applied filters.
*   \[High\] Soft delete SHALL be default behavior preserving audit history.
*   \[High\] Concurrent edit detection SHALL prevent data loss from simultaneous updates.
*   \[Medium\] Restore function SHALL be available for soft-deleted records (90 days).
*   \[Medium\] Approval workflow SHALL be enforced for sensitive field updates.

### Data Consistency Rules (Referential Control)

**Version 1.0, Phase – 1**

**User Story:** _As a System Admin, I want referential integrity rules so that wrong master relationships do not break operational workflows_.

**Acceptance Criteria:**

*   System validates dependencies like:
    *   Route must map to valid Source POI + Destination POI
    *   Drivers/helpers must be valid and active before assignment
    *   Vendor vehicle records must belong to approved vendor profiles
    *   Vehicle must be assigned to existing active depot
    *   Product must belong to valid category
    *   User must have valid role assignment
*   Dropdown/lookup fields only show valid options:
    *   Only active entities displayed in dropdowns
    *   Inactive/deleted entities excluded from selection lists
    *   Depot dropdown filtered by user permissions
    *   Vehicle dropdown shows only vehicles available for assignment
*   System provides detailed error messages for constraint violations:
    *   "Cannot delete Depot ABC - 5 vehicles and 12 users currently assigned"
    *   "Cannot delete Product Category Feed - 23 products exist under this category"
    *   "Cannot modify Route XY - 3 approved TRs currently reference this route"
*   System prevents saving inconsistent mappings (with error message indicating root cause)
*   A route cannot exist without valid POIs
*   A POI cannot be deactivated if it is referenced in open PR/TR/TO/Trip
*   Product types must match configured allowed UOM and QC mapping rules

**Functional Requirements:**

*   \[Critical\] System SHALL validate all foreign key relationships before saving records.
*   \[Critical\] System SHALL prevent deletion of parent records with active child records.
*   \[Critical\] Dropdown/lookup fields SHALL only display valid, active related entities.
*   \[Critical\] Error messages SHALL clearly indicate constraint violations with entity details.
*   \[Medium\] System SHALL maintain relationship history for audit purposes.
