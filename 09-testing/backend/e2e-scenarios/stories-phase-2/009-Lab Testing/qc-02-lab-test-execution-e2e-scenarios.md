---
module: 06-poi-operations
specification: QC-02 QA Lab Technician — Receive Sample, Run Tests, File Results — Playwright E2E Scenario Plan
version: 1.1
phase: Phase 2
related_stories: QC-02, MDM-05, QC-01
source_spec: ../../../../../03-backlog/stories-phase-2/009-Lab Testing/QC-02-lab-test-execution.md
implementation_reference:
  - apps/quality/checkpoint/admin_queue.py (QC Queue / Add QC — QC-01; no lab request yet)
  - templates/admin/quality/checkpoint/qcqueue/
  - apps/quality/models.py (legacy LabTestRequest / LabTestResult — not the QC-02 flow)
  - apps/core/portal_navigation.py (QC Checkpoint → QC Queue only)
last_updated: 2026-09-14
playwright_mcp: true
---

# QC-02 — Lab Test Execution — E2E Scenario Plan (Django Admin SSR)

**Story:** [QC-02 — QA Lab Technician — Receive Sample, Run Tests, File Results](../../../../../03-backlog/stories-phase-2/009-Lab%20Testing/QC-02-lab-test-execution.md)

Target runner: **Playwright MCP** against seeded Nourish (`docs/guides/playwright-mcp-admin.md`).  
Credentials: `qc.inspector.physical1.nourish@yopmail.com`, `qa.lab.technician1.nourish@yopmail.com`, `admin.nourish@yopmail.com`, `superadmin.nourish@yopmail.com`.

Depends on **MDM-05** (active catalog tests) and **QC-01** (checkpoint sample on a flagged RM inbound TO).  
Sibling: [rm-qc-inspector-checkpoint-e2e-scenarios.md](../../raw-material-workflow/14-qc-checkpoint/rm-qc-inspector-checkpoint-e2e-scenarios.md).

**Out of scope:** Camera-only QR hardware; mobile lab app; REST lab APIs; creating/editing MDM-05 catalog (except asserting lab tech cannot); changing QC-01 Pass as the unloading gate; product-to-test mapping.

> **Code status (2026-09-14):** QC-02 lab request, QR, blind lab queue, and report upload are **not implemented**. QC-01 **QC Queue** (`/admin/quality/qcqueuetransportorder/`) and **Add QC** exist. Legacy `LabTestRequest` is a different model. Proposed lab URLs/labels are story-shaped; update when templates land.

## Seed prerequisites

| Item | Notes |
|------|--------|
| Inspector | **QC Inspector – Physical** at destination working site (`Working site` in profile) |
| Lab tech | **QA Lab Technician** assigned to the **same** QC site as the sample (and a second site user for TC10) |
| Tenant Admin / Super Admin | `admin.nourish@yopmail.com` / `superadmin.nourish@yopmail.com`. For lab write, select the sample’s QC site as **Working site**. Fail-closed if none selected. |
| Catalog | ≥2 **active** MDM-05 tests (e.g. Moisture, Protein) and ≥1 **inactive** test — see [mdm-05-lab-test-master-e2e-scenarios.md](./mdm-05-lab-test-master-e2e-scenarios.md) |
| Sample | RM inbound TO flagged for QC with at least one submitted QC-01 checkpoint sample (QC Queue TO detail **Samples** table). Wipe prefix `MCP-QC02-` |
| Yard control | Same TO must **not** auto-unlock Command Center from lab Complete |

