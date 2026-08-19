---
module: 06-yard-operations
specification: Raw Materials Workflow — Section 15 — Command Center (Destination) Bay Assignment — Playwright E2E Scenario Plan
version: 1.1
phase: Phase 1
related_stories: CC-01, QC-01, FB-013
source_spec: ../../../../../05-modules/06-yard-operations/command-center-queue.md
last_updated: 2026-08-17
playwright_mcp: true
last_mcp_run: 2026-08-17
last_mcp_verdict: 3/8 Pass · 5 Planned
artifacts: tests/e2e/playwright-mcp/rm-12-17-dest-yard-artifacts/
---

# Raw Materials Workflow — Section 15 — Command Center (Destination) — Bay & Unloading Point — E2E Scenario Plan


**Last MCP run:** 2026-08-17 · **3/8 Pass · 5 Planned** · `RUN_ID=C4E217A8`  
**Chain:** `PS-PORT-20260817-0003` → `TR-PORT-20260817-0004` → `TO-20260817-0004` → **Closed**  
**Artifacts:** [`tests/e2e/playwright-mcp/rm-12-17-dest-yard-artifacts/RESULTS.md`](../../../../../tests/e2e/playwright-mcp/rm-12-17-dest-yard-artifacts/RESULTS.md)  
**Navigation:** Command Center → **Bay Assignment** → Add (destination site)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | CC views QC-passed queue | Sub-state **Waiting for Command Center** after QC Pass (or non-QC Scale-In). CC queue lists TO. | P0 | Pass |
| TC02 | Add Bay Assignment — select TO, unloading point | **Bay Assignment → Add**, select TO (details auto-populate read-only), select **Unloading Point**, save. Sub-state **Assigned Unloading Point**. | P0 | Pass |
| TC03 | Bay Assignment allowed after QC Fail (FB-013) | TO with QC **Fail** and `qc_failed_quantity` set (§14 TC05). As CC Officer, assert TO **is eligible** for unloading bay assignment (`qc_passed` is not null). Contrast: pending QC still blocked (TC04). | P0 | Planned |
| TC04 | Bay Assignment blocked while Sampling Started | QC decision not yet submitted (sub-state **Sampling Started** / `qc_passed` null). Blocked. | P0 | Planned |
| TC05 | Multiple unloading points | Assign two unloading points; both tracked. | P1 | Planned |
| TC06 | Non-QC product proceeds without QC steps | Non-QC RM TO after Scale-In → **Waiting for Command Center** → bay assignment succeeds without QC sample. | P0 | Planned |
| TC07 | RBAC — Driver denied destination Bay Assignment | Driver blocked. | P0 | Planned |
| TC08 | Audit destination bay assignment | User + timestamp on assignment record. | P1 | Pass |

## Implementation Notes

- **FB-013 / CC eligibility:** `CCService.eligible_for_bay_assignment` blocks only when `requires_qc` and `qc_passed is None`. Pass **or** Fail (decision recorded) allows assign.
- Cross-ref §14 TC15–TC17 for QC pending / Pass / Fail gates.
- **Original ID map:** RM_141–RM_148 → TC01–TC08 (TC03 expectation updated 2026-08-10 for FB-013).

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-08-17 | **3/8 Pass** | Playwright MCP; see `tests/e2e/playwright-mcp/rm-12-17-dest-yard-artifacts/RESULTS.md`. Happy-path chain on MCP sandbox. |
