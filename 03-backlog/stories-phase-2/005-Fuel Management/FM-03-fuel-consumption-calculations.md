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
---

# FM-03 — Fuel Consumption Calculations & Odometer Validation

## User Story

**As a** system  
**I want to** calculate fuel efficiency from consecutive odometer readings and fuel filled quantities  
**So that** Driver Supervisors and Transport Planners can analyse cost and consumption per vehicle

## Business Context

Calculations run **on save** of each fuel entry (except the first for a vehicle). Distance relies on **odometer delta**, not GPS (deferred).

---

## Acceptance Criteria

### AC-1: Computed fields (on save)

- [ ] `fuel_quantity_liters` = `fuel_after_liters − fuel_before_liters` (unless supervisor override with audit note).
- [ ] `distance_since_last_refuel_km` = current odometer − previous entry odometer (null on first entry).
- [ ] `fuel_consumption_kmpl` = distance / fuel_quantity (null on first entry or if distance ≤ 0).
- [ ] `cost_per_km` = fuel_cost / distance (null when distance null).
- [ ] `cost_per_liter` = fuel_cost / fuel_quantity.

### AC-2: Odometer validation

- [ ] Reject save if odometer ≤ last entry odometer for same vehicle.
- [ ] Update `Vehicle.current_odometer_reading` to latest fuel entry odometer.

### AC-3: First entry behaviour

- [ ] First fuel entry for a vehicle: distance, km/L, cost/km stored as null; no error.
- [ ] UI shows “First entry — baseline established from next fill-up.”

### AC-4: Service layer

- [ ] `FuelCalculationService.calculate(entry, previous_entry)` — unit tested with edge cases (zero distance, first entry, override).

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

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| FM-01, FM-02 | Upstream | Entry save triggers calculation |
| Vehicle master | Downstream | `current_odometer_reading` updated |

---

## Definition of Done

- [ ] Calculation service implemented and tested
- [ ] Vehicle odometer updated on each entry
- [ ] First-entry null semantics documented in module spec

---

*Epic: Fuel Management | Phase: 2 (unscheduled) | 5 SP | Last Updated: 2026-09-01*
