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
  - Own-fleet transport order in Driving Towards Source for this driver
  - Device location permission (GPS)
source_docs:
  - ../../../../05-modules/09-mobile-apps/driver-mobile.md
  - ../../../../05-modules/08-fleet-management/fuel-management.md
module_spec: 05-modules/09-mobile-apps/driver-mobile.md
tdd_test_cases: ../../../../09-testing/stories-phase-2/005-Fuel Management/FM-02-fuel-entry-driver-mobile-tdd-test-cases.md
tdd_index: ../../../../09-testing/stories-phase-2/005-Fuel Management/00-all-test-cases.md
---

# FM-02 — Fuel Entry — Driver (Mobile Web Interface)

## Test cases

Gherkin / TDD scenarios live under `09-testing` (not inline in this story).

| Navigate | Link |
|----------|------|
| **FM-02 TDD catalog** (`AC-N.x` mapped) | [FM-02-fuel-entry-driver-mobile-tdd-test-cases.md](../../../../09-testing/stories-phase-2/005-Fuel%20Management/FM-02-fuel-entry-driver-mobile-tdd-test-cases.md) |
| **Fuel Management TDD index** (all stories) | [00-all-test-cases.md](../../../../09-testing/stories-phase-2/005-Fuel%20Management/00-all-test-cases.md) |
| **Feature TDD folder** | [README](../../../../09-testing/stories-phase-2/005-Fuel%20Management/README.md) |

Write failing tests from the catalog **before** implementation.


## User Story

**As a** Driver  
**I want to** log a refueling event for the vehicle on my started trip  
**So that** fuel tracking stays accurate without picking a vehicle or entering date and location manually

## Business Context

Drivers use the same **gauge before/after** data model as the supervisor portal (FM-01) on the responsive driver portal (not a native app). The vehicle is the own-fleet transport order where this user is the driver and the status is **Driving Towards Source**. Datetime and GPS are captured automatically. Fuel type is a dropdown, prefilled when that vehicle has a fuel type. The driver enters gauge readings, cost, odometer, and photos.

A vehicle-master assignment (`Vehicle.assigned_driver`) does not open this form. No order in Driving Towards Source means the form stays closed.

The form does **not** reflect a live calculation. The saved `FuelEntry` is the reference for the next fill (see the epic rule in the [Fuel Management README](./README.md)).

**Driver Supervisor**, **Tenant Super Admin**, and **Tenant Admin** do not use this path. They log any own-fleet vehicle at any time on the FM-01 form.

Entries are tagged `DRIVER_ENTRY` when submitted from this mobile flow. Offline support follows existing driver mobile-interface sync patterns.

### Driver vs Supervisor entry (field behaviour)

| Field | Driver (FM-02) | Driver Supervisor (FM-01) |
|-------|----------------|---------------------------|
| Vehicle | **Dropdown** of vehicles on the driver’s own-fleet TOs in Driving Towards Source. Same page as FM-01 | **Any own-fleet vehicle, any time** |
| Refueling date/time | **Auto-logged** at submit | **Manual** selection |
| Location | **From device GPS** (lat/lng + optional label) | **Manual** pump name / text |
| Fuel type | Dropdown, prefilled when the trip vehicle has a fuel type | Dropdown, prefilled when the selected vehicle has a fuel type |
| Fuel intake fields | Driver enters manually | Supervisor enters manually |

---

## Acceptance Criteria

> **Test scenarios:** see [FM-02 TDD catalog](../../../../09-testing/stories-phase-2/005-Fuel%20Management/FM-02-fuel-entry-driver-mobile-tdd-test-cases.md) · [Fuel Management index](../../../../09-testing/stories-phase-2/005-Fuel%20Management/00-all-test-cases.md)

### AC-1: Auto-captured fields (driver)

Given a Driver opens Log Fuel Entry and has an own-fleet transport order in **Driving Towards Source**,

when the form loads (and on submit for datetime/GPS),

then that order’s vehicle is shown read-only, and datetime and location are captured automatically.

- [ ] Menu item: **Log Fuel Entry** under Fleet operations for `driver`, same URL as the supervisor form (`/admin/vehicle_health/fuelentry/log/`).
- [ ] **Vehicle:** dropdown of `TransportOrder.vehicle` where this user is `TransportOrder.driver`, `fleet_type` is own fleet, and `status` is `driving_towards_source`. The driver chooses one.
- [ ] No such order: form stays closed. Message says there is no trip in Driving Towards Source.
- [ ] Other statuses (Assigned, Ready for Dispatch, At Source, Driving Towards Destination, and later) do not open the form.
- [ ] **Refueling datetime:** set automatically to **submit timestamp** (device time, synced to server); not editable by driver.
- [ ] **Location:** captured from **device GPS** at submit (`latitude`, `longitude`); optional reverse-geocoded `location_label` for display; driver does not type location manually.
- [ ] **Fuel type:** dropdown. Prefilled when the trip vehicle has `fuel_type`. The driver can change it. A blank vehicle fuel type does not block the form.
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
- [ ] No live preview. On save, gauge and odometer update on the entry (FM-03). No cost-calculation fields (no ৳/km, no ৳/L). That entry is the reference for the next fill.
- [ ] `location_source = DEVICE_GPS` on saved entry.
- [ ] Driver cannot select another vehicle or enter manual location (v1).
- [ ] Submit re-checks the order. If it is no longer Driving Towards Source, or the posted `vehicle_id` is not that order’s vehicle, the save is rejected.

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
- [ ] Anomaly flag is stored on the saved entry and may be shown on the confirmation. It is not a live calculation on the form. Entry still saved.

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

