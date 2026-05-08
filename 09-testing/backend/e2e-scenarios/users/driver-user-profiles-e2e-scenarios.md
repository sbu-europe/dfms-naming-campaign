---
module: 12-users
specification: Driver User Profiles Management - Playwright E2E Implementation Plan
version: 1.1
phase: Phase 1
related_stories: US-004, US-005, US-052, US-057
source_spec: ../../05-modules/03-users/driver-user-profiles.md
implementation_reference: ../../../apps/users/admin.py
test_implementation_reference: ../../../tests/e2e/modules/users/test_driver_user_profiles_e2e.py
last_updated: 2026-04-24
---

# Driver User Profiles - Playwright E2E Implementation Plan

## Test Cases (`DriverAdmin` / `DriverAdminForm`)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Verify driver creation provisions linked user in one flow | Create driver from admin add form using user-account fields (`user_email`, `first_name`, `last_name`, `employee_id`) plus required driver fields, then assert changelist search returns one row with expected license/contact and displayed driver name and employee ID from linked `User`. | P0 | Implemented |
| TC02 | Verify add-form fieldset composition for provisioning workflow | Assert add form content area shows `User account (new driver only)`, `Contact & employment`, `License & compliance`, `References & notes`, `Documents`, `Status`; assert it excludes `Linked user (identity)`, `Fleet`, and `Audit` from form sections. | P0 | Implemented |
| TC03 | Verify change-form fieldset composition and readonly identity linkage | Open change form for existing driver and assert `User account (new driver only)` section is absent, `Linked user (identity)` and `Fleet` are present, and `user` selector is not editable. | P0 | Implemented |
| TC04 | Verify duplicate login email is rejected on add | Attempt add with an email already used by another user and assert validation error `A user with this email already exists.` is shown. | P0 | Implemented |
| TC05 | Verify current_state is derived from is_active on create | Create one active and one inactive driver and assert saved states map to `available` and `on_leave` in changelist results. | P1 | Implemented |
| TC06 | Verify search works across linked User and Driver fields | Validate changelist search by `driving_license_number`, `contact_number`, `user_email`, user first/last name, and user employee ID returns expected records. | P1 | Implemented |
| TC07 | Verify list filters for status and state (with query composition) | Apply `is_active` + `current_state` filters with search query parameters and assert only matching rows are shown. | P1 | Implemented |
| TC08 | Verify permanent vehicle autocomplete only lists active-brand vehicles | Create active/inactive brands, assert inactive brand is not available in vehicle brand autocomplete, then verify driver `permanent_vehicle` autocomplete returns active-brand vehicle and excludes inactive-brand vehicle term. | P2 | Implemented |
| TC09 | Verify required field validation for provisioning and compliance data | Submit add form without required inputs and assert required-field validation appears. | P0 | Implemented |
| TC10 | Verify unauthenticated access redirects to admin login | Clear auth state and verify driver changelist, add, change, and import routes redirect to `/admin/login/`. | P0 | Implemented |
| TC11 | Verify driver import page and CSV lifecycle | Validate template/sample download, upload mixed driver CSV rows, assert preview counters, run import, and verify created/updated rows are queryable in admin list. | P0 | Implemented |
| TC12 | Verify tenant-level uniqueness rules via admin validation/messages | Cover duplicate `contact_number`, `driving_license_number`, `national_id_number` (when provided), and `employee_id` conflicts; assert create is blocked and surfaced message is user-readable. | P0 | Implemented |

## Implementation Notes

- This plan is aligned with `DriverAdmin.save_model()` behavior that provisions `User` + `UserRole` + `Driver` in one admin transaction and links via `Driver.user`.
- Role/department expectations for create-path assertions: role code `driver` and department `operations` (per current `DriverAdmin` implementation and module spec).
- Invitation side-effects are intentionally out of scope for driver profile E2E assertions unless explicitly covered by a dedicated invitation E2E plan.
- Automation target file: `tests/e2e/modules/users/test_driver_user_profiles_e2e.py`.

## Current Runtime Constraints Reflected in Tests

- Tenant plan user quota can block user provisioning/import (`PLAN-403-LIMIT` / `User limit reached`); tests explicitly skip affected assertions when this business rule is hit.
- Add-form section assertions are scoped to admin content (`#content-main`) to avoid false negatives from sidebar/menu text.
- Vehicle setup flow reflects admin autocomplete rules: inactive brands are excluded from vehicle-brand selection; inactive-brand vehicle scenarios are validated via autocomplete exclusion, not vehicle creation through the add form.
