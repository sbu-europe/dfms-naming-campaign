---
module: 06-poi-operations
specification: Scaling Operations (Sprint 4 — TO-Centric)
version: 1.4
phase: Phase 1
sprint: Sprint 4
last_updated: 2026-06-11
changelog: "v1.4 — CC queue serial at scale-in: `QueueToken.serial_number` (`CC-{POI_CODE}-{YYYYMMDD}-{seq:03d}`, per-POI UTC daily sequence via `QueueSerialSequence`); shown on token slip and CC queue. v1.3 — FG outbound source scale-out: sub-state only (`scale_out_source`); canonical status stays `at_source`; gate-out (GT-01) owns `in_transit_destination` advance"
related_stories: DFS-055 (SC-01)
jira_epic: DFS-072
---

# Scaling Operations Specification (Sprint 4)

## Overview

The **Scaling Operations** specification covers weighbridge scale-in/out, **P.C. code capture** (operator-entered at scale-in — the system does **not** generate P.C. codes), net weight calculation, and printable gate pass. Every weighing operation is anchored to a `GateVisitSession` (and therefore to a `TransportOrder`). Scale-in is a **prerequisite** for Command Center queue entry; scale-out is a **prerequisite** for gate-out (GT-01 guard matrix).

While P.C. codes stay operator-entered, the system **does** auto-generate a **CC queue serial** at scale-in (v1.4): `QueueToken.serial_number` in format `CC-{POI_CODE}-{YYYYMMDD}-{seq:03d}`, a per-POI daily sequence (UTC midnight reset). The serial prints on the queue token slip and orders the Command Center queue (CC-01). Do not confuse it with the per-LUP `WaitingSerial` issued later at bay assignment.

**Module path**: `apps/operations/scaling/`  
**Dependencies**: `apps/operations/gate/` (`GateVisitSession`, `yard_leg`), `apps/operations/yard_context.py` (`OPERATIONS_BY_LEG_AND_LANE`), `apps/transport/` (TransportOrder, FlowLane, TOStatus), **`YARD-01`** (YardAdminBase, yard_poi, UserOperationalPOI, TOSubState)  
**Enables**: Command Center queue (CC-01), gate-out clearance (GT-01), net weight for POD-01

### Codebase baseline (May 2026)

`apps/operations/scaling/` exists with:
- `models.py` — legacy `ScaleRecord` tied to `GateEntry` (old 13-state machine). **Do not extend.** Sprint 4 creates new `WeighingSession`, `ScaleIn`, `ScaleOut`, `QueueToken` models as separate classes.
- `services.py` — legacy `WeightService.record_tare` / `record_gross`. **Do not extend.**
- `admin.py` — **does not exist** (to be created in SC-01).

The new Sprint 4 models live alongside legacy in `apps/operations/scaling/models.py` in a clearly separated section. Legacy `ScaleRecord` is frozen (no new admin, no new API).

---

## 0. Menu Structure & Navigation

```
Sidebar (Scaling Operator)
└── Operations
      └── Scaling
            ├── Scale-In                  — record loaded/empty weight for arriving vehicle
            │     └── Scale-In Form       — session lookup, **P.C. code** (required input), weight capture, discrepancy flags
            │
            ├── Scale-Out                 — record tare/remaining weight for departing vehicle
            │     └── Scale-Out Form      — session lookup, weight capture, net weight display, gate pass
            │
            ├── Queue Tokens              — list of issued tokens (waiting / assigned / closed)
            │     └── [Print Token]       — printable browser view per token
            │
            └── Gate Passes               — list of issued gate passes (after scale-out)
                  └── [Print Gate Pass]   — printable browser view per pass
```

### Role → menu mapping

| Role | Scale-In | Scale-Out | Queue Tokens | Gate Passes |
|------|:--------:|:---------:|:------------:|:-----------:|
| Scaling Operator | ✓ | ✓ | ✓ | ✓ |
| Gate Supervisor | Read-only | Read-only | ✓ | ✓ |
| Tenant Admin | — | — | Read-only | Read-only |

---

## 1. Data Model

### 1.1 WeighingSession (new model — extends `TenantAwareModel`)

Container for the full weigh cycle (scale-in → scale-out) for one vehicle visit.

```python
WeighingSession(TenantAwareModel) {
    id: UUID (PK)

    gate_visit_session: FK → GateVisitSession (OneToOne)
    transport_order: FK → TransportOrder (nullable — copied from session for fast joins)
    poi: FK → POI
    yard_leg: CharField (copied from `gate_visit_session.yard_leg` on create — used for list filters and scale-out guard UI)

    # Status
    scale_out_completed: boolean (default False)

    created_by: FK → User
    created_at: DateTime
    updated_at: DateTime
}
```

### 1.2 ScaleIn (new model — extends `TenantAwareModel`)

