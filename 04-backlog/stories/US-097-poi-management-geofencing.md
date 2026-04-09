---
title: POI Management & Geofencing
story_id: US-097
phase: phase-1
module: Master Data Management
priority: Critical
status: Pending
epic: POI & Geofencing
epic_id: EPIC-004
epic_name: POI Management & Geofencing
sprint: Sprint 3
story_points: 13
created: 2026-03-06
updated: 2026-03-06
source_documents:
  - ../../../../01-source/01-prd/PRD_DFMS_v1.0.md
  - ../../../03-module-specifications/02-master-data/poi-management.md
related_stories:
  - US-096-route-supplier-dealer-master-data.md
  - US-014-capacity-checking.md
  - US-026-realtime-map-dashboard.md
  - US-035-gate-in-source.md
dependencies:
  - US-004-role-hierarchy.md
tags: [poi, geofencing, master-data, gps, capacity, admin, critical]
---

# US-097: POI Management & Geofencing

## User Story

**As a** Tenant Admin  
**I want to** define and manage Points of Interest (POIs) with GPS coordinates, geofence boundaries, and storage capacity  
**So that** all DFMS workflows — requisitions, transport orders, gate operations, GPS tracking, and capacity planning — can reference accurate, real-world operational locations

## Business Context

A POI (Point of Interest) is any physical operational location in the DFMS network — a Depot, Feed Mill, Factory, Warehouse, Port, or Dealer location. Every key workflow in DFMS depends on POI master data:

- **Product Requisitions (PR)** reference source and destination POIs for stock and capacity checks
- **Transport Orders (TO)** use POI-to-POI routes for trip planning
- **Gate Management** validates vehicle arrival against the correct destination POI
- **GPS Tracking** uses POI geofence boundaries to automatically detect vehicle arrival and departure, calculate dwell time, and trigger workflow events
- **Capacity Planning** tracks total storage capacity, current stock, free capacity, and projected utilization per POI

Without POI master data, none of the operational workflows can function. This is a Tier 2 (Master Data) dependency for the entire platform.

**PRD Source Sections:**
- **6.5.1** Point of Interest (POI) Setup
- **6.5.2** POI CRUD Operations
- **6.5.5** GPS Tracking & Monitoring (POI integration)
- **6.5.6** Geofencing and POI Tracking
- **6.5.7** POI Geofencing Boundary Management
- **6.5.8** Vehicle Arrival Tracking at POI

---

## Acceptance Criteria

### AC-1: POI Creation (per PRD 6.5.1)
- [ ] System SHALL provide a POI Setup module accessible to Tenant Admin users only (RBAC)
- [ ] Admin SHALL be able to create a POI with:
  - **POI Name** (required, unique within tenant, 3–100 characters)
  - **POI Type** (required, select from):
    - Finished Feed Depot
    - Feed Mill
    - Feed Dealer
    - Silage Project
    - Raw Material Warehouse
    - Factory
    - Port
    - Others
  - **Address / Area** (required, full text)
  - **GPS Coordinates** (required):
    - Latitude (–90 to 90)
    - Longitude (–180 to 180)
  - **Geofence Radius** (required, 50–1000 meters, default 100m)
  - **In-Charge Person Name** (optional)
  - **Contact Number** (optional, phone format validation)
  - **Total Storage Capacity** (required, numeric in metric tons — used as 'Total Capacity' in PR stock view)
  - **Status**: Active / Inactive (default Active)
- [ ] System SHALL validate GPS coordinates within valid range
- [ ] POI name SHALL be unique within tenant
- [ ] System SHALL display the new POI on an interactive map with its geofence circle immediately after creation

### AC-2: POI CRUD Operations (per PRD 6.5.2)
- [ ] **READ**: Paginated list view displaying: POI Name, Type, Address, Coordinates, Geofence Radius, Capacity, Status, Actions
  - Search, sort, filter by Type and Status
  - Default pagination 25 records (adjustable to 50, 100)
