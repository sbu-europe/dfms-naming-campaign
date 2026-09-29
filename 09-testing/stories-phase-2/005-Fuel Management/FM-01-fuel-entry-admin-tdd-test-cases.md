---
section: 09-testing/stories-phase-2/005-Fuel Management
specification: FM-01 Fuel Entry — Driver Supervisor (Admin) — TDD test cases
version: 1.0
phase: Phase 2
tdd: true
related_stories: FM-01
source_spec: ../../../03-backlog/phase-2/stories-phase-2/005-Fuel Management/FM-01-fuel-entry-driver-supervisor-admin.md
module_spec: ../../../../05-modules/08-fleet-management/fuel-management.md
suggested_impl:
  unit: apps/vehicle_health/services/ (or fuel calculation shared)
  api: POST /api/v1/fuel-entries/; PATCH /api/v1/vehicles/{id}/
  e2e: Playwright admin — Log Fuel Entry
last_updated: 2026-09-14
---

# FM-01 — Fuel Entry (Admin) — TDD test cases

**Story:** [FM-01](../../../03-backlog/phase-2/stories-phase-2/005-Fuel%20Management/FM-01-fuel-entry-driver-supervisor-admin.md)  
**Approach:** Write failing API/E2E tests from rows below → implement → mark Passing.  
**Depends on:** FM-03 calcs on save; FM-05 anomaly optional on response.

## Seed prerequisites (when implementing)

| Item | Notes |
|------|--------|
| Roles | `driver_supervisor`, `tenant_admin`; negative: role without `fuel.entry.create` |
| Vehicles | ≥1 own-fleet with driver + prior fuel entry; ≥1 own-fleet with no history; ≥1 vendor-fleet |
| Uploads | Valid gauge image fixtures for before/after |

---

## A — Vehicle selection & context (AC-1)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FM-01-TC01 | AC-1.1 | E2E / API | Select own-fleet vehicle loads context | As Driver Supervisor, open Log Fuel Entry, select own-fleet `DHK-1234` with prior entry. Assert context shows registration, model, assigned driver, current odometer, last fuel summary. | P0 | Planned |
| FM-01-TC02 | AC-1.2 | API | Vehicle odometer patch audited separately | `PATCH` vehicle `current_odometer_reading`. Assert vehicle updated, audit log for vehicle update exists, no `FuelEntry` created by patch alone. | P0 | Planned |
| FM-01-TC03 | AC-1.3 | E2E / API | No prior fuel entry still shows context | Select own-fleet vehicle with zero fuel history. Assert registration + odometer shown; last entry summary = none / empty. | P1 | Planned |

## B — Form fields (AC-2)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FM-01-TC04 | AC-2.1 | E2E / API | Happy path fields + auto Fuel Filled | Select DIESEL vehicle; enter Before=20, After=60, Cost=5000, Odometer, Date, Location. Assert Fuel Filled=40; fuel type DIESEL editable; assigned driver read-only. | P0 | Planned |
| FM-01-TC05 | AC-2.2 | API | After ≤ Before rejected | POST/save with After ≤ Before. Assert 4xx + gauge validation message; no row created. | P0 | Planned |
| FM-01-TC06 | AC-2.3 | API | Quantity override with note | Before=20, After=60, override quantity=38 + `quantity_override_note`. Assert stored `fuel_quantity_liters=38` and note persisted. | P0 | Planned |

## C — Photos (AC-3)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FM-01-TC07 | AC-3.1 | API | Required gauge photos only | Valid fields + gauge before/after URLs; omit receipt/odometer. Assert create success; receipt/odometer URLs null. | P0 | Planned |
| FM-01-TC08 | AC-3.2 | API | Missing required gauge photo | Omit gauge after. Assert save blocked; required-photo error. | P0 | Planned |

## D — On-behalf metadata (AC-4)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FM-01-TC09 | AC-4.1 | API | SUPERVISOR_ENTRY metadata | Save as supervisor with date + location "Depot Pump A". Assert `entry_type=SUPERVISOR_ENTRY`, `entered_by`=supervisor, `location_source=MANUAL`, `refueling_datetime` from selected date/time. | P0 | Planned |

## E — Live preview (AC-5)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FM-01-TC10 | AC-5.1 | E2E | Preview with prior entry | Prior odometer 10000; enter 10500 + gauges + cost. Assert preview shows net filled, distance, km/L, ৳/km, ৳/L. | P1 | Planned |
| FM-01-TC11 | AC-5.2 | E2E | First entry N/A | No prior entry. Assert distance + km/L show N/A + explanatory note. | P1 | Planned |

## F — Validation & RBAC (AC-6)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FM-01-TC12 | AC-6.1 | API | Odometer ≤ last rejected | Last odometer 12000; submit 12000 or less. Assert validation error. | P0 | Planned |
| FM-01-TC13 | AC-6.2 | E2E / API | Own-fleet only in picker | Vendor vehicles exist. Assert picker/list excludes vendor fleet (API reject if forced). | P0 | Planned |
| FM-01-TC14 | AC-6.3 | API | Date and location required | Omit date or location. Assert required-field errors. | P0 | Planned |
| FM-01-TC15 | AC-6.4 | API | Unauthorized denied | User without supervisor/admin fuel create permission. Assert 403 on open/POST. | P0 | Planned |

---

## Edge cases (from story)

| Test Case ID | Layer | Scenario | Assert | Priority | Status |
|--------------|-------|----------|--------|----------|--------|
| FM-01-EC01 | E2E / API | No assigned driver on vehicle | Entry still allowed; driver field empty/unassigned | P1 | Planned |
| FM-01-EC02 | API | Before=0, After>0 | Accepted | P1 | Planned |
| FM-01-EC03 | API | Negative liters | Rejected | P0 | Planned |
| FM-01-EC04 | API | Override without note | Rejected (note required) | P0 | Planned |
| FM-01-EC05 | API | Concurrent odometer race | Second save may fail if first advanced odometer | P2 | Planned |
| FM-01-EC06 | — | Inactive vehicle in picker | TODO(PO) — Blocked until PO decides | P2 | Blocked (PO) |
| FM-01-EC07 | — | Future refueling date | TODO(PO) — Blocked until PO decides | P2 | Blocked (PO) |

---

## Suggested code test targets (TDD)

```
tests/unit/.../test_fuel_entry_supervisor_validation.py   # TC05, TC08, TC12, TC14, EC03–04
tests/api/.../test_fuel_entries_supervisor.py             # TC02, TC04, TC06–09, TC15
tests/e2e/.../test_fuel_entry_admin_e2e.py                # TC01, TC10–11, TC13
```
