---
title: Sprint 6 Feedback — Master Data
module: 03-master-data
menu: Master Data
parent: ./README.md
---

# Master Data

**Admin menu / area:** Master Data  
**Tracker index:** [README.md](./README.md)

> **Resolution Status values**: `Open` → `In Progress` → `Resolved`

| ID | Title | Priority | Status |
|----|-------|----------|--------|
| [FB-021](#fb-021--vehicle-master-data-sim-number-field-on-createedit) | Vehicle master data: SIM number field on create/edit | Medium | Resolved |
| [FB-022](#fb-022--poi-master-data-classification-type-dropdown-inbound--outbound--neutral) | POI master data: Classification Type dropdown (Inbound / Outbound / Neutral) | Medium | Resolved |
| [FB-024](#fb-024--product-sub-category-visible-submenu-under-master-data) | Product Sub-category visible submenu under Master Data | Medium | Resolved |
| [FB-028](#fb-028--master-data-delete-requires-reason-field) | Master data delete requires Reason field | High | Resolved |
| [FB-029](#fb-029--poi-and-master-data-deletion-clear-dependency-messages) | POI (and master data) deletion: clear dependency messages | High | Resolved |

---

## FB-021 — Vehicle master data: SIM number field on create/edit

| Field | Value |
|-------|-------|
| **Source** | Client feedback — 2026-07-17 |
| **Affected Stories** | US-053 / Vehicle master data ([`vehicle-master-data.md`](../../../../05-modules/02-master-data/vehicle-master-data.md)) |
| **Closing Sub-tasks** | FB-021-1 Model `sim_number` + migration; FB-021-2 Admin Tracking fieldset; FB-021-3 REST + import/export |
| **AC Amendment** | Vehicle master data create and edit forms SHALL include a **SIM Number** field (string, optional or required per PO — default **optional** with format validation). Persist on `Vehicle` (e.g. `sim_number`); expose on REST serializers, bulk import/export (`VehicleImportConfig`), and Django admin Vehicle fieldset under **Tracking & Telematics** alongside `gps_tracker_id`. No telematics integration or GPS behaviour change in v1 — capture and display only. |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | Implemented on `Vehicle.sim_number` (optional BD mobile E.164). Distinct from driver contact phone. GPS runtime still binds by `gps_tracker_id` (IMEI) only. |

### Client feedback observation

Fleet administrators need to record the **SIM number** tied to each vehicle's tracker when maintaining vehicle master data.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-021) |
|--------|---------|-------------------|
| Vehicle telematics fields | `gps_tracker_id`, `sim_number`, odometer/mileage fields | + **SIM Number** on create/edit |
| API / import | `sim_number` on Vehicle CRUD and bulk CSV | `sim_number` on Vehicle CRUD and bulk CSV where applicable |
| Operational binding | None — master-data capture only | None — master-data capture only |

---

---

## FB-022 — POI master data: Classification Type dropdown (Inbound / Outbound / Neutral)

| Field | Value |
|-------|-------|
| **Source** | Client feedback — 2026-07-17 |
| **Affected Stories** | POI management ([`poi-management.md`](../../../../05-modules/02-master-data/poi-management.md)); PRD §6.5.3 POI Classification |
| **Reference docs** | [`PRD_DFMS_v1.0.md`](../../../../01-source/01-prd/PRD_DFMS_v1.0.md) §POI Classification (Inbound/Outbound/Neutral) |
| **Closing Sub-tasks** | FB-022-1 … FB-022-3 — TBD |
| **AC Amendment** | POI create and update forms SHALL include **POI Classification Type** — a **required dropdown** with exactly three choices: **Inbound**, **Outbound**, **Neutral**. Persist on `POI` (e.g. `classification_type`). **No operational binding in this item** — the field is informational/master-data only; routing, gate, stock, and dashboard logic MUST NOT branch on it until a future story explicitly wires it. Optional: PRD-default suggestion by `poi_type` on add (admin may override). |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | README notes inbound/outbound classification is **not** persisted on `POI` today (`poi-management.md` / `master_data` README). `POIAdmin` fieldsets have no classification field. PRD describes defaults by POI type — implement defaults as **form prefill only**, not enforced rules, unless PO confirms. |

### Client feedback observation

Admins need to tag each POI as Inbound, Outbound, or Neutral at master-data entry time. This is a dropdown choice only — no downstream automation required yet.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-022) |
|--------|---------|-------------------|
| POI classification field | Not on model or admin form | Required dropdown: Inbound / Outbound / Neutral |
| Routing / dashboards | N/A | Unchanged — no operational binding |
| POI type | `poi_type` enum only | Unchanged; classification is an additional attribute |

---

---

## FB-024 — Product Sub-category visible submenu under Master Data

| Field | Value |
|-------|-------|
| **Source** | Client feedback — 2026-07-17 |
| **Affected Stories** | Product master data ([`product-master-data-management.md`](../../../../05-modules/02-master-data/product-master-data-management.md)); MDM admin navigation |
| **Closing Sub-tasks** | FB-024-1 … FB-024-2 — TBD |
| **AC Amendment** | **Product Sub-category** SHALL appear as its own **visible sidebar submenu** under **Master Data** (portal navigation), linking to `/admin/master_data/productsubcategory/` with the same RBAC as Product Categories (`MasterData.ProductCategory.Read` / `.Write`). Ordering: after **Product Categories**, before **Products** (align with `config/admin.py` `master_data_menu_order`). Standalone CRUD remains on `ProductSubCategoryAdmin`; inline sub-categories on Product Category change form stay unchanged. |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | `ProductSubCategory` is registered in Django admin and listed in Django app index order (`productsubcategory` in `master_data_menu_order`) but is **missing** from `apps/core/portal_navigation.py` Master Data items — users only reach it via Product Category inlines or direct URL. E2E already targets `productsubcategory` admin (`test_product_master_data_e2e.py`). |

### Client feedback observation

Tenant admins need a dedicated **Product Sub-category** entry in the Master Data menu, not only sub-categories embedded under Product Category.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-024) |
|--------|---------|-------------------|
| Portal sidebar (Master Data) | Product Categories, Products — no Sub-category row | **Product Sub-category** menu item added |
| Django admin model admin | `ProductSubCategoryAdmin` exists | Unchanged |
| Permissions | Uses `MasterData.ProductCategory.*` | Unchanged |
| Product Category inline | Sub-categories editable inline | Unchanged |

---

---

## FB-028 — Master data delete requires Reason field

| Field | Value |
|-------|-------|
| **Source** | Client feedback — 2026-07-22 |
| **Affected Stories** | MDM delete ([`master-data-delete-operations.md`](../../../../05-modules/02-master-data/master-data-delete-operations.md)) |
| **Closing Sub-tasks** | FB-028-1 — Mandatory delete reason on hard delete |
| **AC Amendment** | Master data **cannot be deleted without a Reason field**. On Admin hard delete (when dependency scan finds **no** blocking references), the admin **must enter a delete reason** before the row is removed. Blank reason blocks delete with a validation error. Reason is written to the DELETE audit log. |
| **Status** | Resolved |
| **Priority** | High |
| **Notes** | Aligns with [`master-data-delete-operations.md`](../../../../05-modules/02-master-data/master-data-delete-operations.md) v1.2 — no-dependency hard delete requires mandatory delete reason + audit. |

### Client feedback observation

Master-data Delete allowed removal without capturing why the record was deleted. Operations require a mandatory reason for accountability.

### Current vs expected behaviour

| Aspect | Current (before fix) | Expected (FB-028) |
|--------|----------------------|-------------------|
| Delete reason | Optional / missing | **Required** when hard delete is allowed |
| Audit | May omit reason | DELETE audit includes admin-provided reason |

---

---

## FB-029 — POI (and master data) deletion: clear dependency messages

| Field | Value |
|-------|-------|
| **Source** | Client feedback — 2026-07-22 |
| **Affected Stories** | POI / MDM delete ([`master-data-delete-operations.md`](../../../../05-modules/02-master-data/master-data-delete-operations.md), [`poi-management.md`](../../../../05-modules/02-master-data/poi-management.md)) |
| **Closing Sub-tasks** | FB-029-1 — Friendly blocked-delete messages with counts and labels |
| **AC Amendment** | When Tenant Admin attempts to **delete a POI** (or other master entity) that still has dependencies, the system SHALL show a **clear, user-friendly message** listing what blocks deletion — not a raw Django protected-object dump. Message tone examples: **"Cannot delete Depot ABC - 5 vehicles and 12 users currently assigned"**; **"Cannot delete Product Category Feed - 23 products exist under this category"**; **"Cannot modify Route XY - 3 approved TRs currently reference this route"**. Prefer deactivate when dependencies exist. |
| **Status** | Resolved |
| **Priority** | High |
| **Notes** | Covered by master-data delete dependency gate + human-readable labels (`Cannot delete '{name}' … — {n} {labels} currently assigned. Deactivate it instead.`). Applies across POI and other TenantMasterDataAdmin models. |

### Client feedback observation

When delete was blocked, admins needed plain-language messages that name the entity and count related vehicles, users, products, TRs, etc., so they know what to clean up or that they should deactivate instead.

### Current vs expected behaviour

| Aspect | Current (before fix) | Expected (FB-029) |
|--------|----------------------|-------------------|
| Blocked delete UX | Unclear / technical error | Clear message with entity name + dependency counts/labels |
| Suggested action | Unclear | Prefer deactivate when dependencies exist |

---
