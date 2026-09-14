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
  - ../../../05-modules/08-fleet-management/fleet-health-inspection.md
  - ../../../example-prototypes/fleet-operations.html
module_spec: 05-modules/08-fleet-management/fleet-health-inspection.md
tdd_test_cases: ../../../09-testing/stories-phase-2/007-Fleet Health Inspection/FHI-01-inspection-checklist-templates-tdd-test-cases.md
tdd_index: ../../../09-testing/stories-phase-2/007-Fleet Health Inspection/00-all-test-cases.md
---

# FHI-01 — Inspection Checklist Templates per Vehicle Type

## TDD Test Cases

| Link | What |
|------|------|
| [FHI-01 TDD catalog](../../../09-testing/stories-phase-2/007-Fleet%20Health%20Inspection/FHI-01-inspection-checklist-templates-tdd-test-cases.md) | `FHI-01-TC01`… + edge cases (**model/API-first**) |
| [Fleet Health Inspection TDD index](../../../09-testing/stories-phase-2/007-Fleet%20Health%20Inspection/00-all-test-cases.md) | All FHI-01…FHI-04 test cases |
| [Feature TDD folder](../../../09-testing/stories-phase-2/007-Fleet%20Health%20Inspection/README.md) | README + recommended TDD order |

Write failing model/API tests from the catalog **before** implementation (recommended TDD start for Fleet Health Inspection).

## User Story

**As a** Transport Planner, Tenant Super Admin, or Tenant Admin  
**I want to** define inspection checkpoints and recurrence intervals per vehicle type  
**So that** each vehicle in the fleet is checked on the correct schedule for engine, fuel, safety, and accessories

## Business Context

Templates are tenant master data — not per vehicle. When a vehicle is inspected, the system loads the template for its `vehicle_type` (light truck, medium truck, etc.).

---

## Acceptance Criteria

### AC-1: Model `InspectionCheckpointTemplate`

Given a tenant maintains inspection master data,

when an `InspectionCheckpointTemplate` is created or updated,

then required fields, categories, and positive `interval_days` are enforced as tenant-scoped master data by `vehicle_type` (not per vehicle).

- [ ] Fields: `vehicle_type` *, `category` *, `name` *, `description`, `interval_days` * (positive integer), `sort_order`, `is_active`, tenant FK.
- [ ] Categories: Engine, Fuel, Safety, Electrical, Body, Accessories (configurable enum).

**Test Scenarios (AC-1):**

```gherkin
Scenario: AC-1.1 - Required fields persist on create
  Given a tenant admin with template manage permission
  When POST creates a checkpoint with vehicle_type, category, name, and interval_days=7
  Then the template is stored with tenant FK and is_active default true
  And sort_order may be set or defaulted

Scenario: AC-1.2 - Categories are the defined enum set
  Given a template create/update payload
  When category is one of Engine, Fuel, Safety, Electrical, Body, Accessories
  Then save succeeds
  And other category values are rejected

Scenario: AC-1.3 - interval_days must be a positive integer
  Given a template create/update payload
  When interval_days is 0, negative, or non-integer
  Then save is rejected with a validation error

Scenario: AC-1.4 - Templates are per vehicle_type not per vehicle
  Given templates exist for light truck
  When a specific vehicle id is not supplied on the template
  Then the template applies to all vehicles of that vehicle_type in the tenant
```

### AC-2: Admin CRUD

Given Transport Planner, Tenant Super Admin, or Tenant Admin opens Checklist Templates,

when they filter, create, update, or reorder checkpoints for a vehicle type,

then the admin UI under Master Data or Fleet Operations supports CRUD with write RBAC limited to `transport_planner`, `tenant_super_admin`, and `tenant_admin`.

- [ ] **Checklist Templates** under Master Data or Fleet Operations.
- [ ] Filter by vehicle type; reorder checkpoints within type.
- [ ] RBAC: `transport_planner`, `tenant_super_admin`, `tenant_admin`.

**Test Scenarios (AC-2):**

```gherkin
Scenario: AC-2.1 - Planner / admin can CRUD templates
  Given user role is transport_planner, tenant_super_admin, or tenant_admin
  When they open Checklist Templates and create/update a checkpoint
  Then the change is persisted and listed for that vehicle_type

Scenario: AC-2.2 - Filter by vehicle type
  Given templates exist for light truck and medium truck
  When the user filters by light truck
  Then only light truck checkpoints are shown

Scenario: AC-2.3 - Reorder within vehicle type
  Given two checkpoints for the same vehicle_type
  When sort_order is updated
  Then list order reflects the new sort_order

Scenario: AC-2.4 - Driver Supervisor may view but not write
  Given user role is driver_supervisor
  When they open templates or call write APIs
  Then read-only view is allowed
  And POST/PATCH is denied (403)
```

### AC-3: Seed examples

Given a new tenant (or seed command) needs default checklists,

when seed data is applied,

then light truck and medium truck example checkpoints match the module spec intervals.

- [ ] Light truck: engine oil (7d), coolant (7d), fuel lines (30d), brakes (30d), tyres (7d), lights (30d), fire extinguisher (365d).
- [ ] Medium truck: variant set per module spec.

**Test Scenarios (AC-3):**

```gherkin
Scenario: AC-3.1 - Light truck seed checkpoints
  Given seed runs for a tenant
  When light truck templates are loaded
  Then engine oil and coolant and tyres have interval_days=7
  And fuel lines, brakes, and lights have interval_days=30
  And fire extinguisher has interval_days=365

Scenario: AC-3.2 - Medium truck seed variant exists
  Given seed runs for a tenant
  When medium truck templates are loaded
  Then a variant checkpoint set exists per module spec
```

### AC-4: API

Given clients manage templates via API,

when they call inspection-checkpoints endpoints with optional `vehicle_type` filter,

then list/create and retrieve/update work with tenant isolation and RBAC.

- [ ] `GET/POST /api/v1/inspection-checkpoints/?vehicle_type=`
- [ ] `GET/PATCH /api/v1/inspection-checkpoints/{id}/`

**Test Scenarios (AC-4):**

```gherkin
Scenario: AC-4.1 - List filtered by vehicle_type
  Given templates for multiple vehicle types
  When GET /api/v1/inspection-checkpoints/?vehicle_type=light_truck
  Then only matching templates for the caller tenant are returned

Scenario: AC-4.2 - Create and patch by id
  Given transport_planner authentication
  When POST creates a template and PATCH updates name or interval_days
  Then GET by id returns the updated record

Scenario: AC-4.3 - Cross-tenant access denied
  Given a template id belonging to another tenant
  When GET or PATCH is attempted
  Then the API returns 404 or 403 (tenant isolation)
```

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
| FHI-01-4 | Tests | Unit/API tests for AC-1…AC-4 + Edge Cases — [TDD catalog](../../../09-testing/stories-phase-2/007-Fleet%20Health%20Inspection/FHI-01-inspection-checklist-templates-tdd-test-cases.md) | High | Not started |

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
- [ ] Scenarios AC-1.1…AC-4.3 covered — see [FHI-01 TDD catalog](../../../09-testing/stories-phase-2/007-Fleet%20Health%20Inspection/FHI-01-inspection-checklist-templates-tdd-test-cases.md)
- [ ] TDD catalog statuses updated for P0 rows (`Planned` → `Failing` → `Passing`)

---

*Epic: Fleet Health Inspection | Phase: 2 (unscheduled) | 5 SP | Last Updated: 2026-09-14*
