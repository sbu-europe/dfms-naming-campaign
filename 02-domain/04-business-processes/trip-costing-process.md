---
title: DFMS Trip Costing & Finance Process
category: business
phase: discovery
status: approved
created: 2026-02-13
updated: 2026-02-13
source_documents:
  - ../../../source-documents/01-prd/DFMS_Product_Requirements_Document_v3.md
tags: [business-processes, trip, costing, process]
---

# DFMS Trip Costing & Finance Process

## Trip Costing & Finance Process

### Overview
Calculates trip costs, processes vendor invoices, and integrates with ERP for financial closure.

### Process Flow

```
Trip Closed → Cost Calculation → Cost Sheet Generated → 
[If Vendor: Invoice Submission → Invoice Verification] → 
Payment Processing → ERP Sync
```

### Key Activities

#### 7.1 Trip Cost Calculation
- **Actor**: System (Auto), Accounts Officer (Manual entry)
- **Input**: Closed trip
- **Output**: Trip cost sheet
- **Activities**:
  1. System generates Trip Cost record when trip created
  2. Calculate distance-based cost (GPS distance × rate per km)
  3. Manual entry of costs:
     - **For Own Fleet**:
       - Fuel cost (from fuel entries or manual)
       - Maintenance allocation
       - Toll / Ferry / Parking charges
       - Other operational charges
     - **For Vendor Fleet**:
       - Vendor trip charge (from contractual rate or bid rate)
       - Additional charges (if any)
  4. System calculates:
     - Total Trip Cost
     - Cost per KM
  5. Cost sheet available for review

#### 7.2 Vendor Invoice Submission
- **Actor**: Vendor
- **Input**: Completed trip(s)
- **Output**: Invoice submitted
- **Activities**:
  1. View completed trips
  2. Select trips for invoicing (can consolidate multiple trips)
  3. Create invoice with:
     - Invoice number
     - Invoice date
     - Trip IDs included
     - Total amount (sum of trip charges)
  4. Upload invoice document (PDF)
  5. Upload POD for each trip
  6. Upload GRN for each trip
  7. Add remarks (if any)
  8. Submit invoice

#### 7.3 Invoice Verification
- **Actor**: Accounts Officer
- **Input**: Submitted invoice
- **Output**: Verified invoice
- **Activities**:
  1. View submitted invoice
  2. Verify:
     - Invoice details match trips
     - POD attached for all trips
     - GRN attached for all trips
     - Invoice amount matches trip costs
  3. Check for discrepancies
  4. Approve or reject invoice
  5. If rejected: Add remarks, vendor can resubmit
  6. If approved: Proceed to payment

#### 7.4 Payment Processing
- **Actor**: Accounts Officer
- **Input**: Verified invoice
- **Output**: Payment processed
- **Activities**:
  1. Generate payment voucher
  2. Process payment (bank transfer, cheque, etc.)
  3. Update payment status
  4. Notify vendor of payment
  5. Record payment date and reference

#### 7.5 ERP Integration
- **Actor**: System (Auto)
- **Input**: Trip cost sheet, invoice, payment
- **Output**: ERP synchronized
- **Activities**:
  1. Sync trip cost data to ERP
  2. Sync invoice data to ERP
  3. Sync payment data to ERP
  4. Update financial records
  5. Generate financial reports

### Business Rules
- Trip cost record generated when trip created
- Manual cost entry allowed only for authorized roles
- Cost history audit-logged
- Trip cost summary available after trip closure
- Vendor cost linked to: TO ID, Trip ID, Vendor ID
- Vendor cost locked after Bid approval (for non-contractual)
- Invoice cannot be submitted without POD and GRN
- Only completed trips are billable
- System supports one invoice per TO or consolidated invoice for multiple TOs

### Success Criteria
- Cost calculation accuracy > 98%
- Invoice processing time < 48 hours
- Invoice accuracy > 98%
- Cost variance < 5% from estimates
- Billing disputes < 3%


## Related Documents

- [Business Processes Overview](./business-processes-overview.md) - Process architecture and integration

---

**Last Updated**: 2026-02-13  
**Status**: Approved - Aligned with PRD v1.0  
**Maintained By**: Business Context Team
