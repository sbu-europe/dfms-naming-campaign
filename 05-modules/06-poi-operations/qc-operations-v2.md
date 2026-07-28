---
module: 06-poi-operations
specification: QC Operations — Partial Fail + Unload Warning (Sprint 6 — FB-013)
version: 2.0
phase: Phase 1
sprint: Sprint 6 (FB-013)
last_updated: 2026-07-07
changelog: "v2.0 — FB-013: QC Fail no longer blocks unloading; expected failed-bag capture on Fail; non-blocking unload warning; mid-unload failed-bag edit. Amends baseline qc-operations-sprint4.md §0, §2.3, §3.2, §4.2, CC-01 eligibility, LD-01 warning surfaces. Phase 3 (scale-out / gate-out / stock) PO-gated."
related_stories: QC-01 (amendment), CC-01 (amendment), LD-01 (amendment); downstream STK-01 / FB-012 (Phase 3)
feedback_items: FB-013
supersedes: qc-operations-sprint4.md §0 (Fail blocks unloading), §3.2 On Fail side effects, §4.2 Fail success message, §7 Decision recording downstream block, §9 CC-01 unlock row
baseline_spec: qc-operations-sprint4.md
feedback_tracker: ../../03-backlog/sprints/sprint-6/feedback-resolution/README.md
jira_epic: DFS-072
---

# QC Operations — Partial Fail & Unload Warning (FB-013)

## Overview

