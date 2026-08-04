---
module: sprint-8
specification: FB-006 — Product bulk operation: remove redundant Amount column from template — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: FB-006
source_spec: ../../../../03-backlog/sprints/sprint-8/improvements/02-master-data.md
implementation_reference:
  - ../../../../../apps/master_data/import_configs.py (ProductImportConfig)
  - ../../../../../apps/master_data/admin.py (ProductAdminForm exclude amount, ProductBulkAdmin)
  - ../../../../../apps/master_data/models.py (Product.amount — DB field retained)
  - ../../../../../templates/admin/master_data/bulk_import_upload.html
  - ../../../../../templates/admin/master_data/bulk_import_preview.html
  - ../../../../../templates/admin/master_data/bulk_import_status.html
  - ../../../../../templates/admin/master_data/bulk_export_status.html
last_updated: 2026-08-04
last_mcp_run: 2026-08-04
last_mcp_verdict: 6/6 Pass
artifacts: tests/e2e/playwright-mcp/fb-014-product-bulk-remove-amount-column-artifacts/
playwright_mcp: true
---

# Sprint 8 — FB-006 — Product bulk: remove Amount column — E2E Scenario Plan (Django Admin SSR)

> **2026-08-04 — All 6 test cases passed** (TC01–TC06). Suite signed off via Playwright MCP against Nourish admin.

**Last MCP run:** 2026-08-04 · **6/6 Pass** · [RESULTS.md](../../../../../tests/e2e/playwright-mcp/fb-014-product-bulk-remove-amount-column-artifacts/RESULTS.md)  
**Accounts:** `admin.nourish@yopmail.com` · **RUN_ID:** `3CA1A949` · **SEED_CAT:** `CAT-001`

