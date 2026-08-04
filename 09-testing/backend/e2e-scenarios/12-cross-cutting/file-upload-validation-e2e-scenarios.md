---
module: 12-cross-cutting
specification: File Upload Type & Size Validation (Django Admin) — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: []
source_spec: ../../05-modules/12-cross-cutting/file-upload-validation.md
implementation_reference:
  - ../../../apps/core/upload_validation.py (planned shared helper)
  - ../../../apps/requisitions/admin.py (PRDocumentForm / PortShipmentDocumentInline)
  - ../../../apps/master_data/admin.py (BulkImportExportMixin.import_upload_view)
  - ../../../apps/users/admin.py (DriverAdmin Documents fieldset; Users import_upload_view)
  - ../../../templates/admin/master_data/bulk_import_upload.html
last_updated: 2026-08-03
last_mcp_run: 2026-08-03
last_mcp_verdict: 16/16 Pass
artifacts: tests/e2e/playwright-mcp/file-upload-validation-admin-artifacts/
playwright_mcp: true
suite: file-upload-validation-admin
---

# File Upload Type & Size Validation — E2E Scenario Plan (Django Admin SSR)

**2026-08-03 — All 16 test cases passed** (TC01–TC16). Suite signed off via Playwright MCP against Nourish admin.

**Last MCP run:** 2026-08-03 · **16/16 Pass** · [RESULTS.md](../../../../tests/e2e/playwright-mcp/file-upload-validation-admin-artifacts/RESULTS.md)  
**Accounts:** `commercial.officer1.nourish@yopmail.com` (A), `admin.nourish@yopmail.com` (B, C)  
**RUN_ID:** `2E306B09`

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-08-03 | **16/16** | All test cases passed (Playwright MCP). |

**SSOT:** [`../../05-modules/12-cross-cutting/file-upload-validation.md`](../../05-modules/12-cross-cutting/file-upload-validation.md) §6.3 / upload classes §1

Scope: Django Admin SSR only — PR/Port Shipment document inline, master-data (and users) bulk CSV import upload gate, Driver certificate uploads. Asserts **Document** / **CSV import** policy after the shared validator lands.

Target runner: **Playwright MCP** against seeded Nourish tenant (`docs/guides/playwright-mcp-admin.md`).

**Out of scope:** REST/mobile uploads (PR API, vendor KYC, invitations API, driver transition photo), nginx body-size, retired POD upload.

---

## Fixtures (MCP file artifacts)

Prepare under the run’s artifact / temp dir (wipe-friendly names with `MCP-UP-<RUN_ID>`):

| Alias | Contents | Purpose |
|-------|----------|---------|
| `valid.pdf` | Small real PDF (&lt; 1 MB), name `MCP-UP-<RUN_ID>-arrival.pdf` | Happy path document |
| `valid.jpg` | Small JPEG (&lt; 1 MB), name `MCP-UP-<RUN_ID>.jpg` | Happy path image document |
| `office.docx` | Any small `.docx` (or empty bytes with `.docx` name) | Rejected document type |
| `office.xlsx` | Any small `.xlsx` | Rejected document type |
| `bad.exe.pdf` | Non-PDF bytes named `….exe` (or `….zip`) | Rejected extension |
| `oversize-doc.bin` | File **&gt; 10 MB** with `.pdf` extension | Document size reject |
| `valid.csv` | 1–2 row CSV matching Products (or Users) template headers | CSV happy path (optional) |
| `not.csv.txt` | Text file with `.txt` | CSV type reject |
| `oversize.csv` | CSV **&gt; 10 MB** (pad with filler rows/columns; still `.csv`) | CSV import size reject |
| `oversize-cert.pdf` | PDF **&gt; 10 MB** | Driver certificate size reject |
| `bad-cert.zip` | Small `.zip` | Driver certificate type reject |

Generate oversize files in the MCP session (e.g. write a buffer) — do not commit multi‑MB binaries to git.

---

## A — Port Shipment / PR documents (admin inline)

**Navigation:** **Port Shipments** → draft change form → inline **Arrival Notices & Documents**  
(`PortShipmentDocumentInline` / `PRDocumentForm.clean_file`)

