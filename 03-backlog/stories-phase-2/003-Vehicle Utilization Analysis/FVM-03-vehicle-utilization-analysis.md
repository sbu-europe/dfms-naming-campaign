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
  - FVM-01 (idle vs movement uses the same GPS movement status; Top 5 vehicles by TO count is a ranking, not this analysis)
  - FVM-02 (snapshot availability cards — not period hours)
  - MDM-05 (Vehicle master)
  - AD-05 (later fleet utilization report consumes these clocks)
implementation_docs:
  - DFMS-product-context/05-modules/02-master-data/vehicle-master-data.md
tdd_test_cases: ../../../09-testing/stories-phase-2/003-Vehicle Utilization Analysis/FVM-03-vehicle-utilization-analysis-tdd-test-cases.md
tdd_index: ../../../09-testing/stories-phase-2/003-Vehicle Utilization Analysis/00-all-test-cases.md
---

# FVM-03 — Vehicle Utilization Analysis

## Test cases

Gherkin / TDD scenarios live under `09-testing` (not inline in this story).

| Navigate | Link |
|----------|------|
| **FVM-03 TDD catalog** (`AC-N.x` mapped) | [FVM-03-vehicle-utilization-analysis-tdd-test-cases.md](../../../09-testing/stories-phase-2/003-Vehicle%20Utilization%20Analysis/FVM-03-vehicle-utilization-analysis-tdd-test-cases.md) |
| **Vehicle Utilization TDD index** | [00-all-test-cases.md](../../../09-testing/stories-phase-2/003-Vehicle%20Utilization%20Analysis/00-all-test-cases.md) |
| **Feature TDD folder** | [README](../../../09-testing/stories-phase-2/003-Vehicle%20Utilization%20Analysis/README.md) |

Write failing tests from the catalog **before** implementation.

## User Story

**As a** Transport Planner  
**I want** to analyze vehicle utilization  
**So that** under- or over-utilized assets can be optimized.

## Feature (PRD §6.6.7)

System SHALL calculate:

- **TOs per vehicle (Plan: single-TO or Multi-TO)**
- **Active vs idle time**

In DFMS:

- A **Plan** groups work for **one vehicle**: **one TO** (single-TO Plan) or **several TOs together** (Multi-TO Plan).
- A **TO** (this metric) = a **Plan** that completed in the period. A Multi-TO Plan counts as **one** trip, not one per TO.
- A vehicle **may serve multiple TOs at once** when they belong to the same Plan. Own-fleet “one TO at a time” exclusivity is **not** a business rule.
- **Active / moving** = time the GPS shows the vehicle **moving** (speed **3 km/h or above**). Taken from the GPS movement status already stored from the vehicle’s GPS device — **not** from whether it has a trip.
- **Idle / stopped** = time the GPS shows the vehicle **stopped** (speed **below 3 km/h**). Same GPS movement status. Includes parked. **Not** “no trip”.
- **Serving hours** (for trips / utilization %) = time from Start Trip until the transport order finishes, clipped to the period. Overlapping transport orders on the same vehicle are counted **once**.

Idle vs movement is **not** FVM-02’s five status cards (those are “now”).

## Business Context

Planners need to see which own-fleet trucks ran many completed **Plans**, and how much of the period each vehicle was **moving vs stopped**. A Plan is one TO or several TOs (Multi-TO) on the same vehicle. Trip count and serving hours still come from trip start and order finish. **Idle vs movement** comes from GPS movement status already written from GPS devices (the same source as Live GPS / FVM-01). This story does not change assignment or how GPS is ingested.

```
Period [start, end]
  completed Plans on Vehicle        → trips_per_vehicle   (Multi-TO Plan = 1)
  serving windows (start trip → finish), clipped, unioned → serving_hours
  GPS movement status (vehicle, not trip) → moving hours vs idle/stopped hours
  serving / available               → utilization %
```



## Acceptance Criteria

