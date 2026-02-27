# DFMS Event Catalog

> Complete catalog of all domain events

**Status**: ✅ Complete  
**Last Updated**: February 13, 2026

---

## 📋 Overview

This document provides a complete catalog of all domain events in DFMS, organized by module. Each event includes its purpose, schema, publishing module, and consuming modules.

---

## 📊 Event Summary

| Module | Events Published | Events Consumed |
|--------|-----------------|-----------------|
| **Product Requisition** | 4 | 0 |
| **Transport Management** | 8 | 1 |
| **Vendor Management** | 5 | 2 |
| **Operations Management** | 5 | 2 |
| **Quality Control** | 6 | 1 |
| **Trip Costing** | 6 | 3 |
| **Notifications** | 3 | All |
| **TOTAL** | **37** | - |

---

## 🔔 Product Requisition Events

### ProductRequisitionCreated
**Published By**: Product Requisition Module  
**Consumed By**: None  
**Purpose**: Notify that a new PR has been created

**Schema**:
```json
{
  "event_id": "uuid",
  "event_type": "ProductRequisitionCreated",
  "version": "1.0",
  "timestamp": "2026-02-13T10:00:00Z",
  "data": {
    "pr_id": "uuid",
    "pr_number": "PR-20260213-0001",
    "product_id": "uuid",
    "quantity": 1000.00,
    "origin_poi_id": "uuid",
    "destination_poi_id": "uuid",
    "requested_date": "2026-02-15",
    "priority": "normal",
    "created_by": "uuid"
  }
}
```

---

### ProductRequisitionSubmitted
**Published By**: Product Requisition Module  
**Consumed By**: Notifications Module  
**Purpose**: Notify that PR has been submitted for approval

**Schema**:
```json
{
  "event_id": "uuid",
  "event_type": "ProductRequisitionSubmitted",
  "version": "1.0",
  "timestamp": "2026-02-13T10:05:00Z",
  "data": {
    "pr_id": "uuid",
    "pr_number": "PR-20260213-0001",
    "submitted_by": "uuid",
    "submitted_at": "2026-02-13T10:05:00Z"
  }
}
```

---

### ProductRequisitionApproved
**Published By**: Product Requisition Module  
**Consumed By**: Transport Management Module, Notifications Module  
**Purpose**: Notify that PR has been approved and TR should be generated

**Schema**:
```json
{
  "event_id": "uuid",
  "event_type": "ProductRequisitionApproved",
  "version": "1.0",
  "timestamp": "2026-02-13T14:00:00Z",
  "data": {
    "pr_id": "uuid",
    "pr_number": "PR-20260213-0001",
    "tr_id": "uuid",
    "tr_number": "TR-20260213-0001",
    "approved_by": ["uuid", "uuid"],
    "approved_at": "2026-02-13T14:00:00Z"
  }
}
```

---

### ProductRequisitionRejected
**Published By**: Product Requisition Module  
**Consumed By**: Notifications Module  
**Purpose**: Notify that PR has been rejected

**Schema**:
```json
{
  "event_id": "uuid",
  "event_type": "ProductRequisitionRejected",
  "version": "1.0",
  "timestamp": "2026-02-13T14:00:00Z",
  "data": {
    "pr_id": "uuid",
    "pr_number": "PR-20260213-0001",
    "rejected_by": "uuid",
    "rejection_reason": "string",
    "rejected_at": "2026-02-13T14:00:00Z"
  }
}
```

---

## 🚚 Transport Events

### TransportRequestCreated
**Published By**: Transport Management Module  
**Consumed By**: Notifications Module  
**Purpose**: Notify that a new TR has been created

**Schema**:
```json
{
  "event_id": "uuid",
  "event_type": "TransportRequestCreated",
  "version": "1.0",
  "timestamp": "2026-02-13T14:05:00Z",
  "data": {
    "tr_id": "uuid",
    "tr_number": "TR-20260213-0001",
    "pr_id": "uuid",
    "product_id": "uuid",
    "quantity": 1000.00,
    "origin_poi_id": "uuid",
    "destination_poi_id": "uuid",
    "requested_date": "2026-02-15",
    "priority": "normal",
    "status": "pending"
  }
}
```

---

