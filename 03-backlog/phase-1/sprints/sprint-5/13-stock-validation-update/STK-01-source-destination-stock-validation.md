---
jira_key: DFS-071
jira_type: Story
jira_sprint: "Sprint 5"
story_id: STK-01
title: Source & Destination Stock Validation — Event-Driven Stock Updates, Capacity Guards & Role Visibility
epic: Stock & Capacity Management
status: New — Sprint 5 Scope
story_points: 13
assignee: ~
prd_refs:
  - "§6.7.3.3 Source Stock Validation & Update"
  - "§6.7.3.4 Destination Stock Validation & Update"
  - "§6.5.1 POI Setup — total_capacity_mt, geofence & stock fields"
  - "§6.7.3.1.1 TR Creation Process by Distribution Officer (DO)"
  - "§6.7.3.1.2 TR Approval Process by Distribution Manager (DM)"
  - "§6.7.3.2 Procurement Approval Process"
phase: Phase 1
---

# STK-01 — Source & Destination Stock Validation & Update

## Context

This story delivers **event-driven stock accounting at the POI level** — the mechanism by which the platform knows how much stock is available at a source depot/mill, how much capacity remains at a destination, and how those figures change as transport orders execute.

The stock model is the connective tissue between four already-in-flight Sprint 5 stories:

- **SC-01** (Scale-out) → deducts source stock on confirmed truck departure
- **QC-01** (QC pass/fail) → credits destination stock on QC pass; leaves it unchanged on QC fail
- **GT-01** (Gate-out) → closes the loop on in-transit stock
- **POD-01** (TO Closure) → final reconciliation checkpoint

Without this story, the capacity snapshots shown during PR/TR creation and the pre-execution availability guard are not backed by real-time data, making cross-team coordination (Requester → Distribution → Procurement → Command Center) unreliable.

---

## Business Value

Planners and requesters are currently unable to verify whether a source POI has sufficient stock before raising a requisition, or whether a destination POI has headroom before approving a transfer. This story closes that gap:

- **Requesters** can raise realistic PRs with live stock context.
- **Distribution and Procurement** can approve TRs with a capacity confidence signal.
- **Command Center Officers** can see reserved stock before initiating loading sequences.
- **All stakeholders** benefit from a consistent, role-appropriate view of stock state that self-updates as trucks are weighed out and QC outcomes are recorded.

---

## User Stories

> **As a Requester (Depot / Feed Mill / Commercial), Distribution Officer, Distribution Manager, Procurement Officer, or Command Center Officer**, I want visibility into current stock and reserved stock at source POIs so that the requisitions I raise and approve are grounded in actual inventory.

> **As a Distribution Officer or Distribution Manager**, I want to see total capacity, current stock, free capacity, and projected utilization at destination POIs — with configurable threshold warnings — so that I do not approve transfers that would overflow the destination.

> **As a system**, I want to automatically reduce source stock when scale-out is confirmed and add destination stock only after a QC pass, so that stock figures are always driven by verified operational events, not optimistic assumptions.

---

## Acceptance Criteria

### AC-1 — Source Stock Display (Before Loading)

When any authorised user views a source POI detail or the PR/TR creation form:

- **Current Stock** (metric tons) is displayed — stock on hand today, confirmed by past QC pass or initial seed.
- **Reserved Stock** is displayed — quantity committed against approved TRs/TOs not yet scale-out complete.
- **In-Transit Stock** is displayed — quantity currently loaded on trucks en route (post scale-out, pre QC pass at destination).
- **Free Capacity** = `Total Capacity − Current Stock − Reserved Stock` (available for new reservations).
- All four figures update in near real-time as operational events occur.
- Figures are **read-only** for all roles — no manual stock entry from this surface.

### AC-2 — Source Stock Deduction Event (Scale-out Trigger)

- When SC-01 records a confirmed scale-out (truck departs with confirmed weighed quantity):
  - `current_stock_mt` at the **source POI** is reduced by the loaded quantity (`net_weight_mt`).
  - `reserved_stock_mt` at the source POI is reduced by the same TO's reservation.
  - A `POIStockMovementLog` entry is written: `event_type = SCALE_OUT_DEDUCTION`, source TO reference, quantity, actor = system, timestamp.
- The updated stock snapshot is immediately visible to all authorised roles.
- If current stock at scale-out time is less than the loaded weight (data inconsistency), the system logs a `STOCK_UNDERFLOW_WARNING` event and allows the operation to proceed (blocking scale-out on stock inconsistency is out of scope).

