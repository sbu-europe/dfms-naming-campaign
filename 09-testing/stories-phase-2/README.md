---
section: 09-testing/stories-phase-2
phase: Phase 2
purpose: TDD test-case catalogs for unscheduled Phase 2 backlog stories
last_updated: 2026-09-17
---

# Phase 2 stories — TDD test catalogs

Test cases written **before** implementation (TDD). Each catalog maps 1:1 to story `AC-N.x` scenarios under `03-backlog/stories-phase-2/`.

## How to use (TDD)

1. Open the story AC + this catalog.
2. Implement failing tests for **P0** rows first (unit → API → E2E/Maestro).
3. Implement code until tests pass; then P1.
4. Keep `Status` updated: `Planned` → `Failing` → `Passing`.

## Feature index

| # | Feature | Catalog | Stories | Notes |
|---|---------|---------|---------|-------|
| 001 | [Odometer-based maintenance](./001-Odometer-Based%20Vehicle%20Maintenance%20Tracking/README.md) | FVM-01 | [backlog](../../03-backlog/stories-phase-2/001-Odometer-Based%20Vehicle%20Maintenance%20Tracking/) | Unit-first: remaining km; meter ≠ GPS |
| 002 | [Vehicle tracking & dashboard](./002-Vehicle%20Tracking%20and%20Dashboard/README.md) | FVM-02 | [backlog](../../03-backlog/stories-phase-2/002-Vehicle%20Tracking%20and%20Dashboard/) | API counts vs `operational_status` |
| 003 | [Vehicle utilization](./003-Vehicle%20Utilization%20Analysis/README.md) | FVM-03 | [backlog](../../03-backlog/stories-phase-2/003-Vehicle%20Utilization%20Analysis/) | Unit-first: Plan count + GPS idle |
| 004 | [Vehicle downtime](./004-Vehicle%20Downtime%20Management/README.md) | FVM-04 | [backlog](../../03-backlog/stories-phase-2/004-Vehicle%20Downtime%20Management/) | API open/close; hours feed FVM-03 |
| 005 | [Fuel Management](./005-Fuel%20Management/README.md) | FM-01…FM-05 | [backlog](../../03-backlog/stories-phase-2/005-Fuel%20Management/) | Unit-first: FM-03 → FM-05 |
| 006 | [Vehicle Reports](./006-Vehicle%20Reports/README.md) | VR-01…VR-03 | [backlog](../../03-backlog/stories-phase-2/006-Vehicle%20Reports/) | Nav → list service → detail |
| 007 | [Fleet Health Inspection](./007-Fleet%20Health%20Inspection/README.md) | FHI-01…FHI-04 | [backlog](../../03-backlog/stories-phase-2/007-Fleet%20Health%20Inspection/) | Templates → round → dashboard → VR |
| 008 | [Vendor Rating System](./008-Vendor%20Rating%20System/README.md) | VRS-01…VRS-03 | [backlog](../../03-backlog/stories-phase-2/008-Vendor%20Rating%20System/) | Avg/immutability → mobile → surfaces |
| 012 | [TO dispatch planning calendar](./012-TO%20Dispatch%20Planning%20Calendar%20View/README.md) | TO-03 | [backlog](../../03-backlog/stories-phase-2/012-TO%20Dispatch%20Planning%20Calendar%20View/) | Unit-first: period set + unassigned omitted from lanes |

Other Phase 2 features (009–011) — add folders here when their story ACs are GWT-ready.

**001–004 TDD order:** FVM-01 remaining-km unit → FVM-04 downtime API → FVM-03 utilization unit (downtime hours 0 until FVM-04) → FVM-02 dashboard API/E2E. FVM-02 cards do not require FVM-01.

## Related

- Backlog stories → [`03-backlog/stories-phase-2/`](../../03-backlog/stories-phase-2/)
- Testing strategy → [`../strategy/testing-strategy.md`](../strategy/testing-strategy.md)
- Prior sprint E2E plans → [`../backend/e2e-scenarios/`](../backend/e2e-scenarios/)
