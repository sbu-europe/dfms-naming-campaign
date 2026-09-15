---
section: 09-testing/stories-phase-2
phase: Phase 2
purpose: TDD test-case catalogs for unscheduled Phase 2 backlog stories
last_updated: 2026-09-14
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
| 005 | [Fuel Management](./005-Fuel%20Management/README.md) | FM-01…FM-05 | [backlog](../../03-backlog/stories-phase-2/005-Fuel%20Management/) | Unit-first: FM-03 → FM-05 |
| 006 | [Vehicle Reports](./006-Vehicle%20Reports/README.md) | VR-01…VR-03 | [backlog](../../03-backlog/stories-phase-2/006-Vehicle%20Reports/) | Nav → list service → detail |
| 007 | [Fleet Health Inspection](./007-Fleet%20Health%20Inspection/README.md) | FHI-01…FHI-04 | [backlog](../../03-backlog/stories-phase-2/007-Fleet%20Health%20Inspection/) | Templates → round → dashboard → VR |
| 008 | [Vendor Rating System](./008-Vendor%20Rating%20System/README.md) | VRS-01…VRS-03 | [backlog](../../03-backlog/stories-phase-2/008-Vendor%20Rating%20System/) | Avg/immutability → mobile → surfaces |

Other Phase 2 features (001–004, 009–011) — add folders here when their story ACs are GWT-ready.

## Related

- Backlog stories → [`03-backlog/stories-phase-2/`](../../03-backlog/stories-phase-2/)
- Testing strategy → [`../strategy/testing-strategy.md`](../strategy/testing-strategy.md)
- Prior sprint E2E plans → [`../backend/e2e-scenarios/`](../backend/e2e-scenarios/)
