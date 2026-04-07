---
title: Route, Supplier & Dealer Master Data Configuration
story_id: US-096
phase: phase-1
module: Master Data Management
priority: Critical
status: Pending
epic: Master Data Foundation
epic_id: EPIC-003
epic_name: Master Data Configuration
sprint: Sprint 2
story_points: 5
created: 2026-03-06
updated: 2026-03-06
source_documents:
  - ../../../../01-source/01-prd/PRD_DFMS_v1.0.md
related_stories:
  - US-047-vendor-master-data.md
  - US-053-vehicle-registration-master-data.md
  - US-057-driver-master-data.md
  - US-010-port-transfer-requisition.md
dependencies:
  - US-004-role-hierarchy.md
tags: [master-data, route, supplier, dealer, admin, critical]
---

# US-096: Route, Supplier & Dealer Master Data Configuration

## User Story

**As a** Tenant Admin  
**I want to** register and manage Routes, Suppliers, and Dealers as master data records  
**So that** Transport Orders can reference valid routes, and Gate Management can correctly identify supplier and dealer parties during inbound/outbound operations

## Business Context

Routes, Suppliers, and Dealers are foundational reference data required by multiple DFMS workflows:

- **Routes** are used by Transport Orders to define source-to-destination paths, estimated distance, and duration. Without route master data, TO creation cannot calculate distances, costs, or validate source/destination POI combinations.
- **Suppliers** are raw material providers who deliver goods to feed mills and factories. Gate Management needs verified supplier records to register inbound vehicles with on-demand TO creation (US-065 — Supplier Entry).
- **Dealers** are finished goods distributors who receive product from depots. Gate Management needs verified dealer records to register outbound vehicles with on-demand TO creation (US-064 — Dealer Entry).

**PRD Source Sections:**
- **6.3.1** Entity Registration (Master Setup) — Routes, Supplier Master, Dealer Master
- **6.3.2** Bulk Upload & Inline Master Data Management
- **6.3.3** Master Tables (CRUD Operations)

---

## Acceptance Criteria

### AC-1: Route Master (per PRD 6.3.1)
- [ ] System SHALL provide a **Routes** setup menu under Master Data Configuration
- [ ] Admin SHALL be able to create a Route with:
  - Route Name (required, unique within tenant)
  - Source POI (required, select from active POIs)
  - Destination POI (required, select from active POIs)
  - Distance (KM, numeric, required)
  - Estimated Duration (hours, numeric, optional)
  - Route Type: One-Way / Round-Trip
  - Status: Active / Inactive
- [ ] Route must map to a valid Source POI + Destination POI (referential integrity)
- [ ] Only Active routes SHALL be selectable in TO creation
- [ ] System SHALL prevent deletion of routes referenced in active TOs or Trips
- [ ] Bulk CSV upload SHALL be supported for routes

### AC-2: Supplier Master (per PRD 6.3.1)
- [ ] System SHALL provide a **Suppliers** setup menu under Master Data Configuration
- [ ] Admin SHALL be able to create a Supplier with:
  - Supplier Name (required, unique within tenant)
  - Supplier Code (required, unique)
  - Contact Person Name (optional)
  - Contact Phone (optional)
  - Contact Email (optional)
  - Address (optional)
  - Status: Active / Inactive
- [ ] Only Active suppliers SHALL be selectable in gate on-demand TO creation (US-065)
- [ ] Bulk CSV upload SHALL be supported for suppliers

### AC-3: Dealer Master (per PRD 6.3.1)
- [ ] System SHALL provide a **Dealers** setup menu under Master Data Configuration
- [ ] Admin SHALL be able to create a Dealer with:
  - Dealer Name (required, unique within tenant)
  - Dealer Code (required, unique)
  - Contact Person Name (optional)
  - Contact Phone (optional)
  - Contact Email (optional)
  - Address (optional)
  - Status: Active / Inactive
- [ ] Only Active dealers SHALL be selectable in gate on-demand TO creation (US-064)
- [ ] Bulk CSV upload SHALL be supported for dealers

### AC-4: Shared CRUD Behaviour (per PRD 6.3.3)
- [ ] All three entities (Routes, Suppliers, Dealers) SHALL have:
  - Paginated list view with search, sort, and filter by Status
  - Inline editing for simple fields
  - Full edit form for all fields
  - Soft delete (mark Inactive) with dependency check
  - Hard delete blocked if entity is referenced in any TR / TO / Trip / Gate record
  - Audit log entry on every create, update, and deactivate: User ID, Timestamp, Field, Old value, New value

### AC-5: Bulk Upload (per PRD 6.3.2)
- [ ] System SHALL provide bulk CSV upload for Routes, Suppliers, and Dealers
- [ ] System SHALL provide a downloadable CSV template per entity with mandatory fields marked
- [ ] Bulk upload SHALL be append-only (no overwrite of existing records)
- [ ] Row-level validation with error report (successful rows, failed rows with reason)
- [ ] All bulk upload actions SHALL be audit logged

---

## Functional Requirements

### FR-001: Route CRUD
- [Critical] Route master with source/destination POI linkage
- [Critical] Only Active routes selectable in TO workflows
- [High] Distance and estimated duration used in trip costing (US-059)
- [High] Referential integrity: Cannot delete routes linked to active TOs

