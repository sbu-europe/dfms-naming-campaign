---
module: 02-master-data
specification: MDM-05 Lab Test Master (Category, Lab UOM, Test & Standard Value) — Playwright E2E Scenario Plan
version: 1.1
phase: Phase 2
related_stories: MDM-05
source_spec: ../../../../../03-backlog/stories-phase-2/009-Lab Testing/MDM-05-lab-test-master.md
implementation_reference:
  - apps/master_data/admin.py (BrandAdmin / ProductCategoryAdmin — pattern to copy; Lab Test masters not registered yet)
  - apps/core/portal_navigation.py (Master Data section; Test Categories / Lab UOM / Lab Tests not present yet)
  - apps/master_data/models.py (UnitOfMeasure TextChoices on Product — must not be reused)
last_updated: 2026-09-14
playwright_mcp: true
---

# MDM-05 — Lab Test Master — E2E Scenario Plan (Django Admin SSR)

**Story:** [MDM-05 — Lab Test Master](../../../../../03-backlog/stories-phase-2/009-Lab%20Testing/MDM-05-lab-test-master.md)

Target runner: **Playwright MCP** against seeded Nourish (`docs/guides/playwright-mcp-admin.md`).  
Credentials: `docs/testing/playwright-mcp-credentials.yaml`.

Scope: Tenant Super Admin / Tenant Admin CRUD of **Test Categories**, **Lab UOM**, and **Lab Tests** (catalog only).  
Hard delete follows [`master-data-delete-operations.md`](../../../../../05-modules/02-master-data/master-data-delete-operations.md): **Delete** only when there are **no dependencies**, with a mandatory **Delete reason**; referenced rows are blocked (deactivate instead).  
**Out of scope:** QC-02 send/open/file; QR; auto Pass/Fail against standard value; product-to-test mapping; Product UOM reuse; physical QC checklists (QC-01); REST DELETE APIs.

> **Code status (2026-09-14):** Lab Test Category / Lab UOM / Lab Test models and admin screens are **not implemented**. Cases below follow MDM-05 AC and the Brand / Product Category admin pattern. Proposed URLs and labels are story-shaped; update Implementation Notes when templates land.

## Seed prerequisites

| Item | Notes |
|------|--------|
| Actors | **Tenant Super Admin** `superadmin.nourish@yopmail.com`; **Tenant Admin** `admin.nourish@yopmail.com`; **QA Lab Technician** `qa.lab.technician1.nourish@yopmail.com`; **QC Inspector – Physical** `qc.inspector.physical1.nourish@yopmail.com` |
| Wipe | Prefix codes/names `MCP-MDM05-` (category `MCP-CONT`, UOM `MCP-PPB`, test `MCP-AFLA-B1`; delete fixtures `MCP-DEL-CAT`, `MCP-DEL-UOM`, `MCP-DEL-TST`) |
| Product UOM | Existing Product UOM choices (`Bag`, `Ton`, `KG`, …) must remain on Product, not Lab Test |