```python
ScaleIn(TenantAwareModel) {
    id: UUID (PK)

    weighing_session: FK → WeighingSession (OneToOne)

    # Weight
    gross_weight_mt: Decimal(10, 3)           # loaded vehicle weight
    is_empty_vehicle: boolean (default False) # if True, gross_weight is tare

    # P.C. code (operator-entered — not system-generated)
    pc_code: string (max 50, required)        # transcribed from physical waiting slip / yard issue

    # Discrepancy flags
    seal_intact: boolean (nullable)
    document_match: boolean (nullable)        # physical docs match system record
    discrepancy_notes: text (nullable)

    scale_in_at: DateTime                     # timestamp

    created_by: FK → User (Scaling Operator)
    created_at: DateTime
}
```

### 1.3 ScaleOut (new model — extends `TenantAwareModel`)

```python
ScaleOut(TenantAwareModel) {
    id: UUID (PK)

    weighing_session: FK → WeighingSession (OneToOne)

    # Weight
    tare_weight_mt: Decimal(10, 3)            # empty vehicle weight at exit
    net_weight_mt: Decimal(10, 3)             # auto-calculated: gross − tare (set on save)

    scale_out_at: DateTime

    created_by: FK → User (Scaling Operator)
    created_at: DateTime
}
```

**Immutability**: Once a `ScaleOut` record exists, both `ScaleIn` and `ScaleOut` fields are fully read-only. `get_readonly_fields` enforces this in admin.

### 1.4 QueueToken (new model — extends `TenantAwareModel`)

Created on successful scale-in for CC-01 queue linkage. The **P.C. code is not generated** — it is copied from the operator input on `ScaleIn.pc_code` at create time. The **queue serial is generated** (v1.4): `serial_number` is auto-issued by `_next_queue_serial` inside the same `record_scale_in` transaction.

```python
QueueToken(TenantAwareModel) {
    id: UUID (PK)

    weighing_session: FK → WeighingSession (OneToOne)
    poi: FK → POI                         # denormalised from session for uniqueness scope
    pc_code: string (max 50, required)    # same value as ScaleIn.pc_code (trimmed)

    # CC queue serial (v1.4) — system-generated at scale-in, immutable.
    # Format: CC-{POI_CODE}-{YYYYMMDD}-{seq:03d}; daily sequence per POI, UTC reset.
    # Blank ("") on tokens created before this feature shipped.
    serial_number: string (max 40, blank, db_index)

    status: enum ['waiting', 'assigned', 'closed']
    # waiting → on CC queue
    # assigned → CC has assigned a loading/unloading bay
    # closed → scale-out completed for this visit

    issued_at: DateTime
    created_by: FK → User
}
```

**Uniqueness**: `pc_code` must be unique among tokens at the same `poi` while `status in ('waiting', 'assigned')`. Closed tokens do not block reuse of the same physical code on a later day (business accepts yard re-issue). Enforce via `UniqueConstraint` + `ScaleInService.validate_pc_code()`.

**Serial uniqueness**: `serial_number` is globally unique when set — partial `UniqueConstraint` `uq_queue_token_serial_number` with `condition=~Q(serial_number="")` (pre-feature blank tokens are exempt). Migration: `apps/operations/migrations/0014_queue_token_serial.py`.

### 1.5 QueueSerialSequence (v1.4 — extends `TenantAwareModel`)

Concurrency-safe daily counter **per POI** for CC queue serial issuance — same pattern as CC-01's per-LUP `WaitingSerialSequence` (FB-005). Incremented inside `record_scale_in` with `select_for_update()` in the same transaction as `QueueToken` creation.

```python
QueueSerialSequence(TenantAwareModel) {
    id: UUID (PK)

    poi: FK → POI (PROTECT)
    serial_date: DateField   # UTC date (not local POI time)
    last_seq: PositiveIntegerField (default 0)

    # UniqueConstraint(poi, serial_date) — uq_queue_serial_seq_poi_date
}
```

**Allocator** (`_next_queue_serial` in `apps/operations/scaling/services.py`):

1. Resolve `serial_date` in UTC (`_utc_serial_date`).
2. `get_or_create` sequence row for `(poi, serial_date)` with row lock (`select_for_update`).
3. `last_seq += 1`; persist.
4. Return `f"CC-{poi.poi_code}-{serial_date:%Y%m%d}-{last_seq:03d}"`.

---

## 2. TO Status Progression (SC-01)

Scale-in and scale-out may advance `TO.status` via the TLS-01 event ingest service when `SCALE_OUT_RESULT_TO_STATUS[(flow_lane, yard_leg)]` is non-null. **FG outbound source scale-out is sub-state only** — canonical status stays `at_source` until GT-01 gate-out at origin. Sub-states are recorded in `TOStatusTransitionLog`.

