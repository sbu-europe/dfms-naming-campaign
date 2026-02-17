---
title: DFMS Vendor Management Process
category: business
phase: discovery
status: approved
created: 2026-02-13
updated: 2026-02-13
source_documents:
  - ../../../source-documents/requirements/PRD_DFMS_v1.0.md
tags: [business-processes, vendor, management, process]
---

# DFMS Vendor Management Process

## Vendor Management Process

### Overview
Manages vendor lifecycle from onboarding to performance tracking, including bidding for non-contractual vendors.

### Process Flow

```
Vendor Registration → Admin Verification → Approval → 
Bidding (Non-Contractual) / Direct Assignment (Contractual) → 
Trip Execution → Invoice Submission → Payment
```

### Key Activities

#### 3.1 Vendor Onboarding
- **Actor**: Vendor
- **Input**: Company details, documents
- **Output**: Vendor profile (Pending Verification)
- **Activities**:
  1. Self-register via vendor portal
  2. Upload documents (trade license, BIN, TIN)
  3. Provide company details, contact info, testimonial
  4. Select vendor type (Contractual / Non-Contractual)
  5. Submit for verification

#### 3.2 Vendor Verification
- **Actor**: Tenant Admin
- **Input**: Vendor profile (Pending Verification)
- **Output**: Approved or Rejected vendor
- **Activities**:
  1. Review vendor profile
  2. Verify documents
  3. Approve or reject with remarks
  4. If rejected: Vendor can resubmit
  5. If approved: Vendor becomes active

#### 3.3 Bidding (Non-Contractual Vendors)
- **Actor**: TDO (Vendor Fleet), Vendors
- **Input**: TO assigned to Vendor Fleet
- **Output**: Winning vendor(s)
- **Activities**:
  - **TDO**:
    1. Publish bidding requirements (route, tonnage, vehicle type, bid window, required vehicle count)
    2. Optionally provide expected rate
    3. Monitor bid submissions
    4. Compare bids (rate, vehicle availability, vendor history)
    5. Select winning vendor(s)
    6. Close bidding
  - **Vendor**:
    1. View active bidding opportunities
    2. Submit bid (offered rate, available vehicle count)
    3. View bid probability indicator (Phase 3)
    4. Wait for bid result
    5. If won: Submit vehicle and driver details

#### 3.4 Direct Assignment (Contractual Vendors)
- **Actor**: TDO (Vendor Fleet)
- **Input**: TO assigned to Vendor Fleet
- **Output**: TO assigned to contractual vendor
- **Activities**:
  1. Select contractual vendor
  2. Assign TO directly (no bidding)
  3. Contractual rate applied automatically (hidden from vendor)
  4. Vendor notified of assignment
  5. Vendor submits vehicle and driver details

#### 3.5 Trip Execution (Vendor)
- **Actor**: Vendor, Vendor Driver
- **Input**: Assigned TO
- **Output**: Completed trip
- **Activities**:
  1. Vendor assigns vehicle and driver
  2. Vendor provides: Vehicle number, Capacity, Driver name/contact, Driver NID/License, Helper details
  3. Driver executes trip (same as Own Fleet process)
  4. Driver/Vendor updates trip status via mobile app
  5. Driver captures POD (signature + photo)
  6. Trip completes

#### 3.6 Invoice Submission (Vendor)
- **Actor**: Vendor
- **Input**: Completed trip(s)
- **Output**: Invoice submitted
- **Activities**:
  1. View completed trips
  2. Create invoice (can consolidate multiple trips)
  3. Upload invoice document
  4. Upload POD for each trip
  5. Upload GRN (Goods Receipt Note) for each trip
  6. Submit invoice for verification

#### 3.7 Invoice Verification & Payment (Accounts)
- **Actor**: Accounts Officer
- **Input**: Submitted invoice
- **Output**: Payment processed
- **Activities**:
  1. Review invoice
  2. Verify POD and GRN attached
  3. Match invoice amount with trip cost
  4. Approve or reject invoice
  5. Process payment
  6. Update payment status

### Business Rules
- Vendors cannot access system before admin approval
- Contractual vendors do not participate in bidding
- Non-contractual vendors must bid to win TOs
- Bids cannot be edited after submission
- Bidding window is configurable
- Vendor selection is final once approved
- Invoice cannot be submitted without POD and GRN
- Only completed trips are billable

### Success Criteria
- Vendor verification time < 48 hours
- Bid submission time < 2 hours
- Vendor disputes < 5%
- Invoice processing time < 48 hours
- Vendor satisfaction > 4/5



## Related Documents

- [Business Processes Overview](./business-processes-overview.md) - Process architecture and integration

---

**Last Updated**: 2026-02-13  
**Status**: Approved - Aligned with PRD v1.0  
**Maintained By**: Business Context Team
