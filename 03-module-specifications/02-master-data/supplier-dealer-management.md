---
module: 02-master-data
specification: Supplier & Dealer Master Data Management Implementation Plan
version: 1.0
phase: Phase 1
related_stories: US-096, DFS-018
last_updated: 2026-04-17
---

# Supplier & Dealer Master Data Implementation Plan

## Overview

Suppliers and Dealers are critical master data entities within the DFMS platform. Suppliers represent raw material providers essential for inbound operations, while Dealers represent finished goods distributors essential for outbound operations. Accurate management of this data is a prerequisite for executing Transport Requisitions (TRs), Transport Orders (TOs), and managing gate operations seamlessly. 

This implementation plan defines the architectural models, API endpoint designs, business validation rules, and testing strategies required to deliver the Supplier and Dealer Master Data features.

**Bulk CSV import/export:** The platform-wide implementation (async jobs, preview, Django admin, REST API) is specified in **[bulk-import-export.md](bulk-import-export.md)**. Prefer `BulkImportViewSet` / `BulkExportViewSet` and registry keys `supplier` / `dealer` over ad hoc `/bulk-upload` endpoints unless product explicitly requires both shapes during migration.

---

## 1. Entity Architecture

### 1.1 Supplier Entity Model

```typescript
Supplier {
  supplier_id: UUID (Primary Key)
  supplier_code: string (Unique, Required)
  supplier_name: string (Unique within tenant, Required)
  
  // Contact Info
  contact_number: string (Required)
  email: string (Nullable, Email format)
  address: string (Required)
  
  // Location & Geofencing
  geofence_radius: Integer (Nullable, Default/System Pre-filled, Meters)
  latitude: Decimal (Nullable, -90 to +90)
  longitude: Decimal (Nullable, -180 to +180)
  
  // Status
  is_active: boolean (Required, Default: true)
  
  // Metadata & Audit
  tenant_id: UUID (Required)
  created_by: UUID (Required)
  created_at: DateTime
  updated_by: UUID
  updated_at: DateTime
}
```

### 1.2 Dealer Entity Model

```typescript
Dealer {
  dealer_id: UUID (Primary Key)
  dealer_code: string (Unique, Required)
  dealer_name: string (Unique within tenant, Required)
  
  // Contact Info
  contact_number: string (Required)
  email: string (Nullable, Email format)
  address: string (Required)
  
  // Location & Geofencing
  geofence_radius: Integer (Nullable, Default/System Pre-filled, Meters)
  latitude: Decimal (Nullable, -90 to +90)
  longitude: Decimal (Nullable, -180 to +180)
  
  // Status
  is_active: boolean (Required, Default: true)
  
  // Metadata & Audit
  tenant_id: UUID (Required)
  created_by: UUID (Required)
  created_at: DateTime
  updated_by: UUID
  updated_at: DateTime
}
```

---

## 2. API Endpoints Implementation Plan

The backend services will expose RESTful APIs under the `/api/v1` namespace.

For CSV bulk import and template download, align with **[bulk-import-export.md](bulk-import-export.md)** §10 (`/api/v1/master-data/bulk-imports/`, `/bulk-imports/template/?model_name=supplier|dealer`, `/bulk-exports/`). The resource-specific `/bulk-upload` routes in the tables below are optional aliases; the shared bulk spec is the source of truth for job lifecycle and validation.

### 2.1 Supplier APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/v1/suppliers` | Create a new Supplier |
| GET    | `/api/v1/suppliers` | Fetch paginated list (supports `status`, `search`, `sort` query params) |
| GET    | `/api/v1/suppliers/{id}` | Fetch a single Supplier by ID |
| PATCH  | `/api/v1/suppliers/{id}` | Update Supplier details (inline or full edit) |
| DELETE | `/api/v1/suppliers/{id}` | Soft delete or hard delete (based on dependencies) |
| POST   | `/api/v1/suppliers/bulk-upload` | Upload CSV for bulk creation (Append-only) |
| GET    | `/api/v1/suppliers/bulk-upload/template` | Download CSV template |

### 2.2 Dealer APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/v1/dealers` | Create a new Dealer |
| GET    | `/api/v1/dealers` | Fetch paginated list (supports `status`, `search`, `sort` query params) |
| GET    | `/api/v1/dealers/{id}` | Fetch a single Dealer by ID |
| PATCH  | `/api/v1/dealers/{id}` | Update Dealer details |
| DELETE | `/api/v1/dealers/{id}` | Soft delete or hard delete (based on dependencies) |
| POST   | `/api/v1/dealers/bulk-upload` | Upload CSV for bulk creation (Append-only) |
| GET    | `/api/v1/dealers/bulk-upload/template` | Download CSV template |

---

## 3. Business Logic & Rules

### 3.1 Field Validations
- **Code**: Must be unique system-wide (or per tenant based on global config). Cannot be empty.
- **Name**: Must be unique per tenant (prevent duplicates). Cannot be empty.
- **Email**: Must conform to a standard email regex if provided.
- **Coordinates**: Latitude between -90 and +90, Longitude between -180 and +180.

