---
section: 09-testing/stories-phase-2/002-Vehicle Tracking and Dashboard
specification: FVM-02 Vehicle Tracking and Dashboard — TDD test cases
version: 1.0
phase: Phase 2
tdd: true
related_stories: FVM-02
source_spec: ../../../03-backlog/phase-2/stories-phase-2/002-Vehicle Tracking and Dashboard/FVM-02-vehicle-tracking-and-dashboard.md
module_spec: ../../../../05-modules/02-master-data/vehicle-master-data.md
suggested_impl:
  unit: FleetHealthDashboardService.status_counts / apply_filters
  api: GET fleet health dashboard + vehicle detail
  e2e: Playwright admin — Transport Planner Health Dashboard
last_updated: 2026-09-15
---

# FVM-02 — Vehicle Tracking and Dashboard — TDD test cases

**Story:** [FVM-02](../../../03-backlog/phase-2/stories-phase-2/002-Vehicle%20Tracking%20and%20Dashboard/FVM-02-vehicle-tracking-and-dashboard.md)  
**Approach:** Write failing API tests for card counts vs `operational_status` → filters → E2E.  
**Does not:** write odometer; add a fuel-entry form; add a map; replace TDO `GET /vehicles/available`.

## Seed prerequisites (when implementing)

| Item | Notes |
|------|--------|
| Roles | `transport_planner`, `tenant_admin`, `driver_supervisor`; negative: ungranted role |
| Vehicles | Own-fleet covering all five statuses; ≥1 vendor-fleet; ≥1 with meter reading; ≥1 with null odometer; ≥1 Under Maintenance |
| Assignment | One started TO (yard or origin/destination); one assigned not started (**Scheduled**) |
| Fuel | Optional FuelEntry rows for AC-4.1; a vehicle with **no** fuel history for AC-4.2 |
| Depots | ≥2 `assigned_poi` values |

---

## A — Status cards (AC-1)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FVM-02-TC01 | AC-1.1 | E2E / API | Five status counts | As Transport Planner, open Health Dashboard. Assert five counts: **No Active TO**, **Scheduled**, **In-transit**, **Under Maintenance**, **Inactive**. | P0 | Planned |
| FVM-02-TC02 | AC-1.2 | API | Counts match real status | Seed known own-fleet statuses. Assert card counts equal those `operational_status` values; labels are the V3 enum (no made-up names). | P0 | Planned |
| FVM-02-TC03 | AC-1.3 | E2E | Clicking a card filters the list | Click **In-transit**. Assert list shows only In-transit vehicles. Repeat for another card. | P0 | Planned |
| FVM-02-TC04 | AC-1.4 | API | In-transit = started TO, not GPS | Vehicle on a started TO (including yard) with GPS speed 0. Assert counted as **In-transit**, not No Active TO. | P0 | Planned |

## B — Filters (AC-2)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FVM-02-TC05 | AC-2.1 | API / E2E | Depot filter | Vehicles on depot A and B. Filter depot A. Assert cards and list include only A. | P0 | Planned |
| FVM-02-TC06 | AC-2.2 | API / E2E | Own-fleet default | Open dashboard with no ownership filter. Assert vendor-fleet excluded; own-fleet shown. | P0 | Planned |
| FVM-02-TC07 | AC-2.3 | API / E2E | Type and registration search | Filter vehicle type and/or search registration. Assert cards and list match. | P1 | Planned |
| FVM-02-TC08 | AC-2.4 | API | Cards and list share filters | Apply depot + type + search together. Assert card totals equal filtered list composition. | P0 | Planned |

## C — Per-vehicle kilometers (AC-3)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FVM-02-TC09 | AC-3.1 | E2E / API | Show current km when reading exists | Vehicle with FVM-01 current km 12150. Assert list/detail shows 12150. | P0 | Planned |
| FVM-02-TC10 | AC-3.2 | E2E / API | No reading → odometer unavailable | Null current km. Assert **odometer unavailable**; not 0; not GPS/map distance. | P0 | Planned |
| FVM-02-TC11 | AC-3.3 | E2E / API | Dashboard cannot change meter km | As Transport Planner on dashboard. Assert no meter-entry control; POST reading from this surface denied. | P0 | Planned |

