---
module: sprint-7
specification: FB-006 — POI bulk import/export include optional storage capacity (MT) & opening stock — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: FB-006
source_spec: ../../../../03-backlog/phase-1/sprints/sprint-7/feedback.md
implementation_reference:
  - ../../../../../apps/master_data/import_configs.py (POIImportConfig)
  - ../../../../../apps/master_data/admin.py (POIAdmin, BulkImportExportMixin, POIAddForm)
  - ../../../../../apps/operations/stock/services.py (set_opening_balance)
  - ../../../../../templates/admin/master_data/bulk_import_upload.html
  - ../../../../../templates/admin/master_data/bulk_import_preview.html
  - ../../../../../templates/admin/master_data/bulk_import_status.html
  - ../../../../../templates/admin/master_data/bulk_export_status.html
last_updated: 2026-07-30
last_mcp_run: 2026-07-30
last_mcp_verdict: 7/7 Pass
artifacts: tests/e2e/playwright-mcp/fb-006-poi-bulk-import-export-capacity-opening-stock-artifacts/
playwright_mcp: true
---

# Sprint 7 — FB-006 — POI bulk import/export: storage capacity (MT) & opening stock — E2E Scenario Plan (Django Admin SSR)

> **2026-07-30 — All 7 test cases passed** (TC01–TC07). Suite signed off via Playwright MCP against Nourish admin.

**Last MCP run:** 2026-07-30 · **7/7 Pass** · [RESULTS.md](../../../../../tests/e2e/playwright-mcp/fb-006-poi-bulk-import-export-capacity-opening-stock-artifacts/RESULTS.md)  
**Accounts:** `admin.nourish@yopmail.com`

