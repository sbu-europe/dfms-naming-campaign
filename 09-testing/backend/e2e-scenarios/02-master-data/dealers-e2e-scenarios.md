---
module: 02-master-data
specification: Dealers (MD_DLR) — Playwright E2E Scenario Plan
version: 2.0
phase: Phase 1
related_stories: US-096, DFS-018
source_spec: ../../05-modules/02-master-data/
last_updated: 2026-07-22
playwright_mcp: true
suite: master-data-phase1-v2
---
# Dealers — E2E Scenario Plan

## Test cases

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| MD_DLR_001 | Navigate Add Dealer | As Tenant Admin, open `/admin/master_data/dealer/`, Add. Assert code, name, contact, email, address, site_poi, optional lat/lng/geofence, is_active. | P2 | Planned |
| MD_DLR_002 | Dealer Code mandatory | Blank dealer_code; save blocked. | P0 | Planned |
| MD_DLR_003 | Dealer Name mandatory | Blank dealer_name; blocked. | P0 | Planned |
| MD_DLR_004 | Contact mandatory | Blank contact_number; blocked. | P0 | Planned |
| MD_DLR_005 | Contact format | Invalid phone rejected. | P1 | Planned |
| MD_DLR_006 | Email optional | Blank email; succeeds. | P2 | Planned |
| MD_DLR_007 | Email format | Invalid email rejected. | P1 | Planned |
| MD_DLR_008 | Address mandatory | Blank address; blocked. | P0 | Planned |
| MD_DLR_008b | Site POI mandatory | Leave site_poi blank; save blocked (admin form sets required=True). Suite PDF removed Site POI — **incorrect vs code**. | P0 | Planned |
| MD_DLR_009 | Active default | is_active defaults True. | P2 | Planned |
| MD_DLR_010 | Happy path mandatory | Create with code, name, contact, address, site_poi, active. | P0 | Planned |
| MD_DLR_011 | Code unique | Duplicate dealer_code rejected. | P0 | Planned |
| MD_DLR_011b | Optional lat/lng/geofence | Lat/lng optional; geofence defaults 100. Assert fields exist (suite PDF removed them). | P2 | Planned |
| MD_DLR_012 | Import template | Download CSV template headers. | P2 | Planned |
| MD_DLR_013 | Import valid rows | Import 5 unique codes; succeed. | P1 | Planned |
| MD_DLR_014 | Import duplicate code fails | Duplicate code row fails. | P0 | Planned |
| MD_DLR_015 | Export CSV | Export list. | P2 | Planned |
| MD_DLR_016 | Search/filter/pagination | Exercise list ops. | P2 | Planned |
| MD_DLR_017 | Update contact/address | Edit; save. | P1 | Planned |
| MD_DLR_018 | Deactivate excludes from On-Demand TO | Inactive dealer excluded from FG On-Demand TO Dealer selection. | P0 | Planned |
| MD_DLR_019 | Soft delete via Edit → Inactive | Open **Edit**, uncheck **Is active?**, Save. Assert remains Inactive. | P0 | Planned |
| MD_DLR_020 | Hard delete blocked by deps | Referenced by shipment/PR/TR/TO; hard delete blocked. | P0 | Planned |
| MD_DLR_021 | Depot Officer RBAC | Cannot mutate dealers. | P0 | Planned |
## Implementation Notes (Playwright MCP + Django Admin SSR)

- URL: `/admin/master_data/dealer/`
- Same pattern as Supplier.
- Wipe prefix: `MCP-MD-<RUN_ID>-`

### Known drift (suite PDF → code)

| Topic | Suite v2 | Code / this plan |
|-------|----------|------------------|
| Site POI / lat / geofence | Removed in suite | **site_poi required**; lat/lng optional; geofence default 100 |
