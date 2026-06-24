---
module: 06-poi-operations
specification: Stock Operations (Sprint 5 — Event-Driven, Scale-Out Triggered)
version: 2.0
phase: Phase 1
sprint: Sprint 5
last_updated: 2026-06-24
changelog: |
  v1.0 — initial specification; stock trigger is scale-out net weight, not QC pass; unified (flow_lane, yard_leg) decision matrix; storage_capacity_mt nullable guard (skip when null)
  v1.1 — backend alignment fixes: allocated_quantity field names corrected (no _mt suffix); TR reservation quantity source clarified (total_quantity on TR, not per-line-item); FlowLane enum DB values documented (lowercase); STOCK_MUTATION_MAP key casing fix noted; TO dispatch trigger status corrected (READY_FOR_DISPATCH → driving_towards_*); TO cancellation null-guard added; WeighingSession → TransportOrder traversal for flow_lane noted; capacity_threshold_pct migration target updated; tenant settings model noted as not yet existing; TR approval status transition corrected (PENDING_APPROVAL → AVAILABLE_FOR_TRANSPORT_PLANNING)
  v1.2 — no-blocker policy: source availability guard demoted to warning-only (never returns 409, never blocks bay assignment); destination capacity guard CAPACITY_OVERRIDE_REQUIRED demoted to warning-only (no mandatory remarks, no hard block); stock mutation exceptions inside record_scale_out() must be caught and logged, never re-raised; all stock bookkeeping failures are non-blocking to yard operations
  v1.3 — PR/TR form read-path clarified: document Sprint 3 legacy CapacityService gap, canonical stock-snapshot integration for PR destination POI picker, role-code alignment with apps/requisitions (depot_officer not requester_depot), requester visibility on PR create reconciled with PRD §6.7; §13 implementation-gap audit added
  v2.0 — design overhaul: reserved_stock_mt removed entirely; TR approval no longer touches stock; scale-out net weight replaced by abs(scale_in_weight − scale_out_weight); ScaleIn.gross_weight_mt renamed scale_in_weight_mt; ScaleOut.tare_weight_mt renamed scale_out_weight_mt; current_stock_mt settable on POI add form (opening balance, read-only after creation); destination capacity guard (§4.2) removed; check_destination_capacity() removed; free_capacity_mt no longer deducts reserved stock
related_stories: DFS-071 (STK-01)
jira_epic: DFS-072
resolved_open_questions:
  - "OQ-1: Opening balances — set on POI add form; read-only after first save"
  - "OQ-2: QC fail disposition — material returns to port/supplier; source stock unchanged; in-transit reversed on TO cancellation"
  - "OQ-3: Reservation removed — TR approval no longer reserves stock"
  - "OQ-4: Null storage_capacity_mt — capacity-derived fields return null/— when POI has no capacity configured"
---

# Stock Operations Specification (Sprint 5 — v2.0)

## Overview

The **Stock Operations** specification defines how the platform maintains a live, event-driven stock ledger at every POI (depot, feed mill, warehouse, port).

**v2.0 design:** The stock model is intentionally simple — two counters beyond `current_stock_mt` (in-transit tracking only), no reservation system, and a single net-weight calculation based on the absolute difference between the two physical weighings at each yard visit.

The stock trigger surface is exactly one place: `ScaleOutService.record_scale_out()`.

**Module path**: `apps/operations/stock/`
**Dependencies**: `apps/master_data/` (POI, `storage_capacity_mt`), `apps/transport/` (TransportOrder, `flow_lane`, `origin_poi`, `destination_poi`, `allocated_quantity`), `apps/operations/scaling/` (ScaleOut, `scale_in_weight_mt`, `scale_out_weight_mt`), `apps/operations/gate/` (GateVisitSession, `yard_leg`)
**Enables**: POI stock display on PR/TR creation forms, source availability guard at CC bay assignment, GPS-01 map dashboard stock panel

---

## 0. Core Design Principles

> **Stock always moves at scale-out. The amount is the absolute difference between the two weighings at that visit.**

