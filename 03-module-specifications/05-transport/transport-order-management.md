---
module: 05-transport
specification: Transport Order Management
version: 1.0
phase: Phase 1
sprint: Sprint 3
last_updated: 2026-04-22
related_stories: DFS-039 (TO-01)
jira_epic: DFS-043
---

# Transport Order Management

## Overview

Transport Orders (TOs) are the **executable dispatch units** of the transport workflow. A Transport Planner creates one or more TOs against a Transport Request (TR) once planning inputs have been submitted. A single TR may be split into multiple TOs — for example, a TR for 500 MT may be split across 3 own-fleet TOs and 2 vendor-fleet TOs.

Each TO is tagged as **Own Fleet** or **Vendor Fleet** and automatically routed to the appropriate TDO queue for resource assignment (see `trip-management.md`).

**Module path**: `apps/transport/` — `TransportOrder` model  
**Dependencies**: `transport-requisition-management.md` (TR in `under_planning`), `02-master-data` (Fleet, Vendor), `07-vendor-management`  
**Enables**: `trip-management.md` — TDO resource assignment and Trip dispatch

---

## 0. Menu Structure & Navigation

```
Sidebar (Transport Planner + TDO)
└── Transport
      └── Transport Orders
            ├── TO List                — all TOs; filterable by fleet type, status, TR, POI
            └── TO Detail              — read-only TR context + assignment status
```

### Screen hierarchy

```
TR Detail (status: under_planning)
  └── [Create TO] ──► TO Creation Form
                          ├── Read-only TR fields (FG or Port Consignment)
                          ├── Fleet type selector (Own / Vendor)
                          ├── Allocated quantity input (≤ remaining TR qty)
                          ├── Planned delivery date & time
                          ├── C&F Clearance Note (Port Consignment only)
                          ├── Fleet availability counts (informational)
                          └── [Submit] ──► TO created + routed to TDO queue
                                           └── [Create Another TO] (if remaining > 0)

Transport → Transport Orders
  TO List (GET /transport-orders?...)
    └── [row click] ──► TO Detail (read-only)
```

---

## 1. Roles & Access

| Role | View TO List | Create TO | Cancel TO | Assign Resources |
|------|:------------:|:---------:|:---------:|:----------------:|
| Transport Planner | ✓ (all) | ✓ | ✓ (before `assigned`) | — |
| TDO (Own Fleet) | ✓ (own fleet TOs) | — | — | ✓ (vehicle/driver/helper/ETA) |
| TDO (Vendor Fleet) | ✓ (vendor fleet TOs) | — | — | ✓ (vendor assignment) |

> Resource assignment (TDO actions) is covered in `trip-management.md` (TO-02).

---

## 2. Data Model

`TransportOrder` is in `apps/transport/models.py`.

### 2.1 TransportOrder

```python
TransportOrder {
    to_number: string                   # Auto-generated: "TO-YYYYMMDD-XXXX"
    status: TOStatus                    # See §3 for lifecycle

    transport_requisition: FK → TransportRequisition  # Parent TR
    fleet_type: enum ['own', 'vendor']  # Determines TDO routing

    origin_poi: FK → POI                # Inherited from TR (read-only)
    destination_poi: FK → POI           # Inherited from TR (read-only)

    # Quantity allocation (subset of TR total; overflow guarded)
    allocated_quantity_mt: decimal
    total_quantity_mt: decimal          # Same as allocated_quantity_mt (for Trip use)

    # Planning inputs (inherited from TR at creation time — read-only on TO)
    vehicle_type_required: string
    num_vehicles_required: int          # Set at TO level — may be 1 per TO

    planned_delivery_datetime: datetime # Set per TO; pre-filled from TR required_date
    cf_clearance_note: string (blank)   # PORT_CONSIGNMENT TOs only

    # Assignment (populated by TDO — see trip-management.md)
    assigned_vendor: FK → Vendor (null)  # Vendor fleet TOs only

    created_by: FK → User               # Transport Planner
    notes: text

    # Bidding (Phase 2 — exists on model; not used in Sprint 3)
    is_open_for_bidding: bool (default False)
    bidding_deadline: datetime (null)
}
```

### 2.2 TOStatus (from `apps/transport/constants.py`)

