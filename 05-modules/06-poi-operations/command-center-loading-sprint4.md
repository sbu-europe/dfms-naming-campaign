---
module: 06-poi-operations
specification: Command Center, Loading/Unloading & QC Operations (Sprint 4 — TO-Centric)
version: 1.5
phase: Phase 1
sprint: Sprint 4 (baseline) + Sprint 5 carry-over (FB-005, FB-006, CC-01 APIs)
last_updated: 2026-06-11
changelog: "v1.5 — CC queue serial (issued at scale-in, SC-01 v1.4): `queue_token.serial_number` (`CC-{POI_CODE}-{YYYYMMDD}-{seq:03d}`, per-POI UTC daily) shown as first sortable column on the CC queue and in the bay-assignment TO dropdown; per-LUP WaitingSerial unchanged. v1.4 — CC bay-assignment LUP traffic panel: implementation plan §11.10; FB-005 status reconciled with codebase (service + LD done; CC panel + REST pending). v1.3 — LD-01 admin start UX: LUP dropdown → serial-ordered clickable queue table → bay_assignment (admin only; LUP not persisted on events). v1.2 — FB-005 bay concurrency + UTC serials. v1.1 — product-line QC at scale-in."
related_stories: DFS-056 (CC-01), DFS-057 (LD-01), DFS-058 (QC-01)
feedback_items: FB-005 (bay concurrency + serials), FB-006 (product-line QC)
jira_epic: DFS-072
---

# Command Center, Loading/Unloading & QC Operations (Sprint 4)

## Overview

This specification covers three tightly coupled modules in the yard chain:

- **CC-01 (Command Center)**: Queue management from scale-in token, bay/line assignment, waiting serial issuance. Every scaled-in vehicle arrives on the queue already carrying a **CC queue serial** (`queue_token.serial_number`, per-POI UTC daily sequence issued by SC-01 at scale-in — v1.5) which orders the queue FIFO and is the CCO's handle for assigning loading/unloading points. A loading/unloading point may serve **multiple vehicles concurrently** (FB-005); each assignment gets a **daily UTC waiting serial** for that point. On bay assignment, the CCO must see **traffic at the selected L/U point** (active assignments, serial order) — §6.2, §11.10. For RM inbound when **any** product line requires QC (`Product.requires_qc` via `to_requires_qc_from_lines`), scale-in **automatically** sets `flagged_for_qc` — CC does not assign an unloading point until QC Pass; after Pass, **CC Officer** assigns the unloading point (not QC Supervisor).
- **LD-01 (Loading/Unloading)**: Start/end timestamps, bags/weight/seal capture against an assigned bay. **Admin start flow (Sprint 5)**: personnel pick **loading/unloading point** → see **serial-ordered queue** at that point → click row to select TO → start event (`bay_assignment` only persisted). Loading events fire for FG outbound; unloading events fire for FG inbound and RM inbound.
- **QC-01 (QC Checkpoint)**: RM inbound only. Sample creation → Pass/Fail decision only. On Pass the TO is marked `qc_passed=True` and CC is unblocked to assign the unloading point. Resample and override-to-failed cancel the active CC unloading assignment during unloading.

**Module paths**: `apps/operations/command_center/`, `apps/operations/loading/`, `apps/quality/checkpoint/`  
**Dependencies**: `apps/operations/scaling/` (QueueToken, WeighingSession), `apps/master_data/` (LoadingUnloadingPoint), `apps/transport/` (TransportOrder, FlowLane, TOStatus), **`YARD-01`** (YardAdminBase, yard_poi, UserOperationalPOI, TOSubState)  
**Enables**: Scale-out prerequisite (LD-01 completion), gate-out guard matrix (GT-01), TO closure (POD-01)

### Codebase baseline (June 2026)

| Path | Exists | Notes |
|------|--------|-------|
| `apps/operations/command_center/views.py` | ✓ | `CommandCenterDashboardView` (legacy counts), `ActiveTripsView` — **no** CC-01 REST APIs yet |
| `apps/operations/command_center/models.py` | ✓ | `QueueEntry`, `BayAssignment`, `WaitingSerial`, `WaitingSerialSequence` (FB-005) |
| `apps/operations/command_center/services.py` | ✓ | `active_assignments_for_lup`, `assignments_startable_at_lup`, UTC serial allocator; LUP exclusivity removed |
| `apps/operations/command_center/admin.py` | ✓ | Queue + bay assignment admin; TO details AJAX on add form — **LUP traffic panel not wired** (§11.10) |
| `apps/operations/loading/admin_queue.py` | ✓ | Shared `render_queue_table_html` — reused by LD-01; **to be reused by CC-01** traffic panel |
| `apps/operations/loading/models.py` | ✓ | `LoadEvent`, `UnloadEvent`; legacy `LoadingOperation` linked to `GateEntry` — **do not extend** |
| `apps/operations/loading/admin.py` | ✓ | `LoadEventAdmin`, `UnloadEventAdmin` — point-first queue table on add form (FB-005-6 / LD-01-6) |
| `apps/quality/checkpoint/` | ✓ | `QCSample`, `QCDecision`, QC admin + services |

All new Sprint 4 models use **separate migration files** so legacy `LoadingOperation` and `GateEntry`-linked models are untouched.

---

## 0. Per-Lane Yard Chain Summary

Understanding which module acts at each step per lane removes ambiguity for admin implementations:

| Step | FG outbound | FG inbound | RM inbound |
|------|------------|-----------|-----------|
| After gate-in | `at_source` | `at_destination` | `at_destination` |
| Scale-in (SC-01) | sub: `scale_in` → `waiting_cc` | sub: `scale_in` → `waiting_cc` | sub: `scale_in` → `waiting_cc` **or** `flagged_for_qc` (see below) |
| CC queue visible | ✓ | ✓ | ✓ |
| QC required? (product lines) | — | — | `to_requires_qc_from_lines(to)` — **not** all RM inbound by lane |
| Post scale-in (RM, QC required) | — | — | `CCService.create_queue_entry` sets `requires_qc=True`; TLS-01 sub: `flagged_for_qc` (auto; no CC action) |
| Post scale-in (RM, QC not required) | — | — | `requires_qc=False`; sub: `waiting_cc`; CC may assign unloading immediately |
| CC assigns unloading (RM) | — | — | Only after QC Pass (`qc_passed=True` on queue entry + TO) |
| **CC assigns loading point** | ✓ → sub: `assigned_loading_point` | — | — |
| **QC: sample + pass** (QC-01) | — | — | sub: `qc_passed`; TO returns to CC queue |
| **CC assigns unloading point** | — | ✓ → sub: `assigned_unloading_point` | ✓ → sub: `assigned_unloading_point` (CC does this after QC Pass) |
| Loading start/end (LD-01) | ✓ `LoadEvent` | — | — |
| Unloading start/end (LD-01) | — | ✓ `UnloadEvent` | ✓ `UnloadEvent` |
| Scale-out (SC-01) | gates: loading complete | gates: unloading complete | gates: unloading complete + QC pass |
| Gate-out (GT-01) | guard: scale-out + loading | guard: scale-out + unloading | guard: scale-out + unloading + QC pass |

---

## 1. Data Model

### 1.1 QueueEntry (new model — extends `TenantAwareModel`)

**Created directly by `CCService.create_queue_entry()`** called from `ScaleInService.record_scale_in()` within the same `atomic()` block — **not** by a signal or webhook (YARD-01 transactional consistency requirement).

```python
QueueEntry(TenantAwareModel) {
    id: UUID (PK)

    queue_token: FK → QueueToken (OneToOne)
    transport_order: FK → TransportOrder
    poi: FK → POI

    status: enum ['waiting', 'assigned', 'completed']
    # waiting   → scale-in done, waiting for bay assignment
    # assigned  → BayAssignment created
    # completed → LoadEvent/UnloadEvent completed

    requires_qc: boolean (default False)
    # True when to_requires_qc_from_lines(transport_order) at create_queue_entry
    # (any TOLineItem → Product.requires_qc). NOT lane-wide RM_INBOUND default.

    # YARD-01 AC-6: QC pass flag for RM inbound
    qc_passed: boolean (null=True, blank=True)
    # null  → N/A (FG lanes, or RM before QC decision)
    # True  → QC passed — CC can assign unloading point
    # False → QC failed or resampled — CC unloading point blocked

    created_at: DateTime
}
```

