---
module: 06-poi-operations
specification: QC Operations — Raw-Material Sampling & Pass/Fail Decision (Sprint 4)
version: 1.1
phase: Phase 1
sprint: Sprint 4 (QC trigger alignment — Sprint 5 / FB-006)
last_updated: 2026-06-03
changelog: "v1.1 — QC-01-13 / FB-006: QC required from product lines (to_requires_qc_from_lines); flagged_for_qc auto at scale-in (not CC manual flag); entry/resample sub_states aligned with command-center-loading v1.1"
related_stories: DFS-064 (QC-01)
jira_epic: DFS-072
---

# QC Operations Specification (Sprint 4)

## Overview

The **QC Operations** specification covers the Sprint 4 raw-material quality checkpoint that sits between scale-in and unloading assignment for **RM inbound** Transport Orders **when product lines require QC** (`to_requires_qc_from_lines` — any `TOLineItem` with `Product.requires_qc=True`). TOs with no QC-required products skip this module entirely (CC assigns unloading immediately after scale-in).

**Scope boundary**: The POI-scoped yard role **`qc_inspector_physical`** (`QC Inspector – Physical`, `SEED_ROLES`) performs sampling and Pass/Fail decisions when granted write permissions (see §1.1). That is the full extent of QC's responsibility. On **Pass**, the TO is marked `qc_passed=True` and the **`command_center_officer`** assigns the unloading point (CC-01). QC does **not** assign the unloading point. On **Fail** the TO is fully blocked until a new Pass is recorded.

There is **no** `qc_supervisor` role code in `apps/core/role_seed_data.py`. Supervisor-style actions (decide, resample, override) are gated by `Quality.QCCheckpoint.*` write permissions on `QCAdminBase`, not by a second seeded role.

**Module path**: `apps/quality/checkpoint/`  
**Dependencies**: `apps/operations/command_center/` (QueueEntry, BayAssignment), `apps/operations/scaling/` (WeighingSession), `apps/transport/` (TransportOrder, FlowLane, TOStatus), `apps/master_data/` (POI), **`YARD-01`** (YardAdminBase, yard_poi, UserOperationalPOI, TOSubState)  
**Enables**: CC-01 unloading point assignment (on Pass, when `requires_qc`), scale-out gate (QC pass when TO `requires_qc`), gate-out guard matrix (GT-01), TO closure (POD-01)

### Codebase baseline (May 2026)

| Path | Exists | Notes |
|------|--------|-------|
| `apps/quality/models.py` | ✓ | Legacy `QCEvent`, `QCSample`, `QCInspection` linked to `GateEntry` (old 13-state machine). **Frozen — do not extend.** |
| `apps/quality/admin.py` | ✗ | Does not exist |
| `apps/quality/checkpoint/` | ✗ | Directory does not exist — must be created as a Django sub-package |

Sprint 4 QC models (`QCSample`, `QCDecision`) live in `apps/quality/checkpoint/models.py` to isolate them from the legacy `QCEvent`-based models. The legacy models remain in place and are **not modified**.

---

## 0. QC Position in the RM Inbound Yard Chain

```
Gate-In (GT-01)
  └─► Scale-In (SC-01) — CCService.create_queue_entry in same transaction
        ├─► requires_qc = to_requires_qc_from_lines(to)  # any line Product.requires_qc (GT-02-12 / FB-006)
        │
        ├─► [requires_qc = True]
        │     ├─► TLS-01 sub_state → flagged_for_qc (auto; no CC manual flag)
        │     ├─► No unloading point assigned yet
        │     └─► QC Inspector – Physical: Create Sample (QC-01)
        │           └─► QC Inspector – Physical (+ write perm): Record Decision (QC-01)
        │                 ├─► PASS: TO qc_passed=True → CC assigns unloading (CC-01) → LD-01 → SC-01 → GT-01
        │                 └─► FAIL: unloading / scale-out / gate-out blocked until new Pass
        │
        └─► [requires_qc = False] — E2E-03 negative case
              └─► sub_state → waiting_cc; CC assigns unloading immediately (QC module not used)
```

