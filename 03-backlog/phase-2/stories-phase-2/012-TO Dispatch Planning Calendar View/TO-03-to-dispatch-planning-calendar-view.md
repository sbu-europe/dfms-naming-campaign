---
jira_key: ~
jira_type: Story
jira_sprint: ~
story_id: TO-03
title: TO Dispatch Planning — Calendar View
epic: Transport Planning Optimization
status: Pending
story_points: 13
assignee: ~
prd_refs:
  - "§ TO Dispatch Planning (Calendar View) — DFMS_Product_Requirements_Document_v3.md"
  - "02-domain/02-requirements/03-functional-requirements/functional-requirements-summary.md § 3.9"
phase: Phase 2
related_stories:
  - TO-01 — Transport Order creation (calendar reads existing TOs)
  - TO-02 — Own-fleet / vendor assignment (vehicle, driver, helper, planned milestones)
  - VP-01 — Own-fleet Vehicle Plan (not required; overlapping TOs on one vehicle stack on that row)
  - FVM-03 — Utilization hours (different clock; calendar idle gaps are visual gaps between planned bars)
source_docs:
  - ../../../../../docs/prototypes/to-dispatch-planning-calendar.html
  - ../../../../_meta/archive/backlog-stories-pre-sprint2/US-071-to-dispatch-planning-calendar-view.md
implementation_docs:
  - docs/prototypes/to-dispatch-planning-calendar.html
---

# TO-03 — TO Dispatch Planning (Calendar View)

## User Story

**As a** Transport Planner  
**I want** a vehicle-lane calendar of assigned transport orders  
**So that** I can see which truck is booked from planned start through destination arrival, and spot idle gaps without opening each TO.

---

## Business Context

Planners already create TOs (TO-01) and assign vehicle, driver, helpers, and planned milestones (TO-02 / Vehicle Planning). There is no **vehicle-lane** view of that plan: the TO list is tabular, and Vehicle Planning is one vehicle at a time.

This story adds **Transport → TO dispatch planning**: a **read-only resource calendar**. Vehicles are rows; time is the axis; each assigned TO is a bar on its vehicle. It does not create, assign, or change status or quantity. Assignment stays on TO detail and Vehicle Planning.

---

## Locked decisions (PO)


| Topic                      | Decision                                                                                                                                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Layout                     | **Vehicle-first only.** Daily, weekly, and monthly are the same resource calendar (vehicles left, time across). No separate TO month-grid. No vehicle-wise toggle.                                            |
| Timeline bars              | Only TOs with an own-fleet `Vehicle` FK. **Unassigned TOs are omitted from the timeline** (they still count in KPIs / result count / filters).                                                                |
| Bar window                 | `planned_start_at` to `planned_destination_arrival_at`.                                                                                              |
| Daily / weekly / monthly   | Daily = 24 hour ticks labelled in **12-hour** time (12 AM … 11 AM, 12 PM … 11 PM). Weekly = 7 day columns. Monthly = one column per day of the month (bars snap to days).                                      |
| Click                      | Read-only **drawer**. Footer: Open TO detail, Open parent TR. Calendar itself never writes.                                                                                                                   |
| Bar chrome                 | On the lane: **TO number + start–end time**. Full fields in tooltip and drawer. Critical urgency = red outline. Own vs vendor = left-border color.                                                            |
| Assignment filter          | `unassigned` = no `vehicle`. `assigned` = vehicle set, status not yet Ready for dispatch. `confirmed` = `ready_for_dispatch` or later among planning-eligible rows.                                           |
| Planning-eligible statuses | `created`, `under_planning`, `assigned`, `ready_for_dispatch`. Exclude `cancelled` and execution/closed statuses.                                                                                             |
| Vendor fleet               | No vendor vehicle rows. Vendor TOs without a `Vehicle` never draw a bar (same as unassigned).                                                                                                                 |
| Vehicle rows               | Paginated own-fleet `Vehicle` list using the existing portal list pagination (not a fixed 6-per-page). Empty / under-maintenance vehicles still appear. Overlapping TOs **stack** on extra lanes; label shows `N TO(s)` and `M concurrent` when stacked. |
| Idle gaps                  | Dashed “idle” span between that vehicle’s bars in the visible range. Not GPS idle, not FVM-03 hours.                                                                                                          |
| VP-01                      | Not required.                                                                                                                                                                                                 |


---

## Acceptance Criteria

### AC-1 — Shell, views, navigation

- [ ] **Given**: a Transport Planner, Tenant Admin, or Tenant Super Admin is logged in  
  **When**: they open **Transport → TO dispatch planning**  
  **Then**:
  - Breadcrumb is Home › Transport › TO dispatch planning
  - Header links to **Vehicle planning** and **All transport orders** (existing screens; unchanged)
  - Result count is the number of planning-eligible TOs whose planned window overlaps the period (includes unassigned)

