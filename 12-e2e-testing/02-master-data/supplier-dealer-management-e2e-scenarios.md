---
module: 02-master-data
specification: Supplier & Dealer Master Data Management - E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: US-096, DFS-018
source_spec: ../../03-module-specifications/02-master-data/supplier-dealer-management.md
last_updated: 2026-04-20
---

# Supplier & Dealer Master Data - E2E Scenario Plan

## Scope

Scenario planning for Supplier and Dealer master data based on:

- Entity model and field constraints
- Django Admin UI behavior (`add`, `changelist`, `change`, `delete`)
- Business validation and dependency rules
- Django Admin CSV import/export behavior
- Admin authentication, permissions, and audit logging expectations

## Story Point Mapping

| Story Point | Focus Area |
|------------|------------|
| US-096 | Supplier and Dealer CRUD lifecycle with validations and status handling |
| DFS-018 | Bulk upload, template handling, and append-only import validation |

## Test Data & Preconditions (Common)

- Tenant admin user exists and is authenticated.
- Non-privileged user exists for RBAC negative checks.
- Test tenant has clean supplier/dealer namespace for deterministic code uniqueness.
- At least one TR/TO/Trip/Gate linked reference fixture exists for dependency-based delete blocking.
- CSV fixtures prepared:
  - `supplier_valid_mixed.csv` (2 valid, 1 invalid row)
  - `dealer_duplicate_code.csv` (duplicate code rows)
  - `dealer_invalid_coordinates.csv` (invalid lat/long)

## Planned Scenarios

### US-096 - Supplier/Dealer CRUD and Business Rules

| Scenario ID | Objective | Preconditions | High-Level Steps | Expected Result |
|-------------|-----------|---------------|------------------|-----------------|
| E2E-SDM-001 | Create Supplier from admin add form | Authenticated tenant admin in Django Admin | Open Supplier add page, fill required fields, click Save | Supplier is persisted; default `is_active=true`; audit create log exists |
| E2E-SDM-002 | Create Dealer from admin add form | Authenticated tenant admin in Django Admin | Open Dealer add page, fill required fields, click Save | Dealer is persisted; audit create log exists |
| E2E-SDM-003 | Reject duplicate code on admin create | Existing supplier/dealer code in same tenant scope | Submit add form using an existing code | Inline/form validation error shown; entity not created |
| E2E-SDM-004 | Reject invalid email and coordinate range in form | Authenticated tenant admin in Django Admin | Submit add form with bad email / invalid latitude / invalid longitude | Field-level form errors shown; entity not created |
| E2E-SDM-005 | Changelist filtering, search, and sorting behavior | Seeded active + inactive entities | Use changelist filters/search/sorting on Supplier/Dealer admin pages | Correct filtered/sorted rows displayed |
| E2E-SDM-006 | Update Supplier/Dealer via admin change form | Existing active entity | Open change page, edit fields, click Save | Updated values persist; audit update log contains old/new values |
| E2E-SDM-007 | Deactivate using admin edit/action flow | Existing active entity used in no hard-delete flow | Mark entity inactive via admin form/action and save | Entity stays in DB with inactive status; excluded from active selections |
| E2E-SDM-008 | Hard delete allowed from admin delete page when no dependency | Entity without TR/TO/Trip/Gate links | Open delete confirmation in admin and confirm | Record is permanently removed |
| E2E-SDM-009 | Hard delete blocked in admin when dependency exists | Entity linked to TR/TO/Trip/Gate fixture | Attempt delete from admin delete confirmation page | Delete is blocked with clear "in use" feedback; entity remains |

### DFS-018 - Bulk Import/Template and Append-Only Guarantees

| Scenario ID | Objective | Preconditions | High-Level Steps | Expected Result |
|-------------|-----------|---------------|------------------|-----------------|
| E2E-SDM-010 | Download Supplier/Dealer CSV template from admin UI | Authenticated tenant admin in Django Admin | Open admin bulk import page and use template download action for Supplier/Dealer | Downloaded CSV includes mandatory columns |
| E2E-SDM-011 | Mixed-row CSV import processes valid rows only via admin | Prepared mixed fixture with 2 valid + 1 invalid | Upload CSV from admin bulk import page and execute import | Import summary indicates 2 success and 1 failure; only valid rows persisted |
| E2E-SDM-012 | Duplicate codes are append-only skipped/failed (no overwrite) | Existing entity code present | Import CSV containing existing codes | Existing rows unchanged; duplicates flagged in failure report |
| E2E-SDM-013 | Row-level validation reporting accuracy | CSV with invalid email/coordinates | Import CSV | Failed rows include row number + exact validation reason |
| E2E-SDM-014 | Admin import access control | Non-privileged or unauthenticated user | Attempt to open admin import page/template download/import action | Unauthenticated user redirected to admin login; unauthorized user receives permission denial |

## Execution Priority

1. Critical path: `E2E-SDM-001`, `E2E-SDM-002`, `E2E-SDM-005`, `E2E-SDM-006`, `E2E-SDM-009`, `E2E-SDM-011`
2. Business rule depth: `E2E-SDM-003`, `E2E-SDM-004`, `E2E-SDM-012`, `E2E-SDM-013`
3. Access and import safeguards: `E2E-SDM-014`

## Out of Scope (Current Iteration)

- API endpoint contract validation and direct API response assertions.
- Performance/load test criteria for bulk import processing.
- Cross-module dropdown rendering checks outside the Supplier/Dealer module.