**Queue serial (v1.5)**: `QueueEntry` has **no serial field of its own** — the CC queue serial lives on the linked token and is read via `queue_entry.queue_token.serial_number` (see [scaling-operations-sprint4.md](./scaling-operations-sprint4.md) §1.4–1.5).

**Two serials — do not conflate**:

| | CC queue serial (v1.5) | Waiting serial (FB-005) |
|---|---|---|
| Issued at | Scale-in (`ScaleInService.record_scale_in`) | Bay assignment (`CCService.assign_bay`) |
| Lives on | `QueueToken.serial_number` | `WaitingSerial.serial_number` |
| Scope | Daily sequence **per POI** | Daily sequence **per LoadingUnloadingPoint** |
| Format | `CC-{POI_CODE}-{YYYYMMDD}-{seq:03d}` | `{POINT_CODE}-{YYYYMMDD}-{seq:03d}` |
| Purpose | FIFO order of the CC queue; printed on token slip | Vehicle order at an assigned L/U point |

### 1.2 BayAssignment (new model — extends `TenantAwareModel`)

Records which loading/unloading point is assigned to a vehicle visit.

```python
BayAssignment(TenantAwareModel) {
    id: UUID (PK)

    queue_entry: FK → QueueEntry (OneToOne)
    transport_order: FK → TransportOrder
    loading_unloading_point: FK → LoadingUnloadingPoint

    # waiting_serial FK removed — see YARD-01 §7.3 circular FK fix below

    assigned_by: FK → User (CC Officer)
    assigned_at: DateTime

    # FB-005: is_active = THIS vehicle's assignment is open (not "LUP exclusively occupied").
    # Multiple rows may be is_active=True on the same loading_unloading_point.
    # Closed by LD-01 complete (mark_completed) or QC cancel (resample / override-fail).
    is_active: boolean (default True)
    cancelled_at: DateTime (nullable)
    cancelled_by: FK → User (nullable)
    cancellation_reason: text (nullable)   # used when QC triggers resample
}
```

### 1.3 WaitingSerial (new model — extends `TenantAwareModel`)

One immutable waiting serial per `BayAssignment`. Issued **atomically inside** `CCService.assign_bay()` (not a separate manual step).

**YARD-01 §7.3 fix**: `WaitingSerial` owns the FK to `BayAssignment` (not the reverse). The previous design had a FK on both sides, creating a circular create-order deadlock. Access the serial from `assignment.waiting_serial` via the reverse `OneToOne` relation.

**FB-005 serial rules**:

- Format: `{POINT_CODE}-{YYYYMMDD}-{seq:03d}` (e.g. `BAY-01-20260603-002`).
- `{YYYYMMDD}` = **UTC calendar date** at issue time (`timezone.now().astimezone(UTC).date()`).
- `{seq}` = daily sequence **per LoadingUnloadingPoint**; resets to `001` at **00:00 UTC** (new date key).
- `serial_number` is **globally unique** in DB (existing `uq_waiting_serial_number`); historical rows are never rewritten.

```python
WaitingSerial(TenantAwareModel) {
    id: UUID (PK)

    # WaitingSerial holds the FK — BayAssignment has no waiting_serial FK
    bay_assignment: FK → BayAssignment (OneToOne, related_name='waiting_serial')
    serial_number: string (unique globally — format above)
    issued_at: DateTime
    issued_by: FK → User
}
```

### 1.3.1 WaitingSerialSequence (FB-005 — extends `TenantAwareModel`)

Concurrency-safe daily counter per L/U point. Incremented inside `assign_bay` with `select_for_update()` in the same transaction as `WaitingSerial` creation.

```python
WaitingSerialSequence(TenantAwareModel) {
    id: UUID (PK)

    loading_unloading_point: FK → LoadingUnloadingPoint (PROTECT)
    serial_date: DateField   # UTC date (not local POI time)
    last_seq: PositiveIntegerField (default 0)

    # UniqueConstraint(loading_unloading_point, serial_date)
}
```

**Allocator** (`CCService._next_serial_number` or dedicated helper):

1. Resolve `serial_date` in UTC.
2. `get_or_create` sequence row for `(lup, serial_date)` with row lock.
3. `last_seq += 1`; persist.
4. Return `f"{lup.short_code}-{serial_date:%Y%m%d}-{last_seq:03d}"`.

Replaces the Sprint 4 `count() + 1` prefix scan (racy under concurrent assigns).

### 1.4 LoadEvent (new model — extends `TenantAwareModel`)

FG outbound only.

```python
LoadEvent(TenantAwareModel) {
    id: UUID (PK)

    bay_assignment: FK → BayAssignment
    transport_order: FK → TransportOrder

    start_datetime: DateTime (required)
    end_datetime: DateTime (nullable — null until loading complete)

    bags_loaded: PositiveInteger (nullable)
    weight_loaded_mt: Decimal(10, 3) (nullable)
    seal_number: string (max 50, nullable)

    notes: text (nullable)
    created_by: FK → User
    updated_by: FK → User (nullable)
}
```

**Constraint**: `end_datetime >= start_datetime` (form-level `clean()`)

### 1.5 UnloadEvent (new model — extends `TenantAwareModel`)

FG inbound and RM inbound.

```python
UnloadEvent(TenantAwareModel) {
    id: UUID (PK)

    bay_assignment: FK → BayAssignment
    transport_order: FK → TransportOrder

    start_datetime: DateTime (required)
    end_datetime: DateTime (nullable)

    bags_unloaded: PositiveInteger (nullable)
    weight_unloaded_mt: Decimal(10, 3) (nullable)

    # QC context for RM TOs
    qc_sample_taken: boolean (default False)
    notes: text (nullable)

    # YARD-01 AC-6: resample cancellation flag
    cancelled_by_resample: boolean (default False)
    # True when QC-01 resample or override-to-fail triggered BayAssignment cancellation
    # during active unloading. end_datetime remains null.

    created_by: FK → User
    updated_by: FK → User (nullable)
}
```

### 1.6 QCSample (new model — extends `TenantAwareModel`)

RM inbound only. Created by QC Supervisor after scale-in.

```python
QCSample(TenantAwareModel) {
    id: UUID (PK)

    transport_order: FK → TransportOrder
    sample_id: string (auto-generated: 'QC-{TO_NUMBER}-{seq:02d}')
    physical_analysis: text (nullable)
    remarks: text (nullable)
    sampled_at: DateTime (auto = now)
    created_by: FK → User (QC Supervisor / Inspector)
}
```

### 1.7 QCDecision (new model — extends `TenantAwareModel`)

RM inbound only. One active decision per TO at any time (previous superseded on resample).

```python
QCDecision(TenantAwareModel) {
    id: UUID (PK)

    transport_order: FK → TransportOrder
    qc_sample: FK → QCSample
    decision: enum ['pass', 'fail']

    # No unloading_point FK here — CC assigns the unloading point via BayAssignment after QC Pass

    is_active: boolean (default True)
    # Set to False when resample is triggered; new sample + decision replace

    decided_at: DateTime
    decided_by: FK → User (QC Supervisor)
    remarks: text (nullable)
}
```

---

## 2. TO Status Progression

### 2.1 CC-01 TO status (queue → bay assignment)

CC-01 does not advance the top-level `TO.status` — it writes sub-state events to TLS-01.

| Flow Lane | Action | Sub-state written |
|-----------|--------|-------------------|
| FG outbound | CC assigns loading point | `assigned_loading_point` |
| FG inbound | CC assigns unloading point | `assigned_unloading_point` |
| RM inbound | Scale-in + queue creation (QC required) | `flagged_for_qc` (auto; no unloading point assigned) |
| RM inbound | Scale-in + queue creation (QC not required) | `waiting_cc` (CC may assign unloading point) |

### 2.2 LD-01 TO status (load/unload events)

| Action | Flow Lane | Sub-state written |
|--------|-----------|-------------------|
| Loading started | FG outbound | `loading_started` |
| Loading completed | FG outbound | `loading_completed` |
| Unloading started | FG inbound / RM inbound | `unloading_started` |
| Unloading completed | FG inbound / RM inbound | `unloading_completed` |

Loading/unloading completion is a **pre-condition gate for scale-out** (SC-01 §2.2).

### 2.3 QC-01 TO status (RM inbound only)

