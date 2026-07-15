---
module: 06-poi-operations
specification: Stock Operations (v3.0 — Loading/Unloading Triggered, UOM-Aware)
version: 3.0
phase: Phase 1
sprint: Sprint 6 (carry-over) / Sprint 7
last_updated: 2026-07-08
supersedes: stock-operations-sprint5.md v2.0 (scale-out abs-diff trigger)
changelog: |
  v3.0 — stock trigger moves from scale-out weighbridge net to loading/unloading line capture;
  quantity derived per TOLineItem UOM with Product master weight_per_unit conversion to MT;
  in-transit cleared by actual converted unload MT (not allocated_quantity);
  scale-out decoupled from stock (gate/yard flow only);
  single bay per visit — no multi-bay rollup
related_stories: DFS-071 (STK-01 v3), LD-01-9 (per-line capture prerequisite)
jira_epic: DFS-072
resolved_decisions:
  - "D-1: weight_per_unit source — always Product master (live), not frozen PR/TR line"
  - "D-2: in-transit clearing — actual converted unload MT from line captures"
  - "D-3: weighbridge — no stock integration in v3.0; scale-out is yard/gate flow only"
  - "D-4: single bay per visit — one LoadEvent / one UnloadEvent; no multi-bay rollup"
open_questions:
  - "OQ-1: Liters UOM — treat 1 Liter = 1 KG via weight_per_unit auto-fill on Product master (existing MDM rule)"
---

# Stock Operations Specification (v3.0 — Loading/Unloading Triggered)

## Overview

This specification **supersedes the v2.0 stock trigger** defined in `stock-operations-sprint5.md`. It keeps the same POI-level ledger (`current_stock_mt`, in-transit counters, opening balance, non-blocking policy) but changes **what quantity moves stock** and **when the movement happens**.

### v2.0 → v3.0 change in one sentence

> **Stock moves when loading/unloading is completed, using quantities operators enter per product line in each product's UOM — converted to MT via Product master `weight_per_unit` — not when the truck is weighed out.**

The weighbridge (scale-in / scale-out) remains mandatory for gate pass and yard flow but has **no role in stock calculation** in v3.0.

**Module path**: `apps/operations/stock/`  
**Dependencies**: `apps/master_data/` (POI, Product UOM + `weight_per_unit`), `apps/transport/` (TransportOrder, TOLineItem, `flow_lane`), `apps/operations/loading/` (LoadEvent, LoadEventLineItem, UnloadEvent, UnloadEventLineItem)  
**Enables**: POI stock display on PR/TR forms, source availability guard at CC bay assignment, GPS-01 map dashboard stock panel

### Relationship to v2.0 spec

| Area | v2.0 (current code) | v3.0 (this spec) |
|---|---|---|
| Stock trigger | `ScaleOutService.record_scale_out()` | `LDService.complete_loading()` / `LDService.complete_unloading()` |
| Quantity source | `abs(scale_in_weight_mt − scale_out_weight_mt)` | Per-line UOM capture → convert to MT |
| `weight_per_unit` source | N/A | **Product master (live)** |
| In-transit on dispatch | `to.allocated_quantity` | Unchanged — still `to.allocated_quantity` |
| In-transit on delivery | Cleared by `to.allocated_quantity` at scale-out | Cleared by **actual converted unload MT** + variance reconciliation |
| Weighbridge vs stock | Same number | **No integration** — scale-out is yard/gate only |
| Multi-bay rollup | N/A to stock | **Out of scope** — single bay per visit |

---

## 0. Core Design Principles

> **Stock always moves at loading/unloading completion. The amount is the sum of per-line quantities converted to MT.**

- Operators enter quantity in **each product's UOM** (bags, pieces, cartons, tons, kg, liters) — not a single "total truck weight" field.
- Conversion uses **Product master `weight_per_unit` (KG)** at mutation time.
- POI `current_stock_mt` remains a **single aggregate counter** per POI (not per-SKU stock).

> **Stock bookkeeping never blocks yard operations.**

All stock mutation exceptions inside loading/unloading completion hooks are **caught, logged, and swallowed** — they must never propagate and roll back the originating operational event.

> **Scale-out has no stock hook.**

`ScaleOutService.record_scale_out()` does not call any stock service in v3.0. Weighbridge remains part of yard/gate flow only.

---

## 1. UOM Capture → MT Conversion Rules

Conversion logic lives in `apps/operations/stock/conversion.py` (new). Called when rolling up line captures for stock mutation.

### 1.1 Resolve product context per `TOLineItem`

