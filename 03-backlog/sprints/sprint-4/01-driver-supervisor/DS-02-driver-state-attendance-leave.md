---
jira_key: DFS-051
jira_type: Story
jira_epic: ~
jira_sprint: "Sprint 4"
story_id: DS-02
title: Driver Supervisor — Driver State, Attendance & Leave
epic: Driver Supervisor & Crew
status: Pending
story_points: 5
assignee: ~
prd_refs:
  - "§6.6.3.3 Driver State Tracking (Phase 1)"
  - "§6.6.3.4 Driver Availability Status Tracking (Phase 1)"
---

# DS-02 — Driver State, Attendance & Leave

## User Story

**As a** Driver Supervisor  
**I want to** record driver attendance, manage **On Leave**, and see driver operational state  
**So that** planners and TDOs only schedule drivers who are actually available

## Business Context

PRD §6.6.3.3–§6.6.3.4 (Phase 1). **Not in scope**: §6.6.3.5 Driver Performance (Phase 3); §6.6.3.1 / §6.6.3.2 / §6.6.3.6 / §6.6.3.7 are **master + TDO assignment** (Sprint 2 / Sprint 3) — this story adds **supervisor operational truth** and **automatic state** from **active TO execution** (TLS-01).

## Acceptance Criteria

### AC-1: Driver states (system of record)
- [ ] Supported states: **Available** (default unassigned), **Assigned**, **On Leave**; **On execution** (working label: e.g. “on TO”) derived from **active TO** on road/yard (TLS-01) and **takes precedence** over other labels in UI
- [ ] State transitions audit-logged; exposed in supervisor menu and (read-only) dispatch/TDO views per RBAC

### AC-2: Automatic updates
- [ ] On TO assignment / TO execution start / TO completion hooks update driver state per rules agreed with TLS-01 *(document intersection in implementation spec)*

### AC-3: Manual attendance
- [ ] Supervisor can enter: driver, POI, entry date/time, exit date/time
- [ ] Records are date-wise and driver-specific; consolidated view for working hours (**manual** attendance in Sprint 4; VTG/GPS merge deferred with map/tracking backlog)

### AC-4: On Leave
- [ ] Supervisor sets driver **On Leave** with start and end dates
- [ ] On Leave drivers **cannot** be selected on new TDO assignments (extends TO-02 validation at API level if reassignment occurs in Sprint 4)

### AC-5: Working hours guardrail
- [ ] Configurable **maximum working hours** per day (default reference 12h); warning (not hard block in MVP unless product confirms) when exceeded

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| DS-02-1 | `DriverState` enum/field on `Driver` model + migration — states: Available, Assigned, On Leave, On Execution | DFS-051-1 | Pending |
| DS-02-2 | `DriverAttendance` model + migration — driver FK, POI FK, entry_datetime, exit_datetime, date; unique-together (driver, date) | DFS-051-2 | Pending |
| DS-02-3 | `DriverLeave` model + migration — driver FK, start_date, end_date, reason, created_by | DFS-051-3 | Pending |
| DS-02-4 | `DriverStateLog` audit model + migration — driver FK, from_state, to_state, changed_by, timestamp, trigger (manual / auto) | DFS-051-4 | Pending |
| DS-02-5 | Working hours config — `TenantSetting` or `WorkingHoursConfig` model for max daily hours (default 12h) | DFS-051-5 | Pending |
| DS-02-6 | `DriverStateAdmin` — `list_display` with `state_badge` method, `list_filter` (state, POI), search by driver name; read-only for non-supervisor roles via `get_readonly_fields` | DFS-051-6 | Pending |
| DS-02-7 | `DriverAttendanceAdmin` — list + change form; `save_model` validates date/driver uniqueness, calculates working hours, warns when exceeding configured max | DFS-051-7 | Pending |
| DS-02-8 | `DriverLeaveAdmin` — leave form with date range picker; `save_model` validates no overlap, transitions driver state to On Leave | DFS-051-8 | Pending |
| DS-02-9 | Driver state machine service — transition rules, validation, `DriverStateLog` audit entries on every transition | DFS-051-9 | Pending |
| DS-02-10 | TLS-01 hooks — auto-update driver state on TO assignment (`Available` → `Assigned`), execution start (`Assigned` → `On Execution`), TO completion (`On Execution` → `Available`) | DFS-051-10 | Pending |
| DS-02-11 | Attendance CRUD API — `POST /GET /PATCH /DELETE /api/v1/driver-attendance` | DFS-051-11 | Pending |
| DS-02-12 | Leave CRUD API — `POST /GET /PATCH /api/v1/driver-leave` + cancel endpoint | DFS-051-12 | Pending |
| DS-02-13 | Driver state board API — `GET /api/v1/drivers/state-board` (filterable by state, POI) | DFS-051-13 | Pending |
| DS-02-14 | TO-02 conflict guard extension — On Leave drivers blocked from new TDO assignment at API level | DFS-051-14 | Pending |
| DS-02-15 | Working hours guardrail — warning response when daily attendance hours exceed configured max | DFS-051-15 | Pending |
| DS-02-16 | Supervisor UI (Sprint 4 = Django Admin only) — see note below | DFS-051-16 | Pending |
| DS-02-17 | Audit logging on all state transitions, attendance entries, and leave records | DFS-051-17 | Pending |

