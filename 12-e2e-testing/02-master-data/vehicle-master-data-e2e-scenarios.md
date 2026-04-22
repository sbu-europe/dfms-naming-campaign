---
module: 02-master-data
specification: Vehicle Master Data Management - E2E Scenario Plan
version: 1.1
phase: Phase 1
related_stories: US-053
source_spec: ../../03-module-specifications/02-master-data/vehicle-master-data.md
last_updated: 2026-04-22
---

# Vehicle Master Data - E2E Scenario Plan

## Test Cases (`VehicleAdmin` / `BrandAdmin`)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Verify vehicle creation with active status default | Verify that creating a vehicle from Django Admin add form with `is_active` checked persists the record and auto-sets `operational_status` to `Available` (validated from changelist status column). | P0 | Automated (Passing) |
| TC02 | Verify vehicle creation with inactive status behavior | Verify that creating a vehicle with `is_active` unchecked persists the record and forces `operational_status` to `Under_Maintenance` (validated from changelist status column). | P0 | Automated (Passing) |
| TC03 | Verify add-form fieldset composition | Verify add form shows Basic Information, Vehicle Details, Documents & Compliance, and Status & Remarks sections; Assignments and Telematics are hidden. | P1 | Automated (Passing) |
| TC04 | Verify change-form fieldset composition | Verify change form shows Assignments (`assigned_driver`, `assigned_poi`) and Tracking & Telematics sections in addition to add-form sections, with telematics collapsed. | P1 | Automated (Passing) |
| TC05 | Verify change-form system field behavior | Verify `operational_status` is not editable on change form (not rendered as editable widget), and telematics fields remain non-editable/read-only in rendered admin UI variants. | P0 | Automated (Passing) |
| TC06 | Verify status transition on reactivation | Verify that changing a vehicle from `is_active=false` to `is_active=true` resets `operational_status` to `Available` (validated from changelist status column). | P0 | Automated (Passing) |
| TC07 | Verify non-status edits preserve workflow-owned status | Verify editing regular vehicle fields does not allow arbitrary operational status transitions beyond admin transition rules. | P1 | Automated (Passing) |
| TC08 | Verify changelist search by registration/chassis | Verify vehicle changelist supports search by `registration_number` and `chassis_number`. | P0 | Automated (Passing) |
| TC09 | Verify changelist filters and ordering | Verify filters for `operational_status`, `vehicle_type`, `brand`, `assigned_poi`, and `is_active`, and validate ordering behavior. | P1 | Automated (Passing) |
| TC10 | Verify autocomplete FK behavior by form context | Verify `brand` autocomplete works on create form, and `assigned_driver`/`assigned_poi` autocomplete fields work on change form only; inactive brands are excluded in autocomplete context. | P1 | Automated (Passing) |
| TC11 | Verify single-record soft delete | Verify deleting from vehicle change view performs soft delete (record retained with delete markers) rather than hard delete. | P0 | Automated (Passing) |
| TC12 | Verify bulk soft delete from changelist | Verify delete action on selected vehicles soft deletes all selected records. | P0 | Automated (Passing) |
| TC13 | Verify import CSV template download | Verify vehicle import template download returns expected headers from import registry configuration. | P0 | Automated (Passing) |
| TC14 | Verify import sample CSV download | Verify sample template download returns expected sample row format for vehicle import. | P1 | Automated (Passing) |
| TC15 | Verify import upload file validations | Verify missing file and non-CSV file uploads are rejected with proper admin error messages. | P0 | Automated (Passing) |
| TC16 | Verify import preview and status lifecycle | Verify vehicle CSV upload reaches preview, shows row counts, transitions through import execution, and reaches completion state with imported record visible in changelist. | P1 | Automated (Passing) |
| TC17 | Verify mixed-row import processing | Verify mixed valid/invalid vehicle CSV rows produce accurate totals and only valid rows are imported. | P0 | Automated (Passing) |
| TC18 | Verify duplicate key handling in import | Verify duplicate `registration_number`/`chassis_number` rows are rejected (or skipped per configured policy) and do not overwrite existing records. | P0 | Automated (Passing: existing-record duplicates rejected, no overwrite) |
| TC19 | Verify import confirm guardrails | Verify direct `GET` access to import confirm route does not execute confirm action and redirects back to preview page. | P1 | Automated (Passing) |
| TC20 | Verify export trigger and status flow | Verify vehicle and brand export endpoints redirect correctly, trigger export job on form submit, and render terminal export status page. | P1 | Automated (Passing) |
| TC21 | Verify export download availability rules | Verify completed vehicle/brand export jobs render `Download CSV` and downloadable files contain CSV content. | P1 | Automated (Passing) |
| TC22 | Verify authentication and admin access control | Verify unauthenticated users are redirected to admin login for vehicle and brand changelist/import/export admin routes. | P0 | Automated (Passing) |
| TC23 | Verify tenant isolation in vehicle admin flows | Verify list/search/autocomplete/import/export operations remain tenant-scoped and do not leak cross-tenant data. | P0 | Planned |
| TC24 | Verify brand creation and visibility in brand changelist | Verify creating a brand from Django Admin persists successfully and appears in brand changelist with default active status behavior. | P0 | Automated (Passing) |
| TC25 | Verify brand search, filter, and inline active toggle | Verify brand changelist supports search by `brand_name`, `is_active` filtering, and inline toggle via `list_editable`. | P1 | Automated (Passing) |
| TC26 | Verify brand tenant-level uniqueness validation | Verify duplicate `brand_name` creation is blocked within the same tenant while allowing same name across different tenants. | P0 | Automated (Passing: same-tenant uniqueness) |
| TC27 | Verify inactive brand exclusion from vehicle autocomplete | Verify inactive brands remain visible in brand admin list but are excluded from vehicle `brand` autocomplete endpoint results. | P0 | Automated (Passing) |
| TC28 | Verify vehicle-brand linkage with active brand | Verify active brand lookup via admin autocomplete can be linked to a vehicle create form and persists in change/list views. | P1 | Automated (Passing) |
| TC29 | Verify brand import/export flows | Verify brand CSV template/sample downloads and export trigger/status/download flow via `BulkImportExportMixin`. | P1 | Automated (Passing: template/sample + export flow) |
| TC30 | Verify brand admin authentication and tenant isolation | Verify unauthenticated access redirects to login for brand changelist/import/export routes; tenant isolation remains planned separately. | P0 | Automated (Passing: authentication) |

## Alignment Notes (Current Admin Implementation)

- `VehicleAdmin` derives `operational_status` in `save_model`; e2e assertions should validate resulting status from changelist rows, not rely on change-form widget presence.
- Change-form rendering varies between editable widgets and readonly text for some fields; e2e selectors should support both DOM patterns.
- `remarks` uses a textarea widget in admin forms.
- Current passing automated coverage corresponds to the implemented e2e module `tests/e2e/modules/test_vehicle_model_master_data_e2e.py`.
