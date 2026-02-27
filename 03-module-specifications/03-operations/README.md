# 03-core-operations - Core Business Operations

## Module Overview

This module defines the primary business workflows for the DFMS platform, covering the complete transport lifecycle from product requisition through transport order creation and trip execution to final delivery.

**Purpose**: End-to-end transport and logistics workflow management  
**PRD Sections**: 6.6, 6.7, 6.8  
**Phase**: Phase 1 (Critical)  
**Dependencies**: `01-foundation/`, `02-master-data/`

---

## Module Contents

### 📄 Specifications

**Note**: All specification files are written in **domain knowledge format**, explaining how the system works conceptually with technical details, data models, and implementation guidance. They maintain traceability to user stories while focusing on architecture and mechanisms rather than requirements.

| File | Description | PRD Section | Related Stories | Lines |
|------|-------------|-------------|-----------------|-------|
| [product-requisition-management.md](product-requisition-management.md) | Demand initiation layer for product transfers, dual workflow support (FG/Port), requester context, approval workflows (Distribution/Procurement), automatic TR generation, stock/capacity validation, destination breakdown planning | 6.6 | US-013, US-014, US-015, US-016, US-017 | 688 |
| [transport-requisition-management.md](transport-requisition-management.md) | Orchestration layer between PR and TO, multi-stage review (DO→DM→TP), flexible fulfillment (partial allocations, multiple TRs per PR), transport input completion, C&F clearance for port transfers, TR-to-TO conversion strategies | 6.7 | US-017, US-018, US-019 | 803 |
| [transport-order-management.md](transport-order-management.md) | Operational execution layer, single vehicle work orders, multiple allocation strategies (own fleet/vendor bidding/vendor contractual), bid management, vehicle-driver-helper assignment, TO-to-Trip conversion, resource validation | 6.8 | US-019, US-020, US-021, US-022, US-023, US-024, US-025 | 849 |
| [trip-management.md](trip-management.md) | Field execution layer, complete journey lifecycle (assigned→completed), gate tracking, loading/unloading confirmation, GPS tracking, geofencing, POD capture, automatic trip closure (QC+POD+gate-out), trip costing (own fleet vs vendor), incident management, vendor portal visibility | 6.8 (partial) | US-025, US-026, US-027, US-028, US-029, US-030, US-031, US-032 | 935 |

**Total Documentation**: ~3,275 lines of comprehensive technical specifications

---

## Key Workflows

### 1. Product Requisition (PR) → Transport Requisition (TR)
```
Requester → Creates PR → Approver Reviews → Approved → Auto TR Generation
```

**Flows**:
- **Finished Goods**: Depot/Feed Mill → Distribution Approval → TR
- **Port Consignment**: Commercial → Procurement Approval + CNF → TR

### 2. Transport Requisition (TR) → Transport Order (TO)
```
TR Created → Transport Planner Assessment → Fleet Availability Check → TO Creation
```

**Key Features**:
- Multiple TOs can be created from single TR (quantity split)
- Fleet vs Vendor decision per TO
- Route and vehicle type optimization

### 3. Transport Order (TO) → Trip Execution
```
TO Created → Fleet/Vendor Assigned → Vehicle/Driver Assigned → Trip Created → Execution
```

**Execution Paths**:
- **Own Fleet**: Direct vehicle/driver assignment
- **Vendor Fleet - Contractual**: Direct vendor assignment
- **Vendor Fleet - Non-Contractual**: Bidding workflow

### 4. Trip Lifecycle (12 States)
```
Created → Assigned → Dispatched → Gate-In Source → Scale-In → Loading → 
Scale-Out → Gate-Out Source → In-Transit → Gate-In Dest → Unloading → 
QC → POD → Closed
```

---

## Key Features

### Product Requisition Management
- **PR Creation**: Depot, feed mill, or commercial team initiates
- **Stock Validation**: Real-time source stock availability check
- **Capacity Validation**: Destination capacity warnings (80%, 90%, 100% thresholds)
- **Approval Workflows**: Distribution (FG) or Procurement (Port)
- **Auto TR Generation**: On approval, creates corresponding TR

### Transport Requisition Management
- **TR Queue**: Centralized queue for transport planners
- **Filtering**: By urgency, route, product type, source/destination
- **Assessment**: Planner reviews TR and decides on TO strategy
- **Multiple TOs**: Split large requisitions across multiple vehicles
- **Fleet Availability**: Real-time vehicle availability validation

### Transport Order Management
- **TO Creation**: From approved TRs with quantity allocation
- **Fleet Decision**: Own fleet vs vendor fleet per TO
- **Own Fleet Execution**: Direct vehicle/driver assignment with availability check
- **Vendor Execution**: Contractual (direct) or non-contractual (bidding)
- **TO Lifecycle**: Pending → Assigned → In-Progress → Completed → Closed

