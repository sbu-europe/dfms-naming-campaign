---
module: 06-poi-operations
specification: QC Operations — Raw-Material Sampling & Pass/Fail Decision (Sprint 4)
version: 1.0
phase: Phase 1
sprint: Sprint 4
last_updated: 2026-05-16
related_stories: DFS-064 (QC-01)
jira_epic: DFS-072
---

# QC Operations Specification (Sprint 4)

## Overview

The **QC Operations** specification covers the Sprint 4 raw-material quality checkpoint that sits between scale-in and unloading assignment for **RM inbound** Transport Orders.

**Scope boundary**: QC Supervisor creates a sample and records a Pass or Fail decision. That is the full extent of QC's responsibility. On **Pass**, the TO is marked `qc_passed=True` and the **Command Center Officer** assigns the unloading point (CC-01). QC Supervisor does **not** assign the unloading point. On **Fail** the TO is fully blocked until a new Pass is recorded.

**Module path**: `apps/quality/checkpoint/`  
**Dependencies**: `apps/operations/command_center/` (QueueEntry, BayAssignment), `apps/operations/scaling/` (WeighingSession), `apps/transport/` (TransportOrder, FlowLane, TOStatus), `apps/master_data/` (POI)  
**Enables**: CC-01 unloading point assignment (on Pass), scale-out gate (QC pass required for RM inbound), gate-out guard matrix (GT-01), TO closure (POD-01)

---

## 0. QC Position in the RM Inbound Yard Chain

```
Gate-In (GT-01)
  └─► Scale-In (SC-01) — QueueEntry created, requires_qc=True
        └─► CC flags for QC (CC-01) — no unloading point assigned yet
              └─► QC Supervisor: Create Sample (QC-01)
                    └─► QC Supervisor: Record Decision (QC-01)
                          ├─► PASS: TO marked qc_passed=True → CC assigns unloading point (CC-01)
                          │           └─► Unloading starts (LD-01) → Scale-Out (SC-01) → Gate-Out (GT-01)
                          │
                          └─► FAIL: All downstream blocked (unloading, scale-out, gate-out)
                                    New sample + Pass required to unblock
```

**During unloading** (after CC assigns point and LD-01 starts):

```
QC Supervisor can:
  ├─► Trigger Resample → cancels active CC unloading assignment; TO returns to QC queue
  └─► Override to Failed → cancels active CC unloading assignment; gate-out blocked
```

---

## 1. Menu Structure & Navigation

```
Sidebar (QC Supervisor / Inspector)
└── Quality
      └── QC Checkpoint
            ├── My Queue              — RM inbound TOs flagged for QC, awaiting sample / decision
            │     └── [row click] ──► QC Detail: TO context + sample history + current decision
            │
            ├── Samples               — all QC samples for this POI (searchable)
            │
            └── Decisions             — all QC decisions for this POI; resample + override actions
```

### Role → menu mapping

| Role | My Queue | Samples | Decisions |
|------|:--------:|:-------:|:---------:|
| QC Supervisor | ✓ (create, decide, resample, override) | ✓ | ✓ |
| QC Inspector | ✓ (create sample only) | ✓ (read-only) | Read-only |
| CC Officer | — | — | Read-only (to check pass status) |
| Tenant Admin | — | Read-only | Read-only |

---

## 2. Data Model

### 2.1 QCSample (new model — extends `TenantAwareModel`)

One record per physical sample taken from the RM inbound vehicle.

```python
QCSample(TenantAwareModel) {
    id: UUID (PK)

    transport_order: FK → TransportOrder
    poi: FK → POI                            # destination_poi of the TO

    sample_id: string (max 30, unique per tenant)
    # Auto-generated on save: 'QC-{TO_NUMBER}-{seq:02d}'
    # seq increments per TO (01, 02, 03... for resamples)

    physical_analysis: text                  # inspector's observations (required)
    remarks: text (nullable)

    sampled_at: DateTime (auto = timezone.now on create)
    created_by: FK → User                    # QC Supervisor or Inspector
    created_at: DateTime
}
```

