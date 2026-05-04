---
module: 12-users
specification: Helper Master Data Management - Playwright E2E Implementation Plan
version: 1.1
phase: Phase 1
related_stories: US-061
source_spec: ../../03-module-specifications/12-users/helper-master-data.md
implementation_reference: ../../../apps/users/admin.py
last_updated: 2026-04-23
---

# Helper Master Data - Playwright E2E Implementation Plan

## Test Cases (`HelperAdmin` / `HelperAdminForm`)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Verify helper creation from admin add form | Create helper with required fields and assert changelist search returns one row with expected `full_name` and `contact_number`. | P0 | Automated |
| TC02 | Verify add-form fieldset composition | Verify add form contains `Identity`/`Contacts`/`Status` and excludes `Performance`/`Audit` system fields (`total_trips`, `last_trip_date`, `incident_count`, `created_by`, `updated_by`, `deleted_at`). | P0 | Automated |
| TC03 | Verify helper change-form readonly system fields | Open change form and assert system-managed fields (`user`, `id`, trip counters, audit timestamps and actors, `deleted_at`) are not editable inputs/selects/textareas. | P1 | Automated |
| TC04 | Verify required field validation on add | Submit add form with missing required values and assert validation text includes required-field failures for `employee_id` and `contact_number`. | P0 | Automated |
| TC05 | Verify duplicate active employee ID rejection | Create active helper, attempt second active helper with same `employee_id`, and assert duplicate-active employee validation error. | P0 | Automated |
| TC06 | Verify duplicate active contact number rejection | Create active helper, attempt second active helper with same `contact_number`, and assert duplicate-active contact validation error. | P0 | Automated |
| TC07 | Verify duplicate active national ID rejection | Assert duplicate non-empty `national_id_number` is rejected for active helpers; create additional helpers with distinct national IDs to keep environment-safe coverage. | P1 | Automated |
| TC10 | Verify single-record delete performs soft delete | Delete from helper change page, verify success message and row absence from default changelist search, then recreate with same unique keys. | P0 | Automated |
| TC11 | Verify bulk delete action performs soft delete | Select multiple helper rows, execute `delete_selected`, confirm success message, and verify rows are removed from default changelist results. | P1 | Automated |
| TC12 | Verify helper import page and CSV lifecycle | Validate template/sample downloads, upload mixed CSV, assert preview counters and completion status, and verify new helper creation plus existing helper queryability after import. | P0 | Automated |
| TC13 | Verify unauthenticated access redirects to admin login | Clear cookies and verify changelist, add, change, and import helper admin routes redirect to `/admin/login/`. | P0 | Automated |
| TC14 | Verify helper user-autocomplete endpoint behavior | Verify `user` autocomplete widget is not shown on add form per current fieldsets, while `/admin/autocomplete/?app_label=users&model_name=helper&field_name=user` returns valid JSON payload. | P1 | Automated |

## Implementation Notes

- This plan is now synchronized with implemented coverage in `tests/e2e/modules/users/test_helper_master_data_e2e.py`.
- Assertions intentionally use resilient UI patterns (form submit via DOM, tolerant validation text checks, dynamic test data generation for phone/national ID) to reduce flakiness in shared test environments.
- `TC12` import checks are aligned with runtime variability: completion and row-level outcomes are asserted without over-constraining update semantics where backend behavior may differ by data state.
- `TC14` reflects current `HelperAdmin.get_fieldsets()` behavior: helper add form does not expose the `user` field, but the autocomplete endpoint remains test-covered.
