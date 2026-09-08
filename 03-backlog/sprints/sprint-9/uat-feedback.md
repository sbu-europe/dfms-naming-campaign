---
title: Sprint 9 — UAT Feedback
source_sprint: Sprint 9
total_items: 3
resolved: 3
in_progress: 0
open: 0
---

# Sprint 9 — UAT Feedback

Client feedback captured during UAT.

> **Resolution Status values**: `Open` → `In Progress` → `Resolved`

## All items

| ID | Title | Menu / area | Priority | Status |
|----|-------|-------------|----------|--------|
| [UAT-001](#uat-001--type-rm-must-display-as-raw-materials) | Type RM shows "Port Consignment" instead of "Raw Materials" | TR / PR Type | High | Resolved |
| [UAT-002](#uat-002--tr-find-rows-by-source-and-destination-poi-name) | TR find rows by Source and Destination POI name | Transport / Distribution · Transport Requests | Medium | Resolved |
| [UAT-003](#uat-003--recent-imports-must-show-uploaded-csv-file-name) | Recent Imports must show uploaded CSV file name | Master Data / Users · Bulk Import | Medium | Resolved |

## Resolution Summary

| Priority | Total | Resolved | Open |
|----------|-------|----------|------|
| High | 1 | 1 | 0 |
| Medium | 2 | 2 | 0 |
| **Total** | **3** | **3** | **0** |

---

## UAT-001 — Type RM must display as Raw Materials

| Field | Value |
|-------|-------|
| **Source** | UAT — 2026-09-07 |
| **Affected Stories** | TR / PR type labels (`PRType` / `TRType` in `apps/requisitions/constants.py`); Transport Request list, detail, filters, and TO-from-TR |
| **Closing Sub-tasks** | UAT-001-1 — User-facing Type for RM SHALL display **Raw Materials** (not "Port Consignment") · UAT-001-2 — Same label on list, detail, filters, and related create/select screens |
| **AC Amendment** | Wherever Type is shown for RM (`PORT_CONSIGNMENT` stored value), the **visible label SHALL be "Raw Materials"**. Do not show "Port Consignment". |
| **Status** | Resolved |
| **Priority** | High |
| **Notes** | Stored enum value can stay `PORT_CONSIGNMENT`. This is a **display-label** change for ops. Verified 2026-09-07 on Nourish admin (Transport Planner): TR list Type column, Type filter, TR detail, and TO-from-TR Type (`get_tr_type_display`) all show **Raw Materials**. |

### Client feedback observation

Type RM is not showing correctly — it is showing **"Port Consignment"** instead of **Raw Materials**.

Ops need: Type RM must read **Raw Materials**.

### Current vs expected behaviour

| Aspect | Current (UAT) | Expected (UAT-001) |
|--------|---------------|-------------------|
| Type label for RM | **Port Consignment** | **Raw Materials** |

### Closing checklist

- [x] UAT-001-1 — Type RM displays as **Raw Materials** (not "Port Consignment")
- [x] UAT-001-2 — List, detail, filters, and related screens use the same **Raw Materials** label

---

## UAT-002 — TR find rows by Source and Destination POI name

| Field | Value |
|-------|-------|
| **Source** | UAT — 2026-09-07 |
| **Affected Stories** | [TRQ-01](../sprint-3/05-transport/01-transport-requests-queue.md) (TP TR queue); [DR-02](../sprint-3/03-distribution/DR-02-transport-requests.md) (FG TRs); [PC-02](../sprint-3/04-procurement/PC-02-transport-requests.md) (Port Consignment TRs); module spec [`transport-requisition-management.md`](../../../05-modules/05-transport/transport-requisition-management.md) |
| **Closing Sub-tasks** | UAT-002-1 — TR list **Search** matches **Source POI** name and code · UAT-002-2 — TR list **Search** matches **Destination POI** name and code · UAT-002-3 — A POI query returns TRs where that POI is **origin or destination** (OR) · UAT-002-4 — Existing **TR number** and **Source PR** search still work |
| **AC Amendment** | For **Transport Planner** and **TDO** (Own Fleet / Vendor Fleet), the **Transport Requests** list **Search** box SHALL match **Source POI** and **Destination POI** **name** (and **POI code**, because the list shows `Name (Code)`). Typing a POI name SHALL return every TR whose origin **or** destination contains that string (case-insensitive). Existing TR-number / Source-PR search SHALL continue to work in the same box. The right-hand FILTER panel (TR type, status, urgency) SHALL be unchanged. |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | Implemented 2026-09-07: `TransportRequisitionAdmin.search_fields` and `TransportRequisitionViewSet.search_fields` now include `source_poi` / `destination_poi` name and code, OR’d with TR number and Source PR. Same Search box — not a new FILTER chip. Not role-locked. Out of scope: Transport Orders list; requiring both origin and destination in one query. |

### Client feedback observation

POI search is required for **TP** and **TDO**. They should be able to search by POI name and see origin- and destination-POI-wise data in the list.

On **Transport Requests**, the Search box currently finds **TR number** only. The client wants to search the same box by **Source / Destination POI name**.

### Current vs expected behaviour

| Aspect | Current (UAT) | Expected (UAT-002) |
|--------|---------------|-------------------|
| Search box | Matches **TR number** (admin also matches Source PR number) | Also matches **Source POI** and **Destination POI** name (and code) |
| Origin vs destination | Cannot find a TR by POI name | One query matches **origin or destination** |
| Roles | TP / TDO cannot locate TRs by POI | **TP** and **TDO** can filter the list by POI name via Search |
| FILTER sidebar | By TR type / status / urgency | **Unchanged** — no new POI filter chip |
| TR / PR number search | Works | **Still works** in the same box |

### Confirmed assumptions (for implementation after approval)

- Same Search box; no new FILTER control.
- OR match: one POI name returns TRs where it is source **or** destination.
- Match `POI.name` and `POI.poi_code` (list display is `{name} ({poi_code})`).
- Keep current TR number and Source PR number search.
- Apply on `TransportRequisitionAdmin` (the UAT screenshot). Also update API `search_fields` (`tr_number` only today).
- Not role-gated on the changelist.

### Closing checklist

- [x] UAT-002-1 — TR list Search matches Source POI name and code
- [x] UAT-002-2 — TR list Search matches Destination POI name and code
- [x] UAT-002-3 — A POI query returns TRs where that POI is origin or destination
- [x] UAT-002-4 — Existing TR number and Source PR search still work

---

## UAT-003 — Recent Imports must show uploaded CSV file name

| Field | Value |
|-------|-------|
| **Source** | UAT — 2026-09-07 |
| **Affected Stories** | Bulk import/export ([`bulk-import-export.md`](../../../05-modules/02-master-data/bulk-import-export.md)); admin upload template `templates/admin/master_data/bulk_import_upload.html`; `BulkImportJob` (`apps/master_data/models.py`) |
| **Closing Sub-tasks** | UAT-003-1 — **Recent Imports** card shows the uploaded CSV **file name** · UAT-003-2 — File name is **above** the existing date/time · UAT-003-3 — Date, status badge, and row counts stay unchanged · UAT-003-4 — Same sidebar on **every** bulk-import page that uses this template |
| **AC Amendment** | For **Tenant Admin** and **Tenant Super Admin**, each item in the bulk-import **Recent Imports** sidebar SHALL display the uploaded CSV **file name** (basename, e.g. `100_pois.csv`) **above** the import date/time. Status and row statistics SHALL remain as they are. The file name SHALL appear as soon as the job is listed (including **Preview Ready**), not only after confirm. |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | Implemented 2026-09-07: `BulkImportJob.uploaded_filename` returns the CSV basename; `bulk_import_upload.html` Recent Imports shows it above date/time. Date, status, and row counts unchanged. Shared template covers all bulk-import pages. **Recent Exports** unchanged. |

### Client feedback observation

Tenant Admin / Tenant Super Admin should see the CSV file name after uploading (and in Recent Imports). Today the card shows only the import date (e.g. `Sep 07, 2026 16:03`). If they uploaded `100_pois.csv`, that name must appear, with date and time still below it.

UAT screenshot: **Import POIS** — Recent Imports lists `Preview Ready` and row counts, but not the file name (`pois_100_mixed.csv` was selected in the chooser).

### Current vs expected behaviour

| Aspect | Current (UAT) | Expected (UAT-003) |
|--------|---------------|-------------------|
| Recent Imports card | Date, status, row counts | **CSV file name** + date + status + row counts |
| File name placement | Missing | **Above** the date/time |
| File name value | — | Basename, e.g. `100_pois.csv` (not storage path) |
| When it appears | — | While the job is in Recent Imports, including **Preview Ready** |
| Status / row counts | Shown | **Unchanged** |
| Roles | Tenant Admin / Tenant Super Admin cannot tell which file was uploaded | They can identify the file from the sidebar |

### Confirmed assumptions (for implementation after approval)

- Shared **Recent Imports** sidebar on all bulk-import pages using `bulk_import_upload.html` (POI, Product, Users, Drivers, …) — not POI-only.
- Display only; no new filter or filename search.
- Basename only.
- Existing jobs: use stored `uploaded_file` basename when available; skip the filename line if there is no file.
- **Recent Exports** unchanged.

### Closing checklist

- [x] UAT-003-1 — Recent Imports card shows the uploaded CSV file name
- [x] UAT-003-2 — File name is above the existing date/time
- [x] UAT-003-3 — Date, status badge, and row counts stay unchanged
- [x] UAT-003-4 — Same sidebar on every bulk-import page that uses this template