**Improvement:** [FB-006](../../../../03-backlog/sprints/sprint-8/improvements/02-master-data.md#fb-006--product-bulk-operation--remove-redundant-amount-column-from-template)

**AC (assert after fix):**

1. Product **bulk import template** SHALL **not** include an **Amount** / `amount` column.
2. Import / validate SHALL **not** require or map an Amount field (parity with `ProductAdminForm`, which already `exclude`s `amount`).

Target runner: **Playwright MCP** against seeded Nourish (`docs/guides/playwright-mcp-admin.md`).

**Expected CSV columns after fix** (`ProductImportConfig.get_csv_headers()` — no `amount`):

| Column | Required | Notes |
|--------|----------|-------|
| `product_sku_code` | Yes | Unique lookup / upsert key |
| `product_item_code` | Yes | |
| `product_name` | Yes | |
| `product_type` | Yes | Enum (e.g. `FinishedGoods`) |
| `category_code` | Yes | Existing category |
| `sub_category_code` | No | Must belong to category when set |
| `unit_of_measure` | Yes | Enum |
| `weight_per_unit` | No | Decimal |
| `standard_pack_size` | No | |
| `description` | No | |
| `barcode_ean` | No | |
| `manufacturer_name` | No | |
| `preferred_vehicle_body_type` | No | Enum |
| `special_handling_requirements` | No | |
| `requires_qc` | No | Default `false` |
| `is_active` | No | Default `true` |

Identity / upsert key: **`product_sku_code`**. Export uses the same headers (so `amount` must also be absent from export CSV after the config change).

---

## Seed prerequisites

| Item | Notes |
|------|--------|
| Actor | **Tenant Admin** (`admin.nourish@yopmail.com`) — Product write + bulk I/O |
| Celery | Worker running (`validate_bulk_import` / `execute_bulk_import` / export generate) |
| Wipe prefix | `MCP-FB014-` / `MCP FB014` |
| Category | Seed or create an active FG category; use its `category_code` in CSV rows |
| Unique SKUs | Use `RUN_ID` (e.g. 8 hex) in every `product_sku_code` / `product_item_code` / `product_name` |

Minimal valid create row (no `amount`):

`product_sku_code`, `product_item_code`, `product_name`, `product_type=FinishedGoods`, `category_code=<existing>`, `unit_of_measure=KG`

---

## A — Template & column lists (no amount)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Import page columns omit amount | As **Tenant Admin** (`admin.nourish@yopmail.com` / `NourishAdmin@1234!`), log in at `/admin/login/`, open **Master Data → Products** (`/admin/master_data/product/`). Click **Import**. Assert upload page `/admin/master_data/product/import/` with heading **Import products** (or equivalent verbose plural). Under **Required Columns** and **Optional Columns**, assert `<code>amount</code>` is **absent**. Assert required codes include `<code>product_sku_code</code>`, `<code>product_item_code</code>`, `<code>product_name</code>`, `<code>product_type</code>`, `<code>category_code</code>`, `<code>unit_of_measure</code>`. | P0 | Pass |
| TC02 | CSV template has no amount header | Still on the Import page, click **Download CSV Template** (`?template=1`). Assert downloaded filename contains `product_import_template` and the header row does **not** contain `amount`. Assert headers include `product_sku_code`, `product_item_code`, `product_name`, `product_type`, `category_code`, `unit_of_measure`, `weight_per_unit`, `standard_pack_size`, `description` (and other configured fields except `amount`). | P0 | Pass |
| TC03 | Add form has no Amount field | As **Tenant Admin**, open **Add product** (`/admin/master_data/product/add/`). Assert the form has **no** label/field **Amount** / `id_amount` (confirms template parity with admin form; `ProductAdminForm` excludes `amount`). | P1 | Pass |

## B — Import without amount

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC04 | Create product via import without amount column | As **Tenant Admin**, build a 1-row CSV **without** an `amount` column: `product_sku_code=MCP-FB014-S-<RUN_ID>`, unique `product_item_code` / `product_name`, `product_type=FinishedGoods`, valid seed `category_code`, `unit_of_measure=KG`, optional `description=MCP FB014 <RUN_ID>`. Upload via **CSV File** → **Upload and Validate**. Wait until **Import Preview** shows **Valid** = 1. Click **Import 1 Valid Rows**. Wait for **Import Complete** (`completed`) and **Records Imported** ≥ 1. Open `/admin/master_data/product/?q=MCP-FB014-S-<RUN_ID>`. Assert one product row with matching SKU / name; change form loads without **Amount**. | P0 | Pass |
| TC05 | Legacy CSV with amount column still validates (ignored) | Upload a 1-row CSV that includes an extra `amount=99.5` column plus all required fields and unique `product_sku_code=MCP-FB014-X-<RUN_ID>`. After preview, assert row **Valid** = 1 (extra `amount` is ignored, not required, and does not fail validation). Import → **Import Complete**. Assert product created; do **not** assert any Amount UI value (field not on form). | P1 | Pass |

## C — Export round-trip (no amount)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC06 | Export CSV headers omit amount | As **Tenant Admin**, ensure the product from **TC04** exists and is active. From `/admin/master_data/product/`, click **Export**. Wait for **Export Complete**, then **Download CSV**. Assert header row does **not** include `amount`. Assert a row for `product_sku_code=MCP-FB014-S-<RUN_ID>` with matching `product_name` / `category_code` / `unit_of_measure`. | P0 | Pass |

---

## Implementation Notes (Playwright MCP + Django Admin SSR)

### Scope guardrails

- In scope: Product changelist **Import** / **Export** SSR (`BulkImportExportMixin` on `ProductBulkAdmin`); template / column lists; import without `amount`; export headers without `amount`; optional legacy-column ignore.
- Out of scope: REST Product serializers still exposing `amount`; dropping the DB column / migration; Product Sub-Category bulk (FB-007); RBAC negatives; sample-template content beyond header presence.

### Role & environment fixtures

| Item | Value |
|------|--------|
| Tenant | `http://nourish.dev.dfms.local:8000` |
| Login | `/admin/login/` |
| Primary actor | `admin.nourish@yopmail.com` / `NourishAdmin@1234!` |
| Credentials | `docs/testing/playwright-mcp-credentials.yaml` |
| Celery | Required for validate / execute / export |

### Admin URLs & selectors

| Surface | Path / selector |
|---------|-----------------|
| Product changelist | `/admin/master_data/product/` |
| Import upload | `/admin/master_data/product/import/` |
| Import preview | `/admin/master_data/product/import/<job_id>/` |
| Export trigger | changelist **Export** → `/admin/master_data/product/export/` |
| Template download | `/admin/master_data/product/import/?template=1` |
| Add form | `/admin/master_data/product/add/` |
| CSV file input | `#csv_file` |
| Required / optional columns | `.dfms-column-list--required code` / `.dfms-column-list--optional code` |
| Changelist | `#result_list` |
| Import confirm | button text **Import N Valid Rows** |
| Import done | heading **Import Complete**; **Records Imported** |
| Export done | heading **Export Complete**; link **Download CSV** |

### Known implementation alignment

- **Fixed (FB-006):** `ProductImportConfig` no longer defines `amount`. Template, optional-column list, validate, and export headers omit `amount`. `ProductAdminForm` already `exclude = ("amount",)`.
- Extra `amount` cells in legacy CSVs are ignored (`BaseImportConfig.validate_row` only reads configured fields).
- DB column `Product.amount` retained; REST serializers may still expose `amount` (out of scope for FB-006).

### Suggested artifacts

`tests/e2e/playwright-mcp/fb-014-product-bulk-remove-amount-column-artifacts/` + runner via Playwright MCP (wipe `MCP-FB014-*` after suite).

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-08-04 | **6/6** | All test cases passed (Playwright MCP). RUN_ID=`3CA1A949`. SEED_CAT=`CAT-001`. |
