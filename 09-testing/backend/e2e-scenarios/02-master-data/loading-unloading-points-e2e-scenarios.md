---
module: 02-master-data
specification: Loading/Unloading Points (MD_LUP) — Playwright E2E Scenario Plan
version: 2.0
phase: Phase 1
related_stories: MDM Phase 1
source_spec: ../../05-modules/02-master-data/
last_updated: 2026-07-22
playwright_mcp: true
suite: master-data-phase1-v2
---
# Loading/Unloading Points — E2E Scenario Plan (Django Admin SSR)

**URL:** `/admin/master_data/loadingunloadingpoint/`

## Test cases

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| MD_LUP_001 | Navigate Add LUP | As Tenant Admin, open `/admin/master_data/loadingunloadingpoint/`, click Add. Assert form shows POI, name, short_code, operation_type, notes, is_active. | P2 | Planned |
| MD_LUP_002 | POI mandatory | Leave POI blank; save. Assert required error. | P0 | Planned |
| MD_LUP_003 | Active POIs only | Dropdown lists only active POIs. | P0 | Planned |
| MD_LUP_004 | Name mandatory | Leave Name/Label blank; save. Assert error. | P0 | Planned |
| MD_LUP_005 | Short code unique per POI | Create second point under same POI with duplicate short_code. Assert unique constraint error. | P1 | Planned |
| MD_LUP_006 | Short code reusable across POIs | Reuse short_code under different POI; assert success. | P2 | Planned |
| MD_LUP_007 | Operation type choices | Dropdown shows Loading/Unloading (LOAD/UNLOAD labels per admin). | P2 | Planned |
| MD_LUP_008 | Operation type mandatory | Leave blank; save; assert error. | P0 | Planned |
| MD_LUP_009 | Notes optional | Leave notes blank; save succeeds. | P3 | Planned |
| MD_LUP_010 | Active default | Create without unchecking is_active; assert Active. | P2 | Planned |
| MD_LUP_011 | Happy path create | Create valid LUP; appears under selected POI on list. | P0 | Planned |
| MD_LUP_012 | Filter POI + operation | Apply list_filter poi + operation_type; assert results. | P2 | Planned |
| MD_LUP_013 | Edit name/notes | Edit name/notes; save; assert persisted (short_code/operation_type readonly on change). | P1 | Planned |
| MD_LUP_014 | Deactivate excludes from bay assignment | Set inactive; assert absent from Command Center bay assignment for new assigns. | P0 | Planned |
| MD_LUP_015 | Soft delete via Edit → Inactive | Open **Edit**, uncheck **Is active?**, Save. Assert remains Inactive. | P0 | Planned |
| MD_LUP_016 | Hard delete blocked by TO bay | Point on in-progress TO; hard delete blocked with dep warning. | P0 | Planned |
| MD_LUP_017 | Depot Officer RBAC | Depot Officer cannot add/edit/delete LUPs. | P0 | Planned |
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

- URL: `/admin/master_data/loadingunloadingpoint/`
- Bulk import/export via `BulkImportExportMixin` (CSV: `poi_code`, `short_code`, `name`, `operation_type`, optional `is_active`/`notes`). short_code/operation_type readonly on change form.

### Delete model (cross-cutting — locked)

| Term | Admin steps | Result |
|------|-------------|--------|
| **Soft delete** | Open **Edit** → uncheck **Is active?** → **Save** | Remains in DB as Inactive; excluded from new-transaction dropdowns |
| **Hard delete** | **Delete** when **no dependencies** → enter **reason** → confirm | Row removed; reason audited. Blocked if any dependency exists |

### Known drift (user Fields-PDF suite → code)

| Topic | Suite v2 (PDF) | Code / this plan |
|-------|----------------|------------------|
| Soft / hard delete | Soft = Delete dialog | Soft = **Edit → Inactive**; Hard = Delete + reason when no deps |

### Original ID map

IDs retained as `MD_*` from the Phase-1 Master Data suite v2. Rewrites applied where admin/model differs; demoted cases called out in drift table.


### Suggested next step

Execute via Playwright MCP; write RESULTS under `tests/e2e/playwright-mcp/master-data-artifacts/`.