**Constraints**:
- `transport_order.flow_lane` must be `rm_inbound` — enforced in `QCService.create_sample()`
- `transport_order.status` must be `at_destination` — enforced in service (scale-in must have occurred)
- TO must have an active `QueueEntry` with `requires_qc=True` and `sub_state` in `['flagged_for_qc', 'sampling_started']`

### 2.2 QCDecision (new model — extends `TenantAwareModel`)

One active decision per TO at any point in time. Previous decisions are superseded (not deleted) when a resample is triggered.

```python
QCDecision(TenantAwareModel) {
    id: UUID (PK)

    transport_order: FK → TransportOrder
    qc_sample: FK → QCSample               # the sample this decision is based on

    decision: enum ['pass', 'fail']
    # No unloading_point FK — CC Officer assigns unloading point after Pass via CC-01

    is_active: boolean (default True)
    # Set to False when resample triggered; the new cycle's decision becomes is_active=True

    decided_at: DateTime (auto = timezone.now on create)
    decided_by: FK → User                  # QC Supervisor only
    remarks: text (nullable)               # required when decision = 'fail'
}
```

**Constraints**:
- At most one `is_active=True` decision per `transport_order` at any time (enforced in service)
- A decision cannot be recorded unless at least one `QCSample` exists for the TO
- `remarks` required when `decision = 'fail'`

### 2.3 Model relationship summary

```
TransportOrder (RM inbound)
  ├── QCSample (many — one per sample cycle)
  │     └── QCDecision (one per sample; is_active tracks current)
  └── QueueEntry (via CC-01)
        └── BayAssignment (created by CC after QC Pass — not by QC)
```

---

## 3. Service Layer (`apps/quality/checkpoint/services.py`)

All business rules live in `QCService`. Admin and API delegate to it — no logic in `save_model` beyond calling the service.

### 3.1 `QCService.create_sample(to, physical_analysis, remarks, created_by) → QCSample`

```python
def create_sample(
    to: TransportOrder,
    *,
    physical_analysis: str,
    remarks: str | None,
    created_by: User,
) -> QCSample:
    """
    Validates:
    - to.flow_lane == FlowLane.RM_INBOUND
    - to.status == TOStatus.AT_DESTINATION
    - Active QueueEntry with requires_qc=True exists
    - sub_state in ['flagged_for_qc', 'sampling_started']
    Creates:
    - QCSample with auto-generated sample_id
    Emits:
    - SAMPLING_STARTED event → TLS-01 (sub_state='sampling_started')
    """
```

### 3.2 `QCService.record_decision(sample, decision, decided_by, remarks) → QCDecision`

```python
def record_decision(
    sample: QCSample,
    *,
    decision: str,              # 'pass' or 'fail'
    decided_by: User,
    remarks: str | None = None,
) -> QCDecision:
    """
    Validates:
    - sample.transport_order has no other active QCDecision
    - remarks provided when decision='fail'
    Creates:
    - QCDecision (is_active=True)
    On Pass:
    - Sets TO sub_state → 'qc_passed'
    - Sets QueueEntry.qc_passed=True so CC [Assign Bay] is unblocked
    - Emits QC_PASSED → TLS-01
    On Fail:
    - Sets TO sub_state → 'qc_failed'
    - Emits QC_FAILED → TLS-01
    - Downstream blocked: CC assignment, scale-out, gate-out all check qc_passed
    """
```

### 3.3 `QCService.trigger_resample(to, triggered_by, remarks) → None`

```python
def trigger_resample(
    to: TransportOrder,
    *,
    triggered_by: User,
    remarks: str | None = None,
) -> None:
    """
    Validates:
    - Active QCDecision exists with is_active=True and decision='pass'
    - Active BayAssignment exists (unloading is in progress)
    Actions:
    - QCDecision.is_active = False  (superseded, not deleted)
    - BayAssignment.is_active = False, cancelled_at=now, cancellation_reason='qc_resample'
    - If active UnloadEvent (end_datetime is null): mark as cancelled_by_resample=True
    - QueueEntry.status = 'waiting', qc_passed=False  (back to CC queue, blocked)
    - Emits RESAMPLING_TRIGGERED → TLS-01 (sub_state='resampling')
    - New QCSample + QCDecision cycle starts fresh (QC Supervisor must call create_sample again)
    """
```

### 3.4 `QCService.override_to_failed(qc_decision, overridden_by, remarks) → None`

