---
title: DFMS Data Dictionary
category: data-reference
status: complete
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../source-documents/01-prd/DFMS_Product_Requirements_Document_v3.md
  - ../../source-documents/discovery-phase/client-resources/master-data/
tags: [data-dictionary, data-model, entities, fields]
---

# DFMS Data Dictionary

> Complete data dictionary for all entities, fields, and relationships in DFMS

---

## 📋 Overview

This data dictionary defines all data entities, their fields, data types, constraints, and relationships in the DFMS system.

**Total Entities**: 10 (6 master data + 4 transactional data)  
**Total Fields**: 200+ fields across all entities

---

## 🗂️ Master Data Entities

### 1. Vehicle Master

**Entity**: `Vehicle`  
**Purpose**: Store information about all vehicles (own fleet + vendor vehicles)  
**Primary Key**: `vehicle_id`

| Field Name | Data Type | Required | Constraints | Description | Example |
|------------|-----------|----------|-------------|-------------|---------|
| `vehicle_id` | UUID | Yes | PK, Unique | Unique vehicle identifier | `VEH-001` |
| `registration_number` | String(20) | Yes | Unique | Vehicle registration/license plate | `DHAKA-GA-11-2345` |
| `vehicle_type` | Enum | Yes | See Vehicle Types | Type of vehicle | `COVERED_VAN` |
| `ownership_type` | Enum | Yes | `OWN`, `VENDOR` | Ownership | `OWN` |
| `vendor_id` | UUID | Conditional | FK to Vendor | Required if ownership=VENDOR | `VEN-001` |
| `capacity_tons` | Decimal(5,2) | Yes | > 0 | Load capacity in tons | `10.00` |
| `brand` | String(50) | No | - | Vehicle brand/make | `TATA` |
| `model` | String(50) | No | - | Vehicle model | `LPT 1613` |
| `year_of_manufacture` | Integer | No | 1990-current | Manufacturing year | `2020` |
| `gps_device_id` | String(50) | No | - | GPS tracker ID | `GPS-12345` |
| `gps_enabled` | Boolean | Yes | Default: false | GPS tracking available | `true` |
| `status` | Enum | Yes | See Vehicle Status (§ below) | Current operational status (`operational_status`) | `no_active_to` |
| `last_maintenance_date` | Date | No | - | Last maintenance date | `2025-12-01` |
| `next_maintenance_due` | Date | No | - | Next maintenance due | `2026-03-01` |
| `insurance_expiry` | Date | No | - | Insurance expiry date | `2026-06-30` |
| `fitness_expiry` | Date | No | - | Fitness certificate expiry | `2026-12-31` |
| `created_at` | Timestamp | Yes | Auto | Record creation time | `2025-01-01 10:00:00` |
| `updated_at` | Timestamp | Yes | Auto | Last update time | `2025-12-15 14:30:00` |
| `created_by` | UUID | Yes | FK to User | Creator user ID | `USR-001` |

**Vehicle Types**:
- `COVERED_VAN` - Enclosed cargo van
- `OPEN_TRUCK` - Open cargo truck
- `REFRIGERATED` - Temperature-controlled vehicle
- `TANKER` - Liquid transport
- `PICKUP` - Small pickup truck

**Vehicle Status** (`operational_status` — **V2**, see [vehicle-master-data.md](../../05-modules/02-master-data/vehicle-master-data.md) §3):

| Value | Label | Notes |
|-------|-------|-------|
| `no_active_to` | No Active TO | Idle; not assigned, not executing (replaces V1 `available` / `idle`) |
| `scheduled` | Scheduled | Assigned to non-terminal TO; trip not started |
| `in_transit` | In-transit | Start Trip through TO terminal (replaces V1 `active`) |
| `under_maintenance` | Under Maintenance | Unchanged from V1; blocks assignment |

**Version history:** V1 (five values incl. `available`, `active`, `idle`) → **V2** (2026-07-06, TO-driven four-value model). Legacy contract labels (`ACTIVE`, `IN_TRIP`, `MAINTENANCE`, `INACTIVE`, `RETIRED`) are not used on `Vehicle.operational_status`; use `is_active` for fleet retirement and `under_maintenance` for workshop blocks.