- `net_weight_mt = abs(scale_in_weight_mt − scale_out_weight_mt)`
- Source POI (yard_leg = source): `current_stock_mt` ↓ by `net_weight_mt`
- Destination POI (yard_leg = destination): `current_stock_mt` ↑ by `net_weight_mt`

There is no reservation system. TR approval does not touch stock. Loading/unloading bag or weight records do not affect stock.

> **Stock bookkeeping never blocks yard operations.**

All stock mutation exceptions inside `record_scale_out()` and `record_driver_transition()` are **caught, logged, and swallowed** — they must never propagate and roll back the originating operational event.

---

## 1. Data Model

### 1.1 POIStock (one-to-one with POI)

```python
POIStock(TenantAwareModel) {
    poi                     OneToOneField(POI, related_name='stock', on_delete=CASCADE)

    current_stock_mt        DecimalField(max_digits=12, decimal_places=3, default=0)
    # ^ set as opening balance on POI add form; updated only by scale-out events thereafter

    in_transit_outgoing_mt  DecimalField(max_digits=12, decimal_places=3, default=0)
    # ^ TO.allocated_quantity for trucks currently en route *from* this POI

    in_transit_incoming_mt  DecimalField(max_digits=12, decimal_places=3, default=0)
    # ^ TO.allocated_quantity for trucks currently en route *to* this POI

    last_updated            DateTimeField(auto_now=True)

    class Meta:
        db_table = "poi_stock"
}
```

**`reserved_stock_mt` is removed.** There is no reservation concept in v2.0.

**Computed properties (not stored — derived on read):**

```
free_capacity_mt = poi.storage_capacity_mt - current_stock_mt
    → returns None when poi.storage_capacity_mt is null

projected_utilization_pct = (current_stock_mt + in_transit_incoming_mt) / poi.storage_capacity_mt * 100
    → returns None when poi.storage_capacity_mt is null
```

All mutating operations on `POIStock` use `select_for_update()` inside `atomic()` — no stock field is ever written outside a transaction lock.

**Opening balance:** Set once on the **POI add form** (`current_stock_mt` is a writable field when creating a new POI). After the POI is saved, `current_stock_mt` is read-only on the change form — it can only move via scale-out events. A `POIStock` row with the provided opening balance is created in `POIAdmin.save_model()` on add.

### 1.2 POIStockMovementLog (append-only)

```python
POIStockMovementLog(TenantAwareModel) {
    poi                     FK → POI
    event_type              CharField(choices — see §1.3)
    transport_order         FK → TransportOrder (null=True)
    field_affected          CharField  # 'current_stock_mt' | 'in_transit_outgoing_mt' | 'in_transit_incoming_mt'
    quantity_mt             DecimalField(max_digits=12, decimal_places=3)
    previous_value_mt       DecimalField(max_digits=12, decimal_places=3)
    new_value_mt            DecimalField(max_digits=12, decimal_places=3)
    actor                   FK → User (null=True)  # null for system events; set for OPENING_BALANCE_SET
    notes                   TextField(blank=True)
    timestamp               DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "poi_stock_movement_log"
        indexes = [
            Index(fields=["poi", "-timestamp"]),
            Index(fields=["transport_order", "event_type"]),
        ]
}
```

`transport_requisition` FK is removed (TR approval no longer generates stock events).

### 1.3 Event Types

| event_type | When written |
|---|---|
| `TO_DISPATCHED_IN_TRANSIT` | TO transitions to in-transit — increments both in-transit counters |
| `TO_CANCELLED_IN_TRANSIT_REVERSED` | TO cancelled after dispatch — reverses in-transit counters |
| `SCALE_OUT_SOURCE_DEDUCTION` | Scale-out at source — reduces `current_stock_mt` by `abs(scale_in − scale_out)` |
| `SCALE_OUT_DESTINATION_ADDITION` | Scale-out at destination — adds `abs(scale_in − scale_out)` to `current_stock_mt` |
| `IN_TRANSIT_CLEARED_ON_DELIVERY` | Clears in-transit counters at both POIs on confirmed destination scale-out |
| `STOCK_UNDERFLOW_WARNING` | Source deduction would push `current_stock_mt` below zero — logged but not blocking |
| `STOCK_MUTATION_FAILED` | Stock bookkeeping raised an unexpected exception — operation proceeded; manual reconciliation may be required |
| `OPENING_BALANCE_SET` | Opening balance set on POI add form — only event type with a human actor |