```python
def override_to_failed(
    qc_decision: QCDecision,
    *,
    overridden_by: User,
    remarks: str,
) -> None:
    """
    Validates:
    - qc_decision.is_active=True, decision='pass'
    - remarks provided (required for audit)
    Actions:
    - qc_decision.decision = 'fail', remarks updated (audit in place — same record, not new)
    - BayAssignment.is_active = False, cancelled_at=now, cancellation_reason='qc_override_fail'
    - If active UnloadEvent: mark as cancelled_by_resample=True
    - QueueEntry.qc_passed=False  (CC blocked from re-assigning)
    - Emits QC_OVERRIDDEN_FAIL → TLS-01 (sub_state='qc_failed')
    Note: CC stays blocked until a NEW QCSample + QCDecision(pass) is created.
    """
```

---

## 4. QC Flows

### 4.1 Sample creation

```
QC Supervisor opens QC Checkpoint → My Queue
  └─► Sees list of TOs: sub_state in ['flagged_for_qc', 'sampling_started'], same POI
        └─► Clicks row → QC Detail view
              ├─► Read-only context panel: TO Number, Vehicle, Product, Origin POI, Gross Weight
              ├─► Sample History: prior samples + decisions (read-only table)
              └─► [Create Sample] button (enabled if no active decision yet)
                    ├─► Enter: Physical Analysis (text, required)
                    └─► Enter: Remarks (optional)
                          └─► [Submit]
                                └─► QCService.create_sample(to, ...)
                                      └─► sample_id displayed; TO sub_state → 'sampling_started'
```

### 4.2 Recording a decision

```
QC Supervisor on QC Detail view (sample exists, no active decision)
  └─► [Record Decision] button
        ├─► Select: Sample (dropdown, pre-selected if only one)
        ├─► Decision: Pass / Fail (radio)
        ├─► Remarks: text area (required on Fail, optional on Pass)
        └─► [Submit Decision]
              ├─► PASS:
              │     └─► QCService.record_decision(sample, 'pass', ...)
              │           ├─► QCDecision created (is_active=True)
              │           ├─► QueueEntry.qc_passed = True
              │           ├─► Emit QC_PASSED → TLS-01
              │           └─► Success message: "QC Passed. CC Officer can now assign unloading point."
              │
              └─► FAIL:
                    └─► QCService.record_decision(sample, 'fail', remarks=..., ...)
                          ├─► QCDecision created (is_active=True)
                          ├─► Emit QC_FAILED → TLS-01
                          └─► Warning: "QC Failed. Unloading, scale-out, and gate-out are blocked."
```

### 4.3 Resample (during active unloading)

```
QC Supervisor on QC Detail view (decision='pass', unloading in progress)
  └─► [Trigger Resample] button (only shown when BayAssignment is active)
        ├─► Confirmation modal: "This will cancel the active unloading assignment. Continue?"
        └─► Remarks: reason for resample (optional)
              └─► [Confirm]
                    └─► QCService.trigger_resample(to, triggered_by, remarks)
                          ├─► Prior QCDecision.is_active = False
                          ├─► BayAssignment cancelled
                          ├─► UnloadEvent marked cancelled
                          ├─► QueueEntry returns to 'waiting' (CC blocked again)
                          └─► TO returns to QC queue; new [Create Sample] enabled
```

### 4.4 Override to failed (during active unloading)

```
QC Supervisor on QC Detail view (decision='pass', unloading in progress)
  └─► [Override to Failed] button (only shown when BayAssignment is active)
        ├─► Confirmation modal: "This will cancel the active unloading assignment and set QC to Failed."
        └─► Remarks: reason (required)
              └─► [Confirm]
                    └─► QCService.override_to_failed(qc_decision, overridden_by, remarks)
                          ├─► qc_decision.decision = 'fail' (same record, audited)
                          ├─► BayAssignment cancelled
                          ├─► UnloadEvent marked cancelled
                          ├─► QueueEntry.qc_passed = False
                          └─► New sample + Pass required before CC can re-assign
```

---

## 5. Django Admin Configuration

### 5.1 Design principle

Admin stays **thin**: validate → call service → message user. No business logic in `save_model`. The two custom actions (`trigger_resample`, `override_to_failed`) are the main admin-specific surfaces.