**Reconciliation:** `refresh_vehicle_operational_status()` is invoked on every `apply_to_status_transition()` call and on selected assignment admin paths. Repair stale rows: `python manage.py reconcile_vehicle_operational_status` (`--dry-run`, `--schema`).

**Fleet availability APIs** (`GET /api/v1/fleet/availability`, `GET /api/v1/vehicles/available`): count/list own-fleet vehicles that are `is_active`, not `under_maintenance`, and not linked to a non-terminal transport order — implemented via `available_vehicles_queryset` (replaces V1 filter `status=available`). POI filter uses `assigned_poi_id` (not `current_poi_id`).

**Business Rules**:
- BR-001: Each vehicle must have unique registration number
- BR-002: Vendor vehicles must have valid vendor_id
- BR-003: GPS tracking mandatory for own fleet
- BR-004: Capacity must be greater than 0

---

### 2. Driver Master

**Entity**: `Driver`  
**Purpose**: Store driver and helper information  
**Primary Key**: `driver_id`

| Field Name | Data Type | Required | Constraints | Description | Example |
|------------|-----------|----------|-------------|-------------|---------|
| `driver_id` | UUID | Yes | PK, Unique | Unique driver identifier | `DRV-001` |
| `employee_id` | String(20) | Conditional | Unique | Employee ID (for own drivers) | `EMP-2025-001` |
| `name` | String(100) | Yes | - | Full name | `Mohammed Rahman` |
| `name_bn` | String(100) | No | - | Name in Bangla | `মোহাম্মদ রহমান` |
| `mobile_number` | String(15) | Yes | Unique, Format | Mobile number | `+8801712345678` |
| `national_id` | String(20) | Yes | Unique | National ID/NID | `19901234567890123` |
| `driving_license` | String(20) | Yes | Unique | Driving license number | `DL-12345678` |
| `license_expiry` | Date | Yes | Future date | License expiry date | `2027-12-31` |
| `driver_type` | Enum | Yes | `DRIVER`, `HELPER` | Role type | `DRIVER` |
| `employment_type` | Enum | Yes | `PERMANENT`, `BACKUP`, `VENDOR` | Employment type | `PERMANENT` |
| `vendor_id` | UUID | Conditional | FK to Vendor | Required if employment=VENDOR | `VEN-001` |
| `assigned_vehicle_id` | UUID | No | FK to Vehicle | Permanently assigned vehicle | `VEH-001` |
| `date_of_birth` | Date | No | - | Date of birth | `1990-05-15` |
| `address` | Text | No | - | Residential address | `Mirpur, Dhaka` |
| `emergency_contact` | String(15) | No | - | Emergency contact number | `+8801812345678` |
| `blood_group` | Enum | No | See Blood Groups | Blood group | `B+` |
| `status` | Enum | Yes | See Driver Status | Current status | `AVAILABLE` |
| `rating` | Decimal(2,1) | No | 0.0-5.0 | Performance rating | `4.5` |
| `total_trips` | Integer | Yes | Default: 0 | Total trips completed | `150` |
| `accident_history` | Text | No | - | Accident history notes | `None` |
| `created_at` | Timestamp | Yes | Auto | Record creation time | `2025-01-01 10:00:00` |
| `updated_at` | Timestamp | Yes | Auto | Last update time | `2025-12-15 14:30:00` |

**Driver Status**:
- `AVAILABLE` - Available for assignment
- `ON_TRIP` - Currently on a trip
- `ON_LEAVE` - On leave
- `SUSPENDED` - Temporarily suspended
- `INACTIVE` - Not available

**Business Rules**:
- BR-011: Mobile number must be unique
- BR-012: Driving license required for DRIVER type
- BR-013: License must be valid (not expired)
- BR-014: Vendor drivers must have valid vendor_id

---

### 3. Vendor Master

**Entity**: `Vendor`  
**Purpose**: Store vendor company information  
**Primary Key**: `vendor_id`

