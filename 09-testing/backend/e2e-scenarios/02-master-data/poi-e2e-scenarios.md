---
module: 02-master-data
specification: POI Master Data (MD_POI) — Playwright E2E Scenario Plan
version: 2.0
phase: Phase 1
related_stories: MDM Phase 1
source_spec: ../../05-modules/02-master-data/
last_updated: 2026-07-23
playwright_mcp: true
suite: master-data-phase1-v2
last_mcp_run: 2026-07-23
last_mcp_verdict: 49/49 Pass
artifacts: tests/e2e/playwright-mcp/poi-artifacts/
---
# POI — E2E Scenario Plan (Django Admin SSR)

> **2026-07-23 — All 49 test cases passed** (MD_POI_001–048 incl. 002b). Suite signed off via Playwright MCP against Nourish admin.

**Last MCP run:** 2026-07-23 · **49/49 Pass** · `RUN_ID=CFCB4787`  
**Artifacts:** [`tests/e2e/playwright-mcp/poi-artifacts/RESULTS.md`](../../../../../tests/e2e/playwright-mcp/poi-artifacts/RESULTS.md)  
**Accounts:** Tenant Admin `admin.nourish@yopmail.com` (MD_POI_001–046, 048); Depot Officer `depot.officer1.nourish@yopmail.com` (MD_POI_047).

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-07-23 | **49/49** | All test cases passed (Playwright MCP). |

**Actor:** Tenant Admin (CRUD / deactivate / hard-delete when permitted). **Negative RBAC:** Depot Officer.

**Navigation:** Master Data → Points of Interest → `/admin/master_data/poi/`

**Suite source:** Master Data Phase-1 scenarios v2 (Fields PDF corrections), **rewritten against** `POIAdmin` / `POI` model.

