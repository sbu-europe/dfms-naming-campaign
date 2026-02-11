---
title: Transactional Data Overview
category: data-reference
status: complete
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../source-documents/requirements/PRD_DFMS_v1.0.docx
  - ../../../source-documents/meeting-minutes/
tags: [transactional-data, data-model, operational-data]
---

# Transactional Data Overview

> Overview of all transactional data entities in DFMS

---

## 📋 Purpose

Transactional data represents the operational records created during day-to-day DFMS operations. This document provides an overview of all transactional entities, their lifecycle, relationships, and volume estimates.

---

## 🔄 Transactional Data Entities

### Summary

| Entity | Purpose | Daily Volume | Retention Period | Archive Strategy |
|--------|---------|--------------|------------------|------------------|
| **Transport Request (TR)** | Transport requisitions | 50-100 | 3 years online | Archive after 3 years |
| **Transport Order (TO)** | Approved transport orders | 50-100 | 3 years online | Archive after 3 years |
| **Trip** | Trip execution records | 50-100 | 5 years online | Archive after 5 years |
| **Quality Check (QC)** | QC inspection records | 100-200 | 7 years online | Archive after 7 years (compliance) |

---

## 📝 1. Transport Request (TR)

### Purpose
Capture transport requisitions from depots, feedmills, or sales teams requesting vehicle allocation for product delivery.

### Lifecycle States

```
DRAFT → PENDING → APPROVED → CONVERTED → (COMPLETED)
          ↓
      REJECTED
          ↓
      CANCELLED
```

**State Descriptions**:
- **DRAFT**: TR being prepared, not yet submitted
- **PENDING**: Submitted, awaiting approval
- **APPROVED**: Approved, ready for TO creation
- **REJECTED**: Rejected by approver
- **CONVERTED**: Converted to Transport Order
- **CANCELLED**: Cancelled by requester

### Key Attributes
- TR number (auto-generated)
- Requester and department
- From/To locations
- Product and quantity
- Required date/time
- Priority level
- Approval workflow

### Business Rules
- BR-061: TR number format: `TR-YYYYMMDD-###`
- BR-062: Required date must be >= TR date
- BR-063: Only APPROVED TRs can be converted to TOs
- BR-064: From and To locations must be different
- BR-065: Quantity must be > 0

### Volume Estimates

**Current (Nourish)**:
- Daily TRs: 50-100
- Monthly TRs: 1,500-3,000
- Yearly TRs: 18,000-36,000

**Peak Periods**:
- BORO season (April-August): +40% volume
- Festive seasons: +20% volume

### Sample TR Flow

```
Day 1, 09:00: Depot Manager creates TR for 500 KG feed
Day 1, 09:15: TR submitted (PENDING)
Day 1, 09:30: Distribution Manager approves (APPROVED)
Day 1, 10:00: Transport Coordinator converts to TO (CONVERTED)
```

---

## 📋 2. Transport Order (TO)

### Purpose
Approved transport orders with vehicle, driver, and trip details assigned.

### Lifecycle States

```
CREATED → ASSIGNED → IN_PROGRESS → COMPLETED
                          ↓
                      CANCELLED
```

**State Descriptions**:
- **CREATED**: TO created from approved TR
- **ASSIGNED**: Vehicle and driver assigned
- **IN_PROGRESS**: Trip started
- **COMPLETED**: Trip completed successfully
- **CANCELLED**: TO cancelled before completion

### Key Attributes
- TO number (auto-generated)
- Source TR reference
- From/To locations
- Product and quantity
- Assigned vehicle, driver, helper
- Vendor (if vendor vehicle)
- Expected start/end dates
- Estimated cost

### Business Rules
- BR-071: TO number format: `TO-YYYYMMDD-###`
- BR-072: TO must reference valid TR
- BR-073: Vehicle and driver must be assigned before trip start
- BR-074: End date must be >= start date
- BR-075: Vendor required if vendor vehicle assigned

### Volume Estimates

**Current (Nourish)**:
- Daily TOs: 50-100 (same as TRs, 1:1 conversion)
- Monthly TOs: 1,500-3,000
- Yearly TOs: 18,000-36,000

**TO to Trip Ratio**: 1:1 (one TO = one Trip)

### Sample TO Flow

```
Day 1, 10:00: TO created from TR-20250101-001
Day 1, 10:15: Vehicle VEH-001 assigned
Day 1, 10:20: Driver DRV-001 assigned
Day 1, 10:25: TO status → ASSIGNED
Day 2, 08:00: Trip starts → IN_PROGRESS
Day 3, 09:00: Trip completes → COMPLETED
```

---

## 🚚 3. Trip

### Purpose
Detailed trip execution records tracking the entire journey from loading to delivery.

### Lifecycle States

```
CREATED → AT_LOADING → LOADING → LOADED → IN_TRANSIT → 
AT_UNLOADING → UNLOADING → COMPLETED
                          ↓
                      CANCELLED
```