**Leg key**: Eligibility and yard-step sub-states are keyed by **`(flow_lane, yard_leg)`** on the active `GateVisitSession` (set at gate-in — see GT-01 / YARD-01). `flow_lane` alone is insufficient for FG outbound, which has **two** weigh cycles on one TO (source leg + destination leg). Policy table: `apps/operations/yard_context.py` → `OPERATIONS_BY_LEG_AND_LANE`.

### 2.1 Scale-In eligibility and result

| Flow lane | `yard_leg` | Required `TO.status` before scale-in | TLS / yard sub-state on scale-in |
|-----------|------------|--------------------------------------|----------------------------------|
| FG outbound | `source` | `at_source` | `scale_in_source` |
| FG outbound | `destination` | `at_destination` | `scale_in_dest` |
| FG inbound | `destination` | `at_destination` | `scale_in_dest` |
| RM inbound | `destination` | `at_destination` | `scale_in_dest` |

**Prerequisites**:
- Active `GateVisitSession` at the operator’s POI with `yard_leg` set (blank `yard_leg` — GT-02 edge case — must be rejected or resolved before scale-in; see §2.3).
- No existing `WeighingSession` for that session (one weigh cycle per visit).
- `resolve_yard_context(session).allowed_operations` includes `"scale_in"`.

**Service-layer validation** (`apps/operations/scaling/services.py` — `ScaleInService`):

```python
def validate_to_eligible_for_scale_in(
    gate_visit_session: GateVisitSession,
) -> None:
    """
    Raises ValidationError when:
    - session.yard_leg is blank
    - WeighingSession already exists for this GateVisitSession
    - (flow_lane, yard_leg) not in SCALE_IN_ELIGIBLE_TO_STATUSES
    - TO.status != SCALE_IN_ELIGIBLE_TO_STATUSES[(flow_lane, yard_leg)]
    - session.poi_id != operator working POI
    - "scale_in" not in resolve_yard_context(session).allowed_operations
    - pc_code blank or duplicate among active QueueToken at session.poi_id
    """

def validate_pc_code(*, poi_id, pc_code: str) -> None:
    """Trim, require non-empty, max length 50; 409 if pc_code in use at POI (waiting/assigned)."""
```

**On successful scale-in** (all within one `atomic()` block — if any step fails, all roll back):
1. Create `WeighingSession` + `ScaleIn` record (copy `poi` + `transport_order` from session; persist operator `pc_code`)
2. Create `QueueToken` (`pc_code` = `ScaleIn.pc_code`, `status = waiting`, `serial_number` auto-issued via `_next_queue_serial` — per-POI UTC daily sequence, §1.5)
3. **Create `QueueEntry`** in CC-01 directly via `CCService.create_queue_entry()` — **not** via signal or webhook. A failed signal would leave the vehicle invisible in Command Center.
4. `sub = scale_in_sub_state_for_session(session)` — see §2.3 — then `record_yard_sub_state(to, sub, …)` and `record_yard_sub_state(to, TOSubState.WAITING_CC, …)` (YARD-01)

### 2.2 Scale-Out eligibility and result

Scale-out can only be recorded after the **yard work for that leg** is complete (loading at source, unloading at destination). The **CC-01/LD-01 flow** drives intermediate sub-states before scale-out is allowed.

| Flow lane | `yard_leg` | Required pre-conditions before scale-out | `TO.status` after scale-out |
|-----------|------------|------------------------------------------|-----------------------------|
| FG outbound | `source` | `LoadEvent.end_datetime not null` (loading complete) | **`at_source` unchanged** (sub: `scale_out_source`) |
| FG outbound | `destination` | `UnloadEvent.end_datetime not null` (unloading complete) | → `delivered_unloaded` |
| FG inbound | `destination` | `UnloadEvent.end_datetime not null` (unloading complete) | → `delivered_unloaded` |
| RM inbound | `destination` | `UnloadEvent.end_datetime not null` + `QCDecision.decision = 'pass'` | → `delivered_unloaded` |

> **FG finished goods (full trip)**: source leg scale-out records net weight and `sub_state = scale_out_source` while the vehicle remains **`at_source`** inside the yard. **GT-01 gate-out at origin** advances the TO to `in_transit_destination` (physical departure; `GateOut.gate_out_at` is the authoritative exit timestamp). After gate-in at destination (`yard_leg=destination`, `at_destination`), a **new** `GateVisitSession` + `WeighingSession` runs the destination scale-in → unload → scale-out → `delivered_unloaded` chain.

**Service-layer validation** (`ScaleOutService`):

```python
def validate_eligible_for_scale_out(
    weighing_session: WeighingSession,
) -> None:
    """
    Raises ValidationError when:
    - ScaleOut already exists (immutability guard)
    - session.yard_leg blank or key not in SCALE_OUT_PRECONDITIONS
    - (FG outbound, source) and LoadEvent not completed for this TO
    - (*, destination) and UnloadEvent not completed for this TO
    - (RM inbound, destination) and QCDecision.decision != 'pass'
  """
```

