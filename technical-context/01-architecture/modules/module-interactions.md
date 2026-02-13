# DFMS Module Interactions

> How modules communicate and collaborate

**Status**: 🚧 Draft  
**Last Updated**: February 13, 2026

---

## 📋 Overview

This document describes how the 12 DFMS modules interact with each other. Modules communicate through two primary patterns:
1. **Synchronous Communication** - REST API calls for immediate responses
2. **Asynchronous Communication** - Events for loosely coupled interactions

---

## 🔄 Communication Patterns

### Pattern 1: Synchronous (REST APIs)

**When to Use**:
- Need immediate response
- Read operations
- Simple CRUD operations
- User-initiated actions

**Example**:
```python
# Transport module needs vehicle details from Master Data
from master_data.services import VehicleService

vehicle_service = VehicleService()
vehicle = vehicle_service.get_vehicle(vehicle_id)
```

**Pros**:
- ✅ Immediate response
- ✅ Simple to implement
- ✅ Easy to debug

**Cons**:
- ⚠️ Tight coupling
- ⚠️ Synchronous blocking
- ⚠️ Cascading failures

---

### Pattern 2: Asynchronous (Events)

**When to Use**:
- Notify other modules of state changes
- Trigger background processing
- Loosely coupled communication
- Multiple consumers for same event

**Example**:
```python
# Transport module publishes event
from events import event_bus, TransportOrderCreated

event = TransportOrderCreated(
    to_id=to.id,
    to_number=to.to_number,
    tr_id=to.tr_id,
    vehicle_id=to.vehicle_id,
    scheduled_date=to.scheduled_date
)
event_bus.publish(event)

# Vendor module subscribes
@event_bus.subscribe(TransportOrderCreated)
def notify_vendors(event):
    # Send notifications to eligible vendors
    vendor_service.notify_vendors_of_opportunity(event.to_id)
```

**Pros**:
- ✅ Loose coupling
- ✅ Multiple consumers
- ✅ Asynchronous processing
- ✅ Audit trail

**Cons**:
- ⚠️ Eventual consistency
- ⚠️ More complex debugging
- ⚠️ Event versioning needed

---

## 📊 Module Interaction Matrix

| From Module → To Module | Communication Type | Purpose |
|-------------------------|-------------------|---------|
| **Product Requisition → Master Data** | Sync (API) | Get product, POI details |
| **Product Requisition → Transport** | Event | Notify of approved requisition |
| **Transport → Master Data** | Sync (API) | Get vehicle, driver, POI details |
| **Transport → Vendor** | Event | Notify of TO creation |
| **Transport → Operations** | Event | Notify of trip start/complete |
| **Transport → GPS Provider** | Sync (API) | Get vehicle location |
| **Vendor → Transport** | Sync (API) | Submit bid, get TO details |
| **Vendor → Trip Costing** | Sync (API) | Submit invoice |
| **Operations → Transport** | Sync (API) | Update trip status |
| **Operations → QC** | Event | Notify of unloading complete |
| **QC → Transport** | Event | Notify of inspection complete |
| **QC → File Storage** | Sync (API) | Upload photos/videos |
| **Fleet → Master Data** | Sync (API) | Get vehicle details |
| **Fleet → Transport** | Sync (API) | Get trip history |
| **Fuel → Fleet** | Sync (API) | Get vehicle details |
| **Fuel → Transport** | Sync (API) | Get trip details |
| **Trip Costing → Transport** | Sync (API) | Get trip details |
| **Trip Costing → Operations** | Sync (API) | Get weighing data |
| **Trip Costing → Vendor** | Sync (API) | Get vendor invoice |
| **Trip Costing → ERP** | Sync (API) | Sync financial data |
| **Reporting → All Modules** | Sync (API) | Read data for reports |
| **Mobile → Transport** | Sync (API) | Get trips, update status |
| **Mobile → QC** | Sync (API) | Get inspections, submit |
| **Mobile → Vendor** | Sync (API) | Get bids, submit |
| **Notifications → All Modules** | Event | Listen to all events |

---

## 🔍 Detailed Interaction Flows

### Flow 1: Product Requisition to Transport Order

```
1. Product Requisition Module
   ├─ User creates PR
   ├─ Approval workflow
   └─ PR approved
       │
       ├─ Publishes: ProductRequisitionApproved
       │
2. Transport Module (subscribes)
   ├─ Receives ProductRequisitionApproved
   ├─ Creates Transport Request (TR)
   ├─ Calls Master Data API for product/POI details
   └─ TR created
       │
       ├─ Publishes: TransportRequestCreated
       │
3. Transport Module (continued)
   ├─ User creates Transport Order (TO)
   ├─ Assigns vehicle/driver
   ├─ Calls Master Data API for vehicle/driver details
   └─ TO created
       │
       ├─ Publishes: TransportOrderCreated
       │
4. Vendor Module (subscribes)
   ├─ Receives TransportOrderCreated
   └─ Notifies eligible vendors
```

