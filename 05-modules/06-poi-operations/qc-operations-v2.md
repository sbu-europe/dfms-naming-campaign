---
module: 06-poi-operations
specification: QC Operations — Unified Admin UX (v3)
version: 3.0
phase: Phase 1
sprint: Sprint 8 (QC admin rework)
last_updated: 2026-08-10
changelog: "v3.0 — TO-centric QC Queue, unified Add QC form (multi-sample, moisture%, per-sample pass/fail, auto-pass), resample after Pass (pre-unload + during unload), reinspect after Fail. Builds on FB-013 (qc-operations-v2 §1–§13)."
supersedes_partial: qc-operations-v2 FB-013 admin/API sections (§6); replaces fragmented Samples + Decisions nav
baseline_spec: qc-operations-sprint4.md
related_stories: QC-01 (v3 amendments)
---

# QC Operations — Unified Admin UX (v3)

## Overview

This document is the **v3 implementation plan** for RM inbound QC Checkpoint admin. It consolidates the fragmented Sprint 4 UX (separate **QC Queue** sample list, **New Sample**, and **Decisions** menus) into a single **TO-centric QC Queue** with an **Add QC** form.

**Problem:** Inspectors work transport-order-first. Today they navigate three admin screens and record samples and decisions in separate steps.

**Solution (v3 scope):**

1. **QC Queue** — list all TOs in the QC lifecycle and post-QC yard steps at destination.
2. **Add QC** — one form: select TO → TO details panel → multiple samples (physical analysis, remarks, moisture%) → per-sample pass/fail → submit (rollup).
3. **Auto-pass** — pass a TO without physical sampling (audit sample recorded).
4. **Reinspect** — after Fail (no active bay assignment).
5. **Resample** — after Pass, **before or during** CC bay assignment / unloading.

**Primary module path:** `apps/quality/checkpoint/`  
**Coordinated touch paths:** `apps/transport/models.py`, `apps/operations/command_center/`, `apps/core/portal_navigation.py`  
**FB-013 retained:** `qc_failed_quantity`, CC eligibility after Fail, LD unload warning — unchanged.

### Scope boundary

| In scope (v3) | Out of scope / deferred |
|---------------|-------------------------|
| TO-centric QC Queue admin (proxy model) | Legacy `apps/quality/models.py` (`QCEvent`) |
| Unified Add QC form + sample formset | Mobile QC app |
| `moisture_pct` on checkpoint samples | Lab test workflow / QR labels |
| Per-sample pass/fail with worst-sample TO rollup | Per-line failed quantity |
| Auto-pass with audit sample | Nutritional analysis fields |
| Resample pre-unload + during unload | Phase 3 scale-out / stock (PO-gated) |
| Reinspect after Fail (existing guard) | Hide Samples/Decisions from nav only |

### Locked product decisions (2026-08-10)

