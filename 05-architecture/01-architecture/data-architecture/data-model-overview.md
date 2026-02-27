# DFMS Data Model Overview

> High-level data entities and relationships

**Status**: 🚧 Draft  
**Last Updated**: February 13, 2026

---

## 📋 Overview

This document provides a high-level overview of DFMS data entities. **Note**: Detailed schemas, field definitions, and constraints are in implementation repositories and the [Data Dictionary](../../../business-context/05-data-reference/data-dictionary.md).

---

## 🗂️ Core Data Entities

### 1. **Vehicle**
**Owner**: Master Data Management  
**Purpose**: Fleet vehicles (own and vendor)

**Key Attributes**:
- Registration number
- Type (covered van, open truck, etc.)
- Capacity
- Status (available, active, maintenance)
- Owner type (own/vendor)

**Relationships**:
- → Driver (assigned driver)
- → Vendor (if vendor-owned)
- → Trips (trip history)

---

### 2. **Driver**
**Owner**: Master Data Management  
**Purpose**: Driver information

**Key Attributes**:
- Name, contact
- License details
- Status (available, assigned, on-leave)
- Rating

**Relationships**:
- → Vehicle (current assignment)
- → Trips (trip history)

---

### 3. **Product**
**Owner**: Master Data Management  
**Purpose**: Products being transported

**Key Attributes**:
- Product name
- Category
- Unit of measure
- Handling requirements

**Relationships**:
- → Product Requisitions
- → Transport Requests

---

### 4. **POI (Point of Interest)**
**Owner**: Master Data Management  
**Purpose**: Locations (factories, warehouses, delivery points)

**Key Attributes**:
- Name, address
- Location (lat/long)
- Type (factory, warehouse, CFS, customer)
- Contact details

**Relationships**:
- → Transport Requests (origin/destination)
- → Operations (gate entries)

---

### 5. **Product Requisition**
**Owner**: Product Requisition Management  
**Purpose**: Demand for product transport

**Key Attributes**:
- Requisition number
- Product, quantity
- Origin, destination
- Approval status
- Requested date

**Relationships**:
- → Product
- → POI (origin/destination)
- → Transport Request (generated TR)

---

### 6. **Transport Request (TR)**
**Owner**: Transport Management  
**Purpose**: Request for transport

**Key Attributes**:
- TR number
- Product, quantity
- Origin, destination
- Vehicle type required
- Priority
- Status

**Relationships**:
- → Product Requisition
- → Transport Order (generated TO)

---

### 7. **Transport Order (TO)**
**Owner**: Transport Management  
**Purpose**: Assigned transport order

**Key Attributes**:
- TO number
- TR reference
- Vehicle, driver assigned
- Fleet type (own/vendor)
- Scheduled date
- Status

**Relationships**:
- → Transport Request
- → Vehicle
- → Driver
- → Vendor (if vendor fleet)
- → Trip (execution)

---

### 8. **Trip**
**Owner**: Transport Management  
**Purpose**: Actual trip execution

**Key Attributes**:
- Trip number
- TO reference
- Start/end time
- Odometer readings
- Distance traveled
- Status (pending, in-transit, completed)

**Relationships**:
- → Transport Order
- → Vehicle
- → Driver
- → Operations (gate, weighing, loading)
- → QC Inspections
- → Trip Cost

---

### 9. **Vendor**
**Owner**: Vendor Management  
**Purpose**: Third-party fleet providers

**Key Attributes**:
- Vendor name
- Contact details
- Type (contractual/non-contractual)
- Rating
- Status

**Relationships**:
- → Vehicles (vendor fleet)
- → Vendor Bids
- → Transport Orders (assignments)
- → Invoices

---

### 10. **QC Inspection**
**Owner**: Quality Control  
**Purpose**: Quality inspection records

**Key Attributes**:
- Inspection number
- Trip reference
- Inspection type
- Result (pass/fail)
- Inspector
- Photos/videos

**Relationships**:
- → Trip
- → QC Samples
- → QC Lab Tests

---

## 🔄 Entity Relationship Diagram (High-Level)

