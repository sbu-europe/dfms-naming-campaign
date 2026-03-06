---
title: Vendor Master Data Configuration (Admin CRUD & Bulk Upload)
story_id: US-047
phase: phase-1
module: Master Data Management
priority: Critical
status: Pending
epic: Master Data Foundation
epic_id: EPIC-006
epic_name: Fleet & Vehicle Management
sprint: Sprint 2
story_points: 5
created: 2026-02-11
updated: 2026-03-06
source_documents:
  - ../../../../01-source/01-prd/PRD_DFMS_v1.0.md
  - ../../../03-module-specifications/05-vendor-management/vendor-onboarding.md
related_stories:
  - US-027-vendor-registration-verification.md
  - US-024-vendor-bidding-portal.md
dependencies:
  - US-004-role-hierarchy.md
tags: [master-data, vendor, crud, bulk-upload, admin, critical]
---

# US-047: Vendor Master Data Configuration (Admin CRUD & Bulk Upload)

## User Story

**As a** Tenant Admin  
**I want to** register and manage vendor master records (CRUD) and bulk upload vendor data via CSV  
**So that** all vendor-dependent DFMS workflows (TR/TO assignment, bidding, trip execution) operate from a consistent, accurate, and auditable vendor data foundation

## Business Context

Vendor master data is a prerequisite for all vendor operations in DFMS. Before any vendor can receive a Transport Order, participate in bidding, or be assigned to a trip, their core record must exist in the system. This story covers the **internal admin-side management** of that record — creating, reading, updating, and deactivating vendor entities — and bulk onboarding via CSV import.

This story is **distinct from US-027** (Vendor Registration & Verification Workflow), which covers the external-facing self-registration form and document verification process that vendors themselves initiate. US-047 is completed first (Sprint 2) so the data foundation exists before the operational workflow (US-027, Sprint 7–8) is built on top of it.

**PRD Source Sections:**
- **6.3.1** Entity Registration (Master Setup) — vendor entity fields and admin setup menu
- **6.3.2** Bulk Upload & Inline Master Data Management — CSV import, inline editing
- **6.3.3** Master Tables (CRUD Operations) — list view, search, pagination, soft/hard delete

---

## Acceptance Criteria

### AC-1: Vendor Master Setup Menu (per PRD 6.3.1)
- [ ] System SHALL provide a **Transport Vendors** setup menu under Master Data Configuration
- [ ] Setup menu SHALL be accessible only to Tenant Admin and Super Admin roles (RBAC enforced)
- [ ] System SHALL support registration of both **Contractual** and **Non-Contractual** vendor types
- [ ] Each vendor record SHALL capture the following fields:
  - **Company Details**: Company name, company type (Sole Proprietorship / Partnership / Private Limited / Public Limited), registration number
  - **Vendor Type**: Contractual (direct assignment, no bidding) OR Non-Contractual (eligible for bidding)
  - **Contact Information**: Office address, city, postal code, phone, email
  - **Compliance Documents** *(reference only at master level)*: Trade License number, BIN, TIN
  - **Testimonial / Reference**: Reference from Truck Association (optional)
  - **Fleet Information**: Total vehicles count, vehicle types offered
  - **Status**: Active / Inactive
- [ ] System SHALL auto-generate a unique UUID for each vendor record
- [ ] System SHALL validate mandatory fields before allowing submission
- [ ] System SHALL detect potential duplicate vendors (same Trade License or TIN) and warn before creation
- [ ] System SHALL support saving draft vendor records for later completion
- [ ] Only Active vendor records SHALL be available for selection in TR/TO/Trip workflows
- [ ] Inactive vendor records SHALL remain in the system for historical reference but cannot be used in new transactions

### AC-2: Vendor List View — READ (per PRD 6.3.3)
- [ ] System SHALL display a vendor list view with key columns:
  - Company Name, Vendor Type, Status, Trade License Number, Phone, Created Date
- [ ] List view SHALL support:
  - Quick search across all displayed columns
  - Advanced filters: Status, Vendor Type, Created Date range
  - Column sorting (ascending/descending)
  - Pagination: 25 records per page (adjustable to 50, 100)
