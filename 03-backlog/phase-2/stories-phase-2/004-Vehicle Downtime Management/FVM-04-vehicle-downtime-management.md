---
jira_key: ~
jira_type: Story
jira_sprint: ~
story_id: FVM-04
title: Vehicle Downtime Management
epic: Fleet & Vehicle Management — Downtime
status: Planning
story_points: 5
assignee: ~
prd_refs:
  - "Vehicle Downtime Management (PRD, after §6.6.7)"
feature_list: "SOW Phase-2 row 101 — Vehicle Downtime Management"
phase: Phase 2
related_stories:
  - DS-01 (Under Maintenance + clearance — same status; FVM-04 adds reason/start/end log)
  - FVM-01 (service log does not set Under Maintenance)
  - FVM-02 (reads operational_status — Under Maintenance card)
  - FVM-03 (availability metrics subtract FVM-04 downtime hours)
implementation_docs:
  - DFMS-product-context/05-modules/02-master-data/vehicle-master-data.md
tdd_test_cases: ../../../../09-testing/stories-phase-2/004-Vehicle Downtime Management/FVM-04-vehicle-downtime-management-tdd-test-cases.md
tdd_index: ../../../../09-testing/stories-phase-2/004-Vehicle Downtime Management/00-all-test-cases.md
---

# FVM-04 — Vehicle Downtime Management

## Test cases

Gherkin / TDD scenarios live under `09-testing` (not inline in this story).

| Navigate | Link |
|----------|------|
| **FVM-04 TDD catalog** (`AC-N.x` mapped) | [FVM-04-vehicle-downtime-management-tdd-test-cases.md](../../../../09-testing/stories-phase-2/004-Vehicle%20Downtime%20Management/FVM-04-vehicle-downtime-management-tdd-test-cases.md) |
| **Vehicle Downtime TDD index** | [00-all-test-cases.md](../../../../09-testing/stories-phase-2/004-Vehicle%20Downtime%20Management/00-all-test-cases.md) |
| **Feature TDD folder** | [README](../../../../09-testing/stories-phase-2/004-Vehicle%20Downtime%20Management/README.md) |

Write failing tests from the catalog **before** implementation.

## User Story

**As a** Driver supervisor  
**I want** to track vehicle downtime  
**So that** availability and planning accuracy improves.

## Feature (PRD)

- Downtime reasons logged
- Change status of vehicle to **Under Maintenance**
- Availability adjusted automatically

System SHALL log downtime with:

- **Reason**
- **Start & end date time**

Downtime SHALL **reduce availability metrics**.

SOW row 101: Driver Supervisor captures reason with start and end; status becomes Under Maintenance; availability adjusts from that downtime.

## Business Context

DS-01 already **sets** `operational_status = under_maintenance` (mark from queue, failed pre-dispatch inspection) and **clears** it via maintenance-clearance checklist. That path has **no** reason + start/end log for planning metrics.

**FVM-04** is the downtime **record**: reason, `start_at`, `end_at`. While a downtime is **open** (`end_at` null or `end_at` in the future), the vehicle is Under Maintenance — TDO cannot assign it (existing picker), FVM-02 Under Maintenance count goes up. When the supervisor **ends** the log, status returns to **No Active TO** (if master-data `is_active` and no other open downtime).

```
Driver Supervisor
  logs downtime (vehicle, reason, start_at [, end_at])
      → VehicleDowntime row
      → if covering now: operational_status = under_maintenance
         (reuse mark_vehicle_under_maintenance — unassign Assigned TOs)
      → FVM-02 card + GET /vehicles/available follow status
      → FVM-03 subtracts [start_at, end_at] from available hours
```

**FVM-01 `VehicleServiceLog` does not set Under Maintenance.** Phase 3 workshop jobs (cost/parts) are not this story.


## Acceptance Criteria

> **Test scenarios:** see [FVM-04 TDD catalog](../../../../09-testing/stories-phase-2/004-Vehicle%20Downtime%20Management/FVM-04-vehicle-downtime-management-tdd-test-cases.md) · [Vehicle Downtime index](../../../../09-testing/stories-phase-2/004-Vehicle%20Downtime%20Management/00-all-test-cases.md)

