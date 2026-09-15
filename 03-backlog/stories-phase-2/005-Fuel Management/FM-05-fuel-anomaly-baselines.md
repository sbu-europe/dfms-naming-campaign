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

## Test cases

Gherkin / TDD scenarios live under `09-testing` (not inline in this story).

| Navigate | Link |
|----------|------|
| **FM-05 TDD catalog** (`AC-N.x` mapped) | [FM-05-fuel-anomaly-baselines-tdd-test-cases.md](../../../09-testing/stories-phase-2/005-Fuel%20Management/FM-05-fuel-anomaly-baselines-tdd-test-cases.md) |
| **Fuel Management TDD index** (all stories) | [00-all-test-cases.md](../../../09-testing/stories-phase-2/005-Fuel%20Management/00-all-test-cases.md) |
| **Feature TDD folder** | [README](../../../09-testing/stories-phase-2/005-Fuel%20Management/README.md) |

Write failing tests from the catalog **before** implementation.


## User Story

**As a** Driver Supervisor  
**I want** fuel entries flagged when efficiency drops significantly below the vehicle-type baseline  
**So that** potential theft, misuse, or maintenance issues are surfaced early

## Acceptance Criteria

> **Test scenarios:** see [FM-05 TDD catalog](../../../09-testing/stories-phase-2/005-Fuel%20Management/FM-05-fuel-anomaly-baselines-tdd-test-cases.md) · [Fuel Management index](../../../09-testing/stories-phase-2/005-Fuel%20Management/00-all-test-cases.md)

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

### AC-2: Anomaly flag

Given km/L is calculable on save,

when efficiency is more than 20% below the vehicle-type baseline average,

then `anomaly_flag = true`, the entry is still saved, and UI surfaces the status.

- [ ] On save: if km/L calculable and **>20% below** baseline avg → `anomaly_flag = true`.
- [ ] Entry **still saved** (flag-only, not blocked).
- [ ] UI shows anomaly alert in live preview and history Status column.
- [ ] Override / clear anomaly is out of scope (v1).

### AC-3: Own-fleet enforcement

Given a client attempts to create a fuel entry,

when the vehicle is vendor-fleet (or otherwise not own-fleet),

then the API and admin reject the request.

- [ ] Fuel entry API and admin reject vendor-fleet vehicles.

### AC-4: Downstream consumers

Given an entry has `anomaly_flag` set,

when fuel history or vehicle report detail is loaded,

then the flag is exposed to those consumers.

- [ ] `anomaly_flag` exposed on fuel history API and `VehicleReportDetail.fuel.anomaly` (VR-03).

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
