---
module: 02-master-data
specification: Products (MD_PROD) — Playwright E2E Scenario Plan
version: 2.0
phase: Phase 1
related_stories: US-095
source_spec: ../../05-modules/02-master-data/
last_updated: 2026-07-22
playwright_mcp: true
suite: master-data-phase1-v2
---
# Products — E2E Scenario Plan

## A — Create & validation

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| MD_PROD_001 | Navigate Add Product | Open `/admin/master_data/product/` Add. | P2 | Planned |
| MD_PROD_002 | Product Type mandatory | Blank product_type blocked. | P0 | Planned |
| MD_PROD_003 | FG categories only when FG | Set FG; category dropdown only FG categories. | P0 | Planned |
| MD_PROD_004 | RM categories only when RM | Set RM; only RM categories. | P0 | Planned |
| MD_PROD_005 | Category mandatory | Blank category blocked. | P0 | Planned |
| MD_PROD_006 | Subcategory optional (model) | Even if category has subs, blank sub_category may save (nullable). If UI enforces required when subs exist, assert that UI rule; note model allows null. | P0 | Planned |
| MD_PROD_007 | Save without sub when none | Category with zero subs; blank sub; succeeds. | P1 | Planned |
| MD_PROD_008 | Sub filters by category | AJAX `/admin/master_data/product/ajax/subcategories/` returns only that category's active subs. | P1 | Planned |
| MD_PROD_009 | SKU mandatory | Blank product_sku_code blocked. | P0 | Planned |
| MD_PROD_010 | Item code mandatory | Blank product_item_code blocked. | P0 | Planned |
| MD_PROD_011 | Name mandatory | Blank product_name blocked. | P0 | Planned |
| MD_PROD_012 | Description optional | Blank description; succeeds. | P3 | Planned |
| MD_PROD_013 | UOM mandatory | Blank unit_of_measure blocked. | P0 | Planned |
| MD_PROD_014 | UOM choices | Bag/Ton/KG/Liters/Pieces/Cartons (per model). | P2 | Planned |
| MD_PROD_015 | Weight required for Bag/Pieces/Cartons | For Bag UOM, blank weight_per_unit blocked. | P0 | Planned |
| MD_PROD_016 | Weight rejects 0/negative | Invalid weight rejected. | P1 | Planned |
| MD_PROD_017 | Pack size optional | Blank standard_pack_size; succeeds. | P3 | Planned |
| MD_PROD_018 | Barcode optional | Blank barcode; succeeds. | P3 | Planned |
| MD_PROD_019 | Manufacturer/handling optional | Blank; succeeds. | P3 | Planned |
| MD_PROD_020 | Preferred body optional | Blank; succeeds. | P2 | Planned |
| MD_PROD_021 | Preferred body choices | Assert body type choices. | P2 | Planned |
| MD_PROD_022 | Requires QC present | requires_qc checkbox present with default. | P2 | Planned |
| MD_PROD_023 | Requires QC honored in RM | RM product with requires_qc; after dest scale-in, TO flagged for QC (cross-module; may demote if too heavy). | P1 | Planned |
| MD_PROD_024 | Active default | is_active defaults True. | P2 | Planned |
| MD_PROD_025 | FG happy path | Create FG with required fields. | P0 | Planned |
| MD_PROD_026 | RM happy path | Create RM with required fields. | P0 | Planned |
## B — Bulk / read / update / delete / RBAC

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| MD_PROD_027 | Import template | Download product CSV template. | P2 | Planned |
| MD_PROD_028 | Import mixed FG/RM | Import 5 valid mixed rows. | P1 | Planned |
| MD_PROD_029 | Import type/category mismatch fails | FG type + RM category fails. | P0 | Planned |
| MD_PROD_030 | Import sub validation | Invalid/mismatched sub_category_code fails. | P1 | Planned |
| MD_PROD_031 | Export filtered | Filter RM; export matches. | P2 | Planned |
| MD_PROD_032 | Search/filter/pagination | Exercise list ops. | P2 | Planned |
| MD_PROD_033 | Update category/weight | Edit; save (SKU/item/type readonly after create). | P1 | Planned |
| MD_PROD_034 | Deactivate excludes from PR/TR/TO | Inactive product not selectable. | P0 | Planned |
| MD_PROD_035 | Soft delete via Edit → Inactive | Open **Edit**, uncheck **Is active?**, Save. Assert remains Inactive. | P0 | Planned |
| MD_PROD_036 | Hard delete blocked by PR | Deps block hard delete. | P0 | Planned |
| MD_PROD_037 | Depot Officer RBAC | Cannot mutate products. | P0 | Planned |
## Implementation Notes (Playwright MCP + Django Admin SSR)

- URL: `/admin/master_data/product/`
- weight_per_unit required for Bag/Pieces/Cartons; SKU/item/type readonly after save.
- Wipe prefix: `MCP-MD-<RUN_ID>-`

### Known drift (suite PDF → code)

| Topic | Suite v2 | Code / this plan |
|-------|----------|------------------|
| Sub-Category | Required when category has subs | Model nullable; UI/AJAX may still guide selection — assert actual admin |
| Weight always mandatory | Suite always mandatory | Conditional on UOM |
