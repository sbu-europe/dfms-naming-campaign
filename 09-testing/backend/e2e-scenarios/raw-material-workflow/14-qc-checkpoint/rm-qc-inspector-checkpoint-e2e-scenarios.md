---
module: 06-poi-operations
specification: Raw Materials Workflow — Section 14 — QC Checkpoint (v3) — Playwright E2E Scenario Plan
version: 2.1
phase: Phase 1
related_stories: QC-01, FB-013
source_spec: ../../../../../05-modules/06-poi-operations/qc-operations-v2.md
last_updated: 2026-08-17
playwright_mcp: true
last_mcp_run: 2026-08-17
last_mcp_verdict: 15/27 Pass · 12 Planned
artifacts: tests/e2e/playwright-mcp/rm-12-17-dest-yard-artifacts/
---

# Raw Materials Workflow — Section 14 — QC Inspector — QC Queue & Add QC — E2E Scenario Plan


**Last MCP run:** 2026-08-17 · **15/27 Pass · 12 Planned** · `RUN_ID=C4E217A8`  
**Chain:** `PS-PORT-20260817-0003` → `TR-PORT-20260817-0004` → `TO-20260817-0004` → **Closed**  
**Artifacts:** [`tests/e2e/playwright-mcp/rm-12-17-dest-yard-artifacts/RESULTS.md`](../../../../../tests/e2e/playwright-mcp/rm-12-17-dest-yard-artifacts/RESULTS.md)  
**Navigation:** Operations / Quality → **QC Queue** (`/admin/quality/qcqueuetransportorder/`)

Scope: **QC Inspector (Physical)** (`qc_inspector_physical`) — RM inbound only.  
**Code:** `apps/quality/checkpoint/admin_queue.py` + `templates/admin/quality/checkpoint/qcqueue/` (v3).  
**Spec:** `05-modules/06-poi-operations/qc-operations-v2.md` (v3.1+ draft save).

Target runner: **Playwright MCP** against seeded Nourish tenant (`docs/guides/playwright-mcp-admin.md`).  
Credentials: `qc.inspector.physical1.nourish@yopmail.com` (`docs/testing/playwright-mcp-credentials.yaml`).

**Out of scope for this plan:** Legacy **Samples** / **Decisions** nav entries (removed from portal); QR labels; mobile QC app; API-only clients (covered separately if needed).

## QC Queue changelist

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | QC Inspector opens TO-centric QC Queue | After destination Scale-In on a QC-enabled RM TO (sub-state **Flagged for QC**), as **QC Inspector**, open **QC Queue**. Assert TO listed with columns TO Number, Vehicle, Product, Sub-state, QC Outcome (**Pending**), Samples count, Actions. | P0 | Pass |
| TC02 | Queue shows post-decision TOs | After a prior Pass/Fail (or fixture), assert TOs in **QC Passed** / **QC Failed** / **Waiting for Command Center** remain visible on QC Queue (display queryset). | P1 | Pass |
| TC03 | TO detail is read-only (not full TO edit) | From changelist, open TO Number link → `/admin/quality/qcqueuetransportorder/<uuid>/change/`. Assert page shows **Transport order** details + **Samples** table only; no TransportOrder field editor / Save. | P0 | Pass |

## Add QC — happy paths

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC04 | Add QC — all samples Pass → TO Pass | Click **Add QC** (toolbar or row). Select eligible TO. Assert TO details panel loads. On sample row 1: enter Physical analysis, Sample side (Top/Middle/Bottom), Decision **Pass**. Optionally Moisture %. Click **Submit QC**. Assert success; TO QC Outcome **Pass**; sub-state **QC Passed** (then waiting for CC as yard chain advances). | P0 | Pass |
| TC05 | Add QC — multi-sample; any Fail → TO Fail | Add QC with ≥2 samples (use **Add another sample**). Set one Pass and one Fail with Failed qty. **Submit QC**. Assert TO Fail; `qc_failed_quantity` set from failing sample; sub-state **QC Failed**. | P0 | Planned |
| TC06 | Add QC — optional photo upload | On a sample row, upload JPG/PNG via Photo; complete required fields; **Submit QC**. Open TO detail; assert sample Photo **View** link present. | P1 | Planned |
| TC07 | Auto-pass TO | On Add QC (or row **Auto-pass**), submit Auto-pass for eligible TO. Assert audit sample created and TO Pass without requiring sample side/photo. | P0 | Planned |

## Add QC — Save Draft