| TO line source | Product | UOM | `weight_per_unit` |
|---|---|---|---|
| Planner TO (`tr_line_item` set) | `tr_line_item.pr_line_item` product via MDM lookup | From linked `Product` | **Product master (live)** |
| Gate on-demand TO (`product` FK) | `TOLineItem.product` | `product.unit_of_measure` | **Product master (live)** |

PR/TR line `weight_per_unit` is **not** used for stock conversion in v3.0.

### 1.2 Operator input vs conversion (per line)

Aligned with existing LD-01-9 validation in `line_item_helpers.validate_line_capture_row()`:

| Product UOM | Operator enters | Stock MT for that line |
|---|---|---|
| **Bag**, **Pieces**, **Cartons** | Unit count (`bags_loaded` / `bags_received`) | `units × product.weight_per_unit_kg ÷ 1000` |
| **Ton** | Weight MT (`weight_loaded_mt` / `weight_received_mt`) | Entered MT directly |
| **KG** | Weight MT (`weight_*_mt` field — operator enters MT on form) | Entered MT directly |
| **Liters** | Volume as MT capture OR liters count — **use same weight field** | Entered MT directly (MDM auto-fills `weight_per_unit = 1` KG per liter on Product) |

`weight_per_unit` is **required** on Product master for Bag / Pieces / Cartons (existing MDM validation). Conversion raises a catchable error → `STOCK_MUTATION_FAILED` if missing.

### 1.3 Visit rollup (single bay)

```
operational_mt = SUM(line_stock_mt for each TOLineItem on the TO)
```

- **Source (FG outbound):** rollup from `LoadEventLineItem` rows on the completed `LoadEvent`.
- **Destination:** rollup from `UnloadEventLineItem` rows on the completed `UnloadEvent`.

No multi-bay aggregation — one event per visit per leg.

### 1.4 Stored audit fields (new on line capture models)

Add nullable `stock_mt` on `LoadEventLineItem` and `UnloadEventLineItem`:

- Set at persistence time in `_persist_load_line_items()` / `_persist_unload_line_items()` using conversion helper.
- Immutable after save — provides audit trail of what stock math used even if Product master `weight_per_unit` changes later.

Event-level `weight_loaded_mt` / `weight_unloaded_mt` rollup should equal `SUM(line.stock_mt)` after migration.

---

## 2. Stock Movement Decision Matrix

When `LDService.complete_loading()` or `LDService.complete_unloading()` succeeds, stock service receives `(flow_lane, yard_leg, event)` and applies:

| flow_lane | yard_leg | Event | POI effect |
|---|---|---|---|
| `FG_OUTBOUND` | `source` | `LoadEvent` complete | `origin_poi.current_stock_mt` ↓ by `operational_mt` |
| `FG_OUTBOUND` | `destination` | `UnloadEvent` complete | `destination_poi.current_stock_mt` ↑; in-transit cleared (§4) |
| `FG_INBOUND` | `destination` | `UnloadEvent` complete | `destination_poi.current_stock_mt` ↑; in-transit cleared |
| `RM_INBOUND` | `destination` | `UnloadEvent` complete (QC passed) | `destination_poi.current_stock_mt` ↑; in-transit cleared |

`yard_leg` resolved from `event.bay_assignment.queue_entry` (existing `yard_leg_for_queue_entry()`).

**RM inbound guard:** destination stock mutation must not run unless `to.qc_passed is True` (mirror `ScaleOutService._require_qc_decided()`). If unloading completes before QC pass, stock hook is a no-op.

**Underflow guard (source deduction only):** If `current_stock_mt − operational_mt < 0`, deduction proceeds, `STOCK_UNDERFLOW_WARNING` logged — same non-blocking policy as v2.0.

---

## 3. Stock Movement Triggers

### Trigger 1 — TO Dispatched (unchanged)

**When:** TO transitions to `driving_towards_source` / `driving_towards_destination`.  
**What:** `increment_in_transit_stock(to)` — both counters ↑ by `to.allocated_quantity`.  
**Reversal:** `reverse_in_transit_stock(to)` on post-dispatch cancellation (null-guard unchanged).

### Trigger 2 — Loading Complete (replaces scale-out source deduction)

**When:** `LDService.complete_loading()` for `flow_lane=FG_OUTBOUND`, `yard_leg=source`.  
**What:** `apply_stock_mutation_on_loading_complete(load_event)`:

1. Compute `operational_mt` from line items (§1).
2. `origin_poi.current_stock_mt` ↓ by `operational_mt`.
3. Log: `LOADING_SOURCE_DEDUCTION`.
4. Underflow warning if applicable.
5. **Idempotency:** skip if `POIStockMovementLog` already has `LOADING_SOURCE_DEDUCTION` for this `load_event_id`.

