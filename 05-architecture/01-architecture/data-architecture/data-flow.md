# DFMS Data Flow

> How data moves through the system

**Status**: 🚧 Draft  
**Last Updated**: February 13, 2026

---

## 📋 Overview

This document describes how data flows through DFMS, from creation to consumption. Understanding data flow helps identify:
- Data dependencies
- Integration points
- Performance bottlenecks
- Data consistency requirements

---

## 🔄 Primary Data Flows

### Flow 1: Product Requisition → Trip Execution

```
1. Product Requisition Created
   ├─ User: Creates PR in web portal
   ├─ Data: Product, quantity, origin, destination
   └─ Storage: product_requisitions table

2. Approval Workflow
   ├─ Distribution Manager: Reviews and approves
   ├─ Procurement Manager: Reviews and approves
   └─ Status: draft → pending → approved

3. Transport Request Created
   ├─ System: Auto-generates TR from approved PR
   ├─ Data: Copies PR data + adds vehicle type, priority
   └─ Storage: transport_requests table

4. Transport Order Created
   ├─ Logistics Coordinator: Creates TO from TR
   ├─ Data: Assigns vehicle, driver, scheduled date
   ├─ API Calls: 
   │   ├─ GET /vehicles (check availability)
   │   └─ GET /drivers (check availability)
   └─ Storage: transport_orders table

5. Trip Created
   ├─ System: Auto-creates trip from TO
   ├─ Data: Trip number, TO reference, vehicle, driver
   └─ Storage: trips table

6. Trip Execution
   ├─ Driver: Starts trip (mobile app)
   ├─ Data: Start time, odometer, location
   ├─ Updates: Real-time location updates (GPS)
   └─ Storage: trips table + trip_locations table (Redis cache)

7. Operations
   ├─ Gate-in: Records entry
   ├─ Weighing: Records weight
   ├─ Loading: Records loading details
   └─ Storage: gate_entries, weighing_records, loading_operations tables

8. Trip Completion
   ├─ Driver: Completes trip (mobile app)
   ├─ Data: End time, odometer, final location
   └─ Storage: trips table (status = completed)
```

**Data Created**: 7 entities across 5 modules  
**API Calls**: 10+ calls  
**Events Published**: 15+ events

---

### Flow 2: Vendor Bidding → Assignment

```
1. TO Created for Vendor Fleet
   ├─ Logistics Coordinator: Creates TO (fleet_type = vendor)
   ├─ Event: TransportOrderCreated
   └─ Storage: transport_orders table

2. Vendor Notification
   ├─ Vendor Module: Receives TransportOrderCreated event
   ├─ Logic: Identifies eligible vendors
   ├─ SMS/Push: Notifies vendors of opportunity
   └─ Storage: notifications table

3. Vendor Bids
   ├─ Vendors: Submit bids (mobile app/web)
   ├─ Data: Bid amount, vehicle details, driver details
   └─ Storage: vendor_bids table

4. Bid Acceptance
   ├─ User: Reviews and accepts bid
   ├─ Event: VendorBidAccepted
   └─ Storage: vendor_bids table (status = accepted)

5. Vendor Assignment
   ├─ Transport Module: Receives VendorBidAccepted event
   ├─ Updates: Assigns vendor to TO
   └─ Storage: transport_orders table (vendor_id assigned)

6. Trip Creation
   ├─ System: Creates trip with vendor vehicle/driver
   └─ Storage: trips table
```

---

### Flow 3: QC Inspection → Trip Costing

```
1. Unloading Complete
   ├─ Operations: Marks unloading complete
   ├─ Event: UnloadingCompleted
   └─ Storage: unloading_operations table

2. QC Inspection Created
   ├─ QC Module: Receives UnloadingCompleted event
   ├─ System: Auto-creates QC inspection
   └─ Storage: qc_inspections table

3. QC Execution
   ├─ QC Supervisor: Performs inspection (mobile app)
   ├─ Data: Inspection results, photos, videos
   ├─ File Upload: Photos/videos to S3
   └─ Storage: qc_inspections table + S3

4. QC Completion
   ├─ QC Supervisor: Submits inspection
   ├─ Event: QCInspectionCompleted
   └─ Storage: qc_inspections table (status = completed)

5. Trip Cost Calculation
   ├─ Costing Module: Receives QCInspectionCompleted event
   ├─ API Calls:
   │   ├─ GET /trips/{id} (trip details)
   │   ├─ GET /weighing-records (weight data)
   │   └─ GET /vendor-bids/{id} (vendor rate)
   ├─ Calculation: Distance × rate + additional charges
   └─ Storage: trip_costs table

6. Invoice Generation
   ├─ System: Generates invoice
   ├─ Event: InvoiceGenerated
   └─ Storage: invoices table

7. ERP Sync
   ├─ Background Worker: Syncs to ERP
   ├─ API Call: POST to ERP system
   └─ Storage: erp_sync_logs table
```