### Trip vehicle & permissions
- The order leaves Driving Towards Source after the form opens and before submit: server rejects the save.
- A posted `vehicle_id` that is not that order’s vehicle is rejected.
- `Vehicle.assigned_driver` alone does not allow a driver fuel entry.
- Helper or other roles without fuel permission: no access to Log Fuel Entry.
- `driver_supervisor`, `tenant_super_admin`, and `tenant_admin` log any own-fleet vehicle at any time on FM-01. They are not limited to Driving Towards Source.

### GPS & location
- GPS fix unavailable despite permission granted: block submit with retry guidance (v1 — no manual fallback).
- Reverse-geocode failure: still save lat/lng; `location_label` may be empty.

### Offline & sync
- Photos queued offline: follow existing driver mobile-interface media sync; entry must not mark complete until required gauge photos sync succeeds (or fail with retry).
- Server validation fails on sync (e.g. odometer raced ahead): surface error on device; keep/retry per existing sync error UX — do not silently drop.

### Validation boundaries
- First entry for vehicle: gauge and odometer are stored; distance and km/L stay empty. The row is the baseline reference. Entry still saves (FM-03).
- Zero/negative cost or liters: reject negatives; TODO(PO) whether cost=0 allowed.

---

## API Endpoints

```
POST   /api/v1/fuel-entries/          # DRIVER_ENTRY (driver only)
GET    /api/v1/drivers/me/assignment/ # vehicle on the driver’s TO in Driving Towards Source
```

Request body includes: `refueling_datetime`, `latitude`, `longitude`, `location_source=DEVICE_GPS`, `entry_type=DRIVER_ENTRY`. The server sets the vehicle from that transport order. A mismatched `vehicle_id` is rejected. Photos are multipart on the same create request.

---

## Access & Permissions

| Action | Role |
|--------|------|
| Log fuel entry (driver form) | `driver`, and only for the vehicle on their own-fleet TO in Driving Towards Source |
| Log any vehicle, any time | `driver_supervisor`, `tenant_super_admin`, `tenant_admin` (FM-01) |
| View own fuel entries | `driver` — entries that user created, including after the trip leaves Driving Towards Source |
| Select a vehicle other than the trip vehicle | **Denied** for `driver` |
| Manual location text entry | **Denied** (v1) |

**Permission codes (proposed):** `fuel.entry.create`, `fuel.entry.view_own`

---

## Sub-tasks

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| FM-02-1 | Trip vehicle + fuel type | Read-only vehicle from the TO in Driving Towards Source; fuel type dropdown, prefilled when set | High | Not started |
| FM-02-2 | Auto datetime + GPS | Submit timestamp + device coordinates | High | Not started |
| FM-02-3 | Offline queue | Preserve timestamp/GPS at queue time; sync on reconnect | Medium | Not started |
| FM-02-4 | Audit log | `FUEL_ENTRY_CREATED` on successful create (online + offline sync) | High | Not started |
| FM-02-5 | Tests | Cover AC-1…AC-6 scenarios + Edge Cases (no trip, wrong status, wrong vehicle, GPS deny, offline idempotency, audit) | High | Not started |

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| FM-03 calculations | Upstream | Metrics stored on the saved entry; that entry is the next reference |
| DM-01 driver mobile interface | Upstream | Navigation shell, offline patterns (mobile web) |
| Own-fleet TO | Upstream | Driver and vehicle on the order; status `driving_towards_source` |
| Device GPS permission | External | Required; no manual location fallback |

---

## Implementation

Follow the epic rule in the [Fuel Management README](./README.md). This is a responsive page in the **existing driver portal** (same theme, same nav structure, EN/BN via `{% trans %}`). It is not a new app and not the Vendor App.

## Definition of Done

- [ ] Screen uses the existing portal theme and driver-portal structure (no new visual language)
- [ ] Driver fuel screen uses the vehicle on the TO in Driving Towards Source, with auto datetime and GPS, and a fuel type dropdown
- [ ] Required vs optional fields enforced (gauge values + gauge photos required; receipt/odometer photos and notes optional)
- [ ] GPS permission flow and location capture on submit
- [ ] Offline queue + sync with preserved timestamp/location
- [ ] Audit log written on successful fuel entry create
- [ ] Tests for scenarios AC-1.1…AC-6.2 — see [FM-02 TDD catalog](../../../../09-testing/stories-phase-2/005-Fuel%20Management/FM-02-fuel-entry-driver-mobile-tdd-test-cases.md)
- [ ] TDD catalog statuses updated for P0 rows (`Planned` → `Failing` → `Passing`)
- [ ] Maestro / integration test stub (mobile web)
- [ ] l10n EN + BN for fuel entry labels

---

*Epic: Fuel Management | Phase: 2 (unscheduled) | 5 SP | Last Updated: 2026-10-01*
