---
section: 09-testing/stories-phase-2/007-Fleet Health Inspection
specification: FHI-01 Inspection Checklist Templates — TDD test cases
version: 1.0
phase: Phase 2
tdd: true
related_stories: FHI-01
source_spec: ../../../03-backlog/phase-2/stories-phase-2/007-Fleet Health Inspection/FHI-01-inspection-checklist-templates.md
module_spec: ../../../../05-modules/08-fleet-management/fleet-health-inspection.md
suggested_impl:
  unit: InspectionCheckpointTemplate model validation
  api: GET/POST /api/v1/inspection-checkpoints/; GET/PATCH /api/v1/inspection-checkpoints/{id}/
  e2e: Playwright admin — Checklist Templates
last_updated: 2026-09-14
---

# FHI-01 — Inspection Checklist Templates — TDD test cases

**Story:** [FHI-01](../../../03-backlog/phase-2/stories-phase-2/007-Fleet%20Health%20Inspection/FHI-01-inspection-checklist-templates.md)  
**TDD start here:** model + API for tenant templates by `vehicle_type` (not per vehicle).  
**Used by:** FHI-02 dashboard, FHI-03 rounds.

## Seed prerequisites (when implementing)

| Item | Notes |
|------|--------|
| Roles | `transport_planner`, `tenant_admin` write; `driver_supervisor` view; negative: plain driver |
| Vehicle types | light truck + medium truck enums from MDM-05 |
| Tenancy | ≥2 tenants to assert isolation |

---

## A — Model fields (AC-1)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FHI-01-TC01 | AC-1.1 | Unit / API | Required fields persist | POST with vehicle_type, category, name, interval_days=7. Assert tenant FK stored; is_active default true. | P0 | Planned |
| FHI-01-TC02 | AC-1.2 | Unit / API | Category enum set | Category in {Engine, Fuel, Safety, Electrical, Body, Accessories} succeeds; other value rejected. | P0 | Planned |
| FHI-01-TC03 | AC-1.3 | Unit / API | interval_days positive int | interval_days 0, negative, or non-integer → validation error. | P0 | Planned |
| FHI-01-TC04 | AC-1.4 | Unit / API | Per vehicle_type not vehicle | Template has no vehicle FK; applies to all vehicles of that type in tenant. | P0 | Planned |

## B — Admin CRUD & RBAC (AC-2)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FHI-01-TC05 | AC-2.1 | E2E / API | Planner CRUD | As transport_planner or tenant_admin, create/update checkpoint. Assert persisted in list for vehicle_type. | P0 | Planned |
| FHI-01-TC06 | AC-2.2 | E2E / API | Filter by vehicle type | Light + medium templates exist. Filter light truck → only light truck rows. | P0 | Planned |
| FHI-01-TC07 | AC-2.3 | API | Reorder sort_order | PATCH sort_order for two same-type rows. Assert list order updates. | P1 | Planned |
| FHI-01-TC08 | AC-2.4 | API | DS view-only | As driver_supervisor: GET OK; POST/PATCH → 403. | P0 | Planned |

## C — Seed examples (AC-3)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FHI-01-TC09 | AC-3.1 | Unit / API | Light truck seed | After seed: oil/coolant/tyres=7d; fuel lines/brakes/lights=30d; fire extinguisher=365d. | P0 | Planned |
| FHI-01-TC10 | AC-3.2 | Unit / API | Medium truck seed | Medium truck variant set exists per module spec. | P1 | Planned |

## D — API (AC-4)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| FHI-01-TC11 | AC-4.1 | API | List ?vehicle_type= | GET /api/v1/inspection-checkpoints/?vehicle_type=light_truck → tenant-scoped matching only. | P0 | Planned |
| FHI-01-TC12 | AC-4.2 | API | POST + PATCH by id | Create then PATCH name/interval; GET by id returns updated. | P0 | Planned |
| FHI-01-TC13 | AC-4.3 | API | Cross-tenant denied | Other tenant template id → 404 or 403. | P0 | Planned |

---

## Edge cases (from story)

| Test Case ID | Layer | Scenario | Assert | Priority | Status |
|--------------|-------|----------|--------|----------|--------|
| FHI-01-EC01 | Unit / API | interval_days missing/0/decimal | Reject | P0 | Planned |
| FHI-01-EC02 | API | Unauthorized role (driver) | No manage; POST denied | P0 | Planned |
| FHI-01-EC03 | Unit / API | is_active=false | Inactive excluded from new rounds/dashboard; history intact | P1 | Planned |
| FHI-01-EC04 | API | Reorder only meaningful within type | Cross-type sort_order collision does not break filter | P2 | Planned |
| FHI-01-EC05 | — | Duplicate name same type+category | Soft-warn vs unique — follow module; TODO(PO) if unspecified | P2 | Blocked (PO) |

---

## Suggested code test targets (TDD)

```
tests/unit/.../test_inspection_checkpoint_template.py   # TC01–04, TC09–10, EC01, EC03
tests/api/.../test_inspection_checkpoints_api.py        # TC05–08, TC11–13, EC02
```

**Implement order:** TC01 → TC03 → TC02 → TC04 → TC11–12 → TC08 → TC09 → rest.
