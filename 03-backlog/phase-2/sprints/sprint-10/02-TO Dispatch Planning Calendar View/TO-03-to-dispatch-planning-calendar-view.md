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
  - TO-02 — Own-fleet assignment (vehicle, driver, helper, planned milestones)
  - VP-01 — Own-fleet Vehicle Plan (not required; overlapping TOs on one vehicle stack on that row)
  - FVM-03 — Utilization hours (different clock; not used on this calendar)
source_docs:
  - 05-modules/05-transport/to-dispatch-planning-calendar-view.md
  - ../../../../docs/prototypes/to-dispatch-planning-calendar.html
  - ../../../_meta/archive/backlog-stories-pre-sprint2/US-071-to-dispatch-planning-calendar-view.md
implementation_docs:
  - 05-modules/05-transport/to-dispatch-planning-calendar-view.md
---

# TO-03 — TO Dispatch Planning (Calendar View)

## User Story

**As a** Transport Planner  
**I want** a vehicle-lane calendar of assigned own-fleet transport orders  
**So that** I can see which truck is booked from planned start through destination departure, and the TO’s status, without opening each TO.

---

## Business Context

Planners already create TOs (TO-01) and assign vehicle, driver, helpers, and planned milestones (TO-02 / Vehicle Planning). There is no **vehicle-lane** view of that plan: the TO list is tabular, and Vehicle Planning is one vehicle at a time.

This story adds **Transport → TO dispatch planning**: a **read-only resource calendar**. Vehicles are rows; time is the axis; each assigned **own-fleet** TO is a bar on its vehicle. It does not create, assign, or change status or quantity. Assignment stays on TO detail and Vehicle Planning.

**SSOT for implementation:** [`05-modules/05-transport/to-dispatch-planning-calendar-view.md`](../../../../05-modules/05-transport/to-dispatch-planning-calendar-view.md). UI follows the live DFMS admin (Vehicle Planning, existing portal pagination), not the HTML prototype.

---

## Locked decisions (PO)


| Topic                      | Decision                                                                                                                                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Layout                     | **Vehicle-first only.** Daily, weekly, and monthly are the same resource calendar (vehicles left, time across). No separate TO month-grid. No vehicle-wise toggle.                                            |
| Fleet                      | **Own fleet only.** Period set, KPIs, bars, and filters are `fleet_type=OWN`. Vendor TOs are out of this page. No fleet-type filter. No own-vs-vendor bar chrome.                                              |
| Timeline bars              | Only own-fleet TOs with a `Vehicle` FK. **Unassigned own-fleet TOs are omitted from the timeline** (they still count in KPIs / result count / filters).                                                        |
| Bar window                 | `planned_start_at` to `planned_destination_departure_at`.                                                                                                                                                     |
| Daily / weekly / monthly   | Daily = 24 hour ticks labelled in **12-hour** time (12 AM … 11 AM, 12 PM … 11 PM). Weekly = 7 day columns (Sun–Sat). Monthly = one column per day of the month (bars snap to days).                            |
| Click                      | Read-only **drawer**. Footer: Open TO detail, Open parent TR. Calendar itself never writes.                                                                                                                   |
| Bar chrome                 | On the lane: **TO number + TO status + planned start → dest. departure**. Status uses the existing TO badge. Full fields in tooltip and drawer. Critical urgency = red outline.                               |
| Assignment filter          | `unassigned` = no `vehicle`. `assigned` = vehicle set, status not yet Ready for dispatch. `confirmed` = `ready_for_dispatch` among planning-eligible rows.                                                    |
| Planning-eligible statuses | `created`, `under_planning`, `assigned`, `ready_for_dispatch`. Exclude `cancelled` and execution/closed statuses.                                                                                             |
| Vehicle rows               | Paginated own-fleet `Vehicle` list using the **existing portal list pagination**. Column: registration, capacity, current `operational_status`. Empty / under-maintenance vehicles still appear. Overlapping TOs **stack** visually — no `N TO(s)` / `M concurrent` / **Free** label. |
| Idle gaps                  | **None.** Empty time between bars stays blank. Not GPS idle, not FVM-03 hours.                                                                                                                                |
| UI                         | Live DFMS admin design system. Prototype is behaviour/reference only.                                                                                                                                         |
| VP-01                      | Not required.                                                                                                                                                                                                 |


