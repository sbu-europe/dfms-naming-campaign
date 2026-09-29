---
module: sprint-8
specification: FB-001 — Phone number normalization on bulk user upload & driver import — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: FB-001
source_spec: ../../../../03-backlog/phase-1/sprints/sprint-8/improvements/01-users-and-access.md
implementation_reference:
  - ../../../../../apps/core/phone.py (normalize_bd_mobile, coerce_bd_mobile, validate_bd_mobile_import)
  - ../../../../../apps/users/import_configs.py (UserImportConfig.phone_number, DriverImportConfig.contact_number)
  - ../../../../../apps/users/admin.py (UserBulkImportAdmin / DriverAdmin, BulkImportExportMixin)
  - ../../../../../templates/admin/master_data/bulk_import_upload.html
  - ../../../../../templates/admin/master_data/bulk_import_preview.html
  - ../../../../../templates/admin/master_data/bulk_import_status.html
last_updated: 2026-08-03
last_mcp_run: 2026-08-03
last_mcp_verdict: 8/8 Pass
artifacts: tests/e2e/playwright-mcp/fb-009-phone-normalization-bulk-user-driver-import-artifacts/
playwright_mcp: true
---

# Sprint 8 — FB-001 — Phone normalization on bulk user upload & driver import — E2E Scenario Plan (Django Admin SSR)

> **2026-08-03 — All 8 test cases passed** (TC01–TC08). Suite signed off via Playwright MCP against Nourish admin.

**Last MCP run:** 2026-08-03 · **8/8 Pass** · [RESULTS.md](../../../../../tests/e2e/playwright-mcp/fb-009-phone-normalization-bulk-user-driver-import-artifacts/RESULTS.md)  
**Accounts:** `admin.nourish@yopmail.com` · **RUN_ID:** `EE845722`

