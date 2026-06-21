---
module: 06-poi-operations
specification: Stock Operations (Sprint 5 — Event-Driven, Scale-Out Triggered)
version: 1.3
phase: Phase 1
sprint: Sprint 5
last_updated: 2026-06-09
changelog: |
  v1.0 — initial specification; stock trigger is scale-out net weight, not QC pass; unified (flow_lane, yard_leg) decision matrix; storage_capacity_mt nullable guard (skip when null)
  v1.1 — backend alignment fixes: allocated_quantity field names corrected (no _mt suffix); TR reservation quantity source clarified (total_quantity on TR, not per-line-item); FlowLane enum DB values documented (lowercase); STOCK_MUTATION_MAP key casing fix noted; TO dispatch trigger status corrected (READY_FOR_DISPATCH → driving_towards_*); TO cancellation null-guard added; WeighingSession → TransportOrder traversal for flow_lane noted; capacity_threshold_pct migration target updated; tenant settings model noted as not yet existing; TR approval status transition corrected (PENDING_APPROVAL → AVAILABLE_FOR_TRANSPORT_PLANNING)
  v1.2 — no-blocker policy: source availability guard demoted to warning-only (never returns 409, never blocks bay assignment); destination capacity guard CAPACITY_OVERRIDE_REQUIRED demoted to warning-only (no mandatory remarks, no hard block); stock mutation exceptions inside record_scale_out() must be caught and logged, never re-raised; all stock bookkeeping failures are non-blocking to yard operations
  v1.3 — PR/TR form read-path clarified: document Sprint 3 legacy CapacityService gap, canonical stock-snapshot integration for PR destination POI picker, role-code alignment with apps/requisitions (depot_officer not requester_depot), requester visibility on PR create reconciled with PRD §6.7; §13 implementation-gap audit added
related_stories: DFS-071 (STK-01)
jira_epic: DFS-072
resolved_open_questions:
  - "OQ-1: Opening balances — flexible; operations may provide or system starts at zero"
  - "OQ-2: QC fail disposition — material returns to port/supplier; source stock unchanged; in-transit reversed on TO cancellation"
  - "OQ-3: DM capacity override — remarks only, no second sign-off"
  - "OQ-4: Null storage_capacity_mt — destination guard skipped entirely when POI has no capacity configured"
---

# Stock Operations Specification (Sprint 5)

## Overview

The **Stock Operations** specification defines how the platform maintains a live, event-driven stock ledger at every POI (depot, feed mill, warehouse, port). Stock figures are never entered manually — they are derived exclusively from verified operational events that already exist in the yard chain (TR approval, TO dispatch, scale-out).

The stock model is the connective tissue between five Sprint 5 stories:

- **SC-01** (Scale-out) → the authoritative stock movement trigger
- **QC-01** (QC pass/fail) → a scale-out pre-condition for RM, not a stock event
- **GT-01** (Gate-out) → closes the in-transit loop at the source leg
- **TLS-01** (TO Lifecycle) → fires the dispatch event that starts in-transit tracking
- **CC-01** (Command Center) → the checkpoint where the source availability guard runs

**Module path**: `apps/operations/stock/`
**Dependencies**: `apps/master_data/` (POI, `storage_capacity_mt`), `apps/transport/` (TransportOrder, `flow_lane`, `origin_poi`, `destination_poi`), `apps/operations/scaling/` (ScaleOut, `net_weight_mt`), `apps/operations/gate/` (GateVisitSession, `yard_leg`), `apps/requisitions/` (TransportRequisition)
**Enables**: POI stock display on PR/TR creation forms, destination capacity guard at DM approval, source availability guard at CC bay assignment, GPS-01 map dashboard stock panel

> **v1.3 audit note — PR create form:** Depot / Feed Mill officers currently see no useful stock when selecting **destination POI** on a Finished Goods PR because the Sprint 3 read path (`CapacityService` in `apps/requisitions/services.py`) was never wired to `POIStock` / `storage_capacity_mt`, and the Sprint 5 stock-snapshot API is not integrated into the PR form flow. See §6.1 and §13.

---

## 0. Core Design Principles

> **Stock always moves at scale-out. The direction and target POI are determined by `(flow_lane, yard_leg)`.**

QC is a **pre-condition for scale-out** on RM inbound — it is not a separate stock event. Once scale-out is confirmed, the stock movement is unconditional and atomic.

This keeps the stock trigger surface to exactly one place: `ScaleOutService.record_scale_out()`.

> **Stock bookkeeping never blocks yard operations.**

Stock figures are a ledger — they record what happened, they do not gate whether it can happen. All guards (source availability, destination capacity) are **warning-only**. All stock mutation exceptions inside `record_scale_out()`, `record_driver_transition()`, and TR approval are **caught, logged, and swallowed** — they must never propagate and roll back the originating operational event. A scale-out that succeeds physically must always succeed in the database, regardless of what the stock ledger does next.

---

## 1. Data Model

### 1.1 POIStock (new model — one-to-one with POI)