This document is the **Sprint 6 implementation plan v2** for [FB-013](../../03-backlog/sprints/sprint-6/feedback-resolution/04-yard-and-stock.md#fb-013--qc-fail-does-not-block-unloading-capture-expected-failed-bags-and-warn-during-unload). It amends the baseline [QC Operations (Sprint 4)](./qc-operations-sprint4.md) specification and coordinates changes in [Command Center](./command-center-loading-sprint4.md) and LD-01 unload surfaces.

**Problem (client feedback — 2026-07-07):** When QC records **Fail**, the system today **fully blocks** Command Center unloading-point assignment and LD-01 unload. Operations need to **unload anyway** while knowing **how many bags are expected to fail**, surfaced as a **warning** to unloading personnel. The failed-bag count must be capturable at QC Fail time and **editable during unloading**.

**Solution (FB-013 scope):**

1. On QC **Fail**, require **expected failed bag count** for the TO (`0 < failed_bags ≤ total expected bags`).
2. **Unblock** CC bay assignment and LD unload when Fail is recorded (pending QC — `qc_passed is null` — still blocks).
3. Show a **non-blocking warning** on unload admin/API with failed vs total expected bags.
4. Allow **update failed bags** during active unloading (Phase 2).

**Primary module path:** `apps/quality/checkpoint/`  
**Coordinated touch paths:** `apps/transport/models.py`, `apps/operations/command_center/`, `apps/operations/loading/`, `apps/core/dashboard_service.py`  
**Phase 3 (PO confirm):** `apps/operations/scaling/services.py`, `apps/operations/gate/clearance.py`, `apps/transport/closure/`, `apps/operations/stock/services.py` (coordinate with [FB-012](./stock-operations-sprint5.md))

### Scope boundary

| In scope (FB-013) | Out of scope / deferred |
|-------------------|-------------------------|
| `qc_failed_bags` capture on QC Fail (TO-level, Phase 1) | Per-`TOLineItem` failed bags (optional Phase 2+ — see §1.2) |
| CC eligibility: `null` blocks, `False` allows assign | Changing QC to FG inbound or non-RM lanes |
| LD warning banner + API handoff payload | New mobile unload app (admin + REST only, same as LD-01) |
| `update_failed_bags` during unload (Phase 2) | Auto-split failed bags across multi-LUP visits ([FB-001](./command-center-multi-lup-assignment-fb001.md)) |
| Amend reinspect / resample / override to clear or require `qc_failed_bags` | Legacy `apps/quality/models.py` (`QCEvent` / `GateEntry`) |
| Unit + integration tests; E2E-01-3 fail branch amend | Phase 3 scale-out / gate-out / stock until PO signs §13 |

### Locked product decisions (2026-07-07)

| Topic | Decision |
|-------|----------|
| Lane | **RM inbound only**, when `to_requires_qc_from_lines(to)` is True (unchanged) |
| Fail → unload | **Fail does not block** CC assign or LD start/complete |
| Pending QC | `qc_passed is null` **still blocks** CC until Pass or Fail is recorded |
| Failed bag granularity (Phase 1) | **One integer per TO** — `TransportOrder.qc_failed_bags` |
| Failed bag on Fail | **Required** when decision = Fail; must be `> 0` and `≤ to_total_bags(to)` |
| Pass decision | Clears `qc_failed_bags` (set `0` or `null`) |
| Unload warning | **Informational only** — never raises `ValidationError` on start/complete |
| Reinspect after Fail | Still **pre-unload only** (no active `BayAssignment`); clears `qc_failed_bags` |
| Resample / override during unload | Unchanged cancellation semantics; override-to-fail **requires** `failed_bags` (FB-013) |
| Scale-out / gate-out on Fail | **TBD — Phase 3** (see §13) |

---

## 0. Yard chain — what changes vs what stays

**Baseline (Sprint 4 / QC-01-16):**

```
Fail → unloading blocked → reinspect OR wait for Pass
```

**FB-013 (Phase 1):**

```
Scale-In → QueueEntry                              [unchanged]
  └─► QC sample + decision                         [amended Fail path]
        ├─► PASS: qc_passed=True, qc_failed_bags cleared
        │     └─► CC assign unload → LD-01 → (scale-out TBD Phase 3)
        │
        ├─► FAIL: qc_passed=False, qc_failed_bags required
        │     ├─► CC **may** assign unload point(s)     [NEW — was blocked]
        │     ├─► LD start/complete with **warning**    [NEW]
        │     └─► Reinspect still available if no BayAssignment yet
        │
        └─► PENDING (null): CC blocked until decision   [unchanged]

During unloading (after Pass):
  └─► Resample / override-to-fail                    [unchanged + override requires failed_bags]
```

---

## 1. Data model amendments

### 1.1 TransportOrder — `qc_failed_bags`

Add denormalized field on `TransportOrder` (canonical for CC queue, LD warning, and Phase 3 stock):

```python
# apps/transport/models.py
class TransportOrder(...):
    requires_qc = models.BooleanField(default=False)      # existing
    qc_passed = models.BooleanField(null=True, blank=True)  # existing tri-state
    qc_failed_bags = models.PositiveIntegerField(null=True, blank=True)  # NEW — FB-013
```

| Value | Meaning |
|-------|---------|
| `null` | No fail recorded, or cleared by reinspect / resample / Pass |
| `> 0` | Active Fail (or override-to-fail) — expected rejected bag count |

**Optional audit (Phase 2):** `qc_failed_bags_updated_at`, `qc_failed_bags_updated_by` — only if mid-unload edits need explicit audit beyond `TOStatusTransitionLog` / timeline notes.

### 1.2 QCCheckpointDecision — snapshot (optional)

Phase 1 may keep failed bags **only** on `TransportOrder`. Optionally add `failed_bags` on `QCCheckpointDecision` as an immutable snapshot at decision time for audit:

```python
# apps/quality/checkpoint/models.py — optional Phase 1b
class QCCheckpointDecision(...):
    failed_bags = models.PositiveIntegerField(null=True, blank=True)  # set when decision='fail'
```

If omitted, decision audit relies on TO field + TLS-01 payload.

### 1.3 Per-line failed bags (deferred)

If PO later requires per-product-line partial reject (aligns with [FB-005 per-line unload capture](./command-center-loading-sprint4.md#12-sprint-6-fb-005--per-line-loadunload-quantity-capture-ld-01-9)):

```python
class QCCheckpointDecisionLineItem(TenantAwareModel):
    qc_decision = FK(QCCheckpointDecision)
    to_line_item = FK(TOLineItem)
    failed_bags = PositiveIntegerField()
```

**Phase 1 ships TO-level only.**

### 1.4 Models unchanged

- `QCCheckpointSample` — no failed-bag field
- `QueueEntry.qc_passed` — still synced from QC service; semantics amended (see §3.2)
- `UnloadEvent` — no new persisted field; warning derived from TO at render time
- `UnloadEvent.qc_sample_taken` — remains LD capture flag; **not** the FB-013 failed-bag source

### 1.5 Bag total helper

Reuse `to_total_bags(transport_order)` from `apps/transport/vehicle_capacity.py` — sums `TOLineItem.allocated_quantity` where UOM is bag-based.

**Validation gate:** If `to_total_bags(to)` is `None` (weight-only TO), Fail with bag count is **rejected** with a clear message — unless PO approves `failed_weight_mt` in a later phase (§13 OQ-4).

---

## 2. Validation — `validate_failed_bags`

New shared validator in `apps/quality/checkpoint/validation.py` (or `apps/transport/vehicle_capacity.py`):

```python
def validate_failed_bags(transport_order, failed_bags: int) -> None:
    """
  Raises ValidationError when:
  - failed_bags < 1
  - to_total_bags(to) is None (no bag-based lines)
  - failed_bags > to_total_bags(to)
    """
```

Called from:

- `QCService.record_decision` (Fail)
- `QCService.override_to_failed`
- `QCService.update_failed_bags` (Phase 2)

---

## 3. Service layer amendments

### 3.1 `QCService.record_decision` — Fail path (amended)

**File:** `apps/quality/checkpoint/services.py`

```python
def record_decision(
    qc_sample: QCCheckpointSample,
    *,
    decision: str,
    decided_by: User,
    remarks: str | None = None,
    failed_bags: int | None = None,  # NEW — required when decision='fail'
) -> QCCheckpointDecision:
```

| Decision | `qc_passed` | `qc_failed_bags` | `QueueEntry` sync | CC assign |
|----------|-------------|------------------|-------------------|-----------|
| Pass | `True` | `null` or `0` | `qc_passed=True`, `status=waiting` | Allowed |
| Fail | `False` | **required** `> 0` | `qc_passed=False`, `status=waiting` | **Allowed** (FB-013) |
| (pending) | `null` | `null` | `qc_passed=null` | Blocked |

**On Fail — remove downstream block language in docstring.** Emit `QC_FAILED` → TLS-01 with payload `{ ..., failed_bags }`.

**On Pass — unchanged** except clear `qc_failed_bags`.

### 3.2 `QCService.update_failed_bags` — NEW (Phase 2)

```python
@classmethod
@transaction.atomic
def update_failed_bags(
    cls,
    *,
    transport_order: TransportOrder,
    failed_bags: int,
    actor: User,
    remarks: str = "",
) -> TransportOrder:
    """
    Validates:
    - flow_lane == RM_INBOUND, requires_qc=True
    - qc_passed is False (active fail or override-to-fail)
    - validate_failed_bags(to, failed_bags)
    - Optional: active BayAssignment or in-progress UnloadEvent exists
    Actions:
    - transport_order.qc_failed_bags = failed_bags
    - timeline note (source_module='qc_checkpoint')
    Does NOT block LD operations.
    """
```

Callable from LD admin save hook, dedicated QC admin action, or `PATCH` API.

### 3.3 `QCService.trigger_reinspect_after_fail` — amended

When reinspect starts (pre-unload):

- Set `transport_order.qc_failed_bags = null`
- Existing: `qc_passed = null`, supersede Fail decision, `sub_state → resampling`

**Guard unchanged:** raises if active `BayAssignment` exists (*"Use resample instead"*).

### 3.4 `QCService.trigger_resample` — amended

When resample resets QC cycle during unload:

- Set `transport_order.qc_failed_bags = null` (alongside `qc_passed = null`)

### 3.5 `QCService.override_to_failed` — amended

Add required `failed_bags: int` parameter:

- `validate_failed_bags(to, failed_bags)`
- Set `to.qc_failed_bags = failed_bags`
- `to.qc_passed = False`
- Cancel assignments / unload events (unchanged)

**Note:** After override, CC **may** re-assign unload (FB-013) — amend baseline §3.4 note *"CC stays blocked"*.

### 3.6 Read helper — `qc_unload_warning_context`

**File:** `apps/quality/checkpoint/services.py` or `apps/operations/loading/services.py`

```python
def qc_unload_warning_context(transport_order) -> dict | None:
    """
    Returns None when no warning applies.
    Otherwise:
      {
        "failed_bags": int,
        "expected_bags": int,
        "accepted_bags": int,  # expected - failed
        "severity": "warning",
        "message": "QC failed: 12 of 500 bags expected rejected.",
      }
    """
```

Used by LD admin, REST handoff, and optional CC bay-assign confirmation panel.

---

## 4. Command Center integration (CC-01)

**Baseline:** `CCService.eligible_for_bay_assignment` requires `qc_passed is True` when `requires_qc=True`.

**FB-013:**

```python
def eligible_for_bay_assignment(queue_entry: QueueEntry) -> bool:
    ...
    if queue_entry.requires_qc and queue_entry.qc_passed is None:
        return False  # pending decision — still blocked
    return True       # True (pass) OR False (fail with bags) both allow
```

**`bay_assignable_queue_entries` filter:**

```python
# Replace: Q(requires_qc=False) | Q(qc_passed=True)
Q(requires_qc=False) | Q(qc_passed__isnull=False)
```

**`_validate_for_assignment` error message:**

- Pending: *"A QC decision is required before bay assignment."*
- Remove: *"A passing QC decision is required…"*

### 4.1 CC admin UX

**File:** `apps/operations/command_center/admin.py`

| Element | Current | FB-013 |
|---------|---------|--------|
| `cc_actions` when `qc_passed=False` | Badge "Awaiting QC" | Badge **"QC Failed"** + failed-bag count; show **Assign** link |
| `qc_state_display` | "Failed" badge | Include `qc_failed_bags` in label e.g. `Failed (12 bags)` |
| Bay assignment add form | — | Optional read-only warning panel when TO has fail |

See [command-center-loading-sprint4.md](./command-center-loading-sprint4.md) §3.4 — amend table row *"QC Fail recorded → Unloading blocked"*.

---

## 5. Loading / Unloading integration (LD-01)

**Baseline:** Unload blocked indirectly (no bay assignment on fail).

**FB-013:** LD service **does not** add QC pass/fail guards on `start_unloading` / `complete_unloading`. Warning only.

### 5.1 Admin surfaces

**File:** `apps/operations/loading/admin.py`

| Surface | Change |
|---------|--------|
| `to_details_panel` | Inject amber warning banner when `qc_unload_warning_context` is non-null |
| New `qc_fail_warning` readonly field | Parallel to `resample_warning` (§CHANGE_FIELDSETS Bay fieldset) |
| Unload queue table (`queue_rows_view`) | Optional badge on rows where TO `qc_passed=False` |
| Phase 2: change form | Editable `qc_failed_bags` field (calls `QCService.update_failed_bags` on save) |

**Warning copy (example):**

> QC failed — **12** of **500** expected bags flagged as rejected. Unloading may proceed; segregate rejected quantity.

### 5.2 REST API

**File:** `apps/operations/loading/views.py`

| Endpoint | Change |
|----------|--------|
| `GET .../unload-events/{pk}/qc-handoff/` | Add `qc_fail_warning` object from helper |
| `PATCH` or complete payload (Phase 2) | Optional `qc_failed_bags` when TO in fail state |

**File:** `apps/quality/checkpoint/views.py`

| Endpoint | Change |
|----------|--------|
| `POST .../decisions/` | Body adds `failed_bags` (required if `decision=fail`) |
| `PATCH .../transport-orders/{id}/failed-bags/` (Phase 2) | `{ failed_bags, remarks? }` |

---

## 6. QC admin & API amendments

### 6.1 Decision add form

**File:** `apps/quality/checkpoint/admin.py`

- Add integer field **Expected failed bags** — visible/required when Decision = Fail
- `clean()`: call `validate_failed_bags`
- Success message on Fail: *"QC Failed. {n} bags flagged. Command Center may assign unloading; unloading personnel will see a warning."*

### 6.2 Override intermediate form

Collect `failed_bags` + `remarks` before `override_to_failed`.

### 6.3 Queue / My Queue display

- Rows with active Fail show failed-bag count in context panel
- Reinspect-eligible rows unchanged (no assignment yet)

### 6.4 API contract summary

```http
POST /api/v1/qc/checkpoint/decisions/
  Body: {
    qc_sample_id,
    decision: "pass" | "fail",
    remarks,           # required if fail
    failed_bags        # required if fail (NEW)
  }

PATCH /api/v1/qc/checkpoint/transport-orders/{to_id}/failed-bags/   # Phase 2
  Body: { failed_bags, remarks? }
```

Extend `GET .../queue/` items with `qc_failed_bags`, `expected_bags` when fail active.

---

## 7. TLS-01 events (amended payloads)

| Action | Payload addition (FB-013) |
|--------|---------------------------|
| Fail recorded | `{ ..., failed_bags }` |
| Override to failed | `{ ..., failed_bags }` |
| Failed bags updated (Phase 2) | New event `QC_FAILED_BAGS_UPDATED` or timeline note only |
| Reinspect / resample | `{ prior_failed_bags }` in notes |

---

## 8. Dashboard

**File:** `apps/core/dashboard_service.py`

Split RM inbound QC widgets:

| Widget | Filter |
|--------|--------|
| Awaiting QC decision | `requires_qc=True`, `qc_passed__isnull=True` |
| QC Failed (unloadable) | `requires_qc=True`, `qc_passed=False`, `qc_failed_bags__gt=0` |
| Failed — reinspect eligible | Existing `qc_failed_reinspect_queryset` (no active bay) |

---

## 9. Implementation phases & ordered steps

### Phase 1 — Unblock unload + capture + warn (ship first)

| Step | File(s) | Change |
|------|---------|--------|
| 1 | `apps/transport/models.py` + migration | Add `qc_failed_bags` |
| 2 | `apps/quality/checkpoint/validation.py` | `validate_failed_bags()` |
| 3 | `apps/quality/checkpoint/services.py` | Amend `record_decision` Fail; add `qc_unload_warning_context` |
| 4 | `apps/operations/command_center/services.py` | Eligibility + `bay_assignable_queue_entries` |
| 5 | `apps/operations/command_center/admin.py` | Assign on fail; display failed bags |
| 6 | `apps/quality/checkpoint/admin.py` | Fail form field + messages |
| 7 | `apps/quality/checkpoint/views.py` | `failed_bags` on POST decisions |
| 8 | `apps/operations/loading/admin.py` | `qc_fail_warning` + `to_details_panel` banner |
| 9 | `apps/operations/loading/views.py` | Handoff JSON |
| 10 | `apps/core/dashboard_service.py` | Widget split |
| 11 | Tests | `test_cc_qc_queue.py`, new `test_qc_failed_bags.py`, LD warning tests |
| 12 | Docs cross-ref | This file + feedback-resolution FB-013 status |

### Phase 2 — Edit during unloading

| Step | File(s) | Change |
|------|---------|--------|
| 13 | `apps/quality/checkpoint/services.py` | `update_failed_bags()` |
| 14 | `apps/quality/checkpoint/views.py` | PATCH failed-bags endpoint |
| 15 | `apps/operations/loading/admin.py` | Editable field on unload change form |
| 16 | `apps/quality/checkpoint/services.py` | Amend override / reinspect / resample to clear or set bags |
| 17 | Tests | Mid-unload update; validation bounds |

### Phase 3 — Downstream guards & stock (PO-gated)

| Step | File(s) | Change |
|------|---------|--------|
| 18 | `apps/operations/scaling/services.py` | Relax or replace `_require_qc_passed` — see §13 OQ-1 |
| 19 | `apps/operations/gate/clearance.py` | Align `_optional_qc_clearance` with scale-out decision |
| 20 | `apps/transport/closure/closure_engine.py` | Checklist: `qc_decision_recorded` vs strict `qc_passed` |
| 21 | `apps/operations/stock/services.py` | Credit `received − failed` per FB-012 — see §13 OQ-2 |
| 22 | E2E-01-3 | Fail → assign → unload with warning → scale-out path |

---

## 10. Story mapping (amendments)

### QC-01 amendments (FB-013)

| Sub-task | Scope | Implementation focus |
|----------|-------|----------------------|
| QC-01-17 | Model + migration | `TransportOrder.qc_failed_bags` |
| QC-01-18 | `validate_failed_bags` | Shared validator; bag-UOM gate |
| QC-01-19 | `record_decision` Fail | Require `failed_bags`; sync TO + queue; amend docstring |
| QC-01-20 | QC admin / API Fail | Form field + POST body |
| QC-01-21 | `qc_unload_warning_context` | Read helper for LD/CC |
| QC-01-22 | Override / reinspect / resample | Clear or require `qc_failed_bags` per §3.3–3.5 |
| QC-01-23 | `update_failed_bags` | Phase 2 service + API + LD admin |
| QC-01-24 | Tests + E2E | Phase 1–2 coverage; E2E-01-3 branch |

### CC-01 amendments (FB-013)

| Sub-task | Scope |
|----------|-------|
| CC-01-FB013-1 | `eligible_for_bay_assignment` + queryset filter |
| CC-01-FB013-2 | Admin `cc_actions` + `qc_state_display` |

### LD-01 amendments (FB-013)

| Sub-task | Scope |
|----------|-------|
| LD-01-FB013-1 | Warning panel + `qc_fail_warning` |
| LD-01-FB013-2 | REST handoff payload |
| LD-01-FB013-3 | Phase 2 — edit failed bags on change form |

---

## 11. Acceptance criteria (FB-013)

### Phase 1

- [ ] QC Fail without `failed_bags` is rejected
- [ ] QC Fail with `failed_bags > to_total_bags` is rejected
- [ ] QC Fail with valid `failed_bags` sets `qc_passed=False` and **allows** CC bay assignment
- [ ] QC pending (`qc_passed null`) still blocks CC assignment
- [ ] QC Pass clears `qc_failed_bags` and allows CC assign (unchanged)
- [ ] Unload start/complete succeeds on failed TO with active bay assignment
- [ ] Unload admin and qc-handoff API show warning with failed vs expected bags
- [ ] Reinspect after Fail still requires no active bay assignment; clears `qc_failed_bags`
- [ ] Resample during unload still cancels assignment; clears `qc_failed_bags`

### Phase 2

- [ ] Authorized user can update `qc_failed_bags` during active unload
- [ ] Updated count reflected immediately in warning surfaces
- [ ] Override-to-fail requires `failed_bags`

### Phase 3 (after PO sign-off)

- [ ] Scale-out / gate-out behaviour documented and implemented per §13
- [ ] Destination stock credits accepted quantity only (if OQ-2 = yes)

---

## 12. Distinction from related flows

| Flow | When | FB-013 interaction |
|------|------|-------------------|
| **Initial Fail + unload** | After sample, before/during yard | Fail **unblocks** assign; warning on unload |
| **Reinspect after Fail** | Fail recorded, **no** bay yet | Clears bags; back to sampling — unchanged guard |
| **Resample** | During unload after **Pass** | Cancels unload; clears bags — unchanged |
| **Override pass→fail** | During unload after Pass | Cancels unload; **requires** `failed_bags`; may re-assign per FB-013 |
| **FB-001 multi-LUP** | Same visit, multiple points | Warning is **TO-level**; same failed-bag count at every point (Phase 1) |

---

## 13. Open questions (PO — before Phase 3)

| ID | Question | Default if silent |
|----|----------|-------------------|
| OQ-1 | After QC Fail + unload complete, may vehicle **scale-out** and **gate-out** without a subsequent Pass? | **Yes** — align guards with unload-unblocked policy |
| OQ-2 | Destination **stock** credits `unloaded accepted` only (`received − qc_failed_bags`)? | **Yes** — coordinate with FB-012 trigger |
| OQ-3 | **Per-line** failed bags vs TO-level aggregate? | Phase 1 = TO-level; per-line deferred |
| OQ-4 | **Weight-only** TOs (no bag UOM) — support `failed_weight_mt` on Fail? | Fail bag capture **not allowed** until MT path defined |
| OQ-5 | **Total reject** (`failed_bags == total`) — same unload flow or quarantine workflow? | Same flow with maximum warning |

---

## 14. Cross-references

| Document | Relationship |
|----------|--------------|
| [qc-operations-sprint4.md](./qc-operations-sprint4.md) | Baseline spec — §0, §3.2, §4.2, §7, §9 amended by this v2 |
| [command-center-loading-sprint4.md](./command-center-loading-sprint4.md) | §2.3, §3.4 QC Fail row; CC eligibility |
| [command-center-multi-lup-assignment-fb001.md](./command-center-multi-lup-assignment-fb001.md) | §Locked decisions QC gate row — amend to "after QC decision (Pass or Fail with bags)" |
| [stock-operations-sprint5.md](./stock-operations-sprint5.md) | FB-012 stock trigger; Phase 3 net-good quantity |
| [feedback-resolution.md](../../03-backlog/sprints/sprint-6/feedback-resolution/README.md) | FB-013 tracker |
| [E2E-01](../../03-backlog/sprints/sprint-6/01-e2e-hardening/E2E-01-sprint3-to-5-e2e-coverage.md) | RM inbound fail branch |

---

**Last Updated**: 2026-07-07