- [ ] Clicking a vendor row SHALL open the vendor detail/profile view

### AC-3: Inline & Form Editing — UPDATE (per PRD 6.3.3)
- [ ] System SHALL support **inline editing** for simple fields (company name, status, phone, email)
- [ ] System SHALL provide a full **Edit form** for complex field updates
- [ ] Field validation SHALL apply in real-time during editing
- [ ] System SHALL show a confirmation dialog before critical field changes (e.g., vendor type change)
- [ ] Every update SHALL be audit logged: User ID, Timestamp, Field name, Old value, New value
- [ ] Changes to vendor type (Contractual ↔ Non-Contractual) SHALL cascade appropriately to active TOs

### AC-4: Deactivation & Delete — DELETE (per PRD 6.3.3)
- [ ] **Soft delete (default)**: Record marked as Inactive, not removed from database
- [ ] **Hard delete**: Available only to Super Admin with two-step confirmation
- [ ] System SHALL check dependencies before deactivation:
  - Hard delete SHALL be blocked if vendor is referenced by any TR / TO / Trip / QC records
  - Soft delete SHALL be allowed but system SHALL warn if vendor has active/in-progress TOs
- [ ] Delete action SHALL record: Delete reason, deleting user, timestamp

### AC-5: Bulk Upload — Vendor CSV Import (per PRD 6.3.2)
- [ ] System SHALL provide a **Bulk Upload** option for vendor master data
- [ ] Bulk upload SHALL accept **CSV format only** (UTF-8 encoded)
- [ ] System SHALL provide a **downloadable CSV template** for vendors with:
  - Mandatory fields marked
  - Column data type hints
  - Sample values
- [ ] Bulk upload SHALL support **append-only** behavior:
  - New records are added to existing vendor dataset
  - Existing records are NOT overwritten by default
- [ ] System SHALL validate each row independently and report:
  - Successful rows processed
  - Failed rows with specific error reason per row
- [ ] System SHALL display upload progress and completion status
- [ ] System SHALL allow bulk upload multiple times for the same entity
- [ ] All bulk upload actions SHALL be audit logged:
  - Entity type, file name, uploaded by, timestamp, rows processed / success / failed

### AC-6: Inline Editing Post-Upload (per PRD 6.3.2)
- [ ] After upload, admin SHALL be able to edit records **inline at row level and column level** without re-uploading
- [ ] Changes SHALL be saved immediately or via explicit save action
- [ ] All inline edits SHALL be audit logged

### AC-7: Audit Trail
- [ ] All create, update, deactivate, and delete actions SHALL be audit logged with:
  - User ID, Timestamp, Entity Type, Field(s) changed, Old value, New value
- [ ] Audit log SHALL be viewable by Tenant Admin for each vendor record

---

## Functional Requirements

### FR-001: Admin Vendor CRUD (per PRD 6.3.1, 6.3.3)
- [Critical] Centralized Master Data Configuration module accessible only to Tenant Admin / Super Admin
- [Critical] Dedicated Transport Vendors setup menu with full CRUD support
- [Critical] Mandatory field validation and unique UUID generation per record
- [Critical] Duplicate detection (Trade License, TIN) with pre-save warning
- [High] Draft save support (vendor record can be partially filled and saved)
- [High] Active/Inactive status control with dependency enforcement

### FR-002: Vendor List View & Search (per PRD 6.3.3)
- [Critical] Paginated list view with search, sort, and filter
- [High] Advanced search panel (Status, Vendor Type, Date range, Created by)
- [Medium] Export vendor list to CSV

### FR-003: Bulk Upload & Inline Edit (per PRD 6.3.2)
- [Critical] CSV bulk upload with downloadable template
- [Critical] Append-only upload behavior (no overwrite)
- [Critical] Row-level and column-level inline editing
- [Critical] Audit logging for all bulk and inline operations
- [High] Upload progress indicator and result summary (success / failed rows)

### FR-004: Referential Integrity (per PRD 6.3.4)
- [Critical] Vendor vehicle records must belong to an approved vendor profile
- [Critical] Hard delete blocked if vendor is referenced by TR/TO/Trip/QC records
- [High] Cascade updates propagate to dependent records where applicable

