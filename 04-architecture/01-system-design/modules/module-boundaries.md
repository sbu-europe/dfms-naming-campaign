# DFMS Module Boundaries

> Detailed definition of all 13 DFMS modules

**Status**: Active  
**Last Updated**: March 2026

---

## 📋 Overview

This document defines the boundaries, responsibilities, and interfaces for all 13 DFMS modules. Each module is a logical grouping of related functionality with clear ownership and well-defined interfaces.

### Multi-Tenancy Architecture Note

All modules run within a **schema-per-tenant** PostgreSQL architecture managed by the `django-tenants` library. Each tenant gets a dedicated PostgreSQL schema; no `tenant_id` column is needed in application queries. The `django-tenants` middleware sets `search_path` automatically per request based on the subdomain.

### Role Model Note

DFMS uses a **3-tier role hierarchy** for access control (enforced at API, service, and query layers):
1. **Super Admin** — platform-level; manages tenants and subscription plans (public schema only)
2. **Tenant Admin** — full access within their tenant; manages users, master data, configuration
3. **Operational User** — field-level access; executes assigned tasks (driver, gate operator, QC inspector, etc.)

Functional role flags (`is_requester`, `is_approver`, `is_executor`) further control workflow participation and prevent self-approval.

---

## 1. Master Data Management

### Purpose
Manage all master data entities that are referenced across the system.

### Responsibilities
- Vehicle management (CRUD)
- Driver management (CRUD)
- Helper management (CRUD, bulk upload)
- Vendor master data (admin CRUD, bulk upload; vendor self-onboarding in Vendor Management module)
- POI (Point of Interest) management (CRUD, geofence configuration)
- Product Category management (CRUD)
- Product management (CRUD, bulk upload)
- Supplier management (CRUD, bulk upload)
- Dealer management (CRUD, bulk upload)
- Route management (CRUD)
- Zone management (CRUD)

### Data Owned
- `vehicles` table
- `drivers` table
- `helpers` table
- `vendors` table (master record; Vendor Management module owns operational bid/invoice data)
- `pois` table
- `product_categories` table
- `products` table
- `suppliers` table
- `dealers` table
- `routes` table
- `zones` table

### API Surface
```
# Vehicles
GET    /api/v1/vehicles
POST   /api/v1/vehicles
GET    /api/v1/vehicles/{id}
PUT    /api/v1/vehicles/{id}
DELETE /api/v1/vehicles/{id}

# Drivers
GET    /api/v1/drivers
POST   /api/v1/drivers
GET    /api/v1/drivers/{id}
PUT    /api/v1/drivers/{id}
DELETE /api/v1/drivers/{id}

# Helpers
GET    /api/v1/helpers
POST   /api/v1/helpers          (also accepts multipart/form-data for bulk CSV upload)
GET    /api/v1/helpers/{id}
PUT    /api/v1/helpers/{id}
DELETE /api/v1/helpers/{id}

# Vendors (admin CRUD)
GET    /api/v1/master-data/vendors
POST   /api/v1/master-data/vendors    (also accepts multipart/form-data for bulk CSV upload)
GET    /api/v1/master-data/vendors/{id}
PUT    /api/v1/master-data/vendors/{id}
DELETE /api/v1/master-data/vendors/{id}

# POIs
GET    /api/v1/pois
POST   /api/v1/pois
GET    /api/v1/pois/{id}
PUT    /api/v1/pois/{id}
DELETE /api/v1/pois/{id}
PUT    /api/v1/pois/{id}/geofence

# Product Categories
GET    /api/v1/product-categories
POST   /api/v1/product-categories
GET    /api/v1/product-categories/{id}
PUT    /api/v1/product-categories/{id}
DELETE /api/v1/product-categories/{id}

# Products
GET    /api/v1/products
POST   /api/v1/products
GET    /api/v1/products/{id}
PUT    /api/v1/products/{id}
DELETE /api/v1/products/{id}

# Suppliers
GET    /api/v1/suppliers
POST   /api/v1/suppliers          (also accepts multipart/form-data for bulk CSV upload)
GET    /api/v1/suppliers/{id}
PUT    /api/v1/suppliers/{id}
DELETE /api/v1/suppliers/{id}

# Dealers
GET    /api/v1/dealers
POST   /api/v1/dealers            (also accepts multipart/form-data for bulk CSV upload)
GET    /api/v1/dealers/{id}
PUT    /api/v1/dealers/{id}
DELETE /api/v1/dealers/{id}

# Routes
GET    /api/v1/routes
POST   /api/v1/routes
GET    /api/v1/routes/{id}
PUT    /api/v1/routes/{id}
DELETE /api/v1/routes/{id}

# Zones
GET    /api/v1/zones
POST   /api/v1/zones
GET    /api/v1/zones/{id}
PUT    /api/v1/zones/{id}
DELETE /api/v1/zones/{id}
```