---

### Flow 2: Trip Execution with Operations & QC

```
1. Transport Module
   ├─ Driver starts trip (mobile app)
   └─ Trip started
       │
       ├─ Publishes: TripStarted
       │
2. Operations Module (subscribes)
   ├─ Receives TripStarted
   ├─ Monitors for gate-in
   ├─ Gate-in completed
   │   └─ Publishes: GateInCompleted
   │
   ├─ Weighing completed
   │   └─ Publishes: WeighingCompleted
   │
   ├─ Unloading started
   │   └─ Publishes: UnloadingStarted
   │
   └─ Unloading completed
       │
       ├─ Publishes: UnloadingCompleted
       │
3. QC Module (subscribes)
   ├─ Receives UnloadingCompleted
   ├─ Creates QC inspection
   ├─ QC supervisor performs inspection (mobile app)
   ├─ Uploads photos/videos to File Storage
   └─ Inspection completed
       │
       ├─ Publishes: QCInspectionCompleted
       │
4. Transport Module (subscribes)
   ├─ Receives QCInspectionCompleted
   ├─ Updates trip status
   └─ Trip completed
       │
       ├─ Publishes: TripCompleted
       │
5. Trip Costing Module (subscribes)
   ├─ Receives TripCompleted
   ├─ Calls Transport API for trip details
   ├─ Calls Operations API for weighing data
   ├─ Calculates trip cost
   └─ Publishes: TripCostCalculated
```

---

### Flow 3: Vendor Bidding & Assignment

```
1. Transport Module
   ├─ TO created for vendor fleet
   └─ Publishes: TransportOrderCreated
       │
2. Vendor Module (subscribes)
   ├─ Receives TransportOrderCreated
   ├─ Notifies eligible vendors (SMS/Push)
   └─ Vendors submit bids (mobile/web)
       │
3. Vendor Module (continued)
   ├─ User reviews bids
   ├─ Accepts winning bid
   └─ Publishes: VendorBidAccepted
       │
4. Transport Module (subscribes)
   ├─ Receives VendorBidAccepted
   ├─ Assigns vendor to TO
   ├─ Creates trip
   └─ Publishes: TripCreated
       │
5. Mobile Module (subscribes)
   ├─ Receives TripCreated
   └─ Sends push notification to vendor driver
```

---

### Flow 4: Real-time Location Tracking

```
1. Mobile Module (Driver App)
   ├─ Driver starts trip
   ├─ GPS updates every 30-60 seconds
   └─ Calls Transport API: POST /trips/{id}/update-location
       │
2. Transport Module
   ├─ Receives location update
   ├─ Stores in Database
   ├─ Updates Cache (Redis) for real-time access
   └─ Publishes: TripLocationUpdated
       │
3. Operations Module (Command Center)
   ├─ Reads from Cache (Redis) for real-time dashboard
   └─ Displays live vehicle locations
       │
4. Notifications Module (subscribes)
   ├─ Receives TripLocationUpdated
   ├─ Checks geofence rules
   └─ Sends alerts if vehicle off-route
```

---

### Flow 5: Reporting & Analytics

```
1. Reporting Module
   ├─ User requests trip report
   ├─ Calls Transport API: GET /trips (with filters)
   ├─ Calls Operations API: GET /weighing-records
   ├─ Calls QC API: GET /inspections
   ├─ Calls Costing API: GET /trip-costs
   ├─ Aggregates data
   └─ Generates report
       │
2. Background Worker (Celery)
   ├─ Receives report generation task
   ├─ Queries Database (read replica)
   ├─ Generates PDF/Excel
   ├─ Stores in File Storage (S3)
   └─ Publishes: ReportGenerated
       │
3. Notifications Module (subscribes)
   ├─ Receives ReportGenerated
   └─ Sends email with report link
```

---

## 🎯 Communication Best Practices

### 1. **Use Events for State Changes**

```python
# ✅ GOOD: Publish event when state changes
def approve_transport_request(tr_id):
    tr = TransportRequest.objects.get(id=tr_id)
    tr.status = 'approved'
    tr.save()
    
    # Publish event
    event = TransportRequestApproved(
        tr_id=tr.id,
        tr_number=tr.tr_number,
        approved_by=current_user.id,
        approved_at=timezone.now()
    )
    event_bus.publish(event)
    
    return tr

# ❌ BAD: Directly call other modules
def approve_transport_request(tr_id):
    tr = TransportRequest.objects.get(id=tr_id)
    tr.status = 'approved'
    tr.save()
    
    # Don't do this - tight coupling
    from vendor.services import VendorService
    VendorService().notify_vendors(tr.id)
    
    return tr
```

