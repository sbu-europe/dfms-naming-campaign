---
module: 06-yard-operations
specification: Raw Materials Workflow — Section 16 — Unloading (Destination) — Playwright E2E Scenario Plan
version: 1.1
phase: Phase 1
related_stories: LD-01, STK-01, QC-01, FB-013
source_spec: ../../../../../05-modules/06-yard-operations/loading-unloading.md
last_updated: 2026-08-17
playwright_mcp: true
last_mcp_run: 2026-08-17
last_mcp_verdict: 4/12 Pass · 8 Planned
artifacts: tests/e2e/playwright-mcp/rm-12-17-dest-yard-artifacts/
---

# Raw Materials Workflow — Section 16 — Unloading (Destination) — E2E Scenario Plan


**Last MCP run:** 2026-08-17 · **4/12 Pass · 8 Planned** · `RUN_ID=C4E217A8`  
**Chain:** `PS-PORT-20260817-0003` → `TR-PORT-20260817-0004` → `TO-20260817-0004` → **Closed**  
**Artifacts:** [`tests/e2e/playwright-mcp/rm-12-17-dest-yard-artifacts/RESULTS.md`](../../../../../tests/e2e/playwright-mcp/rm-12-17-dest-yard-artifacts/RESULTS.md)  
**Navigation:** Unloading → **Unloading Operations** / queue actions

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Start Unloading at assigned point | Sub-state **Assigned Unloading Point**. As **Unloading Personnel** (`unloading.personnel1.nourish@yopmail.com`), **Start Unloading**. Sub-state **Unloading Started**. | P0 | Pass |
| TC02 | Continue Unloading progress log | In progress, **Continue Unloading** logs interim progress without completing sub-state. | P1 | Planned |
| TC03 | End Unloading at point | **End Unloading** records end timestamp. | P0 | Pass |
| TC04 | Unloading Completed — single point | One point: after End → **Unloading Completed**. | P0 | Pass |
| TC05 | Multi-point — incomplete until all done | Two points; end point 1 only → stays **Unloading Started**. | P0 | Planned |
| TC06 | Multi-point — complete after final point | End point 2 → **Unloading Completed**. | P0 | Planned |
| TC07 | Independent timestamps per unloading point | Each point retains own start/continue/end times. | P1 | Planned |
| TC08 | Destination stock increases only after QC Pass + Unloading Completed | QC **Pass** fixture: note dest stock before unload; after all points complete, stock increased. | P0 | Planned |
| TC09 | Unloading blocked without CC assignment | **Waiting for Command Center** without unloading point. Blocked. | P0 | Planned |
| TC10 | RBAC — Driver denied Unloading | Driver blocked. | P0 | Planned |
| TC11 | Unloading after QC Fail (FB-013) | QC **Fail** with bay assigned (§15 TC03). Assert **Start Unloading** is **not** blocked solely for Fail; unload warning / failed-quantity context may show. Destination **good** stock still does not increase without QC Pass (see TC08). | P0 | Planned |
| TC12 | Audit unloading events per point | Log entries for start/continue/end + overall Unloading Completed. | P1 | Pass |

## Implementation Notes

- Stock rule: destination stock **only** after **Unloading Completed** AND **QC Pass** (QC-enabled products).
- **FB-013:** QC Fail does not by itself block Start Unloading once CC has assigned a point; pending QC still blocks CC assign (§15 TC04).
- **Original ID map:** RM_149–RM_160 → TC01–TC12 (TC11 expectation updated 2026-08-10).

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-08-17 | **4/12 Pass** | Playwright MCP; see `tests/e2e/playwright-mcp/rm-12-17-dest-yard-artifacts/RESULTS.md`. Happy-path chain on MCP sandbox. |
