# DFMS Data Model Overview

> High-level data entities and relationships

**Status**: Active
**Last Updated**: March 2026

---

## Overview

This document provides a high-level overview of all DFMS data entities, their ownership, relationships, and access patterns. Detailed PostgreSQL DDL, constraints, and indexes are in [Database Implementation](../../04-backend/database-implementation.md). Django ORM models are in the [development guides](../../../..../../08-development-guides/01-backend/03-database/models.md).

---

## Multi-Tenancy Architecture

The platform uses **schema-per-tenant** for all subscription tiers, managed via the `django-tenants` library.

```
PostgreSQL Server
├── public (shared schema)
│   ├── tenants
│   ├── subscription_plans
│   └── audit_logs  (partitioned by month)
│
├── tenant_001  (e.g., Nourish Poultry)
│   ├── users, roles, permissions ...
│   ├── vehicles, drivers, vendors ...
│   ├── trips, transport_orders ...
│   └── (all domain tables)
│
└── tenant_002  (e.g., ABC Logistics)
    └── (same table set, fully isolated)
```

**Key properties**:
- Every tenant gets a dedicated PostgreSQL schema — no `tenant_id` column needed in application queries
- `django-tenants` sets `search_path` automatically per request based on subdomain/domain routing
- Independent backup and restore per tenant
- No risk of cross-tenant data leakage at the query level
- Migrations run per schema via `migrate_schemas` management command

---

## Data Entities by Module

### Public Schema (Shared)

| Entity | Table | Purpose |
|---|---|---|
| Tenant | `public.tenants` | Tenant registry, schema names, subscription |
| Subscription Plan | `public.subscription_plans` | Feature/limit tiers |
| Audit Log | `public.audit_logs` | Cross-tenant immutable audit trail |

---

### Foundation — Auth & RBAC

| Entity | Table | Purpose |
|---|---|---|
| User | `users` | All human users across all tiers |
| Role | `roles` | Named permission sets (system + custom) |
| Permission | `permissions` | Atomic `Module.Feature.Action` strings |
| Role Permission | `role_permissions` | M2M: roles ↔ permissions |
| User Role | `user_roles` | M2M: users ↔ roles + functional flags |
| OTP Record | `otp_records` | Login/invitation OTP tokens |
| User Session | `user_sessions` | Active JWT session tracking |
| Invitation Token | `invitation_tokens` | Email invite flows |

**Key relationships**:
- Users are assigned one or more roles via `user_roles`
- Roles aggregate permissions via `role_permissions`
- `roles.tenant_id` is nullable — null means a system-predefined role shared across tenants
- `user_roles` carries `is_requester`, `is_approver`, `is_executor` flags for workflow control

---

### Master Data

| Entity | Table | Owner Module | Purpose |
|---|---|---|---|
| Product Category | `product_categories` | Master Data | Hierarchical product taxonomy |
| Product | `products` | Master Data | Products being transported |
| POI | `pois` | Master Data | Locations with geofencing (factory, warehouse, depot) |
| Vehicle | `vehicles` | Master Data | Own and vendor fleet |
| Driver | `drivers` | Master Data | Driver profiles and license tracking |
| Helper | `helpers` | Master Data | Loading/unloading helpers |
| Vendor | `vendors` | Vendor Management | Third-party transport companies |
| Vendor Document | `vendor_documents` | Vendor Management | KYC/compliance documents |
| Supplier | `suppliers` | Master Data | Raw material / product suppliers |
| Dealer | `dealers` | Master Data | Delivery recipients / distributors |
| Route | `routes` | Master Data | Source→destination with distance and rate cards |

---

### Transport Workflow

| Entity | Table | Owner Module | Purpose |
|---|---|---|---|
| Product Requisition | `product_requisitions` | Product Requisition | Demand for product transport |
| PR Line Item | `pr_line_items` | Product Requisition | Per-product line within a PR |
| Transport Requisition | `transport_requisitions` | Transport Management | Approved transport need (from PR) |
| Transport Order | `transport_orders` | Transport Management | Assigned dispatch instruction |
| Bidding Parameters | `bidding_parameters` | Vendor Management | Bid window config per TO |
| Vendor Bid | `vendor_bids` | Vendor Management | Vendor offers on a TO |
| Trip | `trips` | Transport Management | Physical vehicle journey |
| Trip Incident | `trip_incidents` | Transport Management | Breakdowns, delays, deviations |
| GPS Tracking | `gps_tracking` | Transport Management | Vehicle location stream (partitioned) |