```
Product Requisition
        ↓
Transport Request (TR)
        ↓
Transport Order (TO) ← Vendor Bid
        ↓
      Trip ← Vehicle
        ↓    ← Driver
        ├─→ Operations (Gate, Weighing, Loading)
        ├─→ QC Inspection
        └─→ Trip Cost → Invoice
```

---

## 🏢 Multi-Tenancy Strategy

### Option 1: Schema per Tenant (Recommended for Phase 1)

```sql
-- Each tenant gets own schema
CREATE SCHEMA tenant_nourish;
CREATE SCHEMA tenant_abc_logistics;

-- Tables in tenant schema
tenant_nourish.vehicles
tenant_nourish.drivers
tenant_nourish.trips
...
```

**Pros**:
- ✅ Strong isolation
- ✅ Easy backup/restore per tenant
- ✅ Simple to understand

**Cons**:
- ⚠️ Schema management overhead
- ⚠️ Migrations run per schema

---

### Option 2: Row-Level Security (RLS)

```sql
-- Single schema with tenant_id column
CREATE TABLE vehicles (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    registration_number VARCHAR,
    ...
);

-- RLS policy
CREATE POLICY tenant_isolation ON vehicles
    USING (tenant_id = current_setting('app.tenant_id')::UUID);
```

**Pros**:
- ✅ Single schema
- ✅ Easier migrations
- ✅ Better for reporting across tenants

**Cons**:
- ⚠️ Must ensure tenant_id in all queries
- ⚠️ Risk of data leakage if misconfigured

---

## 📊 Data Ownership by Module

| Entity | Owner Module | Access Pattern |
|--------|--------------|----------------|
| Vehicle | Master Data | CRUD via API, Events for changes |
| Driver | Master Data | CRUD via API, Events for changes |
| Helper | Master Data | CRUD via API |
| Product | Master Data | CRUD via API |
| POI | Master Data | CRUD via API |
| Vendor (Master) | Master Data | CRUD via API |
| Product Requisition | Product Requisition | CRUD via API, Events for approval |
| Transport Request | Transport | CRUD via API, Events for lifecycle |
| Transport Order | Transport | CRUD via API, Events for lifecycle |
| Trip | Transport | CRUD via API, Events for lifecycle |
| Vendor Bid | Vendor | CRUD via API, Events for acceptance |
| Vendor Invoice | Vendor | CRUD via API |
| Gate Entry/Exit | Operations | CRUD via API, Events |
| Weighing Record | Operations | CRUD via API, Events |
| Loading/Unloading | Operations | CRUD via API, Events |
| QC Inspection | Quality Control | CRUD via API, Events |
| Trip Cost | Trip Costing | CRUD via API, Events |
| Report | Reporting | Read-only access to all data |

---

## 🔐 Data Access Patterns

### 1. **Direct Ownership** (CRUD)
Module has full CRUD access to its own data.

```python
# Transport module owns trips
trip = Trip.objects.create(...)
trip.status = 'in_transit'
trip.save()
```

---

### 2. **Read via API** (Reference Data)
Module reads other module's data via API.

```python
# Transport module reads vehicle data
vehicle = master_data_api.get_vehicle(vehicle_id)
```

---

### 3. **Event Notification** (State Changes)
Module publishes events when data changes.

```python
# Transport module publishes event
event = TripCompleted(trip_id=trip.id, ...)
event_bus.publish(event)
```

---

### 4. **Aggregated Reporting** (Read Replicas)
Reporting module reads from database replicas.

```python
# Reporting module queries read replica
trips = Trip.objects.using('read_replica').filter(...)
```

---

## 🔗 Related Documents

- [Data Dictionary](../../../business-context/05-data-reference/data-dictionary.md) - Detailed entity definitions
- [Data Flow](./data-flow.md) - How data moves
- [Module Boundaries](../modules/module-boundaries.md) - Module data ownership
- [Container View](../container-view.md) - Database container

---

**Document Status**: 🚧 Draft  
**Next Steps**: Define detailed schemas in implementation repos  
**Contact**: Md. Mahfuzur Rahman (Mahfuzur.rahman@brainstation-23.com)

