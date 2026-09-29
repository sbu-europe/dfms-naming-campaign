---
module: 02-master-data
specification: Bulk Import Preview — Valid / Invalid Status filter (Sprint 9 — FB-004)
version: 1.1
phase: Phase 1
sprint: Sprint 9 (FB-004)
last_updated: 2026-08-21
changelog: "v1.1 — Pagination & Status filter must follow 07-design-system (DynamicPagination + #changelist-filter), matching vehicle-planning / vendors custom admin lists."
related_stories: Master Data Excel / bulk import; User bulk import; Driver bulk import
feedback_items: FB-004
baseline_spec: bulk-import-export.md
feedback_tracker: ../../03-backlog/phase-1/sprints/sprint-9/improvements/02-bulk-import-validation-filter.md
e2e_scenarios: ../../09-testing/backend/e2e-scenarios/sprint-9/fb-004-bulk-import-validation-status-filter-e2e-scenarios.md
design_system:
  - ../../07-design-system/02-components/data-display.md
  - ../../07-design-system/04-platforms/web.md
implementation_reference:
  - nourish-backend/apps/master_data/admin.py
  - nourish-backend/apps/users/admin.py
  - nourish-backend/apps/master_data/services.py
  - nourish-backend/apps/core/pagination.py
  - nourish-backend/templates/admin/master_data/bulk_import_preview.html
  - nourish-backend/templates/admin/transport/vehicle_planning/select_vehicle.html (reference layout)
---

# Bulk Import Preview — Valid / Invalid Status filter (FB-004)

