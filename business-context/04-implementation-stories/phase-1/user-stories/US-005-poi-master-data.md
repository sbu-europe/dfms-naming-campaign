---
title: Manage POI (Point of Interest) Master Data
story_id: US-005
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
  - ../../../03-prd-reference/02-master-data/poi-management.md
related_stories:
  - US-009-fg-transfer-requisition.md
  - US-017-to-creation.md
dependencies:
  - US-007-user-role-management.md
tags: [master-data, poi, location, warehouse, depot, geofencing, critical]
---

# US-005: Manage POI (Point of Interest) Master Data

## User Story

**As a** System Administrator  
**I want to** register and manage Points of Interest (warehouses, depots, farms, distribution centers, ports) with their location details and operational information  
**So that** transport requisitions and orders can specify accurate source and destination locations

## Business Context

POIs are critical locations in the supply chain:
- **Warehouses**: Storage facilities for finished goods and raw materials
- **Depots**: Distribution centers for regional delivery
- **Farms**: Production sites (e.g., poultry farms)
- **Ports**: Import/export points for raw materials
- **Dealer Locations**: Customer delivery points
- **Supplier Locations**: Raw material pickup points

Proper POI management ensures:
- Accurate route planning and distance calculation
- Correct loading/unloading location assignment
- Geofencing and arrival verification
- Operational hours tracking

---

## Acceptance Criteria

### AC-1: POI Registration
- [ ] System SHALL allow creating POI with:
  - POI Name (required, unique per tenant, 3-100 characters)
  - POI Type (required):
    - Finished Feed Depot
    - Feed mill
    - Feed Dealer
    - Silage Project
    - Raw Material Warehouse
    - Factory
    - Others
  - POI Classification (required): Inbound / Outbound / Neutral
  - Address (full text address)
  - GPS Coordinates (required):
    - Latitude (required, -90 to 90)
    - Longitude (required, -180 to 180)
    - Manual entry or map selection
  - Geofence Radius (required, 50-1000m range, default 100m)
  - In-Charge Person Name (optional)
  - Contact Number (optional, phone format validation)
  - Total Storage Capacity (numeric in metric tons, considered 'Total Capacity' for PR stock view)
  - Status (Active/Inactive, default Active)
- [ ] System SHALL validate mandatory fields
- [ ] System SHALL prevent duplicate POI names per tenant
- [ ] System SHALL auto-suggest default classification based on POI Type

### AC-2: GPS Coordinate Management
- [ ] System SHALL allow manual GPS entry
- [ ] System SHALL provide map interface for POI location selection
- [ ] System SHALL validate GPS format (latitude: -90 to 90, longitude: -180 to 180)
- [ ] System SHALL display POI location on map
- [ ] System SHALL calculate distance between POIs

### AC-3: POI Classification (Inbound/Outbound/Neutral)
- [ ] System SHALL classify each POI as Inbound, Outbound, or Neutral
- [ ] Classification SHALL be mandatory field for POI Creation
- [ ] System SHALL provide default classification based on POI Type:
  - Factory: Default = Outbound (finished goods production)
  - Depot: Default = Neutral (receives and distributes)
  - Feed mill: Default = Inbound (receives raw materials primarily)
  - Port: Default = Inbound (receives raw materials primarily)
  - Warehouse: Default = Neutral (storage and distribution)
  - Distribution Center: Default = Neutral (hub operations)
- [ ] Admin SHALL be able to override default classification
- [ ] Classification SHALL be used for routing logic and operational dashboards
- [ ] System SHALL allow filtering POIs by classification type

### AC-4: Operational Information & Capacity Tracking
- [ ] System SHALL store Total Storage Capacity (metric tons) per POI
- [ ] System SHALL calculate and expose:
  - Current Stock (from PR / TR / Trip updates)
  - Free Capacity
  - Projected Capacity (post-PR submission)
- [ ] System SHALL flag POIs as active/inactive
- [ ] System SHALL track last used date
- [ ] System SHALL display POI utilization (number of TRs/TOs)
- [ ] System SHALL prevent deletion of POIs with active dependencies (inventory, PRs, trips)

### AC-5: Geofencing & Vehicle Arrival Tracking
- [ ] System SHALL integrate POI geofencing with live GPS vehicle tracking
- [ ] System SHALL automatically detect vehicle entry into POI geofence ('Arrival' event)
- [ ] System SHALL automatically detect vehicle exit from POI geofence ('Departure' event)
- [ ] System SHALL calculate dwell time (duration between arrival and departure)
- [ ] System SHALL log arrival and departure timestamps per trip
- [ ] System SHALL display vehicles currently within each POI geofence
- [ ] System SHALL track vehicle entry time and duration at POI

