---
section: 09-testing/backend/e2e-scenarios/02-master-data
title: Master Data Phase-1 E2E Scenario Suite (v2)
version: 2.0
last_updated: 2026-07-22
playwright_mcp: true
---

# Master Data — E2E Scenario Suite (Phase 1 v2)

Executable Django Admin SSR plans for all Master Data (and Users & Access masters) modules.

**Sources (priority):** User workflow & business rules → Fields configuration intent → PRD Phase 1 → prior suite.  
**SSOT for assertions:** `apps/master_data/*`, `apps/users/*` admin (code wins over Fields PDF).

**Actors**

| Role | Seed email | Use |
|------|------------|-----|
| Tenant Admin | `admin.nourish@yopmail.com` | Create / Read / Update / Soft delete / Hard delete (when permitted) |
| Tenant Super Admin | `superadmin.nourish@yopmail.com` | Elevated admin / audit |
| Depot Officer | `depot.officer1.nourish@yopmail.com` | Negative RBAC |

**Delete rule (locked)**

| Term | How to do it in Admin | Result |
|------|----------------------|--------|
| **Soft delete** | Open the master record **Edit** page → uncheck **Is active?** (set Inactive) → **Save** | Row stays in DB; shown as Inactive; excluded from new-transaction dropdowns |
| **Hard delete** | Use Admin **Delete** / delete-permanently when **no dependencies** → enter **reason** → confirm | Row permanently removed; reason written to audit. **Blocked** if any dependency exists |

Not implemented: cascade delete; Super-Admin-only hard delete (any admin with delete permission may hard-delete when clear of deps).

## Module index

| # | Module | File | Case IDs | Count |
|---|--------|------|----------|-------|
| 1 | POI | [poi-e2e-scenarios.md](./poi-e2e-scenarios.md) | MD_POI_001–048 (+002b) | 49 |
| 2 | Loading/Unloading Points | [loading-unloading-points-e2e-scenarios.md](./loading-unloading-points-e2e-scenarios.md) | MD_LUP_001–017 | 17 |
| 3 | Vehicle Brands | [vehicle-brands-e2e-scenarios.md](./vehicle-brands-e2e-scenarios.md) | MD_VB_001–012 | 12 |
| 4 | Vehicles | [vehicles-e2e-scenarios.md](./vehicles-e2e-scenarios.md) | MD_VEH_001–036 | 36 |
| 5 | Drivers | [drivers-e2e-scenarios.md](./drivers-e2e-scenarios.md) | MD_DRV_001–034 | 34 |
| 6 | Helpers | [helpers-e2e-scenarios.md](./helpers-e2e-scenarios.md) | MD_HLP_001–015 | 15 |
| 7 | Suppliers | [suppliers-e2e-scenarios.md](./suppliers-e2e-scenarios.md) | MD_SUP_001–021 (+extras) | 23 |
| 8 | Dealers | [dealers-e2e-scenarios.md](./dealers-e2e-scenarios.md) | MD_DLR_001–021 (+extras) | 23 |
| 9 | Product Categories | [product-categories-e2e-scenarios.md](./product-categories-e2e-scenarios.md) | MD_PCAT_001–020 | 20 |
| 10 | Product Subcategories | [product-subcategories-e2e-scenarios.md](./product-subcategories-e2e-scenarios.md) | MD_PSUB_001–014 | 14 |
| 11 | Products | [products-e2e-scenarios.md](./products-e2e-scenarios.md) | MD_PROD_001–037 | 37 |
| 12 | Users | [users-e2e-scenarios.md](./users-e2e-scenarios.md) | MD_USR_001–037 | 37 |
| 13 | Delete Operations | [delete-operations-e2e-scenarios.md](./delete-operations-e2e-scenarios.md) | MD_DEL_001–018 | 18 |
| | **Total (this folder)** | | | **~335** |

Related deep-dive plans: `../users/user-bulk-import-e2e-scenarios.md`, invitation/deactivation/password plans.

## Corrections applied (suite v1 → v2 intent)

Retained from the user suite where still valid:

1. Actor is **Tenant Admin** (no “Master Data Admin”).
2. Negative RBAC uses **Depot Officer** (not Depot Manager).
3. Helper module added (`MD_HLP_*`).
4. Driver email optional on profile; invite still needs user email.
5. Field optionality corrected toward Fields PDF **then re-checked against models** (see per-file Known drift).

## Code overrides (must not assert PDF-only behaviour)

| Area | Do not assert | Assert instead |
|------|---------------|----------------|
| POI Code | Field absent | `poi_code` required |
| POI geofence default | 100 m | **200** m |
| POI lat/lng / capacity unit | Mandatory / MT·Bag·KG unit | Lat/lng optional; capacity **MT-only** |
| Vehicle body/fuel/capacity/wheels | All mandatory | Only **registration + vehicle_type** required |
| Supplier/Dealer geo + Site POI | Fields absent | **site_poi required**; lat/lng optional; geofence 100 |
| Driver types | Permanent/Temporary only | Also **Own/Vendor** |
| Soft delete | Separate Delete=soft action | **Edit → Inactive → Save** |
| Hard delete | Super Admin only / no reason | **Delete when zero deps + mandatory reason** |
| Cascade delete | Available | **Not implemented** |
| Users hard delete | Allowed | **No admin delete** |

## Suggested MCP run order

1. Brands → Vehicles  
2. POI → LUP  
3. Categories → Subcategories → Products  
4. Suppliers → Dealers  
5. Drivers → Helpers → Users  
6. Delete operations (deps fixtures last)

Artifacts: `tests/e2e/playwright-mcp/master-data-artifacts/`.
