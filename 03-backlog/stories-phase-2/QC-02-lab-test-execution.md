---
jira_key: ~
jira_type: Story
jira_sprint: ~
story_id: QC-02
title: QA Lab Technician — Receive Sample, Run Tests, File Results
epic: QC Lab Execution
status: Pending
story_points: 13
assignee: ~
prd_refs:
  - "DFMS_Product_Requirements_Document_v3.md §6.19 Lab Test Request / Sample Labeling (QR) / Lab Estimated Completion / Lab Report Upload / Lab Status Monitoring"
  - "DFMS_Product_Requirements_Document_v3.md §4 QA Lab Technician"
phase: Phase 2
related_stories:
  - MDM-05 — Lab Test master (catalog the technician picks from)
  - QC-01 — Physical sampling and Pass/Fail (creates the sample; remains the yard quality gate)
---

# QC-02 — QA Lab Technician — Receive Sample, Run Tests, File Results

## User Story

**As a** QC Inspector – Physical  
**I want to** create a lab request (send a sample to the lab) and get a **QR code** I can attach to the physical sample  
**So that** the bag is labeled and the lab can identify it without asking me which truck it came from.

**As a** QA Lab Technician  
**I want a** lab queue of sample codes, and to open a sample either by **scanning the QR** or by **selecting the code**, then attach the tests that sample needs  
**So that** I work a standard lab process: code in, tests on, report out — with **no** visibility of the transport order or other yard details.

---

## Business Context

QC-01 already lets physical QC take a sample and record **Pass / Fail**. That decision still unlocks unloading. MDM-05 lets the tenant define **which tests exist**.

The inspector owns the shipment. The lab owns the sample. When the inspector **creates a lab request / sends the sample**, the system generates a **QR** (encoding the sample / lab-request code) to print or stick on the bag.

The lab technician never sees the truck, TO, product, supplier, or route. They see **sample codes** and status. They open a row by scanning the QR on the bag **or** by picking that code from the queue, then attach the MDM-05 tests needed, give ETAs, and file reports.

The lab technician does **not** assign a bay, start unloading, accept stock, or record Pass/Fail.

---

## Locked decisions (PO)

| Topic | Decision |
|---|---|
| Sample source | Lab request is created from a **QC-01 checkpoint sample** (raw-material inbound). |
| Lab request | **QC Inspector – Physical** creates the lab request / sends the sample. That stamps **send time** and generates a **QR** for the physical sample. |
| QR | QR encodes the **sample / lab-request code**. Inspector can download or print it to attach to the bag. |
| How the lab opens a sample | **Scan the QR** **or** **select the code** from the lab queue. Either way they attach tests to that sample. First open stamps **lab start** (receive time). |
| Lab visibility | **Blind.** QA Lab Technician must **not** see TO, vehicle, product, supplier, origin, destination, or other yard/shipment fields — UI **and** API. |
| Test names | Pick from **active MDM-05** tests. No typing a new test name. No product-to-test mapping (same lock as MDM-05). |
| Queue status | **To-Do** = sent, not opened in lab. **In progress** = opened (QR or code), not all selected tests filed. **Completed** = every selected test has a report and completion time. |
| Yard gate | **Unchanged.** Lab Complete does **not** unlock unloading. QC-01 Pass/Fail still does. |
| Site | Lab technician is still **local** (only codes for samples at their site). Site is enforced in the backend; it is **not** shown as shipment context. |

---

## Acceptance Criteria

### AC-0 — Who does what

- [ ] **QC Inspector – Physical** can create a **lab request** / send a QC-01 sample (one open request per sample).
- [ ] **QA Lab Technician** can open a sample (QR or code), attach tests, enter ETA, upload reports, and complete tests — at their site only.
- [ ] QA Lab Technician **cannot** create/edit MDM-05 tests, record QC-01 Pass/Fail, assign an unloading point, start/stop unloading, or change stock.
- [ ] Command Center / Loading / Unloading / Gate behaviour is unchanged by lab status.

### AC-1 — Lab request + QR (inspector)

- [ ] Inspector can create a lab request only for a sample that already exists on a flagged RM inbound TO (QC-01).
- [ ] Creating the request records **sent at** and **sent by**.
- [ ] The system **generates a QR** for that sample / lab-request code. The inspector can **view, download, and print** it to attach to the physical sample.
- [ ] After send, the sample code appears on the lab queue as **To-Do**.
- [ ] Inspector can still see lab status (To-Do / In progress / Completed) **with** their usual QC-01 shipment context (TO, vehicle, and so on). Blindness applies to the **lab technician**, not the inspector.

### AC-2 — Open sample (QR or code)

- [ ] Technician opens a sample by **scanning the QR** **or** by **selecting the code** from the queue.
- [ ] Either action attaches subsequent tests to **that** sample / lab request.
- [ ] First open records **received at** / **lab start** and **received by**. That time is the official start.
- [ ] Open is rejected if the sample was not sent, or if the code/QR is unknown.
- [ ] Opening an already In-progress or Completed sample shows that record (does not reset times).
- [ ] On first open, status becomes **In progress**.
- [ ] Send time and receive time are kept for handover traceability. The technician may see those times against the **code**, not against a TO.