### TransportOrderCreated
**Published By**: Transport Management Module  
**Consumed By**: Vendor Management Module, Notifications Module  
**Purpose**: Notify that a TO has been created (may trigger vendor bidding)

**Schema**:
```json
{
  "event_id": "uuid",
  "event_type": "TransportOrderCreated",
  "version": "1.0",
  "timestamp": "2026-02-13T15:00:00Z",
  "data": {
    "to_id": "uuid",
    "to_number": "TO-20260213-0001",
    "tr_id": "uuid",
    "fleet_type": "own|vendor",
    "vehicle_id": "uuid",
    "driver_id": "uuid",
    "vendor_id": "uuid",
    "scheduled_date": "2026-02-15",
    "scheduled_time": "08:00:00",
    "status": "pending"
  }
}
```

---

### TripCreated
**Published By**: Transport Management Module  
**Consumed By**: Notifications Module, Mobile Module  
**Purpose**: Notify that a trip has been created

**Schema**:
```json
{
  "event_id": "uuid",
  "event_type": "TripCreated",
  "version": "1.0",
  "timestamp": "2026-02-13T15:05:00Z",
  "data": {
    "trip_id": "uuid",
    "trip_number": "TRIP-20260213-0001",
    "to_id": "uuid",
    "vehicle_id": "uuid",
    "driver_id": "uuid",
    "scheduled_date": "2026-02-15",
    "status": "pending"
  }
}
```

---

### TripStarted
**Published By**: Transport Management Module  
**Consumed By**: Operations Module, Notifications Module  
**Purpose**: Notify that a trip has started

**Schema**:
```json
{
  "event_id": "uuid",
  "event_type": "TripStarted",
  "version": "1.0",
  "timestamp": "2026-02-15T08:00:00Z",
  "data": {
    "trip_id": "uuid",
    "trip_number": "TRIP-20260213-0001",
    "start_time": "2026-02-15T08:00:00Z",
    "start_odometer": 45230.5,
    "start_location": {
      "latitude": 23.8103,
      "longitude": 90.4125
    },
    "started_by": "uuid"
  }
}
```

---

### TripLocationUpdated
**Published By**: Transport Management Module  
**Consumed By**: Operations Module (Command Center), Notifications Module  
**Purpose**: Notify of real-time location update

**Schema**:
```json
{
  "event_id": "uuid",
  "event_type": "TripLocationUpdated",
  "version": "1.0",
  "timestamp": "2026-02-15T08:30:00Z",
  "data": {
    "trip_id": "uuid",
    "trip_number": "TRIP-20260213-0001",
    "location": {
      "latitude": 23.8500,
      "longitude": 90.4500,
      "speed": 45.5,
      "heading": 180
    },
    "odometer": 45250.5,
    "timestamp": "2026-02-15T08:30:00Z"
  }
}
```

---

### TripCompleted
**Published By**: Transport Management Module  
**Consumed By**: Trip Costing Module, Fleet Management Module, Notifications Module  
**Purpose**: Notify that a trip has been completed

**Schema**:
```json
{
  "event_id": "uuid",
  "event_type": "TripCompleted",
  "version": "1.0",
  "timestamp": "2026-02-15T16:00:00Z",
  "data": {
    "trip_id": "uuid",
    "trip_number": "TRIP-20260213-0001",
    "distance_traveled": 120.5,
    "duration": "PT8H",
    "end_time": "2026-02-15T16:00:00Z",
    "end_odometer": 45351.0,
    "end_location": {
      "latitude": 24.3917,
      "longitude": 90.6500
    },
    "completed_at": "2026-02-15T16:00:00Z"
  }
}
```

---

### TripCancelled
**Published By**: Transport Management Module  
**Consumed By**: Notifications Module, Trip Costing Module  
**Purpose**: Notify that a trip has been cancelled

**Schema**:
```json
{
  "event_id": "uuid",
  "event_type": "TripCancelled",
  "version": "1.0",
  "timestamp": "2026-02-15T09:00:00Z",
  "data": {
    "trip_id": "uuid",
    "trip_number": "TRIP-20260213-0001",
    "cancellation_reason": "string",
    "cancelled_by": "uuid",
    "cancelled_at": "2026-02-15T09:00:00Z"
  }
}
```

---

## 🏢 Vendor Events