| DB value | Display label | Set by |
|----------|---------------|--------|
| `draft` | Draft | (not used in this flow — TOs submitted directly) |
| `vehicle_assigned` | Vehicle Assigned | TDO (Own Fleet) |
| `vendor_assigned` | Vendor Assigned | TDO (Vendor Fleet) |
| `confirmed` | Ready for Dispatch | System (after full assignment + ETA) |
| `in_progress` | In Progress | System (Trip dispatched) |
| `completed` | Completed | System (Trip completed) |
| `cancelled` | Cancelled | Transport Planner |

> **Sprint 3 addition**: An implicit `created` status (initial state after TO submission by Planner) routes the TO to the TDO queue. The TDO queue shows TOs with status `vehicle_assigned` in progress and `created` / awaiting assignment.

---

## 3. TO Status Lifecycle

```
Transport Planner creates TO
        │
        ▼
     CREATED ──────────────────────────────────────────────────────► CANCELLED
        │                                                             (Planner, before Assigned)
        │  Auto-routed to TDO queue by fleet_type
        │
        ├──[fleet_type = own]──────────────────────────────────────────┐
        │                                                              │
        │  TDO (Own Fleet) assigns vehicle + driver (+ helpers) + ETA  │
        ▼                                                              │
  VEHICLE_ASSIGNED                                                     │
        │                                                              │
        │  ETA confirmed                                               │
        ▼                                                              │
    CONFIRMED (Ready for Dispatch)  ◄─────────────────────────────────┘
        │
        ├──[fleet_type = vendor]────────────────────────────────────────┐
        │                                                               │
        │  TDO (Vendor Fleet) assigns contractual vendor                │
        ▼                                                               │
  VENDOR_ASSIGNED ──► CONFIRMED (Ready for Dispatch) ◄─────────────────┘
        │
        │  (Trip dispatched — see trip-management.md)
        ▼
    IN_PROGRESS
        │
        ▼
    COMPLETED
```

---

## 4. TO Creation Form

### 4.1 Read-only fields (inherited from TR)

**FG TOs**:
- Product Item Code, Product Name, Category, Sub-Category, Type of Packing
- Quantity (TR total), Weight per Unit, UOM
- Source POI, Destination POI
- Delivery Date (from TR), Urgency

**Port Consignment TOs** (all FG fields plus):
- BL Number, LC Number, Voyage Name, Vessel Name, Container Number(s)
- C&F Agent Name, POL, ETA, Arrival Notice (downloadable)
- Destination Breakdown Plan (from parent PR)

### 4.2 Transport Planner input fields

| Field | Required | Notes |
|-------|----------|-------|
| Fleet Type | Yes | Own Fleet / Vendor Fleet — radio or dropdown |
| Allocated Quantity (MT) | Yes | ≤ remaining TR quantity; real-time remaining shown |
| Planned Delivery Date & Time | Yes | Default: TR `required_date`; editable |
| C&F Clearance Note | Port Consignment only | Confirmation field |

### 4.3 Fleet availability counts

Displayed on form to guide fleet type decision (same service as TRQ-01):

```
Own Fleet available (Covered Truck): 12 vehicles
Vendor Fleet available:               8 contracts
```

### 4.4 Submit behaviour

1. Validate `allocated_quantity ≤ remaining TR quantity` — 400 if overflowed
2. Create `TransportOrder` with `status = CREATED`
3. Auto-generate `to_number = TO-YYYYMMDD-XXXX`
4. Inherit `origin_poi`, `destination_poi` from TR
5. Set `fleet_type` from planner's selection
6. Route TO to TDO queue: Own Fleet → TDO (Own Fleet) queue; Vendor Fleet → TDO (Vendor Fleet) queue
7. Update TR quantity tracking:
   - `tr.allocated_mt += allocated_quantity`
   - If `tr.remaining_mt == 0` → `tr.status = FULLY_ALLOCATED`
   - Else if first TO → `tr.status = PARTIALLY_ALLOCATED`
8. Audit log entry written

---

## 5. TR Quantity Allocation Tracking

Overflow check service (evaluated per TO creation):