Removed event types (v1.x only): `TR_APPROVED_RESERVATION`, `TR_RESERVATION_RELEASED`.

---

## 2. Scaling Model Field Names (v2.0)

The physical weighings are renamed for clarity:

| Old name (v1.x) | New name (v2.0) | Model | DB column |
|---|---|---|---|
| `ScaleIn.gross_weight_mt` | `ScaleIn.scale_in_weight_mt` | `ScaleIn` | `scale_in_weight_mt` |
| `ScaleOut.tare_weight_mt` | `ScaleOut.scale_out_weight_mt` | `ScaleOut` | `scale_out_weight_mt` |

`ScaleOut.net_weight_mt` is retained as a stored computed value for display and audit.

**Net weight formula:**
```
net_weight_mt = abs(scale_in_weight_mt − scale_out_weight_mt)
```

Admin form labels show **"Weight (MT)"** for both scale-in and scale-out inputs — "Gross" and "Tare" terminology is removed from all operator-facing screens.

---

## 3. Stock Movement Decision Matrix

When `ScaleOutService.record_scale_out()` completes, the stock service receives `(flow_lane, yard_leg, scale_out)` and applies:

| flow_lane | yard_leg | Source POI effect | Destination POI effect |
|---|---|---|---|
| `FG_OUTBOUND` | `source` | `current_stock_mt` ↓ by `net_weight_mt` | — |
| `FG_OUTBOUND` | `destination` | `in_transit_outgoing_mt` ↓ | `current_stock_mt` ↑ by `net_weight_mt`; `in_transit_incoming_mt` ↓ |
| `FG_INBOUND` | `destination` | `in_transit_outgoing_mt` ↓ | `current_stock_mt` ↑ by `net_weight_mt`; `in_transit_incoming_mt` ↓ |
| `RM_INBOUND` | `destination` | `in_transit_outgoing_mt` ↓ | `current_stock_mt` ↑ by `net_weight_mt`; `in_transit_incoming_mt` ↓ |

`net_weight_mt = abs(scale_in.scale_in_weight_mt − scale_out.scale_out_weight_mt)`

> **flow_lane traversal:** `flow_lane` is not on `WeighingSession` or `ScaleOut` directly. Retrieve it via `scale_out.weighing_session.transport_order.flow_lane`. `yard_leg` is on `WeighingSession` directly.

**Underflow guard (source deduction only):** If `current_stock_mt − net_weight_mt < 0`, the deduction proceeds (scale-out is not blocked), but a `STOCK_UNDERFLOW_WARNING` event is written to the log.

---

## 4. Stock Movement Triggers

### Trigger 1 — TO Dispatched (in-transit tracking)

**When:** TO transitions to `driving_towards_source` (FG outbound) or `driving_towards_destination` (FG inbound / RM inbound) via TLS-01 / driver trip start.
Hook into `record_driver_transition()` at the `is_first_trip_start_transition()` branch.

**What:** `increment_in_transit_stock(to)` called within the TLS-01 status transition.

- `origin_poi.stock.in_transit_outgoing_mt` ↑ by `to.allocated_quantity`
- `destination_poi.stock.in_transit_incoming_mt` ↑ by `to.allocated_quantity`
- Log: `TO_DISPATCHED_IN_TRANSIT` on both POIs

**Reversal — TO cancelled after dispatch:**
- `reverse_in_transit_stock(to)` — both counters decremented
- **Null-guard required:** Only reverse if a `TO_DISPATCHED_IN_TRANSIT` log entry exists for this TO.
- Log: `TO_CANCELLED_IN_TRANSIT_REVERSED` on both POIs

### Trigger 2 — Scale-Out at Source (FG outbound, yard_leg = source)