| Field Name | Data Type | Required | Constraints | Description | Example |
|------------|-----------|----------|-------------|-------------|---------|
| `vendor_id` | UUID | Yes | PK, Unique | Unique vendor identifier | `VEN-001` |
| `vendor_code` | String(20) | Yes | Unique | Vendor code | `VEN-2025-001` |
| `company_name` | String(200) | Yes | - | Company name | `ABC Transport Ltd` |
| `company_name_bn` | String(200) | No | - | Company name in Bangla | `এবিসি ট্রান্সপোর্ট লিমিটেড` |
| `trade_license` | String(50) | Yes | Unique | Trade license number | `TL-12345678` |
| `bin_number` | String(20) | Yes | Unique | Business Identification Number | `BIN-123456789` |
| `tin_number` | String(20) | Yes | Unique | Tax Identification Number | `TIN-987654321` |
| `contact_person` | String(100) | Yes | - | Primary contact person | `Karim Ahmed` |
| `mobile_number` | String(15) | Yes | - | Contact mobile number | `+8801712345678` |
| `email` | String(100) | No | Email format | Email address | `info@abctransport.com` |
| `address` | Text | Yes | - | Business address | `Tejgaon, Dhaka` |
| `bank_name` | String(100) | No | - | Bank name for payments | `Dutch Bangla Bank` |
| `bank_account` | String(50) | No | - | Bank account number | `1234567890` |
| `bank_branch` | String(100) | No | - | Bank branch | `Gulshan Branch` |
| `security_deposit` | Decimal(10,2) | No | >= 0 | Security deposit amount | `50000.00` |
| `contract_start_date` | Date | No | - | Contract start date | `2025-01-01` |
| `contract_end_date` | Date | No | - | Contract end date | `2025-12-31` |
| `vendor_type` | Enum | Yes | See Vendor Types | Type of vendor | `TRANSPORT` |
| `service_type` | Enum | Yes | See Service Types | Service provided | `FINISHED_GOODS` |
| `rating` | Decimal(2,1) | No | 0.0-5.0 | Performance rating | `4.2` |
| `total_trips` | Integer | Yes | Default: 0 | Total trips completed | `500` |
| `on_time_percentage` | Decimal(5,2) | No | 0-100 | On-time delivery % | `85.50` |
| `status` | Enum | Yes | See Vendor Status | Current status | `ACTIVE` |
| `blacklisted` | Boolean | Yes | Default: false | Blacklist status | `false` |
| `blacklist_reason` | Text | No | - | Reason for blacklisting | `null` |
| `created_at` | Timestamp | Yes | Auto | Record creation time | `2025-01-01 10:00:00` |
| `updated_at` | Timestamp | Yes | Auto | Last update time | `2025-12-15 14:30:00` |

**Vendor Types**:
- `TRANSPORT` - Transport service provider
- `LOGISTICS` - Full logistics provider
- `3PL` - Third-party logistics

**Service Types**:
- `FINISHED_GOODS` - Finished goods delivery
- `RAW_MATERIAL` - Raw material transport
- `BOTH` - Both services

**Vendor Status**:
- `ACTIVE` - Active vendor
- `INACTIVE` - Temporarily inactive
- `SUSPENDED` - Suspended
- `BLACKLISTED` - Blacklisted

**Business Rules**:
- BR-021: Trade license, BIN, TIN must be unique
- BR-022: Blacklisted vendors cannot be assigned trips
- BR-023: Contract end date must be after start date

---

### 4. Location Master

**Entity**: `Location`  
**Purpose**: Store depot, feedmill, and other location information  
**Primary Key**: `location_id`