```python
# Business rule: sum of non-cancelled TOs must not exceed TR total
allocated_mt = TransportOrder.objects.filter(
    transport_requisition=tr,
    status__in=['created', 'vehicle_assigned', 'vendor_assigned', 'confirmed', 'in_progress']
).aggregate(total=Sum('allocated_quantity_mt'))['total'] or 0

remaining_mt = tr.total_quantity_mt - allocated_mt

if (allocated_mt + new_to_quantity) > tr.total_quantity_mt:
    raise ValidationError(
        f"Allocated quantity exceeds remaining TR quantity ({remaining_mt} MT remaining)"
    )
```

Remaining quantity shown in real time on the TO creation form via:

```
GET /api/v1/transport-requests/{tr_id}/transport-orders
→ { "total_qty_mt": 500, "allocated_mt": 200, "remaining_mt": 300, "transport_orders": [...] }
```

TR status auto-updates:
- First TO created → `PARTIALLY_ALLOCATED`
- `remaining_mt == 0` → `FULLY_ALLOCATED`

---

## 6. Multi-TO per TR

- After first TO, `remaining_mt > 0` → "Create Another TO" available on success screen
- Each TO can have a **different fleet type** (mix Own + Vendor Fleet TOs against same TR)
- No limit on number of TOs per TR as long as `allocated_mt ≤ tr.total_quantity_mt`
- TR Detail shows all linked TOs with fleet type, allocated qty, and status

---

## 7. TO Routing by Fleet Type

On TO creation, the system determines TDO routing automatically:

| TO `fleet_type` | Routes to | TDO action |
|-----------------|-----------|------------|
| `own` | TDO (Own Fleet) queue | Assign vehicle, driver, helpers, ETA |
| `vendor` | TDO (Vendor Fleet) queue | Assign contractual vendor; rates auto-applied |

Routing is implemented as a queue filter — TDOs query TOs by `fleet_type`:
- `GET /api/v1/transport-orders?fleet_type=own&status=created` → Own Fleet TDO queue
- `GET /api/v1/transport-orders?fleet_type=vendor&status=created` → Vendor Fleet TDO queue

---

## 8. TO List View

**URL**: `GET /api/v1/transport-orders`

### 8.1 Columns

| Column | Field |
|--------|-------|
| TO Number | `to_number` |
| Parent TR | `transport_requisition.tr_number` |
| Fleet Type | `fleet_type` (badge: Own / Vendor) |
| Source POI | `origin_poi.name` |
| Destination POI | `destination_poi.name` |
| Allocated Qty (MT) | `allocated_quantity_mt` |
| Vehicle Type | `vehicle_type_required` |
| Planned Delivery | `planned_delivery_datetime` |
| Status | `status` (badge) |
| Created By | `created_by.full_name` |

### 8.2 Filters

| Filter | Type |
|--------|------|
| Fleet Type | Own / Vendor toggle |
| Status | Multi-select |
| TR Number | Text search |
| Source / Destination POI | Dropdown |
| Planned Delivery Date | Date range |

---

## 9. API Endpoints

```http
# TO creation
POST  /api/v1/transport-orders
      Body: {
          "tr_id": "uuid",
          "fleet_type": "own",                     // or "vendor"
          "allocated_quantity_mt": 200.0,
          "planned_delivery_datetime": "2026-05-10T09:00:00Z",
          "cf_clearance_note": "Approved"           // PORT_CONSIGNMENT only
      }
      → 201 Created { to_number, status: "created", fleet_type, ... }
      → 400 { "detail": "Allocated quantity exceeds remaining TR quantity (300 MT remaining)" }
      → 400 { "detail": "TR planning inputs have not been submitted" }

# TO list
GET   /api/v1/transport-orders
      ?fleet_type=own|vendor
      &status=
      &tr_id=
      &origin_poi_id=&destination_poi_id=
      &planned_from=&planned_to=
      &page=&page_size=
      → 200 Paginated TO list

# TO detail
GET   /api/v1/transport-orders/{to_id}
      → 200 Full TO detail (read-only TR fields + assignment status)

# Cancel TO
POST  /api/v1/transport-orders/{to_id}/cancel
      → 200 { status: "cancelled" }
      → 400 if TO status is vehicle_assigned, vendor_assigned, confirmed, or later

# Fleet availability (same endpoint as TRQ-01)
GET   /api/v1/fleet/availability?vehicle_type=covered_truck&poi_id=
      → 200 { own_fleet: { available: 12 }, vendor_fleet: { available_contracts: 8 } }

# TR allocation tracking
GET   /api/v1/transport-requests/{tr_id}/transport-orders
      → 200 { total_qty_mt, allocated_mt, remaining_mt, transport_orders: [...] }
```

