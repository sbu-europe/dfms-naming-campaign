---
module: 07-quality
specification: Raw Materials Workflow — Section 14 — QC Checkpoint — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: QC-01
source_spec: ../../../../../05-modules/07-quality/qc-checkpoint-rm-inbound.md
last_updated: 2026-07-21
playwright_mcp: true
---

# Raw Materials Workflow — Section 14 — QC Inspector — Sample & Decision — E2E Scenario Plan

**Navigation:** **QC Checkpoint** → **My Queue** / **Samples** → Add · **Decisions** → Add

Scope: **QC Inspector (Physical)** (`qc_inspector_physical`) — RM inbound only (`apps/quality/checkpoint/admin.py`).

## Sample creation

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | QC Inspector views Flagged for QC queue | TO sub-state **Flagged for QC**. As **QC Inspector** (`qc.inspector.physical1.nourish@yopmail.com`), open **QC Checkpoint** queue. Assert TO listed. | P0 | Planned |
| TC02 | Create New Sample against flagged TO | **Samples → Add**, select TO from autocomplete (eligible `flagged_for_qc` TOs). Save. Sample linked; sub-state **Sampling Started**. | P0 | Planned |
| TC03 | Sample requires TO selection | Leave TO blank; save blocked with mandatory error. | P0 | Planned |
| TC04 | Sample QR code label generated | After save, sample detail shows QR code / label reference. | P1 | Planned |
| TC05 | QC Context panel displays TO metadata | On sample add form, **QC Context** panel shows Source/Destination POI, supplier/dealer refs, document refs from TO. | P0 | Planned |
| TC06 | Exception with media during sampling | Attach photo/media as exception on sample; save. Media persisted on sample record. | P1 | Planned |

## QC decision

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC07 | Add QC Decision from sample | **Decisions → Add**, select sample in **Sampling Started**. Form pre-populated with sample/TO context. | P0 | Planned |
| TC08 | QC Decision Pass | Select **Pass**; save. Decision **Pass**; TO sub-state **Waiting for Command Center** (unloading bay assignment may proceed). | P0 | Planned |
| TC09 | QC Decision Fail | Select **Fail**; save. Decision **Fail**; bay assignment blocked; business exception flagged. | P0 | Planned |
| TC10 | Decision mandatory | Leave decision blank; save blocked. | P0 | Planned |
| TC11 | QC Fail — no destination stock on unload | After Fail, attempt unloading (§16) and check stock. Unloading blocked; destination stock not increased. | P0 | Planned |
| TC12 | QC Pass + Unload Completed increases stock | Pass decision, complete bay assignment + unloading (§15–16). Destination stock increases by unloaded qty. | P0 | Planned |
| TC13 | RBAC — Unloading Personnel denied QC | Unloading role cannot access QC Checkpoint / Decisions add. | P0 | Planned |
| TC14 | Audit sample + decision events | Admin History / QC records show sample creation and Pass/Fail decision with user + timestamp. | P1 | Planned |

## Implementation Notes

### Key URLs

| Action | Path |
|--------|------|
| QC Samples | `/admin/quality/qccheckpointsample/` |
| QC Decisions | `/admin/quality/qccheckpointdecision/` |

### Prerequisites

- QC-enabled RM product on TO fixture; destination Scale-In completed (§13 TC02).

### Original ID map

| Legacy | TC |
|--------|-----|
| RM_127–RM_140 | TC01–TC14 |