| Field Name | Data Type | Required | Constraints | Description | Example |
|------------|-----------|----------|-------------|-------------|---------|
| `location_id` | UUID | Yes | PK, Unique | Unique location identifier | `LOC-001` |
| `location_code` | String(20) | Yes | Unique | Location code | `DEPOT-MIR-001` |
| `location_name` | String(200) | Yes | - | Location name | `Mirpur Depot` |
| `location_name_bn` | String(200) | No | - | Location name in Bangla | `মিরপুর ডিপো` |
| `location_type` | Enum | Yes | See Location Types | Type of location | `DEPOT` |
| `zone_id` | UUID | No | FK to Zone | Geographic zone | `ZONE-001` |
| `address` | Text | Yes | - | Full address | `Mirpur-10, Dhaka-1216` |
| `latitude` | Decimal(10,8) | No | -90 to 90 | GPS latitude | `23.8103` |
| `longitude` | Decimal(11,8) | No | -180 to 180 | GPS longitude | `90.4125` |
| `capacity_tons` | Decimal(10,2) | No | > 0 | Storage capacity in tons | `500.00` |
| `loading_points` | Integer | No | > 0 | Number of loading points | `3` |
| `unloading_points` | Integer | No | > 0 | Number of unloading points | `2` |
| `contact_person` | String(100) | No | - | Site contact person | `Rahim Manager` |
| `mobile_number` | String(15) | No | - | Contact number | `+8801712345678` |
| `operating_hours` | String(50) | No | - | Operating hours | `08:00-20:00` |
| `has_qc_facility` | Boolean | Yes | Default: false | QC facility available | `true` |
| `has_weighbridge` | Boolean | Yes | Default: false | Weighbridge available | `true` |
| `status` | Enum | Yes | See Location Status | Current status | `ACTIVE` |
| `created_at` | Timestamp | Yes | Auto | Record creation time | `2025-01-01 10:00:00` |
| `updated_at` | Timestamp | Yes | Auto | Last update time | `2025-12-15 14:30:00` |

**Location Types**:
- `FEEDMILL` - Feed production facility
- `DEPOT` - Distribution depot
- `CFS` - Container Freight Station
- `PORT` - Port location
- `WAREHOUSE` - Storage warehouse
- `CUSTOMER_SITE` - Customer location

**Location Status**:
- `ACTIVE` - Operational
- `INACTIVE` - Temporarily closed
- `MAINTENANCE` - Under maintenance

**Business Rules**:
- BR-031: Location code must be unique
- BR-032: Feedmills must have loading points
- BR-033: Depots must have unloading points

---

### 5. Product Master

**Entity**: `Product`  
**Purpose**: Store product/SKU information  
**Primary Key**: `product_id`

| Field Name | Data Type | Required | Constraints | Description | Example |
|------------|-----------|----------|-------------|-------------|---------|
| `product_id` | UUID | Yes | PK, Unique | Unique product identifier | `PRD-001` |
| `product_code` | String(50) | Yes | Unique | Product code/SKU | `FEED-BROILER-001` |
| `product_name` | String(200) | Yes | - | Product name | `Broiler Starter Feed` |
| `product_name_bn` | String(200) | No | - | Product name in Bangla | `ব্রয়লার স্টার্টার ফিড` |
| `product_category` | Enum | Yes | See Product Categories | Product category | `FEED` |
| `product_type` | String(100) | No | - | Product type/sub-category | `Broiler Feed` |
| `unit_of_measure` | Enum | Yes | See UOM | Unit of measurement | `KG` |
| `standard_weight` | Decimal(10,2) | No | > 0 | Standard weight per unit | `50.00` |
| `packaging_type` | String(50) | No | - | Packaging type | `Bag` |
| `requires_temperature_control` | Boolean | Yes | Default: false | Refrigeration required | `false` |
| `requires_qc` | Boolean | Yes | Default: true | QC required | `true` |
| `shelf_life_days` | Integer | No | > 0 | Shelf life in days | `90` |
| `hsn_code` | String(20) | No | - | HSN/SAC code | `2309` |
| `status` | Enum | Yes | See Product Status | Current status | `ACTIVE` |
| `created_at` | Timestamp | Yes | Auto | Record creation time | `2025-01-01 10:00:00` |
| `updated_at` | Timestamp | Yes | Auto | Last update time | `2025-12-15 14:30:00` |

**Product Categories**:
- `FEED` - Animal feed
- `DOC` - Day-old chicks
- `RAW_MATERIAL` - Raw materials
- `FINISHED_GOODS` - Other finished goods

**Unit of Measure (UOM)**:
- `KG` - Kilograms
- `TON` - Metric tons
- `BAG` - Bags
- `PIECE` - Pieces (for DOC)

**Product Status**:
- `ACTIVE` - Active product
- `INACTIVE` - Discontinued
- `SEASONAL` - Seasonal product

**Business Rules**:
- BR-041: Product code must be unique
- BR-042: DOC products require temperature control
- BR-043: All feed products require QC

