---
module: 05-transport
specification: TDO Assignment & Trip Management
version: 1.0
phase: Phase 1
sprint: Sprint 3 (TDO assignment — TO-02), Sprint 4 (Trip dispatch → completion)
last_updated: 2026-04-22
related_stories: DFS-040 (TO-02 — TDO Vehicle, Driver, Helper & ETA Assignment)
jira_epic: DFS-043
---

# TDO Assignment & Trip Management

## Overview

Once the Transport Planner creates a Transport Order (TO), it is automatically routed to the appropriate TDO queue by fleet type. The TDO then assigns physical resources — vehicle, driver, helper(s), ETA for own fleet; contractual vendor for vendor fleet. After full assignment, the TO is `Ready for Dispatch` and Trips begin executing.

**Sprint 3 scope (TO-02)**: TDO resource assignment — vehicle, driver, helpers, ETA, vendor assignment, TO status transitions to `Ready for Dispatch`.  
**Sprint 4 scope**: Full Trip state machine (dispatch → gate-in → loading → QC → gate-out → in-transit → POD → completion → costing).

**Module path**: `apps/transport/` — `TransportOrder`, `Trip`, `TripStatusHistory`, `TripIncident` models  
**Dependencies**: `transport-order-management.md` (created TOs), `02-master-data` (Vehicle, Driver, Helper, Route), `07-vendor-management` (contractual vendors)  
**Enables**: `06-poi-operations` (Gate, QC, Scaling triggered by Trip state transitions)

---

## 0. Menu Structure & Navigation

```
Sidebar (TDO — Own Fleet)
└── Transport
      └── Transport Orders
            ├── Assignment Queue       — Own Fleet TOs with status: created
            └── TO Detail / Assign     — vehicle picker, driver picker, helper picker, ETA

Sidebar (TDO — Vendor Fleet)
└── Transport
      └── Transport Orders
            ├── Assignment Queue       — Vendor Fleet TOs with status: created
            └── TO Detail / Assign     — contractual vendor picker

Sidebar (Driver — read-only)
└── My Assignments
      └── Transport Orders            — TOs assigned to this driver
            └── TO Detail             — read-only: route, products, ETA, status
```

---

## 1. Roles & Access

| Role | Own Fleet Queue | Assign Vehicle/Driver/Helper/ETA | Vendor Fleet Queue | Assign Vendor | View Assigned TOs |
|------|:---------------:|:---------------------------------:|:-----------------:|:-------------:|:-----------------:|
| TDO (Own Fleet) | ✓ | ✓ | — | — | ✓ |
| TDO (Vendor Fleet) | — | — | ✓ | ✓ | ✓ |
| Driver | — | — | — | — | ✓ (own only) |

> Own Fleet TDO and Vendor Fleet TDO are separate role specialisations — each sees only their respective queue.

---

## 2. Data Models

### 2.1 TransportOrder (assignment fields added by TDO)

```python
TransportOrder {
    # ... existing fields from transport-order-management.md ...

    # Own Fleet assignment (set by TDO Own Fleet)
    assigned_vehicle: FK → Vehicle (null)       # Added at TO-02
    assigned_driver: FK → Driver (null)         # Added at TO-02
    assigned_helpers: M2M → Helper              # Added at TO-02
    eta_at_destination: datetime (null)         # Set by TDO; pre-suggested from route duration

    # Vendor Fleet assignment
    assigned_vendor: FK → Vendor (null)         # Contractual vendor (existing field)
    vendor_vehicle_registration: string (blank) # Optional: vendor's vehicle plate
    vendor_driver_name: string (blank)          # Optional: vendor's driver name

    # Applied rate (auto from vendor contract — not entered manually)
    applied_rate: decimal (null)                # Populated by rate auto-application service
    applied_rate_currency: string (blank)
}
```

### 2.2 Trip (`apps/transport/models.py`)

