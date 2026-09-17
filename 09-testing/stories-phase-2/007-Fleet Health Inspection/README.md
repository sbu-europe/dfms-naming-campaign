---
section: 09-testing/stories-phase-2/007-Fleet Health Inspection
phase: Phase 2
epic: Fleet Health Inspection
tdd: true
last_updated: 2026-09-14
source_stories: ../../../03-backlog/stories-phase-2/007-Fleet Health Inspection/
module_spec: ../../../05-modules/08-fleet-management/fleet-health-inspection.md
---

# 007 — Fleet Health Inspection — TDD test catalogs

Derived from story **Given–When–Then** scenarios (`AC-N.x`). Write failing tests first; implement until green.

| File | Story | Preferred first layer | P0 focus |
|------|-------|----------------------|----------|
| [00-all-test-cases.md](./00-all-test-cases.md) | Index | — | Full TC matrix |
| [FHI-01](./FHI-01-inspection-checklist-templates-tdd-test-cases.md) | Checklist templates | **Model / API** (start here) | Fields, interval, RBAC, seed |
| [FHI-03](./FHI-03-conduct-inspection-round-tdd-test-cases.md) | Conduct round | **API / service** | Submit, state update, own-fleet |
| [FHI-02](./FHI-02-inspection-dashboard-alerts-tdd-test-cases.md) | Dashboard alerts | **Unit** status math | 2-day due-soon, alerts_only |
| [FHI-04](./FHI-04-inspection-alerts-on-vehicle-report-tdd-test-cases.md) | Report aggregation | API / unit | InspectionStatusService reuse |

## Recommended TDD order

1. **FHI-01** model/API (`InspectionCheckpointTemplate`)  
2. **FHI-03** submit (`InspectionRound` + `VehicleCheckpointState`)  
3. **FHI-02** unit (`InspectionStatusService` dashboard status math)  
4. **FHI-04** report aggregation via `InspectionStatusService` (no duplicate logic)

## ID convention

| ID | Meaning |
|----|---------|
| `FHI-0x-TC##` | Primary test case for story FHI-0x |
| `AC-N.x` | Source scenario on the story file |
| `FHI-0x-EC##` | Edge-case row from story Edge Cases |

**Status values:** `Planned` · `Failing` · `Passing` · `Blocked (PO)`

## Story links

- [FHI-01](../../../03-backlog/stories-phase-2/007-Fleet%20Health%20Inspection/FHI-01-inspection-checklist-templates.md)
- [FHI-02](../../../03-backlog/stories-phase-2/007-Fleet%20Health%20Inspection/FHI-02-inspection-dashboard-alerts.md)
- [FHI-03](../../../03-backlog/stories-phase-2/007-Fleet%20Health%20Inspection/FHI-03-conduct-inspection-round.md)
- [FHI-04](../../../03-backlog/stories-phase-2/007-Fleet%20Health%20Inspection/FHI-04-inspection-alerts-on-vehicle-report.md)