### AC-3 — Stock Reservation (TR Approval)

- When a Transport Requisition (TR) is approved by the Distribution Manager or Procurement Officer:
  - `reserved_stock_mt` at the **source POI** is incremented by the TR's allocated quantity.
  - A `POIStockMovementLog` entry is written: `event_type = TR_APPROVED_RESERVATION`.
- When a TR is rejected, modified downward, or cancelled, the corresponding reservation is reversed.
- When a TO linked to a TR is cancelled or the TR is closed without execution, the reservation is released back.

### AC-4 — Source Availability Guard (Pre-Execution Validation)

- Before the Command Center Officer can initiate a loading bay assignment (CC-01) for a TO:
  - System validates: `current_stock_mt + in_transit_stock_mt >= TO.allocated_quantity_mt`.
  - If validation fails → HTTP 409 with error message: `"Insufficient source stock at {POI name}. Available: {X} MT, Required: {Y} MT"`.
  - A failed validation is logged to audit but does **not** block the scale-in queue (gate-in and scaling are upstream and unaffected).
- This guard is a **warning gate** only during CC assignment; the system does not block scale-in or gate-in on stock grounds.

### AC-5 — Destination Capacity Display

When any authorised user views a destination POI detail or the TR/TO approval form:

| Field | Definition |
|-------|-----------|
| Total Capacity | `poi.total_capacity_mt` from POI master data |
| Current Stock | `poi_stock.current_stock_mt` |
| Free Capacity | `Total Capacity − Current Stock − Reserved Stock` |
| In-Transit (Incoming) | Quantity on approved TOs en route to this destination (post scale-out, pre QC pass) |
| Projected Utilization (%) | `(Current Stock + In-Transit) / Total Capacity × 100` |

- A **threshold warning badge** is displayed when `Projected Utilization ≥ capacity_threshold_pct` (configurable per POI, default 80%). Badge escalates visually at 90%.
- Figures are read-only for all roles from this surface.

### AC-6 — Destination Capacity Guard (Pre-Approval Validation)

- When a Distribution Manager approves a TR, system validates:
  - `destination_poi.free_capacity_mt >= TR.allocated_quantity_mt`.
  - If `free_capacity_mt < TR.allocated_quantity_mt` → system raises a **blocking warning** requiring DM to confirm override with mandatory remarks before approval proceeds.
  - Override is allowed (not hard-blocked) — the DM can proceed with remarks if they have operational justification.
- When a Procurement Officer submits a destination breakdown plan, the same capacity check applies per destination POI in the plan.

### AC-7 — Destination Stock Addition Event (QC Pass / QC Fail)

- **QC Pass** (QC-01):
  - `current_stock_mt` at the **destination POI** is incremented by the QC-confirmed received quantity.
  - `in_transit_stock_mt` at the destination POI is decremented by the same TO's in-transit quantity.
  - `POIStockMovementLog` entry: `event_type = QC_PASS_ADDITION`.
- **QC Fail** (QC-01):
  - No change to `current_stock_mt` at destination.
  - `in_transit_stock_mt` cleared for this TO (stock is rejected and returned/discarded per operational policy).
  - `POIStockMovementLog` entry: `event_type = QC_FAIL_REJECTION`.
- Both events are atomic with the QC-01 decision write.

### AC-8 — Capacity Snapshot API

- `GET /api/v1/pois/{poi_id}/stock-snapshot` returns the real-time stock snapshot for a single POI.
- Authorised roles for source POI snapshot: `tenant_admin`, `requester_depot`, `requester_feedmill`, `requester_commercial`, `distribution_officer`, `distribution_manager`, `procurement_officer`, `command_center_officer`.
- Authorised roles for destination POI snapshot: `tenant_admin`, `distribution_officer`, `distribution_manager`, `procurement_officer`.
- Unauthorised roles receive HTTP 403.
- Response includes: `current_stock_mt`, `reserved_stock_mt`, `in_transit_stock_mt`, `total_capacity_mt`, `free_capacity_mt`, `projected_utilization_pct`, `threshold_warning` (boolean), `threshold_pct`, `last_updated`.

### AC-9 — Stock Movement Audit Trail

- Every stock mutation writes a `POIStockMovementLog` record containing:
  - `poi_id`, `event_type`, `transport_order_id` (nullable), `transport_requisition_id` (nullable), `quantity_mt`, `previous_stock_mt`, `new_stock_mt`, `actor` (`system` for automated events), `timestamp`.
