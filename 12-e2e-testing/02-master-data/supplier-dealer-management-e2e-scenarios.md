---
module: 02-master-data
specification: Supplier & Dealer Master Data Management - E2E Scenario Plan
version: 1.2
phase: Phase 1
related_stories: US-096, DFS-018
source_spec: ../../03-module-specifications/02-master-data/supplier-dealer-management.md
last_updated: 2026-04-22
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

## Notes

- Status is derived from implemented automation in:
  - `tests/e2e/modules/test_supplier_master_data_e2e.py`
  - `tests/e2e/modules/test_dealer_master_data_e2e.py`
- `TC09` remains `Partial` due to fixture-dependent branch where deletion may proceed if dependency links are not present in environment.
