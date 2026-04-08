# 02-master-data - Master Data Management

## Module Overview

This module defines master data configuration and management for the DFMS platform, including product inventory management (PIM) and POI (Point of Interest) management with geofencing capabilities.

**Purpose**: Centralized management of foundational business entities  
**PRD Sections**: 6.3, 6.4, 6.5  
**Phase**: Phase 1 (Critical)  
**Dependencies**: `01-foundation/` (authentication, RBAC)

---

## Module Contents

### 📄 Specifications

**Note**: All specification files are written in **domain knowledge format**, explaining how the system works conceptually with technical details, data models, and implementation guidance. They maintain traceability to user stories while focusing on architecture and mechanisms rather than requirements.

| File | Description | PRD Section | Related Stories | Lines |
|------|-------------|-------------|-----------------|-------|
| [poi-management.md](poi-management.md) | POI entity model, geofencing system (entry/exit detection), capacity tracking (stock/in-transit/warnings), lifecycle management, operational classification, integrations with requisitions/trips/gate/QC | 6.5.1-6.5.8 | US-014 | 588 |
| [product-inventory-management.md](product-inventory-management.md) | Product data model (FG/RM), catalogue management, transport configuration (vehicle compatibility, special handling), QC configuration (checklists, auto-pass), product lifecycle, search/filtering | 6.4.1-6.4.3 | Integrated in requisition workflows | 551 |
| [master-data-configuration.md](master-data-configuration.md) | Master data architecture (vehicles, drivers, helpers, vendors), vehicle capacity calculation, driver-vehicle assignment, bulk upload/management, referential integrity, data quality controls | 6.3.1-6.3.4 | US-053, US-057, US-061, US-047 | 513 |
| [helper-master-data.md](helper-master-data.md) | Helper entity model, assignment logic, availability status tracking, lifecycle management, and integration with trip execution | 6.3.3 | US-061 | 290 |

**Total Documentation**: ~1,940 lines of comprehensive technical specifications

---

## Key Features

### Master Data Configuration
- **Entity Registration**: POIs, Vehicles, Drivers, Helpers, Vendors, Routes, Products, QC Checklists
- **Bulk Upload**: CSV-based bulk data import with validation
- **Inline Management**: Create, edit, delete with full audit trail
- **Referential Integrity**: Cascade rules and dependency validation
- **Active/Inactive Control**: Soft delete with status management

### Product Inventory Management (PIM)
- **Product Catalog**: Finished Goods (FG) and Raw Material (RM) master
- **Product Attributes**: SKU, category, UOM, weight, QC requirements
- **Transport Attributes**: Vehicle type compatibility, load/unload requirements
- **QC Attributes**: QC checklist mapping, sampling requirements, test parameters

### POI Management & Geofencing
- **POI Types**: Factory, Feed Mill, Depot, Warehouse, Port, Dealer, Supplier
- **GPS Coordinates**: Lat/long with geofence radius
- **Capacity Tracking**: Total capacity, current stock, free capacity, in-transit
- **Geofence Alerts**: Vehicle entry/exit detection
- **Operational Role**: Inbound, outbound, neutral classification

---

## Dependencies

### Upstream Dependencies
- **`01-foundation/`**:
  - User authentication and authorization (RBAC)
  - Tenant context for data isolation
  - Audit logging for master data changes

### Downstream Dependencies
**Modules that depend on this master data**:
- **`03-operations/`**: Requisitions, TRs, TOs, Trips all reference master data
- **`04-poi-operations/`**: Gate, scaling, QC operations use POI and product data
- **`05-vendor-management/`**: Vendor onboarding creates vendor master records
- **`06-fleet-management/`**: Vehicle, driver, helper registration
- **All operational modules**: Reference master data for entities

### Cross-Module References
- **POI Data** referenced by: Requisitions, TRs, TOs, Trips, Gate operations
- **Product Data** referenced by: Requisitions, QC workflows, Loading operations
- **Vendor Data** referenced by: Vendor management, bidding, TO execution
- **Vehicle/Driver Data** referenced by: Fleet management, trip execution

---

## Related User Stories

### Direct Stories
| Story ID | Title | Feature Area |
|----------|-------|--------------|
| US-014 | Capacity Checking and Warnings | POI Management |

### Master Data Embedded in Workflows
Master data creation is integrated into workflow stories:
- **US-053**: Vehicle Registration & Master Data
- **US-057**: Driver Master Data
- **US-061**: Helper Profile
- **US-047**: Vendor Registration
- Product and POI data managed through admin interfaces (no dedicated stories)

**Location**: `../../04-backlog/phase-1/user-stories/`

---

## Data Model Highlights