**During unloading** (after CC assigns point and LD-01 starts):

```
User with `Quality.QCCheckpoint.Decision.Write` (typically `qc_inspector_physical` + write perm, or `gate_supervisor`) can:
  ├─► Trigger Resample → cancels active CC unloading assignment; TO returns to QC queue
  └─► Override to Failed → cancels active CC unloading assignment; gate-out blocked
```

---

## 1. Menu Structure & Navigation

```
Sidebar (`qc_inspector_physical` — QC Inspector – Physical)
└── Quality
      └── QC Checkpoint
            ├── My Queue              — RM inbound TOs with requires_qc (auto flagged_for_qc at scale-in), awaiting sample / decision
            │     └── [row click] ──► QC Detail: TO context + sample history + current decision
            │
            ├── Samples               — all QC samples for this POI (searchable)
            │
            └── Decisions             — all QC decisions for this POI; resample + override actions
```

### Role → menu mapping

Uses seeded role **codes** from `apps/core/role_seed_data.py` / `apps/users/yard_constants.POI_SCOPED_ROLE_CODES`. Capability within QC Checkpoint is split by **permission**, not by a second QC role.

| Role code | Display name | My Queue | Samples | Decisions |
|-----------|--------------|:--------:|:-------:|:---------:|
| `qc_inspector_physical` + `Quality.QCCheckpoint.Decision.Write` | QC Inspector – Physical (write) | ✓ create, decide, resample, override | ✓ | ✓ |
| `qc_inspector_physical` (read only) | QC Inspector – Physical | ✓ create sample only | ✓ read-only | Read-only |
| `gate_supervisor` | Gate Supervisor | Read-only audit | Read-only | Read-only (+ override via `supervisor_role_codes`) |
| `command_center_officer` | Command Center Officer | — | — | Read-only (pass status for CC-01) |
| `tenant_admin` | Tenant Admin | — | Read-only | Read-only |

### 1.1 RBAC — seeded role (`qc_inspector_physical`)

| Field | Value |
|-------|--------|
| Role code | `qc_inspector_physical` |
| Display name | QC Inspector – Physical |
| Department | `PredefinedDepartment.QA_QC` |
| POI-scoped | Yes — requires active `UserOperationalPOI` (YARD-01) |
| Current seed menus | `MENU_DASHBOARD_VIEW`, `REQUISITION_TR_READ`, `MENU_QC_VIEW`, `MENU_REQUISITIONS_VIEW` |

**Sprint 4 seed additions** (assign on `qc_inspector_physical` in `role_seed_data.py`; register codes in `constants_rbac.py`):

| Permission | Typical grantee |
|------------|-----------------|
| `Quality.QCCheckpoint.Sample.Create` | `qc_inspector_physical` |
| `Quality.QCCheckpoint.Read` | `qc_inspector_physical`, `command_center_officer`, transport planner / TDO roles as needed |
| `Quality.QCCheckpoint.Decision.Write` | `qc_inspector_physical` (senior inspectors) **or** rely on `gate_supervisor` via `QCAdminBase.supervisor_role_codes` |
| `Quality.QCCheckpoint.Resample` | Same as Decision.Write |
| `Quality.QCCheckpoint.Override` | Same as Decision.Write |
| `Menu.QC.Checkpoint.View` | `qc_inspector_physical` (replaces legacy `MENU_QC_VIEW` for yard checkpoint nav when portal block is enabled) |