- [ ] **UPDATE**: Inline editing for simple fields; full edit form for all fields
  - Coordinate changes SHALL update geofence boundaries in GPS system immediately
  - Radius changes SHALL recalculate vehicle arrival/departure thresholds
  - Capacity changes SHALL trigger re-validation of pending PRs
  - Status change to Inactive:
    - Blocks POI from use in new PR / TR / TO
    - Active trips referencing this POI SHALL NOT be affected
- [ ] **DELETE**:
  - Soft delete (default): Mark Inactive
  - Hard delete: Blocked if POI is referenced in any PR / TR / TO / Trip / Gate record
  - Confirmation dialog required for deactivation
- [ ] Every create, update, and deactivate action SHALL be audit logged: User ID, Timestamp, Field(s) changed, Old/New values

### AC-3: Geofencing Configuration (per PRD 6.5.6, 6.5.7)
- [ ] Each active POI SHALL have exactly one active geofence boundary (radius-based, in meters)
- [ ] Geofence radius SHALL be configurable between 50–1000 meters per POI
- [ ] Geofence is linked to POI master data — changes take effect immediately for live trips
- [ ] Only Tenant Admin or authorized configuration users can modify geofence settings
- [ ] Geofence deletion/modification SHALL be audit logged
- [ ] System SHALL display all active POI geofences as colored radius circles on the map

### AC-4: Vehicle Arrival & Departure Detection (per PRD 6.5.6, 6.5.8)
- [ ] System SHALL detect vehicle **entry** into a POI geofence using GPS data
- [ ] System SHALL detect vehicle **exit** from a POI geofence using GPS data
- [ ] Arrival and departure timestamps SHALL be automatically logged
- [ ] Each arrival/departure event SHALL be linked to: Trip ID, TO ID, Vehicle ID, POI ID
- [ ] **Dwell time** SHALL be calculated: Duration between arrival and departure timestamps
- [ ] Dwell time threshold violations SHALL be flagged for reporting (configurable threshold)
- [ ] Arrival/departure events SHALL be visible in the trip timeline

### AC-5: Capacity Tracking (per PRD 6.5.1)
- [ ] Each POI SHALL track:
  - **Total Capacity** (set at master data level, metric tons)
  - **Current Stock** (updated from PR / TR / Trip completions)
  - **Free Capacity** (Total – Current Stock)
  - **Projected Capacity** (after pending PRs are applied)
- [ ] Capacity data SHALL be visible in:
  - POI detail view
  - Product Requisition creation form (source and destination capacity snapshot)
- [ ] Capacity threshold warnings (80%, 90%) SHALL be configurable at system level

### AC-6: Active POI Enforcement
- [ ] Only Active POIs SHALL be selectable in:
  - Product Requisition (Source / Destination)
  - Transport Requisition (TR)
  - Transport Order (TO)
  - Command Center assignment
  - QC and Gate workflows
- [ ] Inactive POI records SHALL remain in system for historical reference

---

## Functional Requirements

### FR-001: POI Setup & CRUD (per PRD 6.5.1, 6.5.2)
- [Critical] Centralized POI Setup module, admin-only access (RBAC)
- [Critical] POI creation with name, type, GPS coordinates, geofence radius, capacity, status
- [Critical] GPS coordinate validation (-90/90, -180/180)
- [Critical] Interactive map display with geofence circles
- [Critical] Active/Inactive status control enforced across all dependent workflows
- [High] Bulk CSV upload for POIs
- [High] Duplicate POI name detection within tenant

### FR-002: Geofencing (per PRD 6.5.6, 6.5.7)
- [Critical] Radius-based geofence per POI (50–1000m, configurable)
- [Critical] Geofence integrated with GPS tracking system
- [Critical] Immediate effect of geofence changes on live trips
- [High] Map visualisation of all geofence boundaries

### FR-003: Arrival/Departure Tracking (per PRD 6.5.8)
- [Critical] Automatic vehicle entry/exit detection from GPS data
- [Critical] Event logging with Trip ID, TO ID, Vehicle ID, POI ID, timestamp
- [Critical] Dwell time calculation per POI per trip
- [High] Dwell time threshold violation flagging

