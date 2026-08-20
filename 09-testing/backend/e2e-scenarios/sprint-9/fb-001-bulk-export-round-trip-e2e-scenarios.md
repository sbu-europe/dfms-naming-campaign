---
module: sprint-9
specification: FB-001 — Bulk export must round-trip with import; no missing fields — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: FB-001
source_spec: ../../../../03-backlog/sprints/sprint-9/feedback-resolution.md
implementation_reference:
  - ../../../../../apps/master_data/import_configs.py (BaseImportConfig.get_csv_headers, get_export_row, IMPORT_REGISTRY)
  - ../../../../../apps/master_data/admin.py (BulkImportExportMixin)
  - ../../../../../apps/master_data/services.py (ExportService.generate)
  - ../../../../../apps/users/import_configs.py (UserImportConfig, DriverImportConfig, HelperImportConfig)
  - ../../../../../apps/users/admin.py (users BulkImportExportMixin, UserBulkImportAdmin)
  - ../../../../../templates/admin/change_list.html (Import / Export)
  - ../../../../../templates/admin/master_data/bulk_import_upload.html
  - ../../../../../templates/admin/master_data/bulk_import_preview.html
  - ../../../../../templates/admin/master_data/bulk_export_status.html
last_updated: 2026-08-20
playwright_mcp: true
---

# Sprint 9 — FB-001 — Bulk export round-trip with import — E2E Scenario Plan (Django Admin SSR)