**State Descriptions**:
- **CREATED**: Trip record created
- **AT_LOADING**: Vehicle arrived at loading point
- **LOADING**: Loading in progress
- **LOADED**: Loading completed, ready to depart
- **IN_TRANSIT**: Vehicle in transit
- **AT_UNLOADING**: Vehicle arrived at unloading point
- **UNLOADING**: Unloading in progress
- **COMPLETED**: Trip completed, vehicle available
- **CANCELLED**: Trip cancelled

### Key Attributes
- Trip number (auto-generated)
- Source TO reference
- Vehicle, driver, helper
- From/To locations
- Product and quantities (planned vs actual)
- Timestamps (loading, departure, arrival, unloading, completion)
- Distance and fuel consumed
- Challan and seal numbers
- Delay reasons
- Incident reports

### Business Rules
- BR-081: Trip number format: `TRIP-YYYYMMDD-###`
- BR-082: Timestamps must follow logical sequence
- BR-083: Actual quantity cannot exceed planned by >5%
- BR-084: Delays >24 hours must have reason
- BR-085: Incidents must be documented

### Volume Estimates

**Current (Nourish)**:
- Daily Trips: 50-100
- Monthly Trips: 1,500-3,000
- Yearly Trips: 18,000-36,000

**Trip Duration**:
- Expected: 24 hours
- Actual average: 26-28 hours
- 20-30% trips exceed 24 hours

### Sample Trip Timeline

```
Day 1, 08:00: Trip created (CREATED)
Day 1, 08:15: Arrived at feedmill (AT_LOADING)
Day 1, 08:30: Loading started (LOADING)
Day 1, 10:00: Loading completed (LOADED)
Day 1, 10:15: Departed (IN_TRANSIT)
Day 2, 06:00: Arrived at depot (AT_UNLOADING)
Day 2, 07:00: Unloading started (UNLOADING)
Day 2, 09:00: Unloading completed (COMPLETED)

Total Duration: 25 hours
Distance: 150 KM
Fuel: 45 liters
```

### Trip Performance Metrics

| Metric | Target | Current | Gap |
|--------|--------|---------|-----|
| On-time completion | 90% | 75% | -15% |
| Average duration | 24 hrs | 27 hrs | +3 hrs |
| Fuel efficiency | 3.5 km/L | 3.2 km/L | -0.3 km/L |
| Incident rate | <2% | 3% | +1% |

---

## 🔬 4. Quality Check (QC)

### Purpose
Record QC inspections and test results for product quality assurance and compliance.

### QC Types

1. **PRE_LOADING**: Before loading at feedmill
2. **POST_LOADING**: After loading, before departure
3. **PRE_UNLOADING**: Before unloading at depot
4. **POST_UNLOADING**: After unloading, acceptance check
5. **RANDOM**: Random quality checks

### Lifecycle States

```
CREATED → INSPECTION_IN_PROGRESS → LAB_TEST_PENDING → 
LAB_TEST_COMPLETED → CLEARANCE_GIVEN
                          ↓
                      REJECTED
```

**State Descriptions**:
- **CREATED**: QC record created
- **INSPECTION_IN_PROGRESS**: Visual inspection ongoing
- **LAB_TEST_PENDING**: Lab test required, pending
- **LAB_TEST_COMPLETED**: Lab test completed
- **CLEARANCE_GIVEN**: QC passed, clearance given
- **REJECTED**: QC failed, product rejected

### Key Attributes
- QC number (auto-generated)
- Related trip reference
- Product and location
- QC type and date/time
- Inspector details
- Sample ID and QR code
- Visual inspection result
- Lab test parameters (moisture, temperature, weight)
- Lab test results
- Photos
- Overall result
- Clearance status
- Rejection reason (if failed)

### Business Rules
- BR-091: QC number format: `QC-YYYYMMDD-###`
- BR-092: Lab test result required if lab test completed
- BR-093: Clearance only if overall result is PASS
- BR-094: Failed QC must have rejection reason
- BR-095: Sample tracking mandatory for lab tests

### Volume Estimates

**Current (Nourish)**:
- Daily QC checks: 100-200 (2 per trip average)
- Monthly QC checks: 3,000-6,000
- Yearly QC checks: 36,000-72,000

**QC Distribution**:
- PRE_LOADING: 40%
- POST_LOADING: 10%
- PRE_UNLOADING: 40%
- POST_UNLOADING: 5%
- RANDOM: 5%

### Sample QC Flow

```
Day 1, 08:30: QC created for TRIP-001 (PRE_LOADING)
Day 1, 08:35: Visual inspection started
Day 1, 08:45: Sample collected (SAMPLE-001)
Day 1, 08:50: Visual inspection: PASS
Day 1, 09:00: Lab test started (LAB_TEST_PENDING)
Day 1, 09:30: Lab test completed: PASS
Day 1, 09:35: Overall result: PASS
Day 1, 09:40: Clearance given (CLEARANCE_GIVEN)

Total QC Time: 70 minutes
```

### QC Performance Metrics

