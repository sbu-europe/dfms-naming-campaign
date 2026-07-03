# 05-transport — Transport Management

## Overview

The `05-transport` module covers the full transport execution layer — from Transport Requisition (TR) assessment by the Transport Planner, through Transport Order (TO) creation and TDO resource assignment, to the Trip lifecycle (dispatch → gate operations → in-transit → POD → completion).

It maps directly to `apps/transport/` in the backend codebase. The `TransportRequisition` model lives in `apps/requisitions/` and is shared with `04-requisitions`.

**PRD Sections**: 6.7, 6.8 (Transport Orders, Trip Management)  
**Phase**: Phase 1 (Critical)  
**Sprint Coverage**: Sprint 3 (TR queue + planning inputs + TO creation + TDO assignment), Sprint 4 (Trip lifecycle)  
**Dependencies**: `04-requisitions` (approved/submitted TRs), `02-master-data` (Vehicle, Driver, Helper, Route, POI), `07-vendor-management` (vendor fleet + rates)  
**Django App**: `apps/transport/`

**Sprint 3 backlog** (menu + roles + flow): [Sprint 3 README](../../03-backlog/sprints/sprint-3/README.md) — on-disk order includes Requisition first (`01-requisition`), then `02-port-shipments` … `05-transport` (TRQ-01, TO-01, TO-02) … `08-feedback`. This module maps to the **Transport** epic: [TRQ-01](../../03-backlog/sprints/sprint-3/05-transport/01-transport-requests-queue.md) · [TO-01](../../03-backlog/sprints/sprint-3/05-transport/02-transport-orders.md) · [TO-02](../../03-backlog/sprints/sprint-3/05-transport/03-tdo-assignment.md).

---

## Module Contents

| File | Description | Sprint | Related Stories |
|------|-------------|--------|-----------------|
| [transport-requisition-management.md](transport-requisition-management.md) | TR queue (FG + **Port Consignment** tabs), Transport Planner planning inputs (vehicle qty, vehicle type, C&F clearance), fleet availability counts, urgency/overdue flags, `UNDER_PLANNING` status gate for TO creation | Sprint 3 | DFS-038 (TRQ-01) |
| [transport-order-management.md](transport-order-management.md) | TO creation against TRs (own fleet / vendor fleet), TR quantity allocation + overflow guard, multi-TO per TR, auto-routing to TDO queue by fleet type, `TO-YYYYMMDD-XXXX` numbering, TR status auto-updates | Sprint 3 | DFS-039 (TO-01) |
| [trip-management.md](trip-management.md) | TDO Own Fleet assignment (vehicle, driver, helpers, ETA — conflict checks), TDO Vendor Fleet assignment (contractual vendor, auto-rate), TO status lifecycle (`CREATED → VEHICLE_ASSIGNED/VENDOR_ASSIGNED → CONFIRMED`), driver account assigned TO list, Trip 17-state machine (Sprint 4) | Sprint 3 (TDO assignment), Sprint 4 (Trip) | DFS-040 (TO-02) |
| [own-fleet-vehicle-capacity-validation.md](own-fleet-vehicle-capacity-validation.md) | **Proposal** — Django admin capacity fit panel for TDO own-fleet assignment (warn-only; POI-stock / vendor-fleet visual parity) | Post Sprint 6 | TO-02 amend, TAR-004 |

---

## Module Dependency Graph

```
04-requisitions
  │  Approved FG TRs (after DM approval)
  │  Submitted Port Consignment TRs (immediately from Procurement)
  │
  ▼
05-transport (this module)                          apps/transport/
  │
  ├── transport-requisition-management              apps/requisitions/ (TR model)
  │     FG TR queue + Port TR queue
  │     Transport Planner: planning inputs
  │     (vehicle qty, type, C&F)
  │          │
  │          │ TR status → UNDER_PLANNING
  │          ▼
  ├── transport-order-management                    apps/transport/ (TransportOrder)
  │     TO creation (own / vendor fleet)
  │     Quantity allocation + overflow guard
  │     Routing by fleet_type to TDO queue
  │          │
  │          │ TO status → CREATED → routed
  │          ▼
  └── trip-management                               apps/transport/ (TransportOrder + Trip)
        TDO Own Fleet: vehicle + driver + helper + ETA
        TDO Vendor Fleet: contractual vendor + auto-rate
        TO status → CONFIRMED (Ready for Dispatch)
        Trip 17-state machine (Sprint 4)
             │
             ▼
        06-poi-operations (Gate, QC, Scaling)
        09-mobile-apps    (Driver mobile)
```

