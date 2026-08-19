---
title: DFMS Master Data Rules
category: business
phase: requirements
status: approved
created: 2026-02-13
updated: 2026-02-13
source_documents:
  - ../../../source-documents/01-prd/DFMS_Product_Requirements_Document_v3.md
tags: [business-rules, master, data, rules]
---

# DFMS Master Data Rules

## Master Data Rules

### 1.1 Vehicle Rules

**VR-001: Unique Vehicle Registration**
- **Rule**: Each vehicle must have a unique registration number within a tenant
- **Validation**: System SHALL prevent duplicate vehicle registration numbers
- **Impact**: Vehicle master data creation

**VR-002: Vehicle Status Exclusivity**
- **Rule**: A vehicle can only have one status at a time
- **Valid States**: Available, Active, Idle, Scheduled/Parked, Under Maintenance
- **Impact**: Vehicle assignment, fleet dashboard

**VR-003: Maintenance Exclusion**
- **Rule**: Vehicles under maintenance cannot be assigned to trips
- **Validation**: System SHALL exclude vehicles with status "Under Maintenance" from assignment lists
- **Impact**: TO assignment, fleet availability

**VR-004: Single Active Trip**
- **Rule**: One vehicle can only be assigned to one active trip at a time
- **Validation**: System SHALL prevent assigning vehicle to new trip if already on active trip
- **Impact**: TO assignment, trip execution

**VR-005: Vehicle-Driver Binding**
- **Rule**: When vehicle is assigned to TO, driver must also be assigned
- **Validation**: System SHALL require driver assignment before trip dispatch
- **Impact**: TO assignment workflow

---

### 1.2 Driver Rules

**DR-001: Unique Driver License**
- **Rule**: Each driver must have a unique license number within a tenant
- **Validation**: System SHALL prevent duplicate driver license numbers
- **Impact**: Driver master data creation

**DR-002: Driver State Exclusivity**
- **Rule**: A driver can only have one state at a time
- **Valid States**: Assigned, Available, On Leave
- **Impact**: Driver assignment, availability tracking

**DR-003: Leave Exclusion**
- **Rule**: Drivers on leave cannot be assigned to trips
- **Validation**: System SHALL exclude drivers with state "On Leave" from assignment lists
- **Impact**: TO assignment

**DR-004: Single Active Assignment**
- **Rule**: One driver cannot be assigned to multiple active trips
- **Validation**: System SHALL prevent assigning driver to new trip if already on active trip
- **Impact**: TO assignment

**DR-005: Maximum Working Hours**
- **Rule**: Driver working hours should not exceed configured maximum (default: 12 hours)
- **Validation**: System SHALL calculate effective driving hours using GPS data
- **Impact**: Driver utilization, compliance reporting
- **Note**: Warning only, not blocking

**DR-006: Driving Hours Calculation**
- **Rule**: Driving hours exclude idle or parked durations
- **Calculation**: Effective driving hours = GPS movement time only
- **Impact**: Driver performance, compliance

---

### 1.3 Helper Rules

**HR-001: Unique Helper NID**
- **Rule**: Each helper must have a unique National ID within a tenant
- **Validation**: System SHALL prevent duplicate helper NIDs
- **Impact**: Helper master data creation

**HR-002: Multiple Helper Assignment**
- **Rule**: Multiple helpers can be assigned to one driver/trip
- **Validation**: System SHALL support many-to-one mapping
- **Impact**: TO assignment

**HR-003: No Conflicting Assignments**
- **Rule**: A helper may be assigned to multiple trips over time but NOT to conflicting active trips
- **Validation**: System SHALL prevent overlapping active trip assignments
- **Impact**: Helper assignment

---

### 1.4 Vendor Rules

**VDR-001: Vendor Approval Required**
- **Rule**: Vendors cannot access system before admin approval
- **Validation**: System SHALL restrict vendor login until status = "Approved"
- **Impact**: Vendor onboarding

**VDR-002: Document Upload Mandatory**
- **Rule**: Vendor registration requires trade license, BIN, TIN uploads
- **Validation**: System SHALL prevent registration submission without all documents
- **Impact**: Vendor registration

**VDR-003: Vendor Type Determines Workflow**
- **Rule**: Vendor type (Contractual vs Non-Contractual) determines bidding requirement
- **Logic**:
  - Contractual: Direct TO assignment, no bidding
  - Non-Contractual: Must participate in bidding to win TOs
- **Impact**: TO assignment to vendors

---

### 1.5 POI Rules

**PR-001: Unique POI Name**
- **Rule**: Each POI must have a unique name within a tenant
- **Validation**: System SHALL prevent duplicate POI names
- **Impact**: POI master data creation

**PR-002: GPS Coordinates Required**
- **Rule**: POI must have valid GPS coordinates for geofencing
- **Validation**: System SHALL require latitude and longitude
- **Impact**: POI creation, geofencing, routing

**PR-003: Capacity Tracking**
- **Rule**: POI capacity (MT) must be tracked for inventory management
- **Validation**: System SHALL maintain current stock and free capacity
- **Impact**: Stock validation, capacity warnings

---

### 1.6 Product Rules

**PDR-001: Unique Product SKU**
- **Rule**: Each product must have a unique SKU/Item Code within a tenant
- **Validation**: System SHALL prevent duplicate SKUs
- **Impact**: Product master data creation

**PDR-002: Product Category Required**
- **Rule**: Product must be classified as Finished Goods (FG) or Raw Material (RM)
- **Validation**: System SHALL enforce category selection
- **Impact**: Product creation, requisition workflows

**PDR-003: Transport Attributes**
- **Rule**: Products must have transport-related attributes (UOM, weight per unit, packing type)
- **Validation**: System SHALL require these attributes for transport planning
- **Impact**: Product creation, TR/TO quantity calculations

---



## Related Documents

- [Business Rules Overview](./business-rules.md) - Complete rules index

---

**Last Updated**: 2026-02-13  
**Status**: Approved - Aligned with PRD v1.0  
**Maintained By**: Business Context Team