### AC-3 — Lab queue (code only)

- [ ] Technician sees a queue of **sample / lab-request codes** for their site, filterable by status (To-Do, In progress, Completed).
- [ ] Each row shows **code**, **status**, and lab timestamps (sent / received / completed as applicable).
- [ ] Queue and detail **must not** show TO number, vehicle, product, supplier, origin, destination, weights, or other shipment fields.
- [ ] Lab APIs used by this role **must not** return those fields either.

### AC-4 — Attach tests and ETA

- [ ] After opening a sample (QR or selected code), the technician attaches **one or more** tests from the tenant’s **active** MDM-05 list.
- [ ] Inactive MDM-05 tests cannot be selected.
- [ ] For each attached test they enter an **expected finish time**.
- [ ] They cannot invent a test name that is not on the catalog.
- [ ] Completing the lab sample is blocked until **at least one** test is attached.

### AC-5 — File result and complete

- [ ] For each attached test the technician uploads a **report** (PDF or PNG/JPG) and records **test completion time**.
- [ ] Completion time cannot be before lab start for that sample.
- [ ] When **every** attached test has a report and completion time, status becomes **Completed**.
- [ ] Partial filing leaves status **In progress**.

### AC-6 — What lab does not do

- [ ] Lab screens have **no** control to Pass/Fail the TO, assign a loading/unloading point, start or cancel unload, scale-out, gate-out, or accept stock.
- [ ] A Completed lab sample does **not** by itself mark the TO QC-passed or unblock Command Center.

### AC-7 — Site and tenant

- [ ] Technician only receives codes for samples whose QC site is a POI they are assigned to (enforced; site is not presented as shipment context).
- [ ] Tenant A cannot see Tenant B’s lab queue, QR payload for another tenant, or reports.

### AC-8 — Audit

- [ ] Lab request/QR generate, open (QR vs code), test attach, ETA change, report upload, and completion are audit-logged (who, when, sample code, test). Audit stored against the lab record may include TO internally for the inspector/admin trail; the **lab technician UI/API must still not expose TO**.

---

## Functional Flows

### Flow A — Happy path

```
QC Inspector (QC-01) has created a sample
  → Inspector creates lab request / send to lab
  → QR generated for the sample code; inspector prints and attaches it to the bag
  → Lab queue: To-Do (code only)
  → Technician scans the QR  OR  selects that code in the queue
  → Lab start stamped  → In progress
  → Technician attaches Moisture + Protein from MDM-05, enters ETA for each
  → Uploads report + completion time per test
  → All tests filed  → Completed
  → Inspector sees Completed on the TO (their QC screen, not the lab queue)
  → Command Center assigns bay only after QC-01 Pass (unchanged)
```

### Flow B — Queue without shipment context

```
Lab technician opens the queue
  → Sees codes and status only
  → Does not see TO, vehicle, or product
  → Selects a code → same test-attach screen as a QR scan
```

### Flow C — Lab cannot run the yard

```
Lab technician on a Completed sample
  → No Pass/Fail, no unloading point, no unload start
  → Attempt via API is denied
```

### Flow D — Catalog only

```
Technician tries to type "Aflatoxin" instead of picking the catalog
  → Rejected; must select an active MDM-05 test
```

---

## Business Rules

| ID | Rule |
|---|---|
| BR-QC02-001 | Lab work is attached to a QC-01 sample via a **lab request** created by the physical inspector. |
| BR-QC02-002 | Creating the lab request generates a **QR** for the sample code, to attach to the physical sample. |
| BR-QC02-003 | Lab opens the sample by **QR scan** or by **selecting the code**. First open is official lab start. |
| BR-QC02-004 | QA Lab Technician has **no** visibility of TO or other shipment/yard fields (UI and API). |
| BR-QC02-005 | Queue: To-Do (sent, not opened) → In progress (opened) → Completed (all attached tests filed). |
| BR-QC02-006 | Test names come from active MDM-05 only. |
| BR-QC02-007 | At least one test must be attached before the sample can be Completed. |
| BR-QC02-008 | QA Lab Technician does not Pass/Fail, assign a bay, unload, or accept stock. |
| BR-QC02-009 | Lab Complete does not replace QC-01 Pass as the unloading / stock gate. |
| BR-QC02-010 | Lab technician is site-local (backend). Completion time per test must not precede lab start. |

---

## Sub-tasks

