# Event Contracts

> AsyncAPI specifications for DFMS domain events

**Status**: 🚧 In Progress  
**Last Updated**: February 13, 2026

---

## 📋 Overview

This section contains AsyncAPI specifications for all domain events published and consumed by DFMS modules. Events enable loose coupling between modules through asynchronous communication.

---

## 📁 Event Documents

### **[Event Catalog](./event-catalog.md)**
Complete catalog of all domain events:
- Event list by module
- Event schemas
- Publishing modules
- Consuming modules

### **[Event Specifications](./event-specifications.yaml)**
AsyncAPI specification for all events:
- Event definitions
- Channels
- Message schemas
- Examples

---

## 🎯 Event Principles

### 1. **Domain Events**
Events represent business events that have occurred.

### 2. **Event Sourcing**
Critical state changes are captured as events.

### 3. **Loose Coupling**
Modules communicate via events, not direct calls.

### 4. **Eventual Consistency**
Accept eventual consistency for cross-module updates.

### 5. **Versioning**
Events are versioned for backward compatibility.

---

## 📊 Event Categories

### Product Requisition Events
- ProductRequisitionCreated
- ProductRequisitionSubmitted
- ProductRequisitionApproved
- ProductRequisitionRejected

### Transport Events
- TransportRequestCreated
- TransportOrderCreated
- TripCreated
- TripStarted
- TripLocationUpdated
- TripCompleted
- TripCancelled

### Vendor Events
- VendorOnboarded
- VendorBidSubmitted
- VendorBidAccepted
- VendorBidRejected
- VendorAssigned

### Operations Events
- GateInCompleted
- GateOutCompleted
- WeighingCompleted
- LoadingCompleted
- UnloadingCompleted

### QC Events
- QCInspectionCreated
- QCInspectionStarted
- QCInspectionCompleted
- QCInspectionFailed
- QCSampleCollected
- QCLabTestCompleted

### Costing Events
- TripCostCalculated
- TripCostApproved
- InvoiceGenerated
- InvoiceApproved
- PaymentProcessed
- ERPSyncCompleted

### Notification Events
- NotificationSent
- AlertRaised
- AlertAcknowledged

---

## 🔗 Related Documents

- [Module Interactions](../../04-architecture/01-system-design/modules/module-interactions.md)
- [Data Models](../02-data-models/README.md)
- [Integration Contracts](../04-integration/README.md)

---

**Last Updated**: February 13, 2026  
**Status**: 🚧 In Progress  
**Contact**: Md. Mahfuzur Rahman (Mahfuzur.rahman@brainstation-23.com)