### 3.2 Deletion & Inactivation Rules
- **Soft Delete (Deactivation)**:
  - Allowed anytime.
  - Action: Sets `is_active = false`.
  - Impact: Entity will no longer appear in dropdowns for creating new Transport Requisitions (TRs) or Transport Orders (TOs).
- **Hard Delete**:
  - Requires a dependency check prior to deletion.
  - Action: Permanent removal from the database.
  - Blocker: If the Supplier/Dealer is referenced in any existing TR, TO, Trip, or Gate record, the hard delete request will be rejected with an appropriate error message (e.g., `409 Conflict: Entity in use`).

### 3.3 Bulk Upload Flow

Detailed steps (status machine, Celery, preview pagination, `import_valid_only`) are in **[bulk-import-export.md](bulk-import-export.md)**. Summary:

1. **Template Download**: Provides a CSV with predefined columns. Mandatory columns (Code, Name, Contact Number, Address, Status) are explicitly marked.
2. **File Processing**: System parses the CSV row by row.
3. **Row-level Validation**: Each row is validated independently. Invalid rows do not stop valid rows from being saved (unless atomic transaction is explicitly required; appending is preferred).
4. **Append-Only Behavior**: Existing codes/records are skipped or flagged as errors; no overwrites.
5. **Response Report**: API returns a summary containing `successful_rows_count`, `failed_rows_count`, and a `failed_rows` array detailing the row number and reason.

### 3.4 Audit Logging
- Every `CREATE`, `UPDATE` (including soft-delete), and `DELETE` operation must generate an audit log entry.
- Audit Log payload includes: `User ID`, `Timestamp`, `Action`, `Entity Type`, `Entity ID`, `Old Value(s)`, and `New Value(s)`.

**Implementation:** **`VehicleAdmin`** integrates **`apps.audit.services`** for create/update/delete. **`SupplierAdmin`** / **`DealerAdmin`** enforce validation and hard-delete rules via forms and **`MasterEntityHardDeleteAdminMixin`**; extend the same audit hooks on those admins when full parity is required.

---

## 4. Database Schema & Indexes

To ensure optimal read performance on list views and uniqueness checks, the following indexes are proposed:

```sql
-- Supplier Indexes
CREATE UNIQUE INDEX idx_supplier_code ON suppliers(supplier_code);
CREATE UNIQUE INDEX idx_supplier_name_tenant ON suppliers(tenant_id, supplier_name);
CREATE INDEX idx_supplier_status ON suppliers(tenant_id, is_active);

-- Dealer Indexes
CREATE UNIQUE INDEX idx_dealer_code ON dealers(dealer_code);
CREATE UNIQUE INDEX idx_dealer_name_tenant ON dealers(tenant_id, dealer_name);
CREATE INDEX idx_dealer_status ON dealers(tenant_id, is_active);
```

---

## 5. Testing Strategy

Achieving a minimum of 85% test coverage is required for the backend implementations of this module.

### 5.1 Unit Testing
- **Validation Logic**: Ensure validation fails for empty names, duplicate codes, invalid email formats, and invalid coordinate ranges.
- **Service Layer Mocking**: 
  - Test create, read, update operations with mocked DB repositories.
  - Test hard delete blocking: Mock the dependency check service to return `true` (dependencies exist) and verify a `ConflictException` is thrown.
- **Bulk Upload Parsing**:
  - Provide a mock CSV string and verify row-level parsing and error accumulation functions correctly.
  - Test the "Append-Only" logic to ensure existing records are identified and excluded from insertion.

### 5.2 Integration Testing
- **API E2E Tests**: 
  - `POST /api/v1/suppliers` & `POST /api/v1/dealers`: Verify 201 Created and correct database state.
  - `GET /api/v1/suppliers`: Verify pagination, `search` (partial matching on name/code), and `status` filtering work as expected.
  - `PATCH /api/v1/suppliers/{id}`: Verify successful update and check that the audit log entry is created in the database.
- **Database Integrity & Dependencies**:
  - Create a test TR linking to a dummy Dealer.
  - Attempt to `DELETE /api/v1/dealers/{dummy_id}`.
  - Verify that the system responds with a 409 status code.
- **Bulk Upload E2E**:
  - Submit a multipart form-data request with a test CSV file containing 2 valid rows and 1 invalid row.
  - Verify the response correctly indicates 2 successes and 1 failure with the specific error message.
  - Verify only the 2 valid rows are present in the test database.

### 5.3 Security & RBAC Testing
- Ensure endpoints reject requests lacking valid authentication tokens (401 Unauthorized).
- Ensure users without the `Tenant Admin` or equivalent role receive a 403 Forbidden error for mutating endpoints (POST, PATCH, DELETE).

---

## 6. Related Documentation

- **[Bulk Import & Export](bulk-import-export.md)** - Canonical CSV bulk import/export for Supplier and Dealer (`model_name=supplier` / `dealer`), Django admin mixin, and REST job lifecycle
- **[Master Data Configuration](master-data-configuration.md)** - Overall master data management