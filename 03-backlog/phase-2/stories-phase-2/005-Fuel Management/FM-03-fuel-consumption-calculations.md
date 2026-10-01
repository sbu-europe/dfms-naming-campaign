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
  - ../../../../05-modules/08-fleet-management/fuel-management.md
module_spec: 05-modules/08-fleet-management/fuel-management.md
tdd_test_cases: ../../../../09-testing/stories-phase-2/005-Fuel Management/FM-03-fuel-consumption-calculations-tdd-test-cases.md
tdd_index: ../../../../09-testing/stories-phase-2/005-Fuel Management/00-all-test-cases.md
---

# FM-03 — Fuel Consumption Calculations & Odometer Validation

## Test cases

Gherkin / TDD scenarios live under `09-testing` (not inline in this story).

| Navigate | Link |
|----------|------|
| **FM-03 TDD catalog** (`AC-N.x` mapped) | [FM-03-fuel-consumption-calculations-tdd-test-cases.md](../../../../09-testing/stories-phase-2/005-Fuel%20Management/FM-03-fuel-consumption-calculations-tdd-test-cases.md) |
| **Fuel Management TDD index** (all stories) | [00-all-test-cases.md](../../../../09-testing/stories-phase-2/005-Fuel%20Management/00-all-test-cases.md) |
| **Feature TDD folder** | [README](../../../../09-testing/stories-phase-2/005-Fuel%20Management/README.md) |

Write failing tests from the catalog **before** implementation.


## User Story

**As a** system  
**I want to** calculate fuel efficiency from consecutive odometer readings and fuel filled quantities  
**So that** Driver Supervisors and Transport Planners can analyse consumption per vehicle from gauge and odometer

## Business Context

Calculations run **on save** of each fuel entry, not as a live reflection on the form. The **previous saved fuel entry** for the same vehicle is the reference (`previous_entry`). Distance relies on **odometer delta** against that reference, not GPS (deferred).

The first saved entry has no reference. It becomes the baseline reference: gauge and odometer are stored, and distance and km/L stay empty until the next fill is saved against it.

**No cost-calculation fields.** Do not compute or store `cost_per_km` or `cost_per_liter`. Fuel Cost (BDT) is an entered amount only.

---

## Acceptance Criteria

> **Test scenarios:** see [FM-03 TDD catalog](../../../../09-testing/stories-phase-2/005-Fuel%20Management/FM-03-fuel-consumption-calculations-tdd-test-cases.md) · [Fuel Management index](../../../../09-testing/stories-phase-2/005-Fuel%20Management/00-all-test-cases.md)

### AC-1: Computed fields (on save)

Given a fuel entry is being saved (FM-01 or FM-02),

when calculation runs against the previous **saved** fuel entry for the same vehicle,

then gauge, filled quantity, odometer, distance, and km/L are stored on the new entry. The form does not reflect distance or km/L before save. Cost rates are not stored.

- [ ] Each entry updates `fuel_before_liters`, `fuel_after_liters`, and `fuel_quantity_liters` (`fuel_after_liters − fuel_before_liters`, unless supervisor override with audit note).
- [ ] Each entry updates `odometer_reading_km`, and the vehicle’s `current_odometer_reading` when the reading is valid.
- [ ] `distance_since_last_refuel_km` = current odometer − reference entry odometer (null when there is no previous saved entry).
- [ ] `fuel_consumption_kmpl` = distance / fuel_quantity (null on first entry or if distance ≤ 0).
- [ ] No `cost_per_km` and no `cost_per_liter`. Fuel Cost (BDT) is stored as entered and is not used in a rate.

### AC-2: Odometer validation

Given a fuel entry save includes an odometer reading,

when the reading is compared to the last entry for that vehicle,

then invalid readings are rejected and valid ones update `Vehicle.current_odometer_reading`.

- [ ] Reject save if odometer ≤ last entry odometer for same vehicle.
- [ ] Update `Vehicle.current_odometer_reading` to latest fuel entry odometer.

### AC-3: First entry behaviour

Given a vehicle has no prior fuel entries,

when the first fuel entry is saved,

then gauge and odometer are stored, and distance and km/L are null. This saved row is the baseline reference for the next fill. The note is on the saved entry and in history, not on a live form preview.

- [ ] First fuel entry for a vehicle: gauge and odometer stored; distance and km/L null; no error. This entry is the reference baseline.
- [ ] History (and the saved entry) shows “First entry — baseline established from next fill-up.” The entry form does not live-preview this.
- [ ] No cost rate is computed on the first entry or on later entries.

### AC-4: Service layer

Given developers implement fuel metrics,

when `FuelCalculationService.calculate(entry, previous_entry)` is invoked,

then unit tests cover happy path and edge cases (zero distance, first entry, override).

- [ ] `FuelCalculationService.calculate(entry, previous_entry)` — unit tested with edge cases (zero distance, first entry, override).

---

## Edge Cases

### Division & quantity
- `fuel_quantity_liters` = 0 (after == before): should be rejected by gauge validation before calculate; if reached, do not divide by zero — leave km/L null and fail closed.
- Very small quantity with large distance: still compute km/L; anomaly may flag later (FM-05).

### Ordering
- Previous entry is the latest **saved** fuel entry by `refueling_datetime` (then `created_at`) for the same vehicle within the tenant. That row is the reference. Unsaved form input is not a reference.
- Back-dated supervisor entry that would sit between two existing entries: TODO(PO) — recalculate chain vs validate against latest odometer only (v1 likely latest-odometer rule only).

### Cross-entry types
- Previous entry may be DRIVER_ENTRY or SUPERVISOR_ENTRY; calculation treats them the same for odometer/quantity.

---

## API Endpoints

Invoked internally on `POST /api/v1/fuel-entries/` — no public preview endpoint and no live reflection on the form. Computed fields are stored on the entry and returned in the fuel entry response. That response row is the reference for the next entry.

---

## Access & Permissions

| Action | Role |
|--------|------|
| Trigger calculation | System on fuel entry save (FM-01, FM-02) |

---

## Sub-tasks

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| FM-03-1 | Calculation service | gauge quantity, distance, km/L; no cost rates | High | Not started |
| FM-03-2 | Odometer validation | Reject if ≤ last reading; update vehicle odometer | High | Not started |
| FM-03-3 | Tests | Unit tests for AC-1…AC-4 scenarios + Edge Cases (first entry, override, ≤ odometer) | High | Not started |

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| FM-01, FM-02 | Upstream | Entry save triggers calculation |
| Vehicle master | Downstream | `current_odometer_reading` updated |

---

## Implementation

No new UI. `FuelCalculationService` sits in `apps/vehicle_health` and follows existing service-class and unit-test layout. See the epic rule in the [Fuel Management README](./README.md).

## Definition of Done

- [ ] Service lives in the existing backend structure (`apps/vehicle_health`, unit tests under `tests/unit`)
- [ ] Calculation service implemented and tested (scenarios AC-1.1…AC-4.2) — see [FM-03 TDD catalog](../../../../09-testing/stories-phase-2/005-Fuel%20Management/FM-03-fuel-consumption-calculations-tdd-test-cases.md)
- [ ] TDD catalog statuses updated for P0 rows (`Planned` → `Failing` → `Passing`)
- [ ] Vehicle odometer updated on each entry
- [ ] First-entry null semantics documented in module spec

---

*Epic: Fuel Management | Phase: 2 (unscheduled) | 5 SP | Last Updated: 2026-10-01*
