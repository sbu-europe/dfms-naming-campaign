---
module: sprint-8
specification: FB-004 — Driver bulk upload optional accident history & last training assessment info — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: FB-004
source_spec: ../../../../03-backlog/sprints/sprint-8/improvements/01-users-and-access.md
implementation_reference:
  - ../../../../../apps/users/import_configs.py (DriverImportConfig)
  - ../../../../../apps/users/admin.py (DriverAdmin, BulkImportExportMixin)
  - ../../../../../apps/users/models.py (Driver.accident_history, last_training_assessment_info)
  - ../../../../../templates/admin/master_data/bulk_import_upload.html
  - ../../../../../templates/admin/master_data/bulk_import_preview.html
  - ../../../../../templates/admin/master_data/bulk_import_status.html
  - ../../../../../templates/admin/master_data/bulk_export_status.html
last_updated: 2026-08-03
last_mcp_run: 2026-08-03
last_mcp_verdict: 6/6 Pass
artifacts: tests/e2e/playwright-mcp/fb-012-driver-bulk-import-export-accident-history-training-assessment-artifacts/
playwright_mcp: true
---

# Sprint 8 — FB-004 — Driver bulk upload: optional accident history & last training assessment info — E2E Scenario Plan (Django Admin SSR)

> **2026-08-03 — All 6 test cases passed** (TC01–TC06). Suite signed off via Playwright MCP against Nourish admin (`admin.nourish@yopmail.com`, RUN_ID `A7F3E201`). Artifacts: [`RESULTS.md`](../../../../../tests/e2e/playwright-mcp/fb-012-driver-bulk-import-export-accident-history-training-assessment-artifacts/RESULTS.md).