- Log is **append-only** — no record is ever modified after write.
- Tenant Admin can view the full stock movement log per POI in admin (`POIStockMovementLogAdmin`, read-only).

### AC-10 — Capacity Threshold Configuration

- Tenant Admin can set `capacity_threshold_pct` per POI in the POI admin panel (integer 1–100, default 80).
- Tenant-level default `default_capacity_threshold_pct` configurable in tenant settings; POI value overrides tenant default when set.
- Threshold change is audit-logged.

---

## Sub-tasks

| # | Sub-task | Description | Priority |
|---|----------|-------------|----------|
| STK-01-1 | `POIStock` model + POI fields | New `POIStock` model (one-to-one with `POI`): `current_stock_mt`, `reserved_stock_mt`, `in_transit_incoming_mt` (destination), `in_transit_outgoing_mt` (source). Computed properties: `free_capacity_mt`, `projected_utilization_pct`. `POIStockAdmin` — read-only summary inline under `POIAdmin`. Seed initial stock to 0 for all existing POIs via migration. **Note:** MDM-04-12 map picker must not remove changelist stock columns or stock inline. | High |
| STK-01-2 | Stock reservation on TR approval | Service hook called from TR approval (Distribution Manager / Procurement Officer approval path): `reserve_source_stock(tr_id)` — increments `reserved_stock_mt` on source POI. `release_source_reservation(tr_id)` on TR rejection / cancellation. Atomic with TR status transition. | High |
| STK-01-3 | Source stock deduction — SC-01 integration | `apply_scale_out_stock_deduction(scale_out_id)` service — called atomically within SC-01 scale-out confirmation. Reduces `current_stock_mt` and `reserved_stock_mt` at source POI by `net_weight_mt`. Writes `POIStockMovementLog(SCALE_OUT_DEDUCTION)`. Underflow check: logs `STOCK_UNDERFLOW_WARNING` if deduction would push stock negative but does not block. | High |
| STK-01-4 | Destination stock update — QC-01 integration | `apply_qc_stock_decision(qc_result_id)` service — called atomically within QC-01 decision write. On QC pass: increment destination `current_stock_mt`, decrement `in_transit_incoming_mt`. On QC fail: decrement `in_transit_incoming_mt` only (no addition). Writes `POIStockMovementLog(QC_PASS_ADDITION / QC_FAIL_REJECTION)`. | High |
| STK-01-5 | Source availability guard — CC assignment | `validate_source_stock_for_loading(to_id)` — validates `current_stock_mt + in_transit_outgoing_mt >= TO.allocated_quantity_mt` before CC bay assignment. Returns 409 with structured error on failure. Unit tests: sufficient stock passes, insufficient stock returns 409. | High |
| STK-01-6 | Destination capacity guard — TR/TO approval | `validate_destination_capacity(poi_id, quantity_mt)` — called from Distribution Manager TR approval and Procurement destination breakdown plan submission. Returns `CAPACITY_OK`, `CAPACITY_WARNING` (≥ threshold%), or `CAPACITY_OVERRIDE_REQUIRED` (free capacity < requested quantity). Raises structured warning response; DM must confirm with remarks to override. Unit tests cover each outcome branch. | High |
| STK-01-7 | Stock snapshot API | `GET /api/v1/pois/{poi_id}/stock-snapshot` — returns full stock state per AC-8 schema. RBAC: source roles (requester, dist, procurement, CC) and destination roles (dist, procurement) enforced separately based on POI's `operational_role` (inbound / outbound / neutral). 403 for unauthorised roles. | High |
| STK-01-8 | `POIStockMovementLog` model + admin | Append-only model with fields per AC-9. `POIStockMovementLogAdmin` — read-only, filterable by POI, event type, date range, TO/TR reference. `tenant_admin` only. | Medium |
| STK-01-9 | Capacity threshold configuration | Extend `POI` model with `capacity_threshold_pct` (IntegerField, null=True, 1–100). Tenant settings model: `default_capacity_threshold_pct` (default 80). `POIAdmin` exposes field in **Capacity** fieldset. Threshold change writes audit entry. Map picker (MDM-04-12) is additive only — do not replace this fieldset. | Medium |
| STK-01-10 | In-transit tracking on TO dispatch | `increment_in_transit_stock(to_id)` called when TO transitions to `in_transit_source` (truck departs source gate). Increments source `in_transit_outgoing_mt` and destination `in_transit_incoming_mt`. Reversed if TO is cancelled post-dispatch. Atomic with TLS-01 status transition. | Medium |
| STK-01-11 | E2E test coverage | Full flow: TR approved → reservation created → TO dispatched → in-transit incremented → scale-out → source stock reduced → truck arrives at destination → QC pass → destination stock incremented. Validate snapshot API at each stage reflects correct values. Role access: CC officer sees source snapshot; Distribution Officer sees destination capacity warning at 80%. | Medium |

