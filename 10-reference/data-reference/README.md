---
title: Data Reference
category: data-reference
status: complete
created: 2026-02-11
updated: 2026-02-11
---

# Data Reference

> Master data structures, transactional data models, and data dictionary for DFMS

---

## 📖 Purpose

This folder contains reference information about data structures used in DFMS, including:
- Master data entities (vehicles, drivers, vendors, locations, products)
- Transactional data models (TRs, TOs, trips, QC checks)
- Data dictionary with field definitions
- Sample data from current operations

**Target Audience**: Developers, Data Architects, Business Analysts, QA Engineers

---

## 📁 Contents

### Core Documents
- **[data-dictionary.md](./data-dictionary.md)** - Complete data dictionary with all entities and fields
- **[master-data-overview.md](./master-data/master-data-overview.md)** - Overview of all master data entities
- **[transactional-data-overview.md](./transactional-data/transactional-data-overview.md)** - Overview of all transactional entities

### Master Data
- **[master-data/vehicles.md](./master-data/vehicles.md)** - Vehicle master data structure
- **[master-data/drivers.md](./master-data/drivers.md)** - Driver and helper data structure
- **[master-data/vendors.md](./master-data/vendors.md)** - Vendor data structure
- **[master-data/locations.md](./master-data/locations.md)** - Depot, feedmill, and location data
- **[master-data/products.md](./master-data/products.md)** - Product and SKU data
- **[master-data/zones.md](./master-data/zones.md)** - Zone and territory data

### Transactional Data
- **[transactional-data/transport-requests.md](./transactional-data/transport-requests.md)** - TR data model
- **[transactional-data/transport-orders.md](./transactional-data/transport-orders.md)** - TO data model
- **[transactional-data/trips.md](./transactional-data/trips.md)** - Trip lifecycle data
- **[transactional-data/quality-checks.md](./transactional-data/quality-checks.md)** - QC data model

---

## 🎯 Key Data Entities

### Master Data (6 entities)
1. **Vehicles** - Fleet information (own + vendor)
2. **Drivers** - Driver and helper information
3. **Vendors** - Vendor company and vehicle details
4. **Locations** - Depots, feedmills, loading/unloading points
5. **Products** - Feed products, SKUs, packaging
6. **Zones** - Geographic zones and territories

### Transactional Data (4 main entities)
1. **Transport Requests (TR)** - Requisitions from depots/feedmills
2. **Transport Orders (TO)** - Approved transport orders
3. **Trips** - Trip execution and tracking
4. **Quality Checks (QC)** - QC inspections and results

---

## 📊 Data Sources

All data structures derived from:
- `01-source/discovery-phase/client-resources/master-data/*.xlsx` - Sample master data
- `01-source/01-prd/PRD_DFMS_v1.0.docx` - Data model specifications
- Meeting minutes and discovery sessions - Business rules and constraints

---

## 🔗 Related Documentation

- [Business Rules](../01-business-domain/business-rules/business-rules.md) - Rules governing data
- [User Stories](../03-backlog/) - Features using this data
- [Technical Context](../../../04-architecture/) - API contracts and schemas

---

**Last Updated**: February 2026  
**Status**: Complete  
**Total Entities**: 10 (6 master + 4 transactional)

