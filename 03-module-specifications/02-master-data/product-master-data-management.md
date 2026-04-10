---
module: 02-master-data
specification: Product Master Data Management
version: 1.1
phase: Phase 1
source_document: PRD_DFMS_v1.0.md
source_sections: 6.4.1-6.4.3
last_updated: 2026-04-08
related_stories: US-095
---

# Product Master Data Management Specification

## Overview

The Product Master Data Management module provides centralized management of product master data for the DFMS platform. It supports both Finished Goods (FG) and Raw Materials (RM) with flexible catalogue structures, transport attributes, and QC configurations. The system enables product-aware workflows across requisitions, transport orders, quality control, and costing operations.

---

## 1. Product Data Model

### 1.1 Product Entity Structure

```typescript
Product {
  product_id: UUID
  product_sku_code: string    // SKU, unique per tenant
  product_item_code: string   // Item Code, unique per tenant
  product_name: string        // Display name
  product_type: enum ['FinishedGoods', 'RawMaterial']
  
  // Classification
  category_id: UUID           // Reference to ProductCategory
  sub_category_id: UUID (nullable) // Reference to ProductSubCategory
  
  // Physical Attributes
  unit_of_measure: enum ['Bag', 'Ton', 'KG', 'Liters', 'Pieces', 'Cartons']
  weight_per_unit: Decimal (nullable) // Hidden/null for Ton, KG, Liters. Required for Bag, Pieces, Cartons.
  standard_pack_size: string (nullable) // Pellet, Mash, Drum, etc.
  volume: Decimal (nullable)
  
  // Product Details
  description: string (nullable)
  barcode_ean: string (nullable)
  manufacturer_name: string (nullable)
  
  // Transport Configuration
  preferred_vehicle_body_type: enum ['Open Body', 'Closed Body', 'Container', 'Flatbed', 'Tanker', 'Refrigerated'] (nullable)
  special_handling_requirements: string (nullable)
  
  // QC Configuration
  requires_qc: boolean
  
  // Status
  is_active: boolean
  
  // Metadata
  tenant_id: UUID
  created_by: UUID
  created_at: DateTime
  updated_by: UUID
  updated_at: DateTime
}
```

### 1.2 Product Types

**Finished Goods (FG)**:
- Feed products (broiler, layer, fish, cattle)
- Packaging materials
- DOC (Day-Old Chicks)
- Ready-for-sale inventory

**Raw Materials (RM)**:
- Grain (corn, wheat, soybean)
- Protein sources (fish meal, soybean meal)
- Vitamins and minerals
- Packaging raw materials

---

## 2. Product Catalogue Management

### 2.1 Product Creation

**Creation Workflow**:
```
1. Admin selects product type (FG or RM)
2. Admin selects Product Category Name
3. The Product Sub-Category Name dropdown dynamically populates based on the selected Category
4. Admin selects Product Sub-Category Name
5. Enter basic information (SKU, Item Code, Name, Description)
6. Configure physical attributes (UOM, Weight Per Unit, Volume, Standard Pack Size)
7. Set transport requirements (Preferred Vehicle Body Type, Special Handling Requirements)
8. Configure QC requirements (Requires QC checkmark)
9. Set status (Is Active checkmark)
10. System validates uniqueness and completeness
11. Product created and available for requisitions
```

**Validation Rules**:
```typescript
{
  product_sku_code: {
    unique_per_tenant: true,
    min_length: 3,
    max_length: 50
  },
  product_item_code: {
    unique_per_tenant: true,
    min_length: 3,
    max_length: 50
  },
  product_name: {
    unique_per_tenant: true,
    min_length: 3,
    max_length: 200
  },
  weight_per_unit: {
    required_if: uom in ['Bag', 'Pieces', 'Cartons'],
    not_applicable_if: uom in ['Ton', 'KG', 'Liters'],
    min: 0,
    precision: 3
  },
  category_id: {
    required: true
  },
  sub_category_id: {
    required: true
  }
}
```

### 2.2 Category & Sub-Category Hierarchy

