---
module: 02-master-data
specification: Product Categories (MD_PCAT) — Playwright E2E Scenario Plan
version: 2.0
phase: Phase 1
related_stories: US-095
source_spec: ../../05-modules/02-master-data/
last_updated: 2026-07-23
playwright_mcp: true
suite: master-data-phase1-v2
last_mcp_run: 2026-07-23
last_mcp_verdict: 20/20 Pass
artifacts: tests/e2e/playwright-mcp/product-categories-artifacts/
---
# Product Categories — E2E Scenario Plan

> **2026-07-23 — All 20 test cases passed** (MD_PCAT_001–020). Suite signed off via Playwright MCP against Nourish admin.

**Last MCP run:** 2026-07-23 · **20/20 Pass** · `RUN_ID=3A8BC7AF`  
**Artifacts:** [`tests/e2e/playwright-mcp/product-categories-artifacts/RESULTS.md`](../../../../../tests/e2e/playwright-mcp/product-categories-artifacts/RESULTS.md)  
**Accounts:** Tenant Admin `admin.nourish@yopmail.com` (MD_PCAT_001–019); Depot Officer `depot.officer1.nourish@yopmail.com` (MD_PCAT_020).

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-07-23 | **20/20** | All test cases passed (Playwright MCP). `RUN_ID=3A8BC7AF`. |
| 2026-07-23 | **20/20** | Prior run — MD_PCAT_017 inactive filter fixed (`RUN_ID=BFF061E7`). |

## Test cases

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| MD_PCAT_001 | Navigate Add Category | Open `/admin/master_data/productcategory/` Add. Assert product_type, category_code, category_name, is_active (+ subcategory inline). | P2 | Pass |
| MD_PCAT_002 | Product Type mandatory | Blank product_type blocked. | P0 | Pass |
| MD_PCAT_003 | Category Code unique | Duplicate category_code rejected. | P0 | Pass |
| MD_PCAT_004 | Category Name mandatory | Blank name blocked. | P0 | Pass |
| MD_PCAT_005 | Active default | is_active defaults True. | P2 | Pass |
| MD_PCAT_006 | Happy path create | Create FG category; Active. | P0 | Pass |
| MD_PCAT_007 | Add Subcategory inline | From category change, add subcategory via inline; linked without separate nav. | P1 | Pass |
| MD_PCAT_008 | Sub Code mandatory inline | Blank sub_category_code blocked. | P0 | Pass |
| MD_PCAT_009 | Sub Name mandatory inline | Blank sub_category_name blocked. | P0 | Pass |
| MD_PCAT_010 | Import template | Download category CSV template. | P2 | Pass |
| MD_PCAT_011 | Import valid rows | Import 5 categories. | P1 | Pass |
| MD_PCAT_012 | Import invalid product_type | Invalid type fails. | P1 | Pass |
| MD_PCAT_013 | Import duplicate code | Duplicate fails. | P0 | Pass |
| MD_PCAT_014 | Export CSV | Export categories. | P2 | Pass |
| MD_PCAT_015 | Search/filter/pagination | Filter by product_type/status. | P2 | Pass |
| MD_PCAT_016 | Rename category | Edit name; save. | P1 | Pass |
| MD_PCAT_017 | Deactivate excludes from Product form | Inactive category not in Add Product category dropdown. | P0 | Pass |
| MD_PCAT_018 | Soft delete via Edit → Inactive | Open **Edit**, uncheck **Is active?**, Save. Assert remains Inactive. | P0 | Pass |
| MD_PCAT_019 | Hard delete blocked by products | Category with products; hard delete blocked. | P0 | Pass |
| MD_PCAT_020 | Depot Officer RBAC | Cannot mutate categories. | P0 | Pass |
## Implementation Notes (Playwright MCP + Django Admin SSR)

- URL: `/admin/master_data/productcategory/`
- Inline subcategories; bulk import yes.
- Wipe prefix: `MCP-MD-<RUN_ID>-` / `MCP-<TAG>-<RUN_ID>`
- Runner: `tests/e2e/playwright-mcp/product-categories-artifacts/run-product-categories.js`