**Sprint 4 UI delivery (DS-02-16)** — aligns with [Sprint 4 Implementation Overview](../../../../05-modules/SPRINT-4-IMPLEMENTATION-OVERVIEW.md) **Django Admin first**. “Attendance grid”, “leave calendar”, and “driver state board” mean **operational views built with `ModelAdmin` changelists** (columns, `list_filter`, `date_hierarchy` / date-scoped navigation, search, ordering, badges on list rows) plus standard add/change forms — **not** a separate SPA, full-page calendar widget, or custom grid component unless product opens a follow-up story. DS-02-7, DS-02-8, and DS-02-6 (or equivalent read-only state list) satisfy DS-02-16 when exposed in portal nav to the right URLs.

## API Endpoints

```
GET    /api/v1/drivers/state-board                              # Driver state board — filterable by state, POI
GET    /api/v1/drivers/{driver_id}/state                        # Single driver current state + transition history

POST   /api/v1/driver-attendance                                # Create attendance record
GET    /api/v1/driver-attendance?driver=&date_from=&date_to=&poi=
PATCH  /api/v1/driver-attendance/{id}                           # Edit attendance entry
DELETE /api/v1/driver-attendance/{id}                           # Delete attendance entry

POST   /api/v1/driver-leave                                     # Create leave record (start/end dates, reason)
GET    /api/v1/driver-leave?driver=&status=&date_from=&date_to=
PATCH  /api/v1/driver-leave/{id}                                # Edit leave dates (before start only)
POST   /api/v1/driver-leave/{id}/cancel                         # Cancel leave early; driver → Available
```

## Access & Permissions

> Full menu structure and role-access matrix: [`README.md`](../README.md)

| Action | Role |
|--------|------|
| View driver state board | Driver Supervisor, TDO (read-only), Dispatch Manager (read-only) |
| Record manual attendance | Driver Supervisor |
| Edit / delete attendance | Driver Supervisor |
| Set driver On Leave | Driver Supervisor |
| Cancel leave early | Driver Supervisor |
| View attendance grid (Django Admin changelist — filters / date drill-down) | Driver Supervisor |
| View leave calendar (Django Admin changelist — date hierarchy / filters; not a separate calendar app) | Driver Supervisor, TDO (read-only) |

## Dependencies

- **Requires**: MDM-06 (drivers), TO-02 (assignment), TLS-01 for **active TO execution** automation
- **Parallel**: DS-01

## Definition of Done

- [ ] **Driver state model**: `Driver.state` enum field with Available, Assigned, On Leave, On Execution — default Available; migration applied cleanly
- [ ] **Attendance model**: `DriverAttendance` stores driver, POI, entry/exit datetime, date — unique-together (driver, date) enforced at DB level
- [ ] **Leave model**: `DriverLeave` stores driver, start/end dates, reason — `DriverLeaveAdmin.save_model` transitions driver state to On Leave
- [ ] **State board admin**: `DriverStateAdmin` list view shows state badges, filterable by state and POI; read-only for non-supervisor roles via `get_readonly_fields`
- [ ] **Attendance admin**: `DriverAttendanceAdmin` enforces date/driver uniqueness in `save_model`; working hours warning displayed when threshold exceeded
- [ ] **State machine service**: handles all transition rules; rejects invalid transitions (e.g. On Leave → Assigned) with descriptive errors; logs every transition to `DriverStateLog`
- [ ] **TLS-01 hooks wired**: driver state auto-updates on TO assignment, execution start, and TO completion — verified by integration test
- [ ] **On Leave blocks assignment**: TO-02 API returns validation error when TDO attempts to assign an On Leave driver
- [ ] **Working hours guardrail**: API returns warning when daily attendance total exceeds configured max (default 12h); soft block in MVP
- [ ] **Audit trail complete**: every state transition, attendance record, and leave record logged with user, timestamp, before/after state
- [ ] **Unit tests**: state transition rules, On Leave → assignment block, working hours calculation, date overlap rejection
- [ ] **UAT — attendance**: supervisor records attendance → visible on **Driver Attendance** admin changelist (“grid”) with calculated working hours
- [ ] **UAT — leave**: supervisor sets driver On Leave → TDO cannot assign that driver; leave ends or cancelled → driver becomes Available again