**Category & Sub-Category Creation Workflow**:
```
1. Admin creates a Product Category (specifying Name, Code, and Product Type).
2. Admin creates a Product Sub-Category.
3. During Sub-Category creation, Admin selects the parent Product Category from a dropdown.
4. Sub-Category inherits the parent Category's context and is linked via category_id.
```

**Product Category Entity**:
```typescript
ProductCategory {
  category_id: UUID
  product_type: enum ['FinishedGoods', 'RawMaterial']
  category_code: string
  category_name: string
  is_active: boolean
  tenant_id: UUID
}
```

**Product Sub-Category Entity**:
```typescript
ProductSubCategory {
  sub_category_id: UUID
  category_id: UUID
  sub_category_code: string
  sub_category_name: string
  is_active: boolean
  tenant_id: UUID
}
```

### 2.3 Unit of Measure (UOM) Conversions

**Base UOM**: KG

**Conversion Logic**:
```typescript
function convertToKg(quantity: Decimal, uom: string, product: Product): Decimal {
    switch(uom) {
        case 'Ton':
            return quantity * 1000;
        case 'KG':
            return quantity;
        case 'Bag':
        case 'Pieces':
        case 'Cartons':
            return quantity * (product.weight_per_unit || 1);
        case 'Liters':
            // Requires density factor (product-specific)
            return quantity * (product.weight_per_unit || 1);
        default:
            throw new Error(`Unsupported UOM: ${uom}`);
    }
}
```

---

## 3. Transport Configuration

### 3.1 Vehicle Type Compatibility

**Vehicle Body Mapping**:
```typescript
Product Transport Rules:
  preferred_vehicle_body_type is selected from pre-defined list:
  ['Open Body', 'Closed Body', 'Container', 'Flatbed', 'Tanker', 'Refrigerated']
```

**Validation During TO Creation**:
```typescript
function validateVehicleCompatibility(
    product_id: UUID,
    vehicle_body_type: string
): boolean {
    const product = getProduct(product_id);
    
    if (product.preferred_vehicle_body_type && product.preferred_vehicle_body_type !== vehicle_body_type) {
        throw new Error(
            `Product ${product.product_name} prefers vehicle body type: ` +
            `${product.preferred_vehicle_body_type}`
        );
    }
    
    return true;
}
```

### 3.2 Special Handling Requirements

**Handling Information**:
Captured as text input for special operations (e.g. Fragile, Hazardous, Perishable).

**Impact on Operations**:
```typescript
IF product.special_handling_requirements is not empty:
    ADD handling instructions to loading crew
```

### 3.3 Loading Configuration

**Stackability Rules**:
```typescript
Loading Optimization:
  IF product.standard_pack_size is present and indicates stackable behavior:
      optimize_load_plan_with_stacking()
  ELSE:
      load_single_layer()
```

---

## 4. QC Configuration

### 4.1 QC Requirements

**QC Flags**:
```typescript
QC Configuration:
  requires_qc: boolean           // QC mandatory for this product? (Checkmark)
```
*(Note: No extra QC configuration details are needed for now)*

---

## 5. Product Lifecycle

### 5.1 Product Status Management

**Status Transitions**:
```
Draft → Active (Is Active: true) ↔ Inactive (Is Active: false)
```

**Status Implications**:
```typescript
Status Rules:
  Active (is_active: true):
    - Visible in all dropdowns
    - Can be used in new PRs/TRs/TOs
    - Fully operational
  
  Inactive (is_active: false):
    - Hidden from dropdowns
    - Cannot be used in new transactions
    - Existing transactions continue
    - Reactivatable
```

### 5.2 Product Updates

**Safe Update Fields**:
- Product Name
- Description
- Product Category Name / Sub-Category Name
- Is Active (Status)
- Requires QC
- Transport attributes (Preferred Vehicle Body Type, Special Handling Requirements)

**Restricted Updates**:
- Product SKU Code (cannot change, linked to historical data)
- Product Item Code
- UOM (cannot change, affects stock calculations)
- Product type (FG ↔ RM) (cannot change, different workflows)