**Workflow chain**:

```
Product Requisition → Transport Requisition → Transport Order
                                                    ↓
                                 [Bidding if vendor fleet] → Vendor Bid
                                                    ↓
                                                  Trip → GPS Tracking
```

---

### Gate & Weighing Operations

| Entity | Table | Owner Module | Purpose |
|---|---|---|---|
| Gate Entry | `gate_entries` | Gate Operations | Vehicle arrival registration (13-state lifecycle) |
| Gate Exit | `gate_exits` | Gate Operations | Vehicle departure record |
| Gate Pass | `gate_passes` | Gate Operations | Clearance token linking scale-out to exit |
| Scale In Entry | `scale_in_entries` | Gate Operations | Gross weight measurement (incoming) |
| Scale Out Entry | `scale_out_entries` | Gate Operations | Tare weight + net weight + gate pass |
| Temporary Party | `temporary_parties` | Gate Operations | Unregistered supplier/dealer at gate |

**Gate entry lifecycle**:

```
REGISTERED → AWAITING_SCALE_IN → SCALE_IN_COMPLETE
    → AWAITING_QC / AWAITING_LOADING / AWAITING_UNLOADING
    → QC_IN_PROGRESS / LOADING_IN_PROGRESS / UNLOADING_IN_PROGRESS
    → AWAITING_SCALE_OUT → SCALE_OUT_COMPLETE → CLEARED_FOR_EXIT → GATE_OUT_COMPLETE
```

---

### QC Inspection

| Entity | Table | Owner Module | Purpose |
|---|---|---|---|
| QC Event | `qc_events` | Quality Control | Master QC record per shipment (11-state lifecycle) |
| QC Sample | `qc_samples` | Quality Control | Physical samples collected |
| QC Checklist | `qc_checklists` | Quality Control | Inspection template per product/category |
| QC Checklist Item | `qc_checklist_items` | Quality Control | Individual inspection criteria |
| QC Inspection | `qc_inspections` | Quality Control | Physical inspection execution |
| QC Inspection Result | `qc_inspection_results` | Quality Control | Per-item pass/fail results |
| Lab Test Request | `lab_test_requests` | Quality Control | Lab analysis request |
| Lab Test Result | `lab_test_results` | Quality Control | Lab measurement outcomes |
| QC Evidence | `qc_evidence` | Quality Control | Photos, videos, documents |

**QC event lifecycle**:

```
EVENT_CREATED → SAMPLE_COLLECTED → INSPECTION_IN_PROGRESS
    → LAB_TEST_REQUESTED → LAB_TEST_IN_PROGRESS → LAB_RESULTS_RECEIVED
    → QC_PASS / QC_FAIL / QC_RECHECK → QC_COMPLETE
    (or QC_AUTO_PASS for pre-approved shipments)
```

---

### Trip Costing & Invoicing

| Entity | Table | Owner Module | Purpose |
|---|---|---|---|
| Trip Cost | `trip_costs` | Trip Costing | Cost breakdown per trip (own fleet or vendor) |
| Vendor Invoice | `vendor_invoices` | Trip Costing | Vendor billing record per trip |
| Notification | `notifications` | Cross-cutting | Multi-channel delivery log (email, SMS, push, in-app) |

---

## High-Level Entity Relationship

```
public.tenants
    └── [per-tenant schema]
          ├── users ──────── user_roles ──── roles ── role_permissions ── permissions
          │
          ├── product_categories
          ├── products ─────────────────────────────────────────────────────────────────┐
          ├── pois                                                                      │
          ├── routes ── (source_poi, destination_poi)                                  │
          ├── suppliers / dealers                                                       │
          ├── vendors ─── vehicles ─── drivers                                         │
          │               helpers                                                       │
          │                                                                             │
          ├── product_requisitions ─── pr_line_items ─────────────────────────────────-┘
          │       ↓
          ├── transport_requisitions
          │       ↓
          ├── transport_orders ─── bidding_parameters ─── vendor_bids
          │       ↓
          ├── trips ─── trip_incidents
          │    ↓    └── gps_tracking
          │    │
          ├── gate_entries ── scale_in_entries ── scale_out_entries ── gate_passes
          │       └── gate_exits
          │       └── temporary_parties
          │
          ├── qc_events ─── qc_samples ── lab_test_requests ── lab_test_results
          │       └── qc_inspections ── qc_inspection_results
          │       └── qc_evidence
          │
          ├── trip_costs
          ├── vendor_invoices
          └── notifications
```