| Action | Sub-state written | Side effects |
|--------|-------------------|--------------|
| QC sample created | `sampling_started` | — |
| QC Pass recorded | `qc_passed` | TO marked `qc_passed=True`; TO re-enters CC queue; **CC Officer assigns unloading point** via BayAssignment |
| QC Fail recorded | `qc_failed` | Unloading blocked; scale-out blocked; gate-out blocked |
| Resample triggered (during unloading) | `resampling` | Active BayAssignment cancelled; UnloadEvent.end_datetime remains null; TO returns to CC queue |
| Override to failed (during unloading) | `qc_failed` | BayAssignment cancelled; gate-out blocked |

---

## 3. Command Center Flow (CC-01)

### 3.1 Queue dashboard

```
CC Officer opens Command Center → Queue
  └─► List of QueueEntry rows where status='waiting', poi=officer's POI
        ├─► Columns: Serial (queue_token.serial_number — sortable, FIFO), Token Number, TO Number, Vehicle, Flow Lane badge, Gross Weight, Requires QC badge, Waiting Since
        ├─► Filter: requires_qc (All / Yes / No), flow_lane
        ├─► RM + requires_qc + qc_passed unset: row shows **Awaiting QC** (no Assign Bay)
        └─► [Assign Bay] when requires_qc=False OR qc_passed=True
```

### 3.2 Bay assignment — FG outbound

```
CC Officer clicks [Assign Bay] for FG outbound QueueEntry
  └─► Bay Assignment add form (admin):
        ├─► Transport order: dropdown or deep-link from queue; TO summary panel (AJAX)
        ├─► Loading Point: dropdown — active LOAD points at POI (FB-005: **includes points
        │     that already have other active assignments**)
        ├─► **Traffic at selected point** (read-only panel — §6.2, §11.10):
        │     active BayAssignments at chosen LUP, ordered by waiting_serial.serial_number
        │     columns: Waiting Serial | TO Number | Vehicle | (optional) yard status
        │     empty LUP → "No vehicles assigned at this point."
        └─► [Save / Assign]
              └─► CCService.assign_bay(queue_entry, loading_point, assigned_by):
                    ├─► Validate eligibility (QC, lane/op_type, POI) — **no LUP exclusivity**
                    ├─► Create BayAssignment (is_active=True)
                    ├─► Auto-issue WaitingSerial (UTC daily seq via WaitingSerialSequence)
                    ├─► QueueEntry.status = 'assigned'
                    ├─► Emit BAY_ASSIGNED event → TLS-01 (sub: assigned_loading_point)
                    └─► Success: serial number displayed
```

### 3.3 Bay assignment — FG inbound

Same flow as FG outbound (including **traffic at selected point** panel), using `operation_type=UNLOAD` points. CC directly assigns unloading point.

```
CCService.assign_bay(queue_entry, unloading_point, assigned_by):
    ├─► Create BayAssignment + WaitingSerial
    ├─► QueueEntry.status = 'assigned'
    └─► Emit BAY_ASSIGNED → TLS-01 (sub: assigned_unloading_point)
```

### 3.4 RM inbound — product-line QC trigger and auto-flag (no bay assignment until QC Pass)

**QC required when:** `to_requires_qc_from_lines(transport_order)` is True — i.e. **any** `TOLineItem` resolves to a product with `Product.requires_qc=True` (gate lines: `line.product`; planner lines: `tr_line_item → pr_line_item → product`). See `apps/transport/services.py` and [gate-operations-sprint4.md](./gate-operations-sprint4.md) §2.6.

**At scale-in (same `atomic()` as `ScaleInService.record_scale_in`):**

```
ScaleInService.record_scale_in(...)        # queue_token arrives with serial_number already issued (SC-01 v1.4)
  └─► CCService.create_queue_entry(weighing_session, queue_token, actor):
        ├─► requires_qc = to_requires_qc_from_lines(transport_order)
        ├─► Sync TransportOrder.requires_qc if derived value differs (denormalized aggregate)
        ├─► QueueEntry created: status='waiting', requires_qc, qc_passed=null
        └─► TLS-01 terminal sub-state after leg-specific scale_in_*:
              ├─► If requires_qc: record_yard_sub_state(..., flagged_for_qc, source_module scaling|command_center)
              │     └─► TO visible in QC Supervisor queue (QC-01); CC does NOT assign unloading point
              └─► Else: record_yard_sub_state(..., waiting_cc)
                    └─► CC may assign unloading point immediately (E2E-03 negative case)
```

**CC Officer queue behaviour (no manual flag step):**

- Rows with `requires_qc=True` and `qc_passed is null`: display **Awaiting QC** — no `[Flag for QC]` on the happy path (Sprint 4 manual flag deprecated; optional break-glass admin only if retained in code).
- CC **cannot** assign an unloading point until QC Pass: `eligible_for_bay_assignment` requires `qc_passed is True` when `requires_qc=True`.

**After QC Pass:**

```
QCService.record_decision(decision='pass')
  ├─► TransportOrder.qc_passed = True
  ├─► CCService.requeue_after_qc(queue_entry, qc_passed=True)  # status stays waiting
  ├─► TLS-01 sub: qc_passed
  └─► CC Officer uses [Assign Bay] (§3.3, UNLOAD points) → assigned_unloading_point
```

If QC fails or is pending, gate-out and bay assignment remain blocked (see §8, GT-01 guard matrix).

### 3.5 FB-005 — Multiple vehicles per L/U point (summary)

| Topic | Rule |
|-------|------|
| Concurrent vehicles per LUP | **No cap** — many `BayAssignment(is_active=True)` on the same point |
| Per visit | Still **one** `BayAssignment` per `QueueEntry` (OneToOne) |
| Serial | One per assignment; issued in `assign_bay`; immutable |
| Daily reset | Sequence restarts at **00:00 UTC** per LUP |
| Crew display order | **Ascending `waiting_serial.serial_number`** (my-bay API, assignment lists) |
| Completing one vehicle | `mark_completed` sets **that** assignment `is_active=False` only — does not free the LUP for others |
| LD start (admin) | LUP dropdown → serial queue table → `bay_assignment` — **§4.0**, **§11.9** (shipped) |
| CC assign (admin) | TO summary + LUP dropdown → **traffic panel** at selected LUP — **§6.2**, **§11.10** (pending) |

Full implementation plan: **§11**.

---

## 4. Loading/Unloading Flow (LD-01)

### 4.0 LD start UX — locked decisions (Sprint 5, admin only)

| Topic | Decision |
|-------|----------|
| Surface | **Django admin only** (LoadEvent / UnloadEvent add forms); REST/mobile two-step deferred |
| Step 1 | Dropdown: **all active** `LoadingUnloadingPoint` at operator's POI (`is_active=True`) |
| Step 1 scope | **Load** admin → `operation_type=LOAD`; **Unload** admin → `operation_type=UNLOAD` (include empty bays) |
| Step 2 | **Read-only table** at selected LUP; **click row** selects assignment/TO |
| Row columns (order) | **Waiting serial** → **TO number** → **Vehicle** (optional: sub-state badge for RM) |
| Row sort | `waiting_serial__serial_number` ascending (FB-005) |
| Row eligibility | Active `BayAssignment` at LUP, lane/leg rules per screen, **no open** `LoadEvent`/`UnloadEvent` on that assignment |
| Persistence | **`bay_assignment` only** on `LoadEvent`/`UnloadEvent` — LUP is form navigation, **not** a model field |
| Deep link | `?bay_assignment=<uuid>` → infer LUP, pre-select dropdown, highlight row |
| Change form (complete) | Unchanged: readonly `bay_assignment`, end datetime + captures |

Implementation detail: §6.3, §6.4, §11.9.

### 4.1 Loading (FG outbound) — start (admin)

```
Loading Personnel opens Load Event → Add
  └─► Step 1: Select Loading Point (dropdown — all active LOAD points at POI)
  └─► Step 2: Queue at this point (read-only table, serial-ordered)
        ├─► Rows: serial | TO number | vehicle
        ├─► Click row → sets hidden bay_assignment + refreshes TO details panel
        └─► Empty LUP → "No vehicles assigned at this point."
  └─► Step 3: Start Datetime (default=now) + TO details panel (lines, weight context)
  └─► [Save Start]
        └─► LDService.start_loading(bay_assignment, start_datetime)
              ├─► Create LoadEvent (end_datetime=null)
              └─► Emit LOADING_STARTED → TLS-01 (sub: loading_started)

  [Later] Loading Personnel opens existing LoadEvent (change):
  └─► bay_assignment readonly; enter End Datetime, bags, weight, seal
  └─► LDService.complete_loading → LOADING_COMPLETED; QueueEntry completed; scale-out gate
```

