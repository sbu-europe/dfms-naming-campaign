---
module: 06-yard-operations
specification: Finished Goods Workflow — Sections 8 & 11 — Scale In/Out (Source POI) — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: SC-01, FB-001
source_spec: ../../../../../05-modules/06-yard-operations/scaling-operations.md
last_updated: 2026-08-11
last_mcp_run: 2026-08-11
last_mcp_verdict: 9/9 Pass · 7 Planned
artifacts: tests/e2e/playwright-mcp/07-12-source-yard-artifacts/
playwright_mcp: true
---

# Finished Goods Workflow — Sections 8 & 11 — Scaling (Source POI) — E2E Scenario Plan (Django Admin SSR)

**Last MCP run:** 2026-08-11 · **9/9 Pass · 7 Planned** · `RUN_ID=BE16C49E`  
**Artifacts:** [`../../../../../../tests/e2e/playwright-mcp/07-12-source-yard-artifacts/RESULTS.md`](../../../../../../tests/e2e/playwright-mcp/07-12-source-yard-artifacts/RESULTS.md)  
**Accounts:** `scaling.operator1.nourish@yopmail.com` @ MCP-S-BE16C49E.

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-08-11 | **9/9** | Source Scale-In/Out happy path + RBAC 403. Multi-point/stock-measure Planned. |


**Navigation:** Scaling → **Scale-In** / **Scale-Out** → Add

## Section 8 — Scale In (Source)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Scale-In after Gate-In | TO **At Source** with active visit. As **Scaling Operator** (`scaling.operator1@yopmail.com`), **Scale-In → Add**: select visit, enter positive `scale_in_weight_mt`, unique P.C. code, submit. Assert weighing session + **Queue Token** created; sub-state **Scale In (Source)** / queue **Waiting for Command Center**. | P0 | Pass |
| TC02 | Scale-In blocked before Gate-In | TO **Driving Towards Source** without visit. Scale-In add blocked. | P0 | Planned |
| TC03 | Queue Token generated on Scale-In | After TC01, open **Scaling → Queue Tokens**; assert token linked to TO/visit. | P0 | Pass |
| TC04 | Weight rejects zero/negative | Enter `0` or negative weight; submit blocked. | P0 | Planned |
| TC05 | Scale-In does not change source stock | Note source POI stock before/after TC01; assert **unchanged** (stock moves at loading complete only). | P0 | Planned |
| TC06 | RBAC — Loading Personnel denied Scale-In | Loading role cannot access Scale-In add. | P0 | Pass |
| TC07 | Audit Scale-In | Scale-In record shows weight, user, timestamp. | P1 | Pass |
| TC08 | Sub-status Waiting for Command Center | After TC01, TO shows sub-state **Waiting for Command Center** on queue/CC screens. | P0 | Pass |

## Section 11 — Scale Out (Source)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC09 | Scale-Out after Loading Completed | All load points complete. **Scale-Out → Add**, select weighing session, enter loaded `scale_out_weight_mt`, submit. Sub-state **Scale Out (Source)**; net weight = abs(delta) displayed. | P0 | Pass |
| TC10 | Scale-Out blocked with pending load points | Multi-point load: only point 1 done. Scale-Out blocked with pending loading message. | P0 | Planned |
| TC11 | Scale-Out blocked before loading started | Assignment only, no load events. Blocked. | P0 | Planned |
| TC12 | Loaded qty from weight delta | Scale-In 8,000 kg, Scale-Out 18,000 kg → net 10,000 kg shown. | P0 | Pass |
| TC13 | Invalid weight rejected | Zero/negative/non-numeric scale-out blocked. | P0 | Planned |
| TC14 | RBAC — CC Officer denied Scale-Out | Command Center role cannot Scale-Out add. | P0 | Pass |
| TC15 | Audit Scale-Out | Record persisted with weight + user. | P1 | Pass |
| TC16 | Scale-Out does not change stock | Stock already reduced at loading complete; scale-out leaves stock unchanged. | P0 | Planned |

## Implementation Notes

- **Original ID map:** FG_SCALEIN_S_001–008 → TC01–TC08; FG_SCALEOUT_S_001–008 → TC09–TC16.
