---
module: 02-master-data
specification: Dealers (MD_DLR) — Playwright E2E Scenario Plan
version: 2.1
phase: Phase 1
related_stories: US-096, DFS-018
source_spec: ../../05-modules/02-master-data/
last_updated: 2026-07-23
playwright_mcp: true
suite: master-data-phase1-v2
last_mcp_run: 2026-07-23
last_mcp_verdict: 22/23 Pass · 1 Fail
artifacts: tests/e2e/playwright-mcp/dealers-artifacts/
---
# Dealers — E2E Scenario Plan

> **2026-07-23 — 22/23 passed** (MD_DLR_001–021). MD_DLR_018 Fail: inactive dealers still appear in On-Demand TO autocomplete (see RESULTS.md BUG-01).

**Last MCP run:** 2026-07-23 · **22/23 Pass · 1 Fail** · `RUN_ID=BC1A986B`  
**Artifacts:** [`tests/e2e/playwright-mcp/dealers-artifacts/RESULTS.md`](../../../../../tests/e2e/playwright-mcp/dealers-artifacts/RESULTS.md)  
**Accounts:** Tenant Admin `admin.nourish@yopmail.com` (MD_DLR_001–020); Depot Officer `depot.officer1.nourish@yopmail.com` (MD_DLR_021).

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-07-23 | **22/23** | MD_DLR_018 Fail — inactive dealer in On-Demand TO AC (Playwright MCP). |

## Test cases

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| MD_DLR_001 | Navigate Add Dealer | As Tenant Admin, open `/admin/master_data/dealer/`, Add. Assert code, name, contact, email, address, site_poi, optional lat/lng/geofence, is_active. | P2 | Pass |
| MD_DLR_002 | Dealer Code mandatory | Blank dealer_code; save blocked. | P0 | Pass |
| MD_DLR_003 | Dealer Name mandatory | Blank dealer_name; blocked. | P0 | Pass |
| MD_DLR_004 | Contact mandatory | Blank contact_number; blocked. | P0 | Pass |
| MD_DLR_005 | Contact format | Invalid phone rejected. | P1 | Pass |
| MD_DLR_006 | Email optional | Blank email; succeeds. | P2 | Pass |
| MD_DLR_007 | Email format | Invalid email rejected. | P1 | Pass |
| MD_DLR_008 | Address mandatory | Blank address; blocked. | P0 | Pass |
| MD_DLR_008b | Site POI mandatory | Leave site_poi blank; save blocked (admin form sets required=True). Suite PDF removed Site POI — **incorrect vs code**. | P0 | Pass |
| MD_DLR_009 | Active default | is_active defaults True. | P2 | Pass |
| MD_DLR_010 | Happy path mandatory | Create with code, name, contact, address, site_poi, active. | P0 | Pass |
| MD_DLR_011 | Code unique | Duplicate dealer_code rejected. | P0 | Pass |
| MD_DLR_011b | Optional lat/lng/geofence | Lat/lng optional; geofence defaults 100. Assert fields exist (suite PDF removed them). | P2 | Pass |
| MD_DLR_012 | Import template | Download CSV template headers. | P2 | Pass |
| MD_DLR_013 | Import valid rows | Import 5 unique codes; succeed. | P1 | Pass |
| MD_DLR_014 | Import duplicate code fails | Duplicate code row fails. | P0 | Pass |
| MD_DLR_015 | Export CSV | Export list. | P2 | Pass |
| MD_DLR_016 | Search/filter/pagination | Exercise list ops. | P2 | Pass |
| MD_DLR_017 | Update contact/address | Edit; save. | P1 | Pass |
| MD_DLR_018 | Deactivate excludes from On-Demand TO | Inactive dealer excluded from FG On-Demand TO Dealer selection. | P0 | Fail |
| MD_DLR_019 | Soft delete via Edit → Inactive | Open **Edit**, uncheck **Is active?**, Save. Assert remains Inactive. | P0 | Pass |
| MD_DLR_020 | Hard delete blocked by deps | Referenced by shipment/PR/TR/TO; hard delete blocked. | P0 | Pass |
| MD_DLR_021 | Depot Officer RBAC | Cannot mutate dealers. | P0 | Pass |

## Implementation Notes (Playwright MCP + Django Admin SSR)

- URL: `/admin/master_data/dealer/`
- Same pattern as Supplier.
- Wipe prefix: `MCP-*-<RUN_ID>` / names `MCP Dealer …`
- Runner: `tests/e2e/playwright-mcp/dealers-artifacts/run-dealers.js`
- Import template: `/admin/master_data/dealer/import/?template=1` (not `/import/template/`).
- Import CSV columns: `dealer_code,dealer_name,contact_number,email,address,site_poi_code,latitude,longitude,geofence_radius,is_active`
- On-Demand TO dealer AC assert: `/admin/autocomplete/?app_label=operations&model_name=gateondemandtorequest&field_name=dealer&term=…`

### Known drift (suite PDF → code)

| Topic | Suite v2 | Code / this plan |
|-------|----------|------------------|
| Site POI / lat / geofence | Removed in suite | **site_poi required**; lat/lng optional; geofence default 100 |
| Inactive dealer autocomplete | Excluded from On-Demand TO | **Not filtered** in `DealerAdmin.get_search_results` (MD_DLR_018 Fail / BUG-01) |
