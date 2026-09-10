---
jira_key: ~
jira_type: Story
jira_sprint: ~
story_id: "004"
title: Vehicle Downtime Management
epic: Fleet & Vehicle Management — Downtime
status: Planning
story_points: 5
assignee: ~
spec_file: US-vehicle-downtime-management.md
prd_refs:
  - "Vehicle Downtime Management (PRD, after §6.6.7)"
feature_list: "SOW Phase-2 row 101 — Vehicle Downtime Management"
phase: Phase 2
related_stories:
  - DS-01 (Under Maintenance + clearance — same status; 004 adds reason/start/end log)
  - "001 (service log does not set Under Maintenance)"
  - "002 (reads operational_status — Under Maintenance card)"
  - "003 (availability metrics subtract 004 downtime hours)"
implementation_docs:
  - DFMS-product-context/05-modules/02-master-data/vehicle-master-data.md
---

# 004 — Vehicle Downtime Management

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

**004** is the downtime **record**: reason, `start_at`, `end_at`. While a downtime is **open** (`end_at` null or `end_at` in the future), the vehicle is Under Maintenance — TDO cannot assign it (existing picker), 002 Under Maintenance count goes up. When the supervisor **ends** the log, status returns to **No Active TO** (if master-data `is_active` and no other open downtime).

```
Driver Supervisor
  logs downtime (vehicle, reason, start_at [, end_at])
      → VehicleDowntime row
      → if covering now: operational_status = under_maintenance
         (reuse mark_vehicle_under_maintenance — unassign Assigned TOs)
      → 002 card + GET /vehicles/available follow status
      → 003 subtracts [start_at, end_at] from available hours
```

**001 `VehicleServiceLog` does not set Under Maintenance.** Phase 3 workshop jobs (cost/parts) are not this story.


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
- [ ] 001 service log still does **not** set this status

### AC-3 — Availability adjusted automatically

- [ ] While Under Maintenance from 004: vehicle **absent** from TDO `GET /vehicles/available` (existing rule)
- [ ] 002 Under Maintenance card includes these vehicles (reads status)
- [ ] When the last covering log ends and `is_active`: status → **No Active TO**; vehicle assignable again
- [ ] Inactive master-data vehicle: ending a log does **not** set No Active TO (same block as DS-01 clearance)

### AC-4 — Reduce availability metrics (003)

- [ ] For a period, `downtime_hours` = overlap of `[start_at, end_at or now]` with the period
- [ ] 003 **available hours** = calendar hours − downtime hours
- [ ] 003 idle (No-TO) = available hours − serving hours (not GPS)
- [ ] 003 utilization % uses **available hours** as denominator (not raw calendar)

### AC-5 — Surfaces & RBAC

- [ ] **Driver Supervisor** (+ Tenant Admin): create / close / list downtime
- [ ] Transport Planner: **view** logs (planning); cannot create
- [ ] Not Phase 3 workshop cost/parts; not 001 remaining-km


## Sub-tasks

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| 004-1 | Requirements & story | This folder (accepted by PO) | High | In Progress |
| 004-2 | Implementation context | `05-modules/` after PO accept — do not start Django from this folder alone | High | Pending |
| 004-3 | Downtime model + supervisor form | Reason, start, end; one open log; history | High | Pending |
| 004-4 | Status | Open covering now → UM via `mark_vehicle_under_maintenance`; end → No Active TO | High | Pending |
| 004-5 | Availability | Assignment + 002 follow status; 003 subtracts downtime hours | High | Pending |
| 004-6 | Tests | Validation, in-transit reject, picker exclusion, 003 denominator, RBAC, DS-01 inspection path unchanged | High | Pending |

## Definition of Done

- [ ] AC-1…AC-5 checked against code
- [ ] Unit tests for open/close, overlap reject, in-transit reject, status, 003 hour clip
- [ ] DS-01 inspection-fail clearance still required when there is no 004 log
- [ ] 001 service log still does not set UM
- [ ] `05-modules/` written (004-2) before Django merge
- [ ] Demo: Supervisor logs downtime → vehicle Under Maintenance and not assignable → ends log → No Active TO; 003 available hours drop for that window

## Dependencies

- **Depends on:** Vehicle master, DS-01 `mark_vehicle_under_maintenance` / assignment exclusion, 003 formulas (adjust denominator)
- **Does not depend on:** GPS, FuelEntry, 001 remaining-km, Phase 3 workshop
- **Does not replace:** DS-01 checklist clearance for inspection-fail; 001 service log

