---
jira_key: ~
jira_type: Story
jira_sprint: ~
story_id: FM-01
title: Fuel Entry — Driver Supervisor (Admin Portal)
epic: Fuel Management
status: Pending
story_points: 8
assignee: ~
phase: Phase 2
design_ref: example-prototypes/fleet-operations.html (Log Fuel Entry — supervisor view)
related_stories:
  - FM-02-fuel-entry-driver-mobile.md
  - FM-03-fuel-consumption-calculations.md
  - MDM-05-vehicle-master-data.md (Sprint 2)
source_docs:
  - ../../../05-modules/08-fleet-management/fuel-management.md
  - ../../../example-prototypes/fleet-operations.html
module_spec: 05-modules/08-fleet-management/fuel-management.md
tdd_test_cases: ../../../09-testing/stories-phase-2/005-Fuel Management/FM-01-fuel-entry-admin-tdd-test-cases.md
tdd_index: ../../../09-testing/stories-phase-2/005-Fuel Management/00-all-test-cases.md
---

# FM-01 — Fuel Entry — Driver Supervisor (Admin Portal)

## Test cases

Gherkin / TDD scenarios live under `09-testing` (not inline in this story).

| Navigate | Link |
|----------|------|
| **FM-01 TDD catalog** (`AC-N.x` mapped) | [FM-01-fuel-entry-admin-tdd-test-cases.md](../../../09-testing/stories-phase-2/005-Fuel%20Management/FM-01-fuel-entry-admin-tdd-test-cases.md) |
| **Fuel Management TDD index** (all stories) | [00-all-test-cases.md](../../../09-testing/stories-phase-2/005-Fuel%20Management/00-all-test-cases.md) |
| **Feature TDD folder** | [README](../../../09-testing/stories-phase-2/005-Fuel%20Management/README.md) |

Write failing tests from the catalog **before** implementation.


## User Story

**As a** Driver Supervisor  
**I want to** review and update vehicle information before trip/TO execution and record refueling data for any own-fleet vehicle  
**So that** the vehicle is verified before dispatch and fuel tracking stays accurate when the driver cannot log the entry themselves

## Business Context

Driver Supervisors use fuel entry as part of **pre-trip / pre-execution vehicle checks** — before a TO moves to dispatch, the supervisor may verify the vehicle, **update vehicle information** (e.g. odometer on the vehicle record), and **manually enter all fuel intake data** for the selected vehicle.

v1 uses a **gauge before/after** model from the approved prototype. Supervisor entries are logged from the admin portal (Fleet operations).

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

> **Test scenarios:** see [FM-01 TDD catalog](../../../09-testing/stories-phase-2/005-Fuel%20Management/FM-01-fuel-entry-admin-tdd-test-cases.md) · [Fuel Management index](../../../09-testing/stories-phase-2/005-Fuel%20Management/00-all-test-cases.md)

### AC-1: Pre-trip vehicle selection & vehicle info

Given a Driver Supervisor, Tenant Super Admin, or Tenant Admin opens Log Fuel Entry in the admin portal,

when they select a vehicle from the own-fleet picker,

then the form loads a vehicle context panel and allows optional vehicle-info updates before/during fuel entry.

- [ ] Supervisor **selects vehicle** from own-fleet picker before entering fuel data.
- [ ] On vehicle select, form shows **vehicle context panel**: registration, model, assigned driver, current odometer (from vehicle master / last fuel entry), last fuel entry summary.
- [ ] Supervisor may **update vehicle information** relevant to the check (at minimum: `current_odometer_reading` on vehicle record) before or while completing fuel entry.
- [ ] Vehicle info updates are audit-logged separately from the fuel entry.

### AC-2: Fuel entry form fields (supervisor — all manual except auto-calcs)

Given a vehicle is selected on the supervisor fuel entry form,

when the supervisor enters fuel intake data,

then required fields are enforced and Fuel Filled defaults to After − Before (overridable).

- [ ] **Selectable:** Vehicle *, Refueling Date * (and optional time).
- [ ] **Manual text:** Location / Pump Name * (required for supervisor entries).
- [ ] **Fuel intake:** Fuel Amount Before Intake (L) *, Fuel Amount After Intake (L) *, Fuel Filled (auto: After − Before, overridable), Fuel Cost (BDT) *, Current Odometer (km) *.
- [ ] **Fuel Type:** auto-filled from vehicle `fuel_type`; **editable** if supervisor needs to correct.
- [ ] Assigned Driver shown read-only from vehicle assignment.
- [ ] Notes (optional).
- [ ] After Intake must be **greater than** Before Intake.

### AC-3: Photo uploads

Given the supervisor is completing a fuel entry,

when they upload photos and save,

then gauge before/after photos are required and supporting photos are optional; URLs persist on `FuelEntry`.

