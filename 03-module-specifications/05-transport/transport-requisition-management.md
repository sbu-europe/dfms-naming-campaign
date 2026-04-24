---
module: 05-transport
specification: Transport requests queue & planning input (TRQ-01)
version: 1.0
phase: Phase 1
sprint: Sprint 3
last_updated: 2026-04-22
related_stories: DFS-038 (TRQ-01)
jira_epic: DFS-043
---

# Transport requests queue & planning input (TRQ-01)

## Overview

This is the **entry point for the Transport module**. Once a Transport Request (TR) is available for planning — FG TRs after Distribution Manager approval, Port Consignment TRs immediately on Procurement Officer submission — they appear in the Transport Planner's queue.

The Transport Planner's mandatory first action is to **submit planning inputs** (number of vehicles, vehicle type, and for Port Consignment TRs, Raw C&F Clearance Note/Approval). **Transport Order creation is blocked until planning inputs are submitted.**

**Module path**: `apps/transport/` + `apps/requisitions/` (TR model lives in requisitions)  
**Dependencies**: `04-requisitions` (approved FG TRs, submitted Port TRs), `02-master-data` (Fleet, POI)  
**Enables**: `transport-order-management.md` — TO creation once TR is `Under Planning`

---

## 0. Menu Structure & Navigation

```
Sidebar (Transport Planner)
└── Transport
      └── Transport requests
            ├── Finished Goods tab         — approved FG TRs (from Distribution)
            └── Port Consignment tab       — Port Shipment–linked TRs (`type=PORT_CONSIGNMENT`; from Procurement) — *not* all RM moves, only this import path
                  └── TR Detail / Planning — read-only TR fields + planning input form
```

### Screen hierarchy

```
Transport → Transport requests
  [Finished Goods tab]
    TR Queue (GET /transport-requests?type=FG&status=available_for_planning,under_planning)
      └── [row click] ──► TR Detail
                            ├── FG fields (read-only from TR)
                            ├── Fleet availability counts (own + vendor)
                            ├── Planning input form: vehicle qty + vehicle type
                            ├── Urgency / overdue badge
                            ├── Linked TOs (after TO creation)
                            └── [Submit Planning Inputs] ──► status: under_planning
                                                              └── [Create TO] ──► TO creation form

  [Port Consignment tab]
    TR Queue (GET /transport-requests?type=PORT_CONSIGNMENT&status=available_for_planning,under_planning)
      └── [row click] ──► TR Detail
                            ├── Port Consignment shipment fields (read-only)
                            ├── Raw C&F Clearance Note / Approval (Yes / No)
                            ├── Fleet availability counts
                            ├── Planning input form: Raw C&F Clearance Note/Approval + vehicle qty + vehicle type
                            └── [Submit Planning Inputs] ──► status: under_planning
```

---

## 1. Roles & Access

| Role | TR queue (FG tab) | TR queue (Port Consignment tab) | Submit planning inputs | Create TO |
|------|:-----------------:|:-----------------:|:----------------------:|:---------:|
| Transport Planner | ✓ | ✓ | ✓ | ✓ |
| TDO (Own Fleet) | — | — | — | — |
| TDO (Vendor Fleet) | — | — | — | — |

> TDOs do not interact with the TR queue — their work begins after TO creation (see `transport-order-management.md`).

---

## 2. Data Model

The `TransportRequisition` model lives in `apps/requisitions/models.py`. The Transport module reads and updates planning input fields on the existing TR.

### Planning input fields added to `TransportRequisition`

```python
TransportRequisition {
    # ... existing fields from 04-requisitions ...

    # Planning inputs (set by Transport Planner at TRQ-01)
    vehicles_required: int              # Number of vehicles needed
    vehicle_type_required: string       # e.g. "covered_truck", "open_truck", "flatbed"
    cf_clearance_approved: bool (null)  # PORT_CONSIGNMENT only — Raw C&F Clearance Note/Approval: Yes / No / Pending (null)
    planning_submitted_by: FK → User    # Transport Planner who submitted
    planning_submitted_at: datetime (null)

    # Status progression (managed by TRStatus in requisitions/constants.py)
    status: TRStatus
    # AVAILABLE_FOR_PLANNING → UNDER_PLANNING (on planning input submission)
    # UNDER_PLANNING → PARTIALLY_ALLOCATED → FULLY_ALLOCATED (on TO creation)
}
```

