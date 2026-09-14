---
jira_key: ~
jira_type: Story
jira_sprint: ~
story_id: MDM-05
title: Lab Test Master — Category, Lab UOM, Test & Standard Value
epic: Master Data — Lab Test Catalog
status: Pending
story_points: 13
assignee: ~
prd_refs:
  - "DFMS_Product_Requirements_Document_v3.md §6.3 Master Data — QC Checklist templates (not implemented; this catalog fills the lab-test gap)"
  - "DFMS_Product_Requirements_Document_v3.md §6.19 Lab Test Request — lab test names (PRD allows free text; this story replaces that with a tenant catalog)"
  - "05-modules/02-master-data/README.md"
phase: Phase 2
related_stories:
  - QC-01 — Raw-material sampling and Pass/Fail (physical checkpoint; does not configure tests)
  - QC-02 — Lab receive / run / file results (picks tests from this catalog)
  - MDM-01 — Product master (requires_qc flag only; Product UOM is logistics — not reused here)
e2e_scenarios:
  - "../../../09-testing/backend/e2e-scenarios/stories-phase-2/009-Lab Testing/mdm-05-lab-test-master-e2e-scenarios.md"
---

# MDM-05 — Lab Test Master (Category, Lab UOM, Test & Standard Value)

## User Story

**As a** Tenant Super Admin or Tenant Admin  
**I want to** maintain the organisation’s lab test categories, lab units of measure, and lab tests (each with a standard value)  
**So that** each tenant defines the tests they actually run, with a shared category, unit, and reference spec — instead of typing test names ad hoc.

**E2E scenarios:** [mdm-05-lab-test-master-e2e-scenarios.md](../../../09-testing/backend/e2e-scenarios/stories-phase-2/009-Lab%20Testing/mdm-05-lab-test-master-e2e-scenarios.md)

---

## Business Context

QC-01 already covers **physical** sampling and Pass/Fail on raw-material inbound. It does not define *which lab tests* exist. The PRD listed **QC Checklist templates** as master data, but that catalog was never built. Lab work in the PRD lets the technician **type** a test name.

Tenants will not share one global test list. One site may care about moisture and aflatoxin; another may add protein or contamination. This story adds three tenant-owned masters under Master Data:

```
Test Category  ──┐
                 ├──►  Lab Test  (name + standard value + UOM)
Lab UOM        ──┘
```

Operational QC roles do not configure any of them.

This story is **catalog management only**. Sending a sample to the lab, scanning a label, entering results, and uploading reports are **out of scope** (QC-02). The standard value is a **reference number** on the test (shown with its UOM, e.g. `Moisture — 12.5 %`). The system does **not** interpret it as max/min/target and does **not** auto Pass/Fail against it.

---

## Locked decisions (PO)

| Topic | Decision |
|---|---|
| What this is | Three tenant masters: **Test Category**, **Lab UOM**, **Lab Test**. Not a physical inspection checklist. |
| Who configures | **Tenant Super Admin** and **Tenant Admin** only (all three screens). |
| Who does not configure | QA Lab Technician, QC Inspector – Physical, and all other operational roles. |
| Lab Test fields | Code, name, **category** (required FK), **lab UOM** (required FK), **standard value** (required decimal), optional description, active/inactive. |
| Standard value | One number per test for the **whole tenant**. Displayed with the UOM symbol (`12.5 %`). **No** standard rule (max / min / target). **No** min–max range. |
| Product mapping | **Not in v1.** One spec per test, not per product. Mapping tests to product is a later story. |
| Lab UOM vs Product UOM | **Separate catalogs.** Do not reuse Product UOM (`Bag`, `Ton`, `KG`, …). |
| Lab execution | **Not in this story.** Catalog only. QC-02 may later show name + standard + UOM as read-only when attaching a test. |
| Delete | **Deactivate**, do not hard-delete. Inactive rows stay in history and cannot be chosen for new work. |

---

## Acceptance Criteria

### AC-0 — Who may manage

- [ ] **Given** a Tenant Super Admin or Tenant Admin  
  **When** they manage Test Categories, Lab UOMs, or Lab Tests  
  **Then** they can create, view, edit, and deactivate/reactivate all three catalogs.