---

### 6. Zone Master

**Entity**: `Zone`  
**Purpose**: Store geographic zone/territory information  
**Primary Key**: `zone_id`

| Field Name | Data Type | Required | Constraints | Description | Example |
|------------|-----------|----------|-------------|-------------|---------|
| `zone_id` | UUID | Yes | PK, Unique | Unique zone identifier | `ZONE-001` |
| `zone_code` | String(20) | Yes | Unique | Zone code | `DHAKA-NORTH` |
| `zone_name` | String(100) | Yes | - | Zone name | `Dhaka North` |
| `zone_name_bn` | String(100) | No | - | Zone name in Bangla | `ঢাকা উত্তর` |
| `parent_zone_id` | UUID | No | FK to Zone | Parent zone (for hierarchy) | `ZONE-DHAKA` |
| `zone_type` | Enum | Yes | See Zone Types | Type of zone | `DISTRICT` |
| `description` | Text | No | - | Zone description | `Northern districts of Dhaka division` |
| `status` | Enum | Yes | See Zone Status | Current status | `ACTIVE` |
| `created_at` | Timestamp | Yes | Auto | Record creation time | `2025-01-01 10:00:00` |
| `updated_at` | Timestamp | Yes | Auto | Last update time | `2025-12-15 14:30:00` |

**Zone Types**:
- `DIVISION` - Division level
- `DISTRICT` - District level
- `UPAZILA` - Upazila level
- `CUSTOM` - Custom zone

**Zone Status**:
- `ACTIVE` - Active zone
- `INACTIVE` - Inactive zone

**Business Rules**:
- BR-051: Zone code must be unique
- BR-052: Parent zone must exist if specified

---

## 🔄 Transactional Data Entities

### 7. Transport Request (TR)

**Entity**: `TransportRequest`  
**Purpose**: Store transport requisition information  
**Primary Key**: `tr_id`

| Field Name | Data Type | Required | Constraints | Description | Example |
|------------|-----------|----------|-------------|-------------|---------|
| `tr_id` | UUID | Yes | PK, Unique | Unique TR identifier | `TR-2025-001` |
| `tr_number` | String(50) | Yes | Unique, Auto | TR number | `TR-20250101-001` |
| `tr_date` | Date | Yes | - | TR creation date | `2025-01-15` |
| `requested_by` | UUID | Yes | FK to User | Requester user ID | `USR-001` |
| `department` | String(50) | No | - | Requesting department | `Distribution` |
| `priority` | Enum | Yes | See Priority | Request priority | `HIGH` |
| `from_location_id` | UUID | Yes | FK to Location | Loading location | `LOC-FEEDMILL-001` |
| `to_location_id` | UUID | Yes | FK to Location | Unloading location | `LOC-DEPOT-001` |
| `product_id` | UUID | Yes | FK to Product | Product to transport | `PRD-001` |
| `quantity` | Decimal(10,2) | Yes | > 0 | Quantity in UOM | `500.00` |
| `unit_of_measure` | Enum | Yes | See UOM | Unit of measurement | `KG` |
| `required_date` | Date | Yes | >= tr_date | Required delivery date | `2025-01-16` |
| `required_time` | Time | No | - | Required delivery time | `14:00:00` |
| `vehicle_type_required` | Enum | No | See Vehicle Types | Required vehicle type | `COVERED_VAN` |
| `special_instructions` | Text | No | - | Special handling instructions | `Handle with care` |
| `status` | Enum | Yes | See TR Status | Current status | `PENDING` |
| `approved_by` | UUID | No | FK to User | Approver user ID | `USR-002` |
| `approved_date` | Timestamp | No | - | Approval timestamp | `2025-01-15 10:30:00` |
| `rejection_reason` | Text | No | - | Reason if rejected | `null` |
| `created_at` | Timestamp | Yes | Auto | Record creation time | `2025-01-15 09:00:00` |
| `updated_at` | Timestamp | Yes | Auto | Last update time | `2025-01-15 10:30:00` |

**Priority**:
- `URGENT` - Immediate delivery required
- `HIGH` - High priority
- `MEDIUM` - Normal priority
- `LOW` - Low priority