---

### 2. **Use APIs for Data Retrieval**

```python
# ✅ GOOD: Call API for data
def create_transport_order(tr_id, vehicle_id):
    # Get vehicle details via API
    vehicle = master_data_api.get_vehicle(vehicle_id)
    
    to = TransportOrder.objects.create(
        tr_id=tr_id,
        vehicle_id=vehicle_id,
        vehicle_type=vehicle.type,
        vehicle_capacity=vehicle.capacity
    )
    return to

# ❌ BAD: Direct database access
def create_transport_order(tr_id, vehicle_id):
    # Don't access other module's database directly
    from master_data.models import Vehicle
    vehicle = Vehicle.objects.get(id=vehicle_id)
    
    to = TransportOrder.objects.create(...)
    return to
```

---

### 3. **Handle Event Failures Gracefully**

```python
# ✅ GOOD: Handle failures, use retry
@event_bus.subscribe(TransportOrderCreated)
@retry(max_attempts=3, backoff=exponential)
def notify_vendors(event):
    try:
        vendors = get_eligible_vendors(event.to_id)
        for vendor in vendors:
            send_notification(vendor, event)
    except Exception as e:
        logger.error(f"Failed to notify vendors: {e}")
        # Event will be retried
        raise

# ❌ BAD: Fail silently
@event_bus.subscribe(TransportOrderCreated)
def notify_vendors(event):
    try:
        vendors = get_eligible_vendors(event.to_id)
        for vendor in vendors:
            send_notification(vendor, event)
    except Exception:
        pass  # Silent failure - bad!
```

---

### 4. **Version Events for Compatibility**

```python
# ✅ GOOD: Versioned events
class TransportOrderCreatedV1(Event):
    version = "1.0"
    to_id: str
    to_number: str
    tr_id: str

class TransportOrderCreatedV2(Event):
    version = "2.0"
    to_id: str
    to_number: str
    tr_id: str
    estimated_cost: Decimal  # New field

# Consumers can handle both versions
@event_bus.subscribe(TransportOrderCreatedV1, TransportOrderCreatedV2)
def handle_to_created(event):
    if event.version == "2.0":
        # Use new field
        cost = event.estimated_cost
    else:
        # Fallback for v1
        cost = None
```

---

## 🔐 Security Considerations

### API Calls Between Modules

**Authentication**:
- Internal service-to-service calls use service tokens
- User-initiated calls use user JWT tokens

**Authorization**:
- Module APIs check permissions
- Tenant isolation enforced at every call

**Example**:
```python
# Service-to-service call
headers = {
    'Authorization': f'Bearer {service_token}',
    'X-Tenant-ID': tenant_id
}
response = requests.get(f'{master_data_url}/vehicles/{vehicle_id}', headers=headers)
```

---

## 📈 Performance Optimization

### 1. **Cache Frequently Accessed Data**

```python
# Cache master data (vehicles, drivers)
@cache_result(ttl=3600)  # 1 hour
def get_vehicle(vehicle_id):
    return master_data_api.get_vehicle(vehicle_id)
```

### 2. **Batch API Calls**

```python
# ✅ GOOD: Batch call
vehicle_ids = [to.vehicle_id for to in transport_orders]
vehicles = master_data_api.get_vehicles_batch(vehicle_ids)

# ❌ BAD: N+1 calls
for to in transport_orders:
    vehicle = master_data_api.get_vehicle(to.vehicle_id)  # N calls!
```

### 3. **Use Async for Independent Operations**

```python
# ✅ GOOD: Parallel calls
import asyncio

async def get_trip_details(trip_id):
    trip, operations, qc = await asyncio.gather(
        transport_api.get_trip(trip_id),
        operations_api.get_operations(trip_id),
        qc_api.get_inspections(trip_id)
    )
    return combine_data(trip, operations, qc)
```

---

## 🔗 Related Documents

- [Module Boundaries](./module-boundaries.md) - Module definitions
- [Container View](../container-view.md) - Technical containers
- [Integration Patterns](../integration/integration-patterns.md) - External integrations
- [Design Principles](../../00-overview/design-principles.md) - Event-driven architecture

---

**Document Status**: 🚧 Draft  
**Next Steps**: Review with team, refine patterns  
**Contact**: Md. Mahfuzur Rahman (Mahfuzur.rahman@brainstation-23.com)