---

## Data Models

### `POIStock` (one-to-one with `POI`)
```
poi                     OneToOneField(POI, related_name='stock')
current_stock_mt        DecimalField(max_digits=12, decimal_places=3, default=0)
reserved_stock_mt       DecimalField(max_digits=12, decimal_places=3, default=0)
in_transit_outgoing_mt  DecimalField(max_digits=12, decimal_places=3, default=0)  # en route from this POI
in_transit_incoming_mt  DecimalField(max_digits=12, decimal_places=3, default=0)  # en route to this POI
last_updated            DateTimeField(auto_now=True)

@property
def free_capacity_mt(self):
    return self.poi.total_capacity_mt - self.current_stock_mt - self.reserved_stock_mt

@property
def projected_utilization_pct(self):
    if not self.poi.total_capacity_mt:
        return None
    return ((self.current_stock_mt + self.in_transit_incoming_mt) / self.poi.total_capacity_mt) * 100
```

All mutating operations use `select_for_update()` inside `atomic()` to prevent race conditions.

### `POIStockMovementLog` (append-only)
```
poi                     FK → POI
event_type              CharField(choices=[
                            TR_APPROVED_RESERVATION,
                            TR_RESERVATION_RELEASED,
                            SCALE_OUT_DEDUCTION,
                            QC_PASS_ADDITION,
                            QC_FAIL_REJECTION,
                            IN_TRANSIT_DISPATCHED,
                            IN_TRANSIT_REVERSED,
                            STOCK_UNDERFLOW_WARNING,
                            MANUAL_CORRECTION        # Tenant Admin only, future
                        ])
transport_order         FK → TransportOrder (null=True)
transport_requisition   FK → TransportRequisition (null=True)
quantity_mt             DecimalField
previous_stock_mt       DecimalField       # snapshot of current_stock_mt before change
new_stock_mt            DecimalField       # snapshot after change
field_affected          CharField          # current_stock_mt | reserved_stock_mt | in_transit_*
actor                   FK → User (null=True)  # null for system-generated events
notes                   TextField(blank=True)
timestamp               DateTimeField(auto_now_add=True)

Index: (poi_id, timestamp DESC)
Index: (transport_order_id, event_type)
```

---

## Stock Lifecycle State Machine

```
                         TR Approved
                              │ reserve_source_stock()
                              ▼
                      reserved_stock_mt ↑

                         TO Dispatched
                              │ increment_in_transit_stock()
                              ▼
          source in_transit_outgoing_mt ↑
          destination in_transit_incoming_mt ↑

                         Scale-Out Confirmed (SC-01)
                              │ apply_scale_out_stock_deduction()
                              ▼
          source current_stock_mt ↓
          source reserved_stock_mt ↓
          (in_transit already counted above)

                         QC Decision (QC-01)
                              │
               ┌──────────────┴──────────────┐
            QC PASS                        QC FAIL
               │                              │
   destination current_stock_mt ↑     destination current_stock_mt (no change)
   in_transit_incoming_mt ↓           in_transit_incoming_mt ↓
   in_transit_outgoing_mt ↓ (source)  in_transit_outgoing_mt ↓ (source)
```

---

## API Reference

### `GET /api/v1/pois/{poi_id}/stock-snapshot`

**Permission**: Role-gated per AC-8

Response:
```json
{
  "poi_id": "uuid",
  "poi_name": "Gazipur Depot",
  "poi_type": "Finished Feed Depot",
  "total_capacity_mt": 5000.000,
  "current_stock_mt": 3200.000,
  "reserved_stock_mt": 400.000,
  "in_transit_outgoing_mt": 100.000,
  "in_transit_incoming_mt": 0.000,
  "free_capacity_mt": 1400.000,
  "projected_utilization_pct": 66.0,
  "capacity_threshold_pct": 80,
  "threshold_warning": false,
  "last_updated": "2026-06-10T10:30:00Z"
}
```

`threshold_warning` is `true` when `projected_utilization_pct >= capacity_threshold_pct`.

### Source Availability Guard — Error Response (409)
```json
{
  "error": "INSUFFICIENT_SOURCE_STOCK",
  "message": "Insufficient source stock at Gazipur Depot. Available: 320.000 MT, Required: 500.000 MT.",
  "poi_id": "uuid",
  "available_mt": 320.0,
  "required_mt": 500.0
}
```

