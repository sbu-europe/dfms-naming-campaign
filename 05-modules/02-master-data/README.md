# 02-master-data - Master Data Management

## Implementation alignment

The **running backend** implements master data in **`apps/master_data/`** (models, admin, REST API, bulk job models/tasks) and related **`apps/users`** aggregates (**`Driver`**, **`Helper`**) that share the same bulk-import registry. This module’s documents describe domain behaviour **and** are kept consistent with those packages. A short code map lives in **[master-data-configuration.md](master-data-configuration.md)**.

Conceptual PRD-level behaviours (e.g. full POI capacity accounting, generic `MasterEntity` rows) may still be **roadmap** items where the codebase uses **concrete models** and simpler fields today.

## Module Overview

This module defines master data configuration and management for the DFMS platform, including product inventory management (PIM) and POI (Point of Interest) management with geofencing capabilities.

**Purpose**: Centralized management of foundational business entities  
**PRD Sections**: 6.3, 6.4, 6.5  
**Phase**: Phase 1 (Critical)  
**Dependencies**: `01-foundation/` (authentication, RBAC)

---

## Module Contents

### 📄 Specifications

**Note**: All specification files are written in **domain knowledge format**, explaining how the system works conceptually with technical details, data models, and implementation guidance. They maintain traceability to user stories while focusing on architecture and mechanisms rather than requirements.

| File | Description | PRD Section | Related Stories | Lines |
|------|-------------|-------------|-----------------|-------|
| [master-data-configuration.md](master-data-configuration.md) | Maps product specs to **`apps/master_data`** (registry, models, admin, API) | — | — | short |
| [poi-management.md](poi-management.md) | POI entity model, geofencing system (entry/exit detection), capacity tracking (stock/in-transit/warnings), lifecycle management, operational classification, integrations with requisitions/trips/gate/QC | 6.5.1-6.5.8 | US-014 | 588 |
| [vehicle-master-data.md](vehicle-master-data.md) | Vehicle data model, creation workflow, operational status tracking vs master data status, bulk upload, search/filtering, and referential integrity | 6.3.1-6.3.4 | US-053 | 344 |
| [product-master-data-management.md](product-master-data-management.md) | Product data model (FG/RM), catalogue management, transport configuration (vehicle compatibility, special handling), QC configuration (checklists, auto-pass), product lifecycle, search/filtering | 6.4.1-6.4.3 | Integrated in requisition workflows | 551 |

**Total Documentation**: ~1,650 lines of comprehensive technical specifications (driver compliance: see `03-users/driver-user-profiles.md`)

**Helper (US-061) — full specification**: [helper-master-data.md](../03-users/helper-master-data.md) (lives under **12-users** because helpers may link to platform users via optional `user_id`).

---

## Key Features

### Master Data Configuration
- **Entity registration**: Concrete Django models per entity (e.g. `POI`, `Product`, `Vehicle`); **`Driver`** / **`Helper`** master screens live primarily under **`apps/users/`** — ([driver-user-profiles.md](../03-users/driver-user-profiles.md)), [helper-master-data.md](../03-users/helper-master-data.md).
- **Bulk upload (CSV)**: Implemented for models registered in **`IMPORT_REGISTRY`**: **`master_data`** (supplier, dealer, product category, product, brand, vehicle) plus **`users.driver`** and **`users.helper`** (registered at app startup) — see **[bulk-import-export.md](bulk-import-export.md)** and **[master-data-configuration.md](master-data-configuration.md)**. **POI** bulk CSV is **not** wired in admin yet.
- **Inline management**: Django admin plus REST CRUD where viewsets exist.
- **Audit trail**: Vehicle admin integrates **`apps.audit`** for create/update/delete; extend the same pattern for other masters as needed.
- **Referential Integrity**: Django `PROTECT`/`SET_NULL` and admin-side checks (e.g. supplier/dealer hard-delete) where implemented.
- **Active / inactive**: Most masters use **`is_active`**; **`Vehicle`** also uses soft delete (`SoftDeleteMixin`) for removal from the fleet.