| # | Sub-task | Description | Priority | Status |
|---|---|---|---|---|
| QC-02-1 | Lab request + QR | Inspector create lab request / send; send time; generate QR for sample code (view/download/print) | High | Not done |
| QC-02-2 | Open sample | Scan QR **or** select code from queue; first open = lab start; To-Do → In progress | High | Not done |
| QC-02-3 | Blind queue | Site-scoped list of **codes + status + lab times only**; no TO/vehicle/product in UI or lab-tech API | High | Not done |
| QC-02-4 | Attach tests + ETA | Select active MDM-05 tests on the opened sample; expected finish per test | High | Not done |
| QC-02-5 | Report + complete | Upload PDF/PNG per test; completion time; Completed when all tests filed | High | Not done |
| QC-02-6 | RBAC + guards | Lab write for QA Lab Technician; deny Pass/Fail, LUP, unload, stock, and TO fields; inspector send + QR + view status | High | Not done |
| QC-02-7 | Audit | Lab request/QR, open, attach, file — sample code on lab-tech events | Medium | Not done |
| QC-02-8 | Tests | QR on send; scan vs select-code; blind serializer; status machine; catalog-only tests; yard denied | High | Not done |

---

## API Endpoints

```
POST   /api/v1/qc/samples/{sample_id}/lab-requests     # inspector: send + QR
GET    /api/v1/qc/samples/{sample_id}/lab-requests/{id}/qr
POST   /api/v1/qc/lab/open                             # technician: QR payload or sample code
GET    /api/v1/qc/lab/queue?status=&page=              # codes + status only
GET    /api/v1/qc/lab/{lab_record_id}                  # no TO / vehicle / product
POST   /api/v1/qc/lab/{lab_record_id}/tests            # attach MDM-05 tests + ETA
POST   /api/v1/qc/lab/{lab_record_id}/tests/{test_line_id}/result
```

Exact paths may follow existing QC-01 style; behaviour above is what matters. Lab-technician responses **must omit** shipment fields.

---

## Access & Permissions

| Action | QA Lab Technician | QC Inspector – Physical | Tenant Admin | Command Center |
|---|---|---|---|---|
| Create lab request + QR | No | Yes | No (unless also working as inspector) | No |
| See TO / vehicle / product on the lab sample | **No** | Yes (QC-01 screens) | Yes (admin) | Yes (their TO views) |
| Open by QR or select code; attach tests; file report | Yes (own site) | No | No | No |
| View lab status | Yes (code + status only) | Yes (with QC-01 context) | Yes | View-only on TO if already allowed |
| MDM-05 create/edit | No | No | Yes (MDM-05) | No |
| QC-01 Pass/Fail | No | Yes (QC-01) | No | No |
| Assign unloading point | No | No | No | Yes (CC-01, after QC-01 Pass) |

---

## Dependencies

| Dependency | Notes |
|---|---|
| MDM-05 | Must exist so the technician can attach active tests. Ship MDM-05 before QC-02-4. |
| QC-01 samples | Lab request is only valid on an existing checkpoint sample. |
| QA Lab Technician role | Already seeded; needs lab queue permissions and a serializer that strips shipment fields. |
| QC Inspector – Physical | Already creates samples; add lab request + QR. |

---

## Test Plan

- [ ] Inspector creates lab request → To-Do; QR available for that sample code
- [ ] Technician opens via QR → In progress; receive time ≥ send time
- [ ] Technician opens via selecting the same code → same lab record (no duplicate)
- [ ] Open without a lab request is rejected; unknown QR/code is rejected
- [ ] Lab queue and lab-tech GET payload contain **code and status**, not TO, vehicle, or product
- [ ] Pick two active MDM-05 tests + ETA; inactive test rejected; free-text name rejected
- [ ] Upload one report → still In progress; upload both + completion times → Completed
- [ ] Completion time before lab start rejected
- [ ] Technician cannot Pass/Fail or assign LUP
- [ ] Completed lab does not set `qc_passed` or unblock CC
- [ ] Technician at site A does not receive site B codes
- [ ] Other tenant cannot see this queue or redeem this QR

---

## Out of Scope

- Creating or editing the Lab Test catalog (MDM-05)
- Mapping tests to product / category (would leak product into the lab if done naively)
- Changing QC-01 so Pass **requires** lab Complete
- Auto-Pass
- Physical inspection checklist (look, smell, photos) — stays QC-01
- Bay assignment, unloading, scale-out, gate-out, stock update
- Push notifications that QC is waiting (PRD Phase 3)

---

## Definition of Done

- [ ] All acceptance criteria AC-0–AC-8 met
- [ ] Sub-tasks QC-02-1 … QC-02-6 and QC-02-8 completed (QC-02-7 if included)
- [ ] Inspector lab request generates a QR for the physical sample
- [ ] Lab technician opens by QR **or** by selecting the code, attaches catalog tests, files reports
- [ ] Lab technician UI/API expose **no** TO or shipment context
- [ ] Yard Pass/Fail and unloading remain QC-01 / CC-01
- [ ] Unit tests cover QR/code open, blind payload, status machine, catalog-only tests, and denied yard actions
- [ ] Story status updated for Phase 2 tracking

---

## Notes

- Suggested PRD delta (BA): lab test name is selected from tenant Lab Test master, not typed; lab role is sample-code-blind to the TO.
- If PO later wants **no QC-01 Pass until lab Completed**, that is a separate change to the yard gate — not this story.
