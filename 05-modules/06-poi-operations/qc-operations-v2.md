---
module: 06-poi-operations
specification: QC Operations — Unified Admin UX (v3)
version: 3.1
phase: Phase 1
sprint: Sprint 8 (QC admin rework)
status: implemented
last_updated: 2026-08-10
changelog: >
  v3.1 — Document synced to implementation: per-sample sample_side (top/middle/bottom),
  optional JPG/JPEG/PNG photo (max 10 MB), read-only QC Queue TO detail (TO + samples),
  Add QC formset UX (remove row, horizontal scroll), multipart uploads, API sample_side/photo.
  v3.0 — TO-centric QC Queue, unified Add QC form (multi-sample, moisture%, per-sample pass/fail,
  auto-pass), resample after Pass (pre-unload + during unload), reinspect after Fail.
  Builds on FB-013 (qc-operations-v2 §1–§13).
supersedes_partial: qc-operations-v2 FB-013 admin/API sections (§6); replaces fragmented Samples + Decisions nav
baseline_spec: qc-operations-sprint4.md
related_stories: QC-01 (v3 amendments)
---

# QC Operations — Unified Admin UX (v3)

## Overview

This document is the **v3 implementation record** for RM inbound QC Checkpoint admin. It consolidates the fragmented Sprint 4 UX (separate **QC Queue** sample list, **New Sample**, and **Decisions** menus) into a single **TO-centric QC Queue** with an **Add QC** form.

**Problem:** Inspectors work transport-order-first. Previously they navigated three admin screens and recorded samples and decisions in separate steps.

**Solution (v3 — implemented):**

1. **QC Queue** — list TOs in the QC lifecycle and post-QC yard steps at destination.
2. **TO detail (change)** — read-only: TO details + sample rows (not the TransportOrder edit form).
3. **Add QC** — one form: select TO → TO details panel → multiple samples (analysis, remarks, moisture%, side, optional photo, pass/fail) → submit (rollup).
4. **Auto-pass** — pass a TO without physical sampling (audit sample recorded).
5. **Reinspect** — after Fail (no active bay assignment).
6. **Resample** — after Pass, **before or during** CC bay assignment / unloading.

**Primary module path:** `apps/quality/checkpoint/`  
**Coordinated touch paths:** `apps/transport/models.py`, `apps/operations/command_center/`, `apps/core/portal_navigation.py`  
**FB-013 retained:** `qc_failed_quantity`, CC eligibility after Fail, LD unload warning — unchanged.

### Scope boundary

| In scope (v3) | Out of scope / deferred |
|---------------|-------------------------|
| TO-centric QC Queue admin (proxy model) | Legacy `apps/quality/models.py` (`QCEvent`) |
| Unified Add QC form + sample formset | Mobile QC app |
| `moisture_pct`, `sample_side`, `photo` on samples | Lab test workflow / QR labels |
| Per-sample pass/fail with worst-sample TO rollup | Per-line failed quantity |
| Auto-pass with audit sample | Nutritional analysis fields |
| Resample pre-unload + during unload | Phase 3 scale-out / stock (PO-gated) |
| Reinspect after Fail (existing guard) | Hide Samples/Decisions from nav only |
| Read-only QC Queue TO detail (TO + samples) | Editing TO fields from QC Queue |

### Locked product decisions (2026-08-10)

