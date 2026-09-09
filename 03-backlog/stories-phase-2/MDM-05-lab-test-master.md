---
jira_key: ~
jira_type: Story
jira_sprint: ~
story_id: MDM-05
title: Lab Test Master — Tenant-Configured Test Catalog
epic: Master Data — Lab Test Catalog
status: Pending
story_points: 8
assignee: ~
prd_refs:
  - "DFMS_Product_Requirements_Document_v3.md §6.3 Master Data — QC Checklist templates (not implemented; this catalog fills the lab-test gap)"
  - "DFMS_Product_Requirements_Document_v3.md §6.19 Lab Test Request — lab test names (PRD allows free text; this story replaces that with a tenant catalog)"
  - "05-modules/02-master-data/README.md"
phase: Phase 2
related_stories:
  - QC-01 — Raw-material sampling and Pass/Fail (physical checkpoint; does not configure tests)
  - QC-02 — Lab receive / run / file results (picks tests from this catalog)
  - MDM-01 — Product master (requires_qc flag only; no test catalog)
---

# MDM-05 — Lab Test Master (Tenant-Configured Catalog)

## User Story

**As a** Tenant Super Admin or Tenant Admin  
**I want to** create and maintain the organisation’s standard lab tests  
**So that** each tenant defines the tests they actually run, instead of typing test names ad hoc or waiting for a platform-wide template.

---

## Business Context

QC-01 already covers **physical** sampling and Pass/Fail on raw-material inbound. It does not define *which lab tests* exist. The PRD listed **QC Checklist templates** as master data, but that catalog was never built. Lab work in the PRD lets the technician **type** a test name.

Tenants will not share one global test list. One site may care about moisture and aflatoxin; another may add protein or contamination. This story adds a **Lab Test master** under Master Data: the tenant configures the standard list; operational QC roles do not.

This story is **catalog management only**. Sending a sample to the lab, scanning a label, entering results, and uploading reports are **out of scope** (follow-on to QC-01).

---

## Locked decisions (PO)

| Topic | Decision |
|---|---|
| What this is | A tenant-owned **flat** catalog of lab tests. Not a physical inspection checklist. |
| Who configures | **Tenant Super Admin** and **Tenant Admin** only. |
| Who does not configure | QA Lab Technician, QC Inspector – Physical, and all other operational roles. |
| Product mapping | **Not in v1.** The technician will later see every **active** test. Mapping tests to product or category is a later story. |
| Lab execution | **Not in this story.** Catalog only. |
| Delete | **Deactivate**, do not hard-delete. Inactive tests stay in history and cannot be chosen for new work. |
| Fields (v1) | Code, name, optional description, active/inactive. No pass range, equipment, SLA, or lab site. |

---

## Acceptance Criteria

### AC-0 — Who may manage

- [ ] **Tenant Super Admin** and **Tenant Admin** can create, view, edit, and deactivate/reactivate lab tests.
- [ ] A user who is neither Tenant Super Admin nor Tenant Admin cannot create, edit, or change status of a lab test (admin + API).
- [ ] **QA Lab Technician** has **no** catalog setup access (no create/edit/deactivate, no Master Data “Lab Tests” write menu).

### AC-1 — Catalog CRUD

- [ ] Tenant Super Admin / Tenant Admin can **create** a lab test with: test code, test name, optional description, active (default on).
- [ ] They can **edit** name and description of an existing test.
- [ ] Test **code** is unique per tenant and is not changed after create (or is treated as immutable). Duplicate code is rejected with a clear error.
- [ ] They can **view** a list of tests, search/filter by code, name, and status (active/inactive).
- [ ] They can **deactivate** an active test and **reactivate** an inactive test.
- [ ] There is **no hard delete**.

### AC-2 — Active vs inactive

- [ ] Only **active** tests are eligible for new lab work (when that workflow is built). Inactive tests remain visible in the master list and on historical records.
- [ ] Deactivating a test does not rewrite or hide past references.

### AC-3 — Tenant isolation

- [ ] Each tenant sees and manages **only** its own tests.
- [ ] The same code may exist in two tenants; it must not collide across tenants.

### AC-4 — Portal / Master Data

- [ ] Master Data includes a **Lab Tests** screen (same pattern as Brands / Products).
- [ ] The screen is available to Tenant Super Admin and Tenant Admin.
- [ ] Operational QC roles do not get a setup screen for this catalog.

### AC-5 — Audit

- [ ] Create, edit, deactivate, and reactivate are audit-logged (who, when, what changed).

---

## Functional Flows

### Flow A — Tenant defines its tests

```
Tenant Admin → Master Data → Lab Tests → Add
  → Code: MOISTURE, Name: Moisture, Description: (optional)
  → Save (active)
  → Repeat for Protein, Aflatoxin, …
  → List shows the tenant’s standard tests
```

### Flow B — Retire a test

```
Tenant Admin opens Moisture → Deactivate
  → Moisture no longer selectable for new lab work
  → Still visible as inactive in the master list
  → Historical samples that used Moisture are unchanged
```

### Flow C — Lab technician cannot configure

```
QA Lab Technician logs in
  → No Lab Tests create/edit/deactivate
  → Catalog setup is Tenant Super Admin / Tenant Admin only
```