### 4.2 Unloading (FG inbound and RM inbound) — start (admin)

Same **three-step** pattern as §4.1 with **Unloading Point** dropdown (`operation_type=UNLOAD`) and unload-eligible `BayAssignment` queryset (FG inbound, RM inbound, FG outbound destination leg per existing rules).

```
Unload Event → Add
  └─► Unloading Point (dropdown — all active UNLOAD @ POI)
  └─► Queue table → click row → bay_assignment
  └─► Start Datetime + TO details (+ RM QC context in panel where applicable)
  └─► LDService.start_unloading → UNLOADING_STARTED

  [Later] complete unload → UNLOADING_COMPLETED (+ RM scale-out needs QC pass)
```

### 4.3 Relationship to CC / FB-005

| Layer | Role |
|-------|------|
| CC `assign_bay` | Creates `BayAssignment` + `WaitingSerial` at LUP |
| LD admin queue table | **Consumes** assignments at chosen LUP; does not create assignments |
| `GET my-bay` (CC-01-8, later) | Same list contract as step-2 table; admin proves UX before API |

---


## 5. QC Checkpoint Flow — RM Inbound Only (QC-01)

### 5.1 QC sample creation

```
QC Supervisor opens QC Checkpoint → My Queue
  └─► List of TOs with sub_state='flagged_for_qc' at supervisor's POI
        └─► [Create Sample] for a TO
              ├─► Enter: Physical Analysis (text), Remarks (optional)
              └─► [Submit Sample]
                    └─► QCService.create_sample(to, analysis, remarks, created_by):
                          ├─► Create QCSample (sample_id auto-generated)
                          ├─► Emit SAMPLING_STARTED → TLS-01 (sub: sampling_started)
                          └─► TO now awaiting QC decision
```

### 5.2 QC decision — Pass

```
QC Supervisor submits Pass decision
  └─► Select: QC Sample (FK)
  └─► Decision: Pass
  └─► Remarks (optional)
  └─► [Submit Decision]
        └─► QCService.record_decision(sample, 'pass', decided_by):
              ├─► Create QCDecision (decision='pass', is_active=True)
              ├─► Emit QC_PASSED → TLS-01 (sub: qc_passed)
              ├─► QueueEntry.status = 'waiting' (re-enters CC queue, now unblocked)
              └─► CC Officer can now assign unloading point via [Assign Bay] (§3.3)
                    (no BayAssignment created here — that is CC's step)
```

### 5.3 QC decision — Fail

```
QC Supervisor submits Fail decision
  └─► Decision: Fail + Remarks (required on fail)
  └─► [Submit Decision]
        └─► QCService.record_decision(sample, 'fail', unloading_point=None, decided_by):
              ├─► Create QCDecision (decision='fail', is_active=True)
              ├─► Emit QC_FAILED → TLS-01 (sub: qc_failed)
              ├─► Unloading blocked (no BayAssignment created)
              ├─► Scale-out blocked (gate-out guard matrix: qc_not_failed check fails)
              └─► Gate-out blocked
```

### 5.4 Resample (during unloading)

```
QC Supervisor triggers Resample while UnloadEvent is active (start_datetime set, end_datetime null)
  └─► [Trigger Resample] action on active UnloadEvent or QCDecision
        └─► QCService.trigger_resample(to, triggered_by):
              ├─► QCDecision.is_active = False (supersede current decision)
              ├─► BayAssignment.is_active = False, cancelled_at = now, reason = 'resample'
              ├─► UnloadEvent: if active (no end_datetime) → cleared (end_datetime remains null)
              ├─► QueueEntry.status = 'waiting' (back to CC queue for re-flagging)
              ├─► Emit RESAMPLING_TRIGGERED → TLS-01 (sub: resampling)
              └─► New QCSample + QCDecision cycle begins (§5.1)
```

### 5.5 Override to failed (during unloading)

```
QC Supervisor overrides decision to Fail while unloading is active
  └─► [Override to Failed] action on active QCDecision
        └─► QCService.override_to_failed(qc_decision, overridden_by, remarks):
              ├─► QCDecision.decision = 'fail', remarks updated, is_active = True
              ├─► BayAssignment.is_active = False, cancelled_by = supervisor
              ├─► UnloadEvent: end_datetime remains null (unloading cancelled)
              ├─► Emit QC_OVERRIDDEN_FAIL → TLS-01 (sub: qc_failed)
              └─► Scale-out and gate-out blocked
```

---

## 6. Django Admin Configuration

### UI — design system consistency (required)

All command-center, loading, and unloading admin screens must match the **existing DFMS Django admin shell** (Sprint 1 PAP-01). Reuse gate/scaling badge and panel patterns — do not introduce parallel CSS, badge colours, or pagination markup.

| Asset | Purpose |
|-------|---------|
| `static/admin/css/custom.css` | Tokens, light/dark theme, tables, cards, buttons, pagination |
| `static/admin/js/dfms_theme.js` | Theme toggle |
| `templates/admin/dynamic_pagination_changelist.html` | Via `CCAdminBase` / `LoadEventAdminBase` / `UnloadEventAdminBase` → `YardAdminBase` |
| `DFMS-product-context/07-design-system/02-components/data-display.md` | Badge catalogue for queue, QC, and bay-assignment states |
| `.cursor/rules/django-admin-draft-submit.mdc` | Buttons and breadcrumbs |

**Required patterns**

1. **Mixin stack**: Each module base → `YardAdminBase` → `DynamicPaginationMixin`.
2. **Status badges**: `_QUEUE_STATUS_BADGE` and QC decision badges use existing `dfms-badge--*` modifiers; no inline colours.
3. **Buttons**: Bay assign, complete load/unload, and QC override actions use `dfms-btn-*` from `custom.css`.
4. **Tables & cards**: Queue and bay changelists use default `#result_list`; assignment detail panels follow gate readonly-panel style.
5. **Pagination**: Shared per-page control on all queue and event changelists.
6. **Light/dark mode**: Test CC queue, bay board, load/unload forms, and embedded QC lists in both themes.
7. **Custom templates**: Only where assign/complete actions need extra buttons; extend admin bases and inherit theme tokens.

### 6.0 YARD-01 integration: admin base and POI resolution

All CC, LD, and QC admin classes inherit **`YardAdminBase`** from `apps/operations/admin_base.py` (YARD-01 Step 5). Create one base per module:

```python
# apps/operations/command_center/admin.py
from apps.operations.admin_base import YardAdminBase
from apps.core.constants_rbac import PermissionCodes

class CCAdminBase(YardAdminBase):
    operator_role_code    = "command_center_officer"  # matches SEED_ROLES / SYSTEM_ROLE_CODES
    supervisor_role_codes = frozenset({"gate_supervisor", "tenant_admin"})
    read_perm  = PermissionCodes.OPERATIONS_GATE_ENTRY_READ   # replace with CC-specific perm once added
    write_perm = PermissionCodes.OPERATIONS_GATE_ENTRY_CREATE

# apps/operations/loading/admin.py
# Loading and unloading are SEPARATE roles in SEED_ROLES — each admin has its own base.
class LoadEventAdminBase(YardAdminBase):
    operator_role_code    = "loading_personnel"       # matches SEED_ROLES / SYSTEM_ROLE_CODES
    supervisor_role_codes = frozenset({"gate_supervisor", "tenant_admin"})
    read_perm  = PermissionCodes.OPERATIONS_GATE_ENTRY_READ
    write_perm = PermissionCodes.OPERATIONS_GATE_ENTRY_CREATE

class UnloadEventAdminBase(YardAdminBase):
    operator_role_code    = "unloading_personnel"     # matches SEED_ROLES / SYSTEM_ROLE_CODES
    supervisor_role_codes = frozenset({"gate_supervisor", "tenant_admin"})
    read_perm  = PermissionCodes.OPERATIONS_GATE_ENTRY_READ
    write_perm = PermissionCodes.OPERATIONS_GATE_ENTRY_CREATE
```

**POI resolution**: all `formfield_for_foreignkey` overrides use `self._scope_poi_id(request)` (inherited from `YardAdminBase`) instead of a bespoke `get_poi_for_operator(request)` call. This ensures consistency and the fail-closed empty-queryset behaviour for unassigned operators.

**`get_queryset`**: `YardAdminBase.get_queryset` filters by `poi_id=self._scope_poi_id(request)` for operator roles. CC queue lists `QueueEntry` with `status=waiting` at the officer's POI (includes RM rows **Awaiting QC** with `sub_state=flagged_for_qc` and rows ready for bay assignment with `waiting_cc` or `qc_passed`).

