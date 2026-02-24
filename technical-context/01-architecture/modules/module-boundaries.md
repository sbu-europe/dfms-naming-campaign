# DFMS Module Boundaries

> Detailed definition of all 12 DFMS modules

**Status**: 🚧 Draft  
**Last Updated**: February 13, 2026

---

## 📋 Overview

This document defines the boundaries, responsibilities, and interfaces for all 12 DFMS modules. Each module is a logical grouping of related functionality with clear ownership and well-defined interfaces.

---

## 1. Master Data Management

### Purpose
Manage all master data entities that are referenced across the system.

### Responsibilities
- Vehicle management (CRUD)
- Driver management (CRUD)
- Helper management (CRUD)
- Vendor master data (CRUD)
- POI (Point of Interest) management (CRUD)
- Product inventory management (CRUD)
- Zone management (CRUD)

### Data Owned
- `vehicles` table
- `drivers` table
- `helpers` table
- `vendors_master` table
- `pois` table
- `products` table
- `zones` table

### API Surface
```
GET    /api/v1/vehicles
POST   /api/v1/vehicles
GET    /api/v1/vehicles/{id}
PUT    /api/v1/vehicles/{id}
DELETE /api/v1/vehicles/{id}

GET    /api/v1/drivers
POST   /api/v1/drivers
GET    /api/v1/drivers/{id}
PUT    /api/v1/drivers/{id}

... (similar for helpers, vendors, pois, products, zones)
```

### Events Published
- `VehicleCreated`
- `VehicleUpdated`
- `VehicleDeleted`
- `DriverCreated`
- `DriverUpdated`
- `DriverStatusChanged`
- (similar for other entities)

### Dependencies
- None (core module)

### Business Rules
- VR-001 to VR-010 (Vehicle rules)
- DR-001 to DR-008 (Driver rules)
- HR-001 to HR-005 (Helper rules)
- See [Business Rules](../../../business-context/01-business-domain/business-rules/business-rules.md)

---

## 2. Product Requisition Management

### Purpose
Handle product requisition creation, approval workflows, and stock validation.

### Responsibilities
- Create product requisitions (PR)
- Approval workflow (Distribution & Procurement)
- Stock validation
- Requisition status management
- Generate Transport Requests (TR) from approved PRs

### Data Owned
- `product_requisitions` table
- `requisition_approvals` table
- `stock_validations` table

### API Surface
```
GET    /api/v1/product-requisitions
POST   /api/v1/product-requisitions
GET    /api/v1/product-requisitions/{id}
PUT    /api/v1/product-requisitions/{id}
POST   /api/v1/product-requisitions/{id}/submit-for-approval
POST   /api/v1/product-requisitions/{id}/approve
POST   /api/v1/product-requisitions/{id}/reject
```

### Events Published
- `ProductRequisitionCreated`
- `ProductRequisitionSubmitted`
- `ProductRequisitionApproved`
- `ProductRequisitionRejected`
- `StockValidationCompleted`

### Events Consumed
- None

### Dependencies
- **Master Data Management**: Product, POI data
- **User Management**: Approval workflow users

### Business Rules
- PR-001 to PR-010 (Requisition rules)
- See [Business Rules](../../../business-context/01-business-domain/business-rules/business-rules.md)

---

## 3. Transport Management

### Purpose
Core transport operations - manage TRs, TOs, and trip lifecycle.

### Responsibilities
- Transport Request (TR) creation and management
- Transport Order (TO) creation and assignment
- Trip lifecycle management (start, in-transit, complete)
- Vehicle and driver assignment
- Route planning integration
- GPS tracking integration
- Trip status updates

### Data Owned
- `transport_requests` table
- `transport_orders` table
- `trips` table
- `trip_locations` table
- `trip_events` table

### API Surface
```
# Transport Requests
GET    /api/v1/transport-requests
POST   /api/v1/transport-requests
GET    /api/v1/transport-requests/{id}
PUT    /api/v1/transport-requests/{id}

# Transport Orders
GET    /api/v1/transport-orders
POST   /api/v1/transport-orders
GET    /api/v1/transport-orders/{id}
PUT    /api/v1/transport-orders/{id}

# Trips
GET    /api/v1/trips
GET    /api/v1/trips/{id}
POST   /api/v1/trips/{id}/start
POST   /api/v1/trips/{id}/update-location
POST   /api/v1/trips/{id}/complete
POST   /api/v1/trips/{id}/cancel
```