- [ ] **Given** a user who is neither Tenant Super Admin nor Tenant Admin  
  **When** they attempt to create, edit, or change status of any of the three (admin or API)  
  **Then** the action is denied.

- [ ] **Given** a QA Lab Technician  
  **When** they use the portal  
  **Then** they have no catalog setup access (no create/edit/deactivate, and no Master Data write menu for these screens).

### AC-1 — Test Category

- [ ] **Given** a Tenant Super Admin or Tenant Admin  
  **When** they create a Test Category  
  **Then** they can save category code, category name, optional description, and active status (default on).

- [ ] **Given** an existing Test Category  
  **When** they edit it or submit a duplicate code  
  **Then** they can change name and description; the code stays unique per tenant and immutable after create; a duplicate code is rejected with a clear error.

- [ ] **Given** Test Categories exist  
  **When** they open the category list  
  **Then** they can list, search/filter by code, name, and status, and deactivate or reactivate a category.

- [ ] **Given** a Test Category, including one referenced by tests  
  **When** they attempt to hard-delete it, or select an inactive category on a new or edited test  
  **Then** hard delete is not allowed; inactive categories remain on existing tests and cannot be selected for a new or edited test.

### AC-2 — Lab Unit of Measure

- [ ] **Given** a Tenant Super Admin or Tenant Admin  
  **When** they create a Lab UOM  
  **Then** they can save UOM code, UOM name, symbol (short label shown next to the standard value, e.g. `%`, `ppb`), and active status (default on).

- [ ] **Given** an existing Lab UOM  
  **When** they edit it or submit a duplicate code  
  **Then** they can change name and symbol; the code stays unique per tenant and immutable after create; a duplicate code is rejected with a clear error.

- [ ] **Given** Lab UOMs exist  
  **When** they open the UOM list  
  **Then** they can list, search/filter by code, name, and status, and deactivate or reactivate a UOM.

- [ ] **Given** a Lab UOM, including one referenced by tests  
  **When** they attempt to hard-delete it, or select an inactive UOM on a new or edited test  
  **Then** hard delete is not allowed; inactive UOMs remain on existing tests and cannot be selected for a new or edited test.

- [ ] **Given** Product UOM values (Bag, Ton, KG, …) exist for logistics  
  **When** they manage Lab UOM or create a Lab Test  
  **Then** the Lab UOM catalog is lab-only — it is not Product UOM and is not used for logistics.

### AC-3 — Lab Test

- [ ] **Given** there is no active Test Category or no active Lab UOM  
  **When** a Tenant Super Admin or Tenant Admin tries to create a Lab Test  
  **Then** creation is blocked until at least one active Test Category and one active Lab UOM exist.

- [ ] **Given** at least one active Test Category and one active Lab UOM exist  
  **When** a Tenant Super Admin or Tenant Admin creates a Lab Test  
  **Then** they can save test code, test name, category (required, active only), lab UOM (required, active only), standard value (required decimal ≥ 0), optional description, and active status (default on).

- [ ] **Given** a Lab Test whose selected UOM symbol is `%`  
  **When** they save a standard value  
  **Then** the value must be between **0 and 100** inclusive; for other UOMs the standard value must be ≥ 0 only.

- [ ] **Given** an existing Lab Test  
  **When** they edit it or submit a duplicate test code  
  **Then** they can change name, category, UOM, standard value, and description; the test code stays unique per tenant and immutable after create; a duplicate code is rejected with a clear error.

- [ ] **Given** Lab Tests exist  
  **When** they open the test list  
  **Then** they can list tests, search/filter by code, name, category, UOM, and status, and deactivate or reactivate a test.

- [ ] **Given** a Lab Test with a standard value and UOM  
  **When** they view the list or detail  
  **Then** the standard is shown with the UOM symbol (e.g. `12.5 %`, `20 ppb`) and there is no standard-rule field.

- [ ] **Given** an existing Lab Test  
  **When** they attempt to hard-delete it  
  **Then** hard delete is not allowed.

### AC-4 — Active vs inactive