### VendorOnboarded
**Published By**: Vendor Management Module  
**Consumed By**: Notifications Module  
**Purpose**: Notify that a vendor has been onboarded

**Schema**:
```json
{
  "event_id": "uuid",
  "event_type": "VendorOnboarded",
  "version": "1.0",
  "timestamp": "2026-02-13T10:00:00Z",
  "data": {
    "vendor_id": "uuid",
    "vendor_name": "string",
    "vendor_type": "contractual|non_contractual",
    "onboarded_at": "2026-02-13T10:00:00Z"
  }
}
```

---

### VendorBidSubmitted
**Published By**: Vendor Management Module  
**Consumed By**: Notifications Module  
**Purpose**: Notify that a vendor has submitted a bid

**Schema**:
```json
{
  "event_id": "uuid",
  "event_type": "VendorBidSubmitted",
  "version": "1.0",
  "timestamp": "2026-02-13T16:00:00Z",
  "data": {
    "bid_id": "uuid",
    "to_id": "uuid",
    "vendor_id": "uuid",
    "bid_amount": {
      "amount": 15000.00,
      "currency": "BDT"
    },
    "submitted_at": "2026-02-13T16:00:00Z"
  }
}
```

---

### VendorBidAccepted
**Published By**: Vendor Management Module  
**Consumed By**: Transport Management Module, Notifications Module  
**Purpose**: Notify that a vendor bid has been accepted

**Schema**:
```json
{
  "event_id": "uuid",
  "event_type": "VendorBidAccepted",
  "version": "1.0",
  "timestamp": "2026-02-13T17:00:00Z",
  "data": {
    "bid_id": "uuid",
    "to_id": "uuid",
    "vendor_id": "uuid",
    "bid_amount": {
      "amount": 15000.00,
      "currency": "BDT"
    },
    "accepted_by": "uuid",
    "accepted_at": "2026-02-13T17:00:00Z"
  }
}
```

---

### VendorBidRejected
**Published By**: Vendor Management Module  
**Consumed By**: Notifications Module  
**Purpose**: Notify that a vendor bid has been rejected

**Schema**:
```json
{
  "event_id": "uuid",
  "event_type": "VendorBidRejected",
  "version": "1.0",
  "timestamp": "2026-02-13T17:00:00Z",
  "data": {
    "bid_id": "uuid",
    "to_id": "uuid",
    "vendor_id": "uuid",
    "rejection_reason": "string",
    "rejected_at": "2026-02-13T17:00:00Z"
  }
}
```

---

### VendorAssigned
**Published By**: Vendor Management Module  
**Consumed By**: Transport Management Module, Notifications Module  
**Purpose**: Notify that a vendor has been assigned to a TO

**Schema**:
```json
{
  "event_id": "uuid",
  "event_type": "VendorAssigned",
  "version": "1.0",
  "timestamp": "2026-02-13T17:05:00Z",
  "data": {
    "to_id": "uuid",
    "vendor_id": "uuid",
    "vehicle_id": "uuid",
    "driver_id": "uuid",
    "assigned_at": "2026-02-13T17:05:00Z"
  }
}
```

---

## 🏭 Operations Events

### GateInCompleted
**Published By**: Operations Management Module  
**Consumed By**: Weighing Module, Notifications Module  
**Purpose**: Notify that gate entry has been completed

**Schema**:
```json
{
  "event_id": "uuid",
  "event_type": "GateInCompleted",
  "version": "1.0",
  "timestamp": "2026-02-15T08:05:00Z",
  "data": {
    "gate_entry_id": "uuid",
    "trip_id": "uuid",
    "poi_id": "uuid",
    "vehicle_registration": "ABC-123",
    "entry_time": "2026-02-15T08:05:00Z",
    "operator_id": "uuid"
  }
}
```

---

### GateOutCompleted
**Published By**: Operations Management Module  
**Consumed By**: Transport Management Module, Notifications Module  
**Purpose**: Notify that gate exit has been completed

**Schema**:
```json
{
  "event_id": "uuid",
  "event_type": "GateOutCompleted",
  "version": "1.0",
  "timestamp": "2026-02-15T10:00:00Z",
  "data": {
    "gate_exit_id": "uuid",
    "trip_id": "uuid",
    "poi_id": "uuid",
    "exit_time": "2026-02-15T10:00:00Z",
    "operator_id": "uuid"
  }
}
```

