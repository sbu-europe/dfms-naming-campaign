---
title: DFMS Transport Planning & Execution Process
category: business
phase: discovery
status: approved
created: 2026-02-13
updated: 2026-02-13
source_documents:
  - ../../../source-documents/01-prd/DFMS_Product_Requirements_Document_v3.md
tags: [business-processes, transport, planning, process]
---

# DFMS Transport Planning & Execution Process

## Transport Planning & Execution Process

### Overview
Core process that converts Transport Requisitions into Transport Orders and manages trip lifecycle from planning to delivery.

### Process Flow

```
Approved TR → Transport Planner → Create TO(s) → Assign Fleet Type → 
TDO (Own/Vendor) → Assign Resources → Dispatch → Execute Trip → 
Deliver → Close Trip
```

### Key Activities

#### 2.1 TR Assessment (Transport Planner)
- **Actor**: Transport Planner (TP)
- **Input**: Approved TR from Distribution/Procurement
- **Output**: Fleet decision (Own vs Vendor)
- **Activities**:
  1. Review TR details (route, tonnage, urgency, delivery date)
  2. Check fleet availability (Own Fleet vs Vendor Fleet)
  3. Input required vehicles, vehicle type
  4. For Port: Input C&F clearance note status
  5. Decide fleet type per TR

#### 2.2 TO Creation (Transport Planner)
- **Actor**: Transport Planner (TP)
- **Input**: Assessed TR
- **Output**: Transport Order(s) (TO)
- **Activities**:
  1. Create one or multiple TOs from single TR
  2. Allocate quantity per TO (≤ remaining TR quantity)
  3. Assign fleet type per TO (Own or Vendor)
  4. Set planned delivery date
  5. Forward TO to respective TDO (Own Fleet or Vendor Fleet)

#### 2.3 Resource Assignment – Own Fleet (TDO - Own)
- **Actor**: Transport Distribution Officer (Own Fleet)
- **Input**: TO assigned to Own Fleet
- **Output**: TO with assigned vehicle, driver, helper
- **Activities**:
  1. View available vehicles (not under maintenance, not on active trip)
  2. View available drivers (not on leave, not on active trip)
  3. Assign vehicle to TO
  4. Assign driver to vehicle
  5. Assign helper(s) to driver
  6. Define Estimated Time of Arrival (ETA)
  7. Dispatch trip

#### 2.4 Resource Assignment – Vendor Fleet (TDO - Vendor)
- **Actor**: Transport Distribution Officer (Vendor Fleet)
- **Input**: TO assigned to Vendor Fleet
- **Output**: TO assigned to vendor
- **Activities**:
  - **For Contractual Vendors**:
    1. Select contractual vendor
    2. Assign TO directly (no bidding)
    3. Contractual rate applied automatically
  - **For Non-Contractual Vendors**:
    1. Publish bidding requirements (route, tonnage, vehicle type, bid window)
    2. Vendors submit bids (price, vehicle count)
    3. TDO reviews bids
    4. Select winning vendor(s)
    5. Assign TO to winner
    6. Vendor submits vehicle and driver details

#### 2.5 Trip Execution
- **Actor**: Driver, Operations Team, QC Team
- **Input**: Dispatched TO
- **Output**: Completed Trip
- **Activities** (see detailed process flows below):
  1. **Gate-in** at source POI
  2. **Scale-in** (gross weight)
  3. **Command Center** assigns to loading point
  4. **Loading** (record start/end time, bags loaded, seal number)
  5. **Scale-out** (tare weight, net weight calculated)
  6. **Gate-out** from source POI
  7. **In Transit** to destination POI
  8. **Gate-in** at destination POI
  9. **Scale-in** at destination
  10. **Command Center** assigns to unloading point
  11. **QC Sampling** (before/during unloading)
  12. **Unloading** (record start/end time, bags unloaded)
  13. **QC Inspection** (physical + lab tests)
  14. **QC Result** (Pass/Fail/Recheck)
  15. **Scale-out** at destination
  16. **POD Collection** (signature, photo)
  17. **Gate-out** from destination POI

#### 2.6 Trip Closure
- **Actor**: Transport Planner, System
- **Input**: Completed trip with QC Pass and POD
- **Output**: Closed trip
- **Activities**:
  1. System validates: QC Pass received, POD uploaded, Gate-out recorded
  2. System auto-closes trip
  3. Trip status: Closed
  4. Inventory updated (source reduced, destination increased)
  5. Trip available for costing

### TO Lifecycle States

| State | Sub-States | Trigger | Next State |
|-------|------------|---------|------------|
| Draft | - | TP creates TO | Planned |
| Planned | Fleet Decided, Awaiting Assignment | TP assigns fleet type | Assigned |
| Assigned | Vehicle Assigned, Driver Assigned, Helper Assigned, Assignment Confirmed | TDO assigns resources | Dispatched |
| Dispatched | Dispatch Approved, Vehicle Departed | TDO dispatches | In Transit - Source |
| In Transit - Source | En Route to Source, Delayed, Halted | Vehicle moving to source | At Source |
| At Source | Gate-in Recorded, Scale-in, Waiting/Parked | Vehicle arrives at source | Loaded |
| Loaded | Loading Started, Loading Completed, Scale-out, Pick-up Confirmed/Gate-out | Loading complete | In Transit - Destination |
| In Transit - Destination | En Route to Destination, Delayed, Halted | Vehicle moving to destination | At Destination |
| At Destination | Gate-in, Scale-in, Waiting, Assigned to Unloading Point, Sampling Started, QC Started, Lab Analysis In Progress | Vehicle arrives at destination | Delivered/Unloaded |
| Delivered/Unloaded | Unloading Started, Unloading Completed, Scale-out, POD Submitted, Receiver Confirmation | Unloading complete | Completed |
| Completed | QC Passed, QC Failed | QC result | Closed (if Pass) |
| Closed | Closed (QC Pass + POD + Gate-out) | All validations pass | - |

### Business Rules
- Multiple TOs can be created from single TR (partial allocation)
- Total TO quantity cannot exceed TR quantity
- One vehicle can only be assigned to one active trip at a time
- Drivers on leave cannot be assigned
- Vehicles under maintenance cannot be assigned
- One driver cannot be assigned to multiple active TOs
- Trip cannot close without QC Pass and POD
- QC Fail blocks trip closure

### Success Criteria
- TO creation time < 15 minutes
- Assignment time < 10 minutes per TO
- Fleet utilization > 75%
- On-time delivery > 95%
- Trip completion rate > 98%



## Related Documents

- [Business Processes Overview](./business-processes-overview.md) - Process architecture and integration

---

**Last Updated**: 2026-02-13  
**Status**: Approved - Aligned with PRD v1.0  
**Maintained By**: Business Context Team
