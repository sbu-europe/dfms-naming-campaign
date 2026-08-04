---
title: Sprint 7 — Feedback Tracker
source_sprint: Sprint 7
total_items: 15
resolved: 14
in_progress: 0
open: 1
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
| [FB-004](#fb-004--product-requisition-list--search-should-include-destination-poi) | Product Requisition list: search should include destination POI | Operations / Product Requisitions | Medium | Resolved |
| [FB-005](#fb-005--product-requisition-list--hide-draft-from-status-filter-for-distribution-officer) | Product Requisition list: hide Draft from status filter for Distribution Officer | Operations / Product Requisitions | Medium | Resolved |
| [FB-006](#fb-006--poi-bulk-importexport--include-optional-storage-capacity-mt--opening-stock) | POI bulk import/export: include optional storage capacity (MT) & opening stock | Master Data / POIs · Bulk I/O | Medium | Resolved |
| [FB-007](#fb-007--helpers--delete-should-match-other-master-data) | Helpers: delete should match other master data | Master Data / Helpers | Medium | Resolved |
| [FB-008](#fb-008--bid-management--required-capacity-missing-quantity-unit-on-changelist) | Bid Management: Required Capacity missing quantity unit on changelist | Operations / Bid Management | Medium | Resolved |
| [FB-009](#fb-009--phone-number-normalization-on-bulk-user-upload--driver-import) | Phone number normalization on bulk user upload & driver import | Users · Drivers · Bulk I/O | Medium | Resolved |
| [FB-010](#fb-010--invitation-channel-email--single-email-field-on-manual-add-and-import) | Invitation channel email: single email field on manual add and import | Users · Drivers · Invite | Medium | Resolved |
| [FB-011](#fb-011--driver-invitation-bulk-importexport--add-reference-contacts--address) | Driver invitation bulk import/export: add reference contacts & address | Users / Drivers · Bulk I/O | Medium | Resolved |
| [FB-012](#fb-012--driver-bulk-upload--optional-accident-history--last-training-assessment-info) | Driver bulk upload: optional accident history & last training assessment info | Users / Drivers · Bulk I/O | Medium | Resolved |
| [FB-013](#fb-013--loadingunloading-bulk-operation-missing) | Loading/Unloading: bulk operation missing for this menu | Master Data / Loading-Unloading · Bulk I/O | Medium | Resolved |
| [FB-014](#fb-014--product-bulk-operation--remove-redundant-amount-column-from-template) | Product bulk operation: remove redundant Amount column from template | Master Data / Products · Bulk I/O | Medium | Resolved |
| [FB-015](#fb-015--product-sub-category-bulk-operation-missing) | Product Sub-Category: bulk operation missing for this menu | Master Data / Product Sub-Categories · Bulk I/O | Medium | Open |

## Resolution Summary

| Priority | Total | Resolved | Open |
|----------|-------|----------|------|
| High | 1 | 1 | 0 |
| Medium | 14 | 13 | 1 |
| **Total** | **15** | **14** | **1** |

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
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | `ProductRequisitionAdmin.search_fields` extended with `destination_poi__name` and `destination_poi__poi_code` (keeps `pr_number`, `requester_name`). Unit: `tests/unit/test_requisitions/test_fb004_pr_search_destination_poi.py`. |

### Internal feedback observation

On the Product Requisition list page, search currently works for PR number only. Destination POI should be searchable through the same search functionality.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-004) |
|--------|---------|-------------------|
| List search | PR number only | PR number **and** destination POI |

### Closing checklist

- [x] FB-004-1 — List search includes destination POI (same search as PR number)

---

## FB-005 — Product Requisition list: hide Draft from status filter for Distribution Officer

| Field | Value |
|-------|-------|
| **Source** | Internal feedback — 2026-07-30 |
| **Affected Stories** | Product Requisition list view (status filter); Distribution Officer role |
| **Closing Sub-tasks** | FB-005-1 — Remove **Draft** from the status-wise filter options when the logged-in user is Distribution Officer |
| **AC Amendment** | When logged in as **Distribution Officer**, the Product Requisition list status filter SHALL **not** offer **Draft** as a filter option. |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | `PRStatusListFilter` on FG Product Requisition changelist; Draft hidden for `distribution_officer` only. E2E: `fb-005-product-requisition-status-filter-e2e-scenarios.md` (3/3 Pass). |

### Internal feedback observation

When logged in as Distribution Officer, the Draft option should be removed from the status-wise filter.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-005) |
|--------|---------|-------------------|
| Status filter as Distribution Officer | Includes **Draft** | **Draft** option removed |

### Closing checklist

- [x] FB-005-1 — Hide Draft in status filter for Distribution Officer

---

## FB-006 — POI bulk import/export: include optional storage capacity (MT) & opening stock

| Field | Value |
|-------|-------|
| **Source** | Internal feedback — 2026-07-30 |
| **Affected Stories** | POI bulk import / export (template, validate, import, export) |
| **Closing Sub-tasks** | FB-006-1 — Add optional **storage capacity (MT)** and **opening stock** columns to POI bulk import/export · FB-006-2 — Treat empty values as **zero** on import |
| **AC Amendment** | POI bulk import and export SHALL include **storage capacity (MT)** and **opening stock**. Both fields are **optional**. If either is empty on import, the system SHALL treat it as **0**. |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | `POIImportConfig`: optional `storage_capacity_mt` + virtual `opening_stock_mt` (empty → 0); create sets opening via `set_opening_balance`; export includes both. E2E 7/7 Pass. |

### Internal feedback observation

Bulk POI import/export should also carry storage capacity (MT) and opening stock. Both are optional; blank cells must be treated as zero.

### Current vs expected behaviour

| Aspect | Current (after FB-006) | Expected (FB-006) |
|--------|------------------------|-------------------|
| Storage capacity (MT) in bulk I/O | Included; optional; empty → **0** | Included; optional; empty → **0** |
| Opening stock in bulk I/O | Included (`opening_stock_mt`); optional; empty → **0** | Included; optional; empty → **0** |

### Closing checklist

- [x] FB-006-1 — Template / import / export include storage capacity (MT) and opening stock
- [x] FB-006-2 — Empty optional values default to zero on import

---

## FB-007 — Helpers: delete should match other master data

| Field | Value |
|-------|-------|
| **Source** | Internal feedback — 2026-07-30 |
| **Affected Stories** | Helper master (`/admin` Helpers); delete behaviour vs other master data |
| **Closing Sub-tasks** | FB-007-1 — Fix Helper delete so it works the same way as delete on other master data entities |
| **AC Amendment** | Helper **delete** SHALL be functional and behave consistently with delete on other master data (same UX, permissions, and outcome pattern). |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | Implemented: `HelperAdmin` uses `MasterEntityHardDeleteAdminMixin` (deps gate + required delete reason + audit). Soft lifecycle remains Edit → Inactive. Soft-`deleted_at` Admin overrides removed. E2E: [`fb-007-helpers-delete-match-master-data-e2e-scenarios.md`](../../../09-testing/backend/e2e-scenarios/sprint-7/fb-007-helpers-delete-match-master-data-e2e-scenarios.md) **6/6 Pass**. |

### Internal feedback observation

Helper delete is not functional as implemented for other master data. It needs to be fixed to match that pattern.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-007) |
|--------|---------|-------------------|
| Helper delete | Hard delete via mixin (parity with Vehicle/Supplier) | Works and matches other master data delete behaviour |

### Closing checklist

- [x] FB-007-1 — Helper delete fixed and aligned with other master data

---

## FB-008 — Bid Management: Required Capacity missing quantity unit on changelist

| Field | Value |
|-------|-------|
| **Source** | Internal feedback — 2026-07-30 |
| **Affected Stories** | Bid Management changelist / list view |
| **Closing Sub-tasks** | FB-008-1 — Show quantity unit with Required Capacity on the Bid Management changelist |
| **AC Amendment** | On the Bid Management **changelist**, **Required Capacity** SHALL display with its **quantity unit** (not a bare number). |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | `BiddingSessionAdmin.required_capacity_display` formats with `format_qty` + `MT` on list and change form. Unit: `tests/unit/test_vendors/test_fb008_required_capacity_display.py`. |

### Internal feedback observation

On the Bid Management changelist page, Required Capacity does not show the quantity unit.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-008) |
|--------|---------|-------------------|
| Required Capacity on changelist | Number only (no unit) | Quantity **with unit** |

### Closing checklist

- [x] FB-008-1 — Required Capacity on Bid Management changelist shows quantity unit

---

## FB-009 — Phone number normalization on bulk user upload & driver import

| Field | Value |
|-------|-------|
| **Source** | Internal feedback — 2026-08-03 |
| **Affected Stories** | Bulk User Upload; Driver bulk import (phone validation) |
| **Closing Sub-tasks** | FB-009-1 — Strip hyphens from phone numbers on bulk user upload and driver import · FB-009-2 — Prefix leading `0` when missing · FB-009-3 — Validate normalized phone is exactly **11 digits** after hyphen strip and optional leading-`0` add |
| **AC Amendment** | On **Bulk User Upload** and **Driver** bulk import, the system SHALL **exclude hyphens** from phone data when present, SHALL **add a leading `0`** when missing, and SHALL require the normalized phone number to be **11 digits** (after stripping hyphens and adding the leading `0` if needed). |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | Implemented via `apps.core.phone.normalize_bd_mobile` (`coerce_bd_mobile` / `validate_bd_mobile_import`) on `UserImportConfig.phone_number` and `DriverImportConfig.contact_number`. Hyphens/spaces stripped; missing leading `0` accepted (10-digit national); invalid length rejected; persisted as E.164 `+8801XXXXXXXXX`. E2E: [`fb-009-phone-normalization-bulk-user-driver-import-e2e-scenarios.md`](../../../09-testing/backend/e2e-scenarios/sprint-7/fb-009-phone-normalization-bulk-user-driver-import-e2e-scenarios.md) **8/8 Pass** (2026-08-03). |

### Internal feedback observation

Phone number validation fails during Bulk User Upload and driver import when numbers include hyphens or omit the leading zero. The system should normalize before validate: strip hyphens, add leading `0` if missing, then require 11 digits.

### Current vs expected behaviour

| Aspect | Current (after FB-009) | Expected (FB-009) |
|--------|------------------------|-------------------|
| Hyphen in phone | Stripped before validate; import succeeds | **Exclude (strip) hyphen** from data |
| Missing leading `0` | Accepted; normalized to E.164 | **Add leading `0`** when missing |
| Length after normalize | Invalid local length rejected; valid → E.164 | Exactly **11 digits** (local); persist E.164 |

### Closing checklist

- [x] FB-009-1 — Strip hyphens from phone on bulk user upload & driver import
- [x] FB-009-2 — Add leading `0` when missing
- [x] FB-009-3 — Normalized phone must be 11 digits

---

## FB-010 — Invitation channel email: single email field on manual add and import

| Field | Value |
|-------|-------|
| **Source** | Internal feedback — 2026-08-03 |
| **Affected Stories** | Manual user/driver add (invitation); bulk import when invitation channel is email |
| **Closing Sub-tasks** | FB-010-1 — When invitation channel is **email**, email is mandatory and collected **once** on manual add (aligned with backend) · FB-010-2 — Apply the same single-email behaviour on **import** (do not require / present a second email entry) |
| **AC Amendment** | When **invitation channel** is **email**, **email SHALL be mandatory** and SHALL be entered **once** on manual add, matching backend behaviour. The same **single-email** rule SHALL apply on **import** (email typed once on add must not be duplicated or left unchanged incorrectly during import). |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | Backend already treats email as a single field; UI / import path should match. Driver import drops second `email` column; `user_email` mirrors onto `Driver.email` (manual-add parity). |

### Internal feedback observation

On manual add, when invitation channel is email, email is mandatory and is typed once as the backend expects. That single-email behaviour has not been applied correctly on import — import should also use email once, consistent with the backend.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-010) |
|--------|---------|-------------------|
| Manual add (channel = email) | Email mandatory; typed once (backend-aligned) | Unchanged — email once, mandatory |
| Import (channel = email) | Single-email behaviour not applied | Email **once**, same as backend / manual add |

### Closing checklist

- [x] FB-010-1 — Manual add: email mandatory once when invitation channel is email (confirm parity with backend)
- [x] FB-010-2 — Import: apply same single-email behaviour

---

## FB-011 — Driver invitation bulk import/export: add reference contacts & address

| Field | Value |
|-------|-------|
| **Source** | Internal feedback — 2026-08-03 |
| **Affected Stories** | Driver invitation bulk import / export (template, validate, import, export) |
| **Closing Sub-tasks** | FB-011-1 — Add **reference contact 1**, **reference contact 2**, and **address** columns to driver invitation bulk import · FB-011-2 — Include the same columns on driver invitation bulk export |
| **AC Amendment** | Driver invitation **bulk import** and **bulk export** SHALL include columns for **reference contact 1**, **reference contact 2**, and **address**. |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | Extends driver invitation bulk I/O template / export columns. |

### Internal feedback observation

Driver invitation bulk import/export is missing reference and address fields needed for onboarding. Add columns for reference contact 1, reference contact 2, and address.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-011) |
|--------|---------|-------------------|
| Reference contact 1 | Not in bulk I/O | Column on import **and** export |
| Reference contact 2 | Not in bulk I/O | Column on import **and** export |
| Address | Not in bulk I/O | Column on import **and** export |

### Closing checklist

- [x] FB-011-1 — Import template / validate / import include reference contact 1, reference contact 2, address
- [x] FB-011-2 — Export includes the same columns

---

## FB-012 — Driver bulk upload: optional accident history & last training assessment info

| Field | Value |
|-------|-------|
| **Source** | Internal feedback — 2026-08-03 |
| **Affected Stories** | Driver bulk upload / import / export (template, validate, import, export) |
| **Closing Sub-tasks** | FB-012-1 — Add optional **accident_history** column to driver bulk upload · FB-012-2 — Add optional **last_training_assessment_info** column to driver bulk upload · FB-012-3 — Include the same optional columns on driver bulk export |
| **AC Amendment** | Driver **bulk upload** (import) and **export** SHALL include optional columns for **accident_history** and **last_training_assessment_info**. Empty values are allowed. |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | `DriverImportConfig`: optional `accident_history` + `last_training_assessment_info` on import/export. E2E: [`fb-012-driver-bulk-import-export-accident-history-training-assessment-e2e-scenarios.md`](../../../09-testing/backend/e2e-scenarios/sprint-7/fb-012-driver-bulk-import-export-accident-history-training-assessment-e2e-scenarios.md) **6/6 Pass** (2026-08-03). |

### Internal feedback observation

Driver bulk upload should also carry **accident_history** and **last_training_assessment_info**. Both columns are **optional**.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-012) |
|--------|---------|-------------------|
| accident_history | Optional on import **and** export | Optional column on import **and** export |
| last_training_assessment_info | Optional on import **and** export | Optional column on import **and** export |

### Closing checklist

- [x] FB-012-1 — Import template / validate / import include optional `accident_history`
- [x] FB-012-2 — Import template / validate / import include optional `last_training_assessment_info`
- [x] FB-012-3 — Export includes the same optional columns

---

## FB-013 — Loading/Unloading: bulk operation missing

| Field | Value |
|-------|-------|
| **Source** | Internal feedback — 2026-08-03 |
| **Affected Stories** | Loading/Unloading master (`/admin` Loading/Unloading); bulk import / export |
| **Closing Sub-tasks** | FB-013-1 — Enable **bulk import** (template download, validate, import) on Loading/Unloading · FB-013-2 — Enable **bulk export** on Loading/Unloading |
| **AC Amendment** | Loading/Unloading SHALL offer **bulk import** and **bulk export** consistent with other master-data menus that already support bulk operations. |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | Implemented: `LoadingUnloadingPointImportConfig` registered as `loadingunloadingpoint`; `LoadingUnloadingPointAdmin` uses `BulkImportExportMixin`. CSV columns: `poi_code`, `short_code`, `name`, `operation_type`, optional `is_active`/`notes`. Upsert on (poi, short_code); `operation_type` immutable after create; `created_by` from import job. |

### Internal feedback observation

Loading/Unloading has no bulk operation. Other master-data menus expose bulk import/export; this menu should too.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-013) |
|--------|---------|-------------------|
| Bulk import | Missing | Available (template / validate / import) |
| Bulk export | Missing | Available |

### Closing checklist

- [x] FB-013-1 — Loading/Unloading bulk import available
- [x] FB-013-2 — Loading/Unloading bulk export available

---

## FB-014 — Product bulk operation: remove redundant Amount column from template

| Field | Value |
|-------|-------|
| **Source** | Internal feedback — 2026-08-03 |
| **Affected Stories** | Product bulk import (template download) |
| **Closing Sub-tasks** | FB-014-1 — Remove the **Amount** column from the Product bulk import template · FB-014-2 — Ensure import / validate no longer expect or map an Amount field |
| **AC Amendment** | The Product **bulk import template** SHALL **not** include an **Amount** column. There is no corresponding Amount field on the Product form; the template SHALL only expose columns that map to form fields. |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | Removed `amount` from `ProductImportConfig` so template / validate / export no longer expose or map Amount. Admin form already excluded the field; DB column retained. |

### Internal feedback observation

Product bulk operation template shows a redundant **Amount** column. There is no such field on the Product form — remove it from the template.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-014) |
|--------|---------|-------------------|
| Amount column in Product bulk template | Present | **Removed** (no form field) |

### Closing checklist

- [x] FB-014-1 — Remove Amount from Product bulk import template
- [x] FB-014-2 — Import / validate do not require or map Amount

---

## FB-015 — Product Sub-Category: bulk operation missing

| Field | Value |
|-------|-------|
| **Source** | Internal feedback — 2026-08-03 |
| **Affected Stories** | Product Sub-Category master (`/admin` Product Sub-Categories); bulk import / export |
| **Closing Sub-tasks** | FB-015-1 — Enable **bulk import** (template download, validate, import) on Product Sub-Category · FB-015-2 — Enable **bulk export** on Product Sub-Category |
| **AC Amendment** | Product Sub-Category SHALL offer **bulk import** and **bulk export** consistent with other master-data menus that already support bulk operations. |
| **Status** | Open |
| **Priority** | Medium |
| **Notes** | Bulk operation is missing for this menu; parity with other master-data bulk I/O expected. |

### Internal feedback observation

Product Sub-Category has no bulk operation. Other master-data menus expose bulk import/export; this menu should too.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-015) |
|--------|---------|-------------------|
| Bulk import | Missing | Available (template / validate / import) |
| Bulk export | Missing | Available |

### Closing checklist

- [ ] FB-015-1 — Product Sub-Category bulk import available
- [ ] FB-015-2 — Product Sub-Category bulk export available