---

## Acceptance Criteria

### AC-1 — Shell, views, navigation

- [ ] **Given**: a Transport Planner, Tenant Admin, or Tenant Super Admin is logged in  
  **When**: they open **Transport → TO dispatch planning**  
  **Then**:
  - Breadcrumb is Home › Transport › TO dispatch planning
  - Header links to **Vehicle planning** and **All transport orders** (existing screens; unchanged)
  - Result count is the number of planning-eligible **own-fleet** TOs whose planned window (`planned_start_at` → `planned_destination_departure_at`) overlaps the period (includes unassigned own-fleet TOs)
  - Page chrome matches the live DFMS admin (same search / filter / pagination / badges as Vehicle Planning and changelists)

- [x] **Given**: the planner is on TO dispatch planning  
  **When**: they select Daily, Weekly, or Monthly  
  **Then**:
  - Daily shows 24 hour ticks in **12-hour** format (12 AM … 11 PM)
  - Weekly shows Sun–Sat day columns with today highlighted
  - Monthly shows one column per day of the month
  - Layout stays vehicle-first (vehicles left, time across) in every mode

- [x] **Given**: the planner is on TO dispatch planning  
  **When**: they use previous, next, Today, or the date picker  
  **Then**: the period label and calendar range move to that period and the lanes reload

---

### AC-2 — Vehicle lanes and TO bars

- [ ] **Given**: an own-fleet TO with a `Vehicle`, `planned_start_at`, and `planned_destination_departure_at` overlapping the visible period  
  **When**: the planner views the calendar  
  **Then**:
  - Own-fleet vehicles are paginated rows using the existing portal list pagination
  - The vehicle column shows registration, capacity (`capacity` + `capacity_unit`), and current `operational_status`
  - That TO is a bar on its vehicle from `planned_start_at` to `planned_destination_departure_at`
  - The bar shows TO number, TO status (existing badge), and start–dest. departure time
  - Critical urgency is outlined
  - Tooltip shows TO number, TO status, TR number, planned start → dest. departure, origin → destination, driver (or “Driver not assigned”)

- [x] **Given**: a planning-eligible **own-fleet** TO with no `vehicle` and a planned window in the period  
  **When**: the planner views the calendar  
  **Then**: that TO does not appear on any lane  
  **And**: it still counts in the result count and Unassigned KPI

- [x] **Given**: a vendor-fleet TO (with or without a `Vehicle` FK) overlapping the period  
  **When**: the planner views the calendar  
  **Then**: that TO is absent from every lane, KPI, and result count

- [x] **Given**: own-fleet vehicles in the tenant, including some with no TO in range, one under maintenance, one with two overlapping TOs, and one with two non-overlapping TOs  
  **When**: the planner views the calendar  
  **Then**:
  - Overlapping bars stack vertically (do not overwrite); the row does **not** show N TO(s) or concurrent
  - The empty span between non-overlapping bars is blank (no idle bar)
  - Vehicles with no TO in range still appear; the column shows capacity and current `operational_status` (no **Free** badge)
  - An under-maintenance vehicle still appears with its current `operational_status` (Under Maintenance)

---

### AC-3 — KPI cards, filters, legend

- [x] **Given**: planning-eligible own-fleet TOs in the visible period  
  **When**: the planner views the calendar  
  **Then**: cards show **TOs in period**, **Parent TRs**, **Unassigned**, and **Critical urgency** for the current period and filters  
  **And**: there is no Own fleet card (every period TO is already own-fleet)

