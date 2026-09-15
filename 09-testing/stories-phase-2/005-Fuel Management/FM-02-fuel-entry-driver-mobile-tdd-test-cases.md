---
section: 09-testing/stories-phase-2/005-Fuel Management
specification: FM-02 Fuel Entry — Driver (Mobile) — TDD test cases
version: 1.0
phase: Phase 2
tdd: true
related_stories: FM-02
source_spec: ../../../../03-backlog/stories-phase-2/005-Fuel Management/FM-02-fuel-entry-driver-mobile.md
module_spec: ../../../../05-modules/09-mobile-apps/driver-mobile.md
suggested_impl:
  api: POST /api/v1/fuel-entries/; GET /api/v1/drivers/me/assignment/
  mobile: Maestro — Log Fuel Entry
last_updated: 2026-09-14
---

# FM-02 — Fuel Entry (Driver Mobile) — TDD test cases

**Story:** [FM-02](../../../../03-backlog/stories-phase-2/005-Fuel%20Management/FM-02-fuel-entry-driver-mobile.md)  
**Approach:** API contract tests first (assignment, validation, idempotency); Maestro for UX/GPS/offline.  
**Depends on:** FM-03 on sync/save; FM-05 for anomaly UI (TC15).

## Seed prerequisites

| Item | Notes |
|------|--------|
| Driver | Assigned to own-fleet vehicle; second driver/vehicle for negative tests |
| GPS | Emulator/simulator location permission on/off fixtures |
| Offline | Airplane mode / network off for queue tests |

---

## A — Auto-captured fields (AC-1)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FM-02-TC01 | AC-1.1 | Maestro | Prefill vehicle + fuel type | Driver with assignment to `DHK-1234` DIESEL opens Log Fuel Entry. Assert vehicle + fuel type read-only; no picker. | P0 | Planned |
| FM-02-TC02 | AC-1.2 | API / Maestro | Submit captures datetime + GPS | With location granted, submit valid entry. Assert `refueling_datetime` from submit, lat/lng set, `location_source=DEVICE_GPS`. | P0 | Planned |
| FM-02-TC03 | AC-1.3 | Maestro | Location denied blocks | Deny/revoke location. Assert submit blocked; enable-location message; no manual location field. | P0 | Planned |
| FM-02-TC04 | AC-1.4 | Maestro | No assignment blocks | Driver with no vehicle assignment. Assert cannot submit; clear no-assignment message. | P0 | Planned |

## B — Driver-entered fields (AC-2)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FM-02-TC05 | AC-2.1 | Maestro | Happy path fields | Before=15, After=55, Cost=4500, Odometer + gauge photos. Assert Fuel Filled=40; receipt/odometer optional. | P0 | Planned |
| FM-02-TC06 | AC-2.2 | Maestro | Missing gauge photo | Omit gauge after. Assert submit blocked. | P0 | Planned |

## C — Validation (AC-3)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FM-02-TC07 | AC-3.1 | API | After ≤ Before rejected | POST After ≤ Before. Assert 4xx gauge error. | P0 | Planned |
| FM-02-TC08 | AC-3.2 | API | Odometer ≤ last rejected | Last reading 13000; submit ≤13000. Assert odometer error. | P0 | Planned |
| FM-02-TC09 | AC-3.3 | Maestro | Live preview | Prior entry exists. Assert km/L and cost/km where calculable. | P1 | Planned |
| FM-02-TC10 | AC-3.4 | API | Other vehicle rejected | Driver assigned to A; POST for vehicle B. Assert rejected. | P0 | Planned |

## D — Offline (AC-4)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FM-02-TC11 | AC-4.1 | Unit / Maestro | Offline queue preserves GPS/time | Offline + location granted; submit. Assert local queue has GPS at queue time + captured datetime. | P0 | Planned |
| FM-02-TC12 | AC-4.2 | Integration | Sync preserves original capture | Reconnect; sync queued entry. Assert server keeps original timestamp/coords; `entry_type=DRIVER_ENTRY`. | P0 | Planned |
| FM-02-TC13 | AC-4.3 | API | Idempotency key | Submit twice with same key K. Assert one `FuelEntry` only. | P0 | Planned |

## E — Confirmation (AC-5)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FM-02-TC14 | AC-5.1 | Maestro | Success message | Online accept. Assert “Fuel entry logged!” | P1 | Planned |
| FM-02-TC15 | AC-5.2 | Maestro / API | Anomaly informational | km/L >20% below baseline. Assert `anomaly_flag=true`, entry saved, informational UI. | P1 | Planned |

---

## Edge cases (from story)

| Test Case ID | Layer | Scenario | Assert | Priority | Status |
|--------------|-------|----------|--------|----------|--------|
| FM-02-EC01 | API | Assignment changed before submit | Server re-checks; reject if no longer assigned | P0 | Planned |
| FM-02-EC02 | API | Non-driver role | No access to create driver fuel entry | P0 | Planned |
| FM-02-EC03 | Maestro | GPS permission on but no fix | Block submit with retry guidance | P1 | Planned |
| FM-02-EC04 | API | Reverse-geocode fails | lat/lng saved; label may be empty | P1 | Planned |
| FM-02-EC05 | Integration | Sync fails validation (odometer race) | Error surfaced; entry not silently dropped | P1 | Planned |
| FM-02-EC06 | — | cost=0 allowed? | TODO(PO) | P2 | Blocked (PO) |

---

## Suggested code test targets (TDD)

```
tests/api/.../test_fuel_entries_driver.py          # TC02, TC07–08, TC10, TC13, EC01–02
tests/mobile/maestro/.../fuel_entry_driver.yaml    # TC01, TC03–06, TC09, TC11, TC14–15
```