### AC-6: POI Search & Management
- [ ] System SHALL provide POI list with search and filter
- [ ] System SHALL support pagination (25/50/100 per page)
- [ ] System SHALL support column sorting and full-text search
- [ ] System SHALL allow editing POI information (with audit logging)
- [ ] System SHALL allow viewing POI trip history
- [ ] System SHALL prevent deleting POIs with active dependencies:
  - Active inventory at POI
  - Pending or active PRs referencing POI
  - Active vehicle trips to/from POI
  - Users assigned to POI
  - Historical trip records (prevents hard delete)
- [ ] System SHALL support soft delete (mark as Inactive) with mandatory deletion reason
- [ ] System SHALL support hard delete (only if zero dependencies, Super Admin only)

---

## Functional Requirements

### FR-001: POI Registration Form
- [Critical] Multi-field registration form
- [Critical] Map integration for GPS selection (Google Maps / OSM)
- [High] Auto-suggest for address entry
- [High] Geofence radius configuration

### FR-002: GPS & Mapping
- [Critical] Map display with POI markers
- [Critical] Distance calculation between POIs
- [High] Route visualization
- [Medium] Geofence circle display on map

### FR-003: POI Type & Classification Management
- [Critical] POI type dropdown with predefined types (per PRD 6.5.1)
- [Critical] POI Classification dropdown (Inbound/Outbound/Neutral) - mandatory
- [Critical] Default classification assignment based on POI Type
- [Critical] Admin override capability for classification
- [High] Filtering by POI type and classification
- [Medium] POI type-based validation rules

### FR-004: Geofencing & Dwell Time Tracking
- [Critical] Geofence boundary definition (radius-based, 50-1000m range)
- [Critical] Integration with GPS tracking for vehicle arrival/departure detection
- [Critical] Automatic event logging (Arrival, Departure)
- [Critical] Dwell time calculation (duration between arrival and departure)
- [High] Dwell time display per trip and per POI
- [High] Dwell time exception flagging (beyond configurable limits)
- [High] Real-time vehicle presence tracking within POI geofences

### FR-005: Capacity Management
- [Critical] Total Storage Capacity tracking (metric tons)
- [Critical] Current Stock calculation (from PR/TR/Trip updates)
- [Critical] Free Capacity calculation
- [High] Projected Capacity calculation (post-PR submission)
- [High] Capacity threshold warnings (configurable, e.g., 80%, 90%)

### FR-006: Integration
- [Critical] API for POI lookup (by code, name, type, classification)
- [Critical] API for distance calculation
- [Critical] Integration with TO creation form (source/destination POI selection)
- [Critical] Integration with Product Requisition (PR) form (POI pre-population)
- [High] API for nearby POI search (within radius)
- [High] Real-time stock level display for source POI
- [High] Real-time capacity availability for destination POI

---

## Business Rules

### BR-POI-001: Unique POI Code
- POI code must be unique across all POIs
- **Enforcement**: Database unique constraint

### BR-POI-002: GPS Coordinate Validation
- Latitude: -90 to 90, Longitude: -180 to 180
- **Enforcement**: Input validation

### BR-POI-003: POI Type-Based Rules
- Dealer POIs can only be destinations (not sources)
- Supplier POIs can only be sources (not destinations)
- **Enforcement**: Validation during TR creation

### BR-POI-004: Active POI Requirement
- Only active POIs can be used in new TRs/TOs
- **Enforcement**: API filter

### BR-POI-005: Geofence Radius
- Default geofence radius: 100 meters (per PRD)
- Minimum: 50 meters, Maximum: 1000 meters (per PRD)
- **Enforcement**: Input validation

### BR-POI-006: POI Classification
- Each POI must have a classification (Inbound/Outbound/Neutral)
- Classification is mandatory for POI creation
- Default classification based on POI Type (can be overridden)
- **Enforcement**: Validation during POI creation/update

### BR-POI-007: Capacity Tracking
- Total Capacity tracked as 'Total Capacity' (not bin-level WMS)
- POI must be active to be used in PR/TR/TO
- Capacity changes trigger re-validation of pending PRs
- **Enforcement**: Capacity validation during PR/TR creation

### BR-POI-008: Dwell Time Tracking
- Dwell time calculated using geofence entry and exit timestamps
- Dwell time visible in trip and POI reports
- Exception flagged if dwell exceeds configured threshold
- **Enforcement**: GPS integration + event logging