- [ ] **Given** Lab Tests that are active and inactive  
  **When** new lab work is created (when QC-02 is built)  
  **Then** only **active** tests are eligible; inactive tests remain visible in the master list and on historical records.

- [ ] **Given** a test, category, or UOM that is referenced historically  
  **When** it is deactivated  
  **Then** past references are not rewritten or hidden.

### AC-5 — Tenant isolation

- [ ] **Given** two tenants each with their own catalogs  
  **When** a user in Tenant A manages categories, lab UOMs, or tests  
  **Then** they see and manage **only** Tenant A’s records.

- [ ] **Given** Tenant A and Tenant B  
  **When** both use the same category, UOM, or test code  
  **Then** the codes do not collide across tenants.

### AC-6 — Portal / Master Data

- [ ] **Given** a Tenant Super Admin or Tenant Admin  
  **When** they open Master Data  
  **Then** they see three screens in the same pattern as Brands / Product Categories: **Test Categories**, **Lab UOM**, and **Lab Tests**.

- [ ] **Given** they are creating or editing a Lab Test  
  **When** they choose category and UOM  
  **Then** they must pick those values from the masters (no free-typed category or UOM).

- [ ] **Given** a Tenant Super Admin or Tenant Admin  
  **When** they use the portal  
  **Then** the three Master Data screens are available to them.

- [ ] **Given** an operational QC role  
  **When** they use the portal  
  **Then** they do not get setup screens for these catalogs.

### AC-7 — Audit

- [ ] **Given** a category, lab UOM, or lab test  
  **When** it is created, edited, deactivated, or reactivated  
  **Then** the change is audit-logged (who, when, what changed).

---

## Functional Flows

### Flow A — Tenant sets up category, UOM, then a test

```
Tenant Admin → Master Data → Test Categories → Add
  → Code: CONT, Name: Contaminant → Save (active)

Tenant Admin → Master Data → Lab UOM → Add
  → Code: PPB, Name: Parts per billion, Symbol: ppb → Save (active)

Tenant Admin → Master Data → Lab Tests → Add
  → Code: AFLA-B1, Name: Aflatoxin B1
  → Category: Contaminant, UOM: ppb, Standard value: 20
  → Save (active)
  → List shows: AFLA-B1 | Aflatoxin B1 | Contaminant | 20 ppb | Active
```

### Flow B — Cannot save a test without masters

```
Tenant Admin → Lab Tests → Add
  → No active category or no active UOM
  → Save blocked; must create category and UOM first
```

### Flow C — Retire a test

```
Tenant Admin opens Aflatoxin B1 → Deactivate
  → No longer selectable for new lab work
  → Still visible as inactive in the master list (20 ppb retained)
  → Historical samples that used it are unchanged
```

### Flow D — Lab technician cannot configure

```
QA Lab Technician logs in
  → No Test Categories / Lab UOM / Lab Tests create/edit/deactivate
  → Catalog setup is Tenant Super Admin / Tenant Admin only
```

---

## Business Rules

| ID | Rule |
|---|---|
| BR-MDM05-001 | All three masters are tenant-scoped. Codes are unique within a tenant and immutable after create. |
| BR-MDM05-002 | Only Tenant Super Admin and Tenant Admin may create, edit, or change status. |
| BR-MDM05-003 | QA Lab Technician (and QC Inspector – Physical) do not configure any of the three. |
| BR-MDM05-004 | Inactive tests cannot be selected for new lab work; history is preserved. Inactive category/UOM cannot be selected on create/edit. |
| BR-MDM05-005 | No hard delete. Deactivate / reactivate only. Referenced category/UOM cannot be hard-deleted. |
| BR-MDM05-006 | Tests are not mapped to product. One standard value per test for the tenant. |
| BR-MDM05-007 | This catalog is for **lab tests** only, not physical inspection checklists. |
| BR-MDM05-008 | Lab UOM is not Product UOM. Logistics units (Bag, Ton, KG, …) are not used here. |
| BR-MDM05-009 | Lab Test requires an active category, an active lab UOM, and a standard value (≥ 0; 0–100 when UOM symbol is `%`). |
| BR-MDM05-010 | There is no standard-rule field. The number is a reference spec only; the system does not treat it as max, min, or target, and does not auto Pass/Fail. |