**When:** `ScaleOutService.record_scale_out()` completes for a session where `flow_lane=FG_OUTBOUND` and `yard_leg=source`.
**What:** `_apply_source_deduction(scale_out, to)` called atomically within the same scale-out transaction.

- `net_weight_mt = abs(scale_in.scale_in_weight_mt − scale_out.scale_out_weight_mt)`
- `source_poi.stock.current_stock_mt` ↓ by `net_weight_mt`
- Log: `SCALE_OUT_SOURCE_DEDUCTION`
- If result would be negative: also log `STOCK_UNDERFLOW_WARNING`, proceed anyway

In-transit counters are unchanged at source scale-out — the truck is still en route.

### Trigger 3 — Scale-Out at Destination (any lane, yard_leg = destination)

**When:** `ScaleOutService.record_scale_out()` completes for a session where `yard_leg=destination`.
Covers: FG_OUTBOUND destination leg, FG_INBOUND, RM_INBOUND.

For RM_INBOUND: QC pass is a **pre-condition** enforced by `ScaleOutService.validate_eligible_for_scale_out()`.

**What:** `_apply_destination_addition(scale_out, to)` called atomically within the same scale-out transaction.

- `net_weight_mt = abs(scale_in.scale_in_weight_mt − scale_out.scale_out_weight_mt)`
- `destination_poi.stock.current_stock_mt` ↑ by `net_weight_mt`
- `destination_poi.stock.in_transit_incoming_mt` ↓ by `to.allocated_quantity`
- `origin_poi.stock.in_transit_outgoing_mt` ↓ by `to.allocated_quantity`
- Log: `SCALE_OUT_DESTINATION_ADDITION` on destination POI; `IN_TRANSIT_CLEARED_ON_DELIVERY` on source POI

### QC Fail — No Stock Change

**When:** QC fails on RM inbound.
**What:** No stock movement. Scale-out cannot occur — the stock trigger (Trigger 3) therefore never fires.

In-transit counters remain set until the TO is resolved:
- Resample → counters unchanged
- Override to fail + TO cancellation → `reverse_in_transit_stock(to)` fires (Trigger 1 reversal)
- Source stock is **not re-credited** (material was in-transit from supplier/port, never at source)

---

## 5. Validation Guards

### 5.1 Source Availability Guard

**Where:** `CC-01` bay assignment, before a Command Center Officer assigns a loading bay to a TO.
**Service:** `check_source_stock_for_loading(to)` — returns a result object; never raises, never blocks.

**Check:**
```
current_stock_mt + in_transit_outgoing_mt >= TO.allocated_quantity
```

| Result | Response |
|---|---|
| Sufficient | Bay assignment proceeds; `stock_warning: null` in response |
| Insufficient | Bay assignment **still proceeds**; response includes `stock_warning` flag with available/required figures |

The warning is audit-logged as `STOCK_UNDERFLOW_WARNING`. Bay assignment is never blocked.

> **Rationale:** Bay assignment is a physical yard operation — the truck is already on-site. Stock visibility is informational at this stage.

---

## 6. Capacity Threshold Configuration

- Each POI has `capacity_threshold_pct` (IntegerField, null=True, 1–100) on `apps/master_data/models.POI`.
- When null, fallback is **hardcoded to 80** (`poi.capacity_threshold_pct or 80`).
- The threshold controls when the warning badge activates.

---

## 7. Role Visibility

Stock display is read-only everywhere except the opening balance on POI add.

**Role codes in RBAC** must match `Role.role_code` values seeded in `apps/core/role_seed_data.py`:

| Spec label | `role_code` in codebase |
|---|---|
| Requester — Depot | `depot_officer` |
| Requester — Feed Mill | `feed_mill_officer` |
| Requester — Commercial | `commercial_officer` |
| Distribution Officer | `distribution_officer` |
| Distribution Manager | `distribution_manager` |
| Procurement Officer | `procurement_officer` |
| Command Center Officer | `command_center_officer` |

