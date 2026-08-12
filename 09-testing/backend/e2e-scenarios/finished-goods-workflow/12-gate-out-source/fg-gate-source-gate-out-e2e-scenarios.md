---
module: 06-yard-operations
specification: Finished Goods Workflow — Section 12 — Gate Out (Source POI) — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: GT-02, FB-004
source_spec: ../../../../../05-modules/06-yard-operations/gate-operations.md
last_updated: 2026-08-11
last_mcp_run: 2026-08-11
last_mcp_verdict: 5/5 Pass · 1 Planned
artifacts: tests/e2e/playwright-mcp/07-12-source-yard-artifacts/
playwright_mcp: true
---

# Finished Goods Workflow — Section 12 — Gate Out (Source POI) — E2E Scenario Plan (Django Admin SSR)

**Last MCP run:** 2026-08-11 · **5/5 Pass · 1 Planned** · `RUN_ID=BE16C49E`  
**Artifacts:** [`../../../../../../tests/e2e/playwright-mcp/07-12-source-yard-artifacts/RESULTS.md`](../../../../../../tests/e2e/playwright-mcp/07-12-source-yard-artifacts/RESULTS.md)  
**Accounts:** `gateman1.nourish@yopmail.com` @ MCP-S-BE16C49E.

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-08-11 | **5/5** | Source Gate-Out → Driving Towards Destination. Premature Gate-Out Planned. |


**Navigation:** Gate → **Vehicle Exit (Gate-Out)** → Add (`/admin/operations/gateout/add/`)

Scope: **Gateman** recording source gate-out after source scale-out and loading complete.

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Gateman records Gate-Out after source Scale-Out | TO at source with scale-out complete (`sub_state` scale_out_source). **Gate → Vehicle Exit (Gate-Out) → Add**, select active visit, pass clearance panel, submit. Assert Gate-Out recorded; TO status **Driving Towards Destination**. | P0 | Pass |
| TC02 | Gate-Out blocked before Scale-Out | TO **Loading Completed** but scale-out not done. Attempt Gate-Out. Expected: clearance panel blocks / error. | P0 | Planned |
| TC03 | Discrepancy remarks at Gate-Out | Enter **remarks** on Gate-Out; assert saved on record. | P1 | Pass |
| TC04 | RBAC — Loading Personnel denied | As **Loading Personnel**, Gate-Out add URL denied. | P0 | Pass |
| TC05 | Audit Gate-Out event | Gate-Out row exists with user + timestamp + visit/TO link. | P1 | Pass |
| TC06 | TO status Driving Towards Destination | After TC01, TP view shows **Driving Towards Destination**. | P0 | Pass |

## Implementation Notes

- Clearance requires: scale-out done, all load assignments complete.
- **Original ID map:** FG_GATEOUT_S_001–006 → TC01–TC06.
