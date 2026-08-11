---
module: 06-yard-operations
specification: Finished Goods Workflow — Section 15 — Command Center (Destination) — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: CC-01, FB-001
last_updated: 2026-08-11
last_mcp_run: 2026-08-11
last_mcp_verdict: 5/5 Pass · 1 Planned
artifacts: tests/e2e/playwright-mcp/13-18-dest-yard-artifacts/
playwright_mcp: true
---

# Finished Goods Workflow — Section 15 — Command Center (Destination) — Bay & Unloading Assignment — E2E Scenario Plan

**Last MCP run:** 2026-08-11 · **5/5 Pass · 1 Planned** · `RUN_ID=BE16C49E`  
**Artifacts:** [`../../../../../../tests/e2e/playwright-mcp/13-18-dest-yard-artifacts/RESULTS.md`](../../../../../../tests/e2e/playwright-mcp/13-18-dest-yard-artifacts/RESULTS.md)  
**Accounts:** `command.center.officer1.nourish@yopmail.com` @ MCP-D-BE16C49E.

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-08-11 | **5/5** | Assigned MCP-U1 via queue_entry URL. Multi-point Planned. |


**Navigation:** Command Center → **Queue** → **Assign unloading point**

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | CC sees destination waiting queue | After destination Scale-In, TO in **Command Center → Queue** (`waiting`). | P0 | Pass |
| TC02 | Assign Bay and Unloading Point | Save assignment; sub-state **Assigned Unloading Point**. | P0 | Pass |
| TC03 | Multi-point unloading assignment | Two unloading points assigned and tracked independently. | P1 | Planned |
| TC04 | Unloading Personnel queue visibility | *Rewrite notification AC:* Unloading Personnel sees assignment via **Start Unloading** queue / `?bay_assignment=` deep link. | P1 | Pass |
| TC05 | RBAC — Driver denied | Cannot access bay assignment add. | P0 | Pass |
| TC06 | Audit destination assignment | BayAssignment record logged. | P1 | Pass |

**Original ID map:** FG_CC_D_001–006 → TC01–TC06.
