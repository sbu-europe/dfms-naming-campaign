---
module: 06-poi-operations
specification: Command Center, Loading/Unloading & QC Operations (Sprint 4 — TO-Centric)
version: 1.0
phase: Phase 1
sprint: Sprint 4
last_updated: 2026-05-16
related_stories: DFS-056 (CC-01), DFS-057 (LD-01), DFS-058 (QC-01)
jira_epic: DFS-072
---

# Command Center, Loading/Unloading & QC Operations (Sprint 4)

## Overview

This specification covers three tightly coupled modules in the yard chain:

- **CC-01 (Command Center)**: Queue management from scale-in token, bay/line assignment, waiting serial issuance. For RM inbound, CC flags the TO for QC visibility but **does not** assign an unloading point — that is the QC Supervisor's responsibility on QC Pass.
- **LD-01 (Loading/Unloading)**: Start/end timestamps, bags/weight/seal capture against an assigned bay. Loading events fire for FG outbound; unloading events fire for FG inbound and RM inbound.
- **QC-01 (QC Checkpoint)**: RM inbound only. Sample creation → Pass/Fail decision → unloading point assignment on Pass. Resample and override-to-failed are available during active unloading.

**Module paths**: `apps/operations/command_center/`, `apps/operations/loading/`, `apps/quality/checkpoint/`  
**Dependencies**: `apps/operations/scaling/` (QueueToken, WeighingSession), `apps/master_data/` (LoadingUnloadingPoint), `apps/transport/` (TransportOrder, FlowLane, TOStatus)  
**Enables**: Scale-out prerequisite (LD-01 completion), gate-out guard matrix (GT-01), TO closure (POD-01)

---

## 0. Per-Lane Yard Chain Summary

Understanding which module acts at each step per lane removes ambiguity for admin implementations:

| Step | FG outbound | FG inbound | RM inbound |
|------|------------|-----------|-----------|
| After gate-in | `at_source` | `at_destination` | `at_destination` |
| Scale-in (SC-01) | sub: `scale_in` → `waiting_cc` | sub: `scale_in` → `waiting_cc` | sub: `scale_in` → `waiting_cc` |
| CC queue visible | ✓ | ✓ | ✓ (CC flags for QC; does NOT assign unloading point) |
| **CC assigns loading point** | ✓ → sub: `assigned_loading_point` | — | — |
| **QC: sample + pass** (QC-01) | — | — | sub: `qc_passed`; QC assigns unloading point |
| **CC assigns unloading point** | — | ✓ → sub: `assigned_unloading_point` | ❌ QC Supervisor does this |
| Loading start/end (LD-01) | ✓ `LoadEvent` | — | — |
| Unloading start/end (LD-01) | — | ✓ `UnloadEvent` | ✓ `UnloadEvent` |
| Scale-out (SC-01) | gates: loading complete | gates: unloading complete | gates: unloading complete + QC pass |
| Gate-out (GT-01) | guard: scale-out + loading | guard: scale-out + unloading | guard: scale-out + unloading + QC pass |

---

## 1. Data Model

### 1.1 QueueEntry (new model — extends `TenantAwareModel`)

Auto-created by scale-in signal. Represents one vehicle in the CC assignment queue.

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
    # True for RM inbound TOs — set automatically from TO.flow_lane on creation

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
    waiting_serial: FK → WaitingSerial (OneToOne)

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

```python
WaitingSerial(TenantAwareModel) {
    id: UUID (PK)

    bay_assignment: FK → BayAssignment (OneToOne)
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

    # On Pass: QC Supervisor assigns unloading point directly
    unloading_point: FK → LoadingUnloadingPoint (nullable — set on Pass only)

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
| RM inbound | CC flags for QC | `flagged_for_qc` (no unloading point assigned) |

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
| QC Pass recorded | `qc_passed` | QC Supervisor assigns unloading point; BayAssignment created; UnloadEvent can be started |
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
        └─► [Assign Bay] button on each row (disabled if requires_qc=True and QC not passed)
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

### 3.4 RM inbound — flag for QC (no bay assignment)

```
CC Officer sees RM inbound QueueEntry (requires_qc=True)
  └─► [Flag for QC] button (no loading point selection)
        └─► CCService.flag_for_qc(queue_entry, flagged_by):
              ├─► QueueEntry.status stays 'waiting' (no BayAssignment yet)
              ├─► Emit QC_FLAGGED → TLS-01 (sub: flagged_for_qc)
              └─► TO becomes visible in QC Supervisor's queue (QC-01)