Buttons on Add QC: `[Cancel] [Save Draft] [Submit QC]` (+ **QC Auto-pass** when a TO is selected).

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC20 | Save Draft — partial sample then resume | Select eligible TO. Fill partial row (e.g. Physical analysis + Sample side only; leave Decision blank). Click **Save Draft**. Assert success message. Leave Add QC (Cancel / Queue). Re-open **Add QC** with same TO (`?transport_order=<uuid>` or select TO). Assert **Draft restored** banner; formset shows previously entered values. | P0 | Pass |
| TC21 | Save Draft does not finalize QC | After TC20-style draft save, return to **QC Queue**. Assert TO QC Outcome still **Pending**; sub-state still active QC (`Flagged for QC` / `Sampling Started` / `Resampling`); TO detail **Samples** table has **no** new checkpoint sample rows from the draft; Add QC / Auto-pass still available. | P0 | Pass |
| TC22 | Save Draft → complete → Submit QC | Save Draft with partial data. Resume draft. Complete required fields (side, decision Pass). Click **Submit QC**. Assert TO Pass; sample(s) appear on TO detail. Re-open Add QC for the same TO is **not** eligible (active decision). | P0 | Pass |
| TC23 | Save Draft — photo retained on resume / submit | Upload JPG/PNG on a draft row; **Save Draft**. Resume Add QC; assert **Current draft photo** link (or equivalent) for that row. Complete required fields **without** re-uploading; **Submit QC**. Assert sample Photo **View** on TO detail. | P1 | Planned |
| TC24 | Save Draft requires transport order | Open Add QC; leave TO empty; click **Save Draft**. Assert blocked (TO required); no draft persisted. | P0 | Pass |
| TC25 | Soft validation on Save Draft | Select TO; leave Sample side / Decision blank; click **Save Draft**. Assert save succeeds (no submit-required field errors). Same blank fields + **Submit QC** still fail validation (see TC09). | P0 | Pass |
| TC26 | Auto-pass clears draft | Save Draft for a TO. On Add QC for that TO, click **QC Auto-pass**. Assert TO Pass. Start a new QC cycle only after Resample (or use another TO): assert prior draft is **not** restored for that TO after Pass. | P1 | Planned |
| TC27 | Resample / Reinspect clears prior draft | Save Draft on an eligible TO, then complete **Submit QC** Pass (or Fail). Trigger **Resample** (or **Reinspect**). On redirected Add QC, assert **no** Draft restored banner / no stale draft fields from the previous cycle; form is empty for the new cycle. | P1 | Planned |

## Add QC — validation & UX

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC08 | Transport order required | Open Add QC with no TO selected; **Submit QC**. Assert blocked (TO required / not eligible). | P0 | Pass |
| TC09 | Sample side and decision required on Submit | Select TO; leave Sample side and/or Decision blank; **Submit QC**. Assert validation errors; TO not decided. (Contrast TC25: **Save Draft** allows blanks.) | P0 | Pass |
| TC10 | Failed qty required when any Fail | Set Decision **Fail** without Failed qty; **Submit QC**. Assert error requiring expected failed quantity. | P0 | Pass |
| TC11 | Add / remove sample rows | Click **Add another sample**; assert second row appears with reindexed fields. Click **Remove** on row 2; assert one row remains. On sole row, Remove clears fields (does not delete last row). | P1 | Planned |
| TC12 | Reject non-image photo | Attempt upload of `.pdf` (or non jpg/jpeg/png). Assert validation rejects photo. | P1 | Planned |

## Resample & reinspect

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC13 | Resample after Pass (pre-unload) | TO with active Pass, no bay (or waiting CC). Row **Resample** → confirm. Assert redirect to Add QC with TO pre-selected + Resample banner; prior Pass superseded; new Add QC can Pass/Fail (no stale draft — TC27). | P0 | Planned |
| TC14 | Reinspect after Fail | TO with active Fail, no active bay. Row **Reinspect** → remarks required → confirm. Assert redirect to Add QC with Reinspect banner; new decision can be recorded (no stale draft — TC27). | P0 | Planned |

## Cross-module & RBAC

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC15 | Pending QC blocks destination bay assignment | TO still **Flagged for QC** / **Sampling Started** / no decision (`qc_passed` null), including TO with **Save Draft** only (TC21). As CC Officer, assert TO not eligible for unloading bay assignment (§15). | P0 | Planned |
| TC16 | After Pass, CC bay assignment can proceed | Complete TC04 Pass path. As CC Officer, assert TO available for destination bay assignment (§15 TC01–TC02). | P0 | Pass |
| TC17 | After Fail with failed qty, CC assign allowed (FB-013) | Complete TC05 Fail path. As CC Officer, assert bay assignment **is allowed** (pending QC still blocks; Fail does not). | P0 | Planned |
| TC18 | RBAC — Unloading Personnel denied QC Queue / Add QC | As unloading role, open `/admin/quality/qcqueuetransportorder/` and `/add-qc/`. Assert forbidden / no write actions. | P0 | Pass |
| TC19 | Audit: samples + decision on TO detail | After Pass or Fail, open TO detail. Assert sample rows show side, decision badges, sampled at; QC Outcome matches rollup. | P1 | Pass |

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
- Draft persist uses `QCCheckpointDraft` / `QCCheckpointDraftPhoto` (tenant migration `quality.0006_qc_checkpoint_draft`).

### Code / product drift (vs legacy §14 v1.0)

| Legacy assumption | Implemented (v3) |
|-------------------|------------------|
| Separate Samples → Add + Decisions → Add | Single **Add QC** formset + rollup |
| Fail blocks CC bay assignment | **FB-013:** Fail with `qc_failed_quantity` allows CC assign; only **pending** QC blocks |
| QR sample label | Deferred / out of scope |
| Exception media as separate flow | Optional per-sample **photo** on Add QC |
| Submit-only Add QC | **Save Draft** + **Submit QC** (draft is not an official sample/decision) |

### Original ID map

| Legacy | TC (v2.1) | Notes |
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
| — | TC20–TC27 | Save Draft / resume / soft validation / draft clear on submit·auto-pass·resample·reinspect |

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-08-17 | **15/27 Pass** | Playwright MCP; see `tests/e2e/playwright-mcp/rm-12-17-dest-yard-artifacts/RESULTS.md`. Happy-path chain on MCP sandbox. |
