---
module: 02-master-data
specification: Delete Operations Cross-Module (MD_DEL) — Playwright E2E Scenario Plan
version: 2.1
phase: Phase 1
related_stories: MDM-02 / master-data-delete-operations
source_spec: ../../05-modules/02-master-data/master-data-delete-operations.md
last_updated: 2026-07-22
playwright_mcp: true
suite: master-data-phase1-v2
---
# Delete Operations (Cross-Module) — E2E Scenario Plan

**SSOT:** [`../../05-modules/02-master-data/master-data-delete-operations.md`](../../05-modules/02-master-data/master-data-delete-operations.md)

## Locked terminology

| Term | Admin steps | Expected result |
|------|-------------|-----------------|
| **Soft delete** | Open master **Edit** page → uncheck **Is active?** → **Save** | Record remains; status **Inactive**; excluded from new PR/TR/TO dropdowns |
| **Hard delete** | Admin **Delete** (or delete permanently) when **no dependency** → enter **reason** → confirm | Row removed from DB; audit stores Timestamp, Admin, Entity, Reason. If any dependency exists → **blocked** with dependency message |

Cascade delete and Super-Admin-only hard delete are **not** implemented.

## Test cases

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| MD_DEL_001 | Soft delete via Edit → Inactive | As **Tenant Admin**, for a POI (then Vehicle, Product, Supplier): open **Edit**, uncheck **Is active?**, Save. Assert row remains on changelist as Inactive (not removed). | P0 | Planned |
| MD_DEL_002 | Hard delete available when permitted | As Tenant Admin with delete permission, on an unused master with zero deps, assert **Delete** / hard-delete path is available (not Super-Admin-only). | P0 | Planned |
| MD_DEL_003 | Hard delete requires reason when no deps | Zero-deps record: start hard delete; leave reason blank → blocked. Enter reason → confirm → record removed. | P0 | Planned |
| MD_DEL_004 | Hard delete reason mandatory | At hard-delete confirmation, blank reason blocks completion. | P0 | Planned |
| MD_DEL_005 | Hard delete blocked by open PR | Entity on open PR; hard delete blocked citing PR. | P0 | Planned |
| MD_DEL_006 | Hard delete blocked by open TR | POI on open TR; blocked citing TR. | P0 | Planned |
| MD_DEL_007 | Hard delete blocked by TO | Vehicle/Driver on TO; blocked citing TO. | P0 | Planned |
| MD_DEL_008 | Hard delete blocked by Trip history | Vehicle with trip history; blocked. | P0 | Planned |
| MD_DEL_009 | Hard delete blocked by QC | Product with QC records; blocked. | P0 | Planned |
| MD_DEL_010 | Dependency message detail | Warning lists dependency categories/counts when available. | P1 | Planned |
| MD_DEL_011 | Cascade delete not offered | Assert cascade delete is **not** available. | P1 | Planned |
| MD_DEL_012 | Cascade restriction N/A | Demoted — cascade not implemented. | P1 | Planned |
| MD_DEL_013 | Soft delete audit | After Edit → Inactive, audit shows actor/timestamp for the status change (if audit captures field changes). | P0 | Planned |
| MD_DEL_014 | Hard delete audit with reason | After hard delete, audit retains entity details + delete reason. | P0 | Planned |
| MD_DEL_015 | Restore soft-deleted record | Soft-deleted (Inactive) record: Edit → check **Is active?** → Save. Assert Active again and selectable in new transactions. | P2 | Planned |
| MD_DEL_016 | Soft delete preserves historical TO | Soft-delete a POI that has closed TOs; open historical TO — POI name/details still shown. | P0 | Planned |
| MD_DEL_017 | Concurrent edit vs hard delete | Optional edge: concurrent Edit vs hard delete — assert no silent data loss if locking exists; else note gap. | P2 | Planned |
| MD_DEL_018 | Soft then hard delete after bulk import | Fresh imported unused row: soft delete (Edit → Inactive), then hard delete with reason when zero deps — same rules as manually created. | P3 | Planned |

## Implementation Notes (Playwright MCP + Django Admin SSR)

- Applies to `TenantMasterDataAdmin` models (POI, Brand, Vehicle, Supplier, Dealer, Product, Category, Subcategory, LUP, …).
- **Users:** no admin hard delete — soft lifecycle only (deactivate / `is_active`).
- **Helpers:** prefer Edit → Inactive for suite “soft delete”; model also has `deleted_at` soft-delete path — assert whichever Admin exposes.
- Wipe prefix: `MCP-MD-<RUN_ID>-`

### Known drift (suite PDF → this lock)

| Topic | Suite PDF v2 | This plan |
|-------|--------------|-----------|
| Soft delete | Separate Delete → Soft Delete dialog + reason | **Edit page → Inactive → Save** |
| Hard delete | Super Admin + two-step only | Delete when **no deps** + **reason** (permission-gated) |
| Cascade | Sometimes offered | **Not implemented** |