```

Note: CC **cannot** assign a bay for RM inbound TOs. The `[Assign Bay]` button is hidden/disabled when `requires_qc=True` and no `QCDecision(decision='pass')` exists.

After QC Pass, the **QC Supervisor** assigns the unloading point (see §5.2). A new `BayAssignment` entry then appears in the RM inbound TO's session.

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
  └─► Select: Unloading Point (dropdown — operation_type=UNLOAD, is_active=True, same POI)
  └─► Remarks (optional)
  └─► [Submit Decision]
        └─► QCService.record_decision(sample, 'pass', unloading_point, decided_by):
              ├─► Create QCDecision (decision='pass', is_active=True)
              ├─► Create BayAssignment (transport_order, unloading_point, assigned_by=supervisor)
              ├─► Auto-issue WaitingSerial for the BayAssignment
              ├─► QueueEntry.status = 'assigned'
              ├─► Emit QC_PASSED → TLS-01 (sub: qc_passed)
              └─► UnloadEvent can now be started by unloading personnel
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

### 6.1 QueueEntryAdmin (CC-01-2)

Uses `TenantOnlyAdminMixin`. **Primary working screen for CC Officer**.

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
    if entry.requires_qc:
        self.message_user(request, "RM inbound — use 'Flag for QC' instead.", level=messages.WARNING)
        return
    # Redirect to BayAssignmentAdmin add view with queue_entry pre-filled
    return redirect(f"..../bayassignment/add/?queue_entry={entry.pk}")
```

**Custom admin action: Flag for QC (RM inbound)**:

```python
@admin.action(description="Flag for QC (RM inbound)")
def flag_for_qc(self, request, queryset):
    for entry in queryset.filter(requires_qc=True, status="waiting"):
        CCService.flag_for_qc(entry, flagged_by=request.user)
    self.message_user(request, f"{queryset.count()} TO(s) flagged for QC.")
```

### 6.2 BayAssignmentAdmin (CC-01-3)

Uses `TenantOnlyAdminMixin`.