### 5.2 QCSampleAdmin (QC-01-2)

Uses `TenantOnlyAdminMixin`. Accessible to QC Supervisor and QC Inspector.

**Change Form**:
- `transport_order`: autocomplete, **queryset restricted** in `formfield_for_foreignkey`:

```python
def formfield_for_foreignkey(self, db_field, request, **kwargs):
    if db_field.name == "transport_order":
        poi = get_qc_poi_for_request(request)  # supervisor's assigned POI
        kwargs["queryset"] = (
            TransportOrder.objects
            .filter(
                flow_lane=FlowLane.RM_INBOUND,
                destination_poi=poi,
                status=TOStatus.AT_DESTINATION,
            )
            .filter(
                # QueueEntry must exist, be RM-flagged, not yet assigned to unloading
                queue_entry__requires_qc=True,
                queue_entry__status__in=["waiting", "assigned"],
            )
            .select_related("destination_poi")
            .order_by("-updated_at")
        )
    return super().formfield_for_foreignkey(db_field, request, **kwargs)
```

- **Read-only context panel** (`readonly_fields`): `to_context_panel` — shows TO Number, Vehicle reg, Product, Origin POI, Gross Weight (from WeighingSession), Current QC Status badge
- `physical_analysis`: textarea (required)
- `remarks`: textarea (optional)
- `sample_id`: `readonly_field` — auto-generated by service on save, displayed after save
- `sampled_at`: `readonly_field` — set by service (not editable)
- `save_model`:

```python
def save_model(self, request, obj, form, change):
    if change:
        # Samples are immutable after creation — block edits
        self.message_user(request, "QC samples cannot be edited after creation.", level=messages.ERROR)
        return
    try:
        sample = QCService.create_sample(
            obj.transport_order,
            physical_analysis=obj.physical_analysis,
            remarks=obj.remarks,
            created_by=request.user,
        )
        # Bind the service-created instance so Django admin saves the right object
        obj.pk = sample.pk
    except ValidationError as e:
        self.message_user(request, str(e), level=messages.ERROR)
```

- `has_change_permission`: always returns `False` (samples are immutable)
- `has_delete_permission`: always returns `False`

**List View**:
- Columns: Sample ID, TO Number, Vehicle, Gross Weight (MT), Sampled At, Has Active Decision badge, Created By
- Filters: `poi`, `sampled_at` (date hierarchy), `transport_order__status`
- Search: Sample ID, TO number, vehicle registration
- Date hierarchy: `sampled_at`

**Detail View** (read-only after save):
- TO context panel (TO number, vehicle, product, POI, gross weight)
- Physical analysis, remarks, sample ID, sampled at, created by

### 5.3 QCDecisionAdmin (QC-01-3)

Uses `TenantOnlyAdminMixin`. Accessible to **QC Supervisor only** (not Inspector).

**Change Form**:
- `qc_sample`: autocomplete, **queryset restricted** — only samples whose TO has no active `QCDecision`:

```python
def formfield_for_foreignkey(self, db_field, request, **kwargs):
    if db_field.name == "qc_sample":
        poi = get_qc_poi_for_request(request)
        # Samples where: TO is RM inbound, at this POI, no active QCDecision yet
        already_decided = QCDecision.objects.filter(
            is_active=True
        ).values_list("qc_sample__transport_order_id", flat=True)
        kwargs["queryset"] = (
            QCSample.objects
            .filter(transport_order__destination_poi=poi)
            .exclude(transport_order_id__in=already_decided)
            .select_related("transport_order")
            .order_by("-sampled_at")
        )
    return super().formfield_for_foreignkey(db_field, request, **kwargs)
```

- **Read-only context panel**: `qc_context_panel` — TO Number, Vehicle, Sample ID, Physical Analysis (from selected sample), Current sub_state badge
- `decision`: radio buttons `[( ) Pass  ( ) Fail]` — **no unloading_point field**
- `remarks`: textarea — required on Fail, optional on Pass; `clean()` enforces this

```python
def clean(self):
    decision = self.cleaned_data.get("decision")
    remarks = self.cleaned_data.get("remarks")
    if decision == "fail" and not remarks:
        raise forms.ValidationError({"remarks": "Remarks are required when decision is Fail."})
    return self.cleaned_data
```

