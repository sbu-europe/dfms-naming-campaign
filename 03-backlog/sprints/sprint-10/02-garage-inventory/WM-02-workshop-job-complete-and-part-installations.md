---
jira_key: ~
jira_type: Story
jira_sprint: "Sprint 10"
story_id: WM-02
title: Workshop Job Complete — Vehicle Status & Part Installations
epic: Garage Inventory & Workshop
status: Pending
story_points: 5
assignee: ~
phase: Phase 2
design_ref: example-prototypes/fleet-operations.html (Complete job + completion rules)
related_stories:
  - WM-01-workshop-job-with-parts-issuance.md
  - VR-03-vehicle-report-detail-view.md
source_docs:
  - ../../../../05-modules/08-fleet-management/inventory-management.md
module_spec: 05-modules/08-fleet-management/inventory-management.md
---

# WM-02 — Workshop Job Complete — Vehicle Status & Part Installations

## User Story

**As a** Workshop Supervisor  
**I want to** complete a workshop job and have the system restore the vehicle to service and record part installations for expiry tracking  
**So that** replaced vehicle parts appear on the Vehicle Report with correct expiry dates

## Business Context

Part installations are **not** entered manually in Sprint 10 — they are created when a workshop job completes, from issued `VEHICLE_PART` lines. Expiry status feeds Vehicle Report (VR-02, VR-03).

---

## Acceptance Criteria

### AC-1: Complete job

- [ ] `actual_end` required to mark job `COMPLETED`.
- [ ] `PATCH /api/v1/workshop-jobs/{id}/complete/` or equivalent admin action.
- [ ] Vehicle `operational_status` → `no_active_to` (available for assignment).

### AC-2: Vehicle part installations

- [ ] On complete, for each part line where `item_type = VEHICLE_PART`:
  - Create `VehiclePartInstallation` linked to `workshop_job_id` and `inventory_item_id`.
  - Mark previous ACTIVE installation for same `(vehicle, item)` as `REPLACED`.
- [ ] Auto-calc `expiry_date` and `expiry_odometer_km` from `InventoryItem` defaults + completion date/vehicle odometer.
- [ ] `MACHINERY` / `CONSUMABLE` lines do not create installations.

### AC-3: Part expiry status

- [ ] `PartExpiryService.status(installation, current_odometer)` → `valid` | `expiring_soon` | `expired`.
- [ ] Thresholds: ≤ 30 days or ≤ 500 km = expiring soon; expired if date or km breached.
- [ ] Exposed on `GET /api/v1/vehicles/{id}/part-installations/` as computed field.

### AC-4: Maintenance timeline

- [ ] Completed jobs appear on Maintenance Timeline with parts issued summary.
- [ ] Fuel entries and workshop events in unified per-vehicle timeline (prototype).

### AC-5: Validation

- [ ] Cannot complete job already `COMPLETED` or `CANCELLED`.
- [ ] Cost summary (outsourced + misc) or at least one part line required before complete.

---

## API Endpoints

```
PATCH  /api/v1/workshop-jobs/{id}/complete/
GET    /api/v1/vehicles/{id}/part-installations/
GET    /api/v1/workshop-jobs/{id}/timeline/          # optional — or client-side merge
```

---

## Access & Permissions

| Action | Role |
|--------|------|
| Complete workshop job | `workshop_supervisor` (assigned garage) |
| View part installations | `transport_planner`, `tenant_admin`, `driver_supervisor` (read) |

**Permission codes (proposed):** `workshop.job.manage`, `vehicle.part.view`

---

## Sub-tasks — Sprint 10

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| WM-02-1 | Complete job service | Status transition + vehicle restore | High | Not started |
| WM-02-2 | `VehiclePartInstallation` on complete | From `VEHICLE_PART` job lines | High | Not started |
| WM-02-3 | `PartExpiryService` | valid / expiring soon / expired | High | Not started |
| WM-02-4 | Maintenance timeline | Workshop events in timeline view | Medium | Not started |

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| WM-01 | Upstream | Active jobs with part lines |
| INV-02 | Upstream | Item lifespan defaults |
| VR-02, VR-03 | Downstream | Parts expiry on Vehicle Report |

---

## Definition of Done

- [ ] Complete job restores vehicle and creates installations
- [ ] Expiry service unit tested
- [ ] Vehicle Report can aggregate parts status
- [ ] Replaces deprecated VP-02 and VP-03 scope

---

*Epic: Garage Inventory & Workshop | Phase: 2 | Sprint 10: 5 SP | Last Updated: 2026-09-01*
