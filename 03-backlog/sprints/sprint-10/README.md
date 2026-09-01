---
title: Sprint 10 — Fuel Tracking, Vehicle Parts & Vehicle Reports
sprint: Sprint 10
phase: Phase 2 (Fuel) + Master Data (Parts) + Reporting (Vehicle Report)
dates: TBD
status: Planning
carry_from: Sprint 9
total_story_points_estimated: "~55 SP (FM-01–05 + VP-01–03 + VR-01–03)"
design_reference: example-prototypes/fuel-management.html
---

# Sprint 10 — Fuel Tracking, Vehicle Parts & Vehicle Reports

| | |
|---|---|
| **Sprint Dates** | TBD |
| **Design reference** | [`example-prototypes/fuel-management.html`](../../../../example-prototypes/fuel-management.html) — Fuel tabs + Fleet Dashboard (Reports → Vehicle Report only) |
| **Roles** | **Driver**, **Driver Supervisor** (fuel); **Transport Planner**, **Tenant Admin** (parts + reports); **Driver Supervisor** (reports) |
| **Dependencies** | MDM-05 (Vehicle master), Driver assignment |
| **Vehicle Planning** | **Unchanged** — TO assignment only ([`vehicle-planning-view.md`](../../../05-modules/05-transport/vehicle-planning-view.md) v1) |
| **Previous** | [Sprint 9](../sprint-9/README.md) |

---

## Sprint Goals

1. **Deliver gauge-based fuel entry** — Driver Supervisor (admin, pre-trip, manual date/location) + Driver mobile (auto vehicle, datetime, GPS, fuel type).
2. **Deliver vehicle parts master data** — Part catalog + per-vehicle installations with date/mileage expiry tracking.
3. **Deliver Vehicle Report** — New **Reports** menu section with **Vehicle Report** submenu; fleet overview + detail for fuel, parts, compliance (prototype Fleet Dashboard).
4. **Keep Vehicle Planning separate** — No fuel/health panels on planning screens.

---

## Epic Summary

| # | Epic | Key Stories | Est. SP | Status |
|---|------|-------------|---------|--------|
| 01 | Fuel Management | [FM-01](01-fuel-management/FM-01-fuel-entry-driver-supervisor-admin.md) – [FM-05](01-fuel-management/FM-05-fuel-anomaly-baselines.md) | ~21 | Planning |
| 02 | Vehicle Parts Master Data | [VP-01](02-vehicle-parts/VP-01-vehicle-part-catalog-master-data.md) – [VP-03](02-vehicle-parts/VP-03-part-expiry-status-and-alerts.md) | ~13 | Planning |
| 03 | Vehicle Reports | [VR-01](03-vehicle-reports/VR-01-reports-menu-vehicle-report-navigation.md) – [VR-03](03-vehicle-reports/VR-03-vehicle-report-detail-view.md) | ~16 | Planning |

**Total estimated**: ~55 SP

---

## Sprint 10 Scope — Sub-task Index

### Epic 01: Fuel Management

| Sub-task | Story | Description | Priority |
|----------|-------|-------------|----------|
| FM-01-1 | FM-01 | `FuelEntry` model — gauge fields, `location_source`, `refueling_datetime`, GPS coords | High |
| FM-01-2 | FM-01 | Admin form — vehicle picker, vehicle context panel, optional vehicle odometer update | High |
| FM-01-3 | FM-01 | Supervisor manual refueling date + location; all fuel intake fields | High |
| FM-01-4 | FM-01 | Photo upload — gauge before/after (required), receipt + odometer (supporting) | High |
| FM-01-5 | FM-01 | Live calculation preview panel on admin form | High |
| FM-02-1 | FM-02 | Driver mobile — assigned vehicle + fuel type auto (read-only) | High |
| FM-02-2 | FM-02 | Auto refueling datetime + device GPS location on submit | High |
| FM-02-3 | FM-02 | Offline queue + sync (preserve timestamp + GPS at queue time) | Medium |
| FM-03-1 | FM-03 | Distance since last fill, km/L, ৳/km, ৳/L calculations | High |
| FM-03-2 | FM-03 | Odometer validation (> last reading); first entry km/L = N/A | High |
| FM-04-1 | FM-04 | Fuel history list — filter by vehicle, stats strip, anomaly column | High |
| FM-05-1 | FM-05 | Vehicle-type fuel efficiency baselines + 20% anomaly flag | High |
| FM-05-2 | FM-05 | Own-fleet-only enforcement on fuel entry | High |