```python
Trip {
    trip_number: string             # Auto-generated: "TRIP-YYYYMMDD-XXXX"
    transport_order: FK → TransportOrder

    status: TripStatus              # 17-state machine (see §5)

    # Resource assignment (from TransportOrder at dispatch)
    vehicle: FK → Vehicle
    driver: FK → Driver (null)
    helper: FK → Helper (null)      # Primary helper; multiple helpers via M2M on TO
    assigned_by: FK → User          # TDO who assigned

    # Weighing (Gate Operations — Sprint 4)
    tare_weight_kg: decimal (null)
    gross_weight_kg: decimal (null)
    net_weight_kg: decimal (null)   # Calculated: gross − tare

    # Key timestamps (set as Trip transitions through states)
    dispatched_at: datetime (null)
    arrived_at_source_at: datetime (null)
    gate_in_at: datetime (null)
    loading_started_at: datetime (null)
    loading_completed_at: datetime (null)
    gate_out_at: datetime (null)
    arrived_at_destination_at: datetime (null)
    completed_at: datetime (null)

    notes: text
    pod_reference: string (blank)   # Proof of Delivery reference number
}
```

### 2.3 TripStatusHistory (immutable audit trail)

```python
TripStatusHistory {
    trip: FK → Trip
    from_status: string
    to_status: string
    changed_by: FK → User
    location_lat: decimal (null)
    location_lng: decimal (null)
    notes: text
    created_at: datetime            # Immutable — set on creation
}
```

### 2.4 TripIncident

```python
TripIncident {
    trip: FK → Trip
    incident_type: enum [breakdown, accident, delay, theft, diversion, other]
    severity: enum [low, medium, high, critical]
    description: text
    reported_by: FK → User
    location_lat: decimal (null)
    location_lng: decimal (null)
    resolution: text
    is_resolved: bool
    resolved_at: datetime (null)
}
```

---

## 3. TDO Own Fleet — Assignment Queue

**URL**: `GET /api/v1/transport-orders?fleet_type=own&status=created`

### 3.1 List columns

| Column | Field |
|--------|-------|
| TO Number | `to_number` |
| Parent TR | `transport_requisition.tr_number` |
| Source POI | `origin_poi.name` |
| Destination POI | `destination_poi.name` |
| Quantity (MT) | `allocated_quantity_mt` |
| Vehicle Type Required | `vehicle_type_required` |
| Planned Delivery | `planned_delivery_datetime` |
| Urgency | (from parent TR/PR) |
| TR Type | FG / Port (badge) |

### 3.2 Filters

| Filter | Type |
|--------|------|
| Source POI | Dropdown |
| Destination POI | Dropdown |
| Vehicle Type | Dropdown |
| TR Type | FG / Port toggle |
| Urgency | Multi-select |
| Planned Delivery Date | Date range |

---

## 4. Own Fleet — Resource Assignment

### 4.1 Vehicle Assignment

**URL**: `PATCH /api/v1/transport-orders/{to_id}/vehicle` `Body: { vehicle_id }`

Vehicle picker shows:

| Column | Notes |
|--------|-------|
| Registration | Plate number |
| Type | Must match `vehicle_type_required` |
| Capacity (MT) | Should accommodate `allocated_quantity_mt` |
| Current POI | Location; filtered to POIs near source |
| Last Trip Date | |
| Expiring documents | Insurance / Fitness Certificate expiry warning (≤ 30 days) |

**Availability checks (server-side)**:
- `vehicle.current_state = AVAILABLE` — block if `UNDER_MAINTENANCE`
- Vehicle not assigned to any other active Trip (status `dispatched` through `gate_out_source`) — conflict check
- One vehicle per TO

### 4.2 Driver Assignment

**URL**: `PATCH /api/v1/transport-orders/{to_id}/driver` `Body: { driver_id }`

Driver picker shows only `Available` drivers:

| Exclusion rule | Reason |
|----------------|--------|
| `driver.current_state = ON_TRIP` | Already on an active Trip |
| `driver.current_state = ON_LEAVE` | On Leave — blocked |
| `driver.license_expiry_date < today` | Expired license — blocked |
| Driver already assigned to another active TO | Conflict check — one driver cannot be on multiple active TOs simultaneously |

### 4.3 Helper Assignment (optional)

**URL**: `PATCH /api/v1/transport-orders/{to_id}/helpers` `Body: { helper_ids: ["uuid", ...] }`

- Helpers filtered to `current_state = AVAILABLE`, not currently On Trip
- Conflict check: helper not assigned to another active TO at the same time
- Linked to driver + TO

### 4.4 ETA Assignment

**URL**: `PATCH /api/v1/transport-orders/{to_id}/eta` `Body: { eta_datetime }`