## D — Fuel intake (AC-4)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FVM-02-TC12 | AC-4.1 | API / E2E | Fuel liters when entries exist | FuelEntry rows exist. Assert period + lifetime liters (and cost if recorded). | P1 | Planned |
| FVM-02-TC13 | AC-4.2 | API / E2E | Fuel unavailable without entries | No FuelEntry. Assert fuel intake **unavailable**; no fake liters. | P0 | Planned |
| FVM-02-TC14 | AC-4.3 | E2E | No fuel-entry form on dashboard | Open vehicle from Health Dashboard. Assert no Log Fuel Entry form on this screen. | P0 | Planned |

## E — Maintenance history & current assignment (AC-5)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FVM-02-TC15 | AC-5.1 | E2E / API | Current availability status | Open vehicle detail. Assert current `operational_status` (lifecycle now). | P0 | Planned |
| FVM-02-TC16 | AC-5.2 | E2E / API | Current TO, driver, trip | Vehicle assigned to a TO. Assert TO number, TO status, driver, and trip if one exists. | P0 | Planned |
| FVM-02-TC17 | AC-5.3 | E2E | Maintenance history | Service log and/or DS-01 inspection / UM / clearance exist. Assert date + meter km for services; last inspection / UM / clearance when present. | P1 | Planned |
| FVM-02-TC18 | AC-5.4 | API | Under Maintenance still not assignable | Vehicle Under Maintenance. Assert still absent from TDO available-vehicle list (existing rule). | P0 | Planned |

## F — Who can see and do what (AC-6)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FVM-02-TC19 | AC-6.1 | E2E | Planner and Tenant Admin full dashboard | As Transport Planner and as Tenant Admin. Assert full Health Dashboard (cards + list + detail). | P0 | Planned |
| FVM-02-TC20 | AC-6.2 | E2E | Driver Supervisor may view | As Driver Supervisor, open dashboard for same fleet. Assert view allowed; this is not the DS-01 maintenance **work queue**. | P1 | Planned |
| FVM-02-TC21 | AC-6.3 | E2E | Not the live GPS map | On Health Dashboard. Assert no live GPS map / no map layer added. | P0 | Planned |

---

## Edge cases (from GWT And/not clauses)

| Test Case ID | Layer | Scenario | Assert | Priority | Status |
|--------------|-------|----------|--------|----------|--------|
| FVM-02-EC01 | API | Empty own-fleet | All five counts = 0; empty list (not error) | P1 | Planned |
| FVM-02-EC02 | API | Inactive vs No Active TO | `is_active=false` counted **Inactive** only | P0 | Planned |
| FVM-02-EC03 | API | Vendor excluded from default | Vendor never in own-fleet default counts | P0 | Planned |
| FVM-02-EC04 | API / E2E | Card filter ∩ depot filter | Click card after depot filter; list is intersection | P0 | Planned |
| FVM-02-EC05 | E2E | Unassigned vehicle detail | No current TO / driver / trip shown (empty, not leftover) | P1 | Planned |
| FVM-02-EC06 | API | Ungranted role | Dashboard GET 403; no menu | P0 | Planned |
| FVM-02-EC07 | API | Cross-tenant vehicles | Not in counts or list | P0 | Planned |
| FVM-02-EC08 | — | FuelEntry exists with 0 liters | TODO(PO) — show 0 vs unavailable | P2 | Blocked (PO) |

---

## Suggested code test targets (TDD)

```
tests/unit/.../test_fleet_health_dashboard_counts.py   # TC01–02, TC04, EC01–03
tests/api/.../test_fleet_health_dashboard_filters.py   # TC05–08, EC04, EC06–07
tests/api/.../test_fleet_health_vehicle_detail.py      # TC09–13, TC15–18
tests/e2e/.../test_fleet_health_dashboard.py           # TC03, TC11, TC14, TC19–21
```

**Implement order:** TC02 → TC04 → TC06 → TC10 → TC13 → TC18 → TC21 → rest.