Actor: **Commercial Officer** (can add documents on draft). Tenant Admin also acceptable if CO add permission is blocked in a given seed.

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Valid PDF Arrival Notice under 10 MB saves | As **Commercial Officer** (`commercial.officer1.nourish@yopmail.com`), open a **Draft** Port Shipment change form (create via **Save as Draft** if needed) at `/admin/requisitions/portshipmentproxy/<pk>/change/`. In **Arrival Notices & Documents**, click **Add another Arrival Notice / Document**, set **Document type** to **Arrival Notice**, choose `valid.pdf`, click **Save as Draft** (`_save`). Assert success (no field error on `file`); inline shows the uploaded file name / download link; no message **File too large** or **Unsupported file type**. | P0 | Pass |
| TC02 | Valid JPEG under 10 MB saves | Same as TC01 with `valid.jpg` and document type **Other** (or **Arrival Notice**). Assert save succeeds and file appears on the inline. | P1 | Pass |
| TC03 | Office `.docx` rejected | On draft Port Shipment change form, add document with `office.docx`. Save. Assert form stays on change page with inline/file error containing **Unsupported file type** and listing allowed types including `pdf`, `jpg`, `jpeg`, `png`; **no** new `PRDocument` row for that upload (reload change view — file not listed). | P0 | Pass |
| TC04 | Office `.xlsx` rejected | Repeat TC03 with `office.xlsx`. Assert same type rejection; file not persisted. | P1 | Pass |
| TC05 | Non-allowlisted extension rejected | Upload `bad.exe.pdf` renamed or a `.zip` / `.exe` as the document file. Assert **Unsupported file type** (or equivalent); document not saved. | P0 | Pass |
| TC06 | Document over 10 MB rejected | Upload `oversize-doc.bin` (`.pdf`, &gt; 10 MB). Assert error **File too large. Maximum size is 10 MB.** (or shared helper equivalent); document not saved. | P0 | Pass |

---

## B — Bulk CSV import (master data + users upload gate)

**Navigation:** Master data changelist **Import** (e.g. **Products** → **Import**) and/or **Users → Users → Import**  
Template: `bulk_import_upload.html` — `#csv_file`, **Upload and Validate**

Actor: **Tenant Admin** (`admin.nourish@yopmail.com`).

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC07 | Products Import page accepts small valid CSV for validate | As **Tenant Admin**, open `/admin/master_data/product/import/` (or Products changelist → **Import**). Assert **CSV File** (`#csv_file`), help text notes **Only .csv files**, **Upload and Validate**. Upload `valid.csv` (template-shaped). Assert job proceeds past upload (redirect to validating/preview status) — **not** blocked by type/size gate. *Row-level preview errors are out of scope for this TC.* | P1 | Pass |
| TC08 | Non-CSV rejected at Products Import | On Products Import, upload `not.csv.txt`. Assert stay on upload (or flash error) with **Unsupported file type '.txt'. Allowed: csv.** (shared helper); no new `BulkImportJob` / no redirect to a successful preview for that file. | P0 | Pass |
| TC09 | CSV over 10 MB rejected at Products Import | On Products Import, upload `oversize.csv` (&gt; 10 MB). Assert error **File too large. Maximum size is 10 MB.** (or shared CSV-import message); **no** validate job created / no Celery validate redirect for that upload. | P0 | Pass |
| TC10 | Users Import — non-CSV rejected | As **Tenant Admin** on `/admin/users/user/import/`, upload `not.csv.txt`. Assert **Unsupported file type '.txt'. Allowed: csv.**; no preview job. | P1 | Pass |
| TC11 | Users Import — CSV over 10 MB rejected | On Users Import, upload `oversize.csv` (&gt; 10 MB). Assert size error; no validate job / preview for that upload. | P0 | Pass |
| TC12 | Upload without file blocked | On Products or Users Import, submit **Upload and Validate** with empty `#csv_file`. Assert error **Please select a CSV file to upload.** (or browser `required`) and no job. | P2 | Pass |

---

## C — Driver certificates (admin Documents fieldset)

**Navigation:** **Drivers** → change form → fieldset **Documents**  
Fields: `experience_certificate`, `biodata`, `medical_certificate`