| Role | Stock panel | PR create — destination POI picker | Threshold config | Movement log |
|---|---|---|---|---|
| Tenant Admin | Read | Read | Read / Write | Read |
| Requester (Depot / Feed Mill) | Read | **Read** (see §7.1) | — | — |
| Requester (Commercial) | Read | — | — | — |
| Distribution Officer | Read | — | — | — |
| Distribution Manager | Read | — | — | — |
| Procurement Officer | Read | — | — | — |
| Command Center Officer | Read | — | — | — |
| Transport Planner | — | — | — | — |
| Gateman / Driver / QC / Scaling Operator | — | — | — | — |

**Stock panel** shows: Current Stock, In-Transit Outgoing, In-Transit Incoming, Free Capacity (if `storage_capacity_mt` set), Projected Utilization %.

### 7.1 PR Create Form — Destination POI Capacity (FG)

When a Depot or Feed Mill officer selects destination POI on the Create PR form, the UI shows a read-only capacity snapshot: total capacity, current stock, free capacity, projected utilization.

| Concern | Spec requirement |
|---|---|
| **Data source** | `POI.storage_capacity_mt` + `POIStock` counters (§1.1) |
| **Canonical API** | `GET /api/v1/operations/stock/pois/{poi_id}/stock-snapshot` (§8) |
| **Roles** | `depot_officer`, `feed_mill_officer` must receive 200 |
| **Units** | Stock ledger is MT; PR line weights are KG — convert consistently (`incoming_weight_kg / 1000`) |
| **Null capacity** | When `storage_capacity_mt` is null, show current/in-transit figures; capacity-derived fields return `null` / display `—` |

---

## 8. Stock Snapshot API

### `GET /api/v1/operations/stock/pois/{poi_id}/stock-snapshot`

Implemented in `apps/operations/stock/views.py` (`POIStockSnapshotView`). Role-gated per §7.

**Optional query param:** `incoming_weight_kg` (decimal) — projected utilization includes it (`/1000` MT conversion).

**Response:**
```json
{
  "poi_id": "uuid",
  "poi_name": "Gazipur Depot",
  "poi_type": "depot",
  "storage_capacity_mt": 5000.000,
  "current_stock_mt": 3200.000,
  "in_transit_outgoing_mt": 100.000,
  "in_transit_incoming_mt": 0.000,
  "free_capacity_mt": 1800.000,
  "projected_utilization_pct": 64.0,
  "capacity_threshold_pct": 80,
  "threshold_warning": false,
  "last_updated": "2026-06-24T10:30:00Z"
}
```

`reserved_stock_mt` is removed from the response schema.

When `storage_capacity_mt` is null: `free_capacity_mt`, `projected_utilization_pct`, `capacity_threshold_pct`, and `threshold_warning` are all `null`.

---

## 9. Full Stock Lifecycle

```
POI created
  └─► POI add form sets current_stock_mt (opening balance)
        POIStock row created with that value + in-transit counters at 0
        Log: OPENING_BALANCE_SET

TO dispatched (TLS-01 → driving_towards_source / driving_towards_destination)
  └─► increment_in_transit_stock(to)
        source in_transit_outgoing_mt ↑ by to.allocated_quantity
        destination in_transit_incoming_mt ↑ by to.allocated_quantity

Truck at source — CC bay assignment (FG outbound only)
  └─► check_source_stock_for_loading(to)
        sufficient  → bay assigned (no warning)
        insufficient → bay assigned + stock_warning flag + STOCK_UNDERFLOW_WARNING logged
        (bay assignment never blocked)

Scale-in at source → loading completes → scale-out (FG outbound, yard_leg=source)
  └─► _apply_source_deduction(scale_out, to)
        net = abs(scale_in_weight_mt − scale_out_weight_mt)
        source current_stock_mt ↓ by net
        (in_transit counters unchanged — truck still en route)

Truck travels to destination

Gate-in at destination → Scale-in at destination

  [RM inbound only]:
    QC sampling → QC pass required before scale-out is allowed
    QC fail     → scale-out blocked; in-transit counters stay until TO resolved
                  on TO cancellation: reverse_in_transit_stock(to)
                  source stock NOT re-credited

Unloading completes → scale-out at destination (yard_leg=destination)
  └─► _apply_destination_addition(scale_out, to)
        net = abs(scale_in_weight_mt − scale_out_weight_mt)
        destination current_stock_mt ↑ by net
        destination in_transit_incoming_mt ↓ by to.allocated_quantity
        source in_transit_outgoing_mt ↓ by to.allocated_quantity

Every step above writes one POIStockMovementLog entry (append-only)
```

