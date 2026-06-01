---
jira_key: DFS-050
jira_type: Story
jira_sprint: "Sprint 5"
carry_from: "Sprint 4"
story_id: DS-01
title: Driver Supervisor — Vehicle Licence, Health & Handover Checklists
epic: Driver Supervisor & Crew
status: Carry-over
story_points: 5
assignee: Farhan Tanvir(farhanT23)
carry_subtasks:
  - DS-01-7
  - DS-01-12
  - DS-01-14
  - DS-01-17
  - DS-01-19
feedback_items:
  - FB-009
source: ../../../sprint-4/01-driver-supervisor/DS-01-vehicle-licence-health-handover-checklists.md
---

# DS-01 — Vehicle Licence, Health & Handover Checklists (Sprint 5 Carry-over)

> **Full story context, business rules, checklist template, and implemented ACs live in Sprint 4:**
> [`sprint-4/01-driver-supervisor/DS-01-vehicle-licence-health-handover-checklists.md`](../../../sprint-4/01-driver-supervisor/DS-01-vehicle-licence-health-handover-checklists.md)
>
> This file contains **only the open items** that carry into Sprint 5.

---

## Sprint 5 Scope — Open Sub-tasks

| # | Sub-task | Jira | Sprint 4 Exit | Sprint 5 Work | Priority |
|---|----------|------|---------------|---------------|----------|
| DS-01-7 | Align `mark_vehicle_under_maintenance` — linked TOs must transition to `under_planning` (currently resets to `created`) | DFS-050-7 | Pending | Fix `VehicleAdmin.mark_vehicle_under_maintenance` service so TOs in `assigned` state → `under_planning`, not `created` | High |
| DS-01-12 | `POST …/vehicles/{id}/under-maintenance` — linked TOs must go to `under_planning` (not `created`) | DFS-050-12 | Pending | Align API behaviour to match `reject_inspection` path which correctly writes `under_planning` | High |
| DS-01-14 | Central audit logging — skip-dispatch, checklist complete, reject inspection actions | DFS-050-14 | Pending | Implement audit helper calls in `fleet_supervisor` services for all three paths; align with DS-01-17 return-to-service audit | High |
| DS-01-17 | Return-to-service audit event on vehicle → `Available` transition | DFS-050-17 | Pending | Add audit log entry on `complete_inspection` (maintenance-clearance path): who, when, vehicle ID, inspection ID | Medium |
| DS-01-19 | E2E test coverage | ~ | Pending | Validate pre-dispatch checklist skip / approval / rejection, maintenance rollback (`under_planning`), and return-to-service paths | Medium |

---

## Feedback Item — FB-009

**Feedback**: When a vehicle moves from **Under Maintenance** to **Available**, the maintenance-clearance inspection record should show **Maintenance Completed** status in inspection history.

**AC Amendment** (DS-01 AC-5): On `complete_inspection` for a maintenance-clearance inspection (purpose = return-to-service), the `VehicleInspection` record status label must be **Maintenance Completed**, distinct from a pre-dispatch **Vehicle OK** outcome. Visible on the inspection history list in Driver Supervisor admin.

> **Status**: Pending clarification with product on exact label and column. Confirm before implementation.

---

## Sprint 5 Definition of Done (remaining items only)

- [ ] `mark_vehicle_under_maintenance` transitions linked TOs → `under_planning` (DS-01-7, DS-01-12)
- [ ] Audit trail complete: skip, checklist-complete, and reject all emit audit log entries (DS-01-14)
- [ ] Return-to-service audit event recorded on `Available` transition (DS-01-17)
- [ ] Maintenance-clearance inspection record shows **Maintenance Completed** label in history (FB-009)
- [ ] E2E sub-task DS-01-19 passes in staging

---

*Sprint 4 completion: ~75% | Sprint 5 target: 100% | Jira: DFS-050*
