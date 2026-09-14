---
jira_key: ~
jira_type: Story
jira_sprint: ~
story_id: FM-05
title: Fuel Efficiency Baselines & Anomaly Detection
epic: Fuel Management
status: Pending
story_points: 5
assignee: ~
phase: Phase 2
design_ref: example-prototypes/fleet-operations.html (Validation Rules + Baselines table)
related_stories:
  - FM-03-fuel-consumption-calculations.md
  - VR-03-vehicle-report-detail-view.md
source_docs:
  - ../../../05-modules/08-fleet-management/fuel-management.md
module_spec: 05-modules/08-fleet-management/fuel-management.md
tdd_test_cases: ../../../09-testing/stories-phase-2/005-Fuel Management/FM-05-fuel-anomaly-baselines-tdd-test-cases.md
tdd_index: ../../../09-testing/stories-phase-2/005-Fuel Management/00-all-test-cases.md
---

# FM-05 — Fuel Efficiency Baselines & Anomaly Detection

## TDD Test Cases

| Link | What |
|------|------|
| [FM-05 TDD catalog](../../../09-testing/stories-phase-2/005-Fuel%20Management/FM-05-fuel-anomaly-baselines-tdd-test-cases.md) | `FM-05-TC01`…`TC10` + edge cases (**unit-first** after FM-03) |
| [Fuel Management TDD index](../../../09-testing/stories-phase-2/005-Fuel%20Management/00-all-test-cases.md) | All FM-01…FM-05 test cases |
| [Feature TDD folder](../../../09-testing/stories-phase-2/005-Fuel%20Management/README.md) | README + recommended TDD order |

Write failing unit tests from the catalog **before** implementation.

## User Story

**As a** Driver Supervisor  
**I want** fuel entries flagged when efficiency drops significantly below the vehicle-type baseline  
**So that** potential theft, misuse, or maintenance issues are surfaced early

## Acceptance Criteria

### AC-1: Vehicle-type baselines

Given a vehicle has a `vehicle_type`,

when anomaly evaluation needs a baseline,

then the system uses the v1 hard-coded mapping below (tenant-configurable later).

| Vehicle Type | Baseline (km/L) | Anomaly threshold |
|--------------|-----------------|-------------------|
| Light Truck (3–5 t) | 8–12 (avg 10) | < 8.0 km/L |
| Medium Truck (7–10 t) | 6–8 (avg 7) | < 5.6 km/L |
| Heavy Truck (15–20 t) | 4–6 (avg 5) | < 4.0 km/L |

- [ ] Baseline derived from vehicle type mapping on `Vehicle.vehicle_type`.
- [ ] Configurable per tenant in future; hard-coded defaults for v1.
- [ ] Anomaly uses **>20% below baseline avg** (equivalent to the threshold column for the listed averages).

**Test Scenarios (AC-1):**

```gherkin
Scenario: AC-1.1 - Light truck baseline average is 10 km/L
  Given a vehicle with vehicle_type Light Truck (3–5 t)
  When baseline lookup runs
  Then baseline average used for anomaly is 10 km/L
  And the 20% below threshold is 8.0 km/L

Scenario: AC-1.2 - Unknown or unmapped vehicle_type
  Given a vehicle whose vehicle_type has no baseline mapping
  When anomaly evaluation runs
  Then anomaly_flag is not set from baseline comparison
  And behaviour is logged/safe (no crash) 
  # TODO(PO): confirm exact fallback if new types appear before config exists
```

### AC-2: Anomaly flag

Given km/L is calculable on save,

when efficiency is more than 20% below the vehicle-type baseline average,

then `anomaly_flag = true`, the entry is still saved, and UI surfaces the status.

- [ ] On save: if km/L calculable and **>20% below** baseline avg → `anomaly_flag = true`.
- [ ] Entry **still saved** (flag-only, not blocked).
- [ ] UI shows anomaly alert in live preview and history Status column.
- [ ] Override / clear anomaly is out of scope (v1).

**Test Scenarios (AC-2):**