> **Test scenarios:** see [FVM-03 TDD catalog](../../../09-testing/stories-phase-2/003-Vehicle%20Utilization%20Analysis/FVM-03-vehicle-utilization-analysis-tdd-test-cases.md) · [Vehicle Utilization index](../../../09-testing/stories-phase-2/003-Vehicle%20Utilization%20Analysis/00-all-test-cases.md)

### AC-1 — Trips per vehicle

Given a Transport Planner chooses a date range,
when they view utilization for own-fleet vehicles,
then each vehicle shows how many completed vehicle plans it served (a plan with several transport orders still counts as **1** trip), including vehicles with zero trips, and excluding cancelled work and hired vendor trucks.

- [ ] **Completed plan count**  
  **Given** own-fleet vehicles that finished vehicle plans in the chosen date range  
  **When** a Transport Planner views trips per vehicle  
  **Then** each vehicle shows **how many completed plans** it served (one transport order, or several together)  
  **And** a plan with several transport orders counts as **1** trip, not one trip per order

- [ ] **Each plan is counted once**  
  **Given** a plan finished in the period and was later closed  
  **When** trip count is shown  
  **Then** that plan is counted once  
  **And** only plans that finished during the chosen date range are counted

- [ ] **Cancelled work is not counted**  
  **Given** cancelled plans or cancelled transport orders in the period  
  **When** trip count is shown  
  **Then** they do not add to the trip count

- [ ] **Vehicles with zero trips still appear**  
  **Given** an own-fleet vehicle with no completed plans in the period  
  **When** the planner views the utilization list  
  **Then** the vehicle still appears with 0 trips so under-use is visible

- [ ] **Hired vendor trucks are left off**  
  **Given** a hired vendor truck that is not in the own-fleet vehicle list  
  **When** the utilization list is shown  
  **Then** that truck is not on the list

### AC-2 — Active vs idle time (idle vs movement)

Given GPS movement status already stored from the vehicle’s GPS device,
when a Transport Planner views utilization for a date range,
then serving hours still come from trips, and **idle vs movement** comes from GPS (stopped when speed is below 3 km/h) — not from whether the vehicle had a trip.

- [ ] **Serving hours (from trips)**  
  **Given** an own-fleet vehicle and a chosen date range  
  **When** a Transport Planner views utilization  
  **Then** the vehicle shows **serving hours** = time from trip start until the transport order finishes, clipped to the period

- [ ] **Overlapping trips are counted once**  
  **Given** a vehicle is on more than one transport order at the same time in the same plan  
  **When** serving hours are shown  
  **Then** overlapping time is counted **once**, not added twice

- [ ] **Idle vs movement from GPS**  
  **Given** GPS movement records for the vehicle in the chosen date range (the same movement status already written from GPS devices)  
  **When** idle vs movement is shown  
  **Then** idle means the vehicle was **stopped and not moving** (speed **below 3 km/h**)  
  **And** moving means speed **3 km/h or above**  
  **And** this is a **vehicle** idle-vs-movement ratio — it is **not** based on whether the vehicle had a trip  
  **And** idle vs movement is:

  > **Idle / stopped hours = Time GPS movement status is idle or stopped (speed below 3 km/h)**

  > **Moving hours = Time GPS movement status is moving (speed 3 km/h or above)**

  > **Idle vs movement ratio = Idle / stopped hours ÷ (Idle / stopped hours + Moving hours)**

- [ ] **No GPS movement records**  
  **Given** a vehicle has no GPS movement records in the date range  
  **When** idle vs movement is shown  
  **Then** idle vs movement is **unavailable**  
  **And** it is not guessed from trips or downtime

- [ ] **Available hours still subtract downtime**  
  **Given** the hours in the date range and any downtime logged for the vehicle (0 if none)  
  **When** utilization is shown  
  **Then** available hours are:

  > **Available hours = Hours in the period − Downtime hours**

  **And** available hours are used for utilization % only — they do **not** define idle

