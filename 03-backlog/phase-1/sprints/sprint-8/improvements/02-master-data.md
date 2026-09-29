---
title: Sprint 8 Improvements — Master Data
module: 02-master-data
menu: Master Data · Vehicles · Bulk I/O
parent: ./README.md
---

# Master Data

**Admin menu / area:** Master Data · Vehicles · Bulk I/O  
**Tracker index:** [README.md](./README.md)

> **Resolution Status values**: `Open` → `In Progress` → `Resolved`

| ID | Title | Priority | Status |
|----|-------|----------|--------|
| [FB-005](#fb-005--loadingunloading-bulk-operation-missing) | Loading/Unloading: bulk operation missing for this menu | Medium | Resolved |
| [FB-006](#fb-006--product-bulk-operation--remove-redundant-amount-column-from-template) | Product bulk operation: remove redundant Amount column from template | Medium | Resolved |
| [FB-007](#fb-007--product-sub-category-bulk-operation-missing) | Product Sub-Category: bulk operation missing for this menu | Medium | Resolved |
| [FB-018](#fb-018--vehicle-master-data--capacity-unit-mt--kg-only-remove-bag) | Vehicle capacity unit: MT & KG only (remove Bag) | Medium | Resolved |

---

## FB-005 — Loading/Unloading: bulk operation missing

| Field | Value |
|-------|-------|
| **Source** | Internal improvement — 2026-08-03 |
| **Affected Stories** | Loading/Unloading master (`/admin` Loading/Unloading); bulk import / export |
| **Closing Sub-tasks** | FB-005-1 — Enable **bulk import** (template download, validate, import) on Loading/Unloading · FB-005-2 — Enable **bulk export** on Loading/Unloading |
| **AC Amendment** | Loading/Unloading SHALL offer **bulk import** and **bulk export** consistent with other master-data menus that already support bulk operations. |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | Implemented: `LoadingUnloadingPointImportConfig` registered as `loadingunloadingpoint`; `LoadingUnloadingPointAdmin` uses `BulkImportExportMixin`. CSV columns: `poi_code`, `short_code`, `name`, `operation_type`, optional `is_active`/`notes`. Upsert on (poi, short_code); `operation_type` immutable after create; `created_by` from import job. E2E: [`fb-013-loading-unloading-bulk-import-export-e2e-scenarios.md`](../../../../../09-testing/backend/e2e-scenarios/sprint-8/fb-013-loading-unloading-bulk-import-export-e2e-scenarios.md). |

### Improvement observation

Loading/Unloading has no bulk operation. Other master-data menus expose bulk import/export; this menu should too.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-005) |
|--------|---------|-------------------|
| Bulk import | Missing | Available (template / validate / import) |
| Bulk export | Missing | Available |

### Closing checklist

- [x] FB-005-1 — Loading/Unloading bulk import available
- [x] FB-005-2 — Loading/Unloading bulk export available

---

## FB-006 — Product bulk operation: remove redundant Amount column from template

| Field | Value |
|-------|-------|
| **Source** | Internal improvement — 2026-08-03 |
| **Affected Stories** | Product bulk import (template download) |
| **Closing Sub-tasks** | FB-006-1 — Remove the **Amount** column from the Product bulk import template · FB-006-2 — Ensure import / validate no longer expect or map an Amount field |
| **AC Amendment** | The Product **bulk import template** SHALL **not** include an **Amount** column. There is no corresponding Amount field on the Product form; the template SHALL only expose columns that map to form fields. |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | Removed `amount` from `ProductImportConfig` so template / validate / export no longer expose or map Amount. Admin form already excluded the field; DB column retained. E2E: [`fb-014-product-bulk-remove-amount-column-e2e-scenarios.md`](../../../../../09-testing/backend/e2e-scenarios/sprint-8/fb-014-product-bulk-remove-amount-column-e2e-scenarios.md). |

### Improvement observation

Product bulk operation template shows a redundant **Amount** column. There is no such field on the Product form — remove it from the template.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-006) |
|--------|---------|-------------------|
| Amount column in Product bulk template | Present | **Removed** (no form field) |

### Closing checklist

- [x] FB-006-1 — Remove Amount from Product bulk import template
- [x] FB-006-2 — Import / validate do not require or map Amount

---

## FB-007 — Product Sub-Category: bulk operation missing

| Field | Value |
|-------|-------|
| **Source** | Internal improvement — 2026-08-03 |
| **Affected Stories** | Product Sub-Category master (`/admin` Product Sub-Categories); bulk import / export |
| **Closing Sub-tasks** | FB-007-1 — Enable **bulk import** (template download, validate, import) on Product Sub-Category · FB-007-2 — Enable **bulk export** on Product Sub-Category |
| **AC Amendment** | Product Sub-Category SHALL offer **bulk import** and **bulk export** consistent with other master-data menus that already support bulk operations. |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | Bulk operation is missing for this menu; parity with other master-data bulk I/O expected. E2E: [`fb-015-product-sub-category-bulk-import-export-e2e-scenarios.md`](../../../../../09-testing/backend/e2e-scenarios/sprint-8/fb-015-product-sub-category-bulk-import-export-e2e-scenarios.md). |

### Improvement observation

Product Sub-Category has no bulk operation. Other master-data menus expose bulk import/export; this menu should too.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-007) |
|--------|---------|-------------------|
| Bulk import | Missing | Available (template / validate / import) |
| Bulk export | Missing | Available |

### Closing checklist

- [x] FB-007-1 — Product Sub-Category bulk import available
- [x] FB-007-2 — Product Sub-Category bulk export available

---

## FB-018 — Vehicle master data: capacity unit MT & KG only (remove Bag)

| Field | Value |
|-------|-------|
| **Source** | Internal improvement — 2026-08-08 |
| **Affected Stories** | US-053 / Vehicle master data ([`vehicle-master-data.md`](../../../../../05-modules/02-master-data/vehicle-master-data.md)) |
| **Closing Sub-tasks** | FB-018-1 — Restrict `VehicleCapacityUnit` choices to **MT** and **KG** (remove **Bag**) · FB-018-2 — Admin / API / bulk import validate and expose only MT & KG · FB-018-3 — Schema `AlterField` migration (no data migration — no vehicles used Bag) |
| **AC Amendment** | Vehicle master data **capacity unit** SHALL allow only **MT** and **KG**. **Bag** SHALL NOT be offered as a capacity unit type on create/edit, serializers, or bulk import/export. |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | Removed `BAG` from `VehicleCapacityUnit`; admin / serializers / `VehicleImportConfig` follow enum choices. Dropped Bag branch from `assess_capacity_fit` (legacy `"bag"` → unknown). Product/TO Bag UOM unchanged. |

### Improvement observation

On **Master Data → Vehicles**, **Capacity unit** offers **Bag** alongside **MT** and **KG**. Vehicle capacity should be expressed in weight units only.

### Current vs expected behaviour

| Aspect | Current (before) | Expected (FB-018) |
|--------|------------------|-------------------|
| Capacity unit choices | MT, KG, Bag | **MT, KG only** |
| Bag as capacity unit | Selectable | **Removed** |
| Admin / API / bulk I/O | Accept Bag | Reject / omit Bag |

### Closing checklist

- [x] FB-018-1 — `VehicleCapacityUnit`: remove Bag; choices = MT, KG
- [x] FB-018-2 — Admin form, serializers, and Vehicle bulk import/export align with MT/KG only
- [x] FB-018-3 — Schema migration only; no data migration (no Bag vehicles)
