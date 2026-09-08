---
title: Sprint 10 — Fleet Operations + Vendor Rating System
sprint: Sprint 10
phase: Phase 2 — Fleet Operations & Vendor Intelligence
dates: TBD
status: Planning
carry_from: Sprint 9
total_story_points_estimated: "~74 SP (FM + FHI + VR + VRS)"
design_reference: example-prototypes/fleet-operations.html
---

# Sprint 10 — Fleet Operations + Vendor Rating System

| | |
|---|---|
| **Sprint Dates** | TBD |
| **Design reference** | [`example-prototypes/fleet-operations.html`](../../../../example-prototypes/fleet-operations.html) — **single unified view** (all menus visible; RBAC in production) |
| **Roles** | **Driver** (fuel mobile); **Driver Supervisor** (fuel, inspections); **Transport Planner / Tenant Admin** (masters + reports) |
| **Dependencies** | MDM-05 (Vehicle master), Driver assignment |
| **Vehicle Planning** | **Unchanged** — TO assignment only ([`vehicle-planning-view.md`](../../../05-modules/05-transport/vehicle-planning-view.md) v1) |
| **Out of phase** | **Garage inventory / workshop jobs** — deferred (not in current phase) |
| **Previous** | [Sprint 9](../sprint-9/README.md) |

---

## Sprint Goals

1. **Fuel** — Gauge-based entry (Driver Supervisor admin + Driver mobile); consumption, history, anomaly detection.
2. **Fleet Health Inspection** — Checklist templates per vehicle type; scheduled checkpoints; inspection rounds; due/overdue alerts.
3. **Vehicle Report** — Reports menu → fleet overview + detail (fuel, inspection, compliance).
4. **Vehicle Planning unchanged** — No fuel/health panels on planning screens.
5. **Vendor Rating System** — Bidirectional post-TO ratings: tenant rates vendor (3 criteria + Y/N questions); vendor rates tenant (mobile). Internal admin visibility; bid views wired up.

---

## Portal structure (prototype → production)

The prototype shows **one combined admin view** — all in-scope sections visible. Production enforces RBAC per role below.

```
Fleet Operations (admin portal)          Who uses it (production)
├── Fleet Inspection                     Driver Supervisor
├── Fuel — Log / History                 Driver Supervisor (admin); Driver → mobile app
└── Fleet Overview                       All report viewers → Reports → Vehicle Report (VR-02)

Reports
└── Vehicle Report                       Transport Planner, Driver Supervisor, Tenant Admin
```

### Role → activity matrix

| Role | Fleet Operations screens | Notes |
|------|--------------------------|-------|
| **Driver** | — (mobile only) | FM-02 fuel entry on Driver Mobile |
| **Driver Supervisor** | Fuel entry, Fuel history, Fleet Inspection, Fleet Overview | Pre-trip checks; may update odometer before fuel |
| **Transport Planner** | Checklist templates (master), Vehicle Report | Masters with Tenant Admin |
| **Tenant Admin** | All masters + all operations + reports | Full access |

> `fuel-management.html` redirects to `fleet-operations.html`.

---

## Epic Summary

| # | Epic | Key Stories | Est. SP | Status |
|---|------|-------------|---------|--------|
| 01 | Fuel Management | [FM-01](01-fuel-management/FM-01-fuel-entry-driver-supervisor-admin.md) – [FM-05](01-fuel-management/FM-05-fuel-anomaly-baselines.md) | ~21 | Planning |
| 02 | Vehicle Reports | [VR-01](02-vehicle-reports/VR-01-reports-menu-vehicle-report-navigation.md) – [VR-03](02-vehicle-reports/VR-03-vehicle-report-detail-view.md) | ~16 | Planning |
| 03 | Fleet Health Inspection | [FHI-01](03-fleet-health-inspection/FHI-01-inspection-checklist-templates.md) – [FHI-04](03-fleet-health-inspection/FHI-04-inspection-alerts-on-vehicle-report.md) | ~21 | Planning |
| 04 | Vendor Rating System | [VRS-01](04-vendor-ratings/VRS-01-post-to-vendor-rating-admin.md) – [VRS-03](04-vendor-ratings/VRS-03-vendor-rating-visibility-admin.md) | ~19 | Planning |

**Total estimated**: ~77 SP

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

### Epic 02: Vehicle Reports