### Trip Management
- **Trip States**: 12 primary states with sub-states
- **GPS Tracking**: Real-time location and geofence monitoring
- **Incident Management**: Halt, breakdown, partial delivery, re-delivery
- **POD Collection**: Proof of delivery capture (signature, photo)
- **Trip Closure**: Automated closure on QC pass + POD
- **Trip Costing**: Fuel, driver/helper cost, vendor rate, profitability

---

## Dependencies

### Upstream Dependencies
- **`01-foundation/`**: User roles (Requester, Approver, Planner, TDO), RBAC, audit
- **`02-master-data/`**: POI, Product, Vehicle, Driver, Vendor master data

### Downstream Dependencies
**Modules that depend on core operations**:
- **`04-operations-support/`**: Gate, scaling, loading, QC operations execute on trips
- **`05-vendor-management/`**: Vendor bidding and execution for non-contractual TOs
- **`06-fleet-management/`**: Fleet availability, driver assignment, fuel tracking
- **`07-mobile-interfaces/`**: Driver app shows trip details, vendor app shows TO status
- **`08-reporting-analytics/`**: Reports on PRs, TRs, TOs, trips

### Cross-Module References
- **PR/TR/TO/Trip IDs** referenced across all operational modules
- **Trip State** triggers actions in gate, scaling, loading, QC modules
- **TO Status** determines vendor portal visibility

---

## Related User Stories

| Story ID | Title | Module |
|----------|-------|--------|
| US-010 | Create Port Consignment Transfer Requisition (TR) | PR Management |
| US-011 | Distribution Approval Workflow (FG TR) | PR Management |
| US-012 | Procurement Approval Workflow (Port TR) | PR Management |
| US-013 | Stock Validation (Source & Destination) | PR Management |
| US-014 | Capacity Checking and Warnings | PR Management |
| US-015 | Transport Requisition (TR) Assessment by Transport Planner | TR Management |
| US-016 | Fleet Availability Validation | TR Management |
| US-017 | Transport Order (TO) Creation - Multiple TOs per TR | TO Management |
| US-018 | Transport Order (TO) Creation by Transport Planner | TO Management |
| US-019 | TO Execution - Vendor Fleet (Direct Assignment) | TO Management |
| US-020 | TO Execution - Own Fleet (Vehicle/Driver Assignment) | TO Management |
| US-021 | Trip Lifecycle Management (12 States, Sub-states) | Trip Management |
| US-022 | Partial Delivery Handling | Trip Management |
| US-023 | Incident Management | Trip Management |
| US-025 | Trip Closure with Proof of Delivery (POD) | Trip Management |

**Location**: `../../04-phase-backlog/phase-1/user-stories/`

---

## Data Model Highlights

### Product Requisition (PR)
```typescript
ProductRequisition {
  pr_id: UUID
  pr_number: string (auto-generated)
  requisition_type: enum [FinishedGoods, PortConsignment]
  product_id: UUID
  quantity: Decimal
  source_poi_id: UUID
  destination_poi_id: UUID
  requester_id: UUID
  urgency: enum [Normal, High, Critical]
  status: enum [Draft, Pending, Approved, Rejected]
  approval_workflow_id: UUID
  approved_by: UUID (nullable)
  approved_at: DateTime (nullable)
  tr_id: UUID (nullable, generated on approval)
  created_at: DateTime
  tenant_id: UUID
}
```

### Transport Requisition (TR)
```typescript
TransportRequisition {
  tr_id: UUID
  tr_number: string (auto-generated)
  pr_id: UUID
  product_id: UUID
  quantity: Decimal
  source_poi_id: UUID
  destination_poi_id: UUID
  route_id: UUID
  assigned_planner_id: UUID (nullable)
  status: enum [Pending, Assigned, InProgress, Completed]
  created_at: DateTime
  tenant_id: UUID
}
```

### Transport Order (TO)
```typescript
TransportOrder {
  to_id: UUID
  to_number: string (auto-generated)
  tr_id: UUID
  quantity: Decimal
  vehicle_type_required: string
  fleet_type: enum [OwnFleet, VendorContractual, VendorNonContractual]
  assigned_to_type: enum [TDO, Vendor]
  assigned_to_id: UUID (nullable)
  status: enum [Pending, Assigned, Bidding, InProgress, Completed, Cancelled]
  created_at: DateTime
  tenant_id: UUID
}
```

