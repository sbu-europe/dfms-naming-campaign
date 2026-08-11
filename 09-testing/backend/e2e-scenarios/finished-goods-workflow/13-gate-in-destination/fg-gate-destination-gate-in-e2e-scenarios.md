---
module: 06-yard-operations
specification: Finished Goods Workflow — Section 13 — Gate In (Destination POI) — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: GT-01, FB-004
last_updated: 2026-08-11
last_mcp_run: 2026-08-11
last_mcp_verdict: 3/3 Pass · 3 Planned
artifacts: tests/e2e/playwright-mcp/13-18-dest-yard-artifacts/
playwright_mcp: true
---

# Finished Goods Workflow — Section 13 — Gate In (Destination POI) — E2E Scenario Plan

**Last MCP run:** 2026-08-11 · **3/3 Pass · 3 Planned** · `RUN_ID=BE16C49E`  
**Artifacts:** [`../../../../../../tests/e2e/playwright-mcp/13-18-dest-yard-artifacts/RESULTS.md`](../../../../../../tests/e2e/playwright-mcp/13-18-dest-yard-artifacts/RESULTS.md)  
**Accounts:** `gateman1.nourish@yopmail.com` @ MCP-D-BE16C49E.

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-08-11 | **3/3** | Dest Gate-In (enable disabled document_category). Premature/mismatch/blank Planned. |


**Navigation:** Gate → **Vehicle Entry (Gate-In)** → Add (destination POI working site)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Destination Gate-In when vehicle arrives | TO **Driving Towards Destination**. Gateman at **destination POI** records Gate-In. TO → **At Destination**. | P0 | Pass |
| TC02 | Blocked before Driving Towards Destination | TO still at source yard. Gate-In at destination blocked. | P0 | Planned |
| TC03 | Vehicle registration match | Mismatched registration rejected. | P1 | Planned |
| TC04 | Mandatory field validation | Blank required field blocks submit. | P0 | Planned |
| TC05 | RBAC — Unloading Personnel denied | Cannot access Gate-In add. | P0 | Pass |
| TC06 | Audit destination Gate-In | Record with user + timestamp + TO. | P1 | Pass |

**Original ID map:** FG_GATEIN_D_001–006 → TC01–TC06.
