---
jira_key: DFS-038
jira_type: Story
jira_epic: DFS-041
jira_sprint: "Sprint 3"
story_id: US-016
title: Fleet Availability & Transport Planning
epic: Transport Planning
status: Pending
story_points: 5
assignee: ~
spec_file: ../../../../stories/US-016-fleet-availability.md
---

# TP-02 — Fleet Availability & Transport Planning

## User Story

**As a** Transport Planner  
**I want to** see real-time availability of own fleet (vehicles + drivers + helpers) and vendor fleet  
**So that** I can plan Transport Orders against what is actually available, avoiding double-assignment and maintenance conflicts

## Business Context

Fleet availability is queried during TR Assessment (TP-01) and used directly during TO creation (TO-01). This story delivers the service and UI that answers: *"What vehicles and drivers can I assign right now for this route and vehicle type?"*

Also incorporates **helper assignment to trips** (US-062) — helpers are part of the fleet resource pool and should be visible and assignable during planning.

## Acceptance Criteria

### AC-1: Vehicle Availability
- [ ] Planner can query available vehicles filtered by:
  - Status = `Available` (not On Trip, not Under Maintenance, not Scheduled)
  - Vehicle Type (matching TR product transport config)
  - Assigned POI (near source POI)
  - Ownership (Own / Vendor)
- [ ] Results show: Registration, Type, Capacity, Ownership, Current POI, Last Trip Date
- [ ] Vehicles with expiring insurance / fitness certificates flagged

### AC-2: Driver Availability
- [ ] Available drivers shown filtered by Status = `Available` (not On Trip, not On Leave)
- [ ] Expired / expiring license flagged
- [ ] Driver linked to vehicle if pre-assigned (from MDM-05)

### AC-3: Helper Availability & Assignment (US-062)
- [ ] Available helpers shown with Status = `Available`
- [ ] Planner can assign one or more helpers to a driver/trip during planning
- [ ] Helper assignment stored with: Helper IDs, Driver ID, Vehicle ID, Trip/TO linkage
- [ ] Conflict check: helper not already assigned to conflicting active trip
- [ ] Assignment history retained per trip

### AC-4: Vendor Fleet Availability
- [ ] Active contractual vendor list shown with fleet info (vehicle types available, count)
- [ ] Non-contractual vendors also visible (for bidding pathway — TO-03 future sprint)
- [ ] Vendor availability is indicative (not real-time from vendor system)

### AC-5: Fleet Planning View
- [ ] Planner can see a combined dashboard:
  - Own fleet: total vehicles, available now, on trip, under maintenance
  - Driver pool: total, available, on trip, on leave
  - Helper pool: total, available, on trip
- [ ] Filterable by POI (show fleet at a specific location)

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| TP-02-1 | Vehicle availability API (GET /vehicles/available?type=&poi_id=&ownership=) | DFS-038-1 | Pending |
| TP-02-2 | Driver availability API (GET /drivers/available) | DFS-038-2 | Pending |
| TP-02-3 | Helper availability API (GET /helpers/available) | DFS-038-3 | Pending |
| TP-02-4 | Helper assignment API (POST /trips/{trip_id}/helpers) — US-062 | DFS-038-4 | Pending |
| TP-02-5 | Helper conflict check — reject if already assigned to conflicting active trip | DFS-038-5 | Pending |
| TP-02-6 | Helper assignment history per trip | DFS-038-6 | Pending |
| TP-02-7 | Fleet availability summary service (used by TP-01 inline summary) | DFS-038-7 | Pending |
| TP-02-8 | Fleet planning dashboard UI (own fleet + driver + helper availability cards) | DFS-038-8 | Pending |
| TP-02-9 | Vehicle availability list UI (searchable, filterable, expiry flags) | DFS-038-9 | Pending |

## API Endpoints

```
GET   /api/v1/vehicles/available?vehicle_type=&poi_id=&ownership=
GET   /api/v1/drivers/available
GET   /api/v1/helpers/available
POST  /api/v1/transport-orders/{to_id}/helpers     # Assign helpers to TO/trip
GET   /api/v1/fleet/summary?poi_id=                # Fleet planning dashboard stats
```

## Dependencies

- **Requires**: MDM-05 (Vehicles), US-057 / Driver domain (`driver-user-profiles.md`), MDM-07 (Helpers), MDM-03 (Vendors)
- **Used by**: TP-01 (inline fleet summary during TR assessment), TO-01 / TO-02 (vehicle/driver selection during TO creation)

## Definition of Done

- [ ] Vehicle, driver, helper availability APIs returning filtered, accurate data
- [ ] Helper assignment with conflict check and history
- [ ] Fleet planning dashboard with summary cards per resource type
- [ ] Expiry warnings on vehicles and driver licenses
- [ ] Unit tests > 80%
- [ ] UAT: Planner can see available fleet and assign helpers before trip dispatch