| Sub-task | Story | Description | Priority |
|----------|-------|-------------|----------|
| VR-01-1 | VR-01 | Reports portal section + Vehicle Report submenu + RBAC | High |
| VR-01-2 | VR-01 | `MENU_VEHICLE_REPORT_VIEW` permission seed | High |
| VR-02-1 | VR-02 | `VehicleReportService.build_list()` aggregation | High |
| VR-02-2 | VR-02 | Fleet overview — fuel, distance, cost cards (prototype Fleet Overview) | High |
| VR-02-3 | VR-02 | `GET /api/v1/reports/vehicles/` | High |
| VR-03-1 | VR-03 | Vehicle detail — compliance, fuel, inspection sections | High |
| VR-03-2 | VR-03 | `GET /api/v1/reports/vehicles/{id}/` | High |

### Epic 03: Fleet Health Inspection

| Sub-task | Story | Description | Priority |
|----------|-------|-------------|----------|
| FHI-01-1 | FHI-01 | `InspectionCheckpointTemplate` per vehicle type | High |
| FHI-01-2 | FHI-01 | Template admin + seed checkpoints | High |
| FHI-02-1 | FHI-02 | `InspectionStatusService` — due soon / overdue | High |
| FHI-02-2 | FHI-02 | Inspection Dashboard UI + API | High |
| FHI-03-1 | FHI-03 | `InspectionRound` + checkpoint state update | High |
| FHI-03-2 | FHI-03 | Conduct Inspection UI (prototype) | High |
| FHI-04-1 | FHI-04 | Inspection counts on Vehicle Report (VR-02/VR-03) | High |

### Epic 04: Vendor Rating System

| Sub-task | Story | Description | Priority |
|----------|-------|-------------|----------|
| VRS-01-1 | VRS-01 | `VendorRating`, `VendorRatingCriterion`, `VendorRatingAnswer`, `RatingQuestion` models + migrations | High |
| VRS-01-2 | VRS-01 | Seed default Y/N questions for each criterion (Product Delivery, Driver Behaviour, Vehicle) | High |
| VRS-01-3 | VRS-01 | Admin rating form — 3-criterion panels, star selector, Y/N questions, comments, live avg | High |
| VRS-01-4 | VRS-01 | Average calculation + rolling `Vendor.rating` + `rating_count` update on submit | High |
| VRS-01-5 | VRS-01 | Submit + immutability + audit log (`VENDOR_RATING_SUBMITTED`) | High |
| VRS-01-6 | VRS-01 | TO completion rating prompt ("Rate Vendor" CTA on completed TO detail) | Medium |
| VRS-02-1 | VRS-02 | `TenantRating`, `TenantRatingCriterion`, `TenantRatingAnswer` models + `Tenant.vendor_rating` / `vendor_rating_count` fields | High |
| VRS-02-2 | VRS-02 | Seed tenant-direction Y/N questions for all 3 criteria (Payment & Commercial, Load Readiness, Communication & Support) | High |
| VRS-02-3 | VRS-02 | Vendor mobile rating screen — 3-criterion panels, star + Y/N questions + live avg + submit/confirm | High |
| VRS-02-4 | VRS-02 | Rolling `Tenant.vendor_rating` + `vendor_rating_count` update on submit | High |
| VRS-02-5 | VRS-02 | Submit + immutability — atomic persist, `is_submitted` flag, duplicate rejection | High |
| VRS-02-6 | VRS-02 | Tenant rating summary in Join Tenant flow (aggregate ★ + count + per-criterion on tenant card) | Medium |
| VRS-02-7 | VRS-02 | Admin portal — incoming vendor ratings list for tenant + summary card | Medium |
| VRS-03-1 | VRS-03 | Vendor profile — rating section (summary + per-criterion table + history list) | High |
| VRS-03-2 | VRS-03 | Bid list — rating column + sort; populate `vendor_rating_at_award` on award | High |
| VRS-03-3 | VRS-03 | Bid comparison — rating panel + "Highest Rating" highlight | Medium |
| VRS-03-4 | VRS-03 | Vendor admin list — min-rating filter + rating column + sort | Medium |
| VRS-03-5 | VRS-03 | TO detail — "Vendor Rated ★★★★" or "Rate this Vendor" CTA | Medium |

---

## Dependencies & Decisions

