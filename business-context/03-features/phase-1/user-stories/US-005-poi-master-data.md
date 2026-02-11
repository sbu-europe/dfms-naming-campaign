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
updated: 2026-02-11
source_documents:
  - ../../../../source-documents/requirements/PRD_DFMS_v1.0.docx
  - ../../../../source-documents/discovery-phase/client-resources/master-data/
related_stories:
  - US-009-fg-transfer-requisition.md
  - US-017-to-creation.md
dependencies:
  - US-007-user-role-management.md
tags: [master-data, poi, location, warehouse, depot, critical]
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
  - POI Name
  - POI Code (unique, auto-generated or manual)
  - POI Type (Warehouse, Depot, Farm, Port, Dealer, Supplier, Other)
  - Address (full address)
  - City, District, Division
  - GPS Coordinates (Latitude, Longitude)
  - Contact Person Name
  - Contact Phone
  - Operational Hours (from-to time)
  - Storage Capacity (optional, for warehouses)
  - Geofence Radius (meters, for arrival detection)
- [ ] System SHALL validate mandatory fields
- [ ] System SHALL prevent duplicate POI codes

### AC-2: GPS Coordinate Management
- [ ] System SHALL allow manual GPS entry
- [ ] System SHALL provide map interface for POI location selection
- [ ] System SHALL validate GPS format (latitude: -90 to 90, longitude: -180 to 180)
- [ ] System SHALL display POI location on map
- [ ] System SHALL calculate distance between POIs

### AC-3: POI Type Classification
- [ ] System SHALL categorize POIs by type
- [ ] System SHALL allow filtering by POI type
- [ ] System SHALL associate POI type with operational rules:
  - Warehouse: Can be source or destination
  - Farm: Usually source for FG
  - Depot: Usually destination for FG
  - Port: Source for raw materials
  - Dealer: Destination only
  - Supplier: Source only

### AC-4: Operational Information
- [ ] System SHALL store operational hours per POI
- [ ] System SHALL flag POIs as active/inactive
- [ ] System SHALL track last used date
- [ ] System SHALL display POI utilization (number of TRs/TOs)

### AC-5: POI Search & Management
- [ ] System SHALL provide POI list with search and filter
- [ ] System SHALL allow editing POI information
- [ ] System SHALL allow viewing POI trip history
- [ ] System SHALL prevent deleting POIs with active TRs/TOs

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

### FR-003: POI Type Management
- [Critical] POI type dropdown with predefined types
- [High] Custom POI type addition (admin only)
- [Medium] POI type-based validation rules

### FR-004: Integration
- [Critical] API for POI lookup (by code, name, type)
- [Critical] API for distance calculation
- [High] API for nearby POI search (within radius)

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
- Default geofence radius: 500 meters
- Minimum: 100 meters, Maximum: 2000 meters
- **Enforcement**: Input validation

---

## Data Model

```typescript
POI {
  id: UUID (PK)
  tenant_id: UUID (FK)
  
  poi_code: String (unique)
  poi_name: String
  poi_type: Enum (
    Warehouse,
    Depot,
    Farm,
    Port,
    Dealer,
    Supplier,
    Other
  )
  
  address: Text
  city: String
  district: String
  division: String
  postal_code: String (nullable)
  
  latitude: Decimal (precision: 10, scale: 8)
  longitude: Decimal (precision: 11, scale: 8)
  geofence_radius_meters: Integer (default: 500)
  
  contact_person_name: String
  contact_phone: String
  contact_email: String (nullable)
  
  operational_hours_from: Time (nullable)
  operational_hours_to: Time (nullable)
  
  storage_capacity_mt: Decimal (nullable, for warehouses)
  
  is_active: Boolean (default: true)
  last_used_date: Date (nullable)
  total_trs_count: Integer (default: 0)
  total_tos_count: Integer (default: 0)
  
  created_at: Timestamp
  created_by: UUID (FK)
  updated_at: Timestamp
  updated_by: UUID (FK)
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

**Story Points**: 5  
**Estimated Hours**: 40 hours  
**Assigned To**: Backend (15h) + Frontend (20h) + QA (5h)  
**Sprint**: Sprint 1  
**Priority**: Critical (Foundation for all transport workflows)