- `decided_at`, `decided_by`: `readonly_fields` — set by service
- `save_model`:

```python
def save_model(self, request, obj, form, change):
    if change:
        self.message_user(request, "Decisions cannot be edited. Use Resample or Override actions.", level=messages.ERROR)
        return
    try:
        QCService.record_decision(
            obj.qc_sample,
            decision=obj.decision,
            decided_by=request.user,
            remarks=obj.remarks,
        )
    except ValidationError as e:
        self.message_user(request, str(e), level=messages.ERROR)
        return
    if obj.decision == "pass":
        self.message_user(request, "QC Passed. Command Center can now assign the unloading point.")
    else:
        self.message_user(request, "QC Failed. Unloading, scale-out, and gate-out are blocked.", level=messages.WARNING)
```

- `has_change_permission`: always returns `False` (decisions are immutable — use admin actions)
- `has_delete_permission`: always returns `False`

**Custom admin actions** (on active decisions only):

```python
@admin.action(description="Trigger Resample — cancels active unloading assignment")
def trigger_resample(self, request, queryset):
    eligible = queryset.filter(is_active=True, decision="pass")
    if queryset.count() != eligible.count():
        self.message_user(
            request,
            "Only active Pass decisions can be resampled. Skipping ineligible rows.",
            level=messages.WARNING,
        )
    for decision in eligible:
        try:
            QCService.trigger_resample(
                decision.transport_order,
                triggered_by=request.user,
            )
        except ValidationError as e:
            self.message_user(request, f"TO {decision.transport_order}: {e}", level=messages.ERROR)
            return
    self.message_user(
        request,
        f"{eligible.count()} resample(s) triggered. Active unloading assignment(s) cancelled.",
    )


@admin.action(description="Override to Failed — cancels active unloading assignment")
def override_to_failed(self, request, queryset):
    eligible = queryset.filter(is_active=True, decision="pass")
    if queryset.count() != eligible.count():
        self.message_user(
            request,
            "Only active Pass decisions can be overridden. Skipping ineligible rows.",
            level=messages.WARNING,
        )
    # Remarks required — redirect to an intermediate form (standard Django intermediate-action pattern)
    # Store selected IDs in session, redirect to a custom view that collects remarks, then calls service
    request.session["qc_override_ids"] = list(eligible.values_list("id", flat=True))
    return redirect("admin:qc_override_remarks_form")
```

Note: The override action uses the **intermediate-form pattern** (standard Django admin practice) to collect required `remarks` before committing. A lightweight `OverrideRemarksForm` view renders a textarea, validates, then calls `QCService.override_to_failed()` for each selected decision.

**List View**:
- Columns: Sample ID, TO Number, Vehicle, Decision badge (Pass/Fail), Is Active badge, Decided At, Decided By
- Decision badge colours:

```python
_DECISION_BADGE = {
    "pass": ("dfms-badge--approved",   "bi-check-circle", "Pass"),
    "fail": ("dfms-badge--cancelled",  "bi-x-circle",     "Fail"),
}
```

- Filters: `decision`, `is_active`, `qc_sample__transport_order__destination_poi`, `decided_at` (date range)
- Search: Sample ID, TO number, vehicle registration

**Detail View** (read-only):
- Sample ID, TO Number, Vehicle, Physical Analysis, Decision badge, Is Active, Remarks, Decided At, Decided By

---

## 6. API Endpoints (QC-01)

