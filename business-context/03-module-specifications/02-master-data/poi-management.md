---
source_document: PRD_DFMS_v1.0.md
source_sections: POI (Point of Interest) - Distribution Hub / Depot / Feed Mill Management & Geofencing
extracted_date: 2026-02-13
---

## POI (Point of Interest) - Distribution Hub / Depot / Feed Mill Management & Geofencing

### Point Of Interest (POI) Setup (Point Definition)

**Version 1.0, Phase 1**

**User Story:** _As an Tenant Admin, I want to define POIs (depots/feed mill/ warehouses/factories) so that DFMS can manage requisitions, routing, geofencing, and Storage capacity tracking_.

**Acceptance Criteria:**

*   Admin can create POI with:
    *   POI (Project) name (required, unique per tenant, 3-100 characters)
    *   POI Type
        *   Finished Feed Depot,
        *   Feed mill,
        *   Feed Dealer,
        *   Silage Project,
        *   Raw Material Warehouse,
        *   Factory,
        *   Others
    *   Address/area (full text address)
    *   Geofence Coordinates:
        *   Latitude (required, -90 to 90),
        *   longitude (required, -180 to 180)
            *   Manual entry: Type latitude and longitude
        *   Geofence radius (Meters) (required, 50-1000m range, default 100m)
    *   In-Charge Person Name (optional)
    *   Contact Number (optional, phone format validation)
    *   Total storage capacity (considered ‘Total Capacity’ for PR stock view) (numeric in metric tons)
    *   Status (Active/Inactive, default Active)
*   POI record shows operational status (Active/Inactive)
*   POI capacity is tracked as ‘Total Capacity’ (not bin-level WMS)
*   POI must be active to be used in PR/TR/TO

**Functional Requirements:**

*   \[Critical\] System SHALL provide a POI Setup module accessible to Tenant Admin users
*   \[Critical\] System SHALL allow creation of POIs with mandatory fields:
    *   POI Name
    *   POI Type
    *   Location
    *   Geofence Radius
    *   Total Storage Capacity
*   \[Critical\] Admin CAN define POIs with Name, Type, GPS Coordinates, Radius.
*   \[Critical\] System SHALL validate GPS coordinates within valid range (-90/90, -180/180).
*   \[Critical\] POI name SHALL be unique within tenant.
*   \[Critical\] System SHALL display POIs on interactive map with geofencing circles.
*   \[Critical\] POI geofence SHALL be used by:
    *   GPS Tracking
    *   Vehicle arrival detection
    *   Dwell time tracking
*   \[Critical\] POI geofence data SHALL integrate with:
    *   Transport Order (TO) execution
    *   Trip monitoring
    *   Gate-in / Get-out validation
*   \[Critical\] Only Active POIs SHALL be selectable in:
    *   Product Requisition (Source / Destination)
    *   Transport Requisition (TR)
    *   Transport Order (TO)
    *   Destination Breakdown Plan
    *   Command Center assignment, QC and Gate workflows
*   \[High\] System SHALL calculate and expose:
    *   Current Stock (from PR / TR / Trip updates)
    *   Free Capacity
    *   Projected Capacity (post-PR submission)
*   \[High\] System SHALL support CRUD operations for POI management in real-time.
*   \[High\] Geofencing radius SHALL be configurable between 50-1000 meters.
*   \[High\] System SHALL prevent deletion of POIs with active dependencies.
*   \[Medium\] Capacity threshold (e.g., 80%, 90%) SHALL be configurable at system level

### POI CRUD Operations

**Version 1.0, Phase - 1**

**User Story:** _As an Admin, I want to add/edit/remove POIs so that the system reflects real operational sites_.

**Acceptance Criteria:**

