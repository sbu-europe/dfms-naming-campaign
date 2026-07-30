---
title: Sprint 7 — Feedback Tracker
source_sprint: Sprint 7
total_items: 8
resolved: 3
in_progress: 0
open: 5
---

# Sprint 7 — Feedback Tracker

Client / ops / internal feedback captured during Sprint 7.

> **Resolution Status values**: `Open` → `In Progress` → `Resolved`

## All items

| ID | Title | Menu / area | Priority | Status |
|----|-------|-------------|----------|--------|
| [FB-001](#fb-001--transport-planner--driver-supervisor-may-add-drivers-and-use-driver-bulk-importexport) | Transport Planner & Driver Supervisor may add drivers and use driver bulk import/export | Users / Drivers · Fleet | High | Resolved |
| [FB-002](#fb-002--product-line-item-label-should-include-subcategory-when-present) | Product line item label should include subcategory when present | Master Data / Products · dropdowns | Medium | Resolved |
| [FB-003](#fb-003--bay-assignment-add--to-details-missing-product-line-item-breakdown--allocated-qty-unit) | Bay Assignment add: TO details missing product line-item breakdown & allocated qty unit | Operations / Bay Assignment | Medium | Resolved |
| [FB-004](#fb-004--product-requisition-list--search-should-include-destination-poi) | Product Requisition list: search should include destination POI | Operations / Product Requisitions | Medium | Open |
| [FB-005](#fb-005--product-requisition-list--hide-draft-from-status-filter-for-distribution-officer) | Product Requisition list: hide Draft from status filter for Distribution Officer | Operations / Product Requisitions | Medium | Open |
| [FB-006](#fb-006--poi-bulk-importexport--include-optional-storage-capacity-mt--opening-stock) | POI bulk import/export: include optional storage capacity (MT) & opening stock | Master Data / POIs · Bulk I/O | Medium | Open |
| [FB-007](#fb-007--helpers--delete-should-match-other-master-data) | Helpers: delete should match other master data | Master Data / Helpers | Medium | Open |
| [FB-008](#fb-008--bid-management--required-capacity-missing-quantity-unit-on-changelist) | Bid Management: Required Capacity missing quantity unit on changelist | Operations / Bid Management | Medium | Open |

## Resolution Summary

| Priority | Total | Resolved | Open |
|----------|-------|----------|------|
| High | 1 | 1 | 0 |
| Medium | 7 | 2 | 5 |
| **Total** | **8** | **3** | **5** |

---

## FB-001 — Transport Planner & Driver Supervisor may add drivers and use driver bulk import/export

| Field | Value |
|-------|-------|
| **Source** | Client feedback — 2026-07-27 |
| **Affected Stories** | Driver master / profiles (`/admin/users/driver/`); E2E [`drivers-e2e-scenarios.md`](../../../09-testing/backend/e2e-scenarios/02-master-data/drivers-e2e-scenarios.md); role seed (`transport_planner`, `driver_supervisor`) |
| **Closing Sub-tasks** | FB-001-1 — Grant Transport Planner & Driver Supervisor permission to **add** (create) drivers · FB-001-2 — Grant both roles **bulk import** and **bulk export** access on Drivers |
| **AC Amendment** | **Transport Planner** and **Driver Supervisor** SHALL be able to **add drivers** in Admin (same create / invite path as Tenant Admin today). Both roles SHALL also have access to **Driver bulk import** and **Driver bulk export** (template download, validate, import, export). Existing-driver **change form is view-only** (all fields readonly) for TP/DS — only Tenant Admin may edit or hard-delete. |
| **Status** | Resolved |
| **Priority** | High |
| **Notes** | Implemented: role seed grants `MENU_MASTER_DATA_DRIVERS_VIEW` + `MASTER_DATA_DRIVER_READ` + `MASTER_DATA_DRIVER_WRITE` (not Delete) to TP and DS. `DriverAdmin` gates **add** (and bulk I/O via mixin `has_add`) on DFMS Write; **change** and **delete** remain Tenant Admin / Super Admin only so the change form renders readonly for ops. Re-seed with `manage.py seed_dfms_rbac`. |

### Client feedback observation

Operations need **Transport Planner** and **Driver Supervisor** to onboard drivers themselves — not only Tenant Admin. The same roles should also be able to **bulk import** and **bulk export** drivers so fleet staffing can scale without waiting on a tenant administrator. They should **not** edit existing driver profiles via the change form (readonly).

### Current vs expected behaviour

| Aspect | Current (before) | Expected (FB-001) |
|--------|------------------|-------------------|
| Who can **Add driver** | Tenant Admin only | **+ Transport Planner** and **Driver Supervisor** |
| Change form (existing driver) | Tenant Admin editable | TP/DS **view-only / readonly**; Tenant Admin editable |
| Driver **bulk import / export** | Admin-centric | Unlocked for TP / DS via add permission |
| Hard delete | Tenant Admin | Unchanged (Tenant Admin only) |

### Closing checklist

- [x] FB-001-1 — Role seed / RBAC: `transport_planner` and `driver_supervisor` can add drivers (`MASTER_DATA_DRIVER_WRITE` + Drivers menu)
- [x] FB-001-2 — Admin: both roles see and can use Driver **Bulk Import** and **Bulk Export** (via add → mixin)
- [x] Change form readonly for TP/DS (`has_change_permission` Tenant Admin only)
- [x] Verify Tenant Admin still add/change/delete
- [x] Unit tests: Write holder add+bulk, no change/delete; seed + DS nav

---

## FB-002 — Product line item label should include subcategory when present

| Field | Value |
|-------|-------|
| **Source** | Internal feedback — 2026-07-29 |
| **Affected Stories** | Product / product line item display across Admin (dropdowns, lists, wherever product line items are shown) |
| **Closing Sub-tasks** | FB-002-1 — Extend product line item label to `code-productname-category-subcategory` (subcategory only when present) · FB-002-2 — Apply the same label format consistently everywhere product line items are shown |
| **AC Amendment** | Product line item labels SHALL render as **code – product name – category – subcategory** when a subcategory exists, and as **code – product name – category** when it does not. This format SHALL be consistent across the system (dropdowns and any other product line item display). |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | Shared helper `apps.master_data.display.product_line_item_label`; wired into PR line-item dropdown, Gate on-demand form dropdown, and Gate on-demand JSON product choices. |

### Internal feedback observation

Product line items currently display as **code – product name – category**. They should include **subcategory when it exists** (`code – product name – category – subcategory`), and that label format should be consistent everywhere we show product line items (including dropdowns).

### Current vs expected behaviour

| Aspect | Current | Expected (FB-002) |
|--------|---------|-------------------|
| Product line item label | `code-productname-category` | `code-productname-category-subcategory` (subcategory only if present) |
| Consistency | May vary / incomplete | Same format in dropdowns and all product line item displays |

### Closing checklist

- [x] FB-002-1 — Label format includes subcategory when present
- [x] FB-002-2 — Same format used consistently across dropdowns / all product line item displays

---

## FB-003 — Bay Assignment add: TO details missing product line-item breakdown & allocated qty unit

| Field | Value |
|-------|-------|
| **Source** | Internal feedback — 2026-07-30 |
| **Affected Stories** | Bay Assignment add page (TO selection / TO details panel) |
| **Closing Sub-tasks** | FB-003-1 — Show product line-item breakdown in TO details when a TO is selected on Bay Assignment add · FB-003-2 — Show allocated quantity with unit (not bare number) |
| **AC Amendment** | On Bay Assignment **add**, when a Transport Order (TO) is selected, the TO details panel SHALL show the **product line-item breakdown**. Allocated quantity SHALL display **with its unit**. |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | Implemented in `build_cc_assignment_to_details_html`: Product Lines table + allocated qty with unit (single line → line UOM; else header kg). Prefetch on queue-entry details AJAX. |

### Internal feedback observation

On the Bay Assignment add page, selecting a TO does not show the product line-item breakdown in TO details. Allocated qty is also shown without a unit.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-003) |
|--------|---------|-------------------|
| TO details after TO select | No product line-item breakdown | Show product line-item breakdown |
| Allocated qty | Number only (no unit) | Quantity **with unit** |

### Closing checklist

- [x] FB-003-1 — TO details on Bay Assignment add show product line-item breakdown
- [x] FB-003-2 — Allocated qty displays with unit

---

## FB-004 — Product Requisition list: search should include destination POI

| Field | Value |
|-------|-------|
| **Source** | Internal feedback — 2026-07-30 |
| **Affected Stories** | Product Requisition list view (admin search) |
| **Closing Sub-tasks** | FB-004-1 — Extend list search so destination POI can be found via the same search box as PR number |
| **AC Amendment** | On the Product Requisition **list** view, the existing search SHALL match **destination POI** in addition to **PR number**. |
| **Status** | Open |
| **Priority** | Medium |
| **Notes** | — |

### Internal feedback observation

On the Product Requisition list page, search currently works for PR number only. Destination POI should be searchable through the same search functionality.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-004) |
|--------|---------|-------------------|
| List search | PR number only | PR number **and** destination POI |

### Closing checklist

- [ ] FB-004-1 — List search includes destination POI (same search as PR number)

---

## FB-005 — Product Requisition list: hide Draft from status filter for Distribution Officer

| Field | Value |
|-------|-------|
| **Source** | Internal feedback — 2026-07-30 |
| **Affected Stories** | Product Requisition list view (status filter); Distribution Officer role |
| **Closing Sub-tasks** | FB-005-1 — Remove **Draft** from the status-wise filter options when the logged-in user is Distribution Officer |
| **AC Amendment** | When logged in as **Distribution Officer**, the Product Requisition list status filter SHALL **not** offer **Draft** as a filter option. |
| **Status** | Open |
| **Priority** | Medium |
| **Notes** | Assumed Product Requisition list (same area as FB-004); confirm if another list is intended. |

### Internal feedback observation

When logged in as Distribution Officer, the Draft option should be removed from the status-wise filter.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-005) |
|--------|---------|-------------------|
| Status filter as Distribution Officer | Includes **Draft** | **Draft** option removed |

### Closing checklist

- [ ] FB-005-1 — Hide Draft in status filter for Distribution Officer

---

## FB-006 — POI bulk import/export: include optional storage capacity (MT) & opening stock

| Field | Value |
|-------|-------|
| **Source** | Internal feedback — 2026-07-30 |
| **Affected Stories** | POI bulk import / export (template, validate, import, export) |
| **Closing Sub-tasks** | FB-006-1 — Add optional **storage capacity (MT)** and **opening stock** columns to POI bulk import/export · FB-006-2 — Treat empty values as **zero** on import |
| **AC Amendment** | POI bulk import and export SHALL include **storage capacity (MT)** and **opening stock**. Both fields are **optional**. If either is empty on import, the system SHALL treat it as **0**. |
| **Status** | Open |
| **Priority** | Medium |
| **Notes** | — |

### Internal feedback observation

Bulk POI import/export should also carry storage capacity (MT) and opening stock. Both are optional; blank cells must be treated as zero.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-006) |
|--------|---------|-------------------|
| Storage capacity (MT) in bulk I/O | Not included | Included; optional; empty → **0** |
| Opening stock in bulk I/O | Not included | Included; optional; empty → **0** |

### Closing checklist

- [ ] FB-006-1 — Template / import / export include storage capacity (MT) and opening stock
- [ ] FB-006-2 — Empty optional values default to zero on import

---

## FB-007 — Helpers: delete should match other master data

| Field | Value |
|-------|-------|
| **Source** | Internal feedback — 2026-07-30 |
| **Affected Stories** | Helper master (`/admin` Helpers); delete behaviour vs other master data |
| **Closing Sub-tasks** | FB-007-1 — Fix Helper delete so it works the same way as delete on other master data entities |
| **AC Amendment** | Helper **delete** SHALL be functional and behave consistently with delete on other master data (same UX, permissions, and outcome pattern). |
| **Status** | Open |
| **Priority** | Medium |
| **Notes** | — |

### Internal feedback observation

Helper delete is not functional as implemented for other master data. It needs to be fixed to match that pattern.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-007) |
|--------|---------|-------------------|
| Helper delete | Not functional / broken vs other master data | Works and matches other master data delete behaviour |

### Closing checklist

- [ ] FB-007-1 — Helper delete fixed and aligned with other master data

---

## FB-008 — Bid Management: Required Capacity missing quantity unit on changelist

| Field | Value |
|-------|-------|
| **Source** | Internal feedback — 2026-07-30 |
| **Affected Stories** | Bid Management changelist / list view |
| **Closing Sub-tasks** | FB-008-1 — Show quantity unit with Required Capacity on the Bid Management changelist |
| **AC Amendment** | On the Bid Management **changelist**, **Required Capacity** SHALL display with its **quantity unit** (not a bare number). |
| **Status** | Open |
| **Priority** | Medium |
| **Notes** | — |

### Internal feedback observation

On the Bid Management changelist page, Required Capacity does not show the quantity unit.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-008) |
|--------|---------|-------------------|
| Required Capacity on changelist | Number only (no unit) | Quantity **with unit** |

### Closing checklist

- [ ] FB-008-1 — Required Capacity on Bid Management changelist shows quantity unit
