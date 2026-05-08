---
jira_key: DFS-042
jira_type: Story
jira_epic: DFS-043
jira_sprint: "Sprint 4"
story_id: US-020
title: TO Execution — Own Fleet (Vehicle/Driver Assignment)
epic: Trip Execution
status: Pending
story_points: 8
assignee: ~
spec_file: ../../../../stories/US-020-to-execution-own-fleet.md
---

# TE-01 — TO Execution — Own Fleet (Vehicle/Driver Assignment)

## User Story

**As a** Transport Planner  
**I want to** assign a specific vehicle and driver to a confirmed Own-Fleet Transport Order  
**So that** the TO moves from `Confirmed` to `Dispatched` with a fully identified crew and vehicle

## Business Context

A confirmed Own-Fleet TO already has fleet type = `OWN` and a vehicle type requirement set. This story covers the final execution step — binding a real vehicle and driver to that TO so the trip can begin. It is the last action before `TE-02 (Trip Lifecycle)` takes over.

This story also handles pre-dispatch checks: vehicle fitness, driver license validity, and helper assignment confirmation (built in Sprint 3 / TP-02).

## Acceptance Criteria

### AC-1: Vehicle Assignment to TO
- [ ] Planner can assign a vehicle to a Confirmed Own-Fleet TO
- [ ] Only vehicles with Status = `Available` and matching vehicle type shown
- [ ] Vehicles with expired fitness certificate or insurance blocked (with warning message)
- [ ] On assignment, vehicle status auto-updated to `Scheduled`

### AC-2: Driver Assignment to TO
- [ ] Planner assigns a driver to the TO
- [ ] Only drivers with Status = `Available` shown
- [ ] Driver with expired license blocked
- [ ] On assignment, driver status auto-updated to `Scheduled`

### AC-3: Helper Confirmation
- [ ] Previously assigned helpers (from TP-02) confirmed on TO execution
- [ ] Planner can add / remove helpers at this stage before dispatch
- [ ] All assigned helpers' statuses updated to `Scheduled`

### AC-4: Pre-Dispatch Checklist
- [ ] System performs pre-dispatch validation:
  - Vehicle fitness valid?
  - Driver license valid?
  - TO quantity within vehicle capacity?
  - Helpers count within regulatory limit?
- [ ] Planner sees summary of all checks before confirming dispatch
- [ ] Any failed check shows blocking error; warnings are non-blocking

### AC-5: TO Dispatch
- [ ] Planner triggers `Dispatch` action after all checks pass
- [ ] TO status transitions: `Confirmed` → `Dispatched`
- [ ] Trip record auto-created with status `In Transit` (picked up by TE-02)
- [ ] Dispatch timestamp, vehicle, driver, helpers persisted on TO

### AC-6: Audit Trail
- [ ] Vehicle/driver/helper assignment logged with planner ID + timestamp
- [ ] Dispatch event logged

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| TE-01-1 | TO execution model update — vehicle FK, driver FK, dispatch_at, helpers M2M | DFS-042-1 | Pending |
| TE-01-2 | Vehicle assignment API (PATCH /transport-orders/{id}/assign-vehicle) with validity checks | DFS-042-2 | Pending |
| TE-01-3 | Driver assignment API (PATCH /transport-orders/{id}/assign-driver) with license check | DFS-042-3 | Pending |
| TE-01-4 | Helper confirmation API — add/remove helpers at execution stage | DFS-042-4 | Pending |
| TE-01-5 | Pre-dispatch validation service — vehicle fitness, driver license, capacity, helpers | DFS-042-5 | Pending |
| TE-01-6 | Dispatch API (POST /transport-orders/{id}/dispatch) — TO → Dispatched + Trip auto-create | DFS-042-6 | Pending |
| TE-01-7 | Vehicle/driver status update on assignment and dispatch | DFS-042-7 | Pending |
| TE-01-8 | TO execution UI — vehicle/driver selectors + pre-dispatch checklist panel | DFS-042-8 | Pending |

## API Endpoints

```
PATCH /api/v1/transport-orders/{id}/assign-vehicle
Body: { vehicle_id }

PATCH /api/v1/transport-orders/{id}/assign-driver
Body: { driver_id }

PATCH /api/v1/transport-orders/{id}/helpers
Body: { helper_ids: [] }

GET   /api/v1/transport-orders/{id}/pre-dispatch-check
Response: { checks: [{ name, status, message }] }

POST  /api/v1/transport-orders/{id}/dispatch
Response: 200 + updated TO + created Trip object
```

## Dependencies

- **Requires**: TO-01 (TO Creation), TO-02 (Own Fleet Assignment from Sprint 3), TP-02 (Fleet Availability + Helper Assignment)
- **Enables**: TE-02 (Trip Lifecycle Management — trip is created on dispatch)

## Definition of Done

- [ ] Vehicle, driver, and helper assignment APIs with validity enforcement
- [ ] Pre-dispatch checklist with blocking / warning logic
- [ ] TO dispatched → Trip auto-created with status `In Transit`
- [ ] Vehicle/driver/helper statuses updated atomically on dispatch
- [ ] Unit tests > 80%
- [ ] UAT: Planner assigns vehicle + driver, runs pre-dispatch check, dispatches TO successfully