- [x] **Given**: the planner is on TO dispatch planning  
  **When**: they open Filters and set search (TO, TR, vehicle, driver, origin, destination), transfer type (FG / Port consignment), urgency, assignment (Unassigned / Assigned / Confirmed), and/or vehicle type  
  **Then**: KPIs, result count, bars, and (for vehicle type) listed vehicle rows match the filters  
  **And**: there is no fleet-type filter  
  **And**: Clear restores all filters

- [ ] **Given**: the planner is on TO dispatch planning  
  **When**: they view the page  
  **Then**: a legend shows urgency badges, assignment badges, and that a bar is planned start → dest. departure  
  **And**: the legend does not show fleet colors or an idle gap

---

### AC-4 — Read-only drawer

- [x] **Given**: an assigned TO bar is visible  
  **When**: the planner clicks the bar  
  **Then**:
  - A drawer opens without navigating away
  - It shows the note “Read-only in calendar view.”
  - It lists status, assignment, urgency, vehicle (or Unassigned), vehicle type, driver, helper, source POI, destination POI, allocated qty, planned start, planned dest. arrival, planned dest. departure
  - It does not list fleet type
  - Footer has **Open TO detail** and **Open parent TR**
  - The selected bar stays emphasized; other bars may dim

- [x] **Given**: the drawer is open  
  **When**: the planner clicks X, the backdrop, or Escape  
  **Then**: the drawer closes  
  **And**: **Open TO detail** / **Open parent TR** open those existing screens and do not edit from the calendar

---

### AC-5 — Read-only and RBAC

- [ ] **Given**: a user with Transport Planner, Tenant Admin, or Tenant Super Admin  
  **When**: they use the portal  
  **Then**: they see **TO dispatch planning**  
  **And**: other roles do not see the item unless explicitly granted

- [x] **Given**: the planner is on TO dispatch planning  
  **When**: they navigate, filter, open the drawer, or follow Open TO / Open TR  
  **Then**: no calendar action changes TO status, quantity, vehicle, driver, or helpers  
  **And**: the calendar does not write `TransportOrder`, assignment, or `Vehicle.operational_status`

---

## Business Rules


| ID          | Rule                                                                                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| BR-TO03-001 | Period set = planning-eligible **own-fleet** TOs whose `[planned_start_at, planned_destination_departure_at]` overlaps the visible range.              |
| BR-TO03-002 | Timeline draws only period TOs that have a `Vehicle` FK. Unassigned own-fleet TOs count in KPIs and filters only. Vendor TOs are excluded entirely.    |
| BR-TO03-003 | Bar window and label end are `planned_start_at` to `planned_destination_departure_at`. Monthly view snaps that window to calendar days.                 |
| BR-TO03-004 | Calendar never mutates a TO. Assignment and status stay on existing screens.                                                                           |
| BR-TO03-005 | No vendor lanes, no fleet-type filter, no own-vs-vendor bar chrome.                                                                                    |
| BR-TO03-006 | No idle bars. Empty time between a vehicle’s TOs stays blank.                                                                                          |
| BR-TO03-007 | Assignment filter: unassigned = no vehicle; assigned = vehicle set and not yet Ready for dispatch; confirmed = Ready for dispatch (planning-eligible). |


---

## Sub-tasks