## A — Access & nav (AC-0, AC-6)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Tenant Super Admin sees three Lab Test master screens | As **Tenant Super Admin**, log in at `/admin/login/`. Open **Master Data**. Assert three screens in the Brand / Product Categories pattern: **Test Categories**, **Lab UOM**, **Lab Tests** (proposed paths `/admin/master_data/labtestcategory/`, `/admin/master_data/labuom/`, `/admin/master_data/labtest/`). Assert **Add** is available on each. | P0 | Planned |
| TC02 | Tenant Admin can create and edit all three | As **Tenant Admin**, open each of the three changelists. Assert **Add** and change views succeed (create at least one category, one Lab UOM, one test after TC05/TC10 exist). | P0 | Planned |
| TC03 | QA Lab Technician has no catalog setup | As **QA Lab Technician**, open `/admin/`. Assert **Test Categories** / **Lab UOM** / **Lab Tests** are absent from Master Data (or 403 on add/change/**delete** URLs). Assert no create/edit/deactivate/**Delete**. | P0 | Planned |
| TC04 | QC Inspector – Physical cannot write catalogs | As **QC Inspector – Physical**, open the three add and delete URLs. Assert forbidden / no write actions (admin + any exposed write POST), including hard delete. | P0 | Planned |

## B — Test Category (AC-1)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC05 | Create Test Category | As **Tenant Admin**, **Master Data → Test Categories → Add**. Fill **Category code** `MCP-CONT`, **Category name** `MCP Contaminant`, optional description, **Active** on (default). **Save**. Assert row on changelist: code, name, **Active**. | P0 | Planned |
| TC06 | Duplicate category code rejected | Still as Tenant Admin, **Add** a second category with the same code `MCP-CONT`. **Save**. Assert clear uniqueness error; no second row. | P0 | Planned |
| TC07 | Category code immutable after create | Open `MCP-CONT` change view. Assert **Category code** is read-only. Change **Category name** / description; **Save**. Assert name updated and code still `MCP-CONT`. | P0 | Planned |
| TC08 | List search/filter and deactivate / reactivate | On Test Categories changelist, search/filter by code, name, and status. Select `MCP-CONT`, action **Deactivate selected** (or row deactivate). Assert **Inactive**. Action **Activate selected**. Assert **Active**. | P0 | Planned |

## C — Lab UOM (AC-2)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC10 | Create Lab UOM | As **Tenant Admin**, **Master Data → Lab UOM → Add**. Fill **UOM code** `MCP-PPB`, **UOM name** `Parts per billion`, **Symbol** `ppb`, **Active** on. **Save**. Assert listed as active. | P0 | Planned |
| TC11 | Duplicate Lab UOM code rejected; code immutable | **Add** another UOM with code `MCP-PPB`. Assert uniqueness error. On the existing row, assert code is read-only; name/symbol editable. | P0 | Planned |
| TC12 | Lab UOM is not Product UOM | On **Lab Tests → Add**, open the Lab UOM picker. Assert logistics Product UOM values (`Bag`, `Ton`, `KG`, …) are **not** offered. Assert only Lab UOM catalog rows (e.g. `ppb`). | P0 | Planned |

## D — Lab Test (AC-3, AC-4)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC14 | Create blocked without active category and UOM | As **Tenant Admin**, with no active Test Category **or** no active Lab UOM (deactivate both if needed), open **Lab Tests → Add**. Attempt **Save**. Assert blocked until at least one active category and one active Lab UOM exist. Reactivate `MCP-CONT` and `MCP-PPB` before TC15. | P0 | Planned |
| TC15 | Create Lab Test with standard + symbol | **Lab Tests → Add**: **Test code** `MCP-AFLA-B1`, **Test name** `MCP Aflatoxin B1`, **Category** Contaminant (active), **Lab UOM** `ppb` (active), **Standard value** `20`, optional description, **Active** on. **Save**. Assert changelist shows `MCP-AFLA-B1` \| Aflatoxin B1 \| Contaminant \| **`20 ppb`** \| Active. Assert **no** standard-rule field (max/min/target). | P0 | Planned |
| TC16 | Percent UOM standard must be 0–100 | Create (or reuse) Lab UOM symbol `%`. On Lab Test add/change with that UOM, save standard `105`. Assert rejected. Save `12.5`. Assert accepted and list/detail show `12.5 %`. | P0 | Planned |
| TC17 | Negative standard value rejected | On Lab Test add/change with `ppb`, enter standard `-1`. **Save**. Assert rejected (standard ≥ 0). | P0 | Planned |
| TC18 | Duplicate test code rejected; code immutable | **Add** another test with code `MCP-AFLA-B1`. Assert uniqueness error. On the existing test, assert **Test code** read-only; name, category, UOM, standard, description editable. | P0 | Planned |
| TC19 | List search/filter by code, name, category, UOM, status | On Lab Tests changelist, filter/search by those fields. Assert `MCP-AFLA-B1` appears when matching and is hidden when filters exclude it. | P1 | Planned |
| TC20 | Deactivate test — listed but not eligible for new work | Deactivate `MCP-AFLA-B1`. Assert still visible as **Inactive** with `20 ppb` retained. Assert it cannot be selected for new lab work (QC-02 attach picker, when present; otherwise assert inactive not in active-only autocomplete). | P0 | Planned |
| TC21 | Reactivate test | Reactivate `MCP-AFLA-B1`. Assert **Active** and selectable again for new work. | P0 | Planned |
| TC22 | Deactivate does not rewrite history | After TC20-style deactivate, open a historical reference (or the inactive row). Assert past display of category/UOM/standard is unchanged (not blanked). | P1 | Planned |
| TC09 | Inactive category not selectable on new/edited test | After TC15, deactivate `MCP-CONT`. On **Lab Tests → Add** and on `MCP-AFLA-B1` change, assert inactive `MCP-CONT` cannot be chosen. Existing test still shows the category. Reactivate `MCP-CONT` before later TCs. | P0 | Planned |
| TC13 | Inactive Lab UOM not selectable on new/edited test | Deactivate `MCP-PPB`. On Lab Test create/edit, assert it cannot be selected; existing tests still show `ppb`. Reactivate `MCP-PPB` before later TCs. | P0 | Planned |

## E — Tenant isolation & audit (AC-5, AC-7)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC23 | Same code allowed in another tenant; nourish cannot see it | If a second tenant admin session is available (e.g. platform vs nourish), create the same codes there. As Nourish Tenant Admin, assert only Nourish rows appear. If only Nourish is available, skip with note — uniqueness is per tenant. | P1 | Planned |
| TC24 | Audit create / edit / deactivate / reactivate / hard delete | After TC05, TC07, TC08, TC15, TC20, TC21, and a successful hard delete (TC26), as Tenant Admin open **Users & Access → Audit Logs** (`/admin/audit/auditlog/`). Assert entries for category, Lab UOM, and lab test create/edit/status change/delete (who, when, what changed). Hard-delete row includes **Delete reason**. | P1 | Planned |

## F — Hard delete with reason (AC-1, AC-2, AC-3)

Same Admin flow as other Master Data ([delete-operations-e2e-scenarios.md](../../02-master-data/delete-operations-e2e-scenarios.md)): **Delete** → confirmation with **Delete reason** → confirm. Run TC25–TC31 **after** TC15 so `MCP-CONT` / `MCP-PPB` / `MCP-AFLA-B1` exist as referenced rows.

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC25 | Unused category — blank reason blocked | As **Tenant Admin**, create category `MCP-DEL-CAT` with **no** lab tests. Open change view → **Delete**. Assert confirmation shows required **Delete reason**. Submit blank. Assert delete blocked (validation ERROR, e.g. **Delete reason is required.**); row still on changelist. | P0 | Planned |
| TC26 | Unused category — hard delete with reason | On `MCP-DEL-CAT` delete confirmation, enter **Delete reason** `MCP-MDM05 unused category` and confirm. Assert row gone from changelist. Open **Audit Logs**; assert DELETE (or equivalent) for that category with the same reason. | P0 | Planned |
| TC27 | Unused Lab UOM — blank reason then delete with reason | Create Lab UOM `MCP-DEL-UOM` with no tests. **Delete** with blank **Delete reason** → blocked. **Delete** with reason `MCP-MDM05 unused uom` → row removed. | P0 | Planned |
| TC28 | Unused lab test — blank reason then delete with reason | Create lab test `MCP-DEL-TST` (active category/UOM) with **no** QC-02 lab-work reference. **Delete** without reason → blocked. **Delete** with reason `MCP-MDM05 unused test` → row removed. | P0 | Planned |
| TC29 | Referenced category hard-delete blocked | On `MCP-CONT` (used by `MCP-AFLA-B1`), click **Delete**. Assert hard delete is **blocked** with a user-friendly message listing the lab test(s). Row remains. Admin may **Deactivate** instead. | P0 | Planned |
| TC30 | Referenced Lab UOM hard-delete blocked | On `MCP-PPB` (used by `MCP-AFLA-B1`), **Delete**. Assert blocked with dependency message; UOM remains. | P0 | Planned |
| TC31 | Referenced lab test hard-delete blocked | When a QC-02 attach/history line exists for `MCP-AFLA-B1`, **Delete** is blocked with a dependency message; deactivate instead. If QC-02 is not built yet, skip and note — unused tests are covered by TC28. | P1 | Planned |

## Implementation Notes (Playwright + Django Admin SSR)

- Automation drives Django admin SSR only (no REST `/api/v1/lab-tests` contract tests).
- Role fixtures: do not reuse QA Lab Technician for catalog writes.
- Proposed admin URL names: `admin:master_data_labtestcategory_changelist`, `admin:master_data_labuom_changelist`, `admin:master_data_labtest_changelist`. Confirm after `@admin.register`.
- Master data pattern: `BrandAdmin` / `ProductCategoryAdmin` — `list_filter` includes `is_active`; actions **Activate selected** / **Deactivate selected**. Hard delete follows `TenantMasterDataAdmin` / [`master-data-delete-operations.md`](../../../../../05-modules/02-master-data/master-data-delete-operations.md): confirmation **Delete reason** (mandatory); blocked when `collect_dependency_labels` finds references (category/UOM → lab tests; lab test → QC-02 lines). Message tone: cannot delete — *n* lab tests currently assigned; deactivate instead.
- Selectors: `#content-main`, `#result_list`, `.messagelist`, changelist search `#searchbar`, delete confirmation **Delete reason** field (same widget as other masters).
- **Known drift:** No Lab Test models/nav yet. `UnitOfMeasure` on Product is an enum (`Bag`/`Ton`/`KG`), not a Lab UOM table. QC-02 attach of active tests is out of this plan except inactive-not-selectable (TC09/TC13) and referenced-test delete (TC31).
- Scope guardrail: catalog only — do not send samples or upload lab reports here.
- Suggested next step: implement MDM-05 admin with the existing master-data delete helper, then run this plan via Playwright MCP; refresh button labels from templates.