### Destination Capacity Guard — Warning Response (200 with flag)
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

## Integration Points

| Story | Integration | Direction | Event |
|-------|------------|-----------|-------|
| SC-01 | Scale-out confirmation | SC-01 → STK-01 | `apply_scale_out_stock_deduction()` called atomically in SC-01 scale-out write |
| QC-01 | QC decision | QC-01 → STK-01 | `apply_qc_stock_decision()` called atomically in QC-01 decision write |
| TLS-01 | TO dispatch | TLS-01 → STK-01 | `increment_in_transit_stock()` called on `in_transit_source` status transition |
| CC-01 | Bay assignment | CC-01 calls STK-01 | `validate_source_stock_for_loading()` guard before bay assignment API |
| TR Approval (DM flow) | TR approval | TR service → STK-01 | `reserve_source_stock()` + `validate_destination_capacity()` |
| GPS-01 | Map dashboard | GPS-01 reads STK-01 | POI context panel shows `current_stock_mt`, `free_capacity_mt` from stock snapshot |

---

## RBAC Summary

| Role | Source Stock Snapshot | Destination Capacity Snapshot | Capacity Threshold Config |
|------|-----------------------|-------------------------------|---------------------------|
| Tenant Admin | Read | Read | Read / Write |
| Requester (Depot / Feed Mill / Commercial) | Read | — | — |
| Distribution Officer | Read | Read | — |
| Distribution Manager | Read | Read (+ override approval) | — |
| Procurement Officer | Read | Read (+ override approval) | — |
| Command Center Officer | Read | — | — |
| Transport Planner | — | — | — |
| Gateman / Driver / QC / Scaling Operator | — | — | — |

---

## Definition of Done

- [ ] `POIStock` model created (one-to-one with POI); initial migration seeds all existing POIs with `0` stock values (STK-01-1)
- [ ] TR approval path calls `reserve_source_stock()`; TR rejection/cancellation calls `release_source_reservation()` atomically (STK-01-2)
- [ ] SC-01 scale-out confirmation atomically triggers `apply_scale_out_stock_deduction()`; underflow logged but not blocking (STK-01-3)
- [ ] QC-01 pass atomically increments destination `current_stock_mt`; QC fail leaves it unchanged; both decrement `in_transit_incoming_mt` (STK-01-4)
- [ ] CC-01 bay assignment returns 409 when source stock insufficient (STK-01-5)
- [ ] TR/TO approval returns `CAPACITY_WARNING` or `CAPACITY_OVERRIDE_REQUIRED` when destination headroom breached; DM override requires remarks (STK-01-6)
- [ ] `GET /api/v1/pois/{poi_id}/stock-snapshot` returns correct schema; RBAC enforced for all roles per AC-8 (STK-01-7)
- [ ] `POIStockMovementLog` records written for all mutation events; Tenant Admin admin view functional (STK-01-8)
- [ ] `capacity_threshold_pct` configurable per POI in admin; tenant default fallback applies when POI value is null (STK-01-9)
- [ ] TO `in_transit_source` transition triggers `increment_in_transit_stock()`; cancellation reverses it atomically (STK-01-10)
- [ ] E2E sub-task STK-01-11 passes in staging — full TR-approve → dispatch → scale-out → QC-pass flow validates stock at each stage
- [ ] UAT: Distribution Officer views destination capacity snapshot with threshold warning badge when utilization ≥ 80%
- [ ] UAT: Command Center Officer views source POI stock before initiating loading; 409 returned on attempt when stock insufficient

---

## Open Questions

| # | Question | Owner | Target |
|---|----------|-------|--------|
| OQ-1 | What is the initial seeded stock value for each POI at go-live? Will operations team provide opening balances, or should stock start at 0 and be managed purely through system events? | Product Owner / Operations | Before STK-01-1 migration |
| OQ-2 | On QC fail at destination, is the physically received (but rejected) material returned to the source POI, held in quarantine, or discarded? This determines whether a QC-fail adds stock back to the source. | Product Owner | Before STK-01-4 |
| OQ-3 | Should the capacity override (DM approves despite free capacity breach) be rate-limited or require a second approval? | Distribution Lead | Before STK-01-6 |

---

*Epic: Stock & Capacity Management | Phase: 1 | Sprint: 5 | Story Points: 13 | PRD: §6.7.3.3–6.7.3.4 | Jira: DFS-071 | Last Updated: 2026-06-01*