- [ ] **Required:** Gauge photo — before intake; Gauge photo — after intake.
- [ ] **Supporting:** Fuel receipt photo; Odometer photo.
- [ ] Files stored via existing tenant file upload pattern; URLs persisted on `FuelEntry`.

### AC-4: On-behalf entry

Given a Driver Supervisor submits a valid fuel entry,

when the entry is persisted,

then it is tagged as a supervisor on-behalf entry with manual location source.

- [ ] Entry Type displayed as **Driver Supervisor Entry**.
- [ ] `entered_by` = current supervisor user; `entry_type = SUPERVISOR_ENTRY`.
- [ ] `location_source = MANUAL`; `refueling_datetime` from supervisor-selected date/time.

### AC-5: Live calculation preview

Given the supervisor is editing fuel intake fields,

when values change,

then the right panel updates live preview metrics (and shows N/A on first entry).

- [ ] Right panel shows live preview: Tank Before, Tank After, Net Filled, Previous Odometer, Distance Since Last Fill, Fuel Efficiency (km/L), Cost Per km, Cost Per Liter.
- [ ] First entry for vehicle: distance and km/L show **N/A** with explanatory note.

### AC-6: Validation rules & RBAC

Given a supervisor attempts to save a fuel entry,

when required fields, fleet scope, photos, or odometer rules fail (or role is unauthorized),

then save is blocked (or access denied) with a clear error.

- [ ] Odometer reading must be **greater than** last recorded odometer for that vehicle.
- [ ] Own-fleet vehicles only in picker.
- [ ] Refueling date and location are **required** for supervisor entries.
- [ ] Save blocked if required photos or gauge validation fails.
- [ ] Roles without `fuel.entry.create` cannot open/submit the form.

---

## Edge Cases

### Form & selection
- Vehicle with no assigned driver: context panel shows empty/unassigned driver; entry still allowed.
- Inactive own-fleet vehicle: TODO(PO) — confirm whether picker excludes inactive vehicles or allows with warning.
- Switching vehicle mid-form: clear prior vehicle-specific preview and photo associations for the previous selection.

### Validation boundaries
- Before = 0 and After > 0 is valid; negative liters rejected.
- Fuel Filled override without `quantity_override_note`: rejected (or note required — enforce per module spec).
- Optional time omitted: persist date at start-of-day or date-only per API contract; must be deterministic.
- Refueling date in the future: TODO(PO) — allow or reject in v1.

### Photos & uploads
- Upload succeeds but save fails: orphaned file handling follows existing tenant upload pattern (no special fuel path).
- Unsupported file type / oversized image: rejected by existing upload validation before entry save.

### Concurrency
- Two supervisors submit entries for the same vehicle nearly simultaneously: both must still pass odometer > last-at-save-time; second may fail if first already advanced odometer.

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
| Open fuel entry form | `driver_supervisor`, `tenant_super_admin`, `tenant_admin` |
| Select any own-fleet vehicle | `driver_supervisor`, `tenant_super_admin`, `tenant_admin` |
| Update vehicle odometer on vehicle record | `driver_supervisor`, `tenant_super_admin`, `tenant_admin` |
| View fuel history (all vehicles) | `driver_supervisor`, `tenant_super_admin`, `tenant_admin` |
| Log fuel for vendor fleet | **Denied** — own fleet only |

**Permission codes (proposed):** `fuel.entry.create`, `fuel.history.view`

---

## Sub-tasks

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| FM-01-1 | `FuelEntry` model | Gauge fields, `location_source`, `refueling_datetime`, image URLs | High | Not started |
| FM-01-2 | Admin form — vehicle picker | Own-fleet picker + vehicle context panel | High | Not started |
| FM-01-3 | Vehicle info update | Optional `current_odometer_reading` patch with audit | High | Not started |
| FM-01-4 | Manual date + location | Supervisor refueling date * and pump location * | High | Not started |
| FM-01-5 | Live calculation preview | Tank before/after, distance, km/L, ৳/km panel | High | Not started |
| FM-01-6 | Photo uploads | Gauge before/after required; receipt + odometer supporting | High | Not started |
| FM-01-7 | Tests | Cover AC-1…AC-6 scenarios + Edge Cases (validation, RBAC, first entry) | High | Not started |

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
- [ ] Unit/API tests for scenarios AC-1.1…AC-6.4 (and listed edge cases in scope) — see [FM-01 TDD catalog](../../../09-testing/stories-phase-2/005-Fuel%20Management/FM-01-fuel-entry-admin-tdd-test-cases.md)
- [ ] TDD catalog statuses updated (`Planned` → `Failing` → `Passing`) for P0 rows

---

*Epic: Fuel Management | Phase: 2 (unscheduled) | 8 SP | Last Updated: 2026-09-14*