**Update Impact Analysis**:
```typescript
async function analyzeProductUpdateImpact(
    product_id: UUID,
    updates: Partial<Product>
): Promise<ImpactReport> {
    const activeRequisitions = await countActiveRequisitions(product_id);
    const activeTrips = await countActiveTrips(product_id);
    const stockBalance = await getStockBalance(product_id);
    
    return {
        active_requisitions: activeRequisitions,
        active_trips: activeTrips,
        stock_balance: stockBalance,
        warning: activeRequisitions > 0 || activeTrips > 0,
        message: 'Changes affect new transactions only. Active transactions use old configuration.'
    };
}
```

---

## 6. Product Search & Filtering

### 6.1 Search Capabilities

**Search Fields**:
- Product SKU Code
- Product Item Code
- Product Name (fuzzy search)
- Category Name / Sub-Category Name
- Is Active

**Filters**:
- Product type (FG/RM)
- Category Name / Sub-Category Name
- Status (Is Active)
- Requires QC (yes/no)
- Created date range

### 6.2 Product Dropdown (Transaction Screens)

**Smart Filtering**:
```typescript
function getEligibleProducts(
    transaction_type: string,
    source_poi: POI,
    destination_poi: POI
): Product[] {
    let products = getAllActiveProducts();
    
    // Filter by POI operational role
    if (source_poi.operational_role === 'Port') {
        products = products.filter(p => p.product_type === 'RawMaterial');
    }
    
    if (destination_poi.poi_type === 'FeedDealer') {
        products = products.filter(p => p.product_type === 'FinishedGoods');
    }
    
    return products.sort((a, b) => a.product_name.localeCompare(b.product_name));
}
```

---

## 7. Integration Points

### 7.1 Requisition Management

- Product selection in PR creation
- UOM display and conversion
- Stock availability check (future enhancement)
- Capacity calculation based on product weight

### 7.2 Transport Order Management

- Vehicle type validation against product compatibility
- Load plan optimization using stackability
- Special handling instructions to driver

### 7.3 QC Workflow

- Auto-load QC checklist
- Sampling requirements
- Lab test routing
- Auto-pass eligibility check

### 7.4 Costing

- Product-level cost tracking
- Transport cost per unit (kg/MT)
- QC cost allocation

---

## 8. Business Rules

### 8.1 Product Code Uniqueness

```
Product SKU Codes and Product Item Codes must be unique per tenant.
System prevents creation of duplicate codes.
Case-insensitive comparison.
```

### 8.2 Product Deactivation

```typescript
Deactivation Rules:
  IF product has active stock at any POI:
      BLOCK deactivation
      SUGGEST stock transfer first
  
  IF product has pending/active requisitions:
      WARN user
      ALLOW deactivation (existing transactions continue)
  
  ALWAYS preserve historical data
  ALWAYS log deactivation reason
```

### 8.3 Category Management

```
Categories and Sub-Categories are tenant-specific.
Sub-categories are tightly linked to their parent category.
Deleting a category/sub-category requires reassigning or handling all linked products.
```

---

## 9. Data Model Details

### 9.1 Indexes for Performance

```sql
CREATE INDEX idx_product_tenant_active ON products(tenant_id, is_active);
CREATE INDEX idx_product_sku_code ON products(product_sku_code, tenant_id);
CREATE INDEX idx_product_item_code ON products(product_item_code, tenant_id);
CREATE INDEX idx_product_type ON products(product_type);
CREATE INDEX idx_product_category ON products(category_id, sub_category_id);
CREATE INDEX idx_product_name_search ON products USING gin(to_tsvector('english', product_name));

CREATE INDEX idx_category_tenant ON product_categories(tenant_id, is_active);
CREATE INDEX idx_sub_category_tenant ON product_sub_categories(category_id, is_active);
```

### 9.2 Audit Trail

```typescript
ProductAuditLog {
  log_id: UUID
  product_id: UUID
  action: enum ['Created', 'Updated', 'Deactivated', 'Reactivated']
  changed_fields: JSON  // Old value → New value
  changed_by: UUID
  timestamp: DateTime
  reason: string (nullable)
}
```

