---
jira_key: ~
jira_type: Story
jira_sprint: ~
story_id: FM-02
title: Fuel Entry — Driver (Mobile)
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

# FM-02 — Fuel Entry — Driver (Mobile)

## TDD Test Cases

| Link | What |
|------|------|
| [FM-02 TDD catalog](../../../09-testing/stories-phase-2/005-Fuel%20Management/FM-02-fuel-entry-driver-mobile-tdd-test-cases.md) | `FM-02-TC01`…`TC15` + edge cases (`AC-N.x` mapped) |
| [Fuel Management TDD index](../../../09-testing/stories-phase-2/005-Fuel%20Management/00-all-test-cases.md) | All FM-01…FM-05 test cases |
| [Feature TDD folder](../../../09-testing/stories-phase-2/005-Fuel%20Management/README.md) | README + recommended TDD order |

Write failing tests from the catalog **before** implementation.

## User Story

**As a** Driver  
**I want to** log a refueling event from my mobile app immediately after filling up with minimal manual input  
**So that** fuel tracking stays accurate without re-selecting my vehicle or entering date/location manually

## Business Context

Drivers use the same **gauge before/after** data model as the supervisor portal (FM-01) but with a **streamlined mobile UX**: the assigned vehicle, refueling timestamp, location, and fuel type are **captured automatically** where possible. The driver only enters gauge readings, cost, odometer, and photos.

Entries are tagged `DRIVER_ENTRY`. Offline support follows existing driver mobile sync patterns.

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

### AC-1: Auto-captured fields (driver)

Given a Driver with an assigned vehicle opens Log Fuel Entry on mobile,

when the form loads (and on submit for datetime/GPS),

then vehicle, fuel type, refueling datetime, and location are auto-captured and not manually editable.

- [ ] Menu item: **Log Fuel Entry** in driver mobile app.
- [ ] **Vehicle:** pre-selected from driver’s current assignment; displayed read-only (no picker).
- [ ] **Refueling datetime:** set automatically to **submit timestamp** (device time, synced to server); not editable by driver.
- [ ] **Location:** captured from **device GPS** at submit (`latitude`, `longitude`); optional reverse-geocoded `location_label` for display; driver does not type location manually.
- [ ] **Fuel type:** auto-filled from vehicle master `fuel_type`; **read-only** on form.
- [ ] Location permission requested on first use; if denied, entry blocked with message to enable location (v1 — no manual location fallback for drivers).

**Test Scenarios (AC-1):**

```gherkin
Scenario: AC-1.1 - Form pre-fills assigned vehicle and fuel type
  Given driver "drv.ahmed" is assigned to own-fleet vehicle "DHK-1234" with fuel_type DIESEL
  When the driver opens Log Fuel Entry
  Then vehicle "DHK-1234" is shown read-only
  And fuel type DIESEL is shown read-only
  And no vehicle picker is available

Scenario: AC-1.2 - Submit captures datetime and GPS
  Given the driver has granted location permission
  And all required gauge fields and photos are valid
  When the driver submits the entry
  Then refueling_datetime is set from the submit timestamp
  And latitude/longitude are stored from device GPS
  And location_source is DEVICE_GPS

Scenario: AC-1.3 - Location permission denied blocks entry
  Given the driver has denied (or revoked) location permission
  When the driver attempts to submit a fuel entry
  Then submission is blocked
  And a message instructs the driver to enable location
  And no manual location text field is offered

Scenario: AC-1.4 - No vehicle assignment blocks entry
  Given the driver has no current vehicle assignment
  When the driver opens Log Fuel Entry
  Then the form cannot be submitted
  And a clear message indicates no assigned vehicle
```

### AC-2: Driver-entered fields

Given the auto-captured context is loaded,

when the driver enters gauge, cost, odometer, and photos,

then required intake fields are enforced and Fuel Filled is After − Before.

- [ ] Fuel Amount Before Intake (L) * + gauge photo *
- [ ] Fuel Amount After Intake (L) * + gauge photo *
- [ ] Fuel Filled (auto: After − Before)
- [ ] Fuel Cost (BDT) *
- [ ] Current Odometer (km) *
- [ ] Receipt photo, odometer photo (supporting)
- [ ] Notes (optional)

**Test Scenarios (AC-2):**

```gherkin
Scenario: AC-2.1 - Happy path driver entry fields
  Given assigned vehicle context is loaded
  When the driver enters Before=15, After=55, Cost=4500, Odometer=13000
  And uploads gauge before and after photos
  Then Fuel Filled shows 40
  And receipt/odometer photos remain optional

Scenario: AC-2.2 - Missing required gauge photo blocks submit
  Given numeric fields are valid
  When gauge after photo is missing
  Then submit is blocked with a required-photo error
```

### AC-3: Validation

Given the driver submits a fuel entry,

when gauge, odometer, or photo rules fail (or pass),

then the system validates consistently with FM-01/FM-03 and stamps `location_source = DEVICE_GPS`.

- [ ] After > Before; odometer > last reading; required gauge photos.
- [ ] Live preview of km/L and cost/km where calculable.
- [ ] `location_source = DEVICE_GPS` on saved entry.
- [ ] Driver cannot select another vehicle or enter manual location (v1).

**Test Scenarios (AC-3):**

