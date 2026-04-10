---
jira_key: DFS-040
jira_type: Story
jira_epic: DFS-042
jira_sprint: "Sprint 3"
story_id: US-018
title: Transport Order — Own Fleet Vehicle & Driver Assignment
epic: Transport Order
status: Pending
story_points: 8
assignee: ~
spec_file: ../../../../stories/US-018-to-creation-transport-planner.md
---

# TO-02 — Transport Order: Own Fleet Vehicle & Driver Assignment

## User Story

**As a** Transport Planner / TDO  
**I want to** assign a specific vehicle and driver (from own fleet) to a confirmed Transport Order  
**So that** the TO is ready for dispatch and the trip can begin

## Business Context

While TO-01 creates the Transport Order and allocates quantity from the TR, this story handles the assignment of actual fleet resources — selecting the specific vehicle, driver, and helpers — and dispatching the TO into the execution phase.

**Own Fleet TOs** (fleet_type = OWN) only. Vendor fleet assignment is covered in TO-03.

## Acceptance Criteria

### AC-1: Vehicle Assignment
- [ ] Planner selects a vehicle for the TO from available own-fleet vehicles
- [ ] Vehicle filter: by Type (matching TO vehicle type requirement), Status = Available, assigned POI
- [ ] System prevents assigning: vehicles Under Maintenance, vehicles already on active trip, vendor-owned vehicles (for own-fleet TOs)
- [ ] One vehicle per TO (one active trip at a time)

### AC-2: Driver Assignment
- [ ] Planner selects a driver
- [ ] Only Available drivers shown (not On Trip, not On Leave, valid license)
- [ ] System prevents assigning drivers with expired licenses
- [ ] Driver linked to vehicle on assignment

### AC-3: Helper Assignment
- [ ] Planner optionally assigns one or more helpers from available pool
- [ ] Helpers linked to driver + TO + trip

### AC-4: TO Details Completion
- [ ] Planner confirms dispatch date/time
- [ ] Planner can add loading instructions, special handling notes
- [ ] TO status on assignment completion: `Assigned` → `Ready for Dispatch`

### AC-5: Dispatch Confirmation
- [ ] Planner clicks "Dispatch" to officially start the TO
- [ ] TO status → `Dispatched`
- [ ] Driver and vehicle status auto-updated: `On Trip`
- [ ] Trip created and linked to TO on dispatch (Trip lifecycle in Sprint 4)
- [ ] Dispatch notification sent to driver (if mobile interface available)

### AC-6: Validation & Business Rules
- [ ] Cannot dispatch TO if vehicle or driver not assigned
- [ ] Cannot dispatch TO from TR where Customs Status = Pending (for Port TRs, configurable)
- [ ] All assignment and dispatch actions audit logged

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| TO-02-1 | Vehicle assignment API (PATCH /transport-orders/{to_id}/vehicle) | DFS-040-1 | Pending |
| TO-02-2 | Driver assignment API (PATCH /transport-orders/{to_id}/driver) | DFS-040-2 | Pending |
| TO-02-3 | Helper assignment API (PATCH /transport-orders/{to_id}/helpers) | DFS-040-3 | Pending |
| TO-02-4 | Assignment validation (maintenance check, active trip check, license expiry check) | DFS-040-4 | Pending |
| TO-02-5 | Dispatch API (POST /transport-orders/{to_id}/dispatch) — status → DISPATCHED | DFS-040-5 | Pending |
| TO-02-6 | Vehicle + driver status auto-update to On Trip on dispatch | DFS-040-6 | Pending |
| TO-02-7 | TO assignment form UI — vehicle picker, driver picker, helper picker | DFS-040-7 | Pending |
| TO-02-8 | Dispatch confirmation modal + dispatch button | DFS-040-8 | Pending |

## API Endpoints

```
PATCH  /api/v1/transport-orders/{to_id}/vehicle    Body: { vehicle_id }
PATCH  /api/v1/transport-orders/{to_id}/driver     Body: { driver_id }
PATCH  /api/v1/transport-orders/{to_id}/helpers    Body: { helper_ids[] }
POST   /api/v1/transport-orders/{to_id}/dispatch
```

## Dependencies

- **Requires**: TO-01 (confirmed TO), TP-02 (fleet availability), MDM-05 (vehicles), US-057 / Driver domain (`12-users/driver-user-profiles.md`), MDM-07 (helpers)
- **Enables**: Trip lifecycle (Sprint 4), vehicle + driver status tracking

## Definition of Done

- [ ] Vehicle, driver, helper assignment with all validation rules
- [ ] Dispatch workflow: status → Dispatched, vehicle/driver → On Trip
- [ ] Audit logging on all assignment and dispatch actions
- [ ] Unit tests > 80%
- [ ] UAT: TDO assigns vehicle + driver + helper to TO and dispatches
