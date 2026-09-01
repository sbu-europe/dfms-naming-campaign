---
jira_key: ~
jira_type: Story
jira_sprint: "Sprint 10"
story_id: FM-01
title: Fuel Entry — Driver Supervisor (Admin Portal)
epic: Fuel Management
status: Pending
story_points: 8
assignee: ~
phase: Phase 2
design_ref: example-prototypes/fuel-management.html (Log Fuel Entry — supervisor view)
related_stories:
  - FM-02-fuel-entry-driver-mobile.md
  - FM-03-fuel-consumption-calculations.md
  - MDM-05-vehicle-master-data.md (Sprint 2)
source_docs:
  - ../../../../05-modules/08-fleet-management/fuel-management.md
  - ../../../../example-prototypes/fuel-management.html
module_spec: 05-modules/08-fleet-management/fuel-management.md
---

# FM-01 — Fuel Entry — Driver Supervisor (Admin Portal)

## User Story

**As a** Driver Supervisor  
**I want to** review and update vehicle information before trip/TO execution and record refueling data for any own-fleet vehicle  
**So that** the vehicle is verified before dispatch and fuel tracking stays accurate when the driver cannot log the entry themselves

## Business Context

Driver Supervisors use fuel entry as part of **pre-trip / pre-execution vehicle checks** — before a TO moves to dispatch, the supervisor may verify the vehicle, **update vehicle information** (e.g. odometer on the vehicle record), and **manually enter all fuel intake data** for the selected vehicle.

Sprint 10 uses a **gauge before/after** model from the approved prototype. Supervisor entries are logged from the admin portal (Fleet operations).

**Entry type:** `SUPERVISOR_ENTRY` — distinct from driver mobile entries for audit.

**Own fleet only** — vendor vehicles are excluded from the vehicle picker.

### Supervisor vs Driver entry (field behaviour)

| Field | Driver Supervisor (FM-01) | Driver mobile (FM-02) |
|-------|----------------------------|------------------------|
| Vehicle | **Selectable** (picker) | **Pre-selected** (assigned vehicle, read-only) |
| Refueling date/time | **Manual** (supervisor picks date; time optional) | **Auto-logged** at submit (device/server timestamp) |
| Location | **Manual** (pump name / location text) | **From device** (GPS coordinates + optional reverse-geocoded label) |
| Fuel type | Auto-filled from vehicle; **editable** if correcting data | Auto-filled from vehicle; **read-only** |
| All fuel intake fields | Supervisor **manually enters** all values | Driver enters gauge, cost, odometer, photos |

---

## Acceptance Criteria

### AC-1: Pre-trip vehicle selection & vehicle info

- [ ] Supervisor **selects vehicle** from own-fleet picker before entering fuel data.
- [ ] On vehicle select, form shows **vehicle context panel**: registration, model, assigned driver, current odometer (from vehicle master / last fuel entry), last fuel entry summary.
- [ ] Supervisor may **update vehicle information** relevant to the check (at minimum: `current_odometer_reading` on vehicle record) before or while completing fuel entry.
- [ ] Vehicle info updates are audit-logged separately from the fuel entry.

### AC-2: Fuel entry form fields (supervisor — all manual except auto-calcs)

- [ ] **Selectable:** Vehicle *, Refueling Date * (and optional time).
- [ ] **Manual text:** Location / Pump Name * (required for supervisor entries).
- [ ] **Fuel intake:** Fuel Amount Before Intake (L) *, Fuel Amount After Intake (L) *, Fuel Filled (auto: After − Before, overridable), Fuel Cost (BDT) *, Current Odometer (km) *.
- [ ] **Fuel Type:** auto-filled from vehicle `fuel_type`; **editable** if supervisor needs to correct.
- [ ] Assigned Driver shown read-only from vehicle assignment.
- [ ] Notes (optional).
- [ ] After Intake must be **greater than** Before Intake.