```python
POIStock(TenantAwareModel) {
    poi                     OneToOneField(POI, related_name='stock', on_delete=CASCADE)

    current_stock_mt        DecimalField(max_digits=12, decimal_places=3, default=0)
    reserved_stock_mt       DecimalField(max_digits=12, decimal_places=3, default=0)
    in_transit_outgoing_mt  DecimalField(max_digits=12, decimal_places=3, default=0)
    # ^ quantity loaded on trucks currently en route *from* this POI

    in_transit_incoming_mt  DecimalField(max_digits=12, decimal_places=3, default=0)
    # ^ quantity on trucks currently en route *to* this POI

    last_updated            DateTimeField(auto_now=True)

    class Meta:
        db_table = "poi_stock"
}
```

**Computed properties (not stored — derived on read):**

```
free_capacity_mt = poi.storage_capacity_mt - current_stock_mt - reserved_stock_mt
    → returns None when poi.storage_capacity_mt is null

projected_utilization_pct = (current_stock_mt + in_transit_incoming_mt) / poi.storage_capacity_mt * 100
    → returns None when poi.storage_capacity_mt is null
```

All mutating operations on `POIStock` use `select_for_update()` inside `atomic()` — no stock field is ever written outside a transaction lock.

**Initial seeding**: A migration creates a `POIStock` row with all fields at `0` for every existing POI. For go-live with real opening balances, Tenant Admin can set `current_stock_mt` via the admin panel before operations begin. The system does not mandate opening balances — zero is a valid starting state.

### 1.2 POIStockMovementLog (new model — append-only)

```python
POIStockMovementLog(TenantAwareModel) {
    poi                     FK → POI
    event_type              CharField(choices — see §1.3)
    transport_order         FK → TransportOrder (null=True)
    transport_requisition   FK → TransportRequisition (null=True)
    field_affected          CharField  # 'current_stock_mt' | 'reserved_stock_mt' | 'in_transit_outgoing_mt' | 'in_transit_incoming_mt'
    quantity_mt             DecimalField(max_digits=12, decimal_places=3)
    previous_value_mt       DecimalField(max_digits=12, decimal_places=3)
    new_value_mt            DecimalField(max_digits=12, decimal_places=3)
    actor                   FK → User (null=True)  # null for system-generated events
    notes                   TextField(blank=True)
    timestamp               DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "poi_stock_movement_log"
        # No update, no delete. Enforced via admin (all fields read-only) and no update path in services.
        indexes = [
            Index(fields=["poi", "-timestamp"]),
            Index(fields=["transport_order", "event_type"]),
        ]
}
```

### 1.3 Event Types

| event_type | When written |
|---|---|
| `TR_APPROVED_RESERVATION` | TR approved by DM or Procurement — reserves source stock |
| `TR_RESERVATION_RELEASED` | TR rejected, cancelled, or modified down — reverses reservation |
| `TO_DISPATCHED_IN_TRANSIT` | TO transitions to in-transit — increments both in-transit counters |
| `TO_CANCELLED_IN_TRANSIT_REVERSED` | TO cancelled after dispatch — reverses in-transit counters |
| `SCALE_OUT_SOURCE_DEDUCTION` | Scale-out at source (FG outbound) — reduces source current + reserved stock |
| `SCALE_OUT_DESTINATION_ADDITION` | Scale-out at destination (any lane) — adds to destination current stock |
| `IN_TRANSIT_CLEARED_ON_DELIVERY` | Clears in-transit counters at both POIs on confirmed destination scale-out |
| `STOCK_UNDERFLOW_WARNING` | Scale-out deduction would push current_stock_mt below zero — logged but not blocking |
| `STOCK_MUTATION_FAILED` | Stock bookkeeping raised an unexpected exception — operation proceeded; manual reconciliation may be required |
| `OPENING_BALANCE_SET` | Tenant Admin sets initial stock via admin — only event created by a human actor |

---

## 2. Stock Movement Decision Matrix

When `ScaleOutService.record_scale_out()` completes, the stock service receives `(flow_lane, yard_leg, scale_out)`. It applies the following matrix — one row per scenario:

| flow_lane | yard_leg | Source POI effect | Destination POI effect |
|---|---|---|---|
| `FG_OUTBOUND` | `source` | `current_stock_mt` ↓ by `net_weight_mt`; `reserved_stock_mt` ↓ by TO reservation | — |
| `FG_OUTBOUND` | `destination` | `in_transit_outgoing_mt` ↓ | `current_stock_mt` ↑ by `net_weight_mt`; `in_transit_incoming_mt` ↓ |
| `FG_INBOUND` | `destination` | `in_transit_outgoing_mt` ↓ | `current_stock_mt` ↑ by `net_weight_mt`; `in_transit_incoming_mt` ↓ |
| `RM_INBOUND` | `destination` | `in_transit_outgoing_mt` ↓ | `current_stock_mt` ↑ by `net_weight_mt`; `in_transit_incoming_mt` ↓ |

This table is implemented as `STOCK_MUTATION_MAP` in `apps/operations/stock/services.py` and mirrors the existing `SCALE_OUT_RESULT_TO_STATUS` pattern in `apps/transport/constants.py`.

> **Implementation note — key casing:** Map keys must use `FlowLane` enum members (e.g. `FlowLane.FG_OUTBOUND`), not uppercase string literals. The DB values are lowercase (`"fg_outbound"`, `"fg_inbound"`, `"rm_inbound"`) — using bare strings instead of enum references will silently miss every lookup and no stock mutation will fire.

