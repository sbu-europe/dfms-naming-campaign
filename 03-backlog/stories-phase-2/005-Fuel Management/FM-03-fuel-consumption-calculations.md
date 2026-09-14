---
jira_key: ~
jira_type: Story
jira_sprint: ~
story_id: FM-03
title: Fuel Consumption Calculations & Odometer Validation
epic: Fuel Management
status: Pending
story_points: 5
assignee: ~
phase: Phase 2
related_stories:
  - FM-01-fuel-entry-driver-supervisor-admin.md
  - FM-02-fuel-entry-driver-mobile.md
  - FM-05-fuel-anomaly-baselines.md
source_docs:
  - ../../../05-modules/08-fleet-management/fuel-management.md
module_spec: 05-modules/08-fleet-management/fuel-management.md
tdd_test_cases: ../../../09-testing/stories-phase-2/005-Fuel Management/FM-03-fuel-consumption-calculations-tdd-test-cases.md
tdd_index: ../../../09-testing/stories-phase-2/005-Fuel Management/00-all-test-cases.md
---

# FM-03 — Fuel Consumption Calculations & Odometer Validation

## TDD Test Cases

| Link | What |
|------|------|
| [FM-03 TDD catalog](../../../09-testing/stories-phase-2/005-Fuel%20Management/FM-03-fuel-consumption-calculations-tdd-test-cases.md) | `FM-03-TC01`…`TC10` + edge cases (**unit-first**) |
| [Fuel Management TDD index](../../../09-testing/stories-phase-2/005-Fuel%20Management/00-all-test-cases.md) | All FM-01…FM-05 test cases |
| [Feature TDD folder](../../../09-testing/stories-phase-2/005-Fuel%20Management/README.md) | README + recommended TDD order |

Write failing unit tests from the catalog **before** implementation (recommended TDD start for Fuel).

## User Story

**As a** system  
**I want to** calculate fuel efficiency from consecutive odometer readings and fuel filled quantities  
**So that** Driver Supervisors and Transport Planners can analyse cost and consumption per vehicle

## Business Context

Calculations run **on save** of each fuel entry (except the first for a vehicle). Distance relies on **odometer delta**, not GPS (deferred).

---

## Acceptance Criteria

### AC-1: Computed fields (on save)

Given a fuel entry is being saved (FM-01 or FM-02),

when calculation runs against the previous entry for the same vehicle,

then quantity, distance, km/L, and cost metrics are stored per the rules below.

- [ ] `fuel_quantity_liters` = `fuel_after_liters − fuel_before_liters` (unless supervisor override with audit note).
- [ ] `distance_since_last_refuel_km` = current odometer − previous entry odometer (null on first entry).
- [ ] `fuel_consumption_kmpl` = distance / fuel_quantity (null on first entry or if distance ≤ 0).
- [ ] `cost_per_km` = fuel_cost / distance (null when distance null).
- [ ] `cost_per_liter` = fuel_cost / fuel_quantity.

**Test Scenarios (AC-1):**

```gherkin
Scenario: AC-1.1 - Metrics calculated from consecutive entries
  Given vehicle has a prior entry with odometer 10000
  And a new entry with odometer 10500, before=20, after=60, cost=4000
  When the entry is saved
  Then fuel_quantity_liters is 40
  And distance_since_last_refuel_km is 500
  And fuel_consumption_kmpl is 12.5
  And cost_per_km is 8
  And cost_per_liter is 100

Scenario: AC-1.2 - Supervisor quantity override is respected
  Given before=20 and after=60 (auto quantity 40)
  And supervisor sets fuel_quantity_liters=38 with quantity_override_note
  When the entry is saved
  Then stored fuel_quantity_liters is 38
  And km/L and cost_per_liter use 38 as the quantity denominator

Scenario: AC-1.3 - Distance uses odometer delta not GPS
  Given consecutive entries with odometer delta 300 km
  When calculation runs
  Then distance_since_last_refuel_km equals the odometer delta
  And GPS path length is not used
```

### AC-2: Odometer validation

Given a fuel entry save includes an odometer reading,

when the reading is compared to the last entry for that vehicle,

then invalid readings are rejected and valid ones update `Vehicle.current_odometer_reading`.

- [ ] Reject save if odometer ≤ last entry odometer for same vehicle.
- [ ] Update `Vehicle.current_odometer_reading` to latest fuel entry odometer.

**Test Scenarios (AC-2):**