**Change Form**:
- `queue_entry`: autocomplete (filtered to status='waiting', poi=officer's POI, requires_qc=False)
- `loading_unloading_point`: **queryset restriction** — `formfield_for_foreignkey`:

```python
def formfield_for_foreignkey(self, db_field, request, **kwargs):
    if db_field.name == "loading_unloading_point":
        poi = get_poi_for_operator(request)
        # Infer operation_type from queue_entry if available
        queue_entry_id = request.GET.get("queue_entry")
        op_type = infer_operation_type(queue_entry_id)  # LOAD or UNLOAD from flow_lane
        kwargs["queryset"] = (
            LoadingUnloadingPoint.objects.filter(
                poi=poi, operation_type=op_type, is_active=True
            )
            .exclude(
                bay_assignments__is_active=True,  # exclude points currently in use
            )
        )
    return super().formfield_for_foreignkey(db_field, request, **kwargs)
```

- `save_model` → `CCService.assign_bay(...)`: creates BayAssignment, auto-issues WaitingSerial, updates QueueEntry status, emits TLS-01 event

### 6.3 LoadEventAdmin (LD-01-2)

Uses `TenantOnlyAdminMixin`. **FG outbound only**.

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

Uses `TenantOnlyAdminMixin`. **FG inbound + RM inbound**.

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

Uses `TenantOnlyAdminMixin`. **QC Supervisor role**.

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

Uses `TenantOnlyAdminMixin`. **QC Supervisor role**.

**Change Form**:
- `qc_sample`: autocomplete, filtered to samples without an active decision
- `decision`: radio buttons (Pass / Fail)
- `unloading_point`: FK dropdown — **only shown/required when `decision = 'pass'`**:
  - `formfield_for_foreignkey` filters to `operation_type=UNLOAD, is_active=True, poi=supervisor's POI`
  - `clean()`: validates `unloading_point` is set when `decision = 'pass'`
- `remarks`: required when `decision = 'fail'`
- `save_model`:
  - Pass: `QCService.record_decision('pass', unloading_point)` — creates BayAssignment, issues WaitingSerial, emits QC_PASSED
  - Fail: `QCService.record_decision('fail')` — blocks unloading/scale-out/gate-out, emits QC_FAILED

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
- Columns: Sample ID, TO Number, Decision badge (Pass/Fail), Unloading Point (nullable), Is Active, Decided At, Decided By
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

POST   /api/v1/command-center/flag-qc
       → Body: { queue_entry_id }
       → Validations: requires_qc=True, status=waiting
       → Side effects: sub_state = flagged_for_qc, TLS-01 event
       → Response: { queue_entry_id, sub_state }

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
       → Body: { qc_sample_id, decision (pass|fail), unloading_point_id (required if pass), remarks }
       → Side effects: QCDecision created; on pass: BayAssignment + WaitingSerial; TLS-01 event

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
- `unloading_point` required when `decision = 'pass'`
- `remarks` required when `decision = 'fail'` or `override-fail`
- Resample only when `QCDecision.is_active = True` (there must be a current decision to supersede)
- Override-to-fail only on `decision = 'pass'` active decisions; cannot override a fail to a fail

---

## 9. Integration Points

| Module | Direction | How |
|--------|-----------|-----|
| SC-01 (Scale-In) | Upstream | QueueToken created by SC-01; QueueEntry auto-created via signal |
| GT-01 (Gate-Out) | Downstream | LoadEvent/UnloadEvent completion + QCDecision.decision='pass' are gate-out guard conditions |
| SC-01 (Scale-Out) | Downstream gate | LoadEvent/UnloadEvent completion (+ QC pass for RM) unlocks scale-out |
| LUP-01 (Master Data) | Lookup | LoadingUnloadingPoint FK for bay assignment; queryset filtered by poi + operation_type + is_active |
| TLS-01 (Lifecycle) | Timeline | All events: BAY_ASSIGNED, QC_FLAGGED, LOADING_STARTED/COMPLETED, UNLOADING_STARTED/COMPLETED, QC_PASSED/FAILED, RESAMPLING_TRIGGERED, QC_OVERRIDDEN_FAIL |

---

## 10. Sprint 4 Story Mapping

### CC-01 — Command Center

| Sub-task | Scope | Implementation Focus |
|----------|-------|----------------------|
| CC-01-1 | Models + migration | QueueEntry, BayAssignment, WaitingSerial |
| CC-01-2 | QueueEntryAdmin | Queue dashboard list view; Assign Bay + Flag for QC custom actions |
| CC-01-3 | BayAssignmentAdmin | formfield_for_foreignkey for loading_unloading_point (op_type, active, not in use); CCService in save_model |
| CC-01-4 | CC queue REST API (GET) | Filter by status/requires_qc/poi |
| CC-01-5 | Bay assignment REST API (POST) | Flow lane + op_type validation; BayAssignment + WaitingSerial |
| CC-01-6 | Flag for QC REST API (POST) | RM inbound only; TLS-01 sub_state |

### LD-01 — Loading/Unloading

| Sub-task | Scope | Implementation Focus |
|----------|-------|----------------------|
| LD-01-1 | Models + migration | LoadEvent, UnloadEvent |
| LD-01-2 | LoadEventAdmin | FG outbound only; start/end datetime; LDService in save_model; get_readonly_fields |
| LD-01-3 | UnloadEventAdmin | FG inbound + RM inbound; qc_sample_taken checkbox; cancel on resample |
| LD-01-4 | Load events REST API | POST (start) + PATCH (complete) |
| LD-01-5 | Unload events REST API | POST (start) + PATCH (complete) + GET qc-handoff |

### QC-01 — QC Checkpoint (RM Inbound)

| Sub-task | Scope | Implementation Focus |
|----------|-------|----------------------|
| QC-01-1 | Models + migration | QCSample, QCDecision |
| QC-01-2 | QCSampleAdmin | TO queryset restricted to RM inbound at_destination + flagged_for_qc; QCService in save_model |
| QC-01-3 | QCDecisionAdmin | Unloading point shown only on Pass; remarks required on Fail; trigger_resample + override_to_failed admin actions |
| QC-01-4 | QC queue REST API (GET) | RM inbound TOs awaiting QC |
| QC-01-5 | QC sample REST API (POST) | Create sample |
| QC-01-6 | QC decision REST API (POST) | Pass (with unloading point) / Fail |
| QC-01-7 | Resample REST API (POST) | Supersede decision, cancel BayAssignment, clear UnloadEvent |
| QC-01-8 | Override-to-failed REST API (POST) | Same side effects as resample; decision set to fail |

---

**Last Updated**: 2026-05-16  
**Related Modules**: [gate-operations-sprint4.md](./gate-operations-sprint4.md), [scaling-operations-sprint4.md](./scaling-operations-sprint4.md), [05-transport](../05-transport/README.md)
