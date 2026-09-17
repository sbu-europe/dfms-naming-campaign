# Phase 2 stories (unscheduled)

Planning backlog for Phase 2. Stories here are **not** assigned to a sprint.
When a sprint picks one up, move it into `sprints/sprint-N/` and update that sprint's README.

**Total estimated:** 181 SP

---

## Feature index

| # | Feature | Stories | SP | Status |
|---|---------|---------|----|--------|
| 001 | [Odometer-based maintenance tracking](001-Odometer-Based%20Vehicle%20Maintenance%20Tracking/README.md) | FVM-01 | 8 | Planning |
| 002 | [Vehicle tracking & dashboard](002-Vehicle%20Tracking%20and%20Dashboard/README.md) | FVM-02 | 8 | Planning |
| 003 | [Vehicle utilization analysis](003-Vehicle%20Utilization%20Analysis/README.md) | FVM-03 | 5 | Planning |
| 004 | [Vehicle downtime management](004-Vehicle%20Downtime%20Management/README.md) | FVM-04 | 5 | Planning |
| 005 | [Fuel management](005-Fuel%20Management/README.md) | FM-01 – FM-05 | 26 | Planning |
| 006 | [Vehicle reports](006-Vehicle%20Reports/README.md) | VR-01 – VR-03 | 16 | Planning |
| 007 | [Fleet health inspection](007-Fleet%20Health%20Inspection/README.md) | FHI-01 – FHI-04 | 21 | Planning |
| 008 | [Vendor rating system](008-Vendor%20Rating%20System/README.md) | VRS-01 – VRS-03 | 19 | Planning |
| 009 | [Lab testing](009-Lab%20Testing/README.md) | MDM-05, QC-02 | 26 | Pending |
| 010 | [Multi-role tenant users](010-Multi-role%20Tenant%20Users/README.md) | TUM-06 | 13 | Pending |
| 011 | [Own-fleet vehicle plan (multi-TO)](011-Own-Fleet%20Vehicle%20Plan/README.md) | VP-01 | 21 | Pending |
| 012 | [TO dispatch planning calendar](012-TO%20Dispatch%20Planning%20Calendar%20View/README.md) | TO-03 | 13 | Pending |

---

## 001. Odometer-based maintenance tracking

Remaining km from **Driver Supervisor** meter readings (GPS is not odometer-capable). Idle vs movement uses GPS speed (&lt; 3 km/h = idle).

| Story | Title | SP | Status |
|-------|-------|----|--------|
| [FVM-01](001-Odometer-Based%20Vehicle%20Maintenance%20Tracking/FVM-01-odometer-based-vehicle-maintenance-tracking.md) | Odometer-Based Vehicle Maintenance Tracking | 8 | Planning |

PRD §6.5.10 · SOW P2 row 104

**Folder:** [001-Odometer-Based Vehicle Maintenance Tracking](001-Odometer-Based%20Vehicle%20Maintenance%20Tracking/README.md)

---

## 002. Vehicle tracking & dashboard

Planner fleet dashboard: five operational-status cards, filters, km / maintenance / fuel readouts.

| Story | Title | SP | Status |
|-------|-------|----|--------|
| [FVM-02](002-Vehicle%20Tracking%20and%20Dashboard/FVM-02-vehicle-tracking-and-dashboard.md) | Vehicle Tracking and Dashboard | 8 | Planning |

PRD §6.6.4 · SOW P2 row 99 · Does **not** require 001 for status cards.

Do not start Django until that story has a `05-modules/` write-up.

**Folder:** [002-Vehicle Tracking and Dashboard](002-Vehicle%20Tracking%20and%20Dashboard/README.md)

---

## 003. Vehicle utilization analysis

Serving hours from trips. Idle vs movement from GPS (stopped below 3 km/h). Downtime hours from **004** feed available-hours.

| Story | Title | SP | Status |
|-------|-------|----|--------|
| [FVM-03](003-Vehicle%20Utilization%20Analysis/FVM-03-vehicle-utilization-analysis.md) | Vehicle Utilization Analysis | 5 | Planning |

PRD §6.6.7 · SOW P2 row 100

**Folder:** [003-Vehicle Utilization Analysis](003-Vehicle%20Utilization%20Analysis/README.md)

---

## 004. Vehicle downtime management

Log downtime reason + start/end. Open downtime sets Under Maintenance; feeds **003** available-hours.