### FR-002: Supplier CRUD
- [Critical] Supplier master for gate inbound on-demand TO (US-065)
- [High] Supplier Code uniqueness within tenant

### FR-003: Dealer CRUD
- [Critical] Dealer master for gate outbound on-demand TO (US-064)
- [High] Dealer Code uniqueness within tenant

### FR-004: Bulk Upload & Inline Edit (per PRD 6.3.2)
- [Critical] CSV bulk upload with downloadable templates for all three entities
- [Critical] Append-only upload, row-level error reporting
- [Critical] Inline editing (row-level and column-level)
- [Critical] Audit logging for all bulk and inline operations

---

## Data Model

```typescript
interface RouteMaster {
  id: UUID;
  tenant_id: UUID;
  route_name: string;             // Unique within tenant
  source_poi_id: UUID;            // FK → POI (US-097)
  destination_poi_id: UUID;       // FK → POI (US-097)
  distance_km: number;
  estimated_duration_hours?: number;
  route_type: 'ONE_WAY' | 'ROUND_TRIP';
  status: 'ACTIVE' | 'INACTIVE';
  created_at: Timestamp;
  created_by: UUID;
  updated_at: Timestamp;
  updated_by: UUID;
}

interface SupplierMaster {
  id: UUID;
  tenant_id: UUID;
  supplier_name: string;          // Unique within tenant
  supplier_code: string;          // Unique within tenant
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  address?: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: Timestamp;
  created_by: UUID;
  updated_at: Timestamp;
  updated_by: UUID;
}

interface DealerMaster {
  id: UUID;
  tenant_id: UUID;
  dealer_name: string;            // Unique within tenant
  dealer_code: string;            // Unique within tenant
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  address?: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: Timestamp;
  created_by: UUID;
  updated_at: Timestamp;
  updated_by: UUID;
}
```

---

## API Endpoints

```typescript
// Routes
POST   /api/v1/routes
GET    /api/v1/routes?status=ACTIVE&source_poi_id=&destination_poi_id=
GET    /api/v1/routes/{route_id}
PATCH  /api/v1/routes/{route_id}
DELETE /api/v1/routes/{route_id}
POST   /api/v1/routes/bulk-upload
GET    /api/v1/routes/bulk-upload/template

// Suppliers
POST   /api/v1/suppliers
GET    /api/v1/suppliers?status=ACTIVE
GET    /api/v1/suppliers/{supplier_id}
PATCH  /api/v1/suppliers/{supplier_id}
DELETE /api/v1/suppliers/{supplier_id}
POST   /api/v1/suppliers/bulk-upload
GET    /api/v1/suppliers/bulk-upload/template

// Dealers
POST   /api/v1/dealers
GET    /api/v1/dealers?status=ACTIVE
GET    /api/v1/dealers/{dealer_id}
PATCH  /api/v1/dealers/{dealer_id}
DELETE /api/v1/dealers/{dealer_id}
POST   /api/v1/dealers/bulk-upload
GET    /api/v1/dealers/bulk-upload/template
```

---

## Business Rules

### BR-MDC-001: Route POI Referential Integrity
- Route source and destination must map to valid, active POIs
- **Enforcement**: FK constraint + API validation against active POI list

### BR-MDC-002: Unique Codes
- Supplier Code and Dealer Code must be unique within a tenant
- **Enforcement**: Database unique constraint (tenant_id + code)

### BR-MDC-003: Delete Restriction
- Routes: Hard delete blocked if referenced in TR / TO / Trip
- Suppliers: Hard delete blocked if referenced in Gate records
- Dealers: Hard delete blocked if referenced in Gate records
- **Enforcement**: Dependency check before delete action

### BR-MDC-004: Inactive Records
- Inactive routes/suppliers/dealers cannot be selected in new transactions
- **Enforcement**: Filtered queries (status = ACTIVE) in all dependent workflows

---

## Dependencies

### Prerequisites
- US-004: Role Hierarchy (RBAC)
- US-097: POI Management (Routes reference POIs as FK)

### Enables
- US-064: On-Demand TO Creation — Dealer Entry (requires active Dealer records)
- US-065: On-Demand TO Creation — Supplier Entry (requires active Supplier records)
- US-015–US-020: Transport Order Management (TO creation references Routes)
- US-059: Trip Cost Calculation (uses Route distance for cost computation)

---

## Definition of Done
- [ ] Route CRUD fully functional with POI linkage
- [ ] Supplier CRUD fully functional
- [ ] Dealer CRUD fully functional
- [ ] List views with search, filter, sort, pagination working for all three
- [ ] Bulk CSV upload with templates and row-level error reporting working
- [ ] Inline editing with audit log working
- [ ] Active/Inactive control enforced in dependent workflows
- [ ] Hard delete restriction working for all three entities
- [ ] Unit tests > 85%
- [ ] UAT approved

---

**Story Points**: 5
**Estimated Hours**: 40 hours
**Sprint**: Sprint 2
**Priority**: Critical

---

**PRD References**:
- Section 6.3.1: Entity Registration (Master Setup) — Route, Supplier Master, Dealer Master
- Section 6.3.2: Bulk Upload & Inline Master Data Management
- Section 6.3.3: Master Tables (CRUD Operations)

**Last Updated**: 2026-03-06