| Topic | Decision |
|-------|----------|
| Lane | **RM inbound only**, when `to_requires_qc_from_lines(to)` is True |
| Queue list | TOs in active QC sub-states **and** post-QC at yard (`qc_passed`, `qc_failed`, `waiting_cc`) |
| Add QC TO picker | TOs in `{flagged_for_qc, sampling_started, resampling}` with no active decision |
| Multi-sample | Min 1 sample per submit; physical analysis required per sample |
| Moisture % | Optional, 0–100, stored on `QCCheckpointSample.moisture_pct` |
| Per-sample decision | Required pass/fail per sample row in form |
| TO rollup | **Worst sample wins** — any Fail → TO Fail; all Pass → TO Pass |
| Fail quantity | Required when any sample is Fail (first failing sample's `failed_quantity`) |
| Auto-pass | Creates audit sample + Pass decision; no moisture/samples required |
| Resample | Active Pass decision; allowed **with or without** active bay assignment |
| Resample pre-unload | Supersedes Pass, clears `qc_passed`, CC blocked until new decision |
| Resample during unload | Also cancels bay assignment + in-progress unload |
| Reinspect | Active Fail, **no** active bay (unchanged QC-01-16) |
| FB-013 | Fail does not block CC assign; pending QC (`qc_passed is null`) still blocks |

---

## 0. Yard chain

```
Scale-In → QueueEntry                              [unchanged]
  └─► flagged_for_qc
        ├─► Add QC (samples + rollup decision)
        │     ├─► PASS → qc_passed
        │     └─► FAIL → qc_failed + qc_failed_quantity
        │
        ├─► Auto-pass → PASS (audit sample)
        │
        ├─► Fail → Reinspect (no bay) → resampling → Add QC
        │
        └─► Pass → Resample (pre-unload OR during unload) → resampling → Add QC
              └─► CC assign → LD-01 (FB-013 warning on fail)
```

---

## 1. Data model

### 1.1 QCCheckpointSample — amendments

```python
class QCCheckpointSample(TenantAwareModel):
    # existing: transport_order, sample_id, physical_analysis, remarks, sampled_at, created_by
    moisture_pct = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    sample_decision = models.CharField(
        max_length=5,
        choices=[("pass", "Pass"), ("fail", "Fail")],
        blank=True,
        default="",
        help_text="Inspector verdict for this sample (v3 form); canonical TO outcome in QCCheckpointDecision.",
    )
```

| Field | Validation |
|-------|------------|
| `moisture_pct` | Optional; if set, 0 ≤ value ≤ 100 |
| `sample_decision` | Set on Add QC submit; audit of per-sample verdict |

### 1.2 QCQueueTransportOrder — proxy

```python
class QCQueueTransportOrder(TransportOrder):
    class Meta:
        proxy = True
        verbose_name = "QC Queue"
        verbose_name_plural = "QC Queue"
```

Registered admin drives changelist + Add QC custom view only (no standard TO edit).

### 1.3 Unchanged

- `QCCheckpointDecision` — one `is_active=True` per TO; created on rollup submit
- `TransportOrder.qc_failed_quantity` — FB-013 UOM-aware fail quantity
- `QueueEntry.qc_passed` — tri-state sync from service layer

---

## 2. Eligibility querysets

**File:** `apps/quality/checkpoint/eligibility.py`

### 2.1 Display queue (`qc_queue_display_queryset`)

RM inbound, `at_destination`, `requires_qc=True`, `sub_state` in:

- `flagged_for_qc`, `sampling_started`, `resampling` — active QC
- `qc_passed`, `qc_failed` — decided
- `waiting_cc` — post-pass waiting for bay

### 2.2 Add QC / Auto-pass (`qc_eligible_transport_orders_queryset`)

Unchanged active states: `flagged_for_qc`, `sampling_started`, `resampling` + no active decision.

### 2.3 Resample eligible (`transport_order_resample_eligible`)

- Active Pass decision (`is_active=True`, `decision=pass`)
- `sub_state == qc_passed` (or `qc_passed is True`)
- Bay assignment **optional** (v3: pre-unload and during unload)

### 2.4 Reinspect eligible (`transport_order_reinspect_eligible`)

Unchanged: active Fail, `qc_failed`, no active bay.

---

## 3. Service layer

**File:** `apps/quality/checkpoint/services.py`

### 3.1 `create_sample` — extended

Accept `moisture_pct`, `sample_decision` (optional at create; set on batch submit).

### 3.2 `create_qc_with_samples` — NEW

```python
def create_qc_with_samples(
    cls, *, transport_order, samples: list[SampleInput], actor
) -> QCCheckpointDecision:
    """
    - Validates ≥1 sample, no active decision
    - Creates each sample via create_sample
    - Rollup: any Fail → record_decision(fail) on first failing sample
              all Pass → record_decision(pass) on last sample
    """
```

### 3.3 `auto_pass_transport_order` — NEW

Creates audit sample (`physical_analysis="Auto-pass (no physical sample taken)."`) + Pass decision.

### 3.4 `trigger_resample` — amended (v3)

**Remove** requirement for active bay assignment.

| Context | Side effects |
|---------|--------------|
| Pre-unload (no bay) | Supersede Pass; `qc_passed=null`; `sub_state=resampling`; CC blocked |
| During unload | Above + cancel bay assignments; `cancelled_by_resample` on unload events |

### 3.5 `record_decision`, `trigger_reinspect_after_fail`, `override_to_failed`

Unchanged semantics (FB-013 + QC-01-16).

---

## 4. QC Queue admin

**File:** `apps/quality/checkpoint/admin_queue.py`

### 4.1 Changelist

| Column | Source |
|--------|--------|
| TO Number | `to_number` |
| Vehicle | registration |
| Product | first line item |
| Sub-state | badge |
| QC outcome | pending / pass / fail |
| Samples | count |
| Actions | contextual links |

**Toolbar:** **Add QC** → custom add view.

**Row actions (when eligible):**

| State | Actions |
|-------|---------|
| Active QC, no decision | Add QC, Auto-pass |
| `qc_failed` + reinspect eligible | Reinspect |
| `qc_passed` + resample eligible | Resample |
| During unload + pass | Resample, Override → Fail (via Decisions admin fallback) |

### 4.2 Add QC form

Custom view `/admin/quality/qcqueuetransportorder/add-qc/`:

```
Transport Order [autocomplete — eligible TOs only]
[Auto-pass TO] button

TO Details [read-only — build_cc_assignment_to_details_html when queue entry exists]

Samples (formset, min 1):
  physical_analysis | remarks | moisture% | decision [Pass/Fail] | failed_quantity*

[+] Add another sample

[Submit QC]
```

- AJAX TO prefill: reuse `build_qc_to_prefill_payload` + CC details endpoint
- After resample/reinspect redirect: TO pre-selected + amber banner
- `failed_quantity` visible/required when row decision = Fail

### 4.3 Resample / Reinspect confirmation

Reuse `remarks_intermediate.html` pattern; redirect to Add QC with `?transport_order=<id>`.

---

## 5. Portal navigation

**File:** `apps/core/portal_navigation.py`

| Before | After |
|--------|-------|
| QC Queue → sample changelist | QC Queue → `/admin/quality/qcqueuetransportorder/` |
| New Sample | **Removed from nav** |
| Decisions | **Removed from nav** (admin URL retained for audit) |

---

## 6. REST API amendments

**File:** `apps/quality/checkpoint/views.py`

| Endpoint | Change |
|----------|--------|
| `GET queue/` | Use `qc_queue_display_queryset`; add `can_add_qc`, `can_resample`, `can_auto_pass`, `resample_context` |
| `POST samples/` | Accept `moisture_pct`, `sample_decision` |
| `POST transport-orders/<id>/auto-pass/` | **NEW** |
| `POST transport-orders/<id>/qc-session/` | **NEW** — batch samples + rollup |
| `POST decisions/<id>/resample/` | Works pre-unload and during unload (service relaxed) |

---

## 7. FB-013 integration (unchanged)

- Fail rollup sets `qc_failed_quantity` via `record_decision`
- CC: pending blocks; Pass or Fail with quantity allows assign
- LD: `qc_unload_warning_context` on fail TOs

---

## 8. Implementation phases

| Step | File(s) | Change |
|------|---------|--------|
| 1 | `checkpoint/models.py` + migration | `moisture_pct`, `sample_decision`, proxy model |
| 2 | `checkpoint/eligibility.py` | Display queue, resample eligible |
| 3 | `checkpoint/services.py` | Batch QC, auto-pass, relax resample |
| 4 | `checkpoint/admin_queue.py` + templates | Queue changelist + Add QC form |
| 5 | `checkpoint/views.py` + `urls.py` | API flags + new endpoints |
| 6 | `portal_navigation.py` | Single QC Queue nav item |
| 7 | Tests | Resample pre-unload, batch QC, auto-pass, queue queryset |

---

## 9. Acceptance criteria

### Queue & form

- [ ] QC Queue lists TOs in active QC and post-QC yard states
- [ ] Add QC creates ≥1 sample with physical analysis, optional moisture%, per-sample decision
- [ ] Any sample Fail → TO Fail with required `failed_quantity`
- [ ] All samples Pass → TO Pass
- [ ] Auto-pass records audit sample and Pass decision
- [ ] TO details panel shown after TO selection (CC-style when queue entry exists)

### Resample & reinspect

- [ ] Resample available after Pass while **waiting for CC** (no bay)
- [ ] Resample available after Pass **during unloading** (cancels bay)
- [ ] Both resample paths redirect to Add QC with TO pre-selected
- [ ] Reinspect after Fail (no bay) unchanged; redirects to Add QC

### FB-013 regression

- [ ] Fail rollup sets `qc_failed_quantity`; CC assign allowed after Fail
- [ ] Pending QC still blocks CC

### API

- [ ] Queue payload includes eligibility flags
- [ ] Auto-pass and qc-session endpoints functional

---

## 10. Cross-references

| Document | Relationship |
|----------|--------------|
| [qc-operations-sprint4.md](./qc-operations-sprint4.md) | Baseline QC-01 service semantics |
| [command-center-loading-sprint4.md](./command-center-loading-sprint4.md) | CC QC gate; TO details panel reuse |
| FB-013 sections in prior v2 doc | Failed quantity + unload warning — still in force |

---

**Last Updated**: 2026-08-10
