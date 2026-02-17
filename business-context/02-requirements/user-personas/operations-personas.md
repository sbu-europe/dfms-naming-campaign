---
title: DFMS Operations Personas
category: business
phase: discovery
status: approved
created: 2026-02-13
updated: 2026-02-13
source_documents:
  # PRD Source
  - ../../../source-documents/requirements/PRD_DFMS_v1.0.md
  # Discovery Phase Sources
  - ../../../source-documents/meeting-minutes/2025-09/Transport_Operations_2025-09-29.docx
  - ../../../source-documents/meeting-minutes/2025-10/Distribution_Sales_2025-10-06.docx
  - ../../../source-documents/meeting-minutes/2025-10/Procurement_Operations_2025-10-06.docx
  - ../../../source-documents/meeting-minutes/2025-10/QA_QC_Operations_2025-10-06.docx
  - ../../../source-documents/meeting-minutes/2025-10/Accounts_Finance_2025-10-08.docx
  # ... (additional discovery sources in original files)
content_source:
  prd_based: "PRD Section 4: User Personas & Stakeholders (role names only)"
  discovery_based: "Detailed persona profiles (Age, Education, Experience, Pain Points, etc.) sourced from discovery phase materials"

tags: [user-personas, operations, personas]
---

# DFMS Operations Personas

## Operations Personas

### 7. Gate Man

**Profile**:
- **Age**: 25-45
- **Education**: High School/Diploma
- **Experience**: 1-5 years in gate operations
- **Tech Proficiency**: Low to Medium
- **Work Location**: Gate (Field)
- **Work Hours**: Shift-based (24/7 coverage)

**Role & Responsibilities**:
- Record vehicle gate-in details
- Verify documents (TO, PO, DO, Challan)
- Create on-demand TOs for dealers/suppliers
- Capture driver and vehicle information
- Record gate-out after clearance
- Log discrepancies and remarks
- Coordinate with Scaling and Command Center

**Primary Goals**:
- Ensure all vehicles are properly logged
- Verify document authenticity
- Minimize gate congestion
- Maintain accurate entry/exit records
- Ensure security compliance

**Pain Points (Current State)**:
- Manual paper-based logging
- Difficult to verify document authenticity
- No system to create on-demand TOs
- Handwritten records prone to errors
- Delayed communication with other departments

**System Usage Patterns**:
- Primary interface: Web (desktop at gate)
- Usage frequency: Continuous (per vehicle arrival/departure)
- Key features used:
  - Gate-in entry form
  - Document verification
  - On-demand TO creation
  - Gate-out recording
  - Discrepancy logging

**Success Metrics**:
- Gate-in time < 5 minutes per vehicle
- Data accuracy > 98%
- On-demand TO creation < 10 minutes
- Zero unauthorized entries

**Quotes**:
> "I need a simple form that I can fill quickly without making mistakes."

> "When a dealer arrives without a TO, I should be able to create one immediately."

---

### 8. Scaling Operator (Weighbridge Operator)

**Profile**:
- **Age**: 25-40
- **Education**: High School/Diploma
- **Experience**: 2-5 years in weighbridge operations
- **Tech Proficiency**: Low to Medium
- **Work Location**: Weighbridge (Field)
- **Work Hours**: Shift-based (24/7 coverage)

**Role & Responsibilities**:
- Record scale-in (gross) weight
- Generate queue tokens (P.C. Code)
- Record scale-out (tare) weight
- Calculate net weight automatically
- Generate gate pass and delivery note
- Log weight discrepancies
- Notify Command Center after scale-in

**Primary Goals**:
- Ensure accurate weight measurement
- Minimize vehicle waiting time
- Maintain proper queue management
- Generate accurate delivery notes
- Ensure compliance with weight regulations

**Pain Points (Current State)**:
- Manual weight recording prone to errors
- Manual queue token generation
- Difficult to track vehicle flow
- Manual net weight calculation
- Paper-based delivery notes

**System Usage Patterns**:
- Primary interface: Web (desktop at weighbridge)
- Usage frequency: Continuous (per vehicle)
- Key features used:
  - Scale-in weight entry
  - Queue token generation and printing
  - Scale-out weight entry
  - Auto net weight calculation
  - Gate pass printing
  - Discrepancy logging

**Success Metrics**:
- Weighing time < 3 minutes per vehicle
- Weight accuracy > 99.5%
- Zero calculation errors
- Token generation time < 1 minute

**Quotes**:
> "I need the system to calculate net weight automatically so I don't make mistakes."

> "Printing queue tokens should be instant so vehicles don't wait."

---

### 9. Command Center Officer (CCO)

**Profile**:
- **Age**: 26-40
- **Education**: Diploma/Bachelor's in Operations Management
- **Experience**: 2-5 years in operations coordination
- **Tech Proficiency**: Medium to High
- **Work Location**: Command Center (Office)
- **Work Hours**: Shift-based (24/7 coverage)

