---
module: 08-fleet-management
specification: Vehicle Health Snapshot (Read Model) — DEPRECATED
version: 1.0
status: superseded
superseded_by: ../11-reporting/vehicle-report.md
last_updated: 2026-09-01
---

# Vehicle Health Snapshot — Superseded

This spec has been **replaced** by [`vehicle-report.md`](../11-reporting/vehicle-report.md).

**Reason:** Fuel and health information no longer lives on Vehicle Planning. It is exposed under **Reports → Vehicle Report** (Sprint 10 stories VR-01 – VR-03).

- `VehiclePlanningSnapshot` → **`VehicleReportSummary` / `VehicleReportDetail`**
- `VehiclePlanningSnapshotService` → **`VehicleReportService`**
- API prefix `/api/v1/vehicles/planning-snapshot/` → **`/api/v1/reports/vehicles/`**

See the new spec for DTOs, menu structure, and stories.
