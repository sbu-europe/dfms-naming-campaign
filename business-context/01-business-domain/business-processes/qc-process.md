---
title: DFMS Quality Control (QC) Process
category: business
phase: discovery
status: approved
created: 2026-02-13
updated: 2026-02-13
source_documents:
  - ../../../source-documents/01-prd/PRD_DFMS_v1.0.md
tags: [business-processes, qc, process]
---

# DFMS Quality Control (QC) Process

## Quality Control (QC) Process

### Overview
Ensures product quality through physical inspection, sampling, lab testing, and pass/fail determination.

### Process Flow

```
QC Triggered → View QC Context → Sample Creation → QR Code Generation → 
Physical Inspection → Lab Test Request → Lab Testing → 
Lab Results → QC Decision (Pass/Fail/Recheck) → 
[If Pass: Assign to Unloading] [If Fail: Recheck or Reject]
```

### Key Activities

#### 6.1 QC Context Display
- **Actor**: QC Supervisor
- **Input**: Vehicle assigned for unloading or QC triggered
- **Output**: QC context displayed
- **Activities**:
  1. View QC Context:
     - POI From / POI To
     - Supplier or Dealer name
     - Challan number and date
     - Item name and expected quantity
  2. Verify context against physical shipment
  3. Proceed to sampling

#### 6.2 Sample Creation
- **Actor**: QC Supervisor
- **Input**: QC context
- **Output**: Sample(s) created
- **Activities**:
  1. Create sample against Unload Item Code
  2. Record sampling start date and time
  3. Collect samples from multiple sides (Top/Middle/Bottom)
  4. Record sampling observations
  5. Record sampling end date and time
  6. System generates unique QR code per sample
  7. Print QR code label
  8. Attach label to sample

#### 6.3 Physical Inspection
- **Actor**: QC Supervisor
- **Input**: Sample(s)
- **Output**: Physical inspection results
- **Activities**:
  1. Conduct physical analysis:
     - Visual inspection (color, texture, defects)
     - Moisture content (using QC machine)
     - Temperature
     - Packaging condition
  2. Record physical analysis results (text input)
  3. Capture photos/videos of defects (if any)
  4. Record observations and remarks

#### 6.4 Lab Test Request
- **Actor**: QC Supervisor
- **Input**: Sample requiring lab tests
- **Output**: Lab test request created
- **Activities**:
  1. Create lab test request for sample
  2. Specify test types required:
     - Nutritional analysis
     - Chemical composition
     - Contamination testing
     - Moisture content (lab verification)
  3. Record sample send time
  4. System tracks lab test request status

#### 6.5 Lab Testing
- **Actor**: QA Lab Technician
- **Input**: Lab test request, sample
- **Output**: Lab test results
- **Activities**:
  1. Scan QR code on sample (auto-records lab test start time)
  2. Conduct lab tests per request
  3. Enter estimated completion time per test
  4. Perform tests
  5. Record test results
  6. Upload test report (PDF/PNG)
  7. Record test completion time
  8. Update lab test status: To-Do → WIP → Completed

#### 6.6 QC Decision
- **Actor**: QC Supervisor
- **Input**: Physical inspection results, lab test results
- **Output**: QC result (Pass/Fail/Auto-Pass)
- **Activities**:
  1. Review physical inspection results
  2. Review lab test results
  3. Make QC decision:
     - **QC Pass**: Product meets quality standards
     - **QC Fail**: Product does not meet standards
     - **QC Auto-Pass**: Product auto-approved (for trusted suppliers, configurable)
  4. Record QC result
  5. Add remarks (mandatory for Fail)
  6. If Pass: Assign vehicle to unloading bay/unit/point
  7. If Fail: Initiate recheck or reject shipment

#### 6.7 Recheck/Resampling (If QC Fail)
- **Actor**: QC Supervisor
- **Input**: QC Fail result
- **Output**: Recheck initiated
- **Activities**:
  1. Review failure reasons
  2. Decide: Recheck (same sample) or Resample (new sample)
  3. Add mandatory remarks explaining recheck reason
  4. Reinitiate sampling or inspection
  5. Repeat QC process
  6. Make final QC decision

### Business Rules
- QC Context must be displayed before sample creation
- QC actions blocked if mandatory context data missing
- Sampling must occur after QC Sampling event creation
- Sampling timestamps must be sequential
- One QR code per sample
- QR scan triggers lab test start time automatically
- QC Pass required for trip closure
- QC Fail blocks trip closure
- Recheck/resampling requires mandatory remarks
- Inventory updated only after QC Pass (for inbound)

### Success Criteria
- Inspection time < 30 minutes per vehicle
- QC compliance rate > 98%
- Photo documentation 100%
- Sample traceability 100%
- Quality issue detection time < 15 minutes
- Lab test turnaround time < 4 hours (average)



## Related Documents

- [Business Processes Overview](./business-processes-overview.md) - Process architecture and integration

---

**Last Updated**: 2026-02-13  
**Status**: Approved - Aligned with PRD v1.0  
**Maintained By**: Business Context Team