**Admin base** (`QCAdminBase`): `operator_role_code = "qc_inspector_physical"`; `supervisor_role_codes = frozenset({"gate_supervisor", "tenant_admin"})` — same pattern as `ScalingAdminBase` / `GateAdminBase`.

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
    created_by: FK → User                    # qc_inspector_physical (or supervisor with write perm)
    created_at: DateTime
}
```

**Constraints**:
- `transport_order.flow_lane` must be `rm_inbound` — enforced in `QCService.create_sample()`
- `transport_order.status` must be `at_destination` — enforced in service (scale-in must have occurred)
- `to_requires_qc_from_lines(transport_order)` must be True (QC-01-13 / FB-006) — not all RM inbound by lane
- TO must have an active `QueueEntry` with `requires_qc=True` (set at queue creation from product lines)
- `sub_state` in `['flagged_for_qc', 'sampling_started', 'resampling']` — `flagged_for_qc` is written automatically at scale-in when QC is required (see [command-center-loading-sprint4.md](./command-center-loading-sprint4.md) v1.1 §3.4)

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
    decided_by: FK → User                  # requires Quality.QCCheckpoint.Decision.Write
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
    - to_requires_qc_from_lines(to) is True
    - Active QueueEntry with requires_qc=True exists
    - sub_state in ['flagged_for_qc', 'sampling_started', 'resampling']
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
    - New QCSample + QCDecision cycle starts fresh (qc_inspector_physical must call create_sample again)
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
qc_inspector_physical opens QC Checkpoint → My Queue
  └─► Sees list of TOs: requires_qc=True, sub_state in ['flagged_for_qc', 'sampling_started', 'resampling'], same POI
        (TOs appear after scale-in auto-flag — not after a CC officer action)
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
User with Decision.Write on QC Detail view (sample exists, no active decision)
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
User with Decision.Write on QC Detail view (decision='pass', unloading in progress)
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
User with Decision.Write on QC Detail view (decision='pass', unloading in progress)
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

### UI — design system consistency (required)

All QC inspector admin screens must match the **existing DFMS Django admin shell** (Sprint 1 PAP-01). Reuse patterns from `apps/operations/gate/admin.py` and `data-display.md` — do not introduce parallel CSS, badge colours, or pagination markup.

| Asset | Purpose |
|-------|---------|
| `static/admin/css/custom.css` | Tokens, light/dark theme, tables, cards, buttons, pagination, forms |
| `static/admin/js/dfms_theme.js` | Theme toggle |
| `templates/admin/dynamic_pagination_changelist.html` | Changelist pagination via `QCAdminBase` → `YardAdminBase` |
| `DFMS-product-context/07-design-system/02-components/data-display.md` | Badge catalogue (`dfms-badge--approved`, `dfms-badge--cancelled`, etc.) |
| `.cursor/rules/django-admin-draft-submit.mdc` | Buttons, breadcrumbs, override intermediate forms |

**Required patterns**

1. **Mixin stack**: `QCAdminBase` → `YardAdminBase` → `DynamicPaginationMixin`.
2. **Status badges**: Use `_DECISION_BADGE` / QC status mappings with `dfms-badge--*` modifiers only (see §5.3–5.4); Bootstrap Icons at 10px.
3. **Buttons**: Override and resample flows use `dfms-btn-secondary` / primary save classes; intermediate override form matches standard admin form layout.
4. **Tables & cards**: Default `#result_list`; readonly `to_context_panel` / `qc_context_panel` use gate-style panels, not custom card CSS.
5. **Pagination**: Shared mixin only.
6. **Light/dark mode**: Verify sample list, decision list, and override form in both themes.
7. **Custom templates**: Extend `admin/change_form.html` for override remarks; no extra CSS files.

### 5.1 Design principle

Admin stays **thin**: validate → call service → message user. No business logic in `save_model`. The two custom actions (`trigger_resample`, `override_to_failed`) are the main admin-specific surfaces.

### 5.0 YARD-01 integration: admin base and POI resolution

`QCAdminBase` inherits `YardAdminBase` from `apps/operations/admin_base.py` (YARD-01 Step 5). Placed in `apps/quality/checkpoint/admin.py`:

```python
from apps.operations.admin_base import YardAdminBase
from apps.core.constants_rbac import PermissionCodes

class QCAdminBase(YardAdminBase):
    operator_role_code    = "qc_inspector_physical"   # SEED_ROLES / POI_SCOPED_ROLE_CODES
    supervisor_role_codes = frozenset({"gate_supervisor", "tenant_admin"})
    read_perm  = PermissionCodes.QUALITY_QC_CHECKPOINT_READ
    write_perm = PermissionCodes.QUALITY_QC_CHECKPOINT_DECISION_WRITE
```

**POI resolution**: `_scope_poi_id(request)` returns the inspector's assigned POI via `UserOperationalPOI` for `qc_inspector_physical`. The `get_qc_poi_for_request(request)` helper referenced in the `formfield_for_foreignkey` examples below is replaced by `self._scope_poi_id(request)` (consistent with other yard admins). A dedicated `qc_poi.py` is **not needed** — `yard_poi.get_working_poi_for_request` covers this.

**`get_queryset`** automatically filters QC records to `poi_id=scope_poi_id`. Additionally, the QC queue changelist filters by `transport_order__sub_state__in=[TOSubState.FLAGGED_FOR_QC, TOSubState.SAMPLING_STARTED, TOSubState.RESAMPLING]` and `queue_entry__requires_qc=True` so that only actionable items appear.

**`QueueEntry.qc_passed` update**: when `QCService.record_decision(decision='pass')` is called, it must also set `QueueEntry.qc_passed=True` for the TO's active queue entry. This unblocks the CC bay-assignment form.

### 5.2 QCSampleAdmin (QC-01-2)

Uses `QCAdminBase` (→ `YardAdminBase`). Add allowed for `qc_inspector_physical` (and supervisors). Edit blocked (`has_change_permission=False`).

**Change Form**:
- `transport_order`: autocomplete, **queryset restricted** in `formfield_for_foreignkey`:

```python
def formfield_for_foreignkey(self, db_field, request, **kwargs):
    if db_field.name == "transport_order":
        poi_id = self._scope_poi_id(request)  # from YardAdminBase
        qs = (
            TransportOrder.objects
            .filter(
                flow_lane=FlowLane.RM_INBOUND,
                status=TOStatus.AT_DESTINATION,
                sub_state__in=[
                    TOSubState.FLAGGED_FOR_QC,
                    TOSubState.SAMPLING_STARTED,
                    TOSubState.RESAMPLING,
                ],
            )
            .filter(
                queue_entry__requires_qc=True,
                queue_entry__status__in=["waiting", "assigned"],
            )
            .select_related("destination_poi")
            .order_by("-updated_at")
        )
        if poi_id:
            qs = qs.filter(destination_poi_id=poi_id)
        kwargs["queryset"] = qs
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

Uses `QCAdminBase` (→ `YardAdminBase`). Add / resample / override require `write_perm` (`Quality.QCCheckpoint.Decision.Write` or `gate_supervisor`). Read-only list for inspectors without write.

**Change Form**:
- `qc_sample`: autocomplete, **queryset restricted** — only samples whose TO has no active `QCDecision`:

```python
def formfield_for_foreignkey(self, db_field, request, **kwargs):
    if db_field.name == "qc_sample":
        poi_id = self._scope_poi_id(request)  # from YardAdminBase
        already_decided = QCDecision.objects.filter(
            is_active=True
        ).values_list("qc_sample__transport_order_id", flat=True)
        qs = (
            QCSample.objects
            .exclude(transport_order_id__in=already_decided)
            .select_related("transport_order")
            .order_by("-sampled_at")
        )
        if poi_id:
            qs = qs.filter(transport_order__destination_poi_id=poi_id)
        kwargs["queryset"] = qs
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
       → RM inbound TOs visible to QC: requires_qc=True, sub_state in [flagged_for_qc, sampling_started, resampling]
       → Scoped to supervisor's assigned POI
       → Response: [{ to_id, to_number, vehicle, gross_weight_mt, sub_state, sample_count, has_active_decision }]