### Epic 02: Vehicle Parts Master Data

| Sub-task | Story | Description | Priority |
|----------|-------|-------------|----------|
| VP-01-1 | VP-01 | `VehiclePartType` catalog model + admin CRUD under Master Data | High |
| VP-01-2 | VP-01 | Default lifespan (days / km) on catalog entries | High |
| VP-02-1 | VP-02 | `VehiclePartInstallation` model — install/replace on vehicle | High |
| VP-02-2 | VP-02 | Auto-calc expiry from catalog defaults on install | High |
| VP-03-1 | VP-03 | Expiry status computation — valid / expiring soon / expired | High |
| VP-03-2 | VP-03 | Vehicle admin parts panel + list filters | Medium |

### Epic 03: Vehicle Reports

| Sub-task | Story | Description | Priority |
|----------|-------|-------------|----------|
| VR-01-1 | VR-01 | Reports portal section + Vehicle Report submenu + RBAC | High |
| VR-01-2 | VR-01 | `MENU_VEHICLE_REPORT_VIEW` permission seed | High |
| VR-02-1 | VR-02 | `VehicleReportService.build_list()` aggregation | High |
| VR-02-2 | VR-02 | Fleet overview — stats strip + health cards (prototype Fleet Dashboard) | High |
| VR-02-3 | VR-02 | `GET /api/v1/reports/vehicles/` | High |
| VR-03-1 | VR-03 | Vehicle detail — compliance, fuel, parts sections | High |
| VR-03-2 | VR-03 | `GET /api/v1/reports/vehicles/{id}/` | High |

---

## Dependencies & Decisions

| # | Decision | Sprint 10 default |
|---|----------|-------------------|
| D1 | Backend app for fuel + parts + report aggregation | `apps/vehicle_health/` (catalog in `master_data`) |
| D2 | Fuel quantity override | Auto-calc `After − Before`; supervisor may override with audit note |
| D3 | Parts expiry thresholds | Expiring soon: ≤ 30 days **or** ≤ 500 km |
| D4 | Health/fuel visibility location | **Reports → Vehicle Report** — NOT Vehicle Planning |
| D5 | Fuel period on vehicle report | Default 30 days; configurable query param |
| D6 | Who installs parts | Transport Planner + Tenant Admin |
| D7 | Who views Vehicle Report | Transport Planner, Driver Supervisor, Tenant Admin |
| D8 | Driver location fallback | GPS required; no manual location for drivers |
| D9 | Supervisor pre-trip | May update vehicle odometer before fuel entry |

---

## Out of Scope (Sprint 10)

| Item | Notes |
|------|-------|
| Vehicle Planning UI changes | Stays TO-assignment only |
| Workshop maintenance / maintenance timeline | Deferred |
| PRD updates | Handled outside this sprint |
| Fuel budget tracking | Not in prototype |
| GPS-based mileage for fuel performance | Odometer-based only |
| Report export CSV/PDF | Later reporting sprint |

---

## Reference Documents

- [Story file template](./STORY-TEMPLATE.md) — per-story structure (matches Sprint 6 `VAPP-01` pattern)
- [Fuel Management spec](../../../05-modules/08-fleet-management/fuel-management.md)
- [Vehicle Part Catalog spec](../../../05-modules/02-master-data/vehicle-part-catalog.md)
- [Vehicle Report spec](../../../05-modules/11-reporting/vehicle-report.md)
- [Vehicle Planning View v1 (unchanged)](../../../05-modules/05-transport/vehicle-planning-view.md)
- [Driver Mobile — fuel logging](../../../05-modules/09-mobile-apps/driver-mobile.md)
- [Prototype — fuel-management.html](../../../../example-prototypes/fuel-management.html)

---

**Previous**: [Sprint 9](../sprint-9/README.md)
