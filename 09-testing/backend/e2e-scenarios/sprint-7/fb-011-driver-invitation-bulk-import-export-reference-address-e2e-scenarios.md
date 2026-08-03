---
module: sprint-7
specification: FB-011 — Driver invitation bulk import/export include reference contacts & address — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: FB-011
source_spec: ../../../../03-backlog/sprints/sprint-7/feedback.md
implementation_reference:
  - ../../../../../apps/users/import_configs.py (DriverImportConfig)
  - ../../../../../apps/users/admin.py (DriverAdmin, BulkImportExportMixin)
  - ../../../../../apps/users/models.py (Driver.reference_contact_1/2, address)
  - ../../../../../templates/admin/master_data/bulk_import_upload.html
  - ../../../../../templates/admin/master_data/bulk_import_preview.html
  - ../../../../../templates/admin/master_data/bulk_import_status.html
  - ../../../../../templates/admin/master_data/bulk_export_status.html
last_updated: 2026-08-03
last_mcp_run: 2026-08-03
last_mcp_verdict: 6/6 Pass
artifacts: tests/e2e/playwright-mcp/fb-011-driver-invitation-bulk-import-export-reference-address-artifacts/
playwright_mcp: true
---

# Sprint 7 — FB-011 — Driver invitation bulk import/export: reference contacts & address — E2E Scenario Plan (Django Admin SSR)

> **2026-08-03 — All 6 test cases passed** (TC01–TC06). Suite signed off via Playwright MCP against Nourish admin.

**Last MCP run:** 2026-08-03 · **6/6 Pass** · [RESULTS.md](../../../../../tests/e2e/playwright-mcp/fb-011-driver-invitation-bulk-import-export-reference-address-artifacts/RESULTS.md)  
**Accounts:** `admin.nourish@yopmail.com` · **RUN_ID:** `C22D0304`

