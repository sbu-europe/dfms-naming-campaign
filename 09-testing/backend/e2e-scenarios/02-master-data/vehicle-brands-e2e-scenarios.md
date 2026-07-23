---
module: 02-master-data
specification: Vehicle Brands (MD_VB) — Playwright E2E Scenario Plan
version: 2.1
phase: Phase 1
related_stories: US-053
source_spec: ../../05-modules/02-master-data/
last_updated: 2026-07-23
playwright_mcp: true
suite: master-data-phase1-v2
last_mcp_run: 2026-07-23
last_mcp_verdict: 12/12 Pass
artifacts: tests/e2e/playwright-mcp/vehicle-brands-artifacts/
---
# Vehicle Brands — E2E Scenario Plan

> **2026-07-23 — All 12 test cases passed** (MD_VB_001–012). Suite signed off via Playwright MCP against Nourish admin.

**Last MCP run:** 2026-07-23 · **12/12 Pass** · `RUN_ID=65A50D28`  
**Artifacts:** [`tests/e2e/playwright-mcp/vehicle-brands-artifacts/RESULTS.md`](../../../../../tests/e2e/playwright-mcp/vehicle-brands-artifacts/RESULTS.md)  
**Accounts:** Tenant Admin `admin.nourish@yopmail.com` (MD_VB_001–011); Depot Officer `depot.officer1.nourish@yopmail.com` (MD_VB_012).

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-07-23 | **12/12** | All test cases passed (Playwright MCP). |

## Test cases

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| MD_VB_001 | Navigate Add Brand | As Tenant Admin, open `/admin/master_data/brand/`, Add Brand. Assert Brand Name + Is active. | P2 | Pass |
| MD_VB_002 | Brand Name mandatory | Blank name; save blocked. | P0 | Pass |
| MD_VB_003 | Brand Name unique | Duplicate brand_name rejected. | P0 | Pass |
| MD_VB_004 | Create unique brand | Create MCP brand; default Active. | P0 | Pass |
| MD_VB_005 | Deactivate brand | Set inactive; excluded from vehicle brand autocomplete. | P0 | Pass |
| MD_VB_006 | Bulk import unique brands | Import 5 unique brands; all succeed. | P1 | Pass |
| MD_VB_007 | Bulk import duplicate fails | Duplicate brand row fails; others succeed. | P0 | Pass |
| MD_VB_008 | Export CSV | Export brand list; CSV contains names/status. | P2 | Pass |
| MD_VB_009 | Soft delete via Edit → Inactive | Open **Edit**, uncheck **Is active?**, Save. Assert remains Inactive. | P0 | Pass |
| MD_VB_010 | Hard delete blocked by vehicles | Brand used by vehicles; hard delete blocked with dep message. | P0 | Pass |
| MD_VB_011 | Active-only on Add Vehicle | Add Vehicle brand autocomplete shows only active brands. | P0 | Pass |
| MD_VB_012 | Depot Officer RBAC | Depot Officer cannot mutate brands. | P0 | Pass |

## Implementation Notes (Playwright MCP + Django Admin SSR)

- URL: `/admin/master_data/brand/` (menu label **Brands**, not “Vehicle Brands”).
- BrandAdmin; `list_editable` `is_active`.
- Wipe prefix: `MCP-MD-<RUN_ID>-`
- Delete SSOT: **Soft delete** = Edit → Inactive; **Hard delete** = Delete + reason when no deps (see delete-operations plan).
- Runner: `tests/e2e/playwright-mcp/vehicle-brands-artifacts/run-vehicle-brands.js`
- Import CSV columns: `brand_name,is_active` (on-disk files under artifacts; MCP VM has no `Buffer`/`TextEncoder`).

### Autocomplete assertion (MD_VB_005 / MD_VB_011)

Use AdminSite FK autocomplete (Vehicle → brand), not the Brand model path:

| Use | URL |
|-----|-----|
| **Assert** | `/admin/autocomplete/?app_label=master_data&model_name=vehicle&field_name=brand&term=…` → JSON `results` |
| **Do not use** | `/admin/master_data/brand/autocomplete/` → HTML (not JSON) |

`BrandAdmin.get_search_results` filters `is_active=True` when `request.path` ends with `/autocomplete/`.

### Known drift (suite PDF → code)

| Topic | Suite v2 | Code / this plan |
|-------|----------|------------------|
| Menu label | Vehicle Brands | **Brands** |
