---
jira_key: ~
jira_type: Story
jira_sprint: "Sprint 10"
story_id: VP-02
title: Vehicle Part Installation Tracking
epic: Vehicle Parts Master Data
status: Pending
story_points: 5
assignee: ~
phase: Phase 2
related_stories:
  - VP-01-vehicle-part-catalog-master-data.md
  - VP-03-part-expiry-status-and-alerts.md
source_docs:
  - ../../../../05-modules/02-master-data/vehicle-part-catalog.md
module_spec: 05-modules/02-master-data/vehicle-part-catalog.md
---

# VP-02 — Vehicle Part Installation Tracking

## User Story

**As a** Transport Planner  
**I want to** record which parts are installed on a vehicle and when they were fitted  
**So that** the system can track when each part expires by date or mileage

## Acceptance Criteria

### AC-1: Model `VehiclePartInstallation`

- [ ] Fields: `vehicle_id` *, `part_type_id` *, `installed_date` *, `installed_odometer_km` (optional), `expiry_date` (optional), `expiry_odometer_km` (optional), `notes`, `status` (active / replaced / expired), `replaced_at`, audit fields.
- [ ] At most **one active installation** per `(vehicle, part_type)` — replacing closes previous row.

### AC-2: Install / replace workflow

- [ ] From Vehicle admin (inline or tab): **Install Part** — select part type, installed date, odometer (defaults to vehicle current odometer).
- [ ] Auto-calc: `expiry_date = installed_date + default_lifespan_days`; `expiry_odometer_km = installed_odometer + default_lifespan_km` from catalog.
- [ ] User may override expiry fields manually.
- [ ] **Replace Part** — marks old installation `replaced`, creates new active row.

### AC-3: Odometer source

- [ ] Default installed odometer from latest fuel entry or `Vehicle.current_odometer_reading`.

### AC-4: API

- [ ] `POST /api/v1/vehicles/{id}/part-installations/`
- [ ] `GET /api/v1/vehicles/{id}/part-installations/?status=active`

---

## Access & Permissions

| Action | Role |
|--------|------|
| Install / replace parts on vehicle | `transport_planner`, `tenant_admin` |
| View installations on vehicle admin | `transport_planner`, `tenant_admin`, `driver_supervisor` (read) |

**Permission codes (proposed):** `vehicle_part.installation.manage`

---

## Sub-tasks — Sprint 10

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| VP-02-1 | `VehiclePartInstallation` model | Install/replace on vehicle | High | Not started |
| VP-02-2 | Auto-expiry from catalog | Default lifespan days/km on install | High | Not started |

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| VP-01 | Upstream | Part catalog must exist |
| FM-03 / fuel entries | Upstream | Odometer default source |
| MDM-05 Vehicle | Upstream | Vehicle admin host UI |

---

## Definition of Done

- [ ] Installation model + admin UI on vehicle
- [ ] Replace semantics with single active row per part type
- [ ] Auto-expiry from catalog defaults

---

*Epic: Vehicle Parts Master Data | Phase: 2 | Sprint 10: 5 SP | Last Updated: 2026-09-01*
