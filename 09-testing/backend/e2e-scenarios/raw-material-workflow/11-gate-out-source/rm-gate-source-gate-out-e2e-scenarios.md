---
module: 06-yard-operations
specification: Raw Materials Workflow — Section 11 — Gate Out (Source) — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: GT-01
source_spec: ../../../../../05-modules/06-yard-operations/gate-operations.md
last_updated: 2026-08-17
playwright_mcp: true
last_mcp_run: 2026-08-17
last_mcp_verdict: 5/6 Pass · 1 Planned
artifacts: tests/e2e/playwright-mcp/rm-07-11-source-yard-artifacts/
---

# Raw Materials Workflow — Section 11 — Gate Out (Source) — E2E Scenario Plan


**Last MCP run:** 2026-08-17 · **5/6 Pass · 1 Planned** · `RUN_ID=C4E217A8`  
**Chain:** `PS-PORT-20260817-0003` → `TR-PORT-20260817-0004` → `TO-20260817-0004` → **Closed**  
**Artifacts:** [`tests/e2e/playwright-mcp/rm-07-11-source-yard-artifacts/RESULTS.md`](../../../../../tests/e2e/playwright-mcp/rm-07-11-source-yard-artifacts/RESULTS.md)  
**Navigation:** Gate → **Vehicle Exit (Gate-Out)** → Add

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Gate-Out after Source Scale-Out | Sub-state **Scale Out (Source)**. As **Gateman**, record **Gate-Out**. TO status **Driving Towards Destination**. | P0 | Pass |
| TC02 | Gate-Out blocked before Scale-Out | Scale-Out not recorded. Blocked. | P0 | Planned |
| TC03 | Discrepancy remarks at Gate-Out | Enter remarks; assert on visit history. | P1 | Pass |
| TC04 | RBAC — Loading Personnel denied Gate-Out | Loading role cannot Gate-Out. | P0 | Pass |
| TC05 | Audit Gate-Out | User + timestamp on Gate-Out record. | P1 | Pass |
| TC06 | Main status Driving Towards Destination | After TC01, TO shows **Driving Towards Destination** on TP queue. | P0 | Pass |

## Implementation Notes

- **Original ID map:** RM_107–RM_112 → TC01–TC06.

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-08-17 | **5/6 Pass** | Playwright MCP; see `tests/e2e/playwright-mcp/rm-07-11-source-yard-artifacts/RESULTS.md`. Happy-path chain on MCP sandbox. |
