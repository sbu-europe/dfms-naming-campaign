---
module: 02-master-data
specification: Master data — codebase alignment (nourish-backend)
version: 1.1
phase: Phase 1
last_updated: 2026-04-17
---

# Master data configuration (implementation map)

This file summarizes how **master data** is implemented in this repository so the product-context specs stay aligned with code.

## Application package

- **`apps/master_data/`** — Django app containing models, admin, serializers, Celery tasks, and REST viewsets.
- **`apps/users/`** — **`Driver`** and **`Helper`** aggregates (models + admin + CSV configs); identity **`User`** / **`UserRole`** live here.

## Shared bulk import registry

`IMPORT_REGISTRY` is defined in **`apps/master_data/import_configs.py`** and **extended at runtime** by **`apps/users/import_configs.register_user_import_configs()`** (called from **`UsersConfig.ready`**). That adds **`driver`** and **`helper`** so **`DriverAdmin`** and **`HelperAdmin`** use the same **`BulkImportJob`** / Celery pipeline as master-data admins.

## Data layer

- **`apps/master_data/models.py`** — Tenant-scoped entities (`POI`, `ProductCategory`, `ProductSubCategory`, `Product`, `Brand`, `Vehicle`, `Supplier`, `Dealer`, `BulkImportJob`, `BulkExportJob`).
- **Bulk jobs** — `FILE_RETENTION_DAYS` and `expires_at` on first save define how long uploaded/result files are kept before purge tasks remove them.

## Django admin

- **`apps/master_data/admin.py`** and **`apps/users/admin.py`** — Model admins; **`BulkImportExportMixin`** adds CSV import/export **only** when:
  1. The admin class includes the mixin, and  
  2. **`IMPORT_REGISTRY`** defines a config for that model’s `model_name`.

- **Vehicle** — Additional CRUD audit hooks call **`apps.audit.services`** where integrated.

## CSV import registry (keys)

| Registry key       | App          | Model             |
|--------------------|--------------|-------------------|
| `supplier`         | `master_data`| `Supplier`        |
| `dealer`           | `master_data`| `Dealer`          |
| `productcategory`  | `master_data`| `ProductCategory` |
| `product`          | `master_data`| `Product`         |
| `brand`            | `master_data`| `Brand`           |
| `vehicle`          | `master_data`| `Vehicle`         |
| `driver`           | `users`      | `Driver`          |
| `helper`           | `users`      | `Helper`          |

**`POI`** is not in the registry yet — bulk CSV for POIs is not wired in admin.

## REST API

- **`apps/master_data/urls.py`** registers DRF viewsets (e.g. `pois`, `products`, `vehicles`, `drivers`, `bulk-imports`, `bulk-exports`) under the **`/api/v1/`** prefix from root URL config.
- **`apps/users/urls.py`** registers **`helpers`** under **`/api/v1/users/helpers/`** (nested under the users router).

## Related documents

- Domain behaviour and roadmap: **[README.md](README.md)** and the per-topic specs (`poi-management.md`, `product-master-data-management.md`, …).
- Bulk flow detail: **[bulk-import-export.md](bulk-import-export.md)**.
- Driver / helper domain: **[../12-users/driver-user-profiles.md](../12-users/driver-user-profiles.md)**, **[../12-users/helper-master-data.md](../12-users/helper-master-data.md)**.