**Feedback:** [FB-006](../../../../03-backlog/phase-1/sprints/sprint-7/feedback.md#fb-006--poi-bulk-importexport--include-optional-storage-capacity-mt--opening-stock)

**AC (assert after fix):**

1. POI bulk **import** and **export** SHALL include **storage capacity (MT)** and **opening stock**.
2. Both fields are **optional**. If either cell is **empty** on import, the system SHALL treat it as **0**.

Target runner: **Playwright MCP** against seeded Nourish (`docs/guides/playwright-mcp-admin.md`).

**Expected CSV columns (post-fix):** `storage_capacity_mt` (already in `POIImportConfig`) and virtual `opening_stock_mt` (maps to `POIStock.current_stock_mt` / admin “Opening Stock (MT)”). If implementation ships a different opening-stock header, update assertions to match `POIImportConfig.get_csv_headers()`.

---

## Seed prerequisites

| Item | Notes |
|------|--------|
| Actor | **Tenant Admin** (`admin.nourish@yopmail.com`) — POI write + bulk I/O |
| Celery | Worker running (`validate_bulk_import` / `execute_bulk_import` / export generate) |
| Wipe prefix | `MCP-FB006-` / `MCP FB006` |
| Unique codes | Use `RUN_ID` (e.g. 8 hex) in every `poi_code` / name so imports never collide with seed POIs |

Minimal required CSV columns for a valid POI row (plus the two FB-006 fields under test):

`poi_code`, `name`, `poi_type`, `classification_type` — use enum values exactly as listed on the Import page Field Rules (e.g. `depot` / `neutral`).

---

## A — Template & optional columns

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Optional columns list capacity + opening stock | As **Tenant Admin** (`admin.nourish@yopmail.com` / `NourishAdmin@1234!`), log in at `/admin/login/`, open **Master Data → Points of Interest** (`/admin/master_data/poi/`). Click **Import**. Assert upload page `/admin/master_data/poi/import/` with heading **Import points of interest** (or equivalent verbose plural). Under **Optional Columns**, assert `<code>storage_capacity_mt</code>` and `<code>opening_stock_mt</code>` are listed. | P0 | Pass |
| TC02 | CSV template headers include both columns | Still on the Import page, click **Download CSV Template** (`?template=1`). Assert the downloaded CSV header row includes `storage_capacity_mt` and `opening_stock_mt` (alongside existing POI headers such as `poi_code`, `name`, `poi_type`, `classification_type`). | P0 | Pass |
| TC03 | Field rules mark both optional with empty→0 default | On the Import page **Field Rules & Allowed Values**, locate `storage_capacity_mt` and `opening_stock_mt`. Assert each shows **Optional** (or equivalent pill) and a **Default** of `0` (or help text stating empty cells are treated as zero). | P1 | Pass |

## B — Import: empty → zero

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC04 | Blank capacity + opening stock import as 0 | As **Tenant Admin**, build a 1-row CSV with unique `poi_code=MCP-FB006-Z-<RUN_ID>`, name `MCP FB006 Zero <RUN_ID>`, valid `poi_type` / `classification_type`, and **empty** `storage_capacity_mt` and `opening_stock_mt` (columns present, cells blank). Upload via **CSV File** → **Upload and Validate**. Wait until **Import Preview** shows **Valid** = 1. Click **Import 1 Valid Rows**. Wait for **Import Complete** (`completed`) and **Records Imported** ≥ 1. Open `/admin/master_data/poi/?q=MCP-FB006-Z-<RUN_ID>` (or the POI change form). Assert **Capacity (MT)** is **0** / `0.00` (not “—” / blank) and **Current (MT)** is **0** / `0.000`. | P0 | Pass |

## C — Import: explicit values

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC05 | Non-zero capacity + opening stock persist | As **Tenant Admin**, upload a 1-row CSV with unique `poi_code=MCP-FB006-V-<RUN_ID>`, `storage_capacity_mt=120.50`, `opening_stock_mt=15.250`, other required fields valid. Complete validate → preview **Valid** = 1 → **Import 1 Valid Rows** → **Import Complete**. On changelist/change form for that POI, assert Capacity (MT) **120.50** (or `120.5`) and Current (MT) **15.250** (or `15.25`). | P0 | Pass |

## D — Export round-trip columns

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC06 | Export CSV includes capacity + opening stock | As **Tenant Admin**, ensure at least one active POI exists with known capacity and stock (prefer the POI from **TC05**, or seed via add form with Opening Stock). From `/admin/master_data/poi/`, click **Export**. Wait for **Export Complete**, then **Download CSV**. Assert header row includes `storage_capacity_mt` and `opening_stock_mt`. Assert the row for the known `poi_code` has capacity and opening-stock values matching the POI (empty/`0` allowed only if that POI truly has zero). | P0 | Pass |

## E — Validation negative

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC07 | Negative opening stock invalid at preview | As **Tenant Admin**, upload a 1-row CSV with unique `poi_code=MCP-FB006-NEG-<RUN_ID>` and `opening_stock_mt=-1` (capacity blank or `0`). After preview ready, assert row **Invalid**, Errors mention `opening_stock_mt` (or opening stock) as invalid / must be ≥ 0, and confirm button is **Import 0 Valid Rows** (disabled). Assert no POI created for that `poi_code`. | P1 | Pass |

---

## Implementation Notes (Playwright MCP + Django Admin SSR)

### Scope guardrails

- In scope: POI changelist **Import** / **Export** SSR (`BulkImportExportMixin` on `POIAdmin`); template headers; optional-column listing; empty→0 on import; persist capacity + opening stock; export columns.
- Out of scope: REST `/bulk-imports/` / `/bulk-exports/`; LUP / product stock; admin single-POI add form opening balance (already covered by `poi-e2e-scenarios.md`); upsert overwrite of live stock on existing `poi_code` (product decision — assert create path in TC04/TC05); RBAC negatives (Depot Officer) unless extended later.

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
| POI changelist | `/admin/master_data/poi/` |
| Import upload | `/admin/master_data/poi/import/` |
| Import preview | `/admin/master_data/poi/import/<job_id>/` |
| Export trigger | POST/GET via changelist **Export** → `/admin/master_data/poi/export/` |
| Template download | `/admin/master_data/poi/import/?template=1` |
| CSV file input | `#csv_file` |
| Optional columns | `.dfms-column-list--optional code` |
| Changelist capacity / stock | `#result_list` columns **Capacity (MT)** / **Current (MT)** |
| Import confirm | button text **Import N Valid Rows** |
| Import done | heading **Import Complete**; **Records Imported** |
| Export done | heading **Export Complete**; link **Download CSV** |

### Known implementation alignment

- `POIImportConfig`: optional `storage_capacity_mt` + virtual `opening_stock_mt` (default `"0"`); empty → 0.
- Create path: `POIStock` + `set_opening_balance` when opening &gt; 0; upsert does not overwrite live stock.
- Export includes both columns (`select_related("stock")`).
- Broad POI bulk coverage remains in [`poi-e2e-scenarios.md`](../02-master-data/poi-e2e-scenarios.md) (MD_POI_042–046); this plan is **FB-006-only**.

### Suggested artifacts

`tests/e2e/playwright-mcp/fb-006-poi-bulk-import-export-capacity-opening-stock-artifacts/` + runner via Playwright MCP `browser_run_code_unsafe` (generate ephemeral CSVs at runtime; wipe `MCP-FB006-*` after suite).

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-07-30 | **7/7** | All test cases passed (Playwright MCP). RUN_ID=`E05`. |