### Product Inventory Management (PIM)
- **Product catalog**: Finished Goods (FG) and Raw Material (RM) via **`Product`** + **`ProductCategory`** / **`ProductSubCategory`**.
- **Product attributes**: `product_sku_code`, `product_item_code`, UOM, `weight_per_unit`, optional **`amount`** (physical quantity field), **`requires_qc`** flag — *no* `qc_checklist` FK in the current model (see **product-master-data-management.md** §4).
- **Transport attributes**: **`preferred_vehicle_body_type`**, **`special_handling_requirements`** (not a separate JSON “compatibility matrix” in DB).

### POI Management & Geofencing
- **POI types**: Implemented as enums in **`POIType`** (poultry/logistics-specific labels such as feed mill, depot, hatchery — not the older illustrative short list alone).
- **GPS + geofence**: Latitude/longitude and **`geofence_radius_meters`** on **`POI`**; validation bands may be tightened in forms/API later.
- **Capacity**: The Django **`POI`** row stores **`storage_capacity_mt`** (limit) **without** `current_stock_mt` / `in_transit` / computed free capacity — those remain **operational/roadmap** unless computed in services or added as columns later.
- **Operational role / inbound-outbound**: **Not** persisted on **`POI`** in the current schema — classify in downstream modules or future migrations.

---

## Dependencies

### Upstream Dependencies
- **`01-foundation/`**:
  - User authentication and authorization (RBAC)
  - Tenant context for data isolation
  - Audit logging for master data changes

### Downstream Dependencies
**Modules that depend on this master data**:
- **`03-operations/`**: Requisitions, TRs, TOs, Trips all reference master data
- **`04-poi-operations/`**: Gate, scaling, QC operations use POI and product data
- **`05-vendor-management/`**: Vendor onboarding creates vendor master records
- **`06-fleet-management/`**: Vehicle, driver, helper registration
- **All operational modules**: Reference master data for entities

### Cross-Module References
- **POI Data** referenced by: Requisitions, TRs, TOs, Trips, Gate operations
- **Product Data** referenced by: Requisitions, QC workflows, Loading operations
- **Vendor Data** referenced by: Vendor management, bidding, TO execution
- **Vehicle/Driver Data** referenced by: Fleet management, trip execution

---

## Related User Stories

### Direct Stories
| Story ID | Title | Feature Area |
|----------|-------|--------------|
| US-014 | Capacity Checking and Warnings | POI Management |

### Master Data Embedded in Workflows
Master data creation is integrated into workflow stories:
- **US-053**: Vehicle Registration & Master Data
- **US-057**: **`Driver`** create/import + **`User`** row + compliance — [`03-users/driver-user-profiles.md`](../03-users/driver-user-profiles.md) (not `master_data`)
- **US-061**: Helper Profile
- **US-047**: Vendor Registration
- Product and POI data managed through admin interfaces (no dedicated stories)

**Location**: `../../03-backlog/stories/README.md`

---

## Data Model Highlights (as implemented in `apps/master_data`)

### POI (`POI`)
```text
Primary fields: poi_code (unique), name, poi_type (POIType), address, city, country,
latitude/longitude (optional), geofence_radius_meters, storage_capacity_mt (optional),
number_of_gates, number_of_scales, contact_person, contact_phone, is_active
(+ tenant + timestamps via TenantAwareModel).
Live stock / in-transit / operational_role: not on this model — see poi-management.md
“Implementation status” and roadmap text.
```

### Product (`Product`)
```text
Identification: product_sku_code, product_item_code, product_name, product_type (FG/RM).
Classification: FK category (ProductCategory), optional FK sub_category (ProductSubCategory).
Physical: unit_of_measure, weight_per_unit (rules by UOM), standard_pack_size, amount (optional).
Transport: preferred_vehicle_body_type, special_handling_requirements.
QC: requires_qc (boolean only — no qc_checklist FK).
Status: is_active.
```