---

## 10. Integration Points

| Story / Module | Direction | Integration point | Stock service call |
|---|---|---|---|
| TLS-01 (TO dispatch) | TLS-01 → STK-01 | TO transitions to `driving_towards_source` / `driving_towards_destination` | `increment_in_transit_stock(to)` |
| TLS-01 (TO cancellation post-dispatch) | TLS-01 → STK-01 | TO cancelled while in-transit counters are non-zero | `reverse_in_transit_stock(to)` |
| SC-01 (scale-out) | SC-01 → STK-01 | `ScaleOutService.record_scale_out()` completes | `apply_stock_mutation_on_scale_out(scale_out)` — dispatches to Trigger 2 or 3 via matrix |
| CC-01 (bay assignment) | CC-01 calls STK-01 | Before bay is assigned to a TO | `check_source_stock_for_loading(to)` |
| GPS-01 (map dashboard) | GPS-01 reads STK-01 | POI context panel on map | `GET /api/v1/operations/stock/pois/{poi_id}/stock-snapshot` |
| PR-01 (FG PR create) | PR form → STK-01 | Destination POI picker | `GET /api/v1/operations/stock/pois/{poi_id}/stock-snapshot` |
| PR read / TR read serializers | requisitions → STK-01 | `capacity_snapshot` on PR/TR detail | Shared `CapacityService.get_poi_capacity()` delegating to `get_poi_stock_snapshot()` |

All calls to stock services from SC-01 and TLS-01 are made within the originating transaction. Exceptions must be caught at the call site, logged as `STOCK_MUTATION_FAILED`, and must never roll back the originating operational event.

---

## 11. Sub-tasks

| # | Sub-task | Description | Priority |
|---|---|---|---|
| STK-01-1 | `POIStock` model + migration | Remove `reserved_stock_mt`. Keep `current_stock_mt`, `in_transit_outgoing_mt`, `in_transit_incoming_mt`. Update `free_capacity_mt` property. | High |
| STK-01-2 | `POIStockMovementLog` model + migration | Remove `TR_APPROVED_RESERVATION` / `TR_RESERVATION_RELEASED` event types. Remove `transport_requisition` FK. | High |
| STK-01-3 | Scaling model renames + migration | Rename `ScaleIn.gross_weight_mt` → `scale_in_weight_mt`; `ScaleOut.tare_weight_mt` → `scale_out_weight_mt`. Update net weight calculation to `abs(scale_in_weight_mt − scale_out_weight_mt)`. | High |
| STK-01-4 | Remove TR reservation hooks | Delete `reserve_source_stock()`, `release_source_reservation()` from `apps/operations/stock/services.py`. Remove `_reserve_stock()` / `_release_stock()` calls from `TRService.approve()`, `approve_with_modify()`, `reject()`, `cancel()`. | High |
| STK-01-5 | Scale-out stock mutation update | Update `_apply_source_deduction()` and `_apply_destination_addition()` in `services.py` to use `abs(scale_in_weight_mt − scale_out_weight_mt)` as the delta. Remove reserved stock deduction from source path. Remove `check_destination_capacity()`. | High |
| STK-01-6 | TO dispatch in-transit hook | Unchanged from v1.x — `increment_in_transit_stock(to)` and `reverse_in_transit_stock(to)` with null-guard. Uses `to.allocated_quantity`. | High |
| STK-01-7 | POI add form — opening balance | Add `current_stock_mt` (non-model field) to `POIAdmin` add fieldset. In `save_model()` on add: create `POIStock` row with the provided value and log `OPENING_BALANCE_SET`. Field absent / read-only on change form. | High |
| STK-01-8 | Admin + list display cleanup | Remove `display_reserved_stock` from `POIAdmin.list_display`. Update `POIStockAdmin` and `POIStockInline` to drop `reserved_stock_mt`. Update scaling admin labels: "Gross Weight" → "Scale-In Weight (MT)", "Tare Weight" → "Scale-Out Weight (MT)". Fieldset "Tare Weight" → "Scale-Out Weight". | High |
| STK-01-9 | Stock snapshot API + serializer | Remove `reserved_stock_mt` from `get_poi_stock_snapshot()` return dict, `POIStockSnapshotSerializer`, and `CapacityService` response. Update `free_capacity_mt` formula. | High |
| STK-01-10 | Source availability check | Update `check_source_stock_for_loading()` formula to `current_stock_mt + in_transit_outgoing_mt >= required` (no reserved term). | Medium |
| STK-01-11 | E2E test coverage | Full flow: POI created with opening balance → TO dispatched → in-transit set → scale-out at source → current_stock reduced → scale-out at destination → destination stock increased + in-transit cleared. RM inbound QC fail path. Snapshot API at each step. | Medium |