## A — Inspector lab request + QR (AC-0, AC-1)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Inspector sends existing QC-01 sample to lab | As **QC Inspector – Physical**, open **QC Checkpoint → QC Queue** (`/admin/quality/qcqueuetransportorder/`), open the TO, locate a submitted sample. Click **Send to lab** / **Create lab request** (proposed). Assert one open request per sample; **sent at** / **sent by** recorded. Repeat send on the same sample is blocked. | P0 | Planned |
| TC02 | QR generated — view / download / print | After TC01, assert a **QR** for the sample / lab-request code. Inspector can **View**, **Download**, and **Print** it from the QC-01 TO/sample context. | P0 | Planned |
| TC03 | After send, lab queue shows To-Do | As **QA Lab Technician**, open proposed **Lab Queue**. Assert the sample **code** appears with status **To-Do** (sent, not opened). | P0 | Planned |
| TC04 | Inspector still sees TO context and lab status | As inspector, on QC Queue / TO detail, assert lab status **To-Do** (then later In progress / Completed) **with** TO number, vehicle, and usual QC-01 shipment fields. Blindness does not apply to the inspector. | P0 | Planned |

## B — Open sample (AC-2)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC05 | Technician opens by selecting the code | As lab technician, on **Lab Queue**, select the **code** from TC03. Assert first open stamps **received at** / **lab start** and **received by**; status **In progress**; receive time ≥ send time. | P0 | Planned |
| TC06 | Open via QR payload hits the same record | If admin exposes a **Scan / enter QR** field, paste the QR payload from TC02. Assert the **same** lab record as TC05 (no duplicate); times not reset. If only queue-select exists, skip with note. Physical camera scan is out of scope. | P1 | Planned |
| TC07 | Open rejected when not sent or unknown | As lab technician, attempt open with an unknown code/QR, and with a QC-01 sample that was never sent. Assert rejected; no lab start. | P0 | Planned |
| TC08 | Reopen In progress or Completed does not reset times | After TC05 (and again after Completed in TC15), reopen the same code. Assert the existing record; **received at** unchanged. | P0 | Planned |

## C — Blind lab queue (AC-3, AC-7)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC09 | Queue and detail show code + status + lab times only | As lab technician, on Lab Queue and sample detail, assert columns **code**, **status**, sent / received / completed as applicable. Assert **no** TO number, vehicle, product, supplier, origin, destination, or weights in `#content-main`. | P0 | Planned |
| TC10 | Site-scoped queue | As a lab technician assigned only to another POI, open Lab Queue. Assert they do **not** receive the TC03 sample code. Site is enforced; it is not shown as shipment context. | P0 | Planned |

## D — Attach tests and ETA (AC-4)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC11 | Attach active MDM-05 tests and ETA | After opening the sample, attach **two** active catalog tests. Enter **expected finish time** per test. Save. Assert both lines on the lab record (name + standard + UOM read-only from MDM-05). | P0 | Planned |
| TC12 | Inactive catalog test cannot be selected | On the attach picker, assert the inactive MDM-05 test is absent or rejected. | P0 | Planned |
| TC13 | Free-text test name rejected | Attempt to type a test name that is not on the catalog. Assert rejected; must pick an active MDM-05 test. | P0 | Planned |
| TC14 | Complete blocked until at least one test attached | With no tests attached, attempt complete. Assert blocked. | P0 | Planned |

## E — File result and complete (AC-5)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC15 | Partial file leaves In progress | Upload a **PDF or PNG/JPG report** and completion time for **one** of two attached tests. Assert status still **In progress**. | P0 | Planned |
| TC16 | All tests filed → Completed | File report + completion time for the remaining test. Assert status **Completed**. Inspector QC screen shows Completed (with TO context). | P0 | Planned |
| TC17 | Completion time before lab start rejected | On a test line, set completion time before **lab start**. Save. Assert rejected. | P0 | Planned |

