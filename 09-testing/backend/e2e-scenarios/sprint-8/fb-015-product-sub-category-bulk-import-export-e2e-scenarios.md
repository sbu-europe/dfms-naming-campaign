---
module: sprint-8
specification: FB-007 — Product Sub-Category bulk import & export available — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: FB-007
source_spec: ../../../../03-backlog/sprints/sprint-8/feedback.md
implementation_reference:
  - ../../../../../apps/master_data/import_configs.py (ProductSubCategoryImportConfig)
  - ../../../../../apps/master_data/admin.py (ProductSubCategoryBulkAdmin, BulkImportExportMixin)
  - ../../../../../apps/master_data/models.py (ProductSubCategory)
  - ../../../../../templates/admin/master_data/bulk_import_upload.html
  - ../../../../../templates/admin/master_data/bulk_import_preview.html
  - ../../../../../templates/admin/master_data/bulk_import_status.html
  - ../../../../../templates/admin/master_data/bulk_export_status.html
last_updated: 2026-08-04
last_mcp_run: 2026-08-04
last_mcp_verdict: 11/11 Pass
artifacts: tests/e2e/playwright-mcp/fb-015-product-sub-category-bulk-import-export-artifacts/
playwright_mcp: true
---

# Sprint 8 — FB-007 — Product Sub-Category: bulk import & export — E2E Scenario Plan (Django Admin SSR)

> **2026-08-04 — All 11 test cases passed** (TC01–TC11). Suite signed off via Playwright MCP against Nourish admin.

**Last MCP run:** 2026-08-04 · **11/11 Pass** · [RESULTS.md](../../../../../tests/e2e/playwright-mcp/fb-015-product-sub-category-bulk-import-export-artifacts/RESULTS.md)  
**Accounts:** `admin.nourish@yopmail.com` · **Depot Officer:** `depot.officer1.nourish@yopmail.com` · **RUN_ID:** `5374558B` · **SEED_CAT:** `CAT-001` / `CAT-01`

