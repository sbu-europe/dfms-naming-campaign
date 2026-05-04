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
| TC09 | Verify product add form required-field validation | Verify save is blocked and inline errors are shown when required fields (`product_sku_code`, `product_item_code`, `product_name`, `product_type`, `category`, `unit_of_measure`) are missing. | P1 | Planned |
| TC10 | Verify manual create uniqueness validation for SKU/item/name | Verify duplicate `product_sku_code`, `product_item_code`, or `product_name` on create is rejected with validation errors and no duplicate row is created. | P0 | Planned |
| TC11 | Verify conditional `weight_per_unit` requirement for UOM | Verify `weight_per_unit` is required when `unit_of_measure` is `Bag`, `Pieces`, or `Cartons`; save must fail when missing. | P0 | Planned |
| TC12 | Verify product can be saved without sub-category | Verify product creation succeeds when `category` is selected and `sub_category` is left blank (nullable relationship). | P1 | Planned |
| TC13 | Verify import upload rejects empty file selection | Verify submitting import form without `csv_file` shows error message and does not create a validation job. | P1 | Planned |
| TC14 | Verify import validation fails for missing required CSV headers | Verify CSV missing required columns is rejected during validation with clear missing-column error summary. | P0 | Planned |
| TC15 | Verify import validation rejects invalid enum choice values | Verify invalid `product_type`, `unit_of_measure`, or `preferred_vehicle_body_type` values are marked invalid in preview with choice errors. | P0 | Planned |
| TC16 | Verify import validation rejects invalid decimal fields | Verify non-decimal values in `weight_per_unit` or `amount` are marked invalid with decimal parsing errors. | P1 | Planned |
| TC17 | Verify import sub-category validation error paths | Verify preview marks row invalid when `sub_category_code` does not exist or belongs to a different category than `category_code`. | P0 | Planned |
| TC18 | Verify import confirm status guard blocks invalid transitions | Verify confirm action is rejected with an error when job status is not `PREVIEW_READY` (e.g., already completed/failed). | P1 | Planned |
| TC19 | Verify import confirm endpoint GET method behavior | Verify GET access to confirm URL redirects back to preview without starting import. | P2 | Planned |
| TC20 | Verify export trigger endpoint GET method behavior | Verify GET access to export trigger URL redirects to product changelist and does not create export job. | P2 | Planned |

## Alignment Notes

- Coverage maps to `ProductAdmin` implementation in `apps/master_data/admin.py` and bulk import/export via `BulkImportExportMixin`.
- Scenario list is aligned to current automated suite in `tests/e2e/modules/02-master-data/test_product_master_data_e2e.py` (8 implemented tests).
- Current UI behavior prevents mismatched category/sub-category pairings in normal interaction; negative-path validation is exercised via controlled form tampering to assert server-side enforcement.
- `weight_per_unit` rule is captured per current model behavior: required for `Bag`/`Pieces`/`Cartons`. Current implementation does not reject populated `weight_per_unit` for `Ton`/`KG`/`Liters`.
