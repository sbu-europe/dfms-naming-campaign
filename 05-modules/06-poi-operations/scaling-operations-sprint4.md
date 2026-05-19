---
module: 06-poi-operations
specification: Scaling Operations (Sprint 4 — TO-Centric)
version: 1.0
phase: Phase 1
sprint: Sprint 4
last_updated: 2026-05-19
related_stories: DFS-055 (SC-01)
jira_epic: DFS-072
---

# Scaling Operations Specification (Sprint 4)

## Overview

The **Scaling Operations** specification covers weighbridge scale-in/out, queue token (P.C. code) issuance, net weight calculation, and printable gate pass. Every weighing operation is anchored to a `GateVisitSession` (and therefore to a `TransportOrder`). Scale-in is a **prerequisite** for Command Center queue entry; scale-out is a **prerequisite** for gate-out (GT-01 guard matrix).

**Module path**: `apps/operations/scaling/`  
**Dependencies**: `apps/operations/gate/` (GateVisitSession), `apps/transport/` (TransportOrder, FlowLane, TOStatus), **`YARD-01`** (YardAdminBase, yard_poi, UserOperationalPOI, TOSubState)  
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
            │     └── Scale-In Form       — session lookup, weight capture, discrepancy flags, token issuance
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

Issued automatically on successful scale-in; carries the P.C. code serial.

```python
QueueToken(TenantAwareModel) {
    id: UUID (PK)

    weighing_session: FK → WeighingSession (OneToOne)
    token_number: string (unique per POI per day — format: 'PC-{POI_CODE}-{YYYYMMDD}-{seq:04d}')

    status: enum ['waiting', 'assigned', 'closed']
    # waiting → issued, in CC queue
    # assigned → CC has assigned a loading/unloading bay
    # closed → vehicle completed loading/unloading and exited

    issued_at: DateTime
    created_by: FK → User
}
```

---

## 2. TO Status Progression (SC-01)

Scale-in and scale-out advance `TO.status` via the TLS-01 event ingest service. Sub-states are recorded in `TOStatusTransitionLog`.

### 2.1 Scale-In eligibility and result

| Flow Lane | Required `TO.status` before scale-in | Sub-state written on scale-in |
|-----------|--------------------------------------|-------------------------------|
| FG outbound | `at_source` | `scale_in` |
| FG inbound | `at_destination` | `scale_in` |
| RM inbound | `at_destination` | `scale_in` |

**Prerequisite**: An active `GateVisitSession` with no existing `WeighingSession` must exist for the TO at the current POI.

**Service-layer validation** (`apps/operations/scaling/services.py` — `ScaleInService`):

```python
def validate_to_eligible_for_scale_in(
    gate_visit_session: GateVisitSession,
) -> None:
    """
    Raises ValidationError when:
    - No active GateVisitSession for this vehicle at this POI
    - WeighingSession already exists for this GateVisitSession
    - TO.status not in {at_source (FG outbound) | at_destination (FG/RM inbound)}
    """
```

**On successful scale-in** (all within one `atomic()` block — if any step fails, all roll back):
1. Create `WeighingSession` + `ScaleIn` record
2. Auto-issue `QueueToken` (status = `waiting`)
3. **Create `QueueEntry`** in CC-01 directly via `CCService.create_queue_entry()` — **not** via signal or webhook. A failed signal would leave the vehicle invisible in Command Center.
4. Call `record_yard_sub_state(to, TOSubState.SCALE_IN, actor=request.user)` then `record_yard_sub_state(to, TOSubState.WAITING_CC, actor=request.user)` (YARD-01 Step 1)

### 2.2 Scale-Out eligibility and result

Scale-out can only be recorded after loading/unloading is complete. The **CC-01/LD-01 flow** drives the TO to the correct sub-state before scale-out is allowed.