- [ ] **Chart per vehicle**  
  **Given** moving hours and idle/stopped hours for a vehicle  
  **When** a Transport Planner views that vehicle  
  **Then** they see a chart comparing **moving** vs **idle/stopped** (from GPS)

- [ ] **Utilization percent**  
  **Given** serving hours and available hours in the period  
  **When** utilization % is shown  
  **Then** utilization % is:

  > **Utilization % = Serving hours ÷ Available hours**

  **And** the result is **0** if available hours is **0**

### AC-3 — Who can see and do what

Given Transport Planner, Tenant Admin, Tenant Super Admin or Driver Supervisor users,
when they open utilization analysis,
then they can view the list, chart, date range, and depot filter, and sort — and they cannot change transport orders, trips, or vehicle availability from this screen.

- [ ] **Planner and Tenant Admin can view**  
  **Given** a user is a Transport Planner or Tenant Admin  
  **When** they open utilization analysis  
  **Then** they see the list, chart, date range, and depot filter

- [ ] **Sort by trips or utilization**  
  **Given** the utilization list is visible  
  **When** the planner sorts by trips or utilization %  
  **Then** the list is ordered by that field

- [ ] **Driver Supervisor may view**  
  **Given** a user is a Driver Supervisor  
  **When** they open utilization analysis  
  **Then** they may view it  
  **And** Transport Desk does not need this screen in the first version

- [ ] **This screen does not change assignments**  
  **Given** a user is on utilization analysis  
  **When** they view trips and hours  
  **Then** they cannot change a transport order, trip, or vehicle availability status from this screen

## Sub-tasks

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| FVM-03-1 | Requirements & story | This file (accepted by PO) | High | In Progress |
| FVM-03-2 | Implementation context | `05-modules/` write-up after this story is accepted — do not start Django from this file alone | High | Pending |
| FVM-03-3 | Trips per vehicle | Completed **Plan** count in period (single-TO or Multi-TO) | High | Pending |
| FVM-03-4 | Serving hours + idle vs movement | Clip Start Trip → finish to period; idle vs movement from GPS movement status (speed &lt; 3 km/h = idle), not trip | High | Pending |
| FVM-03-5 | Planner UI | List, sort, depot filter, per-vehicle moving vs idle/stopped chart | High | Pending |
| FVM-03-6 | Tests | Trip count, hour clip, GPS idle vs movement, no trip tagging, unavailable without GPS, RBAC — [TDD catalog](../../../09-testing/stories-phase-2/003-Vehicle%20Utilization%20Analysis/FVM-03-vehicle-utilization-analysis-tdd-test-cases.md) | High | Pending |

## Definition of Done

- [ ] AC-1…AC-3 checked against code (not against this markdown)
- [ ] Unit tests for completed-Plan count, overlapping Multi-TO union (not sum), interval clipping, GPS idle vs movement (speed below 3 km/h), idle not taken from “no trip” — scenarios AC-1.1…AC-3.4 — see [FVM-03 TDD catalog](../../../09-testing/stories-phase-2/003-Vehicle%20Utilization%20Analysis/FVM-03-vehicle-utilization-analysis-tdd-test-cases.md)
- [ ] TDD catalog statuses updated for P0 rows (`Planned` → `Failing` → `Passing`)
- [ ] GPS ingest / FVM-02 cards unchanged; idle vs movement uses the same GPS movement status as Live GPS / FVM-01
- [ ] `05-modules/` implementation context written (FVM-03-2) before merge of Django work
- [ ] Demo: Planner picks 30 days, sees trips + moving vs idle/stopped per vehicle from GPS, sorts low utilization to the top

## Dependencies

- **Depends on:** own-fleet TOs + trip start milestones + terminal statuses (exist); GPS movement status already stored from GPS devices; **FVM-04** downtime hours (0 until logs exist)
- **Does not replace:** FVM-02 availability cards, DS-01 inspection path, FVM-04 downtime form
- **Shares with FVM-01:** GPS idle vs movement (same movement status from GPS devices)

