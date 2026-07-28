---
module: 06-yard-operations
specification: Raw Materials Workflow — Sections 8 & 11 — Scale In/Out (Source POI) — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: SC-01, STK-01
source_spec: ../../../../../05-modules/06-yard-operations/scaling-operations.md
last_updated: 2026-07-21
playwright_mcp: true
---

# Raw Materials Workflow — Sections 8 & 11 — Scaling (Source POI) — E2E Scenario Plan (Django Admin SSR)

**Navigation:** Scaling → **Scale-In** / **Scale-Out** → Add

## Section 8 — Scale In (Source)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Scale-In after Gate-In | TO **At Source**. As **Scaling Operator** (`scaling.operator1.nourish@yopmail.com`), **Scale-In → Add**: select visit, enter positive empty-vehicle weight, submit. Assert **Queue Token**; sub-state **Waiting for Command Center**. | P0 | Planned |
| TC02 | Scale-In blocked before Gate-In | TO **Driving Towards Source** without visit. Blocked. | P0 | Planned |
| TC03 | Queue Token generated on Scale-In | After TC01, **Scaling → Queue Tokens** shows token for TO. | P0 | Planned |
| TC04 | Weight rejects zero/negative | `0` or negative weight blocked. | P0 | Planned |
| TC05 | Scale-In does not change source stock | Source POI stock unchanged after Scale-In (stock reduces at **Loading Completed** only). | P0 | Planned |
| TC06 | RBAC — Loading Personnel denied Scale-In | Loading role cannot Scale-In add. | P0 | Planned |
| TC07 | Audit Scale-In | Record shows weight, user, timestamp. | P1 | Planned |

## Section 11 — Scale Out (Source)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC08 | Scale-Out after Loading Completed | All load points complete (§10). **Scale-Out → Add**, enter loaded weight, submit. Sub-state **Scale Out (Source)**. | P0 | Planned |
| TC09 | Scale-Out blocked with pending load points | Multi-point: only point 1 done. Blocked. | P0 | Planned |
| TC10 | Scale-Out blocked before loading | Sub-state **Assigned Loading Point** only. Blocked. | P0 | Planned |
| TC11 | Loaded qty from weight delta | Scale-In 8,000 kg + Scale-Out 18,000 kg → net 10,000 kg displayed. | P0 | Planned |
| TC12 | Invalid scale-out weight rejected | Zero/negative/non-numeric blocked. | P0 | Planned |
| TC13 | RBAC — CC Officer denied Scale-Out | Command Center cannot Scale-Out add. | P0 | Planned |
| TC14 | Audit Scale-Out | Weight + user persisted. | P1 | Planned |
| TC15 | Scale-Out does not change stock | Stock already reduced at loading complete. | P0 | Planned |

## Implementation Notes

- **Original ID map:** RM_075–RM_081 → TC01–TC07; RM_099–RM_106 → TC08–TC15.