**On successful scale-out**:
1. Create `ScaleOut`, auto-calculate `net_weight_mt = gross_weight_mt − tare_weight_mt`
2. Set `WeighingSession.scale_out_completed = True`
3. `record_yard_sub_state(to, scale_out_sub_state_for_session(session), …)` — emit SCALE_OUT to TLS-01 (§2.3)
4. If `SCALE_OUT_RESULT_TO_STATUS[(flow_lane, yard_leg)]` is non-null: `apply_to_status_transition(to, target_status, …)` and `maybe_clear_sub_state_on_status` when target ∈ `SUB_STATE_RESET_ON_STATUS`. **FG outbound source: mapping is `None` — skip status bump.**
5. Close `QueueToken.status = 'closed'`
6. Issue `GatePass` (printable; linked to WeighingSession)

**Constants** (add to `apps/transport/constants.py`; import `YardLeg` from `apps.operations.gate.constants`):

```python
# (flow_lane, yard_leg) → required TO.status before scale-in
SCALE_IN_ELIGIBLE_TO_STATUSES: dict[tuple[str, str], str] = {
    (FlowLane.FG_OUTBOUND, YardLeg.SOURCE): TOStatus.AT_SOURCE,
    (FlowLane.FG_OUTBOUND, YardLeg.DESTINATION): TOStatus.AT_DESTINATION,
    (FlowLane.FG_INBOUND, YardLeg.DESTINATION): TOStatus.AT_DESTINATION,
    (FlowLane.RM_INBOUND, YardLeg.DESTINATION): TOStatus.AT_DESTINATION,
}

# (flow_lane, yard_leg) → TO.status after successful scale-out (None = sub-state only)
SCALE_OUT_RESULT_TO_STATUS: dict[tuple[str, str], str | None] = {
    (FlowLane.FG_OUTBOUND, YardLeg.SOURCE): None,  # gate-out owns in_transit_destination
    (FlowLane.FG_OUTBOUND, YardLeg.DESTINATION): TOStatus.DELIVERED_UNLOADED,
    (FlowLane.FG_INBOUND, YardLeg.DESTINATION): TOStatus.DELIVERED_UNLOADED,
    (FlowLane.RM_INBOUND, YardLeg.DESTINATION): TOStatus.DELIVERED_UNLOADED,
}
```

### 2.3 TLS sub-states — leg-specific (not generic `scale_in`)

**Decision**: Use **leg-specific** sub-states aligned with [transport-lifecycle-pod-sprint4.md](../05-transport/transport-lifecycle-pod-sprint4.md) (`scale_in_source`, `scale_in_dest`, `scale_out_source`, `scale_out_dest`). Generic `scale_in` is **not** sufficient: a single FG outbound TO has two weigh cycles; CC-01, LD-01, and the TLS timeline must distinguish source vs destination yard steps.

| `yard_leg` | Scale-in sub-state | After scale-in (queue) | Scale-out sub-state |
|------------|-------------------|------------------------|---------------------|
| `source` | `scale_in_source` | `waiting_cc` (unchanged) | `scale_out_source` |
| `destination` | `scale_in_dest` | `waiting_cc` (unchanged) | `scale_out_dest` |

**Implementation helpers** (`apps/operations/scaling/services.py`):

```python
def scale_in_sub_state_for_session(session: GateVisitSession) -> str:
    if session.yard_leg == YardLeg.SOURCE:
        return TOSubState.SCALE_IN_SOURCE
    if session.yard_leg == YardLeg.DESTINATION:
        return TOSubState.SCALE_IN_DEST
    raise ValidationError("Gate visit has no yard leg; complete gate-in before scaling.")

def scale_out_sub_state_for_session(session: GateVisitSession) -> str:
    if session.yard_leg == YardLeg.SOURCE:
        return TOSubState.SCALE_OUT_SOURCE
    if session.yard_leg == YardLeg.DESTINATION:
        return TOSubState.SCALE_OUT_DEST
    raise ValidationError("Gate visit has no yard leg.")
```

**SC-01-10 code change**: Extend `TOSubState` in `apps/transport/constants.py` with `SCALE_IN_SOURCE`, `SCALE_IN_DEST`, `SCALE_OUT_SOURCE`, `SCALE_OUT_DEST` (values match TLS-01). Deprecate use of generic `TOSubState.SCALE_IN` for new yard writes; existing rows may remain until backfill.

**TLS-01 event payload** (recommended): include `yard_leg`, `gate_visit_session_id`, and `sub_state` in `TOStatusTransitionLog.payload` for SCALE_IN / SCALE_OUT events.

---

## 3. Scale-In Flow (SC-01)

