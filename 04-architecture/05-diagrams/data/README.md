# Data Architecture Diagrams

> Entity-relationship diagrams and data model visualizations

## 📖 Overview

This folder contains data architecture diagrams that show the database structure, entity relationships, and data model for DFMS.

## 📁 Contents

### Entity-Relationship (ER) Diagram
**File**: `entity-relationship-diagram.mmd`  
**Description**: Complete database schema and relationships
- **12 Core entities**: User, Tenant, POI, Product, PR, TR, TO, Trip, Vehicle, Driver, Vendor, Invoice
- **Relationships**: One-to-many, many-to-many, foreign keys
- **Cardinality**: Relationship multiplicity
- **Key attributes**: Primary keys, foreign keys, unique constraints

### Key Entity Groups

**1. Foundation Entities**:
- `User` - System users and authentication
- `Tenant` - Multi-tenancy organization
- `Role` - RBAC roles and permissions

**2. Master Data Entities**:
- `POI` (Point of Interest) - Locations
- `Product` - Product catalog
- `Vehicle` - Fleet vehicles
- `Driver` - Driver pool
- `Vendor` - Vendor network

**3. Operational Entities**:
- `ProductRequisition` (PR) - Product requests
- `TransportRequisition` (TR) - Transport requests
- `TransportOrder` (TO) - Transport orders
- `Trip` - Trip execution

**4. Operations Support**:
- `GateEntry` - Gate-in/out records
- `QCInspection` - Quality control
- `LoadingOperation` - Loading/unloading
- `WeighingRecord` - Scaling records

**5. Financial Entities**:
- `TripCost` - Trip costing
- `VendorInvoice` - Vendor billing
- `Payment` - Payment records

## 🎯 Purpose

The ER diagram helps understand:
- **Database schema**: Complete data structure
- **Entity relationships**: How entities relate to each other
- **Data integrity**: Foreign keys and constraints
- **Multi-tenancy**: Data isolation strategy
- **Query optimization**: Index planning and join paths
- **Data migration**: Understanding data dependencies

## 📊 Data Model Characteristics

**Multi-Tenancy Strategy**:
- Schema-per-tenant approach
- Complete data isolation
- Shared application code

**Normalization**:
- 3rd Normal Form (3NF)
- Optimized for transactional workload
- Balanced between normalization and performance

**Key Design Patterns**:
- Soft deletes (is_deleted flag)
- Audit fields (created_at, updated_at, created_by, updated_by)
- Status enums for entity lifecycle
- UUID primary keys for distributed systems

## 🔗 Related Documentation

- **[Data Models](../../../06-contracts/02-data-models/README.md)** - Detailed entity definitions (JSON Schema)
- **[Data Architecture](../../01-system-design/data-architecture/)** - High-level data architecture
- **[Database Implementation](../../04-backend/database-implementation.md)** - Django ORM models
- **[Database Guide](../../../08-development-guides/01-backend/03-database/)** - Implementation guides
- **[All Diagrams Index](../diagrams-index.md)** - Complete diagram catalog

---

**Last Updated**: February 27, 2026  
**Total Diagrams**: 1  
**Format**: Mermaid ER diagram (.mmd)  
**Entities**: 12+ core entities, 30+ total entities
