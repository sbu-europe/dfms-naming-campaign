# DFMS Modules

> Module organization and boundaries

---

## 📋 Overview

DFMS is organized into **12 logical modules**, each responsible for a specific business capability. This modular organization enables:
- Clear separation of concerns
- Independent development and testing
- Easier maintenance and evolution
- Future microservices migration path

---

## 📁 Documents in This Section

### **[Module Boundaries](./module-boundaries.md)**
Defines the 12 DFMS modules, their responsibilities, and boundaries:
- Module purpose and scope
- Data ownership
- API surface
- Dependencies

### **[Module Interactions](./module-interactions.md)**
Describes how modules communicate:
- Synchronous communication (REST APIs)
- Asynchronous communication (Events)
- Data sharing patterns
- Integration points

---

## 🎯 Module Principles

### 1. **Single Responsibility**
Each module focuses on one business capability.

### 2. **Data Ownership**
Each module owns its data and exposes it via APIs.

### 3. **Loose Coupling**
Modules communicate via well-defined interfaces.

### 4. **High Cohesion**
Related functionality is grouped within modules.

### 5. **Independent Evolution**
Modules can evolve independently (within contract constraints).

---

## 📦 Module List

| # | Module | Purpose | Phase |
|---|--------|---------|-------|
| 1 | **Master Data Management** | Manage vehicles, drivers, vendors, POIs, products | Phase 1 |
| 2 | **Product Requisition** | Handle product requisitions and approvals | Phase 1 |
| 3 | **Transport Management** | Manage TRs, TOs, and trip lifecycle | Phase 1 |
| 4 | **Vendor Management** | Vendor onboarding, bidding, performance | Phase 1 |
| 5 | **Operations Management** | Gate, scaling, command center, loading/unloading | Phase 1 |
| 6 | **Quality Control** | Inspections, sampling, lab testing | Phase 1 |
| 7 | **Fleet Management** | Fleet health, maintenance, utilization | Phase 2 |
| 8 | **Fuel Management** | Fuel tracking and performance monitoring | Phase 2 |
| 9 | **Trip Costing** | Cost calculation, billing, ERP integration | Phase 1 |
| 10 | **Reporting & Analytics** | Dashboards, reports, KPIs | Phase 1-3 |
| 11 | **Mobile Applications** | Driver, QC, Vendor mobile interfaces | Phase 1 |
| 12 | **Notifications & Alerts** | System notifications and alerts | Phase 1-3 |

---

## 🔗 Module Dependencies

### **Core Modules** (No dependencies)
- Master Data Management

### **Foundation Modules** (Depend on Core)
- Product Requisition → Master Data
- Transport Management → Master Data, Product Requisition

### **Operational Modules** (Depend on Foundation)
- Vendor Management → Transport Management
- Operations Management → Transport Management
- Quality Control → Operations Management
- Fleet Management → Master Data, Transport Management
- Fuel Management → Fleet Management, Transport Management
- Trip Costing → Transport Management, Operations Management

### **Cross-Cutting Modules** (Used by all)
- Reporting & Analytics
- Mobile Applications
- Notifications & Alerts

---

## 📊 Module Architecture Pattern

Each module follows a consistent structure:

```
module_name/
├── models/           # Data models (Django models)
├── serializers/      # API serializers (DRF)
├── views/            # API views (DRF ViewSets)
├── services/         # Business logic
├── events/           # Domain events
├── tasks/            # Celery tasks
├── permissions/      # Access control
├── tests/            # Unit & integration tests
└── urls.py           # URL routing
```

---

## 🔄 Communication Patterns

### **Synchronous (REST APIs)**
```python
# Module A calls Module B's API
from transport.services import TransportService

transport_service = TransportService()
to = transport_service.get_transport_order(to_id)
```

### **Asynchronous (Events)**
```python
# Module A publishes event
from events import event_bus, TransportOrderCreated

event = TransportOrderCreated(to_id=to_id, ...)
event_bus.publish(event)

# Module B subscribes to event
@event_bus.subscribe(TransportOrderCreated)
def handle_to_created(event):
    # Process event
    pass
```

---

## 🔗 Related Documents

- [Module Boundaries](./module-boundaries.md) - Detailed module definitions
- [Module Interactions](./module-interactions.md) - Communication patterns
- [Container View](../container-view.md) - Technical containers
- [Integration Patterns](../integration/integration-patterns.md) - Integration approaches

---

**Last Updated**: February 13, 2026  
**Status**: 🚧 Draft  
**Contact**: Md. Mahfuzur Rahman (Mahfuzur.rahman@brainstation-23.com)

