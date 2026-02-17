---
title: Master Data Overview
category: data-reference
status: complete
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../source-documents/discovery-phase/client-resources/master-data/
  - ../../../source-documents/requirements/PRD_DFMS_v1.0.docx
tags: [master-data, data-model, reference-data]
---

# Master Data Overview

> Overview of all master data entities in DFMS

---

## 📋 Purpose

Master data represents the core business entities that are relatively static and shared across the DFMS system. This document provides an overview of all master data entities, their purpose, key attributes, and sample data.

---

## 🗂️ Master Data Entities

### Summary

| Entity | Purpose | Approx. Records | Update Frequency | Owner Department |
|--------|---------|-----------------|------------------|------------------|
| **Vehicle** | Fleet information | 100+ | Monthly | Transport Operations |
| **Driver** | Driver/helper information | 150+ | Monthly | Transport Operations |
| **Vendor** | Vendor companies | 30+ | Quarterly | Procurement |
| **Location** | Depots, feedmills, sites | 25+ | Quarterly | Operations |
| **Product** | Feed products, SKUs | 50+ | Quarterly | Product Management |
| **Zone** | Geographic zones | 20+ | Yearly | Sales/Distribution |

---

## 🚚 1. Vehicle Master

### Purpose
Central repository of all vehicles (own fleet + vendor vehicles) used for transport operations.

### Key Attributes
- Registration number (unique identifier)
- Vehicle type (covered van, open truck, refrigerated, etc.)
- Ownership (own vs vendor)
- Capacity in tons
- GPS tracking capability
- Maintenance schedule
- Insurance and fitness validity

### Sample Data (from Nourish)

**Own Fleet Vehicles** (from `Covered_Van_List_Bhaluka_2025-10-03.xlsx`):
- 30+ covered vans at Bhaluka feedmill
- Capacity range: 5-15 tons
- All GPS-enabled
- Regular maintenance schedule

**Vendor Vehicles**:
- 50+ vendor vehicles enlisted
- Capacity range: 3-20 tons
- GPS tracking varies by vendor
- Contract-based usage

### Data Quality Rules
- ✅ Registration number must be unique
- ✅ GPS mandatory for own fleet
- ✅ Fitness certificate must be valid
- ✅ Insurance must be valid

---

## 👤 2. Driver Master

### Purpose
Store information about all drivers and helpers (permanent, backup, and vendor).

### Key Attributes
- Name (English + Bangla)
- Mobile number (unique)
- National ID and driving license
- Employment type (permanent/backup/vendor)
- Assigned vehicle
- Performance rating
- Accident history

### Sample Data (from Nourish)

**From `Truck_Wise_Driver_List_2025-10-03.xlsx`**:
- 30+ permanent drivers
- 5 backup drivers
- Each vehicle has assigned driver
- Helpers tied to specific drivers
- Mobile numbers for all drivers

**Driver Categories**:
1. **Permanent Drivers**: 30+ (Nourish employees)
2. **Backup Drivers**: 5 (for leave/absence coverage)
3. **Vendor Drivers**: 50+ (provided by vendors)

### Data Quality Rules
- ✅ Mobile number must be unique
- ✅ Driving license must be valid
- ✅ National ID required
- ✅ Emergency contact recommended

---

## 🏢 3. Vendor Master

### Purpose
Manage vendor company information for transport service providers.

### Key Attributes
- Company name
- Trade license, BIN, TIN
- Contact person and mobile
- Bank details for payments
- Security deposit amount
- Contract period
- Performance rating
- Blacklist status

### Sample Data (from Nourish)

**Vendor Types**:
1. **Finished Goods Vendors**: 15+ (annual contracts)
2. **Raw Material Vendors**: 15+ (trip-based/short-term)

**Vendor Performance Tracking**:
- Total trips completed
- On-time delivery percentage
- Quality compliance rate
- Payment history

### Data Quality Rules
- ✅ Trade license, BIN, TIN must be unique
- ✅ Blacklisted vendors cannot be assigned trips
- ✅ Contract dates must be valid
- ✅ Security deposit must be recorded

---

## 📍 4. Location Master

### Purpose
Store information about all locations (feedmills, depots, ports, customer sites).

### Key Attributes
- Location code (unique)
- Location name (English + Bangla)
- Location type (feedmill, depot, CFS, port, etc.)
- Address and GPS coordinates
- Capacity in tons
- Loading/unloading points
- Operating hours
- QC and weighbridge facilities

### Sample Data (from Nourish)

**From `Unit_Info_v2.xlsx` and `DFMS_Sample_Depot_Tracking_Data.xlsx`**:

**Feedmills** (5 locations):
1. Bhaluka Feedmill
2. Bogura Feedmill
3. Jessore Feedmill
4. Kapotakkho Feedmill
5. Chittagong Feedmill

**Depots** (20+ locations):
- Distributed across Bangladesh
- Capacity: 100-500 tons
- 2-3 unloading points each
- Operating hours: 08:00-20:00

