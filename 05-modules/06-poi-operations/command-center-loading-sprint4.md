---
module: 06-poi-operations
specification: Command Center, Loading/Unloading & QC Operations (Sprint 4 — TO-Centric)
version: 1.1
phase: Phase 1
sprint: Sprint 4 (QC trigger alignment — Sprint 5 / FB-006)
last_updated: 2026-06-03
changelog: "v1.1 — QC-01-13 / FB-006: QueueEntry.requires_qc from product lines (any line Product.requires_qc); RM inbound auto-flagged_for_qc at scale-in when required; CC assigns unloading only after QC Pass; manual Flag for QC removed from happy path"
related_stories: DFS-056 (CC-01), DFS-057 (LD-01), DFS-058 (QC-01)
jira_epic: DFS-072
---

# Command Center, Loading/Unloading & QC Operations (Sprint 4)

## Overview

This specification covers three tightly coupled modules in the yard chain:

- **CC-01 (Command Center)**: Queue management from scale-in token, bay/line assignment, waiting serial issuance. For RM inbound when **any** product line requires QC (`Product.requires_qc` via `to_requires_qc_from_lines`), scale-in **automatically** sets `flagged_for_qc` — CC does not assign an unloading point until QC Pass; after Pass, **CC Officer** assigns the unloading point (not QC Supervisor).
- **LD-01 (Loading/Unloading)**: Start/end timestamps, bags/weight/seal capture against an assigned bay. Loading events fire for FG outbound; unloading events fire for FG inbound and RM inbound.
- **QC-01 (QC Checkpoint)**: RM inbound only. Sample creation → Pass/Fail decision only. On Pass the TO is marked `qc_passed=True` and CC is unblocked to assign the unloading point. Resample and override-to-failed cancel the active CC unloading assignment during unloading.

**Module paths**: `apps/operations/command_center/`, `apps/operations/loading/`, `apps/quality/checkpoint/`  
**Dependencies**: `apps/operations/scaling/` (QueueToken, WeighingSession), `apps/master_data/` (LoadingUnloadingPoint), `apps/transport/` (TransportOrder, FlowLane, TOStatus), **`YARD-01`** (YardAdminBase, yard_poi, UserOperationalPOI, TOSubState)  
**Enables**: Scale-out prerequisite (LD-01 completion), gate-out guard matrix (GT-01), TO closure (POD-01)

### Codebase baseline (May 2026)

| Path | Exists | Notes |
|------|--------|-------|
| `apps/operations/command_center/views.py` | ✓ | `CommandCenterDashboardView` (legacy counts), `ActiveTripsView` — no Sprint 4 models |
| `apps/operations/command_center/models.py` | ✗ | Must be created for `QueueEntry`, `BayAssignment`, `WaitingSerial` |
| `apps/operations/loading/models.py` | ✓ | Legacy `LoadingOperation` linked to `GateEntry` — **do not extend** |
| `apps/operations/loading/admin.py` | ✗ | Must be created for `LoadEventAdmin`, `UnloadEventAdmin` |
| `apps/quality/checkpoint/` | ✗ | Directory does not exist; `QCSample` and `QCDecision` go here |

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

    # Status mirrors QueueEntry: created by CC, closed by LD-01
    is_active: boolean (default True)
    cancelled_at: DateTime (nullable)
    cancelled_by: FK → User (nullable)
    cancellation_reason: text (nullable)   # used when QC triggers resample
}
```

### 1.3 WaitingSerial (new model — extends `TenantAwareModel`)

Unique serial number per loading/unloading point assignment. Immutable after issue.

**YARD-01 §7.3 fix**: `WaitingSerial` owns the FK to `BayAssignment` (not the reverse). The previous design had a FK on both sides, creating a circular create-order deadlock. Access the serial from `assignment.waiting_serial` via the reverse `OneToOne` relation.

```python
WaitingSerial(TenantAwareModel) {
    id: UUID (PK)

    # WaitingSerial holds the FK — BayAssignment has no waiting_serial FK
    bay_assignment: FK → BayAssignment (OneToOne, related_name='waiting_serial')
    serial_number: string (unique per LoadingUnloadingPoint per day — format: '{POINT_CODE}-{YYYYMMDD}-{seq:03d}')
    issued_at: DateTime
    issued_by: FK → User
}
```

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
        ├─► Columns: Token Number, TO Number, Vehicle, Flow Lane badge, Gross Weight, Requires QC badge, Waiting Since
        ├─► Filter: requires_qc (All / Yes / No), flow_lane
        ├─► RM + requires_qc + qc_passed unset: row shows **Awaiting QC** (no Assign Bay)
        └─► [Assign Bay] when requires_qc=False OR qc_passed=True
```

