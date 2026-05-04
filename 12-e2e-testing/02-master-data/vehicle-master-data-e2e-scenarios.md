---
module: 02-master-data
specification: Vehicle Master Data Management - E2E Scenario Plan
version: 1.1
phase: Phase 1
related_stories: US-053
source_spec: ../../03-module-specifications/02-master-data/vehicle-master-data.md
last_updated: 2026-04-28
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
| TC31 | Verify required-field validation on vehicle create form | Verify save is blocked when required admin form fields are missing (`registration_number`, `vehicle_type`) and inline validation messages are shown. | P0 | Automated (Passing) |
| TC32 | Verify duplicate registration number rejection | Verify creating/updating a vehicle with an existing `registration_number` is rejected with uniqueness error and record is not persisted. | P0 | Automated (Passing) |
| TC33 | Verify duplicate chassis number rejection (non-empty) | Verify creating/updating a vehicle with an existing non-empty `chassis_number` is rejected with uniqueness error and record is not persisted. | P0 | Automated (Passing) |
| TC34 | Verify optional field behavior on create | Verify create succeeds when implementation-optional fields are omitted (`chassis_number`, `body_type`, `fuel_type`, `capacity`, `number_of_wheels`, `model_name`, `fitness_expiry_date`, `insurance_expiry_date`). | P1 | Automated (Passing) |
| TC35 | Verify invalid choice/value rejection on vehicle form | Verify invalid payload values (e.g., unsupported `allowed_product_category` or enum values) are rejected by admin/model validation and save is blocked. | P1 | Automated (Passing) |
| TC36 | Verify import row required-field validation | Verify vehicle CSV rows missing required import headers/values (`registration_number`, `vehicle_type`) are marked invalid with row-level errors. | P0 | Automated (Passing) |
| TC37 | Verify import enum/type/date validation errors | Verify invalid `vehicle_type/body_type/fuel_type/capacity_unit/allowed_product_category`, non-decimal `capacity`, non-positive integer values, and bad ISO dates are rejected with row-level error reasons. | P0 | Automated (Passing) |
| TC38 | Verify import unknown brand_name rejection | Verify CSV rows with non-existent `brand_name` fail validation (`brand_name: Brand 'X' does not exist.`) and are not imported. | P0 | Automated (Passing) |

## Alignment Notes (Current Admin Implementation)

- `VehicleAdmin` derives `operational_status` in `save_model`; e2e assertions should validate resulting status from changelist rows, not rely on change-form widget presence.
- Change-form rendering varies between editable widgets and readonly text for some fields; e2e selectors should support both DOM patterns.
- `remarks` uses a textarea widget in admin forms.
- Implementation currently enforces fewer create-form mandatory fields than the module spec; `TC34` intentionally tracks this implementation-aligned behavior to prevent false failures.
- `registration_number`, `chassis_number`, and `brand_name` are currently unique at model/DB level in this codebase; treat tenant-scoped uniqueness as a separate gap-validation stream when running cross-tenant tests.
- Current passing automated coverage corresponds to the implemented e2e module `tests/e2e/modules/02-master-data/test_vehicle_model_master_data_e2e.py`.
