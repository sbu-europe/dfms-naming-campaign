---
jira_key: DFS-021
jira_type: Story
jira_epic: DFS-020
jira_sprint: "Sprint 2"
story_id: US-053
title: Vehicle Registration & Master Data Management
epic: Master Data Management
status: Pending
story_points: 5
assignee: ~
spec_file: ../../../../stories/US-053-vehicle-registration-master-data.md
---

# MDM-05 — Vehicle Registration & Master Data Management

## User Story

**As a** Transport Manager  
**I want to** register vehicles with complete identification and configuration details  
**So that** vehicles can be tracked, assigned, and monitored throughout transport operations

## Business Context

Vehicle master data is the foundation of all fleet management operations. Without it, the system cannot assign vehicles to TOs, track status and availability, calculate utilization, or link trips to vehicles for costing.

## Acceptance Criteria

### AC-1: Vehicle CRUD
- [ ] Create vehicle record with all mandatory fields
- [ ] Unique registration number per tenant; unique chassis number per tenant
- [ ] CRUD operations + bulk upload via CSV + inline editing
- [ ] Referential integrity: assigned POI must exist and be active

### AC-2: Mandatory Fields
- [ ] Vehicle Type (Pickup Van, Open Truck, Covered Truck, Nosimon, Auto, Tom Tom, Tractor)
- [ ] Number of Wheels, Capacity (Ton), Allowed Product Category (FG/RM/Both), License/Registration Number, Chassis Number (VIN), Model, Ownership (Own/Vendor), Assigned POI, Status (default: Available)

### AC-3: Optional Fields
- [ ] Body Type, Fuel Type, Assigned Driver, GPS Tracker ID, Assigned Garage, Odometer, Purchase Info, Make, Year, Color, Insurance, Fitness Certificate

### AC-4: Status Management
- [ ] Status transitions: Available ↔ Active ↔ Idle ↔ Under Maintenance
- [ ] Vehicles under maintenance excluded from assignment lists
- [ ] One vehicle per active trip constraint

### AC-5: Bulk Upload & Inline Edit
- [ ] CSV bulk upload with downloadable template (append-only)
- [ ] Row-level and column-level inline editing
- [ ] All bulk and inline actions audit logged

### AC-6: Vehicle Status Rules
- [ ] Vehicles not marked Active cannot be assigned to trips
- [ ] Vendor vehicles: no mileage tracking validation required

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| MDM-05-1 | Vehicle model + migration (all mandatory + optional fields, BulkUploadLog) | DFS-021-1 | Pending |
| MDM-05-2 | Vehicle CRUD API (POST, GET list, GET detail, PUT, PATCH status) | DFS-021-2 | Pending |
| MDM-05-3 | Unique registration + chassis validation per tenant | DFS-021-3 | Pending |
| MDM-05-4 | Status management API — transitions and maintenance exclusion logic | DFS-021-4 | Pending |
| MDM-05-5 | Referential integrity: POI, Driver, Garage FK validation before save | DFS-021-5 | Pending |
| MDM-05-6 | CSV bulk upload — template download, append-only upload, row-level error reporting | DFS-021-6 | Pending |
| MDM-05-7 | Inline row/column editing with audit log | DFS-021-7 | Pending |
| MDM-05-8 | Vehicle list UI with search, filter (Status, Type, POI, Ownership), pagination | DFS-021-8 | Pending |
| MDM-05-9 | Vehicle create/edit form (4-section layout: Basic, Details, Documents, Additional) | DFS-021-9 | Pending |

## API Endpoints

```
POST   /api/v1/vehicles
GET    /api/v1/vehicles?status=Available&type=&poi_id=&ownership=
GET    /api/v1/vehicles/{id}
PUT    /api/v1/vehicles/{id}
PATCH  /api/v1/vehicles/{id}/status
DELETE /api/v1/vehicles/{id}  (soft delete, reason required)
POST   /api/v1/vehicles/bulk-upload
GET    /api/v1/vehicles/bulk-upload/template
PATCH  /api/v1/vehicles/{id}  (inline field edit)
GET    /api/v1/vehicles/{id}/history
```

## Dependencies

- **Requires**: [US-097 / MDM-04 — POI Management](../03-poi-management/MDM-04-poi-management-geofencing.md) (vehicle assigned to POI)
- **Enables**: US-020 (TO Execution — Own Fleet), US-025 (Trip Lifecycle), driver assignment workflows

## Definition of Done

- [ ] Vehicle CRUD APIs implemented and tested
- [ ] Status management (transitions, maintenance exclusion)
- [ ] Bulk CSV upload with template and row-level errors
- [ ] Inline editing with audit log
- [ ] Unit tests > 80%
- [ ] UAT: Transport Manager can register 10+ vehicles and verify assignment exclusions