### 3.2 Bay assignment — FG outbound

```
CC Officer clicks [Assign Bay] for FG outbound QueueEntry
  └─► Modal / inline form:
        ├─► Loading Point: dropdown from LoadingUnloadingPoint.objects.filter(
        │     poi=poi, operation_type=LOAD, is_active=True
        │   ).exclude(active_bay_assignments)
        └─► [Assign]
              └─► CCService.assign_bay(queue_entry, loading_point, assigned_by):
                    ├─► Create BayAssignment
                    ├─► Auto-issue WaitingSerial (serial_number auto-gen)
                    ├─► QueueEntry.status = 'assigned'
                    ├─► Emit BAY_ASSIGNED event → TLS-01 (sub: assigned_loading_point)
                    └─► Success: serial number displayed
```

### 3.3 Bay assignment — FG inbound

Same flow as FG outbound, using `operation_type=UNLOAD` points. CC directly assigns unloading point.

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
ScaleInService.record_scale_in(...)
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

---

## 4. Loading/Unloading Flow (LD-01)

### 4.1 Loading (FG outbound)

```
Loading Personnel opens Load Event form
  └─► Selects BayAssignment (autocomplete — shows assigned, not completed)
        └─► Display: TO Number, Loading Point, Vehicle, Waiting Serial
              ├─► Enter: Start Datetime (required, default=now)
              └─► [Save Start]
                    └─► Create LoadEvent (end_datetime=null)
                          └─► Emit LOADING_STARTED → TLS-01 (sub: loading_started)

  [Later] Loading Personnel updates LoadEvent:
  └─► Enter: End Datetime (required ≥ start)
  └─► Enter: Bags Loaded (nullable), Weight Loaded MT (nullable), Seal Number (nullable)
  └─► [Save End]
        └─► LDService.complete_loading(load_event):
              ├─► Set end_datetime
              ├─► QueueEntry.status = 'completed'
              ├─► Emit LOADING_COMPLETED → TLS-01 (sub: loading_completed)
              └─► Gate for SC-01: scale-out now allowed for FG outbound
```

### 4.2 Unloading (FG inbound and RM inbound)

```
Unloading Personnel opens Unload Event form
  └─► Selects BayAssignment (autocomplete — active, assigned)
        └─► Display: TO Number, Unloading Point, Vehicle, Waiting Serial, QC Status (RM badge)
              ├─► Enter: Start Datetime (required, default=now)
              └─► [Save Start]
                    └─► Create UnloadEvent (end_datetime=null)
                          └─► Emit UNLOADING_STARTED → TLS-01 (sub: unloading_started)

  [Later] Unloading Personnel updates UnloadEvent:
  └─► Enter: End Datetime (≥ start), Bags Unloaded, Weight Unloaded MT
  └─► [Save End]
        └─► LDService.complete_unloading(unload_event):
              ├─► Set end_datetime
              ├─► QueueEntry.status = 'completed'
              ├─► Emit UNLOADING_COMPLETED → TLS-01 (sub: unloading_completed)
              └─► Gate for SC-01: scale-out now allowed for FG inbound
                  (for RM inbound: scale-out requires QCDecision.decision='pass' also)
```

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
- Columns: Token Number, TO Number, Vehicle, Flow Lane badge, Gross Weight, Requires QC badge, Waiting Since, Status badge
- Filters: `status`, `requires_qc`, `poi`, `created_at` (date range)
- Search: TO number, Vehicle registration, Token number

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

Uses `CCAdminBase` (→ `YardAdminBase`).