*   Create, edit, deactivate POIs from POI management.
*   CREATE Operations (See [section 5.5.1](#_POI_Setup_\(Point) for detailed create criteria)
*   READ Operations – POI List View:
    *   Table displays columns: POI Name, Type, Address, Coordinates, Radius, Status, Actions
    *   Default Sort: Alphabetical by POI name
    *   Quick Search bar: Search by name, type, or address (real-time filtering)
*   READ Operations – Detailed View:
    *   Full POI information displayed in structured layout
    *   Sections: Basic information, Location Details, Contact Information, Capacity & Operations, Related Data
    *   Related data tabs:
        *   Active Inventory (Current stock at this POI)
        *   Pending PRs (requisitions involving this POI)
        *   Recent Trips (last 30 days of vehicle visits)
        *   Assigned Users (users mapped to this POI)
*   UPDATE Operations:
    *   Edit button available in list view, and detail view
    *   Edit form pre-populated with current values
    *   Update audit log entry created with
        *   User ID, Timestamp, IP address
        *   Field name, Old value, New value (for each changed field)
        *   Update reason/comments
*   UPDATE Operations – Cascade Effects:
    *   Coordinates changes update geofence boundaries in GPS system
    *   Radius changes recalculate vehicle arrival/departure events
    *   Capacity changes trigger re-validation of pending PRs
    *   Status change to Inactive:
        *   Warning if active inventory exists
        *   Warning if pending PRs reference this POI
        *   Option to reassign PRs to alternate POI
        *   POI removed from dropdown selections in forms
*   DELETE Operations:
    *   Delete button available with warning icon
    *   Dependency check performed before allowing delete:
        *   Active inventory at POI
        *   Pending or active PRs referencing POI
        *   Active vehicle trips to/from POI
        *   Users assigned to POI
        *   Historical trip records (prevents hard delete)
    *   Warning dialog displays:
        *   POI name and type
        *   Dependency count by category
        *   Detailed list of dependencies (expandable)
    *   Delete Options:
        *   Soft Delete (mark as Inactive): Always available
            *   Soft delete confirmation requires mandatory deletion reason
        *   Hard Delete (permanent removal): Only if zero dependency
            *   Hard delete confirmation requires Super admin role verification and mandatory deletion reason
*   View POI list with filters (type, status).
*   Update logs show “who updated” and “what changed”)
*   POI deletion is blocked if referenced or in use; only deactivation is allowed.
*   Capacity edits require audit logging because they affect stock threshold logic.

**Functional Requirements:**

*   \[Critical\] System SHALL allow users to add, edit, and remove POIs in real-time.
*   \[Critical\] All CRUD operations SHALL be logged in audit trail with user, timestamp, changes.
*   \[High\] System SHALL perform dependency check before allowing POI deletion.
*   \[High\] POI map view SHALL display all POIs with color-coded markers by type.
*   \[Low\] POI list view SHALL support pagination.
*   \[Low\] POI list view SHALL support sorting by any column.

### POI Classification (Inbound/Outbound/Neutral)

**Version 1.0, Phase - 1**

**User Story:** _As an Admin, I want POI classification so that routing and operational dashboards can auto-segment POIs_.

**Acceptance Criteria:**

*   POI Classification Types:
    *   Inbound: POIs that primarily receive goods (e.g., Factories receiving raw materials, Warehouse receiving from suppliers)
    *   Outbound: POIs that primarily dispatch goods (e.g., Factories shipping finished goods, Depots distributing to dealers
    *   Neutral: POIs that both receive and dispatch (e.g., Distribution centers, Transfer hubs)
*   Classification assignment during POI creation/update:
    *   Classification field: Required dropdown with three options (Inbound/Outbound/Neutral)
    *   Default classification based on POI Type:
        *   Factory: Default = Outbound (finished goods production)
        *   Depot: Default = Neutral (receives and distributes)
        *   Feed mill: Default = Inbound (receives raw materials primarily)
        *   Port: Default = Inbound (receives raw materials primarily)
        *   Warehouse: Default = Neutral (storage and distribution)
        *   Distribution Center: Default = Neutral (hub operations)
    *   Admin can override default classification

**Functional Requirements:**

*   \[Critical\] Each POI SHALL be classified as Inbound, Outbound, or Neutral for routing logic.
*   \[Critical\] Classification SHALL be mandatory field for POI Creation.

### Integration & Linkage – Map Layer Integration (TO + Live GPS)

**Version 1.0, Phase - 1**

**User Story:** _As a Transport Planner / Operations user, I want POIs integrated with TO creation and live GPS monitoring so that vehicle movement can be tracked against operational locations (arrival, departure, dwell time)_.

**Acceptance Criteria:**

*   Integration with live GPS monitoring:
    *   Vehicle tracking dashboard displays:
        *   All active POIs on map
        *   Geofencing boundaries as colored zones
        *   Vehicle positions relative to POIs
        *   Active trips with source/destination POIs highlighted
    *   Geofence event triggers:
        *   Vehicle enters POI geofence: ‘Arrival’ event logged
        *   Vehicle exits POI geofence: ‘Departure’ event logged
        *   Dwell time calculated: Duration between arrival and departure
*   Linkage with Transport Order (TO) Creation:
    *   TO creation form includes POI selection for:
        *   Pickup location (Source POI – Dropdown)
        *   Delivery Location (Destination POI – Dropdown)
*   Linkage with Product Requisition (PR) Creation:
    *   PR form pre-populates POI information from Product Requisition module
    *   Real-time stock level displayed for source POI
    *   Real-time capacity availability for destination POI
*   POI-Vehicle Relationship Tracking:
    *   Current presence tracking:
        *   List of vehicles currently within each POI geofence
        *   Vehicle entry time and duration at POI

**Functional Requirements:**

*   \[Critical\] POI data SHALL be integrated with TO creation form for source/destination.
*   \[Critical\] System SHALL integrate POI geofencing with live GPS vehicle tracking.
*   \[High\] Vehicle entry/exit from POI geofence SHALL trigger automatic event logging.
*   \[High\] System SHALL track dwell time (duration between Arrived/Departed for source and destination POIs)