### 6.1 QueueEntryAdmin (CC-01-2)

Uses `CCAdminBase` (→ `YardAdminBase`). **Primary working screen for CC Officer**.

**List View (Queue Dashboard)**:
- Columns: **Serial** (first — `queue_token__serial_number`, sortable for FIFO working order; "—" on pre-feature entries), Token Number, TO Number, Vehicle, Flow Lane badge, Gross Weight, Requires QC badge, Waiting Since, Status badge
- Filters: `status`, `requires_qc`, `poi`, `created_at` (date range)
- Search: TO number, Vehicle registration, Token number, **Queue serial** (`queue_token__serial_number`)

**Status badge colours**:
```python
_QUEUE_STATUS_BADGE = {
    "waiting":   ("dfms-badge--awaiting-dispatch", "bi-hourglass-split", "Waiting"),
    "assigned":  ("dfms-badge--in-progress",       "bi-signpost-2",      "Assigned"),
    "completed": ("dfms-badge--approved",           "bi-check-circle",    "Completed"),
}
```

**Custom admin action: Assign Bay (FG outbound / FG inbound)**:

```python
@admin.action(description="Assign Loading/Unloading Point")
def assign_bay(self, request, queryset):
    # Only valid for single-row selection; fail loudly on multi-select
    if queryset.count() != 1:
        self.message_user(request, "Select exactly one queue entry.", level=messages.ERROR)
        return
    entry = queryset.first()
    if not CCService.eligible_for_bay_assignment(entry):
        self.message_user(
            request,
            "Bay assignment blocked while QC is required and not passed.",
            level=messages.WARNING,
        )
        return
    # Redirect to BayAssignmentAdmin add view with queue_entry pre-filled
    return redirect(f"..../bayassignment/add/?queue_entry={entry.pk}")
```

**Changelist actions (RM inbound):** No **Flag for QC** bulk action on the happy path — QC flagging occurs automatically at scale-in when `requires_qc=True`. Optional break-glass `CCService.flag_for_qc` may remain for recovery only.

### 6.2 BayAssignmentAdmin (CC-01-3)

Uses `CCAdminBase` (→ `YardAdminBase`). Template: `templates/admin/operations/bayassignment/change_form.html`. JS: `static/admin/js/cc_queue_entry_details.js`.

**Add form (current + target)**:

| Widget | Status | Behaviour |
|--------|--------|-----------|
| `queue_entry` | ✓ Shipped | Filtered to bay-assignable entries at officer POI; label shows TO + vehicle + token + **queue serial** (when set — v1.5) |
| TO summary panel (`#cc-to-details-panel`) | ✓ Shipped | AJAX `GET …/queue-entry-details/<qe_id>/` — refreshes on TO change |
| `loading_unloading_point` | ✓ Shipped | Scoped by flow lane + POI; AJAX `GET …/queue-entry-lups/<qe_id>/` refreshes options on TO change; **does not exclude occupied LUPs** (FB-005) |
| **LUP traffic panel** (`#cc-lup-traffic-panel`) | **Pending** (§11.10) | Read-only table of **all** active assignments at selected LUP via `CCService.active_assignments_for_lup`; refreshes on LUP change |
| LUP option labels | **Pending** (optional) | Append active-vehicle count, e.g. `BAY-01 — Line A (2 vehicles)` |

**`loading_unloading_point` queryset** — `formfield_for_foreignkey`:

```python
def formfield_for_foreignkey(self, db_field, request, **kwargs):
    if db_field.name == "loading_unloading_point":
        poi_id = self._scope_poi_id(request)  # from YardAdminBase
        queue_entry_id = request.GET.get("queue_entry")
        op_type = infer_operation_type(queue_entry_id)  # LOAD or UNLOAD from flow_lane
        qs = LoadingUnloadingPoint.objects.filter(
            operation_type=op_type, is_active=True
        )
        # FB-005: do NOT exclude LUPs with other active assignments
        if poi_id:
            qs = qs.filter(poi_id=poi_id)
        kwargs["queryset"] = qs
    return super().formfield_for_foreignkey(db_field, request, **kwargs)
```

**LUP traffic vs LD queue (do not conflate)**:

| Surface | Service method | Rows shown |
|---------|----------------|------------|
| CC assign form (§11.10) | `CCService.active_assignments_for_lup(lup)` | **All** active assignments at LUP — CCO judges congestion before assigning |
| LD start form (§6.3) | `CCService.assignments_startable_at_lup(lup, …)` | Assignments **without** open Load/Unload event — crew picks next vehicle to serve |

**`save_model`** → `CCService.assign_bay(...)`: creates BayAssignment, auto-issues WaitingSerial (UTC sequence), updates QueueEntry status, emits TLS-01 event. **Follow-up**: surface `stock_warning` from `assign_bay` in admin success message when FG outbound source stock is insufficient (STK-01-6 — assignment still proceeds).

### 6.3 LoadEventAdmin (LD-01-2)

Uses `LoadEventAdminBase` (→ `YardAdminBase`). **FG outbound only**.

**Add form (v1.3 — point-first queue)** — see §4.0:

| Field / widget | Behaviour |
|----------------|-----------|
| `loading_point` | **Non-model** `ModelChoiceField` → all active `LOAD` LUPs at `_scope_poi_id(request)` |
| `queue_at_point` | Readonly admin widget: HTML table built from `CCService.assignments_startable_at_lup(lup, event_model=LoadEvent)` |
| Row click (JS) | Sets hidden/posted `bay_assignment`; highlights row; triggers panel refresh (GET reload or inline) |
| `bay_assignment` | **Hidden** on add (not POI-wide autocomplete); required in `clean()` before save |
| `to_details_panel` | Existing readonly panel; driven by selected `bay_assignment` |
| `start_datetime` | Required; default `timezone.now()` |

**Queue row queryset** (same rules as legacy `_bay_assignment_details_qs`):

- `BayAssignment`: `is_active=True`, `flow_lane=FG_OUTBOUND`, LUP `operation_type=LOAD`, `yard_leg=SOURCE`
- Exclude assignments with open `LoadEvent` (`end_datetime` null)
- Filter `loading_unloading_point_id = selected LUP`
- `order_by("waiting_serial__serial_number")`

**LUP change**: clearing selected `bay_assignment` and table selection when dropdown changes.

**Change form (complete loading)** — unchanged from Sprint 4:

- `bay_assignment`, `start_datetime` readonly after `end_datetime` set
- `save_model`: create → `LDService.start_loading`; update with end → `LDService.complete_loading`

**Templates / static**: `templates/admin/operations/loadevent/change_form.html` (or shared LD partial) for queue table + row-select JS; reuse `dfms-badge` / `grp-table` styles.

**List View**:
- Columns: TO Number, Vehicle, Loading Point, Start Time, End Time (nullable), Bags, Weight MT, Seal, Status (In Progress / Completed), Created By
- Filters: `bay_assignment__loading_unloading_point__poi`, `start_datetime` (date range)

### 6.4 UnloadEventAdmin (LD-01-3)

Uses `UnloadEventAdminBase` (→ `YardAdminBase`). **FG inbound + RM inbound**.

**Add form**: same pattern as §6.3 with **Unloading Point** (`operation_type=UNLOAD`) and unload-eligible `BayAssignment` queryset (FG inbound, RM inbound, FG outbound destination leg — mirror current `_bay_assignment_details_qs`).

**Change form**: `qc_sample_taken` checkbox (informational); complete via `LDService.complete_unloading`.

**Cancellation**: resample / override-to-fail banner when `cancelled_by_resample` (unchanged).

### 6.5 QCSampleAdmin (QC-01-2)

Uses `QCAdminBase` (→ `YardAdminBase`). **QC Supervisor role**. `QCAdminBase` is defined in `apps/quality/checkpoint/admin.py` (see `qc-operations-sprint4.md` §6.0).

**Change Form**:
- `transport_order`: autocomplete, filtered to RM inbound TOs with sub_state in (`flagged_for_qc`, `sampling_started`):

```python
def formfield_for_foreignkey(self, db_field, request, **kwargs):
    if db_field.name == "transport_order":
        poi = get_poi_for_supervisor(request)
        kwargs["queryset"] = TransportOrder.objects.filter(
            flow_lane=FlowLane.RM_INBOUND,
            destination_poi=poi,
            status=TOStatus.AT_DESTINATION,
        ).filter(
            # sub_state tracked via latest TOStatusTransitionLog
            latest_sub_state__in=["flagged_for_qc", "sampling_started"],
        )
    return super().formfield_for_foreignkey(db_field, request, **kwargs)
```

