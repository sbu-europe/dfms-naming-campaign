---
section: 09-testing/stories-phase-2/007-Fleet Health Inspection
specification: FHI-02 Inspection Dashboard — TDD test cases
version: 1.0
phase: Phase 2
tdd: true
related_stories: FHI-02
source_spec: ../../../03-backlog/phase-2/stories-phase-2/007-Fleet Health Inspection/FHI-02-inspection-dashboard-alerts.md
module_spec: ../../../../05-modules/08-fleet-management/fleet-health-inspection.md
suggested_impl:
  unit: InspectionStatusService (DUE_SOON_DAYS=2)
  api: GET /api/v1/fleet-inspections/dashboard/?alerts_only=
  e2e: Playwright admin — Inspection Dashboard
last_updated: 2026-09-14
---

# FHI-02 — Inspection Dashboard — TDD test cases

**Story:** [FHI-02](../../../03-backlog/phase-2/stories-phase-2/007-Fleet%20Health%20Inspection/FHI-02-inspection-dashboard-alerts.md)  
**TDD focus:** unit tests for `InspectionStatusService` status math (after FHI-01 + FHI-03 state).  
**Used by:** FHI-04 report aggregation (same service).

## Status fixture notes

| Rule | Value |
|------|-------|
| `next_due` | `last_checked_date + interval_days` |
| Never checked | Overdue |
| `DUE_SOON_DAYS` | 2 |
| Chips | OK / Due soon / Overdue; Failed/Attention from last_result |

---

## A — Stats strip (AC-1)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FHI-02-TC01 | AC-1.1 | API / E2E | Stats own-fleet only | Mixed own + vendor fleet. Assert vehicle count and due/overdue/failed stats exclude vendor. | P0 | Planned |
| FHI-02-TC02 | AC-1.2 | Unit / API | Failed last round counted | last_result=FAIL within interval. Assert failed last-round count includes row. | P0 | Planned |

## B — Checkpoint table & status (AC-2)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FHI-02-TC03 | AC-2.1 | Unit | OK when >2 days from due | next_due > today+2; last_result PASS. Assert status OK/valid. | P0 | Planned |
| FHI-02-TC04 | AC-2.2 | Unit | Due soon 2-day window | next_due within DUE_SOON_DAYS=2 and not overdue. Assert Due soon. | P0 | Planned |
| FHI-02-TC05 | AC-2.3 | Unit | Overdue / never checked | last_checked null OR today > next_due. Assert Overdue. | P0 | Planned |
| FHI-02-TC06 | AC-2.4 | Unit / E2E | Failed/attention flag | last_result FAIL or ATTENTION. Assert flag shown with schedule status. | P0 | Planned |
| FHI-02-TC07 | AC-2.5 | API | alerts_only filter | Mixed OK + alerts. alerts_only=true excludes OK-only rows. | P0 | Planned |

## C — Quick action (AC-3)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FHI-02-TC08 | AC-3.1 | E2E | Inspect pre-selects vehicle | Click Inspect on DHK-1234 row. Assert Conduct Inspection opens with that vehicle. | P1 | Planned |

## D — API (AC-4)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FHI-02-TC09 | AC-4.1 | API | Dashboard rows + stats | As driver_supervisor GET dashboard. Assert stats + checkpoint rows present. | P0 | Planned |
| FHI-02-TC10 | AC-4.2 | API | alerts_only query | GET .../?alerts_only=true returns alert rows only. | P0 | Planned |
| FHI-02-TC11 | AC-4.3 | Unit | Service single path | Dashboard builds rows via InspectionStatusService; no duplicated schedule math. | P0 | Planned |

---

## Edge cases (from story)

| Test Case ID | Layer | Scenario | Assert | Priority | Status |
|--------------|-------|----------|--------|----------|--------|
| FHI-02-EC01 | Unit | Exactly 2 days before next_due | Due soon (boundary) | P0 | Planned |
| FHI-02-EC02 | Unit | Day after next_due | Overdue | P0 | Planned |
| FHI-02-EC03 | Unit | FAIL + schedule OK | Flag + OK schedule coexist until passing round | P1 | Planned |
| FHI-02-EC04 | API | Inactive templates | Not listed as dashboard rows | P1 | Planned |
| FHI-02-EC05 | API | Unauthorized role | Dashboard GET denied | P0 | Planned |

---

## Suggested code test targets (TDD)

```
tests/unit/.../test_inspection_status_service.py   # TC03–06, TC11, EC01–03
tests/api/.../test_fleet_inspections_dashboard.py  # TC01–02, TC07, TC09–10, EC04–05
```

**Implement order:** TC05 → TC03 → TC04 → EC01 → TC07 → TC09 → rest.
