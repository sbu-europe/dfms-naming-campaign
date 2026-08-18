---
module: 06-yard-operations
specification: Raw Materials Workflow — Section 10 — Loading (Source) — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: LD-01, STK-01
source_spec: ../../../../../05-modules/06-yard-operations/loading-unloading.md
last_updated: 2026-08-17
playwright_mcp: true
last_mcp_run: 2026-08-17
last_mcp_verdict: 5/10 Pass · 5 Planned
artifacts: tests/e2e/playwright-mcp/rm-07-11-source-yard-artifacts/
---

# Raw Materials Workflow — Section 10 — Loading (Source) — E2E Scenario Plan


**Last MCP run:** 2026-08-17 · **5/10 Pass · 5 Planned** · `RUN_ID=C4E217A8`  
**Chain:** `PS-PORT-20260817-0003` → `TR-PORT-20260817-0004` → `TO-20260817-0004` → **Closed**  
**Artifacts:** [`tests/e2e/playwright-mcp/rm-07-11-source-yard-artifacts/RESULTS.md`](../../../../../tests/e2e/playwright-mcp/rm-07-11-source-yard-artifacts/RESULTS.md)  
**Navigation:** Loading → **Loading Operations** / queue actions

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Start Loading at assigned point | Sub-state **Assigned Loading Point**. As **Loading Personnel** (`loading.personnel1.nourish@yopmail.com`), select TO/point, **Start Loading**. Sub-state **Loading Started**; start timestamp recorded. | P0 | Pass |
| TC02 | End Loading at assigned point | Loading in progress. **End Loading**. End timestamp on point. | P0 | Pass |
| TC03 | Loading Completed — single point | One loading point: after End Loading, sub-state **Loading Completed**. | P0 | Pass |
| TC04 | Multi-point — not complete until all points done | Two points; end point 1 only. Sub-state stays **Loading Started**. | P0 | Planned |
| TC05 | Multi-point — complete after final point | End point 2 after point 1 done → **Loading Completed**. | P0 | Planned |
| TC06 | Independent timestamps per loading point | Two points with different start/end times; each retains own timestamps. | P1 | Planned |
| TC07 | Source stock reduces at Loading Completed | Note source POI stock before/after all points complete. Stock reduced by loaded qty; free capacity recalculated. | P0 | Planned |
| TC08 | Loading blocked without CC assignment | Sub-state **Waiting for Command Center**. **Start Loading** blocked. | P0 | Planned |
| TC09 | RBAC — Driver denied Loading | Driver cannot access loading screen. | P0 | Pass |
| TC10 | Audit loading events per point | Admin log: start/end per point + overall Loading Completed. | P1 | Pass |

## Implementation Notes

- **Original ID map:** RM_089–RM_098 → TC01–TC10.

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-08-17 | **5/10 Pass** | Playwright MCP; see `tests/e2e/playwright-mcp/rm-07-11-source-yard-artifacts/RESULTS.md`. Happy-path chain on MCP sandbox. |