- `physical_analysis`, `remarks`: text areas
- `save_model` → `QCService.create_sample(...)`: auto-generates sample_id, emits SAMPLING_STARTED

**List View**:
- Columns: Sample ID, TO Number, Vehicle, Sampled At, Has Decision badge, Created By
- Filters: `transport_order__destination_poi`, `sampled_at` (date range)

### 6.6 QCDecisionAdmin (QC-01-3)

Uses `QCAdminBase` (→ `YardAdminBase`). **QC Supervisor role**.

**Change Form**:
- `qc_sample`: autocomplete, filtered to samples without an active decision
- `decision`: radio buttons (Pass / Fail)
- **No `unloading_point` field** — unloading point is assigned by CC Officer after QC Pass, not here
- `remarks`: required when `decision = 'fail'`
- `save_model`:
  - Pass: `QCService.record_decision('pass', decided_by)` — creates QCDecision, marks TO `qc_passed=True`, re-queues in CC, emits QC_PASSED
  - Fail: `QCService.record_decision('fail', decided_by)` — blocks unloading/scale-out/gate-out, emits QC_FAILED

**Custom admin actions on QCDecisionAdmin (active decisions only)**:

```python
@admin.action(description="Trigger Resample (cancels active unloading)")
def trigger_resample(self, request, queryset):
    for decision in queryset.filter(is_active=True):
        QCService.trigger_resample(decision.transport_order, triggered_by=request.user)
    self.message_user(request, "Resample triggered. Active unloading cancelled.")

@admin.action(description="Override to Failed (cancels active unloading)")
def override_to_failed(self, request, queryset):
    for decision in queryset.filter(is_active=True, decision="pass"):
        QCService.override_to_failed(decision, overridden_by=request.user, remarks="Admin override")
    self.message_user(request, "Decision overridden to Fail.")
```

**List View**:
- Columns: Sample ID, TO Number, Decision badge (Pass/Fail), Is Active, Decided At, Decided By
- Filters: `decision`, `is_active`, `qc_sample__transport_order__destination_poi`
- Search: TO number, Sample ID

---

## 7. API Endpoints

### 7.1 Command Center (CC-01)

```http
GET    /api/v1/command-center/queue?poi=&requires_qc=&status=
       → List QueueEntry rows (CC dashboard feed)
       → Include queue_token.serial_number per row (v1.5) — order by serial ascending for FIFO

POST   /api/v1/command-center/assignments
       → Body: { queue_entry_id, loading_unloading_point_id }
       → Validations: flow lane + op_type, point active, queue eligible (QC when required)
       → FB-005: LUP may already have other active assignments (no "point in use" rejection)
       → Side effects: BayAssignment, WaitingSerial (UTC daily seq), QueueEntry status=assigned, TLS-01
       → Response: { assignment_id, waiting_serial, serial_number, assigned_at }

GET    /api/v1/command-center/assignments?loading_point_id=&status=active
       → Active assignments for LUP; order by waiting_serial__serial_number (FB-005)

GET    /api/v1/command-center/waiting-serials?loading_point_id=
       → Serials for point (filter by active assignment); order by serial_number

# Serial issuance is part of POST /assignments (assign_bay). No separate POST required for FB-005
# unless a future recovery/re-issue endpoint is added.

# POST /api/v1/command-center/flag-qc — REMOVED from target design (v1.1).
# QC flag is applied inside ScaleInService.record_scale_in → CCService.create_queue_entry
# when to_requires_qc_from_lines(to) is True.

GET    /api/v1/command-center/my-bay?loading_point_id=
       → Active BayAssignments at LUP for loading/unloading personnel
       → Order: waiting_serial.serial_number ascending (FB-005)
```

### 7.2 Loading/Unloading Events (LD-01)

```http
POST   /api/v1/load-events
       → Body: { bay_assignment_id, start_datetime }
       → Side effects: LoadEvent created (end_datetime null), LOADING_STARTED → TLS-01

PATCH  /api/v1/load-events/{id}
       → Body: { end_datetime, bags_loaded, weight_loaded_mt, seal_number }
       → Validations: end_datetime >= start_datetime
       → Side effects: LOADING_COMPLETED → TLS-01; gates SC-01 scale-out

POST   /api/v1/unload-events
       → Body: { bay_assignment_id, start_datetime }
       → Side effects: UnloadEvent created, UNLOADING_STARTED → TLS-01

PATCH  /api/v1/unload-events/{id}
       → Body: { end_datetime, bags_unloaded, weight_unloaded_mt }
       → Side effects: UNLOADING_COMPLETED → TLS-01; gates SC-01 scale-out (+ QC pass for RM)

GET    /api/v1/unload-events/{id}/qc-handoff
       → QC handoff context for RM inbound TO (for QC Supervisor view)
```

### 7.3 QC Checkpoint (QC-01)

```http
GET    /api/v1/qc/queue?poi=
       → RM inbound TOs with sub_state in [flagged_for_qc, sampling_started]

POST   /api/v1/qc/samples
       → Body: { transport_order_id, physical_analysis, remarks }
       → Side effects: QCSample created, SAMPLING_STARTED → TLS-01

POST   /api/v1/qc/decisions
       → Body: { qc_sample_id, decision (pass|fail), remarks }
       → Side effects: QCDecision created; on pass: TO marked qc_passed=True, re-queues in CC; TLS-01 event
       → (no unloading_point_id — CC assigns that separately via /api/v1/command-center/assignments)

POST   /api/v1/qc/decisions/{id}/resample
       → Side effects: QCDecision superseded, BayAssignment cancelled, UnloadEvent cleared, TLS-01 event

POST   /api/v1/qc/decisions/{id}/override-fail
       → Body: { remarks (required) }
       → Side effects: decision changed to fail, BayAssignment cancelled, TLS-01 event
```

---

## 8. Validation Rules

### CC-01
- Cannot assign bay when `requires_qc=True` and `qc_passed is not True` on the queue entry
- Loading/unloading point must match `operation_type` for the flow lane (LOAD for FG outbound, UNLOAD for others)
- Inactive loading/unloading points excluded from assignment dropdowns
- Duplicate BayAssignment for same QueueEntry → reject (OneToOne on `queue_entry`)
- **FB-005 removed (Sprint 4)**: reject when another `BayAssignment(is_active=True)` exists on the same LUP
- **FB-005**: multiple active assignments per LUP allowed; no capacity field on `LoadingUnloadingPoint`
- **FB-005**: `serial_number` unique globally; daily seq per LUP resets at 00:00 UTC; historical serials immutable

### LD-01
- `end_datetime >= start_datetime` (form `clean()` + service validation)
- `end_datetime` not settable if BayAssignment is cancelled (resample/override-to-fail)
- LoadEvent only for FG outbound; UnloadEvent only for FG inbound / RM inbound (enforced by queryset scoping)
- **Add form (v1.3)**: `bay_assignment` required when saving start; must belong to selected LUP; must appear in startable queue for that LUP
- **Add form**: changing LUP clears `bay_assignment` selection
- **No** `loading_unloading_point` FK on `LoadEvent` / `UnloadEvent` — point selection is UI-only

### QC-01
- Sample creation only when TO `requires_qc` (product-line aggregate) and `sub_state` in `flagged_for_qc`, `sampling_started`, or `resampling` (QC-01-13)
- No `unloading_point` in QC decision — CC Officer assigns unloading point after QC Pass via CC-01
- `remarks` required when `decision = 'fail'` or `override-fail`
- Resample only when `QCDecision.is_active = True` (there must be a current decision to supersede)
- Override-to-fail only on `decision = 'pass'` active decisions; cannot override a fail to a fail

---

## 9. Integration Points

