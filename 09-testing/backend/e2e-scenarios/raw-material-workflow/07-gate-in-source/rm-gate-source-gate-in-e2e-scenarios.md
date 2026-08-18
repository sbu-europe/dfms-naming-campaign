---
module: 06-yard-operations
specification: Raw Materials Workflow — Section 7 — Gate In (Source POI) — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: GT-01
source_spec: ../../../../../05-modules/06-yard-operations/gate-operations.md
last_updated: 2026-08-17
playwright_mcp: true
last_mcp_run: 2026-08-17
last_mcp_verdict: 5/8 Pass · 3 Planned
artifacts: tests/e2e/playwright-mcp/rm-07-11-source-yard-artifacts/
---

# Raw Materials Workflow — Section 7 — Gate In (Source POI) — E2E Scenario Plan (Django Admin SSR)


**Last MCP run:** 2026-08-17 · **5/8 Pass · 3 Planned** · `RUN_ID=C4E217A8`  
**Chain:** `PS-PORT-20260817-0003` → `TR-PORT-20260817-0004` → `TO-20260817-0004` → **Closed**  
**Artifacts:** [`tests/e2e/playwright-mcp/rm-07-11-source-yard-artifacts/RESULTS.md`](../../../../../tests/e2e/playwright-mcp/rm-07-11-source-yard-artifacts/RESULTS.md)  
**Navigation:** Gate → **Vehicle Entry (Gate-In)** → Add (`/admin/operations/gatein/add/`)

Scope: **Gateman** (source POI / port) recording gate-in for RM TO in **Driving Towards Source**.

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Source Gateman records Gate-In | RM TO **Driving Towards Source** at source POI. As **Gateman** (`gateman1.nourish@yopmail.com`, working site = source/port POI), **Gate → Vehicle Entry (Gate-In) → Add**. Select TO, complete mandatory fields, submit. Assert TO **At Source** (`at_source`); `GateVisitSession` created. | P0 | Pass |
| TC02 | Gate-In blocked before Driving Towards Source | TO **Assigned** or **Ready for Dispatch**. Gate-In add blocked / TO not in eligible queryset. | P0 | Planned |
| TC03 | Vehicle registration validated against TO | Enter registration mismatching assigned vehicle. Expected: validation error. | P1 | Planned |
| TC04 | Mandatory field validation | Submit Gate-In with blank required field. `.errorlist`; no visit. | P0 | Planned |
| TC05 | Discrepancy remarks at Gate-In | Enter **remarks**; submit. Assert remarks on Gate-In / visit history. | P1 | Pass |
| TC06 | RBAC — Driver cannot Gate-In | **Driver** role: **Gate** menu absent; direct add URL denied. | P0 | Pass |
| TC07 | Audit Gate-In event | After TC01, Gate-In record / admin log shows user, timestamp, TO ref. | P1 | Pass |
| TC08 | Gate-In displays TO details | Gate-In form shows product, quantity, source/destination POI matching RM TO. | P1 | Pass |

## Implementation Notes

- Mirror FG §7; eligible status `driving_towards_source` for `rm_inbound` source leg.
- **Original ID map:** RM_067–RM_074 → TC01–TC08.

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-08-17 | **5/8 Pass** | Playwright MCP; see `tests/e2e/playwright-mcp/rm-07-11-source-yard-artifacts/RESULTS.md`. Happy-path chain on MCP sandbox. |