> **flow_lane traversal:** `flow_lane` is not on `WeighingSession` or `ScaleOut` directly. Retrieve it via `scale_out.weighing_session.transport_order.flow_lane`. `yard_leg` is on `WeighingSession` directly.

**Underflow guard (source deduction only):** If `current_stock_mt − net_weight_mt < 0`, the deduction proceeds (scale-out is not blocked), but a `STOCK_UNDERFLOW_WARNING` event is written to the log. This signals a data integrity issue to the Tenant Admin without disrupting yard operations.

---

## 3. Stock Movement Triggers

### Trigger 1 — TR Approved (reservation)

**When:** Distribution Manager or Procurement Officer approves a TR.
TR transitions from `pending_approval` → `available_for_transport_planning` on approval (see `TRService.approve()` and `TRService.approve_with_modify()`).
**What:** `reserve_source_stock(tr_id)` called atomically within the TR approval transaction.

- `source_poi.stock.reserved_stock_mt` ↑ by `tr.total_quantity` (the denormalized sum on `TransportRequisition`; field name is `total_quantity`, not `allocated_quantity_mt`)
- Log: `TR_APPROVED_RESERVATION`

> **Implementation note:** `TransportRequisition` has no direct `allocated_quantity_mt` field. The quantity lives on `TRLineItem.allocated_quantity` (Decimal, unit per `unit_of_measure`). Use `tr.total_quantity` (the denormalized sum kept in sync on the TR header) as the reservation amount. Ensure only `UOM.TONS` line items contribute if mixed units are ever permitted.

**Reversal — any of the following cancels the reservation:**
- TR rejected → `release_source_reservation(tr_id)`
- TR cancelled → `release_source_reservation(tr_id)`
- TR quantity reduced → reservation adjusted to new quantity
- TO linked to TR cancelled → `release_source_reservation(tr_id)` if no scale-out yet
- Log: `TR_RESERVATION_RELEASED`

### Trigger 2 — TO Dispatched (in-transit tracking)

**When:** TO transitions to `driving_towards_source` (FG outbound) or `driving_towards_destination` (FG inbound / RM inbound) via TLS-01 / driver trip start.
This is the first driver transition: `READY_FOR_DISPATCH` → `driving_towards_source` / `driving_towards_destination` (see `FIRST_DRIVER_TRANSITION` map in `apps/transport/constants.py`). Hook into `record_driver_transition()` in `apps/transport/driver_transition_service.py` — specifically at the `is_first_trip_start_transition()` branch.
**What:** `increment_in_transit_stock(to_id)` called atomically within the TLS-01 status transition.

- `origin_poi.stock.in_transit_outgoing_mt` ↑ by `to.allocated_quantity` (field name is `allocated_quantity`, no `_mt` suffix — `TransportOrder` model, `apps/transport/models.py`)
- `destination_poi.stock.in_transit_incoming_mt` ↑ by `to.allocated_quantity`
- Log: `TO_DISPATCHED_IN_TRANSIT` on both POIs

**Reversal — TO cancelled after dispatch:**
- `reverse_in_transit_stock(to_id)` — both counters decremented
- **Null-guard required:** Only reverse if a `TO_DISPATCHED_IN_TRANSIT` log entry exists for this TO. `TransportOrderService.cancel()` allows cancellation from `READY_FOR_DISPATCH` (pre-dispatch) through to `DELIVERED_UNLOADED` — without this guard, a pre-dispatch cancellation would attempt to reverse counters that were never incremented.
- Log: `TO_CANCELLED_IN_TRANSIT_REVERSED` on both POIs

### Trigger 3 — Scale-Out at Source (FG outbound, yard_leg = source)

**When:** `ScaleOutService.record_scale_out()` completes for a session where `flow_lane=FG_OUTBOUND` and `yard_leg=source`.
**What:** `apply_scale_out_stock_deduction(scale_out_id)` called atomically within the same scale-out transaction.

- `source_poi.stock.current_stock_mt` ↓ by `scale_out.net_weight_mt`
- `source_poi.stock.reserved_stock_mt` ↓ by the TO's reservation amount
- Log: `SCALE_OUT_SOURCE_DEDUCTION`
- If result would be negative: also log `STOCK_UNDERFLOW_WARNING`, proceed anyway

### Trigger 4 — Scale-Out at Destination (any lane, yard_leg = destination)

**When:** `ScaleOutService.record_scale_out()` completes for a session where `yard_leg=destination`.
Covers: FG_OUTBOUND destination leg, FG_INBOUND, RM_INBOUND.

For RM_INBOUND: QC pass is already a **pre-condition** enforced by `ScaleOutService.validate_eligible_for_scale_out()` — if QC has not passed, scale-out cannot be recorded, so this trigger never fires without a QC pass on RM.

**What:** `apply_destination_stock_addition(scale_out_id)` called atomically within the same scale-out transaction.

- `destination_poi.stock.current_stock_mt` ↑ by `scale_out.net_weight_mt`
- `destination_poi.stock.in_transit_incoming_mt` ↓ by the TO's in-transit quantity
- `origin_poi.stock.in_transit_outgoing_mt` ↓ by the TO's in-transit quantity
- Log: `SCALE_OUT_DESTINATION_ADDITION` on destination POI; `IN_TRANSIT_CLEARED_ON_DELIVERY` on source POI