POST   /api/v1/qc/samples
       → Body: { transport_order_id, physical_analysis, remarks (nullable) }
       → Validations: flow_lane=RM_INBOUND, status=AT_DESTINATION, to_requires_qc_from_lines, requires_qc QueueEntry, sub_state in [flagged_for_qc, sampling_started, resampling]
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
- QC applies only when `to_requires_qc_from_lines(to)` is True (any product line with `Product.requires_qc=True` — QC-01-13 / FB-006)
- After scale-in, SC-01 / CC-01 auto-set `sub_state='flagged_for_qc'` when QC is required (no CC manual flag on happy path)
- Sample/decision actions require `sub_state` in `flagged_for_qc`, `sampling_started`, or `resampling` and active `QueueEntry.requires_qc=True`
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
| SC-01 + CC-01 (scale-in / queue) | Upstream trigger | `CCService.create_queue_entry` sets `requires_qc=to_requires_qc_from_lines(to)`; when True, auto `sub_state='flagged_for_qc'` — QC queue becomes visible (see [command-center-loading-sprint4.md](./command-center-loading-sprint4.md) v1.1, [gate-operations-sprint4.md](./gate-operations-sprint4.md) v2.8 §9.4) |
| CC-01 (assign unloading point) | Downstream unlock | QC Pass sets `QueueEntry.qc_passed=True`; CC's `[Assign Bay]` unblocks when `requires_qc=True` |
| CC-01 (cancel assignment on resample/override) | Downstream cancellation | `QCService` calls `CCService.cancel_bay_assignment(assignment, reason)` |
| LD-01 (UnloadEvent) | Downstream cancellation | Resample/override sets `UnloadEvent.cancelled_by_resample=True`; LD-01 cannot complete an event in this state |
| SC-01 (gate for scale-out) | Downstream gate | When TO `requires_qc`, scale-out checks active Pass decision (or `TO.qc_passed`) |
| GT-01 (gate-out guard) | Downstream gate | When TO `requires_qc`, gate-out guard checks QC pass / not failed |
| TLS-01 | Timeline | All 5 event types written via event ingest service |
| POD-01 (closure) | Closure gate | `ClosureChecklist.qc_passed` reads latest active `QCDecision.decision == 'pass'` for RM inbound TOs |

---

## 10. Permissions (RBAC)

Permission codes (add to `apps/core/constants_rbac.py` as `PermissionCodes` constants, e.g. `QUALITY_QC_CHECKPOINT_READ`):

```python
Quality.QCCheckpoint.Sample.Create    # qc_inspector_physical
Quality.QCCheckpoint.Decision.Write   # qc_inspector_physical (+ write grant) or gate_supervisor
Quality.QCCheckpoint.Resample         # same as Decision.Write
Quality.QCCheckpoint.Override         # same as Decision.Write
Quality.QCCheckpoint.Read             # qc_inspector_physical, command_center_officer, TP, TDO
```

**`role_seed_data.py`** — extend the existing `qc_inspector_physical` tuple (do not add a new QC role):

```python
(
    "qc_inspector_physical",
    "QC Inspector – Physical",
    PredefinedDepartment.QA_QC,
    [
        # existing
        PermissionCodes.MENU_DASHBOARD_VIEW,
        PermissionCodes.REQUISITION_TR_READ,
        PermissionCodes.MENU_QC_VIEW,
        PermissionCodes.MENU_REQUISITIONS_VIEW,
        # QC-01 additions
        PermissionCodes.MENU_QC_CHECKPOINT_VIEW,
        PermissionCodes.QUALITY_QC_CHECKPOINT_READ,
        PermissionCodes.QUALITY_QC_CHECKPOINT_SAMPLE_CREATE,
        PermissionCodes.QUALITY_QC_CHECKPOINT_DECISION_WRITE,
        PermissionCodes.QUALITY_QC_CHECKPOINT_RESAMPLE,
        PermissionCodes.QUALITY_QC_CHECKPOINT_OVERRIDE,
    ],
),
```

