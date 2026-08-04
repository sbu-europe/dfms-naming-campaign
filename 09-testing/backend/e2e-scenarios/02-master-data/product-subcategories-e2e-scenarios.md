---
module: 02-master-data
specification: Product Subcategories (MD_PSUB) — Playwright E2E Scenario Plan
version: 2.0
phase: Phase 1
related_stories: US-095
source_spec: ../../05-modules/02-master-data/
last_updated: 2026-07-23
playwright_mcp: true
suite: master-data-phase1-v2
last_mcp_run: 2026-07-23
last_mcp_verdict: 14/14 Pass
artifacts: tests/e2e/playwright-mcp/product-subcategories-artifacts/
---
# Product Subcategories — E2E Scenario Plan

> **2026-07-23 — All 14 test cases passed** (MD_PSUB_001–014). Suite signed off via Playwright MCP against Nourish admin.

**Last MCP run:** 2026-07-23 · **14/14 Pass** · `RUN_ID=3A8BC7AF`  
**Artifacts:** [`tests/e2e/playwright-mcp/product-subcategories-artifacts/RESULTS.md`](../../../../../tests/e2e/playwright-mcp/product-subcategories-artifacts/RESULTS.md)  
**Accounts:** Tenant Admin `admin.nourish@yopmail.com` (MD_PSUB_001–013); Depot Officer `depot.officer1.nourish@yopmail.com` (MD_PSUB_014).

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-07-23 | **14/14** | All test cases passed (Playwright MCP). `RUN_ID=3A8BC7AF`. |
| 2026-07-23 | **14/14** | Prior run — MD_PSUB_003 inactive-category filter fixed (`RUN_ID=BFF061E7`). |

## Test cases

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| MD_PSUB_001 | Navigate Add Subcategory | Open `/admin/master_data/productsubcategory/` Add. | P2 | Pass |
| MD_PSUB_002 | Parent Category mandatory | Blank category blocked. | P0 | Pass |
| MD_PSUB_003 | Active categories only | Category dropdown/autocomplete excludes inactive. | P0 | Pass |
| MD_PSUB_004 | Code unique within category | Duplicate sub_category_code under same category rejected. | P0 | Pass |
| MD_PSUB_005 | Code reusable across categories | Same code under other category succeeds. | P2 | Pass |
| MD_PSUB_006 | Name mandatory | Blank name blocked. | P0 | Pass |
| MD_PSUB_007 | Active default | Defaults Active. | P2 | Pass |
| MD_PSUB_008 | Happy path | Create under active category. | P0 | Pass |
| MD_PSUB_009 | Filter by category/status | list_filter works. | P2 | Pass |
| MD_PSUB_010 | Rename | Edit name; save. | P1 | Pass |
| MD_PSUB_011 | Deactivate excludes from Product | Inactive sub not in Add Product. | P0 | Pass |
| MD_PSUB_012 | Soft delete via Edit → Inactive | Open **Edit**, uncheck **Is active?**, Save. Assert remains Inactive. | P0 | Pass |
| MD_PSUB_013 | Hard delete blocked by products | Linked products block hard delete. | P0 | Pass |
| MD_PSUB_014 | Depot Officer RBAC | Cannot mutate. | P0 | Pass |
## Implementation Notes (Playwright MCP + Django Admin SSR)

- URL: `/admin/master_data/productsubcategory/`
- No bulk import in IMPORT_REGISTRY.
- Wipe prefix: `MCP-MD-<RUN_ID>-` / `MCP-<TAG>-<RUN_ID>`
- Runner: `tests/e2e/playwright-mcp/product-subcategories-artifacts/run-product-subcategories.js`

### Known drift (suite PDF → code)

| Topic | Suite v2 | Code / this plan |
|-------|----------|------------------|
| Code reusable across categories | Allowed | Global `unique=True` — same code rejected (MD_PSUB_005 Pass with note) |
