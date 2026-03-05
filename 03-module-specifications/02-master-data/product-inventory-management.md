---
module: 02-master-data
specification: Product Inventory Management (PIM)
version: 1.0
phase: Phase 1
source_document: PRD_DFMS_v1.0.md
source_sections: 6.4.1-6.4.3
last_updated: 2026-02-26
related_stories: Integrated in requisition workflows
---

# Product Inventory Management (PIM) Specification

## Overview

The Product Inventory Management (PIM) module provides centralized management of product master data for the DFMS platform. PIM supports both Finished Goods (FG) and Raw Materials (RM) with flexible catalogue structures, transport attributes, and QC configurations. The system enables product-aware workflows across requisitions, transport orders, quality control, and costing operations.

---

## 1. Product Data Model

### 1.1 Product Entity Structure

```typescript
Product {
  product_id: UUID
  product_code: string        // SKU, unique per tenant
  product_name: string        // Display name
  product_type: enum ['FinishedGoods', 'RawMaterial']
  
  // Classification
  category: string            // Feed, Packaging, etc.
  sub_category: string        // Broiler Feed, Layer Feed, etc.
  
  // Physical Attributes
  unit_of_measure: enum ['Bag', 'Ton', 'Kilogram', 'Liter', 'Piece', 'Carton']
  standard_weight_per_unit: Decimal  // For conversion
  pack_size: string (nullable)
  packing_type: enum ['Pallet', 'Drum', 'Roll', 'Bulk'] (nullable)
  
  // Product Details
  description: string (nullable)
  barcode_ean: string (nullable)
  manufacturer: string (nullable)
  product_image_url: string (nullable)
  
  // Transport Configuration
  transport_config: {
    vehicle_type_compatibility: string[]  // ['CoveredTruck', 'OpenTruck']
    special_handling: string[]            // ['Fragile', 'Temperature-Sensitive']
    stackable: boolean
    max_stack_height: Integer (nullable)
    load_type: enum ['Bulk', 'Bagged', 'Palletized']
  }
  
  // QC Configuration
  qc_config: {
    requires_qc: boolean
    qc_checklist_id: UUID (nullable)
    sampling_required: boolean
    auto_pass_eligible: boolean
    lab_test_required: boolean
  }
  
  // Status
  status: enum ['Active', 'Inactive', 'Discontinued', 'Seasonal']
  
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
2. Enter basic information (name, code, category)
3. Configure physical attributes (UOM, weight, packing)
4. Set transport requirements (vehicle compatibility, handling)
5. Configure QC requirements (checklist, sampling)
6. Set status (Active/Inactive)
7. System validates uniqueness and completeness
8. Product created and available for requisitions
```

**Validation Rules**:
```typescript
{
  product_code: {
    unique_per_tenant: true,
    pattern: /^[A-Z0-9\-]+$/,
    min_length: 3,
    max_length: 50
  },
  product_name: {
    unique_per_tenant: true,
    min_length: 3,
    max_length: 200
  },
  standard_weight_per_unit: {
    required_if: uom in ['Bag', 'Piece', 'Carton'],
    min: 0,
    precision: 3  // 3 decimal places (kg)
  },
  category: {
    required: true,
    values: ['Feed', 'RawMaterial', 'Packaging', 'DOC', 'Other']
  }
}
```

### 2.2 Category & Sub-Category Hierarchy

**Category Structure**:
```
Feed
  ├── Broiler Feed
  │   ├── Starter
  │   ├── Grower
  │   └── Finisher
  ├── Layer Feed
  │   ├── Chick
  │   ├── Grower
  │   └── Layer
  ├── Fish Feed
  └── Cattle Feed

Raw Material
  ├── Grain
  │   ├── Corn
  │   ├── Wheat
  │   └── Rice Bran
  ├── Protein
  │   ├── Fish Meal
  │   ├── Soybean Meal
  │   └── Bone Meal
  └── Additives

Packaging
  ├── Bags (PP)
  ├── Cartons
  └── Labels
```

**Dynamic Category Management**:
```typescript
Category {
  category_id: UUID
  category_name: string
  parent_category_id: UUID (nullable)
  attribute_template: JSON  // Default attributes for products in this category
  tenant_id: UUID
}
```

### 2.3 Unit of Measure (UOM) Conversions

**Base UOM**: Kilogram (kg)

**Conversion Logic**:
```typescript
function convertToKg(quantity: Decimal, uom: string, product: Product): Decimal {
    switch(uom) {
        case 'Ton':
            return quantity * 1000;
        case 'Kilogram':
            return quantity;
        case 'Bag':
        case 'Piece':
        case 'Carton':
            return quantity * product.standard_weight_per_unit;
        case 'Liter':
            // Requires density factor (product-specific)
            return quantity * product.density_kg_per_liter;
        default:
            throw new Error(`Unsupported UOM: ${uom}`);
    }
}
```

---

## 3. Transport Configuration

### 3.1 Vehicle Type Compatibility

**Vehicle Type Mapping**:
```typescript
Product Transport Rules:
  Liquid products → ['Tanker']
  Bulk feed → ['CoveredTruck', 'OpenTruck']
  Bagged feed → ['CoveredTruck', 'PickupVan']
  Temperature-sensitive → ['RefrigeratedTruck']
  Heavy bulk (> 10MT) → ['Trailer', 'CoveredTruck']
```