> **Current model note**: `TRStatus` in `apps/requisitions/constants.py` has `DRAFT`, `SUBMITTED`, `APPROVED`, `REJECTED`, `ASSIGNED`, `CANCELLED`. At implementation time, statuses should be extended / reconciled to include `AVAILABLE_FOR_PLANNING`, `UNDER_PLANNING`, `PARTIALLY_ALLOCATED`, `FULLY_ALLOCATED` to match this specification.

### TRStatus for Transport module

| DB value | Display label | Set by |
|----------|---------------|--------|
| `available_for_planning` | Available for Planning | System (after DM approval or Procurement submission) |
| `under_planning` | Under Planning | System (after Transport Planner submits planning inputs) |
| `partially_allocated` | Partially Allocated | System (after first TO created) |
| `fully_allocated` | Fully Allocated | System (all TR quantity allocated to TOs) |
| `assigned` | Assigned | System (all TOs `Ready for Dispatch`) |
| `cancelled` | Cancelled | Transport Planner (before `under_planning`) |

---

## 3. TR queue — Finished Goods tab

**URL**: `GET /api/v1/transport-requests?type=FG&status=available_for_planning,under_planning`

### 3.1 List columns

| Column | Field | Notes |
|--------|-------|-------|
| TR Number | `tr_number` | |
| Parent PR | `source_pr.pr_number` | Link to PR |
| Product Item Code | `source_pr → line_items[0].product.item_code` | |
| Product Category | `product.category` | |
| Type of Packing | `product.packing_type` | |
| Quantity | `total_quantity_mt` | MT |
| Weight per Unit | `product.weight_per_unit` | |
| Total Calc. Weight | computed | `quantity × weight_per_unit` |
| UOM | `uom` | |
| Urgency | `source_pr.priority` | badge |
| Delivery Date | `required_date` | |
| Source POI | `origin_poi.name` | |
| Destination POI | `destination_poi.name` | |
| Status | `status` | badge |

### 3.2 Filters & sort

| Filter | Type |
|--------|------|
| Date (required_date) | Date range |
| Source POI | Dropdown |
| Destination POI | Dropdown |
| Urgency | Multi-select |
| Status | Multi-select (Available / Under Planning) |

**Default sort**: Delivery date ascending (earliest first). Secondary: Urgency (critical → high → medium → low).

---

## 4. TR queue — Port Consignment tab

**URL**: `GET /api/v1/transport-requests?type=PORT_CONSIGNMENT&status=available_for_planning,under_planning`

Cargo lines use **RM** products from the Port Shipment; the **UI tab label** is **Port Consignment** (Sprint 3 / TRQ-01 — `type=PORT_CONSIGNMENT`), not a generic “Raw Materials” transport tab.

### 4.1 List columns

| Column | Field |
|--------|-------|
| TR Number | `tr_number` |
| Parent PR | `source_pr.pr_number` |
| Product Item Code | `source_pr → line_items[].product.item_code` (comma list if multiple) |
| Product Category | `product.category` |
| BL Number | `bl_number` |
| LC Number | `lc_number` |
| Voyage Name | `source_pr.voyage_name` |
| Vessel Name | `source_pr.vessel_name` |
| Container Number | `source_pr.container_numbers` |
| C&F Agent | `source_pr.cnf_agent_name` |
| POL | `source_pr.point_of_loading` |
| ETA | `source_pr.eta` |
| Arrival Notice | Download link |
| Commodity | `product.category` |
| Quantity (MT) | `total_quantity_mt` |
| Source POI (Port) | `origin_poi.name` |
| Destination POI | `destination_poi.name` |
| Delivery Date | `required_date` |
| Status | `status` (badge) |

### 4.2 Filters & sort

| Filter | Type |
|--------|------|
| ETA | Date range |
| Source POI (Port) | Dropdown |
| Destination POI | Dropdown |
| Urgency | Multi-select |
| Status | Multi-select |

**Default sort**: ETA ascending. Secondary: Urgency.