| Flow Lane | Required pre-conditions before scale-out | `TO.status` after scale-out |
|-----------|------------------------------------------|-----------------------------|
| FG outbound | `LoadEvent.end_datetime not null` (loading complete) | → `in_transit_destination` |
| FG inbound | `UnloadEvent.end_datetime not null` (unloading complete) | → `delivered_unloaded` |
| RM inbound | `UnloadEvent.end_datetime not null` + `QCDecision.decision = 'pass'` | → `delivered_unloaded` |

**Service-layer validation** (`ScaleOutService`):

```python
def validate_eligible_for_scale_out(
    weighing_session: WeighingSession,
) -> None:
    """
    Raises ValidationError when:
    - ScaleOut already exists (immutability guard)
    - flow_lane = FG outbound and LoadEvent not completed
    - flow_lane = FG inbound and UnloadEvent not completed
    - flow_lane = RM inbound and (UnloadEvent not completed OR QCDecision.decision != 'pass')
    """
```

**On successful scale-out**:
1. Create `ScaleOut`, auto-calculate `net_weight_mt = gross_weight_mt − tare_weight_mt`
2. Set `WeighingSession.scale_out_completed = True`
3. Emit `SCALE_OUT` event to TLS-01; advance `TO.status` per lane table above
4. Close `QueueToken.status = 'closed'`
5. Issue `GatePass` (printable; linked to WeighingSession)

**Constants** (add to `apps/transport/constants.py`):

```python
SCALE_IN_ELIGIBLE_TO_STATUSES: dict[str, str] = {
    FlowLane.FG_OUTBOUND: TOStatus.AT_SOURCE,
    FlowLane.FG_INBOUND: TOStatus.AT_DESTINATION,
    FlowLane.RM_INBOUND: TOStatus.AT_DESTINATION,
}

SCALE_OUT_RESULT_TO_STATUS: dict[str, str] = {
    FlowLane.FG_OUTBOUND: TOStatus.IN_TRANSIT_DESTINATION,
    FlowLane.FG_INBOUND: TOStatus.DELIVERED_UNLOADED,
    FlowLane.RM_INBOUND: TOStatus.DELIVERED_UNLOADED,
}
```

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
                    ├─► Enter: Gross Weight (MT) — required
                    ├─► Check: Is Empty Vehicle? — if yes, document as tare only
                    ├─► Discrepancy flags: Seal Intact (Y/N/N/A), Document Match (Y/N)
                    ├─► Discrepancy Notes: free text (required if any flag = N)
                    └─► [Submit Scale-In]
                          └─► ScaleInService.record_scale_in(session, weight, flags):
                                ├─► Create WeighingSession
                                ├─► Create ScaleIn record
                                ├─► Auto-issue QueueToken (PC code, status=waiting)
                                ├─► Emit SCALE_IN → TLS-01 (sub: scale_in → waiting_cc)
                                └─► Success: show token number + [Print Token] button
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
                    ├─► Show Guard pre-check (read-only summary):
                    │     ├─► FG outbound: Loading complete? ✓/✗
                    │     ├─► FG inbound: Unloading complete? ✓/✗
                    │     └─► RM inbound: Unloading complete? ✓/✗ | QC Passed? ✓/✗
                    ├─► ScaleOutService.validate_eligible_for_scale_out(session)
                    ├─► Enter: Tare Weight (MT) — required
                    ├─► Display (auto-calculated): Net Weight = Gross − Tare
                    └─► [Submit Scale-Out]
                          └─► ScaleOutService.record_scale_out(session, tare_weight):
                                ├─► Create ScaleOut (net_weight auto-set)
                                ├─► WeighingSession.scale_out_completed = True
                                ├─► QueueToken.status = 'closed'
                                ├─► Emit SCALE_OUT → TLS-01; advance TO.status per lane
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
            .filter(
                transport_order__status__in=[
                    TOStatus.AT_SOURCE,      # FG outbound
                    TOStatus.AT_DESTINATION, # FG inbound, RM inbound
                ]
            )
            .exclude(weighing_session__isnull=False)  # no existing WeighingSession
            .select_related("transport_order", "vehicle")
            .order_by("-created_at")
        )
        if poi_id:
            qs = qs.filter(poi_id=poi_id)
        kwargs["queryset"] = qs
    return super().formfield_for_foreignkey(db_field, request, **kwargs)