```gherkin
Scenario: AC-2.1 - Odometer equal to last reading is rejected
  Given last fuel entry odometer is 12000
  When a new entry is submitted with odometer 12000
  Then save is rejected with an odometer validation error
  And Vehicle.current_odometer_reading is unchanged

Scenario: AC-2.2 - Odometer less than last reading is rejected
  Given last fuel entry odometer is 12000
  When a new entry is submitted with odometer 11999
  Then save is rejected

Scenario: AC-2.3 - Valid odometer updates vehicle master
  Given last fuel entry odometer is 12000
  When a new entry is saved with odometer 12500
  Then Vehicle.current_odometer_reading becomes 12500
```

### AC-3: First entry behaviour

Given a vehicle has no prior fuel entries,

when the first fuel entry is saved,

then distance/km/L/cost_per_km are null and the UI explains baseline behaviour.

- [ ] First fuel entry for a vehicle: distance, km/L, cost/km stored as null; no error.
- [ ] UI shows “First entry — baseline established from next fill-up.”
- [ ] `cost_per_liter` is still computed when fuel_quantity > 0.

**Test Scenarios (AC-3):**

```gherkin
Scenario: AC-3.1 - First entry stores null distance metrics
  Given vehicle has zero prior fuel entries
  When the first valid entry is saved with before=10, after=50, cost=3000, odometer=5000
  Then distance_since_last_refuel_km is null
  And fuel_consumption_kmpl is null
  And cost_per_km is null
  And cost_per_liter is 75
  And save succeeds without error

Scenario: AC-3.2 - First entry UI note
  Given the fuel entry form is for a vehicle with no history
  When the user views the live preview / confirmation
  Then the message “First entry — baseline established from next fill-up.” is shown
```

### AC-4: Service layer

Given developers implement fuel metrics,

when `FuelCalculationService.calculate(entry, previous_entry)` is invoked,

then unit tests cover happy path and edge cases (zero distance, first entry, override).

- [ ] `FuelCalculationService.calculate(entry, previous_entry)` — unit tested with edge cases (zero distance, first entry, override).

**Test Scenarios (AC-4):**

```gherkin
Scenario: AC-4.1 - Service returns nulls when previous_entry is null
  Given previous_entry is null
  When calculate is called
  Then distance, km/L, and cost_per_km are null
  And fuel_quantity_liters and cost_per_liter are computed

Scenario: AC-4.2 - Zero or negative distance yields null km/L
  Given previous_entry exists but computed distance is <= 0
  When calculate is called
  Then fuel_consumption_kmpl is null
  And cost_per_km is null
  # Note: AC-2 should normally reject <= last odometer before calculate persists
```

---

## Edge Cases

### Division & quantity
- `fuel_quantity_liters` = 0 (after == before): should be rejected by gauge validation before calculate; if reached, do not divide by zero — leave km/L null and fail closed.
- Very small quantity with large distance: still compute km/L; anomaly may flag later (FM-05).

### Ordering
- Previous entry is the latest by `refueling_datetime` (then created_at) for the same vehicle within tenant — not by submit order across clocks without that rule documented in module spec.
- Back-dated supervisor entry that would sit between two existing entries: TODO(PO) — recalculate chain vs validate against latest odometer only (v1 likely latest-odometer rule only).

### Cross-entry types
- Previous entry may be DRIVER_ENTRY or SUPERVISOR_ENTRY; calculation treats them the same for odometer/quantity.

---

## API Endpoints

Invoked internally on `POST /api/v1/fuel-entries/` — no separate public endpoint. Computed fields returned in fuel entry response.

---

## Access & Permissions

| Action | Role |
|--------|------|
| Trigger calculation | System on fuel entry save (FM-01, FM-02) |

---

## Sub-tasks

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| FM-03-1 | Calculation service | distance, km/L, ৳/km, ৳/L | High | Not started |
| FM-03-2 | Odometer validation | Reject if ≤ last reading; update vehicle odometer | High | Not started |
| FM-03-3 | Tests | Unit tests for AC-1…AC-4 scenarios + Edge Cases (first entry, override, ≤ odometer) | High | Not started |

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| FM-01, FM-02 | Upstream | Entry save triggers calculation |
| Vehicle master | Downstream | `current_odometer_reading` updated |

---

## Definition of Done

- [ ] Calculation service implemented and tested (scenarios AC-1.1…AC-4.2) — see [FM-03 TDD catalog](../../../09-testing/stories-phase-2/005-Fuel%20Management/FM-03-fuel-consumption-calculations-tdd-test-cases.md)
- [ ] TDD catalog statuses updated for P0 rows (`Planned` → `Failing` → `Passing`)
- [ ] Vehicle odometer updated on each entry
- [ ] First-entry null semantics documented in module spec

---

*Epic: Fuel Management | Phase: 2 (unscheduled) | 5 SP | Last Updated: 2026-09-14*