- Pre-suggested from `planned_delivery_datetime` + estimated route duration (from `MDM-02` Route master)
- TDO may adjust
- Stored on `TransportOrder.eta_at_destination`
- Visible to all stakeholders (planner, command center, driver)

### 4.5 Own Fleet status transitions

```
CREATED
  └──[vehicle + driver assigned]──► VEHICLE_ASSIGNED
        └──[ETA confirmed]──────────► CONFIRMED (Ready for Dispatch)
```

---

## 5. Vendor Fleet — Vendor Assignment

### 5.1 TDO Vendor Fleet Queue

**URL**: `GET /api/v1/transport-orders?fleet_type=vendor&status=created`

Same columns and filters as Own Fleet queue.

### 5.2 Vendor assignment

**URL**: `PATCH /api/v1/transport-orders/{to_id}/vendor` `Body: { vendor_id, vehicle_registration?, driver_name? }`

Vendor picker shows **contractual vendors only** (from MDM-03 `vendor_type = CONTRACTUAL`):

| Column | Notes |
|--------|-------|
| Company Name | |
| Fleet Info | Vehicle types available |
| Contact | |
| Rate | **Not shown to TDO** — applied automatically from backend |

**Rate auto-application**:
- On vendor assignment, service reads pre-agreed rate from `vendors.Vendor` contract
- Sets `to.applied_rate` automatically — TDO does not enter rates manually
- Rate is **hidden from vendor view** — system-controlled

TDO may optionally enter:
- `vendor_vehicle_registration` — vendor's vehicle plate number
- `vendor_driver_name` — vendor's driver name (free text or linked from vendor fleet records)

### 5.3 Vendor Fleet status transitions

```
CREATED
  └──[vendor assigned]──► VENDOR_ASSIGNED
        └──[ETA / confirmation]──► CONFIRMED (Ready for Dispatch)
```

---

## 6. TO Status Transitions (full lifecycle)

From `apps/transport/constants.py` `TOStatus`:

| Status | Meaning | Set by |
|--------|---------|--------|
| `created` | TO submitted by Planner; awaiting TDO assignment | Transport Planner (on creation) |
| `vehicle_assigned` | Vehicle + driver assigned (own fleet) | TDO (Own Fleet) |
| `vendor_assigned` | Contractual vendor assigned | TDO (Vendor Fleet) |
| `confirmed` | Ready for Dispatch — all resources assigned + ETA set | System |
| `in_progress` | Trip dispatched (first Trip state transition) | System |
| `completed` | All Trips completed | System |
| `cancelled` | Cancelled before assignment | Transport Planner |

---

## 7. Trip State Machine (Sprint 4 — defined here for model completeness)

Full 17-state machine defined in `apps/transport/constants.py` `TripStatus` and `TRIP_STATUS_TRANSITIONS`:

```
ASSIGNED
  └──[dispatch]──────────────────────► DISPATCHED
                                              │
                                         EN_ROUTE_TO_SOURCE
                                              │
                                      ARRIVED_AT_SOURCE
                                              │
                                         GATE_IN_SOURCE
                                              │
                                           SCALE_IN
                                              │
                                           LOADING
                                         ╱          ╲
                              QC_IN_PROGRESS      SCALE_OUT (if QC skipped)
                                     │
                                  QC_PASSED
                                     │
                                 SCALE_OUT
                                     │
                              GATE_OUT_SOURCE
                                     │
                           EN_ROUTE_TO_DESTINATION
                                     │
                          ARRIVED_AT_DESTINATION
                                     │
                           GATE_IN_DESTINATION
                                     │
                               UNLOADING
                                     │
                               COMPLETED
```

Any state except `COMPLETED` may transition to `CANCELLED` (with reason and audit log).

---

## 8. Driver Account — Assigned TO List

**URL**: `GET /api/v1/drivers/me/transport-orders`

Drivers see TOs assigned to them (read-only):

| Column | Field |
|--------|-------|
| TO Number | `to_number` |
| Source POI | `origin_poi.name` |
| Destination POI | `destination_poi.name` |
| Product(s) | Inherited from TR (product names + quantities) |
| Planned Delivery | `planned_delivery_datetime` |
| ETA | `eta_at_destination` |
| Status | `status` (badge) |

TO Detail shows: route information, special instructions, contact information, Arrival Notice (for Port Consignment TOs).