---

### WeighingCompleted
**Published By**: Operations Management Module  
**Consumed By**: Loading Module, Trip Costing Module, Notifications Module  
**Purpose**: Notify that weighing has been completed

**Schema**:
```json
{
  "event_id": "uuid",
  "event_type": "WeighingCompleted",
  "version": "1.0",
  "timestamp": "2026-02-15T08:15:00Z",
  "data": {
    "weighing_id": "uuid",
    "trip_id": "uuid",
    "weighing_type": "empty|loaded",
    "weight": 3500.50,
    "weighing_time": "2026-02-15T08:15:00Z",
    "operator_id": "uuid"
  }
}
```

---

### LoadingCompleted
**Published By**: Operations Management Module  
**Consumed By**: Weighing Module, Gate Module, Notifications Module  
**Purpose**: Notify that loading has been completed

**Schema**:
```json
{
  "event_id": "uuid",
  "event_type": "LoadingCompleted",
  "version": "1.0",
  "timestamp": "2026-02-15T09:00:00Z",
  "data": {
    "loading_id": "uuid",
    "trip_id": "uuid",
    "quantity_loaded": 1000.00,
    "completed_at": "2026-02-15T09:00:00Z",
    "loaded_by": "uuid"
  }
}
```

---

### UnloadingCompleted
**Published By**: Operations Management Module  
**Consumed By**: Quality Control Module, Notifications Module  
**Purpose**: Notify that unloading has been completed (triggers QC inspection)

**Schema**:
```json
{
  "event_id": "uuid",
  "event_type": "UnloadingCompleted",
  "version": "1.0",
  "timestamp": "2026-02-15T15:00:00Z",
  "data": {
    "unloading_id": "uuid",
    "trip_id": "uuid",
    "quantity_unloaded": 1000.00,
    "completed_at": "2026-02-15T15:00:00Z",
    "unloaded_by": "uuid"
  }
}
```

---

## 🔬 QC Events

### QCInspectionCreated
**Published By**: Quality Control Module  
**Consumed By**: Notifications Module  
**Purpose**: Notify that a QC inspection has been created

**Schema**:
```json
{
  "event_id": "uuid",
  "event_type": "QCInspectionCreated",
  "version": "1.0",
  "timestamp": "2026-02-15T15:05:00Z",
  "data": {
    "inspection_id": "uuid",
    "trip_id": "uuid",
    "inspection_type": "physical|physical_and_lab",
    "qc_supervisor_id": "uuid",
    "created_at": "2026-02-15T15:05:00Z"
  }
}
```

---

### QCInspectionStarted
**Published By**: Quality Control Module  
**Consumed By**: Notifications Module  
**Purpose**: Notify that QC inspection has started

**Schema**:
```json
{
  "event_id": "uuid",
  "event_type": "QCInspectionStarted",
  "version": "1.0",
  "timestamp": "2026-02-15T15:10:00Z",
  "data": {
    "inspection_id": "uuid",
    "trip_id": "uuid",
    "started_by": "uuid",
    "started_at": "2026-02-15T15:10:00Z"
  }
}
```

---

### QCInspectionCompleted
**Published By**: Quality Control Module  
**Consumed By**: Transport Management Module, Trip Costing Module, Notifications Module  
**Purpose**: Notify that QC inspection has been completed (pass)

**Schema**:
```json
{
  "event_id": "uuid",
  "event_type": "QCInspectionCompleted",
  "version": "1.0",
  "timestamp": "2026-02-15T16:00:00Z",
  "data": {
    "inspection_id": "uuid",
    "trip_id": "uuid",
    "result": "pass",
    "inspector_id": "uuid",
    "completed_at": "2026-02-15T16:00:00Z",
    "qc_report_url": "https://s3.example.com/reports/qc-001.pdf"
  }
}
```

---

### QCInspectionFailed
**Published By**: Quality Control Module  
**Consumed By**: Notifications Module  
**Purpose**: Notify that QC inspection has failed