```
Scaling Operator opens Scale-In form
  └─► Looks up vehicle or TO number (autocomplete)
        └─► Backend: GateVisitSession lookup — must be active, same POI, no WeighingSession yet
              ├─► If not found: Error "No active gate-in visit for this vehicle/TO at this POI"
              │
              └─► If found:
                    ├─► Display: TO Number, Vehicle, Flow Lane badge, Gate-In Time
                    ├─► ScaleInService.validate_to_eligible_for_scale_in(session)
                    ├─► Enter: **P.C. Code** — required (operator input from physical slip)
                    ├─► Enter: Gross Weight (MT) — required
                    ├─► Check: Is Empty Vehicle? — if yes, document as tare only
                    ├─► Discrepancy flags: Seal Intact (Y/N/N/A), Document Match (Y/N)
                    ├─► Discrepancy Notes: free text (required if any flag = N)
                    └─► [Submit Scale-In]
                          └─► ScaleInService.record_scale_in(session, pc_code, weight, flags):
                                ├─► validate_pc_code(poi, pc_code) — required, trimmed, unique among active tokens at POI
                                ├─► Create WeighingSession + ScaleIn (with pc_code)
                                ├─► Allocate queue serial: _next_queue_serial(poi, now) → CC-{POI_CODE}-{YYYYMMDD}-{seq:03d}
                                ├─► Create QueueToken (pc_code copied, serial_number set, status=waiting)
                                ├─► Emit SCALE_IN → TLS-01 (sub: scale_in_source | scale_in_dest → waiting_cc)
                                └─► Success: show P.C. code + queue serial + [Print Token] button (slip shows entered code, queue serial, visit summary)
```

---

## 4. Scale-Out Flow (SC-01)

```
Scaling Operator opens Scale-Out form
  └─► Looks up vehicle or TO number (autocomplete)
        └─► Backend: WeighingSession lookup — must exist, scale_out_completed=False
              ├─► If not found: Error "No pending scale-in record for this vehicle/TO"
              │
              └─► If found:
                    ├─► Display: TO Number, Vehicle, Flow Lane, Gross Weight (from ScaleIn)
                    ├─► Show Guard pre-check (read-only summary; keyed by session.yard_leg):
                    │     ├─► yard_leg=source (FG outbound): Loading complete? ✓/✗
                    │     ├─► yard_leg=destination (FG outbound / FG inbound): Unloading complete? ✓/✗
                    │     └─► yard_leg=destination (RM inbound): Unloading complete? ✓/✗ | QC Passed? ✓/✗
                    ├─► ScaleOutService.validate_eligible_for_scale_out(session)
                    ├─► Enter: Tare Weight (MT) — required
                    ├─► Display (auto-calculated): Net Weight = Gross − Tare
                    └─► [Submit Scale-Out]
                          └─► ScaleOutService.record_scale_out(session, tare_weight):
                                ├─► Create ScaleOut (net_weight auto-set)
                                ├─► WeighingSession.scale_out_completed = True
                                ├─► QueueToken.status = 'closed'
                                ├─► Emit SCALE_OUT → TLS-01 (sub: scale_out_source | scale_out_dest)
                                ├─► Advance TO.status only when SCALE_OUT_RESULT_TO_STATUS[(lane, yard_leg)] is non-null (FG outbound source: stays at_source)
                                └─► Success: show net weight + [Print Gate Pass] button
```

---

## 5. Django Admin Configuration

### UI — design system consistency (required)

All scaling operator admin screens must match the **existing DFMS Django admin shell** (Sprint 1 PAP-01). Reuse patterns from `apps/operations/gate/admin.py` and other yard admins — do not introduce parallel CSS, badge colours, or pagination markup.

| Asset | Purpose |
|-------|---------|
| `static/admin/css/custom.css` | Design tokens (`--dfms-*`), light/dark via `[data-theme="dark"]`, tables, cards, buttons, pagination, forms |
| `static/admin/js/dfms_theme.js` | Light/dark toggle (`dfms-admin-theme` in `localStorage`) |
| `templates/admin/dynamic_pagination_changelist.html` | Changelist per-page control via `YardAdminBase` → `DynamicPaginationMixin` |
| `DFMS-product-context/07-design-system/02-components/data-display.md` | Badge modifier catalogue |
| `.cursor/rules/django-admin-draft-submit.mdc` | Button and breadcrumb conventions |

**Required patterns**

1. **Mixin stack**: `ScaleAdminBase` → `YardAdminBase` → `TenantOnlyAdminMixin` → `DynamicPaginationMixin`.
2. **Status badges**: `dfms-badge--*` + Bootstrap Icons for token/session states (see `_TOKEN_STATUS_BADGE` below); no inline hex colours.
3. **Buttons**: `dfms-btn-*` classes from `custom.css` on any custom change-form actions (e.g. weigh complete, print gate pass trigger).
4. **Tables & cards**: Default changelist table and `.module` fieldsets; session info panels reuse gate-style readonly markup.
5. **Pagination**: Shared per-page dropdown only.
6. **Light/dark mode**: Variables only; test changelist, scale-in/out forms, and token print view in both themes. **Print CSS** for queue tokens may add `@media print` rules but must not redefine brand colours outside `custom.css` tokens.
7. **Custom templates**: Extend admin base templates; load no stylesheets beyond `custom.css`.