| Story | Title | SP | Status |
|-------|-------|----|--------|
| [FVM-04](004-Vehicle%20Downtime%20Management/FVM-04-vehicle-downtime-management.md) | Vehicle Downtime Management | 5 | Planning |

SOW P2 row 101

**Folder:** [004-Vehicle Downtime Management](004-Vehicle%20Downtime%20Management/README.md)

### Clocks for 001–004 (do not mix)

| Clock | Use for | Do not use for |
|---|---|---|
| Supervisor odometer (`Vehicle.current_odometer_reading`) | FVM-01 remaining km, daily km; FVM-02 km card | TO map path; GPS mileage |
| GPS speed &lt; 3 km/h (GPS movement status) | FVM-01 and FVM-03 idle vs movement | Remaining km; trip count |
| `Vehicle.operational_status` (now) | FVM-02 five-status cards | Period hours; GPS idle |
| TO Start Trip → finish | FVM-03 serving hours and trip count | FVM-02 cards; idle vs movement |
| `VehicleDowntime` `[start_at, end_at)` | FVM-04 log; FVM-03 available hours | FVM-01 remaining km |

**Delivery order:** FVM-02 cards and FVM-03 hours do not need FVM-01. FVM-04 downtime hours feed FVM-03 available-hours.

**FVM-01–04 estimated:** 26 SP.

---

## 005. Fuel management

Gauge-based fuel entry (Driver Supervisor admin + Driver mobile); consumption, history, anomaly detection. Own-fleet only.

| Story | Title | SP | Status |
|-------|-------|----|--------|
| [FM-01](005-Fuel%20Management/FM-01-fuel-entry-driver-supervisor-admin.md) | Fuel Entry — Driver Supervisor (Admin Portal) | 8 | Planning |
| [FM-02](005-Fuel%20Management/FM-02-fuel-entry-driver-mobile.md) | Fuel Entry — Driver (Mobile) | 5 | Planning |
| [FM-03](005-Fuel%20Management/FM-03-fuel-consumption-calculations.md) | Fuel Consumption Calculations & Odometer Validation | 5 | Planning |
| [FM-04](005-Fuel%20Management/FM-04-fuel-history-and-filters.md) | Fuel History & Filters | 3 | Planning |
| [FM-05](005-Fuel%20Management/FM-05-fuel-anomaly-baselines.md) | Fuel Efficiency Baselines & Anomaly Detection | 5 | Planning |

**Folder:** [005-Fuel Management](005-Fuel%20Management/README.md) · **Estimated:** 26 SP

---

## 006. Vehicle reports

Reports menu → Vehicle Report fleet overview + per-vehicle detail (fuel, inspection, compliance). Not on Vehicle Planning.

| Story | Title | SP | Status |
|-------|-------|----|--------|
| [VR-01](006-Vehicle%20Reports/VR-01-reports-menu-vehicle-report-navigation.md) | Reports Menu — Vehicle Report Navigation & RBAC | 3 | Planning |
| [VR-02](006-Vehicle%20Reports/VR-02-vehicle-report-fleet-overview.md) | Vehicle Report — Fleet Overview (Health Cards) | 8 | Planning |
| [VR-03](006-Vehicle%20Reports/VR-03-vehicle-report-detail-view.md) | Vehicle Report — Detail View (Fuel, Inspection, Compliance) | 5 | Planning |

**Folder:** [006-Vehicle Reports](006-Vehicle%20Reports/README.md) · **Estimated:** 16 SP

---

## 007. Fleet health inspection

Checklist templates per vehicle type; inspection rounds; due/overdue alerts; inspection counts on Vehicle Report.

| Story | Title | SP | Status |
|-------|-------|----|--------|
| [FHI-01](007-Fleet%20Health%20Inspection/FHI-01-inspection-checklist-templates.md) | Inspection Checklist Templates per Vehicle Type | 5 | Planning |
| [FHI-02](007-Fleet%20Health%20Inspection/FHI-02-inspection-dashboard-alerts.md) | Inspection Dashboard — Due & Overdue Alerts | 5 | Planning |
| [FHI-03](007-Fleet%20Health%20Inspection/FHI-03-conduct-inspection-round.md) | Conduct Inspection Round | 8 | Planning |
| [FHI-04](007-Fleet%20Health%20Inspection/FHI-04-inspection-alerts-on-vehicle-report.md) | Inspection Alerts on Vehicle Report | 3 | Planning |