### Trip
```typescript
Trip {
  trip_id: UUID
  trip_number: string (auto-generated)
  to_id: UUID
  vehicle_id: UUID
  driver_id: UUID
  helper_id: UUID (nullable)
  current_state: enum [Created, Assigned, Dispatched, GateInSource, ScaleIn, Loading, ...]
  state_history: JSON (array of state transitions with timestamps)
  gps_data: JSON (lat, lng, timestamp array)
  incident_log: JSON (nullable)
  pod_data: JSON (signature, photo, timestamp)
  trip_cost: Decimal (nullable, calculated on closure)
  created_at: DateTime
  closed_at: DateTime (nullable)
  tenant_id: UUID
}
```

---

## API Endpoints

### Product Requisition
```typescript
POST /api/v1/product-requisitions
GET /api/v1/product-requisitions
GET /api/v1/product-requisitions/{pr_id}
PUT /api/v1/product-requisitions/{pr_id}/approve
PUT /api/v1/product-requisitions/{pr_id}/reject
```

### Transport Requisition
```typescript
GET /api/v1/transport-requisitions
GET /api/v1/transport-requisitions/{tr_id}
PUT /api/v1/transport-requisitions/{tr_id}/assign-planner
POST /api/v1/transport-requisitions/{tr_id}/create-to
```

### Transport Order
```typescript
POST /api/v1/transport-orders
GET /api/v1/transport-orders
GET /api/v1/transport-orders/{to_id}
PUT /api/v1/transport-orders/{to_id}/assign-fleet
PUT /api/v1/transport-orders/{to_id}/assign-vehicle
POST /api/v1/transport-orders/{to_id}/create-trip
```

### Trip Management
```typescript
GET /api/v1/trips
GET /api/v1/trips/{trip_id}
PUT /api/v1/trips/{trip_id}/update-state
POST /api/v1/trips/{trip_id}/log-incident
POST /api/v1/trips/{trip_id}/capture-pod
PUT /api/v1/trips/{trip_id}/close
GET /api/v1/trips/{trip_id}/cost-breakdown
```

---

## Business Rules

### PR → TR Generation
1. Approved PR auto-generates TR with same product, quantity, source, destination
2. TR inherits urgency from PR
3. TR assigned to transport planner based on route or manually

### TR → TO Creation
1. Single TR can spawn multiple TOs (quantity split)
2. Sum of TO quantities must equal TR quantity
3. Each TO can have different vehicle type based on quantity
4. Fleet decision (own vs vendor) made per TO

### TO → Trip Creation
1. Trip created only after TO has assigned vehicle/driver
2. Own fleet: Direct assignment
3. Vendor contractual: Vendor assigns vehicle/driver
4. Vendor non-contractual: After bid acceptance

### Trip State Transitions
1. State transitions must follow valid sequence (no skipping)
2. Each transition logged with user, timestamp, GPS location
3. QC Pass required before trip closure
4. POD required before trip closure

---

## Implementation Priority

**Phase 1 - Critical**:
1. Product Requisition Creation & Approval (US-010, US-011, US-012) ⭐⭐⭐
2. Stock & Capacity Validation (US-013, US-014) ⭐⭐⭐
3. TR Assessment & Planner Assignment (US-015) ⭐⭐⭐
4. Fleet Availability Check (US-016) ⭐⭐⭐
5. TO Creation (US-017, US-018) ⭐⭐⭐
6. TO Execution - Own & Vendor Fleet (US-019, US-020) ⭐⭐⭐
7. Trip Lifecycle Management (US-021) ⭐⭐⭐
8. Incident & Partial Delivery (US-022, US-023) ⭐⭐
9. Trip Closure & POD (US-025) ⭐⭐⭐

---

## Testing Scenarios

### Product Requisition
- Create FG requisition and verify distribution approval workflow
- Create port requisition and verify procurement approval + CNF
- Approve PR and verify auto TR generation
- Reject PR with comments

### Transport Requisition
- Assign TR to planner and verify queue update
- Create multiple TOs from single TR with quantity split
- Validate fleet availability before TO creation

### Transport Order
- Create TO for own fleet and assign vehicle/driver
- Create TO for vendor and trigger bidding
- Cancel TO and verify trip cancellation

### Trip Management
- Execute complete trip lifecycle from creation to closure
- Log incident and verify state change
- Handle partial delivery and create follow-up TO
- Capture POD and close trip

---

## Quick Links

- **[Module Index](../README.md)** - Back to module specifications index
- **[Complete Index](../INDEX.md)** - Full content index
- **[Source PRD](../../../01-source/01-prd/PRD_DFMS_v1.0.md)** - Original PRD document
- **[User Stories](../../04-phase-backlog/phase-1/user-stories/)** - Implementation stories

---

**Last Updated**: 2026-02-26  
**Status**: Complete  
**Previous Module**: [02-master-data/](../02-master-data/README.md) - Master Data Management  
**Next Module**: [04-operations-support/](../04-operations-support/README.md) - Operations Support