### Events Published
- `TransportRequestCreated`
- `TransportRequestApproved`
- `TransportOrderCreated`
- `TripCreated`
- `TripStarted`
- `TripLocationUpdated`
- `TripCompleted`
- `TripCancelled`

### Events Consumed
- `ProductRequisitionApproved` (from Product Requisition)
- `VendorBidAccepted` (from Vendor Management)
- `QCInspectionCompleted` (from Quality Control)

### Dependencies
- **Master Data Management**: Vehicle, Driver, POI data
- **Product Requisition**: Approved requisitions
- **GPS/VTS Provider**: Real-time tracking
- **Maps Service**: Route planning

### Business Rules
- TR-001 to TR-015 (Transport Request rules)
- TO-001 to TO-020 (Transport Order rules)
- TRIP-001 to TRIP-015 (Trip rules)
- See [Business Rules](../../../business-context/01-business-domain/business-rules/business-rules.md)

---

## 4. Vendor Management

### Purpose
Manage vendor relationships, bidding, performance tracking, and invoicing.

### Responsibilities
- Vendor onboarding and verification
- Bidding portal (contractual & non-contractual)
- Vendor selection and assignment
- Performance tracking
- Invoice and claims management
- Vendor rating system (Phase 3)

### Data Owned
- `vendors` table (operational data)
- `vendor_bids` table
- `vendor_assignments` table
- `vendor_invoices` table
- `vendor_claims` table
- `vendor_ratings` table (Phase 3)

### API Surface
```
# Vendor Operations
GET    /api/v1/vendors
POST   /api/v1/vendors/onboard
GET    /api/v1/vendors/{id}
PUT    /api/v1/vendors/{id}

# Bidding
GET    /api/v1/vendor-bids
POST   /api/v1/vendor-bids
GET    /api/v1/vendor-bids/{id}
POST   /api/v1/vendor-bids/{id}/accept
POST   /api/v1/vendor-bids/{id}/reject

# Invoicing
GET    /api/v1/vendor-invoices
POST   /api/v1/vendor-invoices
GET    /api/v1/vendor-invoices/{id}
POST   /api/v1/vendor-invoices/{id}/approve
```

### Events Published
- `VendorOnboarded`
- `VendorBidSubmitted`
- `VendorBidAccepted`
- `VendorBidRejected`
- `VendorAssigned`
- `VendorInvoiceSubmitted`
- `VendorInvoiceApproved`

### Events Consumed
- `TransportOrderCreated` (from Transport Management)
- `TripCompleted` (from Transport Management)

### Dependencies
- **Master Data Management**: Vendor master data
- **Transport Management**: TO and Trip data
- **Trip Costing**: Cost calculations

### Business Rules
- VEN-001 to VEN-020 (Vendor rules)
- See [Business Rules](../../../business-context/01-business-domain/business-rules/business-rules.md)

---

## 5. Operations Management

### Purpose
Manage on-ground operations: gate, scaling, command center, loading/unloading.

### Responsibilities
- Gate-in/Gate-out management
- Weighing/Scaling operations
- Command center monitoring
- Loading operations
- Unloading operations
- Operational status tracking

### Data Owned
- `gate_entries` table
- `gate_exits` table
- `weighing_records` table
- `loading_operations` table
- `unloading_operations` table
- `command_center_events` table

### API Surface
```
# Gate Management
POST   /api/v1/operations/gate-in
POST   /api/v1/operations/gate-out
GET    /api/v1/operations/gate-entries

# Scaling
POST   /api/v1/operations/weighing
GET    /api/v1/operations/weighing-records

# Loading/Unloading
POST   /api/v1/operations/loading/start
POST   /api/v1/operations/loading/complete
POST   /api/v1/operations/unloading/start
POST   /api/v1/operations/unloading/complete

# Command Center
GET    /api/v1/operations/command-center/dashboard
GET    /api/v1/operations/command-center/active-trips
```