### Other notes
- **No generic `MasterEntity` JSON table** for these records — each entity has its own table.
- **Vehicle** uses **`capacity` + `capacity_unit`** (not only “tonnage”).

---

## API Endpoints

REST routes are registered in **`apps/master_data/urls.py`** under the global **`/api/v1/`** prefix, for example:

| Resource | Example path |
|----------|----------------|
| POIs | `GET/POST /api/v1/pois`, `GET/PATCH/DELETE /api/v1/pois/{id}/` |
| Products | `GET/POST /api/v1/products`, … |
| Bulk jobs | `GET/POST /api/v1/bulk-imports/`, `GET/POST /api/v1/bulk-exports/` |

See OpenAPI (`/api/docs/`) for the full list. **Entity-specific `/bulk-upload`** paths in older sketches are optional; the shared bulk API is **`bulk-imports` / `bulk-exports`** — **[bulk-import-export.md](bulk-import-export.md)**.

---

## Business Rules

### POI Management
1. **Geofence radius**: Configurable per row (`geofence_radius_meters`); enforce min/max in validation when product rules are finalized (PRD ranges have varied — see **poi-management.md**).
2. **Capacity tracking (roadmap)**: Operational modules may eventually maintain live stock/in-transit; the **`POI`** row today holds a **storage limit** (`storage_capacity_mt`), not live balances.

### Product Management
1. **Code uniqueness**: `product_sku_code`, `product_item_code`, and `product_name` are unique per tenant schema.
2. **QC**: `requires_qc` is a boolean flag — **no** mandatory QC checklist FK in the current model.
3. **Transport**: Prefer **`preferred_vehicle_body_type`** for compatibility hints — detailed liquid-vs-bulk routing rules live in operations modules.

### Data Consistency
1. **Referential Integrity**: Cannot delete POI/Product referenced in active trips
2. **Bulk Upload Validation**: Row-level validation, preview, and commit semantics are defined in **[bulk-import-export.md](bulk-import-export.md)** (async validation, optional import of valid rows only; not necessarily “all-or-nothing” rollback for every path)
3. **Audit Trail**: All create/update/delete operations logged with user and timestamp

---

## Implementation Priority

**Phase 1 - Critical**:
1. POI Registration & CRUD ⭐⭐⭐
2. Product Catalog Management ⭐⭐⭐
3. POI Capacity Tracking (US-014) ⭐⭐⭐
4. Bulk Upload (CSV) ⭐⭐ — see **[bulk-import-export.md](bulk-import-export.md)**
5. Geofencing Setup ⭐⭐
6. Data Consistency Rules ⭐⭐
7. Master Data Audit Trail ⭐

---

## Testing Scenarios

### POI Management
- Create POI with GPS coordinates and geofence
- Edit **`storage_capacity_mt`** and other static attributes
- (Roadmap) Live capacity / free-capacity checks once stock fields or services exist

### Product Management
- Create product with **`requires_qc`** and transport fields
- Update safe fields; restricted fields lock after save in admin (see **product-master-data-management.md** §5.2)
- (Roadmap) Tighter deactivation rules if stock/requisition checks are added server-side

### Capacity Tracking
- Create requisition and check source/destination capacity warnings
- Complete loading and verify source capacity reduction
- Complete QC-pass unloading and verify destination capacity increase
- Check in-transit stock calculation

---

## Quick Links

- **[Bulk Import & Export](bulk-import-export.md)** - Canonical CSV bulk import/export implementation (Django admin, Celery, REST API)
- **[Module Index](../README.md)** - Back to module specifications index
- **[Complete Index](../INDEX.md)** - Full content index
- **[Source PRD](../../01-source/01-prd/PRD_DFMS_v1.0.md)** - Original PRD document
- **[User Stories](../../03-backlog/stories/README.md)** - Implementation stories

---

**Last Updated**: 2026-04-17  
**Status**: Complete (aligned with `apps/master_data` implementation)  
**Previous Module**: [01-foundation/](../01-foundation/README.md) - System Foundation  
**Next Module**: [03-operations/](../05-transport/README.md) - Core Operations
