---
module: 02-master-data
specification: Product Master Data Management - E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: US-095
source_spec: ../../03-module-specifications/02-master-data/product-master-data-management.md
last_updated: 2026-04-23
---

# Product Master Data - E2E Scenario Plan

## Test Cases (`ProductBulkAdmin` / `ProductCategoryBulkAdmin`)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Verify product create flow with category/sub-category linkage | Verify admin can create Product Category and Product Sub-Category, create Product with valid references, then find it in changelist by SKU. | P0 | Automated (Implemented) |
| TC02 | Verify restricted field behavior on change form | Verify `product_sku_code`, `product_item_code`, `unit_of_measure`, and `product_type` are non-editable on product change form after initial save. | P0 | Automated (Implemented) |
| TC03 | Verify category-sub-category relationship validation against tampered input | Verify server-side form validation blocks save when an injected foreign sub-category does not belong to selected category and shows inline error. | P0 | Automated (Implemented) |
| TC04 | Verify dependent sub-category AJAX endpoint | Verify `/admin/master_data/product/ajax/subcategories/` returns only active sub-categories for selected category and excludes inactive ones. | P1 | Automated (Implemented) |
| TC05 | Verify product changelist search, filter, and ordering | Verify product changelist supports search by SKU/item/name and supports `is_active`, `requires_qc` filters plus ordering via query params. | P0 | Automated (Implemented) |
| TC06 | Verify product import template/sample, upload validation, preview, and confirm lifecycle | Verify template/sample downloads, non-CSV upload rejection, mixed valid/invalid preview totals, and post-confirm import behavior (valid rows imported, invalid rows skipped). | P0 | Automated (Implemented) |
| TC07 | Verify duplicate SKU import does not overwrite existing product | Verify importing duplicate `product_sku_code` is rejected in preview, import action is disabled, and existing product values remain unchanged. | P0 | Automated (Implemented) |
| TC08 | Verify export status/download flow and admin route authentication guards | Verify export trigger/status/download flow works and unauthenticated access to product changelist/import/export routes redirects to admin login. | P0 | Automated (Implemented) |

## Alignment Notes

- Coverage maps to `ProductAdmin` implementation in `apps/master_data/admin.py` and bulk import/export via `BulkImportExportMixin`.
- Scenario list is aligned to current automated suite in `tests/e2e/modules/test_product_master_data_e2e.py` (8 implemented tests).
- Current UI behavior prevents mismatched category/sub-category pairings in normal interaction; negative-path validation is exercised via controlled form tampering to assert server-side enforcement.