| # | Decision | Sprint 10 default |
|---|----------|-------------------|
| D1 | Backend app | `apps/vehicle_health/` (fuel, inspection; catalog in `master_data` as needed) |
| D2 | Fuel quantity override | Auto-calc `After − Before`; supervisor may override with audit note |
| D3 | Health/fuel visibility | **Reports → Vehicle Report** — NOT Vehicle Planning |
| D4 | Fuel period on vehicle report | Default 30 days; configurable query param |
| D5 | Who views Vehicle Report | Transport Planner, Driver Supervisor, Tenant Admin |
| D6 | Driver location fallback | GPS required; no manual location for drivers |
| D7 | Supervisor pre-trip | May update vehicle odometer before fuel entry |
| D8 | Inspection intervals | Per checkpoint template (`interval_days`: 7, 30, 365, etc.) |
| D9 | Inspection due soon | Within 2 days of `next_due` |
| D10 | Who conducts inspections | Driver Supervisor |
| D11 | Vendor rating — backend app | `apps/vendor_management/` or `apps/ratings/` (TBD) |
| D12 | Vendor rating — v1 criteria | 3 fixed criteria: Product Delivery, Driver Behaviour, Vehicle. Extensible model |
| D13 | Vendor rating — internal only v1 | Vendor does NOT see their own rating from tenants in v1 |
| D14 | Vendor rating — trigger | Post-TO `COMPLETED` state; one rating per TO per vendor |
| D15 | Vendor → tenant rating — v1 scope | **Full criteria** (Payment & Commercial, Load Readiness, Communication & Support) + Y/N questions + rolling avg — symmetric with VRS-01 |
| D16 | Min-rating bid gate | Referenced in bid spec but **not enforced in v1** — Phase 3+ |

---

## Out of Scope (Sprint 10)

| Item | Notes |
|------|-------|
| **Garage inventory / workshop jobs** | Deferred — not in current phase |
| Vehicle parts catalog / stock / installations | Deferred with inventory |
| Vehicle Planning UI changes | Stays TO-assignment only |
| PRD updates | Handled outside this sprint |
| Fuel budget tracking | Not in prototype |
| GPS-based mileage for fuel performance | Odometer-based only |
| Report export CSV/PDF | Later reporting sprint |
| Inspection push notifications | Visual alerts only |
| Driver mobile inspection | Admin portal only |
| **Auto-calculated vendor rating** | Requires completed-trip metrics (on-time %, POD quality, claims) — Phase 3 |
| **Configurable rating framework / weights** | Tenant Admin-defined criteria + weighting — Phase 3 |
| **Min-rating bid gate** | `min_vendor_rating` threshold enforcement on bid visibility — Phase 3+ |
| **Vendor sees own rating** | Internal only in v1; vendor-facing exposure deferred |
| Tenant-admin-defined custom criteria (vendor → tenant) | v1 criteria are fixed (3 seeded); configurable framework is Phase 3 |

---

## Reference Documents

| Spec | Path |
|------|------|
| Prototype | [`fleet-operations.html`](../../../../example-prototypes/fleet-operations.html) |
| Fuel Management | [`fuel-management.md`](../../../05-modules/08-fleet-management/fuel-management.md) |
| Fleet Health Inspection | [`fleet-health-inspection.md`](../../../05-modules/08-fleet-management/fleet-health-inspection.md) |
| Vehicle Report | [`vehicle-report.md`](../../../05-modules/11-reporting/vehicle-report.md) |
| Vehicle Planning v1 | [`vehicle-planning-view.md`](../../../05-modules/05-transport/vehicle-planning-view.md) |
| Driver Mobile (fuel) | [`driver-mobile.md`](../../../05-modules/09-mobile-apps/driver-mobile.md) |
| **Vendor Rating System** | [`vendor-rating.md`](../../../05-modules/07-vendor-management/vendor-rating.md) |
| Vendor Bidding (rating refs) | [`vendor-bidding.md`](../../../05-modules/07-vendor-management/vendor-bidding.md) |
| Vendor Mobile | [`vendor-mobile.md`](../../../05-modules/09-mobile-apps/vendor-mobile.md) |
| Story template | [VAPP-01](../sprint-6/03-vendor-app/VAPP-01-release-readiness-live-api.md) |

---

**Previous**: [Sprint 9](../sprint-9/README.md)

---

*Sprint 10 | Phase 2 | Last Updated: 2026-09-07*