### Events Published
- `GateInCompleted`
- `GateOutCompleted`
- `WeighingCompleted`
- `LoadingStarted`
- `LoadingCompleted`
- `UnloadingStarted`
- `UnloadingCompleted`

### Events Consumed
- `TripStarted` (from Transport Management)
- `TripCompleted` (from Transport Management)

### Dependencies
- **Transport Management**: Trip data
- **Master Data Management**: Vehicle, POI data

### Business Rules
- GATE-001 to GATE-010 (Gate rules)
- SCALE-001 to SCALE-008 (Scaling rules)
- LOAD-001 to LOAD-010 (Loading/Unloading rules)
- See [Business Rules](../../../business-context/01-business-domain/business-rules/business-rules.md)

---

## 6. Quality Control

### Purpose
Manage quality inspections, sampling, lab testing, and compliance.

### Responsibilities
- Physical inspection workflows
- Sampling and lab testing
- QC pass/fail decisions
- Escalation and recheck workflows
- QC report generation
- Mobile QC app support

### Data Owned
- `qc_inspections` table
- `qc_samples` table
- `qc_lab_tests` table
- `qc_reports` table
- `qc_escalations` table

### API Surface
```
# Inspections
GET    /api/v1/qc/inspections
POST   /api/v1/qc/inspections
GET    /api/v1/qc/inspections/{id}
POST   /api/v1/qc/inspections/{id}/submit

# Sampling
POST   /api/v1/qc/samples
GET    /api/v1/qc/samples/{id}

# Lab Testing
POST   /api/v1/qc/lab-tests
GET    /api/v1/qc/lab-tests/{id}
POST   /api/v1/qc/lab-tests/{id}/submit-results

# Reports
GET    /api/v1/qc/reports
GET    /api/v1/qc/reports/{id}
```

### Events Published
- `QCInspectionStarted`
- `QCInspectionCompleted`
- `QCInspectionFailed`
- `QCSampleCollected`
- `QCLabTestCompleted`
- `QCEscalationRaised`

### Events Consumed
- `UnloadingCompleted` (from Operations Management)

### Dependencies
- **Transport Management**: Trip data
- **Operations Management**: Unloading data
- **File Storage**: Photo/video uploads

### Business Rules
- QC-001 to QC-015 (Quality Control rules)
- See [Business Rules](../../../business-context/01-business-domain/business-rules/business-rules.md)

---

## 7. Fleet Management (Phase 2)

### Purpose
Monitor fleet health, maintenance, and utilization.

### Responsibilities
- Fleet health dashboard
- Vehicle utilization analytics
- Downtime management
- Preventive maintenance scheduling
- Workshop management (Phase 3)
- Maintenance history tracking

### Data Owned
- `fleet_health` table
- `maintenance_schedules` table
- `maintenance_records` table
- `downtime_logs` table
- `workshop_jobs` table (Phase 3)

### API Surface
```
# Fleet Health
GET    /api/v1/fleet/health
GET    /api/v1/fleet/health/{vehicle_id}

# Maintenance
GET    /api/v1/fleet/maintenance/schedules
POST   /api/v1/fleet/maintenance/schedules
GET    /api/v1/fleet/maintenance/records
POST   /api/v1/fleet/maintenance/records

# Downtime
GET    /api/v1/fleet/downtime
POST   /api/v1/fleet/downtime
```

### Events Published
- `MaintenanceScheduled`
- `MaintenanceCompleted`
- `VehicleDowntimeRecorded`
- `FleetHealthAlertRaised`

### Events Consumed
- `TripCompleted` (from Transport Management)
- `VehicleStatusChanged` (from Master Data)

### Dependencies
- **Master Data Management**: Vehicle data
- **Transport Management**: Trip data for utilization
- **IoT Devices**: Vehicle health metrics

### Business Rules
- FLEET-001 to FLEET-010 (Fleet Management rules)
- See [Business Rules](../../../business-context/01-business-domain/business-rules/business-rules.md)