### AC-1 — Log downtime

Given a Driver Supervisor records downtime for an own-fleet vehicle,
when they enter a reason and start time (and end time if already back in service),
then the system keeps the log with who entered it, rejects invalid or duplicate open logs, and lets them list and close open logs.

- [ ] **Log downtime with reason and times**  
  **Given** a Driver Supervisor is logging downtime  
  **When** they enter the vehicle, **reason**, **start** date and time, and **end** date and time (optional if the vehicle is still down)  
  **Then** the downtime log is accepted

- [ ] **Who entered it is recorded**  
  **Given** a Driver Supervisor saves an accepted downtime log  
  **When** the save completes  
  **Then** the log shows who entered it

- [ ] **End before start is rejected**  
  **Given** the end date and time is earlier than the start date and time  
  **When** the supervisor saves  
  **Then** the log is rejected with a clear error

- [ ] **Second open downtime is rejected**  
  **Given** a vehicle already has an **open** downtime log (started, not yet ended)  
  **When** the supervisor tries to start another open downtime on the same vehicle  
  **Then** the second log is rejected

- [ ] **List and close open logs**  
  **Given** downtime logs exist for a vehicle  
  **When** the supervisor views downtime for that vehicle  
  **Then** logs appear newest first  
  **And** they can close an open log by entering an end date and time

### AC-2 — Status becomes Under Maintenance

Given a downtime log that covers the current time,
when it is saved,
then the vehicle becomes Under Maintenance (unless it is already in transit, which is rejected), transport orders that were assigned but not started are unassigned, and logging a completed service still does not put the vehicle Under Maintenance.

- [ ] **Open downtime sets Under Maintenance**  
  **Given** a downtime log that **covers now** (started, not yet ended)  
  **When** the log is saved  
  **Then** the vehicle’s availability status is **Under Maintenance**  
  **And** the vehicle stays active in the fleet (not marked inactive)

- [ ] **Assigned but not started orders are unassigned**  
  **Given** the vehicle has transport orders that are assigned but not started  
  **When** downtime that covers now is saved  
  **Then** those orders go back to Under Planning and the vehicle is cleared from them (same as today’s maintenance flow)

- [ ] **In-transit start is rejected**  
  **Given** the vehicle is in transit  
  **When** the supervisor tries to start downtime  
  **Then** the start is **rejected** with a clear error

- [ ] **Logging a service does not set Under Maintenance**  
  **Given** a Driver Supervisor records a completed service (date and meter km)  
  **When** the service is saved  
  **Then** that service still does **not** change the vehicle to Under Maintenance

### AC-3 — Availability adjusts automatically

Given a vehicle is Under Maintenance because of an open downtime log,
when someone assigns vehicles or views the Health Dashboard,
then the vehicle is not available to assign, it appears on the Under Maintenance card, and it returns to No Active TO only when the last open downtime is ended and the vehicle is still active in the fleet.

- [ ] **Not available to assign**  
  **Given** a vehicle is Under Maintenance because of downtime  
  **When** someone looks for a vehicle to assign to a new transport order  
  **Then** that vehicle is **not** in the available list

- [ ] **Under Maintenance card includes the vehicle**  
  **Given** a vehicle is Under Maintenance because of downtime  
  **When** a Transport Planner views the Health Dashboard  
  **Then** that vehicle is included in the Under Maintenance count

- [ ] **Ending the last downtime restores No Active TO**  
  **Given** the last open downtime is ended and the vehicle is still active in the fleet  
  **When** the log is closed  
  **Then** status becomes **No Active TO**  
  **And** the vehicle can be assigned again

- [ ] **Inactive vehicle stays inactive after downtime ends**  
  **Given** a vehicle has been deactivated in master data  
  **When** a downtime log is ended  
  **Then** status does **not** become No Active TO (same as today’s inspection-clearance rule)

### AC-4 — Downtime reduces utilization hours

Given utilization is shown for a date range,
when downtime overlaps that range,
then available hours go down by the downtime hours, and utilization % is based on available hours (not the full calendar). Idle vs movement stays GPS-based (stopped when speed is below 3 km/h) and is **not** “available minus serving”.

