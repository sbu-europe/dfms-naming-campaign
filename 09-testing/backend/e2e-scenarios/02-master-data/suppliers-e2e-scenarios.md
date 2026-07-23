---
module: 02-master-data
specification: Suppliers (MD_SUP) — Playwright E2E Scenario Plan
version: 2.1
phase: Phase 1
related_stories: US-096, DFS-018
source_spec: ../../05-modules/02-master-data/
last_updated: 2026-07-23
playwright_mcp: true
suite: master-data-phase1-v2
last_mcp_run: 2026-07-23
last_mcp_verdict: 23/23 Pass
artifacts: tests/e2e/playwright-mcp/suppliers-artifacts/
---
# Suppliers — E2E Scenario Plan

> **2026-07-23 — All 23 test cases passed** (MD_SUP_001–021). Suite signed off via Playwright MCP against Nourish admin.

**Last MCP run:** 2026-07-23 · **23/23 Pass** · `RUN_ID=5C3784C1`  
**Artifacts:** [`tests/e2e/playwright-mcp/suppliers-artifacts/RESULTS.md`](../../../../../tests/e2e/playwright-mcp/suppliers-artifacts/RESULTS.md)  
**Accounts:** Tenant Admin `admin.nourish@yopmail.com` (MD_SUP_001–020); Depot Officer `depot.officer1.nourish@yopmail.com` (MD_SUP_021).

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-07-23 | **23/23** | All test cases passed (Playwright MCP). |

## Test cases

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| MD_SUP_001 | Navigate Add Supplier | As Tenant Admin, open `/admin/master_data/supplier/`, Add. Assert code, name, contact, email, address, site_poi, optional lat/lng/geofence, is_active. | P2 | Pass |
| MD_SUP_002 | Supplier Code mandatory | Blank supplier_code; save blocked. | P0 | Pass |
| MD_SUP_003 | Supplier Name mandatory | Blank supplier_name; blocked. | P0 | Pass |
| MD_SUP_004 | Contact mandatory | Blank contact_number; blocked. | P0 | Pass |
| MD_SUP_005 | Contact format | Invalid phone rejected. | P1 | Pass |
| MD_SUP_006 | Email optional | Blank email; succeeds. | P2 | Pass |
| MD_SUP_007 | Email format | Invalid email rejected. | P1 | Pass |
| MD_SUP_008 | Address mandatory | Blank address; blocked. | P0 | Pass |
| MD_SUP_008b | Site POI mandatory | Leave site_poi blank; save blocked (admin form sets required=True). Suite PDF removed Site POI — **incorrect vs code**. | P0 | Pass |
| MD_SUP_009 | Active default | is_active defaults True. | P2 | Pass |
| MD_SUP_010 | Happy path mandatory | Create with code, name, contact, address, site_poi, active. | P0 | Pass |
| MD_SUP_011 | Code unique | Duplicate supplier_code rejected. | P0 | Pass |
| MD_SUP_011b | Optional lat/lng/geofence | Lat/lng optional; geofence defaults 100. Assert fields exist (suite PDF removed them). | P2 | Pass |
| MD_SUP_012 | Import template | Download CSV template headers. | P2 | Pass |
| MD_SUP_013 | Import valid rows | Import 5 unique codes; succeed. | P1 | Pass |
| MD_SUP_014 | Import duplicate code fails | Duplicate code row fails. | P0 | Pass |
| MD_SUP_015 | Export CSV | Export list. | P2 | Pass |
| MD_SUP_016 | Search/filter/pagination | Exercise list ops. | P2 | Pass |
| MD_SUP_017 | Update contact/address | Edit; save. | P1 | Pass |
| MD_SUP_018 | Deactivate excludes from On-Demand TO | Inactive supplier excluded from Gate On-Demand selection. | P0 | Pass |
| MD_SUP_019 | Soft delete via Edit → Inactive | Open **Edit**, uncheck **Is active?**, Save. Assert remains Inactive. | P0 | Pass |
| MD_SUP_020 | Hard delete blocked by deps | Referenced by shipment/PR/TR/TO; hard delete blocked. | P0 | Pass |
| MD_SUP_021 | Depot Officer RBAC | Cannot mutate suppliers. | P0 | Pass |

## Implementation Notes (Playwright MCP + Django Admin SSR)

- URL: `/admin/master_data/supplier/`
- Activate/Deactivate/Delete permanently actions.
- Wipe prefix: `MCP-*-<RUN_ID>` / names `MCP Supplier …`
- Runner: `tests/e2e/playwright-mcp/suppliers-artifacts/run-suppliers.js`
- Import template: `/admin/master_data/supplier/import/?template=1` (not `/import/template/`).
- Import CSV columns: `supplier_code,supplier_name,contact_number,email,address,site_poi_code,latitude,longitude,geofence_radius,is_active`
- On-Demand TO supplier AC assert: `/admin/autocomplete/?app_label=operations&model_name=gateondemandtorequest&field_name=supplier&term=…`
- `SupplierAdmin.get_search_results` filters `is_active=True` on `/autocomplete/` (same as Dealer/Brand).

### Known drift (suite PDF → code)

| Topic | Suite v2 | Code / this plan |
|-------|----------|------------------|
| Site POI / lat / geofence | Removed in suite | **site_poi required**; lat/lng optional; geofence default 100 |