---

## 8. Fuel Management (Phase 2)

### Purpose
Track fuel consumption and monitor performance.

### Responsibilities
- Fuel consumption tracking
- Fuel entry system
- Fuel performance monitoring
- Fuel efficiency analytics
- Predictive fuel monitoring (Phase 3)

### Data Owned
- `fuel_entries` table
- `fuel_consumption` table
- `fuel_performance` table

### API Surface
```
# Fuel Entries
GET    /api/v1/fuel/entries
POST   /api/v1/fuel/entries
GET    /api/v1/fuel/entries/{id}

# Consumption
GET    /api/v1/fuel/consumption
GET    /api/v1/fuel/consumption/{vehicle_id}

# Performance
GET    /api/v1/fuel/performance
GET    /api/v1/fuel/performance/{vehicle_id}
```

### Events Published
- `FuelEntryRecorded`
- `FuelConsumptionCalculated`
- `FuelEfficiencyAlertRaised`

### Events Consumed
- `TripCompleted` (from Transport Management)

### Dependencies
- **Master Data Management**: Vehicle data
- **Transport Management**: Trip data
- **IoT Devices**: Fuel sensors

### Business Rules
- FUEL-001 to FUEL-008 (Fuel Management rules)
- See [Business Rules](../../../business-context/01-business-domain/business-rules/business-rules.md)

---

## 9. Trip Costing & Finance

### Purpose
Calculate trip costs, manage billing, and integrate with ERP.

### Responsibilities
- Trip cost calculation
- Vendor billing
- Invoice processing
- ERP integration
- Cost reconciliation
- Payment processing

### Data Owned
- `trip_costs` table
- `cost_components` table
- `invoices` table
- `payments` table
- `erp_sync_logs` table

### API Surface
```
# Trip Costing
GET    /api/v1/costing/trips
GET    /api/v1/costing/trips/{trip_id}
POST   /api/v1/costing/trips/{trip_id}/calculate

# Invoicing
GET    /api/v1/costing/invoices
POST   /api/v1/costing/invoices
GET    /api/v1/costing/invoices/{id}
POST   /api/v1/costing/invoices/{id}/approve

# ERP Sync
POST   /api/v1/costing/erp/sync
GET    /api/v1/costing/erp/sync-status
```

### Events Published
- `TripCostCalculated`
- `InvoiceGenerated`
- `InvoiceApproved`
- `PaymentProcessed`
- `ERPSyncCompleted`

### Events Consumed
- `TripCompleted` (from Transport Management)
- `VendorInvoiceSubmitted` (from Vendor Management)
- `QCInspectionCompleted` (from Quality Control)

### Dependencies
- **Transport Management**: Trip data
- **Vendor Management**: Vendor invoices
- **Operations Management**: Weighing data
- **ERP System**: Financial sync

### Business Rules
- COST-001 to COST-015 (Costing rules)
- See [Business Rules](../../../business-context/01-business-domain/business-rules/business-rules.md)

---

## 10. Reporting & Analytics

### Purpose
Provide dashboards, reports, and KPIs across all modules.

### Responsibilities
- Real-time dashboards
- Scheduled reports
- Custom report generation
- KPI tracking
- Data export
- BI integration (Phase 3)

### Data Owned
- `reports` table
- `report_schedules` table
- `dashboards` table
- `kpis` table

### API Surface
```
# Dashboards
GET    /api/v1/reports/dashboards
GET    /api/v1/reports/dashboards/{dashboard_id}

# Reports
GET    /api/v1/reports
POST   /api/v1/reports/generate
GET    /api/v1/reports/{id}
GET    /api/v1/reports/{id}/download

# KPIs
GET    /api/v1/reports/kpis
GET    /api/v1/reports/kpis/{kpi_id}
```

### Events Published
- `ReportGenerated`
- `KPIThresholdExceeded`

### Events Consumed
- All domain events (for analytics)

### Dependencies
- **All Modules**: Data aggregation
- **Search Engine**: Advanced analytics (Phase 2)

### Business Rules
- REP-001 to REP-010 (Reporting rules)
- See [Business Rules](../../../business-context/01-business-domain/business-rules/business-rules.md)

