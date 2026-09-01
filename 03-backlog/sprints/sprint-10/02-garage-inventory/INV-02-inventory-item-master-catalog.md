---
jira_key: ~
jira_type: Story
jira_sprint: "Sprint 10"
story_id: INV-02
title: Inventory Item Master Catalog
epic: Garage Inventory & Workshop
status: Pending
story_points: 5
assignee: ~
phase: Phase 2
design_ref: example-prototypes/fleet-operations.html (inventory item dropdowns)
related_stories:
  - INV-01-garage-poi-and-supervisor-scope.md
  - INV-03-garage-stock-and-movements.md
  - WM-02-workshop-job-complete-and-part-installations.md
source_docs:
  - ../../../../05-modules/08-fleet-management/inventory-management.md
module_spec: 05-modules/08-fleet-management/inventory-management.md
---

# INV-02 — Inventory Item Master Catalog

## User Story

**As a** Transport Planner or Tenant Admin  
**I want to** maintain a catalog of inventory items (vehicle parts, machinery, consumables)  
**So that** garages can stock and issue the correct items during workshop jobs and track part expiry on vehicles

## Business Context

Replaces the deprecated `VehiclePartType` catalog. Items are **tenant-wide master data** — not tied to a single garage. Only `VEHICLE_PART` items generate `VehiclePartInstallation` records on workshop job completion.

---

## Acceptance Criteria

### AC-1: Model `InventoryItem`

- [ ] Fields: `sku_code` * (unique per tenant), `name` *, `item_type` * (`VEHICLE_PART` | `MACHINERY` | `CONSUMABLE` | `OTHER`), `unit_of_measure` *, `default_lifespan_days`, `default_lifespan_km`, `is_active`, tenant FK.
- [ ] Soft warning if `item_type = VEHICLE_PART` and both lifespan fields blank.

### AC-2: Admin CRUD

- [ ] Master Data → **Inventory Items** — list, add, edit, deactivate.
- [ ] Search by SKU/name; filter by `item_type` and active status.
- [ ] RBAC: `transport_planner`, `tenant_admin`.

### AC-3: Seed examples (optional migration)

- [ ] Engine Oil, Oil Filter, Brake Pads (Front) with lifespan defaults per module spec.

### AC-4: API

- [ ] `GET/POST /api/v1/inventory-items/`
- [ ] `GET/PATCH /api/v1/inventory-items/{id}/`
- [ ] Workshop Supervisor: read-only access for receive/issue pickers.

---

## API Endpoints

```
GET/POST   /api/v1/inventory-items/
GET/PATCH  /api/v1/inventory-items/{id}/

# Admin
GET/POST   /admin/master_data/inventoryitem/
```

---

## Access & Permissions

| Action | Role |
|--------|------|
| CRUD inventory catalog | `transport_planner`, `tenant_admin` |
| View catalog (read-only) | `workshop_supervisor`, `driver_supervisor` |

**Permission codes (proposed):** `inventory.item.manage`, `inventory.item.view`

---

## Sub-tasks — Sprint 10

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| INV-02-1 | `InventoryItem` model + admin | Master Data → Inventory Items | High | Not started |
| INV-02-2 | Item types + UOM | `item_type` enum, unit_of_measure field | High | Not started |
| INV-02-3 | Lifespan defaults | days + km for `VEHICLE_PART` expiry on job complete | High | Not started |

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| INV-01 | Parallel | Garage POI for stock rows |
| WM-02 | Downstream | Installations reference `inventory_item_id` |
| Master data RBAC | Upstream | Tenant-scoped CRUD pattern |

---

## Definition of Done

- [ ] Model + migration + admin
- [ ] API CRUD with tenant isolation
- [ ] RBAC permissions seeded
- [ ] Replaces deprecated VP-01 scope

---

*Epic: Garage Inventory & Workshop | Phase: 2 | Sprint 10: 5 SP | Last Updated: 2026-09-01*