---

## Data Model

```typescript
interface VendorMaster {
  id: UUID;                          // Auto-generated PK
  tenant_id: UUID;                   // Tenant isolation

  // Company Details (PRD 6.3.1)
  company_name: string;              // Required, unique within tenant
  company_type: Enum(
    'SOLE_PROPRIETORSHIP' |
    'PARTNERSHIP' |
    'PRIVATE_LIMITED' |
    'PUBLIC_LIMITED'
  );
  registration_number?: string;

  // Vendor Classification
  vendor_type: Enum('CONTRACTUAL' | 'NON_CONTRACTUAL');

  // Contact
  office_address: string;
  city: string;
  postal_code?: string;
  phone: string;
  email: string;

  // Compliance Reference (document files managed via US-027)
  trade_license_number: string;      // Unique within tenant
  bin_number: string;                // Unique within tenant
  tin_number: string;

  // Fleet Info
  total_vehicles?: number;
  vehicle_types?: string[];

  // Status Control
  status: Enum('ACTIVE' | 'INACTIVE' | 'DRAFT');

  // Audit
  created_at: Timestamp;
  created_by: UUID;
  updated_at: Timestamp;
  updated_by: UUID;
  deactivated_at?: Timestamp;
  deactivated_by?: UUID;
  deactivation_reason?: string;
}
```

---

## UI/UX Requirements

### Vendor Master List View
```
┌──────────────────────────────────────────────────────────────────────┐
│ Master Data > Transport Vendors          [+ Add Vendor] [↑ Upload CSV]│
├──────────────────────────────────────────────────────────────────────┤
│ Search: [________________]  Filter: [All Types ▼] [All Status ▼]     │
├──────────────────────────────────────────────────────────────────────┤
│ Company Name       Type            Status      Trade License  Action  │
│ ─────────────────────────────────────────────────────────────────── │
│ ABC Logistics Ltd  Contractual     ✅ Active   TL-123456789  [Edit]  │
│ XYZ Transport      Non-Contractual ✅ Active   TL-987654321  [Edit]  │
│ FastMove Co.       Non-Contractual ⏸ Inactive  TL-111222333  [Edit]  │
│                                                                      │
│ Showing 1-25 of 48        [< Prev]  Page 1 of 2  [Next >]           │
└──────────────────────────────────────────────────────────────────────┘
```

### Add/Edit Vendor Form
```
┌──────────────────────────────────────────────────┐
│ Add Transport Vendor                             │
├──────────────────────────────────────────────────┤
│ Company Name: *                                  │
│ [_________________________________]              │
│                                                  │
│ Company Type: *                                  │
│ [Private Limited             ▼]                  │
│                                                  │
│ Vendor Type: *                                   │
│ ⚪ Contractual   ⚪ Non-Contractual               │
│                                                  │
│ Trade License No: *                              │
│ [_________________________________]              │
│                                                  │
│ BIN: *      TIN: *                               │
│ [__________] [__________]                        │
│                                                  │
│ Phone: *        Email: *                         │
│ [__________] [____________________]              │
│                                                  │
│ Status:  ● Active  ○ Inactive                    │
│                                                  │
│ [Save Draft]               [Save Vendor]         │
└──────────────────────────────────────────────────┘
```

### Bulk Upload Panel
```
┌──────────────────────────────────────────────────┐
│ Bulk Upload — Transport Vendors                  │
├──────────────────────────────────────────────────┤
│ [↓ Download CSV Template]                        │
│                                                  │
│ ┌──────────────────────────────────────────────┐ │
│ │  Drag & drop your CSV file here              │ │
│ │  or [Browse File]                            │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ Upload Result:                                   │
│ ✅ 45 rows added successfully                    │
│ ❌ 3 rows failed:                                │
│    Row 12: Duplicate Trade License TL-123456     │
│    Row 23: Missing required field: BIN           │
│    Row 31: Invalid email format                  │
│                                                  │
│ [Download Error Report]          [Done]          │
└──────────────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
// CRUD
POST   /api/v1/vendors
GET    /api/v1/vendors?status=ACTIVE&type=NON_CONTRACTUAL&page=1&page_size=25
GET    /api/v1/vendors/{vendor_id}
PATCH  /api/v1/vendors/{vendor_id}
DELETE /api/v1/vendors/{vendor_id}
PATCH  /api/v1/vendors/{vendor_id}/status  // Activate / Deactivate

// Bulk Upload
GET    /api/v1/vendors/bulk-upload/template  // Download CSV template
POST   /api/v1/vendors/bulk-upload           // Upload CSV
GET    /api/v1/vendors/bulk-upload/{upload_id}/status  // Poll result

// Audit
GET    /api/v1/vendors/{vendor_id}/audit-log
```