### FR-004: Capacity Management (per PRD 6.5.1)
- [Critical] Total / Current / Free / Projected capacity per POI
- [Critical] Capacity updated by PR / TR / Trip completion events
- [High] Configurable threshold warnings (80%, 90%)
- [Medium] Capacity visible in PR creation form

---

## Data Model

```typescript
interface POI {
  id: UUID;                          // Auto-generated PK
  tenant_id: UUID;                   // Tenant isolation

  // Identity
  poi_name: string;                  // Unique within tenant
  poi_type: Enum(
    'FINISHED_FEED_DEPOT' |
    'FEED_MILL' |
    'FEED_DEALER' |
    'SILAGE_PROJECT' |
    'RAW_MATERIAL_WAREHOUSE' |
    'FACTORY' |
    'PORT' |
    'OTHERS'
  );
  address: string;

  // Location & Geofence
  latitude: Decimal;                 // -90 to 90
  longitude: Decimal;                // -180 to 180
  geofence_radius_meters: Integer;   // 50–1000, default 100

  // Capacity
  total_capacity_tons: Decimal;      // Set by admin
  current_stock_tons: Decimal;       // Computed from operations (default 0)
  free_capacity_tons: Decimal;       // Computed: total - current_stock
  projected_capacity_tons?: Decimal; // Computed: after pending PRs

  // Contact
  incharge_person?: string;
  contact_number?: string;

  // Status
  status: Enum('ACTIVE' | 'INACTIVE');

  // Audit
  created_at: Timestamp;
  created_by: UUID;
  updated_at: Timestamp;
  updated_by: UUID;
  deactivated_at?: Timestamp;
  deactivated_by?: UUID;
  deactivation_reason?: string;
}

interface POIGeofenceEvent {
  id: UUID;
  tenant_id: UUID;
  poi_id: UUID;                      // FK → POI
  trip_id: UUID;                     // FK → Trip
  to_id: UUID;                       // FK → Transport Order
  vehicle_id: UUID;                  // FK → Vehicle

  event_type: Enum('ARRIVAL' | 'DEPARTURE');
  event_timestamp: Timestamp;        // Auto-logged from GPS data

  dwell_time_minutes?: Integer;      // Computed on departure (departure - arrival)
  dwell_threshold_breached: Boolean; // Flag if dwell > configured threshold

  gps_latitude: Decimal;
  gps_longitude: Decimal;
}
```

---

## UI/UX Requirements

### POI List View
```
┌──────────────────────────────────────────────────────────────────────┐
│ Master Data > Points of Interest        [+ Add POI] [Map View] [↑CSV]│
├──────────────────────────────────────────────────────────────────────┤
│ Search: [________________]  Type: [All ▼]  Status: [Active ▼]        │
├──────────────────────────────────────────────────────────────────────┤
│ POI Name          Type              Capacity   Radius    Status      │
│ ──────────────────────────────────────────────────────────────────  │
│ Dhaka Depot       Finished Feed Dep 500 tons   200m      ✅ Active   │
│ Chittagong Port   Port              1200 tons  500m      ✅ Active   │
│ Sylhet Feed Mill  Feed Mill         800 tons   150m      ✅ Active   │
│                                                                      │
│ Showing 1-25 of 12        [< Prev]  Page 1 of 1  [Next >]           │
└──────────────────────────────────────────────────────────────────────┘
```