| Module | Direction | How |
|--------|-----------|-----|
| SC-01 (Scale-In) | Upstream | `ScaleInService` calls `CCService.create_queue_entry()` atomically — sets `requires_qc` from product lines and writes `flagged_for_qc` or `waiting_cc` (YARD-01); issues the **CC queue serial** on `QueueToken.serial_number` (per-POI UTC daily, v1.5) surfaced as the first CC queue column |
| GT-01 (Gate-Out) | Downstream | LoadEvent/UnloadEvent completion + QCDecision.decision='pass' are gate-out guard conditions |
| SC-01 (Scale-Out) | Downstream gate | LoadEvent/UnloadEvent completion (+ QC pass for RM) unlocks scale-out |
| LUP-01 (Master Data) | Lookup | LoadingUnloadingPoint FK; filtered by poi + operation_type + is_active (FB-005: not filtered by “bay occupied”) |
| TLS-01 (Lifecycle) | Timeline | All events: BAY_ASSIGNED, `flagged_for_qc` (auto at scale-in when product QC required), LOADING_STARTED/COMPLETED, UNLOADING_STARTED/COMPLETED, QC_PASSED/FAILED, RESAMPLING_TRIGGERED, QC_OVERRIDDEN_FAIL |
| LD-01 (Loading/Unloading) | Downstream | Admin start picks `bay_assignment` from LUP queue (§4.0); `LDService` unchanged |
| GT-02 (Gate TO lines) | Upstream data | `TransportOrder.requires_qc` + `TOLineItem` product FKs feed `to_requires_qc_from_lines` at queue creation |

---

## 10. Sprint 4 Story Mapping

### CC-01 — Command Center

| Sub-task | Scope | Implementation Focus |
|----------|-------|----------------------|
| CC-01-1 | Models + migration | QueueEntry, BayAssignment, WaitingSerial; **FB-005 add** `WaitingSerialSequence` |
| CC-01-2 | QueueEntryAdmin | Queue dashboard (`status=waiting`); Assign Bay when eligible; Awaiting QC display for `requires_qc` pending; `CCAdminBase` → `YardAdminBase` |
| CC-01-3 | BayAssignmentAdmin | `_scope_poi_id` for formfield_for_foreignkey; CCService in save_model; FB-005 LUP queryset (no exclusivity exclude); TO summary AJAX — **LUP traffic panel pending** (§11.10) |
| CC-01-3a | BayAssignmentAdmin — LUP traffic panel | Read-only traffic at selected L/U point on add form; reuses `render_queue_table_html` + `active_assignments_for_lup` — §11.10 |
| CC-01-4 | CC queue REST API (GET) | Filter by status/requires_qc/poi |
| CC-01-5 | Bay assignment REST API (POST) | Flow lane + op_type validation; BayAssignment + WaitingSerial (FB-005 UTC seq, multi-vehicle per LUP) |
| CC-01-7 | Waiting serial / my-bay APIs (Sprint 5) | GET serials + my-bay ordered by serial; issuance via POST assignments (FB-005) |
| CC-01-6 | QC auto-flag at scale-in (replaces manual flag API) | `create_queue_entry` + TLS-01 `flagged_for_qc` when `to_requires_qc_from_lines`; align with QC-01-13 / FB-006 |

### LD-01 — Loading/Unloading

| Sub-task | Scope | Implementation Focus |
|----------|-------|----------------------|
| LD-01-1 | Models + migration | LoadEvent, UnloadEvent (with `cancelled_by_resample` field) |
| LD-01-2 | LoadEventAdmin | FG outbound; **v1.3** LUP dropdown + serial queue table on add; LDService on save |
| LD-01-3 | UnloadEventAdmin | FG inbound + RM inbound; same point-first add UX; qc_sample_taken; resample banner |
| LD-01-6 | LD admin start UX (FB-005) | Shared helper `assignments_startable_at_lup`; queue widget + JS; templates — §11.9 — **shipped** |
| LD-01-4 | Load events REST API | POST (start) + PATCH (complete) |
| LD-01-5 | Unload events REST API | POST (start) + PATCH (complete) + GET qc-handoff |

### QC-01 — QC Checkpoint (RM Inbound)

| Sub-task | Scope | Implementation Focus |
|----------|-------|----------------------|
| QC-01-1 | Models + migration | QCSample, QCDecision |
| QC-01-2 | QCSampleAdmin | TO queryset restricted to RM inbound at_destination + flagged_for_qc; QCService in save_model |
| QC-01-3 | QCDecisionAdmin | Pass/Fail only — no unloading point field; on Pass marks qc_passed=True and re-queues TO in CC; remarks required on Fail; trigger_resample + override_to_failed admin actions |
| QC-01-4 | QC queue REST API (GET) | RM inbound TOs awaiting QC |
| QC-01-5 | QC sample REST API (POST) | Create sample |
| QC-01-6 | QC decision REST API (POST) | Pass / Fail; on Pass marks qc_passed=True, re-queues in CC (CC assigns unloading point separately) |
| QC-01-7 | Resample REST API (POST) | Supersede decision, cancel BayAssignment, clear UnloadEvent |
| QC-01-8 | Override-to-failed REST API (POST) | Same side effects as resample; decision set to fail |

---

| CC-01-YARD | YARD-01 integration | `CCAdminBase`, LD admin bases → `YardAdminBase`; `QueueEntry.qc_passed`; `WaitingSerial` FK direction; `create_queue_entry` from `ScaleInService` |

### FB-005 — Sprint 5 (client feedback)

| Work item | Scope | Status |
|-----------|-------|--------|
| FB-005-1 | Migration `WaitingSerialSequence`; remove LUP exclusivity in `CCService._validate_for_assignment` | **Done** |
| FB-005-2 | UTC serial allocator with `select_for_update` in `assign_bay` | **Done** |
| FB-005-3 | Admin: LUP dropdown without `exclude(bay_assignments__is_active=True)`; **LUP traffic panel on CC assign form** | **Partial** — dropdown shipped; traffic panel **pending** (§11.10) |
| FB-005-4 | Unit tests: multi-assign same LUP, UTC day rollover, concurrent serial safety | **Partial** — LD queue tests exist; CC serial + traffic panel tests pending |
| FB-005-5 | REST: `POST/GET assignments`, `GET my-bay`, `GET waiting-serials` per §7.1 | **Pending** (CC-01-5–8) |
| FB-005-6 / LD-01-6 | LD admin: LUP dropdown + serial queue table (click row → `bay_assignment`) | **Done** (§11.9) |

Source: [feedback-resolution.md](../../03-backlog/sprints/sprint-5/feedback-resolution.md) § FB-005.

---

## 11. FB-005 — Implementation plan (Sprint 5)

**Feedback**: [FB-005](../../03-backlog/sprints/sprint-5/feedback-resolution.md) — multiple vehicles per L/U point; daily waiting-serial reset.

**Locked product decisions**

| Topic | Decision |
|-------|----------|
| Daily reset boundary | **UTC** (`YYYYMMDD` in serial = UTC date at issue) |
| Max concurrent vehicles per LUP | **None** (no capacity field) |
| Loading/unloading crew sort order | **`waiting_serial.serial_number` ascending** |
| When serial is issued | **Same transaction as** `CCService.assign_bay()` (admin + `POST /assignments`) |
| LD start UX surface | **Admin only** — LUP → queue table → `bay_assignment` (§4.0, §11.9) |

### 11.1 Semantic model (no change to OneToOne rules)

| Concept | Meaning |
|---------|---------|
| `BayAssignment.is_active` | This **vehicle's** assignment is open — **not** exclusive LUP lock |
| `QueueEntry.status=assigned` | Visit has a bay; leaves CC waiting list (unchanged) |
| `WaitingSerial` | Daily queue ticket for that assignment on that LUP; immutable after issue |

`mark_completed()`, QC cancellation, and LD-01 `is_active` checks remain **per assignment**.

### 11.2 Service layer (`apps/operations/command_center/services.py`)

| # | Task | Status |
|---|------|--------|
| 1 | **Delete** LUP exclusivity block in `_validate_for_assignment()` | **Done** |
| 2 | **Replace** `_next_serial_number()` with `WaitingSerialSequence` + UTC `serial_date` + row lock in `assign_bay` | **Done** |
| 3 | **Add** `CCService.active_assignments_for_lup(lup)` — serial order; feeds CC traffic panel + future my-bay API | **Done** (admin wiring pending §11.10) |
| 4 | **Add** `CCService.assignments_startable_at_lup(lup, base_queryset)` — excludes open Load/Unload events; LD queue table | **Done** |

### 11.3 Admin (`command_center/admin.py`)

| Task | Status |
|------|--------|
| Remove `.exclude(bay_assignments__is_active=True)` from LUP `formfield_for_foreignkey` | **Done** |
| TO summary panel + `queue-entry-details` / `queue-entry-lups` AJAX on add form | **Done** |
| Read-only **LUP traffic panel** on Bay Assignment add form | **Pending** — full plan §11.10 |

### 11.4 REST APIs (CC-01 Sprint 5 — §7.1)