| Metric | Target | Current | Gap |
|--------|--------|---------|-----|
| QC clearance time | 30 min | 70 min | +40 min |
| Pass rate | 98% | 96% | -2% |
| Lab test accuracy | 99% | 98% | -1% |
| Sample traceability | 100% | 85% | -15% |

---

## 🔗 Transactional Data Relationships

### Data Flow

```
TR (Transport Request)
  ↓
TO (Transport Order)
  ↓
Trip (Trip Execution)
  ↓
QC (Quality Checks) [Multiple per trip]
```

### Relationship Cardinality

| Relationship | Cardinality | Description |
|--------------|-------------|-------------|
| TR → TO | 1:1 | One TR converts to one TO |
| TO → Trip | 1:1 | One TO creates one Trip |
| Trip → QC | 1:N | One Trip has multiple QC checks |

### Referential Integrity

**Cascade Rules**:
- Delete TR: Cannot delete if TO exists
- Delete TO: Cannot delete if Trip exists
- Delete Trip: Cannot delete if QC exists
- Cancel TR: Cascades to TO and Trip (if not started)
- Cancel TO: Cascades to Trip (if not started)

---

## 📊 Data Volume Projections

### Current State (Nourish - 2025)

| Entity | Daily | Monthly | Yearly | Storage/Record |
|--------|-------|---------|--------|----------------|
| TR | 75 | 2,250 | 27,000 | 2 KB |
| TO | 75 | 2,250 | 27,000 | 3 KB |
| Trip | 75 | 2,250 | 27,000 | 5 KB |
| QC | 150 | 4,500 | 54,000 | 4 KB |
| **Total** | **375** | **11,250** | **135,000** | **~500 MB/year** |

### Future State (5 years - 2030)

**Assumptions**:
- 5x growth in depots (20 → 100)
- 3x growth in volume per depot

**Projected Volumes**:

| Entity | Daily | Monthly | Yearly | Storage/Record |
|--------|-------|---------|--------|----------------|
| TR | 1,125 | 33,750 | 405,000 | 2 KB |
| TO | 1,125 | 33,750 | 405,000 | 3 KB |
| Trip | 1,125 | 33,750 | 405,000 | 5 KB |
| QC | 2,250 | 67,500 | 810,000 | 4 KB |
| **Total** | **5,625** | **168,750** | **2,025,000** | **~7.5 GB/year** |

**5-Year Cumulative**: ~37.5 GB (with 3-year online retention)

---

## 🗄️ Data Retention & Archival

### Retention Policy

| Entity | Online Retention | Archive Retention | Total Retention | Reason |
|--------|------------------|-------------------|-----------------|--------|
| TR | 3 years | 7 years | 10 years | Business requirement |
| TO | 3 years | 7 years | 10 years | Business requirement |
| Trip | 5 years | 10 years | 15 years | Audit and analytics |
| QC | 7 years | 10 years | 17 years | Compliance (food safety) |

### Archival Strategy

**Archive Triggers**:
- TR/TO: After 3 years from creation
- Trip: After 5 years from completion
- QC: After 7 years from inspection date

**Archive Process**:
1. Identify records eligible for archival
2. Export to archive database
3. Verify archive integrity
4. Mark as archived in online system
5. Remove from online database (keep reference)

**Archive Access**:
- Read-only access via archive portal
- Searchable by key fields
- Export capability for audit/compliance

---

## 📈 Performance Considerations

### Database Indexing

**Critical Indexes**:
- TR: tr_number, tr_date, status, from_location_id, to_location_id
- TO: to_number, tr_id, to_date, status, vehicle_id
- Trip: trip_number, to_id, vehicle_id, driver_id, status, departure_time
- QC: qc_number, trip_id, qc_date, overall_result

### Query Optimization

**Common Queries**:
1. Active trips by status
2. TRs pending approval
3. TOs assigned to vehicle/driver
4. QC results by date range
5. Trip history by vehicle
6. Performance metrics by period

**Optimization Strategies**:
- Partition tables by date (monthly)
- Index on frequently queried fields
- Materialized views for reports
- Cache frequently accessed data

---

## 🔗 Integration Points

### Real-time Data Sync

**Systems Requiring Transactional Data**:
1. **Mobile Apps**: Trip status, QC results
2. **Dashboard**: Real-time metrics
3. **GPS Tracking**: Trip location updates
4. **ERP**: Cost and billing data
5. **MIS**: Reporting and analytics

**Sync Frequency**:
- Real-time: Trip status updates, QC clearances
- Every 5 minutes: GPS location updates
- Hourly: Performance metrics
- Daily: Completed trips, QC summaries

---

## 📚 Related Documents

- [Data Dictionary](../data-dictionary.md) - Complete field-level definitions
- [Master Data Overview](../master-data/master-data-overview.md) - Master data entities
- [Business Processes](../../01-business-domain/business-processes/business-processes-overview.md) - Processes creating transactional data
- [User Stories](../../03-features/) - Features using transactional data

---

**Last Updated**: February 2026  
**Status**: Complete  
**Total Transactional Entities**: 4  
**Current Annual Volume**: 135,000 records  
**Projected 2030 Volume**: 2,025,000 records/year