**Scope**: Active and upcoming TOs only (status not `completed` or `cancelled`).

---

## 9. API Endpoints

```http
# TDO assignment queues
GET   /api/v1/transport-orders?fleet_type=own&status=created     # Own Fleet TDO queue
GET   /api/v1/transport-orders?fleet_type=vendor&status=created  # Vendor Fleet TDO queue

# Vehicle availability picker
GET   /api/v1/vehicles/available
      ?vehicle_type=covered_truck
      &poi_id=
      &ownership=own
      → 200 [{ vehicle_id, registration, type, capacity_mt, current_poi, last_trip_date,
               expiring_docs: [{ doc: "insurance", expiry_date }] }]

# Driver availability picker
GET   /api/v1/drivers/available
      → 200 [{ driver_id, full_name, employee_id, license_expiry_date, current_state }]
      (excludes: ON_TRIP, ON_LEAVE, expired license, multi-active-TO conflict)

# Helper availability picker
GET   /api/v1/helpers/available
      → 200 [{ helper_id, full_name, employee_id, current_state }]

# Own Fleet assignment actions
PATCH /api/v1/transport-orders/{to_id}/vehicle
      Body: { "vehicle_id": "uuid" }
      → 200 { status: "vehicle_assigned" }
      → 409 { "detail": "Vehicle is currently under maintenance" }
      → 409 { "detail": "Vehicle is already assigned to an active trip" }

PATCH /api/v1/transport-orders/{to_id}/driver
      Body: { "driver_id": "uuid" }
      → 200 { status: "vehicle_assigned" }
      → 409 { "detail": "Driver is On Leave" }
      → 409 { "detail": "Driver has an expired license" }
      → 409 { "detail": "Driver is already assigned to another active TO" }

PATCH /api/v1/transport-orders/{to_id}/helpers
      Body: { "helper_ids": ["uuid", ...] }
      → 200 { helpers_assigned: 2 }
      → 409 { "detail": "Helper {name} is already assigned to another active TO" }

PATCH /api/v1/transport-orders/{to_id}/eta
      Body: { "eta_datetime": "2026-05-10T14:00:00Z" }
      → 200 { status: "confirmed", eta_at_destination: "..." }

# Vendor Fleet assignment
PATCH /api/v1/transport-orders/{to_id}/vendor
      Body: {
          "vendor_id": "uuid",
          "vehicle_registration": "BN-DH-11-3456",  // optional
          "driver_name": "Karim Hossain"             // optional
      }
      → 200 { status: "vendor_assigned", applied_rate: null }  // rate hidden from response
      → 400 { "detail": "Only contractual vendors can be assigned" }

# Driver account
GET   /api/v1/drivers/me/transport-orders
      → 200 [{ to_number, origin_poi, destination_poi, products, eta, status }]

GET   /api/v1/transport-orders/{to_id}
      → 200 Full TO detail with assignment status
```

---

## 10. Business Rules

| # | Rule | Enforcement |
|---|------|-------------|
| BR-1 | Vehicles `UNDER_MAINTENANCE` cannot be assigned | Vehicle assignment API checks `vehicle.current_state` |
| BR-2 | Vehicles already on an active Trip cannot be assigned | Conflict check: active Trip for this vehicle |
| BR-3 | One vehicle per TO | Single FK on `TransportOrder.assigned_vehicle` |
| BR-4 | Drivers `ON_TRIP` cannot be assigned | Driver state check |
| BR-5 | Drivers `ON_LEAVE` cannot be assigned | Driver state check |
| BR-6 | Drivers with expired licenses cannot be assigned | `driver.license_expiry_date < today` → block |
| BR-7 | One driver cannot be assigned to multiple active TOs simultaneously | Conflict check across `transport_orders` where driver is assigned and status not `completed`/`cancelled` |
| BR-8 | Helpers must not be on an active conflicting TO | Conflict check per helper |
| BR-9 | Only contractual vendors can be assigned to vendor fleet TOs | `vendor.vendor_type = CONTRACTUAL` check |
| BR-10 | Contractual rates are applied automatically — TDO does not enter rates | Rate read from vendor contract; set server-side; not a TDO input |
| BR-11 | Rates are hidden from vendor view | Excluded from vendor-facing API response |
| BR-12 | ETA is suggested from route duration (MDM-02) | Pre-filled; editable by TDO |

---