**TR Status**:
- `DRAFT` - Being prepared
- `PENDING` - Awaiting approval
- `APPROVED` - Approved, ready for TO
- `REJECTED` - Rejected
- `CONVERTED` - Converted to TO
- `CANCELLED` - Cancelled

**Business Rules**:
- BR-061: TR number auto-generated
- BR-062: Required date must be >= TR date
- BR-063: Approved TRs can be converted to TOs
- BR-064: From and To locations must be different

---

### 8. Transport Order (TO)

**Entity**: `TransportOrder`  
**Purpose**: Store approved transport order information  
**Primary Key**: `to_id`

| Field Name | Data Type | Required | Constraints | Description | Example |
|------------|-----------|----------|-------------|-------------|---------|
| `to_id` | UUID | Yes | PK, Unique | Unique TO identifier | `TO-2025-001` |
| `to_number` | String(50) | Yes | Unique, Auto | TO number | `TO-20250115-001` |
| `tr_id` | UUID | Yes | FK to TR | Source transport request | `TR-2025-001` |
| `to_date` | Date | Yes | - | TO creation date | `2025-01-15` |
| `from_location_id` | UUID | Yes | FK to Location | Loading location | `LOC-FEEDMILL-001` |
| `to_location_id` | UUID | Yes | FK to Location | Unloading location | `LOC-DEPOT-001` |
| `product_id` | UUID | Yes | FK to Product | Product to transport | `PRD-001` |
| `quantity` | Decimal(10,2) | Yes | > 0 | Quantity in UOM | `500.00` |
| `unit_of_measure` | Enum | Yes | See UOM | Unit of measurement | `KG` |
| `vehicle_id` | UUID | No | FK to Vehicle | Assigned vehicle | `VEH-001` |
| `driver_id` | UUID | No | FK to Driver | Assigned driver | `DRV-001` |
| `helper_id` | UUID | No | FK to Driver | Assigned helper | `DRV-002` |
| `vendor_id` | UUID | No | FK to Vendor | Vendor (if vendor vehicle) | `VEN-001` |
| `expected_start_date` | Date | Yes | - | Expected start date | `2025-01-16` |
| `expected_end_date` | Date | Yes | >= start_date | Expected completion date | `2025-01-17` |
| `estimated_cost` | Decimal(10,2) | No | >= 0 | Estimated transport cost | `5000.00` |
| `status` | Enum | Yes | See TO Status | Current status | `ASSIGNED` |
| `created_by` | UUID | Yes | FK to User | Creator user ID | `USR-003` |
| `created_at` | Timestamp | Yes | Auto | Record creation time | `2025-01-15 11:00:00` |
| `updated_at` | Timestamp | Yes | Auto | Last update time | `2025-01-15 11:30:00` |

**TO Status**:
- `CREATED` - TO created, not assigned
- `ASSIGNED` - Vehicle/driver assigned
- `IN_PROGRESS` - Trip in progress
- `COMPLETED` - Trip completed
- `CANCELLED` - Cancelled

**Business Rules**:
- BR-071: TO number auto-generated
- BR-072: TO must reference valid TR
- BR-073: Vehicle and driver must be assigned before trip start
- BR-074: End date must be >= start date

---

### 9. Trip

**Entity**: `Trip`  
**Purpose**: Store trip execution and tracking information  
**Primary Key**: `trip_id`

