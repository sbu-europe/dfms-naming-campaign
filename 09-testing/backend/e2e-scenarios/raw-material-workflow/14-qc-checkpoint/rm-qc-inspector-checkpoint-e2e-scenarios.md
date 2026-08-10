---
module: 06-poi-operations
specification: Raw Materials Workflow — Section 14 — QC Checkpoint (v3) — Playwright E2E Scenario Plan
version: 2.0
phase: Phase 1
related_stories: QC-01, FB-013
source_spec: ../../../../../05-modules/06-poi-operations/qc-operations-v2.md
last_updated: 2026-08-10
playwright_mcp: true
---

# Raw Materials Workflow — Section 14 — QC Inspector — QC Queue & Add QC — E2E Scenario Plan

**Navigation:** Operations / Quality → **QC Queue** (`/admin/quality/qcqueuetransportorder/`)

Scope: **QC Inspector (Physical)** (`qc_inspector_physical`) — RM inbound only.  
**Code:** `apps/quality/checkpoint/admin_queue.py` + `templates/admin/quality/checkpoint/qcqueue/` (v3).  
**Spec:** `05-modules/06-poi-operations/qc-operations-v2.md` (v3.1).

Target runner: **Playwright MCP** against seeded Nourish tenant (`docs/guides/playwright-mcp-admin.md`).  
Credentials: `qc.inspector.physical1.nourish@yopmail.com` (`docs/testing/playwright-mcp-credentials.yaml`).

**Out of scope for this plan:** Legacy **Samples** / **Decisions** nav entries (removed from portal); QR labels; mobile QC app; API-only clients (covered separately if needed).

## QC Queue changelist

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | QC Inspector opens TO-centric QC Queue | After destination Scale-In on a QC-enabled RM TO (sub-state **Flagged for QC**), as **QC Inspector**, open **QC Queue**. Assert TO listed with columns TO Number, Vehicle, Product, Sub-state, QC Outcome (**Pending**), Samples count, Actions. | P0 | Planned |
| TC02 | Queue shows post-decision TOs | After a prior Pass/Fail (or fixture), assert TOs in **QC Passed** / **QC Failed** / **Waiting for Command Center** remain visible on QC Queue (display queryset). | P1 | Planned |
| TC03 | TO detail is read-only (not full TO edit) | From changelist, open TO Number link → `/admin/quality/qcqueuetransportorder/<uuid>/change/`. Assert page shows **Transport order** details + **Samples** table only; no TransportOrder field editor / Save. | P0 | Planned |

## Add QC — happy paths

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC04 | Add QC — all samples Pass → TO Pass | Click **Add QC** (toolbar or row). Select eligible TO. Assert TO details panel loads. On sample row 1: enter Physical analysis, Sample side (Top/Middle/Bottom), Decision **Pass**. Optionally Moisture %. Submit QC. Assert success; TO QC Outcome **Pass**; sub-state **QC Passed** (then waiting for CC as yard chain advances). | P0 | Planned |
| TC05 | Add QC — multi-sample; any Fail → TO Fail | Add QC with ≥2 samples (use **Add another sample**). Set one Pass and one Fail with Failed qty. Submit. Assert TO Fail; `qc_failed_quantity` set from failing sample; sub-state **QC Failed**. | P0 | Planned |
| TC06 | Add QC — optional photo upload | On a sample row, upload JPG/PNG via Photo; complete required fields; Submit. Open TO detail; assert sample Photo **View** link present. | P1 | Planned |
| TC07 | Auto-pass TO | On Add QC (or row **Auto-pass**), submit Auto-pass for eligible TO. Assert audit sample created and TO Pass without requiring sample side/photo. | P0 | Planned |

## Add QC — validation & UX

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC08 | Transport order required | Open Add QC with no TO selected; Submit QC. Assert blocked (TO required / not eligible). | P0 | Planned |
| TC09 | Sample side and decision required | Select TO; leave Sample side and/or Decision blank; Submit. Assert validation errors; TO not decided. | P0 | Planned |
| TC10 | Failed qty required when any Fail | Set Decision **Fail** without Failed qty; Submit. Assert error requiring expected failed quantity. | P0 | Planned |
| TC11 | Add / remove sample rows | Click **Add another sample**; assert second row appears with reindexed fields. Click **Remove** on row 2; assert one row remains. On sole row, Remove clears fields (does not delete last row). | P1 | Planned |
| TC12 | Reject non-image photo | Attempt upload of `.pdf` (or non jpg/jpeg/png). Assert validation rejects photo. | P1 | Planned |