### QC Fail — No Stock Change

**When:** QC fails on RM inbound.
**What:** No stock movement. Scale-out cannot occur after QC fail — the stock trigger (Trigger 4) therefore never fires.

In-transit counters remain set until the TO is resolved:
- Resample → new QC decision cycle, counters unchanged
- Override to fail + TO cancellation → `reverse_in_transit_stock(to_id)` fires (Trigger 2 reversal)
- Material returns to port/supplier — source stock is **not re-credited** (material never arrived at source; it was in-transit from supplier/port)

---

## 4. Validation Guards

### 4.1 Source Availability Guard

**Where:** `CC-01` bay assignment, before a Command Center Officer assigns a loading bay to a TO.
**Service:** `check_source_stock_for_loading(to_id)` — returns a result object; never raises, never blocks.

**Check:**
```
current_stock_mt + in_transit_outgoing_mt >= TO.allocated_quantity
```
(`TO.allocated_quantity` — no `_mt` suffix; field on `TransportOrder` model)

| Result | Response |
|---|---|
| Sufficient | Bay assignment proceeds; `stock_warning: null` in response |
| Insufficient | Bay assignment **still proceeds**; response includes `stock_warning` flag with available/required figures |

**No operation is ever blocked by this check.** The CCO sees a warning indicator alongside the bay assignment confirmation, but the assignment goes through regardless. The warning is audit-logged as `STOCK_UNDERFLOW_WARNING` on `POIStockMovementLog`.

> **Rationale:** Bay assignment is a physical yard operation — the truck is already on-site. A bookkeeping shortfall (e.g. zero opening balances at go-live, in-flight TOs predating the stock module) must never strand a vehicle in the yard. Stock visibility is informational at this stage.

This check does not fire at gate-in or scale-in — only at the CC bay assignment step.

### 4.2 Destination Capacity Guard

**Where:** TR approval by Distribution Manager; Procurement Officer destination breakdown plan submission.
**Service:** `validate_destination_capacity(poi_id, quantity_mt)`

**When `poi.storage_capacity_mt` is null — skip the guard entirely.** No warning, no block. The POI has no capacity configured so there is no basis for a check.

**When `poi.storage_capacity_mt` is set:**

```
free_capacity_mt = storage_capacity_mt - current_stock_mt - reserved_stock_mt
projected_utilization_pct = (current_stock_mt + in_transit_incoming_mt) / storage_capacity_mt * 100
```

| Outcome | Condition | System response |
|---|---|---|
| `CAPACITY_OK` | `free_capacity_mt >= quantity_mt` and utilization < threshold | Approval proceeds normally |
| `CAPACITY_WARNING` | `free_capacity_mt >= quantity_mt` but `projected_utilization_pct >= threshold_pct` | Warning badge shown; approval proceeds without extra confirmation |
| `CAPACITY_OVER` | `free_capacity_mt < quantity_mt` | Warning badge shown with over-capacity indicator; **approval proceeds without mandatory remarks and without extra confirmation** |

**No outcome blocks the operation.** All three outcomes allow the approval to proceed immediately. Warning badges are informational only — they surface stock visibility to the DM/Procurement Officer without gating their action. The outcome and figures are audit-logged on every approval regardless of outcome.

---

## 5. Capacity Threshold Configuration

- Each POI has a `capacity_threshold_pct` field (IntegerField, null=True, 1–100) on `apps/master_data/models.POI` (migration `0017_add_poi_capacity_threshold.py`).
- When a POI has no threshold set, the fallback is **hardcoded to 80** (`threshold = poi.capacity_threshold_pct or 80`). No tenant-level configurable default — the overhead of a singleton settings model is not justified for a single fallback value.
- The threshold controls when `CAPACITY_WARNING` activates and when the warning badge escalates visually (escalation at 90%).
- Per-POI threshold changes are audit-logged by Tenant Admin.

---

## 6. Role Visibility

Stock display is read-only everywhere. No user may manually adjust stock figures from any operational screen (only the Tenant Admin opening balance entry is the exception, and only before operations begin).

**Role codes in RBAC** must match `Role.role_code` values seeded in `apps/core/role_seed_data.py` — not legacy story aliases:

| Spec label | `role_code` in codebase |
|---|---|
| Requester — Depot | `depot_officer` |
| Requester — Feed Mill | `feed_mill_officer` |
| Requester — Commercial | `commercial_officer` |
| Distribution Officer | `distribution_officer` |
| Distribution Manager | `distribution_manager` |
| Procurement Officer | `procurement_officer` |
| Command Center Officer | `command_center_officer` |

> **Do not use** `requester_depot`, `requester_feed_mill`, or `requester_commercial` in stock RBAC checks — those slugs do not exist in the tenant role seed and will cause false 403 responses.

| Role | Source stock panel | Destination capacity panel | PR create — destination POI picker | Threshold configuration | Movement log |
|---|---|---|---|---|---|
| Tenant Admin | Read | Read | Read | Read / Write | Read |
| Requester (Depot / Feed Mill) | Read | — | **Read** (see §6.1) | — | — |
| Requester (Commercial) | Read | — | — (Port Shipment — no destination POI on PR header) | — | — |
| Distribution Officer | Read | Read | — | — | — |
| Distribution Manager | Read | Read (+ override approval) | — | — | — |
| Procurement Officer | Read | Read (+ override approval) | — | — | — |
| Command Center Officer | Read | — | — | — | — |
| Transport Planner | — | — | — | — | — |
| Gateman / Driver / QC / Scaling Operator | — | — | — | — | — |

