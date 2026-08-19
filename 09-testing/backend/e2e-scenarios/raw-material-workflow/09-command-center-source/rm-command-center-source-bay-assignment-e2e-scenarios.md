---
module: 06-yard-operations
specification: Raw Materials Workflow — Section 9 — Command Center (Source) Bay Assignment — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: CC-01
source_spec: ../../../../../05-modules/06-yard-operations/command-center-queue.md
last_updated: 2026-08-17
playwright_mcp: true
last_mcp_run: 2026-08-17
last_mcp_verdict: 6/7 Pass · 1 Planned
artifacts: tests/e2e/playwright-mcp/rm-07-11-source-yard-artifacts/
---

# Raw Materials Workflow — Section 9 — Command Center (Source) — Bay & Loading Point — E2E Scenario Plan


**Last MCP run:** 2026-08-17 · **6/7 Pass · 1 Planned** · `RUN_ID=C4E217A8`  
**Chain:** `PS-PORT-20260817-0003` → `TR-PORT-20260817-0004` → `TO-20260817-0004` → **Closed**  
**Artifacts:** [`tests/e2e/playwright-mcp/rm-07-11-source-yard-artifacts/RESULTS.md`](../../../../../tests/e2e/playwright-mcp/rm-07-11-source-yard-artifacts/RESULTS.md)  
**Navigation:** Command Center → **Queue Monitoring** / **Bay Assignment** → Add

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | CC views queue after Source Scale-In | TO sub-state **Waiting for Command Center**. As **Command Center Officer** (`command.center.officer1.nourish@yopmail.com`), open queue. Assert TO/vehicle in waiting queue. | P0 | Pass |
| TC02 | CC assigns Bay and Loading Point | Select TO; assign **Bay** and **Loading Point**; save. Sub-state **Assigned Loading Point**; assignment persisted. | P0 | Pass |
| TC03 | Multiple loading points for one TO | Assign Loading Point 1 and 2 (multi-point). Both tracked on TO. | P1 | Planned |
| TC04 | Assignment visible to Loading Personnel queue | After TC02, as **Loading Personnel**, assert TO appears on loading queue for assigned point. *Notification push out of MCP scope — assert queue presence.* | P1 | Pass |
| TC05 | RBAC — Driver denied Bay Assignment | Driver cannot access CC assignment add. | P0 | Pass |
| TC06 | Audit Bay/Loading Point assignment | Admin log / assignment record with user + timestamp. | P1 | Pass |
| TC07 | Sub-status Assigned Loading Point on TO view | Transport Planner / CC view shows **Assigned Loading Point** sub-state. | P0 | Pass |

## Implementation Notes

- **Original ID map:** RM_082–RM_088 → TC01–TC07.

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-08-17 | **6/7 Pass** | Playwright MCP; see `tests/e2e/playwright-mcp/rm-07-11-source-yard-artifacts/RESULTS.md`. Happy-path chain on MCP sandbox. |