Actor: **Tenant Admin** (or role with Driver change permission).

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC13 | Valid PDF experience certificate under 10 MB saves | As **Tenant Admin**, open an existing Driver change form `/admin/users/driver/<pk>/change/` (prefer MCP-seeded / wipe-friendly driver). In **Documents**, set **Experience certificate** to `valid.pdf`, click **Save**. Assert success message; reopen change form — certificate file link present. | P0 | Pass |
| TC14 | Oversize certificate rejected | On Driver change form, set **Medical certificate** (or **Experience certificate**) to `oversize-cert.pdf` (&gt; 10 MB). Save. Assert field error **File too large. Maximum size is 10 MB.**; prior valid certificate (if any) unchanged; oversize file not stored as the new value. | P0 | Pass |
| TC15 | Non-document type rejected on biodata | Upload `bad-cert.zip` to **Biodata**. Save. Assert **Unsupported file type** for allowed `pdf, jpg, jpeg, png`; biodata not updated to the zip. | P0 | Pass |
| TC16 | Valid JPEG medical certificate under 10 MB saves | Upload `valid.jpg` to **Medical certificate**, Save. Assert success and file shown on reload. | P1 | Pass |

---

## Implementation Notes (Playwright MCP + Django Admin SSR)

### Scope guardrails

| In scope | Out of scope |
|----------|--------------|
| Admin document inline on Port Shipment (and same form class as PR docs) | REST `…/documents/` API |
| Products + Users bulk **upload gate** (type + byte size) | Full import preview/execute happy paths (see `users/user-bulk-import-e2e-scenarios.md`) |
| Driver **Documents** fieldset type + size | Driver transition photo API, Helper documents |
| Assert UI errors + non-persistence | Magic-byte / Content-Type-only cases |

### Role & environment fixtures

| Item | Value |
|------|--------|
| Tenant | `http://nourish.dev.dfms.local:8000` |
| Login | `/admin/login/` |
| Commercial Officer (A) | `commercial.officer1.nourish@yopmail.com` / `Nourish@1234!` |
| Tenant Admin (B, C) | `admin.nourish@yopmail.com` / `NourishAdmin@1234!` |
| Credentials SSOT | `docs/testing/playwright-mcp-credentials.yaml` |

### Admin URLs & selectors

| Surface | Path / control |
|---------|----------------|
| Port Shipment change | `/admin/requisitions/portshipmentproxy/<pk>/change/` |
| Documents inline | heading **Arrival Notices & Documents**; file input under `documents-` / `prdocument` formset; **Add another Arrival Notice / Document** |
| Save draft | **Save as Draft** (`name="_save"`) |
| Products Import | `/admin/master_data/product/import/` — `#csv_file`, **Upload and Validate** |
| Users Import | `/admin/users/user/import/` — same template controls |
| Drivers change | `/admin/users/driver/<pk>/change/` — fieldset **Documents**; inputs `experience_certificate`, `biodata`, `medical_certificate` |
| Errors | `.errorlist`, `.messagelist .error`, inline form errors inside `#content-main` |

### Expected messages (post shared validator)

Align with `file-upload-validation.md` §1:

- Type: `Unsupported file type '.{ext}'. Allowed: pdf, jpg, jpeg, png.` (CSV: `Only .csv files are accepted…`)
- Size: `File too large. Maximum size is 10 MB.`

If copy differs slightly after implementation, update this plan’s assertions to match shipped strings (code wins).

### Seed / wipe

- Port Shipment: create draft with vessel/B/L containing `MCP-UP-<RUN_ID>`; wipe by remark / `pr_number`.
- Drivers: prefer existing seed driver; if creating, use wipe-friendly name `MCP-UP-DRV-<RUN_ID>`.
- Bulk import: oversize/type rejects must leave **no** job (or only failed upload with no preview); do not confirm import.
- Do not commit oversize fixture binaries; generate per run.

### Suggested MCP run order

1. Generate fixtures (small + oversize).  
2. TC01 → TC06 (documents).  
3. TC08 → TC09 → TC11 (CSV negatives; TC07 optional).  
4. TC13 → TC16 (driver).  
5. Write `RESULTS.md` under `tests/e2e/playwright-mcp/file-upload-validation-admin-artifacts/`.

### Related scenario plans

- Port Shipment happy path: `raw-material-workflow/01-port-shipment/rm-commercial-officer-port-shipment-e2e-scenarios.md`
- Users import (full flow): `users/user-bulk-import-e2e-scenarios.md` (TC13–TC14 overlap on missing/non-CSV — this plan owns **size** + cross-model upload gate)