**Role & Responsibilities**:
- Monitor queue of vehicles awaiting assignment
- Assign vehicles to loading/unloading points
- Prioritize based on urgency and product type
- Issue waiting serials per loading point
- Monitor loading/unloading progress
- Coordinate with Gate, Scaling, and Loading teams
- Handle operational exceptions

**Primary Goals**:
- Optimize vehicle flow and minimize congestion
- Ensure efficient loading/unloading
- Minimize vehicle dwell time
- Prioritize urgent shipments
- Maintain operational visibility

**Pain Points (Current State)**:
- No centralized queue visibility
- Manual assignment via phone/radio
- Difficult to track loading point capacity
- No prioritization mechanism
- Delayed exception handling

**System Usage Patterns**:
- Primary interface: Web dashboard (large screen)
- Usage frequency: Continuous monitoring
- Key features used:
  - Centralized queue dashboard
  - Loading/unloading point assignment
  - Waiting serial generation
  - Real-time status monitoring
  - Alert management

**Success Metrics**:
- Assignment time < 2 minutes per vehicle
- Average dwell time < 60 minutes
- Loading point utilization > 85%
- Queue congestion incidents < 5%

**Quotes**:
> "I need to see all waiting vehicles and available loading points on one screen."

> "When a loading point is free, I should be notified immediately so I can assign the next vehicle."

---

### 10. Loading Personnel

**Profile**:
- **Age**: 22-45
- **Education**: High School
- **Experience**: 1-5 years in warehouse operations
- **Tech Proficiency**: Low
- **Work Location**: Loading bay (Field)
- **Work Hours**: Shift-based (24/7 coverage)

**Role & Responsibilities**:
- Receive vehicle assignment from Command Center
- Record loading start time
- Load products onto vehicle
- Record number of bags/units loaded
- Record loading end time
- Apply seal and record seal number
- Verify loaded weight

**Primary Goals**:
- Complete loading quickly and accurately
- Ensure product safety during loading
- Maintain accurate load records
- Minimize vehicle waiting time
- Follow safety procedures

**Pain Points (Current State)**:
- Manual paper-based recording
- No notification when vehicle assigned
- Difficult to track loading duration
- Manual seal number logging
- No visibility into next vehicle in queue

**System Usage Patterns**:
- Primary interface: Web (tablet at loading bay) or Mobile
- Usage frequency: Per vehicle (multiple times per shift)
- Key features used:
  - Loading assignment notification
  - Load start/end time recording
  - Quantity and seal number entry
  - Loading completion confirmation

**Success Metrics**:
- Loading time < 45 minutes per vehicle
- Load accuracy > 99%
- Data entry time < 3 minutes
- Zero seal discrepancies

**Quotes**:
> "I need a simple interface where I can quickly enter loading details without typing much."

> "Notify me when a vehicle is assigned so I can prepare in advance."

---

### 11. Unloading Personnel

**Profile**:
- **Age**: 22-45
- **Education**: High School
- **Experience**: 1-5 years in warehouse operations
- **Tech Proficiency**: Low
- **Work Location**: Unloading bay (Field)
- **Work Hours**: Shift-based (24/7 coverage)

**Role & Responsibilities**:
- Receive vehicle assignment from Command Center
- Record unloading start time
- Unload products from vehicle
- Record number of bags/units unloaded
- Record unloading end time
- Verify unloaded weight
- Coordinate with QC for inspection

**Primary Goals**:
- Complete unloading quickly and safely
- Ensure product integrity during unloading
- Maintain accurate unload records
- Coordinate with QC team
- Minimize vehicle turnaround time

**Pain Points (Current State)**:
- Manual paper-based recording
- No notification when vehicle assigned
- Difficult to track unloading duration
- Manual coordination with QC
- No visibility into QC status

**System Usage Patterns**:
- Primary interface: Web (tablet at unloading bay) or Mobile
- Usage frequency: Per vehicle (multiple times per shift)
- Key features used:
  - Unloading assignment notification
  - Unload start/end time recording
  - Quantity entry
  - Unloading completion confirmation
  - QC trigger notification

**Success Metrics**:
- Unloading time < 45 minutes per vehicle
- Unload accuracy > 99%
- Data entry time < 3 minutes
- QC coordination delays < 5 minutes

**Quotes**:
> "I need to know when a vehicle is ready for unloading so I can allocate my team."

> "After unloading, I should be able to notify QC with one click."

---



## Related Documents

- [User Personas Overview](./user-personas.md) - Complete personas index
- [Stakeholders](../../../00-overview/stakeholders.md) - Stakeholder mapping

---

**Last Updated**: 2026-02-13  
**Status**: Approved - Aligned with PRD v1.0  
**Maintained By**: Business Context Team

---

## 📝 Content Source

**PRD-Based Content:**
- PRD Section 4: User Personas & Stakeholders (role names only)

**Discovery-Based Content:**
- Detailed persona profiles (Age, Education, Experience, Pain Points, etc.) sourced from discovery phase materials

> **Note**: This document combines PRD content with detailed information gathered during the discovery phase (meeting minutes, questionnaires, business proposals). PRD provides high-level role names and objectives, while discovery phase materials provide detailed profiles, pain points, and operational context.

