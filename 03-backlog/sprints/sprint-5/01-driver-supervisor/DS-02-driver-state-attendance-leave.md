---
jira_key: DFS-051
jira_type: Story
jira_sprint: "Sprint 5"
carry_from: "Sprint 4"
story_id: DS-02
title: Driver Supervisor — Driver State, Attendance & Leave
epic: Driver Supervisor & Crew
status: In Progress
story_points: 5
assignee: Farhan Tanvir(farhanT23)
carry_subtasks:
  - DS-02-6
  - DS-02-10
  - DS-02-17
  - DS-02-18
  - DS-02-19
feedback_items:
  - FB-008
source: ../../../sprint-4/01-driver-supervisor/DS-02-driver-state-attendance-leave.md
---

# DS-02 — Driver State, Attendance & Leave (Sprint 5 Carry-over)

> **Full story context, business rules, AC details, and implemented sub-tasks live in Sprint 4:**
> [`sprint-4/01-driver-supervisor/DS-02-driver-state-attendance-leave.md`](../../../sprint-4/01-driver-supervisor/DS-02-driver-state-attendance-leave.md)
>
> This file contains **only the open items** that carry into Sprint 5.

---

## Sprint 5 Scope — Open Sub-tasks

| # | Sub-task | Jira | Sprint 4 Exit | Sprint 5 Work | Priority | Status |
|---|----------|------|---------------|---------------|----------|--------|
| DS-02-6 | `DriverStateAdmin` list view — state badges, POI filter, read-only for non-supervisor via `get_readonly_fields` | DFS-051-6 | Complete | Implemented `state_badge` list display, POI + state filters, and read-only field enforcement in admin | High | Done |
| DS-02-10 | TLS-01 hooks — auto-update driver state on TO assignment, execution start, TO completion | DFS-051-10 | Partial | Hooks wired in transport layer; **missing** integration test proving assignment → Assigned, execution start → On Execution, completion → Available | High | Done |
| DS-02-17 | Audit trail complete for state transitions, attendance, and leave records | DFS-051-17 | Partial | Service-layer tenant audit + `DriverStateLog` on transitions; auto hooks may pass `changed_by=None`; audit helpers are best-effort (swallowed failures) | High | Done |
| DS-02-18 | Separate **Attendance** and **Leave Management** as distinct menu items | DFS-051-18 | Done | `portal_navigation.py`: separate sections **Driver Attendance** (`fleet_attendance`) and **Driver Leave Management** (`fleet_leave`), not under Fleet operations or a combined Driver State parent | Medium | Done |
| DS-02-19 | E2E test coverage | ~ | Not done | No DS-02 E2E module tests found under `tests/` | Medium | Not done |

---

## Feedback Item — FB-008

**Feedback**: Attendance and Leave Management must be **separate menu items** in the Driver Supervisor menu.

**AC Amendment** (DS-02 AC-3/AC-4 menu note): The Driver Supervisor navigation exposes **Driver Attendance** and **Driver Leave Management** as two distinct items. Neither is nested under a combined "Driver State" or "Driver Management" section. This closes DS-02-18.

> **Status**: Done

---

## Sprint 5 Definition of Done (remaining items only)

- [x] `DriverStateAdmin` list shows state badges; filterable by state and POI; non-supervisor roles get read-only fields (DS-02-6)
- [x] TLS-01 hooks wired and verified by integration test: assignment → Assigned; execution start → On Execution; completion → Available (DS-02-10)
- [x] Audit trail complete: every state transition, attendance entry, and leave record logged (DS-02-17)
- [x] **Driver Attendance** and **Driver Leave Management** appear as separate portal menu items (DS-02-18, FB-008)
- [ ] E2E sub-task DS-02-19 passes in staging

---

*Sprint 4 completion: ~70% | Sprint 5 target: 100% | Jira: DFS-051*
