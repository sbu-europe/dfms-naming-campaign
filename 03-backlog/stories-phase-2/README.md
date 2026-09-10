# Phase 2 stories (unscheduled)

Planning backlog for Phase 2 scope. These stories are **not** assigned to a sprint.
When a sprint picks one up, move it into `sprints/sprint-N/` and update that sprint's README.

## Tenant / QC / vehicle plan

| Story | Title | SP | Status |
|-------|-------|----|--------|
| [TUM-06](TUM-06-multi-role-assignment.md) | Tenant User — Assign Multiple Operational Roles to One User | 13 | Pending |
| [VP-01](VP-01-own-fleet-vehicle-plan-multi-to.md) | Own-Fleet Vehicle Plan — Multi-TO on One Vehicle with Vehicle-First Yard | 21 | Pending |
| [MDM-05](MDM-05-lab-test-master.md) | Lab Test Master — Category, Lab UOM, Test & Standard Value | 13 | Pending |
| [QC-02](QC-02-lab-test-execution.md) | QA Lab Technician — Receive Sample, Run Tests, File Results | 13 | Pending |

MDM-05 should ship before QC-02-4 (lab execution picks tests from the catalog).

Team flow diagrams: [`lab-test-flow.md`](lab-test-flow.md) (MDM-05 + QC-02).

## Fleet & vehicle management (FVM)

| Story | Title | SP | Status |
|-------|-------|----|--------|
| [FVM-01](FVM-01-odometer-based-vehicle-maintenance-tracking.md) | Odometer-Based Vehicle Maintenance Tracking | 8 | Planning |
| [FVM-02](FVM-02-vehicle-tracking-and-dashboard.md) | Vehicle Tracking and Dashboard | 8 | Planning |
| [FVM-03](FVM-03-vehicle-utilization-analysis.md) | Vehicle Utilization Analysis | 5 | Planning |
| [FVM-04](FVM-04-vehicle-downtime-management.md) | Vehicle Downtime Management | 5 | Planning |

**FVM-01–04 estimated**: 26 SP.

Do not start Django until that story has a `05-modules/` write-up.

### Clocks (do not mix)

Nourish GPS trackers are **not** odometer-capable. Remaining km uses Driver Supervisor meter readings.

| Clock | Use for | Do not use for |
|---|---|---|
| Supervisor odometer (`Vehicle.current_odometer_reading`) | FVM-01 remaining km, daily km; FVM-02 km card | TO map path; GPS mileage |
| GPS speed &lt; 3 km/h | FVM-01 idle vs movement | Remaining km; utilization hours |
| `Vehicle.operational_status` (now) | FVM-02 five-status cards | Period hours; GPS idle |
| TO Start Trip → terminal | FVM-03 serving vs No-TO hours | FVM-02 cards |
| `VehicleDowntime` `[start_at, end_at)` | FVM-04 log; FVM-03 available hours | FVM-01 remaining km |

**Delivery order:** FVM-02 cards and FVM-03 hours do not need FVM-01. FVM-04 downtime hours feed FVM-03 available-hours.

---

**Total estimated (this folder)**: 60 SP (TUM/VP/MDM/QC) + 26 SP (FVM) = **86 SP**