### Events Published
- `VehicleCreated`, `VehicleUpdated`, `VehicleDeleted`, `VehicleStatusChanged`
- `DriverCreated`, `DriverUpdated`, `DriverStatusChanged`
- `HelperCreated`, `HelperUpdated`, `HelperStatusChanged`
- `VendorMasterCreated`, `VendorMasterUpdated`, `VendorRegistrationStatusChanged`
- `POICreated`, `POIUpdated`, `GeofenceConfigured`
- `ProductCreated`, `ProductUpdated`
- `SupplierCreated`, `SupplierUpdated`
- `DealerCreated`, `DealerUpdated`
- `RouteCreated`, `RouteUpdated`

### Dependencies
- None (core foundation module)

### Business Rules
- VR-001 to VR-010 (Vehicle rules)
- DR-001 to DR-008 (Driver rules)
- HR-001 to HR-005 (Helper rules)
- VND-001 to VND-010 (Vendor master data rules)
- SUP-001 to SUP-005 (Supplier rules)
- DLR-001 to DLR-005 (Dealer rules)
- See [Business Rules](../../../02-domain/01-business-domain/business-rules/business-rules.md)

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
- See [Business Rules](../../../02-domain/01-business-domain/business-rules/business-rules.md)

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
- See [Business Rules](../../../02-domain/01-business-domain/business-rules/business-rules.md)

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
- See [Business Rules](../../../02-domain/01-business-domain/business-rules/business-rules.md)

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
- `gate_entries` table (13-state: pending → gate_in → loading → loading_complete → scale_in → in_transit → gate_out → unloading → scale_out → qc_pending → completed / on_hold / cancelled)
- `scale_in_entries` table (tare weight at origin)
- `scale_out_entries` table (gross/net weight at destination)
- `gate_passes` table (one-time token issued after scale-out)
- `temporary_parties` table (walk-in vendors/contractors)
- `loading_operations` table
- `unloading_operations` table

### API Surface
```
# Gate Entries
GET    /api/v1/operations/gate-entries
GET    /api/v1/operations/gate-entries/{id}
PATCH  /api/v1/operations/gate-entries/{id}
POST   /api/v1/operations/gate-in
POST   /api/v1/operations/gate-out

# Scale Operations (replaces generic /weighing)
POST   /api/v1/operations/scale-in
GET    /api/v1/operations/scale-in/{id}
PATCH  /api/v1/operations/scale-in/{id}       (correction — supervisor only)
POST   /api/v1/operations/scale-out
GET    /api/v1/operations/scale-out/{id}
PATCH  /api/v1/operations/scale-out/{id}      (correction — supervisor only)

# Gate Passes
POST   /api/v1/operations/gate-passes
GET    /api/v1/operations/gate-passes/{id}
POST   /api/v1/operations/gate-passes/{id}/validate

# Temporary Parties
GET    /api/v1/operations/temporary-parties
POST   /api/v1/operations/temporary-parties
GET    /api/v1/operations/temporary-parties/{id}

# Loading/Unloading
POST   /api/v1/operations/loading/start
POST   /api/v1/operations/loading/complete
GET    /api/v1/operations/loading/{id}
POST   /api/v1/operations/unloading/start
POST   /api/v1/operations/unloading/complete
GET    /api/v1/operations/unloading/{id}

# Command Centre
GET    /api/v1/operations/command-centre/dashboard
GET    /api/v1/operations/command-centre/active-trips
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
- See [Business Rules](../../../02-domain/01-business-domain/business-rules/business-rules.md)

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
- See [Business Rules](../../../02-domain/01-business-domain/business-rules/business-rules.md)

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
- See [Business Rules](../../../02-domain/01-business-domain/business-rules/business-rules.md)

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
- See [Business Rules](../../../02-domain/01-business-domain/business-rules/business-rules.md)

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
- See [Business Rules](../../../02-domain/01-business-domain/business-rules/business-rules.md)

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
- See [Business Rules](../../../02-domain/01-business-domain/business-rules/business-rules.md)

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
- See [Business Rules](../../../02-domain/01-business-domain/business-rules/business-rules.md)

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
- See [Business Rules](../../../02-domain/01-business-domain/business-rules/business-rules.md)

---

## 13. User Management & Authentication

### Purpose
Manage tenant users, roles, permissions, and all authentication flows. This is the foundational security module that all other modules depend on.

### Responsibilities
- User account creation, invitation, and lifecycle management
- 3-step authentication flow (email/phone → OTP → password)
- JWT issuance and refresh with tenant context embedded in token
- Session management (idle timeout, concurrent session limits)
- Role and permission management (4-tier hierarchy)
- OTP generation and verification (account lockout after failed attempts)
- Multi-tenant context enforcement: `django-tenants` middleware sets `search_path` per request based on JWT's `tenant_schema` claim

### Data Owned
- `users` table
- `roles` table
- `permissions` table
- `role_permissions` table
- `user_roles` table
- `otp_records` table
- `user_sessions` table
- `invitation_tokens` table

### API Surface
```
# Authentication
POST   /api/v1/auth/request-otp
POST   /api/v1/auth/verify-otp
POST   /api/v1/auth/login
POST   /api/v1/auth/token/refresh
POST   /api/v1/auth/logout

