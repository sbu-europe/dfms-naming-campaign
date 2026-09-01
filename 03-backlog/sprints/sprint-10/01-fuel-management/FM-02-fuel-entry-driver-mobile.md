---
jira_key: ~
jira_type: Story
jira_sprint: "Sprint 10"
story_id: FM-02
title: Fuel Entry — Driver (Mobile)
epic: Fuel Management
status: Pending
story_points: 5
assignee: ~
phase: Phase 2
design_ref: example-prototypes/fuel-management.html (Log Fuel Entry — driver view)
related_stories:
  - FM-01-fuel-entry-driver-supervisor-admin.md
  - FM-03-fuel-consumption-calculations.md
  - DM-01-driver-mobile-interface-to-list-milestones-pod.md (Sprint 4)
dependencies:
  - FM-03 (calculation rules)
  - Driver assigned to vehicle
  - Device location permission (GPS)
source_docs:
  - ../../../../05-modules/09-mobile-apps/driver-mobile.md
  - ../../../../05-modules/08-fleet-management/fuel-management.md
module_spec: 05-modules/09-mobile-apps/driver-mobile.md
---

# FM-02 — Fuel Entry — Driver (Mobile)

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

- [ ] Menu item: **Log Fuel Entry** in driver mobile app.
- [ ] **Vehicle:** pre-selected from driver’s current assignment; displayed read-only (no picker).
- [ ] **Refueling datetime:** set automatically to **submit timestamp** (device time, synced to server); not editable by driver.
- [ ] **Location:** captured from **device GPS** at submit (`latitude`, `longitude`); optional reverse-geocoded `location_label` for display; driver does not type location manually.
- [ ] **Fuel type:** auto-filled from vehicle master `fuel_type`; **read-only** on form.
- [ ] Location permission requested on first use; if denied, entry blocked with message to enable location (Sprint 10 — no manual location fallback for drivers).

### AC-2: Driver-entered fields

- [ ] Fuel Amount Before Intake (L) * + gauge photo *
- [ ] Fuel Amount After Intake (L) * + gauge photo *
- [ ] Fuel Filled (auto: After − Before)
- [ ] Fuel Cost (BDT) *
- [ ] Current Odometer (km) *
- [ ] Receipt photo, odometer photo (supporting)
- [ ] Notes (optional)

### AC-3: Validation

- [ ] After > Before; odometer > last reading; required gauge photos.
- [ ] Live preview of km/L and cost/km where calculable.
- [ ] `location_source = DEVICE_GPS` on saved entry.

### AC-4: Offline

- [ ] Entry queued locally when offline; GPS coordinates captured at queue time.
- [ ] Synced on reconnect with original captured timestamp preserved.
- [ ] Duplicate submission prevented via client idempotency key.

### AC-5: Confirmation

- [ ] Success message: “Fuel entry logged!”
- [ ] Anomaly flag shown if efficiency >20% below baseline (informational, entry still saved).

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
| Manual location text entry | **Denied** (Sprint 10) |

**Permission codes (proposed):** `fuel.entry.create`, `fuel.entry.view_own`

---

## Sub-tasks — Sprint 10

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| FM-02-1 | Auto vehicle + fuel type | Assigned vehicle read-only; fuel type from master | High | Not started |
| FM-02-2 | Auto datetime + GPS | Submit timestamp + device coordinates | High | Not started |
| FM-02-3 | Offline queue | Preserve timestamp/GPS at queue time; sync on reconnect | Medium | Not started |

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
- [ ] Maestro / integration test stub
- [ ] l10n EN + BN for fuel entry labels

---

*Epic: Fuel Management | Phase: 2 | Sprint 10: 5 SP | Last Updated: 2026-09-01*