---

## 10. Business Rules

| # | Rule | Enforcement |
|---|------|-------------|
| BR-1 | TO can only be created from a TR with `planning_submitted_at IS NOT NULL` | Service-layer check on TO creation |
| BR-2 | Allocated quantity across all non-cancelled TOs must not exceed TR total | Service-layer overflow check |
| BR-3 | TO is tagged exactly one fleet type (Own or Vendor) | Required field; cannot be changed after creation |
| BR-4 | C&F Clearance Note shown and required for Port Consignment TOs | UI conditional; API validates if `tr_type = PORT_CONSIGNMENT` |
| BR-5 | All product-related attributes are read-only on TO (inherited from TR) | No write fields for product data on TO creation |
| BR-6 | TO routing to TDO queue is automatic on creation | Determined by `fleet_type`; no manual routing step |
| BR-7 | TO can be cancelled by Planner only before resource assignment begins | Cancel endpoint returns 400 if `status in (vehicle_assigned, vendor_assigned, confirmed, in_progress)` |
| BR-8 | TO number format: `TO-YYYYMMDD-XXXX` | Auto-generated server-side |

---

## 11. Audit Trail

| Event | Actor | Logged fields |
|-------|-------|---------------|
| TO created | Transport Planner | `to_id`, `to_number`, `tr_id`, `fleet_type`, `allocated_qty`, `status`, `timestamp` |
| TO cancelled | Transport Planner | `to_id`, `to_number`, `reason`, `timestamp` |
| TR status auto-updated | System | `tr_id`, `from_status`, `to_status`, `triggered_by_to_id`, `timestamp` |

---

## 12. Permissions

| Permission code | Description | Assigned to |
|-----------------|-------------|-------------|
| `Transport.TO.Create` | Create Transport Orders against TRs | Transport Planner |
| `Transport.TO.Read` | View TO list and detail | Transport Planner, TDO (Own), TDO (Vendor) |
| `Transport.TO.Cancel` | Cancel TO (before resource assignment) | Transport Planner |

---

## 13. Testing Strategy

| Layer | Key scenarios |
|-------|---------------|
| Unit — model | TO number generation; `allocated_mt` tracking after multiple TOs |
| Unit — service | Overflow check (exact boundary); first TO → `PARTIALLY_ALLOCATED`; last TO → `FULLY_ALLOCATED` |
| API — happy path | TO creation (FG own fleet); TO creation (Port Consignment, vendor fleet, C&F note); multi-TO per TR; fleet type mix |
| API — error path | TO without planning inputs → 400; overflow → 400; cancel after assignment → 400 |
| Routing | Own fleet TO appears in TDO Own Fleet queue; Vendor fleet TO appears in TDO Vendor Fleet queue |
| UAT | Transport Planner splits one FG TR into 2 TOs (own + vendor); both routed to respective TDO queues |
| UAT | Transport Planner creates Port Consignment TO with C&F Clearance Note |

---

## 14. Dependencies & Cross-References

| Dependency | Description |
|------------|-------------|
| `05-transport/transport-requisition-management.md` | TR must be `under_planning` (planning inputs submitted) before TO creation |
| `02-master-data` — MDM-05 (Vehicle) | Fleet availability count for planning form |
| `07-vendor-management` | Vendor fleet availability; contractual vendor list for TDO assignment |
| `05-transport/trip-management.md` | Downstream — TDO resource assignment and Trip lifecycle begin after TO creation |

### Related documentation (Sprint 3)

- **[Sprint 3 README](../../04-backlog/sprints/sprint-3/README.md)**
- **[TO-01 — Transport order creation](../../04-backlog/sprints/sprint-3/05-transport/02-transport-orders.md)**
- **[TRQ-01 — prerequisite TR queue & planning inputs](../../04-backlog/sprints/sprint-3/05-transport/01-transport-requests-queue.md)**
