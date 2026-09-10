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

## Fleet analytics (001–004)

Each story is a folder: story file (AC / sub-tasks / DoD) plus companion `US-*.md` spec.
Do not start Django until that story has a `05-modules/` write-up.

| Story | Title | SP | Status |
|-------|-------|----|--------|
| [001](001-Odometer-Based%20Vehicle%20Maintenance%20Tracking/README.md) | Odometer-Based Vehicle Maintenance Tracking | 8 | Planning |
| [002](002-Vehicle%20Tracking%20and%20Dashboard/README.md) | Vehicle Tracking and Dashboard | 8 | Planning |
| [003](003-Vehicle%20Utilization%20Analysis/README.md) | Vehicle Utilization Analysis | 5 | Planning |
| [004](004-Vehicle%20Downtime%20Management/README.md) | Vehicle Downtime Management | 5 | Planning |

**001–004 estimated**: 26 SP. Later (unwritten): fuel analytics, operational reports + CSV/Excel, map KPI layer.

### Clocks (do not mix)

Nourish GPS trackers are **not** odometer-capable. Remaining km uses Driver Supervisor meter readings.

| Clock | Use for | Do not use for |
|---|---|---|
| Supervisor odometer (`Vehicle.current_odometer_reading`) | 001 remaining km, daily km; 002 km card | TO map path; GPS mileage |
| GPS speed &lt; 3 km/h | 001 idle vs movement | Remaining km; utilization hours |
| `Vehicle.operational_status` (now) | 002 five-status cards | Period hours; GPS idle |
| TO Start Trip → terminal | 003 serving vs No-TO hours | 002 cards |
| `VehicleDowntime` `[start_at, end_at)` | 004 log; 003 available hours | 001 remaining km |

### PRD / SOW

| PRD | User story | Story | SOW |
|-----|------------|-------|-----|
| §6.5.10 | GPS-based maintenance (delivered as odometer meter entry) | [001](001-Odometer-Based%20Vehicle%20Maintenance%20Tracking/001-Odometer-Based%20Vehicle%20Maintenance%20Tracking.md) | P2 row 104 |
| §6.6.4 | Dashboard showing vehicle availability | [002](002-Vehicle%20Tracking%20and%20Dashboard/002-Vehicle%20Tracking%20and%20Dashboard.md) | P2 row 99 |
| §6.6.7 | Analyze vehicle utilization | [003](003-Vehicle%20Utilization%20Analysis/003-Vehicle%20Utilization%20Analysis.md) | P2 row 100 |
| Vehicle Downtime Management | Track vehicle downtime | [004](004-Vehicle%20Downtime%20Management/004-Vehicle%20Downtime%20Management.md) | P2 row 101 |

**Delivery order:** 002 cards and 003 hours do not need 001. 004 downtime hours feed 003 available-hours.

---

**Total estimated (this folder)**: 60 SP (TUM/VP/MDM/QC) + 26 SP (001–004) = **86 SP**
