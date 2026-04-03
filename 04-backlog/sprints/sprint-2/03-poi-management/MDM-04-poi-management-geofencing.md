---
jira_key: DFS-020
jira_type: Story
jira_epic: DFS-020
jira_sprint: "Sprint 2"
story_id: US-097
title: POI Management & Geofencing
epic: POI & Geofencing
status: Pending
story_points: 13
assignee: ~
spec_file: ../../../../stories/US-097-poi-management-geofencing.md
---

# MDM-04 — POI Management & Geofencing

## User Story

**As a** Tenant Admin  
**I want to** define and manage Points of Interest (POIs) with GPS coordinates, geofence boundaries, and storage capacity  
**So that** all DFMS workflows — requisitions, transport orders, gate operations, GPS tracking, and capacity planning — can reference accurate, real-world operational locations

## Business Context

A POI (Point of Interest) is any physical operational location — Depot, Feed Mill, Factory, Warehouse, Port, Dealer location. POI is a **Tier 2 Master Data dependency** for the entire platform:

- Product Requisitions reference source/destination POIs for stock and capacity checks
- Transport Orders use POI-to-POI routes for trip planning
- Gate Management validates vehicle arrival at correct destination POI
- GPS Tracking uses POI geofence boundaries to detect vehicle arrival/departure and trigger workflow events
- Capacity Planning tracks storage capacity and projected utilization per POI

**Note**: Routes (MDM-02) and Vehicles (MDM-05) both have FK references to POI — this story should be prioritized before them.

## Acceptance Criteria

### AC-1: POI Creation
- [ ] POI Setup module for Tenant Admin only (RBAC)
- [ ] Fields: POI Name (unique within tenant), POI Type, Address/Area, GPS Coordinates (Lat/Lng), Geofence Radius (50–1000m, default 100m), In-Charge Person, Contact Number, Total Storage Capacity (metric tons), Status (Active/Inactive)
- [ ] POI Types: Finished Feed Depot, Feed Mill, Feed Dealer, Silage Project, Raw Material Warehouse, Factory, Port, Others

### AC-2: POI CRUD
- [ ] Create, view, edit, deactivate POIs
- [ ] Unique POI Name per tenant
- [ ] Only Active POIs selectable in Route, Vehicle, and Gate workflows
- [ ] Cannot delete POIs referenced in active Routes, TOs, or Gate records

### AC-3: GPS Coordinates & Geofence
- [ ] Latitude (–90 to 90) and Longitude (–180 to 180) input with validation
- [ ] Geofence radius configurable per POI (50–1000 meters)
- [ ] Map preview for coordinates and geofence boundary

### AC-4: Geofencing — Vehicle Arrival/Departure Detection
- [ ] System detects when GPS tracker enters POI geofence → trigger "Arrival" event
- [ ] System detects when GPS tracker exits POI geofence → trigger "Departure" event
- [ ] Events trigger downstream workflow notifications (Gate Management, Capacity updates)
- [ ] Dwell time calculation (arrival to departure)

### AC-5: Capacity Planning
- [ ] Total Storage Capacity tracked per POI
- [ ] Current stock, free capacity, and projected utilization visible in PR stock view
- [ ] Capacity alerts when utilization exceeds configurable threshold

### AC-6: POI List & Bulk Upload
- [ ] Paginated list with search, filter by Type and Status, sort
- [ ] CSV bulk upload with downloadable template (append-only)
- [ ] Row-level error reporting for bulk upload

### AC-7: Audit Trail
- [ ] All create, update, and status changes logged with user + timestamp

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| MDM-04-1 | POI model + migration (name, type, GPS, geofence_radius, capacity, status fields) | DFS-020-1 | Pending |
| MDM-04-2 | POI CRUD API (POST, GET list, GET detail, PUT, PATCH status) | DFS-020-2 | Pending |
| MDM-04-3 | GPS coordinate validation (Lat/Lng range enforcement) | DFS-020-3 | Pending |
| MDM-04-4 | Geofence radius config per POI | DFS-020-4 | Pending |
| MDM-04-5 | Geofencing engine — GPS event subscriber, arrival/departure detection against POI radius | DFS-020-5 | Pending |
| MDM-04-6 | Arrival/Departure event triggers → Gate Management + Capacity update notifications | DFS-020-6 | Pending |
| MDM-04-7 | Dwell time calculation (arrival → departure) | DFS-020-7 | Pending |
| MDM-04-8 | Capacity tracking (total, current stock, free capacity, utilization %) | DFS-020-8 | Pending |
| MDM-04-9 | Capacity alert on threshold breach (configurable %) | DFS-020-9 | Pending |
| MDM-04-10 | CSV bulk upload with downloadable template + row-level errors | DFS-020-10 | Pending |
| MDM-04-11 | POI list UI with map view option, search, filter, pagination | DFS-020-11 | Pending |
| MDM-04-12 | POI create/edit form with map picker for GPS coordinates | DFS-020-12 | Pending |
| MDM-04-13 | Delete protection — block if POI referenced in active Routes/TOs/Gate records | DFS-020-13 | Pending |

## API Endpoints

```
POST   /api/v1/pois
GET    /api/v1/pois?type=&status=ACTIVE&search=&page=
GET    /api/v1/pois/{poi_id}
PUT    /api/v1/pois/{poi_id}
PATCH  /api/v1/pois/{poi_id}/status
DELETE /api/v1/pois/{poi_id}           # Blocked if referenced
GET    /api/v1/pois/{poi_id}/capacity  # Current capacity snapshot
POST   /api/v1/pois/bulk-upload
GET    /api/v1/pois/bulk-upload/template
```

## Dependencies

- **Requires**: US-004 Role Hierarchy (RBAC)
- **Blocks**: MDM-02 Route (source/dest POI FK), MDM-05 Vehicle (assigned POI FK), US-035/037 Gate Management (arrival at POI)

## Definition of Done

- [ ] POI CRUD fully functional
- [ ] Geofence radius configurable and used in GPS event detection
- [ ] Arrival/Departure events trigger downstream notifications
- [ ] Capacity tracking with alert
- [ ] CSV bulk upload with template and row-level errors
- [ ] Delete protection for referenced POIs
- [ ] Unit tests > 80%
- [ ] UAT: Tenant Admin can create 5+ POIs and verify geofence detection
