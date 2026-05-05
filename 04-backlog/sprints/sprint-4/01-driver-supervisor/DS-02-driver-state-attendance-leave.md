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
| DS-02-1 | Driver state machine service + audit | DFS-051-1 | Pending |
| DS-02-2 | Manual attendance CRUD API | DFS-051-2 | Pending |
| DS-02-3 | On Leave API + TO-02 conflict guard extension | DFS-051-3 | Pending |
| DS-02-4 | Supervisor UI — attendance grid + leave calendar | DFS-051-4 | Pending |
| DS-02-5 | Read APIs for dispatch board (filtered) | DFS-051-5 | Pending |

## Dependencies

- **Requires**: MDM-06 (drivers), TO-02 (assignment), TLS-01 for **active TO execution** automation
- **Parallel**: DS-01

## Definition of Done

- [ ] §6.6.3.3–§6.6.3.4 supervisor-facing AC satisfied
- [ ] On Leave enforced on **new** assignment APIs
- [ ] UAT: driver on leave → assignment blocked; return from leave → assignable