Grant **Decision.Write / Resample / Override** only on tenants where every physical inspector may decide; otherwise omit those three from seed and rely on `gate_supervisor` + `QCAdminBase.supervisor_role_codes` for Pass/Fail and during-unloading actions.

Menu codes (add to `apps/core/portal_navigation.py` under **Quality → QC Checkpoint**):

```python
Menu.QC.Checkpoint.View          # qc_inspector_physical
Menu.QC.Checkpoint.Queue.View    # qc_inspector_physical
```

---

## 11. Sprint 4 Story Mapping

### QC-01 — Raw-Material QC Checkpoint

| Sub-task | Scope | Implementation Focus |
|----------|-------|----------------------|
| QC-01-1 | Models + migration | `QCSample` + `QCDecision` under `apps/quality/checkpoint/`; legacy `apps/quality/models.py` unchanged |
| QC-01-2 | `QCSampleAdmin` | `QCAdminBase`→`YardAdminBase`; TO queryset: `requires_qc` + `sub_state__in=[FLAGGED_FOR_QC, SAMPLING_STARTED, RESAMPLING]`; `has_change_permission=False` |
| QC-01-3 | `QCDecisionAdmin` | Same base; no unloading_point field; `clean()` enforces remarks on Fail; on Pass sets `QueueEntry.qc_passed=True`; `has_change_permission=False` |
| QC-01-4 | `trigger_resample` admin action | Single-row only; calls `QCService.trigger_resample()`; user-facing success/error message |
| QC-01-5 | `override_to_failed` admin action | Intermediate-form pattern to collect required remarks; calls `QCService.override_to_failed()` |
| QC-01-6 | `QCService` | `create_sample()`, `record_decision()`, `trigger_resample()`, `override_to_failed()` — all validation + side effects |
| QC-01-7 | QC queue API (`GET`) | Filter: `destination_poi`, `sub_state` in flagged/sampling; includes sample_count + decision status |
| QC-01-8 | Sample API (`POST`/`GET`) | Create sample; list by POI/TO |
| QC-01-9 | Decision API (`POST`/`GET`) | Record Pass/Fail; no unloading_point; list with `is_active` filter |
| QC-01-10 | Resample API (`POST`) | Supersede decision; cancel CC assignment; clear UnloadEvent |
| QC-01-11 | Override-to-fail API (`POST`) | Mutate decision; cancel CC assignment; clear UnloadEvent |
| QC-01-12 | TLS-01 event emission | 5 event types (§8); called from service, not admin |
| QC-01-13 | Product-line QC trigger + CC/LD integration | Entry when `to_requires_qc_from_lines`; auto `flagged_for_qc` at scale-in; `create_sample` enforces sub_state; resample/override cancel bay + `UnloadEvent.cancelled_by_resample` |
| QC-01-14 | YARD-01 integration | `QCAdminBase`→`YardAdminBase`; `yard_poi.get_working_poi_for_request` (no dedicated `qc_poi.py`); `QueueEntry.qc_passed` set on Pass |
| QC-01-15 | RBAC seed | Add QC checkpoint permissions to `qc_inspector_physical` in `role_seed_data.py`; register permission catalog entries; enable portal nav for `Menu.QC.Checkpoint.View` |

---

**Last Updated**: 2026-06-03  
**Related Modules**: [command-center-loading-sprint4.md](./command-center-loading-sprint4.md), [gate-operations-sprint4.md](./gate-operations-sprint4.md), [scaling-operations-sprint4.md](./scaling-operations-sprint4.md), [yard-foundation-implementation.md](./yard-foundation-implementation.md)