### POI Creation Form
```
┌──────────────────────────────────────────────────┐
│ Add Point of Interest                            │
├──────────────────────────────────────────────────┤
│ POI Name: *                                      │
│ [_________________________________]              │
│                                                  │
│ POI Type: *                                      │
│ [Finished Feed Depot             ▼]              │
│                                                  │
│ Address: *                                       │
│ [_________________________________]              │
│                                                  │
│ GPS Coordinates: *                               │
│ Latitude:  [23.8103  ]  Longitude: [90.4125  ]   │
│                                                  │
│ Geofence Radius (m): *  [  200  ]  (50–1000m)    │
│                                                  │
│ [       Map Preview with geofence circle       ] │
│                                                  │
│ Total Storage Capacity (tons): *                 │
│ [  500  ]                                        │
│                                                  │
│ In-Charge Person:    Contact:                    │
│ [______________]     [______________]            │
│                                                  │
│ Status: ● Active  ○ Inactive                     │
│                                                  │
│ [Cancel]                        [Save POI]       │
└──────────────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
// POI CRUD
POST   /api/v1/pois
GET    /api/v1/pois?type=FEED_MILL&status=ACTIVE
GET    /api/v1/pois/{poi_id}
PATCH  /api/v1/pois/{poi_id}
DELETE /api/v1/pois/{poi_id}
PATCH  /api/v1/pois/{poi_id}/status

// Capacity
GET    /api/v1/pois/{poi_id}/capacity          // Current stock, free, projected
PATCH  /api/v1/pois/{poi_id}/capacity          // Update stock (called by TR/Trip events)

// Geofence Events
GET    /api/v1/pois/{poi_id}/geofence-events?trip_id=&from=&to=
POST   /api/v1/pois/{poi_id}/geofence-events   // GPS system triggers on arrival/departure

// Bulk Upload
GET    /api/v1/pois/bulk-upload/template
POST   /api/v1/pois/bulk-upload
```

---

## Business Rules

### BR-POI-001: Unique POI Name
- POI name must be unique within a tenant
- **Enforcement**: Database unique constraint (tenant_id + poi_name)

### BR-POI-002: Active-Only Selection
- Only Active POIs can be selected in PR / TR / TO / Gate / Command Center workflows
- **Enforcement**: Filtered queries (status = ACTIVE) in all dependent modules

### BR-POI-003: Delete Restriction
- Hard delete blocked if POI is referenced in any PR / TR / TO / Trip / Gate record
- **Enforcement**: Dependency check API before delete

### BR-POI-004: Geofence Radius Range
- Geofence radius must be between 50 and 1000 meters
- **Enforcement**: API and form-level validation

### BR-POI-005: Capacity Integrity
- Current stock cannot exceed total capacity (warning shown, not a hard block)
- Free capacity = total_capacity – current_stock (computed field, never manually set)
- **Enforcement**: Computed on read; threshold warning at 80% and 90% utilisation

---

## Dependencies

### Prerequisites
- US-004: Role Hierarchy (RBAC — admin-only access)

### Enables
- US-096: Route Master Data (Routes reference Source/Destination POIs as FK)
- US-010, US-013, US-014: Product Requisition (source/destination POI selection, capacity checks)
- US-015–US-020: Transport Order Management (TO source/destination reference POIs)
- US-035–US-038, US-063–US-067: Gate Management (POI-specific gate workflows)
- US-026, US-043: Command Center & Real-time Monitoring (POI geofence zones on map)
- US-021: Trip Lifecycle (geofence arrival/departure events in trip timeline)

---

## Definition of Done
- [ ] POI CRUD fully functional (create, read, update, soft/hard delete)
- [ ] GPS coordinate validation working
- [ ] Interactive map with geofence circles rendering correctly
- [ ] Geofence radius configurable per POI (50–1000m)
- [ ] Arrival/departure detection integrated with GPS tracking module
- [ ] Dwell time calculation and threshold flagging working
- [ ] Capacity tracking (total, current, free, projected) accurate
- [ ] Active/Inactive control enforced in all dependent workflows
- [ ] Hard delete restriction working
- [ ] Bulk CSV upload working
- [ ] All actions audit logged
- [ ] Unit tests > 85%
- [ ] UAT approved by Tenant Admin and Transport Planner personas

---

**Story Points**: 13
**Estimated Hours**: 104 hours
**Sprint**: Sprint 3
**Priority**: Critical (Blocker for all operational workflows)

---

**PRD References**:
- Section 6.5.1: Point of Interest (POI) Setup
- Section 6.5.2: POI CRUD Operations
- Section 6.5.5: GPS Tracking & Monitoring
- Section 6.5.6: Geofencing and POI Tracking
- Section 6.5.7: POI Geofencing Boundary Management
- Section 6.5.8: Vehicle Arrival Tracking at POI

**Last Updated**: 2026-03-06