| #       | Sub-task                | Description                                                                                            | Priority | Status       |
| ------- | ----------------------- | ------------------------------------------------------------------------------------------------------ | -------- | ------------ |
| TO-03-1 | Specs                   | `05-modules/` write-up — do not start Django from this file alone                                      | High     | **Done** |
| TO-03-2 | Query                   | Own-fleet period overlap on planned start/dest departure; planning-eligible statuses; four KPI aggregations | High     | **Partial** |
| TO-03-3 | Resource calendar       | Daily (24 ticks, 12-hour labels) / weekly / monthly vehicle lanes, existing portal pagination, stacked bars (no idle), today mark, bar = TO number + status + start → dest. departure | High     | **Partial** |
| TO-03-4 | Filters + KPIs + legend | Search and four filter selects (no fleet type); four stat cards; legend without fleet/idle             | High     | **Partial** |
| TO-03-5 | Drawer                  | Read-only drawer + Open TO / Open TR                                                                   | High     | **Done** |
| TO-03-6 | Nav + RBAC              | Transport → TO dispatch planning; permission for Transport Planner, Tenant Admin, and Tenant Super Admin | High     | **Partial** |
| TO-03-7 | Tests                   | Unassigned omitted from lanes but counted; vendor excluded; bar window; stack without concurrent label; filters; RBAC; no writes | High     | **Done** |


---

## Dependencies


| Dependency               | Notes                                                                            |
| ------------------------ | -------------------------------------------------------------------------------- |
| TO-01                    | TOs already exist                                                                |
| TO-02 / Vehicle Planning | `vehicle`, driver, helpers, `planned_start_at`, `planned_destination_departure_at` |
| Parent TR                | TR number, urgency, FG vs Port                                                   |
| Vehicle master           | Registration, capacity, operational status                                       |
| VP-01                    | Optional later; overlapping TOs already stack on one vehicle row                 |
| FVM-03 / FVM-04          | Do not reuse those hour clocks on this grid                                      |


---

## Test Plan

- [ ] Weekly vehicle lanes show assigned own-fleet TOs as bars from planned start to dest. departure, with TO number and status
- [x] Unassigned own-fleet TO is in the Unassigned KPI and result count, and is **absent** from every lane
- [x] Vendor TO is absent from lanes, KPIs, and result count
- [x] Two overlapping TOs on one truck stack; row does **not** show concurrent
- [x] Empty time between two non-overlapping bars has **no** idle bar
- [x] Empty and under-maintenance vehicles still appear; column shows capacity + current operational status (no Free badge)
- [x] Daily view has 24 hour ticks labelled 12 AM–11 PM; monthly bars snap to days
- [x] Filter by urgency, transfer type, assignment, vehicle type, and search (no fleet type); Clear restores
- [x] Click bar opens drawer; Open TO detail / Open parent TR; calendar does not change status
- [x] Roles other than Transport Planner, Tenant Admin, and Tenant Super Admin do not see the menu
- [x] Pagination uses the existing portal list pager

---

## Definition of Done

- [ ] AC-1–AC-5 met against the live DFMS admin (vehicle lanes, not a TO month-grid; not the prototype chrome)
- [ ] Sub-tasks TO-03-1 … TO-03-7 completed
- [x] `05-modules/` implementation context written (TO-03-1) before merge of Django work
- [x] Transport orders list and Vehicle planning unchanged
- [x] Tests cover unassigned-omitted-from-lanes, vendor-excluded, bar window (start → dest. departure), stack, no idle, filters, RBAC
- [ ] Story status updated for Phase 2 tracking

---

## Out of scope

- Separate TO-centric month/week grid (PRD sketch)
- Drawing unassigned TOs on the timeline
- Drag-and-drop reassignment or any write from the calendar
- Creating TOs from the calendar
- Vendor-fleet TOs (period set, KPIs, bars) and vendor-fleet vehicle rows
- Fleet-type filter, Own fleet KPI, own-vs-vendor bar chrome
- Idle / dashed gap bars
- `N TO(s)` / concurrent / Free labels on the vehicle row
- Capacity utilization bars
- GPS idle / FVM-03 serving hours on this grid
- Replacing Vehicle Planning or the TO list
- Theme toggle / prototype-only chrome

---

## Notes

- Menu label: **TO dispatch planning**.
- Bar end is `planned_destination_departure_at` (not dest. arrival). Dest. arrival stays in the drawer as extra detail.
- Do not start Django until TO-03-1 has a `05-modules/` write-up (done).