**Feedback:** [FB-007](../../../../03-backlog/sprints/sprint-8/feedback.md#fb-007--product-sub-category-bulk-operation-missing)

**AC (assert after fix):**

1. Product Sub-Category SHALL offer **bulk import** (template download, validate, import) consistent with other master-data menus.
2. Product Sub-Category SHALL offer **bulk export**.
3. A single parent category MAY own **multiple** sub-categories (1:N); bulk import MUST allow several distinct `sub_category_code` rows with the same `category_code`.

Target runner: **Playwright MCP** against seeded Nourish (`docs/guides/playwright-mcp-admin.md`).

**Expected CSV columns** (`ProductSubCategoryImportConfig.get_csv_headers()`):

| Column | Required | Notes |
|--------|----------|-------|
| `sub_category_code` | Yes | Tenant-unique (model `unique=True`); max 20 chars; upsert key |
| `sub_category_name` | Yes | Display label |
| `category_code` | Yes | Existing `ProductCategory.category_code` (case-insensitive); not a UUID column; **same value may appear on many rows** (1:N) |
| `is_active` | No | Default `true` |

Identity / upsert key: **`sub_category_code`** (not composite with category). One category → many sub-categories is expected. Export queryset: **active** sub-categories only (`is_active=True`), ordered stably (e.g. by `category__category_code`, `sub_category_code`).

---

## Seed prerequisites

| Item | Notes |
|------|--------|
| Actor | **Tenant Admin** (`admin.nourish@yopmail.com`) — ProductCategory Write + bulk I/O |
| Celery | Worker running (`validate_bulk_import` / `execute_bulk_import` / export generate); **restart after registering new import configs** |
| Wipe prefix | `MCP-FB015-` / `MCP-F15` / `MCP FB015` |
| Parent category | Use an **active** seed category (or create `MCP-FB015-CAT-<RUN_ID>` via Category Add / bulk) as `SEED_CATEGORY_CODE` |
| Unique codes | Use `RUN_ID` (e.g. 8 hex) in every `sub_category_code` / name; keep codes ≤20 chars |

Minimal valid create row:

`sub_category_code`, `sub_category_name`, `category_code=<SEED_CATEGORY_CODE>`

---

## A — Bulk I/O surface & template

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Changelist shows Import and Export | As **Tenant Admin** (`admin.nourish@yopmail.com` / `NourishAdmin@1234!`), log in at `/admin/login/`, open **Master Data → Product Sub-category** (`/admin/master_data/productsubcategory/`). Assert changelist loads and **Import** and **Export** actions/links are visible (same pattern as Product Category / POI / Loading-Unloading bulk I/O). | P0 | Pass |
| TC02 | Import page lists required + optional columns | Click **Import**. Assert upload page `/admin/master_data/productsubcategory/import/` with heading matching verbose plural (e.g. **Import product sub categories**). Under **Required Columns**, assert `<code>sub_category_code</code>`, `<code>sub_category_name</code>`, `<code>category_code</code>`. Under **Optional Columns**, assert `<code>is_active</code>`. | P0 | Pass |
| TC03 | CSV template headers match config | Still on the Import page, click **Download CSV Template** (`?template=1`). Assert downloaded filename contains `productsubcategory_import_template` and header row includes exactly: `sub_category_code`, `sub_category_name`, `category_code`, `is_active`. | P0 | Pass |

## B — Import happy path

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC04 | Create sub-category via import | As **Tenant Admin**, build a 1-row CSV with `sub_category_code=MCP-FB015-S-<RUN_ID>`, `sub_category_name=MCP FB015 Sub <RUN_ID>`, `category_code=<SEED_CATEGORY_CODE>`. Upload via **CSV File** → **Upload and Validate**. Wait until **Import Preview** shows **Valid** = 1. Click **Import 1 Valid Rows**. Wait for **Import Complete** (`completed`) and **Records Imported** ≥ 1. Open `/admin/master_data/productsubcategory/?q=MCP-FB015-S-<RUN_ID>`. Assert one row: code / name match, parent category is `SEED_CATEGORY_CODE`, Active. | P0 | Pass |
| TC05 | Same category owns multiple sub-categories | As **Tenant Admin**, upload a **2-row** CSV where both rows use the same `category_code=<SEED_CATEGORY_CODE>` but distinct codes `sub_category_code=MCP-FB015-A-<RUN_ID>` and `MCP-FB015-B-<RUN_ID>` with names `MCP FB015 Multi A <RUN_ID>` / `MCP FB015 Multi B <RUN_ID>`. Preview **Valid** = 2 → **Import 2 Valid Rows** → **Import Complete** with **Records Imported** ≥ 2. Filter changelist by parent category / search `MCP-FB015-A-<RUN_ID>` and `MCP-FB015-B-<RUN_ID>`: assert **both** rows exist, both Active, both parented to `SEED_CATEGORY_CODE` (1:N — one category, multiple subs). | P0 | Pass |
| TC06 | Upsert updates name and category | Re-import a CSV for the same `sub_category_code=MCP-FB015-S-<RUN_ID>` with `sub_category_name=MCP FB015 Renamed <RUN_ID>` and a different **active** `category_code=<SEED_CATEGORY_CODE_B>` (second active category). Preview **Valid** = 1 → import → complete. Open the change form for that code. Assert **Sub category name** updated and **Category** points at `SEED_CATEGORY_CODE_B`; code unchanged. | P0 | Pass |

## C — Validation negatives

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC07 | Unknown category_code rejected at preview | Upload a 1-row CSV with `category_code=MCP-FB015-MISSING-<RUN_ID>` (must not exist), unique `sub_category_code=MCP-F15-BP-<RUN_ID>`, valid name. After preview ready, assert row **Invalid**, Errors mention `category_code` / category does not exist, and confirm is **Import 0 Valid Rows** (disabled). Assert no sub-category created for that code. | P0 | Pass |
| TC08 | Missing required columns rejected | Upload a 1-row CSV missing `sub_category_name` (or blank) with otherwise unique code and valid `category_code`. After preview, assert **Invalid**, Errors mention `sub_category_name` required, **Import 0 Valid Rows**. | P1 | Pass |
| TC09 | Inactive parent category rejected | Ensure inactive category `MCP-F15I-<RUN_ID>` exists (≤20 chars). Upload a row with that `category_code`, unique `sub_category_code=MCP-F15-IB-<RUN_ID>`, valid name, `is_active=true` (or omit). After preview, assert **Invalid** with error about inactive / cannot use inactive category (parity with admin Add dropdown), and no row created. | P1 | Pass |

## D — Export round-trip

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC10 | Export CSV includes headers and imported rows | As **Tenant Admin**, ensure active rows from **TC04/TC05/TC06** exist. From `/admin/master_data/productsubcategory/`, click **Export**. Wait for **Export Complete**, then **Download CSV**. Assert header row includes `sub_category_code`, `sub_category_name`, `category_code`, `is_active`. Assert a row for `sub_category_code=MCP-FB015-S-<RUN_ID>` with updated name/`category_code` from TC06; assert **both** `MCP-FB015-A-<RUN_ID>` and `MCP-FB015-B-<RUN_ID>` appear with the same `category_code=<SEED_CATEGORY_CODE>`. | P0 | Pass |

## E — Cross-role (optional guard)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC11 | Depot Officer cannot use bulk I/O | As **Depot Officer** (`depot.officer1.nourish@yopmail.com`), open `/admin/master_data/productsubcategory/`. Assert **Import** / **Export** are not available (hidden or denied), matching read-only MDM behaviour for Product Sub-Category. | P1 | Pass |

---

## Implementation Notes (Playwright MCP + Django Admin SSR)

### Scope guardrails

- In scope: Product Sub-Category changelist **Import** / **Export** SSR (`BulkImportExportMixin`); template headers; create + upsert import; **1:N** same-`category_code` multi-row import; `category_code` FK resolution; export columns for **active** rows.
- Out of scope: REST `/bulk-imports/`; single-row Add/Edit/Delete/RBAC covered by [`product-subcategories-e2e-scenarios.md`](../02-master-data/product-subcategories-e2e-scenarios.md); Product bulk import `sub_category_code` column (FB-006 / Product I/O); Category bulk I/O.

### Role & environment fixtures

| Item | Value |
|------|--------|
| Tenant | `http://nourish.dev.dfms.local:8000` |
| Login | `/admin/login/` |
| Primary actor | `admin.nourish@yopmail.com` / `NourishAdmin@1234!` |
| Read-only actor (TC11) | `depot.officer1.nourish@yopmail.com` |
| Credentials | `docs/testing/playwright-mcp-credentials.yaml` |
| Celery | Required for validate / execute / export |

### Admin URLs & selectors

| Surface | Path / selector |
|---------|-----------------|
| Sub-category changelist | `/admin/master_data/productsubcategory/` |
| Import upload | `/admin/master_data/productsubcategory/import/` |
| Import preview | `/admin/master_data/productsubcategory/import/<job_id>/` |
| Export trigger | changelist **Export** → `/admin/master_data/productsubcategory/export/` |
| Template download | `/admin/master_data/productsubcategory/import/?template=1` |
| CSV file input | `#csv_file` |
| Required / optional columns | `.dfms-column-list--required code` / `.dfms-column-list--optional code` |
| Changelist | `#result_list` |
| Import confirm | button text **Import N Valid Rows** |
| Import done | heading **Import Complete**; **Records Imported** |
| Export done | heading **Export Complete**; link **Download CSV** |

### Known implementation alignment

- Registry key: `productsubcategory` → `ProductSubCategoryImportConfig`.
- Upsert on `sub_category_code`; CSV uses `category_code` (resolved to `category` FK), same pattern as `ProductImportConfig` / `SitePoiImportMixin`.
- **1:N:** do **not** treat `(category_code, sub_category_code)` as a composite unique key; repeated `category_code` across rows is valid (TC05).
- Model uniqueness is **global** per tenant (`sub_category_code` unique=True) — not “unique within category” (see MD_PSUB suite drift note).
- Permissions reuse `MasterData.ProductCategory.Read` / `.Write` (same as current `ProductSubCategoryAdmin`).
- TC11: Depot Officer receives **403** on `/admin/master_data/productsubcategory/` (no Read), which satisfies “cannot use bulk I/O”.
- Manual CRUD scenarios remain in [`product-subcategories-e2e-scenarios.md`](../02-master-data/product-subcategories-e2e-scenarios.md); this plan is **FB-007-only**.

### Suggested artifacts

`tests/e2e/playwright-mcp/fb-015-product-sub-category-bulk-import-export-artifacts/` + runner `run-fb015.js` via Playwright MCP `browser_run_code_unsafe` (wipe `MCP-FB015-*` / `MCP-F15*` after suite).

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-08-04 | **11/11** | All test cases passed (Playwright MCP). RUN_ID=`5374558B`. SEED_CAT=`CAT-001`/`CAT-01`. |