---

## 10. API Endpoints Implementation Plan

The API will follow RESTful principles, utilizing JSON for payload and responses. Standard HTTP methods (GET, POST, PUT, PATCH, DELETE) will be used along with proper status codes. Pagination, filtering, and sorting should be standardized across list endpoints.

### 10.1 Product Categories & Sub-Categories

| Method | Endpoint | Description | Implementation Details |
|---|---|---|---|
| GET | `/api/v1/product-categories` | List categories | Support query params: `?product_type=`, `?is_active=`, `?search=` |
| POST | `/api/v1/product-categories` | Create category | Validate uniqueness of `category_code` per tenant |
| GET | `/api/v1/product-categories/{id}` | Get category | Include nested sub-categories in response if requested |
| PUT | `/api/v1/product-categories/{id}` | Update category | Prevent `category_code` update if used by active products |
| PATCH | `/api/v1/product-categories/{id}/status` | Toggle status | Soft toggle using `is_active` |
| POST | `/api/v1/product-categories/{id}/sub-categories` | Create sub-category | Link to parent `category_id`. Validate `sub_category_code` uniqueness |
| GET | `/api/v1/product-categories/{id}/sub-categories` | List sub-categories | Support query params: `?is_active=`, `?search=` |
| PUT | `/api/v1/product-sub-categories/{id}` | Update sub-category | Prevent `sub_category_code` update if used by active products |
| PATCH | `/api/v1/product-sub-categories/{id}/status` | Toggle status | Soft toggle using `is_active` |

### 10.2 Products

| Method | Endpoint | Description | Implementation Details |
|---|---|---|---|
| GET | `/api/v1/products` | List products | Support query params: `?search=`, `?product_type=`, `?category_id=`, `?sub_category_id=`, `?is_active=`, `?requires_qc=`, `?page=`, `?per_page=` |
| POST | `/api/v1/products` | Create product | Strict validation on `product_sku_code`, `product_item_code`, and conditional requirement for `weight_per_unit` |
| GET | `/api/v1/products/{id}` | Get product details | Return full product representation including joined category names |
| PUT | `/api/v1/products/{id}` | Update product | Check for safe vs. restricted fields. Read-only fields (`product_sku_code`) should be ignored or throw 400 |
| PATCH | `/api/v1/products/{id}/status` | Toggle status | Apply product deactivation rules (see 8.2). If blocked, return `409 Conflict` with clear reasoning |
| GET | `/api/v1/products/{id}/audit-trail` | Get audit logs | Return history of updates from `ProductAuditLog` |

### 10.3 Bulk Operations

Implement product CSV import/export using the shared master-data pipeline in **[bulk-import-export.md](bulk-import-export.md)** (`IMPORT_REGISTRY` entries for `product` and `productcategory`, `BulkImportViewSet` / `BulkExportViewSet`). The table below names REST shapes; align paths and behaviour with §10 of that document rather than introducing a second parallel bulk implementation.

| Method | Endpoint | Description | Implementation Details |
|---|---|---|---|
| POST | `/api/v1/products/import-csv` | Bulk import products | Accept multipart/form-data. Use async processing if > 500 rows. Return pre-signed error log URL on partial failure |
| GET | `/api/v1/products/export-csv` | Bulk export products | Stream CSV response. Respect all list filters applied in query params |

---

## 11. Unit Testing Strategy

The testing strategy follows the testing pyramid, focusing on business logic isolation, robust database constraints, and API contract adherence. 

### 11.1 Test Coverage Targets
- **Models/Business Logic**: 90%+
- **API/Views**: 85%+
- **Serializers/Validators**: 90%+

### 11.2 Core Test Cases

**1. Model & Validation Tests:**
- *Product Code Uniqueness*: Verify that saving two products with the same `product_sku_code` or `product_item_code` under the same `tenant_id` raises an IntegrityError.
- *Tenant Isolation*: Verify that duplicate `product_sku_code` across *different* `tenant_id`s succeeds.
- *Conditional Validation*: Verify that creating a product with UOM = 'Bag' fails if `weight_per_unit` is missing. Verify it succeeds if UOM = 'Ton', 'KG', or 'Liters' and `weight_per_unit` is omitted (null).

