---
jira_key: ~
jira_type: Story
jira_sprint: ~
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
tdd_test_cases: ../../../../09-testing/stories-phase-2/007-Fleet Health Inspection/FHI-01-inspection-checklist-templates-tdd-test-cases.md
tdd_index: ../../../../09-testing/stories-phase-2/007-Fleet Health Inspection/00-all-test-cases.md
---

# FHI-01 — Inspection Checklist Templates per Vehicle Type

## Test cases

Gherkin / TDD scenarios live under `09-testing` (not inline in this story).

| Navigate | Link |
|----------|------|
| **FHI-01 TDD catalog** (`AC-N.x` mapped) | [FHI-01-inspection-checklist-templates-tdd-test-cases.md](../../../../09-testing/stories-phase-2/007-Fleet%20Health%20Inspection/FHI-01-inspection-checklist-templates-tdd-test-cases.md) |
| **Fleet Health Inspection TDD index** (all stories) | [00-all-test-cases.md](../../../../09-testing/stories-phase-2/007-Fleet%20Health%20Inspection/00-all-test-cases.md) |
| **Feature TDD folder** | [README](../../../../09-testing/stories-phase-2/007-Fleet%20Health%20Inspection/README.md) |

Write failing tests from the catalog **before** implementation.


## User Story

**As a** Transport Planner, Tenant Super Admin, or Tenant Admin  
**I want to** define inspection checkpoints and recurrence intervals per vehicle type  
**So that** each vehicle in the fleet is checked on the correct schedule for engine, fuel, safety, and accessories

## Business Context

Templates are tenant master data — not per vehicle. When a vehicle is inspected, the system loads the template for its `vehicle_type` (light truck, medium truck, etc.).

---

## Acceptance Criteria

> **Test scenarios:** see [FHI-01 TDD catalog](../../../../09-testing/stories-phase-2/007-Fleet%20Health%20Inspection/FHI-01-inspection-checklist-templates-tdd-test-cases.md) · [Fleet Health Inspection index](../../../../09-testing/stories-phase-2/007-Fleet%20Health%20Inspection/00-all-test-cases.md)

### AC-1: Model `InspectionCheckpointTemplate`

Given a tenant maintains inspection master data,

when an `InspectionCheckpointTemplate` is created or updated,

then required fields, categories, and positive `interval_days` are enforced as tenant-scoped master data by `vehicle_type` (not per vehicle).

- [ ] Fields: `vehicle_type` *, `category` *, `name` *, `description`, `interval_days` * (positive integer), `sort_order`, `is_active`, tenant FK.
- [ ] Categories: Engine, Fuel, Safety, Electrical, Body, Accessories (configurable enum).

### AC-2: Admin CRUD

Given Transport Planner, Tenant Super Admin, or Tenant Admin opens Checklist Templates,

when they filter, create, update, or reorder checkpoints for a vehicle type,

then the admin UI under Master Data or Fleet Operations supports CRUD with write RBAC limited to `transport_planner`, `tenant_super_admin`, and `tenant_admin`.

- [ ] **Checklist Templates** under Master Data or Fleet Operations.
- [ ] Filter by vehicle type; reorder checkpoints within type.
- [ ] RBAC: `transport_planner`, `tenant_super_admin`, `tenant_admin`.

### AC-3: Seed examples

Given a new tenant (or seed command) needs default checklists,

when seed data is applied,

then light truck and medium truck example checkpoints match the module spec intervals.

- [ ] Light truck: engine oil (7d), coolant (7d), fuel lines (30d), brakes (30d), tyres (7d), lights (30d), fire extinguisher (365d).
- [ ] Medium truck: variant set per module spec.

### AC-4: API

Given clients manage templates via API,

when they call inspection-checkpoints endpoints with optional `vehicle_type` filter,

then list/create and retrieve/update work with tenant isolation and RBAC.

- [ ] `GET/POST /api/v1/inspection-checkpoints/?vehicle_type=`
- [ ] `GET/PATCH /api/v1/inspection-checkpoints/{id}/`

---

## Edge Cases

### Validation
- `interval_days` missing, zero, or decimal → reject.
- Duplicate name within same tenant + vehicle_type + category: soft-warn vs unique — follow module/API conventions; do not invent hard uniqueness unless module requires it.
- Deactivating (`is_active=false`) a template that vehicles already use: rounds/dashboard should ignore inactive templates going forward (existing historical rounds remain).

### RBAC & tenancy
- Unauthorized role (e.g. plain driver) → no manage, no silent create.
- Driver Supervisor view-only; write reserved for `transport_planner`, `tenant_super_admin`, `tenant_admin`.

### Ordering
- Reorder only within the same `vehicle_type`; cross-type sort_order collisions are allowed and must not break filters.

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
| CRUD templates | `transport_planner`, `tenant_super_admin`, `tenant_admin` |
| View templates (read-only) | `driver_supervisor` |

**Permission codes (proposed):** `inspection.template.manage`, `inspection.template.view`

---

## Sub-tasks

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| FHI-01-1 | `InspectionCheckpointTemplate` model | Per vehicle type + interval | High | Not started |
| FHI-01-2 | Template admin UI | CRUD + filter by vehicle type | High | Not started |
| FHI-01-3 | Seed data | Light/medium truck default checkpoints | Medium | Not started |
| FHI-01-4 | Tests | Unit/API tests for AC-1…AC-4 + Edge Cases — [TDD catalog](../../../../09-testing/stories-phase-2/007-Fleet%20Health%20Inspection/FHI-01-inspection-checklist-templates-tdd-test-cases.md) | High | Not started |

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
- [ ] Scenarios AC-1.1…AC-4.3 covered — see [FHI-01 TDD catalog](../../../../09-testing/stories-phase-2/007-Fleet%20Health%20Inspection/FHI-01-inspection-checklist-templates-tdd-test-cases.md)
- [ ] TDD catalog statuses updated for P0 rows (`Planned` → `Failing` → `Passing`)

---

*Epic: Fleet Health Inspection | Phase: 2 (unscheduled) | 5 SP | Last Updated: 2026-09-14*
