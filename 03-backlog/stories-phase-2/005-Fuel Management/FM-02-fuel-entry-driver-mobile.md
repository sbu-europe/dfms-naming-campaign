---
jira_key: ~
jira_type: Story
jira_sprint: ~
story_id: FM-02
title: Fuel Entry — Driver (Mobile Web Interface)
epic: Fuel Management
status: Pending
story_points: 5
assignee: ~
phase: Phase 2
design_ref: example-prototypes/fleet-operations.html (Log Fuel Entry — driver view)
related_stories:
  - FM-01-fuel-entry-driver-supervisor-admin.md
  - FM-03-fuel-consumption-calculations.md
  - DM-01-driver-mobile-interface-to-list-milestones-pod.md (Sprint 4)
dependencies:
  - FM-03 (calculation rules)
  - Driver assigned to vehicle
  - Device location permission (GPS)
source_docs:
  - ../../../05-modules/09-mobile-apps/driver-mobile.md
  - ../../../05-modules/08-fleet-management/fuel-management.md
module_spec: 05-modules/09-mobile-apps/driver-mobile.md
tdd_test_cases: ../../../09-testing/stories-phase-2/005-Fuel Management/FM-02-fuel-entry-driver-mobile-tdd-test-cases.md
tdd_index: ../../../09-testing/stories-phase-2/005-Fuel Management/00-all-test-cases.md
---

# FM-02 — Fuel Entry — Driver (Mobile Web Interface)

## Test cases

Gherkin / TDD scenarios live under `09-testing` (not inline in this story).

| Navigate | Link |
|----------|------|
| **FM-02 TDD catalog** (`AC-N.x` mapped) | [FM-02-fuel-entry-driver-mobile-tdd-test-cases.md](../../../09-testing/stories-phase-2/005-Fuel%20Management/FM-02-fuel-entry-driver-mobile-tdd-test-cases.md) |
| **Fuel Management TDD index** (all stories) | [00-all-test-cases.md](../../../09-testing/stories-phase-2/005-Fuel%20Management/00-all-test-cases.md) |
| **Feature TDD folder** | [README](../../../09-testing/stories-phase-2/005-Fuel%20Management/README.md) |

Write failing tests from the catalog **before** implementation.


## User Story

**As a** Driver, Tenant Super Admin, or Tenant Admin  
**I want to** log a refueling event from the **mobile web interface** immediately after filling up with minimal manual input  
**So that** fuel tracking stays accurate without re-selecting my vehicle or entering date/location manually

## Business Context

Drivers use the same **gauge before/after** data model as the supervisor portal (FM-01) but with a **streamlined mobile web UX** (responsive driver portal — **not** a separate native mobile app): the assigned vehicle, refueling timestamp, location, and fuel type are **captured automatically** where possible. The driver only enters gauge readings, cost, odometer, and photos.

**Tenant Super Admin** and **Tenant Admin** also have access to this mobile Log Fuel Entry surface (same auto-capture rules when a vehicle assignment applies; otherwise use FM-01 admin entry for any own-fleet vehicle).

Entries are tagged `DRIVER_ENTRY` when submitted from this mobile flow. Offline support follows existing driver mobile-interface sync patterns.

### Driver vs Supervisor entry (field behaviour)

| Field | Driver (FM-02) | Driver Supervisor (FM-01) |
|-------|----------------|---------------------------|
| Vehicle | **Pre-selected** (assigned vehicle, read-only) | **Selectable** picker |
| Refueling date/time | **Auto-logged** at submit | **Manual** selection |
| Location | **From device GPS** (lat/lng + optional label) | **Manual** pump name / text |
| Fuel type | **Auto-filled** from vehicle; read-only | Auto-filled; editable |
| Fuel intake fields | Driver enters manually | Supervisor enters manually |

---

## Acceptance Criteria

> **Test scenarios:** see [FM-02 TDD catalog](../../../09-testing/stories-phase-2/005-Fuel%20Management/FM-02-fuel-entry-driver-mobile-tdd-test-cases.md) · [Fuel Management index](../../../09-testing/stories-phase-2/005-Fuel%20Management/00-all-test-cases.md)