---

## 📊 Data Flow Patterns

### Pattern 1: Create → Approve → Execute

**Use Cases**: Product Requisition, Transport Request

```
Create (draft) → Submit → Approve → Execute
```

**Data States**:
- draft → pending_approval → approved → in_progress → completed

---

### Pattern 2: Request → Bid → Assign

**Use Cases**: Vendor bidding

```
Request → Notify → Bid → Review → Accept → Assign
```

**Data States**:
- open → bidding → bid_review → assigned

---

### Pattern 3: Trigger → Execute → Complete

**Use Cases**: Operations (gate, weighing, loading)

```
Trigger (trip arrival) → Execute → Record → Complete
```

**Data States**:
- pending → in_progress → completed

---

## 🔄 Data Synchronization

### Real-Time Sync

**GPS Location Updates**:
```
Mobile App (Driver) 
  → API Server (every 30-60s)
  → Database (trips table)
  → Cache (Redis)
  → WebSocket (real-time dashboard)
```

**Frequency**: Every 30-60 seconds  
**Volume**: ~500-1000 updates/minute (for 100 active trips)

---

### Batch Sync

**ERP Financial Sync**:
```
Trip Costing Module
  → Background Worker (Celery)
  → ERP API (batch)
  → ERP System
```

**Frequency**: Hourly or daily  
**Volume**: 100-500 invoices/batch

---

### Event-Driven Sync

**Module-to-Module Updates**:
```
Module A (state change)
  → Event Bus (RabbitMQ/SQS)
  → Module B (event consumer)
  → Module B Database
```

**Frequency**: Real-time (event-driven)  
**Volume**: 1000-5000 events/day

---

## 📈 Data Volume Estimates

### Daily Transaction Volume (Launch Client - Nourish)

| Entity | Daily Volume | Growth Rate |
|--------|--------------|-------------|
| Product Requisitions | 50-100 | 10% monthly |
| Transport Requests | 50-100 | 10% monthly |
| Transport Orders | 50-100 | 10% monthly |
| Trips | 500-1000 | 10% monthly |
| GPS Location Updates | 500K-1M | Linear with trips |
| Gate Entries/Exits | 1000-2000 | Linear with trips |
| Weighing Records | 1000-2000 | Linear with trips |
| QC Inspections | 500-1000 | Linear with trips |
| Photos/Videos | 2000-5000 | Linear with inspections |
| Invoices | 50-100 | Linear with trips |

---

## 🔐 Data Consistency

### Strong Consistency (Within Module)

**Use Cases**: CRUD operations within a module

```python
# Transaction ensures consistency
with transaction.atomic():
    trip = Trip.objects.create(...)
    trip_event = TripEvent.objects.create(trip=trip, ...)
    # Both succeed or both fail
```

---

### Eventual Consistency (Across Modules)

**Use Cases**: Event-driven updates

```python
# Module A publishes event
event_bus.publish(TripCompleted(...))

# Module B processes event (eventually)
@event_bus.subscribe(TripCompleted)
def calculate_cost(event):
    # Processes asynchronously
    # May have delay (seconds to minutes)
    pass
```

**Acceptable Delay**: Seconds to minutes  
**Retry Strategy**: Exponential backoff (3 attempts)

---

## 🗄️ Data Retention

| Data Type | Retention Period | Archive Strategy |
|-----------|------------------|------------------|
| **Active Trips** | Current + 3 months | Keep in primary DB |
| **Completed Trips** | 2 years | Archive to cold storage after 1 year |
| **QC Photos/Videos** | 2 years | Move to Glacier after 6 months |
| **Audit Logs** | 7 years | Archive to cold storage after 1 year |
| **Reports** | 1 year | Delete after 1 year |
| **GPS Locations** | 6 months | Aggregate and archive |

---

## 🔗 Related Documents

- [Data Model Overview](./data-model-overview.md) - Entity definitions
- [Module Interactions](../modules/module-interactions.md) - How modules communicate
- [Container View](../container-view.md) - Data storage containers
- [Integration Patterns](../integration/integration-patterns.md) - External data flows

---

**Document Status**: 🚧 Draft  
**Next Steps**: Monitor actual volumes, adjust estimates  
**Contact**: Md. Mahfuzur Rahman (Mahfuzur.rahman@brainstation-23.com)