---

## Data Ownership by Module

| Entity / Table | Owner Module | Access Pattern |
|---|---|---|
| `users` | Foundation | CRUD via API |
| `roles`, `permissions` | Foundation | CRUD via API (admin only) |
| `product_categories`, `products` | Master Data | CRUD via API, events on change |
| `pois` | Master Data | CRUD via API, events on change |
| `vehicles`, `drivers`, `helpers` | Master Data | CRUD via API, events on change |
| `vendors`, `vendor_documents` | Vendor Management | CRUD via API |
| `suppliers`, `dealers`, `routes` | Master Data | CRUD via API |
| `product_requisitions`, `pr_line_items` | Product Requisition | CRUD via API, events for approval |
| `transport_requisitions` | Transport Management | CRUD via API, events for lifecycle |
| `transport_orders` | Transport Management | CRUD via API, events for lifecycle |
| `vendor_bids`, `bidding_parameters` | Vendor Management | CRUD via API, events for acceptance |
| `trips`, `trip_incidents` | Transport Management | CRUD via API, events for lifecycle |
| `gps_tracking` | Transport Management | Write via mobile SDK, read via API |
| `gate_entries`, `gate_exits`, `gate_passes` | Gate Operations | CRUD via API, events |
| `scale_in_entries`, `scale_out_entries` | Gate Operations | CRUD via API, events |
| `temporary_parties` | Gate Operations | CRUD via API |
| `qc_events`, `qc_samples` | Quality Control | CRUD via API, events |
| `qc_checklists`, `qc_checklist_items` | Quality Control | CRUD via API (admin config) |
| `qc_inspections`, `qc_inspection_results` | Quality Control | CRUD via API, events |
| `lab_test_requests`, `lab_test_results` | Quality Control | CRUD via API |
| `qc_evidence` | Quality Control | CRUD via API + S3 |
| `trip_costs` | Trip Costing | CRUD via API, events |
| `vendor_invoices` | Trip Costing | CRUD via API, events |
| `notifications` | Cross-cutting | Write by any module, read by recipient |
| `public.audit_logs` | Cross-cutting | Append-only via trigger |

---

## Data Access Patterns

### Direct Ownership (CRUD)
Each module has full CRUD access to its own tables within the tenant schema.

```python
# Transport module owns trips — no tenant filter needed
trip = Trip.objects.create(vehicle=vehicle, driver=driver, ...)
```

### Read via API (Reference Data)
Modules read other modules' data through internal service calls.

```python
# Transport reads vehicle availability from Master Data service
vehicle = master_data_service.get_available_vehicle(vehicle_type)
```

### Event Notification (State Changes)
Modules publish domain events when data state changes.

```python
# Gate Operations publishes event → QC module listens
event_bus.publish(GateScaleInComplete(gate_in_id=gate_in.id, ...))
```

### Aggregated Reporting (Read Replicas)
Reporting module reads from a read replica to avoid impacting operational DB.

```python
trips = Trip.objects.using('read_replica').filter(status='completed')
```

---

## Related Documents

- [Database Implementation](../../04-backend/database-implementation.md) — Full PostgreSQL DDL
- [Data Flow](./data-flow.md) — How data moves through the system
- [ERD Diagram](../../05-diagrams/data/entity-relationship-diagram.mmd) — Visual entity relationships
- [Module Boundaries](../modules/module-boundaries.md) — Module data ownership
- [Django ORM Models](../../../..../../08-development-guides/01-backend/03-database/models.md) — ORM implementation

---

**Document Status**: Active
**Last Updated**: March 2026
**Contact**: Md. Mahfuzur Rahman (Mahfuzur.rahman@brainstation-23.com)