---

## 5. TR Detail & Planning Input Form

### 5.1 Read-only TR fields

**FG TRs**: Product Item Code, Product Name, Category, Sub-Category, Type of Packing, Quantity, Weight per Unit, Total Calculated Weight, UOM, Urgency, Source POI, Destination POI, Delivery Date.

**Port Consignment TRs**: All FG fields plus BL Number, LC Number, Voyage Name, Vessel Name, Container Number(s), C&F Agent, POL, ETA, Arrival Notice (downloadable), Destination Breakdown Plan (all TRs from the linked **Port Shipment** with destinations + quantities).

### 5.2 Fleet availability display

Shown on the planning input form to guide fleet type selection:

```
Own Fleet available:    12 vehicles  (type: Covered Truck, status: Available)
Vendor Fleet available:  8 contracts  (active contractual vendors)
```

Sourced from `GET /api/v1/fleet/availability?vehicle_type=&poi_id=`. Informational only — does not block submission.

### 5.3 Planning input form

| Field | FG TR | Port Consignment TR | Notes |
|-------|:-----:|:-------------------:|-------|
| Raw C&F Clearance Note / Approval | — | Required | Yes / No dropdown |
| Quantity of Vehicles Required | Required | Required | Positive integer |
| Vehicle Type | Required | Required | Dropdown from vehicle type catalog |

**Vehicle type options**: Covered Truck, Open Truck, Flatbed, Tanker, Refrigerated Truck (from MDM vehicle type catalog).

### 5.4 Submit behaviour

1. Validates all planning input fields are filled
2. Sets `tr.vehicles_required`, `tr.vehicle_type_required`, `tr.cf_clearance_approved` (Port only)
3. Sets `tr.planning_submitted_by = request.user`, `tr.planning_submitted_at = now()`
4. TR status → `UNDER_PLANNING`
5. TR is now **locked to this planner** — other planners cannot submit inputs or create TOs against it
6. Audit log entry written
7. "Create TO" button becomes enabled on TR Detail

---

## 6. Urgency & Deadline Flags

| Flag | Condition | Display |
|------|-----------|---------|
| Urgent | `required_date` (or `eta` for Port) within 24 hours from now | Orange "Urgent" badge |
| Overdue | `required_date` (or `eta`) has passed | Red "Overdue" badge |

Evaluated at query time; not stored on the model. Applied to both TR queue list rows and TR detail header.

---

## 7. Fleet Availability Service

```
GET /api/v1/fleet/availability?vehicle_type=covered_truck&poi_id={source_poi_id}

Response:
{
    "own_fleet": {
        "available": 12,
        "by_status": { "available": 12, "under_maintenance": 3, "on_trip": 5 }
    },
    "vendor_fleet": {
        "available_contracts": 8,
        "active_vendors": 8
    }
}
```

Own fleet count: `Vehicle.objects.filter(vehicle_type=type, current_state=AVAILABLE, ownership=OWN)`.  
Vendor fleet count: active contractual vendor records from `vendors.Vendor`.

---

## 8. API Endpoints

```http
# TR Queue — Finished Goods
GET  /api/v1/transport-requests
     ?type=FG
     &status=available_for_planning,under_planning
     &date_from=&date_to=
     &origin_poi_id=&destination_poi_id=
     &urgency=
     &sort=required_date
     &page=&page_size=
     → 200 Paginated TR list (FG fields)

# TR Queue — Port Consignment
GET  /api/v1/transport-requests
     ?type=PORT_CONSIGNMENT
     &status=available_for_planning,under_planning
     &eta_from=&eta_to=
     &origin_poi_id=&destination_poi_id=
     &urgency=
     &sort=eta
     → 200 Paginated TR list (Port Consignment fields)

# TR Detail
GET  /api/v1/transport-requests/{tr_id}
     → 200 Full TR detail + read-only fields + linked TOs + remaining qty

# Submit planning inputs
PATCH /api/v1/transport-requests/{tr_id}/planning
      Body: {
          "vehicles_required": 3,
          "vehicle_type": "covered_truck",
          "cf_clearance_approved": true    // PORT_CONSIGNMENT only
      }
      → 200 { status: "under_planning", planning_submitted_at: "..." }
      → 400 { "detail": "Raw C&F Clearance Note/Approval is required for Port Consignment TRs" }
      → 409 { "detail": "TR is already under planning by another planner" }

# Fleet availability
GET  /api/v1/fleet/availability?vehicle_type=covered_truck&poi_id=
     → 200 { own_fleet: { available: 12 }, vendor_fleet: { available_contracts: 8 } }

# Linked TOs on TR
GET  /api/v1/transport-requests/{tr_id}/transport-orders
     → 200 { total_qty: 500, allocated: 200, remaining: 300, transport_orders: [...] }
```