**Source stock panel** shows: Current Stock, Reserved Stock, In-Transit Outgoing, Free Capacity (if `storage_capacity_mt` set).
**Destination capacity panel** shows: Total Capacity, Current Stock, Free Capacity, In-Transit Incoming, Projected Utilization %, threshold warning badge. All capacity fields show `—` when `storage_capacity_mt` is null.

### 6.1 PR Create Form — Destination POI Capacity (FG)

Per PRD §6.7 (Finished Goods PR logistics): when a Depot or Feed Mill officer selects **destination POI** on the Create PR form, the UI must show a read-only **capacity snapshot** for the selected POI — total capacity, current stock, free capacity, and projected utilization after the in-progress line items (PRD: *"Inventory Capacity (Stock of Requester POI)"*; on FG PRs `destination_poi` is pre-filled from the requester's assigned POI and is editable).

| Concern | Spec requirement |
|---|---|
| **When** | On destination POI change (and when line-item weight totals change) — not only after PR save |
| **Data source** | `POI.storage_capacity_mt` + `POIStock` counters (§1.1) — single shared read service, not ad-hoc POI fields |
| **Canonical API** | `GET /api/v1/operations/stock/pois/{poi_id}/stock-snapshot` (§7), with optional `incoming_weight_kg` query param for projected utilization |
| **Roles** | `depot_officer`, `feed_mill_officer` must receive 200 — informational only, never blocks PR submit |
| **Units** | Stock ledger is MT; PR line weights are KG — projected utilization must convert consistently (`incoming_weight_kg / 1000`) |
| **Null capacity** | When `storage_capacity_mt` is null, show current/reserved/in-transit stock figures; capacity-derived fields (`free_capacity_mt`, `projected_utilization_pct`, `threshold_warning`) return `null` / display `—` |

**Legacy path (to retire):** Sprint 3 exposed `GET /api/v1/product-requisitions/capacity?poi_id=` via `CapacityService.get_poi_capacity()`. That service reads non-existent attributes `poi.capacity_kg` and `poi.current_stock_kg` and therefore always returns zeros. PR serializers (`capacity_snapshot` on `ProductRequisitionReadSerializer`) and TR serializers (`source_capacity_snapshot` / `destination_capacity_snapshot`) still call this service — they must be migrated to the shared stock-snapshot read service in STK-01-11.

---

## 7. Stock Snapshot API

### `GET /api/v1/operations/stock/pois/{poi_id}/stock-snapshot`

Implemented in `apps/operations/stock/views.py` (`POIStockSnapshotView`). Returns the live stock state for a single POI. Role-gated per §6 and §6.1.

**Optional query param:** `incoming_weight_kg` (decimal) — when provided, response includes `projected_utilization_pct` computed as `(current_stock_mt + in_transit_incoming_mt + incoming_weight_kg/1000) / storage_capacity_mt × 100`. Omit when `storage_capacity_mt` is null.

**Response:**
```json
{
  "poi_id": "uuid",
  "poi_name": "Gazipur Depot",
  "poi_type": "depot",
  "storage_capacity_mt": 5000.000,
  "current_stock_mt": 3200.000,
  "reserved_stock_mt": 400.000,
  "in_transit_outgoing_mt": 100.000,
  "in_transit_incoming_mt": 0.000,
  "free_capacity_mt": 1400.000,
  "projected_utilization_pct": 64.0,
  "capacity_threshold_pct": 80,
  "threshold_warning": false,
  "last_updated": "2026-06-08T10:30:00Z"
}
```

When `storage_capacity_mt` is null: `free_capacity_mt`, `projected_utilization_pct`, `capacity_threshold_pct`, and `threshold_warning` are all returned as `null`.

`capacity_threshold_pct` in the response is `poi.capacity_threshold_pct` when set, otherwise `80` (hardcoded fallback — no tenant settings model).

### Source Guard Error Response (409)
```json
{
  "error": "INSUFFICIENT_SOURCE_STOCK",
  "message": "Insufficient source stock at Gazipur Depot. Available: 320.000 MT, Required: 500.000 MT.",
  "poi_id": "uuid",
  "available_mt": 320.0,
  "required_mt": 500.0
}
```

### Destination Capacity Guard Response (200 with flag)
```json
{
  "capacity_check": "CAPACITY_OVERRIDE_REQUIRED",
  "message": "Free capacity at Chittagong Feed Mill (120 MT) is less than the requested quantity (300 MT). Override requires mandatory remarks.",
  "poi_id": "uuid",
  "free_capacity_mt": 120.0,
  "requested_quantity_mt": 300.0,
  "projected_utilization_pct": 97.5
}
```

---

## 8. Full Stock Lifecycle

```
TR approved
  └─► reserve_source_stock(tr_id)
        source reserved_stock_mt ↑
        + validate_destination_capacity() → CAPACITY_OK / WARNING / OVERRIDE_REQUIRED

TO dispatched (TLS-01 → driving_towards_source / driving_towards_destination)
  └─► increment_in_transit_stock(to_id)
        source in_transit_outgoing_mt ↑
        destination in_transit_incoming_mt ↑

Truck at source — CC bay assignment (FG outbound only)
  └─► check_source_stock_for_loading(to_id)
        sufficient  → loading bay assigned (no warning in response)
        insufficient → loading bay assigned + stock_warning flag in response + STOCK_UNDERFLOW_WARNING logged
        (bay assignment is never blocked by this check)

Scale-in at source → loading completes → scale-out (FG outbound, yard_leg=source)
  └─► apply_scale_out_stock_deduction(scale_out_id)
        source current_stock_mt ↓ by net_weight_mt
        source reserved_stock_mt ↓
        (in_transit counters unchanged — truck is still en route)

Truck travels to destination

Gate-in at destination
Scale-in at destination

  [RM inbound only]:
    QC sampling → QC pass required before scale-out is allowed
    QC fail     → scale-out blocked; in-transit counters stay until TO resolved
                  on TO cancellation: reverse_in_transit_stock(to_id)
                  source stock NOT re-credited (material returns to port/supplier)

Unloading completes → scale-out at destination (yard_leg=destination)
  └─► apply_destination_stock_addition(scale_out_id)
        destination current_stock_mt ↑ by net_weight_mt
        destination in_transit_incoming_mt ↓
        source in_transit_outgoing_mt ↓

Every step above writes one POIStockMovementLog entry (append-only)
```

---

## 9. Integration Points

| Story / Module | Direction | Integration point | Stock service call |
|---|---|---|---|
| TR approval (DM / Procurement) | TR service → STK-01 | TR status transitions to `approved` | `reserve_source_stock(tr_id)` + `validate_destination_capacity()` |
| TR rejection / cancellation | TR service → STK-01 | TR status transitions to `rejected` / `cancelled` | `release_source_reservation(tr_id)` |
| TLS-01 (TO dispatch) | TLS-01 → STK-01 | TO transitions to `driving_towards_source` / `driving_towards_destination` | `increment_in_transit_stock(to_id)` |
| TLS-01 (TO cancellation post-dispatch) | TLS-01 → STK-01 | TO cancelled while in-transit counters are non-zero | `reverse_in_transit_stock(to_id)` |
| SC-01 (scale-out) | SC-01 → STK-01 | `ScaleOutService.record_scale_out()` completes | `apply_stock_mutation_on_scale_out(scale_out_id)` — dispatches to Trigger 3 or 4 via matrix |
| CC-01 (bay assignment) | CC-01 calls STK-01 | Before bay is assigned to a TO | `validate_source_stock_for_loading(to_id)` |
| GPS-01 (map dashboard) | GPS-01 reads STK-01 | POI context panel on map | `GET /api/v1/operations/stock/pois/{poi_id}/stock-snapshot` |
| **PR-01 (FG PR create)** | **PR form → STK-01** | **Destination POI picker on Create / Edit Draft PR** | **`GET /api/v1/operations/stock/pois/{poi_id}/stock-snapshot`** (+ `incoming_weight_kg` from line items). Replaces legacy `CapacityService` / `GET /product-requisitions/capacity`. |
| **PR read / TR read serializers** | **requisitions → STK-01** | `capacity_snapshot` on PR detail; `source_capacity_snapshot` / `destination_capacity_snapshot` on TR detail | Shared read helper delegating to `POIStock` + `storage_capacity_mt` (same schema as stock-snapshot) |

All calls to stock services from SC-01, TLS-01, and TR approval are made **within the originating transaction** — they benefit from atomicity when they succeed. If a stock service call raises an unexpected exception, it **must be caught at the call site and logged** (`STOCK_MUTATION_FAILED` event on `POIStockMovementLog`); the originating operational event must **not** be rolled back. No signal or webhook is used; direct service calls only.

---

## 10. Sub-tasks

| # | Sub-task | Description | Priority |
|---|---|---|---|
| STK-01-1 | `POIStock` model + migration | Create `POIStock` (one-to-one with POI), all four stock fields. Migration seeds a zero-value row for every existing POI. Tenant Admin can set `current_stock_mt` as opening balance via admin before go-live. `POIStockAdmin` — read-only summary inline under `POIAdmin`; opening balance editable only before first stock event. Changelist stock/capacity columns must remain when MDM-04-12 map picker is added. | High |
| STK-01-2 | `POIStockMovementLog` model + admin | Append-only model per §1.2. `POIStockMovementLogAdmin` — read-only, filterable by POI, event type, date range, TO/TR reference. Tenant Admin only. | High |
| STK-01-3 | TR approval reservation hook | `reserve_source_stock(tr_id)` and `release_source_reservation(tr_id)` services. Hook into `TRService.approve()` / `TRService.approve_with_modify()` (TR transitions `pending_approval` → `available_for_transport_planning`). Use `tr.total_quantity` as the reservation amount (denormalized header field — not `allocated_quantity_mt`, which does not exist on `TransportRequisition`). Called atomically within TR approval / rejection / cancellation transitions. Writes `TR_APPROVED_RESERVATION` / `TR_RESERVATION_RELEASED` log entries. | High |
| STK-01-4 | TO dispatch in-transit hook | `increment_in_transit_stock(to_id)` and `reverse_in_transit_stock(to_id)` services. Hook into `record_driver_transition()` at the `is_first_trip_start_transition()` branch (`READY_FOR_DISPATCH` → `driving_towards_source` / `driving_towards_destination`). Use `to.allocated_quantity` (no `_mt` suffix). `reverse_in_transit_stock()` must check for an existing `TO_DISPATCHED_IN_TRANSIT` log entry before decrementing — cancellations can arrive from pre-dispatch statuses where counters were never set. Writes `TO_DISPATCHED_IN_TRANSIT` / `TO_CANCELLED_IN_TRANSIT_REVERSED` log entries. | High |
| STK-01-5 | Scale-out stock mutation — SC-01 integration | `apply_stock_mutation_on_scale_out(scale_out_id)` — retrieves `flow_lane` via `scale_out.weighing_session.transport_order.flow_lane` and `yard_leg` via `scale_out.weighing_session.yard_leg`, then applies `STOCK_MUTATION_MAP` (§2). **`STOCK_MUTATION_MAP` keys must use `FlowLane` enum members, not string literals** — bare uppercase strings silently miss every lookup. Dispatches to source deduction (Trigger 3) or destination addition (Trigger 4). The call site inside `record_scale_out()` **must wrap the entire stock call in `try/except Exception`** — any failure logs a `STOCK_MUTATION_FAILED` event and continues; scale-out is never rolled back by a stock error. Skip silently if `weighing_session.transport_order` is None. Underflow: log `STOCK_UNDERFLOW_WARNING`, do not block. | High |
| STK-01-6 | Source availability check — CC integration | `check_source_stock_for_loading(to_id)` — evaluates `current_stock_mt + in_transit_outgoing_mt >= TO.allocated_quantity` (`TO.allocated_quantity`, no `_mt` suffix). **Never raises, never blocks bay assignment.** Returns a result object: `{sufficient: bool, available_mt, required_mt}`. Called from CC-01 `assign_bay()` before the write; on insufficient stock, logs `STOCK_UNDERFLOW_WARNING` and sets `stock_warning` in the response. Bay assignment proceeds in all cases. | High |
| STK-01-7 | Destination capacity check — TR approval integration | `check_destination_capacity(poi_id, quantity_mt)` — returns `CAPACITY_OK`, `CAPACITY_WARNING`, or `CAPACITY_OVER`. Skips entirely when `storage_capacity_mt` is null. **No outcome blocks the approval** — all three outcomes allow the TR approval to proceed immediately without mandatory remarks. The outcome and figures are audit-logged on every approval. Called from DM TR approval and Procurement destination breakdown plan submission. | High |
| STK-01-8 | Stock snapshot API | `GET /api/v1/operations/stock/pois/{poi_id}/stock-snapshot` per §7. RBAC per §6 / §6.1 using `depot_officer` / `feed_mill_officer` role codes. Null-safe capacity fields. Optional `incoming_weight_kg` query param. | High |
| STK-01-9 | Capacity threshold configuration | Add `capacity_threshold_pct` (IntegerField, null=True, 1–100) to `POI` via migration `apps/master_data/0017_add_poi_capacity_threshold.py`. Fallback when null is hardcoded to 80 (`poi.capacity_threshold_pct or 80`) — no tenant settings model required. POIAdmin exposes field in **Capacity** fieldset. Per-POI threshold changes are audit-logged. MDM-04-12 map picker must not alter this layout. | Medium |
| STK-01-10 | E2E test coverage | Full flow: TR approved → reservation created → TO dispatched → in-transit incremented → scale-out at source (FG outbound) → source stock reduced → truck at destination → scale-out at destination → destination stock incremented. RM inbound path: QC fail → no stock change → TO cancelled → in-transit reversed. Snapshot API at each step must reflect correct values. | Medium |
| STK-01-11 | **PR/TR form read-path migration** | Replace `CapacityService.get_poi_capacity()` with a shared `get_poi_stock_snapshot(poi_id, incoming_weight_kg=None)` backed by `POI.storage_capacity_mt` + `POIStock`. Wire PR destination POI picker (§6.1), `ProductRequisitionReadSerializer.capacity_snapshot`, TR capacity snapshots, and deprecate `GET /product-requisitions/capacity`. Fix stock-snapshot RBAC: `depot_officer` / `feed_mill_officer` / `commercial_officer`; add `PermissionCodes.OPERATIONS_STOCK_READ` to `constants_rbac` and role seed if permission-based checks are retained. | **High** |

---

## 11. Validation Rules

- Stock mutations execute within the originating transaction when they succeed. If a stock mutation raises, the exception is caught at the call site, logged as `STOCK_MUTATION_FAILED`, and the originating operation (scale-out, TR approval, TO dispatch) proceeds normally.
- `select_for_update()` on `POIStock` row for every mutation — prevents concurrent race conditions.
- Stock figures are never negative by design; underflow is logged as a warning but not blocked.
- `POIStockMovementLog` is append-only — no update or delete path exists in services or admin.
- Opening balance (`OPENING_BALANCE_SET`) is the only event type writable by a human actor; all others are `actor=null` (system).
- Destination capacity check skipped when `poi.storage_capacity_mt is null` — no warning, no block.
- Source availability check fires at CC bay assignment only; never blocks the assignment; does not fire at gate-in or scale-in.
- No stock check or stock mutation failure ever returns HTTP 4xx or 5xx to an operator performing a yard operation.

---

## 12. Definition of Done

- [ ] `POIStock` model created; migration seeds all existing POIs at zero; Tenant Admin can set opening balance (STK-01-1)
- [ ] `POIStockMovementLog` append-only model created; Tenant Admin admin view functional (STK-01-2)
- [ ] TR approval atomically calls `reserve_source_stock()`; TR rejection / cancellation calls `release_source_reservation()` (STK-01-3)
- [ ] TO dispatch atomically calls `increment_in_transit_stock()`; TO cancellation post-dispatch calls `reverse_in_transit_stock()` (STK-01-4)
- [ ] Scale-out confirmation calls `apply_stock_mutation_on_scale_out()` inside a try/except; stock failure logs `STOCK_MUTATION_FAILED` and does not roll back scale-out; null TO guard in place (STK-01-5)
- [ ] CC bay assignment always proceeds; `check_source_stock_for_loading()` returns warning flag when stock insufficient; `STOCK_UNDERFLOW_WARNING` logged; no 409 returned (STK-01-6)
- [ ] Destination capacity check returns correct outcome (`CAPACITY_OK` / `CAPACITY_WARNING` / `CAPACITY_OVER`); skips when `storage_capacity_mt` is null; no outcome blocks approval or requires mandatory remarks (STK-01-7)
- [ ] `GET /api/v1/operations/stock/pois/{poi_id}/stock-snapshot` returns correct schema with null-safe capacity fields; RBAC enforced for `depot_officer` / `feed_mill_officer` on PR create (STK-01-8, STK-01-11)
- [ ] `capacity_threshold_pct` configurable per POI; tenant default fallback applies (STK-01-9)
- [ ] E2E test covers full FG outbound round trip and RM inbound QC fail path (STK-01-10)
- [ ] UAT: Command Center Officer sees source stock before bay assignment; warning indicator shown on insufficient stock; bay assignment succeeds regardless
- [ ] UAT: Distribution Officer views destination capacity panel with threshold warning badge at ≥ 80% utilization
- [ ] UAT: QC fail on RM inbound — destination stock unchanged, in-transit cleared on TO cancellation, source stock unchanged
- [ ] UAT: Depot Officer selects destination POI on FG PR create — capacity panel shows `storage_capacity_mt`, `current_stock_mt`, `free_capacity_mt`, and projected utilization; panel updates when line-item weight changes (STK-01-11)
- [ ] `depot_officer` / `feed_mill_officer` receive 200 from stock-snapshot API; false 403 from `requester_*` slug mismatch eliminated (STK-01-11)

---

## 13. Known Implementation Gaps (v1.3 audit — 2026-06-09)

Audit of `apps/requisitions/` + `apps/operations/stock/` against this spec. **Not a runtime blocker for yard ops**; blocks PR capacity visibility for requesters.

| Gap | Current behaviour | Target (this spec) |
|---|---|---|
| **G-1 Legacy `CapacityService`** | `get_poi_capacity()` reads `getattr(poi, "capacity_kg", 0)` and `getattr(poi, "current_stock_kg", 0)` — fields that do not exist on `POI`. Always returns zero capacity/stock. | Read `poi.storage_capacity_mt` and `poi.stock` (`POIStock`). See STK-01-11. |
| **G-2 PR form not integrated** | Stock spec §9 (pre-v1.3) listed TR/CC/GPS integrations only. PR destination POI picker has no path to `POIStock`. | §9 row PR-01; §6.1. |
| **G-3 Stock-snapshot RBAC slugs** | `POIStockSnapshotView._ALLOWED_ROLES` uses `requester_depot` / `requester_feed_mill` / `requester_commercial`. Tenant roles are `depot_officer` / `feed_mill_officer` / `commercial_officer`. | §6 role-code table. |
| **G-4 Missing permission constant** | View references `PermissionCodes.OPERATIONS_STOCK_READ` which is not defined in `apps/core/constants_rbac.py`; permission check always fails through to broken role fallback. | Define permission + seed on requester roles, or rely on role-code check with correct slugs. |
| **G-5 Serializer coupling** | `ProductRequisitionReadSerializer.get_capacity_snapshot` and TR capacity serializer methods still call `CapacityService`. | Delegate to shared stock-snapshot read helper (STK-01-11). |
| **G-6 Zero opening balances** | Migration `0013_stk01_poi_stock` seeds all POIs at zero; figures stay at zero until opening balance or operational events. | Expected at go-live; Tenant Admin may set `current_stock_mt` before operations. UI should still show **configured** `storage_capacity_mt` once G-1 is fixed. |

**Symptom reported:** Depot officer sees nothing useful about stock when selecting destination POI on product requisition — caused by **G-1** (zeros from legacy service) and/or **G-2** + **G-3** (UI calling stock-snapshot and receiving 403).

---

*Module: 06-poi-operations | Spec: Stock Operations | Phase: 1 | Sprint: 5 | Story: STK-01 (DFS-071) | Last Updated: 2026-06-09 | Version: 1.3 (PR form read-path + implementation-gap audit)*