- [ ] **Given**: the planner is on TO dispatch planning  
  **When**: they select Daily, Weekly, or Monthly  
  **Then**:
  - Daily shows 24 hour ticks in **12-hour** format (12 AM … 11 PM)
  - Weekly shows Sun–Sat day columns with today highlighted
  - Monthly shows one column per day of the month
  - Layout stays vehicle-first (vehicles left, time across) in every mode

- [ ] **Given**: the planner is on TO dispatch planning  
  **When**: they use previous, next, Today, or the date picker  
  **Then**: the period label and calendar range move to that period and the lanes reload

---

### AC-2 — Vehicle lanes and TO bars

- [ ] **Given**: an own-fleet TO with a `Vehicle`, `planned_start_at`, and `planned_destination_arrival_at` overlapping the visible period  
  **When**: the planner views the calendar  
  **Then**:
  - Own-fleet vehicles are paginated rows (registration, vehicle type, capacity) using the existing portal list pagination
  - That TO is a bar on its vehicle from `planned_start_at` to `planned_destination_arrival_at`
  - The bar shows TO number and start–end time
  - Own-fleet vs vendor-fleet bars are visually distinct
  - Critical urgency is outlined
  - Tooltip shows TO number, TR number, start–end datetimes, origin → destination, driver (or “Driver not assigned”)

- [ ] **Given**: a planning-eligible TO with no `vehicle` and a planned window in the period  
  **When**: the planner views the calendar  
  **Then**: that TO does not appear on any lane  
  **And**: it still counts in the result count and Unassigned KPI

- [ ] **Given**: own-fleet vehicles in the tenant, including some with no TO in range, one under maintenance, one with two overlapping TOs, and one with two non-overlapping TOs  
  **When**: the planner views the calendar  
  **Then**:
  - Overlapping bars stack vertically (do not overwrite); the row shows **N TO(s)** and **M concurrent**
  - The empty span between non-overlapping bars is an **idle** gap
  - Vehicles with no TO in range still appear as empty rows with **Free**
  - An under-maintenance vehicle still appears with **Under maintenance**

---

### AC-3 — KPI cards, filters, legend

- [ ] **Given**: planning-eligible TOs in the visible period  
  **When**: the planner views the calendar  
  **Then**: cards show **TOs in period**, **Parent TRs**, **Unassigned**, **Critical urgency**, and **Own fleet** for the current period and filters

- [ ] **Given**: the planner is on TO dispatch planning  
  **When**: they open Filters and set search (TO, TR, vehicle, driver, origin, destination), fleet type, transfer type (FG / Port consignment), urgency, assignment (Unassigned / Assigned / Confirmed), and/or vehicle type  
  **Then**: KPIs, result count, bars, and (for vehicle type) listed vehicle rows match the filters  
  **And**: Clear restores all filters

- [ ] **Given**: the planner is on TO dispatch planning  
  **When**: they view the page  
  **Then**: a legend shows fleet colors, urgency badges, assignment badges, idle gap, and that a bar is planned start → dest. arrival

---

### AC-4 — Read-only drawer

- [ ] **Given**: an assigned TO bar is visible  
  **When**: the planner clicks the bar  
  **Then**:
  - A drawer opens without navigating away
  - It shows the note “Read-only in calendar view.”
  - It lists status, assignment, urgency, fleet type, vehicle (or Unassigned), vehicle type, driver, helper, source POI, destination POI, allocated qty, planned start, planned dest. arrival
  - Footer has **Open TO detail** and **Open parent TR**
  - The selected bar stays emphasized; other bars may dim

- [ ] **Given**: the drawer is open  
  **When**: the planner clicks X, the backdrop, or Escape  
  **Then**: the drawer closes  
  **And**: **Open TO detail** / **Open parent TR** open those existing screens and do not edit from the calendar

---

### AC-5 — Read-only and RBAC

- [ ] **Given**: a user with Transport Planner, Tenant Admin, or Tenant Super Admin  
  **When**: they use the portal  
  **Then**: they see **TO dispatch planning**  
  **And**: other roles do not see the item unless explicitly granted

- [ ] **Given**: the planner is on TO dispatch planning  
  **When**: they navigate, filter, open the drawer, or follow Open TO / Open TR  
  **Then**: no calendar action changes TO status, quantity, vehicle, driver, or helpers  
  **And**: the calendar does not write `TransportOrder`, assignment, or `Vehicle.operational_status`

---

## Business Rules