| Field Name | Data Type | Required | Constraints | Description | Example |
|------------|-----------|----------|-------------|-------------|---------|
| `trip_id` | UUID | Yes | PK, Unique | Unique trip identifier | `TRIP-2025-001` |
| `trip_number` | String(50) | Yes | Unique, Auto | Trip number | `TRIP-20250116-001` |
| `to_id` | UUID | Yes | FK to TO | Source transport order | `TO-2025-001` |
| `vehicle_id` | UUID | Yes | FK to Vehicle | Assigned vehicle | `VEH-001` |
| `driver_id` | UUID | Yes | FK to Driver | Assigned driver | `DRV-001` |
| `helper_id` | UUID | No | FK to Driver | Assigned helper | `DRV-002` |
| `from_location_id` | UUID | Yes | FK to Location | Loading location | `LOC-FEEDMILL-001` |
| `to_location_id` | UUID | Yes | FK to Location | Unloading location | `LOC-DEPOT-001` |
| `product_id` | UUID | Yes | FK to Product | Product transported | `PRD-001` |
| `planned_quantity` | Decimal(10,2) | Yes | > 0 | Planned quantity | `500.00` |
| `actual_quantity` | Decimal(10,2) | No | >= 0 | Actual quantity delivered | `498.50` |
| `unit_of_measure` | Enum | Yes | See UOM | Unit of measurement | `KG` |
| `loading_start_time` | Timestamp | No | - | Loading start time | `2025-01-16 08:00:00` |
| `loading_end_time` | Timestamp | No | >= loading_start | Loading end time | `2025-01-16 10:00:00` |
| `departure_time` | Timestamp | No | >= loading_end | Departure time | `2025-01-16 10:15:00` |
| `arrival_time` | Timestamp | No | >= departure | Arrival time | `2025-01-17 06:00:00` |
| `unloading_start_time` | Timestamp | No | >= arrival | Unloading start time | `2025-01-17 07:00:00` |
| `unloading_end_time` | Timestamp | No | >= unloading_start | Unloading end time | `2025-01-17 09:00:00` |
| `completion_time` | Timestamp | No | >= unloading_end | Trip completion time | `2025-01-17 09:15:00` |
| `distance_km` | Decimal(8,2) | No | >= 0 | Distance traveled in km | `150.50` |
| `fuel_consumed_liters` | Decimal(8,2) | No | >= 0 | Fuel consumed | `45.00` |
| `challan_number` | String(50) | No | - | Delivery challan number | `CH-20250116-001` |
| `seal_number` | String(50) | No | - | Seal number (if sealed) | `SEAL-12345` |
| `status` | Enum | Yes | See Trip Status | Current status | `COMPLETED` |
| `delay_reason` | Text | No | - | Reason for delay | `Traffic jam` |
| `incident_reported` | Boolean | Yes | Default: false | Incident occurred | `false` |
| `incident_description` | Text | No | - | Incident details | `null` |
| `created_at` | Timestamp | Yes | Auto | Record creation time | `2025-01-16 07:00:00` |
| `updated_at` | Timestamp | Yes | Auto | Last update time | `2025-01-17 09:15:00` |

**Trip Status**:
- `CREATED` - Trip created
- `AT_LOADING` - At loading point
- `LOADING` - Loading in progress
- `LOADED` - Loading completed
- `IN_TRANSIT` - In transit
- `AT_UNLOADING` - At unloading point
- `UNLOADING` - Unloading in progress
- `COMPLETED` - Trip completed
- `CANCELLED` - Trip cancelled

**Business Rules**:
- BR-081: Trip number auto-generated
- BR-082: Timestamps must follow logical sequence
- BR-083: Actual quantity cannot exceed planned quantity by >5%
- BR-084: Delays >24 hours must have reason

---

### 10. Quality Check (QC)

**Entity**: `QualityCheck`  
**Purpose**: Store QC inspection and test results  
**Primary Key**: `qc_id`

