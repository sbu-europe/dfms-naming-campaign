---
jira_key: ~
jira_type: Story
jira_sprint: "Sprint 10"
story_id: VP-01
title: Vehicle Part Catalog — Master Data
epic: Vehicle Parts Master Data
status: Pending
story_points: 5
assignee: ~
phase: Phase 2
related_stories:
  - VP-02-vehicle-part-installation-tracking.md
  - MDM-05-vehicle-master-data.md (Sprint 2)
source_docs:
  - ../../../../05-modules/02-master-data/vehicle-part-catalog.md
module_spec: 05-modules/02-master-data/vehicle-part-catalog.md
---

# VP-01 — Vehicle Part Catalog — Master Data

## User Story

**As a** Transport Planner or Tenant Admin  
**I want to** maintain a catalog of vehicle part types with default service intervals  
**So that** installed parts on vehicles can auto-calculate expiry dates and mileage limits

## Business Context

Vehicle **parts** (consumables/service items — engine oil, brake pads, filters) are separate from **compliance documents** (fitness, insurance on the `Vehicle` record). The catalog is tenant-scoped master data under **Master Data → Vehicle Parts**.

---

## Acceptance Criteria

### AC-1: Catalog model `VehiclePartType`

- [ ] Fields: `name` *, `category` (optional enum: Consumable, Safety, Electrical, Other), `default_lifespan_days` (optional), `default_lifespan_km` (optional), `is_active`, tenant FK.
- [ ] At least one of lifespan days or km should be set for useful defaults (soft warning in admin if both blank).

### AC-2: Admin CRUD

- [ ] Master Data menu: **Vehicle Parts** — list, add, edit, deactivate.
- [ ] RBAC: `transport_planner`, `tenant_admin`.
- [ ] Search by name; filter by category and active status.

### AC-3: Seed examples (optional migration)

- [ ] Suggested defaults: Engine Oil (180 days / 10,000 km), Air Filter (365 days / 20,000 km), Brake Pads Front (365 days / 30,000 km).

### AC-4: API

- [ ] `GET/POST /api/v1/vehicle-part-types/`
- [ ] `GET/PATCH /api/v1/vehicle-part-types/{id}/`

---

## Access & Permissions

| Action | Role |
|--------|------|
| CRUD vehicle part catalog | `transport_planner`, `tenant_admin` |
| View catalog (read-only) | `driver_supervisor` (for report context only) |

**Permission codes (proposed):** `vehicle_part.catalog.manage`

---

## Sub-tasks — Sprint 10

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| VP-01-1 | `VehiclePartType` model + admin | Master Data → Vehicle Parts | High | Not started |
| VP-01-2 | Default lifespan fields | days + km on catalog entries | High | Not started |

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| MDM-05 Vehicle | Downstream | Installations reference vehicles |
| Master data RBAC | Upstream | Tenant-scoped CRUD pattern |

---

## Definition of Done

- [ ] Model + migration + admin
- [ ] RBAC permissions seeded
- [ ] API CRUD with tenant isolation

---

*Epic: Vehicle Parts Master Data | Phase: 2 | Sprint 10: 5 SP | Last Updated: 2026-09-01*