| ID          | Rule                                                                                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| BR-TO03-001 | Period set = planning-eligible, non-cancelled TOs whose `[planned_start_at, planned_destination_arrival_at]` overlaps the visible range.               |
| BR-TO03-002 | Timeline draws only period TOs that have an own-fleet `Vehicle`. Unassigned TOs count in KPIs and filters only.                                        |
| BR-TO03-003 | Bar window is `planned_start_at` to `planned_destination_arrival_at`. Monthly view snaps that window to calendar days.                                |
| BR-TO03-004 | Calendar never mutates a TO. Assignment and status stay on existing screens.                                                                           |
| BR-TO03-005 | Own vs vendor is visual only on bars. Vendor TOs without a `Vehicle` have no lane.                                                                     |
| BR-TO03-006 | Idle gap = empty time between that vehicle’s bars in the visible range.                                                                                |
| BR-TO03-007 | Assignment filter: unassigned = no vehicle; assigned = vehicle set and not yet Ready for dispatch; confirmed = Ready for dispatch (planning-eligible). |


---

## Sub-tasks


| #       | Sub-task                | Description                                                                                            | Priority | Status       |
| ------- | ----------------------- | ------------------------------------------------------------------------------------------------------ | -------- | ------------ |
| TO-03-1 | Specs                   | `05-modules/` write-up from this story + the HTML prototype — do not start Django from this file alone | High     | **Not done** |
| TO-03-2 | Query                   | Period overlap on planned start/dest arrival; planning-eligible statuses; KPI aggregations             | High     | **Not done** |
| TO-03-3 | Resource calendar       | Daily (24 ticks, 12-hour labels) / weekly / monthly vehicle lanes, existing portal pagination, stacked bars, idle gaps, today mark | High     | **Not done** |
| TO-03-4 | Filters + KPIs + legend | Search and the five filter selects; five stat cards; legend                                            | High     | **Not done** |
| TO-03-5 | Drawer                  | Read-only drawer + Open TO / Open TR                                                                   | High     | **Not done** |
| TO-03-6 | Nav + RBAC              | Transport → TO dispatch planning; permission for Transport Planner, Tenant Admin, and Tenant Super Admin | High     | **Not done** |
| TO-03-7 | Tests                   | Unassigned omitted from lanes but counted; bar window; overlap stack; filters; RBAC; no writes         | High     | **Not done** |


---

## Dependencies


| Dependency               | Notes                                                                            |
| ------------------------ | -------------------------------------------------------------------------------- |
| TO-01                    | TOs already exist                                                                |
| TO-02 / Vehicle Planning | `vehicle`, driver, helpers, `planned_start_at`, `planned_destination_arrival_at` |
| Parent TR                | TR number, urgency, FG vs Port                                                   |
| Vehicle master           | Registration, type, capacity, operational status (under maintenance badge)       |
| VP-01                    | Optional later; overlapping TOs already stack on one vehicle row                 |
| FVM-03 / FVM-04          | Do not reuse those hour clocks for idle-gap highlighting                         |


---

## Test Plan

- [ ] Weekly vehicle lanes show assigned TOs as bars from planned start to dest. arrival
- [ ] Unassigned TO is in the Unassigned KPI and result count, and is **absent** from every lane
- [ ] Two overlapping TOs on one truck stack; row shows concurrent
- [ ] Idle gap appears between two non-overlapping bars on the same vehicle
- [ ] Empty and under-maintenance vehicles still appear; Free vs Under maintenance badges
- [ ] Daily view has 24 hour ticks labelled 12 AM–11 PM; monthly bars snap to days
- [ ] Filter by urgency, fleet, transfer type, assignment, vehicle type, and search; Clear restores
- [ ] Click bar opens drawer; Open TO detail / Open parent TR; calendar does not change status
- [ ] Vendor TO with no `Vehicle` never draws a bar
- [ ] Roles other than Transport Planner, Tenant Admin, and Tenant Super Admin do not see the menu

---

## Definition of Done

- [ ] AC-1–AC-5 met against the prototype layout (vehicle lanes, not a TO month-grid)
- [ ] Sub-tasks TO-03-1 … TO-03-7 completed
- [ ] `05-modules/` implementation context written (TO-03-1) before merge of Django work
- [ ] Transport orders list and Vehicle planning unchanged
- [ ] Tests cover unassigned-omitted-from-lanes, bar window, stack, idle gap, filters, RBAC
- [ ] Story status updated for Phase 2 tracking

---

## Out of scope

- Separate TO-centric month/week grid (PRD sketch; not in the prototype)
- Drawing unassigned TOs on the timeline
- Drag-and-drop reassignment or any write from the calendar
- Creating TOs from the calendar
- Vendor-fleet vehicle rows
- Capacity utilization bars
- GPS idle / FVM-03 serving hours on this grid
- Replacing Vehicle Planning or the TO list
- Theme toggle (prototype chrome only)

---

## Notes

- Menu label: **TO dispatch planning** (prototype title / breadcrumb).
- Bar copy in the prototype help (“planned departure”) maps to field `planned_start_at`.
- Do not start Django until TO-03-1 has a `05-modules/` write-up.