---

## Business Rules

### BR-VM-001: Unique Identifiers
- Trade License and TIN must be unique within a tenant
- **Enforcement**: Database unique constraint (tenant_id + trade_license_number)

### BR-VM-002: Vendor Type Immutability
- Vendor type (Contractual / Non-Contractual) should not be changed while the vendor has active or in-progress TOs
- **Enforcement**: API validation with active TO check before allowing type change

### BR-VM-003: Active/Inactive Control
- Inactive vendors cannot be selected in new TR / TO / bidding workflows
- Inactive vendors remain visible in historical records
- **Enforcement**: Filtered queries (status = ACTIVE) in all assignment workflows

### BR-VM-004: Hard Delete Restriction
- Hard delete is blocked if vendor is referenced by any PR / TR / TO / Trip / QC record
- **Enforcement**: Dependency check before delete; dependency warning shown to admin

### BR-VM-005: Bulk Upload Append-Only
- CSV uploads add new records only; existing records are never overwritten
- **Enforcement**: Duplicate detection during upload (Trade License / TIN); duplicate rows reported as failed

---

## Testing Scenarios

### Happy Path
1. Admin opens Master Data > Transport Vendors
2. Admin clicks "+ Add Vendor" → fills form → saves → record created as Active
3. Admin uploads CSV with 50 vendors → 48 succeed, 2 fail with clear errors
4. Admin edits a vendor name inline → change saved and audit logged
5. Admin deactivates a vendor → vendor no longer appears in TO assignment dropdowns

### Edge Cases
1. **Duplicate Trade License**: System warns before save; bulk upload row marked as failed
2. **Delete vendor with active TOs**: Hard delete blocked; soft delete shows warning
3. **Change vendor type with active bid**: API rejects with clear error message
4. **CSV with missing mandatory fields**: Each failing row reported with specific field name

---

## Dependencies

### Prerequisites
- US-004: Role Hierarchy (RBAC must exist before admin-only access is enforced)

### Enables
- US-027: Vendor Registration & Verification Workflow (verification workflow builds on top of this data model)
- US-024: Vendor Bidding Portal (only Active vendors can bid)
- US-019: TO Execution — Vendor Fleet (only Active, Approved vendors assignable)
- All vendor-dependent operational workflows

---

## Definition of Done
- [ ] Vendor master CRUD fully functional (create, read, update, soft delete, hard delete)
- [ ] Vendor list view with search, filter, sort, pagination working
- [ ] Inline field editing working with audit log
- [ ] CSV bulk upload working (template download, upload, row-level error reporting)
- [ ] Active/Inactive status control enforced in dependent workflows
- [ ] Referential integrity checks on delete working
- [ ] All actions audit logged
- [ ] Unit tests > 85%
- [ ] UAT approved by Tenant Admin persona

---

**Story Points**: 5
**Estimated Hours**: 40 hours
**Sprint**: Sprint 2
**Priority**: Critical (Blocker for all vendor operations)

---

**PRD References**:
- Section 6.3.1: Entity Registration (Master Setup) — Transport Vendors fields
- Section 6.3.2: Bulk Upload & Inline Master Data Management
- Section 6.3.3: Master Tables (CRUD Operations)

**Last Updated**: 2026-03-06
**Status**: Rewritten to align with PRD 6.3 (Master Data Configuration). Self-registration and document verification workflow moved to US-027.