**Improvement:** [FB-004](../../../../03-backlog/sprints/sprint-8/improvements/01-users-and-access.md#fb-004--driver-bulk-upload--optional-accident-history--last-training-assessment-info)

**AC (assert after fix):**

1. Driver **bulk import** SHALL include optional columns **`accident_history`** and **`last_training_assessment_info`** (template, validate, import). Empty values are allowed.
2. Driver **bulk export** SHALL include the same optional columns.

Target runner: **Playwright MCP** against seeded Nourish (`docs/guides/playwright-mcp-admin.md`).

**Expected CSV columns:** `accident_history`, `last_training_assessment_info` — same snake_case headers as model fields (`DriverImportConfig.get_csv_headers()`).

---

## Seed prerequisites

| Item | Notes |
|------|--------|
| Actor | **Tenant Admin** (`admin.nourish@yopmail.com`) — Driver write + bulk I/O (also valid: Transport Planner / Driver Supervisor per FB-001) |
| Celery | Worker running (`validate_bulk_import` / `execute_bulk_import` / export generate); restart after Driver model / import-config changes |
| Wipe prefix | `MCP-FB012-` / `MCP FB012` / emails `mcp.fb012.*` |
| Unique keys | Use `RUN_ID` (e.g. 8 hex) in `user_email`, `driving_license_number`, `contact_number`, names so imports never collide with seed drivers |
| Phone format | BD E.164 per Field Rules (e.g. `+88017XXXXXXXX` unique per row) |
| License expiry | Future ISO date `YYYY-MM-DD` |
| Driver type | Enum value from Field Rules (e.g. `own`) |

Minimal required CSV columns for a valid create row (plus the two FB-004 fields under test):

`invite_channel` (optional; default `email`), `user_email`, `first_name`, `last_name`, `contact_number`, `driver_type`, `driving_license_number`, `license_type`, `license_expiry_date`

---

## A — Template & optional columns

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Optional columns list accident history + training assessment | As **Tenant Admin** (`admin.nourish@yopmail.com` / `NourishAdmin@1234!`), log in at `/admin/login/`, open **Master Data → Drivers** (`/admin/users/driver/`). Click **Import**. Assert upload page `/admin/users/driver/import/` with heading **Import drivers** (or equivalent verbose plural). Under **Optional Columns**, assert `<code>accident_history</code>` and `<code>last_training_assessment_info</code>` are listed. | P0 | Pass |
| TC02 | CSV template headers include both columns | Still on the Import page, click **Download CSV Template** (`?template=1`). Assert the downloaded CSV header row includes `accident_history` and `last_training_assessment_info` (alongside existing driver headers such as `user_email`, `first_name`, `contact_number`, `driving_license_number`, `reference_contact_1`, `address`). | P0 | Pass |
| TC03 | Field rules mark both optional | On the Import page **Field Rules & Allowed Values**, locate `accident_history` and `last_training_assessment_info`. Assert each shows **Optional** (or equivalent pill). | P1 | Pass |

## B — Import: blank optional cells

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC04 | Blank accident history + training assessment import succeeds | As **Tenant Admin**, build a 1-row CSV with unique `user_email=mcp.fb012.z.<RUN_ID>@example.com`, `first_name=MCP`, `last_name=FB012Z<RUN_ID>`, unique `contact_number`, unique `driving_license_number=MCP-FB012-Z-<RUN_ID>`, valid `driver_type` / `license_type` / future `license_expiry_date`, and **empty** `accident_history` and `last_training_assessment_info` (columns present, cells blank). Upload via **CSV File** → **Upload and Validate**. Wait until **Import Preview** shows **Valid** = 1. Click **Import 1 Valid Rows**. Wait for **Import Complete** (`completed`) and **Records Imported** ≥ 1. Open `/admin/users/driver/?q=MCP-FB012-Z-<RUN_ID>` (or the driver change form). Under **References & notes**, assert **Accident history** and **Last training assessment info** are blank / empty. | P0 | Pass |

## C — Import: explicit values

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC05 | Explicit accident history + training assessment persist | As **Tenant Admin**, upload a 1-row CSV with unique `user_email=mcp.fb012.v.<RUN_ID>@example.com`, `driving_license_number=MCP-FB012-V-<RUN_ID>`, unique contact/license fields valid, `accident_history=MCP Accident <RUN_ID>`, `last_training_assessment_info=MCP Training <RUN_ID>`. Complete validate → preview **Valid** = 1 → **Import 1 Valid Rows** → **Import Complete**. On the driver change form for that license, under **References & notes**, assert **Accident history** contains `MCP Accident <RUN_ID>` and **Last training assessment info** contains `MCP Training <RUN_ID>`. | P0 | Pass |

## D — Export round-trip columns

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC06 | Export CSV includes accident history + training assessment | As **Tenant Admin**, ensure at least one active driver exists with known accident/training values (prefer the driver from **TC05**). From `/admin/users/driver/`, click **Export**. Wait for **Export Complete**, then **Download CSV**. Assert header row includes `accident_history` and `last_training_assessment_info`. Assert the row for `driving_license_number=MCP-FB012-V-<RUN_ID>` has matching accident/training values from TC05. | P0 | Pass |

---

## Implementation Notes (Playwright MCP + Django Admin SSR)

### Scope guardrails

- In scope: Driver changelist **Import** / **Export** SSR (`BulkImportExportMixin` on `DriverAdmin`); template headers; optional-column listing; persist `accident_history` + `last_training_assessment_info` on create import; export columns.
- Out of scope: REST `/bulk-imports/` / `/bulk-exports/`; Helper bulk I/O; single-driver Add form (fields already on change form under **References & notes**); invitation email/SMS delivery; FB-003 reference/address columns (covered separately); RBAC negatives unless extended later.

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
| Driver changelist | `/admin/users/driver/` |
| Import upload | `/admin/users/driver/import/` |
| Import preview | `/admin/users/driver/import/<job_id>/` |
| Export trigger | changelist **Export** → `/admin/users/driver/export/` |
| Template download | `/admin/users/driver/import/?template=1` |
| CSV file input | `#csv_file` |
| Optional columns | `.dfms-column-list--optional code` |
| Change form fields | `#id_accident_history`, `#id_last_training_assessment_info` |
| Import confirm | button text **Import N Valid Rows** |
| Import done | heading **Import Complete**; **Records Imported** |
| Export done | heading **Export Complete**; link **Download CSV** |

### Known implementation alignment / drift

- Model + admin change form expose `accident_history` and `last_training_assessment_info` under **References & notes** (`DriverAdmin` fieldsets).
- `DriverImportConfig` declares both as optional `FieldConfig`s and assigns them in `perform_batch_import`; export headers come from `get_csv_headers()`.
- Broad driver coverage remains in [`drivers-e2e-scenarios.md`](../02-master-data/drivers-e2e-scenarios.md); this plan is **FB-004-only**. Sibling: [`fb-011-driver-invitation-bulk-import-export-reference-address-e2e-scenarios.md`](./fb-011-driver-invitation-bulk-import-export-reference-address-e2e-scenarios.md).

### Suggested artifacts

`tests/e2e/playwright-mcp/fb-012-driver-bulk-import-export-accident-history-training-assessment-artifacts/` + runner via Playwright MCP `browser_run_code_unsafe` (CSV fixtures under artifacts; wipe `MCP-FB012-*` / related invite users after suite).

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-08-03 | **6/6** | All test cases passed (Playwright MCP). RUN_ID `A7F3E201`. |