---

## 9. Business Rules

| # | Rule | Enforcement |
|---|------|-------------|
| BR-1 | TO creation is blocked if TR planning inputs have not been submitted | TO creation API checks `tr.planning_submitted_at is not None` |
| BR-2 | Raw C&F Clearance Note / Approval is mandatory for Port Consignment TRs | Validated on `PATCH /planning` endpoint |
| BR-3 | C&F field is hidden/absent for FG TRs | UI and API — field ignored for FG type |
| BR-4 | TR transitions to `UNDER_PLANNING` on planning input submission | Automatic, no manual trigger |
| BR-5 | TR is locked to the submitting planner once `UNDER_PLANNING` | `planning_submitted_by` set; conflict check on re-submission |
| BR-6 | Fleet availability counts are informational only — do not block submission | No validation against counts |
| BR-7 | Urgency and overdue flags are computed at read time, not stored | Calculated from `required_date` / `eta` vs `now()` |

---

## 10. Audit Trail

| Event | Actor | Logged fields |
|-------|-------|---------------|
| TR viewed | Transport Planner | `tr_id`, `tr_number`, `user_id`, `timestamp` |
| Planning inputs submitted | Transport Planner | `tr_id`, `vehicles_required`, `vehicle_type`, `cf_clearance_approved`, `user_id`, `timestamp` |
| TR status changed | System | `tr_id`, `from_status`, `to_status`, `triggered_by`, `timestamp` |

---

## 11. Permissions

| Permission code | Description | Assigned to |
|-----------------|-------------|-------------|
| `Transport.TR.Read` | View TR queue (both tabs) and TR detail | Transport Planner, TDO |
| `Transport.TR.PlanningInput` | Submit planning inputs (vehicle qty, type, C&F) | Transport Planner |
| `Transport.Fleet.Availability` | View fleet availability counts | Transport Planner |

---

## 12. Testing Strategy

| Layer | Key scenarios |
|-------|---------------|
| Unit — service | Planning input validation (FG missing type → error; Port missing C&F → error); urgency flag logic |
| API — happy path | FG TR queue with filters; Port TR queue with ETA sort; planning input submission (FG + Port); fleet availability |
| API — error path | Submit planning without C&F on Port TR → 400; create TO without planning inputs → 400; duplicate planning submission → 409 |
| UAT | Transport Planner submits planning inputs on FG TR → TO creation unblocked; submits on Port TR (with C&F) → TO creation unblocked |

---

## 13. Dependencies & Cross-References

| Dependency | Description |
|------------|-------------|
| `04-requisitions/distribution-management.md` | Source of approved FG TRs (status: `available_for_planning`) |
| `04-requisitions/procurement-management.md` | Source of submitted Port Consignment TRs (status: `available_for_planning`) |
| `02-master-data` — MDM-05 (Vehicle) | Own fleet availability count; vehicle type catalog |
| `02-master-data` — MDM-06 (Driver) | Not consumed here; used in TO-02 (TDO assignment) |
| `07-vendor-management` | Vendor fleet availability count |
| `05-transport/transport-order-management.md` | Downstream — TO creation requires TR in `under_planning` status |

### Related documentation (Sprint 3)

- **[Sprint 3 README](../../04-backlog/sprints/sprint-3/README.md)** — Menu, roles, end-to-end flow; **Transport** = **Transport requests** + **Transport orders**
- **[TRQ-01 — Transport requests queue (FG & Port Consignment)](../../04-backlog/sprints/sprint-3/05-transport/01-transport-requests-queue.md)**
