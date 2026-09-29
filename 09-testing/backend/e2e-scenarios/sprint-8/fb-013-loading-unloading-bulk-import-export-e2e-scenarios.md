---
module: sprint-8
specification: FB-005 — Loading/Unloading bulk import & export available — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: FB-005
source_spec: ../../../../03-backlog/phase-1/sprints/sprint-8/improvements/02-master-data.md
implementation_reference:
  - ../../../../../apps/master_data/import_configs.py (LoadingUnloadingPointImportConfig)
  - ../../../../../apps/master_data/admin.py (LoadingUnloadingPointAdmin, BulkImportExportMixin)
  - ../../../../../apps/master_data/models.py (LoadingUnloadingPoint, OperationType)
  - ../../../../../templates/admin/master_data/bulk_import_upload.html
  - ../../../../../templates/admin/master_data/bulk_import_preview.html
  - ../../../../../templates/admin/master_data/bulk_import_status.html
  - ../../../../../templates/admin/master_data/bulk_export_status.html
last_updated: 2026-08-04
last_mcp_run: 2026-08-04
last_mcp_verdict: 11/11 Pass
artifacts: tests/e2e/playwright-mcp/fb-013-loading-unloading-bulk-import-export-artifacts/
playwright_mcp: true
---

# Sprint 8 — FB-005 — Loading/Unloading: bulk import & export — E2E Scenario Plan (Django Admin SSR)

> **2026-08-04 — All 11 test cases passed** (TC01–TC11). Suite signed off via Playwright MCP against Nourish admin.

**Last MCP run:** 2026-08-04 · **11/11 Pass** · [RESULTS.md](../../../../../tests/e2e/playwright-mcp/fb-013-loading-unloading-bulk-import-export-artifacts/RESULTS.md)  
**Accounts:** `admin.nourish@yopmail.com` · **RUN_ID:** `A4F01304` · **SEED_POI:** `CTG-001`

