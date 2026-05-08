---
module: 02-master-data
specification: Supplier & Dealer Master Data Management - E2E Scenario Plan
version: 1.2
phase: Phase 1
related_stories: US-096, DFS-018
source_spec: ../../05-modules/02-master-data/supplier-dealer-management.md
last_updated: 2026-04-28
---

# Supplier & Dealer Master Data - E2E Scenario Plan

## Test Cases (Aligned with Implemented E2E Tests)

| Test Case ID | Test Scenario | Test Description | Status |
|--------------|---------------|------------------|--------|
| TC01 | Verify supplier creation and search in admin | Verify that creating a supplier from Django Admin add form persists the record, returns to changelist, and allows searching by code/name with `is_active` defaulted to checked. | Pass |
| TC02 | Verify dealer creation and search in admin | Verify that creating a dealer from Django Admin add form persists the record, returns to changelist, and allows searching by code/name with `is_active` defaulted to checked. | Pass |
| TC03 | Verify duplicate supplier/dealer code rejection | Verify that creating a second supplier/dealer with an existing code in the same tenant shows validation error and blocks record creation. | Pass |
| TC04 | Verify supplier/dealer invalid email and coordinate validation | Verify that invalid email format is rejected by form validation and out-of-range latitude/longitude values are rejected with validation messages. | Pass |
| TC05 | Verify changelist search, filter, and sorting for supplier/dealer | Verify that admin changelist supports search by token, active/inactive filtering, and sortable result ordering for supplier/dealer records. | Pass |
| TC06 | Verify supplier/dealer update via change form | Verify that editing supplier/dealer fields from change form persists updated values and reflects them on changelist search results. | Pass |
| TC07 | Verify supplier/dealer deactivate action behavior | Verify that deactivate action marks records inactive, shows success message, includes records in inactive view, and excludes them from active view. | Pass |
| TC08 | Verify permanent delete when no dependencies exist | Verify that delete permanently action removes supplier/dealer records when there are no dependent operational references. | Pass |
| TC09 | Verify delete blocked when dependency exists | Verify that delete permanently action blocks deletion when referenced by dependent records; in environments without dependency fixtures, fallback behavior may delete record instead. | Partial |
| TC10 | Verify supplier/dealer CSV template download headers | Verify that CSV template download from import page contains required master data columns for supplier/dealer entities. | Pass |
| TC11 | Verify mixed-row import processes valid rows only | Verify that import preview shows total/valid/invalid counts, imports only valid supplier/dealer rows, skips invalid rows, and reflects final import summary. | Pass |
| TC12 | Verify append-only behavior for duplicate code import | Verify that importing rows with existing supplier/dealer code marks row invalid and does not overwrite existing record values. | Pass |
| TC13 | Verify invalid-row reporting includes row and reason | Verify that import preview includes failing CSV row number and explicit validation reasons for invalid latitude/longitude values. | Pass |
| TC14 | Verify import page requires authentication | Verify that authenticated admin can open import page and unauthenticated user is redirected to admin login page. | Pass |
| TC15 | Verify supplier/dealer duplicate name rejection on create | Verify that creating a supplier/dealer with an existing name in the same tenant (case-insensitive) is rejected with form validation error and record is not created. | Pass |
| TC16 | Verify supplier/dealer duplicate name rejection on update | Verify that updating an existing supplier/dealer name to another existing name in the same tenant (case-insensitive) is rejected and original value remains unchanged. | Pass |
| TC17 | Verify supplier/dealer code required validation | Verify that submitting supplier/dealer create form with empty or whitespace-only code is rejected with required/code validation feedback and record is not created. | Pass |
| TC18 | Verify supplier/dealer name required validation | Verify that submitting supplier/dealer create form with empty or whitespace-only name is rejected with required/name validation feedback and record is not created. | Pass |
| TC19 | Verify import upload requires CSV file selection | Verify that import upload without choosing a file is blocked by file-required validation and does not create import job. | Pass |
| TC20 | Verify import upload rejects non-CSV files | Verify that uploading a non-`.csv` file on supplier/dealer import page shows extension validation error and does not create import job. | Pass |
| TC21 | Verify import confirm blocked for invalid job state | Verify that confirming import when job status is not `PREVIEW_READY` is rejected with status-specific error message and no import execution starts. | Pass |
| TC22 | Verify import confirm route rejects GET execution | Verify that accessing import confirm endpoint via GET does not execute import and redirects back to import preview page. | Pass |

## Notes

- Status is derived from implemented automation in:
  - `tests/e2e/modules/02-master-data/test_supplier_master_data_e2e.py`
  - `tests/e2e/modules/02-master-data/test_dealer_master_data_e2e.py`
- `TC09` remains `Partial` due to fixture-dependent branch where deletion may proceed if dependency links are not present in environment.
- `TC15`-`TC22` are now covered by implemented E2E automation in:
  - `tests/e2e/modules/02-master-data/test_supplier_master_data_e2e.py`
  - `tests/e2e/modules/02-master-data/test_dealer_master_data_e2e.py`
- Validation behavior for `TC17`-`TC19` may surface as browser/Django required-field messaging depending on runtime/UI flow; assertions are aligned to implementation behavior in `apps/master_data/admin.py` and current admin UI.