**Feedback:** [FB-011](../../../../03-backlog/sprints/sprint-7/feedback.md#fb-011--driver-invitation-bulk-importexport--add-reference-contacts--address)

**AC (assert after fix):**

1. Driver invitation **bulk import** SHALL include columns for **reference contact 1**, **reference contact 2**, and **address** (template, validate, import).
2. Driver invitation **bulk export** SHALL include the same columns.

Target runner: **Playwright MCP** against seeded Nourish (`docs/guides/playwright-mcp-admin.md`).

**Expected CSV columns:** `reference_contact_1`, `reference_contact_2`, `address` — same snake_case headers as `HelperImportConfig` / model fields (`DriverImportConfig.get_csv_headers()`).

---

## Seed prerequisites

| Item | Notes |
|------|--------|
| Actor | **Tenant Admin** (`admin.nourish@yopmail.com`) — Driver write + bulk I/O (also valid: Transport Planner / Driver Supervisor per FB-001) |
| Celery | Worker running (`validate_bulk_import` / `execute_bulk_import` / export generate); restart after Driver model migrations |
| Wipe prefix | `MCP-FB011-` / `MCP FB011` / emails `mcp.fb011.*` |
| Unique keys | Use `RUN_ID` (e.g. 8 hex) in `user_email`, `driving_license_number`, `contact_number`, names so imports never collide with seed drivers |
| Phone format | BD E.164 per Field Rules (e.g. `+88017XXXXXXXX` unique per row) |
| License expiry | Future ISO date `YYYY-MM-DD` |
| Driver type | Enum value from Field Rules (e.g. `own`) |

Minimal required CSV columns for a valid create row (plus the three FB-011 fields under test):

`invite_channel` (optional; default `email`), `user_email`, `first_name`, `last_name`, `contact_number`, `driver_type`, `driving_license_number`, `license_type`, `license_expiry_date`

---

## A — Template & optional columns

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Optional columns list reference contacts + address | As **Tenant Admin** (`admin.nourish@yopmail.com` / `NourishAdmin@1234!`), log in at `/admin/login/`, open **Master Data → Drivers** (`/admin/users/driver/`). Click **Import**. Assert upload page `/admin/users/driver/import/` with heading **Import drivers** (or equivalent verbose plural). Under **Optional Columns**, assert `<code>reference_contact_1</code>`, `<code>reference_contact_2</code>`, and `<code>address</code>` are listed. | P0 | Pass |
| TC02 | CSV template headers include all three columns | Still on the Import page, click **Download CSV Template** (`?template=1`). Assert the downloaded CSV header row includes `reference_contact_1`, `reference_contact_2`, and `address` (alongside existing driver headers such as `user_email`, `first_name`, `contact_number`, `driving_license_number`). | P0 | Pass |
| TC03 | Field rules mark all three optional | On the Import page **Field Rules & Allowed Values**, locate `reference_contact_1`, `reference_contact_2`, and `address`. Assert each shows **Optional** (or equivalent pill). | P1 | Pass |

## B — Import: blank optional cells

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC04 | Blank reference + address import succeeds | As **Tenant Admin**, build a 1-row CSV with unique `user_email=mcp.fb011.z.<RUN_ID>@example.com`, `first_name=MCP`, `last_name=FB011Z<RUN_ID>`, unique `contact_number`, unique `driving_license_number=MCP-FB011-Z-<RUN_ID>`, valid `driver_type` / `license_type` / future `license_expiry_date`, and **empty** `reference_contact_1`, `reference_contact_2`, `address` (columns present, cells blank). Upload via **CSV File** → **Upload and Validate**. Wait until **Import Preview** shows **Valid** = 1. Click **Import 1 Valid Rows**. Wait for **Import Complete** (`completed`) and **Records Imported** ≥ 1. Open `/admin/users/driver/?q=MCP-FB011-Z-<RUN_ID>` (or the driver change form). Assert **Reference contact 1**, **Reference contact 2**, and **Address** are blank / empty. | P0 | Pass |

## C — Import: explicit values

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC05 | Explicit reference contacts + address persist | As **Tenant Admin**, upload a 1-row CSV with unique `user_email=mcp.fb011.v.<RUN_ID>@example.com`, `driving_license_number=MCP-FB011-V-<RUN_ID>`, unique contact/license fields valid, `reference_contact_1=MCP Ref1 <RUN_ID>`, `reference_contact_2=MCP Ref2 <RUN_ID>`, `address=MCP Address Line <RUN_ID>, Dhaka`. Complete validate → preview **Valid** = 1 → **Import 1 Valid Rows** → **Import Complete**. On the driver change form for that license, assert **Reference contact 1** = `MCP Ref1 <RUN_ID>`, **Reference contact 2** = `MCP Ref2 <RUN_ID>`, **Address** contains `MCP Address Line <RUN_ID>`. | P0 | Pass |

## D — Export round-trip columns

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC06 | Export CSV includes reference contacts + address | As **Tenant Admin**, ensure at least one active driver exists with known reference/address values (prefer the driver from **TC05**). From `/admin/users/driver/`, click **Export**. Wait for **Export Complete**, then **Download CSV**. Assert header row includes `reference_contact_1`, `reference_contact_2`, and `address`. Assert the row for `driving_license_number=MCP-FB011-V-<RUN_ID>` has matching reference/address values from TC05. | P0 | Pass |

---

## Implementation Notes (Playwright MCP + Django Admin SSR)

### Scope guardrails

- In scope: Driver changelist **Import** / **Export** SSR (`BulkImportExportMixin` on `DriverAdmin`); template headers; optional-column listing; persist reference contacts + address on create import; export columns.
- Out of scope: REST `/bulk-imports/` / `/bulk-exports/`; Helper bulk I/O (already has these columns); single-driver Add form (covered by `drivers-e2e-scenarios.md` MD_DRV_018/019); invitation email/SMS delivery; FB-009 phone normalization; FB-010 single email field; RBAC negatives unless extended later.

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
| Change form fields | `#id_reference_contact_1`, `#id_reference_contact_2`, `#id_address` |
| Import confirm | button text **Import N Valid Rows** |
| Import done | heading **Import Complete**; **Records Imported** |
| Export done | heading **Export Complete**; link **Download CSV** |

### Known implementation alignment

- `DriverImportConfig` optional `reference_contact_1` / `reference_contact_2` / `address`; `perform_batch_import` assigns them; export headers include them via `get_csv_headers()`.
- Admin SSR exposes the three fields on the driver change form under **References & notes**.
- Broad driver coverage remains in [`drivers-e2e-scenarios.md`](../02-master-data/drivers-e2e-scenarios.md) (MD_DRV_025–028); this plan is **FB-011-only**.

### Suggested artifacts

`tests/e2e/playwright-mcp/fb-011-driver-invitation-bulk-import-export-reference-address-artifacts/` + runner via Playwright MCP `browser_run_code_unsafe` (generate ephemeral CSVs at runtime; wipe `MCP-FB011-*` / related invite users after suite).

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-08-03 | **6/6** | All test cases passed (Playwright MCP). RUN_ID=`C22D0304`. |
