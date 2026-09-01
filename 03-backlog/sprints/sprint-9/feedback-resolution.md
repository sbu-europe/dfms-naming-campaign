---
title: Sprint 9 — Feedback Resolution Tracker
source_sprint: Sprint 9
total_items: 2
resolved: 2
in_progress: 0
open: 0
---

# Sprint 9 — Feedback Resolution Tracker

Client feedback captured during Sprint 9.

> **Resolution Status values**: `Open` → `In Progress` → `Resolved`

> **Not in this tracker:** workflow / UX improvement items live in [`improvements/`](./improvements/README.md) (FB-001–FB-004).

## All items

| ID | Title | Menu / area | Priority | Status |
|----|-------|-------------|----------|--------|
| [FB-001](#fb-001--bulk-export-must-round-trip-with-import--no-missing-fields) | Bulk export must round-trip with import; no missing fields | Bulk Import / Export (all registry models) | High | Resolved |
| [FB-002](#fb-002--invite-user-back-button-must-return-to-users-list) | Invite user back button must return to Users list | Users → Invite / Add user | Medium | Resolved |

## Resolution Summary

| Priority | Total | Resolved | Open |
|----------|-------|----------|------|
| High | 1 | 1 | 0 |
| Medium | 1 | 1 | 0 |
| **Total** | **2** | **2** | **0** |

---

## FB-001 — Bulk export must round-trip with import; no missing fields

| Field | Value |
|-------|-------|
| **Source** | UAT — 2026-08-20 |
| **Affected Stories** | Bulk import/export ([`bulk-import-export.md`](../../../05-modules/02-master-data/bulk-import-export.md)); all `IMPORT_REGISTRY` models (Product, Product Category, Product Sub-Category, Brand, Vehicle, Supplier, Dealer, POI, Loading/Unloading, Driver, Helper, User) |
| **Closing Sub-tasks** | FB-001-1 — Export CSV **headers match** the import template (same names, same order) · FB-001-2 — Export **cell values are import-legal** (lookup codes / enum values, not Django object reprs or empty FK columns) · FB-001-3 — Export includes **every importable field** that has stored data (no silent omission) · FB-001-4 — Unchanged export file **re-imports** as valid (export → import round-trip) |
| **AC Amendment** | For every model with bulk import/export, the **exported CSV SHALL be re-importable without column remapping or data loss**. Export headers SHALL be identical to the downloadable import template. Each exported row SHALL contain the same columns import accepts, populated with the stored values in the format import validates (codes, ISO dates, E.164 phones, `true`/`false`). Fields present on the record and accepted by import SHALL NOT be blank or absent in the export. |
| **Status** | Resolved |
| **Priority** | High |
| **Notes** | UAT: exported files are not identical to what import accepts; some stored data is missing from the export. Treat as a **platform-wide** bulk I/O defect, not a single-menu tweak. Confirm per registry config (`get_csv_headers` vs `get_export_row`). |

### Client feedback observation

During UAT, exporting any bulk-enabled list does not produce a file that can be imported as-is. The export is also missing some of the data that exists on the records.

Ops need: **export → edit in spreadsheet → import** without rebuilding columns or losing fields.

### Current vs expected behaviour

| Aspect | Current (UAT) | Expected (FB-001) |
|--------|---------------|-------------------|
| Export vs import template | Headers / layout not identical to import | **Same columns, same order** as the import template |
| Export cell format | Values import rejects (or cannot map) | **Import-legal** values (codes, enums, dates, booleans) |
| Completeness | Some stored fields missing or blank in export | **Every importable field** with stored data is present and populated |
| Round-trip | Export file cannot be re-imported as-is | **Export → re-import** of unchanged data validates and upserts without errors |

### Likely causes to confirm (do not treat as closed findings)

`BaseImportConfig.get_export_row` reads `getattr(obj, field_cfg.name)`. CSV columns that are **not model attributes** (`category_code`, `brand_name`, `site_poi_code`, `user_email`, …) stay empty unless the config overrides `get_export_row`. Enum / FK fields may serialize as Python objects instead of the string import expects. Default `get_export_queryset` also filters `is_active=True`, which can omit inactive rows that still exist in admin.

Audit each `IMPORT_REGISTRY` config: headers, `get_export_row`, and a real export → import round-trip.

### Closing checklist

- [x] FB-001-1 — Export CSV headers match the import template (names + order) for every registry model
- [x] FB-001-2 — Export values are import-legal (lookup codes / enums; no empty FK-code columns)
- [x] FB-001-3 — Export includes every importable field that has stored data
- [x] FB-001-4 — Unchanged export file re-imports as valid (round-trip) for every registry model

---

## FB-002 — Invite user back button must return to Users list

| Field | Value |
|-------|-------|
| **Source** | UAT — 2026-08-21 |
| **Affected Stories** | User invitation ([`tenant-user-management.md`](../../../05-modules/03-users/tenant-user-management.md) §3); US-005 ([`US-005-user-invitation-activation.md`](../sprint-2/02-tenant-user-management/US-005-user-invitation-activation.md)) |
| **Closing Sub-tasks** | FB-002-1 — Back / cancel control on **Add / Invite user** navigates to **Users list** (`/admin/users/user/`) · FB-002-2 — Confirm it does **not** land on a different changelist (e.g. invitation / other model list) |
| **AC Amendment** | From the Users **Add / Invite user** page, the back (or equivalent cancel) control SHALL return the admin to the **Users / User list** page (`/admin/users/user/`), not another list. |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | Invite flow is entered from the User list; back navigation should reverse that entry path. |

### Client feedback observation

On the Users **Add invitation / Invite user** page, the back button goes to a different list page instead of the Users list the admin came from.

### Current vs expected behaviour

| Aspect | Current (UAT) | Expected (FB-002) |
|--------|---------------|-------------------|
| Back / cancel from Invite user | Lands on a **different** list page | Lands on **Users / User list** (`/admin/users/user/`) |

### Closing checklist

- [x] FB-002-1 — Back / cancel on Add / Invite user goes to `/admin/users/user/`
- [x] FB-002-2 — Does not navigate to a different changelist