| Field Name | Data Type | Required | Constraints | Description | Example |
|------------|-----------|----------|-------------|-------------|---------|
| `qc_id` | UUID | Yes | PK, Unique | Unique QC identifier | `QC-2025-001` |
| `qc_number` | String(50) | Yes | Unique, Auto | QC number | `QC-20250116-001` |
| `trip_id` | UUID | Yes | FK to Trip | Related trip | `TRIP-2025-001` |
| `product_id` | UUID | Yes | FK to Product | Product inspected | `PRD-001` |
| `location_id` | UUID | Yes | FK to Location | Inspection location | `LOC-FEEDMILL-001` |
| `qc_type` | Enum | Yes | See QC Types | Type of QC | `PRE_LOADING` |
| `qc_date` | Date | Yes | - | QC date | `2025-01-16` |
| `qc_time` | Time | Yes | - | QC time | `08:30:00` |
| `inspector_id` | UUID | Yes | FK to User | QC inspector | `USR-QC-001` |
| `sample_id` | String(50) | No | - | Sample identifier | `SAMPLE-20250116-001` |
| `sample_qr_code` | String(100) | No | - | Sample QR code | `QR-SAMPLE-001` |
| `visual_inspection` | Enum | Yes | See QC Results | Visual inspection result | `PASS` |
| `moisture_content` | Decimal(5,2) | No | 0-100 | Moisture % | `12.50` |
| `temperature` | Decimal(5,2) | No | - | Temperature in °C | `25.00` |
| `weight_kg` | Decimal(10,2) | No | > 0 | Sample weight | `1.00` |
| `lab_test_required` | Boolean | Yes | Default: false | Lab test required | `true` |
| `lab_test_completed` | Boolean | Yes | Default: false | Lab test completed | `true` |
| `lab_test_result` | Enum | No | See QC Results | Lab test result | `PASS` |
| `lab_test_date` | Timestamp | No | - | Lab test completion time | `2025-01-16 09:30:00` |
| `remarks` | Text | No | - | QC remarks | `Quality acceptable` |
| `photos` | JSON | No | - | Photo URLs | `["url1", "url2"]` |
| `overall_result` | Enum | Yes | See QC Results | Overall QC result | `PASS` |
| `clearance_given` | Boolean | Yes | Default: false | Clearance given | `true` |
| `clearance_time` | Timestamp | No | - | Clearance timestamp | `2025-01-16 09:45:00` |
| `rejection_reason` | Text | No | - | Reason if rejected | `null` |
| `created_at` | Timestamp | Yes | Auto | Record creation time | `2025-01-16 08:30:00` |
| `updated_at` | Timestamp | Yes | Auto | Last update time | `2025-01-16 09:45:00` |

**QC Types**:
- `PRE_LOADING` - Before loading
- `POST_LOADING` - After loading
- `PRE_UNLOADING` - Before unloading
- `POST_UNLOADING` - After unloading
- `RANDOM` - Random inspection

**QC Results**:
- `PASS` - Passed
- `FAIL` - Failed
- `CONDITIONAL` - Conditional pass
- `PENDING` - Pending

**Business Rules**:
- BR-091: QC number auto-generated
- BR-092: Lab test result required if lab test completed
- BR-093: Clearance can only be given if overall result is PASS
- BR-094: Failed QC must have rejection reason

---

## 🔗 Entity Relationships

### Master Data Relationships

```
Vehicle ──┬─> Vendor (if ownership=VENDOR)
          └─> Driver (assigned_vehicle_id)

Driver ───┬─> Vendor (if employment=VENDOR)
          └─> Vehicle (assigned_vehicle_id)

Vendor ───> Multiple Vehicles
          └─> Multiple Drivers

Location ─> Zone

Product ──> (no direct relationships)

Zone ─────> Zone (parent_zone_id, hierarchical)
```

### Transactional Data Relationships

```
TransportRequest ─> Location (from, to)
                  └─> Product

TransportOrder ───> TransportRequest
                  ├─> Location (from, to)
                  ├─> Product
                  ├─> Vehicle
                  ├─> Driver (driver, helper)
                  └─> Vendor (if vendor vehicle)

Trip ─────────────> TransportOrder
                  ├─> Vehicle
                  ├─> Driver (driver, helper)
                  ├─> Location (from, to)
                  └─> Product

QualityCheck ─────> Trip
                  ├─> Product
                  └─> Location
```

### Complete Relationship Diagram

```
TR ──> TO ──> Trip ──> QC
│      │      │
│      │      ├──> Vehicle ──> Vendor
│      │      ├──> Driver ──> Vendor
│      │      └──> Location ──> Zone
│      │
│      └──> Product
│
└──> Location ──> Zone
     Product
```

---

## 📚 Related Documents

- [Master Data Overview](./master-data/master-data-overview.md) - Detailed master data documentation
- [Transactional Data Overview](./transactional-data/transactional-data-overview.md) - Detailed transactional data documentation
- [Business Rules](../../02-domain/03-business-rules/business-rules.md) - Business rules governing data
- [User Stories](../../03-backlog/README.md) - Features using this data model

---

**Last Updated**: February 2026  
**Status**: Complete  
**Total Entities**: 10  
**Total Fields**: 200+  
**Total Relationships**: 15+