### 5.0 YARD-01 integration: admin base and POI resolution

Both `ScaleInAdmin` and `ScaleOutAdmin` inherit **`YardAdminBase`** from `apps/operations/admin_base.py` (YARD-01 Step 5). `apps/operations/scaling/admin.py` does not yet exist and must be created as part of SC-01.

```python
# apps/operations/scaling/admin.py
from apps.operations.admin_base import YardAdminBase
from apps.core.constants_rbac import PermissionCodes

class ScaleAdminBase(YardAdminBase):
    operator_role_code   = "scaling_operator"
    supervisor_role_codes = frozenset({"gate_supervisor"})  # or dedicated scale supervisor if RBAC adds one
    read_perm  = PermissionCodes.OPERATIONS_GATE_ENTRY_READ   # reuse until SC-01-specific perm added
    write_perm = PermissionCodes.OPERATIONS_GATE_ENTRY_CREATE # reuse until SC-01-specific perm added
```

`formfield_for_foreignkey` for `gate_visit_session` must call `_scope_poi_id(request)` (inherited) to restrict the session queryset to the operator's POI. Supervisors see all sessions.

`get_queryset` is already handled by `YardAdminBase`: operator with no `UserOperationalPOI` → `qs.none()` + warning banner. No additional guard needed in the scaling admin.

### 5.1 ScaleInAdmin (SC-01-2)

Uses `ScaleAdminBase` (→ `YardAdminBase`). **Business rules in `ScaleInService`**.

**Change Form**:
- `autocomplete_fields = ["gate_visit_session"]`
- **GateVisitSession queryset restriction** — `formfield_for_foreignkey`:

```python
def formfield_for_foreignkey(self, db_field, request, **kwargs):
    if db_field.name == "gate_visit_session":
        poi_id = self._scope_poi_id(request)  # from YardAdminBase
        qs = (
            GateVisitSession.objects.filter(status=GateVisitStatus.ACTIVE)
            .exclude(yard_leg="")  # GT-02 blank leg — not eligible for scale-in
            .filter(
                Q(
                    yard_leg=YardLeg.SOURCE,
                    transport_order__flow_lane=FlowLane.FG_OUTBOUND,
                    transport_order__status=TOStatus.AT_SOURCE,
                )
                | Q(
                    yard_leg=YardLeg.DESTINATION,
                    transport_order__status=TOStatus.AT_DESTINATION,
                    transport_order__flow_lane__in=(
                        FlowLane.FG_OUTBOUND,
                        FlowLane.FG_INBOUND,
                        FlowLane.RM_INBOUND,
                    ),
                )
            )
            .exclude(weighing_session__isnull=False)
            .select_related("transport_order", "vehicle")
            .order_by("-created_at")
        )
        if poi_id:
            qs = qs.filter(poi_id=poi_id)
        kwargs["queryset"] = qs
    return super().formfield_for_foreignkey(db_field, request, **kwargs)
```

- **Read-only info panel** (after session selected): Flow Lane badge, **Yard leg** badge, TO Number, Gate-In Time, TO Status badge
- `save_model`:
  1. `ScaleInService.validate_to_eligible_for_scale_in(session)`
  2. `ScaleInService.record_scale_in(..., pc_code=...)` — creates WeighingSession, ScaleIn, QueueToken; emits TLS-01 event
  3. Change form fields: `pc_code` required on scale-in (not on ScaleOut)
  4. After save: `self.message_user(request, f"Scale-in recorded. P.C. Code: {scale_in.pc_code}")`
- `get_readonly_fields`: all fields read-only once `WeighingSession.scale_out_completed = True`

**List View**:
- Columns: TO Number, Vehicle, Flow Lane, **P.C. Code**, Gross Weight (MT), Is Empty, Seal Intact, Scale-In Time, Created By
- Filters: `gate_visit_session__poi`, `scale_in_at` (date range), `is_empty_vehicle`
- Search: TO number, Vehicle registration, **P.C. code**

### 5.2 ScaleOutAdmin (SC-01-3)

Uses `TenantOnlyAdminMixin`. **Business rules in `ScaleOutService`**.

**Change Form**:
- `autocomplete_fields = ["weighing_session"]`
- **WeighingSession queryset restriction** — `formfield_for_foreignkey`:

```python
def formfield_for_foreignkey(self, db_field, request, **kwargs):
    if db_field.name == "weighing_session":
        poi = get_poi_for_operator(request)
        kwargs["queryset"] = (
            WeighingSession.objects
            .filter(poi=poi, scale_out_completed=False)
            .select_related(
                "gate_visit_session",
                "gate_visit_session__transport_order",
                "gate_visit_session__vehicle",
                "scalein",
            )
            .order_by("-created_at")
        )
    return super().formfield_for_foreignkey(db_field, request, **kwargs)
```

