---
source_document: PRD_DFMS_v1.0.md
source_sections: Product Inventory Management (PIM), Product Inventory Management (PIM)
extracted_date: 2026-02-13
---

## Product Inventory Management (PIM)

### Product Catalogue Management – Product Master Data

**Version 1.0, Phase 1**

**User Story:** _As an Tenant Admin, I want to define and manage product master data so that all transport, QC, requisition and costing workflows use standardized and accurate product information_.

**Acceptance Criteria:**

*   System provides a Product Master module to create and manage products
*   System supports two product types:
    *   Finished Goods (FG)
    *   Raw Materials (RM)
*   For **Finished Goods (FG)**:
    *   FG Product / SKU Item Code
    *   Product Name
    *   Product Type (Raw Material/Finished Goods)
    *   Product Category
    *   Product Sub-Category
    *   Type of packing (Pallet/Drum/Roll)
    *   Pack Size
    *   Unit of Measure (Bag/Ton/Piece/Carton)
    *   Standard Weight per unit
    *   Status (Active/Inactive)
*   For **Raw Materials (RM):**
    *   RM Product / SKU Item Code
    *   Product Name
    *   Product Type (Raw Material/Finished Goods)
    *   Product Category
    *   Product Sub-Category
    *   Type of packing (Pallet/Drum/Roll)
    *   Pack Size
    *   Unit of Measure (Bag/Ton/Piece/Carton)
    *   Standard Weight per unit
    *   Status (Active/Inactive)
*   Product codes are unique within a tenant
*   Inactive products cannot be selected in PR/TR/TO/QC workflows
*   All product create/update actions are audit logged

**Functional Requirements:**

*   \[Critical\] System SHALL provide a centralized Product Master module under PIM.
*   \[Critical\] System SHALL enforce unique Product Code/SKU per tenant.
*   \[Critical\] System SHALL support multiple product types aligned with DFMS operations (Feed, RM, FG, DOC, Packaging)
*   \[High\] System SHALL allow activating/deactivating products without deleting historical references.
*   \[High\] System SHALL expose product master data across PR, TR, TO, QC, Costing, and reporting modules
*   \[High\] System SHALL maintain audit logs for product creation, modification, and status changes
*   \[Medium\] A product marked Inactive cannot be used in new operational transactions

### Catalogue Design – Product Data Model Configuration

**Version 1.0, Phase 1**

**User Story:** _As a Tenant Admin, I want a flexible product catalogue structure so that different product categories can have different attributes without breaking downstream workflows._

**Acceptance Criteria:**

*   System provides comprehensive product catalogue management:
    *   Product Creation form capturing for both FG and RM:
        *   Product Name (required, unique within tenant)
        *   Product SKU (required, system-wide unique)
        *   Product Code (Required)
        *   Product Category (required, dropdown from pre-defined list)
        *   Product Sub-category (optional, dependent on category selection)
        *   Product Type (Raw Material / Finished Goods)
        *   Unit of Measure (UOM) (required, dropdown: Bags, Tons, Kilograms, Liters, Pieces, Cartons)
        *   Weight per Unit (required if UOM = Bags/Pieces/Cartons, decimal with 3 places)
        *   Standard Pack Size (optional)
        *   Product Description (Optional)
        *   Barcode/EAN Code (Optional)
        *   Product Image (Optional, JPG/PNG, max 2MB) \[TBD\]
        *   Manufacturer name (optional)
        *   Product Status (Active/Inactive/Discontinued/Seasonal)
    *   Product attributes stored include:
        *   Product Type Classification
        *   SKU (Stock Keeping Unit)
        *   Weight Specifications
        *   Category and sub-category hierarchy
        *   Unit of Measure
        *   Volume (optional)
        *   Special Handling requirements (optional)
*   Categories can be configured and reused across products
*   Attribute types supported: text, numeric, dropdown, Boolean
*   Attributes can be marked as mandatory or optional per category
*   Product catalogue structure is configurable without code changes
*   Mandatory attributes must be filled before a product can be activated
*   Category-level attribute changes apply only to new or edited products unless explicitly re-applied

**Functional Requirements:**

*   \[Critical\] System SHALL support configurable Product Categories.
*   \[Critical\] System SHALL enforce support category-level attribute definitions.
*   \[High\] System SHALL allow assigning attributes dynamically to products based on category.
*   \[High\] System SHALL store attribute metadata (data type, validation rules)
*   \[Medium\] System SHOULD allow future extension of attributes without impacting existing data

### Product Configuration – Transport & QC Attribute Mapping

**Version 1.0, Phase 1**

**User Story:** _As an Tenant Admin, I want to configure product-specific transport and QC attributes so that handling rules, capacity planning, and inspection workflows are product-aware._

**Acceptance Criteria:**

*   Product configuration allows tagging attributes relevant to:
    *   Transport (e.g., load type, special handling, stackable/non-stackable)
    *   QC (e.g., sampling required, checklist type, auto-pass eligibility)
*   Product configuration is visible to PR, TR, TO, QC modules

**Functional Requirements:**

*   \[Critical\] System SHALL allow mapping transport-related attributes to products.
*   \[Critical\] System SHALL allow mapping QC-related attributes to products.
*   \[High\] System SHALL use product configuration to auto-load QC checklist to products.
*   \[High\] System SHALL use product configuration to influence transport logic (vehicle type, capacity checks)
*   \[Medium\] System SHOULD allow default configuration per product category
*   \[Medium\] Product configuration changes do not retroactively alter completed PR/TR/TO/QC records


## Product Inventory Management (PIM)

*   Finished Goods (FG) and Raw Material (RM) product master
*   Product attributes:
*   SKU / Item Code
    *   Category and sub-category
    *   Unit of measure
    *   Standard weight per unit
*   Product activation/deactivation
*   Audit trail for product changes
