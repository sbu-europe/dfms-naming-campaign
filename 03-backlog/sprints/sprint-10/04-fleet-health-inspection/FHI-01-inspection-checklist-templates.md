---
jira_key: ~
jira_type: Story
jira_sprint: "Sprint 10"
story_id: FHI-01
title: Inspection Checklist Templates per Vehicle Type
epic: Fleet Health Inspection
status: Pending
story_points: 5
assignee: ~
phase: Phase 2
design_ref: example-prototypes/fleet-operations.html (Checklist Templates tab)
related_stories:
  - FHI-02-inspection-dashboard-alerts.md
  - FHI-03-conduct-inspection-round.md
source_docs:
  - ../../../../05-modules/08-fleet-management/fleet-health-inspection.md
  - ../../../../example-prototypes/fleet-operations.html
module_spec: 05-modules/08-fleet-management/fleet-health-inspection.md
---

# FHI-01 — Inspection Checklist Templates per Vehicle Type

## User Story

**As a** Transport Planner or Tenant Admin  
**I want to** define inspection checkpoints and recurrence intervals per vehicle type  
**So that** each vehicle in the fleet is checked on the correct schedule for engine, fuel, safety, and accessories

## Business Context

Templates are tenant master data — not per vehicle. When a vehicle is inspected, the system loads the template for its `vehicle_type` (light truck, medium truck, etc.).

---

## Acceptance Criteria

### AC-1: Model `InspectionCheckpointTemplate`

- [ ] Fields: `vehicle_type` *, `category` *, `name` *, `description`, `interval_days` * (positive integer), `sort_order`, `is_active`, tenant FK.
- [ ] Categories: Engine, Fuel, Safety, Electrical, Body, Accessories (configurable enum).

### AC-2: Admin CRUD

- [ ] **Checklist Templates** under Master Data or Fleet Operations.
- [ ] Filter by vehicle type; reorder checkpoints within type.
- [ ] RBAC: `transport_planner`, `tenant_admin`.

### AC-3: Seed examples

- [ ] Light truck: engine oil (7d), coolant (7d), fuel lines (30d), brakes (30d), tyres (7d), lights (30d), fire extinguisher (365d).
- [ ] Medium truck: variant set per module spec.

### AC-4: API

- [ ] `GET/POST /api/v1/inspection-checkpoints/?vehicle_type=`
- [ ] `GET/PATCH /api/v1/inspection-checkpoints/{id}/`

---

## API Endpoints

```
GET/POST   /api/v1/inspection-checkpoints/
GET/PATCH  /api/v1/inspection-checkpoints/{id}/
```

---

## Access & Permissions

| Action | Role |
|--------|------|
| CRUD templates | `transport_planner`, `tenant_admin` |
| View templates (read-only) | `driver_supervisor` |

**Permission codes (proposed):** `inspection.template.manage`, `inspection.template.view`

---

## Sub-tasks — Sprint 10

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| FHI-01-1 | `InspectionCheckpointTemplate` model | Per vehicle type + interval | High | Not started |
| FHI-01-2 | Template admin UI | CRUD + filter by vehicle type | High | Not started |
| FHI-01-3 | Seed data | Light/medium truck default checkpoints | Medium | Not started |

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| MDM-05 Vehicle | Upstream | `vehicle_type` enum |
| FHI-02, FHI-03 | Downstream | Templates drive dashboard and rounds |

---

## Definition of Done

- [ ] Templates creatable per vehicle type with interval_days
- [ ] API + admin with tenant isolation
- [ ] Matches prototype Checklist Templates tab

---

*Epic: Fleet Health Inspection | Phase: 2 | Sprint 10: 5 SP | Last Updated: 2026-09-01*