**2. API Endpoint Tests:**
- *List/Filtering*: Test `GET /api/v1/products` with combinations of filters (`is_active`, `category_id`). Ensure results are paginated correctly.
- *Soft Deletion*: Test `PATCH /api/v1/products/{id}/status`. Verify `is_active` flips, and ensure dependent workflows handle the inactive product correctly.
- *Bulk Import*: Test bulk import via the contract in **[bulk-import-export.md](bulk-import-export.md)** §10 (e.g. `POST /api/v1/master-data/bulk-imports/` with `model_name=product`) with a valid CSV, missing required fields, and duplicate natural keys. Ensure errors are clearly formatted and match preview/confirm flow.

**3. Business Rules Tests:**
- *Status Transition Impact*: Test deactivation when the product has pending requisitions (should warn but succeed). Test deactivation when product has active stock (should block).
- *Audit Trail Verification*: Trigger a PUT request to update a product's name. Verify that a `ProductAuditLog` record is created containing the `changed_fields` JSON and correct user ID.

**4. Performance/Mocking:**
- Use fixtures and factories (e.g., `factory_boy`) for seeding standard products and categories.
- Ensure database interactions in loops are minimized (e.g. checking `select_related` / `prefetch_related` in list views) and verified via query count assertions (e.g. `assertNumQueries`).

---

## 12. Django Admin SSR Implementation Strategy

Since the platform utilizes Django Admin for Server-Side Rendering (SSR) management interfaces, specific strategies are required to handle dynamic user interactions like dependent dropdowns.

**Bulk CSV import/export** on Product and Product Category changelists is provided by **`BulkImportExportMixin`** as specified in **[bulk-import-export.md](bulk-import-export.md)** §6 (not duplicated here).

### 12.1 Dependent Dropdowns (Category -> Sub-Category)

To provide a seamless UX during Product creation where the `sub_category_id` dropdown is filtered based on the selected `category_id`:

1. **Custom AJAX Endpoint**:
   - Create an internal API endpoint (e.g., `/admin/api/subcategories-by-category/`) that accepts a `category_id` and returns a JSON list of active sub-categories.
2. **ModelAdmin Media Class**:
   - Attach a custom JavaScript file (`dependent_dropdowns.js`) to the `ProductAdmin` class using the `Media` inner class.
3. **JavaScript Logic**:
   - The script will listen for the `change` event on the `category_id` select element.
   - Upon change, it triggers a `fetch()` request to the custom AJAX endpoint.
   - The script clears the existing options in the `sub_category_id` select element and repopulates it with the newly fetched data.
   - It should also handle the initial page load state (if a category is already selected during an "Edit" operation, it should ensure the correct sub-categories are loaded).
4. **Alternative (HTMX)**:
   - If HTMX is integrated into the admin templates, use `hx-get` on the category dropdown to fetch a partial HTML response containing the `<option>` tags for the sub-category dropdown, targeting the `sub_category_id` element.

### 12.2 Form Validation

- Ensure that the Django `ModelForm` for the Product validates that the selected `sub_category_id` actually belongs to the selected `category_id` on the backend, preventing malicious or erroneous form submissions.

---

## 13. Related Documentation

- **[Bulk Import & Export](bulk-import-export.md)** - Canonical CSV bulk import/export for Product and Product Category (and other master entities)
- **[Master Data Configuration](master-data-configuration.md)** - Overall master data management
- **[POI Management](poi-management.md)** - Location master data
- **[Product Requisition Management](../03-operations/product-requisition-management.md)** - Product usage in requisitions
- **[QC Workflow](../04-poi-operations/qc-workflow.md)** - QC checklist integration

**Related User Stories:**
- Integrated in requisition and QC workflows (no dedicated story)

**Source**: PRD_DFMS_v1.0.md - Sections 6.4.1-6.4.3