**Change Form**:
- `queue_entry`: autocomplete (filtered to status='waiting', poi=officer's POI, eligible for bay: `requires_qc=False` OR `qc_passed=True`)
- `loading_unloading_point`: **queryset restriction** — `formfield_for_foreignkey`:

```python
def formfield_for_foreignkey(self, db_field, request, **kwargs):
    if db_field.name == "loading_unloading_point":
        poi_id = self._scope_poi_id(request)  # from YardAdminBase
        queue_entry_id = request.GET.get("queue_entry")
        op_type = infer_operation_type(queue_entry_id)  # LOAD or UNLOAD from flow_lane
        qs = (
            LoadingUnloadingPoint.objects.filter(
                operation_type=op_type, is_active=True
            )
            .exclude(bay_assignments__is_active=True)
        )
        if poi_id:
            qs = qs.filter(poi_id=poi_id)
        kwargs["queryset"] = qs
    return super().formfield_for_foreignkey(db_field, request, **kwargs)
```

- `save_model` → `CCService.assign_bay(...)`: creates BayAssignment, auto-issues WaitingSerial, updates QueueEntry status, emits TLS-01 event

### 6.3 LoadEventAdmin (LD-01-2)

Uses `LoadEventAdminBase` (→ `YardAdminBase`). **FG outbound only**.

**Change Form**:
- `bay_assignment`: autocomplete, filtered to active FG outbound BayAssignments at operator's POI
- `start_datetime`: required, default = `timezone.now()`
- `end_datetime`: nullable; `clean()` enforces `end_datetime >= start_datetime`
- `bags_loaded`, `weight_loaded_mt`, `seal_number`: nullable — entered when loading completes
- `save_model`:
  - On initial create (end_datetime is null): `LDService.start_loading(bay_assignment, start_datetime)` → emits LOADING_STARTED
  - On update with end_datetime set: `LDService.complete_loading(load_event)` → emits LOADING_COMPLETED, updates QueueEntry, gates SC-01 scale-out
- `get_readonly_fields`: `bay_assignment`, `start_datetime` become read-only once `end_datetime` is set (immutable after completion)

**List View**:
- Columns: TO Number, Vehicle, Loading Point, Start Time, End Time (nullable), Bags, Weight MT, Seal, Status (In Progress / Completed), Created By
- Filters: `bay_assignment__loading_unloading_point__poi`, `start_datetime` (date range)

### 6.4 UnloadEventAdmin (LD-01-3)

Uses `UnloadEventAdminBase` (→ `YardAdminBase`). **FG inbound + RM inbound**.

**Change Form**:
- `bay_assignment`: autocomplete, filtered to active inbound BayAssignments at operator's POI
- Same start/end pattern as LoadEventAdmin
- For RM inbound: `qc_sample_taken` checkbox (informational; actual QC is in QCAdmin)
- `save_model`:
  - Initial create: `LDService.start_unloading(bay_assignment, start_datetime)` → emits UNLOADING_STARTED
  - Update with end_datetime: `LDService.complete_unloading(unload_event)` → emits UNLOADING_COMPLETED
- `get_readonly_fields`: `bay_assignment`, `start_datetime` read-only after `end_datetime` set

**Cancellation**: if `QCService.trigger_resample()` is called, the active `UnloadEvent` is cleared (end_datetime remains null) and a `cancelled_by_resample` flag is set. `UnloadEventAdmin` shows this as a warning banner.

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

POST   /api/v1/command-center/assignments
       → Body: { queue_entry_id, loading_unloading_point_id }
       → Validations: flow lane match, point active + not in use, requires_qc=False
       → Side effects: BayAssignment, WaitingSerial, QueueEntry status=assigned, TLS-01 event
       → Response: { assignment_id, waiting_serial, assigned_at }

# POST /api/v1/command-center/flag-qc — REMOVED from target design (v1.1).
# QC flag is applied inside ScaleInService.record_scale_in → CCService.create_queue_entry
# when to_requires_qc_from_lines(to) is True.

GET    /api/v1/command-center/my-bay?poi=
       → Active BayAssignments for the loading/unloading personnel at this POI
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
- Cannot assign bay when `requires_qc=True` and no active `QCDecision(decision='pass')` for the TO
- Loading/unloading point must match `operation_type` for the flow lane (LOAD for FG outbound, UNLOAD for others)
- Inactive loading/unloading points excluded from assignment dropdowns
- Duplicate BayAssignment for same QueueEntry → reject

### LD-01
- `end_datetime >= start_datetime` (form `clean()` + service validation)
- `end_datetime` not settable if BayAssignment is cancelled (resample/override-to-fail)
- LoadEvent only for FG outbound; UnloadEvent only for FG inbound / RM inbound (enforced by queryset scoping)

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
| SC-01 (Scale-In) | Upstream | `ScaleInService` calls `CCService.create_queue_entry()` atomically — sets `requires_qc` from product lines and writes `flagged_for_qc` or `waiting_cc` (YARD-01) |
| GT-01 (Gate-Out) | Downstream | LoadEvent/UnloadEvent completion + QCDecision.decision='pass' are gate-out guard conditions |
| SC-01 (Scale-Out) | Downstream gate | LoadEvent/UnloadEvent completion (+ QC pass for RM) unlocks scale-out |
| LUP-01 (Master Data) | Lookup | LoadingUnloadingPoint FK for bay assignment; queryset filtered by poi + operation_type + is_active |
| TLS-01 (Lifecycle) | Timeline | All events: BAY_ASSIGNED, `flagged_for_qc` (auto at scale-in when product QC required), LOADING_STARTED/COMPLETED, UNLOADING_STARTED/COMPLETED, QC_PASSED/FAILED, RESAMPLING_TRIGGERED, QC_OVERRIDDEN_FAIL |
| GT-02 (Gate TO lines) | Upstream data | `TransportOrder.requires_qc` + `TOLineItem` product FKs feed `to_requires_qc_from_lines` at queue creation |

---

## 10. Sprint 4 Story Mapping

### CC-01 — Command Center

| Sub-task | Scope | Implementation Focus |
|----------|-------|----------------------|
| CC-01-1 | Models + migration | QueueEntry (with `qc_passed` field), BayAssignment (no `waiting_serial` FK), WaitingSerial (owns FK → BayAssignment) |
| CC-01-2 | QueueEntryAdmin | Queue dashboard (`status=waiting`); Assign Bay when eligible; Awaiting QC display for `requires_qc` pending; `CCAdminBase` → `YardAdminBase` |
| CC-01-3 | BayAssignmentAdmin | `_scope_poi_id` for formfield_for_foreignkey; CCService in save_model |
| CC-01-4 | CC queue REST API (GET) | Filter by status/requires_qc/poi |
| CC-01-5 | Bay assignment REST API (POST) | Flow lane + op_type validation; BayAssignment + WaitingSerial |
| CC-01-6 | QC auto-flag at scale-in (replaces manual flag API) | `create_queue_entry` + TLS-01 `flagged_for_qc` when `to_requires_qc_from_lines`; align with QC-01-13 / FB-006 |

### LD-01 — Loading/Unloading

| Sub-task | Scope | Implementation Focus |
|----------|-------|----------------------|
| LD-01-1 | Models + migration | LoadEvent, UnloadEvent (with `cancelled_by_resample` field) |
| LD-01-2 | LoadEventAdmin | FG outbound only; start/end datetime; LDService in save_model; get_readonly_fields |
| LD-01-3 | UnloadEventAdmin | FG inbound + RM inbound; qc_sample_taken checkbox; cancel on resample |
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

| CC-01-7 | YARD-01 integration | `CCAdminBase` (`command_center_officer`) + `LoadEventAdminBase` (`loading_personnel`) + `UnloadEventAdminBase` (`unloading_personnel`) → `YardAdminBase`; `QueueEntry.qc_passed`; `WaitingSerial` FK direction; `UnloadEvent.cancelled_by_resample`; `create_queue_entry` called atomically from `ScaleInService` |

**Last Updated**: 2026-06-03  
**Related Modules**: [gate-operations-sprint4.md](./gate-operations-sprint4.md), [scaling-operations-sprint4.md](./scaling-operations-sprint4.md), [yard-foundation-implementation.md](./yard-foundation-implementation.md), [05-transport](../05-transport/README.md)
