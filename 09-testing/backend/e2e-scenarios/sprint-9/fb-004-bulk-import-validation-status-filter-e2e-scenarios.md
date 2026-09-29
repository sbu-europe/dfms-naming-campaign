---
module: sprint-9
specification: FB-004 — Filter Valid and Invalid records after Excel / bulk import — Playwright E2E Scenario Plan
version: 1.1
phase: Phase 1
related_stories: FB-004
source_spec: ../../../../03-backlog/phase-1/sprints/sprint-9/improvements/02-bulk-import-validation-filter.md
implementation_reference:
  - ../../../../../apps/master_data/admin.py (BulkImportExportMixin.import_preview_view)
  - ../../../../../apps/users/admin.py (BulkImportExportMixin.import_preview_view; UserBulkImportAdmin; DriverAdmin)
  - ../../../../../apps/master_data/services.py (preview_data row status valid|invalid)
  - ../../../../../apps/core/pagination.py (resolve_admin_list_pagination)
  - ../../../../../templates/admin/master_data/bulk_import_preview.html
last_updated: 2026-08-21
playwright_mcp: true
design_system:
  - ../../../../07-design-system/02-components/data-display.md
  - ../../../../07-design-system/04-platforms/web.md
---

# Sprint 9 — FB-004 — Bulk import preview: Valid / Invalid Status filter — E2E Scenario Plan (Django Admin SSR)