```http
GET    /api/v1/qc/queue?poi=
       → RM inbound TOs visible to QC: sub_state in [flagged_for_qc, sampling_started]
       → Scoped to supervisor's assigned POI
       → Response: [{ to_id, to_number, vehicle, gross_weight_mt, sub_state, sample_count, has_active_decision }]

POST   /api/v1/qc/samples
       → Body: { transport_order_id, physical_analysis, remarks (nullable) }
       → Validations: flow_lane=RM_INBOUND, status=AT_DESTINATION, flagged_for_qc
       → Side effects: QCSample created (sample_id auto-gen), SAMPLING_STARTED → TLS-01
       → Response: { sample_id, sampled_at, transport_order: { to_number, sub_state } }

GET    /api/v1/qc/samples?poi=&to_id=
       → List QC samples; filterable by POI and TO

POST   /api/v1/qc/decisions
       → Body: { qc_sample_id, decision ("pass"|"fail"), remarks (required if fail) }
       → Validations: sample exists, no active decision on TO, remarks on fail
       → Side effects (Pass): QCDecision created, qc_passed=True, QueueEntry unblocked, QC_PASSED → TLS-01
       → Side effects (Fail): QCDecision created, QC_FAILED → TLS-01, all downstream blocked
       → Response: { decision_id, decision, decided_at, sub_state }

GET    /api/v1/qc/decisions?poi=&to_id=&is_active=
       → List decisions; is_active=true returns only the current live decision per TO

POST   /api/v1/qc/decisions/{decision_id}/resample
       → Body: { remarks (nullable) }
       → Validations: decision.is_active=True, decision='pass', active BayAssignment exists
       → Side effects: prior decision superseded, BayAssignment cancelled, UnloadEvent cleared,
                       QueueEntry.qc_passed=False, RESAMPLING_TRIGGERED → TLS-01
       → Response: { status: "resampled", transport_order: { to_number, sub_state: "resampling" } }

POST   /api/v1/qc/decisions/{decision_id}/override-fail
       → Body: { remarks (required) }
       → Validations: decision.is_active=True, decision='pass', remarks not blank
       → Side effects: decision changed to fail (same record), BayAssignment cancelled,
                       UnloadEvent cleared, QueueEntry.qc_passed=False, QC_OVERRIDDEN_FAIL → TLS-01
       → Response: { status: "overridden", transport_order: { to_number, sub_state: "qc_failed" } }
```

---

## 7. Validation Rules

### Entry conditions
- QC actions only available after CC-01 has flagged the TO (`sub_state='flagged_for_qc'`)
- TO must be RM inbound (`flow_lane='rm_inbound'`), at destination POI, status `at_destination`

### Sample creation
- `physical_analysis` required (not blank)
- Multiple samples allowed on a TO (resample history); each gets its own sequential `sample_id`
- Samples are immutable after creation — no edit, no delete

### Decision recording
- A decision can only be recorded when at least one `QCSample` exists for the TO
- At most one `is_active=True` decision per TO at any time
- `remarks` required on Fail
- Decisions are immutable after recording — changes happen via resample or override actions only

### Resample
- Requires `QCDecision.is_active=True` and `decision='pass'`
- Requires an active `BayAssignment` (unloading must have been assigned — meaning it was in progress)
- Clears the pass state; CC cannot re-assign until a new QCSample + QCDecision(pass) is recorded

### Override to failed
- Requires `QCDecision.is_active=True` and `decision='pass'`
- `remarks` always required
- Does **not** create a new `QCDecision` — mutates the existing pass decision to fail (audited via `TOStatusTransitionLog`)
- CC stays blocked until a brand-new sample + pass cycle completes

---

## 8. TLS-01 Events Emitted

| Action | Event key | Sub-state written | Payload |
|--------|-----------|-------------------|---------|
| Sample created | `SAMPLING_STARTED` | `sampling_started` | `{ sample_id, created_by }` |
| Pass recorded | `QC_PASSED` | `qc_passed` | `{ decision_id, decided_by }` |
| Fail recorded | `QC_FAILED` | `qc_failed` | `{ decision_id, decided_by, remarks }` |
| Resample triggered | `RESAMPLING_TRIGGERED` | `resampling` | `{ prior_decision_id, triggered_by, remarks }` |
| Override to failed | `QC_OVERRIDDEN_FAIL` | `qc_failed` | `{ decision_id, overridden_by, remarks, prior_decision: 'pass' }` |

All events include `transport_order_id`, `poi_id`, `actor_id`, `timestamp`.

---

## 9. Integration Points