- **Guard pre-check panel** (read-only, computed from `weighing_session.gate_visit_session.yard_leg` + TO):
  - Displayed as a `readonly_field` helper `guard_precondition_status`:
    - `yard_leg=source`: ✅ Loading complete / ⏳ Awaiting loading
    - `yard_leg=destination` (FG outbound or FG inbound): ✅ Unloading complete / ⏳ Awaiting unloading
    - `yard_leg=destination` + RM inbound: ✅ Unloading complete / ⏳ Awaiting unloading; ✅ QC Passed / ⏳ Awaiting QC / ❌ QC Failed
- `tare_weight_mt` input field
- `net_weight_mt`: `readonly_field` — auto-calculated display (`gross_weight_mt − tare_weight_mt`)
- `save_model`:
  1. `ScaleOutService.validate_eligible_for_scale_out(session)`
  2. `ScaleOutService.record_scale_out(...)` — creates ScaleOut, emits TLS-01 event, closes token; advances TO status when mapping is non-null
  3. After save: `self.message_user(request, f"Scale-out recorded. Net Weight: {net_wt} MT. Gate Pass issued.")`
- `get_readonly_fields`: all fields read-only once record is saved (immutable by design)

**List View**:
- Columns: TO Number, Vehicle, Flow Lane, Gross Weight, Tare Weight, Net Weight, Scale-Out Time, Created By
- Filters: `weighing_session__poi`, `scale_out_at` (date range)
- Search: TO number, Vehicle registration

### 5.3 QueueTokenAdmin (SC-01-4)

Read-oriented admin; tokens are created by `ScaleInService`, not manually. `pc_code` and `serial_number` are **read-only** on this admin (captured/issued on scale-in only).

**List View**:
- Columns: **Serial**, **P.C. Code**, TO Number, Vehicle, Flow Lane, Status badge, Issued At
- Filters: `status`, `poi`, `issued_at` (date range)
- Search: P.C. code, **queue serial**, TO number, Vehicle registration

**Status badge colours**:
```python
_TOKEN_STATUS_BADGE = {
    "waiting":  ("dfms-badge--awaiting-dispatch", "bi-hourglass",    "Waiting"),
    "assigned": ("dfms-badge--in-progress",        "bi-signpost",     "Assigned"),
    "closed":   ("dfms-badge--approved",           "bi-check-circle", "Closed"),
}
```

**Actions**:
- `[Print Token]` — custom action → `HttpResponse` with print CSS template (vehicle number, product type, **operator-entered P.C. code**, **queue serial** (— when blank), gross weight, TO reference, POI)

**Detail View**: read-only all fields; link to WeighingSession + GateVisitSession

### 5.4 GatePass display (SC-01 — after scale-out)

Gate pass is not a separate model — it is rendered on demand from `ScaleOut` + `WeighingSession` + `GateIn` data.

**Custom admin action on ScaleOutAdmin**: `"Print Gate Pass"`:
- Renders printable template: Vehicle number, Item name (from GateIn.product_details), Net Weight (MT), P.C. code (from `ScaleIn.pc_code`), TO Number, Date/Time, Scale Operator, POI
- `HttpResponse` with `Content-Type: text/html` (print CSS)

---

## 6. API Endpoints (SC-01)

```http
POST   /api/v1/scaling/scale-in
       → Body: { gate_visit_session_id, pc_code, gross_weight_mt, is_empty_vehicle, seal_intact, document_match, discrepancy_notes }
       → Validations: gate-in prerequisite, `(flow_lane, yard_leg)` / TO status, **pc_code required + unique at POI among active tokens**, no duplicate scale-in
       → Side effects: Create WeighingSession + ScaleIn + QueueToken (pc_code from body; serial_number auto-issued), emit SCALE_IN to TLS-01
       → Response: { scale_in_id, weighing_session_id, pc_code, queue_token: { id, pc_code, status }, scale_in_at }
       → Pending: expose queue_token.serial_number in the response (serial is issued and persisted;
         currently surfaced via admin and the printable token only — not yet in REST payloads)

POST   /api/v1/scaling/scale-out
       → Body: { weighing_session_id, tare_weight_mt }
       → Validations: pre-conditions per flow lane (§2.2), no duplicate scale-out
       → Side effects: Create ScaleOut (net_weight auto), close token, emit SCALE_OUT to TLS-01; advance TO.status per SCALE_OUT_RESULT_TO_STATUS (FG outbound source: sub-state only)
       → Response: { scale_out_id, net_weight_mt, scale_out_at, gate_pass_url }

GET    /api/v1/scaling/queue-tokens?status=waiting&poi=&date=
       → Active queue tokens (used by CC-01 queue feed)
       → Pending: include serial_number per token (not yet in the list payload)

GET    /api/v1/scaling/queue-tokens/{token_id}
       → Token detail (Pending: include serial_number)

GET    /api/v1/scaling/queue-tokens/{token_id}/print
       → Printable token (HTML with print CSS)

GET    /api/v1/scaling/scale-out/{id}/gate-pass
       → Printable gate pass (HTML with print CSS)
```

