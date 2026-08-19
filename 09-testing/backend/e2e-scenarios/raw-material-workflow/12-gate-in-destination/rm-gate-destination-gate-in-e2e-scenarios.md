---
module: 06-yard-operations
specification: Raw Materials Workflow — Section 12 — Gate In (Destination) — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: GT-01
source_spec: ../../../../../05-modules/06-yard-operations/gate-operations.md
last_updated: 2026-08-17
playwright_mcp: true
last_mcp_run: 2026-08-17
last_mcp_verdict: 2/6 Pass · 4 Planned
artifacts: tests/e2e/playwright-mcp/rm-12-17-dest-yard-artifacts/
---

# Raw Materials Workflow — Section 12 — Gate In (Destination) — E2E Scenario Plan


**Last MCP run:** 2026-08-17 · **2/6 Pass · 4 Planned** · `RUN_ID=C4E217A8`  
**Chain:** `PS-PORT-20260817-0003` → `TR-PORT-20260817-0004` → `TO-20260817-0004` → **Closed**  
**Artifacts:** [`tests/e2e/playwright-mcp/rm-12-17-dest-yard-artifacts/RESULTS.md`](../../../../../tests/e2e/playwright-mcp/rm-12-17-dest-yard-artifacts/RESULTS.md)  
**Navigation:** Gate → **Vehicle Entry (Gate-In)** → Add (destination working site)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Destination Gateman records Gate-In | TO **Driving Towards Destination**. As **Gateman** (destination POI working site), record Gate-In. TO **At Destination** (`at_destination`). | P0 | Pass |
| TC02 | Gate-In blocked before Driving Towards Destination | TO still at source yard. Blocked. | P0 | Planned |
| TC03 | Vehicle registration validated | Mismatching reg blocked. | P1 | Planned |
| TC04 | Mandatory field validation | Blank required field blocked. | P0 | Planned |
| TC05 | RBAC — Unloading Personnel denied Gate-In | Unloading role cannot Gate-In add. | P0 | Planned |
| TC06 | Audit destination Gate-In | User + timestamp logged. | P1 | Pass |

## Implementation Notes

- **Original ID map:** RM_113–RM_118 → TC01–TC06.

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-08-17 | **2/6 Pass** | Playwright MCP; see `tests/e2e/playwright-mcp/rm-12-17-dest-yard-artifacts/RESULTS.md`. Happy-path chain on MCP sandbox. |