```

- **Read-only info panel** (after session selected): Flow Lane badge, TO Number, Gate-In Time, TO Status badge
- `save_model`:
  1. `ScaleInService.validate_to_eligible_for_scale_in(session)`
  2. `ScaleInService.record_scale_in(...)` — creates WeighingSession, ScaleIn, QueueToken; emits TLS-01 event
  3. After save: `self.message_user(request, f"Scale-in recorded. Queue Token: {token.token_number}")`
- `get_readonly_fields`: all fields read-only once `WeighingSession.scale_out_completed = True`

**List View**:
- Columns: TO Number, Vehicle, Flow Lane, Gross Weight (MT), Is Empty, Seal Intact, Scale-In Time, Token Number, Created By
- Filters: `gate_visit_session__poi`, `scale_in_at` (date range), `is_empty_vehicle`
- Search: TO number, Vehicle registration, Token number

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

- **Guard pre-check panel** (read-only, computed from TO + related records):
  - Displayed as a `readonly_field` helper `guard_precondition_status`:
    - FG outbound: ✅ Loading complete / ⏳ Awaiting loading
    - FG/RM inbound: ✅ Unloading complete / ⏳ Awaiting unloading
    - RM inbound additional: ✅ QC Passed / ⏳ Awaiting QC / ❌ QC Failed
- `tare_weight_mt` input field
- `net_weight_mt`: `readonly_field` — auto-calculated display (`gross_weight_mt − tare_weight_mt`)
- `save_model`:
  1. `ScaleOutService.validate_eligible_for_scale_out(session)`
  2. `ScaleOutService.record_scale_out(...)` — creates ScaleOut, advances TO status, emits TLS-01 event, closes token
  3. After save: `self.message_user(request, f"Scale-out recorded. Net Weight: {net_wt} MT. Gate Pass issued.")`
- `get_readonly_fields`: all fields read-only once record is saved (immutable by design)

**List View**:
- Columns: TO Number, Vehicle, Flow Lane, Gross Weight, Tare Weight, Net Weight, Scale-Out Time, Created By
- Filters: `weighing_session__poi`, `scale_out_at` (date range)
- Search: TO number, Vehicle registration

### 5.3 QueueTokenAdmin (SC-01-4)

Read-oriented admin; tokens are created by service, not manually.

**List View**:
- Columns: Token Number, TO Number, Vehicle, Flow Lane, Status badge, Issued At, Closed At (nullable)
- Filters: `status`, `poi`, `issued_at` (date range)
- Search: Token number, TO number, Vehicle registration

**Status badge colours**:
```python
_TOKEN_STATUS_BADGE = {
    "waiting":  ("dfms-badge--awaiting-dispatch", "bi-hourglass",    "Waiting"),
    "assigned": ("dfms-badge--in-progress",        "bi-signpost",     "Assigned"),
    "closed":   ("dfms-badge--approved",           "bi-check-circle", "Closed"),
}
```

**Actions**:
- `[Print Token]` — custom action → `HttpResponse` with print CSS template (vehicle number, product type, P.C. code serial, gross weight, TO reference, POI)

**Detail View**: read-only all fields; link to WeighingSession + GateVisitSession

### 5.4 GatePass display (SC-01 — after scale-out)

Gate pass is not a separate model — it is rendered on demand from `ScaleOut` + `WeighingSession` + `GateIn` data.

**Custom admin action on ScaleOutAdmin**: `"Print Gate Pass"`:
- Renders printable template: Vehicle number, Item name (from GateIn.product_details), Net Weight (MT), P.C. code, TO Number, Date/Time, Scale Operator, POI
- `HttpResponse` with `Content-Type: text/html` (print CSS)

---

## 6. API Endpoints (SC-01)

```http
POST   /api/v1/scaling/scale-in
       → Body: { gate_visit_session_id, gross_weight_mt, is_empty_vehicle, seal_intact, document_match, discrepancy_notes }
       → Validations: gate-in prerequisite (active session, correct TO status), no duplicate scale-in
       → Side effects: Create WeighingSession + ScaleIn, auto-issue QueueToken, emit SCALE_IN to TLS-01
       → Response: { scale_in_id, weighing_session_id, queue_token: { token_number, status }, scale_in_at }