**Improvement:** [FB-001](../../../../03-backlog/phase-1/sprints/sprint-8/improvements/01-users-and-access.md#fb-001--phone-number-normalization-on-bulk-user-upload--driver-import)

**AC (assert after fix / against `normalize_bd_mobile`):**

1. On **Bulk User Upload** and **Driver** bulk import, the system SHALL **strip hyphens** from phone data when present.
2. The system SHALL **add a leading `0`** when the local number is missing it (10-digit national starting with `1`).
3. After hyphen strip and optional leading-`0` add, the local mobile SHALL be a valid BD mobile (**11-digit** `01[3-9]XXXXXXXX` shape); invalid lengths SHALL fail preview validation.
4. Persisted value SHALL be E.164 `+8801XXXXXXXXX` (see Implementation Notes — story wording vs code).

Target runner: **Playwright MCP** against seeded Nourish (`docs/guides/playwright-mcp-admin.md`).

**Surfaces under test:**

| Surface | Admin path | CSV column |
|---------|------------|------------|
| Bulk User Upload | `/admin/users/user/import/` | `phone_number` |
| Driver bulk import | `/admin/users/driver/import/` | `contact_number` |

---

## Seed prerequisites

| Item | Notes |
|------|--------|
| Actor | **Tenant Admin** (`admin.nourish@yopmail.com` / `NourishAdmin@1234!`) — Users + Drivers bulk import |
| Celery | Worker running (`validate_bulk_import` / `execute_bulk_import`) |
| Wipe prefix | `MCP-FB009-` / emails `mcp.fb009.*` / licenses `MCP-FB009-*` |
| Unique keys | One `RUN_ID` (8 hex) per session; unique emails, `employee_id`, `driving_license_number`, and **phone subscribers** per TC |
| Phone uniqueness | Each TC uses a distinct BD national `1[3-9]\d{8}` never present on seed users/drivers. Build trailing digits from a numeric `PHONE_SEQ` (do not reuse across TCs in the same run) |
| User role | Non–POI-scoped `transport_planner` (avoids `poi_code`) unless a TC states otherwise |
| Driver row | Minimal valid create columns + unique `contact_number` under test (see FB-003/FB-004 plans) |

### Phone input shapes (FB-001)

Let `<N8>` = 8 unique digits so `17<N8>` is a valid BD national (`1[3-9]` + 8 digits).

| Shape | Example CSV cell | Expected after normalize |
|-------|------------------|--------------------------|
| Hyphenated 11-digit local | `017-<a4>-<b4>` where `17<a4><b4>` = `17<N8>` | `+88017<N8>` |
| Missing leading `0` | `17<N8>` | `+88017<N8>` |
| Hyphenated + missing `0` | `17<a4>-<b4>` | `+88017<N8>` |
| Invalid length (after strip) | `017-123` or `0171234567` / `017123456789` | Preview **Invalid** |

---

## A — Bulk User Upload: normalize then validate

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | User import strips hyphens in `phone_number` | As **Tenant Admin**, log in at `/admin/login/`, open **Users → Users** (`/admin/users/user/`), click **Import**. Build a 1-row CSV with unique `email=mcp.fb009.h.<RUN_ID>@yopmail.com`, `employee_id=MCP-FB009-H-<RUN_ID>`, names, `role=transport_planner`, `otp_type=none`, blank `poi_code`, and `phone_number` set to a **hyphenated** 11-digit local mobile (`017-xxxx-xxxx` using unique `<N8>`). Click **Upload and Validate**. Wait for **Import Preview** with **Valid** = 1. Click **Import 1 Valid Rows**. Wait for **Import Complete**. Open `/admin/users/user/?q=mcp.fb009.h.<RUN_ID>` (user change form). Assert **Phone number** persists as E.164 `+88017<N8>` (no hyphens). | P0 | Pass |
| TC02 | User import prefixes leading `0` when missing | As **Tenant Admin**, upload a 1-row Users CSV like TC01 with unique `email=mcp.fb009.z.<RUN_ID>@yopmail.com`, `employee_id=MCP-FB009-Z-<RUN_ID>`, and `phone_number=17<N8>` (**no** leading `0`, no hyphens). Assert preview **Valid** = 1 → import completes. On the user change form, assert **Phone number** = `+88017<N8>`. | P0 | Pass |
| TC03 | User import rejects phone not 11 digits after normalize | As **Tenant Admin**, upload a 1-row Users CSV with unique email/`employee_id` (`mcp.fb009.bad.<RUN_ID>@yopmail.com`) and `phone_number` that remains invalid after hyphen strip / leading-`0` rules (e.g. `017-123` or `0171234567`). Wait for **Import Preview**. Assert **Invalid** ≥ 1, row status **Invalid**, Errors mention `phone_number` / valid BD mobile. Confirm **Import 0 Valid Rows** is disabled. Assert no user created for that email. | P0 | Pass |
| TC04 | User import accepts hyphenated number without leading `0` | As **Tenant Admin**, upload a Users CSV with unique identity and `phone_number=17xxxx-xxxx` (hyphens present, leading `0` absent, unique `<N8>`). Assert preview **Valid** = 1 → import → change form **Phone number** = `+88017<N8>`. | P1 | Pass |

## B — Driver bulk import: normalize then validate

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC05 | Driver import strips hyphens in `contact_number` | As **Tenant Admin**, open **Master Data → Drivers** (`/admin/users/driver/`), click **Import**. Build a 1-row driver CSV with unique `user_email=mcp.fb009.dh.<RUN_ID>@example.com`, `first_name=MCP`, `last_name=FB009H<RUN_ID>`, `driving_license_number=MCP-FB009-DH-<RUN_ID>`, valid `driver_type` / `license_type` / future `license_expiry_date`, and `contact_number` as **hyphenated** 11-digit local (`017-xxxx-xxxx`, unique `<N8>`). **Upload and Validate** → preview **Valid** = 1 → **Import 1 Valid Rows** → **Import Complete**. Open driver via `/admin/users/driver/?q=MCP-FB009-DH-<RUN_ID>`. Assert **Contact number** = `+88017<N8>` (no hyphens). | P0 | Pass |
| TC06 | Driver import prefixes leading `0` when missing | As **Tenant Admin**, upload a driver CSV like TC05 with unique license/email (`MCP-FB009-DZ-<RUN_ID>`) and `contact_number=17<N8>` (missing leading `0`). Assert preview **Valid** = 1 → import → change form **Contact number** = `+88017<N8>`. | P0 | Pass |
| TC07 | Driver import rejects contact not 11 digits after normalize | As **Tenant Admin**, upload a driver CSV with otherwise unique valid fields and `contact_number=017-123` (or other length-invalid local after strip). Assert **Import Preview** **Invalid** ≥ 1, Errors mention `contact_number` / valid BD mobile, **Import 0 Valid Rows** disabled, and no driver with that license created. | P0 | Pass |
| TC08 | Driver import accepts hyphenated number without leading `0` | As **Tenant Admin**, upload a driver CSV with unique keys and `contact_number=17xxxx-xxxx` (hyphens, no leading `0`). Assert preview **Valid** = 1 → import → **Contact number** = `+88017<N8>`. | P1 | Pass |

---

## Implementation Notes (Playwright MCP + Django Admin SSR)

### Scope guardrails

- In scope: Users **Import** (`UserImportConfig.phone_number`) and Drivers **Import** (`DriverImportConfig.contact_number`) SSR validate → preview → execute; hyphen strip; missing leading `0`; length/validity after normalize; persisted E.164 on change forms.
- Out of scope: Helper bulk import; single-user / single-driver Add forms; REST `/bulk-imports/`; invitation SMS/email delivery; export CSV phone formatting; RBAC negatives (covered in `users/user-bulk-import-e2e-scenarios.md`); FB-003/FB-004 optional driver columns.

### Role & environment fixtures

| Item | Value |
|------|--------|
| Tenant | `http://nourish.dev.dfms.local:8000` |
| Login | `/admin/login/` |
| Primary actor | `admin.nourish@yopmail.com` / `NourishAdmin@1234!` |
| Credentials | `docs/testing/playwright-mcp-credentials.yaml` |
| Celery | Required for validate / execute |

### Admin URLs & selectors

| Surface | Path / selector |
|---------|-----------------|
| Users changelist | `/admin/users/user/` |
| Users import | `/admin/users/user/import/` |
| Drivers changelist | `/admin/users/driver/` |
| Drivers import | `/admin/users/driver/import/` |
| CSV file input | `#csv_file` |
| Upload | **Upload and Validate** |
| Confirm | **Import N Valid Rows** |
| Import done | heading **Import Complete**; **Records Imported** |
| User phone field | change form phone / `#id_phone_number` (label **Phone number**) |
| Driver contact field | change form **Contact number** / `#id_contact_number` |

### Example CSV snippets

Users (TC01 — hyphenated phone; replace `<RUN_ID>` / `<N8>`):

```csv
email,employee_id,first_name,last_name,role,department,phone_number,otp_type,poi_code
mcp.fb009.h.<RUN_ID>@yopmail.com,MCP-FB009-H-<RUN_ID>,MCP,FB009H,transport_planner,,017-1xxx-xxxx,none,
```

Drivers (TC05 — hyphenated contact; include other required headers from Field Rules / template):

```csv
invite_channel,user_email,first_name,last_name,contact_number,driver_type,driving_license_number,license_type,license_expiry_date
email,mcp.fb009.dh.<RUN_ID>@example.com,MCP,FB009H<RUN_ID>,017-1xxx-xxxx,own,MCP-FB009-DH-<RUN_ID>,<license_type>,<future YYYY-MM-DD>
```

### Known implementation alignment

- Shared coerce/validate: `apps.core.phone.normalize_bd_mobile` via `coerce_bd_mobile` / `validate_bd_mobile_import` on both import configs.
- Separators stripped include spaces, hyphens, and parentheses (`_SEPARATORS_RE`).
- Missing leading `0`: 10-digit national `1[3-9]XXXXXXXX` is accepted and stored as `+880…` (equivalent to “add leading 0 then take national”).
- **Story vs code:** FB-001 AC text emphasises an intermediate **11-digit** local form; runtime persistence is **E.164** `+8801XXXXXXXXX`. E2E asserts the persisted E.164 value and that hyphen / missing-`0` inputs validate; do not assert the CSV cell is rewritten to 11 local digits on disk.
- Unit coverage already exists in `tests/unit/test_core/test_phone.py`; this plan covers admin SSR import surfaces only.

### Suggested artifacts

`tests/e2e/playwright-mcp/fb-009-phone-normalization-bulk-user-driver-import-artifacts/` + ephemeral CSVs at runtime; wipe `MCP-FB009-*` / `mcp.fb009.*` users/drivers after suite.

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-08-03 | **8/8** | All test cases passed (Playwright MCP). RUN_ID=`EE845722`. |