## Resample & reinspect

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC13 | Resample after Pass (pre-unload) | TO with active Pass, no bay (or waiting CC). Row **Resample** → confirm. Assert redirect to Add QC with TO pre-selected + Resample banner; prior Pass superseded; new Add QC can Pass/Fail. | P0 | Planned |
| TC14 | Reinspect after Fail | TO with active Fail, no active bay. Row **Reinspect** → remarks required → confirm. Assert redirect to Add QC with Reinspect banner; new decision can be recorded. | P0 | Planned |

## Cross-module & RBAC

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC15 | Pending QC blocks destination bay assignment | TO still **Flagged for QC** / **Sampling Started** / no decision (`qc_passed` null). As CC Officer, assert TO not eligible for unloading bay assignment (§15). | P0 | Planned |
| TC16 | After Pass, CC bay assignment can proceed | Complete TC04 Pass path. As CC Officer, assert TO available for destination bay assignment (§15 TC01–TC02). | P0 | Planned |
| TC17 | After Fail with failed qty, CC assign allowed (FB-013) | Complete TC05 Fail path. As CC Officer, assert bay assignment **is allowed** (pending QC still blocks; Fail does not). | P0 | Planned |
| TC18 | RBAC — Unloading Personnel denied QC Queue / Add QC | As unloading role, open `/admin/quality/qcqueuetransportorder/` and `/add-qc/`. Assert forbidden / no write actions. | P0 | Planned |
| TC19 | Audit: samples + decision on TO detail | After Pass or Fail, open TO detail. Assert sample rows show side, decision badges, sampled at; QC Outcome matches rollup. | P1 | Planned |

## Implementation Notes

### Key URLs

| Action | Path |
|--------|------|
| QC Queue | `/admin/quality/qcqueuetransportorder/` |
| Add QC | `/admin/quality/qcqueuetransportorder/add-qc/` |
| TO detail | `/admin/quality/qcqueuetransportorder/<uuid>/change/` |
| Resample | `/admin/quality/qcqueuetransportorder/resample/<uuid>/` |
| Reinspect | `/admin/quality/qcqueuetransportorder/reinspect/<uuid>/` |
| Auto-pass | `/admin/quality/qcqueuetransportorder/auto-pass/<uuid>/` |

Legacy admin URLs (`/admin/quality/qccheckpointsample/`, `…/qccheckpointdecision/`) may still resolve but are **not** portal nav entry points for v3 MCP runs.

### Prerequisites

- QC-enabled RM product on TO; destination Scale-In completed (§13) → **Flagged for QC**.
- Working POI / yard scope matches destination for QC Inspector seed user.
- After static/JS edits in Docker local: `collectstatic` (or restart `make local`) so Add QC scripts load.

### Code / product drift (vs legacy §14 v1.0)

| Legacy assumption | Implemented (v3) |
|-------------------|------------------|
| Separate Samples → Add + Decisions → Add | Single **Add QC** formset + rollup |
| Fail blocks CC bay assignment | **FB-013:** Fail with `qc_failed_quantity` allows CC assign; only **pending** QC blocks |
| QR sample label | Deferred / out of scope |
| Exception media as separate flow | Optional per-sample **photo** on Add QC |

### Original ID map

| Legacy | TC (v2.0) | Notes |
|--------|-----------|--------|
| RM_127 | TC01 | Queue list (TO-centric) |
| RM_128–RM_129 | TC04, TC08 | Sample create → Add QC Pass / TO required |
| RM_130 | — | QR deferred |
| RM_131 | TC03 / TC04 | Context → TO details panel |
| RM_132 | TC06 | Media → optional photo |
| RM_133–RM_136 | TC04, TC05, TC09–TC10 | Decision flows → Add QC rollup |
| RM_137–RM_138 | TC16 + §16 | Pass + unload stock (cross-section) |
| RM_139 | TC18 | RBAC |
| RM_140 | TC19 | Audit |
| — | TC07, TC11–TC14, TC17 | New v3 (auto-pass, formset UX, resample/reinspect, FB-013 Fail+CC) |
