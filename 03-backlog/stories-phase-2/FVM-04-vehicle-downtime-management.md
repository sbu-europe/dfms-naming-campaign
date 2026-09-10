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
---

# FVM-04 — Vehicle Downtime Management

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

### AC-1 — Log downtime

- [ ] Driver Supervisor logs downtime: vehicle, **reason**, **start** datetime, **end** datetime (optional if still down)
- [ ] Each log stored with who entered it
- [ ] `end_at` < `start_at` rejected
- [ ] Second **open** downtime on the same vehicle rejected
- [ ] Supervisor can list downtime for a vehicle (newest first) and close an open log by setting end

### AC-2 — Status → Under Maintenance

- [ ] When a log **covers now** (started, not yet ended): `operational_status = under_maintenance` (`is_active` stays true)
- [ ] Assigned (not started) TOs on that vehicle follow existing DS-01 unassign (Under Planning, vehicle cleared)
- [ ] In-transit vehicle: start **rejected** with a clear error
- [ ] FVM-01 service log still does **not** set this status

### AC-3 — Availability adjusted automatically

- [ ] While Under Maintenance from FVM-04: vehicle **absent** from TDO `GET /vehicles/available` (existing rule)
- [ ] FVM-02 Under Maintenance card includes these vehicles (reads status)
- [ ] When the last covering log ends and `is_active`: status → **No Active TO**; vehicle assignable again
- [ ] Inactive master-data vehicle: ending a log does **not** set No Active TO (same block as DS-01 clearance)

### AC-4 — Reduce availability metrics (FVM-03)

- [ ] For a period, `downtime_hours` = overlap of `[start_at, end_at or now]` with the period
- [ ] FVM-03 **available hours** = calendar hours − downtime hours
- [ ] FVM-03 idle (No-TO) = available hours − serving hours (not GPS)
- [ ] FVM-03 utilization % uses **available hours** as denominator (not raw calendar)

### AC-5 — Surfaces & RBAC

- [ ] **Driver Supervisor** (+ Tenant Admin): create / close / list downtime
- [ ] Transport Planner: **view** logs (planning); cannot create
- [ ] Not Phase 3 workshop cost/parts; not FVM-01 remaining-km


## Sub-tasks

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| FVM-04-1 | Requirements & story | This file (accepted by PO) | High | In Progress |
| FVM-04-2 | Implementation context | `05-modules/` after PO accept — do not start Django from this file alone | High | Pending |
| FVM-04-3 | Downtime model + supervisor form | Reason, start, end; one open log; history | High | Pending |
| FVM-04-4 | Status | Open covering now → UM via `mark_vehicle_under_maintenance`; end → No Active TO | High | Pending |
| FVM-04-5 | Availability | Assignment + FVM-02 follow status; FVM-03 subtracts downtime hours | High | Pending |
| FVM-04-6 | Tests | Validation, in-transit reject, picker exclusion, FVM-03 denominator, RBAC, DS-01 inspection path unchanged | High | Pending |

## Definition of Done

- [ ] AC-1…AC-5 checked against code
- [ ] Unit tests for open/close, overlap reject, in-transit reject, status, FVM-03 hour clip
- [ ] DS-01 inspection-fail clearance still required when there is no FVM-04 log
- [ ] FVM-01 service log still does not set UM
- [ ] `05-modules/` written (FVM-04-2) before Django merge
- [ ] Demo: Supervisor logs downtime → vehicle Under Maintenance and not assignable → ends log → No Active TO; FVM-03 available hours drop for that window

## Dependencies

- **Depends on:** Vehicle master, DS-01 `mark_vehicle_under_maintenance` / assignment exclusion, FVM-03 formulas (adjust denominator)
- **Does not depend on:** GPS, FuelEntry, FVM-01 remaining-km, Phase 3 workshop
- **Does not replace:** DS-01 checklist clearance for inspection-fail; FVM-01 service log