---

## Data Dictionary

### Test Category

| Field | Type | Required | Remarks |
|---|---|---|---|
| Category Code | Text | Yes | Unique per tenant; immutable after create |
| Category Name | Text | Yes | e.g. Moisture, Nutritional, Contaminant |
| Description | Text | No | |
| Status | Active / Inactive | Yes | Default Active |

### Lab Unit of Measure

| Field | Type | Required | Remarks |
|---|---|---|---|
| UOM Code | Text | Yes | Unique per tenant; immutable after create (e.g. `PCT`, `PPM`, `PPB`) |
| UOM Name | Text | Yes | e.g. Percent, Parts per million |
| Symbol | Text | Yes | Shown next to standard value (`%`, `ppm`, `ppb`, `mg/kg`, `CFU/g`) |
| Status | Active / Inactive | Yes | Default Active |

### Lab Test

| Field | Type | Required | Remarks |
|---|---|---|---|
| Test Code | Text | Yes | Unique per tenant; immutable after create |
| Test Name | Text | Yes | What the lab and admins see (e.g. Moisture, Aflatoxin B1) |
| Category | FK → Test Category | Yes | Active category only on create/edit |
| Unit of Measure | FK → Lab UOM | Yes | Active lab UOM only on create/edit |
| Standard Value | Decimal | Yes | Tenant reference spec; ≥ 0; 0–100 if UOM symbol is `%` |
| Description | Text | No | Method / SOP notes |
| Status | Active / Inactive | Yes | Default Active |

Displayed as `{standard value} {symbol}` (e.g. `12.5 %`). No standard-rule column.

---

## Sub-tasks

| # | Sub-task | Description | Priority | Status |
|---|---|---|---|---|
| MDM-05-1 | Test Category | Model + migration; admin/API CRUD; unique code per tenant; deactivate | High | Not done |
| MDM-05-2 | Lab UOM | Model + migration; admin/API CRUD; code, name, symbol; unique code per tenant; deactivate | High | Not done |
| MDM-05-3 | Lab Test model | Lab Test with FKs to category and UOM; standard value; unique test code per tenant | High | Not done |
| MDM-05-4 | Lab Test admin CRUD | List / add / change / deactivate; filters; cannot save without active category + UOM | High | Not done |
| MDM-05-5 | Portal + RBAC | Three Master Data screens for Tenant Super Admin / Tenant Admin only | High | Not done |
| MDM-05-6 | API | REST for categories, lab UOMs, and tests (create/list/retrieve/update/status) | High | Not done |
| MDM-05-7 | Audit | Create / update / status-change on all three | Medium | Not done |
| MDM-05-8 | Bulk CSV | Import/export on the Brand pattern (optional if timeboxed) | Medium | Not done |
| MDM-05-9 | Tests | Uniqueness; FK required; `%` 0–100; inactive not selectable; non-admin write denied; tenant isolation; Product UOM unused | High | Not done |

---

## API Endpoints

```
POST   /api/v1/lab-test-categories
GET    /api/v1/lab-test-categories?search=&status=&page=&per_page=
GET    /api/v1/lab-test-categories/{id}
PUT    /api/v1/lab-test-categories/{id}
PATCH  /api/v1/lab-test-categories/{id}/status

POST   /api/v1/lab-uoms
GET    /api/v1/lab-uoms?search=&status=&page=&per_page=
GET    /api/v1/lab-uoms/{id}
PUT    /api/v1/lab-uoms/{id}
PATCH  /api/v1/lab-uoms/{id}/status

POST   /api/v1/lab-tests
GET    /api/v1/lab-tests?search=&status=&category=&uom=&page=&per_page=
GET    /api/v1/lab-tests/{id}
PUT    /api/v1/lab-tests/{id}
PATCH  /api/v1/lab-tests/{id}/status
```

Lab Test create/update body includes `category_id`, `uom_id`, and `standard_value`. Codes are accepted on write only at create.

---

## Access & Permissions