---

## 7. Validation Rules

- **P.C. code**: required on scale-in; trimmed; max 50 chars; unique at POI among `QueueToken` with `status in (waiting, assigned)` → 409 Conflict on duplicate
- **Queue serial**: system-generated only (never operator-entered); immutable after issue; globally unique when set (partial constraint exempts pre-feature blank tokens); per-POI daily sequence resets at 00:00 UTC
- Gross weight > 0 (empty vehicle flag overrides quantity requirement, but weight is still measured)
- Tare weight > 0 and < gross weight (service-level check)
- Net weight auto-calculated; not editable
- Once ScaleOut created, all fields on ScaleIn + ScaleOut are immutable (400 on any PATCH attempt)
- Duplicate scale-in for same GateVisitSession → 409 Conflict
- Scale-out before loading/unloading complete for the session’s `yard_leg` → 422 Unprocessable with reason
- Scale-in with blank `yard_leg` on session → 422 Unprocessable

---

## 8. Integration Points

| Module | Direction | How |
|--------|-----------|-----|
| GT-01 (Gate-In) | Upstream | GateVisitSession FK; scale-in only after gate-in |
| CC-01 (Command Center) | Downstream | `ScaleInService` calls `CCService.create_queue_entry()` directly within the same `atomic()` block — no signal/webhook (YARD-01); token status updated by CC on bay assignment |
| LD-01 (Loading/Unloading) | Upstream for scale-out | LoadEvent/UnloadEvent completion gates scale-out validation |
| QC-01 | Upstream for scale-out (RM) | QCDecision.decision = 'pass' required before scale-out for RM inbound |
| GT-01 (Gate-Out) | Downstream | `WeighingSession.scale_out_completed` is the gate-out guard check |
| TLS-01 | Timeline | SCALE_IN and SCALE_OUT events with timestamp + actor |

---

## 9. Sprint 4 Story Mapping

### SC-01 — Scaling Operations

| Sub-task | Scope | Implementation Focus |
|----------|-------|----------------------|
| SC-01-1 | Models + migration | WeighingSession, ScaleIn (`pc_code`), ScaleOut, QueueToken (`pc_code`, POI-scoped active uniqueness) |
| SC-01-2 | ScaleInAdmin | Queryset restriction by `(yard_leg, TO.status)` pairs; yard-leg badge; ScaleInService in save_model |
| SC-01-3 | ScaleOutAdmin | Queryset restriction (`scale_out_completed=False`); guard pre-check by `yard_leg`; immutability via `get_readonly_fields` |
| SC-01-4 | QueueTokenAdmin + Print action | Read-only token list (pc_code from scale-in); printable slip reprints entered P.C. code |
| SC-01-5 | Scale-in REST API (POST) | Gate-in + `(flow_lane, yard_leg)` / TO status validation |
| SC-01-6 | Scale-out REST API (POST) | Pre-condition checks per `(flow_lane, yard_leg)`, net weight, TO status advance |
| SC-01-7 | Queue token list API (GET) | Filter by status/poi/date; CC-01 feed |
| SC-01-8 | Print endpoints | Queue token + gate pass HTML print views |
| SC-01-9 | TLS-01 event emission | SCALE_IN / SCALE_OUT events with leg-specific sub-states + `yard_leg` in payload |
| SC-01-10 | Constants | `SCALE_IN_ELIGIBLE_TO_STATUSES`, `SCALE_OUT_RESULT_TO_STATUS` keyed by `(flow_lane, yard_leg)`; extend `TOSubState` with `scale_in_source`, `scale_in_dest`, `scale_out_source`, `scale_out_dest` |
| SC-01-11 | YARD-01 integration | `ScaleAdminBase` → `YardAdminBase`; `create_queue_entry` in `ScaleInService` (atomic); `record_yard_sub_state(scale_in_* → WAITING_CC)` per §2.3 |
| SC-01-12 | Queue serial at scale-in (v1.4) | `QueueToken.serial_number` + `QueueSerialSequence` (per-POI UTC daily, §1.5); `_next_queue_serial` in `record_scale_in`; serial on token slip + admin columns; migration `0014_queue_token_serial` |

---

**Last Updated**: 2026-06-11  
**Related Modules**: [gate-operations-sprint4.md](./gate-operations-sprint4.md), [command-center-loading-sprint4.md](./command-center-loading-sprint4.md), [yard-foundation-implementation.md](./yard-foundation-implementation.md), [05-transport](../05-transport/README.md)