**Folder:** [007-Fleet Health Inspection](007-Fleet%20Health%20Inspection/README.md) · **Estimated:** 21 SP

---

## 008. Vendor rating system

Bidirectional post-TO ratings: tenant rates vendor (admin); vendor rates tenant (mobile). Admin visibility + bid views.

| Story | Title | SP | Status |
|-------|-------|----|--------|
| [VRS-01](008-Vendor%20Rating%20System/VRS-01-post-to-vendor-rating-admin.md) | Post-TO Vendor Rating — Tenant Admin / TDO (Admin Portal) | 8 | Planning |
| [VRS-02](008-Vendor%20Rating%20System/VRS-02-vendor-rates-tenant-mobile.md) | Vendor Rates Tenant — Post-TO Structured Rating (Vendor Mobile App) | 8 | Planning |
| [VRS-03](008-Vendor%20Rating%20System/VRS-03-vendor-rating-visibility-admin.md) | Vendor Rating Visibility — Admin Portal (Profile + Bid Views) | 3 | Planning |

**Folder:** [008-Vendor Rating System](008-Vendor%20Rating%20System/README.md) · **Estimated:** 19 SP

---

## 009. Lab testing

Lab test master catalog + QA lab execution. Ship **MDM-05** before QC-02-4 (execution picks tests from the catalog).

Flow: [`lab-test-flow.md`](009-Lab%20Testing/lab-test-flow.md)

| Story | Title | SP | Status |
|-------|-------|----|--------|
| [MDM-05](009-Lab%20Testing/MDM-05-lab-test-master.md) | Lab Test Master — Category, Lab UOM, Test & Standard Value | 13 | Pending |
| [QC-02](009-Lab%20Testing/QC-02-lab-test-execution.md) | QA Lab Technician — Receive Sample, Run Tests, File Results | 13 | Pending |

**Folder:** [009-Lab Testing](009-Lab%20Testing/README.md) · **Estimated:** 26 SP

---

## 010. Multi-role tenant users

Assign multiple operational roles to one tenant user.

| Story | Title | SP | Status |
|-------|-------|----|--------|
| [TUM-06](010-Multi-role%20Tenant%20Users/TUM-06-multi-role-assignment.md) | Tenant User — Assign Multiple Operational Roles to One User | 13 | Pending |

**Folder:** [010-Multi-role Tenant Users](010-Multi-role%20Tenant%20Users/README.md) · **Estimated:** 13 SP

---

## 011. Own-fleet vehicle plan (multi-TO)

Multi-TO on one vehicle with vehicle-first yard planning.

| Story | Title | SP | Status |
|-------|-------|----|--------|
| [VP-01](011-Own-Fleet%20Vehicle%20Plan/VP-01-own-fleet-vehicle-plan-multi-to.md) | Own-Fleet Vehicle Plan — Multi-TO on One Vehicle with Vehicle-First Yard | 21 | Pending |

Vehicle Planning stays TO-assignment only for fleet ops features (005–007). Fuel/health live under **Reports → Vehicle Report** (006), not planning screens.

**Folder:** [011-Own-Fleet Vehicle Plan](011-Own-Fleet%20Vehicle%20Plan/README.md) · **Estimated:** 21 SP

---

## 012. TO dispatch planning (calendar view)

Read-only vehicle-lane calendar (daily 12-hour ticks / weekly / monthly): assigned TO bars from planned start to dest. arrival, idle gaps, KPI cards, drawer. Unassigned TOs count in stats but are omitted from the timeline. Does not replace Transport orders or Vehicle planning.

| Story | Title | SP | Status |
|-------|-------|----|--------|
| [TO-03](012-TO%20Dispatch%20Planning%20Calendar%20View/TO-03-to-dispatch-planning-calendar-view.md) | TO Dispatch Planning — Calendar View | 13 | Pending |

PRD § TO Dispatch Planning (Calendar View) · predecessor US-071 (archived)

**Folder:** [012-TO Dispatch Planning Calendar View](012-TO%20Dispatch%20Planning%20Calendar%20View/README.md) · **Estimated:** 13 SP

---

**Total estimated:** 26 (001–004) + 26 (005) + 16 (006) + 21 (007) + 19 (008) + 26 (009) + 13 (010) + 21 (011) + 13 (012) = **181 SP**