**Other Locations**:
- CFS Chittagong (port operations)
- Customer sites (as needed)

### Data Quality Rules
- ✅ Location code must be unique
- ✅ GPS coordinates recommended
- ✅ Capacity must be defined for depots
- ✅ Operating hours must be specified

---

## 📦 5. Product Master

### Purpose
Catalog of all products (feed, DOC, raw materials) transported by DFMS.

### Key Attributes
- Product code/SKU (unique)
- Product name (English + Bangla)
- Product category (feed, DOC, raw material)
- Unit of measure (KG, TON, BAG, PIECE)
- Standard weight
- Temperature control requirements
- QC requirements
- Shelf life

### Sample Data (from Nourish)

**Feed Products** (Primary category):
- Broiler starter feed
- Broiler grower feed
- Layer feed
- Fish feed
- Cattle feed

**Packaging**:
- Standard bag: 50 KG
- Bulk: Measured in tons
- DOC: Counted in pieces

**Special Requirements**:
- All feed products require QC
- DOC requires temperature control
- Raw materials may require special handling

### Data Quality Rules
- ✅ Product code must be unique
- ✅ UOM must be specified
- ✅ QC requirements must be defined
- ✅ Temperature control flag must be set

---

## 🗺️ 6. Zone Master

### Purpose
Define geographic zones/territories for sales and distribution planning.

### Key Attributes
- Zone code (unique)
- Zone name (English + Bangla)
- Parent zone (for hierarchy)
- Zone type (division, district, upazila, custom)
- Description

### Sample Data (from Nourish)

**From `Nourish_Zone_Name.xlsx`**:

**Zone Hierarchy**:
```
Bangladesh
├── Dhaka Division
│   ├── Dhaka District
│   │   ├── Dhaka North
│   │   └── Dhaka South
│   ├── Gazipur District
│   └── Tangail District
├── Chittagong Division
│   ├── Chittagong District
│   └── Cox's Bazar District
└── ... (other divisions)
```

**Total Zones**: 20+ zones covering operational areas

### Data Quality Rules
- ✅ Zone code must be unique
- ✅ Parent zone must exist if specified
- ✅ Zone hierarchy must be logical

---

## 🔄 Master Data Management

### Data Ownership

| Entity | Owner | Approver | Update Frequency |
|--------|-------|----------|------------------|
| Vehicle | Transport Manager | Operations GM | Monthly |
| Driver | HR/Transport | Operations GM | Monthly |
| Vendor | Procurement Team | Procurement GM | Quarterly |
| Location | Operations Team | Operations GM | Quarterly |
| Product | Product Manager | Management | Quarterly |
| Zone | Sales Manager | Sales GM | Yearly |

### Data Quality Metrics

**Target Data Quality**:
- Completeness: 95%+
- Accuracy: 98%+
- Uniqueness: 100%
- Timeliness: Updated within 24 hours
- Consistency: 100% across systems

### Data Governance

**Master Data Lifecycle**:
1. **Create**: Authorized user creates new record
2. **Approve**: Designated approver reviews and approves
3. **Activate**: Record becomes active in system
4. **Update**: Changes require approval workflow
5. **Deactivate**: Records marked inactive (not deleted)
6. **Archive**: Old records archived for audit trail

---

## 📊 Master Data Statistics (Current State)

### From Nourish Sample Data

| Entity | Total Records | Active | Inactive | Data Source |
|--------|--------------|--------|----------|-------------|
| **Vehicles** | 80+ | 75+ | 5+ | Covered_Van_List, Vendor lists |
| **Drivers** | 150+ | 140+ | 10+ | Truck_Wise_Driver_List |
| **Vendors** | 30+ | 28+ | 2+ | Vendor Excel sheets |
| **Locations** | 25+ | 25 | 0 | Unit_Info, Depot lists |
| **Products** | 50+ | 45+ | 5+ | Product catalogs |
| **Zones** | 20+ | 20+ | 0 | Nourish_Zone_Name |

---

## 🔗 Integration Points

### Master Data Synchronization

**Systems Requiring Master Data**:
1. **DFMS Core** - Primary master data repository
2. **Mobile Apps** - Cached master data for offline use
3. **ERP System** - Synchronized for financial transactions
4. **MIS System** - Synchronized for reporting
5. **GPS Tracking** - Vehicle and driver data

**Synchronization Frequency**:
- Real-time: Critical updates (vehicle status, driver availability)
- Hourly: Performance metrics, ratings
- Daily: New records, updates
- Weekly: Full reconciliation

---

## 📚 Related Documents

- [Data Dictionary](../data-dictionary.md) - Complete field-level definitions
- [Business Rules](../../01-business-domain/business-rules/business-rules.md) - Rules governing master data
- [User Stories](../../04-implementation-stories/) - Features using master data

---

**Last Updated**: February 2026  
**Status**: Complete  
**Total Master Data Entities**: 6  
**Estimated Total Records**: 350+

