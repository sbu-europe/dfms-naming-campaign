---
module: 02-master-data
specification: Vehicle Brands (MD_VB) — Playwright E2E Scenario Plan
version: 2.0
phase: Phase 1
related_stories: US-053
source_spec: ../../05-modules/02-master-data/
last_updated: 2026-07-22
playwright_mcp: true
suite: master-data-phase1-v2
---
# Vehicle Brands — E2E Scenario Plan

## Test cases

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| MD_VB_001 | Navigate Add Brand | As Tenant Admin, open `/admin/master_data/brand/`, Add Brand. Assert Brand Name + Is active. | P2 | Planned |
| MD_VB_002 | Brand Name mandatory | Blank name; save blocked. | P0 | Planned |
| MD_VB_003 | Brand Name unique | Duplicate brand_name rejected. | P0 | Planned |
| MD_VB_004 | Create unique brand | Create MCP brand; default Active. | P0 | Planned |
| MD_VB_005 | Deactivate brand | Set inactive; excluded from vehicle brand autocomplete. | P0 | Planned |
| MD_VB_006 | Bulk import unique brands | Import 5 unique brands; all succeed. | P1 | Planned |
| MD_VB_007 | Bulk import duplicate fails | Duplicate brand row fails; others succeed. | P0 | Planned |
| MD_VB_008 | Export CSV | Export brand list; CSV contains names/status. | P2 | Planned |
| MD_VB_009 | Soft delete via Edit → Inactive | Open **Edit**, uncheck **Is active?**, Save. Assert remains Inactive. | P0 | Planned |
| MD_VB_010 | Hard delete blocked by vehicles | Brand used by vehicles; hard delete blocked with dep message. | P0 | Planned |
| MD_VB_011 | Active-only on Add Vehicle | Add Vehicle brand autocomplete shows only active brands. | P0 | Planned |
| MD_VB_012 | Depot Officer RBAC | Depot Officer cannot mutate brands. | P0 | Planned |
## Implementation Notes (Playwright MCP + Django Admin SSR)

- URL: `/admin/master_data/brand/`
- BrandAdmin; list_editable is_active.
- Wipe prefix: `MCP-MD-<RUN_ID>-`
- Delete SSOT: **Soft delete** = Edit → Inactive; **Hard delete** = Delete + reason when no deps (see delete-operations plan).

### Known drift (suite PDF → code)

| Topic | Suite v2 | Code / this plan |
|-------|----------|------------------|
| Menu label | Vehicle Brands | **Brands** |