## 11. Audit Trail

| Event | Actor | Logged fields |
|-------|-------|---------------|
| Vehicle assigned | TDO (Own Fleet) | `to_id`, `vehicle_id`, `user_id`, `timestamp` |
| Driver assigned | TDO (Own Fleet) | `to_id`, `driver_id`, `user_id`, `timestamp` |
| Helper(s) assigned | TDO (Own Fleet) | `to_id`, `helper_ids`, `user_id`, `timestamp` |
| ETA set | TDO (Own Fleet) | `to_id`, `eta_datetime`, `user_id`, `timestamp` |
| Vendor assigned | TDO (Vendor Fleet) | `to_id`, `vendor_id`, `vehicle_registration`, `driver_name`, `user_id`, `timestamp` |
| TO status changed | System | `to_id`, `from_status`, `to_status`, `triggered_by`, `timestamp` |
| Trip state transition | User / System | `trip_id`, `from_status`, `to_status`, `user_id`, `lat`, `lng`, `timestamp` |

---

## 12. Permissions

| Permission code | Description | Assigned to |
|-----------------|-------------|-------------|
| `Transport.TO.AssignVehicle` | Assign vehicle / driver / helpers / ETA | TDO (Own Fleet) |
| `Transport.TO.AssignVehicle` | Set ETA | TDO (Own Fleet) |
| `Transport.TO.AssignVendor` | Assign contractual vendor | TDO (Vendor Fleet) |
| `Transport.TO.Read` | View TO list and detail | Transport Planner, TDO (Own), TDO (Vendor) |
| `Transport.Driver.ViewAssigned` | View own assigned TOs | Driver |
| `Transport.Vehicle.Available` | Query vehicle availability | TDO (Own Fleet), Transport Planner |
| `Transport.Driver.Available` | Query driver availability | TDO (Own Fleet) |
| `Transport.Helper.Available` | Query helper availability | TDO (Own Fleet) |

---

## 13. Testing Strategy

| Layer | Key scenarios |
|-------|---------------|
| Unit — service | Vehicle conflict check (under maintenance, on trip); driver conflict (on leave, expired license, multi-active-TO); rate auto-application |
| API — happy path | Vehicle assignment; driver assignment; helper assignment; ETA; vendor assignment (rate auto-applied) |
| API — error path | Vehicle under maintenance → 409; driver on leave → 409; driver expired license → 409; driver multi-active-TO → 409; non-contractual vendor → 400 |
| Status transitions | `CREATED → VEHICLE_ASSIGNED → CONFIRMED`; `CREATED → VENDOR_ASSIGNED → CONFIRMED` |
| Driver account | Driver sees only own TOs; active/upcoming filter |
| UAT | TDO (Own Fleet) assigns vehicle + driver + helper + ETA; driver sees TO in account |
| UAT | TDO (Vendor Fleet) assigns contractual vendor; rate is applied automatically and not visible |
| UAT | System blocks assignment of a driver who is On Leave |
| UAT | System blocks assignment of a driver already assigned to another active TO |

---

## 14. Dependencies & Cross-References

| Dependency | Description |
|------------|-------------|
| `05-transport/transport-order-management.md` | TOs created by Transport Planner; TDO work begins here |
| `02-master-data` — MDM-05 (Vehicle) | Vehicle availability, type, capacity, state, expiring documents |
| `02-master-data` — MDM-06 (Driver) | Driver availability, license expiry, current state |
| `02-master-data` — MDM-07 (Helper) | Helper availability, current state |
| `02-master-data` — MDM-02 (Routes) | Route duration for ETA pre-suggestion |
| `07-vendor-management` | Contractual vendor list and pre-agreed rates |
| `06-poi-operations` — Gate, QC, Scaling | Triggered by Trip state transitions (`gate_in_source`, `qc_in_progress`, `scale_in`, etc.) in Sprint 4 |
| `09-mobile-apps` | Driver mobile view of assigned TOs and Trip state updates |

### Related documentation (Sprint 3)

- **[Sprint 3 README](../../04-backlog/sprints/sprint-3/README.md)**
- **[TO-02 — TDO assignment](../../04-backlog/sprints/sprint-3/05-transport/03-tdo-assignment.md)**
- **[TO-01 — Transport order creation](../../04-backlog/sprints/sprint-3/05-transport/02-transport-orders.md)**