**Schema**:
```json
{
  "event_id": "uuid",
  "event_type": "QCInspectionFailed",
  "version": "1.0",
  "timestamp": "2026-02-15T16:00:00Z",
  "data": {
    "inspection_id": "uuid",
    "trip_id": "uuid",
    "result": "fail",
    "failure_reason": "string",
    "inspector_id": "uuid",
    "failed_at": "2026-02-15T16:00:00Z"
  }
}
```

---

### QCSampleCollected
**Published By**: Quality Control Module  
**Consumed By**: Lab Testing Module, Notifications Module  
**Purpose**: Notify that a sample has been collected

**Schema**:
```json
{
  "event_id": "uuid",
  "event_type": "QCSampleCollected",
  "version": "1.0",
  "timestamp": "2026-02-15T15:30:00Z",
  "data": {
    "sample_id": "uuid",
    "inspection_id": "uuid",
    "sample_type": "string",
    "quantity": 5.0,
    "collection_time": "2026-02-15T15:30:00Z",
    "collected_by": "uuid"
  }
}
```

---

### QCLabTestCompleted
**Published By**: Quality Control Module  
**Consumed By**: QC Inspection Module, Notifications Module  
**Purpose**: Notify that lab test has been completed

**Schema**:
```json
{
  "event_id": "uuid",
  "event_type": "QCLabTestCompleted",
  "version": "1.0",
  "timestamp": "2026-02-16T10:00:00Z",
  "data": {
    "lab_test_id": "uuid",
    "sample_id": "uuid",
    "test_type": "string",
    "result": "pass|fail",
    "test_results": {
      "moisture": "12.5%",
      "protein": "18.2%"
    },
    "tested_by": "uuid",
    "tested_at": "2026-02-16T10:00:00Z"
  }
}
```

---

## 💰 Trip Costing Events

### TripCostCalculated
**Published By**: Trip Costing Module  
**Consumed By**: Notifications Module  
**Purpose**: Notify that trip cost has been calculated

**Schema**:
```json
{
  "event_id": "uuid",
  "event_type": "TripCostCalculated",
  "version": "1.0",
  "timestamp": "2026-02-15T16:05:00Z",
  "data": {
    "trip_cost_id": "uuid",
    "trip_id": "uuid",
    "total_cost": {
      "amount": 15000.00,
      "currency": "BDT"
    },
    "cost_breakdown": {
      "base_rate": 10000.00,
      "distance_cost": 3000.00,
      "weight_cost": 1500.00,
      "additional_charges": 500.00
    },
    "calculated_at": "2026-02-15T16:05:00Z"
  }
}
```

---

### TripCostApproved
**Published By**: Trip Costing Module  
**Consumed By**: Invoice Generation Module, Notifications Module  
**Purpose**: Notify that trip cost has been approved

**Schema**:
```json
{
  "event_id": "uuid",
  "event_type": "TripCostApproved",
  "version": "1.0",
  "timestamp": "2026-02-15T18:00:00Z",
  "data": {
    "trip_cost_id": "uuid",
    "trip_id": "uuid",
    "approved_by": "uuid",
    "approved_at": "2026-02-15T18:00:00Z"
  }
}
```

---

### InvoiceGenerated
**Published By**: Trip Costing Module  
**Consumed By**: ERP Sync Module, Notifications Module  
**Purpose**: Notify that invoice has been generated

**Schema**:
```json
{
  "event_id": "uuid",
  "event_type": "InvoiceGenerated",
  "version": "1.0",
  "timestamp": "2026-02-15T18:05:00Z",
  "data": {
    "invoice_id": "uuid",
    "invoice_number": "INV-20260215-0001",
    "vendor_id": "uuid",
    "trip_id": "uuid",
    "amount": {
      "amount": 15000.00,
      "currency": "BDT"
    },
    "generated_at": "2026-02-15T18:05:00Z"
  }
}
```

---

### InvoiceApproved
**Published By**: Trip Costing Module  
**Consumed By**: ERP Sync Module, Notifications Module  
**Purpose**: Notify that invoice has been approved

**Schema**:
```json
{
  "event_id": "uuid",
  "event_type": "InvoiceApproved",
  "version": "1.0",
  "timestamp": "2026-02-15T18:10:00Z",
  "data": {
    "invoice_id": "uuid",
    "invoice_number": "INV-20260215-0001",
    "approved_by": "uuid",
    "approved_at": "2026-02-15T18:10:00Z"
  }
}
```

---