### AC-3: Photo uploads

- [ ] **Required:** Gauge photo — before intake; Gauge photo — after intake.
- [ ] **Supporting:** Fuel receipt photo; Odometer photo.
- [ ] Files stored via existing tenant file upload pattern; URLs persisted on `FuelEntry`.

### AC-4: On-behalf entry

- [ ] Entry Type displayed as **Driver Supervisor Entry**.
- [ ] `entered_by` = current supervisor user; `entry_type = SUPERVISOR_ENTRY`.
- [ ] `location_source = MANUAL`; `refueling_datetime` from supervisor-selected date/time.

### AC-5: Live calculation preview

- [ ] Right panel shows live preview: Tank Before, Tank After, Net Filled, Previous Odometer, Distance Since Last Fill, Fuel Efficiency (km/L), Cost Per km, Cost Per Liter.
- [ ] First entry for vehicle: distance and km/L show **N/A** with explanatory note.

### AC-6: Validation rules

- [ ] Odometer reading must be **greater than** last recorded odometer for that vehicle.
- [ ] Own-fleet vehicles only in picker.
- [ ] Refueling date and location are **required** for supervisor entries.
- [ ] Save blocked if required photos or gauge validation fails.

---

## API Endpoints

```
POST   /api/v1/fuel-entries/                    # create supervisor entry
GET    /api/v1/vehicles/{id}/                    # vehicle context (odometer, driver, fuel_type)
PATCH  /api/v1/vehicles/{id}/                   # optional odometer update before entry
GET    /api/v1/vehicles/{id}/fuel-history/      # last entry for context panel
POST   /api/v1/uploads/                         # gauge/receipt/odometer images (existing pattern)

# Admin
GET    /admin/vehicle_health/fuelentry/add/     # or Fleet → Log Fuel Entry custom view
```

---

## Access & Permissions

| Action | Role |
|--------|------|
| Open fuel entry form | `driver_supervisor`, `tenant_admin` |
| Select any own-fleet vehicle | `driver_supervisor`, `tenant_admin` |
| Update vehicle odometer on vehicle record | `driver_supervisor`, `tenant_admin` |
| View fuel history (all vehicles) | `driver_supervisor`, `tenant_admin` |
| Log fuel for vendor fleet | **Denied** — own fleet only |

**Permission codes (proposed):** `fuel.entry.create`, `fuel.history.view`

---

## Sub-tasks — Sprint 10

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| FM-01-1 | `FuelEntry` model | Gauge fields, `location_source`, `refueling_datetime`, image URLs | High | Not started |
| FM-01-2 | Admin form — vehicle picker | Own-fleet picker + vehicle context panel | High | Not started |
| FM-01-3 | Vehicle info update | Optional `current_odometer_reading` patch with audit | High | Not started |
| FM-01-4 | Manual date + location | Supervisor refueling date * and pump location * | High | Not started |
| FM-01-5 | Live calculation preview | Tank before/after, distance, km/L, ৳/km panel | High | Not started |
| FM-01-6 | Photo uploads | Gauge before/after required; receipt + odometer supporting | High | Not started |

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| MDM-05 Vehicle master | Upstream | Own-fleet vehicles, `fuel_type`, odometer fields |
| FM-03 calculations | Downstream | Metrics computed on save |
| Driver assignment | Upstream | Assigned driver shown read-only |
| File upload service | Upstream | Existing tenant upload pattern |

---

## Definition of Done

- [ ] Admin fuel entry form matches prototype field set
- [ ] Gauge photos required; receipt/odometer optional
- [ ] Live preview updates on input
- [ ] Supervisor on-behalf entry persisted with correct entry_type
- [ ] Unit tests for validation rules
- [ ] E2E scenario stub in `09-testing/backend/e2e-scenarios/sprint-10/`

---

*Epic: Fuel Management | Phase: 2 | Sprint 10: 8 SP | Last Updated: 2026-09-01*