| Endpoint | FB-005 notes |
|----------|----------------|
| `POST …/assignments` | Calls `assign_bay`; returns `serial_number` |
| `GET …/assignments?loading_point_id=` | Active rows; order by serial |
| `GET …/my-bay?loading_point_id=` | Personnel view; order by serial |
| `GET …/waiting-serials?loading_point_id=` | List/filter by point |

Serial issuance is **not** a separate POST in target design (satisfied by assignment POST).

### 11.5 Out of scope for FB-005

- `LoadingUnloadingPoint.capacity`
- Product-type / vehicle-type mismatch warnings (CC-01-6 warn path)
- FB-006 product-line QC (separate)
- CC-01-9 full CC queue UI (may consume same APIs)
- **LD two-step UX on REST/mobile** (admin-only in this slice; my-bay API is list-only precursor)

### 11.6 Tests (definition of done)

**CC / serials**

1. Two `assign_bay` to same LUP, same UTC day → `…-001`, `…-002`; no ValidationError.
2. Mock next UTC day → next serial `…-001` for new date prefix.
3. `mark_completed` on first assignment; second remains active; third assign still allowed.
4. Concurrent assigns → distinct `serial_number` (no duplicate key).

**CC admin — LUP traffic panel (§11.10)**

5. `GET …/lup-traffic/<lup_id>/` returns 403 without permission; 404 when LUP outside officer POI.
6. Two active assignments at same LUP → traffic panel HTML shows two rows in serial order.
7. LUP with no active assignments → empty-state help text.
8. (Optional) LUP dropdown JSON includes `active_count` matching panel row count.

**LD admin (manual or light integration)**

9. Two assignments at same LUP → LD queue table shows two rows, serial order.
10. Save start without row selected → form error on `bay_assignment`.
11. `?bay_assignment=` deep link pre-fills LUP + selection.

### 11.7 Suggested PR order

**Completed (as of 2026-06-09)**

1. ~~Migration + `CCService` serial allocator + remove exclusivity + `assignments_startable_at_lup`~~  
2. ~~LD admin: shared queue widget + Load/Unload add forms (FB-005-6 / LD-01-6)~~  
3. ~~CC admin LUP queryset (no exclusivity exclude) + TO summary AJAX~~  

**Remaining**

4. **CC admin LUP traffic panel** (§11.10) — small PR; unblocks CCO point-availability visibility  
5. Unit tests (CC serial concurrency + traffic panel views)  
6. REST endpoints + URL wiring (`GET …/assignments`, `GET …/my-bay` — my-bay mirrors LD step-2 queryset)  
7. Surface `stock_warning` in BayAssignment admin success message (STK-01-6)  
8. Update [feedback-resolution.md](../../03-backlog/sprints/sprint-5/feedback-resolution.md) FB-005 status when closed  

### 11.8 Supersedes Sprint 4 limitation

Sprint 4 shipped **single active vehicle per LUP** via `is_active` exclusivity validation. FB-005 **supersedes** that behaviour; [SPRINT-4-IMPLEMENTATION-OVERVIEW.md](../SPRINT-4-IMPLEMENTATION-OVERVIEW.md) “No multi-vehicle bays” note applies only to pre–FB-005 code.

### 11.9 LD admin start UX (`apps/operations/loading/admin.py`)

**Scope**: Admin-only; no model migration. Implements §4.0. **Status: shipped.**

**Shared module** (`apps/operations/loading/admin_queue.py`):

| Helper | Purpose |
|--------|---------|
| `loading_points_for_poi(poi_id)` | Active LOAD LUPs at POI |
| `unloading_points_for_poi(poi_id)` | Active UNLOAD LUPs at POI |
| `render_queue_table_html(assignments)` | HTML table: serial, TO number, vehicle; row `data-bay-assignment-id` |
| `LoadEventAdminForm` / `UnloadEventAdminForm` | Extra `loading_point` / `unloading_point` field + `clean()` cross-check |

**Add form fieldsets (Load and Unload)**

```text
("Your bay", { fields: ["loading_point" | "unloading_point", "queue_at_point"] }),
("Start", { fields: ["bay_assignment", "start_datetime", "to_details_panel"] }),
("Completion (fill on end)", { ... end fields blank on add ... }),
```

**JavaScript** (`static/admin/js/ld_queue_select.js`)

- On LUP change: `GET …/queue-rows/<lup_id>/` reloads table.
- On row click: set `#id_bay_assignment`, add `.selected` class, refresh `to_details_panel`.
- Preserve `?bay_assignment=` on first paint: set LUP from `assignment.loading_unloading_point_id`, select matching row.

**Service contract**: `assignments_startable_at_lup` delegates lane filters to existing `_bay_assignment_details_qs` logic per admin class — avoid duplicating FG outbound vs inbound rules.

### 11.10 CC admin LUP traffic panel (`apps/operations/command_center/admin.py`)

**Scope**: Admin-only; no model migration. Closes FB-005-3 traffic gap on Bay Assignment **add** form. Implements §3.2 / §6.2. **Status: pending.**

**Problem**: CCO cannot see vehicles already assigned at a loading/unloading point when choosing where to send the next TO. Backend data exists (`active_assignments_for_lup`); LD-01 already has the queue-table pattern (§11.9); CC form only refreshes the LUP dropdown labels.

**Reuse (do not duplicate)**

| Asset | Location | CC usage |
|-------|----------|----------|
| `render_queue_table_html(assignments)` | `apps/operations/loading/admin_queue.py` | Read-only HTML; **no row click** (CC does not select `bay_assignment` here) |
| `CCService.active_assignments_for_lup(lup)` | `apps/operations/command_center/services.py` | All `is_active=True` assignments at LUP, serial order |
| AJAX + template pattern | LD `queue-rows/<lup_id>/` + `ld_queue_select.js` | Mirror for CC: `lup-traffic/<lup_id>/` + extend `cc_queue_entry_details.js` |

**Admin endpoint**

```http
GET /admin/operations/bayassignment/lup-traffic/<lup_id>/
```

- Permission: same as `queue_entry_details_view` (`has_add_permission` or `has_change_permission`)
- Scope: LUP must belong to officer POI (`_scope_poi_id`); return 404 otherwise
- Response: HTML fragment from `render_queue_table_html(CCService.active_assignments_for_lup(lup))`
- Optional enhancement: add **Status** column (`Waiting for crew` / `Loading in progress` / `Unloading in progress`) by checking open `LoadEvent`/`UnloadEvent` on each assignment

**Template** (`templates/admin/operations/bayassignment/change_form.html`)

Add module block after TO summary:

```html
<div class="module cc-bay-assignment-lup-traffic">
  <h2>Traffic at selected point</h2>
  <div id="cc-lup-traffic-panel">…placeholder…</div>
</div>
```

Pass `data-lup-traffic-url-template` in `BayAssignmentAdmin.changeform_view` extra_context (placeholder `__LUP_ID__`, same pattern as `cc_queue_entry_lups_url`).

**JavaScript** (`static/admin/js/cc_queue_entry_details.js`)

- Bind `change` / Select2 on `#id_loading_unloading_point`
- On LUP select → `fetch(lupTrafficUrl)` → inject into `#cc-lup-traffic-panel`
- Clear LUP → placeholder: "Select a loading/unloading point to see current vehicles."
- Independent of queue-entry change handler (both panels update on their respective controls)

**Optional: enrich LUP dropdown** (`queue_entry_lups_view`)

Return `{"id", "label", "active_count"}`; label suffix `(N vehicles)` when `active_count > 0`.

**Files to touch**

- `apps/operations/command_center/admin.py` — `get_urls`, `lup_traffic_view`, `changeform_view` context  
- `templates/admin/operations/bayassignment/change_form.html` — traffic panel host  
- `static/admin/js/cc_queue_entry_details.js` — LUP change handler  
- `tests/unit/test_operations/test_cc_bay_assignment_details.py` — traffic view tests  

**Out of scope for this slice**

- CC queue changelist auto-refresh (separate PRD item)
- Assignment push notification to loading/unloading personnel
- REST `GET …/assignments` (same queryset; wire when CC-01-5 lands)

---

**Last Updated**: 2026-06-09  
**Related Modules**: [gate-operations-sprint4.md](./gate-operations-sprint4.md), [scaling-operations-sprint4.md](./scaling-operations-sprint4.md), [yard-foundation-implementation.md](./yard-foundation-implementation.md), [05-transport](../05-transport/README.md)