### AC-1: Auto-captured fields (driver)

Given a Driver, Tenant Super Admin, or Tenant Admin with an assigned vehicle opens Log Fuel Entry on the mobile web interface,

when the form loads (and on submit for datetime/GPS),

then vehicle, fuel type, refueling datetime, and location are auto-captured and not manually editable.

- [ ] Menu item: **Log Fuel Entry** in the **mobile web interface** (Driver, Tenant Super Admin, Tenant Admin).
- [ ] **Vehicle:** pre-selected from driver’s current assignment; displayed read-only (no picker).
- [ ] **Refueling datetime:** set automatically to **submit timestamp** (device time, synced to server); not editable by driver.
- [ ] **Location:** captured from **device GPS** at submit (`latitude`, `longitude`); optional reverse-geocoded `location_label` for display; driver does not type location manually.
- [ ] **Fuel type:** auto-filled from vehicle master `fuel_type`; **read-only** on form.
- [ ] Location permission requested on first use; if denied, entry blocked with message to enable location (v1 — no manual location fallback for drivers).

### AC-2: Driver-entered fields

Given the auto-captured context is loaded,

when the driver enters gauge, cost, odometer, and photos,

then required vs optional fields are enforced and Fuel Filled is After − Before.

**Required (must be provided to submit):**
- [ ] **Fuel Amount Before Intake (L)** — numeric *
- [ ] **Gauge photo — before intake** *
- [ ] **Fuel Amount After Intake (L)** — numeric *
- [ ] **Gauge photo — after intake** *
- [ ] **Fuel Cost (BDT)** *
- [ ] **Current Odometer (km)** *

**Auto-calculated (not entered by driver):**
- [ ] **Fuel Filled (L)** = After − Before (display-only / server-computed)

**Optional (submit allowed without these):**
- [ ] **Fuel Receipt Photo upload** — **optional**; not required to create the entry.
- [ ] **Odometer photo** — **optional** (supporting).
- [ ] **Notes** — **optional** (free text).

### AC-3: Validation

Given the driver submits a fuel entry,

when gauge, odometer, or photo rules fail (or pass),

then the system validates consistently with FM-01/FM-03 and stamps `location_source = DEVICE_GPS`.

- [ ] After > Before; odometer > last reading; required gauge photos.
- [ ] Live preview of km/L and cost/km where calculable.
- [ ] `location_source = DEVICE_GPS` on saved entry.
- [ ] Driver cannot select another vehicle or enter manual location (v1).

### AC-4: Offline

Given the device is offline,

when the driver completes a valid fuel entry,

then the entry is queued locally with GPS/timestamp at queue time and synced once with idempotency.

- [ ] Entry queued locally when offline; GPS coordinates captured at queue time.
- [ ] Synced on reconnect with original captured timestamp preserved.
- [ ] Duplicate submission prevented via client idempotency key.

### AC-5: Confirmation

Given a fuel entry sync/save succeeds,

when the driver receives confirmation,

then a success message is shown, the entry is audit-logged, and an informational anomaly flag may appear without blocking save.

- [ ] Success message: “Fuel entry logged!”
- [ ] **Audit log:** successful fuel entry create is audit-logged in the system (see AC-6).
- [ ] Anomaly flag shown if efficiency >20% below baseline (informational, entry still saved).

### AC-6: Audit log

Given a driver fuel entry is successfully created (online submit or offline sync),

when persistence succeeds,

then the fuel entry is **audit-logged** in the system.

- [ ] Every successful `FuelEntry` create writes an audit log (`FUEL_ENTRY_CREATED`, or equivalent existing audit action pattern).
- [ ] Audit payload includes at least: `fuel_entry_id`, `vehicle_id`, `created_by` (driver user), `entry_type=DRIVER_ENTRY`, `submitted_at` / timestamp.
- [ ] Offline sync that creates the server record also writes the audit log (once per created entry; idempotent with the entry).
- [ ] Failed / blocked submits do **not** create a success audit log for a fuel entry.