### BR-POI-009: Dependency Check
- POI cannot be deactivated if referenced in open PR/TR/TO/Trip
- POI deletion blocked if active dependencies exist
- Soft delete (Inactive) always available
- Hard delete only if zero dependencies (Super Admin only)
- **Enforcement**: Pre-delete validation

---

## Data Model

```typescript
POI {
  id: UUID (PK)
  tenant_id: UUID (FK)
  
  poi_name: String (required, unique per tenant, 3-100 characters)
  poi_type: Enum (
    Finished_Feed_Depot,
    Feed_Mill,
    Feed_Dealer,
    Silage_Project,
    Raw_Material_Warehouse,
    Factory,
    Others
  )
  poi_classification: Enum (Inbound, Outbound, Neutral) (required)
  
  address: Text (full text address)
  latitude: Decimal (required, precision: 10, scale: 8, range: -90 to 90)
  longitude: Decimal (required, precision: 11, scale: 8, range: -180 to 180)
  geofence_radius_meters: Integer (required, range: 50-1000, default: 100)
  
  in_charge_person_name: String (nullable)
  contact_number: String (nullable, phone format validation)
  
  total_storage_capacity_mt: Decimal (numeric in metric tons, considered 'Total Capacity' for PR stock view)
  current_stock_mt: Decimal (calculated from PR/TR/Trip updates)
  free_capacity_mt: Decimal (calculated: total_storage_capacity_mt - current_stock_mt)
  
  is_active: Boolean (default: true)
  last_used_date: Date (nullable)
  total_trs_count: Integer (default: 0)
  total_tos_count: Integer (default: 0)
  
  created_at: Timestamp
  created_by: UUID (FK)
  updated_at: Timestamp
  updated_by: UUID (FK)
}

POIGeofenceEvent {
  id: UUID (PK)
  poi_id: UUID (FK)
  vehicle_id: UUID (FK)
  trip_id: UUID (FK, nullable)
  to_id: UUID (FK, nullable)
  
  event_type: Enum (Arrival, Departure)
  event_timestamp: Timestamp
  gps_latitude: Decimal
  gps_longitude: Decimal
  
  created_at: Timestamp
}

POIDwellTime {
  id: UUID (PK)
  poi_id: UUID (FK)
  vehicle_id: UUID (FK)
  trip_id: UUID (FK)
  to_id: UUID (FK)
  
  arrival_timestamp: Timestamp
  departure_timestamp: Timestamp (nullable)
  dwell_time_minutes: Integer (calculated: departure - arrival)
  
  is_exception: Boolean (dwell_time > threshold)
  threshold_minutes: Integer (configurable)
  
  created_at: Timestamp
  updated_at: Timestamp
}
```

---

## UI/UX Requirements

### POI Registration Form
```
┌─────────────────────────────────────────┐
│ Register New POI                        │
├─────────────────────────────────────────┤
│ POI Name: *                             │
│ [_____________________________]         │
│                                         │
│ POI Code: *                             │
│ [AUTO-GENERATED] or [Manual Entry]      │
│                                         │
│ POI Type: *                             │
│ [Warehouse                    ▼]        │
│                                         │
│ Address: *                              │
│ [_____________________________]         │
│                                         │
│ City: [_________] District: [_________] │
│                                         │
│ GPS Coordinates:                        │
│ Lat: [23.8103] Lng: [90.4125]          │
│ [📍 Select on Map]                      │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │      [MAP VIEW WITH MARKER]         │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Geofence Radius: [500] meters           │
│                                         │
│ Contact Person: *                       │
│ [_____________________________]         │
│                                         │
│ Phone: *                                │
│ [_____________________________]         │
│                                         │
│ [Cancel]              [Save]            │
└─────────────────────────────────────────┘
```