# User Management
GET    /api/v1/users
POST   /api/v1/users/invite
GET    /api/v1/users/{id}
PUT    /api/v1/users/{id}
DELETE /api/v1/users/{id}
POST   /api/v1/users/{id}/activate
POST   /api/v1/users/{id}/deactivate

# Roles & Permissions
GET    /api/v1/roles
POST   /api/v1/roles
GET    /api/v1/roles/{id}
PUT    /api/v1/roles/{id}
DELETE /api/v1/roles/{id}
GET    /api/v1/permissions
POST   /api/v1/users/{id}/roles
DELETE /api/v1/users/{id}/roles/{role_id}

# Profile
GET    /api/v1/auth/me
PUT    /api/v1/auth/me
POST   /api/v1/auth/change-password
```

### Events Published
- `UserCreated`
- `UserInvited`
- `UserActivated`
- `UserDeactivated`
- `UserLoggedIn`
- `UserLoggedOut`
- `RoleAssigned`
- `RoleRevoked`
- `AccountLocked`
- `PasswordChanged`

### Events Consumed
- None (upstream module)

### Dependencies
- **Tenant Registry** (public schema): Validates tenant context during login
- **Email / SMS Gateway**: OTP and invitation delivery

### Business Rules
- AUTH-001: 3-step login: email/phone → OTP (5 min TTL) → password
- AUTH-002: Account locked after 5 consecutive failed login attempts (30 min lock)
- AUTH-003: JWT contains `tenant_schema`, `user_id`, `roles`, `permissions`
- AUTH-004: Session idle timeout configurable per tenant (default 30 min)
- AUTH-005: Maximum concurrent sessions per user configurable (default 3)
- RBAC-001: Super Admin has implicit access to all resources
- RBAC-002: Permissions follow `Module.Feature.Action` dot-notation
- RBAC-003: Wildcard `Module.*` grants all permissions for a module
- RBAC-004: `is_approver` flag prevents self-approval in workflows
- See [Authentication Spec](../../../05-modules/01-foundation/authentication-security.md)
- See [RBAC Spec](../../../05-modules/01-foundation/rbac.md)

---

## 📊 Module Dependency Matrix

| Module | Depends On |
|--------|------------|
| User Management & Auth | Tenant Registry only |
| Master Data | User Management (auth) |
| Product Requisition | Master Data, User Management |
| Transport | Master Data, Product Requisition, User Management |
| Vendor | Master Data, Transport, User Management |
| Operations | Transport, Master Data, User Management |
| Quality Control | Operations, Transport, User Management |
| Fleet (Phase 2) | Master Data, Transport |
| Fuel (Phase 2) | Fleet, Transport |
| Trip Costing | Transport, Vendor, Operations, QC |
| Reporting | All modules (read-only) |
| Mobile | Transport, QC, Vendor, User Management |
| Notifications | All modules (event consumers) |

---

## 🔗 Related Documents

- [Module Interactions](./module-interactions.md) - Communication patterns
- [Container View](../container-view.md) - Technical containers
- [Business Rules](../../../02-domain/01-business-domain/business-rules/business-rules.md)
- [User Stories](../../../02-domain/03-backlog/phase-1/user-stories/)

---

**Document Status**: Active  
**Last Updated**: March 2026  
**Contact**: Md. Mahfuzur Rahman (Mahfuzur.rahman@brainstation-23.com)