**Improvement:** [FB-005](../../../../03-backlog/phase-1/sprints/sprint-8/improvements/02-master-data.md#fb-005--loadingunloading-bulk-operation-missing)

**AC (assert after fix):**

1. Loading/Unloading SHALL offer **bulk import** (template download, validate, import) consistent with other master-data menus.
2. Loading/Unloading SHALL offer **bulk export**.

Target runner: **Playwright MCP** against seeded Nourish (`docs/guides/playwright-mcp-admin.md`).

**Expected CSV columns** (`LoadingUnloadingPointImportConfig.get_csv_headers()`):

| Column | Required | Notes |
|--------|----------|-------|
| `poi_code` | Yes | Existing POI code (case-insensitive lookup); max 20 chars |
| `short_code` | Yes | Unique within that POI; max 20 chars |
| `name` | Yes | Display label |
| `operation_type` | Yes | `LOAD` or `UNLOAD`; **immutable after create** |
| `is_active` | No | Default `true` |
| `notes` | No | Default empty |

Identity / upsert key: **`(poi, short_code)`**. Export queryset is **active** LUPs only (`is_active=True`), ordered by `poi_code`, `short_code`.

---

## Seed prerequisites

| Item | Notes |
|------|--------|
| Actor | **Tenant Admin** (`admin.nourish@yopmail.com`) — LUP write + bulk I/O |
| Celery | Worker running (`validate_bulk_import` / `execute_bulk_import` / export generate); **restart after registering new import configs** |
| Wipe prefix | `MCP-FB013-` / `MCP-F13` / `MCP FB013` |
| Active POI | Seed `CTG-001` (`ctg-depot`) used as `SEED_POI_CODE` |
| Unique short codes | Use `RUN_ID` (e.g. 8 hex) in every `short_code` / `name` so imports never collide with seed bays; keep codes ≤20 chars |

Minimal valid create row:

`poi_code`, `short_code`, `name`, `operation_type=LOAD` (or `UNLOAD`)

---

## A — Bulk I/O surface & template

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Changelist shows Import and Export | As **Tenant Admin** (`admin.nourish@yopmail.com` / `NourishAdmin@1234!`), log in at `/admin/login/`, open **Master Data → Loading/Unloading Points** (`/admin/master_data/loadingunloadingpoint/`). Assert changelist loads and **Import** and **Export** actions/links are visible (same pattern as POI / Brand / Vehicle bulk I/O). | P0 | Pass |
| TC02 | Import page lists required + optional columns | Click **Import**. Assert upload page `/admin/master_data/loadingunloadingpoint/import/` with heading **Import loading/unloading points** (or equivalent verbose plural). Under **Required Columns**, assert `<code>poi_code</code>`, `<code>short_code</code>`, `<code>name</code>`, `<code>operation_type</code>`. Under **Optional Columns**, assert `<code>is_active</code>` and `<code>notes</code>`. | P0 | Pass |
| TC03 | CSV template headers match config | Still on the Import page, click **Download CSV Template** (`?template=1`). Assert downloaded filename contains `loadingunloadingpoint_import_template` and header row is exactly (order may match config): `poi_code`, `short_code`, `name`, `operation_type`, `is_active`, `notes`. | P0 | Pass |
| TC04 | Field rules: operation_type LOAD/UNLOAD | On **Field Rules & Allowed Values**, locate `operation_type`. Assert it is **Required** and allowed values include **`LOAD`** and **`UNLOAD`** (help text may mention immutable after create). | P1 | Pass |

## B — Import happy path

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC05 | Create LOAD point via import | As **Tenant Admin**, build a 1-row CSV with `poi_code=<SEED_POI_CODE>`, `short_code=MCP-FB013-L-<RUN_ID>`, `name=MCP FB013 Load <RUN_ID>`, `operation_type=LOAD`, optional `notes=MCP note <RUN_ID>`. Upload via **CSV File** → **Upload and Validate**. Wait until **Import Preview** shows **Valid** = 1. Click **Import 1 Valid Rows**. Wait for **Import Complete** (`completed`) and **Records Imported** ≥ 1. Open `/admin/master_data/loadingunloadingpoint/?q=MCP-FB013-L-<RUN_ID>`. Assert one row: Short Code `MCP-FB013-L-<RUN_ID>`, Operation Type **Loading** / `LOAD`, Active, name/notes match. | P0 | Pass |
| TC06 | Create UNLOAD point via import | Upload a 1-row CSV with same active `poi_code`, `short_code=MCP-FB013-U-<RUN_ID>`, `name=MCP FB013 Unload <RUN_ID>`, `operation_type=UNLOAD`. Complete validate → **Valid** = 1 → **Import 1 Valid Rows** → **Import Complete**. On changelist search `MCP-FB013-U-<RUN_ID>`, assert Operation Type **Unloading** / `UNLOAD`. | P0 | Pass |
| TC07 | Upsert updates name and notes | Re-import a CSV for the same `poi_code` + `short_code=MCP-FB013-L-<RUN_ID>` with `operation_type=LOAD`, `name=MCP FB013 Renamed <RUN_ID>`, `notes=Updated note <RUN_ID>`. Preview **Valid** = 1 → import → complete. Open the change form for that short code. Assert **Name / Label** and **Notes** updated; **Short Code** and **Operation Type** unchanged (`LOAD`). | P0 | Pass |

## C — Validation negatives

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC08 | Unknown poi_code rejected at preview | Upload a 1-row CSV with `poi_code=MCP-FB013-MISSING-<RUN_ID>` (must not exist), unique `short_code=MCP-F13-BP-<RUN_ID>`, valid `name` / `operation_type=LOAD`. After preview ready, assert row **Invalid**, Errors mention `poi_code` / POI does not exist, and confirm is **Import 0 Valid Rows** (disabled). Assert no LUP created for that short code. | P0 | Pass |
| TC09 | Changing operation_type on existing is invalid | Upload a 1-row CSV for existing `poi_code` + `short_code=MCP-FB013-L-<RUN_ID>` (from TC05) with `operation_type=UNLOAD` (was `LOAD`). After preview, assert row **Invalid**, Errors mention `operation_type` cannot change after create (existing value `LOAD`), and **Import 0 Valid Rows**. Assert changelist still shows `LOAD` for that short code. | P0 | Pass |
| TC10 | Active LUP under inactive POI rejected | Use inactive POI `MCP-F13I-<RUN_ID>` (≤20 chars). Upload a row with that `poi_code`, unique `short_code=MCP-F13-IB-<RUN_ID>`, `operation_type=LOAD`, `is_active=true` (or omit `is_active`). After preview, assert **Invalid** with error about cannot create/activate under an inactive POI, and no LUP created. | P1 | Pass |

## D — Export round-trip

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC11 | Export CSV includes headers and imported row | As **Tenant Admin**, ensure the active LUP from **TC05/TC07** exists. From `/admin/master_data/loadingunloadingpoint/`, click **Export**. Wait for **Export Complete**, then **Download CSV**. Assert header row includes `poi_code`, `short_code`, `name`, `operation_type`, `is_active`, `notes`. Assert a row for `short_code=MCP-FB013-L-<RUN_ID>` with matching `poi_code`, `operation_type=LOAD`, and updated `name` / `notes` from TC07. | P0 | Pass |

---

## Implementation Notes (Playwright MCP + Django Admin SSR)

### Scope guardrails

- In scope: LUP changelist **Import** / **Export** SSR (`BulkImportExportMixin` on `LoadingUnloadingPointAdmin`); template headers; create + upsert import; validation guards; export columns for **active** points.
- Out of scope: REST `/bulk-imports/` / `/bulk-exports/`; single-row Add/Edit/Delete (covered by [`loading-unloading-points-e2e-scenarios.md`](../02-master-data/loading-unloading-points-e2e-scenarios.md)); bay assignment / loading workflow consumption; Depot Officer RBAC negatives unless extended later; inactive rows appearing in export (export filters `is_active=True` by design).

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
| LUP changelist | `/admin/master_data/loadingunloadingpoint/` |
| Import upload | `/admin/master_data/loadingunloadingpoint/import/` |
| Import preview | `/admin/master_data/loadingunloadingpoint/import/<job_id>/` |
| Export trigger | changelist **Export** → `/admin/master_data/loadingunloadingpoint/export/` |
| Template download | `/admin/master_data/loadingunloadingpoint/import/?template=1` |
| CSV file input | `#csv_file` |
| Required / optional columns | `.dfms-column-list--required code` / `.dfms-column-list--optional code` |
| Changelist | `#result_list` |
| Import confirm | button text **Import N Valid Rows** |
| Import done | heading **Import Complete**; **Records Imported** |
| Export done | heading **Export Complete**; link **Download CSV** |

### Known implementation alignment

- Registry key: `loadingunloadingpoint` → `LoadingUnloadingPointImportConfig`.
- Upsert on `(poi, short_code)`; create sets `created_by` from import job actor; update only `name`, `is_active`, `notes`.
- `operation_type` change on existing row fails at validate_row (not silent overwrite).
- Active LUP under inactive POI blocked (parity with `LoadingUnloadingPointAdminForm`).
- Manual CRUD scenarios remain in [`loading-unloading-points-e2e-scenarios.md`](../02-master-data/loading-unloading-points-e2e-scenarios.md); this plan is **FB-005-only**.

### Suggested artifacts

`tests/e2e/playwright-mcp/fb-013-loading-unloading-bulk-import-export-artifacts/` + runner `run-fb013.js` via Playwright MCP `browser_run_code_unsafe` (wipe `MCP-FB013-*` / `MCP-F13*` after suite).

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-08-04 | **11/11** | All test cases passed (Playwright MCP). RUN_ID=`A4F01304`. Celery restart required for registry. |
