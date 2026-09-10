---
jira_key: ~
jira_type: Story
jira_sprint: ~
story_id: FVM-03
title: Vehicle Utilization Analysis
epic: Fleet & Vehicle Management — Utilization
status: Planning
story_points: 5
assignee: ~
prd_refs:
  - "§6.6.7 Vehicle Utilization Analytics"
feature_list: "SOW Phase-2 row 100 — Vehicle Utilization Analytics"
phase: Phase 2
related_stories:
  - FVM-01 (GPS idle vs movement — different clock; Top 5 vehicles by TO count is a ranking, not this analysis)
  - FVM-02 (snapshot availability cards — not period hours)
  - MDM-05 (Vehicle master)
  - AD-05 (later fleet utilization report consumes these clocks)
implementation_docs:
  - DFMS-product-context/05-modules/02-master-data/vehicle-master-data.md
---

# FVM-03 — Vehicle Utilization Analysis

## User Story

**As a** Transport Planner  
**I want** to analyze vehicle utilization  
**So that** under- or over-utilized assets can be optimized.

## Feature (PRD §6.6.7)

System SHALL calculate:

- **Trips per vehicle (Plan: single-TO or Multi-TO)**
- **Active vs idle time**

In DFMS:

- A **Plan** groups work for **one vehicle**: **one TO** (single-TO Plan) or **several TOs together** (Multi-TO Plan).
- A **trip** (this metric) = a **Plan** that completed in the period. A Multi-TO Plan counts as **one** trip, not one per TO.
- A vehicle **may serve multiple TOs at once** when they belong to the same Plan. Own-fleet “one TO at a time” exclusivity is **not** a business rule.
- **Active** = **serving** time (Start Trip → TO terminal), clipped to the period. Overlapping TO windows on the same vehicle are **merged** (union), so Multi-TO overlap is not double-counted.
- **Idle** = **No-TO** time (calendar period minus serving). Includes Scheduled (assigned, not started), No Active TO, and time outside any started TO.

**Not** GPS &lt; 3 km/h (FVM-01 idle vs movement). **Not** FVM-02’s five status cards (those are “now”).

## Business Context

Planners need to see which own-fleet trucks ran many completed **Plans** and which sat without a started TO. A Plan is one TO or several TOs (Multi-TO) on the same vehicle. Phase 1 already records trip start (`execute_trip_start` + `ExecutionMilestone`) and TO terminal statuses. This story **aggregates** that clock. It does not change assignment, DS-01, or GPS ingest.

```
Period [start, end]
  completed Plans on Vehicle   → trips_per_vehicle   (Multi-TO Plan = 1)
  serving windows (start trip → terminal), clipped, unioned → serving_hours  (active)
  calendar_hours − serving     → no_to_hours       (idle)
  serving / calendar           → utilization %
```



## Acceptance Criteria

### AC-1 — Trips per vehicle

- [ ] For the selected period, each own-fleet vehicle shows **how many completed Plans** it served (single-TO or Multi-TO; Multi-TO = **1** trip)
- [ ] Completion timestamp in the period; unique Plans (completed and later closed still count once)
- [ ] Cancelled Plans / TOs do not add to the trip count
- [ ] Vehicles with zero completed Plans still appear (0 trips) so under-use is visible
- [ ] Vendor-only trucks (no `Vehicle`) are omitted

### AC-2 — Active vs idle time

- [ ] Per vehicle, **serving hours** (active) and **No-TO hours** (idle) for the period
- [ ] Serving = union of [Start Trip, TO terminal] windows overlapping the period (merge concurrent TOs on the same Plan / vehicle)
- [ ] Idle = **available hours** minus serving (not GPS &lt; 3 km/h). Available hours = calendar − **FVM-04 downtime** hours (if no FVM-04 rows, downtime = 0)
- [ ] Planner sees a **per-vehicle chart** (stacked or two bars): serving vs No-TO
- [ ] Utilization % = serving / **available** hours in the period (0 if available is 0)

### AC-3 — Surfaces & RBAC

- [ ] **Transport Planner** (+ Tenant Admin): list + chart + period + depot filter (`assigned_poi`)
- [ ] Sort by trips or utilization %
- [ ] Driver Supervisor may view; TDO view not required in v1
- [ ] Does not write TO, Trip, or `operational_status`


## Sub-tasks

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| FVM-03-1 | Requirements & story | This file (accepted by PO) | High | In Progress |
| FVM-03-2 | Implementation context | `05-modules/` write-up after this story is accepted — do not start Django from this file alone | High | Pending |
| FVM-03-3 | Trips per vehicle | Completed **Plan** count in period (single-TO or Multi-TO) | High | Pending |
| FVM-03-4 | Serving vs No-TO hours | Clip Start Trip → terminal to period; idle = calendar − serving | High | Pending |
| FVM-03-5 | Planner UI | List, sort, depot filter, per-vehicle serving vs No-TO chart | High | Pending |
| FVM-03-6 | Tests | Trip count, hour clip, still-in-transit, scheduled=idle, GPS unused, RBAC | High | Pending |

## Definition of Done

- [ ] AC-1…AC-3 checked against code (not against this markdown)
- [ ] Unit tests for completed-Plan count, overlapping Multi-TO union (not sum), interval clipping, in-progress TO, Scheduled not counted as serving
- [ ] GPS ingest / FVM-01 idle-vs-movement / FVM-02 cards unchanged
- [ ] `05-modules/` implementation context written (FVM-03-2) before merge of Django work
- [ ] Demo: Planner picks 30 days, sees trips + serving vs No-TO per vehicle, sorts low utilization to the top

## Dependencies

- **Depends on:** own-fleet TOs + trip start milestones + terminal statuses (exist); **FVM-04** downtime hours (0 until logs exist)
- **Does not replace:** FVM-02 availability cards, FVM-01 GPS idle vs movement, DS-01 inspection path, FVM-04 downtime form