---

## Edge Cases

### Assignment & permissions
- Assignment changes after form open but before submit: server must re-check assigned vehicle; reject if no longer assigned.
- Helper or other roles without fuel permission: no access to Log Fuel Entry.
- `tenant_super_admin` and `tenant_admin` **have access** to Log Fuel Entry on this mobile surface.

### GPS & location
- GPS fix unavailable despite permission granted: block submit with retry guidance (v1 — no manual fallback).
- Reverse-geocode failure: still save lat/lng; `location_label` may be empty.

### Offline & sync
- Photos queued offline: follow existing driver mobile-interface media sync; entry must not mark complete until required gauge photos sync succeeds (or fail with retry).
- Server validation fails on sync (e.g. odometer raced ahead): surface error on device; keep/retry per existing sync error UX — do not silently drop.

### Validation boundaries
- First entry for vehicle: distance/km/L N/A in preview; entry still saves (FM-03).
- Zero/negative cost or liters: reject negatives; TODO(PO) whether cost=0 allowed.

---

## API Endpoints

```
POST   /api/v1/fuel-entries/          # DRIVER_ENTRY (driver / tenant_super_admin / tenant_admin)
GET    /api/v1/drivers/me/assignment/ # assigned vehicle for pre-fill
POST   /api/v1/uploads/               # gauge/receipt/odometer images
```

Request body includes: `refueling_datetime`, `latitude`, `longitude`, `location_source=DEVICE_GPS`, `entry_type=DRIVER_ENTRY`.

---

## Access & Permissions

| Action | Role |
|--------|------|
| Log fuel entry (mobile web) | `driver` (assigned vehicle only), `tenant_super_admin`, `tenant_admin` |
| View own fuel history | `driver`, `tenant_super_admin`, `tenant_admin` |
| Select vehicle other than assignment | **Denied** for `driver`; admins without assignment use FM-01 |
| Manual location text entry | **Denied** (v1) |

**Permission codes (proposed):** `fuel.entry.create`, `fuel.entry.view_own`

---

## Sub-tasks

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| FM-02-1 | Auto vehicle + fuel type | Assigned vehicle read-only; fuel type from master | High | Not started |
| FM-02-2 | Auto datetime + GPS | Submit timestamp + device coordinates | High | Not started |
| FM-02-3 | Offline queue | Preserve timestamp/GPS at queue time; sync on reconnect | Medium | Not started |
| FM-02-4 | Audit log | `FUEL_ENTRY_CREATED` on successful create (online + offline sync) | High | Not started |
| FM-02-5 | Tests | Cover AC-1…AC-6 scenarios + Edge Cases (GPS deny, offline idempotency, assignment, audit) | High | Not started |

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| FM-03 calculations | Upstream | km/L computed server-side on sync |
| DM-01 driver mobile interface | Upstream | Navigation shell, offline patterns (mobile web) |
| Device GPS permission | External | Required; no manual location fallback |

---

## Definition of Done

- [ ] Driver **mobile web** fuel screen with auto vehicle, datetime, location, fuel type
- [ ] Required vs optional fields enforced (gauge values + gauge photos required; receipt/odometer photos and notes optional)
- [ ] GPS permission flow and location capture on submit
- [ ] Offline queue + sync with preserved timestamp/location
- [ ] Audit log written on successful fuel entry create
- [ ] Tests for scenarios AC-1.1…AC-6.2 — see [FM-02 TDD catalog](../../../09-testing/stories-phase-2/005-Fuel%20Management/FM-02-fuel-entry-driver-mobile-tdd-test-cases.md)
- [ ] TDD catalog statuses updated for P0 rows (`Planned` → `Failing` → `Passing`)
- [ ] Maestro / integration test stub (mobile web)
- [ ] l10n EN + BN for fuel entry labels

---

*Epic: Fuel Management | Phase: 2 (unscheduled) | 5 SP | Last Updated: 2026-09-14*