## F — Yard isolation & RBAC (AC-0, AC-6)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC18 | Lab screens have no yard controls | As lab technician on the lab sample (including Completed), assert **no** Pass/Fail, unloading point, start/cancel unload, scale-out, gate-out, or accept-stock controls. | P0 | Planned |
| TC19 | Lab Complete does not unlock Command Center | After TC16 Completed, as **Command Center Officer**, assert the TO is still gated by physical **Add QC** / **Submit QC** Pass or Fail (not by lab Complete). A TO still **Pending** on **QC Queue** still blocks **Bay Assignments**. | P0 | Planned |
| TC20 | Lab technician cannot set up the catalog or record physical Pass/Fail | As lab technician, open **Master Data → Test Categories / Lab UOM / Lab Tests** add or change URLs, and **QC Checkpoint → Add QC** / **Submit QC**. Assert forbidden. Assert no Pass/Fail, **Bay Assignments**, unload start/stop, or stock accept on lab screens. | P0 | Planned |
| TC21 | Gate / Loading / Unloading unchanged by lab status | As **Gateman** / loading / unloading on the same TO, assert queues and actions match QC-01 / yard rules; lab status does not change eligibility. | P1 | Planned |

## G — Tenant isolation & audit (AC-7, AC-8)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC22 | Other tenant cannot use this queue or QR | If a second tenant session exists, assert they cannot see this Lab Queue row or redeem this QR. Otherwise skip with note. | P1 | Planned |
| TC23 | Audit lab request, open, attach, file | After the happy path, as Tenant Admin open **Audit Logs**. Assert events for lab request/QR, open (code vs QR if both), test attach, ETA change, report upload, completion — who, when, sample code, test. Lab Queue UI must still not show TO even if audit stores it internally. | P1 | Planned |

## H — Tenant Admin / Super Admin Lab Queue (AC-0, AC-7, BR-QC02-011)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC24 | Tenant Admin with Working site can run lab execution | As **Tenant Admin**, select the sample’s QC site as **Working site**. Open Lab Queue. Open a sent sample by code, attach an active catalog test + ETA, upload a report, and complete. Assert the same Lab Queue actions as QA Lab Technician. | P0 | Planned |
| TC25 | Tenant Super Admin with Working site can run lab execution | As **Tenant Super Admin**, select the sample’s QC site as **Working site**. Repeat the Lab Queue open / attach / file path from TC24. Assert success. | P0 | Planned |
| TC26 | No Working site blocks lab write | As Tenant Admin (and Super Admin), clear or leave **Working site** unselected. Open Lab Queue or attempt lab write. Assert blocked until a site is selected. | P0 | Planned |
| TC27 | Admin Lab Queue is still code-only | During TC24, on Lab Queue and sample detail assert **no** TO number, vehicle, product, supplier, origin, destination, or weights in `#content-main`. Admin may still see those fields on **QC Queue**. | P0 | Planned |
| TC28 | Admin Lab Queue is site-scoped to Working site | As Tenant Admin with Working site B (not the sample’s QC site), open Lab Queue. Assert they do **not** receive the TC03 sample code. | P1 | Planned |

## Implementation Notes (Playwright + Django Admin SSR)

- Admin SSR only. Do not assert REST serializers except as a follow-up; story requires lab-tech APIs omit shipment fields — Playwright MCP stays on HTML.
- **QR scan:** P0 path is **select code** on Lab Queue. Treat camera scan as out of scope; optional paste-payload is TC06.
- Role fixtures: inspector vs lab tech must be distinct users. Lab tech needs a POI assignment at the sample’s QC site. Tenant Admin / Super Admin lab write uses **Working site** (same fail-closed pattern as QC Queue).
- Proposed URLs (confirm after `get_urls()`): inspector action on `/admin/quality/qcqueuetransportorder/<uuid>/change/`; lab queue e.g. `/admin/quality/labqueue/`; QR download on the lab request.
- Selectors: `#content-main`, `#result_list`, `.messagelist`. Blindness assertions are **absence** of TO/vehicle/product text on lab pages.
- **Known drift:** No lab request button on QC Queue templates. Legacy `quality.LabTestRequest` is QCEvent-linked, not QC-01 checkpoint samples. Do not test that model as QC-02.
- Yard gate: `qc_passed` / Command Center eligibility stay QC-01 (`rm-qc-inspector-checkpoint` TC15–TC17).
- Suggested next step: ship MDM-05 then QC-02 admin; refresh labels from templates; run after a QC-01 sample exists.