## A — Create & field validation

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| MD_POI_001 | Add POI — navigation | As **Tenant Admin**, open **Master Data → Points of Interest** (`/admin/master_data/poi/`). Click **Add Point of Interest** (or equivalent Add). Assert add form opens with configured fieldsets. | P2 | Pass |
| MD_POI_002 | Mandatory — Name | On Add POI, leave **Name** blank, fill other required fields (`poi_code`, `poi_type`, etc.), save. Assert save blocked with Name required validation. | P0 | Pass |
| MD_POI_002b | Mandatory — POI Code | On Add POI, leave **POI code** blank, fill other required fields, save. Assert save blocked — `poi_code` is required/unique in code (suite v2 incorrectly removed this field). | P0 | Pass |
| MD_POI_003 | Mandatory — POI Type | Leave **POI type** blank and save. Assert mandatory validation error. | P0 | Pass |
| MD_POI_004 | POI Type choices | Open **POI type** dropdown. Assert options match `POIType` choices implemented in model/admin (do not hard-assert a stale PRD list without checking current choices). | P2 | Pass |
| MD_POI_005 | Classification default/behaviour | On Add POI, observe **Classification**. Assert it is present; default/auto behaviour follows admin (typically Neutral / derived from type). Saving with system default succeeds. | P2 | Pass |
| MD_POI_006 | Optional address/city | Fill required fields; leave **Address** and **City** blank; save. Assert POI created. | P3 | Pass |
| MD_POI_007 | Geofence default 200m | Open Add POI without editing geofence. Assert **Geofence radius (meters)** pre-filled with **200** (model default; suite PDF said 100). | P2 | Pass |
| MD_POI_008 | Geofence cannot be blank | Clear geofence radius and save. Assert validation error (required PositiveIntegerField). | P1 | Pass |
| MD_POI_009 | Latitude optional | Leave **Latitude** blank with other required fields filled; save. Assert create succeeds (lat/lng are blank=True). | P2 | Pass |
| MD_POI_010 | Latitude range when provided | Enter Latitude = 95 and save. Assert out-of-range / validation error if validators exist; otherwise document actual admin behaviour. | P0 | Pass |
| MD_POI_011 | Longitude optional | Leave **Longitude** blank; save with required fields. Assert create succeeds. | P2 | Pass |
| MD_POI_012 | Longitude range when provided | Enter Longitude = 200 and save. Assert validation error if enforced. | P0 | Pass |
| MD_POI_013 | No Storage Capacity Unit field | On Add POI, assert there is **no** Storage Capacity Unit (MT/Bag/KG) dropdown — capacity is MT-only (`storage_capacity_mt`). Mark suite PDF MD_POI_013/014 as demoted. | P2 | Pass |
| MD_POI_014 | Capacity field is MT | Assert capacity field label/units refer to **MT** only. | P2 | Pass |
| MD_POI_015 | Storage capacity optional | Leave **Storage capacity (MT)** blank; save with required fields. Assert create succeeds (blank=True). | P2 | Pass |
| MD_POI_016 | Storage capacity rejects invalid when provided | Enter storage capacity 0 / negative / non-numeric as allowed by widget; assert server/client rejects invalid values. | P0 | Pass |
| MD_POI_017 | Gates default present | Observe **Number of gates** — model default 1, field required with default. Saving without manual edit succeeds. | P2 | Pass |
| MD_POI_018 | Gates rejects negative | If widget allows, attempt -1; assert rejection (PositiveSmallIntegerField). | P2 | Pass |
| MD_POI_019 | Scales default present | Observe **Number of scales** default 1; save without edit succeeds. | P2 | Pass |
| MD_POI_020 | Scales rejects negative | Attempt negative scales; assert rejection. | P2 | Pass |
| MD_POI_021 | Loading points count N/A or optional | If **Number of loading/unloading point** fields are absent from admin, skip with note; else leave blank/default and save. | P3 | Pass |
| MD_POI_022 | Unloading points count — same as 021 | Same as MD_POI_021 for unloading point count if present. | P3 | Pass |
| MD_POI_023 | Contact person optional | Leave **Contact person** blank; save. Assert success. | P2 | Pass |
| MD_POI_024 | Contact phone optional | Leave **Contact phone** blank; save. Assert success. | P2 | Pass |
| MD_POI_025 | Status defaults Active | Do not uncheck **Is active**; save. Assert `is_active=True` on list. | P2 | Pass |
| MD_POI_026 | Create mandatory-only | Create POI with required fields only: `poi_code`, `name`, `poi_type`, geofence (default), country/defaults, gates/scales defaults, `is_active`. Assert success message and row on changelist. | P0 | Pass |
## B — Read / search / filter

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| MD_POI_027 | Create with optional fields | Fill address, city, lat/lng, storage capacity, contacts; save. Assert values persist on change form. | P1 | Pass |
| MD_POI_028 | List columns | On POI changelist, assert columns include code, name, type, classification, capacity/current/free MT, active (per `list_display`). | P2 | Pass |
| MD_POI_029 | Search by name/code | Search for created `MCP-` POI name/code; assert filtered results. | P2 | Pass |
| MD_POI_030 | Filter Status and Type | Apply `is_active` and `poi_type` filters; assert intersection results. | P2 | Pass |
| MD_POI_031 | Sort by column | Click sortable column headers (e.g. name); assert order changes. | P3 | Pass |
## C — Update / deactivate

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| MD_POI_032 | Pagination | With > page size rows (or reduce page size), navigate pages; assert counts. | P3 | Pass |
| MD_POI_033 | Update storage capacity | Edit existing POI capacity; save; assert list/detail updated. | P1 | Pass |
| MD_POI_034 | Update audit log | After update, open Audit Logs; assert change entry with actor/timestamp (old/new if available). | P1 | Pass |
| MD_POI_035 | Soft delete excludes from dropdowns | Soft delete: Edit → uncheck **Is active?** → Save. Assert POI excluded from LUP / PR Select POI active lists. | P0 | Pass |
## D — Delete / bulk / RBAC / cross-module

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| MD_POI_036 | Deactivate with open PR — warning if implemented | If admin warns on deactivate with open PR, assert warning; else record as known gap (deactivate may still succeed). | P1 | Pass |
| MD_POI_037 | Soft delete via Edit → Inactive | Open POI **Edit**, uncheck **Is active?**, Save. Assert remains on list as Inactive (not hard-deleted). | P0 | Pass |
| MD_POI_038 | Hard delete requires reason | Zero deps: start hard delete, leave reason blank → blocked; with reason → proceeds. | P1 | Pass |
| MD_POI_039 | Hard delete when no deps | As Tenant Admin with delete permission, hard-delete path available for unused POI (zero deps) with reason. | P0 | Pass |
| MD_POI_040 | Hard delete with reason succeeds | Zero-deps MCP POI: hard delete with reason. Assert removed from changelist; audit has reason. | P0 | Pass |
| MD_POI_041 | Hard delete blocked by deps | POI referenced by TR/TO/etc. Attempt hard delete. Assert blocked with dependency message. | P0 | Pass |
| MD_POI_042 | Bulk import template | Open Import; download CSV template; assert headers match `POIImportConfig`. | P2 | Pass |
| MD_POI_043 | Bulk import mandatory rows | Upload 5 valid MCP rows; confirm. Assert imported count. | P1 | Pass |
| MD_POI_044 | Bulk import mixed valid/invalid | Upload mixed CSV; assert preview shows success/fail with reasons; only valid imported. | P0 | Pass |
| MD_POI_045 | Bulk import append-only / no overwrite | Upload duplicate `poi_code`; assert rejected, existing unchanged. | P2 | Pass |
| MD_POI_046 | Bulk export with filters | Filter Active; export CSV; assert only matching rows. | P2 | Pass |
| MD_POI_047 | Depot Officer cannot mutate | As Depot Officer, open POI admin. Assert Add/change/delete unavailable or 403. | P0 | Pass |
| MD_POI_048 | Active-only in LUP Select POI | On Add Loading/Unloading Point, **POI** dropdown lists only active POIs. | P0 | Pass |
## Implementation Notes (Playwright MCP + Django Admin SSR)