In-transit counters **unchanged** at source loading — truck still en route.

### Trigger 3 — Unloading Complete (replaces scale-out destination addition)

**When:** `LDService.complete_unloading()` for `yard_leg=destination` (all lanes).  
**What:** `apply_stock_mutation_on_unloading_complete(unload_event)`:

1. RM inbound: return early if QC not passed.
2. Compute `operational_mt` from line items (§1).
3. `destination_poi.current_stock_mt` ↑ by `operational_mt`.
4. Clear in-transit (§4) using `operational_mt`.
5. Log: `UNLOADING_DESTINATION_ADDITION` + `IN_TRANSIT_CLEARED_ON_DELIVERY`.
6. **Idempotency:** skip if log exists for this `unload_event_id`.

### Removed from scale-out

`apply_stock_mutation_on_scale_out()` **removed entirely** — no stock service call from `ScaleOutService.record_scale_out()`.  
`SCALE_OUT_SOURCE_DEDUCTION` / `SCALE_OUT_DESTINATION_ADDITION` event types retained in enum for historical logs only — no new writes.

### QC Fail — No Stock Change (unchanged policy)

QC fail blocks scale-out today; with v3.0, unloading completion with QC fail should not fire Trigger 3. In-transit remains until TO cancellation → `reverse_in_transit_stock(to)`.

---

## 4. In-Transit Clearing (v3.0 behaviour)

On **destination unloading complete** (Trigger 3):

```
actual_mt = operational_mt   # converted unload line total
```

| Counter | Adjustment |
|---|---|
| `destination_poi.in_transit_incoming_mt` | ↓ by `actual_mt` (floor at 0) |
| `origin_poi.in_transit_outgoing_mt` | ↓ by `actual_mt` (floor at 0) |

### Variance reconciliation (planned vs actual)

Dispatch incremented both counters by `to.allocated_quantity` (planned). Delivery clears by `actual_mt` (operational). When they differ:

```
residual_mt = allocated_quantity − actual_mt
```

If `residual_mt ≠ 0`:

