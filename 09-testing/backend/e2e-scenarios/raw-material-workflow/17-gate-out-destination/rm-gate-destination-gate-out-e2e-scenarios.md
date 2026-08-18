---
module: 06-yard-operations
specification: Raw Materials Workflow — Section 17 — Gate Out (Destination) & Auto TO Closure — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: GT-01, TO-03
source_spec: ../../../../../05-modules/06-yard-operations/gate-operations.md
last_updated: 2026-08-17
playwright_mcp: true
last_mcp_run: 2026-08-17
last_mcp_verdict: 5/9 Pass · 4 Planned
artifacts: tests/e2e/playwright-mcp/rm-12-17-dest-yard-artifacts/
---

# Raw Materials Workflow — Section 17 — Gate Out (Destination) & Auto Closure — E2E Scenario Plan

> **2026-08-17 — Chain TO `TO-20260817-0004` reached Closed** after destination Gate-Out (`RUN_ID=C4E217A8`).


**Last MCP run:** 2026-08-17 · **5/9 Pass · 4 Planned** · `RUN_ID=C4E217A8`  
**Chain:** `PS-PORT-20260817-0003` → `TR-PORT-20260817-0004` → `TO-20260817-0004` → **Closed**  
**Artifacts:** [`tests/e2e/playwright-mcp/rm-12-17-dest-yard-artifacts/RESULTS.md`](../../../../../tests/e2e/playwright-mcp/rm-12-17-dest-yard-artifacts/RESULTS.md)  
**Navigation:** Gate → **Vehicle Exit (Gate-Out)** → Add (destination site)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Destination Gate-Out after Scale-Out | Sub-state **Scale Out (Destination)**. **Gateman** records Gate-Out. Gate-Out timestamp saved. | P0 | Pass |
| TC02 | TO auto-Closed on destination Gate-Out | After Gate-Out, TO status **Closed** (`closed`) immediately — no manual close action. | P0 | Pass |
| TC03 | Gate-Out blocked before destination Scale-Out | Scale-Out not done. Blocked. | P0 | Planned |
| TC04 | No manual Close TO queue for Transport Planner | As **Transport Planner**, assert no **Close TO** action or TO Closure Queue menu for RM. Closure is automatic at Gate-Out. | P0 | Pass |
| TC05 | Closed TO is read-only | **Closed** TO: planning/dispatch/reassignment fields read-only or save blocked. | P0 | Pass |
| TC06 | Driver/Vehicle dispatchable after Closed | TO-1 **Closed**; TO-2 shares driver/vehicle **Assigned**. Driver Supervisor can dispatch TO-2 (§5 TC07). | P1 | Planned |
| TC07 | RBAC — Unloading Personnel denied Gate-Out | Unloading role blocked. | P0 | Planned |
| TC08 | QC-Failed exception path Gate-Out | QC **Fail** TO per exception workflow: Gate-Out allowed for return trip; TO **Closed** without stock addition. *Assert per configured exception process in admin.* | P1 | Planned |
| TC09 | Audit Gate-Out and auto-Closed | Log shows Gate-Out event and automatic transition to **Closed**. | P1 | Pass |

## Implementation Notes

- RM TO closure: auto at destination Gate-Out (no FG-style manual closure queue).
- **Original ID map:** RM_168–RM_176 → TC01–TC09.

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-08-17 | **5/9 Pass** | Playwright MCP; see `tests/e2e/playwright-mcp/rm-12-17-dest-yard-artifacts/RESULTS.md`. Happy-path chain on MCP sandbox. |
