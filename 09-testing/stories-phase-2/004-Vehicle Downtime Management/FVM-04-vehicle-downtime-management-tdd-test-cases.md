---
section: 09-testing/stories-phase-2/004-Vehicle Downtime Management
specification: FVM-04 Vehicle Downtime Management — TDD test cases
version: 1.0
phase: Phase 2
tdd: true
related_stories: FVM-04
source_spec: ../../../../03-backlog/stories-phase-2/004-Vehicle Downtime Management/FVM-04-vehicle-downtime-management.md
module_spec: ../../../../05-modules/02-master-data/vehicle-master-data.md
suggested_impl:
  unit: downtime_hours_overlap; status transition helpers
  api: POST/PATCH VehicleDowntime; reuse mark_vehicle_under_maintenance
  e2e: Playwright admin — Driver Supervisor downtime log
last_updated: 2026-09-15
---

# FVM-04 — Vehicle Downtime Management — TDD test cases

**Story:** [FVM-04](../../../../03-backlog/stories-phase-2/004-Vehicle%20Downtime%20Management/FVM-04-vehicle-downtime-management.md)  
**Approach:** Write failing API tests for open/close + validation → status side-effects → FVM-03 hour clip.  
**Does not:** workshop cost/parts; remaining-km tracking; replace DS-01 inspection-fail clearance.

## Seed prerequisites (when implementing)

| Item | Notes |
|------|--------|
| Roles | `driver_supervisor`, `tenant_admin`, `transport_planner`; negative: ungranted |
| Vehicles | Own-fleet No Active TO; own-fleet **In-transit**; own-fleet `is_active=false`; ≥1 vendor-fleet |
| TOs | Assigned-not-started TO on a vehicle (unassign on UM); started TO for in-transit reject |
| Utilization | Period window for AC-4 overlap (can share FVM-03 fixtures) |

---

## A — Log downtime (AC-1)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FVM-04-TC01 | AC-1.1 | E2E / API | Log downtime with reason and times | As Driver Supervisor, enter vehicle, **reason**, **start**, optional **end**. Assert log accepted. Open log (no end) also accepted. | P0 | Planned |
| FVM-04-TC02 | AC-1.2 | API | Who entered it is recorded | Save accepted log. Assert entered-by = supervisor. | P0 | Planned |
| FVM-04-TC03 | AC-1.3 | API | End before start rejected | `end_at` &lt; `start_at`. Assert 4xx + clear error; no row. | P0 | Planned |
| FVM-04-TC04 | AC-1.4 | API | Second open downtime rejected | Vehicle already has open log. Start another open log. Assert rejected; first log unchanged. | P0 | Planned |
| FVM-04-TC05 | AC-1.5 | E2E / API | List newest first and close | Two logs exist. Assert newest first. Close open log by setting end. Assert closed. | P0 | Planned |

## B — Status becomes Under Maintenance (AC-2)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FVM-04-TC06 | AC-2.1 | API | Open downtime covering now → UM | Save open log covering now. Assert `operational_status` = **Under Maintenance**; `is_active` stays true. | P0 | Planned |
| FVM-04-TC07 | AC-2.2 | API | Assigned not-started TOs unassigned | Vehicle has Assigned TO not started. Save covering-now downtime. Assert TO back to Under Planning; vehicle cleared (DS-01 mark path). | P0 | Planned |
| FVM-04-TC08 | AC-2.3 | API | In-transit start rejected | Vehicle In-transit. Start downtime. Assert rejected with clear error; status unchanged. | P0 | Planned |
| FVM-04-TC09 | AC-2.4 | API | Service log does not set UM | Record FVM-01 completed service. Assert status does **not** become Under Maintenance. | P0 | Planned |

