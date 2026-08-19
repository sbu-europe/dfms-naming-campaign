---
title: DFMS Command Center & Loading/Unloading Process
category: business
phase: discovery
status: approved
created: 2026-02-13
updated: 2026-02-13
source_documents:
  - ../../../source-documents/01-prd/DFMS_Product_Requirements_Document_v3.md
tags: [business-processes, command, center, process]
---

# DFMS Command Center & Loading/Unloading Process

## Command Center & Loading/Unloading Process

### Overview
Coordinates vehicle flow from weighing to loading/unloading, optimizing bay utilization and minimizing dwell time.

### Process Flow

```
Scale-in Complete → Queue Token Generated → Command Center Monitors Queue → 
Assign to Loading/Unloading Point → Issue Waiting Serial → 
Loading/Unloading Execution → Scale-out → Gate Pass Generated
```

### Key Activities

#### 5.1 Scaling (Weighing)
- **Actor**: Scaling Operator
- **Input**: Vehicle after gate-in
- **Output**: Weight recorded, queue token generated
- **Activities**:
  - **Scale-in**:
    1. Record vehicle number
    2. Record material name and code
    3. Record challan number
    4. Record scale-in date and time
    5. Record gross weight
    6. Generate unique queue token (P.C. Code)
    7. Print queue token
    8. Notify Command Center
  - **Scale-out** (after loading/unloading):
    1. Record scale-out date and time
    2. Record tare weight
    3. System auto-calculates net weight
    4. Generate gate pass with delivery note
    5. Print gate pass
    6. Provide to driver for gate-out

#### 5.2 Queue Monitoring (Command Center)
- **Actor**: Command Center Officer (CCO)
- **Input**: Vehicles with completed scale-in
- **Output**: Prioritized queue
- **Activities**:
  1. View centralized queue of waiting vehicles
  2. Each queue entry shows:
     - Vehicle Number
     - PC Code (Waiting Code)
     - Item
     - Scale-in Date & Time
     - Product Type
     - Weight (Gross / Net if available)
     - TO/Challan reference
     - Urgency Level
  3. Monitor loading/unloading point availability
  4. Prioritize based on: Urgency, Product Type, Waiting Time

#### 5.3 Loading/Unloading Assignment
- **Actor**: Command Center Officer (CCO)
- **Input**: Waiting vehicle, available loading/unloading point
- **Output**: Vehicle assigned to point
- **Activities**:
  1. Select vehicle from queue
  2. Select available loading or unloading point
  3. Consider: Product Type, Vehicle Type, Urgency Level
  4. Assign vehicle to point
  5. Issue waiting serial for the point
  6. System updates vehicle status
  7. System sends notification to loading/unloading team

#### 5.4 Loading Execution
- **Actor**: Loading Personnel
- **Input**: Vehicle assigned to loading point
- **Output**: Vehicle loaded
- **Activities**:
  1. Receive assignment notification
  2. Record loading start date and time
  3. Load products onto vehicle
  4. Record number of bags/units loaded
  5. Record weight loaded
  6. Apply seal to vehicle
  7. Record seal number
  8. Record loading end date and time
  9. Confirm loading completion
  10. Vehicle proceeds to scale-out

#### 5.5 Unloading Execution
- **Actor**: Unloading Personnel
- **Input**: Vehicle assigned to unloading point
- **Output**: Vehicle unloaded
- **Activities**:
  1. Receive assignment notification
  2. Record unloading start date and time
  3. Unload products from vehicle
  4. Record number of bags/units unloaded
  5. Record weight unloaded
  6. Record unloading end date and time
  7. Confirm unloading completion
  8. Trigger QC inspection
  9. Vehicle proceeds to scale-out (after QC Pass)

### Business Rules
- Only vehicles with completed Scale-in appear in Command Center queue
- Vehicles already assigned to loading point do not appear in waiting queue
- One active serial per vehicle per loading point
- Serials cannot be edited
- Loading/unloading timestamps must be chronological
- QC must be triggered before or during unloading
- Vehicle cannot proceed to scale-out until QC Pass (for unloading)

### Success Criteria
- Weighing time < 3 minutes per vehicle
- Assignment time < 2 minutes per vehicle
- Loading time < 45 minutes per vehicle
- Unloading time < 45 minutes per vehicle
- Average dwell time < 60 minutes
- Loading point utilization > 85%



## Related Documents

- [Business Processes Overview](./business-processes-overview.md) - Process architecture and integration

---

**Last Updated**: 2026-02-13  
**Status**: Approved - Aligned with PRD v1.0  
**Maintained By**: Business Context Team