- [ ] **Only overlapping downtime is counted**  
  **Given** a downtime log with a start time and an end time (or still open, so “now”)  
  **When** utilization is shown for a date range  
  **Then** downtime hours are only the part of that log that falls inside the date range

- [ ] **Available hours subtract downtime**  
  **Given** the hours in the date range and downtime hours in that range  
  **When** available hours are shown  
  **Then** available hours are:

  > **Available hours = Hours in the period − Downtime hours**

- [ ] **Idle vs movement is GPS, not downtime remainder**  
  **Given** GPS movement status already stored from the vehicle’s GPS device  
  **When** idle vs movement is shown on utilization  
  **Then** idle means the vehicle was stopped (speed **below 3 km/h**)  
  **And** moving means speed **3 km/h or above**  
  **And** idle is **not**:

  > **Available hours − Serving hours**

- [ ] **Utilization % uses available hours**  
  **Given** serving hours and available hours  
  **When** utilization % is shown  
  **Then** utilization % is:

  > **Utilization % = Serving hours ÷ Available hours**

  **And** this uses available hours, not the full calendar

### AC-5 — Who can see and do what

Given Driver Supervisor, Tenant Admin,Tenant Super Admin or Transport Planner users,
when they open downtime,
then supervisors and admins can create, close, and list logs; planners can view only; and this is not workshop costing or remaining-km tracking.

- [ ] **Supervisor and Tenant Admin can record downtime**  
  **Given** a user is a Driver Supervisor or Tenant Admin  
  **When** they open downtime  
  **Then** they can create, close, and list downtime

- [ ] **Transport Planner can view only**  
  **Given** a user is a Transport Planner  
  **When** they open downtime logs  
  **Then** they can **view** logs for planning  
  **And** they cannot create a log

- [ ] **Out of scope**  
  **Given** this is downtime tracking  
  **When** a user records or views a log  
  **Then** this is not workshop job costing or parts  
  **And** this is not remaining-km / service-due tracking

## Sub-tasks

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| FVM-04-1 | Requirements & story | This file (accepted by PO) | High | In Progress |
| FVM-04-2 | Implementation context | `05-modules/` after PO accept — do not start Django from this file alone | High | Pending |
| FVM-04-3 | Downtime model + supervisor form | Reason, start, end; one open log; history | High | Pending |
| FVM-04-4 | Status | Open covering now → UM via `mark_vehicle_under_maintenance`; end → No Active TO | High | Pending |
| FVM-04-5 | Availability | Assignment + FVM-02 follow status; FVM-03 subtracts downtime hours | High | Pending |
| FVM-04-6 | Tests | Validation, in-transit reject, picker exclusion, FVM-03 denominator, RBAC, DS-01 inspection path unchanged — [TDD catalog](../../../../09-testing/stories-phase-2/004-Vehicle%20Downtime%20Management/FVM-04-vehicle-downtime-management-tdd-test-cases.md) | High | Pending |

## Definition of Done

- [ ] AC-1…AC-5 checked against code
- [ ] Unit tests for open/close, overlap reject, in-transit reject, status, FVM-03 hour clip — scenarios AC-1.1…AC-5.3 — see [FVM-04 TDD catalog](../../../../09-testing/stories-phase-2/004-Vehicle%20Downtime%20Management/FVM-04-vehicle-downtime-management-tdd-test-cases.md)
- [ ] TDD catalog statuses updated for P0 rows (`Planned` → `Failing` → `Passing`)
- [ ] DS-01 inspection-fail clearance still required when there is no FVM-04 log
- [ ] FVM-01 service log still does not set UM
- [ ] `05-modules/` written (FVM-04-2) before Django merge
- [ ] Demo: Supervisor logs downtime → vehicle Under Maintenance and not assignable → ends log → No Active TO; FVM-03 available hours drop for that window

## Dependencies

- **Depends on:** Vehicle master, DS-01 `mark_vehicle_under_maintenance` / assignment exclusion, FVM-03 formulas (adjust denominator)
- **Does not depend on:** GPS, FuelEntry, FVM-01 remaining-km, Phase 3 workshop
- **Does not replace:** DS-01 checklist clearance for inspection-fail; FVM-01 service log

