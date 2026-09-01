---
jira_key: ~
jira_type: Story
jira_sprint: "Sprint 10"
story_id: FM-05
title: Fuel Efficiency Baselines & Anomaly Detection
epic: Fuel Management
status: Pending
story_points: 5
assignee: ~
phase: Phase 2
design_ref: example-prototypes/fuel-management.html (Validation Rules + Baselines table)
related_stories:
  - FM-03-fuel-consumption-calculations.md
  - VR-03-vehicle-report-detail-view.md
source_docs:
  - ../../../../05-modules/08-fleet-management/fuel-management.md
module_spec: 05-modules/08-fleet-management/fuel-management.md
---

# FM-05 — Fuel Efficiency Baselines & Anomaly Detection

## User Story

**As a** Driver Supervisor  
**I want** fuel entries flagged when efficiency drops significantly below the vehicle-type baseline  
**So that** potential theft, misuse, or maintenance issues are surfaced early

## Acceptance Criteria

### AC-1: Vehicle-type baselines

| Vehicle Type | Baseline (km/L) | Anomaly threshold |
|--------------|-----------------|-------------------|
| Light Truck (3–5 t) | 8–12 (avg 10) | < 8.0 km/L |
| Medium Truck (7–10 t) | 6–8 (avg 7) | < 5.6 km/L |
| Heavy Truck (15–20 t) | 4–6 (avg 5) | < 4.0 km/L |

- [ ] Baseline derived from vehicle type mapping on `Vehicle.vehicle_type`.
- [ ] Configurable per tenant in future; hard-coded defaults for Sprint 10.

### AC-2: Anomaly flag

- [ ] On save: if km/L calculable and **>20% below** baseline avg → `anomaly_flag = true`.
- [ ] Entry **still saved** (flag-only, not blocked).
- [ ] UI shows anomaly alert in live preview and history Status column.

### AC-3: Own-fleet enforcement

- [ ] Fuel entry API and admin reject vendor-fleet vehicles.

### AC-4: Downstream consumers

- [ ] `anomaly_flag` exposed on fuel history API and `VehicleReportDetail.fuel.anomaly` (VR-03).

---

## API Endpoints

Anomaly flag set on `POST /api/v1/fuel-entries/` response and included in fuel history / vehicle report payloads.

---

## Access & Permissions

| Action | Role |
|--------|------|
| View anomaly flag on entries | Same as fuel history (FM-04) |
| Override / clear anomaly | Out of scope Sprint 10 |

---

## Sub-tasks — Sprint 10

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| FM-05-1 | Baselines + anomaly flag | Vehicle-type mapping; >20% below baseline | High | Not started |
| FM-05-2 | Own-fleet enforcement | Reject vendor vehicles on fuel entry | High | Not started |

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
- [ ] Unit tests for boundary cases (exactly 20%, first entry, null km/L)

---

*Epic: Fuel Management | Phase: 2 | Sprint 10: 5 SP | Last Updated: 2026-09-01*