---

## 11. Mobile Applications

### Purpose
Provide mobile interfaces for field users.

### Responsibilities
- Driver mobile app APIs
- QC supervisor mobile app APIs
- Vendor mobile app APIs
- Offline sync support (Phase 2)
- Push notifications
- Mobile-specific optimizations

### Data Owned
- `mobile_sessions` table
- `mobile_sync_logs` table
- `push_tokens` table

### API Surface
```
# Driver App
GET    /api/v1/mobile/driver/trips
GET    /api/v1/mobile/driver/trips/{id}
POST   /api/v1/mobile/driver/trips/{id}/start
POST   /api/v1/mobile/driver/trips/{id}/update-location

# QC App
GET    /api/v1/mobile/qc/inspections
POST   /api/v1/mobile/qc/inspections
POST   /api/v1/mobile/qc/inspections/{id}/upload-photo

# Vendor App
GET    /api/v1/mobile/vendor/bids
POST   /api/v1/mobile/vendor/bids
GET    /api/v1/mobile/vendor/trips
```

### Events Published
- `MobileAppOpened`
- `MobileLocationUpdated`
- `MobilePhotoUploaded`

### Events Consumed
- `TripCreated` (from Transport Management)
- `QCInspectionAssigned` (from Quality Control)

### Dependencies
- **Transport Management**: Trip data
- **Quality Control**: Inspection data
- **Vendor Management**: Bid data
- **Push Notification Service**: FCM/APNS

### Business Rules
- MOBILE-001 to MOBILE-010 (Mobile app rules)
- See [Business Rules](../../../business-context/01-business-domain/business-rules/business-rules.md)

---

## 12. Notifications & Alerts

### Purpose
Manage system notifications and alerts across all channels.

### Responsibilities
- Email notifications
- SMS notifications
- Push notifications
- In-app notifications
- Alert management
- Notification preferences
- Notification history

### Data Owned
- `notifications` table
- `notification_preferences` table
- `notification_history` table
- `alerts` table

### API Surface
```
# Notifications
GET    /api/v1/notifications
GET    /api/v1/notifications/{id}
POST   /api/v1/notifications/{id}/mark-read

# Preferences
GET    /api/v1/notifications/preferences
PUT    /api/v1/notifications/preferences

# Alerts
GET    /api/v1/alerts
GET    /api/v1/alerts/{id}
POST   /api/v1/alerts/{id}/acknowledge
```

### Events Published
- `NotificationSent`
- `AlertRaised`
- `AlertAcknowledged`

### Events Consumed
- All domain events (for notification triggers)

### Dependencies
- **All Modules**: Event sources
- **SMS Gateway**: SMS delivery
- **Email Service**: Email delivery
- **Push Notification Service**: Mobile push

### Business Rules
- NOTIF-001 to NOTIF-010 (Notification rules)
- See [Business Rules](../../../business-context/01-business-domain/business-rules/business-rules.md)

---

## 📊 Module Dependency Matrix

| Module | Depends On |
|--------|------------|
| Master Data | None |
| Product Requisition | Master Data |
| Transport | Master Data, Product Requisition |
| Vendor | Master Data, Transport |
| Operations | Transport, Master Data |
| Quality Control | Operations, Transport |
| Fleet | Master Data, Transport |
| Fuel | Fleet, Transport |
| Trip Costing | Transport, Vendor, Operations, QC |
| Reporting | All modules (read-only) |
| Mobile | Transport, QC, Vendor |
| Notifications | All modules (event consumers) |

---

## 🔗 Related Documents

- [Module Interactions](./module-interactions.md) - Communication patterns
- [Container View](../container-view.md) - Technical containers
- [Business Rules](../../../business-context/01-business-domain/business-rules/business-rules.md)
- [User Stories](../../../business-context/04-phase-backlog/phase-1/user-stories/)

---

**Document Status**: 🚧 Draft  
**Next Steps**: Review with team, refine boundaries  
**Contact**: Md. Mahfuzur Rahman (Mahfuzur.rahman@brainstation-23.com)

