---
title: Phase 2 — 005 Fuel Management
sprint: ~
phase: Phase 2
status: Planning
epic: Fuel Management
story_points_estimated: 26
---

# 005 — Fuel Management

Gauge-based fuel entry (Driver Supervisor admin + Driver mobile); consumption, history, anomaly detection. Own-fleet only.

Previously planned under Sprint 10 (`03-backlog/phase-1/sprints/sprint-10/01-fuel-management/`). Moved to Phase 2 unscheduled backlog.

| File | Role | TDD test cases |
|------|------|----------------|
| [FM-01](./FM-01-fuel-entry-driver-supervisor-admin.md) | Story — Fuel Entry — Driver Supervisor (Admin Portal) (8 SP) | [FM-01 TDD](../../../../09-testing/stories-phase-2/005-Fuel%20Management/FM-01-fuel-entry-admin-tdd-test-cases.md) |
| [FM-02](./FM-02-fuel-entry-driver-mobile.md) | Story — Fuel Entry — Driver (Mobile Web Interface) (5 SP) | [FM-02 TDD](../../../../09-testing/stories-phase-2/005-Fuel%20Management/FM-02-fuel-entry-driver-mobile-tdd-test-cases.md) |
| [FM-03](./FM-03-fuel-consumption-calculations.md) | Story — Fuel Consumption Calculations & Odometer Validation (5 SP) | [FM-03 TDD](../../../../09-testing/stories-phase-2/005-Fuel%20Management/FM-03-fuel-consumption-calculations-tdd-test-cases.md) |
| [FM-04](./FM-04-fuel-history-and-filters.md) | Story — Fuel History & Filters (3 SP) | [FM-04 TDD](../../../../09-testing/stories-phase-2/005-Fuel%20Management/FM-04-fuel-history-and-filters-tdd-test-cases.md) |
| [FM-05](./FM-05-fuel-anomaly-baselines.md) | Story — Fuel Efficiency Baselines & Anomaly Detection (5 SP) | [FM-05 TDD](../../../../09-testing/stories-phase-2/005-Fuel%20Management/FM-05-fuel-anomaly-baselines-tdd-test-cases.md) |

**Module spec:** [`05-modules/08-fleet-management/fuel-management.md`](../../../../05-modules/08-fleet-management/fuel-management.md)  
**Design reference:** [`example-prototypes/fleet-operations.html`](../../../../example-prototypes/fleet-operations.html)

**Story AC format:** Each story uses **Given–When–Then** acceptance criteria and an **Edge Cases** section. **Gherkin / TDD scenarios** (`AC-N.x`) live in `09-testing` (linked from each story) — not inline under AC.

**TDD test catalogs:**  
- Feature folder: [`09-testing/stories-phase-2/005-Fuel Management/`](../../../../09-testing/stories-phase-2/005-Fuel%20Management/)  
- Master index: [`00-all-test-cases.md`](../../../../09-testing/stories-phase-2/005-Fuel%20Management/00-all-test-cases.md) (`FM-0x-TC##` ↔ story `AC-N.x`)

**Stories:** FM-01 – FM-05 · **Estimated:** ~26 SP

## Fuel entry is the reference

Each saved fuel entry **updates** the gauge and odometer facts for that vehicle:

- Gauge before, gauge after, and fuel filled (after − before, unless the supervisor overrides quantity).
- Odometer on the entry, and `Vehicle.current_odometer_reading`.
- Distance and km/L, stored on the new entry from those readings and the previous saved entry. The form does not preview them while typing.

That saved row is the **reference** for the next fill (previous gauge quantity, odometer, and datetime). The form may show the previous saved entry as read-only context.

The first saved entry is the baseline reference. Distance and km/L stay empty on that row. The next saved entry calculates them against it.

**No cost-calculation fields.** Do not store or show `cost_per_km` (৳/km) or `cost_per_liter` (৳/L). Fuel Cost (BDT) is only the amount entered for that fill. It is not used to calculate a rate.

## Who can log which vehicle

- **Driver** logs fuel on the same Log Fuel Entry page. The vehicle dropdown lists vehicles on their own-fleet transport orders in **Driving Towards Source**. The vehicle master assignment does not open the form.
- **Driver Supervisor, Tenant Super Admin, and Tenant Admin** log any own-fleet vehicle at any time.
- A driver’s own list is the entries that driver created. It stays visible after the trip leaves Driving Towards Source.

## Implementation — theme and structure

Every story in this epic (portal screens, driver mobile web, APIs, services, and tests) stays inside the **current DFMS admin portal theme** and the **current `nourish-backend` structure**.

**Theme**

- Supervisor and history screens extend `admin/base_site.html` and reuse existing portal CSS, form controls, tables, buttons, and spacing.
- Driver Log Fuel Entry is the same portal, responsive, with the same tokens. English and Bengali strings use the existing `{% trans %}` setup.
- The prototype (`fleet-operations.html`) defines **fields and layout intent** only. Production chrome, color, and navigation match the live admin portal, including the existing **Fleet operations** menu.
- No new visual language, no separate frontend, and no native or Vendor App screen.

**Structure**

- New code lives in the tenant app `apps/vehicle_health`, following apps that already exist: `TenantAwareModel`, service classes, DRF views under `/api/v1/`, permissions in `PermissionCodes` + `role_seed_data`, portal links in `portal_navigation.py`, audit through `write_audit_log`.
- Photos reuse the existing image-compression helper. Tests go in `tests/unit` and `tests/api`, plus Playwright for portal screens.
- Do not add a new app shell, a generic upload service, or a parallel UI kit for this epic.

**Phase 2 index:** [../README.md](../README.md)