---

## Menu Structure

```
Sidebar (Transport Planner)
└── Transport
      ├── Transport requests
      │     ├── Finished Goods tab     — approved FG TRs; planning inputs form
      │     └── Port Consignment tab   — import / Port Shipment–linked TRs; planning inputs + C&F (see TRQ-01, `type=PORT_CONSIGNMENT`)
      └── Transport orders (TO)         — all TOs; create; cancel

Sidebar (TDO — Own Fleet)
└── Transport
      └── Transport orders (TO)
            └── Assignment Queue       — Own Fleet TOs (status: created)
                  └── Assign: Vehicle / Driver / Helper(s) / ETA

Sidebar (TDO — Vendor Fleet)
└── Transport
      └── Transport orders (TO)
            └── Assignment Queue       — Vendor Fleet TOs (status: created)
                  └── Assign: Contractual Vendor

Sidebar (Driver)
└── Transport                          — (or “My assignments”, product-dependent)
      └── Transport orders (TO)         — own assigned TOs (read-only)
```

---

## Key Role → Spec Mapping

| Role | Spec | Primary action |
|------|------|----------------|
| Transport Planner | `transport-requisition-management` | Submit planning inputs (vehicle qty, type, C&F) |
| Transport Planner | `transport-order-management` | Create TOs; split quantity across fleet types |
| TDO (Own Fleet) | `trip-management` | Assign vehicle, driver, helpers, ETA |
| TDO (Vendor Fleet) | `trip-management` | Assign contractual vendor |
| Driver | `trip-management` | View assigned TOs (read-only) |

---

## Django App Mapping

| Spec file | Django app | Key models |
|-----------|-----------|------------|
| `transport-requisition-management.md` | `apps/requisitions` | `TransportRequisition` (planning input fields) |
| `transport-order-management.md` | `apps/transport` | `TransportOrder` |
| `trip-management.md` | `apps/transport` | `TransportOrder` (assignment fields), `Trip`, `TripStatusHistory`, `TripIncident` |

---

## Sprint Coverage

| Sprint | Scope |
|--------|-------|
| Sprint 3 | TR queue (FG + Port tabs); planning inputs; TO creation; TDO assignment (vehicle, driver, helpers, ETA, vendor); driver account TO list |
| Sprint 4 | Full Trip state machine (dispatch → gate-in → loading → QC → gate-out → in-transit → POD → closure); trip costing; vendor billing; incident management |

---

## Dependencies

### Upstream
- `04-requisitions`: Approved FG TRs (Distribution) and submitted Port Consignment TRs (Procurement)
- `02-master-data`: Vehicle (`MDM-05`), Driver (`MDM-06`), Helper (`MDM-07`), Route (`MDM-02`), POI (`MDM-04`)
- `07-vendor-management`: Contractual vendor list; pre-agreed rates for auto-application

### Downstream
- `06-poi-operations`: Gate entry/exit, QC, Scaling — triggered by Trip state transitions
- `09-mobile-apps`: Driver mobile view of assigned TOs and Trip state updates
- `11-reporting`: Trip costing KPIs, fulfilment performance, vendor billing reports

---

**Last Updated**: 2026-04-22  
**Previous Module**: [04-requisitions/](../04-requisitions/README.md) — Requisition, Distribution & Procurement  
**Next Module**: [06-poi-operations/](../06-poi-operations/README.md) — Gate, QC, Scaling