| Action | Tenant Super Admin | Tenant Admin | QA Lab Technician | QC Inspector – Physical |
|---|---|---|---|---|
| View Test Categories / Lab UOM / Lab Tests | Yes | Yes | No (this story) | No |
| Create / edit / deactivate any of the three | Yes | Yes | No | No |
| Run lab tests / upload reports | Out of scope | Out of scope | Out of scope | Out of scope |

QA Lab Technician **read** of active tests (name, standard value, UOM) belongs with QC-02, not this setup story.

---

## Dependencies

| Dependency | Notes |
|---|---|
| Master Data admin + portal | Follow Brand / Product Category pattern (`apps/master_data`, Master Data nav) |
| RBAC | Tenant Super Admin / Tenant Admin already manage masters; add permissions the same way |
| Product UOM | Do **not** extend or reuse `UnitOfMeasure` on Product |
| QC-01 | Unchanged. Physical sample + Pass/Fail stay as they are. |
| QC-02 | Picks **active** tests from this catalog. May show name + standard + UOM as read-only on attach. Does not type a result against the standard. |

---

## Test Plan

Playwright admin E2E: [mdm-05-lab-test-master-e2e-scenarios.md](../../../09-testing/backend/e2e-scenarios/stories-phase-2/009-Lab%20Testing/mdm-05-lab-test-master-e2e-scenarios.md)

- [ ] Tenant Admin creates category Contaminant and UOM `ppb` → both listed as active
- [ ] Duplicate category code or UOM code in the same tenant is rejected; same codes in another tenant are allowed
- [ ] Lab Test create is blocked until an active category and an active UOM exist
- [ ] Tenant Admin creates AFLA-B1 / Aflatoxin B1 / Contaminant / 20 ppb → list shows `20 ppb`
- [ ] Duplicate test code in the same tenant is rejected
- [ ] Edit name, category, UOM, standard value; test code stays stable
- [ ] Standard value negative is rejected; `%` UOM with 105 is rejected; `%` UOM with 12.5 is accepted
- [ ] Inactive category/UOM cannot be selected on a new or edited test
- [ ] Deactivate test → still listed as inactive; not eligible for new work
- [ ] Reactivate test → eligible again
- [ ] QA Lab Technician / QC Inspector – Physical / Gateman cannot create or edit any of the three
- [ ] Audit trail on create, edit, deactivate for all three
- [ ] Tenant A cannot see Tenant B’s categories, UOMs, or tests
- [ ] Product UOM values are not offered on Lab Test

---

## Out of Scope

- Lab sample receive, test start/end, ETA, report upload, To-Do / WIP / Completed (QC-02)
- QR / sample labelling
- Pass / Fail / Auto-Pass (stays on QC-01)
- Auto-evaluating a typed lab result against the standard value
- Standard rule (maximum / minimum / target)
- Min–max range, tolerance, LOD / LOQ
- Mapping tests to product or product category (would allow per-product specs)
- Reusing or extending Product UOM
- Physical QC checklist templates (look, smell, photos)
- Equipment, calibration, SLA, lab site, sample quantity, cost
- Changing QC-01 sampling screens to use this catalog

---

## Definition of Done

- [ ] All acceptance criteria AC-0–AC-7 met
- [ ] Sub-tasks MDM-05-1 … MDM-05-6 and MDM-05-9 completed (MDM-05-7 / MDM-05-8 if included in scope)
- [ ] Tenant Super Admin and Tenant Admin can maintain Test Categories, Lab UOMs, and Lab Tests (with required standard value)
- [ ] Operational QC roles cannot configure the catalogs
- [ ] Unit tests cover uniqueness, required FKs, standard-value bounds, status, RBAC, tenant isolation, and no Product UOM reuse
- [ ] Story status updated for Phase 2 tracking

---

## Notes

- Suggested PRD delta (BA, later): replace “insert test names as text” with “select from tenant Lab Test master (category, UOM, standard value).”
- Do not fold this into Product (`requires_qc` stays a flag only).
- Do not treat this as QC Checklist / physical inspection master.
- Standard value is tenant-wide for that test. Different specs for maize vs soybean meal need a later product-mapping story.
- QC-02 result remains a **file upload**. Showing `Aflatoxin B1 — 20 ppb` on attach is display-only.