**Feedback:** [FB-001](../../../../03-backlog/sprints/sprint-9/feedback-resolution.md#fb-001--bulk-export-must-round-trip-with-import--no-missing-fields)

**AC (assert after fix):**

1. **FB-001-1** — Export CSV headers SHALL match the downloadable import template (same names, same order) for every `IMPORT_REGISTRY` model.
2. **FB-001-2** — Export cell values SHALL be import-legal (lookup codes / enum `.value`s / ISO dates / E.164 phones / `true`/`false`; not Django object reprs or empty FK-code columns).
3. **FB-001-3** — Every importable field that has stored data SHALL be present and populated on the exported row.
4. **FB-001-4** — An **unchanged** export file SHALL re-import as valid (preview **Invalid** = 0). Existing unique keys are **bulk updates** (Product SKU, Vehicle registration, Brand name, …). Import **column names/order** stay the same. Split identity (SKU + another product’s item code; registration + another vehicle’s chassis) remains invalid.

Target runner: **Playwright MCP** against seeded Nourish (`docs/guides/playwright-mcp-admin.md`).

> **Run after implementation.** Export cells are import-legal; User export fills `role` / `invite_channel` / `otp_type` / `poi_code`; existing uniques upsert at preview.

---

## Registry under test

| Registry key | Admin changelist | Nav | Import / export URLs |
|--------------|------------------|-----|----------------------|
| `productcategory` | `/admin/master_data/productcategory/` | **Master Data → Product Categories** | `…/import/`, `…/export/` |
| `productsubcategory` | `/admin/master_data/productsubcategory/` | **Master Data → Product Sub-category** | same pattern |
| `product` | `/admin/master_data/product/` | **Master Data → Products** | same pattern |
| `brand` | `/admin/master_data/brand/` | **Master Data → Vehicle Brands** | same pattern |
| `vehicle` | `/admin/master_data/vehicle/` | **Master Data → Vehicles** | same pattern |
| `supplier` | `/admin/master_data/supplier/` | **Master Data → Suppliers** | same pattern |
| `dealer` | `/admin/master_data/dealer/` | **Master Data → Dealers** | same pattern |
| `poi` | `/admin/master_data/poi/` | **Master Data → Points of Interest** | same pattern |
| `loadingunloadingpoint` | `/admin/master_data/loadingunloadingpoint/` | **Master Data → Loading/Unloading Points** | same pattern |
| `user` | `/admin/users/user/` | **Users → Users** | `/admin/users/user/import/`, `/admin/users/user/export/` |
| `driver` | `/admin/users/driver/` | **Master Data → Drivers** | `/admin/users/driver/import/`, `/admin/users/driver/export/` |
| `helper` | `/admin/users/helper/` | **Master Data → Helpers** | `/admin/users/helper/import/`, `/admin/users/helper/export/` |

**Expected template / export header rows** (`get_csv_headers()` — assert exact order):

| Model | Header row |
|-------|------------|
| Product Category | `category_code,category_name,product_type,is_active` |
| Product Sub-Category | `sub_category_code,sub_category_name,category_code,is_active` |
| Product | `product_sku_code,product_item_code,product_name,product_type,category_code,sub_category_code,unit_of_measure,weight_per_unit,standard_pack_size,description,barcode_ean,manufacturer_name,preferred_vehicle_body_type,special_handling_requirements,requires_qc,is_active` |
| Brand | `brand_name,is_active` |
| Vehicle | `registration_number,chassis_number,brand_name,model_name,year_of_manufacture,vehicle_color,vehicle_type,body_type,fuel_type,capacity,capacity_unit,number_of_wheels,allowed_product_category,gps_tracker_id,sim_number,purchase_date,fitness_expiry_date,insurance_expiry_date,remarks,is_active` |
| Supplier | `supplier_code,supplier_name,contact_number,email,address,site_poi_code,latitude,longitude,geofence_radius,is_active` |
| Dealer | `dealer_code,dealer_name,contact_number,email,address,site_poi_code,latitude,longitude,geofence_radius,is_active` |
| POI | `poi_code,name,poi_type,classification_type,address,city,country,latitude,longitude,geofence_radius_meters,storage_capacity_mt,opening_stock_mt,capacity_threshold_pct,number_of_gates,number_of_scales,contact_person,contact_phone,is_active` |
| Loading/Unloading | `poi_code,short_code,name,operation_type,is_active,notes` |
| User | `invite_channel,email,employee_id,first_name,last_name,role,department,phone_number,otp_type,poi_code` |
| Driver | `invite_channel,user_email,first_name,last_name,employee_id,contact_number,driver_type,driving_license_number,license_type,license_expiry_date,national_id_number,reference_contact_1,reference_contact_2,accident_history,last_training_assessment_info,address,is_active` |
| Helper | `employee_id,full_name,contact_number,national_id_number,reference_contact_1,reference_contact_2,address,is_active` |

---

## Seed prerequisites

| Item | Notes |
|------|--------|
| Actor | **Tenant Admin** (`admin.nourish@yopmail.com` / `NourishAdmin@1234!`) |
| Credentials | `docs/testing/playwright-mcp-credentials.yaml` |
| Celery | Worker running (`validate_bulk_import`, `execute_bulk_import`, `generate_bulk_export`); restart if registry changed |
| Catalog | Seed Nourish already has rows on every registry model. Round-trip TCs **re-upload the full unchanged export** (not a 1-row extract). Total rows must be ≤ 5,000. |
| Wipe | Do **not** invent MCP rows unless a TC fails for lack of a populated optional FK (e.g. vehicle with `brand`). Prefer seed data. If a fixture is created, prefix `MCP-FB001-`. |
| Shared flow | Changelist **Export** → wait **Export Complete** → **Download CSV**. Changelist **Import** → **Download CSV Template**. Re-import: **CSV File** (`#csv_file`) → **Upload and Validate** → **Import Preview** → **Valid** / **Invalid** stats. |

**Shared assertions for every round-trip TC (TC01–TC12):**

1. Template header row **equals** export header row (names + order). Same columns import already accepts — no remapping.
2. At least one data row has import-legal values for required columns and for every optional column that has stored data on that record (no Django `<Model: …>` reprs; booleans `true`/`false`; dates `YYYY-MM-DD`; phones E.164 where the config coerces BD mobile).
3. Re-upload the **unchanged** export file. After preview: **Invalid** = 0 and **Valid** = **Total Rows**. Then click **Import N Valid Rows**, wait for **Import Complete** (`completed`). Existing unique keys (SKU, registration, brand name, …) are **updates**, not errors.

---

## A — Round-trip per registry model (FB-001-1 … FB-001-4)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Product Category export round-trips | As **Tenant Admin** (`admin.nourish@yopmail.com`), log in at `/admin/login/`. Open **Master Data → Product Categories** (`/admin/master_data/productcategory/`). Click **Import**, then **Download CSV Template**. Back on the changelist, click **Export**, wait for **Export Complete**, then **Download CSV**. Assert header rows are identical: `category_code,category_name,product_type,is_active`. Assert a data row uses `product_type` enum value `FinishedGoods` or `RawMaterial` (not a Python object repr) and `is_active` is `true`/`false`. Re-upload the unchanged export via **Upload and Validate**. Assert **Import Preview** **Invalid** = 0. Click **Import N Valid Rows**. Assert **Import Complete**. | P0 | Planned |
| TC02 | Product Sub-Category export round-trips | As **Tenant Admin**, open **Master Data → Product Sub-category** (`/admin/master_data/productsubcategory/`). Download **Download CSV Template** and **Export** → **Download CSV**. Assert headers `sub_category_code,sub_category_name,category_code,is_active`. Assert a data row has non-empty `category_code` matching an existing category (not blank, not a category object repr). Re-upload unchanged export; assert **Invalid** = 0; confirm **Import N Valid Rows** → **Import Complete**. | P0 | Planned |
| TC03 | Product export round-trips including existing SKUs | As **Tenant Admin**, open **Master Data → Products** (`/admin/master_data/product/`). Download template and export. Assert headers match the Product row in the registry table above. Assert a data row has non-empty `category_code`, `product_type` in {`FinishedGoods`,`RawMaterial`}, `unit_of_measure` in {`Bag`,`Ton`,`KG`,`Liters`,`Pieces`,`Cartons`}, `requires_qc`/`is_active` as `true`/`false`, and `sub_category_code` populated when that product has a sub-category. Re-upload the **unchanged** export. Assert **Import Preview** **Invalid** = 0 (existing `product_sku_code` / matching `product_item_code` is a **bulk update**, not “already exists”). Confirm import → **Import Complete**. | P0 | Planned |
| TC04 | Brand export round-trips | As **Tenant Admin**, open **Master Data → Vehicle Brands** (`/admin/master_data/brand/`). Download template and export. Assert headers `brand_name,is_active`. Assert `is_active` is `true`/`false`. Re-upload unchanged export; **Invalid** = 0; **Import N Valid Rows** → **Import Complete**. | P0 | Planned |
| TC05 | Vehicle export round-trips with brand and dates | As **Tenant Admin**, open **Master Data → Vehicles** (`/admin/master_data/vehicle/`). Download template and export. Assert headers match the Vehicle row in the registry table. On a row that has a brand in admin, assert `brand_name` is the brand’s name string (not blank, not `<Brand: …>`). Assert `vehicle_type` is an enum **value** (e.g. `pickup_van`, `open_truck`) not the label **Pickup Van**. Assert any populated `purchase_date` / `fitness_expiry_date` / `insurance_expiry_date` is `YYYY-MM-DD`. Assert `is_active` is `true`/`false`. Re-upload unchanged export; **Invalid** = 0; confirm → **Import Complete**. | P0 | Planned |
| TC06 | Supplier export round-trips with site POI code | As **Tenant Admin**, open **Master Data → Suppliers** (`/admin/master_data/supplier/`). Download template and export. Assert headers match the Supplier row. Assert `contact_number` is import-legal BD mobile (E.164 `+880…` preferred). If a supplier has **Site POI** set in admin, assert that export row’s `site_poi_code` equals the POI code (not blank). Assert `is_active` is `true`/`false`. Re-upload unchanged export; **Invalid** = 0; confirm → **Import Complete**. | P0 | Planned |
| TC07 | Dealer export round-trips with site POI code | As **Tenant Admin**, open **Master Data → Dealers** (`/admin/master_data/dealer/`). Same assertions as TC06 with dealer headers (`dealer_code`, `dealer_name`, … `site_poi_code`). Re-upload unchanged export; **Invalid** = 0; confirm → **Import Complete**. | P0 | Planned |
| TC08 | POI export round-trips | As **Tenant Admin**, open **Master Data → Points of Interest** (`/admin/master_data/poi/`). Download template and export. Assert headers match the POI row. Assert `poi_type` / `classification_type` are enum values (not object reprs); `is_active` is `true`/`false`; numeric fields are decimal/integer strings not Python objects. Re-upload unchanged export; **Invalid** = 0; confirm → **Import Complete**. (Do **not** assert `opening_stock_mt` equals the original opening-balance; export currently serializes companion stock — see Implementation Notes.) | P0 | Planned |
| TC09 | Loading/Unloading export round-trips | As **Tenant Admin**, open **Master Data → Loading/Unloading Points** (`/admin/master_data/loadingunloadingpoint/`). Download template and export. Assert headers `poi_code,short_code,name,operation_type,is_active,notes`. Assert a data row has non-empty `poi_code` and `operation_type` of `LOAD` or `UNLOAD`. Re-upload unchanged export; **Invalid** = 0; confirm → **Import Complete**. | P0 | Planned |
| TC10 | User export round-trips with role and invite columns | As **Tenant Admin**, open **Users → Users** (`/admin/users/user/`). Click **Import**, **Download CSV Template**. Back on changelist, **Export** → **Download CSV**. Assert headers exactly `invite_channel,email,employee_id,first_name,last_name,role,department,phone_number,otp_type,poi_code`. Assert a data row for an active seeded user has non-empty `role` as a **role_code** (e.g. `tenant_admin`, `depot_officer`) not blank and not a Role object repr; `invite_channel` is `email` or `phone`; `otp_type` is `none`/`email`/`phone`. If the user is POI-scoped and has a stored site, `poi_code` is that POI’s code. Re-upload the **unchanged** export; assert **Invalid** = 0 (blank `role` must not appear). Confirm → **Import Complete**. | P0 | Planned |
| TC11 | Driver export round-trips with user fields | As **Tenant Admin**, open **Master Data → Drivers** (`/admin/users/driver/`). Download template and export. Assert headers match the Driver row. Assert a data row has `user_email` / `first_name` from the linked User (not blank when the driver has a user), `contact_number` import-legal, `driver_type` in {`permanent`,`temporary`,`own`,`vendor`}, `license_expiry_date` as `YYYY-MM-DD`. Re-upload unchanged export; **Invalid** = 0; confirm → **Import Complete**. | P0 | Planned |
| TC12 | Helper export round-trips | As **Tenant Admin**, open **Master Data → Helpers** (`/admin/users/helper/`). Download template and export. Assert headers match the Helper row. Assert required `employee_id`, `full_name`, `contact_number` populated on a data row; `is_active` is `true`/`false`. Re-upload unchanged export; **Invalid** = 0; confirm → **Import Complete**. | P0 | Planned |

## B — Guards (not closing AC)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC13 | Inactive records omitted from export (current default) | As **Tenant Admin**, pick a model that shows inactive rows in the changelist (e.g. Products with **Active** filter off, or a known inactive seed). **Export** → **Download CSV**. Assert the inactive record’s unique key is **absent** from the export (queryset is `is_active=True`). This documents current platform default; **do not** treat as FB-001 failure unless product later requires exporting inactive rows. | P1 | Planned |
| TC14 | Non-admin cannot Users export | As **Depot Officer** (`depot.officer1.nourish@yopmail.com` / `Nourish@1234!`), open `/admin/users/user/export/` (POST if the changelist form is reachable). Assert no successful **Export Complete** / CSV download for Users; expect permission deny / redirect and message **You do not have permission to import users** (or export equivalent). Users bulk I/O is tenant/super admin only. | P1 | Planned |

---

## Implementation Notes (Playwright + Django Admin SSR)

### Scope guardrails

- In scope: Django admin SSR **Export** (and re-upload of that file) on every `IMPORT_REGISTRY` model. Header identity, import-legal cells, completeness of stored importable fields. Unchanged export **re-imports** with **Invalid = 0**; existing unique keys upsert.
- Out of scope: Changing import column names/order/`FieldConfig` required flags. REST `/api/v1/bulk-imports/` and `/bulk-exports/`; **Download Sample CSV** guidance rows; single-row Add/Edit CRUD uniqueness (manual Add still rejects duplicate SKU); invitation email/SMS; seat limits; exporting **inactive** rows (TC13).

### Role & environment fixtures

| Item | Value |
|------|--------|
| Tenant | `http://nourish.dev.dfms.local:8000` |
| Login | `/admin/login/` |
| Primary actor | `admin.nourish@yopmail.com` / `NourishAdmin@1234!` |
| RBAC actor (TC14) | `depot.officer1.nourish@yopmail.com` / `Nourish@1234!` |
| Credentials | `docs/testing/playwright-mcp-credentials.yaml` |
| Celery | Required |

### Admin URLs & selectors

| Surface | Path / selector |
|---------|-----------------|
| Changelist actions | **Import** link, **Export** submit button (`templates/admin/change_list.html`) |
| Template | `{changelist}import/?template=1` — **Download CSV Template** |
| Export status | `{changelist}export/<job_id>/` — heading **Export Complete**; link **Download CSV** |
| Upload | `#csv_file`; button **Upload and Validate** |
| Preview | heading **Import Preview**; **Total Rows** / **Valid** / **Invalid**; button **Import N Valid Rows** |
| Import done | heading **Import Complete** |
| Columns lists | `.dfms-column-list--required code` / `.dfms-column-list--optional code` |

Master-data URL names: `admin:master_data_<model>_import_upload`, `admin:master_data_<model>_export`. Users app: `admin:users_user_import_upload`, `admin:users_driver_export`, `admin:users_helper_export`.

### Status assertion note

- Preview **Valid** / **Invalid** counts are the round-trip gate for **all** registry models including Product (TC03). Do not trust only the success toast.
- Enum cells must be **stored values** (`FinishedGoods`, `LOAD`, `pickup_van`, `permanent`), not admin list labels (**Finished Goods**, **Loading**, **Pickup Van**, **Permanent**).
- Boolean cells must be `true`/`false` (import also accepts `1`/`0`/`yes`/`no`, but export should emit `true`/`false`).

### Known implementation alignment (pre-fix)

- Template and export **already share** `config.get_csv_headers()` and UTF-8-SIG. Header mismatch in UAT is more likely empty/illegal **cells** than a second header list.
- `BaseImportConfig.get_export_row` serializes import-legal scalars. CSV aliases that are not model attributes stay `""` unless the config overrides `get_export_row`. Overrides exist for Product, Vehicle, Sub-Category, Supplier/Dealer, POI, LUP, Driver, and **User** (`role`, `invite_channel`, `otp_type`, `poi_code`).
- Existing unique keys are **updates**: Product SKU (item code must not belong to another SKU); Vehicle `registration_number` (chassis must not belong to another vehicle); Brand / Category / Supplier / Dealer / POI via `BaseImportConfig._prepare_instance_for_clean`. Split identity (SKU-A + item of SKU-B) stays invalid.
- Export queryset defaults to `is_active=True` (TC13). Inactive admin rows are omitted; that is **not** FB-001-1…4 unless product expands the AC.
- POI `opening_stock_mt` export writes companion `stock.current_stock_mt`, and import applies opening stock **on create only**. Round-trip preview should still be valid; do not assert stock unchanged as opening balance.
- Module spec `05-modules/02-master-data/bulk-import-export.md` is stale (omits POI, Product Sub-Category, User). Code registry wins.
- Older plan `users/user-bulk-import-e2e-scenarios.md` lists template headers without `invite_channel` and marks `email`/`last_name` required; current `UserImportConfig` headers start with `invite_channel` and `email`/`last_name` are not `required=True`.

### Suggested artifacts

`tests/e2e/playwright-mcp/fb-001-bulk-export-round-trip-artifacts/` after the MCP run. Wipe only `MCP-FB001-*` if this suite created rows.

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| — | — | Planned; run after FB-001 implementation. |
