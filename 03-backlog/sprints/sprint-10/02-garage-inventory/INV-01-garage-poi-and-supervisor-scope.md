---
jira_key: ~
jira_type: Story
jira_sprint: "Sprint 10"
story_id: INV-01
title: Garage POI Type & Workshop Supervisor Scope
epic: Garage Inventory & Workshop
status: Pending
story_points: 3
assignee: ~
phase: Phase 2
design_ref: example-prototypes/fuel-management.html (Garage POI selector)
related_stories:
  - INV-02-inventory-item-master-catalog.md
  - INV-03-garage-stock-and-movements.md
  - MDM-POI (poi-management.md)
source_docs:
  - ../../../../05-modules/08-fleet-management/inventory-management.md
  - ../../../../05-modules/02-master-data/poi-management.md
module_spec: 05-modules/08-fleet-management/inventory-management.md
---

# INV-01 — Garage POI Type & Workshop Supervisor Scope

## User Story

**As a** Tenant Admin  
**I want to** register Garage POIs and assign Workshop Supervisors to specific garages  
**So that** each workshop location has its own inventory context and supervisors only manage their assigned garage(s)

## Business Context

Garage inventory is **per Garage POI**, not tenant-wide. Workshop Supervisors are a **distinct role** from Driver Supervisors (fuel). Scope follows the same pattern as gate operators assigned to specific POIs.

---

## Acceptance Criteria

### AC-1: Garage POI type

- [ ] Add `GARAGE` to `POIType` enum (or equivalent tenant config).
- [ ] Garage POIs use standard POI fields (code, name, address, geo, `is_active`).
- [ ] POI admin and API expose `poi_type = GARAGE` for filtering.

### AC-2: Workshop Supervisor role

- [ ] New role `workshop_supervisor` (or equivalent RBAC group).
- [ ] Distinct from `driver_supervisor` — no fuel entry or TR dispatch permissions by default.

### AC-3: Garage assignment

- [ ] Tenant Admin assigns one or more Garage POIs to each Workshop Supervisor user.
- [ ] Supervisor API queries and admin views **filter to assigned garages** only.
- [ ] Tenant Admin and Transport Planner see all garages.

### AC-4: API / admin

- [ ] `GET /api/v1/pois/?poi_type=garage` returns garage POIs for picker UIs.
- [ ] User admin: garage assignment field on Workshop Supervisor profile.

---

## API Endpoints

```
GET    /api/v1/pois/?poi_type=garage
PATCH  /api/v1/users/{id}/                    # garage_poi_ids assignment (or dedicated endpoint)
GET    /api/v1/users/me/garages/              # supervisor's assigned garages
```

---

## Access & Permissions

| Action | Role |
|--------|------|
| Create/edit Garage POI | `tenant_admin`, `transport_planner` |
| Assign supervisor to garage | `tenant_admin` |
| View assigned garages | `workshop_supervisor` |
| View all garages | `tenant_admin`, `transport_planner` |

**Permission codes (proposed):** `garage.poi.manage`, `garage.supervisor.assign`

---

## Sub-tasks — Sprint 10

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| INV-01-1 | `POIType.GARAGE` | Enum + migration + admin filter | High | Not started |
| INV-01-2 | `workshop_supervisor` role | RBAC group + permission seeds | High | Not started |
| INV-01-3 | Garage assignment | User ↔ Garage POI M2M + scope middleware | High | Not started |

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| POI master (US-014 / poi-management) | Upstream | POI model exists |
| Users / RBAC | Upstream | Role assignment pattern |
| INV-02, INV-03 | Downstream | Stock scoped to garage |

---

## Definition of Done

- [ ] Garage POI type creatable in admin
- [ ] Workshop Supervisor role seeded
- [ ] Garage assignment enforced on stock/workshop APIs
- [ ] Unit tests for scope filtering

---

*Epic: Garage Inventory & Workshop | Phase: 2 | Sprint 10: 3 SP | Last Updated: 2026-09-01*