POST   /api/v1/scaling/scale-out
       → Body: { weighing_session_id, tare_weight_mt }
       → Validations: pre-conditions per flow lane (§2.2), no duplicate scale-out
       → Side effects: Create ScaleOut (net_weight auto), advance TO.status, close token, emit SCALE_OUT to TLS-01
       → Response: { scale_out_id, net_weight_mt, scale_out_at, gate_pass_url }

GET    /api/v1/scaling/queue-tokens?status=waiting&poi=&date=
       → Active queue tokens (used by CC-01 queue feed)

GET    /api/v1/scaling/queue-tokens/{token_id}
       → Token detail

GET    /api/v1/scaling/queue-tokens/{token_id}/print
       → Printable token (HTML with print CSS)

GET    /api/v1/scaling/scale-out/{id}/gate-pass
       → Printable gate pass (HTML with print CSS)
```

---

## 7. Validation Rules

- Gross weight > 0 (empty vehicle flag overrides quantity requirement, but weight is still measured)
- Tare weight > 0 and < gross weight (service-level check)
- Net weight auto-calculated; not editable
- Once ScaleOut created, all fields on ScaleIn + ScaleOut are immutable (400 on any PATCH attempt)
- Duplicate scale-in for same GateVisitSession → 409 Conflict
- Scale-out before loading/unloading complete per lane → 422 Unprocessable with reason

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
| SC-01-1 | Models + migration | WeighingSession, ScaleIn, ScaleOut, QueueToken |
| SC-01-2 | ScaleInAdmin | Queryset restriction (AT_SOURCE / AT_DESTINATION), guard pre-check panel, ScaleInService in save_model |
| SC-01-3 | ScaleOutAdmin | Queryset restriction (scale_out_completed=False), guard pre-check panel, immutability via get_readonly_fields |
| SC-01-4 | QueueTokenAdmin + Print action | Token list, status badges, printable token (print CSS) |
| SC-01-5 | Scale-in REST API (POST) | Gate-in prerequisite + TO status validation |
| SC-01-6 | Scale-out REST API (POST) | Pre-condition checks per lane, net weight, TO status advance |
| SC-01-7 | Queue token list API (GET) | Filter by status/poi/date; CC-01 feed |
| SC-01-8 | Print endpoints | Queue token + gate pass HTML print views |
| SC-01-9 | TLS-01 event emission | SCALE_IN + SCALE_OUT events |
| SC-01-10 | Constants | SCALE_IN_ELIGIBLE_TO_STATUSES, SCALE_OUT_RESULT_TO_STATUS in apps/transport/constants.py |
| SC-01-11 | YARD-01 integration | `ScaleAdminBase` → `YardAdminBase`; `create_queue_entry` call in `ScaleInService` (atomic); `record_yard_sub_state(SCALE_IN → WAITING_CC)` |

---

**Last Updated**: 2026-05-19  
**Related Modules**: [gate-operations-sprint4.md](./gate-operations-sprint4.md), [command-center-loading-sprint4.md](./command-center-loading-sprint4.md), [yard-foundation-implementation.md](./yard-foundation-implementation.md), [05-transport](../05-transport/README.md)