Sprint 9 implementation plan for [FB-004](../../03-backlog/phase-1/sprints/sprint-9/improvements/02-bulk-import-validation-filter.md#fb-004--filter-valid-and-invalid-records-after-excel--bulk-import). Amends [bulk-import-export.md](./bulk-import-export.md) §7.3 (Import Preview). Applies to **Master Data**, **User**, and **Driver** bulk import (shared preview template).

**Problem:** After CSV validation, Import Preview shows every row with a **Valid** / **Invalid** badge, but there is no way to isolate failures without scanning the full paginated list.

**Rule:** On Import Preview (`preview_ready`), provide a **Status** filter with **Valid** and **Invalid**. Clear / reset shows all rows again. Available to anyone who can open preview (AC calls out **Tenant Admin** and **Tenant Super Admin**).

**UI contract:** Filter and pagination MUST follow [07-design-system](../../07-design-system/) — not ad-hoc preview chrome. Mirror custom admin lists such as vehicle planning / vendors.

Do the steps **in this order**. Step 1 is the lock: without shared filtering, the two mixins will drift.

---

## Design system (locked)

Sources: [Data Display](../../07-design-system/02-components/data-display.md) · [Web platform](../../07-design-system/04-platforms/web.md) · `apps/core/pagination.py` · `static/admin/css/custom.css`.

### Filter — `#changelist-filter`

| Rule | Value |
|------|--------|
| Markup | Right sidebar `#changelist-filter` (reuse existing admin CSS — do **not** invent pills/dropdowns) |
| Header | `<h2>Filter</h2>` |
| Group | `<h3>By status</h3>` (title case per typography-and-labels) |
| Options | **All** (clear) · **Valid** · **Invalid** as `<ul><li><a>` |
| Selected | `li.selected` on the active option |
| Query | `?status=valid` · `?status=invalid` · omit `status` for All |
| Preserve | Keep `per_page` (and other params) on filter links; changing status resets page to `p=1` |

Layout reference: `templates/admin/transport/vehicle_planning/select_vehicle.html` — main column + `#changelist-filter` sibling.

### Pagination — DynamicPagination

| Rule | Value |
|------|--------|
| Helper | `resolve_admin_list_pagination(request, session_key=...)` from `apps/core/pagination.py` |
| Page param | `?p=` (1-indexed) — **replace** legacy `?page=` on this admin preview |
| Page size | `?per_page=` with `VALID_PER_PAGE = {15, 25, 50, 100, 200}`; default **25** |
| Session | Optional `session_key` e.g. `per_page_bulk_import_preview` (same contract as `DynamicPaginationMixin`) |
| Footer markup | `.dfms-pagination-parent` → `.dfms-pagination-numbers` (`.paginator` with **‹ Prev** / page links / **Next ›**) + `.dfms-pagination-controls` (`.per-page-selector` / **Rows per page:** / `.per-page-selector__select`) |
| Changing per-page | Resets to `p=1`; hidden inputs must carry `status` when set |
| Show all | Must not appear |

Do **not** keep the current bespoke “Previous / Next only + fixed 20” footer in `bulk_import_preview.html`.

REST `BulkImportViewSet` may keep its own `?page=` / page size — out of scope for FB-004.

---

## Story ↔ code placement

| Story wording | Implemented surface |
|---------------|---------------------|
| “After Excel / bulk import” / “imported-record list” | **Import Preview** only — `BulkImportJob.status = preview_ready`, rows in `job.preview_data[]` with `status: "valid" \| "invalid"` |
| Post-confirm changelist | **Out of scope** — invalid rows are skipped on execute; persisted entities have no Valid/Invalid flag |

Summary bar (**Total** / **Valid** / **Invalid** counts) stays **job-global** even when the table is filtered.

---

## Current behaviour (baseline)

- `ImportService.validate()` writes each row as `{ row_num, status, data, errors }` into `preview_data`.
- `BulkImportExportMixin.import_preview_view` in **both** `apps/master_data/admin.py` and `apps/users/admin.py` paginates with `Paginator(..., 20)` and `?page=` — **not** design-system DynamicPagination.
- Shared template: `templates/admin/master_data/bulk_import_preview.html` — badges exist; **no** `#changelist-filter`; custom `.dfms-pagination` block.

---

## Step 1 — Shared filter helper

Needed by FB-004-1, FB-004-2, and FB-004-3.

Prefer a small pure function (e.g. on `ImportService` or `apps/master_data/services.py`) so both mixins stay in sync:

```python
def filter_preview_rows(preview_data: list, status: str | None) -> list:
    """status in {"valid", "invalid"} or None/empty → all rows. Ignore unknown values."""
```

- Input: full `job.preview_data`, optional GET `status`.
- Output: filtered list (same row shape). Unknown / empty `status` → unfiltered.
- No DB change; no mutation of `job.preview_data`.

**Verify:** unit tests — mixed rows, valid-only, invalid-only, empty filter, garbage `status=foo`.

---

## Step 2 — Wire Master Data preview (FB-004-1)

File: `apps/master_data/admin.py` — `BulkImportExportMixin.import_preview_view`

When rendering preview (`preview_ready`):

1. Normalize `status` from `request.GET` → `valid` / `invalid` / `None`.
2. `rows = filter_preview_rows(job.preview_data, status)`.
3. `page_num, per_page = resolve_admin_list_pagination(request, session_key="per_page_bulk_import_preview")`.
4. `Paginator(rows, per_page)` → `page_obj = paginator.get_page(page_num)`.
5. Context: `status_filter`, `page_obj`, `paginator`, `page_range` (Django `Paginator.get_elided_page_range` if useful), `per_page_choices` / `current_per_page` from `PER_PAGE_CHOICES` / `per_page`.

**Verify:** Brand Import Preview; `?status=valid`, `?status=invalid&p=2&per_page=15`.

---

## Step 3 — Wire User / Driver preview (FB-004-2, FB-004-3)

File: `apps/users/admin.py` — `BulkImportExportMixin.import_preview_view`

Same GET contract + helper + `resolve_admin_list_pagination` as Step 2. Do **not** invent a second filter or page-param contract.

**Verify:** User and Driver Import Preview filter + pagination.

---

## Step 4 — Preview template UI (FB-004-4)

File: `templates/admin/master_data/bulk_import_preview.html`

### Layout

```
+-- summary / actions / hints ------------------+
+-- main (table) ----------+-- #changelist-filter --+
|  preview table           |  Filter                 |
|  .dfms-pagination-parent |  By status              |
|                          |  All / Valid / Invalid  |
+--------------------------+-------------------------+
```

Use a filtered-module flex layout consistent with vehicle planning (`#changelist.module.filtered` pattern or equivalent preview wrapper) so the filter sits on the **right**.

### Filter block (required markup)

```html
<div id="changelist-filter">
  <h2>{% trans "Filter" %}</h2>
  <h3>{% trans "By status" %}</h3>
  <ul>
    <li class="selected"><!-- when no status --><a href="?per_page=…">All</a></li>
    <li><!-- when status=valid --><a href="?status=valid&amp;per_page=…">Valid</a></li>
    <li><!-- when status=invalid --><a href="?status=invalid&amp;per_page=…">Invalid</a></li>
  </ul>
</div>
```

### Pagination block (required markup)

Replace the current `.dfms-pagination` with design-system footer (same structure as `select_vehicle.html`):

- `.dfms-pagination-parent` / `.dfms-pagination-numbers` / `.paginator`
- Labels **‹ Prev** / **Next ›** (not “Previous” / “Next”)
- Page number links using `?p=`
- `.dfms-pagination-controls` + GET form `.per-page-selector` with label **Rows per page:** and `.per-page-selector__select`
- Hidden fields: preserve `status` when set; changing `per_page` omits `p` (resets to page 1)

Summary stats stay job-global (`job.total_rows` / `valid_rows` / `invalid_rows`).

**Verify:** All clears filter; filter + page links keep `status`; per-page select works (FB-004-4).

---

## Step 5 — Docs / AC checklist

- Amend [bulk-import-export.md](./bulk-import-export.md) §7.3: design-system filter + DynamicPagination on admin preview.
- Tick FB-004 closing sub-tasks when code matches.

---

## Touch list

| Path | Change |
|------|--------|
| `apps/master_data/services.py` (or small util) | `filter_preview_rows` |
| `apps/master_data/admin.py` | Preview: status filter + `resolve_admin_list_pagination` |
| `apps/users/admin.py` | Same preview wiring |
| `templates/admin/master_data/bulk_import_preview.html` | `#changelist-filter` + `.dfms-pagination-parent` |
| Unit tests | Helper; preview respects `status` / `p` / `per_page` |
| Migrations | **None** |

Do **not** merge the duplicated `BulkImportExportMixin` classes in this ticket. Do **not** change confirm/execute or REST `BulkImportViewSet` unless product later asks for API parity.

---

## Risks & out of scope

| Leave it | Why |
|----------|-----|
| REST API `?status=` / changing API `?page=` | FB-004 is Admin SSR; API keeps its own pagination |
| Post-import changelist filters | No Valid/Invalid on persisted rows |
| Merging master_data vs users mixins | Speculative refactor |
| New RBAC for the filter alone | Preview already permission-gated |
| Custom pill/dropdown Status UI | Violates `#changelist-filter` design-system pattern |
| Client-only JS filter without URL | Breaks shareable `?status=` / `?p=` state |
| Re-skinning Valid/Invalid badges | Out of FB-004 unless already wrong vs `.dfms-badge` |

---

## How we know it is done

1. Upload a mixed Master Data CSV → Import Preview shows `#changelist-filter` with **By status** → **All** / **Valid** / **Invalid**.
2. **Valid** → only **Valid** badges; filtered count aligns with `valid_rows`.
3. **Invalid** → only **Invalid** badges; aligns with `invalid_rows`.
4. **All** → both badge types; total matches **Total Rows**.
5. Footer is `.dfms-pagination-parent` with **Rows per page:** (`15|25|50|100|200`) and `?p=` / `?per_page=` in the URL; filter choice preserved when paging or changing page size.
6. Same behaviour on **User** and **Driver** import preview.
7. **Tenant Admin** and **Tenant Super Admin** can open preview and use the filter.
8. E2E plan passes: [fb-004-bulk-import-validation-status-filter-e2e-scenarios.md](../../09-testing/backend/e2e-scenarios/sprint-9/fb-004-bulk-import-validation-status-filter-e2e-scenarios.md).

---

## Closing checklist (tracker)

- [ ] FB-004-1 — Master Data Status filter
- [ ] FB-004-2 — User import Status filter
- [ ] FB-004-3 — Driver import Status filter
- [ ] FB-004-4 — Clear / reset shows all
- [ ] FB-004-5 — Tenant Admin + Tenant Super Admin