| Topic | Decision |
|-------|----------|
| Lane | **RM inbound only**, when `to_requires_qc_from_lines(to)` is True |
| Queue list | TOs in active QC sub-states **and** post-QC at yard (`qc_passed`, `qc_failed`, `waiting_cc`) |
| Add QC TO picker | TOs in `{flagged_for_qc, sampling_started, resampling}` with no active decision |
| Multi-sample | Min 1 sample per submit; physical analysis required per sample |
| Moisture % | Optional, 0–100, stored on `QCCheckpointSample.moisture_pct` |
| Sample side | **Required** on manual Add QC / qc-session: `top` \| `middle` \| `bottom` |
| Photo | Optional JPG/JPEG/PNG, max 10 MB; stored on `QCCheckpointSample.photo` |
| Per-sample decision | Required pass/fail per sample row in form |
| TO rollup | **Worst sample wins** — any Fail → TO Fail; all Pass → TO Pass |
| Fail quantity | Required when any sample is Fail (first failing sample's `failed_quantity`) |
| Auto-pass | Creates audit sample + Pass decision; no moisture/side/photo required |
| Resample | Active Pass decision; allowed **with or without** active bay assignment |
| Resample pre-unload | Supersedes Pass, clears `qc_passed`, CC blocked until new decision |
| Resample during unload | Also cancels bay assignment + in-progress unload |
| Reinspect | Active Fail, **no** active bay (unchanged QC-01-16) |
| QC Queue change | Read-only TO + samples detail (not TransportOrder field editor) |
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

**File:** `apps/quality/checkpoint/models.py`  
**Migrations:** `quality.0004_qc_v3_sample_fields_and_queue_proxy`, `quality.0005_qccheckpointsample_side_and_photo`

```python
class QCCheckpointSample(TenantAwareModel):
    # existing: transport_order, sample_id, physical_analysis, remarks, sampled_at, created_by
    moisture_pct = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    sample_decision = models.CharField(
        max_length=5,
        choices=SampleDecision.choices,  # pass | fail
        blank=True,
        default="",
    )
    sample_side = models.CharField(
        max_length=10,
        choices=SampleSide.choices,  # top | middle | bottom
        blank=True,
        default="",
    )
    photo = models.FileField(
        upload_to="qc_checkpoint_samples/%Y/%m/",
        blank=True,
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=["jpg", "jpeg", "png"])],
    )
```

| Field | Validation / usage |
|-------|--------------------|
| `moisture_pct` | Optional; if set, 0 ≤ value ≤ 100 |
| `sample_decision` | Set on Add QC / qc-session submit; per-sample audit verdict |
| `sample_side` | Required for manual batch QC (`create_qc_with_samples`); blank OK for auto-pass audit sample |
| `photo` | Optional; JPG/JPEG/PNG only; max 10 MB (`validate_qc_sample_photo`) |

### 1.2 QCQueueTransportOrder — proxy

```python
class QCQueueTransportOrder(TransportOrder):
    class Meta:
        proxy = True
        verbose_name = "QC Queue"
        verbose_name_plural = "QC Queue"
```

Admin drives changelist, read-only TO detail (`change_view`), and Add QC custom view. Standard TransportOrder field editing is **not** exposed.

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

Active states: `flagged_for_qc`, `sampling_started`, `resampling` + no active decision.  
`transport_order_add_qc_eligible` / `transport_order_auto_pass_eligible` share that rule.

### 2.3 Resample eligible (`transport_order_resample_eligible`)

- Active Pass decision (`is_active=True`, `decision=pass`)
- `sub_state == qc_passed` (or `qc_passed is True`)
- Bay assignment **optional** (v3: pre-unload and during unload)  
- `resample_context_for_transport_order` → `pre_unload` \| `during_unload`

### 2.4 Reinspect eligible (`transport_order_reinspect_eligible`)

Unchanged: active Fail, `qc_failed`, no active bay.

---

## 3. Service layer

**File:** `apps/quality/checkpoint/services.py`  
**Validation helpers:** `apps/quality/checkpoint/validation.py` (`validate_qc_sample_side`, `validate_qc_sample_photo`)

### 3.1 `QCSampleInput`

```python
@dataclass
class QCSampleInput:
    physical_analysis: str
    remarks: str = ""
    moisture_pct: Decimal | None = None
    sample_side: str = ""
    decision: str = ""
    failed_quantity: Decimal | None = None
    photo: object | None = None  # uploaded file; must be typed for dataclass __init__
```

### 3.2 `create_sample` — extended

Accepts `moisture_pct`, `sample_decision`, `sample_side`, `photo` (optional). Photo validated before save when present.

### 3.3 `create_qc_with_samples`

```python
def create_qc_with_samples(
    cls, *, transport_order, samples: list[QCSampleInput], actor
) -> QCCheckpointDecision:
    """
    - Validates ≥1 sample, no active decision
    - Per sample: physical analysis, pass/fail, sample_side required;
      moisture 0–100 if set; photo extension/size if set
    - Creates each sample via create_sample
    - Rollup (worst sample wins):
        any Fail → record_decision(fail) on first failing sample (+ failed_quantity)
        all Pass → record_decision(pass) on last sample
    - record_decision sets to.qc_passed, qc_failed_quantity, sub_state
      (qc_passed | qc_failed), syncs QueueEntry
    """
```

### 3.4 `auto_pass_transport_order`

Creates audit sample (`physical_analysis="Auto-pass (no physical sample taken)."`) + Pass decision. Does **not** require sample side or photo.

### 3.5 `trigger_resample` — amended (v3)

**No** requirement for active bay assignment.

| Context | Side effects |
|---------|--------------|
| Pre-unload (no bay) | Supersede Pass; `qc_passed=null`; `sub_state=resampling`; CC blocked |
| During unload | Above + cancel bay assignments; `cancelled_by_resample` on unload events |

### 3.6 `record_decision`, `trigger_reinspect_after_fail`, `override_to_failed`

Unchanged semantics (FB-013 + QC-01-16).

---

## 4. QC Queue admin

**File:** `apps/quality/checkpoint/admin_queue.py`  
**Templates:** `templates/admin/quality/checkpoint/qcqueue/`  
**Static:** `static/admin/js/qc_add_qc_form.js`, QC section in `static/admin/css/custom.css`

### 4.1 Changelist

| Column | Source |
|--------|--------|
| TO Number | `to_number` (links to read-only detail) |
| Vehicle | registration |
| Product | first line item |
| Sub-state | badge |
| QC outcome | pending / pass / fail |
| Samples | count |
| Actions | contextual links |

**Toolbar:** **Add QC** → `/admin/quality/qcqueuetransportorder/add-qc/`  
**Pagination:** extends `admin/dynamic_pagination_changelist.html`.

**Row actions (when eligible):**

| State | Actions |
|-------|---------|
| Active QC, no decision | Add QC, Auto-pass |
| `qc_failed` + reinspect eligible | Reinspect |
| `qc_passed` + resample eligible | Resample |
| During unload + pass | Resample (Override → Fail remains on legacy Decisions admin) |

### 4.2 TO detail (change view)

`/admin/quality/qcqueuetransportorder/<uuid>/change/` is **not** a TransportOrder editor.

Shows:

1. Sub-state + QC outcome badges  
2. TO details panel (`build_cc_assignment_to_details_html` when a queue entry exists, else `_to_context_html`)  
3. Samples table (sample ID, side, analysis, remarks, moisture %, decision, photo link, sampled at)  
4. Eligible action buttons (Add QC / Auto-pass / Resample / Reinspect)

### 4.3 Add QC form

Custom view `/admin/quality/qcqueuetransportorder/add-qc/` (`enctype=multipart/form-data`):

```
Transport Order [select — eligible TOs only]
[Auto-pass TO] button (when eligible)

TO Details [read-only — AJAX via to-details/<uuid>/]

Samples (formset, min 1, max 10):
  # | physical_analysis* | remarks | moisture% | sample_side* | photo | decision* | failed_qty | Remove

[+] Add another sample

[Cancel] [Submit QC]
```

- Horizontal scroll wrapper for wide sample table  
- Remove row reindexes formset; last row clears instead of deleting  
- Failed qty column shown when any row decision = Fail  
- After resample/reinspect: TO pre-selected + amber banner (`?banner=resample|reinspect`)

### 4.4 Resample / Reinspect confirmation

Custom `action_confirm.html`; remarks optional for resample, required for reinspect; redirect to Add QC with `?transport_order=<id>`.

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
| `GET queue/` | `qc_queue_display_queryset`; flags `can_add_qc`, `can_resample`, `can_auto_pass`, `resample_context` |
| `GET/POST samples/` | Read includes `sample_side`, `photo_url`; create accepts `moisture_pct`, `sample_decision`, `sample_side`, optional `photo` |
| `POST transport-orders/<id>/auto-pass/` | Auto-pass (audit sample + Pass) |
| `POST transport-orders/<id>/qc-session/` | Batch samples + rollup; each sample requires `sample_side` |
| `POST decisions/<id>/resample/` | Works pre-unload and during unload |

---

## 7. FB-013 integration (unchanged)

- Fail rollup sets `qc_failed_quantity` via `record_decision`
- CC: pending blocks; Pass or Fail with quantity allows assign
- LD: `qc_unload_warning_context` on fail TOs

---

## 8. Implementation map (as built)

| Area | Location |
|------|----------|
| Models + proxy | `checkpoint/models.py` |
| Migrations | `quality.0004_*`, `quality.0005_*` |
| Eligibility | `checkpoint/eligibility.py` |
| Services + `QCSampleInput` | `checkpoint/services.py` |
| Validation | `checkpoint/validation.py` |
| Queue admin | `checkpoint/admin_queue.py` |
| Templates | `templates/admin/quality/checkpoint/qcqueue/` |
| Static JS/CSS | `static/admin/js/qc_add_qc_form.js`, `static/admin/css/custom.css` |
| API | `checkpoint/views.py`, `checkpoint/urls.py` |
| Nav | `apps/core/portal_navigation.py` |
| Tests | `tests/unit/test_quality/test_qc_v3.py`, `test_qc_reinspect.py` |

**Local note:** Docker serves collected static from a volume; after static edits run `collectstatic` (or restart `make local`) so Add QC JS/CSS are not 404.

---

## 9. Acceptance criteria

### Queue & form

- [x] QC Queue lists TOs in active QC and post-QC yard states
- [x] Add QC creates ≥1 sample with physical analysis, optional moisture%, required sample side, optional photo, per-sample decision
- [x] Any sample Fail → TO Fail with required `failed_quantity`
- [x] All samples Pass → TO Pass (`qc_passed=True`, `sub_state=qc_passed`)
- [x] Auto-pass records audit sample and Pass decision
- [x] TO details panel shown after TO selection (CC-style when queue entry exists)
- [x] QC Queue TO change page shows TO details + samples only (no full TO edit form)

### Resample & reinspect

- [x] Resample available after Pass while **waiting for CC** (no bay)
- [x] Resample available after Pass **during unloading** (cancels bay)
- [x] Both resample paths redirect to Add QC with TO pre-selected
- [x] Reinspect after Fail (no bay) unchanged; redirects to Add QC

### FB-013 regression

- [x] Fail rollup sets `qc_failed_quantity`; CC assign allowed after Fail
- [x] Pending QC still blocks CC

### API

- [x] Queue payload includes eligibility flags
- [x] Auto-pass and qc-session endpoints functional
- [x] Sample payloads include `sample_side` / `photo_url` (create accepts photo multipart)

---

## 10. Cross-references

| Document | Relationship |
|----------|--------------|
| [qc-operations-sprint4.md](./qc-operations-sprint4.md) | Baseline QC-01 service semantics |
| [command-center-loading-sprint4.md](./command-center-loading-sprint4.md) | CC QC gate; TO details panel reuse |
| FB-013 sections in prior v2 doc | Failed quantity + unload warning — still in force |

---

**Last Updated**: 2026-08-10 (v3.1 — synced to implementation)