---

## Business Rules

| ID | Rule |
|---|---|
| BR-MDM05-001 | Lab Test master is tenant-scoped. Codes are unique within a tenant. |
| BR-MDM05-002 | Only Tenant Super Admin and Tenant Admin may create, edit, or change status. |
| BR-MDM05-003 | QA Lab Technician (and QC Inspector – Physical) do not configure the catalog. |
| BR-MDM05-004 | Inactive tests cannot be selected for new lab work; history is preserved. |
| BR-MDM05-005 | No hard delete. Deactivate / reactivate only. |
| BR-MDM05-006 | v1 is a flat list. Tests are not mapped to product or category in this story. |
| BR-MDM05-007 | This catalog is for **lab tests** only, not physical inspection checklists. |

---

## Data Dictionary

| Field | Type | Required | Remarks |
|---|---|---|---|
| Test Code | Text | Yes | Unique per tenant; stable identifier |
| Test Name | Text | Yes | What the lab and admins see (e.g. Moisture) |
| Description | Text | No | Optional notes for the tenant |
| Status | Active / Inactive | Yes | Default Active |

---

## Sub-tasks

| # | Sub-task | Description | Priority | Status |
|---|---|---|---|---|
| MDM-05-1 | Model + migration | Lab Test entity in master data (code, name, description, is_active); unique code per tenant | High | Not done |
| MDM-05-2 | Admin CRUD | List / add / change / deactivate-reactivate; search and status filter | High | Not done |
| MDM-05-3 | Portal + RBAC | Master Data → Lab Tests for Tenant Super Admin and Tenant Admin only; operational QC roles cannot write | High | Not done |
| MDM-05-4 | API | REST create, list, retrieve, update, status change; tenant-scoped | High | Not done |
| MDM-05-5 | Audit | Create / update / status-change events | Medium | Not done |
| MDM-05-6 | Bulk CSV | Import/export on the same pattern as Brand (optional if timeboxed) | Medium | Not done |
| MDM-05-7 | Tests | Unique code; inactive not selectable for new work; non-admin write denied; tenant isolation | High | Not done |

---

## API Endpoints

```
POST   /api/v1/lab-tests
GET    /api/v1/lab-tests?search=&status=&page=&per_page=
GET    /api/v1/lab-tests/{id}
PUT    /api/v1/lab-tests/{id}
PATCH  /api/v1/lab-tests/{id}/status
```

---

## Access & Permissions

| Action | Tenant Super Admin | Tenant Admin | QA Lab Technician | QC Inspector – Physical |
|---|---|---|---|---|
| View catalog (master screen) | Yes | Yes | No (this story) | No |
| Create / edit / deactivate | Yes | Yes | No | No |
| Run lab tests / upload reports | Out of scope | Out of scope | Out of scope | Out of scope |

QA Lab Technician **read** of active tests belongs with the later lab-execution story, not this setup story.

---

## Dependencies

| Dependency | Notes |
|---|---|
| Master Data admin + portal | Follow Brand / Product pattern (`apps/master_data`, Master Data nav) |
| RBAC | Tenant Super Admin / Tenant Admin already manage masters; add Lab Tests permissions the same way |
| QC-01 | Unchanged. Physical sample + Pass/Fail stay as they are. |
| Lab execution story | Not started. This catalog is the input that story will pick from. |

---

## Test Plan

- [ ] Tenant Admin creates Moisture (code unique) → appears in list as active
- [ ] Duplicate code in the same tenant is rejected
- [ ] Same code in another tenant is allowed
- [ ] Edit name/description; code stays stable
- [ ] Deactivate → still listed as inactive; not eligible for new work
- [ ] Reactivate → eligible again
- [ ] QA Lab Technician cannot create or edit
- [ ] QC Inspector – Physical cannot create or edit
- [ ] Gateman / other operational roles cannot create or edit
- [ ] Audit trail on create, edit, deactivate
- [ ] Tenant A cannot see Tenant B’s tests

---

## Out of Scope

- Lab sample receive, test start/end, ETA, report upload, To-Do / WIP / Completed
- QR / sample labelling
- Pass / Fail / Auto-Pass (stays on QC-01)
- Mapping tests to product or product category
- Physical QC checklist templates (look, smell, photos)
- Pass ranges, equipment, calibration, SLA per test
- Changing QC-01 sampling screens to use this catalog

---

## Definition of Done

- [ ] All acceptance criteria AC-0–AC-5 met
- [ ] Sub-tasks MDM-05-1 … MDM-05-5 and MDM-05-7 completed (MDM-05-6 if included in scope)
- [ ] Tenant Super Admin and Tenant Admin can maintain a tenant-specific lab test list
- [ ] Operational QC roles cannot configure the catalog
- [ ] Unit tests cover uniqueness, status, RBAC, and tenant isolation
- [ ] Story status updated for Phase 2 tracking

---

## Notes

- Suggested PRD delta (BA, later): replace “insert test names as text” with “select from tenant Lab Test master.”
- Do not fold this into Product (`requires_qc` stays a flag only).
- Do not treat this as QC Checklist / physical inspection master.
