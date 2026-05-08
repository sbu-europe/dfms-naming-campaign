---
jira_key: DFS-020
jira_type: Story
jira_epic: DFS-030
jira_sprint: "Sprint 2"
story_id: US-097
title: POI (Point of Interest) Setup & Management
epic: Master Data Management
status: Pending
story_points: 8
assignee: ~
spec_file: ../../../../stories/US-097-poi-management-geofencing.md
note: Geofencing engine and vehicle arrival/departure detection is a separate story — see VTG-01
---

# MDM-04 — POI (Point of Interest) Setup & Management

## User Story

**As a** Tenant Admin  
**I want to** define and manage Points of Interest (POIs) with GPS coordinates, geofence radius, and storage capacity  
**So that** all DFMS workflows — requisitions, transport orders, gate operations, and capacity planning — can reference accurate, real-world operational locations

## Business Context

A POI is any physical operational location in the DFMS network — Depot, Feed Mill, Factory, Warehouse, Port, Dealer location. POI is a **Tier 2 Master Data dependency** for the entire platform:

- Product Requisitions reference source/destination POIs for stock and capacity checks
- Transport Orders use POI-to-POI routes for trip planning
- Gate Management validates vehicle arrival at correct destination POI
- Vehicles are assigned to a home POI

**Note**: Geofence radius is stored per POI as a configuration field. The geofencing *engine* (GPS event processing, arrival/departure detection, dwell time calculation) is handled by the Vehicle Tracking & Geofencing epic — see [VTG-01](../03-vehicle-tracking-geofencing/VTG-01-geofencing-arrival-departure.md).

## Acceptance Criteria

### AC-1: POI Creation
- [ ] POI Setup module for Tenant Admin only (RBAC)
- [ ] Fields: POI Name (unique within tenant), POI Type, Address/Area, GPS Coordinates (Lat/Lng), Geofence Radius (50–1000m, default 100m), In-Charge Person (optional), Contact Number (optional), Total Storage Capacity (metric tons), Status (Active/Inactive, default Active)
- [ ] POI Types: Finished Feed Depot, Feed Mill, Feed Dealer, Silage Project, Raw Material Warehouse, Factory, Port, Others
- [ ] GPS coordinate validation: Latitude (−90 to 90), Longitude (−180 to 180)
- [ ] Map preview with geofence circle displayed immediately after creating / editing a POI

### AC-2: POI CRUD
- [ ] Paginated list: POI Name, Type, Address, Coordinates, Geofence Radius, Capacity, Status — searchable, sortable, filterable by Type and Status
- [ ] Inline editing for simple fields; full edit form for all fields
- [ ] Status change to Inactive blocks POI from new PR/TR/TO; active trips unaffected
- [ ] Soft delete (default) and hard delete blocked if POI referenced in any PR/TR/TO/Trip/Gate record
- [ ] Every create, update, and deactivate action audit logged

### AC-3: Geofence Radius Configuration
- [ ] Geofence radius stored per POI (50–1000m range enforced)
- [ ] Radius changes update the stored config immediately (geofencing engine picks up on its own polling cycle)
- [ ] Map view displays all active POI geofence circles

### AC-4: Capacity Tracking
- [ ] Total Storage Capacity per POI (set by admin)
- [ ] Current Stock, Free Capacity, Projected Capacity computed and visible in:
  - POI detail view
  - Product Requisition creation form (source/destination capacity snapshot)
- [ ] Threshold warnings at 80% and 90% utilisation (configurable)

### AC-5: Active POI Enforcement
- [ ] Only Active POIs selectable in: PR, TR, TO, Gate, Command Center, QC workflows
- [ ] Inactive POIs remain in system for historical reference

### AC-6: Bulk Upload
- [ ] CSV bulk upload with downloadable template (append-only, row-level errors, audit logged)

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| MDM-04-1 | POI model + migration (name, type, GPS, geofence_radius_meters, capacity fields, status, audit) | DFS-020-1 | Pending |
| MDM-04-2 | POI CRUD API (POST, GET list, GET detail, PATCH, PATCH status, DELETE) | DFS-020-2 | Pending |
| MDM-04-3 | GPS coordinate validation (Lat/Lng range enforcement) | DFS-020-3 | Pending |
| MDM-04-4 | Geofence radius range validation (50–1000m) + stored as data field | DFS-020-4 | Pending |
| MDM-04-5 | Capacity tracking — current stock, free, projected capacity APIs | DFS-020-5 | Pending |
| MDM-04-6 | Capacity stock update webhook (called by TR/Trip completion events) | DFS-020-6 | Pending |
| MDM-04-7 | Capacity threshold warning (configurable 80%/90% alerts) | DFS-020-7 | Pending |
| MDM-04-8 | Active POI gate — filter inactive from all workflow dropdowns | DFS-020-8 | Pending |
| MDM-04-9 | Hard delete dependency check (PR/TR/TO/Trip/Gate referential check) | DFS-020-9 | Pending |
| MDM-04-10 | CSV bulk upload + downloadable template with row-level errors | DFS-020-10 | Pending |
| MDM-04-11 | POI list UI with map view toggle, search, filter, pagination | DFS-020-11 | Pending |
| MDM-04-12 | POI create/edit form with interactive map picker + geofence circle preview | DFS-020-12 | Pending |

## API Endpoints

```
POST   /api/v1/pois
GET    /api/v1/pois?type=&status=ACTIVE&search=&page=
GET    /api/v1/pois/{poi_id}
PATCH  /api/v1/pois/{poi_id}
PATCH  /api/v1/pois/{poi_id}/status
DELETE /api/v1/pois/{poi_id}
GET    /api/v1/pois/{poi_id}/capacity
PATCH  /api/v1/pois/{poi_id}/capacity     # Called by TR/Trip completion
POST   /api/v1/pois/bulk-upload
GET    /api/v1/pois/bulk-upload/template
```

## Dependencies

- **Requires**: US-004 Role Hierarchy (RBAC)
- **Blocks**: MDM-02 Route (source/dest POI FK), MDM-05 Vehicle (assigned POI FK), US-010–US-014 (PR capacity checks), US-035–US-038 Gate Management
- **Related**: [VTG-01](../03-vehicle-tracking-geofencing/VTG-01-geofencing-arrival-departure.md) uses `geofence_radius_meters` from this model for event detection

## Definition of Done

- [ ] POI CRUD fully functional (create, read, update, soft/hard delete)
- [ ] GPS validation and geofence radius validation working
- [ ] Map with geofence circles rendering in list and create/edit forms
- [ ] Capacity tracking (total, current, free, projected) accurate
- [ ] Active/Inactive enforcement in all dependent workflow dropdowns
- [ ] Hard delete restriction working
- [ ] Bulk CSV upload with template and row-level errors
- [ ] All actions audit logged
- [ ] Unit tests > 85%
- [ ] UAT: Tenant Admin can create 5+ POIs and verify they appear in workflow dropdowns