### POI (Point of Interest)
```typescript
POI {
  poi_id: UUID
  poi_name: string
  poi_type: enum [Factory, FeedMill, Depot, Warehouse, Port, Dealer, Supplier]
  address: string
  latitude: Decimal
  longitude: Decimal
  geofence_radius: Integer (meters)
  total_capacity: Decimal (MT)
  current_stock: Decimal (MT)
  free_capacity: Decimal (computed)
  in_transit_stock: Decimal
  operational_role: enum [Inbound, Outbound, Neutral]
  contact_person: string
  contact_phone: string
  status: enum [Active, Inactive]
  tenant_id: UUID
}
```

### Product
```typescript
Product {
  product_id: UUID
  product_code: string (SKU)
  product_name: string
  category: string
  sub_category: string
  unit_of_measure: enum [MT, KG, Bag, Pcs]
  standard_weight_per_unit: Decimal
  requires_qc: Boolean
  qc_checklist_id: UUID (nullable)
  vehicle_type_compatibility: JSON
  status: enum [Active, Inactive]
  tenant_id: UUID
}
```

### Master Entity (Generic)
```typescript
MasterEntity {
  entity_id: UUID
  entity_type: enum [Vehicle, Driver, Helper, Vendor, Route, Product, POI, QCChecklist]
  entity_data: JSON
  status: enum [Active, Inactive]
  created_by: UUID
  created_at: DateTime
  updated_by: UUID
  updated_at: DateTime
  tenant_id: UUID
}
```

---

## API Endpoints

### POI Management
```typescript
GET /api/v1/pois
POST /api/v1/pois
GET /api/v1/pois/{poi_id}
PUT /api/v1/pois/{poi_id}
DELETE /api/v1/pois/{poi_id}
GET /api/v1/pois/{poi_id}/capacity
POST /api/v1/pois/bulk-upload
```

### Product Management
```typescript
GET /api/v1/products
POST /api/v1/products
GET /api/v1/products/{product_id}
PUT /api/v1/products/{product_id}
DELETE /api/v1/products/{product_id}
POST /api/v1/products/bulk-upload
```

### Master Data Generic
```typescript
GET /api/v1/master-data/{entity_type}
POST /api/v1/master-data/{entity_type}
PUT /api/v1/master-data/{entity_type}/{entity_id}
POST /api/v1/master-data/bulk-upload
GET /api/v1/master-data/validation-rules
```

---

## Business Rules

### POI Management
1. **Geofence Radius**: Minimum 50m, maximum 5000m
2. **Capacity Tracking**: Updated on loading completion (source) and QC-passed unloading (destination)
3. **In-Transit Stock**: Calculated from active trips with source/destination POI
4. **Free Capacity**: `Total Capacity - Current Stock - In Transit (destination)`

### Product Management
1. **SKU Uniqueness**: Product codes must be unique per tenant
2. **QC Requirement**: If `requires_qc = true`, must have valid `qc_checklist_id`
3. **Vehicle Compatibility**: Liquid products → tanker only, bulk → covered trucks

### Data Consistency
1. **Referential Integrity**: Cannot delete POI/Product referenced in active trips
2. **Bulk Upload Validation**: All rows validated before commit, rollback on any error
3. **Audit Trail**: All create/update/delete operations logged with user and timestamp

---

## Implementation Priority

**Phase 1 - Critical**:
1. POI Registration & CRUD ⭐⭐⭐
2. Product Catalog Management ⭐⭐⭐
3. POI Capacity Tracking (US-014) ⭐⭐⭐
4. Bulk Upload (CSV) ⭐⭐
5. Geofencing Setup ⭐⭐
6. Data Consistency Rules ⭐⭐
7. Master Data Audit Trail ⭐

---

## Testing Scenarios

### POI Management
- Create POI with GPS coordinates and geofence
- Update POI capacity and validate free capacity calculation
- Deactivate POI with active references (should fail)
- Bulk upload POIs from CSV with validation errors

### Product Management
- Create product with QC requirements
- Update product attributes and vehicle compatibility
- Link product to QC checklist
- Deactivate product with active requisitions (should fail)

### Capacity Tracking
- Create requisition and check source/destination capacity warnings
- Complete loading and verify source capacity reduction
- Complete QC-pass unloading and verify destination capacity increase
- Check in-transit stock calculation

---

## Quick Links

- **[Module Index](../README.md)** - Back to module specifications index
- **[Complete Index](../INDEX.md)** - Full content index
- **[Source PRD](../../../01-source/01-prd/PRD_DFMS_v1.0.md)** - Original PRD document
- **[User Stories](../../04-backlog/phase-1/user-stories/)** - Implementation stories

---

**Last Updated**: 2026-02-26  
**Status**: Complete  
**Previous Module**: [01-foundation/](../01-foundation/README.md) - System Foundation  
**Next Module**: [03-operations/](../03-operations/README.md) - Core Operations
