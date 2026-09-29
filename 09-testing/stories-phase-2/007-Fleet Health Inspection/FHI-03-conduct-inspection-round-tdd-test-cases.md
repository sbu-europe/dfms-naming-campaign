---
section: 09-testing/stories-phase-2/007-Fleet Health Inspection
specification: FHI-03 Conduct Inspection Round — TDD test cases
version: 1.0
phase: Phase 2
tdd: true
related_stories: FHI-03
source_spec: ../../../03-backlog/phase-2/stories-phase-2/007-Fleet Health Inspection/FHI-03-conduct-inspection-round.md
module_spec: ../../../../05-modules/08-fleet-management/fleet-health-inspection.md
suggested_impl:
  unit: Round submit service → VehicleCheckpointState update
  api: POST/GET /api/v1/vehicles/{id}/inspection-rounds/; GET checkpoint-states/
  e2e: Playwright admin — Conduct Inspection
last_updated: 2026-09-14
---

# FHI-03 — Conduct Inspection Round — TDD test cases

**Story:** [FHI-03](../../../03-backlog/phase-2/stories-phase-2/007-Fleet%20Health%20Inspection/FHI-03-conduct-inspection-round.md)  
**TDD focus:** API/service submit after FHI-01 templates exist.  
**Unlocks:** FHI-02 dashboard state; FHI-04 counts.

## Seed prerequisites (when implementing)

| Item | Notes |
|------|--------|
| Roles | `driver_supervisor` create; planner/admin view history; negative: no create perm |
| Vehicles | ≥1 own-fleet with type templates; ≥1 vendor-fleet |
| Templates | Active checkpoints for vehicle_type (from FHI-01) |

---

## A — Round entry form (AC-1)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FHI-03-TC01 | AC-1.1 | E2E / API | Own-fleet loads checklist | Select own-fleet light truck. Assert rows = active light truck templates + current state when present. | P0 | Planned |
| FHI-03-TC02 | AC-1.2 | API | Optional odometer/notes | Submit with and without odometer/round notes. Assert both accepted. | P1 | Planned |

## B — Per-checkpoint result (AC-2)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FHI-03-TC03 | AC-2.1 | API | Result enum accepted | Pass / Needs attention / Fail accepted on lines. | P0 | Planned |
| FHI-03-TC04 | AC-2.2 | API | Optional line notes | Notes omitted or set; persisted accordingly. | P1 | Planned |
| FHI-03-TC05 | AC-2.3 | E2E | Row context columns | Form shows interval, last checked, current status per row. | P1 | Planned |

## C — On submit (AC-3)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FHI-03-TC06 | AC-3.1 | API | Round + lines persisted | Complete submit. Assert InspectionRound + one line per checkpoint; entered_by=supervisor. | P0 | Planned |
| FHI-03-TC07 | AC-3.2 | Unit / API | Checkpoint state updated | inspected_at=D, result Pass. Assert last_checked=D, last_result=PASS, next_due=D+interval_days. | P0 | Planned |
| FHI-03-TC08 | AC-3.3 | Unit / API | FAIL/ATTENTION last_result | Fail and Needs attention lines. Assert last_result FAIL and ATTENTION. | P0 | Planned |

## D — Validation (AC-4)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FHI-03-TC09 | AC-4.1 | API | Missing result blocked | Omit one required checkpoint result. Assert reject; no round created. | P0 | Planned |
| FHI-03-TC10 | AC-4.2 | API | Vendor vehicle rejected | POST for vendor-fleet vehicle. Assert reject. | P0 | Planned |

## E — API (AC-5)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FHI-03-TC11 | AC-5.1 | API | POST create round | Supervisor with create permission. Assert success response. | P0 | Planned |
| FHI-03-TC12 | AC-5.2 | API | GET history | Prior rounds exist. GET history returns them (newest-first or documented order). | P0 | Planned |
| FHI-03-TC13 | AC-5.3 | API | Unauthorized create denied | User without create permission → 403 on POST. | P0 | Planned |

---

## Edge cases (from story)

| Test Case ID | Layer | Scenario | Assert | Priority | Status |
|--------------|-------|----------|--------|----------|--------|
| FHI-03-EC01 | API | Partial submit missing line | Entire round rejected (atomic) | P0 | Planned |
| FHI-03-EC02 | Unit / API | First check creates state | Missing VehicleCheckpointState created on submit | P0 | Planned |
| FHI-03-EC03 | API | Inactive templates | Not required on new round; past rounds unchanged | P1 | Planned |
| FHI-03-EC04 | API | Cross-tenant vehicle id | 404/403 | P0 | Planned |
| FHI-03-EC05 | API | Planner cannot create | transport_planner POST create → 403; GET history OK | P1 | Planned |

---

## Suggested code test targets (TDD)

```
tests/unit/.../test_inspection_round_submit_service.py  # TC07–08, EC02
tests/api/.../test_vehicle_inspection_rounds.py         # TC01–06, TC09–13, EC01, EC03–05
```

**Implement order:** TC03 → TC09 → TC06 → TC07 → TC10 → TC11 → rest.