---

## 12. Validation Rules

- Stock mutations execute within the originating transaction. If a stock mutation raises, the exception is caught at the call site, logged as `STOCK_MUTATION_FAILED`, and the originating operation proceeds normally.
- `select_for_update()` on `POIStock` row for every mutation — prevents concurrent race conditions.
- `current_stock_mt` may go negative (underflow is logged as `STOCK_UNDERFLOW_WARNING`, never blocked).
- `POIStockMovementLog` is append-only — no update or delete path.
- `OPENING_BALANCE_SET` is the only event writable by a human actor; all others have `actor=null`.
- Capacity-derived fields skip when `poi.storage_capacity_mt is null`.
- Source availability check fires at CC bay assignment only; never blocks.
- No stock check or mutation failure ever returns HTTP 4xx or 5xx to an operator.

---

## 13. Definition of Done

- [ ] `reserved_stock_mt` removed from `POIStock` model and migration applied (STK-01-1)
- [ ] `TR_APPROVED_RESERVATION` / `TR_RESERVATION_RELEASED` event types removed; `transport_requisition` FK removed from `POIStockMovementLog` (STK-01-2)
- [ ] `ScaleIn.gross_weight_mt` → `scale_in_weight_mt`; `ScaleOut.tare_weight_mt` → `scale_out_weight_mt`; migration applied; net weight = abs difference (STK-01-3)
- [ ] TR approval / rejection / cancellation no longer calls any stock service (STK-01-4)
- [ ] Scale-out stock mutation uses `abs(scale_in_weight_mt − scale_out_weight_mt)`; no reserved deduction at source (STK-01-5)
- [ ] TO dispatch increments in-transit by `to.allocated_quantity`; null-guard on cancellation reversal (STK-01-6)
- [ ] POI add form accepts `current_stock_mt`; `POIStock` row created with opening balance on save; `OPENING_BALANCE_SET` logged; field absent on change form (STK-01-7)
- [ ] Admin list and inline views show no `reserved_stock_mt`; scale forms show "Weight (MT)" labels (STK-01-8)
- [ ] Snapshot API response has no `reserved_stock_mt`; `free_capacity_mt = storage_capacity_mt − current_stock_mt` (STK-01-9)
- [ ] `check_source_stock_for_loading()` uses updated formula; CC bay assignment still never blocked (STK-01-10)
- [ ] E2E test covers full FG outbound round trip and RM inbound QC fail path (STK-01-11)
- [ ] UAT: new POI add — opening balance field visible and saved correctly
- [ ] UAT: POI change — opening balance field absent / read-only
- [ ] UAT: Scale-in form shows "Weight (MT)" label; scale-out form shows "Weight (MT)" label; net weight calculated as abs difference
- [ ] UAT: Command Center Officer sees source stock warning on insufficient stock; bay assignment proceeds regardless

---

*Module: 06-poi-operations | Spec: Stock Operations | Phase: 1 | Sprint: 5 | Story: STK-01 (DFS-071) | Last Updated: 2026-06-24 | Version: 2.0*