**Validation During TO Creation**:
```typescript
function validateVehicleCompatibility(
    product_id: UUID,
    vehicle_type: string
): boolean {
    const product = getProduct(product_id);
    
    if (!product.transport_config.vehicle_type_compatibility.includes(vehicle_type)) {
        throw new Error(
            `Product ${product.product_name} requires vehicle type: ` +
            `${product.transport_config.vehicle_type_compatibility.join(' or ')}`
        );
    }
    
    return true;
}
```

### 3.2 Special Handling Requirements

**Handling Flags**:
- **Fragile**: Requires careful loading/unloading
- **Temperature-Sensitive**: Must maintain temperature range
- **Hazardous**: Special permits and handling
- **Perishable**: Time-sensitive delivery
- **High-Value**: Enhanced security and tracking

**Impact on Operations**:
```typescript
IF product.transport_config.special_handling.includes('Temperature-Sensitive'):
    REQUIRE vehicle with temperature monitoring
    ALERT if temperature out of range during transit
    
IF product.transport_config.special_handling.includes('Fragile'):
    ADD handling instructions to loading crew
    REQUIRE photo documentation of loading
```

### 3.3 Loading Configuration

**Stackability Rules**:
```typescript
Loading Optimization:
  IF product.transport_config.stackable == true:
      max_stacks = product.transport_config.max_stack_height OR vehicle.max_height / product.height
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
  requires_qc: boolean           // QC mandatory for this product?
  qc_checklist_id: UUID          // Link to QC checklist template
  sampling_required: boolean     // Physical sampling needed?
  auto_pass_eligible: boolean    // Can skip detailed QC (vendor trust)?
  lab_test_required: boolean     // Lab analysis needed?
```

### 4.2 QC Checklist Mapping

**Checklist Assignment**:
```typescript
Product-to-Checklist Mapping:
  'Broiler Feed - Starter' → 'Feed QC Checklist v2.1'
  'Corn (RM)' → 'Grain Quality Checklist v1.5'
  'Soybean Meal' → 'Protein Source Checklist v1.2'
```

**Auto-Load on QC**:
```
When QC Inspector scans product/trip:
  1. Load product.qc_config.qc_checklist_id
  2. Display checklist items
  3. Enable/disable sampling based on product.qc_config.sampling_required
  4. Route to lab if product.qc_config.lab_test_required
```

### 4.3 Auto-Pass Logic

**Auto-Pass Criteria**:
```typescript
function determineQCPath(product: Product, vendor: Vendor, trip: Trip): string {
    if (!product.qc_config.requires_qc) {
        return 'AutoPass';
    }
    
    if (product.qc_config.auto_pass_eligible &&
        vendor.quality_rating >= 4.5 &&
        vendor.consecutive_passes >= 10) {
        return 'AutoPass';
    }
    
    if (product.qc_config.lab_test_required) {
        return 'FullQC_WithLab';
    }
    
    return 'StandardQC';
}
```

---

## 5. Product Lifecycle

### 5.1 Product Status Management

**Status Transitions**:
```
Draft → Active → (Seasonal ↔ Active) → Discontinued
                 ↓
              Inactive (temporary)
```

**Status Implications**:
```typescript
Status Rules:
  Active:
    - Visible in all dropdowns
    - Can be used in new PRs/TRs/TOs
    - Fully operational
  
  Inactive:
    - Hidden from dropdowns
    - Cannot be used in new transactions
    - Existing transactions continue
    - Reactivatable
  
  Seasonal:
    - Active only during configured seasons
    - Auto-activate/deactivate based on date
  
  Discontinued:
    - Permanently retired
    - Historical data preserved
    - Cannot be reactivated
```

### 5.2 Product Updates

**Safe Update Fields**:
- Product name (with impact warning)
- Description
- Category/sub-category (with validation)
- Status
- QC configuration (new transactions only)
- Transport configuration (new transactions only)

**Restricted Updates**:
- Product code (cannot change, linked to historical data)
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
- Product code/SKU
- Product name (fuzzy search)
- Category/sub-category
- Status

**Filters**:
- Product type (FG/RM)
- Category
- Status
- QC required (yes/no)
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
Product codes must be unique per tenant.
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
Categories are tenant-specific.
Sub-categories inherit parent category attributes.
Deleting category requires reassigning all products.
```

---

## 9. Data Model Details

### 9.1 Indexes for Performance

```sql
CREATE INDEX idx_product_tenant_status ON products(tenant_id, status);
CREATE INDEX idx_product_code ON products(product_code, tenant_id);
CREATE INDEX idx_product_type ON products(product_type);
CREATE INDEX idx_product_category ON products(category, sub_category);
CREATE INDEX idx_product_name_search ON products USING gin(to_tsvector('english', product_name));
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

## 10. Related Documentation

- **[Master Data Configuration](master-data-configuration.md)** - Overall master data management
- **[POI Management](poi-management.md)** - Location master data
- **[Product Requisition Management](../03-operations/product-requisition-management.md)** - Product usage in requisitions
- **[QC Workflow](../04-poi-operations/qc-workflow.md)** - QC checklist integration

**Related User Stories:**
- Integrated in requisition and QC workflows (no dedicated story)

**Source**: PRD_DFMS_v1.0.md - Sections 6.4.1-6.4.3
