---
module: 02-master-data
specification: POI Management - E2E Scenario Plan
version: 1.1
phase: Phase 1
related_stories: US-014
source_spec: ../../05-modules/02-master-data/poi-management.md
last_updated: 2026-04-28
---

# POI Management - E2E Scenario Plan

## Happy Path Test Cases (`POIAdmin`)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Verify POI creation with required identity fields | Verify admin can create POI with `poi_code`, `name`, and `poi_type`; after save, record appears in changelist with `is_active` enabled by default. | P0 | Pass |
| TC02 | Verify POI creation with full location and capacity attributes | Verify admin can create POI with address/city/country, latitude/longitude, geofence radius, storage capacity, gate/scale counts, and contact details; saved values are shown on change form. | P0 | Pass |
| TC03 | Verify POI changelist search behavior | Verify changelist search works by `poi_code`, `name`, and `city` and returns correct row(s). | P0 | Pass |
| TC04 | Verify POI changelist filter behavior | Verify changelist filtering by query params for `poi_type` and `is_active` correctly includes/excludes matching records. | P1 | Pass |
| TC05 | Verify POI update flow from change form | Verify editing mutable fields (e.g., name, city) persists and updated values are visible on changelist/search. | P0 | Pass |
| TC06 | Verify POI active to inactive toggle via change form | Verify updating `is_active` from checked to unchecked saves successfully and record appears only in inactive-filtered view. | P1 | Pass |

## Validation Path Test Cases (`POIAdmin` + `POI` model constraints)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC07 | Verify duplicate `poi_code` is rejected | Verify creating second POI with an existing `poi_code` fails with uniqueness validation and does not create a duplicate row. | P0 | Pass |
| TC08 | Verify missing required fields block POI creation | Verify create submit without required fields (`poi_code`, `name`, `poi_type`) is rejected and required-field validation feedback is shown. | P0 | Pass |
| TC09 | Verify negative geofence/gate/scale values are rejected | Verify negative values for `geofence_radius_meters`, `number_of_gates`, and `number_of_scales` are blocked by field-level validation. | P0 | Pass |
| TC10 | Verify unauthenticated user cannot access POI admin routes | Verify unauthenticated requests to POI changelist/add/change routes are redirected to admin login. | P0 | Pass |

## Alignment Notes

- Status is derived from implemented automation in:
  - `tests/e2e/modules/02-master-data/test_poi_master_data_e2e.py`
- Test coverage is aligned with current POI admin registration in `apps/master_data/admin.py` (`POIAdmin` with list/search/filter support).
- `poi-management.md` contains target-state geofencing/capacity behavior; current Phase 1 admin e2e coverage focuses on implemented admin CRUD/search/filter/auth and field-level validation currently enforceable in the Django admin/model layer.