```gherkin
Scenario: AC-3.1 - After not greater than Before is rejected
  Given the fuel form is open
  When Before=40 and After=40 (or After < Before)
  Then submit is blocked with a gauge validation error

Scenario: AC-3.2 - Odometer not greater than last reading is rejected
  Given last recorded odometer for the assigned vehicle is 13000
  When the driver enters odometer 13000 or less
  Then submit is blocked with an odometer validation error

Scenario: AC-3.3 - Live preview when prior entry exists
  Given a prior fuel entry exists for the assigned vehicle
  When the driver enters valid gauge, cost, and higher odometer
  Then live preview shows km/L and cost/km where calculable

Scenario: AC-3.4 - API rejects vehicle other than assignment
  Given driver session for assigned vehicle A
  When the client POSTs a fuel entry for vehicle B
  Then the request is rejected
```

### AC-4: Offline

Given the device is offline,

when the driver completes a valid fuel entry,

then the entry is queued locally with GPS/timestamp at queue time and synced once with idempotency.

- [ ] Entry queued locally when offline; GPS coordinates captured at queue time.
- [ ] Synced on reconnect with original captured timestamp preserved.
- [ ] Duplicate submission prevented via client idempotency key.

**Test Scenarios (AC-4):**

```gherkin
Scenario: AC-4.1 - Offline queue preserves timestamp and GPS
  Given the device is offline and location permission is granted
  When the driver submits a valid fuel entry
  Then the entry is stored in the local queue
  And queued payload includes GPS at queue time and captured refueling_datetime

Scenario: AC-4.2 - Sync on reconnect preserves original capture
  Given a queued offline fuel entry exists
  When connectivity is restored and sync runs
  Then the server stores the original captured timestamp and coordinates
  And entry_type is DRIVER_ENTRY

Scenario: AC-4.3 - Duplicate submit uses idempotency key
  Given the client already queued/submitted entry with idempotency key K
  When the same payload is submitted again with key K
  Then only one FuelEntry is created
```

### AC-5: Confirmation

Given a fuel entry sync/save succeeds,

when the driver receives confirmation,

then a success message is shown and an informational anomaly flag may appear without blocking save.

- [ ] Success message: “Fuel entry logged!”
- [ ] Anomaly flag shown if efficiency >20% below baseline (informational, entry still saved).

**Test Scenarios (AC-5):**

```gherkin
Scenario: AC-5.1 - Success confirmation
  Given a valid online submit
  When the server accepts the entry
  Then the app shows “Fuel entry logged!”

Scenario: AC-5.2 - Anomaly is informational only
  Given calculated km/L is more than 20% below the vehicle-type baseline (FM-05)
  When the entry is saved
  Then anomaly_flag is true
  And the entry remains saved
  And the UI shows an informational anomaly indicator
```

---

## Edge Cases

### Assignment & permissions
- Assignment changes after form open but before submit: server must re-check assigned vehicle; reject if no longer assigned.
- Helper or non-driver role: no access to Log Fuel Entry.

### GPS & location
- GPS fix unavailable despite permission granted: block submit with retry guidance (v1 — no manual fallback).
- Reverse-geocode failure: still save lat/lng; `location_label` may be empty.

### Offline & sync
- Photos queued offline: follow existing driver mobile media sync; entry must not mark complete until required gauge photos sync succeeds (or fail with retry).
- Server validation fails on sync (e.g. odometer raced ahead): surface error on device; keep/retry per existing sync error UX — do not silently drop.

### Validation boundaries
- First entry for vehicle: distance/km/L N/A in preview; entry still saves (FM-03).
- Zero/negative cost or liters: reject negatives; TODO(PO) whether cost=0 allowed.

---

## API Endpoints

```
POST   /api/v1/fuel-entries/          # driver session; DRIVER_ENTRY
GET    /api/v1/drivers/me/assignment/ # assigned vehicle for pre-fill
POST   /api/v1/uploads/               # gauge/receipt/odometer images
```

Request body includes: `refueling_datetime`, `latitude`, `longitude`, `location_source=DEVICE_GPS`, `entry_type=DRIVER_ENTRY`.

---

## Access & Permissions

| Action | Role |
|--------|------|
| Log fuel entry | `driver` (assigned vehicle only) |
| View own fuel history | `driver` |
| Select vehicle other than assignment | **Denied** |
| Manual location text entry | **Denied** (v1) |

**Permission codes (proposed):** `fuel.entry.create`, `fuel.entry.view_own`

---

## Sub-tasks

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| FM-02-1 | Auto vehicle + fuel type | Assigned vehicle read-only; fuel type from master | High | Not started |
| FM-02-2 | Auto datetime + GPS | Submit timestamp + device coordinates | High | Not started |
| FM-02-3 | Offline queue | Preserve timestamp/GPS at queue time; sync on reconnect | Medium | Not started |
| FM-02-4 | Tests | Cover AC-1…AC-5 scenarios + Edge Cases (GPS deny, offline idempotency, assignment) | High | Not started |

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| FM-03 calculations | Upstream | km/L computed server-side on sync |
| DM-01 driver mobile | Upstream | Navigation shell, offline patterns |
| Device GPS permission | External | Required; no manual location fallback |

---

## Definition of Done

- [ ] Driver mobile fuel screen with auto vehicle, datetime, location, fuel type
- [ ] GPS permission flow and location capture on submit
- [ ] Offline queue + sync with preserved timestamp/location
- [ ] Tests for scenarios AC-1.1…AC-5.2 — see [FM-02 TDD catalog](../../../09-testing/stories-phase-2/005-Fuel%20Management/FM-02-fuel-entry-driver-mobile-tdd-test-cases.md)
- [ ] TDD catalog statuses updated for P0 rows (`Planned` → `Failing` → `Passing`)
- [ ] Maestro / integration test stub
- [ ] l10n EN + BN for fuel entry labels

---

*Epic: Fuel Management | Phase: 2 (unscheduled) | 5 SP | Last Updated: 2026-09-14*