## C — Availability adjusts automatically (AC-3)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FVM-04-TC10 | AC-3.1 | API | Not in available assignment list | Vehicle UM from downtime. Assert absent from TDO `GET /vehicles/available`. | P0 | Planned |
| FVM-04-TC11 | AC-3.2 | API / E2E | FVM-02 Under Maintenance card includes vehicle | Planner Health Dashboard. Assert vehicle in **Under Maintenance** count. | P0 | Planned |
| FVM-04-TC12 | AC-3.3 | API | Ending last downtime → No Active TO | Close last open log; vehicle `is_active`. Assert status **No Active TO**; assignable again. | P0 | Planned |
| FVM-04-TC13 | AC-3.4 | API | Inactive stays inactive after end | Master-data inactive vehicle. End downtime. Assert status does **not** become No Active TO. | P0 | Planned |

## D — Downtime reduces utilization hours (AC-4)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FVM-04-TC14 | AC-4.1 | Unit | Only overlapping downtime counted | Log 08:00–20:00; period 10:00–18:00. Assert downtime_hours = 8 (clip). Open log uses “now” as end. | P0 | Planned |
| FVM-04-TC15 | AC-4.2 | Unit | Available hours = period − downtime | Period 8 h, downtime 2 h. Assert available = 6. | P0 | Planned |
| FVM-04-TC16 | AC-4.3 | Unit | Idle vs movement stays GPS | GPS idle/moving hours computed as FVM-03. Assert idle is **not** available − serving. | P0 | Planned |
| FVM-04-TC17 | AC-4.4 | Unit | Utilization % uses available hours | Serving 2, available 6 (not calendar 8). Assert util % = 2÷6, not 2÷8. | P0 | Planned |

## E — Who can see and do what (AC-5)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FVM-04-TC18 | AC-5.1 | E2E / API | Supervisor and Tenant Admin can record | As Driver Supervisor and as Tenant Admin. Assert create, close, and list allowed. | P0 | Planned |
| FVM-04-TC19 | AC-5.2 | E2E / API | Planner view only | As Transport Planner. Assert list visible; create/close denied. | P0 | Planned |
| FVM-04-TC20 | AC-5.3 | E2E | Out of scope surfaces | Downtime form/list has no workshop cost/parts and no remaining-km / service-due controls. | P1 | Planned |

---

## Edge cases (from GWT And/not clauses)

| Test Case ID | Layer | Scenario | Assert | Priority | Status |
|--------------|-------|----------|--------|----------|--------|
| FVM-04-EC01 | API | Missing reason or start | Required-field 4xx | P0 | Planned |
| FVM-04-EC02 | API | Historical closed log (ended in the past) | Does **not** set UM now | P0 | Planned |
| FVM-04-EC03 | API | Future start not covering now | Does not set UM until start | P1 | Planned |
| FVM-04-EC04 | API | Sequential closed logs | Second log allowed after first closed | P0 | Planned |
| FVM-04-EC05 | API | Vendor-fleet vehicle | Create rejected | P0 | Planned |
| FVM-04-EC06 | API | Close with end &lt; start | Close rejected; log stays open | P0 | Planned |
| FVM-04-EC07 | API | DS-01 UM without FVM-04 log | Inspection-fail UM still requires DS-01 clearance (regression) | P0 | Planned |
| FVM-04-EC08 | Unit | Downtime wholly outside period | downtime_hours = 0 for that period | P0 | Planned |
| FVM-04-EC09 | API | Ungranted role | 403 on create | P0 | Planned |
| FVM-04-EC10 | — | End equal to start | TODO(PO) — accept as 0-duration close vs reject | P2 | Blocked (PO) |

---

## Suggested code test targets (TDD)

```
tests/api/.../test_vehicle_downtime_crud.py          # TC01–05, EC01, EC04–06, EC09
tests/api/.../test_vehicle_downtime_status.py        # TC06–13, EC02–03, EC07
tests/unit/.../test_downtime_hours_overlap.py        # TC14–17, EC08
tests/e2e/.../test_vehicle_downtime_admin.py         # TC01, TC05, TC18–20
```

**Implement order:** TC03–04 → TC06 → TC08–09 → TC10 → TC12–13 → TC14 → TC19 → rest.