**Improvement:** [FB-004](../../../../03-backlog/phase-1/sprints/sprint-9/improvements/02-bulk-import-validation-filter.md#fb-004--filter-valid-and-invalid-records-after-excel--bulk-import)

**AC (assert after fix):**

1. On bulk **Import Preview** (Master Data, User, Driver), a **Status** filter SHALL offer **Valid** and **Invalid**.
2. **Valid** SHALL show only rows with badge **Valid** (`status=valid`).
3. **Invalid** SHALL show only rows with badge **Invalid** (`status=invalid`).
4. Clear / reset SHALL restore **all** preview rows (pagination total matches job `total_rows` / unfiltered list).
5. Filter SHALL be usable by **Tenant Admin** and **Tenant Super Admin**.

**UI (design system):** Filter = `#changelist-filter` (**Filter** / **By status** / **All** · **Valid** · **Invalid**). Pagination = `.dfms-pagination-parent` with `?p=` + `?per_page=` and **Rows per page:** (15/25/50/100/200). See [impl plan](../../../../05-modules/02-master-data/bulk-import-preview-status-filter-fb004.md) and [Data Display](../../../../07-design-system/02-components/data-display.md).

**Story↔code note:** Valid/Invalid lives on the shared **Import Preview** page (`preview_ready`), not on post-confirm changelist rows (invalid rows are skipped on import). Assert against preview UI.

Target runner: **Playwright MCP** against seeded Nourish (`docs/guides/playwright-mcp-admin.md`).

---

## Seed prerequisites

| Item | Notes |
|------|--------|
| Actors | **Tenant Admin** `admin.nourish@yopmail.com` · **Tenant Super Admin** `superadmin.nourish@yopmail.com` (passwords from `docs/testing/playwright-mcp-credentials.yaml`) |
| Celery | Worker running (`validate_bulk_import`) so upload reaches **Import Preview** |
| Wipe prefix | `MCP-FB004-` / `MCP-F04` |
| Mixed CSV | Each suite upload needs ≥1 valid and ≥1 invalid row so both filter sides are observable |
| Representative MD model | **Brand** (`/admin/master_data/brand/`) — simple headers; any other `BulkImportExportMixin` master-data model is acceptable if Brand is unavailable |

Minimal Brand mixed CSV (adjust unique names with `RUN_ID`):

```csv
brand_name,is_active
MCP-FB004-OK-<RUN_ID>,true
,true
```

(Empty `brand_name` should mark the second row **Invalid**.)

User / Driver: use existing import templates from upload page; include one deliberately broken row (e.g. missing required column) plus one valid `MCP-FB004-` row.

---

## A — Master Data Import Preview filter (FB-004-1, FB-004-4)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Preview exposes design-system Status filter | As **Tenant Admin** (`admin.nourish@yopmail.com`), log in at `/admin/login/`, open **Master Data → Brands** (`/admin/master_data/brand/`), click **Import**, upload a mixed valid+invalid CSV, wait until **Import Preview** (`/admin/master_data/brand/import/<job_id>/`). Assert summary shows **Total Rows**, **Valid**, **Invalid** counts > 0 for Valid and Invalid. Assert right sidebar `#changelist-filter` with heading **Filter**, group **By status**, and links **All**, **Valid**, **Invalid** (`li.selected` on **All** when unfiltered). Assert the table shows both **Valid** and **Invalid** badges before filtering. Assert footer `.dfms-pagination-parent` includes **Rows per page:** (`.per-page-selector__select`). | P0 | Planned |
| TC02 | Filter Valid only | Still on the Brand Import Preview with mixed rows, in `#changelist-filter` click **Valid** (`?status=valid`). Assert `li.selected` on **Valid**. Assert every visible row badge is **Valid**; no **Invalid** badge appears. Assert pagination meta / filtered count aligns with `job.valid_rows` when counts differ from total. | P0 | Planned |
| TC03 | Filter Invalid only | On the same preview, click **Invalid** (`?status=invalid`). Assert `li.selected` on **Invalid**. Assert every visible row badge is **Invalid**; no **Valid** badge appears. Assert count aligns with `job.invalid_rows`. | P0 | Planned |
| TC04 | Clear / All shows all rows | With **Invalid** (or **Valid**) still applied, click **All** in `#changelist-filter` (no `status` query param). Assert `li.selected` on **All**. Assert both **Valid** and **Invalid** badges reappear and the listed total matches **Total Rows** / unfiltered preview. | P0 | Planned |

## B — User bulk import (FB-004-2)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC05 | User import preview Status filter | As **Tenant Admin**, open **Users** changelist (`/admin/users/user/`), **Import**, upload a mixed valid+invalid user CSV, wait for **Import Preview** (`/admin/users/user/import/<job_id>/`). Assert `#changelist-filter` **By status** offers **All** / **Valid** / **Invalid**. Select **Invalid** and assert only **Invalid** rows; select **Valid** and assert only **Valid** rows; click **All** and assert all rows return. | P0 | Planned |

## C — Driver bulk import (FB-004-3)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC06 | Driver import preview Status filter | As **Tenant Admin**, open **Drivers** (`/admin/users/driver/`), **Import**, upload a mixed valid+invalid driver CSV, wait for **Import Preview** (`/admin/users/driver/import/<job_id>/`). Assert the same `#changelist-filter` behaviour as TC05 (Valid-only, Invalid-only, **All** → all). | P0 | Planned |

## D — Roles (FB-004-5)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC07 | Tenant Admin can use filter | Covered primarily by TC01–TC06; as **Tenant Admin**, on any of Brand / User / Driver Import Preview, assert `#changelist-filter` is present and selecting **Valid** filters the table without permission error. | P0 | Planned |
| TC08 | Tenant Super Admin can use filter | As **Tenant Super Admin** (`superadmin.nourish@yopmail.com`), open Brand **Import Preview** with a mixed CSV (upload new or open an existing `preview_ready` job if still available). Assert `#changelist-filter` is visible and **Invalid** shows only **Invalid** rows. | P0 | Planned |

## E — Design-system pagination (hardening)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC09 | Pagination preserves Status filter (`?p=`) | As **Tenant Admin**, on a Master Data Import Preview with enough filtered rows that paging appears (upload >25 invalid or set **Rows per page:** to **15** with enough invalid rows), apply **By status** → **Invalid**, then click **Next ›** / a page number if available. Assert URL keeps `status=invalid` and uses `p=` (not legacy `page=`). Assert row badges stay **Invalid**-only across pages. If the filtered set fits on one page, assert paginator meta is consistent — still Pass. | P1 | Planned |
| TC10 | Rows per page + global summary | On filtered preview (**Valid** or **Invalid**), change **Rows per page:** to another allowed value (e.g. 15 → 25). Assert URL has `per_page=` and `status` is preserved; page resets toward first page (`p` absent or `p=1`). Assert header summary **Total Rows** / **Valid** / **Invalid** still reflect the full job (not the filtered page only). | P1 | Planned |

---

## Implementation Notes (Playwright + Django Admin SSR)

### Scope guardrails

- In scope: Django Admin SSR **Import Preview** Status filter + DynamicPagination on Master Data (representative Brand), **User**, and **Driver** — shared template `bulk_import_preview.html`, aligned with [07-design-system](../../../../07-design-system/).
- Out of scope: REST `BulkImportViewSet` API filter/pagination; post-confirm changelist filters; mobile; export flows; inventing new RBAC beyond who already reaches preview.

### Role fixtures

- Prefer seed accounts from `docs/testing/playwright-mcp-credentials.yaml`: `nourish_tenant_admin`, `nourish_tenant_super_admin`.
- Do not use platform super admin for tenant schema import flows unless a TC explicitly requires it.

### Seed / runtime prerequisites

- Celery must process `validate_bulk_import` to `preview_ready`.
- Wipe `MCP-FB004-*` brands/users/drivers after the suite (`detect-wipe-mcp-test-data` / project wipe scripts as applicable).
- Confirm import is **not** required for filter TCs; stay on preview (cancel / leave job, or do not click **Import N Valid Rows** unless a later TC needs it).

### Admin URL names / selectors

| Surface | Upload | Preview pattern |
|---------|--------|-----------------|
| Brand | `admin:master_data_brand_import_upload` | `/admin/master_data/brand/import/<uuid>/` |
| User | `admin:users_user_import_upload` | `/admin/users/user/import/<uuid>/` |
| Driver | `admin:users_driver_import_upload` | `/admin/users/driver/import/<uuid>/` |

Stable UI:

- Filter: `#changelist-filter`, `h2` **Filter**, `h3` **By status**, `li.selected a`
- Table: `.dfms-preview-table`, `.dfms-badge--success` (**Valid**), `.dfms-badge--error` (**Invalid**)
- Pagination: `.dfms-pagination-parent`, `.paginator`, `.dfms-page-prev` / `.dfms-page-next`, `#per-page-select` / `.per-page-selector__select`
- Query: `status`, `p`, `per_page` (not `page`)

### Status assertion note

- Row technical status in `preview_data` is `valid` / `invalid` (lowercase). UI labels are **Valid** / **Invalid**.
- Job-level `valid_rows` / `invalid_rows` are authoritative for summary assertions.

### Known implementation alignment (pre-fix)

- Preview already lists all rows with Status column and badges; **no** `#changelist-filter` yet; pagination is still legacy `?page=` / size 20.
- Master Data and Users/Drivers each have a duplicated `BulkImportExportMixin`; filter + `resolve_admin_list_pagination` must be applied in **both** preview views (or one shared helper) plus the **single** shared template.
- Driver bulk I/O is also available to `MasterData.Driver.Write` holders; FB-004 AC only requires Tenant Admin / Tenant Super Admin — TCs do not block other roles from seeing the filter if they can open preview.

### AC ↔ TC map

| Closing sub-task / AC | TCs |
|-----------------------|-----|
| FB-004-1 Master Data Status filter | TC01–TC04, TC09–TC10 |
| FB-004-2 User import Status filter | TC05 |
| FB-004-3 Driver import Status filter | TC06 |
| FB-004-4 Clear / reset | TC04, TC05, TC06 |
| FB-004-5 Tenant Admin + Tenant Super Admin | TC07, TC08 (+ TC01–TC06 as Tenant Admin) |
| Design-system pagination | TC01, TC09, TC10 |