### POI List View with Map
```
┌──────────────────────────────────────────────────────────────┐
│ POI Management                       [+ Add POI]             │
├──────────────────────────────────────────────────────────────┤
│ [List View] [Map View]                                       │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐  │
│ │                                                        │  │
│ │  [MAP WITH ALL POI MARKERS]                            │  │
│ │  📍 Warehouse (Blue)                                   │  │
│ │  📍 Depot (Green)                                      │  │
│ │  📍 Farm (Yellow)                                      │  │
│ │  📍 Port (Red)                                         │  │
│ │                                                        │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ POI Name         Type        City        Status    Action   │
│ ──────────────────────────────────────────────────────────  │
│ Bhaluka Farm     Farm        Mymensingh  ✅ Active  [View]  │
│ Mirpur Depot     Depot       Dhaka       ✅ Active  [View]  │
│ Chittagong Port  Port        Chittagong  ✅ Active  [View]  │
└──────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
// Create POI
POST /api/v1/pois
Body: {poi_name, poi_code, poi_type, address, latitude, longitude, ...}

// Get all POIs
GET /api/v1/pois
Query: ?type=Warehouse&city=Dhaka&is_active=true

// Get POI by ID
GET /api/v1/pois/{poi_id}

// Update POI
PATCH /api/v1/pois/{poi_id}

// Calculate distance between POIs
GET /api/v1/pois/distance
Query: ?from_poi_id={id}&to_poi_id={id}
Response: {distance_km: 25.5, estimated_duration_minutes: 45}

// Get nearby POIs
GET /api/v1/pois/nearby
Query: ?latitude=23.8103&longitude=90.4125&radius_km=50
Response: {pois: POI[]}

// Get POI by type
GET /api/v1/pois/by-type/{poi_type}
Response: {pois: POI[]}

// Get POI by classification
GET /api/v1/pois/by-classification/{classification}
Response: {pois: POI[]}

// Get POI capacity information
GET /api/v1/pois/{poi_id}/capacity
Response: {total_capacity, current_stock, free_capacity, projected_capacity}

// Get vehicles currently at POI
GET /api/v1/pois/{poi_id}/vehicles-present
Response: {vehicles: [{vehicle_id, entry_time, duration_minutes}]}

// Get POI dwell time statistics
GET /api/v1/pois/{poi_id}/dwell-time
Query: ?start_date={date}&end_date={date}
Response: {avg_dwell_time_minutes, max_dwell_time_minutes, exception_count}

// Geofence events
GET /api/v1/pois/{poi_id}/geofence-events
Query: ?vehicle_id={id}&trip_id={id}&event_type={Arrival|Departure}
Response: {events: POIGeofenceEvent[]}
```

---

## Testing Scenarios

### Happy Path
1. Register POI with GPS coordinates → POI created
2. Select POI on map → GPS auto-filled
3. Calculate distance between two POIs → Distance returned
4. Filter POIs by type → Correct POIs displayed

### Edge Cases
1. **Duplicate POI code**: Error, "POI code already exists"
2. **Invalid GPS coordinates**: Validation error
3. **POI with active TRs**: Cannot delete, only deactivate
4. **Geofence radius out of range**: Validation error

### Error Scenarios
1. **Missing mandatory field**: Validation error
2. **Map API failure**: Allow manual GPS entry
3. **Invalid address**: Warning, allow save

---

## Dependencies

### Prerequisites
- ✅ US-007: User & Role Management

### Enables
- → US-009-010: Product Requisition (source/destination selection)
- → US-017: TO Creation (route planning)
- → US-035-037: Gate Management (location verification)

---

## Definition of Done
- [ ] CRUD operations functional
- [ ] Map integration working (Google Maps / OSM)
- [ ] GPS coordinate validation
- [ ] Distance calculation API
- [ ] Geofence radius configuration
- [ ] POI type-based filtering
- [ ] Unit tests > 85%
- [ ] Map performance tested (100+ POIs)
- [ ] UAT approved

---

**Story Points**: 8 (increased due to geofencing, dwell time tracking, capacity management)  
**Estimated Hours**: 64 hours  
**Assigned To**: Backend (25h) + Frontend (30h) + QA (9h)  
**Sprint**: Sprint 1  
**Priority**: Critical (Foundation for all transport workflows)

---

**Source Documents**:
- PRD Section 6.5.1: Point Of Interest (POI) Setup
- PRD Section 6.5.2: POI CRUD Operations
- PRD Section 6.5.3: POI Classification (Inbound/Outbound/Neutral)
- PRD Section 6.5.4: Integration & Linkage – Map Layer Integration
- PRD Section 6.5.5: GPS Tracking & Monitoring
- PRD Section 6.5.6: Geofencing and POI Tracking
- PRD Section 6.5.7: POI Geofencing Boundary Management
- PRD Section 6.5.8: Vehicle Arrival Tracking at POI
- PRD Section 6.5.9: Dwell Time Tracking
- PRD Section 6.5.10: GPS-Based Vehicle Maintenance Tracking (Phase 2)

**Last Updated**: February 13, 2026  
**Status**: Updated to align with PRD v1.0