```gherkin
Scenario: AC-2.1 - Efficiency more than 20% below baseline flags anomaly
  Given a Medium Truck baseline avg 7 km/L (threshold 5.6)
  And a new entry calculates fuel_consumption_kmpl = 5.0
  When the entry is saved
  Then anomaly_flag is true
  And the FuelEntry row exists

Scenario: AC-2.2 - Efficiency exactly at 20% below is not flagged
  Given baseline avg 10 km/L
  And calculated km/L is exactly 8.0
  When the entry is saved
  Then anomaly_flag is false
  # Rule is "more than" 20% below — exact boundary is not an anomaly

Scenario: AC-2.3 - Efficiency above threshold is Normal
  Given baseline avg 10 km/L
  And calculated km/L is 9.0
  When the entry is saved
  Then anomaly_flag is false
  And history Status shows Normal

Scenario: AC-2.4 - Null km/L does not flag anomaly
  Given first entry for a vehicle so km/L is null
  When the entry is saved
  Then anomaly_flag is false
```

### AC-3: Own-fleet enforcement

Given a client attempts to create a fuel entry,

when the vehicle is vendor-fleet (or otherwise not own-fleet),

then the API and admin reject the request.

- [ ] Fuel entry API and admin reject vendor-fleet vehicles.

**Test Scenarios (AC-3):**

```gherkin
Scenario: AC-3.1 - Vendor vehicle rejected on create
  Given a vendor-fleet vehicle V
  When POST /api/v1/fuel-entries/ targets vehicle V
  Then the request is rejected with a clear own-fleet-only error
  And no FuelEntry is created

Scenario: AC-3.2 - Admin form cannot select vendor vehicle
  Given vendor-fleet vehicles exist
  When a supervisor opens the fuel entry vehicle picker
  Then vendor vehicles are not listed
```

### AC-4: Downstream consumers

Given an entry has `anomaly_flag` set,

when fuel history or vehicle report detail is loaded,

then the flag is exposed to those consumers.

- [ ] `anomaly_flag` exposed on fuel history API and `VehicleReportDetail.fuel.anomaly` (VR-03).

**Test Scenarios (AC-4):**

```gherkin
Scenario: AC-4.1 - History API includes anomaly_flag
  Given an entry with anomaly_flag true
  When GET fuel history for that vehicle
  Then the entry payload includes anomaly_flag true
  And Status/Anomaly is visible in the history UI

Scenario: AC-4.2 - Vehicle report detail consumes anomaly
  Given VR-03 vehicle report detail is available
  And the vehicle has at least one anomalous fuel entry
  When VehicleReportDetail.fuel is loaded
  Then fuel.anomaly reflects the anomaly signal from fuel entries
```

---

## Edge Cases

### Boundary arithmetic
- Use baseline **average** for the >20% rule (Light 10 → flag if km/L < 8.0).
- Floating point: compare with a small epsilon or round to 1 decimal consistent with UI — document in module spec.
- km/L slightly below threshold (e.g. 7.99 vs 8.0): flagged; exactly 8.0: not flagged.

### Missing data
- First entry / null km/L: never anomaly from efficiency rule.
- Quantity override that changes km/L: anomaly uses the stored (possibly overridden) quantity path from FM-03.

### Scope
- No manual clear/override of anomaly in v1.
- High efficiency (above baseline) is not flagged as anomaly in v1.

---

## API Endpoints

Anomaly flag set on `POST /api/v1/fuel-entries/` response and included in fuel history / vehicle report payloads.

---

## Access & Permissions

| Action | Role |
|--------|------|
| View anomaly flag on entries | Same as fuel history (FM-04) |
| Override / clear anomaly | Out of scope (v1) |

---

## Sub-tasks

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| FM-05-1 | Baselines + anomaly flag | Vehicle-type mapping; >20% below baseline | High | Not started |
| FM-05-2 | Own-fleet enforcement | Reject vendor vehicles on fuel entry | High | Not started |
| FM-05-3 | Tests | Boundary cases AC-2.2…AC-2.4; vendor reject; history/report exposure | High | Not started |

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| FM-03 | Upstream | km/L must be calculable |
| VR-03 | Downstream | Anomaly surfaced on vehicle report |

---

## Definition of Done

- [ ] Baseline lookup by vehicle type
- [ ] Anomaly computed on save
- [ ] Unit tests for boundary cases (exactly 20%, first entry, null km/L) — scenarios AC-2.2…AC-2.4 — see [FM-05 TDD catalog](../../../09-testing/stories-phase-2/005-Fuel%20Management/FM-05-fuel-anomaly-baselines-tdd-test-cases.md)
- [ ] Own-fleet reject covered (AC-3.1…AC-3.2)
- [ ] TDD catalog statuses updated for P0 rows (`Planned` → `Failing` → `Passing`)

---

*Epic: Fuel Management | Phase: 2 (unscheduled) | 5 SP | Last Updated: 2026-09-14*