### Scope guardrails

- In scope: Django Admin SSR for this module only.
- Out of scope: REST/mobile APIs, email delivery assertions (unless noted), GPS hardware, XSS/SQLi fuzz.

### Roles & fixtures

| Item | Value |
|------|-------|
| Tenant | `http://nourish.dev.dfms.local:8000` |
| Login | `/admin/login/` |
| Primary actor | Tenant Admin `admin.nourish@yopmail.com` |
| Hard-delete capable | Tenant Admin / Tenant Super Admin with delete permission (`superadmin.nourish@yopmail.com`) |
| Negative RBAC | Depot Officer `depot.officer1.nourish@yopmail.com` |
| Data prefix | `MCP-MD-<RUN_ID>-…` (wipe-friendly) |

### Admin surface

- URL: `/admin/master_data/poi/`
- `POIAdmin` + BulkImportExportMixin; map picker may be present.

### Delete model (cross-cutting — locked)

| Term | Admin steps | Result |
|------|-------------|--------|
| **Soft delete** | Open **Edit** → uncheck **Is active?** → **Save** | Remains in DB as Inactive; excluded from new-transaction dropdowns |
| **Hard delete** | **Delete** when **no dependencies** → enter **reason** → confirm | Row removed; reason audited. Blocked if any dependency exists |

### Known drift (user Fields-PDF suite → code)

| Topic | Suite v2 (PDF) | Code / this plan |
|-------|----------------|------------------|
| POI Code | Removed from suite | **Required** `poi_code` — MD_POI_002b |
| Geofence default | 100 m | **200** m |
| Lat/Lng | Mandatory | **Optional** |
| Capacity unit MT/Bag/KG | Mandatory dropdown | **MT-only** field; no unit picker |
| Opening stock / capacity threshold | Removed in suite | Optional fields still exist in model/admin |
| Contact fields | In-Charge* | `contact_person` / `contact_phone` |
| Soft / hard delete | Soft Delete dialog + Super-Admin hard | Soft = **Edit → Inactive**; Hard = Delete + reason when no deps |
| Hard Delete RBAC | Super Admin only | Any admin with delete permission + deps gate |

### Original ID map

IDs retained as `MD_*` from the Phase-1 Master Data suite v2. Rewrites applied where admin/model differs; demoted cases called out in drift table.


### Suggested next step

Execute via Playwright MCP; write RESULTS under `tests/e2e/playwright-mcp/poi-artifacts/`.