### PaymentProcessed
**Published By**: Trip Costing Module  
**Consumed By**: ERP Sync Module, Notifications Module  
**Purpose**: Notify that payment has been processed

**Schema**:
```json
{
  "event_id": "uuid",
  "event_type": "PaymentProcessed",
  "version": "1.0",
  "timestamp": "2026-02-20T10:00:00Z",
  "data": {
    "invoice_id": "uuid",
    "payment_amount": {
      "amount": 15000.00,
      "currency": "BDT"
    },
    "payment_method": "bank_transfer",
    "transaction_id": "TXN-12345",
    "processed_at": "2026-02-20T10:00:00Z"
  }
}
```

---

### ERPSyncCompleted
**Published By**: Trip Costing Module  
**Consumed By**: Notifications Module  
**Purpose**: Notify that ERP sync has been completed

**Schema**:
```json
{
  "event_id": "uuid",
  "event_type": "ERPSyncCompleted",
  "version": "1.0",
  "timestamp": "2026-02-15T18:15:00Z",
  "data": {
    "sync_id": "uuid",
    "invoice_id": "uuid",
    "erp_reference": "ERP-INV-12345",
    "synced_at": "2026-02-15T18:15:00Z"
  }
}
```

---

## 🔔 Notification Events

### NotificationSent
**Published By**: Notifications Module  
**Consumed By**: None (for audit)  
**Purpose**: Audit trail for sent notifications

**Schema**:
```json
{
  "event_id": "uuid",
  "event_type": "NotificationSent",
  "version": "1.0",
  "timestamp": "2026-02-15T08:00:00Z",
  "data": {
    "notification_id": "uuid",
    "recipient_id": "uuid",
    "channel": "email|sms|push|in_app",
    "status": "sent|delivered|failed",
    "sent_at": "2026-02-15T08:00:00Z"
  }
}
```

---

### AlertRaised
**Published By**: Notifications Module  
**Consumed By**: None (for audit)  
**Purpose**: Audit trail for raised alerts

**Schema**:
```json
{
  "event_id": "uuid",
  "event_type": "AlertRaised",
  "version": "1.0",
  "timestamp": "2026-02-15T08:30:00Z",
  "data": {
    "alert_id": "uuid",
    "severity": "critical|high|medium|low",
    "title": "string",
    "message": "string",
    "raised_at": "2026-02-15T08:30:00Z"
  }
}
```

---

### AlertAcknowledged
**Published By**: Notifications Module  
**Consumed By**: None (for audit)  
**Purpose**: Audit trail for acknowledged alerts

**Schema**:
```json
{
  "event_id": "uuid",
  "event_type": "AlertAcknowledged",
  "version": "1.0",
  "timestamp": "2026-02-15T09:00:00Z",
  "data": {
    "alert_id": "uuid",
    "acknowledged_by": "uuid",
    "acknowledged_at": "2026-02-15T09:00:00Z"
  }
}
```

---

## 📊 Event Flow Examples

### Example 1: PR Approval → TR Creation → TO Creation → Trip Execution

```
ProductRequisitionApproved
  → TransportRequestCreated
  → TransportOrderCreated
  → TripCreated
  → TripStarted
  → GateInCompleted
  → WeighingCompleted
  → LoadingCompleted
  → GateOutCompleted
  → TripLocationUpdated (multiple)
  → GateInCompleted (destination)
  → UnloadingCompleted
  → QCInspectionCompleted
  → TripCompleted
  → TripCostCalculated
  → InvoiceGenerated
  → InvoiceApproved
  → ERPSyncCompleted
```

---

### Example 2: Vendor Bidding Flow

```
TransportOrderCreated (vendor fleet)
  → VendorBidSubmitted (multiple vendors)
  → VendorBidAccepted
  → VendorBidRejected (other vendors)
  → VendorAssigned
  → TripCreated
```

---

## 🔗 Related Documents

- [Event Specifications](./event-specifications.yaml) - AsyncAPI specification
- [Module Interactions](../../01-architecture/modules/module-interactions.md)
- [Data Models](../data-models/)

---

**Document Status**: ✅ Complete  
**Last Reviewed**: February 13, 2026  
**Contact**: Md. Mahfuzur Rahman (Mahfuzur.rahman@brainstation-23.com)