| Module | Direction | How |
|--------|-----------|-----|
| CC-01 (flag for QC) | Upstream trigger | CC sets `QueueEntry.requires_qc=True` and `sub_state='flagged_for_qc'`; QC queue becomes visible |
| CC-01 (assign unloading point) | Downstream unlock | QC Pass sets `QueueEntry.qc_passed=True`; CC's `[Assign Bay]` button unblocks for RM inbound TOs |
| CC-01 (cancel assignment on resample/override) | Downstream cancellation | `QCService` calls `CCService.cancel_bay_assignment(assignment, reason)` |
| LD-01 (UnloadEvent) | Downstream cancellation | Resample/override sets `UnloadEvent.cancelled_by_resample=True`; LD-01 cannot complete an event in this state |
| SC-01 (gate for scale-out) | Downstream gate | Scale-out service checks `QCDecision` exists with `decision='pass'` and `is_active=True` before allowing scale-out for RM inbound |
| GT-01 (gate-out guard) | Downstream gate | Gate-out guard matrix checks `QCDecision.decision='pass'` for RM inbound |
| TLS-01 | Timeline | All 5 event types written via event ingest service |
| POD-01 (closure) | Closure gate | `ClosureChecklist.qc_passed` reads latest active `QCDecision.decision == 'pass'` for RM inbound TOs |

---

## 10. Permissions (RBAC)

Permission codes (add to `apps/core/constants_rbac.py`):

```python
Quality.QCCheckpoint.Sample.Create    # QC Supervisor, QC Inspector
Quality.QCCheckpoint.Decision.Write   # QC Supervisor only
Quality.QCCheckpoint.Resample         # QC Supervisor only
Quality.QCCheckpoint.Override         # QC Supervisor only
Quality.QCCheckpoint.Read             # QC Supervisor, QC Inspector, CC Officer, TP, TDO
```

Menu code (add to `apps/core/portal_navigation.py`):

```python
Menu.QC.Checkpoint.View
Menu.QC.Checkpoint.Queue.View
```

---

## 11. Sprint 4 Story Mapping

### QC-01 — Raw-Material QC Checkpoint

| Sub-task | Scope | Implementation Focus |
|----------|-------|----------------------|
| QC-01-1 | Models + migration | `QCSample` (sample_id auto-gen, physical_analysis, remarks, FK to TO + POI); `QCDecision` (decision enum, is_active, FK to sample + TO; **no unloading_point FK**) |
| QC-01-2 | `QCSampleAdmin` | `formfield_for_foreignkey` restricts TO to RM inbound, AT_DESTINATION, flagged; TO context panel readonly_fields; `save_model` → `QCService.create_sample()`; `has_change_permission=False` |
| QC-01-3 | `QCDecisionAdmin` | `formfield_for_foreignkey` restricts samples to undecided; no unloading_point field; `clean()` enforces remarks on Fail; `save_model` → `QCService.record_decision()`; `has_change_permission=False` |
| QC-01-4 | `trigger_resample` admin action | Single-row only; calls `QCService.trigger_resample()`; user-facing success/error message |
| QC-01-5 | `override_to_failed` admin action | Intermediate-form pattern to collect required remarks; calls `QCService.override_to_failed()` |
| QC-01-6 | `QCService` | `create_sample()`, `record_decision()`, `trigger_resample()`, `override_to_failed()` — all validation + side effects |
| QC-01-7 | QC queue API (`GET`) | Filter: `destination_poi`, `sub_state` in flagged/sampling; includes sample_count + decision status |
| QC-01-8 | Sample API (`POST`/`GET`) | Create sample; list by POI/TO |
| QC-01-9 | Decision API (`POST`/`GET`) | Record Pass/Fail; no unloading_point; list with `is_active` filter |
| QC-01-10 | Resample API (`POST`) | Supersede decision; cancel CC assignment; clear UnloadEvent |
| QC-01-11 | Override-to-fail API (`POST`) | Mutate decision; cancel CC assignment; clear UnloadEvent |
| QC-01-12 | TLS-01 event emission | 5 event types (§8); called from service, not admin |
| QC-01-13 | CC-01 / LD-01 cancellation integration | `CCService.cancel_bay_assignment()` called from QCService; `UnloadEvent.cancelled_by_resample` flag set |

---

**Last Updated**: 2026-05-16  
**Related Modules**: [command-center-loading-sprint4.md](./command-center-loading-sprint4.md), [gate-operations-sprint4.md](./gate-operations-sprint4.md), [scaling-operations-sprint4.md](./scaling-operations-sprint4.md)