1. Adjust both in-transit counters by an additional `residual_mt` (bringing the TO's in-transit footprint to zero).
2. Log `IN_TRANSIT_QUANTITY_VARIANCE` on both POIs with `planned_mt`, `actual_mt`, `residual_mt` in notes.

This ensures a completed delivery fully clears the TO from in-transit counters even when unload weight differs from planned allocation.

---

## 5. Validation Guards

### 5.1 Source Availability Guard (unchanged timing, unchanged formula)

**Where:** CC-01 bay assignment.  
**Check:** `current_stock_mt + in_transit_outgoing_mt >= to.allocated_quantity`  
**Policy:** Warning only — never blocks (v1.2 no-blocker policy retained).

> **Note:** Stock now drops at loading complete (after bay assignment). The guard still fires *before* loading — appropriate for early visibility.

### 5.2 Destination Capacity Guard

Removed in v2.0 — remains removed.

---

## 6. Data Model Changes

### 6.1 `POIStockMovementLog` — new event types

| event_type | When written |
|---|---|
| `LOADING_SOURCE_DEDUCTION` | Loading complete at source — reduces `current_stock_mt` |
| `UNLOADING_DESTINATION_ADDITION` | Unloading complete at destination — adds to `current_stock_mt` |
| `IN_TRANSIT_QUANTITY_VARIANCE` | Unload — planned `allocated_quantity` ≠ actual unload MT |

Retained (unchanged): `TO_DISPATCHED_IN_TRANSIT`, `TO_CANCELLED_IN_TRANSIT_REVERSED`, `IN_TRANSIT_CLEARED_ON_DELIVERY`, `STOCK_UNDERFLOW_WARNING`, `STOCK_MUTATION_FAILED`, `OPENING_BALANCE_SET`.

Deprecated (no new writes): `SCALE_OUT_SOURCE_DEDUCTION`, `SCALE_OUT_DESTINATION_ADDITION`.

### 6.2 `POIStockMovementLog` — optional FKs for idempotency

```python
load_event   = FK → LoadEvent (null=True)
unload_event = FK → UnloadEvent (null=True)
```

Unique partial indexes (or idempotency check in service):

- `(load_event_id)` where `event_type = LOADING_SOURCE_DEDUCTION`
- `(unload_event_id)` where `event_type = UNLOADING_DESTINATION_ADDITION`

### 6.3 `LoadEventLineItem` / `UnloadEventLineItem`

```python
stock_mt = DecimalField(max_digits=12, decimal_places=3, null=True)
# populated at capture time; audit snapshot of conversion result
```

### 6.4 `POIStock` — no structural change

`current_stock_mt`, `in_transit_outgoing_mt`, `in_transit_incoming_mt` unchanged.

---

## 7. Integration Points

| Story / Module | Direction | Integration point | Stock service call |
|---|---|---|---|
| LD-01 (loading complete) | LD-01 → STK-01 v3 | `LDService.complete_loading()` | `apply_stock_mutation_on_loading_complete(load_event)` |
| LD-01 (unloading complete) | LD-01 → STK-01 v3 | `LDService.complete_unloading()` | `apply_stock_mutation_on_unloading_complete(unload_event)` |
| SC-01 (scale-out) | — | `ScaleOutService.record_scale_out()` | **No stock call** |
| TLS-01 (TO dispatch) | TLS-01 → STK-01 | Driver trip start | `increment_in_transit_stock(to)` — unchanged |
| TLS-01 (TO cancellation) | TLS-01 → STK-01 | Post-dispatch cancel | `reverse_in_transit_stock(to)` — unchanged |
| CC-01 (bay assignment) | CC-01 → STK-01 | Before bay assign | `check_source_stock_for_loading(to)` — unchanged |
| GPS-01 / PR-01 | reads STK-01 | Stock snapshot API | unchanged |

**Exception handling:** LD-01 wraps stock calls in try/except → `STOCK_MUTATION_FAILED`; loading/unloading completion never rolls back.

---

## 8. Full Stock Lifecycle (v3.0)

```
POI created
  └─► opening balance on POI add form
        Log: OPENING_BALANCE_SET

TO dispatched
  └─► in_transit counters ↑ by allocated_quantity (planned)
        Log: TO_DISPATCHED_IN_TRANSIT

Truck at source — CC bay assignment (FG outbound)
  └─► check_source_stock_for_loading(to) — warning only

Scale-in at source → loading at bay
  └─► operator enters per-line quantities in product UOM
  └─► complete_loading
        operational_mt = Σ(line conversions using Product master weight_per_unit)
        source current_stock_mt ↓ by operational_mt
        Log: LOADING_SOURCE_DEDUCTION
        (in-transit unchanged)

Truck travels to destination

Gate-in → scale-in → unloading at bay
  └─► operator enters per-line received quantities
  └─► [RM inbound: QC pass required before stock fires]
  └─► complete_unloading
        operational_mt = Σ(line conversions)
        destination current_stock_mt ↑ by operational_mt
        in-transit cleared by actual_mt + variance reconciliation
        Log: UNLOADING_DESTINATION_ADDITION, IN_TRANSIT_CLEARED_ON_DELIVERY
        [if planned ≠ actual: IN_TRANSIT_QUANTITY_VARIANCE]

Scale-out at source or destination
  └─► yard/gate flow only — no stock mutation

Gate-out → TO closure
```

---

## 9. Implementation Plan

### Phase A — Conversion foundation (no trigger switch yet)

| # | Sub-task | Description | Priority |
|---|---|---|---|
| STK-03-1 | `stock/conversion.py` | `line_capture_to_stock_mt(to_line_item, *, bags, weight_mt) → Decimal`; UOM branching; Product master `weight_per_unit` lookup; unit tests per UOM | High |
| STK-03-2 | Line item `stock_mt` field | Migration adding `stock_mt` to `LoadEventLineItem` / `UnloadEventLineItem`; populate in `_persist_*_line_items()` | High |
| STK-03-3 | Rollup alignment | Ensure event `weight_*_mt` = `SUM(line.stock_mt)`; admin display of per-line `stock_mt` | Medium |

**Verify:** Unit tests pass; existing LD-01 flows unaffected (no stock hook yet).

### Phase B — Stock service refactor

| # | Sub-task | Description | Priority |
|---|---|---|---|
| STK-03-4 | Movement log migration | Add `LOADING_SOURCE_DEDUCTION`, `UNLOADING_DESTINATION_ADDITION`, `IN_TRANSIT_QUANTITY_VARIANCE`; add `load_event` / `unload_event` FKs | High |
| STK-03-5 | `apply_stock_mutation_on_loading_complete()` | Source deduction + idempotency + underflow warning | High |
| STK-03-6 | `apply_stock_mutation_on_unloading_complete()` | Destination addition + in-transit clear by actual_mt + variance reconciliation + QC guard + idempotency | High |
| STK-03-7 | Remove scale-out stock mutation | Delete `apply_stock_mutation_on_scale_out()` call from `ScaleOutService.record_scale_out()`; remove or deprecate `_apply_source_deduction` / `_apply_destination_addition` | High |
| STK-03-8 | Admin movement log badges | Icons/labels for new event types in `POIStockMovementLogAdmin` | Low |

**Verify:** Unit tests for each trigger, idempotency, QC guard, in-transit variance.

### Phase C — Wire LD-01 hooks

| # | Sub-task | Description | Priority |
|---|---|---|---|
| STK-03-9 | Hook `complete_loading()` | Call stock mutation inside same `atomic()`; try/except → `STOCK_MUTATION_FAILED` | High |
| STK-03-10 | Hook `complete_unloading()` | Same pattern; after line items persisted | High |

**Verify:** Integration test — FG outbound round trip with bag + ton mixed lines.

### Phase D — Tests & UAT

| # | Sub-task | Description | Priority |
|---|---|---|---|
| STK-03-11 | Unit: conversion matrix | Bag/Pieces/Cartons/Ton/KG/Liters; missing `weight_per_unit` error path | High |
| STK-03-12 | Unit: in-transit variance | `allocated_quantity=20`, unload `18` → counters zeroed + variance log | High |
| STK-03-13 | E2E: FG outbound | Opening balance → dispatch → load (bags) → stock down → unload → stock up | Medium |
| STK-03-14 | E2E: RM inbound QC fail | Unload blocked for stock; cancel TO → in-transit reversed | Medium |
| STK-03-15 | Update `stock-operations-sprint5.md` | Add deprecation banner pointing to this doc | Low |

---

## 10. Migration & Rollout Notes

### 10.1 No historical stock recalculation

POI `current_stock_mt` reflects v2.0 scale-out history. v3.0 applies forward from deploy. If cutover mid-operation:

- TOs with scale-out stock already applied under v2.0 must not double-count when loading/unloading hooks fire.
- **Cutover rule:** stock hooks check for legacy `SCALE_OUT_*` log entries on the same `transport_order` + `yard_leg` — if present, skip v3.0 mutation and log `notes="skipped — legacy scale-out stock already applied"`.

### 10.2 Deploy order

1. Phase A + B (conversion + new services, scale-out mutation still active) — **do not deploy** with both triggers live.
2. Single deploy: Phase B-7 (remove scale-out mutation) + Phase C (add LD hooks) in same release.
3. Phase D tests in CI before release.

### 10.3 Product master dependency

Because `weight_per_unit` is read **live** from Product master:

- MDM changes affect future loads/unloads immediately.
- Ops must be warned: editing `weight_per_unit` does not restate historical `stock_mt` on past events.
- Consider MDM change audit notification (out of scope unless requested).

---

## 11. Definition of Done

- [ ] `stock/conversion.py` converts all UOM types to MT using Product master `weight_per_unit` (STK-03-1)
- [ ] `LoadEventLineItem.stock_mt` / `UnloadEventLineItem.stock_mt` populated on capture (STK-03-2)
- [ ] `LOADING_SOURCE_DEDUCTION` fires on `complete_loading()` for FG outbound source (STK-03-5, STK-03-9)
- [ ] `UNLOADING_DESTINATION_ADDITION` fires on `complete_unloading()` for destination legs (STK-03-6, STK-03-10)
- [ ] RM inbound stock blocked until QC pass (STK-03-6)
- [ ] In-transit cleared by actual unload MT + `IN_TRANSIT_QUANTITY_VARIANCE` when planned ≠ actual (STK-03-6)
- [ ] Scale-out has no stock service call; `current_stock_mt` unchanged at scale-out (STK-03-7)
- [ ] Idempotency — re-completing same event does not double-mutate (STK-03-5, STK-03-6)
- [ ] Legacy cutover guard — v2.0 scale-out stock not duplicated (§10.1)
- [ ] Stock failures never block loading/unloading/scale-out (non-blocking policy)
- [ ] UAT: bag product — operator enters bag count only; stock moves correct MT
- [ ] UAT: ton product — operator enters MT; stock matches

---

## 12. Validation Rules

- All mutating stock operations use `select_for_update()` on `POIStock` inside `atomic()`.
- `current_stock_mt` may go negative — logged, never blocked.
- `POIStockMovementLog` append-only.
- Stock service never returns HTTP 4xx/5xx to yard operators.
- Single bay per visit — stock hooks assume exactly one completed LoadEvent (source) or UnloadEvent (destination) per TO leg.

---

*Module: 06-poi-operations | Spec: Stock Operations v3.0 | Phase: 1 | Story: STK-01 v3 (DFS-071) | Last Updated: 2026-07-08*
